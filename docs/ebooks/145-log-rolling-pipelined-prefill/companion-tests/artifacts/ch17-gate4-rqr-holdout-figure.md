# Chapter 17 Gate 4 R_qr Holdout Figure

- Label: `ch17-gate4-rqr-holdout-figure-v1`
- Source: `gate4-rqr-out-of-sample-v1`
- Samples: training `360`, holdout `520`
- Criteria passed: `5/5`
- Holdout deciles: `10`
- Holdout gain range: `1.795%` to `16.48%`
- Holdout R_qr range: `0` to `0.139`
- Quartile delta: `12.77%` (95% CI `10.01%` to `15.33%`)
- Monotonicity: `1/3` allowed violations

## Criteria

| Criterion | Observed | 95% CI | Threshold | Pass |
|---|---:|---:|---|---|
| Spearman | 0.5168 | 0.446 to 0.5752 | 95% CI low >= 0.240 | yes |
| Slope | 0.6507 | 0.4268 to 1.032 | 95% CI low >= 0.300 | yes |
| Quartile Delta | 0.1277 | 0.1001 to 0.1533 | 95% CI low >= 0.080 | yes |
| Predictor Pearson | 0.2476 | 0.1757 to 0.347 | 95% CI low >= 0.150 | yes |
| Monotonicity | 1 | n/a | violations <= 3 | yes |

## Holdout Deciles

| Decile | Count | Mean R_qr | Mean Observed Gain | Mean Predicted Gain | Residual |
|---|---:|---:|---:|---:|---:|
| 1 | 52 | 0 | 1.795% | 5.068% | -3.273% |
| 2 | 52 | 0 | 1.965% | 5.068% | -3.1031% |
| 3 | 52 | 0.00026 | 4.552% | 5.077% | -0.5249% |
| 4 | 52 | 0.00197 | 5.999% | 5.132% | 0.8673% |
| 5 | 52 | 0.00484 | 10.09% | 5.224% | 4.862% |
| 6 | 52 | 0.00804 | 9.45% | 5.327% | 4.123% |
| 7 | 52 | 0.0136 | 9.337% | 5.507% | 3.831% |
| 8 | 52 | 0.0237 | 9.567% | 5.83% | 3.737% |
| 9 | 52 | 0.0448 | 16.42% | 6.509% | 9.916% |
| 10 | 52 | 0.139 | 16.48% | 9.521% | 6.957% |

Interpretation: the figure keeps the predictive-screening claim honest by showing both the mostly monotone holdout decile uplift and the interval-backed scoring criteria, instead of collapsing the result into a single correlation statistic.
