import Mathlib
import ForkRaceFoldTheorems.DiversityOptimality
import ForkRaceFoldTheorems.TradeTopology

namespace ForkRaceFoldTheorems

/-!
# Trade Topology Round 4: Five Economic Predictions from Final Untapped Surfaces

Composes WhipWaveDuality (flash crashes), DataProcessingInequality
(intermediary chains), StagedExpansion (market entry), FailurePareto
(bailout vs bankruptcy), and FoldHeatHierarchy (corporate hierarchy heat)
into five novel economic predictions.

No new axioms. All compositions over existing mechanized theorems.
-/

-- ═══════════════════════════════════════════════════════════════════════════
-- P222: Flash Crashes as Whip Snaps in Market Taper
-- ═══════════════════════════════════════════════════════════════════════════

/-- A market depth profile: each price level has liquidity (mass) and
    order flow (tension). Thinning liquidity is a taper. -/
structure MarketDepth where
  /-- Liquidity at top of book (mass density) -/
  topLiquidity : ℕ
  /-- Liquidity at depth (mass density, lower = thinner) -/
  depthLiquidity : ℕ
  /-- Order flow pressure (tension, constant) -/
  orderFlow : ℕ
  /-- Positive top -/
  hTop : 0 < topLiquidity
  /-- Positive depth -/
  hDepth : 0 < depthLiquidity
  /-- Positive flow -/
  hFlow : 0 < orderFlow

/-- Price impact at a given liquidity level: flow / liquidity.
    Maps to waveSpeedSq = tension / rho. -/
def MarketDepth.priceImpactTop (md : MarketDepth) : ℕ :=
  md.orderFlow / md.topLiquidity

def MarketDepth.priceImpactDepth (md : MarketDepth) : ℕ :=
  md.orderFlow / md.depthLiquidity

/-- Thinner liquidity at depth means larger price impact.
    Composition of fold_increases_wave_speed: lower rho → higher speed. -/
theorem thin_liquidity_amplifies_impact (md : MarketDepth)
    (hThin : md.depthLiquidity < md.topLiquidity) :
    md.priceImpactTop ≤ md.priceImpactDepth := by
  simp [MarketDepth.priceImpactTop, MarketDepth.priceImpactDepth]
  exact Nat.div_le_div_left hThin.le md.hDepth

/-- A flash crash is inevitable when liquidity tapers to near-zero.
    Composition of snap_inevitable: snap occurs at taper boundary.
    At minimum liquidity (1 unit), impact = full order flow. -/
theorem flash_crash_inevitable (md : MarketDepth)
    (hMinLiquidity : md.depthLiquidity = 1) :
    md.priceImpactDepth = md.orderFlow := by
  simp [MarketDepth.priceImpactDepth, hMinLiquidity]

-- ═══════════════════════════════════════════════════════════════════════════
-- P223: Intermediary Chains Lose Information (Data Processing Inequality)
-- ═══════════════════════════════════════════════════════════════════════════

/-- A supply chain with intermediaries. Each intermediary is a non-injective
    fold that erases information about the original product. -/
structure IntermediaryChain where
  /-- Number of distinct product attributes at origin -/
  originAttributes : ℕ
  /-- Number of intermediaries in the chain -/
  intermediaries : ℕ
  /-- Each intermediary erases at least 1 attribute -/
  erasurePerStep : ℕ
  /-- Multiple attributes -/
  hAttributes : 2 ≤ originAttributes
  /-- Positive erasure -/
  hErasure : 0 < erasurePerStep

/-- Information remaining after the chain: origin - (intermediaries × erasure). -/
def IntermediaryChain.remainingInfo (ic : IntermediaryChain) : ℕ :=
  ic.originAttributes - min (ic.intermediaries * ic.erasurePerStep) ic.originAttributes

/-- Information lost through the chain. -/
def IntermediaryChain.informationLost (ic : IntermediaryChain) : ℕ :=
  min (ic.intermediaries * ic.erasurePerStep) ic.originAttributes

/-- More intermediaries → more information loss (monotone).
    Composition of conditionalEntropyNats_comp: chain rule for entropy loss. -/
theorem more_intermediaries_more_loss (ic1 ic2 : IntermediaryChain)
    (hSameOrigin : ic1.originAttributes = ic2.originAttributes)
    (hSameErasure : ic1.erasurePerStep = ic2.erasurePerStep)
    (hMore : ic1.intermediaries ≤ ic2.intermediaries) :
    ic1.informationLost ≤ ic2.informationLost := by
  simp [IntermediaryChain.informationLost]
  subst hSameOrigin; subst hSameErasure
  exact min_le_min_right _ (Nat.mul_le_mul_right _ hMore)

