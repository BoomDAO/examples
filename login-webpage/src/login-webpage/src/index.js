import { AuthClient } from "@dfinity/auth-client";
import { MyStorage } from "./MyStorage";
import { NFID } from "@nfid/embed";

var identity = null;
let targetCanisterIds = [];
let storage = new MyStorage();
var nfid = null;

// open web socket
const websocket = new WebSocket('ws://localhost:8080/Data');
GetNfidIdentity();

websocket.addEventListener('open', () => {
  console.log('WebSocket connection established.');
});

// websocket.addEventListener('message', (event) => {
//   let websocketMessage = JSON.parse(event.data);

//   switch (websocketMessage.type) {
//     case "targetCanisterIds":
//       break;
//     default:
//       break;
//   }
// });

function sendWebsocketMessage(websocketMessage) {
  websocket.send(websocketMessage);
}

export async function GetNfidIdentity() {
  const getNfid = async () => {
    if (nfid) {
      console.log("nfid instance already exist!");
      return nfid;
    } else {
      const new_nfid = await NFID.init({
        application: {
          name: "BOOM DAO",
          logo: "https://i.postimg.cc/L4f471FF/logo.png"
        },
        storage: storage,
        keyType: 'Ed25519',
        idleOptions: { idleTimeout: 1000 * 60 * 60 * 24 },
      });
      nfid = new_nfid;
      console.log("new instance of nfid created!");
      return new_nfid;
    }
  };

  const checkAuth = async () => {
    try {
      console.log("check auth called");
      const _nfid = await getNfid();
      const isAuthenticated = _nfid.isAuthenticated;
      if (!isAuthenticated) return;
      nfid = _nfid;
      identity = nfid.getIdentity();
    } catch (error) {
      console.log("err while checking auth", error);
      nfid = null;
      identity = null;
    };
  };

  const nfidEmbedLogin = async (nfid) => {
    if (nfid.isAuthenticated) {
      return nfid.getIdentity();
    };
    const delegationIdentity = identity = await nfid.getDelegation({
      targets: targetCanisterIds,
      // derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.ic0.app",
      maxTimeToLive: BigInt(24) * BigInt(3_600_000_000_000) // 24 hrs
    });
    return delegationIdentity;
  };

  await checkAuth();
  setTimeout(async () => {
    try {
      const isAuthenticated = nfid.isAuthenticated;
      if (isAuthenticated) {
        identity = nfid.getIdentity();
      }
      else {
        identity = await nfidEmbedLogin(nfid);
        await checkAuth();
      };

      console.log("referrer=" + document.referrer);
      console.log("This is your principal : " + identity.getPrincipal().toString());
      if (window.parent != null && document.referrer !== '' && document.referrer != null) {
        window.parent.postMessage(JSON.stringify(identity), document.referrer);
        return;
      }
      let websocketMessage = { type: "identityJson", content: JSON.stringify(identity) }
      sendWebsocketMessage(JSON.stringify(websocketMessage));
      window.close();
    } catch (e) {
      console.error(e);
    };
  }, 3000);
}

// UNUSED
// export async function GetInternetIdentity() {
//   let authClient = await AuthClient.create(
//     {
//       storage: storage,
//       keyType: 'Ed25519'
//     }
//   );
//   await new Promise((resolve) => {
//     authClient.login({
//       identityProvider: "https://identity.icp0.io",
//       onSuccess: resolve,
//     });
//   });
//   const identity = authClient.getIdentity();
//   // console.log("This is your identity: " + JSON.stringify(identity))
//   let websocketMessage = { type: "identityJson", content: JSON.stringify(identity) }
//   sendWebsocketMessage(JSON.stringify(websocketMessage));
//   window.close();
// }