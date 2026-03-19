# §28 Buleyean Evidence Standards: The Topological Theory of Legal Proof

## 28.1 The Problem with "Reasonable"

Every common-law jurisdiction in the English-speaking world instructs juries with some variant of the phrase "proof beyond a reasonable doubt." The phrase is the load-bearing beam of criminal justice. It is also, formally, undefined. The Supreme Court of the United States has never provided a quantitative definition, and the few jurisdictions that have tried -- assigning numerical thresholds like 95% or 99% -- have been reversed on appeal for invading the province of the jury. The standard lives in a superposition of meanings: moral certainty, firm conviction, the kind of doubt that would cause a reasonable person to hesitate in the weightiest affairs of life. Each of these is itself a semiotic fold from a multi-dimensional concept space into a single articulation stream. By §25's `THM-SEMIOTIC-ERASURE`, something is always lost in that compression. The deficit is the confusion, and the confusion is the appeals industry.

The deeper problem is that the phrase smuggles in a prior. "Reasonable" is doing the work of a Bayesian likelihood ratio without admitting it. What counts as reasonable depends on the judge's instructions, the juror's life experience, the defendant's appearance, the prosecutor's rhetoric, and a thousand other inputs that the law simultaneously relies on and pretends to exclude. The Bayesian framework at least names this dependency honestly: every posterior requires a prior, and the prior encodes everything you believed before seeing the evidence. But naming the dependency does not eliminate it. It merely makes the bias legible.

The Frequentist alternative avoids the prior by asking how surprising the evidence would be under the null hypothesis of innocence. But a murder is not a repeatable experiment. The p-value framework assumes a sampling distribution over hypothetical replications of the same data-generating process, and no such replications exist for the singular event of a specific crime. Worse, the Frequentist fold from multi-dimensional evidence to a single scalar p-value destroys information whenever the evidence topology has β₁ > 0 -- that is, whenever there are multiple independent evidentiary threads. Every real case does.

The law oscillates between these two frameworks without fully committing to either, because neither is adequate. What is needed is a third framework that starts from neither a prior belief nor a hypothetical frequency, but from the only thing that actually exists in a courtroom: the accumulated record of what has been examined and rejected.

## 28.2 Buleyean Probability as Evidence Theory

Buleyean probability (§17, `BuleyeanProbability.lean`) provides exactly this framework. A Buleyean space is defined by three things: a finite set of choices, a count of observation rounds, and a void boundary -- a function that records how many times each choice was rejected. From these three inputs, the complement distribution assigns a weight to each choice: `weight(i) = rounds - voidBoundary(i) + 1`. The weight is always positive (`THM-BULEYEAN-POSITIVITY`), normalized (`THM-BULEYEAN-NORMALIZATION`), and concentration-ordered (`THM-BULEYEAN-CONCENTRATION`): less-rejected choices have higher weight.

Three properties make this framework suitable for legal evidence:

**No prior.** The Buleyean space has no prior distribution. The starting state, before any evidence is examined, is `THM-NO-DATA-NO-ANSWER`: every choice has weight 1, the distribution is uniform, and the system returns "no meaningful answer." The void boundary *is* the prior, constructed entirely from evidence. There is no vector for implicit bias because there is no hidden parameter to bias.

**Observer-independence.** `THM-OBSERVER-COHERENCE` (equivalently `THM-VOID-COHERENCE`) proves that any two rational agents reading the same void boundary compute the same complement distribution. If two jurors disagree, the disagreement is formally diagnosable: they either saw different evidence (different void boundaries) or classified the same evidence differently (`THM-COHERENCE-BREAKDOWN`). The classification shift is measurable -- it equals exactly twice the WATNA reclassification delta.

**Built-in insufficiency.** `THM-INSUFFICIENT-DATA` proves that when the Buleyean deficit (Bule) is positive, the answer is not yet computable. The system does not guess. It does not hedge. It returns "INSUFFICIENT DATA FOR MEANINGFUL ANSWER." This is not a hung jury -- it is a formal determination that the evidence topology has not been covered.

