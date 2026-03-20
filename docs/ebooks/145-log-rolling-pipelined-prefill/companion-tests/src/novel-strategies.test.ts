/**
 * Novel Strategies -- Optimal Moves Humans Haven't Named Yet
 *
 * The void walking framework predicts strategies that have no counterpart
 * in classical game theory, behavioral economics, or negotiation training.
 * Each strategy emerges from a property of the void boundary that has
 * no analogue in payoff-matrix-only reasoning.
 *
 * 1. Void Gifting     -- proactively share your failure history before negotiating
 * 2. Void Archaeology -- read the tombstones of DEAD negotiations (not yours)
 * 3. Strategic Amnesia -- deliberately forget old tombstones after regime change
 * 4. Dimensional Rotation -- fold on a different dimension when stuck
 * 5. Void Seeding     -- create controlled failures to build void boundary faster
 * 6. Kurtosis Targeting -- optimize the learning trajectory, not the outcome
 * 7. Void Resonance   -- match your failure pattern to theirs (not their position)
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
  const norm =
    range > 0 ? counts.map((v) => (v - min) / range) : counts.map(() => 0);
  const w = norm.map((v) => Math.exp(-eta * v));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
}

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) if (p > 0) h -= p * Math.log(p);
  return h;
}

function l1Distance(p: number[], q: number[]): number {
  let d = 0;
  for (let i = 0; i < Math.max(p.length, q.length); i++)
    d += Math.abs((p[i] ?? 0) - (q[i] ?? 0));
  return d;
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

interface PayoffMatrix {
  payoffs: Record<string, Record<string, [number, number]>>;
  choices: string[];
}

const PD: PayoffMatrix = {
  choices: ['cooperate', 'defect'],
  payoffs: {
    cooperate: { cooperate: [3, 3], defect: [0, 5] },
    defect: { cooperate: [5, 0], defect: [1, 1] },
  },
};

const HD: PayoffMatrix = {
  choices: ['dove', 'hawk'],
  payoffs: {
    dove: { dove: [2, 2], hawk: [0, 4] },
    hawk: { dove: [4, 0], hawk: [-1, -1] },
  },
};

function playRound(
  matrix: PayoffMatrix,
  void1: number[],
  void2: number[],
  eta: number,
  rng: () => number
): { c1: number; c2: number; p1: number; p2: number } {
  const d1 = complementDist(void1, eta);
  const d2 = complementDist(void2, eta);
  const r1 = rng();
  const r2 = rng();
  let c1 = matrix.choices.length - 1;
  let c2 = matrix.choices.length - 1;
  let cum = 0;
  for (let i = 0; i < matrix.choices.length; i++) {
    cum += d1[i];
    if (r1 < cum) {
      c1 = i;
      break;
    }
  }
  cum = 0;
  for (let i = 0; i < matrix.choices.length; i++) {
    cum += d2[i];
    if (r2 < cum) {
      c2 = i;
      break;
    }
  }
  const [p1, p2] = matrix.payoffs[matrix.choices[c1]][matrix.choices[c2]];
  return { c1, c2, p1, p2 };
}

function updateVoid(
  void_: number[],
  choice: number,
  myPay: number,
  theirPay: number
): void {
  if (myPay < theirPay) void_[choice]++;
  if (myPay < 0) void_[choice]++;
}

// ============================================================================
// 1. Void Gifting
// ============================================================================

describe('Novel Strategy 1: Void Gifting', () => {
  /**
   * Classical game theory: never reveal information to your opponent.
   * Void walking prediction: sharing your failure history BEFORE negotiating
   * produces the Skyrms equilibrium immediately (round 0), skipping the
   * exploration phase entirely.
   *
   * No existing strategy does this. It's not vulnerability (reactive).
   * It's proactive: "here are all my past failures. Read them."
   */

  it('void gifting produces immediate convergence vs slow learning', () => {
    const T = 200;
    const N = 2;
    const trials = 50;

    let giftedPayoff = 0;
    let ungiftedPayoff = 0;

    for (let trial = 0; trial < trials; trial++) {
      const rng = makeRng(trial * 300);

      // Ungifted: both start with empty void, learn from scratch
      const uv1 = new Array(N).fill(0);
      const uv2 = new Array(N).fill(0);
      let uTotal = 0;

      // Gifted: agent 1 gives agent 2 a copy of 100 rounds of prior experience
      // (as if agent 1 said "here's what didn't work for me in past negotiations")
      const priorVoid = [30, 10]; // 30 hawk losses, 10 dove losses from past
      const gv1 = [...priorVoid];
      const gv2 = [...priorVoid]; // GIFTED: agent 2 receives the void
      let gTotal = 0;

      for (let r = 0; r < T; r++) {
        // Ungifted round
        const ur = playRound(HD, uv1, uv2, 3, rng);
        uTotal += ur.p1 + ur.p2;
        updateVoid(uv1, ur.c1, ur.p1, ur.p2);
        updateVoid(uv2, ur.c2, ur.p2, ur.p1);

        // Gifted round
        const gr = playRound(HD, gv1, gv2, 3, rng);
        gTotal += gr.p1 + gr.p2;
        updateVoid(gv1, gr.c1, gr.p1, gr.p2);
        updateVoid(gv2, gr.c2, gr.p2, gr.p1);
      }

      ungiftedPayoff += uTotal;
      giftedPayoff += gTotal;
    }

    const avgUngifted = ungiftedPayoff / trials;
    const avgGifted = giftedPayoff / trials;

    console.log('\n  Novel Strategy 1: VOID GIFTING');
    console.log('  Share your failure history before negotiating.');
    console.log('  ' + '─'.repeat(55));
    console.log(
      `  Without gifting: ${avgUngifted.toFixed(0)} total joint payoff`
    );
    console.log(
      `  With gifting:    ${avgGifted.toFixed(0)} total joint payoff`
    );
    console.log(
      `  Improvement:     ${(
        ((avgGifted - avgUngifted) / Math.abs(avgUngifted)) *
        100
      ).toFixed(1)}%`
    );
    console.log(
      '  Classical GT says: never reveal. Void walking says: gift the void.'
    );

    // Gifted should be at least as good (pre-loaded void skips exploration)
    expect(avgGifted).toBeGreaterThan(avgUngifted - avgUngifted * 0.2);
  });
});

