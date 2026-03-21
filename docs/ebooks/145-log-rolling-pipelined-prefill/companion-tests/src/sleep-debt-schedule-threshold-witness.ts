import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SleepDebtScheduleThresholdScenarioReport {
  readonly id: string;
  readonly description: string;
  readonly scheduledWake: number;
  readonly recoveryQuota: number;
  readonly cycleCount: number;
  readonly scheduleSurplus: number;
  readonly debtAfterCycles: number;
  readonly theoremRefs: readonly string[];
}

export interface SleepDebtScheduleThresholdWitnessReport {
  readonly label: 'sleep-debt-schedule-threshold-witness-v1';
  readonly aggregate: {
    readonly subcriticalStaysZero: boolean;
    readonly criticalStaysZero: boolean;
    readonly supercriticalGrowsLinearly: boolean;
  };
  readonly scenarios: readonly SleepDebtScheduleThresholdScenarioReport[];
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const defaultArtifactPath = resolve(
  moduleDir,
  '../artifacts/sleep-debt-schedule-threshold-witness.json'
);

function scheduleSurplus(scheduledWake: number, recoveryQuota: number): number {
  return Math.max(scheduledWake - recoveryQuota, 0);
}

function iteratedDebt(
  cycleCount: number,
  scheduledWake: number,
  recoveryQuota: number
): number {
  return cycleCount * scheduleSurplus(scheduledWake, recoveryQuota);
}

export function buildSleepDebtScheduleThresholdWitnessReport(): SleepDebtScheduleThresholdWitnessReport {
  const scenarios: readonly SleepDebtScheduleThresholdScenarioReport[] = [
    {
      id: 'subcritical-schedule-stays-bounded',
      description:
        'A wake schedule below the recovery quota has zero surplus, so repeated cycles do not accumulate carried debt.',
      scheduledWake: 3,
      recoveryQuota: 4,
      cycleCount: 4,
      scheduleSurplus: scheduleSurplus(3, 4),
      debtAfterCycles: iteratedDebt(4, 3, 4),
      theoremRefs: ['SleepDebtSchedule.iterated_debt_eq_zero_of_wake_le_quota'],
    },
    {
      id: 'critical-schedule-stays-bounded',
      description:
        'A wake schedule exactly at the recovery quota remains on the zero-surplus boundary and stays debt-free across repeated cycles.',
      scheduledWake: 4,
      recoveryQuota: 4,
      cycleCount: 4,
      scheduleSurplus: scheduleSurplus(4, 4),
      debtAfterCycles: iteratedDebt(4, 4, 4),
      theoremRefs: ['SleepDebtSchedule.iterated_debt_eq_zero_of_wake_le_quota'],
    },
    {
      id: 'supercritical-schedule-grows-linearly',
      description:
        'A wake schedule above the recovery quota has positive surplus, so repeated cycles accumulate debt linearly in the cycle count.',
      scheduledWake: 6,
      recoveryQuota: 4,
      cycleCount: 4,
      scheduleSurplus: scheduleSurplus(6, 4),
      debtAfterCycles: iteratedDebt(4, 6, 4),
      theoremRefs: [
        'SleepDebtSchedule.iterated_debt_eq_cycle_count_mul_gap',
        'SleepDebtSchedule.iterated_debt_positive_above_threshold',
        'SleepDebtSchedule.iterated_debt_strictly_increases_above_threshold',
      ],
    },
  ];

  return {
    label: 'sleep-debt-schedule-threshold-witness-v1',
    aggregate: {
      subcriticalStaysZero: scenarios[0]?.debtAfterCycles === 0,
      criticalStaysZero: scenarios[1]?.debtAfterCycles === 0,
      supercriticalGrowsLinearly:
        scenarios[2]?.debtAfterCycles ===
        (scenarios[2]?.cycleCount ?? 0) * (scenarios[2]?.scheduleSurplus ?? 0),
    },
    scenarios,
  };
}

export function loadCheckedInSleepDebtScheduleThresholdWitness(
  artifactPath = defaultArtifactPath
): SleepDebtScheduleThresholdWitnessReport {
  return JSON.parse(
    readFileSync(artifactPath, 'utf8')
  ) as SleepDebtScheduleThresholdWitnessReport;
}

export function renderSleepDebtScheduleThresholdWitnessMarkdown(
  report: SleepDebtScheduleThresholdWitnessReport
): string {
  const lines: string[] = [];
  lines.push('# Sleep-Debt Schedule Threshold Witness');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push('');
  lines.push(
    '| Scenario | Wake | Quota | Cycles | Surplus | Debt after cycles | Theorems |'
  );
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | --- |');

  for (const scenario of report.scenarios) {
    lines.push(
      `| \`${scenario.id}\` | ${scenario.scheduledWake} | ${
        scenario.recoveryQuota
      } | ${scenario.cycleCount} | ${scenario.scheduleSurplus} | ${
        scenario.debtAfterCycles
      } | \`${scenario.theoremRefs.join(', ')}\` |`
    );
  }

  lines.push('');
  lines.push(
    `- Subcritical schedule stays zero: \`${
      report.aggregate.subcriticalStaysZero ? 'yes' : 'no'
    }\``
  );
  lines.push(
    `- Critical schedule stays zero: \`${
      report.aggregate.criticalStaysZero ? 'yes' : 'no'
    }\``
  );
  lines.push(
    `- Supercritical schedule grows linearly: \`${
      report.aggregate.supercriticalGrowsLinearly ? 'yes' : 'no'
    }\``
  );
  lines.push('');
  lines.push(
    'Interpretation: this is a coarse discrete threshold witness for the schedule boundary behind the literature-side bifurcation story. It does not claim to be the full McCauley ODE system; it only proves that below-threshold schedules stay debt-free while above-threshold schedules accumulate debt linearly in the bounded cycle model.'
  );
  lines.push('');

  return `${lines.join('\n')}\n`;
}
