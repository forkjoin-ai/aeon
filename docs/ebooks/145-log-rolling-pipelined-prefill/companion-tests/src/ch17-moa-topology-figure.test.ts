import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17MoaTopologyFigureReport,
  renderCh17MoaTopologyFigureMarkdown,
  renderCh17MoaTopologyFigureSvg,
} from './ch17-moa-topology-figure';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const sparseTopologyPath = resolve(
  moduleDir,
  '../../../../../../gnosis/examples/benchmarks/moa-transformer-moa.gg'
);
const denseTopologyPath = resolve(
  moduleDir,
  '../../../../../../gnosis/examples/benchmarks/moa-transformer-regular.gg'
);

describe('Chapter 17 MoA topology figure', () => {
  it('builds a topology report from the sparse StructuredMoA GG source', () => {
    const report = buildCh17MoaTopologyFigureReport(
      readFileSync(sparseTopologyPath, 'utf8'),
      sparseTopologyPath,
      denseTopologyPath
    );

    expect(report.label).toBe('ch17-moa-topology-figure-v1');
    expect(report.primitive).toBe('StructuredMoA');
    expect(report.blocks).toBe(4);
    expect(report.activeBlocks).toBe(2);
    expect(report.headsPerBlock).toBe(4);
    expect(report.activeHeadsPerLiveBlock).toBe(2);
    expect(report.sparseExample.activeBlockLabels).toEqual(['blk A', 'blk B']);
    expect(report.sparseExample.activeHeadLabels).toEqual(['h1', 'h2']);
  });

  it('renders markdown and svg outputs with labeled sparse and dense panels', () => {
    const report = buildCh17MoaTopologyFigureReport(
      readFileSync(sparseTopologyPath, 'utf8'),
      sparseTopologyPath,
      denseTopologyPath
    );

    const markdown = renderCh17MoaTopologyFigureMarkdown(report);
    const svg = renderCh17MoaTopologyFigureSvg(report);

    expect(markdown).toContain('# Chapter 17 MoA Topology Figure');
    expect(markdown).toContain('Sparse StructuredMoA');
    expect(markdown).toContain('Dense rotated baseline');
    expect(markdown).toContain('2/4');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Sparse StructuredMoA');
    expect(svg).toContain('Dense rotated baseline');
    expect(svg).toContain('outer router');
    expect(svg).toContain('<tspan');
    expect(svg).toContain('head');
    expect(svg).toContain('h1');
    expect(svg).toContain('outer whip');
  });
});
