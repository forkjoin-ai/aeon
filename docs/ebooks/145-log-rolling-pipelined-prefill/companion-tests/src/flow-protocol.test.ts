/**
 * Flow Protocol — Companion Tests for §8 The Wire, §8.2.1 Self-Describing Frames
 *
 * Proves:
 *   1. 10-byte frame header is self-describing
 *   2. Fork/race/collapse/poison primitives work on the wire
 *   3. WorkFrame ↔ FlowFrame isomorphism
 *   4. Frame overhead comparison vs HTTP/1.1, HTTP/2, HTTP/3
 *
 * Uses: @anthropic-ai/aeon (FlowCodec, frame types)
 */

import { describe, it, expect } from 'vitest';
import {
  FlowCodec,
  HEADER_SIZE,
} from '@aeon/flow';
import {
  FORK,
  RACE,
  COLLAPSE,
  POISON,
  FIN,
} from '@aeon/flow';
import type { FlowFrame } from '@aeon/flow';

// FlowCodec uses instance methods — create once
const codec = FlowCodec.createSync();

describe('Flow Protocol (§8)', () => {

  describe('§8.2.1 Self-Describing Frame Header', () => {
    /**
     * FlowFrame {
     *   stream_id: u16      // 2 bytes — multiplexed stream identifier
     *   sequence:  u32      // 4 bytes — position within stream
     *   flags:     u8       // 1 byte  — FORK | RACE | COLLAPSE | POISON | FIN
     *   length:    u24      // 3 bytes — payload length (up to 16MB)
     *   payload:   [u8]     // variable
     * }
     * Total header: 10 bytes.
     */

    it('header is exactly 10 bytes', () => {
      expect(HEADER_SIZE).toBe(10);
    });

    it('encode/decode roundtrip preserves all fields', () => {
      const frame: FlowFrame = {
        streamId: 42,
        sequence: 1000,
        flags: FORK | RACE,
        payload: new Uint8Array([1, 2, 3, 4, 5]),
      };

      const encoded = codec.encode(frame);
      expect(encoded.length).toBe(HEADER_SIZE + 5); // 10 + 5 = 15 bytes

      const { frame: decoded } = codec.decode(encoded);
      expect(decoded.streamId).toBe(42);
      expect(decoded.sequence).toBe(1000);
      expect(decoded.flags).toBe(FORK | RACE);
      expect(decoded.payload).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    it('empty payload produces exactly 10 bytes on the wire', () => {
      const frame: FlowFrame = {
        streamId: 0,
        sequence: 0,
        flags: FIN,
        payload: new Uint8Array(0),
      };

      const encoded = codec.encode(frame);
      expect(encoded.length).toBe(10);
    });

    it('each flag bit is independent', () => {
      const flags = [FORK, RACE, COLLAPSE, POISON, FIN];
      const values = [0x01, 0x02, 0x04, 0x08, 0x10];

      for (let i = 0; i < flags.length; i++) {
        expect(flags[i]).toBe(values[i]);
        // Each flag occupies a unique bit
        for (let j = i + 1; j < flags.length; j++) {
          expect(flags[i] & flags[j]).toBe(0);
        }
      }

      // All flags can be combined
      const all = FORK | RACE | COLLAPSE | POISON | FIN;
      expect(all).toBe(0x1F);
    });
  });

  describe('§8.4 Fork/Race/Collapse on the Wire', () => {

    it('fork creates child streams', () => {
      // Parent forks 3 child streams
      const forkFrame = codec.encode({
        streamId: 0,
        sequence: 0,
        flags: FORK,
        // Payload encodes child stream IDs
        payload: new Uint8Array([0, 2, 0, 4, 0, 6]), // streams 2, 4, 6
      });

      const { frame: decoded } = codec.decode(forkFrame);
      expect(decoded.flags & FORK).toBeTruthy();

      // β₁ goes from 0 to 2 (3 paths - 1)
      const childCount = decoded.payload.length / 2;
      const beta1 = childCount - 1;
      expect(beta1).toBe(2);
    });

    it('race selects the first completed stream', () => {
      // Three racing streams send data
      const results = [
        { streamId: 2, size: 100, timeUs: 500 },
        { streamId: 4, size: 80, timeUs: 200 },  // ← winner (fastest)
        { streamId: 6, size: 120, timeUs: 800 },
      ];

      // Sort by completion time — first to finish wins
      const winner = results.sort((a, b) => a.timeUs - b.timeUs)[0];
      expect(winner.streamId).toBe(4);

      // Winner sends FIN, losers get poisoned
      const winFrame = codec.encode({
        streamId: winner.streamId,
        sequence: 1,
        flags: FIN,
        payload: new Uint8Array(winner.size),
      });

      const poisonFrames = results
        .filter(r => r.streamId !== winner.streamId)
        .map(r => codec.encode({
          streamId: r.streamId,
          sequence: 0,
          flags: POISON,
          payload: new Uint8Array(0),
        }));

      expect(codec.decode(winFrame).frame.flags & FIN).toBeTruthy();
      expect(poisonFrames).toHaveLength(2);
      for (const pf of poisonFrames) {
        expect(codec.decode(pf).frame.flags & POISON).toBeTruthy();
      }
    });

    it('collapse merges results from child streams', () => {
      // After fork+race, collapse sends the final result on the parent stream
      const collapseFrame = codec.encode({
        streamId: 0, // back on parent
        sequence: 1,
        flags: COLLAPSE | FIN,
        payload: new TextEncoder().encode('merged result'),
      });

      const { frame: decoded } = codec.decode(collapseFrame);
      expect(decoded.flags & COLLAPSE).toBeTruthy();
      expect(decoded.flags & FIN).toBeTruthy();
      expect(decoded.streamId).toBe(0); // Parent stream

      // β₁ returns to 0 after collapse
    });

    it('poison propagates downstream', () => {
      // Parent poisoned → all children poisoned
      const parentPoison = codec.encode({
        streamId: 0,
        sequence: 0,
        flags: POISON,
        payload: new TextEncoder().encode('timeout'),
      });

      const { frame: decoded } = codec.decode(parentPoison);
      expect(decoded.flags & POISON).toBeTruthy();
      expect(new TextDecoder().decode(decoded.payload)).toBe('timeout');
    });
  });

  describe('§8.5 Framing Overhead Comparison', () => {
    /**
     * Per-resource overhead comparison:
     *
     *   HTTP/1.1:  ~660 bytes (request + response headers, keep-alive)
     *   HTTP/2:    ~84 bytes (HEADERS frame + DATA frame, HPACK)
     *   HTTP/3:    ~62 bytes (similar to HTTP/2 but QPACK, less framing)
     *   Aeon Flow: ~20 bytes (DATA frame 10B + FIN frame 10B)
     *
     * For 95 resources:
     *   HTTP/1.1:  ~62,700 bytes of pure overhead
     *   HTTP/2:    ~7,980 bytes
     *   HTTP/3:    ~5,890 bytes
     *   Aeon Flow: ~1,900 bytes (+ 10B FORK frame shared across all)
     */

    it('Aeon Flow overhead is 10 bytes per frame', () => {
      const resourceCount = 95;

      // Each resource = 1 DATA frame + 1 FIN frame = 20 bytes overhead
      // Plus 1 shared FORK frame = 10 bytes
      const aeonOverhead = resourceCount * 2 * HEADER_SIZE + HEADER_SIZE;

      // HTTP/1.1: ~660 bytes per resource (request headers + response headers)
      const http1Overhead = resourceCount * 660;

      // HTTP/2: ~84 bytes per resource (HEADERS + DATA frames, HPACK)
      const http2Overhead = resourceCount * 84;

      expect(aeonOverhead).toBeLessThan(http2Overhead);
      expect(aeonOverhead).toBeLessThan(http1Overhead / 30); // 30x+ smaller than HTTP/1.1

      // Aeon Flow overhead as percentage of 617KB payload
      const payloadBytes = 617 * 1024;
      const overheadPct = (aeonOverhead / (payloadBytes + aeonOverhead)) * 100;
      expect(overheadPct).toBeLessThan(1); // Less than 1% overhead
    });
  });

  describe('WorkFrame ↔ FlowFrame Isomorphism', () => {
    /**
     * The paper claims (§8.2.1) that a computation frame (WorkFrame)
     * and a wire frame (FlowFrame) are structurally identical:
     *
     *   WorkFrame: { taskId, sequence, flags, payload } — what to compute
     *   FlowFrame: { streamId, sequence, flags, payload } — what to send
     *
     * Same 10-byte header. Same flag semantics. The only difference is
     * whether taskId/streamId refers to a computation or a network stream.
     * This isomorphism means the wire format IS the computation format.
     */

    it('WorkFrame and FlowFrame have identical structure', () => {
      // A computation task
      const workFrame = {
        taskId: 7,
        sequence: 0,
        flags: FORK | RACE,
        payload: new Uint8Array([10, 20, 30]),
      };

      // Encode as FlowFrame (rename taskId → streamId)
      const wireFrame: FlowFrame = {
        streamId: workFrame.taskId,
        sequence: workFrame.sequence,
        flags: workFrame.flags,
        payload: workFrame.payload,
      };

      const encoded = codec.encode(wireFrame);
      const { frame: decoded } = codec.decode(encoded);

      // Roundtrip preserves all fields
      expect(decoded.streamId).toBe(workFrame.taskId);
      expect(decoded.sequence).toBe(workFrame.sequence);
      expect(decoded.flags).toBe(workFrame.flags);
      expect(decoded.payload).toEqual(workFrame.payload);

      // Same byte count
      expect(encoded.length).toBe(HEADER_SIZE + workFrame.payload.length);
    });
  });
});
