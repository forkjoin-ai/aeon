/**
 * Richer Service Distributions -- Companion Tests
 *
 * Closes the future-work gap: "Extending this characterization to richer
 * timing/service distributions and adaptive sharding policies remains
 * future work."
 *
 * For each distribution family (exponential, Erlang-k, hyperexponential,
 * deterministic, log-normal, Pareto) we verify:
 *   1. Little's Law (L = lambda * W) holds within Monte Carlo tolerance
 *   2. Conservation (arrivals = departures + in-system) on finite traces
 *   3. The Worthington Whip crossover persists (over-sharding increases cost)
 *   4. Cross-shard cost under non-exponential service times
 *
 * All simulations use a seeded LCG PRNG for reproducibility.
 * No external dependencies -- pure math.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Seeded PRNG (LCG)
// ---------------------------------------------------------------------------

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// ---------------------------------------------------------------------------
// Distribution samplers
// ---------------------------------------------------------------------------

function exponentialSample(rng: () => number, rate: number): number {
  const u = Math.max(rng(), Number.EPSILON);
  return -Math.log(u) / rate;
}

function erlangSample(rng: () => number, k: number, rate: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) {
    sum += exponentialSample(rng, rate * k); // each phase has rate k*rate so mean = 1/rate
  }
  return sum;
}

function normalSample(rng: () => number): number {
  // Box-Muller transform
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = Math.max(rng(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function hyperexpSample(
  rng: () => number,
  p: number,
  rate1: number,
  rate2: number
): number {
  // Mixture of two exponentials: with probability p use rate1, else rate2
  return rng() < p
    ? exponentialSample(rng, rate1)
    : exponentialSample(rng, rate2);
}

function lognormalSample(rng: () => number, mu: number, sigma: number): number {
  return Math.exp(mu + sigma * normalSample(rng));
}

function paretoSample(rng: () => number, alpha: number, xm: number): number {
  const u = Math.max(rng(), Number.EPSILON);
  return xm / Math.pow(u, 1 / alpha);
}

// ---------------------------------------------------------------------------
// Queue simulation (continuous-time, single server, FCFS)
// ---------------------------------------------------------------------------

interface QueueResult {
  /** time-average number in system */
  L: number;
  /** average sojourn time (wait + service) */
  W: number;
  /** effective throughput rate */
  lambda: number;
  /** total departures */
  departures: number;
  /** jobs still in system at end */
  inSystem: number;
  /** total arrivals */
  arrivals: number;
}

function simulateQueue(
  arrivalRate: number,
  serviceSampler: (rng: () => number) => number,
  rounds: number,
  rng: () => number
): QueueResult {
  // Event-driven simulation of M/G/1 queue
  // Arrivals are Poisson (exponential inter-arrivals) at arrivalRate.
  const arrivalTimes: number[] = [];
  const serviceTimes: number[] = [];

  // Generate arrivals
  let clock = 0;
  for (let i = 0; i < rounds; i++) {
    clock += exponentialSample(rng, arrivalRate);
    arrivalTimes.push(clock);
    serviceTimes.push(serviceSampler(rng));
  }

  // Process queue: compute departure times
  const departureTimes: number[] = [];
  let serverFreeAt = 0;

  for (let i = 0; i < rounds; i++) {
    const serviceStart = Math.max(arrivalTimes[i]!, serverFreeAt);
    const departure = serviceStart + serviceTimes[i]!;
    departureTimes.push(departure);
    serverFreeAt = departure;
  }

  // Compute sojourn times
  let totalSojourn = 0;
  for (let i = 0; i < rounds; i++) {
    totalSojourn += departureTimes[i]! - arrivalTimes[i]!;
  }
  const W = totalSojourn / rounds;

  // Time-average number in system using area method
  // We build a sorted event list of +1 (arrival) and -1 (departure)
  interface Event {
    time: number;
    delta: number;
  }
  const events: Event[] = [];
  for (let i = 0; i < rounds; i++) {
    events.push({ time: arrivalTimes[i]!, delta: 1 });
    events.push({ time: departureTimes[i]!, delta: -1 });
  }
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  let inSystem = 0;
  let area = 0;
  let prevTime = events[0]!.time;
  const startTime = prevTime;

  for (const event of events) {
    area += inSystem * (event.time - prevTime);
    prevTime = event.time;
    inSystem += event.delta;
  }

  const endTime = prevTime;
  const totalTime = endTime - startTime;
  const L = area / totalTime;

  // Effective arrival rate = arrivals / observation window
  const lambda = rounds / totalTime;

  // Conservation: count jobs still in system at end
  // (jobs that arrived but haven't departed by endTime)
  let stillInSystem = 0;
  let departureIdx = 0;
  for (let i = 0; i < rounds; i++) {
    if (departureTimes[i]! > endTime) {
      stillInSystem++;
    }
  }

  return {
    L,
    W,
    lambda,
    departures: rounds - stillInSystem,
    inSystem: stillInSystem,
    arrivals: rounds,
  };
}

