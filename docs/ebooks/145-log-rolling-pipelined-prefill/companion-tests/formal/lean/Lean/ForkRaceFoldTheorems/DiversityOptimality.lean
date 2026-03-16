import Mathlib
import ForkRaceFoldTheorems.CodecRacing
import ForkRaceFoldTheorems.DeficitCapacity
import ForkRaceFoldTheorems.FoldErasure
import ForkRaceFoldTheorems.FailureTrilemma
import ForkRaceFoldTheorems.CoveringSpaceCausality

namespace ForkRaceFoldTheorems

/-!
# THM-DIVERSITY-OPTIMALITY: The Diversity Theorem

Composes five independently mechanized pillars into a single statement:
diversity is the monotonically optimal, thermodynamically necessary condition
for information-preserving computation in fork/race/fold systems.

## Five Pillars

1. **Monotonicity** (CodecRacing): Adding a branch to a race can only decrease
   or maintain wire size. More options never hurts.

2. **Subsumption** (CodecRacing): Per-resource racing total ≤ every fixed-codec
   total. Diversity contains every monoculture as a special case.

3. **Necessity** (DeficitCapacity + CoveringSpaceCausality): Reducing diversity
   below the problem's intrinsic β₁ forces positive information loss via
   pigeonhole collision and the data processing inequality.

4. **Optimality** (DeficitCapacity + CoveringSpaceCausality): At matched
   diversity (streams = paths), deficit = 0 and transport is lossless.

5. **Irreversibility** (FailureTrilemma + FoldErasure): Collapsing from N > 1
   branches to 1 requires either vent cost or repair debt. The fold's
   information erasure incurs irreducible Landauer heat ≥ kT ln 2 · H.

This is a composition theorem: it names the conjunction of existing proofs
as a single result. No new mathematics; only the recognition that the five
pillars together prove diversity is optimal.
-/

-- ═══════════════════════════════════════════════════════════════════════════
-- The Diversity Theorem: structure bundling the five properties
-- ═══════════════════════════════════════════════════════════════════════════

/-- The five-pillar diversity optimality witness. Each field is a
    proposition witnessed by an existing mechanized theorem. -/
structure DiversityOptimalityWitness where
  -- System parameters
  pathCount : ℕ
  hPathCount : 2 ≤ pathCount

  -- Codec racing parameters (for monotonicity + subsumption)
  codecResults : List CodecResult
  hCodecNonempty : codecResults ≠ []

  -- Fold parameters (for irreversibility)
  foldWitness : FoldErasureWitness

  -- Collapse parameters (for irreversibility)
  branchBefore : List BranchSnapshot
  branchAfter : List BranchSnapshot
  hAligned : alignedSnapshots branchBefore branchAfter
  hForked : 1 < liveBranchCount branchBefore
  hCollapse : deterministicCollapse branchBefore branchAfter

-- ═══════════════════════════════════════════════════════════════════════════
-- Pillar 1: Monotonicity
-- Adding a branch to a race can only decrease or maintain the minimum.
-- ═══════════════════════════════════════════════════════════════════════════

/-- Pillar 1: More options, more paths, more strategies = monotonically
    better or equal. Never worse. Directly from CodecRacing.lean. -/
theorem diversity_monotonicity (results : List CodecResult)
    (newOption : CodecResult) :
    raceMin (newOption :: results) ≤ raceMin results :=
  race_monotone_on_add results newOption

-- ═══════════════════════════════════════════════════════════════════════════
-- Pillar 2: Subsumption
-- Racing achieves zero compression deficit; any fixed codec has ≥ deficit.
-- ═══════════════════════════════════════════════════════════════════════════

/-- Pillar 2: The diverse strategy (racing) achieves zero deficit, meaning
    it always picks the best available option. Any single strategy is a
    degenerate case. Directly from CodecRacing.lean. -/
theorem diversity_subsumption (results : List CodecResult) :
    compressionDeficit (raceMin results) results = 0 :=
  race_zero_deficit results

/-- Pillar 2 (corollary): Every fixed-strategy selection has non-negative
    deficit relative to the diverse racing strategy. -/
