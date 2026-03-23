import ForkRaceFoldTheorems.BuleyeanLogic
import ForkRaceFoldTheorems.BythosScale
import ForkRaceFoldTheorems.CosmicProjection
import ForkRaceFoldTheorems.GnosticNumbers
import ForkRaceFoldTheorems.SliverIsFifth
import ForkRaceFoldTheorems.WallingtonSurfaceAdmissibility

/-!
# Atlas Coordinate Contract

This module adds one shared coordinate contract for the current bounded atlas.
Every coordinate carries three pieces:

1. a primary navigation tuple `(time, dimension, space)`;
2. a secondary Wallington-local placement tuple `(x, y, z)`;
3. a signed state scalar in `{-1, 0, 1}`.

The interpretation is fixed:

- `time` is the golden/Fibonacci scrub axis;
- `dimension` is the Betti/ambient navigation axis;
- `space` is the golden/Fibonacci zoom-out axis;
- `(x, y, z)` is Wallington-local placement, not physical astronomy space;
- `-1 = void`, `0 = boundary`, `1 = live`.

The existing off-by-one geometry then forces the local tuple to collapse to the
user's earlier `y, y, z` reading: `x = y` and `z = y + 1`.
-/

namespace ForkRaceFoldTheorems

/-- Shared golden/Fibonacci navigation bands for scrub and zoom-out. -/
inductive GoldenAtlasBand where
  | one
  | now
  | phiSquared
  | phiCubed
deriving DecidableEq, Repr

/-- Numeric time coordinate on the golden scrub axis, measured in millionths of
Lorenzos. -/
def goldenTimeCoordinate : GoldenAtlasBand → Nat
  | .one => CosmicProjection.phiDen
  | .now => CosmicProjection.phiNum
  | .phiSquared =>
      CosmicProjection.phiNum * CosmicProjection.phiNum / CosmicProjection.phiDen
  | .phiCubed =>
      CosmicProjection.phiNum * CosmicProjection.phiNum * CosmicProjection.phiNum /
        (CosmicProjection.phiDen * CosmicProjection.phiDen)

/-- Numeric space coordinate on the golden zoom-out axis. -/
def goldenSpaceCoordinate : GoldenAtlasBand → Nat
  | .one => CosmicProjection.sizeOneLorenzo
  | .now => CosmicProjection.sizeNow
  | .phiSquared => CosmicProjection.sizePhiSquared
  | .phiCubed => CosmicProjection.sizePhiCubed

/-- Shared numeric constants for the atlas state scalar. -/
def voidState : Int := -1
def boundaryState : Int := 0
def liveState : Int := 1

/-- The Buleyean reading of an atlas state forgets orientation and keeps only
its deficit distance from the boundary. -/
def atlasStateBule (state : Int) : BProp := Int.natAbs state

/-- The primary navigation tuple. -/
structure PrimaryNavigationTuple where
  time : Nat
  dimension : Nat
  space : Nat
deriving DecidableEq, Repr

/-- The secondary Wallington-local placement tuple. -/
structure WallingtonLocalPlacement where
  x : Nat
  y : Nat
  z : Nat
deriving DecidableEq, Repr

/-- The shared atlas coordinate combines navigation, placement, and state. -/
structure AtlasCoordinate where
  navigation : PrimaryNavigationTuple
  placement : WallingtonLocalPlacement
  state : Int
deriving DecidableEq, Repr

/-- The structural/logical signature that survives time/space rescaling. -/
structure AtlasSignature where
  dimension : Nat
  state : Int
deriving DecidableEq, Repr

/-- Forget the scrub/zoom-out coordinates and keep only the transfer-stable
dimension/state signature. -/
def atlasSignature (coord : AtlasCoordinate) : AtlasSignature :=
  { dimension := coord.navigation.dimension
    state := coord.state }

/-- Canonical local Wallington representative for a fixed ambient signature. -/
def canonicalLocalPlacement (dimension : Nat) : WallingtonLocalPlacement :=
  { x := dimension
    y := dimension
    z := dimension + 1 }

