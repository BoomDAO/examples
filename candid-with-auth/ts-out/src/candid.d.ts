import { ActorSubclass, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import './candid.css';
export declare function fetchActor(canisterId: Principal, _identity: Identity): Promise<ActorSubclass>;
export declare function getProfilerActor(canisterId: Principal): ActorSubclass;
export declare function getCycles(canisterId: Principal): Promise<bigint | undefined>;
export declare function getNames(canisterId: Principal): Promise<undefined>;
export declare function getProfiling(canisterId: Principal): Promise<Array<[number, bigint]> | undefined>;
export declare function render(id: Principal, canister: ActorSubclass, profiling: bigint | undefined): void;
