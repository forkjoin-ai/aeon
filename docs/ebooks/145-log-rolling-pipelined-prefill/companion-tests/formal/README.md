# Formal Verification Artifacts (TLA+ + Lean)

- Parent README: [../README.md](../README.md)
- Theorem ledger: [THEOREM_LEDGER.md](./THEOREM_LEDGER.md)
- Lean package: [lean/README.md](./lean/README.md)

This directory contains machine-checked formal artifacts used to mechanize the paper's strongest quantitative and topological claims.

## Files

- `ForkRaceFoldC1C4.tla` / `.cfg`: pipeline locality, branch isolation, deterministic fold, bounded termination (C1–C4).
- `QueueingSamplePath.tla` / `.cfg`: finite-trace sample-path Little's Law identity over all work-conserving single-server disciplines in the bounded discrete model.
- `QueueingMultiClassNetwork.tla` / `.cfg`: bounded multi-class open-network conservation law with class-specific routes and finite service-law scenarios under node-local work-conserving dispatch.
- `QueueingStochasticMixture.tla` / `.cfg`: finite-support stochastic multiclass open-network conservation with positive scenario masses and scenario-dependent arrivals, routes, and service realizations.
- `QueueingProbabilisticKernel.tla` / `.cfg`: exact finite-state probabilistic transition kernel for a bounded FIFO queue, with direct distribution-level conservation checks.
- `QueueingProbabilisticNetworkKernel.tla` / `.cfg`: exact finite-state probabilistic multiclass open-network kernel over class-dependent routes, with direct distribution-level conservation checks and the minimal worst-case small-data ramp-up witness.
- `QueueingProbabilisticLargeNetworkKernel.tla` / `.cfg`: larger exact finite-support three-arrival multiclass open-network cube with direct weighted conservation checks over the full 64-branch arrival family.
- `Section7Formulas.tla` / `.cfg`: §7 formulas (Worthington Whip, Speculative Tree, turbulent idle fraction sample, and the frontier-fill / occupancy-deficit complement that reduces to the same idle fraction in the canonical pipeline case).
- `WallaceMetric.tla` / `.cfg`: Wallace metric (`crank`) boundedness/complement on a bounded three-layer frontier, plus the symmetric diamond closed form `2(k-1)/(3k)` and the zero-at-unit-width witness.
- `MultiplexingMonotonicity.tla` / `.cfg`: bounded turbulent-multiplexing monotonicity witness showing fixed useful work plus legal overlap recovery cannot increase the Wallace metric and strictly lowers it when overlap is recovered.
- `WhipCrossover.tla` / `.cfg`: §7.3 cross-shard correction crossover characterization (`T(S)=ceil(P/S)+(N-1)+C*S`) with finite optimum and strict-over-sharding boundary checks.
- `QuantumDeficit.tla` / `.cfg`: §6.12 speedup = topological deficit identity (Grover-scale sample).
- `BeautyOptimality.tla` / `.cfg`: §6.12 Bu beauty-optimality scaffold (definition, latency/waste monotonicity, Pareto/composition invariants).
- `BandGapVoid.tla` / `.cfg`: §6.11 band gaps as voids (`β₂ > 0`) on a finite periodic-energy sample.
- `ProtocolDeficit.tla` / `.cfg`: §8.3 protocol topology deficits (TCP vs QUIC/Aeon Flow).
- `SettlementDeficit.tla` / `.cfg`: §6.12 evidence-table settlement deficit (`Δβ = 2` for T+2 sequential baseline).
- `SchedulerBound.tla` / `.cfg`: conditional scheduler-overhead bound used in §11 performance wording (additive decomposition, bounded overhead, handler-independence under explicit assumptions).
- `lean/Lean/ForkRaceFoldTheorems/Claims.lean`: constructive Lean theorems for quantitative identities, including finite weighted queueing expectation balance, finite-prefix truncation balance, and the linear-additive vs nonlinear-selection correspondence boundary used in §6.12.
- `lean/Lean/ForkRaceFoldTheorems/Wallace.lean`: constructive Lean theorems for the Wallace/crank metric on a three-layer frontier, including boundedness, complement, zero-fullness equivalence, and the symmetric diamond closed form.
- `lean/Lean/ForkRaceFoldTheorems/Multiplexing.lean`: constructive Lean theorems for turbulent-multiplexing monotonicity under fixed useful work and legal overlap recovery.
- `lean/Lean/ForkRaceFoldTheorems/MeasureQueueing.lean`: constructive Lean theorems for infinite weighted queue sums, countably supported stochastic queue laws via `PMF`, measure-theoretic `lintegral` conservation, and monotone truncation-to-limit lifting of queue customer-time balance.
- `lean/Lean/ForkRaceFoldTheorems/Axioms.lean`: explicit-assumption theorem schemas for global claims, including convergence in the modeled finite class and stronger queue-limit shells that still require extra semantic/stability hypotheses.

## Run

From `companion-tests/`:

```bash
bun run test:formal:parser
bun run test:formal:lean
bun run test:formal
```

`test:formal:parser` validates all `.tla/.cfg` artifacts and inspects the Lean project through the self-hosted `aeon-logic` parser/sandbox surface.
`test:formal:lean` builds all Lean theorem modules through `aeon-logic`'s `runLeanSandbox`, which in turn requires a successful `lake build`.
`test:formal` runs parser preflight, Lean build and TLC model checking.