/-- State scalars are fixed to the void / boundary / live triad. -/
def validAtlasState (state : Int) : Prop :=
  state = voidState ∨ state = boundaryState ∨ state = liveState

/-- Time and space are valid atlas axes when they come from the same golden
band. -/
def onGoldenAtlasAxis (time space : Nat) : Prop :=
  (time = goldenTimeCoordinate .one ∧
      space = goldenSpaceCoordinate .one) ∨
    (time = goldenTimeCoordinate .now ∧
      space = goldenSpaceCoordinate .now) ∨
    (time = goldenTimeCoordinate .phiSquared ∧
      space = goldenSpaceCoordinate .phiSquared) ∨
    (time = goldenTimeCoordinate .phiCubed ∧
      space = goldenSpaceCoordinate .phiCubed)

/-- One canonical contract shared across the current atlas surface. -/
def atlasCoordinateContract (coord : AtlasCoordinate) : Prop :=
  onGoldenAtlasAxis coord.navigation.time coord.navigation.space ∧
    coord.navigation.dimension = coord.placement.y ∧
    coord.placement.x = visibleTorusRank coord.placement.z ∧
    coord.placement.y = DimensionalConfinement.torusBetti1 coord.placement.x ∧
    admissibleWallingtonSurface coord.placement.z coord.placement.x ∧
    validAtlasState coord.state

instance (time space : Nat) : Decidable (onGoldenAtlasAxis time space) := by
  unfold onGoldenAtlasAxis
  infer_instance

instance (state : Int) : Decidable (validAtlasState state) := by
  unfold validAtlasState
  infer_instance

instance (coord : AtlasCoordinate) : Decidable (atlasCoordinateContract coord) := by
  unfold atlasCoordinateContract admissibleWallingtonSurface
  infer_instance

theorem golden_time_axis_monotone :
    goldenTimeCoordinate .one < goldenTimeCoordinate .now ∧
      goldenTimeCoordinate .now < goldenTimeCoordinate .phiSquared ∧
      goldenTimeCoordinate .phiSquared < goldenTimeCoordinate .phiCubed := by
  native_decide

theorem golden_space_axis_monotone :
    goldenSpaceCoordinate .one < goldenSpaceCoordinate .now ∧
      goldenSpaceCoordinate .now < goldenSpaceCoordinate .phiSquared ∧
      goldenSpaceCoordinate .phiSquared < goldenSpaceCoordinate .phiCubed := by
  simpa [goldenSpaceCoordinate] using CosmicProjection.growth_monotone

theorem void_state_is_negative_live_state :
    voidState = -liveState := by
  native_decide

theorem void_state_has_sliver_bule :
    atlasStateBule voidState = bOpen GnosticNumbers.barbelo := by
  native_decide

theorem boundary_state_is_ground_bule :
    atlasStateBule boundaryState = bProved := by
  native_decide

theorem live_state_has_sliver_bule :
    atlasStateBule liveState = bOpen GnosticNumbers.barbelo := by
  native_decide

theorem void_and_live_share_sliver_bule :
    atlasStateBule voidState = atlasStateBule liveState ∧
      atlasStateBule voidState = bOpen GnosticNumbers.barbelo := by
  exact ⟨by rw [void_state_has_sliver_bule, live_state_has_sliver_bule],
    void_state_has_sliver_bule⟩

theorem valid_atlas_state_has_ground_or_sliver_bule
    (state : Int) (h : validAtlasState state) :
    atlasStateBule state = bProved ∨
      atlasStateBule state = bOpen GnosticNumbers.barbelo := by
  unfold validAtlasState at h
  rcases h with rfl | rfl | rfl
  · right
    exact void_state_has_sliver_bule
  · left
    exact boundary_state_is_ground_bule
  · right
    exact live_state_has_sliver_bule

theorem atlas_state_buleyean_sliver_bridge :
    atlasStateBule voidState = bOpen GnosticNumbers.barbelo ∧
      atlasStateBule boundaryState = bProved ∧
      atlasStateBule liveState = bOpen GnosticNumbers.barbelo ∧
      bReject (atlasStateBule liveState) = atlasStateBule boundaryState ∧
      SliverIsFifth.ventOp (atlasStateBule liveState) = atlasStateBule boundaryState ∧
      SliverIsFifth.sliverOp (atlasStateBule boundaryState) = atlasStateBule liveState := by
  native_decide

