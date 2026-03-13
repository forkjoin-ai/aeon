# Companion Scripts

- Parent README: [../README.md](../README.md)

Utility scripts used by the companion suite.

## Files

- `run-formal-verification.sh`: runs TLC against every `formal/*.cfg` + matching `formal/*.tla` pair, downloading `tla2tools.jar` if needed.
- `run-lean-theorems.ts`: runs `@affectively/aeon-logic`'s `runLeanSandbox` against `formal/lean`, requiring a real `lake build` success and surfacing the sandbox report.
- `run-lean-theorems.sh`: shell wrapper that forwards to `run-lean-theorems.ts` for environments that expect the historical entrypoint.
- `validate-formal-artifacts.ts`: preflights all formal artifacts via `@affectively/aeon-logic` (`.tla/.cfg` parse + round-trip checks plus Lean project inspection through `runLeanSandbox` with `build: false`).
- `formal-parser-shootoff.ts`: benchmark helper that compares `aeon-logic` parser throughput against a Java SANY parse baseline using multi-sample medians and jitter bands.
- `formal-parser-equivalence.ts`: differential semantic-equivalence harness (accept/reject agreement + round-trip stability + invalid-corpus rejection) against Java SANY parse outcomes.
- `gate1-wallclock-matrix.ts`: wall-clock matrix runner for §14.1 (loopback or external endpoint pool modes with RTT/jitter/loss impairment injection), writes JSON/Markdown artifacts and computes bootstrap-CI gate verdicts (`--request-timeout-ms` bounds external fetch attempts).
- `gate1-hard-workloads.ts`: supplementary Gate 1 runner for CPU-heavy kernels (MD5 grind + semiprime factor search) in loopback mode, writes JSON/Markdown artifacts for fixture-scoped hard-workload tractability evidence.
- `gate2-protocol-corpus.ts`: heterogeneous protocol-corpus gate runner for §14.1, evaluating Aeon Flow vs HTTP/3 across predeclared environment cells with bootstrap-CI and win-rate criteria, and writing explicit PASS/DENY JSON/Markdown artifacts.
- `gate3-compression-corpus.ts`: heterogeneous compression-corpus gate runner for §14.1, evaluating topological per-chunk racing against fixed-codec and heuristic baselines with bootstrap-CI and win-rate criteria, and writing explicit PASS/DENY JSON/Markdown artifacts.
- `gate1-stage-worker.ts`: standalone `/stage` worker used when running the wall-clock matrix against external endpoint pools.
- `gate4-rqr-holdout.ts`: out-of-sample `R_qr` gate runner for §14.1, writes JSON/Markdown artifacts with fixed scoring criteria and bootstrap-CI pass/fail verdicts.
- `gate5-bio-effect-size.ts`: biological effect-size evidence runner for §14.1, evaluates predeclared comparative biological pairs with uncertainty propagation + pooled bootstrap-CI criteria and writes explicit PASS/DENY JSON/Markdown artifacts.
- `quantum-recombination-ablation.ts`: deterministic §6.12 ablation runner, holds the path family fixed, swaps only the fold rule, and writes JSON/Markdown artifacts for the resulting invariant-loss matrix.
- `toy-attention-fold-ablation.ts`: deterministic toy-attention ablation runner, holds keys/values/score function/query grid fixed, swaps only the fold rule, and writes JSON/Markdown behavioral-degradation artifacts.
- `gnosis-fold-training-benchmark.ts`: seeded Gnosis training-benchmark runner, reads three parameter-matched `.gg` modules and writes JSON/Markdown artifacts for the learned fold boundary.
- `ch17-correspondence-boundary-figure.ts`: artifact assembler that reads the quantum, toy-attention, and Gnosis benchmark reports and writes manuscript-ready JSON/Markdown/SVG figure outputs.
