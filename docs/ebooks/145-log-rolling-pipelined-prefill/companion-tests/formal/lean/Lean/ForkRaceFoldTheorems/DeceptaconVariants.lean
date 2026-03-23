import Mathlib
import ForkRaceFoldTheorems.CoveringSpaceCausality
import ForkRaceFoldTheorems.HeteroMoAFabric
import ForkRaceFoldTheorems.NegotiationEquilibrium
import ForkRaceFoldTheorems.VoidWalking

namespace ForkRaceFoldTheorems

/-!
# Deceptacon Variant Shapes

Shape-level formalization of the Chapter 17 Deceptacon family.

This module does not claim a standalone pruning or benchmark theorem. It makes
the contracts explicit in Lean so the prose, artifacts, and future proofs can
share one typed surface:

* `Deceptacon` keeps the legacy `projection` / `search` operation labels and
  therefore still needs an external branch decoder.
* `DualVoidDeceptacon` stores both named void branches and lets `voidToggle`
  foreground BATNA or WATNA directly.
* `TridentDeceptacon` adds the live streaming-head branch together with an
  oscillated meta-laminar transport shape for head streaming.

The local Chapter 17 binding is intentional and scoped:

* `BATNA = sphere`
* `WATNA = torus`
* `LIVE = headStream`
* `Q = proposal`, `K = void boundary`, `V = complement weight`
-/

inductive LegacyHeadOperation where
  | projection
  | search
  deriving DecidableEq, Repr

inductive DeceptaconBranch where
  | live
  | batna
  | watna
  deriving DecidableEq, Repr

inductive DeceptaconCarrier where
  | sphere
  | torus
  | headStream
  deriving DecidableEq, Repr

def branchCarrier : DeceptaconBranch → DeceptaconCarrier
  | .live => .headStream
  | .batna => .sphere
  | .watna => .torus

def ventReasonBranch : VentReason → DeceptaconBranch
  | .batna => .batna
  | .watna => .watna

theorem branchCarrier_live : branchCarrier .live = .headStream := rfl

theorem branchCarrier_batna : branchCarrier .batna = .sphere := rfl

theorem branchCarrier_watna : branchCarrier .watna = .torus := rfl

structure VOIDContract (Proposal Weight : Type) where
  activeBranch : DeceptaconBranch
  proposal : Proposal
  voidBoundary : VoidBoundary
  complementWeight : Weight

def VOIDContract.q (contract : VOIDContract Proposal Weight) : Proposal :=
  contract.proposal

def VOIDContract.k (contract : VOIDContract Proposal Weight) : VoidBoundary :=
  contract.voidBoundary

def VOIDContract.v (contract : VOIDContract Proposal Weight) : Weight :=
  contract.complementWeight

def VOIDContract.activeCarrier
    (contract : VOIDContract Proposal Weight) : DeceptaconCarrier :=
  branchCarrier contract.activeBranch

theorem voidContract_q_eq_proposal (contract : VOIDContract Proposal Weight) :
    contract.q = contract.proposal := rfl

theorem voidContract_k_eq_voidBoundary (contract : VOIDContract Proposal Weight) :
    contract.k = contract.voidBoundary := rfl

theorem voidContract_v_eq_complementWeight (contract : VOIDContract Proposal Weight) :
    contract.v = contract.complementWeight := rfl

structure Deceptacon (Proposal Weight : Type) where
  proposal : Proposal
  voidBoundary : VoidBoundary
  complementWeight : Weight
  operation : LegacyHeadOperation

def Deceptacon.toVOIDContract
    (deceptacon : Deceptacon Proposal Weight)
    (decode : LegacyHeadOperation → DeceptaconBranch) :
    VOIDContract Proposal Weight where
  activeBranch := decode deceptacon.operation
  proposal := deceptacon.proposal
  voidBoundary := deceptacon.voidBoundary
  complementWeight := deceptacon.complementWeight

theorem deceptacon_requires_external_decoder
    (deceptacon : Deceptacon Proposal Weight)
    {decode₁ decode₂ : LegacyHeadOperation → DeceptaconBranch}
    (hdecode : decode₁ deceptacon.operation ≠ decode₂ deceptacon.operation) :
    (deceptacon.toVOIDContract decode₁).activeBranch ≠
      (deceptacon.toVOIDContract decode₂).activeBranch :=
  hdecode

structure DualVoidDeceptacon (Proposal Weight : Type) where
  contract : VOIDContract Proposal Weight
  partition : VoidPartition
  voidToggle : VentReason
  activeBranch_eq_toggle : contract.activeBranch = ventReasonBranch voidToggle

