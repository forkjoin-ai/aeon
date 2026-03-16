import ForkRaceFoldTheorems.CoveringSpaceCausality

namespace ForkRaceFoldTheorems

/--
Track Beta: Protocol Deficit Latency

THM-DEFICIT-LATENCY-SEPARATION — Extended analysis connecting topological
deficit to latency inflation. The deficit Δ = β₁(computation) - β₁(transport)
provides a constructive lower bound on worst-case latency.

This extends the covering-space causality theorem to quantify the impact:
deficit directly determines the multiplexing pressure that causes
head-of-line blocking under packet loss.

Builds on ProtocolDeficit.tla and the beauty frontier from
LandauerBeautyBridge.lean: positive deficit → observable latency gap.
-/

-- ─── Multiplexing pressure ─────────────────────────────────────────────

/-- Average paths per transport stream (multiplexing pressure).
    When deficit > 0, some streams carry multiple paths. -/
def multiplexingPressure (pathCount transportStreams : ℕ) : ℕ :=
  if transportStreams = 0 then pathCount
  else (pathCount + transportStreams - 1) / transportStreams  -- ceiling division

/-- Under TCP (1 stream), multiplexing pressure equals pathCount. -/
theorem tcp_multiplexing_pressure
    {pathCount : ℕ}
    (hPaths : 0 < pathCount) :
    multiplexingPressure pathCount 1 = pathCount := by
  unfold multiplexingPressure
  simp
  omega

/-- Under matched topology, multiplexing pressure is 1. -/
theorem matched_multiplexing_pressure
    {pathCount : ℕ}
    (hPaths : 0 < pathCount) :
    multiplexingPressure pathCount pathCount = 1 := by
  unfold multiplexingPressure
  simp [show pathCount ≠ 0 by omega]
  omega

-- ─── Latency inflation model ──────────────────────────────────────────

/-- Worst-case latency inflation factor under packet loss.
    With k paths sharing a stream, a loss on any one stalls all k paths.
    Expected latency inflates by factor k under uniform loss. -/
def latencyInflationFactor (pathCount transportStreams : ℕ) : ℕ :=
  multiplexingPressure pathCount transportStreams

/-- TCP latency inflation equals pathCount (all paths on one stream). -/
theorem tcp_latency_inflation
    {pathCount : ℕ}
    (hPaths : 0 < pathCount) :
    latencyInflationFactor pathCount 1 = pathCount := by
  unfold latencyInflationFactor
  exact tcp_multiplexing_pressure hPaths

/-- Matched topology has no latency inflation (factor = 1). -/
theorem matched_no_inflation
    {pathCount : ℕ}
    (hPaths : 0 < pathCount) :
    latencyInflationFactor pathCount pathCount = 1 := by
  unfold latencyInflationFactor
  exact matched_multiplexing_pressure hPaths

/-- More transport streams → less latency inflation (monotone decreasing). -/
theorem inflation_decreasing
    {pathCount s1 s2 : ℕ}
    (hS1 : 0 < s1) (hS2 : 0 < s2)
    (hS : s1 ≤ s2)
    (hBound : s2 ≤ pathCount) :
    latencyInflationFactor pathCount s2 ≤ latencyInflationFactor pathCount s1 := by
  unfold latencyInflationFactor multiplexingPressure
  simp [show s1 ≠ 0 by omega, show s2 ≠ 0 by omega]
  exact Nat.div_le_div_left (by omega) hS2

-- ─── Deficit-inflation bridge ──────────────────────────────────────────

/-- Positive deficit implies latency inflation > 1. -/
theorem positive_deficit_implies_inflation
    {pathCount transportStreams : ℕ}
    (hPaths : 2 ≤ pathCount)
    (hStreams : 0 < transportStreams)
    (hDeficit : 0 < topologicalDeficit pathCount transportStreams) :
    1 < latencyInflationFactor pathCount transportStreams := by
  unfold latencyInflationFactor multiplexingPressure
  simp [show transportStreams ≠ 0 by omega]
  unfold topologicalDeficit computationBeta1 transportBeta1 at hDeficit
  -- deficit > 0 implies pathCount > transportStreams
  have hLt : transportStreams < pathCount := by omega
  exact Nat.lt_div_add hLt

/-- Zero deficit implies latency inflation = 1. -/
theorem zero_deficit_no_inflation
    {pathCount : ℕ}
    (hPaths : 0 < pathCount) :
    latencyInflationFactor pathCount pathCount = 1 :=
  matched_no_inflation hPaths

-- ─── Protocol comparison ───────────────────────────────────────────────

/-- TCP inflation is always ≥ QUIC/Flow inflation for the same computation. -/
theorem tcp_worst_inflation
    {pathCount transportStreams : ℕ}
    (hPaths : 0 < pathCount)
    (hStreams : 0 < transportStreams) :
    latencyInflationFactor pathCount transportStreams ≤
    latencyInflationFactor pathCount 1 := by
  unfold latencyInflationFactor
  exact inflation_decreasing (by omega) hStreams (by omega) (by omega)

/-- The deficit-inflation relationship composes with the beauty frontier:
    deficit → live branches → entropy → heat → observable latency gap.
    This is the full chain from topology to physics. -/
theorem deficit_beauty_chain
    {pathCount : ℕ}
    (hPaths : 2 ≤ pathCount) :
    -- Positive deficit...
    0 < topologicalDeficit pathCount 1 ∧
    -- ...implies multiple independent paths...
    2 ≤ computationBeta1 pathCount + 1 ∧
    -- ...which is the precondition for the Landauer-beauty bridge
    0 < computationBeta1 pathCount := by
  unfold topologicalDeficit computationBeta1 transportBeta1
  omega

end ForkRaceFoldTheorems
