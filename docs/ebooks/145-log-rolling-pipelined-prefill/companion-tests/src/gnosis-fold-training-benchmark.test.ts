import { describe, expect, it } from 'vitest';

import {
  renderGnosisFoldTrainingBenchmarkMarkdown,
  runGnosisFoldTrainingBenchmark,
} from './gnosis-fold-training-benchmark';

describe('Gnosis fold training benchmark (§1.7, §6.12)', () => {
  it('keeps the topology parameter-matched while learned performance separates by fold rule', async () => {
    const report = await runGnosisFoldTrainingBenchmark();

    expect(report.topology.parameterCount).toBe(4);
    expect(report.topology.branchCount).toBe(2);
    expect(report.predictedRankingMatches).toBe(true);
    expect(report.rankingByEvalMeanSquaredError).toEqual([
      'linear',
      'winner-take-all',
      'early-stop',
    ]);

    expect(report.strategies.linear.meanEvalMeanSquaredError).toBeLessThan(1e-6);
    expect(report.strategies.linear.evalMeanSquaredErrorCi95.high).toBeLessThan(1e-5);
    expect(report.strategies.linear.meanExactWithinToleranceFraction).toBe(1);
    expect(report.strategies['winner-take-all'].meanEvalMeanSquaredError).toBeGreaterThan(0.3);
    expect(report.strategies['early-stop'].meanEvalMeanSquaredError).toBeGreaterThan(
      report.strategies['winner-take-all'].meanEvalMeanSquaredError,
    );
    expect(report.strategies['winner-take-all'].meanCancellationLineMeanAbsoluteError).toBeGreaterThan(
      0.7,
    );
    expect(report.strategies['early-stop'].meanCancellationLineMeanAbsoluteError).toBeGreaterThan(
      0.7,
    );
  });

  it('renders a markdown report with learned metrics and sample predictions', async () => {
    const markdown = renderGnosisFoldTrainingBenchmarkMarkdown(
      await runGnosisFoldTrainingBenchmark(),
    );

    expect(markdown).toContain('# Gnosis Fold Training Benchmark');
    expect(markdown).toContain('## Aggregated Metrics');
    expect(markdown).toContain('Eval MSE 95% CI');
    expect(markdown).toContain('winner-take-all');
    expect(markdown).toContain('Cancellation-line abs error');
    expect(markdown).toContain('## Sample Predictions');
  });
});
