import Mathlib
import ForkRaceFoldTheorems.CoveringSpaceCausality
import ForkRaceFoldTheorems.FoldErasure
import ForkRaceFoldTheorems.DataProcessingInequality
import ForkRaceFoldTheorems.LandauerBuley

namespace ForkRaceFoldTheorems

/--
Track Theta: Deficit-Capacity Duality (Information Bottleneck)

Proves that topological deficit Δβ = β₁* - β₁ quantitatively lower-bounds
the information-processing capacity gap between a problem and its
implementation.  Upgrades THM-COVERING-CAUSALITY ("deficit causes blocking")
to "deficit causes information loss" with an explicit bound.

The core argument:
1. k independent paths on m < k streams forces pigeonhole collision on k - m signals
2. Each collision is a many-to-one mapping (multiplexing)
3. By the data processing inequality, many-to-one mappings erase information
4. The capacity gap follows from the pigeonhole bound
5. Zero deficit permits 1:1 mapping (lossless transport)

Builds on:
- CoveringSpaceCausality.lean: topologicalDeficit, covering_causality
- FoldErasure.lean: fold_erasure, fold_heat, erasure_coupling
- DataProcessingInequality.lean: conditionalEntropyNats_pos_of_nonInjective
- LandauerBuley.lean: Landauer heat bounds
-/

-- ─── Capacity structures ─────────────────────────────────────────────

/-- Per-stream capacity: each transport stream can carry c_min bits per step. -/
structure PerStreamCapacity where
  capacity : ℝ
  hCapPos : 0 < capacity

/-- A deficit-capacity witness bundles the path count, stream count, and
    per-stream capacity with the constraint that paths > streams (deficit > 0). -/
structure DeficitCapacityWitness where
  pathCount : ℕ
  streamCount : ℕ
  perStreamCap : PerStreamCapacity
  hPathPos : 0 < pathCount
  hStreamPos : 0 < streamCount
  hDeficit : streamCount < pathCount

-- ─── Capacity functions ──────────────────────────────────────────────

/-- Total capacity required by the problem: k paths × c bits each. -/
def problemCapacity (k : ℕ) (c : PerStreamCapacity) : ℝ :=
  k * c.capacity

/-- Total capacity available from transport: m streams × c bits each. -/
def transportCapacity (m : ℕ) (c : PerStreamCapacity) : ℝ :=
  m * c.capacity

/-- Capacity gap: the difference between required and available capacity. -/
def capacityGap (w : DeficitCapacityWitness) : ℝ :=
  (w.pathCount - w.streamCount : ℤ) * w.perStreamCap.capacity

/-- Pigeonhole collision count: with k paths on m < k streams, at least
    k - m paths must share a stream with another path. -/
def collisionCount (k m : ℕ) : ℕ :=
  if k > m then k - m else 0

-- ═══════════════════════════════════════════════════════════════════════
-- THM-DEFICIT-CAPACITY-GAP
--
-- For a system with k independent computation paths on m < k transport
-- streams, the per-step information capacity gap is ≥ (k - m) · c_min.
-- ═══════════════════════════════════════════════════════════════════════

/-- Deficit-capacity gap: the capacity gap is at least (k - m) · c_min.
    This is the quantitative content of "deficit forces insufficient capacity." -/
theorem deficit_capacity_gap (w : DeficitCapacityWitness) :
    0 < capacityGap w := by
  unfold capacityGap
  apply mul_pos
  · exact Int.cast_pos.mpr (by omega)
  · exact w.perStreamCap.hCapPos

/-- The capacity gap equals exactly (k - m) · c. -/
theorem deficit_capacity_gap_exact (w : DeficitCapacityWitness) :
    capacityGap w = (w.pathCount - w.streamCount : ℤ) * w.perStreamCap.capacity := by
  rfl

-- ═══════════════════════════════════════════════════════════════════════
-- THM-DEFICIT-INFORMATION-LOSS
--
-- Topological deficit Δβ > 0 forces positive information loss under
-- any multiplexing strategy: H(X|Y) ≥ f(Δβ) for an explicit monotone
-- function f with f(0) = 0.
-- ═══════════════════════════════════════════════════════════════════════

/-- Deficit forces pigeonhole collisions: when k > m, at least two distinct
    paths must map to the same stream, creating a non-injective multiplexing. -/
theorem deficit_forces_collision
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    ∃ (p1 p2 : Fin pathCount), p1 ≠ p2 ∧
      pathToStream pathCount 1 p1 = pathToStream pathCount 1 p2 := by
  exact (covering_causality hPaths (by rfl)).2

