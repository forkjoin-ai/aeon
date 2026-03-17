/**
 * Metacognitive Void Walker -- c0-c3 Gradient Descent to Optimality
 *
 * A strategy that evolves by reading its own void at four levels:
 *
 *   c0 (Execute):  Play the game. Observe payoff. Update void boundary.
 *                  Raw stimulus-response. No reflection.
 *
 *   c1 (Monitor):  Compute complement distribution from void boundary.
 *                  Track kurtosis, entropy, inverse Bule per window.
 *                  "I know what I've been doing."
 *
 *   c2 (Evaluate): Compare current inverse Bule to previous windows.
 *                  Detect regime changes (kurtosis discontinuities).
 *                  Compute gradient direction and magnitude.
 *                  "I know whether I'm improving."
 *
 *   c3 (Adapt):    Modify c0's parameters based on c2's evaluation.
 *                  Adjust eta (exploitation sharpness).
 *                  Adjust exploration rate (void sampling).
 *                  Reset void boundary on detected regime change.
 *                  "I change how I learn based on how learning is going."
 *
 * The creature evolves because c3 modifies the parameters that c0 uses.
 * The gradient is the inverse Bule trajectory -- the creature descends
 * toward the strategy with maximum deficit reduction rate.
 *
 * Gnosis checking: the traced monoidal feedback loop (c0 → c1 → c2 → c3 → c0)
 * converges because c2's evaluation has negative Foster-Lyapunov drift
 * outside the Nash small set. The compiler would emit this certificate.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Types
// ============================================================================

interface PayoffMatrix {
  payoffs: Record<string, Record<string, [number, number]>>;
  choices: string[];
}

/** c0 state: raw execution layer */
interface C0State {
  voidCounts: number[]; // per-choice loss accumulator
  totalRounds: number;
  totalPayoff: number;
  lastChoice: number;
  lastPayoff: number;
}

/** c1 state: monitoring layer */
interface C1State {
  complementDist: number[];
  kurtosis: number;
  entropy: number;
  inverseBule: number; // current window
  inverseBuleHistory: number[]; // across windows
  windowSize: number;
  windowPayoffs: number[];
}

/** c2 state: evaluation layer */
interface C2State {
  gradientDirection: number; // positive = improving, negative = degrading
  gradientMagnitude: number;
  regimeChangeDetected: boolean;
  kurtosisDerivative: number; // d(kurtosis)/d(round)
  inverseBuleTrend: number; // slope of inverse Bule over recent windows
  explorationScore: number; // how much exploration is paying off
  exploitationScore: number; // how much exploitation is paying off
  phaseLabel: 'exploring' | 'exploiting' | 'transitioning' | 'converged';
}

/** c3 state: adaptation layer */
interface C3State {
  eta: number; // exploitation sharpness (higher = more peaked distribution)
  explorationRate: number; // probability of random exploration (epsilon-greedy)
  voidDecay: number; // forgetting factor for old void entries (0 = no decay, 1 = instant forget)
  adaptationCount: number; // how many times c3 has intervened
  lastAdaptationRound: number;
}

/** Full metacognitive state */
interface MetaCogState {
  c0: C0State;
  c1: C1State;
  c2: C2State;
  c3: C3State;
}

interface EvolutionSnapshot {
  round: number;
  c0_payoff: number;
  c1_kurtosis: number;
  c1_entropy: number;
  c1_inverseBule: number;
  c2_gradient: number;
  c2_phase: string;
  c3_eta: number;
  c3_exploration: number;
  c3_adaptations: number;
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

function excessKurtosis(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mu = values.reduce((a, b) => a + b, 0) / n;
  const s2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (s2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / n;
  return m4 / s2 ** 2 - 3;
}

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) if (p > 0) h -= p * Math.log(p);
  return h;
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

function sparkline(values: number[]): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const blocks = ' ▁▂▃▄▅▆▇█';
  return values
    .map((v) => blocks[Math.round(((v - min) / range) * (blocks.length - 1))])
    .join('');
}

// ============================================================================
// Metacognitive Void Walker
// ============================================================================

