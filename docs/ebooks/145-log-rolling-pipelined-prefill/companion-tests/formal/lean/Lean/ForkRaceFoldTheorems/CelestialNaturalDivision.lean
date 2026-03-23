import ForkRaceFoldTheorems.CelestialGainControlPrediction
import ForkRaceFoldTheorems.GnosticNumbers
import ForkRaceFoldTheorems.GnosticTime

/-!
# Celestial Natural Division

The executable celestial packets already expose an exact size statistic:
the orbital window spread, which is exactly the orbital control.

This module re-reads that size statistic through the existing Gnostic
number system. The scope is intentionally narrow and honest:

- the "size" here is the orbital-window size, not physical mass or radius;
- the natural division is exact for the concrete witness packets;
- the Lorenzo / `π` bridge is exact because it is the same count measured
  in picolorenzos.
-/

namespace ForkRaceFoldTheorems

/-- The natural-division statistic used to rank celestial packets. -/
def naturalDivision (shadow : CelestialShadow) : Nat :=
  orbitalControl shadow

/-- Gnostic-number bands used for the current concrete celestial packets. -/
inductive NaturalDivisionRank where
  | barbeloFloor
  | pleromaMinusEmanations
  | pleromaMinusSyzygy
  | pleromaPlusSyzygy
  | unresolved
deriving DecidableEq, Repr

/-- The same natural division measured in picolorenzo (`π`) units. -/
def naturalDivisionPicolorenzos (shadow : CelestialShadow) : Nat :=
  naturalDivision shadow * GnosticTime.picolorenzo

/-- Classify the current concrete packets by their exact natural-division band. -/
def rankByNaturalDivision (shadow : CelestialShadow) : NaturalDivisionRank :=
  let division := naturalDivision shadow
  if division = GnosticNumbers.barbelo then
    .barbeloFloor
  else if division = GnosticNumbers.pleroma - GnosticNumbers.emanations then
    .pleromaMinusEmanations
  else if division = GnosticNumbers.pleroma - GnosticNumbers.syzygy then
    .pleromaMinusSyzygy
  else if division = GnosticNumbers.pleroma + GnosticNumbers.syzygy then
    .pleromaPlusSyzygy
  else
    .unresolved

theorem natural_division_eq_orbital_control (shadow : CelestialShadow) :
    naturalDivision shadow = orbitalControl shadow := by
  rfl

theorem natural_division_eq_orbital_spread (shadow : CelestialShadow) :
    naturalDivision shadow = orbitalSpread shadow := by
  simpa [naturalDivision] using (orbital_spread_eq_control shadow).symm

theorem photon_natural_division_is_barbelo :
    naturalDivision photonLikeShadow = GnosticNumbers.barbelo := by
  have hPackets := predicted_planet_packets
  rcases hPackets with ⟨hPhoton, _, _, _, _⟩
  have hControl : (predictPlanet photonLikeShadow).control = 1 := by
    simpa using congrArg PlanetPrediction.control hPhoton
  simpa [predictPlanet, naturalDivision, GnosticNumbers.barbelo] using hControl

theorem earth_like_natural_division_is_barbelo :
    naturalDivision earthLikeRockyShadow = GnosticNumbers.barbelo := by
  have hPackets := predicted_planet_packets
  rcases hPackets with ⟨_, hRocky, _, _, _⟩
  have hControl : (predictPlanet earthLikeRockyShadow).control = 1 := by
    simpa using congrArg PlanetPrediction.control hRocky
  simpa [predictPlanet, naturalDivision, GnosticNumbers.barbelo] using hControl

theorem diffuse_ring_natural_division_is_pleroma_plus_syzygy :
    naturalDivision fiftyFourDDiffuseRingShadow =
      GnosticNumbers.pleroma + GnosticNumbers.syzygy := by
  have hPackets := predicted_planet_packets
  rcases hPackets with ⟨_, _, hDiffuse, _, _⟩
  have hControl : (predictPlanet fiftyFourDDiffuseRingShadow).control = 57 := by
    simpa using congrArg PlanetPrediction.control hDiffuse
  simpa [predictPlanet, naturalDivision, GnosticNumbers.pleroma, GnosticNumbers.syzygy]
    using hControl

