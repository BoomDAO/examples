import { AuthClient } from "@dfinity/auth-client";
import { MyStorage } from "./MyStorage";
import { NFID } from "@nfid/embed";

let identity = null;
let targetCanisterIds = [];
let storage = new MyStorage();
let nfid = null;

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
  try {
    if (!nfid) {
      nfid = await NFID.init({
        application: {
          name: "BOOM DAO",
          logo: "https://i.postimg.cc/L4f471FF/logo.png"
        },
        storage: storage,
        keyType: 'Ed25519'
      });;
    };
    if (identity == null) {
      identity = await nfid.getDelegation({
        targets: targetCanisterIds,
        derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.ic0.app",
        maxTimeToLive: BigInt(24) * BigInt(3_600_000_000_000) // 24 hrs
      });
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