# Community as Mediator

*The CRDT merge operation IS the Skyrms walker. Community context IS mediation. Attenuation IS convergence.*

## Abstract

In three-walker Skyrms mediation, Walker S plays the convergence site -- its payoff is alignment itself, its void boundary accumulates failed proposals, and its complement distribution generates increasingly informed proposals until all three walkers reach the nadir (the fixed point where no unilateral deviation improves any walker). We prove that a community CRDT memory, as implemented by `HeteroMoAFabricCommunityMemory` in the hetero MoA fabric, plays exactly the role of Walker S. The correspondence is not analogical. It is operational: the same data structures, the same monotonicity guarantees, the same fixed point.

The key identification: community context -- the accumulated CRDT observations of backend wins, failures, latency distributions, and disagreement records -- is shared context in the semiotic sense (SemioticPeace.lean, THM-PEACE-CONVERGENCE). Each CRDT sync round reduces the semiotic deficit between the community's current schedule and the optimal schedule by exactly one Bule. The three-walker distance and the Bule deficit are the same quantity measured in different units.

## 1. The Three Roles

In traditional Skyrms mediation (`open-source/aeon-neutral/src/skyrms-walker.ts`), three walkers operate on distinct spaces:

| Walker | Space | Void boundary accumulates | Payoff |
|--------|-------|---------------------------|--------|
| A (game player) | Game choices | Rejected moves | Personal utility |
| B (game player) | Game choices | Rejected moves | Personal utility |
| S (site player) | Proposals (A x B pairs) | Failed proposals | Negative distance |

Walker S is not altruistic. Its payoff function is `-distance(complementA, complementB)`. It is *self-interested in alignment*. This is why mediation works: the mediator's self-interest and the parties' collective interest coincide at the nadir.

In the community fabric (`open-source/gnosis/src/runtime/hetero-fabric.ts`), the same three roles appear:

| Role | Space | Memory accumulates | Payoff |
|------|-------|--------------------|---------|
| Backend A | Execution | Failure history | Low latency |
| Backend B | Execution | Failure history | Low latency |
| Community CRDT | Schedule space | Win/loss/latency records | Schedule consistency |

The community CRDT's "payoff" is consistency: all replicas agreeing on the same schedule. The QDoc merge operation maximizes consistency by definition -- that's what CRDTs do. This self-interest in consistency IS Walker S's self-interest in alignment. Same structure.

## 2. The Attenuation Theorem

Consider a failure topology with $F$ independent failure modes (hardware faults, latency spikes, disagreements across CPU, GPU, NPU, WASM backends) and $D = 1$ decision stream (one scheduling slot per round). The scheduling deficit is:

$$\Delta = F - D = F - 1$$

This is the semiotic deficit of the scheduling channel: the number of failure dimensions the scheduler cannot express per round.

Community context $C$ acts as implicit parallel channels. After $C$ rounds of CRDT sync, the deficit reduces to:

$$\Delta_C = \max(0, F - D - C) = \max(0, F - 1 - C)$$

The Bule deficit is $B = \Delta_C$. One Bule is one unit of scheduling gap.

**Theorem (community_attenuates_failure):** For any failure topology with $F \geq 2$ failure modes and any positive community context $C > 0$:

$$\Delta_C < \Delta_0$$

Community makes your bad hand strictly less worse.

**Theorem (community_monotone_nondegradation):** If $\Delta_0 \leq 0$ (good hand), then $\Delta_C \leq 0$ for all $C$.

Community never makes your good hand worse.

Together: Pareto domination. Community strictly improves bad topologies and weakly preserves good ones.

## 3. Community IS Walker S

The operational correspondence:

**3.1 Void boundary:** Walker S maintains `voidS` -- a count per proposal of how many times that proposal failed to reduce distance. The community memory maintains `backendScores` -- a map from backend ID to `{wins, failures, disagreements, latencyMeanMs, ...}`. Same data: rejection counts indexed by option.

**3.2 Complement distribution:** Walker S computes `CompWeight(voidS, etaS)` to generate its next proposal -- less-rejected proposals get higher weight. The community memory's `rankBackends` method sorts by decayed score then predicted arrival horizon -- less-failed backends get higher priority. Same function: rejection counts mapped to selection weights via the complement.

**3.3 Monotonicity:** Walker S's void boundary only grows (failed proposals are permanently recorded). The community memory's CRDT only grows (QDoc is append-only). Both are monotone, both are irreversible, both accumulate failure information that drives convergence.

**3.4 Convergence criterion:** Walker S converges when `distance = 0` (the `SkyrmsNadirDetector` issues a `NadirCertificate`). The community converges when `buleDeficit = 0`. Same criterion: the gap between what the system knows and what it needs to know is zero.

