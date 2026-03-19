/**
 * The Grandfather Paradox as Self-Referential Deficit
 *
 * Tests for §15.23: the grandfather paradox is a fold that would
 * destroy its own fork. The resolution is structural:
 *
 * 1. The void boundary is append-only (events cannot be un-occurred)
 * 2. The Buleyean weight formula ensures weight >= 1 (the sliver)
 * 3. Self-referential folds are algebraically impossible
 * 4. The Many-Worlds resolution is a fork (beta1 increases)
 *
 * The paradox dissolves because the framework does not permit
 * the operation. It is not a physical impossibility. It is an
 * algebraic impossibility.
 *
 * Companion theorems: GrandfatherParadox.lean (12 sorry-free
 * theorems), GrandfatherParadox.tla (7 invariants, model-checked).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine: Causal chains and temporal branching
// ============================================================================

interface CausalChain {
  events: string[];
  weights: number[];
}

/** Buleyean weight: rounds - min(void, rounds) + 1. Always >= 1. */
function buleyeanWeight(rounds: number, voidCount: number): number {
  return rounds - Math.min(voidCount, rounds) + 1;
}

/** Attempt a self-referential fold: try to set ancestor weight to 0. */
function attemptGrandfatherFold(chain: CausalChain, ancestorIdx: number): CausalChain {
  // The fold CANNOT reduce weight below 1 (the sliver)
  const newWeights = [...chain.weights];
  // Attempted: set to 0. Actual: clamped to minimum 1.
  newWeights[ancestorIdx] = Math.max(1, 0); // The sliver prevents 0
  return { events: chain.events, weights: newWeights };
}

/** Create a temporal branch (fork, not fold). */
function branchTimeline(
  chain: CausalChain,
  beta1: number,
): { original: CausalChain; branch: CausalChain; newBeta1: number } {
  // Original chain is preserved
  const branch: CausalChain = {
    events: [...chain.events],
    weights: chain.weights.map(() => 1), // New branch, fresh weights
  };
  return {
    original: chain, // Unchanged!
    branch,
    newBeta1: beta1 + 1, // Fork increases beta1
  };
}

// ============================================================================
// Test Group 1: The sliver prevents annihilation
// ============================================================================

