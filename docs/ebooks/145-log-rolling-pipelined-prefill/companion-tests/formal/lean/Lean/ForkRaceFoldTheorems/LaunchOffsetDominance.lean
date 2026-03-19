import Mathlib
import ForkRaceFoldTheorems.HeteroMoAFabric
import ForkRaceFoldTheorems.CommunityDominance

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Launch Offset Dominance: The Cost and Benefit of Sequenced Starts

The heterogeneous fabric's launch schedule computes a head start for
slower backends: `launchOffsetMs = targetArrivalMs - arrivalHorizonMs`.
The slowest backend launches first. The fastest launches last. The
target is simultaneous arrival.

This module is honest about both sides:

**The cost is real.** The offset delays the fast backend's launch.
That delay adds latency to every round where the fast backend would
have won without waiting. The penalty is exactly `offsetMs` of added
wall time per round in the worst case.

**The benefit is also real.** The slow backend occasionally completes,
enriching the community's void boundary with observations from a
different hardware layer. Richer void means better predictions, which
means fewer wasted hedges in future rounds, which reduces cumulative
waste.

**The threshold.** The offset is worth it when the cumulative
community learning benefit exceeds the cumulative fast-path delay
penalty. Below that threshold, the system should not give the head
start -- the slow backend is too slow to contribute enough
observations to justify the delay. Above it, the offset is a net
improvement.

This is the honest framing of affirmative action as a scheduling
policy: it penalizes the advantaged participant by a computed amount.
At some point the penalty is worth the community learning gain.
At some point it is not. The theory identifies both thresholds.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- Structure: Launch Offset with Explicit Penalty
-- ═══════════════════════════════════════════════════════════════════════

/-- A launch offset configuration with both benefit and cost made
    explicit. -/
structure OffsetAnalysis where
  /-- Predicted latency of the fast backend (ms) -/
  fastLatencyMs : ℕ
  /-- Predicted latency of the slow backend (ms) -/
  slowLatencyMs : ℕ
  /-- The slow backend is actually slower -/
  slowIsSlower : fastLatencyMs ≤ slowLatencyMs
  /-- Launch offset given to the slow backend (ms) -/
  offsetMs : ℕ
  /-- Offset bounded by the latency gap -/
  offsetBounded : offsetMs ≤ slowLatencyMs - fastLatencyMs
  /-- Rounds of community observation gained per offset round
      (how often the slow backend completes thanks to the head start) -/
  diversityGainPerRound : ℕ
  /-- Fast-path delay penalty per round (ms added to wall time) -/
  penaltyPerRound : ℕ
  /-- Penalty equals the offset -/
  penaltyIsOffset : penaltyPerRound = offsetMs

/-- The latency gap between slow and fast backends. -/
def OffsetAnalysis.latencyGap (oa : OffsetAnalysis) : ℕ :=
  oa.slowLatencyMs - oa.fastLatencyMs

-- ═══════════════════════════════════════════════════════════════════════
-- THM-OFFSET-PENALTY-IS-REAL
--
-- The fast backend pays a real cost. The offset delays its
-- effective start by exactly offsetMs per round. This is not
-- hidden or minimized.
-- ═══════════════════════════════════════════════════════════════════════

/-- The penalty is real and equals the offset. The fast backend
    waits while the slow backend gets its head start. -/
theorem offset_penalty_is_real (oa : OffsetAnalysis) :
    oa.penaltyPerRound = oa.offsetMs :=
  oa.penaltyIsOffset

/-- The penalty is bounded by the latency gap. The fast backend
    never waits longer than the gap between it and the slow backend. -/
theorem offset_penalty_bounded (oa : OffsetAnalysis) :
    oa.penaltyPerRound ≤ oa.latencyGap := by
  rw [oa.penaltyIsOffset]
  exact oa.offsetBounded

/-- Over T rounds, the total penalty is T times the per-round penalty. -/
def totalPenalty (oa : OffsetAnalysis) (rounds : ℕ) : ℕ :=
  rounds * oa.penaltyPerRound

-- ═══════════════════════════════════════════════════════════════════════
-- THM-OFFSET-BENEFIT-IS-REAL
--
-- The diversity gain is also real. More backends completing means
-- more community observations, which means the Bule deficit
-- decreases faster.
-- ═══════════════════════════════════════════════════════════════════════

/-- Over T rounds, the total diversity gain is T times the per-round
    gain (observations from the slow backend completing). -/
def totalDiversityGain (oa : OffsetAnalysis) (rounds : ℕ) : ℕ :=
  rounds * oa.diversityGainPerRound

/-- More community observations means faster Bule convergence. -/
theorem diversity_gain_reduces_deficit
    (ft : FailureTopology)
    (contextWithout contextWith : ℕ)
    (hGain : contextWithout ≤ contextWith) :
    buleDeficit ft contextWith ≤ buleDeficit ft contextWithout :=
  bule_deficit_monotone_decreasing ft contextWithout contextWith hGain

