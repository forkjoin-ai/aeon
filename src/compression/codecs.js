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
const NODE_ZLIB_SPECIFIER = 'node:zlib';
let cachedNodeZlib;
function isNodeZlibModule(candidate) {
    if (typeof candidate !== 'object' || candidate === null) {
        return false;
    }
    const zlib = candidate;
    return (typeof zlib.brotliCompressSync === 'function' &&
        typeof zlib.brotliDecompressSync === 'function' &&
        typeof zlib.gzipSync === 'function' &&
        typeof zlib.gunzipSync === 'function' &&
        typeof zlib.constants?.BROTLI_PARAM_QUALITY === 'number');
}
function loadNodeZlib() {
    if (cachedNodeZlib !== undefined) {
        return cachedNodeZlib;
    }
    const processLike = globalThis;
    const loadBuiltin = processLike.process?.getBuiltinModule;
    if (typeof loadBuiltin === 'function') {
        try {
            const builtinModule = loadBuiltin(NODE_ZLIB_SPECIFIER);
            if (isNodeZlibModule(builtinModule)) {
                cachedNodeZlib = builtinModule;
                return cachedNodeZlib;
            }
        }
        catch {
            // Fall through to dynamic require for older Node runtimes.
        }
    }
    try {
        const dynamicRequire = new Function('moduleSpecifier', 
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        'return typeof require === "function" ? require(moduleSpecifier) : null;');
        const requiredModule = dynamicRequire(NODE_ZLIB_SPECIFIER);
        if (isNodeZlibModule(requiredModule)) {
            cachedNodeZlib = requiredModule;
            return cachedNodeZlib;
        }
    }
    catch {
        // Workers and browsers intentionally fall through to the pure-codec path.
    }
    cachedNodeZlib = null;
    return cachedNodeZlib;
}
function missingNodeZlibError(codecName) {
    return new Error(`${codecName} requires node:zlib and is unavailable in this runtime.`);
}
// ============================================================================
// Codec 0: Raw (Identity)
// ============================================================================
export class RawCodec {
    id = 0;
    name = 'raw';
    encode(data) {
        return data;
    }
    decode(data) {
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
export class RLECodec {
    id = 1;
    name = 'rle';
    encode(data) {
        if (data.length === 0)
            return new Uint8Array(0);
        // Worst case: every byte is unique → 3x expansion
        const output = new Uint8Array(data.length * 3);
        let writePos = 0;
        let i = 0;
        while (i < data.length) {
            const byte = data[i];
            let runLength = 1;
            while (i + runLength < data.length &&
                data[i + runLength] === byte &&
                runLength < 65535) {
                runLength++;
            }
            output[writePos++] = byte;
            output[writePos++] = (runLength >>> 8) & 0xff;
            output[writePos++] = runLength & 0xff;
            i += runLength;
        }
        return output.subarray(0, writePos);
    }
    decode(data, originalSize) {
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
export class DeltaCodec {
    id = 2;
    name = 'delta';
    encode(data) {
        if (data.length === 0)
            return new Uint8Array(0);
        const output = new Uint8Array(data.length);
        output[0] = data[0]; // First byte stored as-is
        for (let i = 1; i < data.length; i++) {
            output[i] = (data[i] - data[i - 1]) & 0xff;
        }
        return output;
    }
    decode(data, originalSize) {
        const output = new Uint8Array(originalSize);
        if (data.length === 0)
            return output;
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
export class LZ77Codec {
    id = 3;
    name = 'lz77';
    static WINDOW_SIZE = 4096;
    static MIN_MATCH = 3;
    static MAX_MATCH = 18;
    encode(data) {
        if (data.length === 0)
            return new Uint8Array(0);
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
                    while (matchLen < LZ77Codec.MAX_MATCH &&
                        readPos + matchLen < data.length &&
                        data[j + matchLen] === data[readPos + matchLen]) {
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
                }
                else {
                    // Literal: bit stays 0
                    output[writePos++] = data[readPos++];
                }
            }
            output[controlPos] = controlByte;
        }
        return output.subarray(0, writePos);
    }
    decode(data, originalSize) {
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
                }
                else {
                    // Literal
                    output[writePos++] = data[readPos++];
                }
            }
        }
        return output;
    }
}
// ============================================================================
// Codec 4: Brotli (node:zlib wrapper)
// ============================================================================
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
export class BrotliCodec {
    id = 4;
    name = 'brotli';
    quality;
    constructor(quality = 4) {
        this.quality = quality;
    }
    encode(data) {
        const zlib = loadNodeZlib();
        if (!zlib) {
            // node:zlib unavailable (browser/CF Workers) — return raw (will be vented)
            return data;
        }
        return new Uint8Array(zlib.brotliCompressSync(data, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: this.quality,
            },
        }));
    }
    decode(data) {
        const zlib = loadNodeZlib();
        if (!zlib) {
            throw missingNodeZlibError('BrotliCodec');
        }
        return new Uint8Array(zlib.brotliDecompressSync(data));
    }
}
// ============================================================================
// Codec 5: Gzip (node:zlib wrapper)
// ============================================================================
/**
 * Gzip via node:zlib — universal fallback, slightly worse ratio than brotli.
 *
 * Level 6 matches nginx default.
 */
