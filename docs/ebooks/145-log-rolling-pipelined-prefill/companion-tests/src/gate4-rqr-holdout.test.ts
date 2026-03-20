import { describe, expect, it } from 'vitest';

import {
  makeDefaultGate4Config,
  renderGate4Markdown,
  runGate4Holdout,
} from './gate4-rqr-holdout';

describe('Gate 4 out-of-sample holdout harness', () => {
  it('is deterministic for fixed seeds and thresholds', () => {
    const base = makeDefaultGate4Config();
    const config = {
      ...base,
      trainSamples: 220,
      holdoutSamples: 280,
      bootstrapResamples: 600,
    };

    const reportA = runGate4Holdout(config);
    const reportB = runGate4Holdout(config);

    expect(reportA.gate.pass).toBe(reportB.gate.pass);
    expect(reportA.holdout.spearman.value).toBeCloseTo(
      reportB.holdout.spearman.value,
      12
    );
    expect(reportA.holdout.slope.value).toBeCloseTo(
      reportB.holdout.slope.value,
      12
    );
    expect(reportA.holdout.quartileDelta.value).toBeCloseTo(
      reportB.holdout.quartileDelta.value,
      12
    );
    expect(reportA.holdout.predictedPearson.value).toBeCloseTo(
      reportB.holdout.predictedPearson.value,
      12
    );
  });

  it('fails when a predeclared threshold is set above measured evidence', () => {
    const base = makeDefaultGate4Config();
    const config = {
      ...base,
      trainSamples: 220,
      holdoutSamples: 280,
      bootstrapResamples: 600,
      thresholds: {
        ...base.thresholds,
        spearmanLowerCi: 0.99,
      },
    };

    const report = runGate4Holdout(config);
    const criterion = report.gate.criteria.find(
      (entry) => entry.id === 'spearman_ci_low'
    );

    expect(criterion).toBeDefined();
    expect(criterion?.pass).toBe(false);
    expect(report.gate.pass).toBe(false);
  });

  it('renders a markdown report with verdict and criteria', () => {
    const base = makeDefaultGate4Config();
    const report = runGate4Holdout({
      ...base,
      trainSamples: 180,
      holdoutSamples: 240,
      bootstrapResamples: 300,
    });

    const markdown = renderGate4Markdown(report);
    expect(markdown).toContain('# Gate 4 Out-of-Sample R_qr Validation');
    expect(markdown).toContain('## Criteria');
    expect(markdown).toContain('spearman_ci_low');
    expect(markdown).toContain('## Deciles (Holdout)');
  });
});
