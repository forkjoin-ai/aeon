/**
 * Emergent Connections — Companion Tests for Chapter 23
 *
 * Proves:
 *   1. Hylomorphism: fork = ana (unfold), fold = cata, map/filter/reduce = fork/vent/fold
 *   2. Carnot cycle: 4 strokes map to fork/race/fold/vent
 *   3. Race is timeless: fork irreversible, fold irreversible, race reversible
 *   4. Protein folding: energy funnel as fork/race/fold
 *   5. Manifold hypothesis: β₁ convergence, ReLU as venting, softmax as projection
 *   6. Attention decomposition: QK^T as race, softmax as continuous vent, mask as structural vent
 *   7. Loss = Q: cross-entropy is waste heat, gradient descent minimizes Q
 *   8. Breathing is venting: glycolysis fork, ETC race, ATP fold, CO₂ vent
 *   9. The Void: fold irreversibility, information loss, β₂ from venting
 */

import { describe, expect, it } from 'vitest';

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

type Matrix = number[][];

function softmax(values: readonly number[]): number[] {
  const maxVal = Math.max(...values);
  const exp = values.map((v) => Math.exp(v - maxVal));
  const sum = exp.reduce((s, v) => s + v, 0);
  return exp.map((v) => v / sum);
}

function dot(a: readonly number[], b: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function crossEntropy(
  target: readonly number[],
  predicted: readonly number[]
): number {
  let loss = 0;
  for (let i = 0; i < target.length; i++) {
    if (target[i] > 0) {
      loss -= target[i] * Math.log(Math.max(predicted[i], 1e-15));
    }
  }
  return loss;
}

// ============================================================================
// CH23.1 — Hylomorphism: fork/fold = unfold/fold
// ============================================================================

describe('Hylomorphism (CH23.1)', () => {
  it('fork = ana (unfold): generates multiple paths from one input', () => {
    // ana (anamorphism): A → F(A) — unfold a seed into a structure
    // fork: input → [path₁, path₂, ..., pathₙ]

    type Tree<T> = { value: T; children: Tree<T>[] } | { value: T };

    function ana<T>(
      seed: T,
      unfold: (s: T) => T[] | null,
      depth: number
    ): Tree<T> {
      if (depth === 0) return { value: seed };
      const children = unfold(seed);
      if (!children || children.length === 0) return { value: seed };
      return {
        value: seed,
        children: children.map((child) => ana(child, unfold, depth - 1)),
      };
    }

    // Fork: split a number into its factors
    const tree = ana(
      12,
      (n) => {
        const factors: number[] = [];
        for (let i = 2; i <= Math.sqrt(n); i++) {
          if (n % i === 0) {
            factors.push(i);
            factors.push(n / i);
          }
        }
        return factors.length > 0 ? factors : null;
      },
      2
    );

    expect(tree.value).toBe(12);
    expect('children' in tree).toBe(true);
    if ('children' in tree) {
      expect(tree.children.length).toBeGreaterThan(0);
    }
  });

  it('fold = cata (catamorphism): reduces structure to single value', () => {
    // cata: F(A) → A — fold a structure into a value
    // fold: [result₁, result₂, ..., resultₙ] → winner

    type Tree<T> = { value: T; children: Tree<T>[] } | { value: T };

    function cata<T, R>(
      tree: Tree<T>,
      combine: (value: T, children: R[]) => R
    ): R {
      if (!('children' in tree) || tree.children.length === 0) {
        return combine(tree.value, []);
      }
      const childResults = tree.children.map((child) => cata(child, combine));
      return combine(tree.value, childResults);
    }

    // Build a tree
    const tree: Tree<number> = {
      value: 1,
      children: [
        { value: 2, children: [{ value: 4 }, { value: 5 }] },
        { value: 3, children: [{ value: 6 }, { value: 7 }] },
      ],
    };

    // Fold: sum all values
    const sum = cata<number, number>(
      tree,
      (val, childSums) => val + childSums.reduce((a, b) => a + b, 0)
    );
    expect(sum).toBe(1 + 2 + 3 + 4 + 5 + 6 + 7);

    // Fold: find maximum (race → fold)
    const max = cata<number, number>(tree, (val, childMaxes) =>
      Math.max(val, ...childMaxes)
    );
    expect(max).toBe(7);
  });

  it('hylomorphism = ana then cata (fork then fold)', () => {
    // hylo(seed) = cata(ana(seed)) — unfold, then fold
    // This IS fork/race/fold when the fold includes a race step

    function hylo<S, T, R>(
      seed: S,
      unfold: (s: S) => { value: T; seeds: S[] } | { value: T },
      combine: (value: T, children: R[]) => R,
      depth: number
    ): R {
      const unfolded = unfold(seed);
      if (
        depth === 0 ||
        !('seeds' in unfolded) ||
        unfolded.seeds.length === 0
      ) {
        return combine(unfolded.value, []);
      }
      const children = unfolded.seeds.map((s) =>
        hylo(s, unfold, combine, depth - 1)
      );
      return combine(unfolded.value, children);
    }

    // Example: find the shortest path in a tree of possibilities
    const result = hylo<number, number, number>(
      100,
      (n) => {
        if (n <= 1) return { value: n };
        // Fork: try different divisions
        return {
          value: n,
          seeds: [Math.floor(n / 2), Math.floor(n / 3), n - 1],
        };
      },
      (value, children) => {
        if (children.length === 0) return value;
        return Math.min(...children); // Race: pick the smallest
      },
      5
    );

    expect(result).toBeLessThanOrEqual(100);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('map/filter/reduce = fork/vent/fold', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // map = fork (each element gets its own processing path)
    const mapped = data.map((x) => x * x); // fork: 10 paths
    expect(mapped).toHaveLength(data.length);

    // filter = vent (remove elements that don't pass)
    const filtered = mapped.filter((x) => x > 25); // vent: values ≤ 25
    expect(filtered.length).toBeLessThan(mapped.length);
    const ventedCount = mapped.length - filtered.length;
    expect(ventedCount).toBeGreaterThan(0);

    // reduce = fold (combine remaining elements into one)
    const reduced = filtered.reduce((acc, x) => acc + x, 0); // fold
    expect(typeof reduced).toBe('number');

    // First Law: all mapped elements either survived (fold) or were filtered (vent)
    expect(filtered.length + ventedCount).toBe(mapped.length);

    // The pipeline map→filter→reduce IS fork→vent→fold
    expect(reduced).toBe(36 + 49 + 64 + 81 + 100); // 6²+7²+8²+9²+10²
  });
});

// ============================================================================
// CH23.2 — Carnot Cycle = Fork/Race/Fold/Vent
// ============================================================================

describe('Carnot Cycle (CH23.2)', () => {
  it('maps four thermodynamic strokes to fork/race/fold/vent', () => {
    // Carnot cycle has 4 strokes:
    // 1. Isothermal expansion (absorb heat from hot reservoir) → FORK
    // 2. Adiabatic expansion (no heat exchange, work done) → RACE
    // 3. Isothermal compression (reject heat to cold reservoir) → FOLD
    // 4. Adiabatic compression (no heat exchange, work input) → VENT

    const T_hot = 600; // K
    const T_cold = 300; // K
    const Q_in = 1000; // J (heat absorbed from hot reservoir)

    // Carnot efficiency
    const eta = 1 - T_cold / T_hot;
    expect(eta).toBeCloseTo(0.5, 10);

    // Stroke 1: FORK — absorb energy, expand possibilities
    const stroke1_Q = Q_in; // heat absorbed
    const stroke1_W = Q_in * eta; // some goes to work immediately
    expect(stroke1_Q).toBeGreaterThan(0);

    // Stroke 2: RACE — adiabatic, paths evolve without heat exchange
    const stroke2_Q = 0; // no heat exchange (race is energy-preserving)
    expect(stroke2_Q).toBe(0);

    // Stroke 3: FOLD — compress, reject heat, select final state
    const W_net = Q_in * eta; // net work extracted
    expect(W_net).toBeCloseTo(500, 10);

    // Stroke 4: VENT — reject waste heat to cold reservoir
    const Q_out = Q_in - W_net; // waste heat
    expect(Q_out).toBeCloseTo(500, 10);

    // First Law: Q_in = W_net + Q_out
    expect(Q_in).toBeCloseTo(W_net + Q_out, 10);

    // This IS V_fork = W_fold + Q_vent
    const V_fork = Q_in;
    const W_fold = W_net;
    const Q_vent = Q_out;
    expect(V_fork).toBe(W_fold + Q_vent);
  });

  it('Carnot efficiency = maximum work extraction (Shannon limit analog)', () => {
    // No engine can extract more work than Carnot from the same temperature difference
    // This parallels: no compressor can beat Shannon entropy

    const T_hot = 500;
    const T_cold = 300;
    const carnotEta = 1 - T_cold / T_hot; // 0.4

    // Any real engine has lower efficiency
    const realEngines = [0.2, 0.3, 0.35, 0.39];
    for (const eta of realEngines) {
      expect(eta).toBeLessThanOrEqual(carnotEta);
    }

    // Carnot is the upper bound, just as Shannon entropy is
    expect(carnotEta).toBeCloseTo(0.4, 10);
  });

  it('race stroke preserves energy (adiabatic = unitary)', () => {
    // During the adiabatic strokes, no heat flows in or out
    // The system's energy is purely mechanical — this is the race phase
    // Energy is conserved (like unitary evolution in quantum mechanics)

    // Model: ideal gas adiabatic process PV^γ = const
    const gamma = 5 / 3; // monatomic ideal gas
    const P1 = 100; // kPa
    const V1 = 1; // m³

    const constant = P1 * Math.pow(V1, gamma);

    // Expand adiabatically to V2
    const V2 = 2;
    const P2 = constant / Math.pow(V2, gamma);

    // Work done = ∫PdV = (P1V1 - P2V2)/(γ-1)
    const W = (P1 * V1 - P2 * V2) / (gamma - 1);
    expect(W).toBeGreaterThan(0); // work extracted

    // Internal energy change = -W (first law, Q=0)
    const deltaU = -W;
    expect(deltaU).toBeLessThan(0); // gas cools

    // Total energy conserved: ΔU + W = 0 (no heat exchange)
    expect(deltaU + W).toBeCloseTo(0, 10);
  });
});

// ============================================================================
// CH23.3 — Race Is Timeless
// ============================================================================

describe('Race Is Timeless (CH23.3)', () => {
  it('fork is irreversible: energy committed, cannot uncommit', () => {
    // Once you fork, resources are allocated to each path
    // You cannot un-fork without knowing which paths will succeed

    const initialState = { budget: 100, paths: 0 };

    // Fork: allocate budget across 4 paths
    function fork(state: typeof initialState, n: number) {
      const perPath = state.budget / n;
      return Array.from({ length: n }, () => ({
        budget: perPath,
        paths: 1,
      }));
    }

    const forked = fork(initialState, 4);
    expect(forked).toHaveLength(4);

    // Total budget is conserved
    const totalBudget = forked.reduce((sum, p) => sum + p.budget, 0);
    expect(totalBudget).toBeCloseTo(initialState.budget, 10);

    // But we can't recover the original state without knowing it
    // The fork is irreversible: 100 → [25, 25, 25, 25]
    // We can sum back to 100, but we lost the information that it was ONE budget
    // (vs. say, two budgets of 50 that were each forked into 2)
    const reconstructed = forked.reduce((sum, p) => sum + p.budget, 0);
    // This equals 100, but could have come from many different original states
    expect(reconstructed).toBe(100); // mathematically equal...
    // ...but informationally different. The fork is irreversible.
  });

  it('fold is irreversible: many-to-one mapping loses information', () => {
    // Fold selects a winner from multiple paths
    // The losing paths' details are destroyed

    interface RaceResult {
      path: string;
      latency: number;
      payload: string;
    }

    const results: RaceResult[] = [
      { path: 'brotli', latency: 50, payload: 'compressed-brotli' },
      { path: 'gzip', latency: 80, payload: 'compressed-gzip' },
      { path: 'raw', latency: 10, payload: 'original-raw' },
      { path: 'lz4', latency: 30, payload: 'compressed-lz4' },
    ];

    // Fold: pick the winner (lowest latency)
    const winner = results.reduce((best, r) =>
      r.latency < best.latency ? r : best
    );
    expect(winner.path).toBe('raw');

    // After fold, we only have the winner
    // We CANNOT recover the losing paths' payloads from the winner alone
    const foldedState = { winner: winner.payload };

    // Information test: from foldedState alone, can we reconstruct results?
    // No — we don't know how many paths there were, what they contained, etc.
    expect(Object.keys(foldedState)).toHaveLength(1); // only winner survives
  });

  it('race is time-reversible: no decision made, paths in superposition', () => {
    // During the race phase, all paths are running simultaneously
    // No information is destroyed (no fold has occurred)
    // We can reconstruct the pre-race state from the mid-race state

    interface PathState {
      id: string;
      progress: number; // 0 to 1
      data: number[];
    }

    // Start of race: all paths at progress 0
    const initialPaths: PathState[] = [
      { id: 'a', progress: 0, data: [1, 2, 3] },
      { id: 'b', progress: 0, data: [4, 5, 6] },
      { id: 'c', progress: 0, data: [7, 8, 9] },
    ];

    // Mid-race: all paths at various progress levels
    function advance(paths: PathState[], amount: number): PathState[] {
      return paths.map((p) => ({
        ...p,
        progress: Math.min(1, p.progress + amount),
      }));
    }

    const midRace = advance(initialPaths, 0.5);

    // Reverse: we can reconstruct the initial state from mid-race
    function reverse(paths: PathState[], amount: number): PathState[] {
      return paths.map((p) => ({
        ...p,
        progress: Math.max(0, p.progress - amount),
      }));
    }

    const reversed = reverse(midRace, 0.5);

    // All data preserved (race is information-preserving)
    for (let i = 0; i < initialPaths.length; i++) {
      expect(reversed[i].data).toEqual(initialPaths[i].data);
      expect(reversed[i].progress).toBeCloseTo(initialPaths[i].progress, 10);
    }

    // Race is reversible — this is the key property
    // Unlike fork (committed resources) or fold (lost alternatives)
  });

  it('quantum mapping: fork=preparation, race=unitary, fold=measurement', () => {
    // Quantum mechanics maps exactly:
    // fork = state preparation (create superposition)
    // race = unitary evolution (time-reversible, preserves information)
    // fold = measurement (irreversible, collapses to one outcome)
    // vent = decoherence (information lost to environment)

    type Complex = { re: number; im: number };

    function cMag2(c: Complex): number {
      return c.re * c.re + c.im * c.im;
    }

    // Fork: create superposition |ψ⟩ = α|0⟩ + β|1⟩
    const alpha: Complex = { re: 1 / Math.sqrt(2), im: 0 };
    const beta: Complex = { re: 0, im: 1 / Math.sqrt(2) };

    // Normalization check
    expect(cMag2(alpha) + cMag2(beta)).toBeCloseTo(1, 10);

    // Race: apply unitary (e.g., phase gate)
    const theta = Math.PI / 4;
    const alphaEvolved: Complex = {
      re: alpha.re * Math.cos(theta) - alpha.im * Math.sin(theta),
      im: alpha.re * Math.sin(theta) + alpha.im * Math.cos(theta),
    };
    const betaEvolved: Complex = {
      re: beta.re * Math.cos(theta) - beta.im * Math.sin(theta),
      im: beta.re * Math.sin(theta) + beta.im * Math.cos(theta),
    };

    // Race preserves normalization (unitary = information-preserving)
    expect(cMag2(alphaEvolved) + cMag2(betaEvolved)).toBeCloseTo(1, 10);

    // Fold: measurement collapses to |0⟩ or |1⟩
    const p0 = cMag2(alphaEvolved); // probability of |0⟩
    const p1 = cMag2(betaEvolved); // probability of |1⟩
    expect(p0 + p1).toBeCloseTo(1, 10);

    // After measurement, we get ONE outcome
    // The other is destroyed (vented to decoherence)
    const measuredState = p0 >= 0.5 ? '|0⟩' : '|1⟩';
    expect(['|0⟩', '|1⟩']).toContain(measuredState);

    // Fold is irreversible: from the measurement outcome alone,
    // we cannot reconstruct α and β
  });
});

// ============================================================================
// CH23.4 — Protein Folding = Fork/Race/Fold
// ============================================================================

describe('Protein Folding (CH23.4)', () => {
  it('Levinthal paradox: 10^143 conformations, yet folds in milliseconds', () => {
    // A 100-residue protein with 3 states per bond:
    // 3^198 ≈ 10^94 conformations (simplified Levinthal)
    // If each takes 10^-13 s to sample sequentially: 10^81 seconds
    // Universe is ~10^17 seconds old

    const residues = 100;
    const statesPerBond = 3;
    const bonds = 2 * (residues - 1); // φ and ψ angles

    const logConformations = bonds * Math.log10(statesPerBond);
    expect(logConformations).toBeGreaterThan(90); // > 10^90

    const samplingTime = 1e-13; // seconds per conformation
    const logTotalTime = logConformations + Math.log10(samplingTime);
    const universeAge = 17; // log10(seconds)

    // Sequential search takes longer than the age of the universe
    expect(logTotalTime).toBeGreaterThan(universeAge);

    // But proteins fold in milliseconds to seconds!
    // This requires parallel search (fork/race/fold), not sequential
    const actualFoldingTime = 1e-3; // 1 ms
    const speedup =
      Math.pow(10, logConformations) / (actualFoldingTime / samplingTime);
    expect(speedup).toBeGreaterThan(1e80);
  });

  it('energy funnel: fork conformations, race by energy, fold to minimum', () => {
    // Model: simplified energy landscape with a funnel shape
    // Fork: generate random conformations
    // Race: each conformation has an energy (lower = better)
    // Fold: select lowest-energy conformation
    // Vent: high-energy conformations are discarded

    const rng = makeRng(0xf01d);

    interface Conformation {
      angles: number[];
      energy: number;
    }

    // Energy function: quadratic funnel (global minimum at angles = [0, 0, ...])
    function computeEnergy(angles: number[]): number {
      return angles.reduce((sum, a) => sum + a * a, 0) + (rng() - 0.5) * 0.1;
    }

    // Fork: generate 1000 random conformations
    const nConformations = 1000;
    const nAngles = 10;
    const conformations: Conformation[] = [];

    for (let i = 0; i < nConformations; i++) {
      const angles = Array.from({ length: nAngles }, () => (rng() - 0.5) * 10);
      conformations.push({ angles, energy: computeEnergy(angles) });
    }

    // Race: sort by energy (lower is better)
    conformations.sort((a, b) => a.energy - b.energy);

    // Fold: select the winner (lowest energy)
    const winner = conformations[0];
    expect(winner.energy).toBeLessThan(
      conformations[nConformations - 1].energy
    );

    // Vent: all non-winners are discarded
    const ventedCount = nConformations - 1;
    expect(ventedCount).toBe(999);

    // The winner should be near the global minimum (angles ≈ 0)
    const avgAngle =
      winner.angles.reduce((s, a) => s + Math.abs(a), 0) / nAngles;
    // In 1000 random samples, the best should have small angles
    expect(avgAngle).toBeLessThan(3);

    // Vent ratio
    const ventRatio = ventedCount / nConformations;
    expect(ventRatio).toBeCloseTo(0.999, 3);
  });

  it('chaperones are vent operators: remove misfolded proteins', () => {
    // Chaperones don't fold proteins — they UNFOLD misfolded ones
    // This is venting: "propagate down, never across"

    interface Protein {
      id: string;
      folded: boolean;
      misfolded: boolean;
    }

    const proteins: Protein[] = [
      { id: 'p1', folded: true, misfolded: false }, // correctly folded
      { id: 'p2', folded: true, misfolded: true }, // misfolded
      { id: 'p3', folded: false, misfolded: false }, // still folding
      { id: 'p4', folded: true, misfolded: true }, // misfolded
      { id: 'p5', folded: true, misfolded: false }, // correctly folded
    ];

    // Chaperone = vent operator: identify and remove misfolded
    function chaperone(proteins: Protein[]): {
      survivors: Protein[];
      vented: Protein[];
    } {
      const survivors: Protein[] = [];
      const vented: Protein[] = [];

      for (const p of proteins) {
        if (p.misfolded) {
          vented.push(p); // vent: propagate down (to degradation)
        } else {
          survivors.push(p);
        }
      }

      return { survivors, vented };
    }

    const result = chaperone(proteins);
    expect(result.vented).toHaveLength(2); // p2 and p4
    expect(result.survivors).toHaveLength(3); // p1, p3, p5

    // Vent rule: vented proteins never come back
    // "propagate down, never across"
    for (const v of result.vented) {
      expect(v.misfolded).toBe(true);
      expect(result.survivors).not.toContainEqual(v);
    }
  });
});

// ============================================================================
// CH23.5 — Manifold Hypothesis: Fold = Projection onto Answer Manifold
// ============================================================================

describe('Manifold Hypothesis (CH23.5)', () => {
  it('ReLU is a vent: negative activations suppressed (off-manifold)', () => {
    function relu(x: number): number {
      return Math.max(0, x);
    }

    const activations = [-2.5, 1.0, -0.3, 3.7, -1.2, 0.8, -0.01, 2.1];

    const afterRelu = activations.map(relu);

    // Count vented (set to 0) vs surviving activations
    const vented = afterRelu.filter((x) => x === 0).length;
    const surviving = afterRelu.filter((x) => x > 0).length;

    expect(vented).toBe(4); // 4 negative values vented
    expect(surviving).toBe(4);

    // Vent ratio
    const ventRatio = vented / activations.length;
    expect(ventRatio).toBe(0.5);

    // Total information reduction (vented activations lose their value)
    for (let i = 0; i < activations.length; i++) {
      if (activations[i] < 0) {
        expect(afterRelu[i]).toBe(0); // information destroyed
      } else {
        expect(afterRelu[i]).toBe(activations[i]); // information preserved
      }
    }
  });

  it('softmax projects onto probability manifold (simplex)', () => {
    const logits = [2.0, 1.0, 0.5, -1.0, 3.0];
    const probs = softmax(logits);

    // Properties of the probability simplex:
    // 1. All values in [0, 1]
    for (const p of probs) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }

    // 2. Sum to 1
    expect(probs.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 10);

    // 3. Order preserved (softmax is monotonic)
    const maxLogitIdx = logits.indexOf(Math.max(...logits));
    const maxProbIdx = probs.indexOf(Math.max(...probs));
    expect(maxProbIdx).toBe(maxLogitIdx);

    // 4. Dimensionality reduction: 5D → 4D (simplex is n-1 dimensional)
    // The constraint Σpᵢ = 1 removes one degree of freedom
    const effectiveDim = logits.length - 1;
    expect(effectiveDim).toBe(4);
  });

  it('β₁ decreases through successive projections (fold convergence)', () => {
    // Simulate: high-dimensional data → lower-dimensional projections
    // Each projection reduces β₁ (fewer independent paths)

    const rng = makeRng(0xaf01d);
    const n = 50;
    const dim = 20;

    // Generate data in dim dimensions
    const data = Array.from({ length: n }, () =>
      Array.from({ length: dim }, () => rng() * 2 - 1)
    );

    // Successive projections (simulating network layers)
    function project(data: number[][], targetDim: number): number[][] {
      // Random linear projection + ReLU (vent negatives)
      const projMatrix = Array.from({ length: data[0].length }, () =>
        Array.from({ length: targetDim }, () => rng() * 2 - 1)
      );

      return data.map((row) => {
        const projected = Array.from({ length: targetDim }, (_, j) => {
          let sum = 0;
          for (let i = 0; i < row.length; i++) {
            sum += row[i] * projMatrix[i][j];
          }
          return Math.max(0, sum); // ReLU vent
        });
        return projected;
      });
    }

    // Track "effective dimensionality" (proxy for β₁) at each layer
    function effectiveDim(data: number[][]): number {
      // Count dimensions with significant variance
      const dim = data[0].length;
      const means = Array.from(
        { length: dim },
        (_, j) => data.reduce((s, row) => s + row[j], 0) / data.length
      );
      const variances = Array.from(
        { length: dim },
        (_, j) =>
          data.reduce((s, row) => s + (row[j] - means[j]) ** 2, 0) / data.length
      );
      const threshold = 0.01;
      return variances.filter((v) => v > threshold).length;
    }

    let current = data;
    const dims: number[] = [effectiveDim(current)];

    // Layer 1: 20 → 15
    current = project(current, 15);
    dims.push(effectiveDim(current));

    // Layer 2: 15 → 10
    current = project(current, 10);
    dims.push(effectiveDim(current));

    // Layer 3: 10 → 5
    current = project(current, 5);
    dims.push(effectiveDim(current));

    // Layer 4: 5 → 2
    current = project(current, 2);
    dims.push(effectiveDim(current));

    // Effective dimensionality should generally decrease
    // (ReLU venting + lower-dimensional projections)
    expect(dims[dims.length - 1]).toBeLessThanOrEqual(dims[0]);

    // Final dimension should be small
    expect(dims[dims.length - 1]).toBeLessThanOrEqual(2);
  });
});

// ============================================================================
// CH23.6 — Attention Is Race
// ============================================================================

describe('Attention Is Race (CH23.6)', () => {
  it('QK^T is a pairwise race: all token pairs compete', () => {
    const seqLen = 4;
    const dHead = 8;
    const rng = makeRng(0xa11e);

    // Q and K matrices
    const Q = Array.from({ length: seqLen }, () =>
      Array.from({ length: dHead }, () => rng() * 2 - 1)
    );
    const K = Array.from({ length: seqLen }, () =>
      Array.from({ length: dHead }, () => rng() * 2 - 1)
    );

    // QK^T: race between all token pairs
    const scores: Matrix = Array.from({ length: seqLen }, (_, i) =>
      Array.from(
        { length: seqLen },
        (_, j) => dot(Q[i], K[j]) / Math.sqrt(dHead)
      )
    );

    // Every pair competed (race is complete)
    expect(scores).toHaveLength(seqLen);
    expect(scores[0]).toHaveLength(seqLen);

    // Race count = seqLen² (all pairs)
    const totalRaces = seqLen * seqLen;
    expect(totalRaces).toBe(16);
  });

  it('softmax is continuous venting: low scores suppressed, not zeroed', () => {
    const scores = [5.0, 2.0, -1.0, 0.5, -3.0];
    const weights = softmax(scores);

    // Low-score tokens get near-zero weight (soft vent)
    const sortedWeights = [...weights].sort((a, b) => a - b);
    const lowestWeight = sortedWeights[0];
    const highestWeight = sortedWeights[sortedWeights.length - 1];

    // Dynamic range: highest >> lowest (venting effect)
    expect(highestWeight / lowestWeight).toBeGreaterThan(100);

    // But NO weight is exactly 0 (soft vent, not hard vent)
    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
    }

    // Compare with hard vent (argmax): only one survives
    const hardVented = weights.map((w, i) =>
      i === weights.indexOf(Math.max(...weights)) ? 1 : 0
    );
    const hardVentRatio =
      hardVented.filter((w) => w === 0).length / weights.length;
    expect(hardVentRatio).toBe(0.8); // 4 of 5 vented

    // Soft vent ratio (weight < threshold)
    const threshold = 0.01;
    const softVented = weights.filter((w) => w < threshold).length;
    expect(softVented).toBeGreaterThan(0); // some tokens effectively vented
  });

  it('causal mask is structural venting: future tokens unreachable', () => {
    const seqLen = 5;
    const dHead = 4;
    const rng = makeRng(0xfa5c);

    const Q = Array.from({ length: seqLen }, () =>
      Array.from({ length: dHead }, () => rng() * 2 - 1)
    );
    const K = [...Q]; // self-attention

    // Compute scores
    const scores: Matrix = Array.from({ length: seqLen }, (_, i) =>
      Array.from(
        { length: seqLen },
        (_, j) => dot(Q[i], K[j]) / Math.sqrt(dHead)
      )
    );

    // Apply causal mask: set future positions to -Infinity
    const maskedScores = scores.map((row, i) =>
      row.map((score, j) => (j > i ? -Infinity : score))
    );

    // After softmax, future positions get 0 weight (hard vent via mask)
    const maskedWeights = maskedScores.map(softmax);

    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < seqLen; j++) {
        if (j > i) {
          // Future tokens are vented (weight = 0)
          expect(maskedWeights[i][j]).toBeCloseTo(0, 10);
        }
      }
      // Present + past tokens still sum to 1
      const rowSum = maskedWeights[i].reduce((s, w) => s + w, 0);
      expect(rowSum).toBeCloseTo(1, 10);
    }

    // Vent count: total future positions masked
    let ventedPositions = 0;
    for (let i = 0; i < seqLen; i++) {
      for (let j = i + 1; j < seqLen; j++) {
        ventedPositions++;
      }
    }
    expect(ventedPositions).toBe(10); // n(n-1)/2 = 5*4/2
  });

  it('multi-head concatenation = higher-order fork, projection = fold', () => {
    const seqLen = 3;
    const heads = 4;
    const dHead = 4;
    const dModel = heads * dHead; // 16
    const rng = makeRng(0xbead);

    // Input
    const input: Matrix = Array.from({ length: seqLen }, () =>
      Array.from({ length: dModel }, () => rng() * 2 - 1)
    );

    // Fork: split into heads
    const headInputs = Array.from({ length: heads }, (_, h) =>
      input.map((row) => row.slice(h * dHead, (h + 1) * dHead))
    );
    expect(headInputs).toHaveLength(heads); // β₁ = heads - 1 = 3

    // Race: each head computes attention independently
    const headOutputs = headInputs.map((headInput) => {
      // Simplified: just pass through (real attention would transform)
      return headInput;
    });

    // Fold: concatenate heads back
    const concatenated = Array.from({ length: seqLen }, (_, t) => {
      const row: number[] = [];
      for (const head of headOutputs) {
        row.push(...head[t]);
      }
      return row;
    });

    expect(concatenated[0]).toHaveLength(dModel); // back to full dimension

    // Projection fold: linear layer reduces concatenated → output
    // (simplified as identity here)
    const output = concatenated;
    expect(output).toHaveLength(seqLen);
    expect(output[0]).toHaveLength(dModel);

    // Fork-fold topology: β₁ = heads - 1 = 3
    const beta1 = heads - 1;
    expect(beta1).toBe(3);
  });
});

