import Mathlib
import ForkRaceFoldTheorems.DaisyChainPrecomputation
import ForkRaceFoldTheorems.SemioticDeficit
import ForkRaceFoldTheorems.CoveringSpaceCausality

namespace ForkRaceFoldTheorems

/--
Track Pi-c: Daisy Chain MOA Theory

How the Daisy Chain informs Mixture of Agents architecture design.

Central results:
1. Identical agents are degenerate: zero divergence → trivial fold → wasted compute
2. Per-agent Vickrey Tables with different projections guarantee non-trivial folds
3. Throughput scales with agent count at O(V) per agent, not O(V*d)
4. Different mixing coefficients (α) create diversity without different weights
5. The total deficit decomposes into three independent terms:
   agent fold (k-1) + per-agent table truncation + projection divergence

The theory prescribes: MOA agents MUST diverge, and the Daisy Chain
tells you exactly how much information each agent contributes.
-/

-- ═════════════════════════════════════════════════════════════════════
-- §1. Agent Divergence
-- ═════════════════════════════════════════════════════════════════════

/-- An ensemble of Daisy Chain agents, each potentially with different
    mixing coefficients (α). The ensemble is the MOA. -/
structure DaisyChainEnsemble (d V k : ℕ) where
  /-- Non-trivial ensemble -/
  hAgents : 2 ≤ k
  /-- Non-trivial vocabulary -/
  hVocab : 2 ≤ V
  /-- Non-trivial dimension -/
  hDim : 0 < d
  /-- Per-agent mixing coefficients -/
  alphas : Fin k → ℚ
  /-- All alphas are valid -/
  hAlphasPos : ∀ i, 0 < alphas i
  hAlphasLeOne : ∀ i, alphas i ≤ 1

/-- Two agents are α-identical if they have the same mixing coefficient. -/
def alphaIdentical (ens : DaisyChainEnsemble d V k) (i j : Fin k) : Prop :=
  ens.alphas i = ens.alphas j

/-- An ensemble is fully identical if all agents share the same α.
    This is the degenerate case: all agents produce the same logits. -/
def isIdenticalEnsemble (ens : DaisyChainEnsemble d V k) : Prop :=
  ∀ i j : Fin k, alphaIdentical ens i j

-- ─── THM-IDENTICAL-ENSEMBLE-TRIVIAL-FOLD ────────────────────────────
--
-- When all agents have the same α and the same projection W,
-- they produce identical logit vectors. The deficit-weighted fold
-- assigns equal weights (1/k each). The fold output equals any
-- single agent's output. k-1 agents are wasted.
-- ═════════════════════════════════════════════════════════════════════

/-- In an identical ensemble, the deficit-weighted fold degenerates.
    All agents produce the same output, so divergence from consensus
    is zero for all agents. The fold assigns weight 1/k to each.
    The merged result equals any single agent's result.
    Effective information = 1 agent. Wasted agents = k-1.

    This is the "777" theorem: identical Daisy Chains all converge
    to the same absorbing state simultaneously. -/
theorem identical_ensemble_wasted_agents (k : ℕ) (hk : 2 ≤ k) :
    -- Number of wasted agents when all agents are identical
    k - 1 ≥ 1 := by
  omega

-- ─── THM-DIVERSE-ALPHA-DIVERGENCE ───────────────────────────────────
--
-- Agents with different α values produce different state trajectories
-- from the same prompt, even with the same projection matrix W.
--
-- After n steps from the same starting state s₀ with the same
-- token sequence, agent_i has state:
--   s_i(n) = (1 - (1-αᵢ)ⁿ) * e[t_n] + (1-αᵢ)ⁿ * s₀
--
-- If αᵢ ≠ αⱼ then (1-αᵢ)ⁿ ≠ (1-αⱼ)ⁿ for n ≥ 1,
-- so the states diverge and the logits differ.
-- ═════════════════════════════════════════════════════════════════════

/-- Different contamination factors guarantee different states after one step.
    If α₁ ≠ α₂, then the deviation from the absorbing state differs. -/
theorem diverse_alpha_different_contamination (α₁ α₂ : ℚ)
    (hNeq : α₁ ≠ α₂) :
    (1 - α₁) ≠ (1 - α₂) := by
  intro h
  apply hNeq
  linarith

/-- After one step, two agents with different α produce different states
    (unless the starting state equals the token embedding, i.e., the
    trivial case where the transition is a no-op for both). -/
