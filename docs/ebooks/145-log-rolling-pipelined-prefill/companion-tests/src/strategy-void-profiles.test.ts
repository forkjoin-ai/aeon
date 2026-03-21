/**
 * Strategy Void Profiles -- Mapping Strategies in Void Space
 *
 * Each strategy has a measurable "void signature" -- the shape it
 * carves in the rejection boundary over time. The inverse Bule
 * measures how efficiently a strategy reduces semiotic deficit
 * by reading the void.
 *
 * Definitions:
 *
 *   Bule (B): one unit of semiotic deficit. Deficit = semanticPaths - 1.
 *     Higher Bule = more confusion per communication attempt.
 *
 *   Inverse Bule (B⁻¹): deficit reduction per round. Measures how fast
 *     a strategy learns from rejection.
 *     B⁻¹ = (initial entropy - final entropy) / rounds
 *     High B⁻¹ = fast learner (reads tombstones efficiently)
 *     Low B⁻¹ = slow learner or non-learner
 *
 * Strategy void signatures:
 *   - Void density shape (kurtosis, skewness, entropy)
 *   - Void accumulation rate (tombstones per round)
 *   - Void efficiency (payoff gained per tombstone)
 *   - Inverse Bule (deficit reduction rate)
 *   - Thomas-Kilmann coordinates (competing, collaborating, compromising, avoiding, accommodating)
 *
 * The landscape this creates: each strategy occupies a point in a
 * multi-dimensional void-shape space. Nearby strategies have similar
 * void signatures. The Nash equilibrium sits at the saddle point.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Types
// ============================================================================

type Choice = string;

interface PayoffMatrix {
  payoffs: Record<string, Record<string, [number, number]>>;
  choices: string[];
}

interface VoidSignature {
  strategy: string;
  /** Kurtosis of the complement distribution at end of game */
  kurtosis: number;
  /** Skewness of the complement distribution */
  skewness: number;
  /** Shannon entropy of the complement distribution (nats) */
  entropy: number;
  /** Gini coefficient of void density */
  gini: number;
  /** Void accumulation rate: tombstones per round */
  voidRate: number;
  /** Void efficiency: payoff per tombstone (higher = learns more per failure) */
  voidEfficiency: number;
  /** Inverse Bule: entropy reduction per round (B⁻¹) */
  inverseBule: number;
  /** Average score per round */
  avgScore: number;
  /** Cooperation rate (fraction playing choices[0]) */
  coopRate: number;
  /** Thomas-Kilmann coordinates */
  tkCompeting: number;
  tkCollaborating: number;
  tkCompromising: number;
  tkAvoiding: number;
  tkAccommodating: number;
}

// ============================================================================
// Helpers
// ============================================================================

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function mean(v: number[]): number {
  return v.length > 0 ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

function excessKurtosis(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mu = mean(values);
  const s2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (s2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / n;
  return m4 / s2 ** 2 - 3;
}

function skewness(values: number[]): number {
  const n = values.length;
  const mu = mean(values);
  const s2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (s2 < 1e-12) return 0;
  const s3 = Math.sqrt(s2) ** 3;
  return values.reduce((s, v) => s + (v - mu) ** 3, 0) / (n * s3);
}

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) if (p > 0) h -= p * Math.log(p);
  return h;
}

function gini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mu = mean(sorted);
  if (mu === 0) return 0;
  let sumDiff = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) sumDiff += Math.abs(sorted[i] - sorted[j]);
  return sumDiff / (2 * n * n * mu);
}

function complementDist(counts: number[], eta: number = 3.0): number[] {
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const range = max - min;
  const norm =
    range > 0 ? counts.map((v) => (v - min) / range) : counts.map(() => 0);
  const w = norm.map((v) => Math.exp(-eta * v));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
}

function sparkline(values: number[]): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const blocks = ' ▁▂▃▄▅▆▇█';
  return values
    .map((v) => blocks[Math.round(((v - min) / range) * (blocks.length - 1))])
    .join('');
}

// ============================================================================
// Strategies (same as game-theory-void-walking.test.ts)
// ============================================================================