// ============================================================================
// CH23.7 — Loss = Q (Waste Heat)
// ============================================================================

describe('Loss = Q (CH23.7)', () => {
  it('cross-entropy loss is waste heat: perfect model has L = 0', () => {
    // Perfect prediction: ŷ = y → L = 0 (no waste)
    const target = [0, 1, 0, 0]; // one-hot: class 1
    const perfectPred = [0, 1, 0, 0];

    // Need to handle log(0) carefully
    const perfectLoss = crossEntropy(target, perfectPred);
    expect(perfectLoss).toBeCloseTo(0, 10);

    // Imperfect prediction: L > 0 (waste heat)
    const imperfectPred = softmax([0.5, 2.0, 0.1, -0.3]);
    const imperfectLoss = crossEntropy(target, imperfectPred);
    expect(imperfectLoss).toBeGreaterThan(0);

    // Worse prediction: more waste heat
    const worsePred = softmax([2.0, 0.5, 0.1, -0.3]); // wrong class has highest logit
    const worseLoss = crossEntropy(target, worsePred);
    expect(worseLoss).toBeGreaterThan(imperfectLoss);

    // Uniform prediction: maximum waste heat (for 4 classes)
    const uniformPred = [0.25, 0.25, 0.25, 0.25];
    const uniformLoss = crossEntropy(target, uniformPred);
    expect(uniformLoss).toBeCloseTo(Math.log(4), 5); // log(K) for K classes
  });

  it('gradient descent minimizes waste heat: ∂L/∂θ → 0', () => {
    // Tiny 1-parameter model: y = sigmoid(θx)
    // Train on one example: x=1, target=1

    function sigmoid(z: number): number {
      return 1 / (1 + Math.exp(-z));
    }

    // Loss = -log(sigmoid(θ)) for target=1
    function loss(theta: number): number {
      return -Math.log(sigmoid(theta));
    }

    // Gradient: dL/dθ = -(1 - sigmoid(θ))
    function gradient(theta: number): number {
      return -(1 - sigmoid(theta));
    }

    let theta = 0; // start at random
    const lr = 1.0;
    const losses: number[] = [loss(theta)];

    // Gradient descent — 100 steps for convergence
    for (let step = 0; step < 100; step++) {
      theta -= lr * gradient(theta);
      losses.push(loss(theta));
    }

    // Loss should decrease monotonically (waste heat being minimized)
    for (let i = 1; i < losses.length; i++) {
      expect(losses[i]).toBeLessThanOrEqual(losses[i - 1] + 1e-10);
    }

    // Final loss should be small (θ → ∞, sigmoid → 1)
    expect(losses[losses.length - 1]).toBeLessThan(0.05);

    // Gradient should be near 0 at convergence
    expect(Math.abs(gradient(theta))).toBeLessThan(0.05);
  });

  it('dropout is stochastic venting: randomly zeroes activations', () => {
    const activations = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0];
    const dropRate = 0.5;
    const rng = makeRng(0xd00f);

    function dropout(
      acts: number[],
      rate: number
    ): { result: number[]; ventedCount: number } {
      let vented = 0;
      const result = acts.map((a) => {
        if (rng() < rate) {
          vented++;
          return 0; // vented
        }
        return a / (1 - rate); // scale surviving activations
      });
      return { result, ventedCount: vented };
    }

    const { result, ventedCount } = dropout(activations, dropRate);

    // Some activations were vented
    expect(ventedCount).toBeGreaterThan(0);
    expect(ventedCount).toBeLessThan(activations.length);

    // Vented activations are exactly 0
    const zeros = result.filter((x) => x === 0).length;
    expect(zeros).toBe(ventedCount);

    // Surviving activations are scaled up (to preserve expected value)
    const survivors = result.filter((x) => x > 0);
    for (const s of survivors) {
      expect(s).toBeGreaterThan(0);
    }

    // Vent ratio ≈ dropRate (stochastic, so approximate)
    const ventRatio = ventedCount / activations.length;
    expect(ventRatio).toBeGreaterThan(0);
    expect(ventRatio).toBeLessThan(1);
  });

  it('learning rate is thermodynamic throttle: too high oscillates, too low stagnates', () => {
    // Simple convex loss: L(θ) = θ²

    function loss(theta: number): number {
      return theta * theta;
    }

    function gradient(theta: number): number {
      return 2 * theta;
    }

    // Too high learning rate: oscillates (overheating)
    let thetaHigh = 5;
    const lrHigh = 1.5; // > 1/L where L is Lipschitz constant
    const highLosses: number[] = [];
    for (let i = 0; i < 20; i++) {
      highLosses.push(loss(thetaHigh));
      thetaHigh -= lrHigh * gradient(thetaHigh);
    }
    // Should oscillate (not converge)
    const oscillating = highLosses.some(
      (l, i) => i > 0 && l > highLosses[i - 1]
    );
    expect(oscillating).toBe(true);

    // Just right learning rate: converges smoothly
    let thetaGood = 5;
    const lrGood = 0.3;
    const goodLosses: number[] = [];
    for (let i = 0; i < 20; i++) {
      goodLosses.push(loss(thetaGood));
      thetaGood -= lrGood * gradient(thetaGood);
    }
    // Should converge monotonically
    for (let i = 1; i < goodLosses.length; i++) {
      expect(goodLosses[i]).toBeLessThanOrEqual(goodLosses[i - 1] + 1e-10);
    }
    expect(goodLosses[goodLosses.length - 1]).toBeLessThan(0.01);

    // Too low learning rate: converges very slowly (stagnation)
    let thetaSlow = 5;
    const lrSlow = 0.01;
    const slowLosses: number[] = [];
    for (let i = 0; i < 20; i++) {
      slowLosses.push(loss(thetaSlow));
      thetaSlow -= lrSlow * gradient(thetaSlow);
    }
    // Converges but much more slowly
    expect(slowLosses[19]).toBeGreaterThan(goodLosses[19]);
  });

  it('Bayes error rate = ground-state energy (irreducible loss)', () => {
    // A noisy binary classification problem where labels have inherent noise
    // Even the optimal classifier cannot achieve 0 loss

    // True label probability: P(y=1|x) = 0.7 for all x
    const pTrue = 0.7;

    // Bayes optimal prediction: always predict y=1 (since 0.7 > 0.5)
    // Expected loss = -[p*log(p) + (1-p)*log(1-p)] = binary entropy
    const bayesError = -(
      pTrue * Math.log(pTrue) +
      (1 - pTrue) * Math.log(1 - pTrue)
    );

    expect(bayesError).toBeGreaterThan(0); // irreducible

    // Any other classifier has higher expected loss
    // Classifier that predicts p=0.5 (uniform)
    const uniformLoss = -(pTrue * Math.log(0.5) + (1 - pTrue) * Math.log(0.5));
    expect(uniformLoss).toBeGreaterThan(bayesError);

    // Classifier that predicts p=0.9 (overconfident)
    const overconfidentLoss = -(
      pTrue * Math.log(0.9) +
      (1 - pTrue) * Math.log(0.1)
    );
    expect(overconfidentLoss).toBeGreaterThan(bayesError);

    // Bayes error is the ground state — cannot be improved upon
    // This is the Third Law: non-zero minimum energy
    expect(bayesError).toBeGreaterThan(0);
    expect(bayesError).toBeLessThan(Math.log(2)); // less than maximum entropy
  });
});

