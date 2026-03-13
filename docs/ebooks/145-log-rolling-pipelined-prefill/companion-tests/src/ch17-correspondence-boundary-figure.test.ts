import { describe, expect, it } from 'vitest';

import {
  buildCh17CorrespondenceBoundaryFigureReport,
  renderCh17CorrespondenceBoundaryFigureMarkdown,
  renderCh17CorrespondenceBoundaryFigureSvg,
} from './ch17-correspondence-boundary-figure';
import { runQuantumRecombinationAblation } from './quantum-recombination-ablation';
import { runToyAttentionFoldAblation } from './toy-attention-fold-ablation';
import { runGnosisFoldTrainingBenchmark } from './gnosis-fold-training-benchmark';

describe('Chapter 17 correspondence boundary figure', () => {
  it('combines the invariant and behavioral artifacts into a single report', async () => {
    const figure = buildCh17CorrespondenceBoundaryFigureReport(
      runQuantumRecombinationAblation(),
      runToyAttentionFoldAblation(),
      await runGnosisFoldTrainingBenchmark(),
    );

    expect(figure.sources.quantumLabel).toBe('quantum-recombination-ablation-v1');
    expect(figure.sources.toyAttentionLabel).toBe('toy-attention-fold-ablation-v1');
    expect(figure.sources.gnosisTrainingLabel).toBe('gnosis-fold-training-benchmark-v1');
    expect(figure.quantum.matrix.linear.kernelAgreement).toBe(true);
    expect(figure.gnosisTraining.evalMse.linear).toBeLessThan(1e-6);
    expect(figure.gnosisTraining.evalMse['early-stop']).toBeGreaterThan(
      figure.gnosisTraining.evalMse['winner-take-all'],
    );
  });

  it('renders markdown and svg outputs with all three panels', async () => {
    const figure = buildCh17CorrespondenceBoundaryFigureReport(
      runQuantumRecombinationAblation(),
      runToyAttentionFoldAblation(),
      await runGnosisFoldTrainingBenchmark(),
    );

    const markdown = renderCh17CorrespondenceBoundaryFigureMarkdown(figure);
    const svg = renderCh17CorrespondenceBoundaryFigureSvg(figure);

    expect(markdown).toContain('# Chapter 17 Correspondence Boundary Figure');
    expect(markdown).toContain('## Quantum Matrix');
    expect(markdown).toContain('## Behavioral Metrics');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Invariant Loss Matrix');
    expect(svg).toContain('Toy Attention Error');
    expect(svg).toContain('Seeded Gnosis Training Benchmark');
  });
});
