/**
 * Trot All Gradients -- Apply Gait Walker to Every Boundary Walk
 *
 * The trot-canter-gallop gait walker is generic over any choice space
 * and payoff function. Here we apply it to every domain from the
 * formal surface: protein folding, queue stability, semiotic peace,
 * attention mechanisms, compression codec racing, and inference.
 *
 * Each domain models its characteristic fold as a payoff function,
 * then runs the adaptive gait walker. The prediction: adaptive gait
 * should outperform or match fixed gait in EVERY domain.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine (minimal -- reuse from trot-canter-gallop)
// ============================================================================

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function complementDist(counts: number[], eta: number = 3.0): number[] {
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const range = max - min;
  const norm = range > 0 ? counts.map((v) => (v - min) / range) : counts.map(() => 0);
  const w = norm.map((v) => Math.exp(-eta * v));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
}

function excessKurtosis(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mu = values.reduce((a, b) => a + b, 0) / n;
  const s2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (s2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / n;
  return m4 / s2 ** 2 - 3;
}

type Gait = 'stand' | 'trot' | 'canter' | 'gallop';

function selectGait(k: number, prev: Gait, rounds: number): Gait {
  if (rounds === 0) return 'stand';
  if (prev === 'stand') return 'trot';
  if (k >= 0.5 && prev === 'trot' && rounds > 10) return 'canter';
  if (k >= 2.0 && prev === 'canter' && rounds > 50) return 'gallop';
  if (k < 0.0 && prev === 'gallop') return 'canter';
  if (k < -1.5 && prev === 'canter') return 'trot';
  return prev;
}

const GAIT_DEPTH: Record<Gait, number> = { stand: 1, trot: 1, canter: 4, gallop: 16 };

type PayoffFn = (choice: number, env: number) => number;

interface DomainResult {
  domain: string;
  adaptivePayoff: number;
  fixedTrotPayoff: number;
  rounds: number;
  gaitMix: Record<Gait, number>;
  improvement: number;
}

function runDomain(
  domain: string,
  N: number,
  T: number,
  payoff: PayoffFn,
  envFn: (rng: () => number) => number,
  seed: number,
): DomainResult {
  // Adaptive gait
  const rng1 = makeRng(seed);
  const void1 = new Array(N).fill(0);
  let gait: Gait = 'stand';
  let eta = 2.0;
  let exploration = 0.3;
  let adaptivePayoff = 0;
  let totalRounds = 0;
  const gaitMix: Record<Gait, number> = { stand: 0, trot: 0, canter: 0, gallop: 0 };

  let round = 0;
  while (round < T) {
    const dist = complementDist(void1, eta);
    const k = excessKurtosis(dist);
    const newGait = selectGait(k, gait, totalRounds);
    gait = newGait;

    switch (gait) {
      case 'stand': break;
      case 'trot': exploration = Math.min(0.4, exploration + 0.01); eta = Math.max(1, eta - 0.05); break;
      case 'canter': exploration = Math.max(0.05, exploration - 0.005); eta = Math.min(5, eta + 0.05); break;
      case 'gallop': exploration = Math.max(0.01, exploration - 0.01); eta = Math.min(8, eta + 0.1); break;
    }

    const depth = Math.min(GAIT_DEPTH[gait], T - round);
    for (let d = 0; d < depth; d++) {
      const env = envFn(rng1);
      let choice: number;
      if (rng1() < exploration) {
        choice = Math.floor(rng1() * N);
      } else {
        const dist2 = complementDist(void1, eta);
        const rv = rng1();
        let cum = 0;
        choice = N - 1;
        for (let i = 0; i < N; i++) { cum += dist2[i]; if (rv < cum) { choice = i; break; } }
      }
      const pay = payoff(choice, env);
      adaptivePayoff += pay;
      if (pay < 0) void1[choice]++;
      totalRounds++;
      gaitMix[gait]++;
    }
    round += depth;
  }

  // Fixed trot
  const rng2 = makeRng(seed);
  const void2 = new Array(N).fill(0);
  let fixedPayoff = 0;
  for (let r = 0; r < T; r++) {
    const env = envFn(rng2);
    const dist = complementDist(void2, 2);
    const rv = rng2();
    let choice = N - 1;
    let cum = 0;
    for (let i = 0; i < N; i++) { cum += dist[i]; if (rv < cum) { choice = i; break; } }
    const pay = payoff(choice, env);
    fixedPayoff += pay;
    if (pay < 0) void2[choice]++;
  }

  const improvement = fixedPayoff !== 0 ? (adaptivePayoff - fixedPayoff) / Math.abs(fixedPayoff) * 100 : 0;

  return { domain, adaptivePayoff, fixedTrotPayoff: fixedPayoff, rounds: totalRounds, gaitMix, improvement };
}

// ============================================================================
// Domain Payoff Functions
// ============================================================================

describe('Trot All Gradients: Gait Walker Across Every Domain', () => {

  const domains: Array<{ name: string; N: number; payoff: PayoffFn; envFn: (rng: () => number) => number }> = [
    {
      name: 'Protein folding',
      N: 4, // native, misfolded-A, misfolded-B, unfolded
      payoff: (c, env) => c === 0 ? 5 : c === env ? 1 : -2, // native = best
      envFn: (rng) => Math.floor(rng() * 4),
    },
    {
      name: 'Queue stability',
      N: 3, // underload, balanced, overload
      payoff: (c, env) => c === 1 ? 3 : Math.abs(c - env) <= 1 ? 1 : -1, // balanced = best
      envFn: (rng) => Math.floor(rng() * 3),
    },
    {
      name: 'Semiotic fold',
      N: 5, // denotation, connotation, implicature, affect, context
      payoff: (c, env) => c === env ? 4 : -1, // match = communication success
      envFn: (rng) => Math.floor(rng() * 5),
    },
    {
      name: 'Attention (softmax)',
      N: 4, // tokens
      payoff: (c, env) => c === env ? 3 : -1, // attend to correct token
      envFn: (rng) => Math.floor(rng() * 4),
    },
    {
      name: 'Codec racing',
      N: 3, // gzip, brotli, zstd
      payoff: (c, env) => {
        // Each codec wins for different content types
        if (c === env) return 5; // best codec for this content
        if (Math.abs(c - env) === 1) return 2; // close second
        return -1; // wrong codec = waste
      },
      envFn: (rng) => Math.floor(rng() * 3),
    },
    {
      name: 'Inference routing',
      N: 4, // model choices
      payoff: (c, env) => {
        if (c === env) return 4; // right model for the query
        return c < env ? 1 : -2; // smaller model = cheap but weak, bigger = expensive fail
      },
      envFn: (rng) => Math.floor(rng() * 4),
    },
    {
      name: 'Negotiation',
      N: 5, // offer bins
      payoff: (c, env) => {
        if (c === env) return 5; // agreement
        if (Math.abs(c - env) === 1) return 2; // close
        return -1; // rejection
      },
      envFn: (rng) => Math.floor(rng() * 5),
    },
    {
      name: 'Trauma healing',
      N: 5, // trust, withdraw, fight, freeze, connect
      payoff: (c, env) => {
        if (c === 0 && env === 4) return 5; // trust + connect
        if (c === 3) return -3; // freeze always costly
        if (c === env) return 2;
        return -1;
      },
      envFn: (rng) => Math.floor(rng() * 5),
    },
  ];

  it('adaptive gait vs fixed trot across all domains', () => {
    const T = 1000;
    const results: DomainResult[] = [];

    for (const d of domains) {
      const r = runDomain(d.name, d.N, T, d.payoff, d.envFn, 42);
      results.push(r);
    }

    console.log('\n  ╔══════════════════════════════════════════════════════════════════╗');
    console.log('  ║     TROT ALL GRADIENTS: Adaptive Gait Across Every Domain       ║');
    console.log('  ╠══════════════════════════════════════════════════════════════════╣');
    console.log(`  ║  ${'Domain'.padEnd(20)} ${'Adaptive'.padStart(9)} ${'Trot'.padStart(9)} ${'Δ%'.padStart(7)} ${'S'.padStart(3)} ${'T'.padStart(4)} ${'C'.padStart(5)} ${'G'.padStart(5)} ║`);
    console.log(`  ╠${'─'.repeat(66)}╣`);
    for (const r of results) {
      console.log(
        `  ║  ${r.domain.padEnd(20)} ${String(r.adaptivePayoff).padStart(9)} ${String(r.fixedTrotPayoff).padStart(9)} ${r.improvement.toFixed(1).padStart(6)}% ${String(r.gaitMix.stand).padStart(3)} ${String(r.gaitMix.trot).padStart(4)} ${String(r.gaitMix.canter).padStart(5)} ${String(r.gaitMix.gallop).padStart(5)} ║`,
      );
    }
    console.log('  ╚══════════════════════════════════════════════════════════════════╝\n');

    // All domains should complete
    for (const r of results) {
      expect(r.rounds).toBeGreaterThanOrEqual(T * 0.9);
    }
  });

  for (const d of domains) {
    it(`${d.name}: adaptive gait completes and has finite payoff`, () => {
      const r = runDomain(d.name, d.N, 500, d.payoff, d.envFn, 42);
      expect(isFinite(r.adaptivePayoff)).toBe(true);
      expect(r.rounds).toBeGreaterThan(0);
    });
  }
});
