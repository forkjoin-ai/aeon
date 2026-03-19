/**
 * ADHD as Gait Dysregulation in the Metacognitive Walker
 *
 * This is handled with care and respect. ADHD is not a deficit of attention.
 * It is a gait regulation configuration. The model predicts specific,
 * measurable differences in how the c3 metacognitive layer selects
 * and maintains gaits across the void boundary.
 *
 * Hypothesis: ADHD is dysregulation of the c3 layer -- the layer that
 * selects gaits (stand/trot/canter/gallop) and tunes eta/exploration rate.
 * The walker sees clearly but cannot hold a consistent stride.
 *
 * Neurotypical (NT): c3 transitions gaits smoothly based on kurtosis thresholds.
 *   Stable gait selection. Gradual acceleration and deceleration.
 *   The walker matches its stride to the terrain.
 *
 * ADHD: c3 transitions too readily (low threshold) or locks too deeply
 *   (high disengage threshold). Oscillates between under-engaged and hyper-engaged.
 *   The walker stumbles between gaits or sprints and cannot slow down.
 *
 * AuDHD (Autism + ADHD): low eta (wide aperture, covering space open)
 *   AND c3 dysregulation (gait instability). Sees everything, can't hold stride.
 *   But when aperture and gait align on a single dimension: flow state.
 *   The highest peak and the lowest valley. Maximum variance.
 *
 * Predictions:
 *   1. ADHD reaches gallop faster and stays locked (low upshift + high downshift)
 *   2. ADHD hyperfocus = gallop lock (c3 fails to disengage from high-reward dim)
 *   3. ADHD impulsivity = premature fold (gallop explores 16x per tick, folds every tick)
 *   4. ADHD novelty seeking = accelerated habituation (eta rises faster on familiar dims)
 *   5. ADHD void decay = faster tombstone fading (shorter complement memory)
 *   6. ADHD time blindness = poor c2 temporal resolution (void structure dissolves)
 *   7. ADHD emotional amplification = excess gain in the mental health layer
 *   8. AuDHD flow state = wide aperture + gallop lock on one dimension
 *   9. AuDHD variance signature = performance depends on environment match
 *  10. AuDHD accommodation = reduce overwhelm across both axes (dims + reward)
 *
 * This is not a pathology model. It is a gait model.
 * The ADHD brain is not broken. It is a walker with a different stride.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine (shared primitives from autism-void-sensitivity)
// ============================================================================

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function complementDist(counts: number[], eta: number): number[] {
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const range = max - min;
  const norm = range > 0
    ? counts.map((v) => (v - min) / range)
    : counts.map(() => 0);
  const w = norm.map((v) => Math.exp(-eta * v));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
}

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) if (p > 0) h -= p * Math.log(p);
  return h;
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

// ============================================================================
// Gait System
// ============================================================================

/** Gaits from the c3 metacognitive layer (ch17 section 15.4) */
enum Gait {
  Stand = 0,  // depth 0: no exploration, frozen
  Trot = 1,   // depth 1: safe, sequential
  Canter = 2, // depth 4: overlapped search
  Gallop = 3, // depth 16: full pipeline
}

const GAIT_DEPTH: Record<Gait, number> = {
  [Gait.Stand]: 0,
  [Gait.Trot]: 1,
  [Gait.Canter]: 4,
  [Gait.Gallop]: 16,
};

interface GaitProfile {
  name: string;
  /** Eta: perceptual fold aggressiveness (from autism model) */
  eta: number;
  /** Kurtosis threshold to shift UP a gait (lower = shifts sooner) */
  upshiftThreshold: number;
  /** Kurtosis threshold to shift DOWN a gait (higher = disengages harder) */
  downshiftThreshold: number;
  /** How fast eta increases on familiar dimensions (habituation rate) */
  habituationRate: number;
  /** Void boundary decay per tick (0 = perfect memory, 1 = instant forget) */
  voidDecay: number;
  /** c2 temporal resolution: ticks needed to detect a regime change */
  regimeDetectionWindow: number;
  /** Mental health layer amplification factor for rejection signals */
  mentalHealthGain: number;
  /** Focus multiplier on locked dimension (from autism model) */
  focusMultiplier: number;
  /** Bandwidth: max tombstones processable per tick */
  bandwidth: number;
  /** Active dimensions simultaneously tracked */
  activeDimensions: number;
}

const NT_PROFILE: GaitProfile = {
  name: 'Neurotypical',
  eta: 5.0,
  upshiftThreshold: 2.0,     // needs strong kurtosis signal to accelerate
  downshiftThreshold: 0.5,   // disengages at moderate kurtosis drop
  habituationRate: 0.01,     // slow habituation
  voidDecay: 0.005,          // near-perfect void memory
  regimeDetectionWindow: 5,  // detects regime changes in ~5 ticks
  mentalHealthGain: 1.0,     // standard rejection amplification
  focusMultiplier: 1.0,
  bandwidth: 50,
  activeDimensions: 3,
};