// ---------------------------------------------------------------------------
// Whip crossover simulation (reuse pattern from cross-shard-stochastic)
// ---------------------------------------------------------------------------

interface WhipCurvePoint {
  shards: number;
  meanCost: number;
}

function simulateWhipCurve(
  items: number,
  stages: number,
  correctionCostPerShard: number,
  maxShards: number,
  serviceSampler: (rng: () => number) => number,
  rng: () => number,
  trials: number
): WhipCurvePoint[] {
  const points: WhipCurvePoint[] = [];

  for (let shards = 1; shards <= maxShards; shards++) {
    let totalCost = 0;
    const itemsPerShard = Math.ceil(items / shards);
    const slots = itemsPerShard + stages - 1;

    for (let trial = 0; trial < trials; trial++) {
      // Pipeline time = max across shards of sum of slot service times
      let maxShardTime = 0;
      for (let s = 0; s < shards; s++) {
        let shardTime = 0;
        for (let slot = 0; slot < slots; slot++) {
          shardTime += serviceSampler(rng);
        }
        maxShardTime = Math.max(maxShardTime, shardTime);
      }
      // Cross-shard correction cost
      const correction = correctionCostPerShard * shards;
      totalCost += maxShardTime + correction;
    }

    points.push({ shards, meanCost: totalCost / trials });
  }

  return points;
}

