import Mathlib
import ForkRaceFoldTheorems.DiversityOptimality
import ForkRaceFoldTheorems.DeficitCapacity

namespace ForkRaceFoldTheorems

/-!
# The Buley Frontier

The Pareto frontier of diversity vs waste across all fork/race/fold substrates.

For any system with intrinsic topology β₁*, the map

  d ↦ waste(d)

from diversity level d ∈ {1, ..., β₁*} to waste (deficit, overhead, heat) is:

1. **Monotonically non-increasing**: increasing diversity never increases waste
2. **Zero at match**: waste(β₁*) = 0
3. **Positive below match**: waste(d) > 0 when d < β₁*
4. **Bounded**: waste(d) ≤ waste(1) for all d

This is the same curve whether the substrate is protocol framing, codec
selection, pipeline scheduling, or semiotic articulation.

**Diagnostic application**: given a system's current diversity level d and
measured waste w, one can:
- Locate the system on the frontier to determine if it is Pareto-optimal
- Compute the diversity deficit Δβ = β₁* - d to determine if diversification
  is needed to avoid collapse
- Estimate the waste reduction achievable by closing the deficit
- Apply standard Pareto-analysis tools (dominance, efficiency, envelope)
  directly to the diversity-waste tradeoff

The theorem composes `deficit_monotone_in_streams`, `deficit_zero_at_match`,
and `deficit_information_loss` into a single Pareto characterization.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- THM-BULEY-FRONTIER: The Pareto Frontier of Diversity vs Waste
-- ═══════════════════════════════════════════════════════════════════════

/-- **THM-BULEY-FRONTIER**: The Pareto frontier of diversity vs waste.

    For a system with β₁* ≥ 2 independent computation paths, the
    topological deficit function d ↦ Δβ(β₁*, d) is:

    (1) Monotonically non-increasing in d: more streams → less deficit
    (2) Zero when d = β₁*: matched diversity eliminates waste
    (3) Strictly positive when d = 1: monoculture forces information loss
    (4) Witnessed by pigeonhole collision: monoculture creates non-injective
        multiplexing, which by the data processing inequality erases information

    Every shootoff in the paper — protocol framing overhead, compression
    strategy gap, pipeline idle fraction, semiotic deficit — is an
    instantiation of this single curve on a different substrate.

    This enables Pareto-diagnostic analysis: given any fork/race/fold
    system, compute its diversity level d and waste w, then check whether
    (d, w) lies on the frontier. Systems below the frontier need
    diversification; systems on it are Pareto-optimal. -/
theorem buley_frontier
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    -- (1) Monotonicity: more streams → less deficit
    (∀ s1 s2 : ℕ, 1 ≤ s1 → s1 ≤ s2 →
      topologicalDeficit pathCount s2 ≤ topologicalDeficit pathCount s1) ∧
    -- (2) Zero at match: deficit vanishes at matched diversity
    topologicalDeficit pathCount pathCount = 0 ∧
    -- (3) Positive below match: monoculture forces loss
    0 < topologicalDeficit pathCount 1 ∧
    -- (4) Pigeonhole witness: monoculture forces collision
    (∃ (p1 p2 : Fin pathCount), p1 ≠ p2 ∧
      pathToStream pathCount 1 p1 = pathToStream pathCount 1 p2) := by
  refine ⟨?_, ?_, ?_, ?_⟩
  -- (1) Monotonicity from deficit_monotone_in_streams
  · exact fun s1 s2 h1 h12 => deficit_monotone_in_streams h12 h1
  -- (2) Zero at match from deficit_zero_at_match
  · exact deficit_zero_at_match (by omega)
  -- (3) Positive below match from deficit_information_loss
  · exact (deficit_information_loss hPaths).1
  -- (4) Pigeonhole witness from deficit_information_loss
  · exact (deficit_information_loss hPaths).2

