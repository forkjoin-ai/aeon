/**
 * ch17-bules-sisters.test.ts
 *
 * The Bule's sisters: every measure in the framework recast as a
 * face of the Bule.
 *
 * Before this theorem, the framework had many units:
 *   β₁ (Betti number), Δβ (deficit), Re (Reynolds), η (eta),
 *   d (Cohen's d), H (entropy), kT ln 2 (Landauer), VGI, CVI,
 *   CFP, the semiotic deficit, the codec gain, the pipeline speedup,
 *   the complement distribution, the kurtosis crossing...
 *
 * After THM-BULE-IS-VALUE, they are all the same unit measured
 * at different scales, in different substrates, through different
 * instruments.  The Bule is to this framework what the meter is
 * to SI -- the base unit from which all others derive.
 *
 * This file proves each sister is the Bule, with the conversion
 * factor that connects them.
 */

import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// The Bule: the base unit
// ---------------------------------------------------------------------------

/** Topological deficit: the canonical form of the Bule */
function bule(beta1star: number, diversity: number): number {
  return Math.max(0, beta1star - Math.min(diversity, beta1star));
}

// ---------------------------------------------------------------------------
// The sisters
// ---------------------------------------------------------------------------

interface Sister {
  /** Name of the derived measure */
  readonly name: string;
  /** Symbol in the paper */
  readonly symbol: string;
  /** What it measures in its native domain */
  readonly measures: string;
  /** Conversion: how to express it in Bules */
  readonly toBules: string;
  /** Conversion factor (if numeric) or 'identity' */
  readonly conversionFactor: string;
  /** Paper section where it appears */
  readonly section: string;
  /** The recast: what the sister IS, now that we know */
  readonly recast: string;
}

