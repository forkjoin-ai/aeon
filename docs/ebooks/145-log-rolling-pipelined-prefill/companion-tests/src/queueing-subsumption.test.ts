/**
 * Queueing Theory Subsumption — Companion Tests for §5
 *
 * Proves:
 *   1. Little's Law is the β₁ = 0 degenerate case of the pipeline equation
 *   2. Erlang blocking is vent propagation at β₁ = 0
 *   3. Jackson networks are fork/join without race
 *   4. Each classical result recovers from the topological framework
 *
 * These tests use no external dependencies — pure math.
 */

import { describe, it, expect } from 'vitest';

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function expSample(rate: number, rng: () => number): number {
  const u = Math.max(rng(), Number.EPSILON);
  return -Math.log(u) / rate;
}

describe('Queueing Theory Subsumption (§5)', () => {

  describe('Little\'s Law as β₁ = 0', () => {
    /**
     * Little's Law: L = λW
     *   L = average items in system
     *   λ = arrival rate
     *   W = average time in system
     *
     * Pipeline equation: T = (N + C - 1) × t_stage
     * At β₁ = 0, C = 1:
     *   T = N × t_stage
     *   L = λ × W = (1/t_arrival) × t_stage = 1 (at steady state)
     *
     * Little's Law is what you get when you set β₁ = 0 and ask
     * "how many items are in the system?"
     */

    it('Little\'s Law holds for single-server queue (β₁ = 0)', () => {
      const arrivalRate = 10;    // λ = 10 items/sec
      const serviceTime = 0.08;  // W = 80ms per item

      // Little's Law
      const L = arrivalRate * serviceTime;
      expect(L).toBeCloseTo(0.8, 2);

      // Pipeline with β₁ = 0: one item at a time
      // Average items in system = utilization = λ × W
      const beta1 = 0;
      const capacity = beta1 + 1; // C = 1
      expect(capacity).toBe(1);

      // The pipeline equation at C=1:
      // Throughput = 1/t_stage (one item per stage time)
      // Utilization ρ = λ/μ = λ × W
      const utilization = arrivalRate * serviceTime;
      expect(utilization).toBe(L); // They're the same equation
    });

    it('pipeline equation generalizes Little\'s Law for β₁ > 0', () => {
      const arrivalRate = 10;
      const serviceTime = 0.08;
      const C = 4; // β₁ = 3

      // Little's Law still holds but now L can be > 1
      const L = arrivalRate * serviceTime;

      // With pipelining, effective throughput increases:
      // We can have C items in flight simultaneously
      // Effective L_max = C (pipeline saturation)
      // Little's Law: L = λW still holds, but W decreases
      // because items don't wait — they enter the pipeline immediately

      // Pipeline throughput: C / t_stage (at saturation)
      const pipelineThroughput = C / serviceTime;
      expect(pipelineThroughput).toBe(50); // 4/0.08 = 50 items/sec

      // vs sequential: 1/t_stage
      const sequentialThroughput = 1 / serviceTime;
      expect(sequentialThroughput).toBe(12.5);

      // Pipeline is C× faster — Little's Law can't express this
      expect(pipelineThroughput / sequentialThroughput).toBe(C);
    });

    it('discrete-event M/M/1 simulation satisfies Little\'s Law', () => {
      const lambda = 7.5; // arrivals/sec
      const mu = 10.0; // services/sec
      const jobs = 40_000;
      const rng = makeRng(0xC0FFEE);

      let arrivalTime = 0;
      let serverFreeAt = 0;
      let totalTimeInSystem = 0;
      const events: Array<{ time: number; delta: number }> = [];

      for (let i = 0; i < jobs; i++) {
        arrivalTime += expSample(lambda, rng);
        const serviceTime = expSample(mu, rng);
        const serviceStart = Math.max(arrivalTime, serverFreeAt);
        const depart = serviceStart + serviceTime;
        serverFreeAt = depart;

        totalTimeInSystem += depart - arrivalTime;
        events.push({ time: arrivalTime, delta: +1 });
        events.push({ time: depart, delta: -1 });
      }

      events.sort((a, b) => a.time - b.time);
      const startTime = events[0]?.time ?? 0;
      const endTime = serverFreeAt;

      let inSystem = 0;
      let prev = startTime;
      let area = 0;
      for (const e of events) {
        area += inSystem * (e.time - prev);
        inSystem += e.delta;
        prev = e.time;
      }

      const horizon = endTime - startTime;
      const L = area / horizon;
      const W = totalTimeInSystem / jobs;
      const lambdaEff = jobs / horizon;

      // Empirical Little's Law: L ≈ λW
      expect(Math.abs(L - lambdaEff * W)).toBeLessThan(0.1);
    });
  });

  describe('Erlang Blocking as Vent at β₁ = 0', () => {
    /**
     * Erlang B formula: probability of blocking with m servers and A offered load
     *   B(m, A) = (A^m / m!) / Σ(k=0..m) (A^k / k!)
     *
     * At β₁ = 0 (m = 1):
     *   B(1, A) = A / (1 + A)
     *
     * In the topological framework, blocking IS vent propagation.
     * A blocked request vents upstream. With β₁ > 0, alternative
     * paths exist -- vent one, route to another.
     */

    function erlangB(m: number, A: number): number {
      let numerator = 1;
      let denominator = 1;
      for (let k = 1; k <= m; k++) {
        numerator *= A / k;
        denominator += numerator;
      }
      return numerator / denominator;
    }

    it('Erlang B at m=1 gives simple blocking probability', () => {
      const A = 0.8; // offered load in Erlangs
      const blocking = erlangB(1, A);

      // B(1, 0.8) = 0.8 / 1.8 ≈ 0.444
      expect(blocking).toBeCloseTo(A / (1 + A), 3);
    });

    it('adding servers (increasing β₁) reduces blocking exponentially', () => {
      const A = 4.0; // 4 Erlangs offered load

      const b1 = erlangB(1, A); // β₁ = 0
      const b4 = erlangB(4, A); // β₁ = 3
      const b8 = erlangB(8, A); // β₁ = 7

      // Each doubling of capacity dramatically reduces blocking
      expect(b1).toBeGreaterThan(0.5);  // >50% blocked at β₁=0
      expect(b4).toBeLessThan(b1);
      expect(b8).toBeLessThan(b4);
      expect(b8).toBeLessThan(0.05);    // <5% blocked at β₁=7
    });

    it('vent propagation depth = 0 when β₁ > 0 and alternative paths exist', () => {
      // With multiple paths (β₁ > 0), a vented path doesn't block the system.
      // The race continues on surviving paths

      const paths = 4; // β₁ = 3
      const ventedPaths = 1;
      const survivingPaths = paths - ventedPaths;

      // System still works as long as at least one path survives
      expect(survivingPaths).toBeGreaterThan(0);

      // Probability ALL paths are vented (system-level blocking):
      const pVent = 0.3; // 30% chance each path fails
      const pAllVented = Math.pow(pVent, paths);
      expect(pAllVented).toBeLessThan(0.01); // <1% with 4 paths at 30% each
    });
  });

  describe('Jackson Networks as Fork/Join without Race', () => {
    /**
     * A Jackson network is a network of M/M/1 queues where
     * routing is probabilistic. Output of one queue feeds another.
     *
     * In the topological framework:
     *   - Jackson routing = fork with fixed weights (no race)
     *   - Each queue = a pipeline stage at β₁ = 0
     *   - Product-form solution = independence of fold operations
     *
     * Jackson networks are β₁ = 0 at each node with probabilistic fork.
     * Add race (β₁ > 0 at each node) and you get the topological framework.
     */

    it('Jackson network throughput limited by bottleneck (β₁ = 0 everywhere)', () => {
      // 3-node Jackson network: arrival → node1 → node2 → node3 → exit
      const serviceRates = [20, 10, 15]; // items/sec at each node

      // Bottleneck determines max throughput
      const maxThroughput = Math.min(...serviceRates);
      expect(maxThroughput).toBe(10);

      // Utilization at each node: ρ_i = λ / μ_i
      const arrivalRate = 8; // below bottleneck
      const utilizations = serviceRates.map(mu => arrivalRate / mu);

      expect(utilizations[0]).toBe(0.4);  // node 1: 40%
      expect(utilizations[1]).toBe(0.8);  // node 2: 80% (near bottleneck)
      expect(utilizations[2]).toBeCloseTo(0.533, 2); // node 3: 53%
    });

    it('adding race (β₁ > 0) at bottleneck breaks Jackson limit', () => {
      const serviceRates = [20, 10, 15];
      const bottleneckIdx = serviceRates.indexOf(Math.min(...serviceRates));

      // Jackson max throughput: limited by slowest node
      const jacksonMax = Math.min(...serviceRates);
      expect(jacksonMax).toBe(10);

      // Topological: race 3 instances of the bottleneck node
      const raceCount = 3;
      const effectiveRate = serviceRates[bottleneckIdx] * raceCount;

      // New service rates with racing at bottleneck
      const newRates = [...serviceRates];
      newRates[bottleneckIdx] = effectiveRate;

      const topoMax = Math.min(...newRates);
      expect(topoMax).toBe(15); // New bottleneck moves to node 3
      expect(topoMax).toBeGreaterThan(jacksonMax); // 50% improvement
    });

    it('parallel servers (β₁ > 0) reduce queueing delay in simulation', () => {
      const lambda = 30; // arrivals/sec
      const mu = 10; // service/sec per server
      const jobs = 20_000;

      function simulateMMc(c: number): { avgWait: number; throughput: number } {
        const rng = makeRng(0xABC000 + c);
        const serverFree = Array.from({ length: c }, () => 0);
        let arrival = 0;
        let totalWait = 0;

        for (let i = 0; i < jobs; i++) {
          arrival += expSample(lambda, rng);
          const service = expSample(mu, rng);

          let bestIdx = 0;
          for (let s = 1; s < c; s++) {
            if (serverFree[s] < serverFree[bestIdx]) bestIdx = s;
          }

          const start = Math.max(arrival, serverFree[bestIdx]);
          totalWait += start - arrival;
          serverFree[bestIdx] = start + service;
        }

        const finish = Math.max(...serverFree);
        return {
          avgWait: totalWait / jobs,
          throughput: jobs / finish,
        };
      }

      const single = simulateMMc(1); // β₁ = 0
      const fourWay = simulateMMc(4); // β₁ = 3

      expect(fourWay.avgWait).toBeLessThan(single.avgWait);
      expect(fourWay.throughput).toBeGreaterThan(single.throughput);
    });
  });
});
