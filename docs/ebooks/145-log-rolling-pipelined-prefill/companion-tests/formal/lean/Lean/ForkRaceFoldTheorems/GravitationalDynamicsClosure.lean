import Mathlib
import ForkRaceFoldTheorems.YukawaMassGenerationClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Gravitational Dynamics Closure

This module adds the smallest honest local gravity shell on top of the bounded
mass-generation surface. It packages a discrete inverse-square radial law and
shows that the generated mass witnesses source positive attraction.
-/

inductive RadialShell where
  | unit
  | double
  | quad
  deriving DecidableEq, Repr

def inverseSquareWeight : RadialShell → Rat
  | .unit => 1
  | .double => 1 / 4
  | .quad => 1 / 16

def gravitationalForce (m₁ m₂ : Rat) (r : RadialShell) : Rat :=
  m₁ * m₂ * inverseSquareWeight r

/-- Master bounded local gravity shell. -/
abbrev GravitationalDynamicsClosureLaw : Prop :=
  (∀ r, 0 < inverseSquareWeight r) ∧
    (inverseSquareWeight .unit > inverseSquareWeight .double ∧
      inverseSquareWeight .double > inverseSquareWeight .quad) ∧
    (∀ m₁ m₂ r, gravitationalForce m₁ m₂ r = gravitationalForce m₂ m₁ r) ∧
    (∀ m₁ m₂ r, 0 < m₁ → 0 < m₂ → 0 < gravitationalForce m₁ m₂ r) ∧
    gravitationalForce (chargedLeptonMass .electron) (chargedLeptonMass .muon) .unit > 0 ∧
    gravitationalForce (upTypeMass .top) (chargedLeptonMass .tau) .unit >
      gravitationalForce (chargedLeptonMass .electron) (chargedLeptonMass .muon) .unit ∧
    (∀ r, gravitationalForce (neutrinoMass .electron) (chargedLeptonMass .electron) r = 0)

theorem inverseSquareWeight_positive :
    ∀ r, 0 < inverseSquareWeight r := by
  intro r
  cases r <;> norm_num [inverseSquareWeight]

theorem inverseSquare_shell_order :
    inverseSquareWeight .unit > inverseSquareWeight .double ∧
      inverseSquareWeight .double > inverseSquareWeight .quad := by
  norm_num [inverseSquareWeight]

theorem gravitationalForce_symmetric :
    ∀ m₁ m₂ r, gravitationalForce m₁ m₂ r = gravitationalForce m₂ m₁ r := by
  intro m₁ m₂ r
  unfold gravitationalForce
  ring

theorem gravitationalForce_positive :
    ∀ m₁ m₂ r, 0 < m₁ → 0 < m₂ → 0 < gravitationalForce m₁ m₂ r := by
  intro m₁ m₂ r hm₁ hm₂
  unfold gravitationalForce
  exact mul_pos (mul_pos hm₁ hm₂) (inverseSquareWeight_positive r)

theorem charged_lepton_gravity_positive :
    gravitationalForce (chargedLeptonMass .electron) (chargedLeptonMass .muon) .unit > 0 := by
  norm_num [gravitationalForce, chargedLeptonMass, generatedMass,
    chargedLeptonYukawa, higgsVacuumExpectation, inverseSquareWeight]

theorem heavier_sources_gravitate_more :
    gravitationalForce (upTypeMass .top) (chargedLeptonMass .tau) .unit >
      gravitationalForce (chargedLeptonMass .electron) (chargedLeptonMass .muon) .unit := by
  norm_num [gravitationalForce, upTypeMass, chargedLeptonMass, generatedMass,
    upTypeYukawa, chargedLeptonYukawa, higgsVacuumExpectation, inverseSquareWeight]

theorem massless_neutrino_has_zero_gravity_source :
    ∀ r, gravitationalForce (neutrinoMass .electron) (chargedLeptonMass .electron) r = 0 := by
  intro r
  cases r <;> norm_num [gravitationalForce, neutrinoMass, chargedLeptonMass,
    generatedMass, neutrinoYukawa, chargedLeptonYukawa, higgsVacuumExpectation,
    inverseSquareWeight]

theorem gravitational_dynamics_closure : GravitationalDynamicsClosureLaw := by
  exact ⟨inverseSquareWeight_positive,
    inverseSquare_shell_order,
    gravitationalForce_symmetric,
    gravitationalForce_positive,
    charged_lepton_gravity_positive,
    heavier_sources_gravitate_more,
    massless_neutrino_has_zero_gravity_source⟩

end

end ForkRaceFoldTheorems
