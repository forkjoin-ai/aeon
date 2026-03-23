import Mathlib
import ForkRaceFoldTheorems.BosonPosition
import ForkRaceFoldTheorems.TenModeUnification

namespace ForkRaceFoldTheorems

/-!
# Black Holes As Void-Boundary Singularities

This module adds a minimal Lean shell for the black-hole bridge already present
in the executable companion tests. The scope is intentionally narrow:

- one collapsed mode has strictly higher rejection mass than the exterior modes;
- that collapsed mode is uniquely readable from the boundary;
- it is an anti-equilibrium site in the existing Aletheia / Skyrms-walker sense;
- uniform finite recovery does not erase the ordering once the gap exists;
- the ten-mode interpretation supplies exactly one candidate void touchpoint.

What this module does **not** prove is the stronger cosmology claim that every
astrophysical black hole literally is the monad touchpoint of the global
interlocking-torus surface. The candidate-touchpoint theorem is stated
explicitly as a candidate so the mechanized surface stays honest.
-/

/-- A black-hole witness in the current finite kenoma vocabulary.

One mode carries a positive singularity gap above the uniform background
rejection level, while a distinct exterior mode witnesses the readable outside
surface. `leakageFloor` is the positive residual channel that keeps the exterior
complement weight above zero. -/
structure BlackHoleBoundary where
  modeCount : ℕ
  two_or_more : 2 ≤ modeCount
  collapsedMode : Fin modeCount
  exteriorMode : Fin modeCount
  exteriorDistinct : exteriorMode ≠ collapsedMode
  backgroundRejections : ℕ
  singularityGap : ℕ
  positiveGap : 0 < singularityGap
  leakageFloor : ℕ
  leakageFloorPos : 0 < leakageFloor

/-- Boundary rejection profile: the collapsed mode carries the singularity gap,
every exterior mode carries the same background level. -/
def BlackHoleBoundary.boundaryRejections (bh : BlackHoleBoundary)
    (i : Fin bh.modeCount) : ℕ :=
  if i = bh.collapsedMode then bh.backgroundRejections + bh.singularityGap
  else bh.backgroundRejections

/-- A finite total rejection budget large enough to witness both the singularity
gap and the residual leakage floor. -/
def BlackHoleBoundary.totalRejections (bh : BlackHoleBoundary) : ℕ :=
  bh.modeCount + bh.backgroundRejections + bh.singularityGap + bh.leakageFloor

/-- The black-hole boundary re-read as the existing BosonPosition kenoma. -/
def BlackHoleBoundary.toKenoma (bh : BlackHoleBoundary) :
    BosonPosition.Kenoma bh.modeCount where
  rejections := bh.boundaryRejections
  totalRejections := bh.totalRejections
  total_ge := by
    unfold BlackHoleBoundary.totalRejections
    omega
  bounded := by
    intro i
    unfold BlackHoleBoundary.boundaryRejections BlackHoleBoundary.totalRejections
    by_cases h : i = bh.collapsedMode
    · simp [h]
      omega
    · simp [h]
      omega

/-- The post-recovery boundary after adding the same finite recovery budget to
every mode. -/
def BlackHoleBoundary.recoveredBoundaryRejections (bh : BlackHoleBoundary)
    (recovery : ℕ) (i : Fin bh.modeCount) : ℕ :=
  bh.boundaryRejections i + recovery

/-- Exterior complement weight interpreted as Hawking-style leakage: the
collapsed site remains singular, but the readable outside surface still carries
positive complement mass. -/
def BlackHoleBoundary.hawkingLeakage (bh : BlackHoleBoundary) : ℕ :=
  BosonPosition.sophiaWeight bh.toKenoma bh.exteriorMode

/-- The collapsed mode has strictly larger rejection mass than any exterior
mode, so the singularity is boundary-readable. -/
theorem collapsed_mode_boundary_dominates (bh : BlackHoleBoundary)
    (j : Fin bh.modeCount) (hj : j ≠ bh.collapsedMode) :
    bh.boundaryRejections bh.collapsedMode > bh.boundaryRejections j := by
  have hCollapsed :
      bh.boundaryRejections bh.collapsedMode =
        bh.backgroundRejections + bh.singularityGap := by
    unfold BlackHoleBoundary.boundaryRejections
    simp
  have hExterior :
      bh.boundaryRejections j = bh.backgroundRejections := by
    unfold BlackHoleBoundary.boundaryRejections
    simp [hj]
  have hGapDominates :
      bh.backgroundRejections + bh.singularityGap > bh.backgroundRejections := by
    exact Nat.lt_add_of_pos_right bh.positiveGap
  simpa [hCollapsed, hExterior] using hGapDominates

