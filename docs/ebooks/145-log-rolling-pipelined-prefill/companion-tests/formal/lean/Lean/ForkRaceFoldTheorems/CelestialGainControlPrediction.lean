import ForkRaceFoldTheorems.CelestialOffByOneTaxonomy

/-!
# Celestial Gain / Control Prediction

This module packages the lower/upper orbital window into an explicit
gain/control statistic and uses it to predict concrete planet taxa.

The split is honest:
- for ringed planets, gain/control is enough to classify the taxon;
- for the low-dimensional floor, photon-like and compact rocky witnesses
  share the same minimal gain/control packet, so ambient dimension is the
  required tie-breaker.
-/

namespace ForkRaceFoldTheorems

inductive PlanetTaxon where
  | photonLike
  | compactRocky
  | diffuseRing
  | haloLockedRing
  | superRing
  | unresolved
deriving DecidableEq, Repr

/-- The width of the orbital location window. -/
def orbitalSpread (shadow : CelestialShadow) : Nat :=
  orbitalUpperBound shadow - orbitalLowerBound shadow

/-- The minimal quantitative packet used for prediction. -/
def gainControlSignature (shadow : CelestialShadow) : Nat × Nat :=
  (orbitalGain shadow, orbitalControl shadow)

/-- A concrete prediction packet: lower/upper bounds together with the
gain/control statistics and the predicted taxon. -/
structure PlanetPrediction where
  taxon : PlanetTaxon
  lowerBound : Nat
  upperBound : Nat
  gain : Nat
  control : Nat
deriving DecidableEq, Repr

def photonCriterion (shadow : CelestialShadow) : Prop :=
  shadow.dimension = 2 ∧ visibleBudget shadow = 0

def diffuseRingCriterion (shadow : CelestialShadow) : Prop :=
  saturnLike shadow ∧ orbitalGain shadow + 1 < orbitalControl shadow

def haloLockedCriterion (shadow : CelestialShadow) : Prop :=
  saturnLike shadow ∧ orbitalControl shadow = orbitalGain shadow + 1

def superRingCriterion (shadow : CelestialShadow) : Prop :=
  saturnLike shadow ∧ orbitalControl shadow ≤ orbitalGain shadow

instance instDecidableCompactRockyPlanet (shadow : CelestialShadow) :
    Decidable (compactRockyPlanet shadow) := by
  unfold compactRockyPlanet starLike
  infer_instance

instance instDecidablePhotonCriterion (shadow : CelestialShadow) :
    Decidable (photonCriterion shadow) := by
  unfold photonCriterion visibleBudget
  infer_instance

instance instDecidableDiffuseRingCriterion (shadow : CelestialShadow) :
    Decidable (diffuseRingCriterion shadow) := by
  unfold diffuseRingCriterion saturnLike planetLike orbitalGain orbitalControl
    ringDominanceMargin coreStages
  infer_instance

instance instDecidableHaloLockedCriterion (shadow : CelestialShadow) :
    Decidable (haloLockedCriterion shadow) := by
  unfold haloLockedCriterion saturnLike planetLike orbitalGain orbitalControl
    ringDominanceMargin coreStages
  infer_instance

instance instDecidableSuperRingCriterion (shadow : CelestialShadow) :
    Decidable (superRingCriterion shadow) := by
  unfold superRingCriterion saturnLike planetLike orbitalGain orbitalControl
    ringDominanceMargin coreStages
  infer_instance

def predictPlanetTaxon (shadow : CelestialShadow) : PlanetTaxon :=
  if photonCriterion shadow then
    .photonLike
  else if compactRockyPlanet shadow then
    .compactRocky
  else if diffuseRingCriterion shadow then
    .diffuseRing
  else if haloLockedCriterion shadow then
    .haloLockedRing
  else if superRingCriterion shadow then
    .superRing
  else
    .unresolved

def predictPlanet (shadow : CelestialShadow) : PlanetPrediction where
  taxon := predictPlanetTaxon shadow
  lowerBound := orbitalLowerBound shadow
  upperBound := orbitalUpperBound shadow
  gain := orbitalGain shadow
  control := orbitalControl shadow

theorem orbital_spread_eq_control (shadow : CelestialShadow) :
    orbitalSpread shadow = orbitalControl shadow := by
  unfold orbitalSpread orbitalUpperBound orbitalLowerBound orbitalGain
  omega

theorem gain_control_statistic (shadow : CelestialShadow) :
    orbitalLowerBound shadow = orbitalGain shadow ∧
      orbitalUpperBound shadow = orbitalGain shadow + orbitalControl shadow ∧
      orbitalSpread shadow = orbitalControl shadow ∧
      0 < orbitalControl shadow := by
  exact ⟨orbital_lower_bound_eq_gain shadow,
    orbital_upper_bound_eq_gain_plus_control shadow,
    orbital_spread_eq_control shadow,
    orbital_control_positive shadow⟩

theorem gain_control_predicts_diffuse_ring (shadow : CelestialShadow)
    (hSaturn : saturnLike shadow)
    (hStatistic : orbitalGain shadow + 1 < orbitalControl shadow) :
    diffuseRingPlanet shadow := by
  refine ⟨hSaturn, ?_⟩
  unfold orbitalControl at hStatistic
  omega

