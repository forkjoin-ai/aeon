import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SleepDebtScenarioReport {
  readonly id: string;
  readonly description: string;
  readonly sleepType: 'full' | 'partial';
  readonly wakeLoadAtSleep: number;
  readonly carriedDebtAtSleep: number;
  readonly recoveryQuota: number;
  readonly totalRecoveryDemand: number;
  readonly residualDebtAfterSleep: number;
  readonly effectiveCapacityNextWake: number;
  readonly nextWakeLoad: number;
  readonly intrusionThreshold: number;
  readonly intrusionEnabledNextWake: boolean;
  readonly theoremRefs: readonly string[];
}

export interface SleepDebtBoundedWitnessReport {
  readonly label: 'sleep-debt-bounded-witness-v1';
  readonly constants: {
    readonly maxCapacity: number;
    readonly recoveryQuota: number;
    readonly intrusionThreshold: number;
  };
  readonly aggregate: {
    readonly fullRecoveryRestoresBaseline: boolean;
    readonly partialRecoveryLeavesPositiveDebt: boolean;
    readonly chronicTruncationEnablesIntrusion: boolean;
  };
  readonly scenarios: readonly SleepDebtScenarioReport[];
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const defaultArtifactPath = resolve(
  moduleDir,
  '../artifacts/sleep-debt-bounded-witness.json'
);

function residualDebt(
  wakeLoadAtSleep: number,
  carriedDebtAtSleep: number,
  recoveryQuota: number
): number {
  return Math.max(wakeLoadAtSleep + carriedDebtAtSleep - recoveryQuota, 0);
}

function effectiveCapacity(maxCapacity: number, carriedDebt: number): number {
  return Math.max(maxCapacity - Math.min(maxCapacity, carriedDebt), 0);
}

function intrusionEnabled(
  nextWakeLoad: number,
  carriedDebt: number,
  intrusionThreshold: number
): boolean {
  return nextWakeLoad > 0 && carriedDebt >= intrusionThreshold;
}

export function buildSleepDebtBoundedWitnessReport(): SleepDebtBoundedWitnessReport {
  const constants = {
    maxCapacity: 5,
    recoveryQuota: 3,
    intrusionThreshold: 3,
  } as const;

  const scenarios: readonly SleepDebtScenarioReport[] = [
    {
      id: 'full-recovery-baseline',
      description:
        'Recovery quota matches the total burden, so the next cycle starts debt-free at full service capacity.',
      sleepType: 'full',
      wakeLoadAtSleep: 3,
      carriedDebtAtSleep: 0,
      recoveryQuota: constants.recoveryQuota,
      totalRecoveryDemand: 3,
      residualDebtAfterSleep: residualDebt(3, 0, constants.recoveryQuota),
      effectiveCapacityNextWake: effectiveCapacity(constants.maxCapacity, 0),
      nextWakeLoad: 1,
      intrusionThreshold: constants.intrusionThreshold,
      intrusionEnabledNextWake: intrusionEnabled(1, 0, constants.intrusionThreshold),
      theoremRefs: [
        'SleepDebt.full_recovery_clears_residual_debt',
        'SleepDebt.full_recovery_restores_capacity',
      ],
    },
    {
      id: 'partial-recovery-residual-debt',
      description:
        'Recovery quota is too short to clear the wake burden, so positive debt carries into the next cycle and reduces capacity.',
      sleepType: 'partial',
      wakeLoadAtSleep: 5,
      carriedDebtAtSleep: 0,
      recoveryQuota: constants.recoveryQuota,
      totalRecoveryDemand: 5,
      residualDebtAfterSleep: residualDebt(5, 0, constants.recoveryQuota),
      effectiveCapacityNextWake: effectiveCapacity(constants.maxCapacity, 2),
      nextWakeLoad: 1,
      intrusionThreshold: constants.intrusionThreshold,
      intrusionEnabledNextWake: intrusionEnabled(1, 2, constants.intrusionThreshold),
      theoremRefs: [
        'SleepDebt.partial_recovery_leaves_positive_debt',
        'SleepDebt.partial_recovery_lowers_next_capacity',
      ],
    },
    {
      id: 'chronic-truncation-intrusion-risk',
      description:
        'Carried debt from an earlier truncated night combines with new wake burden; the second truncated recovery leaves debt at the intrusion threshold and keeps next-wake capacity depressed.',
      sleepType: 'partial',
      wakeLoadAtSleep: 4,
      carriedDebtAtSleep: 2,
      recoveryQuota: constants.recoveryQuota,
      totalRecoveryDemand: 6,
      residualDebtAfterSleep: residualDebt(4, 2, constants.recoveryQuota),
      effectiveCapacityNextWake: effectiveCapacity(constants.maxCapacity, 3),
      nextWakeLoad: 2,
      intrusionThreshold: constants.intrusionThreshold,
      intrusionEnabledNextWake: intrusionEnabled(2, 3, constants.intrusionThreshold),
      theoremRefs: [
        'SleepDebt.repeated_truncation_preserves_debt',
        'SleepDebt.debt_at_or_above_intrusion_threshold_enables_intrusion',
      ],
    },
  ];

  return {
    label: 'sleep-debt-bounded-witness-v1',
    constants,
    aggregate: {
      fullRecoveryRestoresBaseline:
        scenarios[0]?.residualDebtAfterSleep === 0 &&
        scenarios[0]?.effectiveCapacityNextWake === constants.maxCapacity,
      partialRecoveryLeavesPositiveDebt:
        (scenarios[1]?.residualDebtAfterSleep ?? 0) > 0 &&
        (scenarios[1]?.effectiveCapacityNextWake ?? constants.maxCapacity) <
          constants.maxCapacity,
      chronicTruncationEnablesIntrusion:
        (scenarios[2]?.residualDebtAfterSleep ?? 0) >= constants.intrusionThreshold &&
        scenarios[2]?.intrusionEnabledNextWake === true,
    },
    scenarios,
  };
}

export function loadCheckedInSleepDebtBoundedWitness(
  artifactPath = defaultArtifactPath
): SleepDebtBoundedWitnessReport {
  return JSON.parse(readFileSync(artifactPath, 'utf8')) as SleepDebtBoundedWitnessReport;
}

export function renderSleepDebtBoundedWitnessMarkdown(
  report: SleepDebtBoundedWitnessReport
): string {
  const lines: string[] = [];
  lines.push('# Sleep-Debt Bounded Witness');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Max capacity: \`${report.constants.maxCapacity}\``);
  lines.push(`- Recovery quota: \`${report.constants.recoveryQuota}\``);
  lines.push(`- Intrusion threshold: \`${report.constants.intrusionThreshold}\``);
  lines.push('');
  lines.push('| Scenario | Sleep | Demand | Residual debt | Next capacity | Intrusion next wake | Theorems |');
  lines.push('| --- | --- | ---: | ---: | ---: | --- | --- |');

