# Formal Theorem Ledger

- Parent README: [README.md](./README.md)
- Lean package: [lean/README.md](./lean/README.md)

This ledger turns top-level manuscript claims into named theorems with explicit assumptions and mechanization targets.

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-C1C4` | Fork/race/fold safety+liveness (C1–C4) | finite items/stages/branches; deterministic fold; bounded timeout; weak fairness on `Tick`/`Fold` | TLA+ TLC model | Mechanized + model-checked |
| `THM-S7-WHIP` | Worthington Whip savings shape | shard count `s>0`; finite domain | TLA+ transition model + Lean definitions | Mechanized (finite-domain TLC + Lean definitions) |
| `THM-S7-SPEC` | Speculative Tree expected-token denominator positivity | `q>p`, finite `k` | TLA+ transition model + Lean theorem | Mechanized |
| `THM-S7-TURB` | Turbulent idle fraction stays bounded | `n>0`, `c>0`, finite domains | TLA+ transition model | Mechanized (finite-domain) |
| `THM-Q-DEFICIT` | Quantum speedup identity in topology-matched regime | perfect-square search size; matched implementation `β₁=β₁*` | TLA+ transition model + Lean theorem schema | Mechanized (finite-domain TLC + Lean schema) |
| `THM-PROTO-DEFICIT` | TCP/QUIC/Aeon deficit ordering | stream count `>1`; topology equations | TLA+ transition model + Lean theorem | Mechanized |
| `THM-SETTLEMENT` | Settlement deficit (`seq=2`, `parallel=0`) | intrinsic `β₁*=2`; mode in `{seq,parallel}` | TLA+ transition model + Lean theorem | Mechanized |
| `THM-BANDGAP-BETA2` | Band gap implies `β₂>0` | finite energy lattice; allowed set family; non-empty forbidden interior | TLA+ transition model | Mechanized (finite-domain) |
| `THM-PARSER-CLOSURE` | Formal artifacts are self-consistent under project parser | parsers are total on artifact grammar; pairwise `.tla/.cfg` completeness | `aeon-logic` parser + round-trip checks | Mechanized |
| `THM-COMPLETENESS-DAG` | Fork/race/fold expresses any DAG | explicit DAG semantics and translation functions | Lean axiom placeholder + roadmap | Axiomatized (proof pending) |
| `THM-QUEUE-CONTAINMENT` | Queueing subspace containment | full stochastic semantics + mapping to `β₁=0` | Lean axiom placeholder + executable tests | Axiomatized + empirically supported |
| `THM-FIRST-LAW-GENERAL` | `V_fork = W_fold + Q_vent` for all modeled systems | energy mapping functions and conservation semantics | Lean axiom placeholder + executable tests | Axiomatized + empirically supported |

## Interpretation

- `Mechanized` means machine-checked by TLC and/or Lean build.
- `Axiomatized` means theorem shape and assumptions are formalized, but the proof requires a deeper semantic model than currently encoded.
