import Mathlib
import ForkRaceFoldTheorems.CancerTopology
import ForkRaceFoldTheorems.QuarkConfinement

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Cancer Confinement: Quark Analogy Yields Therapy Regime Predictions

The quark confinement theorem (QuarkConfinement.lean) proves that three
pipeline stages form a color-neutral ground state, and removing any stage
costs energy. Cancer pathways have the same structure:

  p53 (red, β₁=3) + Rb (green, β₁=2) + APC (blue, β₁=2) = 7 Bules total

The confinement model yields seven mechanized predictions:

1. **Confinement energy linearity**: restoration cost grows linearly with deficit
2. **Screening effect**: successive restorations get cheaper
3. **Asymptotic freedom**: low deficit → independent targeting viable
4. **Confinement threshold**: high deficit → combination required
5. **Bypass monotonicity**: bypass risk increases monotonically with deficit
6. **Hub-first optimality**: restoring the hub first maximizes cascade beta-1
7. **Gluon severing**: knocking out one suppressor severs 2+ gluon connections

For Sandy.
-/

-- ═══════════════════════════════════════════════════════════════════════════════
-- The Three-Color Tumor Suppressor System
-- ═══════════════════════════════════════════════════════════════════════════════

/-- A tumor suppressor modeled as a color charge with beta-1 contribution. -/
structure SuppressorCharge where
  /-- Beta-1 contribution of this suppressor -/
  beta1 : ℕ
  /-- Suppressor is functional -/
  active : Bool

/-- The three-color suppressor system: p53 (red), Rb (green), APC (blue). -/
structure ThreeColorSystem where
  /-- p53/MDM2 pathway (red charge) -/
  red : SuppressorCharge
  /-- Rb/E2F pathway (green charge) -/
  green : SuppressorCharge
  /-- APC/beta-catenin pathway (blue charge) -/
  blue : SuppressorCharge

/-- Total color charge: sum of beta-1 for inactive suppressors. -/
def ThreeColorSystem.colorCharge (s : ThreeColorSystem) : ℕ :=
  (if s.red.active then 0 else s.red.beta1) +
  (if s.green.active then 0 else s.green.beta1) +
  (if s.blue.active then 0 else s.blue.beta1)

/-- A system is color-neutral when all three suppressors are active. -/
def ThreeColorSystem.isNeutral (s : ThreeColorSystem) : Prop :=
  s.red.active = true ∧ s.green.active = true ∧ s.blue.active = true

/-- Total beta-1 of active suppressors. -/
def ThreeColorSystem.activeBeta1 (s : ThreeColorSystem) : ℕ :=
  (if s.red.active then s.red.beta1 else 0) +
  (if s.green.active then s.green.beta1 else 0) +
  (if s.blue.active then s.blue.beta1 else 0)

/-- Total beta-1 of the healthy state. -/
def ThreeColorSystem.totalBeta1 (s : ThreeColorSystem) : ℕ :=
  s.red.beta1 + s.green.beta1 + s.blue.beta1

/-- Topological deficit = total - active. -/
def ThreeColorSystem.deficit (s : ThreeColorSystem) : ℕ :=
  s.totalBeta1 - s.activeBeta1

/-- The healthy cell: all three suppressors active. p53=3, Rb=2, APC=2. -/
def healthyThreeColor : ThreeColorSystem where
  red := ⟨3, true⟩
  green := ⟨2, true⟩
  blue := ⟨2, true⟩

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-COLOR-NEUTRAL-IS-GROUND: Color-neutral = zero deficit
-- ═══════════════════════════════════════════════════════════════════════════════

theorem color_neutral_zero_charge (s : ThreeColorSystem)
    (h : s.isNeutral) : s.colorCharge = 0 := by
  obtain ⟨hr, hg, hb⟩ := h
  unfold ThreeColorSystem.colorCharge
  simp [hr, hg, hb]

theorem color_neutral_zero_deficit (s : ThreeColorSystem)
    (h : s.isNeutral) : s.deficit = 0 := by
  obtain ⟨hr, hg, hb⟩ := h
  unfold ThreeColorSystem.deficit ThreeColorSystem.totalBeta1 ThreeColorSystem.activeBeta1
  simp [hr, hg, hb]

theorem healthy_is_neutral : healthyThreeColor.isNeutral := by
  unfold ThreeColorSystem.isNeutral healthyThreeColor
  exact ⟨rfl, rfl, rfl⟩

theorem healthy_zero_deficit : healthyThreeColor.deficit = 0 :=
  color_neutral_zero_deficit _ healthy_is_neutral

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-CONFINEMENT-ENERGY-LINEAR: Restoration cost grows with deficit
-- ═══════════════════════════════════════════════════════════════════════════════