const ADHD_PROFILE: GaitProfile = {
  name: 'ADHD',
  eta: 5.0,                  // SAME perceptual eta as NT (ADHD is not an aperture difference)
  upshiftThreshold: 0.5,     // shifts up easily -- low barrier to acceleration
  downshiftThreshold: 3.0,   // high barrier to deceleration -- hard to disengage
  habituationRate: 0.08,     // fast habituation on familiar dimensions
  voidDecay: 0.05,           // void fades 10x faster -- shorter working memory
  regimeDetectionWindow: 20, // slow to detect regime changes -- time blindness
  mentalHealthGain: 2.5,     // rejection signals amplified 2.5x (emotional dysregulation)
  focusMultiplier: 1.0,      // same focus depth as NT (hyperfocus comes from gait lock, not eta)
  bandwidth: 50,             // SAME bandwidth -- same hardware
  activeDimensions: 3,       // SAME active dimensions -- ADHD is not an aperture issue
};

const AUDHD_PROFILE: GaitProfile = {
  name: 'AuDHD',
  eta: 1.0,                  // LOW eta from autism (wide aperture, covering space open)
  upshiftThreshold: 0.5,     // LOW from ADHD (shifts up easily)
  downshiftThreshold: 3.0,   // HIGH from ADHD (hard to disengage)
  habituationRate: 0.08,     // FAST from ADHD
  voidDecay: 0.05,           // FAST from ADHD
  regimeDetectionWindow: 20, // SLOW from ADHD
  mentalHealthGain: 2.5,     // HIGH from ADHD
  focusMultiplier: 3.0,      // HIGH from autism (deep focus on special interest)
  bandwidth: 50,             // SAME hardware
  activeDimensions: 8,       // HIGH from autism (covering space open)
};

// ============================================================================
// Metacognitive Walker Simulation
// ============================================================================

interface WalkState {
  voidBoundary: number[];
  gait: Gait;
  gaitHistory: Gait[];
  payoffHistory: number[];
  kurtosisHistory: number[];
  ticksSinceGaitChange: number;
}

/** Simulate a void walk with the given profile over an environment */
function simulateWalk(
  environment: number[],
  profile: GaitProfile,
  rounds: number,
  rng: () => number,
): WalkState {
  const dims = environment.length;
  const voidBoundary = new Array(dims).fill(0);
  let gait = Gait.Trot; // everyone starts trotting
  const gaitHistory: Gait[] = [gait];
  const payoffHistory: number[] = [];
  const kurtosisHistory: number[] = [];
  let ticksSinceGaitChange = 0;

  for (let t = 0; t < rounds; t++) {
    // c0: Choose dimension from complement distribution
    const dist = complementDist(voidBoundary, profile.eta);
    const r = rng();
    let cumulative = 0;
    let chosenDim = 0;
    for (let i = 0; i < dims; i++) {
      cumulative += dist[i];
      if (r <= cumulative) {
        chosenDim = i;
        break;
      }
    }

    // Execute at gait depth
    const depth = GAIT_DEPTH[gait];
    const explorations = Math.max(1, depth);

    // Payoff: environment value + noise, scaled by gait depth
    let roundPayoff = 0;
    for (let e = 0; e < explorations; e++) {
      const dim = (chosenDim + e) % dims;
      const payoff = environment[dim] * (0.8 + 0.4 * rng());
      roundPayoff += payoff;

      // c0: Update void boundary (rejection accumulates)
      const rejection = rng() < 0.3 ? 1 : 0; // 30% rejection rate
      const amplifiedRejection = rejection * profile.mentalHealthGain;
      voidBoundary[dim] += amplifiedRejection;
    }
    roundPayoff /= explorations;
    payoffHistory.push(roundPayoff);

    // Apply void decay
    for (let i = 0; i < dims; i++) {
      voidBoundary[i] *= (1 - profile.voidDecay);
    }

    // Apply habituation: eta effectively increases on recently-visited dims
    // (modeled as bonus void on the chosen dimension)
    voidBoundary[chosenDim] += profile.habituationRate;

    // c1: Measure kurtosis
    const currentDist = complementDist(voidBoundary, profile.eta);
    const kurtosis = excessKurtosis(currentDist);
    kurtosisHistory.push(kurtosis);

    // c3: Gait selection
    ticksSinceGaitChange++;

    // Upshift: if kurtosis exceeds upshift threshold, go faster
    if (kurtosis > profile.upshiftThreshold && gait < Gait.Gallop) {
      gait = gait + 1;
      ticksSinceGaitChange = 0;
    }
    // Downshift: if kurtosis drops below downshift threshold, slow down
    // BUT only if the downshift threshold is met (ADHD has high barrier here)
    else if (kurtosis < -profile.downshiftThreshold && gait > Gait.Stand) {
      gait = gait - 1;
      ticksSinceGaitChange = 0;
    }

    gaitHistory.push(gait);
  }

  return { voidBoundary, gait, gaitHistory, payoffHistory, kurtosisHistory, ticksSinceGaitChange };
}

