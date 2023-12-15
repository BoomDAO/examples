import A "mo:base/AssocList";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Char "mo:base/Char";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Int16 "mo:base/Int16";
import Int8 "mo:base/Int8";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Trie2D "mo:base/Trie";
import Float "mo:base/Float";
import Int64 "mo:base/Int64";

import Governance "governance.types";

actor {
  let governance : Governance.Self = actor ("xomae-vyaaa-aaaaq-aabhq-cai");

  private stable var neuron_staking_details : {
    dissolving : Nat64;
    not_dissolving : Nat64;
  } = {
    dissolving = 0;
    not_dissolving = 0;
  };

  private stable var total_neurons = 0;

  private func textToFloat(t : Text) : Float {
    var i : Float = 1;
    var f : Float = 0;
    var isDecimal : Bool = false;
    for (c in t.chars()) {
      if (Char.isDigit(c)) {
        let charToNat : Nat64 = Nat64.fromNat(Nat32.toNat(Char.toNat32(c) -48));
        let natToFloat : Float = Float.fromInt64(Int64.fromNat64(charToNat));
        if (isDecimal) {
          let n : Float = natToFloat / Float.pow(10, i);
          f := f + n;
        } else {
          f := f * 10 + natToFloat;
        };
        i := i + 1;
      } else {
        if (Char.equal(c, '.') or Char.equal(c, ',')) {
          f := f / Float.pow(10, i); // Force decimal
          f := f * Float.pow(10, i); // Correction
          isDecimal := true;
          i := 1;
        } else {};
      };
    };

    return f;
  };

  public shared ({ caller }) func refresh_neurons_staking_details() : async ({
    dissolving : Nat64;
    not_dissolving : Nat64;
  }) {
    assert (caller != Principal.fromText("2vxsx-fae"));
    total_neurons := 0;
    var _dissolving : Nat = 0;
    var _not_dissolving : Nat = 0;

    var isPageLeft = true;
    var last_neuron : ?Governance.NeuronId = null;

    while (isPageLeft) {
      let neurons = await governance.list_neurons({
        of_principal = null;
        limit = 100;
        start_page_at = last_neuron;
      });
      for (i in neurons.neurons.vals()) {
        switch (i.dissolve_state) {
          case (?is_set) {
            switch (is_set) {
              case (#DissolveDelaySeconds _) {
                neuron_staking_details := {
                  dissolving = neuron_staking_details.dissolving;
                  not_dissolving = neuron_staking_details.not_dissolving + i.cached_neuron_stake_e8s;
                };
              };
              case (#WhenDissolvedTimestampSeconds _) {
                neuron_staking_details := {
                  dissolving = neuron_staking_details.dissolving + i.cached_neuron_stake_e8s;
                  not_dissolving = neuron_staking_details.not_dissolving;
                };
              };
            };
          };
          case _ {};
        };
        total_neurons := total_neurons + 1;
      };
      if (neurons.neurons.size() < 100) {
        isPageLeft := false;
      } else {
        last_neuron := neurons.neurons[99].id;
      };
    };

    return neuron_staking_details;
  };

  public query func get_neuron_staking_details() : async ({
    dissolving : Float;
    not_dissolving : Float;
  }) {
    let diss = Nat64.toText(neuron_staking_details.dissolving);
    let not_diss = Nat64.toText(neuron_staking_details.not_dissolving);
    return {
      dissolving = Float.div(textToFloat(diss), 100000000.0);
      not_dissolving = Float.div(textToFloat(not_diss), 100000000.0);
    };
  };

  // public query func cycleBalance() : async Nat {
  //   Cycles.balance();
  // };

  public query func get_total_neurons() : async Nat { return total_neurons };

};
