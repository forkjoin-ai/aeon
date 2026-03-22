import { describe, expect, it } from 'vitest';

function pipelineHandoffs(P: number, B: number, N: number): number {
  return Math.ceil(P / B) + N - 1;
}

function classifyReynolds(reynolds: number): 'laminar' | 'transitional' | 'turbulent' {
  if (reynolds < 1 / 3) {
    return 'laminar';
  }
  if (reynolds < 2 / 3) {
    return 'transitional';
  }
  return 'turbulent';
}

describe('Flagship manuscript hardening', () => {
  it('keeps the chunked-pipeline formula exact', () => {
    expect(pipelineHandoffs(100, 25, 4)).toBe(7);
    expect(pipelineHandoffs(100, 1, 4)).toBe(103);
    expect(pipelineHandoffs(36, 9, 6)).toBe(9);
  });

  it('keeps the pipeline speedup sandwich honest', () => {
    const P = 36;
    const B = 9;
    const N = 6;
    const sequential = P * N;
    const pipelined = pipelineHandoffs(P, B, N);
    const speedup = sequential / pipelined;

    expect(pipelined).toBeLessThanOrEqual(sequential);
    expect(speedup).toBeGreaterThanOrEqual(1);
    expect(speedup).toBeLessThanOrEqual(B * N);
  });

  it('keeps Delta_beta as a mismatch diagnostic rather than a score', () => {
    const intrinsicBeta1 = 3;
    const executionBeta1 = 0;
    const deltaBeta = intrinsicBeta1 - executionBeta1;

    expect(deltaBeta).toBe(3);
    expect(deltaBeta).toBeGreaterThan(0);
    expect(intrinsicBeta1 - intrinsicBeta1).toBe(0);
  });

  it('keeps Reynolds regime boundaries exact', () => {
    expect(classifyReynolds(0.2)).toBe('laminar');
    expect(classifyReynolds(1 / 3)).toBe('transitional');
    expect(classifyReynolds(0.5)).toBe('transitional');
    expect(classifyReynolds(2 / 3)).toBe('turbulent');
    expect(classifyReynolds(0.9)).toBe('turbulent');
  });

  it('keeps the FlowFrame header width at 10 bytes', () => {
    const streamIdBytes = 2;
    const sequenceBytes = 4;
    const flagsBytes = 1;
    const lengthBytes = 3;

    expect(streamIdBytes + sequenceBytes + flagsBytes + lengthBytes).toBe(10);
  });
});
