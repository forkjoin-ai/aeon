import Mathlib
import ForkRaceFoldTheorems.FlavorPhaseClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Precision Flavor Closure

This module adds the smallest honest measured-like flavor shell on top of the
bounded flavor-mixing and phase surfaces. It does not claim a full global fit.
It packages exact rational surrogate CKM/PMNS tables together with a
nontrivial bounded CP-phase witness.
-/

def measuredCKMSurrogate : GenerationMixing
  | .first, .first => 19 / 20
  | .first, .second => 1 / 20
  | .first, .third => 0
  | .second, .first => 1 / 20
  | .second, .second => 47 / 50
  | .second, .third => 1 / 100
  | .third, .first => 0
  | .third, .second => 1 / 100
  | .third, .third => 99 / 100

def measuredPMNSSurrogate : GenerationMixing
  | .first, .first => 2 / 3
  | .first, .second => 1 / 6
  | .first, .third => 1 / 6
  | .second, .first => 1 / 6
  | .second, .second => 2 / 3
  | .second, .third => 1 / 6
  | .third, .first => 1 / 6
  | .third, .second => 1 / 6
  | .third, .third => 2 / 3

/-- Master bounded precision-flavor shell. -/
abbrev PrecisionFlavorClosureLaw : Prop :=
  mixingNonnegative measuredCKMSurrogate ∧
    rowNormalized measuredCKMSurrogate ∧
    columnNormalized measuredCKMSurrogate ∧
    mixingNonnegative measuredPMNSSurrogate ∧
    rowNormalized measuredPMNSSurrogate ∧
    columnNormalized measuredPMNSSurrogate ∧
    (measuredCKMSurrogate .first .first > measuredCKMSurrogate .first .second ∧
      measuredCKMSurrogate .second .second > measuredCKMSurrogate .second .third) ∧
    (measuredPMNSSurrogate .first .third > 0 ∧
      measuredPMNSSurrogate .second .third > 0 ∧
      measuredPMNSSurrogate .third .first > 0) ∧
    ckmPhase .first .second ≠ .zero ∧
    pmnsPhase .first .third = .half

theorem measuredCKM_nonnegative :
    mixingNonnegative measuredCKMSurrogate := by
  intro g h
  cases g <;> cases h <;> norm_num [mixingNonnegative, measuredCKMSurrogate]

theorem measuredCKM_row_normalized :
    rowNormalized measuredCKMSurrogate := by
  intro g
  cases g <;> norm_num [rowNormalized, rowSum, measuredCKMSurrogate]

theorem measuredCKM_column_normalized :
    columnNormalized measuredCKMSurrogate := by
  intro g
  cases g <;> norm_num [columnNormalized, columnSum, measuredCKMSurrogate]

theorem measuredPMNS_nonnegative :
    mixingNonnegative measuredPMNSSurrogate := by
  intro g h
  cases g <;> cases h <;> norm_num [mixingNonnegative, measuredPMNSSurrogate]

theorem measuredPMNS_row_normalized :
    rowNormalized measuredPMNSSurrogate := by
  intro g
  cases g <;> norm_num [rowNormalized, rowSum, measuredPMNSSurrogate]

theorem measuredPMNS_column_normalized :
    columnNormalized measuredPMNSSurrogate := by
  intro g
  cases g <;> norm_num [columnNormalized, columnSum, measuredPMNSSurrogate]

theorem measuredCKM_hierarchy :
    measuredCKMSurrogate .first .first > measuredCKMSurrogate .first .second ∧
      measuredCKMSurrogate .second .second > measuredCKMSurrogate .second .third := by
  norm_num [measuredCKMSurrogate]

theorem measuredPMNS_broad_mixing :
    measuredPMNSSurrogate .first .third > 0 ∧
      measuredPMNSSurrogate .second .third > 0 ∧
      measuredPMNSSurrogate .third .first > 0 := by
  norm_num [measuredPMNSSurrogate]

theorem ckm_cp_phase_nontrivial :
    ckmPhase .first .second ≠ .zero := by
  decide

theorem pmns_half_turn_phase_witness :
    pmnsPhase .first .third = .half := by
  rfl

theorem precision_flavor_closure : PrecisionFlavorClosureLaw := by
  exact ⟨measuredCKM_nonnegative,
    measuredCKM_row_normalized,
    measuredCKM_column_normalized,
    measuredPMNS_nonnegative,
    measuredPMNS_row_normalized,
    measuredPMNS_column_normalized,
    measuredCKM_hierarchy,
    measuredPMNS_broad_mixing,
    ckm_cp_phase_nontrivial,
    pmns_half_turn_phase_witness⟩

end

end ForkRaceFoldTheorems
