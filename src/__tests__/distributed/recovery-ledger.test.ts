import { describe, expect, it } from 'vitest';

import { RecoveryLedger } from '../../distributed';

describe('RecoveryLedger', () => {
  it('coalesces request aliases and merges observations idempotently', () => {
    const left = new RecoveryLedger({
      objectId: 'asset:hero-js',
      dataShardCount: 4,
      parityShardCount: 2,
    });
    left.registerRequest('req-a');
    left.recordShardObservation({
      shardRole: 'data',
      shardIndex: 0,
      digest: 'd0',
      requestId: 'req-a',
      observedBy: 'edge-a',
      source: 'stream-1',
      observedAt: 10,
    });

    const right = new RecoveryLedger({
      objectId: 'asset:hero-js',
      dataShardCount: 4,
      parityShardCount: 2,
    });
    right.registerRequest('req-b');
    right.recordShardObservation({
      shardRole: 'data',
      shardIndex: 1,
      digest: 'd1',
      requestId: 'req-b',
      observedBy: 'edge-b',
      source: 'stream-2',
      observedAt: 20,
    });

    left.merge(right);
    left.merge(right.snapshot());

    const status = left.getStatus();
    expect(status.requestIds).toEqual(['req-a', 'req-b']);
    expect(status.availableDataShards).toEqual([0, 1]);
    expect(status.uniqueShardUnits).toBe(2);
  });

  it('declares direct reconstruction once every data shard is present', () => {
    const ledger = new RecoveryLedger({
      objectId: 'asset:style-css',
      dataShardCount: 3,
      parityShardCount: 1,
    });

    for (let shardIndex = 0; shardIndex < 3; shardIndex++) {
      ledger.recordShardObservation({
        shardRole: 'data',
        shardIndex,
        digest: `data-${shardIndex}`,
        requestId: 'req-css',
      });
    }

    const status = ledger.getStatus();
    expect(status.directDataComplete).toBe(true);
    expect(status.canReconstruct).toBe(true);
    expect(status.needsParityDecode).toBe(false);
    expect(status.missingDataShards).toEqual([]);
  });

  it('declares parity recovery once the threshold is met without every data shard', () => {
    const ledger = new RecoveryLedger({
      objectId: 'asset:app-js',
      dataShardCount: 4,
      parityShardCount: 2,
    });

    ledger.recordShardObservation({
      shardRole: 'data',
      shardIndex: 0,
      digest: 'data-0',
      requestId: 'req-1',
    });
    ledger.recordShardObservation({
      shardRole: 'data',
      shardIndex: 2,
      digest: 'data-2',
      requestId: 'req-2',
    });
    ledger.recordShardObservation({
      shardRole: 'parity',
      shardIndex: 0,
      digest: 'parity-0',
      requestId: 'req-1',
    });
    ledger.recordShardObservation({
      shardRole: 'parity',
      shardIndex: 1,
      digest: 'parity-1',
      requestId: 'req-2',
    });

    const status = ledger.getStatus();
    expect(status.directDataComplete).toBe(false);
    expect(status.canReconstruct).toBe(true);
    expect(status.needsParityDecode).toBe(true);
    expect(status.missingDataShards).toEqual([1, 3]);
  });

  it('treats conflicting shard digests as reconstruction blockers', () => {
    const ledger = new RecoveryLedger({
      objectId: 'asset:conflict',
      dataShardCount: 2,
      parityShardCount: 1,
    });

    ledger.recordShardObservation({
      shardRole: 'data',
      shardIndex: 0,
      digest: 'digest-a',
      observedBy: 'replica-a',
    });
    ledger.recordShardObservation({
      shardRole: 'data',
      shardIndex: 0,
      digest: 'digest-b',
      observedBy: 'replica-b',
    });
    ledger.recordShardObservation({
      shardRole: 'data',
      shardIndex: 1,
      digest: 'digest-1',
      observedBy: 'replica-a',
    });

    const status = ledger.getStatus();
    expect(status.conflictingShards).toEqual([
      {
        shardRole: 'data',
        shardIndex: 0,
        digests: ['digest-a', 'digest-b'],
      },
    ]);
    expect(status.canReconstruct).toBe(false);
  });

  it('merges path failure and success observations monotonically', () => {
    const ledger = new RecoveryLedger({
      objectId: 'asset:path-ledger',
      dataShardCount: 1,
      parityShardCount: 1,
    });

    ledger.recordPathObservation({
      pathId: 'udp-edge-a',
      status: 'failed',
      requestId: 'req-a',
      reason: 'timeout',
      observedBy: 'edge-a',
      observedAt: 10,
    });
    ledger.recordPathObservation({
      pathId: 'udp-edge-a',
      status: 'succeeded',
      requestId: 'req-b',
      observedBy: 'edge-b',
      observedAt: 20,
    });

    const status = ledger.getStatus();
    expect(status.failedPaths).toEqual([]);
    expect(status.succeededPaths).toEqual(['udp-edge-a']);
    expect(status.requestIds).toEqual(['req-a', 'req-b']);
  });
});