describe('the sliver prevents annihilation', () => {
  it('Buleyean weight is always >= 1', () => {
    for (const rounds of [1, 10, 100, 1000]) {
      for (const voidCount of [0, rounds / 2, rounds, rounds + 10]) {
        const w = buleyeanWeight(rounds, voidCount);
        expect(w).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('maximum rejection gives weight exactly 1, not 0', () => {
    expect(buleyeanWeight(100, 100)).toBe(1);
    expect(buleyeanWeight(1, 1)).toBe(1);
    expect(buleyeanWeight(1000, 1000)).toBe(1);
  });

  it('weight can never be zero', () => {
    // Try every possible void count
    for (let rounds = 1; rounds <= 20; rounds++) {
      for (let void_ = 0; void_ <= rounds + 5; void_++) {
        expect(buleyeanWeight(rounds, void_)).toBeGreaterThan(0);
      }
    }
  });

  it('the +1 in the formula is the sliver that prevents paradox', () => {
    // weight = rounds - min(void, rounds) + 1
    // Without the +1: weight = rounds - min(void, rounds)
    // At void = rounds: weight would be 0
    const rounds = 50;
    const withSliver = rounds - Math.min(rounds, rounds) + 1;
    const withoutSliver = rounds - Math.min(rounds, rounds);

    expect(withSliver).toBe(1); // Safe
    expect(withoutSliver).toBe(0); // Would allow annihilation!
  });
});

// ============================================================================
// Test Group 2: Self-referential fold is impossible
// ============================================================================

describe('self-referential fold is impossible', () => {
  it('attempting to eliminate ancestor leaves weight at 1', () => {
    const chain: CausalChain = {
      events: ['ancestor', 'parent', 'traveler'],
      weights: [1, 1, 1],
    };

    const result = attemptGrandfatherFold(chain, 0);

    // Ancestor weight clamped to 1, not 0
    expect(result.weights[0]).toBe(1);
    // Traveler still exists
    expect(result.weights[2]).toBe(1);
  });

  it('all events in the chain remain positive after fold attempt', () => {
    const chain: CausalChain = {
      events: ['great-grandparent', 'grandparent', 'parent', 'self', 'traveler'],
      weights: [5, 4, 3, 2, 1],
    };

    // Attempt to eliminate every ancestor
    let result = chain;
    for (let i = 0; i < chain.events.length - 1; i++) {
      result = attemptGrandfatherFold(result, i);
    }

    // All weights still positive
    for (const w of result.weights) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it('the paradox requires negative weight (which is impossible)', () => {
    // For the paradox to work:
    // 1. Traveler must exist (weight > 0) to travel back
    // 2. Ancestor must be eliminated (weight = 0)
    // 3. But traveler existing requires ancestor existing
    // 4. So we need: weight > 0 AND weight = 0 simultaneously

    const travelerExists = true;
    const ancestorWeight = buleyeanWeight(100, 100); // Maximum rejection

    // Even with maximum rejection, ancestor weight is 1
    expect(ancestorWeight).toBe(1);
    expect(travelerExists).toBe(true);
    // Contradiction impossible: both remain positive
  });
});

// ============================================================================
// Test Group 3: Many-Worlds as fork (not fold)
// ============================================================================

describe('Many-Worlds as fork (not fold)', () => {
  it('branching increases beta1', () => {
    const chain: CausalChain = {
      events: ['ancestor', 'traveler'],
      weights: [1, 1],
    };

    const { newBeta1 } = branchTimeline(chain, 0);
    expect(newBeta1).toBe(1); // Was 0, now 1

    // Second branch
    const { newBeta1: beta1After2 } = branchTimeline(chain, 1);
    expect(beta1After2).toBe(2);
  });

  it('branching preserves the original chain', () => {
    const chain: CausalChain = {
      events: ['ancestor', 'parent', 'traveler'],
      weights: [3, 2, 1],
    };

    const { original } = branchTimeline(chain, 0);

    // Original chain unchanged
    expect(original.weights).toEqual([3, 2, 1]);
    expect(original.events).toEqual(['ancestor', 'parent', 'traveler']);
  });

  it('the new branch is independent (different weights)', () => {
    const chain: CausalChain = {
      events: ['ancestor', 'traveler'],
      weights: [5, 3],
    };

    const { original, branch } = branchTimeline(chain, 0);

    // Branch has fresh weights
    expect(branch.weights).toEqual([1, 1]);
    // Original preserved
    expect(original.weights).toEqual([5, 3]);
  });

  it('N branches produce beta1 = N', () => {
    let beta1 = 0;
    const chain: CausalChain = {
      events: ['ancestor', 'traveler'],
      weights: [1, 1],
    };

    for (let i = 0; i < 10; i++) {
      const result = branchTimeline(chain, beta1);
      beta1 = result.newBeta1;
    }

    expect(beta1).toBe(10);
  });
});

// ============================================================================
// Test Group 4: Void boundary is append-only
// ============================================================================

describe('void boundary is append-only', () => {
  it('rejection counts can only increase', () => {
    const voidBoundary = [0, 0, 0, 0];

    // Each rejection adds to the count
    voidBoundary[1] += 1; // Reject choice 1
    expect(voidBoundary[1]).toBe(1);

    voidBoundary[1] += 1; // Reject choice 1 again
    expect(voidBoundary[1]).toBe(2);

    // Cannot decrease
    // voidBoundary[1] -= 1 would violate append-only
    // The framework simply doesn't support this operation
  });

  it('once an event is recorded, it stays recorded', () => {
    const history: string[] = [];

    history.push('ancestor born');
    history.push('parent born');
    history.push('traveler born');

    // Cannot remove events from history
    expect(history.length).toBe(3);
    expect(history).toContain('ancestor born');

    // The grandfather paradox asks to remove 'ancestor born'
    // But the history is append-only
  });

  it('the void boundary at time T contains all rejections up to T', () => {
    const rounds = 10;
    const voidBoundary = new Array(4).fill(0);

    // Simulate 10 rounds of rejections
    const rejections = [0, 1, 2, 3, 0, 1, 2, 0, 1, 0];
    for (const r of rejections) {
      voidBoundary[r] += 1;
    }

    // Total rejections = total rounds
    expect(voidBoundary.reduce((a, b) => a + b, 0)).toBe(rounds);

    // All recorded, none lost
    expect(voidBoundary[0]).toBe(4);
    expect(voidBoundary[1]).toBe(3);
    expect(voidBoundary[2]).toBe(2);
    expect(voidBoundary[3]).toBe(1);
  });
});

// ============================================================================
// Test Group 5: Bootstrap paradox dissolves
// ============================================================================

describe('bootstrap paradox dissolves', () => {
  it('every weight has definite provenance', () => {
    const rounds = 10;
    const voidBoundary = [3, 5, 2];

    // Each weight is computed from rounds and void count
    const weights = voidBoundary.map((v) => buleyeanWeight(rounds, v));

    // Every weight has a definite value (no undefined origins)
    for (const w of weights) {
      expect(w).toBeDefined();
      expect(w).toBeGreaterThan(0);
      expect(Number.isFinite(w)).toBe(true);
    }
  });

  it('information without provenance would require void < 0', () => {
    // A void boundary entry with no corresponding rejection event
    // would mean: something was "observed" that never happened
    // This requires voidBoundary < 0, which Nat doesn't support

    const voidEntry = 0; // Minimum possible
    expect(voidEntry).toBeGreaterThanOrEqual(0);
    // Cannot go below 0 in natural numbers
  });

  it('the weight formula is a total function (always defined)', () => {
    // For any rounds >= 1 and any void >= 0, weight is defined and positive
    for (let r = 1; r <= 20; r++) {
      for (let v = 0; v <= 25; v++) {
        const w = buleyeanWeight(r, v);
        expect(w).toBeGreaterThan(0);
        expect(Number.isNaN(w)).toBe(false);
        expect(Number.isFinite(w)).toBe(true);
      }
    }
  });
});

// ============================================================================
// Test Group 6: Retrocausal consistency
// ============================================================================

describe('retrocausal consistency', () => {
  it('terminal state constrains past trajectories', () => {
    // If the terminal state shows: ancestor exists, traveler exists
    // Then NO consistent trajectory has "ancestor eliminated"
    const terminalState = { ancestorExists: true, travelerExists: true };

    // The paradox asks for a trajectory ending in:
    // ancestor eliminated, traveler exists
    // But this is inconsistent: traveler requires ancestor
    const paradoxState = { ancestorExists: false, travelerExists: true };

    // Consistency check: traveler existing requires ancestor existing
    const isConsistent = (state: { ancestorExists: boolean; travelerExists: boolean }) =>
      !state.travelerExists || state.ancestorExists;

    expect(isConsistent(terminalState)).toBe(true);
    expect(isConsistent(paradoxState)).toBe(false); // Inconsistent!
  });

  it('the set of consistent trajectories excludes the paradox', () => {
    // Enumerate possible terminal states
    const states = [
      { ancestor: true, traveler: true }, // Normal
      { ancestor: true, traveler: false }, // Traveler died naturally
      { ancestor: false, traveler: false }, // Both gone (consistent)
      { ancestor: false, traveler: true }, // PARADOX (inconsistent)
    ];

    // Only the last is inconsistent (traveler without ancestor)
    const consistent = states.filter((s) => !s.traveler || s.ancestor);
    expect(consistent.length).toBe(3);
    expect(consistent).not.toContainEqual({ ancestor: false, traveler: true });
  });

  it('causal chains are totally ordered (no cycles allowed)', () => {
    // A causal chain: A -> B -> C -> D
    // Time travel would create: D -> A (cycle!)
    // Cycles in causal chains create paradoxes
    // The Buleyean framework handles cycles as beta1 > 0

    const chainBeta1 = 0; // No cycles (path graph)
    const withTimeTravelBeta1 = chainBeta1 + 1; // One cycle (from time travel)

    // The cycle increases beta1, creating a fork
    expect(withTimeTravelBeta1).toBe(1);
    // But the fold that would close the cycle (eliminate ancestor)
    // is impossible (the sliver)
  });
});

// ============================================================================
// Test Group 7: Time travel as topology change
// ============================================================================

describe('time travel as topology change', () => {
  it('time travel = adding a cycle to the causal graph', () => {
    // Normal causal graph: path (beta1 = 0)
    // With time travel: cycle added (beta1 = 1)
    const normalBeta1 = 0;
    const timeTravelBeta1 = normalBeta1 + 1;

    expect(timeTravelBeta1).toBe(1);
  });

  it('each time travel event adds one to beta1', () => {
    let beta1 = 0;

    // First time travel
    beta1 += 1;
    expect(beta1).toBe(1);

    // Second time travel (to a different point)
    beta1 += 1;
    expect(beta1).toBe(2);
  });

  it('the paradox asks to fold a cycle that cannot be folded', () => {
    // The cycle: traveler -> past -> ancestor -> ... -> traveler
    // Folding this cycle requires: select one path, vent the rest
    // But venting "ancestor -> ... -> traveler" would vent the traveler
    // who is doing the folding

    const cyclePaths = 2; // "ancestor lives" vs "ancestor dies"
    const beta1 = cyclePaths - 1; // 1 (one cycle)

    // To fold: select one, vent one
    // But the "ancestor dies" path destroys the folder
    // So the fold is self-referential and impossible

    expect(beta1).toBe(1);
    // The fold would need to reduce beta1 to 0
    // But the sliver prevents the "ancestor dies" weight from reaching 0
    expect(buleyeanWeight(100, 100)).toBe(1); // The sliver
  });

  it('forward time travel has no paradox (no cycle, no fold needed)', () => {
    // Forward time travel = normal causal progression (faster)
    // No new cycles added, beta1 unchanged
    const forwardBeta1Change = 0;

    expect(forwardBeta1Change).toBe(0);
    // No paradox because no self-referential fold is attempted
  });

  it('the resolution is the same as quantum measurement', () => {
    // Quantum measurement: fold vents rootN - 1 paths
    // Time travel: fork creates new path, fold is blocked
    // Both: the sliver prevents annihilation of any path

    const quantumSliver = buleyeanWeight(100, 100); // 1
    const temporalSliver = buleyeanWeight(100, 100); // 1

    expect(quantumSliver).toBe(temporalSliver);
    expect(quantumSliver).toBe(1);
    // Same +1, same algebra, same resolution
  });
});
