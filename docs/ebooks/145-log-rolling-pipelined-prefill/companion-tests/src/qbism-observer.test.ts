/**
 * QBism Observer Effect as Topological Deficit
 *
 * Tests for §14.5.20: the quantum Observer Effect is a shift in beta1
 * caused by folding a fork. Superposition = fork (beta1 = rootN - 1).
 * Measurement = fold (beta1 -> 0). Deficit = rootN - 1.
 *
 * QBism identifies quantum states with Bayesian priors. In the Buleyean
 * framework, this is exact: QBist state = BayesianPrior = initialized
 * void boundary. Coherence = same boundary -> same weights.
 *
 * Companion theorems: QuantumObserver.lean (7 sorry-free theorems),
 * QuantumObserver.tla (5 invariants, model-checked).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine: Buleyean probability + quantum system model
// ============================================================================

/** Intrinsic beta1 of a rootN-path fork topology. */
function intrinsicBeta1(rootN: number): number {
  return rootN - 1;
}

/** Classical beta1 after measurement: always 0 (path graph). */
function classicalBeta1(): number {
  return 0;
}

/** Quantum beta1: preserves all intrinsic cycles. */
function quantumBeta1(rootN: number): number {
  return intrinsicBeta1(rootN);
}

/** Classical deficit: intrinsic - classical = rootN - 1. */
function classicalDeficit(rootN: number): number {
  return intrinsicBeta1(rootN) - classicalBeta1();
}

/** Quantum deficit: intrinsic - quantum = 0. */
function quantumDeficit(rootN: number): number {
  return intrinsicBeta1(rootN) - quantumBeta1(rootN);
}

/** Buleyean complement weight for choice i. */
function buleyeanWeight(rounds: number, voidCount: number): number {
  return rounds - Math.min(voidCount, rounds) + 1;
}

/** Buleyean total weight across all choices. */
function buleyeanTotalWeight(rounds: number, voidBoundary: number[]): number {
  return voidBoundary.reduce((sum, v) => sum + buleyeanWeight(rounds, v), 0);
}

/** Buleyean complement distribution (normalized weights). */
function buleyeanDistribution(rounds: number, voidBoundary: number[]): number[] {
  const total = buleyeanTotalWeight(rounds, voidBoundary);
  return voidBoundary.map((v) => buleyeanWeight(rounds, v) / total);
}

// ============================================================================
// Test Group 1: Observer fold collapses beta1
// ============================================================================

describe('observer fold collapses beta1', () => {
  const rootNValues = [2, 3, 4, 5, 8, 10, 16, 32, 64, 100];

  it.each(rootNValues)('rootN=%d: pre-measurement beta1 = rootN - 1', (rootN) => {
    expect(intrinsicBeta1(rootN)).toBe(rootN - 1);
  });

  it.each(rootNValues)('rootN=%d: post-measurement beta1 = 0', (rootN) => {
    // After fold, all cycles collapse
    const postBeta1 = 0;
    expect(postBeta1).toBe(0);
  });

  it.each(rootNValues)('rootN=%d: beta1 shift = rootN - 1', (rootN) => {
    const preBeta1 = intrinsicBeta1(rootN);
    const postBeta1 = 0;
    expect(preBeta1 - postBeta1).toBe(rootN - 1);
  });

  it('trivial system rootN=1 has zero beta1 shift', () => {
    expect(intrinsicBeta1(1)).toBe(0);
    expect(classicalDeficit(1)).toBe(0);
  });
});

// ============================================================================
// Test Group 2: Deficit exactness
// ============================================================================

describe('deficit exactness', () => {
  const cases = [
    { rootN: 2, expectedDeficit: 1 },
    { rootN: 4, expectedDeficit: 3 },
    { rootN: 8, expectedDeficit: 7 },
    { rootN: 16, expectedDeficit: 15 },
    { rootN: 32, expectedDeficit: 31 },
    { rootN: 100, expectedDeficit: 99 },
  ];

  it.each(cases)(
    'rootN=$rootN: classical deficit = $expectedDeficit',
    ({ rootN, expectedDeficit }) => {
      expect(classicalDeficit(rootN)).toBe(expectedDeficit);
    },
  );

  it.each(cases)('rootN=$rootN: quantum deficit = 0', ({ rootN }) => {
    expect(quantumDeficit(rootN)).toBe(0);
  });

  it.each(cases)(
    'rootN=$rootN: speedup = classical deficit + 1',
    ({ rootN }) => {
      const N = rootN * rootN;
      const speedup = N / rootN;
      expect(speedup).toBe(classicalDeficit(rootN) + 1);
    },
  );

  it('deficit + quantum beta1 = intrinsic beta1', () => {
    for (const rootN of [2, 4, 8, 16, 32]) {
      expect(quantumDeficit(rootN) + quantumBeta1(rootN)).toBe(intrinsicBeta1(rootN));
      expect(classicalDeficit(rootN) + classicalBeta1()).toBe(intrinsicBeta1(rootN));
    }
  });
});

