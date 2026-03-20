import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17Gate3CompressionCorpusFigureReport,
  renderCh17Gate3CompressionCorpusFigureMarkdown,
  renderCh17Gate3CompressionCorpusFigureSvg,
} from './ch17-gate3-compression-corpus-figure';
import type { Gate3Report } from './gate3-compression-corpus';

function loadGate3Report(): Gate3Report {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactPath = resolve(
    moduleDir,
    '../artifacts/gate3-compression-corpus.json'
  );
  return JSON.parse(readFileSync(artifactPath, 'utf8')) as Gate3Report;
}

describe('Chapter 17 Gate 3 compression-corpus figure', () => {
  it('builds a compact figure report from the Gate 3 artifact', () => {
    const figure = buildCh17Gate3CompressionCorpusFigureReport(
      loadGate3Report()
    );

    expect(figure.label).toBe('ch17-gate3-compression-corpus-figure-v1');
    expect(figure.sourceLabel).toBe('gate3-compression-corpus-v1');
    expect(figure.corpus.sampleCount).toBe(90);
    expect(figure.primaryPassed).toBe(4);
    expect(figure.primaryTotal).toBe(4);
    expect(figure.cells).toHaveLength(5);
    expect(figure.minPrimaryBestFixedCiLowPct).toBeCloseTo(0.0009, 4);
    expect(figure.minPrimaryHeuristicCiLowPct).toBeCloseTo(0.386, 2);
    expect(figure.medianCodecsUsedRange.low).toBe(1);
    expect(figure.medianCodecsUsedRange.high).toBe(1);
  });

  it('renders markdown and svg outputs with the two compression panels', () => {
    const figure = buildCh17Gate3CompressionCorpusFigureReport(
      loadGate3Report()
    );

    const markdown = renderCh17Gate3CompressionCorpusFigureMarkdown(figure);
    const svg = renderCh17Gate3CompressionCorpusFigureSvg(figure);

    expect(markdown).toContain('# Chapter 17 Gate 3 Compression-Corpus Figure');
    expect(markdown).toContain('## Cells');
    expect(markdown).toContain('api-telemetry');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Median Gain vs Best Fixed Codec');
    expect(svg).toContain('Median Gain vs Heuristic Baseline');
    expect(svg).toContain('non-primary control');
  });
});
