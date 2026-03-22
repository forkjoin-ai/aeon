import ForkRaceFoldTheorems.CosmicOptimalDelta
import ForkRaceFoldTheorems.CMBVisibilityBoundary

/-!
# Knowability Split

This module packages the split between two different limits.

- `CosmicOptimalDelta` tracks the epistemic delta between the computable
  Skyrms equilibrium and the unknown optimum, plus the broader cosmic
  visibility floor.
- `CMBVisibilityBoundary` tracks the photon observation cutoff at last
  scattering.

The combined message is narrow but useful: even when local exploration
has fallen to zero, a visibility boundary remains, and the CMB surface
is still only the earliest photon-visible shell rather than total
cosmic knowledge.
-/

namespace KnowabilitySplit

/-- Zero exploration still leaves two independent witnesses of
unknowability: the positive observer gap and the pre-CMB photon
boundary. -/
theorem zero_exploration_still_leaves_pre_cmb_hidden
    (optimal skyrms : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + 0) :
    0 < CosmicOptimalDelta.totalObserverDelta optimal skyrms ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        (CMBVisibilityBoundary.recombinationYears - 1) := by
  exact ⟨
    CosmicOptimalDelta.zero_exploration_still_leaves_cosmic_gap optimal skyrms h_ge h_sum,
    CMBVisibilityBoundary.pre_cmb_not_visible_now
  ⟩

/-- The last-scattering shell is visible while the immediately earlier
epoch is not, so the photon boundary is a genuine cutoff. -/
theorem cmb_boundary_witness :
    CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        CMBVisibilityBoundary.recombinationYears ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        (CMBVisibilityBoundary.recombinationYears - 1) := by
  exact ⟨
    CMBVisibilityBoundary.cmb_visible_now,
    CMBVisibilityBoundary.pre_cmb_not_visible_now
  ⟩

/-- The total observer gap still splits into visibility plus
exploration even when the CMB surface is simultaneously visible. -/
theorem total_gap_split_with_visible_cmb
    (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration) :
    CosmicOptimalDelta.totalObserverDelta optimal skyrms =
        CosmicOptimalDelta.visibilityDelta + exploration ∧
      CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        CMBVisibilityBoundary.recombinationYears := by
  exact ⟨
    CosmicOptimalDelta.total_observer_delta_eq_visibility_plus_exploration
      optimal skyrms exploration h_ge h_sum,
    CMBVisibilityBoundary.cmb_visible_now
  ⟩

/-- Positive exploration enlarges the total observer gap, but it does
not dissolve the pre-CMB visibility cutoff. -/
theorem positive_exploration_still_leaves_pre_cmb_hidden
    (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration)
    (h_pos : 0 < exploration) :
    CosmicOptimalDelta.visibilityDelta <
        CosmicOptimalDelta.totalObserverDelta optimal skyrms ∧
      ¬ CMBVisibilityBoundary.standardPhotonVisibilityModel.telescopeObservable
        (CMBVisibilityBoundary.recombinationYears - 1) := by
  exact ⟨
    CosmicOptimalDelta.positive_exploration_strictly_increases_total_gap
      optimal skyrms exploration h_ge h_sum h_pos,
    CMBVisibilityBoundary.pre_cmb_not_visible_now
  ⟩

end KnowabilitySplit