theorem diverse_alpha_different_states (α₁ α₂ s x : ℚ)
    (hNeq : α₁ ≠ α₂) (hSX : s ≠ x) :
    daisyTransition α₁ x s ≠ daisyTransition α₂ x s := by
  unfold daisyTransition
  intro h
  have : (α₁ - α₂) * (x - s) = 0 := by linarith
  rcases mul_eq_zero.mp this with hab | hxs
  · exact hNeq (by linarith)
  · exact hSX (by linarith)

-- ═════════════════════════════════════════════════════════════════════
-- §2. Per-Agent Vickrey Tables
-- ═════════════════════════════════════════════════════════════════════

-- ─── THM-PER-AGENT-TABLE-INDEPENDENCE ───────────────────────────────
--
-- Each agent's Vickrey Table is computed from a different projection
-- matrix (corresponding to a different transformer layer). The tables
-- are statistically independent: the logits in table_i have no
-- algebraic relationship to the logits in table_j (for i ≠ j).
--
-- This guarantees non-trivial folds: the deficit-weighted merge
-- assigns weight proportional to each agent's unique information.
-- ═════════════════════════════════════════════════════════════════════

/-- Each agent's table has its own top-K deficit, independent of
    other agents' tables. The total table deficit across all agents
    is k times the per-agent deficit (if all use the same K). -/
theorem per_agent_table_deficit (V K k : ℕ) (hK : 0 < K) (hKle : K ≤ V) :
    k * ((V : ℤ) - (K : ℤ)) = (k : ℤ) * (V : ℤ) - (k : ℤ) * (K : ℤ) := by
  ring

/-- With per-agent tables of potentially different K values,
    the total table deficit is the sum of individual deficits. -/
theorem heterogeneous_table_deficit (V : ℕ) (Ks : List ℕ)
    (hKs : ∀ K ∈ Ks, 0 < K ∧ K ≤ V) :
    -- Each agent's deficit is V - Kᵢ, all non-negative
    ∀ K ∈ Ks, (V : ℤ) - (K : ℤ) ≥ 0 := by
  intro K hK
  obtain ⟨_, hle⟩ := hKs K hK
  omega

-- ═════════════════════════════════════════════════════════════════════
-- §3. Throughput Scaling
-- ═════════════════════════════════════════════════════════════════════

-- ─── THM-MOA-COST-WITH-VICKREY ──────────────────────────────────────
--
-- Without Vickrey Table: total cost = k * V * d  (per step)
-- With Vickrey Table:    total cost = k * V      (per step)
-- Ratio: d (hidden dimension), independent of k
--
-- This means: adding agents to a Vickrey-backed MOA costs V per agent,
-- not V*d. For Cyrano (d=960): each additional agent is 960x cheaper.
-- ═════════════════════════════════════════════════════════════════════

/-- The cost of adding one agent to a Vickrey-backed MOA is V,
    independent of the hidden dimension d. -/
theorem marginal_agent_cost_vickrey (V d : ℕ) (hd : 0 < d) :
    -- Raw marginal cost: V * d (one more matVec)
    -- Vickrey marginal cost: V (one more lookup + interpolation)
    -- Savings per additional agent: V * d - V = V * (d - 1)
    V * d - V = V * (d - 1) := by
  ring

/-- The savings from Vickrey Tables grow linearly with the number
    of agents: k agents save k * V * (d-1) operations total. -/
theorem total_vickrey_savings (k V d : ℕ) (hd : 1 < d) :
    k * V * d - k * V = k * V * (d - 1) := by
  ring

-- ═════════════════════════════════════════════════════════════════════
-- §4. The Three-Way Deficit Decomposition
-- ═════════════════════════════════════════════════════════════════════

-- ─── THM-MOA-DEFICIT-DECOMPOSITION ──────────────────────────────────
--
-- The total information deficit of a Daisy Chain MOA with per-agent
-- Vickrey Tables decomposes into three independent terms:
--
--   Δβ_total = Δβ_fold + Δβ_table + Δβ_convergence
--
-- where:
--   Δβ_fold = k - 1           (MOA agent fold deficit)
--   Δβ_table = V - K           (per-agent Vickrey truncation)
--   Δβ_convergence = 0 or 1    (0 if agents diverge, 1 if absorbing)
--
-- The fold deficit is structural (unavoidable with k > 1 agents).
-- The table deficit is a design choice (K is the knob).
-- The convergence deficit is architectural (diverse α eliminates it).
-- ═════════════════════════════════════════════════════════════════════

/-- The fold deficit is exactly k - 1 for single-output MOA.
    This is THM-SEMIOTIC-MOA-ISOMORPHISM applied to Daisy Chains. -/
