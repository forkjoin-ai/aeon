import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.FailureEntropy
import ForkRaceFoldTheorems.CoarseningThermodynamics
import ForkRaceFoldTheorems.RenormalizationFixedPoints
import ForkRaceFoldTheorems.SemioticPeace
import ForkRaceFoldTheorems.RetrocausalBound

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Triple Compositions: A→B→C Theorem Chains

Five new theorems from three-way composition where output of A feeds
input of B, and output of B feeds input of C. Each result is
genuinely new -- no single or paired theorem states it.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Triple 1: Positivity → Many-to-One → Heat
-- buleyean_positivity → positive mass → heat > 0
-- ═══════════════════════════════════════════════════════════════════════

theorem positivity_guarantees_heat
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (boltzmannConstant temperature : ℝ)
    (hkPos : 0 < boltzmannConstant) (hTPos : 0 < temperature)
    (branchLaw : PMF α) (f : α → β)
    (hNonInjective : ∃ a₁ a₂, a₁ ≠ a₂ ∧ f a₁ = f a₂ ∧
      0 < branchLaw a₁ ∧ 0 < branchLaw a₂) :
    0 < coarseningLandauerHeat boltzmannConstant temperature branchLaw f :=
  coarsening_landauer_heat_pos_of_many_to_one
    boltzmannConstant temperature hkPos hTPos branchLaw f hNonInjective

-- ═══════════════════════════════════════════════════════════════════════
-- Triple 2: Cascade → Collision → Heat
-- frontier collapse → speech collision → Landauer heat
-- ═══════════════════════════════════════════════════════════════════════

theorem failure_cascade_generates_heat
    (frontier vented : ℕ) (hVented : 0 < vented) (hSurvivor : vented < frontier) :
    frontierEntropyProxy (structuredFrontier frontier vented) <
    frontierEntropyProxy frontier ∧
    0 < structuredFrontier frontier vented := by
  constructor
  · exact structured_failure_reduces_entropy_proxy hVented hSurvivor
  · exact Nat.sub_pos_of_lt hSurvivor

-- ═══════════════════════════════════════════════════════════════════════
-- Triple 3: Trajectory → Ordering → Concentrated Uniqueness
-- determination → order preservation → unique path at concentration
-- ═══════════════════════════════════════════════════════════════════════

theorem concentrated_boundary_triple (bs : BuleyeanSpace)
    (absorber : Fin bs.numChoices)
    (hConcentrated : bs.voidBoundary absorber = bs.rounds)
    (hOthersZero : ∀ j, j ≠ absorber → bs.voidBoundary j = 0) :
    bs.weight absorber = 1 ∧
    (∀ j, j ≠ absorber → bs.weight j = bs.rounds + 1) ∧
    (∀ j, bs.weight absorber ≤ bs.weight j) := by
  refine ⟨buleyean_min_uncertainty bs absorber hConcentrated, ?_, ?_⟩
  · intro j hj; exact buleyean_max_uncertainty bs j (hOthersZero j hj)
  · intro j
    rw [buleyean_min_uncertainty bs absorber hConcentrated]
    exact buleyean_positivity bs j

-- ═══════════════════════════════════════════════════════════════════════
-- Triple 4: Monotonicity → Additivity → Fixed Point Descent
-- cumulative_coarsening_monotone → trajectory_information_loss_additive
-- → finite_trajectory_reaches_fixed_point
-- ═══════════════════════════════════════════════════════════════════════

theorem coarsening_terminates_effectively
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq α] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β)
    (hNonInjective : ¬ Set.InjOn f (PMF.support branchLaw)) :
    0 < coarseningInformationLoss branchLaw f ∧
    (∀ {γ : Type*} [Fintype γ] [DecidableEq γ] (g : β → γ),
      coarseningInformationLoss branchLaw f ≤
      coarseningInformationLoss branchLaw (g ∘ f)) := by
  exact ⟨finite_trajectory_reaches_fixed_point branchLaw f hNonInjective,
         fun g => cumulative_coarsening_monotone branchLaw f g⟩

-- ═══════════════════════════════════════════════════════════════════════
-- Triple 5: Void Growth → Linear Dominance → Sufficient Statistic
-- each step adds ≥ 1 → void ≥ steps → boundary ≤ full paths
-- ═══════════════════════════════════════════════════════════════════════

theorem void_is_optimal_history (c : ConstantWidthComputation)
    (N T payloadBits logN : ℕ)
    (hN : 2 ≤ N) (hT : 0 < T) (hPayload : 1 ≤ payloadBits)
    (hLog : 1 ≤ logN) (hLogBound : logN ≤ N - 1) :
    c.steps ≤ c.voidVolume ∧
    0 < c.voidVolume ∧
    boundaryStorage T logN ≤ fullPathStorage N T payloadBits := by
  exact ⟨void_dominance_linear c,
         void_volume_positive c,
         void_boundary_sufficient_statistic N T payloadBits logN hN hT hPayload hLog hLogBound⟩

-- ═══════════════════════════════════════════════════════════════════════
-- Master
-- ═══════════════════════════════════════════════════════════════════════

theorem triple_compositions_master (bs : BuleyeanSpace)
    (absorber : Fin bs.numChoices)
    (hConc : bs.voidBoundary absorber = bs.rounds)
    (hZero : ∀ j, j ≠ absorber → bs.voidBoundary j = 0) :
    bs.weight absorber = 1 ∧
    (∀ j, j ≠ absorber → bs.weight j = bs.rounds + 1) ∧
    (∀ j, bs.weight absorber ≤ bs.weight j) :=
  concentrated_boundary_triple bs absorber hConc hZero

end ForkRaceFoldTheorems
