// import { AuthClient } from "@dfinity/auth-client";
// import { MyStorage } from "./MyStorage";
// import { NFID } from "@nfid/embed";

// var identity = null;
// let targetCanisterIds = [];
// let storage = new MyStorage();
// var nfid = null;

// // open web socket
// const websocket = new WebSocket('ws://localhost:8080/Data');

// websocket.addEventListener('open', () => {
//   console.log('WebSocket connection established.');
// });

// function sendWebsocketMessage(websocketMessage) {
//   websocket.send(websocketMessage);
// }

// const checkAuth = async () => {
//   try {
//     console.log("check auth called");
//     const _nfid = await getNfid();
//     const isAuthenticated = _nfid.isAuthenticated;
//     if (!isAuthenticated) return;
//     nfid = _nfid;
//     identity = nfid.getIdentity();
//   } catch (error) {
//     console.log("err while checking auth", error);
//     nfid = null;
//     identity = null;
//   };
// };

// const nfidEmbedLogin = async (nfid) => {
//   if (nfid.isAuthenticated) {
//     return nfid.getIdentity();
//   };
//   const delegationIdentity = identity = await nfid.getDelegation({
//     targets: targetCanisterIds,
//     derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.ic0.app",
//     maxTimeToLive: BigInt(24) * BigInt(3_600_000_000_000) // 24 hrs
//   });
//   return delegationIdentity;
// };

//   await checkAuth();
//   setTimeout(async () => {
//     try {
//       const isAuthenticated = nfid.isAuthenticated;
//       if (isAuthenticated) {
//         identity = nfid.getIdentity();
//       }
//       else {
//         identity = await nfidEmbedLogin(nfid);
//         await checkAuth();
//       };

//       console.log("referrer=" + document.referrer);
//       console.log("This is your principal : " + identity.getPrincipal().toString());
//       if (window.parent != null && document.referrer !== '' && document.referrer != null) {
//         window.parent.postMessage(JSON.stringify(identity), document.referrer);
//         return;
//       }
//       let websocketMessage = { type: "identityJson", content: JSON.stringify(identity) }
//       sendWebsocketMessage(JSON.stringify(websocketMessage));
//       window.close();
//     } catch (e) {
//       console.error(e);
//     };
//   }, 3000);
// }




import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { IdentityKitProvider, useIdentity, useAuth, ConnectWallet } from "@nfid/identitykit/react";
import { NFIDW } from "@nfid/identitykit";
import "@nfid/identitykit/react/styles.css";
import "./index.css";

const IdentityKitAuthType = {
  DELEGATION: "DELEGATION",
  ACCOUNTS: "ACCOUNTS",
};

const YourApp = () => {
  const identity = useIdentity();
  const { connect, disconnect, isConnecting, user } = useAuth();
  const [websocket, setWebSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/Data');
    setWebSocket(ws);

    ws.addEventListener('open', () => {
      console.log('WebSocket connection established.');
    });

    return () => {
      ws.close();
    };
  }, []);

  const sendWebSocketMessage = (message) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open.");
    }
  };

  useEffect(() => {
    const callConnect = async () => {
      await connect();
    }
    if (user != undefined) {
      console.log("User is authenticated.");
      console.log("This is your principal:", identity?.getPrincipal().toString());

      const identityMessage = {
        type: "identityJson",
        content: JSON.stringify(identity),
      };
      sendWebSocketMessage(identityMessage);
      if (window.parent && document.referrer) {
        window.parent.postMessage(JSON.stringify(identity), document.referrer);
      }
    } else {
      console.log("User is not authenticated. Logging in...");
      callConnect();
    }
  }, [user, identity, isConnecting]);

  // setTimeout(async () => {
  //   try {
  //     if (user != undefined) {
  //       console.log("User is authenticated [setTimeout].");
  //       console.log("This is your principal:", identity?.getPrincipal().toString());

  //       const identityMessage = {
  //         type: "identityJson",
  //         content: JSON.stringify(identity),
  //       };
  //       sendWebSocketMessage(identityMessage);
  //       if (window.parent && document.referrer) {
  //         window.parent.postMessage(JSON.stringify(identity), document.referrer);
  //       }
  //       // window.close();
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   };
  // }, 20000);

  return (
    <div className="main-div">
      <button className="button" onClick={async () => { await disconnect(); await connect(); }}>LOGIN with NFID</button>
    </div>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

const App = () => {
  return (
    <IdentityKitProvider
      authType={IdentityKitAuthType.DELEGATION}
      signers={[NFIDW]}
      signerClientOptions={{
        derivationOrigin: "https://7p3gx-jaaaa-aaaal-acbda-cai.ic0.app",
        keyType: 'Ed25519',
        idleOptions: { idleTimeout: 1000 * 60 * 60 * 24 },
      }}
    >
      <YourApp />
    </IdentityKitProvider>
  );
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// export default App;
