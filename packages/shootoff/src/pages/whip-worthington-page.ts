/**
 * Whip Worthington's Flaxseed Empire — React Component Tree
 *
 * This is the REAL React page definition. Not hand-written HTML.
 * The `prerenderPage()` pipeline produces a self-contained HTML
 * document from this tree — with tree-shaken CSS, inline assets,
 * skeleton generation, ESI directives, and lazy hydration.
 *
 * Features the normie site DOESN'T have:
 *   - ESI Translation: auto-translate all content at the edge
 *   - ESI Moderation: AI-moderated comment section
 *   - Presence: live viewer count + cursors
 *   - Skeletons: zero-CLS shimmer while hydrating
 *   - Speculation: pre-render predicted next pages
 *   - Lazy hydration: interactive components load on visibility
 *
 * Written as a PageSession (SerializedComponent tree) — the format
 * that prerenderPage() consumes.
 */

import type { PageSession, SerializedComponent } from '../../../../../aeon-flux/packages/build/src/types';

// ─── Inline SVG Icons (no separate fetches) ────────────────────────────────

const HomeIcon: SerializedComponent = {
  type: 'svg',
  props: {
    className: 'w-5 h-5 inline-block',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
  },
  children: [{
    type: 'path',
    props: { d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  }],
};

const GlobeIcon: SerializedComponent = {
  type: 'svg',
  props: {
    className: 'w-4 h-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
  },
  children: [{
    type: 'path',
    props: { d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  }],
};

const UsersIcon: SerializedComponent = {
  type: 'svg',
  props: {
    className: 'w-4 h-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
  },
  children: [{
    type: 'path',
    props: { d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  }],
};

const ShieldIcon: SerializedComponent = {
  type: 'svg',
  props: {
    className: 'w-4 h-4 text-emerald-400',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
  },
  children: [{
    type: 'path',
    props: { d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  }],
};

const SendIcon: SerializedComponent = {
  type: 'svg',
  props: {
    className: 'w-4 h-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
  },
  children: [{
    type: 'path',
    props: { d: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  }],
};

// ─── Presence Indicator (ESI-powered, live viewer count) ───────────────────

const PresenceIndicator: SerializedComponent = {
  type: 'div',
  props: {
    className: 'flex items-center gap-2 text-sm',
    'data-aeon-interactive': 'true',
    'data-aeon-component': 'PresenceIndicator',
    'data-esi-directive': 'presence',
    'data-esi-model': 'custom',
    'data-esi-refresh': '5000',
  },
  children: [
    {
      type: 'div',
      props: { className: 'flex -space-x-2' },
      children: [
        { type: 'div', props: { className: 'w-6 h-6 rounded-full bg-amber-500 border-2 border-neutral-950', 'aria-label': 'Viewer 1' }, children: [] },
        { type: 'div', props: { className: 'w-6 h-6 rounded-full bg-emerald-500 border-2 border-neutral-950', 'aria-label': 'Viewer 2' }, children: [] },
        { type: 'div', props: { className: 'w-6 h-6 rounded-full bg-sky-500 border-2 border-neutral-950', 'aria-label': 'Viewer 3' }, children: [] },
      ],
    },
    {
      type: 'span',
      props: { className: 'text-emerald-400' },
      children: ['3 viewing'],
    },
    UsersIcon,
  ],
};

// ─── ESI Translation Bar ───────────────────────────────────────────────────

const TranslationBar: SerializedComponent = {
  type: 'div',
  props: {
    className: 'flex items-center gap-3 px-6 py-2 bg-neutral-900 border-b border-neutral-800 text-sm',
    'data-aeon-interactive': 'true',
    'data-aeon-component': 'TranslationBar',
    'data-esi-directive': 'translate',
    'data-esi-model': 'llm',
    'data-esi-signals': 'preferences',
    'data-esi-cache-ttl': '3600',
  },
  children: [
    GlobeIcon,
    {
      type: 'span',
      props: { className: 'text-neutral-400' },
      children: ['Auto-translate:'],
    },
    {
      type: 'select',
      props: {
        className: 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded px-2 py-1 text-sm',
        'aria-label': 'Select language',
      },
      children: [
        { type: 'option', props: { value: 'en' }, children: ['English'] },
        { type: 'option', props: { value: 'es' }, children: ['Espa\u00f1ol'] },
        { type: 'option', props: { value: 'fr' }, children: ['Fran\u00e7ais'] },
        { type: 'option', props: { value: 'de' }, children: ['Deutsch'] },
        { type: 'option', props: { value: 'ja' }, children: ['\u65e5\u672c\u8a9e'] },
        { type: 'option', props: { value: 'zh' }, children: ['\u4e2d\u6587'] },
        { type: 'option', props: { value: 'ar' }, children: ['\u0627\u0644\u0639\u0631\u0628\u064a\u0629'] },
        { type: 'option', props: { value: 'pt' }, children: ['Portugu\u00eas'] },
      ],
    },
    {
      type: 'span',
      props: { className: 'text-neutral-600 ml-auto' },
      children: ['Powered by ESI edge inference'],
    },
  ],
};

// ─── Hero Image (base64 data URI in production) ────────────────────────────

const HeroSection: SerializedComponent = {
  type: 'section',
  props: {
    className: 'relative h-96 overflow-hidden',
    'data-skeleton-shape': 'rect',
    'data-skeleton-height': '24rem',
  },
  children: [
    {
      type: 'img',
      props: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23d4a574'/%3E%3Cstop offset='100%25' stop-color='%23b8860b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1200' height='400'/%3E%3Ctext x='600' y='180' text-anchor='middle' fill='%230a0a0a' font-size='36' font-weight='bold'%3EGolden Flaxseed Fields%3C/text%3E%3Ctext x='600' y='230' text-anchor='middle' fill='%231a1a1a' font-size='18'%3ESunset over the Worthington Estate%3C/text%3E%3C/svg%3E",
        alt: 'Golden flaxseed fields stretching to the horizon at sunset',
        className: 'w-full h-full object-cover',
      },
    },
    {
      type: 'div',
      props: { className: 'absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-neutral-950' },
      children: [
        {
          type: 'h1',
          props: {
            className: 'text-4xl font-bold text-amber-400',
            'data-esi-directive': 'translate',
          },
          children: ['Welcome to the Worthington Way'],
        },
        {
          type: 'p',
          props: {
            className: 'text-xl text-neutral-300 max-w-2xl mt-2',
            'data-esi-directive': 'translate',
          },
          children: [
            'Some inherit oil. Some inherit tech. I inherited flax. And honestly? I wouldn\'t have it any other way.',
          ],
        },
      ],
    },
  ],
};

// ─── Blog Post Card ────────────────────────────────────────────────────────

function blogPost(
  title: string,
  excerpt: string,
  date: string,
  dateStr: string,
  imgColor: string,
  imgAlt: string,
): SerializedComponent {
  return {
    type: 'article',
    props: {
      className: 'flex gap-6 mb-8 pb-8 border-b border-neutral-800',
      'data-skeleton-shape': 'container',
    },
    children: [
      {
        type: 'img',
        props: {
          src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='${encodeURIComponent(imgColor)}' width='200' height='150'/%3E%3C/svg%3E`,
          alt: imgAlt,
          className: 'w-48 h-36 object-cover rounded-lg shrink-0',
          'data-skeleton-shape': 'rect',
          'data-skeleton-width': '12rem',
          'data-skeleton-height': '9rem',
        },
      },
      {
        type: 'div',
        props: { className: 'flex-1' },
        children: [
          {
            type: 'h3',
            props: {
              className: 'text-xl font-semibold text-neutral-100 mb-2',
              'data-esi-directive': 'translate',
            },
            children: [title],
          },
          {
            type: 'p',
            props: {
              className: 'text-neutral-400 leading-relaxed',
              'data-esi-directive': 'translate',
              'data-skeleton-shape': 'text-block',
              'data-skeleton-lines': '3',
            },
            children: [excerpt],
          },
          {
            type: 'time',
            props: {
              className: 'text-sm text-neutral-600 block mt-3',
              datetime: date,
            },
            children: [dateStr],
          },
        ],
      },
    ],
  };
}

// ─── Comment (ESI-moderated) ───────────────────────────────────────────────

function comment(
  author: string,
  text: string,
  timeAgo: string,
  avatarColor: string,
): SerializedComponent {
  return {
    type: 'div',
    props: {
      className: 'flex gap-3 py-4 border-b border-neutral-800',
      'data-esi-directive': 'moderate',
      'data-esi-model': 'classify',
      'data-esi-fallback': 'pending-review',
      'data-esi-cache-ttl': '86400',
    },
    children: [
      {
        type: 'div',
        props: {
          className: `w-8 h-8 rounded-full ${avatarColor} shrink-0 flex items-center justify-center text-sm font-bold text-neutral-950`,
        },
        children: [author.charAt(0).toUpperCase()],
      },
      {
        type: 'div',
        props: { className: 'flex-1' },
        children: [
          {
            type: 'div',
            props: { className: 'flex items-center gap-2 mb-1' },
            children: [
              { type: 'span', props: { className: 'font-medium text-neutral-200 text-sm' }, children: [author] },
              ShieldIcon,
              { type: 'span', props: { className: 'text-xs text-neutral-600' }, children: [timeAgo] },
            ],
          },
          {
            type: 'p',
            props: {
              className: 'text-neutral-400 text-sm leading-relaxed',
              'data-esi-directive': 'translate',
            },
            children: [text],
          },
        ],
      },
    ],
  };
}

// ─── Comment Section with ESI Moderation ───────────────────────────────────

const CommentSection: SerializedComponent = {
  type: 'section',
  props: {
    className: 'mt-8 pt-8 border-t border-neutral-800',
  },
  children: [
    {
      type: 'div',
      props: { className: 'flex items-center justify-between mb-6' },
      children: [
        {
          type: 'h2',
          props: { className: 'text-xl font-bold text-amber-400' },
          children: ['Comments'],
        },
        {
          type: 'div',
          props: { className: 'flex items-center gap-2 text-xs text-emerald-400' },
          children: [
            ShieldIcon,
            'ESI-moderated',
          ],
        },
      ],
    },
    // Existing comments
    comment(
      'FlaxFanatic42',
      'The omega-3 extraction lab tour was incredible. The fact that Worthington flaxseed oil has 3x the alpha-linolenic acid of competitors is genuinely impressive. This isn\'t just legacy wealth — they\'re innovating.',
      '2 hours ago',
      'bg-amber-500',
    ),
    comment(
      'SeedSkeptic',
      'OK but can we talk about how the "International Seed Council" was literally founded by a Worthington? That\'s like giving yourself an award. I mean... the oil futures ARE up 340% though. So maybe he earned it?',
      '5 hours ago',
      'bg-sky-500',
    ),
    comment(
      'LinenLover99',
      '"People will always need linen." Cornelius was right. My grandmother has Worthington linen tablecloths from the 1950s that are STILL in perfect condition. Meanwhile my IKEA curtains lasted 6 months.',
      '8 hours ago',
      'bg-emerald-500',
    ),
    comment(
      'AgriTechBro',
      'The real story here is the precision agriculture Worthington is doing. Satellite-guided flax harvesting, ML-optimized crop rotation, automated moisture sensing. This is a tech company disguised as a farm.',
      '1 day ago',
      'bg-purple-500',
    ),
    // Comment form (interactive, lazy-hydrated)
    {
      type: 'div',
      props: {
        className: 'mt-6 pt-6 border-t border-neutral-800',
        'data-aeon-interactive': 'true',
        'data-aeon-component': 'CommentForm',
      },
      children: [
        {
          type: 'div',
          props: { className: 'flex items-start gap-3' },
          children: [
            {
              type: 'div',
              props: { className: 'w-8 h-8 rounded-full bg-neutral-700 shrink-0 flex items-center justify-center text-sm text-neutral-400' },
              children: ['?'],
            },
            {
              type: 'div',
              props: { className: 'flex-1' },
              children: [
                {
                  type: 'textarea',
                  props: {
                    className: 'w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm text-neutral-200 resize-none',
                    placeholder: 'Add a comment... (ESI-moderated for quality)',
                    rows: '3',
                    'aria-label': 'Write a comment',
                  },
                },
                {
                  type: 'div',
                  props: { className: 'flex items-center justify-between mt-2' },
                  children: [
                    {
                      type: 'span',
                      props: { className: 'text-xs text-neutral-600' },
                      children: ['Comments are AI-moderated for toxicity, spam, and relevance'],
                    },
                    {
                      type: 'button',
                      props: {
                        className: 'flex items-center gap-2 px-4 py-2 bg-amber-500 text-neutral-950 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors',
                        type: 'submit',
                      },
                      children: [
                        SendIcon,
                        'Post',
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── TTS Player (ESI text-to-speech) ───────────────────────────────────────

const SpeakerIcon: SerializedComponent = {
  type: 'svg',
  props: { className: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
  children: [{ type: 'path', props: { d: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' } }],
};

const TTSPlayer: SerializedComponent = {
  type: 'div',
  props: {
    className: 'flex items-center gap-4 px-6 py-3 bg-amber-950 border border-amber-900 rounded-xl mb-8',
    'data-aeon-interactive': 'true',
    'data-aeon-component': 'TTSPlayer',
    'data-esi-directive': 'tts',
    'data-esi-model': 'tts',
    'data-esi-cache-ttl': '86400',
  },
  children: [
    {
      type: 'button',
      props: {
        className: 'flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full text-neutral-950 hover:bg-amber-400 transition-colors shrink-0',
        'aria-label': 'Listen to this article',
        type: 'button',
      },
      children: [SpeakerIcon],
    },
    {
      type: 'div',
      props: { className: 'flex-1' },
      children: [
        { type: 'div', props: { className: 'text-sm font-medium text-amber-300' }, children: ['Listen to this post'] },
        { type: 'div', props: { className: 'text-xs text-amber-600' }, children: ['ESI text-to-speech \u2014 generated at the edge, cached for 24h'] },
        {
          type: 'div',
          props: { className: 'w-full h-1 bg-amber-900 rounded-full mt-2' },
          children: [
            { type: 'div', props: { className: 'w-0 h-1 bg-amber-400 rounded-full', 'data-tts-progress': 'true' }, children: [] },
          ],
        },
      ],
    },
    { type: 'span', props: { className: 'text-xs text-amber-700 shrink-0' }, children: ['~6 min'] },
  ],
};

// ─── Newsletter Form (Interactive, Lazy-Hydrated) ──────────────────────────

const NewsletterSection: SerializedComponent = {
  type: 'section',
  props: {
    className: 'text-center py-12 px-8 bg-neutral-900 rounded-xl max-w-xl mx-auto my-12',
    'data-aeon-interactive': 'true',
    'data-aeon-component': 'NewsletterForm',
  },
  children: [
    {
      type: 'h2',
      props: {
        className: 'text-2xl font-bold text-amber-400',
        'data-esi-directive': 'translate',
      },
      children: ['The Weekly Seed'],
    },
    {
      type: 'p',
      props: {
        className: 'text-neutral-400 mt-4 mb-6',
        'data-esi-directive': 'translate',
      },
      children: [
        'Join 47,000 subscribers who get my thoughts on flax markets, lifestyle, and why I believe linseed oil is the next avocado toast.',
      ],
    },
    {
      type: 'form',
      props: { className: 'flex gap-3 justify-center' },
      children: [
        {
          type: 'input',
          props: {
            type: 'email',
            placeholder: 'your@email.com',
            'aria-label': 'Email address',
            className: 'px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 text-base',
          },
        },
        {
          type: 'button',
          props: {
            type: 'submit',
            className: 'px-6 py-3 bg-amber-500 text-neutral-950 rounded-lg font-semibold hover:bg-amber-400 transition-colors',
          },
          children: ['Subscribe'],
        },
      ],
    },
  ],
};

// ─── Full Page Tree ────────────────────────────────────────────────────────

const pageTree: SerializedComponent = {
  type: 'div',
  props: { className: 'min-h-screen bg-neutral-950 text-neutral-200' },
  children: [
    // ── Header ──
    {
      type: 'header',
      props: { className: 'flex items-center px-6 py-4 border-b border-neutral-800' },
      children: [
        {
          type: 'a',
          props: { className: 'text-2xl font-bold text-amber-400', href: '/' },
          children: ['WW'],
        },
        {
          type: 'span',
          props: { className: 'text-neutral-500 italic ml-4 flex-1' },
          children: ['Flax. Fortune. Freedom.'],
        },
        PresenceIndicator,
        {
          type: 'nav',
          props: { className: 'flex gap-6 ml-6' },
          children: [
            { type: 'a', props: { className: 'text-neutral-400 text-sm', href: '/about' }, children: ['About Whip'] },
            { type: 'a', props: { className: 'text-neutral-400 text-sm', href: '/empire' }, children: ['The Empire'] },
            { type: 'a', props: { className: 'text-amber-400 text-sm font-medium', href: '/blog' }, children: ['Blog'] },
            { type: 'a', props: { className: 'text-neutral-400 text-sm', href: '/contact' }, children: ['Contact'] },
          ],
        },
      ],
    },

    // ── Translation Bar (ESI) ──
    TranslationBar,

    // ── Main Content ──
    {
      type: 'main',
      children: [
        HeroSection,

        // ── Blog Posts ──
        {
          type: 'section',
          props: { className: 'max-w-3xl mx-auto px-6 py-12' },
          children: [
            // TTS Player
            TTSPlayer,

            {
              type: 'h2',
              props: {
                className: 'text-2xl font-bold text-amber-400 mb-8',
                'data-esi-directive': 'translate',
              },
              children: ['Latest from the Field'],
            },

            blogPost(
              'Why I Turned Down Silicon Valley (Again)',
              'They offered me a corner office with a view of the Bay. I counter-offered with a tour of our omega-3 extraction lab. They didn\'t call back. Their loss — our linseed oil futures are up 340% this quarter.',
              '2026-03-08',
              'March 8, 2026',
              '#333',
              'Whip inspecting a flaxseed processing facility',
            ),
            blogPost(
              'The Flaxseed Sommelier: A Role I Invented',
              'People laughed when I hired a sommelier for flaxseed varieties. They stopped laughing when our "Golden Prairie Reserve \'24" won the International Seed Council\'s highest honor. Yes, that\'s a real thing. I founded it.',
              '2026-03-05',
              'March 5, 2026',
              '#444',
              'A spread of artisanal flaxseed products',
            ),
            blogPost(
              'Great-Grandfather Cornelius and the Flax Rush of 1923',
              'While everyone else was chasing gold, Cornelius Worthington III was quietly buying up every flax field from Manitoba to Montana. "Gold runs out," he reportedly told a skeptical banker. "People will always need linen." The banker\'s great-grandson now works for us.',
              '2026-03-01',
              'March 1, 2026',
              '#555',
              'Vintage Worthington Flax Co. advertisement from 1923',
            ),

            // ── Comment Section (ESI-Moderated) ──
            CommentSection,
          ],
        },

        // ── Newsletter ──
        NewsletterSection,
      ],
    },

    // ── Footer ──
    {
      type: 'footer',
      props: { className: 'text-center py-8 px-6 border-t border-neutral-800' },
      children: [
        {
          type: 'p',
          props: { className: 'text-neutral-600 text-sm' },
          children: ['\u00a9 2026 Worthington Flaxseed Holdings, LLC. All rights reserved.'],
        },
        {
          type: 'p',
          props: { className: 'text-neutral-700 text-sm italic mt-2' },
          children: ['"In Flax We Trust" \u2014 Cornelius Worthington III, 1923'],
        },
        {
          type: 'div',
          props: { className: 'flex items-center justify-center gap-2 mt-4 text-xs text-emerald-600' },
          children: [
            'Served via Aeon-Flux \u2014 1 request, 0 round trips, ESI at the edge',
          ],
        },
      ],
    },
  ],
};

// ─── Export PageSession ────────────────────────────────────────────────────

export const whipWorthingtonPage: PageSession = {
  route: '/',
  tree: pageTree,
  data: {
    title: "Whip Worthington's Flaxseed Empire | The Blog",
    description: 'The official blog of Whip Worthington III, heir to the Worthington Flaxseed dynasty. Musings on flax, fortune, and the finer things.',
  },
  schema: { version: '1.0.0' },
};
