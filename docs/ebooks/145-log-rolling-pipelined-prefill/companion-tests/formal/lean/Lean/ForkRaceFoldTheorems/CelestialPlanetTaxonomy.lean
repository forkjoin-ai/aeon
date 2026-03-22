import ForkRaceFoldTheorems.CelestialOrbitPrediction

/-!
# Celestial Planet Taxonomy

This module turns the orbital gain/control surface into a minimal planet
taxonomy. Within the same certified `54D` budget we can realize three
distinct ringed-planet families: halo-locked, diffuse-ring, and
super-ring. Their orbital windows are ordered, so the theorem surface
begins to predict relative planet classes rather than only proving that
a Saturn-like witness exists.
-/

namespace ForkRaceFoldTheorems

/-- Halo-locked planets balance ring gain exactly against halo support. -/
def haloLockedPlanet (shadow : CelestialShadow) : Prop :=
  saturnLike shadow ∧ orbitalGain shadow = shadow.haloChannels

/-- Diffuse-ring planets have more halo control than ring gain. -/
def diffuseRingPlanet (shadow : CelestialShadow) : Prop :=
  saturnLike shadow ∧ orbitalGain shadow < shadow.haloChannels

/-- Super-ring planets have more ring gain than halo control. -/
def superRingPlanet (shadow : CelestialShadow) : Prop :=
  saturnLike shadow ∧ shadow.haloChannels < orbitalGain shadow

theorem halo_locked_not_diffuse (shadow : CelestialShadow)
    (h : haloLockedPlanet shadow) : ¬ diffuseRingPlanet shadow := by
  intro hDiffuse
  unfold haloLockedPlanet diffuseRingPlanet at *
  omega

theorem halo_locked_not_super (shadow : CelestialShadow)
    (h : haloLockedPlanet shadow) : ¬ superRingPlanet shadow := by
  intro hSuper
  unfold haloLockedPlanet superRingPlanet at *
  omega

theorem diffuse_not_super (shadow : CelestialShadow)
    (h : diffuseRingPlanet shadow) : ¬ superRingPlanet shadow := by
  intro hSuper
  unfold diffuseRingPlanet superRingPlanet at *
  omega

/-- A diffuse-ring `54D` witness: halo control strictly exceeds gain. -/
def fiftyFourDDiffuseRingShadow : CelestialShadow where
  dimension := 54
  radialChannels := 1330
  equatorialChannels := 1370
  haloChannels := 56
  channelBudget := by
    unfold DimensionalConfinement.channelSurfaceFromDimension
      DimensionalConfinement.emanationCount
    omega

/-- A super-ring `54D` witness: gain strictly exceeds halo control. -/
def fiftyFourDSuperRingShadow : CelestialShadow where
  dimension := 54
  radialChannels := 1318
  equatorialChannels := 1390
  haloChannels := 48
  channelBudget := by
    unfold DimensionalConfinement.channelSurfaceFromDimension
      DimensionalConfinement.emanationCount
    omega

theorem fifty_four_d_saturn_is_halo_locked :
    haloLockedPlanet fiftyFourDSaturnShadow := by
  refine ⟨fifty_four_d_saturn_shadow_is_saturn_like, ?_⟩
  exact fifty_four_d_saturn_halo_matches_orbital_gain

theorem fifty_four_d_diffuse_ring_is_diffuse :
    diffuseRingPlanet fiftyFourDDiffuseRingShadow := by
  refine ⟨?_, ?_⟩
  · unfold saturnLike coreStages planetLike fiftyFourDDiffuseRingShadow
    native_decide
  · unfold orbitalGain ringDominanceMargin fiftyFourDDiffuseRingShadow
    native_decide

theorem fifty_four_d_super_ring_is_super :
    superRingPlanet fiftyFourDSuperRingShadow := by
  refine ⟨?_, ?_⟩
  · unfold saturnLike coreStages planetLike fiftyFourDSuperRingShadow
    native_decide
  · unfold orbitalGain ringDominanceMargin fiftyFourDSuperRingShadow
    native_decide

