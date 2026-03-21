/**
 * HTTP/3 Protocol Simulation
 *
 * Accurate overhead modeling for HTTP/3 (RFC 9114):
 * - QUIC transport (RFC 9000) instead of TCP+TLS
 * - QPACK header compression (RFC 9204) — evolved from HPACK
 * - Variable-length integer encoding for frame headers
 * - Per-stream independence (no TCP head-of-line blocking)
 * - 1 RTT connection setup (vs 2 for TCP+TLS), 0-RTT with session resumption
 *
 * QUIC overhead per packet:
 * - Short header: 1 (form+flags) + 0-20 (DCID) + 1-4 (packet number) + 16 (AEAD tag)
 *   Typical short header ≈ 22 bytes
 * - Long header (initial): ~40-60 bytes (only for handshake)
 *
 * HTTP/3 frame header:
 * - Variable-length type (1-8 bytes, typically 1)
 * - Variable-length length (1-8 bytes, typically 1-2)
 * - Typical DATA frame header: 2-3 bytes (vs HTTP/2's fixed 9 bytes)
 *
 * QUIC STREAM frame overhead:
 * - Type: 1 byte
 * - Stream ID: 1-8 bytes (variable-length integer)
 * - Offset: 0-8 bytes (optional, variable-length)
 * - Length: 0-8 bytes (optional, variable-length)
 * - Typical: ~4-6 bytes per STREAM frame
 */

import type { SiteResource, ResourceResult, CompressionAlgo } from '../types';
import { generatePayload, compress } from '../compression/index';

/**
 * QUIC short header overhead per packet.
 * 1 (flags) + 4 (DCID, typical) + 2 (packet number, typical) + 16 (AEAD auth tag)
 */
const QUIC_SHORT_HEADER = 23;

/** Typical QUIC STREAM frame header: type(1) + streamId(2) + offset(2) + length(2) */
const QUIC_STREAM_FRAME_HEADER = 7;

/** QUIC max payload per packet (typical 1200 byte initial, 1350+ after path validation) */
const QUIC_MAX_PACKET_PAYLOAD = 1350;

/**
 * HTTP/3 frame header uses variable-length integers.
 * DATA frame: type=0x00 (1 byte) + length (1-2 bytes for most payloads)
 * Much smaller than HTTP/2's fixed 9-byte frame header.
 */
function h3DataFrameHeaderSize(payloadSize: number): number {
  // Type field: 0x00 = 1 byte
  // Length field: variable-length integer
  // 0-63: 1 byte, 64-16383: 2 bytes, 16384-1073741823: 4 bytes
  const typeBytes = 1;
  let lengthBytes: number;
  if (payloadSize <= 63) {
    lengthBytes = 1;
  } else if (payloadSize <= 16383) {
    lengthBytes = 2;
  } else if (payloadSize <= 1073741823) {
    lengthBytes = 4;
  } else {
    lengthBytes = 8;
  }
  return typeBytes + lengthBytes;
}

/**
 * HEADERS frame header size (same variable-length encoding as DATA).
 */
function h3HeadersFrameHeaderSize(encodedHeadersSize: number): number {
  const typeBytes = 1; // type=0x01
  let lengthBytes: number;
  if (encodedHeadersSize <= 63) {
    lengthBytes = 1;
  } else if (encodedHeadersSize <= 16383) {
    lengthBytes = 2;
  } else {
    lengthBytes = 4;
  }
  return typeBytes + lengthBytes;
}

/**
 * QPACK header compression size estimation.
 *
 * QPACK is similar to HPACK but designed for out-of-order delivery:
 * - Static table: 99 entries (larger than HPACK's 61)
 * - Dynamic table: similar to HPACK but with encoder/decoder streams
 * - Required Insert Count prefix: 1-2 bytes
 * - Delta Base: 1 byte
 * - Huffman encoding: ~80% compression on strings
 *
 * QPACK is slightly more efficient than HPACK for common headers due to
 * the larger static table, but adds 2-3 bytes prefix per header block.
 */
function qpackRequestSize(resource: SiteResource, isFirst: boolean): number {
  // QPACK prefix: Required Insert Count (1 byte) + Delta Base (1 byte)
  const qpackPrefix = 2;

  if (isFirst) {
    // :method GET = 1 byte (static table index, larger table than HPACK)
    // :scheme https = 1 byte (static table)
    // :authority = ~12 bytes (Huffman, slightly better encoding)
    // :path = path.length * 0.8
    // accept, user-agent, accept-encoding = ~55 bytes (more static table hits)
    const pathBytes = Math.ceil(resource.path.length * 0.8);
    return qpackPrefix + 1 + 1 + 12 + pathBytes + 55;
  } else {
    // Subsequent: aggressive dynamic table reuse
    const pathBytes = Math.ceil(resource.path.length * 0.8);
    return qpackPrefix + 1 + 1 + 1 + pathBytes + 6;
  }
}