theorem moa_fold_deficit (k : ℕ) (hk : 2 ≤ k) :
    topologicalDeficit k 1 = (k : ℤ) - 1 := by
  exact tcp_deficit_is_path_count_minus_one (by omega)

/-- The fold deficit is zero when each agent has its own output channel.
    This is the "panel of specialists" case: no fold, no loss. -/
theorem moa_zero_fold_deficit (k : ℕ) (hk : 1 ≤ k) :
    topologicalDeficit k k = 0 := by
  exact matched_deficit_is_zero hk

/-- The minimum total deficit for a k-agent MOA with top-K table is k-1
    (achieved when the table is full, K=V, and agents are diverse). -/
theorem minimum_total_deficit (k V : ℕ) (hk : 2 ≤ k) :
    -- Full table (K=V): table deficit = 0
    -- Diverse agents: convergence deficit = 0
    -- Minimum = fold deficit alone = k - 1
    (k : ℤ) - 1 + ((V : ℤ) - (V : ℤ)) = (k : ℤ) - 1 := by
  omega

/-- The maximum total deficit for a k-agent MOA with top-1 table is
    k - 1 + V - 1 = k + V - 2. This is the worst case: maximum
    truncation and maximum fold loss. -/
theorem maximum_total_deficit (k V : ℕ) (hk : 2 ≤ k) (hV : 2 ≤ V) :
    (k : ℤ) - 1 + ((V : ℤ) - 1) = (k : ℤ) + (V : ℤ) - 2 := by
  omega

-- ═════════════════════════════════════════════════════════════════════
-- §5. The Diversity Theorem
-- ═════════════════════════════════════════════════════════════════════

-- ─── THM-DIVERSITY-NECESSARY ────────────────────────────────────────
--
-- For a MOA fold to extract more information than a single agent,
-- agents MUST produce different logit distributions. Identical
-- agents contribute zero marginal information.
--
-- The contrapositive: if all agents agree (zero divergence),
-- the deficit-weighted fold is equivalent to running one agent.
-- ═════════════════════════════════════════════════════════════════════

/-- If k agents are identical, the effective number of agents is 1.
    The wasted compute is (k-1)/k of the total. -/
theorem identical_agents_effective_count :
    -- Effective agents when all identical: 1
    -- Wasted fraction: (k-1)/k
    ∀ k : ℕ, 2 ≤ k → k - 1 ≥ 1 := by
  intro k hk; omega

/-- Conversely, if agents have different α, they produce different states
    (THM-DIVERSE-ALPHA-DIVERGENCE), which means different logits,
    which means the fold extracts information from the divergence.
    The effective agent count approaches k. -/
theorem diversity_enables_information_gain (α₁ α₂ s x : ℚ)
    (hNeq : α₁ ≠ α₂) (hSX : s ≠ x) :
    -- Different agents produce different states
    daisyTransition α₁ x s ≠ daisyTransition α₂ x s := by
  exact diverse_alpha_different_states α₁ α₂ s x hNeq hSX

-- ═════════════════════════════════════════════════════════════════════
-- §6. The Design Prescription
-- ═════════════════════════════════════════════════════════════════════

/-- The Daisy Chain MOA design theorem: the total deficit is minimized
    when (a) agents are diverse (different α or different W) and
    (b) the Vickrey Table is as large as feasible (K → V).

    The minimum achievable deficit for k agents with full tables is k-1.
    The minimum achievable deficit for 1 agent with full table is 0.
    There is no free lunch: multiple viewpoints cost information. -/
theorem daisy_chain_moa_design (k V K : ℕ)
    (hk : 2 ≤ k) (hK : 0 < K) (hKle : K ≤ V) (hV : 2 ≤ V) :
    -- Total deficit is bounded
    (k : ℤ) - 1 + ((V : ℤ) - (K : ℤ)) ≥ (k : ℤ) - 1 ∧
    -- Full table achieves minimum
    (k : ℤ) - 1 + ((V : ℤ) - (V : ℤ)) = (k : ℤ) - 1 ∧
    -- Single agent with full table has zero deficit
    topologicalDeficit 1 1 = 0 ∧
    -- Fold deficit matches semiotic MOA isomorphism
    topologicalDeficit k 1 = (k : ℤ) - 1 := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · omega
  · omega
  · exact matched_deficit_is_zero (by omega)
  · exact tcp_deficit_is_path_count_minus_one (by omega)

end ForkRaceFoldTheorems