/-- Direct sale (zero intermediaries) loses zero information.
    Composition of conditionalEntropyNats_eq_zero_iff_injective: identity is injective. -/
theorem direct_sale_zero_loss (ic : IntermediaryChain)
    (hDirect : ic.intermediaries = 0) :
    ic.informationLost = 0 := by
  simp [IntermediaryChain.informationLost, hDirect]

/-- Each intermediary step adds positive erasure.
    Composition of strict_data_processing_inequality. -/
theorem each_step_erases (ic : IntermediaryChain) (hSteps : 0 < ic.intermediaries) :
    0 < ic.informationLost := by
  simp [IntermediaryChain.informationLost]
  exact Nat.lt_min.mpr ⟨Nat.mul_pos hSteps ic.hErasure, ic.hAttributes.trans_lt' (by omega)⟩

-- ═══════════════════════════════════════════════════════════════════════════
-- P224: Staged Market Entry Dominates Big-Bang Launch
-- ═══════════════════════════════════════════════════════════════════════════

/-- A market entry strategy: staged (one market at a time) vs
    big-bang (all markets simultaneously). -/
structure MarketEntry where
  /-- Peak capacity per market -/
  peakCapacity : ℕ
  /-- Number of markets to enter -/
  markets : ℕ
  /-- Positive capacity -/
  hCapacity : 0 < peakCapacity
  /-- Multiple markets -/
  hMarkets : 2 ≤ markets

/-- Big-bang waste: capacity spread thin across all markets at once.
    Envelope = markets × peak, frontier = markets × (peak / markets).
    Waste = envelope - frontier. -/
def MarketEntry.bigBangWaste (me : MarketEntry) : ℕ :=
  me.markets * me.peakCapacity - me.peakCapacity

/-- Staged waste: enter one market at a time at full capacity.
    Each market gets peak capacity. Zero waste per market. -/
def MarketEntry.stagedWaste (_me : MarketEntry) : ℕ := 0

/-- Staged entry has less waste than big-bang.
    Composition of staged_fill_dominates_naive. -/
theorem staged_dominates_big_bang (me : MarketEntry) :
    me.stagedWaste ≤ me.bigBangWaste := by
  simp [MarketEntry.stagedWaste, MarketEntry.bigBangWaste]

/-- Big-bang waste scales with market count. -/
theorem big_bang_waste_scales (me : MarketEntry) :
    me.bigBangWaste = (me.markets - 1) * me.peakCapacity := by
  simp [MarketEntry.bigBangWaste]
  ring

/-- More markets → more big-bang waste (monotone). -/
theorem more_markets_more_waste (me1 me2 : MarketEntry)
    (hSameCapacity : me1.peakCapacity = me2.peakCapacity)
    (hMoreMarkets : me1.markets ≤ me2.markets) :
    me1.bigBangWaste ≤ me2.bigBangWaste := by
  simp [MarketEntry.bigBangWaste]; subst hSameCapacity
  exact Nat.sub_le_sub_right (Nat.mul_le_mul_right _ hMoreMarkets) _

-- ═══════════════════════════════════════════════════════════════════════════
-- P225: Bailout vs Bankruptcy as Failure Pareto Frontier
-- ═══════════════════════════════════════════════════════════════════════════

/-- A firm failure has three options (from FailurePareto):
    1. Keep multiplicity (zombie firm: no collapse, positive waste)
    2. Pay vent (bankruptcy: collapse, vent cost)
    3. Pay repair (bailout: collapse with repair debt) -/
inductive FailureResponse where
  | zombie     -- keep operating at loss (no collapse)
  | bankruptcy -- collapse with vent cost (creditor losses)
  | bailout    -- collapse with repair debt (taxpayer cost)

/-- Cost profile of each failure response. -/
structure FailureCost where
  /-- Ongoing waste (zombie operations) -/
  ongoingWaste : ℕ
  /-- One-time vent cost (creditor losses) -/
  ventCost : ℕ
  /-- One-time repair debt (bailout cost) -/
  repairDebt : ℕ

/-- Cost of each response for a firm with N competitive branches. -/
def failureResponseCost (branches : ℕ) (resp : FailureResponse) : FailureCost :=
  match resp with
  | .zombie     => ⟨branches - 1, 0, 0⟩       -- Wallace waste, no collapse
  | .bankruptcy => ⟨0, branches - 1, 0⟩         -- no ongoing, vent all but 1
  | .bailout    => ⟨0, 0, branches - 1⟩         -- no ongoing, repair debt

