import Mathlib

namespace ForkRaceFoldTheorems

/-!
# Cognitive State Shift

This module isolates a narrow arithmetic surface for the DMN/VGI story:

- stable trait dimensionality
- acute state lift
- environment dimensionality

The point is to separate standing mismatch from acute desegregation without
pretending to explain phenomenology.
-/

/-- Stable trait dimensionality, acute state lift, and actual environment
dimensionality.  The dimensional counts are kept at `≥ 2` so the corresponding
void numerators are nondegenerate. -/
structure CognitiveStateShift where
  traitDimensions : ℕ
  acuteLift : ℕ
  actualDimensions : ℕ
  hTrait : 2 ≤ traitDimensions
  hActual : 2 ≤ actualDimensions

/-- Effective perceived dimensionality after the acute lift is applied. -/
def CognitiveStateShift.effectiveDimensions (c : CognitiveStateShift) : ℕ :=
  c.traitDimensions + c.acuteLift

/-- The void numerator associated with the effective dimensionality. -/
def CognitiveStateShift.voidNumerator (c : CognitiveStateShift) : ℕ :=
  c.effectiveDimensions - 1

/-- Standing trait mismatch before any acute lift is applied. -/
def CognitiveStateShift.traitGap (c : CognitiveStateShift) : ℕ :=
  c.traitDimensions - c.actualDimensions

/-- Total mismatch gap after the acute lift is applied. -/
def CognitiveStateShift.mismatchGap (c : CognitiveStateShift) : ℕ :=
  c.effectiveDimensions - c.actualDimensions

/-- Baseline-matched profiles have no trait mismatch before the acute lift. -/
def CognitiveStateShift.baselineMatched (c : CognitiveStateShift) : Prop :=
  c.traitDimensions = c.actualDimensions

/-- Phantom-fork regime: the perceived space strictly exceeds the environment. -/
def CognitiveStateShift.phantomForkRegime (c : CognitiveStateShift) : Prop :=
  c.actualDimensions < c.effectiveDimensions

/-- Effective dimensionality is the sum of a stable trait term and an acute
state term. -/
theorem state_and_trait_terms_are_separable (c : CognitiveStateShift) :
    c.effectiveDimensions = c.traitDimensions + c.acuteLift := rfl

/-- If the trait baseline already exceeds the environment, total mismatch
decomposes exactly into standing trait gap plus acute state lift. -/
theorem mismatch_gap_decomposes_into_trait_gap_plus_state_shift
    (c : CognitiveStateShift) (hExcess : c.actualDimensions ≤ c.traitDimensions) :
    c.mismatchGap = c.traitGap + c.acuteLift := by
  unfold CognitiveStateShift.mismatchGap
  unfold CognitiveStateShift.traitGap
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- Any positive acute lift strictly increases the effective perceived
dimensionality above the trait baseline. -/
theorem acute_lift_increases_effective_dimensions
    (c : CognitiveStateShift) (hLift : 0 < c.acuteLift) :
    c.traitDimensions < c.effectiveDimensions := by
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- Any positive acute lift strictly increases the corresponding void
numerator. -/
theorem acute_lift_increases_void_numerator
    (c : CognitiveStateShift) (hLift : 0 < c.acuteLift) :
    c.traitDimensions - 1 < c.voidNumerator := by
  unfold CognitiveStateShift.voidNumerator
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- A baseline-matched profile with no acute lift is not in the phantom-fork
regime. -/
theorem matched_baseline_without_lift_is_not_phantom
    (c : CognitiveStateShift) (hMatch : c.baselineMatched) (hLift : c.acuteLift = 0) :
    ¬ c.phantomForkRegime := by
  unfold CognitiveStateShift.baselineMatched at hMatch
  unfold CognitiveStateShift.phantomForkRegime
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- A baseline-matched profile enters the phantom-fork regime as soon as the
acute lift becomes positive. -/
theorem matched_baseline_plus_acute_lift_enters_phantom_fork_regime
    (c : CognitiveStateShift) (hMatch : c.baselineMatched) (hLift : 0 < c.acuteLift) :
    c.phantomForkRegime := by
  unfold CognitiveStateShift.baselineMatched at hMatch
  unfold CognitiveStateShift.phantomForkRegime
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- For a matched baseline, the entire post-lift mismatch is exactly the acute
state term. -/
theorem matched_baseline_gap_eq_acute_lift
    (c : CognitiveStateShift) (hMatch : c.baselineMatched) :
    c.mismatchGap = c.acuteLift := by
  unfold CognitiveStateShift.baselineMatched at hMatch
  unfold CognitiveStateShift.mismatchGap
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- On a matched baseline, a positive acute lift also pushes the void numerator
strictly above the environment-side boundary. -/
theorem matched_baseline_plus_acute_lift_crosses_void_boundary
    (c : CognitiveStateShift) (hMatch : c.baselineMatched) (hLift : 0 < c.acuteLift) :
    c.actualDimensions - 1 < c.voidNumerator := by
  unfold CognitiveStateShift.baselineMatched at hMatch
  unfold CognitiveStateShift.voidNumerator
  unfold CognitiveStateShift.effectiveDimensions
  omega

