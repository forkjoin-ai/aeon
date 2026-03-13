# Toy Attention Fold Ablation

- Label: `toy-attention-fold-ablation-v1`
- Queries: `81`
- Paths: `3`
- Output dimension: `2`
- Exact-sample MSE tolerance: `0.01`
- Predicted ranking recovered: `yes`

## Metrics

| Strategy | Mean squared error | Max absolute error | Exact-within-tolerance fraction |
|---|---:|---:|---:|
| `linear` | 0.000 | 0.000 | 1.000 |
| `winner-take-all` | 0.163 | 1.081 | 0.185 |
| `early-stop` | 1.071 | 2.034 | 0.074 |

## Sample Predictions

| Query | Teacher | Winner-take-all | Early-stop |
|---|---|---|---|
| -2.000 | [0.957, -0.417] | [1.000, -0.500] | [1.000, -0.500] |
| 0.000 | [0.033, 0.367] | [1.000, -0.500] | [1.000, -0.500] |
| 2.000 | [-1.034, 0.436] | [-1.100, 0.400] | [1.000, -0.500] |

Interpretation: hold keys, values, score function, and query grid fixed. Swapping only the fold rule preserves exact teacher reconstruction for linear attention and introduces measurable error for nonlinear selection.

