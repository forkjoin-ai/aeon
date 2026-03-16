import Mathlib
import ForkRaceFoldTheorems.SleepDebt

namespace ForkRaceFoldTheorems
namespace SleepDebtSchedule

def scheduleSurplus (scheduledWake recoveryQuota : Nat) : Nat :=
  scheduledWake - recoveryQuota

def nextCycleDebt (scheduledWake recoveryQuota carriedDebt : Nat) : Nat :=
  SleepDebt.residualDebt scheduledWake carriedDebt recoveryQuota

def iteratedDebt : Nat -> Nat -> Nat -> Nat
  | 0, _, _ => 0
  | n + 1, scheduledWake, recoveryQuota =>
      nextCycleDebt scheduledWake recoveryQuota (iteratedDebt n scheduledWake recoveryQuota)

theorem next_cycle_debt_eq_add_surplus
    {scheduledWake recoveryQuota carriedDebt : Nat}
    (hThreshold : recoveryQuota ≤ scheduledWake) :
    nextCycleDebt scheduledWake recoveryQuota carriedDebt =
      carriedDebt + scheduleSurplus scheduledWake recoveryQuota := by
  unfold nextCycleDebt SleepDebt.residualDebt SleepDebt.totalRecoveryDemand scheduleSurplus
  omega

theorem iterated_debt_eq_mul_surplus
    {scheduledWake recoveryQuota : Nat}
    (hThreshold : recoveryQuota ≤ scheduledWake) :
    ∀ n : Nat,
      iteratedDebt n scheduledWake recoveryQuota = n * scheduleSurplus scheduledWake recoveryQuota := by
  intro n
  induction n with
  | zero =>
      simp [iteratedDebt]
  | succ n ih =>
      rw [iteratedDebt, next_cycle_debt_eq_add_surplus hThreshold, ih, Nat.succ_mul]

theorem iterated_debt_eq_zero_of_wake_le_quota
    {scheduledWake recoveryQuota n : Nat}
    (hThreshold : scheduledWake ≤ recoveryQuota) :
    iteratedDebt n scheduledWake recoveryQuota = 0 := by
  induction n with
  | zero =>
      simp [iteratedDebt]
  | succ n ih =>
      rw [iteratedDebt, ih]
      unfold nextCycleDebt
      simpa using
        SleepDebt.full_recovery_clears_residual_debt
          (wakeLoad := scheduledWake)
          (carriedDebt := 0)
          (recoveryQuota := recoveryQuota)
          hThreshold

theorem iterated_debt_eq_cycle_count_mul_gap
    {scheduledWake recoveryQuota n : Nat}
    (hThreshold : recoveryQuota < scheduledWake) :
    iteratedDebt n scheduledWake recoveryQuota =
      n * (scheduledWake - recoveryQuota) := by
  exact iterated_debt_eq_mul_surplus (Nat.le_of_lt hThreshold) n

theorem iterated_debt_positive_above_threshold
    {scheduledWake recoveryQuota n : Nat}
    (hThreshold : recoveryQuota < scheduledWake)
    (hCycle : 0 < n) :
    0 < iteratedDebt n scheduledWake recoveryQuota := by
  rw [iterated_debt_eq_cycle_count_mul_gap hThreshold]
  exact Nat.mul_pos hCycle (Nat.sub_pos_of_lt hThreshold)

theorem iterated_debt_strictly_increases_above_threshold
    {scheduledWake recoveryQuota n : Nat}
    (hThreshold : recoveryQuota < scheduledWake) :
    iteratedDebt n scheduledWake recoveryQuota <
      iteratedDebt (n + 1) scheduledWake recoveryQuota := by
  rw [iterated_debt_eq_cycle_count_mul_gap hThreshold,
    iterated_debt_eq_cycle_count_mul_gap hThreshold]
  have hGap : 0 < scheduledWake - recoveryQuota := Nat.sub_pos_of_lt hThreshold
  simpa [Nat.succ_mul] using
    (Nat.lt_add_of_pos_right hGap : n * (scheduledWake - recoveryQuota) <
      n * (scheduledWake - recoveryQuota) + (scheduledWake - recoveryQuota))

end SleepDebtSchedule
end ForkRaceFoldTheorems
