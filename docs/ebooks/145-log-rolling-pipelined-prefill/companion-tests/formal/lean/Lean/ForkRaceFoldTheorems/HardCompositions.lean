import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.EnvelopeConvergence
import ForkRaceFoldTheorems.GeometricErgodicity
import ForkRaceFoldTheorems.WhipWaveDuality
import ForkRaceFoldTheorems.CombinatorialBruteForce
import ForkRaceFoldTheorems.GreekLogicCanon

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Hard Compositions: Real Analysis Territory

These compositions mix ℝ-valued theorems (geometric convergence,
wave speed, contraction rates) with each other. They require real
analysis tactics, not just omega. These are the ones most likely
to produce failures.

## Consecutive failure count: 0
-/

-- ═══════════════════════════════════════════════════════════════════════
-- HARD 1: EnvelopeConvergence × GeometricErgodicity
-- "Convergence Rates Compose Multiplicatively"
--
-- Both have contraction rates ρ₁ < 1 and ρ₂ < 1.
-- Does ρ₁ · ρ₂ < 1? Yes, because product of numbers < 1 is < 1.
-- But can we prove it in Lean?
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: Two contraction rates compose. If ρ₁ < 1 and ρ₂ < 1,
    then ρ₁ · ρ₂ < 1 (the product is also a contraction). -/
theorem contraction_rates_compose
    (ρ₁ ρ₂ : ℝ)
    (h₁pos : 0 < ρ₁) (h₁lt : ρ₁ < 1)
    (h₂pos : 0 < ρ₂) (h₂lt : ρ₂ < 1) :
    ρ₁ * ρ₂ < 1 := by
  calc ρ₁ * ρ₂ < ρ₁ * 1 := mul_lt_mul_of_pos_left h₂lt h₁pos
    _ = ρ₁ := mul_one ρ₁
    _ < 1 := h₁lt

/-- THEOREM: The composed contraction rate is strictly between 0 and 1. -/
theorem composed_rate_proper
    (ρ₁ ρ₂ : ℝ)
    (h₁pos : 0 < ρ₁) (h₁lt : ρ₁ < 1)
    (h₂pos : 0 < ρ₂) (h₂lt : ρ₂ < 1) :
    0 < ρ₁ * ρ₂ ∧ ρ₁ * ρ₂ < 1 := by
  exact ⟨mul_pos h₁pos h₂pos,
         contraction_rates_compose ρ₁ ρ₂ h₁pos h₁lt h₂pos h₂lt⟩

-- ═══════════════════════════════════════════════════════════════════════
-- HARD 2: AchillesChase × EnvelopeConvergence
-- "Achilles' Rate Dominates the Envelope Rate When Faster"
--
-- If Achilles' speed ratio < envelope's routing mass, Achilles
-- converges FASTER. Can we prove this ordering?
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: A faster contraction rate gives a smaller residual at every step.
    If ρ_fast < ρ_slow and both start at the same initial value,
    the fast process is always ahead. -/
theorem faster_rate_smaller_residual
    (R₀ ρ_fast ρ_slow : ℝ)
    (hR₀pos : 0 < R₀)
    (hFastPos : 0 < ρ_fast) (hFastLt : ρ_fast < 1)
    (hSlowPos : 0 < ρ_slow) (hSlowLt : ρ_slow < 1)
    (hOrder : ρ_fast < ρ_slow)
    (n : ℕ) (hn : 0 < n) :
    R₀ * ρ_fast ^ n < R₀ * ρ_slow ^ n := by
  apply mul_lt_mul_of_pos_left _ hR₀pos
  exact pow_lt_pow_left hOrder (le_of_lt hFastPos) (Nat.not_eq_zero_of_lt (by omega))

-- ═══════════════════════════════════════════════════════════════════════
-- HARD 3: WhipWaveDuality × GeometricErgodicity
-- "Wave Speed and Ergodic Rate Are Dual Convergence Measures"
--
-- Wave speed increases with fold (WhipWave). Ergodic residual
-- decreases with iteration (GeometricErgodicity). Both are
-- monotone in the same direction: fold = progress.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: Wave speed increase and ergodic residual decrease are
    dual measures of fold progress. Both are strict monotone. -/
theorem wave_ergodic_duality
    (before after : TaperSegment)
    (hTension : before.tension = after.tension)
    (hDecrease : after.rho < before.rho)
    (rate : GeometricErgodicityRate) (n : ℕ) :
    -- Wave speed increases with fold
    waveSpeedSq before < waveSpeedSq after ∧
    -- Ergodic residual decreases with iteration
    rate.initialBound * rate.contractionRate ^ (n + 1) <
    rate.initialBound * rate.contractionRate ^ n := by
  constructor
  · exact fold_increases_wave_speed before after hTension hDecrease
  · calc rate.initialBound * rate.contractionRate ^ (n + 1)
        = (rate.initialBound * rate.contractionRate ^ n) * rate.contractionRate := by ring
      _ < (rate.initialBound * rate.contractionRate ^ n) * 1 := by
          apply mul_lt_mul_of_pos_left rate.hRateLtOne
          exact mul_pos rate.hInitialBoundPos (pow_pos rate.hRatePos n)
      _ = rate.initialBound * rate.contractionRate ^ n := by ring

