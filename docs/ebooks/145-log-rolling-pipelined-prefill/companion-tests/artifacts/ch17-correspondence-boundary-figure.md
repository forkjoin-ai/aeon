# Chapter 17 Correspondence Boundary Figure

- Label: `ch17-correspondence-boundary-figure-v1`
- Quantum source: `quantum-recombination-ablation-v1`
- Toy-attention source: `toy-attention-fold-ablation-v1`
- Gnosis training source: `gnosis-fold-training-benchmark-v1`

## Quantum Matrix

| Strategy | Kernel | Partition | Order | Cancellation |
|---|---:|---:|---:|---:|
| `linear` | yes | yes | yes | yes |
| `winner-take-all` | no | no | no | no |
| `early-stop` | no | no | no | no |

## Behavioral Metrics

| Strategy | Toy attention MSE | Gnosis eval MSE | Gnosis cancellation-line abs error |
|---|---:|---:|---:|
| `linear` | 0.000 | 0.000 | 0.000 |
| `winner-take-all` | 0.163 | 0.408 | 0.834 |
| `early-stop` | 1.071 | 0.735 | 0.764 |

Interpretation: the invariant boundary, fixed-parameter toy attention, and seeded Gnosis training benchmark all agree on the same ranking. Linear recombination preserves cancellation and learned behavior; nonlinear selection does not.

