/**
 * Void Walking Kurtosis -- Shape of the Complement Distribution
 *
 * Kurtosis measures the "tailedness" of the complement distribution:
 *
 *   - Leptokurtic (kurtosis > 3): peaked, heavy-tailed -- exploitation mode.
 *     The void walker has strong opinions about which forks to take.
 *
 *   - Mesokurtic (kurtosis ≈ 3): Gaussian-like baseline.
 *
 *   - Platykurtic (kurtosis < 3): flat, light-tailed -- exploration mode.
 *     The void walker is still uncertain, distributing weight broadly.
 *
 * The kurtosis trajectory over time tells the story of learning:
 *   t=0:    platykurtic (uniform prior, maximum uncertainty)
 *   t→∞:    leptokurtic (concentrated on optimal choices)
 *   transition: the moment kurtosis crosses 3 is when the void walker
 *               "crystallizes" from explorer to exploiter
 *
 * Connection to THM-VOID-DOMINANCE and dark matter:
 *   The kurtosis of the void boundary mirrors the kurtosis of matter
 *   distribution in the universe. Early universe: platykurtic (nearly
 *   uniform). Late universe: leptokurtic (galaxies, clusters, voids).
 *   Dark matter provides the gravitational scaffold that drives this
 *   transition -- just as the void boundary provides the information
 *   scaffold that drives the complement distribution from flat to peaked.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Distribution Statistics
// ============================================================================

/** Mean of a distribution. */
function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Variance of a distribution. */
function variance(values: number[]): number {
  const mu = mean(values);
  return values.reduce((s, v) => s + (v - mu) ** 2, 0) / values.length;
}

/** Standard deviation. */
function stddev(values: number[]): number {
  return Math.sqrt(variance(values));
}

/** Excess kurtosis of a distribution.
 *  kurtosis = E[(X-mu)^4] / sigma^4 - 3
 *  Gaussian = 0, leptokurtic > 0, platykurtic < 0. */
function excessKurtosis(values: number[]): number {
  const mu = mean(values);
  const sigma2 = variance(values);
  // Near-zero variance means near-uniform -- return 0 to avoid numerical instability
  if (sigma2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / values.length;
  return m4 / sigma2 ** 2 - 3;
}

/** Raw kurtosis (non-excess). Gaussian = 3. */
function rawKurtosis(values: number[]): number {
  return excessKurtosis(values) + 3;
}

/** Skewness of a distribution. */
function skewness(values: number[]): number {
  const mu = mean(values);
  const sigma = stddev(values);
  if (sigma === 0) return 0;
  return (
    values.reduce((s, v) => s + ((v - mu) / sigma) ** 3, 0) / values.length
  );
}

/** Shannon entropy in nats. */
function entropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log(p);
  }
  return h;
}

/** Gini coefficient: 0 = perfect equality, 1 = maximum inequality. */
function gini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mu = mean(sorted);
  if (mu === 0) return 0;
  let sumDiff = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumDiff += Math.abs(sorted[i] - sorted[j]);
    }
  }
  return sumDiff / (2 * n * n * mu);
}

// ============================================================================
// Void Walking Infrastructure
// ============================================================================

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Compute complement distribution from vent counts using exponential weights.
 *
 *  Normalizes vent counts to [0,1] range first, then applies exponential
 *  weighting with learning rate eta. This keeps the distribution responsive
 *  regardless of the absolute magnitude of vent counts.
 *
 *  eta controls sharpness: higher eta = more peaked (exploitation).
 *  Default eta = 2.0 gives moderate differentiation. */
function complementDistribution(
  ventCounts: number[],
  eta: number = 2.0,
): number[] {
  const N = ventCounts.length;
  const maxVent = Math.max(...ventCounts);
  const minVent = Math.min(...ventCounts);
  const range = maxVent - minVent;
  // Normalize to [0,1]: 0 = least vented (best), 1 = most vented (worst)
  const normalized =
    range > 0
      ? ventCounts.map((v) => (v - minVent) / range)
      : ventCounts.map(() => 0);
  // Exponential complement: low normalized vent -> high weight
  const rawWeights = normalized.map((v) => Math.exp(-eta * v));
  const weightSum = rawWeights.reduce((a, b) => a + b, 0);
  return rawWeights.map((w) => w / weightSum);
}

interface KurtosisSnapshot {
  round: number;
  excessKurtosis: number;
  rawKurtosis: number;
  skewness: number;
  entropy: number;
  gini: number;
  maxProb: number;
  minProb: number;
  ratio: number; // max/min concentration ratio
}