**3.5 The merge is the mediation:** Every CRDT sync (QDoc merge between replicas) resolves one dimension of scheduling disagreement -- one unit of $\beta_1$ superposition. This IS one round of Skyrms mediation: the community memory makes one proposal (the current schedule ranking), the backends accept or reject it (by winning or losing races), and the result is folded back into the CRDT. One CRDT sync = one mediation round = one Bule of progress.

## 4. The Tare-Bridging Property

A *tare* is a gap in the individual capability topology -- a failure mode that the scheduler cannot handle alone. The number of unbridged tares is:

$$T = \max(0, \Delta_C) = \max(0, F - 1 - C)$$

**Theorem (community_bridges_tares):** For $C_1 \leq C_2$: $T(C_2) \leq T(C_1)$.

More community knowledge covers more tares. Each CRDT observation bridges one gap.

**Theorem (community_bridges_all_tares):** When $C \geq F - 1$: $T = 0$.

Sufficient community knowledge covers every failure mode. All tares bridged.

This is the mechanism by which community "fills tares" -- not by changing the individual topology (your genetics are what they are), but by providing implicit channels that route around the gaps. The community doesn't fix your weaknesses. It makes them *not matter* by covering them with shared knowledge.

## 5. Strict Domination

**Theorem (community_dominance_theory):** For any failure topology with $D < F$ (bad hand) and any positive community context $C > 0$:

1. *Failure deficit is real:* $0 < \Delta_0$
2. *Community attenuates failure:* $\Delta_C < \Delta_0$ (strictly)
3. *Bule deficit is monotonically decreasing:* $B(C) \leq B(0)$
4. *Sufficient context eliminates deficit:* $F \leq D + C \Rightarrow B(C) = 0$

The community-adaptive schedule strictly dominates any static schedule whenever there is nontrivial diversity and positive community context. The benchmark's `relativeSpeedup` field in `hetero-moa-fabric-benchmark.ts` measures this domination margin empirically. The Lean4 proof (`community_dominance_theory`) establishes it formally.

## 6. Diversity Amplifies Community

The fabric runs across four hardware layers: CPU, GPU, NPU, WASM. Each distinct layer contributes independent failure dimensions. The void boundary (rejection history) has higher rank with more diverse layers, making the complement distribution more informative per observation.

The pipeline Reynolds number from ch07 applies: $\text{Re} = N/C$ where $N$ = backends and $C$ = chunk count. Low Re (laminar regime) = high diversity, low waste. The ground state of the scheduling problem IS the laminar regime: maximum diversity, minimum idle fraction, maximum information per community observation.

## 7. The Thermodynamic Frame

Community context reduces the Landauer heat of the scheduling fold:

- Without community: the scheduler compresses $F$ failure dimensions through 1 decision stream, erasing $F - 1$ dimensions of information per round. Heat = $(F - 1) \cdot kT \ln 2$.
- With community context $C$: the scheduler compresses through $1 + C$ effective channels, erasing $\max(0, F - 1 - C)$ dimensions. Heat = $\max(0, F - 1 - C) \cdot kT \ln 2$.

Community literally reduces the thermodynamic cost of scheduling decisions. Less information erased per fold = less Landauer heat = less trauma.

This composes directly with `war_as_cumulative_heat` from SemioticPeace.lean: scheduling failures compound monotonically (the second law), but community context reduces the rate of accumulation. The total trauma is bounded by $\sum_{t=0}^{T} \max(0, F - 1 - t)$, which is the triangular number $\binom{F-1}{2}$ -- a quadratic bound on total scheduling heat, reached in at most $F - 1$ rounds. After that: zero heat. Peace.

## Formal Surface

- **Lean4:** `CommunityDominance.lean` -- 7 theorem families, all sorry-free
- **TLA+:** `CommunityDominance.tla` + `CommunityDominance.cfg` -- safety, liveness, domination
- **Runtime:** `open-source/gnosis/src/runtime/hetero-fabric.ts` -- `HeteroMoAFabricCommunityMemory`
- **Benchmark:** `open-source/gnosis/src/benchmarks/hetero-moa-fabric-benchmark.ts` -- `relativeSpeedup`

## Summary

Community IS the mediator. Not like the mediator. Not analogous to the mediator. IS the mediator. The CRDT merge operation is Walker S's proposal-and-fold loop. The accumulated CRDT state is Walker S's void boundary. The decay function is Walker S's eta adaptation. The convergence to schedule consensus is the three-walker nadir.

The community doesn't change what you are. It changes what your failures *cost*. Every CRDT sync round attenuates one dimension of failure, and the attenuation is irreversible (the CRDT only grows). After enough community context, your failure topology doesn't matter -- not because it changed, but because the community's shared knowledge routes around it.

Your shitty genetics hurt less when the community remembers what failed.