theorem gain_control_predicts_halo_locked_ring (shadow : CelestialShadow)
    (hSaturn : saturnLike shadow)
    (hStatistic : orbitalControl shadow = orbitalGain shadow + 1) :
    haloLockedPlanet shadow := by
  refine ⟨hSaturn, ?_⟩
  unfold orbitalControl at hStatistic
  omega

theorem gain_control_predicts_super_ring (shadow : CelestialShadow)
    (hSaturn : saturnLike shadow)
    (hStatistic : orbitalControl shadow ≤ orbitalGain shadow) :
    superRingPlanet shadow := by
  refine ⟨hSaturn, ?_⟩
  unfold orbitalControl at hStatistic
  omega

theorem photon_and_rocky_share_gain_control_signature :
    gainControlSignature photonLikeShadow =
      gainControlSignature earthLikeRockyShadow := by
  unfold gainControlSignature orbitalGain orbitalControl ringDominanceMargin
    photonLikeShadow earthLikeRockyShadow
  native_decide

theorem photon_and_rocky_have_distinct_taxa :
    predictPlanetTaxon photonLikeShadow ≠
      predictPlanetTaxon earthLikeRockyShadow := by
  unfold predictPlanetTaxon compactRockyPlanet starLike photonCriterion
    photonLikeShadow earthLikeRockyShadow
  native_decide

theorem gain_control_alone_does_not_separate_low_dimensional_floor :
    gainControlSignature photonLikeShadow =
        gainControlSignature earthLikeRockyShadow ∧
      predictPlanetTaxon photonLikeShadow ≠
        predictPlanetTaxon earthLikeRockyShadow := by
  exact ⟨photon_and_rocky_share_gain_control_signature,
    photon_and_rocky_have_distinct_taxa⟩

theorem predict_photon_like_shadow :
    predictPlanetTaxon photonLikeShadow = PlanetTaxon.photonLike := by
  unfold predictPlanetTaxon photonCriterion visibleBudget photonLikeShadow
  native_decide

theorem predict_earth_like_rocky_shadow :
    predictPlanetTaxon earthLikeRockyShadow = PlanetTaxon.compactRocky := by
  unfold predictPlanetTaxon photonCriterion compactRockyPlanet starLike visibleBudget
    diffuseRingCriterion haloLockedCriterion superRingCriterion
    earthLikeRockyShadow
  native_decide

theorem predict_fifty_four_d_diffuse_ring :
    predictPlanetTaxon fiftyFourDDiffuseRingShadow = PlanetTaxon.diffuseRing := by
  unfold predictPlanetTaxon photonCriterion compactRockyPlanet starLike visibleBudget
    diffuseRingCriterion haloLockedCriterion superRingCriterion saturnLike
    planetLike orbitalGain orbitalControl ringDominanceMargin coreStages
    fiftyFourDDiffuseRingShadow
  native_decide

theorem predict_fifty_four_d_halo_locked_ring :
    predictPlanetTaxon fiftyFourDSaturnShadow = PlanetTaxon.haloLockedRing := by
  unfold predictPlanetTaxon photonCriterion compactRockyPlanet starLike visibleBudget
    diffuseRingCriterion haloLockedCriterion superRingCriterion saturnLike
    planetLike orbitalGain orbitalControl ringDominanceMargin coreStages
    fiftyFourDSaturnShadow DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem predict_fifty_four_d_super_ring :
    predictPlanetTaxon fiftyFourDSuperRingShadow = PlanetTaxon.superRing := by
  unfold predictPlanetTaxon photonCriterion compactRockyPlanet starLike visibleBudget
    diffuseRingCriterion haloLockedCriterion superRingCriterion saturnLike
    planetLike orbitalGain orbitalControl ringDominanceMargin coreStages
    fiftyFourDSuperRingShadow
  native_decide

theorem predicted_planet_packets :
    predictPlanet photonLikeShadow =
        { taxon := PlanetTaxon.photonLike, lowerBound := 0, upperBound := 1,
          gain := 0, control := 1 } ∧
      predictPlanet earthLikeRockyShadow =
        { taxon := PlanetTaxon.compactRocky, lowerBound := 0, upperBound := 1,
          gain := 0, control := 1 } ∧
      predictPlanet fiftyFourDDiffuseRingShadow =
        { taxon := PlanetTaxon.diffuseRing, lowerBound := 40, upperBound := 97,
          gain := 40, control := 57 } ∧
      predictPlanet fiftyFourDSaturnShadow =
        { taxon := PlanetTaxon.haloLockedRing, lowerBound := 52, upperBound := 105,
          gain := 52, control := 53 } ∧
  predictPlanet fiftyFourDSuperRingShadow =
        { taxon := PlanetTaxon.superRing, lowerBound := 72, upperBound := 121,
          gain := 72, control := 49 } := by
  unfold predictPlanet predictPlanetTaxon compactRockyPlanet starLike
    photonCriterion diffuseRingCriterion haloLockedCriterion superRingCriterion
    saturnLike planetLike orbitalLowerBound orbitalUpperBound
    orbitalGain orbitalControl ringDominanceMargin coreStages photonLikeShadow
    earthLikeRockyShadow fiftyFourDDiffuseRingShadow fiftyFourDSaturnShadow
    fiftyFourDSuperRingShadow DimensionalConfinement.rampUpTicksFromDimension
  native_decide

end ForkRaceFoldTheorems