theorem same_atlas_signature_transfers_dimension
    {coord₁ coord₂ : AtlasCoordinate}
    (hsig : atlasSignature coord₁ = atlasSignature coord₂) :
    coord₁.navigation.dimension = coord₂.navigation.dimension := by
  exact congrArg AtlasSignature.dimension hsig

theorem same_atlas_signature_transfers_state
    {coord₁ coord₂ : AtlasCoordinate}
    (hsig : atlasSignature coord₁ = atlasSignature coord₂) :
    coord₁.state = coord₂.state := by
  exact congrArg AtlasSignature.state hsig

theorem same_dimension_same_state_gives_same_atlas_signature
    {coord₁ coord₂ : AtlasCoordinate}
    (hdim : coord₁.navigation.dimension = coord₂.navigation.dimension)
    (hstate : coord₁.state = coord₂.state) :
    atlasSignature coord₁ = atlasSignature coord₂ := by
  cases coord₁
  cases coord₂
  simp [atlasSignature] at hdim hstate ⊢
  exact ⟨hdim, hstate⟩

theorem atlas_contract_recovers_xy
    (coord : AtlasCoordinate) (h : atlasCoordinateContract coord) :
    coord.placement.x = coord.placement.y := by
  rcases h with ⟨_, _, _, hy, _, _⟩
  calc
    coord.placement.x = DimensionalConfinement.torusBetti1 coord.placement.x := by
      rfl
    _ = coord.placement.y := by rw [hy]

theorem atlas_contract_dimension_eq_x
    (coord : AtlasCoordinate) (h : atlasCoordinateContract coord) :
    coord.navigation.dimension = coord.placement.x := by
  rcases h with ⟨_, hdim, _, hy, _, _⟩
  rw [hdim, hy]
  rfl

theorem atlas_contract_recovers_yyz_profile
    (coord : AtlasCoordinate) (h : atlasCoordinateContract coord) :
    coord.placement.x = coord.navigation.dimension ∧
      coord.placement.y = coord.navigation.dimension ∧
      coord.placement.z = coord.navigation.dimension + 1 := by
  have hdx : coord.navigation.dimension = coord.placement.x :=
    atlas_contract_dimension_eq_x coord h
  rcases h with ⟨_, hdim, _, _, hadm, _⟩
  rcases hadm with ⟨_, hwall⟩
  refine ⟨hdx.symm, hdim.symm, ?_⟩
  unfold DimensionalConfinement.wallingtonDimension at hwall
  omega

theorem atlas_contract_has_canonical_local_form
    (coord : AtlasCoordinate) (h : atlasCoordinateContract coord) :
    coord.placement.x = (canonicalLocalPlacement coord.navigation.dimension).x ∧
      coord.placement.y = (canonicalLocalPlacement coord.navigation.dimension).y ∧
      coord.placement.z = (canonicalLocalPlacement coord.navigation.dimension).z := by
  rcases atlas_contract_recovers_yyz_profile coord h with ⟨hx, hy, hz⟩
  exact ⟨by simpa [canonicalLocalPlacement] using hx,
    by simpa [canonicalLocalPlacement] using hy,
    by simpa [canonicalLocalPlacement] using hz⟩

theorem atlas_contract_state_is_ground_or_sliver
    (coord : AtlasCoordinate) (h : atlasCoordinateContract coord) :
    atlasStateBule coord.state = bProved ∨
      atlasStateBule coord.state = bOpen GnosticNumbers.barbelo := by
  rcases h with ⟨_, _, _, _, _, hstate⟩
  exact valid_atlas_state_has_ground_or_sliver_bule coord.state hstate

