# Topological Mismatch in Distributed Inference: Mechanized Models and Protocol-Level Evidence for Fork/Race/Fold Scheduling

*[Taylor William Buley](https://www.patreon.com/cw/twbuley) -- Independent Researcher*  
*[taylor@forkjoin.ai](mailto:taylor@forkjoin.ai)*

## Abstract

Path-like execution can impose avoidable coordination cost when the workload's natural structure has positive parallel-path complexity. This paper studies that mismatch in a finite-DAG fork/race/fold model using the diagnostic Delta_beta = beta_1* - beta_1^exec, operationalized by bounded graph extraction at a fixed layer, and a correctness envelope C1-C4. Within that modeled scope, the paper proves a pipeline speedup floor and sandwich, classifies Reynolds regimes by Re = N / C, and separates transport path-collapse boundaries from within-class protocol efficiency. The engineering surface instantiates the model in distributed staged computation and Aeon Flow transport. In the companion artifacts, 8/8 primary wall-clock cells pass with median speedups 11.785x-21.620x, and an Aeon Flow versus HTTP/3 protocol corpus over 144 sites and 12,371 resources shows a 72.252% median framing gain with positive latency gains across all 6 primary environments. The claim is not that fork/race/fold is universally optimal; it is that bounded graph pairs make Delta_beta falsifiable and useful for diagnosing when path-like execution is misfit to the workload.

## 1. Problem and Claim

**Thesis.** Path-like execution topologies impose avoidable coordination cost when the workload's natural structure has positive parallel-path complexity.

The narrow target in this paper is distributed inference and the protocol stack around it. A staged inference workload naturally contains branch points, joins, and independent paths that can be processed without violating correctness. A path-like runtime collapses that structure into a single ordered line. Sometimes that is exactly the right choice. Sometimes it is a mismatch that inserts waiting, framing waste, or unnecessary synchronization even though the workload itself would allow more structure.

This paper isolates that mismatch as a topological question rather than a hardware or implementation-style question. The central diagnostic is `Delta_beta`, the gap between the parallel-path complexity required by the workload and the path budget actually exposed by the execution topology. When `Delta_beta = 0`, the schedule is structurally matched to the workload at the chosen abstraction layer. When `Delta_beta > 0`, some coordination cost is being imposed by the topology rather than by the problem.

**What is new here.** The flagship claim is not that overlap, pipelining, or multi-stream transport were previously unknown. The novelty is narrower.

1. It separates workload-side path demand `beta_1*` from runtime-side path budget `beta_1^exec`, computes both from bounded graph pairs at the same declared layer, and uses `Delta_beta` as the mismatch coordinate between them.
2. It binds the main body claims to a theorem-to-observable surface: each positive claim has a local formal anchor, a measured observable, and a stated falsifier.
3. It treats scheduler and transport as one coupled execution surface, so the wire is allowed to reintroduce path-like collapse even when the scheduler itself exposes concurrency.

The contribution is intentionally narrow.

1. It gives a finite DAG scheduling model with four primitives: fork, race, fold, and vent.
2. It states an explicit correctness envelope, C1-C4, under which the model is used.
3. It identifies a small theorem-to-observable bridge sufficient for the scheduler and protocol claims used here.
4. It evaluates that bridge with artifact-backed wall-clock evidence, protocol-corpus evidence, and an explicit path-boundary control rather than with analogy-driven extrapolation.

The flagship stays short on purpose because the claim is local and falsifiable. If the bridge needs a survey-length manuscript to survive compression, it is not yet sharp enough.

The point is not to rename ordinary pipelining. Classical pipelining already explains why overlapping stages can reduce latency. Dataflow and bounded DAG systems already explain how forks and joins can be made explicit. Modern transports already reduce some head-of-line and framing costs. The stronger claim here is different: some execution failures are best understood as forcing a workload with positive intrinsic parallel-path complexity through a topology that exposes too little of that structure. In that setting, the useful question is not only "how much parallel hardware exists?" but also "how much of the workload's path structure has the runtime allowed to exist, and where is the missing path budget being collapsed?"

The scheduler and transport story are studied together because they fail together. A staged pipeline can preserve local concurrency and still lose it at the protocol layer if the wire format, ordering policy, or collapse semantics reserialize the flow. Likewise, a richer transport can still fail to help if the scheduler never exposes multiple useful paths. The flagship claim is therefore a bridge claim: the same mismatch diagnostic can be used to reason about staged execution and about the protocol that carries staged execution across machines.

This paper does not ask the reader to grant a universal theory. It asks for a smaller standard. Given a finite DAG workload under explicit correctness conditions, do the mechanized model and the checked artifacts jointly support the claim that path-like execution can impose avoidable coordination cost? The answer argued here is yes.

## 2. Model and Notation

### 2.1 Finite DAG Scheduling Surface

Let `G = (V, E)` be a finite DAG representing a bounded execution slice. Nodes denote local computations or transport actions. Edges denote causality. A fork node has out-degree greater than one, a fold node has in-degree greater than one, and a linear chain has in-degree and out-degree at most one. The model uses four operational primitives:

1. `Fork(S, O) -> {S_1, ..., S_k}` creates branch-local states.
2. `Race({S_i}) -> (S_w, i_w)` advances branches concurrently and accepts the first valid completion.
3. `Fold({S_i}, f) -> S*` merges branch outcomes with a deterministic fold function `f`.
4. `Vent(S_i) -> bottom` terminates a branch without corrupting its siblings.

The paper does not need a larger primitive set. The local questions are scheduling questions: when is a path split useful, when does a branch need an all-branch fold, and when can an execution surface safely accept early completion or local failure?

### 2.2 Parallel-Path Complexity and Delta_beta

Let `beta_1*` denote the intrinsic parallel-path complexity of the workload at the abstraction layer under study. This is not claimed to be an invariant of reality at every scale; it is a model-side count of how many independent paths the workload can profitably expose while preserving correctness. Let `beta_1^exec` denote the path budget exposed by the execution topology at that same layer. The diagnostic is

$$
\Delta_\beta = \beta_1^* - \beta_1^{\mathrm{exec}}.
$$

If `Delta_beta = 0`, the schedule is structurally matched. If `Delta_beta > 0`, the execution surface is forcing some part of the workload through a narrower path than the workload requires. The diagnostic is directional and local. It is not a universal score. It only answers whether the chosen runtime is narrower than the modeled workload.

To keep that claim falsifiable, the paper uses one explicit extraction rule. Fix one abstraction layer and one bounded execution slice. Build a workload graph `G*` whose nodes are bounded events and whose edges are only the dependencies required for correctness at that layer. Build an effective execution graph `G^exec` for the same slice after scheduler and transport ordering have been applied. Then compute

$$
\beta_1(G) = \max(0, |E| - |V| + \beta_0(G))
$$

on each graph, using the same event vocabulary on both sides. In the companion, this is implemented directly over bounded trace and protocol graphs rather than inferred from benchmark scalars alone.

A concrete worked example is enough to show the rule. A 10-stream fork/join workload has `|V| = 12`, `|E| = 20`, and `beta_0 = 1`, so `beta_1* = 9`. If an ordered single-pipe transport forces the same slice into a chain, then `|E| = 11`, `beta_1^exec = 0`, and `Delta_beta = 9`. If the effective transport preserves the same 10 branch-local streams through independent recovery, then `beta_1^exec = 9` and `Delta_beta = 0`. This paper uses that graph-pair rule as the operational meaning of the diagnostic.

Three execution classes matter in this paper.

| Execution class | Informal topology | Typical `beta_1^exec` reading | Use in this paper |
|---|---|---:|---|
| Sequential path | one ordered line | `0` | boundary case |
| Chunked pipeline | stage-local concurrency without workload branching | positive but bounded by stage occupancy | staged baseline |
| Fork/race/fold schedule | explicit branch, race, and deterministic collapse surface | matched to positive `beta_1*` when the workload contains multiple useful paths | target topology |

The flagship claim is not that every problem has positive `beta_1*`. Some workloads are truly path-like. For those, `Delta_beta = 0` under a sequential schedule and no theorem in this paper predicts a win from adding concurrency. The diagnostic becomes useful only when the workload is naturally richer than the schedule that carries it.

The paper does not ask `Delta_beta` to replace classical metrics. It adds it because the existing metrics answer different questions.

| Quantity | What it answers | What it is useful for | What it does not localize |
|---|---|---|---|
| serial fraction | how much work is currently marked serial | classical scaling ceilings | whether the serialization is inherent to the workload or inserted by the runtime |
| occupancy / utilization | how full stages or streams are | idle-slot and saturation diagnosis | whether a lower layer has silently collapsed the path structure back to one ordered flow |
| exposed path budget `beta_1^exec` | how many independent paths the runtime actually keeps alive | describing the execution surface | whether the workload needed more than that many paths |
| `Delta_beta` | how much modeled path structure is missing from the execution surface | locating topological mismatch | absolute system quality outside the chosen model boundary |

The point is therefore comparative, not imperial. Serial fraction and occupancy remain useful. `Delta_beta` earns its keep when they are not enough. An application can expose multiple logical streams and still inherit a path-like transport below it. In that case occupancy at the stream layer may look healthy while the transport still forces `beta_1^exec = 0`. The diagnostic names that contradiction directly. Conversely, if the workload is genuinely one-path, then `beta_1* = 0`, `Delta_beta = 0`, and the model predicts no structural win from richer scheduling.

That is the indispensable use-case for `Delta_beta` in this paper: concurrency can be visible in the application graph and absent in the effective execution graph at the same time.

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
C = \lceil P / B \rceil,
$$

the chunked pipeline time under the modeled schedule is

$$
T_{\mathrm{pipe}} = \lceil P/B \rceil + N - 1,
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
Re = N / C.
$$

This quantity measures how dense the pipeline is in stages per chunk. Low `Re` means many chunks relative to stage count, which pushes the system toward steady-state occupancy. High `Re` means few chunks relative to stage count, which magnifies ramp-up and drain effects and makes multiplexing recovery more important.

Figure 1 is the model-side picture used throughout the paper. The same figure carries both the inverted-scaling workload curves and the regime map induced by `Re`.

Figure 1 shows the scheduling logic that the later artifact-backed measurements are tested against.

![Figure 1. Inverted scaling and Reynolds regime map from the Chapter 17 companion artifacts. The same analytic surface supports the speedup ceiling, the speedup floor, and the regime thresholds used to classify laminar, transitional, and turbulent execution.](companion-tests/artifacts/ch17-inverted-scaling-reynolds-figure.png)

## 3. Formal Results

### 3.1 Correctness Under Finite DAG Decomposition

The first theorem family is a sufficiency surface. Under finite DAG decomposition and C1-C4, fork/race/fold scheduling can preserve correctness without requiring a globally serialized path. The paper does not claim a universal completeness theorem for all distributed systems. It uses a narrower constructive claim: finite DAG workloads can be decomposed into linear chains, fork points, and join points, and the scheduler may operate on that decomposition without changing the result when the four conditions hold.

This surface is backed by executable finite-DAG decomposition checks and by a bounded formal stack. The TLA+ side verifies the local invariants that define the safe scheduling envelope. The Lean side verifies the quantitative statements used in the rest of the paper. The paper therefore separates two questions that are often blurred together in systems writing:

1. Is the richer schedule well-defined?
2. Does the richer schedule help?

The first question is answered locally by C1-C4 and the finite DAG decomposition surface. The rest of this section answers the second question.

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

The value of the theorem is not that the ceiling is surprising. The value is that the floor is explicit. A staged pipeline under the modeled assumptions is not only potentially faster; it is structurally non-worse than the serialized baseline. This is what makes a mismatch diagnostic possible. If the workload admits a pipeline and the deployment still measures a loss, that loss is evidence against the assumptions or evidence that the schedule is not the schedule the model claims to analyze.

The companion packages both the floor and the strict-speedup refinement. The strict version applies for `P >= 2` and `N >= 2`, ruling out the degenerate single-item and single-stage boundaries where the pipeline collapses to the path.

### 3.3 Reynolds Classification

The second theorem family classifies execution regimes with the Reynolds number. The mechanized claim used here is operational:

1. `Re < 1/3` is laminar.
2. `1/3 <= Re < 2/3` is transitional.
3. `Re >= 2/3` is turbulent.

The companion theorem names `reynolds_regime_exhaustive`, `classifyRegime`, and `turbulent_collapse_floor` are used because they make the schedule-level consequence explicit: the regime is not only a label, it constrains which fold policies are safe and how much collapse work the runtime should expect to pay.

The practical use of the classification is modest but important. It turns the sentence "this pipeline feels too thin to keep all stages busy" into a falsifiable condition on `N/C`. The paper does not need a fluid identity claim. It only needs the regime map as a schedule-selection tool.

### 3.4 Delta_beta as a Diagnostic Coordinate

The step-count theorem and the regime classification would already justify a technical note on staged execution. `Delta_beta` adds the bridge to richer workloads. When a workload has positive intrinsic path structure, a path-like execution collapses part of that structure into the base path and pays for the collapse as waiting, framing, or coordination overhead. The diagnostic claim is:

1. `Delta_beta = 0` predicts structural match.
2. `Delta_beta > 0` predicts that some observed waste comes from the execution topology rather than from the problem alone.
3. Larger positive `Delta_beta` widens the room in which a richer schedule can help, but does not by itself prove that a particular implementation will help.

This is the point of the bridge to protocol evidence. A scheduler can expose multiple useful paths and still lose them if the transport collapses everything back into one coupled delivery stream. In that case the scheduling layer and the protocol layer share the same failure: both are enforcing a base-space path on a workload that still has unused path structure.

The paper does not infer `Delta_beta` from the deployed gate scalars themselves. It computes the diagnostic on bounded graph pairs, then asks whether the measured scheduler and transport surfaces behave like positive-deficit cases, zero-deficit cases, or the exact one-path boundary.

### 3.5 Protocol Theorem Surface

The protocol story in this paper is bounded and concrete. The companion formal surface includes the following claims.

| Claim family | Scope used here | Artifact pair |
|---|---|---|
| quorum visibility | acknowledged values remain visible to legal quorum reads in the bounded crash/recover model | `QuorumReadWrite.tla` + `QuorumVisibility.lean` |
| connected-quorum exactness | connected live quorums read committed values exactly under explicit partition assumptions | `QuorumAsyncNetwork.tla` + `QuorumAsyncNetwork.lean` |
| committed-session consistency | read-your-writes and monotonic reads hold when reads are restricted to committed states | `QuorumSessionConsistency.tla` + `QuorumConsistency.lean` |
| multi-writer committed ordering | latest-ballot and latest-writer properties hold under unique ordered ballots | `QuorumMultiWriter.tla` + `QuorumOrdering.lean` |

These theorems are not claims about all asynchronous distributed protocols. They are boundary statements for the specific transport and collapse rules used by the companion surface. Their role in the flagship is limited: they justify saying that the protocol layer itself is not hand-waved. The wire semantics and the fold rules are also given bounded formal treatment.

Just as important, these theorems are not the source of the Gate2 latency numbers. In the flagship they certify bounded stream legality, ordering, and fold semantics for the protocol surface being discussed. Gate2 then measures a narrower question: whether Aeon Flow improves framing and completion behavior relative to HTTP/3 on the declared corpus and impairment matrix. Crash-recovery completeness or general consistency claims are outside what Gate2 directly measures.

## 4. Systems Instantiation

### 4.1 Distributed Staged Computation

The concrete scheduler studied in the companion is a distributed staged computation surface for inference prefill. Prompt chunks move across stage nodes. Each node preserves stage-local order for the stream it owns, while the overall runtime overlaps multiple chunks across stages. This is exactly the sort of setting where C1 matters: correctness follows from local ordering rather than from a single total order over all work in flight.

At the implementation level the schedule is a chunked pipeline rather than a speculative executor. A chunk enters stage 1, advances when that stage is free, and continues through the remaining stages while later chunks begin behind it. The modeled makespan is the `ceil(P/B) + N - 1` surface from Section 2.4. The measured wall-clock evidence later in the paper tests whether the deployed system preserves enough of that shape to separate chunked execution from the serialized baseline.

The important structural point is that the scheduler does not treat every token or chunk as if it needed to wait for global completion. It exposes just enough concurrency to keep independent stage work alive while retaining a deterministic fold at the stage boundaries. That is the flagship example of reducing `Delta_beta` without abandoning determinism.

### 4.2 Aeon Flow

The scheduler runs over Aeon Flow, a binary framing layer whose unit of transport is a `FlowFrame`. The header width is 10 bytes:

1. `stream_id`: 2 bytes
2. `sequence`: 4 bytes
3. `flags`: 1 byte
4. `length`: 3 bytes

That small fact matters because the protocol question here is not only throughput. It is whether the transport preserves enough path structure for the scheduler to remain visible at the wire. Aeon Flow is designed to carry multiple logical streams without forcing them through the stronger coupling of a one-path ordered-delivery model. A stream can therefore correspond to a computation path or a staged chunk sequence rather than to the entire request as one inseparable line.

In the flagship argument, Aeon Flow is not interesting because it is a custom protocol. It is interesting because it makes the scheduler's branch structure legible at the transport layer. A richer schedule over a transport that immediately reserializes everything would only shift the mismatch boundary downward. The purpose of the protocol layer is to keep the transport from becoming the hidden place where `Delta_beta` turns positive again.

### 4.3 The Scheduler-Transport Bridge

The scheduler and protocol bridge can be stated directly.

1. The scheduler decomposes work into stage-local paths.
2. The transport preserves those paths as explicit streams and deterministic folds.
3. The empirical gates measure whether the resulting surface actually reduces observed waste.

This is why the bridge thesis needs both gate1 and gate2, plus an explicit transport boundary check. Gate1 checks that the staged execution surface separates chunked and serialized wall-clock behavior on external multi-host endpoints. The boundary checks isolate the gross path-collapse question on bounded graph pairs. Gate2 then asks the narrower protocol question: once the transport is at least stream-preserving, does Aeon Flow still retain a framing and completion advantage over HTTP/3 across a heterogeneous site corpus?

No claim in this section depends on unrelated correspondence material. The only claim is that the runtime and the transport are shaped to expose and preserve path structure that a path-like baseline would hide.

## 5. Evaluation

### 5.1 Evaluation Policy

Only artifact-backed quantitative claims are used in the flagship body. The evaluation surface is intentionally small:

1. Gate1 for wall-clock staged execution.
2. Gate2 for protocol-corpus framing and completion behavior.
3. A path-boundary control showing that the same surface predicts parity or collapse when the path budget really is one.
4. The analytic figure for the Reynolds/speedup model.

This is enough to test the bridge thesis without importing unrelated sections of the larger chapter.

The paper only makes claims that are attached to an observable and a failure condition.

| Paper-side claim | Formal or executable anchor | Observable used here | What would count against the claim |
|---|---|---|---|
| chunked staged execution can remove path-imposed coordination cost under A1-A2 | pipeline floor and sandwich theorem family | Gate1 latency separation between serialized and chunked execution | chunked execution fails to separate from, or reverses against, the serialized baseline on the declared primary cells |
| `Delta_beta` can be computed rather than only described | bounded workload/execution graph-pair extraction plus protocol deficit boundary checks | exact recovery of one-path, ordered-pipe-collapse, and per-stream-preservation cases | the extracted graph pairs fail to separate `Delta_beta = 0` from positive-deficit boundary cases |
| once gross path collapse has been separated, protocol structure still changes residual coordination cost | FlowFrame protocol checks plus Gate2 corpus harness (`Aeon Flow` versus `HTTP/3`) | Gate2 framing and completion behavior across the primary environment matrix | framing or completion gains collapse against the explicit HTTP/3 baseline |

### 5.2 Operational Delta_beta Checks

Before reading the deployment gates, the paper fixes the diagnostic on explicit graph pairs. The companion already contains the bounded cases used for that calibration.

| Case | `beta_1*` from workload graph | `beta_1^exec` from effective execution graph | `Delta_beta` | Expected reading |
|---|---:|---:|---:|---|
| one-path chain | `0` | `0` | `0` | exact parity boundary; no structural win is predicted |
| 10-stream fork/join over one ordered pipe | `9` | `0` | `9` | positive mismatch; the transport has collapsed visible concurrency back into one path |
| 10-stream fork/join over per-stream recovery (`HTTP/3` or `Aeon Flow`) | `9` | `9` | `0` | stream independence is preserved; remaining differences are protocol cost, not gross path collapse |

This is the direct operational check for the diagnostic. `Delta_beta` is not being reverse-engineered from Gate1 or Gate2 outcomes. It is being computed on bounded graph pairs first, then used to sort later measurements into positive-deficit, zero-deficit, and one-path-boundary cases.

### 5.3 Boundary Control: The One-Path Case Must Collapse

The same surface that supports the positive gate results also predicts a no-win boundary. This matters because it answers the obvious reviewer objection that the diagnostic is merely a new way to say "parallelism helps." In the companion boundary checks, setting `beta_1 = 0` forces `C = 1`, and the pipeline equation recovers exact sequential execution:

$$
T = (N + 1 - 1) \cdot t_{\mathrm{stage}} = N \cdot t_{\mathrm{stage}}.
$$

There is no hidden speedup term left once the path budget has collapsed to one. The same companion boundary surface also makes the protocol version explicit: a richer application layer can still inherit a path-like transport bottleneck, so exposing concurrency above the wire is not enough if the transport below it reserializes recovery and delivery. This section is not a new headline result. It is a control. It shows that the flagship does not use `Delta_beta` as a universal success score. The framework is allowed to predict parity when the workload is one-path, and it is allowed to predict collapse when the scheduler's extra path structure disappears at the transport layer.

### 5.4 Gate1: External Multi-Host Wall-Clock Evidence

Gate1 measures chunked versus serialized execution on an external multi-host setup. The flagship uses the external multi-host report because it is the cleanest bridge from the formal pipeline model to deployed staged execution. The artifact uses two workloads, multiple RTT and loss settings, bootstrap confidence intervals, and six distinct endpoint hosts.

The result is simple and strong. 8/8 primary Gate1 cells pass. Across those primary cells, the median speedup range is 11.785x-21.620x. The minimum primary-cell speedup CI low is 11.365x. Across the full ten-cell matrix, the minimum latency-improvement CI low is 3561 ms.

Those numbers matter for two reasons. First, they are comfortably above the speedup floor. The deployment is not merely avoiding regressions; it is showing a large, repeated separation from the serialized baseline. Second, the range widens as the workload gets larger in stage count and token count, which is exactly the direction predicted by the modeled step-count surface.

The Gate1 figure is the most direct empirical view of the scheduling claim.

Figure 2 shows the deployed wall-clock separation that corresponds to the model-side speedup surface.

![Figure 2. Gate1 wall-clock evidence from the Chapter 17 companion artifacts. The chart summarizes the ten-cell external multi-host matrix and shows the separation between serialized and chunked execution together with bootstrap speedup intervals.](companion-tests/artifacts/ch17-gate1-wallclock-figure.png)

The flagship does not claim that the gate1 scalar is a universal constant. The point is narrower: on a bounded external deployment surface, the measured behavior matches the qualitative prediction of the formal scheduler. A path-like baseline is paying coordination cost that the staged schedule avoids. Just as important, the one-path boundary above tells us what would have happened if the workload or runtime had really been `beta_1 = 0`: the measured separation would have had no structural reason to appear.

### 5.5 Gate2: Protocol-Corpus Evidence

Gate2 tests the transport side of the bridge on a seeded heterogeneous corpus. The corpus contains 144 sites and 12,371 resources, and the six primary environments span increasing RTT, decreasing bandwidth, and rising loss. The explicit baseline is HTTP/3. That distinction matters. Gate2 is not where the paper establishes the positive-deficit ordered-pipe collapse case; the companion boundary checks already do that on bounded graph pairs. Gate2 asks the narrower question of within-class protocol efficiency: once the transport is already stream-preserving, do Aeon Flow's smaller framing and fold semantics still improve framing and completion behavior relative to HTTP/3 across the declared impairment matrix?

Again the result is compact. 6/6 primary Gate2 cells pass. The framing median gain is 72.252%, and the minimum primary-cell framing CI low is 72.19%. At the benign primary edge, the `rtt12-bw80-loss0` environment still yields 23.62 ms median completion gain and 23.79 ms p95 completion gain. At the harsh primary edge, `rtt110-bw7-loss2pct` yields 92.39 ms median completion gain and 110.5 ms p95 completion gain.

This is the key within-class transport result. The framing advantage is nearly invariant across environments because it comes from protocol structure. The completion gain grows with impairment because the lower framing and recovery burden compounds as the network gets worse. The flagship does not read Gate2 as proof that HTTP/3 is a one-path transport. It reads Gate2 more narrowly: after the path-collapse boundary has been separated elsewhere, protocol structure still changes the residual coordination cost of carrying the staged workload over the wire.

Figure 3 makes the split visible: nearly constant framing advantage, widening completion advantage.

![Figure 3. Gate2 protocol-corpus evidence from the Chapter 17 companion artifacts. The chart separates framing gains from completion gains across the heterogeneous site corpus and shows that the protocol advantage persists across all six primary environments.](companion-tests/artifacts/ch17-gate2-protocol-corpus-figure.png)

### 5.6 Interpreting the Evaluation Surface Together

The graph-pair checks, Gate1, and Gate2 do different jobs.

1. The graph-pair checks operationalize `Delta_beta` and separate one-path, ordered-pipe-collapse, and per-stream-preserving cases before any deployment scalar is discussed.
2. Gate1 checks the staged scheduler against the serialized baseline.
3. Gate2 checks Aeon Flow against the explicit HTTP/3 baseline once the gross collapse-vs-preservation question has already been isolated.
4. The one-path control checks that the same formal surface also predicts the no-gain case when the path budget really is one.

Taken together they support one bounded conclusion: bounded graph pairs make `Delta_beta` operational enough to separate positive-deficit path-collapse cases from matched cases, and on that foundation the staged runtime plus transport surface shows artifact-backed reductions in observed coordination cost. That is the precise role of `Delta_beta` in the flagship: not a one-number oracle, but a way to state where missing path budget is being inserted.

The paper does not need more than that. It does not need a claim that every transport problem is topological, or that every pipeline problem should be reframed through Betti numbers. It only needs the evidence to show that the diagnostic is usable on the targeted scheduler-plus-transport bridge, that it cleanly recovers the one-path and ordered-pipe boundaries, and that the deployment gates do not contradict those local predictions.

## 6. Limitations and Non-Claims

The flagship deliberately narrows scope. The following boundaries are part of the claim, not footnotes to it.

1. The model is a finite DAG model. Infinite-state, adversarially adaptive, or unrestricted asynchronous systems are outside the direct theorem surface used here.
2. The pipeline speedup formula is a modeled step-count claim under A1-A2. It is not a universal wall-clock predictor.
3. `Delta_beta` is a diagnostic coordinate, not a one-number oracle for system quality. A positive value says the execution topology is narrower than the modeled workload, not that a particular implementation must improve by a fixed amount.
4. Gate1 is a bounded external multi-host matrix, not a claim about every deployment.
5. Gate2 is a seeded heterogeneous corpus with explicit impairment environments, and its protocol comparison is Aeon Flow versus HTTP/3 rather than a universal transport shootout.
6. The paper does not claim universal superiority of richer schedules. For small workloads, extremely fast serial paths, or high coordination overhead, the correct topology may be `beta_1 = 0`.
7. No body claim in this paper depends on extra-domain correspondence surfaces outside distributed systems and bounded protocol models.

These limitations sharpen the result rather than weaken it. The claim is strong precisely because it stays local.

## 7. Related Work

This section is intentionally not a survey. It covers only the literatures needed to identify the incremental claim of the flagship.

The speedup formulas in this paper sit beside, not above, the classical scaling laws. Amdahl studies fixed-workload speed limits under an explicit serial fraction, while Gustafson reframes the bound under scaled workloads [1, 2]. Those laws remain the right tools for ceiling questions. The current paper adds a different question: when is part of the apparent serial fraction coming from the execution surface rather than from the workload's natural structure? `Delta_beta` is meant as a local mismatch diagnostic for that narrower question, not as a replacement for classical scaling analysis.

The scheduling model is likewise adjacent to older work on explicit concurrency surfaces. Kahn process networks and early dataflow architectures made it normal to reason in terms of bounded dependency graphs rather than one total order [3, 4]. MapReduce made fork-and-fold structure operational on large bounded computations [6]. The flagship does not claim novelty for DAG execution itself. Its narrower claim is that separating workload-side path demand from runtime-side path budget makes certain scheduling failures easier to localize, especially when the system appears parallel at one layer and path-like at another.

Classical pipeline overlap and asynchronous stage composition are also established. Micropipelines already show that local stage ordering can be enough to preserve correctness while allowing overlap [5]. The scheduler claim here is therefore not "pipelining exists." It is that a staged system can still be under-provisioned in path structure relative to the workload it carries, and that the under-provisioning can be stated as a path-budget mismatch rather than only as low occupancy or poor hardware utilization.

The protocol side belongs to a familiar lineage as well. HTTP/2 reduces framing waste and introduces application-layer multiplexing, while QUIC moves recovery and ordering decisions closer to individual streams [8, 9]. The paper does not claim to supersede that literature. Its narrower bridge claim is that transport should be evaluated partly by whether it preserves the scheduler's exposed path structure or silently collapses it back toward one ordered recovery path. That is why the flagship studies scheduler and protocol together instead of treating them as unrelated optimizations.

Finally, the formal-methods layer is deliberately conventional in the best sense. TLA+ and related specification practice already provide a language for bounded protocol safety and progress arguments [7]. The novelty claim here is not "formal methods for systems" in general. It is the tighter connection between a bounded formal surface, a small set of measured observables, and explicit falsifiers in the main paper, all backed by a public rerun surface rather than by prose alone [10]. That is what is meant to keep the flagship from collapsing into either pure systems benchmarking or pure notation.

## 8. Conclusion

Path-like execution topologies impose avoidable coordination cost when the workload's natural structure has positive parallel-path complexity.

That sentence is the whole paper. The finite DAG model provides the vocabulary. C1-C4 provide the correctness envelope. The speedup floor, speedup sandwich, and Reynolds classification provide the model-side quantitative surface. Aeon Flow provides a transport that preserves the scheduler's path structure instead of silently collapsing it. Gate1 and Gate2 show that the bridge is not only formal: the staged runtime and the protocol layer both exhibit artifact-backed gains on bounded evaluation surfaces.

The result is narrow, but it is enough. One does not need a universal theory of computation to say something useful about topological mismatch in distributed inference. One needs a finite DAG model, explicit assumptions, mechanized local claims, and measured evidence. That is what this flagship paper provides.

The topological vocabulary only matters to the extent that it distinguishes two things standard prose often blends together: path structure inherent to the workload and path collapse inserted by the execution surface. That is the only place `Delta_beta` is meant to earn its keep.

## Appendix A: Theorem-to-Artifact Map

| Local claim in flagship | Theorem or artifact family | Concrete artifact |
|---|---|---|
| finite DAG scheduling under explicit decomposition assumptions | executable finite-DAG decomposition surface | `companion-tests/src/dag-completeness.test.ts` |
| C1-C4 correctness envelope | bounded TLA+ and Lean scheduler surface | `TemporalModel` companion modules plus `@a0n/aeon-logic` rerun path |
| pipeline floor `T_pipe <= T_seq` | `THM-PIPELINE-SPEEDUP-FLOOR` | `formal/lean/Multiplexing.lean` |
| speedup interval `1 <= speedup <= B*N` | `pipeline_speedup_floor`, `pipeline_strict_speedup`, `pipeline_speedup_sandwich` | `formal/lean/Multiplexing.lean`, `formal/lean/PredictionsRound15.lean` |
| Reynolds regime cut points | `reynolds_regime_exhaustive`, `classifyRegime`, `turbulent_collapse_floor` | `formal/lean/ReynoldsBFT.lean`, `companion-tests/artifacts/ch17-inverted-scaling-reynolds-figure.{json,md,png,svg}` |
| operational `Delta_beta` extraction from bounded graph pairs | workload/execution graph comparison over explicit traces | `companion-tests/src/deficit-evidence.test.ts` |
| 10-byte FlowFrame header and stream semantics | framing law plus runtime protocol tests | `companion-tests/src/flow-protocol.test.ts` |
| bounded quorum visibility and ordering surface | quorum theorem family | `QuorumReadWrite.tla`, `QuorumVisibility.lean`, `QuorumAsyncNetwork.tla`, `QuorumAsyncNetwork.lean`, `QuorumSessionConsistency.tla`, `QuorumConsistency.lean`, `QuorumMultiWriter.tla`, `QuorumOrdering.lean` |
| one-path boundary recovers sequential execution | explicit `beta_1 = 0` boundary check | `companion-tests/src/pipeline-topology.test.ts` |
| transport can reintroduce path collapse below the application layer | protocol deficit boundary | `companion-tests/src/deficit-evidence.test.ts` |
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