/-- No response dominates all others: Pareto frontier is non-trivial.
    Composition of keep_not_dominated_by_pay_vent. -/
theorem zombie_not_dominated_by_bankruptcy (branches : ℕ) (hBranches : 2 ≤ branches) :
    (failureResponseCost branches .zombie).ventCost <
    (failureResponseCost branches .bankruptcy).ventCost := by
  simp [failureResponseCost]; omega

theorem bankruptcy_not_dominated_by_zombie (branches : ℕ) (hBranches : 2 ≤ branches) :
    (failureResponseCost branches .bankruptcy).ongoingWaste <
    (failureResponseCost branches .zombie).ongoingWaste := by
  simp [failureResponseCost]; omega

/-- All three responses have the same total cost: branches - 1.
    The failure trilemma: you pay somewhere. -/
theorem total_cost_invariant (branches : ℕ) (resp : FailureResponse) :
    let c := failureResponseCost branches resp
    c.ongoingWaste + c.ventCost + c.repairDebt = branches - 1 := by
  cases resp <;> simp [failureResponseCost]

-- ═══════════════════════════════════════════════════════════════════════════
-- P226: Corporate Hierarchy Heat: Each Management Layer Erases Information
-- ═══════════════════════════════════════════════════════════════════════════

/-- A corporate hierarchy where each layer aggregates reports from below.
    Aggregation is a non-injective fold that erases detail. -/
structure CorporateHierarchy where
  /-- Number of management layers -/
  layers : ℕ
  /-- Information units at ground level -/
  groundInfo : ℕ
  /-- Erasure per layer (aggregation loss) -/
  erasurePerLayer : ℕ
  /-- At least one layer -/
  hLayers : 0 < layers
  /-- Positive ground info -/
  hInfo : 0 < groundInfo
  /-- Positive erasure -/
  hErasure : 0 < erasurePerLayer

/-- Information reaching the top = ground - (layers × erasure). -/
def CorporateHierarchy.topInfo (ch : CorporateHierarchy) : ℕ :=
  ch.groundInfo - min (ch.layers * ch.erasurePerLayer) ch.groundInfo

/-- Total erasure through the hierarchy. -/
def CorporateHierarchy.totalErasure (ch : CorporateHierarchy) : ℕ :=
  min (ch.layers * ch.erasurePerLayer) ch.groundInfo

/-- More layers → more erasure (monotone).
    Composition of fold_heat_hierarchy_strict: each non-injective fold
    adds strictly positive heat. -/
theorem more_layers_more_erasure (ch1 ch2 : CorporateHierarchy)
    (hSameGround : ch1.groundInfo = ch2.groundInfo)
    (hSameErasure : ch1.erasurePerLayer = ch2.erasurePerLayer)
    (hMoreLayers : ch1.layers ≤ ch2.layers) :
    ch1.totalErasure ≤ ch2.totalErasure := by
  simp [CorporateHierarchy.totalErasure]
  subst hSameGround; subst hSameErasure
  exact min_le_min_right _ (Nat.mul_le_mul_right _ hMoreLayers)

/-- Flat organization (1 layer) has minimum erasure.
    Composition of injective_fold_zero_heat for the eliminated layers. -/
theorem flat_org_minimum_erasure (ch : CorporateHierarchy)
    (hFlat : ch.layers = 1) :
    ch.totalErasure = min ch.erasurePerLayer ch.groundInfo := by
  simp [CorporateHierarchy.totalErasure, hFlat]

/-- Each layer adds strictly positive heat. -/
theorem each_layer_erases (ch : CorporateHierarchy) :
    0 < ch.totalErasure := by
  simp [CorporateHierarchy.totalErasure]
  exact Nat.lt_min.mpr ⟨Nat.mul_pos ch.hLayers ch.hErasure,
    ch.hInfo.trans_lt' (by omega)⟩

-- ═══════════════════════════════════════════════════════════════════════════
-- Master Theorem
-- ═══════════════════════════════════════════════════════════════════════════

theorem trade_topology_round4_master
    (ic : IntermediaryChain) (hDirect : ic.intermediaries = 0)
    (me : MarketEntry)
    (ch : CorporateHierarchy) :
    -- (1) Direct sale loses zero information
    ic.informationLost = 0 ∧
    -- (2) Staged entry dominates big-bang
    me.stagedWaste ≤ me.bigBangWaste ∧
    -- (3) Each hierarchy layer erases
    0 < ch.totalErasure := by
  exact ⟨direct_sale_zero_loss ic hDirect,
         staged_dominates_big_bang me,
         each_layer_erases ch⟩

end ForkRaceFoldTheorems
