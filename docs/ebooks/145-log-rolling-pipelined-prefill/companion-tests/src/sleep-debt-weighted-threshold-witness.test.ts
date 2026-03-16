import { describe, expect, it } from 'vitest';

import {
  buildSleepDebtWeightedThresholdWitnessReport,
  loadCheckedInSleepDebtWeightedThresholdWitness,
  renderSleepDebtWeightedThresholdWitnessMarkdown,
} from './sleep-debt-weighted-threshold-witness';

describe('Sleep debt weighted-threshold witness', () => {
  it('builds the weighted threshold scenarios with the expected aggregate claims', () => {
    const report = buildSleepDebtWeightedThresholdWitnessReport();

    expect(report.label).toBe('sleep-debt-weighted-threshold-witness-v1');
    expect(report.parameters.criticalWakeTenths).toBe(202);
    expect(report.scenarios).toHaveLength(3);
    expect(report.aggregate.literatureBoundaryMatchesTwentyPointTwoHours).toBe(
      true
    );
    expect(report.aggregate.subcriticalStaysZero).toBe(true);
    expect(report.aggregate.criticalStaysZero).toBe(true);
    expect(report.aggregate.supercriticalGrowsLinearly).toBe(true);

    const supercritical = report.scenarios.find(
      (scenario) => scenario.id === 'weighted-supercritical-21h'
    );
    expect(supercritical?.weightedSurplusPerCycle).toBe(960);
    expect(supercritical?.debtAfterCycles).toBe(3840);
  });

  it('loads the checked-in weighted threshold artifact surface', () => {
    const report = loadCheckedInSleepDebtWeightedThresholdWitness();

    expect(report.label).toBe('sleep-debt-weighted-threshold-witness-v1');
    expect(report.aggregate.literatureBoundaryMatchesTwentyPointTwoHours).toBe(
      true
    );
    expect(
      report.scenarios.some(
        (scenario) => scenario.id === 'weighted-critical-20_2h'
      )
    ).toBe(true);
  });

  it('renders a markdown summary for the weighted threshold witness', () => {
    const markdown = renderSleepDebtWeightedThresholdWitnessMarkdown(
      buildSleepDebtWeightedThresholdWitnessReport()
    );

    expect(markdown).toContain('# Sleep-Debt Weighted Threshold Witness');
    expect(markdown).toContain('20.2 h');
    expect(markdown).toContain(
      'SleepDebtWeightedSchedule.literature_boundary_tenths_closed_form'
    );
  });
});
