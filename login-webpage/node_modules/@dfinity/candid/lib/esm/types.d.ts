export interface JsonArray extends Array<JsonValue> {
}
export interface JsonObject extends Record<string, JsonValue> {
}
export declare type JsonValue = boolean | string | number | JsonArray | JsonObject;
