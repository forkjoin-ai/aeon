import Mathlib
import ForkRaceFoldTheorems.GaugeRepresentationClosure
import ForkRaceFoldTheorems.FermionChargeClosure
import ForkRaceFoldTheorems.BosonPosition

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Yukawa Mass Generation Closure

This module adds the smallest honest Yukawa/Higgs mass-generation shell on top
of the bounded gauge-representation table. It packages:

1. one positive Higgs vacuum expectation witness;
2. exact hypercharge-balance witnesses for up, down, and charged-lepton Yukawa terms;
3. positive charged-fermion Yukawa couplings;
4. zero neutrino Yukawa on the current bounded shell;
5. exact mass generation as `vev * Yukawa` with within-family hierarchy.

It is not a full spontaneous-symmetry-breaking or seesaw derivation.
-/

abbrev YukawaCoupling := Rat
abbrev MassScale := Rat

def higgsVacuumExpectation : MassScale := 246

def upYukawaBalance : Rat :=
  hypercharge .qL + higgsHypercharge + hypercharge .uRc

def downYukawaBalance : Rat :=
  hypercharge .qL + conjugateHiggsHypercharge + hypercharge .dRc

def chargedLeptonYukawaBalance : Rat :=
  hypercharge .lL + conjugateHiggsHypercharge + hypercharge .eRc

def chargedLeptonYukawa : ChargedLepton → YukawaCoupling
  | .electron => 1 / 500
  | .muon => 1 / 50
  | .tau => 1 / 10

def neutrinoYukawa : NeutrinoFlavor → YukawaCoupling := fun _ => 0

def upTypeYukawa : UpTypeQuark → YukawaCoupling
  | .up => 1 / 1000
  | .charm => 1 / 20
  | .top => 7 / 10

def downTypeYukawa : DownTypeQuark → YukawaCoupling
  | .down => 1 / 1500
  | .strange => 1 / 200
  | .bottom => 1 / 20

def generatedMass (y : YukawaCoupling) : MassScale :=
  higgsVacuumExpectation * y

def chargedLeptonMass (ℓ : ChargedLepton) : MassScale :=
  generatedMass (chargedLeptonYukawa ℓ)

def neutrinoMass (ν : NeutrinoFlavor) : MassScale :=
  generatedMass (neutrinoYukawa ν)

def upTypeMass (q : UpTypeQuark) : MassScale :=
  generatedMass (upTypeYukawa q)

def downTypeMass (q : DownTypeQuark) : MassScale :=
  generatedMass (downTypeYukawa q)

/-- Master bounded Yukawa/Higgs mass-generation shell. -/
abbrev YukawaMassGenerationClosureLaw : Prop :=
  0 < higgsVacuumExpectation ∧
    BosonPosition.demiurgeEnergy [.compile, .dispatch] > 0 ∧
    upYukawaBalance = 0 ∧
    downYukawaBalance = 0 ∧
    chargedLeptonYukawaBalance = 0 ∧
    (∀ ℓ, 0 < chargedLeptonYukawa ℓ) ∧
    (∀ q, 0 < upTypeYukawa q) ∧
    (∀ q, 0 < downTypeYukawa q) ∧
    (∀ ν, neutrinoYukawa ν = 0) ∧
    (∀ ℓ, chargedLeptonMass ℓ = higgsVacuumExpectation * chargedLeptonYukawa ℓ) ∧
    (∀ q, upTypeMass q = higgsVacuumExpectation * upTypeYukawa q) ∧
    (∀ q, downTypeMass q = higgsVacuumExpectation * downTypeYukawa q) ∧
    (∀ ν, neutrinoMass ν = 0) ∧
    (chargedLeptonMass .electron < chargedLeptonMass .muon ∧
      chargedLeptonMass .muon < chargedLeptonMass .tau) ∧
    (upTypeMass .up < upTypeMass .charm ∧
      upTypeMass .charm < upTypeMass .top) ∧
    (downTypeMass .down < downTypeMass .strange ∧
      downTypeMass .strange < downTypeMass .bottom)

