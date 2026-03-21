import { describe, expect, it } from 'vitest';

import {
  buildCh17InvertedScalingReynoldsFigureReport,
  renderCh17InvertedScalingReynoldsFigureMarkdown,
  renderCh17InvertedScalingReynoldsFigureSvg,
} from './ch17-inverted-scaling-reynolds-figure';

describe('Chapter 17 inverted-scaling and Reynolds figure', () => {
  it('builds the analytic report with manuscript and transport scenarios', () => {
    const figure = buildCh17InvertedScalingReynoldsFigureReport();

    expect(figure.label).toBe('ch17-inverted-scaling-reynolds-figure-v1');
    expect(figure.stageFamilies).toEqual([2, 4, 8, 10]);
    expect(figure.speedupCurves).toHaveLength(4);
    expect(figure.regimeCurves).toHaveLength(3);
    expect(figure.scenarios).toHaveLength(6);

    const table500x8 = figure.scenarios.find(
      (scenario) => scenario.id === 'table-500x8'
    );
    const aeonFlow = figure.scenarios.find(
      (scenario) => scenario.id === 'aeon-flow-microfrontend'
    );
    const http1 = figure.scenarios.find(
      (scenario) => scenario.id === 'http1-microfrontend'
    );

    expect(table500x8?.speedup).toBeCloseTo(266.667, 3);
    expect(table500x8?.regime).toBe('turbulent');
    expect(aeonFlow?.reynolds).toBeCloseTo(0.371, 3);
    expect(aeonFlow?.regime).toBe('transitional');
    expect(http1?.reynolds).toBeGreaterThan(15);
    expect(http1?.idleFraction).toBeGreaterThan(0.9);
  });

  it('renders markdown and svg outputs with both analytic panels', () => {
    const figure = buildCh17InvertedScalingReynoldsFigureReport();

    const markdown = renderCh17InvertedScalingReynoldsFigureMarkdown(figure);
    const svg = renderCh17InvertedScalingReynoldsFigureSvg(figure);

    expect(markdown).toContain(
      '# Chapter 17 Inverted-Scaling and Reynolds Figure'
    );
    expect(markdown).toContain('## Scenarios');
    expect(markdown).toContain('95 resources / Aeon Flow');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Inverted Scaling Under Balanced Chunks');
    expect(svg).toContain('Reynolds Regime Map');
    expect(svg).toContain('95 resources / HTTP-1.1');
  });
});