theorem same_atlas_signature_transfers_local_placement
    {coord₁ coord₂ : AtlasCoordinate}
    (h₁ : atlasCoordinateContract coord₁)
    (h₂ : atlasCoordinateContract coord₂)
    (hsig : atlasSignature coord₁ = atlasSignature coord₂) :
    coord₁.placement.x = coord₂.placement.x ∧
      coord₁.placement.y = coord₂.placement.y ∧
      coord₁.placement.z = coord₂.placement.z := by
  have hdim : coord₁.navigation.dimension = coord₂.navigation.dimension :=
    same_atlas_signature_transfers_dimension hsig
  rcases atlas_contract_recovers_yyz_profile coord₁ h₁ with ⟨hx₁, hy₁, hz₁⟩
  rcases atlas_contract_recovers_yyz_profile coord₂ h₂ with ⟨hx₂, hy₂, hz₂⟩
  refine ⟨?_, ?_, ?_⟩
  · calc
      coord₁.placement.x = coord₁.navigation.dimension := hx₁
      _ = coord₂.navigation.dimension := hdim
      _ = coord₂.placement.x := hx₂.symm
  · calc
      coord₁.placement.y = coord₁.navigation.dimension := hy₁
      _ = coord₂.navigation.dimension := hdim
      _ = coord₂.placement.y := hy₂.symm
  · calc
      coord₁.placement.z = coord₁.navigation.dimension + 1 := hz₁
      _ = coord₂.navigation.dimension + 1 := by rw [hdim]
      _ = coord₂.placement.z := hz₂.symm

theorem same_atlas_signature_transfers_buleyean_state
    {coord₁ coord₂ : AtlasCoordinate}
    (hsig : atlasSignature coord₁ = atlasSignature coord₂) :
    atlasStateBule coord₁.state = atlasStateBule coord₂.state := by
  exact congrArg atlasStateBule (same_atlas_signature_transfers_state hsig)

theorem same_atlas_signature_transfers_geometry_and_logic
    {coord₁ coord₂ : AtlasCoordinate}
    (h₁ : atlasCoordinateContract coord₁)
    (h₂ : atlasCoordinateContract coord₂)
    (hsig : atlasSignature coord₁ = atlasSignature coord₂) :
    coord₁.placement.x = coord₂.placement.x ∧
      coord₁.placement.y = coord₂.placement.y ∧
      coord₁.placement.z = coord₂.placement.z ∧
      atlasStateBule coord₁.state = atlasStateBule coord₂.state := by
  rcases same_atlas_signature_transfers_local_placement h₁ h₂ hsig with
    ⟨hx, hy, hz⟩
  exact ⟨hx, hy, hz, same_atlas_signature_transfers_buleyean_state hsig⟩

theorem same_dimension_same_state_implies_canonical_local_form
    {coord₁ coord₂ : AtlasCoordinate}
    (h₁ : atlasCoordinateContract coord₁)
    (h₂ : atlasCoordinateContract coord₂)
    (hdim : coord₁.navigation.dimension = coord₂.navigation.dimension)
    (hstate : coord₁.state = coord₂.state) :
    coord₁.placement.x = coord₂.placement.x ∧
      coord₁.placement.y = coord₂.placement.y ∧
      coord₁.placement.z = coord₂.placement.z ∧
      atlasStateBule coord₁.state = atlasStateBule coord₂.state := by
  exact same_atlas_signature_transfers_geometry_and_logic h₁ h₂
    (same_dimension_same_state_gives_same_atlas_signature hdim hstate)

/-- Time/space navigation can vary while the signature stays fixed. -/
def timeSpaceGaugeVariation (coord₁ coord₂ : AtlasCoordinate) : Prop :=
  coord₁.navigation.time ≠ coord₂.navigation.time ∨
    coord₁.navigation.space ≠ coord₂.navigation.space

theorem time_space_variation_preserves_signature_geometry
    {coord₁ coord₂ : AtlasCoordinate}
    (h₁ : atlasCoordinateContract coord₁)
    (h₂ : atlasCoordinateContract coord₂)
    (hdim : coord₁.navigation.dimension = coord₂.navigation.dimension)
    (hstate : coord₁.state = coord₂.state)
    (_hvar : timeSpaceGaugeVariation coord₁ coord₂) :
    coord₁.placement.x = coord₂.placement.x ∧
      coord₁.placement.y = coord₂.placement.y ∧
      coord₁.placement.z = coord₂.placement.z ∧
      atlasStateBule coord₁.state = atlasStateBule coord₂.state := by
  exact same_dimension_same_state_implies_canonical_local_form h₁ h₂ hdim hstate