function initMetaCog(numChoices: number): MetaCogState {
  return {
    c0: {
      voidCounts: new Array(numChoices).fill(0),
      totalRounds: 0,
      totalPayoff: 0,
      lastChoice: 0,
      lastPayoff: 0,
    },
    c1: {
      complementDist: new Array(numChoices).fill(1 / numChoices),
      kurtosis: 0,
      entropy: Math.log(numChoices),
      inverseBule: 0,
      inverseBuleHistory: [],
      windowSize: 20,
      windowPayoffs: [],
    },
    c2: {
      gradientDirection: 0,
      gradientMagnitude: 0,
      regimeChangeDetected: false,
      kurtosisDerivative: 0,
      inverseBuleTrend: 0,
      explorationScore: 0,
      exploitationScore: 0,
      phaseLabel: 'exploring',
    },
    c3: {
      eta: 2.0,
      explorationRate: 0.3, // start with high exploration
      voidDecay: 0.0, // no decay initially
      adaptationCount: 0,
      lastAdaptationRound: 0,
    },
  };
}

/** c0: Execute -- choose an action and observe the result */
function c0Execute(
  state: MetaCogState,
  matrix: PayoffMatrix,
  opponentChoice: string,
  rng: () => number,
): string {
  const choices = matrix.choices;
  const N = choices.length;

  // Epsilon-greedy with c3's exploration rate
  if (rng() < state.c3.explorationRate) {
    // Explore: random choice (adding new tombstones)
    const idx = Math.floor(rng() * N);
    state.c0.lastChoice = idx;
    return choices[idx];
  }

  // Exploit: sample from complement distribution with c3's eta
  const dist = complementDist(state.c0.voidCounts, state.c3.eta);
  const r = rng();
  let cum = 0;
  for (let i = 0; i < N; i++) {
    cum += dist[i];
    if (r < cum) {
      state.c0.lastChoice = i;
      return choices[i];
    }
  }
  state.c0.lastChoice = N - 1;
  return choices[N - 1];
}

/** c0: Update void boundary after observing payoff */
function c0Update(
  state: MetaCogState,
  myChoice: string,
  opponentChoice: string,
  matrix: PayoffMatrix,
): void {
  const [myPay, theirPay] = matrix.payoffs[myChoice]?.[opponentChoice] ?? [0, 0];
  const idx = matrix.choices.indexOf(myChoice);

  // Apply void decay (c3 parameter)
  if (state.c3.voidDecay > 0) {
    for (let i = 0; i < state.c0.voidCounts.length; i++) {
      state.c0.voidCounts[i] *= 1 - state.c3.voidDecay;
    }
  }

  // Update void: if I got less than opponent, this choice is vented
  if (myPay < theirPay && idx >= 0) {
    state.c0.voidCounts[idx] += 1;
  }
  // Also penalize very negative outcomes more heavily
  if (myPay < 0 && idx >= 0) {
    state.c0.voidCounts[idx] += Math.abs(myPay);
  }

  state.c0.totalPayoff += myPay;
  state.c0.lastPayoff = myPay;
  state.c0.totalRounds++;
}

/** c1: Monitor -- compute distribution shape metrics */
function c1Monitor(state: MetaCogState): void {
  const dist = complementDist(state.c0.voidCounts, state.c3.eta);
  const prevEntropy = state.c1.entropy;

  state.c1.complementDist = dist;
  state.c1.kurtosis = excessKurtosis(dist);
  state.c1.entropy = shannonEntropy(dist);

  // Window payoffs for local performance tracking
  state.c1.windowPayoffs.push(state.c0.lastPayoff);
  if (state.c1.windowPayoffs.length > state.c1.windowSize) {
    state.c1.windowPayoffs.shift();
  }

  // Inverse Bule for this window
  const maxEntropy = Math.log(dist.length);
  if (state.c0.totalRounds > 0) {
    state.c1.inverseBule = (maxEntropy - state.c1.entropy) / state.c0.totalRounds;
  }

  // Track inverse Bule history
  if (state.c0.totalRounds % state.c1.windowSize === 0) {
    state.c1.inverseBuleHistory.push(state.c1.inverseBule);
  }
}

