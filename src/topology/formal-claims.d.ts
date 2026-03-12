export interface WorthingtonWhipResult {
    readonly shards: number;
    readonly numerator: number;
    readonly denominator: number;
    readonly savingsFraction: number;
}
export interface SpeculativeTreeResult {
    readonly alpha: number;
    readonly depth: number;
    readonly expectedAccepted: number;
    readonly denominator: number;
}
export interface TurbulentIdleResult {
    readonly stageCount: number;
    readonly chunkCount: number;
    readonly numerator: number;
    readonly denominator: number;
    readonly idleFraction: number;
}
export interface QuantumDeficitResult {
    readonly sqrtN: number;
    readonly searchSize: number;
    readonly classicalDeficit: number;
    readonly quantumDeficit: number;
    readonly speedup: number;
}
export interface ProtocolDeficitResult {
    readonly streamCount: number;
    readonly intrinsicBeta1: number;
    readonly tcpDeficit: number;
    readonly quicDeficit: number;
    readonly flowDeficit: number;
}
export interface SettlementDeficitResult {
    readonly intrinsicBeta1: number;
    readonly sequentialDeficit: number;
    readonly parallelDeficit: number;
}
export declare function worthingtonWhipSavings(shards: number): WorthingtonWhipResult;
export declare function speculativeTreeExpectedAccepted(alpha: number, depth: number): SpeculativeTreeResult;
export declare function turbulentIdleFraction(stageCount: number, chunkCount: number): TurbulentIdleResult;
export declare function quantumDeficitIdentity(sqrtN: number): QuantumDeficitResult;
export declare function protocolDeficits(streamCount: number): ProtocolDeficitResult;
export declare function settlementDeficits(): SettlementDeficitResult;
export declare function beta2FromBandGap(forbiddenEnergyCount: number): number;
export declare function firstLawConserved(forkEnergy: number, foldWork: number, ventEnergy: number, tolerance?: number): boolean;