/-- For fixed trait and environment dimensions, a larger acute lift produces a
strictly larger mismatch gap. -/
theorem larger_acute_lift_increases_mismatch_gap
    (trait actual lift₁ lift₂ : ℕ)
    (hActual : actual ≤ trait + lift₁)
    (hLift : lift₁ < lift₂) :
    trait + lift₁ - actual < trait + lift₂ - actual := by
  omega

/-- State shifts remain distinguishable even when trait and environment
dimensions are held fixed. -/
theorem same_trait_same_actual_state_shift_separates_regimes
    (trait actual lift₁ lift₂ : ℕ)
    (hActual : actual ≤ trait + lift₁)
    (hLift : lift₁ < lift₂) :
    trait + lift₁ - actual ≠ trait + lift₂ - actual := by
  have hGap :
      trait + lift₁ - actual < trait + lift₂ - actual :=
    larger_acute_lift_increases_mismatch_gap trait actual lift₁ lift₂ hActual hLift
  omega

-- ═══════════════════════════════════════════════════════════════════════════
-- Mindfulness-vs-acute inversion surface
-- ═══════════════════════════════════════════════════════════════════════════

/-- Compare an acute opening move against a mindful closing move on the same
baseline perceived dimensionality.  The mindful move is encoded as a bounded
drop from the baseline; the acute move is encoded as a positive lift above it. -/
structure CognitiveInterventionPair where
  baselineDimensions : ℕ
  actualDimensions : ℕ
  acuteLift : ℕ
  mindfulDrop : ℕ
  hBaseline : 2 ≤ baselineDimensions
  hActual : 2 ≤ actualDimensions
  hMindfulBound : mindfulDrop < baselineDimensions

/-- Perceived dimensionality after the acute opening move. -/
def CognitiveInterventionPair.acuteDimensions (c : CognitiveInterventionPair) : ℕ :=
  c.baselineDimensions + c.acuteLift

/-- Perceived dimensionality after the mindful closing move. -/
def CognitiveInterventionPair.mindfulDimensions (c : CognitiveInterventionPair) : ℕ :=
  c.baselineDimensions - c.mindfulDrop

/-- Baseline mismatch gap before either move. -/
def CognitiveInterventionPair.baselineMismatchGap (c : CognitiveInterventionPair) : ℕ :=
  c.baselineDimensions - c.actualDimensions

/-- Mismatch gap after the acute opening move. -/
def CognitiveInterventionPair.acuteMismatchGap (c : CognitiveInterventionPair) : ℕ :=
  c.acuteDimensions - c.actualDimensions

/-- Mismatch gap after the mindful closing move. -/
def CognitiveInterventionPair.mindfulMismatchGap (c : CognitiveInterventionPair) : ℕ :=
  c.mindfulDimensions - c.actualDimensions

