import ForkRaceFoldTheorems.AstrophysicalProjection
import ForkRaceFoldTheorems.KnowabilitySplit

/-!
# Celestial Knowability

This module composes the celestial morphology split with the existing
cosmic knowability boundaries. The point is narrow: even when the CMB
surface is visible and the observer gap is positive, the visible budget
still does not determine a unique celestial morphology.
-/

namespace ForkRaceFoldTheorems

theorem cmb_boundary_coexists_with_morphology_split
    (shadow : CelestialShadow)
    (hcore : 0 < coreStages shadow)
    (hhalo : 0 < shadow.haloChannels)
    (hdom : shadow.radialChannels < shadow.equatorialChannels) :
    let star := swapProjection shadow
    CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        CMBVisibilityBoundary.recombinationYears ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
          (CMBVisibilityBoundary.recombinationYears - 1) ∧
      visibleBudget star = visibleBudget shadow ∧
      starLike star ∧
      saturnLike shadow := by
  intro star
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · exact CMBVisibilityBoundary.cmb_visible_now
  · exact CMBVisibilityBoundary.pre_cmb_not_visible_now
  · exact swap_projection_preserves_visible_budget shadow
  · exact swap_of_planet_like_is_star_like shadow hdom
  · exact positive_core_halo_equatorial_dominance_gives_saturn_like shadow hcore hhalo hdom

theorem zero_exploration_still_leaves_morphology_split
    (optimal skyrms : Nat)
    (shadow : CelestialShadow)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + 0)
    (hcore : 0 < coreStages shadow)
    (hhalo : 0 < shadow.haloChannels)
    (hdom : shadow.radialChannels < shadow.equatorialChannels) :
    let star := swapProjection shadow
    0 < CosmicOptimalDelta.totalObserverDelta optimal skyrms ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
          (CMBVisibilityBoundary.recombinationYears - 1) ∧
      visibleBudget star = visibleBudget shadow ∧
      starLike star ∧
      saturnLike shadow := by
  intro star
  rcases KnowabilitySplit.zero_exploration_still_leaves_pre_cmb_hidden
      optimal skyrms h_ge h_sum with ⟨hgap, hpre⟩
  refine ⟨hgap, hpre, ?_, ?_, ?_⟩
  · exact swap_projection_preserves_visible_budget shadow
  · exact swap_of_planet_like_is_star_like shadow hdom
  · exact positive_core_halo_equatorial_dominance_gives_saturn_like shadow hcore hhalo hdom

theorem positive_exploration_still_leaves_morphology_split
    (optimal skyrms exploration : Nat)
    (shadow : CelestialShadow)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration)
    (h_pos : 0 < exploration)
    (hcore : 0 < coreStages shadow)
    (hhalo : 0 < shadow.haloChannels)
    (hdom : shadow.radialChannels < shadow.equatorialChannels) :
    let star := swapProjection shadow
    CosmicOptimalDelta.visibilityDelta <
        CosmicOptimalDelta.totalObserverDelta optimal skyrms ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
          (CMBVisibilityBoundary.recombinationYears - 1) ∧
      visibleBudget star = visibleBudget shadow ∧
      starLike star ∧
      saturnLike shadow := by
  intro star
  rcases KnowabilitySplit.positive_exploration_still_leaves_pre_cmb_hidden
      optimal skyrms exploration h_ge h_sum h_pos with ⟨hgap, hpre⟩
  refine ⟨hgap, hpre, ?_, ?_, ?_⟩
  · exact swap_projection_preserves_visible_budget shadow
  · exact swap_of_planet_like_is_star_like shadow hdom
  · exact positive_core_halo_equatorial_dominance_gives_saturn_like shadow hcore hhalo hdom

theorem observer_gap_and_cmb_visibility_do_not_fix_fifty_four_d_morphology
    (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration) :
    CosmicOptimalDelta.totalObserverDelta optimal skyrms =
        CosmicOptimalDelta.visibilityDelta + exploration ∧
      CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        CMBVisibilityBoundary.recombinationYears ∧
      visibleBudget fiftyFourDStellarShadow = visibleBudget fiftyFourDSaturnShadow ∧
      starLike fiftyFourDStellarShadow ∧
      saturnLike fiftyFourDSaturnShadow := by
  rcases KnowabilitySplit.total_gap_split_with_visible_cmb
      optimal skyrms exploration h_ge h_sum with ⟨hgap, hcmb⟩
  refine ⟨hgap, hcmb, ?_, ?_, ?_⟩
  · unfold visibleBudget fiftyFourDStellarShadow fiftyFourDSaturnShadow
      DimensionalConfinement.rampUpTicksFromDimension
    native_decide
  · exact fifty_four_d_stellar_shadow_is_star_like
  · exact fifty_four_d_saturn_shadow_is_saturn_like

theorem cmb_boundary_does_not_fix_fifty_four_d_morphology :
    CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        CMBVisibilityBoundary.recombinationYears ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
          (CMBVisibilityBoundary.recombinationYears - 1) ∧
      visibleBudget fiftyFourDStellarShadow = visibleBudget fiftyFourDSaturnShadow ∧
      starLike fiftyFourDStellarShadow ∧
      saturnLike fiftyFourDSaturnShadow := by
  refine ⟨CMBVisibilityBoundary.cmb_visible_now,
    CMBVisibilityBoundary.pre_cmb_not_visible_now, ?_, ?_, ?_⟩
  · unfold visibleBudget fiftyFourDStellarShadow fiftyFourDSaturnShadow
      DimensionalConfinement.rampUpTicksFromDimension
    native_decide
  · exact fifty_four_d_stellar_shadow_is_star_like
  · exact fifty_four_d_saturn_shadow_is_saturn_like

end ForkRaceFoldTheorems
