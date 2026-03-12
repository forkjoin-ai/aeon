/**
 * Topological Compressor — Fork/Race/Fold Applied to Compression
 *
 * Two-level fork/race/fold:
 *
 *   LEVEL 1 (stream): Fork the entire input into global strategies.
 *     - Path A: Global brotli on the whole stream (cross-chunk dictionary)
 *     - Path B: Global gzip on the whole stream
 *     - Path C: Per-chunk topological compression (Level 2)
 *     Race all paths. Fold to smallest.
 *
 *   LEVEL 2 (chunk): For each chunk, fork all codecs.
 *     - Race codecs per chunk. Smallest wins.
 *     - Vent codecs whose output >= raw.
 *     - Fold: self-describing frame per chunk.
 *
 * Stream-level format (when streamRace is enabled):
 *   [0]       u8    strategy        (0 = per-chunk, N>0 = global codec ID)
 *   [1..4]    u32   original_size
 *   [5..]     [u8]  compressed data
 *
 * Per-chunk frame format:
 *   [0]       u8    codec_id
 *   [1..4]    u32   original_size
 *   [5..8]    u32   compressed_size
 *   [9..]     [u8]  compressed_data
 *
 * Zero dependencies. Works on CF Workers, Deno, Node, Bun, browsers.
 */
import type { CompressionCodec } from './codecs';
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
    /** How many codecs were vented (output >= input) */
    vented: number;
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
    /** Strategy that won the stream-level race (only set when streamRace=true) */
    strategy?: string;
}
/** Compressor configuration */
export interface TopologicalCompressorConfig {
    /** Chunk size in bytes. Smaller = more adaptive, larger = better ratio. */
    chunkSize: number;
    /** Codecs to race. Default: all built-in codecs. */
    codecs: CompressionCodec[];
    /** Enable two-level race: global codecs vs per-chunk topological. Default: false. */
    streamRace?: boolean;
}
export declare class TopologicalCompressor {
    private readonly config;
    constructor(config?: Partial<TopologicalCompressorConfig>);
    /**
     * Compress data using fork/race/fold.
     *
     * When streamRace=false (default): per-chunk race only.
     * When streamRace=true: two-level race — global codecs vs per-chunk topo.
     */
    compress(data: Uint8Array): TopologicalCompressionResult;
    /**
     * Decompress data produced by compress().
     */
    decompress(compressed: Uint8Array): Uint8Array;
    private compressChunked;
    private decompressChunked;
    /**
     * Two-level fork/race/fold:
     *
     *   FORK (stream level):
     *     ├─ Path 0: Per-chunk topological (Level 2)
     *     ├─ Path 1: Global codec A on entire stream
     *     ├─ Path 2: Global codec B on entire stream
     *     └─ ...
     *   RACE: Smallest total output wins
     *   FOLD: 5-byte strategy header + compressed data
     *
     * On homogeneous text, global brotli wins (cross-chunk dictionary).
     * On mixed content, per-chunk topo wins (adapts per region).
     * The topology decides — not the programmer.
     */
    private compressTwoLevel;
    private decompressTwoLevel;
    /** Get the codecs available for racing. */
    getCodecs(): ReadonlyArray<CompressionCodec>;
    /** Get the chunk size. */
    getChunkSize(): number;
}