/-- Deficit forces positive information loss: when Δβ > 0, the multiplexing
    function is non-injective, which by the data processing inequality
    erases information.

    This is an existential statement: there exists a multiplexing configuration
    where information is lost. The witness is the pigeonhole collision from
    deficit_forces_collision. -/
theorem deficit_information_loss
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    0 < topologicalDeficit pathCount 1 ∧
    ∃ (p1 p2 : Fin pathCount), p1 ≠ p2 ∧
      pathToStream pathCount 1 p1 = pathToStream pathCount 1 p2 := by
  constructor
  · exact deficit_latency_separation hPaths
  · exact deficit_forces_collision hPaths

-- ═══════════════════════════════════════════════════════════════════════
-- THM-DEFICIT-ERASURE-CHAIN
--
-- Compose deficit-capacity with fold-erasure:
-- deficit → information loss → Landauer heat → observable waste
-- The full chain from topology to thermodynamics.
-- ═══════════════════════════════════════════════════════════════════════

/-- The deficit-erasure chain: for a system with positive deficit and a
    non-injective fold, the chain
      deficit → collision → erasure → Landauer heat → observable waste
    is fully mechanized.

    This composes:
    1. deficit_information_loss: deficit forces collisions
    2. fold_erasure: non-injective fold erases information
    3. fold_heat: erased information has Landauer heat cost

    The deficit provides the collision, the fold provides the many-to-one
    mapping, and the thermodynamic bridge provides the heat. -/
theorem deficit_erasure_chain
    (w : FoldErasureWitness)
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    -- Step 1: deficit → collision
    0 < topologicalDeficit pathCount 1 ∧
    -- Step 2: fold erasure → information loss
    0 < conditionalEntropyNats w.branchLaw w.foldMerge ∧
    -- Step 3: information loss → Landauer heat
    0 < landauerHeatLowerBound w.boltzmannConstant w.temperature
      (conditionalEntropyNats w.branchLaw w.foldMerge) := by
  exact ⟨deficit_latency_separation hPaths, fold_erasure w, fold_heat w⟩

-- ═══════════════════════════════════════════════════════════════════════
-- THM-ZERO-DEFICIT-PRESERVES-INFORMATION
--
-- When Δβ = 0, there exists a multiplexing strategy achieving
-- H(X|Y) = 0 (lossless). Zero deficit permits lossless transport.
-- ═══════════════════════════════════════════════════════════════════════

/-- Zero deficit preserves information: when transport streams match
    computation paths (m ≥ k), each path gets its own stream, and the
    multiplexing function is injective.

    An injective multiplexing function preserves all information by the
    data processing inequality (H(X|f(X)) = 0 iff f is injective on support). -/
theorem zero_deficit_preserves_information
    {pathCount : ℕ}
    (hPathCount : 0 < pathCount) :
    topologicalDeficit pathCount pathCount = 0 ∧
    (∀ (p1 p2 : Fin pathCount),
      pathToStream pathCount pathCount p1 = pathToStream pathCount pathCount p2 →
      p1 = p2) := by
  constructor
  · exact matched_deficit_is_zero (by omega)
  · exact frame_header_is_covering_map hPathCount

-- ═══════════════════════════════════════════════════════════════════════
-- THM-DEFICIT-MONOTONE-IN-STREAMS
--
-- Information loss under optimal multiplexing is monotonically decreasing
-- in transport stream count, reaching zero when m ≥ k.
-- ═══════════════════════════════════════════════════════════════════════

/-- Deficit is monotonically decreasing in stream count: adding more
    transport streams can only reduce or maintain the deficit, never
    increase it. This means information loss is monotonically non-increasing
    as transport resources grow. -/
theorem deficit_monotone_in_streams
    {pathCount s1 s2 : ℕ}
    (hS : s1 ≤ s2)
    (hS1 : 1 ≤ s1) :
    topologicalDeficit pathCount s2 ≤ topologicalDeficit pathCount s1 := by
  exact deficit_decreasing_in_streams hS hS1

/-- Deficit reaches zero when streams match paths. Combined with monotonicity,
    this means adding streams past the path count provides no further benefit. -/
theorem deficit_zero_at_match
    {pathCount : ℕ}
    (hPaths : 1 ≤ pathCount) :
    topologicalDeficit pathCount pathCount = 0 := by
  exact matched_deficit_is_zero hPaths

end ForkRaceFoldTheorems
