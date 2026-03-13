# Companion Test Sources

- Parent README: [../README.md](../README.md)

Vitest suites that provide executable claim coverage for the manuscript.

## Files

- `pipeline-topology.test.ts`: triangle/order/betti lifecycle checks.
- `pipeline-formulas.test.ts`: §7 formula checks, including frontier-fill / occupancy-deficit complements, Whip crossover characterization, and A1/A2 assumption-boundary falsification checks for step-count speedups.
- `cross-shard-stochastic.test.ts`: finite stochastic-service and adaptive-sharding crossover characterization for Worthington Whip.
- `dag-completeness.test.ts`: executable finite-DAG fork/join/chain decomposition coverage.
- `flow-protocol.test.ts`: flow framing and wire semantics.
- `topological-compression.test.ts`: codec race/fold behavior.
- `queueing-subsumption.test.ts`: queueing boundary cases plus exhaustive finite-trace work-conserving discipline coverage, sample-path Little's Law identities, bounded multiclass network conservation checks, finite-support stochastic-mixture expectation checks, exact probabilistic queue/network-kernel propagation checks, a larger exact three-slot multiclass-network witness, and an explicit worst-case small-data ramp-up witness.
- `thermodynamics.test.ts`: First Law, entropy bounds, overhead checks.
- `quantum-topology.test.ts`: quantum deficit identity, band-gap, convergence simulation.
- `quantum-correspondence-boundary.test.ts`: finite path-sum linear-fold equivalence checks, partition/permutation invariants, and nonlinear winner/early-stop counterexamples that bound the quantum correspondence claim.
- `quantum-recombination-ablation.test.ts`: same-path-family ablation harness showing which invariants survive when linear recombination is replaced by winner-take-all or early-stop selection.
- `toy-attention-fold-ablation.test.ts`: fixed-parameter toy attention ablation showing the behavioral cost of swapping only the fold rule while holding keys, values, scores, and query grid constant.
- `gnosis-fold-training-benchmark.ts` / `.test.ts`: wrapper plus tests for the seeded parameter-matched Gnosis training benchmark built from three `.gg` modules that differ only in `FOLD` strategy.
- `ch17-correspondence-boundary-figure.ts` / `.test.ts`: figure manifest/SVG renderer and tests for the artifact-generated Chapter 17 correspondence-boundary chart.
- `deficit-evidence.test.ts`: protocol/settlement/healthcare deficit evidence checks.
- `map-reduce-readiness.test.ts`: §6.14 readiness diagnostic equations and screening-boundary counterexamples.
- `map-reduce-readiness.ts`: shared §6.14 readiness/simulator math used by tests and Gate 4 artifacts.
- `gate1-wallclock.ts`: wall-clock matrix harness + bootstrap CI/gate logic for §14.1 (loopback and external endpoint modes, with bounded request-timeout retries), including optional CPU-heavy per-request kernels (`md5-grind`, `semiprime-factor`) for supplementary hard-workload evidence runs.
- `gate1-wallclock.test.ts`: deterministic coverage for Gate 1 statistics/gate verdict behavior.
- `gate2-protocol-corpus.ts`: seeded heterogeneous protocol-corpus harness for Gate 2 (Aeon Flow vs HTTP/3), including environment-cell scoring, bootstrap CIs, and gate verdict logic.
- `gate2-protocol-corpus.test.ts`: deterministic coverage for Gate 2 default-pass behavior, strict-threshold denial, and markdown rendering.
- `gate3-compression-corpus.ts`: seeded heterogeneous compression-corpus harness for Gate 3, comparing topological per-chunk racing against fixed-codec and heuristic baselines with bootstrap CIs and gate verdict logic.
- `gate3-compression-corpus.test.ts`: deterministic coverage for Gate 3 reduced-corpus pass behavior, strict-threshold denial, and markdown rendering.
- `gate4-rqr-holdout.ts`: out-of-sample `R_qr` gate harness with fixed scoring criteria, bootstrap CIs, and markdown/json reporting.
- `gate4-rqr-holdout.test.ts`: deterministic and threshold-sensitivity coverage for Gate 4 harness behavior.
- `gate5-bio-effect-size.ts`: comparative biological effect-size harness with predeclared pair rules, Monte Carlo uncertainty propagation, pooled bootstrap CIs, and explicit pass/fail criteria.
- `gate5-bio-effect-size.test.ts`: deterministic and threshold-sensitivity coverage for the biological effect-size harness behavior.
- `physics-hierarchy.test.ts`: executable physics-hierarchy model checks.
- `emergent-connections.test.ts`: executable chapter-23 correspondence checks.
- `evidence-traceability.test.ts`: provenance/citation/evidence-type/calibration checks for evidence constants.
- `evidence-sources.ts`: structured constants used by evidence-table tests.
- `formal-parser-compat.test.ts`: parser round-trip compatibility checks.
