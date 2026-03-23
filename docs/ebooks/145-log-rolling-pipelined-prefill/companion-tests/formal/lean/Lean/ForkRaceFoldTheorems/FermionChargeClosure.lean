import Mathlib
import ForkRaceFoldTheorems.ParticleTheoryCoreClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Fermion Charge Closure

This module adds the next bounded particle-facing layer on top of
`ParticleTheoryCoreClosure.lean`.

The goal is not to claim a full Standard Model derivation. The goal is to
package the smallest honest fermion/charge shell that the current repo can
carry explicitly:

1. exactly three named generations;
2. one charged lepton and one neutrino flavor per generation;
3. one up-type and one down-type quark per generation;
4. standard fractional electric-charge bookkeeping in thirds;
5. proton/neutron charge reconstruction;
6. beta-decay charge conservation.

This is a bounded bookkeeping shell. It does not derive Yukawa couplings,
mixing matrices, anomaly cancellation, or scattering amplitudes.
-/

/-- The three named generations. -/
inductive Generation where
  | first
  | second
  | third
  deriving DecidableEq, Repr, Fintype

/-- Charged leptons. -/
inductive ChargedLepton where
  | electron
  | muon
  | tau
  deriving DecidableEq, Repr, Fintype

/-- Neutrino flavors. -/
inductive NeutrinoFlavor where
  | electron
  | muon
  | tau
  deriving DecidableEq, Repr, Fintype

/-- Up-type quarks. -/
inductive UpTypeQuark where
  | up
  | charm
  | top
  deriving DecidableEq, Repr, Fintype

/-- Down-type quarks. -/
inductive DownTypeQuark where
  | down
  | strange
  | bottom
  deriving DecidableEq, Repr, Fintype

/-- Generation assignment for charged leptons. -/
def chargedLeptonGeneration : ChargedLepton → Generation
  | .electron => .first
  | .muon => .second
  | .tau => .third

/-- Generation assignment for neutrino flavors. -/
def neutrinoGeneration : NeutrinoFlavor → Generation
  | .electron => .first
  | .muon => .second
  | .tau => .third

/-- Generation assignment for up-type quarks. -/
def upTypeGeneration : UpTypeQuark → Generation
  | .up => .first
  | .charm => .second
  | .top => .third

/-- Generation assignment for down-type quarks. -/
def downTypeGeneration : DownTypeQuark → Generation
  | .down => .first
  | .strange => .second
  | .bottom => .third

/-- Electric charge in thirds of the elementary charge. -/
def chargedLeptonChargeThirds : ChargedLepton → Int := fun _ => -3
def neutrinoChargeThirds : NeutrinoFlavor → Int := fun _ => 0
def upTypeChargeThirds : UpTypeQuark → Int := fun _ => 2
def downTypeChargeThirds : DownTypeQuark → Int := fun _ => -1

/-- The bounded lepton-generation correspondence. -/
abbrev LeptonGenerationLaw : Prop :=
  chargedLeptonGeneration .electron = .first ∧
    chargedLeptonGeneration .muon = .second ∧
    chargedLeptonGeneration .tau = .third ∧
    neutrinoGeneration .electron = .first ∧
    neutrinoGeneration .muon = .second ∧
    neutrinoGeneration .tau = .third

/-- The bounded quark-generation correspondence. -/
abbrev QuarkGenerationLaw : Prop :=
  upTypeGeneration .up = .first ∧
    upTypeGeneration .charm = .second ∧
    upTypeGeneration .top = .third ∧
    downTypeGeneration .down = .first ∧
    downTypeGeneration .strange = .second ∧
    downTypeGeneration .bottom = .third

/-- The bounded electric-charge bookkeeping shell. -/
abbrev FermionChargeLaw : Prop :=
  chargedLeptonChargeThirds .electron = -3 ∧
    chargedLeptonChargeThirds .muon = -3 ∧
    chargedLeptonChargeThirds .tau = -3 ∧
    neutrinoChargeThirds .electron = 0 ∧
    neutrinoChargeThirds .muon = 0 ∧
    neutrinoChargeThirds .tau = 0 ∧
    upTypeChargeThirds .up = 2 ∧
    upTypeChargeThirds .charm = 2 ∧
    upTypeChargeThirds .top = 2 ∧
    downTypeChargeThirds .down = -1 ∧
    downTypeChargeThirds .strange = -1 ∧
    downTypeChargeThirds .bottom = -1

/-- Proton charge reconstruction law. -/
abbrev ProtonChargeLaw : Prop :=
  upTypeChargeThirds .up + upTypeChargeThirds .up +
    downTypeChargeThirds .down = 3

/-- Neutron charge reconstruction law. -/
abbrev NeutronChargeLaw : Prop :=
  upTypeChargeThirds .up + downTypeChargeThirds .down +
    downTypeChargeThirds .down = 0

/-- Beta-decay charge conservation law. -/
abbrev BetaDecayChargeLaw : Prop :=
  (upTypeChargeThirds .up + downTypeChargeThirds .down +
      downTypeChargeThirds .down) =
    (upTypeChargeThirds .up + upTypeChargeThirds .up +
        downTypeChargeThirds .down) +
      chargedLeptonChargeThirds .electron +
      0