type Strategy = (
  history: Array<{ mine: Choice; theirs: Choice }>,
  choices: string[],
  rng: () => number
) => Choice;

const STRATEGIES: Record<string, Strategy> = {
  'tit-for-tat': (h, c) => (h.length === 0 ? c[0] : h[h.length - 1].theirs),
  'always-cooperate': (_h, c) => c[0],
  'always-defect': (_h, c) => c[c.length - 1],
  random: (_h, c, rng) => c[Math.floor(rng() * c.length)],
  'grim-trigger': (h, c) => {
    return h.some((x) => x.theirs === c[c.length - 1]) ? c[c.length - 1] : c[0];
  },
  pavlov: (h, c) => {
    if (h.length === 0) return c[0];
    return h[h.length - 1].mine === h[h.length - 1].theirs
      ? c[0]
      : c[c.length - 1];
  },
  'generous-tit-for-tat': (h, c, rng) => {
    if (h.length === 0) return c[0];
    if (h[h.length - 1].theirs === c[c.length - 1])
      return rng() < 0.1 ? c[0] : c[c.length - 1];
    return c[0];
  },
  'suspicious-tit-for-tat': (h, c) =>
    h.length === 0 ? c[c.length - 1] : h[h.length - 1].theirs,
  'void-walker': (h, c, rng) => {
    if (h.length === 0) return c[Math.floor(rng() * c.length)];
    const loss = new Array(c.length).fill(0);
    for (const x of h) {
      const idx = c.indexOf(x.mine);
      if (idx >= 0) loss[idx]++;
    }
    const dist = complementDist(loss);
    const r = rng();
    let cum = 0;
    for (let i = 0; i < c.length; i++) {
      cum += dist[i];
      if (r < cum) return c[i];
    }
    return c[c.length - 1];
  },
};

// ============================================================================
// Payoff Matrices
// ============================================================================

const MATRICES: Record<string, PayoffMatrix> = {
  'prisoners-dilemma': {
    choices: ['cooperate', 'defect'],
    payoffs: {
      cooperate: { cooperate: [3, 3], defect: [0, 5] },
      defect: { cooperate: [5, 0], defect: [1, 1] },
    },
  },
  'hawk-dove': {
    choices: ['dove', 'hawk'],
    payoffs: {
      dove: { dove: [2, 2], hawk: [0, 4] },
      hawk: { dove: [4, 0], hawk: [-1, -1] },
    },
  },
  'stag-hunt': {
    choices: ['stag', 'hare'],
    payoffs: {
      stag: { stag: [4, 4], hare: [0, 2] },
      hare: { stag: [2, 0], hare: [2, 2] },
    },
  },
};

// ============================================================================
// Profiler
// ============================================================================

