import { describe, expect, it } from 'vitest';

import {
  makeDefaultToyAttentionAblationConfig,
  renderToyAttentionFoldAblationMarkdown,
  runToyAttentionFoldAblation,
} from './toy-attention-fold-ablation';

describe('Toy attention fold ablation (§1.7, §6.12)', () => {
  it('is deterministic for the default fixed-parameter toy attention model', () => {
    const config = makeDefaultToyAttentionAblationConfig();

    const reportA = runToyAttentionFoldAblation(config);
    const reportB = runToyAttentionFoldAblation(config);

    expect(reportA).toEqual(reportB);
  });

  it('keeps linear attention exact and shows observable degradation for nonlinear selection', () => {
    const report = runToyAttentionFoldAblation();

    expect(report.strategies.linear.meanSquaredError).toBeCloseTo(0, 12);
    expect(report.strategies.linear.meanSquaredErrorCi95.high).toBeLessThan(
      1e-9
    );
    expect(report.strategies.linear.exactWithinToleranceFraction).toBe(1);

    expect(
      report.strategies['winner-take-all'].meanSquaredError
    ).toBeGreaterThan(0.1);
    expect(report.strategies['early-stop'].meanSquaredError).toBeGreaterThan(
      report.strategies['winner-take-all'].meanSquaredError
    );
    expect(report.predictedRankingMatches).toBe(true);
    expect(report.rankingByMeanSquaredError).toEqual([
      'linear',
      'winner-take-all',
      'early-stop',
    ]);
  });

  it('renders a markdown report with metrics and sample predictions', () => {
    const markdown = renderToyAttentionFoldAblationMarkdown(
      runToyAttentionFoldAblation()
    );

    expect(markdown).toContain('# Toy Attention Fold Ablation');
    expect(markdown).toContain('## Metrics');
    expect(markdown).toContain('MSE 95% CI');
    expect(markdown).toContain('winner-take-all');
    expect(markdown).toContain('## Sample Predictions');
  });
});