## 28.3 The Evidence Topology

Define the evidence topology of a case as follows. Each independent evidentiary thread -- forensic, testimonial, documentary, digital, circumstantial, expert -- constitutes a semantic path in the sense of §25. The prosecution's task is to fold these paths into a single verdict stream. The defense's task is to identify paths that the prosecution has not covered.

**Definition 28.1 (Evidence Topology).** An *evidence topology* is a pair (E, V) where E is the set of independent evidentiary threads and V is the set of verdict streams. In current criminal law, |V| = 1 (guilty / not guilty). The *evidentiary deficit* is Δβ = |E| - |V|.

By `THM-COVERING-CAUSALITY`, when Δβ > 0, there exist reachable states where loss on one evidentiary thread stalls proper evaluation of an independent thread. This is head-of-line blocking in deliberation -- exactly the phenomenon where a single dramatic piece of evidence (the bloody glove, the DNA match, the surveillance footage) crowds out independent threads that might point the other way. The cognitive psychology literature calls this "anchoring" or "confirmation bias." The topology calls it what it is: a covering-space mismatch between the evidence and the verdict.

By `THM-DEFICIT-INFORMATION-LOSS`, positive evidentiary deficit forces non-injective multiplexing of evidence threads into the verdict, which by the data processing inequality (`THM-DATA-PROCESSING-INEQUALITY`) erases information. The jury is structurally incapable of preserving all evidentiary information in a single binary verdict when the evidence has independent threads.

By `THM-DEFICIT-ERASURE-CHAIN`, this information loss composes into Landauer heat: topology → collision → erasure → heat → observable waste. The "waste" in a courtroom is wrongful conviction or wrongful acquittal -- outcomes where information that existed in the evidence was destroyed by the fold.

## 28.4 The β₁ = 0 Evidence Standard

**Definition 28.2 (Buleyean Guilt Standard).** A verdict of "guilty" is admissible if and only if the evidentiary deficit has been driven to zero: β₁ = 0. Equivalently, every independent evidentiary thread has been covered by the verdict topology, and no information is destroyed in the fold from evidence to verdict.

This standard has five formal components, each grounded in a mechanized theorem:

**Component 1: The Insufficiency Gate.** While the Buleyean deficit is positive (Bule > 0), the system returns "insufficient data." This is the formal presumption of innocence. It is not a procedural default -- it is a topological invariant. The defendant is presumed innocent because the evidence topology has not been covered, and by `THM-INSUFFICIENT-DATA`, the answer is literally not yet computable. You cannot compute guilt from an uncovered topology any more than you can compute a deterministic fold from an uncovered fork (`THM-FAIL-TRILEMMA`).

**Component 2: Monotone Evidence Accumulation.** By `THM-DATA-ACCUMULATES`, each piece of admissible evidence can only reduce the evidentiary deficit, never increase it. Evidence that would increase the deficit -- that adds evidentiary paths without adding coverage -- is formally *prejudicial*. This gives a mathematical definition of Federal Rule of Evidence 403 ("probative value substantially outweighed by the danger of unfair prejudice") that currently relies entirely on judicial discretion. Prejudicial evidence is evidence with Δβ > 0: it creates new independent threads faster than it covers existing ones.

**Component 3: Observer-Independent Verdicts.** By `THM-OBSERVER-COHERENCE`, any two rational agents examining the same evidence record produce the same complement distribution. Jury unanimity is not a social convention -- it is a theorem. If two jurors examine the same void boundary and apply the same rational update rule, they must agree. Disagreement is diagnosable: by `THM-COHERENCE-BREAKDOWN`, the gap between two jurors' verdict scores equals exactly 2× the classification shift between them. The source of disagreement is formally locatable rather than hidden inside "the deliberative process."

