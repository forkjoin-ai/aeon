import ForkRaceFoldTheorems.DimensionalConfinement

/-!
# Celestial Shadows

This module introduces a minimal projection language for talking about
star-like and planet-like visible shadows of a high-dimensional
Wallington object.

The claim surface is deliberately narrow. We do not prove that every
`54D` Wallington object looks like Saturn. We prove a constructive
existence statement instead: once a visible projection partitions the
certified directed-channel surface into radial, equatorial, and halo
channels, the resulting shadow can be classified arithmetically. Using
the existing `54D` channel budget (`2756`) and ramp-up count (`52`), we
can exhibit both a star-like witness and a Saturn-like witness.
-/

namespace ForkRaceFoldTheorems

/-- A visible 3D shadow of a higher-dimensional Wallington object,
bookkept only by how its directed channels are projected. -/
structure CelestialShadow where
  dimension : Nat
  radialChannels : Nat
  equatorialChannels : Nat
  haloChannels : Nat
  channelBudget :
    radialChannels + equatorialChannels + haloChannels =
      DimensionalConfinement.channelSurfaceFromDimension dimension

/-- The central body still carries the staged core of the Wallington
object. In the dimensional-confinement arithmetic this is `dimension - 1`
stages. -/
def coreStages (shadow : CelestialShadow) : Nat :=
  shadow.dimension - 1

/-- Positive margin means the equatorial band dominates the radial fan. -/
def ringDominanceMargin (shadow : CelestialShadow) : Nat :=
  shadow.equatorialChannels - shadow.radialChannels

/-- Star-like shadows are radial-dominant. -/
def starLike (shadow : CelestialShadow) : Prop :=
  shadow.equatorialChannels ≤ shadow.radialChannels

/-- Planet-like shadows are ring-dominant. -/
def planetLike (shadow : CelestialShadow) : Prop :=
  shadow.radialChannels < shadow.equatorialChannels

/-- Saturn-like means a nontrivial core, a visible halo, and a dominant
equatorial band. -/
def saturnLike (shadow : CelestialShadow) : Prop :=
  0 < coreStages shadow ∧ 0 < shadow.haloChannels ∧ planetLike shadow

/-- Every shadow in this arithmetic is either radial-dominant or
equatorial-dominant. -/
theorem star_like_or_planet_like (shadow : CelestialShadow) :
    starLike shadow ∨ planetLike shadow := by
  unfold starLike planetLike
  omega

/-- The two classifications are exclusive. -/
theorem planet_like_not_star_like (shadow : CelestialShadow)
    (h : planetLike shadow) : ¬ starLike shadow := by
  unfold planetLike starLike at *
  omega

/-- A concrete `54D` radial-dominant witness. -/
def fiftyFourDStellarShadow : CelestialShadow where
  dimension := 54
  radialChannels := 1378
  equatorialChannels := 1326
  haloChannels := DimensionalConfinement.rampUpTicksFromDimension 54
  channelBudget := by
    unfold DimensionalConfinement.channelSurfaceFromDimension
      DimensionalConfinement.emanationCount
      DimensionalConfinement.rampUpTicksFromDimension
    omega

/-- A concrete `54D` ring-dominant witness. The equatorial surplus is
matched exactly to the `54D` ramp-up count. -/
def fiftyFourDSaturnShadow : CelestialShadow where
  dimension := 54
  radialChannels := 1326
  equatorialChannels := 1378
  haloChannels := DimensionalConfinement.rampUpTicksFromDimension 54
  channelBudget := by
    unfold DimensionalConfinement.channelSurfaceFromDimension
      DimensionalConfinement.emanationCount
      DimensionalConfinement.rampUpTicksFromDimension
    omega

theorem fifty_four_d_stellar_shadow_is_star_like :
    starLike fiftyFourDStellarShadow := by
  unfold starLike fiftyFourDStellarShadow
  native_decide

theorem fifty_four_d_saturn_shadow_margin_eq_ramp_up :
    ringDominanceMargin fiftyFourDSaturnShadow =
      DimensionalConfinement.rampUpTicksFromDimension 54 := by
  unfold ringDominanceMargin fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_saturn_shadow_is_saturn_like :
    saturnLike fiftyFourDSaturnShadow := by
  unfold saturnLike coreStages planetLike fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

/-- The `54D` budget supports a star-like projection. -/
theorem fifty_four_d_supports_star_like_shadow :
    ∃ shadow : CelestialShadow, shadow.dimension = 54 ∧ starLike shadow := by
  exact ⟨fiftyFourDStellarShadow, rfl, fifty_four_d_stellar_shadow_is_star_like⟩

/-- The `54D` budget also supports a Saturn-like projection. -/
theorem fifty_four_d_supports_saturn_like_shadow :
    ∃ shadow : CelestialShadow, shadow.dimension = 54 ∧ saturnLike shadow := by
  exact ⟨fiftyFourDSaturnShadow, rfl, fifty_four_d_saturn_shadow_is_saturn_like⟩

/-- The same `54D` Wallington budget admits both stellar and planetary
readings depending on how the visible shadow partitions the certified
channel surface. -/
theorem fifty_four_d_supports_stars_and_planets :
    ∃ star planet : CelestialShadow,
      star.dimension = 54 ∧
      starLike star ∧
      planet.dimension = 54 ∧
      saturnLike planet := by
  exact ⟨fiftyFourDStellarShadow, fiftyFourDSaturnShadow, rfl,
    fifty_four_d_stellar_shadow_is_star_like, rfl,
    fifty_four_d_saturn_shadow_is_saturn_like⟩

end ForkRaceFoldTheorems
