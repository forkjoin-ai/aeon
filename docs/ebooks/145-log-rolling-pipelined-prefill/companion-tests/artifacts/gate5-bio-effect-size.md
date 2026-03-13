# Gate 5 Biological Effect-Size Mapping

- Protocol: `gate5-bio-effect-size-v1`
- Verdict: **PASS**
- Pair count: **3** (primary 3)
- Median pair ratio: **21.524x**
- Pooled log-ratio: **3.280** (95% CI 2.289-4.360)

## Pair Results

| Pair | Numerator / Denominator | Median Ratio | 95% CI Ratio | Primary | Verdict | Sources |
|---|---|---:|---:|---:|---:|---|
| Neural conduction (`saltatory_velocity`) | myelinated conduction velocity / unmyelinated conduction velocity | 79.494x | 45.795x-192.461x | yes | PASS | Conduction-velocity ranges from cited neurophysiology literature. (refs: [32], [46]) |
| Photosynthesis efficiency scale contrast (`photosynthesis_step_vs_system`) | exciton transfer efficiency (step-level) / whole-plant photosynthetic yield | 21.524x | 16.375x-31.591x | yes | PASS | Step-level and system-level efficiency ranges from cited literature. (refs: [6], [44]) |
| Replication chunk size (`okazaki_chunking`) | prokaryotic Okazaki fragment length / eukaryotic Okazaki fragment length | 10.061x | 5.829x-17.056x | yes | PASS | Okazaki-fragment length ranges from cited molecular biology literature. (refs: [45]) |

## Criteria

| Criterion | Observed | 95% CI | Threshold | Verdict |
|---|---:|---:|---:|---:|
| minimum_pair_count | 3.000 | n/a | >= 3 | PASS |
| primary_pair_ratio_ci_low | 5.829 | n/a | >= 1.200 | PASS |
| primary_pair_pass_rate | 1.000 | n/a | >= 1.000 | PASS |
| pooled_log_ratio_ci_low | 3.280 | 2.289-4.360 | >= 0.693 | PASS |

## Inclusion Rules

- Use only predeclared biological condition pairs with quantitative ranges tied to cited literature sources.
- Compute multiplicative effect size as ratio = numerator / denominator for each pair.
- Use uncertainty propagation by Monte Carlo range sampling plus bootstrap pooled CI.

## Scoring Rules

- Primary pair CI-low ratio threshold
- Primary pair pass-rate threshold
- Pooled log-ratio CI-low threshold

