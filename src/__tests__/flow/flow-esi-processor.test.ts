import { describe, it, expect } from 'vitest';
import { AeonFlowProtocol, FIN, VENT } from '../../flow';
import type { FlowTransport, FlowFrame } from '../../flow';

// ═══════════════════════════════════════════════════════════════════════════════
// Mock Transport (matches patterns from flow.test.ts)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Recording transport — captures all sent data, no delivery.
 * Used for tests where we drive the protocol locally.
 */
function createRecordingTransport(): FlowTransport & { sent: Uint8Array[] } {
  const transport = {
    sent: [] as Uint8Array[],
    send: (data: Uint8Array) => {
      transport.sent.push(data);
    },
    onReceive: (_handler: (data: Uint8Array) => void) => {},
    close: () => {},
  };
  return transport;
}

/**
 * In-memory linked transports for client/server testing.
 */
function createLinkedTransports(): [FlowTransport, FlowTransport] {
  let handlerA: ((data: Uint8Array) => void) | null = null;
  let handlerB: ((data: Uint8Array) => void) | null = null;

  const transportA: FlowTransport = {
    send: (data) => {
      if (handlerB) handlerB(data);
    },
    onReceive: (handler) => {
      handlerA = handler;
    },
    close: () => {
      handlerA = null;
    },
  };

  const transportB: FlowTransport = {
    send: (data) => {
      if (handlerA) handlerA(data);
    },
    onReceive: (handler) => {
      handlerB = handler;
    },
    close: () => {
      handlerB = null;
    },
  };

  return [transportA, transportB];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESI Flow Pattern Tests — fork/race/fold primitives
// ═══════════════════════════════════════════════════════════════════════════════

describe('Flow ESI Processor Pattern', () => {
  describe('fork/race for cache vs inference', () => {
    it('should race two streams and pick the winner', async () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      // Open parent and fork into 2 children (cache + inference)
      const parent = flow.openStream();
      const [cacheId, inferId] = flow.fork(parent, 2);

      // IMPORTANT: race() must be called BEFORE finish() — it returns a promise
      const racePromise = flow.race([cacheId, inferId]);

      // Cache wins first — send data then finish
      flow.send(cacheId, new TextEncoder().encode('cached response'));
      flow.finish(cacheId);

      const { winner, result } = await racePromise;

      expect(winner).toBe(cacheId);
      expect(new TextDecoder().decode(result)).toBe('cached response');

      // Inference stream should be vented (loser)
      const inferStream = flow.getStream(inferId);
      expect(inferStream?.state).toBe('vented');

      flow.destroy();
    });

    it('should pick inference when cache misses (vented)', async () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const parent = flow.openStream();
      const [cacheId, inferId] = flow.fork(parent, 2);

      // Race must be started before streams resolve
      const racePromise = flow.race([cacheId, inferId]);

      // Cache miss → vent the cache stream
      flow.vent(cacheId);

      // Inference returns
      flow.send(inferId, new TextEncoder().encode('inferred response'));
      flow.finish(inferId);

      const { winner, result } = await racePromise;

      expect(winner).toBe(inferId);
      expect(new TextDecoder().decode(result)).toBe('inferred response');

      flow.destroy();
    });

    it('should handle both streams failing via fold (graceful degradation)', async () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const parent = flow.openStream();
      const [cacheId, inferId] = flow.fork(parent, 2);

      // Use fold instead of race for all-fail case (fold handles all-vented)
      const foldPromise = flow.fold(
        [cacheId, inferId],
        (results: Map<number, Uint8Array>) => {
          // No results — return fallback marker
          if (results.size === 0) {
            return new TextEncoder().encode('FALLBACK');
          }
          // Return first result
          const first = results.values().next().value!;
          return first;
        }
      );

      // Both fail
      flow.vent(cacheId);
      flow.vent(inferId);

      const result = await foldPromise;
      expect(new TextDecoder().decode(result)).toBe('FALLBACK');

      flow.destroy();
    });
  });

  describe('batch processing with fork/fold', () => {
    it('should fork N directive streams and fold results', async () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const root = flow.openStream();
      const directiveIds = flow.fork(root, 3);

      // Start fold BEFORE finishing streams
      const foldPromise = flow.fold(
        directiveIds,
        (results: Map<number, Uint8Array>) => {
          const parts: string[] = [];
          for (const [, data] of Array.from(results.entries()).sort(
            ([a], [b]) => a - b
          )) {
            parts.push(new TextDecoder().decode(data));
          }
          return new TextEncoder().encode(parts.join('|'));
        }
      );

      // Simulate 3 directives completing
      flow.send(directiveIds[0], new TextEncoder().encode('result-0'));
      flow.finish(directiveIds[0]);

      flow.send(directiveIds[1], new TextEncoder().encode('result-1'));
      flow.finish(directiveIds[1]);

      flow.send(directiveIds[2], new TextEncoder().encode('result-2'));
      flow.finish(directiveIds[2]);

      const merged = await foldPromise;

      expect(new TextDecoder().decode(merged)).toBe(
        'result-0|result-1|result-2'
      );

      flow.destroy();
    });

    it('should handle partial failures in fold', async () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const root = flow.openStream();
      const directiveIds = flow.fork(root, 3);

      // Start fold BEFORE resolving streams
      const foldPromise = flow.fold(
        directiveIds,
        (results: Map<number, Uint8Array>) => {
          const parts: string[] = [];
          for (const [, data] of results) {
            parts.push(new TextDecoder().decode(data));
          }
          return new TextEncoder().encode(parts.sort().join('|'));
        }
      );

      // 2 succeed, 1 fails
      flow.send(directiveIds[0], new TextEncoder().encode('result-0'));
      flow.finish(directiveIds[0]);

      flow.vent(directiveIds[1]); // This one fails

      flow.send(directiveIds[2], new TextEncoder().encode('result-2'));
      flow.finish(directiveIds[2]);

      const merged = await foldPromise;
      const text = new TextDecoder().decode(merged);

      // Only the 2 successful streams contribute
      expect(text).toContain('result-0');
      expect(text).toContain('result-2');

      flow.destroy();
    });
  });

  describe('nested fork/race pattern (per-directive cache race)', () => {
    it('should fork per directive then race cache/inference within each', async () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const root = flow.openStream();
      const directiveIds = flow.fork(root, 2);

      // Directive 0: fork into cache + inference
      const [d0Cache, d0Infer] = flow.fork(directiveIds[0], 2);
      const race0 = flow.race([d0Cache, d0Infer]);

      // Directive 1: fork into cache + inference
      const [d1Cache, d1Infer] = flow.fork(directiveIds[1], 2);
      const race1 = flow.race([d1Cache, d1Infer]);

      // Directive 0: cache wins
      flow.send(d0Cache, new TextEncoder().encode('d0-cached'));
      flow.finish(d0Cache);

      // Directive 1: cache misses, inference wins
      flow.vent(d1Cache);
      flow.send(d1Infer, new TextEncoder().encode('d1-inferred'));
      flow.finish(d1Infer);

      const r0 = await race0;
      const r1 = await race1;

      expect(new TextDecoder().decode(r0.result)).toBe('d0-cached');
      expect(r0.winner).toBe(d0Cache);

      expect(new TextDecoder().decode(r1.result)).toBe('d1-inferred');
      expect(r1.winner).toBe(d1Infer);

      flow.destroy();
    });
  });

  describe('vent propagation', () => {
    it('should vent all children when parent is vented', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const root = flow.openStream();
      const children = flow.fork(root, 3);

      // Vent the parent
      flow.vent(root);

      // All children should be vented
      for (const childId of children) {
        const stream = flow.getStream(childId);
        expect(stream?.state).toBe('vented');
      }

      flow.destroy();
    });

    it('should vent grandchildren when parent is vented', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const root = flow.openStream();
      const children = flow.fork(root, 2);
      const grandchildren = flow.fork(children[0], 2);

      // Vent root
      flow.vent(root);

      // Everything should be vented
      for (const childId of children) {
        expect(flow.getStream(childId)?.state).toBe('vented');
      }
      for (const gcId of grandchildren) {
        expect(flow.getStream(gcId)?.state).toBe('vented');
      }

      flow.destroy();
    });
  });

  describe('stream lifecycle', () => {
    it('should track active streams correctly', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const s0 = flow.openStream();
      const s2 = flow.openStream();
      const s4 = flow.openStream();

      expect(flow.getActiveStreams().length).toBe(3);

      flow.finish(s0);
      expect(flow.getActiveStreams().length).toBe(2);

      flow.vent(s2);
      expect(flow.getActiveStreams().length).toBe(1);

      flow.finish(s4);
      expect(flow.getActiveStreams().length).toBe(0);

      flow.destroy();
    });

    it('should allocate even stream IDs for client role', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport, { role: 'client' });

      const s0 = flow.openStream();
      const s1 = flow.openStream();
      const s2 = flow.openStream();

      expect(s0 % 2).toBe(0);
      expect(s1 % 2).toBe(0);
      expect(s2 % 2).toBe(0);

      flow.destroy();
    });

    it('should allocate odd stream IDs for server role', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport, { role: 'server' });

      const s0 = flow.openStream();
      const s1 = flow.openStream();

      expect(s0 % 2).toBe(1);
      expect(s1 % 2).toBe(1);

      flow.destroy();
    });
  });

  describe('onFrame / onStreamEnd / onStreamVented handlers', () => {
    it('should fire frame handler when data arrives via linked transport', () => {
      const [tA, tB] = createLinkedTransports();
      const client = new AeonFlowProtocol(tA, { role: 'client' });
      const server = new AeonFlowProtocol(tB, { role: 'server' });

      // Client opens a stream and sends data
      const streamId = client.openStream();

      // Server registers a frame handler on the same stream ID
      // (auto-created when the frame arrives via transport)
      const frames: FlowFrame[] = [];
      // Send first to auto-create the stream on server, then listen
      client.send(streamId, new TextEncoder().encode('hello'));

      // Verify the server auto-created the stream
      const serverStream = server.getStream(streamId);
      expect(serverStream).toBeDefined();

      // Now register handler and send another frame
      server.onFrame(streamId, (f) => frames.push(f));
      client.send(streamId, new TextEncoder().encode('world'));

      expect(frames.length).toBe(1);
      expect(new TextDecoder().decode(frames[0].payload)).toBe('world');

      client.destroy();
      server.destroy();
    });

    it('should fire end handler on FIN', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const streamId = flow.openStream();
      let ended = false;
      flow.onStreamEnd(streamId, () => {
        ended = true;
      });

      flow.finish(streamId);
      expect(ended).toBe(true);

      flow.destroy();
    });

    it('should fire vent handler on VENT', () => {
      const transport = createRecordingTransport();
      const flow = new AeonFlowProtocol(transport);

      const streamId = flow.openStream();
      let vented = false;
      flow.onStreamVented(streamId, () => {
        vented = true;
      });

      flow.vent(streamId);
      expect(vented).toBe(true);

      flow.destroy();
    });

    it('should return unsubscriber from onFrame via linked transport', () => {
      const [tA, tB] = createLinkedTransports();
      const client = new AeonFlowProtocol(tA, { role: 'client' });
      const server = new AeonFlowProtocol(tB, { role: 'server' });

      const streamId = client.openStream();

      // Send once to auto-create stream on server
      client.send(streamId, new TextEncoder().encode('init'));

      let callCount = 0;
      const unsub = server.onFrame(streamId, () => {
        callCount++;
      });

      client.send(streamId, new TextEncoder().encode('a'));
      expect(callCount).toBe(1);

      unsub();

      client.send(streamId, new TextEncoder().encode('b'));
      expect(callCount).toBe(1); // No change after unsub

      client.destroy();
      server.destroy();
    });
  });
});
