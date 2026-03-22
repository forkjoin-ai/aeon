import ForkRaceFoldTheorems.CelestialShadows

/-!
# Astrophysical Projection

This module upgrades the witness-level celestial shadow surface to a
general projection calculus. Theorems are stated with explicit radial
versus equatorial dominance assumptions, and the anti-theorem surface
makes the non-uniqueness boundary honest: a fixed channel budget does
not determine a unique visible morphology.
-/

namespace ForkRaceFoldTheorems

/-- Visible budget carried by a concrete shadow partition. -/
def visibleBudget (shadow : CelestialShadow) : Nat :=
  shadow.radialChannels + shadow.equatorialChannels + shadow.haloChannels

/-- Signed morphology bias: positive means equatorial/ring dominant,
negative means radial/stellar dominant. -/
def signedMorphologyBias (shadow : CelestialShadow) : Int :=
  Int.ofNat shadow.equatorialChannels - Int.ofNat shadow.radialChannels

/-- Swap the radial and equatorial partitions while preserving the
dimension and halo bookkeeping. -/
def swapProjection (shadow : CelestialShadow) : CelestialShadow where
  dimension := shadow.dimension
  radialChannels := shadow.equatorialChannels
  equatorialChannels := shadow.radialChannels
  haloChannels := shadow.haloChannels
  channelBudget := by
    simpa [Nat.add_assoc, Nat.add_left_comm, Nat.add_comm] using shadow.channelBudget

theorem visible_budget_eq_channel_surface (shadow : CelestialShadow) :
    visibleBudget shadow =
      DimensionalConfinement.channelSurfaceFromDimension shadow.dimension := by
  exact shadow.channelBudget

theorem radial_dominance_gives_star_like (shadow : CelestialShadow)
    (h : shadow.equatorialChannels ≤ shadow.radialChannels) :
    starLike shadow := h

theorem equatorial_dominance_gives_planet_like (shadow : CelestialShadow)
    (h : shadow.radialChannels < shadow.equatorialChannels) :
    planetLike shadow := h

theorem positive_core_halo_equatorial_dominance_gives_saturn_like
    (shadow : CelestialShadow)
    (hcore : 0 < coreStages shadow)
    (hhalo : 0 < shadow.haloChannels)
    (hdom : shadow.radialChannels < shadow.equatorialChannels) :
    saturnLike shadow := by
  exact ⟨hcore, hhalo, hdom⟩

theorem saturn_like_implies_planet_like (shadow : CelestialShadow)
    (h : saturnLike shadow) : planetLike shadow := by
  exact h.2.2

theorem saturn_like_not_star_like (shadow : CelestialShadow)
    (h : saturnLike shadow) : ¬ starLike shadow := by
  exact planet_like_not_star_like shadow (saturn_like_implies_planet_like shadow h)

theorem zero_halo_not_saturn_like (shadow : CelestialShadow)
    (hhalo : shadow.haloChannels = 0) : ¬ saturnLike shadow := by
  intro hsat
  have : 0 < shadow.haloChannels := hsat.2.1
  omega

theorem equal_radial_equatorial_not_planet_like (shadow : CelestialShadow)
    (heq : shadow.radialChannels = shadow.equatorialChannels) :
    ¬ planetLike shadow := by
  unfold planetLike
  omega

theorem equal_radial_equatorial_not_saturn_like (shadow : CelestialShadow)
    (heq : shadow.radialChannels = shadow.equatorialChannels) :
    ¬ saturnLike shadow := by
  intro hsat
  exact equal_radial_equatorial_not_planet_like shadow heq hsat.2.2

theorem swap_projection_preserves_dimension (shadow : CelestialShadow) :
    (swapProjection shadow).dimension = shadow.dimension := by
  rfl

theorem swap_projection_preserves_halo (shadow : CelestialShadow) :
    (swapProjection shadow).haloChannels = shadow.haloChannels := by
  rfl

theorem swap_projection_preserves_visible_budget (shadow : CelestialShadow) :
    visibleBudget (swapProjection shadow) = visibleBudget shadow := by
  simp [visibleBudget, swapProjection, Nat.add_left_comm, Nat.add_comm]

theorem swap_projection_involutive (shadow : CelestialShadow) :
    swapProjection (swapProjection shadow) = shadow := by
  cases shadow
  simp [swapProjection]

theorem swap_of_planet_like_is_star_like (shadow : CelestialShadow)
    (h : planetLike shadow) : starLike (swapProjection shadow) := by
  simpa [swapProjection, starLike, planetLike] using Nat.le_of_lt h

theorem swap_of_saturn_like_is_star_like (shadow : CelestialShadow)
    (h : saturnLike shadow) : starLike (swapProjection shadow) := by
  exact swap_of_planet_like_is_star_like shadow (saturn_like_implies_planet_like shadow h)

theorem swap_of_saturn_like_not_saturn_like (shadow : CelestialShadow)
    (h : saturnLike shadow) : ¬ saturnLike (swapProjection shadow) := by
  intro hswap
  have hstar : starLike (swapProjection shadow) :=
    swap_of_saturn_like_is_star_like shadow h
  exact saturn_like_not_star_like (swapProjection shadow) hswap hstar

theorem same_budget_does_not_fix_morphology
    (shadow : CelestialShadow)
    (hcore : 0 < coreStages shadow)
    (hhalo : 0 < shadow.haloChannels)
    (hdom : shadow.radialChannels < shadow.equatorialChannels) :
    let star := swapProjection shadow
    visibleBudget star = visibleBudget shadow ∧
      star.dimension = shadow.dimension ∧
      star.haloChannels = shadow.haloChannels ∧
      starLike star ∧
      saturnLike shadow := by
  intro star
  refine ⟨swap_projection_preserves_visible_budget shadow,
    swap_projection_preserves_dimension shadow,
    swap_projection_preserves_halo shadow,
    ?_, ?_⟩
  · exact swap_of_planet_like_is_star_like shadow hdom
  · exact positive_core_halo_equatorial_dominance_gives_saturn_like shadow hcore hhalo hdom

theorem fifty_four_d_witnesses_have_opposite_signed_bias :
    signedMorphologyBias fiftyFourDSaturnShadow =
      -signedMorphologyBias fiftyFourDStellarShadow := by
  unfold signedMorphologyBias fiftyFourDSaturnShadow fiftyFourDStellarShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_witnesses_sum_to_zero_bias :
    signedMorphologyBias fiftyFourDSaturnShadow +
      signedMorphologyBias fiftyFourDStellarShadow = 0 := by
  unfold signedMorphologyBias fiftyFourDSaturnShadow fiftyFourDStellarShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

end ForkRaceFoldTheorems