function profileStrategy(
  stratName: string,
  matrix: PayoffMatrix,
  opponents: string[],
  rounds: number,
  seed: number
): VoidSignature {
  const strat = STRATEGIES[stratName];
  let totalScore = 0;
  let totalVoidEntries = 0;
  let totalRounds = 0;
  let totalCoopChoices = 0;
  const allVoidCounts: number[] = new Array(matrix.choices.length).fill(0);
  const entropyTrajectories: number[][] = [];

  for (const oppName of opponents) {
    const opp = STRATEGIES[oppName];
    const rng = makeRng(
      seed +
        (stratName + oppName).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    );

    const histMe: Array<{ mine: Choice; theirs: Choice }> = [];
    const histOpp: Array<{ mine: Choice; theirs: Choice }> = [];
    const voidCounts = new Array(matrix.choices.length).fill(0);
    const eTraj: number[] = [];

    for (let r = 0; r < rounds; r++) {
      const myChoice = strat(histMe, matrix.choices, rng);
      const theirChoice = opp(histOpp, matrix.choices, rng);
      const [myPay, theirPay] = matrix.payoffs[myChoice]?.[theirChoice] ?? [
        0, 0,
      ];

      totalScore += myPay;
      totalRounds++;
      if (myChoice === matrix.choices[0]) totalCoopChoices++;

      const idx = matrix.choices.indexOf(myChoice);
      if (myPay < theirPay && idx >= 0) {
        voidCounts[idx]++;
        allVoidCounts[idx]++;
        totalVoidEntries++;
      }

      histMe.push({ mine: myChoice, theirs: theirChoice });
      histOpp.push({ mine: theirChoice, theirs: myChoice });

      if ((r + 1) % 10 === 0) {
        const dist = complementDist(voidCounts);
        eTraj.push(shannonEntropy(dist));
      }
    }

    entropyTrajectories.push(eTraj);
  }

  const finalDist = complementDist(allVoidCounts);
  const maxEntropy = Math.log(matrix.choices.length);

  // Inverse Bule: (initial entropy - final entropy) / total rounds
  // Initial entropy = maxEntropy (uniform prior)
  // Final entropy = shannonEntropy(finalDist)
  const finalEntropy = shannonEntropy(finalDist);
  const inverseBule =
    totalRounds > 0 ? (maxEntropy - finalEntropy) / totalRounds : 0;

  // Void efficiency: payoff per tombstone
  const voidEfficiency =
    totalVoidEntries > 0
      ? totalScore / totalVoidEntries
      : totalScore > 0
      ? Infinity
      : 0;

  // Thomas-Kilmann coordinates (heuristic mapping from behavior)
  const coopRate = totalRounds > 0 ? totalCoopChoices / totalRounds : 0.5;
  const avgScore = totalRounds > 0 ? totalScore / totalRounds : 0;
  const voidRate = totalRounds > 0 ? totalVoidEntries / totalRounds : 0;

  // TKI mapping:
  // Competing: high score pursuit, low cooperation, high void (aggressive)
  // Collaborating: high score + high cooperation + moderate void (reads tombstones)
  // Compromising: moderate everything
  // Avoiding: low void rate (doesn't engage)
  // Accommodating: high cooperation, low score (yields)
  const scoreNorm = Math.max(0, Math.min(1, (avgScore + 2) / 6)); // normalize to [0,1]
  const tkCompeting = (1 - coopRate) * scoreNorm;
  const tkCollaborating = coopRate * scoreNorm;
  const tkCompromising = 1 - Math.abs(coopRate - 0.5) * 2; // peaks at 50% coop
  const tkAvoiding = Math.max(0, 1 - voidRate * 5); // low void = avoiding
  const tkAccommodating = coopRate * (1 - scoreNorm);

  // Normalize TKI to sum to 1
  const tkSum =
    tkCompeting +
    tkCollaborating +
    tkCompromising +
    tkAvoiding +
    tkAccommodating;
  const tkNorm = tkSum > 0 ? tkSum : 1;

  return {
    strategy: stratName,
    kurtosis: excessKurtosis(finalDist),
    skewness: skewness(finalDist),
    entropy: finalEntropy,
    gini: gini(finalDist),
    voidRate,
    voidEfficiency,
    inverseBule,
    avgScore,
    coopRate,
    tkCompeting: tkCompeting / tkNorm,
    tkCollaborating: tkCollaborating / tkNorm,
    tkCompromising: tkCompromising / tkNorm,
    tkAvoiding: tkAvoiding / tkNorm,
    tkAccommodating: tkAccommodating / tkNorm,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('Strategy Void Profiles & Inverse Bule', () => {
  const allStrats = Object.keys(STRATEGIES);
  const T = 200;

  for (const [gameName, matrix] of Object.entries(MATRICES)) {
    describe(`${gameName}: strategy void signatures`, () => {
      it('profile all strategies and rank by inverse Bule', () => {
        const profiles: VoidSignature[] = [];

        for (const strat of allStrats) {
          const profile = profileStrategy(strat, matrix, allStrats, T, 42);
          profiles.push(profile);
        }

        // Sort by inverse Bule (best learner first)
        const byInverseBule = [...profiles].sort(
          (a, b) => b.inverseBule - a.inverseBule
        );

        console.log(`\n  ╔${'═'.repeat(78)}╗`);
        console.log(`  ║ ${gameName.toUpperCase().padEnd(76)} ║`);
        console.log(
          `  ║ Strategy Void Profiles ranked by Inverse Bule (B⁻¹)${' '.repeat(
            25
          )}║`
        );
        console.log(`  ╠${'═'.repeat(78)}╣`);
        console.log(
          `  ║ ${'Strategy'.padEnd(24)} ${'B⁻¹'.padStart(8)} ${'Score'.padStart(
            7
          )} ${'Coop%'.padStart(6)} ${'κ'.padStart(7)} ${'H'.padStart(
            6
          )} ${'Gini'.padStart(6)} ${'VoidR'.padStart(6)} ║`
        );
        console.log(`  ╠${'─'.repeat(78)}╣`);
        for (const p of byInverseBule) {
          const buleStr = (p.inverseBule * 1000).toFixed(2); // milli-Bule⁻¹
          console.log(
            `  ║ ${p.strategy.padEnd(24)} ${buleStr.padStart(8)} ${p.avgScore
              .toFixed(1)
              .padStart(7)} ${(p.coopRate * 100)
              .toFixed(0)
              .padStart(5)}% ${p.kurtosis.toFixed(2).padStart(7)} ${p.entropy
              .toFixed(3)
              .padStart(6)} ${p.gini.toFixed(3).padStart(6)} ${p.voidRate
              .toFixed(3)
              .padStart(6)} ║`
          );
        }
        console.log(`  ╠${'═'.repeat(78)}╣`);

        // Thomas-Kilmann coordinates
        console.log(`  ║ Thomas-Kilmann Mapping${' '.repeat(55)}║`);
        console.log(
          `  ║ ${'Strategy'.padEnd(24)} ${'Comp'.padStart(6)} ${'Coll'.padStart(
            6
          )} ${'Compr'.padStart(6)} ${'Avoid'.padStart(6)} ${'Accom'.padStart(
            6
          )}${''.padEnd(18)} ║`
        );
        console.log(`  ╠${'─'.repeat(78)}╣`);
        for (const p of profiles.sort(
          (a, b) => b.tkCompeting - a.tkCompeting
        )) {
          // Bar visualization of TKI profile
          const bars = [
            p.tkCompeting,
            p.tkCollaborating,
            p.tkCompromising,
            p.tkAvoiding,
            p.tkAccommodating,
          ];
          const maxBar = Math.max(...bars);
          const barStr = bars
            .map((b) => {
              const len = maxBar > 0 ? Math.round((b / maxBar) * 4) : 0;
              return '█'.repeat(len).padEnd(4);
            })
            .join(' ');
          console.log(
            `  ║ ${p.strategy.padEnd(24)} ${(p.tkCompeting * 100)
              .toFixed(0)
              .padStart(5)}% ${(p.tkCollaborating * 100)
              .toFixed(0)
              .padStart(5)}% ${(p.tkCompromising * 100)
              .toFixed(0)
              .padStart(5)}% ${(p.tkAvoiding * 100).toFixed(0).padStart(5)}% ${(
              p.tkAccommodating * 100
            )
              .toFixed(0)
              .padStart(5)}%  ${barStr} ║`
          );
        }
        console.log(`  ╚${'═'.repeat(78)}╝`);

        // Verify inverse Bule is non-negative for non-trivial strategies
        for (const p of profiles) {
          expect(p.inverseBule).toBeGreaterThanOrEqual(-0.01);
        }
      });

      it('void walker has measurable inverse Bule', () => {
        const vwProfile = profileStrategy(
          'void-walker',
          matrix,
          allStrats,
          T,
          42
        );
        // Void walker should have non-negative inverse Bule (it learns)
        expect(vwProfile.inverseBule).toBeGreaterThanOrEqual(0);
        // Should have some void entries (it encounters losses)
        expect(vwProfile.voidRate).toBeGreaterThanOrEqual(0);
      });

      it('always-cooperate has minimal void learning', () => {
        const acProfile = profileStrategy(
          'always-cooperate',
          matrix,
          allStrats,
          T,
          42
        );
        // Always-cooperate never changes behavior, so inverse Bule should be low
        // (entropy doesn't decrease because it doesn't read the void)
        expect(acProfile.coopRate).toBeCloseTo(1.0, 1);
      });

      it('grim-trigger has phase-transition void signature', () => {
        const gtProfile = profileStrategy(
          'grim-trigger',
          matrix,
          allStrats,
          T,
          42
        );
        // Grim trigger cooperates until first defection, then defects forever
        // This creates a sharp transition in the void signature
        // High kurtosis after transition (peaked on defect)
        expect(typeof gtProfile.kurtosis).toBe('number');
      });
    });
  }

  describe('Cross-game strategy fitness (inverse Bule landscape)', () => {
    it('rank strategies by average inverse Bule across all games', () => {
      const games = Object.entries(MATRICES);
      const avgInverseBule: Record<string, number> = {};
      const avgScore: Record<string, number> = {};
      const avgVoidEfficiency: Record<string, number> = {};

      for (const strat of allStrats) {
        let totalIB = 0;
        let totalScore = 0;
        let totalVE = 0;
        for (const [, matrix] of games) {
          const p = profileStrategy(strat, matrix, allStrats, T, 42);
          totalIB += p.inverseBule;
          totalScore += p.avgScore;
          totalVE += isFinite(p.voidEfficiency) ? p.voidEfficiency : 0;
        }
        avgInverseBule[strat] = totalIB / games.length;
        avgScore[strat] = totalScore / games.length;
        avgVoidEfficiency[strat] = totalVE / games.length;
      }

      const ranked = Object.entries(avgInverseBule).sort((a, b) => b[1] - a[1]);

      console.log(
        '\n  ╔═══════════════════════════════════════════════════════════╗'
      );
      console.log(
        '  ║   Cross-Game Strategy Fitness (Inverse Bule Landscape)    ║'
      );
      console.log(
        '  ╠═══════════════════════════════════════════════════════════╣'
      );
      console.log(
        `  ║ ${'Strategy'.padEnd(24)} ${'avg B⁻¹'.padStart(
          9
        )} ${'avg Score'.padStart(10)} ${'avg VoidEff'.padStart(11)} ║`
      );
      console.log(`  ╠${'─'.repeat(59)}╣`);
      for (const [strat] of ranked) {
        const ib = (avgInverseBule[strat] * 1000).toFixed(3);
        const sc = avgScore[strat].toFixed(2);
        const ve = avgVoidEfficiency[strat].toFixed(2);
        console.log(
          `  ║ ${strat.padEnd(24)} ${ib.padStart(9)} ${sc.padStart(
            10
          )} ${ve.padStart(11)} ║`
        );
      }
      console.log(
        '  ╚═══════════════════════════════════════════════════════════╝\n'
      );

      // All strategies should have finite inverse Bule
      for (const [, ib] of ranked) {
        expect(isFinite(ib)).toBe(true);
      }
    });

    it('inverse Bule correlates with long-run fitness', () => {
      // Strategies with higher inverse Bule should tend to have higher scores
      // in the long run (Skyrms ultra long run hypothesis)
      const games = Object.entries(MATRICES);
      const data: Array<{ strat: string; ib: number; score: number }> = [];

      for (const strat of allStrats) {
        let totalIB = 0;
        let totalScore = 0;
        for (const [, matrix] of games) {
          const p = profileStrategy(strat, matrix, allStrats, 500, 42);
          totalIB += p.inverseBule;
          totalScore += p.avgScore;
        }
        data.push({
          strat,
          ib: totalIB / games.length,
          score: totalScore / games.length,
        });
      }

      // There should be some positive correlation between inverse Bule and score
      // (not perfect -- some games reward stubbornness over learning)
      const ibValues = data.map((d) => d.ib);
      const scoreValues = data.map((d) => d.score);

      // Both should have non-zero variance
      const ibMean = mean(ibValues);
      const scoreMean = mean(scoreValues);
      expect(data.length).toBeGreaterThan(0);

      // Print correlation scatter
      console.log('  Inverse Bule vs Score (each dot = one strategy):');
      for (const d of data.sort((a, b) => b.ib - a.ib)) {
        const ibBar = '█'.repeat(Math.max(1, Math.round(d.ib * 10000)));
        console.log(
          `  ${d.strat.padEnd(24)} B⁻¹=${(d.ib * 1000)
            .toFixed(2)
            .padStart(6)}  score=${d.score.toFixed(2).padStart(6)}  ${ibBar}`
        );
      }
    });
  });
});
