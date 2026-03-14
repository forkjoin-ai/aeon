import { describe, expect, it } from 'vitest';

import {
  concatenateCollapse,
  formatWallingtonSchedule,
  wallingtonRotation,
  worthingtonWhip,
} from './wallington-worthington-reference.js';

describe('reader-facing Wallington/Worthington references', () => {
  it('shows the staggered Wallington schedule with floor(P/N) chunk sizing', () => {
    const run = wallingtonRotation(
      [1, 2, 3, 4, 5, 6, 7, 8],
      [
        (chunk) => chunk.map((value) => value + 1),
        (chunk) => chunk.map((value) => value * 2),
        (chunk) => chunk.map((value) => value - 3),
      ],
    );

    expect(run.chunkSize).toBe(2);
    expect(run.chunks).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ]);
    expect(run.totalTicks).toBe(6);
    expect(formatWallingtonSchedule(run)).toContain('t0: s0:c0');
    expect(formatWallingtonSchedule(run)).toContain('t2: s0:c2 | s1:c1 | s2:c0');
    expect(run.output).toEqual([1, 3, 5, 7, 9, 11, 13, 15]);
  });

  it('shows the Worthington whip as shard-local rotations plus one collapse', () => {
    const run = worthingtonWhip([1, 2, 3, 4, 5, 6, 7, 8], {
      shardCount: 2,
      stages: [
        (chunk) => chunk.map((value) => value + 10),
        (chunk) => chunk.map((value) => value * 2),
      ],
      collapse: concatenateCollapse,
    });

    expect(run.shardInputs).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
    expect(run.shardRuns.map((shard) => shard.totalTicks)).toEqual([3, 3]);
    expect(run.collapsedOutput).toEqual([22, 24, 26, 28, 30, 32, 34, 36]);
  });
});

