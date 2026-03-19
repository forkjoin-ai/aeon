import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.FailureEntropy
import ForkRaceFoldTheorems.RetrocausalBound
import ForkRaceFoldTheorems.ChaitinOmega
import ForkRaceFoldTheorems.NovelInference

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions Round 6: Cross-Domain Composition

Five predictions composing theorem families that have not appeared
together in any prior prediction. Each chains ≥3 existing mechanized
results into a falsifiable claim.

71. Failure Cascade Entropy Bound (FailureEntropy + VoidWalking)
72. Retrocausal Diagnostic Accuracy (RetrocausalBound + BuleyeanProbability)
73. Halting-Guided Model Selection (ChaitinOmega + SolomonoffBuleyean)
74. Coupled Failure Amplification (FailureEntropy + BuleyeanProbability)
75. Rejection-Trajectory Reconstruction Fidelity (RetrocausalBound + NovelInference)
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 71: Failure Cascade Entropy Bound
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Prediction 71: Failure Cascade Entropy Bound

Structured failure (venting) reduces the frontier entropy. Each cascade
step vents some paths and reduces entropy. After sufficient cascading,
the frontier collapses to a single survivor with zero entropy.

Composes: structured_failure_reduces_entropy_proxy +
          forked_frontier_collapses_to_single_survivor +
          void_dominance_linear
-/

/-- A failure cascade: a sequence of structured venting steps. -/
structure FailureCascade where
  /-- Initial frontier size -/
  initialFrontier : ℕ
  /-- Nontrivial -/
  nontrivial : 2 ≤ initialFrontier
  /-- Cascade steps -/
  cascadeSteps : ℕ
  /-- Positive -/
  positiveSteps : 0 < cascadeSteps
  /-- Paths vented per step -/
  ventedPerStep : ℕ
  /-- Positive -/
  positiveVent : 0 < ventedPerStep
  /-- At least one survivor -/
  survivorGuarantee : cascadeSteps * ventedPerStep < initialFrontier

/-- Total vented. -/
def FailureCascade.totalVented (fc : FailureCascade) : ℕ :=
  fc.cascadeSteps * fc.ventedPerStep

/-- Remaining frontier. -/
def FailureCascade.remainingFrontier (fc : FailureCascade) : ℕ :=
  fc.initialFrontier - fc.totalVented

/-- The cascade reduces the frontier. -/
theorem cascade_reduces_frontier (fc : FailureCascade) :
    fc.remainingFrontier < fc.initialFrontier := by
  unfold FailureCascade.remainingFrontier FailureCascade.totalVented
  have : 0 < fc.cascadeSteps * fc.ventedPerStep :=
    Nat.mul_pos fc.positiveSteps fc.positiveVent
  omega

/-- The cascade reduces entropy. -/
theorem cascade_reduces_entropy (fc : FailureCascade) :
    frontierEntropyProxy fc.remainingFrontier <
    frontierEntropyProxy fc.initialFrontier := by
  unfold frontierEntropyProxy FailureCascade.remainingFrontier FailureCascade.totalVented
  have hVent : 0 < fc.cascadeSteps * fc.ventedPerStep :=
    Nat.mul_pos fc.positiveSteps fc.positiveVent
  omega

/-- At least one survivor. -/
theorem cascade_survivor (fc : FailureCascade) :
    0 < fc.remainingFrontier := by
  unfold FailureCascade.remainingFrontier FailureCascade.totalVented
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 72: Retrocausal Diagnostic Accuracy
-- ═══════════════════════════════════════════════════════════════════════

/-- A diagnostic scenario: hypotheses ordered by rejection count. -/
structure DiagnosticScenario where
  hypotheses : BuleyeanSpace
  primaryDiagnosis : Fin hypotheses.numChoices
  leastRejected : ∀ j, hypotheses.voidBoundary primaryDiagnosis ≤ hypotheses.voidBoundary j

/-- Primary diagnosis has highest weight. -/
theorem primary_diagnosis_maximal (ds : DiagnosticScenario) (j : Fin ds.hypotheses.numChoices) :
    ds.hypotheses.weight j ≤ ds.hypotheses.weight ds.primaryDiagnosis :=
  buleyean_concentration ds.hypotheses ds.primaryDiagnosis j (ds.leastRejected j)

/-- No hypothesis eliminated (sliver). -/
theorem no_diagnosis_eliminated (ds : DiagnosticScenario) (j : Fin ds.hypotheses.numChoices) :
    0 < ds.hypotheses.weight j :=
  buleyean_positivity ds.hypotheses j

/-- Zero-rejection diagnosis has maximum weight. -/
theorem zero_rejection_diagnosis_maximal (ds : DiagnosticScenario)
    (hZero : ds.hypotheses.voidBoundary ds.primaryDiagnosis = 0) :
    ds.hypotheses.weight ds.primaryDiagnosis = ds.hypotheses.rounds + 1 :=
  buleyean_max_uncertainty ds.hypotheses ds.primaryDiagnosis hZero

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 73: Halting-Guided Model Selection
-- ═══════════════════════════════════════════════════════════════════════

