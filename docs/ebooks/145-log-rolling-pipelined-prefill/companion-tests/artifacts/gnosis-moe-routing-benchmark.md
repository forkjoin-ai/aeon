# Gnosis Mini-MoE Routing Benchmark

- Label: `gnosis-moe-routing-benchmark-v1`
- Target family: `quadrant-l1-routing`
- Seeds: `12`
- Epochs: `1400`
- Learning rate: `0.025`
- Train samples: `169`
- Eval samples: `100`
- Shared parameter count: `16`
- Shared structural β₁: `3`
- Dual-active threshold: `0.4`
- Predicted ranking recovered: `yes`

## Aggregated Metrics

| Strategy | Mean eval MSE | Eval MSE 95% CI | Exact-within-tolerance | Exact 95% CI | Dual-active abs error | Dual-active 95% CI |
|---|---:|---:|---:|---:|---:|---:|
| `linear` | 0.001 | [0.001, 0.001] | 0.978 | [0.968, 0.987] | 0.027 | [0.027, 0.027] |
| `winner-take-all` | 0.328 | [0.267, 0.389] | 0.126 | [0.098, 0.151] | 0.402 | [0.363, 0.441] |
| `early-stop` | 0.449 | [0.444, 0.457] | 0.080 | [0.060, 0.100] | 0.474 | [0.465, 0.482] |

## Sample Predictions

| Strategy | Input pair | Target | Mean prediction | Prediction σ |
|---|---|---:|---:|---:|
| `linear` | (-1.20, -1.20) | 2.400 | 2.422 | 0.008 |
| `linear` | (-1.20, 1.20) | 2.400 | 2.423 | 0.010 |
| `linear` | (1.20, -1.20) | 2.400 | 2.422 | 0.009 |
| `linear` | (1.20, 1.20) | 2.400 | 2.423 | 0.007 |
| `linear` | (1.20, 0.00) | 1.200 | 1.315 | 0.016 |
| `winner-take-all` | (-1.20, -1.20) | 2.400 | 1.761 | 0.238 |
| `winner-take-all` | (-1.20, 1.20) | 2.400 | 1.806 | 0.211 |
| `winner-take-all` | (1.20, -1.20) | 2.400 | 1.784 | 0.217 |
| `winner-take-all` | (1.20, 1.20) | 2.400 | 1.817 | 0.204 |
| `winner-take-all` | (1.20, 0.00) | 1.200 | 1.472 | 0.453 |
| `early-stop` | (-1.20, -1.20) | 2.400 | 1.608 | 0.063 |
| `early-stop` | (-1.20, 1.20) | 2.400 | 1.608 | 0.063 |
| `early-stop` | (1.20, -1.20) | 2.400 | 1.620 | 0.074 |
| `early-stop` | (1.20, 1.20) | 2.400 | 1.620 | 0.074 |
| `early-stop` | (1.20, 0.00) | 1.200 | 1.620 | 0.074 |

Interpretation: four sign-specialized experts share one routed topology and a fixed 16-parameter budget. The linear fold can aggregate the two active experts required for `|x| + |y|`, while winner-take-all and early-stop leave a persistent dual-path under-recombination floor.

