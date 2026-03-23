import Mathlib
import ForkRaceFoldTheorems.ParticlesExist
import ForkRaceFoldTheorems.QuarkConfinement
import ForkRaceFoldTheorems.BosonPosition
import ForkRaceFoldTheorems.MatterExplanationClosure
import ForkRaceFoldTheorems.ProtonQuantizedUniqueness

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Particle Theory Core Closure

This module packages the strongest bounded particle-theory core currently
available in the repo:

1. constructive particle existence;
2. quark/proton confinement with six charged exchange channels;
3. the boson-sector shell (Barbelo/Sophia/Aletheia/Demiurge bookkeeping);
4. the proton as the confined `3`-cycle / `4D` matter rung;
5. the assumption-parameterized unique proton rest-mass witness.

The result is intentionally scoped. It is a bounded particle-theory core, not
yet a full Standard Model replacement: no fermion generations, electric-charge
assignment table, continuous coupling running, or scattering amplitudes are
derived here.
-/

/-- Persistent antiparallel structure gives a constructive particle witness. -/
theorem particle_existence_core :
    ∃ (_ : ParticlesExist.Particle), True := by
  exact ParticlesExist.particles_exist

/-- The current confinement core contains one colorless proton witness, an
energy gap to colored states, and six charged exchange channels. -/
theorem quark_confinement_core :
    QuarkConfinement.isColorless QuarkConfinement.proton = true ∧
      QuarkConfinement.energy QuarkConfinement.proton = 0 ∧
      QuarkConfinement.energy ⟨.red, .red, .red⟩ = 1 ∧
      QuarkConfinement.energy QuarkConfinement.proton <
        QuarkConfinement.energy ⟨.red, .green, .red⟩ ∧
      (QuarkConfinement.logos.color ≠ QuarkConfinement.logos.anticolor ∧
        QuarkConfinement.epinoia.color ≠ QuarkConfinement.epinoia.anticolor ∧
        QuarkConfinement.pronoia.color ≠ QuarkConfinement.pronoia.anticolor ∧
        QuarkConfinement.metanoia.color ≠ QuarkConfinement.metanoia.anticolor ∧
        QuarkConfinement.pneuma.color ≠ QuarkConfinement.pneuma.anticolor ∧
        QuarkConfinement.gnosis.color ≠ QuarkConfinement.gnosis.anticolor) := by
  exact ⟨QuarkConfinement.proton_is_colorless,
    QuarkConfinement.colorless_ground,
    QuarkConfinement.colored_excited,
    QuarkConfinement.removal_costs_energy,
    QuarkConfinement.six_emanations_exist⟩

/-- The current boson shell closes the massless full pipeline, positive excited
cost, gauge invariance, vacuum sliver, and Bose-statistics witness. -/
theorem boson_sector_core :
    BosonPosition.demiurgeEnergy [.compile, .dispatch, .compress] = 0 ∧
      BosonPosition.demiurgeEnergy [.compile, .dispatch] > 0 ∧
      BosonPosition.demiurgeEnergy [.compile, .dispatch, .compress] =
        BosonPosition.demiurgeEnergy [.dispatch, .compress, .compile] ∧
      (BosonPosition.barbelo 3).weights ⟨0, by omega⟩ ≥ 1 ∧
      (∃ p : BosonPosition.Pleroma 6, p.occupation ⟨0, by omega⟩ = 42) := by
  exact BosonPosition.complete_boson_prediction

/-- The proton remains the first confined matter rung on the current dimension
ladder: `3` cycles, `4D`, six emanations, and the named Planck-to-proton gap. -/
theorem proton_matter_core :
    BythosScale.proton_dim = DimensionalConfinement.wallingtonDimension 3 ∧
      (DimensionalConfinement.wallingtonDimension 3 = 4 ∧
        DimensionalConfinement.quarks 3 = 3 ∧
        DimensionalConfinement.emanationCount 3 = 6 ∧
        BythosScale.planckScale < BythosScale.protonScale ∧
        BythosScale.protonScale - BythosScale.planckScale = 197) := by
  exact ⟨proton_dimensional_rung_matches_confinement,
    proton_rung_is_confined_matter⟩

/-- The strongest current proton-mass closure is now the explicit quantized
uniqueness shell. -/
theorem proton_mass_uniqueness_core :
    ProtonQuantizedUniquenessAxioms calibratedProtonCalibration ∧
      (∀ c : ProtonCalibration,
        ProtonQuantizedUniquenessAxioms c →
          c = calibratedProtonCalibration) ∧
      ¬ ProtonQuantizedUniquenessAxioms alternativeResidualSplitCalibration ∧
      ¬ ProtonQuantizedUniquenessAxioms alternativeConfinementCalibration := by
  exact proton_quantized_uniqueness_closure

/-- Master closure for the current bounded particle-theory core. -/
theorem particle_theory_core_closure :
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
        ¬ ProtonQuantizedUniquenessAxioms alternativeConfinementCalibration) := by
  exact ⟨particle_existence_core,
    quark_confinement_core,
    boson_sector_core,
    proton_matter_core,
    proton_mass_uniqueness_core⟩

end

end ForkRaceFoldTheorems
