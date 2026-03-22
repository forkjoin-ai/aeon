import ForkRaceFoldTheorems.CelestialPlanetTaxonomy

/-!
# Celestial Off-By-One Taxonomy

This module pushes the celestial surface down to the compact lower end.
The guiding rule is the existing off-by-one law

  `wallingtonDimension stages = stages + 1`.

So the one-cycle floor (`β₁ = 1`) is ambient `2D`, while the two-cycle
compact rocky case (`β₁ = 2`) is ambient `3D`. This gives a clean split
between photon-like emanation objects and compact non-gas rocky objects.
-/

namespace ForkRaceFoldTheorems

/-- Compact rocky worlds are low-dimensional, halo-free, and at most
balanced rather than ring-dominant. -/
def compactRockyPlanet (shadow : CelestialShadow) : Prop :=
  shadow.dimension = 3 ∧ shadow.haloChannels = 0 ∧ starLike shadow

/-- A minimal photon-like shadow: zero visible channel budget on the
ambient `2D` floor. -/
def photonLikeShadow : CelestialShadow where
  dimension := 2
  radialChannels := 0
  equatorialChannels := 0
  haloChannels := 0
  channelBudget := by
    unfold DimensionalConfinement.channelSurfaceFromDimension
      DimensionalConfinement.emanationCount
    omega

/-- A minimal Earth-like rocky witness: two-cycle/three-dimensional,
balanced, and halo-free. -/
def earthLikeRockyShadow : CelestialShadow where
  dimension := 3
  radialChannels := 1
  equatorialChannels := 1
  haloChannels := 0
  channelBudget := by
    unfold DimensionalConfinement.channelSurfaceFromDimension
      DimensionalConfinement.emanationCount
    omega

theorem photon_cycle_is_off_by_one :
    DimensionalConfinement.torusBetti1 1 = 1 ∧
      DimensionalConfinement.wallingtonDimension 1 = 2 := by
  exact ⟨rfl, rfl⟩

theorem rocky_cycle_is_off_by_one :
    DimensionalConfinement.torusBetti1 2 = 2 ∧
      DimensionalConfinement.wallingtonDimension 2 = 3 := by
  exact ⟨rfl, DimensionalConfinement.two_stage_is_3d⟩

theorem photon_like_shadow_has_zero_budget :
    visibleBudget photonLikeShadow = 0 := by
  unfold visibleBudget photonLikeShadow
  native_decide

theorem earth_like_rocky_shadow_is_compact :
    compactRockyPlanet earthLikeRockyShadow := by
  refine ⟨rfl, rfl, ?_⟩
  unfold starLike earthLikeRockyShadow
  native_decide

theorem earth_like_rocky_shadow_not_saturn_like :
    ¬ saturnLike earthLikeRockyShadow := by
  exact zero_halo_not_saturn_like earthLikeRockyShadow rfl

theorem earth_like_rocky_shadow_location_window :
    orbitalLowerBound earthLikeRockyShadow = 0 ∧
      orbitalUpperBound earthLikeRockyShadow = 1 := by
  unfold orbitalLowerBound orbitalUpperBound orbitalGain orbitalControl
    ringDominanceMargin earthLikeRockyShadow
  native_decide

theorem photon_floor_sits_below_rocky_floor :
    photonLikeShadow.dimension + 1 = earthLikeRockyShadow.dimension := by
  native_decide

theorem compact_rocky_sits_below_ring_taxa :
    orbitalUpperBound earthLikeRockyShadow <
        orbitalLowerBound fiftyFourDDiffuseRingShadow := by
  unfold orbitalUpperBound orbitalLowerBound orbitalGain orbitalControl
    ringDominanceMargin earthLikeRockyShadow fiftyFourDDiffuseRingShadow
  native_decide

theorem lower_dimensional_non_gas_types_exist :
    ∃ photon rocky : CelestialShadow,
      photon.dimension = 2 ∧
      visibleBudget photon = 0 ∧
      rocky.dimension = 3 ∧
      compactRockyPlanet rocky ∧
      ¬ saturnLike rocky := by
  exact ⟨photonLikeShadow, earthLikeRockyShadow, rfl,
    photon_like_shadow_has_zero_budget, rfl,
    earth_like_rocky_shadow_is_compact,
    earth_like_rocky_shadow_not_saturn_like⟩

end ForkRaceFoldTheorems
