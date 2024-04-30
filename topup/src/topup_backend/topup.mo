import Cycles "mo:base/ExperimentalCycles";
import Buffer "mo:base/Buffer";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Timer "mo:base/Timer";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Result "mo:base/Result";

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
    return await management.deposit_cycles({ canister_id = canister_id });
  };

  public shared ({ caller }) func topup_canister(id : Text) : async () {
    assert (caller == Principal.fromText("2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe"));
      let required_cycles : Nat = 5_000_000_000_000;
      let canister_id : Principal = Principal.fromText(id);
      await sendCycles_(canister_id, required_cycles);
  };

  public shared ({ caller }) func topup_canister_with_cycles(id : Text, cycles : Nat) : async () {
    assert (caller == Principal.fromText("2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe"));
      let required_cycles : Nat = cycles;
      let canister_id : Principal = Principal.fromText(id);
      await sendCycles_(canister_id, required_cycles);
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

    for (i in c_summary.vals()) {
      let expected_cycles = 15_000_000_000_000;
      if (expected_cycles > i.0) {
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

    for (i in c_summary.vals()) {
      let expected_cycles = 15_000_000_000_000;
      let required_cycles : Nat = expected_cycles - i.0;
      if (required_cycles > 0) {
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

  public type Account = { owner : Principal; subaccount : ?Subaccount };
  public type Allowance = { allowance : Nat; expires_at : ?Timestamp };
  public type AllowanceArgs = { account : Account; spender : Account };
  public type Approve = {
    fee : ?Nat;
    from : Account;
    memo : ?Blob;
    created_at_time : ?Timestamp;
    amount : Nat;
    expected_allowance : ?Nat;
    expires_at : ?Timestamp;
    spender : Account;
  };
  public type ApproveArgs = {
    fee : ?Nat;
    memo : ?Blob;
    from_subaccount : ?Blob;
    created_at_time : ?Timestamp;
    amount : Nat;
    expected_allowance : ?Nat;
    expires_at : ?Timestamp;
    spender : Account;
  };
  public type ApproveError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #Duplicate : { duplicate_of : BlockIndex };
    #BadFee : { expected_fee : Nat };
    #AllowanceChanged : { current_allowance : Nat };
    #CreatedInFuture : { ledger_time : Timestamp };
    #TooOld;
    #Expired : { ledger_time : Timestamp };
    #InsufficientFunds : { balance : Nat };
  };
  public type ApproveResult = { #Ok : BlockIndex; #Err : ApproveError };
  public type ArchiveInfo = {
    block_range_end : BlockIndex;
    canister_id : Principal;
    block_range_start : BlockIndex;
  };
  public type Block = Value;
  public type BlockIndex = Nat;
  public type BlockRange = { blocks : [Block] };
  public type Burn = {
    from : Account;
    memo : ?Blob;
    created_at_time : ?Timestamp;
    amount : Nat;
    spender : ?Account;
  };
  public type ChangeFeeCollector = { #SetTo : Account; #Unset };
  public type DataCertificate = { certificate : ?Blob; hash_tree : Blob };
  public type Duration = Nat64;
  public type FeatureFlags = { icrc2 : Bool };
  public type GetBlocksArgs = { start : BlockIndex; length : Nat };
  public type GetBlocksResponse = {
    certificate : ?Blob;
    first_index : BlockIndex;
    blocks : [Block];
    chain_length : Nat64;
    archived_blocks : [{
      callback : QueryBlockArchiveFn;
      start : BlockIndex;
      length : Nat;
    }];
  };
  public type GetTransactionsRequest = { start : TxIndex; length : Nat };
  public type GetTransactionsResponse = {
    first_index : TxIndex;
    log_length : Nat;
    transactions : [Transaction];
    archived_transactions : [{
      callback : QueryArchiveFn;
      start : TxIndex;
      length : Nat;
    }];
  };
  public type HttpRequest = {
    url : Text;
    method : Text;
    body : Blob;
    headers : [(Text, Text)];
  };
  public type HttpResponse = {
    body : Blob;
    headers : [(Text, Text)];
    status_code : Nat16;
  };
  public type InitArgs = {
    decimals : ?Nat8;
    token_symbol : Text;
    transfer_fee : Nat;
    metadata : [(Text, MetadataValue)];
    minting_account : Account;
    initial_balances : [(Account, Nat)];
    maximum_number_of_accounts : ?Nat64;
    accounts_overflow_trim_quantity : ?Nat64;
    fee_collector_account : ?Account;
    archive_options : {
      num_blocks_to_archive : Nat64;
      max_transactions_per_response : ?Nat64;
      trigger_threshold : Nat64;
      max_message_size_bytes : ?Nat64;
      cycles_for_archive_creation : ?Nat64;
      node_max_memory_size_bytes : ?Nat64;
      controller_id : Principal;
    };
    max_memo_length : ?Nat16;
    token_name : Text;
    feature_flags : ?FeatureFlags;
  };
  public type LedgerArg = { #Upgrade : ?UpgradeArgs; #Init : InitArgs };
  public type Map = [(Text, Value)];
  public type MetadataValue = {
    #Int : Int;
    #Nat : Nat;
    #Blob : Blob;
    #Text : Text;
  };
  public type Mint = {
    to : Account;
    memo : ?Blob;
    created_at_time : ?Timestamp;
    amount : Nat;
  };
  public type QueryArchiveFn = shared query GetTransactionsRequest -> async TransactionRange;
  public type QueryBlockArchiveFn = shared query GetBlocksArgs -> async BlockRange;
  public type StandardRecord = { url : Text; name : Text };
  public type Subaccount = Blob;
  public type Timestamp = Nat64;
  public type Tokens = Nat;
  public type Transaction = {
    burn : ?Burn;
    kind : Text;
    mint : ?Mint;
    approve : ?Approve;
    timestamp : Timestamp;
    transfer : ?Transfer;
  };
  public type TransactionRange = { transactions : [Transaction] };
  public type Transfer = {
    to : Account;
    fee : ?Nat;
    from : Account;
    memo : ?Blob;
    created_at_time : ?Timestamp;
    amount : Nat;
    spender : ?Account;
  };
  public type TransferArg = {
    to : Account;
    fee : ?Tokens;
    memo : ?Blob;
    from_subaccount : ?Subaccount;
    created_at_time : ?Timestamp;
    amount : Tokens;
  };
  public type TransferError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #BadBurn : { min_burn_amount : Tokens };
    #Duplicate : { duplicate_of : BlockIndex };
    #BadFee : { expected_fee : Tokens };
    #CreatedInFuture : { ledger_time : Timestamp };
    #TooOld;
    #InsufficientFunds : { balance : Tokens };
  };
  public type TransferFromArgs = {
    to : Account;
    fee : ?Tokens;
    spender_subaccount : ?Subaccount;
    from : Account;
    memo : ?Blob;
    created_at_time : ?Timestamp;
    amount : Tokens;
  };
  public type TransferFromError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #InsufficientAllowance : { allowance : Tokens };
    #BadBurn : { min_burn_amount : Tokens };
    #Duplicate : { duplicate_of : BlockIndex };
    #BadFee : { expected_fee : Tokens };
    #CreatedInFuture : { ledger_time : Timestamp };
    #TooOld;
    #InsufficientFunds : { balance : Tokens };
  };
  public type TransferFromResult = {
    #Ok : BlockIndex;
    #Err : TransferFromError;
  };
  public type TransferResult = { #Ok : BlockIndex; #Err : TransferError };
  public type TxIndex = Nat;
  public type UpgradeArgs = {
    token_symbol : ?Text;
    transfer_fee : ?Nat;
    metadata : ?[(Text, MetadataValue)];
    maximum_number_of_accounts : ?Nat64;
    accounts_overflow_trim_quantity : ?Nat64;
    change_fee_collector : ?ChangeFeeCollector;
    max_memo_length : ?Nat16;
    token_name : ?Text;
    feature_flags : ?FeatureFlags;
  };
  public type Value = {
    #Int : Int;
    #Map : Map;
    #Nat : Nat;
    #Nat64 : Nat64;
    #Blob : Blob;
    #Text : Text;
    #Array : [Value];
  };
  public type Self = actor {
    icrc1_transfer : shared TransferArg -> async TransferResult;
  };

  private stable var user_ids : [Principal] = [];
  private stable var transfer_response : [TransferResult] = [];
  // public shared ({ caller }) func transfer_BOOM_principals() : async () {
  //   assert (caller == Principal.fromText("2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe"));
  //   let boom_ledger : Self = actor ("vtrom-gqaaa-aaaaq-aabia-cai");
  //   var b = Buffer.Buffer<TransferResult>(0);
  //   for (i in user_ids.vals()) {
  //     let r = await boom_ledger.icrc1_transfer({
  //       to = {
  //         owner = i;
  //         subaccount = null;
  //       };
  //       fee = ?100000;
  //       memo = null;
  //       from_subaccount = null;
  //       created_at_time = null;
  //       amount = 20000000000;
  //     });
  //     b.add(r);
  //   };
  //   transfer_response := Buffer.toArray(b);
  // };
  // public query func getUserIds() : async ([Principal]) {
  //   return user_ids;
  // };
  public query func getTransferResponse() : async ([TransferResult]) {
    return transfer_response;
  };

};
