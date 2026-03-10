/**
 * Topological Compressor — Fork/Race/Collapse Applied to Compression
 *
 * Traditional compression picks ONE algorithm globally.
 * Topological compression races MULTIPLE algorithms per chunk and lets
 * each chunk independently select its winner. Different data regions
 * get different codecs automatically.
 *
 * The algorithm:
 *   1. FORK:     Split input into chunks. For each chunk, fork all codecs.
 *   2. RACE:     Race codecs per chunk. Smallest output wins.
 *   3. POISON:   If a codec's output exceeds raw size, poison it.
 *   4. COLLAPSE: Reassemble chunks into self-describing frames.
 *
 * Each compressed chunk is a self-describing frame:
 *   [0]       u8    codec_id        (which codec won this chunk)
 *   [1..4]    u32   original_size   (for decompression buffer allocation)
 *   [5..8]    u32   compressed_size (for frame boundary detection)
 *   [9..]     [u8]  compressed_data
 *
 * Total per-chunk header: 9 bytes. Combined with FlowFrame header (10 bytes)
 * = 19 bytes overhead per chunk on the wire.
 *
 * Zero dependencies. Works on CF Workers, Deno, Node, Bun, browsers.
 */

import type { CompressionCodec } from './codecs';
import { BUILTIN_CODECS, getCodecById } from './codecs';

// ============================================================================
// Types
// ============================================================================

/** Per-chunk compression result — which codec won and why */
export interface ChunkResult {
  /** Index of this chunk in the original data */
  chunkIndex: number;
  /** The codec that won the race for this chunk */
  codecId: number;
  /** Codec name (for diagnostics) */
  codecName: string;
  /** Original size of this chunk in bytes */
  originalSize: number;
  /** Compressed size of this chunk in bytes (including 9-byte header) */
  compressedSize: number;
  /** Compression ratio for this chunk (0 = no compression, 1 = perfect) */
  ratio: number;
  /** How many codecs were poisoned (output >= input) */
  poisoned: number;
}

/** Overall compression result */
export interface TopologicalCompressionResult {
  /** The compressed output — concatenated self-describing frames */
  data: Uint8Array;
  /** Per-chunk results */
  chunks: ChunkResult[];
  /** Total original size */
  originalSize: number;
  /** Total compressed size */
  compressedSize: number;
  /** Overall compression ratio */
  ratio: number;
  /** Number of distinct codecs used across all chunks */
  codecsUsed: number;
  /** β₁ during compression (number of parallel codec paths - 1) */
  bettiNumber: number;
  /** Compression time in milliseconds */
  timeMs: number;
}

/** Compressor configuration */
export interface TopologicalCompressorConfig {
  /** Chunk size in bytes. Smaller = more adaptive, larger = better ratio. */
  chunkSize: number;
  /** Codecs to race. Default: all built-in codecs. */
  codecs: CompressionCodec[];
}

// ============================================================================
// Self-Describing Chunk Header (9 bytes)
// ============================================================================

const CHUNK_HEADER_SIZE = 9;

function encodeChunkHeader(
  codecId: number,
  originalSize: number,
  compressedSize: number,
): Uint8Array {
  const header = new Uint8Array(CHUNK_HEADER_SIZE);
  const view = new DataView(header.buffer);
  header[0] = codecId;
  view.setUint32(1, originalSize);
  view.setUint32(5, compressedSize);
  return header;
}

function decodeChunkHeader(
  data: Uint8Array,
  offset: number,
): { codecId: number; originalSize: number; compressedSize: number } {
  const codecId = data[offset];
  const view = new DataView(data.buffer, data.byteOffset + offset + 1, 8);
  const originalSize = view.getUint32(0);
  const compressedSize = view.getUint32(4);
  return { codecId, originalSize, compressedSize };
}

// ============================================================================
// Topological Compressor
// ============================================================================

export class TopologicalCompressor {
  private readonly config: TopologicalCompressorConfig;

  constructor(config?: Partial<TopologicalCompressorConfig>) {
    this.config = {
      chunkSize: config?.chunkSize ?? 4096,
      codecs: config?.codecs ?? BUILTIN_CODECS,
    };
  }

