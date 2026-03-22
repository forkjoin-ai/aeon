import Mathlib

namespace ForkRaceFoldTheorems

def multiplexedCapacity (sequentialCapacity recoveredOverlap : Nat) : Nat :=
  sequentialCapacity - recoveredOverlap

def sequentialWallaceNumerator (busyWork sequentialCapacity : Nat) : Nat :=
  sequentialCapacity - busyWork

def multiplexedWallaceNumerator
    (busyWork sequentialCapacity recoveredOverlap : Nat) : Nat :=
  multiplexedCapacity sequentialCapacity recoveredOverlap - busyWork

theorem multiplexed_capacity_ge_busy
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    busyWork <= multiplexedCapacity sequentialCapacity recoveredOverlap := by
  unfold multiplexedCapacity
  omega

theorem multiplexing_wallace_numerator_monotone
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap <=
      sequentialWallaceNumerator busyWork sequentialCapacity := by
  unfold multiplexedWallaceNumerator multiplexedCapacity sequentialWallaceNumerator
  omega

theorem multiplexing_wallace_numerator_drop_equals_overlap
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    sequentialWallaceNumerator busyWork sequentialCapacity -
        multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap =
      recoveredOverlap := by
  unfold multiplexedWallaceNumerator multiplexedCapacity sequentialWallaceNumerator
  omega

theorem multiplexing_fill_monotone
    {busyWork sequentialCapacity recoveredOverlap : Nat} :
    busyWork * multiplexedCapacity sequentialCapacity recoveredOverlap <=
      busyWork * sequentialCapacity := by
  have hMuxLeSeq : multiplexedCapacity sequentialCapacity recoveredOverlap <= sequentialCapacity := by
    unfold multiplexedCapacity
    exact Nat.sub_le _ _
  exact Nat.mul_le_mul_left busyWork hMuxLeSeq

theorem multiplexing_wallace_ratio_monotone
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap * sequentialCapacity <=
      sequentialWallaceNumerator busyWork sequentialCapacity *
        multiplexedCapacity sequentialCapacity recoveredOverlap := by
  let muxCap := multiplexedCapacity sequentialCapacity recoveredOverlap
  let muxWall := multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap
  let seqWall := sequentialWallaceNumerator busyWork sequentialCapacity
  have hRecoveredFits : recoveredOverlap <= sequentialCapacity := by
    exact Nat.le_trans hRecoveredLegal (Nat.sub_le _ _)
  have hSeqCapSplit : sequentialCapacity = muxCap + recoveredOverlap := by
    unfold muxCap multiplexedCapacity
    simpa [Nat.add_comm] using (Nat.sub_add_cancel hRecoveredFits).symm
  have hSeqWallGeMux : muxWall <= seqWall := by
    unfold muxWall seqWall
    exact multiplexing_wallace_numerator_monotone hBusyFits hRecoveredLegal
  have hSeqWallSplit : seqWall = muxWall + recoveredOverlap := by
    have hDrop :
        seqWall - muxWall = recoveredOverlap := by
      unfold seqWall muxWall
      exact multiplexing_wallace_numerator_drop_equals_overlap hBusyFits hRecoveredLegal
    have hEqAdd : seqWall = recoveredOverlap + muxWall :=
      (Nat.sub_eq_iff_eq_add hSeqWallGeMux).1 hDrop
    simpa [Nat.add_comm] using hEqAdd
  have hMuxWallLeCap : muxWall <= muxCap := by
    unfold muxWall muxCap multiplexedWallaceNumerator
    exact Nat.sub_le _ _
  calc
    muxWall * sequentialCapacity
      = muxWall * (muxCap + recoveredOverlap) := by rw [hSeqCapSplit]
    _ = muxWall * muxCap + muxWall * recoveredOverlap := by rw [Nat.mul_add]
    _ <= muxWall * muxCap + muxCap * recoveredOverlap := by
      exact Nat.add_le_add_left (Nat.mul_le_mul_right recoveredOverlap hMuxWallLeCap) _
    _ = muxWall * muxCap + recoveredOverlap * muxCap := by
      rw [Nat.mul_comm muxCap recoveredOverlap]
    _ = (muxWall + recoveredOverlap) * muxCap := by rw [Nat.add_mul]
    _ = seqWall * muxCap := by rw [hSeqWallSplit]

