import Mathlib
import ForkRaceFoldTheorems.DeficitCapacity

namespace ForkRaceFoldTheorems

/-!
Track Theta+: Topological Mismatch Adequacy

This file sharpens the deficit/capacity surface into an adequacy theorem for
finite fork/race/fold workloads.

The current `topologicalDeficit` model is phrased in terms of first Betti
numbers, so the honest realizability cutoff is:

* `Δβ ≤ 0` iff a lossless realization exists on the declared stream budget
* `Δβ = 0` iff a tight lossless realization exists
* `Δβ > 0` forces every realization to collide and therefore lose information

`Δβ = 0` is not enough for mere injectivity in the presence of slack streams;
that is why the adequacy statement is split into the nonpositive and exact
cases instead of forcing a false iff.
-/

/-- Minimal workload surface for the finite fork/race/fold adequacy theorem. -/
structure FRFWorkload where
  pathCount : ℕ

/-- A realization assigns each computation path to a concrete transport stream. -/
structure Realization (W : FRFWorkload) (transportStreams : ℕ) where
  assign : Fin W.pathCount → Fin transportStreams

/-- A realization is lossless when distinct paths never collide on a stream. -/
def lossless {W : FRFWorkload} {transportStreams : ℕ}
    (R : Realization W transportStreams) : Prop :=
  Function.Injective R.assign

/-- A realization is tight when every declared transport stream is used. -/
def tight {W : FRFWorkload} {transportStreams : ℕ}
    (R : Realization W transportStreams) : Prop :=
  Function.Surjective R.assign

/-- Positive information loss is the negation of a lossless realization. -/
def positiveInformationLoss {W : FRFWorkload} {transportStreams : ℕ}
    (R : Realization W transportStreams) : Prop :=
  ¬ lossless R

/-- A path collision witnesses that two distinct paths share one stream. -/
def pathCollision {W : FRFWorkload} {transportStreams : ℕ}
    (R : Realization W transportStreams) : Prop :=
  ∃ (p₁ p₂ : Fin W.pathCount), p₁ ≠ p₂ ∧ R.assign p₁ = R.assign p₂

/-- When the transport budget dominates the path count, the identity embedding
    gives a lossless realization. -/
def losslessRealizationOfLe (W : FRFWorkload) {transportStreams : ℕ}
    (hCap : W.pathCount ≤ transportStreams) : Realization W transportStreams where
  assign := fun p => ⟨p.val, lt_of_lt_of_le p.isLt hCap⟩

/-- Exact stream/path match gives the canonical tight lossless realization. -/
def tightLosslessRealization (W : FRFWorkload) : Realization W W.pathCount where
  assign := fun p => p

theorem lossless_losslessRealizationOfLe (W : FRFWorkload) {transportStreams : ℕ}
    (hCap : W.pathCount ≤ transportStreams) :
    lossless (losslessRealizationOfLe W hCap) := by
  intro p₁ p₂ hEq
  apply Fin.ext
  simpa [losslessRealizationOfLe] using congrArg Fin.val hEq

theorem lossless_tightLosslessRealization (W : FRFWorkload) :
    lossless (tightLosslessRealization W) := by
  intro p₁ p₂ hEq
  exact hEq

theorem tight_tightLosslessRealization (W : FRFWorkload) :
    tight (tightLosslessRealization W) := by
  intro s
  exact ⟨s, rfl⟩

theorem topologicalDeficit_eq_path_minus_stream
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hPaths : 0 < W.pathCount)
    (hStreams : 0 < transportStreams) :
    topologicalDeficit W.pathCount transportStreams =
      (W.pathCount : ℤ) - transportStreams := by
  unfold topologicalDeficit computationBeta1 transportBeta1
  omega

theorem deficit_nonpositive_iff_stream_capacity
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hStreams : 0 < transportStreams) :
    topologicalDeficit W.pathCount transportStreams ≤ 0 ↔
      W.pathCount ≤ transportStreams := by
  by_cases hPaths : 0 < W.pathCount
  · have hDefEq := topologicalDeficit_eq_path_minus_stream W hPaths hStreams
    omega
  · have hZero : W.pathCount = 0 := Nat.eq_zero_of_not_pos hPaths
    rw [hZero]
    unfold topologicalDeficit computationBeta1 transportBeta1
    omega

theorem positive_deficit_iff_stream_shortage
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hStreams : 0 < transportStreams) :
    0 < topologicalDeficit W.pathCount transportStreams ↔
      transportStreams < W.pathCount := by
  by_cases hPaths : 0 < W.pathCount
  · have hDefEq := topologicalDeficit_eq_path_minus_stream W hPaths hStreams
    omega
  · have hZero : W.pathCount = 0 := Nat.eq_zero_of_not_pos hPaths
    rw [hZero]
    unfold topologicalDeficit computationBeta1 transportBeta1
    omega