/-- Canonical void-edge coordinate: the Bythos base. -/
def bythosVoidAtlasCoordinate : AtlasCoordinate where
  navigation :=
    { time := goldenTimeCoordinate .one
      dimension := BythosScale.bythos_dim
      space := goldenSpaceCoordinate .one }
  placement := { x := 0, y := 0, z := 1 }
  state := voidState

/-- Canonical current visible coordinate: the ambient boundary slice. -/
def visibleBoundaryAtlasCoordinate : AtlasCoordinate where
  navigation :=
    { time := goldenTimeCoordinate .now
      dimension := visibleTorusRank ourVisibleAmbientDimension
      space := goldenSpaceCoordinate .now }
  placement :=
    { x := visibleTorusRank ourVisibleAmbientDimension
      y := DimensionalConfinement.torusBetti1 (visibleTorusRank ourVisibleAmbientDimension)
      z := ourVisibleAmbientDimension }
  state := boundaryState

/-- Canonical live packet coordinate: the first positive one-cycle floor. -/
def photonLiveAtlasCoordinate : AtlasCoordinate where
  navigation :=
    { time := goldenTimeCoordinate .one
      dimension := 1
      space := goldenSpaceCoordinate .one }
  placement :=
    { x := 1
      y := DimensionalConfinement.torusBetti1 1
      z := DimensionalConfinement.wallingtonDimension 1 }
  state := liveState

theorem bythos_void_atlas_coordinate_contract :
    atlasCoordinateContract bythosVoidAtlasCoordinate := by
  native_decide

theorem visible_boundary_atlas_coordinate_contract :
    atlasCoordinateContract visibleBoundaryAtlasCoordinate := by
  native_decide

theorem photon_live_atlas_coordinate_contract :
    atlasCoordinateContract photonLiveAtlasCoordinate := by
  native_decide

theorem canonical_atlas_coordinates_cover_all_states :
    bythosVoidAtlasCoordinate.state = voidState ∧
      visibleBoundaryAtlasCoordinate.state = boundaryState ∧
      photonLiveAtlasCoordinate.state = liveState := by
  native_decide

theorem bythos_void_coordinate_exposes_sliver_step :
    bythosVoidAtlasCoordinate.navigation.dimension = BythosScale.bythos_dim ∧
      bReject GnosticNumbers.barbelo = bProved := by
  refine ⟨rfl, ?_⟩
  native_decide

theorem bythos_void_coordinate_is_void_sliver :
    bythosVoidAtlasCoordinate.state = voidState ∧
      atlasStateBule bythosVoidAtlasCoordinate.state = bOpen GnosticNumbers.barbelo := by
  exact ⟨rfl, void_state_has_sliver_bule⟩

theorem visible_boundary_coordinate_is_ground :
    visibleBoundaryAtlasCoordinate.state = boundaryState ∧
      atlasStateBule visibleBoundaryAtlasCoordinate.state = bProved := by
  exact ⟨rfl, boundary_state_is_ground_bule⟩

theorem photon_live_coordinate_is_live_sliver :
    photonLiveAtlasCoordinate.state = liveState ∧
      atlasStateBule photonLiveAtlasCoordinate.state = bOpen GnosticNumbers.barbelo := by
  exact ⟨rfl, live_state_has_sliver_bule⟩

theorem canonical_atlas_coordinate_contract :
    atlasCoordinateContract bythosVoidAtlasCoordinate ∧
      atlasCoordinateContract visibleBoundaryAtlasCoordinate ∧
      atlasCoordinateContract photonLiveAtlasCoordinate := by
  exact ⟨bythos_void_atlas_coordinate_contract,
    visible_boundary_atlas_coordinate_contract,
    photon_live_atlas_coordinate_contract⟩

end ForkRaceFoldTheorems
