# Gate 4 Out-of-Sample R_qr Validation

- Verdict: **PASS**
- Protocol: `gate4-rqr-out-of-sample-v1`
- Training samples: 360
- Holdout samples: 520
- Bootstrap resamples: 3000

## Predeclared Scoring Rules

- Evaluate only predeclared CI/threshold checks below; no post-hoc threshold tuning.
- Use 95% bootstrap confidence intervals with fixed seed and fixed resample count.
- Gate PASS requires every criterion to pass; otherwise DENY.

## Criteria

- spearman_ci_low: PASS | observed 0.517 (95% CI 0.446 to 0.575) | threshold 95% CI low >= 0.240
- slope_ci_low: PASS | observed 0.651 (95% CI 0.427 to 1.032) | threshold 95% CI low >= 0.300
- quartile_delta_ci_low: PASS | observed 0.128 (95% CI 0.100 to 0.153) | threshold 95% CI low >= 0.080
- predicted_pearson_ci_low: PASS | observed 0.248 (95% CI 0.176 to 0.347) | threshold 95% CI low >= 0.150
- decile_monotonicity: PASS | observed 1.000 | threshold violations <= 3

## Holdout Summary

- Spearman(R_qr, gain): 0.517 (95% CI 0.446 to 0.575)
- Slope d(gain)/d(R_qr): 0.651 (95% CI 0.427 to 1.032)
- Top quartile minus bottom quartile gain: 0.128 (95% CI 0.100 to 0.153)
- Pearson(predicted, gain): 0.248 (95% CI 0.176 to 0.347)
- Predicted RMSE: 0.125
- Decile monotonicity violations: 1

## Deciles (Holdout)

| Decile | Count | Mean R_qr | Mean Gain | Mean Predicted Gain |
|---|---:|---:|---:|---:|
| 1 | 52 | 0.000 | 0.018 | 0.051 |
| 2 | 52 | 0.000 | 0.020 | 0.051 |
| 3 | 52 | 0.000 | 0.046 | 0.051 |
| 4 | 52 | 0.002 | 0.060 | 0.051 |
| 5 | 52 | 0.005 | 0.101 | 0.052 |
| 6 | 52 | 0.008 | 0.094 | 0.053 |
| 7 | 52 | 0.014 | 0.093 | 0.055 |
| 8 | 52 | 0.024 | 0.096 | 0.058 |
| 9 | 52 | 0.045 | 0.164 | 0.065 |
| 10 | 52 | 0.139 | 0.165 | 0.095 |

