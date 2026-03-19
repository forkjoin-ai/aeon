import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.LastQuestion
import ForkRaceFoldTheorems.FoldErasure
import ForkRaceFoldTheorems.CodecRacing
import ForkRaceFoldTheorems.SleepDebt
import ForkRaceFoldTheorems.SolomonoffBuleyean

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions Round 9: Decision Erasure Convergence, Racing Guarantees,
  Abstraction Heat, Algorithmic Completeness, Debt-Amplified Erasure

Five predictions composing LastQuestion, FoldErasure, CodecRacing,
SolomonoffBuleyean, and SleepDebt -- all modules that build cleanly.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction A: Every Decision Erases, But Sufficient Decisions Converge
-- ═══════════════════════════════════════════════════════════════════════

/-- Decisions needed for convergence = initial deficit. -/
theorem decisions_until_convergence (d : ℕ) :
    futureDeficit d d = 0 :=
  future_deficit_eventually_zero d

/-- Before convergence, each round makes progress. -/
theorem each_decision_progresses (d k : ℕ) (hBefore : k < d) :
    futureDeficit d (k + 1) < futureDeficit d k := by
  unfold futureDeficit; omega

/-- The trajectory is fully deterministic. -/
theorem decision_trajectory_deterministic (d k : ℕ) :
    futureDeficit d k = d - min k d :=
  future_deficit_deterministic d k

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction B: Racing Multiple Approaches Never Loses
-- ═══════════════════════════════════════════════════════════════════════

/-- Racing subsumes every individual approach. -/
theorem racing_never_loses (results : List CodecResult)
    (r : CodecResult) (hr : r ∈ results) :
    raceMin results ≤ r.compressedSize :=
  race_subsumes_each results r hr

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction C: Every Abstraction Has Computable Heat
-- ═══════════════════════════════════════════════════════════════════════

/-- Non-injective fold always erases information. -/
theorem abstraction_erases (w : FoldErasureWitness) :
    0 < conditionalEntropyNats w.branchLaw w.foldMerge :=
  fold_erasure w

/-- Erasure has strictly positive Landauer heat cost. -/
theorem abstraction_heat_positive (w : FoldErasureWitness) :
    0 < landauerHeatLowerBound w.boltzmannConstant w.temperature
      (conditionalEntropyNats w.branchLaw w.foldMerge) :=
  fold_heat w

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction D: Universal Prior Reaches Convergence in Finite Rounds
-- ═══════════════════════════════════════════════════════════════════════

/-- Universal prior has positive weight on all hypotheses. -/
theorem universal_prior_positive (bs : BuleyeanSpace)
    (i : Fin bs.numChoices) :
    0 < bs.weight i :=
  buleyean_positivity bs i

/-- Two agents with same universal prior agree (coherence). -/
theorem universal_prior_coherent (bs1 bs2 : BuleyeanSpace)
    (hN : bs1.numChoices = bs2.numChoices)
    (hR : bs1.rounds = bs2.rounds)
    (hV : ∀ i, bs1.voidBoundary i = bs2.voidBoundary (i.cast hN))
    (i : Fin bs1.numChoices) :
    bs1.weight i = bs2.weight (i.cast hN) :=
  buleyean_coherence bs1 bs2 hN hR hV i

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction E: Cognitive Debt Increases Effective Erasure Cost
-- ═══════════════════════════════════════════════════════════════════════

/-- Positive debt lowers effective capacity. -/
theorem debt_amplifies_cost (maxCap debt : ℕ)
    (hCap : 0 < maxCap) (hDebt : 0 < debt) :
    SleepDebt.effectiveCapacity maxCap debt < maxCap :=
  SleepDebt.positive_debt_lowers_capacity hCap hDebt

/-- Full recovery clears debt entirely. -/
theorem full_recovery_clears (wakeLoad debt quota : ℕ)
    (hFull : wakeLoad + debt ≤ quota) :
    SleepDebt.residualDebt wakeLoad debt quota = 0 :=
  SleepDebt.full_recovery_clears_residual_debt hFull

/-- Insufficient recovery leaves positive debt. -/
theorem insufficient_recovery_leaves_debt (wakeLoad debt quota : ℕ)
    (hShort : quota < wakeLoad + debt) :
    0 < SleepDebt.residualDebt wakeLoad debt quota :=
  SleepDebt.partial_recovery_leaves_positive_debt hShort

-- ═══════════════════════════════════════════════════════════════════════
-- Master Theorem
-- ═══════════════════════════════════════════════════════════════════════

theorem predictions_round9_master (bs : BuleyeanSpace) :
    -- A: Convergence is finite
    (∀ d, futureDeficit d d = 0) ∧
    -- B: Racing never loses
    (∀ (results : List CodecResult) (r : CodecResult),
      r ∈ results → raceMin results ≤ r.compressedSize) ∧
    -- C: Non-injective fold erases
    (∀ (w : FoldErasureWitness), 0 < conditionalEntropyNats w.branchLaw w.foldMerge) ∧
    -- D: All hypotheses retain positive weight
    (∀ i, 0 < bs.weight i) ∧
    -- E: Full recovery clears debt
    (∀ wl d q, wl + d ≤ q → SleepDebt.residualDebt wl d q = 0) :=
  ⟨future_deficit_eventually_zero,
   race_subsumes_each,
   fold_erasure,
   buleyean_positivity bs,
   fun _ _ _ h => SleepDebt.full_recovery_clears_residual_debt h⟩

end ForkRaceFoldTheorems
