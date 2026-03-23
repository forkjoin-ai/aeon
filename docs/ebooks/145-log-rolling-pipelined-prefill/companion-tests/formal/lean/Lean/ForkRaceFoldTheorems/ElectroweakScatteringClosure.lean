import Mathlib
import ForkRaceFoldTheorems.RunningCouplingClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Electroweak Scattering Closure

This module adds the smallest honest scattering shell on top of the bounded
flavor and running-coupling layers. The current package certifies exact
conservation laws and current-type bookkeeping for named electroweak-style
channels; it does not claim amplitudes or cross sections.
-/

inductive CurrentType where
  | charged
  | neutral
  deriving DecidableEq, Repr

structure ScatteringChannel where
  incomingChargeThirds : Int
  outgoingChargeThirds : Int
  incomingBaryon : Int
  outgoingBaryon : Int
  incomingLepton : Int
  outgoingLepton : Int
  mediatorStrength : Rat
  current : CurrentType
  flavorChanged : Bool

def chargeConserved (c : ScatteringChannel) : Prop :=
  c.incomingChargeThirds = c.outgoingChargeThirds

def baryonConserved (c : ScatteringChannel) : Prop :=
  c.incomingBaryon = c.outgoingBaryon

def leptonConserved (c : ScatteringChannel) : Prop :=
  c.incomingLepton = c.outgoingLepton

def betaDecayChannel : ScatteringChannel where
  incomingChargeThirds := 0
  outgoingChargeThirds := 0
  incomingBaryon := 1
  outgoingBaryon := 1
  incomingLepton := 0
  outgoingLepton := 0
  mediatorStrength := weakLikeCoupling .electroweak
  current := .charged
  flavorChanged := true

def neutrinoElectronNeutralChannel : ScatteringChannel where
  incomingChargeThirds := -3
  outgoingChargeThirds := -3
  incomingBaryon := 0
  outgoingBaryon := 0
  incomingLepton := 2
  outgoingLepton := 2
  mediatorStrength := weakLikeCoupling .electroweak
  current := .neutral
  flavorChanged := false

def protonElectronElasticChannel : ScatteringChannel where
  incomingChargeThirds := 0
  outgoingChargeThirds := 0
  incomingBaryon := 1
  outgoingBaryon := 1
  incomingLepton := 1
  outgoingLepton := 1
  mediatorStrength := electromagneticLikeCoupling .electroweak
  current := .neutral
  flavorChanged := false

/-- Master bounded electroweak scattering closure law. -/
abbrev ElectroweakScatteringClosureLaw : Prop :=
  chargeConserved betaDecayChannel ∧
    baryonConserved betaDecayChannel ∧
    leptonConserved betaDecayChannel ∧
    chargeConserved neutrinoElectronNeutralChannel ∧
    baryonConserved neutrinoElectronNeutralChannel ∧
    leptonConserved neutrinoElectronNeutralChannel ∧
    chargeConserved protonElectronElasticChannel ∧
    baryonConserved protonElectronElasticChannel ∧
    leptonConserved protonElectronElasticChannel ∧
    betaDecayChannel.current = .charged ∧
    betaDecayChannel.flavorChanged = true ∧
    neutrinoElectronNeutralChannel.current = .neutral ∧
    neutrinoElectronNeutralChannel.flavorChanged = false ∧
    protonElectronElasticChannel.current = .neutral ∧
    protonElectronElasticChannel.flavorChanged = false ∧
    betaDecayChannel.mediatorStrength = weakLikeCoupling .electroweak ∧
    neutrinoElectronNeutralChannel.mediatorStrength = weakLikeCoupling .electroweak ∧
    protonElectronElasticChannel.mediatorStrength = electromagneticLikeCoupling .electroweak ∧
    betaDecayChannel.mediatorStrength > protonElectronElasticChannel.mediatorStrength

theorem betaDecayChannel_conserves_charge : chargeConserved betaDecayChannel := by
  rfl

theorem betaDecayChannel_conserves_baryon : baryonConserved betaDecayChannel := by
  rfl

theorem betaDecayChannel_conserves_lepton : leptonConserved betaDecayChannel := by
  rfl

theorem neutrinoElectronNeutralChannel_conserves_charge :
    chargeConserved neutrinoElectronNeutralChannel := by
  rfl

theorem neutrinoElectronNeutralChannel_conserves_baryon :
    baryonConserved neutrinoElectronNeutralChannel := by
  rfl

theorem neutrinoElectronNeutralChannel_conserves_lepton :
    leptonConserved neutrinoElectronNeutralChannel := by
  rfl

theorem protonElectronElasticChannel_conserves_charge :
    chargeConserved protonElectronElasticChannel := by
  rfl

theorem protonElectronElasticChannel_conserves_baryon :
    baryonConserved protonElectronElasticChannel := by
  rfl

theorem protonElectronElasticChannel_conserves_lepton :
    leptonConserved protonElectronElasticChannel := by
  rfl

theorem charged_current_changes_flavor :
    betaDecayChannel.current = .charged ∧
      betaDecayChannel.flavorChanged = true := by
  exact ⟨rfl, rfl⟩

theorem neutral_currents_preserve_flavor :
    neutrinoElectronNeutralChannel.current = .neutral ∧
      neutrinoElectronNeutralChannel.flavorChanged = false ∧
      protonElectronElasticChannel.current = .neutral ∧
      protonElectronElasticChannel.flavorChanged = false := by
  exact ⟨rfl, rfl, rfl, rfl⟩

theorem electroweak_mediator_assignment :
    betaDecayChannel.mediatorStrength = weakLikeCoupling .electroweak ∧
      neutrinoElectronNeutralChannel.mediatorStrength = weakLikeCoupling .electroweak ∧
      protonElectronElasticChannel.mediatorStrength =
        electromagneticLikeCoupling .electroweak := by
  exact ⟨rfl, rfl, rfl⟩

theorem weak_like_scattering_dominates_electromagnetic_like_at_electroweak :
    betaDecayChannel.mediatorStrength > protonElectronElasticChannel.mediatorStrength := by
  norm_num [betaDecayChannel, protonElectronElasticChannel,
    weakLikeCoupling, electromagneticLikeCoupling]

theorem electroweak_scattering_closure : ElectroweakScatteringClosureLaw := by
  exact ⟨betaDecayChannel_conserves_charge,
    betaDecayChannel_conserves_baryon,
    betaDecayChannel_conserves_lepton,
    neutrinoElectronNeutralChannel_conserves_charge,
    neutrinoElectronNeutralChannel_conserves_baryon,
    neutrinoElectronNeutralChannel_conserves_lepton,
    protonElectronElasticChannel_conserves_charge,
    protonElectronElasticChannel_conserves_baryon,
    protonElectronElasticChannel_conserves_lepton,
    rfl,
    rfl,
    rfl,
    rfl,
    rfl,
    rfl,
    rfl,
    rfl,
    rfl,
    weak_like_scattering_dominates_electromagnetic_like_at_electroweak⟩

end

end ForkRaceFoldTheorems