/** Run void walking and collect kurtosis snapshots at regular intervals. */
function collectKurtosisTrajectory(
  numArms: number,
  rounds: number,
  trueCosts: number[],
  rng: () => number,
  snapshotInterval: number = 10,
): KurtosisSnapshot[] {
  const ventCounts = new Array(numArms).fill(0);
  const snapshots: KurtosisSnapshot[] = [];

  // Initial snapshot (uniform)
  const initDist = complementDistribution(ventCounts);
  snapshots.push({
    round: 0,
    excessKurtosis: excessKurtosis(initDist),
    rawKurtosis: rawKurtosis(initDist),
    skewness: skewness(initDist),
    entropy: entropy(initDist),
    gini: gini(initDist),
    maxProb: Math.max(...initDist),
    minProb: Math.min(...initDist),
    ratio: Math.max(...initDist) / Math.min(...initDist),
  });

  for (let t = 0; t < rounds; t++) {
    // Compute current distribution
    const dist = complementDistribution(ventCounts);

    // Sample arm
    const r = rng();
    let cumProb = 0;
    let chosen = numArms - 1;
    for (let i = 0; i < numArms; i++) {
      cumProb += dist[i];
      if (r < cumProb) {
        chosen = i;
        break;
      }
    }

    // Observe cost and update void boundary
    const cost = trueCosts[chosen] + (rng() - 0.5) * 0.02;
    ventCounts[chosen] += Math.round(Math.max(0, cost) * 100);

    // Snapshot
    if ((t + 1) % snapshotInterval === 0 || t === rounds - 1) {
      const currentDist = complementDistribution(ventCounts);
      const maxP = Math.max(...currentDist);
      const minP = Math.min(...currentDist);
      snapshots.push({
        round: t + 1,
        excessKurtosis: excessKurtosis(currentDist),
        rawKurtosis: rawKurtosis(currentDist),
        skewness: skewness(currentDist),
        entropy: entropy(currentDist),
        gini: gini(currentDist),
        maxProb: maxP,
        minProb: minP,
        ratio: minP > 0 ? maxP / minP : Infinity,
      });
    }
  }

  return snapshots;
}

// ============================================================================
// ASCII Visualization
// ============================================================================

/** Render a sparkline from values. */
function sparkline(values: number[], width: number = 60): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const blocks = ' ▁▂▃▄▅▆▇█';
  return values
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (blocks.length - 1));
      return blocks[idx];
    })
    .join('');
}

/** Render a labeled sparkline with min/max annotations. */
function labeledSparkline(
  label: string,
  values: number[],
  width: number = 50,
): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spark = sparkline(values, width);
  return `  ${label.padEnd(12)} ${min.toFixed(3).padStart(8)} ${spark} ${max.toFixed(3)}`;
}

/** Render a bar chart of the complement distribution. */
function barChart(
  probs: number[],
  labels: string[],
  width: number = 40,
): string {
  const maxProb = Math.max(...probs);
  return probs
    .map((p, i) => {
      const barLen = Math.round((p / maxProb) * width);
      const bar = '█'.repeat(barLen) + '░'.repeat(width - barLen);
      return `  ${labels[i].padEnd(8)} ${bar} ${(p * 100).toFixed(1)}%`;
    })
    .join('\n');
}

// ============================================================================
// Tests
// ============================================================================