theorem zero_deficit_iff_exact_stream_match
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hPaths : 0 < W.pathCount)
    (hStreams : 0 < transportStreams) :
    topologicalDeficit W.pathCount transportStreams = 0 ↔
      W.pathCount = transportStreams := by
  have hDefEq := topologicalDeficit_eq_path_minus_stream W hPaths hStreams
  omega

theorem lossless_realization_implies_nonpositive_deficit
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hStreams : 0 < transportStreams)
    {R : Realization W transportStreams}
    (hLossless : lossless R) :
    topologicalDeficit W.pathCount transportStreams ≤ 0 := by
  have hCap : W.pathCount ≤ transportStreams := by
    simpa using Fintype.card_le_of_injective R.assign hLossless
  exact (deficit_nonpositive_iff_stream_capacity W hStreams).2 hCap

theorem nonpositive_deficit_iff_lossless_realization
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hStreams : 0 < transportStreams) :
    topologicalDeficit W.pathCount transportStreams ≤ 0 ↔
      ∃ R : Realization W transportStreams, lossless R := by
  constructor
  · intro hDef
    have hCap : W.pathCount ≤ transportStreams :=
      (deficit_nonpositive_iff_stream_capacity W hStreams).1 hDef
    exact ⟨losslessRealizationOfLe W hCap, lossless_losslessRealizationOfLe W hCap⟩
  · rintro ⟨R, hLossless⟩
    exact lossless_realization_implies_nonpositive_deficit W hStreams hLossless

theorem tight_lossless_realization_implies_zero_deficit
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hPaths : 0 < W.pathCount)
    (hStreams : 0 < transportStreams)
    {R : Realization W transportStreams}
    (hLossless : lossless R)
    (hTight : tight R) :
    topologicalDeficit W.pathCount transportStreams = 0 := by
  have hLe : W.pathCount ≤ transportStreams := by
    simpa using Fintype.card_le_of_injective R.assign hLossless
  have hGe : transportStreams ≤ W.pathCount := by
    simpa using Fintype.card_le_of_surjective R.assign hTight
  exact (zero_deficit_iff_exact_stream_match W hPaths hStreams).2 (le_antisymm hLe hGe)

theorem zero_deficit_iff_tight_lossless_realization
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hPaths : 0 < W.pathCount)
    (hStreams : 0 < transportStreams) :
    topologicalDeficit W.pathCount transportStreams = 0 ↔
      ∃ R : Realization W transportStreams, lossless R ∧ tight R := by
  constructor
  · intro hDef
    have hEq : W.pathCount = transportStreams :=
      (zero_deficit_iff_exact_stream_match W hPaths hStreams).1 hDef
    cases hEq
    exact ⟨tightLosslessRealization W, lossless_tightLosslessRealization W,
      tight_tightLosslessRealization W⟩
  · rintro ⟨R, hLossless, hTight⟩
    exact tight_lossless_realization_implies_zero_deficit W hPaths hStreams hLossless hTight

theorem pathCollision_implies_positiveInformationLoss
    {W : FRFWorkload}
    {transportStreams : ℕ}
    {R : Realization W transportStreams} :
    pathCollision R → positiveInformationLoss R := by
  intro hCollision hLossless
  rcases hCollision with ⟨p₁, p₂, hNe, hEq⟩
  exact hNe (hLossless hEq)

theorem positive_deficit_forces_collision
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hStreams : 0 < transportStreams)
    (hDef : 0 < topologicalDeficit W.pathCount transportStreams) :
    ∀ R : Realization W transportStreams, pathCollision R := by
  intro R
  have hShort : transportStreams < W.pathCount :=
    (positive_deficit_iff_stream_shortage W hStreams).1 hDef
  have hCard :
      Fintype.card (Fin transportStreams) < Fintype.card (Fin W.pathCount) := by
    simpa using hShort
  simpa [pathCollision] using Fintype.exists_ne_map_eq_of_card_lt R.assign hCard

theorem positive_deficit_forces_collision_and_information_loss
    (W : FRFWorkload)
    {transportStreams : ℕ}
    (hStreams : 0 < transportStreams)
    (hDef : 0 < topologicalDeficit W.pathCount transportStreams) :
    ∀ R : Realization W transportStreams,
      pathCollision R ∧ positiveInformationLoss R := by
  intro R
  have hCollision := positive_deficit_forces_collision W hStreams hDef R
  exact ⟨hCollision, pathCollision_implies_positiveInformationLoss hCollision⟩

end ForkRaceFoldTheorems
