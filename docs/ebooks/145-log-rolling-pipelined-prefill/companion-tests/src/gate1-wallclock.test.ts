import { describe, expect, it } from 'vitest';

import {
  bootstrapCi,
  makeDefaultGate1Config,
  quantile,
  runGate1Matrix,
  type Gate1Config,
} from './gate1-wallclock';

describe('Gate 1 Wall-Clock Matrix', () => {
  it('computes quantiles and bootstrap intervals deterministically', () => {
    const values = [1, 2, 3, 4, 5];
    expect(quantile(values, 0.5)).toBe(3);
    expect(quantile(values, 0.95)).toBeCloseTo(4.8, 6);

    const ci = bootstrapCi(
      values,
      (sample) => quantile(sample, 0.5),
      0xBEEF,
      1000,
    );

    expect(ci.low).toBeLessThanOrEqual(3);
    expect(ci.high).toBeGreaterThanOrEqual(3);
  });

  it('passes a deterministic small matrix where chunked pipeline has lower wall-clock latency', async () => {
    const config: Gate1Config = {
      ...makeDefaultGate1Config(),
      trialsPerCell: 4,
      bootstrapResamples: 800,
      maxAttemptsPerRequest: 4,
      seed: 0xFACE,
      workloads: [
        {
          name: 'smoke-n3',
          tokens: 12,
          nodes: 3,
          chunkSize: 4,
          serviceMsPerToken: 0.1,
          payloadBytesPerToken: 64,
        },
      ],
      networkConditions: [
        {
          name: 'smoke-rtt2-loss0',
          rttMs: 2,
          jitterMs: 0.1,
          lossRate: 0,
          primary: true,
        },
      ],
    };

    const report = await runGate1Matrix(config);
    expect(report.cells).toHaveLength(1);

    const cell = report.cells[0];
    expect(cell.pairedTrials).toBe(config.trialsPerCell);
    expect(cell.failedTrials).toBe(0);
    expect(cell.sequential.p50Ms).toBeGreaterThan(cell.chunked.p50Ms);
    expect(cell.speedupMedian).toBeGreaterThan(1);
    expect(cell.passed).toBe(true);
    expect(report.gate.pass).toBe(true);
  });
});
