import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17Gate4RqrHoldoutFigureReport,
  renderCh17Gate4RqrHoldoutFigureMarkdown,
  renderCh17Gate4RqrHoldoutFigureSvg,
} from './ch17-gate4-rqr-holdout-figure';
import type { Gate4Report } from './gate4-rqr-holdout';

function loadGate4Report(): Gate4Report {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactPath = resolve(
    moduleDir,
    '../artifacts/gate4-rqr-holdout.json'
  );
  return JSON.parse(readFileSync(artifactPath, 'utf8')) as Gate4Report;
}

describe('Chapter 17 Gate 4 R_qr holdout figure', () => {
  it('builds a compact figure report from the Gate 4 artifact', () => {
    const figure = buildCh17Gate4RqrHoldoutFigureReport(loadGate4Report());

    expect(figure.label).toBe('ch17-gate4-rqr-holdout-figure-v1');
    expect(figure.sourceLabel).toBe('gate4-rqr-out-of-sample-v1');
    expect(figure.trainingSampleCount).toBe(360);
    expect(figure.holdoutSampleCount).toBe(520);
    expect(figure.criteriaPassed).toBe(5);
    expect(figure.criteriaTotal).toBe(5);
    expect(figure.decileCount).toBe(10);
    expect(figure.quartileDelta.value).toBeCloseTo(0.1277, 3);
    expect(figure.monotonicViolations).toBe(1);
    expect(figure.maxMonotonicViolations).toBe(3);
    expect(figure.maxAbsoluteResidualGain).toBeCloseTo(0.0992, 3);
  });

  it('renders markdown and svg outputs with calibration and criteria panels', () => {
    const figure = buildCh17Gate4RqrHoldoutFigureReport(loadGate4Report());

    const markdown = renderCh17Gate4RqrHoldoutFigureMarkdown(figure);
    const svg = renderCh17Gate4RqrHoldoutFigureSvg(figure);

    expect(markdown).toContain('# Chapter 17 Gate 4 R_qr Holdout Figure');
    expect(markdown).toContain('## Criteria');
    expect(markdown).toContain('## Holdout Deciles');
    expect(markdown).toContain('Spearman');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Holdout Decile Calibration');
    expect(svg).toContain('Holdout Screening Criteria');
    expect(svg).toContain('Decile monotonicity');
    expect(svg).toContain('R_qr &lt;=');
    expect(svg).not.toContain('R_qr <=');
  });
});