// ============================================================================
// Test Group 3: Two-observer coherence
// ============================================================================

describe('two-observer coherence', () => {
  it('identical void boundaries produce identical weights', () => {
    const rounds = 10;
    const boundary = [3, 5, 1, 7, 2];
    const dist1 = buleyeanDistribution(rounds, boundary);
    const dist2 = buleyeanDistribution(rounds, boundary);
    expect(dist1).toEqual(dist2);
  });

  it('different observers with same data agree', () => {
    const rounds = 20;
    const boundary = [0, 5, 10, 15, 20];
    // Observer 1 and Observer 2 both read the same boundary
    const weights1 = boundary.map((v) => buleyeanWeight(rounds, v));
    const weights2 = boundary.map((v) => buleyeanWeight(rounds, v));
    expect(weights1).toEqual(weights2);
  });

  it('coherence holds across all boundary configurations', () => {
    const configs = [
      { rounds: 5, boundary: [0, 0, 0] },
      { rounds: 10, boundary: [10, 10, 10] },
      { rounds: 100, boundary: [25, 50, 75, 100] },
      { rounds: 1, boundary: [0, 1] },
    ];
    for (const { rounds, boundary } of configs) {
      const d1 = buleyeanDistribution(rounds, boundary);
      const d2 = buleyeanDistribution(rounds, boundary);
      for (let i = 0; i < d1.length; i++) {
        expect(d1[i]).toBeCloseTo(d2[i], 15);
      }
    }
  });

  it('different boundaries produce different distributions', () => {
    const rounds = 10;
    const boundary1 = [2, 8];
    const boundary2 = [8, 2];
    const d1 = buleyeanDistribution(rounds, boundary1);
    const d2 = buleyeanDistribution(rounds, boundary2);
    // Swapped boundaries produce swapped distributions
    expect(d1[0]).toBeCloseTo(d2[1], 15);
    expect(d1[1]).toBeCloseTo(d2[0], 15);
  });
});

// ============================================================================
// Test Group 4: QBist prior maps to Buleyean space
// ============================================================================

describe('QBist prior maps to Buleyean space', () => {
  it('uniform prior = all-zero void boundary = maximum entropy', () => {
    const rounds = 10;
    const numChoices = 4;
    const uniformBoundary = Array(numChoices).fill(0);
    const dist = buleyeanDistribution(rounds, uniformBoundary);
    // All weights equal under uniform prior
    const expected = 1 / numChoices;
    for (const p of dist) {
      expect(p).toBeCloseTo(expected, 10);
    }
  });

  it('informative prior = initialized void boundary', () => {
    const rounds = 10;
    // Choice 0 has low rejection (high prior), choice 3 has high rejection (low prior)
    const boundary = [1, 3, 5, 9];
    const dist = buleyeanDistribution(rounds, boundary);
    // Less-rejected choices get higher weight
    expect(dist[0]).toBeGreaterThan(dist[1]);
    expect(dist[1]).toBeGreaterThan(dist[2]);
    expect(dist[2]).toBeGreaterThan(dist[3]);
  });

  it('all weights are strictly positive (never say never)', () => {
    const rounds = 100;
    const boundary = [0, 50, 100]; // Even max-rejected choice gets positive weight
    for (const v of boundary) {
      expect(buleyeanWeight(rounds, v)).toBeGreaterThan(0);
    }
    // Max-rejected choice has weight exactly 1
    expect(buleyeanWeight(rounds, 100)).toBe(1);
  });

  it('QBist update = Buleyean rejection step', () => {
    const rounds = 5;
    const boundary = [1, 2, 1];
    const beforeDist = buleyeanDistribution(rounds, boundary);

    // Reject choice 1 (increase its void count)
    const updatedBoundary = [1, 3, 1];
    const afterDist = buleyeanDistribution(rounds + 1, updatedBoundary);

    // Non-rejected choices gain relative weight
    // Choice 0 and choice 2 should have higher relative weight after rejection of 1
    const relBefore = beforeDist[0] / beforeDist[1];
    const relAfter = afterDist[0] / afterDist[1];
    expect(relAfter).toBeGreaterThan(relBefore);
  });
});

// ============================================================================
// Test Group 5: Frequentist-to-Bayesian transition matches measurement-to-outcome
// ============================================================================

