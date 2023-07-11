export declare enum CborTag {
    Uint64LittleEndian = 71,
    Semantic = 55799
}
/**
 * Encode a JavaScript value into CBOR.
 */
export declare function encode(value: any): ArrayBuffer;
export declare function decode<T>(input: ArrayBuffer): T;
