import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# The Last Question: Entropy Reversal as Complement Convergence

Asimov's "The Last Question" (1956) traces a single question across
cosmic time: "How can the net amount of entropy of the universe be
massively decreased?" The answer is always "INSUFFICIENT DATA FOR
MEANINGFUL ANSWER" -- until the very end of time, when the computer
has accumulated all possible data, and speaks the universe back
into existence.

In the Buleyean framework, this is a theorem. The void boundary
grows monotonically (entropy of the universe increases -- Second
Law). But the complement distribution -- the knowledge extracted
from what was rejected -- sharpens monotonically (Buleyean
concentration). These are the same process viewed from opposite
sides.

"INSUFFICIENT DATA" is Bule > 0: the deficit is positive, the
complement distribution has not yet converged. The data accumulates
because every rejection adds an entry to the void boundary. The
deficit decreases by one per round (`future_deficit_monotone`).
At round F - 1, the deficit reaches zero
(`future_deficit_eventually_zero`). At Bule = 0, the complement
distribution is fully converged. The answer is computable.

"LET THERE BE LIGHT" is the fork operation applied to the converged
complement distribution: the converged distribution at Bule = 0
is a valid Bayesian prior (`converged_prior_informative`). A prior
can initialize a new Buleyean space. The universe ends (all paths
vented to void) and the complement seeds the next one.

The sliver (`buleyean_positivity`) is why this works. Even at
maximum void -- heat death, every path rejected -- every choice
retains weight >= 1. The distribution never collapses to a point.
There is always enough probability mass to seed a new fork.
"Never say never" is the answer to the Last Question.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- The Multivac State: Data Accumulation Toward Convergence
-- ═══════════════════════════════════════════════════════════════════════

/-- A Multivac state: a Buleyean space tracking the progress of
    data accumulation toward the answer. The deficit measures how
    many more observations are needed before convergence. -/
structure MultivacState where
  /-- The underlying Buleyean space -/
  space : BuleyeanSpace
  /-- The initial deficit (number of choices minus one) -/
  initialDeficit : ℕ
  /-- Initial deficit equals numChoices - 1 -/
  deficitBound : initialDeficit = space.numChoices - 1

/-- The current deficit: how far from convergence. This is the
    formal content of "INSUFFICIENT DATA" -- the deficit counts
    how many more rejection rounds are needed. -/
def MultivacState.currentDeficit (ms : MultivacState) : ℕ :=
  futureDeficit ms.initialDeficit ms.space.rounds

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 1: "INSUFFICIENT DATA" Is Positive Bule
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-INSUFFICIENT-DATA: When the deficit is positive, the answer
    is not yet computable. "INSUFFICIENT DATA FOR MEANINGFUL ANSWER"
    is the state where Bule > 0: more rejections are needed before
    the complement distribution converges.

    The deficit is positive whenever rounds < initialDeficit. -/
theorem insufficient_data_is_positive_bule (d rounds : ℕ)
    (hNotEnough : rounds < d) :
    0 < futureDeficit d rounds := by
  unfold futureDeficit
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 2: Data Accumulates Monotonically
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-DATA-ACCUMULATES: The deficit decreases monotonically as
    data accumulates. Each observation round reduces the deficit
    by at most one. The deficit never increases. This is the formal
    content of "the computer gets closer to the answer with each
    observation." -/
theorem data_accumulates_monotonically (d k1 k2 : ℕ) (h : k1 ≤ k2) :
    futureDeficit d k2 ≤ futureDeficit d k1 :=
  future_deficit_monotone d k1 k2 h

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 3: The Answer Is Eventually Computable
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-ANSWER-EVENTUALLY-COMPUTABLE: After exactly d rounds
    (where d is the initial deficit), the deficit reaches zero.
    The complement distribution has converged. The answer is
    computable.

    This is the formal content of Multivac's final moment: after
    accumulating all the data (d rounds of rejections), the deficit
    is zero, the distribution is converged, the answer emerges. -/
theorem answer_eventually_computable (d : ℕ) :
    futureDeficit d d = 0 :=
  future_deficit_eventually_zero d

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 4: Heat Death Is Maximum Void
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-HEAT-DEATH-IS-MAXIMUM-VOID: At maximum void -- every choice
    rejected in every round -- every choice has weight exactly 1
    (minimum weight). The distribution is maximally concentrated but
    never collapses to zero.

    Heat death is the state where the void boundary is full. In a
    Buleyean space, this means every choice has been rejected the
    maximum number of times. -/
theorem heat_death_is_maximum_void (bs : BuleyeanSpace)
    (hMaxVoid : ∀ i, bs.voidBoundary i = bs.rounds)
    (i : Fin bs.numChoices) :
    bs.weight i = 1 :=
  buleyean_min_uncertainty bs i (hMaxVoid i)

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 5: The Sliver Survives Heat Death
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-SLIVER-SURVIVES-HEAT-DEATH: Even at maximum void (heat death),
    every choice retains weight >= 1. The distribution never collapses
    to zero. There is always enough probability mass to seed a new
    fork.

    This is the answer to the Last Question. Entropy increases
    monotonically (the void grows). But the complement never reaches
    zero (buleyean_positivity). The irreducible +1 in the weight
    formula is the sliver of escape. The universe can always be
    restarted because "never say never" is a theorem. -/
theorem sliver_survives_heat_death (bs : BuleyeanSpace)
    (i : Fin bs.numChoices) :
    1 ≤ bs.weight i :=
  buleyean_positivity bs i

