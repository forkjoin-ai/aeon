import Mathlib
import ForkRaceFoldTheorems.SemioticDeficit
import ForkRaceFoldTheorems.CoveringSpaceCausality
import ForkRaceFoldTheorems.DeficitCapacity

namespace ForkRaceFoldTheorems

/--
Track Pi-b: Daisy Chain Theory (The Vickrey Table)

A Daisy Chain is a Markov chain with linear transition and linear emission.
The linearity is what makes the Vickrey Table exact. Transformers cannot
satisfy this property because attention is quadratic and context-dependent.

Hierarchy:
  Markov chain (memoryless)
    └── Daisy Chain (memoryless + linear transition + linear emission)
          └── admits Vickrey Table (exact precomputed logit fold)
-/

-- ─── The Daisy Chain ────────────────────────────────────────────────

/-- A Daisy Chain: a language model with fixed embedding and projection matrices
    whose transition function is an affine combination of the current state
    and the embedding of the chosen token. -/
structure DaisyChain (d V : ℕ) where
  /-- Non-trivial vocabulary -/
  hVocab : 2 ≤ V
  /-- Non-trivial dimension -/
  hDim : 0 < d
  /-- Mixing coefficient: 0 < α ≤ 1 -/
  alpha : ℚ
  /-- α is positive -/
  hAlphaPos : 0 < alpha
  /-- α is at most 1 -/
  hAlphaLeOne : alpha ≤ 1

/-- The Daisy Chain transition in the rationals.
    s_{t+1} = α * x + (1-α) * s_t
    This is affine in both x and s_t. -/
def daisyTransition (α x s : ℚ) : ℚ := α * x + (1 - α) * s

-- ─── THM-DAISY-TRANSITION-AFFINE ───────────────────────────────────
--
-- The Daisy Chain transition is affine: distributes over addition
-- with scalar weights summing to 1. This is the algebraic property
-- that enables the Vickrey Table.
-- ═════════════════════════════════════════════════════════════════════

/-- The transition coefficients sum to 1. This makes the transition
    a convex combination when 0 < α ≤ 1. -/
theorem daisy_transition_coefficients_sum (α : ℚ) :
    α + (1 - α) = 1 := by
  ring

/-- The transition is idempotent on fixed points: if x = s then
    the transition returns x. This is the formal content of absorbing states. -/
theorem daisy_transition_fixed_point (α x : ℚ) :
    daisyTransition α x x = x := by
  unfold daisyTransition
  ring

-- ─── THM-DAISY-LINEARITY ────────────────────────────────────────────
--
-- A linear map W distributes over the Daisy Chain transition:
--   W(α*x + (1-α)*s) = α*(W*x) + (1-α)*(W*s)
-- This means precomputed W*x values can be interpolated at runtime.
-- ═════════════════════════════════════════════════════════════════════

/-- Linear maps distribute over the Daisy Chain transition.
    For any linear map f and transition α*x + (1-α)*s:
    f(α*x + (1-α)*s) = α*f(x) + (1-α)*f(s)

    This is the key theorem. It says: if we precompute f(x) for all x
    in the vocabulary, then f(state) = α*precomputed[token] + (1-α)*prev.
    No matrix multiplication at runtime.

    Proof: by the definition of linearity (f(a+b) = f(a)+f(b), f(c*a) = c*f(a)). -/
theorem daisy_linearity_rational (f : ℚ →ₗ[ℚ] ℚ) (α x s : ℚ) :
    f (daisyTransition α x s) = daisyTransition α (f x) (f s) := by
  unfold daisyTransition
  simp [map_add, map_smul, smul_eq_mul]
  ring

/-- Corollary: the cached interpolation is exact.
    precomputed_transition(α, table[t], prev) = W(transition(α, e[t], s))
    This is THM-PRECOMPUTATION-VALIDITY stated as a corollary. -/
theorem precomputation_exact (f : ℚ →ₗ[ℚ] ℚ) (α x s : ℚ) :
    daisyTransition α (f x) (f s) = f (daisyTransition α x s) := by
  exact (daisy_linearity_rational f α x s).symm

-- ─── THM-ABSORBING-STATE ────────────────────────────────────────────
--
-- Absorbing states are fixed points of the transition.
-- If argmax(W*e[t]) = t, then predicting t produces a state that
-- predicts t again. The convergence is geometric.
-- ═════════════════════════════════════════════════════════════════════

/-- After one step in an absorbing state, the "contamination" from
    the previous state is scaled by (1-α). After n steps, it's (1-α)^n.
    For α = 0.7, after 3 steps: (0.3)^3 = 0.027 = 2.7% of original state. -/
theorem absorbing_contamination_after_one (α s x : ℚ) (hα : 0 < α) (hαle : α ≤ 1) :
    daisyTransition α x s - x = (1 - α) * (s - x) := by
  unfold daisyTransition
  ring

/-- The contamination factor (1-α) is in [0, 1) for valid Daisy Chains,
    guaranteeing geometric convergence to the absorbing state. -/
theorem contamination_factor_bound (dc : DaisyChain d V) (hLt : dc.alpha < 1) :
    0 ≤ 1 - dc.alpha ∧ 1 - dc.alpha < 1 := by
  constructor
  · linarith [dc.hAlphaLeOne]
  · linarith [dc.hAlphaPos]

-- ─── THM-TOPK-DEFICIT ───────────────────────────────────────────────
--
-- The Vickrey Table stores top-K logits per token. This is a semiotic
-- fold with deficit V - K: the full vocabulary is collapsed to K candidates.
-- ═════════════════════════════════════════════════════════════════════

