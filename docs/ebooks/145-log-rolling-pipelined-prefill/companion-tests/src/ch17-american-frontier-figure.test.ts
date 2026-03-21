import { describe, expect, it } from 'vitest';

import {
  buildAmericanFrontierReport,
  renderAmericanFrontierMarkdown,
  renderAmericanFrontierSvg,
} from './ch17-american-frontier-figure';

describe('ch17-american-frontier-figure', () => {
  it('builds the American Frontier report with recursive wire witness data', () => {
    const report = buildAmericanFrontierReport();

    expect(report.label).toBe('ch17-american-frontier-figure-v2');
    expect(report.protocol.points).toHaveLength(4);
    expect(report.pipeline.points.length).toBeGreaterThan(5);
    expect(report.encoding.points).toHaveLength(5);
    expect(report.transport.points.length).toBeGreaterThanOrEqual(5);
    expect(report.frontierProperties.monotone).toBe(true);
    expect(report.frontierProperties.recursiveAcrossLayers).toBe(true);
  });

  it('protocol waste is strictly decreasing across the framing frontier', () => {
    const overheads = buildAmericanFrontierReport().protocol.points.map(
      (point) => point.overheadPct
    );

    for (let index = 1; index < overheads.length; index++) {
      expect(overheads[index]).toBeLessThan(overheads[index - 1]);
    }
  });

  it('pipeline idle fraction rises as Reynolds number rises', () => {
    const points = buildAmericanFrontierReport().pipeline.points;
    expect(points[0].idleFraction).toBeLessThan(0.1);
    expect(points[points.length - 1].idleFraction).toBeGreaterThan(0.9);

    for (let index = 1; index < points.length; index++) {
      expect(points[index].idleFraction).toBeGreaterThan(
        points[index - 1].idleFraction
      );
    }
  });

  it('encoding monoculture waste grows with heterogeneity', () => {
    const points = buildAmericanFrontierReport().encoding.points;
    const api = points.find((point) => point.corpus === 'api-telemetry');
    const text = points.find((point) => point.corpus === 'text-homogeneous');

    expect(api).toBeDefined();
    expect(text).toBeDefined();
    expect(api!.gainVsHeuristicPct).toBeGreaterThan(text!.gainVsHeuristicPct);
    expect(api!.gainVsHeuristicPct).toBeGreaterThan(40);
  });

  it('recursive wire frontier reduces waste as effective Aeon share rises', () => {
    const points = buildAmericanFrontierReport().transport.points;

    let previousShare = -1;
    let previousWaste = Number.POSITIVE_INFINITY;
    for (const point of points) {
      const share = (point.aeonWins / (point.aeonWins + point.httpWins)) * 100;
      expect(share).toBeGreaterThan(previousShare);
      expect(point.wasteBytesPerWin).toBeLessThanOrEqual(previousWaste);
      previousShare = share;
      previousWaste = point.wasteBytesPerWin;
    }
  });

  it('heavy recursive witness keeps most throughput while collapsing waste', () => {
    const heavy = buildAmericanFrontierReport().transport.heavyWitness;

    expect(heavy.zeroSkewWasteBytesPerWin).toBeGreaterThan(
      heavy.tcpDelay2msWasteBytesPerWin
    );
    expect(heavy.tcpDelay2msAeonWinSharePct).toBeGreaterThan(99);
    expect(heavy.throughputRetentionPct).toBeGreaterThan(80);
  });

  it('renders markdown output with the recursive claim', () => {
    const markdown = renderAmericanFrontierMarkdown(
      buildAmericanFrontierReport()
    );

    expect(markdown).toContain('American Frontier');
    expect(markdown).toContain('Framing Waste by Protocol');
    expect(markdown).toContain('Encoding Waste by Content Mix');
    expect(markdown).toContain('Aeon/UDP vs HTTP/TCP Mixed Race');
    expect(markdown).toContain('inverse-Bule control knob');
    expect(markdown).toContain('AmericanFrontier.lean');
  });

  it('renders SVG output with four panels and recursive wire language', () => {
    const svg = renderAmericanFrontierSvg(buildAmericanFrontierReport());

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('The American Frontier');
    expect(svg).toContain('Framing Waste by Protocol');
    expect(svg).toContain('Idle Waste by Reynolds Regime');
    expect(svg).toContain('Encoding Waste by Content Mix');
    expect(svg).toContain('Aeon/UDP vs HTTP/TCP Mixed Race');
    expect(svg).toContain('HTTP/TCP dominates');
    expect(svg).toContain('Aeon/UDP dominates');
    expect(svg).toContain('TCP hedge delay');
    expect(svg).toContain('THM-AMERICAN-FRONTIER');
    expect(svg).toContain('Heavy recursive witness');
    expect(svg).toContain('Recursive reading of THM-AMERICAN-FRONTIER');
  });
});
