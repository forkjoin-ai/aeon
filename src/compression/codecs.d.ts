/**
 * Compression Codecs — Pluggable implementations for topological compression.
 *
 * Each codec implements the same interface. The TopologicalCompressor races
 * them per chunk — different data regions get different codecs automatically.
 *
 * Pure-JS codecs (0-3, 6-7) — zero dependencies, work everywhere.
 * Platform codecs (4-5) wrap node:zlib for brotli/gzip when available.
 *
 * Codec lineup:
 *   0: Raw (identity)       4: Brotli (node:zlib)
 *   1: RLE                  5: Gzip (node:zlib)
 *   2: Delta                6: Huffman (entropy coding)
 *   3: LZ77                 7: Dictionary (web content)
 */
export interface CompressionCodec {
    /** Unique identifier (stored in compressed frame header) */
    readonly id: number;
    /** Human-readable name */
    readonly name: string;
    /** Compress data. Returns compressed bytes (may be larger than input). */
    encode(data: Uint8Array): Uint8Array;
    /** Decompress data back to original. */
    decode(data: Uint8Array, originalSize: number): Uint8Array;
}
export declare class RawCodec implements CompressionCodec {
    readonly id = 0;
    readonly name = "raw";
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array): Uint8Array;
}
/**
 * RLE — excellent for data with long runs of repeated bytes.
 *
 * Format: [byte, count_high, count_low] triplets.
 * Count is u16 (max run = 65535). Non-runs still emit count=1.
 *
 * Best for: repeated patterns, sparse data, zeroed buffers.
 * Worst for: high-entropy data (3x expansion).
 */
export declare class RLECodec implements CompressionCodec {
    readonly id = 1;
    readonly name = "rle";
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array, originalSize: number): Uint8Array;
}
/**
 * Delta encoding — stores differences between consecutive bytes.
 *
 * Best for: sequential/incremental data, sensor readings, coordinates.
 * Worst for: random data (no benefit, slight overhead from first byte).
 */
export declare class DeltaCodec implements CompressionCodec {
    readonly id = 2;
    readonly name = "delta";
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array, originalSize: number): Uint8Array;
}
/**
 * Simplified LZ77 — sliding window compression with back-references.
 *
 * Format: control byte per group of 8 items.
 *   - Bit 0 = literal byte follows
 *   - Bit 1 = back-reference follows: [offset_high:4 | length:4, offset_low:8]
 *     offset = 12 bits (max 4095), length = 4 bits + 3 (range 3–18)
 *
 * Window size: 4096 bytes. Min match: 3. Max match: 18.
 *
 * Best for: general-purpose data with repeated patterns.
 * Worst for: truly random data (slight overhead from control bytes).
 */
export declare class LZ77Codec implements CompressionCodec {
    readonly id = 3;
    readonly name = "lz77";
    private static readonly WINDOW_SIZE;
    private static readonly MIN_MATCH;
    private static readonly MAX_MATCH;
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array, originalSize: number): Uint8Array;
}
/**
 * Brotli via node:zlib — best general-purpose compression ratio.
 *
 * Only available on Node/Bun/Deno. The TopologicalCompressor races it
 * per-chunk against pure-JS codecs — brotli wins on text, raw wins on
 * already-compressed binary. This is the key insight: topological
 * compression adapts per-chunk even when one codec dominates globally.
 *
 * Quality 4 matches nginx on-the-fly default.
 */
export declare class BrotliCodec implements CompressionCodec {
    readonly id = 4;
    readonly name = "brotli";
    private readonly quality;
    constructor(quality?: number);
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array): Uint8Array;
}
/**
 * Gzip via node:zlib — universal fallback, slightly worse ratio than brotli.
 *
 * Level 6 matches nginx default.
 */
export declare class GzipCodec implements CompressionCodec {
    readonly id = 5;
    readonly name = "gzip";
    private readonly level;
    constructor(level?: number);
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array): Uint8Array;
}
/**
 * Canonical Huffman coding — entropy-optimal per-byte compression.
 *
 * Captures the entropy coding stage of Zstandard/DEFLATE. Pure JS,
 * works everywhere. Excels on data with skewed byte distributions
 * where a few byte values dominate.
 *
 * Format:
 *   [0..255]   u8×256  code_lengths (one per possible byte value)
 *   [256..259] u32     total_bits in the encoded stream
 *   [260..]    packed bits (MSB-first)
 *
 * Overhead: 260 bytes. Only wins on chunks where entropy coding
 * saves more than 260 bytes — the race handles this automatically.
 */
export declare class HuffmanCodec implements CompressionCodec {
    readonly id = 6;
    readonly name = "huffman";
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array, originalSize: number): Uint8Array;
}
export declare class DictionaryCodec implements CompressionCodec {
    readonly id = 7;
    readonly name = "dictionary";
    encode(data: Uint8Array): Uint8Array;
    decode(data: Uint8Array, originalSize: number): Uint8Array;
}
/** Pure-JS codecs — zero dependencies, work everywhere */
export declare const PURE_JS_CODECS: CompressionCodec[];
/** All built-in codecs including platform codecs (brotli/gzip via node:zlib) */
export declare const BUILTIN_CODECS: CompressionCodec[];
/** Look up a codec by ID */
export declare function getCodecById(id: number): CompressionCodec;