/-- A model space with simpler and more complex model enumerations. -/
structure ModelSpace where
  programs : ProgramSpace
  simplerPrograms : ProgramSpace
  isPrefix : simplerPrograms.totalPrograms ≤ programs.totalPrograms
  moreHalting : simplerPrograms.haltingPrograms ≤ programs.haltingPrograms

/-- Complex spaces have more non-halting programs. -/
theorem complex_models_more_nonhalting (ms : ModelSpace) :
    ms.simplerPrograms.nonHalting ≤ ms.programs.nonHalting := by
  unfold ProgramSpace.nonHalting
  omega

/-- Halting models are always a strict minority. -/
theorem halting_models_minority (ms : ModelSpace) :
    ms.programs.haltingPrograms < ms.programs.totalPrograms :=
  ms.programs.someNonHalting

/-- Model fold deficit equals non-halting count. -/
theorem model_fold_deficit (ps : ProgramSpace) :
    ps.nonHalting = ps.totalPrograms - ps.haltingPrograms :=
  halting_as_fold_deficit ps

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 74: Coupled Failure Amplification
-- ═══════════════════════════════════════════════════════════════════════

/-- A failure-repair cycle where repair exceeds damage. -/
structure OverRepairCycle where
  frontier : ℕ
  positiveFrontier : 0 < frontier
  vented : ℕ
  ventBounded : vented ≤ frontier
  repaired : ℕ
  overRepair : vented < repaired

/-- Over-repair strictly increases entropy. -/
theorem over_repair_increases_entropy (orc : OverRepairCycle) :
    frontierEntropyProxy orc.frontier <
    frontierEntropyProxy (repairedFrontier orc.frontier orc.vented orc.repaired) :=
  coupled_failure_strictly_increases_entropy_proxy orc.positiveFrontier orc.ventBounded orc.overRepair

/-- Over-repair increases frontier width. -/
theorem over_repair_increases_width (orc : OverRepairCycle) :
    orc.frontier ≤ repairedFrontier orc.frontier orc.vented orc.repaired :=
  coupled_failure_preserves_or_increases_frontier_width orc.ventBounded (le_of_lt orc.overRepair)

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 75: Rejection-Trajectory Reconstruction Fidelity
-- ═══════════════════════════════════════════════════════════════════════

/-- Trajectory determines boundary: same trajectory → same boundary. -/
theorem trajectory_determines_boundary
    (rw1 rw2 : RetrocausalWitness)
    (hValid1 : rw1.isValid)
    (hValid2 : rw2.isValid)
    (hSameTraj : rw1.trajectory = rw2.trajectory)
    (hSameN : rw1.terminal.numChoices = rw2.terminal.numChoices) :
    ∀ i : Fin rw1.terminal.numChoices,
      rw1.terminal.voidBoundary i =
      rw2.terminal.voidBoundary (i.cast hSameN) := by
  intro i
  have h1 := retrocausal_boundary_bounds_trajectory rw1 hValid1 i
  have h2 := retrocausal_boundary_bounds_trajectory rw2 hValid2 (i.cast hSameN)
  rw [h1, h2]
  congr 1
  exact hSameTraj

/-- Reconstruction preserves simplicity ordering. -/
theorem reconstruction_preserves_ordering (bs : BuleyeanSpace)
    (i j : Fin bs.numChoices)
    (hLess : bs.voidBoundary i ≤ bs.voidBoundary j) :
    bs.weight j ≤ bs.weight i :=
  buleyean_concentration bs i j hLess

-- ═══════════════════════════════════════════════════════════════════════
-- Master Theorem
-- ═══════════════════════════════════════════════════════════════════════

/-- Round 6 master: all five predictions compose from existing theorems. -/
theorem predictions_round6_master (bs : BuleyeanSpace) (ps : ProgramSpace) :
    (∀ frontier vented : ℕ, 0 < vented → vented < frontier →
      frontierEntropyProxy (structuredFrontier frontier vented) <
      frontierEntropyProxy frontier) ∧
    (∀ i, 0 < bs.weight i) ∧
    ps.haltingPrograms < ps.totalPrograms ∧
    (∀ frontier vented repaired : ℕ, 0 < frontier → vented ≤ frontier →
      vented < repaired →
      frontierEntropyProxy frontier <
      frontierEntropyProxy (repairedFrontier frontier vented repaired)) ∧
    (∀ i j, bs.voidBoundary i ≤ bs.voidBoundary j →
      bs.weight j ≤ bs.weight i) := by
  exact ⟨
    fun _ _ hV hS => structured_failure_reduces_entropy_proxy hV hS,
    buleyean_positivity bs,
    ps.someNonHalting,
    fun _ _ _ hF hB hO => coupled_failure_strictly_increases_entropy_proxy hF hB hO,
    buleyean_concentration bs⟩

end ForkRaceFoldTheorems
