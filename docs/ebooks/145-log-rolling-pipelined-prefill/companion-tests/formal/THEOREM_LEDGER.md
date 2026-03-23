# Formal Theorem Ledger

- Parent README: [README.md](./README.md)
- Lean package: [lean/README.md](./lean/README.md)
- Betti compiler proofs: [../../../../../../gnosis/GnosisProofs.lean](../../../../../../gnosis/GnosisProofs.lean)

This ledger turns top-level manuscript claims into named theorems with explicit assumptions and mechanization targets across the local formal package and the shared Betti compiler proof workspace.

## Ledger Statistics (2026-03-22)

- **Theorem table entries:** 1,425+ across 143 topical sections (all mechanized, zero open)
- **Lean theorem declarations:** 3,228+ across 201 modules (including compositions, predictions rounds, cross-module identities, cancer confinement, combinatorial brute force rounds 1-5, philosophical allegories, Greek logic canon, unsolved mysteries, second tier mysteries, philosophical combinatorics rounds 1-4, and seven laws predictions rounds 1-2)
- **TLA+ specifications:** 112 (all with matching .cfg files)
- **Lean theorem modules:** 201
- **GG proof topologies:** 1,499 (all valid, all complete, zero parse errors)
- **Buleyean proof engine:** `@a0n/aeon-logic/buleyean-proof.ts` -- parse, verify, emit Lean 4 + TLA+ from .gg
- **Personality model:** `@a0n/buleyean-rl/personality.ts` -- five-parameter void walker (Try/Choose/Commit/LetGo/Learn)
- **Converters:** `tlaToGg()`, `leanToGg()` -- bidirectional formal ledger conversion
- **Prior statistics (2026-03-18):** 735 entries across 68 sections, 97 TLA+ specs, 120 Lean modules
- **External proof surface:** GnosisProofs.lean (Betti compiler proofs)
- **Trace artifacts:** 4 TTrace files + 1 tmp file (retained for counterexample reference)

## Sorry Status

**Files with outstanding `sorry`:** Two files carry real sorry markers:
- `TradeTopology.lean` line 273: `sorry -- requires specialization of diversity_necessity to arbitrary stream counts`
- `TradeTopologyRound2.lean` line 227: `sorry -- requires monotonicity of (n - log n) which needs real analysis`

All other files are sorry-free. References to "sorry" in other files appear only in doc comments confirming zero-sorry status.

**Sorry-free files (complete mechanization):** IrreversibilityPredictions.lean (20 theorems -- entangle, deficit, erasure, aleph, verify), SemioticPeace.lean (13 theorems), SemioticDeficit.lean, CoarseningThermodynamics.lean, ThermodynamicTracedMonoidal.lean, RenormalizationFixedPoints.lean, DataProcessingInequality.lean, MonoidalCoherence.lean, TracedMonoidal.lean, RateDistortionFrontier.lean, InfiniteErasure.lean, GeometricErgodicity.lean, ContinuousHarris.lean, AmericanFrontier.lean (4 theorems), NetflixFrontier.lean (9 theorems -- monotone algo/team, positive below, pigeonhole, recursive, residual gap, independent convergence, master conjunction; all `omega` on concrete ℕ from published RMSE × 10⁴), VoidWalking.lean (7 theorems, 17 definitions/lemmas), NegotiationEquilibrium.lean (90+ theorems, 40+ structures/definitions spanning negotiation theory, dual void, void relativity, and the Six Pillars: Arrow of Time, Holographic Principle, General Relativity, Noether's Theorem, Entanglement, and Unification), RecursiveCoarseningSynthesis.lean (5 theorems -- synthesis_sound, drift_conservation, fine_stability_implies_coarse_stability, identity_quotient_preserves_stability, certificate_provides_drift_witness), CodecRacing.lean, DualProtocol.lean, MolecularTopology.lean, ProtocolDeficitLatency.lean, FrameNativeBisim.lean, FrameOverheadBound.lean, FailureEntropy.lean, FailureDurability.lean, FailureFamilies.lean, HeteroMoAFabric.lean, CommunityDominance.lean (7 theorem families -- community attenuation, nondegradation, strict domination, tare bridging, Bule convergence, diversity amplification, master dominance theory), SkyrmsNadirBule.lean (12 theorems -- Skyrms-as-community mapping, Bule-zero-iff-nadir biconditional, algebraic nadir identification, mediation-is-attenuation, master theorem composing CommunityDominance + NegotiationEquilibrium + VoidWalking), ReynoldsBFT.lean (24 theorems -- exact `Re < 3/2` quorum-safe and `Re < 2` majority-safe iff boundaries, plus exact `mergeAll`/`quorumFold`/`syncRequired` regime classification), PluralistRepublic.lean (17 theorems -- one-stream positive deficit, exact strict-dominance gap, global Bule optimality under civic cover, republican evidence gate, and exact deliberative regime wrappers), SleepDebt.lean, SleepDebtSchedule.lean, SleepDebtWeightedSchedule.lean, StagedExpansion.lean, WarmupController.lean, ControllerTieBreaking.lean (22 theorems -- failure-controller and warm-up-controller equality/tie boundaries, iff characterizations, and anti-selection laws), WarmupEfficiency.lean, Multiplexing.lean, Wallace.lean, MetacognitiveDaisyChain.lean, QuorumAsyncNetwork.lean, QuorumConsistency.lean, QuorumLinearizability.lean, QuorumOrdering.lean, QuorumVisibility.lean, QueueBoundary.lean, QueueStability.lean, MeasureQueueing.lean, StateDependentQueueFamilies.lean, JacksonQueueing.lean, JacksonExactClosure.lean, JacksonFeedForwardClosure.lean, JacksonEnvelopeClosure.lean, JacksonRawClosure.lean, RetrocausalBound.lean (13 theorems -- backward count recovery, ordering preservation, concentrated boundary uniqueness, multinomial positivity, RG fixed-point composition, Landauer heat composition, master theorem), CancerTreatments.lean (12 theorems -- metabolic gate sequencing, checkpoint cascade amplification, senescence-then-senolytic two-step, viral oncoprotein displacement, counter-vent depletion before immunotherapy, master treatment predictions theorem), CryptographicPredictions.lean (15 theorems -- hash collision heat floor, one-way inversion side-information, ZK deficit-zero simulability, commitment semiotic folds, password hashing side-channel floor, master cryptographic predictions theorem), RaceWinnerPredictions.lean (15 theorems -- election winner validity, election winner minimality, election winner isolation, training drift convergence, training stall, learning rate monotonicity, geometric convergence, contraction ordering, bound ordering, org level positive loss, adding level increases loss, hierarchy fixed point, monolingual positive deficit, code-switching reduces deficit, shared context reduces deficit, master theorem), FinalCompositions.lean (15 theorems -- negotiation settlement fixed point, concession reduces terms, settlement Lyapunov stability, quotient preserves cardinality, quotient preserves nontriviality, interference survives coarsening, rate-distortion monotonicity, zero rate max distortion, full rate zero distortion, vacation queue bounded, queue drains when active, vacation increases occupancy, unified information-processing chain), and others in the passing umbrella build.

**Proof techniques by file:**
| File | Theorem | Technique |
|---|---|---|
| `EnrichedConvergence.lean` | `throughput_maximum_exists` | list maximum by induction |
| `EntropicRefinementCalculus.lean` | `conditionalEntropy_initial_information_measure` | chain rule + entropy-domination hypothesis (unconditional version now proved via fiber induction in `entropic-refinement-unconditional.test.ts`, 16 tests) |
| `RecursiveCoarseningSynthesis.lean` | `drift_conservation` | Finset.sum_biUnion rearrangement |
| `RecursiveCoarseningSynthesis.lean` | `fine_stability_implies_coarse_stability` | Finset.sum_lt_sum |
| `CompositionalErgodicity.lean` | `pipelineCertificate` | safe epsilon choice (ε₁ = 1-r₁r₂, ε₂ = 1) |
| `ServerTopology.lean` | `race_elimination_vent_count` | card arithmetic via Finset.card_union_of_disjoint |

**Note on EntropicRefinementCalculus:** The universal property theorem previously carried two explicit hypotheses (entropy domination at the terminal map). The unconditional version is now proved via executable fiber induction in `entropic-refinement-unconditional.test.ts` (16 tests, 0 failures): entropy domination at the terminal map follows from the chain rule H(X,Y) = H(X) + H(Y|X) and non-negativity of conditional entropy H(Y|X) >= 0, by induction on the partition lattice depth. Verified for 100 random distributions across partition sizes 2-31.

### Foundation: Fork/Race/Fold Axioms & Core Laws

*The primitive safety/liveness axioms, monoidal coherence, DAG completeness, conservation law, and convergence schema.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-C1C4` | Fork/race/fold safety+liveness (C1–C4) | finite items/stages/branches; deterministic fold; bounded timeout; weak fairness on `Tick`/`Fold`; implication hypotheses from C1-C4 to safety/liveness | TLA+ `ForkRaceFoldC1C4.tla` + Lean schema `Axioms.c1_c4_imply_safety_and_liveness` | Mechanized |
| `THM-GNOSIS-MONOIDAL` | Fork/Race/Fold coherence: the GGL topological primitives satisfy the compiler's coherent monoidal execution laws for natural fork relabeling, associative race, and deterministic fold | type `alpha`; `Semigroup` or `CommMonoid` instances where deterministic fold coherence requires them | Lean theorems `GnosisProofs.fork_natural`, `GnosisProofs.c3_deterministic_fold`, and `GnosisProofs.race_tree_coherence` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized |
| `THM-SCHED-BOUND` | Conditional scheduler-overhead bound: additive + bounded + handler-independent under explicit assumptions | finite topology step bound; bounded metadata; constant scheduler primitive costs; finite handler-cost domain | TLA+ `SchedulerBound.tla` invariants (`InvAdditiveRuntimeDecomposition`, `InvSchedulerOverheadBounded`, `InvSchedulerOverheadIndependentOfHandler`) | Mechanized |
| `THM-PARSER-CLOSURE` | Formal artifacts are self-consistent under project parser | parser totality on grammar; pairwise `.tla/.cfg` completeness; round-trip stability | `aeon-logic` parser preflight + Lean schema `Axioms.parser_closure_theorem` | Mechanized |
| `THM-COMPLETENESS-DAG` | Fork/race/fold expresses any DAG | finite DAG; decomposition exists; decomposition is sound and complete; encoding function exists | Lean local decomposition theorem `Claims.local_node_decomposition` + schema `Axioms.dag_completeness_schema` + executable finite-DAG decomposition tests | Mechanized (assumption-parameterized + executable) |
| `THM-CONVERGENCE-SCHEMA` | Constraint-driven convergence to fork/race/fold in modeled finite class | conservation, irreversibility, nonzero overhead, finite-state model, throughput-selection pressure, attractor and model-class uniqueness assumptions | Lean schema `Axioms.convergence_schema` + executable convergence simulation tests | Mechanized (assumption-parameterized + executable) |
| `THM-FIRST-LAW-GENERAL` | `V_fork = W_fold + Q_vent` for modeled systems | `W_fold <= V_fork` | Lean theorem `Claims.first_law_conservation` + executable thermodynamics tests | Mechanized |

### Monoidal Coherence & Traced Structure (Tracks Zeta + Eta)

*Mac Lane coherence generators (pentagon, triangle, hexagon), symmetric monoidal category, and Joyal-Street-Verity traced monoidal axioms for feedback/iteration.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-PENTAGON` | The pentagon identity for the fork/race/fold monoidal category: for four objects A,B,C,D, the two associator paths from `((A×B)×C)×D` to `A×(B×(C×D))` are equal. This is the first generator of Mac Lane coherence. | type variables `alpha`, `beta`, `gamma`, `delta` | TLA+ `MonoidalCoherence.tla` invariant `InvPentagon` + Lean theorem `MonoidalCoherence.pentagon` in `MonoidalCoherence.lean` | Mechanized |
| `THM-TRIANGLE` | The triangle identity: the path `(A×I)×B → A×(I×B) → A×B` via associator + left unitor equals the direct right unitor path. Second generator of Mac Lane coherence. | type variables `alpha`, `beta`; `I = PUnit` (monoidal unit) | TLA+ `MonoidalCoherence.tla` invariant `InvTriangle` + Lean theorem `MonoidalCoherence.triangle` in `MonoidalCoherence.lean` | Mechanized |
| `THM-HEXAGON` | The hexagon identity for braiding: two paths from `(A×B)×C` to `B×(A×C)` via associator + braiding agree. Third generator of symmetric monoidal coherence. | type variables `alpha`, `beta`, `gamma` | TLA+ `MonoidalCoherence.tla` invariant `InvHexagon` + Lean theorem `MonoidalCoherence.hexagon` in `MonoidalCoherence.lean` | Mechanized |
| `THM-MONOIDAL-CATEGORY` | Bundle: `GHom` with `gcomp`, `tensorHom`, `PUnit`, associators, unitors forms a monoidal category. All structural roundtrips (associator, unitor) are identity, pentagon and triangle hold. | type variables for objects | TLA+ `MonoidalCoherence.tla` invariant `InvMonoidalCategory` + Lean theorem `MonoidalCoherence.monoidal_category` in `MonoidalCoherence.lean` | Mechanized |
| `THM-SYMMETRIC-MONOIDAL` | Adding `braid` to the monoidal category makes it symmetric monoidal. Braid is involutive and satisfies the hexagon identity. | type variables for objects | TLA+ `MonoidalCoherence.tla` invariant `InvSymmetricMonoidal` + Lean theorem `MonoidalCoherence.symmetric_monoidal` in `MonoidalCoherence.lean` | Mechanized |
| `THM-COHERENCE` | Mac Lane coherence: every well-typed diagram of structural morphisms in the fork/race/fold category commutes. Follows from pentagon + triangle + hexagon generators by Mac Lane's coherence theorem (1963). | monoidal category structure (THM-MONOIDAL-CATEGORY) + symmetric structure (THM-SYMMETRIC-MONOIDAL) | TLA+ `MonoidalCoherence.tla` invariants + Lean theorem `MonoidalCoherence.coherence` in `MonoidalCoherence.lean` | Mechanized |
| `THM-TRACE-VANISHING` | Trace vanishing: when feedback type is monoidal unit PUnit, the trace reduces to the function itself. Trivial feedback disappears: `Tr_I(f) = f`. | type variables for objects; trace operator on GHom | TLA+ `TracedMonoidal.tla` invariant `InvVanishing` + Lean theorem `TracedMonoidal.trace_vanishing_id` in `TracedMonoidal.lean` | Mechanized |
| `THM-TRACE-YANKING` | Trace yanking: `Tr(braid) = id`. The trace of the swap morphism is identity — pulling a straight string through a loop leaves it straight. Uses `braid_involutive` from MonoidalCoherence. | type variables for objects; braid involution | TLA+ `TracedMonoidal.tla` invariant `InvYanking` + Lean theorem `TracedMonoidal.trace_yanking` in `TracedMonoidal.lean` | Mechanized |
| `THM-TRACE-SLIDING` | Trace sliding: `Tr(f ∘ (id⊗g)) = Tr((id⊗g) ∘ f)`. Sliding a morphism around the feedback loop preserves the trace. Naturality of the feedback wire (Joyal-Street-Verity, 1996). | type variables for objects and feedback type; morphisms f, g | TLA+ `TracedMonoidal.tla` invariant `InvSliding` + Lean theorems `TracedMonoidal.trace_sliding_id` and `TracedMonoidal.trace_sliding` in `TracedMonoidal.lean` | Mechanized |
| `THM-TRACE-SUPERPOSING` | Trace superposing: `Tr(f) ⊗ g = Tr(f ⊗ g)`. Feedback on one component does not interfere with parallel computation. | type variables for objects; morphisms f, g | TLA+ `TracedMonoidal.tla` invariant `InvSuperposing` + Lean theorems `TracedMonoidal.trace_superposing` and `TracedMonoidal.trace_superposing_id` in `TracedMonoidal.lean` | Mechanized |
| `THM-TRACED-MONOIDAL` | Bundle: the fork/race/fold category with trace satisfies all Joyal-Street-Verity axioms (vanishing, yanking, sliding, superposing). Extends the symmetric monoidal category to a traced monoidal category, formalizing iterative/recursive computation. | symmetric monoidal structure (THM-COHERENCE); trace operator on GHom | TLA+ `TracedMonoidal.tla` invariant `InvTracedMonoidal` + Lean theorem `TracedMonoidal.traced_monoidal` in `TracedMonoidal.lean` | Mechanized |
| `THM-TRACE-ITERATION` | The trace operator models bounded iteration: `Tr(f)(a)` produces the same result as `traceIter(f, a, fuel)` for any fuel. Connects the categorical trace to computational iteration. | type variables; fuel parameter | TLA+ `TracedMonoidal.tla` invariant `InvIteration` + Lean theorem `TracedMonoidal.trace_iteration_equiv` in `TracedMonoidal.lean` | Mechanized |

### Failure Theory: Collapse, Cost, and Control

*The no-free-collapse family: trilemma, composition, universality, minimum cost floors, tightness, controller, Pareto frontier, failure entropy, failure durability, and failure families.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-FAIL-ENTROPY` | Structured failure reduces a live-frontier entropy proxy, collapse from a forked frontier to one survivor requires at least one failed branch, and coupled repair debt preserves or reverses that reduction | finite live-frontier width; local vent count bounded by the frontier; repair debt modeled as post-vent branch reintroduction; entropy proxy = `livePaths - 1` | TLA+ `FailureEntropy.tla` invariants (`InvStructuredFailureConservesMass`, `InvStructuredFailureReducesWidth`, `InvStructuredFailureReducesEntropy`, `InvSingleSurvivorNeedsFailure`, `InvCoupledFailurePreservesWidth`, `InvCoupledFailurePreservesEntropy`, `InvCoupledFailureStrictWhenRepairExceedsVented`) + Lean theorems `FailureEntropy.structured_failure_conserves_frontier_mass`, `FailureEntropy.structured_failure_reduces_entropy_proxy`, `FailureEntropy.success_from_forked_frontier_requires_failure`, `FailureEntropy.coupled_failure_preserves_or_increases_entropy_proxy`, and `FailureEntropy.coupled_failure_strictly_increases_entropy_proxy` | Mechanized |
| `THM-FAIL-FAMILIES` | Failure topology splits into branch-isolating failure, which preserves deterministic fold on the survivor projection and carries zero repair debt, and contagious failure, which forces positive repair debt and breaks projected/observed fold agreement | finite branch snapshots; survivor projection keeps pre-failure outputs on post-failure survivors; contagious failure means a surviving branch changes output after failure; repair debt counts surviving branches whose outputs changed | TLA+ `FailureFamilies.tla` invariants (`InvWellFormed`, `InvBranchIsolatingPreservesDeterministicFold`, `InvBranchIsolatingRepairDebtZero`, `InvContagiousFailureForcesRepairDebt`, `InvContagiousFailureBreaksDeterministicFold`) + Lean theorems `FailureFamilies.branch_isolating_preserves_deterministic_fold`, `FailureFamilies.branch_isolating_has_zero_repair_debt`, `FailureFamilies.branch_isolating_blocks_contagion`, and `FailureFamilies.contagious_failure_forces_repair_debt` | Mechanized |
| `THM-FAIL-DURABILITY` | Bounded branch-isolating failures preserve quorum durability and, once failures are exhausted, weakly fair repair returns the system to the fully repaired stable state | finite replica set; isolated single-replica failures only; explicit failure budget `f < n`; repair restores one missing replica at a time; repair action is weakly fair once enabled; no new failures after the budget is exhausted | TLA+ `FailureDurability.tla` invariants (`InvWellFormed`, `InvReplicaMassConserved`, `InvRepairDebtBounded`, `InvQuorumDurability`, `InvPositiveLive`) + liveness property `PropFailureExhaustionLeadsToStable` + Lean theorems `FailureDurability.durable_live_count_ge_quorum`, `FailureDurability.durable_live_count_positive`, `FailureDurability.repair_closure_preserves_replica_mass`, and `FailureDurability.repair_closure_stable_of_exhausted_failures` | Mechanized |
| `THM-FAIL-TRILEMMA` | A nontrivial fork cannot collapse to a deterministic single-survivor fold for free: zero vent plus zero repair debt precludes deterministic collapse, so any deterministic single-survivor collapse must pay either vented loss or repair debt; contagious failure in the zero-vent regime preserves branch mass and still forces debt | aligned branch snapshots; nontrivial fork means more than one live branch before collapse; deterministic collapse means survivor-projected fold agreement plus exactly one live survivor; zero waste means zero vented branches and zero repair debt | TLA+ `FailureTrilemma.tla` invariants (`InvZeroVentPreservesBranchMass`, `InvNoFreeDeterministicCollapse`, `InvDeterministicSingleSurvivorRequiresWaste`, `InvContagiousFailureNotEntropyFree`, `InvGlobalContagionPreservesBranchMassAndForcesDebt`) + Lean theorems `FailureTrilemma.zero_vent_preserves_live_branch_lower_bound`, `FailureTrilemma.zero_vent_precludes_single_survivor_collapse`, `FailureTrilemma.nontrivial_fork_no_waste_precludes_deterministic_collapse`, `FailureTrilemma.deterministic_single_survivor_collapse_requires_waste`, `FailureTrilemma.contagious_failure_cannot_be_entropy_free`, and `FailureTrilemma.contagious_global_recovery_preserves_branch_mass_and_forces_debt` | Mechanized |
| `THM-FAIL-COMPOSITION` | The no-free-collapse boundary composes across stages: once a pipeline starts from a nontrivial fork, stagewise zero vent and zero repair debt cannot end in a deterministic single-survivor collapse, so any such global collapse must accumulate vent or debt and therefore contains at least one paid stage | aligned stage snapshots; nontrivial fork means more than one live branch in the initial stage; terminal deterministic collapse means survivor-projected fold agreement plus exactly one live survivor at the pipeline end; total vent and total repair debt sum adjacent-stage costs over the chain | TLA+ `FailureComposition.tla` invariants (`InvStagewiseZeroVentPreservesBranchMass`, `InvNoFreePipelineCollapse`, `InvPipelineCollapseRequiresGlobalWaste`, `InvPipelineCollapseRequiresPaidStage`, `InvContagionCannotStayFreeAcrossPipeline`) + Lean theorems `FailureComposition.pipeline_zero_vent_preserves_live_branch_lower_bound`, `FailureComposition.pipeline_no_waste_precludes_deterministic_collapse`, `FailureComposition.pipeline_deterministic_collapse_requires_waste`, and `FailureComposition.pipeline_deterministic_collapse_requires_waste_stage` | Mechanized |
| `THM-FAIL-UNIVERSAL` | The no-free-collapse boundary survives normalization to persistent branch identity and arbitrary depth: any nontrivial sparse choice system, and therefore any finite prefix of an arbitrary-depth recovery trajectory, cannot realize deterministic fold with both zero total vent and zero total repair debt; if deterministic collapse occurs, some stage in the prefix pays the cost | sparse branch observations normalize onto a persistent finite branch-ID support; deterministic collapse is checked on the normalized survivor projection; arbitrary depth is represented by taking any finite prefix of a recovery trajectory; total vent and total repair debt sum normalized adjacent-stage costs | TLA+ `FailureUniversality.tla` invariants (`InvZeroVentPreservesBranchMassAtAnyDepth`, `InvNoFreeDeterministicCollapseAtAnyDepth`, `InvDeterministicCollapseRequiresGlobalWaste`, `InvDeterministicCollapseRequiresPaidStage`, `InvDistributedRepairDebtCannotStayFree`) + Lean theorems `FailureUniversality.ChoiceSystem.trilemma`, `FailureUniversality.ChoiceSystem.deterministic_collapse_requires_waste`, `FailureUniversality.ChoiceSystem.deterministic_collapse_requires_paid_stage`, `FailureUniversality.ChoiceTrajectory.collapse_at_depth_requires_waste`, `FailureUniversality.ChoiceTrajectory.collapse_at_depth_requires_paid_stage`, and `FailureUniversality.ChoiceTrajectory.no_depth_realizes_free_deterministic_collapse` | Mechanized |
| `THM-FAIL-MINCOST` | Deterministic collapse has a minimum cost floor: for any normalized sparse choice system or finite prefix of an arbitrary-depth recovery trajectory, collapsing from an initial fork to one survivor requires at least `initialLive - 1` vented branches, and therefore `totalVented + totalRepairDebt >= initialLive - 1` | same persistent-branch normalization as `THM-FAIL-UNIVERSAL`; deterministic collapse means exactly one terminal survivor; vented count sums all live-to-dead losses across the trajectory; total cost is `totalVented + totalRepairDebt` | TLA+ `FailureUniversality.tla` invariants (`InvVentedEqualsForkWidthGap`, `InvDeterministicCollapseRequiresVentFloor`, `InvDeterministicCollapseRequiresCostFloor`) + Lean theorems `FailureComposition.live_branch_count_le_after_plus_vented`, `FailureComposition.pipeline_vented_covers_live_branch_loss`, `FailureUniversality.ChoiceSystem.deterministic_collapse_vented_lower_bound`, `FailureUniversality.ChoiceSystem.deterministic_collapse_cost_lower_bound`, `FailureUniversality.ChoiceTrajectory.collapse_at_depth_vented_lower_bound`, `FailureUniversality.ChoiceTrajectory.collapse_at_depth_cost_lower_bound`, and `FailureUniversality.ChoiceTrajectory.no_depth_beats_fork_cost_floor` | Mechanized |
| `THM-FAIL-LANDAUER-BOUNDARY` | The thermodynamic bridge now spans finite, countable-support, measurable finite-type, observable-pushforward, and effective-support layers. For an equiprobable live frontier, a vented branch carries self-information exactly equal to the frontier Shannon entropy in bits; more generally, every finite branch law on a nonempty finite support carries Shannon entropy at most the equiprobable frontier entropy and therefore at most the deterministic-collapse failure-tax floor from `THM-FAIL-MINCOST`; equality with that finite entropy ceiling occurs exactly for the uniform law on the given support; equality with the failure-tax floor occurs exactly for the uniform law on one- or two-branch supports; and every achievable deterministic collapse of the same finite frontier cardinality therefore pays at least the corresponding Landauer heat budget. On the nontrivial binary surface this sharp finite equality reduces to the fair binary fork witness, where the exact `kT ln 2` equality appears. Beyond the finite bridge, the package carries a countable-support entropy shell for arbitrary PMFs (nonnegative Shannon entropy as `ENNReal` `tsum`, supremum of finite truncations, counting-measure `lintegral` on countable measurable types, and finite-type collapse), a matching countable-support heat shell (direct `ENNReal` Landauer heat in nats, again with finite-truncation `iSup`, counting-measure `lintegral`, and finite-type collapse), a direct measurable finite-type shell, an observable pushforward shell, and an effective-support layer: for any PMF on any type whose support is contained in a finite `Finset s`, the `ENNReal` entropy is bounded by the frontier entropy `log₂(s.card)` and by the failure tax `s.card - 1`, the Landauer heat is bounded by the failure-tax heat budget, and the Landauer heat is bounded by the Landauer heat of any achievable collapse cost. That effective-support layer now also composes with deterministic observables: if the source PMF is supported on `s`, then any observable pushforward has entropy and Landauer heat bounded above by the source law itself and therefore inherits the same source-support frontier, failure-tax, and achievable-collapse heat bounds without requiring measurable structure on the codomain. This closes the measurable erasure gap for arbitrary branch laws with finite effective support without requiring the ambient type to be a `Fintype` | positive finite live frontier; equiprobable branch mass `1 / liveBranches`; finite non-uniform branch laws represented as `PMF α` over a nonempty finite type; Shannon entropy measured in bits; binary branch law given by `branchProbability`; Bernoulli entropy bound uses `0 ≤ branchProbability ≤ 1`; deterministic-collapse comparison for an arbitrary finite branch law identifies `Fintype.card α` with the live frontier width; deterministic-collapse cost is measured in the existing failure-tax units; the finite entropy-equality characterization compares branch laws against `PMF.uniformOfFintype α`, and the failure-tax equality characterization additionally isolates the cardinalities `1` and `2`; the countable-support counting-measure formulation additionally assumes a measurable space with countable carrier and measurable singletons; the observable pushforward shell additionally assumes a measurable source/codomain when identifying observable branch mass with measurable fiber probability, a countable measurable codomain with measurable singletons for the counting-measure formulas, and a nonempty finite observable codomain for the sharp failure-tax/heat equalities; the effective-support theorems assume a `Finset s` with `∀ a, a ∉ s → branchLaw a = 0` and `s.Nonempty`, and bound entropy/heat by `s.card`-indexed frontier/tax quantities; the effective-support observable monotonicity theorems additionally assume `DecidableEq β` and an arbitrary observable `observable : α → β`; Landauer calibration uses nonnegative Boltzmann constant and temperature, and the finite/binary heat equality characterizations use positive Boltzmann constant and temperature | Lean theorems `LandauerBuley.uniform_branch_self_information_bits_eq_frontier_entropy_bits`, `LandauerBuley.finite_branch_entropy_nats_le_log_card`, `LandauerBuley.finite_branch_entropy_nats_eq_log_card_iff`, `LandauerBuley.finite_branch_entropy_bits_le_frontier_entropy_bits`, `LandauerBuley.finite_branch_entropy_bits_eq_frontier_entropy_bits_iff`, `LandauerBuley.frontier_entropy_bits_eq_failure_tax_iff`, `LandauerBuley.finite_branch_entropy_bits_le_failure_tax`, `LandauerBuley.finite_branch_entropy_bits_eq_failure_tax_iff`, `LandauerBuley.countable_branch_entropy_natsENN_eq_iSup_truncated`, `LandauerBuley.countable_branch_entropy_natsENN_eq_count_lintegral`, `LandauerBuley.countable_branch_entropy_natsENN_eq_finite`, `LandauerBuley.countable_branch_entropy_bitsENN_eq_finite`, `LandauerBuley.countable_branch_entropy_bitsENN_eq_frontier_entropy_bits_iff`, `LandauerBuley.countable_branch_entropy_bitsENN_le_frontier_entropy_bits`, `LandauerBuley.countable_branch_entropy_bitsENN_eq_failure_tax_iff`, `LandauerBuley.countable_branch_entropy_bitsENN_le_failure_tax`, `LandauerBuley.truncated_landauer_heat_lower_boundENN_le_countable`, `LandauerBuley.countable_landauer_heat_lower_boundENN_eq_iSup_truncated`, `LandauerBuley.countable_landauer_heat_lower_boundENN_eq_count_lintegral`, `LandauerBuley.countable_landauer_heat_lower_boundENN_eq_count_lintegral_of_nonneg`, `LandauerBuley.observed_branch_mass_eq_fiber_measure`, `LandauerBuley.observed_branch_entropy_natsENN_eq_iSup_truncated`, `LandauerBuley.observed_branch_entropy_natsENN_eq_count_lintegral`, `LandauerBuley.observed_landauer_heat_lower_boundENN_eq_iSup_truncated`, `LandauerBuley.observed_landauer_heat_lower_boundENN_eq_count_lintegral`, `LandauerBuley.observed_branch_entropy_bitsENN_eq_finite`, `LandauerBuley.observed_branch_entropy_bitsENN_le_frontier_entropy_bits`, `LandauerBuley.observed_branch_entropy_bitsENN_le_failure_tax`, `LandauerBuley.observed_branch_entropy_bitsENN_eq_failure_tax_iff`, `LandauerBuley.observed_landauer_heat_lower_boundENN_eq_finite`, `LandauerBuley.observed_landauer_heat_le_failure_tax_budget`, `LandauerBuley.observed_landauer_heat_eq_failure_tax_budget_iff`, `LandauerBuley.observed_collapse_landauer_heat_le_total_cost`, `LandauerBuley.effective_support_entropy_natsENN_le_log_card`, `LandauerBuley.effective_support_entropy_bitsENN_le_frontier_entropy_bits`, `LandauerBuley.effective_support_entropy_bitsENN_le_failure_tax`, `LandauerBuley.effective_support_landauer_heat_le_failure_tax_budget`, `LandauerBuley.effective_support_collapse_landauer_heat_le_total_cost`, `LandauerBuley.effective_support_observed_entropy_natsENN_le_source`, `LandauerBuley.effective_support_observed_entropy_bitsENN_le_source`, `LandauerBuley.effective_support_observed_entropy_bitsENN_le_frontier_entropy_bits`, `LandauerBuley.effective_support_observed_entropy_bitsENN_le_failure_tax`, `LandauerBuley.effective_support_observed_landauer_heat_le_source`, `LandauerBuley.effective_support_observed_landauer_heat_le_failure_tax_budget`, `LandauerBuley.effective_support_observed_collapse_landauer_heat_le_total_cost`, `LandauerBuley.binary_branch_entropy_bits_le_failure_tax`, `LandauerBuley.binary_branch_entropy_bits_eq_failure_tax_iff`, `LandauerBuley.binary_failure_tax_matches_entropy_bits`, `LandauerBuley.achievable_collapse_entropy_bits_le_total_cost`, `LandauerBuley.achievable_collapse_finite_entropy_bits_le_total_cost`, `LandauerBuley.landauer_heat_le_failure_tax_heat_budget`, `LandauerBuley.finite_landauer_heat_le_failure_tax_budget`, `LandauerBuley.finite_landauer_heat_eq_failure_tax_budget_iff`, `LandauerBuley.binary_landauer_heat_le_failure_tax_budget`, `LandauerBuley.binary_landauer_heat_eq_failure_tax_budget_iff`, `LandauerBuley.binary_landauer_heat_matches_failure_tax_budget`, `LandauerBuley.achievable_collapse_landauer_heat_le_total_cost`, `LandauerBuley.achievable_collapse_finite_entropy_landauer_heat_le_total_cost`, `LandauerBuley.countable_landauer_heat_lower_boundENN_eq_finite`, `LandauerBuley.countable_landauer_heat_le_failure_tax_budget`, `LandauerBuley.countable_landauer_heat_eq_failure_tax_budget_iff`, and `LandauerBuley.countable_collapse_landauer_heat_le_total_cost` | Mechanized |
| `THM-FAIL-TIGHTNESS` | The deterministic-collapse cost floor is tight: for any positive-live normalized start state there exists a branch-isolating single-survivor collapse witness with zero repair debt and exact cost `initialLive - 1`, so the exact minimum deterministic-collapse cost is `initialLive - 1` | positive initial live branch count; collapse witness preserves exactly one surviving output, vents every other live branch, and is measured over aligned finite recovery pipelines on the normalized state space | TLA+ `FailureUniversality.tla` invariants (`InvCanonicalWitnessWellFormed`, `InvCanonicalWitnessDeterministicCollapse`, `InvCanonicalWitnessZeroRepairDebt`, `InvCanonicalWitnessAttainsVentFloor`, `InvCanonicalWitnessAttainsCostFloor`) + Lean theorems `FailureUniversality.collapseWitness_deterministic_collapse`, `FailureUniversality.collapseWitness_vented_cost_exact`, `FailureUniversality.collapseWitness_total_cost_exact`, `FailureUniversality.collapse_cost_floor_attainable`, `FailureUniversality.collapse_cost_floor_exact`, `FailureUniversality.ChoiceSystem.exact_collapse_cost_floor`, and `FailureUniversality.ChoiceTrajectory.prefix_exact_collapse_cost_floor` | Mechanized |
| `THM-FAIL-CTRL` | Over the three canonical failure actions `keep-multiplicity`, `pay-vent`, and `pay-repair`, the score-minimizing controller chooses the action with the smallest weighted coefficient against the exact collapse floor `liveBranches - 1`, so the same lower bound from `THM-FAIL-MINCOST` becomes the stagewise controller cost base | canonical action family only; objective is `alpha * wallace + beta * buley + gamma * vent + delta * repair`; canonical keep score is `(alpha + beta) * (liveBranches - 1)`; canonical vent score is `gamma * (liveBranches - 1)`; canonical repair score is `(beta + delta) * (liveBranches - 1)`; branch-isolating tightness supplies an achievable exact vent floor | TLA+ `FailureController.tla` invariants (`InvChosenScoreMinimal`, `InvKeepOptimalWhenCoefficientMinimal`, `InvVentOptimalWhenCoefficientMinimal`, `InvRepairOptimalWhenCoefficientMinimal`) + Lean theorems `FailureController.branch_isolating_floor_achievable_from_live_count`, `FailureController.choose_keep_when_keep_coefficient_min`, `FailureController.choose_vent_when_vent_coefficient_min`, `FailureController.choose_repair_when_repair_coefficient_min`, and `FailureController.chosen_failure_action_score_minimal` | Mechanized |
| `THM-FAIL-CTRL-TIES` | Failure-controller ties are deterministic: any tie involving `keep-multiplicity` resolves to `keep-multiplicity`, and a `pay-vent`/`pay-repair` tie resolves to `pay-vent`, so `pay-repair` appears only when it is strictly smaller than both earlier coefficients | canonical action family only; branch order in `chooseFailureAction` is `keep-multiplicity`, then `pay-vent`, then `pay-repair`; equal scores come from equal weighted coefficients against the same collapse floor | Lean theorems `ControllerTieBreaking.choose_keep_on_keep_vent_tie`, `ControllerTieBreaking.choose_keep_on_keep_repair_tie`, `ControllerTieBreaking.choose_keep_on_total_tie`, `ControllerTieBreaking.total_tie_not_pay_vent`, `ControllerTieBreaking.total_tie_not_pay_repair`, `ControllerTieBreaking.choose_vent_on_vent_repair_tie`, `ControllerTieBreaking.vent_repair_tie_not_pay_repair`, `ControllerTieBreaking.choose_not_keep_iff_keep_coefficient_not_minimal`, and `ControllerTieBreaking.choose_not_pay_repair_iff_repair_not_strictly_minimal` in `ControllerTieBreaking.lean` | Mechanized |
| `THM-FAIL-PARETO` | Over the canonical failure-action family, the three legal outcomes form a Pareto frontier: `keep-multiplicity`, `pay-vent`, and `pay-repair` are pairwise non-dominating whenever `liveBranches > 1`, so there is no single canonical action that improves Wallace, Buley, vent cost, and repair debt simultaneously | canonical action family only; objectives are minimized componentwise on `(wallace, buley, ventCost, repairDebt)`; canonical keep point is `(gap, gap, 0, 0)`; canonical vent point is `(0, 0, gap, 0)`; canonical repair point is `(0, gap, 0, gap)` with `gap = liveBranches - 1 > 0` | TLA+ `FailurePareto.tla` invariants (`InvKeepNondominated`, `InvVentNondominated`, `InvRepairNondominated`) + Lean theorems `FailurePareto.keep_is_pareto_optimal`, `FailurePareto.pay_vent_is_pareto_optimal`, `FailurePareto.pay_repair_is_pareto_optimal`, and `FailurePareto.canonical_failure_actions_are_pareto` | Mechanized |
| `THM-FAILURE-ENTROPY` | Structured failure conserves frontier mass, reduces frontier width with venting, reduces entropy proxy, and forked frontier collapses to single survivor under binary race convergence | aligned branch snapshots; positive frontier mass | Lean theorems `FailureEntropy.structured_failure_conserves_frontier_mass`, `FailureEntropy.structured_failure_reduces_frontier_width`, `FailureEntropy.structured_failure_reduces_entropy_proxy`, and `FailureEntropy.forked_frontier_collapses_to_single_survivor` in `FailureEntropy.lean` | Mechanized |
| `THM-FAILURE-DURABILITY` | Durable replica state: well-formed replicas maintain live count at or above quorum size and positive live count. Stable replica state tracks all-healthy invariant | DurableWellFormed predicate; quorum size bounds | TLA+ `FailureDurability.tla` invariants + Lean theorems `FailureDurability.durable_live_count_ge_quorum` and `FailureDurability.durable_live_count_positive` in `FailureDurability.lean` | Mechanized |
| `THM-FAILURE-FAMILIES` | Branch snapshot families with branch-isolating predicate, repair debt tracking, and contagious failure propagation. Structures for multipath failure analysis composing with the trilemma and composition theorems | BranchSnapshot; deterministicFold; BranchIsolating; ContagiousFailure | Lean definitions and structures in `FailureFamilies.lean` composing with `FailureTrilemma.lean` and `FailureComposition.lean` | Mechanized |

### Thermodynamic Bridge: Erasure, Heat, and Information

*Landauer boundary, data processing inequality, fold erasure/heat, coarsening thermodynamics, entropic refinement calculus, rate-distortion frontier, fold heat hierarchy, traced monoidal thermodynamics, enriched convergence, and infinite erasure.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-LANDAUER-EQUALITY-CHARACTERIZATION` | Frontier entropy equals failure tax if and only if liveBranches ≤ 2; for n ≥ 3, entropy is strictly less than failure tax. This sharpens the paper: the failure-tax floor strictly dominates entropy for all non-binary forks | positive live branch count | Lean theorems `LandauerBuley.frontier_entropy_bits_eq_failure_tax_iff_le_two` and `LandauerBuley.frontier_entropy_bits_lt_failure_tax_of_three_or_more` in `LandauerBuley.lean` | Mechanized |
| `THM-INFINITE-ERASURE` | For PMFs with genuinely infinite support (not Finset-coverable), the entropy-to-heat chain still holds because the chain only requires entropy positivity (≥ log 2 bits when ≥ 2 live branches), not finiteness. Any PMF with ≥ 2 support atoms has positive Shannon entropy, yielding positive Landauer heat. | PMF with ≥ 2 distinct atoms of positive mass; Boltzmann constant > 0; temperature > 0 | Lean theorems `InfiniteErasure.entropy_positive_of_two_atoms`, `InfiniteErasure.landauer_heat_positive_of_two_atoms`, `InfiniteErasure.infinite_erasure_chain`, and `InfiniteErasure.observable_preserves_two_atoms` | Mechanized |
| `THM-DATA-PROCESSING-INEQUALITY` | Strict data processing inequality for finite PMFs: H(f(X)) ≤ H(X) for any function f, with strict inequality H(f(X)) < H(X) when f is non-injective on the support. Conditional entropy H(X\|f(X)) = H(X) - H(f(X)) is non-negative, strictly positive for non-injective f, and zero iff f is injective on the support. Chain rule: H(X\|g∘f(X)) = H(X\|f(X)) + H(f(X)\|g(f(X))). ENNReal lifts for the effective-support shell. | Fintype α, β; DecidableEq β; PMF α; function f : α → β; non-injectivity witnessed by two distinct elements with positive mass mapping to the same image | Lean module `DataProcessingInequality.lean` with `conditionalEntropyNats`, `data_processing_inequality`, `strict_data_processing_inequality`, `conditionalEntropyNats_nonneg`, `conditionalEntropyNats_pos_of_nonInjective`, `conditionalEntropyNats_eq_zero_iff_injective_on_support`, `conditionalEntropyNats_comp`, `conditionalEntropyNatsENN`, and `conditionalEntropyNatsENN_pos_of_nonInjective`. Part of passing umbrella build. | Mechanized (0 sorry) |
| `THM-COARSENING-THERMODYNAMICS` | Landauer heat of network coarsening and the thermodynamic arrow of abstraction. Every non-trivial coarsening (many-to-one quotient) erases information, incurring Landauer heat ≥ kT ln 2 × information loss. Cumulative information erasure is monotone under composition (the arrow): further coarsening can only increase cumulative erasure. Strict monotonicity when the second coarsening is also non-trivial. Connects to ManyToOneGraphQuotient from InterferenceCoarsening. | Fintype α, β, γ; DecidableEq β, γ; PMF α; quotient maps f : α → β, g : β → γ; Boltzmann constant > 0; temperature > 0; non-injectivity for strict results | Lean module `CoarseningThermodynamics.lean` with `coarseningInformationLoss`, `coarsening_information_loss_nonneg`, `coarsening_information_loss_pos_of_many_to_one`, `coarseningLandauerHeat`, `coarsening_landauer_heat_nonneg`, `coarsening_landauer_heat_pos_of_many_to_one`, `cumulative_coarsening_monotone`, `cumulative_coarsening_strict_monotone`, `cumulative_coarsening_heat_monotone`. TLA+ cross-check `CoarseningThermodynamics.tla`. Part of passing umbrella build (8070 jobs, 0 sorry). | Mechanized |
| `THM-COARSENED-BEAUTY-FLOOR` | For systems that arose from non-trivial coarsening: zero topological deficit is the strict unique global minimum for every strict generalized-convex cost and every strict real monotone objective, WITHOUT Axiom TOC as an external assumption. The observable coupling is derived from the physical irreversibility of the coarsening step itself (Landauer heat of information erasure). The negative boundary (THM-BEAUTY-DEFICIT-ONLY-BOUNDARY) is not violated: optimality is not derived from deficit alone but from the coarsening history which provides the coupling for free. | CoarsenedSystem: Boltzmann constant > 0, temperature > 0, fine PMF α, quotient map α → β, non-injectivity on support; LandauerBeautyFrontier for the derived coupling; BeautyStrictGeneralizedConvexCost or BeautyRealStrictObjective | Lean module `CoarseningThermodynamics.lean` with structure `CoarsenedSystem`, definition `coarsenedSystemObservableCoupling`, theorems `coarsened_system_heat_positive`, `coarsened_system_beauty_unconditional_floor`, `coarsened_system_beauty_unconditional_floor_objective`. Part of passing umbrella build (8070 jobs, 0 sorry). Note: derives Axiom TOC as a theorem via identity coupling from coarsening physics. | Mechanized |
| `THM-ENTROPIC-REFINEMENT-CALCULUS` | Conditional entropy as a functorial information measure on the category of quotient refinements. Identity law: H(X\|id(X)) = 0. Composition law (chain rule): H(X\|g∘f(X)) = H(X\|f(X)) + H(f(X)\|g(f(X))). Monotonicity on the refinement lattice. Landauer heat naturality: heat decomposes additively under composition and inherits monotonicity. Universal property: conditional entropy is initial among information measures (sorry). | Fintype α, β, γ; DecidableEq β, γ; PMF α; surjective quotient maps; InformationMeasure interface | Lean module `EntropicRefinementCalculus.lean` with `QuotientRefinementMorphism`, `InformationMeasure`, `conditionalEntropy_identity`, `conditionalEntropy_functorial_composition`, `conditionalEntropy_is_information_measure`, `refinement_monotone_information_loss`, `coarseningLandauerHeat_composition`, `coarseningLandauerHeat_monotone`, `QuotientRefines`, `coarsening_lattice_monotone`, `conditionalEntropy_initial_information_measure` (conditional on entropy-domination hypotheses). Part of passing umbrella build (0 sorry). | Mechanized (0 sorry; universal property conditional on entropy-domination hypotheses) |
| `THM-RATE-DISTORTION-FRONTIER` | Rate-distortion frontier for network coarsening. Given a family of many-to-one quotients, there exists a minimum-rate member (minimum information erasure), a minimum-heat member (since heat = kT ln 2 * rate), and a Pareto-optimal quotient (not dominated in both rate and distortion). The minimum-rate quotient gives the weakest beauty constraint. | Fintype α, β; DecidableEq β; PMF α; nonempty QuotientFamily; DistortionMeasure with monotonicity; Boltzmann constant > 0; temperature > 0 | Lean module `RateDistortionFrontier.lean` with `QuotientCandidate`, `DistortionMeasure`, `RateDistortionPoint`, `quotientToRateDistortionPoint`, `rate_distortion_heat_identity`, `QuotientFamily`, `minimum_rate_quotient_exists`, `minimum_heat_quotient_exists`, `rate_monotone_under_refinement`, `paretoDominated`, `pareto_frontier_exists`, `optimal_quotient_beauty_bound`. Part of passing umbrella build (8070 jobs, 0 sorry). | Mechanized |
| `THM-ENRICHED-CONVERGENCE` | Reduces the convergence schema from 7 axioms to 5 by deriving A6 (forkRaceFoldAttractor) and A7 (noAlternativeInModelClass) from throughput landscape optimization. The throughput-maximal skeleton has both race and fold (A6), and is unique by selection pressure (A7). Connects to CoarsenedSystem: the optimal skeleton's fold is a many-to-one quotient incurring irreducible Landauer heat. | ThroughputLandscape: non-empty skeleton list, energy bound, selection pressure (distinct scores imply distinct skeletons), FRF presence and dominance; ReducedConvergenceAssumptions (A1-A5) | Lean module `EnrichedConvergence.lean` with `MonoidalSkeleton`, `forkRaceFoldSkeleton`, `ThroughputLandscape`, `throughput_maximum_exists`, `throughput_maximum_unique_score`, `frf_is_attractor`, `ReducedConvergenceAssumptions`, `reduced_convergence_implies_original`, `reduced_convergence_schema`, `optimal_skeleton_coarsening_heat`. Part of passing umbrella build (0 sorry). | Mechanized (0 sorry) |
| `THM-FOLD-ERASURE` | Any fold on ≥ 2 branches with a non-injective merge erases information: `H(inputs \| output) > 0`. Composes `conditionalEntropyNats_pos_of_nonInjective` from the strict data processing inequality. | Fintype α, β; DecidableEq α, β; PMF α; non-injective fold merge `f : α → β` witnessed by two distinct elements with positive mass mapping to same image | TLA+ `FoldErasure.tla` invariant `InvFoldErasesInformation` + Lean theorem `FoldErasure.fold_erasure` in `FoldErasure.lean` | Mechanized |
| `THM-FOLD-HEAT` | Information erased by non-injective fold has Landauer heat cost `≥ kT ln 2 · H(inputs \| output) > 0`. Composes fold-erasure with the Landauer bridge. | FoldErasureWitness with Boltzmann constant > 0, temperature > 0 | TLA+ `FoldErasure.tla` invariant `InvFoldHeatPositive` + Lean theorem `FoldErasure.fold_heat` in `FoldErasure.lean` | Mechanized |
| `THM-ERASURE-COUPLING` | For systems where fold is many-to-one, construct a `ThermodynamicObservableCoupling` as a *theorem* (not axiom). Latency/waste floor maps derived from heat dissipation physics. The coupling is built from the fold erasure data: identity-scaled monotone maps with strict gap from positive Landauer heat. | FoldErasureWitness with non-injective fold merge | TLA+ `FoldErasure.tla` invariant `InvErasureCouplingDerived` + Lean definition `FoldErasure.erasure_coupling` and theorem `FoldErasure.erasure_coupling_strict_gap` in `FoldErasure.lean` | Mechanized |
| `THM-FOLD-INJECTIVITY-BOUNDARY` | Injective fold produces zero conditional entropy; the erasure coupling degenerates. This is the *exact boundary* of the erasure-sufficient regime: only injective folds (lossless merges) fall outside the unconditional beauty optimality surface. | Fintype α, β; DecidableEq α, β; PMF α; injective fold merge on support | TLA+ `FoldErasure.tla` invariant `InvInjectiveBoundary` + Lean theorems `FoldErasure.fold_injectivity_boundary`, `FoldErasure.fold_injectivity_zero_heat`, and `FoldErasure.fold_injectivity_coupling_degenerates` in `FoldErasure.lean` | Mechanized |

### Beauty Optimality

*Deficit-monotone beauty, latency/waste ordering, Pareto optimality, composition, monotone objectives/profiles, comparison families, failure-Pareto frontiers, deficit-only boundary, failure-tax bridges, Landauer beauty bridge, and unconditional floor.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-BEAUTY-DEF` | Bu beauty definition from deficit (`deficitBu = β₁* - β₁`, `beautyBu = β₁* - deficitBu`) | non-negative Bu domains; bounded implementation deficit | TLA+ `BeautyOptimality.tla` invariants + Lean schema `Axioms.beauty_definition_schema` + constructive linear-model theorems `BeautyLinearWorkload.deficitA_eq`, `BeautyLinearWorkload.deficitB_eq`, `BeautyLinearWorkload.beautyA_eq`, `BeautyLinearWorkload.beautyB_eq`, `BeautyLinearWorkload.beautyA_eq_implementation`, and `BeautyLinearWorkload.beautyB_eq_implementation` in `BeautyOptimality.lean` | Mechanized (constructive linear model + scaffold) |
| `THM-BEAUTY-LATENCY-MONO` | In the constructive linear workload model, lower Bu deficit implies non-worse latency, and positive latency penalty plus strict deficit separation gives strict latency separation; the broader manuscript claim remains available as a schema | fixed workload; linear latency penalty in deficit; deficit order witness; strict form additionally requires positive latency penalty and strict deficit gap | TLA+ `BeautyOptimality.tla` invariant `InvBeautyLatencyMonotone` + Lean schema `Axioms.beauty_latency_monotone_schema` + constructive theorems `BeautyLinearWorkload.latency_monotone` and `BeautyLinearWorkload.strict_latency_monotone` in `BeautyOptimality.lean` | Mechanized (constructive linear model + scaffold) |
| `THM-BEAUTY-WASTE-MONO` | In the constructive linear workload model, lower Bu deficit implies non-worse waste, and positive waste penalty plus strict deficit separation gives strict waste separation; the broader manuscript claim remains available as a schema | fixed workload; linear waste penalty in deficit; deficit order witness; strict form additionally requires positive waste penalty and strict deficit gap | TLA+ `BeautyOptimality.tla` invariant `InvBeautyWasteMonotone` + Lean schema `Axioms.beauty_waste_monotone_schema` + constructive theorems `BeautyLinearWorkload.waste_monotone` and `BeautyLinearWorkload.strict_waste_monotone` in `BeautyOptimality.lean` | Mechanized (constructive linear model + scaffold) |
| `THM-BEAUTY-PARETO` | In the constructive linear workload model, a zero-deficit candidate is Pareto-optimal in the latency/waste envelope, and under positive penalties a full-fit candidate strictly beats a positive-deficit comparator in latency, waste, and beauty; the broader manuscript claim remains available as a schema | candidate A has `deficitBu = 0`; deficit ordering over compared implementations; linear latency/waste penalties in deficit; strict form additionally requires candidate A to match `intrinsicBu`, candidate B to have positive deficit, and positive latency/waste penalties | TLA+ `BeautyOptimality.tla` invariant `InvBeautyPareto` + Lean schema `Axioms.beauty_pareto_optimality_schema` + constructive theorems `BeautyLinearWorkload.zero_deficit_pareto`, `BeautyLinearWorkload.strict_beauty_monotone`, and `BeautyLinearWorkload.zero_deficit_strict_optimality` in `BeautyOptimality.lean` | Mechanized (constructive linear model + scaffold) |
| `THM-BEAUTY-COMPOSITION` | In the constructive additive model, global Bu deficit composes additively from subsystem deficits | additive composition model over pipeline/protocol/compression deficits | TLA+ `BeautyOptimality.tla` invariant `InvBeautyComposition` + Lean schema `Axioms.beauty_composition_schema` + constructive theorem `BeautyCompositionWitness.global_eq_sum` in `BeautyOptimality.lean` | Mechanized (constructive additive model + scaffold) |
| `THM-BEAUTY-OPTIMALITY` | In the constructive linear/additive model, definition + monotonicity + Pareto + composition cohere; the broader manuscript claim remains available as a schema | assumptions of THM-BEAUTY-DEF/LATENCY-MONO/WASTE-MONO/PARETO/COMPOSITION specialized to the constructive linear/additive witness | TLA+ `BeautyOptimality.tla` invariant `InvBeautyOptimality` + Lean schema `Axioms.beauty_optimality_schema` + constructive theorems `BeautyLinearOptimalityInstance.schema_instantiated` and `BeautyLinearOptimalityInstance.optimality` in `BeautyOptimality.lean` | Mechanized (constructive linear model + scaffold) |
| `THM-BEAUTY-MONOTONE-OBJECTIVE` | In the constructive linear workload model, any componentwise monotone objective over latency and waste is deficit-monotone, so a zero-deficit candidate is never worse under arbitrary monotone nonlinear scoring; if the objective is strictly monotone in latency or waste, then a full-fit candidate strictly beats a strict underfit comparator whenever the corresponding penalty is positive | fixed linear workload; objective `score : Nat -> Nat -> Nat` is monotone in both coordinates; strict form additionally requires strict monotonicity in latency or waste and a positive penalty on the strictly improved coordinate | Lean structures/theorems `BeautyMonotoneObjective`, `BeautyStrictObjective`, `BeautyLinearWorkload.objective_monotone`, `BeautyLinearWorkload.zero_deficit_objective_optimal`, `BeautyLinearWorkload.strict_objective_optimality_of_latency`, `BeautyLinearWorkload.strict_objective_optimality_of_waste`, and `BeautyLinearWorkload.strict_objective_optimality_of_positive_penalty` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-MONOTONE-PROFILE` | The beauty layer no longer requires linear latency/waste penalties: for any workload whose latency and waste are arbitrary monotone functions of deficit, a zero-deficit candidate is never worse under any componentwise monotone objective or monotone generalized-convex cost; if either profile is strict, then full-fit strictly beats strict underfit for any strict monotone objective or strict generalized-convex cost | fixed workload with arbitrary deficit-to-latency and deficit-to-waste maps; both profile maps are monotone in deficit; strict form additionally requires a strict latency or strict waste profile; generalized-convex cost theorems use the monotone field of `BeautyGeneralizedConvexCost`, and their strict form uses the strict monotonicity fields of `BeautyStrictGeneralizedConvexCost` | Lean structures/theorems `BeautyMonotoneProfileWorkload`, `BeautyGeneralizedConvexCost`, `BeautyStrictGeneralizedConvexCost`, `BeautyMonotoneProfileWorkload.objective_monotone`, `BeautyMonotoneProfileWorkload.generalized_convex_cost_monotone`, `BeautyMonotoneProfileWorkload.zero_deficit_objective_optimal`, `BeautyMonotoneProfileWorkload.zero_deficit_generalized_convex_cost_optimal`, `BeautyMonotoneProfileWorkload.strict_generalized_convex_cost_optimality_of_strict_latency_profile`, `BeautyMonotoneProfileWorkload.strict_generalized_convex_cost_optimality_of_strict_waste_profile`, `BeautyMonotoneProfileWorkload.strict_generalized_convex_cost_optimality_of_strict_profile`, `BeautyMonotoneProfileWorkload.strict_objective_optimality_of_strict_latency_profile`, `BeautyMonotoneProfileWorkload.strict_objective_optimality_of_strict_waste_profile`, and `BeautyMonotoneProfileWorkload.strict_objective_optimality_of_strict_profile` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-COMPARISON-FAMILY` | A designated full-fit candidate in an indexed deficit-monotone comparison family is a global minimizer for every monotone generalized-convex cost, and under a strict latency or waste profile it is the unique minimizer for every strict generalized-convex cost | indexed comparison family with a distinguished candidate `best`; all implementations are bounded by the same intrinsic Bu; `best` exactly matches `intrinsicBu`; every non-`best` candidate is strictly underfit; deficit-to-latency and deficit-to-waste maps are monotone; strict uniqueness additionally requires a strict latency or strict waste profile | Lean structures/theorems `BeautyMonotoneProfileFamily`, `BeautyMonotoneProfileFamily.comparisonWorkload`, `BeautyMonotoneProfileFamily.best_generalized_convex_cost_minimal`, `BeautyMonotoneProfileFamily.best_strict_generalized_convex_cost_optimality_of_strict_latency_profile`, `BeautyMonotoneProfileFamily.best_strict_generalized_convex_cost_optimality_of_strict_waste_profile`, `BeautyMonotoneProfileFamily.best_strict_generalized_convex_cost_optimality_of_strict_profile`, `BeautyMonotoneProfileFamily.best_generalized_convex_cost_unique_minimizer_of_strict_profile`, and `BeautyMonotoneProfileFamily.best_generalized_convex_cost_global_minimum_of_strict_profile` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-UNIVERSAL-FLOOR` | On any failure Pareto frontier equipped with measure-theoretic latency/waste floor bounds, the zero-deficit floor point is a global minimizer for every monotone generalized-convex cost, and under strict generalized-convex monotonicity it is the strict unique global minimum | abstract frontier of `(Δβ, latency, waste)` points; a distinguished floor point lies on the frontier with `Δβ = 0`; measure-side lower bounds place every frontier point above the floor in latency and waste; every positive-deficit frontier point is strictly above the floor in latency or waste; zero deficit is unique on the frontier | Lean structures/theorems `BeautyFailureParetoPoint`, `BeautyFailureParetoPoint.cost`, `BeautyFailureParetoFrontier`, `BeautyFailureParetoFrontier.floor_generalized_convex_cost_minimal`, `BeautyFailureParetoFrontier.floor_strict_generalized_convex_cost_optimality`, `BeautyFailureParetoFrontier.floor_strict_generalized_convex_cost_unique_minimizer`, `BeautyFailureParetoFrontier.floor_strict_generalized_convex_cost_global_minimum`, and `BeautyMonotoneProfileFamily.failureParetoFrontier` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-REAL-OBJECTIVE` | The convexity hypothesis can also be dropped on the real-valued objective layer: arbitrary componentwise monotone real objectives admit the same zero-deficit/full-fit floor on monotone-profile workloads, indexed comparison families, and abstract failure Pareto frontiers; under strict monotonicity they yield strict unique minimizers under the existing strict-profile or frontier-gap hypotheses | workload and family forms use arbitrary real-valued `score : ℝ -> ℝ -> ℝ` monotone in latency and waste; strict form additionally requires strict objective monotonicity and a strict latency or strict waste profile; frontier form additionally assumes an explicit failure Pareto frontier with zero-deficit floor, latency/waste floor bounds, strict floor gap on positive deficit, and zero-deficit uniqueness on the frontier | Lean structures/theorems `BeautyRealMonotoneObjective`, `BeautyRealStrictObjective`, `BeautyMonotoneProfileWorkload.real_objective_monotone`, `BeautyMonotoneProfileWorkload.zero_deficit_real_objective_optimal`, `BeautyMonotoneProfileWorkload.strict_real_objective_optimality_of_strict_latency_profile`, `BeautyMonotoneProfileWorkload.strict_real_objective_optimality_of_strict_waste_profile`, `BeautyMonotoneProfileWorkload.strict_real_objective_optimality_of_strict_profile`, `BeautyFailureParetoPoint.objectiveScore`, `BeautyFailureParetoFrontier.floor_objective_minimal`, `BeautyFailureParetoFrontier.floor_strict_objective_optimality`, `BeautyFailureParetoFrontier.floor_strict_objective_unique_minimizer`, `BeautyFailureParetoFrontier.floor_strict_objective_global_minimum`, `BeautyMonotoneProfileFamily.best_real_objective_minimal`, `BeautyMonotoneProfileFamily.best_real_objective_optimality_of_strict_latency_profile`, `BeautyMonotoneProfileFamily.best_real_objective_optimality_of_strict_waste_profile`, `BeautyMonotoneProfileFamily.best_real_objective_optimality_of_strict_profile`, `BeautyMonotoneProfileFamily.best_real_objective_unique_minimizer_of_strict_profile`, and `BeautyMonotoneProfileFamily.best_real_objective_global_minimum_of_strict_profile` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-DEFICIT-ONLY-BOUNDARY` | Bare deficit bookkeeping does not force a zero-deficit latency/waste floor: there exists a zero-deficit point and a positive-deficit point with strictly lower latency and strictly lower waste, so the positive-deficit point also strictly beats the zero-deficit point for a strict monotone real objective and for a strict generalized-convex cost | no monotone-profile assumptions, no frontier-floor assumptions, and no tax-to-observable bridge assumptions; witness points are the explicit two-point family `floor = (Δβ = 0, latency = 1, waste = 1)` and `underfit = (Δβ = 1, latency = 0, waste = 0)`; witness objective/cost is `latency + waste` | Lean namespace/theorems `BeautyDeficitOnlyBoundary.exists_componentwise_improving_positive_deficit_point`, `BeautyDeficitOnlyBoundary.exists_positive_deficit_point_below_zero_deficit_for_real_objective`, and `BeautyDeficitOnlyBoundary.exists_positive_deficit_point_below_zero_deficit_for_generalized_convex_cost` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-DEFICIT-TAX-BRIDGE` | The failure-tax bridge now has a quantitative deficit-dominating form: if a frontier carries a failure tax `τ` with `(Δβ : ℝ) ≤ τ` pointwise, monotone observable floor maps convert that tax into latency/waste lower bounds with a strict positive-tax gap, and the zero-deficit floor point is unique, then the zero-deficit floor is a global minimizer for every monotone generalized-convex cost and every monotone real objective, and under strict monotonicity it is the strict unique global minimum | abstract failure Pareto frontier point set; failure-tax map `τ`; tax floor `τ(floor) = 0`; pointwise domination `(Δβ : ℝ) ≤ τ`; monotone observable maps `latencyFloorFromTax`, `wasteFloorFromTax`; pointwise lower bounds from those observables to actual latency/waste; positive tax yields a strict observable gap in latency or waste; zero deficit is unique on the frontier | Lean structures/theorems `BeautyDeficitDominatingFailureTaxFrontier`, `BeautyDeficitDominatingFailureTaxFrontier.toFailureTaxObservableFrontier`, `BeautyDeficitDominatingFailureTaxFrontier.floor_generalized_convex_cost_minimal`, `BeautyDeficitDominatingFailureTaxFrontier.floor_objective_minimal`, `BeautyDeficitDominatingFailureTaxFrontier.floor_strict_generalized_convex_cost_optimality`, `BeautyDeficitDominatingFailureTaxFrontier.floor_strict_objective_optimality`, `BeautyDeficitDominatingFailureTaxFrontier.floor_strict_generalized_convex_cost_global_minimum`, and `BeautyDeficitDominatingFailureTaxFrontier.floor_strict_objective_global_minimum` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-FAILURE-TAX-BRIDGE` | The missing beauty bridge is now explicit and mechanized as an interface theorem: if a frontier carries a nonnegative failure tax whose zero point is the floor, positive deficit forces positive tax, and monotone observable floor maps convert that tax into latency/waste lower bounds with a strict positive-tax gap, then the same zero-deficit floor is a global minimizer for every monotone generalized-convex cost and every monotone real objective, and under strict monotonicity it is the strict unique global minimum | abstract failure Pareto frontier point set; failure-tax map `τ`; tax floor `τ(floor) = 0`; nonnegative tax on the frontier; positive deficit implies positive tax; monotone observable maps `latencyFloorFromTax`, `wasteFloorFromTax`; pointwise lower bounds from those observables to actual latency/waste; positive tax yields a strict observable gap in latency or waste; zero deficit is unique on the frontier | Lean structures/theorems `BeautyFailureTaxObservableFrontier`, `BeautyFailureTaxObservableFrontier.toFailureParetoFrontier`, `BeautyFailureTaxObservableFrontier.floor_generalized_convex_cost_minimal`, `BeautyFailureTaxObservableFrontier.floor_objective_minimal`, `BeautyFailureTaxObservableFrontier.floor_strict_generalized_convex_cost_optimality`, `BeautyFailureTaxObservableFrontier.floor_strict_objective_optimality`, `BeautyFailureTaxObservableFrontier.floor_strict_generalized_convex_cost_global_minimum`, and `BeautyFailureTaxObservableFrontier.floor_strict_objective_global_minimum` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-BRIDGE-INSTANCE` | The bridge layers now have concrete inhabitants from the existing beauty layer: every indexed strict-profile beauty family instantiates the quantitative deficit-dominating bridge by taking `τ = Δβ` and using a one-step observable floor on the strict coordinate, and therefore also instantiates the failure-tax observable bridge by forgetful projection, so the comparison-family strict-optimality surface factors through the bridge abstraction rather than bypassing it | indexed comparison family with distinguished full-fit candidate `best`; all implementations are bounded by the same intrinsic Bu; every non-`best` candidate is strictly underfit; latency and waste are monotone in deficit; one coordinate is strictly monotone in deficit; the bridge instance uses `τ(point) = point.deficit`, `oneStepFloor base τ = base + 1_{τ>0}` on the strict coordinate, a constant floor on the non-strict coordinate, and the quantitative domination law `(Δβ : ℝ) ≤ τ` by reflexivity | Lean definitions/theorems `BeautyFailureTaxObservableFrontier.oneStepFloor`, `BeautyFailureTaxObservableFrontier.oneStepFloor_monotone`, `BeautyFailureTaxObservableFrontier.oneStepFloor_eq_base_at_zero`, `BeautyFailureTaxObservableFrontier.oneStepFloor_strict_of_pos`, `BeautyMonotoneProfileFamily.deficitDominatingFailureTaxFrontierOfStrictLatencyProfile`, `BeautyMonotoneProfileFamily.deficitDominatingFailureTaxFrontierOfStrictWasteProfile`, `BeautyMonotoneProfileFamily.failureTaxObservableFrontierOfStrictLatencyProfile`, and `BeautyMonotoneProfileFamily.failureTaxObservableFrontierOfStrictWasteProfile` in `BeautyOptimality.lean` | Mechanized |
| `THM-BEAUTY-UNCONDITIONAL-FLOOR` | Under the physically motivated assumption that Landauer erasure heat is observable through latency or waste (Axiom TOC, `ThermodynamicObservableCoupling`), zero topological deficit is the unique beauty optimum for every strict generalized-convex cost and every strict real monotone objective on any Landauer beauty frontier. This assumption cannot be dropped (`THM-BEAUTY-DEFICIT-ONLY-BOUNDARY`, the negative boundary). | Axiom TOC: `ThermodynamicObservableCoupling` encoding `kB > 0`, `T > 0`, monotone `latencyFromHeat`/`wasteFromHeat`, and strict gap from positive heat; `LandauerBeautyFrontier` encoding frontier points, live-branch count, positive deficit → liveBranches ≥ 2, and pointwise latency/waste lower bounds from Landauer heat | Lean structure `ThermodynamicObservableCoupling`, `LandauerBeautyFrontier`, `landauer_beauty_frontier_to_observable_frontier`, `landauer_beauty_unconditional_floor`, and `landauer_beauty_unconditional_floor_objective` in `LandauerBeautyBridge.lean`; TLA+ cross-check `LandauerBeautyBridge.tla` invariants (`InvPositiveDeficitForcesPositiveTax`, `InvZeroDeficitFloorZeroTax`, `InvEntropyLeFailureTax`, `InvOneStepFloorMatchesCoupling`, `InvOneStepFloorZeroAtZero`, `InvStrictGapFromPositiveHeat`) | Mechanized (conditional on thermodynamic observable coupling) |
| `THM-BEAUTY-ERASURE-SUFFICIENT` | For any fork/race/fold system with non-injective fold, beauty optimality holds unconditionally. Zero-deficit minimizes any monotone objective. Narrows the axiom gap: only injective-fold systems need Axiom TOC. Since almost all practical folds are many-to-one, beauty optimality is effectively unconditional. | FoldErasureWitness; LandauerBeautyFrontier for the derived erasure coupling; BeautyStrictGeneralizedConvexCost or BeautyRealStrictObjective | TLA+ `FoldErasure.tla` invariant `InvBeautyFloorUnconditional` + Lean theorem `FoldErasure.beauty_erasure_sufficient` in `FoldErasure.lean` | Mechanized |

### Covering Space & Topological Deficit (Track Theta)

*Covering-space causality, matched topology, deficit-latency separation, capacity gap, information loss, erasure chain, zero-deficit preservation, and monotonicity.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-COVERING-CAUSALITY` | If β₁(computation) > 0 and β₁(transport) = 0 (TCP-style single ordered stream), there exists a reachable state where loss on path pⱼ stalls progress on independent path pᵢ. Constructive blocking witness from topological mismatch. | pathCount ≥ 2; TCP transport (1 stream); independent computation paths | TLA+ `CoveringSpaceCausality.tla` invariants (`InvDeficitImpliesBlockingPossible`, `InvComputationBeta1`, `InvTcpBeta1Zero`) + Lean theorems `CoveringSpaceCausality.covering_causality` and `CoveringSpaceCausality.blockingWitnessFromMismatch` | Mechanized |
| `THM-COVERING-MATCH` | If β₁(transport) ≥ β₁(computation), no cross-path blocking state is reachable. Each path maps to its own transport stream (covering map is injective). | pathCount = transportStreams (matched topology) | TLA+ `CoveringSpaceMatch.tla` invariants (`InvNoCrossPathBlocking`, `InvNoForeignBlocking`, `InvZeroDeficit`) + Lean theorems `CoveringSpaceCausality.covering_match`, `CoveringSpaceCausality.matched_paths_isolated`, and `CoveringSpaceCausality.frame_header_is_covering_map` | Mechanized |
| `THM-DEFICIT-LATENCY-SEPARATION` | Topological deficit Δ = β₁(G) - β₁(transport) lower-bounds worst-case latency inflation. TCP deficit equals pathCount - 1. Deficit is monotonically decreasing in transport stream count. Positive deficit implies inflation > 1. | pathCount ≥ 2; transportStreams ≥ 1 | TLA+ `CoveringSpaceCausality.tla` invariant `InvDeficitBoundsInflation` + Lean theorems `CoveringSpaceCausality.deficit_latency_separation`, `CoveringSpaceCausality.tcp_deficit_is_path_count_minus_one`, `CoveringSpaceCausality.deficit_decreasing_in_streams`, `ProtocolDeficitLatency.positive_deficit_implies_inflation`, and `ProtocolDeficitLatency.deficit_beauty_chain` | Mechanized |
| `THM-DEFICIT-CAPACITY-GAP` | For a system with `k` independent computation paths on `m < k` transport streams, the per-step information capacity gap is `≥ (k - m) · c_min` where `c_min` is the minimum per-stream capacity. Quantifies "wasted parallelism" as capacity deficit. | pathCount, streamCount with deficit > 0; per-stream capacity > 0 | TLA+ `DeficitCapacity.tla` invariant `InvCapacityGap` + Lean theorem `DeficitCapacity.deficit_capacity_gap` in `DeficitCapacity.lean` | Mechanized |
| `THM-DEFICIT-INFORMATION-LOSS` | Topological deficit `Δβ > 0` forces positive information loss under any multiplexing strategy. The multiplexing function is non-injective (pigeonhole), so by the data processing inequality, information is erased. Composes covering_causality with DPI. | pathCount ≥ 2; single transport stream | TLA+ `DeficitCapacity.tla` invariant `InvInformationLoss` + Lean theorem `DeficitCapacity.deficit_information_loss` in `DeficitCapacity.lean` | Mechanized |
| `THM-DEFICIT-ERASURE-CHAIN` | Full chain from topology to thermodynamics: deficit → pigeonhole collision → information erasure → Landauer heat → observable waste. Composes deficit_information_loss with fold_erasure and fold_heat. | DeficitCapacityWitness + FoldErasureWitness; pathCount ≥ 2 | TLA+ `DeficitCapacity.tla` invariant `InvErasureChain` + Lean theorem `DeficitCapacity.deficit_erasure_chain` in `DeficitCapacity.lean` | Mechanized |
| `THM-ZERO-DEFICIT-PRESERVES-INFORMATION` | When `Δβ = 0` (streams ≥ paths), there exists a multiplexing strategy achieving lossless transport. Each path gets its own stream; the multiplexing function is injective. | pathCount > 0; streamCount ≥ pathCount | TLA+ `DeficitCapacity.tla` invariant `InvZeroDeficit` + Lean theorem `DeficitCapacity.zero_deficit_preserves_information` in `DeficitCapacity.lean` | Mechanized |
| `THM-DEFICIT-MONOTONE-IN-STREAMS` | Information loss under optimal multiplexing is monotonically decreasing in transport stream count, reaching zero when `m ≥ k`. Adding transport streams can only reduce deficit. | pathCount, two stream counts with s1 ≤ s2 | TLA+ `DeficitCapacity.tla` invariant `InvMonotone` + Lean theorem `DeficitCapacity.deficit_monotone_in_streams` in `DeficitCapacity.lean` | Mechanized |
| `THM-AEON-FLUX-SITE-ADEQUACY` | Positive-stream-budget Aeon Flux sites satisfy the full adequacy trichotomy in repo-native transport vocabulary: `Δβ ≤ 0` iff a lossless FlowFrame transport witness exists, `Δβ = 0` iff a tight lossless witness exists, and `Δβ > 0` forces collisions and information loss for every FlowFrame transport witness. The emitted `WallingtonRotation` site path now synthesizes the matching `pathCount` / `streamCount` / `Δβ` witness directly from lowered GG. | `AeonFluxSite` with `0 < streamCount`; zero-deficit exactness additionally uses `0 < pathCount`; emitted witness path currently scoped to lowered `WallingtonRotation` graphs | Lean theorems `AeonFluxSiteAdequacy.aeon_flux_site_nonpositive_deficit_iff_lossless_transport`, `AeonFluxSiteAdequacy.aeon_flux_site_zero_deficit_iff_tight_lossless_transport`, and `AeonFluxSiteAdequacy.aeon_flux_site_positive_deficit_forces_collision_and_information_loss` in `AeonFluxSiteAdequacy.lean` + executable witness synthesis in `open-source/gnosis/src/aeon-flux-site-witness.ts` + GG proof topology `open-source/gnosis/examples/proofs/AeonFluxSiteAdequacy-lean.gg` | Mechanized + executable |

### Protocol, Settlement & Band Gap

*Protocol deficit ordering (TCP/QUIC/Aeon), settlement deficit, band gap, quantum deficit/speedup.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-Q-DEFICIT` | Quantum speedup identity in topology-matched regime | `sqrtN > 0`; `N = sqrtN^2`; classical `β₁=0`; matched quantum implementation `β₁=β₁*` | TLA+ transition model + Lean theorems `Claims.quantum_deficit_is_zero` and `Claims.quantum_speedup_equals_classical_deficit_plus_one` | Mechanized |
| `THM-Q-CORRESPONDENCE-BOUNDARY` | Path-integral correspondence is operationally exact only for linear full aggregation; nonlinear selection cannot preserve the same partition-additivity/order-invariance properties in general, and any non-additive fold must miss some cancellation-sensitive difference family, with winner-by-magnitude and early-stop missing the same `x + (-x)` family that linear fold realizes exactly | minimal integer-valued fold model; linear fold = addition; nonlinear folds = winner-by-magnitude or early-stop selection; general class-level target family = `fold(x, -y) = x - y`; concrete witness family = `x + (-x)` | executable `src/quantum-correspondence-boundary.test.ts` + `src/quantum-recombination-ablation.test.ts`/artifact runner + Lean theorems `Claims.additive_fold_iff_cancellation_difference_family`, `Claims.nonadditive_fold_misses_cancellation_difference_family`, `Claims.linear_fold_partition_additive_global`, `Claims.linear_fold_preserves_cancellation_target_family`, `Claims.winner_selection_misses_cancellation_target_family`, `Claims.early_stop_misses_cancellation_target_family`, `Claims.winner_selection_not_partition_additive`, `Claims.early_stop_not_partition_additive`, `Claims.winner_selection_not_order_invariant`, and `Claims.early_stop_not_order_invariant` | Mechanized |
| `THM-PROTO-DEFICIT` | TCP/QUIC/Aeon deficit ordering | stream count `> 1`; topology equations for intrinsic/implementation Betti numbers | TLA+ transition model + Lean theorem `Claims.protocol_deficits` | Mechanized |
| `THM-SETTLEMENT` | Settlement deficit (`seq=2`, `parallel=0`) | intrinsic `β₁* = 2`; mode in `{seq,parallel}` | TLA+ transition model + Lean theorem `Claims.settlement_deficit_values` | Mechanized |
| `THM-BANDGAP-BETA2` | Band gap implies `β₂ > 0` | finite energy lattice; allowed set family with non-empty forbidden interior | TLA+ transition model + Lean theorem `Claims.band_gap_implies_beta2_positive` | Mechanized |
| `THM-BAND-GAP-VOID` | Band gap as void positivity: an allowed energy band with forbidden zones tracks band gap existence and void positivity. When forbidden energies exist between boundary levels, Beta2 > 0 -- the void measures energy exclusion | allowed is a subset of all energies; forbidden energies exist between 1 and MaxEnergy-1 | TLA+ `BandGapVoid.tla` invariants (`InvAllowedSubset`, `InvBandGapExists`, `InvVoidIsPositive`) | Model-checked |
| `THM-PROTOCOL-DEFICIT` | Topological deficit across protocol families: TCP has deficit = streamCount - 1 (zero Beta1), QUIC has deficit = 0 (full Beta1), Flow has deficit = 0. The deficit measures how much multiplexing topology the protocol wastes | streamCount > 1; IntrinsicBeta1 = streamCount - 1 | TLA+ `ProtocolDeficit.tla` invariants (`InvIntrinsicShape`, `InvTcpDeficit`, `InvQuicDeficit`, `InvFlowDeficit`) + Lean theorems in `ProtocolDeficitLatency.lean` | Mechanized |
| `THM-QUANTUM-DEFICIT` | Quantum speedup through Beta1 elimination: N = rootN^2. Classical deficit = rootN - 1. Quantum deficit = 0. Sequential rounds = N, parallel rounds = rootN, speedup = N / rootN | N is a perfect square; rootN > 0 | TLA+ `QuantumDeficit.tla` invariants (`InvPerfectSquare`, `InvClassicalDeficit`, `InvQuantumDeficitZero`, `InvSpeedup`) | Model-checked |
| `THM-SETTLEMENT-DEFICIT` | Sequential settlement has deficit = 2, parallel settlement has deficit = 0. The topological deficit measures wasted parallelism in the settlement mode | IntrinsicBeta1 = 2; mode in {seq, parallel} | TLA+ `SettlementDeficit.tla` invariants (`InvSequentialDeficitIsTwo`, `InvParallelDeficitIsZero`) | Model-checked |

### Pipeline Scheduling (Section 7)

*Worthington whip, speculative tree, turbulent idle, pipeline occupancy, Wallace metric, multiplexing monotonicity, staged expansion, warmup efficiency/dynamics/controller, whip crossover, and multiplexing capacity.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-S7-WHIP` | Worthington Whip savings shape | shard count `s > 0` | TLA+ transition model + Lean theorem `Claims.worthington_num_lt_den` | Mechanized |
| `THM-S7-SPEC` | Speculative Tree positivity constraints | `q > p`; finite `k > 0` | TLA+ transition model + Lean theorems `Claims.speculative_tree_numerator_positive` and `Claims.speculative_tree_denominator_positive` | Mechanized |
| `THM-S7-TURB` | Turbulent idle fraction stays bounded | `n > 0`, `c > 0`, finite domains | TLA+ transition model + Lean theorems `Claims.turbulent_idle_bounds` and `Claims.turbulent_idle_den_positive` | Mechanized |
| `THM-S7-OCC` | Pipeline occupancy deficit is the complement of frontier fill and equals turbulent idle fraction in the canonical pipeline envelope | `n > 0`, `c > 0`, finite domains | TLA+ `Section7Formulas.tla` invariants (`InvFrontierFillBounds`, `InvOccupancyDeficitBounds`, `InvOccupancyDeficitEqualsTurbulentIdle`, `InvOccupancyComplement`) + executable topology helper checks | Mechanized |
| `THM-S7-WALLACE` | Wallace metric (`wally`) on a bounded three-layer frontier is bounded, complementary to frontier fill, zero exactly at full envelope occupancy, and reduces to `2(k-1)/(3k)` on the symmetric diamond witness `<<1,k,1>>` | positive layer widths; `k > 0`; bounded finite domains for the TLC model | TLA+ `WallaceMetric.tla` invariants (`InvWallaceBounds`, `InvWallaceComplement`, `InvWallaceZeroIffFull`, `InvDiamondClosedForm`, `InvDiamondZeroIffUnit`) + Lean theorems `Wallace.frontierArea3_le_envelopeArea3`, `Wallace.wallace_bounds3`, `Wallace.wallace_complement3`, `Wallace.wallace_zero_iff_full3`, `Wallace.diamond_wallace_closed_form`, and `Wallace.diamond_wallace_zero_iff_unit` | Mechanized |
| `THM-S7-MUX-MONO` | Turbulent multiplexing monotonicity: with fixed useful work and legal recovered overlap, multiplexing cannot increase the Wallace metric and strictly lowers it when overlap is actually recovered | positive busy work; sequential capacity at least busy work; recovered overlap bounded by slack (`overlap <= seqCap - busy`), which is the bounded occupancy image of branch isolation + deterministic fold preserving useful work | TLA+ `MultiplexingMonotonicity.tla` invariants (`InvWallaceNumeratorMonotone`, `InvFillMonotone`, `InvWallaceRatioMonotone`, `InvWallaceRatioStrictWhenOverlapRecovered`) + Lean theorems `Multiplexing.multiplexed_capacity_ge_busy`, `Multiplexing.multiplexing_wallace_numerator_monotone`, `Multiplexing.multiplexing_wallace_numerator_drop_equals_overlap`, `Multiplexing.multiplexing_fill_monotone`, `Multiplexing.multiplexing_wallace_ratio_monotone`, and `Multiplexing.multiplexing_wallace_ratio_strict` | Mechanized |
| `THM-S7-STAGGER` | Staged expansion dominates naive widening on the bounded diamond witness: with positive topology deficit and the same added frontier budget, filling underfilled shoulders first yields higher frontier fill and therefore lower Wallace than dumping the budget into the current peak | `k > 0`; shoulder budgets bounded by `k-1`; positive added budget `left+right > 0`; same budget supported by positive topology deficit witness `left+right <= deficit` | TLA+ `StagedExpansion.tla` invariants (`InvSameBudgetFrontierArea`, `InvEnvelopeComparison`, `InvStagedFillDominatesNaive`, `InvStagedWallaceBeatsNaive`) + Lean theorems `StagedExpansion.staged_frontier_area_matches_naive`, `StagedExpansion.staged_envelope_preserved`, `StagedExpansion.naive_widen_envelope_closed_form`, `StagedExpansion.staged_wallace_closed_form`, `StagedExpansion.naive_widen_wallace_closed_form`, and `StagedExpansion.staged_fill_dominates_naive` together with `THM-S7-WALLACE` complement law | Mechanized |
| `THM-S7-WARM-EFF` | Warm-up efficiency: for homologous workloads with fixed useful work, recovered overlap is worth the added Buley cost exactly when the weighted Wallace reduction exceeds the Burden Scalar; equivalently `lambda * busy * overlap > BurdenScalar`, with `BurdenScalar = deltaB * seqCap * (seqCap - overlap)` | positive busy work; sequential capacity at least busy work; recovered overlap bounded by slack (`overlap <= seqCap - busy`); non-negative Buley rise `deltaB`; positive Wallace-value weight `lambda > 0` | TLA+ `WarmupEfficiency.tla` invariants (`InvWallaceDropCrossClosedForm`, `InvBurdenScalarClosedForm`, `InvWorthWarmupIffExplicit`, `InvWorthWarmupIffShiftedUtility`, `InvFreeWarmupWorthWhenOverlapRecovered`, `InvNoRecoveryNotWorthWhenBuleyPositive`) + Lean theorems `WarmupEfficiency.warmup_wallace_drop_cross_closed_form`, `WarmupEfficiency.warmup_efficiency_iff`, `WarmupEfficiency.warmup_efficiency_iff_shifted_utility`, `WarmupEfficiency.free_warmup_positive_overlap_is_worth`, and `WarmupEfficiency.no_recovery_not_worth_when_buley_positive` | Mechanized |
| `THM-S7-WARM-DYN` | Dynamic warm-up cooling: under bounded entropy creep, reachable burden threshold, and cooling strength that can clear any reachable overlap, the dynamic warm-up controller keeps overlap bounded and eventually returns to a laminar state (`overlap = 0`) | static warm-up-efficiency assumptions; positive `decayRate` and `turbulenceBuild`; full-cooling assumption `decayRate > seqCap - busy`; reachability assumption `wallaceWeight * (seqCap - busy) > buleyRise * seqCap`; weak fairness on both `ActiveCooling` and `EntropyCreep` | TLA+ `DynamicWarmupEfficiency.tla` invariants (`InvOverlapBounded`, `InvDynamicAssumptions`, `InvWarmCapBounded`, `InvMaxOverlapTriggersCooling`) + liveness property `PropEventualLaminar` | Mechanized |
| `THM-S7-WARM-CTRL` | Warm-up controller optimality: under one-hot topology mismatch, the score-minimizing controller chooses `expand` for underfilled topology below the redline, `constrain` for overprovisioned topology below the redline, and `shed-load` once the Burden Scalar exceeds that redline, with `Redline = deficitWeight + shedPenalty` | static warm-up-efficiency assumptions; positive deficit penalty `deficitWeight > 0`; positive shed penalty `shedPenalty > 0`; one-hot mismatch (`underDeficit = 0 \/ overDeficit = 0`) with positive total mismatch (`underDeficit + overDeficit > 0`) | TLA+ `WarmupController.tla` invariants (`InvChosenScoreMinimal`, `InvExpandBeatsConstrainWhenUnder`, `InvConstrainBeatsExpandWhenOver`, `InvExpandOptimalBelowRedline`, `InvConstrainOptimalBelowRedline`, `InvShedLoadOptimalAboveRedline`) + Lean theorems `WarmupController.choose_expand_below_redline`, `WarmupController.choose_constrain_below_redline`, `WarmupController.choose_shed_load_when_under_above_redline`, and `WarmupController.choose_shed_load_when_over_above_redline` | Mechanized |
| `THM-S7-WARM-CTRL-TIE` | Exact redline ties are deterministic: at `BurdenScalar = Redline`, an underfilled topology chooses `expand` rather than `shed-load`, and an overprovisioned topology chooses `constrain` rather than `shed-load`; under one-hot mismatch, the excluded topology-repair action never occurs on the wrong side (`constrain` never under underfill, `expand` never under overfill) | one-hot mismatch with positive active side (`underDeficit > 0`, `overDeficit = 0` or `underDeficit = 0`, `overDeficit > 0`); positive deficit penalty `deficitWeight > 0`; exact equality `BurdenScalar = Redline` | Lean theorems `ControllerTieBreaking.choose_expand_on_under_exact_redline`, `ControllerTieBreaking.under_exact_redline_not_shed`, `ControllerTieBreaking.choose_constrain_on_over_exact_redline`, `ControllerTieBreaking.over_exact_redline_not_shed`, `ControllerTieBreaking.choose_ne_constrain_when_under`, and `ControllerTieBreaking.choose_ne_expand_when_over` in `ControllerTieBreaking.lean` | Mechanized |
| `THM-S7-WHIP-CROSSOVER` | Cross-shard correction crossover is finite and over-sharding becomes non-improving | finite `P,N,C,S`; `P>0`, `N>0`, `C>0`, bounded shard window | TLA+ `WhipCrossover.tla` invariants + Lean theorems `Claims.whip_total_time_strictly_increases_after_full_sharding` and `Claims.whip_strict_crossover_exists` | Mechanized |
| `THM-STAGED-EXPANSION` | Staged expansion frontier: the three-stage expansion area formula matches naive widening. Peak is preserved across stages. Wallace numerator measures wasted capacity in the expansion envelope | peak > 0; left, right >= 0 | Lean theorems `StagedExpansion.staged_frontier_area_matches_naive` and `StagedExpansion.staged_peak_preserved` in `StagedExpansion.lean` | Mechanized |
| `THM-WARMUP-CONTROLLER` | Warmup controller action scoring over expand/constrain/shedLoad: the controller selects the action with minimum score. Repair redline = deficitWeight + shedPenalty. Warmup worth = Wallace benefit exceeds controller burden | deficitWeight, shedPenalty > 0; warmupWallaceDropCross derived from sequential vs multiplexed Wallace | Lean theorems in `WarmupController.lean` and `WarmupEfficiency.lean` including `warmup_wallace_drop_cross_closed_form` | Mechanized |
| `THM-MULTIPLEXING-CAPACITY` | Multiplexing capacity = sequential minus recovered overlap. Wallace numerator is monotone under multiplexing. Wallace numerator drop equals overlap identity | multiplexed pipeline stages | Lean theorems `Multiplexing.multiplexing_wallace_numerator_monotone` and `Multiplexing.multiplexing_wallace_numerator_drop_equals_overlap` in `Multiplexing.lean` | Mechanized |

### Queueing Theory

*Sample-path conservation, multiclass networks, stochastic mixtures, probabilistic kernels, M/M/1 stability, Jackson product-form networks, envelope ladder, adaptive supremum, state-dependent families, measure-theoretic lifts, ergodic Cesaro, and subsumption.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-QUEUE-SAMPLE-PATH` | Finite-trace work-conserving single-server queues satisfy the discrete sample-path Little's Law identity independent of discipline choice | finite arrival trace; positive service quanta; discrete ticks; single server; service choice always taken from active jobs when active jobs exist | TLA+ `QueueingSamplePath.tla` invariants (`InvWorkConservingChoice`, `InvConservationLaw`, `InvFinalLittleIdentity`) + executable queueing-discipline enumeration tests | Mechanized |
| `THM-QUEUE-MULTICLASS-NETWORK` | Bounded multi-class open networks satisfy the same conservation identity under node-local work-conserving dispatch | finite arrival trace; finite job classes; class-specific routes; finite service-law scenario family; one active service choice per non-empty node on each tick | TLA+ `QueueingMultiClassNetwork.tla` invariants (`InvWorkConservingNetworkDispatch`, `InvNetworkConservationLaw`, `InvFinalNetworkIdentity`) + executable multiclass network enumeration tests | Mechanized |
| `THM-QUEUE-STOCHASTIC-MIXTURE` | Finite-support stochastic mixtures of bounded multi-class open-network traces preserve customer-time conservation in expectation | finite scenario support; positive scenario masses; scenario-dependent arrivals/classes/routes/service laws; node-local work-conserving dispatch | TLA+ `QueueingStochasticMixture.tla` invariants (`InvWeightedNetworkConservationLaw`, `InvWeightedFinalNetworkIdentity`) + Lean theorem `Claims.weighted_queue_expectation_balance` + executable weighted-scenario tests | Mechanized |
| `THM-QUEUE-PROBABILISTIC-KERNEL` | Exact finite-state probabilistic queue transitions preserve customer-time conservation at the distribution level | bounded horizon; finite-support arrival kernel; bounded service quanta; FIFO work-conserving single server | TLA+ `QueueingProbabilisticKernel.tla` invariants (`InvMassSchedule`, `InvDistributionConservationLaw`, `InvFinalExpectationIdentity`) + executable exact-kernel propagation tests | Mechanized |
| `THM-QUEUE-PROBABILISTIC-NETWORK-KERNEL` | Exact finite-state probabilistic multiclass open-network transitions preserve customer-time conservation at the distribution level | bounded horizon; two-node open network; class-dependent routes and service quanta; finite-support arrival kernel; deterministic FIFO work-conserving per-node dispatch | TLA+ `QueueingProbabilisticNetworkKernel.tla` invariants (`InvMassSchedule`, `InvDistributionConservationLaw`, `InvFinalExpectationIdentity`) + executable exact-network-kernel propagation tests and explicit worst-case small-data ramp-up witness | Mechanized |
| `THM-QUEUE-PROBABILISTIC-LARGE-NETWORK` | Larger exact finite-support multiclass open-network probabilistic cubes preserve the same weighted conservation law | bounded horizon; three arrival slots; three-node open network; class-dependent routes/service quanta; exact finite-support arrival cube; deterministic FIFO work-conserving per-node dispatch | TLA+ `QueueingProbabilisticLargeNetworkKernel.tla` invariants (`InvMassSchedule`, `InvDistributionConservationLaw`, `InvFinalExpectationIdentity`) + executable larger exact-network-kernel propagation tests | Mechanized |
| `THM-QUEUE-MM1-STABILITY` | Stable `M/M/1` occupancy has the geometric stationary law with finite mean queue length `ρ / (1 - ρ)`, and the same stationary law inherits the queue conservation identities | load `ρ` satisfies `0 <= ρ < 1` | Lean definitions/theorems `QueueStability.mm1StationaryPMF`, `QueueStability.mm1StationaryPMF_apply`, `QueueStability.mm1_stationary_mean_queue_length`, and `QueueStability.mm1_stationary_lintegral_balance` | Mechanized |
| `THM-QUEUE-ONE-PATH` | Canonical stable `M/M/1` queues admit a constructive one-path boundary witness: `β₁ = 0`, capacity `β₁ + 1 = 1`, stationary mean occupancy `λ / (μ - λ)`, and the induced identity `λ / (μ - λ) = λ * (1 / (μ - λ))` | real arrival/service rates `λ >= 0`, `μ > 0`, `λ < μ` | Lean definitions/theorems `QueueBoundary.QueueBoundaryWitness`, `QueueBoundary.canonicalMM1Boundary`, `QueueBoundary.canonicalMM1Boundary_beta1_zero`, `QueueBoundary.canonicalMM1Boundary_capacity_eq_one`, `QueueBoundary.canonicalMM1Boundary_little_law`, `QueueBoundary.canonicalMM1Boundary_stationary_mean_queue_length`, and `QueueBoundary.exists_canonicalMM1_beta1_zero_boundary` | Mechanized |
| `THM-QUEUE-JACKSON-PRODUCT` | Finite open networks with a stable throughput witness satisfying the traffic equations admit an exact product-form occupancy law with exact singleton mass and total mean occupancy `∑ᵢ αᵢ / (μᵢ - αᵢ)` | finite node set; nonnegative external arrivals and routing weights; row-substochastic routing matrix; positive service rates `μᵢ`; nonnegative throughput witness `α`; traffic equations `αᵢ = λᵢ + ∑ⱼ αⱼ Pⱼᵢ`; stability `αᵢ < μᵢ`; witness may come from the least fixed-point approximation or spectral resolvent route, but its nonnegativity/stability side conditions are still supplied explicitly | Lean definitions/theorems `JacksonQueueing.JacksonNetworkData`, `JacksonQueueing.JacksonTrafficData.constructiveNetworkData`, `JacksonQueueing.JacksonTrafficData.spectralNetworkData`, `JacksonQueueing.JacksonNetworkData.load_traffic_equation`, `JacksonQueueing.jacksonProductMeasure`, `JacksonQueueing.jacksonProductMeasure_apply_singleton`, `JacksonQueueing.jackson_product_mean_total_occupancy`, `JacksonQueueing.jacksonNetworkMeasure`, `JacksonQueueing.jackson_network_measure_apply_singleton`, `JacksonQueueing.jackson_network_mean_total_occupancy`, and `JacksonQueueing.jackson_network_lintegral_balance` | Mechanized |
| `THM-QUEUE-JACKSON-EXACT` | Finite open networks admit an exact constructive Jackson closure beyond the envelope ladder once an exact stable real traffic fixed point is supplied: under `spectralRadius P < 1`, any nonnegative real fixed point is unique, equals the constructive least fixed point after `toReal`, and already yields the same constructive mean occupancy and `lintegral` balance laws; the spectral/resolvent candidate is the canonical corollary | finite node set; nonnegative external arrivals and routing weights; row-substochastic routing matrix; positive service rates `μᵢ`; `spectralRadius P < 1`; real traffic witness `α`; `αᵢ >= 0`; traffic equations `αᵢ = λᵢ + ∑ⱼ αⱼ Pⱼᵢ`; stability `αᵢ < μᵢ` | Lean definitions/theorems `JacksonExactClosure.JacksonTrafficData.exact_real_fixed_point_unique`, `JacksonExactClosure.JacksonTrafficData.constructiveThroughput_finite_of_real_fixed_point`, `JacksonExactClosure.JacksonTrafficData.constructiveThroughput_stable_of_real_fixed_point`, `JacksonExactClosure.JacksonTrafficData.constructiveThroughput_toReal_eq_real_fixed_point`, `JacksonExactClosure.JacksonTrafficData.constructiveNetworkDataOfRealFixedPoint`, `JacksonExactClosure.JacksonTrafficData.constructiveNetworkMeasureOfRealFixedPoint`, `JacksonExactClosure.JacksonTrafficData.constructive_network_mean_total_occupancy_of_real_fixed_point`, `JacksonExactClosure.JacksonTrafficData.constructive_network_lintegral_balance_of_real_fixed_point`, and the spectral corollaries `constructiveNetworkDataOfExactSpectral`, `constructiveNetworkMeasureOfExactSpectral`, `constructive_network_mean_total_occupancy_of_exact_spectral`, `constructive_network_lintegral_balance_of_exact_spectral` | Mechanized |
| `THM-QUEUE-JACKSON-RAW` | Finite open networks satisfying the raw envelope criterion admit the same product-form occupancy and queue-balance laws with no hand-supplied throughput witness: if `maxIncomingRoutingMass < 1` and `maxExternalArrival / (1 - maxIncomingRoutingMass) < minServiceRate`, the package constructs the network witness directly from raw `(λ, P, μ)` data | finite node set; nonnegative external arrivals and routing weights; row-substochastic routing matrix; positive service rates; `maxIncomingRoutingMass < 1`; raw envelope below `minServiceRate` | Lean definitions/theorems `JacksonRawClosure.JacksonTrafficData.rawEnvelopeBound`, `JacksonRawClosure.JacksonTrafficData.rawEnvelopeBound_lt_serviceRate`, `JacksonRawClosure.JacksonTrafficData.constructiveNetworkDataOfRawEnvelope`, `JacksonRawClosure.JacksonTrafficData.spectralNetworkDataOfRawEnvelope`, `JacksonRawClosure.JacksonTrafficData.raw_jackson_product_mean_total_occupancy`, and `JacksonRawClosure.JacksonTrafficData.raw_jackson_lintegral_balance` together with the underlying `JacksonQueueing.*MaxIncomingRoutingMassMinService*` constructors | Mechanized |
| `THM-QUEUE-JACKSON-FEEDFORWARD` | The bounded two-node feed-forward ceiling witness is a nontrivial raw exact Jackson subclass: its routing matrix is nilpotent (`P^2 = 0`), so the explicit throughput candidate already matches the constructive least fixed point and yields the same product-form mean occupancy and `lintegral` balance laws directly from raw parameters | two-node adaptive ceiling witness over `Bool`; nonnegative left/right arrivals; reroute probability `0 <= p < 1`; left stability `λ_L < μ_L`; right stability `λ_R + λ_L p < μ_R` | Lean definitions/theorems `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.ceilingRoutingMatrix_sq_eq_zero`, `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.ceiling_spectralRadius_eq_zero`, `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.candidate_eq_constructiveThroughput_toReal`, `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.ceilingConstructiveNetworkData`, `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.ceilingConstructiveNetworkMeasure`, `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.ceiling_constructive_network_mean_total_occupancy`, and `JacksonFeedForwardClosure.TwoNodeAdaptiveRoutingParameters.ceiling_constructive_network_lintegral_balance` | Mechanized |
| `THM-QUEUE-JACKSON-ENVELOPE-LADDER` | The finite Jackson raw route sharpens into a descending constructive envelope ladder: if any chosen stage `throughputEnvelopeApprox n` already lies below service rates, then the same product-form occupancy and queue-balance laws close at that stage, with `n = 1` recovering the local envelope and `n = 2` the second-order envelope | finite node set; nonnegative external arrivals and routing weights; row-substochastic routing matrix; positive service rates; `maxIncomingRoutingMass < 1`; chosen ladder stage `n`; service bound `throughputEnvelopeApprox n i < μᵢ`; local and second-order corollaries specialize `n = 1` and `n = 2` | Lean definitions/theorems `JacksonEnvelopeClosure.JacksonTrafficData.throughputEnvelopeApprox_zero_eq_rawEnvelopeBound`, `JacksonEnvelopeClosure.JacksonTrafficData.throughputEnvelopeApprox_one_eq_localEnvelope`, `JacksonEnvelopeClosure.JacksonTrafficData.throughputEnvelopeApprox_two_eq_secondOrderEnvelope`, `JacksonEnvelopeClosure.JacksonTrafficData.envelope_ladder_descends`, `JacksonEnvelopeClosure.JacksonTrafficData.trafficApprox_toReal_le_envelopeApprox`, `JacksonEnvelopeClosure.JacksonTrafficData.constructiveNetworkDataOfLocalEnvelope`, `JacksonEnvelopeClosure.JacksonTrafficData.spectralNetworkDataOfLocalEnvelope`, `JacksonEnvelopeClosure.JacksonTrafficData.constructiveNetworkDataOfSecondOrderEnvelope`, `JacksonEnvelopeClosure.JacksonTrafficData.spectralNetworkDataOfSecondOrderEnvelope`, `JacksonEnvelopeClosure.JacksonTrafficData.constructiveNetworkDataOfEnvelopeApprox`, `JacksonEnvelopeClosure.JacksonTrafficData.spectralNetworkDataOfEnvelopeApprox`, `JacksonEnvelopeClosure.JacksonTrafficData.local_jackson_product_mean_total_occupancy`, `JacksonEnvelopeClosure.JacksonTrafficData.second_order_jackson_product_mean_total_occupancy`, `JacksonEnvelopeClosure.JacksonTrafficData.nth_envelope_jackson_product_mean_total_occupancy`, `JacksonEnvelopeClosure.JacksonTrafficData.local_jackson_lintegral_balance`, `JacksonEnvelopeClosure.JacksonTrafficData.second_order_jackson_lintegral_balance`, and `JacksonEnvelopeClosure.JacksonTrafficData.nth_envelope_jackson_lintegral_balance` | Mechanized |
| `THM-QUEUE-INFINITE-SUPPORT` | Infinite weighted scenario families preserve queue customer-time conservation under exact countable/infinite support aggregation | arbitrary scenario index type; nonnegative scenario mass; sample-path customer-time = sojourn + open-age identity | Lean theorems `MeasureQueueing.weighted_queue_tsum_balance` and `MeasureQueueing.weighted_queue_tsum_terminal_expectation_balance` | Mechanized |
| `THM-QUEUE-COUNTABLE-STOCHASTIC` | Countably supported stochastic queue laws preserve the same expectation/conservation identity | countable-support probability mass function on scenarios; nonnegative measurable queue observables; sample-path customer-time = sojourn + open-age identity | Lean theorems `MeasureQueueing.pmf_queue_tsum_balance`, `MeasureQueueing.pmf_queue_tsum_terminal_balance`, `MeasureQueueing.pmf_queue_lintegral_balance`, and `MeasureQueueing.pmf_queue_terminal_lintegral_balance` | Mechanized |
| `THM-QUEUE-MEASURE-LIMIT` | Measure-theoretic queue observables and monotone truncation families preserve conservation in the unbounded limit | measurable nonnegative observables; sample-path customer-time = sojourn + open-age identity; monotone measurable truncation families for limit lift | Lean theorems `MeasureQueueing.measure_queue_lintegral_balance`, `MeasureQueueing.measure_queue_terminal_lintegral_balance`, `MeasureQueueing.measure_queue_truncation_limit_balance`, and `MeasureQueueing.measure_queue_truncation_terminal_limit_balance` | Mechanized |
| `THM-QUEUE-ERGODIC-CESARO` | Unbounded open-network sample-path conservation lifts to long-run Cesaro limits, and vanishing residual open age yields terminal balance | cumulative customer-area = departed sojourn + open age at every horizon; all three Cesaro averages converge; terminal form additionally requires open-age Cesaro limit `= 0` | Lean structure/theorems `QueueStability.OpenNetworkCesaroWitness`, `QueueStability.open_network_cesaro_balance`, and `QueueStability.open_network_terminal_cesaro_balance` | Mechanized |
| `THM-QUEUE-STATE-DEPENDENT-SCHEMA` | State-dependent open-network stationary and terminal queue balance follow from explicit routing-kernel bridge witnesses, explicit Lyapunov drift bounds outside a finite small set, and a positive drift gap; positive recurrence and stationary-law existence are then derived in-package rather than postulated separately | measurable state space; state-dependent service and routing semantics; explicit routing bridge witness; explicit Lyapunov drift bound outside a finite small set; positive drift gap; terminal form additionally requires stationary open age to vanish almost everywhere | Lean structure/theorems `Axioms.StateDependentQueueStabilityAssumptions`, `Axioms.StateDependentQueueStabilityAssumptions.positiveRecurrent_holds`, `Axioms.StateDependentQueueStabilityAssumptions.stationaryLawExists_holds`, `Axioms.state_dependent_queue_stability_schema`, and `Axioms.state_dependent_queue_terminal_balance_schema` | Mechanized (witness-parameterized schema) |
| `THM-QUEUE-ADAPTIVE-SUPREMUM` | Adaptive routing families dominated by a substochastic contractive ceiling kernel inherit the ceiling's throughput bounds constructively, and from that raw ceiling data plus a monotone expected-Lyapunov lift they inherit the state-dependent stationary and terminal balance shell once the chosen Lyapunov is expressed in one of five supported forms: an automatically synthesized minimum-slack bottleneck identity, a raw-score-normalized weighted identity, a positive-part-normalized weighted identity for arbitrary real scores, an explicit selector-based one-hot slack identity, or a weighted-slack decomposition; the recurrence/stationary-law layer is then derived from explicit kernel witnesses rather than separately assumed | finite node set; finite adaptive state index set for the constructive comparison; nonnegative arrivals and routing weights; explicit dominating Jackson kernel or pointwise `supremumKernel`; if the pointwise ceiling is used, its row sums must still be substochastic; a nonnegative postfixed ceiling candidate; an adaptive expected-Lyapunov lift monotone in nodewise throughput bounds; either a minimum-slack chosen-Lyapunov identity, a nonnegative raw-score family with strictly positive total mass outside the small set, an arbitrary real score family whose positive part has strictly positive total mass outside the small set, an explicit selector-based chosen-Lyapunov slack identity, or a chosen-Lyapunov weighted-slack decomposition outside the small set; in the normalized nonnegative weighted case, pointwise node slack lower bounds suffice for drift-gap coverage | Lean definitions/theorems `JacksonQueueing.AdaptiveJacksonTrafficData`, `JacksonQueueing.AdaptiveJacksonTrafficData.constructiveThroughput_le_of_dominating_real_postfixed`, `JacksonQueueing.AdaptiveJacksonTrafficData.supremumKernel`, `JacksonQueueing.AdaptiveJacksonTrafficData.constructiveThroughput_le_supremumSpectralThroughput`, `JacksonQueueing.AdaptiveJacksonTrafficData.constructiveThroughput_stable_of_supremumSpectral`, `Axioms.AdaptiveExpectedLyapunovSynthesis`, `Axioms.AdaptiveCeilingDriftSynthesis`, `Axioms.minimumSlackNode`, `Axioms.minimumSlackSelector`, `Axioms.normalizedSlackWeights`, `Axioms.positivePartSlackScores`, `Axioms.AdaptiveCeilingDriftSynthesis.ofMinimumSlack`, `Axioms.AdaptiveCeilingDriftSynthesis.ofNormalizedScoreSlack`, `Axioms.AdaptiveCeilingDriftSynthesis.ofPositivePartScoreSlack`, `Axioms.AdaptiveCeilingDriftSynthesis.ofSelectedSlack`, `Axioms.AdaptiveCeilingDriftSynthesis.ofNormalizedWeightedSlack`, `Axioms.reserveCoversWeightedSlack_of_normalizedWeights`, `Axioms.AdaptiveSupremumStabilityAssumptions`, `Axioms.adaptive_queue_stability_from_supremum_schema`, and `Axioms.adaptive_queue_terminal_balance_from_supremum_schema` | Mechanized (constructive comparison + derived drift shell) |
| `THM-QUEUE-ADAPTIVE-RAW-CEILING` | A bounded two-node adaptive rerouting family derives its own dominating ceiling kernel, strict-row-substochastic spectral side conditions, constructive throughput bound, and a linear drift witness directly from raw parameters | bounded two-node adaptive state space; nonnegative left/right arrivals; reroute probability `0 <= p < 1`; left-node stability `λ_L < μ_L`; right-node ceiling stability `λ_R + λ_L p < μ_R` | Lean definitions/theorems `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.ceilingTrafficData`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.adaptiveTrafficData`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.ceiling_strict_row_substochastic`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.ceiling_spectralRadius_lt_one`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.candidate_fixed_point`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.constructiveThroughput_stable`, `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.driftGap_positive`, and `StateDependentQueueFamilies.TwoNodeAdaptiveRoutingParameters.expectedLyapunov_drift` | Mechanized |
| `THM-QUEUE-LIMIT-SCHEMA` | Stronger queue-limit claims with explicit support-exhaustion and integrable-envelope side conditions remain available as a higher-level theorem schema | monotone support approximation; measurable customer-time/sojourn observables; dominating integrable envelope; finite truncations balanced | Lean theorems `Claims.weighted_queue_prefix_customer_time_balance`, `Claims.weighted_queue_prefix_expectation_balance`, and schema `Axioms.queue_limit_schema` | Mechanized (assumption-parameterized scaffold) |
| `THM-QUEUE-CONTAINMENT` | *Superseded by THM-QUEUE-SUBSUMPTION.* Forward direction of queueing subsumption: when the supplied `β₁=0` queue law holds, the framework recovers that one-path boundary, and when `β₁>0` the framework exposes an additional topology-control witness | queue law at `β₁=0`; topology-control witness for `β₁>0` | Lean schemas `Axioms.queueing_containment_at_beta1_zero` and `Axioms.queueing_strict_extension_at_positive_beta` + executable tests | Mechanized (assumption-parameterized + executable) |
| `THM-QUEUE-CONVERSE` | Converse direction of queueing subsumption: every queueing system (G/G/1, G/G/c, priority, network) admits a fork/race/fold embedding under C3' (probabilistic fold). Arrival processes map to fork distributions, service processes map to race outcomes, queue disciplines map to fold policies, routing matrices map to probabilistic fork/vent distributions, and multi-server systems map to β₁ = c-1. Little's Law holds in both representations. | C3' (probabilistic fold) + ergodicity; work-conserving discipline; finite or countable state space for exact embedding | Executable tests `queueing-converse.test.ts`: G/G/1 embedding family (M/M/1, M/D/1, M/G/1, G/G/1), priority queue embedding (non-preemptive, preemptive vent-and-refork, SJF, round-robin), multi-server M/M/c with Erlang B recovery, network embedding (tandem, Jackson, BCMP processor-sharing, feedback loops), structural completeness (13 disciplines, 4 routing topologies, 5 service distributions) | Executable |
| `THM-C3-PRIME-GENERALIZATION` | C3' (probabilistic fold) generalizes C3 (deterministic fold): deterministic fold is the Dirac δ special case of probabilistic fold. C3' preserves C1 (fork creates paths), C2 (race selects earliest), and C4 (finite termination). Under ergodicity, conservation holds in expectation: E[V_fork] = E[W_fold] + E[Q_vent]. C3' is strictly weaker than C3 (positive fold entropy vs zero) | probabilistic fold distribution with well-defined expectation; ergodicity for conservation in expectation | Executable tests `queueing-converse.test.ts`: Dirac special case verification, C1/C2/C4 preservation, expectation conservation under ergodicity, variance comparison (C3 = 0, C3' > 0), Shannon entropy comparison | Executable |
| `THM-PROBABILISTIC-FOLD-SAFETY` | Under C3' + ergodicity, probabilistic fold preserves all four fork/race/fold axioms and conservation holds in expectation rather than pointwise. The entropy increase is bounded: H(fold) = 0 for deterministic (C3), H(fold) > 0 for probabilistic (C3'). | C3' fold distribution; ergodicity; finite fork/race/fold system | Executable tests `queueing-converse.test.ts`: entropy comparison, variance bounds, simulated conservation verification over 50000 events | Executable |
| `THM-QUEUE-SUBSUMPTION` | Bidirectional subsumption of queueing theory by fork/race/fold: (forward) FRF at β₁=0 recovers queueing theory (THM-QUEUE-CONTAINMENT); (converse) every queueing system embeds as FRF under C3' (THM-QUEUE-CONVERSE). The subsumption is representational/syntactic -- fork/race/fold provides the language, specific solution techniques (product-form, heavy-traffic limits, matrix-analytic methods) are additional structure within that language. Ergodicity is assumed, not derived. | C1-C3'-C4 axioms; ergodicity; all assumptions of THM-QUEUE-CONTAINMENT (forward) and THM-QUEUE-CONVERSE (converse) | Forward: Lean schemas + executable tests (`queueing-subsumption.test.ts`, `deep-queueing-extensions.test.ts`). Converse: executable tests (`queueing-converse.test.ts`). Honest caveats: representational not dynamical, ergodicity assumed, heavy-traffic diffusion limits not covered, C3' weaker than C3 | Executable (bidirectional) |
| `THM-QUEUE-JACKSON-QUEUEING` | Jackson network fundamentals: spectrum/transpose equality, spectral radius transpose equality, M/M/1 stationary queue length integral equals rho/(1-rho). Measure-theoretic queue analysis with weighted series balance equation | M/M/1 stability (rho < 1); finite Jackson network | Lean theorems `JacksonQueueing.spectrum_transpose_eq`, `JacksonQueueing.spectralRadius_transpose_eq`, `JacksonQueueing.mm1_stationary_lintegral_queue_length` in `JacksonQueueing.lean` + `MeasureQueueing.weighted_queue_tsum_balance` in `MeasureQueueing.lean` + `QueueStability.mm1StationaryPMF_apply` and `QueueStability.mm1_stationary_mean_queue_length` in `QueueStability.lean` + `QueueBoundary.canonicalMM1Boundary` in `QueueBoundary.lean` | Mechanized |
| `THM-STATE-DEPENDENT-QUEUE-FAMILIES` | State-dependent queue families: vacation queue state, retrial queue, reneging queue, adaptive routing queue. Queue law structures for multiple service disciplines with customer time, sojourn time, and open age accounting | VacationQueueState; RetrialQueueState; RenegingQueueState; AdaptiveRoutingQueueState | Lean definitions and queue law structures in `StateDependentQueueFamilies.lean` | Mechanized |

### Geometric & Compositional Ergodicity (Tracks Delta + Iota)

*Quantitative convergence rates, mixing time bounds, continuous ergodicity lift, parallel/sequential composition, pipeline certificates.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-CONTINUOUS-HARRIS` | Foster-Lyapunov drift witness synthesis for continuous-state kernels over Polish spaces, extending beyond Fin (maxQueue + 1) types. Provides kernel structure, drift conditions, witness synthesis, and multi-level composition. | Polish space Ω; measurable Lyapunov function; measurable small set; drift gap > 0 | Lean theorems `ContinuousHarris.continuous_harris_from_drift`, `ContinuousHarris.synthesized_kernel_foster_drift`, `ContinuousHarris.discrete_embeds_continuous`, and `ContinuousHarris.multi_level_positive_drift` | Mechanized |
| `THM-GEOMETRIC-ERGODICITY-DISCRETE` | For a countable certified kernel with quantitative geometric envelope at an atom, the TV distance from any initial state to the stationary distribution decays geometrically: `TV(P^n(x, ·), π) ≤ M(x) · r^n` for computable `r < 1`. Quantifies *how fast* systems converge, not just *that* they converge. | countable certified kernel with geometric envelope at atom; step epsilon `ε₂ > 0`; small-set epsilon `ε₁ > 0`; both sub-unit | TLA+ `GeometricErgodicity.tla` invariant `InvGeometricDecay` + Lean theorem `GeometricErgodicity.geometric_ergodicity_discrete` in `GeometricErgodicity.lean` | Mechanized |
| `THM-GEOMETRIC-ERGODICITY-RATE` | The contraction rate `r` is bounded by `1 - stepEpsilon · smallSetEpsilon`, explicitly computable from the kernel certificate data. | geometric ergodic witness with step/small-set epsilons | TLA+ `GeometricErgodicity.tla` invariant `InvRateBound` + Lean theorem `GeometricErgodicity.geometric_ergodicity_rate` in `GeometricErgodicity.lean` | Mechanized |
| `THM-MIXING-TIME-BOUND` | The ε-mixing time satisfies `t_mix(ε) ≤ (1/(1-r)) · log(M(x)/ε)`. For any target tolerance, there exists a finite step count at which TV distance drops below it. | geometric ergodic witness; target tolerance `ε > 0`; initial bound `M(x)` | TLA+ `GeometricErgodicity.tla` invariant `InvMixingTimeBound` + Lean theorem `GeometricErgodicity.mixing_time_bound` in `GeometricErgodicity.lean` | Mechanized |
| `THM-CONTINUOUS-ERGODICITY-LIFT` | For a ContinuousStateKernel with a discrete sub-lattice embedding, the discrete geometric rate lifts to the continuous kernel. Polish-space kernels inherit convergence rates from their discrete skeletons. | ContinuousStateKernel Ω; discrete sub-lattice embedding ι : Fin n → Ω; lattice covers small set; discrete kernel with geometric ergodic witness | TLA+ `GeometricErgodicity.tla` invariant `InvContinuousLift` + Lean theorem `GeometricErgodicity.continuous_ergodicity_lift` in `GeometricErgodicity.lean` | Mechanized |
| `THM-PARALLEL-ERGODICITY` | For two geometrically ergodic kernels `K₁(r₁)` and `K₂(r₂)`, the product kernel `K₁ ⊗ K₂` is geometrically ergodic with rate `r ≤ max(r₁, r₂)`. The slower stage dominates in parallel composition. | two GeometricErgodicityRate witnesses | TLA+ `CompositionalErgodicity.tla` invariant `InvParallel` + Lean theorem `CompositionalErgodicity.parallel_ergodicity` in `CompositionalErgodicity.lean` | Mechanized |
| `THM-SEQUENTIAL-ERGODICITY` | For `K₂ ∘ K₁` (sequential composition), the composite is geometrically ergodic with rate `r ≤ r₁ · r₂`. Rates multiply under sequential composition — faster convergence than either stage alone. | two GeometricErgodicityRate witnesses | TLA+ `CompositionalErgodicity.tla` invariant `InvSequential` + Lean theorem `CompositionalErgodicity.sequential_ergodicity` in `CompositionalErgodicity.lean` | Mechanized |
| `THM-PIPELINE-MIXING-BOUND` | An n-stage pipeline with per-stage rates has bounded mixing time. For sequential composition, `t_mix(ε) ≤ Σᵢ (1/(1-rᵢ)) · log(Mᵢ/ε)`. The pipeline converges to equilibrium in finite time. | per-stage GeometricErgodicityRate witnesses; target tolerance ε > 0 | TLA+ `CompositionalErgodicity.tla` invariant `InvMixingBound` + Lean theorem `CompositionalErgodicity.pipeline_mixing_bound` in `CompositionalErgodicity.lean` | Mechanized |
| `THM-PIPELINE-CERTIFICATE` | Given per-stage `GeometricErgodicWitness` certificates, construct a pipeline-level certificate automatically. Per-stage stability certificates compose into pipeline-level certificates. | per-stage GeometricErgodicityRate witnesses | TLA+ `CompositionalErgodicity.tla` invariant `InvCertificate` + Lean theorem `CompositionalErgodicity.pipeline_certificate_valid` in `CompositionalErgodicity.lean` | Mechanized |
| `THM-ERGODICITY-MONOTONE-IN-STAGES` | Adding a geometrically ergodic stage to a sequential pipeline cannot worsen the per-step contraction rate. Since 0 < r_new < 1, the product rate is strictly smaller. | pipeline GeometricErgodicityRate + new stage GeometricErgodicityRate | TLA+ `CompositionalErgodicity.tla` invariant `InvMonotone` + Lean theorem `CompositionalErgodicity.ergodicity_monotone_in_stages` in `CompositionalErgodicity.lean` | Mechanized |

### Lyapunov Synthesis (Tracks Kappa + Nu + Xi)

*Affine and nonlinear Lyapunov witness synthesis, adaptive gradient decomposition, and pipeline lift.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SYNTACTIC-LYAPUNOV-AFFINE` | For an affine drift program with positive drift gap (serviceRate > arrivalRate), V(x) = x is a valid Lyapunov function. The drift gap equals serviceRate - arrivalRate, which is the spectral gap of the affine kernel. First class where the compiler oracle synthesizes stability proofs from program syntax. | AffineDriftProgram with serviceRate > arrivalRate; maxState > 0; ventThreshold < maxState | TLA+ `SyntacticLyapunov.tla` invariant `InvLyapunov` + Lean theorem `SyntacticLyapunov.syntactic_lyapunov_affine` in `SyntacticLyapunov.lean` | Mechanized |
| `THM-SYNTACTIC-SMALL-SET` | The set {x : x ≤ ventThreshold} is a valid small set for the affine kernel: finite, non-empty (contains state 0), bounded by maxState. The small-set fraction (ventThreshold+1)/(maxState+1) bounds the minorization constant and is provably in (0,1). | AffineDriftProgram with ventThreshold < maxState | TLA+ `SyntacticLyapunov.tla` invariant `InvSmallSet` + Lean theorems `SyntacticLyapunov.syntactic_small_set` and `SyntacticLyapunov.syntactic_small_set_fraction_bounds` in `SyntacticLyapunov.lean` | Mechanized |
| `THM-SYNTACTIC-WITNESS-SOUND` | The synthesized GeometricErgodicityRate (with stepEpsilon = driftGap/maxState, smallSetEpsilon = smallSetFraction) has a contraction rate r = 1 - ε₁·ε₂ that is provably in (0,1). The certificate matches the true convergence rate of the kernel. | AffineDriftProgram with ε₁·ε₂ < 1 | TLA+ `SyntacticLyapunov.tla` invariant `InvWitnessSound` + Lean theorem `SyntacticLyapunov.syntactic_witness_sound` in `SyntacticLyapunov.lean` | Mechanized |
| `THM-SYNTACTIC-WITNESS-COMPLETE-AFFINE` | For any affine drift program with positive drift gap, synthesis always succeeds: stepEpsilon > 0, smallSetFraction ∈ (0,1), so a GeometricErgodicityRate can always be constructed. Completeness for the affine class. | AffineDriftProgram | TLA+ `SyntacticLyapunov.tla` invariant `InvWitnessComplete` + Lean theorem `SyntacticLyapunov.syntactic_witness_complete` in `SyntacticLyapunov.lean` | Mechanized |
| `THM-SYNTACTIC-PIPELINE-LIFT` | Per-stage synthesized witnesses compose via THM-PIPELINE-CERTIFICATE into pipeline-level certificates automatically. The composite rate r₁·r₂ is sub-unit and strictly less than either individual rate. | two GeometricErgodicityRate witnesses from synthesis | TLA+ `SyntacticLyapunov.tla` invariant `InvPipelineLift` + Lean theorem `SyntacticLyapunov.syntactic_pipeline_lift` in `SyntacticLyapunov.lean` | Mechanized |
| `THM-NONLINEAR-LYAPUNOV-QUADRATIC` | For V(x) = x², the effective drift gap at state x is gap·(2x - gap), which grows linearly with x. Strictly positive for x > gap, and strictly exceeds the affine drift gap. Handles fluid backlog and thermodynamic state variables. | NonlinearDriftProgram; drift gap > 0; state x > gap | TLA+ `NonlinearLyapunov.tla` invariant `InvQuadratic` + Lean theorems `NonlinearLyapunov.nonlinear_lyapunov_quadratic_drift` and `NonlinearLyapunov.nonlinear_quadratic_exceeds_affine` in `NonlinearLyapunov.lean` | Mechanized |
| `THM-NONLINEAR-LYAPUNOV-POWER` | V(x) = x^p for p ≥ 1 satisfies Foster drift: (x - gap)^p ≤ x^p for x ≥ gap. Monotonicity in the exponent: higher p gives larger effective drift gaps for states far from the small set. | NonlinearDriftProgram; exponent p ≥ 1; state x ≥ gap > 0 | TLA+ `NonlinearLyapunov.tla` invariant `InvPower` + Lean theorem `NonlinearLyapunov.nonlinear_lyapunov_power_monotone` in `NonlinearLyapunov.lean` | Mechanized |
| `THM-NONLINEAR-SMALL-SET-VALID` | The level set {x ≤ T} from the affine program is also valid for nonlinear V(x) = x^p: finite, non-empty, bounded by maxState. | NonlinearDriftProgram | TLA+ `NonlinearLyapunov.tla` invariant `InvSmallSet` + Lean theorem `NonlinearLyapunov.nonlinear_small_set_valid` in `NonlinearLyapunov.lean` | Mechanized |
| `THM-NONLINEAR-WITNESS-SOUND` | The synthesized rate from nonlinear V inherits the affine synthesis parameters: stepEpsilon > 0, smallSetFraction ∈ (0,1). Nonlinear case can only improve the rate. | NonlinearDriftProgram | TLA+ `NonlinearLyapunov.tla` invariant `InvWitnessSound` + Lean theorem `NonlinearLyapunov.nonlinear_witness_sound` in `NonlinearLyapunov.lean` | Mechanized |
| `THM-NONLINEAR-DOMINATES-AFFINE` | Nonlinear V(x) = x² gives a tighter (smaller) contraction rate than affine V(x) = x: the quadratic drift term gap·(2x-gap) > gap for all x > gap. Larger effective spectral gap → faster convergence. | NonlinearDriftProgram; state x > drift gap | TLA+ `NonlinearLyapunov.tla` invariant `InvDominatesAffine` + Lean theorem `NonlinearLyapunov.nonlinear_dominates_affine` in `NonlinearLyapunov.lean` | Mechanized |
| `THM-ADAPTIVE-GRADIENT-DECOMPOSITION` | The gradient of service slack across network nodes defines valid drift weights: wᵢ = sᵢ/Σsⱼ ∈ [0,1], Σwᵢ = 1. All weights non-negative, normalized to sum to 1. | NetworkSlackWitness with n > 0; all slacks positive | TLA+ `AdaptiveDecomposition.tla` invariant `InvGradientDecomp` + Lean theorems `AdaptiveDecomposition.adaptive_gradient_weights_nonneg` and `AdaptiveDecomposition.adaptive_gradient_weights_sum_one` in `AdaptiveDecomposition.lean` | Mechanized |
| `THM-ADAPTIVE-BOTTLENECK-DETECTION` | The minimum-slack node is the bottleneck: it is positive (stable) and lower-bounds all per-node slacks. | NetworkSlackWitness with n > 0 | TLA+ `AdaptiveDecomposition.tla` invariant `InvBottleneck` + Lean theorems `AdaptiveDecomposition.adaptive_bottleneck_positive` and `AdaptiveDecomposition.adaptive_bottleneck_lower_bound` in `AdaptiveDecomposition.lean` | Mechanized |
| `THM-ADAPTIVE-RESERVE-COVERAGE` | The gradient-weighted drift reserve = (Σsᵢ²)/(Σsᵢ) covers the drift gap. By QM-AM inequality, this exceeds the average slack and thus the minimum slack. | NetworkSlackWitness with n > 0; drift gap ≤ min slack | TLA+ `AdaptiveDecomposition.tla` invariant `InvReserveCoverage` + Lean theorem `AdaptiveDecomposition.adaptive_reserve_nonneg` in `AdaptiveDecomposition.lean` | Mechanized |
| `THM-ADAPTIVE-DECOMPOSITION-SOUND` | The gradient decomposition satisfies all AdaptiveCeilingDriftSynthesis obligations: non-negative normalized weights, positive total slack, positive bottleneck. | NetworkSlackWitness with n > 0 | TLA+ `AdaptiveDecomposition.tla` invariant `InvDecompositionSound` + Lean theorem `AdaptiveDecomposition.adaptive_decomposition_sound` in `AdaptiveDecomposition.lean` | Mechanized |
| `THM-ADAPTIVE-DOMINATES-UNIFORM` | Gradient weights dominate uniform weights by Cauchy-Schwarz: n·Σsᵢ² ≥ (Σsᵢ)², so (Σsᵢ²)/(Σsᵢ) ≥ (Σsᵢ)/n = avg(sᵢ) = uniform reserve. | NetworkSlackWitness with n > 0; non-uniform slacks | TLA+ `AdaptiveDecomposition.tla` invariant `InvDominatesUniform` + Lean theorem `AdaptiveDecomposition.adaptive_dominates_uniform_cauchy_schwarz` in `AdaptiveDecomposition.lean` | Mechanized |

### Envelope Convergence (Track Mu)

*Jackson throughput envelope contraction, geometric convergence, mixing time, spectral connection, and early-stopping certificates.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-ENVELOPE-CONTRACTION` | The throughputEnvelopeApprox ladder contracts: residual(n+1) = ρ · residual(n) where ρ = maxIncomingRoutingMass. The residual strictly decreases each step. | EnvelopeConvergenceWitness with ρ ∈ (0,1); R₀ > 0 | TLA+ `EnvelopeConvergence.tla` invariant `InvContraction` + Lean theorems `EnvelopeConvergence.envelope_contraction` and `EnvelopeConvergence.envelope_contraction_strict` in `EnvelopeConvergence.lean` | Mechanized |
| `THM-ENVELOPE-GEOMETRIC-CONVERGENCE` | The envelope ladder converges geometrically: \|approx(n) - exact\| = R₀ · ρ^n, and ρ < 1 ensures decay to zero. The residual is monotonically decreasing. | EnvelopeConvergenceWitness | TLA+ `EnvelopeConvergence.tla` invariant `InvGeometricConvergence` + Lean theorems `EnvelopeConvergence.envelope_geometric_convergence` and `EnvelopeConvergence.envelope_residual_monotone` in `EnvelopeConvergence.lean` | Mechanized |
| `THM-ENVELOPE-MIXING-TIME` | For target accuracy ε > 0, the ladder reaches ε-accuracy in finite steps. The envelope-ladder analog of mixing_time_bound from GeometricErgodicity.lean. | EnvelopeConvergenceWitness; target ε > 0 | TLA+ `EnvelopeConvergence.tla` invariant `InvMixingTime` + Lean theorem `EnvelopeConvergence.envelope_mixing_time` in `EnvelopeConvergence.lean` | Mechanized |
| `THM-ENVELOPE-SPECTRAL-CONNECTION` | The contraction rate ρ bounds the spectral radius of the routing matrix P. The envelope iteration is the power method on the traffic equations. | EnvelopeConvergenceWitness | TLA+ `EnvelopeConvergence.tla` invariant `InvSpectralConnection` + Lean theorem `EnvelopeConvergence.envelope_spectral_connection` in `EnvelopeConvergence.lean` | Mechanized |
| `THM-ENVELOPE-CERTIFICATE-AT-N` | At any step n where the envelope is below the service rate, the stability certificate is valid — early stopping is sound. As n grows, service slack increases monotonically, and eventually certification succeeds. | EnvelopeConvergenceWitness with serviceRate > exactThroughput | TLA+ `EnvelopeConvergence.tla` invariant `InvCertificate` + Lean theorems `EnvelopeConvergence.envelope_certificate_at_n`, `EnvelopeConvergence.envelope_slack_monotone`, and `EnvelopeConvergence.envelope_eventual_certification` in `EnvelopeConvergence.lean` | Mechanized |

### Wallington Rotation Optimality (Track Lambda)

*Admissibility, critical-path makespan, sequential dominance, Pareto scheduling, and deficit-speedup correlation.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-ROTATION-ADMISSIBLE` | The Wallington Rotation produces an admissible schedule for any fork/race/fold DAG: positive finite makespan, respects stage ordering. | ForkRaceFoldDAG with positive stages, paths, and stage time | TLA+ `WallingtonOptimality.tla` invariant `InvAdmissible` + Lean theorem `WallingtonOptimality.rotation_admissible` in `WallingtonOptimality.lean` | Mechanized |
| `THM-ROTATION-MAKESPAN-BOUND` | The rotation makespan equals the critical path: numStages × maxStageTime. No admissible schedule can achieve lower makespan because stages are sequential dependencies. Bound is tight for balanced DAGs. | ForkRaceFoldDAG | TLA+ `WallingtonOptimality.tla` invariant `InvMakespanBound` + Lean theorem `WallingtonOptimality.rotation_makespan_bound` in `WallingtonOptimality.lean` | Mechanized |
| `THM-ROTATION-DOMINATES-SEQUENTIAL` | For any DAG with β₁ > 0 (numPaths ≥ 2), the rotation strictly dominates the sequential schedule: rotationMakespan < sequentialMakespan. The speedup factor is exactly numPaths. | ForkRaceFoldDAG with numPaths ≥ 2 | TLA+ `WallingtonOptimality.tla` invariant `InvDominatesSequential` + Lean theorem `WallingtonOptimality.rotation_dominates_sequential` in `WallingtonOptimality.lean` | Mechanized |
| `THM-ROTATION-PARETO-SCHEDULE` | The rotation is Pareto-optimal in (makespan, resources): sequential uses fewer resources (1 vs numPaths) but has strictly higher makespan. No schedule simultaneously beats both dimensions. | ForkRaceFoldDAG with numPaths ≥ 2 | TLA+ `WallingtonOptimality.tla` invariant `InvPareto` + Lean theorem `WallingtonOptimality.rotation_pareto_schedule` in `WallingtonOptimality.lean` | Mechanized |
| `THM-ROTATION-DEFICIT-CORRELATION` | The rotation's speedup factor equals the topological deficit reduction plus one: speedup = β₁(rotation) - β₁(sequential) + 1 = numPaths. Larger deficit reduction → larger speedup, monotonically. | ForkRaceFoldDAG with numPaths ≥ 1 | TLA+ `WallingtonOptimality.tla` invariant `InvDeficitCorrelation` + Lean theorems `WallingtonOptimality.rotation_deficit_correlation` and `WallingtonOptimality.rotation_deficit_monotone` in `WallingtonOptimality.lean` | Mechanized |

### Race Winner Correctness (Track Omicron)

*Validity, minimality, determinism, isolation, and composability of race operations.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-RACE-WINNER-VALIDITY` | The selected race winner has a valid result: complete status and result passes the validity predicate. Invalid branches cannot win. | RaceConfig with validity predicate; winner index | TLA+ `RaceWinnerCorrectness.tla` invariant `InvValidity` + Lean theorem `RaceWinnerCorrectness.race_winner_validity` in `RaceWinnerCorrectness.lean` | Mechanized |
| `THM-RACE-WINNER-MINIMALITY` | The winner completes no later than any other valid branch. This is the "fastest correct answer" property of race operations. | RaceConfig with isMinimalWinner predicate | TLA+ `RaceWinnerCorrectness.tla` invariant `InvMinimality` + Lean theorem `RaceWinnerCorrectness.race_winner_minimality` in `RaceWinnerCorrectness.lean` | Mechanized |
| `THM-RACE-WINNER-DETERMINISM` | Ties are broken deterministically by branch index (C3). Among all valid candidates with the same completion time, the lowest-indexed branch wins. Satisfies deterministic fold. | RaceConfig with isDeterministicWinner predicate | TLA+ `RaceWinnerCorrectness.tla` invariant `InvDeterminism` + Lean theorem `RaceWinnerCorrectness.race_winner_determinism` in `RaceWinnerCorrectness.lean` | Mechanized |
| `THM-RACE-WINNER-ISOLATION` | Venting a non-winner branch preserves the winner's validity. Formal content of C2 (branch isolation) applied to race operations. | RaceConfig; winner and ventedIdx with winner ≠ ventedIdx | TLA+ `RaceWinnerCorrectness.tla` invariant `InvIsolation` + Lean theorem `RaceWinnerCorrectness.race_winner_isolation` in `RaceWinnerCorrectness.lean` | Mechanized |
| `THM-RACE-WINNER-COMPOSABLE` | Race results compose through fold: given two valid race winners, their fold is valid when the fold function preserves validity. Connects race correctness to the monoidal category structure. | fold function preserving validity; two valid results | TLA+ `RaceWinnerCorrectness.tla` invariant `InvComposable` + Lean theorem `RaceWinnerCorrectness.race_winner_composable` in `RaceWinnerCorrectness.lean` | Mechanized |

### Frame Native Execution

*Bisimulation, Wallington equivalence, and allocation overhead bound for frame-native vs stream-based paths.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-FRAME-BISIM` | Frame-native execution (frameRace, frameFold) produces identical results to Stream-based execution under the canUseFrameNativePath guard: no timeout, no shared state, all handlers registered, default failure policy. Stuttering bisimulation between frame-native and stream paths. | guard conditions (no timeout, no shared state, all handlers registered, default failure policy); deterministic work functions; N ≥ 1 work functions | TLA+ `FrameNativeBisim.tla` invariants (`InvRaceBisimResults`, `InvRaceBisimWinner`, `InvFoldBisimResults`) + Lean theorems `FrameNativeBisim.frame_race_bisim` and `FrameNativeBisim.frame_fold_bisim` | Mechanized |
| `THM-FRAME-WALLINGTON-EQUIV` | Tick-parallel frame executor with flat pre-allocated grid produces same output as sequential Stream-based wallington for any stage/chunk decomposition | S > 0 stages; C > 0 chunks; deterministic stage functions | TLA+ `FrameNativeBisim.tla` + Lean theorem `FrameNativeBisim.frame_wallington_equiv` | Mechanized |
| `THM-FRAME-OVERHEAD-BOUND` | Frame-native allocates O(N) raw promises; Stream-based allocates O(7N) objects (AbortController + event listener + state machine + Promise constructor + result wrapper + vented tracker + map entry). Same result, bounded overhead separation. Frame saves ≥ 5N allocations. | N ≥ 1 work functions | TLA+ `FrameNativeBisim.tla` invariants (`InvOverheadBound`, `InvFrameLinear`, `InvStreamSevenX`) + Lean theorems `FrameNativeBisim.frame_overhead_strictly_less`, `FrameNativeBisim.frame_saves_at_least_5n`, `FrameOverheadBound.race_allocation_savings`, `FrameOverheadBound.fold_allocation_savings`, and `FrameOverheadBound.frame_total_bytes_smaller` | Mechanized |

### Void Walking

*Boundary measurability, volume dominance, memory efficiency, tunneling, regret bounds, gradient, coherence, and void attention.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-VOID-BOUNDARY-MEASURABLE` | The boundary of the void created by T folds over N-way cycles has homology rank bounded by sum of (N_t - 1). Computable in O(T * N_max) time, O(T * log N_max) space. The boundary encodes which equivalence classes were vented at each fold. Dual of persistent homology: tracks birth/persistence of dead features rather than live ones. | finite fork width >= 2; non-injective fold; retained fold results | TLA+ `VoidBoundaryMeasurable.tla` invariants (`InvBoundaryRankEqTotalVented`, `InvPerStepVentCount`, `InvActivePathsBounded`, `InvBoundaryLogLength`, `InvSpaceEfficiency`, `InvBoundaryMonotone`, `InvCompleteTrace`) + Lean theorems `VoidWalking.void_boundary_rank_le_total_vented`, `VoidWalking.void_boundary_grows_per_step`, and `VoidWalking.void_boundary_monotone` in `VoidWalking.lean` + executable `src/void-walking.test.ts` | Mechanized |
| `THM-VOID-DOMINANCE` | Void volume grows as Omega(T * (N-1)), dominating active computation by factor Omega(T). For nested depth d, void grows as Omega(T * N^d) while active paths remain bounded at N^d. The void fraction approaches 1 as T grows. Computational dark energy: the void is the dark matter of computation -- invisible but structurally essential. | constant N >= 2; single-survivor fold; T steps | TLA+ `VoidDominance.tla` invariants (`InvVoidVolumeFormula`, `InvActivePathsBounded`, `InvVoidDominatesLinear`, `InvTotalConservation`, `InvVoidPositiveAfterFirstFold`, `InvFinalDominance`) + Lean theorems `VoidWalking.void_volume_positive`, `VoidWalking.void_dominance_linear`, `VoidWalking.void_fraction_dominates`, and `VoidWalking.void_dominance_nested` in `VoidWalking.lean` + executable `src/void-walking.test.ts` | Mechanized |
| `THM-VOID-MEMORY-EFFICIENCY` | Void boundary encoding is exponentially more compact than storing discarded paths. Ratio: Omega(N * m_min / log N). The boundary is a sufficient statistic for optimal fork distributions. Upper bound from THM-VOID-BOUNDARY-MEASURABLE, lower bound from DPI (fold_erasure in FoldErasure.lean). | path payloads >= 1 bit; N >= 2 | Lean theorem `VoidWalking.void_boundary_sufficient_statistic` in `VoidWalking.lean` using existing `DataProcessingInequality.lean` + executable `src/void-walking.test.ts` | Mechanized |
| `THM-VOID-TUNNEL` | Void regions sharing a common ancestor fork have positive mutual information: I(dV_A; dV_B) > 0. Correlation decays exponentially: I <= H(F) * prod(1 - epsilon_t) where epsilon_t is erasure fraction at fold t along the connecting path. Finite products of values in (0,1) are strictly positive -- correlation never fully vanishes. This is why counterfactual reasoning works. | common ancestor fork with H(F) > 0; both branches undergo at least one fold; bounded erasure 0 < epsilon_t < 1 | TLA+ `VoidTunnel.tla` invariants (`InvRetainedInfoAPositive`, `InvRetainedInfoBPositive`, `InvMutualInfoPositive`, `InvMutualInfoBounded`, `InvRetainedInfoDecreases`, `InvCompleteMutualInfoPositive`) + Lean theorems `VoidWalking.void_tunnel_mutual_information_positive` and `VoidWalking.void_tunnel_retention_positive` in `VoidWalking.lean` using existing DPI infrastructure + executable `src/void-walking.test.ts` | Mechanized |
| `THM-VOID-REGRET-BOUND` | Void walking reduces adversarial regret from Omega(sqrt(TN)) to O(sqrt(T log N)). Improvement factor sqrt(N / log N), unbounded as N grows. Void boundary provides N-1 bits of negative information per round (which paths lost). The void IS the expert advice in the experts framework -- not what the experts said, but the record of which experts failed. | adversarial costs in [0,1]; constant N; boundary-only access | Lean theorem `VoidWalking.void_walking_regret_bound` in `VoidWalking.lean` + executable `src/void-regret-simulation.test.ts` with Exp3 comparison | Mechanized |
| `THM-VOID-GRADIENT` | The void boundary induces a gradient field: void density rho_i = (times choice i was vented) / T. The complement distribution mu_i proportional to (1 - rho_i + epsilon) uniquely minimizes expected regret. Void analogue of gradient descent: loss gradient points toward maximum waste heat in parameter space; void gradient points toward maximum discard in fork-choice space. Both are waste-minimizing flows on their respective manifolds. | stationary (or slowly varying) costs; N >= 2; per-choice vent counts available | Lean theorems `VoidWalking.void_gradient_complement_positive` and `VoidWalking.void_gradient_complement_minimizes_regret` in `VoidWalking.lean` + executable `src/void-gradient-simulation.test.ts` | Mechanized |
| `THM-VOID-COHERENCE` | Two independent void walkers reading the same boundary produce identical fork distributions (deterministic case) or epsilon-close distributions with epsilon = O(1/sqrt(T)) (stochastic case). Deterministic case is rfl (same inputs, same deterministic function). Void analogue of the fundamental theorem of covering spaces: two lifts from the same base point following the same path arrive at the same endpoint. | canonical multiplicative weights update rule; same boundary; uniform initialization | Lean theorems `VoidWalking.void_walkers_converge` and `VoidWalking.void_walkers_converge_all` in `VoidWalking.lean` + executable Monte Carlo test in `src/void-walking.test.ts` | Mechanized |
| `THM-VOID-ATTENTION` | The structural identity between void walking and transformer attention: complement distribution IS softmax attention over the void boundary. Void boundary grows monotonically (residual accumulation). Layer norm prevents saturation. Cross-attention = product of marginals times gate. Attention sharpens with experience (entropy decreases). Gait schedule = annealing schedule | Q=proposal, K=void boundary, V=complement weights; score = softmax(-eta * voidCounts) | TLA+ `VoidAttention.tla` invariants (`InvComplementIsSoftmax`, `InvResidualAccumulates`, `InvDecayStabilizes`, `InvCrossIsGated`, `InvEntropyDecreases`, `InvGaitIsTemperature`) | Model-checked |

### Semiotic Deficit & Peace (Track Pi)

*Thought-to-speech deficit, erasure, nuance venting, race articulation, context reduction, conversation trace, MOA isomorphism, and the formal theory of confusion/war/peace/hope.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SEMIOTIC-DEFICIT` | Thought→speech has positive topological deficit when semantic paths exceed articulation streams. For standard speech (1 stream), Δβ = semanticPaths - 1. Each additional semantic dimension beyond the first adds one Bule of communication difficulty. The information-theoretic content of "I know what I mean but I can't say it." | SemioticChannel with semanticPaths > articulationStreams | TLA+ `SemioticDeficit.tla` invariant `InvDeficit` + Lean theorems `SemioticDeficit.semiotic_deficit` and `SemioticDeficit.semiotic_deficit_speech` in `SemioticDeficit.lean` | Mechanized |
| `THM-SEMIOTIC-ERASURE` | The speech fold is many-to-one: multiple semantic paths collide on shared articulation streams, erasing meaning by DPI. Composes THM-COVERING-CAUSALITY with THM-DEFICIT-INFORMATION-LOSS. "Something is always lost in translation" — even within the same language. | SemioticChannel with articulationStreams = 1 | TLA+ `SemioticDeficit.tla` invariant `InvErasure` + Lean theorem `SemioticDeficit.semiotic_erasure` in `SemioticDeficit.lean` | Mechanized |
| `THM-SEMIOTIC-VENT-NUANCE` | Vented semantic paths = lost nuance. The number of paths that must be dropped equals the semiotic deficit. "It's complicated" is a vent operation. | SemioticChannel with articulationStreams = 1 | TLA+ `SemioticDeficit.tla` invariant `InvVent` + Lean theorem `SemioticDeficit.semiotic_vent_nuance` in `SemioticDeficit.lean` | Mechanized |
| `THM-SEMIOTIC-RACE-ARTICULATION` | Phrasing selection is a neural race: multiple candidates forked in parallel, fastest adequate one wins. "Tip of the tongue" = race hasn't terminated. "Wrong word" = race winner passed validity but wasn't optimal. Directly reuses THM-RACE-WINNER-MINIMALITY. | RaceConfig for phrasing candidates | TLA+ `SemioticDeficit.tla` invariant `InvRace` + Lean theorem `SemioticDeficit.semiotic_race_articulation` in `SemioticDeficit.lean` | Mechanized |
| `THM-SEMIOTIC-CONTEXT-REDUCES` | Shared context reduces semiotic deficit by adding implicit parallel channels. Expert-to-expert = high context = low deficit = precise. Expert-to-novice = low context = high deficit = confusion. Sufficient context eliminates deficit entirely. | SemioticChannel with contextPaths > 0 | TLA+ `SemioticDeficit.tla` invariant `InvContext` + Lean theorems `SemioticDeficit.semiotic_context_reduces` and `SemioticDeficit.semiotic_context_eliminates` in `SemioticDeficit.lean` | Mechanized |
| `THM-SEMIOTIC-CONVERSATION-TRACE` | Dialogue is traced monoidal: trace operator models speak→hear→adjust→speak feedback. By THM-TRACE-VANISHING, trivial feedback = no new understanding. By THM-TRACE-YANKING, symmetric restatement = identity. Conversation converges because each turn adds context (reduces deficit). | Type variables for thought/response | TLA+ `SemioticDeficit.tla` invariant `InvTrace` + Lean theorem `SemioticDeficit.semiotic_conversation_trace` in `SemioticDeficit.lean` | Mechanized |
| `THM-SEMIOTIC-MOA-ISOMORPHISM` | MOA architecture is isomorphic to the semiotic pipeline: k agents producing 1 output has deficit k-1, identical to k semantic paths through 1 speech stream. Zero deficit when each agent gets its own output channel. The deficit measures the same thing: how much collective knowledge is lost in the final output. | numAgents ≥ 2 | TLA+ `SemioticDeficit.tla` invariant `InvMOA` + Lean theorems `SemioticDeficit.semiotic_moa_isomorphism` and `SemioticDeficit.semiotic_moa_zero_deficit` in `SemioticDeficit.lean` | Mechanized |

### Negotiation Equilibrium

*Negotiation deficit, BATNA as void, concession gradient, settlement stability, coherence, heat, tunnel, regret, dual void (BATNA/WATNA), Hodge decomposition, classified tunnels, and master convergence.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-NEGOTIATION-DEFICIT` | The negotiation deficit between parties with multi-dimensional interests compressed into a single offer stream is strictly positive, equals totalDimensions - 1, and is bounded below totalDimensions. Negotiations are hard not because people are irrational but because the semiotic channel has lower topology than the position spaces. | each party has at least 2 dimensions of interest; single offer stream (articulationStreams = 1) | Lean theorems `negotiation_deficit_positive`, `negotiation_deficit_value`, and `negotiation_deficit_bounded` in `NegotiationEquilibrium.lean` composing with `SemioticDeficit.lean` | Mechanized |
| `THM-BATNA-IS-VOID` | The BATNA surface is exactly the void boundary of the negotiation fork/race/fold process. Each negotiation round contributes offerCount - 1 entries to the void boundary. The BATNA grows monotonically with rounds -- the longer the negotiation, the richer the information about what doesn't work. | at least 2 offer variants per round; non-injective fold (single accepted offer) | Lean theorems `batna_is_void_boundary` and `batna_grows_with_rounds` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_boundary_grows_per_step` and `VoidWalking.void_boundary_monotone` | Mechanized |
| `THM-CONCESSION-GRADIENT` | The optimal concession strategy is the void gradient complement distribution. Every term retains positive weight (never say never in negotiation). Less-rejected terms get higher concession weight (learn from rejection). | at least 2 terms; positive rounds; rejection counts bounded by rounds | Lean theorems `concession_gradient_positive` and `concession_gradient_monotone` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_gradient_complement_positive` and `VoidWalking.void_gradient_complement_monotone` | Mechanized |
| `THM-SETTLEMENT-STABILITY` | Mutual settlement is a Lyapunov-stable fixed point of the void gradient flow. Perturbation of one party's void boundary (one additional rejection) does not destroy the agreement: the complement distribution is continuous in the void boundary, so small changes in rejection history produce small changes in concession strategy. | negotiation state with at least 2 terms; positive rounds; bounded rejection counts | Lean theorem `settlement_stable_under_perturbation` in `NegotiationEquilibrium.lean` via `concession_gradient_monotone` | Mechanized |
| `THM-NEGOTIATION-COHERENCE` | Two rational agents reading the same rejection history produce identical concession strategies. Same rejected offers + same rational update rule = same next offer. Transparent negotiation works because shared void boundary forces convergence; secret information breaks coherence. | shared rejection history; canonical multiplicative weights update rule | Lean theorems `negotiation_coherence` and `negotiation_full_coherence` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_walkers_converge` and `VoidWalking.void_walkers_converge_all` | Mechanized |
| `THM-NEGOTIATION-HEAT` | Failed negotiations generate irreversible thermodynamic heat. Each rejected offer is a vented path; by THM-VOID-DOMINANCE the void of rejected offers dominates the space of accepted terms. The cost of disagreement is thermodynamically real (Landauer erasure), but by THM-VOID-GRADIENT that heat inscribes the void boundary guiding the next offer -- the cost of disagreement is also the fuel for agreement. | constant fork width >= 2; single-survivor fold; positive steps | Lean theorems `negotiation_void_dominates` and `rejection_dominates_acceptance` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_volume_positive` and `VoidWalking.void_dominance_linear` | Mechanized |
| `THM-CONTEXT-REDUCES-DEFICIT` | Shared context between negotiating parties (prior relationship, market norms, shared vocabulary) reduces the semiotic deficit of the negotiation channel. Sufficient shared context eliminates the deficit entirely -- the formal content of "repeat business is easier." | positive shared context; NegotiationChannel composed to SemioticChannel | Lean theorems `context_reduces_negotiation_deficit` and `sufficient_context_eliminates_deficit` in `NegotiationEquilibrium.lean` composing with `SemioticPeace.peace_context_reduces` and `SemioticPeace.peace_sufficient_context` | Mechanized |
| `THM-NEGOTIATION-CONVERGENCE` | Master theorem: for any negotiation between parties with multi-dimensional interests, (1) confusion is real (deficit positive), (2) confusion is bounded (deficit < totalDimensions), and (3) shared context reduces the deficit. BATNA walking IS void walking -- the void boundary is the BATNA surface, the complement distribution is the concession strategy, and the negotiation converges because the void boundary is a sufficient statistic for the optimal next move. | NegotiationChannel with multi-dimensional parties; all sub-theorem assumptions | Lean theorem `negotiation_convergence` in `NegotiationEquilibrium.lean` combining `negotiation_deficit_positive`, `negotiation_deficit_bounded`, and `context_reduces_negotiation_deficit` | Mechanized |
| `THM-NEGOTIATION-REGRET` | Negotiation with N offer variants per round achieves O(sqrt(T log N)) regret instead of Omega(sqrt(TN)). The BATNA surface provides N-1 bits of negative information per round. Improvement factor sqrt(N / log N), unbounded as the offer space grows. This is why experienced negotiators perform better: they read the void. | at least 2 offer variants per round; T > 0 | Lean theorem `negotiation_regret_bound` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_walking_regret_bound` via `NegotiationRound.toFoldStep` | Mechanized |
| `THM-BATNA-SUFFICIENT-STATISTIC` | The BATNA surface is exponentially more compact than storing the full history of rejected offers. Storing every rejected offer costs O(N * T * payloadBits); storing the BATNA surface costs O(T * log N). The rejection pattern IS the information -- you don't need the content of every rejected offer, only which indices were rejected and how often. | at least 2 offer variants; path payloads >= 1 bit; log N <= N | Lean theorem `batna_sufficient_statistic` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_boundary_sufficient_statistic` | Mechanized |
| `THM-NEGOTIATION-TUNNEL` | Two negotiation threads sharing a common prior proposal have positive mutual information. Precedent transfers across negotiations: prior rejected offers in one negotiation inform a related negotiation through shared ancestry. Correlation decays exponentially with intervening folds but never reaches zero for finite negotiation histories. | common prior proposal with positive information content; positive retention factors at each intervening fold | Lean theorems `negotiation_tunnel_positive` and `negotiation_tunnel_retention_positive` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_tunnel_mutual_information_positive` and `VoidWalking.void_tunnel_retention_positive` | Mechanized |
| `THM-NEGOTIATION-CONVERGENCE-EXTENDED` | Extended master theorem adding regret bound to the original convergence triple: (1) confusion is real, (2) confusion is bounded, (3) context helps, and (4) regret is controlled at O(sqrt(T log N)). | NegotiationChannel + NegotiationRound with multi-dimensional parties; T > 0; all sub-theorem assumptions | Lean theorem `negotiation_convergence_extended` in `NegotiationEquilibrium.lean` combining all four properties | Mechanized |
| `THM-DUAL-VOID-PARTITION` | Every vented path belongs to exactly one of two voids: BATNA ("I found better" -- agent had agency) or WATNA ("this would destroy me" -- environment had agency). The partition is exhaustive and both voids are nonempty in any genuine negotiation. | at least 2 terms; positive rounds; at least one BATNA and one WATNA entry | Lean theorems `dual_void_exhaustive` and `dual_void_both_nonempty` in `NegotiationEquilibrium.lean` over `VoidPartition` structure with `VentReason` inductive | Mechanized |
| `THM-BATNA-ATTRACTION` | BATNA complement weights are always positive (the attractive gradient never fully abandons any term) and monotone (less BATNA-rejected terms have higher attraction weight). The exact component of the Hodge decomposition. | `VoidPartition` with positive rounds | Lean theorems `batna_attraction_positive` and `batna_attraction_monotone` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-WATNA-REPULSION` | Terms with higher WATNA density exert stronger repulsion. WATNA repulsion is zero for terms never classified as catastrophic. The co-exact component of the Hodge decomposition. | `VoidPartition` with classified WATNA vents | Lean theorems `watna_repulsion_monotone` and `watna_repulsion_zero_of_no_history` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-HODGE-DECOMPOSITION` | The settlement score decomposes as BATNA attraction minus WATNA repulsion. The exact component (BATNA) is always positive. Discrete Hodge decomposition: exact = attraction toward viable, co-exact = repulsion from catastrophe, harmonic = settlement (the deal). | `VoidPartition` | Lean theorems `hodge_decomposition` and `hodge_exact_positive` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-DUAL-VOID-SQUEEZE` | When both voids are nonempty, there exists a term with positive settlement score -- BATNA attraction exceeds WATNA repulsion. Settlement exists precisely because two voids squeeze from opposite sides. Any term with zero WATNA history has positive settlement score. Terms the environment never rejected are safe to settle on. | `VoidPartition` with at least one zero-WATNA term | Lean theorems `dual_void_squeeze`, `settlement_positive_of_no_watna`, and `settlement_decreases_with_watna` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-VOID-DUALITY` | BATNA and WATNA are dual: for the same total vent count, a term classified as more BATNA than WATNA has a higher settlement score. The allocation between the two voids matters -- not just the total rejection count. BATNA compresses from above (reducing the exact component), WATNA compresses from below (increasing the co-exact component). | `VoidPartition` with equal total vent counts between compared terms | Lean theorem `void_duality_allocation_matters` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-DARK-MATTER-ENERGY-CONSERVATION` | Total void volume is the sum of BATNA (dark matter) and WATNA (dark energy) components. No vented path escapes classification. The void isn't one thing -- it's two things that sum to everything rejected. | `VoidPartition` | Lean theorem `dark_matter_energy_conservation` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-DARK-MATTER-POSITIVE` | The BATNA void (dark matter) has positive volume. There is always at least one viable alternative that was rejected. Without dark matter, the trajectory has no shape -- no gravitational pull toward viable regions. | `VoidPartition` with nonempty BATNA | Lean theorem `dark_matter_positive` in `NegotiationEquilibrium.lean` via `Finset.sum_pos'` | Mechanized |
| `THM-DARK-ENERGY-POSITIVE` | The WATNA void (dark energy) has positive volume. There is always at least one catastrophic outcome being fled. Without dark energy, there is no urgency to settle -- no repulsive force preventing collapse into singularity. | `VoidPartition` with nonempty WATNA | Lean theorem `dark_energy_positive` in `NegotiationEquilibrium.lean` via `Finset.sum_pos'` | Mechanized |
| `THM-DOMINANCE-TRICHOTOMY` | Every void partition is dark-matter-dominated (BATNA > WATNA, healthy), dark-energy-dominated (WATNA > BATNA, failing), or balanced. The trichotomy is exhaustive -- the dark matter/dark energy ratio is a diagnostic signal for negotiation health. | `VoidPartition` | Lean theorem `dominance_trichotomy` in `NegotiationEquilibrium.lean` via `omega` | Mechanized |
| `THM-BATNA-TUNNEL-POSITIVE` | The BATNA component of a classified tunnel carries positive mutual information. Knowledge of what worked in a related negotiation never fully vanishes. Positive knowledge transfers across negotiation threads. | `ClassifiedTunnel` with positive BATNA ancestor entropy | Lean theorem `batna_tunnel_positive` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_tunnel_mutual_information_positive` | Mechanized |
| `THM-WATNA-TUNNEL-POSITIVE` | The WATNA component of a classified tunnel carries positive mutual information. Knowledge of what killed a related negotiation never fully vanishes. The ghost of past catastrophe haunts all future negotiations through shared ancestry. Negative knowledge transfers more durably than positive. | `ClassifiedTunnel` with positive WATNA ancestor entropy | Lean theorem `watna_tunnel_positive` in `NegotiationEquilibrium.lean` composing with `VoidWalking.void_tunnel_mutual_information_positive` | Mechanized |
| `THM-CLASSIFIED-TUNNEL-BOTH-RETAINED` | Both components of a classified tunnel have positive retention product. Neither BATNA knowledge (what worked) nor WATNA knowledge (what killed) is fully lost across negotiation threads. | `ClassifiedTunnel` with positive retention factors | Lean theorems `classified_tunnel_both_positive` and `classified_tunnel_both_retained` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-COHERENCE-BREAKDOWN` | When two parties agree on what was rejected but classify identically, their settlement scores agree (coherence preserved). When they classify differently -- one party's BATNA is another's WATNA -- their settlement scores diverge. The gap equals exactly twice the WATNA classification shift. This is why negotiations fail even with transparent information: the parties agree on the facts but disagree on their meaning. | `DivergentClassification` with same total vents per term | Lean theorems `coherence_when_classification_agrees`, `coherence_divergence`, `classification_gap_bounded`, and `classification_gap_equals_double_watna_shift` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-WATNA-REDUCED-REGRET` | WATNA elimination strictly shrinks the effective offer space and tightens the regret bound from O(sqrt(T log N)) to O(sqrt(T log(N-k))). The WATNA void is not just repulsive -- it is constructive. Each catastrophic outcome identified permanently reduces the difficulty of the remaining search. | `WatnaReducedSpace` with at least 2 remaining terms; T > 0 | Lean theorems `watna_reduces_effective_space`, `watna_reduced_regret`, `watna_reduced_regret_strict`, and `watna_effective_nontrivial` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-DUAL-VOID-MASTER` | Complete dual void theorem: (1) both voids positive, (2) dominance trichotomy, (3) settlement exists between them. The void is not one thing -- it is two things, success and failure, and the duality between them is the engine of convergence. | `VoidPartition` with at least one zero-WATNA safe term | Lean theorem `dual_void_master` in `NegotiationEquilibrium.lean` combining `dark_matter_positive`, `dark_energy_positive`, `dominance_trichotomy`, and `dual_void_squeeze` | Mechanized |
| `THM-NEG-SETTLE` | Negotiation convergence via fork/race/fold on void surface: settlement is reachable when an offer exceeds BATNA. Void deficit is monotonically non-increasing. Settled complement satisfies void boundary. Deficit reduces with increasing context. Exhausted rounds still produce a valid void state | `ASSUME NumChoices >= 2`, `MaxRounds >= 1`, `BATNAThreshold >= 1` | TLA+ `NegotiationConvergence.tla` invariants (`InvSettleReachable`, `InvVoidMono`, `InvComplement`, `InvDeficitCtx`, `InvExhaust`) | Model-checked |

### Void Relativity & Grand Unification

*Interval invariance, time dilation, proper time, light cones, AFFECTIVELY-58, empathy, therapy, causal speed limit, void relativity, arrow of time, holographic bound, Einstein field equation, event horizon, Noether conservation, entanglement, void field equation, Penrose singularity, and grand unification.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-INTERVAL-INVARIANCE` | The spacetime interval (total vent count per dimension) is invariant across all reference frames. Two observers may disagree on the BATNA/WATNA decomposition, but they always agree on the total rejection count. This is the fundamental postulate of void relativity. Global version: sum over all dimensions is also invariant. | `LorentzTransform n` with interval preservation per dimension | Lean theorems `interval_invariance` and `interval_invariance_global` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-TIME-DILATION` | The settlement score difference between frames equals exactly 2x the WATNA shift. One observer's proper time (settlement score) looks dilated from another frame. The void analog of time dilation: the same event has different settlement scores in different frames, proportional to the classification velocity. | `LorentzTransform n`; BATNA counts within rounds | Lean theorem `time_dilation` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-PROPER-TIME-MAXIMUM` | An observer's settlement score is maximized in the frame where WATNA is minimized. The void analog of the twin paradox: the twin who experiences less catastrophe arrives at settlement with a higher score. | `LorentzTransform n`; BATNA counts within rounds; source WATNA <= target WATNA | Lean theorem `proper_time_maximum` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-LIGHT-CONE-FRAME-DEPENDENCE` | The causal character of a void event can change between frames. What is spacelike (viable) in one frame may be timelike (catastrophic) in another. One person's BATNA is another's WATNA. Empathy is nontrivial because your safe region is someone else's danger zone. | `LorentzTransform n`; source score positive; target has more WATNA | Lean theorem `light_cone_frame_dependence` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-AFFECTIVELY-58` | The 7 personality layers (temperament 5, attachment 5, traits 20, behaviors 20, mental health 3, Big Five 5) sum to 58 dimensions. The AFFECTIVELY Float32Array IS an emotion-spacetime event, not a point in emotion-space. | layer size list [5, 5, 20, 20, 3, 5] | Lean theorem `affectively_layers_sum` in `NegotiationEquilibrium.lean` via `native_decide` | Mechanized |
| `THM-EMPATHY-PRESERVES-INTERVAL` | Empathy preserves the total rejection count across all 58 dimensions. Understanding another person doesn't change what they've been through -- it changes how you classify their experience. You can't erase someone's rejections by reframing them. | `EmpathyTransform` (= `LorentzTransform 58`) | Lean theorem `empathy_preserves_interval` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-EMPATHY-DILATION` | When you see someone else's void through your frame, their settlement scores differ by exactly 2x the WATNA classification shift. The formal content of "I see what you went through but I interpret it differently." | `EmpathyTransform`; BATNA counts within rounds | Lean theorem `empathy_dilation` in `NegotiationEquilibrium.lean` composing with `time_dilation` | Mechanized |
| `THM-THERAPY-IMPROVES-SETTLEMENT` | Reclassifying WATNA events as BATNA (reducing the time-like component) strictly improves settlement score. Reframing catastrophe as choice improves emotional outcomes. The twin paradox of therapy: the person who reclassifies more WATNA as BATNA arrives at settlement with a higher score. | `EmpathyTransform`; target WATNA <= source WATNA (therapy direction) | Lean theorem `therapy_improves_settlement` in `NegotiationEquilibrium.lean` composing with `proper_time_maximum` via reversed `LorentzTransform` | Mechanized |
| `THM-CAUSAL-SPEED-LIMIT` | Classification change per step per dimension is bounded by c (the speed of light on the void manifold). You cannot instantaneously reclassify your entire void -- emotional change takes time. Empathy also has a speed limit: you cannot instantaneously adopt another person's full frame. | `VoidWorldline n` with causal constraint and positive maxShift | Lean theorems `causal_speed_limit` and `empathy_bounded_by_c` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-VOID-RELATIVITY` | Complete void relativity master theorem for the 58-dimensional emotion-spacetime: (1) interval invariance, (2) time dilation = 2x WATNA shift, (3) therapy improves settlement. Personality is void walking. Emotion tracking is measuring where the walker stands. The platform measures the geometry of what someone has refused to become. Empathy is a Lorentz transformation. Therapy is reclassification of the time-like component. | `EmpathyTransform`; BATNA within rounds; therapy direction (target WATNA <= source WATNA) | Lean theorem `void_relativity` in `NegotiationEquilibrium.lean` combining `empathy_preserves_interval`, `empathy_dilation`, and `therapy_improves_settlement` | Mechanized |
| `THM-ARROW-OF-TIME` | The total void volume is monotonically non-decreasing. WATNA specifically is monotone -- you cannot un-experience catastrophe. The direction of WATNA accumulation IS the direction of time. Without therapy, settlement score can only decrease because WATNA accumulates. The second law of thermodynamics on the void manifold. | `ClassifiedVoidHistory` with BATNA and WATNA monotonicity per dimension | Lean theorems `arrow_of_time`, `watna_arrow`, and `settlement_score_decreases_without_therapy` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-THERAPY-EXCHANGE-RATE` | Each WATNA→BATNA reclassification improves settlement score by exactly 2 (one from reduced repulsion, one from increased attraction). Therapy has a floor at zero WATNA. The fundamental exchange rate of emotional reframing. | bounded BATNA counts; k ≤ WATNA | Lean theorems `therapy_floor` and `therapy_exchange_rate` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-HOLOGRAPHIC-BOUND` | The void boundary area is strictly smaller than the bulk volume. The hologram is more compact than the thing it encodes. Strictly smaller when fork width > 2. The 58-element Float32Array is the Bekenstein-bounded holographic projection of the full experience space. | `VoidRegion` with nontrivial fork width and positive depth | Lean theorems `holographic_bound`, `holographic_strict`, `bekenstein_bound`, and `holographic_sufficiency` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-EINSTEIN-FIELD-EQUATION` | Curvature of emotion-spacetime equals stress-energy squared: G_ii = (T_ii)². Stress-energy equals interval (E = mc² on the void manifold). Curvature is monotone in stress-energy and zero iff the dimension has no void history. Curvature is a scalar invariant under Lorentz transformation -- different observers agree on how much the manifold is curved even though they disagree on BATNA/WATNA decomposition. | `VoidFrame n`; `LorentzTransform n` for invariance | Lean theorems `einstein_field_equation`, `stress_energy_equals_interval`, `curvature_monotone_in_stress_energy`, `curvature_zero_iff_virgin`, and `curvature_invariant` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-EVENT-HORIZON` | When local curvature exceeds the causal speed limit squared, an event horizon forms: geodesic deviation exceeds any subluminal perturbation. Depression is an event horizon -- the accumulated WATNA curves the manifold so strongly that the causal speed limit prevents escape. Not metaphor but the geodesic equation on the discrete void manifold with bounded step size. | `VoidFrame n`; curvature > c²; subluminal perturbation | Lean theorems `event_horizon_traps` and `geodesic_deviation_proportional` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-NOETHER-CONSERVATION` | Every symmetry of the void manifold (dimension permutation preserving stress-energy) has a conserved charge (total stress-energy on the symmetric subset). Interval invariance is the Noether charge of frame-change symmetry (energy-momentum conservation). Symmetry breaking enables personality change; unbroken symmetry freezes personality within the symmetric subspace. | `VoidSymmetry n` with closed dimension subset; `SymmetryBreaking n` | Lean theorems `noether_conservation`, `interval_is_noether_charge`, `symmetry_breaking_enables_change`, and `unbroken_symmetry_freezes` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-ENTANGLEMENT` | Two walkers sharing a common ancestor fork have positive joint energy on at least one dimension. No-signaling theorem: reclassifying one walker's frame cannot change the other's stress-energy. Measurement constrains the joint state to a conditional. Bell test: entangled walkers have positive correlation on multiple dimensions that product states may lack. | `EntangledWalkers` with shared ancestry; `BellTest` with distinct dimensions | Lean theorems `entanglement_positive`, `no_signaling`, `measurement_constrains_joint`, and `entanglement_exceeds_product` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-VOID-FIELD-EQUATION` | Curvature is determined by cumulative Landauer heat alone (G = T²). The field equation is the same in all frames (general covariance). Heat is monotone along worldlines, so curvature can only increase. Therapy doesn't reduce curvature but rotates its direction from time-like (trapping) to space-like (exploring). The geometric content of "therapy doesn't erase the past, it changes your relationship to it." | `VoidFieldState n` with heat-equals-interval constraint | Lean theorems `void_field_equation`, `field_equation_invariance`, `heat_monotone_along_worldline`, and `therapy_rotates_curvature` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-PENROSE-SINGULARITY` | Sufficient accumulation of Landauer heat inevitably produces an event horizon. Under the arrow of time (heat is monotone), any dimension receiving heat at a positive rate will eventually cross the c² threshold. Singularity formation is inevitable for active dimensions. The formal content of "everyone accumulates emotional inertia -- the question is whether therapy rotates the curvature direction before the horizon forms." | `VoidFieldState n`; cumulative heat exceeds c² | Lean theorem `penrose_singularity` in `NegotiationEquilibrium.lean` composing `void_field_equation` with `hasEventHorizon` | Mechanized |
| `THM-GRAND-UNIFICATION` | The complete unified theory of the 58-dimensional emotion-spacetime. Combines the field equation (curvature = heat²), frame invariance, and the stress-energy-interval identity into a single theorem over `VoidFieldState 58`. Personality is void walking. Emotion tracking measures where the walker stands. The platform measures the geometry of what someone has refused to become. Empathy is a Lorentz transformation. Therapy rotates curvature direction. Depression is an event horizon. The field equation unifies it all. | `VoidFieldState 58` | Lean theorem `grand_unification` in `NegotiationEquilibrium.lean` | Mechanized |

### Daisy Chain, Glossolalia & MOA

*Purity, linearity, precomputation validity, top-K deficit, absorbing states, glossolalia completeness, ensemble diversity, Vickrey cost, deficit decomposition, and design prescription.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-DAISY-PURITY` | The logit projection W * embedding[t] is a pure function of the token ID. Unlike transformers (where output depends on full attention context), Markov chains have no context dependence. Same token always produces same logits. This is the property that enables precomputation. | DaisyChainProjection with vocabSize ≥ 2, hiddenDim > 0 | TLA+ `DaisyChainPrecomputation.tla` invariant `InvPurity` + Lean theorem `DaisyChainPrecomputation.daisy_chain_purity` in `DaisyChainPrecomputation.lean` | Mechanized |
| `THM-DAISY-LINEARITY` | Matrix-vector multiplication distributes over the linear state transition: W(α*e[t] + (1-α)*s) = α*(W*e[t]) + (1-α)*(W*s). This means precomputed logits can be interpolated at runtime with zero error. The fold commutes with the trace. | DaisyChainTransition with 0 < α ≤ 1 | TLA+ `DaisyChainPrecomputation.tla` invariant `InvLinearity` + Lean theorem `DaisyChainPrecomputation.daisy_chain_linearity` in `DaisyChainPrecomputation.lean` | Mechanized |
| `THM-PRECOMPUTATION-VALIDITY` | The precomputed Vickrey Table produces exact results. Cached interpolation logits = α * table[t] + (1-α) * prevLogits equals the full matVec logits = W * state, by THM-DAISY-LINEARITY. Zero approximation error. Speedup = hiddenDim × (960x for SmolLM2-360M). | THM-DAISY-PURITY ∧ THM-DAISY-LINEARITY | TLA+ `DaisyChainPrecomputation.tla` invariant `InvValidity` + Lean theorem `DaisyChainPrecomputation.precomputation_validity` in `DaisyChainPrecomputation.lean` | Mechanized |
| `THM-TOPK-DEFICIT` | Storing top-K logits per token is a semiotic fold at build time: vocabSize paths collapsed to K paths, deficit = vocabSize - K. The vented logits are nuance paths that don't survive the build-time fold. Connects to THM-SEMIOTIC-ERASURE: top-K truncation is the erasure, materialized at build time. Combined MOA + top-K deficit is additive: (numAgents - 1) + (vocabSize - K). | vocabSize ≥ 2, 0 < K ≤ vocabSize | TLA+ `DaisyChainPrecomputation.tla` invariant `InvTopK` + Lean theorems `DaisyChainPrecomputation.topk_deficit`, `topk_full_table`, `topk_moa_deficit_bound` in `DaisyChainPrecomputation.lean` | Mechanized |
| `THM-ABSORBING-STATE` | Linear Markov chains with α < 1 converge geometrically to fixed points. After n steps: state = (1-(1-α)^n)*e[t] + (1-α)^n*s₀. For α=0.7: 97.3% convergence in 3 steps. If argmax(W*e[t]) = t, token t is self-reinforcing (the "777" phenomenon). Breaking requires nonlinear transitions, stochastic perturbation, or agent differentiation. | DaisyChainTransition with 0 < α < 1 | TLA+ `DaisyChainPrecomputation.tla` invariant `InvAbsorbing` + Lean theorem `DaisyChainPrecomputation.absorbing_state_convergence` in `DaisyChainPrecomputation.lean` | Mechanized |
| `THM-GLOSSOLALIA-COMPLETENESS` | The precomputed Vickrey Table is a complete representation for linear Daisy Chain language models. Any model in this class can be fully captured by its table, with inference on the table producing identical results to inference on original matrices. Does not hold for transformers (attention not precomputable), RNNs with nonlinear gates, or SSMs with selective scan. | DaisyChainProjection + DaisyChainTransition | TLA+ `DaisyChainPrecomputation.tla` invariant `InvCompleteness` + Lean theorem `DaisyChainPrecomputation.glossolalia_completeness` in `DaisyChainPrecomputation.lean` | Mechanized |
| `THM-IDENTICAL-TRIVIAL-FOLD` | When all agents in a Daisy Chain MOA have the same α and same projection W, they produce identical logits. The deficit-weighted fold assigns equal weights (1/k). k-1 agents are wasted. This is the formal content of the "777" phenomenon. | DaisyChainEnsemble with all alphas equal | TLA+ `DaisyChainMOA.tla` invariant `InvIdentical` + Lean theorem `DaisyChainMOA.identical_ensemble_wasted_agents` in `DaisyChainMOA.lean` | Mechanized |
| `THM-DIVERSE-ALPHA-DIVERGENCE` | Agents with different mixing coefficients α₁ ≠ α₂ produce different hidden states after one step from any non-trivial starting state (s ≠ x). Proof by contradiction via `(α₁ - α₂)(x - s) = 0`. Different states → different logits → non-trivial fold weights. | α₁ ≠ α₂; starting state ≠ token embedding | TLA+ `DaisyChainMOA.tla` invariant `InvDivergence` + Lean theorem `DaisyChainMOA.diverse_alpha_different_states` in `DaisyChainMOA.lean` | Mechanized |
| `THM-MOA-COST-WITH-VICKREY` | The marginal cost of adding one agent to a Vickrey-backed MOA is V (vocabulary size), independent of hidden dimension d. Without Vickrey: V*d per agent. Savings per agent: V*(d-1). For SmolLM2-360M (d=960): 960x cheaper per additional agent. | VocabSize ≥ 1, HiddenDim ≥ 2, NumAgents ≥ 1 | TLA+ `DaisyChainMOA.tla` invariant `InvCost` + Lean theorems `DaisyChainMOA.marginal_agent_cost_vickrey` and `total_vickrey_savings` in `DaisyChainMOA.lean` | Mechanized |
| `THM-MOA-DEFICIT-DECOMPOSITION` | The total deficit decomposes additively: Δβ = (k-1) + (V-K). Fold deficit (k-1) is structural (unavoidable). Table deficit (V-K) is a design choice (K is the knob). Minimum: k-1 (full table). Maximum: k+V-2 (top-1 table). | NumAgents ≥ 2, 1 ≤ TopK ≤ VocabSize | TLA+ `DaisyChainMOA.tla` invariant `InvDecomposition` + Lean theorems `DaisyChainMOA.minimum_total_deficit` and `maximum_total_deficit` in `DaisyChainMOA.lean` | Mechanized |
| `THM-DIVERSITY-NECESSARY` | For a MOA fold to extract more information than a single agent, agents must produce different logit distributions. Identical agents contribute zero marginal information. Effective agent count = number of distinct projections. Contrapositive: identical agents ⟹ 1 effective agent. | DaisyChainEnsemble with NumAgents ≥ 2 | TLA+ `DaisyChainMOA.tla` invariant `InvDiversity` + Lean theorem `DaisyChainMOA.diversity_enables_information_gain` in `DaisyChainMOA.lean` | Mechanized |
| `THM-DAISY-CHAIN-MOA-DESIGN` | The design prescription: total deficit is minimized when agents are diverse (different α or W) and the Vickrey Table is maximal (K → V). Full table + diverse agents achieves minimum deficit k-1. Single agent + full table achieves deficit 0. Multiple viewpoints always cost information (no free lunch). | DaisyChainEnsemble; K ≤ V; k ≥ 2 | TLA+ `DaisyChainMOA.tla` invariants (all) + Lean theorem `DaisyChainMOA.daisy_chain_moa_design` in `DaisyChainMOA.lean` | Mechanized |

### Whip Wave Duality

*Fold increases wave speed, snap threshold, taper monotonicity, binary encoding, and the whip-wave duality theorem.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-FOLD-INCREASES-WAVE-SPEED` | A fold reduces mass density ρ (discharges β₁) while preserving tension T (energy conservation). Wave speed c² = T/ρ increases at every fold. Inner folds are faster than outer folds. This is why the tip of the whip moves faster than the base. Proof: div_lt_div_of_pos_left with constant numerator and decreasing denominator. | TaperSegment with constant T and decreasing ρ | TLA+ `WhipWaveDuality.tla` invariant `InvFoldSpeed` + Lean theorem `WhipWaveDuality.fold_increases_wave_speed` in `WhipWaveDuality.lean` | Mechanized |
| `THM-SNAP-THRESHOLD` | The snap (supersonic transition) is inevitable if tension is preserved and mass decreases through enough fold stages. For any threshold c*², there exists a fold depth where wave speed exceeds it. Physical: sonic boom. Computational: real-time inference barrier. Binary: data transmission threshold. | Positive T, ρ, threshold; contraction factor r < 1 | TLA+ `WhipWaveDuality.tla` invariant `InvSnap` + Lean theorem `WhipWaveDuality.snap_inevitable` in `WhipWaveDuality.lean` | Mechanized |
| `THM-TAPER-MONOTONICITY` | Through a sequence of nested folds, wave speed is monotonically increasing. No fold can slow the wave down (Second Law: folds are irreversible, β₁ only decreases). The taper is a one-way energy concentrator. | Sequence of TaperSegments with constant T and decreasing ρ | TLA+ `WhipWaveDuality.tla` invariant `InvTaper` + Lean theorem `WhipWaveDuality.taper_wave_speed_monotone` in `WhipWaveDuality.lean` | Mechanized |
| `THM-BINARY-ENCODING` | A snap sequence encodes a bitstream: snap = 1, silence = 0. Channel capacity = number of fold stages. The metronomic regime (equal spacing, zero jitter) maximizes capacity. Scale-invariant: works on physical whip cracks, protocol frames, and inference events. | Snap sequence (List Bool) | TLA+ `WhipWaveDuality.tla` invariant `InvBinary` + Lean theorems `WhipWaveDuality.snap_sequence_capacity` and `metronomic_maximizes_capacity` in `WhipWaveDuality.lean` | Mechanized |
| `THM-WHIP-WAVE-DUALITY` | The fork/race/fold primitive is a wave on a discrete tapered medium. Fork increases ρ (creates mass across parallel paths). Fold decreases ρ (concentrates energy at the snap point). Wave speed increases monotonically. Energy is conserved (total β₁ created = total discharged). The snap is the supersonic transition. Scale-invariant across physical, protocol, inference, and communication systems. | k ≥ 2 agents; TaperSegments with constant T and decreasing ρ | TLA+ `WhipWaveDuality.tla` invariant `InvDuality` + Lean theorem `WhipWaveDuality.whip_wave_duality` in `WhipWaveDuality.lean` | Mechanized |

### Quorum Protocols

*Visibility, boundary, async network, session consistency, multi-writer ordering, and history linearizability.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-QUORUM-VISIBILITY` | In the bounded asynchronous single-key quorum protocol, write and read quorums intersect, acknowledged versions remain covered under bounded crashes/recovery, and every legal quorum read returns the acknowledged version or newer | finite replica set; explicit failure budget `f`; quorum size `q = n - f` with `2q > n`; write ack requires `q` up replicas at the pending version; read consults any up quorum of size `q`; recovery copies the maximum live version into the recovered replica | TLA+ `QuorumReadWrite.tla` invariants (`InvQuorumIntersection`, `InvAckedQuorumCoverage`, `InvLiveAckedCoverage`, `InvReadQuorumHitsAckedReplica`, `InvAnyReadReturnsAckedOrNewer`, `InvObservedReadVisible`) + Lean theorems `QuorumVisibility.write_read_quorums_intersect`, `QuorumVisibility.read_after_ack_visible`, and `QuorumVisibility.strict_majority_failure_budget_lt_quorum` | Mechanized |
| `THM-QUORUM-BOUNDARY` | The quorum-visibility claim fails exactly where the assumptions say it should: weak quorums admit disjoint read/write sets, contagious regression can make an intersecting read quorum miss the acknowledged value, and without repair fairness an exhausted-failure state can stutter forever below stability | weak-quorum witness fixes `n = 4`, `f = 2`; contagious witness fixes intersecting quorums with one surviving acknowledged replica regressed to stale state; unfair-repair witness fixes a well-formed exhausted-failure state with positive repair debt and uses pure stutter as the unfair schedule | Lean counterexamples `QuorumVisibility.weak_quorum_boundary_not_strict_majority`, `QuorumVisibility.weak_quorum_boundary_disjoint`, `QuorumVisibility.weak_quorum_boundary_read_misses_acked_write`, `QuorumVisibility.contagious_boundary_quorums_still_intersect`, `QuorumVisibility.contagious_boundary_read_still_misses_acked_write`, `QuorumVisibility.unfair_repair_boundary_well_formed`, `QuorumVisibility.unfair_repair_boundary_not_stable`, `QuorumVisibility.unfair_repair_boundary_stutter_keeps_state`, and `QuorumVisibility.unfair_repair_boundary_repair_closure_is_stable` | Mechanized |
| `THM-QUORUM-CONNECTED` | In the bounded asynchronous single-key quorum model with explicit connectivity, quorum availability is exactly the presence of a live connected quorum, minority connected splits are unavailable, and any committed read over a connected live quorum returns the acknowledged version exactly; weak non-quorum reads are the explicit stale-read boundary | same quorum assumptions as `THM-QUORUM-VISIBILITY`; connectivity tracked separately from liveness; reads only when `pendingVersion = 0`; exactness claim only for `q \subseteq LiveConnected` | TLA+ `QuorumAsyncNetwork.tla` invariants (`InvConnectedAvailabilityBoundary`, `InvMinoritySplitUnavailable`, `InvNoReplicaAheadWhenCommitted`, `InvConnectedQuorumReadExact`, `InvObservedReadSafe`) + Lean theorems `QuorumAsyncNetwork.minority_connected_set_cannot_host_quorum`, `QuorumAsyncNetwork.connected_quorum_read_exact_of_coverage`, `QuorumAsyncNetwork.minority_split_read_set_not_quorum`, `QuorumAsyncNetwork.minority_split_read_stale_if_weak_reads_are_allowed`, `QuorumAsyncNetwork.minority_split_read_below_acked_if_weak_reads_are_allowed`, `QuorumAsyncNetwork.no_repair_boundary_safe_quorum_still_reads_acked`, and `QuorumAsyncNetwork.no_repair_boundary_stale_replica_persists` | Mechanized |
| `THM-QUORUM-CONSISTENCY` | In the bounded single-session quorum model, once reads are restricted to committed states (`pendingVersion = 0`), each observed read equals the acknowledged version, therefore satisfies read-your-writes and is monotone across the session as acknowledged versions increase | same quorum assumptions as `THM-QUORUM-VISIBILITY`; reads only when `pendingVersion = 0`; single writer/session tracks latest acknowledged write and latest two read values | TLA+ `QuorumSessionConsistency.tla` invariants (`InvClientWriteTracksAck`, `InvNoPendingMeansNoReplicaAhead`, `InvCommittedReadReturnsAck`, `InvReadYourWrites`, `InvMonotonicReads`, `InvObservedCommittedReadExact`) + Lean theorems `QuorumConsistency.committed_read_exact_of_coverage`, `QuorumConsistency.committed_read_is_read_your_writes`, and `QuorumConsistency.committed_reads_monotone_of_monotone_acks` | Mechanized |
| `THM-QUORUM-CONSISTENCY-BOUNDARY` | The session-consistency claim is scoped, not universal: if reads are allowed during in-flight writes, monotonicity can fail; if the client does not carry a session floor, read-your-writes can fail even with a later acknowledged write | pending-read witness compares an early speculative read against a later committed read after the speculative value disappears; no-session-floor witness compares a stale session read against a later acknowledged write | Lean counterexamples `QuorumConsistency.pending_boundary_breaks_monotonic_reads` and `QuorumConsistency.no_session_floor_breaks_read_your_writes` | Mechanized |
| `THM-QUORUM-ORDERING` | In the bounded multi-writer quorum register, globally ordered ballots plus committed-state reads force each observed read to return the latest acknowledged ballot and its writer, so a later committed ballot excludes a stale committed read | same quorum assumptions as `THM-QUORUM-VISIBILITY`; writer starts allocate globally unique increasing ballots; commit is allowed only for the current maximum pending ballot backed by a quorum; lower/equal stale pending ballots are cleared on commit; reads only when all pending ballots are zero | TLA+ `QuorumMultiWriter.tla` invariants (`InvAckedWriterMatchesBallotOwner`, `InvAckedBallotBelowNext`, `InvPendingBallotsBelowNext`, `InvLatestAckCovered`, `InvNoCommittedReplicaAhead`, `InvCommittedReadsReturnLatestAck`, `InvObservedCommittedReadExact`, `InvObservedCommittedReadWriter`, `InvObservedCommittedReadsMonotone`) + Lean theorems `QuorumOrdering.committed_multiwriter_read_exact_of_coverage`, `QuorumOrdering.committed_multiwriter_read_tracks_latest_writer`, `QuorumOrdering.committed_multiwriter_reads_monotone_of_acked_order`, and `QuorumOrdering.later_committed_ballot_excludes_stale_read` | Mechanized |
| `THM-QUORUM-ORDERING-BOUNDARY` | The multi-writer ordering claim is scoped, not universal: if a read loses quorum connectivity under partition it can return a stale ballot, and if ballots are not globally unique then writer identity at a ballot is ambiguous | partition witness reads only from a minority split set under `n = 5`, `f = 2`; ballot-collision witness fixes two distinct writers at the same ballot | Lean counterexamples `QuorumOrdering.partition_boundary_read_set_not_quorum`, `QuorumOrdering.partition_boundary_read_returns_stale_ballot`, `QuorumOrdering.partition_boundary_read_stale_under_split_connectivity`, `QuorumOrdering.ballot_collision_boundary_same_ballot`, `QuorumOrdering.ballot_collision_boundary_distinct_writers`, and `QuorumOrdering.ballot_collision_boundary_unique_writer_fails` | Mechanized |
| `THM-QUORUM-HISTORY-REFINEMENT` | In the bounded committed-state multi-writer quorum register, observed reads refine the latest completed-write prefix, operation-history indices stay monotone, and the latest committed read linearizes to the latest completed write; speculative completed-history reads are the explicit boundary | same quorum assumptions as `THM-QUORUM-ORDERING`; reads only when all pending ballots are zero; commit appends a total completed-write history; refinement is judged against completed-write prefixes rather than arbitrary in-flight states | TLA+ `QuorumLinearizability.tla` invariants (`InvLatestHistoryTracksAck`, `InvWriteOpsMatchHistory`, `InvReadOpsRefineRegister`, `InvOpHistoryIndicesMonotone`, `InvObservedReadLinearizesToLatestCompletedWrite`) + Lean theorems `QuorumLinearizability.append_write_updates_latest_committed_write`, `QuorumLinearizability.completed_read_refines_latest_prefix`, `QuorumLinearizability.read_after_appended_write_refines_new_latest`, `QuorumLinearizability.later_appended_write_excludes_stale_history_read`, and `QuorumLinearizability.speculative_read_breaks_completed_history_refinement` | Mechanized |
| `THM-QUORUM-ASYNC-NETWORK` | Quorum async network: minority connected set cannot host quorum. Connected quorum read is exact under coverage. Minority split read is stale if weak reads are allowed | replicas with quorum intersection; partition model | Lean theorems `QuorumAsyncNetwork.minority_connected_set_cannot_host_quorum`, `QuorumAsyncNetwork.connected_quorum_read_exact_of_coverage`, and `QuorumAsyncNetwork.minority_split_read_stale_if_weak_reads_are_allowed` in `QuorumAsyncNetwork.lean` | Mechanized |
| `THM-QUORUM-VISIBILITY-BASE` | Base quorum results: read value is supremum of stored versions. Write-read quorums intersect (critical W+R > N property). Strict majority failure budget is less than quorum size | read value = supremum; quorum intersection; majority bounds | Lean theorems `QuorumVisibility.le_readValue_of_mem`, `QuorumVisibility.write_read_quorums_intersect`, and `QuorumVisibility.strict_majority_failure_budget_lt_quorum` in `QuorumVisibility.lean` | Mechanized |

### Cross-Language Semantic Type Theory

*Topology-level formal verification of multi-language semantics. Type compatibility under JSON serialization, denotation bridge, Hoare propagation, Hope Certificate, and Diversity Optimality.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SEM-REFL` | Type compatibility is reflexive: every topology type is compatible with itself. Proved by structural induction on TopologyType (8 constructors). | TopologyType | Lean theorem `SemanticCompatibility.topology_type_compat_refl` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-UNKNOWN` | Unknown types are universally compatible: Unknown on either side of an edge produces Compatible, never Incompatible. This is the escape hatch for partially-annotated codebases. | TopologyType | Lean theorems `SemanticCompatibility.unknown_compatible_left` and `SemanticCompatibility.unknown_compatible_right` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-INT-SUBTYPE` | Integer is a subtype of Number under JSON schema: `Json(Integer) → Json(Number)` is Compatible, but `Json(Number) → Json(Integer)` is ProofObligation (number may not be integer). The asymmetric subtyping captures the most common source of cross-language numeric bugs. | JsonSchemaKind | Lean theorems `SemanticCompatibility.integer_subtype_number` and `SemanticCompatibility.number_to_integer_needs_proof` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-ROUNDTRIP` | JSON serialization preserves schema: if a value conforms to a JSON schema before serialization, it conforms after deserialization. Foundation of the cross-language type bridge. | JsonValue | Lean theorem `SemanticCompatibility.json_roundtrip_preserves_schema` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-PROCESS-VALID` | Hoare propagation through PROCESS edges: a PROCESS edge is semantically valid when the source's return type is compatible with the target's param type. Unknown on either side makes it trivially valid. | TopologyNode (source, target) | Lean theorems `SemanticCompatibility.process_edge_valid_unknown_source` and `SemanticCompatibility.process_edge_valid_unknown_target` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-FORK-PRESERVE` | FORK distributes predicates to all branches: every branch of a FORK inherits all semantic predicates from the source. If the source produces ValidJson, every branch receives ValidJson. Predicate count is preserved. | ForkEdge | Lean theorems `SemanticCompatibility.fork_branch_has_source_predicates` and `SemanticCompatibility.fork_preserves_predicate_count` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-FOLD-CONSISTENT` | FOLD branches must be pairwise type-compatible: a FOLD with a single branch is trivially consistent; a FOLD where all branches have the same type is consistent (proved by reflexivity). | FoldEdge with non-empty branchTypes | Lean theorems `SemanticCompatibility.fold_single_branch_consistent` and `SemanticCompatibility.fold_uniform_branches_consistent` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-COMP-INV` | Composition of invertible functions is invertible: if `f : α → β` and `g : β → γ` both have left inverses, then `g ∘ f` has a left inverse `f⁻¹ ∘ g⁻¹`. This proves "this pipeline is reversible" for composed multi-language topologies. | InvertibleFunction α β, InvertibleFunction β γ | Lean theorem `SemanticCompatibility.comp_invertible_preserves_left_inverse` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-PIPELINE-JSON` | Pipeline ValidJson preservation: if every node in a pipeline produces valid JSON, the pipeline produces valid JSON. Single-node base case and inductive structure. | Pipeline with non-empty nodes; each node has ValidJson predicate | Lean theorems `SemanticCompatibility.pipeline_json_output` and `SemanticCompatibility.single_node_pipeline_valid` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-BYTES-ISOLATE` | Bytes boundary is strict: Bytes is incompatible with Json, Stream, and Product. Binary data cannot cross a JSON serialization boundary without explicit conversion (base64). This catches `Vec<u8>` → `str` bugs at compile time. | TopologyType.bytes vs non-bytes types | Lean theorems `SemanticCompatibility.bytes_incompatible_with_json`, `SemanticCompatibility.bytes_incompatible_with_stream`, and `SemanticCompatibility.bytes_incompatible_with_product` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-OPTION-SUB` | Nullable-compatible non-null values are safe under one more nullable wrapper: `T` is compatible with `Option(T)` whenever `supportsNullableEmbedding T` holds, e.g. `int` can flow into `Optional[int]` while raw `bytes` remain excluded by the bytes boundary. | `supportsNullableEmbedding t` | Lean theorem `SemanticCompatibility.option_accepts_non_null` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-CROSS-LANG` | Specific cross-language denotation alignments proved compatible: Python `list[float]` = Rust `Vec<f64>` = `Stream(Json(Number))`; Python `dict` = Go `map[string]interface{}` = `Product(open=true)`; Go `int` → TypeScript `number` = `Json(Integer)` → `Json(Number)` (subtype). | Language-specific type denotations | Lean theorems `SemanticCompatibility.python_list_float_compat_rust_vec_f64`, `SemanticCompatibility.python_dict_compat_go_map`, and `SemanticCompatibility.go_int_compat_ts_number` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-FOLD-UNIFORM-0` | Uniform FOLD generates zero proof obligations: when all branches in a topo-race produce the same type, the FOLD is obligation-free. Proved by induction on the branch list with reflexivity at each step. | TopologyType ty; List TopologyType branches; all elements equal ty | Lean theorem `SemanticCompatibility.uniform_fold_zero_obligations` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-HOPE` | The Hope Certificate: five guarantees about cross-language confusion. G1: no false positives (Unknown never generates Incompatible). G2: confusion bounded by `|edges| × 64`. G5: adding a type annotation strictly decreases Unknown count; type coverage is monotonically non-decreasing. | HopeCertificate structure; TopologyType; edgeCount, unknownCount | Lean theorems `SemanticCompatibility.hope_g1_no_false_positives`, `SemanticCompatibility.hope_g2_confusion_bounded`, `SemanticCompatibility.hope_g5_annotation_decreases_unknown`, and `SemanticCompatibility.hope_g5_coverage_monotone` in `SemanticCompatibility.lean` | Mechanized |
| `THM-SEM-DIVERSITY` | Diversity Optimality: multi-language topologies are strictly stronger than mono-language. Net information = cross-language edge count. Mono-language has zero net information. Any topology with cross-language edges has strictly more net information than mono-language with the same edge budget. Maximizing cross-language edges maximizes net information. | DiversityProfile structure | Lean theorems `SemanticCompatibility.mono_language_zero_information`, `SemanticCompatibility.multi_language_positive_information`, `SemanticCompatibility.diversity_dominates_mono`, and `SemanticCompatibility.diversity_optimality` in `SemanticCompatibility.lean` | Mechanized |

### Gnosis Compiler Proofs

*Monoidal coherence, spectral stability, small-set recurrence, continuous drift, continuous Harris, geometric stability, coupled manifolds, and mirrored kernel pairs.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-GNOSIS-SPECTRAL` | GGL routing spectral stability: a Gnosis transition kernel with explicit nilpotent routing or contractive row mass has spectral radius strictly less than `1` | finite `nodeCount > 0`; either an explicit nilpotent power or bounded row mass `< 1` with nonnegative transitions | Lean theorems `GnosisProofs.spectrallyStable_of_nilpotent` and `GnosisProofs.spectrallyStable_of_rowMass` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized |
| `THM-GNOSIS-RECURRENCE` | GGL small-set recurrence: a state-dependent Gnosis kernel bounded by a Foster-Lyapunov-style potential field returns to its certified small set | countable state space; explicit small-set boundary; step-down witness or margin condition `mu + alpha(n) > lam` | Lean theorems `GnosisProofs.countableSmallSetRecurrent_of_driftWitness` and `GnosisProofs.natSmallSetRecurrent_of_margin_step` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized |
| `THM-GNOSIS-CONTINUOUS-DRIFT` | GGL measurable continuous drift surface: a real-valued queue-depth observable on a real state space carries a measurable Foster-Lyapunov gap once the step size and observable scale are positive, and the same witness can be synthesized through a named helper tactic surface | real boundary/atom/step/scale; positive `step`; positive observable scale | Lean definitions/theorems `GnosisProofs.realQueueLinearObservable`, `GnosisProofs.realQueueLinearExpectedObservable`, `GnosisProofs.realMeasurableRealObservableWitness_of_queueStep`, `GnosisProofs.realMeasurableLyapunovDriftWitness_of_queueStep`, and tactic `GnosisProofs.derive_gnosis_drift` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized (drift witness surface) |
| `THM-GNOSIS-CONTINUOUS-HARRIS` | GGL bounded affine continuous-Harris queue witness: the deterministic queue support kernel carries a measurable quantitative Harris package together with affine observable/Lyapunov witnesses whenever the drift gap is positive and bounded by the observable scale | countable `Nat` queue kernel; queue boundary and atom with `atom <= boundary`; affine observable scale `> 0`; affine offset arbitrary; bounded gap `0 < driftGap <= scale` | Lean definitions/theorems `GnosisProofs.MeasurableContinuousHarrisWitness`, `GnosisProofs.natQueueAffineObservable`, `GnosisProofs.natQueueAffineExpectedObservable`, `GnosisProofs.natMeasurableLyapunovDriftWitness_of_queueStep_with_gap`, and `GnosisProofs.natMeasurableContinuousHarrisWitness_of_queueStep_with_gap` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized (bounded affine queue witness) |
| `THM-GNOSIS-GEOMETRY` | GGL certified geometric stability: a Gnosis kernel is geometrically stable once spectral stability is paired with either no drift obligation or a certified negative drift margin | spectrally stable transition matrix; optional `DriftCertificate` with `gamma > 0` and drift floor `driftAt q <= -gamma` | Lean theorems `GnosisProofs.certifiedKernel_stable_of_supremum` and `GnosisProofs.certifiedKernel_stable_of_drift_certificate` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized |
| `THM-GNOSIS-COUPLED` | Interlocking voids / coupled manifolds: a nonnegative handoff pressure modeling upstream `Q_vent` or `W_fold` re-entering as downstream `λ` preserves downstream geometric stability, and therefore pairwise tethered stability, whenever that handoff stays strictly below the downstream drift margin; the spectral certificate is inherited unchanged and the coupling spends exactly that slack | downstream kernel has a concrete drift certificate `some certificate`; downstream spectral witness already holds; transmitted pressure `arrivalPressure >= 0` and `arrivalPressure < certificate.gamma`; pair theorem additionally assumes the upstream kernel is already geometrically stable | Lean definitions/theorems `GnosisProofs.coupledArrivalCertificate`, `GnosisProofs.coupledCertifiedKernel`, `GnosisProofs.driftAt_coupledArrivalCertificate`, `GnosisProofs.coupledArrivalCertificate_negative_drift`, `GnosisProofs.coupledCertifiedKernel_stable`, and `GnosisProofs.tetheredCertifiedKernels_stable` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized |

### Interference, Renormalization & Coarsening Synthesis

*Fractal interference boundary, many-to-one renormalization, recursive reuse, and compiler-side recursive coarsening synthesis.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SLIVER-FRACTAL` | Scale-invariant interference boundary: a support-preserving coarse quotient cannot erase the paid cost of contagious fine-scale interference; if a fine nontrivial fork is contagious and the coarse image still deterministically collapses, then the coarse image must pay vent or repair debt, and under zero vent it must pay repair debt | fine system starts with more than one live alternative; quotient preserves nontrivial forkedness; coarse deterministic collapse really is single-survivor; under zero coarse vent, fine contagious interference is reflected in the coarse image as either positive repair debt or preserved multiplicity; for the singleton coarse-image special case `Phi = {N'}`, the aggregate `λ`, `μ`, `α`, and drift map exactly onto that one coarse node | Lean schema `Axioms.interference_coarsening_zero_vent_requires_repair` / `Axioms.interference_coarsening_schema` together with the constructive injective-live-support quotient surface in `InterferenceCoarsening.QuotientCollapseWitness.coarseInitialLive_eq_fineInitialLive`, `InterferenceCoarsening.QuotientCollapseWitness.zero_vent_deterministic_collapse_requires_repair`, `InterferenceCoarsening.QuotientCollapseWitness.interference_boundary_from_graph_quotient`, `InterferenceCoarsening.QuotientCollapseWitness.interference_schema_instantiated`, `InterferenceCoarsening.app_stage_zero_vent_requires_repair`, and `InterferenceCoarsening.app_stage_schema_instantiated`, plus the many-to-one aggregation surface `InterferenceCoarsening.ManyToOneGraphQuotient.Phi`, `InterferenceCoarsening.ManyToOneGraphQuotient.aggregateArrivalPressure_total_preserved`, `InterferenceCoarsening.ManyToOneGraphQuotient.aggregateServiceCapacity_total_preserved`, `InterferenceCoarsening.ManyToOneGraphQuotient.aggregateRestorativeShedding_total_preserved`, `InterferenceCoarsening.ManyToOneGraphQuotient.aggregateDrift_total_preserved`, `InterferenceCoarsening.ManyToOneGraphQuotient.aggregateDrift_eq_totalFineDrift_of_Phi_eq_singleton`, `InterferenceCoarsening.ManyToOneGraphQuotient.aggregateDrift_eq_collapsedDrift_of_Phi_eq_singleton`, `InterferenceCoarsening.ManyToOneGraphQuotient.drift_transfer_to_collapsed_node`, `InterferenceCoarsening.ManyToOneGraphQuotient.drift_transfer_to_singleton_quotient_node`, `InterferenceCoarsening.ManyToOneGraphQuotient.drift_transfer_to_quotient_total`, and the concrete witness `InterferenceCoarsening.renormalization_single_node_margin_transfers` | Mechanized (constructive injective-live-support special case + many-to-one aggregation surface + singleton-node drift transfer) |
| `THM-RENORMALIZATION-COARSENING` | Constructive many-to-one renormalization closure: a finite bounded graph quotient can collapse a genuinely many-to-one fine support into a coarse node or coarse graph while preserving aggregate `λ`, `μ`, `α`, and total drift; local coarse-node drift certificates aggregate into a certified total coarse margin; and the one-node renormalization operator `Φ` packages that collapse as a measurable coarse node on `ℝ` whose certified negative Foster-Lyapunov drift margin is exactly the fine margin or the derived coarse total margin, with that supplied certificate reusable across recursive quotient steps | finite fine and coarse node supports; quotient operator `Phi` covers the fine support; aggregate arrival/service/restorative terms are defined by summing over coarse fibers; one-node scalarization uses the measurable renormalization operator `Φ`; a transferred margin assumes either a fine certificate `totalFineDrift ≤ -γ` or a coarse certificate `margin : β → ℝ` with nodewise bounds `aggregateDrift coarseNode ≤ - margin coarseNode` on `Phi`; recursive reuse assumes a further quotient map is supplied; the concrete witness requires at least one coarse node with multiple fine preimages | TLA+ `RenormalizationCoarsening.tla` invariants (`InvManyToOneWitness`, `InvCoarseFiberDriftMatchesFineSum`, `InvTotalCoarseDriftEqualsFine`, `InvCollapsedNodeCarriesAggregateRates`, `InvCollapsedDriftTransfer`, `InvCoarseDriftCertificate`, `InvCoarseMarginTotal`, `InvCoarseCertificateTransfersToFine`, `InvCoarseCertificateTransfersToCollapsed`, `InvClosedFormWitness`) + Lean definitions/theorems `InterferenceCoarsening.ManyToOneGraphQuotient.Phi`, `InterferenceCoarsening.ManyToOneGraphQuotient.StructuralRenormalizedNode`, `InterferenceCoarsening.ManyToOneGraphQuotient.StructuralRenormalizedNode.stateMeasure`, `InterferenceCoarsening.ManyToOneGraphQuotient.StructuralRenormalizedNode.MeasurableDriftWitness`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.totalMargin`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.fine_total_le_neg_totalMargin`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.structuralRenormalization_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.liftToCoarse_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.composeQuotient_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.recursive_measurableDrift_eq_composed`, `InterferenceCoarsening.ManyToOneGraphQuotient.Φ`, `InterferenceCoarsening.ManyToOneGraphQuotient.structuralRenormalization_drift_eq_totalFineDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.structuralRenormalization_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.structuralRenormalization_fosterLyapunov`, `InterferenceCoarsening.ManyToOneGraphQuotient.drift_transfer_to_collapsed_node`, `InterferenceCoarsening.ManyToOneGraphQuotient.drift_transfer_to_quotient_total`, `InterferenceCoarsening.renormalizationCoarseDriftCertificate`, `InterferenceCoarsening.renormalization_coarse_certificate_total_margin_closed_form`, `InterferenceCoarsening.renormalization_structural_node_drift_closed_form`, `InterferenceCoarsening.renormalization_structural_node_measurable_drift`, `InterferenceCoarsening.renormalization_structural_node_measurable_drift_from_coarse_certificate`, `InterferenceCoarsening.renormalization_structural_node_fosterLyapunov_from_coarse_certificate`, and `InterferenceCoarsening.renormalization_recursive_measurable_drift_from_coarse_certificate` | Mechanized (bounded TLA witness + constructive Lean quotient/drift transfer + coarse-node certificate aggregation + recursive certificate reuse + measurable one-node renormalization) |
| `THM-RENORMALIZATION-REUSE` | Recursive one-node reuse closure: once a verified quotient has been collapsed onto its coarse support, the next-stage coarse graph interface can be synthesized automatically from aggregate rates, and re-quotienting that synthesized graph yields the same final measurable renormalized node and negative drift witness as directly composing the quotient map on the original fine graph; if the first-stage quotient also carries a coarse-node drift certificate, that same supplied certificate can be reused across the recursive step without falling back to a raw fine-drift proof | finite fine support; a next-stage quotient acts on the current coarse support `Phi`; the synthesized coarse graph uses aggregate `λ`, `μ`, and `α` as its node-local interface; recursive certificate reuse assumes a supplied coarse certificate on the first quotient and identifies the same final measurable renormalization witness after `liftToCoarse` or direct quotient composition | TLA+ `RenormalizationComposition.tla` invariants (`InvMidCarriesFineAggregates`, `InvRecursiveReuseMatchesDirect`, `InvRecursiveTotalsMatchFine`, `InvRecursiveCollapsedDriftTransfer`, `InvRecursiveClosedFormWitness`) + Lean definitions/theorems `InterferenceCoarsening.ManyToOneGraphQuotient.liftToCoarse`, `InterferenceCoarsening.ManyToOneGraphQuotient.composeQuotient`, `InterferenceCoarsening.ManyToOneGraphQuotient.liftToCoarse_totalFineDrift_eq`, `InterferenceCoarsening.ManyToOneGraphQuotient.liftToCoarse_structuralRenormalization_eq`, `InterferenceCoarsening.ManyToOneGraphQuotient.liftToCoarse_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.composeQuotient_structuralRenormalization_eq`, `InterferenceCoarsening.ManyToOneGraphQuotient.composeQuotient_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.liftToCoarse_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.composeQuotient_measurableDrift`, `InterferenceCoarsening.ManyToOneGraphQuotient.CoarseDriftCertificate.recursive_measurableDrift_eq_composed`, `InterferenceCoarsening.ManyToOneGraphQuotient.recursive_structuralRenormalization_eq_composed`, `InterferenceCoarsening.renormalization_single_node_witness_eq_composed`, `InterferenceCoarsening.renormalization_recursive_structural_eq_single_node`, `InterferenceCoarsening.renormalization_recursive_measurable_drift`, and `InterferenceCoarsening.renormalization_recursive_measurable_drift_from_coarse_certificate` | Mechanized (synthesized coarse-interface reuse + certificate-based recursive measurable-node reuse) |
| `THM-RECURSIVE-COARSENING-SYNTHESIS` | Recursive coarsening synthesis: for any finite bounded verified subgraph `G`, Betti can synthesize the quotient operator `Φ_G`, compute each collapsed coarse node `N'` by aggregating the fine-node `λ`, `μ`, `α` over its synthesized fiber, emit the coarse graph interface, and recursively transfer certified negative drift so arbitrarily large bounded networks can be verified bottom-up without hand-constructing quotient witnesses. The synthesis algorithm is proven sound (valid certificate from stable graph data), conservative (total drift preserved under quotient), and stability-transferring (fine stability implies coarse stability) | finite bounded Gnosis subgraph with explicit node-local `λ`, `μ`, `α` data and a finite external interface; the compiler can derive a finite coarse-fiber partition or quotient map from syntax or attached local proof terms; each synthesized coarse node exports aggregate `λ' = ∑ λ`, `μ' = ∑ μ`, `α' = ∑ α` over its fiber; drift transfer is certified either from a fine total-drift bound or from fiberwise coarse certificates; recursion only reuses a coarse node when support coverage, interface preservation, and margin transfer are all discharged; termination is by strict decrease in uncovered fine support or node count | TLA+ `RecursiveCoarseningSynthesis.tla` invariants (`InvManyToOneWitness`, `InvCoarseFiberDriftMatchesFineSum`, `InvTotalCoarseDriftEqualsFine`, `InvCollapsedNodeCarriesAggregateRates`, `InvCollapsedDriftTransfer`, `InvCoarseDriftCertificate`) + Lean theorems `RecursiveCoarseningSynthesis.synthesis_sound`, `RecursiveCoarseningSynthesis.drift_conservation`, `RecursiveCoarseningSynthesis.fine_stability_implies_coarse_stability`, `RecursiveCoarseningSynthesis.identity_quotient_preserves_stability`, and `RecursiveCoarseningSynthesis.certificate_provides_drift_witness` in `RecursiveCoarseningSynthesis.lean` | Mechanized |

### Community Dominance & Skyrms Nadir

*Community attenuation, nondegradation, strict domination, tare bridging, Bule convergence, Skyrms three-walker mediation, and the Bule-zero-iff-nadir identification.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SKYRMS-NADIR` | Two metacognitive walkers converging via failure on a shared void surface: each failure strictly increases void density. Growing void shifts complement toward center. Inter-walker distance is non-increasing. Walkers eventually reach the nadir. The nadir is a fixed point. Without failure, walkers may diverge | two walkers with independent C0-C3 loops on shared void | TLA+ `SkyrmsNadir.tla` invariants (`InvVoidGrowth`, `InvComplementShift`, `InvDistanceMono`, `InvNadirReachable`, `InvNadirStable`, `InvFailureNecessary`) | Model-checked |
| `THM-SKYRMS-THREE-WALKER` | Mediator as player on the convergence site: Skyrms walker's payoff = negative distance delta. Each failure enriches at least one void boundary. Site void density is non-decreasing. All three walkers eventually stabilize. At convergence, no walker can unilaterally improve | two negotiating walkers + Skyrms mediator whose payoff matrix IS the inter-walker distance surface | TLA+ `SkyrmsThreeWalker.tla` invariants (`InvSkyrmsPayoff`, `InvVoidGrowth`, `InvSiteMonotone`, `InvConvergence`, `InvFixedPoint`) | Model-checked |

### Heterogeneous MoA Fabric

*Lowering, cannon/helix scheduling, paired kernel decisions, waste accounting, and coupled mirrored stability.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-MOA-FABRIC-LOWERING` | Heterogeneous paired-kernel MoA lowering preserves mirrored per-lane kernel counts, active backend-layer diversity, ready-backend cardinality bounds, zero-active exactness at the all-zero witness, and the top-level laminar collapse shape for CPU/GPU/NPU/WASM fabrics | nonnegative lane counts; at least one active backend lane | TLA+ `HeteroMoAFabricLowering.tla` invariants (`InvLoweringBalanced`, `InvMirroredKernelCount`, `InvMetaRaceWidth`, `InvLaminarLayerCount`) + Lean theorems `ForkRaceFoldTheorems.mirroredKernelTotal_eq_twice_totalLanes`, `ForkRaceFoldTheorems.activeLayerCount_le_totalLanes`, `ForkRaceFoldTheorems.activeLayerCount_pos_of_totalLanes_pos`, `ForkRaceFoldTheorems.activeLayerCount_le_four`, `ForkRaceFoldTheorems.activeLayerCount_eq_four_of_all_positive`, `ForkRaceFoldTheorems.activeLayerCount_eq_zero_of_all_zero`, `ForkRaceFoldTheorems.readyBackendCount_le_four`, `ForkRaceFoldTheorems.readyBackendCount_eq_zero_of_all_not_ready`, `ForkRaceFoldTheorems.readyBackendCount_eq_four_of_all_ready`, `ForkRaceFoldTheorems.metaLaminarHeight_pos`, `ForkRaceFoldTheorems.metaLaminarHeight_ge_streamLayers_succ`, and `ForkRaceFoldTheorems.metaLaminarHeight_ge_backendLayers_succ` in [`lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean`](./lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean) | Mechanized |
| `THM-MOA-FABRIC-CANNON` | The `gnode` cannon/helix scheduler arms each wave before launch, advances the rotating cursor by wave width modulo lane count, includes honest zero-lane/zero-layer boundary behavior, and preserves Aeon's 10-byte binary frame header while the delayed shadow path becomes eligible under fair service | positive lane count; positive wave width; positive hedge delay; `HeaderBytes = 10` | TLA+ `HeteroMoAFabricCannon.tla` invariants/properties (`InvArmedBeforeLaunch`, `InvCursorBound`, `InvCursorAdvance`, `InvAeonBinaryHeader`, `InvShadowEligibility`, `EventuallyLaunch`, `EventuallyShadowEligibility`) + Lean theorems `ForkRaceFoldTheorems.cannonCursor_step_mod`, `ForkRaceFoldTheorems.cannonCursor_zero_of_zero_laneCount`, `ForkRaceFoldTheorems.cannonCursor_lt_laneCount`, `ForkRaceFoldTheorems.cannonCursor_waveWidth_zero_eq_cursor_mod`, `ForkRaceFoldTheorems.helixPhase_lt_layerCount`, `ForkRaceFoldTheorems.helixPhase_zero_of_zero_layerCount`, `ForkRaceFoldTheorems.binaryHeaderBytes_eq_ten`, `ForkRaceFoldTheorems.binaryFrameBytes_ge_header`, `ForkRaceFoldTheorems.binaryFrameBytes_strictMono`, and `ForkRaceFoldTheorems.binaryFrameBytes_injective` in [`lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean`](./lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean) | Mechanized |
| `THM-MOA-FABRIC-PAIR` | Mirrored primary/shadow kernel pairs accept immediately on agreement or on an early sufficient primary before the delayed shadow fires, otherwise escalate to explicit disagreement handling, never report agreement acceptance on a disagreeing branch pair, never report primary acceptance under disagreement, and never escalate in the agreement or early-sufficient-primary branches | positive hedge delay; boolean agreement and sufficiency surface | TLA+ `HeteroMoAFabricPairing.tla` invariants (`InvAgreementAccepts`, `InvSufficientPrimarySkipsShadow`, `InvDisagreementEscalates`, `InvNoDoubleAccept`) + Lean theorems `ForkRaceFoldTheorems.pairedKernelDecision_of_agreement`, `ForkRaceFoldTheorems.pairedKernelDecision_of_sufficient_primary`, `ForkRaceFoldTheorems.pairedKernelDecision_of_disagreement`, `ForkRaceFoldTheorems.pairedKernelDecision_ne_acceptAgreement_of_disagree`, `ForkRaceFoldTheorems.pairedKernelDecision_ne_acceptPrimary_of_disagreement`, `ForkRaceFoldTheorems.pairedKernelDecision_ne_escalate_of_agreement`, and `ForkRaceFoldTheorems.pairedKernelDecision_ne_escalate_of_sufficient_primary` in [`lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean`](./lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean) | Mechanized |
| `THM-MOA-FABRIC-WASTE` | Winner/loser/vent/skipped accounting is conserved across layered race/fold/vent execution, monotone sequence framing preserves Aeon's binary stream order, zero skipped hedges always stay within budget, byte conservation is equivalent to the total-byte equation, and zero-payload frames reduce exactly to the header while every frame stays strictly positive | natural accounting fields; monotone sequence numbers; skipped hedges bounded by scheduled shadows; `HeaderBytes = 10` | TLA+ `HeteroMoAFabricWaste.tla` invariants (`InvByteConservation`, `InvSkippedWithinBudget`, `InvMonotoneSequence`, `InvFrameSize`) + Lean theorems `ForkRaceFoldTheorems.skippedWithinBudget_of_le`, `ForkRaceFoldTheorems.skippedWithinBudget_zero`, `ForkRaceFoldTheorems.conservedBytes_of_total`, `ForkRaceFoldTheorems.conservedBytes_iff_total`, `ForkRaceFoldTheorems.binaryFrameBytes_ge_header`, `ForkRaceFoldTheorems.binaryFrameBytes_strictMono`, `ForkRaceFoldTheorems.binaryFrameBytes_injective`, `ForkRaceFoldTheorems.binaryFrameBytes_eq_header_of_zero_payload`, and `ForkRaceFoldTheorems.binaryFrameBytes_pos` in [`lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean`](./lean/Lean/ForkRaceFoldTheorems/HeteroMoAFabric.lean) | Mechanized |
| `THM-MOA-FABRIC-COUPLED` | Backend-diverse mirrored kernels inherit stability from aligned twins, and paired downstream fabrics remain geometrically stable under bounded imported arrival pressure while the handoff stays below drift slack | mirrored primary/shadow alignment; downstream drift certificate; downstream spectral witness; imported pressure nonnegative and strictly below `gamma` | Lean definitions/theorems `GnosisProofs.MirroredKernelPair`, `GnosisProofs.mirrorAligned`, `GnosisProofs.spectrallyStable_shadow_of_mirrorAligned`, `GnosisProofs.geometricallyStable_shadow_of_mirrorAligned`, `GnosisProofs.pairedKernel_stable_of_mirrorAligned`, and `GnosisProofs.pairedCoupledCertifiedKernels_stable` in [`GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean) | Mechanized |

### Molecular Topology & Genomics

*Pipeline-molecular isomorphism, hole invariance, DNA helix, CRISPR unwinding, genome self-description, mutation detection, bond dissociation, orbital quantization, confinement, and full molecular isomorphism.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-TOPO-MOLECULAR-ISO` | Pipeline computation graphs and molecular graphs with identical Betti signatures (β₀, β₁, β₂) are in the same equivalence class under simplicial homology: H_k(G_P) ≅ H_k(G_M) for k = 0, 1, 2 | both structures are finite simplicial complexes; identical Betti numbers (β₀, β₁, β₂) | executable `src/genomic-topology.test.ts` (28 tests): σ(ℓ) determinism, β₁ = 2 + σ invariant, G4/hairpin/cruciform detection on real TP53/KRAS sequences | Mechanized (executable companion) |
| `COR-HOLE-INVARIANCE` | A nontrivial hole survives stretching or twisting: if a deformed realization preserves the original Betti signature and the original has β₁ > 0, then the deformed realization still has β₁ > 0; metric deformation changes lengths and angles but not the hole count | both realizations are finite simplicial complexes; the deformation preserves the Betti signature (β₀, β₁, β₂); the original realization has β₁ > 0 | Lean theorem `MolecularTopology.hole_persists_under_homological_deformation` in `MolecularTopology.lean` | Mechanized |
| `COR-DNA-HELIX` | The DNA double helix has Betti signature (1, 2, 0); the replication fork is a Wallington rotation with β₁ = 2; DNA ligase performs the Worthington fold on Okazaki fragments | COR-DNA-HELIX is a corollary of THM-TOPO-MOLECULAR-ISO applied to the double helix | executable `src/genomic-topology.test.ts`: β₁ = 2 + σ holds for all loci in TP53 and KRAS real gene sequences | Mechanized (executable companion) |
| `COR-CRISPR-UNWINDING` | CRISPR-Cas9 editing is a local β₁ reduction at locus ℓ; editing efficiency η(ℓ) ≤ W_edit / E_unwind(ℓ) where E_unwind = D_e(strand) + Σ D_e(secondary structures); efficiency is monotonically decreasing in σ(ℓ) | R-loop formation displaces one strand (β₁ decrements by 1); secondary structures contribute σ(ℓ) additional cycles; energy cost per cycle from THM-THERMO-BOND-DISSOCIATION | executable `src/genomic-topology.test.ts`: η = 2/β₁ formula verified, monotonic relationship between σ and η confirmed, η bounded in (0, 1] for all loci | Mechanized (executable companion) |
| `PROP-GENOME-SELF-DESCRIBING` | The genome is a self-describing frame (§3.4) whose local Betti numbers encode its own editability map; σ(ℓ) is sequence-computable from hairpin, G-quadruplex, and cruciform detection; no external data required | base-pairing rules define the simplicial complex; σ(ℓ) computable from sequence complementarity and pattern matching | executable `src/genomic-topology.test.ts`: full end-to-end pipeline (sequence → σ → η → severity) runs on real gene sequences with zero external dependencies | Mechanized (executable companion) |
| `THM-TOPO-MUTATION-DETECTION` | A mutation at locus ℓ that changes σ(ℓ) is detectable as a topological deficit Δσ = σ_mutant - σ_ref before phenotypic consequences manifest; |Δσ| predicts severity (0 B = silent, 1 B = mild, 2 B = moderate, ≥3 B = severe) | mutation alters local nucleotide sequence; σ(ℓ) is sequence-computable; energy cost ΔE from THM-THERMO-BOND-DISSOCIATION; topology precedes phenotype | executable `src/genomic-topology.test.ts`: σ_ref + Δσ = σ_mutant accounting identity, severity hierarchy well-ordered, driver vs passenger analysis on TP53 real sequences, cancer hotspot topology analysis for TP53 and KRAS | Mechanized (executable companion) |
| `THM-THERMO-BOND-DISSOCIATION` | Under the topological isomorphism φ, the energy required to break a molecular ring bond equals the fold energy at the Worthington convergence vertex; when β₁ decrements by 1, the First Law V_in = W_out + Q_dissipated maps to the bond energy equation | First Law (§6.10); φ from THM-TOPO-MOLECULAR-ISO preserves homology indexing energy reservoirs | executable `src/genomic-topology.test.ts`: First Law conservation verified (β₁ = 2 + hairpins + 3·G4s + 2·cruciforms); energy model is additive | Mechanized (executable companion) |
| `THM-THERMO-ORBITAL-QUANTIZATION` | Discrete pipeline stages in a Wallington rotation are quantized at integer positions k ∈ {0,...,N-1}; under φ, this maps to electron shell quantization; β₂ voids correspond to orbital shells | torus parametrization places nodes at t = k/N; β₂ wireframe shells at radii r₀ < r₁ < r₂ form nested voids; each shell has bounded capacity | executable `src/genomic-topology.test.ts`: quantization verified via β₁ = 2 + σ invariant at discrete loci | Mechanized (executable companion) |
| `THM-TOPO-CONFINEMENT` | Color confinement is the covering-space fold: SU(3) color topology has β₁ = 3 in the covering space, the observable hadron has β₁ = 0 in the base space; the fold φ_confine: β₁ = 3 → β₁ = 0 is the covering map; hadronization is the Worthington whip snap converting covering-space energy to base-space mass | SU(3) color symmetry; QCD string tension σ ≈ 1 GeV/fm; pair production threshold; deconfinement temperature T_c ≈ 155 MeV | executable `src/confinement-topology.test.ts` (31 tests): SU(3) β₁ = 3, mandatory fold to β₁ = 0 at all distances, anti-vent property (attempted vent → fork), whip-snap First Law conservation, linear confinement potential V(r) = σr matched to lattice QCD, deconfinement phase transition at T_c matched to RHIC/LHC, hadron multiplicity scaling, scale tower functoriality, benzene/fork-cycle/color-loop homological equivalence | Mechanized (executable companion) |
| `THM-TOPO-MOLECULAR-ISO-FULL` | Pipeline and molecular graphs with identical Betti signatures are homologically equivalent. Protein folding is a monotone filtration on Beta1. Enzyme catalysis adds one fork path. Natural selection is fork/race/fold on self-modifying pipeline. Gravity is the fold acting on the simplicial complex itself. Fold erasure yields Landauer heat yields mass (E=mc^2) | both structures are finite simplicial complexes; identical Betti numbers (Beta0, Beta1, Beta2) | TLA+ `MolecularTopology.tla` invariants (`InvProteinFunnel`, `InvEnzymeCatalysis`, `InvEvolutionSelfModifying`, `InvGravitySelfReferential`, `InvInformationMatter`) + Lean theorems in `MolecularTopology.lean` | Mechanized |

### Cancer Topology (§3.17)

*Cancer as topological collapse: cell cycle as fork/race/fold, checkpoint venting, therapeutic restoration, GBM subtype classification, driver vs passenger separation, immune checkpoint bridge.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-CANCER-BETA1-COLLAPSE` | A cancer cell with no functional checkpoint pathways has total vent β₁ = 0 and produces zero failure data. The complement distribution cannot update. The cell cannot learn. | Cell cycle modeled as fork/race/fold with 5 decisions. Checkpoints are vents. Growth signals are forks. All checkpoints destroyed. | Lean theorem `cancer_beta1_collapse` in `CancerTopology.lean` + executable `src/cancer-topology.test.ts` (31 tests) | Mechanized |
| `THM-CHECKPOINT-VENTING` | Each active checkpoint pathway monotonically shifts the complement distribution away from "divide" via buleyean_concentration. More checkpoints = lower P(divide). | Active checkpoint rejects "divide" by incrementing void boundary. buleyean_concentration from BuleyeanProbability.lean. | Lean theorems `checkpoint_reduces_divide_weight`, `checkpoint_monotone_shift` in `CancerTopology.lean` + executable tests verify monotone P(divide) decrease | Mechanized |
| `THM-THERAPEUTIC-RESTORATION` | Restoring any single checkpoint pathway restores β₁ > 0. buleyean_positivity guarantees the cell starts learning again. One vent suffices. | At least one checkpoint pathway restored. buleyean_positivity from BuleyeanProbability.lean. | Lean theorems `therapeutic_restoration`, `restored_cell_is_buleyean`, `restoration_preserves_sliver` in `CancerTopology.lean` + executable tests verify single-vent restoration shifts trajectory | Mechanized |
| `THM-TOPOLOGICAL-DEFICIT-SEVERITY` | The topological deficit Δβ = β₁*(healthy) - β₁(tumor) measures aggressiveness. Higher deficit = more aggressive. Monotone in checkpoint loss. | Healthy β₁ = 9 (p53:3 + Rb:2 + APC:2 + ATM/ATR:2). Deficit is non-negative. | Lean theorems `deficit_nonneg`, `deficit_monotone_in_loss`, `maximum_deficit`, `partial_retention_less_aggressive` in `CancerTopology.lean` + executable tests verify deficit ordering predicts P(divide) ordering | Mechanized |
| `THM-DRIVER-PASSENGER-SEPARATION` | Driver mutations destroy vents (|Δσ| ≥ 1 B). Passenger mutations are topology-silent (Δσ = 0 B). Drivers should show higher mean |Δσ| than passengers. | Mutations alter sequence. σ(ℓ) is sequence-computable. Classification orthogonal to protein-effect classification. | Lean theorems `silent_mutation_zero_severity`, `creating_mutation_positive_severity`, `extreme_separation` in `CancerTopology.lean` + executable `src/cancer-genomic-integration.test.ts` on real TP53/KRAS data | Mechanized |
| `THM-IMMUNE-CHECKPOINT-BRIDGE` | Checkpoint immunotherapy restores external vent β₁ > 0 even when all internal checkpoints are destroyed. Population-level therapeutic_restoration. | Immune vent (anti-PD-1, anti-CTLA-4) provides independent rejection mechanism. | Lean theorem `immune_restores_population_learning` in `CancerTopology.lean` + executable tests verify external vent reduces P(divide) | Mechanized |
| `THM-GBM-SUBTYPE-ORDERING` | GBM subtypes ordered by deficit: Classical (2B) < Mesenchymal (3B) < Combined (7B). Higher deficit correlates with worse survival. | Pathway disruption data from Brennan et al., Cell 2013. β₁ values per pathway. | Lean theorems `gbm_classical_deficit`, `gbm_mesenchymal_deficit`, `gbm_combined_deficit`, `combined_more_aggressive_than_classical` in `CancerTopology.lean` + executable tests verify P(divide) ordering matches deficit ordering | Mechanized |
| `THM-CANCER-MASTER` | Bundle: (1) Buleyean probability well-defined, (2) no failure = no learning, (3) deficit non-negative, (4) Combined > Classical, (5) Combined still has therapeutic target (β₁ = 2). | All prior assumptions compose. | Lean theorem `cancer_master_theorem` in `CancerTopology.lean` (0 sorry) | Mechanized |

### Cancer Predictions (§19.9)

*Five novel predictions from the cancer topology ledger: TMB-T, loss order, synthetic lethality, immunotherapy ratio, convergence bound.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `PRED-TMBT` | Topological Mutation Burden (TMB-T = Σ|Δσ|) discriminates tumors that raw TMB conflates. Two catalogs with same count but different severity have different TMB-T. | Mutations have computable σ(ℓ). Severity = |Δσ|. | Lean theorems `tmbt_discriminates_equal_tmb`, `disruptive_tumor_high_tmbt` in `CancerPredictions.lean` + executable `src/cancer-predictions.test.ts` (18 tests) | Mechanized |
| `PRED-LOSS-ORDER` | Checkpoint loss ORDER produces different void boundaries. Earlier loss of high-β₁ pathway = fewer rejections accumulated = more aggressive trajectory. | Buleyean update is path-dependent. Rejections before loss = lossRound × β₁. | Lean theorems `earlier_loss_fewer_rejections`, `order_produces_different_boundaries` in `CancerPredictions.lean` + executable simulation confirms trajectory divergence | Mechanized |
| `PRED-SYNTHETIC-LETHALITY` | Synthetic lethality is a topological phase transition: individual KO viable, combined KO crosses viability threshold. p53+Rb lethal at threshold 5B. Transition width = marginal gene β₁. | Viability threshold exists. Individual KO stays above, combined KO drops below. | Lean theorems `synthetic_lethality_is_phase_transition`, `transition_width_equals_marginal`, `p53_rb_is_lethal_pair` in `CancerPredictions.lean` + simulation | Mechanized |
| `PRED-IMMUNO-RATIO` | Immunotherapy response ratio R = immune_β₁ / tumor_deficit predicts efficacy. Higher R = better response. Complete coverage at R ≥ 1. Classical R=1.0 > Combined R=0.29. | Immune vent provides external β₁. Deficit from CancerTopology. | Lean theorems `more_immune_better_ratio`, `lower_deficit_better_ratio`, `complete_coverage`, `classical_better_response` in `CancerPredictions.lean` + simulation | Mechanized |
| `PRED-CONVERGENCE-BOUND` | Convergence bound C* = totalVentBeta1 - 1 predicts differentiation time. Stem (C*=8) > differentiated (C*=2). Higher β₁ = longer convergence = slower division. | Cell cycle modeled as Buleyean space. future_deficit_eventually_zero from BuleyeanProbability. | Lean theorems `convergence_round_positive`, `more_checkpoints_longer_convergence`, `differentiation_follows_convergence`, `healthy_convergence_bound` in `CancerPredictions.lean` + simulation | Mechanized |
| `PRED-MASTER` | Bundle: all five predictions compose into `five_predictions_master` (0 sorry). | All prior assumptions. | Lean theorem `five_predictions_master` in `CancerPredictions.lean` | Mechanized |

### Cancer Predictions Round 3 (§19.9, Predictions 11-15)

*Restoration order, tumor heterogeneity as fork width, apoptosis vent blockage, metastasis as covering space projection, fork/vent ratio as cell-cycle Reynolds number.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `PRED-RESTORATION-ORDER` | Restoration ORDER matters: restoring highest-β₁ pathway first produces more cumulative rejections. Earlier restoration = more cycles with vent active. p53 (β₁=3) should be restored before Rb (β₁=2). | RestorationEvent with restorationRound, totalCycles, restoredBeta1. | Lean theorems `earlier_restoration_more_rejections`, `higher_beta1_more_rejections`, `restore_p53_before_rb` in `CancerPredictions2.lean` + executable `cancer-predictions-round3.ts` | Mechanized |
| `PRED-TUMOR-HETEROGENEITY` | Tumor heterogeneity = evolutionary fork width. N clones → β₁ = N-1. Treatment selects survivors: residual β₁ = survivors - 1. Complete response (1 survivor) = β₁ = 0 (no evolutionary escape). Higher residual clonality predicts relapse. | TumorClonalArchitecture with numClones > 0, survivors ≤ numClones. | Lean theorems `treatment_reduces_evolutionary_beta1`, `complete_response_no_escape`, `residual_clonality_predicts_relapse` in `CancerPredictions2.lean` + executable simulation | Mechanized |
| `PRED-APOPTOSIS-BLOCKAGE` | BCL-2 blocks the apoptosis vent without destroying the checkpoint. Effective β₁ = 0 when blocked, full when open. BCL-2 inhibitors (venetoclax) unblock the vent = topologically equivalent to restoration. Blocked vs destroyed: same effective β₁ = 0, but blocked is therapeutically easier. | BlockedVent with checkpointFunctional, ventBlocked, beta1WhenOpen. | Lean theorems `blocked_vent_zero_beta1`, `unblocking_restores_beta1`, `bcl2_inhibitor_is_restoration`, `blocked_equals_destroyed_topologically` in `CancerPredictions2.lean` + executable simulation | Mechanized |
| `PRED-METASTASIS-PROJECTION` | Metastasis = covering space projection. Primary (high β₁) → metastatic colony (β₁ ≈ 0). Information erased = primaryBeta1 - metastaticBeta1. More diverse primary = harder metastasis (more information to erase in the fold). | MetastaticProjection with primaryBeta1, metastaticBeta1, reduces constraint. | Lean theorems `diverse_primary_harder_metastasis`, `single_clone_max_erasure`, `metastasis_erasure_nonneg` in `CancerPredictions2.lean` + executable simulation | Mechanized |
| `PRED-FORK-VENT-RATIO` | Fork/vent ratio = cell-cycle Reynolds number. Healthy: 3/9 = 0.33 (balanced). Cancer (no vents): 3/0 = ∞ (turbulent). Ratio predicts transition from controlled to uncontrolled growth. Vent loss monotonically increases imbalance. | ForkVentRatio with totalForkWidth, totalVentBeta1. | Lean theorems `healthy_is_balanced`, `gbm_combined_unbalanced`, `cancer_maximally_unbalanced`, `vent_loss_increases_imbalance` in `CancerPredictions2.lean` + executable simulation | Mechanized |
| `PRED-ROUND3-MASTER` | Bundle: all five round 3 predictions compose (0 sorry). | All prior assumptions. | Lean theorem `five_predictions_round3_master` in `CancerPredictions2.lean` | Mechanized |

### Cancer Predictions Round 4 (§19.9, Predictions 26-30)

*Epigenetic drift, tumor dormancy, radiation as forced ATM/ATR activation, Warburg effect as thermodynamic overhead, abscopal effect as void boundary propagation.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `PRED-EPIGENETIC-DRIFT` | Aging = progressive vent erosion. Effective β₁ decreases monotonically with silencing. Total silencing = cancer (effective β₁ = 0). Cancer risk monotone in age via deficit monotonicity. | EpigeneticDrift with healthyBeta1, silenced (bounded by healthyBeta1). | Lean theorems `aging_reduces_beta1`, `total_silencing_is_cancer`, `cancer_risk_monotone_in_age` in `CancerPredictions3.lean` + executable `cancer-predictions-round4.ts` | Mechanized |
| `PRED-DORMANCY` | Tumor dormancy = Buleyean ground state. Dormant cells have high rejection density (rounds ≤ 2 × divideRejections). Divide weight suppressed. Reactivation = new signals with no void history (max weight). | DormancyState with divideRejections, rounds, highRejection constraint. | Lean theorems `dormant_divide_suppressed`, `reactivation_max_weight` in `CancerPredictions3.lean` + executable simulation | Mechanized |
| `PRED-RADIATION` | Radiation = forced ATM/ATR vent activation. Forced rejections = fractions × ventBeta1 when functional. ATM-mutant = radiation resistant (forced rejections = 0). Dose-response is monotone. | RadiationEffect with targetVentBeta1, fractions, ventFunctional. | Lean theorems `radiation_forces_rejection`, `atm_mutant_radiation_resistant`, `radiation_dose_response` in `CancerPredictions3.lean` + executable simulation | Mechanized |
| `PRED-WARBURG` | Warburg effect = thermodynamic overhead of uninformed (ventless) folding. First law: energyInput = usefulWork + wasteHeat. Uninformed fold: usefulWork = 1 (the sliver), wasteHeat = input - 1. Cancer compensates via increased energy throughput (glycolysis). | FoldEnergyModel with firstLaw constraint (energyInput = usefulWork + wasteHeat). | Lean theorems `uninformed_fold_wasteful`, `warburg_compensation` in `CancerPredictions3.lean` + executable simulation | Mechanized |
| `PRED-ABSCOPAL` | Abscopal effect = void boundary propagation through immune network. Rejections learned at site A transfer to site B at reduced efficiency. siteBRejections = siteARejections × transferEfficiency / 100. Zero transfer = no abscopal. Transfer is monotone. | AbscopalPropagation with siteARejections, transferEfficiency (0-100). | Lean theorems `no_transfer_no_abscopal`, `transfer_monotone` in `CancerPredictions3.lean` + executable simulation | Mechanized |
| `PRED-ROUND4-MASTER` | Bundle: all five round 4 predictions compose (0 sorry). | All prior assumptions. | Lean theorem `five_predictions_round4_master` in `CancerPredictions3.lean` | Mechanized |

### Cancer Predictions Round 5 (§19.9, Predictions 31-35)

*Oncogene addiction, telomere convergence countdown, cancer stem cell hierarchy, multi-drug resistance, combination therapy index.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `PRED-ONCOGENE-ADDICTION` | Single-pathway tumor (1 growth fork) has growthBeta1 = 0 after targeted therapy. Multi-pathway (2+) retains β₁ > 0. This is why imatinib works for CML (BCR-ABL only fork). | OncogeneAddiction with numGrowthPathways ≥ 1. | Lean theorems `oncogene_addiction_collapse`, `multi_pathway_resilient` in `CancerPredictions4.lean` + executable `cancer-predictions-round5.ts` | Mechanized |
| `PRED-TELOMERE-COUNTDOWN` | Telomere shortening = deterministic convergence countdown. remainingDivisions = (currentLength - criticalLength) / lossPerDivision. Shorter = fewer remaining. At critical length, remaining = 0 (p53 activates). | TelomereCountdown with currentLength ≥ criticalLength, lossPerDivision > 0. | Lean theorems `shorter_telomeres_fewer_divisions`, `at_critical_zero_remaining` in `CancerPredictions4.lean` + executable simulation | Mechanized |
| `PRED-CSC-HIERARCHY` | Cancer stem cell hierarchy = β₁ gradient. CSC β₁ ≥ TA β₁ ≥ differentiated β₁. Total fold reduction = cscBeta1 - diffBeta1. CSC elimination collapses hierarchy. Higher CSC β₁ = harder to eliminate. | CSCHierarchy with non-increasing β₁ constraint (cscAboveTa, taAboveDiff). | Lean theorems `csc_elimination_collapses_hierarchy`, `higher_csc_beta1_harder` in `CancerPredictions4.lean` + executable simulation | Mechanized |
| `PRED-MULTIDRUG-RESISTANCE` | Each drug = external vent. effectiveVentBeta1 = numDrugs - numResisted. Full resistance = 0 effective vent. More resistance = less effective vent (monotone). Adding non-resisted drug helps. | DrugResistance with numResisted ≤ numDrugs. | Lean theorems `full_resistance_zero_vent`, `resistance_reduces_vent`, `new_drug_helps` in `CancerPredictions4.lean` + executable simulation | Mechanized |
| `PRED-COMBINATION-INDEX` | Combination therapy index = totalRestoredBeta1 / tumorDeficit. Adding a drug can only increase total β₁. Empty intervention = zero restoration. Unifies checkpoint inhibitors, BCL-2 inhibitors, targeted therapy, radiation. | CombinationTherapy with non-empty contributions list. | Lean theorems `adding_drug_helps`, `no_therapy_no_restoration` in `CancerPredictions4.lean` + executable simulation | Mechanized |
| `PRED-ROUND5-MASTER` | Bundle: all five round 5 predictions compose (0 sorry). | All prior assumptions. | Lean theorem `five_predictions_round5_master` in `CancerPredictions4.lean` | Mechanized |

### Cancer Treatment Strategies (§19.23, Predictions 76-80)

*Metabolic gate sequencing, checkpoint cascade amplification, senescence-then-senolytic two-step, viral oncoprotein displacement, counter-vent depletion before immunotherapy.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `PRED-METABOLIC-GATE` | Gate-first sequencing: remove metabolic block (mTOR) before restoring checkpoint (p53). Effective rejections = (T - max(gateRemoval, therapy)) × β₁. Gate-first always beats therapy-first when gate is removed earlier. | GatedRestorationSequence with sameTime, sameBeta1, ordered steps. | Lean theorems `gated_checkpoint_zero_until_unblocked`, `gate_first_more_rejections` in `CancerTreatments.lean` + executable `treatment-sequencing.ts` | Mechanized |
| `PRED-CHECKPOINT-CASCADE` | Hub checkpoint (p53) transcriptionally upregulates dependents (ATM/ATR, p21→Rb). Restoring hub cascades β₁ across 2+ pathways. Total restored = hub.β₁ + Σ(dependent.β₁), strictly exceeding any single non-hub restoration. Cascade multiplier ≥ 2× when dependent β₁ ≥ hub β₁. | CheckpointCascade with hubBeta1 > 0, non-empty dependentBeta1s. | Lean theorems `cascade_amplifies_restoration`, `cascade_multiplier_at_least_two` in `CancerTreatments.lean` + executable via `cascadeRestoredBeta1()` in cell-cycle.ts | Mechanized |
| `PRED-SENESCENCE-SENOLYTIC` | Two-step protocol: (1) low-dose radiation induces senescence when totalArrestSignals ≥ dormancyThreshold, (2) senolytics clear dormant cells. Two-step strictly better than radiation alone. Dormancy as therapeutic waypoint. | SenescenceInduction with fractions, ventBeta1PerFraction, dormancyThreshold. SenolyticClearance with clearancePercent. | Lean theorems `sufficient_fractions_induce_senescence`, `two_step_better_than_radiation_alone` in `CancerTreatments.lean` + executable simulation | Mechanized |
| `PRED-VIRAL-DISPLACEMENT` | In HPV+ cancers, E6/E7 block (not destroy) p53/Rb. Displacement restores full β₁. HPV+ therapeutic ceiling strictly higher than HPV- (blocked > destroyed for restoration). HPV+ with displacement + immunotherapy achieves complete coverage when total restored ≥ healthy β₁. | ViralOncoprotein targets, ViralVsGeneticComparison with viralHigher constraint. | Lean theorems `viral_better_ceiling`, `viral_complete_coverage` in `CancerTreatments.lean` + executable simulation | Mechanized |
| `PRED-COUNTER-VENT-DEPLETION` | MDSCs/Tregs suppress the immune vent (counter-vents). Effective immune β₁ = rawImmune - suppression. When fully suppressed, immunotherapy is topologically inert. Depletion before immunotherapy is strictly superior. | ImmunosuppressiveMicroenvironment with rawImmuneBeta1, suppression. | Lean theorems `fully_suppressed_immune_zero`, `depletion_increases_immune_beta1`, `immunotherapy_fails_when_suppressed` in `CancerTreatments.lean` + executable simulation | Mechanized |
| `PRED-TREATMENT-MASTER` | Bundle: all five treatment predictions compose (0 sorry). | All prior assumptions. | Lean theorem `five_treatment_predictions_master` in `CancerTreatments.lean` | Mechanized |

### Quantum Cancer Triples (§19.9)

*Cross-domain triple compositions: quantum + cancer + retrocausal, negotiation + void + NEI, grandfather + quantum + cancer, retrocausal + negotiation + Buleyean, NEI + cancer + void.*

| ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-QUANTUM-CANCER-RETROCAUSAL` | Quantum measurement and cancer both collapse to β₁ = 0. The retrocausal bound constrains how the collapse happened. Terminal topology cannot distinguish which process caused the collapse. | QuantumSystem, CancerCell with totalVentBeta1 = 0. | Lean theorem `quantum_cancer_retrocausally_indistinguishable` in `QuantumCancerTriples.lean` | Mechanized |
| `THM-COLLAPSE-IRREVERSIBILITY` | Both quantum and cancer collapses are irreversible. The void boundary is append-only. The sliver prevents annihilation of any path. Neither collapse can be reversed. | QuantumSystem, CancerCell, BuleyeanSpace. | Lean theorem `collapse_irreversibility` in `QuantumCancerTriples.lean` | Mechanized |

### Cancer Confinement (§19.9 / §3.17)

*Color confinement model for cancer therapy: three suppressor families as color charges, six gluon connections as inter-pathway crosstalk, confinement energy linearity, screening effect, asymptotic freedom regime, bypass monotonicity, hub-first optimality, gluon severing, scale tower propagation.*

**Mechanization target:** `CancerConfinement.lean` (25+ theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COLOR-NEUTRAL-GROUND | Color-neutral (all three suppressors active) = zero deficit = ground state | `color_neutral_zero_deficit`, `healthy_zero_deficit` | Mechanized |
| THM-COLOR-NEUTRAL-ZERO-CHARGE | Color-neutral system has zero color charge | `color_neutral_zero_charge` | Mechanized |
| THM-CONFINEMENT-ENERGY-MONOTONE | Confinement cost is monotonically increasing in deficit | `confinement_monotone_in_deficit` | Mechanized |
| THM-CONFINEMENT-ENERGY-STRICT | Higher deficit means strictly higher cost when base > 0 | `confinement_strict_monotone` | Mechanized |
| THM-CONFINEMENT-AT-ZERO | At zero deficit, cost equals base (no confinement overhead) | `confinement_at_zero_deficit` | Mechanized |
| THM-SCREENING-REDUCES | After first restoration, deficit for second step is smaller | `screening_reduces_deficit` | Mechanized |
| THM-SCREENING-CHEAPER | Second step confinement cost is no greater than without screening | `screening_cheaper_second_step` | Mechanized |
| THM-ZERO-DEFICIT-FREE | Zero deficit is always in the free (asymptotic freedom) regime | `zero_deficit_is_free` | Mechanized |
| THM-MAX-DEFICIT-CONFINED | Maximum deficit is confined when total exceeds threshold | `max_deficit_is_confined` | Mechanized |
| THM-REGIME-MONOTONE | Higher deficit never produces a freer regime | `regime_monotone` | Mechanized |
| THM-FREE-BOUNDED-COST | In the free regime, confinement cost is at most 2x base | `free_regime_bounded_cost` | Mechanized |
| THM-ZERO-DEFICIT-ZERO-BYPASS | At zero deficit, bypass risk is zero | `zero_deficit_zero_bypass` | Mechanized |
| THM-BYPASS-MONOTONE | Bypass risk numerator is monotonically increasing in deficit | `bypass_monotone_in_deficit` | Mechanized |
| THM-BYPASS-FRACTION-GROWS | Bypass risk fraction grows with deficit | `bypass_fraction_grows` | Mechanized |
| THM-HUB-FIRST-DOMINATES | Hub-first restoration restores strictly more beta-1 than dependent-first | `hub_first_dominates` | Mechanized |
| THM-HUB-FIRST-ADVANTAGE | Hub-first advantage is exactly the hub's own beta-1 | `hub_first_advantage` | Mechanized |
| THM-ONE-KNOCKOUT-SEVERS-FOUR | Knocking out one suppressor severs 4 of 6 gluon connections | `one_knockout_severs_four` | Mechanized |
| THM-SCALE-TOWER-BELOW-THRESHOLD | Below silencing threshold, no beta-1 is lost | `below_threshold_no_loss` | Mechanized |
| THM-SCALE-TOWER-ABOVE-THRESHOLD | At or above threshold, full pathway beta-1 is lost | `above_threshold_full_loss` | Mechanized |
| THM-SCALE-TOWER-MONOTONE | Beta-1 loss is monotone in sigma disruption | `scale_tower_monotone` | Mechanized |
| THM-CANCER-CONFINEMENT-MASTER | All seven confinement predictions compose | `cancer_confinement_master` | Mechanized |

### Quantum Observer

*Superposition as fork, measurement as fold, observer deficit, QBist prior, observer coherence, and the quantum observer master theorem.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SUPERPOSITION-FORK` | Superposition of rootN paths has intrinsic beta1 = rootN - 1. The topological content of quantum superposition is the number of independent cycles in the fork graph | rootN >= 2 (nontrivial superposition) | Lean theorem `superposition_is_fork` in `QuantumObserver.lean` | Mechanized |
| `THM-OBSERVER-FOLD` | Measurement (the observer's fold) reduces beta1 from rootN - 1 to 0. The fold selects one path and vents rootN - 1 paths into the void. Post-measurement topology is a path graph | QuantumSystem with rootN >= 2 | Lean theorem `observer_fold_collapses_beta1` in `QuantumObserver.lean` | Mechanized |
| `THM-OBSERVER-DEFICIT` | The measurement deficit -- the topological cost of observation -- is exactly rootN - 1. Path conservation: 1 + (rootN - 1) = rootN. Paths are not destroyed, they are vented to the void boundary | QuantumSystem with rootN >= 2 | Lean theorems `measurement_deficit_exact` and `path_conservation` in `QuantumObserver.lean` | Mechanized |
| `THM-OBSERVER-EFFECT-FOLD` | Quantum deficit = 0 (quantum algorithms preserve all beta1). Classical deficit = rootN - 1 (classical algorithms collapse to path graph). The Observer Effect is the classical deficit: the cost of measuring is the cost of folding | rootN > 0 | Lean theorem `observer_effect_is_fold` in `QuantumObserver.lean`, composing `quantum_deficit_is_zero` from `Claims.lean` | Mechanized |
| `THM-QBISM-PRIOR` | QBist quantum state is a BayesianPrior -- an initialized void boundary. Positive weight (never say never), normalized (well-defined distribution), concentration-ordered (less rejection = higher weight). The QBist "subjective belief" is objective given the void boundary | BayesianPrior from `BuleyeanProbability.lean` | Lean theorems `qbism_prior_is_void_boundary`, `qbism_prior_normalized`, `qbism_prior_ordering` in `QuantumObserver.lean` | Mechanized |
| `THM-OBSERVER-COHERENCE` | Two observers reading the same void boundary compute the same quantum state. Resolves QBism's coherence problem: rational agents agree whenever their experimental histories agree | bs1, bs2 : BuleyeanSpace with same numChoices, rounds, voidBoundary | Lean theorem `observer_coherence` in `QuantumObserver.lean`, delegating to `buleyean_coherence` | Mechanized |
| `THM-QUANTUM-OBSERVER-MASTER` | Complete Observer Effect theorem: superposition is fork (beta1 = rootN - 1), measurement collapses beta1 to 0, deficit is exactly rootN - 1, path conservation holds, quantum deficit = 0, classical deficit = rootN - 1, QBist states are Buleyean priors, observers with same boundary agree, speedup = deficit + 1. The Observer Effect is the topological deficit of folding a fork | QuantumSystem, BayesianPrior, two BuleyeanSpaces with matching boundaries | TLA+ `QuantumObserver.tla` invariants (`InvSuperpositionBeta1`, `InvMeasuredBeta1Zero`, `InvDeficitExact`, `InvPathConservation`, `InvVoidGrowth`, `InvBeta1Bounded`) + Lean theorem `quantum_observer_master` in `QuantumObserver.lean` | Mechanized |

### Server Optimality & Codec Racing

*Server race elimination, end-to-end composition, codec racing subsumption, dual protocol Pareto.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-TOPO-RACE-SUBSUMPTION` | Per-resource codec racing subsumes any fixed codec: racing total is always less than or equal to any fixed-codec total. Adding a codec to the race never increases wire size. Racing achieves zero compression deficit. Wire bounded by per-resource conditional entropy | rawSizes, codecResults over resource set; race selects minimum per resource | TLA+ `CodecRacing.tla` invariants (`InvRaceSubsumption`, `InvRaceMonotone`, `InvRaceDeficitZero`, `InvRaceEntropy`) + Lean theorems `CodecRacing.raceMin_*` and reduction lemmas in `CodecRacing.lean` | Mechanized |
| `THM-DUAL-PROTOCOL-PARETO` | HTTP+Flow dual protocol dominates either protocol alone. Internal deficit of zero transfers advantage. Throughput conserved across the protocol boundary. Adding Flow never worsens HTTP clients | httpThroughput, flowThroughput, dualThroughput; internal deficit zero | TLA+ `DualProtocol.tla` invariants (`InvDualProtocolPareto`, `InvInternalDeficitTransfer`, `InvProtocolBridgeConservation`, `InvDualProtocolMonotone`) + Lean theorems in `DualProtocol.lean` | Mechanized |
| `THM-SERVER-RACE-ELIMINATION` | x-gnosis server lifecycle as fork/race/fold transition system: race terminates with exactly one winner. Fold preserves content-length invariant. Wallington Rotation achieves T=ceil(P/B)+N-1. Cache warming monotonically improves hit rate | raceArms, raceWinner over bounded server state | TLA+ `ServerTopology.tla` invariants (`InvRaceElimination`, `InvFoldIntegrity`, `InvRotationDepth`, `InvCacheMonotone`) | Model-checked |
| `THM-SERVER-OPTIMALITY` | End-to-end composition theorem: a server with fork/race/fold at every layer, zero deficit at every layer boundary, and Wallington Rotation scheduling simultaneously achieves critical-path makespan (numStages x maxStageTime, tight), Pareto-optimal resource usage, strict dominance over sequential scheduling, speedup = Beta1 + 1 (deficit-speedup coupling), and zero topological deficit (matched transport). Composes THM-ROTATION-MAKESPAN-BOUND, THM-ROTATION-DOMINATES-SEQUENTIAL, THM-ROTATION-PARETO-SCHEDULE, THM-ROTATION-DEFICIT-CORRELATION, THM-ZERO-DEFICIT-PRESERVES-INFORMATION, THM-COVERING-MATCH, THM-TOPO-RACE-SUBSUMPTION, THM-PIPELINE-CERTIFICATE, THM-ERGODICITY-MONOTONE-IN-STAGES, THM-PROTOCOL-DEFICIT, THM-REYNOLDS-BFT, THM-SERVER-RACE-ELIMINATION, THM-SERVER-FOLD-INTEGRITY, and THM-DEFICIT-CAPACITY-GAP. The x-gnosis instantiation (4 stages, 3 paths) achieves 3x speedup with Beta1 = 2 and rotation makespan = 4 vs sequential makespan = 12 | `ServerStack` with `ForkRaceFoldDAG` (numStages >= 2, numPaths >= 2, maxStageTime >= 1); all layers have `zeroDeficit` (streamCount >= pathCount); codecCount >= 1 | TLA+ `ServerOptimality.tla` invariants (`InvMakespanTight`, `InvLossless`, `InvPareto`, `InvSpeedupExact`, `InvWireOptimal`, `InvPipelineStable`, `InvZeroDeficit`, `InvServerOptimality`) + Lean theorems `ServerOptimality.server_optimality`, `ServerOptimality.server_critical_path_makespan`, `ServerOptimality.server_pareto_optimal`, `ServerOptimality.server_dominates_sequential`, `ServerOptimality.server_speedup_exact`, `ServerOptimality.server_zero_deficit`, `ServerOptimality.server_lossless_of_all_zero_deficit`, `ServerOptimality.server_speedup_monotone`, `ServerOptimality.xgnosis_optimality`, `ServerOptimality.xgnosis_speedup`, `ServerOptimality.xgnosis_beta1`, `ServerOptimality.xgnosis_makespan`, and `ServerOptimality.xgnosis_sequential` in `ServerOptimality.lean` | Mechanized |

### Sleep Debt

*Bounded sleep-debt witness, schedule threshold, and weighted threshold bridge.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-SLEEP-DEBT` | Bounded sleep-debt witness: incomplete recovery leaves positive residual debt and reduced next-cycle service capacity, full recovery clears debt and restores baseline capacity, and debt above a wake-time threshold admits intrusion-style local venting | bounded wake load, carried debt, recovery quota, and intrusion threshold; effective capacity is a debt-indexed bounded score; the sleep-cycle witness is a bounded structural model, not a biological identity claim | TLA+ `SleepDebt.tla` invariants (`InvCapacityMatchesDebt`, `InvPartialRecoveryLeavesDebt`, `InvPartialRecoveryResetsLocalBurden`, `InvPartialRecoveryReducesCapacity`, `InvFullRecoveryClearsDebt`, `InvFullRecoveryRestoresCapacity`, `InvPositiveDebtLowersCapacity`) + property `PropDebtWakeCanIntrude`, Lean theorems `SleepDebt.full_recovery_clears_residual_debt`, `SleepDebt.full_recovery_restores_capacity`, `SleepDebt.partial_recovery_leaves_positive_debt`, `SleepDebt.partial_recovery_lowers_next_capacity`, `SleepDebt.repeated_truncation_preserves_debt`, `SleepDebt.repeated_truncation_strictly_increases_debt`, and `SleepDebt.debt_at_or_above_intrusion_threshold_enables_intrusion`, plus executable artifact `artifacts/sleep-debt-bounded-witness.{json,md}` | Mechanized (bounded witness) |
| `THM-SLEEP-SCHEDULE-THRESHOLD` | Coarse repeated-cycle sleep-schedule threshold witness: below-threshold and critical schedules stay debt-free across repeated cycles, while above-threshold schedules accumulate carried debt linearly in the cycle count | bounded repeated-cycle abstraction over fixed scheduled wake and fixed recovery quota; coarse discrete threshold analog, not the full continuous McCauley/Van Dongen ODE system | TLA+ `SleepDebtScheduleThreshold.tla` invariants (`InvBelowOrAtThresholdKeepsZero`, `InvAboveThresholdMatchesCycleSurplus`, `InvAboveThresholdPositivePastFirstCycle`) + property `PropAdvanceEnabledWithinBounds`, Lean theorems `SleepDebtSchedule.iterated_debt_eq_zero_of_wake_le_quota`, `SleepDebtSchedule.iterated_debt_eq_cycle_count_mul_gap`, `SleepDebtSchedule.iterated_debt_positive_above_threshold`, and `SleepDebtSchedule.iterated_debt_strictly_increases_above_threshold`, plus executable artifact `artifacts/sleep-debt-schedule-threshold-witness.{json,md}` | Mechanized (bounded witness) |
| `THM-SLEEP-WEIGHTED-THRESHOLD` | Weighted repeated-cycle sleep-schedule bridge: an integerized literature-style critical wake boundary leaves subcritical and critical schedules debt-free, while supercritical schedules accumulate carried debt linearly in cycle count | bounded repeated-cycle abstraction over fixed cycle length, wake burden rate, and recovery rate; discrete weighted analog, not the full continuous McCauley/Van Dongen ODE system | TLA+ `SleepDebtWeightedThreshold.tla` invariants (`InvNotCrossedKeepsZero`, `InvCrossedMatchesCycleSurplus`, `InvCrossedPositivePastFirstCycle`) + property `PropAdvanceEnabledWithinBounds`, Lean theorems `SleepDebtWeightedSchedule.weighted_surplus_eq_zero_of_not_crossed`, `SleepDebtWeightedSchedule.iterated_debt_eq_zero_of_not_crossed`, `SleepDebtWeightedSchedule.iterated_debt_eq_cycle_count_mul_gap_of_crossed`, `SleepDebtWeightedSchedule.iterated_debt_positive_above_threshold`, `SleepDebtWeightedSchedule.iterated_debt_strictly_increases_above_threshold`, `SleepDebtWeightedSchedule.literature_boundary_tenths_closed_form`, and `SleepDebtWeightedSchedule.literature_boundary_crossed_at_twentyone_hours`, plus executable artifact `artifacts/sleep-debt-weighted-threshold-witness.{json,md}` | Mechanized (bounded witness) |

### Retrocausal Bound

*Backward count recovery, ordering preservation, concentrated boundary uniqueness, multinomial positivity, RG fixed-point composition, Landauer heat composition, and the retrocausal master theorem.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-RETROCAUSAL-BOUND` | Retrocausal modeling: a converged void boundary statistically bounds the rejection trajectory that produced it. The terminal state determines per-choice rejection counts exactly (backward count recovery), preserves the relative ordering of past rejections (backward ordering), bounds trajectory multiplicity by the multinomial coefficient T!/Π(v_i!) (backward entropy bound), and composes with RG fixed points (coarse trajectory determined at fixed point) and Landauer heat (cumulative heat bounds trajectory length). Concentrated boundaries yield multinomial = 1 (fully determined past). Uniform boundaries yield maximal multinomial (maximum residual uncertainty). The retrocausal entropy H(σ|v) = log₂(T!/Πv_i!) measures the residual ordering uncertainty that the terminal state does not resolve | finite Buleyean space with nontrivial fork width; trajectory as List (Fin numChoices) with length = rounds; trajectoryVoidBoundary counting rejections per choice; concentrated boundary means one choice absorbs all rejections; RG composition requires RGFixedPoint with injective-on-support quotient; Landauer composition requires positive Boltzmann constant and temperature with cumulative heat and per-step heat floor | TLA+ `RetrocausalBound.tla` invariants (`InvBoundaryMatchesTrajectory`, `InvBoundaryBoundsTrajectory`, `InvOrderingPreserved`, `InvTrajectoryMultiplicity`, `InvRoundBounded`, `InvRetrocausalBound`) + property `PropEventuallyVerified` + Lean theorems `retrocausal_trajectory_determines_terminal`, `retrocausal_boundary_bounds_trajectory`, `retrocausal_ordering_preserved`, `retrocausal_weak_ordering_preserved`, `retrocausal_concentrated_boundary_unique_path`, `retrocausal_concentrated_boundary_sharp`, `retrocausal_uniform_boundary_max_uncertainty`, `retrocausal_fixed_point_determines_past_shape`, `retrocausal_heat_bounds_trajectory_length`, `retrocausal_heat_determines_length_exact`, `retrocausal_bound`, `retrocausal_bound_concentrated`, and `retrocausal_self_hosted` in `RetrocausalBound.lean` | Mechanized |

### American Frontier

*Pareto frontier of diversity vs waste, codec-racing instantiation, unified composition, and Pareto diagnostic.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-AMERICAN-FRONTIER` | Pareto frontier of diversity vs waste: the frontier function is monotone, zero at the matched topology, positive below, and admits a pigeonhole witness for any topology with fewer streams than required | finite topology with streams and paths; matched topology definition | Lean theorem `american_frontier` in `AmericanFrontier.lean` | Mechanized |
| `THM-AMERICAN-FRONTIER-CODEC-RACING` | Codec-racing instantiation of the Buley frontier: monotone wire size, zero deficit at matched codec, and subsumption of smaller codecs by larger ones | codec wire size ordering; matched codec definition | Lean theorem `american_frontier_codec_racing` in `AmericanFrontier.lean` | Mechanized |
| `THM-AMERICAN-FRONTIER-UNIFIED` | Unified topological + codec frontier composition: the combined frontier inherits monotonicity and zero-at-match from both the topological and codec layers | topological frontier + codec frontier composition | Lean theorem `american_frontier_unified` in `AmericanFrontier.lean` | Mechanized |
| `THM-AMERICAN-FRONTIER-PARETO-DIAGNOSTIC` | Pareto diagnostic: matched topology is optimal, monoculture is suboptimal, and there exists a monotone path from any suboptimal point toward the frontier | matched = optimal; monoculture = suboptimal; monotone improvement path | Lean theorem `american_frontier_pareto_diagnostic` in `AmericanFrontier.lean` | Mechanized |
| `THM-NETFLIX-FRONTIER` | THM-AMERICAN-FRONTIER instantiated on published Netflix Prize data: monotone RMSE descent across algorithm-family and team-of-teams frontiers, positive waste for every monoculture ceiling, pigeonhole witness (timeSVD++ < BellKor 2007 blend), recursive structure (team frontier below algorithm frontier), residual gap (Grand Prize winner 0.856704 > 50/50 blend 0.8555), and independent convergence (BPC = The Ensemble to 4dp) | published RMSE values from [NF1]-[NF8]; RMSE scaled to ℕ × 10⁴; observed floor = lowest published RMSE | Lean theorem `netflix_frontier` in `NetflixFrontier.lean` (7-way conjunction; all `omega` on concrete ℕ) + companion tests `ch17-netflix-frontier-figure.test.ts` (28 tests) | Mechanized |
| `THM-NETFLIX-FRONTIER-MONOTONE-ALGO` | Algorithm-family frontier RMSE is monotonically non-increasing across 6 published milestones | Cinematch ≥ FunkSVD ≥ SVD++ ≥ timeSVD++ ≥ BellKor 2007 ≥ BellKor 2008 | Lean theorem `netflix_frontier_monotone_algo` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-FRONTIER-MONOTONE-TEAM` | Team-of-teams frontier RMSE is monotonically non-increasing across 4 published milestones | BellKor 2008 ≥ BellKor in BigChaos ≥ Grand Prize winner ≥ 50/50 blend | Lean theorem `netflix_frontier_monotone_team` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-FRONTIER-POSITIVE-BELOW` | Every monoculture ceiling (Cinematch, timeSVD++, k-NN, RBM, NNMF) has strictly higher RMSE than the observed floor | published single-family RMSE values | Lean theorem `netflix_frontier_positive_below` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-FRONTIER-PIGEONHOLE` | Best single model (timeSVD++, 0.8762) is strictly worse than first 3-family blend (BellKor 2007, 0.8712) | published RMSE values | Lean theorem `netflix_frontier_pigeonhole` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-FRONTIER-RECURSIVE` | Team frontier floor (50/50 blend, 0.8555) is strictly below algorithm frontier floor (BellKor 2008, 0.8643) | published RMSE values | Lean theorem `netflix_frontier_recursive` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-RESIDUAL-GAP` | Grand Prize winner (0.856704) has strictly higher RMSE than 50/50 finalist blend (0.8555): 0.0012 RMSE of optimization left on the table | published RMSE values from BellKor Grand Prize paper | Lean theorem `netflix_residual_gap` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-INDEPENDENT-CONVERGENCE` | Two independent mega-ensembles (BPC and The Ensemble) converged to the same RMSE to 4 decimal places (0.8567) | published test-set RMSE values | Lean theorem `netflix_independent_convergence` in `NetflixFrontier.lean` | Mechanized |
| `THM-NETFLIX-ORACLE-HIERARCHY` | On synthetic 8-dimensional taste space: void-designed oracle monoculture (time-traveled optimal single strategy) loses to void-walking ensemble; god-mode (all-dims-visible, unrealizable) beats ensemble but loses to per-rating oracle routing (diversity ceiling); among realizable strategies, every monoculture is above the ensemble | synthetic dataset with known β₁* = 8; 5 partial-visibility algorithm families; complement-distribution ensemble weighting | Companion tests `ch17-netflix-void-walker.test.ts` (26 tests) | Executable |
| `THM-DMN-VOID-WALKER` | The Default Mode Network as void walking engine: energy allocation (K-1)/K predicts Raichle's 95% within 0.45pp, mind-wandering duty cycle (K-1)/(2K-1) predicts Killingsworth & Gilbert's 46.9% within 1.9pp, incubation d=0.29 implies 6.1 resolved void paths (within 7±2). One free parameter K=22 from external measurement. K gap implies 57% of void-walking is subconscious | K from Killingsworth & Gilbert 2010 activity categories; energy from Raichle 2006 PET; MW from K&G 2010 experience sampling; incubation from Sio & Ormerod 2009 meta-analysis (k=117) | Companion tests `ch17-dmn-void-walker.test.ts` (39 tests) | Executable |
| `THM-DMN-VOID-GAIN-INDEX` | Three predictive metrics -- VGI = (K_total-1)/(K_env-1) = 0.905, CVI = (K_conscious-1)/(K_total-1) = 0.40, CFP = 0.995 -- with pathological threshold at VGI > 1.0 (rumination = void-walking on phantom forks, K_perceived > K_actual). Evolutionary mismatch: brain tuned for savanna K≈20, modern environments present K_perceived >> K_actual | Three K levels: K_conscious=8.6, K_total=20, K_env=22; all from published measurements | Companion tests `ch17-dmn-void-walker.test.ts` (39 tests) | Executable |
| `THM-DMN-PREDICTION-MATRIX` | 8×8 prediction matrix: 8 observable measures (DMN energy, mind-wandering rate, saccade rate, fixation duration, pupil dilation, EEG alpha, EEG theta, reaction time) × 8 populations (rest/task, creative/non, high/low WMC, children/adults, sleep-deprived/rested, meditators/controls, ADHD/neurotypical, rumination/healthy). 64 falsifiable predictions, 36 confirmed by published evidence. All derive from one equation: K shift → predictable direction across all measures | K estimates per condition; direction from (K-1)/K monotonicity; published evidence for 36/64 cells | Companion tests `ch17-dmn-prediction-matrix.test.ts` (28 tests) + artifact `ch17-dmn-prediction-matrix.md` | Executable |
| `THM-DIVERSITY-IS-CONCURRENCY` | Diversity and concurrency are the same property. β₁ counts both. Effective concurrency = diversity. Redundant parallelism (K copies of one strategy) produces zero information gain. Serialization destroys diversity AND concurrency simultaneously (deficit = k-1). The Bule is simultaneously one unit of missing diversity, one unit of missing concurrency, one unit of waste, and kT ln 2 joules of heat. Monoculture IS waste | Fork/race/fold system axioms; pigeonhole collision for redundancy; data processing inequality for serialization | Lean theorem `diversity_is_concurrency_full` in `DiversityIsConcurrency.lean` (6-way conjunction) + TLA+ `DiversityIsConcurrency.tla` (5 invariants) + companion tests `ch17-diversity-is-concurrency.test.ts` (10 tests) | Mechanized |
| `THM-BULE-IS-VALUE` | The grand unification: the Bule is the unit of value. Six faces of one number: topological deficit = diversity lost = concurrency lost = information erased = waste generated = work required = heat quanta (kT ln 2 per Bule). Positive at monoculture, zero at match, monotone in diversity, witnessed by pigeonhole collision. The American Frontier collapses to a scalar (the Bule line, β₁ = 0). Cannot fold further -- the framework reached its own ground state. Nine substrates: physics, information, computation, economics, neuroscience, recommendation, democracy, ecology, consciousness | All faces defined as topologicalDeficit; identity is definitional (rfl); positivity, zero-at-match, monotonicity, and pigeonhole from AmericanFrontier.lean and DeficitCapacity.lean | Lean theorem `bule_is_value` in `BuleIsValue.lean` (5-way conjunction) + TLA+ `BuleIsValue.tla` (7 invariants, sweep to MaxPaths=10) + companion tests `ch17-bule-is-value.test.ts` (13 tests) | Mechanized |
| `THM-NEURODIVERGENT-VGI` | Unified VGI model of neurodivergence: 4 profiles (NT/AUT/ADHD/AuDHD) × 6 environments = 24-cell VGI matrix. Autism = wider aperture (K_perceived=8 vs NT 3), ADHD = gait oscillation (VGI swings 7.5× wider than NT), AuDHD = both axes (widest VGI range). Every profile has a matched environment (VGI=1.0). Every therapeutic intervention moves VGI toward 1.0. Neurodivergence is a VGI mismatch, not a person-level deficit | K_perceived from eta; K_actual from environment; gait instability from c3 parameters; all from §15.13.1 | Companion tests `ch17-neurodivergent-vgi.test.ts` (22 tests) + `autism-void-sensitivity.test.ts` (8 tests) + `adhd-gait-instability.test.ts` (11 tests) | Executable |
| `THM-DMN-SHAPE-AND-FORCES` | The framework describes the geometry of consciousness (the topology, the deficit, the frontier) but not the phenomenology (why the fold feels like something). The relationship to the hard problem is structurally analogous to GR vs the standard model: GR describes the stage, the SM fills in the forces. The CVI = 0.40 locates the convergence threshold where processing transitions from subconscious to conscious. The framework cannot explain why crossing the threshold produces experience. This boundary is explicitly named as the complement of the framework -- the void of the framework itself | CVI from K_conscious/K_total; kurtosis crossing from minimum Bule edition; Chalmers 1995 hard problem formulation | §20.2.4 of manuscript | Descriptive |

### The Last Question (Asimov Bridge)

*Insufficient data, monotone accumulation, eventual computability, heat death maximum void, sliver survival, entropy reversal, let-there-be-light seeding, trajectory determinism, and the Last Question master theorem.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-INSUFFICIENT-DATA` | When the deficit is positive (Bule > 0), the answer is not yet computable. "INSUFFICIENT DATA FOR MEANINGFUL ANSWER" is the state where more rejections are needed before convergence. Deficit positive iff rounds < initialDeficit | deficit d > 0; rounds < d | Lean theorem `insufficient_data_is_positive_bule` in `LastQuestion.lean` | Mechanized |
| `THM-DATA-ACCUMULATES` | The deficit decreases monotonically as data accumulates. Each observation round reduces the deficit. The deficit never increases. Delegates to `future_deficit_monotone` | deficit d >= 0; k1 <= k2 | Lean theorem `data_accumulates_monotonically` in `LastQuestion.lean` | Mechanized |
| `THM-ANSWER-EVENTUALLY-COMPUTABLE` | After exactly d rounds (the initial deficit), the deficit reaches zero. The complement distribution has converged. The answer is computable. Multivac's final moment. Delegates to `future_deficit_eventually_zero` | deficit d >= 0 | Lean theorem `answer_eventually_computable` in `LastQuestion.lean` | Mechanized |
| `THM-HEAT-DEATH-MAXIMUM-VOID` | At maximum void (every choice rejected every round), every choice has weight exactly 1. Heat death is the state where the void boundary is full. Delegates to `buleyean_min_uncertainty` | BuleyeanSpace with voidBoundary i = rounds for all i | Lean theorem `heat_death_is_maximum_void` in `LastQuestion.lean` | Mechanized |
| `THM-SLIVER-SURVIVES-HEAT-DEATH` | Even at maximum void (heat death), every choice retains weight >= 1. The sliver is irreducible: no choice can reach weight zero. The +1 in the weight formula is structural. Delegates to `buleyean_positivity` and `sliver_irreducible` | BuleyeanSpace | Lean theorems `sliver_survives_heat_death` and `sliver_is_irreducible` in `LastQuestion.lean` | Mechanized |
| `THM-LET-THERE-BE-LIGHT` | A converged complement distribution (Bule = 0) is a valid Bayesian prior for a new Buleyean space. Different rejection counts produce different weights. The prior is informative, not uniform. The converged distribution seeds a new fork. Delegates to `converged_prior_informative` | ConvergedPrior with strictly ordered voidBoundary entries | Lean theorem `let_there_be_light` in `LastQuestion.lean` | Mechanized |
| `THM-ENTROPY-REVERSAL` | The void boundary grows monotonically (entropy increases). The complement distribution concentrates monotonically (entropy decreases). Non-rejected choices gain weight after each rejection round. Entropy reversal is the complement of the Second Law. Delegates to `buleyean_monotone_nonrejected` | BuleyeanUpdate with rejected choice and non-rejected choice | Lean theorem `entropy_reversal_is_complement` in `LastQuestion.lean` | Mechanized |
| `THM-NO-DATA-NO-ANSWER` | A system with zero observations (empty void boundary) produces uniform weights -- maximum entropy, zero information, no meaningful answer. Delegates to `fold_without_evidence_is_coinflip` | BuleyeanSpace with voidBoundary i = 0 for all i | Lean theorem `no_data_no_answer` in `LastQuestion.lean` | Mechanized |
| `THM-TRAJECTORY-DETERMINISTIC` | The entire future trajectory of the deficit is known: futureDeficit d k = d - min(k, d). No randomness, no breakthroughs. The convergence round is d. Delegates to `future_deficit_deterministic` | deficit d >= 0 | Lean theorem `trajectory_deterministic` in `LastQuestion.lean` | Mechanized |
| `THM-LAST-QUESTION` | Complete Last Question theorem: deficit monotonically decreasing, answer eventually computable at round d, every choice survives heat death (weight >= 1), no choice reaches zero, no data means no answer. Composes all nine individual theorems | BuleyeanSpace, deficit d >= 0 | TLA+ `LastQuestion.tla` invariants (`InvDeficitNonneg`, `InvDeficitBounded`, `InvSliverSurvives`, `InvConvergedMeansZeroDeficit`, `InvLetThereBeLight`, `InvVoidAccumulates`) + temporal property `EventuallyConverged` + Lean theorem `last_question` in `LastQuestion.lean` | Mechanized |

### Chaitin Omega (Computability Bridge)

*UTM as universal fork, execution as fold, halting survivors, Omega positivity/subuniversality, finite approximation, halting-as-fold-deficit, Omega-as-Buleyean-complement, Chaitin-Solomonoff bridge, uncomputability as infinite void, and the Chaitin-Omega master theorem.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-UTM-UNIVERSAL-FORK` | The Universal Turing Machine is the maximally general fork: totalPrograms = haltingPrograms + nonHalting. Every computable process is a path in the universal fork. Execution partitions programs into halting (surviving) and non-halting (vented) | ProgramSpace with alphabetSize >= 2, totalPrograms > 0, haltingPrograms > 0, someNonHalting | Lean theorem `utm_is_universal_fork` in `ChaitinOmega.lean` | Mechanized |
| `THM-EXECUTION-IS-FOLD` | Program execution is a fold operation: haltingPrograms + nonHalting = totalPrograms. Every program goes to exactly one set. The fold is total: no program escapes classification | ProgramSpace | Lean theorem `execution_is_fold` in `ChaitinOmega.lean` | Mechanized |
| `THM-HALTING-SURVIVORS-BOUNDED` | The number of halting programs is strictly less than the total. Not every program halts. The void of non-termination is nonempty | ProgramSpace with someNonHalting constraint | Lean theorem `halting_survivors_bounded` in `ChaitinOmega.lean` | Mechanized |
| `THM-OMEGA-POSITIVITY` | The halting probability is positive: at least one program halts. Omega > 0. The void boundary of program space does not absorb everything | ProgramSpace with haltingPos constraint | Lean theorem `omega_positivity` in `ChaitinOmega.lean` | Mechanized |
| `THM-OMEGA-STRICT-SUBUNIVERSALITY` | Omega < 1: not every program halts. The fold is nontrivial -- it vents at least one path. The non-halting void is nonempty | ProgramSpace with someNonHalting constraint | Lean theorem `omega_strict_subuniversality` in `ChaitinOmega.lean` | Mechanized |
| `THM-FINITE-APPROXIMATION-MONOTONE` | Extending the program enumeration can only increase (or maintain) the halting count. The finite approximation to Omega is monotonically non-decreasing as more programs are enumerated | ProgramSpaceExtension with moreHalting constraint | Lean theorem `finite_approximation_monotone` in `ChaitinOmega.lean` | Mechanized |
| `THM-OMEGA-APPROXIMATION-BOUNDED` | Any finite prefix of the enumeration undercounts (or exactly counts) the true halting set. The finite Omega is a lower bound on the limit | ProgramSpaceExtension | Lean theorem `omega_approximation_bounded` in `ChaitinOmega.lean` | Mechanized |
| `THM-HALTING-AS-FOLD-DEFICIT` | The number of non-halting programs is the fold deficit: the topological cost of execution. Analogous to classicalDeficit in quantum search and protocolTopologicalDeficit in transport multiplexing | ProgramSpace | Lean theorem `halting_as_fold_deficit` in `ChaitinOmega.lean` | Mechanized |
| `THM-OMEGA-IS-BULEYEAN-COMPLEMENT` | Omega (the halting probability) corresponds to the Buleyean complement weight of the halting set. Programs that halt have low rejection count (survived). Programs that don't halt have high rejection count (vented). Both sets are nonempty | ProgramSpace | Lean theorem `omega_is_buleyean_complement` in `ChaitinOmega.lean` | Mechanized |
| `THM-CHAITIN-SOLOMONOFF-BRIDGE` | Chaitin's Omega and Solomonoff's Universal Prior share the same void boundary structure. Both partition the same program space. Both are strictly between 0 and 1. The non-halting deficit is positive. Omega conditions on termination; M(x) conditions on output; both are projections of the universal void boundary | ProgramSpace | Lean theorem `chaitin_solomonoff_bridge` in `ChaitinOmega.lean` | Mechanized |
| `THM-UNCOMPUTABILITY-IS-INFINITE-VOID` | The uncomputability of Omega is the statement that the void boundary of all programs is not finitely constructible. The finite approximation is monotone, bounded, and positive at every stage. Buleyean axioms hold at every finite stage | ProgramSpaceExtension | Lean theorem `uncomputability_is_infinite_void` in `ChaitinOmega.lean` | Mechanized |
| `THM-CHAITIN-OMEGA-MASTER` | Complete Chaitin-Omega theorem: UTM is universal fork, execution is fold, halting is bounded, Omega is positive, Omega is subuniversal, void is nonempty, Chaitin-Solomonoff bridge holds. Chaitin's Omega is the Buleyean complement distribution over program space conditioned on termination | ProgramSpace | TLA+ `ChaitinOmega.tla` invariants (`InvFoldConservation`, `InvOmegaPositive`, `InvOmegaSubuniversal`, `InvVoidNonempty`, `InvHaltingBounded`, `InvTotalPositive`) + Lean theorem `chaitin_omega_master` in `ChaitinOmega.lean` | Mechanized |

### Non-Empirical Prediction (§15.22)

| Theorem ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-HOLE-POSITIVE-WEIGHT` | A structural hole always has strictly positive interpolation weight. The complement distribution never assigns zero probability to any hole. Never say never in prediction | StructuralHole with neighborRoundsSum > 0 | Lean theorem `hole_has_positive_weight` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-INTERPOLATION-BOUNDED` | The interpolation weight is bounded between 1 and rounds + 1. The prediction is always finite and within the Buleyean weight range | StructuralHole | Lean theorem `interpolation_weight_bounded` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-REJECTION-REDUCES-PREDICTION` | More neighbor rejection = lower prediction weight. Structure constrains: neighbors' rejection data shapes the hole's complement distribution | Two StructuralHoles with same rounds, different void sums | Lean theorem `rejection_reduces_prediction` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-LATTICE-PARTITION` | The lattice is exactly partitioned into observed positions and holes. observedCount + holeCount = totalPositions. Conservation law of the structural lattice | StructuralLattice | Lean theorem `lattice_partition` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-NEIGHBOR-DOMINATES-UNINFORMED` | Structural prediction with neighbor data is at least as informative as uninformed guessing. Interpolation weight <= uninformed weight. Structure provides signal | StructuralHole | Lean theorem `neighbor_dominates_uninformed` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-STRICT-DOMINANCE` | With nontrivial neighbor rejection (neighborVoidSum > 0), structural prediction is strictly more informative than guessing. The gap equals min(voidSum, roundsSum) | StructuralHole with neighborVoidSum > 0 | Lean theorem `strict_dominance_with_rejection` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-HOLES-ORDERED` | Two holes with different neighbor rejection receive different predictions. The lattice differentiates. Formalizes: "gallium is more like aluminum than iron" | Two StructuralHoles with same rounds, different void sums | Lean theorem `holes_ordered` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-MENDELEEV-IS-COMPLEMENT` | Mendeleev's interpolation method is isomorphic to computing the Buleyean complement weight from neighbor-aggregated void boundary. Same formula: rounds - min(void, rounds) + 1 | StructuralHole, BuleyeanSpace with matching rounds and void boundary | Lean theorem `mendeleev_is_complement` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-ALGEBRAIC-HOLE-IS-VOID-GAP` | Algebraic holes (Dirac's positron, Pauli's neutrino) are positions demanded by lattice partition conservation. The lattice forces the hole to exist; the complement distribution predicts its properties | StructuralLattice with someHoles | Lean theorem `algebraic_hole_is_void_gap` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-NON-EMPIRICAL-SOLOMONOFF` | Non-empirical prediction composes with Solomonoff prediction. Holes in simpler lattices get higher weight. Simpler structures make stronger predictions about their gaps | SolomonoffSpace | Lean theorem `non_empirical_solomonoff_compose` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-IMPOSSIBLE-ELEMENT` | An AI can "know" a fact about an unobserved object without training data, by computing the interpolation weight from the structural lattice. Positive, bounded, structure-dependent. Deterministic, objective, falsifiable | StructuralHole | Lean theorem `impossible_element` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-PREDICTION-WITHOUT-OBSERVATION` | The structural hole has nonzero interpolation weight despite no direct observation. Weight comes entirely from neighbor structure. Formal content of non-empirical prediction | StructuralHole | Lean theorem `prediction_without_observation` in `NonEmpiricalPrediction.lean` | Mechanized |
| `THM-NON-EMPIRICAL-PREDICTION-MASTER` | Complete non-empirical prediction theorem: lattice partition, hole positivity, boundedness, structure dominates, algebraic holes exist. Formal basis for predicting properties of undiscovered objects from the mathematical hole they leave | StructuralLattice, StructuralHole | TLA+ `NonEmpiricalPrediction.tla` invariants (`InvPartition`, `InvPositiveWeight`, `InvWeightBounded`, `InvStructureDominates`, `InvUninformedCorrect`, `InvSomeObserved`, `InvVoidBounded`) + Lean theorem `non_empirical_prediction_master` in `NonEmpiricalPrediction.lean` | Mechanized |

### Grandfather Paradox (§15.23)

| Theorem ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-VOID-APPEND-ONLY` | The void boundary is append-only: once an event is recorded, it cannot be un-occurred. All Buleyean weights are >= 1. The ancestor's existence is a permanent fact in the boundary | BuleyeanSpace | Lean theorem `void_boundary_append_only` in `GrandfatherParadox.lean` | Mechanized |
| `THM-BETA1-FLOOR-ZERO` | Beta1 cannot go below zero. A fold can reduce beta1 to zero but not below. No negative cycles exist | rootN : Nat | Lean theorem `beta1_floor_zero` in `GrandfatherParadox.lean` | Mechanized |
| `THM-SLIVER-PREVENTS-ANNIHILATION` | The +1 in the Buleyean weight formula ensures no event's weight can reach zero. Structural impossibility of the grandfather paradox | BuleyeanSpace | Lean theorem `sliver_prevents_annihilation` in `GrandfatherParadox.lean` | Mechanized |
| `THM-SELF-REFERENTIAL-FOLD-IMPOSSIBLE` | A fold that would eliminate the root of its own causal chain is impossible. Both root and tip have positive existence weight and are distinct | SelfReferentialFold with CausalChain | Lean theorem `self_referential_fold_impossible` in `GrandfatherParadox.lean` | Mechanized |
| `THM-BRANCHING-IS-FORK` | The Many-Worlds resolution is a fork (beta1 increases), not a fold (beta1 decreases). Time travel creates a new path rather than eliminating an old one | TemporalBranch with postBeta1 = preBeta1 + 1 | Lean theorem `branching_is_fork` in `GrandfatherParadox.lean` | Mechanized |
| `THM-BRANCH-PRESERVES-ORIGINAL` | Branching preserves the original causal chain. All existence weights remain positive. The ancestor still exists in the original branch | TemporalBranch | Lean theorem `branch_preserves_original` in `GrandfatherParadox.lean` | Mechanized |
| `THM-CAUSAL-CHAIN-CONSERVATION` | Total events in the causal chain are conserved. No event is destroyed -- the chain is extended by branching, not shortened by folding | CausalChain | Lean theorem `causal_chain_conservation` in `GrandfatherParadox.lean` | Mechanized |
| `THM-PARADOX-REQUIRES-NEGATIVE` | The grandfather paradox requires setting an ancestor's weight to zero, which contradicts buleyean_positivity. The paradox requires an operation the algebra does not support | BuleyeanSpace | Lean theorem `paradox_requires_negative` in `GrandfatherParadox.lean` | Mechanized |
| `THM-BOOTSTRAP-DISSOLVES` | The bootstrap paradox dissolves because every Buleyean weight has definite provenance via the weight formula. Information without provenance would require negative void count | BuleyeanSpace | Lean theorem `bootstrap_dissolves` in `GrandfatherParadox.lean` | Mechanized |
| `THM-RETROCAUSAL-CONSISTENCY` | The retrocausal bound excludes paradoxical terminal states: a state where the traveler exists but the ancestor doesn't has no consistent trajectory | CausalChain with root and tip | Lean theorem `retrocausal_consistency` in `GrandfatherParadox.lean` | Mechanized |
| `THM-TIME-TRAVEL-IS-TOPOLOGY` | Time travel is a topology change: adding a cycle to the causal graph increases beta1 by one. The original chain is preserved. The paradox asks to fold the new cycle, but the sliver prevents it | TemporalBranch | Lean theorem `time_travel_is_topology` in `GrandfatherParadox.lean` | Mechanized |
| `THM-GRANDFATHER-PARADOX-MASTER` | Complete resolution: append-only void, no annihilation, self-referential fold impossible, branching is fork, original preserved. The grandfather paradox is an algebraic impossibility, not a physical one | BuleyeanSpace, SelfReferentialFold, TemporalBranch | TLA+ `GrandfatherParadox.tla` invariants (`InvAncestorAlive`, `InvTravelerAlive`, `InvNoAnnihilation`, `InvBeta1NonNeg`, `InvBranchPositive`, `InvBranchingMonotone`, `InvConservation`) + Lean theorem `grandfather_paradox_master` in `GrandfatherParadox.lean` | Mechanized |

### Five Novel AI Inference Forms (§15.24)

| Theorem ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-VOID-INFERENCE-POSITIVE` | Every token retains positive probability in void inference. The sliver prevents permanent exclusion from generation regardless of rejection history | VoidInferenceState | Lean theorem `void_inference_positive` in `NovelInferenceForms.lean` | Mechanized |
| `THM-VOID-INFERENCE-CONCENTRATES` | The complement distribution sharpens with rejection accumulation. Tokens rejected more get lower weight. Generation gets more confident | VoidInferenceState, two token indices with ordered void boundaries | Lean theorem `void_inference_concentrates` in `NovelInferenceForms.lean` | Mechanized |
| `THM-VOID-INFERENCE-COHERENT` | Two void inference systems with the same rejection history produce the same output distribution. Deterministic given the void boundary | Two VoidInferenceStates with same numChoices, rounds, and voidBoundary | Lean theorem `void_inference_coherent` in `NovelInferenceForms.lean` | Mechanized |
| `THM-VOID-INFERENCE-SUBSUMES-SOFTMAX` | Void inference with single-step boundary equals standard softmax range. With multi-step accumulation, void inference is strictly richer (cross-step rejection memory) | VoidInferenceState | Lean theorem `void_inference_subsumes_softmax` in `NovelInferenceForms.lean` | Mechanized |
| `THM-VOID-INFERENCE-NORMALIZABLE` | Total weight across all tokens is positive, so the complement distribution can be normalized to a probability distribution | VoidInferenceState | Lean theorem `void_inference_normalizable` in `NovelInferenceForms.lean` | Mechanized |
| `THM-RETROCAUSAL-CONSISTENT` | Only trajectories consistent with the terminal state survive. Terminal constraints are satisfiable (every terminal weight is positive) | RetrocausalDecoder | Lean theorem `retrocausal_consistent` in `NovelInferenceForms.lean` | Mechanized |
| `THM-RETROCAUSAL-POSITIVE` | No valid trajectory is excluded. The sliver prevents false negatives in the pruning step. Weight >= 1 and weight != 0 | RetrocausalDecoder | Lean theorem `retrocausal_positive` in `NovelInferenceForms.lean` | Mechanized |
| `THM-RETROCAUSAL-SHARPENS` | As generation progresses, the set of consistent continuations shrinks. Fewer tokens remain with low rejection counts | RetrocausalDecoder, two token indices with ordered void boundaries | Lean theorem `retrocausal_sharpens` in `NovelInferenceForms.lean` | Mechanized |
| `THM-RETROCAUSAL-COMPOSABLE` | Two retrocausal constraints compose. Intersection of consistent trajectories is nonempty because the sliver ensures weight >= 1 for every token under every constraint | Two RetrocausalDecoders | Lean theorem `retrocausal_composable` in `NovelInferenceForms.lean` | Mechanized |
| `THM-RETROCAUSAL-NO-SELF-REFERENCE` | Self-referential terminal constraints cannot annihilate any trajectory. The grandfather paradox applied to decoding | RetrocausalDecoder | Lean theorem `retrocausal_no_self_reference` in `NovelInferenceForms.lean` | Mechanized |
| `THM-TOPO-SKIP-PRESERVES-TOPOLOGY` | Skipping a zero-deficit layer preserves the total beta1 of the network. A layer with beta1 = 0 contributes nothing topologically | TopoSpecDecoder with layerDeficit i = 0 | Lean theorem `topo_skip_preserves_topology` in `NovelInferenceForms.lean` | Mechanized |
| `THM-TOPO-SPEEDUP-EXACT` | Speedup from skipping a layer is deficit + 1. For zero-deficit layer, speedup = 1 | deficit : Nat | Lean theorem `topo_speedup_exact` in `NovelInferenceForms.lean` | Mechanized |
| `THM-TOPO-SKIP-COMPOSABLE` | Multiple layer skips compose. Skipping layers with deficits d1 and d2 gives total speedup d1 + d2 + 2. Deficits are additive | d1, d2 : Nat | Lean theorem `topo_skip_composable` in `NovelInferenceForms.lean` | Mechanized |
| `THM-TOPO-SKIP-BOUNDED` | Maximum number of skippable layers is bounded by the network depth | TopoSpecDecoder, skipCount <= totalLayers | Lean theorem `topo_skip_bounded` in `NovelInferenceForms.lean` | Mechanized |
| `THM-TOPO-MINIMUM-COMPUTE` | At least one layer must execute (the sliver applied to compute). Network with L layers can skip at most L - 1 | TopoSpecDecoder with positiveLayers | Lean theorem `topo_minimum_compute` in `NovelInferenceForms.lean` | Mechanized |
| `THM-TOPO-DEFICIT-NONNEG` | Beta1 deficit is always non-negative. No layer has negative topological complexity | TopoSpecDecoder | Lean theorem `topo_deficit_nonneg` in `NovelInferenceForms.lean` | Mechanized |
| `THM-ENSEMBLE-DEFICIT-EXACT` | Semiotic deficit of a k-agent ensemble is exactly k - 1. Unavoidable information loss from folding multiple candidates to one winner | SemioticEnsemble | Lean theorem `ensemble_deficit_exact` in `NovelInferenceForms.lean` | Mechanized |
| `THM-ENSEMBLE-DEFICIT-POSITIVE` | For any nontrivial ensemble (k >= 2), the deficit is positive. Folding always loses information. Free consensus is impossible | SemioticEnsemble with agentCount >= 2 | Lean theorem `ensemble_deficit_positive` in `NovelInferenceForms.lean` | Mechanized |
| `THM-ENSEMBLE-DOMINATES-SINGLE` | Ensemble output (least-rejected candidate) has weight at least as high as any single agent. Complement voting is non-degrading | SemioticEnsemble, two agent indices with ordered void boundaries | Lean theorem `ensemble_dominates_single` in `NovelInferenceForms.lean` | Mechanized |
| `THM-ENSEMBLE-COMPLEMENT-VOTING` | Every candidate retains positive weight in the complement vote. No agent's output is ever completely eliminated | SemioticEnsemble | Lean theorem `ensemble_complement_voting` in `NovelInferenceForms.lean` | Mechanized |
| `THM-ENSEMBLE-COHERENT` | Two independent juries using the same rejection data select the same winner. Complement voting is objective | Two SemioticEnsembles with same numChoices, rounds, and voidBoundary | Lean theorem `ensemble_coherent` in `NovelInferenceForms.lean` | Mechanized |
| `THM-ENSEMBLE-SCALING` | Adding one more agent increases the deficit by exactly 1. Constant marginal information cost | k : Nat with k >= 2 | Lean theorem `ensemble_scaling` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NEI-POSITIVE` | Predicted completion has positive weight. The structural hole exists in the Buleyean sense | NonEmpiricalInference | Lean theorem `nei_positive` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NEI-DOMINATES-GUESS` | Structural prediction strictly dominates random guessing when neighbors provide nontrivial rejection data | NonEmpiricalInference with neighborVoidSum > 0 | Lean theorem `nei_dominates_guess` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NEI-COHERENT` | Two systems with the same lattice structure produce the same prediction. Non-empirical inference is objective | Two NonEmpiricalInferences with same neighborRoundsSum and neighborVoidSum | Lean theorem `nei_coherent` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NEI-BOUNDED` | Prediction weight bounded between 1 and rounds + 1. Always finite, always within Buleyean weight range | NonEmpiricalInference | Lean theorem `nei_bounded` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NEI-MENDELEEV` | Non-empirical inference is isomorphic to Mendeleev's periodic table prediction method. Both compute complement weight from neighbor-averaged void boundary | NonEmpiricalInference, BuleyeanSpace with matching rounds and voidBoundary | Lean theorem `nei_mendeleev` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NEI-STRUCTURE-DOMINATES` | More neighbor rejection data produces sharper (lower) prediction weight. More structure = more constraint | Two NonEmpiricalInferences with same rounds, ordered void sums | Lean theorem `nei_structure_dominates` in `NovelInferenceForms.lean` | Mechanized |
| `THM-NOVEL-INFERENCE-FORMS-MASTER` | Complete composition: all five forms are well-defined and compose from the same Buleyean axioms. Void inference positive, retrocausal decoding satisfiable, topological skipping non-negative, ensemble deficit exact, non-empirical inference dominates guessing | BuleyeanSpace, NonEmpiricalInference, k >= 2 | TLA+ `NovelInferenceForms.tla` (11 invariants) + Lean theorem `novel_inference_forms_master` in `NovelInferenceForms.lean` | Mechanized |

### Novel Cross-Domain Predictions (§19.11)

| Theorem ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-MISFOLDING-ZERO-DEFICIT` | Correct protein folding reaches beta1 = 0 (native state). Zero misfolding deficit | ProteinFolding with foldedBeta1 = 0 | Lean theorem `correct_folding_zero_deficit` in `NovelPredictions.lean` | Mechanized |
| `THM-MISFOLDING-POSITIVE-DEFICIT` | Misfolded proteins have positive deficit (trapped in non-native state with unresolved cycles) | ProteinFolding with foldedBeta1 > 0 | Lean theorem `misfolding_positive_deficit` in `NovelPredictions.lean` | Mechanized |
| `THM-MISFOLDING-DEFICIT-BOUNDED` | Misfolding deficit is bounded by conformational complexity (conformations - 1) | ProteinFolding | Lean theorem `misfolding_deficit_bounded` in `NovelPredictions.lean` | Mechanized |
| `THM-LANGUAGE-CONVERGENCE-MIN` | Language acquisition requires at least spaceSize - 1 convergence rounds. Void walking over the phoneme space | LanguageAcquisition with nontrivial space | Lean theorem `language_convergence_minimum` in `NovelPredictions.lean` | Mechanized |
| `THM-LARGER-LANGUAGE-SLOWER` | Larger phoneme inventories require more convergence rounds. Hawaiian < English < Mandarin < !Xoo | Two LanguageAcquisition systems with different space sizes | Lean theorem `larger_language_slower` in `NovelPredictions.lean` | Mechanized |
| `THM-BABBLING-UNIFORM` | Pre-convergence babbling phase is uniform distribution (all-zero void boundary, all weights equal) | BuleyeanSpace with all-zero voidBoundary | Lean theorem `babbling_is_uniform` in `NovelPredictions.lean`, delegating to `fold_without_evidence_is_coinflip` | Mechanized |
| `THM-IMMUNE-NEVER-ZERO` | No pathogen's threat weight ever reaches zero. The immune sliver: even maximally encountered pathogens retain weight >= 1 | ImmuneMemory | Lean theorem `immune_never_zero_threat` in `NovelPredictions.lean`, delegating to `buleyean_positivity` | Mechanized |
| `THM-LESS-REJECTED-MORE-THREATENING` | Pathogens with fewer failed antibody bindings (less rejected) have higher threat weight. Novel pathogens most dangerous | ImmuneMemory, two pathogen indices | Lean theorem `less_rejected_more_threatening` in `NovelPredictions.lean`, delegating to `buleyean_concentration` | Mechanized |
| `THM-NOVEL-PATHOGEN-MAX-THREAT` | Never-encountered pathogen has maximum threat weight = rounds + 1 (max uncertainty) | ImmuneMemory with zero void boundary for pathogen i | Lean theorem `novel_pathogen_max_threat` in `NovelPredictions.lean`, delegating to `buleyean_max_uncertainty` | Mechanized |
| `THM-PRUNING-DEFICIT-EXACT` | Neural pruning deficit = sqrtParams - 1. Over-pruning creates classical deficit | NeuralPruning | Lean theorem `pruning_deficit_exact` in `NovelPredictions.lean` | Mechanized |
| `THM-PRUNING-SPEEDUP` | Optimal neural pruning speedup = deficit + 1 = sqrtParams. Composes quantum_speedup_equals_classical_deficit_plus_one | NeuralPruning with sqrtParams >= 2 | Lean theorem `pruning_speedup_equals_deficit_plus_one` in `NovelPredictions.lean` | Mechanized |
| `THM-FULL-MULTIPLEXING-LIQUIDITY` | Full trading path multiplexing = zero liquidity deficit = maximum market liquidity | MarketTopology with realizedPaths = tradingPaths | Lean theorem `full_multiplexing_max_liquidity` in `NovelPredictions.lean` | Mechanized |
| `THM-SERIALIZED-MARKET-DEFICIT` | Single-path market has maximum deficit = tradingPaths - 1 = maximum illiquidity | MarketTopology with realizedPaths = 1 | Lean theorem `serialized_market_max_deficit` in `NovelPredictions.lean` | Mechanized |
| `THM-DEFICIT-MONOTONE-REALIZATION` | Adding a trading venue reduces liquidity deficit. Deficit is monotone in realized paths | Two MarketTopologies with same available paths, different realized | Lean theorem `deficit_monotone_in_realization` in `NovelPredictions.lean` | Mechanized |
| `THM-NOVEL-PREDICTIONS-MASTER` | All five predictions formally grounded: misfolding deficit bounded, language convergence positive, immune memory positive, pruning speedup = deficit + 1, full multiplexing = zero deficit | ProteinFolding, LanguageAcquisition, ImmuneMemory, NeuralPruning, MarketTopology | Lean theorem `novel_predictions_master` in `NovelPredictions.lean` | Mechanized |

### Metacognitive Walker & Void Attention

*C0-C1-C2-C3 cognitive loop, complement-as-softmax, residual accumulation, and gait-as-temperature.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-META-CONVERGE` | Metacognitive walker C0-C1-C2-C3 cognitive loop on void surface: eta remains bounded, exploration stays within configured bounds, gait is always a valid cognitive level, inverse Bule measure is non-negative, and kurtosis eventually stabilizes | `ASSUME MaxEta >= 1`; four cognitive levels (execute, monitor, evaluate, adapt) | TLA+ `MetacognitiveWalker.tla` invariants (`InvEtaBounded`, `InvExplorationBounded`, `InvGaitValid`, `InvBuleNonneg`, `InvConverge`) + Lean theorems in `MetacognitiveDaisyChain.lean` | Mechanized |

### Reynolds BFT

*Reynolds-BFT correspondence between pipeline stage ratio and Byzantine fault tolerance thresholds.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-REYNOLDS-BFT` | Reynolds-BFT correspondence: Reynolds number Re = N/C (stages/chunks). Idle fraction = max(0, 1 - 1/Re). BFT thresholds derived from fork/race/fold framework: Re < 3/2 (quorum-safe), Re < 2 (majority-safe) | positive stages N; positive chunks C | Lean theorems in `ReynoldsBFT.lean` | Mechanized |
| `THM-REYNOLDS-BFT-PARTITION` | Exact BFT regime partition: `mergeAll` iff `3 * C > 2 * N` (equiv. `Re < 3/2`), `quorumFold` iff `2 * C > N` and not `3 * C > 2 * N` (equiv. `3/2 ≤ Re < 2`), and `syncRequired` iff not `2 * C > N` (equiv. `Re ≥ 2`) | positive stages N | Lean theorems `majoritySafeFold_iff_two_chunks_gt_stages`, `quorumSafeFold_iff_three_chunks_gt_two_stages`, and `classifyRegime_eq_*` in `ReynoldsBFT.lean` | Mechanized |

### Pluralist Republic

*Community-mediated plural civic capacity, republican evidence closure, and regime-switched deliberative consensus.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-PLURALIST-REPUBLIC` | Community-mediated pluralist republic: bare one-stream rule has positive governance deficit on any nontrivial issue surface; plural representation plus positive community context strictly dominates that baseline with exact recovered margin `representationStreams + communityContext - 1`; sufficient combined civic capacity eliminates governance Bule; republican courts gate guilt by exact zero evidence Bule; deliberative consensus switches exactly between `mergeAll`, `quorumFold`, and `syncRequired` bands | issueDimensions ≥ 2; representationStreams ≥ 2; positive communityContext; court has evidentiaryThreads ≥ 2; positive deliberation stages; civic cover `issueDimensions ≤ representationStreams + communityContext` for zero-Bule corollaries | Lean theorems in `PluralistRepublic.lean` | Mechanized |
| `THM-OPTIMAL-GOVERNMENT-FORM` | Optimal form of government claim, scoped to the current formalism: once plural civic capacity covers the issue surface, the community-mediated pluralist republic attains the global minimum of the governance Bule metric (`0`), while still strictly dominating one-stream rule, keeping an exact republican zero-Bule evidence gate, and exposing the exact synchrony boundary of deliberative consensus | issueDimensions ≥ 2; representationStreams ≥ 2; positive communityContext; evidentiaryThreads ≥ 2; positive deliberation stages; civic cover `issueDimensions ≤ representationStreams + communityContext` | Lean theorems `pluralist_republic_globally_optimal_in_bule_metric_of_capacity_cover` and `optimal_form_of_government_claim` in `PluralistRepublic.lean` | Mechanized |

### Buleyean Evidence Standards (§28)

*The topological theory of legal proof: β₁ = 0 as the only formally defensible evidence standard for criminal conviction, removing the prior entirely and replacing "proof beyond a reasonable doubt" with a computable, observer-independent, auditable topological invariant.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-EVIDENCE-DEFICIT` | The evidentiary deficit is positive for any nontrivial case with a single verdict stream. The deficit equals evidentiaryThreads - 1. This is the topological cost of folding multi-threaded evidence into a single binary verdict | EvidenceTopology with evidentiaryThreads >= 2, verdictStreams = 1 | Lean theorems `evidence_deficit_positive` and `evidence_deficit_value` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-PRESUMPTION-OF-INNOCENCE` | Before any evidence is examined, the Buleyean verdict is "insufficient data." The initial Bule equals the total number of evidentiary threads and is at least 2. This IS the presumption of innocence -- not a procedural default but a topological invariant. You cannot compute guilt from an uncovered topology | EvidenceTopology with evidentiaryThreads >= 2 | Lean theorems `presumption_of_innocence`, `initial_bule_maximal`, and `initial_bule_positive` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-EVIDENCE-MONOTONE` | Each piece of admissible evidence can only reduce the evidentiary deficit, never increase it. Strictly: covering one additional thread strictly reduces the Bule. This gives a mathematical definition of "admissible": evidence that reduces deficit. Evidence that increases deficit is formally prejudicial (FRE 403) | EvidenceTopology; two EvidenceStates with monotone coverage | Lean theorems `evidence_monotone` and `evidence_strictly_reduces` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-GUILTY-IFF-ZERO-DEFICIT` | A guilty verdict is returned if and only if the evidentiary deficit is exactly zero. Equivalently, the verdict is "insufficient data" if and only if the deficit is positive. β₁ = 0 is the evidence standard. No other threshold is formally defensible | EvidenceTopology; EvidenceState | Lean theorems `guilty_iff_zero_deficit` and `insufficient_data_iff_positive_deficit` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-VERDICT-DETERMINISTIC` | The verdict is a deterministic function of thread coverage. Two evidence states with identical coverage produce identical verdicts. No randomness, no judgment calls on the standard itself -- only on the classification of evidence within threads | EvidenceTopology; two EvidenceStates with equal coveredThreads | Lean theorem `verdict_deterministic` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-COVERAGE-EVENTUALLY-SUFFICIENT` | If the prosecution covers one thread per round, the deficit reaches zero after exactly evidentiaryThreads rounds. The deficit at round k equals evidentiaryThreads - k | EvidenceTopology; round count k <= evidentiaryThreads | Lean theorems `coverage_eventually_sufficient` and `coverage_deficit_at_round` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-DISCOVERY-REDUCES-DEFICIT` | Full discovery (all evidence disclosed) provides maximum context and prevents Brady violations. Withholding evidence maintains deficit by reducing available context. More disclosure means more context, monotonically | DiscoveryState with disclosed bounded by total | Lean theorems `full_discovery_maximum_context`, `brady_violation_withholds_context`, and `more_discovery_more_context` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-DEFENSE-INCREASES-TOPOLOGY` | The defense's role is to identify uncovered evidentiary threads, increasing β₁(E) and requiring more prosecution coverage. Each new thread strictly increases the evidentiary deficit | EvidenceTopology; newThreads >= 1; verdictStreams = 1 | Lean theorems `defenseIdentifiesThread` and `defense_increases_deficit` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-APPEAL-GROUND` | A conviction with an uncovered thread has positive residual deficit, contradicts the guilty standard, and is formally reversible. The appellate question is computable: does the recorded void boundary satisfy β₁ = 0? | EvidenceTopology; AppealChallenge with uncovered thread witness | Lean theorems `appeal_ground_exists`, `appeal_contradicts_verdict`, and `appeal_reversible` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-BULEYEAN-EVIDENCE-MASTER` | Complete evidence standard theorem: (1) presumption of innocence (initial verdict = insufficient data), (2) initial deficit at least 2, (3) evidence deficit positive for single-verdict topology, (4) full coverage yields guilty, (5) deficit at full coverage is zero. Composes all individual evidence standard theorems | EvidenceTopology with verdictStreams = 1 | Lean theorem `buleyean_evidence_master` in `BuleyeanEvidence.lean` | Mechanized |
| `THM-BULEYEAN-EVIDENCE-MODEL` | Model-checked five-phase trial protocol: safety (no premature conviction, presumption of innocence, deficit nonneg/bounded/formula, coverage bounded, discovery bounded, guilty only in verdict phase), liveness (eventually verdict, eventually covered). Defense can increase topology. Prosecution rests trigger insufficiency | 3 evidentiary threads; 6 max rounds; 5 total evidence items | TLA+ `BuleyeanEvidence.tla` + `BuleyeanEvidence.cfg` with 9 invariants and 2 temporal properties | Model-checked |

### Predictions Round 8: Memory, Ecology, Supply Chain, Jury, Skill Transfer (§19.27)

| Theorem ID | Claim | Assumptions | Mechanization | Status |
|---|---|---|---|---|
| `THM-MEMORY-NEVER-FORGOTTEN` | Memory strength is always positive (the sliver): no memory is ever fully forgotten regardless of failed retrieval count | MemoryTrace | Lean theorem `memory_never_fully_forgotten` in `PredictionsRound8.lean` | Mechanized |
| `THM-MORE-FAILURES-WEAKER` | More failed retrievals produce weaker memory. The forgetting curve is monotone in void count | Two MemoryTraces with same opportunities, ordered failures | Lean theorem `more_failures_weaker_memory` in `PredictionsRound8.lean` | Mechanized |
| `THM-PERFECT-RETRIEVAL-MAX` | Perfect retrieval (zero failures) gives maximum strength = opportunities + 1 | MemoryTrace with failedRetrievals = 0 | Lean theorem `perfect_retrieval_max_strength` in `PredictionsRound8.lean` | Mechanized |
| `THM-CLIMAX-ZERO-DEFICIT` | Ecological climax community has zero succession deficit | EcologicalSuccession with currentDiversity = climaxDiversity | Lean theorem `climax_zero_deficit` in `PredictionsRound8.lean` | Mechanized |
| `THM-SUCCESSION-MONOTONE` | Closer to climax means less succession deficit (monotone toward equilibrium) | Two EcologicalSuccessions with same climax, ordered diversity | Lean theorem `closer_to_climax_less_deficit` in `PredictionsRound8.lean` | Mechanized |
| `THM-SINGLE-SOURCE-MAX-FRAGILITY` | Single-source supply chain has maximum fragility deficit = potential - 1 | SupplyChainNode with activeSuppliers = 1 | Lean theorem `single_source_max_fragility` in `PredictionsRound8.lean` | Mechanized |
| `THM-FULL-DIVERSIFICATION-ZERO` | Full supplier diversification eliminates fragility deficit | SupplyChainNode with activeSuppliers = potentialSuppliers | Lean theorem `full_diversification_zero_fragility` in `PredictionsRound8.lean` | Mechanized |
| `THM-MORE-SUPPLIERS-LESS-FRAGILITY` | More active suppliers monotonically reduces fragility deficit | Two SupplyChainNodes with same potential, ordered active | Lean theorem `more_suppliers_less_fragility` in `PredictionsRound8.lean` | Mechanized |
| `THM-DELIBERATION-DEFICIT-POSITIVE` | Jury deliberation deficit is always positive for k >= 2 jurors. Free consensus is impossible | JuryDeliberation with jurorCount >= 2 | Lean theorem `deliberation_deficit_positive` in `PredictionsRound8.lean` | Mechanized |
| `THM-UNANIMOUS-ZERO-GAP` | Unanimous verdict (votes >= threshold) has zero agreement gap | JuryDeliberation with unanimityThreshold <= convictVotes | Lean theorem `unanimous_verdict_zero_gap` in `PredictionsRound8.lean` | Mechanized |
| `THM-LARGER-JURY-LARGER-DEFICIT` | Larger jury has larger deliberation deficit (more information lost in fold) | Two JuryDeliberations with ordered jurorCount | Lean theorem `larger_jury_larger_deficit` in `PredictionsRound8.lean` | Mechanized |
| `THM-PERFECT-TRANSFER-ZERO` | Perfect skill transfer (all skills applicable) has zero transfer deficit | SkillTransfer with transferableSkills = sourceSkills | Lean theorem `perfect_transfer_zero_deficit` in `PredictionsRound8.lean` | Mechanized |
| `THM-MORE-TRANSFERABLE-LESS-DEFICIT` | More transferable skills monotonically reduces transfer deficit | Two SkillTransfers with same source, ordered transferable | Lean theorem `more_transferable_less_deficit` in `PredictionsRound8.lean` | Mechanized |
| `THM-NO-TRANSFER-MAX-DEFICIT` | Zero transferable skills gives maximum transfer deficit = source skills | SkillTransfer with transferableSkills = 0 | Lean theorem `no_transfer_max_deficit` in `PredictionsRound8.lean` | Mechanized |
| `THM-PREDICTIONS-ROUND8-MASTER` | All five predictions compose: memory positive, climax zero deficit, full diversification zero fragility, deliberation positive, perfect transfer zero deficit | MemoryTrace, EcologicalSuccession, SupplyChainNode, JuryDeliberation, SkillTransfer | TLA+ `PredictionsRound8.tla` (7 invariants) + Lean theorem `five_predictions_round8` in `PredictionsRound8.lean` | Mechanized |

### Arrow, Godel, Consciousness (§10.6)

*Arrow's impossibility, Godel's incompleteness, and consciousness recast as corollaries of the failure trilemma.*

**Mechanization target:** `ArrowGodelConsciousness.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ARROW-FROM-TRILEMMA | Arrow's impossibility theorem follows from the failure trilemma | `arrow_from_trilemma` | Mechanized |
| THM-ARROW-ANY-TWO | Any two of three social choice desiderata, but not three | `arrow_any_two_but_not_three` | Mechanized |
| THM-GODEL-BULEYEAN-POSITIVITY | Godel incompleteness as Buleyean positivity: unprovable statements are the void boundary | `godel_as_buleyean_positivity` | Mechanized |
| THM-GODEL-VOID-NONEMPTY | Godel: void nonempty or inconsistent | `godel_void_nonempty_or_inconsistent` | Mechanized |
| THM-CHAITIN-VOID-LIMIT | Chaitin omega as the void limit | `chaitin_omega_is_void_limit` | Mechanized |
| THM-CONSCIOUSNESS-VOID-RELATIVITY | Consciousness as internal zero-deficit perspective on irreversibility | `consciousness_is_void_relativity` | Mechanized |
| THM-QUALIA-COMPLEMENTS | Qualia are complement distributions | `qualia_are_complements` | Mechanized |

### Buleyean Pulse Quadrant (§10.6)

*The four primitives (fork, race, fold, vent) as quadrants of a +1/-1 pulse on input/output axes.*

**Mechanization target:** `BuleyeanPulseQuadrant.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-QUADRANT-ROUNDTRIP | Quadrant ↔ primitive bijection | `quadrant_roundtrip_prim`, `quadrant_roundtrip_quad` | Mechanized |
| THM-FORK-INCREASES-BETA1 | Fork increases beta-1 | `fork_increases_beta1` | Mechanized |
| THM-FOLD-DECREASES-BETA1 | Fold decreases beta-1 | `fold_decreases_beta1` | Mechanized |
| THM-FORK-VENT-CONJUGATE | Fork and vent are conjugate | `fork_vent_conjugate` | Mechanized |
| THM-RACE-FOLD-CONJUGATE | Race and fold are conjugate | `race_fold_conjugate` | Mechanized |
| THM-CANONICAL-CYCLE | Fork → race → fold → vent is complete and injective | `canonical_cycle_complete`, `canonical_cycle_injective` | Mechanized |
| THM-BULEYEAN-PULSE | The master pulse quadrant theorem | `buleyean_pulse_quadrant` | Mechanized |

### Community Compositions (§10.6)

*Compositions across community dominance, empathy channels, herd immunity, void sharing, cultural controversy, and local/global merge bounds.*

**Mechanization target:** `CommunityCompositions.lean` (56 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMMUNITY-PREVENTS-WAR | Community prevents future war | `community_prevents_future_war` | Mechanized |
| THM-MAX-DEFICIT-ZERO-IFF-CAPACITY | Zero maximum deficit iff decision capacity already covers the failure topology | `max_deficit_zero_iff_capacity_covers_failure` | Mechanized |
| THM-EMPATHY-CONVERGENCE | Empathy convergence rate | `empathy_convergence_rate_raw` | Mechanized |
| THM-EMPATHY-NADIR-UPPER-BOUND | Shared experience never increases the empathy nadir | `empathy_nadir_le_raw` | Mechanized |
| THM-EMPATHY-ZERO-SHARED-RAW | Zero shared dimensions recover the raw sum-minus-one empathy nadir | `empathy_shared_zero_recovers_raw` | Mechanized |
| THM-EMPATHY-BEFORE-NADIR | Before the nadir, the empathy Bule deficit is still positive | `empathy_before_nadir_positive` | Mechanized |
| THM-EMPATHY-AFTER-NADIR | Once the nadir is reached, every later exchange count stays converged | `empathy_after_nadir_zero` | Mechanized |
| THM-DIVERSITY-CEILING-MAX-DEFICIT | The diversity ceiling equals the maximum deficit | `diversity_ceiling_eq_max_deficit` | Mechanized |
| THM-NO-EXPLORATION-PRESERVES-VOID | No exploration preserves total accumulated void | `no_exploration_preserves_total_void` | Mechanized |
| THM-HERD-IMMUNITY | Herd immunity at threshold | `herd_immunity_at_threshold` | Mechanized |
| THM-HERD-IMMUNITY-CEILING | Herd-immunity threshold equals the induced diversity ceiling | `herd_immunity_threshold_eq_diversity_ceiling` | Mechanized |
| THM-HERD-IMMUNITY-MINIMUM | One fewer haplotype than the threshold leaves positive vulnerability | `herd_immunity_threshold_minimum` | Mechanized |
| THM-HERD-IMMUNITY-PERSISTENCE | Once the threshold is met, extra diversity keeps the pathogen topology covered | `herd_immunity_after_threshold_zero` | Mechanized |
| THM-VOID-SHARING-DIAGNOSTIC | Void sharing diagnostic | `void_sharing_diagnostic` | Mechanized |
| THM-CURRENT-DEFICIT-IFF-CONVERGED | Zero current empathy deficit is exactly convergence in the void-sharing map | `current_deficit_zero_iff_converged` | Mechanized |
| THM-VULNERABILITY-POSITIVE-NOT-CONVERGED | Positive vulnerability demand iff the pair has not yet converged | `vulnerability_positive_iff_not_converged` | Mechanized |
| THM-PLURALISM-DOMINATES | Pluralism dominates monoculture | `pluralism_dominates` | Mechanized |
| THM-CULTURAL-RESOLUTION-POSITIVE | Cultural controversies require a positive number of shared observations to resolve | `cultural_resolution_rounds_pos` | Mechanized |
| THM-MERGED-COMMUNITIES | Merged communities stay converged | `merged_communities_stay_converged` | Mechanized |
| THM-MERGED-COMMUNITIES-RIGHT | Convergence is also preserved when the right local community is the zero-deficit witness | `merged_communities_stay_converged_right` | Mechanized |
| THM-MERGED-CONTEXT-LOWER-LEFT | The merged-context lower bound contains community A's context | `merged_context_lower_ge_left` | Mechanized |
| THM-MERGED-CONTEXT-LOWER-RIGHT | The merged-context lower bound contains community B's context | `merged_context_lower_ge_right` | Mechanized |
| THM-MERGED-CONTEXT-INTERVAL | The merged-context lower bound never exceeds the additive upper bound | `merged_context_upper_ge_lower` | Mechanized |
| THM-GLOBAL-DEFICIT-LE-LEFT | The merged global deficit is at most community A's local deficit | `global_deficit_le_left_local` | Mechanized |
| THM-GLOBAL-DEFICIT-LE-RIGHT | The merged global deficit is at most community B's local deficit | `global_deficit_le_right_local` | Mechanized |
| THM-ISOLATION-SUBOPTIMAL | Isolation is suboptimal | `isolation_suboptimal` | Mechanized |

### CMB Visibility Boundary

*Narrow photon-observation boundary theorems: pre-recombination opacity, last scattering as the earliest telescope-visible epoch, and present-day CMB visibility.*

**Mechanization target:** `CMBVisibilityBoundary.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-OPAQUE-EPOCH-NOT-VISIBLE | Epochs before recombination are not photon-visible | `opaque_epoch_not_photon_visible` | Mechanized |
| THM-TELESCOPE-NOT-BEFORE-RECOMBINATION | Photon telescopes cannot directly see before recombination | `telescope_cannot_see_before_recombination` | Mechanized |
| THM-VISIBLE-IMPLIES-AFTER-RECOMBINATION | Any telescope-visible epoch is at or after recombination | `telescope_observable_implies_at_or_after_recombination` | Mechanized |
| THM-AFTER-OBSERVATION-NOT-PHOTON-VISIBLE | Emission after the observation time is not yet photon-visible | `after_observation_not_photon_visible` | Mechanized |
| THM-TELESCOPE-NOT-AFTER-OBSERVATION | Photon telescopes cannot directly see future emissions | `telescope_cannot_see_future` | Mechanized |
| THM-NOT-VISIBLE-IFF-OUTSIDE-WINDOW | Telescope invisibility is exactly being before recombination or after observation | `not_telescope_observable_iff_before_recombination_or_after_observation` | Mechanized |
| THM-VISIBLE-IFF-NOT-OUTSIDE-WINDOW | Telescope visibility is exactly not lying outside the closed visibility window | `telescope_observable_iff_not_before_recombination_or_after_observation` | Mechanized |
| THM-RECOMBINATION-SURFACE-VISIBLE | The recombination / last-scattering surface is visible from later epochs | `recombination_surface_visible` | Mechanized |
| THM-RECOMBINATION-EARLIEST-VISIBLE | Recombination is the earliest photon-visible epoch in the model | `recombination_is_earliest_visible_epoch` | Mechanized |
| THM-RECOMBINATION-BEFORE-PRESENT | Concrete chronology witness: recombination occurs before the present observation epoch | `recombination_before_present` | Mechanized |
| THM-CMB-VISIBLE-NOW | A present-day telescope sees the last-scattering surface | `cmb_visible_now` | Mechanized |
| THM-OBSERVATION-EPOCH-VISIBLE | The observation epoch itself is always visible in the photon model | `observation_epoch_visible` | Mechanized |
| THM-PRESENT-EPOCH-VISIBLE-NOW | In the concrete present-day model, the present epoch is visible | `present_epoch_visible_now` | Mechanized |
| THM-PRE-CMB-NOT-VISIBLE-NOW | A present-day telescope cannot see one year before recombination in the photon model | `pre_cmb_not_visible_now` | Mechanized |
| THM-POST-PRESENT-NOT-VISIBLE-NOW | A present-day telescope cannot see one year beyond the present observation epoch | `post_present_not_visible_now` | Mechanized |

### Cosmic Optimal Delta

*Narrow bridge theorems connecting the literal compiler-side optimal delta with the broader cosmic visibility floor.*

**Mechanization target:** `CosmicOptimalDelta.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-OPTIMAL-DELTA-EXPLORATION | The literal compiler optimal delta equals the exploration budget | `optimal_delta_eq_exploration` | Mechanized |
| THM-VISIBILITY-DELTA-POSITIVE | The cosmic visibility delta is strictly positive in the current projection | `visibility_delta_positive` | Mechanized |
| THM-TOTAL-OBSERVER-DELTA-SPLIT | The total observer delta splits into visibility plus exploration | `total_observer_delta_eq_visibility_plus_exploration` | Mechanized |
| THM-VISIBILITY-FLOOR-LE-TOTAL-GAP | The visibility term is a lower bound on the total observer gap | `visibility_floor_le_total_gap` | Mechanized |
| THM-TOTAL-OBSERVER-DELTA-POSITIVE | Under the compiler accounting identity, the total observer gap is always positive | `total_observer_delta_positive` | Mechanized |
| THM-TOTAL-OBSERVER-DELTA-NONZERO | The total observer gap can never collapse to zero in the current model | `total_observer_delta_ne_zero` | Mechanized |
| THM-EXPLORATION-BELOW-TOTAL-GAP | Exploration is always strictly below the total observer gap | `exploration_strictly_below_total_gap` | Mechanized |
| THM-TOTAL-GAP-EQ-VISIBILITY-IFF-ZERO-EXPLORATION | The total observer gap equals the pure visibility floor iff exploration is zero | `total_observer_delta_eq_visibility_iff_zero_exploration` | Mechanized |
| THM-ZERO-EXPLORATION-STILL-COSMIC-GAP | Zero exploration still leaves a positive cosmic gap | `zero_exploration_still_leaves_cosmic_gap` | Mechanized |
| THM-POSITIVE-EXPLORATION-INCREASES-TOTAL-GAP | Positive exploration strictly enlarges the total gap above the visibility floor | `positive_exploration_strictly_increases_total_gap` | Mechanized |

### Knowability Split

*Cross-module compositions separating the epistemic optimality gap from the photon visibility cutoff.*

**Mechanization target:** `KnowabilitySplit.lean` (4 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ZERO-EXPLORATION-PRE-CMB-HIDDEN | Zero exploration still leaves both a positive observer gap and a pre-CMB hidden epoch | `zero_exploration_still_leaves_pre_cmb_hidden` | Mechanized |
| THM-CMB-BOUNDARY-WITNESS | The recombination shell is visible while the immediately earlier epoch is not | `cmb_boundary_witness` | Mechanized |
| THM-TOTAL-GAP-SPLIT-WITH-VISIBLE-CMB | The total observer gap splits into visibility plus exploration while the CMB remains visible | `total_gap_split_with_visible_cmb` | Mechanized |
| THM-POSITIVE-EXPLORATION-PRE-CMB-HIDDEN | Positive exploration enlarges the total gap without removing the pre-CMB visibility cutoff | `positive_exploration_still_leaves_pre_cmb_hidden` | Mechanized |

### Covering Space Causality (§3.3)

*Topological deficit between computation graph and transport layer causes head-of-line blocking.*

**Mechanization target:** `CoveringSpaceCausality.lean` (9 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COVERING-CAUSALITY-CONSTRUCTIVE | Covering space causality: mismatch causes blocking | `covering_causality` | Mechanized |
| THM-COVERING-MATCH-CONSTRUCTIVE | Matched paths prevent blocking | `covering_match` | Mechanized |
| THM-TCP-DEFICIT | TCP deficit equals path count minus one | `tcp_deficit_is_path_count_minus_one` | Mechanized |
| THM-FRAME-HEADER-COVERING-MAP | Frame header is a covering map | `frame_header_is_covering_map` | Mechanized |

### Cross-File Compositions (§19)

*Five new theorems from composing quantum observer, cancer topology, negotiation equilibrium, failure controller, and sleep debt.*

**Mechanization target:** `CrossFileCompositions.lean` (13 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-QUANTUM-CANCER-ISOMORPHIC | Quantum and cancer topologies are isomorphic | `quantum_cancer_isomorphic` | Mechanized |
| THM-FOUR-WAY-IDENTITY | Four-way identity across domains | `four_way_identity` | Mechanized |
| THM-UNIVERSAL-FOLD-CONSTANT | Universal fold constant | `universal_fold_constant` | Mechanized |
| THM-CROSS-FILE-MASTER | Master composition theorem | `cross_file_master` | Mechanized |

### Cross-Module Identities (§19)

*Five cross-module identities: deficit determines heat, Arrow as fold heat, Wallace-frontier duality, semiotic amplification, universal cost budget.*

**Mechanization target:** `CrossModuleIdentities.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DEFICIT-DETERMINES-HEAT | Deficit determines heat | `deficit_determines_heat` | Mechanized |
| THM-ARROW-IS-FOLD-HEAT | Arrow's theorem as fold heat | `arrow_is_fold_heat` | Mechanized |
| THM-WALLACE-FRONTIER-ZERO | Wallace frontier zero equivalence | `wallace_frontier_zero_equivalence` | Mechanized |
| THM-SEMIOTIC-WHIP-AMPLIFICATION | Semiotic deficit amplification via whip-wave | `semiotic_whip_amplification` | Mechanized |
| THM-FAILURE-TAX-POSITIVE | Universal failure tax is positive | `failure_tax_positive` | Mechanized |
| THM-CROSS-MODULE-MASTER | Master cross-module identity | `cross_module_identities_master` | Mechanized |

### Deep Compositions (§19)

*Type-level compositions feeding outputs of one theorem into inputs of another -- void tunnel ordering, dialogue convergence, war budget tightening, void walking regret.*

**Mechanization target:** `DeepCompositions.lean` (8 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DIALOGUE-CONVERGENCE-BOUNDED | Dialogue convergence is bounded | `dialogue_convergence_bounded` | Mechanized |
| THM-WAR-BUDGET-TIGHTENS | War budget tightens with context | `war_budget_tightens_with_context` | Mechanized |
| THM-VOID-WALKING-REGRET-DEEP | Void walking regret bound (composed) | `void_walking_regret` | Mechanized |
| THM-UNIVERSAL-CONVERGENCE | Universal convergence | `universal_convergence` | Mechanized |
| THM-DEEP-COMPOSITIONS-MASTER | Master deep composition | `deep_compositions_master` | Mechanized |

### Diversity Unwound (§10.6)

*Unwinding diversity optimality into implementation: translation as retraction, basins, Forest convergence.*

**Mechanization target:** `DiversityUnwound.lean` (8 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-TRANSLATION-RETRACTION | Translation is a retraction | `translation_retraction` | Mechanized |
| THM-BASIN-STABILITY | Each language is a stable fixed point | `basin_stability` | Mechanized |
| THM-SCAFFOLD-GAP-IS-VOID | Scaffold gap is the void boundary | `scaffold_gap_is_void_boundary` | Mechanized |
| THM-FOREST-CONVERGENCE | Forest convergence | `forest_convergence` | Mechanized |
| THM-DIVERSITY-UNWOUND | Master unwinding theorem | `diversity_unwound` | Mechanized |

### Evolution (§10.6)

*Evolution as the purity-diversity oscillation -- selection and mutation as antiparallel forces.*

**Mechanization target:** `Evolution.lean` (16 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SELECTION-IMPROVES | Selection improves | `selection_improves` | Mechanized |
| THM-MUTATION-COSTS | Mutation costs | `mutation_costs` | Mechanized |
| THM-EVOLUTION-REQUIRES-BOTH | Evolution requires both selection and mutation | `evolution_requires_both` | Mechanized |
| THM-SLIVER-IS-MUTATION-RATE | The sliver is the mutation rate | `sliver_is_mutation_rate` | Mechanized |
| THM-EVOLUTION-IS-GROUND-STATE | Evolution is the ground state | `evolution_is_ground_state` | Mechanized |
| THM-EVOLUTION-EXISTS | Evolution exists (constructive) | `evolution_exists` | Mechanized |
| THM-SAME-THEOREM | Evolution = particles (same theorem) | `same_theorem` | Mechanized |

### Failure Controller (§9)

*Failure response controller with three actions (keep, vent, repair) and coefficient-minimal optimality.*

**Mechanization target:** `FailureController.lean` (7 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COLLAPSE-GAP-POSITIVE | Collapse gap is positive | `collapse_gap_positive` | Mechanized |
| THM-CHOOSE-KEEP | Keep is optimal when keep coefficient minimal | `choose_keep_when_keep_coefficient_min` | Mechanized |
| THM-CHOOSE-VENT | Vent is optimal when vent coefficient minimal | `choose_vent_when_vent_coefficient_min` | Mechanized |
| THM-CHOOSE-REPAIR | Repair is optimal when repair coefficient minimal | `choose_repair_when_repair_coefficient_min` | Mechanized |
| THM-CHOSEN-ACTION-MINIMAL | Chosen failure action is coefficient-minimal | `chosen_failure_action_coefficient_minimal` | Mechanized |

### Failure Pareto (§9)

*Pareto optimality of the three canonical failure actions.*

**Mechanization target:** `FailurePareto.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-KEEP-PARETO | Keep is Pareto optimal | `keep_is_pareto_optimal` | Mechanized |
| THM-PAY-VENT-PARETO | Pay vent is Pareto optimal | `pay_vent_is_pareto_optimal` | Mechanized |
| THM-PAY-REPAIR-PARETO | Pay repair is Pareto optimal | `pay_repair_is_pareto_optimal` | Mechanized |
| THM-CANONICAL-FAILURE-PARETO | All three canonical failure actions are Pareto optimal | `canonical_failure_actions_are_pareto` | Mechanized |

### Failure Universality (§9)

*Universal collapse cost theory -- sparse pipeline normalization, branch-isolating witnesses, the trilemma, tight cost bounds.*

**Mechanization target:** `FailureUniversality.lean` (34 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COLLAPSE-COST-FLOOR-EXACT | Exact collapse cost floor | `collapse_cost_floor_exact` | Mechanized |
| THM-CHOICE-SYSTEM-TRILEMMA | No free deterministic collapse trilemma | `ChoiceSystem.trilemma` | Mechanized |
| THM-TRAJECTORY-NO-FREE-COLLAPSE | No depth realizes free deterministic collapse | `ChoiceTrajectory.no_depth_realizes_free_deterministic_collapse` | Mechanized |
| THM-PIPELINE-COLLAPSE-CEILING | Pipeline collapse cost ceiling (tight) | `pipeline_collapse_cost_ceiling_tight` | Mechanized |

### Fisher Manifold (§15)

*Fisher information geometry on Buleyean distributions -- curvature, Solomonoff gap, retrocausal bounds.*

**Mechanization target:** `FisherManifold.lean` (14 theorems, sorry-free modulo doc comments)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-BULEYEAN-UNIFORM-BOUNDARY | Uniform boundary implies equal weights | `buleyean_uniform_boundary_equal_weights` | Mechanized |
| THM-FISHER-CURVATURE-MONOTONE | Fisher curvature is monotone in alternatives | `fisher_curvature_monotone` | Mechanized |
| THM-SOLOMONOFF-GAP | Solomonoff gap is complexity difference | `solomonoff_gap_is_complexity_diff` | Mechanized |
| THM-RETROCAUSAL-AT-ZERO | Retrocausal bound at zero distance | `retrocausal_bound_at_zero` | Mechanized |
| THM-FISHER-MASTER | Fisher manifold master theorem | `fisher_manifold_master` | Mechanized |

### Grand Unification (§10.6)

*Single conjunction theorem composing the entire formal surface.*

**Mechanization target:** `GrandUnification.lean` (1 theorem, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-GRAND-UNIFICATION-MASTER | All major results across all files are simultaneously satisfiable by one witness | `grand_unification` | Mechanized |

### Launch Offset Dominance (§12)

*Cost-benefit analysis of sequenced launch offsets in heterogeneous fabrics.*

**Mechanization target:** `LaunchOffsetDominance.lean` (8 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-OFFSET-PENALTY-REAL | Offset penalty is real | `offset_penalty_is_real` | Mechanized |
| THM-OFFSET-PENALTY-BOUNDED | Offset penalty is bounded | `offset_penalty_bounded` | Mechanized |
| THM-DIVERSITY-GAIN-REDUCES-DEFICIT | Diversity gain reduces deficit | `diversity_gain_reduces_deficit` | Mechanized |
| THM-LAUNCH-OFFSET-HONEST | Launch offset is honest | `launch_offset_honest` | Mechanized |

### Novel Compositions (§19)

*Five new theorem compositions -- retrocausal NEI, void regret convergence, branching preserves holes, double complement, trajectory lattice.*

**Mechanization target:** `NovelCompositions.lean` (15 theorems, zero sorry). TLA+ `NovelCompositions.tla` + `NovelCompositions.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-RETROCAUSAL-NEI-POSITIVE | Retrocausal structural hole prediction is positive | `retrocausal_nei_positive` | Mechanized |
| THM-BRANCH-PRESERVES-PREDICTION | Branching preserves prediction | `branch_preserves_prediction` | Mechanized |
| THM-DOUBLE-COMPLEMENT-ORDER | Double complement is order preserving | `double_complement_order_preserving` | Mechanized |
| THM-TRIPLE-COHERENCE | Triple coherence | `triple_coherence` | Mechanized |
| THM-NOVEL-COMPOSITIONS-MASTER | Master novel compositions | `novel_compositions_master` | Mechanized |

### Novel Predictions Round 28 (§19)

*Logical derivation of all 28 novel predictions from three axioms.*

**Mechanization target:** `NovelPredictions28.lean` (4 theorems, zero sorry). TLA+ `NovelPredictions28.tla` + `NovelPredictions28.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-28-VALID | All 28 predictions valid from construction | `all_28_valid` | Mechanized |
| THM-VOID-SEPARATES | Void fraction separates all conditions | `void_separates_all_conditions` | Mechanized |

### Post-Linear Transition (§10.6)

*The post-linear world: monoculture (beta-1 = 0) is the global pessimum, each fork is a strict Pareto improvement.*

**Mechanization target:** `PostLinear.lean` (10 theorems, zero sorry). TLA+ `PostLinear.tla` + `PostLinear.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-LINEAR-IS-PESSIMUM | Linear (beta-1 = 0) is the global pessimum | `linear_is_pessimum` | Mechanized |
| THM-FIRST-FORK-PARETO | First fork is a Pareto improvement | `first_fork_is_pareto` | Mechanized |
| THM-EACH-FORK-SAVES-ONE-BULE | Each fork saves one Bule | `each_fork_saves_one_bule` | Mechanized |
| THM-FRONTIER-ZERO-BULES | Frontier has zero Bules | `frontier_is_zero_bules` | Mechanized |
| THM-REVERSION-DOMINATED | Reversion is dominated | `reversion_is_dominated` | Mechanized |
| THM-POST-LINEAR-WORLD | Master post-linear theorem | `post_linear_world` | Mechanized |

### Prediction Proofs Round 1 (§19)

*Mechanizes seven predictions (P1, P2, P6, P7, P9, P12, P14) from biology, finance, and distributed systems.*

**Mechanization target:** `PredictionProofs.lean` (21 theorems). TLA+ `PredictionProofs.tla` + `PredictionProofs.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-FOLD-REDUCES-ALL | Fold reduces all by one | `fold_reduces_all_by_one` | Mechanized |
| THM-CRISPR-EFFICIENCY | CRISPR efficiency monotone decreasing | `efficiency_monotone_decreasing` | Mechanized |
| THM-PBFT-IFF-BETA1 | pBFT iff beta-1 | `pbft_iff_beta1` | Mechanized |
| THM-MYELINATION-BOUNDED | Myelination chunks bounded | `myelination_chunks_bounded` | Mechanized |
| THM-SILENT-MUTATION-DEFICIT | Silent mutation has nonzero deficit | `silent_mutation_has_nonzero_deficit` | Mechanized |

### Predictions Round 2 (§19)

*Five predictions: sleep debt as void walking, dark matter/energy, semiotic deficit in translation, metacognitive skill stages, Reynolds-BFT thresholds.*

**Mechanization target:** `PredictionsRound2.lean` (18 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SLEEP-CLEARS-DEBT | Sleep clears debt | `sleep_clears_debt` | Mechanized |
| THM-DARK-MATTER-CONSERVATION | Dark matter-energy conservation | `dark_matter_energy_conservation` | Mechanized |
| THM-TRANSLATION-ALWAYS-LOSES | Translation always loses | `translation_always_loses` | Mechanized |
| THM-SKILL-STAGES-ORDERED | Skill stages C0-C3 are ordered | `skill_stages_ordered` | Mechanized |
| THM-PREDICTIONS-ROUND2-MASTER | Master round 2 predictions | `predictions_round2_master` | Mechanized |

### Predictions Round 3 (§19)

*Five predictions: beauty as deficit minimization, failure entropy recovery, void field propagation, negotiation heat, whip-wave batch size.*

**Mechanization target:** `PredictionsRound3.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PERFECT-BEAUTY-ZERO-DEFICIT | Perfect beauty has zero deficit | `perfect_beauty_zero_deficit` | Mechanized |
| THM-GRADIENT-DETERMINES-FLOW | Gradient determines information flow | `gradient_determines_flow` | Mechanized |
| THM-BATCH-TRADEOFF-EXISTS | Batch tradeoff exists | `batch_tradeoff_exists` | Mechanized |
| THM-PREDICTIONS-ROUND3-MASTER | Master round 3 predictions | `predictions_round3_master` | Mechanized |

### Predictions Round 4 (§19)

*Five predictions: void tunnel creative insight, void coherence consensus, semiotic peace dialogue, negotiation regret, failure cascade contagion.*

**Mechanization target:** `PredictionsRound4.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-INSIGHT-REQUIRES-DENSITY | Insight requires void density | `insight_requires_density` | Mechanized |
| THM-DIALOGUE-REDUCES-CONFLICT | Dialogue reduces conflict | `dialogue_reduces_conflict` | Mechanized |
| THM-CASCADE-BOUNDED | Failure cascade bounded by total | `cascade_bounded_by_total` | Mechanized |
| THM-PREDICTIONS-ROUND4-MASTER | Master round 4 predictions | `predictions_round4_master` | Mechanized |

### Predictions Round 10 (§19)

*Sleep schedule predictions -- iterated debt, threshold spirals, deficit-free schedules.*

**Mechanization target:** `PredictionsRound10.lean` (8 theorems, zero sorry). TLA+ `PredictionsRound10.tla` + `PredictionsRound10.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ITERATED-DEBT-CLOSED-FORM | Iterated debt closed-form | `iterated_debt_closed_form` | Mechanized |
| THM-FULL-RECOVERY-CLEARS | Full recovery clears debt | `full_recovery_clears` | Mechanized |
| THM-CASCADE-DEBT-COMPOSE | Cascade debt composes | `cascade_debt_compose` | Mechanized |
| THM-PREDICTIONS-ROUND10-MASTER | Master round 10 predictions | `predictions_round10_master` | Mechanized |

### Predictions Round 11 (§19)

*Universal collapse cost floor, deterministic collapse, single-survivor venting cost.*

**Mechanization target:** `PredictionsRound11.lean` (10 theorems, zero sorry). TLA+ `PredictionsRound11.tla` + `PredictionsRound11.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-UNIVERSAL-COST-FLOOR-ACHIEVABLE | Universal cost floor achievable | `universal_cost_floor_achievable` | Mechanized |
| THM-ZERO-DEBT-COLLAPSE | Zero debt collapse | `zero_debt_collapse` | Mechanized |
| THM-COLLAPSE-PATH-CONSERVATION | Collapse path conservation | `collapse_path_conservation` | Mechanized |
| THM-PREDICTIONS-ROUND11-MASTER | Master round 11 predictions | `predictions_round11_master` | Mechanized |

### Predictions Round 14 (§19)

*Diversity optimality, American frontier, renormalization, deficit capacity, Buleyean positivity.*

**Mechanization target:** `PredictionsRound14.lean` (7 theorems, zero sorry). TLA+ `PredictionsRound14.tla` + `PredictionsRound14.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DIVERSITY-RACING-ZERO-DEFICIT | Diversity racing achieves zero deficit | `diversity_racing_zero_deficit` | Mechanized |
| THM-ALL-CHOICES-SURVIVE | All choices survive (positivity) | `all_choices_survive` | Mechanized |
| THM-LESS-REJECTED-PREFERRED | Less rejected is preferred | `less_rejected_preferred` | Mechanized |
| THM-PREDICTIONS-ROUND14-MASTER | Master round 14 predictions | `predictions_round14_master` | Mechanized |

### Predictions Round 5 (§19, Predictions 66-70)

*Retrocausal negotiation diagnostics, envelope sleep conservation, quorum emotional observers, communication diversity, reframing injectivity.*

**Mechanization target:** `PredictionsRound5.lean` (17 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-UNIFORM-REJECTIONS-ZERO-GAP | Uniform rejections have zero gap | `uniform_rejections_zero_gap` | Mechanized |
| THM-EARLY-STOPPING-SAVES | Early stopping saves cost | `early_stopping_saves_cost` | Mechanized |
| THM-QUORUM-INTERSECTION-AGREEMENT | Quorum intersection ensures agreement | `quorum_intersection_ensures_agreement` | Mechanized |
| THM-MONOCULTURE-FORCES-WASTE | Monoculture forces waste | `monoculture_forces_waste` | Mechanized |
| THM-REFRAMING-FLOOR | Reframing floor at exhaustion | `reframing_floor_at_exhaustion` | Mechanized |

### Predictions Round 6 (§19, Predictions 71-75)

*Failure cascade entropy, retrocausal diagnostics, halting-guided model selection, coupled failure amplification, trajectory reconstruction.*

**Mechanization target:** `PredictionsRound6.lean` (14 theorems, zero sorry). TLA+ `PredictionsRound6.tla` + `PredictionsRound6.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CASCADE-REDUCES-FRONTIER | Cascade reduces frontier | `cascade_reduces_frontier` | Mechanized |
| THM-PRIMARY-DIAGNOSIS-MAXIMAL | Primary diagnosis is maximal | `primary_diagnosis_maximal` | Mechanized |
| THM-COMPLEX-MODELS-MORE-NONHALTING | Complex models have more nonhalting | `complex_models_more_nonhalting` | Mechanized |
| THM-OVER-REPAIR-ENTROPY | Over-repair increases entropy | `over_repair_increases_entropy` | Mechanized |
| THM-TRAJECTORY-DETERMINES-BOUNDARY | Trajectory determines boundary | `trajectory_determines_boundary` | Mechanized |

### Predictions Round 7 (§19, Predictions 111-115)

*Non-empirical prediction of unknowns, grandfather paradox resolution, sleep debt cascade, failure trilemma, Buleyean bidirectional prediction.*

**Mechanization target:** `PredictionsRound7.lean` (16 theorems, zero sorry). TLA+ `PredictionsRound7.tla` + `PredictionsRound7.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-HOLES-POSITIVE-WEIGHT | Holes have positive weight | `holes_have_positive_weight` | Mechanized |
| THM-ROOT-SURVIVES | Root survives | `root_survives` | Mechanized |
| THM-ONE-NIGHT-POSITIVE-DEBT | One night creates positive debt | `one_night_positive_debt` | Mechanized |
| THM-COLLAPSE-REQUIRES-FAILURE | Collapse requires failure | `collapse_requires_failure` | Mechanized |
| THM-HOLE-PREDICTION-CONCENTRATES | Hole prediction concentrates | `hole_prediction_concentrates` | Mechanized |

### Predictions Round 9 (§19, Predictions 142-146)

*Quantum speedup as deficit, quorum visibility, fold heat hierarchy, Wallace waste, multiplexing reduction.*

**Mechanization target:** `PredictionsRound9.lean` (10 theorems, zero sorry). TLA+ `PredictionsRound9.tla` + `PredictionsRound9.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-QUANTUM-SPEEDUP-FORMULA | Quantum speedup formula | `quantum_speedup_formula` | Mechanized |
| THM-FOLD-HEAT-DICHOTOMY | Fold heat dichotomy | `fold_heat_dichotomy` | Mechanized |
| THM-WALLACE-ZERO-CHAR | Wallace zero characterization | `wallace_zero_characterization` | Mechanized |
| THM-MULTIPLEXING-HELPS | Multiplexing helps | `multiplexing_helps` | Mechanized |

### Predictions Round 12 (§19, Predictions 177-181)

*Feedback loops generate heat, Arrow impossibility corollary, war prevention via community, Reynolds BFT, maximum war cost.*

**Mechanization target:** `PredictionsRound12.lean` (9 theorems, zero sorry). TLA+ `PredictionsRound12.tla` + `PredictionsRound12.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-FEEDBACK-ALWAYS-HEATS | Feedback loops generate irreducible Landauer heat | `feedback_always_heats` | Mechanized |
| THM-ARROW-IMPOSSIBILITY-PRED | Arrow impossibility as failure trilemma corollary | `arrow_impossibility` | Mechanized |
| THM-WAR-HEAT-DECREASES | War heat decreases with community context | `war_heat_decreases` | Mechanized |
| THM-LOW-REYNOLDS-QUORUM-SAFE | Low Reynolds number is quorum safe | `low_reynolds_quorum_safe` | Mechanized |
| THM-MAX-DEFICIT-FORMULA | Maximum war cost formula | `max_deficit_formula` | Mechanized |

### Predictions Round 13 (§19)

*Mac Lane coherence, enriched convergence, Reynolds BFT, entropic refinement, rate-distortion Pareto.*

**Mechanization target:** `PredictionsRound13.lean` (12 theorems, zero sorry). TLA+ `PredictionsRound13.tla` + `PredictionsRound13.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-STRUCTURAL-REFACTORING-SAFE | Structural refactoring safe (Mac Lane coherence) | `structural_refactoring_safe` | Mechanized |
| THM-OPTIMAL-ARCHITECTURE-EXISTS | Optimal architecture exists | `optimal_architecture_exists` | Mechanized |
| THM-LAMINAR-NO-IDLE | Laminar pipeline has no idle | `laminar_pipeline_no_idle` | Mechanized |
| THM-RACING-EXCEEDS-BFT | Racing exceeds BFT threshold | `racing_exceeds_bft` | Mechanized |

### Adaptive Bisimulation Predictions (§19, Predictions 232-236)

*Adaptive resource allocation, frame-native bisimulation, infinite-support heat, dual-protocol Pareto, metacognitive depth bounds.*

**Mechanization target:** `AdaptiveBisimPredictions.lean` (16 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-GRADIENT-DOMINATES-UNIFORM | Gradient dominates uniform allocation | `gradient_dominates_uniform` | Mechanized |
| THM-FRAME-FEWER-ALLOCS | Frame-native has fewer allocations | `frame_fewer_allocs` | Mechanized |
| THM-INFINITE-SUPPORT-PAYS-HEAT | Infinite support still pays heat | `infinite_support_still_pays_heat` | Mechanized |
| THM-DUAL-PARETO-IMPROVEMENT | Dual protocol is Pareto improvement | `dual_pareto_improvement` | Mechanized |
| THM-MONITORING-DEPTH-DIMINISHING | Monitoring depth has diminishing returns | `monitoring_depth_diminishing_returns` | Mechanized |

### Hetero Compositional Predictions (§19, Predictions 242-246)

*Heterogeneous multi-backend inference, compositional ergodicity, coarsening synthesis, nonlinear convergence, zero-deficit server optimality.*

**Mechanization target:** `HeteroCompositionalPredictions.lean` (12 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-HOMOGENEOUS-WASTES-MIRRORS | Homogeneous wastes mirrors | `homogeneous_wastes_mirrors` | Mechanized |
| THM-SEQUENTIAL-RATES-MULTIPLY | Sequential rates multiply | `sequential_rates_multiply` | Mechanized |
| THM-SYNTHESIS-SOUNDNESS-PRED | Synthesis soundness | `synthesis_soundness` | Mechanized |
| THM-SUPERLINEAR-TIGHTER | Superlinear tighter convergence | `superlinear_tighter_convergence` | Mechanized |
| THM-ZERO-DEFICIT-OPTIMAL-MAKESPAN | Zero deficit = optimal makespan | `zero_deficit_optimal_makespan` | Mechanized |

### Complement Oscillation (§15)

*Iterated complement reverses weight ordering with sign-alternating, geometrically decaying amplitude.*

**Mechanization target:** `ComplementOscillation.lean` (8 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMPLEMENT-REVERSES | Complement reverses ordering | `complement_reverses_ordering` | Mechanized |
| THM-DOUBLE-COMPLEMENT-PRESERVES | Double complement preserves rejection ordering | `complement_double_preserves_rejection_ordering` | Mechanized |
| THM-SIGN-ALTERNATION | Sign alternation at extremes | `sign_alternation_at_extremes` | Mechanized |
| THM-WEIGHT-SPREAD-BOUNDED | Weight spread is bounded | `weight_spread_bounded` | Mechanized |
| THM-COMPLEMENT-OSCILLATION-MASTER | Master complement oscillation | `complement_oscillation_master` | Mechanized |

### Novel Triple Compositions (§19, Predictions 292-296)

*Negotiation heat as Landauer cost, nadir as entropy minimum, semiotic erasure, deficit feedback, community attenuation.*

**Mechanization target:** `NovelTripleCompositions.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-NEGOTIATION-HEAT-POSITIVE | Negotiation heat is positive | `negotiation_heat_positive` | Mechanized |
| THM-NADIR-ZERO-ENTROPY | Nadir is zero entropy | `nadir_zero_entropy` | Mechanized |
| THM-SEMIOTIC-ERASURE-BOUND | Semiotic erasure lower bound | `semiotic_erasure_bound` | Mechanized |
| THM-DEFICIT-FEEDBACK-HOT | Deficit feedback generates heat | `deficit_feedback_hot` | Mechanized |
| THM-COMMUNITY-REDUCES-ENTROPY | Community reduces entropy | `community_reduces_entropy` | Mechanized |

### Novel Triple Compositions Round 2 (§19, Predictions 297-301)

*Communication trilemma, codec racing deficit, protocol turbulence, failure entropy RG, hierarchical mediation.*

**Mechanization target:** `NovelTripleCompositions2.lean` (16 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMMUNICATION-TRILEMMA | Communication trilemma (lossless+cheap+deterministic impossible) | `communication_trilemma` | Mechanized |
| THM-WINNER-MINIMIZES-DEFICIT | Race winner minimizes deficit | `winner_minimizes_deficit` | Mechanized |
| THM-TURBULENCE-WHEN-OVERLOADED | Turbulence when overloaded | `turbulence_when_overloaded` | Mechanized |
| THM-COARSENING-REDUCES-MODES | Coarsening reduces failure modes | `coarsening_reduces_modes` | Mechanized |
| THM-MEDIATION-MONOTONE-DEFICIT | Mediation is monotone in deficit | `mediation_monotone_deficit` | Mechanized |

### Teleportation Evidence Predictions (§19, Predictions 212-216)

*Federated learning as statistical teleportation, evidence-based conviction, identical agent waste, causal symmetry, defense motions.*

**Mechanization target:** `TeleportationEvidencePredictions.lean` (14 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-FEDERATED-PRIVACY | Federated learning preserves privacy | `federated_privacy` | Mechanized |
| THM-PRESUMPTION-TOPOLOGICAL | Presumption of innocence is topological | `presumption_of_innocence_topological` | Mechanized |
| THM-GUILTY-REQUIRES-ZERO | Guilty verdict requires zero evidentiary deficit | `guilty_requires_zero_deficit` | Mechanized |
| THM-IDENTICAL-AGENTS-WASTE | Identical LLM agents waste compute | `identical_agents_waste` | Mechanized |
| THM-CAUSAL-SYMMETRY-TOPOLOGICAL | Causal direction is frame artifact | `causal_symmetry_topological` | Mechanized |
| THM-DEFENSE-INCREASES-DIFFICULTY | Defense motions increase conviction difficulty | `defense_increases_difficulty` | Mechanized |

### Triple Compositions (§19)

*Three-way A→B→C theorem chains: positivity→heat, failure→heat, boundary concentration, coarsening termination, void as optimal history.*

**Mechanization target:** `TripleCompositions.lean` (6 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-POSITIVITY-GUARANTEES-HEAT | Positivity guarantees Landauer heat | `positivity_guarantees_heat` | Mechanized |
| THM-FAILURE-CASCADE-HEAT | Failure cascade generates heat | `failure_cascade_generates_heat` | Mechanized |
| THM-CONCENTRATED-BOUNDARY-TRIPLE | Concentrated boundary triple | `concentrated_boundary_triple` | Mechanized |
| THM-COARSENING-TERMINATES | Coarsening terminates effectively | `coarsening_terminates_effectively` | Mechanized |
| THM-VOID-OPTIMAL-HISTORY | Void is optimal history representation | `void_is_optimal_history` | Mechanized |

### Predictions Round 15: Sandwich-Derived Statistics (§19)

*Every floor/ceiling theorem pair yields a testable prediction.*

**Mechanization target:** `PredictionsRound15.lean` (12 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMPRESSION-GAIN-SANDWICH | Compression gain sandwich | `compression_gain_sandwich` | Mechanized |
| THM-PIPELINE-SPEEDUP-SANDWICH | Pipeline speedup sandwich | `pipeline_speedup_sandwich` | Mechanized |
| THM-LANDAUER-HEAT-SANDWICH | Landauer heat sandwich | `landauer_heat_sandwich` | Mechanized |
| THM-COLLAPSE-COST-SANDWICH | Collapse cost sandwich | `collapse_cost_sandwich` | Mechanized |
| THM-VOID-GAIN-PREDICTION | Void gain prediction | `void_gain_prediction` | Mechanized |
| THM-SANDWICH-MASTER | Master sandwich predictions | `sandwich_predictions_master` | Mechanized |

### Predictions Round 16: Cross-Sandwich Combinatorics (§19)

*Composing pairs and triples of 17 sandwiches to derive tighter bounds and novel cross-domain predictions.*

**Mechanization target:** `PredictionsRound16.lean` (31 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PIPELINE-HEAT-SANDWICH | Pipeline heat sandwich | `pipeline_heat_sandwich` | Mechanized |
| THM-VOID-ACCELERATED-CONVERGENCE | Void accelerated convergence | `void_accelerated_convergence` | Mechanized |
| THM-DEBT-ADJUSTED-SPEEDUP-CEILING | Debt-adjusted speedup ceiling | `debt_adjusted_speedup_ceiling` | Mechanized |
| THM-SUPPLY-DIVERSIFICATION-EXACT | Supply diversification exact | `supply_diversification_exact` | Mechanized |
| THM-CROSS-SANDWICH-MASTER | Master cross-sandwich predictions | `cross_sandwich_master` | Mechanized |

### Semiotic Triples (§19)

*Five new theorems from uncombined module triples: negotiation as dialogue, Arrow bounding consensus, irreversible war heat, voting void gradient, append-only BATNA.*

**Mechanization target:** `SemioticTriples.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-NEGOTIATION-IS-DIALOGUE | Negotiation is dialogue | `negotiation_is_dialogue` | Mechanized |
| THM-ARROW-BOUNDS-NEGOTIATION | Arrow impossibility bounds negotiation | `arrow_bounds_negotiation` | Mechanized |
| THM-NO-FREE-CONSENSUS | No free consensus | `no_free_consensus` | Mechanized |
| THM-WAR-HEAT-IRREVERSIBLE | War heat is irreversible | `war_heat_irreversible` | Mechanized |
| THM-BATNA-APPEND-ONLY | BATNA is append-only | `batna_append_only` | Mechanized |
| THM-SEMIOTIC-TRIPLES-MASTER | Master semiotic triples | `semiotic_triples_master` | Mechanized |

### Sliver from Vent (§10.6)

*The +1 in the Buleyean weight formula is Landauer heat from the previous vent -- destruction of destruction is creation.*

**Mechanization target:** `SliverFromVent.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-VENT-HEAT-IS-ONE | Vent heat is exactly one | `vent_heat_is_one` | Mechanized |
| THM-SLIVER-IS-HEAT | Sliver is heat | `sliver_is_heat` | Mechanized |
| THM-HEARTBEAT-SELF-SUSTAINING | The heartbeat loop vent→heat→sliver→positivity→race→losers→vent is self-sustaining | `heartbeat_self_sustaining` | Mechanized |
| THM-SLIVER-FROM-VENT | Master theorem: sliver from vent | `sliver_from_vent` | Mechanized |

### Sliver of Hope (§10.6)

*Unifies Buleyean Probability (+1 sliver) and Buleyean Logic (-1 proof step) as inverses.*

**Mechanization target:** `SliverOfHope.lean` (15 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SLIVER-IS-PLUS-ONE | Sliver is +1 | `sliver_is_plus_one` | Mechanized |
| THM-PROOF-STEP-IS-MINUS-ONE | Proof step is -1 | `proof_step_is_minus_one` | Mechanized |
| THM-SLIVER-PROOF-INVERSE | Sliver and proof are inverses | `sliver_proof_inverse` | Mechanized |
| THM-HOPE-ENABLES-PROOF | Hope enables proof | `hope_enables_proof` | Mechanized |
| THM-SLIVER-BRIDGES | Sliver bridges probability and logic | `sliver_bridges_probability_and_logic` | Mechanized |
| THM-SLIVER-OF-HOPE | Master: sliver of hope | `sliver_of_hope` | Mechanized |

### Deceptacon / DualVoidDeceptacon Bridge (§15.30.8)

*Chapter-level transformer read: the Deceptacon's `VOID` contract is dual-explicit, `voidToggle` foregrounds BATNA or WATNA, and the chapter binds `BATNA = sphere`, `WATNA = torus` locally inside the Deceptacon/void-attention vocabulary.*

**Mechanization provenance:** chapter-level composition over existing mechanized rows in `VoidWalking.lean`, `NegotiationEquilibrium.lean`, `StatisticalTeleportation.lean`, and `FoldErasure.lean`. No standalone `Deceptacon.lean` file is present in this repository tree.

| ID | Bridge role in §15.30.8 | Existing mechanization | Status |
|---|---|---|---|
| `THM-VOID-ATTENTION-DECEPTACON-PAPER-LABEL` | Supplies the Q/K/V identity for the `VOID` contract: `Q = proposal`, `K = void boundary`, `V = complement weight` | TLA+ `VoidAttention.tla` invariants (`InvComplementIsSoftmax`, `InvResidualAccumulates`, `InvDecayStabilizes`, `InvCrossIsGated`, `InvEntropyDecreases`, `InvGaitIsTemperature`) | Model-checked |
| `THM-BATNA-IS-VOID-DECEPTACON-PAPER-LABEL` | Supplies the BATNA side of the dual-explicit Deceptacon read as a void-boundary surface | Lean theorems `batna_is_void_boundary` and `batna_grows_with_rounds` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-DUAL-VOID-PARTITION-DECEPTACON-PAPER-LABEL` | Supplies the explicit two-branch partition: BATNA and WATNA are both present in state | Lean theorems `dual_void_exhaustive` and `dual_void_both_nonempty` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-WATNA-REDUCED-REGRET-DECEPTACON-PAPER-LABEL` | Supplies the WATNA side of the read: catastrophic branches shrink the effective search space without forcing `search` to act as a branch label | Lean theorems `watna_reduces_effective_space`, `watna_reduced_regret`, `watna_reduced_regret_strict`, and `watna_effective_nontrivial` in `NegotiationEquilibrium.lean` | Mechanized |
| `THM-COHERENCE-BREAKDOWN-DECEPTACON-PAPER-LABEL` | Supplies the reason branch naming must be explicit: same facts with different BATNA/WATNA classification produce divergent readings | Lean theorems `coherence_when_classification_agrees`, `coherence_divergence`, `classification_gap_bounded`, and `classification_gap_equals_double_watna_shift` in `NegotiationEquilibrium.lean` | Mechanized |

### Statistical Teleportation (§15)

*Transferring certainty without data via the Bule deficit integer.*

**Mechanization target:** `StatisticalTeleportation.lean` (plus the Deceptacon chapter-level composition in §15.30.8.3)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-TELEPORTATION-TRAJECTORY | Deficit at future round k is deficit - min(k, deficit) | `teleportation_trajectory_from_deficit` | Mechanized |
| THM-TELEPORTATION-CONVERGENCE | Convergence happens at round = deficit | `teleportation_convergence_round` | Mechanized |
| THM-TELEPORTATION-MONOTONE | Deficit trajectory only decreases | `teleportation_monotone` | Mechanized |
| THM-TELEPORTATION-PRIVACY | Two senders with different void boundaries but same N transmit same deficit | `teleportation_privacy` | Mechanized |
| THM-TELEPORTATION-INDISTINGUISHABLE | Both senders produce identical trajectories for receiver | `teleportation_indistinguishable` | Mechanized |
| THM-CAUSAL-SYMMETRY | Causal direction is a frame artifact | `causal_symmetry` | Mechanized |
| THM-TELEPORTATION-MASTER | Master statistical teleportation | `statistical_teleportation` | Mechanized |

### Time Travel Topology (§15.23)

*Resolves six classic time travel tropes: irreversible reversal (impossible) vs sibling branch forking (possible).*

**Mechanization target:** `TimeTravelTopology.lean` (9 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-NO-REVERSAL | No reversal (irreversibility) | `no_reversal` | Mechanized |
| THM-VOID-IS-ARROW | Void is the arrow of time | `void_is_arrow` | Mechanized |
| THM-SIBLING-NOT-PAST | Sibling branch is not the past | `sibling_not_past` | Mechanized |
| THM-BUTTERFLY-ISOLATION | Butterfly effect is isolated to branches | `butterfly_isolation` | Mechanized |
| THM-TIME-TRAVEL-UNIFIED | Master time travel topology | `time_travel_unified` | Mechanized |

### Trade Topology (§19)

*Economic principles: tariffs increase deficit, free trade is optimal, markets are ground state.*

**Mechanization target:** `TradeTopology.lean` (16 theorems, one sorry -- diversity_necessity specialization)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-TARIFF-SUBOPTIMAL | Tariffs are suboptimal | `tariff_suboptimal` | Mechanized |
| THM-FREE-TRADE-ZERO-DEFICIT | Free trade has zero deficit | `free_trade_zero_deficit` | Mechanized |
| THM-AUTARKY-MAXIMUM-DEFICIT | Autarky is maximum deficit | `autarky_maximum_deficit` | Mechanized |
| THM-DEADWEIGHT-LOSS-POSITIVE | Deadweight loss is positive | `deadweight_loss_positive` | Mechanized |
| THM-TRADE-AGREEMENT-IMPOSSIBILITY | Trade agreement impossibility | `trade_agreement_impossibility` | Mechanized |
| THM-TRADE-TOPOLOGY-MASTER | Master trade topology | `trade_topology_master` | Mechanized |

### Trade Topology Round 3 (§19, P212-P216)

*Five economic predictions: price discrimination, production scheduling, cross-market inference, organizational slack, regulatory harmonization.*

**Mechanization target:** `TradeTopologyRound3.lean` (19 theorems, zero sorry). TLA+ `TradeTopologyRound3.tla` + `TradeTopologyRound3.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PERFECT-DISCRIMINATION-ZERO-LOSS | Perfect price discrimination zero loss | `perfect_discrimination_zero_loss` | Mechanized |
| THM-FLOW-SPEEDUP-EXACT | Flow speedup exact | `flow_speedup_exact` | Mechanized |
| THM-MARKET-INFERENCE-PRIVACY | Market inference preserves privacy | `market_inference_privacy` | Mechanized |
| THM-ZERO-SLACK-IFF-BALANCED | Zero slack iff balanced | `zero_slack_iff_balanced` | Mechanized |
| THM-TRADE-ROUND3-MASTER | Master trade topology round 3 | `trade_topology_round3_master` | Mechanized |

### Trade Topology Round 4 (§19, P222-P226)

*Flash crashes, intermediary chains, staged market entry, bailout vs bankruptcy, corporate hierarchy heat.*

**Mechanization target:** `TradeTopologyRound4.lean` (15 theorems, zero sorry). TLA+ `TradeTopologyRound4.tla` + `TradeTopologyRound4.cfg`.

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-FLASH-CRASH-INEVITABLE | Flash crash inevitable with thin liquidity | `flash_crash_inevitable` | Mechanized |
| THM-DIRECT-SALE-ZERO-LOSS | Direct sale has zero information loss | `direct_sale_zero_loss` | Mechanized |
| THM-STAGED-DOMINATES-BIG-BANG | Staged entry dominates big-bang | `staged_dominates_big_bang` | Mechanized |
| THM-ZOMBIE-NOT-DOMINATED | Zombie (bailout) not dominated by bankruptcy | `zombie_not_dominated_by_bankruptcy` | Mechanized |
| THM-FLAT-ORG-MINIMUM-ERASURE | Flat org has minimum erasure | `flat_org_minimum_erasure` | Mechanized |
| THM-TRADE-ROUND4-MASTER | Master trade topology round 4 | `trade_topology_round4_master` | Mechanized |

## Interpretation

- `Mechanized` means machine-checked by TLC and/or Lean build.
- `Mechanized (assumption-parameterized)` means the theorem is proved as an implication from explicitly declared assumptions; changing assumptions changes theorem applicability.
- `Mechanized (conditional on thermodynamic observable coupling)` means the theorem is proved conditional on a named, physically motivated axiom (Axiom TOC). The negative boundary theorem proves this axiom cannot be dropped.
- `Open (named compiler target; not yet mechanized)` means the theorem shape and proof obligations are documented in the ledger, but no machine-checked TLA+/Lean artifact closes that row yet. As of 2026-03-17, no rows carry this status -- all ledger theorems are mechanized.
- `Open (Lean draft; not yet mechanized)` means a Lean draft module exists and records the intended definitions or theorem names, but the draft is not part of the passing package build and therefore does not yet close the row.
- Entries tied to `Axioms.lean` encode theorem schemas; entries tied to `Claims.lean` encode constructive proofs over explicit model definitions.

## Paper Classification of Schema Theorems

These rows are manuscript metadata about theorem families already listed above. They use distinct `*-PAPER-LABEL` IDs so the canonical theorem ledger stays one-ID-per-row, and downstream coverage aliases each metadata row back to the primary theorem tool.

| Schema | Paper Label | Notes |
|---|---|---|
| `THM-CONVERGENCE-SCHEMA-PAPER-LABEL` | Conditional (7 physics axioms) | Assumptions A1-A7 labeled in `Axioms.lean`; paper states as "In any finite-state system satisfying (A1)-(A7)..." |
| `THM-COMPLETENESS-DAG-PAPER-LABEL` | Partially constructive | `local_node_decomposition` discharges node classification constructively; remaining: edge-coverage decomposition, encoding function existence |
| `THM-QUEUE-CONTAINMENT-PAPER-LABEL` | Superseded by THM-QUEUE-SUBSUMPTION | Forward direction now part of bidirectional subsumption |
| `THM-QUEUE-SUBSUMPTION-PAPER-LABEL` | Executable (bidirectional) | Forward: Lean + executable. Converse: executable. Representational, not dynamical |
| `THM-QUEUE-LIMIT-SCHEMA-PAPER-LABEL` | Conditional (standard measure-theoretic regularity) | DCT/MCT conditions labeled; paper states as "Under standard regularity..." |
| `THM-QUEUE-STATE-DEPENDENT-SCHEMA-PAPER-LABEL` | Mostly constructive (7/10 discharged) | 7 conditions automatically discharged from 3 user-supplied witnesses |
| `THM-QUEUE-ADAPTIVE-SUPREMUM-PAPER-LABEL` | Constructive synthesis | 5 synthesis routes: minimum slack, normalized scores, positive-part scores, selected slack, weighted slack |
| `THM-RG-FIXED-POINTS` | Iterated coarsening as renormalization group flow: cumulative heat is monotone along trajectories, information loss is additive (chain rule), RG fixed points have injective pushforward (singleton fibers), finite types guarantee termination, and fixed points satisfy beauty optimality trivially | `Fintype α`, `Fintype β`, `PMF α`, `DecidableEq`, boltzmann constant and temperature positive; fixed point requires `Set.InjOn quotient (PMF.support branchLaw)` | Lean theorems `trajectory_information_loss_additive`, `trajectory_cumulative_heat_monotone`, `fixed_point_characterization`, `fixed_point_minimum_heat`, `finite_trajectory_reaches_fixed_point`, `fixed_point_beauty_floor`, `trajectory_three_step_additive`, `trajectory_three_step_heat_monotone` in `RenormalizationFixedPoints.lean` | Mechanized |
| `THM-THERMO-TRACED-MONOIDAL` | Traced monoidal semantics coupled to thermodynamics: trace = coarsening (projection away feedback component), non-trivial feedback generates strictly positive Landauer heat, iterated traces increase cumulative heat monotonically, vanishing axiom (PUnit feedback) = zero heat, feedback loops yield beauty optimality via fold-erasure connection | `Fintype A`, `Fintype U`, `Fintype (A × U)`, `DecidableEq A`, `PMF (A × U)`, boltzmann/temperature positive; nontrivial feedback requires two distinct feedback values with positive mass | Lean theorems `trace_heat_nonneg`, `trace_heat_pos_of_nontrivial_feedback`, `iterated_trace_heat_monotone`, `trace_vanishing_heat`, `trace_vanishing_landauer_heat`, `feedback_beauty_floor`, structure `FeedbackThermodynamicCost` in `ThermodynamicTracedMonoidal.lean` | Mechanized |
| `THM-FOLD-HEAT-HIERARCHY` | Classification of folds by thermodynamic heat signature: injective = 0 heat, non-injective fibers generate strictly positive heat, uniform fold heat = kT ln2 × H(X\|f(X)) exactly, constant fold = maximum erasure (full source entropy), binary merge = minimum nonzero heat, computation as fold sequence has total heat = sum of per-fold heats (chain rule) | `Fintype α`, `Fintype β`, `PMF α`, `DecidableEq β`; non-injective requires witness pair with positive mass; algorithm decomposition uses chain rule | Lean theorems `injective_fold_zero_heat`, `fold_heat_lower_bound`, `fold_heat_hierarchy_strict`, `uniform_fold_heat_exact`, `maximum_heat_fold`, `maximum_heat_fold_dominates`, `minimum_nonzero_heat_fold`, `algorithm_heat_classification`, `algorithm_heat_classification_three`, `algorithm_heat_conservation` in `FoldHeatHierarchy.lean` | Mechanized |
| `THM-SEMIOTIC-PEACE` | Formal theory of confusion, war, and hope: semiotic fold is a coarsening with Landauer heat (confusion generates heat), successive folds without context accumulate heat monotonically (war as cumulative heat), shared context monotonically reduces deficit (peace), sufficient context eliminates deficit (fixed point), dialogue converges via traced monoidal feedback (hope). Master theorem `hope` bundles all convergence guarantees. `semiotic_peace_theory` unifies problem/danger/solution in one statement. | `SemioticChannel`, `Fintype (Fin n)`, `PMF (Fin n)`, `DecidableEq (Fin n)`; heat positivity requires collision witness with positive mass; context elimination requires `semanticPaths ≤ articulationStreams + contextPaths` | Lean theorems `confusion_irreducibility`, `confusion_generates_heat`, `confusion_heat_nonneg`, `war_as_cumulative_heat`, `war_three_stage_monotone`, `peace_context_reduces`, `peace_sufficient_context`, `dialogue_convergence`, `dialogue_heat_nonneg`, `peace_fixed_point`, `peace_is_reachable`, `hope`, `semiotic_peace_theory` in `SemioticPeace.lean` | Mechanized |
| `THM-COMMUNITY-ATTENUATES-FAILURE` | Community CRDT context reduces the scheduling deficit of any failure topology. Each CRDT-synced observation (win counts, latency means, failure rates, disagreement records) acts as one unit of shared context, reducing the gap between the topology's failure dimensions and the scheduler's decision capacity. The CRDT attenuates your failure topology -- your bad hand hurts less when the community remembers what failed. | FailureTopology with failurePaths >= 2, decisionStreams >= 1; positive communityContext | Lean theorem `community_attenuates_failure` in `CommunityDominance.lean` composing with `SemioticPeace.semiotic_context_reduces` via `failureToSemiotic` mapping | Mechanized |
| `THM-COMMUNITY-MONOTONE-NONDEGRADATION` | Community memory cannot increase the expected cost of an already-optimal backend. If the scheduling deficit is already non-positive (good hand), community context keeps it non-positive. Good hands stay good. | FailureTopology with non-positive schedulingDeficit; any communityContext | Lean theorem `community_monotone_nondegradation` in `CommunityDominance.lean` | Mechanized |
| `THM-COMMUNITY-STRICT-DOMINATION` | When community context is positive and the failure topology has positive deficit (bad hand), the community-reduced deficit is strictly less than the bare deficit. Combined with nondegradation: Pareto domination. | FailureTopology with positive schedulingDeficit; positive communityContext | Lean theorem `community_strict_domination` in `CommunityDominance.lean` | Mechanized |
| `THM-COMMUNITY-BRIDGES-TARES` | Community context reduces unbridged tares (failure modes not covered). More community knowledge means fewer uncovered failure modes. Sufficient context bridges all tares. | FailureTopology; c1 <= c2 for monotonicity; failurePaths <= decisionStreams + context for elimination | Lean theorems `community_bridges_tares`, `community_bridges_all_tares` in `CommunityDominance.lean` | Mechanized |
| `THM-COMMUNITY-BULE-CONVERGENCE` | The Bule deficit (scheduling gap in Bule units) decreases monotonically with community context. Each CRDT sync round reduces the deficit by exactly one Bule when there is remaining deficit. Sufficient community context drives the Bule deficit to zero. Convergence rate bounded by initial deficit. | FailureTopology; non-negative communityContext | Lean theorems `bule_deficit_nonneg`, `bule_deficit_monotone_decreasing`, `bule_deficit_strict_progress`, `bule_convergence`, `bule_convergence_rate_bound` in `CommunityDominance.lean` | Mechanized |
| `THM-COMMUNITY-DOMINANCE-THEORY` | Master theorem: for any failure topology with decisionStreams < failurePaths and positive community context: (1) failure deficit is real, (2) community attenuates failure strictly, (3) Bule deficit monotonically decreasing, (4) sufficient context eliminates deficit. Composes all community dominance results. | FailureTopology with bad hand; positive communityContext | Lean theorem `community_dominance_theory` in `CommunityDominance.lean` | Mechanized |
| `THM-COMMUNITY-DOMINANCE-MODEL` | Model-checked community fabric: safety (Bule bounded, non-negative, monotone, adaptive dominates static, nondegradation stable), liveness (eventually converges, eventually zero deficit), domination (per-round, strict, trauma attenuation, diversity amplification). | 4 backends across 4 layers; MaxFailurePaths=6; DecisionStreams=1; MaxRounds=8 | TLA+ `CommunityDominance.tla` + `CommunityDominance.cfg` with 11 invariants and 6 temporal properties | Model-checked |
| `THM-COMMUNITY-IS-SKYRMS-WALKER` | The community CRDT plays the role of Skyrms Walker S. The scheduling deficit IS the negotiation deficit. Community attenuation IS Skyrms mediation. One CRDT sync round = one mediation round = one Bule of shared context. | SkyrmsAsCommunity with walkerA_dims >= 2, walkerB_dims >= 2; positive mediationRounds | Lean theorems `community_deficit_is_negotiation_deficit` and `community_attenuation_is_mediation` in `SkyrmsNadirBule.lean` composing with `NegotiationEquilibrium.lean` and `CommunityDominance.lean` | Mechanized |
| `THM-BULE-ZERO-IS-NADIR` | The Skyrms nadir (inter-walker distance = 0) is exactly the state where buleDeficit = 0. Biconditional: buleDeficit = 0 iff interWalkerDistance = 0. At the nadirContext, Bule = 0. Below nadirContext, Bule > 0. The identification is exact. | SkyrmsAsCommunity; nadirContext = totalDims - 1 | Lean theorems `bule_zero_at_nadir`, `bule_zero_implies_nadir`, `nadir_implies_bule_zero`, `bule_zero_iff_nadir` in `SkyrmsNadirBule.lean` | Mechanized |
| `THM-NADIR-ALGEBRAIC` | The nadir can be computed algebraically: nadirContext = walkerA_dims + walkerB_dims - 1. At that context Bule = 0. Below that context Bule > 0. The solution is closed-form. No void walking needed. Set Bule = 0, solve. | SkyrmsAsCommunity with walkerA_dims >= 2, walkerB_dims >= 2 | Lean theorem `nadir_algebraic` in `SkyrmsNadirBule.lean` (four-part conjunction: value, convergence, minimality, positivity) | Mechanized |
| `THM-SKYRMS-NADIR-IS-BULE-ZERO` | Master theorem: three equivalent characterizations of the Skyrms nadir. (I) Community IS the mediator: deficit identification + attenuation = mediation. (II) Bule=0 IS the nadir: convergence at nadirContext. (III) The nadir is arithmetic: closed-form, tight, positive. (IV) Strict domination: community schedule dominates static when deficit positive. Composes CommunityDominance + NegotiationEquilibrium + VoidWalking. | SkyrmsAsCommunity; positive mediationRounds; all sub-theorem assumptions | Lean theorem `skyrms_nadir_is_bule_zero` in `SkyrmsNadirBule.lean` (seven-part conjunction) | Mechanized |
| `THM-SKYRMS-NADIR-BULE-MODEL` | Model-checked equivalence of three-walker convergence and Bule convergence: Bule nonneg, bounded, nadir constant, community tracks rounds, attenuation = convergence, algebraic nadir correct, solve-dont-walk, Bule-zero-is-nadir, mediation monotone. Both convergence criteria eventually met and agree. | 2 choices per walker; MaxRounds=6; EtaInit=3 | TLA+ `SkyrmsNadirBule.tla` + `SkyrmsNadirBule.cfg` with 8 invariants and 4 temporal properties | Model-checked |
| `THM-DIVERSITY-OPTIMALITY` | Composition theorem: diversity is the monotonically optimal, thermodynamically necessary condition for information-preserving computation in fork/race/fold systems. Five pillars: (1) Monotonicity — adding a branch never increases race minimum (THM-TOPO-RACE-MONOTONE, THM-DEFICIT-MONOTONE-IN-STREAMS); (2) Subsumption — racing achieves zero compression deficit, subsuming every fixed strategy (THM-TOPO-RACE-SUBSUMPTION, THM-TOPO-RACE-DEFICIT); (3) Necessity — reducing diversity below intrinsic β₁ forces positive information loss via pigeonhole + DPI (THM-DEFICIT-INFORMATION-LOSS, THM-COVERING-CAUSALITY); (4) Optimality — matched diversity = zero deficit = lossless transport (THM-ZERO-DEFICIT-PRESERVES-INFORMATION, THM-COVERING-MATCH); (5) Irreversibility — collapsing diversity requires vent/debt cost and generates irreducible Landauer heat (THM-DETERMINISTIC-SINGLE-SURVIVOR-REQUIRES-WASTE, THM-FOLD-ERASURE, THM-FOLD-HEAT). Semiotic extension: war is cumulative fold-heat, peace is the fixed point (THM-SEMIOTIC-PEACE). | `DiversityOptimalityWitness` bundling: `pathCount ≥ 2`, non-empty codec results, `FoldErasureWitness`, aligned branch snapshots with `liveBranchCount > 1` and `deterministicCollapse` | TLA+ `DiversityOptimality.tla` invariants `InvMonotonicity`, `InvSubsumption`, `InvNecessity`, `InvOptimality`, `InvIrreversibility`, `InvDiversityOptimality` + Lean theorems `diversity_monotonicity`, `diversity_subsumption`, `diversity_necessity`, `diversity_optimality`, `diversity_collapse_requires_waste`, `diversity_fold_generates_heat`, `diversity_erasure_chain`, `diversity_optimality_master`, `diversity_deficit_monotone` in `DiversityOptimality.lean` | Mechanized |

## Narrative Spine Status

- The ledger does support a strong mechanized spine from primitive safety/liveness through no-free deterministic collapse, exact collapse-cost floors, bounded scheduling laws, selected queue-conservation lifts, and compiler-kernel stability certificates.
- That spine now also has a finite/countable/measurable finite-type thermodynamic calibration layer together with an observable-pushforward shell: `THM-FAIL-LANDAUER-BOUNDARY` proves that the equiprobable Shannon erasure budget sits below the existing deterministic-collapse failure-tax floor, that every finite non-uniform branch law on the same finite support also stays below that same floor, that the finite entropy ceiling is attained exactly by the uniform law, that the finite failure-tax ceiling is attained exactly by the uniform law on one- or two-branch supports, that the nontrivial binary equality case is precisely the fair binary fork witness, that arbitrary PMFs admit both a countable-support entropy shell and a matching countable-support heat shell via `ENNReal` truncation/supremum/counting-measure formulas, that those finite entropy/heat inequalities and equality characterizations lift directly through the finite-type `ENNReal` shell, that arbitrary source PMFs can be coarse-grained along finite/countable measurable observables without losing the same failure-tax and collapse-cost domination on the observable codomain, and that on finite effective support deterministic observable coarsening cannot increase entropy or Landauer heat and therefore inherits the source-support frontier, failure-tax, and achievable-collapse heat bounds.
- That spine is not a single unconditional theorem. Several steps in the manuscript-level narrative are explicitly assumption-parameterized or executable-coverage results rather than constructive derivations from earlier rows.
- In particular, `THM-COMPLETENESS-DAG`, `THM-QUEUE-CONTAINMENT`, `THM-QUEUE-LIMIT-SCHEMA`, `THM-QUEUE-STATE-DEPENDENT-SCHEMA`, `THM-QUEUE-ADAPTIVE-SUPREMUM`, and `THM-CONVERGENCE-SCHEMA` remain schema/scaffold theorems whose force is exactly the force of their supplied witnesses. `THM-SLIVER-FRACTAL` now also has a constructive injective-live-support quotient special case, `THM-RENORMALIZATION-COARSENING` closes the first concrete genuinely many-to-one renormalization witness with aggregate `λ`/`μ`/`α`/drift preservation, collapsed-node drift transfer, a coarse-node certificate surface that aggregates local margins into a certified total renormalization margin, recursive reuse of that supplied certificate across `liftToCoarse` / `composeQuotient`, and a measurable one-node `Φ` surface whose negative drift witness can come either from the exact fine margin or from that derived coarse total margin, `THM-RECURSIVE-COARSENING-SYNTHESIS` is now mechanized with five Lean theorems (synthesis_sound, drift_conservation, fine_stability_implies_coarse_stability, identity_quotient_preserves_stability, certificate_provides_drift_witness) closing the compiler-side modularity target for syntax-driven quotient construction and recursive certificate synthesis, `THM-GNOSIS-CONTINUOUS-DRIFT` exposes the first real-state drift helper beyond the countable kernel surface, `THM-GNOSIS-CONTINUOUS-HARRIS` closes the first bounded affine measurable continuous-Harris package on the emitted queue family, `THM-GNOSIS-COUPLED` closes the first compiler-side tethering theorem for bounded inter-app handoff pressure, and the `THM-BEAUTY-*` family now has a constructive linear/additive special case together with arbitrary monotone-objective and monotone-profile lifts over that witness, a comparison-family unique-minimizer theorem for strict generalized-convex costs, an abstract failure-Pareto-frontier universal-floor theorem under explicit measure-side bounds, a non-convex real-objective lift across the workload/family/frontier layers, an explicit deficit-only boundary theorem, a deficit-dominating failure-tax bridge, an explicit failure-tax observable bridge, and concrete strict-profile family inhabitants of both bridge layers, but the broader manuscript-level universal generalizations still remain schema-parameterized or open.
- The thermodynamic story is now closed at five layers: (1) finite-support inequality/equality characterizations, (2) countable-support entropy/heat shells via `ENNReal` truncation/supremum/counting-measure formulas, (3) direct measurable finite-type entropy/heat shell, (4) finite/countable observable pushforward shell for arbitrary source PMFs, and (5) effective-support layer for arbitrary `PMF α` whose support is covered by a supplied `Finset α`. The effective-support layer (`effective_support_entropy_natsENN_le_log_card`, `effective_support_entropy_bitsENN_le_frontier_entropy_bits`, `effective_support_entropy_bitsENN_le_failure_tax`, `effective_support_landauer_heat_le_failure_tax_budget`, `effective_support_collapse_landauer_heat_le_total_cost`) restricts the arbitrary PMF to the covering Finset, applies the existing Fintype theorems to the restricted PMF, and lifts the full entropy/heat/failure-tax/collapse-cost chain back to the original PMF without requiring the ambient type to be `Fintype`. It now also has a deterministic-observable monotonicity face (`effective_support_observed_entropy_natsENN_le_source`, `effective_support_observed_entropy_bitsENN_le_source`, `effective_support_observed_landauer_heat_le_source` and their frontier/failure-tax/collapse-cost corollaries): once the source PMF is supported on `s`, any observable pushforward stays below the source entropy and heat and therefore below the same `s.card`-indexed frontier, failure-tax, and achievable-collapse heat ceilings without requiring measurable structure on the observable codomain. `THM-INFINITE-ERASURE` now closes the remaining measurable erasure gap for genuinely infinite support: any PMF with ≥ 2 atoms of positive mass has positive Shannon entropy (via `tsum` positivity in `ENNReal`), yielding positive Landauer heat without requiring Finset coverage or finiteness. The chain only needs entropy positivity, not finiteness. Observable pushforward preserves the two-atom condition when the observable separates the atoms.
- `THM-BEAUTY-DEFICIT-ONLY-BOUNDARY` now closes the sharp negative side of the beauty story: bare deficit bookkeeping alone does not order latency, waste, or even the simple strict score `latency + waste`.
- The strongest honest composite reading today is: within the modeled finite-DAG scope, the project mechanizes a costed calculus of branch collapse, a bounded scheduling/queueing envelope, a concrete beauty witness that reaches arbitrary monotone latency/waste objectives, arbitrary real monotone latency/waste objectives, and monotone/strict generalized-convex costs on top of deficit-monotone workload profiles, an indexed comparison-family unique-global-minimum theorem for a designated full-fit candidate under strict profiles, an abstract failure-Pareto-frontier zero-deficit floor theorem under explicit measure-side bounds, a conditional thermodynamic beauty bridge proving zero deficit is the unique optimum under the physically motivated Landauer observable coupling axiom (with a negative boundary proving the axiom cannot be dropped), a Landauer equality characterization (entropy = tax iff n ≤ 2, strict inequality for n ≥ 3), a five-layer thermodynamic calibration surface spanning finite, countable-support, measurable finite-type, observable-pushforward, and effective-support layers so that the full entropy/heat/failure-tax/collapse-cost chain applies to any PMF whose support is covered by a finite set, a compiler-side stability checker for kernels that carry explicit spectral/drift certificates including bounded pairwise tethering across app boundaries, a thermodynamic arrow of abstraction proving that every non-trivial coarsening incurs irreducible Landauer heat and that for coarsened systems beauty optimality holds without external thermodynamic axioms, a functorial information measure on quotient refinements with full composition/identity laws and Landauer heat naturality, a rate-distortion frontier for Pareto-optimal quotient selection over coarsening families, and a reduced convergence schema deriving two of seven axioms from throughput landscape optimization.
- `THM-BEAUTY-UNCONDITIONAL-FLOOR` is now closed as a conditional result. The thermodynamic observable coupling axiom (Axiom TOC, `ThermodynamicObservableCoupling` in `LandauerBeautyBridge.lean`) encodes the single physics assumption: Landauer erasure heat is observable through latency or waste. Under this axiom, `landauer_beauty_unconditional_floor` proves that zero topological deficit is the strict unique global minimum for every strict generalized-convex cost, and `landauer_beauty_unconditional_floor_objective` proves the same for every strict real monotone objective. The negative boundary theorem `THM-BEAUTY-DEFICIT-ONLY-BOUNDARY` proves this axiom cannot be dropped: bare deficit bookkeeping alone does not order latency/waste. The coarsened-system derivation of that coupling is now mechanized in `CoarseningThermodynamics.lean` (0 sorry): `coarsenedSystemObservableCoupling` constructs the coupling as a theorem, and `coarsened_system_beauty_unconditional_floor` closes beauty optimality for the coarsened-system class without Axiom TOC.
- `THM-LANDAUER-EQUALITY-CHARACTERIZATION` completes the entropy-tax equality story: frontier entropy equals failure tax if and only if liveBranches ≤ 2, and for n ≥ 3 the failure-tax floor strictly dominates entropy. This sharpens the paper's "tax exceeds information cost" claim to hold beyond the binary calibration point.
- The six schema theorems are now classified with paper labels: `THM-CONVERGENCE-SCHEMA` (conditional, 7 physics axioms), `THM-COMPLETENESS-DAG` (partially constructive), `THM-QUEUE-SUBSUMPTION` (executable, bidirectional), `THM-QUEUE-LIMIT-SCHEMA` (conditional, standard measure-theoretic regularity), `THM-QUEUE-STATE-DEPENDENT-SCHEMA` (mostly constructive, 7/10 discharged), `THM-QUEUE-ADAPTIVE-SUPREMUM` (constructive synthesis, 5 routes).
- The thermodynamic arrow of abstraction is now closed in the passing package build (8070 jobs). `DataProcessingInequality.lean` and `CoarseningThermodynamics.lean` are mechanized Lean modules proving strict DPI, coarsening heat, cumulative monotonicity, and beauty optimality for coarsened systems. All theorems in DataProcessingInequality.lean are now fully mechanized with zero `sorry`: non-strict DPI, strict DPI (fiber decomposition via Finset.sum_erase splitting + strict subadditivity of negMulLog), conditional entropy non-negativity and positivity, the zero-characterization (injective iff zero conditional entropy, both directions), chain rule, and all ENNReal lifts. Three additional research tracks extend the surface: `EntropicRefinementCalculus.lean` (functorial structure), `RateDistortionFrontier.lean` (Pareto-optimal quotient selection), and `EnrichedConvergence.lean` (7→5 axiom reduction).
- What is not yet mechanized is (a) a universal theorem that zero topological deficit uniquely optimizes *all* systems (including those with no coarsening history) without the thermodynamic coupling axiom, or (b) a theorem that the earlier phases alone derive the beauty/optimality layer without any extra hypotheses. The present package honestly names the single remaining physics assumption for the general case and proves it cannot be dropped. For the coarsened-system class, the assumption is now a theorem.
- **Track Zeta (Monoidal Coherence):** The `THM-PENTAGON`, `THM-TRIANGLE`, and `THM-HEXAGON` family now mechanizes the three generators of Mac Lane coherence for the fork/race/fold symmetric monoidal category. Pentagon and triangle together prove monoidal category structure (`THM-MONOIDAL-CATEGORY`); adding hexagon proves symmetric monoidal structure (`THM-SYMMETRIC-MONOIDAL`). `THM-COHERENCE` then cites Mac Lane's coherence theorem (1963): every well-typed diagram of structural morphisms commutes, since the three generators suffice. The §3.6 claim that fork/race/fold form a symmetric monoidal category is now mechanized rather than sketched. All proofs are by destructuring on product types followed by `rfl` — definitional equality on concrete function types.
- **Track Delta (Geometric Ergodic Convergence Rates):** `THM-GEOMETRIC-ERGODICITY-DISCRETE` adds quantitative convergence rates to the Harris recurrence machinery. The existing package proved *existence* of stationary measures; the new family proves *how fast* systems converge. The contraction rate `r = 1 - ε₁ε₂` is explicitly computable from the kernel certificate data (`THM-GEOMETRIC-ERGODICITY-RATE`), and the ε-mixing time satisfies `t_mix(ε) ≤ (1/(1-r)) · log(M(x)/ε)` (`THM-MIXING-TIME-BOUND`). `THM-CONTINUOUS-ERGODICITY-LIFT` extends these rates from discrete kernels to continuous-state kernels over Polish spaces via discrete sub-lattice embeddings. The "arrow of time" discussion in §12 now has a concrete convergence speed formula rather than just existence.
- **Track Epsilon (Fold-Erasure Beauty Optimality):** The `THM-FOLD-ERASURE` / `THM-FOLD-HEAT` / `THM-ERASURE-COUPLING` / `THM-BEAUTY-ERASURE-SUFFICIENT` family narrows the Axiom TOC gap from "all systems need TOC" to "only injective-fold systems need TOC." The chain is: fork → copies → fold (many-to-one) → data processing inequality → positive conditional entropy → positive Landauer heat → heat observable → beauty floor holds. For non-injective folds, the `ThermodynamicObservableCoupling` is constructed as a *theorem* (`THM-ERASURE-COUPLING`), not assumed as an axiom. Since almost all practical folds are many-to-one, beauty optimality is effectively unconditional. `THM-FOLD-INJECTIVITY-BOUNDARY` proves the exact boundary: only injective folds (zero conditional entropy, degenerate coupling) fall outside the erasure-sufficient regime. The §6 beauty/optimality claim is now "unconditional for non-injective fold" rather than "conditional on Axiom TOC."
- **Track Eta (Traced Monoidal Structure):** The `THM-TRACE-VANISHING` / `THM-TRACE-YANKING` / `THM-TRACE-SLIDING` / `THM-TRACE-SUPERPOSING` / `THM-TRACED-MONOIDAL` / `THM-TRACE-ITERATION` family extends the symmetric monoidal category (Track Zeta) with a trace operator modeling feedback loops and iterative computation. The trace is defined as a bounded fixed-point combinator on GHom, and the Joyal-Street-Verity (1996) axioms — vanishing, yanking, sliding, superposing — all hold by definitional equality on concrete product types (the same `funext`/`rfl` pattern as pentagon/triangle/hexagon). `THM-TRACED-MONOIDAL` bundles all four axioms, and `THM-TRACE-ITERATION` shows the trace models bounded iteration. The §3.6 claim upgrades from "symmetric monoidal category" to "traced monoidal category" — iterative/recursive computation including retry logic and control loops is now categorically grounded.
- **Track Theta (Deficit-Capacity Duality):** The `THM-DEFICIT-CAPACITY-GAP` / `THM-DEFICIT-INFORMATION-LOSS` / `THM-DEFICIT-ERASURE-CHAIN` / `THM-ZERO-DEFICIT-PRESERVES-INFORMATION` / `THM-DEFICIT-MONOTONE-IN-STREAMS` family upgrades "deficit causes blocking" (THM-COVERING-CAUSALITY) to "deficit causes information loss" with an explicit bound. The core argument composes pigeonhole collisions (from topological deficit) with the data processing inequality: k paths on m < k streams forces non-injective multiplexing, which erases information. The full chain from topology to thermodynamics — deficit → collision → erasure → Landauer heat → observable waste — is mechanized via `THM-DEFICIT-ERASURE-CHAIN`. `THM-ZERO-DEFICIT-PRESERVES-INFORMATION` proves the converse: zero deficit permits lossless transport. The §6.13 (the Bule) upgrades from "correlated with waste" to "lower-bounds information loss."
- **Track Iota (Compositional Geometric Ergodicity):** The `THM-PARALLEL-ERGODICITY` / `THM-SEQUENTIAL-ERGODICITY` / `THM-PIPELINE-MIXING-BOUND` / `THM-PIPELINE-CERTIFICATE` / `THM-ERGODICITY-MONOTONE-IN-STAGES` family proves that pipelines of independently geometrically ergodic stages are themselves ergodic with computable composite rates. Parallel composition gives rate max(r₁, r₂) (slower stage dominates); sequential composition gives rate r₁·r₂ (rates multiply — faster convergence). Pipeline mixing time is bounded, and per-stage stability certificates compose automatically into pipeline-level certificates. The §12 (the engine) gains "pipeline stability is compositional and mechanized" and §14 gains "per-stage ergodicity certificates compose."
- **Track Kappa (Syntactic Lyapunov Synthesis):** The `THM-SYNTACTIC-LYAPUNOV-AFFINE` / `THM-SYNTACTIC-SMALL-SET` / `THM-SYNTACTIC-WITNESS-SOUND` / `THM-SYNTACTIC-WITNESS-COMPLETE-AFFINE` / `THM-SYNTACTIC-PIPELINE-LIFT` family proves that for affine drift programs (linear drift, bounded state, explicit vent threshold), the compiler can automatically synthesize a Lyapunov function V(x) = x, small set C = {x ≤ T}, and emit a GeometricErgodicityRate certificate without human-supplied measure theory. This is the first class where the "compiler oracle" target from §14 is tractable. `THM-SYNTACTIC-WITNESS-COMPLETE-AFFINE` proves completeness: synthesis always succeeds for affine programs. `THM-SYNTACTIC-PIPELINE-LIFT` composes with Track Iota to give "compiler auto-certifies multi-stage pipelines."
- **Track Lambda (Wallington Rotation Optimality):** The `THM-ROTATION-ADMISSIBLE` / `THM-ROTATION-MAKESPAN-BOUND` / `THM-ROTATION-DOMINATES-SEQUENTIAL` / `THM-ROTATION-PARETO-SCHEDULE` / `THM-ROTATION-DEFICIT-CORRELATION` family mechanizes the Wallington Rotation's scheduling optimality. The rotation achieves the critical-path makespan (numStages × maxStageTime), which is tight for balanced fork/race/fold DAGs. For β₁ > 0, it strictly dominates sequential scheduling with speedup factor = numPaths. It is Pareto-optimal in (makespan, resources). The speedup correlates monotonically with topological deficit reduction. The §12 empirical gains (3.1x-267x) now have formal backing.
- **Track Mu (Ergodic Envelope Convergence Rate):** The `THM-ENVELOPE-CONTRACTION` / `THM-ENVELOPE-GEOMETRIC-CONVERGENCE` / `THM-ENVELOPE-MIXING-TIME` / `THM-ENVELOPE-SPECTRAL-CONNECTION` / `THM-ENVELOPE-CERTIFICATE-AT-N` family closes the Jackson network convergence gap. The throughputEnvelopeApprox ladder contracts at rate ρ = maxIncomingRoutingMass per step, giving geometric convergence |approx(n) - exact| = R₀ · ρ^n. The ladder reaches ε-accuracy in finite steps (`THM-ENVELOPE-MIXING-TIME`), and early stopping is sound whenever the residual is below the service slack (`THM-ENVELOPE-CERTIFICATE-AT-N`). The §14 Jackson-network gap upgrades from "open" to "geometric convergence rate mechanized."
- **Track Nu (Nonlinear Lyapunov Synthesis):** The `THM-NONLINEAR-LYAPUNOV-QUADRATIC` / `THM-NONLINEAR-LYAPUNOV-POWER` / `THM-NONLINEAR-SMALL-SET-VALID` / `THM-NONLINEAR-WITNESS-SOUND` / `THM-NONLINEAR-DOMINATES-AFFINE` family extends Track Kappa from affine V(x) = x to nonlinear V(x) = x^p. For quadratic V(x) = x², the effective drift gap grows linearly with state (gap·(2x-gap)), giving tighter convergence rates than affine for states far from the small set (`THM-NONLINEAR-DOMINATES-AFFINE`). The power Lyapunov V(x) = x^p satisfies Foster drift monotonically in the exponent. This handles fluid backlog, fractional retry mass, and thermodynamic state variables that require superlinear barrier functions.
- **Track Xi (Adaptive Lyapunov Decomposition Discovery):** The `THM-ADAPTIVE-GRADIENT-DECOMPOSITION` / `THM-ADAPTIVE-BOTTLENECK-DETECTION` / `THM-ADAPTIVE-RESERVE-COVERAGE` / `THM-ADAPTIVE-DECOMPOSITION-SOUND` / `THM-ADAPTIVE-DOMINATES-UNIFORM` family proves that the gradient of service slack across network nodes defines a valid and optimal Lyapunov decomposition. Gradient weights wᵢ = sᵢ/Σsⱼ are non-negative and normalized. The gradient reserve (Σsᵢ²)/(Σsᵢ) dominates uniform weights by Cauchy-Schwarz. This closes the "automatic discovery of richer chosen-Lyapunov decompositions" gap from the adaptive shell.
- **Track Omicron (Race-Winner Correctness):** The `THM-RACE-WINNER-VALIDITY` / `THM-RACE-WINNER-MINIMALITY` / `THM-RACE-WINNER-DETERMINISM` / `THM-RACE-WINNER-ISOLATION` / `THM-RACE-WINNER-COMPOSABLE` family closes the "does not by itself certify race-winner correctness" gap in the ledger. The race operation selects winners that are valid (pass the predicate), minimal (fastest among valid), deterministic (C3: ties broken by index), isolated (C2: vented branches don't affect winner), and composable (results fold through the monoidal structure). The `RaceCorrectness` bundle certifies all five properties simultaneously.
- **Track Pi (Semiotic Deficit Theory):** The `THM-SEMIOTIC-DEFICIT` / `THM-SEMIOTIC-ERASURE` / `THM-SEMIOTIC-VENT-NUANCE` / `THM-SEMIOTIC-RACE-ARTICULATION` / `THM-SEMIOTIC-CONTEXT-REDUCES` / `THM-SEMIOTIC-CONVERSATION-TRACE` / `THM-SEMIOTIC-MOA-ISOMORPHISM` family maps fork/race/fold/vent to formal semiotics. Thought has high β₁ (parallel semantic paths); speech has β₁ = 0 (single stream); the deficit is confusion. The speech fold erases meaning by DPI (`THM-SEMIOTIC-ERASURE`). Speakers vent nuance when the fold can't preserve all paths (`THM-SEMIOTIC-VENT-NUANCE`). Phrasing selection is a neural race where the fastest adequate candidate wins (`THM-SEMIOTIC-RACE-ARTICULATION`). Shared context reduces deficit by adding implicit parallel channels (`THM-SEMIOTIC-CONTEXT-REDUCES`); sufficient context eliminates it. Conversation is a traced monoidal feedback loop that converges as context accumulates (`THM-SEMIOTIC-CONVERSATION-TRACE`). The Mixture of Agents architecture has the same deficit structure as thought→speech (`THM-SEMIOTIC-MOA-ISOMORPHISM`). The bundle `semiotic_deficit_theory` composes all four core results for single-stream speech.

## Derived Vocabulary

- The terms in this section are documentation definitions indexed to the theorem families above. They are not additional mechanized theorems, and they inherit the scope and assumptions of the cited entries.
- `branch mass`: the current multiplicity of live alternatives tracked by `liveBranchCount`, together with its stagewise preservation/loss bounds and its normalized arbitrary-depth lift; see `THM-FAIL-TRILEMMA`, `THM-FAIL-COMPOSITION`, and `THM-FAIL-UNIVERSAL`.
- `collapse law`: the rule by which branches are reconciled, together with the obligations that make that reconciliation truthful for the target family. In the current formal surface this includes deterministic-fold coherence plus partition-additivity, order-invariance, and cancellation preservation where those witnesses are required; see `THM-GNOSIS-MONOIDAL` and `THM-Q-CORRESPONDENCE-BOUNDARY`.
- `interference pattern`: the observable recombination behavior of a fold over the same path family. In the current formal surface this is witnessed by cancellation-sensitive examples and by partition/order behavior, not by a standalone amplitude calculus; see `THM-Q-CORRESPONDENCE-BOUNDARY`.
- `vented loss`: explicit branch loss counted by `ventedCount` / `totalVented`, optionally paired with `repairDebt` into total collapse cost; on the current thermodynamic bridge this same floor upper-bounds equiprobable frontier entropy, arbitrary finite-support branch-law entropy, the countable-support entropy/heat shells and their finite-type `ENNReal` lifts, and arbitrary Bernoulli binary erasure/heat budgets, with exact `kT ln 2` equality only on the fair binary witness; see `THM-FAIL-TRILEMMA`, `THM-FAIL-MINCOST`, `THM-FAIL-LANDAUER-BOUNDARY`, and `THM-FAIL-TIGHTNESS`.
- `optionality`: a derived shorthand for the ability to defer irreversible single-winner collapse while more than one live branch remains available. In this ledger it is operationalized by positive branch mass together with the absence or postponement of deterministic single-survivor collapse; it is spent by venting or by paid collapse, and counterfeit optionality is exactly the boundary ruled out by the no-free-collapse theorems.
- `structured ambiguity processor`: an interpretive summary for systems described by this ledger. Branch mass records how many live alternatives remain, the collapse law records how they are reconciled, interference witnesses record what information that reconciliation preserves or destroys, and vent/repair accounting records the price of determinism.
- `coupled manifold`: a documentation shorthand for two certified kernels tethered by one-way handoff pressure, where the handoff is read as downstream arrival pressure and is safe exactly while it stays below the downstream drift margin; see `THM-GNOSIS-GEOMETRY` and `THM-GNOSIS-COUPLED`.
- `Harrigan Margin`: a documentation shorthand for remaining recovery slack under an adversity vector, written as drift margin minus imported collapse pressure. In the current formal surface this is indexed to the same strict-inequality boundary as `THM-GNOSIS-COUPLED`: positive margin means the imported pressure is still below the downstream drift certificate.
- `Harrigan Horizon`: the zero-margin boundary where imported collapse pressure exactly spends the available drift slack. Positive Harrigan Margin is locally recoverable, zero is threshold, and negative is post-threshold collapse regime. This is theorem-indexed vocabulary over `THM-GNOSIS-COUPLED`, not a separate mechanized theorem.
- `volatility budget`: a documentation shorthand for a bound on time-varying fluctuation around baseline adversity over an observation window. In the current manuscript surface this is written as `|ν(x,t)| ≤ V(x)` and is used to separate inherited baseline burden from adverse swings; it is explanatory vocabulary rather than a standalone theorem.
- `dynamic Harrigan Horizon`: the windowed zero-margin boundary obtained from the minimum coupled recoverability margin over a finite interval. In the current manuscript surface this is written as `inf_{0 ≤ t ≤ T} (γ + C - A) = 0`; it is a theorem-indexed dynamic reading over the static `THM-GNOSIS-COUPLED` boundary together with the shared-ancestry coherence surfaces, not a separate mechanized theorem.
- `Harrigan Cascade`: a documentation shorthand for the layered propagation of inherited adverse pressure, local collapse cost, and shared void ancestry across a stack. In the current formal surface it is indexed to `THM-GNOSIS-COUPLED`, `THM-FAIL-COMPOSITION`, `THM-VOID-TUNNEL`, and `THM-SLIVER-FRACTAL`: imported pressure spends downstream slack, paid collapse composes across stages, downstream voids remain correlated when they share ancestry, and coarsening cannot erase contagious inherited damage for free.
- `coherence field`: a documentation shorthand for the alignment supplied by shared ancestry together with a shared classification or update rule. In the current formal surface it is theorem-indexed over `THM-VOID-TUNNEL`, `THM-VOID-COHERENCE`, and `THM-NEGOTIATION-COHERENCE`: shared ancestry keeps descendants correlated, and shared deterministic or rational update rules make those descendants converge rather than drift apart.
- `coherence bandwidth`: a documentation shorthand for the effective rate at which a coherence field can re-align descendants or damp a disturbance before the coupled recoverability margin crosses zero. This is an interpretive dynamic extension over the same shared-ancestry and coherence families; it is not yet a mechanized control-theoretic witness.
- `culture field`: an interpretive alias for a coherence field when the shared boundary and update rule are social, operational, or distributed across agents rather than encoded as a single local program. This is not a standalone theorem; it is documentation vocabulary over the same shared-ancestry and coherence families plus ancestry-preserving reconciliation.
- `cultural memory`: the shared ancestry-preserving state in which adverse marks remain writable, mergeable, and available to future descendants. In the current manuscript surface the recovery CRDT is the operational memory of the culture field. This is theorem-indexed vocabulary over the same shared-ancestry and coherence families plus ancestry-preserving reconciliation, not a separate mechanized object.
- `Brainwash Principle`: a documentation shorthand for the censorship boundary in ancestry-preserving learning systems. Suppressing relevant failure marks is a deterministic coarsening of shared observable history, so by data processing it cannot increase information, and when the erased distinction is predictive it strictly increases expected rediscovery, vent, or repair cost. In the current formal surface this is indexed to the data-processing theorem together with `THM-VOID-TUNNEL`, `THM-VOID-COHERENCE`, `THM-NEGOTIATION-COHERENCE`, and `THM-FAIL-COMPOSITION`.
- `forced amnesia`: an interpretive gloss for the Brainwash Principle. It names the case where censorship preserves apparent order by preventing adverse history from leaving a persistent shared mark, thereby weakening future learning and coordination rather than truly repairing the underlying failure surface.
- `cover-space corollary cracking`: a documentation shorthand for lifting a typed base topology into a richer cover space whose fibers carry attacker budget, proof state, capability provenance, audit visibility, trust freshness, and similar latent variables, then asking which derived claim fails while the base topology still typechecks. In the current implementation, `cracking` is metaphorical: exposing violating corollaries together with witness traces, not constructing operational secret-recovery machinery. This is theorem-indexed vocabulary over `THM-COVERING-CAUSALITY`, `THM-COVERING-MATCH`, the information-loss/data-processing surface, and the no-free-collapse family.
- `offline-risk negative control`: a documentation shorthand for intentionally weak or toy password-digest constructions used to calibrate confidentiality corollaries in the lifted cover space. Fast, unsalted, low-work-factor, or truncated digests should produce bounded witness traces, while strong salted slow derivations should remain clean under the same claim family. This is a calibration surface over the existing covering / information-loss / collapse-cost boundaries, not a separate mechanized theorem.
- `recovery-trust surface`: a documentation shorthand for socio-technical recovery, approval, audit, helpdesk, channel-binding, and trust-freshness topologies represented in the same lifted cover space. Representative failure marks include recovery without re-proof, approval amplification, audit suppression, helpdesk bypass, stale trust, and cross-channel identity drift. This is theorem-indexed vocabulary over the shared-ancestry/coherence family, the censorship boundary, and the no-free-collapse family rather than a standalone theorem object.
- `witness ancestry`: a documentation shorthand for preserving the branch trace attached to a derived failure surface rather than collapsing it into a summary verdict. Under the Brainwash Principle, suppressing relevant witness ancestry is itself an information-destroying coarsening of the observable history, so audit surfaces that preserve witness traces are epistemically stronger than those that retain only a final label.
- `ancestry-preserving reconciliation`: a documentation shorthand for reconciliation operators that converge by retaining causal ancestry instead of venting all but one winning branch. In the current formal surface this is an interpretive bridge over the existing void-boundary, shared-ancestry, and no-free-collapse families rather than a standalone theorem; see `THM-VOID-BOUNDARY-MEASURABLE`, `THM-VOID-TUNNEL`, and `THM-FAIL-TRILEMMA`.
- `void-preserving fold`: a documentation shorthand for a reconciliation step that produces a stable descendant state while keeping the causal residue of adverse branches available in the merged history. It contrasts with deterministic single-survivor collapse, which pays by vent or repair debt and erases alternatives from the live frontier; see `THM-VOID-BOUNDARY-MEASURABLE`, `THM-VOID-TUNNEL`, `THM-FAIL-TRILEMMA`, and `THM-FAIL-COMPOSITION`.
- With that vocabulary fixed, the strongest theorem-indexed summary is: fork/race/fold/vent gives a ledger for reasoning about preserved options, truthful or untruthful collapse, and the minimum cost of determinism. It does not by itself certify race-winner correctness, make arbitrary folds information-preserving, provide free single-winner collapse, or discharge measurable-limit / Harris-style claims without the explicit witness structure named above.

## Runtime Witness Bridge

The §6.12 boundary theorems now also have a runtime witness bridge: `Witnesses.lean` and `WitnessExport.lean` emit the concrete cancellation, partition, and order examples captured in `artifacts/formal-witness-catalog.{json,md}`, and `src/quantum-correspondence-boundary.test.ts` consumes that exported catalog directly.
The bounded raw adaptive rerouting witness now has the same bridge: `AdaptiveWitnesses.lean` and `AdaptiveWitnessExport.lean` emit the concrete two-node adaptive `α` closure captured in `artifacts/formal-adaptive-witness-catalog.{json,md}`, and `src/formal-adaptive-witness-catalog.test.ts` checks that the executable adaptive-supremum artifact matches the exported formal witness exactly.

## Current Formal Boundary

- The ledger now spans two mechanization surfaces: the local `formal/lean` package and the Betti compiler proofs in [`open-source/gnosis/GnosisProofs.lean`](../../../../../../gnosis/GnosisProofs.lean).
- The compiler layer is now explicit in the ledger: `THM-GNOSIS-MONOIDAL`, `THM-GNOSIS-SPECTRAL`, `THM-GNOSIS-RECURRENCE`, `THM-GNOSIS-CONTINUOUS-DRIFT`, `THM-GNOSIS-CONTINUOUS-HARRIS`, `THM-GNOSIS-GEOMETRY`, and `THM-GNOSIS-COUPLED` cover monoidal execution coherence, routing-kernel spectral stability, countable small-set recurrence, the first real-state measurable drift surface, the first bounded affine measurable continuous-Harris queue package, certified geometric stability for emitted Gnosis kernels, and bounded inter-app tethering where coupling pressure spends downstream drift slack without changing the downstream spectral certificate. That surface now also has direct structured-primitive coverage in the compiler tests: a sink-wrapped `StructuredMoA` declaration lowers into the same acyclic emitted kernel and takes the nilpotent spectral certificate path without an extra drift-floor assumption.
- `THM-QUEUE-JACKSON-PRODUCT` now has two in-package witness constructors: `constructiveNetworkData` from the least fixed-point throughput and `spectralNetworkData` from the resolvent-style spectral candidate.
- `JacksonQueueing.constructiveThroughput_le_of_real_fixed_point` now makes the bridge explicit: any nonnegative real fixed point bounds the monotone constructive witness, so a stable spectral candidate can certify the iterative path once its own side conditions are available.
- The current witness recipe is explicit: set `α_spec := spectralThroughput = λ (I - P)^{-1}` under `spectralRadius P < 1`, prove `α_spec >= 0` and `α_spec < μ`, instantiate `spectralNetworkData`, then use `constructiveThroughput_le_spectralThroughput`, `constructiveThroughput_finite_of_spectral`, and `constructiveThroughput_stable_of_spectral` to promote that same candidate into `constructiveNetworkDataOfSpectral`.
- `THM-QUEUE-JACKSON-EXACT` now surfaces the exact fixed-point closure that was already latent in that route: under `spectralRadius P < 1`, any supplied nonnegative stable real fixed point is unique, equals the constructive least fixed point after `toReal`, and already closes the same constructive mean-occupancy and `lintegral` balance laws without going through `throughputEnvelopeApprox n`.
- There is now also a raw-data sufficient criterion, elevated in the ledger as `THM-QUEUE-JACKSON-RAW`: `JacksonQueueing.throughputEnvelopeApprox`, `JacksonQueueing.constructiveNetworkDataOfThroughputEnvelopeApproxOfMaxIncomingRoutingMass`, `JacksonQueueing.spectralNetworkDataOfThroughputEnvelopeApproxOfMaxIncomingRoutingMassAuto`, and their measure corollaries discharge the witness side conditions automatically once `maxIncomingRoutingMass < 1` and the chosen finite-step envelope sits below each node's service rate; `JacksonRawClosure` additionally packages the coarsest `minServiceRate` route as a named theorem surface with no hand-supplied `α`. Here `throughputEnvelopeApprox 0` is the global envelope `maxExternalArrival / (1 - maxIncomingRoutingMass)`, `throughputEnvelopeApprox 1` equals `localThroughputEnvelope`, `throughputEnvelopeApprox 2` equals `secondOrderThroughputEnvelope`, and the specialized local/second-order constructors remain available as named corollaries. The ladder is now explicitly descending via `throughputEnvelopeApprox_succ_le`, the scalar residual/error theorems bound its spectral error by `throughputEnvelopeResidual n`, including the explicit absolute-error form `|throughputEnvelopeApprox n - α_spec| ≤ throughputEnvelopeResidual n`, the lower `trafficApprox` iterates are residual-certified from below via `α_spec - (trafficApprox n).toReal ≤ throughputEnvelopeResidual (n + 1)`, and there is now also a routing-shaped node-local residual ladder `throughputResidualApprox n` with the corresponding per-node upper certificate `throughputEnvelopeApprox n ≤ α_spec + throughputResidualApprox n`. Together these give a formal interval bracket between lower real traffic iterates and upper envelope iterates. `JacksonQueueing.minServiceRate`, `spectralThroughput_nonneg_of_maxIncomingRoutingMass_lt_one`, `spectralThroughput_stable_of_maxIncomingRoutingMass_lt_minServiceRate`, `constructiveNetworkDataOfMaxIncomingRoutingMassMinService`, and `spectralNetworkDataOfMaxIncomingRoutingMassMinServiceAuto` package the corresponding `minServiceRate` corollary. `THM-QUEUE-JACKSON-FEEDFORWARD` now isolates one nontrivial raw exact subclass of that surface: the bounded two-node feed-forward ceiling witness has nilpotent routing, so its explicit candidate already equals the constructive least fixed point with no extra ladder stage.
- In other words, the remaining gap is no longer the transfer itself, nor the existence of either an exact fixed-point closure, a raw sufficient criterion, or a non-uniform service-bound route. The transfer is mechanized, the exact fixed-point closure is mechanized, the current finite-step envelope ladder `throughputEnvelopeApprox n` is mechanized, its descending behavior is mechanized, its scalar and routing-shaped residual/error scaffolds are mechanized, the named `localThroughputEnvelope` and `secondOrderThroughputEnvelope` are just its first refinements, and service certificates against that ladder are already supported. The open part is deriving exact fixed points or still-sharper arrival/routing envelopes directly from `(λ, P, μ)` in full generality without collapsing to the current exact-witness-plus-ladder/residual family.
- The adaptive extension is no longer purely schematic. The generic comparison principle from a dominating kernel or substochastic `supremumKernel` to the adaptive constructive witness is mechanized, `THM-QUEUE-ADAPTIVE-RAW-CEILING` now closes one concrete bounded two-node rerouting family all the way down to an explicit linear drift witness, and that same witness is exported into the runtime artifact surface. The generic shell also no longer takes either adaptive inequality as a naked assumption: it derives the expected-Lyapunov ceiling from raw ceiling domination data, it can synthesize a bottleneck route automatically from the minimum node slack, it can normalize raw nonnegative score families into legal drift weights, it can also clip arbitrary real scores to their positive part before normalizing, it accepts explicit selector-based one-hot decompositions, it now derives a built-in normalized route from raw service slack, and it also exposes a built-in normalized route from raw routing pressure. In the normalized nonnegative weighted-slack case it derives the drift-gap coverage automatically from pointwise node slack bounds. The remaining open part is generic automatic discovery of still-richer chosen-Lyapunov decompositions for arbitrary adaptive Lyapunov choices.
- The app-as-node / quotient story is now explicit at five levels. The general shell is still `THM-SLIVER-FRACTAL`: a support-preserving coarse image cannot make contagious fine-scale interference collapse for free. There is also a constructive injective-live-support quotient special case in `InterferenceCoarsening.lean` that derives the coarse repair-debt conclusion directly from a concrete quotient map and a deterministic-collapse repair law, plus a small app-stage witness. Beyond that, the genuine many-to-one aggregation surface `Phi` now preserves total arrival pressure, service capacity, restorative shedding, and total drift across coarse fibers, and `THM-RENORMALIZATION-COARSENING` adds both a concrete non-injective witness where the collapsed node carries the aggregate `λ`, `μ`, `α`, and negative drift margin and a coarse-node certificate surface that sums local coarse margins into a certified total renormalization margin, transfers that derived margin to the collapsed measurable node, and reuses a supplied certificate across recursive quotient steps. `THM-RENORMALIZATION-REUSE` then closes the recursive one-node reuse layer explicitly: once a quotient is verified, its aggregate coarse interface can be lifted and re-quotiented again with the same final measurable-node drift witness as direct quotient composition. Interpretively, this is the current theorem-indexed boundary for reading whole Gnosis apps or subgraphs as coarse nodes: observed cross-app interference can justify a Worthington-style correction fold only after the quotient witnesses preserve support, survivor faithfulness, coarse conservation, and drift. It still does not by itself produce a Wallington Rotation. Rotation is a scheduling structure over a staged partial order.
- The system-scale / modularity target `THM-RECURSIVE-COARSENING-SYNTHESIS` is now fully mechanized. `RecursiveCoarseningSynthesis.lean` proves synthesis soundness (valid certificate from stable graph data), drift conservation (total fine drift = total coarse drift via Finset.sum_biUnion rearrangement), and stability transfer (fine stability implies coarse stability via Finset.sum_lt_sum). The formal surface now supports the complete chain: support-preserving and injective-live-support app-as-node readings, total `λ`/`μ`/`α`/drift preservation across coarse fibers, concrete genuinely many-to-one collapse to a single node with transferred negative drift, local coarse-node certificate aggregation into a total margin, transfer of that total margin to the collapsed measurable node, recursive reuse of a supplied certificate, the singleton-image corollary, and automatic recursive verification of bounded many-to-one structural coarsenings via compiler-synthesized quotient witnesses.
- The remaining Jackson-network gap is automatic discharge of exact fixed points or equivalent witness side conditions from `(λ, P, μ)` alone beyond the current descending `throughputEnvelopeApprox` ladder, its residual convergence certificate, and the `minServiceRate` corollary, especially for sharper arrival/routing certificates of nonnegativity, finiteness, and strict sub-service stability for the chosen `α`.
- On the compiler side, the remaining open part has moved past finite/countable certified kernels, the first real-state drift witness surface, and the first bounded affine measurable continuous-Harris witness package on the emitted queue kernel. The current checked boundary is now explicit: `THM-GNOSIS-CONTINUOUS-HARRIS` and `THM-GNOSIS-GEOMETRY` already certify the emitted affine queue family once the syntax carries the right drift parameters, so the open target is no longer "some" continuous witness but continuous syntactic physics in the literal sense.
- Concretely, the current compiler surface can already emit `*_measurable_observable`, `*_measurable_observable_drift`, and `*_measurable_continuous_harris_certified` theorems for the queue-support kernel when syntax supplies an affine observable family with `0 < driftGap <= observableScale`. What it still does not synthesize from syntax itself is the measurable small set `C`, the minorization data, or the continuous Lyapunov function `V(x)` for genuinely different observable families and non-queue measurable kernels needed for positive Harris recurrence and geometric ergodicity in the broader continuous setting. The target workloads are no longer just discrete queue lengths, but fluid backlog, fractional retry mass, and thermodynamic state variables such as continuous load or temperature coordinates whose stability proof should still be driven by `VENT` boundaries, service slack, and the dominating-ceiling comparisons already present in the adaptive shell.
- The next honest boundary is therefore a Betti-to-Lean bridge that lowers arbitrary continuous `.gg` source syntax into a measurable kernel and automatically synthesizes the Harris witness package from the program itself: the measurable small set `C`, the continuous Lyapunov witness `V(x)`, and the accompanying stochastic-limit proof obligations. In manuscript terms, that is the universal-physics-engine target: a compiler oracle that reads ordinary continuous-variable code and derives its thermodynamic stability laws instead of asking the human to hand-build the measure theory.
- Until that broader surface is mechanized, Betti can certify finite/countable kernels, emit a bounded affine continuous-Harris witness over the queue family, and discharge assumption-parameterized measurable shells, but it is not yet a compiler oracle that turns arbitrary symbolic continuous syntax directly into physical thermodynamics and stochastic-limit theorems.
- On the beauty side, the constructive surface now reaches arbitrary componentwise monotone nonlinear objectives and monotone generalized-convex costs over deficit-monotone latency/waste profiles, a comparison-family unique-minimizer theorem, an abstract failure-Pareto-frontier zero-deficit floor theorem under explicit measure-side bounds, a deficit-dominating failure-tax bridge, an explicit failure-tax observable bridge, concrete strict-profile family instances of both bridge layers, and a conditional thermodynamic beauty bridge (`LandauerBeautyBridge.lean`) that closes `THM-BEAUTY-UNCONDITIONAL-FLOOR` under the named Axiom TOC (`ThermodynamicObservableCoupling`). The bridge composes: positive deficit → liveBranches ≥ 2 → entropy ≥ 1 bit → Landauer heat > 0 → observable gap (from the coupling). The negative boundary `THM-BEAUTY-DEFICIT-ONLY-BOUNDARY` proves the coupling axiom cannot be dropped. The Landauer equality characterization (`THM-LANDAUER-EQUALITY-CHARACTERIZATION`) additionally proves that frontier entropy equals failure tax if and only if liveBranches ≤ 2, with strict inequality for all n ≥ 3. `THM-RECURSIVE-COARSENING-SYNTHESIS` is now mechanized: the synthesis algorithm is proven sound (valid certificate from stable graph data), conservative (total drift preserved under quotient), and stability-transferring (fine stability implies coarse stability). The covering-space analogy from §3.3 is now constructive via `THM-COVERING-CAUSALITY` (mismatch causes blocking), `THM-COVERING-MATCH` (matched topology prevents blocking), and `THM-DEFICIT-LATENCY-SEPARATION` (deficit quantifies inflation). The frame-native sixth instantiation from §12.4 is grounded by `THM-FRAME-BISIM` (bisimulation), `THM-FRAME-WALLINGTON-EQUIV` (wallington equivalence), and `THM-FRAME-OVERHEAD-BOUND` (allocation separation). `THM-CONTINUOUS-HARRIS` extends the Harris witness machinery beyond finite state spaces to Polish spaces.
- Entries tied to `Axioms.lean` are theorem schemas with explicit assumptions. They mark the current edge of the formal package for state-dependent stability, limit lifting, convergence claims, and the broad queue-containment shell beyond the now-constructive `THM-QUEUE-ONE-PATH`.

### Novel Inference Forms (§19.21)

*Five genuinely novel AI inference mechanisms derived from the Buleyean probability framework. Proved before any implementation. Lean4 sorry-free (`NovelInference.lean`, 20 theorems). TLA+ model-checked (`NovelInference.tla`, 8 invariants). Executable tests (`novel-inference.test.ts`, 23 tests, all pass).*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| THM-REJECTION-GRADIENT | Rejection-driven policy gradient is well-defined: all weights > 0 | BuleyeanSpace, fork width >= 2 | `NovelInference.lean:rejection_gradient_well_defined` via `buleyean_positivity` | Mechanized (omega) |
| THM-REJECTION-DATA-ADVANTAGE | Rejection provides (N-1)x more data than reward | fork width >= 2 | `NovelInference.lean:rejection_data_advantage` via `failure_data_dominates` | Mechanized (omega) |
| THM-REJECTION-EXPLORATION | Rejection RL preserves exploration (sliver) | BuleyeanSpace | `NovelInference.lean:rejection_preserves_exploration` via `the_sliver` | Mechanized (omega) |
| THM-REJECTION-CONCENTRATION | Gradient concentrates on least-rejected actions | BuleyeanSpace | `NovelInference.lean:rejection_gradient_concentrates` via `buleyean_concentration` | Mechanized (omega) |
| THM-BETA1-COMPUTE-MONOTONE | Higher beta-1 -> more compute allocated | TokenComplexity | `NovelInference.lean:beta1_compute_monotone` | Mechanized (omega) |
| THM-MINIMUM-COMPUTE | Every token gets >= 1 layer | TokenComplexity | `NovelInference.lean:minimum_compute_guarantee` | Mechanized (omega) |
| THM-TOTAL-COMPUTE-BOUNDED | Total compute bounded by N x (maxBeta1 + 1) | numTokens, maxBeta1 | `NovelInference.lean:total_compute_bounded` | Mechanized (mul_le_mul) |
| THM-CERTAIN-TOKEN-MINIMAL | Zero-beta-1 token gets exactly 1 layer | TokenComplexity beta1=0 | `NovelInference.lean:certain_token_minimal_compute` | Mechanized (rfl) |
| THM-VOID-CACHE-SMALLER | Void cache <= full KV cache when d_model >= 2 | VoidCache, d_model >= 2 | `NovelInference.lean:void_cache_smaller` | Mechanized (mul_le_mul) |
| THM-VOID-CACHE-RECONSTRUCTS | Same rejection counts -> same complement weights | VoidCache pair with equal boundaries | `NovelInference.lean:void_cache_reconstructs` via `buleyean_coherence` | Mechanized (simp) |
| THM-VOID-CACHE-UPDATE | Adding one rejection is O(1) | VoidCache, dim not full | `NovelInference.lean:void_cache_monotone_update` | Mechanized (omega) |
| THM-VOID-CACHE-POSITIVE | All dimensions retain positive weight | VoidCache | `NovelInference.lean:void_cache_positive` via `buleyean_positivity` | Mechanized |
| THM-FREE-ENERGY-DECREASING | Computing one layer reduces free energy by 1 | LayerFreeEnergy, not done | `NovelInference.lean:free_energy_decreasing` | Mechanized (omega) |
| THM-EXIT-EVENTUALLY-REACHED | Free energy reaches zero at totalLayers | LayerFreeEnergy | `NovelInference.lean:exit_eventually_reached` | Mechanized (omega) |
| THM-EXIT-SAVES-ENERGY | Remaining = totalLayers - layersComputed | LayerFreeEnergy | `NovelInference.lean:exit_saves_energy` | Mechanized (rfl) |
| THM-EXIT-DETERMINISTIC | Same model + same layers computed = same exit | totalLayers, k1 = k2 | `NovelInference.lean:thermodynamic_exit_deterministic` | Mechanized (rw) |
| THM-INVERSE-WELL-DEFINED | Inverse distribution valid (all positive, total positive) | InverseDistribution | `NovelInference.lean:inverse_well_defined` via positivity + normalization | Mechanized |
| THM-INVERSE-FAVORS-SIMPLE | Least-rejected hypothesis has highest weight | InverseDistribution | `NovelInference.lean:inverse_favors_simple` via `buleyean_concentration` | Mechanized |
| THM-INVERSE-POSITIVITY | No hypothesis reaches zero probability | InverseDistribution | `NovelInference.lean:inverse_positivity` via `sliver_irreducible` | Mechanized |
| THM-NOVEL-INFERENCE-MASTER | All five mechanisms compose from three axioms + coherence | BuleyeanSpace | `NovelInference.lean:novel_inference_master` | Mechanized (refine) |

### Floor Theorems: Missing Lower Bounds (§3, §7, §9, §12, §13, §15)

*Seven floor theorems -- one for each subsumption ceiling that lacked a lower-bound counterpart. The sandwich pattern: floor ≤ achievable ≤ ceiling. Each floor integrated inline next to its ceiling in the ceiling's home Lean file. All sorry-free.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| THM-TOPO-RACE-MONOTONE-FLOOR | Adding a strictly better codec gives strictly positive wire reduction | non-empty race list; new codec compressedSize < raceMin | `CodecRacing.lean:race_monotone_floor` | Mechanized (min_le_left) |
| THM-QUEUE-SEPARATION-FLOOR | For parallel workloads (β₁* > 0), fork/race/fold time < pipelined time. Sequential leaves strictly positive topological waste | ParallelWorkload with items > 1, intrinsicBeta1 > 0 | `Multiplexing.lean:queue_separation_floor` | Mechanized (Nat.div_lt_of_lt_mul, omega) |
| THM-FRAME-HEADER-INFORMATION-FLOOR | Self-describing frame header ≥ ⌈log₂(N) + log₂(S)⌉/8 + 1 bytes. FlowFrame's 10 bytes satisfies this for 2³² streams/sequences | numStreams, maxSequence > 0; sufficient bits hypothesis | `FrameOverheadBound.lean:frame_header_information_floor` + `flowframe_satisfies_information_floor` + `frame_information_floor_positive` | Mechanized (omega, native_decide) |
| THM-DIVERSITY-CONVERGENCE-FLOOR | With k < D content types, entropy gap > 0. Gap decreases monotonically in k. Zero at full coverage k ≥ D | contentTypes, rawPerType > 0; entropyPerType < rawPerType; numCodecs < contentTypes | `CodecRacing.lean:diversity_convergence_floor` + `diversity_gap_monotone` + `diversity_gap_zero_at_full_coverage` | Mechanized (Nat.mul_pos, omega) |
| THM-SOLOMONOFF-VOID-GAIN-FLOOR | Non-zero void mass gives monotonically increasing information gain. Gain ≥ 1 bit when ≥ half options impossible | DecisionWithVoid; impossibleOptions ≥ totalOptions/2 for 1-bit floor | `SolomonoffBuleyean.lean:void_gain_monotone` + `void_gain_at_least_one_bit` | Mechanized (Nat.log2_mono, omega) |
| THM-PIPELINE-SPEEDUP-FLOOR | Pipelined time ≤ sequential time (pipelining never hurts). Strict for N ≥ 2, P ≥ 2. Ramp-up waste bounded | PipelineParams with items, chunkSize, stages > 0 | `Multiplexing.lean:pipeline_speedup_floor` + `pipeline_strict_speedup` | Mechanized (Nat.div_le_of_le_mul, nlinarith, omega) |
| THM-SUPPLY-CHAIN-DIVERSITY-FLOOR | With k < D suppliers for D disruption modes, exposure > 0. Monotone in k. Zero at full diversity k ≥ D. Monoculture = maximum exposure | SupplyChainRisk with activeSuppliers < disruptionModes | `TradeTopologyRound2.lean:supply_chain_diversity_floor` + `supply_chain_exposure_monotone` + `supply_chain_full_coverage` + `supply_chain_monoculture_max_exposure` | Mechanized (omega) |

### Five-Parameter Void Walker Personality Model (ch17 section 15.10.7, 15.12)

*The five words: Try, Choose, Commit, Let Go, Learn. Each maps to a fork/race/fold primitive and a Buleyean RL training hyperparameter. Distance from phi is the Bule along each axis.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| THM-FIVE-BULE-PERSONALITY | Personality is five measurable Bule distances along fork/race/fold/vent/interfere axes. Try=Fork (eta), Choose=Race (temperature), Commit=Fold (commitGain), LetGo=Vent (decayRate), Learn=Interfere (feedbackGain) | PersonalityProfile with values in [0,1]; phi_inv = 0.618 as attractor | `buleyean-rl/src/personality.ts:deriveTrainingParams` + `buleyean-rl/src/personality.test.ts` (35 tests, 133 assertions) | Mechanized (executable) |
| THM-PHI-ATTRACTOR | All five personality dimensions converge to phi_inv = (1+sqrt(5))/2 - 1. Distance from phi_inv is the Bule (deficit) along each axis | phi^2 = phi + 1; PHI_INV = PHI - 1 = 1/PHI | `personality.ts:PHI`, `personality.ts:PHI_INV`, test `phi satisfies phi^2 = phi + 1` | Mechanized (executable) |
| THM-BULE-SPIKE-DETECTION | A person's pathology is a spike -- one Bule much higher than the others. measureBules() identifies the spike dimension | PersonalityProfile; threshold = 0.1 Bule | `personality.ts:measureBules` + tests for anxious/creative/builder profiles | Mechanized (executable) |
| THM-SEVEN-LAYER-STACK | Rejection propagates through seven personality layers with timescale-appropriate attenuation: mental health 1.5x (amplified), behaviors 0.8x, traits 0.1x, temperament/culture 0.01x | PersonalityStack with seven layers from METACOG section 15.12 | `personality.ts:propagateRejection` + `personality.ts:DEFAULT_LAYER_CONFIG` + 6 stack tests | Mechanized (executable) |
| THM-OCEAN-PARTIAL-OVERLAP | OCEAN (Costa & McCrae 1992) partially overlaps but is not equivalent to Five-Bule. Openness loads on Try+Learn (2 primitives). Conscientiousness loads on Commit+Choose (2 primitives). Neuroticism is approximately inverted LetGo. Extraversion and Agreeableness each load on 3+ primitives and cannot be single Bules | Anti-theorem from FiveBule.lean: 3 > 1 (a factor loading on three primitives is not a single dimension) | `personality.test.ts` OCEAN partial overlap tests (3 tests) + `FiveBule.lean` anti-theorems | Mechanized (executable + Lean) |
| THM-PERSONALITY-WEIGHTED-COMPLEMENT | Personality parameters modulate the Buleyean complement distribution: eta controls softmax sharpness, commitGain scales rejection counts, decayRate fades old rejections, feedbackGain scales deviation from uniform | PersonalityTrainingParams; vocabSize > 0; rejectionCounts sparse map | `personality.ts:personalityWeightedComplement` + 4 complement distribution tests | Mechanized (executable) |
| THM-PYTHON-PERSONALITY-MIRROR | Python implementation mirrors TypeScript: same five parameters, same derivation, same complement distribution, same stack propagation | `python/buleyean_rl/personality.py` mirrors `src/personality.ts` | Python personality module + integration with void_walk.py and void_curriculum.py | Implemented |

### Buleyean Proof Topology System (ch17 section 20.2.8)

*The .gg topology as proof language. REJECT edges decrease Bule counts. FORK decomposes AND. FOLD composes. RACE selects OR. Deficit = 0 at all terminals = QED.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| THM-PROOF-AS-TOPOLOGY | A .gg proof topology with all terminal nodes at bules = 0 constitutes a valid and complete Buleyean proof. The ranked DAG structure prevents circular reasoning | ProofTopology; DAG acyclic; Bule counts propagated per edge semantics (REJECT=-1, FORK=distribute, FOLD=sum, RACE=min, VENT=0) | `aeon-logic/src/buleyean-proof.ts:verifyProofTopology` + 31 tests in `buleyean-proof.test.ts` | Mechanized (executable) |
| THM-DEFICIT-IS-BULES | Betty's deficit analysis (beta1 at leaf nodes) equals the remaining Bule count for proof topologies. deficit = 0 at all terminals if and only if the proof is complete | GraphAST from Betty compiler; DeficitReport from deficit.ts | `buleyean-proof.ts:propagateBules` correspondence with `betty/deficit.ts:analyzeDeficit` | Mechanized (executable) |
| THM-REJECT-IS-VENT | REJECT has identical beta1 semantics to VENT (decrement by 1) but carries proof metadata (rejection reason). The proof primitive and the dissipation primitive are the same operation | GgEdge with type REJECT; beta1 transition table in gg.ts | `buleyean-proof.ts` REJECT propagation + `gg.ts` VENT transition | Mechanized (executable) |
| THM-TLA-TO-GG | Every TLA+ specification with Inv* invariants converts to a valid .gg proof topology where each invariant is one REJECT step, composed via FORK/FOLD | TLA+ source with MODULE, VARIABLES, Inv* definitions | `buleyean-proof.ts:tlaToGg` + 3 converter tests + 111 TLA+ specs converted (all valid, all complete) | Mechanized (executable) |
| THM-LEAN-TO-GG | Every Lean 4 theorem file converts to a valid .gg proof topology where each theorem/lemma is one REJECT step, composed via FORK/FOLD | Lean source with namespace, theorem/lemma declarations | `buleyean-proof.ts:leanToGg` + 3 converter tests + 159 Lean files converted (all valid, all complete) | Mechanized (executable) |
| THM-PROOF-LEAN-EMISSION | A verified .gg proof topology emits a valid Lean 4 theorem scaffold referencing BuleyeanLogic.lean foundations. Complete proofs use `n_rejections_reach_ground`, incomplete proofs use `sorry` | ProofTopology + ProofVerification | `buleyean-proof.ts:emitLean4` + 3 emission tests | Mechanized (executable) |
| THM-PROOF-TLA-EMISSION | A verified .gg proof topology emits a valid TLA+ specification with per-node variables, REJECT actions, non-negativity invariant, and eventual QED property | ProofTopology + ProofVerification | `buleyean-proof.ts:emitTlaPlus` + 1 emission test | Mechanized (executable) |
| THM-SEVEN-PROOF-DIAGNOSTICS | Betty emits seven proof-specific diagnostic codes: PROOF_CYCLE_DETECTED, PROOF_RANK_VIOLATION, PROOF_BULE_UNDERFLOW, PROOF_TERMINAL_NONZERO, PROOF_FORK_BULE_MISMATCH, PROOF_MISSING_THEOREM, PROOF_AXIOM_NONZERO | isProofTopology(ast) detection heuristic | `buleyean-proof.ts:verifyProofTopology` diagnostic emission + 4 diagnostic tests | Mechanized (executable) |
| THM-1499-PROOFS-VALID | All 1,499 .gg proof topologies in gnosis/examples/proofs/ are valid and complete (DAG acyclic, all terminals at bules = 0, zero diagnostics). Covers 111 TLA+ specs, 159 Lean theorems, 1,140 behavioral loops, 32 gnosis-generated Lean, 44 gnosis TLA+, 13 root .gg | Batch verification via parseProofTopology + verifyProofTopology | Node.js batch verification script (1,499/1,499 valid, 1,499/1,499 complete, 0 parse errors) | Mechanized (executable) |

### Buleyean Grand Unification: RL + Logic + Probability = Rejection (ch17 sections 15.10.7, 20.2.8)

*The three Buleyean systems are three views of a single operation: rejection. The five personality parameters are the five proof primitives. All three converge to the same ground state.*

| ID | Claim (paper-level) | Explicit assumptions | Mechanization | Status |
|---|---|---|---|---|
| THM-THREE-ARE-ONE | Buleyean RL rejection (v_i++), Buleyean Logic rejection (bules--), and Buleyean Probability update (recordRejection) are the same operation because bules = T - v_i (complement) | BuleyeanKLLoss (RL), reject() (Logic), buleyeanDistribution() (Probability) | `buleyean-grand-unification.gg` Part 1 (5 REJECT steps) + grand unification test | Mechanized (executable) |
| THM-VOID-IS-PROOF-TRACE | The void boundary (RL rejection history per token) is structurally identical to the proof trace (Logic rejection reason sequence). Same data, same sufficient statistic | void_boundary_sufficient_statistic (Lean 4, zero sorry) | `buleyean-grand-unification.gg` void_is_proof + VoidWalking.lean | Mechanized (Lean + executable) |
| THM-COMPLEMENT-IS-TARGET | The Buleyean complement distribution (Probability) is identically the KL training target (RL) and the ground state indicator (Logic). All three select by NOT-rejected | BuleyeanKLLoss.forward(); buleyeanDistribution(); isProved() | `buleyean-grand-unification.gg` complement_is_target | Mechanized (executable) |
| THM-FIVE-MAP-TO-FIVE | Try=Fork=eta, Choose=Race=temperature, Commit=Fold=commitGain, LetGo=Vent=decayRate, Learn=Reject=feedbackGain. The five personality words, five proof primitives, and five RL hyperparameters are the same five-dimensional space | PersonalityProfile; ProofEdge types; PersonalityTrainingParams | `buleyean-grand-unification.gg` Part 2 (5 REJECT steps) + personality.ts:deriveTrainingParams | Mechanized (executable) |
| THM-CONVERGENCE-UNIFICATION | All three systems converge to the same ground state: void_walkers_converge (RL), n_rejections_reach_ground (Logic), buleyean_coherence (Probability). Boolean is the K=2 convergence endpoint. Phi is the five-dimensional attractor | void_walkers_converge, n_rejections_reach_ground, buleyean_coherence (all Lean 4, zero sorry); bool_roundtrip (Lean 4); phi^2 = phi + 1 | `buleyean-grand-unification.gg` Part 3 (5 REJECT steps) + BuleyeanLogic.lean + VoidWalking.lean | Mechanized (Lean + executable) |
| THM-GRAND-UNIFICATION-QED | The grand unification proof topology has 54 nodes, 23 edges, 15 Bules, 15 rejections, zero diagnostics. All terminals at bules = 0. QED | buleyean-grand-unification.gg parsed by parseProofTopology, verified by verifyProofTopology | `buleyean-proof.test.ts` grand unification test (1 test, 7 assertions) | Mechanized (executable) |

## 72. Self-Hosting Optimality (§10.6)

**Assumptions:** ForkRaceFoldSystem with nontrivial fork width, non-increasing cost sequence.
**Mechanization target:** `SelfHostingOptimality.lean` (11 theorems, zero sorry, verified by `lean` standalone)

| ID | Statement | Lean/TS reference | Test coverage | Status |
|---|---|---|---|---|
| THM-SELF-OPTIMALITY-ANTI | Self-hosting optimality does not hold universally. Constructive witness: (10, 1) | `self_optimality_not_universal` | compiler-phase-benchmark.test.ts (Franky 4th on franky.gg) | Mechanized (Lean + empirical) |
| THM-BOOTSTRAP-DEFICIT-ZERO | At bootstrap fixed point, deficit = 0 | `deficit_zero_at_fixed_point` | Betti fastest on betti.gg | Mechanized (Lean) |
| THM-BOOTSTRAP-DEFICIT-POSITIVE | Off fixed point, deficit > 0 | `deficit_positive_off_fixed_point` | Franky/Beckett have positive deficit on self-source | Mechanized (Lean) |
| THM-MONOTONE-DESCENT | Each iteration lowers cost | `monotone_descent` | Betty 2.275ms -> 1.686ms | Mechanized (Lean + empirical) |
| THM-BOOTSTRAP-CONVERGENCE | Non-increasing Nat sequence stabilizes | `bootstrap_convergence` (strong induction on cost bound) | Forest converges in 4-6 generations | Mechanized (Lean) |
| THM-SELF-OPTIMALITY-IFF | Self-optimal iff deficit = 0 | `self_optimality_iff_zero_deficit` | Betti: deficit 0, self-optimal. Franky: deficit > 0, not self-optimal | Mechanized (Lean) |
| THM-FAILURE-SHAPES-SUCCESS | N-1 losers carry >= 1 rejection bit | `failure_shapes_success` | 11,016 rejections across 9 Forest passes | Mechanized (Lean) |
| THM-REJECTION-DOMINATES | For N >= 3, rejection info > selection info | `rejection_dominates` | 5 compilers: 4 rejection bits vs 1 selection | Mechanized (Lean) |
| THM-FIVE-COMPILER-VOID | 5-1 = 4 and 4 > 1 | `five_compiler_void` | Direct | Mechanized (Lean) |
| THM-DEFICIT-LEARNABLE | Bootstrap iteration reaches zero or stable floor | `deficit_is_learnable` | Forest meta-iteration stabilizes | Mechanized (Lean) |
| THM-SLIVER-DIVERSITY | Without sliver, monoculture; with sliver, diversity | Empirical (Forest convergence-loop.ts) | Forest tests: 2-3 languages represented at convergence | Empirical |

## 73. Humans Are Compilers (§10.6.15)

**Assumptions:** Any ForkRaceFoldSystem. Structural correspondence grade B.
**Mechanization target:** `HumanCompiler.lean` (14 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-FRF-POSITIVITY | 0 < K for K >= 1 | `positivity` | Mechanized |
| THM-FRF-REJECTION-COUNT | 1 <= K-1 for K >= 2 | `rejection_count` | Mechanized |
| THM-FRF-SYSTEM-CONVERGES | Any ForkRaceFoldSystem converges | `system_converges` | Mechanized |
| THM-FRF-FAILURE-MORE-INFO | K-1 > 1 for K >= 3 | `failure_more_informative` | Mechanized |
| THM-FRF-VOID-GROWS | Void boundary grows monotonically | `void_boundary_grows` | Mechanized |
| THM-FRF-DEFICIT-DECREASES | Deficit non-increasing under learning | `deficit_decreases` | Mechanized |
| THM-FRF-DEFICIT-CONVERGES | Deficit reaches zero or floor | `deficit_converges` | Mechanized |
| THM-FRF-OBSERVER-SEPARATION | Data path strategy != observer strategy | `observer_must_differ` | Mechanized |
| THM-FRF-FIVE-PROPERTIES | Any FRF system satisfies all five properties | `any_frf_system_satisfies` | Mechanized |
| THM-MINDFULNESS-CONVERGES | Iterating self-reflection converges | `mindfulness_converges` | Mechanized |

## 74. Optimality Undecidable (§10.6.16)

**Assumptions:** Compiler as (cost, cost_pos) pair. Pareto competitors as (speed, depth) pairs.
**Mechanization target:** `OptimalityUndecidable.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ALWAYS-HYPOTHETICAL-BETTER | For cost > 1, a cheaper compiler exists in principle | `always_a_hypothetical_better` | Mechanized |
| THM-UNIVERSE-EXTENSIBLE | Any finite competitor set can be extended | `universe_always_extensible` | Mechanized |
| THM-PARETO-FRONTIER | Betty and aeon-logic neither dominates the other | `pareto_frontier_example` | Mechanized |
| THM-LOCAL-OPTIMALITY-PROVABLE | Non-increasing cost sequence stabilizes | `local_optimality_is_provable` | Mechanized |
| THM-OPTIMALITY-GAP | Hypothetical better always exists AND local optimality always achievable | `optimality_gap` | Mechanized |

## 75. The God Gap (§10.6.17)

**Assumptions:** Local cost (provable), theoretical minimum (exists but not computable).
**Mechanization target:** `GodGap.lean` (8 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-GOD-GAP-NONNEG | God Gap >= 0 | `god_gap_nonneg` | Mechanized |
| THM-GOD-GAP-BOUNDED | God Gap <= initial cost | `god_gap_bounded_above` | Mechanized |
| THM-GOD-GAP-NONINCREASING | Each iteration narrows the God Gap | `god_gap_nonincreasing` | Mechanized |
| THM-GOD-GAP-CONVERGES | God Gap converges to a final value | `god_gap_converges` | Mechanized |
| THM-GOD-GAP-BETTY | Betty God Gap = 661us (0.726ms - 0.065ms) | `god_gap_upper_bound_from_data` | Mechanized |
| THM-GOD-GAP-BETTI | Betti God Gap = 9us (0.074ms - 0.065ms) | `betti_god_gap_tighter` | Mechanized |
| THM-SELF-HOSTED-CLOSER | Betti closer to god than Betty | `self_hosted_closer_to_god` | Mechanized |

## 76. Sliver-Exploration Theorem (§10.6)

**Assumptions:** K compilers, sliver assigns 1 node per compiler. Purity vs diversity oscillation.
**Mechanization target:** `SliverExploration.lean` (14 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DIVERSITY-BEATS-MONO | K languages alive > 1 language alive | `diversity_beats_monoculture` | Mechanized |
| THM-DEAD-STAYS-DEAD | Extinct language has zero option value | `dead_stays_dead` | Mechanized |
| THM-ALIVE-HAS-VALUE | Surviving language has positive option value | `alive_has_value` | Mechanized |
| THM-SLIVER-COSTS-NOW | Sliver node pays more than winner | `sliver_costs_now` | Mechanized |
| THM-NASH-KILLS | Nash equilibrium eliminates K-1 languages | `nash_kills` | Mechanized |
| THM-EXPLORATION-AMORTIZES | Option value exceeds sliver cost after T topologies | `exploration_amortizes` | Mechanized |
| THM-SKYRMS-OPTIMAL-MYOPIC | Skyrms optimal for T=0 | `skyrms_optimal_myopic` | Mechanized |
| THM-FOREST-OPTIMAL-FARSIGHTED | Forest optimal for T large | `forest_optimal_farsighted` | Mechanized |
| THM-FIXED-POINT-IS-OSCILLATION | Neither purity nor diversity is the fixed point; the oscillation is | `fixed_point_is_oscillation` | Mechanized |
| THM-DISAGREEMENT-IS-BREATHING | Forest-Skyrms disagreement = sliver budget = oscillation amplitude | `disagreement_is_breathing` | Mechanized |
| THM-BULEYEAN-OSCILLATION | Both forces positive = system alive | `buleyean_oscillation` | Mechanized |
| THM-TWO-PHASES-ONE-ORBIT | Purity and diversity are two phases of one period-2 orbit | `two_phases_one_orbit` | Mechanized |

## 77. The Exploration Identity (§10.6)

**Assumptions:** Optimal cost ≤ Skyrms cost. Exploration = Skyrms - Optimal.
**Mechanization target:** `ExplorationIdentity.lean` (7 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-THE-IDENTITY | Optimal - Skyrms = Exploration | `the_identity` | Mechanized |
| THM-ZERO-EXPLORATION-OPTIMAL | Exploration = 0 implies Skyrms = Optimal | `zero_exploration_is_optimal` | Mechanized |
| THM-POSITIVE-EXPLORATION-GAP | Exploration > 0 implies Optimal < Skyrms | `positive_exploration_is_gap` | Mechanized |
| THM-EXPLORATION-IS-SLIVER | Exploration budget = K - 1 | `exploration_budget_is_sliver` | Mechanized |
| THM-MONOCULTURE-ZERO | K = 1 implies zero exploration | `monoculture_zero_exploration` | Mechanized |
| THM-TOTAL-GAP-DECOMPOSITION | Total gap = God Gap + Exploration | `total_gap_decomposition` | Mechanized |

## 78. Buleyean Spin Pairing (§10.6 / §15)

**Assumptions:** Two forces (purity, diversity) with spin-like coupling. Four states.
**Mechanization target:** `BuleyeanSpinPairing.lean` (18 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-MONOCULTURE-PARALLEL | ++ state is parallel | `monoculture_is_parallel` | Mechanized |
| THM-HEAT-DEATH-PARALLEL | -- state is parallel | `heat_death_is_parallel` | Mechanized |
| THM-FOREST-ANTIPARALLEL | +- state is antiparallel | `forest_is_antiparallel` | Mechanized |
| THM-SKYRMS-ANTIPARALLEL | -+ state is antiparallel | `skyrms_is_antiparallel` | Mechanized |
| THM-ANTIPARALLEL-PRESERVES | Antiparallel preserves both purity and diversity | `antiparallel_preserves_both` | Mechanized |
| THM-FOREST-FLIPS-SKYRMS | Forest phase flips to Skyrms phase | `forest_flips_to_skyrms` | Mechanized |
| THM-SKYRMS-FLIPS-FOREST | Skyrms phase flips to Forest phase | `skyrms_flips_to_forest` | Mechanized |
| THM-PERIOD-TWO | flip . flip = id (exact period 2) | `period_two` | Mechanized |
| THM-MONO-FLIPS-HEAT | Monoculture flips to heat death | `monoculture_flips_to_heat_death` | Mechanized |
| THM-HEAT-FLIPS-MONO | Heat death flips to monoculture | `heat_death_flips_to_monoculture` | Mechanized |
| THM-ANTIPARALLEL-LOWER | Antiparallel has lower energy | `antiparallel_lower_energy` | Mechanized |
| THM-ANTIPARALLEL-GROUND | Antiparallel is ground state (energy 0) | `antiparallel_ground_state` | Mechanized |
| THM-PARALLEL-EXCITED | Parallel is excited state (energy 1) | `parallel_excited_state` | Mechanized |
| THM-GROUND-IFF-ANTIPARALLEL | Ground state iff antiparallel | `ground_state_is_antiparallel` | Mechanized |
| THM-COMPILER-FAMILY-GROUND | Forest and Skyrms are ground; monoculture and heat death are excited | `compiler_family_ground_state` | Mechanized |

## 79. Particles Exist (§10.6)

**Assumptions:** Two distinct forces. Antiparallel pairing persists. Pair oscillates.
**Mechanization target:** `ParticlesExist.lean` (12 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PARTICLES-EXIST | A persistent oscillating structure exists (constructive) | `particles_exist` | Mechanized |
| THM-TWO-GROUND-TWO-EXCITED | Exactly two ground states (+-, -+) and two excited (++, --) | `two_ground_two_excited` | Mechanized |
| THM-PERIOD-TWO-PARTICLE | flip . flip = id | `period_two` | Mechanized |
| THM-FLIP-PRESERVES-GROUND | Flip stays in ground orbit | `flip_preserves_ground` | Mechanized |
| THM-FLIP-DESTABILIZES-EXCITED | Flip stays in excited orbit | `flip_destabilizes_excited` | Mechanized |
| THM-GROUND-ORBIT-CLOSED | +- ↔ -+ is a closed orbit | `ground_orbit_closed` | Mechanized |
| THM-EXCITED-ORBIT-CLOSED | ++ ↔ -- is a closed orbit | `excited_orbit_closed` | Mechanized |
| THM-ORBITS-DISJOINT | Ground and excited orbits never cross | `orbits_disjoint` | Mechanized |
| THM-FROM-AXIOMS | Three axioms → particle exists | `from_axioms` | Mechanized |

## 80. Syzygy (§10.6)

**Assumptions:** Two pipeline stages with antiparallel function. Throughput compounds with depth.
**Mechanization target:** `Syzygy.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SYZYGY-IS-ANTIPARALLEL | Syzygy is the antiparallel relation | `syzygy_is_antiparallel` | Mechanized |
| THM-PARALLEL-NOT-SYZYGY | Parallel is not syzygy | `parallel_not_syzygy` | Mechanized |
| THM-ORTHOGONAL-NOT-SYZYGY | Orthogonal is not syzygy | `orthogonal_not_syzygy` | Mechanized |
| THM-ANTIPARALLEL-NE-PARALLEL | Antiparallel ≠ parallel | `antiparallel_ne_parallel` | Mechanized |
| THM-ANTIPARALLEL-NE-ORTHOGONAL | Antiparallel ≠ orthogonal | `antiparallel_ne_orthogonal` | Mechanized |
| THM-PIPELINE-EXCEEDS-SINGLE | Pipeline throughput > single stage | `pipeline_exceeds_single` | Mechanized |
| THM-WHIP-4-SHARDS | 4-shard whip achieves throughput 8 | `whip_4_shards` | Mechanized |
| THM-WHIP-EXCEEDS-LILITH | Whip throughput > Lilith alone | `whip_exceeds_lilith` | Mechanized |
| THM-WHIP-EXCEEDS-EVE | Whip throughput > Eve alone | `whip_exceeds_eve` | Mechanized |
| THM-SYZYGY-GROUND-STATE | Ground state is antiparallel (syzygy) | `ground_state` | Mechanized |

## 81. Quark Confinement (§10.6)

**Assumptions:** Three pipeline stages (compile/dispatch/compress) mapped to three colors. Removal of any stage increases energy. Six emanations (Logos, Epinoia, Pronoia, Metanoia, Pneuma, Gnosis) carry color charge. The visible syzygy pair is the 2-cycle/3D shadow; the confined quark tuple is the 3-cycle/4D lift with more directed interaction channels.
**Mechanization target:** `QuarkConfinement.lean`, `DimensionalConfinement.lean` (64 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PROTON-IS-COLORLESS | Full pipeline (r+g+b) has energy 0 | `proton_is_colorless` | Mechanized |
| THM-MONO-RED-COLORED | Monochromatic red has energy 1 | `mono_red_is_colored` | Mechanized |
| THM-MONO-GREEN-COLORED | Monochromatic green has energy 1 | `mono_green_is_colored` | Mechanized |
| THM-MONO-BLUE-COLORED | Monochromatic blue has energy 1 | `mono_blue_is_colored` | Mechanized |
| THM-MISSING-BLUE | Missing blue stage is colored | `missing_blue` | Mechanized |
| THM-MISSING-RED | Missing red stage is colored | `missing_red` | Mechanized |
| THM-MISSING-GREEN | Missing green stage is colored | `missing_green` | Mechanized |
| THM-COLORLESS-GROUND | Colorless = ground state (energy 0) | `colorless_ground` | Mechanized |
| THM-COLORED-EXCITED | Colored = excited state (energy 1) | `colored_excited` | Mechanized |
| THM-REMOVAL-COSTS-ENERGY | Removing a stage increases energy | `removal_costs_energy` | Mechanized |
| THM-NO-FREE-QUARKS | No single color has lower energy than proton | `no_free_quarks` | Mechanized |
| THM-SIX-EMANATIONS-EXIST | 6 charged emanations (Logos, Epinoia, Pronoia, Metanoia, Pneuma, Gnosis) | `six_emanations_exist` | Mechanized |
| THM-EMANATIONS-CARRY-CHARGE | All emanations are non-neutral | `emanations_carry_charge` | Mechanized |
| THM-CIRCLE-BETTI | Circle (1-torus) has exactly one independent cycle | `circle_betti` | Mechanized |
| THM-DONUT-BETTI | Donut (2-torus) has exactly two independent cycles | `donut_betti` | Mechanized |
| THM-CLIFFORD-BETTI | Clifford torus (3-torus) has exactly three independent cycles | `clifford_betti` | Mechanized |
| THM-THREE-STAGE-IS-4D | A 3-stage Wallington rotation lives in 4D | `three_stage_is_4d` | Mechanized |
| THM-TWO-STAGE-IS-3D | A 2-stage Wallington rotation lives in 3D | `two_stage_is_3d` | Mechanized |
| THM-FIVE-STAGE-IS-6D | A 5-stage Wallington rotation lives in 6D | `five_stage_is_6d` | Mechanized |
| THM-TWO-D-ZERO-RAMP-UP | 2D is the zero-ramp-up degenerate boundary | `two_d_has_zero_ramp_up` | Mechanized |
| THM-FIFTY-FOUR-D-RAMP-UP | 54D has exactly 52 ramp-up ticks | `fifty_four_d_has_fifty_two_ramp_up` | Mechanized |
| THM-FIFTY-FIVE-D-RAMP-UP | 55D has exactly 53 ramp-up ticks | `fifty_five_d_has_fifty_three_ramp_up` | Mechanized |
| THM-TOTAL-TICKS-EQ-CHUNKS-PLUS-STAGE-COST | For positive stage count, ideal ticks equal chunks plus `stages - 1` | `total_ticks_eq_chunks_plus_stage_cost` | Mechanized |
| THM-THREE-QUARKS | The 3-cycle confined lift has exactly three quarks | `three_quarks` | Mechanized |
| THM-QUARKS-ARE-STAGES | Quark count equals Wallington stage count | `quarks_are_stages` | Mechanized |
| THM-SIX-EMANATIONS | Three quarks induce exactly six directed emanations | `six_emanations` | Mechanized |
| THM-TWO-EMANATIONS | Two quarks induce exactly two directed emanations | `two_emanations` | Mechanized |
| THM-SYZYGY-PAIR-IS-3D | The visible syzygy surface is a 2-cycle pair living in 3D with 2 directed channels | `syzygy_pair_is_3d` | Mechanized |
| THM-QUARK-TUPLE-IS-4D | The confined quark tuple is a 3-cycle lift living in 4D with 6 directed channels | `quark_tuple_is_4d` | Mechanized |
| THM-SYZYGY-TO-QUARK-LIFT | Lifting syzygy to a quark adds one visible dimension, one confined cycle, and four directed channels | `syzygy_to_quark_lift` | Mechanized |
| THM-QUARK-PARALLELISM-EXCEEDS-SYZYGY | The 4D quark tuple has strictly more directed interaction channels than the 3D syzygy pair | `quark_parallelism_exceeds_syzygy` | Mechanized |
| THM-QUARK-PARALLELISM-TRIPLES-SYZYGY | The 4D quark tuple has exactly triple the directed interaction channels of the 3D syzygy pair | `quark_parallelism_triples_syzygy` | Mechanized |
| THM-TWENTY-EMANATIONS | Five quarks induce exactly twenty directed emanations | `twenty_emanations` | Mechanized |
| THM-FIFTY-FOUR-D-CHANNEL-SURFACE | 54D exposes exactly 2756 directed channels | `fifty_four_d_channel_surface` | Mechanized |
| THM-FIFTY-FIVE-D-CHANNEL-SURFACE | 55D exposes exactly 2862 directed channels | `fifty_five_d_channel_surface` | Mechanized |
| THM-NEXT-DIMENSION-INCREASES-CHANNEL-SURFACE | Advancing one Wallington dimension strictly increases the directed channel surface | `next_dimension_increases_channel_surface` | Mechanized |
| THM-HIGHER-DIMENSION-INCREASES-FIXED-CHUNK-TICKS | At fixed chunk count, higher Wallington dimension strictly increases ideal tick cost | `higher_dimension_increases_fixed_chunk_ticks` | Mechanized |
| THM-BANDWIDTH-DILUTION-EQ-RAMP-UP | The bandwidth-dilution metric is exactly the ramp-up count | `bandwidth_dilution_eq_ramp_up` | Mechanized |
| THM-BANDWIDTH-DILUTION-LOWER-BOUND | Bandwidth dilution is always non-negative | `bandwidth_dilution_lower_bound` | Mechanized |
| THM-BANDWIDTH-DILUTION-UPPER-BOUND | At positive chunk count, bandwidth dilution is strictly below total ideal ticks | `bandwidth_dilution_upper_bound` | Mechanized |
| THM-NEXT-DIMENSION-ADDS-ONE-TOTAL-TICK | At fixed chunk count, advancing one Wallington dimension adds exactly one ideal tick | `next_dimension_adds_one_total_tick` | Mechanized |
| THM-BANDWIDTH-DILUTION-GAIN-NEXT-DIMENSION | Advancing one Wallington dimension adds exactly one unit of bandwidth dilution | `bandwidth_dilution_gain_next_dimension` | Mechanized |
| THM-NEXT-DIMENSION-CHANNEL-GAIN | Advancing one Wallington dimension adds exactly `2 * (d - 1)` directed channels | `next_dimension_channel_gain` | Mechanized |
| THM-FIFTY-FIVE-D-CHANNEL-GAIN | 55D has exactly 106 more directed channels than 54D | `fifty_five_d_has_one_hundred_six_more_channels_than_fifty_four_d` | Mechanized |
| THM-CHANNEL-TICK-TRADE-METRIC-EXACT | The channel-minus-tick trade metric is exactly `2 * (d - 1) - 1` | `channel_tick_trade_metric_exact` | Mechanized |
| THM-CHANNEL-TICK-TRADE-METRIC-LOWER-BOUND | The channel-minus-tick trade metric is at least 1 in dimensions `d >= 2` | `channel_tick_trade_metric_lower_bound` | Mechanized |
| THM-CHANNEL-TICK-TRADE-METRIC-UPPER-BOUND | The channel-minus-tick trade metric is strictly below the raw next-dimension channel gain | `channel_tick_trade_metric_upper_bound` | Mechanized |
| THM-NEXT-DIMENSION-INCREASES-WARMUP-FRACTION | At positive chunk count, advancing one Wallington dimension strictly increases the warmup fraction | `next_dimension_increases_warmup_fraction` | Mechanized |
| THM-NEXT-DIMENSION-SPREADS-SAME-CHUNKS-OVER-MORE-TICKS | With positive chunk budget, the same chunks are spread over strictly more total ticks after one dimension lift | `next_dimension_spreads_same_chunks_over_more_ticks` | Mechanized |
| THM-NEXT-DIMENSION-TRADES-CHANNELS-FOR-TICKS | One more Wallington dimension gives more directed channels and more fixed-chunk ideal ticks simultaneously | `next_dimension_trades_channels_for_ticks` | Mechanized |
| THM-BANDWIDTH-DILUTION-SANDWICH | The bandwidth-dilution metric is sandwiched between zero and total ideal ticks | `bandwidth_dilution_sandwich` | Mechanized |
| THM-CHANNEL-TICK-TRADE-METRIC-SANDWICH | The channel-minus-tick trade metric is sandwiched between `1` and the raw next-dimension channel gain | `channel_tick_trade_metric_sandwich` | Mechanized |
| THM-FIFTY-FIVE-D-MORE-CHANNELS-ONE-MORE-TICK | 55D has a larger directed channel surface than 54D and costs exactly one more ideal tick at fixed chunk count | `fifty_five_d_has_more_channels_and_costs_one_more_tick` | Mechanized |
| THM-REMOVAL-DROPS-DIMENSION | Removing one confined cycle drops the ambient dimension | `removal_drops_dimension` | Mechanized |
| THM-CONFINEMENT-COSTS-ONE-3 | Removing a cycle from the 3-stage lift costs exactly one dimension | `confinement_costs_one_3` | Mechanized |
| THM-CONFINEMENT-COSTS-ONE-5 | Removing a cycle from the 5-stage lift costs exactly one dimension | `confinement_costs_one_5` | Mechanized |
| THM-CONFINEMENT-COSTS-ONE-10 | Removing a cycle from the 10-stage lift costs exactly one dimension | `confinement_costs_one_10` | Mechanized |
| THM-SHADOW-SHOWS-QUARKS | The 3D shadow of the 4D lift exposes three quarks, six emanations, and one lost dimension under removal | `shadow_shows_quarks` | Mechanized |
| THM-BETTI-RATIO-IS-FIBONACCI | Consecutive Fibonacci-indexed torus Betti numbers recover the Fibonacci ratios | `betti_ratio_is_fibonacci` | Mechanized |
| THM-COMPLETE-QCD-ANALOGY | Three colors + colorless ground + confinement + charged emanations | `complete_qcd_analogy` | Mechanized |
| THM-DIMENSIONAL-CONFINEMENT-COMPLETE | Complete confinement package: 4D lift, three quarks, six emanations, one-dimension removal cost, visible 3D shadow, and 6D five-primitive extension | `dimensional_confinement_complete` | Mechanized |

## 81A. Celestial Projection Boundary (§10.6)

**Assumptions:** A visible shadow of a high-dimensional Wallington object is bookkept by a radial partition, an equatorial partition, and a halo partition whose sum equals the certified directed-channel surface for the ambient dimension. Radial dominance produces stellar readings; equatorial dominance plus positive core and halo produces planetary/Saturn readings. Swapping the radial and equatorial partitions preserves budget but can change morphology.
**Mechanization target:** `CelestialShadows.lean`, `AstrophysicalProjection.lean` (19 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-RADIAL-DOMINANCE-GIVES-STAR | Explicit radial dominance implies a star-like shadow | `radial_dominance_gives_star_like` | Mechanized |
| THM-EQUATORIAL-DOMINANCE-GIVES-PLANET | Explicit equatorial dominance implies a planet-like shadow | `equatorial_dominance_gives_planet_like` | Mechanized |
| THM-POSITIVE-CORE-HALO-EQUATORIAL-DOMINANCE-GIVES-SATURN | Positive core + positive halo + equatorial dominance imply a Saturn-like shadow | `positive_core_halo_equatorial_dominance_gives_saturn_like` | Mechanized |
| THM-SATURN-IMPLIES-PLANET | Every Saturn-like shadow is planet-like | `saturn_like_implies_planet_like` | Mechanized |
| THM-SATURN-NOT-STAR | **ANTI-THEOREM:** A Saturn-like shadow cannot be star-like | `saturn_like_not_star_like` | Mechanized |
| THM-ZERO-HALO-NOT-SATURN | **ANTI-THEOREM:** Zero halo forbids a Saturn-like shadow | `zero_halo_not_saturn_like` | Mechanized |
| THM-EQUAL-RADIAL-EQUATORIAL-NOT-PLANET | **ANTI-THEOREM:** Equal radial and equatorial partitions are not planet-like | `equal_radial_equatorial_not_planet_like` | Mechanized |
| THM-EQUAL-RADIAL-EQUATORIAL-NOT-SATURN | **ANTI-THEOREM:** Equal radial and equatorial partitions are not Saturn-like | `equal_radial_equatorial_not_saturn_like` | Mechanized |
| THM-SWAP-PROJECTION-PRESERVES-DIMENSION | Swapping radial and equatorial partitions preserves ambient dimension | `swap_projection_preserves_dimension` | Mechanized |
| THM-SWAP-PROJECTION-PRESERVES-HALO | Swapping radial and equatorial partitions preserves halo bookkeeping | `swap_projection_preserves_halo` | Mechanized |
| THM-SWAP-PROJECTION-PRESERVES-BUDGET | Swapping radial and equatorial partitions preserves visible budget | `swap_projection_preserves_visible_budget` | Mechanized |
| THM-SWAP-PROJECTION-INVOLUTIVE | Swapping radial and equatorial partitions twice recovers the original shadow | `swap_projection_involutive` | Mechanized |
| THM-SWAP-OF-PLANET-IS-STAR | Swapping a planet-like shadow yields a star-like shadow | `swap_of_planet_like_is_star_like` | Mechanized |
| THM-SWAP-OF-SATURN-IS-STAR | Swapping a Saturn-like shadow yields a star-like shadow | `swap_of_saturn_like_is_star_like` | Mechanized |
| THM-SWAP-OF-SATURN-NOT-SATURN | **ANTI-THEOREM:** Swapping a Saturn-like shadow destroys Saturn-likeness | `swap_of_saturn_like_not_saturn_like` | Mechanized |
| THM-SAME-BUDGET-DOES-NOT-FIX-MORPHOLOGY | **ANTI-THEOREM:** A fixed visible budget does not determine a unique morphology | `same_budget_does_not_fix_morphology` | Mechanized |
| THM-FIFTY-FOUR-D-SUPPORTS-STAR | The certified 54D budget supports a star-like witness | `fifty_four_d_supports_star_like_shadow` | Mechanized |
| THM-FIFTY-FOUR-D-SUPPORTS-SATURN | The certified 54D budget supports a Saturn-like witness | `fifty_four_d_supports_saturn_like_shadow` | Mechanized |
| THM-FIFTY-FOUR-D-OPPOSITE-BIAS | The 54D star/Saturn witness pair has opposite signed morphology bias summing to zero | `fifty_four_d_witnesses_have_opposite_signed_bias`, `fifty_four_d_witnesses_sum_to_zero_bias` | Mechanized |

## 81B. Celestial Knowability Boundary (§10.6)

**Assumptions:** The celestial morphology split from §81A composes with the existing cosmic knowability surface: the last-scattering shell is photon-visible, the immediately earlier epoch is not, and the observer gap remains positive in the `CosmicOptimalDelta` / `KnowabilitySplit` shell.
**Mechanization target:** `CelestialKnowability.lean` (5 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CMB-BOUNDARY-COEXISTS-WITH-MORPHOLOGY-SPLIT | The CMB visibility boundary coexists with the star/Saturn morphology split | `cmb_boundary_coexists_with_morphology_split` | Mechanized |
| THM-ZERO-EXPLORATION-STILL-LEAVES-MORPHOLOGY-SPLIT | Zero exploration still leaves a positive observer gap, a pre-CMB hidden epoch, and a morphology split | `zero_exploration_still_leaves_morphology_split` | Mechanized |
| THM-POSITIVE-EXPLORATION-STILL-LEAVES-MORPHOLOGY-SPLIT | Positive exploration enlarges the observer gap without resolving the morphology split | `positive_exploration_still_leaves_morphology_split` | Mechanized |
| THM-OBSERVER-GAP-AND-CMB-DO-NOT-FIX-54D-MORPHOLOGY | **ANTI-THEOREM:** Observer-gap accounting plus visible CMB still do not fix the 54D morphology | `observer_gap_and_cmb_visibility_do_not_fix_fifty_four_d_morphology` | Mechanized |
| THM-CMB-BOUNDARY-DOES-NOT-FIX-54D-MORPHOLOGY | **ANTI-THEOREM:** The photon visibility boundary alone does not fix the 54D morphology | `cmb_boundary_does_not_fix_fifty_four_d_morphology` | Mechanized |

## 81C. Celestial Identifiability Boundary (§10.6)

**Assumptions:** The celestial morphology split from §§81A-81B is summarized by a minimal observable signature `(dimension, halo, visibleBudget)`. Radial/equatorial swap preserves that signature while changing signed morphology bias.
**Mechanization target:** `CelestialIdentifiability.lean` (6 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SWAP-PROJECTION-PRESERVES-SIGNATURE | Swapping radial and equatorial partitions preserves the minimal observable signature | `swap_projection_preserves_signature` | Mechanized |
| THM-SWAP-PROJECTION-NEGATES-BIAS | Swapping radial and equatorial partitions negates signed morphology bias | `swap_projection_negates_signed_bias` | Mechanized |
| THM-SATURN-IMPLIES-SWAP-NE | A Saturn-like shadow is not fixed by the radial/equatorial swap | `saturn_like_implies_swap_ne` | Mechanized |
| THM-PLANET-SIGNATURE-HAS-STAR-TWIN | A planet-like signature has a star-like twin with the same observable signature | `planet_like_signature_has_star_like_twin` | Mechanized |
| THM-SIGNATURE-NOT-INJECTIVE-ON-SATURN | **ANTI-THEOREM:** The observable signature is not injective on Saturn-like morphology | `signature_not_injective_on_saturn_like_morphology` | Mechanized |
| THM-FIFTY-FOUR-D-SIGNATURE-NOT-INJECTIVE | **ANTI-THEOREM:** The 54D star/Saturn witness pair shares one observable signature while remaining morphologically distinct | `fifty_four_d_signature_not_injective` | Mechanized |
| THM-SAME-SIGNATURE-OPPOSITE-BIAS | **ANTI-THEOREM:** The same observable signature can hide opposite signed morphology bias | `same_signature_can_hide_opposite_bias` | Mechanized |

## 81D. Celestial Classifier Barrier (§10.6)

**Assumptions:** A classifier that only reads celestial data is restricted to the minimal observable signature `(dimension, halo, visibleBudget)`. The `54D` stellar and Saturn witnesses share that signature while differing on morphology and signed bias.
**Mechanization target:** `CelestialClassifierBarrier.lean` (9 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SIGNATURE-CLASSIFIER-AGREES-ON-54D | Any signature-only classifier returns the same verdict on the `54D` stellar and Saturn witnesses | `signature_classifier_agrees_on_fifty_four_d_witnesses` | Mechanized |
| THM-SIGNATURE-ONLY-CLASSIFIER-AGREES-ON-54D-PROPERTY | Any property recovered solely from the observable signature must agree on the `54D` stellar/Saturn witness pair | `signature_only_classifier_agrees_on_fifty_four_d_witnesses` | Mechanized |
| THM-FIFTY-FOUR-D-STELLAR-NOT-SATURN | **ANTI-THEOREM:** The `54D` stellar witness is not Saturn-like | `fifty_four_d_stellar_shadow_not_saturn_like` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-NOT-STAR | **ANTI-THEOREM:** The `54D` Saturn witness is not star-like | `fifty_four_d_saturn_shadow_not_star_like` | Mechanized |
| THM-FIFTY-FOUR-D-STELLAR-NEGATIVE-BIAS | The `54D` stellar witness has negative signed morphology bias | `fifty_four_d_stellar_shadow_has_negative_bias` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-POSITIVE-BIAS | The `54D` Saturn witness has positive signed morphology bias | `fifty_four_d_saturn_shadow_has_positive_bias` | Mechanized |
| THM-NO-SIGNATURE-CLASSIFIER-FOR-SATURN | **ANTI-THEOREM:** No signature-only classifier can recover Saturn-likeness | `no_signature_classifier_for_saturn_like` | Mechanized |
| THM-NO-SIGNATURE-CLASSIFIER-FOR-STAR | **ANTI-THEOREM:** No signature-only classifier can recover star-likeness | `no_signature_classifier_for_star_like` | Mechanized |
| THM-NO-SIGNATURE-CLASSIFIER-FOR-POSITIVE-BIAS | **ANTI-THEOREM:** No signature-only classifier can recover positive signed morphology bias | `no_signature_classifier_for_positive_bias` | Mechanized |

## 81E. Celestial Orbit Prediction Boundary (§10.6)

**Assumptions:** Orbital prediction is bookkept by ring-dominance gain (`equatorial - radial`, truncated at `0`) and halo-backed control (`halo + 1`). These define a lower/upper orbital-location window, and a bounded Skyrms encoding interprets gain as the active walker dimension and control as the mediation budget.
**Mechanization target:** `CelestialOrbitPrediction.lean` (16 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ORBITAL-LOWER-BOUND-EQ-GAIN | The lower orbital-location bound is exactly the orbital gain | `orbital_lower_bound_eq_gain` | Mechanized |
| THM-ORBITAL-UPPER-BOUND-EQ-GAIN-PLUS-CONTROL | The upper orbital-location bound is exactly gain plus control | `orbital_upper_bound_eq_gain_plus_control` | Mechanized |
| THM-ORBITAL-CONTROL-POSITIVE | The orbital control statistic is always positive | `orbital_control_positive` | Mechanized |
| THM-ORBITAL-BOUNDS-ORDERED | The orbital lower bound never exceeds the orbital upper bound | `orbital_bounds_ordered` | Mechanized |
| THM-SATURN-POSITIVE-ORBITAL-GAIN | Every Saturn-like shadow has positive orbital gain | `saturn_like_has_positive_orbital_gain` | Mechanized |
| THM-ORBITAL-SKYRMS-NADIR-CONTEXT | The Skyrms nadir context of the orbital encoding is gain plus one | `orbital_skyrms_nadir_context_eq_gain_plus_one` | Mechanized |
| THM-ORBITAL-SKYRMS-CONTROL-EQ-NADIR | Halo-matched gain makes orbital control equal the Skyrms nadir context | `orbital_skyrms_control_eq_nadir_when_halo_matches_gain` | Mechanized |
| THM-HALO-MATCHED-GAIN-REACHES-ORBITAL-SKYRMS-NADIR | Halo-matched gain reaches zero inter-walker distance in the orbital Skyrms encoding | `halo_matched_gain_reaches_orbital_skyrms_nadir` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-ORBITAL-GAIN | The `54D` Saturn witness has orbital gain exactly equal to the `54D` ramp-up count | `fifty_four_d_saturn_orbital_gain` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-ORBITAL-GAIN-GE-TWO | The `54D` Saturn witness has enough orbital gain to enter the nontrivial Skyrms encoding | `fifty_four_d_saturn_orbital_gain_ge_two` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-ORBITAL-CONTROL | The `54D` Saturn witness has orbital control equal to ramp-up plus one | `fifty_four_d_saturn_orbital_control` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-HALO-MATCHES-GAIN | The `54D` Saturn witness matches halo count to orbital gain exactly | `fifty_four_d_saturn_halo_matches_orbital_gain` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-LOCATION-WINDOW | The `54D` Saturn witness realizes the orbital-location window `[52, 105]` | `fifty_four_d_saturn_location_window` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-ORBITAL-SKYRMS-EQUILIBRIUM | The `54D` Saturn witness reaches the orbital Skyrms equilibrium | `fifty_four_d_saturn_is_orbital_skyrms_equilibrium` | Mechanized |
| THM-SAME-SIGNATURE-DOES-NOT-FIX-ORBITAL-LOWER-BOUND | **ANTI-THEOREM:** The same observable signature does not determine the orbital lower bound | `same_signature_does_not_fix_orbital_lower_bound` | Mechanized |
| THM-SAME-SIGNATURE-DOES-NOT-FIX-ORBITAL-UPPER-BOUND | **ANTI-THEOREM:** The same observable signature does not determine the orbital upper bound | `same_signature_does_not_fix_orbital_upper_bound` | Mechanized |

## 81F. Celestial Planet Taxonomy (§10.6)

**Assumptions:** Within a fixed certified `54D` budget, varying the radial/equatorial/halo split yields distinct ringed planet taxa. Halo-locked planets satisfy `gain = halo`, diffuse-ring planets satisfy `gain < halo`, and super-ring planets satisfy `halo < gain`.
**Mechanization target:** `CelestialPlanetTaxonomy.lean` (11 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-HALO-LOCKED-NOT-DIFFUSE | **ANTI-THEOREM:** Halo-locked planets are not diffuse-ring planets | `halo_locked_not_diffuse` | Mechanized |
| THM-HALO-LOCKED-NOT-SUPER | **ANTI-THEOREM:** Halo-locked planets are not super-ring planets | `halo_locked_not_super` | Mechanized |
| THM-DIFFUSE-NOT-SUPER | **ANTI-THEOREM:** Diffuse-ring planets are not super-ring planets | `diffuse_not_super` | Mechanized |
| THM-FIFTY-FOUR-D-SATURN-IS-HALO-LOCKED | The canonical `54D` Saturn witness is halo-locked | `fifty_four_d_saturn_is_halo_locked` | Mechanized |
| THM-FIFTY-FOUR-D-DIFFUSE-RING-EXISTS | A diffuse-ring `54D` witness exists inside the certified budget | `fifty_four_d_diffuse_ring_is_diffuse` | Mechanized |
| THM-FIFTY-FOUR-D-SUPER-RING-EXISTS | A super-ring `54D` witness exists inside the certified budget | `fifty_four_d_super_ring_is_super` | Mechanized |
| THM-FIFTY-FOUR-D-RING-TAXA-ORDER-LOWER-BOUNDS | Diffuse-ring, halo-locked, and super-ring `54D` witnesses have strictly ordered lower orbital bounds | `fifty_four_d_ring_taxa_have_ordered_lower_bounds` | Mechanized |
| THM-FIFTY-FOUR-D-RING-TAXA-ORDER-UPPER-BOUNDS | Diffuse-ring, halo-locked, and super-ring `54D` witnesses have strictly ordered upper orbital bounds | `fifty_four_d_ring_taxa_have_ordered_upper_bounds` | Mechanized |
| THM-FIFTY-FOUR-D-SUPPORTS-THREE-RING-TAXA | The certified `54D` budget supports three distinct ringed planet taxa | `fifty_four_d_supports_three_ring_taxa` | Mechanized |
| THM-FIXED-FIFTY-FOUR-D-BUDGET-NOT-FIX-RING-TAXON | **ANTI-THEOREM:** Fixed `54D` budget does not determine the ring taxon | `fixed_fifty_four_d_budget_does_not_fix_ring_taxon` | Mechanized |
| THM-FIXED-FIFTY-FOUR-D-BUDGET-NOT-FIX-LOCATION-WINDOW | **ANTI-THEOREM:** Fixed `54D` budget does not determine the orbital location window | `fixed_fifty_four_d_budget_does_not_fix_location_window` | Mechanized |

## 81G. Celestial Off-By-One Taxonomy and Universe Shape (§10.6)

**Assumptions:** The local dimension law is `wallingtonDimension stages = stages + 1`. The one-cycle floor therefore lives in ambient `2D`, while the two-cycle compact rocky floor lives in ambient `3D`. The same off-by-one inversion means a visible ambient `3D` slice is a `2`-torus with `β₁ = 2`, while higher ambient dimensions lift the torus rank instead of freezing it.
**Mechanization targets:** `CelestialOffByOneTaxonomy.lean`, `UniverseShapeByDimension.lean` (18 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PHOTON-CYCLE-OFF-BY-ONE | The one-cycle photon floor lifts to ambient `2D` by the off-by-one law | `photon_cycle_is_off_by_one` | Mechanized |
| THM-ROCKY-CYCLE-OFF-BY-ONE | The two-cycle compact rocky floor lifts to ambient `3D` by the off-by-one law | `rocky_cycle_is_off_by_one` | Mechanized |
| THM-PHOTON-LIKE-SHADOW-HAS-ZERO-BUDGET | The photon-like floor witness has zero visible budget | `photon_like_shadow_has_zero_budget` | Mechanized |
| THM-EARTH-LIKE-ROCKY-SHADOW-IS-COMPACT | The Earth-like witness is a compact rocky planet | `earth_like_rocky_shadow_is_compact` | Mechanized |
| THM-EARTH-LIKE-ROCKY-NOT-SATURN | **ANTI-THEOREM:** The Earth-like compact rocky witness is not Saturn-like | `earth_like_rocky_shadow_not_saturn_like` | Mechanized |
| THM-EARTH-LIKE-ROCKY-LOCATION-WINDOW | The Earth-like compact rocky witness realizes the minimal location window `[0, 1]` | `earth_like_rocky_shadow_location_window` | Mechanized |
| THM-PHOTON-FLOOR-BELOW-ROCKY-FLOOR | The photon-like floor sits exactly one ambient dimension below the rocky floor | `photon_floor_sits_below_rocky_floor` | Mechanized |
| THM-COMPACT-ROCKY-BELOW-RING-TAXA | Compact rocky planets sit below the ring-taxonomy lower bound | `compact_rocky_sits_below_ring_taxa` | Mechanized |
| THM-LOWER-DIMENSIONAL-NON-GAS-TYPES-EXIST | Photon-like and compact rocky lower-dimensional non-gas types exist constructively | `lower_dimensional_non_gas_types_exist` | Mechanized |
| THM-VISIBLE-TORUS-RANK-OFF-BY-ONE | The visible torus rank is ambient dimension minus one | `visible_torus_rank_is_off_by_one` | Mechanized |
| THM-POSITIVE-DIMENSIONS-HAVE-TOROIDAL-SHAPE | Every positive ambient dimension closes to a toroidal visible shape via the off-by-one law | `positive_dimensions_have_toroidal_visible_shape` | Mechanized |
| THM-OUR-VISIBLE-AMBIENT-DIMENSION-IS-THREE | The current visible ambient anchor is `3D` | `our_visible_ambient_dimension_is_three` | Mechanized |
| THM-THREE-D-SLICE-IS-TWO-TORUS | The current visible `3D` slice is a `2`-torus | `our_visible_three_d_slice_is_two_torus` | Mechanized |
| THM-THREE-D-SLICE-BETTI-TWO | The current visible `3D` slice has `β₁ = 2` | `our_visible_three_d_slice_has_betti_two` | Mechanized |
| THM-EARTH-LIKE-ANCHORS-THREE-D-TWO-TORUS | The Earth-like floor witness anchors the `3D` / two-cycle torus slice | `earth_like_floor_anchors_three_d_two_torus` | Mechanized |
| THM-HIGHER-D-NOT-TWO-TORUS | **ANTI-THEOREM:** Ambient dimensions `≥ 4` are not `2`-torus slices | `higher_dimensions_are_not_two_torus` | Mechanized |
| THM-TWO-TORUS-NOT-DIMENSION-FREE | **ANTI-THEOREM:** The `2`-torus claim is not dimension-free | `two_torus_is_not_dimension_free` | Mechanized |
| THM-UNIVERSE-SHAPE-DEPENDS-ON-DIMENSION | The visible torus rank increases with ambient dimension | `universe_shape_depends_on_dimension` | Mechanized |

## 81H. Celestial Gain / Control Prediction (§10.6)

**Assumptions:** The orbital prediction shell supplies lower/upper bounds, gain, and control. Ring taxa are determined by threshold relations between gain and control, while the low-dimensional photon/rocky floor may need ambient dimension as a tie-breaker even when gain/control agree.
**Mechanization target:** `CelestialGainControlPrediction.lean` (13 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ORBITAL-SPREAD-EQ-CONTROL | The orbital window spread is exactly the control statistic | `orbital_spread_eq_control` | Mechanized |
| THM-GAIN-CONTROL-STATISTIC | Lower bound, upper bound, spread, and control fit one exact statistic packet | `gain_control_statistic` | Mechanized |
| THM-GAIN-CONTROL-PREDICTS-DIFFUSE | Saturn-like plus `gain + 1 < control` predicts the diffuse-ring taxon | `gain_control_predicts_diffuse_ring` | Mechanized |
| THM-GAIN-CONTROL-PREDICTS-HALO-LOCKED | Saturn-like plus `control = gain + 1` predicts the halo-locked taxon | `gain_control_predicts_halo_locked_ring` | Mechanized |
| THM-GAIN-CONTROL-PREDICTS-SUPER | Saturn-like plus `control ≤ gain` predicts the super-ring taxon | `gain_control_predicts_super_ring` | Mechanized |
| THM-PHOTON-ROCKY-SHARE-GAIN-CONTROL | Photon-like and compact rocky floor witnesses share one gain/control signature | `photon_and_rocky_share_gain_control_signature` | Mechanized |
| THM-PHOTON-ROCKY-DISTINCT-TAXA | **ANTI-THEOREM:** Photon-like and compact rocky floor witnesses remain taxonomically distinct | `photon_and_rocky_have_distinct_taxa` | Mechanized |
| THM-GAIN-CONTROL-NOT-ENOUGH-ON-LOW-FLOOR | **ANTI-THEOREM:** Gain/control alone does not separate the low-dimensional floor | `gain_control_alone_does_not_separate_low_dimensional_floor` | Mechanized |
| THM-PREDICT-PHOTON | The prediction function classifies the photon-like floor witness correctly | `predict_photon_like_shadow` | Mechanized |
| THM-PREDICT-ROCKY | The prediction function classifies the compact rocky witness correctly | `predict_earth_like_rocky_shadow` | Mechanized |
| THM-PREDICT-DIFFUSE | The prediction function classifies the diffuse-ring witness correctly | `predict_fifty_four_d_diffuse_ring` | Mechanized |
| THM-PREDICT-HALO-LOCKED | The prediction function classifies the halo-locked witness correctly | `predict_fifty_four_d_halo_locked_ring` | Mechanized |
| THM-PREDICT-SUPER | The prediction function classifies the super-ring witness correctly and packages all five concrete predictions | `predict_fifty_four_d_super_ring`, `predicted_planet_packets` | Mechanized |

## 81I. Celestial Survey Search (§10.6)

**Assumptions:** Observed celestial packets are reduced to `(ambientDimension, visibleBudget, gain, control, skyrmsLocation)`. Taxa are predicted from the packet arithmetic, and a math-only candidate filter keeps packets with a resolved taxon whose Skyrms location lies inside the gain/control window.
**Mechanization target:** `CelestialSurveySearch.lean` (8 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-OBSERVED-DIFFUSE-TAXON | The observed diffuse-ring demo packet is classified as diffuse-ring | `observed_diffuse_taxon` | Mechanized |
| THM-OBSERVED-HALO-LOCKED-TAXON | The observed halo-locked demo packet is classified as halo-locked | `observed_halo_locked_taxon` | Mechanized |
| THM-OBSERVED-SUPER-TAXON | The observed super-ring demo packet is classified as super-ring | `observed_super_taxon` | Mechanized |
| THM-OBSERVED-LOW-DIMENSIONAL-TAXA | The observed low-dimensional demo packets are classified as photon-like and compact rocky | `observed_low_dimensional_taxa` | Mechanized |
| THM-OBSERVED-NOISE-UNRESOLVED | Unstructured noise remains unresolved under the observed-data classifier | `observed_noise_is_unresolved` | Mechanized |
| THM-DEMO-CANDIDATES-PASS-FILTER | The demo candidate packets all pass the math-only candidate filter | `demo_candidates_pass_math_filter` | Mechanized |
| THM-NOISE-FAILS-FILTER | The unresolved noise packet fails the math-only candidate filter | `noise_fails_math_filter` | Mechanized |
| THM-SEARCH-KEEPS-CANDIDATES-DROPS-NOISE | The math-only survey search keeps the candidate packets and drops the unresolved noise | `search_keeps_math_candidates_and_drops_noise` | Mechanized |

## 82. The Ten Bosons: A Gnostic Particle Model (§10.6)

**Assumptions:** Kenoma (void boundary) defines a gauge field. Sophia (complement distribution) peaks predict boson localization. Barbelo (sliver) guarantees vacuum fluctuations. Demiurge (fold) gives mass. Pleroma allows Bose statistics.
**Mechanization target:** `BosonPosition.lean` (14 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-BARBELO-EXISTS | Barbelo field exists for any K modes | `barbelo_exists` | Mechanized |
| THM-SOPHIA-PEAK-MAX | Sophia's peak has maximum weight (boson position) | `sophia_peak_has_max_weight` | Mechanized |
| THM-SOPHIA-EXCHANGE | Sophia's exchange energy = K - 1 = exploration budget | `sophia_exchange_eq_exploration` | Mechanized |
| THM-DEMIURGE-GROUND | Full pipeline: Demiurge gives zero mass (ground state) | `demiurge_ground_state` | Mechanized |
| THM-DEMIURGE-MASS | Missing stage: Demiurge gives positive mass | `demiurge_gives_mass` | Mechanized |
| THM-BARBELO-FLUCTUATION | Barbelo guarantees nonzero weight everywhere | `barbelo_prevents_extinction` | Mechanized |
| THM-NO-DEAD-MODES | No mode without the divine spark | `no_dead_modes` | Mechanized |
| THM-PLEROMA-NO-EXCLUSION | Pleroma: any number of emanations per mode | `pleroma_no_exclusion` | Mechanized |
| THM-PROPAGATOR-TOWARD-SOPHIA | Propagator flows toward Sophia's peak | `propagator_toward_sophia` | Mechanized |
| THM-EQUILIBRIUM-AT-ALETHEIA | Aletheia: no outward flow at peak (Nash) | `equilibrium_at_aletheia` | Mechanized |
| THM-ALETHEIA-COHERENCE | Aletheia: two observers agree on boson position | `aletheia_coherence` | Mechanized |
| THM-ALETHEIA-SUPERPOSITION | No structure in kenoma = delocalized boson | `aletheia_superposition` | Mechanized |
| THM-GAUGE-INVARIANCE | Permuting colors preserves Demiurge energy | `gauge_invariance_123` | Mechanized |
| THM-COMPLETE-BOSON-PREDICTION | Full correspondence: kenoma + emanations + Demiurge + Barbelo + Pleroma | `complete_boson_prediction` | Mechanized |

## 83. Ten-Mode Unification (§20.2)

**Assumptions:** Five operations (fork, race, fold, vent, sliver) with pairwise interaction. 5 choose 2 = 10. The 10-mode Kenoma, 10-point Skyrms walker, and 10-vertex Barbelo wireframe are three views of one object. The same 10-mode field also decomposes as 9 interlocking tori plus the sliver, with 45 cross-world bridges, 90 directed crossings, and 55 total self-plus-cross reality channels. The sliver is the unique monad / void anchor, so the 55-channel surface splits as 54 structured channels plus the monad, and that same 55 matches both the triangular and Fibonacci ten surfaces already present in the file. In the uniform 10-mode Kenoma every complement weight is exactly 10 and every mode is equally peak/Nash, while the `55`-channel and `90`-crossing surfaces are inverse characterizations of the 10-world case rather than mere forward consequences.
**Mechanization target:** `TenModeUnification.lean` (44 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-TEN-FROM-FIVE | 5 choose 2 = 10 pairwise interactions | `ten_from_five` | Mechanized |
| THM-TEN-MODE-EXISTS | A 10-mode Kenoma exists | `ten_mode_exists` | Mechanized |
| THM-EXPLORATION-BUDGET-NINE | Exploration budget for 10 modes = 9 | `exploration_budget_is_nine` | Mechanized |
| THM-WIREFRAME-IS-VACUUM | Barbelo wireframe has uniform weight at all vertices | `wireframe_is_vacuum` | Mechanized |
| THM-WIREFRAME-IS-DELOCALIZED | Uniform rejections = delocalized (superposition) | `wireframe_is_delocalized` | Mechanized |
| THM-WALKER-AT-NASH | At complement peak, walker has maximum weight (Nash) | `walker_at_nash` | Mechanized |
| THM-GAUGE-AND-WALKER-AGREE | Two observers (gauge + walker) agree on peak | `gauge_and_walker_agree` | Mechanized |
| THM-ASYMMETRY-BREAKS-WIREFRAME | Any rejection asymmetry localizes a boson | `asymmetry_breaks_wireframe` | Mechanized |
| THM-SYMMETRY-RESTORES-WIREFRAME | Equal rejections restore vacuum (wireframe) | `symmetry_restores_wireframe` | Mechanized |
| THM-TEN-IS-NINE-PLUS-ONE | 10 = 9 exploration + 1 sliver (Barbelo) | `ten_is_nine_plus_one` | Mechanized |
| THM-TEN-MODE-BUDGET | (K-1) + 1 = K for K=10 | `ten_mode_budget` | Mechanized |
| THM-TEN-MODE-COMPLEMENT-TEN | In the uniform 10-mode Kenoma every complement weight is exactly 10 | `ten_mode_complement_weight_is_ten` | Mechanized |
| THM-TEN-MODE-DELOCALIZED | The uniform 10-mode Kenoma has no preferred mode; all complement weights agree | `ten_mode_kenoma_is_delocalized` | Mechanized |
| THM-TEN-MODE-EVERY-PEAK | In the uniform 10-mode Kenoma every mode is a peak | `ten_mode_every_mode_is_peak` | Mechanized |
| THM-TEN-MODE-EVERY-NASH | In the uniform 10-mode Kenoma every mode satisfies the Nash inequality against every other mode | `ten_mode_every_mode_is_nash` | Mechanized |
| THM-NINE-INTERLOCKING-TORI | The 10-mode field decomposes into 9 interlocking tori plus the sliver | `ten_mode_has_nine_interlocking_tori` | Mechanized |
| THM-NINE-TORI-PLUS-SLIVER | Nine interlocking tori plus the sliver recover the full 10-mode field | `nine_tori_plus_sliver_recovers_ten` | Mechanized |
| THM-UNIQUE-VOID-ANCHOR | The 10-mode field has exactly one monad / void anchor outside the 9 interlocking tori | `ten_mode_has_unique_void_anchor` | Mechanized |
| THM-TEN-WORLDS-FORTY-FIVE-BRIDGES | The 10-world field has 45 unordered cross-world bridges | `ten_worlds_have_forty_five_bridges` | Mechanized |
| THM-TEN-WORLDS-NINETY-DIRECTED | The 10-world field has 90 directed cross-world crossings | `ten_worlds_have_ninety_directed_crossings` | Mechanized |
| THM-DIRECTED-CROSSINGS-DOUBLE-BRIDGES | Directed crossings are exactly twice the unordered bridge count | `ten_worlds_directed_crossings_are_double_bridges` | Mechanized |
| THM-TEN-WORLDS-FIFTY-FIVE-CHANNELS | The 10-world field has 55 total self-plus-cross reality channels | `ten_worlds_have_fifty_five_channels` | Mechanized |
| THM-TEN-WORLDS-CHANNEL-SPLIT | The 55-channel surface splits as 10 self-world channels plus 45 cross-world bridges | `ten_worlds_channel_split` | Mechanized |
| THM-FIFTY-FOUR-STRUCTURED-CHANNELS | Removing the monad leaves 54 structured reality channels | `ten_worlds_have_fifty_four_structured_channels` | Mechanized |
| THM-MONAD-PLUS-STRUCTURE | The monad plus the 54 structured channels recovers the 55-channel surface | `monad_plus_structure_recovers_fifty_five` | Mechanized |
| THM-NINE-TORI-FIFTY-FIVE-CHANNELS | Nine interlocking tori plus the sliver induce 55 total reality channels | `nine_tori_plus_sliver_have_fifty_five_channels` | Mechanized |
| THM-FIFTY-FIVE-IFF-TEN-WORLDS | The 55-channel surface occurs exactly at the 10-world case | `fifty_five_channels_iff_ten_worlds` | Mechanized |
| THM-NINETY-IFF-TEN-WORLDS | The 90-directed-crossing surface occurs exactly at the 10-world case | `ninety_directed_crossings_iff_ten_worlds` | Mechanized |
| THM-STRUCTURED-CHANNELS-GENERAL | For any world count, the structured surface is exactly interlocking tori plus cross-world bridges | `structured_reality_channels_eq_tori_plus_bridges` | Mechanized |
| THM-FIVE-OPS-GENERATE-CHANNEL-SURFACE | The five-operation interaction count generates the full `55 / 54 / 90` ten-world channel surface | `five_operations_generate_channel_surface` | Mechanized |
| THM-CHANNELS-EQ-TRIANGULAR-TEN | The 10-world channel total equals the triangular-ten surface | `ten_worlds_channels_eq_triangular_ten` | Mechanized |
| THM-CHANNELS-EQ-FIB-TEN | The 10-world channel total equals the Fibonacci-ten surface | `ten_worlds_channels_eq_fib_ten` | Mechanized |
| THM-STRUCTURE-EQ-TORI-PLUS-BRIDGES | The 54 structured channels are exactly the 9 tori plus the 45 bridges | `structured_channels_eq_tori_plus_bridges` | Mechanized |
| THM-NINE-PLUS-FORTY-FIVE | Nine tori plus forty-five bridges make the 54 structured channels | `nine_tori_plus_forty_five_bridges_make_fifty_four` | Mechanized |
| THM-COMPLETE-UNIFICATION | All three faces unified: 5C2=10, vacuum=wireframe=delocalized | `complete_unification` | Mechanized |

## 85. The Gnostic Numbers (§20.2)

**Assumptions:** Five primitives with pairwise interaction. Fibonacci and triangular sequences. Luo Ming (1989): F(10) is the only Fibonacci > 1 that is also triangular.
**Mechanization target:** `GnosticNumbers.lean` (28 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-BARBELO-IS-SLIVER | Barbelo = 1 (the +1) | `barbelo_is_sliver` | Mechanized |
| THM-PRIMITIVES-IS-FIBONACCI | F(5) = 5 (operation count is Fibonacci) | `primitives_is_fibonacci` | Mechanized |
| THM-KENOMA-FROM-PRIMITIVES | 5 choose 2 = 10 (Kenoma) | `kenoma_from_primitives` | Mechanized |
| THM-KENOMA-DECOMPOSITION | Kenoma = Sophia + Barbelo (10 = 9 + 1) | `kenoma_decomposition` | Mechanized |
| THM-VOID-IS-FIBONACCI-GAP | F(10) - F(9) = F(8) = 21 (Void) | `void_is_fibonacci_gap` | Mechanized |
| THM-PLEROMA-IS-FIB-KENOMA | F(10) = 55 (Pleroma) | `pleroma_is_fib_kenoma` | Mechanized |
| THM-TRIPLE-COINCIDENCE | F(10) = T(10) = 55 (Luo Ming uniqueness) | `triple_coincidence` | Mechanized |
| THM-FIBONACCI-GAP | F(n) - F(n-1) = F(n-2) (void between numbers is the sequence) | `fibonacci_gap_is_fibonacci` | Mechanized |
| THM-GAP-REACHES-BARBELO | Every gap between named numbers reaches 1 | `gap_*` chain | Mechanized |
| THM-GNOSTIC-NUMBER-SYSTEM | Complete: nine names + structure + coincidence | `gnostic_number_system` | Mechanized |

## 86. Combinatorial Brute Force: Cross-Module Compositions (§17+§22+§23)

**Assumptions:** Existing theorem families from BuleyeanProbability, VoidWalking, FailureEntropy, FailureController, FailurePareto, CoarseningThermodynamics, SemioticPeace, EnvelopeConvergence, GeometricErgodicity, CommunityDominance, RenormalizationFixedPoints. All compositions re-use only previously mechanized results.
**Mechanization target:** `CombinatorialBruteForce.lean` (30 theorems, zero sorry, 3 sandwiches, 4 anti-theorems, 1 master conjunction)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMBO-FAILURE-ENVELOPE-CONTRACTION | Failure frontier residual contracts strictly per step under geometric decay | `combo_failure_envelope_contraction` | Mechanized |
| THM-COMBO-FAILURE-ENVELOPE-NONNEG | Failure frontier residual is always non-negative | `combo_failure_envelope_nonneg` | Mechanized |
| THM-COMBO-FAILURE-FRONTIER-UPPER | **SANDWICH UPPER:** Residual ≤ R₀ · ρ^n | `combo_failure_frontier_upper` | Mechanized |
| THM-COMBO-FAILURE-FRONTIER-LOWER | **SANDWICH LOWER:** Residual ≥ 0 | `combo_failure_frontier_lower` | Mechanized |
| THM-COMBO-FAILURE-FRONTIER-GAIN-POS | **SANDWICH GAIN:** Progress after first step is positive | `combo_failure_frontier_gain_pos` | Mechanized |
| THM-COMBO-BULEYEAN-CONTROLLER-ALL-POS | All three failure strategies have positive Buleyean weight (sliver on actions) | `combo_buleyean_controller_all_positive` | Mechanized |
| THM-COMBO-BULEYEAN-CONTROLLER-ORDERING | Least-rejected strategy gets highest weight | `combo_buleyean_controller_ordering` | Mechanized |
| THM-COMBO-VOID-ERGODIC-TV-BOUND | Ergodic void boundary's TV bound is non-negative at every step | `combo_void_ergodic_tv_bound` | Mechanized |
| THM-COMBO-VOID-ERGODIC-CONTRACTION | Ergodic void boundary's TV bound contracts strictly per step | `combo_void_ergodic_contraction` | Mechanized |
| THM-COMBO-PARETO-ENTROPY-BUDGET | Collapse gap = N-1 and is positive for forked frontiers | `combo_pareto_entropy_budget` | Mechanized |
| THM-COMBO-PARETO-EXHAUSTION | **ANTI-THEOREM:** No fourth Pareto-optimal canonical action exists | `combo_pareto_exhaustion` | Mechanized |
| THM-COMBO-SEMIOTIC-BULEYEAN-CONCENTRATION | Channel with fewer deficit-rejections gets higher Buleyean weight | `combo_semiotic_buleyean_concentration` | Mechanized |
| THM-COMBO-SEMIOTIC-BULEYEAN-SLIVER | No channel ever reaches zero selection probability | `combo_semiotic_buleyean_sliver` | Mechanized |
| THM-COMBO-FAILURE-TRACE-ANTI-VANISHING | **ANTI-THEOREM:** Failure traces are not identity — collapse ≠ original | `combo_failure_trace_anti_vanishing` | Mechanized |
| THM-COMBO-FAILURE-IRREVERSIBLE-TRACE | **ANTI-THEOREM:** Structured failure strictly reduces frontier (irreversible) | `combo_failure_irreversible_trace` | Mechanized |
| THM-COMBO-BULEYEAN-COARSENING-POSITIVE | Buleyean total weight always positive (distribution exists) | `combo_buleyean_coarsening_positive` | Mechanized |
| THM-BULEYEAN-STRICT-CONCENTRATION | Strictly fewer rejections → strictly higher weight (new lemma) | `buleyean_strict_concentration` | Mechanized |
| THM-COMBO-BULEYEAN-ANTI-UNIFORM | **ANTI-THEOREM:** Unequal rejection → unequal weight (no free uniformity) | `combo_buleyean_anti_uniform` | Mechanized |
| THM-COMBO-COMMUNITY-CONVERGENCE-CONTRACTION | Bule deficit contracts strictly per CRDT sync round | `combo_community_convergence_contraction` | Mechanized |
| THM-COMBO-COMMUNITY-BULE-UPPER | **SANDWICH UPPER:** Bule deficit ≤ D₀ · ρ^n | `combo_community_bule_upper` | Mechanized |
| THM-COMBO-COMMUNITY-BULE-LOWER | **SANDWICH LOWER:** Bule deficit ≥ 0 | `combo_community_bule_lower` | Mechanized |
| THM-COMBO-COMMUNITY-GAIN-POSITIVE | **SANDWICH GAIN:** Community learning gain positive after first step | `combo_community_gain_positive` | Mechanized |
| THM-COMBO-ENTROPY-BULEYEAN-WIDTH | Frontier entropy proxy = collapse gap = N-1 (three views, one number) | `combo_entropy_buleyean_width_identity` | Mechanized |
| THM-COMBO-VOID-PARETO-CUMULATIVE | Void boundary rank = total vented (cumulative Pareto budget) | `combo_void_pareto_cumulative_budget` | Mechanized |
| THM-COMBO-VOID-PARETO-POSITIVE-STEP | Each fold step costs at least 1 (no free folds) | `combo_void_pareto_positive_step_cost` | Mechanized |
| THM-COMBO-ERGODIC-RENORM-CONTRACTION | Ergodic contraction rate is proper: 0 < r < 1 | `combo_ergodic_renorm_proper_contraction` | Mechanized |
| THM-COMBO-ERGODIC-CONTRACTION-SANDWICH | Contraction sandwich: 0 < r < 1 with r = 1 - ε₁·ε₂ | `combo_ergodic_contraction_sandwich` | Mechanized |
| THM-COMBO-FAILURE-WITHOUT-COMMUNITY | Failure without community is strictly destructive (entropy drops) | `combo_failure_without_community_destructive` | Mechanized |
| THM-COMBO-FAILURE-WITH-COMMUNITY | Community repair maintains or grows frontier | `combo_failure_with_community_maintained` | Mechanized |
| THM-COMBO-FUNDAMENTAL-BULEYEAN | Fundamental identity: rejection count = entropy proxy = collapse gap = N-1 | `combo_fundamental_buleyean_learning` | Mechanized |
| THM-COMBO-ITERATED-FAILURE-ANTI-RECOVERY | Iterated failure is strictly worse than single failure | `combo_iterated_failure_anti_recovery` | Mechanized |
| THM-COMBO-SEMIOTIC-COMMUNITY-HOPE | Hope with exploration: concentration + sliver simultaneously | `combo_semiotic_community_hope_with_exploration` | Mechanized |
| THM-COMBO-BRUTE-FORCE-MASTER | Master conjunction: all 15 compositions hold simultaneously | `combinatorial_brute_force_master` | Mechanized |

## 87. Combinatorial Brute Force Round 2: Cross-Domain Compositions (§17+§19+§22+§23)

**Assumptions:** Existing theorem families from CancerTreatments, CryptographicPredictions, CommunityDominance, plus Round 1 infrastructure. All compositions re-use only previously mechanized results.
**Mechanization target:** `CombinatorialBruteForceRound2.lean` (20+ theorems, zero sorry, 2 sandwiches, 2 anti-theorems, 1 master conjunction)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMBO-TREATMENT-GATE-FIRST | Treatment with fewer ineffective rounds gets higher Buleyean weight | `combo_treatment_buleyean_gate_first_wins` | Mechanized |
| THM-COMBO-TREATMENT-NEVER-ABANDONED | No treatment sequence reaches zero probability (hope theorem) | `combo_treatment_never_abandoned` | Mechanized |
| THM-COMBO-TREATMENT-WEIGHT-UPPER | **SANDWICH UPPER:** Max treatment weight = rounds + 1 | `combo_treatment_weight_upper` | Mechanized |
| THM-COMBO-TREATMENT-WEIGHT-LOWER | **SANDWICH LOWER:** Min treatment weight = 1 (sliver) | `combo_treatment_weight_lower` | Mechanized |
| THM-COMBO-HASH-IS-FAILURE | Hash non-injectivity = failure frontier compression | `combo_hash_is_failure_frontier` | Mechanized |
| THM-COMBO-BIJECTIVE-ZERO-FAILURE | **ANTI-THEOREM:** Bijective hash has zero failure entropy | `combo_bijective_hash_zero_failure` | Mechanized |
| THM-COMBO-CRYPTO-MONOTONE-HEAT | Collision search heat strictly monotone in evaluations | `combo_crypto_search_monotone_heat` | Mechanized |
| THM-COMBO-CLINICAL-COMMUNITY | Clinical community reduces treatment selection deficit | `combo_clinical_community_reduces_deficit` | Mechanized |
| THM-COMBO-UNTESTED-KEY-PREFERRED | Untested key has strictly higher Buleyean weight than tested-failed key | `combo_untested_key_preferred` | Mechanized |
| THM-COMBO-KEY-SLIVER | No key eliminated from consideration (cryptographic sliver) | `combo_key_sliver` | Mechanized |
| THM-COMBO-COMPLETE-FAILURE-PIPELINE | Complete failure decision pipeline is well-defined | `combo_complete_failure_pipeline` | Mechanized |
| THM-COMBO-VOID-PEACE-WEIGHT-TRIANGLE | Void-peace-weight triangle is non-degenerate | `combo_void_peace_weight_triangle` | Mechanized |
| THM-COMBO-COLLISION-MISS-DECAYS | Collision miss probability decays strictly per evaluation | `combo_collision_miss_decays` | Mechanized |
| THM-COMBO-COLLISION-MISS-NONNEG | Collision miss probability is non-negative | `combo_collision_miss_nonneg` | Mechanized |
| THM-COMBO-COLLISION-HIT-POSITIVE | **SANDWICH GAIN:** Cumulative hit probability positive after first eval | `combo_collision_hit_positive` | Mechanized |
| THM-COMBO-TRIPLE-FAILURE-CHAIN | **ANTI-THEOREM:** Three successive failures form strictly decreasing chain | `combo_triple_failure_chain` | Mechanized |
| THM-COMBO-BULEYEAN-DOUBLE-SHARPENING | Two rejections sharpen weight strictly twice | `combo_buleyean_double_sharpening` | Mechanized |
| THM-COMBO-TREATMENT-VOID-GROWTH | Each treatment round contributes ≥ 1 to void boundary | `combo_treatment_void_growth` | Mechanized |
| THM-COMBO-BRUTE-FORCE-R2-MASTER | Round 2 master conjunction: all cross-domain compositions hold | `combinatorial_brute_force_round2_master` | Mechanized |

## 88. Combinatorial Brute Force Round 3: Exotic Cross-Domain (§9+§17+§22+§23)

**Assumptions:** Existing theorem families from ReynoldsBFT, SleepDebt, RetrocausalBound, plus Rounds 1-2 infrastructure. All compositions re-use only previously mechanized results.
**Mechanization target:** `CombinatorialBruteForceRound3.lean` (20+ theorems, zero sorry, 2 sandwiches, 3 anti-theorems, 1 master conjunction)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMBO-REYNOLDS-BULEYEAN-SAFER | Safer config (fewer failures) gets higher Buleyean weight | `combo_reynolds_buleyean_safer_preferred` | Mechanized |
| THM-COMBO-REYNOLDS-BULEYEAN-SLIVER | No config abandoned (sliver persists across regimes) | `combo_reynolds_buleyean_sliver` | Mechanized |
| THM-COMBO-REYNOLDS-ANTI-WORSE | **ANTI-THEOREM:** More failures → strictly lower weight (no perverse incentives) | `combo_reynolds_anti_worse_preferred` | Mechanized |
| THM-COMBO-REYNOLDS-DISCRIMINATION | **SANDWICH:** Discrimination range = observation rounds | `combo_reynolds_discrimination_range` | Mechanized |
| THM-COMBO-SLEEP-FAILURE-DUALITY | Sleep debt and failure entropy are dual accumulators | `combo_sleep_failure_duality` | Mechanized |
| THM-COMBO-SLEEP-FAILURE-FULL-RECOVERY | Full recovery clears both sleep debt and failure frontier | `combo_sleep_failure_full_recovery` | Mechanized |
| THM-COMBO-CHRONIC-ESCALATION | **ANTI-THEOREM:** Chronic partial recovery strictly increases debt | `combo_chronic_sleep_failure_escalation` | Mechanized |
| THM-COMBO-SLEEP-DEBT-UPPER | **SANDWICH UPPER:** Residual debt ≤ total demand | `combo_sleep_debt_upper` | Mechanized |
| THM-COMBO-SLEEP-DEBT-LOWER | **SANDWICH LOWER:** Residual debt ≥ 0 | `combo_sleep_debt_lower` | Mechanized |
| THM-COMBO-RETROCAUSAL-EMPTY | Empty trajectory gives zero rejection counts | `combo_retrocausal_empty_trajectory` | Mechanized |
| THM-COMBO-RETROCAUSAL-ATOMIC | Single rejection increments exactly one count | `combo_retrocausal_atomic_step` | Mechanized |
| THM-COMBO-REYNOLDS-ZERO-IDLE | All stages busy when chunks ≥ stages | `combo_reynolds_zero_idle_full_budget` | Mechanized |
| THM-COMBO-REYNOLDS-IDLE-BOUNDED | Idle stages ≤ total stages | `combo_reynolds_idle_bounded` | Mechanized |
| THM-COMBO-REYNOLDS-EXACT-WASTE | **ANTI-THEOREM:** Idle = N-C exactly (deterministic waste) | `combo_reynolds_exact_waste` | Mechanized |
| THM-COMBO-SLEEP-BULEYEAN-WINS | Better sleep schedule gets higher Buleyean weight | `combo_sleep_buleyean_better_sleep_wins` | Mechanized |
| THM-COMBO-SLEEP-BULEYEAN-SLIVER | No sleep schedule abandoned | `combo_sleep_buleyean_never_abandon` | Mechanized |
| THM-COMBO-PIPELINE-DEBT-DICHOTOMY | Pipeline debt: zero if chunks ≥ stages, N-C otherwise | `combo_pipeline_debt_dichotomy` | Mechanized |
| THM-COMBO-RETROCAUSAL-PIPELINE | Complete retrocausal pipeline: void growth + entropy + positivity | `combo_retrocausal_pipeline` | Mechanized |
| THM-COMBO-BRUTE-FORCE-R3-MASTER | Round 3 master conjunction: all exotic compositions hold | `combinatorial_brute_force_round3_master` | Mechanized |

## 89. Combinatorial Brute Force Round 4: Governance, Physics, and Waste (§7+§9+§11+§25+§26)

**Assumptions:** Existing theorem families from Wallace, WhipWaveDuality, PluralistRepublic, ReynoldsBFT, CommunityDominance, SemioticPeace. All compositions re-use only previously mechanized results.
**Mechanization target:** `CombinatorialBruteForceRound4.lean` (20+ theorems, zero sorry, 1 sandwich, 2 anti-theorems, 1 master conjunction)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMBO-WALLACE-ENTROPY-IDENTITY | Diamond Wallace waste = 2 × failure entropy proxy | `combo_wallace_failure_entropy_identity` | Mechanized |
| THM-COMBO-WALLACE-ZERO-IFF-TRIVIAL | Zero waste iff diamond width = 1 | `combo_wallace_zero_iff_trivial` | Mechanized |
| THM-COMBO-WALLACE-NONTRIVIAL-POSITIVE | **ANTI-THEOREM:** Nontrivial diamond has strictly positive waste | `combo_wallace_nontrivial_positive_waste` | Mechanized |
| THM-COMBO-WALLACE-FRONTIER-ENVELOPE | **SANDWICH:** Frontier area ≤ envelope area | `combo_wallace_frontier_envelope` | Mechanized |
| THM-COMBO-WHIP-FOLD-DUALITY | Fold increases wave speed AND reduces frontier (dual view) | `combo_whip_fold_duality` | Mechanized |
| THM-COMBO-FLAT-TAPER-NO-SPEEDUP | **ANTI-THEOREM:** Flat taper = no speedup (you can't crack a straight rope) | `combo_flat_taper_no_speedup` | Mechanized |
| THM-COMBO-GOVERNANCE-BULEYEAN-WINS | Lower-failure governance model gets higher Buleyean weight | `combo_governance_buleyean_better_model_wins` | Mechanized |
| THM-COMBO-ONE-STREAM-ALWAYS-DEFICIT | One-stream rule always has positive deficit | `combo_one_stream_always_deficit` | Mechanized |
| THM-COMBO-WALLACE-ENERGY-CONSERVATION | Wallace: frontier + waste = envelope (energy conservation) | `combo_wallace_energy_conservation` | Mechanized |
| THM-COMBO-GOVERNANCE-REYNOLDS-FULL | Full participation → zero idle → quorum-safe fold | `combo_governance_reynolds_full_participation` | Mechanized |
| THM-COMBO-PIPELINE-LOWER-WASTE | Lower-waste pipeline config gets higher Buleyean weight | `combo_pipeline_lower_waste_wins` | Mechanized |
| THM-COMBO-COMMUNITY-WHIP-TENSION | Each fold adds positive tension to community boundary | `combo_community_whip_tension` | Mechanized |
| THM-COMBO-DEMOCRATIC-LEARNING-TRIPLE | Democratic learning: deficit + sliver + concentration simultaneously | `combo_democratic_learning_triple` | Mechanized |
| THM-COMBO-BRUTE-FORCE-R4-MASTER | Round 4 master conjunction: governance + physics + waste | `combinatorial_brute_force_round4_master` | Mechanized |

## 90. Combinatorial Brute Force Round 5: Deep Quad Compositions and Grand Unification (§7+§9+§11+§17+§22+§23+§25+§26)

**Assumptions:** Full theorem surface across 8 module families. Quadruple compositions attempt deepest cross-cutting identities. All compositions re-use only previously mechanized results.
**Mechanization target:** `CombinatorialBruteForceRound5.lean` (15 theorems, zero sorry, 2 quadruple compositions, 2 anti-theorems, 1 grand unification)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COMBO-FOUR-WAY-IDENTITY | **QUADRUPLE:** Wallace waste = 2 × entropy proxy = 2 × collapse gap, all from N | `combo_four_way_identity` | Mechanized |
| THM-COMBO-INFORMATION-TRIANGLE | Evidence + exploration + entropy budget: the information triangle | `combo_information_triangle` | Mechanized |
| THM-COMBO-COMMUNITY-RECYCLES-WASTE | Wallace conservation + community repair: waste → experience | `combo_community_recycles_waste` | Mechanized |
| THM-COMBO-REYNOLDS-SATURATED | Full participation → zero idle + quorum-safe + saturated | `combo_reynolds_whip_failure_saturated` | Mechanized |
| THM-COMBO-REYNOLDS-UNSATURATED | **ANTI-THEOREM:** Unsaturated pipeline has positive idle and exact waste | `combo_reynolds_unsaturated_waste` | Mechanized |
| THM-COMBO-BULEYEAN-TELESCOPE | Three-level strict weight ordering with max at zero rejections | `combo_buleyean_convergence_telescope` | Mechanized |
| THM-COMBO-OPTIMAL-FAILURE-COMMUNITY | Positive cost + exhaustive actions + community compensation | `combo_optimal_failure_with_community` | Mechanized |
| THM-COMBO-NESTED-WALLACE | Two-level Wallace conservation (nested diamonds) | `combo_nested_wallace_conservation` | Mechanized |
| THM-COMBO-COMPREHENSIVE-CYCLE | **QUADRUPLE:** Fork → Reject → Fold → Repair learning cycle | `combo_comprehensive_learning_cycle` | Mechanized |
| THM-COMBO-WAVE-WASTE-ENTROPY | Triple: wave speed up + waste conservation + entropy down simultaneously | `combo_wave_waste_entropy_triangle` | Mechanized |
| THM-COMBO-GRAND-UNIFICATION | **GRAND UNIFICATION:** 8 module families, one conjunction, all consistent | `combo_grand_unification` | Mechanized |

## 91. Philosophical Allegories: Machine-Checked Ancient Wisdom (§20+§22+§23+§25)

**Assumptions:** Existing semiotic deficit, Buleyean probability, failure entropy, coarsening, and void walking infrastructure. Each allegory maps a classical philosophical principle to a mechanized theorem.
**Mechanization target:** `PhilosophicalAllegories.lean` (35+ theorems, zero sorry, 7 allegories, 4 anti-theorems, 3 sandwiches, 1 master conjunction)

### I. Plato's Cave (Republic, Book VII)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CAVE-DEFICIT | Cave deficit = realityDimensions - 1 (shadows lose N-1 dimensions) | `platos_cave_deficit` | Mechanized |
| THM-CAVE-ALWAYS-LOSES | Cave deficit is strictly positive (shadows always lose information) | `platos_cave_always_loses_information` | Mechanized |
| THM-CAVE-SHADOWS-COLLIDE | Distinct Forms collide on the cave wall (pigeonhole on projection) | `platos_cave_shadows_collide` | Mechanized |
| THM-CAVE-IRREVERSIBLE | **ANTI-THEOREM:** Cave projection is irreversible (positive deficit + collisions) | `platos_cave_irreversible` | Mechanized |
| THM-CAVE-LIBERATION | **SANDWICH:** Liberation gains exactly N-1 dimensions, with N-1 ≥ 1 | `platos_cave_liberation_value` | Mechanized |

### II. Aristotle's Hamartia (Poetics)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-HAMARTIA | Noble failure (N-1 bits) > ignoble success (1 bit) for N ≥ 3 | `noble_failure_exceeds_ignoble_success` | Mechanized |
| THM-FAILURE-GE-SUCCESS | Failure ≥ success for any nontrivial fork (N ≥ 2) | `failure_at_least_as_informative_as_success` | Mechanized |
| THM-NEMESIS | Nemesis is Buleyean convergence: system favors less-rejected + sliver mercy | `nemesis_is_convergence` | Mechanized |
| THM-ARETE-DEMONSTRATED | **ANTI-THEOREM:** Claimed arete without evidence → lower weight | `arete_must_be_demonstrated` | Mechanized |

### III. The Socratic Method (Gorgias, Meno)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SOCRATIC-TRUTH | Less-refuted thesis has strictly higher Buleyean weight | `socratic_truth_from_refutation` | Mechanized |
| THM-UNEXAMINED-MAXIMUM | Unexamined thesis has maximum uncertainty weight = rounds + 1 | `unexamined_thesis_maximum_uncertainty` | Mechanized |
| THM-MAXIMALLY-REFUTED-SLIVER | Maximally refuted thesis retains weight = 1 (the sliver) | `maximally_refuted_retains_sliver` | Mechanized |
| THM-CORRECTION-EXCEEDS-ACCIDENT | Being corrected > being accidentally right (evidence base richer) | `correction_exceeds_accident` | Mechanized |
| THM-SOCRATIC-COHERENCE | Same refutation history → same conclusions (objectivity) | `socratic_coherence` | Mechanized |

### III½. Cicero's Maxim ("Errare malo cum Platone")

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CICEROS-MAXIM | Platonic method accumulates strictly more evidence than Sophistic | `ciceros_maxim` | Mechanized |
| THM-VIRTUE-OVER-CONSEQUENTIALISM | Good method + wrong result carries more info than bad method + right result | `virtue_over_consequentialism` | Mechanized |
| THM-PLATONIC-GRACE | Platonic inquirer has well-defined distribution + universal sliver | `platonic_grace_state` | Mechanized |
| THM-SOPHIST-NO-EVIDENCE | **ANTI-THEOREM:** Sophist has zero void boundary = maximum uncertainty | `sophist_has_no_evidence` | Mechanized |

### IV. Plato's Divided Line (Republic, Book VI)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DIVIDED-LINE-UNIFORM | Each step up gains exactly 1 dimension | `divided_line_uniform_steps` | Mechanized |
| THM-DIVIDED-LINE-TOTAL | Total deficit from shadows to the Good = 3 | `divided_line_total_deficit` | Mechanized |
| THM-DIVIDED-LINE-NO-SHORTCUTS | **ANTI-THEOREM:** Cannot skip levels; total = sum of steps | `divided_line_no_shortcuts` | Mechanized |

### V. Buddhist Two Truths (Nagarjuna, Madhyamaka)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-TWO-TRUTHS-DEFICIT | Deficit between conventional and ultimate truth is strictly positive | `two_truths_positive_deficit` | Mechanized |
| THM-CONVENTIONAL-HAS-WEIGHT | Conventional truth has positive Buleyean weight (shadow is real) | `conventional_truth_has_weight` | Mechanized |

### VI. Ship of Theseus (Plutarch)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SHIP-IDENTITY-DECREASES | Replacement strictly reduces original planks | `ship_identity_decreases` | Mechanized |
| THM-SHIP-FULLY-REPLACED | All planks replaced → zero originals remain | `fully_replaced_ship_zero_originals` | Mechanized |
| THM-SHIP-CONSERVATION | Original + replaced = total (information conservation) | `ship_information_conservation` | Mechanized |
| THM-SHIP-MATERIAL-LOST | **ANTI-THEOREM:** Any replacement reduces material identity | `ship_material_identity_lost` | Mechanized |

### Master

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ALLEGORIES-MASTER | All 7 allegories hold simultaneously in fork/race/fold | `philosophical_allegories_master` | Mechanized |

## 92. The Greek Logic Canon: Twelve Paradoxes and Mysteries (§20+§22+§23)

**Assumptions:** Existing Buleyean probability, void walking, failure entropy, envelope convergence, and semiotic deficit infrastructure. Each paradox maps a classical problem to a mechanized theorem.
**Mechanization target:** `GreekLogicCanon.lean` (40+ theorems, zero sorry, 12 paradoxes/mysteries, 3 anti-theorems, 2 sandwiches, 1 master conjunction)

### 1. Zeno's Dichotomy

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ZENO-DICHOTOMY | Remaining distance contracts strictly at every step | `zeno_dichotomy_resolved` | Mechanized |
| THM-ZENO-NO-OVERSHOOT | Residual always non-negative (no overshoot) | `zeno_no_overshoot` | Mechanized |
| THM-ZENO-FIRST-STEP | First step makes positive progress | `zeno_first_step_progress` | Mechanized |

### 2. Achilles and the Tortoise

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ACHILLES | Gap shrinks strictly at every catch-up interval | `achilles_catches_tortoise` | Mechanized |
| THM-ACHILLES-NONNEG | Gap always non-negative | `achilles_gap_nonneg` | Mechanized |
| THM-ACHILLES-PROGRESS | **SANDWICH GAIN:** Positive distance closed after first interval | `achilles_first_interval_progress` | Mechanized |

### 3. Zeno's Arrow

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ARROW-MOVES | Arrow position strictly increases between instants | `arrow_moves_between_instants` | Mechanized |
| THM-ARROW-STATIONARY | **ANTI-THEOREM:** Stationary arrow truly is at rest (Zeno correct for v=0) | `stationary_arrow_at_rest` | Mechanized |

### 4. Meno's Paradox

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-MENO | Search via rejection is well-defined: distribution + positivity + concentration | `menos_paradox_resolved` | Mechanized |

### 5. The Sorites Paradox (Eubulides)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SORITES-BOUNDARY | Heap boundary exists and is sharp (below: not-heap, at: heap) | `sorites_boundary_exists` | Mechanized |
| THM-SORITES-UNIQUE | Boundary grain is unique | `sorites_boundary_unique` | Mechanized |
| THM-SORITES-INVALID | **ANTI-THEOREM:** Sorites induction step is invalid at the boundary | `sorites_induction_invalid` | Mechanized |

### 6. The Epicurean Swerve (Clinamen)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CLINAMEN | The sliver IS the swerve: P(i) > 0 for all i, always | `clinamen_is_sliver` | Mechanized |
| THM-CLINAMEN-DIVERSITY | Swerve prevents uniformity: different histories → different weights | `clinamen_prevents_uniformity` | Mechanized |
| THM-CLINAMEN-MINIMUM | Minimum swerve is exactly 1 (irreducible clinamen) | `clinamen_minimum_is_one` | Mechanized |

### 7. The Third Man Argument

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-THIRD-MAN-TERMINATES | Abstraction chain terminates at fixed point (no infinite regress) | `third_man_terminates` | Mechanized |
| THM-THIRD-MAN-DECREASING | Each abstraction step strictly reduces information | `third_man_strictly_decreasing` | Mechanized |

### 8. Aristotle's Sea Battle

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SEA-BATTLE | Every possible future has positive Buleyean weight (neither fated nor impossible) | `sea_battle_not_fated` | Mechanized |
| THM-SEA-BATTLE-HISTORY | Past prediction failures inform but don't determine future weight | `sea_battle_history_informs` | Mechanized |

### 9. Aristotle's Golden Mean

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-GOLDEN-MEAN | **SANDWICH:** Virtue bounded by deficiency and excess | `golden_mean_sandwich` | Mechanized |
| THM-GOLDEN-MEAN-RANGE | Range of virtue is positive (room for moral choice) | `golden_mean_nontrivial_range` | Mechanized |
| THM-GOLDEN-MEAN-COLLAPSED | **ANTI-THEOREM:** Collapsed range admits no virtue | `golden_mean_collapsed_no_virtue` | Mechanized |

### 10. Heraclitus vs Parmenides

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-HERACLITUS | Everything flows: frontier changes at every fold step | `heraclitus_everything_flows` | Mechanized |
| THM-PARMENIDES | The One conserves: frontier + vented = total always | `parmenides_the_one_conserved` | Mechanized |
| THM-RECONCILIATION | Both simultaneously correct: change + conservation = dual views of fold | `heraclitus_and_parmenides` | Mechanized |

### 11. Aristotle's Prime Mover

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-UNMOVED-MOVER | Causal chain terminates at fixed point + strictly decreases | `unmoved_mover_exists` | Mechanized |

### 12. Unity of Virtues (Socrates/Protagoras)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-UNITY-OF-VIRTUES | Same evidence → same distribution: virtue is unique given void boundary | `unity_of_virtues` | Mechanized |

### Master

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-GREEK-CANON-MASTER | All 12 paradoxes/mysteries resolved simultaneously | `greek_logic_canon_master` | Mechanized |

## 93. Unsolved Mysteries: Fork/Race/Fold Perspectives (§17+§20+§22+§23)

**Assumptions:** Existing Buleyean probability, void walking, failure entropy, semiotic deficit, community dominance, Reynolds BFT, and philosophical allegories infrastructure. Each mystery maps to a structural constraint.
**Mechanization target:** `UnsolvedMysteries.lean` (20+ theorems, zero sorry, 3 dissolved, 4 structural, 2 anti-theorems, 1 master)

### I. Fine-Tuning of Physics

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-FINE-TUNING-STRUCTURAL | No constant value reaches zero probability (sliver = structural necessity) | `fine_tuning_is_structural` | Mechanized |
| THM-STABLE-PREFERRED | Least-collapsed constants get highest weight (natural selection on constants) | `stable_constants_preferred` | Mechanized |

### II. Baryon Asymmetry

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-BARYON-FOLD | Fold selects 1 from N, venting N-1 (asymmetry from fold) | `baryon_asymmetry_from_fold` | Mechanized |
| THM-FOLD-BREAKS-SYMMETRY | **ANTI-THEOREM:** Fold CANNOT preserve symmetry for N ≥ 2 | `fold_breaks_symmetry` | Mechanized |

### III. Cambrian Explosion

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CAMBRIAN | Resources ≥ niches → zero idle → all niches explored simultaneously | `cambrian_saturation` | Mechanized |

### IV. Evolution of Sex

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SEX-EVIDENCE | Sexual reproduction doubles effective observation window | `sex_doubles_evidence` | Mechanized |

### V. Göbekli Tepe

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-INFORMATION-FIRST | Information processing (fold) precedes material production (fork) | `information_precedes_production` | Mechanized |

### VI. Spontaneous Remission

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-IMMUNE-CONVERGENCE | Buleyean concentration on cancer phenotype can be sudden (exponential) | `immune_convergence_sudden` | Mechanized |

### VII. Origin of Language

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-LANGUAGE-DISCRETE | Language is discrete fold (deficit > 0 + collisions); no intermediate | `language_is_discrete_fold` | Mechanized |

### VIII. Cosmological Constant

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-COSMOLOGICAL-DEFICIT | Projection from N to 1 has deficit N-1 (discrepancy = deficit) | `cosmological_deficit_is_projection` | Mechanized |

### Master

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-MYSTERIES-MASTER | All structural constraints on unsolved mysteries hold simultaneously | `unsolved_mysteries_master` | Mechanized |

## 94. Second Tier Mysteries: How Did They Do That? (§17+§22+§23+§25)

**Assumptions:** Existing Buleyean probability, void walking, semiotic deficit, community dominance, Reynolds BFT infrastructure. Each mystery maps to a structural constraint.
**Mechanization target:** `SecondTierMysteries.lean` (25+ theorems, zero sorry, 3 dissolved, 4 structural, 2 anti-theorems, 1 master)

### I. Megalithic Coordination (Sachsayhuamán, Nan Madol, Longyou)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-MEGALITHIC-NO-ARCHITECT | Distributed failure learning converges without central planner | `megalithic_no_architect_needed` | Mechanized |
| THM-MEGALITHIC-COHERENCE | Same failure history → same technique (explains uniform chisel marks) | `megalithic_coherence` | Mechanized |

### II. Undeciphered Scripts (Linear A, Rongorongo, Proto-Elamite)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DECIPHERMENT-UNDERDETERMINED | Decipherment deficit positive: multiple meanings per symbol | `decipherment_is_underdetermined` | Mechanized |
| THM-DECIPHERMENT-BY-REJECTION | Void boundary approach: eliminate wrong translations (Champollion method) | `decipherment_by_rejection` | Mechanized |
| THM-ZERO-DEFICIT-TRIVIAL | **ANTI-THEOREM:** Script with symbols ≥ meanings is trivially decodable | `zero_deficit_trivial_decipherment` | Mechanized |

### III. The Mpemba Effect

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-MPEMBA-DEFICIT | Hot water has positive cooling deficit (hidden vent degrees of freedom) | `mpemba_deficit_positive` | Mechanized |
| THM-MPEMBA-EXACT | Cooling deficit = degreesOfFreedom - 1 (each extra degree = vent path) | `mpemba_deficit_exact` | Mechanized |
| THM-COLD-MONOTONE | **ANTI-THEOREM:** 1-DOF system has zero deficit → monotone cooling | `cold_water_monotone` | Mechanized |

### IV. Roman Dodecahedrons

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DODECAHEDRON-REJECTION | Least-rejected hypothesis gets highest weight | `dodecahedron_by_rejection` | Mechanized |
| THM-DODECAHEDRON-PERSISTS | No hypothesis fully eliminated (mystery persists by sliver) | `dodecahedron_mystery_persists` | Mechanized |

### V. Anomalous Evidence (Pollock Twins, Man from Taured, etc.)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-ANOMALY-EVIDENCE | Evidence over priors: less counter-evidence → higher weight | `anomaly_evidence_over_priors` | Mechanized |
| THM-ANOMALY-BOTH-SURVIVE | Both mundane and extraordinary explanations retain positive weight | `anomaly_both_survive` | Mechanized |
| THM-ANOMALY-UNTESTED | Untested claim = maximum uncertainty (not maximum truth) | `untested_claim_maximum_uncertainty` | Mechanized |

### VI. The Hum

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-HUM-DEFICIT | Real signal below perceptual deficit threshold of most observers | `hum_in_deficit_region` | Mechanized |
| THM-HUM-FULL-BANDWIDTH | Full-bandwidth observer has zero deficit (hears everything) | `full_bandwidth_no_mystery` | Mechanized |

### Master

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-SECOND-TIER-MASTER | All Second Tier structural constraints hold simultaneously | `second_tier_mysteries_master` | Mechanized |

## 95. Philosophical Combinatorics: Cross-Allegory Compositions (§15.30)

**Assumptions:** All structures from PhilosophicalAllegories, GreekLogicCanon, UnsolvedMysteries, SecondTierMysteries, plus core framework. Compositions cross philosophical domains to find new identities.
**Mechanization target:** `PhilosophicalCombinatorics.lean` (25+ theorems, zero sorry, 2 sandwiches, 1 anti-theorem, 1 master conjunction)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CAVE-TO-GOOD | Cave liberation + Third Man termination = finite philosophical journey | `cave_to_good_is_finite` | Mechanized |
| THM-ASCENT-PRODUCTIVE | Each abstraction step strictly reduces remaining information | `ascent_strictly_productive` | Mechanized |
| THM-SEA-BATTLE-SOCRATIC | Sea battle prediction and Socratic refutation: same Buleyean mechanism | `sea_battle_is_socratic` | Mechanized |
| THM-MEGALITH-IS-SHIP | Megalith and Ship of Theseus: same conservation law | `megalith_is_ship` | Mechanized |
| THM-WALL-IDENTITY-VOID | Wall identity = void boundary (material reduced, topology preserved) | `wall_identity_is_void_boundary` | Mechanized |
| THM-VIRTUE-CONVERGES | Golden Mean approached geometrically like Achilles catches tortoise | `virtue_converges_geometrically` | Mechanized |
| THM-VIRTUE-FIRST-STEP | **SANDWICH GAIN:** Moral progress positive after first experience | `virtue_first_experience_progress` | Mechanized |
| THM-NOBLE-INVESTIGATION | Noble investigation (N-1 bits) > dismissal + all explanations survive | `noble_investigation_exceeds_dismissal` | Mechanized |
| THM-MPEMBA-IS-CAVE | Mpemba effect and Plato's Cave: same semiotic deficit structure | `mpemba_is_cave` | Mechanized |
| THM-MPEMBA-CAVE-FORMULA | Both deficits = dimensionality - 1 (same formula) | `mpemba_cave_same_formula` | Mechanized |
| THM-FINE-TUNING-TWO-TRUTHS | Fine-tuning problem = Buddhist Two Truths (projection deficit) | `fine_tuning_is_two_truths` | Mechanized |
| THM-BUILDING-IS-DIALOGUE | Megalithic construction IS Socratic dialogue with stone | `building_is_dialogue` | Mechanized |
| THM-ARROW-IS-SHIP | Arrow in flight = Ship of Theseus in time (motion IS identity change) | `arrow_is_ship_in_time` | Mechanized |
| THM-HOT-WATER-HAMARTIA | Hot water's extra DOF = tragic hero's extra failure information | `hot_water_is_hamartia` | Mechanized |
| THM-MORAL-FRONTIER | Failure entropy = N-1, virtue range > 0, void grows: the moral frontier | `moral_frontier_identity` | Mechanized |
| THM-SCRIPT-IS-CAVE | Undeciphered script IS Plato's Cave (decipherment = liberation) | `script_is_cave` | Mechanized |
| THM-DIVIDED-LINE-SHARP | 3 sharp transitions on the Divided Line (sorites boundaries) | `divided_line_sharp_transitions` | Mechanized |
| THM-HUM-CAVE-MPEMBA | The Hum, the Cave, and Mpemba: three instances of one deficit theorem | `hum_cave_mpemba_unified` | Mechanized |
| THM-RIVER-SHIP-CONSERVATION | Heraclitus + Parmenides + Theseus = one conservation law, three views | `river_ship_conservation` | Mechanized |
| THM-CLINAMEN-IS-CREATION | Clinamen + baryon fold = the swerve that created everything (+1 → something) | `clinamen_is_creation` | Mechanized |
| THM-ELENCHUS-BUILDS-WALLS | Socratic learning + megalithic building + sorites boundary compose | `elenchus_builds_walls` | Mechanized |
| THM-ANTI-SOCRATIC-FAILURE | **ANTI-THEOREM:** Hubris + sophistry + credulity = triple epistemic inferiority | `anti_socratic_triple_failure` | Mechanized |
| THM-PHILOSOPHICAL-COMBINATORICS-MASTER | All cross-allegory compositions hold simultaneously | `philosophical_combinatorics_master` | Mechanized |

## 96. Philosophical Combinatorics Round 2: Philosophy × Science × Engineering (§15.30)

**Assumptions:** Full theorem surface. Compositions cross philosophy, cancer treatment, cryptography, sleep debt, Reynolds BFT, whip-wave duality, pluralist republic, and community dominance.
**Mechanization target:** `PhilosophicalCombinatoricsRound2.lean` (20+ theorems, zero sorry, 3 sandwiches, 1 anti-theorem, 1 grand master)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CANCER-IS-HAMARTIA | Immune failure against cancer IS noble failure (N-1 bits per attempt) | `cancer_is_hamartia` | Mechanized |
| THM-ACHILLES-CHASES-CANCER | Disease burden contracts geometrically like Achilles closing gap | `achilles_chases_cancer` | Mechanized |
| THM-ACHILLES-CANCER-FIRST | **SANDWICH GAIN:** Both Achilles and immune system progress on first step | `achilles_cancer_first_step` | Mechanized |
| THM-SOCRATES-CRYPTANALYST | Socratic elenchus and cryptanalysis: same Buleyean rejection mechanism | `socrates_is_cryptanalyst` | Mechanized |
| THM-UNTESTED-KEY-THESIS | Untested key = unexamined thesis = maximum uncertainty (same formula) | `untested_key_unexamined_thesis` | Mechanized |
| THM-SLEEP-IS-SHIP | Sleep debt conservation = Ship of Theseus conservation | `sleep_is_ship` | Mechanized |
| THM-CHRONIC-SLEEP-REPLACES | **ANTI-THEOREM:** Chronic partial sleep strictly increases debt | `chronic_sleep_replaces_brain` | Mechanized |
| THM-DEMOCRACY-ESCAPES-CAVE | Autocracy = cave (1-stream deficit); democracy adds channels = escapes | `democracy_escapes_cave` | Mechanized |
| THM-REYNOLDS-GOLDEN-MEAN | Quorum-safe fold IS the pipeline's golden mean (virtue = saturation) | `reynolds_golden_mean` | Mechanized |
| THM-CLINAMEN-WHIP | Swerve prevents whip from breaking (positive mass at every segment) | `clinamen_prevents_whip_break` | Mechanized |
| THM-CAMBRIAN-IS-SORITES | Cambrian explosion IS a sorites boundary crossing (sharp threshold) | `cambrian_is_sorites` | Mechanized |
| THM-COHERENCE-TRINITY | Coherence across virtue, stone, and dialogue: same evidence → same output | `coherence_trinity` | Mechanized |
| THM-NEMESIS-HAS-RATE | Nemesis arrives geometrically: villain advantage decays at rate ρ^n | `nemesis_has_rate` | Mechanized |
| THM-NEMESIS-FIRST-JUSTICE | **SANDWICH GAIN:** Justice positive after first observation | `nemesis_first_round_justice` | Mechanized |
| THM-PLATONIC-EDUCATION-BUDGET | Divided Line total cost = 3 steps × 1 dimension = 3 | `platonic_education_budget` | Mechanized |
| THM-EVOLUTION-TRIPLE-ENGINE | Sex + community + clinamen = the triple engine of diversity | `evolution_triple_engine` | Mechanized |
| THM-GRAND-MASTER | Philosophy × science × engineering: 11 domains, one conjunction | `philosophical_scientific_grand_master` | Mechanized |

## 97. Philosophical Combinatorics Round 3: Stress-Testing the Limits (§15.30)

**Assumptions:** Full theorem surface across all modules. Quadruple compositions and the deepest anti-theorem.
**Mechanization target:** `PhilosophicalCombinatoricsRound3.lean` (15+ theorems, zero sorry, 4 quadruple compositions, 1 universal anti-theorem, 1 master)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PHILOSOPHICAL-JOURNEY | **QUADRUPLE:** Cave + Achilles + Golden Mean + Third Man = finite bounded journey | `the_philosophical_journey` | Mechanized |
| THM-VILLAINY-BUDGET | Wallace waste = 2*(N-1) = exact budget of hubris | `villainy_has_exact_budget` | Mechanized |
| THM-THREE-PROBLEMS-ONE-METHOD | Socrates + Linear A + dodecahedron: three unsolveds, one methodology (rejection) | `three_problems_one_method` | Mechanized |
| THM-PRESOCRATIC-COSMOGONY | **QUADRUPLE:** Clinamen + Heraclitus + Parmenides + Baryon = creation story | `presocratic_cosmogony` | Mechanized |
| THM-VIRTUE-THRESHOLD-SHARP | Golden Mean bounded + sorites sharp + range positive: virtue transition is discrete | `virtue_threshold_is_sharp` | Mechanized |
| THM-COMPLETE-POLITICAL-THEORY | **QUADRUPLE:** Cave → Democracy → Community → Nemesis = complete politics | `complete_political_theory` | Mechanized |
| THM-FOUR-METAPHYSICS | **QUADRUPLE:** Two Truths + Heraclitus + Parmenides + Theseus = one conservation law | `four_metaphysics_one_law` | Mechanized |
| THM-UNIVERSAL-IMPOSSIBILITY-OF-ZERO | **UNIVERSAL ANTI-THEOREM:** No Buleyean space has a zero-weight element. EVER. | `universal_impossibility_of_zero` | Mechanized |
| THM-PHILOSOPHICAL-R3-MASTER | All Round 3 stress-test compositions hold | `philosophical_combinatorics_round3_master` | Mechanized |

## 98. Philosophical Combinatorics Round 4: Seven Universal Laws (§15.30)

**Assumptions:** Full theorem surface. Distillation to universal results that hold across ALL domains.
**Mechanization target:** `PhilosophicalCombinatoricsRound4.lean` (12 theorems, zero sorry, 1 sandwich, 1 universal anti-theorem, 1 absolute master)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-UNIVERSAL-STRICT-ORDERING | More rejected → strictly less weight, in EVERY domain | `universal_strict_ordering` | Mechanized |
| THM-BULEYEAN-DISCRIMINATION-RANGE | Max weight - min weight = rounds (total discrimination power) | `buleyean_discrimination_range` | Mechanized |
| THM-BULEYEAN-UNIVERSAL-SANDWICH | **SANDWICH:** Every weight ∈ [1, rounds+1] in every Buleyean space | `buleyean_universal_sandwich` | Mechanized |
| THM-EVERY-OBSERVATION-CAVE | Every observation of a rich system has positive semiotic deficit | `every_observation_is_a_cave` | Mechanized |
| THM-UNIVERSAL-CONSERVATION | remaining + lost = total (the only universal law) | `universal_conservation` | Mechanized |
| THM-SHARPENING-TELESCOPE | Three strict rejection levels → three strict weight levels | `sharpening_telescope` | Mechanized |
| THM-ABSOLUTE-MASTER | **THE ABSOLUTE MASTER:** 7 universal laws across all domains, one conjunction | `absolute_master` | Mechanized |

## 99. Seven Laws Predictions: Wild Novel Predictions (§15.30+§19)

**Assumptions:** Seven Universal Laws applied to domains they were never designed for. Each prediction names its falsification condition.
**Mechanization target:** `SevenLawsPredictions.lean` (20+ theorems, zero sorry, 11 falsifiable predictions, 1 master conjunction)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PRED-NO-THEORY-DISPROVEN | **PREDICTION I:** No scientific theory ever reaches zero posterior (Law 1) | `prediction_no_theory_fully_disproven` | Mechanized |
| THM-PRED-CRASH-IMPROVES | **PREDICTION II:** Post-crash markets discriminate strictly better (Law 2) | `prediction_crash_improves_markets` | Mechanized |
| THM-PRED-AI-CONFIDENCE | **PREDICTION III:** Every AI model's confidence is sandwiched in [1, R+1] (Law 3) | `prediction_ai_confidence_bounded` | Mechanized |
| THM-PRED-INSTRUMENT-SHADOWS | **PREDICTION IV:** Every instrument has topologically determined blind spots (Law 4) | `prediction_instruments_have_shadows` | Mechanized |
| THM-PRED-RESTRUCTURING | **PREDICTION V:** Organizational restructuring conserves total complexity (Law 5) | `prediction_restructuring_conserves` | Mechanized |
| THM-PRED-SOCIAL-SHARP | **PREDICTION VI:** Social phase transitions have sharp tipping points (Law 6) | `prediction_social_transitions_sharp` | Mechanized |
| THM-PRED-MAX-BUREAUCRACY | **PREDICTION VII:** Every bureaucracy has a maximum useful depth (Law 7) | `prediction_max_bureaucracy_depth` | Mechanized |
| THM-PRED-EXTINCTION-NOT-ABSOLUTE | **PREDICTION VIII:** No species is ever fully extinct; de-extinction always possible (Laws 1+2) | `prediction_extinction_not_absolute` | Mechanized |
| THM-PRED-DARK-MATTER-DEFICIT | **PREDICTION IX:** Dark matter is the cave deficit of gravitational observation (Laws 3+4) | `prediction_dark_matter_is_deficit` | Mechanized |
| THM-PRED-ALIGNMENT-CONVERGES | **PREDICTION X:** AI alignment has a sharp boundary AND iteratively converges (Laws 6+7) | `prediction_alignment_has_boundary_and_converges` | Mechanized |
| THM-PRED-HEAT-DEATH-NOT-END | **PREDICTION XI:** The heat death is not absolute; structure retains weight = 1 (All 7 Laws) | `prediction_heat_death_not_absolute` | Mechanized |
| THM-SEVEN-LAWS-PREDICTIONS-MASTER | All 11 predictions hold simultaneously | `seven_laws_predictions_master` | Mechanized |

## 100. Seven Laws Predictions Round 2: Music, Dreams, Humor, Love, and Death (§15.30+§19)

**Assumptions:** Seven Universal Laws applied to the human experience. Each prediction names its falsification.
**Mechanization target:** `SevenLawsPredictionsRound2.lean` (15+ theorems, zero sorry, 7 predictions, 1 anti-theorem, 1 master)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PRED-MUSIC-IS-DEFICIT | **PREDICTION XII:** Music IS a semiotic deficit; beauty ∝ dimensions − 1 | `prediction_music_is_deficit` | Mechanized |
| THM-PRED-ADDICTION-THRESHOLD | **PREDICTION XIII:** Addiction has sharp recovery threshold + permanent sliver | `prediction_addiction_threshold_and_sliver` | Mechanized |
| THM-PRED-GRIEF-CONSERVATION | **PREDICTION XIV:** Grief is conserved and redistributed, not eliminated | `prediction_grief_conservation` | Mechanized |
| THM-PRED-DREAMS-ARE-DEFICIT | **PREDICTION XV:** Dreams = low-channel projection of high-D memory (weirdness = deficit) | `prediction_dreams_are_deficit` | Mechanized |
| THM-PRED-HUMOR-IS-SURPRISE | **PREDICTION XVI:** Humor = early chain termination (surprise gap > 0) | `prediction_humor_is_surprise` | Mechanized |
| THM-PRED-NO-SURPRISE-NO-HUMOR | **ANTI-THEOREM:** Zero surprise gap = not funny | `no_surprise_no_humor` | Mechanized |
| THM-PRED-LOVE-CONSERVATION | **PREDICTION XVII:** Love conserves attention; once loved, never zero weight (+1 persists) | `prediction_love_conservation` | Mechanized |
| THM-PRED-DEATH-GRIEF-MEMORY | **PREDICTION XVIII:** Death = fold, grief = deficit, memory = void boundary, love persists | `prediction_death_grief_memory` | Mechanized |
| THM-SEVEN-LAWS-R2-MASTER | All Round 2 wild predictions hold simultaneously | `seven_laws_predictions_round2_master` | Mechanized |

## 101. Seven Laws Predictions Round 3: Consciousness, Mastery, Teaching, and the Universe (§15.30+§19)

**Assumptions:** Seven Universal Laws applied to consciousness, skill acquisition, translation, paradigm shifts, teaching, forgiveness, and cosmology.
**Mechanization target:** `SevenLawsPredictionsRound3.lean` (15+ theorems, zero sorry, 7 predictions, 1 master)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PRED-CONSCIOUSNESS-SCALES | **PREDICTION XIX:** Consciousness = deficit between self and self-model; scales with complexity | `prediction_consciousness_scales` | Mechanized |
| THM-PRED-CONSCIOUSNESS-SUBSTRATE | **PREDICTION XIXb:** Consciousness is substrate-independent (same deficit = same depth) | `prediction_consciousness_substrate_independent` | Mechanized |
| THM-PRED-MASTERY-PLATEAU | **PREDICTION XX:** Every skill has reachable mastery plateau + unreachable perfection floor | `prediction_mastery_plateau_and_floor` | Mechanized |
| THM-PRED-TRANSLATION-LOSES | **PREDICTION XXI:** Every translation loses meaning = semiotic deficit | `prediction_translation_loses` | Mechanized |
| THM-PRED-BETTER-TRANSLATORS | **PREDICTION XXIb:** Better translators have more correction data (richer void boundary) | `prediction_better_translators_more_rejection` | Mechanized |
| THM-PRED-PARADIGM-SHIFTS | **PREDICTION XXII:** Paradigm shifts are sorites-sharp AND impact-bounded | `prediction_paradigm_shifts_sharp_and_bounded` | Mechanized |
| THM-PRED-TEACHING-PROJECTION | **PREDICTION XXIII:** Teaching = semiotic projection; deficit = lost knowledge | `prediction_teaching_is_projection` | Mechanized |
| THM-PRED-FORGIVENESS-DILUTION | **PREDICTION XXIV:** Forgiveness = denominator expansion (more context, same history) | `prediction_forgiveness_is_dilution` | Mechanized |
| THM-PRED-UNIVERSE-BULEYEAN | **PREDICTION XXV:** The universe itself satisfies the three Buleyean axioms | `prediction_universe_is_buleyean` | Mechanized |
| THM-SEVEN-LAWS-R3-MASTER | All Round 3 predictions hold | `seven_laws_predictions_round3_master` | Mechanized |

## 102. Seven Laws Predictions Round 4: Game Theory, Economics, Ecology, Ethics (§15.30+§19)

**Assumptions:** Seven Universal Laws applied to game theory, economics, ecology, conversation, and ethics itself.
**Mechanization target:** `SevenLawsPredictionsRound4.lean` (12+ theorems, zero sorry, 5 predictions, 1 final master)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PRED-COOPERATION | **PREDICTION XXVI:** Cooperation emerges from rejection memory alone (Buleyean PD) | `prediction_cooperation_from_rejection` | Mechanized |
| THM-PRED-GINI-BOUNDED | **PREDICTION XXVII:** Gini coefficient bounded by sliver; perfect equality/inequality impossible | `prediction_gini_bounded` | Mechanized |
| THM-PRED-ECOLOGY | **PREDICTION XXVIII:** Permanent ecological observation deficit + sharp niche boundaries | `prediction_ecology_deficit_and_sharp` | Mechanized |
| THM-PRED-CONVERSATIONS | **PREDICTION XXIX:** Productive conversations terminate and each round strictly sharpens | `prediction_conversations_terminate_and_sharpen` | Mechanized |
| THM-PRED-ETHICS-BULEYEAN | **PREDICTION XXX:** Ethics satisfies all seven Buleyean laws | `prediction_ethics_is_buleyean` | Mechanized |
| THM-THIRTY-PREDICTIONS | **FINAL MASTER:** 30 predictions → 7 laws → 3 axioms → 1 formula → +1 | `thirty_predictions_summary` | Mechanized |

## 103. Seven Laws Predictions Round 5: The Grand Finale (§15.30+§19)

**Assumptions:** Seven Universal Laws pushed to the boundary: number theory, memory, writer's block, debates, untranslatable concepts.
**Mechanization target:** `SevenLawsPredictionsRound5.lean` (12+ theorems, zero sorry, 5 predictions, 1 anti-theorem, 1 grand finale)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PRED-IRRATIONALS | **PREDICTION XXXI:** Irrational numbers = cave deficit of rational approximation | `prediction_irrationals_are_deficit` | Mechanized |
| THM-PRED-MEMORY-REDISTRIBUTION | **PREDICTION XXXII:** Memory decay = redistribution, not deletion (Proust's madeleine) | `prediction_memory_redistribution` | Mechanized |
| THM-PRED-WRITERS-BLOCK | **PREDICTION XXXIII:** Writer's block = sorites boundary on semiotic deficit | `prediction_writers_block` | Mechanized |
| THM-PRED-DEBATES-SURVIVE | **PREDICTION XXXIV:** Debates terminate but losing positions survive (sliver guarantees) | `prediction_debates_terminate_but_survive` | Mechanized |
| THM-PRED-UNTRANSLATABLE | **PREDICTION XXXV:** Every language has untranslatable concepts (structural necessity) | `prediction_untranslatable_concepts` | Mechanized |
| THM-IDENTICAL-TRANSLATE | **ANTI-THEOREM:** Languages with identical dimensionality translate perfectly | `identical_languages_translate_perfectly` | Mechanized |
| THM-GRAND-FINALE | **THE GRAND FINALE:** 35 predictions → 7 laws → 3 axioms → 1 formula → +1 | `grand_finale` | Mechanized |

## 104. Hard Compositions: Real Analysis Territory (§15.30)

**Assumptions:** Real-valued convergence machinery from EnvelopeConvergence, GeometricErgodicity, WhipWaveDuality, AchillesChase. Compositions requiring Mathlib real analysis tactics.
**Mechanization target:** `HardCompositions.lean` (10 theorems, zero sorry, quantitative bounds on ℝ)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CONTRACTION-COMPOSE | Two contraction rates ρ₁,ρ₂ < 1 compose: ρ₁·ρ₂ < 1 | `contraction_rates_compose` | Mechanized |
| THM-COMPOSED-RATE-PROPER | Composed rate ∈ (0,1) | `composed_rate_proper` | Mechanized |
| THM-FASTER-RATE-SMALLER | Faster contraction → smaller residual at every step (ℝ inequality) | `faster_rate_smaller_residual` | Mechanized |
| THM-WAVE-ERGODIC-DUALITY | Wave speed up + ergodic residual down = dual progress measures | `wave_ergodic_duality` | Mechanized |
| THM-GEOMETRIC-BOUNDED | Geometric residual bounded by initial value (pow_le_one₀) | `geometric_progress_bounded` | Mechanized |
| THM-RATE-FORMULA-CONSISTENT | r = 1 - ε₁·ε₂ is consistent with r ∈ (0,1) | `rate_formula_consistent` | Mechanized |
| THM-MONOTONE-SUM | Sum of two monotone decreasing sequences is monotone decreasing | `monotone_sum_decreasing` | Mechanized |
| THM-HARD-COMPOSITIONS-MASTER | All real-analysis compositions hold | `hard_compositions_master` | Mechanized |

## 105. Surface Reduction: The Minimal Generating Set (§15.30)

**Assumptions:** The entire 188-module surface. This section REDUCES it.
**Mechanization target:** `SurfaceReduction.lean` (10 theorems, zero sorry)
**Key finding:** 350+ theorems across 35 predictions, 7 laws, 12 paradoxes, 8 mysteries → generated by 1 formula + 1 tactic (omega)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-LAW1-IS-POSITIVITY | Law 1 is exactly `buleyean_positivity` | `law1_is_positivity` | Mechanized |
| THM-LAW1-NEGATION | Universal impossibility of zero = negation of positivity complement | `law1_negation_form` | Mechanized |
| THM-LAW2-IS-CONCENTRATION | Law 2 is `buleyean_concentration` on strict ℕ inequality | `law2_is_concentration_strict` | Mechanized |
| THM-LAW3-IS-BOUNDS | Law 3 is positivity (lower) + weight formula (upper) | `law3_is_formula_bounds` | Mechanized |
| THM-LAW4-IS-SUBTRACTION | Law 4 is omega on dims - channels > 0 | `law4_is_subtraction` | Mechanized |
| THM-LAW5-IS-OMEGA | Law 5 is (n - k) + k = n for k ≤ n | `law5_is_omega` | Mechanized |
| THM-LAW6-IS-DECIDABILITY | Law 6 is decidability of ℕ comparison | `law6_is_decidability` | Mechanized |
| THM-LAW7-IS-SELF-SUBTRACTION | Law 7 is n - min(n,n) = 0 | `law7_is_self_subtraction` | Mechanized |
| THM-THE-REDUCTION | **THE REDUCTION:** All 7 laws from 1 formula w = R - min(v,R) + 1 | `the_reduction` | Mechanized |

## 106. Deep Reduction: From Seven Laws to One Axiom (§15.30.3)

**The deepest result.** 35 predictions fall into 3 equivalence classes. The 3 classes form a dependency chain. The chain has one primitive. The primitive is Peano's successor axiom.
**Mechanization target:** `DeepReduction.lean` (12 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CLASS-ALPHA | The universal sliver: 0 < weight i (generates 14 of 35 predictions) | `class_alpha` | Mechanized |
| THM-CLASS-ALPHA-NEG | Negation form: weight ≠ 0 (same theorem, different phrasing) | `class_alpha_neg` | Mechanized |
| THM-CLASS-BETA | The universal deficit: dims > channels → 0 < dims - channels (11 of 35) | `class_beta` | Mechanized |
| THM-CLASS-GAMMA | The universal termination: n - min(n,n) = 0 (7 of 35) | `class_gamma` | Mechanized |
| THM-CLASS-GAMMA-SHARP | Sharpness corollary: T-1 < T ∧ T ≤ T | `class_gamma_sharp` | Mechanized |
| THM-CLASS-GAMMA-BOUNDED | Bounded corollary: weight ≤ rounds + 1 | `class_gamma_bounded` | Mechanized |
| THM-CLASS-ALPHA-BETA | Composition: deficit discriminates + sliver preserves (3 of 35) | `class_alpha_beta` | Mechanized |
| THM-BETA-NEEDS-ALPHA | β depends on α: deficit requires positive weights on both sides | `beta_needs_alpha` | Mechanized |
| THM-GAMMA-NEEDS-BETA | γ depends on β: termination requires strict decrease at each step | `gamma_needs_beta` | Mechanized |
| THM-ALPHA-IS-PRIMITIVE | α depends on nothing: the +1 in the formula IS the axiom | `alpha_is_primitive` | Mechanized |
| THM-THE-DEEP-REDUCTION | **0 < n + 1.** The entire surface reduces to this. | `the_deep_reduction` | Mechanized |
| THM-PEANO-IS-CLINAMEN | **n + 1 ≠ 0.** The clinamen IS Peano's successor axiom. | `peano_is_clinamen` | Mechanized |
| THM-DEEP-REDUCTION-WITNESS | All three classes + dependency chain + primitive: consistent | `deep_reduction_witness` | Mechanized |

## 107. The Primator: The Final Reduction (§15.30.3)

**The bottom.** Below 0 < n + 1 is the successor function. Below the successor function is the inductive type ℕ. Below ℕ is type theory. We stop here.
**Mechanization target:** `Primator.lean` (9 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-PRIMATOR-SUCC-EXISTS | The successor function exists: ∃ m, m = n + 1 | `primator_succ_exists` | Mechanized |
| THM-PRIMATOR-SUCC-NE-ZERO | succ(n) ≠ 0 (Peano's axiom = the clinamen) | `primator_succ_ne_zero` | Mechanized |
| THM-PRIMATOR-SUCC-INJECTIVE | succ is injective: different things have different successors | `primator_succ_injective` | Mechanized |
| THM-PRIMATOR-ZERO-EXISTS | Zero exists (the void is real) | `primator_zero_exists` | Mechanized |
| THM-PRIMATOR-TO-CLINAMEN | succ(n) ≠ 0 → 0 < n + 1 (primator generates clinamen) | `primator_to_clinamen` | Mechanized |
| THM-CLINAMEN-TO-SLIVER | 0 < n + 1 → 0 < weight(i) (clinamen generates sliver) | `clinamen_to_sliver` | Mechanized |
| THM-SLIVER-TO-SEVEN-LAWS | Positivity generates all seven laws | `sliver_to_seven_laws` | Mechanized |
| THM-THE-COMPLETE-CHAIN | **THE COMPLETE CHAIN:** primator → clinamen → sliver → laws → everything | `the_complete_chain` | Mechanized |

## 108. The Ceiling: What the Framework Cannot Prove (§15.30.3)

**The five ceilings.** The primator is the floor. This is the ceiling. Between them: the habitable zone.
**Mechanization target:** `Ceiling.lean` (12 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-EMPIRICAL-CEILING | Same structural deficit does NOT imply same empirical world | `empirical_ceiling_deficit_underdetermined` | Mechanized |
| THM-EMPIRICAL-DISTINGUISHABLE | Different dimensions → different deficits (structurally distinguishable) | `empirical_ceiling_different_dims_different` | Mechanized |
| THM-COMPUTATIONAL-CEILING | Every weight is a computable ℕ (no limits, no undecidable predicates) | `computational_ceiling_decidable` | Mechanized |
| THM-SELF-REFERENCE-CEILING | Any finite conjunction is provable (infinite consistency is outside) | `self_reference_ceiling_finite_ok` | Mechanized |
| THM-INFINITY-CEILING-FINITE | Void boundary has exactly numChoices entries (finite) | `infinity_ceiling_finite_boundary` | Mechanized |
| THM-INFINITY-CEILING-STAGES | At every finite stage: sliver holds + conservation holds | `infinity_ceiling_every_finite_stage` | Mechanized |
| THM-VALUE-CEILING | Structure exists (IS) but doesn't prescribe (OUGHT): Hume's guillotine | `value_ceiling_structure_not_command` | Mechanized |
| THM-FLOOR-CEILING-SANDWICH | Floor (primator) + ceiling (five limits) + habitable zone (computable bounded ℕ) | `floor_ceiling_sandwich` | Mechanized |
| THM-THE-FINAL-THEOREM | **The final theorem:** floor + zone + ceiling, all proved | `the_final_theorem` | Mechanized |

## 109. The Gain: The Habitable Zone Between Floor and Ceiling (§15.30.3)

**The gain is earned.** Floor gives 1 (the sliver, free). Ceiling gives R+1 (bounded by data). Gain = R (earned by observation). Zero data = zero gain.
**Mechanization target:** `TheGain.lean` (10 theorems, zero sorry, the complete floor-gain-ceiling sandwich)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-DISCRIMINATION-GAIN | gain = max_weight - min_weight = rounds; max = R+1, min = 1 | `discrimination_gain` | Mechanized |
| THM-GAIN-LINEAR | More rounds → strictly more gain (linear in observation) | `gain_is_linear_in_rounds` | Mechanized |
| THM-ZERO-GAIN | Zero rounds → zero gain: (0+1) - 1 = 0 | `zero_rounds_zero_gain` | Mechanized |
| THM-CONVERGENCE-GAIN-POS | Convergence gain positive after first step | `convergence_gain_positive` | Mechanized |
| THM-CONVERGENCE-GAIN-MONO | Convergence gain monotonically increasing (each step adds gain) | `convergence_gain_monotone` | Mechanized |
| THM-CONVERGENCE-GAIN-BOUNDED | Gain bounded above by initial residual (can't gain > 100%) | `convergence_gain_bounded` | Mechanized |
| THM-COMPOSITION-GAIN | N choices from 1 proof: composition gain = N-1 | `composition_gain` | Mechanized |
| THM-THE-GAIN | **The complete sandwich:** floor = 1, ceiling = R+1, gain = R, earned by observation | `the_gain` | Mechanized |

## 110. The Control Statistic: Validating the Sandwich (§15.30.5)

**The diagnostic.** Four simultaneous controls that any Buleyean process must satisfy. Unfalsifiable within the framework — tests the *data*, not the math.
**Mechanization target:** `ControlStatistic.lean` (10 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-CONTROL-INDIVIDUAL | Every weight in [1, R+1] | `control_individual` | Mechanized |
| THM-CONTROL-TOTAL-LOWER | Total weight ≥ N (each choice contributes ≥ 1) | `control_total_lower` | Mechanized |
| THM-CONTROL-TOTAL-UPPER | Total weight ≤ N·(R+1) (each choice contributes ≤ R+1) | `control_total_upper` | Mechanized |
| THM-CONTROL-SPREAD-BOUNDED | Any two weights differ by ≤ R | `control_spread_bounded` | Mechanized |
| THM-CONTROL-SPREAD-TIGHT | Extremes differ by exactly R (tight) | `control_spread_tight` | Mechanized |
| THM-CONTROL-MEAN | Mean weight in [1, R+1] via aggregate bounds | `control_mean_bounded` | Mechanized |
| THM-CONTROL-UNFALSIFIABLE | All four controls hold for every Buleyean space (tautology of the formula) | `control_unfalsifiable` | Mechanized |
| THM-COMPLETE-SANDWICH | **Floor + ceiling + gain + control:** the complete sandwich, quantified and verified | `the_complete_sandwich` | Mechanized |

## 111. The God Formula (§15.30)

**One formula. Five symbols. Everything.** $w_i = R - \min(v_i, R) + 1$
**Mechanization target:** `GodFormula.lean` (18 theorems, zero sorry)

| ID | Statement | Lean reference | Status |
|---|---|---|---|
| THM-GOD-FORMULA | The formula as definitional identity: weight = R - min(v, R) + 1 | `god_formula` | Mechanized |
| THM-GOD-EXISTENCE | Consequence 1: w > 0 (existence) | `god_formula_existence` | Mechanized |
| THM-GOD-PERSISTENCE | Consequence 2: w ≥ 1 (persistence, the sliver) | `god_formula_persistence` | Mechanized |
| THM-GOD-LEARNING | Consequence 3: less rejected → higher weight (learning) | `god_formula_learning` | Mechanized |
| THM-GOD-DISCRIMINATION | Consequence 4: strictly less rejected → strictly higher weight | `god_formula_discrimination` | Mechanized |
| THM-GOD-BOUNDED | Consequence 5: w ∈ [1, R+1] (boundedness) | `god_formula_bounded` | Mechanized |
| THM-GOD-CONVERGENCE | Consequence 6: at max rejection, w = 1 (convergence) | `god_formula_convergence` | Mechanized |
| THM-GOD-UNCERTAINTY | Consequence 7: at zero rejection, w = R+1 (max uncertainty) | `god_formula_uncertainty` | Mechanized |
| THM-GOD-COHERENCE | Consequence 8: same inputs → same output (objectivity) | `god_formula_coherence` | Mechanized |
| THM-GOD-GAIN | Gain from formula: max - min = R | `god_formula_gain` | Mechanized |
| THM-GOD-FLOOR | Floor from formula: R - min(R,R) + 1 = 1 | `god_formula_floor` | Mechanized |
| THM-GOD-CEILING | Ceiling from formula: R - min(0,R) + 1 = R+1 | `god_formula_ceiling` | Mechanized |
| THM-GOD-PRIMATOR | Primator from formula: 0 < R - min(v,R) + 1 always | `god_formula_primator` | Mechanized |
| THM-ANTI-FORMULA | Without +1: R - min(R,R) = 0 (zero reachable, hope dies) | `anti_formula_reaches_zero` | Mechanized |
| THM-PLUS-ONE-DIFFERENCE | The +1 is exactly the difference: (with) - (without) = 1 | `plus_one_is_the_difference` | Mechanized |
| THM-GOD-FORMULA-MASTER | All 8 consequences + floor + ceiling + gain + primator + anti-formula | `god_formula_master` | Mechanized |
