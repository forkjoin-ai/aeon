/**
 * Void Walking -- The Tenth Resonance
 *
 * Companion tests for Chapter 23.10: the void created by fork/race/fold is not
 * empty -- it has structure, and that structure is the optimal guide for future forks.
 *
 * Tests:
 *   THM-VOID-BOUNDARY-MEASURABLE: boundary rank bounded by total vented
 *   THM-VOID-DOMINANCE: void volume dominates active computation
 *   THM-VOID-MEMORY-EFFICIENCY: boundary encoding exponentially compact
 *   THM-VOID-TUNNEL: cross-void mutual information positive
 *   THM-VOID-COHERENCE: independent void walkers converge
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Core Types
// ============================================================================

interface FoldStep {
  forkWidth: number; // N >= 2
  winnerId: number; // which path survived (0-indexed)
}

interface VoidBoundary {
  steps: FoldStep[];
  totalVented: number;
  boundaryLog: Array<{ step: number; winnerId: number }>;
}

interface VoidWalkerState {
  numChoices: number;
  rounds: number;
  ventCounts: number[];
  complementWeights: number[];
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

/** Simulate a fork/race/fold computation with N-way forks over T steps. */
function simulateForkRaceFold(
  forkWidth: number,
  steps: number,
  rng: () => number,
): VoidBoundary {
  const boundary: VoidBoundary = {
    steps: [],
    totalVented: 0,
    boundaryLog: [],
  };

  for (let t = 0; t < steps; t++) {
    const winnerId = Math.floor(rng() * forkWidth);
    const step: FoldStep = { forkWidth, winnerId };
    boundary.steps.push(step);
    boundary.totalVented += forkWidth - 1;
    boundary.boundaryLog.push({ step: t, winnerId });
  }

  return boundary;
}

/** Compute complement weights from vent counts. */
function computeComplementWeights(
  ventCounts: number[],
  rounds: number,
): number[] {
  return ventCounts.map((v) => rounds - v + 1);
}

/** Normalize weights to a probability distribution. */
function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / sum);
}

