/**
 * Big Content Site — Aeon-Flux Version (REAL pre-rendered React)
 *
 * This is NOT hand-written HTML. It's the output of `prerenderPage()` —
 * the real Aeon-Flux build pipeline running on a real React component tree.
 *
 * The pipeline:
 *   1. Takes a React component tree (SerializedComponent)
 *   2. Marks interactive nodes for lazy hydration (CommentForm, NewsletterForm)
 *   3. Resolves assets to data URIs (SVG icons inline)
 *   4. Extracts Tailwind classes, generates tree-shaken CSS
 *   5. Generates skeleton CSS for zero-CLS loading
 *   6. Injects ESI state for edge inference
 *   7. Produces a single self-contained HTML document
 *
 * Features the normie site DOESN'T have (but the flux site DOES):
 *   - ESI Translation: auto-translate all content at the edge (8 languages)
 *   - ESI Moderation: AI-moderated comment section (4 comments + form)
 *   - Presence: live viewer count with avatars
 *   - Skeletons: zero-CLS shimmer animations
 *   - Speculation: pre-render predicted next pages
 *   - Lazy hydration: CommentForm + NewsletterForm load on visibility
 *
 * Same content. MORE features. FEWER bytes. ONE request.
 */

import type { SiteManifest } from '../types';
import { prerenderPage } from '../../../../../aeon-flux/packages/build/src/prerender';
import { buildCSSManifest } from '../../../../../aeon-flux/packages/build/src/css-manifest';
import { whipWorthingtonPage } from '../pages/whip-worthington-page';
import type { AssetManifest } from '../../../../../aeon-flux/packages/build/src/asset-manifest';
import type { FontManifest } from '../../../../../aeon-flux/packages/build/src/font-manifest';

// ─── Build manifests (same as production pipeline) ─────────────────────────

const cssManifest = buildCSSManifest();

const assetManifest: AssetManifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  assets: {},
  totalSize: 0,
  totalCount: 0,
};

const fontManifest: FontManifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  fonts: {},
  fontFaceCSS: '',
  totalSize: 0,
  totalCount: 0,
};

// ─── Run the REAL prerender pipeline ───────────────────────────────────────

const prerendered = prerenderPage(whipWorthingtonPage, {
  cssManifest,
  assetManifest,
  fontManifest,
  addHydrationScript: true,
  skeleton: {
    enabled: true,
    minConfidence: 0.3,
    fadeAnimation: true,
    fadeDuration: 150,
    alwaysDynamic: [],
    neverDynamic: [],
  },
  esiState: {
    enabled: true,
    defaultTier: 'free',
    includeEmotionPlaceholder: true,
    defaultFeatures: {
      aiInference: true,
      emotionTracking: true,
      collaboration: false,
      advancedInsights: false,
    },
  },
  env: {
    AEON_MODE: 'flux',
    ESI_ENDPOINT: 'https://inference.edgework.ai',
  },
});

// In production, we'd also have:
//   - Base64-encoded hero image (~384 KB)
//   - Base64-encoded Inter font (~147 KB)
//   - Inline article thumbnails (~450 KB)
// These are simulated in the size since the demo SVGs are tiny.
const PRODUCTION_ASSET_OVERHEAD = 384_000 + 147_000 + 450_000; // ~981 KB

const totalSize = prerendered.size + PRODUCTION_ASSET_OVERHEAD;

// ─── Export fixture ────────────────────────────────────────────────────────

export const bigContentFluxSite: SiteManifest = {
  name: 'big-content-flux',
  description: `Aeon-Flux: React→prerenderPage() with ESI + moderation + presence + skeletons (${(totalSize / 1024).toFixed(0)} KB, 1 resource)`,
  resources: [
    {
      path: '/index.html',
      contentType: 'text/html',
      size: totalSize,
      renderBlocking: true,
      priority: 10,
    },
  ],
};

/** The actual pre-rendered HTML from the pipeline (for inspection/display) */
export const bigContentFluxHTML = prerendered.html;

/** Pre-render metadata */
export const bigContentFluxMeta = {
  htmlSize: prerendered.size,
  cssSize: prerendered.css.length,
  hasSkeletons: !!prerendered.skeletonHtml,
  productionAssetOverhead: PRODUCTION_ASSET_OVERHEAD,
  totalSize,
  features: [
    'ESI Translation (8 languages)',
    'ESI Comment Moderation (4 comments)',
    'ESI TTS (listen to post)',
    'Live Presence (3 viewers)',
    'Zero-CLS Skeletons',
    'Lazy Hydration (CommentForm, NewsletterForm, TTSPlayer)',
    'Speculative Pre-rendering',
    'ESI State Injection',
  ],
};
