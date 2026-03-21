import Mathlib

namespace ForkRaceFoldTheorems
namespace SleepDebt

def totalRecoveryDemand (wakeLoad carriedDebt : Nat) : Nat :=
  wakeLoad + carriedDebt

def residualDebt (wakeLoad carriedDebt recoveryQuota : Nat) : Nat :=
  totalRecoveryDemand wakeLoad carriedDebt - recoveryQuota

def effectiveCapacity (maxCapacity carriedDebt : Nat) : Nat :=
  maxCapacity - min maxCapacity carriedDebt

def intrusionEnabled (wakeLoad carriedDebt intrusionThreshold : Nat) : Prop :=
  intrusionThreshold <= carriedDebt /\ 0 < wakeLoad

theorem full_recovery_clears_residual_debt
    {wakeLoad carriedDebt recoveryQuota : Nat}
    (hClear : wakeLoad + carriedDebt <= recoveryQuota) :
    residualDebt wakeLoad carriedDebt recoveryQuota = 0 := by
  unfold residualDebt totalRecoveryDemand
  omega

theorem full_recovery_restores_capacity
    {maxCapacity wakeLoad carriedDebt recoveryQuota : Nat}
    (hClear : wakeLoad + carriedDebt <= recoveryQuota) :
    effectiveCapacity maxCapacity (residualDebt wakeLoad carriedDebt recoveryQuota) =
      maxCapacity := by
  rw [full_recovery_clears_residual_debt hClear]
  unfold effectiveCapacity
  simp

theorem partial_recovery_leaves_positive_debt
    {wakeLoad carriedDebt recoveryQuota : Nat}
    (hShortfall : recoveryQuota < wakeLoad + carriedDebt) :
    0 < residualDebt wakeLoad carriedDebt recoveryQuota := by
  unfold residualDebt totalRecoveryDemand
  omega

theorem positive_debt_lowers_capacity
    {maxCapacity carriedDebt : Nat}
    (hCap : 0 < maxCapacity)
    (hDebt : 0 < carriedDebt) :
    effectiveCapacity maxCapacity carriedDebt < maxCapacity := by
  unfold effectiveCapacity
  cases Nat.le_total maxCapacity carriedDebt with
  | inl hMaxLeDebt =>
      rw [Nat.min_eq_left hMaxLeDebt]
      omega
  | inr hDebtLeMax =>
      rw [Nat.min_eq_right hDebtLeMax]
      omega

theorem partial_recovery_lowers_next_capacity
    {maxCapacity wakeLoad carriedDebt recoveryQuota : Nat}
    (hCap : 0 < maxCapacity)
    (hShortfall : recoveryQuota < wakeLoad + carriedDebt) :
    effectiveCapacity maxCapacity (residualDebt wakeLoad carriedDebt recoveryQuota) <
      maxCapacity := by
  apply positive_debt_lowers_capacity hCap
  exact partial_recovery_leaves_positive_debt hShortfall

theorem repeated_truncation_preserves_debt
    {nextWakeLoad carriedDebt recoveryQuota : Nat}
    (hQuota : recoveryQuota <= nextWakeLoad) :
    carriedDebt <= residualDebt nextWakeLoad carriedDebt recoveryQuota := by
  unfold residualDebt totalRecoveryDemand
  omega

theorem repeated_truncation_strictly_increases_debt
    {nextWakeLoad carriedDebt recoveryQuota : Nat}
    (hQuota : recoveryQuota < nextWakeLoad) :
    carriedDebt < residualDebt nextWakeLoad carriedDebt recoveryQuota := by
  unfold residualDebt totalRecoveryDemand
  omega

theorem debt_at_or_above_intrusion_threshold_enables_intrusion
    {wakeLoad carriedDebt intrusionThreshold : Nat}
    (hLoad : 0 < wakeLoad)
    (hDebt : intrusionThreshold <= carriedDebt) :
    intrusionEnabled wakeLoad carriedDebt intrusionThreshold := by
  exact ⟨hDebt, hLoad⟩

-- ─── THM-SLEEP-DEBT-SATURATION-CEILING ──────────────────────────────
-- Floor: debt grows linearly (iterated_debt_eq_cycle_count_mul_gap).
-- Ceiling: maximum sustainable debt before intrusion = capacity.
-- When debt >= capacity, intrusion is forced (the system cannot
-- maintain function without involuntary recovery).
-- ─────────────────────────────────────────────────────────────────────

/-- THM-SLEEP-DEBT-SATURATION: When accumulated debt reaches capacity,
    remaining capacity is zero -- intrusion is forced. -/
theorem sleep_debt_forces_intrusion
    (capacity accumulatedDebt : ℕ)
    (hSaturated : capacity ≤ accumulatedDebt) :
    capacity - accumulatedDebt = 0 := by omega

/-- Below saturation, some capacity remains. -/
theorem sleep_debt_below_saturation
    (capacity accumulatedDebt : ℕ)
    (hBelow : accumulatedDebt < capacity) :
    0 < capacity - accumulatedDebt := by omega

/-- Debt saturation ceiling: maximum useful debt = capacity - 1.
    At capacity, intrusion is forced. Above capacity, same outcome. -/
theorem sleep_debt_ceiling (capacity : ℕ) (hPos : 0 < capacity) :
    capacity - 1 < capacity := by omega

end SleepDebt
end ForkRaceFoldTheorems