/-- The boundary uniquely recovers the collapsed mode: no exterior mode can
share the singularity's rejection mass. -/
theorem boundary_recovers_collapsed_mode (bh : BlackHoleBoundary)
    (j : Fin bh.modeCount)
    (hReadable :
      bh.boundaryRejections j = bh.boundaryRejections bh.collapsedMode) :
    j = bh.collapsedMode := by
  by_cases h : j = bh.collapsedMode
  · exact h
  · have hDom := collapsed_mode_boundary_dominates bh j h
    exfalso
    exact (Nat.ne_of_gt hDom) hReadable.symm

/-- Exterior complement weight strictly exceeds the collapsed-mode complement
weight. The singularity is depleted relative to the outside surface. -/
theorem exterior_weight_exceeds_collapsed (bh : BlackHoleBoundary) :
    BosonPosition.sophiaWeight bh.toKenoma bh.exteriorMode >
      BosonPosition.sophiaWeight bh.toKenoma bh.collapsedMode := by
  have hExterior :
      BosonPosition.sophiaWeight bh.toKenoma bh.exteriorMode =
        bh.modeCount + bh.singularityGap + bh.leakageFloor := by
    unfold BosonPosition.sophiaWeight
    simp [BlackHoleBoundary.toKenoma, BlackHoleBoundary.totalRejections,
      BlackHoleBoundary.boundaryRejections, bh.exteriorDistinct]
    omega
  have hCollapsed :
      BosonPosition.sophiaWeight bh.toKenoma bh.collapsedMode =
        bh.modeCount + bh.leakageFloor := by
    unfold BosonPosition.sophiaWeight
    simp [BlackHoleBoundary.toKenoma, BlackHoleBoundary.totalRejections,
      BlackHoleBoundary.boundaryRejections]
    omega
  have hGapDominates :
      bh.modeCount + bh.singularityGap + bh.leakageFloor >
        bh.modeCount + bh.leakageFloor := by
    have h :
        bh.modeCount + bh.leakageFloor <
          bh.modeCount + bh.leakageFloor + bh.singularityGap := by
      exact Nat.lt_add_of_pos_right bh.positiveGap
    simpa [Nat.add_assoc, Nat.add_left_comm, Nat.add_comm] using h
  simpa [hExterior, hCollapsed] using hGapDominates

/-- The collapsed mode is an anti-equilibrium site: the propagator points away
from it toward the exterior surface. -/
theorem singularity_is_anti_equilibrium (bh : BlackHoleBoundary) :
    BosonPosition.propagatorAmplitude
        bh.toKenoma bh.collapsedMode bh.exteriorMode > 0 := by
  apply BosonPosition.propagator_toward_sophia
  simpa [BlackHoleBoundary.toKenoma] using
    collapsed_mode_boundary_dominates bh bh.exteriorMode bh.exteriorDistinct

/-- The collapsed mode cannot be an Aletheia / Nash equilibrium point. -/
theorem collapsed_mode_not_aletheia (bh : BlackHoleBoundary) :
    ¬ BosonPosition.isAletheiaPeak bh.toKenoma bh.collapsedMode := by
  intro hPeak
  have hLe :
      bh.boundaryRejections bh.collapsedMode ≤
        bh.boundaryRejections bh.exteriorMode := by
    simpa [BlackHoleBoundary.toKenoma] using hPeak bh.exteriorMode
  have hGt := collapsed_mode_boundary_dominates bh bh.exteriorMode bh.exteriorDistinct
  omega

/-- Hawking-style leakage stays positive on the exterior surface. -/
theorem hawking_leakage_positive (bh : BlackHoleBoundary) :
    0 < bh.hawkingLeakage := by
  have hExterior :
      bh.hawkingLeakage = bh.modeCount + bh.singularityGap + bh.leakageFloor := by
    unfold BlackHoleBoundary.hawkingLeakage BosonPosition.sophiaWeight
    simp [BlackHoleBoundary.toKenoma, BlackHoleBoundary.totalRejections,
      BlackHoleBoundary.boundaryRejections, bh.exteriorDistinct]
    omega
  have hModePos : 0 < bh.modeCount := by
    exact lt_of_lt_of_le (by decide : 0 < 2) bh.two_or_more
  have hLeakagePos :
      0 < bh.modeCount + bh.singularityGap + bh.leakageFloor := by
    omega
  simpa [hExterior] using hLeakagePos

