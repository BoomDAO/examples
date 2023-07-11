import { PipeArrayBuffer as Pipe } from './buffer';
/**
 *
 * @param pipe Pipe from buffer-pipe
 * @param num number
 * @returns Buffer
 */
export declare function safeRead(pipe: Pipe, num: number): ArrayBuffer;
/**
 * @param pipe
 */
export declare function safeReadUint8(pipe: Pipe): number;
/**
 * Encode a positive number (or bigint) into a Buffer. The number will be floored to the
 * nearest integer.
 * @param value The number to encode.
 */
export declare function lebEncode(value: bigint | number): ArrayBuffer;
/**
 * Decode a leb encoded buffer into a bigint. The number will always be positive (does not
 * support signed leb encoding).
 * @param pipe A Buffer containing the leb encoded bits.
 */
export declare function lebDecode(pipe: Pipe): bigint;
/**
 * Encode a number (or bigint) into a Buffer, with support for negative numbers. The number
 * will be floored to the nearest integer.
 * @param value The number to encode.
 */
export declare function slebEncode(value: bigint | number): ArrayBuffer;
/**
 * Decode a leb encoded buffer into a bigint. The number is decoded with support for negative
 * signed-leb encoding.
 * @param pipe A Buffer containing the signed leb encoded bits.
 */
export declare function slebDecode(pipe: Pipe): bigint;
/**
 *
 * @param value bigint or number
 * @param byteLength number
 * @returns Buffer
 */
export declare function writeUIntLE(value: bigint | number, byteLength: number): ArrayBuffer;
/**
 *
 * @param value
 * @param byteLength
 */
export declare function writeIntLE(value: bigint | number, byteLength: number): ArrayBuffer;
/**
 *
 * @param pipe Pipe from buffer-pipe
 * @param byteLength number
 * @returns bigint
 */
export declare function readUIntLE(pipe: Pipe, byteLength: number): bigint;
/**
 *
 * @param pipe Pipe from buffer-pipe
 * @param byteLength number
 * @returns bigint
 */
export declare function readIntLE(pipe: Pipe, byteLength: number): bigint;