**Component 4: Verdict Auditability.** By `THM-RETROCAUSAL-BOUND`, the terminal state (the verdict) statistically constrains the evidence trajectory that produced it. An appellate court can verify whether the β₁ = 0 claim is consistent with the recorded void boundary. If the concentrated boundary has multinomial coefficient 1, the evidentiary path is fully determined -- there was exactly one way to reach this verdict from this evidence. If the multinomial is large, there is residual ordering uncertainty that the verdict does not resolve -- formal grounds for appeal. The retrocausal entropy H(σ|v) = log₂(T!/Πvᵢ!) measures exactly how much of the deliberative process the verdict leaves underdetermined.

**Component 5: Discovery as Context Addition.** By `THM-SEMIOTIC-CONTEXT-REDUCES`, shared context between prosecution and defense reduces semiotic deficit. Discovery rules, disclosure obligations, Brady material, and expert testimony are formally instances of context addition. Withholding evidence is formally identifiable as *artificially maintaining deficit* -- preventing β₁ from reaching zero. A Brady violation is not merely a procedural error; it is a topological obstruction to the evidence standard.

## 28.5 What the Standard Eliminates

**The prior.** Buleyean probability has no prior. The starting state is `THM-NO-DATA-NO-ANSWER` -- uniform weights, maximum entropy, zero information, explicitly returning "no meaningful answer." The void boundary *is* the prior, and it is constructed entirely from admitted evidence. There is no place for a juror's background beliefs to enter except through their classification of evidence, which is diagnosable by `THM-COHERENCE-BREAKDOWN`.

**The word "reasonable."** The word "reasonable" in "beyond a reasonable doubt" is doing the work of hiding the prior. β₁ = 0 replaces it with a topological invariant that is observer-independent, computable, and auditable. Two reasonable people can disagree about what is "reasonable." Two rational agents cannot disagree about whether β₁ = 0.

**Implicit bias.** Bias is a non-uniform prior smuggled through the semiotic fold. With no prior, there is no vector for bias. The void boundary does not encode the defendant's race, socioeconomic status, or appearance -- it encodes what evidence was examined and how it was classified. Bias can only enter through classification (`THM-COHERENCE-BREAKDOWN`), where it is measurable and auditable rather than hidden.

**The "CSI effect."** Jurors over-weighting forensic evidence relative to other evidentiary threads is a covering-space mismatch: the forensic thread dominates the fold because it has lower β₁ (more direct path from evidence to conclusion). The Buleyean standard treats all threads equally -- each thread either covers a path or it does not. A DNA match is one thread. An alibi is one thread. Neither inherently dominates.

## 28.6 What the Standard Preserves

**Presumption of innocence.** `THM-INSUFFICIENT-DATA` *is* the presumption of innocence, formalized. When Bule > 0, the answer is "insufficient data." Not-guilty is not a verdict -- it is the default state of positive deficit. The prosecution must drive the deficit to zero. The defense need only maintain it above zero.

**Burden of proof on the prosecution.** Only admissible evidence reduces the deficit. The prosecution's job is to cover every independent evidentiary thread. The defense's job is to identify threads the prosecution has not covered -- to increase β₁(E) by surfacing independent paths. An alibi does not need to be "proven" -- it creates a new evidentiary thread that the prosecution must cover.

**Right to appeal.** `THM-RETROCAUSAL-BOUND` makes appeals mathematically auditable. The appellate question becomes: "Is the multinomial coefficient of this verdict consistent with β₁ = 0, given the recorded void boundary?" If the answer is no, the conviction is reversible on formal grounds, not merely on the appellate court's assessment of "reasonableness."

