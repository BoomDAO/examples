import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { MyStorage } from "./MyStorage";
import { NFID } from "@nfid/embed";

let identity = null;
let targetCanisterIds = [];
let storage = new MyStorage();

function toggleElements(isDisabled, isHidden) {
  const click = document.getElementById("click");
  const click2 = document.getElementById("click2");

  click.disabled = isDisabled;
  click.hidden = isHidden;
  click2.disabled = isDisabled;
  click2.hidden = isHidden;
}

async function handleButtonClick(e) {
  e.preventDefault();

  toggleElements(true, true);

  await GetIdentity();

  toggleElements(false, false);

  return false;
}

document.getElementById("click").addEventListener("click", handleButtonClick);
document.getElementById("click2").addEventListener("click", handleButtonClick);


// open web socket
const websocket = new WebSocket('ws://localhost:8080/Data');

websocket.addEventListener('open', () => {
  console.log('WebSocket connection established.');
  let websocketMessage = {type : "fetchCanisterIds", content : null}
  sendWebsocketMessage(JSON.stringify(websocketMessage));
});

websocket.addEventListener('message', (event) => {
  let websocketMessage = JSON.parse(event.data);

  switch(websocketMessage.type) {
    case "targetCanisterIds":
      targetCanisterIds = JSON.parse(websocketMessage.content);
      console.log("These are the target canisters: " + JSON.stringify(targetCanisterIds));
      break;
    default:
      break;
  }
});

function sendWebsocketMessage(websocketMessage) {
  websocket.send(websocketMessage);
}

export async function GetIdentity() {
  try {
    const nfid = await NFID.init({
      application: {
        name: "BOOM DAO",
        logo: "https://i.postimg.cc/L4f471FF/logo.png"
      },
    });

    if (identity == null) {
      identity = await nfid.getDelegation({
        targets: targetCanisterIds,
        derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.ic0.app",
        maxTimeToLive: BigInt(24) * BigInt(3_600_000_000_000) // 24 hrs
      });
    }

    console.log("referrer=" + document.referrer);

    if (window.parent != null && document.referrer !== '' && document.referrer != null) {
      window.parent.postMessage(JSON.stringify(identity), document.referrer);
      return;
    }

    console.log("This is your identity: " + JSON.stringify(identity))
    let websocketMessage = {type : "identityJson", content : JSON.stringify(identity)}
    sendWebsocketMessage(JSON.stringify(websocketMessage));
    // window.close();

  } catch (e) {
    console.error(e);

    toggleElements(true, true);
  }
}