theorem halo_locked_natural_division_is_pleroma_minus_syzygy :
    naturalDivision fiftyFourDSaturnShadow =
      GnosticNumbers.pleroma - GnosticNumbers.syzygy := by
  have hPackets := predicted_planet_packets
  rcases hPackets with ⟨_, _, _, hHalo, _⟩
  have hControl : (predictPlanet fiftyFourDSaturnShadow).control = 53 := by
    simpa using congrArg PlanetPrediction.control hHalo
  simpa [predictPlanet, naturalDivision, GnosticNumbers.pleroma, GnosticNumbers.syzygy]
    using hControl

theorem super_ring_natural_division_is_pleroma_minus_emanations :
    naturalDivision fiftyFourDSuperRingShadow =
      GnosticNumbers.pleroma - GnosticNumbers.emanations := by
  have hPackets := predicted_planet_packets
  rcases hPackets with ⟨_, _, _, _, hSuper⟩
  have hControl : (predictPlanet fiftyFourDSuperRingShadow).control = 49 := by
    simpa using congrArg PlanetPrediction.control hSuper
  simpa [predictPlanet, naturalDivision, GnosticNumbers.pleroma, GnosticNumbers.emanations]
    using hControl

theorem photon_natural_division_is_one_picolorenzo :
    naturalDivisionPicolorenzos photonLikeShadow = GnosticTime.barbelo_pLo := by
  unfold naturalDivisionPicolorenzos
  rw [photon_natural_division_is_barbelo]
  unfold GnosticNumbers.barbelo GnosticTime.barbelo_pLo GnosticTime.picolorenzo
    GnosticTime.piMicrodays
  native_decide

theorem earth_like_natural_division_is_one_picolorenzo :
    naturalDivisionPicolorenzos earthLikeRockyShadow = GnosticTime.barbelo_pLo := by
  unfold naturalDivisionPicolorenzos
  rw [earth_like_natural_division_is_barbelo]
  unfold GnosticNumbers.barbelo GnosticTime.barbelo_pLo GnosticTime.picolorenzo
    GnosticTime.piMicrodays
  native_decide

theorem diffuse_ring_natural_division_in_picolorenzos :
    naturalDivisionPicolorenzos fiftyFourDDiffuseRingShadow =
      GnosticTime.pleroma_pLo + GnosticTime.syzygy_pLo := by
  unfold naturalDivisionPicolorenzos
  rw [diffuse_ring_natural_division_is_pleroma_plus_syzygy]
  unfold GnosticNumbers.pleroma GnosticNumbers.syzygy GnosticTime.pleroma_pLo
    GnosticTime.syzygy_pLo GnosticTime.picolorenzo GnosticTime.piMicrodays
  native_decide

theorem halo_locked_natural_division_in_picolorenzos :
    naturalDivisionPicolorenzos fiftyFourDSaturnShadow + GnosticTime.syzygy_pLo =
      GnosticTime.pleroma_pLo := by
  unfold naturalDivisionPicolorenzos
  rw [halo_locked_natural_division_is_pleroma_minus_syzygy]
  unfold GnosticNumbers.pleroma GnosticNumbers.syzygy GnosticTime.pleroma_pLo
    GnosticTime.syzygy_pLo GnosticTime.picolorenzo GnosticTime.piMicrodays
  native_decide

theorem super_ring_natural_division_in_picolorenzos :
    naturalDivisionPicolorenzos fiftyFourDSuperRingShadow +
        GnosticNumbers.emanations * GnosticTime.picolorenzo =
      GnosticTime.pleroma_pLo := by
  unfold naturalDivisionPicolorenzos
  rw [super_ring_natural_division_is_pleroma_minus_emanations]
  unfold GnosticNumbers.pleroma GnosticNumbers.emanations GnosticTime.pleroma_pLo
    GnosticTime.picolorenzo GnosticTime.piMicrodays
  native_decide

theorem rank_photon_like_shadow :
    rankByNaturalDivision photonLikeShadow = NaturalDivisionRank.barbeloFloor := by
  unfold rankByNaturalDivision
  rw [photon_natural_division_is_barbelo]
  native_decide

theorem rank_earth_like_rocky_shadow :
    rankByNaturalDivision earthLikeRockyShadow = NaturalDivisionRank.barbeloFloor := by
  unfold rankByNaturalDivision
  rw [earth_like_natural_division_is_barbelo]
  native_decide

theorem rank_fifty_four_d_super_ring :
    rankByNaturalDivision fiftyFourDSuperRingShadow =
      NaturalDivisionRank.pleromaMinusEmanations := by
  unfold rankByNaturalDivision
  rw [super_ring_natural_division_is_pleroma_minus_emanations]
  native_decide