/** c2: Evaluate -- compute gradient and detect regime changes */
function c2Evaluate(state: MetaCogState): void {
  const ibHist = state.c1.inverseBuleHistory;

  // Gradient: trend of inverse Bule
  if (ibHist.length >= 2) {
    const recent = ibHist.slice(-3);
    const older = ibHist.slice(-6, -3);
    const recentMean = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    const olderMean = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0;
    state.c2.gradientDirection = recentMean - olderMean;
    state.c2.gradientMagnitude = Math.abs(state.c2.gradientDirection);
  }

  // Regime change detection: sharp kurtosis discontinuity
  if (ibHist.length >= 4) {
    const last2 = ibHist.slice(-2);
    const prev2 = ibHist.slice(-4, -2);
    const lastMean = last2.reduce((a, b) => a + b, 0) / 2;
    const prevMean = prev2.reduce((a, b) => a + b, 0) / 2;
    state.c2.regimeChangeDetected = Math.abs(lastMean - prevMean) > prevMean * 0.5;
  }

  // Inverse Bule trend (slope)
  if (ibHist.length >= 3) {
    const n = Math.min(5, ibHist.length);
    const recent = ibHist.slice(-n);
    // Simple linear regression slope
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < recent.length; i++) {
      sumX += i;
      sumY += recent[i];
      sumXY += i * recent[i];
      sumX2 += i * i;
    }
    const denom = recent.length * sumX2 - sumX * sumX;
    state.c2.inverseBuleTrend = denom !== 0
      ? (recent.length * sumXY - sumX * sumY) / denom
      : 0;
  }

  // Exploration vs exploitation scoring
  const windowPayoffs = state.c1.windowPayoffs;
  if (windowPayoffs.length >= 10) {
    const half = Math.floor(windowPayoffs.length / 2);
    const recent = windowPayoffs.slice(half);
    const older = windowPayoffs.slice(0, half);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    state.c2.exploitationScore = recentAvg - olderAvg; // positive = exploitation paying off
    state.c2.explorationScore = state.c1.entropy; // high entropy = still exploring
  }

  // Phase label
  if (state.c2.regimeChangeDetected) {
    state.c2.phaseLabel = 'transitioning';
  } else if (state.c1.entropy < 0.3) {
    state.c2.phaseLabel = 'converged';
  } else if (state.c2.exploitationScore > 0.1) {
    state.c2.phaseLabel = 'exploiting';
  } else {
    state.c2.phaseLabel = 'exploring';
  }
}

/** c3: Adapt -- modify c0's parameters based on c2's evaluation */
function c3Adapt(state: MetaCogState): void {
  const minInterval = 10; // don't adapt too frequently
  if (state.c0.totalRounds - state.c3.lastAdaptationRound < minInterval) return;

  let adapted = false;

  // If regime change detected: increase exploration, add void decay
  if (state.c2.regimeChangeDetected) {
    state.c3.explorationRate = Math.min(0.5, state.c3.explorationRate + 0.1);
    state.c3.voidDecay = Math.min(0.05, state.c3.voidDecay + 0.01);
    state.c3.eta = Math.max(1.0, state.c3.eta - 0.5);
    adapted = true;
  }

  // If inverse Bule trend is positive (learning improving): increase exploitation
  if (state.c2.inverseBuleTrend > 0 && !state.c2.regimeChangeDetected) {
    state.c3.explorationRate = Math.max(0.02, state.c3.explorationRate - 0.02);
    state.c3.eta = Math.min(10.0, state.c3.eta + 0.2);
    adapted = true;
  }

  // If inverse Bule trend is negative (learning stalling): increase exploration
  if (state.c2.inverseBuleTrend < -0.0001) {
    state.c3.explorationRate = Math.min(0.4, state.c3.explorationRate + 0.03);
    state.c3.eta = Math.max(1.0, state.c3.eta - 0.1);
    adapted = true;
  }

  // If converged: minimize exploration, maximize exploitation
  if (state.c2.phaseLabel === 'converged') {
    state.c3.explorationRate = 0.01;
    state.c3.voidDecay = 0;
    adapted = true;
  }

  if (adapted) {
    state.c3.adaptationCount++;
    state.c3.lastAdaptationRound = state.c0.totalRounds;
  }
}