/-- Imported bounded particle-theory core law packaged as a proposition alias
for reuse in larger closures. -/
abbrev ParticleTheoryCoreLaw : Prop :=
  (∃ (_ : ParticlesExist.Particle), True) ∧
    (QuarkConfinement.isColorless QuarkConfinement.proton = true ∧
      QuarkConfinement.energy QuarkConfinement.proton = 0 ∧
      QuarkConfinement.energy ⟨.red, .red, .red⟩ = 1 ∧
      QuarkConfinement.energy QuarkConfinement.proton <
        QuarkConfinement.energy ⟨.red, .green, .red⟩ ∧
      (QuarkConfinement.logos.color ≠ QuarkConfinement.logos.anticolor ∧
        QuarkConfinement.epinoia.color ≠ QuarkConfinement.epinoia.anticolor ∧
        QuarkConfinement.pronoia.color ≠ QuarkConfinement.pronoia.anticolor ∧
        QuarkConfinement.metanoia.color ≠ QuarkConfinement.metanoia.anticolor ∧
        QuarkConfinement.pneuma.color ≠ QuarkConfinement.pneuma.anticolor ∧
        QuarkConfinement.gnosis.color ≠ QuarkConfinement.gnosis.anticolor)) ∧
    (BosonPosition.demiurgeEnergy [.compile, .dispatch, .compress] = 0 ∧
      BosonPosition.demiurgeEnergy [.compile, .dispatch] > 0 ∧
      BosonPosition.demiurgeEnergy [.compile, .dispatch, .compress] =
        BosonPosition.demiurgeEnergy [.dispatch, .compress, .compile] ∧
      (BosonPosition.barbelo 3).weights ⟨0, by omega⟩ ≥ 1 ∧
      (∃ p : BosonPosition.Pleroma 6, p.occupation ⟨0, by omega⟩ = 42)) ∧
    (BythosScale.proton_dim = DimensionalConfinement.wallingtonDimension 3 ∧
      (DimensionalConfinement.wallingtonDimension 3 = 4 ∧
        DimensionalConfinement.quarks 3 = 3 ∧
        DimensionalConfinement.emanationCount 3 = 6 ∧
        BythosScale.planckScale < BythosScale.protonScale ∧
        BythosScale.protonScale - BythosScale.planckScale = 197)) ∧
    (ProtonQuantizedUniquenessAxioms calibratedProtonCalibration ∧
      (∀ c : ProtonCalibration,
        ProtonQuantizedUniquenessAxioms c →
          c = calibratedProtonCalibration) ∧
      ¬ ProtonQuantizedUniquenessAxioms alternativeResidualSplitCalibration ∧
      ¬ ProtonQuantizedUniquenessAxioms alternativeConfinementCalibration)

/-- Master bounded fermion/charge closure law. -/
abbrev FermionChargeClosureLaw : Prop :=
  Fintype.card Generation = 3 ∧
    LeptonGenerationLaw ∧
    QuarkGenerationLaw ∧
    FermionChargeLaw ∧
    ProtonChargeLaw ∧
    NeutronChargeLaw ∧
    BetaDecayChargeLaw ∧
    ParticleTheoryCoreLaw

/-- There are exactly three generations. -/
theorem generation_count_is_three :
    Fintype.card Generation = 3 := by
  native_decide

/-- The lepton shell gives one charged lepton and one neutrino per generation. -/
theorem lepton_generation_shell : LeptonGenerationLaw := by
  decide

/-- The quark shell gives one up-type and one down-type quark per generation. -/
theorem quark_generation_shell : QuarkGenerationLaw := by
  decide

/-- Standard fractional charge bookkeeping closes on the bounded fermion shell. -/
theorem fermion_charge_shell : FermionChargeLaw := by
  decide

/-- The proton charge is recovered as `uud = +1`. -/
theorem proton_charge_reconstructed : ProtonChargeLaw := by
  unfold ProtonChargeLaw
  norm_num [upTypeChargeThirds, downTypeChargeThirds]

/-- The neutron charge is recovered as `udd = 0`. -/
theorem neutron_charge_reconstructed : NeutronChargeLaw := by
  unfold NeutronChargeLaw
  norm_num [upTypeChargeThirds, downTypeChargeThirds]

/-- Beta decay conserves electric charge:
`n -> p + e^- + anti-ν_e`. -/
theorem beta_decay_charge_conserved : BetaDecayChargeLaw := by
  unfold BetaDecayChargeLaw
  norm_num [upTypeChargeThirds, downTypeChargeThirds,
    chargedLeptonChargeThirds]

/-- Master closure for the current bounded fermion/charge shell. -/
theorem fermion_charge_closure : FermionChargeClosureLaw := by
  exact ⟨generation_count_is_three,
    lepton_generation_shell,
    quark_generation_shell,
    fermion_charge_shell,
    proton_charge_reconstructed,
    neutron_charge_reconstructed,
    beta_decay_charge_conserved,
    particle_theory_core_closure⟩

end

end ForkRaceFoldTheorems