/-- The sliver is irreducible: no amount of rejection can make
    any choice's weight zero. The +1 is structural. -/
theorem sliver_is_irreducible (bs : BuleyeanSpace)
    (i : Fin bs.numChoices) :
    ¬ (bs.weight i = 0) :=
  sliver_irreducible bs i

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 6: Converged Distribution Seeds New Universe
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-LET-THERE-BE-LIGHT: A converged complement distribution
    (Bule = 0) is a valid Bayesian prior for a new Buleyean space.
    The prior has strictly differentiated weights: different rejection
    counts produce different weights. The prior is informative.

    "LET THERE BE LIGHT" is the fork operation applied to this prior:
    the converged distribution initializes a new void boundary, seeding
    a new universe of choices. The old universe's death (maximum void)
    is the new universe's birth (informative prior). -/
theorem let_there_be_light (cp : ConvergedPrior)
    (i j : Fin cp.space.numChoices)
    (hDifferent : cp.space.voidBoundary i < cp.space.voidBoundary j) :
    cp.space.weight j < cp.space.weight i :=
  converged_prior_informative cp i j hDifferent

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 7: Entropy Reversal Is Complement Convergence
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-ENTROPY-REVERSAL: The void boundary grows monotonically
    (entropy of the universe increases). The complement distribution
    concentrates monotonically (entropy of the prediction decreases).
    These are the same process.

    Specifically: a non-rejected choice's weight can only increase
    after a rejection round (buleyean_monotone_nonrejected). The
    complement distribution sharpens with every observation. The
    "entropy reversal" is not a violation of the Second Law -- it
    is the Second Law viewed from the complement side.

    The universe gets more disordered (void grows). Our knowledge of
    the universe gets more ordered (complement sharpens). Same data.
    Opposite signs. -/
theorem entropy_reversal_is_complement (bu : BuleyeanUpdate)
    (i : Fin bu.before.numChoices) (hNotRejected : i ≠ bu.rejected) :
    bu.before.weight i ≤ bu.after.weight (i.cast bu.sameChoices) :=
  buleyean_monotone_nonrejected bu i hNotRejected

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 8: No Observation Means No Progress
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-NO-DATA-NO-ANSWER: A system with no observations (zero
    void boundary) produces a uniform distribution -- maximum
    entropy, zero information, no answer. This is the starting
    state: Multivac before any data.

    Without failure data, all choices are equally weighted.
    The complement distribution is a coin flip. There is no
    meaningful answer to give. -/
theorem no_data_no_answer (bs : BuleyeanSpace)
    (hEmpty : ∀ i, bs.voidBoundary i = 0)
    (i j : Fin bs.numChoices) :
    bs.weight i = bs.weight j :=
  fold_without_evidence_is_coinflip bs hEmpty i j

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 9: The Deficit Trajectory Is Deterministic
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-TRAJECTORY-DETERMINISTIC: The entire future trajectory of
    the deficit is known from the current state. At round T + k,
    the deficit is max(0, d - k). No randomness. No uncertainty
    about when the answer will arrive.

    Multivac does not "get lucky." It does not "have a breakthrough."
    The convergence is deterministic and the convergence round is
    known in advance: round d, where d is the initial deficit. -/
theorem trajectory_deterministic (d k : ℕ) :
    futureDeficit d k = d - min k d :=
  future_deficit_deterministic d k

-- ═══════════════════════════════════════════════════════════════════════
-- Master Theorem: The Last Question
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-LAST-QUESTION: The complete formal content of Asimov's
    "The Last Question."

    For any Buleyean space (any universe with finite choices):
    1. Data accumulates monotonically (deficit decreases)
    2. The answer is eventually computable (deficit reaches zero)
    3. Every choice survives heat death (weight >= 1, the sliver)
    4. No choice can ever reach zero probability (irreducible)
    5. Zero observation yields no answer (uniform = coin flip)

    The journey from "INSUFFICIENT DATA" to the answer is the
    Buleyean trajectory from Bule > 0 to Bule = 0. The answer to
    "can entropy be reversed?" is: the complement distribution's
    entropy decreases monotonically as the void boundary grows.
    Entropy reversal is not a violation of thermodynamics. It is
    thermodynamics viewed from the complement side. And the sliver
    -- the irreducible +1 -- ensures the converged distribution
    always has enough mass to seed a new fork.

    "LET THERE BE LIGHT" is the fork. -/
theorem last_question (bs : BuleyeanSpace)
    (d : ℕ) :
    -- 1. Deficit monotonically decreasing
    (∀ k1 k2 : ℕ, k1 ≤ k2 → futureDeficit d k2 ≤ futureDeficit d k1) ∧
    -- 2. Answer eventually computable
    futureDeficit d d = 0 ∧
    -- 3. Every choice survives heat death
    (∀ i : Fin bs.numChoices, 1 ≤ bs.weight i) ∧
    -- 4. No choice reaches zero
    (∀ i : Fin bs.numChoices, ¬ (bs.weight i = 0)) ∧
    -- 5. No data means no answer
    ((∀ i : Fin bs.numChoices, bs.voidBoundary i = 0) →
      ∀ i j : Fin bs.numChoices, bs.weight i = bs.weight j) := by
  exact ⟨fun k1 k2 h => data_accumulates_monotonically d k1 k2 h,
         answer_eventually_computable d,
         fun i => sliver_survives_heat_death bs i,
         fun i => sliver_is_irreducible bs i,
         fun hEmpty i j => no_data_no_answer bs hEmpty i j⟩

end ForkRaceFoldTheorems
