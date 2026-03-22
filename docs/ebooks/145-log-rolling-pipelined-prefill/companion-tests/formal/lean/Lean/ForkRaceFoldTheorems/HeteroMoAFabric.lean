import Mathlib.Data.Nat.Basic
import Mathlib.Tactic.Linarith

namespace ForkRaceFoldTheorems

inductive BackendLayer where
  | cpu
  | gpu
  | npu
  | wasm
  deriving DecidableEq, Repr

def totalLanes (cpuLanes gpuLanes npuLanes wasmLanes : Nat) : Nat :=
  cpuLanes + gpuLanes + npuLanes + wasmLanes

def activeLayerCount (cpuLanes gpuLanes npuLanes wasmLanes : Nat) : Nat :=
  (if 0 < cpuLanes then 1 else 0) +
    (if 0 < gpuLanes then 1 else 0) +
      (if 0 < npuLanes then 1 else 0) +
        (if 0 < wasmLanes then 1 else 0)

def mirroredKernelTotal (cpuLanes gpuLanes npuLanes wasmLanes : Nat) : Nat :=
  2 * totalLanes cpuLanes gpuLanes npuLanes wasmLanes

def readyBackendCount (cpuReady gpuReady npuReady wasmReady : Bool) : Nat :=
  (if cpuReady then 1 else 0) +
    (if gpuReady then 1 else 0) +
      (if npuReady then 1 else 0) +
        (if wasmReady then 1 else 0)

def cannonCursor (laneCount cursor waveWidth : Nat) : Nat :=
  if laneCount = 0 then 0 else (cursor + waveWidth) % laneCount

def helixPhase (layerCount round : Nat) : Nat :=
  if layerCount = 0 then 0 else round % layerCount

inductive PairDecision where
  | acceptAgreement
  | acceptPrimary
  | escalate
  deriving DecidableEq, Repr

def pairedKernelDecision (agree primarySufficient shadowFired : Bool) : PairDecision :=
  if agree then
    .acceptAgreement
  else if primarySufficient && not shadowFired then
    .acceptPrimary
  else
    .escalate

def binaryHeaderBytes : Nat := 10

def binaryFrameBytes (payloadBytes : Nat) : Nat :=
  binaryHeaderBytes + payloadBytes

def skippedWithinBudget (skippedHedges scheduledShadows : Nat) : Prop :=
  skippedHedges <= scheduledShadows

def conservedBytes (winnerBytes loserBytes ventBytes totalBytes : Nat) : Prop :=
  winnerBytes + loserBytes + ventBytes = totalBytes

def metaLaminarHeight (streamLayers backendLayers : Nat) : Nat :=
  streamLayers + backendLayers + 1

theorem mirroredKernelTotal_eq_twice_totalLanes
    (cpuLanes gpuLanes npuLanes wasmLanes : Nat) :
    mirroredKernelTotal cpuLanes gpuLanes npuLanes wasmLanes =
      2 * totalLanes cpuLanes gpuLanes npuLanes wasmLanes := by
  rfl

theorem activeLayerCount_le_totalLanes
    (cpuLanes gpuLanes npuLanes wasmLanes : Nat) :
    activeLayerCount cpuLanes gpuLanes npuLanes wasmLanes <=
      totalLanes cpuLanes gpuLanes npuLanes wasmLanes := by
  unfold activeLayerCount totalLanes
  split_ifs <;> linarith

theorem activeLayerCount_pos_of_totalLanes_pos
    {cpuLanes gpuLanes npuLanes wasmLanes : Nat}
    (h_total : 0 < totalLanes cpuLanes gpuLanes npuLanes wasmLanes) :
    0 < activeLayerCount cpuLanes gpuLanes npuLanes wasmLanes := by
  unfold totalLanes at h_total
  have h_some :
      0 < cpuLanes ∨ 0 < gpuLanes ∨ 0 < npuLanes ∨ 0 < wasmLanes := by
    by_contra h_none
    push_neg at h_none
    rcases h_none with ⟨h_cpu, h_gpu, h_npu, h_wasm⟩
    linarith
  rcases h_some with h_cpu | h_rest
  · simp [activeLayerCount, h_cpu]
  · rcases h_rest with h_gpu | h_rest
    · simp [activeLayerCount, h_gpu]
    · rcases h_rest with h_npu | h_wasm
      · simp [activeLayerCount, h_npu]
      · simp [activeLayerCount, h_wasm]

theorem activeLayerCount_le_four
    (cpuLanes gpuLanes npuLanes wasmLanes : Nat) :
    activeLayerCount cpuLanes gpuLanes npuLanes wasmLanes <= 4 := by
  unfold activeLayerCount
  split_ifs <;> linarith

