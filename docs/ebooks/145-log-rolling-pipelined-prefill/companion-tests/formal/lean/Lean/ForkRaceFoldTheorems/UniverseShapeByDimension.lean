import ForkRaceFoldTheorems.CelestialOffByOneTaxonomy

/-!
# Universe Shape By Dimension

This module keeps the universe-shape claim honest. The off-by-one law

  `wallingtonDimension stages = stages + 1`

already says that a visible ambient `d`-surface is carried by a
`(d - 1)`-cycle torus. So a `3D` visible slice is a `2`-torus with
`β₁ = 2`, but that does *not* promote to the dimension-free claim that
every ambient surface is a `2`-torus. Higher ambient dimensions lift the
torus rank instead of freezing it.
-/

namespace ForkRaceFoldTheorems

/-- The torus rank seen by an ambient slice is the off-by-one inverse of
the Wallington dimension law. -/
def visibleTorusRank (ambientDimension : Nat) : Nat :=
  ambientDimension - 1

/-- A visible ambient slice is toroidal when the off-by-one law closes
back to the same ambient dimension. -/
def toroidalVisibleShape (ambientDimension : Nat) : Prop :=
  1 ≤ ambientDimension ∧
    DimensionalConfinement.wallingtonDimension
      (visibleTorusRank ambientDimension) = ambientDimension

/-- The special `3D` visible case: a `2`-torus slice. -/
def twoTorusVisibleShape (ambientDimension : Nat) : Prop :=
  toroidalVisibleShape ambientDimension ∧ visibleTorusRank ambientDimension = 2

/-- The low-dimensional rocky floor is the current ambient anchor for
our visible `3D` slice. -/
def ourVisibleAmbientDimension : Nat :=
  earthLikeRockyShadow.dimension

theorem visible_torus_rank_is_off_by_one (ambientDimension : Nat) :
    visibleTorusRank ambientDimension = ambientDimension - 1 := by
  rfl

theorem positive_dimensions_have_toroidal_visible_shape
    (ambientDimension : Nat) (h : 1 ≤ ambientDimension) :
    toroidalVisibleShape ambientDimension := by
  refine ⟨h, ?_⟩
  unfold visibleTorusRank DimensionalConfinement.wallingtonDimension
  omega

theorem our_visible_ambient_dimension_is_three :
    ourVisibleAmbientDimension = 3 := by
  rfl

theorem our_visible_three_d_slice_is_two_torus :
    twoTorusVisibleShape ourVisibleAmbientDimension := by
  refine ⟨?_, ?_⟩
  · rw [our_visible_ambient_dimension_is_three]
    exact positive_dimensions_have_toroidal_visible_shape 3 (by omega)
  · rw [our_visible_ambient_dimension_is_three]
    native_decide

theorem our_visible_three_d_slice_has_betti_two :
    DimensionalConfinement.torusBetti1
        (visibleTorusRank ourVisibleAmbientDimension) = 2 := by
  rw [our_visible_ambient_dimension_is_three]
  unfold visibleTorusRank DimensionalConfinement.torusBetti1
  native_decide

theorem earth_like_floor_anchors_three_d_two_torus :
    earthLikeRockyShadow.dimension = 3 ∧
      visibleTorusRank earthLikeRockyShadow.dimension = 2 ∧
      DimensionalConfinement.torusBetti1
        (visibleTorusRank earthLikeRockyShadow.dimension) = 2 := by
  native_decide

theorem higher_dimensions_are_not_two_torus
    (ambientDimension : Nat) (h : 4 ≤ ambientDimension) :
    ¬ twoTorusVisibleShape ambientDimension := by
  intro htwo
  have hrank : visibleTorusRank ambientDimension = 2 := htwo.2
  unfold visibleTorusRank at hrank
  omega

theorem two_torus_is_not_dimension_free :
    ∃ ambientDimension : Nat,
      toroidalVisibleShape ambientDimension ∧
      ¬ twoTorusVisibleShape ambientDimension := by
  refine ⟨4, ?_, ?_⟩
  · exact positive_dimensions_have_toroidal_visible_shape 4 (by omega)
  · exact higher_dimensions_are_not_two_torus 4 (by omega)

theorem universe_shape_depends_on_dimension
    (d₁ d₂ : Nat) (h₁ : 1 ≤ d₁) (h : d₁ < d₂) :
    visibleTorusRank d₁ < visibleTorusRank d₂ := by
  unfold visibleTorusRank
  omega

end ForkRaceFoldTheorems
