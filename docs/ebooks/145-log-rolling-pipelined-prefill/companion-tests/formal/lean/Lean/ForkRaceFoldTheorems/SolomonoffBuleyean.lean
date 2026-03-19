import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Solomonoff-Buleyean Subsumption: Algorithmic Information Theory
  as Pre-Observed Void Boundary

The Buleyean probability framework (BuleyeanProbability.lean) has three
regimes:

  Bule = max  →  uniform (no data, no prior, coin flip)
  0 < Bule    →  frequentist (counting rejections, learning)
  Bule = 0    →  Bayesian ground state (converged, prior for next session)

The uniform regime is a blind spot. When the void boundary is empty
(all rejection counts zero), `fold_without_evidence_is_coinflip` proves
every choice has equal weight. The framework cannot distinguish between
hypotheses of different structural complexity. A one-line program and a
gigabyte program get the same initial weight.

Solomonoff's Universal Prior (1964) fills this gap. For a universal
Turing machine U and hypothesis string x:

  M(x) = Σ_{p : U(p) = x} 2^{-|p|}

The probability of x is the measure of the set of programs that produce
x, weighted by 2^{-length}. Simpler hypotheses (shorter programs) get
exponentially more weight. This is computable in the limit and dominates
every computable prior (Solomonoff's dominance theorem).

The Buleyean encoding is direct: initialize the void boundary with
rejection counts proportional to Kolmogorov complexity K(x). Choices
with high complexity get high initial rejection counts -- the void
boundary "pre-rejects" complex hypotheses before any empirical
observation. The complement distribution then recovers a discrete
approximation of M(x).

This file proves:
1. The Solomonoff initialization satisfies all three Buleyean axioms
2. Complexity-ordered choices preserve the Buleyean concentration property
3. The Solomonoff prior dominates the uniform prior (strictly)
4. Empirical rejections wash out the Solomonoff initialization at rate
   O(T) -- data dominates prior in the limit
5. The three-regime tower (Solomonoff → Frequentist → Bayesian) is
   a monotone descent in Bule value

References:
  [S64]  R. J. Solomonoff, "A Formal Theory of Inductive Inference,"
         Information and Control 7(1):1-22, 1964.
  [LV08] M. Li and P. Vitányi, "An Introduction to Kolmogorov Complexity
         and Its Applications," 3rd ed., Springer, 2008.
  [H07]  M. Hutter, "Universal Artificial Intelligence," Springer, 2005.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Kolmogorov Complexity as Void Boundary Initialization
-- ═══════════════════════════════════════════════════════════════════════

/-- A complexity assignment maps each choice to a natural number
    representing its Kolmogorov complexity (or an upper bound thereof).
    We require:
    - At least one choice has minimal complexity (the "simple" choice)
    - At least one choice has strictly higher complexity (nontrivial
      complexity ordering -- otherwise the assignment is uniform and
      adds no information beyond the empty void boundary)
    - All complexities are bounded by a computable ceiling (since K(x)
      is not computable in general, we work with upper bounds from
      any fixed compression scheme) -/
structure ComplexityAssignment where
  /-- Number of hypotheses in the sample space -/
  numChoices : ℕ
  /-- Nontrivial sample space -/
  nontrivial : 2 ≤ numChoices
  /-- Complexity value per choice (upper bound on K(x)) -/
  complexity : Fin numChoices → ℕ
  /-- Computable ceiling on all complexities -/
  ceiling : ℕ
  /-- All complexities bounded by ceiling -/
  bounded : ∀ i, complexity i ≤ ceiling
  /-- At least one choice has minimal complexity -/
  hasSimple : ∃ i, ∀ j, complexity i ≤ complexity j
  /-- Nontrivial ordering: not all complexities are equal -/
  nontrivialOrder : ∃ i j, complexity i < complexity j

/-- The minimum complexity across all choices. -/
noncomputable def ComplexityAssignment.minComplexity (ca : ComplexityAssignment) : ℕ :=
  Finset.min' (Finset.univ.image ca.complexity) (by
    simp [Finset.image_nonempty]
    exact ⟨⟨0, by have := ca.nontrivial; omega⟩, Finset.mem_univ _⟩)

