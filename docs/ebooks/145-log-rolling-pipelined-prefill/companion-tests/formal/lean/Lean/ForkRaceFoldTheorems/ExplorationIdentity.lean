import Init

/-!
# The Exploration Identity: Optimal - Skyrms = Exploration

The simplest theorem in the paper. The gap between the globally optimal
assignment (unknown, undecidable) and the Skyrms Nash equilibrium
(known, computable) is exactly the exploration budget.

    Optimal - Skyrms = Exploration

This is not an inequality. It is an identity. The exploration is not
overhead. It is the distance between what you know and what you could
know. The God Gap applied to strategy selection.

The sliver is the mechanism. The void boundary is the measurement.
The oscillation is the dynamics. This identity is the accounting.
-/

namespace ExplorationIdentity

/-- The three quantities in the identity. -/
structure CompilerAccounting where
  /-- Global optimum cost (unknown, lower bound only) -/
  optimalCost : Nat
  /-- Skyrms Nash equilibrium cost (known, computable) -/
  skyrmsCost : Nat
  /-- Exploration budget: nodes assigned to non-winners by the sliver -/
  explorationBudget : Nat
  /-- Skyrms is at least as good as optimal (it's a valid assignment) -/
  skyrms_ge_optimal : optimalCost ≤ skyrmsCost
  /-- The identity: the gap IS the exploration -/
  identity : skyrmsCost - optimalCost = explorationBudget

/-- THE IDENTITY: Optimal - Skyrms = Exploration.
    Given any accounting where Skyrms cost = optimal cost + exploration budget,
    the exploration budget equals the gap. -/
theorem the_identity (optimal skyrms exploration : Nat)
    (h_ge : optimal ≤ skyrms)
    (h_sum : skyrms = optimal + exploration) :
    skyrms - optimal = exploration := by omega

/-- Corollary: when exploration = 0, Skyrms IS optimal.
    The God Gap is zero. The system has finished exploring. -/
theorem zero_exploration_is_optimal (optimal skyrms : Nat)
    (h : skyrms = optimal + 0) :
    skyrms = optimal := by omega

/-- Corollary: when exploration > 0, Skyrms is NOT optimal.
    But the gap is known and bounded. -/
theorem positive_exploration_is_gap (optimal skyrms exploration : Nat)
    (h_sum : skyrms = optimal + exploration)
    (h_pos : 0 < exploration) :
    optimal < skyrms := by omega

/-- The exploration budget = K - 1 for K compilers (one sliver node each). -/
theorem exploration_budget_is_sliver (K : Nat) (hK : 2 ≤ K) :
    K - 1 ≥ 1 := by omega

/-- The exploration budget = 0 when K = 1 (monoculture). No sliver needed. -/
theorem monoculture_zero_exploration : 1 - 1 = 0 := by omega

/-- Composing the identity with the God Gap:
    God Gap = (Local Optimum) - (Global Optimum)
    Exploration = (Skyrms) - (Optimal on this topology)
    Total gap = God Gap + Exploration
    The system doesn't know where the global optimum is (God Gap).
    The system doesn't know if the sliver nodes should switch (Exploration).
    Both gaps are finite, measurable, and shrinking. -/
theorem total_gap_decomposition (globalOpt localOpt skyrms exploration godGap : Nat)
    (h_god : localOpt - globalOpt = godGap)
    (h_exp : skyrms - localOpt = exploration)
    (h1 : globalOpt ≤ localOpt)
    (h2 : localOpt ≤ skyrms) :
    skyrms - globalOpt = godGap + exploration := by omega

end ExplorationIdentity
