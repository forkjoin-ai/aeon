import ForkRaceFoldTheorems.NestedWallingtonTower

/-!
# Wallington Surface Admissibility

This module makes the phrase "best admissible surface" precise for the current
off-by-one geometry.

At ambient dimension `n`, a candidate Wallington surface with `k` stages is
admissible exactly when its Wallington lift closes back to the same ambient
dimension:

  `wallingtonDimension k = n`.

Under that criterion, the only admissible stage count is `k = n - 1`. Smaller
stage counts undershoot the ambient dimension, and larger ones overshoot it.
So "best" here means "the unique admissible ambient-matching surface", not a
stronger optimization claim over unrelated geometric objectives.
-/

namespace ForkRaceFoldTheorems

/-- A stage count is admissible for an ambient dimension when the Wallington
lift closes exactly to that ambient dimension. -/
def admissibleWallingtonSurface (ambientDimension stages : Nat) : Prop :=
  1 ≤ ambientDimension ∧
    DimensionalConfinement.wallingtonDimension stages = ambientDimension

/-- The best admissible surface is the unique admissible stage count for that
ambient dimension. -/
def bestAdmissibleWallingtonSurface (ambientDimension stages : Nat) : Prop :=
  admissibleWallingtonSurface ambientDimension stages ∧
    ∀ otherStages,
      admissibleWallingtonSurface ambientDimension otherStages →
        otherStages = stages

theorem visible_torus_rank_is_admissible_surface
    (ambientDimension : Nat) (h : 1 ≤ ambientDimension) :
    admissibleWallingtonSurface ambientDimension
      (visibleTorusRank ambientDimension) := by
  refine ⟨h, ?_⟩
  unfold visibleTorusRank DimensionalConfinement.wallingtonDimension
  omega

theorem admissible_surface_iff_eq_visible_torus_rank
    (ambientDimension stages : Nat) (h : 1 ≤ ambientDimension) :
    admissibleWallingtonSurface ambientDimension stages ↔
      stages = visibleTorusRank ambientDimension := by
  constructor
  · intro hadm
    rcases hadm with ⟨_, hdim⟩
    unfold visibleTorusRank DimensionalConfinement.wallingtonDimension at *
    omega
  · intro hEq
    rw [hEq]
    exact visible_torus_rank_is_admissible_surface ambientDimension h

theorem smaller_surface_undershoots_ambient
    (ambientDimension stages : Nat) (h : 1 ≤ ambientDimension)
    (hsmall : stages < visibleTorusRank ambientDimension) :
    DimensionalConfinement.wallingtonDimension stages < ambientDimension := by
  unfold visibleTorusRank DimensionalConfinement.wallingtonDimension at *
  omega

theorem larger_surface_overshoots_ambient
    (ambientDimension stages : Nat) (h : 1 ≤ ambientDimension)
    (hlarge : visibleTorusRank ambientDimension < stages) :
    ambientDimension < DimensionalConfinement.wallingtonDimension stages := by
  unfold visibleTorusRank DimensionalConfinement.wallingtonDimension at *
  omega

theorem smaller_surface_not_admissible
    (ambientDimension stages : Nat) (h : 1 ≤ ambientDimension)
    (hsmall : stages < visibleTorusRank ambientDimension) :
    ¬ admissibleWallingtonSurface ambientDimension stages := by
  intro hadm
  have hunder :
      DimensionalConfinement.wallingtonDimension stages < ambientDimension :=
    smaller_surface_undershoots_ambient ambientDimension stages h hsmall
  rcases hadm with ⟨_, hdim⟩
  omega

theorem larger_surface_not_admissible
    (ambientDimension stages : Nat) (h : 1 ≤ ambientDimension)
    (hlarge : visibleTorusRank ambientDimension < stages) :
    ¬ admissibleWallingtonSurface ambientDimension stages := by
  intro hadm
  have hover :
      ambientDimension < DimensionalConfinement.wallingtonDimension stages :=
    larger_surface_overshoots_ambient ambientDimension stages h hlarge
  rcases hadm with ⟨_, hdim⟩
  omega

theorem visible_torus_rank_is_best_admissible_surface
    (ambientDimension : Nat) (h : 1 ≤ ambientDimension) :
    bestAdmissibleWallingtonSurface ambientDimension
      (visibleTorusRank ambientDimension) := by
  refine ⟨visible_torus_rank_is_admissible_surface ambientDimension h, ?_⟩
  intro otherStages hOther
  exact (admissible_surface_iff_eq_visible_torus_rank ambientDimension otherStages h).1 hOther

theorem best_admissible_surface_is_n_minus_one
    (ambientDimension : Nat) (h : 1 ≤ ambientDimension) :
    bestAdmissibleWallingtonSurface ambientDimension (ambientDimension - 1) := by
  simpa [visibleTorusRank] using
    visible_torus_rank_is_best_admissible_surface ambientDimension h

theorem three_d_slice_has_two_torus_as_best_admissible_surface :
    bestAdmissibleWallingtonSurface ourVisibleAmbientDimension 2 := by
  rw [our_visible_ambient_dimension_is_three]
  exact best_admissible_surface_is_n_minus_one 3 (by omega)

end ForkRaceFoldTheorems
