import ForkRaceFoldTheorems.CelestialNaturalDivision
import ForkRaceFoldTheorems.CelestialOffByOneTaxonomy

/-!
# Photon Plus Sliver Frontier

This module packages the current low-dimensional floor into one explicit theorem
surface.

The claim is intentionally narrow:

- the photon-like witness is the `2D` zero-budget positioning floor;
- its minimal nontrivial control/window size is exactly the Barbelo sliver;
- the same floor measured in picolorenzos is one Barbelo unit;
- the Earth-like rocky witness shares that minimal size statistic, so the
  current theorem is about the floor packet itself, not yet a unique universal
  localization law.
-/

namespace ForkRaceFoldTheorems

/-- The photon-like witness is the current zero-budget positional floor:
ambient `2D`, zero visible budget, and the minimal nontrivial window `[0, 1]`.
-/
theorem photon_like_shadow_is_positioning_floor :
    photonLikeShadow.dimension = 2 ∧
      visibleBudget photonLikeShadow = 0 ∧
      orbitalLowerBound photonLikeShadow = 0 ∧
      orbitalUpperBound photonLikeShadow = 1 := by
  refine ⟨rfl, photon_like_shadow_has_zero_budget, ?_, ?_⟩
  · unfold orbitalLowerBound orbitalGain ringDominanceMargin photonLikeShadow
    native_decide
  · unfold orbitalUpperBound orbitalGain orbitalControl ringDominanceMargin
      photonLikeShadow
    native_decide

/-- In the current packet calculus, the photon floor is exactly `gain = 0`,
`control = 1`, i.e. the positional packet reduces to the sliver. -/
theorem photon_floor_gain_control_is_zero_plus_sliver :
    gainControlSignature photonLikeShadow = (0, GnosticNumbers.barbelo) := by
  unfold gainControlSignature orbitalGain orbitalControl ringDominanceMargin
    photonLikeShadow GnosticNumbers.barbelo
  native_decide

/-- The photon floor reduces to the Barbelo sliver under the exact celestial
size statistic `naturalDivision = orbitalSpread = control`. -/
theorem photon_floor_reduces_to_barbelo_sliver :
    naturalDivision photonLikeShadow = GnosticNumbers.barbelo := by
  exact photon_natural_division_is_barbelo

/-- The same photon-plus-sliver floor, measured in picolorenzos, is one
Barbelo unit. -/
theorem photon_floor_is_one_barbelo_picolorenzo :
    naturalDivisionPicolorenzos photonLikeShadow = GnosticTime.barbelo_pLo := by
  exact photon_natural_division_is_one_picolorenzo

/-- Consolidated floor theorem: the current photon packet is a `2D` zero-budget
packet whose entire nontrivial positional size is the Barbelo sliver. -/
theorem photon_plus_sliver_frontier :
    predictPlanetTaxon photonLikeShadow = PlanetTaxon.photonLike ∧
      photonLikeShadow.dimension = 2 ∧
      visibleBudget photonLikeShadow = 0 ∧
      gainControlSignature photonLikeShadow = (0, GnosticNumbers.barbelo) ∧
      naturalDivision photonLikeShadow = GnosticNumbers.barbelo ∧
      naturalDivisionPicolorenzos photonLikeShadow = GnosticTime.barbelo_pLo := by
  exact ⟨predict_photon_like_shadow, rfl, photon_like_shadow_has_zero_budget,
    photon_floor_gain_control_is_zero_plus_sliver,
    photon_floor_reduces_to_barbelo_sliver,
    photon_floor_is_one_barbelo_picolorenzo⟩

/-- The floor statistic is not unique to the photon packet: the Earth-like
rocky floor shares the same sliver-sized control. This keeps the theorem
honest: the current mechanization identifies the floor packet, not yet a full
uncertainty principle. -/
theorem rocky_shadow_shares_sliver_floor_size :
    gainControlSignature earthLikeRockyShadow =
        gainControlSignature photonLikeShadow ∧
      naturalDivision earthLikeRockyShadow = GnosticNumbers.barbelo := by
  exact ⟨photon_and_rocky_share_gain_control_signature.symm,
    earth_like_natural_division_is_barbelo⟩

end ForkRaceFoldTheorems
