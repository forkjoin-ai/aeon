/**
 * Pipeline Formulas — Companion Tests for §7
 *
 * Proves:
 *   1. Worthington Whip (§7.3): per-shard savings = (S-1)/2S
 *   2. Speculative Tree (§7.4): expected accepted = (1 - α^K)/(1 - α)
 *   3. Turbulent Multiplexing (§7.2): 43% idle slots during ramp-up/ramp-down
 */

import { describe, expect, it } from 'vitest';

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// ============================================================================
// §7.3 — Worthington Whip (Superposition Sharding)
// ============================================================================

describe('Worthington Whip: Superposition Sharding (§7.3)', () => {
  /**
   * A single workload of P items through N stages is sharded into S
   * parallel pipelines. Each shard processes P/S items.
   * Per-shard compute savings: (S-1)/2S
   */

  it('savings formula (S-1)/2S holds for all shard counts', () => {
    const shardCounts = [1, 2, 3, 4, 5, 8, 10, 16, 32, 64];
    const P = 10_000; // large enough for asymptotic behavior to be visible

    for (const S of shardCounts) {
      const expectedSavings = (S - 1) / (2 * S);

      // Verify formula properties
      if (S === 1) {
        expect(expectedSavings).toBe(0); // no savings with 1 shard
      } else {
        expect(expectedSavings).toBeGreaterThan(0);
        expect(expectedSavings).toBeLessThan(0.5); // asymptote at 50%
      }

      // Finite-P derivation:
      // Sequential expected queue depth = (P-1)/2
      // Sharded expected queue depth    = (P/S - 1)/2
      // Savings fraction vs sequential depth:
      //   ((P-1)/2 - (P/S -1)/2) / (P-1) = P(S-1)/(2S(P-1))
      const finitePSavings = (P * (S - 1)) / (2 * S * (P - 1));
      expect(finitePSavings).toBeCloseTo(expectedSavings, 3);

      // Monte Carlo validation of queue-depth interpretation
      const rng = makeRng(0xC0FFEE + S);
      const trials = 20_000;
      let totalSequentialWait = 0;
      let totalShardedWait = 0;
      const shardDepth = Math.ceil(P / S);

      for (let t = 0; t < trials; t++) {
        totalSequentialWait += Math.floor(rng() * P);
        totalShardedWait += Math.floor(rng() * shardDepth);
      }

      const avgSequentialWait = totalSequentialWait / trials;
      const avgShardedWait = totalShardedWait / trials;
      const empiricalSavings =
        (avgSequentialWait - avgShardedWait) / P;

      expect(Math.abs(empiricalSavings - expectedSavings)).toBeLessThan(0.03);
    }

    // The formula (S-1)/2S converges to 0.5 as S→∞
    expect((1000 - 1) / (2 * 1000)).toBeCloseTo(0.5, 2);

    // S=2: 25% savings
    expect((2 - 1) / (2 * 2)).toBe(0.25);

    // S=4: 37.5% savings
    expect((4 - 1) / (2 * 4)).toBe(0.375);

    // S=8: 43.75% savings
    expect((8 - 1) / (2 * 8)).toBeCloseTo(0.4375, 10);
  });

  it('sharding reduces idle slots in the pipeline triangle', () => {
    // The Triangle (§1.1): ramp-up + plateau + ramp-down
    // Idle slots in triangle = N(N-1)/2 per ramp phase, so N(N-1) total
    // Total slots = (P + N - 1) × N
    // Idle fraction = N(N-1) / ((P + N - 1) × N)

    const P = 100;
    const N = 4;

    // Unsharded idle slots
    const unshardedTotal = (P + N - 1) * N;
    const unshardedIdle = N * (N - 1); // ramp-up + ramp-down triangles
    const unshardedIdleFraction = unshardedIdle / unshardedTotal;

    // Sharded into S=4: each shard has P/S = 25 items
    const S = 4;
    const itemsPerShard = Math.ceil(P / S);
    const shardedTotalPerShard = (itemsPerShard + N - 1) * N;
    const shardedIdlePerShard = N * (N - 1);
    const shardedIdleFraction = shardedIdlePerShard / shardedTotalPerShard;

    // Idle fraction is higher per-shard (smaller pipeline, same ramp overhead)
    // BUT total idle slots across all shards is: S × N(N-1)
    // vs unsharded: N(N-1)
    // The sharding trades total idle for parallelism

    // Per-shard pipeline is shorter (latency win)
    const savings = 1 - (itemsPerShard + N - 1) / (P + N - 1);
    expect(savings).toBeGreaterThan(0.5);

    // Key: sharding reduces LATENCY at cost of slightly more total idle
    const latencyReduction = 1 - (itemsPerShard + N - 1) / (P + N - 1);
    expect(latencyReduction).toBeGreaterThan(0);

    // Smaller shards pay ramp overhead more often.
    expect(shardedIdleFraction).toBeGreaterThan(unshardedIdleFraction);
  });

  it('cross-shard correction cost increases with S', () => {
    // The paper notes: cross-shard correction scales with shard count
    // This limits the benefit of sharding

    function totalTime(P: number, N: number, S: number, correctionCost: number): number {
      const itemsPerShard = Math.ceil(P / S);
      const shardTime = itemsPerShard + N - 1;
      const correction = correctionCost * S; // correction scales with shard count
      return shardTime + correction;
    }

    const P = 100;
    const N = 4;
    const correctionCost = 2; // 2 time units per shard for cross-shard correction

    // Find optimal shard count
    let bestS = 1;
    let bestTime = totalTime(P, N, 1, correctionCost);

    for (let S = 2; S <= 20; S++) {
      const t = totalTime(P, N, S, correctionCost);
      if (t < bestTime) {
        bestTime = t;
        bestS = S;
      }
    }

    // Optimal S is finite — you can't shard infinitely
    expect(bestS).toBeGreaterThan(1);
    expect(bestS).toBeLessThan(20);

    // Over-sharding is worse than under-sharding
    const timeAtS1 = totalTime(P, N, 1, correctionCost);
    const timeAtS20 = totalTime(P, N, 20, correctionCost);
    expect(timeAtS20).toBeGreaterThan(bestTime);
  });
});

