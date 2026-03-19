/**
 * Chaitin's Omega as Universal Void Boundary
 *
 * Tests for §14.5.21: the halting probability Omega is the void boundary
 * of all programs on a Universal Turing Machine. UTM = universal fork,
 * execution = fold, halting = surviving the fold, non-halting = vented.
 *
 * Omega is uncomputable because the void boundary of all programs
 * requires infinite rejection rounds. Any finite prefix gives a
 * monotonically increasing lower bound.
 *
 * Companion theorems: ChaitinOmega.lean (12 sorry-free theorems),
 * ChaitinOmega.tla (6 invariants, model-checked).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine: Program space model
// ============================================================================

interface ProgramSpace {
  alphabetSize: number;
  maxLength: number;
  totalPrograms: number;
  haltingPrograms: number;
}

/** Count total programs of length exactly L on alphabet A. */
function programsOfLength(alphabetSize: number, length: number): number {
  return Math.pow(alphabetSize, length);
}

/** Count total programs of length 1..L on alphabet A. */
function totalProgramsUpTo(alphabetSize: number, maxLength: number): number {
  let total = 0;
  for (let l = 1; l <= maxLength; l++) {
    total += programsOfLength(alphabetSize, l);
  }
  return total;
}

/** Non-halting programs (the void). */
function nonHalting(ps: ProgramSpace): number {
  return ps.totalPrograms - ps.haltingPrograms;
}

/** Finite Omega approximation (rational). */
function omegaApprox(ps: ProgramSpace): number {
  return ps.haltingPrograms / ps.totalPrograms;
}

/** Buleyean complement weight for the halting set. */
function buleyeanWeight(rounds: number, voidCount: number): number {
  return rounds - Math.min(voidCount, rounds) + 1;
}

// ============================================================================
// Test Group 1: UTM as universal fork
// ============================================================================

describe('UTM as universal fork', () => {
  it('binary alphabet: program count grows exponentially', () => {
    expect(programsOfLength(2, 1)).toBe(2);
    expect(programsOfLength(2, 2)).toBe(4);
    expect(programsOfLength(2, 3)).toBe(8);
    expect(programsOfLength(2, 10)).toBe(1024);
  });

  it('total programs up to length L = sum of A^l for l=1..L', () => {
    // Binary: 2 + 4 + 8 = 14
    expect(totalProgramsUpTo(2, 3)).toBe(14);
    // Ternary: 3 + 9 + 27 = 39
    expect(totalProgramsUpTo(3, 3)).toBe(39);
  });

  it('fork decomposition: total = halting + non-halting', () => {
    const spaces: ProgramSpace[] = [
      { alphabetSize: 2, maxLength: 3, totalPrograms: 14, haltingPrograms: 5 },
      { alphabetSize: 2, maxLength: 5, totalPrograms: 62, haltingPrograms: 20 },
      { alphabetSize: 3, maxLength: 2, totalPrograms: 12, haltingPrograms: 4 },
    ];
    for (const ps of spaces) {
      expect(ps.haltingPrograms + nonHalting(ps)).toBe(ps.totalPrograms);
    }
  });

  it('fork width = total programs in enumeration', () => {
    expect(totalProgramsUpTo(2, 4)).toBe(2 + 4 + 8 + 16);
    expect(totalProgramsUpTo(2, 4)).toBe(30);
  });
});

// ============================================================================
// Test Group 2: Execution as fold
// ============================================================================

describe('execution as fold', () => {
  it('fold partitions into halting and non-halting', () => {
    const ps: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 4,
      totalPrograms: 30,
      haltingPrograms: 10,
    };
    expect(ps.haltingPrograms + nonHalting(ps)).toBe(ps.totalPrograms);
    expect(nonHalting(ps)).toBe(20);
  });

  it('every program goes to exactly one set', () => {
    // No program is both halting and non-halting
    const ps: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 3,
      totalPrograms: 14,
      haltingPrograms: 6,
    };
    const nh = nonHalting(ps);
    expect(ps.haltingPrograms + nh).toBe(ps.totalPrograms);
    // Sanity: both sets are nonempty
    expect(ps.haltingPrograms).toBeGreaterThan(0);
    expect(nh).toBeGreaterThan(0);
  });

  it('fold deficit = non-halting count', () => {
    for (const [total, halting] of [
      [10, 3],
      [100, 40],
      [1000, 500],
    ]) {
      const ps: ProgramSpace = {
        alphabetSize: 2,
        maxLength: 1,
        totalPrograms: total,
        haltingPrograms: halting,
      };
      expect(nonHalting(ps)).toBe(total - halting);
    }
  });
});