theorem rank_fifty_four_d_halo_locked_ring :
    rankByNaturalDivision fiftyFourDSaturnShadow =
      NaturalDivisionRank.pleromaMinusSyzygy := by
  unfold rankByNaturalDivision
  rw [halo_locked_natural_division_is_pleroma_minus_syzygy]
  native_decide

theorem rank_fifty_four_d_diffuse_ring :
    rankByNaturalDivision fiftyFourDDiffuseRingShadow =
      NaturalDivisionRank.pleromaPlusSyzygy := by
  unfold rankByNaturalDivision
  rw [diffuse_ring_natural_division_is_pleroma_plus_syzygy]
  native_decide

theorem natural_division_orders_ring_taxa :
    naturalDivision fiftyFourDSuperRingShadow <
        naturalDivision fiftyFourDSaturnShadow ∧
      naturalDivision fiftyFourDSaturnShadow <
        naturalDivision fiftyFourDDiffuseRingShadow := by
  rw [super_ring_natural_division_is_pleroma_minus_emanations,
    halo_locked_natural_division_is_pleroma_minus_syzygy,
    diffuse_ring_natural_division_is_pleroma_plus_syzygy]
  unfold GnosticNumbers.pleroma GnosticNumbers.emanations GnosticNumbers.syzygy
  omega

theorem concrete_packets_have_natural_division_ranks :
    rankByNaturalDivision photonLikeShadow = NaturalDivisionRank.barbeloFloor ∧
      rankByNaturalDivision earthLikeRockyShadow = NaturalDivisionRank.barbeloFloor ∧
      rankByNaturalDivision fiftyFourDSuperRingShadow =
        NaturalDivisionRank.pleromaMinusEmanations ∧
      rankByNaturalDivision fiftyFourDSaturnShadow =
        NaturalDivisionRank.pleromaMinusSyzygy ∧
      rankByNaturalDivision fiftyFourDDiffuseRingShadow =
        NaturalDivisionRank.pleromaPlusSyzygy := by
  exact ⟨rank_photon_like_shadow, rank_earth_like_rocky_shadow,
    rank_fifty_four_d_super_ring, rank_fifty_four_d_halo_locked_ring,
    rank_fifty_four_d_diffuse_ring⟩

theorem concrete_packets_have_natural_divisions :
    naturalDivision photonLikeShadow = GnosticNumbers.barbelo ∧
      naturalDivision earthLikeRockyShadow = GnosticNumbers.barbelo ∧
      naturalDivision fiftyFourDSuperRingShadow =
        GnosticNumbers.pleroma - GnosticNumbers.emanations ∧
      naturalDivision fiftyFourDSaturnShadow =
        GnosticNumbers.pleroma - GnosticNumbers.syzygy ∧
      naturalDivision fiftyFourDDiffuseRingShadow =
        GnosticNumbers.pleroma + GnosticNumbers.syzygy := by
  exact ⟨photon_natural_division_is_barbelo,
    earth_like_natural_division_is_barbelo,
    super_ring_natural_division_is_pleroma_minus_emanations,
    halo_locked_natural_division_is_pleroma_minus_syzygy,
    diffuse_ring_natural_division_is_pleroma_plus_syzygy⟩

theorem concrete_packets_have_picolorenzo_scales :
    naturalDivisionPicolorenzos photonLikeShadow = GnosticTime.barbelo_pLo ∧
      naturalDivisionPicolorenzos earthLikeRockyShadow = GnosticTime.barbelo_pLo ∧
      naturalDivisionPicolorenzos fiftyFourDDiffuseRingShadow =
        GnosticTime.pleroma_pLo + GnosticTime.syzygy_pLo ∧
      naturalDivisionPicolorenzos fiftyFourDSaturnShadow +
          GnosticTime.syzygy_pLo = GnosticTime.pleroma_pLo ∧
      naturalDivisionPicolorenzos fiftyFourDSuperRingShadow +
          GnosticNumbers.emanations * GnosticTime.picolorenzo =
        GnosticTime.pleroma_pLo := by
  exact ⟨photon_natural_division_is_one_picolorenzo,
    earth_like_natural_division_is_one_picolorenzo,
    diffuse_ring_natural_division_in_picolorenzos,
    halo_locked_natural_division_in_picolorenzos,
    super_ring_natural_division_in_picolorenzos⟩

end ForkRaceFoldTheorems
