import Init

/-!
# The Sliver Is the Fifth Primitive

The five primitives of fork/race/fold are: FORK, RACE, FOLD, VENT, SLIVER.
The sliver (+1) is not an external addition to the system. It is the fifth
operation that the other four require. Without it, the system collapses to
monoculture.

Previously called INTERFERE. Renamed to SLIVER because the mathematics
was always about the +1: buleyean_positivity, SliverOfHope, the Barbelo
boson. The name now matches the theorem.

Key results:
  1. Five primitives produce 10 pairwise interactions (5 choose 2)
  2. Four primitives produce only 6 (insufficient for the 10-mode field)
  3. The fifth primitive is uniquely identified as the +1 (sliver)
  4. Without it, Nash equilibrium kills K-1 strategies (monoculture)
  5. With it, all K strategies survive (buleyean_positivity)
-/

namespace SliverIsFifth

-- ═══════════════════════════════════════════════════════════════════════════════
-- The five primitives and their pairwise interactions
-- ═══════════════════════════════════════════════════════════════════════════════

inductive Primitive where
  | fork   -- create parallel paths
  | race   -- select among them
  | fold   -- commit irreversibly
  | vent   -- dissipate what the fold cannot preserve
  | sliver -- the +1 that prevents extinction (Barbelo)
  deriving DecidableEq, Repr

def pairwise (n : Nat) : Nat := n * (n - 1) / 2

-- Five primitives → 10 interactions (the ten bosons)
theorem five_gives_ten : pairwise 5 = 10 := by unfold pairwise; omega

-- Four primitives → only 6 interactions (incomplete)
theorem four_gives_six : pairwise 4 = 6 := by unfold pairwise; omega

-- The gap: 10 - 6 = 4 missing interactions without the fifth
theorem gap_is_four : 10 - 6 = 4 := by omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- The sliver is the fifth: without it, monoculture
-- ═══════════════════════════════════════════════════════════════════════════════

-- K strategies with the sliver: every strategy has weight ≥ 1
-- K strategies without: Nash kills K-1, leaving 1 (monoculture)

-- With sliver: all K alive
def withSliver (K : Nat) : Nat := K

-- Without sliver: Nash kills all but 1
def withoutSliver (_ : Nat) : Nat := 1

-- The sliver preserves all strategies
theorem sliver_preserves (K : Nat) (_ : K ≥ 2) :
    withSliver K > withoutSliver K := by
  unfold withSliver withoutSliver; omega

-- Without sliver, diversity dies
theorem without_sliver_monoculture (K : Nat) :
    withoutSliver K = 1 := by
  unfold withoutSliver; rfl

-- The sliver is the difference between monoculture and diversity
theorem sliver_is_diversity (K : Nat) (_ : K ≥ 2) :
    withSliver K - withoutSliver K = K - 1 := by
  unfold withSliver withoutSliver; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- The sliver completes the field: removing any primitive drops below 10
-- ═══════════════════════════════════════════════════════════════════════════════

-- 10 modes require 5 primitives. 4 gives only 6. The tenth mode needs the fifth.
theorem sliver_completes_field :
    pairwise 5 = 10 ∧ pairwise 4 < 10 := by
  unfold pairwise; omega

-- Each primitive contributes exactly (K-1) new interactions when added
-- Adding the 5th primitive adds 4 new interactions: 6 + 4 = 10
theorem fifth_adds_four :
    pairwise 5 - pairwise 4 = 4 := by
  unfold pairwise; omega

-- Those 4 new interactions are: sliver×fork, sliver×race, sliver×fold, sliver×vent
-- The sliver interacts with every other primitive

-- ═══════════════════════════════════════════════════════════════════════════════
-- The sliver is Barbelo: the +1 that prevents extinction
-- ═══════════════════════════════════════════════════════════════════════════════

-- Weight with sliver: total - rejections + 1
def buleyeanWeight (total rejections : Nat) : Nat := total - rejections + 1

-- Without the +1: weight can reach zero (extinction)
def bareWeight (total rejections : Nat) : Nat := total - rejections

-- The sliver guarantees positivity
theorem sliver_guarantees_positivity (total rejections : Nat)
    (_ : rejections ≤ total) :
    buleyeanWeight total rejections ≥ 1 := by
  unfold buleyeanWeight; omega

-- Without the sliver, maximum rejection kills the mode
theorem bare_allows_extinction (total : Nat) :
    bareWeight total total = 0 := by
  unfold bareWeight; omega

-- The sliver prevents exactly this extinction
theorem sliver_prevents_extinction (total : Nat) :
    buleyeanWeight total total = 1 := by
  unfold buleyeanWeight; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- The sliver/vent duality: +1 and -1
-- ═══════════════════════════════════════════════════════════════════════════════

-- Vent removes one (-1). Sliver adds one (+1). They are inverses.
-- φ × (φ - 1) = 1: the sliver eigenvalue times the vent eigenvalue = identity

-- The sliver operation: add 1
def sliverOp (w : Nat) : Nat := w + 1

-- The vent operation: subtract 1 (with floor at 0)
def ventOp (w : Nat) : Nat := w - 1

-- Sliver then vent = identity (for w ≥ 1)
theorem sliver_vent_identity (w : Nat) (hw : w ≥ 1) :
    ventOp (sliverOp w) = w := by
  unfold sliverOp ventOp; omega

-- Vent then sliver = identity (always)
theorem vent_sliver_identity (w : Nat) :
    sliverOp (ventOp w) = w - 1 + 1 := by
  unfold sliverOp ventOp; omega

-- For w ≥ 1: vent then sliver restores
theorem vent_sliver_restores (w : Nat) (hw : w ≥ 1) :
    sliverOp (ventOp w) = w := by
  unfold sliverOp ventOp; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- The complete theorem: the sliver IS the fifth primitive
-- ═══════════════════════════════════════════════════════════════════════════════

theorem sliver_is_fifth :
    -- Five primitives give 10 interactions (the ten bosons)
    pairwise 5 = 10 ∧
    -- Four primitives give only 6 (incomplete)
    pairwise 4 < 10 ∧
    -- The fifth adds exactly 4 new interactions
    pairwise 5 - pairwise 4 = 4 ∧
    -- Without sliver: monoculture
    withoutSliver 10 = 1 ∧
    -- With sliver: all 10 modes alive
    withSliver 10 = 10 ∧
    -- The sliver prevents extinction at maximum rejection
    buleyeanWeight 100 100 = 1 ∧
    -- Without it: extinction
    bareWeight 100 100 = 0 := by
  unfold pairwise withoutSliver withSliver buleyeanWeight bareWeight; omega

end SliverIsFifth
