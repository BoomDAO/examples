var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Principal } from '@dfinity/principal';
import { requestIdOf } from './request_id';
import { concat, toHex } from './utils/buffer';
const domainSeparator = new TextEncoder().encode('\x0Aic-request');
/**
 * An Identity that can sign blobs.
 */
export class SignIdentity {
    /**
     * Get the principal represented by this identity. Normally should be a
     * `Principal.selfAuthenticating()`.
     */
    getPrincipal() {
        if (!this._principal) {
            this._principal = Principal.selfAuthenticating(new Uint8Array(this.getPublicKey().toDer()));
        }
        return this._principal;
    }
    /**
     * Transform a request into a signed version of the request. This is done last
     * after the transforms on the body of a request. The returned object can be
     * anything, but must be serializable to CBOR.
     * @param request - internet computer request to transform
     */
    async transformRequest(request) {
        const { body } = request, fields = __rest(request, ["body"]);
        const requestId = await requestIdOf(body);
        return Object.assign(Object.assign({}, fields), { body: {
                content: body,
                sender_pubkey: this.getPublicKey().toDer(),
                sender_sig: await this.sign(concat(domainSeparator, requestId)),
            } });
    }
}
export class AnonymousIdentity {
    getPrincipal() {
        return Principal.anonymous();
    }
    async transformRequest(request) {
        return Object.assign(Object.assign({}, request), { body: { content: request.body } });
    }
}
/**
 * Create an IdentityDescriptor from a @dfinity/identity Identity
 * @param identity - identity describe in returned descriptor
 */
export function createIdentityDescriptor(identity) {
    const identityIndicator = 'getPublicKey' in identity
        ? { type: 'PublicKeyIdentity', publicKey: toHex(identity.getPublicKey().toDer()) }
        : { type: 'AnonymousIdentity' };
    return identityIndicator;
}
//# sourceMappingURL=auth.js.map