/**
 * Recovery Ledger
 *
 * Monotone request-recovery state for sharded object delivery.
 *
 * The ledger does not store the payload bytes themselves. It stores the
 * convergent facts needed to decide whether an object can be reconstructed:
 * - which request IDs alias the same object fetch
 * - which data/parity shards have been observed
 * - which paths have already succeeded or failed
 * - whether conflicting shard digests make reconstruction unsafe
 *
 * This is the "shared state without shared mutable state" surface:
 * every peer can observe partial delivery and merge those observations
 * without coordination. Reconstruction becomes legal once the merged
 * observation crosses the configured threshold.
 */

export type RecoveryShardRole = 'data' | 'parity';
export type RecoveryPathStatus = 'succeeded' | 'failed';

export interface RecoveryLedgerConfig {
  readonly objectId: string;
  readonly dataShardCount: number;
  readonly parityShardCount?: number;
  /**
   * Number of unique shard units required to reconstruct the object.
   * Defaults to `dataShardCount`, which matches MDS-style parity coding.
   */
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

interface MutableRecoveryShardObservation {
  shardRole: RecoveryShardRole;
  shardIndex: number;
  digests: Set<string>;
  requestIds: Set<string>;
  observedBy: Set<string>;
  sources: Set<string>;
  firstObservedAt: number;
  lastObservedAt: number;
}

interface MutableRecoveryPathObservation {
  pathId: string;
  status: RecoveryPathStatus;
  requestIds: Set<string>;
  observedBy: Set<string>;
  reasons: Set<string>;
  firstObservedAt: number;
  lastObservedAt: number;
}

function createShardKey(
  shardRole: RecoveryShardRole,
  shardIndex: number
): string {
  return `${shardRole}:${shardIndex}`;
}

function sortStrings(values: Iterable<string>): string[] {
  return [...values].sort();
}

function clampObservedAt(observedAt: number | undefined): number {
  return Number.isFinite(observedAt) ? observedAt! : Date.now();
}

export class RecoveryLedger {
  private readonly objectId: string;
  private readonly dataShardCount: number;
  private readonly parityShardCount: number;
  private readonly recoveryThreshold: number;
  private readonly requestIds = new Set<string>();
  private readonly shards = new Map<string, MutableRecoveryShardObservation>();
  private readonly paths = new Map<string, MutableRecoveryPathObservation>();

  constructor(config: RecoveryLedgerConfig | RecoveryLedgerSnapshot) {
    this.objectId = config.objectId;
    this.dataShardCount = config.dataShardCount;
    this.parityShardCount = config.parityShardCount ?? 0;
    this.recoveryThreshold = config.recoveryThreshold ?? config.dataShardCount;

    if (this.dataShardCount <= 0) {
      throw new Error('dataShardCount must be greater than 0');
    }

    const maximumShardUnits = this.dataShardCount + this.parityShardCount;
    if (
      this.recoveryThreshold <= 0 ||
      this.recoveryThreshold > maximumShardUnits
    ) {
      throw new Error(
        'recoveryThreshold must be between 1 and the total number of shard units'
      );
    }

    if ('shards' in config) {
      this.merge(config);
    }
  }

  static fromSnapshot(snapshot: RecoveryLedgerSnapshot): RecoveryLedger {
    return new RecoveryLedger(snapshot);
  }

  getObjectId(): string {
    return this.objectId;
  }

  registerRequest(requestId: string): this {
    if (requestId) {
      this.requestIds.add(requestId);
    }
    return this;
  }

  recordShardObservation(input: RecordShardObservationInput): this {
    this.assertShardIndex(input.shardRole, input.shardIndex);

    const shardKey = createShardKey(input.shardRole, input.shardIndex);
    const observedAt = clampObservedAt(input.observedAt);
    let shard = this.shards.get(shardKey);

    if (!shard) {
      shard = {
        shardRole: input.shardRole,
        shardIndex: input.shardIndex,
        digests: new Set(),
        requestIds: new Set(),
        observedBy: new Set(),
        sources: new Set(),
        firstObservedAt: observedAt,
        lastObservedAt: observedAt,
      };
      this.shards.set(shardKey, shard);
    }

    shard.digests.add(input.digest);
    if (input.requestId) {
      shard.requestIds.add(input.requestId);
      this.requestIds.add(input.requestId);
    }
    if (input.observedBy) {
      shard.observedBy.add(input.observedBy);
    }
    if (input.source) {
      shard.sources.add(input.source);
    }
    shard.firstObservedAt = Math.min(shard.firstObservedAt, observedAt);
    shard.lastObservedAt = Math.max(shard.lastObservedAt, observedAt);

    return this;
  }