export class GzipCodec {
    id = 5;
    name = 'gzip';
    level;
    constructor(level = 6) {
        this.level = level;
    }
    encode(data) {
        const zlib = loadNodeZlib();
        if (!zlib) {
            return data;
        }
        return new Uint8Array(zlib.gzipSync(data, {
            level: this.level,
        }));
    }
    decode(data) {
        const zlib = loadNodeZlib();
        if (!zlib) {
            throw missingNodeZlibError('GzipCodec');
        }
        return new Uint8Array(zlib.gunzipSync(data));
    }
}
// ============================================================================
// Codec 6: Huffman Coding (Pure JS)
// ============================================================================
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
export class HuffmanCodec {
    id = 6;
    name = 'huffman';
    encode(data) {
        if (data.length < 32)
            return data; // too small for 260-byte overhead
        // Count byte frequencies
        const freq = new Uint32Array(256);
        for (let i = 0; i < data.length; i++)
            freq[data[i]]++;
        // Collect symbols with non-zero frequency
        const symbols = [];
        for (let i = 0; i < 256; i++) {
            if (freq[i] > 0)
                symbols.push({ sym: i, freq: freq[i] });
        }
        if (symbols.length <= 1)
            return data; // single symbol — can't Huffman-encode
        const nodes = symbols.map((s) => ({
            freq: s.freq,
            sym: s.sym,
            left: -1,
            right: -1,
        }));
        const heap = [...nodes];
        heap.sort((a, b) => a.freq - b.freq);
        while (heap.length > 1) {
            const left = heap.shift();
            const right = heap.shift();
            const leftIdx = nodes.indexOf(left);
            const rightIdx = nodes.indexOf(right);
            const parent = {
                freq: left.freq + right.freq,
                sym: -1,
                left: leftIdx,
                right: rightIdx,
            };
            nodes.push(parent);
            let idx = 0;
            while (idx < heap.length && heap[idx].freq <= parent.freq)
                idx++;
            heap.splice(idx, 0, parent);
        }
        // Extract code lengths via DFS
        const codeLengths = new Uint8Array(256);
        const root = nodes.length - 1;
        const dfs = (nodeIdx, depth) => {
            const node = nodes[nodeIdx];
            if (node.left === -1 && node.right === -1) {
                codeLengths[node.sym] = depth || 1;
                return;
            }
            if (node.left >= 0)
                dfs(node.left, depth + 1);
            if (node.right >= 0)
                dfs(node.right, depth + 1);
        };
        dfs(root, 0);
        // Bail if any code exceeds 15 bits (pathological distribution)
        for (let i = 0; i < 256; i++) {
            if (codeLengths[i] > 15)
                return data;
        }
        // Generate canonical codes from sorted (length, symbol) pairs
        const sorted = [];
        for (let i = 0; i < 256; i++) {
            if (codeLengths[i] > 0)
                sorted.push({ sym: i, len: codeLengths[i] });
        }
        sorted.sort((a, b) => a.len - b.len || a.sym - b.sym);
        const codes = new Uint32Array(256);
        let code = 0;
        let prevLen = sorted[0].len;
        codes[sorted[0].sym] = 0;
        for (let i = 1; i < sorted.length; i++) {
            code = (code + 1) << (sorted[i].len - prevLen);
            codes[sorted[i].sym] = code;
            prevLen = sorted[i].len;
        }
        // Calculate total bits
        let totalBits = 0;
        for (let i = 0; i < data.length; i++)
            totalBits += codeLengths[data[i]];
        const totalBytes = Math.ceil(totalBits / 8);
        // Pack: [codeLengths:256][totalBits:u32][packedBits]
        const headerSize = 260;
        const output = new Uint8Array(headerSize + totalBytes);
        output.set(codeLengths, 0);
        new DataView(output.buffer).setUint32(256, totalBits);
        let bitPos = 0;
        for (let i = 0; i < data.length; i++) {
            const sym = data[i];
            const codeVal = codes[sym];
            const codeLen = codeLengths[sym];
            for (let b = codeLen - 1; b >= 0; b--) {
                if ((codeVal >>> b) & 1) {
                    const byteIdx = headerSize + (bitPos >>> 3);
                    output[byteIdx] |= 1 << (7 - (bitPos & 7));
                }
                bitPos++;
            }
        }
        return output;
    }
    decode(data, originalSize) {
        if (data.length < 260)
            return data.subarray(0, originalSize);
        // Read code lengths and total bits
        const codeLengths = data.subarray(0, 256);
        const totalBits = new DataView(data.buffer, data.byteOffset + 256, 4).getUint32(0);
        // Reconstruct canonical codes and build decode tree
        const sorted = [];
        for (let i = 0; i < 256; i++) {
            if (codeLengths[i] > 0)
                sorted.push({ sym: i, len: codeLengths[i] });
        }
        sorted.sort((a, b) => a.len - b.len || a.sym - b.sym);
        // Build binary tree: each node is [leftChild, rightChild, symbol]
        // -1 = no child/no symbol
        const tree = [[-1, -1, -1]];
        const insertCode = (codeVal, len, sym) => {
            let node = 0;
            for (let b = len - 1; b >= 0; b--) {
                const bit = (codeVal >>> b) & 1;
                if (tree[node][bit] === -1) {
                    tree[node][bit] = tree.length;
                    tree.push([-1, -1, -1]);
                }
                node = tree[node][bit];
            }
            tree[node][2] = sym;
        };
        let code = 0;
        let prevLen = sorted[0].len;
        insertCode(0, sorted[0].len, sorted[0].sym);
        for (let i = 1; i < sorted.length; i++) {
            code = (code + 1) << (sorted[i].len - prevLen);
            insertCode(code, sorted[i].len, sorted[i].sym);
            prevLen = sorted[i].len;
        }
        // Decode bits
        const output = new Uint8Array(originalSize);
        let bitPos = 0;
        let outPos = 0;
        const bitsStart = 260;
        while (outPos < originalSize && bitPos < totalBits) {
            let node = 0;
            while (tree[node][2] === -1 && bitPos < totalBits) {
                const byteIdx = bitsStart + (bitPos >>> 3);
                const bit = (data[byteIdx] >>> (7 - (bitPos & 7))) & 1;
                node = tree[node][bit];
                bitPos++;
            }
            if (tree[node][2] !== -1) {
                output[outPos++] = tree[node][2];
            }
        }
        return output;
    }
}
// ============================================================================
// Codec 7: Dictionary Codec (Pure JS, Web-Content Domain)
// ============================================================================
/**
 * Domain-specific dictionary substitution for web content.
 *
 * Pre-seeded with common HTML, CSS, and JavaScript byte patterns.
 * Replaces matches with 2-byte escape codes: [0x00, index].
 * Literal null bytes are escaped as [0x00, 0x00].
 *
 * Excels on web bundles where repeated keywords, tags, and CSS
 * properties appear frequently. The race picks this codec for
 * text-heavy chunks where dictionary matches are plentiful.
 *
 * Entries sorted longest-first for greedy matching.
 */
