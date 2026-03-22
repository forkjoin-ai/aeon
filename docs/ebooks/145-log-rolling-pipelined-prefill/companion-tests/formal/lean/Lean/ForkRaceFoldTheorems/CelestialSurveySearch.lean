import ForkRaceFoldTheorems.CelestialGainControlPrediction

/-!
# Celestial Survey Search

This module exposes the celestial prediction surface as a math-only
survey filter. The input is an observed packet

  `(ambientDimension, visibleBudget, gain, control, skyrmsLocation)`,

and the output is a predicted taxon plus a boolean candidate decision.
This is the formal shape of a SETI-like search over catalogs, without
assuming any narrative interpretation beyond the measured arithmetic.
-/

namespace ForkRaceFoldTheorems

structure ObservedPlanetDatum where
  ambientDimension : Nat
  visibleBudget : Nat
  gain : Nat
  control : Nat
  skyrmsLocation : Nat
deriving DecidableEq, Repr

def observedPhotonCriterion (datum : ObservedPlanetDatum) : Prop :=
  datum.ambientDimension = 2 ∧ datum.visibleBudget = 0

def observedCompactRockyCriterion (datum : ObservedPlanetDatum) : Prop :=
  datum.ambientDimension = 3 ∧ datum.gain = 0 ∧ datum.control = 1

def observedDiffuseCriterion (datum : ObservedPlanetDatum) : Prop :=
  0 < datum.gain ∧ datum.gain + 1 < datum.control

def observedHaloLockedCriterion (datum : ObservedPlanetDatum) : Prop :=
  0 < datum.gain ∧ datum.control = datum.gain + 1

def observedSuperCriterion (datum : ObservedPlanetDatum) : Prop :=
  0 < datum.gain ∧ datum.control ≤ datum.gain

instance instDecidableObservedPhotonCriterion (datum : ObservedPlanetDatum) :
    Decidable (observedPhotonCriterion datum) := by
  unfold observedPhotonCriterion
  infer_instance

instance instDecidableObservedCompactRockyCriterion (datum : ObservedPlanetDatum) :
    Decidable (observedCompactRockyCriterion datum) := by
  unfold observedCompactRockyCriterion
  infer_instance

instance instDecidableObservedDiffuseCriterion (datum : ObservedPlanetDatum) :
    Decidable (observedDiffuseCriterion datum) := by
  unfold observedDiffuseCriterion
  infer_instance

instance instDecidableObservedHaloLockedCriterion (datum : ObservedPlanetDatum) :
    Decidable (observedHaloLockedCriterion datum) := by
  unfold observedHaloLockedCriterion
  infer_instance

instance instDecidableObservedSuperCriterion (datum : ObservedPlanetDatum) :
    Decidable (observedSuperCriterion datum) := by
  unfold observedSuperCriterion
  infer_instance

def observedTaxon (datum : ObservedPlanetDatum) : PlanetTaxon :=
  if observedPhotonCriterion datum then
    .photonLike
  else if observedCompactRockyCriterion datum then
    .compactRocky
  else if observedDiffuseCriterion datum then
    .diffuseRing
  else if observedHaloLockedCriterion datum then
    .haloLockedRing
  else if observedSuperCriterion datum then
    .superRing
  else
    .unresolved

def inSkyrmsWindow (datum : ObservedPlanetDatum) : Prop :=
  datum.gain ≤ datum.skyrmsLocation ∧
    datum.skyrmsLocation ≤ datum.gain + datum.control

instance instDecidableInSkyrmsWindow (datum : ObservedPlanetDatum) :
    Decidable (inSkyrmsWindow datum) := by
  unfold inSkyrmsWindow
  infer_instance

def isMathPlanetCandidate (datum : ObservedPlanetDatum) : Bool :=
  decide (observedTaxon datum ≠ PlanetTaxon.unresolved ∧ inSkyrmsWindow datum)

def searchPlanetCandidates (catalog : List ObservedPlanetDatum) : List ObservedPlanetDatum :=
  catalog.filter isMathPlanetCandidate

def observeShadow (shadow : CelestialShadow) (skyrmsLocation : Nat) : ObservedPlanetDatum where
  ambientDimension := shadow.dimension
  visibleBudget := visibleBudget shadow
  gain := orbitalGain shadow
  control := orbitalControl shadow
  skyrmsLocation := skyrmsLocation

def observedPhotonDemo : ObservedPlanetDatum :=
  observeShadow photonLikeShadow 0

