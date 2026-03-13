import { describe, expect, it } from 'vitest';

import {
  makeDefaultGate5Config,
  renderGate5Markdown,
  runGate5BioEffectSize,
} from './gate5-bio-effect-size';

describe('Gate 5 biological effect-size harness', () => {
  it('is deterministic for fixed config', () => {
    const base = makeDefaultGate5Config();
    const config = {
      ...base,
      drawsPerPair: 3000,
      bootstrapResamples: 900,
    };

    const reportA = runGate5BioEffectSize(config);
    const reportB = runGate5BioEffectSize(config);

    expect(reportA.gate.pass).toBe(reportB.gate.pass);
    expect(reportA.aggregate.pooledLogRatio).toBeCloseTo(reportB.aggregate.pooledLogRatio, 12);
    expect(reportA.aggregate.pooledLogRatioCi95.low).toBeCloseTo(reportB.aggregate.pooledLogRatioCi95.low, 12);
    expect(reportA.aggregate.pooledLogRatioCi95.high).toBeCloseTo(reportB.aggregate.pooledLogRatioCi95.high, 12);
  });

  it('fails when predeclared pooled threshold is overly strict', () => {
    const base = makeDefaultGate5Config();
    const config = {
      ...base,
      drawsPerPair: 2500,
      bootstrapResamples: 800,
      thresholds: {
        ...base.thresholds,
        pooledLogRatioLowerCi: 5.0,
      },
    };

    const report = runGate5BioEffectSize(config);
    const criterion = report.gate.criteria.find((entry) => entry.id === 'pooled_log_ratio_ci_low');

    expect(criterion).toBeDefined();
    expect(criterion?.pass).toBe(false);
    expect(report.gate.pass).toBe(false);
  });

  it('renders markdown with verdict and criteria table', () => {
    const base = makeDefaultGate5Config();
    const report = runGate5BioEffectSize({
      ...base,
      drawsPerPair: 2000,
      bootstrapResamples: 500,
    });

    const markdown = renderGate5Markdown(report);
    expect(markdown).toContain('# Gate 5 Biological Effect-Size Mapping');
    expect(markdown).toContain('## Pair Results');
    expect(markdown).toContain('## Criteria');
    expect(markdown).toContain('pooled_log_ratio_ci_low');
  });
});
