import Mathlib
import ForkRaceFoldTheorems.BosonPosition
import ForkRaceFoldTheorems.BythosScale
import ForkRaceFoldTheorems.DimensionalConfinement
import ForkRaceFoldTheorems.MolecularTopology

namespace ForkRaceFoldTheorems

/-!
# Matter Explanation Closure

This module packages the current bounded explanation of matter out of the
already-mechanized pieces:

1. Ground state versus excited state in the Demiurge / fold surface.
2. The proton as the first confined `3`-cycle / `4D` matter rung.
3. The information-to-mass bridge: fold erasure produces positive heat and
   therefore positive mass-energy budget.
4. Gravitational backreaction: positive fold energy changes topology, while
   zero backreaction forces zero fold energy.

The result is still finite and qualitative. It explains why matter is present
and why the proton is the first confined matter rung, not the literal measured
numeric proton rest mass in MeV.
-/

/-- The current fold surface distinguishes massless ground state, positive
massive excitation, and the maximal empty constrained state. -/
theorem matter_has_massless_ground_and_positive_excited_cost :
    BosonPosition.demiurgeEnergy [.compile, .dispatch, .compress] = 0 ∧
      BosonPosition.demiurgeEnergy [.compile, .dispatch] > 0 ∧
      BosonPosition.demiurgeEnergy [] = 3 := by
  exact ⟨BosonPosition.demiurge_ground_state,
    BosonPosition.demiurge_gives_mass,
    BosonPosition.demiurge_maximum⟩

/-- The proton scale in `BythosScale.lean` matches the confined `3`-cycle /
`4D` Wallington rung in `DimensionalConfinement.lean`. -/
theorem proton_dimensional_rung_matches_confinement :
    BythosScale.proton_dim = DimensionalConfinement.wallingtonDimension 3 := by
  unfold BythosScale.proton_dim BythosScale.embeddingDim
    DimensionalConfinement.wallingtonDimension
  omega

/-- The current proton witness is the first confined matter rung: a `3`-cycle
tuple in `4D` with six directed emanations, placed above the Planck rung by the
named proton scale gap. -/
theorem proton_rung_is_confined_matter :
    DimensionalConfinement.wallingtonDimension 3 = 4 ∧
      DimensionalConfinement.quarks 3 = 3 ∧
      DimensionalConfinement.emanationCount 3 = 6 ∧
      BythosScale.planckScale < BythosScale.protonScale ∧
      BythosScale.protonScale - BythosScale.planckScale = 197 := by
  have hQuark := DimensionalConfinement.quark_tuple_is_4d
  exact ⟨hQuark.1,
    hQuark.2.1,
    hQuark.2.2,
    BythosScale.planck_smallest,
    BythosScale.proton_planck_gap⟩

/-- Positive fold erasure produces positive mass-energy, and the current
mass-energy budget is exactly linear in erased bits. -/
theorem positive_erasure_gives_positive_matter_budget
    (b : InformationMatterBridge) (h : 0 < b.bitsErased) :
    0 < b.totalHeat ∧
      b.totalHeat = b.bitsErased * b.heatPerBit := by
  exact ⟨positive_erasure_positive_heat b h, mass_is_congealed_erasure b⟩

/-- Positive fold energy backreacts on the topology: matter changes the space
it lives in on the current self-referential fold surface. -/
theorem positive_matter_backreacts_on_topology
    (g : SelfReferentialFold) (h : 0 < g.foldEnergy) :
    g.beta1_before ≠ g.beta1_after := by
  exact gravity_modifies_topology g h

/-- If there is no topological backreaction, then the current fold-energy
reading of matter is zero. -/
theorem no_topological_backreaction_means_zero_matter
    (g : SelfReferentialFold) (h : g.beta1_before = g.beta1_after) :
    g.foldEnergy = 0 := by
  exact flat_spacetime_unchanged g h

/-- Master closure for the current bounded explanation of matter: massless
ground, positive excited fold cost, proton confinement, positive erasure
budget, and topological backreaction from positive fold energy. -/
theorem matter_explanation_closure
    (b : InformationMatterBridge) (hb : 0 < b.bitsErased)
    (g : SelfReferentialFold) (hg : 0 < g.foldEnergy) :
    (BosonPosition.demiurgeEnergy [.compile, .dispatch, .compress] = 0 ∧
      BosonPosition.demiurgeEnergy [.compile, .dispatch] > 0 ∧
      BosonPosition.demiurgeEnergy [] = 3) ∧
      BythosScale.proton_dim = DimensionalConfinement.wallingtonDimension 3 ∧
      (DimensionalConfinement.wallingtonDimension 3 = 4 ∧
        DimensionalConfinement.quarks 3 = 3 ∧
        DimensionalConfinement.emanationCount 3 = 6 ∧
        BythosScale.planckScale < BythosScale.protonScale ∧
        BythosScale.protonScale - BythosScale.planckScale = 197) ∧
      (0 < b.totalHeat ∧
        b.totalHeat = b.bitsErased * b.heatPerBit) ∧
      g.beta1_before ≠ g.beta1_after := by
  exact ⟨matter_has_massless_ground_and_positive_excited_cost,
    proton_dimensional_rung_matches_confinement,
    proton_rung_is_confined_matter,
    positive_erasure_gives_positive_matter_budget b hb,
    positive_matter_backreacts_on_topology g hg⟩

end ForkRaceFoldTheorems