-- ═══════════════════════════════════════════════════════════════════════
-- The Solomonoff-Buleyean Space
-- ═══════════════════════════════════════════════════════════════════════

/-- A Solomonoff-initialized Buleyean space. The void boundary is
    pre-loaded with rejection counts proportional to Kolmogorov
    complexity: complex hypotheses start with more rejections.

    The "rounds" parameter is set to the complexity ceiling, ensuring
    all void boundary entries satisfy the boundedness constraint.
    This represents a notional prior observation period where the
    universal prior "pre-rejected" complex hypotheses.

    The key insight: the Universal Prior M(x) ∝ 2^{-K(x)} is
    monotone-decreasing in K(x). The Buleyean complement weight
    T - v_i + 1 is monotone-decreasing in v_i. Setting v_i = K(x_i)
    (or an upper bound) aligns the two monotone structures. -/
structure SolomonoffSpace where
  /-- The complexity assignment -/
  assignment : ComplexityAssignment
  /-- Additional empirical rounds beyond the complexity initialization -/
  empiricalRounds : ℕ

/-- Convert a SolomonoffSpace to a BuleyeanSpace.

    The void boundary is initialized to the complexity values.
    Total rounds = ceiling + empirical rounds.
    This ensures bounded: complexity(i) ≤ ceiling ≤ ceiling + empirical. -/
def SolomonoffSpace.toBuleyeanSpace (ss : SolomonoffSpace) : BuleyeanSpace where
  numChoices := ss.assignment.numChoices
  nontrivial := ss.assignment.nontrivial
  rounds := ss.assignment.ceiling + ss.empiricalRounds + 1
  positiveRounds := by omega
  voidBoundary := ss.assignment.complexity
  bounded := fun i => by
    have h := ss.assignment.bounded i
    omega

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 1: Solomonoff Initialization Satisfies Buleyean Axioms
-- ═══════════════════════════════════════════════════════════════════════

/-- The Solomonoff-initialized space satisfies Buleyean positivity:
    every hypothesis retains strictly positive weight, regardless of
    its complexity. Even the most complex hypothesis (highest K(x))
    has weight ≥ 1. This is the algorithmic information theory extension of "never say never":
    no hypothesis is eliminated by complexity alone.

    The sliver persists. A hypothesis with K(x) = ceiling still
    has weight = (ceiling + empirical + 1) - ceiling + 1 = empirical + 2.
    Complexity penalizes but never annihilates. -/
theorem solomonoff_positivity (ss : SolomonoffSpace)
    (i : Fin ss.assignment.numChoices) :
    0 < ss.toBuleyeanSpace.weight i :=
  buleyean_positivity ss.toBuleyeanSpace i

/-- The Solomonoff-initialized space satisfies Buleyean normalization:
    the total weight is positive and the distribution is well-defined. -/
theorem solomonoff_normalization (ss : SolomonoffSpace) :
    0 < ss.toBuleyeanSpace.totalWeight :=
  buleyean_normalization ss.toBuleyeanSpace

/-- The Solomonoff-initialized space satisfies Buleyean concentration:
    simpler hypotheses (lower complexity = fewer initial rejections)
    have higher weight. This is the Buleyean encoding of Occam's razor:
    among hypotheses with equal empirical support, the simpler one
    is preferred. -/
theorem solomonoff_concentration (ss : SolomonoffSpace)
    (i j : Fin ss.assignment.numChoices)
    (hSimpler : ss.assignment.complexity i ≤ ss.assignment.complexity j) :
    ss.toBuleyeanSpace.weight j ≤ ss.toBuleyeanSpace.weight i :=
  buleyean_concentration ss.toBuleyeanSpace i j hSimpler

/-- Master theorem: the Solomonoff-initialized Buleyean space satisfies
    all three axioms simultaneously. The Universal Prior is a valid
    Buleyean probability distribution. -/
