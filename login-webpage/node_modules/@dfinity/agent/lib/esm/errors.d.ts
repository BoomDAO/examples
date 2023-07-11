/**
 * An error that happens in the Agent. This is the root of all errors and should be used
 * everywhere in the Agent code (this package).
 *
 * @todo https://github.com/dfinity/agent-js/issues/420
 */
export declare class AgentError extends Error {
    readonly message: string;
    constructor(message: string);
}