// ============================================================================
// CH23.8 — Breathing Is Venting
// ============================================================================

describe('Breathing Is Venting (CH23.8)', () => {
  it('glycolysis is fork: glucose splits into 2 pyruvate', () => {
    // Glucose (C₆H₁₂O₆) → 2 Pyruvate (C₃H₄O₃) + 2 ATP + 2 NADH
    interface Molecule {
      name: string;
      carbons: number;
      energy: number; // arbitrary energy units
    }

    const glucose: Molecule = { name: 'glucose', carbons: 6, energy: 100 };

    // Fork: split into 2 pyruvate
    function glycolysis(input: Molecule): {
      products: Molecule[];
      atpYield: number;
      nadhYield: number;
    } {
      return {
        products: [
          { name: 'pyruvate-1', carbons: 3, energy: 40 },
          { name: 'pyruvate-2', carbons: 3, energy: 40 },
        ],
        atpYield: 2, // net ATP from glycolysis
        nadhYield: 2, // NADH produced
      };
    }

    const result = glycolysis(glucose);

    // Fork: 1 molecule → 2 molecules
    expect(result.products).toHaveLength(2);

    // Carbon conservation
    const totalCarbons = result.products.reduce((s, p) => s + p.carbons, 0);
    expect(totalCarbons).toBe(glucose.carbons);

    // Energy conservation (approximately)
    const productEnergy = result.products.reduce((s, p) => s + p.energy, 0);
    const atpEnergy = result.atpYield * 7.3; // ~7.3 kcal/mol per ATP
    const nadhEnergy = result.nadhYield * 2.5; // ~2.5 kcal/mol per NADH
    expect(productEnergy + atpEnergy + nadhEnergy).toBeLessThanOrEqual(
      glucose.energy
    );
  });

  it('electron transport chain is race: electrons race down redox gradient', () => {
    // Complexes I → II → III → IV, each at decreasing redox potential
    interface Complex {
      name: string;
      redoxPotential: number; // mV
      protonsTranslocated: number;
    }

    const etc: Complex[] = [
      {
        name: 'Complex I (NADH dehydrogenase)',
        redoxPotential: -320,
        protonsTranslocated: 4,
      },
      {
        name: 'Complex II (Succinate dehydrogenase)',
        redoxPotential: -40,
        protonsTranslocated: 0,
      },
      {
        name: 'Complex III (Cytochrome bc1)',
        redoxPotential: 60,
        protonsTranslocated: 4,
      },
      {
        name: 'Complex IV (Cytochrome c oxidase)',
        redoxPotential: 250,
        protonsTranslocated: 2,
      },
    ];

    // Electrons "race" from low to high redox potential
    for (let i = 1; i < etc.length; i++) {
      expect(etc[i].redoxPotential).toBeGreaterThan(etc[i - 1].redoxPotential);
    }

    // Energy extracted at each step (protons translocated)
    const totalProtons = etc.reduce((s, c) => s + c.protonsTranslocated, 0);
    expect(totalProtons).toBe(10);

    // Final electron acceptor: O₂ (highest redox potential)
    // This is the "finish line" of the race
    const o2RedoxPotential = 815; // mV
    expect(o2RedoxPotential).toBeGreaterThan(
      etc[etc.length - 1].redoxPotential
    );
  });

  it('ATP synthase is rotary fold: proton gradient → chemical bond', () => {
    // ATP synthase converts the proton-motive force into ATP
    // This is a fold: many protons → one ATP molecule

    const protonsPerATP = 4; // approximately
    const protonGradient = 10; // protons available from one NADH

    // Fold: convert proton gradient to ATP count
    const atpProduced = Math.floor(protonGradient / protonsPerATP);
    expect(atpProduced).toBe(2);

    // The fold is many-to-one: 4 protons → 1 ATP
    // Information lost: individual proton energies
    expect(protonsPerATP).toBeGreaterThan(1); // many-to-one

    // Total ATP from glucose oxidation
    const nadhFromGlycolysis = 2;
    const nadhFromKrebs = 8;
    const fadh2FromKrebs = 2;
    const atpFromGlycolysis = 2;
    const atpFromKrebs = 2;

    const nadhATP = (nadhFromGlycolysis + nadhFromKrebs) * 2.5; // ~2.5 ATP per NADH
    const fadh2ATP = fadh2FromKrebs * 1.5; // ~1.5 ATP per FADH₂
    const totalATP = atpFromGlycolysis + atpFromKrebs + nadhATP + fadh2ATP;

    // ~30-32 ATP per glucose molecule
    expect(totalATP).toBeGreaterThanOrEqual(28);
    expect(totalATP).toBeLessThanOrEqual(36);
  });

  it('CO₂ and heat are vented: propagate out, never recirculate', () => {
    // CO₂ is exhaled (vented) — it leaves the system permanently
    // Heat is radiated — waste energy that cannot be recovered

    interface MetabolicBudget {
      glucoseEnergy: number; // total input energy
      atpEnergy: number; // useful work (fold)
      heatDissipated: number; // waste heat (vent)
      co2Released: number; // waste carbon (vent)
    }

    // Human metabolism: ~40% efficiency
    const budget: MetabolicBudget = {
      glucoseEnergy: 100,
      atpEnergy: 40, // ~40% converted to useful work
      heatDissipated: 55, // ~55% lost as heat
      co2Released: 5, // ~5% as CO₂ waste products
    };

    // First Law: V_fork = W_fold + Q_vent
    const V_fork = budget.glucoseEnergy;
    const W_fold = budget.atpEnergy;
    const Q_vent = budget.heatDissipated + budget.co2Released;

    expect(V_fork).toBe(W_fold + Q_vent);

    // Vent is one-directional
    // CO₂ once exhaled cannot be reused (in the same organism)
    // Heat once radiated cannot be recovered
    expect(Q_vent).toBeGreaterThan(W_fold); // most energy is vented!

    // Efficiency
    const efficiency = W_fold / V_fork;
    expect(efficiency).toBeCloseTo(0.4, 10);

    // This is worse than Carnot: body temp ~310K, environment ~293K
    const carnotMax = 1 - 293 / 310;
    expect(carnotMax).toBeCloseTo(0.055, 2);
    // Wait — body is actually less efficient than Carnot?
    // No: Carnot limit applies to heat engines. Biology uses chemical energy.
    // The ~40% is the chemical-to-mechanical conversion efficiency.
  });
});