function qpackResponseSize(
  resource: SiteResource,
  compressedSize: number,
  algo: CompressionAlgo,
  isFirst: boolean
): number {
  const qpackPrefix = 2;

  if (isFirst) {
    // :status 200 = 1 byte (static table, entry 25)
    // content-type = ~contentType.length * 0.8
    // content-length = ~7 bytes
    // server, date, cache-control, etc. = ~70 bytes first time
    const ctBytes = Math.ceil(resource.contentType.length * 0.8);
    return qpackPrefix + 1 + ctBytes + 7 + 70 + (algo !== 'none' ? 3 : 0);
  } else {
    const ctBytes = Math.ceil(resource.contentType.length * 0.8);
    return qpackPrefix + 1 + ctBytes + 7 + 10 + (algo !== 'none' ? 2 : 0);
  }
}

/**
 * Calculate QUIC transport overhead for a given payload.
 *
 * Each QUIC packet has a short header + STREAM frame header.
 * Payload is split across multiple packets if larger than MTU.
 */
function quicTransportOverhead(payloadSize: number): number {
  if (payloadSize === 0) return 0;

  // Effective payload per packet = MTU - QUIC header - STREAM frame header
  const effectivePayload =
    QUIC_MAX_PACKET_PAYLOAD - QUIC_SHORT_HEADER - QUIC_STREAM_FRAME_HEADER;
  const numPackets = Math.ceil(payloadSize / effectivePayload);

  // Each packet has QUIC short header + STREAM frame header
  return numPackets * (QUIC_SHORT_HEADER + QUIC_STREAM_FRAME_HEADER);
}

/**
 * Simulate serving a resource over HTTP/3.
 */
export function serveHttp3(
  resource: SiteResource,
  algo: CompressionAlgo,
  isFirstRequest: boolean
): ResourceResult {
  const payload = generatePayload(resource.size, resource.contentType);

  const encodeStart = performance.now();
  const compressed = compress(payload, algo);
  const encodeEnd = performance.now();

  // QPACK-encoded request and response headers
  const reqQpack = qpackRequestSize(resource, isFirstRequest);
  const resQpack = qpackResponseSize(
    resource,
    compressed.length,
    algo,
    isFirstRequest
  );

  // HTTP/3 HEADERS frames (variable-length frame headers, much smaller than H2's 9 bytes)
  const reqHeadersFrameHeader = h3HeadersFrameHeaderSize(reqQpack);
  const resHeadersFrameHeader = h3HeadersFrameHeaderSize(resQpack);
  const headersOverhead =
    reqHeadersFrameHeader + reqQpack + resHeadersFrameHeader + resQpack;

  // HTTP/3 DATA frame header (variable-length, typically 2-3 bytes vs H2's 9)
  const dataFrameHeader = h3DataFrameHeaderSize(compressed.length);

  // QUIC transport-layer overhead (packet headers + STREAM frame headers)
  // This is the HTTP/3 → QUIC → wire overhead that H2 doesn't pay (it uses TCP)
  // For fair comparison with HTTP/2 (which doesn't account for TCP overhead either),
  // we only count the HTTP/3 framing overhead, not the QUIC packet overhead.
  // Both HTTP/2 and HTTP/3 sit on top of encrypted transports.
  const framingOverhead = headersOverhead + dataFrameHeader;

  const decodeStart = performance.now();
  // Simulate QPACK decode + frame parsing
  const _parsed = headersOverhead;
  const decodeEnd = performance.now();

  return {
    path: resource.path,
    rawSize: resource.size,
    compressedSize: compressed.length,
    framingOverhead,
    wireBytes: compressed.length + framingOverhead,
    encodeUs: (encodeEnd - encodeStart) * 1000,
    decodeUs: (decodeEnd - decodeStart) * 1000,
  };
}

/**
 * Round trips for HTTP/3:
 * QUIC combines crypto + transport handshake in 1 RTT (vs TCP+TLS = 2 RTTs).
 * With 0-RTT resumption, can be 0 RTTs for returning clients.
 * We model the common case: 1 RTT initial + multiplexed streams.
 */
export function http3RoundTrips(_resourceCount: number): number {
  return 1; // QUIC 1-RTT handshake + multiplexed streams
}