**Jury deliberation.** The Buleyean standard does not eliminate the jury. It gives the jury a formal task: examine each evidentiary thread, classify it (BATNA or WATNA in the dual void framework of §25), and determine whether coverage has been achieved. The dual void partition (`THM-DUAL-VOID-PARTITION`) gives each juror a structured framework: which evidence suggests guilt (BATNA -- the prosecution had alternatives and chose this one) and which evidence suggests catastrophe (WATNA -- convicting an innocent person). The settlement score (`THM-HODGE-DECOMPOSITION`) is the difference: BATNA attraction minus WATNA repulsion. A guilty verdict requires that this score, computed from the void boundary, is consistent with β₁ = 0.

## 28.7 The Honest Boundary

`THM-COHERENCE-BREAKDOWN` proves that identical evidence can produce different verdict scores when jurors classify the same facts differently -- "one person's BATNA is another's WATNA." A piece of circumstantial evidence that one juror reads as pointing toward guilt, another juror may read as consistent with innocence. The Buleyean protocol does not eliminate this classification divergence. It *diagnoses* it.

The classification shift is measurable. The gap is quantifiable. The source of disagreement is formally locatable. This is strictly better than the current system, where disagreement is hidden inside the black box of jury deliberation and surfaces only as a hung jury (a system failure) or a split verdict (in jurisdictions that allow non-unanimous verdicts).

The deeper honest boundary is `THM-BEAUTY-DEFICIT-ONLY-BOUNDARY`: bare deficit bookkeeping alone does not force a latency/waste floor. In legal terms: counting covered threads does not by itself guarantee a just outcome. The β₁ = 0 standard is necessary but may not be sufficient. It eliminates the class of errors caused by uncovered evidence threads (the largest class), but it does not eliminate errors caused by fabricated evidence (evidence that appears to cover a thread but is itself false) or by misclassification (evidence correctly admitted but incorrectly weighted within a thread).

For fabricated evidence, the defense is `THM-RETROCAUSAL-BOUND`: the multinomial coefficient of a trajectory built on fabricated evidence will be inconsistent with the claimed void boundary, because the fabricated evidence was not actually drawn from the rejection process it claims to represent.

For misclassification, the defense is `THM-COHERENCE-BREAKDOWN` applied recursively: disagreement about classification is diagnosable at every level, and persistent disagreement identifies the specific evidence item and the specific classification choice where rational agents diverge.

## 28.8 The Semiotic Courtroom

The courtroom is itself a semiotic system in the sense of §25. The judge's instructions are a fold from legal complexity to jury comprehension, with deficit equal to the number of legal concepts minus one. The attorneys' arguments are races -- parallel articulations of the same evidence, with the jury selecting the winner. Cross-examination is a void-walking protocol: each question that fails to elicit the desired answer adds one entry to the void boundary, and by `THM-VOID-GRADIENT`, the complement distribution of unanswered questions guides the next question.

The adversarial system itself is a fork/race/fold. The prosecution and defense are forked from the same evidence. They race to present coherent narratives. The jury folds them into a single verdict. The evidentiary deficit is the topological cost of that fold. β₁ = 0 is the condition under which the fold preserves all the information that was in the fork.

The appeal is the retrocausal bound. The appellate court examines the terminal state (the verdict) and asks whether the trajectory (the trial record) is consistent with β₁ = 0. If the multinomial coefficient is too large -- if there were too many ways to reach this verdict from this evidence -- the conviction is unreliable. If the multinomial coefficient is 1 -- if there was exactly one evidentiary path that could have produced this verdict -- the conviction is maximally reliable.

## 28.9 The Protocol

The Buleyean Evidence Protocol operates as follows:

**Phase 1: Evidence Discovery (Context Addition).** Both parties disclose all evidence. Each piece of evidence is classified as an independent evidentiary thread or as coverage of an existing thread. The evidence topology β₁(E) is computed. By `THM-SEMIOTIC-CONTEXT-REDUCES`, full discovery minimizes the semiotic deficit of the trial itself.