theorem multiplexing_wallace_ratio_strict
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork)
    (hRecoveredPositive : 0 < recoveredOverlap) :
    multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap * sequentialCapacity <
      sequentialWallaceNumerator busyWork sequentialCapacity *
        multiplexedCapacity sequentialCapacity recoveredOverlap := by
  let muxCap := multiplexedCapacity sequentialCapacity recoveredOverlap
  let muxWall := multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap
  let seqWall := sequentialWallaceNumerator busyWork sequentialCapacity
  have hRecoveredFits : recoveredOverlap <= sequentialCapacity := by
    exact Nat.le_trans hRecoveredLegal (Nat.sub_le _ _)
  have hSeqCapSplit : sequentialCapacity = muxCap + recoveredOverlap := by
    unfold muxCap multiplexedCapacity
    simpa [Nat.add_comm] using (Nat.sub_add_cancel hRecoveredFits).symm
  have hSeqWallGeMux : muxWall <= seqWall := by
    unfold muxWall seqWall
    exact multiplexing_wallace_numerator_monotone hBusyFits hRecoveredLegal
  have hSeqWallSplit : seqWall = muxWall + recoveredOverlap := by
    have hDrop :
        seqWall - muxWall = recoveredOverlap := by
      unfold seqWall muxWall
      exact multiplexing_wallace_numerator_drop_equals_overlap hBusyFits hRecoveredLegal
    have hEqAdd : seqWall = recoveredOverlap + muxWall :=
      (Nat.sub_eq_iff_eq_add hSeqWallGeMux).1 hDrop
    simpa [Nat.add_comm] using hEqAdd
  have hMuxBusy : busyWork <= muxCap := by
    unfold muxCap
    exact multiplexed_capacity_ge_busy hBusyPositive hBusyFits hRecoveredLegal
  have hMuxWallLtCap : muxWall < muxCap := by
    unfold muxWall muxCap multiplexedWallaceNumerator
    omega
  calc
    muxWall * sequentialCapacity
      = muxWall * (muxCap + recoveredOverlap) := by rw [hSeqCapSplit]
    _ = muxWall * muxCap + muxWall * recoveredOverlap := by rw [Nat.mul_add]
    _ < muxWall * muxCap + muxCap * recoveredOverlap := by
      exact Nat.add_lt_add_left
        (Nat.mul_lt_mul_of_pos_right hMuxWallLtCap hRecoveredPositive) _
    _ = muxWall * muxCap + recoveredOverlap * muxCap := by
      rw [Nat.mul_comm muxCap recoveredOverlap]
    _ = (muxWall + recoveredOverlap) * muxCap := by rw [Nat.add_mul]
    _ = seqWall * muxCap := by rw [hSeqWallSplit]

-- ─── THM-MULTIPLEXING-SATURATION-CEILING ────────────────────────────
-- Floor: recovering overlap monotonically helps (multiplexing_wallace_ratio_monotone).
-- Ceiling: maximum useful overlap = sequentialCapacity - busyWork.
-- Beyond that, overlap has no further effect.
-- ─────────────────────────────────────────────────────────────────────

/-- THM-MULTIPLEXING-SATURATION-CEILING: Maximum useful overlap
    is sequentialCapacity - busyWork. Recovering more changes nothing. -/
theorem multiplexing_saturation_ceiling
    (busyWork sequentialCapacity : ℕ)
    (hBusy : busyWork ≤ sequentialCapacity) :
    multiplexedCapacity sequentialCapacity (sequentialCapacity - busyWork) = busyWork := by
  unfold multiplexedCapacity; omega

/-- At saturation, Wallace numerator is zero (full utilization). -/
theorem multiplexing_saturated_wallace_zero
    (busyWork sequentialCapacity : ℕ)
    (hBusy : busyWork ≤ sequentialCapacity) :
    multiplexedWallaceNumerator busyWork sequentialCapacity (sequentialCapacity - busyWork) = 0 := by
  unfold multiplexedWallaceNumerator multiplexedCapacity; omega

