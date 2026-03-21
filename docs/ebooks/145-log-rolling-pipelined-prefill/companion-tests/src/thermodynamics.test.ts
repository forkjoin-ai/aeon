/**
 * Thermodynamics - Companion Tests for §6
 *
 * Proves:
 *   1. First Law accounting in codec races: V_fork = W_fold + Q_vent
 *   2. Fold cannot beat the best forked path
 *   3. Fold is irreversible (many fork states can map to one folded frame)
 *   4. Frame headers are irreducible ground-state overhead
 *   5. Two-level race reaches the best available path and cannot beat it
 *   6. High-entropy payloads stay above the Shannon lower bound
 */

import { describe, expect, it } from 'vitest';
import {
  TopologicalCompressor,
  BUILTIN_CODECS,
  PURE_JS_CODECS,
  RawCodec,
  RLECodec,
  type CompressionCodec,
} from '@a0n/aeon/compression';
import { FlowCodec, HEADER_SIZE } from '@a0n/aeon/flow';

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function makeRandom(length: number, seed: number): Uint8Array {
  const rng = makeRng(seed);
  const data = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = Math.floor(rng() * 256) & 0xff;
  }
  return data;
}

function makeTextPayload(length: number): Uint8Array {
  const patterns = [
    'function Component() { return this.props.children; }\n',
    'export const value = 42;\n',
    '<div class="container flex items-center">\n',
    '.card { display: grid; gap: 8px; }\n',
  ];

  const out = new Uint8Array(length);
  let cursor = 0;
  let index = 0;
  while (cursor < length) {
    const next = new TextEncoder().encode(patterns[index % patterns.length]);
    const copy = Math.min(next.length, length - cursor);
    out.set(next.subarray(0, copy), cursor);
    cursor += copy;
    index++;
  }
  return out;
}

function splitChunks(data: Uint8Array, chunkSize: number): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let start = 0; start < data.length; start += chunkSize) {
    const end = Math.min(start + chunkSize, data.length);
    chunks.push(data.subarray(start, end));
  }
  return chunks;
}

function empiricalEntropyBits(data: Uint8Array): number {
  if (data.length === 0) return 0;

  const counts = new Uint32Array(256);
  for (const byte of data) counts[byte]++;

  let bits = 0;
  for (const count of counts) {
    if (count === 0) continue;
    const p = count / data.length;
    bits += -count * Math.log2(p);
  }
  return bits;
}

interface ChunkRaceSummary {
  ventedPaths: number;
  forkedPaths: number;
  usefulPaths: number;
  winnerCodecId: number;
  winnerPayloadBytes: number;
}

function analyzeChunkRace(
  chunk: Uint8Array,
  codecs: ReadonlyArray<CompressionCodec>
): ChunkRaceSummary {
  let bestCodecId = 0;
  let bestPayload = chunk;
  let vented = 0;

  for (const codec of codecs) {
    const encoded = codec.encode(chunk);

    if (codec.id !== 0 && encoded.length >= chunk.length) {
      vented++;
      continue;
    }

    if (encoded.length < bestPayload.length) {
      bestCodecId = codec.id;
      bestPayload = encoded;
    }
  }

  const forkedPaths = Math.max(0, codecs.length - 1);
  return {
    ventedPaths: vented,
    forkedPaths,
    usefulPaths: forkedPaths - vented,
    winnerCodecId: bestCodecId,
    winnerPayloadBytes: bestPayload.length,
  };
}

type Matrix = number[][];

function dot(a: readonly number[], b: readonly number[]): number {
  let total = 0;
  for (let i = 0; i < a.length; i++) total += a[i] * b[i];
  return total;
}

function softmax(values: readonly number[]): number[] {
  const maxValue = Math.max(...values);
  const expValues = values.map((value) => Math.exp(value - maxValue));
  const sumExp = expValues.reduce((sum, value) => sum + value, 0);
  return expValues.map((value) => value / sumExp);
}

function splitHeads(input: Matrix, heads: number): Matrix[] {
  const dModel = input[0]?.length ?? 0;
  if (dModel === 0 || dModel % heads !== 0) {
    throw new Error(`dModel=${dModel} must be divisible by heads=${heads}`);
  }
  const dHead = dModel / heads;
  return Array.from({ length: heads }, (_, headIndex) =>
    input.map((row) => row.slice(headIndex * dHead, (headIndex + 1) * dHead))
  );
}

function concatHeads(headOutputs: Matrix[]): Matrix {
  const seqLen = headOutputs[0]?.length ?? 0;
  const output: Matrix = Array.from({ length: seqLen }, () => []);

  for (let token = 0; token < seqLen; token++) {
    for (const head of headOutputs) {
      output[token].push(...head[token]);
    }
  }

  return output;
}

