import Mathlib
import ForkRaceFoldTheorems.FermionChargeClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Flavor Mixing Closure

This module adds the smallest honest flavor-mixing surface on top of the
bounded fermion/charge shell.

The goal is not to derive the full complex CKM/PMNS data with phases. The goal
is to certify the bounded structure the current repo can honestly carry:

1. exactly three generations are available;
2. CKM-like mixing is a normalized three-generation kernel;
3. PMNS-like mixing is a normalized three-generation kernel;
4. mixing preserves the charge class of the fermion family being mixed.
-/

abbrev MixingAmplitude := Rat
abbrev GenerationMixing := Generation → Generation → MixingAmplitude

/-- Explicit row sum on the three-generation shell. -/
def rowSum (m : GenerationMixing) : Generation → MixingAmplitude
  | .first => m .first .first + m .first .second + m .first .third
  | .second => m .second .first + m .second .second + m .second .third
  | .third => m .third .first + m .third .second + m .third .third

/-- Explicit column sum on the three-generation shell. -/
def columnSum (m : GenerationMixing) : Generation → MixingAmplitude
  | .first => m .first .first + m .second .first + m .third .first
  | .second => m .first .second + m .second .second + m .third .second
  | .third => m .first .third + m .second .third + m .third .third

def mixingNonnegative (m : GenerationMixing) : Prop :=
  ∀ g h, 0 ≤ m g h

def rowNormalized (m : GenerationMixing) : Prop :=
  ∀ g, rowSum m g = 1

def columnNormalized (m : GenerationMixing) : Prop :=
  ∀ g, columnSum m g = 1

/-- A Cabibbo-like quark mixing kernel: the first two generations mix, the
third generation stays fixed. -/
def cabibboLike : GenerationMixing
  | .first, .first => 1 / 2
  | .first, .second => 1 / 2
  | .second, .first => 1 / 2
  | .second, .second => 1 / 2
  | .third, .third => 1
  | _, _ => 0

/-- A PMNS-like neutrino mixing kernel: democratic support over all three
generations. -/
def pmnsLike : GenerationMixing := fun _ _ => 1 / 3

/-- Mixing among down-type quarks preserves the down-type charge class. -/
def mixedDownChargeThirds (m : GenerationMixing) (g : Generation) : MixingAmplitude :=
  rowSum m g * (-1)

/-- Mixing among neutrinos preserves electric neutrality. -/
def mixedNeutrinoChargeThirds (_m : GenerationMixing) (_g : Generation) : MixingAmplitude := 0

/-- Master bounded flavor-mixing closure law. -/
abbrev FlavorMixingClosureLaw : Prop :=
  Fintype.card Generation = 3 ∧
    mixingNonnegative cabibboLike ∧
    rowNormalized cabibboLike ∧
    columnNormalized cabibboLike ∧
    mixingNonnegative pmnsLike ∧
    rowNormalized pmnsLike ∧
    columnNormalized pmnsLike ∧
    (∀ g, mixedDownChargeThirds cabibboLike g = -1) ∧
    (∀ g, mixedNeutrinoChargeThirds pmnsLike g = 0)

theorem cabibboLike_nonnegative : mixingNonnegative cabibboLike := by
  intro g h
  cases g <;> cases h <;> norm_num [mixingNonnegative, cabibboLike]

theorem cabibboLike_row_normalized : rowNormalized cabibboLike := by
  intro g
  cases g <;> norm_num [rowNormalized, rowSum, cabibboLike]

theorem cabibboLike_column_normalized : columnNormalized cabibboLike := by
  intro g
  cases g <;> norm_num [columnNormalized, columnSum, cabibboLike]

theorem pmnsLike_nonnegative : mixingNonnegative pmnsLike := by
  intro g h
  cases g <;> cases h <;> norm_num [mixingNonnegative, pmnsLike]

theorem pmnsLike_row_normalized : rowNormalized pmnsLike := by
  intro g
  cases g <;> norm_num [rowNormalized, rowSum, pmnsLike]

theorem pmnsLike_column_normalized : columnNormalized pmnsLike := by
  intro g
  cases g <;> norm_num [columnNormalized, columnSum, pmnsLike]

theorem cabibboLike_preserves_down_charge :
    ∀ g, mixedDownChargeThirds cabibboLike g = -1 := by
  intro g
  cases g <;> norm_num [mixedDownChargeThirds, rowSum, cabibboLike]

theorem pmnsLike_preserves_neutral_charge :
    ∀ g, mixedNeutrinoChargeThirds pmnsLike g = 0 := by
  intro g
  cases g <;> rfl

theorem flavor_mixing_closure : FlavorMixingClosureLaw := by
  exact ⟨generation_count_is_three,
    cabibboLike_nonnegative,
    cabibboLike_row_normalized,
    cabibboLike_column_normalized,
    pmnsLike_nonnegative,
    pmnsLike_row_normalized,
    pmnsLike_column_normalized,
    cabibboLike_preserves_down_charge,
    pmnsLike_preserves_neutral_charge⟩

end

end ForkRaceFoldTheorems
