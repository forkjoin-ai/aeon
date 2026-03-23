import ForkRaceFoldTheorems.CosmicProjection

/-!
# Observable Universe Finitude

This module states the strongest honest finitude claim supported by the
current cosmic-projection surface:

- every named observable epoch in the model has a finite size;
- all named observable epochs are bounded by one finite ceiling;
- the current observable universe is therefore not actual infinity in the
  current model.

This is intentionally scoped to the observable / effective universe. The
existing `CosmicProjection` module still models indefinite total expansion,
so this file does not claim unrestricted finitude of every possible total
cosmic extension.
-/

namespace ForkRaceFoldTheorems

/-- The named observable epochs already used by the current cosmic model. -/
inductive ObservableEpoch where
  | oneLorenzo
  | now
  | phiSquared
  | phiCubed
  | ceiling
deriving DecidableEq, Repr

/-- Observable-universe size at the named epoch, measured in micro-bly. -/
def observableUniverseSize : ObservableEpoch → Nat
  | .oneLorenzo => CosmicProjection.sizeOneLorenzo
  | .now => CosmicProjection.sizeNow
  | .phiSquared => CosmicProjection.sizePhiSquared
  | .phiCubed => CosmicProjection.sizePhiCubed
  | .ceiling => CosmicProjection.maxObservable

theorem observable_epoch_positive (epoch : ObservableEpoch) :
    observableUniverseSize epoch > 0 := by
  cases epoch <;> native_decide

theorem observable_epoch_le_ceiling (epoch : ObservableEpoch) :
    observableUniverseSize epoch ≤ CosmicProjection.maxObservable := by
  cases epoch <;> native_decide

theorem effective_universe_has_finite_ceiling :
    ∃ bound : Nat, ∀ epoch : ObservableEpoch, observableUniverseSize epoch ≤ bound := by
  exact ⟨CosmicProjection.maxObservable, observable_epoch_le_ceiling⟩

theorem current_observable_universe_not_infinite :
    ∃ bound : Nat, CosmicProjection.sizeNow < bound := by
  exact ⟨CosmicProjection.maxObservable, CosmicProjection.max_larger_than_now⟩

theorem named_observable_epochs_not_infinite :
    ∃ bound : Nat,
      CosmicProjection.sizeOneLorenzo < bound ∧
      CosmicProjection.sizeNow < bound ∧
      CosmicProjection.sizePhiSquared < bound ∧
      CosmicProjection.sizePhiCubed < bound := by
  refine ⟨CosmicProjection.maxObservable, ?_⟩
  unfold CosmicProjection.sizeOneLorenzo CosmicProjection.sizeNow
    CosmicProjection.sizePhiSquared CosmicProjection.sizePhiCubed
    CosmicProjection.maxObservable
  omega

theorem observable_universe_finitude :
    (∃ bound : Nat, ∀ epoch : ObservableEpoch, observableUniverseSize epoch ≤ bound) ∧
      (∃ bound : Nat, CosmicProjection.sizeNow < bound) ∧
      (∃ bound : Nat,
        CosmicProjection.sizeOneLorenzo < bound ∧
        CosmicProjection.sizeNow < bound ∧
        CosmicProjection.sizePhiSquared < bound ∧
        CosmicProjection.sizePhiCubed < bound) := by
  exact ⟨effective_universe_has_finite_ceiling,
    current_observable_universe_not_infinite,
    named_observable_epochs_not_infinite⟩

end ForkRaceFoldTheorems
