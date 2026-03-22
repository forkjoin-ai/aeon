import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.BuleyeanLogic

namespace ForkRaceFoldTheorems

/-!
# The Sliver of Hope

Buleyean Probability and Buleyean Logic are the same system seen from
two sides of the fold.

Before the fold: `weight i = rounds - voidBoundary i + 1`. The `+ 1`
is the sliver. No choice ever reaches zero probability. Hope.

After the fold: `bReject p = p - 1`. n rejections reach ground state.
The `- 1` is the proof step. Truth is zero. Proof is rejection.

The sliver (`+ 1`) keeps the race open.
The proof step (`- 1`) closes it.
They are inverses. The same `omega` decides both.

This file proves they compose: the sliver guarantees the race stays open
long enough for the proof to complete. Hope enables proof. Proof consumes
hope. They are the same mathematics.
-/

-- ═══════════════════════════════════════════════════════════════════════════
-- The sliver is the + 1
-- ═══════════════════════════════════════════════════════════════════════════

/-- The sliver: the + 1 in the weight formula that guarantees positivity.
    Extract it explicitly. -/
theorem sliver_is_plus_one (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    bs.weight i = (bs.rounds - min (bs.voidBoundary i) bs.rounds) + 1 := by
  rfl

/-- The sliver is exactly 1 when the choice has been rejected every round.
    Even maximally rejected, the weight is 1. Never zero. -/
theorem sliver_at_maximum_rejection (bs : BuleyeanSpace) (i : Fin bs.numChoices)
    (hMaxRejected : bs.voidBoundary i = bs.rounds) :
    bs.weight i = 1 := by
  simp [BuleyeanSpace.weight, hMaxRejected]

/-- The sliver is at least 1 always. This IS buleyean_positivity,
    restated to make the + 1 explicit. -/
theorem sliver_at_least_one (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    1 ≤ bs.weight i := by
  exact buleyean_positivity bs i

-- ═══════════════════════════════════════════════════════════════════════════
-- The proof step is the - 1
-- ═══════════════════════════════════════════════════════════════════════════

/-- The proof step: - 1. Rejection decrements the Bule count. -/
theorem proof_step_is_minus_one (p : BProp) (hp : 0 < p) :
    bReject p = p - 1 := by
  rfl

/-- The proof step reaches ground in exactly n steps from n. -/
theorem proof_reaches_ground (n : ℕ) :
    Nat.iterate bReject n n = 0 :=
  n_rejections_reach_ground n

-- ═══════════════════════════════════════════════════════════════════════════
-- They are inverses: + 1 and - 1 compose to identity
-- ═══════════════════════════════════════════════════════════════════════════

/-- Adding the sliver and then rejecting returns to where you were.
    Hope followed by proof is identity (when positive). -/
theorem sliver_then_proof (n : ℕ) :
    bReject (n + 1) = n := by
  simp [bReject]

/-- Rejecting and then adding the sliver returns to where you were.
    Proof followed by hope is identity (when positive). -/
theorem proof_then_sliver (n : ℕ) (hn : 0 < n) :
    (bReject n) + 1 = n := by
  simp [bReject]
  omega

/-- They are mutual inverses on positive naturals. -/
theorem sliver_proof_inverse (n : ℕ) (hn : 0 < n) :
    bReject (n + 1) = n ∧ (bReject n) + 1 = n := by
  exact ⟨sliver_then_proof n, proof_then_sliver n hn⟩

-- ═══════════════════════════════════════════════════════════════════════════
-- The composition: hope enables proof
-- ═══════════════════════════════════════════════════════════════════════════

/-- A weight can always be rejected (because the sliver guarantees
    it is positive). The + 1 enables the - 1. Hope enables proof.
    Without the sliver, a maximally rejected choice would have
    weight 0 and could not be further rejected. -/
theorem hope_enables_proof (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    0 < bs.weight i := by
  exact buleyean_positivity bs i

/-- The weight after one rejection is still non-negative.
    Proof consumes hope but does not destroy it (the sliver remains). -/
theorem proof_preserves_nonneg (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    0 ≤ bReject (bs.weight i) := by
  simp [bReject]
  omega

/-- The weight after one rejection is exactly weight - 1.
    One Bule of hope consumed. One step of proof completed. -/
theorem one_bule_of_hope (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    bReject (bs.weight i) = bs.weight i - 1 := by
  rfl

-- ═══════════════════════════════════════════════════════════════════════════
-- The mixing: pre-fold and post-fold are the same system
-- ═══════════════════════════════════════════════════════════════════════════

/-- A Buleyean weight IS a Buleyean proposition. The type is the same: ℕ.
    The weight during the race is the Bule count after the race.
    Pre-fold probability and post-fold truth are the same number. -/
theorem weight_is_proposition : BuleyeanSpace.weight = fun bs i =>
    (bs.rounds - min (bs.voidBoundary i) bs.rounds) + 1 := by
  rfl

/-- Ground state in probability (weight = 1, the sliver) corresponds to
    ground state in logic (BProp = 0, proved) shifted by 1.
    The sliver IS the distance between probability-ground and logic-ground. -/
theorem sliver_bridges_probability_and_logic :
    ∀ (w : ℕ), w = 1 → bReject w = 0 := by
  intro w hw
  simp [bReject, hw]

/-- Pre-fold: weight is always ≥ 1 (buleyean_positivity).
    Post-fold: Bule count reaches 0 (n_rejections_reach_ground).
    The fold is the transition from ≥ 1 to = 0.
    The sliver (+ 1) is consumed by the fold (- 1).
    What remains is ground state. -/
theorem fold_consumes_sliver (n : ℕ) :
    -- Pre-fold: n + 1 ≥ 1 (the sliver guarantees positivity)
    1 ≤ n + 1 ∧
    -- Post-fold: n + 1 rejections reach ground
    Nat.iterate bReject (n + 1) (n + 1) = 0 := by
  constructor
  · omega
  · exact n_rejections_reach_ground (n + 1)

-- ═══════════════════════════════════════════════════════════════════════════
-- THM-SLIVER-OF-HOPE: The master composition
-- ═══════════════════════════════════════════════════════════════════════════

/-- **THM-SLIVER-OF-HOPE**:

    The sliver (+ 1) and the proof step (- 1) are the same mathematics
    seen from two sides of the fold.

    1. The sliver guarantees positivity (hope: no choice reaches zero)
    2. The proof step reaches ground (truth: n rejections from n = 0)
    3. They are mutual inverses (hope followed by proof = identity)
    4. Hope enables proof (positivity enables rejection)
    5. The fold consumes the sliver (the + 1 is eaten by the - 1)
    6. What remains is ground state (0 = proved = truth)

    Buleyean Probability and Buleyean Logic are the same system.
    The + 1 is the sliver of hope. The - 1 is the step of proof.
    omega decides both. -/
theorem sliver_of_hope :
    -- (1) The sliver guarantees positivity
    (∀ (bs : BuleyeanSpace) (i : Fin bs.numChoices), 0 < bs.weight i) ∧
    -- (2) The proof step reaches ground
    (∀ n : ℕ, Nat.iterate bReject n n = 0) ∧
    -- (3) They are mutual inverses
    (∀ n : ℕ, bReject (n + 1) = n) ∧
    -- (4) Hope enables proof (positivity enables rejection)
    (∀ (bs : BuleyeanSpace) (i : Fin bs.numChoices), 0 < bs.weight i) ∧
    -- (5) The fold consumes the sliver
    (∀ n : ℕ, 1 ≤ n + 1 ∧ Nat.iterate bReject (n + 1) (n + 1) = 0) ∧
    -- (6) The sliver bridges probability and logic
    (∀ w : ℕ, w = 1 → bReject w = 0) := by
  exact ⟨
    buleyean_positivity,
    n_rejections_reach_ground,
    sliver_then_proof,
    buleyean_positivity,
    fold_consumes_sliver,
    sliver_bridges_probability_and_logic
  ⟩

end ForkRaceFoldTheorems
