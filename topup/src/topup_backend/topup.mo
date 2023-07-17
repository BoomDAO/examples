import Cycles "mo:base/ExperimentalCycles";
import Buffer "mo:base/Buffer";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Timer "mo:base/Timer";
import Principal "mo:base/Principal";

import Utils "../../../utilities/Utils";
import ENV "env";


actor TopUp {
  type CanisterInfo = {
    canister_id : Text;
    canister_name : Text;
  };
  private stable var _canisters : Trie.Trie<Text, Text> = Trie.empty(); //canister_id -> canister_name mapping

  private func sendCycles_(canister_id : Principal) : async () {
    let management = actor (ENV.managementCanisterId) : actor {
      deposit_cycles : shared ({ canister_id : Principal }) -> async ();
    };
    Cycles.add(2000000000000);
    return await management.deposit_cycles({canister_id = canister_id;});
  };

  func topupCanistersCron_() : async () {
    for ((i, v) in Trie.iter(_canisters)) {
      let canister = actor (i) : actor {
        cycleBalance : shared () -> async (Nat);
      };
      let balance = await canister.cycleBalance();
      if (balance < 2_000_000_000_000) {
        await sendCycles_(Principal.fromText(i));
      };
    };
  };

  public query func cycleBalance() : async (Nat) {
    return Cycles.balance();
  };

  public shared ({ caller }) func topupCanisters() : async () {
    for ((i, v) in Trie.iter(_canisters)) {
      let canister = actor (i) : actor {
        cycleBalance : shared () -> async (Nat);
      };
      let balance = await canister.cycleBalance();
      if (balance < 2_000_000_000_000) {
        await sendCycles_(Principal.fromText(i));
      };
    };
  };

  public shared ({ caller }) func addCanister(info : CanisterInfo) : async () {
    assert (caller == Principal.fromText(ENV.admin));
    _canisters := Trie.put(_canisters, Utils.keyT(info.canister_id), Text.equal, info.canister_name).0;
  };

  public query func getCanisters() : async ([(Text, Text)]) {
    var b : Buffer.Buffer<(Text, Text)> = Buffer.Buffer<(Text, Text)>(0);
    for((i, v) in Trie.iter(_canisters)) {
      b.add((i, v));
    };
    return Buffer.toArray(b);
  };

  // cron defined for 24-hrs period
  let top_up = Timer.recurringTimer(#seconds (24 * 60 * 60), topupCanistersCron_);
};