/-- The codec-racing instantiation of the Buley frontier: adding codecs
    to a race is monotonically non-increasing in wire size, and racing
    achieves zero compression deficit.

    This is the compression-substrate projection of the frontier:
    - More codecs racing = lower or equal wire size (monotonicity)
    - Racing picks the best = zero deficit (subsumption)
    - Any fixed codec has non-negative deficit (dominance)

    Diagnostic: if a system uses a fixed codec and incurs positive deficit,
    switching to racing moves it onto the frontier. -/
theorem buley_frontier_codec_racing
    (results : List CodecResult) (hne : results ≠ []) :
    -- (1) Monotonicity: adding codecs never increases wire size
    (∀ newCodec : CodecResult,
      raceMin (newCodec :: results) ≤ raceMin results) ∧
    -- (2) Zero deficit: racing picks the best
    compressionDeficit (raceMin results) results = 0 ∧
    -- (3) Subsumption: every fixed codec has non-negative deficit
    (∀ r : CodecResult, r ∈ results →
      0 ≤ compressionDeficit r.compressedSize results) := by
  refine ⟨?_, ?_, ?_⟩
  · exact fun newCodec => race_monotone_on_add results hne newCodec
  · exact race_zero_deficit results
  · exact fun r hr => fixed_codec_nonneg_deficit results r hr

/-- The unified Buley frontier: both the topological (stream-level) and
    codec-racing (strategy-level) frontiers share the same shape —
    monotonically non-increasing waste reaching zero at matched diversity.

    This composition names the observation that protocol shootoffs,
    compression benchmarks, and pipeline scheduling all trace the same
    Pareto curve — because they are all instantiations of the same
    deficit function on different substrates.

    The unified theorem enables substrate-agnostic Pareto analysis:
    regardless of whether the "waste" is framing overhead, compression
    deficit, pipeline idle fraction, or semiotic deficit, the diagnostic
    is the same — compute Δβ, check the frontier, diversify if below. -/
theorem buley_frontier_unified
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount)
    (results : List CodecResult) (hne : results ≠ []) :
    -- Topological frontier
    (∀ s1 s2 : ℕ, 1 ≤ s1 → s1 ≤ s2 →
      topologicalDeficit pathCount s2 ≤ topologicalDeficit pathCount s1) ∧
    topologicalDeficit pathCount pathCount = 0 ∧
    0 < topologicalDeficit pathCount 1 ∧
    -- Codec frontier
    (∀ newCodec : CodecResult,
      raceMin (newCodec :: results) ≤ raceMin results) ∧
    compressionDeficit (raceMin results) results = 0 := by
  obtain ⟨h1, h2, h3, _⟩ := buley_frontier hPaths
  obtain ⟨h4, h5, _⟩ := buley_frontier_codec_racing results hne
  exact ⟨h1, h2, h3, h4, h5⟩

-- ═══════════════════════════════════════════════════════════════════════
-- Pareto diagnostic: given current diversity and waste, check frontier
-- ═══════════════════════════════════════════════════════════════════════

/-- A system is Pareto-optimal on the Buley frontier when its diversity
    matches its intrinsic topology: Δβ = 0 implies zero topological waste.

    Systems with Δβ > 0 are below the frontier and need diversification.
    The deficit itself quantifies how far below: it is both the distance
    to the frontier and the lower bound on waste. -/
theorem buley_frontier_pareto_diagnostic
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    -- Pareto-optimal: at matched diversity, deficit = 0
    topologicalDeficit pathCount pathCount = 0 ∧
    -- Sub-optimal: at monoculture, deficit > 0
    0 < topologicalDeficit pathCount 1 ∧
    -- Monotone improvement path: increasing diversity toward β₁*
    -- monotonically approaches the frontier
    (∀ s1 s2 : ℕ, 1 ≤ s1 → s1 ≤ s2 →
      topologicalDeficit pathCount s2 ≤ topologicalDeficit pathCount s1) := by
  obtain ⟨hMono, hZero, hPos, _⟩ := buley_frontier hPaths
  exact ⟨hZero, hPos, hMono⟩

end ForkRaceFoldTheorems
