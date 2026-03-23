import Mathlib
import ForkRaceFoldTheorems.AnomalyCancellationClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Continuous Beta Function Closure

This module adds the smallest honest continuous beta-function shell on top of
the bounded running-coupling ladder. The shell certifies continuous real-valued
flows with the expected sign behavior; it does not solve the full physical
renormalization-group equations.
-/

def strongFlow (t : ℝ) : ℝ := Real.exp (-t)
def weakFlow (t : ℝ) : ℝ := Real.exp (t / 2)
def electromagneticFlow (t : ℝ) : ℝ := Real.exp (t / 4)

def strongBeta (t : ℝ) : ℝ := -Real.exp (-t)
def weakBeta (t : ℝ) : ℝ := (1 / 2 : ℝ) * Real.exp (t / 2)
def electromagneticBeta (t : ℝ) : ℝ := (1 / 4 : ℝ) * Real.exp (t / 4)

/-- Master bounded continuous beta-function shell. -/
abbrev ContinuousBetaFunctionClosureLaw : Prop :=
  Continuous strongFlow ∧
    Continuous weakFlow ∧
    Continuous electromagneticFlow ∧
    (∀ t, strongBeta t < 0) ∧
    (∀ t, 0 < weakBeta t) ∧
    (∀ t, 0 < electromagneticBeta t) ∧
    (∀ {t₁ t₂}, t₁ ≤ t₂ → strongFlow t₂ ≤ strongFlow t₁) ∧
    (∀ {t₁ t₂}, t₁ ≤ t₂ → weakFlow t₁ ≤ weakFlow t₂) ∧
    (∀ {t₁ t₂}, t₁ ≤ t₂ → electromagneticFlow t₁ ≤ electromagneticFlow t₂) ∧
    (strongFlow 0 = 1 ∧ weakFlow 0 = 1 ∧ electromagneticFlow 0 = 1)

theorem strongFlow_continuous : Continuous strongFlow := by
  have hArg : Continuous fun t : ℝ => -t := by
    fun_prop
  simpa [strongFlow] using Real.continuous_exp.comp hArg

theorem weakFlow_continuous : Continuous weakFlow := by
  have hArg : Continuous fun t : ℝ => t / 2 := by
    fun_prop
  simpa [weakFlow] using Real.continuous_exp.comp hArg

theorem electromagneticFlow_continuous : Continuous electromagneticFlow := by
  have hArg : Continuous fun t : ℝ => t / 4 := by
    fun_prop
  simpa [electromagneticFlow] using Real.continuous_exp.comp hArg

theorem strongBeta_negative :
    ∀ t, strongBeta t < 0 := by
  intro t
  dsimp [strongBeta]
  exact neg_lt_zero.mpr (Real.exp_pos (-t))

theorem weakBeta_positive :
    ∀ t, 0 < weakBeta t := by
  intro t
  dsimp [weakBeta]
  have hHalf : 0 < (1 / 2 : ℝ) := by
    norm_num
  exact mul_pos hHalf (Real.exp_pos (t / 2))

theorem electromagneticBeta_positive :
    ∀ t, 0 < electromagneticBeta t := by
  intro t
  dsimp [electromagneticBeta]
  have hQuarter : 0 < (1 / 4 : ℝ) := by
    norm_num
  exact mul_pos hQuarter (Real.exp_pos (t / 4))

theorem strongFlow_antitone :
    ∀ {t₁ t₂}, t₁ ≤ t₂ → strongFlow t₂ ≤ strongFlow t₁ := by
  intro t₁ t₂ h
  unfold strongFlow
  apply Real.exp_le_exp.mpr
  linarith

theorem weakFlow_monotone :
    ∀ {t₁ t₂}, t₁ ≤ t₂ → weakFlow t₁ ≤ weakFlow t₂ := by
  intro t₁ t₂ h
  unfold weakFlow
  apply Real.exp_le_exp.mpr
  nlinarith

theorem electromagneticFlow_monotone :
    ∀ {t₁ t₂}, t₁ ≤ t₂ → electromagneticFlow t₁ ≤ electromagneticFlow t₂ := by
  intro t₁ t₂ h
  unfold electromagneticFlow
  apply Real.exp_le_exp.mpr
  nlinarith

theorem continuous_flows_anchor_at_zero :
    strongFlow 0 = 1 ∧ weakFlow 0 = 1 ∧ electromagneticFlow 0 = 1 := by
  simp [strongFlow, weakFlow, electromagneticFlow]

theorem continuous_beta_function_closure : ContinuousBetaFunctionClosureLaw := by
  exact ⟨strongFlow_continuous,
    weakFlow_continuous,
    electromagneticFlow_continuous,
    strongBeta_negative,
    weakBeta_positive,
    electromagneticBeta_positive,
    strongFlow_antitone,
    weakFlow_monotone,
    electromagneticFlow_monotone,
    continuous_flows_anchor_at_zero⟩

end

end ForkRaceFoldTheorems