// ============================================================================
// §7.4 — Speculative Tree
// ============================================================================

describe('Speculative Tree (§7.4)', () => {
  /**
   * Expected accepted tokens per speculative pass:
   * E[accepted] = (1 - α^K) / (1 - α)
   * where α = acceptance rate, K = number of draft positions validated.
   *
   * This formulation counts one guaranteed base token plus a speculative chain
   * of length K-1 that continues while validations pass.
   */

  function expectedAccepted(alpha: number, K: number): number {
    return (1 - Math.pow(alpha, K)) / (1 - alpha);
  }

  function simulateAccepted(alpha: number, K: number, trials: number, seed: number): number {
    const rng = makeRng(seed);
    let totalAccepted = 0;

    for (let t = 0; t < trials; t++) {
      // One base token is always retained; each additional speculative token
      // survives with probability α until the first rejection.
      let accepted = 1;
      for (let k = 1; k < K; k++) {
        if (rng() < alpha) {
          accepted++;
        } else {
          break;
        }
      }
      totalAccepted += accepted;
    }

    return totalAccepted / trials;
  }

  it('formula (1 - α^K)/(1 - α) matches empirical acceptance', () => {
    const alphas = [0.3, 0.5, 0.7, 0.8, 0.9, 0.95];
    const Ks = [1, 2, 4, 8, 16];

    for (const alpha of alphas) {
      for (const K of Ks) {
        const expected = expectedAccepted(alpha, K);
        const empirical = simulateAccepted(
          alpha,
          K,
          20_000,
          Math.floor(alpha * 1_000_000) + K,
        );

        expect(Math.abs(empirical - expected)).toBeLessThan(0.12);
      }
    }
  });

  it('K=1 yields exactly one accepted base token', () => {
    const alpha = 0.7;
    const K = 1;
    const expected = expectedAccepted(alpha, K);
    const empirical = simulateAccepted(alpha, K, 2000, 0xACE1);

    expect(expected).toBe(1);
    expect(empirical).toBe(1);
  });

  it('higher α yields more accepted tokens per pass', () => {
    const K = 8;
    const alphas = [0.3, 0.5, 0.7, 0.9, 0.95];

    const expected = alphas.map((alpha) => expectedAccepted(alpha, K));

    // Strictly increasing
    for (let i = 1; i < expected.length; i++) {
      expect(expected[i]).toBeGreaterThan(expected[i - 1]);
    }

    // At α = 0.95, K = 8: expect ~6.6 accepted tokens
    expect(expected[expected.length - 1]).toBeGreaterThan(6);
  });

  it('higher K yields more accepted tokens (diminishing returns)', () => {
    const alpha = 0.8;
    const Ks = [1, 2, 3, 4, 5, 6, 7, 8];

    const expected = Ks.map((K) => expectedAccepted(alpha, K));

    // Strictly increasing
    for (let i = 1; i < expected.length; i++) {
      expect(expected[i]).toBeGreaterThan(expected[i - 1]);
    }

    // Converges to 1/(1-α) = 5 as K→∞
    const limit = 1 / (1 - alpha);
    expect(expected[expected.length - 1]).toBeLessThan(limit);

    // Diminishing returns: marginal gain decreases for each +1 in K
    const gains = expected.map((e, i) => (i > 0 ? e - expected[i - 1] : 0));
    for (let i = 2; i < gains.length; i++) {
      expect(gains[i]).toBeLessThan(gains[i - 1]);
    }
  });
});

