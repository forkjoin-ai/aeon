# Lean Theorems

- Parent README: [../README.md](../README.md)
- Ledger: [../THEOREM_LEDGER.md](../THEOREM_LEDGER.md)
- Source root: [Lean/README.md](./Lean/README.md)

This directory contains a Lean 4 theorem package that encodes constructive and explicit-assumption theorems for core paper claims, including the algebraic boundary between linear aggregation and nonlinear selection in §6.12 and the queueing lift from finite traces to infinite sums and measure-theoretic limits.

The companion suite now exercises this package through `@affectively/aeon-logic`'s Lean sandbox for both inspection preflight and the actual mechanized build path.

## Modules

- `Lean/ForkRaceFoldTheorems.lean`: library entrypoint.
- `Lean/ForkRaceFoldTheorems/Claims.lean`: constructive proofs for quantitative claims and the §6.12 correspondence-boundary witnesses.
- `Lean/ForkRaceFoldTheorems/Multiplexing.lean`: constructive turbulent-multiplexing monotonicity proofs under fixed busy work and legal overlap recovery.
- `Lean/ForkRaceFoldTheorems/Wallace.lean`: constructive Wallace/crank theorems for bounded three-layer frontiers and the symmetric diamond witness.
- `Lean/ForkRaceFoldTheorems/MeasureQueueing.lean`: constructive queueing theorems for `tsum`, countably supported stochastic laws via `PMF`, `lintegral`, and monotone truncation-to-limit balance.
- `Lean/ForkRaceFoldTheorems/Axioms.lean`: assumption-parameterized theorem schemas for global claims that still need extra semantic or stability hypotheses.

## Run

```bash
bun run test:formal:lean
bash ../../scripts/run-lean-theorems.sh
```

Both commands route through `runLeanSandbox`; the first invokes the TypeScript entrypoint directly, and the shell wrapper preserves the historical command surface.
