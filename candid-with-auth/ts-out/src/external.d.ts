interface ExternalConfig {
    candid?: string;
}
type MessageListener = (message: any) => void;
export declare function addMessageListener(listener: MessageListener): void;
export declare function removeMessageListener(listener: MessageListener): void;
/**
 * Use this global promise to safely access `external-config` data provided through `postMessage()`.
 */
export declare const EXTERNAL_CONFIG_PROMISE: Promise<ExternalConfig>;
export {};
