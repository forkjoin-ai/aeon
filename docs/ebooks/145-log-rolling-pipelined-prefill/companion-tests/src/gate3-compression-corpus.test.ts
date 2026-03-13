import { describe, expect, it } from 'vitest';

import { makeDefaultGate3Config, renderGate3Markdown, runGate3Corpus } from './gate3-compression-corpus';

function makeFastConfig() {
  const base = makeDefaultGate3Config();
  return {
    ...base,
    sampleCountPerFamily: 2,
    payloadScale: 0.06,
    bootstrapResamples: 120,
    roundtripSpotChecks: 2,
    thresholds: {
      ...base.thresholds,
      minWinRateVsBestFixed: 0.5,
      minWinRateVsHeuristic: 0.5,
    },
  };
}

describe('Gate 3 compression corpus harness', () => {
  it(
    'passes the default criteria on a reduced deterministic corpus',
    { timeout: 120000 },
    () => {
      const report = runGate3Corpus(makeFastConfig());
      expect(report.gate.pass).toBe(true);
      expect(report.gate.primaryCells.length).toBeGreaterThan(0);
      expect(report.gate.failedPrimaryCells).toHaveLength(0);
    },
  );

  it(
    'denies when thresholds are intentionally impossible',
    { timeout: 120000 },
    () => {
      const fast = makeFastConfig();
      const strict = {
        ...fast,
        thresholds: {
          ...fast.thresholds,
          gainVsBestFixedMedianLowerCiPct: 25,
          gainVsHeuristicMedianLowerCiPct: 25,
        },
      };
      const report = runGate3Corpus(strict);
      expect(report.gate.pass).toBe(false);
      expect(report.gate.failedPrimaryCells.length).toBeGreaterThan(0);
    },
  );

  it(
    'renders markdown with verdict + matrix sections',
    { timeout: 120000 },
    () => {
      const report = runGate3Corpus(makeFastConfig());
      const markdown = renderGate3Markdown(report);
      expect(markdown).toContain('# Gate 3 Compression Corpus Matrix');
      expect(markdown).toContain('## Verdict');
      expect(markdown).toContain('| Cell | Primary | Samples |');
    },
  );
});