theorem diversity_subsumes_fixed (results : List CodecResult)
    (r : CodecResult) (hr : r ∈ results) :
    0 ≤ compressionDeficit r.compressedSize results :=
  fixed_codec_nonneg_deficit results r hr

-- ═══════════════════════════════════════════════════════════════════════════
-- Pillar 3: Necessity
-- Reducing diversity below β₁* forces positive information loss.
-- ═══════════════════════════════════════════════════════════════════════════

/-- Pillar 3: When diversity is reduced below the problem's intrinsic
    topology (pathCount paths on 1 stream), the topological deficit is
    positive and pigeonhole collisions are forced. Information is lost.
    Directly from DeficitCapacity.lean. -/
theorem diversity_necessity
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    0 < topologicalDeficit pathCount 1 ∧
    ∃ (p1 p2 : Fin pathCount), p1 ≠ p2 ∧
      pathToStream pathCount 1 p1 = pathToStream pathCount 1 p2 :=
  deficit_information_loss hPaths

-- ═══════════════════════════════════════════════════════════════════════════
-- Pillar 4: Optimality
-- Matched diversity (streams = paths) achieves zero deficit, lossless.
-- ═══════════════════════════════════════════════════════════════════════════

/-- Pillar 4: At matched diversity (N streams for N paths), the deficit is
    zero and the path-to-stream mapping is injective (lossless transport).
    Directly from DeficitCapacity.lean + CoveringSpaceCausality.lean. -/
theorem diversity_optimality
    {pathCount : ℕ}
    (hPathCount : 0 < pathCount) :
    topologicalDeficit pathCount pathCount = 0 ∧
    (∀ (p1 p2 : Fin pathCount),
      pathToStream pathCount pathCount p1 = pathToStream pathCount pathCount p2 →
      p1 = p2) :=
  zero_deficit_preserves_information hPathCount

-- ═══════════════════════════════════════════════════════════════════════════
-- Pillar 5: Irreversibility
-- Collapsing diversity has irreducible thermodynamic cost.
-- ═══════════════════════════════════════════════════════════════════════════

/-- Pillar 5a: Deterministic collapse from N > 1 branches to 1 requires
    either vent cost or repair debt. You cannot reduce diversity for free.
    Directly from FailureTrilemma.lean. -/
theorem diversity_collapse_requires_waste
    {before after : List BranchSnapshot}
    (hAligned : alignedSnapshots before after)
    (hForked : 1 < liveBranchCount before)
    (hCollapse : deterministicCollapse before after) :
    0 < ventedCount before after ∨ 0 < repairDebt before after :=
  deterministic_single_survivor_collapse_requires_waste hAligned hForked hCollapse

/-- Pillar 5b: The fold's information erasure incurs strictly positive
    Landauer heat. Collapsing distinct inputs generates irreversible
    thermodynamic waste. Directly from FoldErasure.lean. -/
theorem diversity_fold_generates_heat (w : FoldErasureWitness) :
    0 < landauerHeatLowerBound w.boltzmannConstant w.temperature
      (conditionalEntropyNats w.branchLaw w.foldMerge) :=
  fold_heat w

/-- Pillar 5c: The full deficit-erasure chain: deficit forces collision,
    fold erases information, erasure generates Landauer heat.
    The chain from topology to thermodynamics is complete.
    Directly from DeficitCapacity.lean. -/
theorem diversity_erasure_chain
    (w : FoldErasureWitness)
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    -- deficit → collision
    0 < topologicalDeficit pathCount 1 ∧
    -- fold erasure → information loss
    0 < conditionalEntropyNats w.branchLaw w.foldMerge ∧
    -- information loss → Landauer heat
    0 < landauerHeatLowerBound w.boltzmannConstant w.temperature
      (conditionalEntropyNats w.branchLaw w.foldMerge) :=
  deficit_erasure_chain w hPaths

-- ═══════════════════════════════════════════════════════════════════════════
-- THM-DIVERSITY-OPTIMALITY: The Master Composition
-- ═══════════════════════════════════════════════════════════════════════════

