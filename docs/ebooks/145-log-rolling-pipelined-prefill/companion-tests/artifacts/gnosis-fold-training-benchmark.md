# Gnosis Fold Training Benchmark

- Label: `gnosis-fold-training-benchmark-v2`
- Target family: `left-minus-right`
- Seeds: `8`
- Epochs: `720`
- Learning rate: `0.035`
- Train samples: `49`
- Eval samples: `36`
- Shared parameter count: `4`
- Shared structural β₁: `1`
- Predicted ranking recovered: `yes`

## Aggregated Metrics

| Strategy | Mean eval MSE | Eval MSE 95% CI | Eval MSE σ | Exact-within-tolerance | Exact 95% CI | Cancellation-line abs error | Cancellation 95% CI |
|---|---:|---:|---:|---:|---:|---:|---:|
| `linear` | 0.000 | [0.000, 0.000] | 0.000 | 1.000 | [1.000, 1.000] | 0.000 | [0.000, 0.000] |
| `winner-take-all` | 0.408 | [0.396, 0.421] | 0.017 | 0.038 | [0.021, 0.056] | 0.834 | [0.792, 0.876] |
| `early-stop` | 0.735 | [0.732, 0.740] | 0.006 | 0.000 | [0.000, 0.000] | 0.764 | [0.737, 0.786] |

## Sample Predictions

| Strategy | Input pair | Target | Mean prediction | Prediction σ |
|---|---|---:|---:|---:|
| `linear` | (-1.00, -1.00) | 0.000 | -0.000 | 0.000 |
| `linear` | (1.00, -1.00) | 2.000 | 2.000 | 0.000 |
| `linear` | (-1.00, 1.00) | -2.000 | -2.000 | 0.000 |
| `linear` | (1.00, 1.00) | 0.000 | 0.000 | 0.000 |
| `winner-take-all` | (-1.00, -1.00) | 0.000 | -0.007 | 1.200 |
| `winner-take-all` | (1.00, -1.00) | 2.000 | 1.230 | 0.155 |
| `winner-take-all` | (-1.00, 1.00) | -2.000 | -1.215 | 0.120 |
| `winner-take-all` | (1.00, 1.00) | 0.000 | 0.088 | 0.905 |
| `early-stop` | (-1.00, -1.00) | 0.000 | -1.016 | 0.068 |
| `early-stop` | (1.00, -1.00) | 2.000 | 1.021 | 0.093 |
| `early-stop` | (-1.00, 1.00) | -2.000 | -1.016 | 0.068 |
| `early-stop` | (1.00, 1.00) | 0.000 | 1.021 | 0.093 |

Interpretation: the topology, parameter count, and data are held fixed across three Gnosis programs; only the fold strategy changes. Linear recombination learns the cancellation-sensitive target family, while nonlinear selection leaves a persistent recombination error floor.

