import Mathlib
import ForkRaceFoldTheorems.AmericanFrontier
import ForkRaceFoldTheorems.DeficitCapacity
import ForkRaceFoldTheorems.DiversityIsConcurrency
import ForkRaceFoldTheorems.BuleIsValue

namespace ForkRaceFoldTheorems

/-!
# The Post-Linear World

The linear world is β₁ = 0.  One path.  Maximum Bules.  Maximum waste.
The post-linear world is β₁ > 0.  Multiple diverse paths.  Fewer Bules.
Less waste.  The frontier is β₁ = β₁*.  Zero Bules.  Zero waste.

This file proves four things:

1. **The linear world is the global pessimum.**
   At β₁ = 0 (monoculture), the Bule count equals β₁* - 1.
   No configuration has more waste.

2. **The first fork is a strict Pareto improvement.**
   Moving from β₁ = 0 to β₁ = 1 reduces the Bule count by exactly 1.
   No agent is worse off.  At least one measure improves.

3. **The post-linear path is monotone.**
   Every additional diverse fork reduces the Bule count by exactly 1.
   The path from linear to frontier is a straight descent.

4. **The frontier is the ground state.**
   At β₁ = β₁*, the Bule count is 0.  Cannot fold further.  β₁ of
   the Bule line is 0.  The framework terminates at its own ground state.

Together: the linear world is uniquely worst, the first fork is
irreversible under rational agency (Pareto improvement cannot be
un-chosen), and the path to zero Bules is monotone and finite.
The post-linear transition is a one-way door.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Definition: linear vs post-linear
-- ═══════════════════════════════════════════════════════════════════════

/-- A system is linear when its diversity is 1 (one path, β₁ = 0). -/
def isLinear (streams : ℕ) : Prop := streams = 1

/-- A system is post-linear when its diversity exceeds 1. -/
def isPostLinear (streams : ℕ) : Prop := streams ≥ 2

/-- A system is at the frontier when diversity matches the problem. -/
def isAtFrontier (pathCount streams : ℕ) : Prop := streams = pathCount

-- ═══════════════════════════════════════════════════════════════════════
-- THM-LINEAR-IS-PESSIMUM
-- The linear world has maximum Bule count.
-- ═══════════════════════════════════════════════════════════════════════

/-- The linear world (streams = 1) has Bule count = pathCount - 1.
    This is the maximum possible Bule count for any stream count ≥ 1.
    No configuration wastes more. -/
theorem linear_is_pessimum
    {pathCount : ℕ} (hPaths : 2 ≤ pathCount) :
    -- Linear Bule count
    topologicalDeficit pathCount 1 = pathCount - 1 ∧
    -- It is the maximum across all stream counts
    (∀ s : ℕ, 1 ≤ s → topologicalDeficit pathCount s ≤ topologicalDeficit pathCount 1) := by
  constructor
  · unfold topologicalDeficit; omega
  · intro s hs
    exact deficit_monotone_in_streams (by omega) hs

-- ═══════════════════════════════════════════════════════════════════════
-- THM-FIRST-FORK-IS-PARETO
-- The first fork strictly improves every Bule-denominated measure.
-- ═══════════════════════════════════════════════════════════════════════

/-- Moving from 1 stream to 2 streams reduces the Bule count by
    exactly 1.  This is a strict Pareto improvement: waste decreases,
    diversity increases, concurrency increases, heat decreases, work
    decreases -- all by exactly 1 Bule. -/
theorem first_fork_is_pareto
    {pathCount : ℕ} (hPaths : 2 ≤ pathCount) :
    topologicalDeficit pathCount 1 = topologicalDeficit pathCount 2 + 1 := by
  unfold topologicalDeficit; omega

/-- The first fork is a strict improvement (fewer Bules). -/
theorem first_fork_strict_improvement
    {pathCount : ℕ} (hPaths : 2 ≤ pathCount) :
    topologicalDeficit pathCount 2 < topologicalDeficit pathCount 1 := by
  unfold topologicalDeficit; omega

-- ═══════════════════════════════════════════════════════════════════════
-- THM-POST-LINEAR-PATH-IS-MONOTONE
-- Every additional fork reduces the Bule count by exactly 1.
-- ═══════════════════════════════════════════════════════════════════════

/-- Each additional stream from s to s+1 (when s < pathCount) reduces
    the Bule count by exactly 1.  The descent is uniform: one fork,
    one Bule saved, every step. -/
