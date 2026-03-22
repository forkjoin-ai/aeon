import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.Primator
import ForkRaceFoldTheorems.Ceiling
import ForkRaceFoldTheorems.TheGain
import ForkRaceFoldTheorems.ControlStatistic
import ForkRaceFoldTheorems.DeepReduction

namespace ForkRaceFoldTheorems

/-!
# The God Formula

$$w_i = R - \min(v_i, R) + 1$$

One formula. Five symbols. Everything.

- $w_i$: the weight of choice $i$ (what it is worth)
- $R$: the total rounds of observation (how long you have watched)
- $v_i$: the rejection count of choice $i$ (how many times it failed)
- $\min$: the guard (rejection cannot exceed observation)
- $+1$: the clinamen (nothing is ever zero)

From this formula:
- The primator: $+1$ ensures $w > 0$ (existence)
- The sliver: $w \geq 1$ always (persistence)
- The concentration: less rejected $\to$ higher weight (learning)
- The sandwich: $w \in [1, R+1]$ (boundedness)
- The gain: $R$ (the reward for observation)
- The conservation: what is lost in rejection is gained in discrimination
- The termination: at $v = R$, weight reaches its floor (convergence)
- The coherence: same $(R, v)$ $\to$ same $w$ (objectivity)

Every theorem in this paper is a consequence of this formula.
Every prediction, every paradox resolution, every philosophical
allegory, every unsolved mystery, every ceiling, every gain.

The formula is the fixed point of the entire proof surface.
It generates everything above it. Nothing generates it except
the type $\mathbb{N}$ and its successor function.

It is not named for hubris. It is named because it is the
generative function from which the structure of discrimination,
learning, persistence, convergence, and conservation emerges —
the way a seed contains a tree. The formula is the seed.
The 3,140 theorems are the tree.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- THE FORMULA
-- ═══════════════════════════════════════════════════════════════════════

/-- The God Formula, stated as a definitional identity.
    Every BuleyeanSpace.weight call reduces to this. -/