theorem higgs_vacuum_expectation_positive :
    0 < higgsVacuumExpectation := by
  norm_num [higgsVacuumExpectation]

theorem demiurge_excited_shell_positive :
    BosonPosition.demiurgeEnergy [.compile, .dispatch] > 0 := by
  exact BosonPosition.demiurge_gives_mass

theorem up_yukawa_balance_zero :
    upYukawaBalance = 0 := by
  norm_num [upYukawaBalance, hypercharge, higgsHypercharge]

theorem down_yukawa_balance_zero :
    downYukawaBalance = 0 := by
  norm_num [downYukawaBalance, hypercharge, conjugateHiggsHypercharge]

theorem charged_lepton_yukawa_balance_zero :
    chargedLeptonYukawaBalance = 0 := by
  norm_num [chargedLeptonYukawaBalance, hypercharge, conjugateHiggsHypercharge]

theorem charged_lepton_yukawa_positive :
    ∀ ℓ, 0 < chargedLeptonYukawa ℓ := by
  intro ℓ
  cases ℓ <;> norm_num [chargedLeptonYukawa]

theorem up_type_yukawa_positive :
    ∀ q, 0 < upTypeYukawa q := by
  intro q
  cases q <;> norm_num [upTypeYukawa]

theorem down_type_yukawa_positive :
    ∀ q, 0 < downTypeYukawa q := by
  intro q
  cases q <;> norm_num [downTypeYukawa]

theorem neutrino_yukawa_zero :
    ∀ ν, neutrinoYukawa ν = 0 := by
  intro ν
  cases ν <;> rfl

theorem charged_lepton_mass_generated :
    ∀ ℓ, chargedLeptonMass ℓ = higgsVacuumExpectation * chargedLeptonYukawa ℓ := by
  intro ℓ
  cases ℓ <;> rfl

theorem up_type_mass_generated :
    ∀ q, upTypeMass q = higgsVacuumExpectation * upTypeYukawa q := by
  intro q
  cases q <;> rfl

theorem down_type_mass_generated :
    ∀ q, downTypeMass q = higgsVacuumExpectation * downTypeYukawa q := by
  intro q
  cases q <;> rfl

theorem neutrino_mass_zero :
    ∀ ν, neutrinoMass ν = 0 := by
  intro ν
  cases ν <;> norm_num [neutrinoMass, generatedMass, neutrinoYukawa,
    higgsVacuumExpectation]

theorem charged_lepton_mass_hierarchy :
    chargedLeptonMass .electron < chargedLeptonMass .muon ∧
      chargedLeptonMass .muon < chargedLeptonMass .tau := by
  norm_num [chargedLeptonMass, generatedMass, chargedLeptonYukawa,
    higgsVacuumExpectation]

theorem up_type_mass_hierarchy :
    upTypeMass .up < upTypeMass .charm ∧
      upTypeMass .charm < upTypeMass .top := by
  norm_num [upTypeMass, generatedMass, upTypeYukawa, higgsVacuumExpectation]

theorem down_type_mass_hierarchy :
    downTypeMass .down < downTypeMass .strange ∧
      downTypeMass .strange < downTypeMass .bottom := by
  norm_num [downTypeMass, generatedMass, downTypeYukawa, higgsVacuumExpectation]

theorem yukawa_mass_generation_closure :
    YukawaMassGenerationClosureLaw := by
  exact ⟨higgs_vacuum_expectation_positive,
    demiurge_excited_shell_positive,
    up_yukawa_balance_zero,
    down_yukawa_balance_zero,
    charged_lepton_yukawa_balance_zero,
    charged_lepton_yukawa_positive,
    up_type_yukawa_positive,
    down_type_yukawa_positive,
    neutrino_yukawa_zero,
    charged_lepton_mass_generated,
    up_type_mass_generated,
    down_type_mass_generated,
    neutrino_mass_zero,
    charged_lepton_mass_hierarchy,
    up_type_mass_hierarchy,
    down_type_mass_hierarchy⟩

end

end ForkRaceFoldTheorems