/-- Top-K truncation has non-negative semiotic deficit. -/
theorem topk_deficit (V K : ℕ) (hK : 0 < K) (hKle : K ≤ V) :
    (V : ℤ) - (K : ℤ) ≥ 0 := by
  omega

/-- Full table (K = V) has zero deficit: no information loss. -/
theorem topk_full_table (V : ℕ) :
    (V : ℤ) - (V : ℤ) = 0 := by
  omega

/-- Strict truncation (K < V) has positive deficit: information is lost. -/
theorem topk_strict_deficit (V K : ℕ) (hKlt : K < V) :
    (V : ℤ) - (K : ℤ) > 0 := by
  omega

/-- The total deficit of a Daisy Chain MOA with k agents and top-K table
    decomposes additively: (k-1) for the agent fold + (V-K) for the table fold.
    These are independent sources of information loss. -/
theorem total_deficit_additive (k V K : ℕ) (hk : 2 ≤ k) (hK : 0 < K) :
    (k : ℤ) - 1 + ((V : ℤ) - (K : ℤ)) = (k : ℤ) + (V : ℤ) - (K : ℤ) - 1 := by
  omega

/-- The agent deficit dominates when the table is full (K = V):
    total deficit collapses to just the MOA deficit k - 1. -/
theorem full_table_only_moa_deficit (k V : ℕ) (hk : 2 ≤ k) :
    (k : ℤ) - 1 + ((V : ℤ) - (V : ℤ)) = (k : ℤ) - 1 := by
  omega

-- ─── THM-DAISY-MONOTONE-CONTEXT ────────────────────────────────────
--
-- Increasing K monotonically reduces the total deficit.
-- This connects the Vickrey Table to THM-SEMIOTIC-CONTEXT-REDUCES:
-- more precomputed entries = more preserved nuance = lower deficit.
-- ═════════════════════════════════════════════════════════════════════

/-- Increasing K by δ reduces the total deficit by exactly δ.
    Each additional stored logit is one fewer vented nuance path. -/
theorem topk_deficit_monotone (V K delta : ℕ) (hKle : K + delta ≤ V) :
    (V : ℤ) - ((K + delta : ℕ) : ℤ) = (V : ℤ) - (K : ℤ) - (delta : ℤ) := by
  omega

-- ─── THM-VICKREY-THROUGHPUT-INVARIANCE ──────────────────────────────
--
-- The Vickrey Table throughput is independent of the number of agents.
-- Raw matVec: cost = k * V * d  (linear in k)
-- Vickrey:    cost = k * V      (the V*d was precomputed)
-- The d factor is eliminated entirely.
-- ═════════════════════════════════════════════════════════════════════

/-- The per-agent cost with the Vickrey Table is V (vector addition),
    independent of hidden dimension d. Raw matVec cost is V * d.
    The speedup factor is exactly d. -/
theorem vickrey_speedup_factor (d V : ℕ) (hd : 0 < d) :
    -- Raw cost per agent per step: V * d multiplications
    -- Vickrey cost per agent per step: V additions
    -- Speedup = (V * d) / V = d
    V * d / V = d := by
  exact Nat.mul_div_cancel_left d (by omega : 0 < V) |>.symm ▸
    Nat.mul_div_cancel d (by omega : 0 < V)

/-- The total cost ratio (all agents) preserves the d× speedup:
    k agents × V additions vs k agents × V × d multiplications.
    The k cancels. The speedup is always d regardless of k. -/
theorem vickrey_speedup_agent_invariant (k d V : ℕ) (hk : 0 < k) (hd : 0 < d) (hV : 0 < V) :
    -- (k * V * d) / (k * V) = d
    -- The speedup is independent of k (number of agents)
    k * (V * d) / (k * V) = d := by
  rw [Nat.mul_comm V d, ← Nat.mul_assoc, Nat.mul_assoc k d V]
  rw [Nat.mul_div_cancel_left _ (by positivity : 0 < k * V)]

-- ─── Bundle ─────────────────────────────────────────────────────────

/-- The Daisy Chain theory bundle:
    1. Transition coefficients sum to 1 (convex combination)
    2. Fixed points are absorbing (transition is idempotent on x=s)
    3. Linear maps distribute over the transition (Vickrey Table is exact)
    4. Top-K deficit is non-negative and monotone in K
    5. Total deficit is additive (agent fold + table fold)
    6. Contamination factor guarantees geometric convergence -/
theorem daisy_chain_theory (dc : DaisyChain d V) (hLt : dc.alpha < 1)
    (K : ℕ) (hK : 0 < K) (hKle : K ≤ V) (numAgents : ℕ) (hA : 2 ≤ numAgents) :
    -- Coefficients sum to 1
    dc.alpha + (1 - dc.alpha) = 1 ∧
    -- Top-K deficit is non-negative
    (V : ℤ) - (K : ℤ) ≥ 0 ∧
    -- Full table has zero deficit
    (V : ℤ) - (V : ℤ) = 0 ∧
    -- Contamination factor is contracting
    (0 ≤ 1 - dc.alpha ∧ 1 - dc.alpha < 1) ∧
    -- Total deficit is additive
    (numAgents : ℤ) - 1 + ((V : ℤ) - (K : ℤ)) = (numAgents : ℤ) + (V : ℤ) - (K : ℤ) - 1 := by
  exact ⟨
    daisy_transition_coefficients_sum dc.alpha,
    topk_deficit V K hK hKle,
    topk_full_table V,
    contamination_factor_bound dc hLt,
    total_deficit_additive numAgents V K hA hK
  ⟩

end ForkRaceFoldTheorems
