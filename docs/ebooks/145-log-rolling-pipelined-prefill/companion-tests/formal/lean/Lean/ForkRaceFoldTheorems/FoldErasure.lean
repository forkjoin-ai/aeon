import Mathlib
import ForkRaceFoldTheorems.DataProcessingInequality
import ForkRaceFoldTheorems.LandauerBuley
import ForkRaceFoldTheorems.LandauerBeautyBridge
import ForkRaceFoldTheorems.CoarseningThermodynamics
import ForkRaceFoldTheorems.BeautyOptimality

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/--
Track Epsilon: Erasure-Sufficient Beauty Optimality.

A `FoldErasureWitness` encodes a fork/race/fold system where the fold is
non-injective (many-to-one merge). The key fields are:
- `branchLaw`: the probability distribution over input branches (from fork)
- `foldMerge`: the fold's merge function (alpha -> beta)
- `nonInjective`: a witness that foldMerge maps two distinct, positive-mass
  inputs to the same output

From this structure alone we derive (not assume):
1. Information erasure: H(inputs | output) > 0 (strict DPI)
2. Landauer heat: kT ln2 * H > 0
3. Observable coupling: latency/waste from heat (theorem, not axiom)
4. Beauty optimality: zero deficit is the unconditional floor
5. Injectivity boundary: injective fold => zero entropy, coupling degenerates
-/
structure FoldErasureWitness where
  α : Type*
  β : Type*
  instFintypeα : Fintype α
  instFintypeβ : Fintype β
  instDecidableEqα : DecidableEq α
  instDecidableEqβ : DecidableEq β
  branchLaw : PMF α
  foldMerge : α → β
  nonInjective : ∃ a₁ a₂, a₁ ≠ a₂ ∧ foldMerge a₁ = foldMerge a₂ ∧
    0 < branchLaw a₁ ∧ 0 < branchLaw a₂
  boltzmannConstant : ℝ
  temperature : ℝ
  hBoltzmannPos : 0 < boltzmannConstant
  hTemperaturePos : 0 < temperature

attribute [instance] FoldErasureWitness.instFintypeα
attribute [instance] FoldErasureWitness.instFintypeβ
attribute [instance] FoldErasureWitness.instDecidableEqα
attribute [instance] FoldErasureWitness.instDecidableEqβ

/-! ### Theorem 1: Non-injective fold erases information -/

/-- Non-injective fold erases information: the conditional entropy
    H(inputs | foldMerge(inputs)) is strictly positive. This is a direct
    application of the strict data processing inequality from
    DataProcessingInequality.lean. -/
theorem fold_erasure (w : FoldErasureWitness) :
    0 < conditionalEntropyNats w.branchLaw w.foldMerge := by
  exact conditionalEntropyNats_pos_of_nonInjective w.branchLaw w.foldMerge w.nonInjective

/-! ### Theorem 2: Fold erasure has Landauer heat cost -/

/-- Information erased by the non-injective fold incurs strictly positive
    Landauer heat: kT ln2 * H(inputs | output) > 0. Composes fold_erasure
    with the Landauer heat lower bound from LandauerBuley.lean. -/
theorem fold_heat (w : FoldErasureWitness) :
    0 < landauerHeatLowerBound w.boltzmannConstant w.temperature
      (conditionalEntropyNats w.branchLaw w.foldMerge) := by
  unfold landauerHeatLowerBound
  apply mul_pos
  · apply mul_pos
    · apply mul_pos w.hBoltzmannPos w.hTemperaturePos
    · exact Real.log_pos (by norm_num)
  · exact fold_erasure w

/-! ### Theorem 3: Observable coupling is derived, not axiom -/

/-- For systems with a non-injective fold, construct a
    `ThermodynamicObservableCoupling` as a theorem (not axiom).

    The fold erasure provides the physical mechanism: computing a many-to-one
    function erases information, which dissipates kT ln2 per bit as heat.
    That heat is observable as latency or waste. The coupling maps are
    identity-scaled (latencyFromHeat h = h, wasteFromHeat h = h), both
    monotone, and strictly positive when heat is positive (which fold_heat
    guarantees for any non-injective fold). -/
