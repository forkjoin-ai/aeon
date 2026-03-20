import { describe, it, expect } from 'vitest';
import { FlowCodec, FIN } from '../../flow';
import type { FlowFrame } from '../../flow';

// ═══════════════════════════════════════════════════════════════════════════════
// We test the encoding/decoding logic directly rather than importing from
// aeon-flux-runtime (which has peer deps). The encode/decode logic is
// pure FlowCodec operations — same binary format regardless of wrapper.
// ═══════════════════════════════════════════════════════════════════════════════

/** Minimal FlowSiteManifest for testing */
interface FlowSiteManifest {
  version: string;
  totalStreams: number;
  totalSize: number;
  streams: Array<{
    streamId: number;
    type: string;
    contentType: string;
    size: number;
    cachePath: string;
    route?: string;
    sessionId?: string;
  }>;
  generatedAt: string;
}

/** Encode a site flow: manifest on stream 0, content on even streams */
function encodeSiteFlow(
  pages: Array<{
    route: string;
    sessionId: string;
    html: Uint8Array;
    sessionData: Uint8Array;
  }>,
  manifest: object,
  runtimeJs: Uint8Array,
  assets?: Map<string, { data: Uint8Array; contentType: string }>
): Uint8Array {
  const codec = FlowCodec.createSync();
  const frames: FlowFrame[] = [];
  const descriptors: FlowSiteManifest['streams'] = [];
  let nextStreamId = 2;

  // Route manifest
  const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
  descriptors.push({
    streamId: nextStreamId,
    type: 'manifest',
    contentType: 'application/json',
    size: manifestBytes.byteLength,
    cachePath: '/.aeon/manifest.json',
  });
  frames.push({
    streamId: nextStreamId,
    sequence: 0,
    flags: FIN,
    payload: manifestBytes,
  });
  nextStreamId += 2;

  // Runtime JS
  descriptors.push({
    streamId: nextStreamId,
    type: 'runtime',
    contentType: 'application/javascript',
    size: runtimeJs.byteLength,
    cachePath: '/.aeon/runtime.js',
  });
  frames.push({
    streamId: nextStreamId,
    sequence: 0,
    flags: FIN,
    payload: runtimeJs,
  });
  nextStreamId += 2;

  // Pages
  for (const page of pages) {
    descriptors.push({
      streamId: nextStreamId,
      type: 'html',
      contentType: 'text/html',
      size: page.html.byteLength,
      cachePath: page.route,
      route: page.route,
    });
    frames.push({
      streamId: nextStreamId,
      sequence: 0,
      flags: FIN,
      payload: page.html,
    });
    nextStreamId += 2;

    descriptors.push({
      streamId: nextStreamId,
      type: 'session',
      contentType: 'application/json',
      size: page.sessionData.byteLength,
      cachePath: `/.aeon/sessions/${page.sessionId}.json`,
      route: page.route,
      sessionId: page.sessionId,
    });
    frames.push({
      streamId: nextStreamId,
      sequence: 0,
      flags: FIN,
      payload: page.sessionData,
    });
    nextStreamId += 2;
  }

  // Assets
  if (assets) {
    for (const [path, asset] of assets) {
      descriptors.push({
        streamId: nextStreamId,
        type: 'asset',
        contentType: asset.contentType,
        size: asset.data.byteLength,
        cachePath: path,
      });
      frames.push({
        streamId: nextStreamId,
        sequence: 0,
        flags: FIN,
        payload: asset.data,
      });
      nextStreamId += 2;
    }
  }

  const siteManifest: FlowSiteManifest = {
    version: '1.0.0',
    totalStreams: descriptors.length + 1,
    totalSize: descriptors.reduce((s, d) => s + d.size, 0),
    streams: descriptors,
    generatedAt: new Date().toISOString(),
  };
  const siteManifestBytes = new TextEncoder().encode(
    JSON.stringify(siteManifest)
  );

  const manifestFrame: FlowFrame = {
    streamId: 0,
    sequence: 0,
    flags: FIN,
    payload: siteManifestBytes,
  };

  return codec.encodeBatch([manifestFrame, ...frames]);
}