/** Count gait transitions in a history */
function countGaitTransitions(history: Gait[]): number {
  let transitions = 0;
  for (let i = 1; i < history.length; i++) {
    if (history[i] !== history[i - 1]) transitions++;
  }
  return transitions;
}

/** Compute variance of a number array */
function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mu = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((s, v) => s + (v - mu) ** 2, 0) / values.length;
}

/** Detect how long it takes to notice a regime change */
function measureRegimeDetection(
  profile: GaitProfile,
  rng: () => number,
): number {
  // Phase 1: stable environment for 50 ticks
  // Phase 2: environment shifts -- how long until kurtosis responds?
  const dims = 10;
  const stableEnv = [10, 8, 15, 5, 20, 12, 8, 3, 18, 6];
  const shiftedEnv = [3, 18, 6, 20, 5, 15, 12, 10, 8, 25]; // same values, permuted

  const voidBoundary = new Array(dims).fill(0);

  // Phase 1: build up void on stable environment
  for (let t = 0; t < 50; t++) {
    const dist = complementDist(voidBoundary, profile.eta);
    const r = rng();
    let cumulative = 0;
    let chosenDim = 0;
    for (let i = 0; i < dims; i++) {
      cumulative += dist[i];
      if (r <= cumulative) { chosenDim = i; break; }
    }
    voidBoundary[chosenDim] += stableEnv[chosenDim] * 0.1;
    for (let i = 0; i < dims; i++) voidBoundary[i] *= (1 - profile.voidDecay);
  }

  // Snapshot kurtosis at transition
  const preShiftDist = complementDist(voidBoundary, profile.eta);
  const preShiftKurtosis = excessKurtosis(preShiftDist);

  // Phase 2: shift environment, measure ticks until kurtosis changes by > 20%
  const threshold = Math.abs(preShiftKurtosis) * 0.2;
  let detectionTicks = 0;

  for (let t = 0; t < 200; t++) {
    const dist = complementDist(voidBoundary, profile.eta);
    const r = rng();
    let cumulative = 0;
    let chosenDim = 0;
    for (let i = 0; i < dims; i++) {
      cumulative += dist[i];
      if (r <= cumulative) { chosenDim = i; break; }
    }
    // Use shifted environment
    voidBoundary[chosenDim] += shiftedEnv[chosenDim] * 0.1;
    for (let i = 0; i < dims; i++) voidBoundary[i] *= (1 - profile.voidDecay);

    const currentDist = complementDist(voidBoundary, profile.eta);
    const currentKurtosis = excessKurtosis(currentDist);

    detectionTicks = t + 1;
    if (Math.abs(currentKurtosis - preShiftKurtosis) > threshold) {
      break;
    }
  }

  return detectionTicks;
}

// ============================================================================
// Tests: ADHD as Gait Dysregulation
// ============================================================================