  /**
   * Compress data using fork/race/collapse per chunk.
   *
   * For each chunk of the input:
   *   - FORK: All codecs compress the chunk.
   *   - RACE: Smallest compressed output wins.
   *   - POISON: Codecs whose output >= the original are discarded.
   *   - COLLAPSE: Winner's output becomes the chunk's self-describing frame.
   */
  compress(data: Uint8Array): TopologicalCompressionResult {
    const startTime = performance.now();

    if (data.length === 0) {
      return {
        data: new Uint8Array(0),
        chunks: [],
        originalSize: 0,
        compressedSize: 0,
        ratio: 0,
        codecsUsed: 0,
        bettiNumber: 0,
        timeMs: 0,
      };
    }

    const { chunkSize, codecs } = this.config;
    const numChunks = Math.ceil(data.length / chunkSize);
    const compressedChunks: Uint8Array[] = [];
    const chunkResults: ChunkResult[] = [];
    const codecWins = new Set<number>();

    // β₁ = number of parallel codec paths - 1
    const bettiNumber = Math.max(0, codecs.length - 1);

    for (let i = 0; i < numChunks; i++) {
      const chunkStart = i * chunkSize;
      const chunkEnd = Math.min(chunkStart + chunkSize, data.length);
      const chunk = data.subarray(chunkStart, chunkEnd);

      // ── FORK: Race all codecs on this chunk ──
      let bestCodecId = 0; // Raw (id=0) is always the fallback
      let bestCompressed = chunk;
      let poisonCount = 0;

      for (const codec of codecs) {
        const compressed = codec.encode(chunk);

        if (compressed.length >= chunk.length && codec.id !== 0) {
          // ── POISON: Output >= raw. Discard. ──
          poisonCount++;
          continue;
        }

        if (compressed.length < bestCompressed.length) {
          // ── RACE: New winner ──
          bestCodecId = codec.id;
          bestCompressed = compressed;
        }
      }

      // ── COLLAPSE: Build self-describing frame ──
      const header = encodeChunkHeader(
        bestCodecId,
        chunk.length,
        bestCompressed.length,
      );
      const frame = new Uint8Array(CHUNK_HEADER_SIZE + bestCompressed.length);
      frame.set(header, 0);
      frame.set(bestCompressed, CHUNK_HEADER_SIZE);

      compressedChunks.push(frame);
      codecWins.add(bestCodecId);

      const codecName =
        codecs.find((c) => c.id === bestCodecId)?.name ?? 'unknown';

      chunkResults.push({
        chunkIndex: i,
        codecId: bestCodecId,
        codecName,
        originalSize: chunk.length,
        compressedSize: frame.length,
        ratio: chunk.length > 0 ? 1 - frame.length / chunk.length : 0,
        poisoned: poisonCount,
      });
    }

    // Concatenate all compressed chunks
    const totalCompressedSize = compressedChunks.reduce(
      (sum, c) => sum + c.length,
      0,
    );
    const output = new Uint8Array(totalCompressedSize);
    let offset = 0;
    for (const c of compressedChunks) {
      output.set(c, offset);
      offset += c.length;
    }

    return {
      data: output,
      chunks: chunkResults,
      originalSize: data.length,
      compressedSize: totalCompressedSize,
      ratio: data.length > 0 ? 1 - totalCompressedSize / data.length : 0,
      codecsUsed: codecWins.size,
      bettiNumber,
      timeMs: performance.now() - startTime,
    };
  }

  /**
   * Decompress data produced by compress().
   *
   * Each chunk is self-describing — the 9-byte header tells us which codec
   * to use, how large the original was, and where the next chunk starts.
   * Chunks CAN be decompressed in any order (covering space → base space).
   */
  decompress(compressed: Uint8Array): Uint8Array {
    if (compressed.length === 0) return new Uint8Array(0);

    // First pass: parse all chunk headers
    const chunks: Array<{
      codecId: number;
      originalSize: number;
      compressedData: Uint8Array;
    }> = [];
    let totalOriginalSize = 0;
    let readPos = 0;

    while (readPos < compressed.length) {
      if (readPos + CHUNK_HEADER_SIZE > compressed.length) {
        throw new Error(`Truncated chunk header at offset ${readPos}`);
      }

      const { codecId, originalSize, compressedSize } = decodeChunkHeader(
        compressed,
        readPos,
      );
      readPos += CHUNK_HEADER_SIZE;

      if (readPos + compressedSize > compressed.length) {
        throw new Error(
          `Truncated chunk data at offset ${readPos}: need ${compressedSize}, have ${compressed.length - readPos}`,
        );
      }

      chunks.push({
        codecId,
        originalSize,
        compressedData: compressed.subarray(readPos, readPos + compressedSize),
      });
      readPos += compressedSize;
      totalOriginalSize += originalSize;
    }

    // Second pass: decompress and concatenate
    const output = new Uint8Array(totalOriginalSize);
    let writePos = 0;

    for (const chunk of chunks) {
      const codec = getCodecById(chunk.codecId);
      const decompressed = codec.decode(
        chunk.compressedData,
        chunk.originalSize,
      );
      output.set(decompressed, writePos);
      writePos += chunk.originalSize;
    }

    return output;
  }

  /** Get the codecs available for racing. */
  getCodecs(): ReadonlyArray<CompressionCodec> {
    return this.config.codecs;
  }

  /** Get the chunk size. */
  getChunkSize(): number {
    return this.config.chunkSize;
  }
}