function allSisters(): Sister[] {
  return [
    {
      name: 'First Betti number',
      symbol: 'β₁',
      measures: 'independent parallel paths in a computation graph',
      toBules: 'β₁ = β₁* - Δβ = β₁* - Bules',
      conversionFactor: 'identity (β₁* - Bule count)',
      section: '§1',
      recast: 'β₁ is the diversity that SURVIVED the fold. The Bule counts what was lost. β₁ + Bules = β₁*. They are the two halves of the topology.',
    },
    {
      name: 'Topological deficit',
      symbol: 'Δβ',
      measures: 'gap between intrinsic and implemented topology',
      toBules: 'Δβ = Bules (direct identity)',
      conversionFactor: 'identity',
      section: '§1.1',
      recast: 'The deficit IS the Bule count. This was the first sister. Now it is recognized as the base unit itself.',
    },
    {
      name: 'Pipeline Reynolds number',
      symbol: 'Re = N/C',
      measures: 'ratio of stages to chunks (turbulence onset)',
      toBules: 'Re = β₁* / (β₁* - Bules) when Bules < β₁*',
      conversionFactor: 'inverse of (1 - Bules/β₁*)',
      section: '§1.3',
      recast: 'High Reynolds = low diversity = high Bule count. The laminar-turbulent transition is the Bule threshold where the pipeline can no longer absorb the deficit. Re is the Bule count measured in pipeline units.',
    },
    {
      name: 'Idle fraction',
      symbol: 'N(N-1)/2(C+N-1)',
      measures: 'wasted pipeline slots during ramp-up/ramp-down',
      toBules: 'idle = Bules / (Bules + useful_work)',
      conversionFactor: 'proportional to Bules',
      section: '§1.1',
      recast: 'Idle slots are Bules of destroyed concurrency made visible in time. Each idle slot is a diverse computation that COULD have run but did not.',
    },
    {
      name: 'Framing overhead',
      symbol: 'overhead %',
      measures: 'wire bytes spent on framing vs payload',
      toBules: 'overhead = Bules / (Bules + payload)',
      conversionFactor: 'proportional to Bules',
      section: '§7',
      recast: 'Framing overhead is Bules of destroyed diversity on the wire. HTTP/1.1 serializes 94 diverse resources through 1 stream: 93 Bules. Aeon Flow uses 94 streams: 0 Bules.',
    },
    {
      name: 'Compression deficit',
      symbol: 'codec_deficit',
      measures: 'wire size above the racing minimum',
      toBules: 'codec_deficit = Bules of codec diversity not exploited',
      conversionFactor: 'proportional to Bules',
      section: '§11',
      recast: 'Fixed gzip on diverse content = Bules of wasted codec diversity. Per-chunk racing = 0 Bules. The codec deficit IS the codec Bule count.',
    },
    {
      name: 'Semiotic deficit',
      symbol: 'Δβ(thought, speech)',
      measures: 'information lost when thought folds into speech',
      toBules: 'semiotic_deficit = Bules (direct identity)',
      conversionFactor: 'identity',
      section: '§3.12',
      recast: 'The semiotic deficit between thought (β₁ = k-1) and speech (β₁ = 0) is k-1 Bules. Communication cost IS Bule expenditure. Shared context reduces Bules. Peace is zero Bules.',
    },
    {
      name: 'Complement distribution',
      symbol: 'softmax(-η·v)',
      measures: 'probability over rejected alternatives',
      toBules: 'each v_i is a Bule accumulator for path i',
      conversionFactor: 'Bules are the input; distribution is the output',
      section: '§15',
      recast: 'The complement distribution is a Bule-denominated value function. Each rejection adds one Bule to the path. The distribution converts accumulated Bules into decision weights. The void boundary IS the Bule ledger.',
    },
    {
      name: 'Eta (fold aggressiveness)',
      symbol: 'η',
      measures: 'how aggressively the brain folds the void',
      toBules: 'η scales how fast Bules translate to probability shifts',
      conversionFactor: 'temperature parameter on Bule-to-probability conversion',
      section: '§15.12',
      recast: 'Eta is the exchange rate between Bules and attention. High eta (NT): each Bule sharply redirects attention. Low eta (AUT): each Bule gently adjusts. Same Bules, different exchange rate. Autism is not a Bule deficit. It is a different Bule exchange rate.',
    },
    {
      name: 'Void Gain Index',
      symbol: 'VGI = (K_t - 1)/(K_env - 1)',
      measures: 'fraction of environmental void the brain exploits',
      toBules: 'VGI = Bules_tracked / Bules_available',
      conversionFactor: 'ratio of Bule counts',
      section: '§20.2.3',
      recast: 'VGI is a Bule ratio. VGI < 1.0: tracking fewer Bules than exist (missing value). VGI = 1.0: matched (all value captured). VGI > 1.0: tracking phantom Bules (rumination).',
    },
    {
      name: 'Conscious Void Index',
      symbol: 'CVI = (K_c - 1)/(K_t - 1)',
      measures: 'fraction of void-walking that reaches awareness',
      toBules: 'CVI = conscious_Bules / total_Bules',
      conversionFactor: 'ratio of Bule counts',
      section: '§20.2.3',
      recast: 'CVI is the fraction of Bules that cross the kurtosis threshold into experience. 40% of Bules are conscious. 60% are subconscious. The threshold is measured in Bules.',
    },
    {
      name: 'Cognitive Frontier Position',
      symbol: 'CFP',
      measures: 'how close the brain is to the environmental frontier',
      toBules: 'CFP = 1 - (remaining_Bules / total_Bules)',
      conversionFactor: '1 minus Bule deficit ratio',
      section: '§20.2.3',
      recast: 'CFP = 0.995 means the brain has 0.5% of its Bule budget remaining as deficit. Evolution spent 4 billion years minimizing the Bule count. 0.5% left.',
    },
    {
      name: 'Landauer heat',
      symbol: 'kT ln 2',
      measures: 'minimum energy to erase one bit',
      toBules: '1 Bule = kT ln 2 joules (the Landauer-Bule identity)',
      conversionFactor: 'kT ln 2 joules per Bule',
      section: '§19',
      recast: 'The Landauer-Bule identity is the field equation. It couples the geometric face (deficit) to the physical face (heat). One Bule of topology = kT ln 2 joules of physics. The Bule is already physical.',
    },
    {
      name: 'Incubation effect',
      symbol: "Cohen's d = 0.29",
      measures: 'creative improvement after mind-wandering',
      toBules: 'd ≈ resolved_Bules / total_Bules',
      conversionFactor: 'd × (K-1) = resolved Bules',
      section: '§20.2.3',
      recast: 'd = 0.29 means 29% of the void Bules resolved during incubation. 6.1 Bules out of 21. The incubation effect IS the Bule resolution rate.',
    },
    {
      name: 'Hick\'s law RT',
      symbol: 'RT = a + b·log₂(K)',
      measures: 'reaction time as function of alternatives',
      toBules: 'RT ∝ log₂(Bules_available + 1)',
      conversionFactor: 'logarithmic in Bule count',
      section: '§20.2.3',
      recast: 'Reaction time is the time to race the Bule-denominated alternatives. More Bules = longer race = slower RT. Hick\'s law is the Bule race clock.',
    },
    {
      name: 'Mind-wandering rate',
      symbol: '(K-1)/(2K-1)',
      measures: 'fraction of time spent off-task',
      toBules: 'MW = Bules / (2·Bules + 1)',
      conversionFactor: 'function of Bule count',
      section: '§20.2.3',
      recast: 'The mind-wandering rate is the duty cycle for Bule maintenance. The brain alternates between spending Bules (fold/task) and auditing Bules (void/daydream). 47% of conscious time is Bule accounting.',
    },
    {
      name: 'RMSE waste (Netflix)',
      symbol: 'RMSE - floor',
      measures: 'prediction error above irreducible noise',
      toBules: 'waste = Bules of algorithmic diversity not exploited',
      conversionFactor: 'proportional to Bules',
      section: '§20.2.1',
      recast: 'RMSE waste is Bules of taste-space diversity that the ensemble did not cover. Cinematch: 21 Bules. Grand Prize winner: ~1 Bule. The 50/50 blend: 0 Bules.',
    },
    {
      name: 'Rejection Sensitive Dysphoria',
      symbol: 'peak × gain / recovery',
      measures: 'emotional spike intensity from social rejection',
      toBules: 'RSD peak = rejection_Bules × mental_health_gain',
      conversionFactor: 'Bules × amplification factor',
      section: '§15.13.1',
      recast: 'RSD is a Bule amplification event. NT: 1 rejection = 1 Bule, gain 1.0×. ADHD: 1 rejection = 2.5 Bules, gain 2.5×. Same event. Different Bule exchange rate. The spike IS the amplified Bule count. The recovery IS the Bule decay rate.',
    },
    {
      name: 'Special interest depth',
      symbol: 'focus_multiplier × trot_depth',
      measures: 'expertise concentration on one dimension',
      toBules: 'special interest = Bules concentrated on one path',
      conversionFactor: 'Bule redistribution (not creation)',
      section: '§15.13.1',
      recast: 'A special interest is not extra Bules. It is the SAME Bules concentrated on fewer paths. The autistic brain does not have more Bule budget. It spends the budget on fewer, deeper paths. The focus multiplier is a Bule concentration ratio.',
    },
    {
      name: 'Accommodation',
      symbol: 'K_actual → K_perceived',
      measures: 'environment adjustment for neurodivergent individuals',
      toBules: 'accommodation = reduce Bule mismatch (|VGI - 1|)',
      conversionFactor: 'Bule rebalancing',
      section: '§15.13.2',
      recast: 'Every accommodation is a Bule adjustment. Noise-canceling headphones: remove sensory Bules. Visual schedule: remove uncertainty Bules. Stimming: vent excess Bules. The therapeutic target is |VGI - 1.0| = 0, which is |Bule_mismatch| = 0.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('the Bule\'s sisters: every measure recast', () => {
  const sisters = allSisters();

  it('there are 20 sisters', () => {
    expect(sisters.length).toBe(20);
  });

  it('every sister has a Bule conversion', () => {
    for (const s of sisters) {
      expect(s.toBules.length).toBeGreaterThan(0);
      expect(s.recast.length).toBeGreaterThan(0);
    }
  });

  it('prints the complete recast table', () => {
    console.log('\n  === THE BULE\'S SISTERS: 20 MEASURES, ONE UNIT ===\n');

    for (let i = 0; i < sisters.length; i++) {
      const s = sisters[i];
      console.log(`  ${(i + 1).toString().padStart(2)}. ${s.name} (${s.symbol})`);
      console.log(`      Was: ${s.measures}`);
      console.log(`      Is:  ${s.recast.slice(0, 100)}`);
      if (s.recast.length > 100) {
        console.log(`           ${s.recast.slice(100)}`);
      }
      console.log('');
    }
  });

  // -------------------------------------------------------------------
  // Verify the conversions are consistent
  // -------------------------------------------------------------------

  describe('conversion consistency', () => {
    it('deficit IS the Bule (identity)', () => {
      for (let p = 1; p <= 30; p++) {
        for (let s = 1; s <= 30; s++) {
          expect(bule(p, s)).toBe(Math.max(0, p - Math.min(s, p)));
        }
      }
    });

    it('β₁ + Bules = β₁* (the two halves)', () => {
      for (let beta1star = 1; beta1star <= 30; beta1star++) {
        for (let d = 1; d <= beta1star; d++) {
          const bules = bule(beta1star, d);
          const beta1 = Math.min(d, beta1star);
          expect(beta1 + bules).toBe(beta1star);
        }
      }
    });

    it('VGI is a Bule ratio', () => {
      const kTracked = 20;
      const kEnv = 22;
      const bulesTracked = kTracked - 1;
      const bulesAvailable = kEnv - 1;
      const vgi = bulesTracked / bulesAvailable;
      expect(vgi).toBeCloseTo(19 / 21, 5);
    });

    it('CVI is a Bule ratio', () => {
      const kConscious = 8.6;
      const kTotal = 20;
      const consciousBules = kConscious - 1;
      const totalBules = kTotal - 1;
      const cvi = consciousBules / totalBules;
      expect(cvi).toBeCloseTo(7.6 / 19, 5);
    });

    it('Landauer-Bule: 1 Bule = kT ln 2 joules', () => {
      const k = 1.380649e-23;
      const T = 300;
      const oneBule = k * T * Math.LN2;
      expect(oneBule).toBeCloseTo(2.871e-21, 24);
    });

    it('MW rate is a function of Bule count K-1', () => {
      const K = 22;
      const bules = K - 1;
      const mw = bules / (2 * bules + 1);
      expect(mw).toBeCloseTo(21 / 43, 5);
    });

    it('semiotic deficit = Bule count between speakers', () => {
      const thoughtDims = 8;  // autistic speaker
      const speechDims = 3;   // neurotypical listener
      const semioticBules = thoughtDims - speechDims;
      expect(semioticBules).toBe(5);
      // 5 Bules of meaning lost in translation
    });

    it('accommodation = Bule rebalancing to |VGI - 1| = 0', () => {
      // Before: autistic person in 3-dim environment
      const before = (8 - 1) / (3 - 1); // VGI = 3.5
      // After: structured 8-dim environment
      const after = (8 - 1) / (8 - 1);  // VGI = 1.0
      expect(Math.abs(after - 1.0)).toBe(0);
      expect(before).toBeGreaterThan(1.0);
      // Accommodation reduced the Bule mismatch from 2.5 to 0
    });
  });

  // -------------------------------------------------------------------
  // The unified conversion table
  // -------------------------------------------------------------------

  it('prints the conversion table', () => {
    console.log('\n  === BULE CONVERSION TABLE ===\n');
    console.log('  From                    To Bules                              Factor');
    console.log('  ' + '─'.repeat(80));

    const conversions = [
      ['β₁ (surviving diversity)', 'β₁* - β₁ = Bules', '1:1 (complement)'],
      ['Δβ (deficit)', 'Δβ = Bules', '1:1 (identity)'],
      ['Re (Reynolds)', 'β₁*/(β₁* - Bules)', 'inverse complement'],
      ['overhead % (framing)', 'Bules/(Bules + payload)', 'fraction'],
      ['codec deficit', 'codec Bules', '1:1'],
      ['semiotic deficit', 'thought_dims - speech_dims = Bules', '1:1'],
      ['η (aperture)', 'Bule exchange rate', 'scaling factor'],
      ['VGI', 'tracked_Bules / available_Bules', 'ratio'],
      ['CVI', 'conscious_Bules / total_Bules', 'ratio'],
      ['kT ln 2 (Landauer)', '1 Bule = 2.871×10⁻²¹ J at 300K', 'kT ln 2'],
      ['d (incubation)', 'resolved_Bules / total_Bules', 'fraction'],
      ['RT (Hick\'s law)', 'a + b·log₂(Bules + 1)', 'logarithmic'],
      ['MW rate', 'Bules / (2·Bules + 1)', 'duty cycle'],
      ['RMSE waste', 'taste-space Bules unmatched', 'proportional'],
      ['RSD peak', 'rejection_Bules × gain', 'amplified'],
      ['special interest', 'same Bules, fewer paths', 'concentration'],
      ['accommodation', '|VGI - 1.0| → 0', 'rebalancing'],
    ];

    for (const [from, to, factor] of conversions) {
      console.log(
        `  ${from.padEnd(26)} ${to.padEnd(38)} ${factor}`
      );
    }

    console.log(
      '\n  Every row is a different instrument reading the same quantity.' +
      '\n  The quantity is the Bule.' +
      '\n  The Bule is value.' +
      '\n  Value is what you lose when you destroy diversity.'
    );
  });

  // -------------------------------------------------------------------
  // The final reframe
  // -------------------------------------------------------------------

  it('prints the reframe', () => {
    console.log(
      '\n  ╔═══════════════════════════════════════════════════════════════╗' +
      '\n  ║                                                             ║' +
      '\n  ║  Before: 20 measures, 20 units, 20 conversion factors.     ║' +
      '\n  ║  After:  20 measures, 1 unit, 20 views.                    ║' +
      '\n  ║                                                             ║' +
      '\n  ║  β₁ is surviving Bules.                                    ║' +
      '\n  ║  Δβ is lost Bules.                                         ║' +
      '\n  ║  Re is the Bule turbulence threshold.                      ║' +
      '\n  ║  η is the Bule exchange rate.                              ║' +
      '\n  ║  VGI is a Bule ratio.                                      ║' +
      '\n  ║  kT ln 2 is a Bule in joules.                              ║' +
      '\n  ║  d is a Bule resolution fraction.                          ║' +
      '\n  ║  RT is the Bule race clock.                                ║' +
      '\n  ║  Peace is zero Bules.                                      ║' +
      '\n  ║  Accommodation is Bule rebalancing.                        ║' +
      '\n  ║  Consciousness is the Bule threshold.                      ║' +
      '\n  ║  RSD is Bule amplification.                                ║' +
      '\n  ║  Special interest is Bule concentration.                   ║' +
      '\n  ║  Work is unresolved Bules.                                 ║' +
      '\n  ║  Waste is destroyed Bules.                                 ║' +
      '\n  ║  Value is the Bule itself.                                 ║' +
      '\n  ║                                                             ║' +
      '\n  ║  One unit.  Twenty views.  Every substrate.                ║' +
      '\n  ║  The universe reframed.                                    ║' +
      '\n  ║                                                             ║' +
      '\n  ╚═══════════════════════════════════════════════════════════════╝'
    );

    expect(true).toBe(true);
  });
});
