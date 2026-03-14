# Sleep-Debt Bounded Witness

- Label: `sleep-debt-bounded-witness-v1`
- Max capacity: `5`
- Recovery quota: `3`
- Intrusion threshold: `3`

| Scenario | Sleep | Demand | Residual debt | Next capacity | Intrusion next wake | Theorems |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `full-recovery-baseline` | `full` | 3 | 0 | 5 | `no` | `SleepDebt.full_recovery_clears_residual_debt, SleepDebt.full_recovery_restores_capacity` |
| `partial-recovery-residual-debt` | `partial` | 5 | 2 | 3 | `no` | `SleepDebt.partial_recovery_leaves_positive_debt, SleepDebt.partial_recovery_lowers_next_capacity` |
| `chronic-truncation-intrusion-risk` | `partial` | 6 | 3 | 2 | `yes` | `SleepDebt.repeated_truncation_preserves_debt, SleepDebt.debt_at_or_above_intrusion_threshold_enables_intrusion` |

- Full recovery restores baseline: `yes`
- Partial recovery leaves positive debt: `yes`
- Chronic truncation enables intrusion: `yes`

Interpretation: this is a bounded executable witness for the sleep-debt homology, not a human-subject dataset. It demonstrates the formal shape the manuscript note claims: unfinished recovery leaves residual debt, residual debt lowers next-cycle capacity, and persistent debt can admit intrusion-style local venting once a threshold is crossed.

