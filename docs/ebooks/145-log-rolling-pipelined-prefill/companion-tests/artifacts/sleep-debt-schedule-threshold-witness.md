# Sleep-Debt Schedule Threshold Witness

- Label: `sleep-debt-schedule-threshold-witness-v1`

| Scenario | Wake | Quota | Cycles | Surplus | Debt after cycles | Theorems |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `subcritical-schedule-stays-bounded` | 3 | 4 | 4 | 0 | 0 | `SleepDebtSchedule.iterated_debt_eq_zero_of_wake_le_quota` |
| `critical-schedule-stays-bounded` | 4 | 4 | 4 | 0 | 0 | `SleepDebtSchedule.iterated_debt_eq_zero_of_wake_le_quota` |
| `supercritical-schedule-grows-linearly` | 6 | 4 | 4 | 2 | 8 | `SleepDebtSchedule.iterated_debt_eq_cycle_count_mul_gap, SleepDebtSchedule.iterated_debt_positive_above_threshold, SleepDebtSchedule.iterated_debt_strictly_increases_above_threshold` |

- Subcritical schedule stays zero: `yes`
- Critical schedule stays zero: `yes`
- Supercritical schedule grows linearly: `yes`

Interpretation: this is a coarse discrete threshold witness for the schedule boundary behind the literature-side bifurcation story. It does not claim to be the full McCauley ODE system; it only proves that below-threshold schedules stay debt-free while above-threshold schedules accumulate debt linearly in the bounded cycle model.