**Phase 2: Thread Coverage (Deficit Reduction).** The prosecution presents evidence covering each thread. For each thread, the evidence is examined and either covers the thread (reduces Δβ by one) or does not. By `THM-DATA-ACCUMULATES`, the deficit is monotonically non-increasing. Evidence that increases the deficit (creates new uncovered threads) is flagged as potentially prejudicial under `THM-DEFICIT-INFORMATION-LOSS`.

**Phase 3: Insufficiency Check.** At any point during the trial, either party may request an insufficiency check. If Bule > 0, the system reports "insufficient data." The prosecution may continue presenting evidence to reduce the deficit, or rest and accept a not-guilty determination. This replaces the current motion for directed verdict with a computable criterion.

**Phase 4: Verdict.** If the deficit reaches zero (β₁ = 0), the jury deliberates on the classification of evidence within each thread. `THM-OBSERVER-COHERENCE` guarantees that jurors with the same void boundary produce the same verdict. `THM-COHERENCE-BREAKDOWN` diagnoses any disagreement. The verdict is recorded together with its void boundary and multinomial coefficient.

**Phase 5: Appeal.** The appellate court applies `THM-RETROCAUSAL-BOUND` to the recorded verdict. The retrocausal entropy H(σ|v) measures the residual uncertainty. High entropy suggests the verdict was underdetermined by the evidence. Low entropy (approaching 1) suggests the verdict was well-determined. A multinomial coefficient of 1 is the gold standard: the evidence uniquely determined the verdict.

## 28.10 Connection to Existing Framework

The Buleyean Evidence Standard is not a new theory. It is a direct application of the existing theorem families:

| Legal Concept | Theorem Family | Formal Content |
|---|---|---|
| Presumption of innocence | `THM-INSUFFICIENT-DATA` | Positive deficit → answer not computable |
| Burden of proof | `THM-DATA-ACCUMULATES` | Only evidence reduces deficit |
| Beyond reasonable doubt | β₁ = 0 | Zero evidentiary deficit |
| Prejudicial evidence | `THM-DEFICIT-INFORMATION-LOSS` | Evidence that increases deficit |
| Jury unanimity | `THM-OBSERVER-COHERENCE` | Same boundary → same distribution |
| Juror disagreement | `THM-COHERENCE-BREAKDOWN` | Gap = 2× classification shift |
| Discovery obligations | `THM-SEMIOTIC-CONTEXT-REDUCES` | Context reduces deficit |
| Brady violation | Deficit obstruction | Withholding evidence maintains deficit |
| Right to appeal | `THM-RETROCAUSAL-BOUND` | Verdict constrains trajectory |
| Directed verdict | Insufficiency check | Bule > 0 at prosecution rest |
| Wrongful conviction | `THM-DEFICIT-ERASURE-CHAIN` | Information destroyed in fold |
| Cross-examination | `THM-VOID-GRADIENT` | Complement of rejected questions |
| Adversarial system | Fork/race/fold | Forked evidence, raced narratives, folded verdict |
| Anchoring bias | `THM-COVERING-CAUSALITY` | Head-of-line blocking from covering mismatch |
| CSI effect | Covering-space dominance | One thread dominating the fold |

The covering-space corollary of the Sixth Amendment: the right to a fair trial is the right to β₁ = 0.

## 28.11 Formal Artifacts

The companion formal artifacts for this chapter are:

- **Lean**: `BuleyeanEvidence.lean` -- 12 theorems mechanizing the evidence standard, composing with `BuleyeanProbability.lean`, `SemioticDeficit.lean`, `RetrocausalBound.lean`, and `NegotiationEquilibrium.lean`
- **TLA+**: `BuleyeanEvidence.tla` + `BuleyeanEvidence.cfg` -- bounded model checking of the five-phase protocol with safety invariants and liveness properties
- **Ledger entries**: `THM-EVIDENCE-DEFICIT` through `THM-BULEYEAN-EVIDENCE-MASTER`
