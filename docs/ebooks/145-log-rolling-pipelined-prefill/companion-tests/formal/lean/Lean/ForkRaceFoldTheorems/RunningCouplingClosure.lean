import Mathlib
import ForkRaceFoldTheorems.FlavorMixingClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Running Coupling Closure

This module adds the smallest honest running-coupling shell the current repo
can certify: a bounded discrete scale ladder with strong-like downward running,
weak/electromagnetic-like upward running, and exact finite unification at the
top scale.
-/

inductive RenormalizationScale where
  | infrared
  | hadronic
  | electroweak
  | unification
  deriving DecidableEq, Repr, Fintype

def strongLikeCoupling : RenormalizationScale → Rat
  | .infrared => 4
  | .hadronic => 3
  | .electroweak => 5 / 2
  | .unification => 2

def weakLikeCoupling : RenormalizationScale → Rat
  | .infrared => 1
  | .hadronic => 4 / 3
  | .electroweak => 5 / 3
  | .unification => 2

def electromagneticLikeCoupling : RenormalizationScale → Rat
  | .infrared => 1
  | .hadronic => 5 / 4
  | .electroweak => 3 / 2
  | .unification => 2

/-- Master bounded running-coupling closure law. -/
abbrev RunningCouplingClosureLaw : Prop :=
  (∀ μ, 0 < strongLikeCoupling μ) ∧
    (∀ μ, 0 < weakLikeCoupling μ) ∧
    (∀ μ, 0 < electromagneticLikeCoupling μ) ∧
    (strongLikeCoupling .infrared > strongLikeCoupling .hadronic ∧
      strongLikeCoupling .hadronic > strongLikeCoupling .electroweak ∧
      strongLikeCoupling .electroweak > strongLikeCoupling .unification) ∧
    (weakLikeCoupling .infrared < weakLikeCoupling .hadronic ∧
      weakLikeCoupling .hadronic < weakLikeCoupling .electroweak ∧
      weakLikeCoupling .electroweak < weakLikeCoupling .unification) ∧
    (electromagneticLikeCoupling .infrared < electromagneticLikeCoupling .hadronic ∧
      electromagneticLikeCoupling .hadronic < electromagneticLikeCoupling .electroweak ∧
      electromagneticLikeCoupling .electroweak < electromagneticLikeCoupling .unification) ∧
    (strongLikeCoupling .electroweak > weakLikeCoupling .electroweak ∧
      weakLikeCoupling .electroweak > electromagneticLikeCoupling .electroweak) ∧
    (strongLikeCoupling .unification = weakLikeCoupling .unification ∧
      weakLikeCoupling .unification = electromagneticLikeCoupling .unification)

theorem strongLike_positive : ∀ μ, 0 < strongLikeCoupling μ := by
  intro μ
  cases μ <;> norm_num [strongLikeCoupling]

theorem weakLike_positive : ∀ μ, 0 < weakLikeCoupling μ := by
  intro μ
  cases μ <;> norm_num [weakLikeCoupling]

theorem electromagneticLike_positive : ∀ μ, 0 < electromagneticLikeCoupling μ := by
  intro μ
  cases μ <;> norm_num [electromagneticLikeCoupling]

theorem strongLike_runs_downward :
    strongLikeCoupling .infrared > strongLikeCoupling .hadronic ∧
      strongLikeCoupling .hadronic > strongLikeCoupling .electroweak ∧
      strongLikeCoupling .electroweak > strongLikeCoupling .unification := by
  norm_num [strongLikeCoupling]

theorem weakLike_runs_upward :
    weakLikeCoupling .infrared < weakLikeCoupling .hadronic ∧
      weakLikeCoupling .hadronic < weakLikeCoupling .electroweak ∧
      weakLikeCoupling .electroweak < weakLikeCoupling .unification := by
  norm_num [weakLikeCoupling]

theorem electromagneticLike_runs_upward :
    electromagneticLikeCoupling .infrared < electromagneticLikeCoupling .hadronic ∧
      electromagneticLikeCoupling .hadronic < electromagneticLikeCoupling .electroweak ∧
      electromagneticLikeCoupling .electroweak < electromagneticLikeCoupling .unification := by
  norm_num [electromagneticLikeCoupling]

theorem electroweak_scale_hierarchy :
    strongLikeCoupling .electroweak > weakLikeCoupling .electroweak ∧
      weakLikeCoupling .electroweak > electromagneticLikeCoupling .electroweak := by
  norm_num [strongLikeCoupling, weakLikeCoupling, electromagneticLikeCoupling]

theorem couplings_unify_at_ceiling :
    strongLikeCoupling .unification = weakLikeCoupling .unification ∧
      weakLikeCoupling .unification = electromagneticLikeCoupling .unification := by
  norm_num [strongLikeCoupling, weakLikeCoupling, electromagneticLikeCoupling]

theorem running_coupling_closure : RunningCouplingClosureLaw := by
  exact ⟨strongLike_positive,
    weakLike_positive,
    electromagneticLike_positive,
    strongLike_runs_downward,
    weakLike_runs_upward,
    electromagneticLike_runs_upward,
    electroweak_scale_hierarchy,
    couplings_unify_at_ceiling⟩

end

end ForkRaceFoldTheorems
