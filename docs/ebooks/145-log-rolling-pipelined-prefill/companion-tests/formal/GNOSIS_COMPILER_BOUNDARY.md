# Gnosis Compiler Boundary

- Parent README: [README.md](./README.md)
- Theorem ledger: [THEOREM_LEDGER.md](./THEOREM_LEDGER.md)
- Gap checklist: [../../ch17-gap-closure-checklist.md](../../ch17-gap-closure-checklist.md)
- Shared compiler workspace: [../../../../../../gnosis/GnosisProofs.lean](../../../../../../gnosis/GnosisProofs.lean)

This note is the canonical documentation surface for the current Betti-to-Lean compiler boundary in Chapter 17. It is the shortest path to the answer to four questions: what is already checked, what Betti can emit today, what still blocks the full measurable Harris package, and why that remaining gap matters.

## Current Checked Surface

- `THM-GNOSIS-CONTINUOUS-DRIFT`: the shared compiler workspace exposes a real-state measurable drift helper surface through `derive_gnosis_drift`.
- `THM-GNOSIS-CONTINUOUS-HARRIS`: Betti can emit a bounded affine queue-family measurable continuous-Harris witness over the emitted `queueSupportKernel`.
- `THM-GNOSIS-GEOMETRY`: the same emitted queue family can then be repackaged into the measurable/geometric queue endpoints.
- `THM-GNOSIS-COUPLED`: bounded inter-app handoff pressure can be re-read as downstream arrival pressure without changing the downstream spectral certificate when drift slack remains positive.

## What Betti Emits

- Syntax can now supply `observable_kind`, `observable`, `observable_scale`, `observable_offset`, and `drift_gap`.
- The current checked family is affine and queue-shaped: `0 < driftGap <= observableScale`.
- For that family, Betti emits:
  - `*_measurable_observable`
  - `*_measurable_observable_drift`
  - `*_measurable_continuous_harris_certified`
- Those theorems are backed by the shared Lean definitions `MeasurableContinuousHarrisWitness`, `natQueueAffineObservable`, `natQueueAffineExpectedObservable`, `natMeasurableLyapunovDriftWitness_of_queueStep_with_gap`, and `natMeasurableContinuousHarrisWitness_of_queueStep_with_gap`.

## Rerun Surface

From `companion-tests/`:

```bash
bun run test:formal:gnosis
```

Directly in the shared compiler workspace:

```bash
cd /Users/buley/Documents/Code/emotions/open-source/gnosis
lake build GnosisProofs
```

Both commands rerun the shared compiler-side theorem workspace rather than the in-tree `formal/lean` package. This is the path that checks the emitted-kernel bounded affine `continuousHarris` witness package, the measurable/geometric queue endpoints, and the bounded inter-app tethering proofs.

## Final Gap

- Betti does not yet synthesize the measurable small set `C` from arbitrary continuous `.gg` syntax.
- Betti does not yet synthesize minorization data from that syntax.
- Betti does not yet synthesize the continuous Lyapunov witness `V(x)` for richer observable families beyond the current affine queue family.
- Betti does not yet emit non-queue measurable kernels carrying the same Harris package.
- This closure does not also close `THM-RECURSIVE-COARSENING-SYNTHESIS`; recursive many-to-one quotient synthesis is a separate open compiler target.

## Next Honest Boundary

- The next theorem shape is continuous syntactic physics: lower arbitrary continuous `.gg` source into a measurable kernel and synthesize the Harris witness package directly from the program.
- In concrete terms, the bridge must emit `C`, `V(x)`, minorization data, and the stochastic-limit proof obligations instead of asking the human to hand-build those measure-theoretic witnesses.
- The current bounded affine queue witness is therefore the first checked compiler surface, not the final one.

## Why It Matters

- This is the point where the compiler stops being a queue-family certificate emitter and becomes a continuous-syntax physics oracle.
- A user should be able to write ordinary continuous-variable code, rely on the existing `VENT`/service-slack/compiler-lowering structure, and receive machine-checkable thermodynamic and stochastic-limit theorems back out.
- Until that happens, the formal surface honestly certifies one bounded affine queue family and its coupled extensions, but not arbitrary continuous syntax.

## Practical Reading

- Read [THEOREM_LEDGER.md](./THEOREM_LEDGER.md) for the theorem-indexed statement of the boundary.
- Read [README.md](./README.md) for the full formal package and run surface.
- Read [../README.md](../README.md) and [../../ch17-external-reviewer-quickstart.md](../../ch17-external-reviewer-quickstart.md) for the manuscript-facing rerun path.
