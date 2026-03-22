import ForkRaceFoldTheorems.CelestialClassifierBarrier
import ForkRaceFoldTheorems.SkyrmsNadirBule

/-!
# Celestial Orbit Prediction

This module turns the celestial shadow arithmetic into a predictive
surface. A ring-dominance gain gives a lower bound on orbital location,
halo-backed control gives the control statistic, and the resulting
location window can be compared against a Skyrms-style nadir.

The bridge is intentionally bounded. It does not identify a literal
planetary semimajor axis in astronomical units. It proves an internal
arithmetic prediction surface: gain, control, lower/upper location
bounds, and an exact Skyrms-equilibrium certificate for halo-matched
Saturn-like witnesses.
-/

namespace ForkRaceFoldTheorems

/-- Predictive orbital gain carried by the equatorial surplus. -/
def orbitalGain (shadow : CelestialShadow) : Nat :=
  ringDominanceMargin shadow

/-- A minimal control statistic: halo support plus the single anchor
stream needed to hold an orbital class fixed. -/
def orbitalControl (shadow : CelestialShadow) : Nat :=
  shadow.haloChannels + 1

/-- Lower orbital-location bound: no ringed planet can sit below its
equatorial gain. -/
def orbitalLowerBound (shadow : CelestialShadow) : Nat :=
  orbitalGain shadow

/-- Upper orbital-location bound: gain plus control reserve. -/
def orbitalUpperBound (shadow : CelestialShadow) : Nat :=
  orbitalGain shadow + orbitalControl shadow

/-- Encode a planet-shadow as a small Skyrms mediation problem. The
orbital gain becomes the nontrivial walker, and the control statistic
is the mediation budget. -/
def orbitalSkyrmsState (shadow : CelestialShadow)
    (hgain : 2 ≤ orbitalGain shadow) : SkyrmsAsCommunity where
  walkerA_dims := orbitalGain shadow
  walkerB_dims := 2
  walkerA_complex := hgain
  walkerB_complex := by omega
  mediationRounds := orbitalControl shadow

theorem orbital_lower_bound_eq_gain (shadow : CelestialShadow) :
    orbitalLowerBound shadow = orbitalGain shadow := rfl

theorem orbital_upper_bound_eq_gain_plus_control (shadow : CelestialShadow) :
    orbitalUpperBound shadow = orbitalGain shadow + orbitalControl shadow := rfl

theorem orbital_control_positive (shadow : CelestialShadow) :
    0 < orbitalControl shadow := by
  unfold orbitalControl
  omega

theorem orbital_bounds_ordered (shadow : CelestialShadow) :
    orbitalLowerBound shadow ≤ orbitalUpperBound shadow := by
  unfold orbitalLowerBound orbitalUpperBound orbitalControl orbitalGain
  omega

theorem saturn_like_has_positive_orbital_gain (shadow : CelestialShadow)
    (h : saturnLike shadow) :
    0 < orbitalGain shadow := by
  unfold saturnLike planetLike orbitalGain ringDominanceMargin at *
  omega

theorem orbital_skyrms_nadir_context_eq_gain_plus_one
    (shadow : CelestialShadow)
    (hgain : 2 ≤ orbitalGain shadow) :
    nadirContext (orbitalSkyrmsState shadow hgain) = orbitalGain shadow + 1 := by
  simp [nadirContext, orbitalSkyrmsState, SkyrmsAsCommunity.totalDims, orbitalGain]

theorem orbital_skyrms_control_eq_nadir_when_halo_matches_gain
    (shadow : CelestialShadow)
    (hgain : 2 ≤ orbitalGain shadow)
    (hmatch : orbitalGain shadow = shadow.haloChannels) :
    orbitalControl shadow = nadirContext (orbitalSkyrmsState shadow hgain) := by
  rw [orbital_skyrms_nadir_context_eq_gain_plus_one shadow hgain]
  unfold orbitalControl
  omega

theorem halo_matched_gain_reaches_orbital_skyrms_nadir
    (shadow : CelestialShadow)
    (hgain : 2 ≤ orbitalGain shadow)
    (hmatch : orbitalGain shadow = shadow.haloChannels) :
    (orbitalSkyrmsState shadow hgain).interWalkerDistance = 0 := by
  have hctx :
      orbitalControl shadow = nadirContext (orbitalSkyrmsState shadow hgain) :=
    orbital_skyrms_control_eq_nadir_when_halo_matches_gain shadow hgain hmatch
  have hbule :
      buleDeficit (orbitalSkyrmsState shadow hgain).toFailureTopology
        (orbitalControl shadow) = 0 := by
    simpa [hctx] using bule_zero_at_nadir (orbitalSkyrmsState shadow hgain)
  unfold SkyrmsAsCommunity.interWalkerDistance SkyrmsAsCommunity.bule orbitalSkyrmsState
  simpa using hbule

theorem fifty_four_d_saturn_orbital_gain :
    orbitalGain fiftyFourDSaturnShadow =
      DimensionalConfinement.rampUpTicksFromDimension 54 := by
  exact fifty_four_d_saturn_shadow_margin_eq_ramp_up

theorem fifty_four_d_saturn_orbital_gain_ge_two :
    2 ≤ orbitalGain fiftyFourDSaturnShadow := by
  unfold orbitalGain ringDominanceMargin fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_saturn_orbital_control :
    orbitalControl fiftyFourDSaturnShadow =
      DimensionalConfinement.rampUpTicksFromDimension 54 + 1 := by
  unfold orbitalControl fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_saturn_halo_matches_orbital_gain :
    orbitalGain fiftyFourDSaturnShadow = fiftyFourDSaturnShadow.haloChannels := by
  unfold orbitalGain ringDominanceMargin fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_saturn_location_window :
    orbitalLowerBound fiftyFourDSaturnShadow = 52 ∧
      orbitalUpperBound fiftyFourDSaturnShadow = 105 := by
  unfold orbitalLowerBound orbitalUpperBound orbitalGain orbitalControl
    ringDominanceMargin fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_saturn_is_orbital_skyrms_equilibrium :
    (orbitalSkyrmsState fiftyFourDSaturnShadow
      fifty_four_d_saturn_orbital_gain_ge_two).interWalkerDistance = 0 := by
  exact halo_matched_gain_reaches_orbital_skyrms_nadir
    fiftyFourDSaturnShadow
    fifty_four_d_saturn_orbital_gain_ge_two
    fifty_four_d_saturn_halo_matches_orbital_gain

theorem same_signature_does_not_fix_orbital_lower_bound :
    observableSignature fiftyFourDStellarShadow =
        observableSignature fiftyFourDSaturnShadow ∧
      orbitalLowerBound fiftyFourDStellarShadow ≠
        orbitalLowerBound fiftyFourDSaturnShadow := by
  refine ⟨fifty_four_d_signature_not_injective.1, ?_⟩
  unfold orbitalLowerBound orbitalGain ringDominanceMargin
    fiftyFourDStellarShadow fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem same_signature_does_not_fix_orbital_upper_bound :
    observableSignature fiftyFourDStellarShadow =
        observableSignature fiftyFourDSaturnShadow ∧
      orbitalUpperBound fiftyFourDStellarShadow ≠
        orbitalUpperBound fiftyFourDSaturnShadow := by
  refine ⟨fifty_four_d_signature_not_injective.1, ?_⟩
  unfold orbitalUpperBound orbitalGain orbitalControl
    ringDominanceMargin fiftyFourDStellarShadow fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

end ForkRaceFoldTheorems