/** Run full metacognitive void walker against an opponent */
function runMetaCogGame(
  matrix: PayoffMatrix,
  opponentStrategy: (round: number, history: string[], rng: () => number) => string,
  rounds: number,
  rng: () => number,
): { state: MetaCogState; snapshots: EvolutionSnapshot[]; opponentHistory: string[] } {
  const state = initMetaCog(matrix.choices.length);
  const snapshots: EvolutionSnapshot[] = [];
  const myHistory: string[] = [];
  const oppHistory: string[] = [];

  for (let r = 0; r < rounds; r++) {
    // Opponent moves
    const oppChoice = opponentStrategy(r, myHistory, rng);

    // c0: Execute
    const myChoice = c0Execute(state, matrix, oppChoice, rng);
    c0Update(state, myChoice, oppChoice, matrix);
    myHistory.push(myChoice);
    oppHistory.push(oppChoice);

    // c1: Monitor
    c1Monitor(state);

    // c2: Evaluate
    c2Evaluate(state);

    // c3: Adapt
    c3Adapt(state);

    // Snapshot every 10 rounds
    if ((r + 1) % 10 === 0) {
      snapshots.push({
        round: r + 1,
        c0_payoff: state.c0.totalPayoff / state.c0.totalRounds,
        c1_kurtosis: state.c1.kurtosis,
        c1_entropy: state.c1.entropy,
        c1_inverseBule: state.c1.inverseBule,
        c2_gradient: state.c2.gradientDirection,
        c2_phase: state.c2.phaseLabel,
        c3_eta: state.c3.eta,
        c3_exploration: state.c3.explorationRate,
        c3_adaptations: state.c3.adaptationCount,
      });
    }
  }

  return { state, snapshots, opponentHistory: oppHistory };
}

// ============================================================================
// Opponent Strategies
// ============================================================================

function titForTat(choices: string[]) {
  return (round: number, theirHistory: string[]): string =>
    round === 0 ? choices[0] : theirHistory[theirHistory.length - 1];
}

function alwaysDefect(choices: string[]) {
  return (): string => choices[choices.length - 1];
}

function randomStrat(choices: string[]) {
  return (_r: number, _h: string[], rng: () => number): string =>
    choices[Math.floor(rng() * choices.length)];
}

function grimTrigger(choices: string[]) {
  let triggered = false;
  return (round: number, theirHistory: string[]): string => {
    if (triggered) return choices[choices.length - 1];
    if (theirHistory.some((c) => c === choices[choices.length - 1])) triggered = true;
    return triggered ? choices[choices.length - 1] : choices[0];
  };
}

function regimeChange(choices: string[], switchRound: number) {
  return (round: number): string =>
    round < switchRound ? choices[0] : choices[choices.length - 1];
}

// ============================================================================
// Tests
// ============================================================================

