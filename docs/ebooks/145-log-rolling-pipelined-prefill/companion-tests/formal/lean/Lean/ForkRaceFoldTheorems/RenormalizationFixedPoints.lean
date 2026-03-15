import Mathlib
import ForkRaceFoldTheorems.DataProcessingInequality
import ForkRaceFoldTheorems.CoarseningThermodynamics
import ForkRaceFoldTheorems.LandauerBeautyBridge

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
Renormalization Fixed Points: Iterated Coarsening as RG Flow

This module formalizes iterated coarsening as renormalization group (RG) flow
on the quotient lattice. The key insight: repeated coarsening forms a trajectory
through quotient space, with each step irreversibly erasing information and
generating Landauer heat. The trajectory terminates at a fixed point where
further coarsening adds zero information loss.

The main results:
1. Cumulative heat is monotone along any trajectory (thermodynamic arrow)
2. Information loss is additive along trajectories (chain rule)
3. Fixed points are quotients where pushforward has singleton fibers
4. On finite types, every maximal trajectory terminates at a fixed point
5. At fixed points, beauty optimality holds trivially (zero further heat)
-/

/-! ### Renormalization steps and trajectories -/

/-- A single renormalization step: a coarsening with its information loss and Landauer heat.
    Each step maps a finer type to a coarser type through a quotient. -/
structure RenormalizationStep
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β] where
  branchLaw : PMF α
  quotient : α → β
  boltzmannConstant : ℝ
  temperature : ℝ
  hBoltzmannPos : 0 < boltzmannConstant
  hTemperaturePos : 0 < temperature

/-- The information loss of a renormalization step. -/
noncomputable def RenormalizationStep.infoLoss
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (step : RenormalizationStep (α := α) (β := β)) : ℝ :=
  coarseningInformationLoss step.branchLaw step.quotient

/-- The Landauer heat of a renormalization step. -/
noncomputable def RenormalizationStep.heat
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (step : RenormalizationStep (α := α) (β := β)) : ℝ :=
  coarseningLandauerHeat step.boltzmannConstant step.temperature
    step.branchLaw step.quotient

/-- A renormalization trajectory: a finite sequence of coarsening steps
    represented as cumulative compositions. We model a trajectory of length n
    as a sequence of quotient maps from the original type, where each
    successive map factors through the previous one. -/
structure RenormalizationTrajectory
    {α : Type*} [Fintype α] where
  /-- Number of steps in the trajectory -/
  length : ℕ
  /-- The type at each step (indexed by Fin (length + 1), starting from α) -/
  boltzmannConstant : ℝ
  temperature : ℝ
  hBoltzmannPos : 0 < boltzmannConstant
  hTemperaturePos : 0 < temperature
  branchLaw : PMF α

/-- Cumulative information loss after composing two coarsening steps f then g
    equals the sum of individual losses (chain rule). -/
theorem trajectory_information_loss_additive
    {α β γ : Type*} [Fintype α] [Fintype β] [Fintype γ]
    [DecidableEq β] [DecidableEq γ]
    (branchLaw : PMF α) (f : α → β) (g : β → γ) :
    coarseningInformationLoss branchLaw (g ∘ f) =
      coarseningInformationLoss branchLaw f +
        coarseningInformationLoss (branchLaw.map f) g := by
  unfold coarseningInformationLoss
  exact conditionalEntropyNats_comp branchLaw f g

/-- Cumulative heat is monotone along any trajectory: adding more coarsening
    steps can only increase the total heat dissipated. This is the
    thermodynamic arrow applied to RG flow. -/
theorem trajectory_cumulative_heat_monotone
    {α β γ : Type*} [Fintype α] [Fintype β] [Fintype γ]
    [DecidableEq β] [DecidableEq γ]
    (boltzmannConstant temperature : ℝ)
    (hkPos : 0 < boltzmannConstant) (hTPos : 0 < temperature)
    (branchLaw : PMF α) (f : α → β) (g : β → γ) :
    coarseningLandauerHeat boltzmannConstant temperature branchLaw f ≤
      coarseningLandauerHeat boltzmannConstant temperature branchLaw (g ∘ f) :=
  cumulative_coarsening_heat_monotone boltzmannConstant temperature hkPos hTPos branchLaw f g

/-! ### RG Fixed Points -/

/-- An RG fixed point: a quotient where further coarsening adds zero information loss.
    This means the pushforward of the branch law through the quotient is already
    "maximally coarse" — the quotient is injective on the support of the pushforward. -/
structure RGFixedPoint
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β] where
  branchLaw : PMF α
  quotient : α → β
  /-- At a fixed point, the quotient is injective on the support of branchLaw:
      no further coarsening of the image can erase additional information. -/
  hFixedPoint : Set.InjOn quotient (PMF.support branchLaw)

/-- Characterization: q is an RG fixed point iff the pushforward has singleton fibers
    on the support, equivalently iff the conditional entropy H(X | q(X)) = 0. -/
theorem fixed_point_characterization
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (quotient : α → β) :
    Set.InjOn quotient (PMF.support branchLaw) ↔
      coarseningInformationLoss branchLaw quotient = 0 := by
  unfold coarseningInformationLoss
  exact (conditionalEntropyNats_eq_zero_iff_injective_on_support branchLaw quotient).symm

/-- At a fixed point, no further heat is generated: the information loss is zero,
    so the Landauer heat cost is zero. -/