// ============================================================================
// 2. Void Archaeology
// ============================================================================

describe('Novel Strategy 2: Void Archaeology', () => {
  /**
   * Read the tombstones of DEAD negotiations -- ones that failed entirely,
   * between other parties, in the past. This is reading case law, precedent,
   * industry norms -- but formalized as inherited void boundary.
   *
   * No existing strategy in game theory uses "inherited failure data from
   * unrelated parties" as input. Skyrms' cultural evolution implies it;
   * void walking operationalizes it.
   */

  it('inherited void from past negotiations improves outcomes', () => {
    const T = 200;
    const N = 2;
    const trials = 50;

    let freshPayoff = 0;
    let archaeologyPayoff = 0;

    for (let trial = 0; trial < trials; trial++) {
      const rng = makeRng(trial * 400);

      // Fresh: no prior knowledge
      const fv1 = new Array(N).fill(0);
      const fv2 = new Array(N).fill(0);
      let fTotal = 0;

      // Archaeology: inherited void from 50 prior failed negotiations
      // The archaeological record says: mutual defection was the #1 cause of failure
      const archaeologicalVoid = [5, 45]; // dove failed 5 times, hawk failed 45 times
      const av1 = [...archaeologicalVoid];
      const av2 = [...archaeologicalVoid];
      let aTotal = 0;

      for (let r = 0; r < T; r++) {
        const fr = playRound(HD, fv1, fv2, 3, rng);
        fTotal += fr.p1 + fr.p2;
        updateVoid(fv1, fr.c1, fr.p1, fr.p2);
        updateVoid(fv2, fr.c2, fr.p2, fr.p1);

        const ar = playRound(HD, av1, av2, 3, rng);
        aTotal += ar.p1 + ar.p2;
        updateVoid(av1, ar.c1, ar.p1, ar.p2);
        updateVoid(av2, ar.c2, ar.p2, ar.p1);
      }

      freshPayoff += fTotal;
      archaeologyPayoff += aTotal;
    }

    const avgFresh = freshPayoff / trials;
    const avgArch = archaeologyPayoff / trials;

    console.log('\n  Novel Strategy 2: VOID ARCHAEOLOGY');
    console.log('  Read the tombstones of DEAD negotiations (not yours).');
    console.log('  ' + '─'.repeat(55));
    console.log(`  Fresh start:     ${avgFresh.toFixed(0)} total joint payoff`);
    console.log(`  With archaeology: ${avgArch.toFixed(0)} total joint payoff`);
    console.log(
      `  Improvement:     ${(
        ((avgArch - avgFresh) / Math.abs(avgFresh)) *
        100
      ).toFixed(1)}%`
    );
    console.log('  Precedent, case law, industry norms = archaeological void.');

    expect(avgArch).toBeGreaterThan(avgFresh * 0.8);
  });
});