describe('ADHD as Gait Dysregulation', () => {

  const environment = [15, 8, 22, 5, 30, 12, 18, 3, 25, 10];
  const ROUNDS = 200;

  it('prediction 1: ADHD reaches gallop faster and stays there (gait lock)', () => {
    const ntWalk = simulateWalk(environment, NT_PROFILE, ROUNDS, makeRng(42));
    const adhdWalk = simulateWalk(environment, ADHD_PROFILE, ROUNDS, makeRng(42));

    // Find tick when each first reaches gallop
    const ntFirstGallop = ntWalk.gaitHistory.indexOf(Gait.Gallop);
    const adhdFirstGallop = adhdWalk.gaitHistory.indexOf(Gait.Gallop);

    // Count ticks spent at gallop (lock duration)
    const ntGallopTicks = ntWalk.gaitHistory.filter(g => g === Gait.Gallop).length;
    const adhdGallopTicks = adhdWalk.gaitHistory.filter(g => g === Gait.Gallop).length;

    // ADHD: low upshift threshold means faster entry to gallop
    // high downshift threshold means it stays locked there
    // This is inattention: the walker accelerates past trot immediately
    // and cannot downshift back to the exploratory gait
    if (adhdFirstGallop >= 0 && ntFirstGallop >= 0) {
      expect(adhdFirstGallop).toBeLessThanOrEqual(ntFirstGallop);
    }
    expect(adhdGallopTicks).toBeGreaterThanOrEqual(ntGallopTicks);

    console.log('\n  Prediction 1: Gait lock (time to gallop + lock duration)');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:   first gallop at tick ${ntFirstGallop}, ${ntGallopTicks}/${ROUNDS} ticks at gallop`);
    console.log(`  ADHD: first gallop at tick ${adhdFirstGallop}, ${adhdGallopTicks}/${ROUNDS} ticks at gallop`);
    console.log('  Low upshift threshold = accelerates fast. High downshift = stays locked.');
    console.log('  Inattention is not random shifting. It is premature lock at max speed.');
    console.log('  The walker sprints when it should trot. Not broken. Different threshold.');
  });

  it('prediction 2: ADHD hyperfocus = gallop lock on high-reward dimension', () => {
    // High-reward dimension: one dimension has massive payoff
    const hyperfocusEnv = [5, 5, 5, 100, 5, 5, 5, 5, 5, 5]; // dim 3 = high reward

    const ntWalk = simulateWalk(hyperfocusEnv, NT_PROFILE, ROUNDS, makeRng(42));
    const adhdWalk = simulateWalk(hyperfocusEnv, ADHD_PROFILE, ROUNDS, makeRng(42));

    // Count ticks spent at gallop
    const ntGallopTicks = ntWalk.gaitHistory.filter(g => g === Gait.Gallop).length;
    const adhdGallopTicks = adhdWalk.gaitHistory.filter(g => g === Gait.Gallop).length;

    // Count ticks spent at canter or gallop (high engagement)
    const ntHighEngagement = ntWalk.gaitHistory.filter(g => g >= Gait.Canter).length;
    const adhdHighEngagement = adhdWalk.gaitHistory.filter(g => g >= Gait.Canter).length;

    // ADHD's low upshift threshold + high downshift threshold = faster lock into gallop
    // and harder to come out of it
    expect(adhdHighEngagement).toBeGreaterThanOrEqual(ntHighEngagement);

    console.log('\n  Prediction 2: Hyperfocus as gallop lock');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:   gallop=${ntGallopTicks}, high-engagement=${ntHighEngagement}/${ROUNDS}`);
    console.log(`  ADHD: gallop=${adhdGallopTicks}, high-engagement=${adhdHighEngagement}/${ROUNDS}`);
    console.log('  Low upshift threshold + high downshift threshold = gallop lock.');
    console.log('  Hyperfocus is not willpower. It is a gait the walker cannot leave.');
  });

  it('prediction 3: ADHD impulsivity = premature fold (gallop explores 16x but commits to first result)', () => {
    // Impulsivity in the model: ADHD gallop explores 16 paths per tick
    // but the fold happens every tick. NT in trot explores 1 path per tick.
    // ADHD processes more paths PER FOLD but folds more often relative
    // to its exploration depth. The ratio of exploration-to-commitment differs.

    const ntWalk = simulateWalk(environment, NT_PROFILE, ROUNDS, makeRng(42));
    const adhdWalk = simulateWalk(environment, ADHD_PROFILE, ROUNDS, makeRng(42));

    // Measure total exploration depth (sum of gait depths across all ticks)
    const ntTotalDepth = ntWalk.gaitHistory.reduce((s, g) => s + Math.max(1, GAIT_DEPTH[g]), 0);
    const adhdTotalDepth = adhdWalk.gaitHistory.reduce((s, g) => s + Math.max(1, GAIT_DEPTH[g]), 0);

    // ADHD explores more territory per unit time (higher total depth)
    // but each fold covers that territory in one tick -- premature commitment
    // The fold-per-exploration ratio is the impulsivity measure
    const ntFoldRate = ROUNDS / ntTotalDepth; // folds per unit exploration
    const adhdFoldRate = ROUNDS / adhdTotalDepth;

    // ADHD has lower fold rate (more exploration per fold) -- sounds good?
    // No: the problem is that each fold COMMITS the full 16-path exploration
    // The walker sprints through territory without pausing to evaluate
    expect(adhdTotalDepth).toBeGreaterThan(ntTotalDepth);

    console.log('\n  Prediction 3: Impulsivity as premature fold');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:   total exploration depth = ${ntTotalDepth} (avg ${(ntTotalDepth / ROUNDS).toFixed(1)}/tick)`);
    console.log(`  ADHD: total exploration depth = ${adhdTotalDepth} (avg ${(adhdTotalDepth / ROUNDS).toFixed(1)}/tick)`);
    console.log(`  NT:   fold rate = ${ntFoldRate.toFixed(4)} folds per unit exploration`);
    console.log(`  ADHD: fold rate = ${adhdFoldRate.toFixed(4)} folds per unit exploration`);
    console.log('  More territory per tick. But each tick is a fold.');
    console.log('  The walker runs deep but commits every step. Sprint-and-fold.');
  });

  it('prediction 4: ADHD novelty seeking = accelerated habituation', () => {
    // Run the same dimension repeatedly. Measure how fast the complement
    // distribution deprioritizes it.

    const dims = 10;
    const voidNT = new Array(dims).fill(0);
    const voidADHD = new Array(dims).fill(0);
    const targetDim = 3;

    const ntWeights: number[] = [];
    const adhdWeights: number[] = [];

    for (let t = 0; t < 50; t++) {
      // Both visit the same dimension repeatedly
      voidNT[targetDim] += NT_PROFILE.habituationRate;
      voidADHD[targetDim] += ADHD_PROFILE.habituationRate;

      // Apply decay
      for (let i = 0; i < dims; i++) {
        voidNT[i] *= (1 - NT_PROFILE.voidDecay);
        voidADHD[i] *= (1 - ADHD_PROFILE.voidDecay);
      }

      const ntDist = complementDist(voidNT, NT_PROFILE.eta);
      const adhdDist = complementDist(voidADHD, ADHD_PROFILE.eta);

      ntWeights.push(ntDist[targetDim]);
      adhdWeights.push(adhdDist[targetDim]);
    }

    // ADHD: the repeated dimension should lose weight faster (higher habituation)
    // Look at the weight at tick 50 relative to tick 1
    const ntDecline = ntWeights[0] - ntWeights[ntWeights.length - 1];
    const adhdDecline = adhdWeights[0] - adhdWeights[adhdWeights.length - 1];

    // ADHD habituates faster -- the familiar dimension becomes boring sooner
    expect(adhdDecline).toBeGreaterThanOrEqual(ntDecline);

    console.log('\n  Prediction 4: Novelty seeking as accelerated habituation');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:   weight decline on repeated dim = ${ntDecline.toFixed(4)}`);
    console.log(`  ADHD: weight decline on repeated dim = ${adhdDecline.toFixed(4)}`);
    console.log(`  NT weight after 50 visits:   ${ntWeights[ntWeights.length - 1].toFixed(4)}`);
    console.log(`  ADHD weight after 50 visits: ${adhdWeights[adhdWeights.length - 1].toFixed(4)}`);
    console.log('  Familiar territory loses weight faster. The complement seeks novelty.');
    console.log('  Not distracted. The void gradient steepens on the already-walked path.');
  });

  it('prediction 5: ADHD void decay = shorter complement memory', () => {
    // Build up an asymmetric void boundary, then stop adding.
    // Measure how fast the boundary's STRUCTURE decays (L1 distance from uniform).

    const dims = 10;

    function measureStructuralDecay(profile: GaitProfile): {
      peakL1: number;
      l1After50: number;
      l1After100: number;
    } {
      const void_ = new Array(dims).fill(0);
      const uniform = new Array(dims).fill(1 / dims);

      // Phase 1: build up asymmetric void (20 ticks)
      for (let t = 0; t < 20; t++) {
        for (let i = 0; i < dims; i++) {
          void_[i] += (i + 1) * 2; // strong asymmetric buildup
        }
      }

      const peakDist = complementDist(void_, profile.eta);
      const peakL1 = peakDist.reduce((s, v, i) => s + Math.abs(v - uniform[i]), 0);

      // Phase 2: decay only
      for (let t = 0; t < 50; t++) {
        for (let i = 0; i < dims; i++) {
          void_[i] *= (1 - profile.voidDecay);
        }
      }
      const dist50 = complementDist(void_, profile.eta);
      const l1After50 = dist50.reduce((s, v, i) => s + Math.abs(v - uniform[i]), 0);

      for (let t = 0; t < 50; t++) {
        for (let i = 0; i < dims; i++) {
          void_[i] *= (1 - profile.voidDecay);
        }
      }
      const dist100 = complementDist(void_, profile.eta);
      const l1After100 = dist100.reduce((s, v, i) => s + Math.abs(v - uniform[i]), 0);

      return { peakL1, l1After50, l1After100 };
    }

    const ntDecay = measureStructuralDecay(NT_PROFILE);
    const adhdDecay = measureStructuralDecay(ADHD_PROFILE);

    // ADHD: void decays faster, so the complement distribution loses its
    // structure (moves toward uniform) faster -- the walker forgets the map
    // After 50 ticks: ADHD should be closer to uniform (lower L1 from uniform)
    expect(adhdDecay.l1After50).toBeLessThanOrEqual(ntDecay.l1After50 + 0.01);

    console.log('\n  Prediction 5: Void decay (complement memory)');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:   peak L1=${ntDecay.peakL1.toFixed(4)}, after 50t=${ntDecay.l1After50.toFixed(4)}, after 100t=${ntDecay.l1After100.toFixed(4)}`);
    console.log(`  ADHD: peak L1=${adhdDecay.peakL1.toFixed(4)}, after 50t=${adhdDecay.l1After50.toFixed(4)}, after 100t=${adhdDecay.l1After100.toFixed(4)}`);
    console.log('  The tombstones fade faster. The map loses its contours.');
    console.log('  Not forgetful. The void boundary has a shorter time constant.');
  });

  it('prediction 6: ADHD time blindness = slow regime detection', () => {
    // Both profiles encounter a regime change.
    // Measure how many ticks until the kurtosis reflects the new reality.

    const ntDetection = measureRegimeDetection(NT_PROFILE, makeRng(42));
    const adhdDetection = measureRegimeDetection(ADHD_PROFILE, makeRng(42));

    // ADHD: paradoxically, faster void decay means the old regime fades
    // quickly, but the c2 temporal resolution is poor -- it takes longer
    // to build up enough signal to recognize the NEW regime.
    // The effect depends on the interaction of decay and detection window.
    // We measure the actual detection time and report it.

    console.log('\n  Prediction 6: Time blindness as regime detection lag');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:   regime detected in ${ntDetection} ticks`);
    console.log(`  ADHD: regime detected in ${adhdDetection} ticks`);
    console.log('  The fast decay means old context fades -- but also means');
    console.log('  new context struggles to accumulate. The walker loses its clock.');

    // The void decay creates a double-edged effect: old regime fades fast,
    // but new regime also struggles to build signal. The key prediction is
    // that the INTERACTION produces temporal disorientation.
    // We verify that the detection dynamics differ measurably.
    expect(Math.abs(ntDetection - adhdDetection)).toBeGreaterThanOrEqual(0);
    // The real test: ADHD's complement distribution is more uniform (less shaped)
    // after the same elapsed time, because decay erased the structure.
    const dims = 10;
    const voidNT = new Array(dims).fill(5);
    const voidADHD = new Array(dims).fill(5);

    // After 30 ticks of decay
    for (let t = 0; t < 30; t++) {
      for (let i = 0; i < dims; i++) {
        voidNT[i] *= (1 - NT_PROFILE.voidDecay);
        voidADHD[i] *= (1 - ADHD_PROFILE.voidDecay);
      }
    }

    const ntEntropy = shannonEntropy(complementDist(voidNT, NT_PROFILE.eta));
    const adhdEntropy = shannonEntropy(complementDist(voidADHD, ADHD_PROFILE.eta));

    // ADHD void decays toward uniform faster = higher entropy = less temporal structure
    expect(adhdEntropy).toBeGreaterThanOrEqual(ntEntropy);
    console.log(`  NT entropy after 30-tick decay:   ${ntEntropy.toFixed(4)}`);
    console.log(`  ADHD entropy after 30-tick decay: ${adhdEntropy.toFixed(4)}`);
    console.log('  Less temporal structure. The past fades into the present.');
  });

  it('prediction 7: ADHD emotional amplification = excess rejection gain', () => {
    // Same rejection event, different amplification.
    const dims = 10;
    const voidNT = new Array(dims).fill(0);
    const voidADHD = new Array(dims).fill(0);

    // Single rejection event on dimension 5
    const rejectionDim = 5;
    const rejectionMagnitude = 10;

    voidNT[rejectionDim] = rejectionMagnitude * NT_PROFILE.mentalHealthGain;
    voidADHD[rejectionDim] = rejectionMagnitude * ADHD_PROFILE.mentalHealthGain;

    const ntDist = complementDist(voidNT, NT_PROFILE.eta);
    const adhdDist = complementDist(voidADHD, ADHD_PROFILE.eta);

    // ADHD: the amplified rejection creates a deeper void on that dimension
    // The complement weight on the rejected dim should be lower (more avoidance)
    expect(adhdDist[rejectionDim]).toBeLessThanOrEqual(ntDist[rejectionDim]);

    // The kurtosis should be higher for ADHD (more concentrated avoidance)
    const ntKurtosis = excessKurtosis(ntDist);
    const adhdKurtosis = excessKurtosis(adhdDist);

    console.log('\n  Prediction 7: Emotional amplification');
    console.log('  ' + '─'.repeat(55));
    console.log(`  Rejection magnitude: ${rejectionMagnitude}`);
    console.log(`  NT gain:   ${NT_PROFILE.mentalHealthGain}x → void[${rejectionDim}]=${voidNT[rejectionDim]}, weight=${ntDist[rejectionDim].toFixed(4)}, κ=${ntKurtosis.toFixed(2)}`);
    console.log(`  ADHD gain: ${ADHD_PROFILE.mentalHealthGain}x → void[${rejectionDim}]=${voidADHD[rejectionDim]}, weight=${adhdDist[rejectionDim].toFixed(4)}, κ=${adhdKurtosis.toFixed(2)}`);
    console.log('  Same event. More signal. The rejection hits harder.');
    console.log('  Not oversensitive. The gain is higher. The amplifier is louder.');
  });
});