/** Decode a site flow back into manifest + content map */
function decodeSiteFlow(data: Uint8Array): {
  manifest: FlowSiteManifest;
  contents: Map<string, Uint8Array>;
} {
  const codec = FlowCodec.createSync();
  const frames = codec.decodeBatch(data);

  const manifestFrame = frames[0];
  expect(manifestFrame.streamId).toBe(0);

  const manifest: FlowSiteManifest = JSON.parse(
    new TextDecoder().decode(manifestFrame.payload)
  );

  const streamToPath = new Map<number, string>();
  for (const desc of manifest.streams) {
    streamToPath.set(desc.streamId, desc.cachePath);
  }

  const contents = new Map<string, Uint8Array>();
  for (let i = 1; i < frames.length; i++) {
    const frame = frames[i];
    const path = streamToPath.get(frame.streamId);
    if (path) {
      contents.set(path, frame.payload.slice());
    }
  }

  return { manifest, contents };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Flow Site Loader', () => {
  const encoder = new TextEncoder();

  describe('encodeSiteFlow / decodeSiteFlow roundtrip', () => {
    it('should encode and decode a single page site', () => {
      const html = encoder.encode('<html><body>Hello</body></html>');
      const session = encoder.encode('{"route":"/","title":"Home"}');
      const runtime = encoder.encode('console.log("aeon runtime")');
      const manifest = {
        version: '1',
        routes: [{ pattern: '/', sessionId: 'home', isAeon: true }],
        generatedAt: new Date().toISOString(),
      };

      const encoded = encodeSiteFlow(
        [{ route: '/', sessionId: 'home', html, sessionData: session }],
        manifest,
        runtime
      );

      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.byteLength).toBeGreaterThan(0);

      const { manifest: decoded, contents } = decodeSiteFlow(encoded);

      expect(decoded.version).toBe('1.0.0');
      expect(decoded.streams.length).toBe(4); // manifest + runtime + html + session

      // Verify content integrity
      expect(contents.get('/.aeon/manifest.json')).toBeDefined();
      expect(contents.get('/.aeon/runtime.js')).toBeDefined();
      expect(contents.get('/')).toBeDefined();
      expect(contents.get('/.aeon/sessions/home.json')).toBeDefined();

      // Byte-identical roundtrip
      expect(new TextDecoder().decode(contents.get('/')!)).toBe(
        '<html><body>Hello</body></html>'
      );
      expect(new TextDecoder().decode(contents.get('/.aeon/runtime.js')!)).toBe(
        'console.log("aeon runtime")'
      );
    });

    it('should encode and decode a multi-page site', () => {
      const pages = [
        {
          route: '/',
          sessionId: 'home',
          html: encoder.encode('<h1>Home</h1>'),
          sessionData: encoder.encode('{"title":"Home"}'),
        },
        {
          route: '/about',
          sessionId: 'about',
          html: encoder.encode('<h1>About</h1>'),
          sessionData: encoder.encode('{"title":"About"}'),
        },
        {
          route: '/contact',
          sessionId: 'contact',
          html: encoder.encode('<h1>Contact</h1>'),
          sessionData: encoder.encode('{"title":"Contact"}'),
        },
      ];

      const manifest = {
        version: '1',
        routes: pages.map((p) => ({
          pattern: p.route,
          sessionId: p.sessionId,
          isAeon: true,
        })),
        generatedAt: new Date().toISOString(),
      };

      const runtime = encoder.encode('// runtime');

      const encoded = encodeSiteFlow(pages, manifest, runtime);
      const { manifest: decoded, contents } = decodeSiteFlow(encoded);

      // 1 route manifest + 1 runtime + 3 pages × 2 (html + session) = 8 streams
      expect(decoded.streams.length).toBe(8);

      // Verify each page roundtrips correctly
      for (const page of pages) {
        const html = contents.get(page.route);
        expect(html).toBeDefined();
        expect(new TextDecoder().decode(html!)).toBe(
          new TextDecoder().decode(page.html)
        );

        const session = contents.get(`/.aeon/sessions/${page.sessionId}.json`);
        expect(session).toBeDefined();
        expect(new TextDecoder().decode(session!)).toBe(
          new TextDecoder().decode(page.sessionData)
        );
      }
    });

    it('should handle additional assets', () => {
      const html = encoder.encode('<h1>Home</h1>');
      const session = encoder.encode('{}');
      const runtime = encoder.encode('// rt');
      const manifest = {
        version: '1',
        routes: [{ pattern: '/', sessionId: 'x', isAeon: true }],
        generatedAt: new Date().toISOString(),
      };

      const assets = new Map([
        [
          '/fonts/inter.woff2',
          {
            data: new Uint8Array([0x77, 0x4f, 0x46, 0x32]),
            contentType: 'font/woff2',
          },
        ],
        [
          '/images/logo.png',
          {
            data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
            contentType: 'image/png',
          },
        ],
      ]);

      const encoded = encodeSiteFlow(
        [{ route: '/', sessionId: 'x', html, sessionData: session }],
        manifest,
        runtime,
        assets
      );

      const { contents } = decodeSiteFlow(encoded);

      // Verify assets roundtrip
      const font = contents.get('/fonts/inter.woff2');
      expect(font).toBeDefined();
      expect(font![0]).toBe(0x77);
      expect(font![1]).toBe(0x4f);

      const logo = contents.get('/images/logo.png');
      expect(logo).toBeDefined();
      expect(logo![0]).toBe(0x89);
      expect(logo![1]).toBe(0x50);
    });

    it('should handle empty pages array', () => {
      const runtime = encoder.encode('// rt');
      const manifest = {
        version: '1',
        routes: [],
        generatedAt: new Date().toISOString(),
      };

      const encoded = encodeSiteFlow([], manifest, runtime);
      const { manifest: decoded, contents } = decodeSiteFlow(encoded);

      // 1 route manifest + 1 runtime = 2 streams
      expect(decoded.streams.length).toBe(2);
      expect(contents.size).toBe(2);
    });

    it('should preserve binary content exactly', () => {
      // Create a large-ish binary payload
      const binaryData = new Uint8Array(10000);
      for (let i = 0; i < binaryData.length; i++) {
        binaryData[i] = i % 256;
      }

      const html = binaryData; // Pretend HTML is binary for this test
      const session = encoder.encode('{}');
      const runtime = encoder.encode('// rt');
      const manifest = {
        version: '1',
        routes: [{ pattern: '/', sessionId: 'x', isAeon: true }],
        generatedAt: new Date().toISOString(),
      };

      const encoded = encodeSiteFlow(
        [{ route: '/', sessionId: 'x', html, sessionData: session }],
        manifest,
        runtime
      );

      const { contents } = decodeSiteFlow(encoded);
      const recovered = contents.get('/');
      expect(recovered).toBeDefined();
      expect(recovered!.byteLength).toBe(binaryData.byteLength);

      // Byte-identical
      for (let i = 0; i < binaryData.length; i++) {
        expect(recovered![i]).toBe(binaryData[i]);
      }
    });
  });

  describe('manifest structure', () => {
    it('should include correct stream types', () => {
      const html = encoder.encode('<h1>Test</h1>');
      const session = encoder.encode('{}');
      const runtime = encoder.encode('// rt');
      const manifest = {
        version: '1',
        routes: [{ pattern: '/', sessionId: 'x', isAeon: true }],
        generatedAt: new Date().toISOString(),
      };

      const encoded = encodeSiteFlow(
        [{ route: '/', sessionId: 'x', html, sessionData: session }],
        manifest,
        runtime
      );

      const { manifest: decoded } = decodeSiteFlow(encoded);

      const types = decoded.streams.map((s) => s.type);
      expect(types).toContain('manifest');
      expect(types).toContain('runtime');
      expect(types).toContain('html');
      expect(types).toContain('session');
    });

    it('should report correct total size', () => {
      const html = encoder.encode('<h1>Test</h1>');
      const session = encoder.encode('{"a":1}');
      const runtime = encoder.encode('console.log(1)');
      const manifest = {
        version: '1',
        routes: [{ pattern: '/', sessionId: 'x', isAeon: true }],
        generatedAt: new Date().toISOString(),
      };

      const encoded = encodeSiteFlow(
        [{ route: '/', sessionId: 'x', html, sessionData: session }],
        manifest,
        runtime
      );

      const { manifest: decoded } = decodeSiteFlow(encoded);

      // totalSize should be sum of all stream payloads
      const expectedSize = decoded.streams.reduce((s, d) => s + d.size, 0);
      expect(decoded.totalSize).toBe(expectedSize);
    });

    it('should use even stream IDs (client-initiated)', () => {
      const html = encoder.encode('<h1>A</h1>');
      const session = encoder.encode('{}');
      const runtime = encoder.encode('//');
      const manifest = {
        version: '1',
        routes: [{ pattern: '/', sessionId: 'x', isAeon: true }],
        generatedAt: new Date().toISOString(),
      };

      const encoded = encodeSiteFlow(
        [{ route: '/', sessionId: 'x', html, sessionData: session }],
        manifest,
        runtime
      );

      const { manifest: decoded } = decodeSiteFlow(encoded);

      // All content stream IDs should be even
      for (const stream of decoded.streams) {
        expect(stream.streamId % 2).toBe(0);
      }
    });
  });

  describe('100-page site simulation', () => {
    it('should encode/decode a 100-page site efficiently', () => {
      const pages = Array.from({ length: 100 }, (_, i) => ({
        route: `/page-${i}`,
        sessionId: `session-${i}`,
        html: encoder.encode(
          `<html><body><h1>Page ${i}</h1><p>Content for page ${i}</p></body></html>`
        ),
        sessionData: encoder.encode(
          JSON.stringify({ title: `Page ${i}`, route: `/page-${i}` })
        ),
      }));

      const manifest = {
        version: '1',
        routes: pages.map((p) => ({
          pattern: p.route,
          sessionId: p.sessionId,
          isAeon: true,
        })),
        generatedAt: new Date().toISOString(),
      };

      const runtime = encoder.encode(
        'console.log("aeon runtime v1.0"); /* padding to simulate real runtime */'
      );

      const encoded = encodeSiteFlow(pages, manifest, runtime);

      // Should be smaller than 100 individual HTTP responses would be
      // (no per-request HTTP overhead)
      expect(encoded.byteLength).toBeLessThan(100 * 1024); // Should be well under 100KB

      const { manifest: decoded, contents } = decodeSiteFlow(encoded);

      // 1 route manifest + 1 runtime + 100 × 2 (html + session) = 202 streams
      expect(decoded.streams.length).toBe(202);

      // Verify all pages present
      for (let i = 0; i < 100; i++) {
        expect(contents.has(`/page-${i}`)).toBe(true);
        expect(contents.has(`/.aeon/sessions/session-${i}.json`)).toBe(true);
      }

      // Spot-check content integrity
      expect(new TextDecoder().decode(contents.get('/page-42')!)).toContain(
        'Page 42'
      );
      expect(new TextDecoder().decode(contents.get('/page-99')!)).toContain(
        'Page 99'
      );
    });
  });
});
