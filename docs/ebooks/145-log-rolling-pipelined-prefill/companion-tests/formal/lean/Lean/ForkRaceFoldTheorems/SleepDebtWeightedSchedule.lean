import Mathlib

namespace ForkRaceFoldTheorems
namespace SleepDebtWeightedSchedule

def thresholdLhs (scheduledWake wakeBurdenRate recoveryRate : Nat) : Nat :=
  scheduledWake * (wakeBurdenRate + recoveryRate)

def thresholdRhs (cycleLength recoveryRate : Nat) : Nat :=
  cycleLength * recoveryRate

def weightedSurplus
    (cycleLength scheduledWake wakeBurdenRate recoveryRate : Nat) : Nat :=
  thresholdLhs scheduledWake wakeBurdenRate recoveryRate -
    thresholdRhs cycleLength recoveryRate

def nextCycleDebt
    (cycleLength scheduledWake wakeBurdenRate recoveryRate carriedDebt : Nat) : Nat :=
  carriedDebt + weightedSurplus cycleLength scheduledWake wakeBurdenRate recoveryRate

def iteratedDebt :
    Nat -> Nat -> Nat -> Nat -> Nat -> Nat
  | 0, _, _, _, _ => 0
  | n + 1, cycleLength, scheduledWake, wakeBurdenRate, recoveryRate =>
      nextCycleDebt cycleLength scheduledWake wakeBurdenRate recoveryRate
        (iteratedDebt n cycleLength scheduledWake wakeBurdenRate recoveryRate)

theorem weighted_surplus_eq_zero_of_not_crossed
    {cycleLength scheduledWake wakeBurdenRate recoveryRate : Nat}
    (hNotCrossed :
      thresholdLhs scheduledWake wakeBurdenRate recoveryRate ≤
        thresholdRhs cycleLength recoveryRate) :
    weightedSurplus cycleLength scheduledWake wakeBurdenRate recoveryRate = 0 := by
  unfold weightedSurplus
  exact Nat.sub_eq_zero_of_le hNotCrossed

theorem weighted_surplus_positive_of_crossed
    {cycleLength scheduledWake wakeBurdenRate recoveryRate : Nat}
    (hCrossed :
      thresholdRhs cycleLength recoveryRate <
        thresholdLhs scheduledWake wakeBurdenRate recoveryRate) :
    0 < weightedSurplus cycleLength scheduledWake wakeBurdenRate recoveryRate := by
  unfold weightedSurplus
  exact Nat.sub_pos_of_lt hCrossed

theorem iterated_debt_eq_mul_surplus
    {cycleLength scheduledWake wakeBurdenRate recoveryRate : Nat} :
    ∀ n : Nat,
      iteratedDebt n cycleLength scheduledWake wakeBurdenRate recoveryRate =
        n * weightedSurplus cycleLength scheduledWake wakeBurdenRate recoveryRate := by
  intro n
  induction n with
  | zero =>
      simp [iteratedDebt]
  | succ n ih =>
      rw [iteratedDebt, ih]
      simp [nextCycleDebt, Nat.succ_mul]

theorem iterated_debt_eq_zero_of_not_crossed
    {cycleLength scheduledWake wakeBurdenRate recoveryRate n : Nat}
    (hNotCrossed :
      thresholdLhs scheduledWake wakeBurdenRate recoveryRate ≤
        thresholdRhs cycleLength recoveryRate) :
    iteratedDebt n cycleLength scheduledWake wakeBurdenRate recoveryRate = 0 := by
  rw [iterated_debt_eq_mul_surplus]
  rw [weighted_surplus_eq_zero_of_not_crossed hNotCrossed]
  simp

theorem iterated_debt_eq_cycle_count_mul_gap_of_crossed
    {cycleLength scheduledWake wakeBurdenRate recoveryRate n : Nat}
    (_hCrossed :
      thresholdRhs cycleLength recoveryRate <
        thresholdLhs scheduledWake wakeBurdenRate recoveryRate) :
    iteratedDebt n cycleLength scheduledWake wakeBurdenRate recoveryRate =
      n * (thresholdLhs scheduledWake wakeBurdenRate recoveryRate -
        thresholdRhs cycleLength recoveryRate) := by
  rw [iterated_debt_eq_mul_surplus]
  rfl

theorem iterated_debt_positive_above_threshold
    {cycleLength scheduledWake wakeBurdenRate recoveryRate n : Nat}
    (hCrossed :
      thresholdRhs cycleLength recoveryRate <
        thresholdLhs scheduledWake wakeBurdenRate recoveryRate)
    (hCycle : 0 < n) :
    0 < iteratedDebt n cycleLength scheduledWake wakeBurdenRate recoveryRate := by
  rw [iterated_debt_eq_mul_surplus]
  exact Nat.mul_pos hCycle (weighted_surplus_positive_of_crossed hCrossed)

theorem iterated_debt_strictly_increases_above_threshold
    {cycleLength scheduledWake wakeBurdenRate recoveryRate n : Nat}
    (hCrossed :
      thresholdRhs cycleLength recoveryRate <
        thresholdLhs scheduledWake wakeBurdenRate recoveryRate) :
    iteratedDebt n cycleLength scheduledWake wakeBurdenRate recoveryRate <
      iteratedDebt (n + 1) cycleLength scheduledWake wakeBurdenRate recoveryRate := by
  rw [iterated_debt_eq_mul_surplus, iterated_debt_eq_mul_surplus, Nat.succ_mul]
  exact Nat.lt_add_of_pos_right (weighted_surplus_positive_of_crossed hCrossed)

theorem literature_boundary_tenths_closed_form :
    thresholdLhs 202 19 101 = thresholdRhs 240 101 := by
  native_decide

theorem literature_boundary_crossed_at_twentyone_hours :
    thresholdRhs 240 101 < thresholdLhs 210 19 101 := by
  native_decide

end SleepDebtWeightedSchedule
end ForkRaceFoldTheorems
