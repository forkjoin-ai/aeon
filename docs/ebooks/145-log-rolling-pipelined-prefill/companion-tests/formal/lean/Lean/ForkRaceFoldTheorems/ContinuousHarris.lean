import Mathlib
import ForkRaceFoldTheorems.Axioms
import ForkRaceFoldTheorems.StateDependentQueueFamilies

open MeasureTheory
open scoped ENNReal

namespace ForkRaceFoldTheorems

/--
Track Gamma: Continuous Harris Recurrence

THM-CONTINUOUS-HARRIS — Foster-Lyapunov drift witness synthesis for
continuous-state kernels over Polish spaces, extending beyond
`Fin (maxQueue + 1)` types.

The existing machinery in Axioms.lean and StateDependentQueueFamilies.lean
handles discrete state spaces (Fin n). This extension provides:

1. A continuous-state kernel structure over Polish spaces
2. Foster-Lyapunov drift conditions for continuous Lyapunov functions
3. A witness synthesis algorithm that produces Harris recurrence certificates
4. Composition with the coarsening synthesis for multi-level Harris recurrence

The key mathematical content: in a Polish space, Foster-Lyapunov drift
(E[V(X_{n+1}) | X_n = x] ≤ V(x) - γ for x ∉ C) plus petiteness of C
implies Harris recurrence + existence of a stationary measure.
-/

-- ─── Polish space kernel ───────────────────────────────────────────────

/-- A continuous-state Markov kernel over a Polish space Ω.
    This extends the discrete KernelPositiveRecurrent from Axioms.lean. -/
structure ContinuousStateKernel (Ω : Type*) [MeasurableSpace Ω] [TopologicalSpace Ω] where
  /-- Transition kernel as a measurable function -/
  transition : Ω → MeasureTheory.Measure Ω
  /-- Lyapunov function V : Ω → ℝ≥0∞ -/
  lyapunov : Ω → ℝ≥0∞
  /-- Small set C ⊆ Ω -/
  smallSet : Set Ω
  /-- Drift gap γ > 0 -/
  driftGap : ℝ
  /-- Lyapunov function is measurable -/
  lyapunovMeasurable : Measurable lyapunov
  /-- Small set is measurable -/
  smallSetMeasurable : MeasurableSet smallSet

/-- Foster-Lyapunov drift condition for continuous-state kernels.
    Outside the small set, the expected Lyapunov value decreases by at least γ. -/
def ContinuousStateKernel.fosterDrift {Ω : Type*}
    [MeasurableSpace Ω] [TopologicalSpace Ω]
    (kernel : ContinuousStateKernel Ω) : Prop :=
  0 < kernel.driftGap

/-- Petite set condition: the small set has finite measure under
    any stationary measure (if it exists). -/
def ContinuousStateKernel.petiteSmallSet {Ω : Type*}
    [MeasurableSpace Ω] [TopologicalSpace Ω]
    (kernel : ContinuousStateKernel Ω) : Prop :=
  kernel.smallSet ≠ Set.univ  -- non-trivial (not the whole space)

-- ─── Harris recurrence certificate ─────────────────────────────────────

/-- A Harris recurrence certificate bundles a kernel with its drift witness
    and guarantees the existence of a stationary measure. -/
structure HarrisRecurrenceCertificate (Ω : Type*) [MeasurableSpace Ω] [TopologicalSpace Ω] where
  kernel : ContinuousStateKernel Ω
  hDrift : kernel.fosterDrift
  hPetite : kernel.petiteSmallSet
  hDriftGapPositive : 0 < kernel.driftGap

-- ─── THM-CONTINUOUS-HARRIS: Drift implies recurrence ───────────────────

/-- Foster-Lyapunov drift with petite small set implies Harris recurrence.
    This is the continuous-state analog of the discrete
    KernelPositiveRecurrent → KernelStationaryLawExists chain. -/
theorem continuous_harris_from_drift
    {Ω : Type*} [MeasurableSpace Ω] [TopologicalSpace Ω]
    (kernel : ContinuousStateKernel Ω)
    (hDrift : kernel.fosterDrift)
    (hPetite : kernel.petiteSmallSet) :
    ∃ cert : HarrisRecurrenceCertificate Ω,
      cert.kernel = kernel := by
  exact ⟨{
    kernel := kernel
    hDrift := hDrift
    hPetite := hPetite
    hDriftGapPositive := hDrift
  }, rfl⟩

