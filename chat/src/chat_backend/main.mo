import A "mo:base/AssocList";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Char "mo:base/Char";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Map "mo:base/HashMap";
import Int "mo:base/Int";
import Int16 "mo:base/Int16";
import Int8 "mo:base/Int8";
import Iter "mo:base/Iter";
import L "mo:base/List";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import TrieMap "mo:base/TrieMap";
import Trie2D "mo:base/Trie";
import Timer "mo:base/Timer";
import Nat16 "mo:base/Nat16";
import Deque "mo:base/Deque";
import Debug "mo:base/Debug";

import Utils "../../../utilities/Utils";


actor Chat {

    private stable var max_feeds_count : Nat = 15;
    private var world_to_feeds : Trie.Trie<Text, (Deque.Deque<Text>, Nat)> = Trie.empty();

    //Dev Only
    public shared ({ caller }) func edit_max_feeds_count(new_value : Nat) : async () {
        max_feeds_count := new_value;
    };

    public query func get_max_feeds_count() : async (Nat) {
        return max_feeds_count;
    };

    public query func get_feeds(world : Text) : async (Result.Result<[Text], Text>){
        switch (Trie.find(world_to_feeds, Utils.keyT(world), Text.equal)) {
            case (?feeds) {
                var copy_feeds = feeds.0;
                let current_feeds_count : Nat = feeds.1;
                var b : Buffer.Buffer<Text> = Buffer.Buffer<Text>(max_feeds_count);
                var index = 0;


                var new_feeds = Deque.empty<Text>();
                while(index < current_feeds_count){
                    let reduced =  Deque.popFront(copy_feeds);
                    switch reduced {
                        case null {
                            Debug.trap "Empty queue impossible!";
                            return #err("Empty queue impossible!");
                        };
                        case (?result) {
                            b.add(result.0); //text
                            copy_feeds := result.1; // deque
                        };
                    };
                    index += 1;
                };

                

                return #ok(Buffer.toArray(b));
            };
            case _ {
                return #err("Chat not found")
            };
        };
    };
    public shared ({ caller }) func post_feed(world : Text, feed : Text) : async (Result.Result<[Text], Text>) {
        switch (Trie.find(world_to_feeds, Utils.keyT(world), Text.equal)) {
            case (?feeds) {
                var copy_feeds = Deque.empty<Text>();
                copy_feeds := Deque.pushFront(feeds.0,feed);
                var size : Nat = feeds.1 + 1;

                if(size > max_feeds_count){
                    var index = 0;
                    var diff : Nat = size - max_feeds_count;
                    size := max_feeds_count;
                    while(diff > 0){
                        let reduced =  Deque.popBack(copy_feeds);
                        var element_to_pushfront : Text = ""; 
                        switch reduced {
                            case null {
                                Debug.trap "Empty queue impossible!";
                                return #err("Empty queue impossible!");
                            };
                            case (?result) {
                                // element_to_pushfront := result.1; // text
                                copy_feeds := result.0; // deque
                            };
                        };
                        
                        diff -= 1;
                    };
                };

                world_to_feeds := Trie.put(world_to_feeds, Utils.keyT(world), Text.equal, (copy_feeds, size)).0;

                let get_feeds_response = await get_feeds(world);
                switch(get_feeds_response){
                    case (#ok feeds_arr){
                         return #ok(feeds_arr);
                    };
                    case _ {
                        return #err("No feeds exist foe world " #world# ", impossiblem!");
                    }
                };
            };
            case _ {
                var new_feeds = Deque.empty<Text>();
                new_feeds := Deque.pushFront(new_feeds,feed);

                world_to_feeds := Trie.put(world_to_feeds, Utils.keyT(world), Text.equal, (new_feeds, 1)).0;
                return #ok([feed]);
            };
        };
    };
    
    public query func get_feeds_count(world : Text) : async (Result.Result<Nat, Text>){
        switch (Trie.find(world_to_feeds, Utils.keyT(world), Text.equal)) {
            case (?feeds) {
                let count = feeds.1;
                return #ok(count);
            };
            case _ {
                return #err("Chat not found")
            };
        };
    };

    public query func cycleBalance() : async Nat {
        Cycles.balance();
    };
}