theorem activeLayerCount_eq_four_of_all_positive
    {cpuLanes gpuLanes npuLanes wasmLanes : Nat}
    (h_cpu : 0 < cpuLanes)
    (h_gpu : 0 < gpuLanes)
    (h_npu : 0 < npuLanes)
    (h_wasm : 0 < wasmLanes) :
    activeLayerCount cpuLanes gpuLanes npuLanes wasmLanes = 4 := by
  simp [activeLayerCount, h_cpu, h_gpu, h_npu, h_wasm]

theorem activeLayerCount_eq_zero_of_all_zero :
    activeLayerCount 0 0 0 0 = 0 := by
  simp [activeLayerCount]

theorem readyBackendCount_pos_of_any_ready
    {cpuReady gpuReady npuReady wasmReady : Bool}
    (h_ready : cpuReady = true ∨ gpuReady = true ∨ npuReady = true ∨ wasmReady = true) :
    0 < readyBackendCount cpuReady gpuReady npuReady wasmReady := by
  unfold readyBackendCount
  rcases h_ready with h_cpu | h_rest
  · simp [h_cpu]
  · rcases h_rest with h_gpu | h_rest
    · simp [h_gpu]
    · rcases h_rest with h_npu | h_wasm
      · simp [h_npu]
      · simp [h_wasm]

theorem readyBackendCount_le_four
    (cpuReady gpuReady npuReady wasmReady : Bool) :
    readyBackendCount cpuReady gpuReady npuReady wasmReady <= 4 := by
  unfold readyBackendCount
  split_ifs <;> linarith

theorem readyBackendCount_eq_zero_of_all_not_ready
    (h_cpu : cpuReady = false)
    (h_gpu : gpuReady = false)
    (h_npu : npuReady = false)
    (h_wasm : wasmReady = false) :
    readyBackendCount cpuReady gpuReady npuReady wasmReady = 0 := by
  simp [readyBackendCount, h_cpu, h_gpu, h_npu, h_wasm]

theorem readyBackendCount_eq_four_of_all_ready
    (h_cpu : cpuReady = true)
    (h_gpu : gpuReady = true)
    (h_npu : npuReady = true)
    (h_wasm : wasmReady = true) :
    readyBackendCount cpuReady gpuReady npuReady wasmReady = 4 := by
  simp [readyBackendCount, h_cpu, h_gpu, h_npu, h_wasm]

theorem diverse_ready_backends_of_cpu_and_accelerator
    {cpuReady gpuReady npuReady wasmReady : Bool}
    (h_cpu : cpuReady = true)
    (h_accel : gpuReady = true ∨ npuReady = true ∨ wasmReady = true) :
    2 <= readyBackendCount cpuReady gpuReady npuReady wasmReady := by
  unfold readyBackendCount
  rcases h_accel with h_gpu | h_rest
  · simp [h_cpu, h_gpu]; omega
  · rcases h_rest with h_npu | h_wasm
    · simp [h_cpu, h_npu]; omega
    · simp [h_cpu, h_wasm]; omega

theorem cannonCursor_step_mod
    {laneCount cursor waveWidth : Nat}
    (h_laneCount : 0 < laneCount) :
    cannonCursor laneCount cursor waveWidth = (cursor + waveWidth) % laneCount := by
  simp [cannonCursor, Nat.ne_of_gt h_laneCount]

theorem cannonCursor_zero_of_zero_laneCount
    (cursor waveWidth : Nat) :
    cannonCursor 0 cursor waveWidth = 0 := by
  simp [cannonCursor]

theorem cannonCursor_lt_laneCount
    {laneCount cursor waveWidth : Nat}
    (h_laneCount : 0 < laneCount) :
    cannonCursor laneCount cursor waveWidth < laneCount := by
  rw [cannonCursor_step_mod h_laneCount]
  exact Nat.mod_lt _ h_laneCount

theorem cannonCursor_waveWidth_zero_eq_cursor_mod
    {laneCount cursor : Nat}
    (h_laneCount : 0 < laneCount) :
    cannonCursor laneCount cursor 0 = cursor % laneCount := by
  simp [cannonCursor, Nat.ne_of_gt h_laneCount]

theorem helixPhase_lt_layerCount
    {layerCount round : Nat}
    (h_layerCount : 0 < layerCount) :
    helixPhase layerCount round < layerCount := by
  simp [helixPhase, Nat.ne_of_gt h_layerCount, Nat.mod_lt, h_layerCount]

theorem helixPhase_zero_of_zero_layerCount
    (round : Nat) :
    helixPhase 0 round = 0 := by
  simp [helixPhase]

theorem pairedKernelDecision_of_agreement
    {primarySufficient shadowFired : Bool} :
    pairedKernelDecision true primarySufficient shadowFired = PairDecision.acceptAgreement := by
  simp [pairedKernelDecision]

theorem pairedKernelDecision_of_sufficient_primary
    {shadowFired : Bool}
    (h_shadow : shadowFired = false) :
    pairedKernelDecision false true shadowFired = PairDecision.acceptPrimary := by
  simp [pairedKernelDecision, h_shadow]

