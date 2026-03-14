import { describe, expect, it } from 'vitest';

import {
  buildSleepDebtBoundedWitnessReport,
  loadCheckedInSleepDebtBoundedWitness,
  renderSleepDebtBoundedWitnessMarkdown,
} from './sleep-debt-bounded-witness';

describe('Sleep debt bounded witness', () => {
  it('builds the bounded recovery scenarios with the expected aggregate claims', () => {
    const report = buildSleepDebtBoundedWitnessReport();

    expect(report.label).toBe('sleep-debt-bounded-witness-v1');
    expect(report.scenarios).toHaveLength(3);
    expect(report.aggregate.fullRecoveryRestoresBaseline).toBe(true);
    expect(report.aggregate.partialRecoveryLeavesPositiveDebt).toBe(true);
    expect(report.aggregate.chronicTruncationEnablesIntrusion).toBe(true);

    const chronicScenario = report.scenarios.find(
      (scenario) => scenario.id === 'chronic-truncation-intrusion-risk'
    );
    expect(chronicScenario?.residualDebtAfterSleep).toBe(3);
    expect(chronicScenario?.intrusionEnabledNextWake).toBe(true);
  });

  it('loads the checked-in artifact surface', () => {
    const report = loadCheckedInSleepDebtBoundedWitness();

    expect(report.label).toBe('sleep-debt-bounded-witness-v1');
    expect(report.aggregate.partialRecoveryLeavesPositiveDebt).toBe(true);
    expect(report.scenarios.some((scenario) => scenario.id === 'full-recovery-baseline')).toBe(
      true
    );
  });

  it('renders a markdown summary for the bounded witness', () => {
    const markdown = renderSleepDebtBoundedWitnessMarkdown(
      buildSleepDebtBoundedWitnessReport()
    );

    expect(markdown).toContain('# Sleep-Debt Bounded Witness');
    expect(markdown).toContain('partial-recovery-residual-debt');
    expect(markdown).toContain('SleepDebt.partial_recovery_lowers_next_capacity');
  });
});
