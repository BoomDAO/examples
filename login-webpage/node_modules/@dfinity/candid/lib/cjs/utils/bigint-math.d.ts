/**
 * Equivalent to `Math.log2(n)` with support for `BigInt` values
 *
 * @param n bigint or integer
 * @returns integer
 */
export declare function ilog2(n: bigint | number): number;
/**
 * Equivalent to `2 ** n` with support for `BigInt` values
 * (necessary for browser preprocessors which replace the `**` operator with `Math.pow`)
 *
 * @param n bigint or integer
 * @returns bigint
 */
export declare function iexp2(n: bigint | number): bigint;