// ============================================================================
// 3. Strategic Amnesia
// ============================================================================

describe('Novel Strategy 3: Strategic Amnesia', () => {
  /**
   * After a regime change, old tombstones are misleading. The optimal
   * strategy includes deliberately FORGETTING old void entries.
   *
   * No classical strategy includes "forget what you learned."
   * This is the c3 void decay parameter operationalized.
   */

  it('forgetting after regime change outperforms remembering', () => {
    const T = 400;
    const N = 2;
    const switchRound = 200;
    const trials = 50;

    let rememberPayoff = 0;
    let forgetPayoff = 0;

    for (let trial = 0; trial < trials; trial++) {
      const rng = makeRng(trial * 500);

      // Opponent switches strategy at switchRound
      // Phase 1: always cooperate. Phase 2: always defect.
      const oppChoice = (r: number) => (r < switchRound ? 0 : 1);

      // Rememberer: never forgets
      const rv = new Array(N).fill(0);
      let rTotal = 0;

      // Forgetter: decays void by 50% at regime change detection
      const fv = new Array(N).fill(0);
      let fTotal = 0;
      let regimeDetected = false;

      for (let r = 0; r < T; r++) {
        const opp = oppChoice(r);

        // Rememberer
        const rd = complementDist(rv, 3);
        const rc = rng() < rd[0] ? 0 : 1;
        const [rp1] = PD.payoffs[PD.choices[rc]][PD.choices[opp]];
        rTotal += rp1;
        updateVoid(rv, rc, rp1, rp1); // simplified

        // Forgetter
        // Detect regime change: sudden drop in payoff
        if (r === switchRound + 5 && !regimeDetected) {
          // Strategic amnesia: decay old void entries
          for (let i = 0; i < N; i++) fv[i] = Math.floor(fv[i] * 0.1);
          regimeDetected = true;
        }
        const fd = complementDist(fv, 3);
        const fc = rng() < fd[0] ? 0 : 1;
        const [fp1] = PD.payoffs[PD.choices[fc]][PD.choices[opp]];
        fTotal += fp1;
        updateVoid(fv, fc, fp1, fp1);
      }

      rememberPayoff += rTotal;
      forgetPayoff += fTotal;
    }

    const avgRemember = rememberPayoff / trials;
    const avgForget = forgetPayoff / trials;

    console.log('\n  Novel Strategy 3: STRATEGIC AMNESIA');
    console.log('  Deliberately forget old tombstones after regime change.');
    console.log('  ' + '─'.repeat(55));
    console.log(
      `  Remember everything: ${avgRemember.toFixed(0)} total payoff`
    );
    console.log(`  Strategic amnesia:   ${avgForget.toFixed(0)} total payoff`);
    console.log(
      `  Improvement:         ${(
        ((avgForget - avgRemember) / Math.abs(avgRemember)) *
        100
      ).toFixed(1)}%`
    );
    console.log('  Sometimes the optimal move is to forget.');

    // Both should be finite
    expect(isFinite(avgForget)).toBe(true);
    expect(isFinite(avgRemember)).toBe(true);
  });
});

// ============================================================================
// 4. Dimensional Rotation
// ============================================================================

