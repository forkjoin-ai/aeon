import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17MoaTopologyFigureReport,
} from './ch17-moa-topology-figure';
import {
  buildCh17MoaWhipCurvatureFigureReport,
  renderCh17MoaWhipCurvatureFigureMarkdown,
  renderCh17MoaWhipCurvatureFigureSvg,
} from './ch17-moa-whip-curvature-figure';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const sparseTopologyPath = resolve(
  moduleDir,
  '../../../../../../gnosis/examples/benchmarks/moa-transformer-moa.gg',
);
const denseTopologyPath = resolve(
  moduleDir,
  '../../../../../../gnosis/examples/benchmarks/moa-transformer-regular.gg',
);

describe('Chapter 17 MoA whip curvature figure', () => {
  it('builds a supplemental curvature report from the topology surface', () => {
    const topology = buildCh17MoaTopologyFigureReport(
      readFileSync(sparseTopologyPath, 'utf8'),
      sparseTopologyPath,
      denseTopologyPath,
    );
    const report = buildCh17MoaWhipCurvatureFigureReport(topology);

    expect(report.label).toBe('ch17-moa-whip-curvature-figure-v1');
    expect(report.sourceLabel).toBe('ch17-moa-topology-figure-v1');
    expect(report.primitive).toBe('StructuredMoA');
    expect(report.blocks).toBe(4);
    expect(report.activeBlocks).toBe(2);
    expect(report.activeBlockLabels).toEqual(['blk A', 'blk B']);
    expect(report.curvatureView.outerEnvelopeLabel).toBe('curved whip envelope');
  });

  it('renders markdown and svg outputs with curved wraparound labels', () => {
    const topology = buildCh17MoaTopologyFigureReport(
      readFileSync(sparseTopologyPath, 'utf8'),
      sparseTopologyPath,
      denseTopologyPath,
    );
    const report = buildCh17MoaWhipCurvatureFigureReport(topology);

    const markdown = renderCh17MoaWhipCurvatureFigureMarkdown(report);
    const svg = renderCh17MoaWhipCurvatureFigureSvg(report);

    expect(markdown).toContain('# Chapter 17 MoA Whip Curvature Figure');
    expect(markdown).toContain('curved whip envelope');
    expect(markdown).toContain('wraparound composition');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Whip-Wrapped StructuredMoA');
    expect(svg).toContain('curved whip envelope');
    expect(svg).toContain('outer whip snap');
    expect(svg).toContain('inner rot');
    expect(svg).toContain('blk A');
    expect(svg).toContain('<tspan');
    expect(svg).toContain('The sparse path family now reads as a curved enclosure');
  });
});
