/**
 * Microfrontend Site — Aeon-Flux Version (REAL pre-rendered React)
 *
 * Output of `prerenderPage()` on a real React component tree.
 * The normie version: 95 resources, 16 round trips, zero intelligence.
 * This version: 1 resource, 1 round trip, ESI + presence + translation + moderation + TTS.
 *
 * Features ONLY in the flux version:
 *   - ESI Translation: every section translatable at the edge
 *   - ESI Moderation: AI-moderated discussion section
 *   - ESI TTS: "Listen to this article" — read aloud at the edge
 *   - Presence: see who else is reading
 *   - Skeletons: zero-CLS shimmer
 *   - Speculation: pre-render all 5 nav routes
 *   - Lazy hydration: Nav, DiscussionForm, TranslationBar, TTS player
 *
 * 95 resources → 1. 16 round trips → 1. Zero features → seven.
 */

import type { SiteManifest } from '../types';
import { prerenderPage } from '../../../../../aeon-flux/packages/build/src/prerender';
import { buildCSSManifest } from '../../../../../aeon-flux/packages/build/src/css-manifest';
import { wallyWallingtonPage } from '../pages/wally-wallington-page';
import type { AssetManifest } from '../../../../../aeon-flux/packages/build/src/asset-manifest';
import type { FontManifest } from '../../../../../aeon-flux/packages/build/src/font-manifest';

// ─── Build manifests ───────────────────────────────────────────────────────

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

const prerendered = prerenderPage(wallyWallingtonPage, {
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
  },
  env: {
    AEON_MODE: 'flux',
    ESI_ENDPOINT: 'https://inference.edgework.ai',
  },
});

// In production, we'd also have:
//   - Base64-encoded Inter font (~147 KB)
//   - Inline SVG icons are already tiny (~6 KB, already in the tree)
const PRODUCTION_FONT_OVERHEAD = 147_000; // Inter variable font as base64

const totalSize = prerendered.size + PRODUCTION_FONT_OVERHEAD;

// ─── Export fixture ────────────────────────────────────────────────────────

export const microfrontendFluxSite: SiteManifest = {
  name: 'microfrontend-flux',
  description: `Aeon-Flux: React→prerenderPage() with ESI + moderation + presence + TTS + skeletons (${(totalSize / 1024).toFixed(0)} KB, 1 resource)`,
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

/** The actual pre-rendered HTML from the pipeline */
export const microfrontendFluxHTML = prerendered.html;

/** Pre-render metadata */
export const microfrontendFluxMeta = {
  htmlSize: prerendered.size,
  cssSize: prerendered.css.length,
  hasSkeletons: !!prerendered.skeletonHtml,
  productionFontOverhead: PRODUCTION_FONT_OVERHEAD,
  totalSize,
  features: [
    'ESI Translation (6 languages)',
    'ESI Discussion Moderation (3 comments)',
    'ESI TTS (listen to article)',
    'Live Presence (2 readers)',
    'Zero-CLS Skeletons',
    'Lazy Hydration (AppNav, DiscussionForm, TranslationBar)',
    'Speculative Pre-rendering (5 routes)',
    'ESI State Injection',
  ],
};