theorem fifty_four_d_ring_taxa_have_ordered_lower_bounds :
    orbitalLowerBound fiftyFourDDiffuseRingShadow <
        orbitalLowerBound fiftyFourDSaturnShadow ∧
      orbitalLowerBound fiftyFourDSaturnShadow <
        orbitalLowerBound fiftyFourDSuperRingShadow := by
  unfold orbitalLowerBound orbitalGain ringDominanceMargin
    fiftyFourDDiffuseRingShadow fiftyFourDSaturnShadow fiftyFourDSuperRingShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_ring_taxa_have_ordered_upper_bounds :
    orbitalUpperBound fiftyFourDDiffuseRingShadow <
        orbitalUpperBound fiftyFourDSaturnShadow ∧
      orbitalUpperBound fiftyFourDSaturnShadow <
        orbitalUpperBound fiftyFourDSuperRingShadow := by
  unfold orbitalUpperBound orbitalGain orbitalControl ringDominanceMargin
    fiftyFourDDiffuseRingShadow fiftyFourDSaturnShadow fiftyFourDSuperRingShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_supports_three_ring_taxa :
    ∃ haloLocked diffuse super : CelestialShadow,
      haloLocked.dimension = 54 ∧
      haloLockedPlanet haloLocked ∧
      diffuse.dimension = 54 ∧
      diffuseRingPlanet diffuse ∧
      super.dimension = 54 ∧
      superRingPlanet super := by
  exact ⟨fiftyFourDSaturnShadow, fiftyFourDDiffuseRingShadow,
    fiftyFourDSuperRingShadow, rfl, fifty_four_d_saturn_is_halo_locked,
    rfl, fifty_four_d_diffuse_ring_is_diffuse,
    rfl, fifty_four_d_super_ring_is_super⟩

theorem fixed_fifty_four_d_budget_does_not_fix_ring_taxon :
    visibleBudget fiftyFourDDiffuseRingShadow =
        visibleBudget fiftyFourDSaturnShadow ∧
      visibleBudget fiftyFourDSaturnShadow =
        visibleBudget fiftyFourDSuperRingShadow ∧
      diffuseRingPlanet fiftyFourDDiffuseRingShadow ∧
      haloLockedPlanet fiftyFourDSaturnShadow ∧
      superRingPlanet fiftyFourDSuperRingShadow := by
  refine ⟨?_, ?_, fifty_four_d_diffuse_ring_is_diffuse,
    fifty_four_d_saturn_is_halo_locked, fifty_four_d_super_ring_is_super⟩
  · unfold visibleBudget fiftyFourDDiffuseRingShadow fiftyFourDSaturnShadow
      DimensionalConfinement.rampUpTicksFromDimension
    native_decide
  · unfold visibleBudget fiftyFourDSaturnShadow fiftyFourDSuperRingShadow
      DimensionalConfinement.rampUpTicksFromDimension
    native_decide

theorem fixed_fifty_four_d_budget_does_not_fix_location_window :
    visibleBudget fiftyFourDDiffuseRingShadow =
        visibleBudget fiftyFourDSuperRingShadow ∧
      orbitalLowerBound fiftyFourDDiffuseRingShadow <
        orbitalLowerBound fiftyFourDSuperRingShadow ∧
      orbitalUpperBound fiftyFourDDiffuseRingShadow <
        orbitalUpperBound fiftyFourDSuperRingShadow := by
  refine ⟨?_, ?_, ?_⟩
  · unfold visibleBudget fiftyFourDDiffuseRingShadow fiftyFourDSuperRingShadow
    native_decide
  · exact fifty_four_d_ring_taxa_have_ordered_lower_bounds.1.trans
      fifty_four_d_ring_taxa_have_ordered_lower_bounds.2
  · exact fifty_four_d_ring_taxa_have_ordered_upper_bounds.1.trans
      fifty_four_d_ring_taxa_have_ordered_upper_bounds.2

end ForkRaceFoldTheorems