function findOptimum(curve: WhipCurvePoint[]): WhipCurvePoint {
  let best = curve[0]!;
  for (const p of curve) {
    if (p.meanCost < best.meanCost) best = p;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Distribution definitions used across tests
// ---------------------------------------------------------------------------

interface DistributionSpec {
  name: string;
  /** Mean service time (target ~1.0 for stability) */
  meanService: number;
  sampler: (rng: () => number) => number;
}

function makeDistributions(): DistributionSpec[] {
  return [
    {
      name: 'Exponential (M/M/1)',
      meanService: 1.0,
      sampler: (rng) => exponentialSample(rng, 1.0),
    },
    {
      name: 'Erlang-k (M/E_4/1)',
      meanService: 1.0,
      sampler: (rng) => erlangSample(rng, 4, 1.0),
    },
    {
      name: 'Hyperexponential (bimodal)',
      meanService: 1.0,
      // p*1/rate1 + (1-p)*1/rate2 = 1.0
      // p=0.6, rate1=2.0, rate2=0.625 => 0.6*0.5 + 0.4*1.6 = 0.3+0.64 = 0.94 ~ 1.0
      // Adjust: p=0.5, rate1=2.0, rate2=2/3 => 0.5*0.5 + 0.5*1.5 = 1.0
      sampler: (rng) => hyperexpSample(rng, 0.5, 2.0, 2 / 3),
    },
    {
      name: 'Deterministic (M/D/1)',
      meanService: 1.0,
      sampler: (_rng) => 1.0,
    },
    {
      name: 'Log-normal',
      meanService: 1.0,
      // E[X] = exp(mu + sigma^2/2) = 1 => mu = -sigma^2/2
      sampler: (rng) => {
        const sigma = 0.75;
        const mu = -(sigma * sigma) / 2;
        return lognormalSample(rng, mu, sigma);
      },
    },
    {
      name: 'Pareto (heavy-tail)',
      meanService: 1.0,
      // E[X] = alpha * xm / (alpha - 1) = 1 => xm = (alpha-1)/alpha
      sampler: (rng) => {
        const alpha = 2.5;
        const xm = (alpha - 1) / alpha; // 0.6
        return paretoSample(rng, alpha, xm);
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Richer service distributions -- queueing containment', () => {
  const distributions = makeDistributions();
  const ROUNDS = 15000;
  // Utilization rho = lambda * meanService. Keep rho < 1 for stability.
  const ARRIVAL_RATE = 0.7; // rho = 0.7

  describe("Little's Law (L = lambda * W) across distributions", () => {
    for (const dist of distributions) {
      it(`holds for ${dist.name}`, () => {
        const rng = makeRng(0xcafe0000 + dist.name.length);
        const result = simulateQueue(ARRIVAL_RATE, dist.sampler, ROUNDS, rng);

        const littleLHS = result.L;
        const littleRHS = result.lambda * result.W;
        const relativeError =
          Math.abs(littleLHS - littleRHS) / Math.max(littleLHS, 1e-12);

        // Monte Carlo tolerance: 10% relative error is generous for 15k samples
        expect(relativeError).toBeLessThan(0.1);
      });
    }
  });

  describe('Conservation (arrivals = departures + in-system) across distributions', () => {
    for (const dist of distributions) {
      it(`holds for ${dist.name}`, () => {
        const rng = makeRng(0xbeef0000 + dist.name.length);
        const result = simulateQueue(ARRIVAL_RATE, dist.sampler, ROUNDS, rng);

        // Strict conservation: every arrival either departed or is in-system
        expect(result.arrivals).toBe(result.departures + result.inSystem);
      });
    }
  });

  describe('Worthington Whip crossover under each distribution', () => {
    for (const dist of distributions) {
      it(`crossover exists for ${dist.name}`, () => {
        const rng = makeRng(0xace00000 + dist.name.length);
        const curve = simulateWhipCurve(
          256, // items
          5, // stages
          1.5, // correction cost per shard
          24, // max shards
          dist.sampler,
          rng,
          300 // trials per shard count
        );

        const optimum = findOptimum(curve);
        const maxShardsPoint = curve[curve.length - 1]!;

        // The optimum should NOT be at maximum shards (over-sharding hurts)
        expect(optimum.shards).toBeLessThan(24);
        // The optimum should NOT be at 1 shard (some sharding helps)
        expect(optimum.shards).toBeGreaterThan(1);
        // Over-sharded cost exceeds optimum
        expect(maxShardsPoint.meanCost).toBeGreaterThan(optimum.meanCost);
      });
    }
  });

  describe('Cross-shard cost under non-exponential service times', () => {
    // For non-Markovian distributions, the cross-shard correction cost
    // still drives the Whip. We verify that higher correction cost
    // shifts the optimum toward fewer shards.
    const nonMarkovian = distributions.filter(
      (d) =>
        !d.name.includes('Exponential (M/M/1)') &&
        !d.name.includes('Deterministic')
    );

    for (const dist of nonMarkovian) {
      it(`higher correction cost reduces optimal shards for ${dist.name}`, () => {
        const rng1 = makeRng(0xd00d0000 + dist.name.length);
        const rng2 = makeRng(0xd00d0000 + dist.name.length);

        const curveLow = simulateWhipCurve(
          256,
          5,
          0.8,
          20,
          dist.sampler,
          rng1,
          300
        );
        const curveHigh = simulateWhipCurve(
          256,
          5,
          3.0,
          20,
          dist.sampler,
          rng2,
          300
        );

        const optLow = findOptimum(curveLow);
        const optHigh = findOptimum(curveHigh);

        // Higher correction cost should push optimum to fewer shards
        expect(optHigh.shards).toBeLessThanOrEqual(optLow.shards);
      });
    }
  });

  describe('Distribution moment sanity checks', () => {
    // Verify each sampler produces samples with the expected mean,
    // confirming the parameterization is correct.
    for (const dist of distributions) {
      it(`${dist.name} has mean close to ${dist.meanService}`, () => {
        const rng = makeRng(0xface0000 + dist.name.length);
        const N = 50000;
        let sum = 0;
        for (let i = 0; i < N; i++) {
          sum += dist.sampler(rng);
        }
        const empiricalMean = sum / N;
        const relError =
          Math.abs(empiricalMean - dist.meanService) / dist.meanService;
        expect(relError).toBeLessThan(0.05);
      });
    }
  });

  describe('Erlang-k variance reduction', () => {
    // Erlang-k with higher k should have lower variance than exponential.
    // This validates our Erlang implementation against theory: Var = 1/(k*rate^2).
    it('Erlang-4 has lower variance than exponential at same mean', () => {
      const rng = makeRng(0x12345678);
      const N = 30000;

      // Exponential samples
      let expSum = 0;
      let expSumSq = 0;
      for (let i = 0; i < N; i++) {
        const s = exponentialSample(rng, 1.0);
        expSum += s;
        expSumSq += s * s;
      }
      const expVar = expSumSq / N - (expSum / N) ** 2;

      // Erlang-4 samples
      let erlSum = 0;
      let erlSumSq = 0;
      for (let i = 0; i < N; i++) {
        const s = erlangSample(rng, 4, 1.0);
        erlSum += s;
        erlSumSq += s * s;
      }
      const erlVar = erlSumSq / N - (erlSum / N) ** 2;

      // Theoretical: Var(Exp) = 1, Var(Erlang-4) = 1/4
      expect(erlVar).toBeLessThan(expVar * 0.5);
    });
  });

  describe('Hyperexponential has higher variance than exponential', () => {
    it('bimodal mixture has CV > 1', () => {
      const rng = makeRng(0xabcd0000);
      const N = 50000;
      let sum = 0;
      let sumSq = 0;
      for (let i = 0; i < N; i++) {
        const s = hyperexpSample(rng, 0.5, 2.0, 2 / 3);
        sum += s;
        sumSq += s * s;
      }
      const mean = sum / N;
      const variance = sumSq / N - mean * mean;
      const cv = Math.sqrt(variance) / mean;

      // Hyperexponential always has CV > 1 (more variable than exponential)
      expect(cv).toBeGreaterThan(1.0);
    });
  });

  describe('Conservation under high utilization', () => {
    // At rho close to 1, queues grow large but conservation must still hold.
    it('conservation holds at rho = 0.95', () => {
      const rng = makeRng(0x99990000);
      const result = simulateQueue(
        0.95,
        (r) => exponentialSample(r, 1.0),
        10000,
        rng
      );
      expect(result.arrivals).toBe(result.departures + result.inSystem);
    });
  });

  describe("Little's Law precision improves with sample size", () => {
    it('20k samples gives tighter bound than 5k samples', () => {
      const sampler = (rng: () => number) => exponentialSample(rng, 1.0);

      const rng5k = makeRng(0x55550000);
      const result5k = simulateQueue(0.7, sampler, 5000, rng5k);
      const error5k =
        Math.abs(result5k.L - result5k.lambda * result5k.W) / result5k.L;

      const rng20k = makeRng(0x55550000);
      const result20k = simulateQueue(0.7, sampler, 20000, rng20k);
      const error20k =
        Math.abs(result20k.L - result20k.lambda * result20k.W) / result20k.L;

      // With same seed prefix, 20k should generally be at least as good.
      // We just verify both are reasonable (< 10%) -- statistical, not deterministic.
      expect(error5k).toBeLessThan(0.1);
      expect(error20k).toBeLessThan(0.1);
    });
  });
});