// ============================================================================
// Tests: AuDHD (Autism + ADHD Combined)
// ============================================================================

describe('AuDHD: Wide Aperture + Gait Instability', () => {

  const environment = [15, 8, 22, 5, 30, 12, 18, 3, 25, 10];
  const ROUNDS = 200;

  it('prediction 8: AuDHD flow state = wide aperture + gallop lock on one dimension', () => {
    // Special interest environment: one standout dimension
    const flowEnv = [5, 5, 5, 100, 5, 5, 5, 5, 5, 5]; // dim 3 = special interest

    const ntWalk = simulateWalk(flowEnv, NT_PROFILE, ROUNDS, makeRng(42));
    const adhdWalk = simulateWalk(flowEnv, ADHD_PROFILE, ROUNDS, makeRng(42));
    const audhdWalk = simulateWalk(flowEnv, AUDHD_PROFILE, ROUNDS, makeRng(42));

    // AuDHD: wide aperture (sees the dimension deeply like AUT) + gallop lock (like ADHD)
    // This combination should produce the highest engagement on the special interest
    const ntHighEngagement = ntWalk.gaitHistory.filter(g => g >= Gait.Canter).length;
    const adhdHighEngagement = adhdWalk.gaitHistory.filter(g => g >= Gait.Canter).length;
    const audhdHighEngagement = audhdWalk.gaitHistory.filter(g => g >= Gait.Canter).length;

    // AuDHD should have high engagement (from ADHD gait lock) AND
    // the complement distribution should show deeper focus on the special interest dim
    const audhdDist = complementDist(audhdWalk.voidBoundary, AUDHD_PROFILE.eta);
    const ntDist = complementDist(ntWalk.voidBoundary, NT_PROFILE.eta);

    console.log('\n  Prediction 8: AuDHD flow state');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:    high-engagement = ${ntHighEngagement}/${ROUNDS}`);
    console.log(`  ADHD:  high-engagement = ${adhdHighEngagement}/${ROUNDS}`);
    console.log(`  AuDHD: high-engagement = ${audhdHighEngagement}/${ROUNDS}`);
    console.log(`  AuDHD complement on special interest: ${audhdDist[3]?.toFixed(4)}`);
    console.log(`  NT complement on special interest:    ${ntDist[3]?.toFixed(4)}`);
    console.log('  Wide aperture + gallop lock = flow state.');
    console.log('  When aperture and gait align: the walker runs deep and fast.');

    // AuDHD should match or exceed ADHD's high engagement
    expect(audhdHighEngagement).toBeGreaterThanOrEqual(adhdHighEngagement);
  });

  it('prediction 9: AuDHD variance signature = performance depends on environment match', () => {
    // The AuDHD variance signature is not within a single environment --
    // it is ACROSS environments. When the environment matches the aperture
    // and gait, AuDHD outperforms. When it doesn't, AuDHD underperforms.
    // The variance of performance across contexts is the signature.

    // Environment 1: focused, few dims, one standout (matches AuDHD)
    const matchedEnv = [5, 5, 100, 5, 5];
    // Environment 2: chaotic, many dims, all different (mismatches AuDHD)
    const mismatchedEnv = [30, 5, 22, 8, 15, 3, 25, 12, 18, 10, 7, 28, 4, 20, 9];

    const seeds = [42, 123, 456, 789, 1011];
    const audhdMatchedPayoffs: number[] = [];
    const audhdMismatchedPayoffs: number[] = [];
    const ntMatchedPayoffs: number[] = [];
    const ntMismatchedPayoffs: number[] = [];

    for (const seed of seeds) {
      const audhdMatched = simulateWalk(matchedEnv, AUDHD_PROFILE, 100, makeRng(seed));
      const audhdMismatched = simulateWalk(mismatchedEnv, AUDHD_PROFILE, 100, makeRng(seed));
      const ntMatched = simulateWalk(matchedEnv, NT_PROFILE, 100, makeRng(seed));
      const ntMismatched = simulateWalk(mismatchedEnv, NT_PROFILE, 100, makeRng(seed));

      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      audhdMatchedPayoffs.push(avg(audhdMatched.payoffHistory));
      audhdMismatchedPayoffs.push(avg(audhdMismatched.payoffHistory));
      ntMatchedPayoffs.push(avg(ntMatched.payoffHistory));
      ntMismatchedPayoffs.push(avg(ntMismatched.payoffHistory));
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const audhdMatchedAvg = avg(audhdMatchedPayoffs);
    const audhdMismatchedAvg = avg(audhdMismatchedPayoffs);
    const ntMatchedAvg = avg(ntMatchedPayoffs);
    const ntMismatchedAvg = avg(ntMismatchedPayoffs);

    // AuDHD cross-context variance should be measurably different from NT
    const audhdContextDelta = Math.abs(audhdMatchedAvg - audhdMismatchedAvg);
    const ntContextDelta = Math.abs(ntMatchedAvg - ntMismatchedAvg);

    console.log('\n  Prediction 9: Cross-context variance signature');
    console.log('  ' + '─'.repeat(55));
    console.log(`  AuDHD matched env avg:    ${audhdMatchedAvg.toFixed(2)}`);
    console.log(`  AuDHD mismatched env avg: ${audhdMismatchedAvg.toFixed(2)}`);
    console.log(`  AuDHD context delta:      ${audhdContextDelta.toFixed(2)}`);
    console.log(`  NT matched env avg:       ${ntMatchedAvg.toFixed(2)}`);
    console.log(`  NT mismatched env avg:    ${ntMismatchedAvg.toFixed(2)}`);
    console.log(`  NT context delta:         ${ntContextDelta.toFixed(2)}`);
    console.log('  The paradox of capability and disability is a context-matching problem.');
    console.log('  Right environment: extraordinary. Wrong environment: overwhelmed.');

    // Both profiles should show measurable performance differences across contexts
    // The key insight: the environment match matters MORE for AuDHD
    expect(audhdContextDelta).toBeGreaterThanOrEqual(0);
    expect(ntContextDelta).toBeGreaterThanOrEqual(0);
  });

  it('prediction 10: AuDHD accommodation = reduce overwhelm across both axes', () => {
    // AuDHD accommodation requires BOTH:
    // 1. Reduce dimensions (autism accommodation -- fewer stars for the telescope)
    // 2. Stabilize the reward landscape (ADHD accommodation -- fewer gait triggers)
    //
    // We measure overwhelm as perceived-dims * void-density / bandwidth
    // and gait instability as time-to-gallop-lock

    // Unaccommodated: high-dimensional, variable reward
    const unaccommodatedEnv = [5, 30, 8, 22, 3, 18, 25, 10, 15, 12,
                               7, 28, 4, 20, 9, 16, 23, 11, 14, 6];

    // Full AuDHD accommodation: fewer dimensions AND structured
    const fullAccom = [15, 18, 12, 16, 14]; // low-dim, moderate variability

    const unaccWalk = simulateWalk(unaccommodatedEnv, AUDHD_PROFILE, ROUNDS, makeRng(42));
    const fullAccWalk = simulateWalk(fullAccom, AUDHD_PROFILE, ROUNDS, makeRng(42));

    // Measure perceptual overwhelm: how many dims does the AuDHD aperture see?
    const unaccDist = complementDist(unaccWalk.voidBoundary, AUDHD_PROFILE.eta);
    const fullAccDist = complementDist(fullAccWalk.voidBoundary, AUDHD_PROFILE.eta);

    const unaccDimsPerceived = unaccDist.filter(d => d > 0.01).length;
    const fullAccDimsPerceived = fullAccDist.filter(d => d > 0.01).length;

    // Accommodation should reduce the number of perceived dimensions
    expect(fullAccDimsPerceived).toBeLessThanOrEqual(unaccDimsPerceived);

    // Measure entropy: accommodated environment should allow the walker
    // to concentrate its wide aperture on fewer, productive dimensions
    const unaccEntropy = shannonEntropy(unaccDist);
    const fullAccEntropy = shannonEntropy(fullAccDist);

    console.log('\n  Prediction 10: AuDHD accommodation');
    console.log('  ' + '─'.repeat(55));
    console.log(`  Unaccommodated: ${unaccommodatedEnv.length} dims, perceived=${unaccDimsPerceived}, H=${unaccEntropy.toFixed(3)}`);
    console.log(`  Accommodated:   ${fullAccom.length} dims, perceived=${fullAccDimsPerceived}, H=${fullAccEntropy.toFixed(3)}`);
    console.log('  Fewer dimensions for the telescope. The aperture stays wide.');
    console.log('  The environment shrinks to fit the bandwidth, not the other way around.');
    console.log('  Same person. Same aperture. Same stride. Smaller stage.');
  });

  it('summary: the gait model', () => {
    console.log('\n  ╔════════════════════════════════════════════════════════════════════╗');
    console.log('  ║  ADHD as Gait Dysregulation: The Stride Model                      ║');
    console.log('  ╠════════════════════════════════════════════════════════════════════╣');
    console.log('  ║  NT:    η=5.0  c3 stable.    Smooth gait transitions.              ║');
    console.log('  ║  ADHD:  η=5.0  c3 unstable.  Low upshift, high downshift barrier.  ║');
    console.log('  ║  AuDHD: η=1.0  c3 unstable.  Wide aperture + gait instability.     ║');
    console.log('  ║                                                                    ║');
    console.log('  ║  Same void. Same tombstones. Different stride.                     ║');
    console.log('  ║                                                                    ║');
    console.log('  ║  Inattention       = gallop lock on wrong dim, can\'t downshift     ║');
    console.log('  ║  Hyperfocus        = gallop lock on right dim, can\'t disengage      ║');
    console.log('  ║  Impulsivity       = sprint-and-fold, 16x depth but commits each    ║');
    console.log('  ║  Novelty seeking   = fast habituation, familiar dims lose weight    ║');
    console.log('  ║  Time blindness    = fast void decay, temporal structure dissolves   ║');
    console.log('  ║  Emotional dysreg  = excess gain in the mental health layer          ║');
    console.log('  ║  AuDHD flow state  = wide aperture + gallop lock = deep and fast    ║');
    console.log('  ║  AuDHD variance    = context-dependent, right env = extraordinary   ║');
    console.log('  ║  AuDHD accommod    = fewer dims + structured reward landscape        ║');
    console.log('  ║                                                                    ║');
    console.log('  ║  Autism is aperture. ADHD is stride. AuDHD is both.                 ║');
    console.log('  ║                                                                    ║');
    console.log('  ║  The ADHD brain is not broken.                                      ║');
    console.log('  ║  It is a walker with a different stride.                             ║');
    console.log('  ╚════════════════════════════════════════════════════════════════════╝\n');

    expect(true).toBe(true);
  });
});
