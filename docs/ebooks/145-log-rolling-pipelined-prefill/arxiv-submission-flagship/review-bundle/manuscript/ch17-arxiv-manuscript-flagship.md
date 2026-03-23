# Topological Mismatch in Distributed Inference: Mechanized Models and Protocol-Level Evidence for Fork/Race/Fold Scheduling

*[Taylor William Buley](https://www.patreon.com/cw/twbuley) -- Independent Researcher*  
*[taylor@forkjoin.ai](mailto:taylor@forkjoin.ai)*

## Abstract

Path-like execution can impose avoidable coordination cost when the workload's natural structure has multiple useful paths. This paper studies that mismatch in a finite-DAG fork/race/fold model using the diagnostic Delta_beta = beta_1* - beta_1^exec, computed from bounded workload/execution graph pairs under a correctness envelope C1-C4. The novelty claim is not pipelining, DAG scheduling, or stream multiplexing by themselves. The main formal result is an adequacy trichotomy for emitted Aeon Flux sites: nonpositive deficit iff a lossless transport realization exists, zero deficit iff a tight lossless realization exists, and positive deficit forces path collision and information loss within the declared model class. The engineering surface instantiates that model in distributed staged computation and Aeon Flow transport, and a compiler-emitted WallingtonRotation witness pair reports matched pathCount = 4, streamCount = 4, Delta_beta = 0 and collided pathCount = 4, streamCount = 2, Delta_beta = 2 cases. In the companion artifacts, 8/8 primary wall-clock cells pass with median speedups 11.785x-21.620x, and an Aeon Flow versus HTTP/3 protocol corpus over 144 sites and 12,371 resources shows a 72.252% median framing gain with positive completion-latency gains across all 6 primary environments. The claim is local: bounded graph pairs and emitted witnesses make Delta_beta operational enough to distinguish structural path collapse from within-class protocol cost.

## 1. Problem and Claim

**Thesis.** Path-like execution topologies impose avoidable coordination cost when the workload's natural structure has positive parallel-path complexity.

The target is narrow: distributed inference and the transport surface that carries it across machines. A staged inference workload can contain branch points, joins, and independent paths that are correct to keep alive simultaneously. A path-like runtime collapses that structure into one ordered line. Sometimes that is the right topology. Sometimes it is a mismatch that inserts waiting, framing waste, or unnecessary synchronization even though the workload itself would allow more structure.

This paper isolates that mismatch as a bounded structural question. The diagnostic is `Delta_beta`, the difference between workload-side path demand and runtime-side path budget at one declared abstraction layer. The main paper-side claim is stronger than "parallelism helps." Within the declared Aeon Flux site model, `Delta_beta` is an obstruction variable:

1. `Delta_beta <= 0` iff a lossless transport realization exists.
2. `Delta_beta = 0` iff a tight lossless transport realization exists.
3. `Delta_beta > 0` forces path collision and information loss.

That theorem family is the center of the flagship. The scheduler and protocol sections exist to show that the obstruction is not only formal. A staged runtime can expose useful paths and then lose them again at the wire if the transport silently reserializes the flow. Conversely, a stream-preserving transport cannot help if the scheduler never exposes more than one useful path. The paper therefore studies one coupled execution surface: scheduler plus transport.

The contribution is intentionally small.

1. It gives a finite-DAG fork/race/fold model with an explicit correctness envelope C1-C4.
2. It operationalizes `Delta_beta` on bounded workload/execution graph pairs instead of leaving it as prose.
3. It proves the adequacy trichotomy above for emitted Aeon Flux sites and shows a matched/collided emitted `WallingtonRotation` witness pair.
4. It tests the same bridge with bounded wall-clock evidence, protocol-corpus evidence, and a one-path boundary control.

The paper therefore does not ask novelty credit for overlap, dataflow, or stream multiplexing in isolation. If the adequacy trichotomy and the emitted witness bridge were removed, the remaining artifact would be a bounded scheduler-and-protocol note. The flagship claim, if it earns any novelty credit at all, is narrower: the same deficit quantity appears as a graph-pair diagnostic, the antecedent of an existence/impossibility theorem, and the payload of a compiler-emitted witness consumed by the paper.

The flagship stays short on purpose because the claim is local and falsifiable. If the argument cannot survive as one theorem family, one emitted witness, and two bounded gates, then it is not yet ready for publication.

## 2. Model and Notation

### 2.1 Finite DAG Scheduling Surface

Let `G = (V, E)` be a finite DAG representing a bounded execution slice. Nodes denote local computations or transport actions. Edges denote causality. A fork node has out-degree greater than one, a fold node has in-degree greater than one, and a linear chain has in-degree and out-degree at most one. The model uses four primitives:

1. `Fork(S, O) -> {S_1, ..., S_k}` creates branch-local states.
2. `Race({S_i}) -> (S_w, i_w)` advances branches concurrently and accepts the first valid completion.
3. `Fold({S_i}, f) -> S*` merges branch outcomes with a deterministic fold function `f`.
4. `Vent(S_i) -> bottom` terminates a branch without corrupting its siblings.

The paper does not need a larger primitive set. The local questions are scheduling questions: when is a path split useful, when does a branch need an all-branch fold, and when can an execution surface safely accept early completion or local failure?

### 2.2 Parallel-Path Complexity and Delta_beta

Let `beta_1*` denote the workload-side path demand at the abstraction layer under study, and let `beta_1^exec` denote the path budget exposed by the execution topology at that same layer. The diagnostic is

$$
\Delta_\beta = \beta_1^* - \beta_1^{\mathrm{exec}}.
$$

If `Delta_beta = 0`, the schedule is structurally matched at that layer. If `Delta_beta > 0`, the execution surface is narrower than the modeled workload. The diagnostic is directional and local. It is not a universal system score.

To keep that claim falsifiable, the paper uses one explicit extraction rule. Fix one abstraction layer and one bounded execution slice. Build a workload graph `G*` whose nodes are bounded events and whose edges are only the dependencies required for correctness at that layer. Build an effective execution graph `G^exec` for the same slice after scheduler and transport ordering have been applied. Then compute

$$
\beta_1(G) = \max(0, |E| - |V| + \beta_0(G))
$$

on each graph, using the same event vocabulary on both sides. In this paper `beta_1` is not presented as a universal measure of executable multiplicity in every model. It is the bounded graph-side quantity used by the adequacy theorem and the emitted witness surface.

A worked example is enough to show the rule. A 10-stream fork/join workload has `|V| = 12`, `|E| = 20`, and `beta_0 = 1`, so `beta_1* = 9`. If an ordered single-pipe transport forces the same slice into a chain, then `|E| = 11`, `beta_1^exec = 0`, and `Delta_beta = 9`. If the transport preserves the same 10 branch-local streams through independent recovery, then `beta_1^exec = 9` and `Delta_beta = 0`. This graph-pair rule is the operational meaning of the diagnostic throughout the flagship.

The extraction rule is deliberately small.

1. Declare one abstraction layer and one event vocabulary.
2. Build `G*` using only the dependencies required for correctness at that layer.
3. Build `G^exec` for the same slice after scheduler and transport ordering have been applied.
4. Compute `beta_1(G*)` and `beta_1(G^exec)` on the same bounded event set.
5. Report `Delta_beta = beta_1* - beta_1^exec`, and if the slice is an emitted Aeon Flux site, compare the resulting `pathCount` and `streamCount` against the adequacy regime.

Three execution classes matter in this paper.

| Execution class | Informal topology | Typical `beta_1^exec` reading | Use in this paper |
|---|---|---:|---|
| Sequential path | one ordered line | `0` | boundary case |
| Chunked pipeline | stage-local concurrency without workload branching | positive but bounded by stage occupancy | staged baseline |
| Fork/race/fold schedule | explicit branch, race, and deterministic collapse surface | matched to positive `beta_1*` when the workload contains multiple useful paths | target topology |

The flagship claim is not that every problem has positive `beta_1*`. Some workloads are truly path-like. For those, `Delta_beta = 0` under a sequential schedule and no theorem in this paper predicts a structural win from adding concurrency.

The paper also does not ask `Delta_beta` to replace serial-fraction or occupancy language. Those metrics answer different questions.

| Quantity | Useful for | What it does not localize |
|---|---|---|
| serial fraction | classical scaling ceilings | whether the serial bottleneck was demanded by the workload or inserted by the execution surface |
| occupancy / utilization | idle-slot and saturation diagnosis | whether a lower layer silently collapsed visible path structure |
| `Delta_beta` | locating missing path budget on a bounded slice | absolute system quality or a universal speedup scalar |

`Delta_beta` earns its keep when concurrency is visible in the workload graph and absent in the effective execution graph at the same time.

### 2.3 C1-C4 Correctness Envelope

The finite DAG model is used only inside the following correctness envelope.

| Condition | Statement | Operational reading |
|---|---|---|
| C1 | Constraint locality | Stage-local ordering is sufficient for global correctness. |
| C2 | Branch isolation | A vented branch cannot corrupt sibling branches. |
| C3 | Deterministic fold | The merge function is deterministic on the admitted branch outputs. |
| C4 | Termination | Every branch completes, vents, or times out in finite time. |

These are not cosmetic assumptions. If C1 fails, the system may require a stronger global order than the schedule preserves. If C2 fails, a local rejection can leak damage sideways. If C3 fails, fold introduces ambiguity rather than removing it. If C4 fails, the path budget never collapses and the schedule cannot be treated as a bounded computation.

Within the formal companion, C1-C4 are checked in two ways. TLA+ models make them explicit as state invariants or progress constraints on bounded executions. Lean 4 theorem schemas supply the quantitative consequences that depend on those conditions. The paper uses only the part of that surface needed for the pipeline and protocol claims below.

### 2.4 Pipeline Variables

For a prompt or batch with `P` items, chunk size `B`, stage count `N`, and chunk count

$$
Q = \lceil P / B \rceil,
$$

the chunked pipeline time under the modeled schedule is

$$
T_{\mathrm{pipe}} = Q + N - 1,
$$

while the fully serialized baseline is

$$
T_{\mathrm{seq}} = P \cdot N.
$$

The step-count speedup under the stated idealization is therefore

$$
\mathrm{speedup} = \frac{P \cdot N}{\lceil P/B \rceil + N - 1}.
$$

The model uses two explicit assumptions for this equation.

1. A1: per-chunk stage service times are homogeneous across stages.
2. A2: inter-stage communication and synchronization cost is zero.

Those assumptions matter. The step-count theorem is a model claim about scheduling shape, not a promise that real deployments will achieve the same scalar under arbitrary transport, compute heterogeneity, or loss.

### 2.5 Reynolds Regimes

The pipeline Reynolds number is defined as

$$
Re = N / Q.
$$

This quantity measures how dense the pipeline is in stages per chunk. Low `Re` means many chunks relative to stage count, which pushes the system toward steady-state occupancy. High `Re` means few chunks relative to stage count, which magnifies ramp-up and drain effects.

Figure 1 is a supporting model-side picture rather than a second contribution claim. It carries the inverted-scaling workload curves and the regime map induced by `Re`.

![Figure 1. Inverted scaling and Reynolds regime map from the Chapter 17 companion artifacts. The same analytic surface supports the speedup ceiling, the speedup floor, and the regime thresholds used to classify laminar, transitional, and turbulent execution.](companion-tests/artifacts/ch17-inverted-scaling-reynolds-figure.png)

## 3. Formal Results

### 3.1 Correctness Under Finite DAG Decomposition

The first theorem surface is sufficiency, not universality. Under finite-DAG decomposition and C1-C4, fork/race/fold scheduling can preserve correctness without requiring a globally serialized path. The paper does not claim a completeness theorem for all distributed systems. It uses the narrower constructive claim that a bounded workload can be decomposed into linear chains, fork points, and join points, and that the scheduler may operate on that decomposition without changing the result when the four conditions hold.

That surface answers the first question: is the richer schedule well-defined? The remaining results address the second question: when does the richer schedule matter?

### 3.2 Pipeline Speedup Floor and Sandwich

The core scheduling theorem used here is `THM-PIPELINE-SPEEDUP-FLOOR` from `Multiplexing.lean`. Under A1-A2, the pipelined time never exceeds the serialized time:

$$
\lceil P/B \rceil + N - 1 \le P \cdot N.
$$

This is the lower side of the speedup sandwich. The upper side comes from the large-`P` limit:

$$
\mathrm{speedup} \to B \cdot N \quad \text{as } P \to \infty.
$$

Together these yield the bounded interval

$$
1 \le \mathrm{speedup} \le B \cdot N.
$$

The value of the theorem is not that the ceiling is surprising. The value is that the floor is explicit. A staged pipeline under the modeled assumptions is structurally non-worse than the serialized baseline. If the workload admits a pipeline and the deployment still measures a loss, that loss is evidence against the assumptions or evidence that the deployed schedule is not the one the model claims to analyze.

The companion packages both the floor and the strict-speedup refinement. The strict version applies for `P >= 2` and `N >= 2`, ruling out the degenerate single-item and single-stage boundaries where the pipeline collapses to the path.

### 3.3 Reynolds Classification

The second theorem family is a supporting classifier for execution regimes. The mechanized claim used here is operational:

1. `Re < 1/3` is laminar.
2. `1/3 <= Re < 2/3` is transitional.
3. `Re >= 2/3` is turbulent.

The companion theorem names `reynolds_regime_exhaustive`, `classifyRegime`, and `turbulent_collapse_floor` are used because they make the schedule-level consequence explicit: the regime is not only a label, it constrains which fold policies are safe and how much collapse work the runtime should expect to pay.

The practical use of the classification is modest. It turns the sentence "this pipeline is too thin to keep stages busy" into a falsifiable condition on `N/Q`. The paper does not need a fluid identity claim. It only needs the regime map as a schedule-selection tool for interpreting Gate1.

### 3.4 Aeon Flux Site Adequacy

The central theorem family in the flagship is now the emitted-site adequacy surface. For positive-stream-budget Aeon Flux sites, the mechanized trichotomy is:

1. `Delta_beta <= 0` iff a lossless FlowFrame transport realization exists.
2. `Delta_beta = 0` iff a tight lossless realization exists.
3. `Delta_beta > 0` forces path collision and positive information loss for every realization in the model class.

This is the point at which `Delta_beta` stops being a descriptive label and becomes an obstruction variable. Once `pathCount` and `streamCount` are emitted from lowered GG, the deficit is no longer being inferred from benchmark scalars or read off diagrams by hand. It is a concrete input to a proved trichotomy.

The importance of that result is narrow but decisive. The paper no longer asks the reader to believe that positive deficit merely "sounds like" trouble. Within the declared site model, positive deficit means lossless transport is impossible. Zero deficit means tight lossless transport is possible. That is the exact coup de grace the flagship needs.

That is also the boundary against the obvious relabeling objection. Classical DAG scheduling already says that richer dependency structure can matter. The claim here is not merely that the graph has branches. It is that one emitted, bounded quantity is sufficient to state an iff adequacy result for the declared site model and to classify concrete lowered sources without hand interpretation.

### 3.5 What the Formal Surface Certifies

The formal surface certifies an existence/impossibility claim in the declared site model. It does not certify wall-clock speedups, and it does not certify Gate2 latency numbers. Those are measured. The theorem family tells us which transport regimes are structurally possible, and the gates tell us how the deployed scheduler and protocol behave inside those regimes.

That distinction matters for the protocol story. In the flagship, the transport-side formal anchor is the Aeon Flux site adequacy theorem plus executable framing/stream tests. Gate2 then asks a narrower empirical question: once stream preservation has been separated from gross path collapse, does Aeon Flow still reduce residual framing and completion cost relative to explicit `HTTP/3` baselines on the declared corpus?

## 4. Systems Instantiation

### 4.1 Distributed Staged Computation

The concrete scheduler studied in the companion is distributed staged computation for inference prefill. Prompt chunks move across stage nodes. Each node preserves stage-local order for the stream it owns, while the overall runtime overlaps multiple chunks across stages. This is exactly the sort of setting where C1 matters: correctness follows from local ordering rather than from a single total order over all work in flight.

At the implementation level the schedule is a chunked pipeline rather than a speculative executor. A chunk enters stage 1, advances when that stage is free, and continues through the remaining stages while later chunks begin behind it. The modeled makespan is the `Q + N - 1` surface from Section 2.4. The measured wall-clock evidence later in the paper tests whether the deployed system preserves enough of that shape to separate chunked execution from the serialized baseline.

### 4.2 Emitted Witness Pair from Lowered GG

The flagship now uses a matched pair of compiler-emitted witnesses rather than only a verbal example. From two minimal `WallingtonRotation` sources in the companion artifact directory, the Gnosis/Aeon Forge exporter emits the following Aeon Flux site witnesses:

| Site | Primitive id | `pathCount` | `streamCount` | `Delta_beta` | Regime | Theorem ref |
|---|---|---:|---:|---:|---|---|
| matched site | `rotated_output` | `4` | `4` | `0` | `tight_lossless_transport_exists` | `aeon_flux_site_zero_deficit_iff_tight_lossless_transport` |
| collided site | `collapsed_output` | `4` | `2` | `2` | `collision_and_information_loss_forced` | `aeon_flux_site_positive_deficit_forces_collision_and_information_loss` |

This table is intentionally plain. It is the concrete object the theorem talks about. The paper no longer needs to ask the reader to imagine what matched and collided sites look like. It points to lowered source files and emitted witness packets for both.

### 4.3 Transport Scope and Explicit Baseline

The scheduler runs over Aeon Flow, a binary framing layer whose unit of transport is a `FlowFrame` with a 10-byte header:

1. `stream_id`: 2 bytes
2. `sequence`: 4 bytes
3. `flags`: 1 byte
4. `length`: 3 bytes

That fact matters because the protocol question here is not only throughput. It is whether the transport preserves enough path structure for the scheduler to remain visible at the wire. Gate2 uses an explicit `HTTP/3` baseline, and the claim is narrow: once stream preservation has already been separated from gross path collapse, Aeon Flow may still reduce residual framing and completion cost.

## 5. Evaluation

### 5.1 Evaluation Policy

Only artifact-backed quantitative claims are used in the flagship body. The evaluation surface is intentionally small:

1. one emitted witness pair from lowered GG;
2. bounded graph-pair and one-path controls;
3. Gate1 for wall-clock staged execution;
4. Gate2 for protocol-corpus framing and completion behavior.

The paper only makes claims attached to an anchor, an observable, and a failure condition.

| Paper-side claim | Anchor | Observable used here | What would count against the claim |
|---|---|---|---|
| emitted sites can classify `Delta_beta` by theorem regime rather than by prose | Aeon Flux site adequacy theorems plus emitted witness export | the `WallingtonRotation` witness packet | emitted `pathCount`, `streamCount`, and theorem regime disagree |
| `Delta_beta` can be computed on bounded graph pairs | workload/execution graph comparison over explicit traces | exact recovery of one-path, ordered-pipe-collapse, and per-stream-preserving cases | graph pairs fail to separate `Delta_beta = 0` from positive-deficit cases |
| chunked staged execution can remove path-imposed coordination cost under A1-A2 | pipeline floor and sandwich theorem family | Gate1 latency separation between serialized and chunked execution | chunked execution fails to separate from, or reverses against, the serialized baseline on the primary cells |
| once stream preservation is already present, protocol structure still changes residual coordination cost | FlowFrame protocol checks plus Gate2 corpus harness (`Aeon Flow` versus `HTTP/3`) | Gate2 framing and completion behavior across the primary environment matrix | framing or completion gains collapse against the explicit HTTP/3 baseline |

### 5.2 Emitted Witness and Boundary Checks

Before reading the deployment gates, the paper fixes the diagnostic on explicit witnesses and graph pairs.

| Case | `beta_1*` or `pathCount` | `beta_1^exec` or `streamCount` | `Delta_beta` | Reading |
|---|---:|---:|---:|---|
| emitted matched site | `4` | `4` | `0` | tight zero-deficit witness from lowered GG |
| emitted collided site | `4` | `2` | `2` | positive-deficit witness; the emitted site itself falls into the collision regime |
| one-path chain | `0` | `0` | `0` | exact parity boundary; no structural win is predicted |
| 10-stream fork/join over one ordered pipe | `9` | `0` | `9` | positive mismatch; the transport has collapsed visible concurrency back into one path |
| 10-stream fork/join over per-stream recovery (`HTTP/3` or `Aeon Flow`) | `9` | `9` | `0` | stream independence is preserved; remaining differences are protocol cost |

This is the direct operational check for the diagnostic. `Delta_beta` is not being reverse-engineered from Gate1 or Gate2 outcomes. It is being computed on bounded graph pairs first and emitted witness packets second. The matched/collided witness pair matters because it shows the adequacy theorem classifying concrete lowered sources on both sides of the boundary instead of only on the zero-deficit side.

The same surface also predicts the no-win boundary. In the companion, the one-path control is realized as single-chunk execution `Q = 1`, and the pipeline equation recovers the serial `N`-step path:

$$
T_{\mathrm{pipe}} = Q + N - 1 = 1 + N - 1 = N.
$$

There is no hidden speedup term left once the path budget has collapsed to one. This is a control, not a headline result. It shows that the flagship is allowed to predict parity.

### 5.3 Gate1: External Multi-Host Wall-Clock Evidence

Gate1 measures chunked versus serialized execution on an external multi-host setup. The flagship uses the external multi-host report because it is the cleanest bridge from the formal pipeline model to deployed staged execution. The artifact uses two workloads, multiple RTT and loss settings, bootstrap confidence intervals, and six distinct endpoint hosts.

The result is simple and strong. 8/8 primary Gate1 cells pass. Across those primary cells, the median speedup range is 11.785x-21.620x. The minimum primary-cell speedup CI low is 11.365x. Across the full ten-cell matrix, the minimum latency-improvement CI low is 3561 ms.

Those numbers matter for two reasons. First, they are comfortably above the speedup floor. The deployment is not merely avoiding regressions; it is showing a large, repeated separation from the serialized baseline. Second, the range widens as the workload gets larger in stage count and token count, which is exactly the direction predicted by the modeled step-count surface.

The Gate1 figure is the most direct empirical view of the scheduling claim.

Figure 2 shows the deployed wall-clock separation that corresponds to the model-side speedup surface.

![Figure 2. Gate1 wall-clock evidence from the Chapter 17 companion artifacts. The chart summarizes the ten-cell external multi-host matrix and shows the separation between serialized and chunked execution together with bootstrap speedup intervals.](companion-tests/artifacts/ch17-gate1-wallclock-figure.png)

The flagship does not claim that the Gate1 scalar is a universal constant. The point is narrower: on a bounded external deployment surface, the measured behavior matches the qualitative prediction of the formal scheduler. A path-like baseline is paying coordination cost that the staged schedule avoids.

### 5.4 Gate2: Protocol-Corpus Evidence

Gate2 tests the transport side of the bridge on a seeded heterogeneous corpus. The corpus contains 144 sites and 12,371 resources, and the six primary environments span increasing RTT, decreasing bandwidth, and rising loss. The explicit baseline is `HTTP/3`. That distinction matters. Gate2 is not where the paper establishes the positive-deficit ordered-pipe collapse case; the companion boundary checks already do that on bounded graph pairs. Gate2 asks the narrower question of within-class protocol efficiency: once the transport is already stream-preserving, do Aeon Flow's framing and fold semantics still improve framing and completion behavior relative to `HTTP/3` across the declared impairment matrix?

Again the result is compact. 6/6 primary Gate2 cells pass. The framing median gain is 72.252%, and the minimum primary-cell framing CI low is 72.19%. At the benign primary edge, the `rtt12-bw80-loss0` environment still yields 23.62 ms median completion gain and 23.79 ms p95 completion gain. At the harsh primary edge, `rtt110-bw7-loss2pct` yields 92.39 ms median completion gain and 110.5 ms p95 completion gain.

The framing gain is nearly invariant across environments because it is dominated by the declared framing models rather than by network impairment. The completion gains are the network-sensitive part, and they widen as impairment increases. The flagship therefore reads Gate2 narrowly and honestly: after the path-collapse boundary has been separated elsewhere, protocol structure still changes the residual coordination cost of carrying the staged workload over the wire.

Figure 3 makes the split visible: nearly constant framing advantage, widening completion advantage.

![Figure 3. Gate2 protocol-corpus evidence from the Chapter 17 companion artifacts. The chart separates framing gains from completion gains across the heterogeneous site corpus and shows that the protocol advantage persists across all six primary environments.](companion-tests/artifacts/ch17-gate2-protocol-corpus-figure.png)

### 5.5 Interpreting the Evaluation Surface Together

The emitted witness, graph-pair checks, Gate1, and Gate2 do different jobs.

1. The emitted witness shows that a lowered site can be assigned a theorem regime directly.
2. The graph-pair checks separate one-path, ordered-pipe-collapse, and per-stream-preserving cases before any deployment scalar is discussed.
3. Gate1 checks the staged scheduler against the serialized baseline.
4. Gate2 checks Aeon Flow against the explicit `HTTP/3` baseline once the gross collapse-vs-preservation question has already been isolated.
5. The one-path control checks that the same surface predicts the no-gain case when the path budget really is one.

Taken together they support one bounded conclusion: `Delta_beta` is operational enough to separate positive-deficit path-collapse cases from matched cases, and on that foundation the staged runtime plus transport surface shows artifact-backed reductions in observed coordination cost. That is the precise role of `Delta_beta` in the flagship: not a one-number oracle, but a way to state where missing path budget is being inserted.

## 6. Limitations and Non-Claims

The flagship deliberately narrows scope. The following boundaries are part of the claim, not footnotes to it.

1. The model is a finite DAG model. Infinite-state, adversarially adaptive, or unrestricted asynchronous systems are outside the direct theorem surface used here.
2. The graph-side `beta_1` used here is a bounded site metric, not a claim that one topological object canonically measures executable multiplicity in every system model.
3. The emitted witness path shown in the flagship is currently scoped to lowered `WallingtonRotation` sites. The theorem family is broader than that one example, but the paper only needs one emitted witness.
4. The pipeline speedup formula is a modeled step-count claim under A1-A2. It is not a universal wall-clock predictor.
5. `Delta_beta` is an obstruction variable inside the declared model, not a one-number oracle for system quality.
6. Gate1 is a bounded external multi-host matrix, not a claim about every deployment.
7. Gate2 is a seeded heterogeneous corpus with explicit impairment environments, and its protocol comparison is Aeon Flow versus `HTTP/3` rather than a universal transport shootout. Its framing gain is partly structural from declared framing models; its completion gains are the network-sensitive measurements.
8. The paper does not claim universal superiority of richer schedules. For small workloads, extremely fast serial paths, or high coordination overhead, the correct topology may be `beta_1 = 0`.
9. No body claim in this paper depends on extra-domain correspondence surfaces outside distributed systems and bounded protocol models.

These limitations sharpen the result rather than weaken it. The claim is strong precisely because it stays local.

## 7. Related Work

This section is intentionally not a survey. It covers only the literatures needed to identify the incremental claim of the flagship.

The speedup formulas in this paper sit beside, not above, the classical scaling laws. Amdahl studies fixed-workload speed limits under an explicit serial fraction, while Gustafson reframes the bound under scaled workloads [1, 2]. Those laws remain the right tools for ceiling questions. The current paper adds a different question: when is part of the apparent serial bottleneck being inserted by the execution surface rather than demanded by the workload?

The scheduling model is likewise adjacent to older work on explicit concurrency surfaces. Kahn process networks, early dataflow architectures, micropipelines, and MapReduce all make it natural to reason over bounded dependency graphs and fork/fold structure rather than one total order [3-6]. The flagship does not claim novelty for DAG execution itself. Its narrower claim is that separating workload-side path demand from runtime-side path budget, then binding that gap to an adequacy theorem and an emitted witness, makes certain failures easier to localize.

Put differently, prior work already supplies the language of explicit concurrency. The flagship only claims one extra step beyond that language: the deficit is not merely descriptive but theorem-bearing in the emitted site model. If that step is uninteresting, then the paper should be read as a small notation result rather than as a new scheduler theory.

The protocol side belongs to a familiar lineage as well. HTTP/2 reduces framing waste and introduces application-layer multiplexing, while QUIC moves recovery and ordering decisions closer to individual streams [8, 9]. The paper does not claim to supersede that literature. Its narrower claim is that, for the scheduler-plus-transport bridge studied here, it is useful to distinguish gross path preservation from within-class protocol cost instead of blending both questions into one benchmark.

Finally, the formal-methods layer is deliberately conventional in the best sense. TLA+ and related specification practice already provide a language for bounded safety and progress arguments [7]. The novelty claim here is not "formal methods for systems" in general. It is the tighter connection between one bounded theorem family, one emitted witness surface, and a small set of measured observables, all backed by a public rerun surface rather than by prose alone [10].

## 8. Conclusion

Path-like execution topologies impose avoidable coordination cost when the workload's natural structure has positive parallel-path complexity.

That sentence is the whole paper. The finite-DAG model provides the vocabulary. C1-C4 provide the correctness envelope. The pipeline floor and Reynolds classification provide the scheduler-side quantitative surface. The Aeon Flux site adequacy theorem turns `Delta_beta` into an obstruction result. The emitted `WallingtonRotation` witness shows the theorem on a concrete lowered source. Gate1 and Gate2 then show that the bridge is not only formal: the staged runtime and the protocol layer both exhibit artifact-backed gains on bounded evaluation surfaces.

The result is narrow, and that is the point. One does not need a universal theory of computation to say something useful about topological mismatch in distributed inference. One needs one theorem family, one emitted witness, explicit assumptions, and measured evidence. If the theorem-plus-witness bridge is judged unimportant, the paper fails on novelty. If it is judged useful, the claim is already as small as it should be.

## Appendix A: Theorem-to-Artifact Map

| Local claim in flagship | Theorem or artifact family | Concrete artifact |
|---|---|---|
| finite DAG scheduling under explicit decomposition assumptions | executable finite-DAG decomposition surface | `companion-tests/src/dag-completeness.test.ts` |
| C1-C4 correctness envelope | bounded TLA+ and Lean scheduler surface | `TemporalModel` companion modules plus `@a0n/aeon-logic` rerun path |
| pipeline floor `T_pipe <= T_seq` | `THM-PIPELINE-SPEEDUP-FLOOR` | `formal/lean/Multiplexing.lean` |
| speedup interval `1 <= speedup <= B*N` | `pipeline_speedup_floor`, `pipeline_strict_speedup`, `pipeline_speedup_sandwich` | `formal/lean/Multiplexing.lean`, `formal/lean/PredictionsRound15.lean` |
| Reynolds regime cut points | `reynolds_regime_exhaustive`, `classifyRegime`, `turbulent_collapse_floor` | `formal/lean/ReynoldsBFT.lean`, `companion-tests/artifacts/ch17-inverted-scaling-reynolds-figure.{json,md,png,svg}` |
| Aeon Flux site adequacy trichotomy | `aeon_flux_site_nonpositive_deficit_iff_lossless_transport`, `aeon_flux_site_zero_deficit_iff_tight_lossless_transport`, `aeon_flux_site_positive_deficit_forces_collision_and_information_loss` | `formal/lean/Lean/ForkRaceFoldTheorems/AeonFluxSiteAdequacy.lean`, `open-source/gnosis/examples/proofs/AeonFluxSiteAdequacy-lean.gg` |
| emitted matched/collided witness pair from lowered GG | Gnosis/Aeon Forge site witness export | `companion-tests/artifacts/ch17-wallington-rotation-site.gg`, `companion-tests/artifacts/ch17-wallington-rotation-site-witness.{json,md}`, `companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site.gg`, `companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site-witness.{json,md}` |
| operational `Delta_beta` extraction from bounded graph pairs | workload/execution graph comparison over explicit traces | `companion-tests/src/deficit-evidence.test.ts` |
| 10-byte FlowFrame header and stream semantics | framing law plus runtime protocol tests | `companion-tests/src/flow-protocol.test.ts` |
| one-path boundary recovers sequential execution | explicit `beta_1 = 0` boundary check | `companion-tests/src/pipeline-topology.test.ts` |
| deployed scheduler evidence | Gate1 wall-clock matrix | `companion-tests/artifacts/gate1-wallclock-external-multihost.json`, `companion-tests/artifacts/ch17-gate1-wallclock-figure.{json,md,png,svg}` |
| deployed protocol evidence | Gate2 protocol corpus | `companion-tests/artifacts/gate2-protocol-corpus.json`, `companion-tests/artifacts/ch17-gate2-protocol-corpus-figure.{json,md,png,svg}` |

## Appendix B: Reproduction Surface

The flagship paper has its own build and validation path so that it can be checked independently from the full theory chapter.

### Build

```bash
pnpm run manuscript:arxiv:flagship:tex
pnpm run manuscript:arxiv:flagship:build
pnpm run manuscript:arxiv:flagship:package
```

### Emitted witness rerun

```bash
pnpm --dir apps/aeon-forge exec bun src/cli/cli.tsx topology analyze \
  /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-site.gg \
  --format summary

pnpm --dir apps/aeon-forge exec bun src/cli/cli.tsx topology export \
  /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-site.gg \
  --format json \
  --out /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-site-witness.json

pnpm --dir apps/aeon-forge exec bun src/cli/cli.tsx topology export \
  /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-site.gg \
  --format markdown \
  --out /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-site-witness.md

pnpm --dir apps/aeon-forge exec bun src/cli/cli.tsx topology analyze \
  /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site.gg \
  --format summary

pnpm --dir apps/aeon-forge exec bun src/cli/cli.tsx topology export \
  /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site.gg \
  --format json \
  --out /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site-witness.json

pnpm --dir apps/aeon-forge exec bun src/cli/cli.tsx topology export \
  /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site.gg \
  --format markdown \
  --out /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site-witness.md
```

### Targeted manuscript validation

```bash
pnpm --dir open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests exec vitest run \
  src/manuscript-flagship-structure.test.ts \
  src/manuscript-flagship-artifact-consistency.test.ts \
  src/manuscript-flagship-hardening.test.ts
```

### Supporting scheduler and protocol checks

```bash
pnpm --dir open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests exec vitest run \
  src/dag-completeness.test.ts \
  src/pipeline-formulas.test.ts \
  src/pipeline-topology.test.ts \
  src/deficit-evidence.test.ts \
  src/flow-protocol.test.ts \
  src/ch17-gate1-wallclock-figure.test.ts \
  src/ch17-gate2-protocol-corpus-figure.test.ts
```

### Packaged submission helper

```bash
bash open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/arxiv-submission-flagship/prepare-arxiv.sh
```

The flagship uses the same checked-in companion artifact directory as the full chapter. It does not define a second artifact format. The difference is only the manuscript selection, the narrowed claim surface, and the dedicated build and packaging entrypoints.

## References

[1] G. M. Amdahl, "Validity of the Single Processor Approach to Achieving Large-Scale Computing Capabilities," *AFIPS Spring Joint Computer Conference*, 30:483-485, 1967.

[2] J. L. Gustafson, "Reevaluating Amdahl's Law," *Communications of the ACM*, 31(5):532-533, 1988.

[3] G. Kahn, "The Semantics of a Simple Language for Parallel Programming," *IFIP Congress*, 1974.

[4] J. B. Dennis, D. P. Misunas, "A Preliminary Architecture for a Basic Data-Flow Processor," *Proceedings of the 2nd Annual Symposium on Computer Architecture*, 1975.

[5] I. E. Sutherland, "Micropipelines," *Communications of the ACM*, 32(6):720-738, 1989.

[6] J. Dean, S. Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters," *OSDI*, 2004.

[7] L. Lamport, *Specifying Systems: The TLA+ Language and Tools for Hardware and Software Engineers*, Addison-Wesley, 2002.

[8] M. Belshe, R. Peon, M. Thomson, "Hypertext Transfer Protocol Version 2 (HTTP/2)," RFC 7540, 2015.

[9] J. Iyengar, M. Thomson, "QUIC: A UDP-Based Multiplexed and Secure Transport," RFC 9000, 2021.

[10] T. W. Buley, "Aeon Clockwork: A Unified Probability Engine with Immanent Self-Verification," open-source implementation, 2026. [https://github.com/forkjoin-ai/aeon-clockwork](https://github.com/forkjoin-ai/aeon-clockwork)