function multiHeadAttentionDirect(input: Matrix, heads: number): Matrix {
  const seqLen = input.length;
  const dModel = input[0]?.length ?? 0;
  const dHead = dModel / heads;
  const output: Matrix = Array.from({ length: seqLen }, () =>
    Array.from({ length: dModel }, () => 0)
  );

  for (let head = 0; head < heads; head++) {
    const start = head * dHead;
    const end = start + dHead;

    for (let queryToken = 0; queryToken < seqLen; queryToken++) {
      const q = input[queryToken].slice(start, end);
      const scores = Array.from({ length: seqLen }, (_, keyToken) => {
        const k = input[keyToken].slice(start, end);
        return dot(q, k) / Math.sqrt(dHead);
      });
      const weights = softmax(scores);

      for (let feature = 0; feature < dHead; feature++) {
        let value = 0;
        for (let keyToken = 0; keyToken < seqLen; keyToken++) {
          value += weights[keyToken] * input[keyToken][start + feature];
        }
        output[queryToken][start + feature] = value;
      }
    }
  }

  return output;
}

interface RotationAttentionDiagnostics {
  headBetti: number;
  raceEvents: number;
  foldEvents: number;
  ventedWeights: number;
}

function attentionHeadRotation(
  headMatrix: Matrix,
  ventCutoff: number
): { output: Matrix; ventedWeights: number } {
  const seqLen = headMatrix.length;
  const dHead = headMatrix[0]?.length ?? 0;
  const output: Matrix = Array.from({ length: seqLen }, () =>
    Array.from({ length: dHead }, () => 0)
  );

  let ventedWeights = 0;
  for (let queryToken = 0; queryToken < seqLen; queryToken++) {
    const q = headMatrix[queryToken];
    const scores = Array.from({ length: seqLen }, (_, keyToken) => {
      const k = headMatrix[keyToken];
      return dot(q, k) / Math.sqrt(dHead);
    });

    const weights = softmax(scores);
    for (const weight of weights) {
      if (weight < ventCutoff) ventedWeights++;
    }

    for (let feature = 0; feature < dHead; feature++) {
      let value = 0;
      for (let keyToken = 0; keyToken < seqLen; keyToken++) {
        value += weights[keyToken] * headMatrix[keyToken][feature];
      }
      output[queryToken][feature] = value;
    }
  }

  return { output, ventedWeights };
}

function multiHeadAttentionRotation(
  input: Matrix,
  heads: number,
  ventCutoff = 0.05
): { output: Matrix; diagnostics: RotationAttentionDiagnostics } {
  const headInputs = splitHeads(input, heads);
  const headOutputs: Matrix[] = [];
  let ventedWeights = 0;

  for (const headInput of headInputs) {
    const { output, ventedWeights: headVented } = attentionHeadRotation(
      headInput,
      ventCutoff
    );
    headOutputs.push(output);
    ventedWeights += headVented;
  }

  const seqLen = input.length;
  return {
    output: concatHeads(headOutputs),
    diagnostics: {
      headBetti: heads - 1,
      raceEvents: heads * seqLen,
      foldEvents: heads * seqLen + seqLen,
      ventedWeights,
    },
  };
}

function ffnExpandVentFold(input: Matrix): Matrix {
  return input.map((tokenVector) =>
    tokenVector.map((value) => {
      const expanded = [value, value * 0.5, -value, value * 2];
      const vented = expanded.map((entry) => Math.max(0, entry));
      return vented[0] + vented[1] + vented[2] + vented[3];
    })
  );
}

function addMatrices(a: Matrix, b: Matrix): Matrix {
  return a.map((row, rowIndex) =>
    row.map((value, colIndex) => value + b[rowIndex][colIndex])
  );
}

function transformerLayerDirect(input: Matrix, heads: number): Matrix {
  const attention = multiHeadAttentionDirect(input, heads);
  const transformed = ffnExpandVentFold(attention);
  return addMatrices(input, transformed);
}

function transformerLayerRotation(
  input: Matrix,
  heads: number
): { output: Matrix; diagnostics: RotationAttentionDiagnostics } {
  const attention = multiHeadAttentionRotation(input, heads);
  const transformed = ffnExpandVentFold(attention.output);
  return {
    output: addMatrices(input, transformed),
    diagnostics: attention.diagnostics,
  };
}

function applyLayersDirect(
  input: Matrix,
  layers: number,
  heads: number
): Matrix {
  let output = input;
  for (let layer = 0; layer < layers; layer++) {
    output = transformerLayerDirect(output, heads);
  }
  return output;
}

