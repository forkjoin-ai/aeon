import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.SleepDebt
import ForkRaceFoldTheorems.SleepDebtSchedule
import ForkRaceFoldTheorems.FailureEntropy

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions Round 10: Sleep Schedules, Pipeline Waste, Iterated Debt

147. Iterated Debt Closed-Form (SleepDebtSchedule)
148. Sufficient Recovery Prevents Debt (SleepDebt)
149. Threshold-Crossing Debt Spiral (SleepDebtSchedule)
150. Over-Repair + Debt Compose (FailureEntropy + SleepDebt)
151. Deficit-Free Schedule Existence (SleepDebtSchedule)
-/

-- Prediction 147: Iterated debt = n × surplus
theorem iterated_debt_closed_form (wake quota : ℕ) (n : ℕ) (hSurplus : quota < wake) :
    SleepDebtSchedule.iteratedDebt n wake quota = n * (wake - quota) :=
  SleepDebtSchedule.iterated_debt_eq_mul_surplus (by omega : quota ≤ wake) n

theorem zero_surplus_zero_debt (wake quota : ℕ) (n : ℕ) (hSufficient : wake ≤ quota) :
    SleepDebtSchedule.iteratedDebt n wake quota = 0 :=
  SleepDebtSchedule.iterated_debt_eq_zero_of_wake_le_quota hSufficient

-- Prediction 148: Full recovery clears debt
theorem full_recovery_clears (wakeLoad carriedDebt recoveryQuota : ℕ)
    (hClear : wakeLoad + carriedDebt ≤ recoveryQuota) :
    SleepDebt.residualDebt wakeLoad carriedDebt recoveryQuota = 0 :=
  SleepDebt.full_recovery_clears_residual_debt hClear

-- Prediction 149: Above threshold, debt spirals
theorem threshold_debt_positive (wake quota : ℕ) (n : ℕ)
    (hAbove : quota < wake) (hPos : 0 < n) :
    0 < SleepDebtSchedule.iteratedDebt n wake quota := by
  rw [iterated_debt_closed_form wake quota n hAbove]
  exact Nat.mul_pos hPos (by omega)

-- Prediction 150: Over-repair + cascade compose
theorem cascade_debt_compose (frontier vented repaired : ℕ)
    (hFrontier : 0 < frontier) (hBound : vented ≤ frontier)
    (hOver : vented < repaired) :
    frontierEntropyProxy frontier <
    frontierEntropyProxy (repairedFrontier frontier vented repaired) :=
  coupled_failure_strictly_increases_entropy_proxy hFrontier hBound hOver

-- Prediction 151: Deficit-free schedules exist
theorem deficit_free_schedule (wake quota : ℕ) (hSuff : wake ≤ quota) (n : ℕ) :
    SleepDebtSchedule.iteratedDebt n wake quota = 0 :=
  zero_surplus_zero_debt wake quota n hSuff

theorem insufficient_schedule_accumulates (wake quota : ℕ) (hInsuf : quota < wake)
    (n : ℕ) (hPos : 0 < n) :
    0 < SleepDebtSchedule.iteratedDebt n wake quota :=
  threshold_debt_positive wake quota n hInsuf hPos

-- Master
theorem predictions_round10_master :
    (∀ w q n, q < w → SleepDebtSchedule.iteratedDebt n w q = n * (w - q)) ∧
    (∀ w q n, w ≤ q → SleepDebtSchedule.iteratedDebt n w q = 0) ∧
    (∀ w q n, q < w → 0 < n → 0 < SleepDebtSchedule.iteratedDebt n w q) := by
  exact ⟨fun w q n h => iterated_debt_closed_form w q n h,
         fun w q n h => zero_surplus_zero_debt w q n h,
         fun w q n h1 h2 => threshold_debt_positive w q n h1 h2⟩

end ForkRaceFoldTheorems
