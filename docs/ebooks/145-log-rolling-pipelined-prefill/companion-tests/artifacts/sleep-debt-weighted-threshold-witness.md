# Sleep-Debt Weighted Threshold Witness

- Label: `sleep-debt-weighted-threshold-witness-v1`
- Calibrated critical wake boundary: `20.2 h` (`202` tenths)
- Weighted parameters: wake burden `19`, recovery `101`, cycle length `240` tenths

| Scenario | Wake (h) | Sleep (h) | Cycles | Threshold lhs | Threshold rhs | Weighted surplus | Debt after cycles | Theorems |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `weighted-subcritical-18h` | 18.0 | 6.0 | 4 | 21600 | 24240 | 0 | 0 | `SleepDebtWeightedSchedule.weighted_surplus_eq_zero_of_not_crossed, SleepDebtWeightedSchedule.iterated_debt_eq_zero_of_not_crossed` |
| `weighted-critical-20_2h` | 20.2 | 3.8 | 4 | 24240 | 24240 | 0 | 0 | `SleepDebtWeightedSchedule.literature_boundary_tenths_closed_form, SleepDebtWeightedSchedule.iterated_debt_eq_zero_of_not_crossed` |
| `weighted-supercritical-21h` | 21.0 | 3.0 | 4 | 25200 | 24240 | 960 | 3840 | `SleepDebtWeightedSchedule.literature_boundary_crossed_at_twentyone_hours, SleepDebtWeightedSchedule.iterated_debt_eq_cycle_count_mul_gap_of_crossed, SleepDebtWeightedSchedule.iterated_debt_positive_above_threshold, SleepDebtWeightedSchedule.iterated_debt_strictly_increases_above_threshold` |

- Literature boundary encoded exactly: `yes`
- Subcritical schedule stays zero: `yes`
- Critical schedule stays zero: `yes`
- Supercritical schedule grows linearly: `yes`

Interpretation: this is an integerized weighted repeated-cycle bridge, not the full McCauley/Van Dongen ODE system. It chooses rate parameters so the discrete critical wake boundary lands exactly at 20.2 hours, then proves that schedules below or at that boundary stay debt-free while schedules above it accumulate weighted carried debt linearly.

