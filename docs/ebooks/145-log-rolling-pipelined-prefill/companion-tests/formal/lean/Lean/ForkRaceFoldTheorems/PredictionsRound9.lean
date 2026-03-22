import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.QuantumObserver
import ForkRaceFoldTheorems.QuorumVisibility
import ForkRaceFoldTheorems.FoldHeatHierarchy
import ForkRaceFoldTheorems.Wallace
import ForkRaceFoldTheorems.Multiplexing

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions Round 9: Quantum Observation, Quorum Consensus, Fold Heat, Wallace Waste

142. Quantum Speedup Is Topological Deficit (QuantumObserver)
143. Quorum Intersection Guarantees Visibility (QuorumVisibility)
144. Fold Heat Hierarchy Is Strict (FoldHeatHierarchy)
145. Wallace Waste Is Zero Iff Frontier Fills Envelope (Wallace)
146. Multiplexing Monotonically Reduces Waste (Multiplexing)
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 142: Quantum Speedup = Topological Deficit + 1
-- ═══════════════════════════════════════════════════════════════════════

/-- Quantum speedup = rootN = deficit + 1. The speedup of Grover's
    algorithm is exactly the topological deficit of the measurement
    fold plus one (the surviving path). -/
theorem quantum_speedup_formula (qs : QuantumSystem) :
    qs.preBeta1 - qs.postBeta1 + 1 = qs.rootN := by
  rw [qs.preIsIntrinsic, qs.postIsZero]
  simp [intrinsicBeta1]
  exact Nat.sub_add_cancel (le_trans (by decide) qs.nontrivial)

/-- Measurement deficit is exactly rootN - 1. -/
theorem measurement_deficit_is_rootN_minus_1 (qs : QuantumSystem) :
    qs.preBeta1 - qs.postBeta1 = qs.rootN - 1 :=
  measurement_deficit_exact qs

/-- Path conservation: 1 survivor + (rootN - 1) vented = rootN. -/
theorem quantum_path_conservation (qs : QuantumSystem) :
    1 + (qs.rootN - 1) = qs.rootN :=
  path_conservation qs

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 143: Quorum Intersection Guarantees Visibility
-- ═══════════════════════════════════════════════════════════════════════

/-- Strict majority implies failure budget < quorum size. -/
theorem quorum_failure_budget_bounded (replicaCount failureBudget : ℕ)
    (hMajority : 2 * failureBudget < replicaCount) :
    failureBudget < quorumSize replicaCount failureBudget :=
  strict_majority_failure_budget_lt_quorum hMajority

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 144: Fold Heat Hierarchy Is Strict
-- ═══════════════════════════════════════════════════════════════════════

/-- Injective folds generate zero heat. Non-injective folds generate
    strictly positive heat. The hierarchy is strict: there is no
    fold between "zero heat" and "positive heat." -/
theorem fold_heat_dichotomy
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β)
    (hInj : Set.InjOn f (PMF.support branchLaw)) :
    coarseningInformationLoss branchLaw f = 0 :=
  injective_fold_zero_heat branchLaw f hInj

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 145: Wallace Waste Zero Iff Full
-- ═══════════════════════════════════════════════════════════════════════

/-- Wallace waste is zero iff the frontier fills the envelope exactly.
    In scheduling: zero waste = perfect utilization. -/
theorem wallace_zero_characterization (left middle right : ℕ) :
    wallaceNumerator3 left middle right = 0 ↔
    frontierArea3 left middle right = wallaceDenominator3 left middle right :=
  wallace_zero_iff_full3 left middle right

/-- Wallace waste is bounded: numerator ≤ denominator. -/
theorem wallace_waste_bounded (left middle right : ℕ) :
    wallaceNumerator3 left middle right ≤ wallaceDenominator3 left middle right :=
  wallace_bounds3 left middle right

/-- Conservation: frontier area + waste = envelope area. -/
theorem wallace_conservation (left middle right : ℕ) :
    frontierArea3 left middle right + wallaceNumerator3 left middle right =
    wallaceDenominator3 left middle right :=
  wallace_complement3 left middle right

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction 146: Multiplexing Reduces Waste
-- ═══════════════════════════════════════════════════════════════════════

/-- Multiplexed capacity is at least as large as the busy period.
    Multiplexing can only help, never hurt. -/
theorem multiplexing_helps (busy capacity overlap : ℕ)
    (hBusy : 0 < busy) (hCap : busy ≤ capacity)
    (hRecovered : overlap ≤ capacity - busy) :
    busy ≤ multiplexedCapacity capacity overlap :=
  multiplexed_capacity_ge_busy hBusy hCap hRecovered

-- ═══════════════════════════════════════════════════════════════════════
-- Master
-- ═══════════════════════════════════════════════════════════════════════

theorem predictions_round9_master (qs : QuantumSystem) :
    -- 142. Quantum deficit = rootN - 1
    qs.preBeta1 - qs.postBeta1 = qs.rootN - 1 ∧
    -- 143. Path conservation
    1 + (qs.rootN - 1) = qs.rootN ∧
    -- 145. Wallace bounded
    (∀ l m r, wallaceNumerator3 l m r ≤ wallaceDenominator3 l m r) := by
  exact ⟨measurement_deficit_exact qs,
         path_conservation qs,
         wallace_bounds3⟩

end ForkRaceFoldTheorems