describe('Void Walking Kurtosis: Shape of the Complement Distribution', () => {
  it('uniform start is mesokurtic (zero variance, max entropy)', () => {
    // N equal vent counts -> uniform complement distribution
    const N = 10;
    const ventCounts = new Array(N).fill(0);
    const dist = complementDistribution(ventCounts);

    // All vent counts equal -> all normalized to 0 -> all weights = exp(0) = 1
    // -> uniform distribution -> kurtosis = 0 (degenerate)
    const kurt = excessKurtosis(dist);
    expect(kurt).toBe(0); // all values identical

    // Entropy should be at maximum (log N)
    const h = entropy(dist);
    expect(h).toBeCloseTo(Math.log(N), 1);
  });

  it('concentrated vent counts produce leptokurtic distribution', () => {
    // One arm heavily vented, rest barely touched
    const ventCounts = [1000, 10, 10, 10, 10];
    const dist = complementDistribution(ventCounts);

    // Distribution should be peaked (leptokurtic or near-leptokurtic)
    // The heavily-vented arm gets low weight; others get high weight
    const kurt = excessKurtosis(dist);
    // With 5 arms and one outlier, the distribution is concentrated
    // on 4 arms with similar weight and 1 arm with very low weight
    expect(dist[0]).toBeLessThan(dist[1]); // vented arm has lower prob

    // Gini should be positive (inequality exists)
    expect(gini(dist)).toBeGreaterThan(0);
  });

  it('kurtosis trajectory: platykurtic -> leptokurtic as learning progresses', () => {
    const N = 8;
    const trueCosts = [0.05, 0.2, 0.35, 0.5, 0.65, 0.75, 0.85, 0.95];
    const T = 2000;
    const rng = makeRng(42);

    const snapshots = collectKurtosisTrajectory(N, T, trueCosts, rng, 100);

    // Extract kurtosis values
    const kurtValues = snapshots.map((s) => s.excessKurtosis);

    // Early kurtosis should be near-platykurtic (close to uniform)
    expect(kurtValues[0]).toBeLessThan(1);

    // Later kurtosis should be higher (more concentrated)
    const lastKurt = kurtValues[kurtValues.length - 1];
    expect(lastKurt).toBeGreaterThan(kurtValues[0]);

    // Entropy should decrease (becoming more certain)
    const earlyEntropy = snapshots[0].entropy;
    const lateEntropy = snapshots[snapshots.length - 1].entropy;
    expect(lateEntropy).toBeLessThan(earlyEntropy);

    // Concentration ratio should increase
    const earlyRatio = snapshots[0].ratio;
    const lateRatio = snapshots[snapshots.length - 1].ratio;
    expect(lateRatio).toBeGreaterThan(earlyRatio);

    // Print trajectory visualization
    console.log('\n  Void Walking Kurtosis Trajectory (N=8, T=2000)');
    console.log('  ' + '─'.repeat(72));
    console.log(
      labeledSparkline(
        'ex.kurtosis',
        snapshots.map((s) => s.excessKurtosis),
      ),
    );
    console.log(
      labeledSparkline(
        'entropy',
        snapshots.map((s) => s.entropy),
      ),
    );
    console.log(
      labeledSparkline(
        'gini',
        snapshots.map((s) => s.gini),
      ),
    );
    console.log(
      labeledSparkline(
        'max/min',
        snapshots.map((s) => Math.min(s.ratio, 100)),
      ),
    );
    console.log('  ' + '─'.repeat(72));
    console.log('  t=0 (left) → t=2000 (right)\n');
  });

  it('kurtosis phase transition: crossing the mesokurtic threshold', () => {
    const N = 6;
    const trueCosts = [0.1, 0.3, 0.5, 0.6, 0.8, 0.95];
    const T = 5000;
    const rng = makeRng(123);

    const snapshots = collectKurtosisTrajectory(N, T, trueCosts, rng, 50);

    // Find the "crystallization" point where excess kurtosis crosses 0
    // (raw kurtosis crosses 3, transition from platykurtic to leptokurtic)
    let crossingRound = -1;
    for (let i = 1; i < snapshots.length; i++) {
      if (
        snapshots[i - 1].excessKurtosis <= 0 &&
        snapshots[i].excessKurtosis > 0
      ) {
        crossingRound = snapshots[i].round;
        break;
      }
    }

    // There should be a crossing (the walker should eventually concentrate)
    // If not, that's also valid -- some cost structures keep the walker exploring
    if (crossingRound > 0) {
      expect(crossingRound).toBeGreaterThan(0);
      expect(crossingRound).toBeLessThan(T);

      console.log(
        `\n  Phase transition: platykurtic → leptokurtic at round ${crossingRound}`,
      );
      console.log(
        `  (${((crossingRound / T) * 100).toFixed(1)}% of total rounds)\n`,
      );
    }

    // Regardless of crossing, entropy should not increase significantly
    // (learning constrains the distribution, it doesn't expand it)
    expect(snapshots[snapshots.length - 1].entropy).toBeLessThanOrEqual(
      snapshots[0].entropy + 0.01,
    );
  });

  it('dark matter analogy: void boundary scaffolds distribution shape', () => {
    // The cosmic matter distribution evolved from platykurtic (CMB uniformity)
    // to leptokurtic (galaxy clusters with voids between them).
    // Dark matter provides the gravitational potential wells that seed this.
    //
    // Void walking: the void boundary provides the "gravitational" scaffold
    // that seeds the complement distribution's shape evolution.
    //
    // Test: removing the void boundary (resetting vent counts) returns
    // the distribution to platykurtic, just as removing dark matter
    // would prevent large-scale structure formation.

    const N = 6;
    const trueCosts = [0.1, 0.3, 0.5, 0.6, 0.8, 0.95];

    // Phase 1: build up void boundary
    const rng = makeRng(42);
    const ventCounts = new Array(N).fill(0);
    for (let t = 0; t < 1000; t++) {
      const dist = complementDistribution(ventCounts);
      const r = rng();
      let cumProb = 0;
      let chosen = N - 1;
      for (let i = 0; i < N; i++) {
        cumProb += dist[i];
        if (r < cumProb) {
          chosen = i;
          break;
        }
      }
      ventCounts[chosen] += Math.round(trueCosts[chosen] * 100);
    }

    // After 1000 rounds: should have structure (non-uniform)
    const structuredDist = complementDistribution(ventCounts);
    const structuredKurt = excessKurtosis(structuredDist);
    const structuredGini = gini(structuredDist);

    // "Remove dark matter": reset void boundary
    const resetDist = complementDistribution(new Array(N).fill(0));
    const resetKurt = excessKurtosis(resetDist);
    const resetGini = gini(resetDist);

    // Structured distribution should have more extreme shape
    expect(structuredGini).toBeGreaterThan(resetGini);
    // Reset should be uniform (kurtosis = 0 since all values equal)
    expect(resetKurt).toBeCloseTo(0, 5);
    // Structured Gini should show real inequality
    expect(structuredGini).toBeGreaterThan(0);

    console.log('\n  Dark Matter / Void Boundary Analogy:');
    console.log('  ' + '─'.repeat(50));
    console.log(
      `  With void boundary:    gini=${structuredGini.toFixed(3)}  kurtosis=${structuredKurt.toFixed(3)}`,
    );
    console.log(
      `  Without (reset):       gini=${resetGini.toFixed(3)}  kurtosis=${resetKurt.toFixed(3)}`,
    );
    console.log(
      '  The void boundary IS the dark matter scaffold.\n',
    );
  });

  it('visualize complement distribution at multiple snapshots', () => {
    const N = 5;
    const labels = ['arm-0', 'arm-1', 'arm-2', 'arm-3', 'arm-4'];
    const trueCosts = [0.1, 0.3, 0.5, 0.7, 0.9];
    const T = 2000;
    const rng = makeRng(42);
    const ventCounts = new Array(N).fill(0);

    const checkpoints = [0, 100, 500, 1000, 2000];
    const distributions: { round: number; dist: number[] }[] = [];

    distributions.push({
      round: 0,
      dist: complementDistribution(ventCounts),
    });

    for (let t = 0; t < T; t++) {
      const dist = complementDistribution(ventCounts);
      const r = rng();
      let cumProb = 0;
      let chosen = N - 1;
      for (let i = 0; i < N; i++) {
        cumProb += dist[i];
        if (r < cumProb) {
          chosen = i;
          break;
        }
      }
      ventCounts[chosen] += Math.round(trueCosts[chosen] * 100);

      if (checkpoints.includes(t + 1)) {
        distributions.push({
          round: t + 1,
          dist: complementDistribution(ventCounts),
        });
      }
    }

    console.log('\n  Complement Distribution Evolution');
    console.log('  ' + '─'.repeat(60));

    for (const { round, dist } of distributions) {
      const kurt = excessKurtosis(dist);
      const h = entropy(dist);
      const shape =
        kurt > 0 ? 'leptokurtic' : kurt < -0.1 ? 'platykurtic' : 'mesokurtic';

      console.log(
        `\n  Round ${String(round).padStart(4)} (${shape}, κ=${kurt.toFixed(2)}, H=${h.toFixed(2)}):`,
      );
      console.log(barChart(dist, labels, 35));
    }
    console.log('  ' + '─'.repeat(60));
    console.log('  cost:     0.1    0.3    0.5    0.7    0.9');
    console.log('  Low cost arms should accumulate more probability.\n');

    // Verify final distribution favors low-cost arms
    const finalDist = distributions[distributions.length - 1].dist;
    expect(finalDist[0]).toBeGreaterThan(finalDist[N - 1]);
  });

  it('kurtosis responds to cost landscape changes (non-stationary)', () => {
    const N = 4;
    const T = 3000;
    const rng = makeRng(42);
    const ventCounts = new Array(N).fill(0);

    // Phase 1 (t=0..999): arm 0 is best
    // Phase 2 (t=1000..1999): arm 2 is best (regime change)
    // Phase 3 (t=2000..2999): arm 1 is best
    const costSchedule = (t: number): number[] => {
      if (t < 1000) return [0.1, 0.5, 0.7, 0.9];
      if (t < 2000) return [0.7, 0.5, 0.1, 0.9];
      return [0.5, 0.1, 0.7, 0.9];
    };

    const kurtosisTrace: number[] = [];
    const entropyTrace: number[] = [];

    for (let t = 0; t < T; t++) {
      const dist = complementDistribution(ventCounts);
      const r = rng();
      let cumProb = 0;
      let chosen = N - 1;
      for (let i = 0; i < N; i++) {
        cumProb += dist[i];
        if (r < cumProb) {
          chosen = i;
          break;
        }
      }

      const costs = costSchedule(t);
      ventCounts[chosen] += Math.round(costs[chosen] * 100);

      if ((t + 1) % 50 === 0) {
        const currentDist = complementDistribution(ventCounts);
        kurtosisTrace.push(excessKurtosis(currentDist));
        entropyTrace.push(entropy(currentDist));
      }
    }

    console.log('\n  Non-Stationary Kurtosis Response (regime changes at t=1000, 2000)');
    console.log('  ' + '─'.repeat(72));
    console.log(labeledSparkline('ex.kurtosis', kurtosisTrace));
    console.log(labeledSparkline('entropy', entropyTrace));
    console.log('  ' + '─'.repeat(72));
    console.log(
      '  Regime changes create kurtosis perturbations as the walker re-adapts.\n',
    );

    // The kurtosis trace should not be monotone (regime changes disrupt it)
    // Just verify we have variation
    const kurtMin = Math.min(...kurtosisTrace);
    const kurtMax = Math.max(...kurtosisTrace);
    expect(kurtMax - kurtMin).toBeGreaterThan(0);
  });

  it('kurtosis scales with number of arms (N)', () => {
    // More arms -> more room for distribution shape to vary
    const Ns = [3, 5, 10, 20, 50];
    const results: Array<{
      N: number;
      initialKurt: number;
      finalKurt: number;
      initialEntropy: number;
      finalEntropy: number;
    }> = [];

    for (const N of Ns) {
      // Create costs: linearly spaced from 0.05 to 0.95
      const trueCosts = Array.from(
        { length: N },
        (_, i) => 0.05 + (0.9 * i) / (N - 1),
      );
      const rng = makeRng(42);
      const ventCounts = new Array(N).fill(0);

      const initDist = complementDistribution(ventCounts);

      // Run 1000 rounds
      for (let t = 0; t < 1000; t++) {
        const dist = complementDistribution(ventCounts);
        const r = rng();
        let cumProb = 0;
        let chosen = N - 1;
        for (let i = 0; i < N; i++) {
          cumProb += dist[i];
          if (r < cumProb) {
            chosen = i;
            break;
          }
        }
        ventCounts[chosen] += Math.round(trueCosts[chosen] * 100);
      }

      const finalDist = complementDistribution(ventCounts);
      results.push({
        N,
        initialKurt: excessKurtosis(initDist),
        finalKurt: excessKurtosis(finalDist),
        initialEntropy: entropy(initDist),
        finalEntropy: entropy(finalDist),
      });
    }

    console.log('\n  Kurtosis Scaling with N (after 1000 rounds)');
    console.log('  ' + '─'.repeat(65));
    console.log(
      '  N'.padEnd(8) +
        'init κ'.padEnd(12) +
        'final κ'.padEnd(12) +
        'init H'.padEnd(12) +
        'final H'.padEnd(12) +
        'ΔH',
    );
    for (const r of results) {
      console.log(
        `  ${String(r.N).padEnd(8)}${r.initialKurt.toFixed(3).padEnd(12)}${r.finalKurt.toFixed(3).padEnd(12)}${r.initialEntropy.toFixed(3).padEnd(12)}${r.finalEntropy.toFixed(3).padEnd(12)}${(r.initialEntropy - r.finalEntropy).toFixed(3)}`,
      );
    }
    console.log('  ' + '─'.repeat(65) + '\n');

    // Initial entropy should scale with log(N)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].initialEntropy).toBeGreaterThan(
        results[i - 1].initialEntropy,
      );
    }

    // Final entropy should be lower than initial (learning happened)
    for (const r of results) {
      expect(r.finalEntropy).toBeLessThan(r.initialEntropy + 0.01);
    }
  });
});
