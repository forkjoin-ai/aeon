import Mathlib
import ForkRaceFoldTheorems.RunningCouplingClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Perturbative Beta Closure

This module adds a bounded one-loop beta-coefficient shell on top of the
running-coupling ladder. It packages explicit coefficient witnesses and the
sign of the corresponding cubic beta terms for positive couplings.
-/

def strongOneLoopCoefficient : Rat := -7
def weakOneLoopCoefficient : Rat := -19 / 6
def hyperchargeOneLoopCoefficient : Rat := 41 / 6

def cubicCoupling (g : Rat) : Rat := g * g * g

def oneLoopStrongBeta (g : Rat) : Rat :=
  strongOneLoopCoefficient * cubicCoupling g

def oneLoopWeakBeta (g : Rat) : Rat :=
  weakOneLoopCoefficient * cubicCoupling g

def oneLoopHyperchargeBeta (g : Rat) : Rat :=
  hyperchargeOneLoopCoefficient * cubicCoupling g

/-- Master bounded perturbative beta shell. -/
abbrev PerturbativeBetaClosureLaw : Prop :=
  strongOneLoopCoefficient < 0 ∧
    weakOneLoopCoefficient < 0 ∧
    0 < hyperchargeOneLoopCoefficient ∧
    (∀ g, 0 < g → oneLoopStrongBeta g < 0) ∧
    (∀ g, 0 < g → oneLoopWeakBeta g < 0) ∧
    (∀ g, 0 < g → 0 < oneLoopHyperchargeBeta g) ∧
    oneLoopStrongBeta (strongLikeCoupling .electroweak) < 0 ∧
    oneLoopWeakBeta (weakLikeCoupling .electroweak) < 0 ∧
    0 < oneLoopHyperchargeBeta (electromagneticLikeCoupling .electroweak)

theorem cubicCoupling_positive {g : Rat} (hg : 0 < g) :
    0 < cubicCoupling g := by
  unfold cubicCoupling
  exact mul_pos (mul_pos hg hg) hg

theorem strong_coefficient_negative :
    strongOneLoopCoefficient < 0 := by
  norm_num [strongOneLoopCoefficient]

theorem weak_coefficient_negative :
    weakOneLoopCoefficient < 0 := by
  norm_num [weakOneLoopCoefficient]

theorem hypercharge_coefficient_positive :
    0 < hyperchargeOneLoopCoefficient := by
  norm_num [hyperchargeOneLoopCoefficient]

theorem oneLoopStrongBeta_negative :
    ∀ g, 0 < g → oneLoopStrongBeta g < 0 := by
  intro g hg
  unfold oneLoopStrongBeta
  exact mul_neg_of_neg_of_pos strong_coefficient_negative (cubicCoupling_positive hg)

theorem oneLoopWeakBeta_negative :
    ∀ g, 0 < g → oneLoopWeakBeta g < 0 := by
  intro g hg
  unfold oneLoopWeakBeta
  exact mul_neg_of_neg_of_pos weak_coefficient_negative (cubicCoupling_positive hg)

theorem oneLoopHyperchargeBeta_positive :
    ∀ g, 0 < g → 0 < oneLoopHyperchargeBeta g := by
  intro g hg
  unfold oneLoopHyperchargeBeta
  exact mul_pos hypercharge_coefficient_positive (cubicCoupling_positive hg)

theorem electroweak_scale_strong_beta_negative :
    oneLoopStrongBeta (strongLikeCoupling .electroweak) < 0 := by
  norm_num [oneLoopStrongBeta, strongOneLoopCoefficient, cubicCoupling, strongLikeCoupling]

theorem electroweak_scale_weak_beta_negative :
    oneLoopWeakBeta (weakLikeCoupling .electroweak) < 0 := by
  norm_num [oneLoopWeakBeta, weakOneLoopCoefficient, cubicCoupling, weakLikeCoupling]

theorem electroweak_scale_hypercharge_beta_positive :
    0 < oneLoopHyperchargeBeta (electromagneticLikeCoupling .electroweak) := by
  norm_num [oneLoopHyperchargeBeta, hyperchargeOneLoopCoefficient,
    cubicCoupling, electromagneticLikeCoupling]

theorem perturbative_beta_closure : PerturbativeBetaClosureLaw := by
  exact ⟨strong_coefficient_negative,
    weak_coefficient_negative,
    hypercharge_coefficient_positive,
    oneLoopStrongBeta_negative,
    oneLoopWeakBeta_negative,
    oneLoopHyperchargeBeta_positive,
    electroweak_scale_strong_beta_negative,
    electroweak_scale_weak_beta_negative,
    electroweak_scale_hypercharge_beta_positive⟩

end

end ForkRaceFoldTheorems