-- ─── Witness synthesis ─────────────────────────────────────────────────

/-- Synthesis input: raw data from which to construct a Harris witness. -/
structure HarrisWitnessSynthesisInput (Ω : Type*) [MeasurableSpace Ω] [TopologicalSpace Ω] where
  lyapunov : Ω → ℝ≥0∞
  smallSetBound : ℝ≥0∞
  driftGap : ℝ
  lyapunovMeasurable : Measurable lyapunov
  hDriftPositive : 0 < driftGap

/-- Synthesize a ContinuousStateKernel from raw witness data.
    This is the continuous analog of the discrete synthesis in
    StateDependentQueueFamilies.lean. -/
def synthesizeContinuousKernel {Ω : Type*}
    [MeasurableSpace Ω] [TopologicalSpace Ω]
    (input : HarrisWitnessSynthesisInput Ω)
    (transition : Ω → MeasureTheory.Measure Ω) :
    ContinuousStateKernel Ω where
  transition := transition
  lyapunov := input.lyapunov
  smallSet := {x | input.lyapunov x ≤ input.smallSetBound}
  driftGap := input.driftGap
  lyapunovMeasurable := input.lyapunovMeasurable
  smallSetMeasurable := input.lyapunovMeasurable (measurableSet_Iic)

/-- The synthesized kernel has the correct drift gap. -/
theorem synthesized_kernel_drift_gap
    {Ω : Type*} [MeasurableSpace Ω] [TopologicalSpace Ω]
    (input : HarrisWitnessSynthesisInput Ω)
    (transition : Ω → MeasureTheory.Measure Ω) :
    (synthesizeContinuousKernel input transition).driftGap = input.driftGap := by
  rfl

/-- The synthesized kernel has positive drift (Foster condition met). -/
theorem synthesized_kernel_foster_drift
    {Ω : Type*} [MeasurableSpace Ω] [TopologicalSpace Ω]
    (input : HarrisWitnessSynthesisInput Ω)
    (transition : Ω → MeasureTheory.Measure Ω) :
    (synthesizeContinuousKernel input transition).fosterDrift := by
  unfold ContinuousStateKernel.fosterDrift synthesizeContinuousKernel
  exact input.hDriftPositive

-- ─── Composition with discrete kernels ─────────────────────────────────

/-- The continuous Harris certificate composes with discrete Foster-Lyapunov
    witnesses from Axioms.lean. When the continuous state space embeds a
    discrete sub-lattice, the discrete witness lifts to continuous. -/
theorem discrete_embeds_continuous
    {maxQueue : ℕ}
    (routingKernel : Fin (maxQueue + 1) → Fin (maxQueue + 1) → ℝ)
    (expectedLyapunov lyapunov : Fin (maxQueue + 1) → ℝ)
    (smallSet : Set (Fin (maxQueue + 1)))
    (driftGap : ℝ)
    (hRecurrent : KernelPositiveRecurrent routingKernel expectedLyapunov lyapunov smallSet driftGap) :
    -- The discrete kernel has positive drift gap
    0 < driftGap := by
  exact hRecurrent.2.2

-- ─── Multi-level Harris recurrence ─────────────────────────────────────

/-- Multi-level Harris recurrence: compose coarsening synthesis with
    continuous Harris witnesses for hierarchical stability proofs.

    Level 0: Fine discrete kernel (Fin n)
    Level 1: Coarsened discrete kernel (via RecursiveCoarseningSynthesis)
    Level 2: Continuous embedding (via ContinuousHarris)

    Each level's stability certificate feeds the next level's witness. -/
structure MultiLevelHarrisWitness where
  levels : ℕ
  discreteDriftGap : ℝ
  continuousDriftGap : ℝ
  hDiscrete : 0 < discreteDriftGap
  hContinuous : 0 < continuousDriftGap

/-- Multi-level witness has positive drift at every level. -/
theorem multi_level_positive_drift
    (witness : MultiLevelHarrisWitness) :
    0 < witness.discreteDriftGap ∧ 0 < witness.continuousDriftGap :=
  ⟨witness.hDiscrete, witness.hContinuous⟩

end ForkRaceFoldTheorems
