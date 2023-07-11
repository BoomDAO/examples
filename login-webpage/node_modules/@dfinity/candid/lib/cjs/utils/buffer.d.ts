/**
 * Concatenate multiple array buffers.
 * @param buffers The buffers to concatenate.
 */
export declare function concat(...buffers: ArrayBuffer[]): ArrayBuffer;
/**
 * Returns an hexadecimal representation of an array buffer.
 * @param bytes The array buffer.
 */
export declare function toHexString(bytes: ArrayBuffer): string;
/**
 * Return an array buffer from its hexadecimal representation.
 * @param hexString The hexadecimal string.
 */
export declare function fromHexString(hexString: string): ArrayBuffer;
/**
 * A class that abstracts a pipe-like ArrayBuffer.
 */
export declare class PipeArrayBuffer {
    /**
     * The reading view. It's a sliding window as we read and write, pointing to the buffer.
     * @private
     */
    private _view;
    /**
     * The actual buffer containing the bytes.
     * @private
     */
    private _buffer;
    /**
     * Creates a new instance of a pipe
     * @param buffer an optional buffer to start with
     * @param length an optional amount of bytes to use for the length.
     */
    constructor(buffer?: ArrayBuffer, length?: number);
    get buffer(): ArrayBuffer;
    get byteLength(): number;
    /**
     * Read `num` number of bytes from the front of the pipe.
     * @param num The number of bytes to read.
     */
    read(num: number): ArrayBuffer;
    readUint8(): number | undefined;
    /**
     * Write a buffer to the end of the pipe.
     * @param buf The bytes to write.
     */
    write(buf: ArrayBuffer): void;
    /**
     * Whether or not there is more data to read from the buffer
     */
    get end(): boolean;
    /**
     * Allocate a fixed amount of memory in the buffer. This does not affect the view.
     * @param amount A number of bytes to add to the buffer.
     */
    alloc(amount: number): void;
}