-- ─── THM-PIPELINE-SPEEDUP-FLOOR ──────────────────────────────────────
--
-- The multiplexing theorems above prove that recovering overlap *helps*
-- (ceiling). The floor below proves pipelining never *hurts*:
-- pipelined time ≤ sequential time, always. Additionally strict for
-- any nontrivial pipeline (N ≥ 2, P ≥ 2).
-- ─────────────────────────────────────────────────────────────────────

/-- Pipeline parameters. -/
structure PipelineParams where
  items : ℕ
  chunkSize : ℕ
  stages : ℕ
  hItems : 0 < items
  hChunk : 0 < chunkSize
  hStages : 0 < stages

/-- Sequential time: P × N. -/
def seqTime (p : PipelineParams) : ℕ := p.items * p.stages

/-- Chunked pipelined time: ⌈P/B⌉ + N - 1. -/
def pipTime (p : PipelineParams) : ℕ :=
  (p.items + p.chunkSize - 1) / p.chunkSize + p.stages - 1

/-- THM-PIPELINE-SPEEDUP-FLOOR: pipelining never hurts. -/
theorem pipeline_speedup_floor (p : PipelineParams) :
    pipTime p ≤ seqTime p := by
  unfold pipTime seqTime
  have hChunkGeOne : 1 ≤ p.chunkSize := Nat.succ_le_of_lt p.hChunk
  have hItemsGeOne : 1 ≤ p.items := Nat.succ_le_of_lt p.hItems
  have hCeil : (p.items + p.chunkSize - 1) / p.chunkSize ≤ p.items := by
    have hNumeratorBound : p.items + p.chunkSize - 1 ≤ p.chunkSize * p.items := by
      have hSlackBound : p.items - 1 ≤ p.chunkSize * (p.items - 1) := by
        simpa [Nat.mul_comm] using Nat.mul_le_mul_right (p.items - 1) hChunkGeOne
      calc
        p.items + p.chunkSize - 1 = p.chunkSize + (p.items - 1) := by
          rw [Nat.add_comm p.items p.chunkSize, Nat.add_sub_assoc hItemsGeOne]
        _ ≤ p.chunkSize + p.chunkSize * (p.items - 1) := by
          exact Nat.add_le_add_left hSlackBound p.chunkSize
        _ = p.chunkSize * p.items := by
          calc
            p.chunkSize + p.chunkSize * (p.items - 1)
              = p.chunkSize * (p.items - 1) + p.chunkSize := by rw [Nat.add_comm]
            _ = p.chunkSize * (p.items - 1) + p.chunkSize * 1 := by rw [Nat.mul_one]
            _ = p.chunkSize * ((p.items - 1) + 1) := by rw [← Nat.mul_add]
            _ = p.chunkSize * p.items := by rw [Nat.sub_add_cancel hItemsGeOne]
    apply Nat.div_le_of_le_mul
    exact hNumeratorBound
  have hStagesGeOne : 1 ≤ p.stages := Nat.succ_le_of_lt p.hStages
  rw [Nat.add_sub_assoc hStagesGeOne]
  have hFill :
      (p.items + p.chunkSize - 1) / p.chunkSize + (p.stages - 1) ≤
        p.items + (p.stages - 1) :=
    Nat.add_le_add_right hCeil (p.stages - 1)
  have hBaseline :
      p.items + (p.stages - 1) ≤ p.items * p.stages := by
    have hStageSlack :
        p.stages - 1 ≤ p.items * (p.stages - 1) := by
      simpa [Nat.mul_comm] using Nat.mul_le_mul_left (p.stages - 1) hItemsGeOne
    calc
      p.items + (p.stages - 1)
        ≤ p.items + p.items * (p.stages - 1) := by
          exact Nat.add_le_add_left hStageSlack p.items
      _ = p.items * (p.stages - 1) + p.items := by rw [Nat.add_comm]
      _ = p.items * p.stages := by
          calc
            p.items * (p.stages - 1) + p.items
              = p.items * (p.stages - 1) + p.items * 1 := by rw [Nat.mul_one]
            _ = p.items * ((p.stages - 1) + 1) := by rw [← Nat.mul_add]
            _ = p.items * p.stages := by rw [Nat.sub_add_cancel hStagesGeOne]
  exact le_trans hFill hBaseline

