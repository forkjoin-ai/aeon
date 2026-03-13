# Chapter 17 Correspondence Boundary Figure

- Label: `ch17-correspondence-boundary-figure-v2`
- Quantum source: `quantum-recombination-ablation-v1`
- Toy-attention source: `toy-attention-fold-ablation-v2`
- Gnosis training source: `gnosis-fold-training-benchmark-v2`
- Gnosis mini-MoE source: `gnosis-moe-routing-benchmark-v1`

## Quantum Matrix

| Strategy | Kernel | Partition | Order | Cancellation |
|---|---:|---:|---:|---:|
| `linear` | yes | yes | yes | yes |
| `winner-take-all` | no | no | no | no |
| `early-stop` | no | no | no | no |

## Interval-Backed Behavioral Metrics

| Strategy | Toy attention MSE | Toy 95% CI | Gnosis cancellation MSE | Gnosis cancellation 95% CI | Gnosis mini-MoE MSE | Gnosis mini-MoE 95% CI |
|---|---:|---:|---:|---:|---:|---:|
| `linear` | 0.000 | [0.000, 0.000] | 0.000 | [0.000, 0.000] | 0.001 | [0.001, 0.001] |
| `winner-take-all` | 0.163 | [0.120, 0.211] | 0.408 | [0.396, 0.421] | 0.328 | [0.267, 0.389] |
| `early-stop` | 1.071 | [0.858, 1.288] | 0.735 | [0.732, 0.740] | 0.449 | [0.444, 0.457] |

Interpretation: the invariant boundary, fixed-parameter toy attention, seeded cancellation learner, and harder mini-MoE routing learner all recover the same ordering. Linear recombination preserves both exact cancellation and dual-path routed behavior; nonlinear selection does not.

