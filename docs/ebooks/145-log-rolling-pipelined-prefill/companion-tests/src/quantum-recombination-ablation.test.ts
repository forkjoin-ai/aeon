import { describe, expect, it } from 'vitest';

import {
  renderQuantumRecombinationAblationMarkdown,
  runQuantumRecombinationAblation,
} from './quantum-recombination-ablation';

describe('Quantum recombination ablation (§6.12)', () => {
  it('only linear recombination agrees with the exact path sum on a fixed path family', () => {
    const report = runQuantumRecombinationAblation();

    expect(report.strategies.linear.profile.preservesKernelAgreement).toBe(
      true
    );
    expect(
      report.strategies.linear.distances.kernelAgreementDistance
    ).toBeLessThanOrEqual(report.tolerance);

    expect(
      report.strategies['winner-take-all'].distances.kernelAgreementDistance
    ).toBeGreaterThan(0.1);
    expect(
      report.strategies['early-stop'].distances.kernelAgreementDistance
    ).toBeGreaterThan(0.1);
  });

  it('predicts the invariant-loss profile for nonlinear recombination under fixed topology', () => {
    const report = runQuantumRecombinationAblation();

    expect(report.predictedLossMatrixMatches).toBe(true);
    expect(
      Object.fromEntries(
        Object.entries(report.strategies).map(
          ([strategyName, strategyReport]) => [
            strategyName,
            strategyReport.profile,
          ]
        )
      )
    ).toEqual({
      linear: {
        preservesKernelAgreement: true,
        preservesPartitionAdditivity: true,
        preservesOrderInvariance: true,
        preservesCancellation: true,
      },
      'winner-take-all': {
        preservesKernelAgreement: false,
        preservesPartitionAdditivity: false,
        preservesOrderInvariance: false,
        preservesCancellation: false,
      },
      'early-stop': {
        preservesKernelAgreement: false,
        preservesPartitionAdditivity: false,
        preservesOrderInvariance: false,
        preservesCancellation: false,
      },
    });
  });

  it('renders a markdown artifact with the invariant matrix', () => {
    const markdown = renderQuantumRecombinationAblationMarkdown(
      runQuantumRecombinationAblation()
    );

    expect(markdown).toContain('# Quantum Recombination Ablation');
    expect(markdown).toContain('## Invariant Matrix');
    expect(markdown).toContain('`winner-take-all`');
    expect(markdown).toContain('Predicted loss matrix recovered');
  });
});
