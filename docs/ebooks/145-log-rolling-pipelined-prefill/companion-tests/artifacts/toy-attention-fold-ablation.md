# Toy Attention Fold Ablation

- Label: `toy-attention-fold-ablation-v2`
- Queries: `81`
- Paths: `3`
- Output dimension: `2`
- Exact-sample MSE tolerance: `0.01`
- Predicted ranking recovered: `yes`

## Metrics

| Strategy | Mean squared error | MSE 95% CI | Max absolute error | Exact-within-tolerance fraction | Exact 95% CI |
|---|---:|---:|---:|---:|---:|
| `linear` | 0.000 | [0.000, 0.000] | 0.000 | 1.000 | [1.000, 1.000] |
| `winner-take-all` | 0.163 | [0.120, 0.211] | 1.081 | 0.185 | [0.111, 0.272] |
| `early-stop` | 1.071 | [0.858, 1.288] | 2.034 | 0.074 | [0.025, 0.136] |

## Sample Predictions

| Query | Teacher | Winner-take-all | Early-stop |
|---|---|---|---|
| -2.000 | [0.957, -0.417] | [1.000, -0.500] | [1.000, -0.500] |
| 0.000 | [0.033, 0.367] | [1.000, -0.500] | [1.000, -0.500] |
| 2.000 | [-1.034, 0.436] | [-1.100, 0.400] | [1.000, -0.500] |

Interpretation: hold keys, values, score function, and query grid fixed. Swapping only the fold rule preserves exact teacher reconstruction for linear attention and introduces measurable error for nonlinear selection.