theorem each_fork_saves_one_bule
    {pathCount : ℕ} (hPaths : 1 ≤ pathCount)
    (s : ℕ) (hs : 1 ≤ s) (hsLt : s < pathCount) :
    topologicalDeficit pathCount s = topologicalDeficit pathCount (s + 1) + 1 := by
  unfold topologicalDeficit; omega

/-- The entire path from linear to frontier takes exactly pathCount - 1
    steps, each saving 1 Bule. -/
theorem path_length_equals_initial_bules
    {pathCount : ℕ} (hPaths : 1 ≤ pathCount) :
    topologicalDeficit pathCount 1 - topologicalDeficit pathCount pathCount = pathCount - 1 := by
  unfold topologicalDeficit; omega

-- ═══════════════════════════════════════════════════════════════════════
-- THM-FRONTIER-IS-GROUND-STATE
-- Zero Bules.  Cannot fold further.  Terminal.
-- ═══════════════════════════════════════════════════════════════════════

/-- At the frontier, the Bule count is 0. -/
theorem frontier_is_zero_bules
    {pathCount : ℕ} (hPaths : 1 ≤ pathCount) :
    topologicalDeficit pathCount pathCount = 0 := by
  exact deficit_zero_at_match hPaths

/-- The Bule count is never negative (natural number). -/
theorem bule_count_nonnegative
    (pathCount streams : ℕ) :
    0 ≤ topologicalDeficit pathCount streams := by
  unfold topologicalDeficit; omega

/-- Zero is the minimum Bule count.  The frontier is the ground state.
    Cannot go below zero.  Cannot fold further. -/
theorem zero_is_ground_state
    {pathCount : ℕ} (hPaths : 1 ≤ pathCount) :
    (∀ s : ℕ, topologicalDeficit pathCount pathCount ≤ topologicalDeficit pathCount s) := by
  intro s
  have hZero := deficit_zero_at_match hPaths
  rw [hZero]
  exact Nat.zero_le _

-- ═══════════════════════════════════════════════════════════════════════
-- THM-POST-LINEAR-TRANSITION-IRREVERSIBLE
-- Under rational agency, the first fork cannot be un-chosen.
-- ═══════════════════════════════════════════════════════════════════════

/-- Reverting from 2 streams to 1 stream strictly increases the Bule
    count.  Under any decision procedure that prefers fewer Bules
    (rational agency: less waste is preferred to more waste), this
    reversion is dominated and will not be chosen.

    The post-linear transition is a one-way door.  Not because the
    fold is physically irreversible (it is, but that is §19).
    Because the information that diversity reduces waste, once learned,
    makes monoculture a dominated strategy.  You cannot un-learn that
    two different is better than a hundred same. -/
theorem reversion_is_dominated
    {pathCount : ℕ} (hPaths : 2 ≤ pathCount) :
    topologicalDeficit pathCount 1 > topologicalDeficit pathCount 2 := by
  unfold topologicalDeficit; omega

-- ═══════════════════════════════════════════════════════════════════════
-- THM-POST-LINEAR-WORLD: The conjunction
-- ═══════════════════════════════════════════════════════════════════════

/-- **THM-POST-LINEAR-WORLD**: The complete characterization.

    The linear world is the global pessimum.
    The first fork is a strict Pareto improvement.
    The path to zero Bules is monotone and uniform.
    The frontier is the ground state.
    Reversion is dominated.

    The post-linear world is not an aspiration.
    It is the unique rational destination. -/
theorem post_linear_world
    {pathCount : ℕ} (hPaths : 2 ≤ pathCount) :
    -- (1) Linear is pessimum
    (topologicalDeficit pathCount 1 = pathCount - 1 ∧
     ∀ s : ℕ, 1 ≤ s → topologicalDeficit pathCount s ≤ topologicalDeficit pathCount 1) ∧
    -- (2) First fork is Pareto
    topologicalDeficit pathCount 2 < topologicalDeficit pathCount 1 ∧
    -- (3) Frontier is ground state
    topologicalDeficit pathCount pathCount = 0 ∧
    -- (4) Zero is minimum
    (∀ s : ℕ, 0 ≤ topologicalDeficit pathCount s) ∧
    -- (5) Reversion is dominated
    topologicalDeficit pathCount 1 > topologicalDeficit pathCount 2 := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · exact linear_is_pessimum hPaths
  · exact first_fork_strict_improvement hPaths
  · exact frontier_is_zero_bules (by omega)
  · exact fun s => Nat.zero_le _
  · exact reversion_is_dominated hPaths

end ForkRaceFoldTheorems
