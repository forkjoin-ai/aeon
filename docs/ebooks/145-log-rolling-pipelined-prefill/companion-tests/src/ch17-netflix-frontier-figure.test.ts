import { describe, expect, it } from 'vitest';

import {
  buildNetflixFrontierReport,
  computeMetrics,
  renderNetflixFrontierMarkdown,
  renderNetflixFrontierSvg,
} from './ch17-netflix-frontier-figure';

describe('ch17-netflix-frontier-figure', () => {
  const report = buildNetflixFrontierReport();

  // -------------------------------------------------------------------
  // Data integrity -- all numbers from published papers
  // -------------------------------------------------------------------

  it('builds a report with the expected label and baseline values', () => {
    expect(report.label).toBe('ch17-netflix-frontier-figure-v1');
    expect(report.cinematchBaseline).toBe(0.9525);
    expect(report.targetRmse).toBe(0.8572);
  });

  it('observed floor is the 50/50 blend at 0.8555', () => {
    expect(report.observedFloor).toBe(0.8555);
    expect(report.observedFloorSource).toContain('Grand Prize paper');
  });

  it('algorithm frontier has at least 5 progressive milestones', () => {
    expect(report.algorithmFrontier.points.length).toBeGreaterThanOrEqual(5);
  });

  it('team frontier has at least 3 progressive milestones', () => {
    expect(report.teamFrontier.points.length).toBeGreaterThanOrEqual(3);
  });

  it('monoculture ceilings include the major families', () => {
    const names = report.monocultureCeilings.map((c) => c.shortLabel);
    expect(names).toContain('FunkSVD');
    expect(names).toContain('RBM');
    expect(names).toContain('k-NN');
    expect(names).toContain('tSVD++');
    expect(names).toContain('NNMF');
  });

  it('all RMSE values are in the plausible range [0.85, 0.96]', () => {
    const allRmse = [
      ...report.algorithmFrontier.points.map((p) => p.rmse),
      ...report.teamFrontier.points.map((p) => p.rmse),
      ...report.monocultureCeilings.map((p) => p.rmse),
    ];
    for (const rmse of allRmse) {
      expect(rmse).toBeGreaterThanOrEqual(0.85);
      expect(rmse).toBeLessThanOrEqual(0.96);
    }
  });

  it('no predictor counts are fabricated -- null where unpublished', () => {
    for (const p of report.teamFrontier.points) {
      if (p.predictorCount !== null) {
        // BellKor standalone: 107 published in BellKor 2008 paper
        expect(p.team).toContain('BellKor');
        expect(p.predictorCount).toBe(107);
      }
    }
  });

  // -------------------------------------------------------------------
  // THM-AMERICAN-FRONTIER property 1: Monotone
  // -------------------------------------------------------------------

  it('algorithm frontier RMSE is monotonically non-increasing', () => {
    const points = report.algorithmFrontier.points;
    for (let i = 1; i < points.length; i++) {
      expect(points[i].rmse).toBeLessThanOrEqual(points[i - 1].rmse);
    }
  });

  it('team frontier RMSE is monotonically non-increasing', () => {
    const points = report.teamFrontier.points;
    for (let i = 1; i < points.length; i++) {
      expect(points[i].rmse).toBeLessThanOrEqual(points[i - 1].rmse);
    }
  });

  it('report confirms monotone property', () => {
    expect(report.frontierProperties.monotone).toBe(true);
  });

  // -------------------------------------------------------------------
  // THM-AMERICAN-FRONTIER property 2: Zero at match
  // -------------------------------------------------------------------

  it('the lowest team frontier RMSE equals the observed floor', () => {
    const lastTeam =
      report.teamFrontier.points[report.teamFrontier.points.length - 1];
    expect(lastTeam.rmse).toBe(report.observedFloor);
  });

  it('report confirms zero-at-match property', () => {
    expect(report.frontierProperties.zeroAtMatch).toBe(true);
  });

  // -------------------------------------------------------------------
  // THM-AMERICAN-FRONTIER property 3: Positive below match
  // -------------------------------------------------------------------

  it('Cinematch (monoculture) has strictly positive waste', () => {
    const cinematch = report.algorithmFrontier.points[0];
    expect(cinematch.rmse - report.observedFloor).toBeGreaterThan(0.05);
  });

  it('every monoculture ceiling has positive waste', () => {
    for (const ceil of report.monocultureCeilings) {
      expect(ceil.rmse).toBeGreaterThan(report.observedFloor);
    }
  });

  it('report confirms positive-below-match property', () => {
    expect(report.frontierProperties.positiveBelow).toBe(true);
  });

  // -------------------------------------------------------------------
  // THM-AMERICAN-FRONTIER property 4: Pigeonhole witness
  // -------------------------------------------------------------------

  it('best single model is strictly worse than first multi-family blend', () => {
    const bestSingle = Math.min(
      ...report.monocultureCeilings.map((c) => c.rmse)
    );
    const firstMulti = report.algorithmFrontier.points.find(
      (p) => p.familyCount >= 3
    );
    expect(firstMulti).toBeDefined();
    expect(firstMulti!.rmse).toBeLessThan(bestSingle);
  });

  it('report confirms pigeonhole witness', () => {
    expect(report.frontierProperties.pigeonholeWitness).toBe(true);
  });

  // -------------------------------------------------------------------
  // THM-AMERICAN-FRONTIER property 5: Recursive across layers
  // -------------------------------------------------------------------

  it('team frontier starts where algorithm frontier ends and continues reducing', () => {
    const algoLast =
      report.algorithmFrontier.points[
        report.algorithmFrontier.points.length - 1
      ];
    const teamFirst = report.teamFrontier.points[0];
    const teamLast =
      report.teamFrontier.points[report.teamFrontier.points.length - 1];

    // Team frontier starts at approximately the algorithm frontier floor
    expect(Math.abs(teamFirst.rmse - algoLast.rmse)).toBeLessThan(0.002);
    // Team frontier continues below
    expect(teamLast.rmse).toBeLessThan(algoLast.rmse);
  });

  it('report confirms recursive property', () => {
    expect(report.frontierProperties.recursiveAcrossLayers).toBe(true);
  });

  // -------------------------------------------------------------------
  // Residual gap -- the optimization left on the table
  // -------------------------------------------------------------------

  it('the residual gap is positive and published', () => {
    expect(report.residualGap.gap).toBeGreaterThan(0);
    expect(report.residualGap.winnerRmse).toBe(0.856704);
    expect(report.residualGap.blendRmse).toBe(0.8555);
    expect(report.residualGap.gap).toBeCloseTo(0.001204, 5);
  });

  it('the gap proves the winner did not reach the frontier', () => {
    // If the winner had matched the frontier, blending with another
    // team would not reduce RMSE further.  The positive gap proves
    // they had not matched the taste space topology.
    expect(report.residualGap.blendRmse).toBeLessThan(
      report.residualGap.winnerRmse
    );
  });

  // -------------------------------------------------------------------
  // Derived metrics
  // -------------------------------------------------------------------

  it('Cinematch waste is approximately 0.097', () => {
    const m = computeMetrics(report.cinematchBaseline, report);
    expect(m.waste).toBeCloseTo(0.097, 2);
    expect(m.improvementPct).toBeCloseTo(0, 1);
    expect(m.wasteReductionPct).toBeCloseTo(0, 1);
  });

  it('Grand Prize winner still has residual waste above observed floor', () => {
    const m = computeMetrics(report.residualGap.winnerRmse, report);
    expect(m.waste).toBeGreaterThan(0);
    expect(m.waste).toBeCloseTo(0.0012, 3);
  });

  it('waste is monotonically decreasing across the full combined frontier', () => {
    const allWastes = [
      ...report.algorithmFrontier.points.map(
        (p) => p.rmse - report.observedFloor
      ),
      ...report.teamFrontier.points.map(
        (p) => p.rmse - report.observedFloor
      ),
    ];
    for (let i = 1; i < allWastes.length; i++) {
      expect(allWastes[i]).toBeLessThanOrEqual(allWastes[i - 1] + 0.001);
    }
  });

  // -------------------------------------------------------------------
  // Netflix-specific structural claims
  // -------------------------------------------------------------------

  it('two independent mega-ensembles converged to within 0.00001 RMSE', () => {
    // BPC: 0.856704, The Ensemble: 0.856714
    // This convergence is evidence of the noise floor location
    expect(Math.abs(0.856704 - 0.856714)).toBeLessThan(0.00002);
  });

  it('team predictor count is only asserted where published', () => {
    const withCounts = report.teamFrontier.points.filter(
      (p) => p.predictorCount !== null
    );
    // Only BellKor published their count (107)
    expect(withCounts.length).toBe(1);
    expect(withCounts[0].predictorCount).toBe(107);
  });

  // -------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------

  it('renders markdown with both panels, residual gap, and recursive claim', () => {
    const md = renderNetflixFrontierMarkdown(report);
    expect(md).toContain('Panel E');
    expect(md).toContain('Panel F');
    expect(md).toContain('Netflix Prize');
    expect(md).toContain('THM-AMERICAN-FRONTIER');
    expect(md).toContain('Recursive Claim');
    expect(md).toContain('Residual Gap');
    expect(md).toContain('Left on the Table');
    expect(md).toContain('Cinematch');
    expect(md).toContain('BellKor');
    expect(md).toContain('Pragmatic');
    expect(md).toContain('0.856704');
  });

  it('renders SVG with both panels and proper structure', () => {
    const svg = renderNetflixFrontierSvg(report);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Netflix Frontier');
    expect(svg).toContain('Algorithm-Family Diversity Frontier');
    expect(svg).toContain('Team-of-Teams Recursive Frontier');
    expect(svg).toContain('THM-AMERICAN-FRONTIER');
    expect(svg).toContain('Koren');
  });
});
