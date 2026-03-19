import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.DiversityOptimality
import ForkRaceFoldTheorems.AmericanFrontier
import ForkRaceFoldTheorems.RenormalizationFixedPoints
import ForkRaceFoldTheorems.StagedExpansion
import ForkRaceFoldTheorems.DeficitCapacity

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions Round 14: Diversity Optimality, American Frontier,
  Renormalization Fixed Points, Staged Expansion, Deficit Capacity

Five predictions composing the newly repaired DiversityOptimality +
AmericanFrontier alongside RenormalizationFixedPoints, StagedExpansion,
and DeficitCapacity -- families that were untapped in the user's
prediction rounds.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction A: Diversity Racing Subsumes Any Fixed Strategy
-- ═══════════════════════════════════════════════════════════════════════

/-- Diversity subsumption: racing achieves zero compression deficit. -/
theorem diversity_racing_zero_deficit (results : List CodecResult)  :
    compressionDeficit (raceMin results) results = 0 :=
  diversity_subsumption results

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction B: Matched Diversity Eliminates Deficit and Is Lossless
-- ═══════════════════════════════════════════════════════════════════════

/-- At matched diversity (N streams for N paths), the deficit is zero
    and the mapping is injective (no information loss). -/
theorem matched_diversity_optimal (pathCount : ℕ) (hPos : 0 < pathCount) :
    topologicalDeficit pathCount pathCount = 0 ∧
    (∀ (p1 p2 : Fin pathCount),
      pathToStream pathCount pathCount p1 = pathToStream pathCount pathCount p2 →
      p1 = p2) :=
  diversity_optimality hPos

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction C: Staged Expansion Frontier Area Is Conserved
-- ═══════════════════════════════════════════════════════════════════════

/-- Staged vs naive: same total frontier area. -/
theorem staged_equals_naive (peak left right : ℕ) :
    stagedExpansionFrontierArea peak left right =
    naiveWidenFrontierArea peak (left + right) :=
  staged_frontier_area_matches_naive peak left right

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction D: Deficit Forces Multiplexing Collision
-- ═══════════════════════════════════════════════════════════════════════

/-- With ≥ 2 paths and 1 stream, pigeonhole forces a collision. -/
theorem deficit_forces_pigeonhole (pathCount : ℕ) (hPaths : 2 ≤ pathCount) :
    ∃ (p1 p2 : Fin pathCount), p1 ≠ p2 ∧
      pathToStream pathCount 1 p1 = pathToStream pathCount 1 p2 :=
  deficit_forces_collision hPaths

-- ═══════════════════════════════════════════════════════════════════════
-- Prediction E: Buleyean Weight Positivity + Concentration Compose
-- ═══════════════════════════════════════════════════════════════════════

/-- All choices retain positive weight. -/
theorem all_choices_survive (bs : BuleyeanSpace) (i : Fin bs.numChoices) :
    0 < bs.weight i :=
  buleyean_positivity bs i

/-- Less rejected = higher weight. -/
theorem less_rejected_preferred (bs : BuleyeanSpace)
    (i j : Fin bs.numChoices)
    (hLess : bs.voidBoundary i ≤ bs.voidBoundary j) :
    bs.weight j ≤ bs.weight i :=
  buleyean_concentration bs i j hLess

-- ═══════════════════════════════════════════════════════════════════════
-- Master Theorem
-- ═══════════════════════════════════════════════════════════════════════

theorem predictions_round14_master (bs : BuleyeanSpace) :
    -- A: Racing achieves zero deficit
    (∀ (results : List CodecResult),
      compressionDeficit (raceMin results) results = 0) ∧
    -- C: Staged = naive area
    (∀ p l r, stagedExpansionFrontierArea p l r = naiveWidenFrontierArea p (l + r)) ∧
    -- E: All weights positive
    (∀ i, 0 < bs.weight i) :=
  ⟨diversity_subsumption,
   staged_frontier_area_matches_naive,
   buleyean_positivity bs⟩

end ForkRaceFoldTheorems
