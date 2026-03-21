import { describe, expect, it } from 'vitest';

import {
  buildCh17HeteroMoaFabricCurvatureFigureReport,
  renderCh17HeteroMoaFabricCurvatureFigureMarkdown,
  renderCh17HeteroMoaFabricCurvatureFigureSvg,
} from './ch17-hetero-moa-fabric-curvature-figure';

describe('Chapter 17 hetero MoA fabric curvature figure', () => {
  it('builds a backend-diverse paired-kernel curvature report', () => {
    const report = buildCh17HeteroMoaFabricCurvatureFigureReport();

    expect(report.label).toBe('ch17-hetero-moa-fabric-curvature-figure-v1');
    expect(report.primitive).toBe('HeteroMoAFabric');
    expect(report.frameProtocol).toBe('aeon-10-byte-binary');
    expect(report.scheduleStrategy).toBe('cannon');
    expect(report.totalLanes).toBe(5);
    expect(report.pairCount).toBe(5);
    expect(report.mirroredKernelCount).toBe(10);
    expect(report.layers.map((layer) => layer.kind)).toEqual([
      'cpu',
      'gpu',
      'npu',
      'wasm',
    ]);
    expect(report.curvatureView.outerEnvelopeLabel).toBe(
      'curved meta-laminar envelope'
    );
  });

  it('renders markdown and svg outputs with curved backend orbitals', () => {
    const report = buildCh17HeteroMoaFabricCurvatureFigureReport();

    const markdown = renderCh17HeteroMoaFabricCurvatureFigureMarkdown(report);
    const svg = renderCh17HeteroMoaFabricCurvatureFigureSvg(report);

    expect(markdown).toContain(
      '# Chapter 17 Hetero MoA Fabric Curvature Figure'
    );
    expect(markdown).toContain('curved meta-laminar envelope');
    expect(markdown).toContain('stretched spring');
    expect(markdown).toContain('QDoc decay');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Curved HeteroMoAFabric');
    expect(svg).toContain('fork/race/merge+vent across device layers');
    expect(svg).toContain('CPU control helix');
    expect(svg).toContain('GPU wave helix');
    expect(svg).toContain('NPU route helix');
    expect(svg).toContain('WASM browser helix');
    expect(svg).toContain('race across layers');
    expect(svg).toContain('winner/loser/vent telemetry');
  });
});