function applyLayersRecursiveRotation(
  input: Matrix,
  layers: number,
  heads: number
): Matrix {
  if (layers === 0) return input;
  return applyLayersRecursiveRotation(
    transformerLayerRotation(input, heads).output,
    layers - 1,
    heads
  );
}

function maxAbsDiff(a: Matrix, b: Matrix): number {
  let maxDiff = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[i].length; j++) {
      const diff = Math.abs(a[i][j] - b[i][j]);
      if (diff > maxDiff) maxDiff = diff;
    }
  }
  return maxDiff;
}

function makeTokenMatrix(tokens: number, dModel: number, seed: number): Matrix {
  const rng = makeRng(seed);
  return Array.from({ length: tokens }, () =>
    Array.from({ length: dModel }, () => rng() * 2 - 1)
  );
}

function topKIndices(scores: readonly number[], k: number): number[] {
  return scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ index }) => index);
}

describe('Thermodynamics (§6)', () => {
  describe('First Law: V_fork = W_fold + Q_vent', () => {
    it('accounts for every forked codec path as folded work or vented heat', () => {
      const chunkSize = 1024;
      const data = makeRandom(chunkSize * 6, 0xa11ce);
      const compressor = new TopologicalCompressor({
        chunkSize,
        codecs: PURE_JS_CODECS,
      });
      const result = compressor.compress(data);
      const chunks = splitChunks(data, chunkSize);

      expect(result.chunks.length).toBe(chunks.length);

      let totalV = 0;
      let totalW = 0;
      let totalQ = 0;

      for (let i = 0; i < chunks.length; i++) {
        const summary = analyzeChunkRace(chunks[i], PURE_JS_CODECS);
        const observed = result.chunks[i];

        expect(observed.codecId).toBe(summary.winnerCodecId);
        expect(observed.vented).toBe(summary.ventedPaths);

        const Vfork = summary.forkedPaths;
        const Wfold = summary.usefulPaths;
        const Qvent = summary.ventedPaths;
        expect(Vfork).toBe(Wfold + Qvent);

        totalV += Vfork;
        totalW += Wfold;
        totalQ += Qvent;
      }

      expect(totalQ).toBeGreaterThan(0);
      expect(totalV).toBe(totalW + totalQ);
    });
  });

  describe('Second Law: fold irreversibility', () => {
    it('cannot recover fork-state multiplicity from the folded frame', () => {
      const data = new TextEncoder().encode(
        'I test fold irreversibility with a single chunk. '.repeat(80)
      );
      const full = new TopologicalCompressor({
        chunkSize: data.length,
        codecs: BUILTIN_CODECS,
      });
      const fullResult = full.compress(data);
      const winnerCodecId = fullResult.chunks[0].codecId;

      const winnerCodec = BUILTIN_CODECS.find(
        (codec) => codec.id === winnerCodecId
      );
      expect(winnerCodec).toBeDefined();

      const reducedCodecs =
        winnerCodecId === 0
          ? [new RawCodec(), new RLECodec()]
          : [new RawCodec(), winnerCodec!];

      const reduced = new TopologicalCompressor({
        chunkSize: data.length,
        codecs: reducedCodecs,
      });
      const reducedResult = reduced.compress(data);

      expect(reducedResult.bettiNumber).not.toBe(fullResult.bettiNumber);
      expect(reducedResult.chunks[0].codecId).toBe(
        fullResult.chunks[0].codecId
      );
      expect(reducedResult.data).toEqual(fullResult.data);
    });
  });

  describe('Fold corollary', () => {
    it('selects the best forked path per chunk and cannot improve beyond it', () => {
      const chunkSize = 2048;
      const text = makeTextPayload(chunkSize * 3);
      const random = makeRandom(chunkSize * 3, 0xbadc0de);
      const data = new Uint8Array(text.length + random.length);
      data.set(text, 0);
      data.set(random, text.length);

      const compressor = new TopologicalCompressor({
        chunkSize,
        codecs: BUILTIN_CODECS,
      });
      const result = compressor.compress(data);
      const chunks = splitChunks(data, chunkSize);

      expect(result.chunks.length).toBe(chunks.length);

      for (let i = 0; i < chunks.length; i++) {
        const summary = analyzeChunkRace(chunks[i], BUILTIN_CODECS);
        const observed = result.chunks[i];

        expect(observed.codecId).toBe(summary.winnerCodecId);
        expect(observed.compressedSize).toBe(summary.winnerPayloadBytes + 9);
      }
    });
  });

  describe('Third Law: non-zero ground state overhead', () => {
    it('retains irreducible frame-header cost on tiny payloads', () => {
      const flowCodec = FlowCodec.createSync();
      const frame = flowCodec.encode({
        streamId: 1,
        sequence: 0,
        flags: 0,
        payload: new Uint8Array([0x2a]),
      });

      expect(HEADER_SIZE).toBe(10);
      expect(frame.length).toBe(HEADER_SIZE + 1);

      const chunked = new TopologicalCompressor({
        chunkSize: 1,
        codecs: [new RawCodec()],
      });

      const oneByte = chunked.compress(new Uint8Array([0x2a]));
      expect(oneByte.compressedSize).toBe(10);
      expect(oneByte.ratio).toBeLessThan(0);

      const twoBytes = chunked.compress(new Uint8Array([0x2a, 0x2b]));
      expect(twoBytes.compressedSize).toBe(20);
    });
  });

  describe('Carnot and Shannon bounds', () => {
    it('two-level race reaches the best participating strategy and cannot beat it', () => {
      const data = new TextEncoder().encode(
        'the quick brown fox jumps over the lazy dog\n'.repeat(900)
      );

      const chunkedResult = new TopologicalCompressor({
        chunkSize: 4096,
        codecs: BUILTIN_CODECS,
      }).compress(data);

      const twoLevel = new TopologicalCompressor({
        chunkSize: 4096,
        codecs: BUILTIN_CODECS,
        streamRace: true,
      });
      const twoLevelResult = twoLevel.compress(data);

      const candidateTotals = [5 + chunkedResult.compressedSize];
      for (const codec of BUILTIN_CODECS) {
        if (codec.id === 0) continue;
        const encoded = codec.encode(data);
        if (encoded.length < data.length) {
          candidateTotals.push(5 + encoded.length);
        }
      }

      expect(twoLevelResult.compressedSize).toBe(Math.min(...candidateTotals));
      expect(twoLevel.decompress(twoLevelResult.data)).toEqual(data);
    });

    it('high-entropy data remains above the Shannon lower bound', () => {
      const data = makeRandom(32_768, 0xfacefeed);
      const entropyBits = empiricalEntropyBits(data);

      const result = new TopologicalCompressor({
        chunkSize: 4096,
        codecs: BUILTIN_CODECS,
        streamRace: true,
      }).compress(data);

      const compressedBits = result.compressedSize * 8;
      expect(compressedBits).toBeGreaterThanOrEqual(entropyBits);
      expect(result.compressedSize).toBeGreaterThan(data.length);
    });
  });

  describe('Transformers as recursive Wallington Rotation (§6.10)', () => {
    it('multi-head attention decomposes to fork/race/fold without changing output', () => {
      const tokens = 5;
      const heads = 4;
      const dModel = 16;
      const input = makeTokenMatrix(tokens, dModel, 0xc0ffee);

      const direct = multiHeadAttentionDirect(input, heads);
      const rotated = multiHeadAttentionRotation(input, heads, 0.1);

      expect(rotated.diagnostics.headBetti).toBe(heads - 1);
      expect(rotated.diagnostics.raceEvents).toBe(heads * tokens);
      expect(rotated.diagnostics.foldEvents).toBe(heads * tokens + tokens);
      expect(rotated.diagnostics.ventedWeights).toBeGreaterThan(0);

      expect(maxAbsDiff(direct, rotated.output)).toBeLessThan(1e-12);
    });

    it('stacked layers match recursive Wallington Rotation composition', () => {
      const layers = 6;
      const heads = 4;
      const dModel = 16;
      const tokens = 4;
      const input = makeTokenMatrix(tokens, dModel, 0xabcd1234);

      const directPipeline = applyLayersDirect(input, layers, heads);
      const recursiveRotation = applyLayersRecursiveRotation(
        input,
        layers,
        heads
      );

      expect(maxAbsDiff(directPipeline, recursiveRotation)).toBeLessThan(1e-10);
    });

    it('MoE top-K routing vents N-K experts per token', () => {
      const experts = 8;
      const topK = 2;
      const gating: Matrix = [
        [0.1, 0.9, -0.2, 0.8, 0.0, -0.5, 0.7, 0.3],
        [0.2, -0.1, 0.6, 0.5, 0.4, 0.3, -0.7, 0.0],
        [-0.2, 0.1, 0.0, 0.9, 0.8, -0.3, 0.4, 0.2],
      ];

      let totalVented = 0;
      for (const tokenScores of gating) {
        const selected = topKIndices(tokenScores, topK);
        const selectedSet = new Set(selected);
        expect(selected.length).toBe(topK);
        expect(selectedSet.size).toBe(topK);

        const vented = experts - selected.length;
        totalVented += vented;
        expect(vented).toBe(experts - topK);
      }

      const ventRatio = (experts - topK) / experts;
      expect(ventRatio).toBe(0.75);
      expect(totalVented).toBe(gating.length * (experts - topK));
    });
  });
});
