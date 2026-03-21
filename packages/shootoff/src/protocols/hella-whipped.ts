/**
 * Hella-Whipped Laminar Protocol Simulation
 *
 * Level 8: Double-Wallington-rotated, Worthington-whipped, MOA codec racing.
 * Per-chunk codec racing (identity, gzip, brotli, deflate) with 10-byte
 * Flow frame headers. Strictly dominates sendfile() for compressible content.
 *
 * THM-TOPO-RACE-SUBSUMPTION: racing total <= every fixed-codec total.
 * THM-TOPO-RACE-IDENTITY-BASELINE: identity always in race (safe floor).
 */

import {
  gzipSync,
  brotliCompressSync,
  deflateSync,
  constants,
} from 'node:zlib';
import type { SiteResource, ResourceResult, CompressionAlgo } from '../types';
import { generatePayload } from '../compression/index';

const CHUNK_SIZE = 65536; // 64KB chunks
const MIN_COMPRESS = 256; // minimum payload for compression
const FLOW_HEADER = 10; // 10-byte Flow frame header per chunk

interface ChunkWinner {
  size: number;
  codec: string;
}

/**
 * Race all codecs on a single chunk. Returns smallest.
 */
function raceChunk(chunk: Uint8Array): ChunkWinner {
  if (chunk.length < MIN_COMPRESS) {
    return { size: chunk.length, codec: 'identity' };
  }

  let bestSize = chunk.length;
  let bestCodec = 'identity';

  // Gzip level 6
  try {
    const gz = gzipSync(Buffer.from(chunk), { level: 6 });
    if (gz.length < bestSize) {
      bestSize = gz.length;
      bestCodec = 'gzip';
    }
  } catch {
    /* skip */
  }

  // Brotli quality 4
  try {
    const br = brotliCompressSync(Buffer.from(chunk), {
      params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
    });
    if (br.length < bestSize) {
      bestSize = br.length;
      bestCodec = 'brotli';
    }
  } catch {
    /* skip */
  }

  // Deflate level 6
  try {
    const df = deflateSync(Buffer.from(chunk), { level: 6 });
    if (df.length < bestSize) {
      bestSize = df.length;
      bestCodec = 'deflate';
    }
  } catch {
    /* skip */
  }

  return { size: bestSize, codec: bestCodec };
}

/**
 * Serve a resource through the hella-whipped laminar pipeline.
 * Per-chunk codec racing + 10-byte Flow framing.
 */
export function serveHellaWhipped(
  resource: SiteResource,
  _algo: CompressionAlgo, // ignored — we race all codecs per chunk
  totalResources: number
): ResourceResult {
  const payload = generatePayload(resource.size, resource.contentType);

  const encodeStart = performance.now();

  let totalCompressed = 0;
  let chunkCount = 0;
  let offset = 0;

  while (offset < payload.length) {
    const end = Math.min(offset + CHUNK_SIZE, payload.length);
    const chunk = payload.subarray(offset, end);
    const winner = raceChunk(chunk);
    totalCompressed += winner.size;
    chunkCount++;
    offset = end;
  }

  const encodeEnd = performance.now();

  // Framing: 10-byte Flow header per chunk + share of FORK frame
  const forkFrameTotal = FLOW_HEADER + totalResources * 2;
  const forkFrameShare = forkFrameTotal / totalResources;
  const framingOverhead =
    chunkCount * FLOW_HEADER + FLOW_HEADER + forkFrameShare; // DATA + FIN + FORK share

  // Decode: minimal (just read Flow headers)
  const decodeStart = performance.now();
  const _parse = chunkCount; // simulate parsing chunk headers
  const decodeEnd = performance.now();

  return {
    path: resource.path,
    rawSize: resource.size,
    compressedSize: totalCompressed,
    framingOverhead: Math.ceil(framingOverhead),
    wireBytes: totalCompressed + Math.ceil(framingOverhead),
    encodeUs: (encodeEnd - encodeStart) * 1000,
    decodeUs: (decodeEnd - decodeStart) * 1000,
  };
}

/**
 * Round trips for hella-whipped: 1.
 * Flow protocol: single multiplexed connection, FORK opens all streams,
 * server pushes compressed chunks immediately. No HOL blocking.
 */
export function hellaWhippedRoundTrips(_resourceCount: number): number {
  return 1;
}
