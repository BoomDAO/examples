import { HttpAgent } from './agent/http';
/**
 * Retrieves the Candid interface for the specified canister.
 *
 * @param agent The agent to use for the request (usually an `HttpAgent`)
 * @param canisterId A string corresponding to the canister ID
 * @returns Candid source code
 */
export declare function fetchCandid(canisterId: string, agent?: HttpAgent): Promise<string>;
