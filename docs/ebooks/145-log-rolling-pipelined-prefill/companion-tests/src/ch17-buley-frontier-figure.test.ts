import { describe, expect, it } from 'bun:test';
import {
  buildBuleyFrontierReport,
  renderBuleyFrontierMarkdown,
  renderBuleyFrontierSvg,
} from './ch17-buley-frontier-figure';

describe('ch17-buley-frontier-figure', () => {
  it('builds the Buley frontier report with correct structure', () => {
    const report = buildBuleyFrontierReport();
    expect(report.label).toBe('ch17-buley-frontier-figure-v1');

    // Protocol panel: 4 protocols, monotonically decreasing overhead
    expect(report.protocol.points).toHaveLength(4);
    expect(report.protocol.beta1Star).toBe(94);
    const overheads = report.protocol.points.map((p) => p.overheadPct);
    for (let i = 1; i < overheads.length; i++) {
      expect(overheads[i]).toBeLessThan(overheads[i - 1]);
    }

    // Pipeline panel: idle fraction increases with Re (waste increases with less diversity)
    expect(report.pipeline.points.length).toBeGreaterThan(5);
    const idles = report.pipeline.points.map((p) => p.idleFraction);
    for (let i = 1; i < idles.length; i++) {
      expect(idles[i]).toBeGreaterThan(idles[i - 1]);
    }

    // Compression panel: 5 corpus types, all 100% win rate
    expect(report.compression.points).toHaveLength(5);
    for (const p of report.compression.points) {
      expect(p.winRate).toBe(1.0);
    }

    // Frontier properties: all true (mechanized)
    expect(report.frontierProperties.monotone).toBe(true);
    expect(report.frontierProperties.zeroAtMatch).toBe(true);
    expect(report.frontierProperties.positiveBelow).toBe(true);
    expect(report.frontierProperties.pigeonholeWitness).toBe(true);
  });

  it('protocol overhead is monotonically decreasing (Buley frontier shape)', () => {
    const report = buildBuleyFrontierReport();
    const points = report.protocol.points;

    // HTTP/1.1 has highest overhead
    expect(points[0].protocol).toBe('HTTP/1.1');
    expect(points[0].overheadPct).toBe(31.0);

    // Aeon Flow has lowest overhead
    expect(points[3].protocol).toBe('Aeon Flow');
    expect(points[3].overheadPct).toBe(1.5);

    // Strictly decreasing
    expect(points[1].overheadPct).toBeLessThan(points[0].overheadPct);
    expect(points[2].overheadPct).toBeLessThan(points[1].overheadPct);
    expect(points[3].overheadPct).toBeLessThan(points[2].overheadPct);
  });

  it('pipeline idle fraction increases with Reynolds number', () => {
    const report = buildBuleyFrontierReport();
    // Higher Re = less diversity relative to workload = more waste
    // This is the Buley frontier: waste monotonically non-increasing in diversity
    const low = report.pipeline.points[0]; // Re = 0.1 (high diversity)
    const high =
      report.pipeline.points[report.pipeline.points.length - 1]; // Re = 16 (low diversity)

    expect(low.idleFraction).toBeLessThan(0.1);
    expect(high.idleFraction).toBeGreaterThan(0.9);
  });

  it('compression topology always wins (100% win rate across corpora)', () => {
    const report = buildBuleyFrontierReport();
    // The diverse strategy (topology) subsumes every fixed strategy
    // Win rate = 1.0 is the frontier: racing achieves zero deficit
    for (const p of report.compression.points) {
      expect(p.winRate).toBe(1.0);
      expect(p.gainVsHeuristicPct).toBeGreaterThan(0);
    }
  });

  it('heterogeneous content benefits more from diversity', () => {
    const report = buildBuleyFrontierReport();
    const points = report.compression.points;
    // api-telemetry (most heterogeneous) has highest gain
    const apiGain = points.find(
      (p) => p.corpus === 'api-telemetry',
    )!.gainVsHeuristicPct;
    const textGain = points.find(
      (p) => p.corpus === 'text-homogeneous',
    )!.gainVsHeuristicPct;
    expect(apiGain).toBeGreaterThan(textGain);
    expect(apiGain).toBeGreaterThan(40); // 46.4%
  });

  it('renders markdown output', () => {
    const report = buildBuleyFrontierReport();
    const md = renderBuleyFrontierMarkdown(report);
    expect(md).toContain('Buley Frontier');
    expect(md).toContain('Protocol Framing Overhead');
    expect(md).toContain('Pipeline Idle Fraction');
    expect(md).toContain('Compression Topology Gain');
    expect(md).toContain('BuleyFrontier.lean');
    expect(md).toContain('31');
    expect(md).toContain('1.5');
  });

  it('renders SVG output with three panels', () => {
    const report = buildBuleyFrontierReport();
    const svg = renderBuleyFrontierSvg(report);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Buley Frontier');
    expect(svg).toContain('Protocol Framing Overhead');
    expect(svg).toContain('Pipeline Idle Fraction');
    expect(svg).toContain('Cost of Monoculture');
    expect(svg).toContain('THM-BULEY-FRONTIER');
    // Three panels present
    expect(svg).toContain('A.');
    expect(svg).toContain('B.');
    expect(svg).toContain('C.');
  });
});
