import ForkRaceFoldTheorems.ExplorationIdentity
import ForkRaceFoldTheorems.CosmicProjection

/-!
# Cosmic Optimal Delta

This module makes one narrow bridge explicit.

On the compiler side, `ExplorationIdentity` proves that the literal
gap between the computable Skyrms equilibrium and the unknown optimum is

  `skyrms - optimal = exploration`.

On the cosmology side, `CosmicProjection` gives a bounded observable
surface:

  `visibilityDelta = maxObservable - sizeNow`.

The combined observer gap is the sum of these two deltas:

  `totalObserverDelta = visibilityDelta + optimalDelta`.

This is intentionally weaker than a full cosmology theorem about the CMB.
It only states the accounting identity that combines the compiler-side
optimality gap with the cosmic observable-horizon gap.
-/

namespace CosmicOptimalDelta

/-- The literal optimality delta from the compiler accounting surface. -/
def optimalDelta (optimal skyrms : Nat) : Nat :=
  skyrms - optimal

/-- The cosmic visibility delta: what lies beyond the current observable
surface in the `CosmicProjection` model. -/
def visibilityDelta : Nat :=
  CosmicProjection.maxObservable - CosmicProjection.sizeNow

/-- The combined observer delta: what remains beyond the current
computable equilibrium plus what remains beyond the current visible
universe. -/
def totalObserverDelta (optimal skyrms : Nat) : Nat :=
  visibilityDelta + optimalDelta optimal skyrms

/-- The literal compiler theorem: the optimality delta is exactly the
exploration budget. -/
theorem optimal_delta_eq_exploration
    (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration) :
    optimalDelta optimal skyrms = exploration := by
  unfold optimalDelta
  exact ExplorationIdentity.the_identity optimal skyrms exploration h_ge h_sum

/-- The cosmic visibility delta is strictly positive in the current
projection: the observable bound exceeds the currently observed size. -/
theorem visibility_delta_positive : 0 < visibilityDelta := by
  unfold visibilityDelta
  exact Nat.sub_pos_of_lt CosmicProjection.max_larger_than_now

/-- The total observer delta splits exactly into the cosmic visibility
gap plus the exploration budget. -/
theorem total_observer_delta_eq_visibility_plus_exploration
    (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration) :
    totalObserverDelta optimal skyrms = visibilityDelta + exploration := by
  unfold totalObserverDelta
  rw [optimal_delta_eq_exploration optimal skyrms exploration h_ge h_sum]

/-- Even when exploration has dropped to zero, a positive cosmic
visibility gap remains. The compiler can close its local exploration
budget without exhausting the observable horizon. -/
theorem zero_exploration_still_leaves_cosmic_gap
    (optimal skyrms : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + 0) :
    0 < totalObserverDelta optimal skyrms := by
  rw [total_observer_delta_eq_visibility_plus_exploration optimal skyrms 0 h_ge h_sum]
  simpa using visibility_delta_positive

/-- Positive exploration strictly enlarges the combined observer gap
above the cosmic visibility floor. -/
theorem positive_exploration_strictly_increases_total_gap
    (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration)
    (h_pos : 0 < exploration) :
    visibilityDelta < totalObserverDelta optimal skyrms := by
  rw [total_observer_delta_eq_visibility_plus_exploration optimal skyrms exploration h_ge h_sum]
  omega

end CosmicOptimalDelta
