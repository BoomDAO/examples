import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { MyStorage } from "./MyStorage";

let identity = null;
let storage = new MyStorage();

function toggleElements(isDisabled, isHidden) {
  const click = document.getElementById("click");

  click.disabled = isDisabled;
  click.hidden = isHidden;
}

async function handleButtonClick(e) {
  e.preventDefault();

  toggleElements(true, true);

  await GetIdentity();

  toggleElements(false, false);

  return false;
}

document.getElementById("click").addEventListener("click", handleButtonClick);


// open web socket
const webSocket = new WebSocket('ws://localhost:8080/Data');

webSocket.addEventListener('open', () => {
  console.log('WebSocket connection established.');
});

function sendWebsocketMessage(message) {
  webSocket.send(message);
}

export async function GetIdentity() {
  try {
    // NFID
    const APPLICATION_NAME = "BOOM DAO";
    const APPLICATION_LOGO_URL = "https://i.postimg.cc/L4f471FF/logo.png";
    const AUTH_PATH =
      "/authenticate/?applicationName=" + APPLICATION_NAME + "&applicationLogo=" + APPLICATION_LOGO_URL + "#authorize";
    const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;

    if (identity == null) {
      const authClient = await AuthClient.create({
        storage: storage,
        keyType: 'Ed25519',
      });

      await new Promise((resolve, reject) => {
        authClient.login({
          identityProvider: NFID_AUTH_URL,
          windowOpenerFeatures:
            `left=${window.screen.width / 2 - 525 / 2}, ` +
            `top=${window.screen.height / 2 - 705 / 2},` +
            `toolbar=0,location=0,menubar=0,width=525,height=705`,
          derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.icp0.io",
          onSuccess: resolve,
          onError: reject,
        });
      });

      identity = authClient.getIdentity();
    }

    console.log("referrer=" + document.referrer);

    if (window.parent != null && document.referrer !== '' && document.referrer != null) {
      window.parent.postMessage(JSON.stringify(identity), document.referrer);
      return;
    }

    let websocketMessage = {type : "identityJson", content : JSON.stringify(identity)}
    sendWebsocketMessage(JSON.stringify(websocketMessage));
    window.close();

  } catch (e) {
    console.error(e);

    toggleElements(true, true);
  }
}