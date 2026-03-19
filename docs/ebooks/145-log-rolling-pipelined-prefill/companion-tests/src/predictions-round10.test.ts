/**
 * Predictions Round 10: Sleep Schedules, Pipeline Waste, Iterated Debt
 * 147-151
 */
import { describe, expect, it } from 'bun:test';

function iteratedDebt(wake: number, quota: number, n: number): number {
  if (wake <= quota) return 0;
  return n * (wake - quota);
}

function residualDebt(wake: number, carried: number, quota: number): number {
  return Math.max(0, wake + carried - quota);
}

function effectiveCapacity(maxCap: number, debt: number): number {
  return maxCap - Math.min(maxCap, debt);
}

function repairedFrontier(f: number, v: number, r: number): number { return f - v + r; }
function entropyProxy(f: number): number { return f - 1; }

describe('Prediction 147: Iterated Debt Closed-Form', () => {
  it('debt = n × (wake - quota) when quota < wake', () => {
    expect(iteratedDebt(8, 6, 5)).toBe(10); // 5*(8-6)
    expect(iteratedDebt(10, 7, 3)).toBe(9); // 3*(10-7)
    expect(iteratedDebt(8, 6, 0)).toBe(0);
  });
  it('zero surplus = zero debt at all cycle counts', () => {
    for (let n = 0; n < 10; n++) {
      expect(iteratedDebt(6, 8, n)).toBe(0);
      expect(iteratedDebt(6, 6, n)).toBe(0);
    }
  });
});

describe('Prediction 148: Full Recovery Clears Debt', () => {
  it('sufficient quota clears all carried debt', () => {
    expect(residualDebt(8, 10, 20)).toBe(0);
    expect(residualDebt(5, 5, 10)).toBe(0);
  });
  it('full recovery restores capacity', () => {
    expect(effectiveCapacity(100, 0)).toBe(100);
    expect(effectiveCapacity(100, residualDebt(8, 10, 20))).toBe(100);
  });
});

describe('Prediction 149: Threshold Debt Spiral', () => {
  it('above threshold, debt grows linearly', () => {
    const trajectory: number[] = [];
    for (let n = 0; n <= 10; n++) trajectory.push(iteratedDebt(8, 6, n));
    expect(trajectory).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    for (let i = 1; i < trajectory.length; i++) {
      expect(trajectory[i]!).toBeGreaterThan(trajectory[i - 1]!);
    }
    console.log('Debt spiral:', trajectory);
  });
  it('below threshold, debt stays zero', () => {
    for (let n = 0; n <= 10; n++) expect(iteratedDebt(6, 8, n)).toBe(0);
  });
});

describe('Prediction 150: Over-Repair + Debt Compose', () => {
  it('over-repair increases entropy', () => {
    expect(entropyProxy(repairedFrontier(10, 3, 5))).toBeGreaterThan(entropyProxy(10));
  });
  it('the over-engineering margin is exactly repaired - vented', () => {
    const frontier = 10, vented = 3, repaired = 7;
    const margin = repaired - vented; // 4
    const newFrontier = repairedFrontier(frontier, vented, repaired);
    expect(newFrontier).toBe(frontier + margin);
  });
});

describe('Prediction 151: Deficit-Free Schedule Existence', () => {
  it('deficit-free: wake ≤ quota → zero debt forever', () => {
    for (let n = 0; n < 100; n++) expect(iteratedDebt(6, 8, n)).toBe(0);
  });
  it('no deficit-free schedule when quota < wake', () => {
    for (let n = 1; n <= 10; n++) {
      expect(iteratedDebt(8, 6, n)).toBeGreaterThan(0);
    }
  });
});

describe('Round 10 Master', () => {
  it('all five verified', () => {
    expect(iteratedDebt(8, 6, 5)).toBe(10);
    expect(residualDebt(8, 10, 20)).toBe(0);
    expect(iteratedDebt(8, 6, 1)).toBeGreaterThan(0);
    expect(entropyProxy(repairedFrontier(10, 3, 5))).toBeGreaterThan(entropyProxy(10));
    expect(iteratedDebt(6, 8, 100)).toBe(0);
    console.log('Round 10: sleep schedules + debt spirals + over-repair verified');
  });
});