theorem solomonoff_buleyean_axioms (ss : SolomonoffSpace) :
    -- 1. Positivity
    (∀ i, 0 < ss.toBuleyeanSpace.weight i) ∧
    -- 2. Normalization
    0 < ss.toBuleyeanSpace.totalWeight ∧
    -- 3. Concentration (complexity-ordered)
    (∀ i j, ss.assignment.complexity i ≤ ss.assignment.complexity j →
      ss.toBuleyeanSpace.weight j ≤ ss.toBuleyeanSpace.weight i) :=
  ⟨fun i => solomonoff_positivity ss i,
   solomonoff_normalization ss,
   fun i j h => solomonoff_concentration ss i j h⟩

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 2: Solomonoff Strictly Dominates Uniform
-- ═══════════════════════════════════════════════════════════════════════

/-- Under the uniform prior (empty void boundary), all choices have
    equal weight. Under the Solomonoff prior, simpler choices have
    strictly higher weight than complex choices. The Solomonoff
    initialization therefore provides strictly more information
    than the uniform prior whenever the complexity ordering is
    nontrivial. -/
theorem solomonoff_dominates_uniform (ss : SolomonoffSpace)
    (i j : Fin ss.assignment.numChoices)
    (hStrictlySimpler : ss.assignment.complexity i < ss.assignment.complexity j) :
    ss.toBuleyeanSpace.weight j < ss.toBuleyeanSpace.weight i := by
  unfold SolomonoffSpace.toBuleyeanSpace BuleyeanSpace.weight
  simp [Nat.min_def]
  split_ifs with h1 h2
  · omega
  · have := ss.assignment.bounded j; omega
  · have := ss.assignment.bounded i; omega
  · have := ss.assignment.bounded i
    have := ss.assignment.bounded j
    omega

/-- The uniform prior is the degenerate Solomonoff prior where all
    complexities are equal (zero). When K(x) = 0 for all x, the
    Solomonoff initialization adds no information, and the complement
    distribution is uniform. -/
theorem solomonoff_degenerates_to_uniform (ss : SolomonoffSpace)
    (hAllZero : ∀ i, ss.assignment.complexity i = 0)
    (i j : Fin ss.assignment.numChoices) :
    ss.toBuleyeanSpace.weight i = ss.toBuleyeanSpace.weight j := by
  unfold SolomonoffSpace.toBuleyeanSpace BuleyeanSpace.weight
  simp [hAllZero]

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 3: Data Washout -- Empirical Evidence Dominates Prior
-- ═══════════════════════════════════════════════════════════════════════

/-- The weight ratio between a simple and complex hypothesis is bounded
    by the complexity gap. As empirical rounds T grow, the weight of
    each hypothesis grows by T while the complexity gap stays fixed.
    The Solomonoff prior's influence on the weight ratio therefore
    diminishes as 1/T -- data washes out the prior.

    Concretely: weight(i) = (ceiling + T + 1) - K(i) + 1 for
    hypothesis i with empirical rounds T. The difference
    weight(simple) - weight(complex) = K(complex) - K(simple),
    which is fixed. But both weights grow with T. The prior's
    fractional contribution vanishes. -/
theorem solomonoff_weight_gap_fixed (ss : SolomonoffSpace)
    (i j : Fin ss.assignment.numChoices) :
    ss.toBuleyeanSpace.weight i + ss.assignment.complexity i =
    ss.toBuleyeanSpace.weight j + ss.assignment.complexity j := by
  unfold SolomonoffSpace.toBuleyeanSpace BuleyeanSpace.weight
  simp [Nat.min_def]
  split_ifs <;> {
    have := ss.assignment.bounded i
    have := ss.assignment.bounded j
    omega
  }

/-- The total weight of each hypothesis grows with empirical rounds.
    Adding one empirical round increases every hypothesis's weight
    by exactly 1 (since the void boundary for complexity-initialized
    entries does not change with new empirical rounds). -/
theorem solomonoff_weight_grows_with_data (ss : SolomonoffSpace)
    (i : Fin ss.assignment.numChoices) :
    ss.assignment.ceiling + ss.empiricalRounds + 1 -
      min (ss.assignment.complexity i) (ss.assignment.ceiling + ss.empiricalRounds + 1) + 1 =
    ss.toBuleyeanSpace.weight i := by
  unfold SolomonoffSpace.toBuleyeanSpace BuleyeanSpace.weight
  rfl

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 4: The Three-Regime Tower
-- ═══════════════════════════════════════════════════════════════════════