theorem pairedKernelDecision_of_disagreement
    {primarySufficient shadowFired : Bool}
    (h_agree : primarySufficient = false ∨ shadowFired = true) :
    pairedKernelDecision false primarySufficient shadowFired = PairDecision.escalate := by
  rcases h_agree with h_primary | h_shadow
  · simp [pairedKernelDecision, h_primary]
  · simp [pairedKernelDecision, h_shadow]

theorem pairedKernelDecision_ne_acceptAgreement_of_disagree
    {primarySufficient shadowFired : Bool} :
    pairedKernelDecision false primarySufficient shadowFired ≠ PairDecision.acceptAgreement := by
  cases primarySufficient <;> cases shadowFired <;> decide

theorem pairedKernelDecision_ne_acceptPrimary_of_disagreement
    {primarySufficient shadowFired : Bool}
    (h_disagree : primarySufficient = false ∨ shadowFired = true) :
    pairedKernelDecision false primarySufficient shadowFired ≠ PairDecision.acceptPrimary := by
  rcases h_disagree with h_primary | h_shadow
  · simp [pairedKernelDecision, h_primary]
  · simp [pairedKernelDecision, h_shadow]

theorem pairedKernelDecision_ne_escalate_of_agreement
    {primarySufficient shadowFired : Bool} :
    pairedKernelDecision true primarySufficient shadowFired ≠ PairDecision.escalate := by
  simp [pairedKernelDecision]

theorem pairedKernelDecision_ne_escalate_of_sufficient_primary
    {shadowFired : Bool}
    (h_shadow : shadowFired = false) :
    pairedKernelDecision false true shadowFired ≠ PairDecision.escalate := by
  simp [pairedKernelDecision, h_shadow]

theorem binaryHeaderBytes_eq_ten :
    binaryHeaderBytes = 10 := by
  rfl

theorem binaryFrameBytes_ge_header (payloadBytes : Nat) :
    binaryHeaderBytes <= binaryFrameBytes payloadBytes := by
  unfold binaryFrameBytes binaryHeaderBytes
  exact Nat.le_add_right 10 payloadBytes

theorem binaryFrameBytes_strictMono :
    StrictMono binaryFrameBytes := by
  intro payload₁ payload₂ h_payload
  unfold binaryFrameBytes
  exact Nat.add_lt_add_left h_payload binaryHeaderBytes

theorem binaryFrameBytes_injective :
    Function.Injective binaryFrameBytes := by
  exact binaryFrameBytes_strictMono.injective

theorem binaryFrameBytes_eq_header_of_zero_payload :
    binaryFrameBytes 0 = binaryHeaderBytes := by
  simp [binaryFrameBytes]

theorem binaryFrameBytes_pos (payloadBytes : Nat) :
    0 < binaryFrameBytes payloadBytes := by
  simp [binaryFrameBytes, binaryHeaderBytes]

theorem skippedWithinBudget_of_le
    {skippedHedges scheduledShadows : Nat}
    (h_budget : skippedHedges <= scheduledShadows) :
    skippedWithinBudget skippedHedges scheduledShadows := by
  exact h_budget

theorem conservedBytes_of_total
    {winnerBytes loserBytes ventBytes totalBytes : Nat}
    (h_total : totalBytes = winnerBytes + loserBytes + ventBytes) :
    conservedBytes winnerBytes loserBytes ventBytes totalBytes := by
  simpa [conservedBytes] using h_total.symm

theorem conservedBytes_iff_total
    {winnerBytes loserBytes ventBytes totalBytes : Nat} :
    conservedBytes winnerBytes loserBytes ventBytes totalBytes ↔
      totalBytes = winnerBytes + loserBytes + ventBytes := by
  constructor
  · intro h_conserved
    simpa [conservedBytes] using h_conserved.symm
  · intro h_total
    simpa [conservedBytes] using h_total.symm

theorem skippedWithinBudget_zero
    (scheduledShadows : Nat) :
    skippedWithinBudget 0 scheduledShadows := by
  exact Nat.zero_le scheduledShadows

theorem metaLaminarHeight_pos (streamLayers backendLayers : Nat) :
    0 < metaLaminarHeight streamLayers backendLayers := by
  unfold metaLaminarHeight
  exact Nat.succ_pos _

theorem metaLaminarHeight_ge_streamLayers_succ
    (streamLayers backendLayers : Nat) :
    streamLayers + 1 <= metaLaminarHeight streamLayers backendLayers := by
  unfold metaLaminarHeight
  linarith

theorem metaLaminarHeight_ge_backendLayers_succ
    (streamLayers backendLayers : Nat) :
    backendLayers + 1 <= metaLaminarHeight streamLayers backendLayers := by
  unfold metaLaminarHeight
  linarith

end ForkRaceFoldTheorems