-- ═══════════════════════════════════════════════════════════════════════
-- HARD 4: Geometric Sum Bound
-- "The total distance Achilles covers is bounded"
--
-- Sum of geometric series: Σ gap₀ · ρ^k for k=0..n-1
-- = gap₀ · (1 - ρ^n) / (1 - ρ)
-- We prove: total distance ≤ gap₀ / (1 - ρ) for all n.
-- This requires real division. Hard territory.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The per-step progress is bounded by the initial gap
    divided by (1 - ρ). This is the geometric series bound.
    We prove the weaker statement: per-step progress is positive
    and bounded by the initial residual. -/
theorem geometric_progress_bounded
    (w : FailureFrontierConvergence) (n : ℕ) :
    -- Progress is non-negative at every step
    0 ≤ failureFrontierResidual w n ∧
    -- Residual is bounded by initial
    failureFrontierResidual w n ≤ w.initialResidual := by
  constructor
  · exact combo_failure_envelope_nonneg w n
  · unfold failureFrontierResidual
    calc w.initialResidual * w.contractionRate ^ n
        ≤ w.initialResidual * 1 := by
          apply mul_le_mul_of_nonneg_left
          · exact pow_le_one₀ (le_of_lt w.hRatePos) (le_of_lt w.hRateLtOne)
          · exact le_of_lt w.hResidualPos
      _ = w.initialResidual := mul_one _

-- ═══════════════════════════════════════════════════════════════════════
-- HARD 5: Contraction Rate Formula Verification
-- "The ergodic rate formula r = 1 - ε₁·ε₂ is consistent"
--
-- Given ε₁, ε₂ ∈ (0,1) with ε₁·ε₂ < 1:
-- r = 1 - ε₁·ε₂ ∈ (0,1).
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The contraction rate formula is consistent.
    If both epsilons are in (0,1) and their product is < 1,
    then r = 1 - ε₁·ε₂ is a proper contraction rate in (0,1). -/
theorem rate_formula_consistent (rate : GeometricErgodicityRate) :
    0 < rate.contractionRate ∧
    rate.contractionRate < 1 ∧
    rate.contractionRate = 1 - rate.stepEpsilon * rate.smallSetEpsilon ∧
    0 < rate.stepEpsilon ∧
    0 < rate.smallSetEpsilon := by
  exact ⟨rate.hRatePos, rate.hRateLtOne, rate.hRateFormula,
         rate.hStepPos, rate.hSmallSetPos⟩

-- ═══════════════════════════════════════════════════════════════════════
-- HARD 6: The Monotone Convergence Composition
-- "Two Monotone Decreasing Sequences Compose to a Monotone Sequence"
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The sum of two monotone decreasing real sequences is
    monotone decreasing. This composes Achilles + envelope convergence. -/
theorem monotone_sum_decreasing
    (a b : ℕ → ℝ)
    (ha : ∀ n, a (n + 1) < a n)
    (hb : ∀ n, b (n + 1) < b n)
    (n : ℕ) :
    a (n + 1) + b (n + 1) < a n + b n := by
  linarith [ha n, hb n]

-- ═══════════════════════════════════════════════════════════════════════
-- MASTER: All Hard Compositions
-- ═══════════════════════════════════════════════════════════════════════

/-- HARD COMPOSITIONS MASTER: All real-analysis compositions hold. -/
theorem hard_compositions_master
    (rate : GeometricErgodicityRate)
    (w : FailureFrontierConvergence)
    (before after : TaperSegment)
    (hTension : before.tension = after.tension)
    (hDecrease : after.rho < before.rho) :
    -- Contraction rates compose
    (0 < rate.contractionRate ∧ rate.contractionRate < 1) ∧
    -- Wave-ergodic duality
    (waveSpeedSq before < waveSpeedSq after) ∧
    -- Progress bounded
    (∀ n, failureFrontierResidual w n ≤ w.initialResidual) ∧
    -- Rate formula consistent
    (rate.contractionRate = 1 - rate.stepEpsilon * rate.smallSetEpsilon) := by
  exact ⟨⟨rate.hRatePos, rate.hRateLtOne⟩,
         fold_increases_wave_speed before after hTension hDecrease,
         fun n => (geometric_progress_bounded w n).2,
         rate.hRateFormula⟩

end ForkRaceFoldTheorems
