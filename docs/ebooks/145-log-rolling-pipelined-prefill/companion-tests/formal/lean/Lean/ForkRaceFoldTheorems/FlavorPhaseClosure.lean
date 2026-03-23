import Mathlib
import ForkRaceFoldTheorems.FlavorMixingClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Flavor Phase Closure

This module adds the smallest honest phase shell on top of the bounded flavor
mixing surface. It does not attempt full complex measured CKM/PMNS matrices.
It packages a bounded quarter-turn phase vocabulary, explicit conjugation, and
named CKM/PMNS-style phase assignments on the three-generation shell.
-/

inductive QuarterTurnPhase where
  | zero
  | quarter
  | half
  | threeQuarter
  deriving DecidableEq, Repr

def phaseConjugate : QuarterTurnPhase → QuarterTurnPhase
  | .zero => .zero
  | .quarter => .threeQuarter
  | .half => .half
  | .threeQuarter => .quarter

def phaseValue : QuarterTurnPhase → Rat
  | .zero => 0
  | .quarter => 1 / 4
  | .half => 1 / 2
  | .threeQuarter => 3 / 4

abbrev GenerationPhase := Generation → Generation → QuarterTurnPhase

def ckmPhase : GenerationPhase
  | .first, .second => .quarter
  | .second, .first => .threeQuarter
  | _, _ => .zero

def pmnsPhase : GenerationPhase
  | .first, .second => .quarter
  | .second, .first => .threeQuarter
  | .second, .third => .quarter
  | .third, .second => .threeQuarter
  | .third, .first => .half
  | .first, .third => .half
  | _, _ => .zero

/-- Master bounded flavor-phase shell. -/
abbrev FlavorPhaseClosureLaw : Prop :=
  (∀ p, phaseConjugate (phaseConjugate p) = p) ∧
    (∀ p, 0 ≤ phaseValue p ∧ phaseValue p ≤ 1) ∧
    (∀ g, ckmPhase g g = .zero) ∧
    ckmPhase .first .second = .quarter ∧
    ckmPhase .second .first = phaseConjugate (ckmPhase .first .second) ∧
    (∀ g, pmnsPhase g g = .zero) ∧
    pmnsPhase .first .second = .quarter ∧
    pmnsPhase .second .first = phaseConjugate (pmnsPhase .first .second) ∧
    pmnsPhase .first .third = .half ∧
    phaseConjugate (pmnsPhase .first .third) = pmnsPhase .third .first

theorem phaseConjugate_involutive :
    ∀ p, phaseConjugate (phaseConjugate p) = p := by
  intro p
  cases p <;> rfl

theorem phaseValue_bounded :
    ∀ p, 0 ≤ phaseValue p ∧ phaseValue p ≤ 1 := by
  intro p
  cases p <;> norm_num [phaseValue]

theorem ckmPhase_diagonal_zero :
    ∀ g, ckmPhase g g = .zero := by
  intro g
  cases g <;> rfl

theorem ckmPhase_offdiagonal_conjugate :
    ckmPhase .first .second = .quarter ∧
      ckmPhase .second .first = phaseConjugate (ckmPhase .first .second) := by
  exact ⟨rfl, rfl⟩

theorem pmnsPhase_diagonal_zero :
    ∀ g, pmnsPhase g g = .zero := by
  intro g
  cases g <;> rfl

theorem pmnsPhase_first_second_conjugate :
    pmnsPhase .first .second = .quarter ∧
      pmnsPhase .second .first = phaseConjugate (pmnsPhase .first .second) := by
  exact ⟨rfl, rfl⟩

theorem pmnsPhase_first_third_half_turn :
    pmnsPhase .first .third = .half ∧
      phaseConjugate (pmnsPhase .first .third) = pmnsPhase .third .first := by
  exact ⟨rfl, rfl⟩

theorem flavor_phase_closure : FlavorPhaseClosureLaw := by
  exact ⟨phaseConjugate_involutive,
    phaseValue_bounded,
    ckmPhase_diagonal_zero,
    rfl,
    rfl,
    pmnsPhase_diagonal_zero,
    rfl,
    rfl,
    rfl,
    rfl⟩

end

end ForkRaceFoldTheorems