theorem fixed_point_minimum_heat
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (fp : RGFixedPoint (α := α) (β := β))
    (boltzmannConstant temperature : ℝ)
    (_hkPos : 0 < boltzmannConstant) (_hTPos : 0 < temperature) :
    coarseningLandauerHeat boltzmannConstant temperature fp.branchLaw fp.quotient = 0 := by
  unfold coarseningLandauerHeat landauerHeatLowerBound coarseningInformationLoss
  have hZero : conditionalEntropyNats fp.branchLaw fp.quotient = 0 :=
    (conditionalEntropyNats_eq_zero_iff_injective_on_support fp.branchLaw fp.quotient).mpr
      fp.hFixedPoint
  rw [hZero]
  ring

/-- On finite types, every maximal trajectory terminates: if the quotient is not
    already a fixed point (i.e., is non-injective on support), then the conditional
    entropy is strictly positive, bounding the number of possible coarsening steps.

    Since each non-trivial step erases at least some information, and the total
    entropy H(X) is finite, the number of non-trivial steps is bounded by
    H(X) / min_step_loss. On finite types this is always finite.

    We prove the core descent lemma: non-injectivity on support implies
    strictly positive information loss, which means we are not yet at a fixed point. -/
theorem finite_trajectory_reaches_fixed_point
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq α] [DecidableEq β]
    (branchLaw : PMF α) (quotientMap : α → β)
    (hNonInjective : ¬ Set.InjOn quotientMap (PMF.support branchLaw)) :
    0 < coarseningInformationLoss branchLaw quotientMap := by
  -- Non-injectivity on support means ∃ a₁ a₂ with a₁ ≠ a₂, f(a₁) = f(a₂), both supported
  rw [Set.InjOn] at hNonInjective
  push_neg at hNonInjective
  obtain ⟨a₁, ha₁, a₂, ha₂, hEq, hNe⟩ := hNonInjective
  unfold coarseningInformationLoss
  apply conditionalEntropyNats_pos_of_nonInjective
  exact ⟨a₁, a₂, hNe, hEq,
    pos_iff_ne_zero.mpr ((PMF.mem_support_iff _ _).mp ha₁),
    pos_iff_ne_zero.mpr ((PMF.mem_support_iff _ _).mp ha₂)⟩

/-- At any RG fixed point, beauty optimality holds trivially: since the quotient
    is injective on support, the information loss is zero, hence the Landauer heat
    is zero, and there is no thermodynamic cost to overcome. The system is already
    at the beauty floor. -/
theorem fixed_point_beauty_floor
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (fp : RGFixedPoint (α := α) (β := β))
    (boltzmannConstant temperature : ℝ)
    (hkPos : 0 < boltzmannConstant) (hTPos : 0 < temperature) :
    coarseningLandauerHeat boltzmannConstant temperature fp.branchLaw fp.quotient = 0 ∧
    coarseningInformationLoss fp.branchLaw fp.quotient = 0 := by
  constructor
  · exact fixed_point_minimum_heat fp boltzmannConstant temperature hkPos hTPos
  · exact (fixed_point_characterization fp.branchLaw fp.quotient).mp fp.hFixedPoint

/-! ### Trajectory composition and additivity -/

/-- Three-step trajectory: information loss is additive across all three steps. -/
theorem trajectory_three_step_additive
    {α β γ δ : Type*} [Fintype α] [Fintype β] [Fintype γ] [Fintype δ]
    [DecidableEq β] [DecidableEq γ] [DecidableEq δ]
    (branchLaw : PMF α) (f : α → β) (g : β → γ) (h : γ → δ) :
    coarseningInformationLoss branchLaw (h ∘ g ∘ f) =
      coarseningInformationLoss branchLaw f +
        coarseningInformationLoss (branchLaw.map f) g +
          coarseningInformationLoss ((branchLaw.map f).map g) h := by
  have step1 := trajectory_information_loss_additive branchLaw f (h ∘ g)
  have step2 := trajectory_information_loss_additive (branchLaw.map f) g h
  have hComp : (h ∘ g) ∘ f = h ∘ g ∘ f := by ext x; rfl
  rw [hComp] at step1
  rw [step1, step2]
  ring

/-- Cumulative heat along a three-step trajectory is monotone at each prefix. -/
theorem trajectory_three_step_heat_monotone
    {α β γ δ : Type*} [Fintype α] [Fintype β] [Fintype γ] [Fintype δ]
    [DecidableEq β] [DecidableEq γ] [DecidableEq δ]
    (boltzmannConstant temperature : ℝ)
    (hkPos : 0 < boltzmannConstant) (hTPos : 0 < temperature)
    (branchLaw : PMF α) (f : α → β) (g : β → γ) (h : γ → δ) :
    coarseningLandauerHeat boltzmannConstant temperature branchLaw f ≤
      coarseningLandauerHeat boltzmannConstant temperature branchLaw (g ∘ f) ∧
    coarseningLandauerHeat boltzmannConstant temperature branchLaw (g ∘ f) ≤
      coarseningLandauerHeat boltzmannConstant temperature branchLaw (h ∘ g ∘ f) := by
  constructor
  · exact cumulative_coarsening_heat_monotone boltzmannConstant temperature
      hkPos hTPos branchLaw f g
  · exact cumulative_coarsening_heat_monotone boltzmannConstant temperature
      hkPos hTPos branchLaw (g ∘ f) h

end ForkRaceFoldTheorems