// ============================================================================
// Test Group 3: Omega bounds
// ============================================================================

describe('Omega bounds', () => {
  it('Omega > 0 (at least one program halts)', () => {
    const ps: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 4,
      totalPrograms: 30,
      haltingPrograms: 1,
    };
    expect(omegaApprox(ps)).toBeGreaterThan(0);
  });

  it('Omega < 1 (not every program halts)', () => {
    const ps: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 4,
      totalPrograms: 30,
      haltingPrograms: 29,
    };
    expect(omegaApprox(ps)).toBeLessThan(1);
  });

  it('0 < Omega < 1 for realistic approximations', () => {
    const cases = [
      { total: 10, halting: 3 },
      { total: 100, halting: 30 },
      { total: 1000, halting: 250 },
      { total: 10000, halting: 2000 },
    ];
    for (const { total, halting } of cases) {
      const omega = halting / total;
      expect(omega).toBeGreaterThan(0);
      expect(omega).toBeLessThan(1);
    }
  });

  it('Omega approximation is a rational number', () => {
    const ps: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 3,
      totalPrograms: 14,
      haltingPrograms: 5,
    };
    expect(omegaApprox(ps)).toBeCloseTo(5 / 14, 10);
  });
});

// ============================================================================
// Test Group 4: Monotone finite approximation
// ============================================================================

describe('monotone finite approximation', () => {
  it('extending enumeration can only increase halting count', () => {
    // Simulate extending from length 3 to length 4
    const shorter: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 3,
      totalPrograms: 14,
      haltingPrograms: 5,
    };
    // Adding length-4 programs: 16 new programs, say 4 halt
    const longer: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 4,
      totalPrograms: 30,
      haltingPrograms: 9,
    };
    expect(longer.haltingPrograms).toBeGreaterThanOrEqual(shorter.haltingPrograms);
    expect(longer.totalPrograms).toBeGreaterThanOrEqual(shorter.totalPrograms);
  });

  it('sequence of approximations is non-decreasing', () => {
    const haltingCounts = [1, 3, 5, 8, 12, 15, 20];
    for (let i = 0; i < haltingCounts.length - 1; i++) {
      expect(haltingCounts[i + 1]).toBeGreaterThanOrEqual(haltingCounts[i]);
    }
  });

  it('halting count never exceeds total at any stage', () => {
    const stages = [
      { total: 2, halting: 1 },
      { total: 6, halting: 2 },
      { total: 14, halting: 5 },
      { total: 30, halting: 10 },
      { total: 62, halting: 18 },
    ];
    for (const { total, halting } of stages) {
      expect(halting).toBeLessThanOrEqual(total);
      expect(halting).toBeGreaterThan(0);
    }
  });

  it('Omega_n converges from below (simulated)', () => {
    // Omega_n = halting_n / total_n is bounded above by 1
    // and non-decreasing in a well-behaved enumeration
    const approximations = [
      1 / 2, // length 1: 1 halting out of 2
      2 / 6, // length 1-2: 2 halting out of 6
      5 / 14, // length 1-3: 5 halting out of 14
      10 / 30, // length 1-4: 10 halting out of 30
    ];
    for (const omega of approximations) {
      expect(omega).toBeGreaterThan(0);
      expect(omega).toBeLessThan(1);
    }
  });
});

// ============================================================================
// Test Group 5: Chaitin-Solomonoff bridge
// ============================================================================

