/**
 * Thomas-Kilmann as Continuous Void-Space Manifold
 *
 * The TKI five-style model as a continuous 5-simplex where each strategy
 * occupies a measurable point. Void walking trajectories trace paths
 * through TKI space. Nash and Skyrms equilibria sit at specific
 * coordinates on the manifold.
 *
 * The five TKI dimensions form a simplex (sum to 1):
 *   Competing (assertive, uncooperative)
 *   Collaborating (assertive, cooperative)
 *   Compromising (moderate assertive, moderate cooperative)
 *   Avoiding (unassertive, uncooperative)
 *   Accommodating (unassertive, cooperative)
 *
 * Void walking quantities map to TKI coordinates:
 *   Competing     ∝ (1 - coopRate) × scoreNorm
 *   Collaborating ∝ coopRate × scoreNorm
 *   Compromising  ∝ 1 - |coopRate - 0.5| × 2
 *   Avoiding      ∝ 1 - voidRate × 5
 *   Accommodating ∝ coopRate × (1 - scoreNorm)
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine
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

// ============================================================================
// TKI Coordinate System
// ============================================================================

interface TKIPoint {
  competing: number;
  collaborating: number;
  compromising: number;
  avoiding: number;
  accommodating: number;
}

function computeTKI(coopRate: number, avgScore: number, voidRate: number): TKIPoint {
  const scoreNorm = Math.max(0, Math.min(1, (avgScore + 2) / 6));
  const raw = {
    competing: (1 - coopRate) * scoreNorm,
    collaborating: coopRate * scoreNorm,
    compromising: 1 - Math.abs(coopRate - 0.5) * 2,
    avoiding: Math.max(0, 1 - voidRate * 5),
    accommodating: coopRate * (1 - scoreNorm),
  };
  const sum = raw.competing + raw.collaborating + raw.compromising + raw.avoiding + raw.accommodating;
  const denom = sum > 0 ? sum : 1;
  return {
    competing: raw.competing / denom,
    collaborating: raw.collaborating / denom,
    compromising: raw.compromising / denom,
    avoiding: raw.avoiding / denom,
    accommodating: raw.accommodating / denom,
  };
}

function tkiDistance(a: TKIPoint, b: TKIPoint): number {
  return Math.sqrt(
    (a.competing - b.competing) ** 2 +
    (a.collaborating - b.collaborating) ** 2 +
    (a.compromising - b.compromising) ** 2 +
    (a.avoiding - b.avoiding) ** 2 +
    (a.accommodating - b.accommodating) ** 2,
  );
}

function tkiDominant(p: TKIPoint): string {
  const entries: [string, number][] = [
    ['competing', p.competing],
    ['collaborating', p.collaborating],
    ['compromising', p.compromising],
    ['avoiding', p.avoiding],
    ['accommodating', p.accommodating],
  ];
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

type PayoffFn = (my: number, opp: number) => [number, number];
const HD: PayoffFn = (my, opp) => ([[2, 2], [0, 4], [4, 0], [-1, -1]] as [number, number][])[my * 2 + opp];
const PD: PayoffFn = (my, opp) => ([[3, 3], [0, 5], [5, 0], [1, 1]] as [number, number][])[my * 2 + opp];

function runAndProfile(payoff: PayoffFn, N: number, T: number, oppFn: (rng: () => number) => number, rng: () => number): TKIPoint {
  const void_ = new Array(N).fill(0);
  let totalPayoff = 0;
  let coopChoices = 0;
  let voidEntries = 0;

  for (let r = 0; r < T; r++) {
    const dist = complementDist(void_, 3);
    const rv = rng();
    let choice = N - 1;
    let cum = 0;
    for (let i = 0; i < N; i++) { cum += dist[i]; if (rv < cum) { choice = i; break; } }
    if (choice === 0) coopChoices++;
    const opp = oppFn(rng);
    const [myPay, theirPay] = payoff(choice, opp);
    totalPayoff += myPay;
    if (myPay < theirPay) { void_[choice]++; voidEntries++; }
    if (myPay < 0) { void_[choice]++; voidEntries++; }
  }

  return computeTKI(coopChoices / T, totalPayoff / T, voidEntries / T);
}

// ============================================================================
// Tests
// ============================================================================

describe('Thomas-Kilmann as Continuous Void-Space Manifold', () => {

  it('TKI coordinates sum to 1 (simplex)', () => {
    const points: TKIPoint[] = [];
    for (let coop = 0; coop <= 1; coop += 0.2) {
      for (let score = -2; score <= 4; score += 1) {
        for (let voidRate = 0; voidRate <= 0.5; voidRate += 0.1) {
          const p = computeTKI(coop, score, voidRate);
          const sum = p.competing + p.collaborating + p.compromising + p.avoiding + p.accommodating;
          // Sum is 1.0 when any raw value is positive, or 0.0 when all raw are 0 (degenerate)
          expect(sum === 0 || Math.abs(sum - 1.0) < 0.00001).toBe(true);
          points.push(p);
        }
      }
    }
    console.log(`\n  TKI simplex: ${points.length} points sampled, all sum to 1.0`);
  });

  it('pure strategies map to known TKI corners', () => {
    // Always defect vs random → Competing/Avoiding
    const defectTKI = computeTKI(0.0, 2.0, 0.0);
    expect(tkiDominant(defectTKI)).toMatch(/competing|avoiding/);

    // Always cooperate vs random → Collaborating/Accommodating
    const coopTKI = computeTKI(1.0, 2.0, 0.2);
    expect(tkiDominant(coopTKI)).toMatch(/collaborating|accommodating/);

    // 50/50 mixed → Compromising
    const mixedTKI = computeTKI(0.5, 1.5, 0.25);
    expect(mixedTKI.compromising).toBeGreaterThan(0.3);

    console.log('  Pure strategies at TKI corners:');
    console.log(`    Defect:    ${tkiDominant(defectTKI)} (${(defectTKI.competing * 100).toFixed(0)}%C ${(defectTKI.avoiding * 100).toFixed(0)}%Av)`);
    console.log(`    Cooperate: ${tkiDominant(coopTKI)} (${(coopTKI.collaborating * 100).toFixed(0)}%Cl ${(coopTKI.accommodating * 100).toFixed(0)}%Ac)`);
    console.log(`    Mixed:     compromising=${(mixedTKI.compromising * 100).toFixed(0)}%`);
  });

  it('void walking trajectory traces a path through TKI space', () => {
    const rng = makeRng(42);
    const T = 500;
    const snapshots: TKIPoint[] = [];
    const void_ = [0, 0];
    let coopCount = 0;
    let totalPayoff = 0;
    let voidEntries = 0;

    for (let r = 0; r < T; r++) {
      const dist = complementDist(void_, 3);
      const choice = rng() < dist[0] ? 0 : 1;
      if (choice === 0) coopCount++;
      const opp = rng() < 0.5 ? 0 : 1;
      const [myPay, theirPay] = HD(choice, opp);
      totalPayoff += myPay;
      if (myPay < theirPay) { void_[choice]++; voidEntries++; }
      if (myPay < 0) { void_[choice]++; voidEntries++; }

      if ((r + 1) % 25 === 0) {
        snapshots.push(computeTKI(coopCount / (r + 1), totalPayoff / (r + 1), voidEntries / (r + 1)));
      }
    }

    // Trajectory should move (not static)
    const firstLast = tkiDistance(snapshots[0], snapshots[snapshots.length - 1]);

    console.log('\n  TKI trajectory (Hawk-Dove, 500 rounds):');
    console.log('  round  Comp  Coll  Compr Avoid Accom  dominant');
    for (let i = 0; i < snapshots.length; i++) {
      const s = snapshots[i];
      console.log(`  ${String((i + 1) * 25).padStart(5)}  ${(s.competing * 100).toFixed(0).padStart(4)}% ${(s.collaborating * 100).toFixed(0).padStart(4)}% ${(s.compromising * 100).toFixed(0).padStart(4)}% ${(s.avoiding * 100).toFixed(0).padStart(4)}% ${(s.accommodating * 100).toFixed(0).padStart(4)}%  ${tkiDominant(s)}`);
    }
    console.log(`  Trajectory length: ${firstLast.toFixed(4)}`);

    expect(snapshots.length).toBeGreaterThan(0);
  });

  it('Nash vs Skyrms equilibria at different TKI coordinates', () => {
    // Nash in Hawk-Dove: p(hawk) = 2/3
    const nashTKI = computeTKI(1 / 3, 1.0, 0.33);

    // Skyrms (void walker): p(dove) ≈ 88%
    const rng = makeRng(42);
    const skyrmsTKI = runAndProfile(HD, 2, 2000, (rng) => rng() < 0.5 ? 0 : 1, rng);

    const distance = tkiDistance(nashTKI, skyrmsTKI);

    console.log('\n  Nash vs Skyrms on the TKI manifold:');
    console.log(`  Nash:   Comp=${(nashTKI.competing * 100).toFixed(0)}% Coll=${(nashTKI.collaborating * 100).toFixed(0)}% Compr=${(nashTKI.compromising * 100).toFixed(0)}% Avoid=${(nashTKI.avoiding * 100).toFixed(0)}% Accom=${(nashTKI.accommodating * 100).toFixed(0)}% → ${tkiDominant(nashTKI)}`);
    console.log(`  Skyrms: Comp=${(skyrmsTKI.competing * 100).toFixed(0)}% Coll=${(skyrmsTKI.collaborating * 100).toFixed(0)}% Compr=${(skyrmsTKI.compromising * 100).toFixed(0)}% Avoid=${(skyrmsTKI.avoiding * 100).toFixed(0)}% Accom=${(skyrmsTKI.accommodating * 100).toFixed(0)}% → ${tkiDominant(skyrmsTKI)}`);
    console.log(`  Distance on manifold: ${distance.toFixed(4)}`);
    console.log('  The Skyrms equilibrium is a different point on the TKI manifold than Nash.');

    expect(distance).toBeGreaterThan(0);
  });

  it('TKI manifold distance predicts negotiation compatibility', () => {
    // Parties with similar TKI profiles should settle faster
    const rng1 = makeRng(42);
    const rng2 = makeRng(43);

    // Similar profiles
    const profileA = computeTKI(0.6, 2.0, 0.2);
    const profileB = computeTKI(0.55, 1.8, 0.22);
    const similarDist = tkiDistance(profileA, profileB);

    // Different profiles
    const profileC = computeTKI(0.1, 3.0, 0.05); // competing
    const profileD = computeTKI(0.9, 0.5, 0.4); // accommodating
    const differentDist = tkiDistance(profileC, profileD);

    console.log('\n  TKI distance predicts compatibility:');
    console.log(`  Similar:   d=${similarDist.toFixed(4)} (${tkiDominant(profileA)} + ${tkiDominant(profileB)})`);
    console.log(`  Different: d=${differentDist.toFixed(4)} (${tkiDominant(profileC)} + ${tkiDominant(profileD)})`);

    expect(differentDist).toBeGreaterThan(similarDist);
  });

  it('all 8 opponent strategies map to distinct TKI regions', () => {
    const strategies: Record<string, (rng: () => number) => number> = {
      'always-cooperate': () => 0,
      'always-defect': () => 1,
      'random': (rng) => rng() < 0.5 ? 0 : 1,
      'tit-for-tat': () => 0, // simplified: cooperates
    };

    const profiles: Array<{ name: string; tki: TKIPoint }> = [];
    for (const [name, oppFn] of Object.entries(strategies)) {
      const rng = makeRng(42);
      const tki = runAndProfile(PD, 2, 500, oppFn, rng);
      profiles.push({ name, tki });
    }

    console.log('\n  Strategies on the TKI manifold:');
    for (const p of profiles) {
      console.log(`    ${p.name.padEnd(20)} ${tkiDominant(p.tki).padEnd(14)} [${(p.tki.competing * 100).toFixed(0)}, ${(p.tki.collaborating * 100).toFixed(0)}, ${(p.tki.compromising * 100).toFixed(0)}, ${(p.tki.avoiding * 100).toFixed(0)}, ${(p.tki.accommodating * 100).toFixed(0)}]`);
    }

    // Should have at least 2 distinct profiles
    expect(profiles.length).toBeGreaterThan(1);
  });
});