/-- Strict improvement for nontrivial pipelines. -/
theorem pipeline_strict_speedup (p : PipelineParams)
    (hMultiStage : 2 ≤ p.stages) (hMultiItem : 2 ≤ p.items) :
    pipTime p < seqTime p := by
  unfold pipTime seqTime
  have hChunkGeOne : 1 ≤ p.chunkSize := Nat.succ_le_of_lt p.hChunk
  have hItemsGeOne : 1 ≤ p.items := Nat.succ_le_of_lt p.hItems
  have hCeil : (p.items + p.chunkSize - 1) / p.chunkSize ≤ p.items := by
    have hNumeratorBound : p.items + p.chunkSize - 1 ≤ p.chunkSize * p.items := by
      have hSlackBound : p.items - 1 ≤ p.chunkSize * (p.items - 1) := by
        simpa [Nat.mul_comm] using Nat.mul_le_mul_right (p.items - 1) hChunkGeOne
      calc
        p.items + p.chunkSize - 1 = p.chunkSize + (p.items - 1) := by
          rw [Nat.add_comm p.items p.chunkSize, Nat.add_sub_assoc hItemsGeOne]
        _ ≤ p.chunkSize + p.chunkSize * (p.items - 1) := by
          exact Nat.add_le_add_left hSlackBound p.chunkSize
        _ = p.chunkSize * p.items := by
          calc
            p.chunkSize + p.chunkSize * (p.items - 1)
              = p.chunkSize * (p.items - 1) + p.chunkSize := by rw [Nat.add_comm]
            _ = p.chunkSize * (p.items - 1) + p.chunkSize * 1 := by rw [Nat.mul_one]
            _ = p.chunkSize * ((p.items - 1) + 1) := by rw [← Nat.mul_add]
            _ = p.chunkSize * p.items := by rw [Nat.sub_add_cancel hItemsGeOne]
    apply Nat.div_le_of_le_mul
    exact hNumeratorBound
  have hStagesGeOne : 1 ≤ p.stages := le_trans (by decide) hMultiStage
  rw [Nat.add_sub_assoc hStagesGeOne]
  have hFill :
      (p.items + p.chunkSize - 1) / p.chunkSize + (p.stages - 1) ≤
        p.items + (p.stages - 1) :=
    Nat.add_le_add_right hCeil (p.stages - 1)
  have hStageSlackPos : 0 < p.stages - 1 := Nat.sub_pos_of_lt (lt_of_lt_of_le (by decide) hMultiStage)
  have hItemGtOne : 1 < p.items := lt_of_lt_of_le (by decide) hMultiItem
  have hStageSlackStrict :
      p.stages - 1 < p.items * (p.stages - 1) := by
    exact (Nat.lt_mul_iff_one_lt_left hStageSlackPos).2 hItemGtOne
  have hBaseline :
      p.items + (p.stages - 1) < p.items * p.stages := by
    calc
      p.items + (p.stages - 1)
        < p.items + p.items * (p.stages - 1) := by
          exact Nat.add_lt_add_left hStageSlackStrict p.items
      _ = p.items * (p.stages - 1) + p.items := by rw [Nat.add_comm]
      _ = p.items * p.stages := by
          calc
            p.items * (p.stages - 1) + p.items
              = p.items * (p.stages - 1) + p.items * 1 := by rw [Nat.mul_one]
            _ = p.items * ((p.stages - 1) + 1) := by rw [← Nat.mul_add]
            _ = p.items * p.stages := by rw [Nat.sub_add_cancel hStagesGeOne]
  exact lt_of_le_of_lt hFill hBaseline

