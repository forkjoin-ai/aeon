# Chapter 17 External Reviewer Quickstart

- Parent volume README: [README.md](./README.md)
- Companion test suite: [companion-tests/README.md](./companion-tests/README.md)
- Compiler boundary note: [companion-tests/formal/GNOSIS_COMPILER_BOUNDARY.md](./companion-tests/formal/GNOSIS_COMPILER_BOUNDARY.md)
- Replication manifest: [companion-tests/artifacts/ch17-replication-pack.md](./companion-tests/artifacts/ch17-replication-pack.md)
- Outside rerun report: [companion-tests/artifacts/ch17-external-replication.md](./companion-tests/artifacts/ch17-external-replication.md)
- Sleep-debt calibration note: [ch17-sleep-debt-calibration-sources.md](./ch17-sleep-debt-calibration-sources.md)

Use this path when you want to verify the Chapter 17 evidence bundle from a checkout of the repo without rebuilding the TeX or PDF surface.

This quickstart checks the evidence bundle and artifact consistency surface. The one-command rerun now also includes the shared Gnosis theorem workspace, so the compiler-side bounded affine queue-family `continuousHarris` witness and the coupled-manifold theorem for inter-app handoff pressure are part of the same outside verification path.

## Preconditions

- Run from the repository root: `/Users/buley/Documents/Code/emotions`
- Bun `1.3.x` must be available on `PATH`
- Network access is required for `bun install --frozen-lockfile`
- No paid AI services, cloud deployments, or manuscript/PDF build steps are part of this rerun

## One Command

```bash
cd open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests
bun run test:ch17-external-replication
```

## What The Command Does

1. Installs workspace dependencies with the locked Bun workspace.
2. Builds the local Gnosis package.
3. Runs the seeded Gnosis fold-training, negative-control, regime-sweep, adversarial-control, and mini-MoE routing benchmarks.
4. Exports the Lean-originated witness catalog consumed by the runtime boundary tests.
5. Rebuilds the shared `GnosisProofs.lean` theorem workspace for the compiler-side `THM-GNOSIS-*` surface.
6. Regenerates the Chapter 17 reproduction surface, including the bounded sleep-debt witness family and its weighted `20.2 h` bridge, and refreshes the replication manifest.
7. Verifies that the refreshed manifest still matches the checked-in evidence files by SHA-256.

## Success Criteria

- `Overall result` is `pass` in [companion-tests/artifacts/ch17-external-replication.md](./companion-tests/artifacts/ch17-external-replication.md)
- `Manifest stable` is `yes`
- `All hashes match` is `yes`
- The rerun finishes without touching `arxiv-manuscript.tex` or rebuilding the PDF layer

## Runtime Notes

- The last recorded run on March 14, 2026 completed in about `146.119 s`
- The cold-cache install step took `27.223 s`
- The longest evidence step after install was `Run Chapter 17 reproduction surface` at `59.081 s`
- For current timings, trust the generated JSON report rather than this prose snapshot: [companion-tests/artifacts/ch17-external-replication.json](./companion-tests/artifacts/ch17-external-replication.json)

## Output Files

- Machine-readable rerun report: [companion-tests/artifacts/ch17-external-replication.json](./companion-tests/artifacts/ch17-external-replication.json)
- Human-readable rerun report: [companion-tests/artifacts/ch17-external-replication.md](./companion-tests/artifacts/ch17-external-replication.md)
- Manifest and hashes for the evidence bundle: [companion-tests/artifacts/ch17-replication-pack.md](./companion-tests/artifacts/ch17-replication-pack.md)
- Bounded sleep-debt witness artifact: [companion-tests/artifacts/sleep-debt-bounded-witness.md](./companion-tests/artifacts/sleep-debt-bounded-witness.md)
- Coarse schedule-threshold witness artifact: [companion-tests/artifacts/sleep-debt-schedule-threshold-witness.md](./companion-tests/artifacts/sleep-debt-schedule-threshold-witness.md)
- Weighted schedule-threshold bridge artifact: [companion-tests/artifacts/sleep-debt-weighted-threshold-witness.md](./companion-tests/artifacts/sleep-debt-weighted-threshold-witness.md)

## Failure Triage

- If the build or benchmark steps fail, rerun the failing command from the step table in the external-replication report.
- If the hash check fails, compare the changed file against the path listed in the replication manifest before trusting any manuscript claim based on that artifact.
- If you need to inspect the formal boundary itself, start with [companion-tests/formal/THEOREM_LEDGER.md](./companion-tests/formal/THEOREM_LEDGER.md), [companion-tests/formal/README.md](./companion-tests/formal/README.md), and the compiler-specific note [companion-tests/formal/GNOSIS_COMPILER_BOUNDARY.md](./companion-tests/formal/GNOSIS_COMPILER_BOUNDARY.md).
- If you need to rerun only the compiler-side Gnosis theorem workspace, use `bun run test:formal:gnosis` from `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests`; it wraps the underlying `lake build GnosisProofs` step and rechecks the emitted-kernel bounded affine `continuousHarris` witness package, the measurable/geometric queue endpoints, and the bounded inter-app tethering proofs.
- If you need to inspect the not-yet-closed biological calibration path, start with [ch17-sleep-debt-calibration-sources.md](./ch17-sleep-debt-calibration-sources.md); it lists the verified external source stack and the remaining open empirical gap.