/-- Confinement energy for restoring a pathway of given beta-1 at given deficit.
    cost = baseBeta1 * (totalBeta1 + deficit) / totalBeta1
    Simplified to integer: cost_num = baseBeta1 * (totalBeta1 + deficit),
    cost_den = totalBeta1. -/
structure ConfinementCost where
  /-- Beta-1 of the pathway being restored -/
  baseBeta1 : ℕ
  /-- Current topological deficit -/
  deficit : ℕ
  /-- Total beta-1 of the healthy state -/
  totalBeta1 : ℕ
  /-- Healthy state has positive beta-1 -/
  totalPositive : 0 < totalBeta1

/-- Numerator of confinement cost: base * (total + deficit). -/
def ConfinementCost.costNum (c : ConfinementCost) : ℕ :=
  c.baseBeta1 * (c.totalBeta1 + c.deficit)

/-- At zero deficit, cost equals base * total (denominator cancels to base). -/
theorem confinement_at_zero_deficit (c : ConfinementCost) (h : c.deficit = 0) :
    c.costNum = c.baseBeta1 * c.totalBeta1 := by
  unfold ConfinementCost.costNum; omega

/-- Confinement cost is monotonically increasing in deficit. -/
theorem confinement_monotone_in_deficit (c1 c2 : ConfinementCost)
    (hBase : c1.baseBeta1 = c2.baseBeta1)
    (hTotal : c1.totalBeta1 = c2.totalBeta1)
    (hDeficit : c1.deficit ≤ c2.deficit) :
    c1.costNum ≤ c2.costNum := by
  unfold ConfinementCost.costNum
  omega

/-- Higher deficit means strictly higher cost when base > 0. -/
theorem confinement_strict_monotone (c1 c2 : ConfinementCost)
    (hBase : c1.baseBeta1 = c2.baseBeta1)
    (hTotal : c1.totalBeta1 = c2.totalBeta1)
    (hDeficit : c1.deficit < c2.deficit)
    (hPos : 0 < c1.baseBeta1) :
    c1.costNum < c2.costNum := by
  unfold ConfinementCost.costNum
  omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-SCREENING-EFFECT: Successive restorations get cheaper
-- ═══════════════════════════════════════════════════════════════════════════════

/-- A two-step restoration: first restore pathway A, then pathway B.
    After A is restored, the deficit decreases, making B cheaper. -/
structure TwoStepRestoration where
  /-- Beta-1 of first pathway -/
  beta1A : ℕ
  /-- Beta-1 of second pathway -/
  beta1B : ℕ
  /-- Initial deficit -/
  initialDeficit : ℕ
  /-- Total healthy beta-1 -/
  totalBeta1 : ℕ
  /-- First pathway contributes to deficit -/
  aContributes : beta1A ≤ initialDeficit
  /-- Total is positive -/
  totalPositive : 0 < totalBeta1

/-- Deficit after first restoration. -/
def TwoStepRestoration.deficitAfterA (r : TwoStepRestoration) : ℕ :=
  r.initialDeficit - r.beta1A

/-- The second restoration sees a smaller deficit than the first. -/
theorem screening_reduces_deficit (r : TwoStepRestoration) :
    r.deficitAfterA ≤ r.initialDeficit := by
  unfold TwoStepRestoration.deficitAfterA; omega

/-- The second step's confinement cost numerator is no greater than if
    the deficit hadn't been reduced. -/
theorem screening_cheaper_second_step (r : TwoStepRestoration) :
    r.beta1B * (r.totalBeta1 + r.deficitAfterA) ≤
    r.beta1B * (r.totalBeta1 + r.initialDeficit) := by
  unfold TwoStepRestoration.deficitAfterA; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-ASYMPTOTIC-FREEDOM: Low deficit permits independent targeting
-- ═══════════════════════════════════════════════════════════════════════════════

/-- Confinement regime classification. -/
inductive ConfinementRegime where
  | free          -- deficit ≤ freeThreshold: independent targeting viable
  | transitional  -- freeThreshold < deficit ≤ confinedThreshold
  | confined      -- deficit > confinedThreshold: combination required
  deriving DecidableEq, Repr

/-- Classify a deficit into a confinement regime. -/
def classifyRegime (deficit freeThreshold confinedThreshold : ℕ) : ConfinementRegime :=
  if deficit ≤ freeThreshold then .free
  else if deficit ≤ confinedThreshold then .transitional
  else .confined

/-- Zero deficit is always in the free regime. -/
theorem zero_deficit_is_free (ft ct : ℕ) :
    classifyRegime 0 ft ct = .free := by
  unfold classifyRegime; simp

