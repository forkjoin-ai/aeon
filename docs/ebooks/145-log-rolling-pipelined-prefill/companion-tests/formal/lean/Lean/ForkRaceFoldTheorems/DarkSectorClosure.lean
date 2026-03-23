import Mathlib
import ForkRaceFoldTheorems.GravitationalDynamicsClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Dark Sector Closure

This module adds the smallest honest dark-sector shell the current package can
support: gravitationally active neutral matter, a negative-pressure dark-energy
term, and density bookkeeping with dark-energy dominance.
-/

def baryonDensity : Rat := 5 / 100
def darkMatterDensity : Rat := 27 / 100
def darkEnergyDensity : Rat := 68 / 100

def darkMatterElectricCharge : Int := 0
def darkMatterWeakCharge : Int := 0
def darkEnergyPressure : Rat := -darkEnergyDensity

def darkMatterGravityOnBaryons : Rat :=
  gravitationalForce darkMatterDensity baryonDensity .unit

/-- Master bounded dark-sector shell. -/
abbrev DarkSectorClosureLaw : Prop :=
  0 < baryonDensity ∧
    0 < darkMatterDensity ∧
    0 < darkEnergyDensity ∧
    darkMatterDensity > baryonDensity ∧
    darkEnergyDensity > baryonDensity + darkMatterDensity ∧
    darkMatterElectricCharge = 0 ∧
    darkMatterWeakCharge = 0 ∧
    darkEnergyPressure < 0 ∧
    0 < darkMatterGravityOnBaryons

theorem baryonDensity_positive :
    0 < baryonDensity := by
  norm_num [baryonDensity]

theorem darkMatterDensity_positive :
    0 < darkMatterDensity := by
  norm_num [darkMatterDensity]

theorem darkEnergyDensity_positive :
    0 < darkEnergyDensity := by
  norm_num [darkEnergyDensity]

theorem darkMatter_exceeds_baryons :
    darkMatterDensity > baryonDensity := by
  norm_num [darkMatterDensity, baryonDensity]

theorem darkEnergy_dominates_matter :
    darkEnergyDensity > baryonDensity + darkMatterDensity := by
  norm_num [darkEnergyDensity, baryonDensity, darkMatterDensity]

theorem darkMatter_is_electrically_neutral :
    darkMatterElectricCharge = 0 := by
  rfl

theorem darkMatter_is_weakly_neutral :
    darkMatterWeakCharge = 0 := by
  rfl

theorem darkEnergyPressure_negative :
    darkEnergyPressure < 0 := by
  norm_num [darkEnergyPressure, darkEnergyDensity]

theorem darkMatter_gravity_on_baryons_positive :
    0 < darkMatterGravityOnBaryons := by
  unfold darkMatterGravityOnBaryons
  exact gravitationalForce_positive darkMatterDensity baryonDensity .unit
    darkMatterDensity_positive baryonDensity_positive

theorem dark_sector_closure : DarkSectorClosureLaw := by
  exact ⟨baryonDensity_positive,
    darkMatterDensity_positive,
    darkEnergyDensity_positive,
    darkMatter_exceeds_baryons,
    darkEnergy_dominates_matter,
    darkMatter_is_electrically_neutral,
    darkMatter_is_weakly_neutral,
    darkEnergyPressure_negative,
    darkMatter_gravity_on_baryons_positive⟩

end

end ForkRaceFoldTheorems