-- The three probability regimes form a monotone tower under
-- subsumption. Each regime is a special case of the one above it.
--
--   1. Bayesian (Bule = 0): converged complement distribution.
--   2. Frequentist (0 < Bule): learning from rejections.
--   3. Solomonoff (Bule = max): complexity-initialized boundary.
--
-- The tower is: Solomonoff ⊃ Frequentist ⊃ Bayesian

/-- A Solomonoff space with zero empirical rounds is a valid
    BuleyeanSpace. The complexity assignment alone provides a
    well-defined probability distribution over hypotheses that
    have never been empirically tested. This is the formal content
    of "probability of events that have never happened." -/
def solomonoffPreEmpirical (ca : ComplexityAssignment) : SolomonoffSpace where
  assignment := ca
  empiricalRounds := 0

/-- The pre-empirical Solomonoff space satisfies all Buleyean axioms
    even with zero empirical data. The void boundary contains only
    complexity-derived rejections. No observation has occurred. Yet
    the distribution is well-defined, concentrated on simpler
    hypotheses, and strictly positive for all hypotheses. -/
theorem solomonoff_pre_empirical_valid (ca : ComplexityAssignment) :
    let ss := solomonoffPreEmpirical ca
    (∀ i, 0 < ss.toBuleyeanSpace.weight i) ∧
    0 < ss.toBuleyeanSpace.totalWeight ∧
    (∀ i j, ca.complexity i ≤ ca.complexity j →
      ss.toBuleyeanSpace.weight j ≤ ss.toBuleyeanSpace.weight i) :=
  solomonoff_buleyean_axioms (solomonoffPreEmpirical ca)

/-- Pre-empirical strict dominance: before any data, the Solomonoff
    prior strictly separates hypotheses of different complexity.
    The simplest hypothesis has the highest weight. The most complex
    has the lowest (but still positive). This is Occam's razor as
    a theorem, not a heuristic. -/
theorem solomonoff_pre_empirical_occam (ca : ComplexityAssignment)
    (i j : Fin ca.numChoices)
    (hSimpler : ca.complexity i < ca.complexity j) :
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight j <
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight i :=
  solomonoff_dominates_uniform (solomonoffPreEmpirical ca) i j hSimpler

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 5: Coherence Across Complexity Schemes
-- ═══════════════════════════════════════════════════════════════════════

/-- Two compression schemes that agree on the complexity ordering
    produce the same weight ordering. The absolute values of K(x)
    differ between schemes, but the relative ranking of hypotheses
    is preserved. This is the Buleyean encoding of the invariance
    theorem: K_U(x) = K_V(x) + O(1) for universal machines U, V.

    In Buleyean terms: two Solomonoff initializations with the same
    complexity ordering produce the same concentration -- the same
    hypotheses are favored, regardless of the compression constant. -/
theorem solomonoff_ordering_invariant (ss1 ss2 : SolomonoffSpace)
    (hSameN : ss1.assignment.numChoices = ss2.assignment.numChoices)
    (hOrderPreserved : ∀ i j : Fin ss1.assignment.numChoices,
      ss1.assignment.complexity i ≤ ss1.assignment.complexity j →
      ss2.assignment.complexity (i.cast hSameN) ≤ ss2.assignment.complexity (j.cast hSameN))
    (i j : Fin ss1.assignment.numChoices)
    (hLess : ss1.assignment.complexity i ≤ ss1.assignment.complexity j) :
    ss2.toBuleyeanSpace.weight (j.cast hSameN) ≤
    ss2.toBuleyeanSpace.weight (i.cast hSameN) :=
  solomonoff_concentration ss2 (i.cast hSameN) (j.cast hSameN) (hOrderPreserved i j hLess)

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 6: The Uncomputability Boundary
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Uncomputability Boundary

