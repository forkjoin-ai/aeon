import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FlowCodec,
  HEADER_SIZE,
  MAX_PAYLOAD_LENGTH,
  AeonFlowProtocol,
  FORK,
  RACE,
  FOLD,
  VENT,
  FIN,
  POISON,
} from '../../flow';
import type { FlowFrame, FlowTransport } from '../../flow';

// ═══════════════════════════════════════════════════════════════════════════════
// Mock Transport
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * In-memory transport that connects two protocol instances.
 * Calling send() on one side delivers to the other's onReceive handler.
 */
function createLinkedTransports(): [FlowTransport, FlowTransport] {
  let handlerA: ((data: Uint8Array) => void) | null = null;
  let handlerB: ((data: Uint8Array) => void) | null = null;

  const transportA: FlowTransport = {
    send: (data) => {
      // A sends → B receives
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
      // B sends → A receives
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

/**
 * Simple loopback transport — sends arrive at own handler.
 */
function createLoopbackTransport(): FlowTransport {
  let handler: ((data: Uint8Array) => void) | null = null;
  return {
    send: (data) => {
      if (handler) handler(data);
    },
    onReceive: (h) => {
      handler = h;
    },
    close: () => {
      handler = null;
    },
  };
}

/**
 * Recording transport that captures all sent data.
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

// ═══════════════════════════════════════════════════════════════════════════════
// Codec Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('FlowCodec', () => {
  let codec: FlowCodec;

  beforeEach(() => {
    codec = FlowCodec.createSync();
  });

  describe('encode/decode roundtrip', () => {
    it('should roundtrip a basic frame', () => {
      const frame: FlowFrame = {
        streamId: 42,
        sequence: 7,
        flags: FORK | RACE,
        payload: new Uint8Array([1, 2, 3, 4, 5]),
      };

      const encoded = codec.encode(frame);
      expect(encoded.length).toBe(HEADER_SIZE + 5);

      const { frame: decoded, bytesRead } = codec.decode(encoded);
      expect(bytesRead).toBe(HEADER_SIZE + 5);
      expect(decoded.streamId).toBe(42);
      expect(decoded.sequence).toBe(7);
      expect(decoded.flags).toBe(FORK | RACE);
      expect(Array.from(decoded.payload)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should roundtrip an empty payload', () => {
      const frame: FlowFrame = {
        streamId: 0,
        sequence: 0,
        flags: FIN,
        payload: new Uint8Array(0),
      };

      const encoded = codec.encode(frame);
      expect(encoded.length).toBe(HEADER_SIZE);

      const { frame: decoded } = codec.decode(encoded);
      expect(decoded.streamId).toBe(0);
      expect(decoded.sequence).toBe(0);
      expect(decoded.flags).toBe(FIN);
      expect(decoded.payload.length).toBe(0);
    });

    it('should roundtrip max u16 stream ID', () => {
      const frame: FlowFrame = {
        streamId: 0xffff,
        sequence: 0xffffffff,
        flags: 0xff,
        payload: new Uint8Array([0xde, 0xad]),
      };

      const encoded = codec.encode(frame);
      const { frame: decoded } = codec.decode(encoded);
      expect(decoded.streamId).toBe(0xffff);
      expect(decoded.sequence).toBe(0xffffffff);
      expect(decoded.flags).toBe(0xff);
    });

    it('should roundtrip inference-sized payload (16KB hidden states)', () => {
      // 4096 × f32 = 16,384 bytes — typical transformer hidden state
      const payload = new Uint8Array(16384);
      for (let i = 0; i < payload.length; i++) {
        payload[i] = i & 0xff;
      }

      const frame: FlowFrame = {
        streamId: 100,
        sequence: 1,
        flags: 0,
        payload,
      };

      const encoded = codec.encode(frame);
      const { frame: decoded } = codec.decode(encoded);
      expect(decoded.payload.length).toBe(16384);
      expect(decoded.payload[0]).toBe(0);
      expect(decoded.payload[255]).toBe(255);
      expect(decoded.payload[256]).toBe(0);
    });
  });

  describe('poison handling', () => {
    it('notifies poison handlers when a stream is poisoned', () => {
      const transport = createLoopbackTransport();
      const protocol = new AeonFlowProtocol(transport, { role: 'client' });
      const codec = FlowCodec.createSync();
      const poisoned = vi.fn();

      protocol.onStreamPoisoned(2, poisoned);
      transport.send(
        codec.encode({
          streamId: 2,
          sequence: 0,
          flags: POISON,
          payload: new Uint8Array(0),
        })
      );

      expect(poisoned).toHaveBeenCalledOnce();
      expect(protocol.getStream(2)?.state).toBe('vented');
    });

    it('sends a poison frame when poisoning a local stream', () => {
      const transport = createRecordingTransport();
      const protocol = new AeonFlowProtocol(transport, { role: 'client' });
      const codec = FlowCodec.createSync();
      const poisoned = vi.fn();
      const vented = vi.fn();

      const streamId = protocol.openStream();
      protocol.onStreamPoisoned(streamId, poisoned);
      protocol.onStreamVented(streamId, vented);

      protocol.poison(streamId);

      expect(poisoned).toHaveBeenCalledOnce();
      expect(vented).toHaveBeenCalledOnce();
      expect(protocol.getStream(streamId)?.state).toBe('vented');
      expect(transport.sent).toHaveLength(1);

      const { frame } = codec.decode(transport.sent[0]);
      expect(frame.streamId).toBe(streamId);
      expect(frame.flags).toBe(POISON);
      expect(frame.payload).toHaveLength(0);
    });
  });

  describe('u24 length boundary', () => {
    it('should handle length = 0', () => {
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array(0),
      };
      const encoded = codec.encode(frame);
      // Check u24 bytes are all zero
      expect(encoded[7]).toBe(0);
      expect(encoded[8]).toBe(0);
      expect(encoded[9]).toBe(0);
    });

    it('should handle length = 256 (crosses byte boundary)', () => {
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array(256),
      };
      const encoded = codec.encode(frame);
      expect(encoded[7]).toBe(0);
      expect(encoded[8]).toBe(1); // 256 >> 8
      expect(encoded[9]).toBe(0); // 256 & 0xFF
    });

    it('should handle length = 65536 (crosses u16 boundary)', () => {
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array(65536),
      };
      const encoded = codec.encode(frame);
      expect(encoded[7]).toBe(1); // 65536 >> 16
      expect(encoded[8]).toBe(0);
      expect(encoded[9]).toBe(0);
    });

    it('should reject payload exceeding MAX_PAYLOAD_LENGTH', () => {
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array(MAX_PAYLOAD_LENGTH + 1),
      };
      expect(() => codec.encode(frame)).toThrow('exceeds maximum');
    });
  });

  describe('zerocopy verify', () => {
    it('should return payload as a view into the original buffer', () => {
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array([10, 20, 30]),
      };

      const encoded = codec.encode(frame);
      const { frame: decoded } = codec.decode(encoded);

      // The decoded payload should share the same ArrayBuffer
      expect(decoded.payload.buffer).toBe(encoded.buffer);

      // Mutating the original buffer should be visible through the payload view
      encoded[HEADER_SIZE] = 99;
      expect(decoded.payload[0]).toBe(99);
    });
  });

  describe('batch encode/decode', () => {
    it('should roundtrip multiple frames', () => {
      const frames: FlowFrame[] = [
        { streamId: 0, sequence: 0, flags: FORK, payload: new Uint8Array([1]) },
        { streamId: 0, sequence: 1, flags: 0, payload: new Uint8Array([2, 3]) },
        { streamId: 2, sequence: 0, flags: FIN, payload: new Uint8Array(0) },
      ];

      const batch = codec.encodeBatch(frames);
      const decoded = codec.decodeBatch(batch);

      expect(decoded.length).toBe(3);
      expect(decoded[0].streamId).toBe(0);
      expect(decoded[0].flags).toBe(FORK);
      expect(Array.from(decoded[0].payload)).toEqual([1]);
      expect(decoded[1].sequence).toBe(1);
      expect(Array.from(decoded[1].payload)).toEqual([2, 3]);
      expect(decoded[2].streamId).toBe(2);
      expect(decoded[2].flags).toBe(FIN);
      expect(decoded[2].payload.length).toBe(0);
    });

    it('should handle empty batch', () => {
      const batch = codec.encodeBatch([]);
      expect(batch.length).toBe(0);

      const decoded = codec.decodeBatch(batch);
      expect(decoded.length).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should throw on truncated header', () => {
      expect(() => codec.decode(new Uint8Array(5))).toThrow('Buffer too small');
    });

    it('should throw on truncated payload', () => {
      // Header claims 100 bytes but buffer only has 5 after header
      const buf = new Uint8Array(HEADER_SIZE + 5);
      buf[9] = 100; // length = 100
      expect(() => codec.decode(buf)).toThrow('Buffer too small for payload');
    });

    it('should throw on truncated batch', () => {
      // Valid frame followed by 3 orphan bytes
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array([1]),
      };
      const encoded = codec.encode(frame);
      const truncated = new Uint8Array(encoded.length + 3);
      truncated.set(encoded);
      truncated.set([0xde, 0xad, 0xbe], encoded.length);

      expect(() => codec.decodeBatch(truncated)).toThrow('Truncated frame');
    });
  });

  describe('async create', () => {
    it('should create a codec with graceful fallback', async () => {
      const c = await FlowCodec.create();
      expect(typeof c.isWasmAccelerated).toBe('boolean');

      // Should still work correctly
      const frame: FlowFrame = {
        streamId: 1,
        sequence: 2,
        flags: RACE,
        payload: new Uint8Array([42]),
      };
      const encoded = c.encode(frame);
      const { frame: decoded } = c.decode(encoded);
      expect(decoded.streamId).toBe(1);
    });

    it('should fallback to JS on invalid wasm in auto mode', async () => {
      const c = await FlowCodec.create({
        wasmModule: new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
      });
      expect(c.isWasmAccelerated).toBe(false);
    });

    it('should throw in force mode when wasm is invalid', async () => {
      await expect(
        FlowCodec.create({
          wasmMode: 'force',
          wasmModule: new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
        })
      ).rejects.toThrow();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Stream Lifecycle Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — stream lifecycle', () => {
  it('should open a stream with client-initiated even ID', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport, { role: 'client' });

    const id = protocol.openStream();
    expect(id % 2).toBe(0); // Even
    expect(protocol.getStream(id)?.state).toBe('open');

    protocol.destroy();
  });

  it('should skip background codec upgrades when codecWasmMode is off', () => {
    const transport = createRecordingTransport();
    const createSpy = vi.spyOn(FlowCodec, 'create');
    const protocol = new AeonFlowProtocol(transport, {
      codecWasmMode: 'off',
      role: 'client',
    });

    expect(createSpy).not.toHaveBeenCalled();

    protocol.destroy();
    createSpy.mockRestore();
  });

  it('should open a stream with server-initiated odd ID', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport, { role: 'server' });

    const id = protocol.openStream();
    expect(id % 2).toBe(1); // Odd
    expect(protocol.getStream(id)?.state).toBe('open');

    protocol.destroy();
  });

  it('should close a stream via finish()', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const id = protocol.openStream();
    const endSpy = vi.fn();
    protocol.onStreamEnd(id, endSpy);

    protocol.finish(id);
    expect(protocol.getStream(id)?.state).toBe('closed');
    expect(endSpy).toHaveBeenCalledTimes(1);

    protocol.destroy();
  });

  it('should vent a stream and propagate to children', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const [child1, child2] = protocol.fork(parent, 2);

    const parentVentSpy = vi.fn();
    const child1VentSpy = vi.fn();
    const child2VentSpy = vi.fn();

    protocol.onStreamVented(parent, parentVentSpy);
    protocol.onStreamVented(child1, child1VentSpy);
    protocol.onStreamVented(child2, child2VentSpy);

    protocol.vent(parent);

    expect(protocol.getStream(parent)?.state).toBe('vented');
    expect(protocol.getStream(child1)?.state).toBe('vented');
    expect(protocol.getStream(child2)?.state).toBe('vented');
    expect(parentVentSpy).toHaveBeenCalledTimes(1);
    expect(child1VentSpy).toHaveBeenCalledTimes(1);
    expect(child2VentSpy).toHaveBeenCalledTimes(1);

    protocol.destroy();
  });

  it('should not vent an already closed stream', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const id = protocol.openStream();
    protocol.finish(id);

    const ventSpy = vi.fn();
    protocol.onStreamVented(id, ventSpy);
    protocol.vent(id);

    expect(ventSpy).not.toHaveBeenCalled();

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Fork Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — fork', () => {
  it('should fork a stream into N children', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const children = protocol.fork(parent, 3);

    expect(children.length).toBe(3);
    expect(protocol.getStream(parent)?.children).toEqual(children);

    for (const child of children) {
      const stream = protocol.getStream(child);
      expect(stream?.state).toBe('open');
      expect(stream?.parent).toBe(parent);
    }

    protocol.destroy();
  });

  it('should reject fork count < 1', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    expect(() => protocol.fork(parent, 0)).toThrow('at least 1');

    protocol.destroy();
  });

  it('should reject fork if it would exceed maxConcurrentStreams', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport, {
      maxConcurrentStreams: 5,
    });

    const parent = protocol.openStream(); // 1 stream
    protocol.fork(parent, 3); // 4 streams total

    expect(() => protocol.fork(parent, 2)).toThrow('maxConcurrentStreams');

    protocol.destroy();
  });

  it('should send FORK frame over transport', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const children = protocol.fork(parent, 2);

    // The transport should have received encoded frames
    expect(transport.sent.length).toBeGreaterThan(0);

    // Decode the sent frame to verify it has FORK flag
    const codec = FlowCodec.createSync();
    const { frame } = codec.decode(transport.sent[transport.sent.length - 1]);
    expect(frame.flags & FORK).toBeTruthy();
    expect(frame.streamId).toBe(parent);

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Race Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — race', () => {
  it('should race streams and resolve with winner', async () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const [s1, s2, s3] = protocol.fork(parent, 3);

    const racePromise = protocol.race([s1, s2, s3]);

    // Stream 2 finishes first with payload
    protocol.send(s2, new Uint8Array([42, 43]));
    protocol.finish(s2);

    const { winner, result } = await racePromise;
    expect(winner).toBe(s2);
    expect(Array.from(result)).toEqual([42, 43]);

    // Losers should be vented
    expect(protocol.getStream(s1)?.state).toBe('vented');
    expect(protocol.getStream(s3)?.state).toBe('vented');

    protocol.destroy();
  });

  it('should reject race with fewer than 2 streams', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const s1 = protocol.openStream();
    expect(() => protocol.race([s1])).toThrow('at least 2');

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Fold Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — fold', () => {
  it('should fold multiple streams via merger function', async () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const [s1, s2, s3] = protocol.fork(parent, 3);

    const foldPromise = protocol.fold([s1, s2, s3], (results) => {
      // Concatenate all results in stream-id order
      const sorted = Array.from(results.entries()).sort(([a], [b]) => a - b);
      let totalLen = 0;
      for (const [, v] of sorted) totalLen += v.length;
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const [, v] of sorted) {
        merged.set(v, offset);
        offset += v.length;
      }
      return merged;
    });

    // All three complete with different data
    protocol.send(s1, new Uint8Array([1]));
    protocol.finish(s1);

    protocol.send(s2, new Uint8Array([2]));
    protocol.finish(s2);

    protocol.send(s3, new Uint8Array([3]));
    protocol.finish(s3);

    const merged = await foldPromise;
    expect(Array.from(merged)).toEqual([1, 2, 3]);

    protocol.destroy();
  });

  it('should handle vented streams in fold (they contribute nothing)', async () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const [s1, s2] = protocol.fork(parent, 2);

    const foldPromise = protocol.fold([s1, s2], (results) => {
      // Only non-vented results appear in the map
      let totalLen = 0;
      for (const v of results.values()) totalLen += v.length;
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const v of results.values()) {
        merged.set(v, offset);
        offset += v.length;
      }
      return merged;
    });

    // s1 completes normally
    protocol.send(s1, new Uint8Array([10, 20]));
    protocol.finish(s1);

    // s2 is vented
    protocol.vent(s2);

    const merged = await foldPromise;
    expect(Array.from(merged)).toEqual([10, 20]);

    protocol.destroy();
  });

  it('should handle all streams vented in fold', async () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const [s1, s2] = protocol.fork(parent, 2);

    const foldPromise = protocol.fold([s1, s2], (results) => {
      // No results — return empty
      return new Uint8Array(0);
    });

    protocol.vent(s1);
    protocol.vent(s2);

    const merged = await foldPromise;
    expect(merged.length).toBe(0);

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Backpressure Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — backpressure', () => {
  it('should throw when high-water mark is reached', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport, { highWaterMark: 3 });

    const id = protocol.openStream();

    // Send 3 frames (at the limit)
    protocol.send(id, new Uint8Array([1]));
    protocol.send(id, new Uint8Array([2]));
    protocol.send(id, new Uint8Array([3]));

    // 4th frame should fail due to backpressure
    expect(() => protocol.send(id, new Uint8Array([4]))).toThrow(
      'backpressure'
    );

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Transport Agnostic Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — transport agnostic', () => {
  it('should work over linked transports (mock WebSocket)', () => {
    const [tA, tB] = createLinkedTransports();
    const client = new AeonFlowProtocol(tA, { role: 'client' });
    const server = new AeonFlowProtocol(tB, { role: 'server' });

    // Client opens a stream and sends data
    const streamId = client.openStream();
    client.send(streamId, new Uint8Array([1, 2, 3]));

    // Server should have received the frame and auto-created the stream
    const serverStream = server.getStream(streamId);
    expect(serverStream).toBeDefined();
    expect(serverStream?.results.length).toBeGreaterThan(0);

    client.destroy();
    server.destroy();
  });

  it('should work with recording transport (mock IPC)', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const id = protocol.openStream();
    protocol.send(id, new Uint8Array([7, 8, 9]));
    protocol.finish(id);

    // All sends should be captured
    expect(transport.sent.length).toBe(2); // data frame + FIN frame

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Integration: Inference Hidden States as Payload
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — integration', () => {
  it('should transport inference hidden states (Float32Array → Uint8Array)', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    // Simulate a 4096-dim hidden state (typical transformer)
    const hiddenDim = 4096;
    const hiddenStates = new Float32Array(hiddenDim);
    for (let i = 0; i < hiddenDim; i++) {
      hiddenStates[i] = Math.random() * 2 - 1;
    }

    // Convert to Uint8Array view (zerocopy)
    const payload = new Uint8Array(
      hiddenStates.buffer,
      hiddenStates.byteOffset,
      hiddenStates.byteLength
    );

    const id = protocol.openStream();
    protocol.send(id, payload);

    // Verify the transport received the correct number of bytes
    const codec = FlowCodec.createSync();
    const { frame } = codec.decode(transport.sent[0]);
    expect(frame.payload.length).toBe(hiddenDim * 4); // f32 = 4 bytes

    // Reconstruct Float32Array from received payload
    // Need to slice to get an aligned copy (payload view may be at unaligned offset)
    const alignedBuffer = frame.payload.slice().buffer;
    const received = new Float32Array(alignedBuffer);
    expect(received.length).toBe(hiddenDim);
    expect(received[0]).toBeCloseTo(hiddenStates[0], 5);

    protocol.destroy();
  });

  it('should transport ESI fragments as payload', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const parent = protocol.openStream();
    const [frag1, frag2] = protocol.fork(parent, 2);

    // Simulate ESI fragment results (HTML strings)
    const html1 = new TextEncoder().encode('<div>Fragment 1</div>');
    const html2 = new TextEncoder().encode('<div>Fragment 2</div>');

    protocol.send(frag1, html1);
    protocol.finish(frag1);

    protocol.send(frag2, html2);
    protocol.finish(frag2);

    // Verify fragments were sent
    expect(protocol.getStream(frag1)?.state).toBe('closed');
    expect(protocol.getStream(frag2)?.state).toBe('closed');

    protocol.destroy();
  });

  it('should support single stream (no fork) workflow', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const id = protocol.openStream();
    protocol.send(id, new Uint8Array([1, 2, 3]));
    protocol.send(id, new Uint8Array([4, 5, 6]));
    protocol.finish(id, new Uint8Array([7]));

    expect(protocol.getStream(id)?.state).toBe('closed');
    // 3 sends: 2 data + 1 FIN
    expect(transport.sent.length).toBe(3);

    protocol.destroy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Edge Cases
// ═══════════════════════════════════════════════════════════════════════════════

describe('AeonFlowProtocol — edge cases', () => {
  it('should handle getActiveStreams with mixed states', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const s1 = protocol.openStream(); // open
    const s2 = protocol.openStream(); // will close
    const s3 = protocol.openStream(); // will vent

    protocol.finish(s2);
    protocol.vent(s3);

    const active = protocol.getActiveStreams();
    expect(active.length).toBe(1);
    expect(active[0].id).toBe(s1);

    protocol.destroy();
  });

  it('should handle destroy gracefully', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    protocol.openStream();
    protocol.openStream();
    protocol.destroy();

    // All streams should be gone
    expect(protocol.getActiveStreams().length).toBe(0);
  });

  it('should handle re-venting a vented stream (no-op)', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const id = protocol.openStream();
    const spy = vi.fn();
    protocol.onStreamVented(id, spy);

    protocol.vent(id);
    protocol.vent(id); // Should be a no-op

    expect(spy).toHaveBeenCalledTimes(1);

    protocol.destroy();
  });

  it('should unsubscribe event handlers', () => {
    const transport = createRecordingTransport();
    const protocol = new AeonFlowProtocol(transport);

    const id = protocol.openStream();
    const spy = vi.fn();

    const unsub = protocol.onStreamEnd(id, spy);
    unsub();

    protocol.finish(id);
    expect(spy).not.toHaveBeenCalled();

    protocol.destroy();
  });
});
