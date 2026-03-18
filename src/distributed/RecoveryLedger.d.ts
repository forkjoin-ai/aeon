export type RecoveryShardRole = 'data' | 'parity';
export type RecoveryPathStatus = 'succeeded' | 'failed';
export interface RecoveryLedgerConfig {
    readonly objectId: string;
    readonly dataShardCount: number;
    readonly parityShardCount?: number;
    readonly recoveryThreshold?: number;
}
export interface RecoveryPathObservation {
    readonly pathId: string;
    readonly status: RecoveryPathStatus;
    readonly requestIds: readonly string[];
    readonly observedBy: readonly string[];
    readonly reasons: readonly string[];
    readonly firstObservedAt: number;
    readonly lastObservedAt: number;
}
export interface RecoveryShardObservation {
    readonly shardRole: RecoveryShardRole;
    readonly shardIndex: number;
    readonly digests: readonly string[];
    readonly requestIds: readonly string[];
    readonly observedBy: readonly string[];
    readonly sources: readonly string[];
    readonly firstObservedAt: number;
    readonly lastObservedAt: number;
}
export interface RecoveryLedgerSnapshot {
    readonly objectId: string;
    readonly dataShardCount: number;
    readonly parityShardCount: number;
    readonly recoveryThreshold: number;
    readonly requestIds: readonly string[];
    readonly shards: readonly RecoveryShardObservation[];
    readonly paths: readonly RecoveryPathObservation[];
}
export interface RecordShardObservationInput {
    readonly shardRole: RecoveryShardRole;
    readonly shardIndex: number;
    readonly digest: string;
    readonly requestId?: string;
    readonly observedBy?: string;
    readonly source?: string;
    readonly observedAt?: number;
}
export interface RecordPathObservationInput {
    readonly pathId: string;
    readonly status: RecoveryPathStatus;
    readonly requestId?: string;
    readonly observedBy?: string;
    readonly reason?: string;
    readonly observedAt?: number;
}
export interface RecoveryConflict {
    readonly shardRole: RecoveryShardRole;
    readonly shardIndex: number;
    readonly digests: readonly string[];
}
export interface RecoveryStatus {
    readonly objectId: string;
    readonly requestIds: readonly string[];
    readonly dataShardCount: number;
    readonly parityShardCount: number;
    readonly recoveryThreshold: number;
    readonly availableDataShards: readonly number[];
    readonly availableParityShards: readonly number[];
    readonly missingDataShards: readonly number[];
    readonly uniqueShardUnits: number;
    readonly directDataComplete: boolean;
    readonly canReconstruct: boolean;
    readonly needsParityDecode: boolean;
    readonly conflictingShards: readonly RecoveryConflict[];
    readonly failedPaths: readonly string[];
    readonly succeededPaths: readonly string[];
}
export declare class RecoveryLedger {
    private readonly objectId;
    private readonly dataShardCount;
    private readonly parityShardCount;
    private readonly recoveryThreshold;
    private readonly requestIds;
    private readonly shards;
    private readonly paths;
    constructor(config: RecoveryLedgerConfig | RecoveryLedgerSnapshot);
    static fromSnapshot(snapshot: RecoveryLedgerSnapshot): RecoveryLedger;
    getObjectId(): string;
    registerRequest(requestId: string): this;
    recordShardObservation(input: RecordShardObservationInput): this;
    recordPathObservation(input: RecordPathObservationInput): this;
    merge(other: RecoveryLedger | RecoveryLedgerSnapshot): this;
    getStatus(): RecoveryStatus;
    snapshot(): RecoveryLedgerSnapshot;
    private mergeShard;
    private mergePath;
    private getAvailableShardIndices;
    private getMissingDataShardIndices;
    private getPathsByStatus;
    private getConflicts;
    private assertCompatibleSnapshot;
    private assertShardIndex;
}
