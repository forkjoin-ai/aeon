import ForkRaceFoldTheorems.PhotonSliverFrontier
import ForkRaceFoldTheorems.TenModeUnification
import ForkRaceFoldTheorems.UniverseShapeByDimension

/-!
# Nested Wallington Tower

This module separates three claims that had been getting blended together:

1. The immediate off-by-one nesting law: a visible ambient `n`-surface carries
   the next-smaller `(n - 1)` Wallington rotation.
2. The currently certified local ladder: photon floor, rocky floor, and quark
   lift give an explicit three-rung initial tower.
3. The ten-mode envelope: the existing finite ten-mode field determines a
   finite ten-level nesting envelope, but the current certified local ladder
   does not yet saturate that envelope.

So the Russian-doll intuition is partly mechanized and partly still open. The
immediate nesting law is proved, the first three rungs are proved, and the
ten-mode envelope is proved finite. The theorem that *every* intermediate rung
is already observationally closed is not proved here.
-/

namespace ForkRaceFoldTheorems

/-- One immediate nested Wallington step: the visible inner torus rank is
exactly one below the ambient outer dimension. -/
def immediateWallingtonNesting (ambientDimension : Nat) : Prop :=
  1 ≤ ambientDimension ∧ visibleTorusRank ambientDimension + 1 = ambientDimension

/-- The currently certified local photon packet still only closes a two-level
placement: the packet and the next larger ambient rotation. -/
def localizedPhotonPacketLevels : Nat := 2

/-- Composing the photon floor, rocky floor, and quark lift gives the current
explicit three-rung certified ladder. -/
def initialCertifiedWallingtonLadderDepth : Nat := 3

/-- The ten-mode field supplies a finite nesting envelope: nine interlocking
tori plus the sliver recover the tenth outer level. -/
def nestedWallingtonEnvelope (modeCount : Nat) : Nat :=
  TenModeUnification.interlockingTori modeCount + 1

theorem positive_dimensions_realize_immediate_nesting
    (ambientDimension : Nat) (h : 1 ≤ ambientDimension) :
    immediateWallingtonNesting ambientDimension := by
  refine ⟨h, ?_⟩
  unfold visibleTorusRank
  omega

theorem photon_floor_is_first_nested_rung :
    immediateWallingtonNesting photonLikeShadow.dimension ∧
      visibleTorusRank photonLikeShadow.dimension = 1 := by
  refine ⟨?_, ?_⟩
  · exact positive_dimensions_realize_immediate_nesting
      photonLikeShadow.dimension (by native_decide)
  · unfold visibleTorusRank photonLikeShadow
    native_decide

theorem earth_like_floor_is_second_nested_rung :
    immediateWallingtonNesting earthLikeRockyShadow.dimension ∧
      visibleTorusRank earthLikeRockyShadow.dimension = 2 := by
  refine ⟨?_, ?_⟩
  · exact positive_dimensions_realize_immediate_nesting
      earthLikeRockyShadow.dimension (by native_decide)
  · unfold visibleTorusRank earthLikeRockyShadow
    native_decide

theorem quark_tuple_is_third_nested_rung :
    immediateWallingtonNesting (DimensionalConfinement.wallingtonDimension 3) ∧
      visibleTorusRank (DimensionalConfinement.wallingtonDimension 3) = 3 := by
  refine ⟨?_, ?_⟩
  · exact positive_dimensions_realize_immediate_nesting
      (DimensionalConfinement.wallingtonDimension 3) (by native_decide)
  · unfold visibleTorusRank DimensionalConfinement.wallingtonDimension
    native_decide

theorem initial_nested_wallington_ladder :
    visibleTorusRank photonLikeShadow.dimension = 1 ∧
      visibleTorusRank earthLikeRockyShadow.dimension = 2 ∧
      visibleTorusRank (DimensionalConfinement.wallingtonDimension 3) = 3 := by
  exact ⟨photon_floor_is_first_nested_rung.2,
    earth_like_floor_is_second_nested_rung.2,
    quark_tuple_is_third_nested_rung.2⟩

theorem positive_mode_count_recovers_nested_wallington_envelope
    (modeCount : Nat) (h : 1 ≤ modeCount) :
    nestedWallingtonEnvelope modeCount = modeCount := by
  unfold nestedWallingtonEnvelope TenModeUnification.interlockingTori
  omega

theorem ten_mode_nested_wallington_envelope_is_ten :
    nestedWallingtonEnvelope 10 = 10 := by
  exact positive_mode_count_recovers_nested_wallington_envelope 10 (by omega)

theorem ten_mode_nested_wallington_envelope_is_finite :
    nestedWallingtonEnvelope 10 < 11 := by
  rw [ten_mode_nested_wallington_envelope_is_ten]
  omega

theorem localized_photon_packet_certifies_two_levels :
    localizedPhotonPacketLevels = 2 := by
  rfl

theorem initial_certified_wallington_ladder_is_three_levels :
    initialCertifiedWallingtonLadderDepth = 3 := by
  rfl

theorem initial_three_rung_ladder_sits_inside_ten_mode_envelope :
    initialCertifiedWallingtonLadderDepth <
      nestedWallingtonEnvelope 10 := by
  rw [initial_certified_wallington_ladder_is_three_levels,
    ten_mode_nested_wallington_envelope_is_ten]
  omega

theorem localized_photon_packet_not_yet_ten_mode_envelope :
    localizedPhotonPacketLevels ≠ nestedWallingtonEnvelope 10 := by
  rw [localized_photon_packet_certifies_two_levels,
    ten_mode_nested_wallington_envelope_is_ten]
  omega

end ForkRaceFoldTheorems
