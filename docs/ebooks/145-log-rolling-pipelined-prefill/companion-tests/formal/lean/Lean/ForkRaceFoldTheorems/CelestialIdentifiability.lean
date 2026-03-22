import ForkRaceFoldTheorems.CelestialKnowability

/-!
# Celestial Identifiability

This module turns the morphology split into an inverse-problem surface.
It records which observables are preserved by the radial/equatorial swap
and proves the anti-theorem that those observables do not identify a
unique morphology.
-/

namespace ForkRaceFoldTheorems

/-- A minimal observable signature for a visible shadow. -/
def observableSignature (shadow : CelestialShadow) : Nat × Nat × Nat :=
  (shadow.dimension, shadow.haloChannels, visibleBudget shadow)

theorem swap_projection_preserves_signature (shadow : CelestialShadow) :
    observableSignature (swapProjection shadow) = observableSignature shadow := by
  unfold observableSignature
  simp [swap_projection_preserves_dimension, swap_projection_preserves_halo,
    swap_projection_preserves_visible_budget]

theorem swap_projection_negates_signed_bias (shadow : CelestialShadow) :
    signedMorphologyBias (swapProjection shadow) = -signedMorphologyBias shadow := by
  cases shadow with
  | mk dimension radial equatorial halo channelBudget =>
      change Int.ofNat radial - Int.ofNat equatorial =
        -(Int.ofNat equatorial - Int.ofNat radial)
      omega

theorem saturn_like_implies_swap_ne (shadow : CelestialShadow)
    (h : saturnLike shadow) : swapProjection shadow ≠ shadow := by
  intro hEq
  have hRadEq : (swapProjection shadow).radialChannels = shadow.radialChannels := by
    simp [hEq]
  have hEqRadial : shadow.equatorialChannels = shadow.radialChannels := by
    simpa [swapProjection] using hRadEq
  have hPlanet : planetLike shadow := saturn_like_implies_planet_like shadow h
  unfold planetLike at hPlanet
  omega

theorem planet_like_signature_has_star_like_twin (shadow : CelestialShadow)
    (h : planetLike shadow) :
    observableSignature (swapProjection shadow) = observableSignature shadow ∧
      starLike (swapProjection shadow) := by
  exact ⟨swap_projection_preserves_signature shadow,
    swap_of_planet_like_is_star_like shadow h⟩

theorem signature_not_injective_on_saturn_like_morphology (shadow : CelestialShadow)
    (h : saturnLike shadow) :
    ∃ twin : CelestialShadow,
      observableSignature twin = observableSignature shadow ∧
      starLike twin ∧
      saturnLike shadow ∧
      twin ≠ shadow := by
  refine ⟨swapProjection shadow, swap_projection_preserves_signature shadow,
    swap_of_saturn_like_is_star_like shadow h, h, ?_⟩
  exact saturn_like_implies_swap_ne shadow h

theorem fifty_four_d_signature_not_injective :
    observableSignature fiftyFourDStellarShadow =
        observableSignature fiftyFourDSaturnShadow ∧
      starLike fiftyFourDStellarShadow ∧
      saturnLike fiftyFourDSaturnShadow ∧
      fiftyFourDStellarShadow ≠ fiftyFourDSaturnShadow := by
  refine ⟨?_, fifty_four_d_stellar_shadow_is_star_like,
    fifty_four_d_saturn_shadow_is_saturn_like, ?_⟩
  · unfold observableSignature visibleBudget fiftyFourDStellarShadow
      fiftyFourDSaturnShadow DimensionalConfinement.rampUpTicksFromDimension
    native_decide
  · intro hEq
    have hRadEq : fiftyFourDStellarShadow.radialChannels =
        fiftyFourDSaturnShadow.radialChannels := by
      simp [hEq]
    have hneq : fiftyFourDStellarShadow.radialChannels ≠
        fiftyFourDSaturnShadow.radialChannels := by
      native_decide
    exact hneq hRadEq

theorem same_signature_can_hide_opposite_bias (shadow : CelestialShadow) :
    ∃ twin : CelestialShadow,
      observableSignature twin = observableSignature shadow ∧
      signedMorphologyBias twin = -signedMorphologyBias shadow := by
  refine ⟨swapProjection shadow, swap_projection_preserves_signature shadow, ?_⟩
  exact swap_projection_negates_signed_bias shadow

end ForkRaceFoldTheorems
