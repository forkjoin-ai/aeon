import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SleepDebtWeightedThresholdParameters {
  readonly cycleLengthTenths: number;
  readonly wakeBurdenRate: number;
  readonly recoveryRate: number;
  readonly criticalWakeTenths: number;
  readonly criticalWakeHours: number;
}

export interface SleepDebtWeightedThresholdScenarioReport {
  readonly id: string;
  readonly description: string;
  readonly scheduledWakeTenths: number;
  readonly scheduledWakeHours: number;
  readonly sleepQuotaTenths: number;
  readonly cycleCount: number;
  readonly thresholdLhs: number;
  readonly thresholdRhs: number;
  readonly weightedSurplusPerCycle: number;
  readonly debtAfterCycles: number;
  readonly theoremRefs: readonly string[];
}

export interface SleepDebtWeightedThresholdWitnessReport {
  readonly label: 'sleep-debt-weighted-threshold-witness-v1';
  readonly parameters: SleepDebtWeightedThresholdParameters;
  readonly aggregate: {
    readonly literatureBoundaryMatchesTwentyPointTwoHours: boolean;
    readonly subcriticalStaysZero: boolean;
    readonly criticalStaysZero: boolean;
    readonly supercriticalGrowsLinearly: boolean;
  };
  readonly scenarios: readonly SleepDebtWeightedThresholdScenarioReport[];
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const defaultArtifactPath = resolve(
  moduleDir,
  '../artifacts/sleep-debt-weighted-threshold-witness.json'
);

function thresholdLhs(
  scheduledWakeTenths: number,
  wakeBurdenRate: number,
  recoveryRate: number
): number {
  return scheduledWakeTenths * (wakeBurdenRate + recoveryRate);
}

function thresholdRhs(cycleLengthTenths: number, recoveryRate: number): number {
  return cycleLengthTenths * recoveryRate;
}

function weightedSurplus(
  cycleLengthTenths: number,
  scheduledWakeTenths: number,
  wakeBurdenRate: number,
  recoveryRate: number
): number {
  return Math.max(
    thresholdLhs(scheduledWakeTenths, wakeBurdenRate, recoveryRate) -
      thresholdRhs(cycleLengthTenths, recoveryRate),
    0
  );
}

function iteratedDebt(
  cycleCount: number,
  cycleLengthTenths: number,
  scheduledWakeTenths: number,
  wakeBurdenRate: number,
  recoveryRate: number
): number {
  return (
    cycleCount *
    weightedSurplus(
      cycleLengthTenths,
      scheduledWakeTenths,
      wakeBurdenRate,
      recoveryRate
    )
  );
}

export function buildSleepDebtWeightedThresholdWitnessReport(): SleepDebtWeightedThresholdWitnessReport {
  const parameters: SleepDebtWeightedThresholdParameters = {
    cycleLengthTenths: 240,
    wakeBurdenRate: 19,
    recoveryRate: 101,
    criticalWakeTenths: (240 * 101) / (19 + 101),
    criticalWakeHours: 20.2,
  };

  const scenarios: readonly SleepDebtWeightedThresholdScenarioReport[] = [
    {
      id: 'weighted-subcritical-18h',
      description:
        'A schedule below the calibrated 20.2-hour critical wake boundary has nonpositive weighted surplus, so repeated cycles stay debt-free.',
      scheduledWakeTenths: 180,
      scheduledWakeHours: 18.0,
      sleepQuotaTenths: parameters.cycleLengthTenths - 180,
      cycleCount: 4,
      thresholdLhs: thresholdLhs(
        180,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      thresholdRhs: thresholdRhs(
        parameters.cycleLengthTenths,
        parameters.recoveryRate
      ),
      weightedSurplusPerCycle: weightedSurplus(
        parameters.cycleLengthTenths,
        180,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      debtAfterCycles: iteratedDebt(
        4,
        parameters.cycleLengthTenths,
        180,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      theoremRefs: [
        'SleepDebtWeightedSchedule.weighted_surplus_eq_zero_of_not_crossed',
        'SleepDebtWeightedSchedule.iterated_debt_eq_zero_of_not_crossed',
      ],
    },
    {
      id: 'weighted-critical-20_2h',
      description:
        'The integerized weighted bridge matches the literature critical wake boundary exactly at 20.2 hours, so the boundary case still stays debt-free.',
      scheduledWakeTenths: 202,
      scheduledWakeHours: 20.2,
      sleepQuotaTenths: parameters.cycleLengthTenths - 202,
      cycleCount: 4,
      thresholdLhs: thresholdLhs(
        202,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      thresholdRhs: thresholdRhs(
        parameters.cycleLengthTenths,
        parameters.recoveryRate
      ),
      weightedSurplusPerCycle: weightedSurplus(
        parameters.cycleLengthTenths,
        202,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      debtAfterCycles: iteratedDebt(
        4,
        parameters.cycleLengthTenths,
        202,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      theoremRefs: [
        'SleepDebtWeightedSchedule.literature_boundary_tenths_closed_form',
        'SleepDebtWeightedSchedule.iterated_debt_eq_zero_of_not_crossed',
      ],
    },
    {
      id: 'weighted-supercritical-21h',
      description:
        'A schedule above the calibrated 20.2-hour critical wake boundary has positive weighted surplus, so repeated cycles accumulate debt linearly.',
      scheduledWakeTenths: 210,
      scheduledWakeHours: 21.0,
      sleepQuotaTenths: parameters.cycleLengthTenths - 210,
      cycleCount: 4,
      thresholdLhs: thresholdLhs(
        210,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      thresholdRhs: thresholdRhs(
        parameters.cycleLengthTenths,
        parameters.recoveryRate
      ),
      weightedSurplusPerCycle: weightedSurplus(
        parameters.cycleLengthTenths,
        210,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      debtAfterCycles: iteratedDebt(
        4,
        parameters.cycleLengthTenths,
        210,
        parameters.wakeBurdenRate,
        parameters.recoveryRate
      ),
      theoremRefs: [
        'SleepDebtWeightedSchedule.literature_boundary_crossed_at_twentyone_hours',
        'SleepDebtWeightedSchedule.iterated_debt_eq_cycle_count_mul_gap_of_crossed',
        'SleepDebtWeightedSchedule.iterated_debt_positive_above_threshold',
        'SleepDebtWeightedSchedule.iterated_debt_strictly_increases_above_threshold',
      ],
    },
  ];

  return {
    label: 'sleep-debt-weighted-threshold-witness-v1',
    parameters,
    aggregate: {
      literatureBoundaryMatchesTwentyPointTwoHours:
        parameters.criticalWakeTenths === 202 &&
        parameters.criticalWakeHours === 20.2,
      subcriticalStaysZero: scenarios[0]?.debtAfterCycles === 0,
      criticalStaysZero: scenarios[1]?.debtAfterCycles === 0,
      supercriticalGrowsLinearly:
        scenarios[2]?.debtAfterCycles ===
        (scenarios[2]?.cycleCount ?? 0) *
          (scenarios[2]?.weightedSurplusPerCycle ?? 0),
    },
    scenarios,
  };
}

export function loadCheckedInSleepDebtWeightedThresholdWitness(
  artifactPath = defaultArtifactPath
): SleepDebtWeightedThresholdWitnessReport {
  return JSON.parse(
    readFileSync(artifactPath, 'utf8')
  ) as SleepDebtWeightedThresholdWitnessReport;
}

export function renderSleepDebtWeightedThresholdWitnessMarkdown(
  report: SleepDebtWeightedThresholdWitnessReport
): string {
  const lines: string[] = [];
  lines.push('# Sleep-Debt Weighted Threshold Witness');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(
    `- Calibrated critical wake boundary: \`${report.parameters.criticalWakeHours.toFixed(1)} h\` (\`${report.parameters.criticalWakeTenths}\` tenths)`
  );
  lines.push(
    `- Weighted parameters: wake burden \`${report.parameters.wakeBurdenRate}\`, recovery \`${report.parameters.recoveryRate}\`, cycle length \`${report.parameters.cycleLengthTenths}\` tenths`
  );
  lines.push('');
  lines.push(
    '| Scenario | Wake (h) | Sleep (h) | Cycles | Threshold lhs | Threshold rhs | Weighted surplus | Debt after cycles | Theorems |'
  );
  lines.push(
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |'
  );

  for (const scenario of report.scenarios) {
    lines.push(
      `| \`${scenario.id}\` | ${scenario.scheduledWakeHours.toFixed(1)} | ${(scenario.sleepQuotaTenths / 10).toFixed(1)} | ${scenario.cycleCount} | ${scenario.thresholdLhs} | ${scenario.thresholdRhs} | ${scenario.weightedSurplusPerCycle} | ${scenario.debtAfterCycles} | \`${scenario.theoremRefs.join(', ')}\` |`
    );
  }

  lines.push('');
  lines.push(
    `- Literature boundary encoded exactly: \`${report.aggregate.literatureBoundaryMatchesTwentyPointTwoHours ? 'yes' : 'no'}\``
  );
  lines.push(
    `- Subcritical schedule stays zero: \`${report.aggregate.subcriticalStaysZero ? 'yes' : 'no'}\``
  );
  lines.push(
    `- Critical schedule stays zero: \`${report.aggregate.criticalStaysZero ? 'yes' : 'no'}\``
  );
  lines.push(
    `- Supercritical schedule grows linearly: \`${report.aggregate.supercriticalGrowsLinearly ? 'yes' : 'no'}\``
  );
  lines.push('');
  lines.push(
    'Interpretation: this is an integerized weighted repeated-cycle bridge, not the full McCauley/Van Dongen ODE system. It chooses rate parameters so the discrete critical wake boundary lands exactly at 20.2 hours, then proves that schedules below or at that boundary stay debt-free while schedules above it accumulate weighted carried debt linearly.'
  );
  lines.push('');

  return `${lines.join('\n')}\n`;
}