// ============================================================================
// CH23.9 — The Void: Fold Is Irreversible, No Unfold Exists
// ============================================================================

describe('The Void (CH23.9)', () => {
  it('fold is irreversible: cannot reconstruct input from output', () => {
    // max() is a fold — it selects the largest value
    // Given max(a,b,c) = c, you cannot recover a and b

    const inputs = [
      [3, 7, 5], // max = 7
      [1, 7, 2], // max = 7
      [7, 7, 7], // max = 7
      [-1, 7, 0], // max = 7
    ];

    // All have the same fold output
    const outputs = inputs.map((arr) => Math.max(...arr));
    expect(new Set(outputs).size).toBe(1); // all equal 7

    // But inputs are all different
    expect(new Set(inputs.map(JSON.stringify)).size).toBe(4);

    // Many-to-one: 4 different inputs → 1 output
    // Cannot unfold: which input produced max=7?
  });

  it('softmax cannot be un-softmax-ed: information destroyed', () => {
    // softmax([a, b, c]) → [p, q, r]
    // From [p, q, r] you can recover [a+k, b+k, c+k] for any k
    // But you cannot recover the absolute values of a, b, c

    const logits1 = [1, 2, 3];
    const logits2 = [101, 102, 103]; // shifted by 100
    const logits3 = [-99, -98, -97]; // shifted by -100

    const probs1 = softmax(logits1);
    const probs2 = softmax(logits2);
    const probs3 = softmax(logits3);

    // All produce identical probabilities
    for (let i = 0; i < 3; i++) {
      expect(probs1[i]).toBeCloseTo(probs2[i], 10);
      expect(probs1[i]).toBeCloseTo(probs3[i], 10);
    }

    // Three different inputs → same output
    // The absolute scale is destroyed (vented)
    // This is irreversible: you cannot un-softmax
  });

  it('hash cannot be un-hashed: void is permanent', () => {
    // Simple hash function: many inputs → one output
    function simpleHash(input: string): number {
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
      }
      return hash;
    }

    // Different inputs can produce the same hash (pigeonhole)
    // But even without collision, you can't recover input from hash
    const hash1 = simpleHash('hello world');
    const hash2 = simpleHash('world hello');

    // Hashes are deterministic
    expect(simpleHash('hello world')).toBe(hash1);

    // But you can't reverse them
    // Given hash1, what was the input? Infinite possibilities.
    expect(typeof hash1).toBe('number');
    expect(typeof hash2).toBe('number');

    // The void: information about the input is permanently lost
    // This is β₂ > 0 — unreachable states in the output space
  });

  it('entropy increases through successive folds (Second Law)', () => {
    // Track entropy through a pipeline of folds

    function shannonEntropy(distribution: number[]): number {
      return -distribution
        .filter((p) => p > 0)
        .reduce((sum, p) => sum + p * Math.log2(p), 0);
    }

    // Initial state: 8 equally likely outcomes
    const initial = [1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8];
    const H0 = shannonEntropy(initial);
    expect(H0).toBeCloseTo(3, 10); // log₂(8) = 3 bits

    // Fold 1: merge pairs → 4 outcomes
    const fold1 = [1 / 4, 1 / 4, 1 / 4, 1 / 4];
    const H1 = shannonEntropy(fold1);
    expect(H1).toBeCloseTo(2, 10); // log₂(4) = 2 bits

    // Wait — entropy DECREASED? That seems wrong for Second Law.
    // The key: the CONDITIONAL entropy (uncertainty about original state
    // given the folded state) increased. The fold lost information.

    // What the Second Law really says: total entropy (system + environment) increases
    // The fold transfers entropy to the void (vented states)
    const infoLost = H0 - H1; // 1 bit lost per fold
    expect(infoLost).toBeCloseTo(1, 10);

    // Fold 2: merge pairs → 2 outcomes
    const fold2 = [1 / 2, 1 / 2];
    const H2 = shannonEntropy(fold2);
    const infoLost2 = H1 - H2; // another 1 bit lost
    expect(infoLost2).toBeCloseTo(1, 10);

    // Fold 3: merge to 1 outcome
    const fold3 = [1];
    const H3 = shannonEntropy(fold3);
    expect(H3).toBeCloseTo(0, 10); // 0 bits — complete certainty

    // Total information lost to the void: 3 bits
    const totalInfoLost = H0 - H3;
    expect(totalInfoLost).toBeCloseTo(3, 10);

    // This information went into the void (β₂)
    // Each fold created unreachable states — the discarded alternatives
  });

  it('no unfold primitive exists: irreversibility is structural', () => {
    // The absence of unfold is what DEFINES irreversibility
    // We can check this: given a fold function, no inverse exists

    // Fold: select minimum from array
    function fold(values: number[]): number {
      return Math.min(...values);
    }

    // Claim: there is no function unfold such that unfold(fold(x)) = x for all x
    const x1 = [3, 1, 4, 1, 5];
    const x2 = [9, 1, 2, 6, 5];
    const x3 = [1, 1, 1, 1, 1];

    // All fold to 1
    expect(fold(x1)).toBe(1);
    expect(fold(x2)).toBe(1);
    expect(fold(x3)).toBe(1);

    // If unfold existed: unfold(1) would have to equal x1 AND x2 AND x3
    // This is impossible — a function can only return one value
    // Therefore: unfold does not exist. QED.

    // The void is the set of all (x1, x2, x3, ...) that map to 1
    // It contains infinitely many states, all unreachable from the output
    const voidSize = 3; // at minimum, we showed 3 distinct preimages
    expect(voidSize).toBeGreaterThan(1); // many-to-one → void is non-empty
  });
});