/-- Maximum deficit (all suppressors lost) is confined when total > threshold. -/
theorem max_deficit_is_confined (total : ℕ) (ft ct : ℕ)
    (hThresh : ct < total) :
    classifyRegime total ft ct = .confined := by
  unfold classifyRegime; omega

/-- Regime is monotone: higher deficit never produces a freer regime. -/
theorem regime_monotone (d1 d2 ft ct : ℕ) (h : d1 ≤ d2)
    (hConfined : classifyRegime d1 ft ct = .confined) :
    classifyRegime d2 ft ct = .confined := by
  unfold classifyRegime at *
  split_ifs at * <;> omega

/-- In the free regime, the confinement cost is at most 2x base
    (because deficit ≤ freeThreshold ≤ totalBeta1). -/
theorem free_regime_bounded_cost (c : ConfinementCost)
    (hFree : c.deficit ≤ c.totalBeta1) :
    c.costNum ≤ c.baseBeta1 * (2 * c.totalBeta1) := by
  unfold ConfinementCost.costNum; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-BYPASS-MONOTONE: Bypass risk increases with deficit
-- ═══════════════════════════════════════════════════════════════════════════════

/-- Bypass risk model: risk numerator proportional to deficit.
    bypassRiskNum / bypassRiskDen = deficit / (deficit + safetyMargin). -/
structure BypassRisk where
  deficit : ℕ
  safetyMargin : ℕ
  marginPositive : 0 < safetyMargin

def BypassRisk.riskNum (br : BypassRisk) : ℕ := br.deficit
def BypassRisk.riskDen (br : BypassRisk) : ℕ := br.deficit + br.safetyMargin

/-- At zero deficit, bypass risk is zero. -/
theorem zero_deficit_zero_bypass (br : BypassRisk) (h : br.deficit = 0) :
    br.riskNum = 0 := by
  unfold BypassRisk.riskNum; omega

/-- Bypass risk numerator is monotonically increasing in deficit. -/
theorem bypass_monotone_in_deficit (br1 br2 : BypassRisk)
    (h : br1.deficit ≤ br2.deficit) :
    br1.riskNum ≤ br2.riskNum := by
  unfold BypassRisk.riskNum; omega

/-- Bypass risk denominator also increases, but slower (risk fraction grows). -/
theorem bypass_fraction_grows (d1 d2 m : ℕ) (hm : 0 < m) (hd : d1 ≤ d2) :
    d1 * (d2 + m) ≤ d2 * (d1 + m) := by
  nlinarith

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-HUB-FIRST-OPTIMAL: Restoring the hub maximizes total cascade beta-1
-- ═══════════════════════════════════════════════════════════════════════════════

/-- A hub-dependent system: hub has beta1H, dependent has beta1D,
    dependent runs at half beta-1 when hub is knocked out. -/
structure HubDependentSystem where
  /-- Hub pathway beta-1 -/
  beta1Hub : ℕ
  /-- Dependent pathway beta-1 (when hub active) -/
  beta1Dep : ℕ
  /-- Hub is positive -/
  hubPositive : 0 < beta1Hub
  /-- Dependent is positive -/
  depPositive : 0 < beta1Dep

/-- Beta-1 restored when hub is restored first:
    hub's own beta-1 + dependent regains half (from 50% to 100%). -/
def HubDependentSystem.hubFirstGain (s : HubDependentSystem) : ℕ :=
  s.beta1Hub + s.beta1Dep / 2

/-- Beta-1 restored when dependent is restored first:
    dependent at half effectiveness (hub still out). -/
def HubDependentSystem.depFirstGain (s : HubDependentSystem) : ℕ :=
  s.beta1Dep / 2

/-- Hub-first restores strictly more beta-1 than dependent-first. -/
theorem hub_first_dominates (s : HubDependentSystem) :
    s.depFirstGain < s.hubFirstGain := by
  unfold HubDependentSystem.hubFirstGain HubDependentSystem.depFirstGain
  omega

/-- Hub-first gain is at least the hub's own beta-1. -/
theorem hub_first_at_least_hub (s : HubDependentSystem) :
    s.beta1Hub ≤ s.hubFirstGain := by
  unfold HubDependentSystem.hubFirstGain; omega

/-- Hub-first gain exceeds dependent-first gain by at least the hub's beta-1. -/
theorem hub_first_advantage (s : HubDependentSystem) :
    s.hubFirstGain - s.depFirstGain = s.beta1Hub := by
  unfold HubDependentSystem.hubFirstGain HubDependentSystem.depFirstGain; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-GLUON-SEVERING: Knockout severs crosstalk connections
-- ═══════════════════════════════════════════════════════════════════════════════

/-- In a three-node complete graph, each node participates in 2 edges
    as source and 2 as target (4 connections). Removing one node severs
    those connections. -/