/-- Uniform finite recovery does not erase the readable singularity ordering.
Adding the same amount of recovery to every mode preserves the unique boundary
maximum at the collapsed site. -/
theorem uniform_recovery_preserves_boundary_readability
    (bh : BlackHoleBoundary) (recovery : ℕ) (j : Fin bh.modeCount)
    (hReadable :
      bh.recoveredBoundaryRejections recovery j =
        bh.recoveredBoundaryRejections recovery bh.collapsedMode) :
    j = bh.collapsedMode := by
  by_cases h : j = bh.collapsedMode
  · exact h
  · have hDom :
      bh.recoveredBoundaryRejections recovery bh.collapsedMode >
        bh.recoveredBoundaryRejections recovery j := by
      unfold BlackHoleBoundary.recoveredBoundaryRejections
      have hBase := collapsed_mode_boundary_dominates bh j h
      omega
    exfalso
    exact (Nat.ne_of_gt hDom) hReadable.symm

/-- A ten-mode black-hole witness. The black-hole structure is finite, and in
the ten-mode reading it lives on the same 10-world surface used by the existing
interlocking-tori theorems. -/
structure TenModeBlackHole extends BlackHoleBoundary where
  tenModes : modeCount = 10

/-- The current mechanized ten-mode surface supplies exactly one candidate
touchpoint to the monad / void anchor. This is a candidate theorem, not the
full astrophysical identification. -/
def TenModeBlackHole.candidateTouchpointCount (_ : TenModeBlackHole) : ℕ :=
  10 - TenModeUnification.interlockingTori 10

/-- In the ten-mode reading there is exactly one candidate void touchpoint
outside the nine interlocking tori. -/
theorem ten_mode_black_hole_has_unique_candidate_touchpoint
    (bh : TenModeBlackHole) :
    bh.candidateTouchpointCount = 1 := by
  unfold TenModeBlackHole.candidateTouchpointCount
  exact TenModeUnification.ten_mode_has_unique_void_anchor

-- ═══════════════════════════════════════════════════════════════════════
-- Stronger cosmology model: the global interlocking-torus surface has
-- nine torus carriers and one monad touchpoint, and the singularity
-- localizes at the monad node.
-- ═══════════════════════════════════════════════════════════════════════

/-- Nodes of the global interlocking-torus surface: nine torus carriers and
one named monad touchpoint. -/
inductive GlobalSurfaceNode where
  | torus (carrier : Fin 9)
  | monad
  deriving DecidableEq, Repr

/-- Explicit global cosmology model for an astrophysical black-hole witness.
The monad node carries the singularity gap; every torus carrier stays at the
shared background level. -/
structure AstrophysicalBlackHoleModel where
  backgroundRejections : ℕ
  singularityGap : ℕ
  positiveGap : 0 < singularityGap
  leakageFloor : ℕ
  leakageFloorPos : 0 < leakageFloor

/-- Boundary rejection profile on the explicit global surface. -/
def AstrophysicalBlackHoleModel.boundaryRejections
    (m : AstrophysicalBlackHoleModel) : GlobalSurfaceNode → ℕ
  | .torus _ => m.backgroundRejections
  | .monad => m.backgroundRejections + m.singularityGap

/-- The explicit global surface still matches the existing ten-mode count:
nine torus carriers plus one monad touchpoint. -/
theorem global_surface_matches_ten_mode_split :
    TenModeUnification.interlockingTori 10 = 9 ∧
      10 - TenModeUnification.interlockingTori 10 = 1 := by
  constructor
  · exact TenModeUnification.ten_mode_has_nine_interlocking_tori
  · exact TenModeUnification.ten_mode_has_unique_void_anchor

/-- On the global surface, the monad boundary strictly dominates every torus
carrier. -/
theorem monad_boundary_dominates_torus (m : AstrophysicalBlackHoleModel)
    (i : Fin 9) :
    m.boundaryRejections .monad > m.boundaryRejections (.torus i) := by
  exact Nat.lt_add_of_pos_right m.positiveGap

/-- The boundary uniquely recovers the monad touchpoint on the explicit global
surface. -/
theorem boundary_recovers_monad_touchpoint (m : AstrophysicalBlackHoleModel)
    (node : GlobalSurfaceNode)
    (hReadable :
      m.boundaryRejections node = m.boundaryRejections .monad) :
    node = .monad := by
  cases node with
  | monad =>
      rfl
  | torus i =>
      exfalso
      exact (Nat.ne_of_gt (monad_boundary_dominates_torus m i)) hReadable.symm

/-- Stronger cosmology theorem, model-relative and sorry-free: within the
explicit global interlocking-torus cosmology model, every black-hole witness is
the monad touchpoint. -/
theorem astrophysical_black_hole_is_monad_touchpoint
    (m : AstrophysicalBlackHoleModel) :
    ∀ node,
      m.boundaryRejections node = m.boundaryRejections .monad →
        node = .monad := by
  intro node hReadable
  exact boundary_recovers_monad_touchpoint m node hReadable

end ForkRaceFoldTheorems
