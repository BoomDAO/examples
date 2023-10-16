import Cycles "mo:base/ExperimentalCycles";
import Buffer "mo:base/Buffer";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Timer "mo:base/Timer";
import Principal "mo:base/Principal";
import Option "mo:base/Option";

import Utils "../../../utilities/Utils";
import ENV "env";

actor TopUp {
  type DefiniteCanisterSettingsArgs = {
    freezing_threshold : Nat;
    controllers : [Principal];
    memory_allocation : Nat;
    compute_allocation : Nat;
  };
  type CanisterStatusType = { #stopped; #stopping; #running };
  type CanisterStatusResultV2 = {
    status : CanisterStatusType;
    memory_size : Nat;
    cycles : Nat;
    settings : DefiniteCanisterSettingsArgs;
    idle_cycles_burned_per_day : Nat;
    module_hash : ?Blob;
  };
  type CanisterSummary = {
    status : ?CanisterStatusResultV2;
    canister_id : ?Principal;
  };
  type GetSnsCanistersSummaryRequest = { update_canister_list : ?Bool };
  type GetSnsCanistersSummaryResponse = {
    root : ?CanisterSummary;
    swap : ?CanisterSummary;
    ledger : ?CanisterSummary;
    index : ?CanisterSummary;
    governance : ?CanisterSummary;
    dapps : [CanisterSummary];
    archives : [CanisterSummary];
  };

  let ROOT = actor ("xjngq-yaaaa-aaaaq-aabha-cai") : actor {
    get_sns_canisters_summary : shared GetSnsCanistersSummaryRequest -> async GetSnsCanistersSummaryResponse;
  };

  let management = actor (ENV.managementCanisterId) : actor {
    deposit_cycles : shared ({ canister_id : Principal }) -> async ();
  };

  private func sendCycles_(canister_id : Principal, cycles : Nat) : async () {
    let management = actor (ENV.managementCanisterId) : actor {
      deposit_cycles : shared ({ canister_id : Principal }) -> async ();
    };
    Cycles.add(cycles);
    return await management.deposit_cycles({canister_id = canister_id;});
  };

  public query func cycleBalance() : async (Nat) {
    return Cycles.balance();
  };

  public shared ({ caller }) func topup_SNS_canisters() : async () {
    assert (caller == Principal.fromText("2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe"));
    var c_summary = Buffer.Buffer<(Nat, ?Principal)>(0);
    let res = await ROOT.get_sns_canisters_summary({
      update_canister_list = null;
    });
    switch (res.root) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.swap) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.ledger) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.index) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.governance) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };

    for (i in res.dapps.vals()) {
      switch (i.status) {
        case (?val) {
          c_summary.add((val.cycles, i.canister_id));
        };
        case _ {};
      };
    };

    for(i in c_summary.vals()) {
      let expected_cycles = 15_000_000_000_000;
      if(expected_cycles > i.0) {
        let required_cycles : Nat = expected_cycles - i.0;
        let canister_id : Principal = Option.get(i.1, Principal.fromText("fglgf-uyaaa-aaaal-qbzcq-cai"));
        await sendCycles_(canister_id, required_cycles);
      };
    };

  };

  func topup_SNS_canisters_cron() : async () {
    var c_summary = Buffer.Buffer<(Nat, ?Principal)>(0);
    let res = await ROOT.get_sns_canisters_summary({
      update_canister_list = null;
    });
    switch (res.root) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.swap) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.ledger) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.index) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };
    switch (res.governance) {
      case (?summary) {
        switch (summary.status) {
          case (?val) {
            c_summary.add((val.cycles, summary.canister_id));
          };
          case _ {};
        };
      };
      case _ {};
    };

    for (i in res.dapps.vals()) {
      switch (i.status) {
        case (?val) {
          c_summary.add((val.cycles, i.canister_id));
        };
        case _ {};
      };
    };

    for(i in c_summary.vals()) {
      let expected_cycles = 15_000_000_000_000;
      let required_cycles : Nat = expected_cycles - i.0;
      if(required_cycles > 0) {
        let canister_id : Principal = Option.get(i.1, Principal.fromText("fglgf-uyaaa-aaaal-qbzcq-cai"));
        await sendCycles_(canister_id, required_cycles);
      };
    };

  };

  // cron defined for 2-hrs period
  let top_up_id = Timer.recurringTimer(#seconds(2 * 60 * 60), topup_SNS_canisters_cron);
  public query func checkTopUpId() : async (Nat) {
    return top_up_id;
  };

};
