/**
 * The Wally Wallington Wonder Archive — React Component Tree
 *
 * Microfrontend SPA reimagined as an Aeon-Flux site.
 * The normie version: 95 resources (45 JS chunks, 16 CSS files, 20 SVG icons).
 * This version: 1 pre-rendered HTML document with everything inline.
 *
 * Features the normie site DOESN'T have:
 *   - ESI Translation: every section translatable at the edge
 *   - ESI Moderation: community discussion section
 *   - Presence: see who else is reading about stone-moving
 *   - Skeletons: zero-CLS page load
 *   - Speculation: pre-render all 5 nav routes
 *   - Lazy hydration: navigation + forms load on visibility
 */

import type { PageSession, SerializedComponent } from '../../../../../aeon-flux/packages/build/src/types';

// ─── Inline SVG Icons ──────────────────────────────────────────────────────

const HomeIcon: SerializedComponent = {
  type: 'svg',
  props: { className: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
  children: [{ type: 'path', props: { d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' } }],
};

const GlobeIcon: SerializedComponent = {
  type: 'svg',
  props: { className: 'w-4 h-4', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
  children: [{ type: 'path', props: { d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' } }],
};

const ShieldIcon: SerializedComponent = {
  type: 'svg',
  props: { className: 'w-4 h-4 text-blue-400', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
  children: [{ type: 'path', props: { d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' } }],
};

const SpeakerIcon: SerializedComponent = {
  type: 'svg',
  props: { className: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
  children: [{ type: 'path', props: { d: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' } }],
};

// ─── TTS Player (ESI-powered, edge text-to-speech) ─────────────────────────

const TTSPlayer: SerializedComponent = {
  type: 'div',
  props: {
    className: 'flex items-center gap-4 px-6 py-3 bg-blue-950 border border-blue-900 rounded-xl mb-8',
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
        className: 'flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white hover:bg-blue-400 transition-colors shrink-0',
        'aria-label': 'Listen to this article',
        type: 'button',
      },
      children: [SpeakerIcon],
    },
    {
      type: 'div',
      props: { className: 'flex-1' },
      children: [
        {
          type: 'div',
          props: { className: 'text-sm font-medium text-blue-300' },
          children: ['Listen to this article'],
        },
        {
          type: 'div',
          props: { className: 'text-xs text-blue-500' },
          children: ['ESI text-to-speech \u2014 generated at the edge, cached for 24h'],
        },
        {
          type: 'div',
          props: {
            className: 'w-full h-1 bg-blue-900 rounded-full mt-2',
            'aria-label': 'Audio progress',
          },
          children: [
            {
              type: 'div',
              props: { className: 'w-0 h-1 bg-blue-400 rounded-full', 'data-tts-progress': 'true' },
              children: [],
            },
          ],
        },
      ],
    },
    {
      type: 'span',
      props: { className: 'text-xs text-blue-600 shrink-0' },
      children: ['~4 min'],
    },
  ],
};

// ─── Technique Section ─────────────────────────────────────────────────────

function techniqueSection(
  title: string,
  description: string,
): SerializedComponent {
  return {
    type: 'section',
    props: {
      className: 'mb-8 pb-8 border-b border-neutral-800',
      'data-skeleton-shape': 'container',
    },
    children: [
      {
        type: 'h3',
        props: {
          className: 'text-xl font-semibold text-neutral-100 mb-3',
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
          'data-skeleton-lines': '4',
        },
        children: [description],
      },
    ],
  };
}

// ─── Discussion Comment (ESI-moderated) ────────────────────────────────────

function discussionComment(
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
          type: 'h1',
          props: { className: 'flex items-center gap-2 text-lg font-bold text-blue-400' },
          children: [
            HomeIcon,
            'The Wally Wallington Wonder Archive',
          ],
        },
        // Presence
        {
          type: 'div',
          props: {
            className: 'flex items-center gap-2 ml-auto mr-4 text-sm',
            'data-aeon-interactive': 'true',
            'data-aeon-component': 'PresenceIndicator',
            'data-esi-directive': 'presence',
          },
          children: [
            {
              type: 'div',
              props: { className: 'flex -space-x-2' },
              children: [
                { type: 'div', props: { className: 'w-5 h-5 rounded-full bg-blue-500 border-2 border-neutral-950' }, children: [] },
                { type: 'div', props: { className: 'w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-950' }, children: [] },
              ],
            },
            { type: 'span', props: { className: 'text-emerald-400 text-xs' }, children: ['2 reading'] },
          ],
        },
        // Nav
        {
          type: 'nav',
          props: {
            className: 'flex gap-4',
            'data-aeon-interactive': 'true',
            'data-aeon-component': 'AppNav',
          },
          children: [
            { type: 'a', props: { className: 'text-blue-400 text-sm bg-blue-950 px-3 py-1 rounded', href: '/' }, children: ['Home'] },
            { type: 'a', props: { className: 'text-neutral-500 text-sm px-3 py-1', href: '/dashboard' }, children: ['Dashboard'] },
            { type: 'a', props: { className: 'text-neutral-500 text-sm px-3 py-1', href: '/settings' }, children: ['Settings'] },
            { type: 'a', props: { className: 'text-neutral-500 text-sm px-3 py-1', href: '/analytics' }, children: ['Analytics'] },
            { type: 'a', props: { className: 'text-neutral-500 text-sm px-3 py-1', href: '/docs' }, children: ['Docs'] },
          ],
        },
      ],
    },

    // ── Translation Bar ──
    {
      type: 'div',
      props: {
        className: 'flex items-center gap-3 px-6 py-2 bg-neutral-900 border-b border-neutral-800 text-sm',
        'data-aeon-interactive': 'true',
        'data-aeon-component': 'TranslationBar',
        'data-esi-directive': 'translate',
        'data-esi-model': 'llm',
        'data-esi-signals': 'preferences',
      },
      children: [
        GlobeIcon,
        { type: 'span', props: { className: 'text-neutral-400' }, children: ['Auto-translate:'] },
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
          ],
        },
        { type: 'span', props: { className: 'text-neutral-600 ml-auto' }, children: ['Powered by ESI edge inference'] },
      ],
    },

    // ── Main Content ──
    {
      type: 'main',
      props: { className: 'max-w-3xl mx-auto px-6 py-8' },
      children: [
        // Intro
        {
          type: 'p',
          props: {
            className: 'text-lg text-neutral-300 border-l-4 border-blue-400 pl-4 mb-8',
            'data-esi-directive': 'translate',
          },
          children: [
            'This interactive archive celebrates the remarkable work of Wally Wallington, a retired construction worker from Flint, Michigan, who demonstrated that one person \u2014 working alone \u2014 could move, lift, and position stones weighing over 20 tons using nothing but wooden levers, small stone pivots, and gravity itself.',
          ],
        },

        // TTS Player (ESI text-to-speech)
        TTSPlayer,

        // Techniques
        {
          type: 'h2',
          props: {
            className: 'text-2xl font-bold text-blue-400 mb-6',
            'data-esi-directive': 'translate',
          },
          children: ['The Techniques'],
        },

        techniqueSection(
          'The Dynamic Offset Pivot',
          'By placing a small stone pivot slightly off the true center of gravity, Wallington created controlled instability. Push the light end, the stone rotates 180 degrees, and the center of gravity shifts forward. Each rotation becomes a "step" \u2014 a locomotion algorithm where the stone walks over its own center of gravity. Rotational energy converts to linear displacement.',
        ),
        techniqueSection(
          'Multi-Stage Cribbing Jack',
          'Vertical lifting without hydraulics. Tilt, shim, reverse, repeat. As the stone rises inch by inch, a crib of alternating wooden beams grows beneath it. The offset fulcrum ensures that if anything slips, the stone settles back onto the crib rather than toppling. Safety through geometry.',
        ),
        techniqueSection(
          'The Round Road',
          'Not every stone is a perfect rectangle. For irregular masses, Wallington built temporary circular tracks and wooden cradles that normalized any shape into something his pivot system could handle. He essentially standardized the interface so his technique could operate on any input.',
        ),
        techniqueSection(
          'Sand-Box Descent',
          'Gravity lifts, but it also destroys. To lower a 10-ton lintel onto uprights with millimeter precision, Wallington supported the stone on a box of sand and slowly released the grains from the bottom \u2014 like an hourglass. The sand acts as a variable-height support with finer control than any rope or winch.',
        ),
        techniqueSection(
          'The Rolling Pivot (Moving the Barn)',
          'When Wallington moved his entire barn 300 feet, he turned the building into a giant lever. Pivot on one corner, swing the opposite side forward. Swap corners, repeat. The insight: you never need to move the entire mass at once. By pivoting on one corner, you overcome the friction of only a fraction of the weight at any given moment.',
        ),

        // The Three Laws
        {
          type: 'h2',
          props: {
            className: 'text-2xl font-bold text-blue-400 mt-8 mb-4',
            'data-esi-directive': 'translate',
          },
          children: ['The Three Laws'],
        },
        {
          type: 'ol',
          props: { className: 'pl-6 mb-8 text-neutral-400' },
          children: [
            {
              type: 'li',
              props: { className: 'mb-3', 'data-esi-directive': 'translate' },
              children: [
                { type: 'strong', props: { className: 'text-blue-400' }, children: ['Force Multiplication'] },
                ' \u2014 The longer the lever, the less effort required.',
              ],
            },
            {
              type: 'li',
              props: { className: 'mb-3', 'data-esi-directive': 'translate' },
              children: [
                { type: 'strong', props: { className: 'text-blue-400' }, children: ['Friction Reduction'] },
                ' \u2014 The smaller the contact point, the less resistance.',
              ],
            },
            {
              type: 'li',
              props: { className: 'mb-3', 'data-esi-directive': 'translate' },
              children: [
                { type: 'strong', props: { className: 'text-blue-400' }, children: ['Gravity Harvest'] },
                ' \u2014 Use the weight of the object as the battery to power the next movement.',
              ],
            },
          ],
        },

        // ── Discussion Section (ESI-Moderated) ──
        {
          type: 'section',
          props: { className: 'mt-8 pt-8 border-t border-neutral-800' },
          children: [
            {
              type: 'div',
              props: { className: 'flex items-center justify-between mb-6' },
              children: [
                {
                  type: 'h2',
                  props: { className: 'text-xl font-bold text-blue-400' },
                  children: ['Discussion'],
                },
                {
                  type: 'div',
                  props: { className: 'flex items-center gap-2 text-xs text-blue-400' },
                  children: [ShieldIcon, 'ESI-moderated'],
                },
              ],
            },

            discussionComment(
              'StructuralSteve',
              'As a structural engineer, the offset pivot technique is genuinely brilliant. He\'s exploiting the difference between center of gravity and contact point \u2014 that gap IS the energy input. The stone does most of the work.',
              '3 hours ago',
              'bg-blue-500',
            ),
            discussionComment(
              'AncientMystery88',
              'This is EXACTLY how Stonehenge was built. Wallington proved it. The "aliens" crowd is going to be so disappointed. But honestly? One guy with leverage and patience is MORE impressive than aliens.',
              '6 hours ago',
              'bg-amber-500',
            ),
            discussionComment(
              'PhysicsProf',
              'The sand-box descent is essentially an analog PID controller. The sand flow rate is your control variable, gravity is the process, and position is the output. Brilliant engineering without the engineering degree.',
              '1 day ago',
              'bg-emerald-500',
            ),

            // Discussion form
            {
              type: 'div',
              props: {
                className: 'mt-6 pt-6 border-t border-neutral-800',
                'data-aeon-interactive': 'true',
                'data-aeon-component': 'DiscussionForm',
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
                            placeholder: 'Join the discussion... (ESI-moderated)',
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
                              children: ['AI-moderated for quality and relevance'],
                            },
                            {
                              type: 'button',
                              props: {
                                className: 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-400 transition-colors',
                                type: 'submit',
                              },
                              children: ['Post'],
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
        },
      ],
    },

    // ── Footer ──
    {
      type: 'footer',
      props: { className: 'text-center py-8 px-6 border-t border-neutral-800 max-w-3xl mx-auto' },
      children: [
        {
          type: 'p',
          props: {
            className: 'text-neutral-500 text-sm',
            'data-esi-directive': 'translate',
          },
          children: [
            'This archive is a tribute to the ingenuity of Wally Wallington and the timeless engineering principles he demonstrated. His work reminds us that the most elegant solutions often require no electricity, no fuel, and no budget \u2014 just a deep understanding of how the physical world works.',
          ],
        },
        {
          type: 'div',
          props: { className: 'flex items-center justify-center gap-2 mt-4 text-xs text-blue-600' },
          children: [
            'Aeon-Flux \u2014 95 resources \u2192 1 | 16 round trips \u2192 1 | + ESI + Presence + Translation',
          ],
        },
      ],
    },
  ],
};

// ─── Export PageSession ────────────────────────────────────────────────────

export const wallyWallingtonPage: PageSession = {
  route: '/',
  tree: pageTree,
  data: {
    title: 'The Wally Wallington Wonder Archive',
    description: 'Celebrating the remarkable engineering of Wally Wallington — the retired Michigan construction worker who moves 20-ton stones by hand using forgotten technology.',
  },
  schema: { version: '1.0.0' },
};