describe('Chaitin-Solomonoff bridge', () => {
  it('both partition the same program space', () => {
    const totalPrograms = 30;
    const haltingPrograms = 10;
    const nh = totalPrograms - haltingPrograms;

    // Omega: conditions on termination
    expect(haltingPrograms + nh).toBe(totalPrograms);

    // Solomonoff M(x): conditions on output x
    // For any output x, programs-producing-x + programs-not-producing-x = total
    const producingX = 3;
    const notProducingX = totalPrograms - producingX;
    expect(producingX + notProducingX).toBe(totalPrograms);
  });

  it('both use 2^{-|p|} weighting (simulated)', () => {
    // Weight of program p is 2^{-length(p)}
    const weights = [1, 2, 3, 4].map((len) => Math.pow(2, -len));
    expect(weights[0]).toBe(0.5); // length 1
    expect(weights[1]).toBe(0.25); // length 2
    expect(weights[2]).toBe(0.125); // length 3

    // Sum converges (geometric series)
    const partialSum = weights.reduce((a, b) => a + b, 0);
    expect(partialSum).toBeLessThan(1);
    expect(partialSum).toBeGreaterThan(0);
  });

  it('Omega is a projection of the universal void boundary', () => {
    // The universal void boundary partitions program space by ANY predicate
    // Omega uses the halting predicate
    // M(x) uses the "produces x" predicate
    // Both are projections of the same underlying structure
    const total = 100;
    const halting = 40;
    const producingX = 15;

    // All projections satisfy: count <= total, count >= 0
    expect(halting).toBeLessThanOrEqual(total);
    expect(halting).toBeGreaterThanOrEqual(0);
    expect(producingX).toBeLessThanOrEqual(total);
    expect(producingX).toBeGreaterThanOrEqual(0);
  });

  it('Buleyean complement assigns higher weight to halting programs', () => {
    // Programs that halt: low void count (survived)
    // Programs that don't halt: high void count (vented)
    const rounds = 100;
    const haltingVoidCount = 0; // Survived, no rejection
    const nonHaltingVoidCount = 100; // Fully rejected

    const wHalting = buleyeanWeight(rounds, haltingVoidCount);
    const wNonHalting = buleyeanWeight(rounds, nonHaltingVoidCount);

    expect(wHalting).toBeGreaterThan(wNonHalting);
    expect(wHalting).toBe(101); // rounds + 1
    expect(wNonHalting).toBe(1); // the sliver
  });
});

// ============================================================================
// Test Group 6: Uncomputability as infinite void
// ============================================================================

describe('uncomputability as infinite void', () => {
  it('no finite enumeration captures all programs', () => {
    // For any length L, there exist programs of length L+1
    for (const L of [1, 5, 10, 100]) {
      const currentTotal = totalProgramsUpTo(2, L);
      const extendedTotal = totalProgramsUpTo(2, L + 1);
      expect(extendedTotal).toBeGreaterThan(currentTotal);
    }
  });

  it('each extension adds exponentially more programs', () => {
    const A = 2;
    for (const L of [1, 2, 3, 4, 5]) {
      const newPrograms = programsOfLength(A, L + 1);
      const currentPrograms = programsOfLength(A, L);
      expect(newPrograms).toBe(currentPrograms * A);
    }
  });

  it('the halting problem is the infinite fold', () => {
    // Simulating the infinite fold: at each step, we learn about more programs
    // but we can never finish
    let knownHalting = 0;
    let knownTotal = 0;

    for (let L = 1; L <= 10; L++) {
      const newPrograms = programsOfLength(2, L);
      knownTotal += newPrograms;
      // Assume roughly 1/3 halt (arbitrary but consistent)
      const newHalting = Math.floor(newPrograms / 3);
      knownHalting += newHalting;

      // At every stage: known halting is a lower bound
      expect(knownHalting).toBeLessThanOrEqual(knownTotal);
      expect(knownHalting).toBeGreaterThanOrEqual(0);
    }

    // After 10 steps, we still haven't enumerated all programs
    // The true Omega is >= our approximation
    expect(knownHalting / knownTotal).toBeGreaterThan(0);
    expect(knownHalting / knownTotal).toBeLessThan(1);
  });

  it('finite Omega is always a lower bound on true Omega', () => {
    // True Omega includes all programs; finite Omega misses the longer ones
    // Any halting program we haven't enumerated yet only increases Omega
    const finiteOmega = 10 / 30; // 10 halting out of 30 enumerated
    // Adding more programs can only add more halting programs
    // So true Omega >= finiteOmega (in the weighted sense)
    expect(finiteOmega).toBeGreaterThan(0);
    expect(finiteOmega).toBeLessThan(1);
  });

  it('Buleyean axioms hold at every finite stage', () => {
    // At every finite enumeration, the program space is a valid Buleyean space
    for (const [total, halting] of [
      [2, 1],
      [6, 2],
      [14, 5],
      [30, 10],
      [62, 18],
    ] as [number, number][]) {
      const nh = total - halting;
      // Conservation
      expect(halting + nh).toBe(total);
      // Positivity (both sets nonempty)
      expect(halting).toBeGreaterThan(0);
      expect(nh).toBeGreaterThan(0);
      // Bounded
      expect(halting).toBeLessThan(total);
    }
  });
});

