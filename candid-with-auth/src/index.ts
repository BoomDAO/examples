import { fetchActor, render, getCycles, getNames } from "./candid";
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent, ActorSubclass, CanisterStatus } from '@dfinity/agent';
import { AuthClient } from "@dfinity/auth-client";
import { AccountIdentifier } from "@dfinity/nns";

async function main() {
  const params = new URLSearchParams(window.location.search);
  const cid = params.get("id");
  const user = params.get("user");
  if (!cid) {
    document.body.innerHTML = `<div id="main-content">
    <label>Provide a canister ID: </label>
    <input id="id" type="text"><br>
    <label>Choose a did file (optional) </label>
    <input id="did" type="file" accept=".did"><br>
    <button id="btn" class="btn">Go</button>
    </div>
    `;
    const id = (document.getElementById("id") as HTMLInputElement)!;
    const did = (document.getElementById("did")! as HTMLInputElement)!;
    const btn = document.getElementById("btn")!;
    btn.addEventListener("click", () => {
      params.set("id", id.value);
      if (did.files!.length > 0) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          const encoded = reader.result as string;
          const candid = encoded.substr(encoded.indexOf(",") + 1);
          // update URL with Candid data and refresh
          window.history.pushState({}, "", window.location.search);
          window.history.pushState({ candid }, "", `?${params}`);
          window.location.reload();
        });
        reader.readAsDataURL(did.files![0]);
      } else {
        window.location.href = `?${params}`;
        console.log({ params });
      }
    });
  } else {
      const loginButton = document.getElementById("login-button")!;
      const app = document.getElementById("app")!;
      const userId = document.getElementById("principal");
      const accId = document.getElementById("account");
      loginButton.addEventListener("click", async () => {
        const APPLICATION_NAME = "BoomDAO";
        const APPLICATION_LOGO_URL = "https://i.postimg.cc/L4f471FF/logo.png";
        const AUTH_PATH =
          "/authenticate/?applicationName=" + APPLICATION_NAME + "&applicationLogo=" + APPLICATION_LOGO_URL + "#authorize";
        const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;

        const authClient = await AuthClient.create({
          idleOptions: {
            idleTimeout: 1000 * 60 * 60 * 24, // set to 24 hrs
            disableDefaultIdleCallback: true // disable the default reload behavior
          }
        });
        await new Promise((resolve, reject) => {
          authClient.login({
            identityProvider: NFID_AUTH_URL,
            windowOpenerFeatures:
              `left=${window.screen.width / 2 - 525 / 2}, ` +
              `top=${window.screen.height / 2 - 705 / 2},` +
              `toolbar=0,location=0,menubar=0,width=525,height=705`,
            // derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.ic0.app",
            maxTimeToLive: BigInt(15 * 24 * 60 * 60 * 1000 * 1000 * 1000), //set to 15 days
            onSuccess: () => {
              resolve(true);
            },
            onError: (err) => {
              console.log("error", err);
              reject();
            },
          });
        });
        const identity = authClient.getIdentity();
        if (identity == undefined) {
          alert("Please Login!");
          console.log("not logged in");
        } else {
          document.title = `Canister ${cid}`;
          loginButton!.style.display = "none";
          const canisterId = Principal.fromText(cid);
          const profiling = await getCycles(canisterId);
          const actor = await fetchActor(canisterId, identity);
          const names = await getNames(canisterId);
          render(canisterId, actor, profiling);
          app!.style.display = "block";
          userId!.innerText = identity!.getPrincipal().toString();
          accId!.innerText = AccountIdentifier.fromPrincipal({ principal : identity!.getPrincipal(), subAccount : undefined,}).toHex();
        }
      });
    }
}

main().catch((err) => {
  const div = document.createElement("div");
  div.innerText = "An error happened in Candid canister:";
  const pre = document.createElement("pre");
  pre.innerHTML = err.stack;
  div.appendChild(pre);
  const progress = document.getElementById("progress");
  progress!.remove();
  document.body.appendChild(div);
  throw err;
});

// Reload when going back after uploading custom Candid data
window.addEventListener("popstate", (event) => {
  if (event.state) {
    window.location.reload();
  }
});