def observedRockyDemo : ObservedPlanetDatum :=
  observeShadow earthLikeRockyShadow 1

def observedDiffuseDemo : ObservedPlanetDatum :=
  observeShadow fiftyFourDDiffuseRingShadow 41

def observedHaloLockedDemo : ObservedPlanetDatum :=
  observeShadow fiftyFourDSaturnShadow 53

def observedSuperDemo : ObservedPlanetDatum :=
  observeShadow fiftyFourDSuperRingShadow 72

def observedNoiseDemo : ObservedPlanetDatum where
  ambientDimension := 11
  visibleBudget := 17
  gain := 0
  control := 2
  skyrmsLocation := 99

def demoSurvey : List ObservedPlanetDatum :=
  [observedPhotonDemo, observedRockyDemo, observedDiffuseDemo,
    observedHaloLockedDemo, observedSuperDemo, observedNoiseDemo]

theorem observed_diffuse_taxon :
    observedTaxon observedDiffuseDemo = PlanetTaxon.diffuseRing := by
  unfold observedTaxon observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedDiffuseDemo observeShadow visibleBudget orbitalGain orbitalControl
    fiftyFourDDiffuseRingShadow ringDominanceMargin
  native_decide

theorem observed_halo_locked_taxon :
    observedTaxon observedHaloLockedDemo = PlanetTaxon.haloLockedRing := by
  unfold observedTaxon observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedHaloLockedDemo observeShadow visibleBudget orbitalGain orbitalControl
    fiftyFourDSaturnShadow ringDominanceMargin DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem observed_super_taxon :
    observedTaxon observedSuperDemo = PlanetTaxon.superRing := by
  unfold observedTaxon observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedSuperDemo observeShadow visibleBudget orbitalGain orbitalControl
    fiftyFourDSuperRingShadow ringDominanceMargin
  native_decide

theorem observed_low_dimensional_taxa :
    observedTaxon observedPhotonDemo = PlanetTaxon.photonLike ∧
      observedTaxon observedRockyDemo = PlanetTaxon.compactRocky := by
  unfold observedTaxon observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedPhotonDemo observedRockyDemo observeShadow visibleBudget orbitalGain
    orbitalControl photonLikeShadow earthLikeRockyShadow ringDominanceMargin
  native_decide

theorem observed_noise_is_unresolved :
    observedTaxon observedNoiseDemo = PlanetTaxon.unresolved := by
  unfold observedTaxon observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedNoiseDemo
  native_decide

theorem demo_candidates_pass_math_filter :
    isMathPlanetCandidate observedPhotonDemo = true ∧
      isMathPlanetCandidate observedRockyDemo = true ∧
      isMathPlanetCandidate observedDiffuseDemo = true ∧
      isMathPlanetCandidate observedHaloLockedDemo = true ∧
      isMathPlanetCandidate observedSuperDemo = true := by
  unfold isMathPlanetCandidate inSkyrmsWindow observedTaxon
    observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedPhotonDemo observedRockyDemo observedDiffuseDemo observedHaloLockedDemo
    observedSuperDemo observeShadow visibleBudget orbitalGain orbitalControl
    photonLikeShadow earthLikeRockyShadow fiftyFourDDiffuseRingShadow
    fiftyFourDSaturnShadow fiftyFourDSuperRingShadow ringDominanceMargin
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem noise_fails_math_filter :
    isMathPlanetCandidate observedNoiseDemo = false := by
  unfold isMathPlanetCandidate inSkyrmsWindow observedTaxon
    observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedNoiseDemo
  native_decide

theorem search_keeps_math_candidates_and_drops_noise :
    searchPlanetCandidates demoSurvey =
      [observedPhotonDemo, observedRockyDemo, observedDiffuseDemo,
        observedHaloLockedDemo, observedSuperDemo] := by
  unfold searchPlanetCandidates demoSurvey isMathPlanetCandidate inSkyrmsWindow
    observedTaxon observedDiffuseCriterion observedCompactRockyCriterion
    observedPhotonCriterion observedHaloLockedCriterion observedSuperCriterion
    observedPhotonDemo observedRockyDemo observedDiffuseDemo observedHaloLockedDemo
    observedSuperDemo observedNoiseDemo observeShadow visibleBudget orbitalGain
    orbitalControl photonLikeShadow earthLikeRockyShadow fiftyFourDDiffuseRingShadow
    fiftyFourDSaturnShadow fiftyFourDSuperRingShadow ringDominanceMargin
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

end ForkRaceFoldTheorems
