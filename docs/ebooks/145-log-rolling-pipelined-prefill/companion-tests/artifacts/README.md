# Companion Artifacts

- Parent README: [../README.md](../README.md)

Generated benchmark/formal outputs used by manuscript evidence notes.

## Files

- `gate1-wallclock-matrix.json`: machine-readable Gate 1 wall-clock matrix report (config, per-cell p50/p95, bootstrap intervals, pass/fail verdicts).
- `gate1-wallclock-matrix.md`: human-readable Gate 1 wall-clock matrix summary table and gate verdict.
- `gate1-wallclock-external-single-host.json`: machine-readable Gate 1 report for external non-loopback endpoint execution (single remote host, stage-indexed endpoints).
- `gate1-wallclock-external-single-host.md`: human-readable summary for the external non-loopback single-host Gate 1 run.
- `gate1-wallclock-external-multihost.json`: machine-readable Gate 1 report for external non-loopback six-distinct-host execution (one stage endpoint per host).
- `gate1-wallclock-external-multihost.md`: human-readable summary for the external non-loopback six-host Gate 1 run.
- `gate2-protocol-corpus.json`: machine-readable Gate 2 report for seeded heterogeneous protocol-corpus evaluation (Aeon Flow vs HTTP/3) across predeclared environment cells.
- `gate2-protocol-corpus.md`: human-readable Gate 2 summary with per-cell bootstrap CIs, win rates, and explicit gate verdict.
- `gate3-compression-corpus.json`: machine-readable Gate 3 report for seeded heterogeneous compression-corpus evaluation (topological racing vs fixed-codec and heuristic baselines).
- `gate3-compression-corpus.md`: human-readable Gate 3 summary with per-cell bootstrap CIs, win rates, codec-diversity diagnostics, and explicit gate verdict.
- `gate4-rqr-holdout.json`: machine-readable Gate 4 out-of-sample `R_qr` report (predeclared criteria, train/holdout summaries, bootstrap intervals, pass/fail verdict).
- `gate4-rqr-holdout.md`: human-readable Gate 4 out-of-sample `R_qr` summary with criteria table and decile calibration table.
- `gate5-bio-effect-size.json`: machine-readable biological effect-size report across predeclared comparative pairs with uncertainty propagation and pooled bootstrap-CI criteria.
- `gate5-bio-effect-size.md`: human-readable biological effect-size summary with pair-level ratios, uncertainty intervals, and explicit pass/fail criteria.
- `quantum-recombination-ablation.json`: machine-readable §6.12 ablation report for the invariant-loss matrix when linear recombination is replaced by winner-take-all or early-stop selection on the same path family.
- `quantum-recombination-ablation.md`: human-readable §6.12 ablation summary with the invariant matrix and witness distances.
- `toy-attention-fold-ablation.json`: machine-readable toy-attention ablation report for the behavioral effect of swapping only the fold rule while keeping parameters and queries fixed.
- `toy-attention-fold-ablation.md`: human-readable toy-attention ablation summary with MSE/exact-reconstruction metrics and representative predictions.
- `gnosis-fold-training-benchmark.json`: machine-readable seeded Gnosis training benchmark report for three parameter-matched `.gg` modules that differ only in fold strategy.
- `gnosis-fold-training-benchmark.md`: human-readable seeded Gnosis training benchmark summary with eval-MSE, exact-rate, and cancellation-line error metrics.
- `ch17-correspondence-boundary-figure.json`: machine-readable manifest for the Chapter 17 correspondence-boundary figure.
- `ch17-correspondence-boundary-figure.md`: human-readable summary of the figure sources and aggregated metrics.
- `ch17-correspondence-boundary-figure.svg`: manuscript-ready figure assembled from the quantum ablation, toy-attention ablation, and seeded Gnosis training benchmark artifacts.

## Gate 1 Snapshot

- External six-host label: `workers-dev-external-multihost6-distinct`
- Distinct endpoint hosts: `6`
- Gate verdict: `PASS` (`8/8` primary cells)
- Median speedup range across cells: `11.785x` to `21.620x`
- Minimum 95% CI lower bounds across cells: `11.365x` speedup and `3,560.98 ms` latency improvement

## Gate 2 Snapshot

- Corpus label: `gate2-protocol-corpus-v1`
- Corpus size: `144` sites, `12,371` resources
- Gate verdict: `PASS` (`6/6` primary cells)
- Framing median gain across cells: `72.252%` (CI low approximately `72.19%`)
- Primary-cell completion median CI lows: `20.24 ms` to `83.38 ms`
- Primary-cell completion p95 CI lows: `19.99 ms` to `98.22 ms`

## Gate 3 Snapshot

- Corpus label: `gate3-compression-corpus-v1`
- Corpus size: `90` samples (`20,133,761` bytes total)
- Gate verdict: `PASS` (`4/4` primary cells)
- Primary-cell median gain vs best fixed codec: `0.001%` to `0.008%` (CI lows all positive: approximately `0.0009%` to `0.0075%`)
- Primary-cell median gain vs heuristic baseline: `0.777%` to `46.366%` (CI lows approximately `0.386%` to `39.449%`)

## Gate 5 Snapshot

- Protocol label: `gate5-bio-effect-size-v1`
- Comparative pair count: `3` (`3` primary)
- Gate verdict: `PASS` (`4/4` criteria)
- Median pair ratio: `21.524x`
- Minimum primary-pair CI low ratio: `5.829x`
- Pooled log-ratio: `3.280` (95% CI `2.289` to `4.360`)

## Quantum Ablation Snapshot

- Protocol label: `quantum-recombination-ablation-v1`
- Predicted loss matrix recovered: `yes`
- `linear`: preserves kernel agreement, partition additivity, order invariance, and cancellation
- `winner-take-all`: breaks all four invariants on the selected witnesses
- `early-stop`: breaks all four invariants on the selected witnesses

## Toy Attention Snapshot

- Protocol label: `toy-attention-fold-ablation-v1`
- Predicted ranking recovered: `yes`
- `linear`: mean squared error `0.000`, exact-within-tolerance fraction `1.000`
- `winner-take-all`: mean squared error `0.163`, exact-within-tolerance fraction `0.185`
- `early-stop`: mean squared error `1.071`, exact-within-tolerance fraction `0.074`

## Gnosis Training Snapshot

- Protocol label: `gnosis-fold-training-benchmark-v1`
- Predicted ranking recovered: `yes`
- Shared parameter count: `4`
- `linear`: eval mean squared error `0.000`, exact-within-tolerance fraction `1.000`, cancellation-line abs error `0.000`
- `winner-take-all`: eval mean squared error `0.408`, exact-within-tolerance fraction `0.038`, cancellation-line abs error `0.834`
- `early-stop`: eval mean squared error `0.735`, exact-within-tolerance fraction `0.000`, cancellation-line abs error `0.764`

## Chapter 17 Figure Snapshot

- Protocol label: `ch17-correspondence-boundary-figure-v1`
- Sources: `quantum-recombination-ablation-v1`, `toy-attention-fold-ablation-v1`, `gnosis-fold-training-benchmark-v1`
- Output surface: JSON + Markdown + SVG
- Learned ranking in figure: `linear < winner-take-all < early-stop`
