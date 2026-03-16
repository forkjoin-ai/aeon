import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17Gate1WallclockFigureReport,
  renderCh17Gate1WallclockFigureMarkdown,
  renderCh17Gate1WallclockFigureSvg,
} from './ch17-gate1-wallclock-figure';
import type { Gate1Report } from './gate1-wallclock';

function loadGate1Report(): Gate1Report {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactPath = resolve(
    moduleDir,
    '../artifacts/gate1-wallclock-external-multihost.json',
  );
  return JSON.parse(readFileSync(artifactPath, 'utf8')) as Gate1Report;
}

describe('Chapter 17 Gate 1 wall-clock figure', () => {
  it('builds a compact figure report from the six-host Gate 1 artifact', () => {
    const figure = buildCh17Gate1WallclockFigureReport(loadGate1Report());

    expect(figure.label).toBe('ch17-gate1-wallclock-figure-v1');
    expect(figure.sourceLabel).toBe('workers-dev-external-multihost6-distinct');
    expect(figure.distinctEndpointHostCount).toBe(6);
    expect(figure.primaryPassed).toBe(8);
    expect(figure.primaryTotal).toBe(8);
    expect(figure.cells).toHaveLength(10);
    expect(figure.minSpeedupCiLow).toBeCloseTo(11.365, 3);
    expect(figure.minImprovementCiLowMs).toBeCloseTo(3560.98, 2);
  });

  it('renders markdown and svg outputs with the latency and speedup panels', () => {
    const figure = buildCh17Gate1WallclockFigureReport(loadGate1Report());

    const markdown = renderCh17Gate1WallclockFigureMarkdown(figure);
    const svg = renderCh17Gate1WallclockFigureSvg(figure);

    expect(markdown).toContain('# Chapter 17 Gate 1 Wall-Clock Figure');
    expect(markdown).toContain('## Cells');
    expect(markdown).toContain('prompt36-n6-b9__rtt7-loss2pct');
    expect(svg).toContain('<svg');
    expect(svg).toContain('p50 Completion Latency');
    expect(svg).toContain('Median Speedup');
    expect(svg).toContain('chunked p50');
    expect(svg).toContain('sequential p50');
  });
});