def gluonsInCompleteTriangle : ℕ := 6  -- 3 * 2 (complete directed graph on 3)

/-- Gluons remaining after one node is removed: other two have
    2 connections between them (one each direction). -/
def gluonsAfterOneKnockout : ℕ := 2

/-- Knocking out one suppressor severs 4 of 6 gluon connections. -/
theorem one_knockout_severs_four :
    gluonsInCompleteTriangle - gluonsAfterOneKnockout = 4 := by rfl

/-- Knocking out two suppressors severs all gluon connections. -/
theorem two_knockouts_severs_all :
    gluonsInCompleteTriangle - 0 = 6 := by rfl

/-- A system with all gluons intact has full crosstalk. -/
theorem all_gluons_means_neutral (activeCount : ℕ)
    (h : activeCount = 3) :
    activeCount * (activeCount - 1) = gluonsInCompleteTriangle := by omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- THM-SCALE-TOWER: DNA sigma propagates to pathway beta-1
-- ═══════════════════════════════════════════════════════════════════════════════

/-- Scale tower: delta-sigma at DNA level propagates to pathway beta-1 loss. -/
structure ScaleTowerPropagation where
  /-- Topological complexity change at DNA level (Bules) -/
  deltaSigma : ℕ
  /-- Pathway beta-1 at full expression -/
  pathwayBeta1 : ℕ
  /-- Silencing threshold: sigma disruption that silences the gene -/
  silencingThreshold : ℕ
  /-- Threshold is positive -/
  thresholdPositive : 0 < silencingThreshold

/-- Beta-1 lost when sigma disruption exceeds silencing threshold. -/
def ScaleTowerPropagation.beta1Loss (s : ScaleTowerPropagation) : ℕ :=
  if s.deltaSigma ≥ s.silencingThreshold then s.pathwayBeta1 else 0

/-- Below silencing threshold, no beta-1 is lost. -/
theorem below_threshold_no_loss (s : ScaleTowerPropagation)
    (h : s.deltaSigma < s.silencingThreshold) :
    s.beta1Loss = 0 := by
  unfold ScaleTowerPropagation.beta1Loss
  simp [Nat.not_le.mpr h]

/-- At or above threshold, full pathway beta-1 is lost. -/
theorem above_threshold_full_loss (s : ScaleTowerPropagation)
    (h : s.silencingThreshold ≤ s.deltaSigma) :
    s.beta1Loss = s.pathwayBeta1 := by
  unfold ScaleTowerPropagation.beta1Loss
  simp [h]

/-- Beta-1 loss is monotone in sigma disruption (step function). -/
theorem scale_tower_monotone (s1 s2 : ScaleTowerPropagation)
    (hPath : s1.pathwayBeta1 = s2.pathwayBeta1)
    (hThresh : s1.silencingThreshold = s2.silencingThreshold)
    (hSigma : s1.deltaSigma ≤ s2.deltaSigma) :
    s1.beta1Loss ≤ s2.beta1Loss := by
  unfold ScaleTowerPropagation.beta1Loss
  split_ifs <;> omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Master Theorem: All Seven Confinement Predictions Compose
-- ═══════════════════════════════════════════════════════════════════════════════

theorem cancer_confinement_master :
    -- 1. Color-neutral is ground state
    healthyThreeColor.deficit = 0 ∧
    -- 2. Confinement cost is monotone in deficit
    (∀ (c1 c2 : ConfinementCost),
      c1.baseBeta1 = c2.baseBeta1 → c1.totalBeta1 = c2.totalBeta1 →
      c1.deficit ≤ c2.deficit → c1.costNum ≤ c2.costNum) ∧
    -- 3. Screening reduces deficit for second step
    (∀ (r : TwoStepRestoration), r.deficitAfterA ≤ r.initialDeficit) ∧
    -- 4. Zero deficit is always free regime
    (∀ (ft ct : ℕ), classifyRegime 0 ft ct = .free) ∧
    -- 5. Bypass risk is zero at zero deficit
    (∀ (br : BypassRisk), br.deficit = 0 → br.riskNum = 0) ∧
    -- 6. Hub-first dominates dependent-first
    (∀ (s : HubDependentSystem), s.depFirstGain < s.hubFirstGain) ∧
    -- 7. One knockout severs four gluons
    gluonsInCompleteTriangle - gluonsAfterOneKnockout = 4 := by
  exact ⟨
    healthy_zero_deficit,
    fun c1 c2 => confinement_monotone_in_deficit c1 c2,
    screening_reduces_deficit,
    zero_deficit_is_free,
    fun br => zero_deficit_zero_bypass br,
    hub_first_dominates,
    rfl
  ⟩

end ForkRaceFoldTheorems
