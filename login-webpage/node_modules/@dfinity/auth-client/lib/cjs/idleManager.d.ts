/** @module IdleManager */
declare type IdleCB = () => unknown;
export declare type IdleManagerOptions = {
    /**
     * Callback after the user has gone idle
     */
    onIdle?: IdleCB;
    /**
     * timeout in ms
     * @default 30 minutes [600_000]
     */
    idleTimeout?: number;
    /**
     * capture scroll events
     * @default false
     */
    captureScroll?: boolean;
    /**
     * scroll debounce time in ms
     * @default 100
     */
    scrollDebounce?: number;
};
/**
 * Detects if the user has been idle for a duration of `idleTimeout` ms, and calls `onIdle` and registered callbacks.
 * By default, the IdleManager will log a user out after 10 minutes of inactivity.
 * To override these defaults, you can pass an `onIdle` callback, or configure a custom `idleTimeout` in milliseconds
 */
export declare class IdleManager {
    callbacks: IdleCB[];
    idleTimeout: IdleManagerOptions['idleTimeout'];
    timeoutID?: number;
    /**
     * Creates an {@link IdleManager}
     * @param {IdleManagerOptions} options Optional configuration
     * @see {@link IdleManagerOptions}
     * @param options.onIdle Callback once user has been idle. Use to prompt for fresh login, and use `Actor.agentOf(your_actor).invalidateIdentity()` to protect the user
     * @param options.idleTimeout timeout in ms
     * @param options.captureScroll capture scroll events
     * @param options.scrollDebounce scroll debounce time in ms
     */
    static create(options?: {
        /**
         * Callback after the user has gone idle
         * @see {@link IdleCB}
         */
        onIdle?: () => unknown;
        /**
         * timeout in ms
         * @default 10 minutes [600_000]
         */
        idleTimeout?: number;
        /**
         * capture scroll events
         * @default false
         */
        captureScroll?: boolean;
        /**
         * scroll debounce time in ms
         * @default 100
         */
        scrollDebounce?: number;
    }): IdleManager;
    /**
     * @protected
     * @param options {@link IdleManagerOptions}
     */
    protected constructor(options?: IdleManagerOptions);
    /**
     * @param {IdleCB} callback function to be called when user goes idle
     */
    registerCallback(callback: IdleCB): void;
    /**
     * Cleans up the idle manager and its listeners
     */
    exit(): void;
    /**
     * Resets the timeouts during cleanup
     */
    _resetTimer(): void;
}
export {};