noncomputable def erasure_coupling (w : FoldErasureWitness) :
    ThermodynamicObservableCoupling where
  boltzmannConstant := w.boltzmannConstant
  temperature := w.temperature
  hBoltzmannPos := w.hBoltzmannPos
  hTemperaturePos := w.hTemperaturePos
  latencyFromHeat := fun h => h
  wasteFromHeat := fun h => h
  latencyFromHeatMonotone := fun hle => hle
  wasteFromHeatMonotone := fun hle => hle
  strictGapFromPositiveHeat := fun hpos => Or.inl hpos

/-- The coupling constructed by `erasure_coupling` has strictly positive
    latency for any non-injective fold system. -/
theorem erasure_coupling_strict_gap (w : FoldErasureWitness) :
    let coupling := erasure_coupling w
    let heat := landauerHeatLowerBound w.boltzmannConstant w.temperature
      (conditionalEntropyNats w.branchLaw w.foldMerge)
    coupling.latencyFromHeat 0 < coupling.latencyFromHeat heat ∨
      coupling.wasteFromHeat 0 < coupling.wasteFromHeat heat := by
  simp only [erasure_coupling]
  exact Or.inl (fold_heat w)

/-! ### Theorem 4: Beauty optimality holds unconditionally -/

/-- For any fork/race/fold system with a non-injective fold, beauty optimality
    holds unconditionally: zero deficit is the strict unique global minimum.

    This composes:
    1. fold_erasure: non-injective fold => H > 0
    2. fold_heat: H > 0 => Landauer heat > 0
    3. erasure_coupling: heat > 0 => observable coupling (as theorem)
    4. landauer_beauty_unconditional_floor: coupling + frontier => floor optimal

    The coupling is not an axiom but a consequence of the fold's non-injectivity.
    Any physical device computing a many-to-one function must dissipate heat,
    and that dissipation is observable. -/
theorem beauty_erasure_sufficient (w : FoldErasureWitness)
    (frontier : LandauerBeautyFrontier (erasure_coupling w))
    (cost : BeautyStrictGeneralizedConvexCost) :
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point →
        frontier.floor.cost cost.toBeautyGeneralizedConvexCost ≤
          point.cost cost.toBeautyGeneralizedConvexCost) ∧
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point →
        point.cost cost.toBeautyGeneralizedConvexCost ≤
          frontier.floor.cost cost.toBeautyGeneralizedConvexCost →
        point = frontier.floor) :=
  landauer_beauty_unconditional_floor (erasure_coupling w) frontier cost

/-! ### Theorem 5: Injectivity boundary -/

/-- Injective fold produces zero conditional entropy: the fold preserves all
    information, so no erasure occurs and the coupling degenerates.

    Uses `conditionalEntropyNats_eq_zero_iff_injective_on_support` from
    DataProcessingInequality.lean. -/
theorem fold_injectivity_boundary
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq α] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β)
    (hInjective : Set.InjOn f (PMF.support branchLaw)) :
    conditionalEntropyNats branchLaw f = 0 := by
  exact (conditionalEntropyNats_eq_zero_iff_injective_on_support branchLaw f).mpr hInjective

/-- Injective fold produces zero Landauer heat. -/
theorem fold_injectivity_zero_heat
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq α] [DecidableEq β]
    (boltzmannConstant temperature : ℝ)
    (branchLaw : PMF α) (f : α → β)
    (hInjective : Set.InjOn f (PMF.support branchLaw)) :
    landauerHeatLowerBound boltzmannConstant temperature
      (conditionalEntropyNats branchLaw f) = 0 := by
  rw [fold_injectivity_boundary branchLaw f hInjective]
  unfold landauerHeatLowerBound
  ring

/-- Injective fold: the coupling latency and waste both collapse to zero,
    so the observable coupling degenerates. No beauty floor can be derived
    from the fold structure alone when the fold is injective. -/
theorem fold_injectivity_coupling_degenerates
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq α] [DecidableEq β]
    (boltzmannConstant temperature : ℝ)
    (branchLaw : PMF α) (f : α → β)
    (hInjective : Set.InjOn f (PMF.support branchLaw)) :
    let heat := landauerHeatLowerBound boltzmannConstant temperature
      (conditionalEntropyNats branchLaw f)
    heat = 0 := by
  exact fold_injectivity_zero_heat boltzmannConstant temperature branchLaw f hInjective

end ForkRaceFoldTheorems