  recordPathObservation(input: RecordPathObservationInput): this {
    const observedAt = clampObservedAt(input.observedAt);
    let path = this.paths.get(input.pathId);

    if (!path) {
      path = {
        pathId: input.pathId,
        status: input.status,
        requestIds: new Set(),
        observedBy: new Set(),
        reasons: new Set(),
        firstObservedAt: observedAt,
        lastObservedAt: observedAt,
      };
      this.paths.set(input.pathId, path);
    }

    if (path.status !== input.status) {
      // Success dominates failure because it carries the stronger observation:
      // this path eventually delivered useful work.
      path.status =
        path.status === 'succeeded' || input.status === 'succeeded'
          ? 'succeeded'
          : 'failed';
    }

    if (input.requestId) {
      path.requestIds.add(input.requestId);
      this.requestIds.add(input.requestId);
    }
    if (input.observedBy) {
      path.observedBy.add(input.observedBy);
    }
    if (input.reason) {
      path.reasons.add(input.reason);
    }
    path.firstObservedAt = Math.min(path.firstObservedAt, observedAt);
    path.lastObservedAt = Math.max(path.lastObservedAt, observedAt);

    return this;
  }

  merge(other: RecoveryLedger | RecoveryLedgerSnapshot): this {
    const snapshot = other instanceof RecoveryLedger ? other.snapshot() : other;
    this.assertCompatibleSnapshot(snapshot);

    for (const requestId of snapshot.requestIds) {
      this.requestIds.add(requestId);
    }

    for (const shard of snapshot.shards) {
      this.mergeShard(shard);
    }

    for (const path of snapshot.paths) {
      this.mergePath(path);
    }

    return this;
  }

  getStatus(): RecoveryStatus {
    const availableDataShards = this.getAvailableShardIndices('data');
    const availableParityShards = this.getAvailableShardIndices('parity');
    const missingDataShards = this.getMissingDataShardIndices();
    const conflictingShards = this.getConflicts();
    const uniqueShardUnits =
      availableDataShards.length + availableParityShards.length;
    const directDataComplete =
      availableDataShards.length === this.dataShardCount;
    const canReconstruct =
      conflictingShards.length === 0 &&
      (directDataComplete || uniqueShardUnits >= this.recoveryThreshold);
    const needsParityDecode = canReconstruct && !directDataComplete;

    return {
      objectId: this.objectId,
      requestIds: sortStrings(this.requestIds),
      dataShardCount: this.dataShardCount,
      parityShardCount: this.parityShardCount,
      recoveryThreshold: this.recoveryThreshold,
      availableDataShards,
      availableParityShards,
      missingDataShards,
      uniqueShardUnits,
      directDataComplete,
      canReconstruct,
      needsParityDecode,
      conflictingShards,
      failedPaths: this.getPathsByStatus('failed'),
      succeededPaths: this.getPathsByStatus('succeeded'),
    };
  }

  snapshot(): RecoveryLedgerSnapshot {
    const shards = [...this.shards.values()]
      .sort((left, right) => {
        if (left.shardRole !== right.shardRole) {
          return left.shardRole.localeCompare(right.shardRole);
        }
        return left.shardIndex - right.shardIndex;
      })
      .map((shard) => ({
        shardRole: shard.shardRole,
        shardIndex: shard.shardIndex,
        digests: sortStrings(shard.digests),
        requestIds: sortStrings(shard.requestIds),
        observedBy: sortStrings(shard.observedBy),
        sources: sortStrings(shard.sources),
        firstObservedAt: shard.firstObservedAt,
        lastObservedAt: shard.lastObservedAt,
      }));
    const paths = [...this.paths.values()]
      .sort((left, right) => left.pathId.localeCompare(right.pathId))
      .map((path) => ({
        pathId: path.pathId,
        status: path.status,
        requestIds: sortStrings(path.requestIds),
        observedBy: sortStrings(path.observedBy),
        reasons: sortStrings(path.reasons),
        firstObservedAt: path.firstObservedAt,
        lastObservedAt: path.lastObservedAt,
      }));

    return {
      objectId: this.objectId,
      dataShardCount: this.dataShardCount,
      parityShardCount: this.parityShardCount,
      recoveryThreshold: this.recoveryThreshold,
      requestIds: sortStrings(this.requestIds),
      shards,
      paths,
    };
  }

