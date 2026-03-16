import { describe, expect, it } from 'vitest';

import {
  buildSleepDebtScheduleThresholdWitnessReport,
  loadCheckedInSleepDebtScheduleThresholdWitness,
  renderSleepDebtScheduleThresholdWitnessMarkdown,
} from './sleep-debt-schedule-threshold-witness';

describe('Sleep debt schedule-threshold witness', () => {
  it('builds the threshold scenarios with the expected aggregate claims', () => {
    const report = buildSleepDebtScheduleThresholdWitnessReport();

    expect(report.label).toBe('sleep-debt-schedule-threshold-witness-v1');
    expect(report.scenarios).toHaveLength(3);
    expect(report.aggregate.subcriticalStaysZero).toBe(true);
    expect(report.aggregate.criticalStaysZero).toBe(true);
    expect(report.aggregate.supercriticalGrowsLinearly).toBe(true);

    const supercritical = report.scenarios.find(
      (scenario) => scenario.id === 'supercritical-schedule-grows-linearly'
    );
    expect(supercritical?.debtAfterCycles).toBe(8);
  });

  it('loads the checked-in threshold artifact surface', () => {
    const report = loadCheckedInSleepDebtScheduleThresholdWitness();

    expect(report.label).toBe('sleep-debt-schedule-threshold-witness-v1');
    expect(report.aggregate.supercriticalGrowsLinearly).toBe(true);
    expect(
      report.scenarios.some(
        (scenario) => scenario.id === 'subcritical-schedule-stays-bounded'
      )
    ).toBe(true);
  });

  it('renders a markdown summary for the threshold witness', () => {
    const markdown = renderSleepDebtScheduleThresholdWitnessMarkdown(
      buildSleepDebtScheduleThresholdWitnessReport()
    );

    expect(markdown).toContain('# Sleep-Debt Schedule Threshold Witness');
    expect(markdown).toContain('supercritical-schedule-grows-linearly');
    expect(markdown).toContain(
      'SleepDebtSchedule.iterated_debt_eq_cycle_count_mul_gap'
    );
  });
});
