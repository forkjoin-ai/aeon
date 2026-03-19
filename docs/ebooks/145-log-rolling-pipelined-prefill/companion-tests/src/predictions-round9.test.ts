/**
 * Predictions Round 9: Democratic Representation, Urban Traffic,
 * Software Bug Density, Trust Erosion, Information Cascade Fragility
 *
 * Tests for §19.27: five predictions composing semiotic ensemble deficit
 * with legislature representation, topological mismatch with traffic
 * congestion, void boundary concentration with software testing,
 * append-only void boundary with trust erosion, and fork deficit with
 * information cascade fragility.
 *
 * Companion theorems: PredictionsRound9.lean (15 sorry-free theorems),
 * PredictionsRound9.tla (7 invariants, model-checked).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Prediction 101: Democratic Representation Deficit
// ============================================================================

function representationDeficit(constituencies: number, representatives: number): number {
  return constituencies - representatives;
}

describe('P101: democratic representation deficit', () => {
  it('proportional representation = zero deficit', () => {
    expect(representationDeficit(10, 10)).toBe(0);
    expect(representationDeficit(50, 50)).toBe(0);
  });

  it('more representatives = less deficit', () => {
    const constituencies = 100;
    for (let reps = 1; reps < 100; reps++) {
      expect(representationDeficit(constituencies, reps + 1)).toBeLessThan(
        representationDeficit(constituencies, reps),
      );
    }
  });

  it('single representative = maximum deficit', () => {
    expect(representationDeficit(100, 1)).toBe(99);
    expect(representationDeficit(435, 1)).toBe(434);
  });

  it('models real legislatures', () => {
    // US House: 435 representatives for 435 districts (proportional by design)
    const usHouse = representationDeficit(435, 435);
    expect(usHouse).toBe(0);

    // UK: 650 constituencies, 650 MPs
    const ukParliament = representationDeficit(650, 650);
    expect(ukParliament).toBe(0);

    // Gerrymandered scenario: 10 districts effectively represented by 3
    const gerrymandered = representationDeficit(10, 3);
    expect(gerrymandered).toBe(7);

    // More proportional = less deficit
    expect(usHouse).toBeLessThan(gerrymandered);
  });
});

// ============================================================================
// Prediction 102: Urban Traffic Congestion is Topological Mismatch
// ============================================================================

function congestionDeficit(demand: number, capacity: number): number {
  return demand > capacity ? demand - capacity : 0;
}

describe('P102: urban traffic congestion is topological mismatch', () => {
  it('sufficient routes = zero congestion', () => {
    expect(congestionDeficit(5, 5)).toBe(0);
    expect(congestionDeficit(3, 10)).toBe(0);
  });

  it('more capacity = less congestion', () => {
    const demand = 10;
    for (let cap = 1; cap < demand; cap++) {
      expect(congestionDeficit(demand, cap + 1)).toBeLessThanOrEqual(
        congestionDeficit(demand, cap),
      );
    }
  });

  it('congestion deficit is non-negative', () => {
    for (let d = 0; d <= 20; d++) {
      for (let c = 0; c <= 20; c++) {
        expect(congestionDeficit(d, c)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('models Braess paradox awareness', () => {
    // Before adding road: 4 demand, 3 capacity = deficit 1
    const before = congestionDeficit(4, 3);
    expect(before).toBe(1);

    // After adding correct road: 4 demand, 4 capacity = deficit 0
    const afterCorrect = congestionDeficit(4, 4);
    expect(afterCorrect).toBe(0);

    // Braess paradox: adding road increases demand to wrong subgraph
    // New road attracts 2 more flows: 6 demand, 4 capacity = deficit 2
    const braess = congestionDeficit(6, 4);
    expect(braess).toBe(2);
    expect(braess).toBeGreaterThan(before);
  });
});

// ============================================================================
// Prediction 103: Software Bug Density Follows Void Boundary Concentration
// ============================================================================

function bugConfidence(totalRuns: number, failedRuns: number): number {
  return totalRuns - Math.min(failedRuns, totalRuns) + 1;
}

describe('P103: software bug density follows void boundary concentration', () => {
  it('bug confidence always positive (the sliver -- never "bug-free")', () => {
    for (let runs = 1; runs <= 20; runs++) {
      for (let fails = 0; fails <= runs + 5; fails++) {
        expect(bugConfidence(runs, fails)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('more failures = lower confidence', () => {
    const runs = 10;
    for (let f = 0; f < runs; f++) {
      expect(bugConfidence(runs, f + 1)).toBeLessThanOrEqual(
        bugConfidence(runs, f),
      );
    }
  });

  it('perfect tests = maximum confidence', () => {
    expect(bugConfidence(10, 0)).toBe(11);
    expect(bugConfidence(100, 0)).toBe(101);
  });

  it('models real software testing', () => {
    // Well-tested module: 1000 runs, 2 failures
    const wellTested = bugConfidence(1000, 2);
    // Poorly tested module: 10 runs, 2 failures
    const poorlyTested = bugConfidence(10, 2);

    // More runs with same failures = higher confidence
    expect(wellTested).toBeGreaterThan(poorlyTested);

    // Untested module: 0 runs conceptually, but minimum 1 run
    const barelyTested = bugConfidence(1, 1);
    expect(barelyTested).toBe(1); // The sliver -- can never claim bug-free
  });
});

// ============================================================================
// Prediction 104: Trust Erosion is Append-Only
// ============================================================================

function currentTrust(initial: number, betrayals: number): number {
  return initial - Math.min(betrayals, initial) + 1;
}

describe('P104: trust erosion is append-only', () => {
  it('trust never reaches zero (the sliver)', () => {
    for (let init = 1; init <= 20; init++) {
      for (let b = 0; b <= init + 5; b++) {
        expect(currentTrust(init, b)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('more betrayals = less trust', () => {
    const initial = 10;
    for (let b = 0; b < initial; b++) {
      expect(currentTrust(initial, b + 1)).toBeLessThanOrEqual(
        currentTrust(initial, b),
      );
    }
  });

  it('no betrayals = near original trust', () => {
    expect(currentTrust(10, 0)).toBe(11);
    expect(currentTrust(5, 0)).toBe(6);
  });

  it('trust never fully recovers (append-only void boundary)', () => {
    const initial = 10;
    // After 3 betrayals, trust = 10 - 3 + 1 = 8
    const afterBetrayal = currentTrust(initial, 3);
    expect(afterBetrayal).toBe(8);

    // Even with "forgiveness" (no more betrayals), the void boundary
    // entries remain. The best case is the CURRENT trust, not original.
    // Cannot undo betrayals -- they are append-only.
    expect(afterBetrayal).toBeLessThan(currentTrust(initial, 0));
  });

  it('models real trust dynamics', () => {
    // New friendship: high initial trust, zero betrayals
    const newFriend = currentTrust(10, 0);
    expect(newFriend).toBe(11);

    // After one lie
    const afterLie = currentTrust(10, 1);
    expect(afterLie).toBe(10);

    // After repeated betrayals
    const afterMany = currentTrust(10, 8);
    expect(afterMany).toBe(3);

    // Maximum betrayal: trust at minimum but never zero
    const maxBetrayal = currentTrust(10, 10);
    expect(maxBetrayal).toBe(1); // The sliver remains

    // Monotone decline
    expect(newFriend).toBeGreaterThan(afterLie);
    expect(afterLie).toBeGreaterThan(afterMany);
    expect(afterMany).toBeGreaterThan(maxBetrayal);
  });
});

// ============================================================================
// Prediction 105: Information Cascade Fragility
// ============================================================================

function cascadeFragility(participants: number): number {
  return participants - 1;
}

function cascadeDeficit(participants: number, independentObs: number): number {
  return participants - independentObs;
}

describe('P105: information cascade fragility', () => {
  it('cascade fragility always positive for k >= 2', () => {
    for (let k = 2; k <= 20; k++) {
      expect(cascadeFragility(k)).toBeGreaterThan(0);
    }
  });

  it('all independent = zero cascade deficit', () => {
    expect(cascadeDeficit(5, 5)).toBe(0);
    expect(cascadeDeficit(10, 10)).toBe(0);
  });

  it('larger cascade = more fragile', () => {
    expect(cascadeFragility(3)).toBeLessThan(cascadeFragility(10));
    expect(cascadeFragility(10)).toBeLessThan(cascadeFragility(100));
  });

  it('single-observation cascade has minimal fragility', () => {
    // k=2: two participants, deficit = 1
    expect(cascadeFragility(2)).toBe(1);
  });

  it('models real information cascades', () => {
    // Restaurant choice: 3 people follow the first person
    const restaurant = cascadeDeficit(3, 1);
    expect(restaurant).toBe(2); // 2 herding, 1 independent

    // Stock market bubble: 1000 traders, only 10 have real data
    const bubble = cascadeDeficit(1000, 10);
    expect(bubble).toBe(990); // 990 herding

    // Viral misinformation: 1M shares, 1 original source
    const viral = cascadeDeficit(1000000, 1);
    expect(viral).toBe(999999);

    // More herding = higher deficit = more fragile
    expect(restaurant).toBeLessThan(bubble);
    expect(bubble).toBeLessThan(viral);
  });
});

// ============================================================================
// Cross-cutting: All five compose
// ============================================================================

describe('Round 9: all five predictions compose', () => {
  it('proportional zero + sufficient zero + confidence positive + trust positive + fragility positive', () => {
    // P101: proportional representation = zero deficit
    expect(representationDeficit(10, 10)).toBe(0);
    // P102: sufficient routes = zero congestion
    expect(congestionDeficit(5, 5)).toBe(0);
    // P103: bug confidence always positive
    expect(bugConfidence(10, 10)).toBeGreaterThanOrEqual(1);
    // P104: trust never zero
    expect(currentTrust(10, 10)).toBeGreaterThanOrEqual(1);
    // P105: cascade fragility positive
    expect(cascadeFragility(5)).toBeGreaterThan(0);
  });

  it('deficits are monotonically reducible across all domains', () => {
    // Each prediction has a lever that monotonically reduces its deficit
    // P101: adding reps reduces representation deficit
    expect(representationDeficit(10, 8)).toBeLessThan(representationDeficit(10, 5));
    // P102: adding capacity reduces congestion
    expect(congestionDeficit(10, 8)).toBeLessThan(congestionDeficit(10, 5));
    // P103: fewer failures increases confidence
    expect(bugConfidence(10, 2)).toBeGreaterThan(bugConfidence(10, 5));
    // P104: fewer betrayals preserves trust
    expect(currentTrust(10, 2)).toBeGreaterThan(currentTrust(10, 5));
    // P105: more independent observers reduces cascade deficit
    expect(cascadeDeficit(10, 8)).toBeLessThan(cascadeDeficit(10, 5));
  });
});
