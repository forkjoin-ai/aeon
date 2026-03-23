import ForkRaceFoldTheorems.BlackHoleVoidSingularity
import ForkRaceFoldTheorems.BuleyeanLogic
import ForkRaceFoldTheorems.CelestialSurveySearch
import ForkRaceFoldTheorems.NestedWallingtonTower
import ForkRaceFoldTheorems.ObservableUniverseFinite
import ForkRaceFoldTheorems.WallingtonSurfaceAdmissibility
import ForkRaceFoldTheorems.KnowabilitySplit

/-!
# Knowable Universe Map

This module closes the current bounded atlas into one theorem surface.

The map is intentionally "knowable" rather than total:

- the observable cosmic epochs sit under one finite ceiling;
- the photon boundary starts at recombination, so pre-CMB epochs are hidden to
  telescope observation;
- the visible ambient slice has the unique best admissible Wallington surface;
- the local Russian-doll packet ladder is certified only up to the current
  two-level photon placement and the explicit three-rung ladder inside the
  ten-level envelope;
- the base `1 -> 0` edge exposes the sliver/proof-step bridge explicitly;
- the base `1 -> 0` edge exposes the Buleyean logic/sliver bridge explicitly;
- the survey packet family and the black-hole monad touchpoint are both placed
  on that bounded map.

The file does not claim total cosmic omniscience. It packages the current
finite observable atlas together with the local certified placement rules.
-/

namespace ForkRaceFoldTheorems

/-- The current bounded map of the knowable universe, parameterized by the
explicit black-hole witness model used by the global monad-touchpoint theorem.
-/
def knowableUniverseMap (m : AstrophysicalBlackHoleModel) : Prop :=
  (∃ bound : Nat, ∀ epoch : ObservableEpoch, observableUniverseSize epoch ≤ bound) ∧
    0 < CosmicOptimalDelta.visibilityDelta ∧
    CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
      CMBVisibilityBoundary.recombinationYears ∧
    ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
      (CMBVisibilityBoundary.recombinationYears - 1) ∧
    bestAdmissibleWallingtonSurface ourVisibleAmbientDimension 2 ∧
    localizedPhotonPacketLevels = 2 ∧
    initialCertifiedWallingtonLadderDepth = 3 ∧
    nestedWallingtonEnvelope 10 = 10 ∧
    initialCertifiedWallingtonLadderDepth < nestedWallingtonEnvelope 10 ∧
    visibleTorusRank 1 = 0 ∧
    visibleTorusRank 1 + 1 = 1 ∧
    0 < visibleTorusRank 1 + 1 ∧
    bReject (visibleTorusRank 1 + 1) = visibleTorusRank 1 ∧
    searchPlanetCandidates demoSurvey =
      [observedPhotonDemo, observedRockyDemo, observedDiffuseDemo,
        observedHaloLockedDemo, observedSuperDemo] ∧
    (∀ node,
      m.boundaryRejections node = m.boundaryRejections .monad →
        node = .monad)

theorem finite_cosmic_ceiling_witness :
    ∃ bound : Nat, ∀ epoch : ObservableEpoch, observableUniverseSize epoch ≤ bound := by
  exact effective_universe_has_finite_ceiling

theorem present_photon_cutoff_witness :
    CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        CMBVisibilityBoundary.recombinationYears ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        (CMBVisibilityBoundary.recombinationYears - 1) := by
  exact KnowabilitySplit.cmb_boundary_witness

theorem visible_ambient_has_best_surface_witness :
    bestAdmissibleWallingtonSurface ourVisibleAmbientDimension 2 := by
  exact three_d_slice_has_two_torus_as_best_admissible_surface

theorem base_zero_rung_exposes_sliver_logic_bridge :
    visibleTorusRank 1 = 0 ∧
      visibleTorusRank 1 + 1 = 1 ∧
      0 < visibleTorusRank 1 + 1 ∧
      bReject (visibleTorusRank 1 + 1) = visibleTorusRank 1 := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · unfold visibleTorusRank
    native_decide
  · unfold visibleTorusRank
    native_decide
  · unfold visibleTorusRank
    native_decide
  · unfold visibleTorusRank bReject
    native_decide

theorem local_wallington_ladder_witness :
    localizedPhotonPacketLevels = 2 ∧
      initialCertifiedWallingtonLadderDepth = 3 ∧
      nestedWallingtonEnvelope 10 = 10 ∧
      initialCertifiedWallingtonLadderDepth < nestedWallingtonEnvelope 10 := by
  exact ⟨localized_photon_packet_certifies_two_levels,
    initial_certified_wallington_ladder_is_three_levels,
    ten_mode_nested_wallington_envelope_is_ten,
    initial_three_rung_ladder_sits_inside_ten_mode_envelope⟩

theorem survey_packet_map_witness :
    searchPlanetCandidates demoSurvey =
      [observedPhotonDemo, observedRockyDemo, observedDiffuseDemo,
        observedHaloLockedDemo, observedSuperDemo] := by
  exact search_keeps_math_candidates_and_drops_noise

theorem black_hole_monad_map_witness (m : AstrophysicalBlackHoleModel) :
    ∀ node,
      m.boundaryRejections node = m.boundaryRejections .monad →
        node = .monad := by
  exact astrophysical_black_hole_is_monad_touchpoint m

/-- Master atlas theorem: the current mechanized surface determines a bounded
map of the knowable universe. -/
theorem current_knowable_universe_map (m : AstrophysicalBlackHoleModel) :
    knowableUniverseMap m := by
  refine ⟨finite_cosmic_ceiling_witness,
    CosmicOptimalDelta.visibility_delta_positive,
    present_photon_cutoff_witness.1,
    present_photon_cutoff_witness.2,
    visible_ambient_has_best_surface_witness,
    localized_photon_packet_certifies_two_levels,
    initial_certified_wallington_ladder_is_three_levels,
    ten_mode_nested_wallington_envelope_is_ten,
    initial_three_rung_ladder_sits_inside_ten_mode_envelope,
    base_zero_rung_exposes_sliver_logic_bridge.1,
    base_zero_rung_exposes_sliver_logic_bridge.2.1,
    base_zero_rung_exposes_sliver_logic_bridge.2.2.1,
    base_zero_rung_exposes_sliver_logic_bridge.2.2.2,
    survey_packet_map_witness,
    black_hole_monad_map_witness m⟩

end ForkRaceFoldTheorems
