/**
 * Concatenate multiple array buffers.
 * @param buffers The buffers to concatenate.
 */
export declare function concat(...buffers: ArrayBuffer[]): ArrayBuffer;
/**
 * Transforms a buffer to an hexadecimal string. This will use the buffer as an Uint8Array.
 * @param buffer The buffer to return the hexadecimal string of.
 */
export declare function toHex(buffer: ArrayBuffer): string;
/**
 * Transforms a hexadecimal string into an array buffer.
 * @param hex The hexadecimal string to use.
 */
export declare function fromHex(hex: string): ArrayBuffer;
export declare function compare(b1: ArrayBuffer, b2: ArrayBuffer): number;
