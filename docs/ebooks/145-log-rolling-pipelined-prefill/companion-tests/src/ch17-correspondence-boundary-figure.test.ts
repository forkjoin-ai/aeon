import { describe, expect, it } from 'vitest';

import {
  buildCh17CorrespondenceBoundaryFigureReport,
  renderCh17CorrespondenceBoundaryFigureMarkdown,
  renderCh17CorrespondenceBoundaryFigureSvg,
} from './ch17-correspondence-boundary-figure';
import { runQuantumRecombinationAblation } from './quantum-recombination-ablation';
import { runToyAttentionFoldAblation } from './toy-attention-fold-ablation';
import { runGnosisFoldTrainingBenchmark } from './gnosis-fold-training-benchmark';
import { runGnosisMiniMoeRoutingBenchmark } from './gnosis-moe-routing-benchmark';

describe('Chapter 17 correspondence boundary figure', () => {
  it('combines the invariant and behavioral artifacts into a single report', async () => {
    const figure = buildCh17CorrespondenceBoundaryFigureReport(
      runQuantumRecombinationAblation(),
      runToyAttentionFoldAblation(),
      await runGnosisFoldTrainingBenchmark(),
      await runGnosisMiniMoeRoutingBenchmark(),
    );

    expect(figure.sources.quantumLabel).toBe('quantum-recombination-ablation-v1');
    expect(figure.sources.toyAttentionLabel).toBe('toy-attention-fold-ablation-v2');
    expect(figure.sources.gnosisTrainingLabel).toBe('gnosis-fold-training-benchmark-v2');
    expect(figure.sources.gnosisMiniMoeLabel).toBe('gnosis-moe-routing-benchmark-v1');
    expect(figure.quantum.matrix.linear.kernelAgreement).toBe(true);
    expect(figure.gnosisTraining.evalMse.linear).toBeLessThan(1e-6);
    expect(figure.gnosisMiniMoe.evalMse.linear).toBeLessThan(0.01);
    expect(figure.gnosisTraining.evalMse['early-stop']).toBeGreaterThan(
      figure.gnosisTraining.evalMse['winner-take-all'],
    );
  });

  it('renders markdown and svg outputs with all three panels', async () => {
    const figure = buildCh17CorrespondenceBoundaryFigureReport(
      runQuantumRecombinationAblation(),
      runToyAttentionFoldAblation(),
      await runGnosisFoldTrainingBenchmark(),
      await runGnosisMiniMoeRoutingBenchmark(),
    );

    const markdown = renderCh17CorrespondenceBoundaryFigureMarkdown(figure);
    const svg = renderCh17CorrespondenceBoundaryFigureSvg(figure);

    expect(markdown).toContain('# Chapter 17 Correspondence Boundary Figure');
    expect(markdown).toContain('## Quantum Matrix');
    expect(markdown).toContain('## Interval-Backed Behavioral Metrics');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Invariant Loss Matrix');
    expect(svg).toContain('Toy Attention Error');
    expect(svg).toContain('Seeded Gnosis Cancellation Benchmark');
    expect(svg).toContain('Seeded Gnosis Mini-MoE Routing Benchmark');
  });
});