/-- Void numerator after the acute opening move. -/
def CognitiveInterventionPair.acuteVoidNumerator (c : CognitiveInterventionPair) : ℕ :=
  c.acuteDimensions - 1

/-- Void numerator after the mindful closing move. -/
def CognitiveInterventionPair.mindfulVoidNumerator (c : CognitiveInterventionPair) : ℕ :=
  c.mindfulDimensions - 1

/-- A positive mindful drop strictly reduces perceived dimensionality below the
baseline. -/
theorem mindful_closing_decreases_effective_dimensions
    (c : CognitiveInterventionPair) (hDrop : 0 < c.mindfulDrop) :
    c.mindfulDimensions < c.baselineDimensions := by
  unfold CognitiveInterventionPair.mindfulDimensions
  omega

/-- A positive mindful drop strictly reduces the corresponding void numerator
below the baseline void numerator. -/
theorem mindful_closing_decreases_void_numerator
    (c : CognitiveInterventionPair) (hDrop : 0 < c.mindfulDrop) :
    c.mindfulVoidNumerator < c.baselineDimensions - 1 := by
  unfold CognitiveInterventionPair.mindfulVoidNumerator
  unfold CognitiveInterventionPair.mindfulDimensions
  omega

/-- If the baseline is already at or above the environment dimensionality, a
positive acute lift strictly increases mismatch. -/
theorem acute_opening_increases_mismatch_gap
    (c : CognitiveInterventionPair)
    (hStable : c.actualDimensions ≤ c.baselineDimensions)
    (hLift : 0 < c.acuteLift) :
    c.baselineMismatchGap < c.acuteMismatchGap := by
  unfold CognitiveInterventionPair.baselineMismatchGap
  unfold CognitiveInterventionPair.acuteMismatchGap
  unfold CognitiveInterventionPair.acuteDimensions
  omega

/-- If the mindful move still leaves the perceived dimensionality at or above
the environment dimensionality, it strictly reduces mismatch. -/
theorem mindful_closing_reduces_mismatch_gap
    (c : CognitiveInterventionPair)
    (hStable : c.actualDimensions ≤ c.mindfulDimensions)
    (hDrop : 0 < c.mindfulDrop) :
    c.mindfulMismatchGap < c.baselineMismatchGap := by
  unfold CognitiveInterventionPair.mindfulMismatchGap
  unfold CognitiveInterventionPair.baselineMismatchGap
  unfold CognitiveInterventionPair.mindfulDimensions
  omega

/-- Acute opening and mindful closing move in opposite directions from the same
baseline perceived dimensionality. -/
theorem acute_and_mindful_moves_are_inverted
    (c : CognitiveInterventionPair)
    (hLift : 0 < c.acuteLift) (hDrop : 0 < c.mindfulDrop) :
    c.mindfulDimensions < c.baselineDimensions ∧
    c.baselineDimensions < c.acuteDimensions := by
  constructor
  · exact mindful_closing_decreases_effective_dimensions c hDrop
  · unfold CognitiveInterventionPair.acuteDimensions
    omega

/-- Under the natural non-saturation side conditions, mindful closing yields a
strictly smaller mismatch gap than acute opening on the same baseline. -/
theorem mindful_closing_beats_acute_opening_on_mismatch
    (c : CognitiveInterventionPair)
    (hMindfulStable : c.actualDimensions ≤ c.mindfulDimensions)
    (hLift : 0 < c.acuteLift) (hDrop : 0 < c.mindfulDrop) :
    c.mindfulMismatchGap < c.acuteMismatchGap := by
  have hLeft :
      c.mindfulMismatchGap < c.baselineMismatchGap :=
    mindful_closing_reduces_mismatch_gap c hMindfulStable hDrop
  have hBaselineStable : c.actualDimensions ≤ c.baselineDimensions := by
    unfold CognitiveInterventionPair.mindfulDimensions at hMindfulStable
    omega
  have hRight :
      c.baselineMismatchGap < c.acuteMismatchGap :=
    acute_opening_increases_mismatch_gap c hBaselineStable hLift
  omega

end ForkRaceFoldTheorems