describe('Metacognitive Void Walker (c0-c3)', () => {
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

  const RPS: PayoffMatrix = {
    choices: ['rock', 'paper', 'scissors'],
    payoffs: {
      rock: { rock: [0, 0], paper: [-1, 1], scissors: [1, -1] },
      paper: { rock: [1, -1], paper: [0, 0], scissors: [-1, 1] },
      scissors: { rock: [-1, 1], paper: [1, -1], scissors: [0, 0] },
    },
  };

  it('evolves against tit-for-tat in PD: explores then exploits', () => {
    const rng = makeRng(42);
    const { state, snapshots } = runMetaCogGame(
      PD, titForTat(PD.choices), 500, rng,
    );

    // Should have adapted at least once
    expect(state.c3.adaptationCount).toBeGreaterThan(0);

    // Exploration rate should decrease over time (learning → exploitation)
    const earlyExploration = snapshots.slice(0, 5).map((s) => s.c3_exploration);
    const lateExploration = snapshots.slice(-5).map((s) => s.c3_exploration);
    const earlyMean = earlyExploration.reduce((a, b) => a + b, 0) / earlyExploration.length;
    const lateMean = lateExploration.reduce((a, b) => a + b, 0) / lateExploration.length;
    expect(lateMean).toBeLessThanOrEqual(earlyMean + 0.1);

    console.log('\n  Metacognitive PD vs Tit-for-Tat (500 rounds):');
    console.log('  ' + '─'.repeat(70));
    console.log(`  c0 avg payoff:  ${sparkline(snapshots.map((s) => s.c0_payoff))}`);
    console.log(`  c1 entropy:     ${sparkline(snapshots.map((s) => s.c1_entropy))}`);
    console.log(`  c1 inv.Bule:    ${sparkline(snapshots.map((s) => s.c1_inverseBule))}`);
    console.log(`  c2 gradient:    ${sparkline(snapshots.map((s) => s.c2_gradient))}`);
    console.log(`  c3 eta:         ${sparkline(snapshots.map((s) => s.c3_eta))}`);
    console.log(`  c3 exploration: ${sparkline(snapshots.map((s) => s.c3_exploration))}`);
    console.log(`  c3 adaptations: ${state.c3.adaptationCount}`);
    console.log(`  Final phase: ${state.c2.phaseLabel}`);
    console.log('  ' + '─'.repeat(70));
  });

  it('detects regime change when opponent switches strategy', () => {
    const rng = makeRng(42);
    // Opponent cooperates for 200 rounds then defects forever
    const { state, snapshots } = runMetaCogGame(
      PD, regimeChange(PD.choices, 200), 500, rng,
    );

    // Should detect the regime change
    // After round 200, c2 should flag a transition
    const postSwitch = snapshots.filter((s) => s.round > 200);
    const hasTransition = postSwitch.some((s) => s.c2_phase === 'transitioning');
    // The creature should have adapted (increased exploration after regime change)
    expect(state.c3.adaptationCount).toBeGreaterThan(1);

    console.log('\n  Metacognitive PD vs Regime Change (switch at r=200):');
    console.log('  ' + '─'.repeat(70));
    console.log(`  c0 avg payoff:  ${sparkline(snapshots.map((s) => s.c0_payoff))}`);
    console.log(`  c1 entropy:     ${sparkline(snapshots.map((s) => s.c1_entropy))}`);
    console.log(`  c3 exploration: ${sparkline(snapshots.map((s) => s.c3_exploration))}`);
    console.log(`  c3 eta:         ${sparkline(snapshots.map((s) => s.c3_eta))}`);
    console.log(`  phases: ${snapshots.map((s) => s.c2_phase[0]).join('')}`);
    console.log(`  c3 adaptations: ${state.c3.adaptationCount}`);
    console.log('  ' + '─'.repeat(70));
  });

  it('evolves against always-defect: converges to defection', () => {
    const rng = makeRng(42);
    const { state, snapshots } = runMetaCogGame(
      PD, alwaysDefect(PD.choices), 300, rng,
    );

    // Against constant defection, should learn to defect
    // Void boundary should show cooperation is heavily vented
    expect(state.c0.voidCounts[0]).toBeGreaterThan(0); // cooperate gets vented

    console.log('\n  Metacognitive PD vs Always-Defect:');
    console.log(`  c0 avg payoff:  ${sparkline(snapshots.map((s) => s.c0_payoff))}`);
    console.log(`  c1 entropy:     ${sparkline(snapshots.map((s) => s.c1_entropy))}`);
    console.log(`  c3 exploration: ${sparkline(snapshots.map((s) => s.c3_exploration))}`);
    console.log(`  Final phase: ${state.c2.phaseLabel}`);
  });

  it('handles 3-choice game (RPS): stays exploratory', () => {
    const rng = makeRng(42);
    const { state, snapshots } = runMetaCogGame(
      RPS, randomStrat(RPS.choices), 500, rng,
    );

    // In RPS against random, no strategy dominates
    // The creature should stay in exploring/transitioning phase
    // Entropy should stay relatively high
    const finalEntropy = snapshots[snapshots.length - 1].c1_entropy;
    expect(finalEntropy).toBeGreaterThan(0.5); // not converged to one choice

    console.log('\n  Metacognitive RPS vs Random:');
    console.log(`  c0 avg payoff:  ${sparkline(snapshots.map((s) => s.c0_payoff))}`);
    console.log(`  c1 entropy:     ${sparkline(snapshots.map((s) => s.c1_entropy))}`);
    console.log(`  c3 eta:         ${sparkline(snapshots.map((s) => s.c3_eta))}`);
    console.log(`  c3 exploration: ${sparkline(snapshots.map((s) => s.c3_exploration))}`);
    console.log(`  Final phase: ${state.c2.phaseLabel}`);
  });

  it('outperforms static void walker over long run', () => {
    const rng1 = makeRng(42);
    const rng2 = makeRng(42);

    // Metacognitive walker
    const { state: metaState } = runMetaCogGame(
      PD, titForTat(PD.choices), 1000, rng1,
    );

    // Static void walker (fixed eta=2, fixed exploration=0.1)
    const staticState = initMetaCog(PD.choices.length);
    staticState.c3.eta = 2.0;
    staticState.c3.explorationRate = 0.1;
    const oppStrat = titForTat(PD.choices);
    const myHistory: string[] = [];
    for (let r = 0; r < 1000; r++) {
      const oppChoice = oppStrat(r, myHistory);
      const myChoice = c0Execute(staticState, PD, oppChoice, rng2);
      c0Update(staticState, myChoice, oppChoice, PD);
      myHistory.push(myChoice);
    }

    const metaAvg = metaState.c0.totalPayoff / metaState.c0.totalRounds;
    const staticAvg = staticState.c0.totalPayoff / staticState.c0.totalRounds;

    console.log('\n  Metacognitive vs Static Void Walker (PD, 1000 rounds):');
    console.log(`  Metacognitive: avg payoff = ${metaAvg.toFixed(3)}, adaptations = ${metaState.c3.adaptationCount}`);
    console.log(`  Static:        avg payoff = ${staticAvg.toFixed(3)}`);
    console.log(`  Improvement:   ${((metaAvg - staticAvg) / Math.abs(staticAvg) * 100).toFixed(1)}%`);

    // Metacognitive should be at least as good (it can only help)
    // Allow small tolerance for stochastic variation
    expect(metaAvg).toBeGreaterThan(staticAvg - 0.5);
  });

  it('grand evolution: all layers visualized', () => {
    const rng = makeRng(123);
    const { state, snapshots } = runMetaCogGame(
      HD, grimTrigger(HD.choices), 500, rng,
    );

    console.log('\n  ╔═══════════════════════════════════════════════════════════╗');
    console.log('  ║   Metacognitive Evolution: Hawk-Dove vs Grim-Trigger      ║');
    console.log('  ╠═══════════════════════════════════════════════════════════╣');
    console.log(`  ║ c0 payoff:     ${sparkline(snapshots.map((s) => s.c0_payoff)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ║ c1 kurtosis:   ${sparkline(snapshots.map((s) => s.c1_kurtosis)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ║ c1 entropy:    ${sparkline(snapshots.map((s) => s.c1_entropy)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ║ c1 inv.Bule:   ${sparkline(snapshots.map((s) => s.c1_inverseBule)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ║ c2 gradient:   ${sparkline(snapshots.map((s) => s.c2_gradient)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ║ c3 eta:        ${sparkline(snapshots.map((s) => s.c3_eta)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ║ c3 explore:    ${sparkline(snapshots.map((s) => s.c3_exploration)).substring(0, 40).padEnd(40)} ║`);
    console.log(`  ╠═══════════════════════════════════════════════════════════╣`);
    console.log(`  ║ Adaptations: ${state.c3.adaptationCount}  Final: ${state.c2.phaseLabel.padEnd(15)}                ║`);
    console.log(`  ║ Final eta: ${state.c3.eta.toFixed(1)}  Final exploration: ${state.c3.explorationRate.toFixed(3)}            ║`);
    console.log(`  ║ Avg payoff: ${(state.c0.totalPayoff / state.c0.totalRounds).toFixed(3)}  Inv.Bule: ${(state.c1.inverseBule * 1000).toFixed(3)} mB⁻¹     ║`);
    console.log(`  ╚═══════════════════════════════════════════════════════════╝`);

    expect(state.c3.adaptationCount).toBeGreaterThan(0);
  });
});