def DualVoidDeceptacon.activeCarrier
    (deceptacon : DualVoidDeceptacon Proposal Weight) : DeceptaconCarrier :=
  deceptacon.contract.activeCarrier

theorem dualVoid_toggle_foregrounds_branch
    (deceptacon : DualVoidDeceptacon Proposal Weight) :
    deceptacon.contract.activeBranch =
      ventReasonBranch deceptacon.voidToggle :=
  deceptacon.activeBranch_eq_toggle

theorem dualVoid_stores_both_named_branches
    (deceptacon : DualVoidDeceptacon Proposal Weight) :
    (∃ i, 0 < deceptacon.partition.batnaVents i) ∧
      (∃ i, 0 < deceptacon.partition.watnaVents i) :=
  dual_void_both_nonempty deceptacon.partition

theorem dualVoid_activeBranch_is_void_side
    (deceptacon : DualVoidDeceptacon Proposal Weight) :
    deceptacon.contract.activeBranch = .batna ∨
      deceptacon.contract.activeBranch = .watna := by
  rw [deceptacon.activeBranch_eq_toggle]
  cases deceptacon.voidToggle <;> simp [ventReasonBranch]

theorem dualVoid_toggle_maps_to_sphere_or_torus
    (deceptacon : DualVoidDeceptacon Proposal Weight) :
    deceptacon.activeCarrier =
      match deceptacon.voidToggle with
      | .batna => .sphere
      | .watna => .torus := by
  unfold DualVoidDeceptacon.activeCarrier VOIDContract.activeCarrier
  rw [deceptacon.activeBranch_eq_toggle]
  cases deceptacon.voidToggle <;> simp [branchCarrier, ventReasonBranch]

structure OscillatedMetaLaminarHeadPipeline where
  headArity : ℕ
  positiveHeadArity : 0 < headArity
  baseHeadStreams : ℕ
  positiveBaseHeadStreams : 0 < baseHeadStreams
  streamLayers : ℕ
  backendLayers : ℕ
  rotations : ℕ

def OscillatedMetaLaminarHeadPipeline.laminarHeight
    (pipeline : OscillatedMetaLaminarHeadPipeline) : Nat :=
  metaLaminarHeight pipeline.streamLayers pipeline.backendLayers + pipeline.rotations

def OscillatedMetaLaminarHeadPipeline.bandwidthMultiplier
    (pipeline : OscillatedMetaLaminarHeadPipeline) : Nat :=
  2 ^ pipeline.rotations

def OscillatedMetaLaminarHeadPipeline.effectiveHeadStreams
    (pipeline : OscillatedMetaLaminarHeadPipeline) : Nat :=
  pipeline.baseHeadStreams * pipeline.bandwidthMultiplier

theorem oscillatedMetaLaminar_bandwidthMultiplier_pos
    (pipeline : OscillatedMetaLaminarHeadPipeline) :
    0 < pipeline.bandwidthMultiplier := by
  unfold OscillatedMetaLaminarHeadPipeline.bandwidthMultiplier
  exact Nat.pow_pos (by decide : 0 < (2 : Nat))

theorem oscillatedMetaLaminar_effectiveHeadStreams_pos
    (pipeline : OscillatedMetaLaminarHeadPipeline) :
    0 < pipeline.effectiveHeadStreams := by
  unfold OscillatedMetaLaminarHeadPipeline.effectiveHeadStreams
  exact Nat.mul_pos pipeline.positiveBaseHeadStreams
    (oscillatedMetaLaminar_bandwidthMultiplier_pos pipeline)

theorem oscillatedMetaLaminar_height_ge_metaBase
    (pipeline : OscillatedMetaLaminarHeadPipeline) :
    metaLaminarHeight pipeline.streamLayers pipeline.backendLayers ≤
      pipeline.laminarHeight := by
  unfold OscillatedMetaLaminarHeadPipeline.laminarHeight
  omega

theorem oscillatedMetaLaminar_twoRotations_quadrupleBandwidth
    (pipeline : OscillatedMetaLaminarHeadPipeline)
    (hRotations : pipeline.rotations = 2) :
    pipeline.effectiveHeadStreams = pipeline.baseHeadStreams * 4 := by
  simp [OscillatedMetaLaminarHeadPipeline.effectiveHeadStreams,
    OscillatedMetaLaminarHeadPipeline.bandwidthMultiplier, hRotations]