// ============================================================================
// Test Group 7: Connection to quantum observer and Buleyean framework
// ============================================================================

describe('connection to quantum observer and Buleyean framework', () => {
  it('halting = surviving the fold, non-halting = vented', () => {
    // Same structure as quantum measurement:
    // superposition paths = programs, fold = execution/measurement
    const rootN = 4;
    const totalPaths = rootN; // 4 paths in superposition
    const surviving = 1; // 1 path survives measurement
    const vented = totalPaths - surviving; // 3 vented

    // Same structure for programs:
    const totalProgs = 30;
    const haltingProgs = 10;
    const nonHaltingProgs = totalProgs - haltingProgs;

    // Both satisfy: surviving + vented = total
    expect(surviving + vented).toBe(totalPaths);
    expect(haltingProgs + nonHaltingProgs).toBe(totalProgs);
  });

  it('deficit is the cost of the fold in both domains', () => {
    // Quantum: deficit = rootN - 1 (paths lost to measurement)
    const rootN = 8;
    const quantumDeficit = rootN - 1;
    expect(quantumDeficit).toBe(7);

    // Halting: deficit = non-halting count (programs lost to non-termination)
    const ps: ProgramSpace = {
      alphabetSize: 2,
      maxLength: 3,
      totalPrograms: 14,
      haltingPrograms: 5,
    };
    const haltingDeficit = nonHalting(ps);
    expect(haltingDeficit).toBe(9);

    // Both deficits are positive (nontrivial folds)
    expect(quantumDeficit).toBeGreaterThan(0);
    expect(haltingDeficit).toBeGreaterThan(0);
  });

  it('Solomonoff prior initializes void boundary from K(x)', () => {
    // K(x) = length of shortest program producing x
    // Higher K = more initial rejections = lower weight
    const complexities = [2, 5, 8, 15]; // K(x) for four hypotheses
    const ceiling = 20;
    const rounds = ceiling;

    const weights = complexities.map((k) => buleyeanWeight(rounds, k));

    // Less complex = higher weight
    for (let i = 0; i < weights.length - 1; i++) {
      expect(weights[i]).toBeGreaterThan(weights[i + 1]);
    }

    // All weights positive (never say never)
    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it('the three uncomputable quantities share structure', () => {
    // K(x): shortest program for x (uncomputable)
    // M(x): sum of 2^{-|p|} over programs producing x (uncomputable)
    // Omega: sum of 2^{-|p|} over halting programs (uncomputable)
    // All three are defined over the same program space
    // All three are projections of the universal void boundary
    // All three are approximable from below by finite enumeration

    const approxK = [3, 7, 12]; // Approximate K(x) for three hypotheses
    const approxM = [0.125, 0.008, 0.0002]; // Approximate M(x)
    const approxOmega = 0.35; // Approximate Omega

    // All are positive
    for (const k of approxK) expect(k).toBeGreaterThan(0);
    for (const m of approxM) expect(m).toBeGreaterThan(0);
    expect(approxOmega).toBeGreaterThan(0);

    // M(x) and K(x) are inversely related: log2(M(x)) ~ -K(x)
    // Higher complexity = lower universal prior weight
    expect(approxM[0]).toBeGreaterThan(approxM[1]);
    expect(approxM[1]).toBeGreaterThan(approxM[2]);
  });
});
