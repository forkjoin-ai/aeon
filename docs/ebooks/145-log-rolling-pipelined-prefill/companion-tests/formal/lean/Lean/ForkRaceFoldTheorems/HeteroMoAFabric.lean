import Mathlib

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
  split_ifs <;> omega

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

theorem diverse_ready_backends_of_cpu_and_accelerator
    {cpuReady gpuReady npuReady wasmReady : Bool}
    (h_cpu : cpuReady = true)
    (h_accel : gpuReady = true ∨ npuReady = true ∨ wasmReady = true) :
    2 <= readyBackendCount cpuReady gpuReady npuReady wasmReady := by
  unfold readyBackendCount
  rcases h_accel with h_gpu | h_rest
  · simp [h_cpu, h_gpu]
  · rcases h_rest with h_npu | h_wasm
    · simp [h_cpu, h_npu]
    · simp [h_cpu, h_wasm]

theorem cannonCursor_step_mod
    {laneCount cursor waveWidth : Nat}
    (h_laneCount : 0 < laneCount) :
    cannonCursor laneCount cursor waveWidth = (cursor + waveWidth) % laneCount := by
  simp [cannonCursor, Nat.ne_of_gt h_laneCount]

theorem cannonCursor_lt_laneCount
    {laneCount cursor waveWidth : Nat}
    (h_laneCount : 0 < laneCount) :
    cannonCursor laneCount cursor waveWidth < laneCount := by
  rw [cannonCursor_step_mod h_laneCount]
  exact Nat.mod_lt _ h_laneCount

theorem helixPhase_lt_layerCount
    {layerCount round : Nat}
    (h_layerCount : 0 < layerCount) :
    helixPhase layerCount round < layerCount := by
  simp [helixPhase, Nat.ne_of_gt h_layerCount, Nat.mod_lt, h_layerCount]

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

theorem binaryHeaderBytes_eq_ten :
    binaryHeaderBytes = 10 := by
  rfl

theorem binaryFrameBytes_ge_header (payloadBytes : Nat) :
    binaryHeaderBytes <= binaryFrameBytes payloadBytes := by
  unfold binaryFrameBytes binaryHeaderBytes
  omega

theorem skippedWithinBudget_of_le
    {skippedHedges scheduledShadows : Nat}
    (h_budget : skippedHedges <= scheduledShadows) :
    skippedWithinBudget skippedHedges scheduledShadows := by
  exact h_budget

theorem conservedBytes_of_total
    {winnerBytes loserBytes ventBytes totalBytes : Nat}
    (h_total : totalBytes = winnerBytes + loserBytes + ventBytes) :
    conservedBytes winnerBytes loserBytes ventBytes totalBytes := by
  unfold conservedBytes
  omega

theorem metaLaminarHeight_pos (streamLayers backendLayers : Nat) :
    0 < metaLaminarHeight streamLayers backendLayers := by
  unfold metaLaminarHeight
  omega

end ForkRaceFoldTheorems
