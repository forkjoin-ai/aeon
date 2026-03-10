/**
 * Compression Codecs — Pure-JS implementations for topological compression.
 *
 * Each codec implements the same interface. The TopologicalCompressor races
 * them per chunk — different data regions get different codecs automatically.
 *
 * Zero dependencies. Works on CF Workers, Deno, Node, Bun, browsers.
 */

// ============================================================================
// Codec Interface
// ============================================================================

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

// ============================================================================
// Codec 0: Raw (Identity)
// ============================================================================

export class RawCodec implements CompressionCodec {
  readonly id = 0;
  readonly name = 'raw';

  encode(data: Uint8Array): Uint8Array {
    return data;
  }

  decode(data: Uint8Array): Uint8Array {
    return data;
  }
}

// ============================================================================
// Codec 1: Run-Length Encoding
// ============================================================================

/**
 * RLE — excellent for data with long runs of repeated bytes.
 *
 * Format: [byte, count_high, count_low] triplets.
 * Count is u16 (max run = 65535). Non-runs still emit count=1.
 *
 * Best for: repeated patterns, sparse data, zeroed buffers.
 * Worst for: high-entropy data (3x expansion).
 */
export class RLECodec implements CompressionCodec {
  readonly id = 1;
  readonly name = 'rle';

  encode(data: Uint8Array): Uint8Array {
    if (data.length === 0) return new Uint8Array(0);

    // Worst case: every byte is unique → 3x expansion
    const output = new Uint8Array(data.length * 3);
    let writePos = 0;
    let i = 0;

    while (i < data.length) {
      const byte = data[i];
      let runLength = 1;

      while (
        i + runLength < data.length &&
        data[i + runLength] === byte &&
        runLength < 65535
      ) {
        runLength++;
      }

      output[writePos++] = byte;
      output[writePos++] = (runLength >>> 8) & 0xff;
      output[writePos++] = runLength & 0xff;
      i += runLength;
    }

    return output.subarray(0, writePos);
  }

  decode(data: Uint8Array, originalSize: number): Uint8Array {
    const output = new Uint8Array(originalSize);
    let readPos = 0;
    let writePos = 0;

    while (readPos < data.length && writePos < originalSize) {
      const byte = data[readPos++];
      const count = (data[readPos++] << 8) | data[readPos++];
      const end = Math.min(writePos + count, originalSize);
      output.fill(byte, writePos, end);
      writePos = end;
    }

    return output;
  }
}

// ============================================================================
// Codec 2: Delta Encoding
// ============================================================================

/**
 * Delta encoding — stores differences between consecutive bytes.
 *
 * Best for: sequential/incremental data, sensor readings, coordinates.
 * Worst for: random data (no benefit, slight overhead from first byte).
 */
export class DeltaCodec implements CompressionCodec {
  readonly id = 2;
  readonly name = 'delta';

  encode(data: Uint8Array): Uint8Array {
    if (data.length === 0) return new Uint8Array(0);

    const output = new Uint8Array(data.length);
    output[0] = data[0]; // First byte stored as-is
    for (let i = 1; i < data.length; i++) {
      output[i] = (data[i] - data[i - 1]) & 0xff;
    }
    return output;
  }

  decode(data: Uint8Array, originalSize: number): Uint8Array {
    const output = new Uint8Array(originalSize);
    if (data.length === 0) return output;

    output[0] = data[0];
    for (let i = 1; i < data.length && i < originalSize; i++) {
      output[i] = (output[i - 1] + data[i]) & 0xff;
    }
    return output;
  }
}

// ============================================================================
// Codec 3: LZ77-Simple (Sliding Window)
// ============================================================================

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
export class LZ77Codec implements CompressionCodec {
  readonly id = 3;
  readonly name = 'lz77';

  private static readonly WINDOW_SIZE = 4096;
  private static readonly MIN_MATCH = 3;
  private static readonly MAX_MATCH = 18;

  encode(data: Uint8Array): Uint8Array {
    if (data.length === 0) return new Uint8Array(0);

    // Generous output buffer (worst case ~1.125x)
    const output = new Uint8Array(data.length + Math.ceil(data.length / 8) + 16);
    let writePos = 0;
    let readPos = 0;

    while (readPos < data.length) {
      const controlPos = writePos++;
      let controlByte = 0;

      for (let bit = 0; bit < 8 && readPos < data.length; bit++) {
        const windowStart = Math.max(0, readPos - LZ77Codec.WINDOW_SIZE);
        let bestOffset = 0;
        let bestLength = 0;

        // Find longest match in window
        for (let j = windowStart; j < readPos; j++) {
          let matchLen = 0;
          while (
            matchLen < LZ77Codec.MAX_MATCH &&
            readPos + matchLen < data.length &&
            data[j + matchLen] === data[readPos + matchLen]
          ) {
            matchLen++;
          }
          if (matchLen >= LZ77Codec.MIN_MATCH && matchLen > bestLength) {
            bestOffset = readPos - j;
            bestLength = matchLen;
          }
        }

        if (bestLength >= LZ77Codec.MIN_MATCH) {
          // Back-reference: set bit to 1
          controlByte |= 1 << bit;
          const lengthCode = bestLength - LZ77Codec.MIN_MATCH;
          output[writePos++] = ((bestOffset >>> 8) & 0x0f) | (lengthCode << 4);
          output[writePos++] = bestOffset & 0xff;
          readPos += bestLength;
        } else {
          // Literal: bit stays 0
          output[writePos++] = data[readPos++];
        }
      }

      output[controlPos] = controlByte;
    }

    return output.subarray(0, writePos);
  }

  decode(data: Uint8Array, originalSize: number): Uint8Array {
    const output = new Uint8Array(originalSize);
    let readPos = 0;
    let writePos = 0;

    while (readPos < data.length && writePos < originalSize) {
      const controlByte = data[readPos++];

      for (let bit = 0; bit < 8 && readPos < data.length && writePos < originalSize; bit++) {
        if (controlByte & (1 << bit)) {
          // Back-reference
          const byte1 = data[readPos++];
          const byte2 = data[readPos++];
          const offset = ((byte1 & 0x0f) << 8) | byte2;
          const length = (byte1 >>> 4) + LZ77Codec.MIN_MATCH;

          const srcStart = writePos - offset;
          for (let k = 0; k < length && writePos < originalSize; k++) {
            output[writePos++] = output[srcStart + k];
          }
        } else {
          // Literal
          output[writePos++] = data[readPos++];
        }
      }
    }

    return output;
  }
}

// ============================================================================
// Codec Registry
// ============================================================================

/** All built-in codecs, indexed by ID */
export const BUILTIN_CODECS: CompressionCodec[] = [
  new RawCodec(),
  new RLECodec(),
  new DeltaCodec(),
  new LZ77Codec(),
];

/** Look up a codec by ID */
export function getCodecById(id: number): CompressionCodec {
  const codec = BUILTIN_CODECS[id];
  if (!codec) {
    throw new Error(`Unknown codec ID: ${id}`);
  }
  return codec;
}