theorem oscillatedMetaLaminar_capacity_closes_head_deficit
    (pipeline : OscillatedMetaLaminarHeadPipeline)
    (hCapacity : pipeline.headArity ≤ pipeline.effectiveHeadStreams) :
    topologicalDeficit pipeline.headArity pipeline.effectiveHeadStreams ≤ 0 :=
  covering_match hCapacity pipeline.positiveHeadArity

structure TridentDeceptacon (Proposal Weight : Type) where
  contract : VOIDContract Proposal Weight
  partition : VoidPartition
  dualToggle : VentReason
  streamHeadWeight : Weight
  pipeline : OscillatedMetaLaminarHeadPipeline
  rotatesTwice : pipeline.rotations = 2
  activeBranch_consistent :
    contract.activeBranch = .live ∨
      contract.activeBranch = ventReasonBranch dualToggle

def TridentDeceptacon.activeCarrier
    (deceptacon : TridentDeceptacon Proposal Weight) : DeceptaconCarrier :=
  deceptacon.contract.activeCarrier

def TridentDeceptacon.underlyingDual
    (deceptacon : TridentDeceptacon Proposal Weight) :
    DualVoidDeceptacon Proposal Weight where
  contract := {
    activeBranch := ventReasonBranch deceptacon.dualToggle
    proposal := deceptacon.contract.proposal
    voidBoundary := deceptacon.contract.voidBoundary
    complementWeight := deceptacon.contract.complementWeight
  }
  partition := deceptacon.partition
  voidToggle := deceptacon.dualToggle
  activeBranch_eq_toggle := rfl

theorem trident_stores_both_named_void_branches
    (deceptacon : TridentDeceptacon Proposal Weight) :
    (∃ i, 0 < deceptacon.partition.batnaVents i) ∧
      (∃ i, 0 < deceptacon.partition.watnaVents i) :=
  dual_void_both_nonempty deceptacon.partition

theorem trident_activeBranch_is_live_or_void
    (deceptacon : TridentDeceptacon Proposal Weight) :
    deceptacon.contract.activeBranch = .live ∨
      deceptacon.contract.activeBranch = .batna ∨
      deceptacon.contract.activeBranch = .watna := by
  rcases deceptacon.activeBranch_consistent with hLive | hVoid
  · exact Or.inl hLive
  · rw [hVoid]
    cases deceptacon.dualToggle <;> simp [ventReasonBranch]

theorem trident_live_reads_headStream
    (deceptacon : TridentDeceptacon Proposal Weight)
    (hLive : deceptacon.contract.activeBranch = .live) :
    deceptacon.activeCarrier = .headStream := by
  simp [TridentDeceptacon.activeCarrier, VOIDContract.activeCarrier,
    branchCarrier, hLive]

theorem trident_void_side_agrees_with_dualToggle
    (deceptacon : TridentDeceptacon Proposal Weight)
    (hNotLive : deceptacon.contract.activeBranch ≠ .live) :
    deceptacon.contract.activeBranch = ventReasonBranch deceptacon.dualToggle := by
  rcases deceptacon.activeBranch_consistent with hLive | hVoid
  · exact False.elim (hNotLive hLive)
  · exact hVoid

theorem trident_void_side_maps_to_sphere_or_torus
    (deceptacon : TridentDeceptacon Proposal Weight)
    (hNotLive : deceptacon.contract.activeBranch ≠ .live) :
    deceptacon.activeCarrier =
      match deceptacon.dualToggle with
      | .batna => .sphere
      | .watna => .torus := by
  unfold TridentDeceptacon.activeCarrier VOIDContract.activeCarrier
  have hVoid := trident_void_side_agrees_with_dualToggle deceptacon hNotLive
  rw [hVoid]
  cases deceptacon.dualToggle <;> simp [branchCarrier, ventReasonBranch]

theorem trident_quadruples_headBandwidth
    (deceptacon : TridentDeceptacon Proposal Weight) :
    deceptacon.pipeline.effectiveHeadStreams =
      deceptacon.pipeline.baseHeadStreams * 4 :=
  oscillatedMetaLaminar_twoRotations_quadrupleBandwidth
    deceptacon.pipeline deceptacon.rotatesTwice

theorem trident_capacity_closes_streaming_head_deficit
    (deceptacon : TridentDeceptacon Proposal Weight)
    (hCapacity :
      deceptacon.pipeline.headArity ≤ deceptacon.pipeline.effectiveHeadStreams) :
    topologicalDeficit deceptacon.pipeline.headArity
      deceptacon.pipeline.effectiveHeadStreams ≤ 0 :=
  oscillatedMetaLaminar_capacity_closes_head_deficit
    deceptacon.pipeline hCapacity

end ForkRaceFoldTheorems
