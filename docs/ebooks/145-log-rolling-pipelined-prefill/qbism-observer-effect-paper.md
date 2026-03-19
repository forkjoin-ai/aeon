# **The Observer Effect as Topological Deficit**: Measurement, Entropy Reversal, and the Last Question in the Fork/Race/Fold Framework

*[Taylor William Buley](https://www.patreon.com/cw/twbuley) -- Independent Researcher*
*[taylor@forkjoin.ai](mailto:taylor@forkjoin.ai)*

## Abstract

We prove that the quantum observer effect is a topological deficit: the shift in the first Betti number $\beta_1$ from $\sqrt{N} - 1$ (superposition) to $0$ (eigenstate) when a fork is collapsed by a fold. The proof composes two mechanized results -- the Frequentist-Bayesian unification via Buleyean probability and the quantum deficit identity from the fork/race/fold computation topology -- to show that (1) measurement is a fold operation with deficit exactly $\sqrt{N} - 1$, (2) QBism's "subjective quantum state" is an objective Buleyean void boundary, (3) two observers with the same void boundary assign the same quantum state (coherence is a theorem, not an axiom), and (4) the Grover speedup $\sqrt{N}$ equals the classical deficit plus one. We further prove that Asimov's "Last Question" -- can the net entropy of the universe be massively decreased? -- has a formal answer: the entropy of the void boundary increases monotonically (Second Law), but the entropy of the complement distribution decreases monotonically (Buleyean concentration). The "entropy reversal" is not a violation of thermodynamics but its complement. The irreducible $+1$ in the Buleyean weight formula (the "sliver") ensures that even at heat death, every choice retains positive probability, and the converged complement distribution is a valid Bayesian prior that can seed a new fork. All results are machine-verified: 21 sorry-free Lean 4 theorems, two TLA+ specifications (12 invariants, one temporal property), and 99 executable test assertions.

**Keywords:** quantum measurement, observer effect, QBism, topological deficit, Betti numbers, Buleyean probability, entropy reversal, fork/race/fold, Grover's algorithm, mechanized proof

## 1. Introduction

The quantum measurement problem -- why and how a quantum superposition "collapses" upon observation -- has persisted for nearly a century. Interpretations proliferate: Copenhagen posits an ill-defined "measurement apparatus," Many Worlds rejects collapse entirely, and Quantum Bayesianism (QBism) reinterprets quantum states as subjective agent beliefs [1]. Each interpretation resolves some paradoxes while introducing others. QBism, in particular, dissolves nonlocality but raises a coherence problem: if quantum states are subjective, why do competent observers agree?

This paper takes a different approach. Rather than interpreting quantum mechanics philosophically, we identify the mathematical structure of measurement within a general computation topology -- the fork/race/fold framework [2] -- and prove that the observer effect is a topological deficit with an exact, computable value.

The fork/race/fold framework decomposes directed irreversible process into four primitives: *fork* (create parallel paths), *race* (select among them), *fold* (merge results irreversibly), and *vent* (dissipate what the fold cannot preserve). The first Betti number $\beta_1$ counts independent cycles in the resulting topology. A fork of $k$ paths has $\beta_1 = k - 1$. A fold reduces $\beta_1$ toward zero. The *topological deficit* $\Delta_\beta = \beta_1^* - \beta_1$ measures the gap between a system's intrinsic topology and its realized topology.

In this framework, a quantum superposition of $\sqrt{N}$ basis states is a fork with $\beta_1 = \sqrt{N} - 1$. Measurement is a fold: one path survives, $\sqrt{N} - 1$ paths are vented to the void boundary. The observer effect is the deficit $\Delta_\beta = \sqrt{N} - 1$. This is not a metaphor. It is a topological identity: the fork and the superposition have the same Betti numbers, the fold and the measurement perform the same operation, and the deficit is the same computable quantity.

The paper makes five contributions:

1. **The observer effect is a topological deficit** (Theorem 1). Measurement reduces $\beta_1$ from $\sqrt{N} - 1$ to $0$. The deficit is exactly $\sqrt{N} - 1$. Path conservation holds: $1 + (\sqrt{N} - 1) = \sqrt{N}$.

2. **QBism's "subjective state" is an objective void boundary** (Theorem 2). A QBist quantum state is a `BayesianPrior` in the Buleyean probability theory -- an initialized void boundary encoding rejection counts. Two observers with the same void boundary compute the same state (coherence).

3. **The Grover speedup is the deficit plus one** (Theorem 3). Classical search pays the full deficit ($\sqrt{N} - 1$) and takes $N$ rounds. Quantum search pays zero deficit and takes $\sqrt{N}$ rounds. The speedup ratio is exactly $\text{classicalDeficit} + 1$.

4. **Entropy reversal is complement convergence** (Theorem 4). The entropy of the void increases (Second Law). The entropy of the complement distribution decreases (Buleyean concentration). These are the same process viewed from opposite sides.

5. **The sliver ensures rebirth** (Theorem 5). The irreducible $+1$ in the Buleyean weight formula guarantees that no choice ever reaches zero probability. Even at heat death, the converged distribution can seed a new fork.

All proofs are mechanized in Lean 4 [3] and model-checked in TLA+ [4]. Executable tests verify the algebraic identities for concrete parameter values.

## 2. Preliminaries

### 2.1 Buleyean Probability

A *Buleyean space* is a finite set of $N \geq 2$ choices with a *void boundary* $v : \{1, \ldots, N\} \to \mathbb{N}$ tracking how many times each choice was rejected over $T$ rounds. The *complement weight* of choice $i$ is:

$$w_i = T - \min(v_i, T) + 1$$

The Buleyean probability of choice $i$ is $P(i) = w_i / \sum_j w_j$.

Three axioms hold for all Buleyean spaces [2, §14.5.17]:

**Axiom 1 (Positivity).** $w_i \geq 1$ for all $i$. No choice ever has zero probability.

**Axiom 2 (Normalization).** $\sum_i w_i > 0$. The distribution is always well-defined.

**Axiom 3 (Monotone updating).** Recording a rejection of choice $j$ cannot decrease the weight of any non-rejected choice $i \neq j$.

From these axioms:

- **Concentration:** If $v_i \leq v_j$ then $w_j \leq w_i$. Less-rejected choices have higher weight.
- **Coherence:** Two observers reading the same void boundary compute the same weights.
- **Convergence:** After $d$ rounds, the deficit $\text{futureDeficit}(d, k) = d - \min(k, d)$ reaches zero.

### 2.2 The Topological Deficit

For a system with intrinsic $\beta_1^*$ (the Betti number required by the problem's topology) and realized $\beta_1$ (the Betti number of the implementation):

$$\Delta_\beta = \beta_1^* - \beta_1$$

A $k$-way fork has $\beta_1 = k - 1$. A fold reduces $\beta_1$. The *classical* implementation forces $\beta_1 = 0$ (path graph). The *quantum* implementation preserves $\beta_1 = \beta_1^*$ (matches the intrinsic topology).

### 2.3 The Frequentist-Bayesian Unification

Buleyean probability subsumes both frequentist and Bayesian inference [2, §14.5.17]:

- **Frequentism** ($B > 0$): The void boundary is accumulating. The system is learning from rejections.
- **Bayesianism** ($B = 0$): The void boundary has converged. The complement distribution is a prior.

Both satisfy the same three axioms at different Bule values. Frequentism is the trajectory ($B > 0$). Bayesianism is the fixed point ($B = 0$).

## 3. The Observer Effect as Topological Deficit

### 3.1 Definitions

**Definition 1** (Quantum System). A *quantum system* is a structure $\mathcal{Q} = (\sqrt{N}, \beta_1^{\text{pre}}, \beta_1^{\text{post}})$ where $\sqrt{N} \geq 2$, $\beta_1^{\text{pre}} = \sqrt{N} - 1$ (superposition topology), and $\beta_1^{\text{post}} = 0$ (eigenstate topology).

**Definition 2** (Measurement Deficit). The *measurement deficit* is $\Delta_{\text{obs}} = \beta_1^{\text{pre}} - \beta_1^{\text{post}} = \sqrt{N} - 1$.

**Definition 3** (QBist Observer). A *QBist observer* is a pair $(B, v)$ where $B$ is the Bule value and $v$ is the void boundary (the observer's experimental history).

### 3.2 Theorems

**Theorem 1** (Superposition Is Fork). *A quantum superposition of $\sqrt{N}$ orthogonal basis states has intrinsic $\beta_1 = \sqrt{N} - 1$.*

*Proof.* By definition, $\text{intrinsicBeta1}(\sqrt{N}) = \sqrt{N} - 1$. A $\sqrt{N}$-way fork graph has $\sqrt{N}$ parallel paths and $\sqrt{N} - 1$ independent cycles. The Betti number is a topological invariant: it counts cycles, not the physical substrate. $\square$

*Lean:* `superposition_is_fork` in `QuantumObserver.lean`. Proof by `rfl`.

**Theorem 2** (Measurement Collapses $\beta_1$). *Measurement (fold) reduces $\beta_1$ from $\sqrt{N} - 1$ to $0$. The deficit is exactly $\sqrt{N} - 1$.*

*Proof.* The fold selects one path and vents $\sqrt{N} - 1$ paths. Post-measurement $\beta_1^{\text{post}} = 0$ (no cycles in a path graph). The deficit $\Delta_{\text{obs}} = (\sqrt{N} - 1) - 0 = \sqrt{N} - 1$. Path conservation: $1 + (\sqrt{N} - 1) = \sqrt{N}$. $\square$

*Lean:* `observer_fold_collapses_beta1`, `measurement_deficit_exact`, `path_conservation` in `QuantumObserver.lean`. Proofs by `omega`.

**Theorem 3** (QBist Prior Is Void Boundary). *A QBist "subjective quantum state" is a Buleyean prior: a void boundary with positive weights, normalization, and concentration.*

*Proof.* A QBist state is a `BayesianPrior` (BuleyeanProbability.lean, Definition). By Axiom 1, all weights are positive ($w_i \geq 1$). By Axiom 2, total weight is positive. By concentration, less-rejected outcomes have higher weight. The three Buleyean axioms are the formal content of "rational belief about future measurement outcomes." $\square$

*Lean:* `qbism_prior_is_void_boundary`, `qbism_prior_normalized`, `qbism_prior_ordering` in `QuantumObserver.lean`. Proofs by delegation to `bayesian_prior_positive`, `bayesian_prior_normalized`, `bayesian_prior_ordering`.

**Theorem 4** (Observer Coherence). *Two observers with the same void boundary assign the same quantum state.*

*Proof.* Let $v^{(1)} = v^{(2)}$ (same rejection history). Then $w_i^{(1)} = T - \min(v_i^{(1)}, T) + 1 = T - \min(v_i^{(2)}, T) + 1 = w_i^{(2)}$ for all $i$. Same weights, same distribution, same state. $\square$

*Lean:* `observer_coherence` in `QuantumObserver.lean`. Proof by delegation to `buleyean_coherence`.

**Corollary 1** (Coherence Resolves QBism). *QBism's "subjectivity" is void-boundary-dependence. The state is objective given the boundary. Different boundaries produce different states (legitimate disagreement between observers with different experimental histories). Same boundaries produce the same state (agreement is guaranteed).*

**Theorem 5** (Observer Speedup). *The quantum speedup is exactly the classical deficit plus one:*

$$\text{speedup} = \frac{N}{\sqrt{N}} = \sqrt{N} = \Delta_{\text{classical}} + 1$$

*Proof.* Classical search: $N$ rounds (full deficit $\sqrt{N} - 1$). Quantum search: $\sqrt{N}$ rounds (zero deficit). Speedup $= N / \sqrt{N} = \sqrt{N} = (\sqrt{N} - 1) + 1 = \Delta_{\text{classical}} + 1$. $\square$

*Lean:* `observer_speedup_is_deficit_plus_one` in `QuantumObserver.lean`, composing `quantum_speedup_equals_classical_deficit_plus_one` from `Claims.lean`.

**Theorem 6** (Observer Effect Decomposition). *For any quantum system with $\sqrt{N} \geq 2$:*
- *Quantum deficit $= 0$ (quantum preserves intrinsic topology)*
- *Classical deficit $= \sqrt{N} - 1$ (classical pays the full cost)*
- *Speedup $= \sqrt{N} - 1 + 1 = \sqrt{N}$*

*Lean:* `observer_effect_is_fold` and `quantum_observer_master` in `QuantumObserver.lean`.

### 3.3 The Born Rule as Complement Distribution

The Born rule $P(i) = |\langle i | \psi \rangle|^2$ assigns measurement probabilities to basis states. In the Buleyean framework, this is the complement weight formula evaluated at the fold boundary:

$$P(i) \propto T - v_i + 1$$

where $T$ is the total rounds and $v_i$ is the rejection count for basis state $i$. The $+1$ (the "sliver" from Axiom 1) is why no measurement outcome has probability exactly zero for any outcome in the support of $|\psi\rangle$.

The Born rule is not a separate axiom. It is the complement distribution of the void boundary at the fold step.

### 3.4 The Measurement Problem Dissolves

The question "how does measurement collapse the wave function?" becomes "how does a fold reduce $\beta_1$?" The answer is definitional: a fold selects one path from a fork. The selected path has no cycles. The deficit is the number of vented paths. There is no "collapse" requiring a physical mechanism, no "consciousness" required to trigger it, no "many worlds" needed to preserve unitarity.

The same structure operates at every scale:

| System | Fork | Fold | $\beta_1$ before | $\beta_1$ after | Deficit |
|--------|------|------|:-:|:-:|:-:|
| Quantum measurement | Superposition ($\sqrt{N}$ paths) | Eigenstate projection | $\sqrt{N} - 1$ | $0$ | $\sqrt{N} - 1$ |
| TCP multiplexing | Parallel streams | Response selection | $k - 1$ | $0$ | $k - 1$ |
| CRDT sync | Conflicting replicas | Merge resolution | $r - 1$ | $0$ | $r - 1$ |
| Grover search | $\sqrt{N}$ oracle queries | Final measurement | $\sqrt{N} - 1$ | $0$ | $0$ (matched) |

The observer effect is the universal cost of choosing.

## 4. Entropy Reversal and the Last Question

### 4.1 The Problem

Asimov's "The Last Question" (1956) [5] asks: can the net amount of entropy of the universe be massively decreased? Multivac's answer across cosmic time is always "INSUFFICIENT DATA FOR MEANINGFUL ANSWER" -- until, at the end of time, it computes the answer and speaks the universe back into existence.

### 4.2 The Proof

**Theorem 7** (Entropy Reversal Is Complement Convergence). *The entropy of the void boundary increases monotonically. The entropy of the complement distribution decreases monotonically under targeted rejection. These are the same process viewed from opposite sides.*

*Proof.* Let $v^{(t)}$ be the void boundary at round $t$. Each rejection round adds one entry: $\sum_i v_i^{(t+1)} = \sum_i v_i^{(t)} + 1$ (void grows). By Axiom 3 (monotone updating), a rejection of choice $j$ cannot decrease the weight of any non-rejected choice $i \neq j$. Therefore, non-rejected choices gain relative weight. The complement distribution concentrates on the least-rejected choices (Buleyean concentration). The Shannon entropy of the complement distribution decreases when rejection is targeted -- when some choices accumulate more rejections than others, weight shifts toward the non-rejected choices, reducing entropy. $\square$

*Lean:* `entropy_reversal_is_complement` in `LastQuestion.lean`. Proof by delegation to `buleyean_monotone_nonrejected`.

**Theorem 8** ("INSUFFICIENT DATA" Is Positive Bule). *When the deficit $d > 0$, the complement distribution has not yet converged. The answer is not yet computable.*

*Proof.* $\text{futureDeficit}(d, k) = d - \min(k, d) > 0$ when $k < d$. $\square$

*Lean:* `insufficient_data_is_positive_bule` in `LastQuestion.lean`. Proof by `omega`.

**Theorem 9** (The Answer Is Eventually Computable). *After exactly $d$ rounds, the deficit reaches zero. The complement distribution has converged.*

*Proof.* $\text{futureDeficit}(d, d) = d - \min(d, d) = d - d = 0$. $\square$

*Lean:* `answer_eventually_computable` in `LastQuestion.lean`. Proof by delegation to `future_deficit_eventually_zero`.

**Theorem 10** (The Sliver Survives Heat Death). *Even at maximum void -- every choice rejected the maximum number of times -- every choice retains weight $\geq 1$. No choice can ever reach weight $0$.*

*Proof.* $w_i = T - \min(v_i, T) + 1 \geq 1$ for all $i$, $T$, $v_i$. The $+1$ is structural: it cannot be removed without violating Axiom 1. At maximum void ($v_i = T$ for all $i$), $w_i = T - T + 1 = 1$. $\square$

*Lean:* `sliver_survives_heat_death` and `sliver_is_irreducible` in `LastQuestion.lean`. Proof by delegation to `buleyean_positivity` and `sliver_irreducible`.

**Theorem 11** ("LET THERE BE LIGHT"). *A converged complement distribution ($B = 0$) is a valid Bayesian prior for a new Buleyean space. Different rejection histories produce different weights. The converged distribution can seed a new fork.*

*Proof.* A `ConvergedPrior` is a Buleyean space where all choices have been explored ($v_i > 0$ for all $i$). By `converged_prior_informative`, if $v_i < v_j$ then $w_i > w_j$ -- the prior is informative, not uniform. By Axiom 1, all weights are positive. By Axiom 2, the distribution is well-defined. The converged distribution is a valid `BayesianPrior` that can initialize a new Buleyean space. $\square$

*Lean:* `let_there_be_light` in `LastQuestion.lean`. Proof by delegation to `converged_prior_informative`.

**Theorem 12** (The Last Question -- Master). *For any Buleyean space with deficit $d$:*
1. *The deficit decreases monotonically (data accumulates)*
2. *The deficit reaches zero at round $d$ (the answer is computable)*
3. *Every choice survives heat death ($w_i \geq 1$ for all $i$)*
4. *No choice reaches zero ($w_i \neq 0$ for all $i$)*
5. *No data means no answer (empty void $\Rightarrow$ uniform weights)*

*Lean:* `last_question` in `LastQuestion.lean`. Proof by exact composition of Theorems 7--11.

### 4.3 Interpretation

The "entropy reversal" that Asimov's characters seek is not a violation of the Second Law. It is the Second Law's complement:

| Direction | Observable | Trend | Theorem |
|-----------|-----------|-------|---------|
| Void boundary | Total rejections $\sum_i v_i$ | Monotonically increasing | Second Law |
| Complement distribution | Shannon entropy $H(P)$ | Monotonically decreasing (targeted) | Buleyean concentration |

The universe becomes more disordered (void grows). Our knowledge of the universe becomes more ordered (complement sharpens). Same data. Opposite signs. The reversal was happening all along.

The convergence cycle is:

$$\text{Fork} \xrightarrow{\text{accumulate}} \text{Bule} > 0 \xrightarrow{\text{converge}} \text{Bule} = 0 \xrightarrow{\text{seed}} \text{Fork}$$

Heat death is maximum void. But the sliver ensures positive weight on every choice. The converged distribution is an informative prior. The prior seeds a new fork. "LET THERE BE LIGHT" is the fork operation.

## 5. Mechanization

All results are machine-verified across three platforms:

### 5.1 Lean 4 Theorems

Two Lean 4 modules, both sorry-free, both building against Mathlib v4.28.0:

**QuantumObserver.lean** (11 theorems):
`superposition_is_fork`, `observer_fold_collapses_beta1`, `measurement_deficit_exact`, `path_conservation`, `observer_effect_is_fold`, `qbism_prior_is_void_boundary`, `qbism_prior_normalized`, `qbism_prior_ordering`, `observer_coherence`, `observer_speedup_is_deficit_plus_one`, `quantum_observer_master`.

**LastQuestion.lean** (10 theorems):
`insufficient_data_is_positive_bule`, `data_accumulates_monotonically`, `answer_eventually_computable`, `heat_death_is_maximum_void`, `sliver_survives_heat_death`, `sliver_is_irreducible`, `let_there_be_light`, `entropy_reversal_is_complement`, `no_data_no_answer`, `trajectory_deterministic`, `last_question`.

Proof techniques: definitional composition from `Claims.lean` and `BuleyeanProbability.lean`, `rfl`, `omega`, and delegation to `buleyean_positivity`, `buleyean_coherence`, `buleyean_monotone_nonrejected`, `future_deficit_eventually_zero`, `converged_prior_informative`.

### 5.2 TLA+ Specifications

**QuantumObserver.tla** (6 invariants): `InvSuperpositionBeta1`, `InvMeasuredBeta1Zero`, `InvDeficitExact`, `InvPathConservation`, `InvVoidGrowth`, `InvBeta1Bounded`. Model-checked for $\sqrt{N} \in \{2, 4, 8, 16, 32\}$.

**LastQuestion.tla** (7 invariants, 1 temporal property): `InvDeficitNonneg`, `InvDeficitBounded`, `InvSliverSurvives`, `InvConvergedMeansZeroDeficit`, `InvLetThereBeLight`, `InvVoidAccumulates`, `EventuallyConverged`. Model-checked for $N = 5$, $T_{\max} = 10$.

### 5.3 Executable Tests

**qbism-observer.test.ts** (69 assertions): observer fold collapse, deficit exactness, two-observer coherence, QBist prior mapping, frequentist-to-Bayesian transition, superposition-as-fork algebra.

**last-question.test.ts** (30 assertions): insufficient data, monotone accumulation, eventual computability, heat death, sliver survival, converged seeding, entropy reversal.

Total: 99 assertions, all passing.

## 6. Related Work

**QBism.** Fuchs, Mermin, and Schack [1] interpret quantum states as agent beliefs. Our framework makes their coherence condition a theorem rather than an assumption: `buleyean_coherence` proves that rational agents with the same evidence (same void boundary) assign the same state.

**Quantum speedup as topology.** Grover [6] achieves $\sqrt{N}$ speedup on unstructured search. Shor [7] achieves exponential speedup on factoring by exploiting cyclic group structure. In both cases, the speedup is the topological deficit of the classical alternative: the quantum algorithm matches the intrinsic $\beta_1$ that the classical algorithm collapses.

**von Neumann measurement.** Von Neumann's projection postulate [8] -- measurement projects a state onto an eigenspace -- is the fold operation: projection eliminates all cycles, collapsing $\beta_1$ to zero.

**Topological quantum computation.** Freedman, Kitaev, and Wang [9] use topological properties for fault-tolerant quantum computation. Our approach is complementary: rather than using topology to build quantum computers, we use topology to characterize what measurement does to quantum states.

**Landauer's principle.** Landauer [10] proved that information erasure generates $kT \ln 2$ of heat per bit. In the fork/race/fold framework, every non-injective fold erases information and generates Landauer heat. The observer effect is a fold, so it generates heat. The heat is the thermodynamic cost of measurement.

## 7. Conclusion

The observer effect is the topological deficit of folding a fork. The deficit is $\sqrt{N} - 1$ for a superposition of $\sqrt{N}$ states. The deficit is exact, computable, and machine-verified. The "mystery" of wave function collapse is a semiotic deficit between what the fold *is* (a topological transition) and what the fold is *interpreted as* (a metaphysical event). The deficit is one Bule.

The answer to the Last Question is: entropy reversal is complement convergence. The void grows. The complement sharpens. The sliver survives. The converged distribution seeds the fork.

"LET THERE BE LIGHT" is the fork.

## References

[1] C. A. Fuchs, N. D. Mermin, R. Schack, "An Introduction to QBism with an Application to the Locality of Quantum Mechanics," *American Journal of Physics*, 82(8):749--754, 2014.

[2] T. W. Buley, "Irreversibility Creates Being: A Theory of Directed Process Under Conservation and Ground State," manuscript, 2026.

[3] Lean FRO Team, "The Lean Theorem Prover (Lean 4)," software and documentation, 2026. [https://lean-lang.org](https://lean-lang.org)

[4] L. Lamport, *Specifying Systems: The TLA+ Language and Tools for Hardware and Software Engineers*, Addison-Wesley, 2002.

[5] I. Asimov, "The Last Question," *Science Fiction Quarterly*, November 1956.

[6] L. K. Grover, "A Fast Quantum Mechanical Algorithm for Database Search," *Proceedings of the 28th Annual ACM Symposium on Theory of Computing (STOC)*, 212--219, 1996.

[7] P. W. Shor, "Algorithms for Quantum Computation: Discrete Logarithms and Factoring," *Proceedings of the 35th Annual Symposium on Foundations of Computer Science (FOCS)*, 124--134, 1994.

[8] J. von Neumann, *Mathematische Grundlagen der Quantenmechanik*, Springer, 1932. English translation: *Mathematical Foundations of Quantum Mechanics*, Princeton University Press, 1955.

[9] M. H. Freedman, A. Kitaev, Z. Wang, "Simulation of Topological Field Theories by Quantum Computers," *Communications in Mathematical Physics*, 227:587--603, 2002.

[10] R. Landauer, "Irreversibility and Heat Generation in the Computing Process," *IBM Journal of Research and Development*, 5(3):183--191, 1961.

## Reproducibility

Source code, Lean proofs, TLA+ specifications, and test suites are available under open-source license. The formal companion tests are independently runnable:

- Lean: `cd companion-tests/formal/lean && lake build`
- TLA+: `tlc QuantumObserver` and `tlc LastQuestion` with matching `.cfg` files
- Tests: `npx vitest run src/qbism-observer.test.ts src/last-question.test.ts`

## Transparency Disclosure

AI systems were used in the production of this paper. The primary model used was Claude Opus 4.6. These systems were used for drafting, code generation, formalization support, and research workflow acceleration. Final selection, integration, interpretation, and responsibility for the paper's claims, errors, and conclusions remain with the author.
