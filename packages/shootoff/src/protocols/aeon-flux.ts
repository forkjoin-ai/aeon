/**
 * Aeon-Flux Protocol — Shootoff Implementation
 *
 * Aeon-Flux eliminates the resource graph entirely. Instead of
 * N resources served over a protocol, it's ONE pre-rendered
 * self-contained HTML document. CSS inlined, JS inlined,
 * images as data URIs, fonts as base64.
 *
 * Two transport modes:
 *
 *   1. **aeon-flux-http**: Single HTTP response (normie browser)
 *      One GET, one response. Standard HTTP headers.
 *      This is the baseline for "how fast can you get a complete page?"
 *
 *   2. **aeon-flux-flow**: Single Aeon Flow frame (flow-aware client)
 *      One WebSocket, one flow frame. 10-byte header.
 *      Plus: the flow streams ALL route pages simultaneously
 *      (total preload), so subsequent navigations are from cache.
 *
 * The key insight: Aeon-Flux doesn't just optimize the protocol —
 * it eliminates the need for multiple resources entirely.
 * The comparison becomes: "What if there was nothing to multiplex?"
 */

import type { SiteResource, ResourceResult, CompressionAlgo } from '../types';
import { generatePayload, compress } from '../compression';

// ─── HTTP/1.1 headers for a single large HTML response ────────────────────

const AEON_FLUX_HTTP_REQUEST_HEADERS = [
  'GET / HTTP/1.1',
  'Host: site.example.com',
  'Accept: text/html,application/xhtml+xml',
  'Accept-Encoding: gzip, deflate, br',
  'Accept-Language: en-US,en;q=0.9',
  'Connection: keep-alive',
  'User-Agent: Mozilla/5.0 AeonFlux/1.0',
  'Sec-Fetch-Dest: document',
  'Sec-Fetch-Mode: navigate',
  'Sec-Fetch-Site: none',
].join('\r\n').length + 4; // +4 for \r\n\r\n

function aeonFluxHttpResponseHeaders(
  resource: SiteResource,
  compressedSize: number,
  compression: CompressionAlgo
): number {
  const headers = [
    'HTTP/1.1 200 OK',
    `Content-Type: ${resource.contentType}`,
    `Content-Length: ${compressedSize}`,
    'Cache-Control: public, max-age=31536000, immutable',
    'X-Aeon-Mode: flux',
    'X-Aeon-Process: shootoff-demo',
    'Access-Control-Allow-Origin: *',
    'Vary: Accept-Encoding',
    'Date: Mon, 10 Mar 2026 00:00:00 GMT',
    'Server: aeon-flow-site/1.0',
  ];
  if (compression !== 'none') {
    headers.push(`Content-Encoding: ${compression === 'brotli' ? 'br' : compression}`);
  }
  return headers.join('\r\n').length + 4;
}

// ─── Aeon Flow frame header (10 bytes) ────────────────────────────────────

const AEON_FLOW_FRAME_HEADER = 10;

/**
 * Serve a single resource via HTTP (aeon-flux-http mode).
 * One request, one response, one resource.
 */
export function serveAeonFluxHttp(
  resource: SiteResource,
  compression: CompressionAlgo
): ResourceResult {
  const startEncode = performance.now();
  const payload = generatePayload(resource.size, resource.contentType);
  const compressedBuf = compress(payload, compression);
  const compressed = compressedBuf.length;
  const encodeTime = performance.now() - startEncode;

  const requestHeaders = AEON_FLUX_HTTP_REQUEST_HEADERS;
  const responseHeaders = aeonFluxHttpResponseHeaders(resource, compressed, compression);
  const framingOverhead = requestHeaders + responseHeaders;

  const startDecode = performance.now();
  // Decoding = parse response headers (trivial for single response)
  const decodeTime = performance.now() - startDecode;

  return {
    path: resource.path,
    rawSize: resource.size,
    compressedSize: compressed,
    framingOverhead,
    wireBytes: compressed + framingOverhead,
    encodeUs: encodeTime * 1000,
    decodeUs: decodeTime * 1000,
  };
}

/**
 * Serve a single resource via Aeon Flow (aeon-flux-flow mode).
 * One WebSocket, one flow frame. 10-byte header.
 */
export function serveAeonFluxFlow(
  resource: SiteResource,
  compression: CompressionAlgo
): ResourceResult {
  const startEncode = performance.now();
  const payload = generatePayload(resource.size, resource.contentType);
  const compressedBuf = compress(payload, compression);
  const compressed = compressedBuf.length;
  const encodeTime = performance.now() - startEncode;

  // Two frames: DATA + FIN (like aeon-flow, but only 1 stream)
  const framingOverhead = AEON_FLOW_FRAME_HEADER * 2;

  const startDecode = performance.now();
  const decodeTime = performance.now() - startDecode;

  return {
    path: resource.path,
    rawSize: resource.size,
    compressedSize: compressed,
    framingOverhead,
    wireBytes: compressed + framingOverhead,
    encodeUs: encodeTime * 1000,
    decodeUs: decodeTime * 1000,
  };
}

/** Round trips for aeon-flux over HTTP: 2 (TLS handshake + single request) */
export function aeonFluxHttpRoundTrips(): number {
  return 2; // TCP+TLS + GET/response
}

/** Round trips for aeon-flux over flow: 1 (WebSocket already open from bootstrap) */
export function aeonFluxFlowRoundTrips(): number {
  return 1; // WebSocket already open, just receive the frame
}
