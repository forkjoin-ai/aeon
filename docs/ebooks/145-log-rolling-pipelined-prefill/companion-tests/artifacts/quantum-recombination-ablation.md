# Quantum Recombination Ablation

- Label: `quantum-recombination-ablation-v1`
- Tolerance: `1e-10`
- Predicted loss matrix recovered: `yes`

## Invariant Matrix

| Strategy | Kernel agreement | Partition additivity | Order invariance | Cancellation |
|---|---:|---:|---:|---:|
| `linear` | yes | yes | yes | yes |
| `winner-take-all` | no | no | no | no |
| `early-stop` | no | no | no | no |

## Distances

| Strategy | Kernel distance | Partition distance | Order distance | Cancellation magnitude² |
|---|---:|---:|---:|---:|
| `linear` | 0.000e+0 | 0.000e+0 | 0.000e+0 | 0.000e+0 |
| `winner-take-all` | 3.536e-1 | 2.000e+0 | 2.000e+0 | 1.000e+0 |
| `early-stop` | 3.536e-1 | 2.000e+0 | 2.000e+0 | 1.000e+0 |

Interpretation: hold the path family fixed, then swap only the recombination rule. Linear fold preserves the path-sum invariants; winner-take-all and early-stop do not.