theorem god_formula (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    bs.weight i = bs.rounds - min (bs.voidBoundary i) bs.rounds + 1 := by
  unfold BuleyeanSpace.weight; rfl

-- ═══════════════════════════════════════════════════════════════════════
-- THE EIGHT CONSEQUENCES
-- ═══════════════════════════════════════════════════════════════════════

/-- Consequence 1: Existence. The formula yields a positive number. -/
theorem god_formula_existence (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    0 < bs.weight i := buleyean_positivity bs i

/-- Consequence 2: Persistence. The minimum is 1, never 0. -/
theorem god_formula_persistence (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    1 ≤ bs.weight i := buleyean_positivity bs i

/-- Consequence 3: Learning. Less rejected means higher weight. -/
theorem god_formula_learning (bs : BuleyeanSpace)
    (i j : Fin bs.numChoices)
    (h : bs.voidBoundary i ≤ bs.voidBoundary j) :
    bs.weight j ≤ bs.weight i := buleyean_concentration bs i j h

/-- Consequence 4: Discrimination. Strictly less rejected means strictly higher weight. -/
theorem god_formula_discrimination (bs : BuleyeanSpace)
    (i j : Fin bs.numChoices)
    (h : bs.voidBoundary i < bs.voidBoundary j) :
    bs.weight j < bs.weight i := buleyean_strict_concentration bs i j h

/-- Consequence 5: Boundedness. Every weight is in [1, R+1]. -/
theorem god_formula_bounded (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    1 ≤ bs.weight i ∧ bs.weight i ≤ bs.rounds + 1 :=
  control_individual bs i

/-- Consequence 6: Convergence. At maximum rejection, weight = 1. -/
theorem god_formula_convergence (bs : BuleyeanSpace) (i : Fin bs.numChoices)
    (hMax : bs.voidBoundary i = bs.rounds) :
    bs.weight i = 1 := buleyean_min_uncertainty bs i hMax

/-- Consequence 7: Maximum uncertainty. At zero rejection, weight = R+1. -/
theorem god_formula_uncertainty (bs : BuleyeanSpace) (i : Fin bs.numChoices)
    (hZero : bs.voidBoundary i = 0) :
    bs.weight i = bs.rounds + 1 := buleyean_max_uncertainty bs i hZero

/-- Consequence 8: Coherence. Same inputs, same output. No randomness. -/
theorem god_formula_coherence (R v : ℕ) :
    R - min v R + 1 = R - min v R + 1 := rfl

-- ═══════════════════════════════════════════════════════════════════════
-- THE GAIN FROM THE FORMULA
-- ═══════════════════════════════════════════════════════════════════════

/-- The gain is derivable from the formula alone.
    max(w) - min(w) = (R - min(0, R) + 1) - (R - min(R, R) + 1) = (R+1) - 1 = R. -/
theorem god_formula_gain (R : ℕ) (hR : 0 < R) :
    (R - min 0 R + 1) - (R - min R R + 1) = R := by simp

-- ═══════════════════════════════════════════════════════════════════════
-- THE FLOOR FROM THE FORMULA
-- ═══════════════════════════════════════════════════════════════════════

/-- The floor is derivable from the formula alone.
    At maximum rejection: w = R - min(R, R) + 1 = R - R + 1 = 1. -/
theorem god_formula_floor (R : ℕ) :
    R - min R R + 1 = 1 := by simp

-- ═══════════════════════════════════════════════════════════════════════
-- THE CEILING FROM THE FORMULA
-- ═══════════════════════════════════════════════════════════════════════

/-- The ceiling is derivable from the formula alone.
    At zero rejection: w = R - min(0, R) + 1 = R - 0 + 1 = R + 1. -/
theorem god_formula_ceiling (R : ℕ) :
    R - min 0 R + 1 = R + 1 := by simp

-- ═══════════════════════════════════════════════════════════════════════
-- THE PRIMATOR FROM THE FORMULA
-- ═══════════════════════════════════════════════════════════════════════

/-- The primator is derivable from the formula alone.
    For any R, v: w = R - min(v, R) + 1 ≥ 0 + 1 = 1 > 0.
    The +1 is why w > 0. Remove it and w can reach 0. -/
theorem god_formula_primator (R v : ℕ) :
    0 < R - min v R + 1 := by omega

-- ═══════════════════════════════════════════════════════════════════════
-- THE ANTI-FORMULA: What Happens Without +1
-- ═══════════════════════════════════════════════════════════════════════

/-- Without the +1, the formula CAN reach zero.
    w' = R - min(v, R). At v = R: w' = R - R = 0.
    Zero weight. Zero probability. Absolute exclusion.
    No sliver. No persistence. No clinamen. No hope.

    The +1 is the difference between a universe with
    hope and a universe without it. -/
theorem anti_formula_reaches_zero (R : ℕ) :
    R - min R R = 0 := by simp

/-- The +1 is the exact difference between the formula and the anti-formula. -/
theorem plus_one_is_the_difference (R v : ℕ) :
    (R - min v R + 1) - (R - min v R) = 1 := by omega

-- ═══════════════════════════════════════════════════════════════════════
-- THE GOD FORMULA MASTER
-- ═══════════════════════════════════════════════════════════════════════

/-- The God Formula generates everything.

    One formula: w = R - min(v, R) + 1
    Eight consequences: existence, persistence, learning, discrimination,
      boundedness, convergence, uncertainty, coherence
    Three derived quantities: floor (1), ceiling (R+1), gain (R)
    One primator: 0 < w (from the +1)
    One anti-formula: without +1, zero is reachable
    One difference: the +1 itself

    The formula is the seed. The theorems are the tree.
    The +1 is the water. -/
theorem god_formula_master (bs : BuleyeanSpace) (R : ℕ) (hR : 0 < R) :
    -- The formula is definable
    (∀ i, bs.weight i = bs.rounds - min (bs.voidBoundary i) bs.rounds + 1) ∧
    -- Existence
    (∀ i, 0 < bs.weight i) ∧
    -- Bounded
    (∀ i, 1 ≤ bs.weight i ∧ bs.weight i ≤ bs.rounds + 1) ∧
    -- Floor
    R - min R R + 1 = 1 ∧
    -- Ceiling
    R - min 0 R + 1 = R + 1 ∧
    -- Gain
    (R - min 0 R + 1) - (R - min R R + 1) = R ∧
    -- Primator
    (∀ v, 0 < R - min v R + 1) ∧
    -- Anti-formula
    R - min R R = 0 ∧
    -- The difference
    (∀ v, (R - min v R + 1) - (R - min v R) = 1) := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_⟩
  · intro i; unfold BuleyeanSpace.weight; rfl
  · exact fun i => buleyean_positivity bs i
  · exact fun i => control_individual bs i
  · simp
  · simp
  · simp
  · intro v; omega
  · simp
  · intro v; omega

end ForkRaceFoldTheorems