  private mergeShard(shard: RecoveryShardObservation): void {
    this.assertShardIndex(shard.shardRole, shard.shardIndex);

    const key = createShardKey(shard.shardRole, shard.shardIndex);
    const existing = this.shards.get(key);

    if (!existing) {
      this.shards.set(key, {
        shardRole: shard.shardRole,
        shardIndex: shard.shardIndex,
        digests: new Set(shard.digests),
        requestIds: new Set(shard.requestIds),
        observedBy: new Set(shard.observedBy),
        sources: new Set(shard.sources),
        firstObservedAt: shard.firstObservedAt,
        lastObservedAt: shard.lastObservedAt,
      });
      return;
    }

    for (const digest of shard.digests) {
      existing.digests.add(digest);
    }
    for (const requestId of shard.requestIds) {
      existing.requestIds.add(requestId);
      this.requestIds.add(requestId);
    }
    for (const observer of shard.observedBy) {
      existing.observedBy.add(observer);
    }
    for (const source of shard.sources) {
      existing.sources.add(source);
    }
    existing.firstObservedAt = Math.min(
      existing.firstObservedAt,
      shard.firstObservedAt
    );
    existing.lastObservedAt = Math.max(
      existing.lastObservedAt,
      shard.lastObservedAt
    );
  }

  private mergePath(path: RecoveryPathObservation): void {
    const existing = this.paths.get(path.pathId);

    if (!existing) {
      this.paths.set(path.pathId, {
        pathId: path.pathId,
        status: path.status,
        requestIds: new Set(path.requestIds),
        observedBy: new Set(path.observedBy),
        reasons: new Set(path.reasons),
        firstObservedAt: path.firstObservedAt,
        lastObservedAt: path.lastObservedAt,
      });
      for (const requestId of path.requestIds) {
        this.requestIds.add(requestId);
      }
      return;
    }

    existing.status =
      existing.status === 'succeeded' || path.status === 'succeeded'
        ? 'succeeded'
        : 'failed';
    for (const requestId of path.requestIds) {
      existing.requestIds.add(requestId);
      this.requestIds.add(requestId);
    }
    for (const observer of path.observedBy) {
      existing.observedBy.add(observer);
    }
    for (const reason of path.reasons) {
      existing.reasons.add(reason);
    }
    existing.firstObservedAt = Math.min(
      existing.firstObservedAt,
      path.firstObservedAt
    );
    existing.lastObservedAt = Math.max(
      existing.lastObservedAt,
      path.lastObservedAt
    );
  }

  private getAvailableShardIndices(role: RecoveryShardRole): number[] {
    return [...this.shards.values()]
      .filter((shard) => shard.shardRole === role)
      .map((shard) => shard.shardIndex)
      .sort((left, right) => left - right);
  }

  private getMissingDataShardIndices(): number[] {
    const available = new Set(this.getAvailableShardIndices('data'));
    const missing: number[] = [];

    for (let shardIndex = 0; shardIndex < this.dataShardCount; shardIndex++) {
      if (!available.has(shardIndex)) {
        missing.push(shardIndex);
      }
    }

    return missing;
  }

  private getPathsByStatus(status: RecoveryPathStatus): string[] {
    return [...this.paths.values()]
      .filter((path) => path.status === status)
      .map((path) => path.pathId)
      .sort();
  }

  private getConflicts(): RecoveryConflict[] {
    return [...this.shards.values()]
      .filter((shard) => shard.digests.size > 1)
      .map((shard) => ({
        shardRole: shard.shardRole,
        shardIndex: shard.shardIndex,
        digests: sortStrings(shard.digests),
      }))
      .sort((left, right) => {
        if (left.shardRole !== right.shardRole) {
          return left.shardRole.localeCompare(right.shardRole);
        }
        return left.shardIndex - right.shardIndex;
      });
  }

  private assertCompatibleSnapshot(snapshot: RecoveryLedgerSnapshot): void {
    if (snapshot.objectId !== this.objectId) {
      throw new Error(
        `RecoveryLedger object mismatch: expected ${this.objectId}, received ${snapshot.objectId}`
      );
    }
    if (snapshot.dataShardCount !== this.dataShardCount) {
      throw new Error('RecoveryLedger dataShardCount mismatch');
    }
    if (snapshot.parityShardCount !== this.parityShardCount) {
      throw new Error('RecoveryLedger parityShardCount mismatch');
    }
    if (snapshot.recoveryThreshold !== this.recoveryThreshold) {
      throw new Error('RecoveryLedger recoveryThreshold mismatch');
    }
  }

  private assertShardIndex(role: RecoveryShardRole, shardIndex: number): void {
    const upperBound =
      role === 'data' ? this.dataShardCount : this.parityShardCount;
    if (
      !Number.isInteger(shardIndex) ||
      shardIndex < 0 ||
      shardIndex >= upperBound
    ) {
      throw new Error(`Invalid ${role} shard index ${shardIndex}`);
    }
  }
}