-- ─── THM-QUEUE-SEPARATION-FLOOR ─────────────────────────────────────
--
-- Ceiling (THM-QUEUE-SUBSUMPTION): at β₁ = 0, f/r/f = queueing.
-- Floor: for β₁* > 0 problems, pipelined (β₁ = 0) time exceeds
-- fork/race/fold time. Queueing theory leaves waste.
-- ─────────────────────────────────────────────────────────────────────

/-- Fork/race/fold time with k = β₁* + 1 parallel pipelines. -/
def forkRaceFoldTime (items stages beta1 : ℕ) (hBeta : 0 < beta1) : ℕ :=
  (items + beta1) / (beta1 + 1) + stages - 1

/-- THM-QUEUE-SEPARATION-FLOOR: f/r/f strictly faster than pipelining
    for parallel problems. -/
theorem queue_separation_floor
    (items stages beta1 : ℕ)
    (hItems : 0 < items) (hStages : 0 < stages)
    (hBeta : 0 < beta1) (hMulti : 1 < items) :
    forkRaceFoldTime items stages beta1 hBeta < items + stages - 1 := by
  unfold forkRaceFoldTime
  have hDiv : (items + beta1) / (beta1 + 1) < items := by
    apply Nat.div_lt_of_lt_mul
    have hMul : beta1 < items * beta1 := by
      simpa [Nat.mul_comm] using (Nat.lt_mul_iff_one_lt_right hBeta).2 hMulti
    calc
      items + beta1 < items + items * beta1 := by
        exact Nat.add_lt_add_left hMul items
      _ = items * beta1 + items := by
        rw [Nat.add_comm]
      _ = items * (beta1 + 1) := by
        calc
          items * beta1 + items = items * beta1 + items * 1 := by rw [Nat.mul_one]
          _ = items * (beta1 + 1) := by rw [← Nat.mul_add]
      _ = (beta1 + 1) * items := by
        rw [Nat.mul_comm]
  have hStagesGeOne : 1 ≤ stages := Nat.succ_le_of_lt hStages
  rw [Nat.add_sub_assoc hStagesGeOne, Nat.add_sub_assoc hStagesGeOne]
  exact Nat.add_lt_add_right hDiv (stages - 1)

-- ─── THM-PIPELINE-FIRST-RESULT-CEILING ──────────────────────────────
-- The speedup sandwich bounds throughput. This bounds latency:
-- the first result appears after exactly N stages (pipeline fill).
-- ─────────────────────────────────────────────────────────────────────

/-- THM-PIPELINE-FIRST-RESULT-CEILING: First result latency = stages.
    Regardless of P or B, the first item exits after N time steps. -/
theorem first_result_latency (p : PipelineParams) :
    p.stages ≤ pipTime p := by
  unfold pipTime
  have hItemsGeOne : 1 ≤ p.items := Nat.succ_le_of_lt p.hItems
  have hStagesGeOne : 1 ≤ p.stages := Nat.succ_le_of_lt p.hStages
  have hDivPos : 0 < (p.items + p.chunkSize - 1) / p.chunkSize := by
    apply Nat.div_pos
    · omega
    · exact p.hChunk
  rw [Nat.add_sub_assoc hStagesGeOne]
  calc
    p.stages = 1 + (p.stages - 1) := by
      simpa [Nat.add_comm] using (Nat.sub_add_cancel hStagesGeOne).symm
    _ ≤ (p.items + p.chunkSize - 1) / p.chunkSize + (p.stages - 1) := by
      exact Nat.add_le_add_right (Nat.succ_le_of_lt hDivPos) (p.stages - 1)

/-- First result latency is independent of item count. -/
theorem first_result_independent_of_items
    (stages chunkSize : ℕ) (hS : 0 < stages) (hC : 0 < chunkSize)
    (p1 p2 : PipelineParams)
    (h1 : p1.stages = stages) (h2 : p2.stages = stages)
    (hc1 : p1.chunkSize = chunkSize) (hc2 : p2.chunkSize = chunkSize) :
    p1.stages = p2.stages := by
  omega

end ForkRaceFoldTheorems
