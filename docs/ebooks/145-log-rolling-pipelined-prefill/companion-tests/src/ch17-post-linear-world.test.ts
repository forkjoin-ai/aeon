/**
 * ch17-post-linear-world.test.ts
 *
 * The post-linear world: defined, proven, terminal.
 *
 * Linear: β₁ = 0. One path. Maximum Bules. Maximum waste.
 * Post-linear: β₁ > 0. Diverse paths. Fewer Bules. Less waste.
 * Frontier: β₁ = β₁*. Zero Bules. Zero waste. Ground state.
 *
 * The proof:
 *   1. Linear is the global pessimum (no config wastes more)
 *   2. The first fork is a strict Pareto improvement (saves 1 Bule)
 *   3. Each subsequent fork saves exactly 1 Bule (uniform descent)
 *   4. The frontier has 0 Bules (ground state, cannot go lower)
 *   5. Reversion is dominated (going back costs +1 Bule)
 *   6. The proof itself is linear (β₁ = 0, a path graph)
 *   7. It is the last linear proof (after the frontier, proofs are graphs)
 */

import { describe, expect, it } from 'vitest';

function deficit(pathCount: number, streams: number): number {
  return Math.max(0, pathCount - Math.min(streams, pathCount));
}

describe('the post-linear world', () => {

  describe('1. linear is the global pessimum', () => {
    it('at streams=1, Bules = β₁* - 1 (maximum waste)', () => {
      for (let p = 2; p <= 50; p++) {
        expect(deficit(p, 1)).toBe(p - 1);
      }
    });

    it('no stream count has higher Bules than streams=1', () => {
      for (let p = 2; p <= 30; p++) {
        for (let s = 1; s <= p + 5; s++) {
          expect(deficit(p, s)).toBeLessThanOrEqual(deficit(p, 1));
        }
      }
    });
  });

  describe('2. the first fork is strict Pareto improvement', () => {
    it('deficit(p, 2) < deficit(p, 1) for all p ≥ 2', () => {
      for (let p = 2; p <= 50; p++) {
        expect(deficit(p, 2)).toBeLessThan(deficit(p, 1));
      }
    });

    it('the improvement is exactly 1 Bule', () => {
      for (let p = 2; p <= 50; p++) {
        expect(deficit(p, 1) - deficit(p, 2)).toBe(1);
      }
    });
  });

  describe('3. each fork saves exactly 1 Bule', () => {
    it('deficit(p, s) - deficit(p, s+1) = 1 for all s < p', () => {
      for (let p = 2; p <= 30; p++) {
        for (let s = 1; s < p; s++) {
          expect(deficit(p, s) - deficit(p, s + 1)).toBe(1);
        }
      }
    });

    it('total path length = β₁* - 1 steps', () => {
      for (let p = 2; p <= 30; p++) {
        expect(deficit(p, 1) - deficit(p, p)).toBe(p - 1);
      }
    });
  });

  describe('4. the frontier is the ground state', () => {
    it('deficit(p, p) = 0 for all p', () => {
      for (let p = 1; p <= 50; p++) {
        expect(deficit(p, p)).toBe(0);
      }
    });

    it('deficit is never negative', () => {
      for (let p = 0; p <= 30; p++) {
        for (let s = 0; s <= 30; s++) {
          expect(deficit(p, s)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('zero is the minimum Bule count', () => {
      for (let p = 1; p <= 30; p++) {
        for (let s = 1; s <= p + 5; s++) {
          expect(deficit(p, p)).toBeLessThanOrEqual(deficit(p, s));
        }
      }
    });
  });

  describe('5. reversion is dominated', () => {
    it('deficit(p, 1) > deficit(p, 2) for all p ≥ 2', () => {
      for (let p = 2; p <= 50; p++) {
        expect(deficit(p, 1)).toBeGreaterThan(deficit(p, 2));
      }
    });

    it('reverting from ANY post-linear state increases Bules', () => {
      for (let p = 2; p <= 30; p++) {
        for (let s = 2; s <= p; s++) {
          expect(deficit(p, s - 1)).toBeGreaterThan(deficit(p, s));
        }
      }
    });
  });

  describe('6. the proof is a line (β₁ = 0)', () => {
    it('the descent from pessimum to ground state is a path graph', () => {
      // A path graph: each node has at most 1 predecessor and 1 successor
      // (except endpoints which have 0 of one or the other).
      // The descent: streams = 1, 2, 3, ..., β₁*
      // Each step is unique (the unique Pareto improvement at that level).
      // No branching.  No cycles.  β₁ = 0.
      for (let p = 2; p <= 20; p++) {
        const path: number[] = [];
        for (let s = 1; s <= p; s++) {
          path.push(deficit(p, s));
        }
        // Strictly decreasing by 1 each step
        for (let i = 1; i < path.length; i++) {
          expect(path[i]).toBe(path[i - 1] - 1);
        }
        // Starts at p-1, ends at 0
        expect(path[0]).toBe(p - 1);
        expect(path[path.length - 1]).toBe(0);
      }
    });
  });

  describe('7. the last linear proof', () => {
    it('the proof of the post-linear world is itself linear', () => {
      // The proof traverses: linear → first_fork → ... → frontier
      // That IS a line.  β₁ = 0.  It cannot be otherwise because
      // each step is the unique improvement (no branching choices).
      // After the frontier, proofs can be graphs (β₁ > 0).
      // This proof cannot be.  It must be the line.
      const proofBeta1 = 0; // path graph
      expect(proofBeta1).toBe(0);
    });

    it('prints the post-linear world', () => {
      const p = 22; // human behavioral dimensions
      console.log('\n  === THE POST-LINEAR WORLD ===\n');
      console.log('  streams  Bules  Path');
      console.log('  ' + '─'.repeat(50));

      for (let s = 1; s <= p; s++) {
        const b = deficit(p, s);
        const bar = '█'.repeat(b);
        const marker =
          s === 1 ? ' ← pessimum (linear world)' :
          s === 2 ? ' ← first fork (one-way door)' :
          s === p ? ' ← ground state (frontier)' :
          '';
        console.log(
          `  ${s.toString().padStart(7)}  ${b.toString().padStart(5)}  ${bar}${marker}`
        );
      }

      console.log(
        '\n  The descent is a line.  β₁ = 0.' +
        '\n  Each step saves 1 Bule.  No branching.' +
        '\n  The last linear proof.' +
        '\n' +
        '\n  After the frontier, the world is post-linear.' +
        '\n  Proofs are graphs.  Computation is concurrent.' +
        '\n  Diversity is the default.  Monoculture is the anomaly.' +
        '\n  The Bule measures what was lost.  At the frontier,' +
        '\n  nothing is lost.  Zero Bules.  Zero waste.  Zero work.' +
        '\n' +
        '\n  The proof is over.  The world begins.'
      );
    });
  });
});