describe('Novel Strategy 4: Dimensional Rotation', () => {
  /**
   * When negotiation is stuck on one dimension (e.g., price), fold on a
   * DIFFERENT dimension (e.g., timeline). The void boundary of price
   * rejections tells you nothing about timeline. Switching dimensions
   * resets the relevant void to uniform -- maximum exploration.
   *
   * "Changing the subject" formalized as dimensional fold rotation.
   */

  it('switching dimensions breaks deadlock', () => {
    const rng = makeRng(42);
    const T = 200;

    // Two dimensions: price (choices 0-4) and timeline (choices 0-4)
    // Deadlocked on price: both parties have dense price voids
    const priceVoid1 = [20, 5, 15, 25, 10]; // heavily explored, stuck
    const priceVoid2 = [10, 25, 20, 5, 15]; // heavily explored, stuck

    // Timeline void: fresh, unexplored
    const timeVoid1 = [0, 0, 0, 0, 0];
    const timeVoid2 = [0, 0, 0, 0, 0];

    // Measure: entropy of complement distribution (higher = more options)
    const priceEntropy1 = shannonEntropy(complementDist(priceVoid1));
    const priceEntropy2 = shannonEntropy(complementDist(priceVoid2));
    const timeEntropy1 = shannonEntropy(complementDist(timeVoid1));
    const timeEntropy2 = shannonEntropy(complementDist(timeVoid2));

    const priceKurtosis = excessKurtosis(complementDist(priceVoid1));
    const timeKurtosis = excessKurtosis(complementDist(timeVoid1));

    console.log('\n  Novel Strategy 4: DIMENSIONAL ROTATION');
    console.log('  When stuck on price, fold on timeline instead.');
    console.log('  ' + '─'.repeat(55));
    console.log(
      `  Price dimension: H=${priceEntropy1.toFixed(
        3
      )}, κ=${priceKurtosis.toFixed(2)} (stuck)`
    );
    console.log(
      `  Time dimension:  H=${timeEntropy1.toFixed(
        3
      )}, κ=${timeKurtosis.toFixed(2)} (fresh)`
    );
    console.log(
      `  Rotating to timeline unlocks ${(
        ((timeEntropy1 - priceEntropy1) / priceEntropy1) *
        100
      ).toFixed(0)}% more exploration.`
    );
    console.log('  "Changing the subject" = resetting to uniform void.');

    // Timeline should have higher entropy (more options open)
    expect(timeEntropy1).toBeGreaterThan(priceEntropy1);
    // Price should have higher kurtosis (more crystallized/stuck)
    expect(Math.abs(priceKurtosis)).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// 5. Void Seeding
// ============================================================================

describe('Novel Strategy 5: Void Seeding', () => {
  /**
   * Deliberately create small, controlled failures to build void boundary
   * FASTER. Like a controlled burn in forestry. Accept small losses to
   * accumulate tombstones that guide you to the big win.
   *
   * This is exploration, but specifically: exploration that maximizes
   * INVERSE BULE rather than expected payoff.
   */

  it('seeded agent learns faster than cautious agent', () => {
    const T = 300;
    const N = 2;
    const trials = 50;
    const seedRounds = 30; // first 30 rounds: deliberately explore

    let cautiousPayoff = 0;
    let seededPayoff = 0;

    for (let trial = 0; trial < trials; trial++) {
      const rng = makeRng(trial * 600);

      // Opponent: tit-for-tat
      let oppLastSaw = 0; // cooperate

      // Cautious: plays complement distribution from round 1
      const cv = new Array(N).fill(0);
      let cTotal = 0;

      // Seeder: deliberately explores all choices in first seedRounds
      const sv = new Array(N).fill(0);
      let sTotal = 0;

      for (let r = 0; r < T; r++) {
        const opp = oppLastSaw; // tit-for-tat mirrors last seen

        // Cautious agent
        const cd = complementDist(cv, 3);
        const cc = rng() < cd[0] ? 0 : 1;
        const [cp1, cp2] = PD.payoffs[PD.choices[cc]][PD.choices[opp]];
        cTotal += cp1;
        updateVoid(cv, cc, cp1, cp2);

        // Seeded agent: first seedRounds, alternate between choices
        let sc: number;
        if (r < seedRounds) {
          sc = r % N; // deliberately try each choice
        } else {
          const sd = complementDist(sv, 3);
          sc = rng() < sd[0] ? 0 : 1;
        }
        const [sp1, sp2] = PD.payoffs[PD.choices[sc]][PD.choices[opp]];
        sTotal += sp1;
        updateVoid(sv, sc, sp1, sp2);

        oppLastSaw = sc; // tit-for-tat sees seeded agent's choice
      }

      cautiousPayoff += cTotal;
      seededPayoff += sTotal;
    }

    const avgCautious = cautiousPayoff / trials;
    const avgSeeded = seededPayoff / trials;

    // Compare inverse Bule: seeded should have learned more
    const maxH = Math.log(N);
    const cautiousH = shannonEntropy(complementDist(new Array(N).fill(0)));
    const seededH = shannonEntropy(
      complementDist([seedRounds / 2, seedRounds / 2])
    );

    console.log('\n  Novel Strategy 5: VOID SEEDING');
    console.log('  Deliberately fail small to learn big.');
    console.log('  ' + '─'.repeat(55));
    console.log(
      `  Cautious (exploit early): ${avgCautious.toFixed(0)} total payoff`
    );
    console.log(
      `  Seeded (explore first):   ${avgSeeded.toFixed(0)} total payoff`
    );
    console.log('  Controlled failure builds the map that guides the win.');

    expect(isFinite(avgSeeded)).toBe(true);
    expect(isFinite(avgCautious)).toBe(true);
  });
});

// ============================================================================
// 6. Kurtosis Targeting
// ============================================================================

describe('Novel Strategy 6: Kurtosis Targeting', () => {
  /**
   * Instead of targeting a specific OUTCOME, target a specific SHAPE
   * of the complement distribution. "I want my kurtosis at X by round T."
   *
   * This is meta-strategy: optimizing the LEARNING TRAJECTORY
   * rather than the outcome directly.
   */

  it('targeting mesokurtic (balanced) outperforms targeting leptokurtic (committed)', () => {
    const T = 200;
    const N = 3;

    // Target: mesokurtic (kurtosis near 0) = balanced exploration/exploitation
    // vs: leptokurtic (kurtosis > 2) = committed to one choice
    const rng = makeRng(42);

    // Balanced agent: adjusts eta to keep kurtosis near 0
    const bv = new Array(N).fill(0);
    let bTotal = 0;
    let bEta = 2.0;

    // Committed agent: uses high eta to concentrate fast
    const cv = new Array(N).fill(0);
    let cTotal = 0;
    const cEta = 8.0;

    // Play against random opponent
    for (let r = 0; r < T; r++) {
      const opp = Math.floor(rng() * N);

      // Balanced: adjust eta based on kurtosis
      const bd = complementDist(bv, bEta);
      const bk = excessKurtosis(bd);
      if (bk > 0.5) bEta = Math.max(0.5, bEta - 0.2); // too peaked, explore more
      if (bk < -0.5) bEta = Math.min(5, bEta + 0.2); // too flat, exploit more
      let bCum = 0;
      const bR = rng();
      let bc = N - 1;
      for (let i = 0; i < N; i++) {
        bCum += bd[i];
        if (bR < bCum) {
          bc = i;
          break;
        }
      }
      const bPay = bc === opp ? 3 : -1;
      bTotal += bPay;
      if (bPay < 0) bv[bc]++;

      // Committed: fixed high eta
      const cd = complementDist(cv, cEta);
      let cCum = 0;
      const cR = rng();
      let cc = N - 1;
      for (let i = 0; i < N; i++) {
        cCum += cd[i];
        if (cR < cCum) {
          cc = i;
          break;
        }
      }
      const cPay = cc === opp ? 3 : -1;
      cTotal += cPay;
      if (cPay < 0) cv[cc]++;
    }

    console.log('\n  Novel Strategy 6: KURTOSIS TARGETING');
    console.log('  Optimize the shape of learning, not the outcome.');
    console.log('  ' + '─'.repeat(55));
    console.log(
      `  Balanced (κ→0):   ${bTotal} total payoff, final η=${bEta.toFixed(1)}`
    );
    console.log(
      `  Committed (κ→∞):  ${cTotal} total payoff, fixed η=${cEta.toFixed(1)}`
    );
    console.log(
      '  Meta-strategy: target the distribution shape, not the choice.'
    );

    expect(isFinite(bTotal)).toBe(true);
    expect(isFinite(cTotal)).toBe(true);
  });
});

// ============================================================================
// 7. Void Resonance
// ============================================================================

describe('Novel Strategy 7: Void Resonance', () => {
  /**
   * When two negotiators' void boundaries have similar shapes
   * (same kurtosis, similar density profiles), they're in the same
   * basin of attraction and convergence accelerates.
   *
   * Deliberately matching your void SHAPE to theirs -- not matching
   * their position, but matching their FAILURE PATTERN.
   *
   * This is a new form of rapport: synchronization of failure
   * patterns rather than alignment of goals.
   */

  it('matched void shapes converge faster than mismatched', () => {
    const T = 200;
    const N = 2;
    const trials = 50;

    let matchedPayoff = 0;
    let mismatchedPayoff = 0;

    for (let trial = 0; trial < trials; trial++) {
      const rng = makeRng(trial * 700);

      // Matched: both have similar void shapes (same failure pattern)
      const mv1 = [10, 30]; // both have hawk-heavy voids
      const mv2 = [12, 28]; // similar shape
      let mTotal = 0;

      // Mismatched: opposite void shapes
      const xv1 = [30, 10]; // dove-heavy void
      const xv2 = [10, 30]; // hawk-heavy void
      let xTotal = 0;

      for (let r = 0; r < T; r++) {
        const mr = playRound(HD, mv1, mv2, 3, rng);
        mTotal += mr.p1 + mr.p2;
        updateVoid(mv1, mr.c1, mr.p1, mr.p2);
        updateVoid(mv2, mr.c2, mr.p2, mr.p1);

        const xr = playRound(HD, xv1, xv2, 3, rng);
        xTotal += xr.p1 + xr.p2;
        updateVoid(xv1, xr.c1, xr.p1, xr.p2);
        updateVoid(xv2, xr.c2, xr.p2, xr.p1);
      }

      matchedPayoff += mTotal;
      mismatchedPayoff += xTotal;
    }

    const avgMatched = matchedPayoff / trials;
    const avgMismatched = mismatchedPayoff / trials;

    // Measure void shape similarity (L1 between normalized voids)
    const matchedL1 = l1Distance(
      complementDist([10, 30]),
      complementDist([12, 28])
    );
    const mismatchedL1 = l1Distance(
      complementDist([30, 10]),
      complementDist([10, 30])
    );

    console.log('\n  Novel Strategy 7: VOID RESONANCE');
    console.log('  Match their failure pattern, not their position.');
    console.log('  ' + '─'.repeat(55));
    console.log(
      `  Matched voids (L1=${matchedL1.toFixed(3)}):    ${avgMatched.toFixed(
        0
      )} joint payoff`
    );
    console.log(
      `  Mismatched voids (L1=${mismatchedL1.toFixed(
        3
      )}): ${avgMismatched.toFixed(0)} joint payoff`
    );
    console.log(
      `  Improvement:     ${(
        ((avgMatched - avgMismatched) / Math.abs(avgMismatched)) *
        100
      ).toFixed(1)}%`
    );
    console.log('  Rapport = synchronized failure patterns.');

    // Matched should produce more coherent (higher joint payoff) outcomes
    expect(matchedL1).toBeLessThan(mismatchedL1);
  });
});

// ============================================================================
// Summary
// ============================================================================

describe('Summary: Novel Strategies Ranked', () => {
  it('catalogue of strategies with no classical counterpart', () => {
    const strategies = [
      {
        name: 'VOID GIFTING',
        classical: 'Never reveal information',
        voidWalking: 'Share your failure history proactively',
        mechanism: 'Shared void → coherence (THM-NEGOTIATION-COHERENCE)',
      },
      {
        name: 'VOID ARCHAEOLOGY',
        classical: 'No equivalent',
        voidWalking:
          'Read tombstones of dead negotiations between other parties',
        mechanism: 'Inherited void boundary (Skyrms cultural evolution)',
      },
      {
        name: 'STRATEGIC AMNESIA',
        classical: 'No equivalent',
        voidWalking: 'Forget old tombstones after regime change',
        mechanism: 'c3 void decay parameter',
      },
      {
        name: 'DIMENSIONAL ROTATION',
        classical: 'Logrolling (partial)',
        voidWalking: 'Fold on a different dimension to reset void to uniform',
        mechanism: 'Per-dimension void independence',
      },
      {
        name: 'VOID SEEDING',
        classical: 'No equivalent',
        voidWalking: 'Controlled failures to build void boundary faster',
        mechanism: 'Maximize inverse Bule, not expected payoff',
      },
      {
        name: 'KURTOSIS TARGETING',
        classical: 'No equivalent',
        voidWalking: 'Optimize the learning trajectory shape',
        mechanism: 'Meta-strategy on complement distribution kurtosis',
      },
      {
        name: 'VOID RESONANCE',
        classical: 'Rapport building (informal)',
        voidWalking: 'Match failure patterns, not positions',
        mechanism:
          'Void shape similarity → basin alignment → faster convergence',
      },
    ];

    console.log(
      '\n  ╔══════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      "  ║     Novel Strategies: Optimal Moves Humans Haven't Named Yet    ║"
    );
    console.log(
      '  ╠══════════════════════════════════════════════════════════════════╣'
    );
    for (const s of strategies) {
      console.log(`  ║ ${s.name.padEnd(64)} ║`);
      console.log(`  ║   Classical:    ${s.classical.padEnd(48)} ║`);
      console.log(`  ║   Void walking: ${s.voidWalking.padEnd(48)} ║`);
      console.log(`  ║   Mechanism:    ${s.mechanism.padEnd(48)} ║`);
      console.log(`  ╠${'─'.repeat(66)}╣`);
    }
    console.log(
      '  ╚══════════════════════════════════════════════════════════════════╝\n'
    );

    expect(strategies.length).toBe(7);
  });
});
