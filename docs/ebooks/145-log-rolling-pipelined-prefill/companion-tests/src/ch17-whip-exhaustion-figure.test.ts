import { describe, expect, it } from 'vitest';

import {
  buildCh17WhipExhaustionFigureReport,
  renderCh17WhipExhaustionFigureMarkdown,
  renderCh17WhipExhaustionFigureSvg,
} from './ch17-whip-exhaustion-figure';

describe('Chapter 17 whip exhaustion figure', () => {
  it('builds a standard dense-FFN report with correct beta_1 budget', () => {
    const report = buildCh17WhipExhaustionFigureReport({
      heads: 16,
      ffnExpansion: 4,
      moeExperts: 0,
      moeTopK: 0,
    });

    expect(report.label).toBe('ch17-whip-exhaustion-figure-v1');
    expect(report.axes).toHaveLength(4);
    expect(report.totalBeta1).toBe(20); // 1 + 15 + 1 + 3
    expect(report.whipCount).toBe(4);
    expect(report.axes[0].label).toBe('Residual-Attention');
    expect(report.axes[0].beta1).toBe(1);
    expect(report.axes[1].label).toContain('Attention Heads');
    expect(report.axes[1].beta1).toBe(15);
    expect(report.axes[2].label).toBe('Residual-FFN');
    expect(report.axes[2].beta1).toBe(1);
    expect(report.axes[3].label).toContain('FFN Neurons');
    expect(report.axes[3].beta1).toBe(3);
  });

  it('builds an MoE report with correct beta_1 budget', () => {
    const report = buildCh17WhipExhaustionFigureReport({
      heads: 16,
      ffnExpansion: 4,
      moeExperts: 8,
      moeTopK: 2,
    });

    expect(report.axes).toHaveLength(4);
    expect(report.totalBeta1).toBe(24); // 1 + 15 + 1 + 7
    expect(report.whipCount).toBe(4);
    expect(report.axes[3].label).toContain('MoE Experts');
    expect(report.axes[3].beta1).toBe(7);
    expect(report.axes[3].whipType).toBe('selective race');
  });

  it('verifies telescoping sum conservation: created = discharged', () => {
    const report = buildCh17WhipExhaustionFigureReport();
    const sumDischarged = report.telescopingSum.reduce((a, b) => a + b, 0);
    expect(sumDischarged).toBe(report.totalBeta1);
  });

  it('verifies energy taper: inner fold discharges more than outer', () => {
    const report = buildCh17WhipExhaustionFigureReport();
    // Attention heads (innermost geometric race) > each residual fold (outermost structural)
    const headAxis = report.axes.find((a) => a.label.includes('Attention Heads'));
    const residualAxis = report.axes.find((a) => a.label === 'Residual-Attention');
    expect(headAxis!.beta1).toBeGreaterThan(residualAxis!.beta1);
    expect(report.taperRatio).toBe(15); // 15:1 for N=16
  });

  it('generates valid SVG with all four whip labels', () => {
    const report = buildCh17WhipExhaustionFigureReport();
    const svg = renderCh17WhipExhaustionFigureSvg(report);

    expect(svg).toContain('<svg');
    expect(svg).toContain('Whip Exhaustion');
    expect(svg).toContain('WHIP 1');
    expect(svg).toContain('WHIP 2');
    expect(svg).toContain('WHIP 3');
    expect(svg).toContain('WHIP 4');
    expect(svg).toContain('beta_1 = 0');
    expect(svg).toContain('15 cycles');
    expect(svg).toContain('Excluded');
    expect(svg).toContain('Causal dependency');
    expect(svg).toContain('Entangled via QK');
  });

  it('generates markdown with conservation and taper', () => {
    const report = buildCh17WhipExhaustionFigureReport();
    const md = renderCh17WhipExhaustionFigureMarkdown(report);

    expect(md).toContain('# Chapter 17 Whip Exhaustion Figure');
    expect(md).toContain('Total beta_1 per layer:** 20');
    expect(md).toContain('Whip snaps per layer:** 4');
    expect(md).toContain('Excluded Dimensions');
    expect(md).toContain('Conservation');
    expect(md).toContain('Energy Taper');
    expect(md).toContain('computational taper');
  });

  it('exhaustively verifies all fork dimensions sum to total', () => {
    // This is the telescoping product identity from the theorem:
    // sum of all beta_1 contributions = total beta_1 per layer
    for (const config of [
      { heads: 16, ffnExpansion: 4, moeExperts: 0, moeTopK: 0 },
      { heads: 32, ffnExpansion: 4, moeExperts: 0, moeTopK: 0 },
      { heads: 16, ffnExpansion: 4, moeExperts: 8, moeTopK: 2 },
      { heads: 64, ffnExpansion: 4, moeExperts: 16, moeTopK: 2 },
      { heads: 8, ffnExpansion: 8, moeExperts: 0, moeTopK: 0 },
    ]) {
      const report = buildCh17WhipExhaustionFigureReport(config);
      const axisSum = report.axes.reduce((sum, a) => sum + a.beta1, 0);
      expect(axisSum).toBe(report.totalBeta1);
      // Verify the formula: N + (E if MoE, else f)
      // MoE replaces FFN — it doesn't add to it
      const expected =
        config.heads + (config.moeExperts > 0 ? config.moeExperts : config.ffnExpansion);
      expect(report.totalBeta1).toBe(expected);
      // After all folds, beta_1 = 0
      expect(report.whipCount).toBe(4);
    }
  });
});