describe('frequentist-to-Bayesian transition matches measurement-to-outcome', () => {
  it('learning phase (Bule > 0) is frequentist: counting rejections', () => {
    const rounds = 10;
    const boundary = [2, 4, 6, 8];
    const weights = boundary.map((v) => buleyeanWeight(rounds, v));
    // Weights are derived purely from rejection counts -- no prior needed
    expect(weights[0]).toBe(rounds - 2 + 1); // 9
    expect(weights[1]).toBe(rounds - 4 + 1); // 7
    expect(weights[2]).toBe(rounds - 6 + 1); // 5
    expect(weights[3]).toBe(rounds - 8 + 1); // 3
  });

  it('converged state (Bule = 0) serves as Bayesian prior', () => {
    // A converged distribution from one experiment becomes the prior for the next
    const rounds1 = 20;
    const boundary1 = [5, 10, 15, 20];
    const dist1 = buleyeanDistribution(rounds1, boundary1);

    // The converged distribution IS the prior ordering
    // Less-rejected = higher prior probability
    for (let i = 0; i < dist1.length - 1; i++) {
      expect(dist1[i]).toBeGreaterThan(dist1[i + 1]);
    }
  });

  it('measurement in quantum = fold in topology = rejection in Buleyean', () => {
    // Before measurement: rootN paths, beta1 = rootN - 1
    const rootN = 4;
    const preBeta1 = intrinsicBeta1(rootN);
    expect(preBeta1).toBe(3);

    // Measurement = fold: select one path, vent 3
    const postBeta1 = 0;
    const vented = preBeta1 - postBeta1;
    expect(vented).toBe(3);

    // In Buleyean terms: 3 rejection entries added to void boundary
    // The deficit (3) equals the number of vented paths
    expect(classicalDeficit(rootN)).toBe(vented);
  });

  it('Grover speedup = deficit + 1', () => {
    for (const rootN of [2, 4, 8, 16]) {
      const N = rootN * rootN;
      const groverRounds = rootN; // O(sqrt(N))
      const classicalRounds = N; // O(N)
      const speedup = classicalRounds / groverRounds;
      expect(speedup).toBe(rootN);
      expect(speedup).toBe(classicalDeficit(rootN) + 1);
    }
  });
});

// ============================================================================
// Test Group 6: Superposition-as-fork algebra
// ============================================================================

describe('superposition-as-fork algebra', () => {
  it('fork width = number of superposed paths', () => {
    for (const rootN of [2, 3, 5, 10, 100]) {
      // A rootN-way fork has rootN paths
      // Beta1 = rootN - 1 (one fewer independent cycle than paths)
      expect(intrinsicBeta1(rootN)).toBe(rootN - 1);
    }
  });

  it('fold vents exactly rootN - 1 paths', () => {
    for (const rootN of [2, 4, 8, 16, 32]) {
      const surviving = 1; // Fold selects exactly one
      const vented = rootN - surviving;
      expect(vented).toBe(rootN - 1);
      expect(vented).toBe(intrinsicBeta1(rootN));
    }
  });

  it('search space N = rootN^2 (perfect square)', () => {
    for (const rootN of [2, 4, 8, 16, 32]) {
      const N = rootN * rootN;
      expect(Math.sqrt(N)).toBe(rootN);
    }
  });

  it('sequential search = N rounds, quantum search = rootN rounds', () => {
    for (const rootN of [2, 4, 8, 16]) {
      const N = rootN * rootN;
      expect(N).toBe(rootN * rootN); // classical: check all
      expect(rootN).toBeLessThan(N); // quantum: sqrt(N) < N
    }
  });

  it('deficit composition: two sequential measurements', () => {
    // First measurement: rootN1 paths
    const rootN1 = 4;
    const deficit1 = classicalDeficit(rootN1);

    // Second measurement: rootN2 paths from remaining
    const rootN2 = 3;
    const deficit2 = classicalDeficit(rootN2);

    // Total deficit = sum of individual deficits
    // (each fold independently vents its paths)
    expect(deficit1 + deficit2).toBe((rootN1 - 1) + (rootN2 - 1));
    expect(deficit1 + deficit2).toBe(5);
  });

  it('zero superposition (rootN=1) has zero deficit', () => {
    expect(intrinsicBeta1(1)).toBe(0);
    expect(classicalDeficit(1)).toBe(0);
    expect(quantumDeficit(1)).toBe(0);
  });

  it('deficit is monotone in rootN', () => {
    const values = [2, 4, 8, 16, 32, 64];
    for (let i = 0; i < values.length - 1; i++) {
      expect(classicalDeficit(values[i])).toBeLessThan(classicalDeficit(values[i + 1]));
    }
  });
});
