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

import Users "../../../utilities/world.types";
import Utils "../../../utilities/Utils";

actor NetData {
    //User Networked Static Data
    public type ProfileData = {
        principal : Principal;
        user_name : Text;
        skin : Text;
    };
    //User Networked Dynamic Data
    type PosData = {
        last_update_ts : Int;
        principal : Principal;
        position : Int;
    };

    private var world_to_users : Trie.Trie<Text, [Principal]> = Trie.empty();
    private var user_to_world : Trie.Trie<Text, Text> = Trie.empty();

    private var user_to_profileData : Trie.Trie<Text, ProfileData> = Trie.empty();
    private var user_to_posData : Trie.Trie<Text, PosData> = Trie.empty();

    private stable var last_cleanup_ts : Int = Time.now();
    private var cleanup_count : Nat = 0;
    private var is_cleanup_running = true;
    private var cleanup_valid_time : Nat = 1_000_000_000 * 30;

    public query func get_all_users() : async ([Text]) {
        var top_users = Buffer.Buffer<Text>(0);

        for ((key, val) in Trie.iter(user_to_profileData)) {
            top_users.add(key);
        };
        return Buffer.toArray(top_users);
    };

    public query func get_all_users_on_world(world : Text) : async Result.Result<[Principal], Text> {
        switch (Trie.find(world_to_users, Utils.keyT(world), Text.equal)) {
            case (?players) {
                //Get all players' unddata
                var arr = Buffer.Buffer<Principal>(players.size());

                for (element_player in players.vals()) {

                    arr.add(element_player);

                };

                return #ok(Buffer.toArray(arr));
            };
            case _ {
                return #err("Failed to fetch \"players\"");
            };
        };
    };

    // // //  PRIVATE
    //DISPOSE USER -> Called on Disconnect
    public func _dispose_user(player : Principal) : async () {
        await _remove_player_from_current_world(player);
        user_to_profileData := Trie.remove(user_to_profileData, Utils.keyT(Principal.toText(player)), Text.equal).0;
        user_to_posData := Trie.remove(user_to_posData, Utils.keyT(Principal.toText(player)), Text.equal).0;
    };

    //GET STATIC DATA
    private func _get_player_profileData(player : Principal) : (Result.Result<ProfileData, Text>) {
        switch (Trie.find(user_to_profileData, Utils.keyT(Principal.toText(player)), Text.equal)) {
            case (?data) {
                return #ok(data);
            };
            case _ {
                return #err("Failed to fetch ProfileData");
            };
        };
    };
    //GET DYNAMIC DATA
    private func _get_player_posData(player : Principal) : (Result.Result<PosData, Text>) {
        switch (Trie.find(user_to_posData, Utils.keyT(Principal.toText(player)), Text.equal)) {
            case (?data) {
                return #ok(data);
            };
            case _ {
                return #err("Failed to fetch PosData");
            };
        };
    };

    //REMOVE FROM WORLD
    private func _remove_player_from_world(current_world : Text, _caller : Principal) : async () {
        var caller : Text = Principal.toText(_caller);
        // switch (world_to_users.get(current_world)) {
        switch (Trie.find(world_to_users, Utils.keyT(current_world), Text.equal)) {
            case (?players) {
                var found = false;
                var p : Buffer.Buffer<Principal> = Buffer.Buffer<Principal>(players.size());
                for (player in players.vals()) {
                    if (player == _caller) {
                        found := true;
                    } else {
                        p.add(player);
                    };
                };
                if (found) {
                    world_to_users := Trie.put(world_to_users, Utils.keyT(current_world), Text.equal, Buffer.toArray(p)).0;
                };
            };
            case _ {}; // No need to handle this case cuz if this method is called is because the current word entry exist
        };
        user_to_world := Trie.remove(user_to_world, Utils.keyT(caller), Text.equal).0;
    };

    //REMOVE CURRENT FROM WORLD
    private func _remove_player_from_current_world(_caller : Principal) : async () {
        var caller : Text = Principal.toText(_caller);
        switch (Trie.find(user_to_world, Utils.keyT(caller), Text.equal)) {
            case (?current_world) {
                await _remove_player_from_world(current_world, _caller);
            };
            case _ {}; //No need to do anything here
        };
    };
    //LOCATE
    private func _locate_player_on_next_world(next_world : Text, caller : Principal) : (Text){
        var msg = "";
        switch (Trie.find(world_to_users, Utils.keyT(next_world), Text.equal)) {
            case (?players) {
                msg := "World was already created "#next_world;
                var b : Buffer.Buffer<Principal> = Buffer.fromArray(players);
                b.add(caller);
                world_to_users := Trie.put(world_to_users, Utils.keyT(next_world), Text.equal, Buffer.toArray(b)).0;
            };
            case _ {
                msg := "Had to create world "#next_world;
                let new_players = Buffer.Buffer<Principal>(150);
                new_players.add(caller);
                world_to_users := Trie.put(world_to_users, Utils.keyT(next_world), Text.equal, Buffer.toArray(new_players)).0;
            };
        };
        user_to_world := Trie.put(user_to_world, Utils.keyT(Principal.toText(caller)), Text.equal, next_world).0;
        return msg;
    };
    //MOVE
    private func _move_player_to_next_world(current_world : Text, next_world : Text, caller : Principal) : async () {

        //Dispose player from world
        await _remove_player_from_world(current_world, caller);

        //Now locate caller
        var msg = _locate_player_on_next_world(next_world, caller);
    };

    //CLEANUP
    public func clean_up() : async () {
        last_cleanup_ts := Time.now();
        cleanup_count += 1;

        // do something
        var keep_looping = true;
        while (keep_looping) {
            keep_looping := false;

            label unddata_loop for ((k, user_unddata) in Trie.iter(user_to_posData)) {
                if (Time.now() > user_unddata.last_update_ts + cleanup_valid_time) {
                    keep_looping := true;
                    await _dispose_user(user_unddata.principal);
                    break unddata_loop;
                };
            };
        };
    };
    // var timer_id : Timer.TimerId = Timer.recurringTimer(#seconds(10), clean_up);

    // // // PUBLIC
    //START CLEANUP LOOP
    // public shared ({ caller }) func start_timer(interval : Nat) : async () {
    //     if(is_cleanup_running) return;
    //     is_cleanup_running := true;
    //     Timer.cancelTimer(timer_id);
    //     timer_id := Timer.recurringTimer(#seconds(10), clean_up);
    // };
    //STOP CLEANUP LOOP
    // public shared ({ caller }) func stop_timer(interval : Nat) : async () {
    //     if(is_cleanup_running == false) return;
    //     is_cleanup_running := false;
    //     Timer.cancelTimer(timer_id);
    // };

    //GET CLEANUP LOOP COUNT
    public query func get_cleanup_count() : async Nat {
        return cleanup_count;
    };

    //TELEPORT USER TO A VIRTUAL ROOM -> Called on world.cs Start
    public shared ({ caller }) func teleport_user(next_world : Text) : async (Result.Result<Text, Text>) {
        //Check if player is in a world already and
        //if so and if the current world is different from
        //the next world set it as the current world and
        //move player to next world
        //otherwise just locate player on next world
        switch (Trie.find(user_to_world, Utils.keyT(Principal.toText(caller)), Text.equal)) {
            case (?current_world) {
                if (current_world != next_world) {
                    await _move_player_to_next_world(current_world, next_world, caller);
                    return #ok("User has been moved");
                };
                return #err("No need to teleport user");
            };
            case _ {
                var msg = _locate_player_on_next_world(next_world, caller);
                return #ok("User has been allocated, msg: "#msg);
            };
        };
        return #err("Something went wrong");
    };

    public query func find_user(player : Principal) : async (Result.Result<Text, Text>) {
        //Check if player is in a world already and
        //if so and if the current world is different from
        //the next world set it as the current world and
        //move player to next world
        //otherwise just locate player on next world
        switch (Trie.find(user_to_world, Utils.keyT(Principal.toText(player)), Text.equal)) {
            case (?current_world) {
                return #ok(current_world);
            };
            case _ {
                return #err("Could not be found");
            };
        };
    };

    //UPDATE STATIC DATA -> Called on login and every time user name or avatar changes
    public shared ({ caller }) func update_profileData(user_name : Text, skin : Text) : async () {
        let profileData : ProfileData = { principal = caller; user_name; skin };
        user_to_profileData := Trie.put(user_to_profileData, Utils.keyT(Principal.toText(caller)), Text.equal, profileData).0;
    };
    //UPDATE DYNAMIC DATA -> Called every x frames
    public shared ({ caller }) func update_posData(position : Int) : async () {

        // animation_and_position Unity Int64
        // Int64 max value is 9223372036854775807
        // We can break this up into group of 5
        // Like this 9223_37203_68547_75807
        // Group "75807" can be Axis "x" from -9999.9 to 9999.9
        // Group "68547" can be Axis "y" from -9999.9 to 9999.9
        // Group "37203" can be Axis "z" from -9999.9 to 9999.9
        // Lets break down the Group "9223" in SubGroups
        // Like this 9_223
        // Group "223" each digit can be used to store directions for each axis
        // 2 for positive, 1 for even and 0 for negative
        // For example 102 represent Vector3(-1,0,1) in Unity
        let posData : PosData = {
            principal = caller;
            position;
            last_update_ts = Time.now();
        };
        user_to_posData := Trie.put(user_to_posData, Utils.keyT(Principal.toText(caller)), Text.equal, posData).0;
    };

    //GET STATIC DATA
    public query func get_player_profileData(player : Principal) : async (Result.Result<ProfileData, Text>) {
        return _get_player_profileData(player);
    };
    public query func get_all_player_profileData(current_world : Text) : async (Result.Result<[ProfileData], Text>) {
        switch (Trie.find(world_to_users, Utils.keyT(current_world), Text.equal)) {
            case (?players) {
                //Get all players' profileData
                var arr = Buffer.Buffer<ProfileData>(players.size());
                for (element_player in players.vals()) {
                    switch (_get_player_profileData(element_player)) {
                        case (#ok profileData) {
                            arr.add(profileData);
                        };
                        case _  { }; //We do nothing here, player yet might not have initialized its static data
                    };
                };
                return #ok(Buffer.toArray(arr));
            };
            case _ {
                return #err("Failed to fetch \"players\", not necessarily an error");
            };
        };
    };
    //GET DYNAMIC DATA
    public query func get_player_posData(player : Principal) : async (Result.Result<PosData, Text>) {
        return _get_player_posData(player);
    };
    public query func get_all_player_posData(current_world : Text) : async (Result.Result<[PosData], Text>) {
        switch (Trie.find(world_to_users, Utils.keyT(current_world), Text.equal)) {
            case (?players) {
                //Get all players' posData
                var arr = Buffer.Buffer<PosData>(players.size());

                for (element_player in players.vals()) {

                    switch (_get_player_posData(element_player)) {
                        case (#ok posData) {
                            arr.add(posData);
                        };
                        case _ { }; //We do nothing here, player yet might not have moved
                    };
                };

                return #ok(Buffer.toArray(arr));
            };
            case _ {
                return #err("Failed to fetch \"players\", not necessarily an error");
            };
        };
    };

    //DISPOSE USER -> Called on Disconnect
    public shared ({ caller }) func dispose_user() : async () {
        await _dispose_user(caller);
    };

    public query func cycleBalance() : async Nat {
        Cycles.balance();
    };
};