const DICTIONARY_STRINGS = [
    // Long patterns first (most savings per match)
    'addEventListener', // 16 bytes → 2 = saves 14
    'querySelector', // 13 → 2 = saves 11
    'createElement', // 13 → 2 = saves 11
    'justify-content', // 15 → 2 = saves 13
    'align-items:center', // 19 → 2 = saves 17
    'textContent', // 11 → 2 = saves 9
    'display:flex', // 12 → 2 = saves 10
    'display:grid', // 12 → 2 = saves 10
    'display:none', // 12 → 2 = saves 10
    'background:', // 11 → 2 = saves 9
    'font-weight:', // 12 → 2 = saves 10
    'font-size:', // 10 → 2 = saves 8
    'className', // 9 → 2 = saves 7
    'undefined', // 9 → 2 = saves 7
    'container', // 9 → 2 = saves 7
    'transform:', // 10 → 2 = saves 8
    'overflow:', // 9 → 2 = saves 7
    'position:', // 9 → 2 = saves 7
    'function ', // 9 → 2 = saves 7
    'children', // 8 → 2 = saves 6
    'document', // 8 → 2 = saves 6
    'display:', // 8 → 2 = saves 6
    'padding:', // 8 → 2 = saves 6
    'onClick', // 7 → 2 = saves 5
    'useState', // 8 → 2 = saves 6
    'https://', // 8 → 2 = saves 6
    'default', // 7 → 2 = saves 5
    'extends', // 7 → 2 = saves 5
    'return ', // 7 → 2 = saves 5
    'export ', // 7 → 2 = saves 5
    'import ', // 7 → 2 = saves 5
    'margin:', // 7 → 2 = saves 5
    'border:', // 7 → 2 = saves 5
    'cursor:', // 7 → 2 = saves 5
    'height:', // 7 → 2 = saves 5
    '</span>', // 7 → 2 = saves 5
    'color:', // 6 → 2 = saves 4
    'width:', // 6 → 2 = saves 4
    'const ', // 6 → 2 = saves 4
    'class ', // 6 → 2 = saves 4
    '</div>', // 6 → 2 = saves 4
    '<span ', // 6 → 2 = saves 4
    '<div ', // 5 → 2 = saves 3
    'async', // 5 → 2 = saves 3
    'await', // 5 → 2 = saves 3
    'false', // 5 → 2 = saves 3
    'this.', // 5 → 2 = saves 3
    'props', // 5 → 2 = saves 3
    'state', // 5 → 2 = saves 3
    '</p>', // 4 → 2 = saves 2
    'null', // 4 → 2 = saves 2
    'true', // 4 → 2 = saves 2
    'flex', // 4 → 2 = saves 2
    'grid', // 4 → 2 = saves 2
    'none', // 4 → 2 = saves 2
    'auto', // 4 → 2 = saves 2
    'self', // 4 → 2 = saves 2
    '.css', // 4 → 2 = saves 2
    '.com', // 4 → 2 = saves 2
    'var(', // 4 → 2 = saves 2
    '<p>', // 3 → 2 = saves 1
    '.js', // 3 → 2 = saves 1
    'px;', // 3 → 2 = saves 1
    'rem', // 3 → 2 = saves 1
];
/** Pre-encoded dictionary entries as byte arrays, sorted longest-first */
const DICTIONARY = DICTIONARY_STRINGS.map((s) => new TextEncoder().encode(s));
export class DictionaryCodec {
    id = 7;
    name = 'dictionary';
    encode(data) {
        if (data.length < 4)
            return data;
        const output = [];
        let pos = 0;
        while (pos < data.length) {
            let matched = false;
            // Greedy: try entries from longest to shortest
            for (let idx = 0; idx < DICTIONARY.length; idx++) {
                const entry = DICTIONARY[idx];
                if (pos + entry.length > data.length)
                    continue;
                let match = true;
                for (let j = 0; j < entry.length; j++) {
                    if (data[pos + j] !== entry[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    output.push(0x00, idx + 1); // escape + 1-indexed entry
                    pos += entry.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                if (data[pos] === 0x00) {
                    output.push(0x00, 0x00); // escape literal null
                }
                else {
                    output.push(data[pos]);
                }
                pos++;
            }
        }
        return new Uint8Array(output);
    }
    decode(data, originalSize) {
        const output = [];
        let pos = 0;
        while (pos < data.length && output.length < originalSize) {
            if (data[pos] === 0x00) {
                pos++;
                if (data[pos] === 0x00) {
                    output.push(0x00); // literal null
                }
                else {
                    const entry = DICTIONARY[data[pos] - 1];
                    for (let j = 0; j < entry.length; j++)
                        output.push(entry[j]);
                }
                pos++;
            }
            else {
                output.push(data[pos]);
                pos++;
            }
        }
        return new Uint8Array(output);
    }
}
// ============================================================================
// Codec Registry
// ============================================================================
/** Pure-JS codecs — zero dependencies, work everywhere */
export const PURE_JS_CODECS = [
    new RawCodec(),
    new RLECodec(),
    new DeltaCodec(),
    new LZ77Codec(),
    new HuffmanCodec(),
    new DictionaryCodec(),
];
/** All built-in codecs including platform codecs (brotli/gzip via node:zlib) */
export const BUILTIN_CODECS = [
    ...PURE_JS_CODECS,
    new BrotliCodec(),
    new GzipCodec(),
];
/** Codec registry map for O(1) lookup */
const CODEC_MAP = new Map(BUILTIN_CODECS.map((c) => [c.id, c]));
/** Look up a codec by ID */
export function getCodecById(id) {
    const codec = CODEC_MAP.get(id);
    if (!codec) {
        throw new Error(`Unknown codec ID: ${id}`);
    }
    return codec;
}