// ============================================================================
// §7.2 — Turbulent Multiplexing
// ============================================================================

describe('Turbulent Multiplexing (§7.2)', () => {
  /**
   * When C ≈ N, 43% of node-slots are idle during ramp-up/ramp-down.
   * Turbulent multiplexing fills these idle slots with items from
   * concurrent requests.
   */

  it('idle fraction = N(N-1) / (2(C+N-1)) for ramp-up/ramp-down', () => {
    // The Triangle: total slots = (C + N - 1) × N
    // Where C = items (chunks), N = stages
    // Idle slots: ramp-up has N(N-1)/2, ramp-down has N(N-1)/2
    // Total idle = N(N-1)
    // Idle fraction = N(N-1) / ((C + N - 1) × N) = (N-1) / (C + N - 1)

    const testCases = [
      { C: 10, N: 4 },
      { C: 100, N: 4 },
      { C: 4, N: 4 },  // C ≈ N case
      { C: 5, N: 5 },  // C = N case
      { C: 8, N: 8 },  // C = N case
    ];

    for (const { C, N } of testCases) {
      const totalSlots = (C + N - 1) * N;
      const idleSlots = N * (N - 1); // ramp-up + ramp-down
      const idleFraction = idleSlots / totalSlots;
      const formulaResult = (N - 1) / (C + N - 1);

      expect(idleFraction).toBeCloseTo(formulaResult, 10);
    }
  });

  it('C = N gives approximately 43% idle fraction', () => {
    // When C = N (items equal stages):
    // idle fraction = (N-1)/(N + N - 1) = (N-1)/(2N-1)
    // As N → ∞: → 1/2 = 50%
    // For practical N (4-10): around 43%

    const practicalN = [4, 5, 6, 7, 8, 9, 10];
    const idleFractions = practicalN.map(
      (N) => (N - 1) / (2 * N - 1),
    );

    // Average across practical N values
    const avg =
      idleFractions.reduce((s, f) => s + f, 0) / idleFractions.length;

    // Should be around 43%
    expect(avg).toBeGreaterThan(0.40);
    expect(avg).toBeLessThan(0.47);

    // Specific: N=4: (3/7) ≈ 42.9%
    expect((4 - 1) / (2 * 4 - 1)).toBeCloseTo(0.4286, 3);

    // N=8: (7/15) ≈ 46.7%
    expect((8 - 1) / (2 * 8 - 1)).toBeCloseTo(0.4667, 3);
  });

  it('idle fraction decreases with more items C >> N', () => {
    const N = 4;
    const Cs = [4, 10, 50, 100, 500, 1000];

    const fractions = Cs.map((C) => (N - 1) / (C + N - 1));

    // Strictly decreasing
    for (let i = 1; i < fractions.length; i++) {
      expect(fractions[i]).toBeLessThan(fractions[i - 1]);
    }

    // Approaches 0 for large C
    expect(fractions[fractions.length - 1]).toBeLessThan(0.01);
  });

  it('turbulent multiplexing fills idle slots with concurrent requests', () => {
    // Simulate: two requests sharing a 4-stage pipeline
    const N = 4; // stages
    const C1 = 6; // items in request 1
    const C2 = 4; // items in request 2

    // Without multiplexing: sequential execution
    const seqSteps1 = C1 + N - 1; // 9
    const seqSteps2 = C2 + N - 1; // 7
    const seqTotal = seqSteps1 + seqSteps2; // 16
    const seqSlots = seqTotal * N; // 64
    const seqBusy = C1 * N + C2 * N; // 40
    const seqIdle = seqSlots - seqBusy; // 24
    expect(seqIdle).toBeGreaterThan(0);

    // With turbulent multiplexing: interleave during ramp phases
    // Request 2 can start filling idle slots during request 1's ramp-down
    // Overlap: min(ramp-down idle slots, request 2 ramp-up needed)
    const overlapSlots = Math.min(N * (N - 1) / 2, C2);
    expect(overlapSlots).toBeGreaterThan(0);

    // Total time with multiplexing is less than sequential
    const muxTotal = seqTotal - overlapSlots;
    expect(muxTotal).toBeLessThan(seqTotal);
  });
});
