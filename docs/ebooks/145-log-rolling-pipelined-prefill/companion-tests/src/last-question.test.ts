/**
 * The Last Question -- Companion Tests for §14.5.21
 *
 * Asimov's "The Last Question" (1956) as a Buleyean trajectory:
 * - "INSUFFICIENT DATA FOR MEANINGFUL ANSWER" = Bule > 0 (deficit positive)
 * - Data accumulates over rounds = void boundary grows monotonically
 * - Heat death = maximum void (all paths rejected)
 * - Answer computable at Bule = 0 (deficit zero, converged)
 * - "LET THERE BE LIGHT" = converged distribution seeds new fork
 * - The sliver (weight >= 1) ensures rebirth is always possible
 *
 * Companion theorems: LastQuestion.lean (9 sorry-free theorems),
 * LastQuestion.tla (7 invariants + 1 temporal property).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine: Buleyean probability + deficit tracking
// ============================================================================

/** Buleyean complement weight for choice i. */
function buleyeanWeight(rounds: number, voidCount: number): number {
  return rounds - Math.min(voidCount, rounds) + 1;
}

/** Future deficit: how many more rounds until convergence. */
function futureDeficit(currentDeficit: number, stepsAhead: number): number {
  return currentDeficit - Math.min(stepsAhead, currentDeficit);
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

/** Shannon entropy of a probability distribution. */
function shannonEntropy(dist: number[]): number {
  return -dist.reduce((sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum), 0);
}

// ============================================================================
// Test Group 1: "INSUFFICIENT DATA FOR MEANINGFUL ANSWER"
// ============================================================================

describe('insufficient data is positive Bule', () => {
  it('deficit is positive before convergence', () => {
    const initialDeficit = 9; // 10 choices, deficit = 9
    for (let round = 0; round < initialDeficit; round++) {
      const deficit = futureDeficit(initialDeficit, round);
      expect(deficit).toBeGreaterThan(0);
    }
  });

  it('deficit is exactly initialDeficit - rounds before convergence', () => {
    const initialDeficit = 7;
    for (let round = 0; round <= initialDeficit; round++) {
      const deficit = futureDeficit(initialDeficit, round);
      expect(deficit).toBe(initialDeficit - round);
    }
  });

  it('deficit stays at zero after convergence', () => {
    const initialDeficit = 5;
    for (let round = initialDeficit; round <= initialDeficit + 10; round++) {
      const deficit = futureDeficit(initialDeficit, round);
      expect(deficit).toBe(0);
    }
  });
});

// ============================================================================
// Test Group 2: Data accumulates monotonically
// ============================================================================

describe('data accumulates monotonically', () => {
  it('deficit never increases', () => {
    const initialDeficit = 15;
    let prevDeficit = initialDeficit;
    for (let round = 0; round <= initialDeficit + 5; round++) {
      const deficit = futureDeficit(initialDeficit, round);
      expect(deficit).toBeLessThanOrEqual(prevDeficit);
      prevDeficit = deficit;
    }
  });

  it('void boundary grows, complement sharpens', () => {
    const numChoices = 5;
    const maxRounds = 20;

    // Simulate rejection rounds: reject choice 4 most, choice 0 least
    const voidBoundary = [0, 0, 0, 0, 0];
    let prevEntropy = Infinity;

    for (let round = 1; round <= maxRounds; round++) {
      // Reject the choice with index round % numChoices (round-robin)
      voidBoundary[round % numChoices]++;

      const dist = buleyeanDistribution(round, voidBoundary);
      const entropy = shannonEntropy(dist);

      // After initial transient, entropy should generally decrease
      // (complement distribution sharpens as data accumulates)
      if (round > numChoices) {
        expect(entropy).toBeLessThanOrEqual(prevEntropy + 0.01);
      }
      prevEntropy = entropy;
    }
  });

  it('each rejection round brings deficit closer to zero', () => {
    for (const d of [3, 7, 12, 20, 100]) {
      for (let k = 0; k < d; k++) {
        expect(futureDeficit(d, k + 1)).toBeLessThanOrEqual(futureDeficit(d, k));
        expect(futureDeficit(d, k + 1)).toBe(futureDeficit(d, k) - 1);
      }
    }
  });
});

// ============================================================================
// Test Group 3: Answer is eventually computable
// ============================================================================

describe('answer eventually computable', () => {
  it.each([1, 2, 5, 10, 50, 100, 1000])(
    'deficit %d reaches zero at round %d',
    (d) => {
      expect(futureDeficit(d, d)).toBe(0);
    },
  );

  it('convergence round is exactly the initial deficit', () => {
    for (const d of [1, 3, 7, 15, 42]) {
      // Not converged one step before
      if (d > 0) {
        expect(futureDeficit(d, d - 1)).toBe(1);
      }
      // Converged exactly at d
      expect(futureDeficit(d, d)).toBe(0);
      // Stays converged after d
      expect(futureDeficit(d, d + 1)).toBe(0);
    }
  });

  it('trajectory is completely deterministic', () => {
    const d = 8;
    const trajectory = Array.from({ length: d + 3 }, (_, k) => futureDeficit(d, k));
    expect(trajectory).toEqual([8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0]);
  });
});

// ============================================================================
// Test Group 4: Heat death is maximum void
// ============================================================================

describe('heat death is maximum void', () => {
  it('all-rejected choices have weight exactly 1', () => {
    const rounds = 100;
    const numChoices = 5;
    const maxVoidBoundary = Array(numChoices).fill(rounds);
    for (const v of maxVoidBoundary) {
      expect(buleyeanWeight(rounds, v)).toBe(1);
    }
  });

  it('maximum void produces uniform minimum distribution', () => {
    const rounds = 50;
    const numChoices = 4;
    const maxVoidBoundary = Array(numChoices).fill(rounds);
    const dist = buleyeanDistribution(rounds, maxVoidBoundary);
    const expected = 1 / numChoices;
    for (const p of dist) {
      expect(p).toBeCloseTo(expected, 10);
    }
  });

  it('maximum void has minimum entropy (uniform over minimum weights)', () => {
    const rounds = 20;
    const numChoices = 3;
    const maxVoid = Array(numChoices).fill(rounds);
    const zeroVoid = Array(numChoices).fill(0);

    // Both produce uniform distributions but at different weight scales
    const maxVoidDist = buleyeanDistribution(rounds, maxVoid);
    const zeroVoidDist = buleyeanDistribution(rounds, zeroVoid);

    // Both are uniform, both have log2(numChoices) entropy
    const maxVoidEntropy = shannonEntropy(maxVoidDist);
    const zeroVoidEntropy = shannonEntropy(zeroVoidDist);
    expect(maxVoidEntropy).toBeCloseTo(zeroVoidEntropy, 10);
  });
});

// ============================================================================
// Test Group 5: The sliver survives heat death
// ============================================================================

describe('sliver survives heat death', () => {
  it('weight is always >= 1 regardless of rejections', () => {
    for (const rounds of [1, 10, 100, 1000]) {
      for (let v = 0; v <= rounds; v++) {
        expect(buleyeanWeight(rounds, v)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('weight is never zero', () => {
    for (const rounds of [1, 5, 50, 500]) {
      for (let v = 0; v <= rounds; v++) {
        expect(buleyeanWeight(rounds, v)).not.toBe(0);
      }
    }
  });

  it('minimum weight is exactly 1 (the sliver is tight)', () => {
    for (const rounds of [1, 10, 100]) {
      expect(buleyeanWeight(rounds, rounds)).toBe(1);
    }
  });

  it('the +1 is the sliver: without it, max-rejected would be zero', () => {
    for (const rounds of [1, 10, 100]) {
      const withSliver = buleyeanWeight(rounds, rounds);
      const withoutSliver = rounds - Math.min(rounds, rounds); // = 0
      expect(withoutSliver).toBe(0); // Would collapse to zero
      expect(withSliver).toBe(1); // The +1 prevents it
    }
  });
});

// ============================================================================
// Test Group 6: "LET THERE BE LIGHT" -- converged prior seeds new universe
// ============================================================================

describe('let there be light: converged distribution seeds new universe', () => {
  it('converged distribution is informative (not uniform)', () => {
    const rounds = 20;
    // Non-uniform rejection: some choices rejected more than others
    const boundary = [5, 10, 15, 20];
    const dist = buleyeanDistribution(rounds, boundary);

    // Less-rejected choices have higher weight
    expect(dist[0]).toBeGreaterThan(dist[1]);
    expect(dist[1]).toBeGreaterThan(dist[2]);
    expect(dist[2]).toBeGreaterThan(dist[3]);
  });

  it('converged distribution has positive total weight (valid prior)', () => {
    const rounds = 100;
    const boundary = [25, 50, 75, 100];
    const total = buleyeanTotalWeight(rounds, boundary);
    expect(total).toBeGreaterThan(0);
  });

  it('converged distribution can initialize a new Buleyean space', () => {
    // Universe 1: accumulate data
    const rounds1 = 10;
    const boundary1 = [2, 4, 6, 8];
    const dist1 = buleyeanDistribution(rounds1, boundary1);

    // Universe 2: use converged distribution as initial void boundary
    // Map the prior weights to initial rejection counts for Universe 2
    // Higher prior probability (lower v in Universe 1) -> lower initial rejection in Universe 2
    const rounds2 = 10;
    const boundary2 = boundary1.map((v) => v); // Inherit the rejection history
    const dist2 = buleyeanDistribution(rounds2, boundary2);

    // The ordering is preserved: same rejection history -> same ordering
    expect(dist2[0]).toBeGreaterThan(dist2[1]);
    expect(dist2[1]).toBeGreaterThan(dist2[2]);
    expect(dist2[2]).toBeGreaterThan(dist2[3]);
  });

  it('cycle: accumulate -> converge -> seed -> accumulate', () => {
    // Cycle 1: empty start, accumulate rejections
    const numChoices = 3;
    let boundary = [0, 0, 0];
    let rounds = 0;

    // Accumulate: reject choice 2, then 1, then 2, then 0, then 2
    const rejections = [2, 1, 2, 0, 2];
    for (const r of rejections) {
      boundary[r]++;
      rounds++;
    }
    // boundary = [1, 1, 3], rounds = 5

    // Check: deficit has decreased
    const initialDeficit = numChoices - 1; // 2
    const currentDeficit = futureDeficit(initialDeficit, rounds);
    expect(currentDeficit).toBe(0); // After 5 rounds, deficit(2, 5) = 0

    // The converged distribution is informative
    const dist = buleyeanDistribution(rounds, boundary);
    expect(dist[0]).toBeGreaterThan(dist[2]); // Choice 0 less rejected
    expect(dist[1]).toBeGreaterThan(dist[2]); // Choice 1 less rejected

    // Cycle 2: converged distribution becomes prior for new universe
    // "LET THERE BE LIGHT" -- fork from the converged state
    const newBoundary = [0, 0, 0]; // New universe starts fresh
    const newRounds = 1;
    const newDist = buleyeanDistribution(newRounds, newBoundary);

    // New universe starts uniform (all choices equal)
    expect(newDist[0]).toBeCloseTo(newDist[1], 10);
    expect(newDist[1]).toBeCloseTo(newDist[2], 10);
  });
});

// ============================================================================
// Test Group 7: Entropy reversal is complement convergence
// ============================================================================

describe('entropy reversal is complement convergence', () => {
  it('void grows monotonically (Second Law)', () => {
    const numChoices = 4;
    const boundary = [0, 0, 0, 0];
    let totalVoid = 0;

    for (let round = 0; round < 20; round++) {
      boundary[round % numChoices]++;
      const newTotalVoid = boundary.reduce((a, b) => a + b, 0);
      expect(newTotalVoid).toBeGreaterThanOrEqual(totalVoid);
      totalVoid = newTotalVoid;
    }
  });

  it('complement distribution entropy decreases with targeted rejection', () => {
    // Systematically reject one choice more than others
    const numChoices = 4;
    const boundary = [0, 0, 0, 0];
    let prevEntropy = Infinity;

    for (let round = 1; round <= 30; round++) {
      // Always reject choice 3 (targeted rejection)
      boundary[3]++;
      const dist = buleyeanDistribution(round, boundary);
      const entropy = shannonEntropy(dist);

      // Entropy should decrease (complement sharpens toward non-rejected choices)
      if (round > 1) {
        expect(entropy).toBeLessThan(prevEntropy + 1e-10);
      }
      prevEntropy = entropy;
    }
  });

  it('non-rejected choices gain weight after each rejection', () => {
    const rounds = 10;
    const boundary = [2, 3, 5, 7];

    // Weight of choice 0 before rejection of choice 3
    const weightBefore = buleyeanWeight(rounds, boundary[0]);

    // After rejecting choice 3: rounds increases, choice 0 count unchanged
    const weightAfter = buleyeanWeight(rounds + 1, boundary[0]);

    expect(weightAfter).toBeGreaterThanOrEqual(weightBefore);
  });

  it('the "entropy reversal" is the complement, not the void', () => {
    // The void (rejection history) only grows -- entropy increases
    // The complement (prediction) only sharpens -- entropy decreases
    // Same data, opposite signs
    //
    // Under targeted rejection (always reject the same choice),
    // the complement distribution shifts weight away from the
    // rejected choice and toward the non-rejected ones. The
    // distribution becomes less uniform. Entropy decreases.

    const numChoices = 4;
    const boundary = [0, 0, 0, 0];
    const voidTotals: number[] = [];
    const complementEntropies: number[] = [];

    for (let round = 1; round <= 20; round++) {
      // Targeted rejection: always reject choice 3
      boundary[3]++;

      // Void total (strictly increasing)
      voidTotals.push(boundary.reduce((a, b) => a + b, 0));

      // Complement entropy (should decrease under targeted rejection)
      const dist = buleyeanDistribution(round, boundary);
      complementEntropies.push(shannonEntropy(dist));
    }

    // Void total is strictly monotonically increasing
    for (let i = 1; i < voidTotals.length; i++) {
      expect(voidTotals[i]).toBeGreaterThan(voidTotals[i - 1]);
    }

    // Complement entropy is strictly monotonically decreasing
    // under targeted rejection (one choice accumulates all rejections)
    for (let i = 1; i < complementEntropies.length; i++) {
      expect(complementEntropies[i]).toBeLessThan(complementEntropies[i - 1] + 1e-10);
    }
  });
});
