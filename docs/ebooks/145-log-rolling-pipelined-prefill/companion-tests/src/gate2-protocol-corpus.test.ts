import { describe, expect, it } from 'vitest';

import {
  makeDefaultGate2Config,
  renderGate2Markdown,
  runGate2Corpus,
} from './gate2-protocol-corpus';

describe('Gate 2 protocol corpus harness', () => {
  it('passes the default seeded matrix', () => {
    const report = runGate2Corpus(makeDefaultGate2Config());

    expect(report.gate.pass).toBe(true);
    expect(report.gate.primaryCells.length).toBeGreaterThan(0);
    expect(report.gate.failedPrimaryCells).toHaveLength(0);
    expect(report.cells.every((cell) => cell.framingMedianGainPct > 0)).toBe(
      true
    );
  });

  it('denies when thresholds are intentionally impossible', () => {
    const base = makeDefaultGate2Config();
    const strict = {
      ...base,
      thresholds: {
        ...base.thresholds,
        minCompletionMedianWinRate: 1.01,
        minCompletionP95WinRate: 1.01,
      },
    };

    const report = runGate2Corpus(strict);
    expect(report.gate.pass).toBe(false);
    expect(report.gate.failedPrimaryCells.length).toBeGreaterThan(0);
  });

  it('renders markdown with matrix + verdict sections', () => {
    const report = runGate2Corpus(makeDefaultGate2Config());
    const markdown = renderGate2Markdown(report);

    expect(markdown).toContain('# Gate 2 Protocol Corpus Matrix');
    expect(markdown).toContain('## Verdict');
    expect(markdown).toContain('| Cell | Primary | Sites |');
  });
});