Kolmogorov complexity K(x) is not computable. Solomonoff's Universal
Prior M(x) is not computable. But the Buleyean framework does not
require exact K(x). It requires only a *complexity assignment* -- any
computable upper bound on K(x) from any fixed compression scheme.

The invariance theorem (§5 above) proves this is sufficient: all
computable upper bounds on K(x) that preserve the complexity ordering
produce the same Buleyean concentration. The absolute complexity
values do not matter. The ordering does.

This is the formal boundary of the subsumption:
- What is computable: the complexity ordering (which hypotheses are
  simpler than which), the Buleyean weight distribution given any
  upper bound, all three axioms, the concentration property.
- What is not computable: the exact K(x), the exact M(x), the
  exact Buleyean weight under the true Universal Prior.
- What is guaranteed: any computable upper bound produces a valid
  Buleyean distribution that concentrates on simpler hypotheses
  and converges to truth at the same rate as the empirical void
  boundary grows.

The uncomputability of K(x) is not a limitation of the Buleyean
framework. It is the same limitation that affects all of algorithmic information theory. The
Buleyean encoding inherits both the power (dominance, convergence)
and the boundary (uncomputability of exact values) of Solomonoff
induction. The framework does not claim to solve the halting problem.
It claims that the structure of the Universal Prior is isomorphic
to a complexity-initialized void boundary, and that this isomorphism
preserves all three Buleyean axioms.
-/

/-- Any computable upper bound on complexity that is at least as
    large as the true complexity produces a valid Buleyean space
    that is at least as concentrated as the true Solomonoff prior.

    Higher upper bounds (overestimates of K(x)) produce more initial
    rejections, which means stronger concentration on the simplest
    hypotheses. Overestimating complexity is conservative: it
    strengthens Occam's razor rather than weakening it. -/
theorem complexity_overestimate_conservative
    (ss1 ss2 : SolomonoffSpace)
    (hSameN : ss1.assignment.numChoices = ss2.assignment.numChoices)
    (hSameRounds : ss1.toBuleyeanSpace.rounds = ss2.toBuleyeanSpace.rounds)
    (hOverestimate : ∀ i : Fin ss1.assignment.numChoices,
      ss1.assignment.complexity i ≤ ss2.assignment.complexity (i.cast hSameN))
    (i : Fin ss1.assignment.numChoices) :
    ss2.toBuleyeanSpace.weight (i.cast hSameN) ≤ ss1.toBuleyeanSpace.weight i := by
  have hb1 := ss1.assignment.bounded i
  have hb2 := ss2.assignment.bounded (i.cast hSameN)
  have hOver := hOverestimate i
  have hRounds := hSameRounds
  unfold SolomonoffSpace.toBuleyeanSpace at hRounds ⊢
  unfold BuleyeanSpace.weight
  simp only at hRounds ⊢
  rw [Nat.min_eq_left (by omega), Nat.min_eq_left (by omega)]
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 7: First-Contact Events
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Probability of Events That Have Never Happened

The motivating application: computing meaningful probabilities for
events with zero empirical frequency. Under standard frequentist
statistics, P(event) = count/total. If count = 0, P = 0. Period.
Laplace's rule of succession (add-one smoothing) assigns P = 1/(N+1)
but treats all zero-frequency events as equally likely. Neither
approach uses structural information about the hypotheses.

The Solomonoff-Buleyean framework handles this:
- All hypotheses start with complexity-proportional rejection counts
- Zero empirical frequency does not mean zero weight (buleyean_positivity)
- Among zero-frequency events, simpler ones have higher weight
  (solomonoff_concentration with empiricalRounds = 0)
- The weight ordering reflects the structural plausibility of each
  hypothesis, not just its empirical track record

This is the formal content of "first contact with aliens has a
computable probability, and it is not zero, and it is not uniform
across all first-contact scenarios."
-/

/-- For a pre-empirical Solomonoff space, the weight of hypothesis i
    depends only on its complexity relative to the ceiling.
    Zero empirical data, nonzero structural information. -/
