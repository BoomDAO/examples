import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Nat "mo:base/Nat";
import Option "mo:base/Option";

actor Test {

    private stable var alphas : Trie.Trie<Text, Nat> = Trie.empty();
    func keyT(x : Text) : Trie.Key<Text> {
        return { hash = Text.hash(x); key = x };
    };
    public query func getAlpha(a : Text) : async ((Text, Nat)) {
        return (a, Option.get(Trie.find(alphas, keyT(a), Text.equal), 0));
    };

    public func updateX(v : (Text, Nat)) : async (Text, Nat) {
        alphas := Trie.put(alphas, keyT(v.0), Text.equal, v.1).0;
        return v;
    };
}