  for (const scenario of report.scenarios) {
    lines.push(
      `| \`${scenario.id}\` | \`${scenario.sleepType}\` | ${scenario.totalRecoveryDemand} | ${scenario.residualDebtAfterSleep} | ${scenario.effectiveCapacityNextWake} | \`${scenario.intrusionEnabledNextWake ? 'yes' : 'no'}\` | \`${scenario.theoremRefs.join(', ')}\` |`
    );
  }

  lines.push('');
  lines.push(
    `- Full recovery restores baseline: \`${report.aggregate.fullRecoveryRestoresBaseline ? 'yes' : 'no'}\``
  );
  lines.push(
    `- Partial recovery leaves positive debt: \`${report.aggregate.partialRecoveryLeavesPositiveDebt ? 'yes' : 'no'}\``
  );
  lines.push(
    `- Chronic truncation enables intrusion: \`${report.aggregate.chronicTruncationEnablesIntrusion ? 'yes' : 'no'}\``
  );
  lines.push('');
  lines.push(
    'Interpretation: this is a bounded executable witness for the sleep-debt homology, not a human-subject dataset. It demonstrates the formal shape the manuscript note claims: unfinished recovery leaves residual debt, residual debt lowers next-cycle capacity, and persistent debt can admit intrusion-style local venting once a threshold is crossed.'
  );
  lines.push('');

  return `${lines.join('\n')}\n`;
}
