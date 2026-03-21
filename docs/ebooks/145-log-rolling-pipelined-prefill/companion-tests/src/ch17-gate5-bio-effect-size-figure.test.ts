import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17Gate5BioEffectSizeFigureReport,
  renderCh17Gate5BioEffectSizeFigureMarkdown,
  renderCh17Gate5BioEffectSizeFigureSvg,
} from './ch17-gate5-bio-effect-size-figure';
import type { Gate5Report } from './gate5-bio-effect-size';

function loadGate5Report(): Gate5Report {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactPath = resolve(
    moduleDir,
    '../artifacts/gate5-bio-effect-size.json'
  );
  return JSON.parse(readFileSync(artifactPath, 'utf8')) as Gate5Report;
}

describe('Chapter 17 Gate 5 biological effect-size figure', () => {
  it('builds a compact figure report from the Gate 5 artifact', () => {
    const figure = buildCh17Gate5BioEffectSizeFigureReport(loadGate5Report());

    expect(figure.label).toBe('ch17-gate5-bio-effect-size-figure-v1');
    expect(figure.sourceLabel).toBe('gate5-bio-effect-size-v1');
    expect(figure.pairCount).toBe(3);
    expect(figure.primaryPairCount).toBe(3);
    expect(figure.primaryPairsPassed).toBe(3);
    expect(figure.criteriaPassed).toBe(4);
    expect(figure.criteriaTotal).toBe(4);
    expect(figure.medianPairRatio).toBeCloseTo(21.524, 3);
    expect(figure.minPrimaryPairRatioCiLow).toBeCloseTo(5.829, 3);
    expect(figure.pooledRatio).toBeCloseTo(26.566, 3);
    expect(figure.pooledRatioCi95.low).toBeCloseTo(9.863, 3);
    expect(figure.pooledThresholdRatio).toBe(2);
  });

  it('renders markdown and svg outputs with the forest plot and pooled summary', () => {
    const figure = buildCh17Gate5BioEffectSizeFigureReport(loadGate5Report());

    const markdown = renderCh17Gate5BioEffectSizeFigureMarkdown(figure);
    const svg = renderCh17Gate5BioEffectSizeFigureSvg(figure);

    expect(markdown).toContain(
      '# Chapter 17 Gate 5 Biological Effect-Size Figure'
    );
    expect(markdown).toContain('## Pairs');
    expect(markdown).toContain('Pooled geometric ratio');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Pairwise Ratios on Log Scale');
    expect(svg).toContain('Pooled geometric summary');
    expect(svg).toContain('Gate Summary');
  });
});