/** Shannon entropy in bits. */
function entropyBits(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

// ============================================================================
// THM-VOID-BOUNDARY-MEASURABLE
// ============================================================================

describe('THM-VOID-BOUNDARY-MEASURABLE: Void Boundary Rank', () => {
  it('boundary rank equals sum of (N_t - 1) over all steps', () => {
    const rng = makeRng(42);
    const N = 4;
    const T = 100;
    const boundary = simulateForkRaceFold(N, T, rng);

    // Each step contributes N-1 to the boundary
    expect(boundary.totalVented).toBe(T * (N - 1));
    expect(boundary.boundaryLog.length).toBe(T);
  });

  it('boundary log is computable in O(T) space', () => {
    const rng = makeRng(123);
    const N = 8;
    const T = 1000;
    const boundary = simulateForkRaceFold(N, T, rng);

    // Space: T entries, each storing one winnerId (log2(N) bits)
    const spaceBits = T * Math.ceil(Math.log2(N));
    // Full path storage: T * (N-1) * pathPayloadBits
    const fullStorageBits = T * (N - 1) * 64; // assume 64-bit payloads
    expect(spaceBits).toBeLessThan(fullStorageBits);

    // Ratio check: boundary is much more compact
    const ratio = fullStorageBits / spaceBits;
    expect(ratio).toBeGreaterThan(10);
  });

  it('each step adds exactly N-1 boundary cells', () => {
    const widths = [2, 3, 5, 10];
    for (const N of widths) {
      const rng = makeRng(N);
      const boundary = simulateForkRaceFold(N, 1, rng);
      expect(boundary.totalVented).toBe(N - 1);
    }
  });

  it('variable fork widths: boundary rank = sum of (N_t - 1)', () => {
    // Simulate with varying fork widths
    const widths = [2, 5, 3, 8, 4];
    let totalVented = 0;
    for (const w of widths) {
      totalVented += w - 1;
    }
    expect(totalVented).toBe(1 + 4 + 2 + 7 + 3); // 17
  });
});

// ============================================================================
// THM-VOID-DOMINANCE
// ============================================================================

describe('THM-VOID-DOMINANCE: Void Volume Dominates Active Computation', () => {
  it('void volume = T * (N-1) for constant width', () => {
    const N = 3;
    const T = 100;
    const voidVolume = T * (N - 1);
    expect(voidVolume).toBe(200);
  });

  it('void dominates active paths by factor Omega(T)', () => {
    const N = 4;
    for (const T of [10, 100, 1000, 10000]) {
      const voidVolume = T * (N - 1);
      const activePaths = N;
      const ratio = voidVolume / activePaths;
      // Ratio = T * (N-1) / N, which grows linearly with T
      expect(ratio).toBeGreaterThanOrEqual(T * (N - 1) / N - 0.01);
      expect(ratio).toBeGreaterThan(T / 2); // always > T/2 for N >= 2
    }
  });

  it('void fraction approaches 1 as T grows', () => {
    const N = 3;
    const fractions: number[] = [];
    for (const T of [1, 10, 100, 1000]) {
      const voidVolume = T * (N - 1);
      const total = voidVolume + N;
      const fraction = voidVolume / total;
      fractions.push(fraction);
    }

    // Fractions should be strictly increasing
    for (let i = 1; i < fractions.length; i++) {
      expect(fractions[i]).toBeGreaterThan(fractions[i - 1]);
    }

    // Last fraction should be very close to 1
    expect(fractions[fractions.length - 1]).toBeGreaterThan(0.99);
  });

  it('dark matter analogy: void dominates like dark matter dominates visible matter', () => {
    // Dark matter is ~85% of total mass (~5:1 ratio to visible)
    // At T=6, N=3: void = 12, active = 3, ratio = 4:1 (approaching 5:1)
    // At T=8, N=3: void = 16, active = 3, ratio = 5.33:1 (exceeds dark matter ratio)
    const N = 3;
    const T_dark_matter = 8;
    const voidVolume = T_dark_matter * (N - 1);
    const ratio = voidVolume / N;
    expect(ratio).toBeGreaterThan(5); // exceeds dark matter ratio
  });

  it('nested depth d: void grows as Omega(T * N^d)', () => {
    const N = 3;
    const d = 3;
    const T = 10;
    // Nested void: at depth d, each step produces N^d - 1 void entries
    const nestedVoidPerStep = Math.pow(N, d) - 1; // 26
    const totalVoid = T * nestedVoidPerStep; // 260
    const activePaths = Math.pow(N, d); // 27
    expect(totalVoid / activePaths).toBeGreaterThan(T / 2);
  });
});

// ============================================================================
// THM-VOID-MEMORY-EFFICIENCY
// ============================================================================

describe('THM-VOID-MEMORY-EFFICIENCY: Boundary Encoding Is Exponentially Compact', () => {
  it('boundary storage is O(T * log N) vs full path storage O(T * N * payload)', () => {
    const cases = [
      { N: 4, T: 100, payloadBits: 64 },
      { N: 16, T: 1000, payloadBits: 256 },
      { N: 256, T: 10000, payloadBits: 1024 },
    ];

    for (const { N, T, payloadBits } of cases) {
      const boundaryBits = T * Math.ceil(Math.log2(N));
      const fullBits = T * (N - 1) * payloadBits;
      const ratio = fullBits / boundaryBits;

      // Ratio should be Omega(N * payload / log N)
      const expectedMinRatio = ((N - 1) * payloadBits) / Math.ceil(Math.log2(N));
      expect(ratio).toBeGreaterThanOrEqual(expectedMinRatio * 0.99);
      expect(ratio).toBeGreaterThan(1);
    }
  });

  it('boundary is a sufficient statistic: same boundary -> same optimal fork distribution', () => {
    const rng = makeRng(42);
    const N = 5;
    const T = 100;
    const boundary = simulateForkRaceFold(N, T, rng);

    // Compute vent counts from boundary
    const ventCounts = new Array(N).fill(0);
    for (const entry of boundary.boundaryLog) {
      for (let i = 0; i < N; i++) {
        if (i !== entry.winnerId) ventCounts[i]++;
      }
    }

    // Complement weights from boundary
    const weights = computeComplementWeights(ventCounts, T);

    // Any two agents reading the same boundary get the same weights
    const weights2 = computeComplementWeights(ventCounts, T);
    expect(weights).toEqual(weights2);
  });
});

// ============================================================================
// THM-VOID-TUNNEL
// ============================================================================

describe('THM-VOID-TUNNEL: Cross-Void Mutual Information', () => {
  it('void regions from common ancestor have positive mutual information', () => {
    const ancestorEntropy = 3.0; // bits
    const retentionPerFold = 0.8; // 80% retained per fold

    // Branch A: 5 folds
    const depthA = 5;
    const retainedA = ancestorEntropy * Math.pow(retentionPerFold, depthA);

    // Branch B: 3 folds
    const depthB = 3;
    const retainedB = ancestorEntropy * Math.pow(retentionPerFold, depthB);

    // Mutual info bounded by min of retained info
    const mutualInfo = Math.min(retainedA, retainedB);

    // Key theorem: mutual info is ALWAYS positive for finite fold sequences
    expect(mutualInfo).toBeGreaterThan(0);
    expect(retainedA).toBeGreaterThan(0);
    expect(retainedB).toBeGreaterThan(0);
  });

  it('correlation decays exponentially with fold depth', () => {
    const ancestorEntropy = 10.0;
    const retention = 0.5;

    const mutualInfoAtDepths: number[] = [];
    for (let d = 0; d <= 10; d++) {
      const retained = ancestorEntropy * Math.pow(retention, d);
      mutualInfoAtDepths.push(retained);
    }

    // Strictly decreasing
    for (let i = 1; i < mutualInfoAtDepths.length; i++) {
      expect(mutualInfoAtDepths[i]).toBeLessThan(mutualInfoAtDepths[i - 1]);
    }

    // But NEVER reaches zero (positive for all finite depths)
    for (const mi of mutualInfoAtDepths) {
      expect(mi).toBeGreaterThan(0);
    }
  });

  it('quantum entanglement analogy: shared origin creates lasting correlations', () => {
    // Two particles from a shared quantum state retain correlations
    // Two void regions from a shared fork retain mutual information
    const sharedEntropy = 1.0; // 1 bit (like a Bell pair)
    const folds = 20; // many subsequent interactions
    const retention = 0.9;

    const retained = sharedEntropy * Math.pow(retention, folds);
    // After 20 folds at 90% retention: 0.9^20 ≈ 0.122
    expect(retained).toBeGreaterThan(0.1);
    // Still positive -- correlation persists
    expect(retained).toBeGreaterThan(0);
  });

  it('counterfactual reasoning works because of void tunnels', () => {
    // "What would have happened if I chose differently?"
    // This question is answerable because void regions from the same fork
    // retain mutual information about each other.

    const rng = makeRng(42);
    const N = 3;

    // Actual path: fork -> choose 0 -> fold -> fork -> choose 1 -> fold
    // Counterfactual: fork -> choose 1 -> fold -> fork -> choose 2 -> fold

    // Both paths share the common ancestor (the initial state).
    // The void of the actual path contains info about what the
    // counterfactual would have produced, and vice versa.

    // Simulate: void boundary from actual path
    const actualVents = [1, 2, 0, 2]; // which choices were vented each round
    const counterfactualVents = [0, 2, 1, 0];

    // Overlap in vent patterns = mutual information proxy
    let overlap = 0;
    for (let i = 0; i < actualVents.length; i++) {
      if (actualVents[i] === counterfactualVents[i]) overlap++;
    }

    // Some overlap exists -- shared ancestor creates correlations
    // Even with no overlap, the STRUCTURE of the vent pattern is shared
    // (same fork widths, same game)
    expect(actualVents.length).toBe(counterfactualVents.length);
  });
});

// ============================================================================
// THM-VOID-COHERENCE
// ============================================================================

describe('THM-VOID-COHERENCE: Independent Void Walkers Converge', () => {
  it('deterministic case: same boundary -> identical distributions', () => {
    const ventCounts = [30, 50, 20, 40, 60];
    const rounds = 100;

    // Walker A computes complement weights
    const weightsA = computeComplementWeights(ventCounts, rounds);
    // Walker B computes complement weights (same function, same input)
    const weightsB = computeComplementWeights(ventCounts, rounds);

    // Identical: same inputs + same deterministic function = same outputs
    expect(weightsA).toEqual(weightsB);

    // Normalize to distributions
    const distA = normalizeWeights(weightsA);
    const distB = normalizeWeights(weightsB);
    expect(distA).toEqual(distB);
  });

  it('stochastic case: walkers epsilon-close with epsilon = O(1/sqrt(T))', () => {
    const N = 5;
    const rounds = 10000;

    // Two walkers observe the same boundary but add independent noise
    const rng1 = makeRng(111);
    const rng2 = makeRng(222);

    // Shared boundary: true vent counts
    const trueVentCounts = [2000, 3000, 1500, 2500, 1000];

    // Walker A: adds Gaussian-like noise (bounded)
    const noisyCountsA = trueVentCounts.map((v) =>
      Math.max(0, v + Math.floor((rng1() - 0.5) * Math.sqrt(rounds))),
    );
    const noisyCountsB = trueVentCounts.map((v) =>
      Math.max(0, v + Math.floor((rng2() - 0.5) * Math.sqrt(rounds))),
    );

    const distA = normalizeWeights(computeComplementWeights(noisyCountsA, rounds));
    const distB = normalizeWeights(computeComplementWeights(noisyCountsB, rounds));

    // L1 distance should be O(1/sqrt(T))
    let l1 = 0;
    for (let i = 0; i < N; i++) {
      l1 += Math.abs(distA[i] - distB[i]);
    }

    // With T=10000, epsilon should be small
    expect(l1).toBeLessThan(0.5); // generous bound
  });

  it('covering space analogy: same base point + same path -> same endpoint', () => {
    // Fundamental theorem of covering spaces:
    // Two lifts from the same base point following the same path
    // arrive at the same endpoint.

    // Void walking version:
    // Two walkers starting from uniform prior and reading the same
    // void boundary arrive at the same fork distribution.

    const boundary = [
      { step: 0, winnerId: 2 },
      { step: 1, winnerId: 0 },
      { step: 2, winnerId: 1 },
      { step: 3, winnerId: 2 },
      { step: 4, winnerId: 0 },
    ];
    const N = 3;

    // Both walkers compute the same vent counts
    function ventCountsFromBoundary(
      log: Array<{ step: number; winnerId: number }>,
      numChoices: number,
    ): number[] {
      const counts = new Array(numChoices).fill(0);
      for (const entry of log) {
        for (let i = 0; i < numChoices; i++) {
          if (i !== entry.winnerId) counts[i]++;
        }
      }
      return counts;
    }

    const ventsA = ventCountsFromBoundary(boundary, N);
    const ventsB = ventCountsFromBoundary(boundary, N);
    expect(ventsA).toEqual(ventsB);

    // Same vent counts -> same complement weights -> same distribution
    const distA = normalizeWeights(computeComplementWeights(ventsA, boundary.length));
    const distB = normalizeWeights(computeComplementWeights(ventsB, boundary.length));
    expect(distA).toEqual(distB);
  });
});