/-- **THM-DIVERSITY-OPTIMALITY**: The Diversity Theorem.

    For any fork/race/fold system with N ≥ 2 branches:

    1. The race-optimal result is monotonically non-increasing in N
       (more branches = better or equal).
    2. The race-optimal result subsumes every fixed-branch selection
       (diversity contains every singleton).
    3. Reducing N below the problem's intrinsic β₁ forces positive
       information loss (necessity).
    4. At N = β₁* + 1 (matched diversity), deficit = 0 and transport
       is lossless (optimality).
    5. Collapsing from N > 1 to 1 requires irreducible thermodynamic
       cost (irreversibility).

    Therefore: diversity is the monotonically optimal, thermodynamically
    necessary condition for information-preserving computation in
    fork/race/fold systems.

    This is a composition theorem: every conjunct is an existing
    mechanized theorem. The conjunction names what the five pillars
    together prove. -/
theorem diversity_optimality_master
    (w : DiversityOptimalityWitness) :
    -- Pillar 1: Monotonicity
    (∀ newOption : CodecResult,
      raceMin (newOption :: w.codecResults) ≤ raceMin w.codecResults) ∧
    -- Pillar 2: Subsumption (zero deficit under racing)
    compressionDeficit (raceMin w.codecResults) w.codecResults = 0 ∧
    -- Pillar 3: Necessity (deficit forces information loss)
    (0 < topologicalDeficit w.pathCount 1 ∧
     ∃ (p1 p2 : Fin w.pathCount), p1 ≠ p2 ∧
       pathToStream w.pathCount 1 p1 = pathToStream w.pathCount 1 p2) ∧
    -- Pillar 4: Optimality (matched diversity is lossless)
    (topologicalDeficit w.pathCount w.pathCount = 0 ∧
     ∀ (p1 p2 : Fin w.pathCount),
       pathToStream w.pathCount w.pathCount p1 =
         pathToStream w.pathCount w.pathCount p2 → p1 = p2) ∧
    -- Pillar 5: Irreversibility (collapse requires waste + heat)
    (0 < ventedCount w.branchBefore w.branchAfter ∨
     0 < repairDebt w.branchBefore w.branchAfter) ∧
    0 < conditionalEntropyNats w.foldWitness.branchLaw w.foldWitness.foldMerge ∧
    0 < landauerHeatLowerBound w.foldWitness.boltzmannConstant
      w.foldWitness.temperature
      (conditionalEntropyNats w.foldWitness.branchLaw w.foldWitness.foldMerge) := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_, ?_⟩
  -- Pillar 1: Monotonicity
  · exact fun newOption => diversity_monotonicity w.codecResults newOption
  -- Pillar 2: Subsumption
  · exact diversity_subsumption w.codecResults
  -- Pillar 3: Necessity
  · exact diversity_necessity w.hPathCount
  -- Pillar 4: Optimality
  · exact diversity_optimality (by omega)
  -- Pillar 5a: Collapse requires waste
  · exact diversity_collapse_requires_waste w.hAligned w.hForked w.hCollapse
  -- Pillar 5b: Fold erasure
  · exact fold_erasure w.foldWitness
  -- Pillar 5c: Landauer heat
  · exact fold_heat w.foldWitness

-- ═══════════════════════════════════════════════════════════════════════════
-- Deficit monotonicity bridge: connecting stream-level diversity to
-- the codec-racing diversity in a unified picture.
-- ═══════════════════════════════════════════════════════════════════════════

/-- Deficit decreases monotonically as diversity (stream count) increases.
    This bridges the codec-racing monotonicity (Pillar 1) with the
    topological deficit monotonicity (Pillar 3/4): in both cases,
    more diversity = less deficit = less loss. -/
theorem diversity_deficit_monotone
    {pathCount s1 s2 : ℕ}
    (hS : s1 ≤ s2)
    (hS1 : 1 ≤ s1) :
    topologicalDeficit pathCount s2 ≤ topologicalDeficit pathCount s1 :=
  deficit_monotone_in_streams hS hS1

end ForkRaceFoldTheorems