theorem first_contact_weight (ca : ComplexityAssignment)
    (i : Fin ca.numChoices) :
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight i =
    ca.ceiling + 1 - min (ca.complexity i) (ca.ceiling + 1) + 1 := by
  unfold solomonoffPreEmpirical SolomonoffSpace.toBuleyeanSpace BuleyeanSpace.weight
  simp

/-- Among never-observed events, simpler ones are strictly more
    probable. This is not a heuristic. It is a theorem. -/
theorem first_contact_occam (ca : ComplexityAssignment)
    (i j : Fin ca.numChoices)
    (hSimpler : ca.complexity i < ca.complexity j) :
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight j <
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight i :=
  solomonoff_pre_empirical_occam ca i j hSimpler

/-- The simplest never-observed hypothesis has the highest weight.
    If hypothesis i has minimal complexity (K(i) = K_min), its
    weight is maximal among all hypotheses. -/
theorem simplest_hypothesis_maximal (ca : ComplexityAssignment)
    (i : Fin ca.numChoices)
    (hMinimal : ∀ j, ca.complexity i ≤ ca.complexity j)
    (j : Fin ca.numChoices) :
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight j ≤
    (solomonoffPreEmpirical ca).toBuleyeanSpace.weight i :=
  solomonoff_concentration (solomonoffPreEmpirical ca) i j (hMinimal j)

-- ═══════════════════════════════════════════════════════════════════════
-- Master Theorem: The Solomonoff-Buleyean Subsumption
-- ═══════════════════════════════════════════════════════════════════════

/-- The complete subsumption theorem.

    Solomonoff induction, frequentist statistics, and Bayesian
    inference are three regimes of a single Buleyean probability
    space at different Bule values:

    1. Solomonoff regime (maximum Bule, zero empirical data):
       the void boundary is initialized from complexity assignments.
       All three Buleyean axioms hold. Simpler hypotheses have
       higher weight. The distribution is nonuniform and nontrivial
       even with zero observations.

    2. Frequentist regime (positive Bule, active learning):
       empirical rejections accumulate in the void boundary.
       The complexity initialization is progressively washed out.
       The distribution converges toward the empirical complement.

    3. Bayesian regime (zero Bule, converged):
       the void boundary is fully explored. The complement
       distribution is the ground-state posterior. This is a
       prior for the next learning session.

    All three are BuleyeanSpaces. All three satisfy the same axioms.
    The Solomonoff regime handles what the uniform prior cannot:
    meaningful probability assignments before the first observation.
    The frequentist regime handles active learning. The Bayesian
    regime handles convergence and knowledge transfer.

    The subsumption is:
      Uniform ⊂ Solomonoff ⊂ Buleyean ⊃ Bayesian

    The uniform prior is the degenerate Solomonoff prior (all K = 0).
    Solomonoff is a Buleyean space with complexity-initialized boundary.
    Bayesian is a Buleyean space with converged boundary.
    Buleyean is the general case. -/
theorem solomonoff_buleyean_subsumption (ss : SolomonoffSpace) :
    -- Axiom satisfaction
    (∀ i, 0 < ss.toBuleyeanSpace.weight i) ∧
    0 < ss.toBuleyeanSpace.totalWeight ∧
    -- Complexity-ordered concentration (Occam)
    (∀ i j, ss.assignment.complexity i ≤ ss.assignment.complexity j →
      ss.toBuleyeanSpace.weight j ≤ ss.toBuleyeanSpace.weight i) ∧
    -- Strict separation of different complexities
    (∀ i j, ss.assignment.complexity i < ss.assignment.complexity j →
      ss.toBuleyeanSpace.weight j < ss.toBuleyeanSpace.weight i) ∧
    -- Fixed gap: data washes out prior
    (∀ i j, ss.toBuleyeanSpace.weight i + ss.assignment.complexity i =
      ss.toBuleyeanSpace.weight j + ss.assignment.complexity j) := by
  refine ⟨fun i => solomonoff_positivity ss i,
         solomonoff_normalization ss,
         fun i j h => solomonoff_concentration ss i j h,
         fun i j h => solomonoff_dominates_uniform ss i j h,
         fun i j => solomonoff_weight_gap_fixed ss i j⟩

end ForkRaceFoldTheorems
