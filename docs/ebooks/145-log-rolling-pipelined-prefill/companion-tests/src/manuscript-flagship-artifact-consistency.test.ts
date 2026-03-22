import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  CH17_CHAPTER_ROOT,
  resolveCh17ManuscriptPath,
} from './manuscript-variant.js';

interface Interval {
  readonly low: number;
  readonly high: number;
}

interface Gate1Cell {
  readonly cellId: string;
  readonly speedupMedian: number;
  readonly speedupMedianCi: Interval;
  readonly improvementMedianMsCi: Interval;
}

interface Gate1Report {
  readonly cells: readonly Gate1Cell[];
  readonly gate: {
    readonly primaryCells: readonly string[];
    readonly passedPrimaryCells: readonly string[];
  };
}

interface Gate2Cell {
  readonly cellId: string;
  readonly framingMedianGainPct: number;
  readonly framingMedianGainPctCi: Interval;
  readonly completionMedianGainMs: number;
  readonly completionMedianGainMsCi: Interval;
  readonly completionP95GainMs: number;
  readonly completionP95GainMsCi: Interval;
}

interface Gate2Report {
  readonly corpus: {
    readonly siteCount: number;
    readonly totalResources: number;
  };
  readonly cells: readonly Gate2Cell[];
  readonly gate: {
    readonly primaryCells: readonly string[];
    readonly passedPrimaryCells: readonly string[];
  };
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function min(values: readonly number[]): number {
  return values.reduce(
    (acc, value) => (value < acc ? value : acc),
    Number.POSITIVE_INFINITY
  );
}

function max(values: readonly number[]): number {
  return values.reduce(
    (acc, value) => (value > acc ? value : acc),
    Number.NEGATIVE_INFINITY
  );
}

function formatInteger(value: number): string {
  return value.toLocaleString('en-US');
}

function mustContain(manuscript: string, token: string): void {
  expect(manuscript.includes(token)).toBe(true);
}

describe('Flagship manuscript artifact consistency', () => {
  it('pins flagship quantitative claims to gate artifacts', () => {
    const manuscript = readFileSync(resolveCh17ManuscriptPath('flagship'), 'utf8');
    const artifactsDir = join(CH17_CHAPTER_ROOT, 'companion-tests', 'artifacts');
    const gate1 = loadJson<Gate1Report>(
      join(artifactsDir, 'gate1-wallclock-external-multihost.json')
    );
    const gate2 = loadJson<Gate2Report>(
      join(artifactsDir, 'gate2-protocol-corpus.json')
    );

    const gate1Primary = gate1.cells.filter((cell) =>
      gate1.gate.primaryCells.includes(cell.cellId)
    );
    const gate1SpeedupRange = `${min(
      gate1Primary.map((cell) => cell.speedupMedian)
    ).toFixed(3)}x-${max(gate1Primary.map((cell) => cell.speedupMedian)).toFixed(
      3
    )}x`;
    const gate1MinSpeedupCiLow = `${min(
      gate1Primary.map((cell) => cell.speedupMedianCi.low)
    ).toFixed(3)}x`;
    const gate1MinImprovementCiLow = `${Math.round(
      min(gate1.cells.map((cell) => cell.improvementMedianMsCi.low))
    )} ms`;

    mustContain(
      manuscript,
      `${gate1.gate.passedPrimaryCells.length}/${gate1.gate.primaryCells.length}`
    );
    mustContain(manuscript, gate1SpeedupRange);
    mustContain(manuscript, gate1MinSpeedupCiLow);
    mustContain(manuscript, gate1MinImprovementCiLow);

    const gate2Primary = gate2.cells.filter((cell) =>
      gate2.gate.primaryCells.includes(cell.cellId)
    );
    const gate2Benign = gate2.cells.find((cell) => cell.cellId === 'rtt12-bw80-loss0');
    const gate2Harsh = gate2.cells.find(
      (cell) => cell.cellId === 'rtt110-bw7-loss2pct'
    );
    const gate2PrimaryExample = gate2Primary[0];

    expect(gate2PrimaryExample).toBeDefined();
    expect(gate2Benign).toBeDefined();
    expect(gate2Harsh).toBeDefined();

    mustContain(
      manuscript,
      `${formatInteger(gate2.corpus.siteCount)} sites and ${formatInteger(
        gate2.corpus.totalResources
      )} resources`
    );
    mustContain(
      manuscript,
      `${gate2.gate.passedPrimaryCells.length}/${gate2.gate.primaryCells.length}`
    );
    mustContain(manuscript, gate2PrimaryExample!.framingMedianGainPct.toFixed(3));
    mustContain(
      manuscript,
      `${min(gate2Primary.map((cell) => cell.framingMedianGainPctCi.low)).toFixed(
        2
      )}%`
    );
    mustContain(manuscript, gate2Benign!.completionMedianGainMs.toFixed(2));
    mustContain(manuscript, gate2Benign!.completionP95GainMs.toFixed(2));
    mustContain(manuscript, gate2Harsh!.completionMedianGainMs.toFixed(2));
    mustContain(manuscript, gate2Harsh!.completionP95GainMs.toFixed(1));
  });
});