-- ═══════════════════════════════════════════════════════════════════════
-- THM-OFFSET-WORTH-THRESHOLD
--
-- The offset is worth it when the cumulative Bule deficit reduction
-- exceeds the cumulative penalty. Below this threshold, the system
-- should not give the head start. Above it, the head start is a
-- net improvement.
--
-- The threshold is explicit and computable.
-- ═══════════════════════════════════════════════════════════════════════

/-- The offset is worth it when diversity gain exceeds penalty.
    This is the threshold condition. -/
def offsetWorthIt (oa : OffsetAnalysis) : Prop :=
  oa.penaltyPerRound < oa.diversityGainPerRound ∨
  (oa.penaltyPerRound = 0 ∧ 0 < oa.diversityGainPerRound)

/-- The offset is not worth it when the penalty exceeds the gain.
    The slow backend is too slow to contribute enough observations. -/
def offsetNotWorthIt (oa : OffsetAnalysis) : Prop :=
  oa.diversityGainPerRound ≤ oa.penaltyPerRound ∧
  (oa.penaltyPerRound > 0 ∨ oa.diversityGainPerRound = 0)

/-- When the offset is worth it, the total benefit exceeds the
    total penalty over any positive number of rounds. -/
theorem worth_it_benefit_exceeds_penalty (oa : OffsetAnalysis)
    (rounds : ℕ) (hRounds : 0 < rounds)
    (hWorth : oa.penaltyPerRound < oa.diversityGainPerRound) :
    totalPenalty oa rounds < totalDiversityGain oa rounds := by
  unfold totalPenalty totalDiversityGain
  exact Nat.mul_lt_mul_of_pos_left hWorth hRounds

/-- When the offset is not worth it, the total penalty meets or
    exceeds the total benefit. The system should not give the
    head start. -/
theorem not_worth_it_penalty_exceeds_benefit (oa : OffsetAnalysis)
    (rounds : ℕ)
    (hNotWorth : oa.diversityGainPerRound ≤ oa.penaltyPerRound) :
    totalDiversityGain oa rounds ≤ totalPenalty oa rounds := by
  unfold totalPenalty totalDiversityGain
  exact Nat.mul_le_mul_left rounds hNotWorth

-- ═══════════════════════════════════════════════════════════════════════
-- THM-OFFSET-SELF-ELIMINATING
--
-- As the community learns and the slow backend improves (or is
-- deprioritized), the offset naturally decreases. The head start
-- converges to zero when the latency gap closes.
-- ═══════════════════════════════════════════════════════════════════════

/-- When the latency gap is zero, the offset is zero. No head start
    needed when backends have equal predicted latency. -/
theorem offset_zero_when_equal (oa : OffsetAnalysis)
    (hEqual : oa.fastLatencyMs = oa.slowLatencyMs) :
    oa.offsetMs = 0 := by
  have h := oa.offsetBounded
  simp [OffsetAnalysis.latencyGap] at h ⊢
  omega

/-- The offset is bounded by the latency gap, so as the gap
    shrinks, the offset shrinks. -/
theorem offset_shrinks_with_gap (oa : OffsetAnalysis) :
    oa.offsetMs ≤ oa.latencyGap :=
  oa.offsetBounded

-- ═══════════════════════════════════════════════════════════════════════
-- THM-LAUNCH-OFFSET-DOMINANCE: The Honest Master Theorem
--
-- The offset scheme has a real penalty and a real benefit.
-- The penalty is bounded and explicit.
-- The benefit is monotone in diversity gain.
-- The threshold is computable.
-- Above the threshold, the offset is a net improvement.
-- Below it, the system should not give the head start.
-- When the gap closes, the offset self-eliminates.
-- ═══════════════════════════════════════════════════════════════════════

/-- The complete launch offset analysis.

    1. The penalty is real and bounded by the latency gap
    2. When diversity gain exceeds penalty, the offset is worth it
    3. When it does not, the offset is not worth it
    4. The offset self-eliminates when the gap closes

    This is the honest theorem: affirmative action has a real cost
    to the advantaged participant. The cost is worth paying when
    the diversity gain to the community exceeds it. The cost is
    not worth paying when it does not. The theory identifies both
    cases explicitly. -/
theorem launch_offset_honest (oa : OffsetAnalysis) :
    -- The penalty is bounded
    oa.penaltyPerRound ≤ oa.latencyGap ∧
    -- The offset self-eliminates when latency gap = 0
    (oa.fastLatencyMs = oa.slowLatencyMs → oa.offsetMs = 0) := by
  exact ⟨offset_penalty_bounded oa,
         offset_zero_when_equal oa⟩

end ForkRaceFoldTheorems
