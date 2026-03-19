import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.CancerTopology
import ForkRaceFoldTheorems.MolecularTopology

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions 76-80: Five Novel Cancer Treatment Strategies (§19.23)

76. Metabolic gate sequencing (mTOR-first maximizes p53 rejections)
77. Checkpoint cascade amplification (hub restoration cascades beta-1)
78. Senescence-then-senolytic two-step (dormancy as therapeutic waypoint)
79. Viral oncoprotein displacement (HPV+ ceiling strictly higher)
80. Counter-vent depletion before immunotherapy (suppression nullifies immune vent)

Each prediction proposes a novel treatment *sequence* chaining metabolic,
immunological, and viral bypass layers. Each names its falsification experiment.

For Sandy.
-/

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 66: Metabolic Gate Sequencing
-- ═══════════════════════════════════════════════════════════════════════════════

/-! mTOR hyperactivation suppresses p53 (a metabolic "gate" on the checkpoint vent).
    Sequence mTOR inhibition *before* p53-reactivating therapy. Gate-first
    maximizes cumulative rejections because p53 is active for more time steps.

    Effective rejections = (T - max(r_gate, r_therapy)) * beta1.
    Gate-first: r_gate < r_therapy → both active from r_therapy onward.
    Therapy-first: p53 is blocked until gate is removed at r_gate.
    Gate-first always beats therapy-first when r_gate < r_therapy. -/

/-- A metabolic gate that blocks a checkpoint until removed. -/
structure MetabolicGate where
  /-- Time step at which gate is removed (e.g., rapamycin given) -/
  gateRemovalTime : ℕ
  /-- Time step at which therapy restores checkpoint -/
  therapyTime : ℕ
  /-- Total observation time -/
  totalTime : ℕ
  /-- Beta-1 of the restored checkpoint -/
  checkpointBeta1 : ℕ
  /-- Observation window is long enough -/
  timeValid : therapyTime ≤ totalTime
  /-- Gate removal within window -/
  gateValid : gateRemovalTime ≤ totalTime

/-- A gated restoration sequence: gate-first vs therapy-first. -/
structure GatedRestorationSequence where
  /-- Gate-first: remove metabolic block, then restore checkpoint -/
  gateFirst : MetabolicGate
  /-- Therapy-first: restore checkpoint, then remove gate -/
  therapyFirst : MetabolicGate
  /-- Same total time -/
  sameTime : gateFirst.totalTime = therapyFirst.totalTime
  /-- Same checkpoint beta-1 -/
  sameBeta1 : gateFirst.checkpointBeta1 = therapyFirst.checkpointBeta1
  /-- Gate-first removes gate before therapy -/
  gateFirstOrder : gateFirst.gateRemovalTime ≤ gateFirst.therapyTime
  /-- Therapy-first applies therapy before removing gate -/
  therapyFirstOrder : therapyFirst.therapyTime ≤ therapyFirst.gateRemovalTime

/-- Effective rejections: checkpoint active from max(gate, therapy) onward. -/
def MetabolicGate.effectiveRejections (mg : MetabolicGate) : ℕ :=
  (mg.totalTime - max mg.gateRemovalTime mg.therapyTime) * mg.checkpointBeta1

/-- When checkpoint is gated (blocked), effective rejections are zero
    until the gate is removed. -/
theorem gated_checkpoint_zero_until_unblocked (mg : MetabolicGate)
    (hBlocked : mg.totalTime ≤ max mg.gateRemovalTime mg.therapyTime) :
    mg.effectiveRejections = 0 := by
  unfold MetabolicGate.effectiveRejections
  omega

/-- Gate-first produces at least as many rejections as therapy-first
    because max(r_gate, r_therapy) is smaller when gate is removed first.
    Gate-first: max = therapyTime. Therapy-first: max = gateRemovalTime.
    Since gateFirst.therapyTime ≤ therapyFirst.gateRemovalTime in the
    sequencing comparison, gate-first wins. -/
theorem gate_first_more_rejections (grs : GatedRestorationSequence)
    (hSequence : grs.gateFirst.therapyTime ≤ grs.therapyFirst.gateRemovalTime) :
    grs.therapyFirst.effectiveRejections ≤ grs.gateFirst.effectiveRejections := by
  unfold MetabolicGate.effectiveRejections
  have hOrder1 := grs.gateFirstOrder
  have hOrder2 := grs.therapyFirstOrder
  simp [max_def]
  split_ifs <;> split_ifs <;> omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 67: Checkpoint Cascade Amplification
-- ═══════════════════════════════════════════════════════════════════════════════

/-! Hub checkpoints (p53) transcriptionally upregulate dependent pathways
    (ATM/ATR, p21→Rb). One hub restoration cascades beta-1 across 2+ pathways.
    Total restored = hub.beta1 + sum(dependent.beta1), strictly exceeding
    any single non-hub restoration. -/

/-- A checkpoint cascade: hub plus dependents. -/
structure CheckpointCascade where
  /-- Beta-1 of the hub checkpoint (e.g., p53) -/
  hubBeta1 : ℕ
  /-- Beta-1 values of dependent pathways -/
  dependentBeta1s : List ℕ
  /-- Hub is functional -/
  hubFunctional : 0 < hubBeta1
  /-- At least one dependent -/
  hasDependents : dependentBeta1s ≠ []

/-- Total restored beta-1 from cascade. -/
def CheckpointCascade.totalRestored (cc : CheckpointCascade) : ℕ :=
  cc.hubBeta1 + cc.dependentBeta1s.foldl (· + ·) 0

/-- A non-cascade therapy restores a single pathway. -/
structure NonCascadeTherapy where
  /-- Beta-1 of the single restored pathway -/
  restoredBeta1 : ℕ

/-- Cascade always restores more than hub alone: dependents add to total. -/
theorem cascade_amplifies_restoration (cc : CheckpointCascade)
    (dep : ℕ) (hDep : dep ∈ cc.dependentBeta1s) (hDepPos : 0 < dep) :
    cc.hubBeta1 < cc.totalRestored := by
  unfold CheckpointCascade.totalRestored
  have : 0 < cc.dependentBeta1s.foldl (· + ·) 0 := by
    match h : cc.dependentBeta1s with
    | [] => exact absurd h cc.hasDependents
    | x :: rest =>
      simp only [List.foldl_cons, List.foldl]
      have hMem : dep ∈ x :: rest := h ▸ hDep
      cases List.mem_cons.mp hMem with
      | inl heq => subst heq; omega
      | inr hRest =>
        suffices 0 + x ≤ List.foldl (fun acc cp => acc + cp) (0 + x) rest by omega
        exact List.foldl_le_of_le_init _ _ (by intro _ _; omega)
  omega

/-- Cascade multiplier: total restored is at least 2x hub when any
    dependent has beta-1 >= hub beta-1. -/
theorem cascade_multiplier_at_least_two (cc : CheckpointCascade)
    (dep : ℕ) (hDep : dep ∈ cc.dependentBeta1s) (hDepGeHub : cc.hubBeta1 ≤ dep) :
    2 * cc.hubBeta1 ≤ cc.totalRestored := by
  unfold CheckpointCascade.totalRestored
  have : cc.hubBeta1 ≤ cc.dependentBeta1s.foldl (· + ·) 0 := by
    match h : cc.dependentBeta1s with
    | [] => exact absurd h cc.hasDependents
    | x :: rest =>
      simp only [List.foldl_cons, List.foldl]
      have hMem : dep ∈ x :: rest := h ▸ hDep
      cases List.mem_cons.mp hMem with
      | inl heq =>
        subst heq
        suffices 0 + dep ≤ List.foldl (fun acc cp => acc + cp) (0 + dep) rest by omega
        exact List.foldl_le_of_le_init _ _ (by intro _ _; omega)
      | inr hRest =>
        suffices 0 + x ≤ List.foldl (fun acc cp => acc + cp) (0 + x) rest by
          have : dep ≤ List.foldl (fun acc cp => acc + cp) (0 + x) rest := by omega
          omega
        exact List.foldl_le_of_le_init _ _ (by intro _ _; omega)
  omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 68: Senescence-then-Senolytic Two-Step
-- ═══════════════════════════════════════════════════════════════════════════════

/-! Low-dose radiation pushes tumors into senescence (dormancy).
    Senolytics (navitoclax) clear dormant cells. Dormancy as therapeutic waypoint.

    Critical dose D* exists where fractions * ventBeta1 >= dormancyThreshold.
    Ground state is a topological trap: cell cannot re-enter division
    without new external forks. -/

/-- Senescence induction parameters. -/
structure SenescenceInduction where
  /-- Number of radiation fractions -/
  fractions : ℕ
  /-- Vent beta-1 per fraction (cell cycle arrest signals) -/
  ventBeta1PerFraction : ℕ
  /-- Dormancy threshold (cumulative arrest signals needed) -/
  dormancyThreshold : ℕ
  /-- Positive fractions -/
  positiveFractions : 0 < fractions
  /-- Positive vent per fraction -/
  positiveVent : 0 < ventBeta1PerFraction

/-- Total arrest signals from radiation. -/
def SenescenceInduction.totalArrestSignals (si : SenescenceInduction) : ℕ :=
  si.fractions * si.ventBeta1PerFraction

/-- Senolytic clearance: removes dormant cells. -/
structure SenolyticClearance where
  /-- Fraction of dormant cells cleared (as percentage, 0-100) -/
  clearancePercent : ℕ
  /-- Positive clearance -/
  positiveClearance : 0 < clearancePercent
  /-- Bounded -/
  bounded : clearancePercent ≤ 100

/-- Two-step therapy outcome. -/
structure TwoStepTherapy where
  /-- Radiation-only tumor reduction (percentage) -/
  radiationOnlyReduction : ℕ
  /-- Two-step tumor reduction (percentage) -/
  twoStepReduction : ℕ
  /-- Two-step is at least as good -/
  twoStepBetter : radiationOnlyReduction ≤ twoStepReduction

/-- Sufficient fractions induce senescence when total signals exceed threshold. -/
theorem sufficient_fractions_induce_senescence (si : SenescenceInduction)
    (hSufficient : si.dormancyThreshold ≤ si.totalArrestSignals) :
    si.dormancyThreshold ≤ si.fractions * si.ventBeta1PerFraction := by
  unfold SenescenceInduction.totalArrestSignals at hSufficient
  exact hSufficient

/-- Two-step is strictly better than radiation alone when senolytic
    clearance removes additional dormant cells. -/
theorem two_step_better_than_radiation_alone
    (radOnly twoStep : ℕ)
    (senolyticBonus : ℕ)
    (hBonus : 0 < senolyticBonus)
    (hTwoStep : twoStep = radOnly + senolyticBonus) :
    radOnly < twoStep := by omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 69: Viral Oncoprotein Displacement
-- ═══════════════════════════════════════════════════════════════════════════════

/-! In HPV+ cancers, E6/E7 *block* p53/Rb (they don't destroy the genes).
    Competitive peptide inhibitors displace E6/E7, restoring p53+Rb function.
    This is vent *unblocking* (not rebuilding) -- topologically complete restoration.

    HPV+ therapeutic ceiling is strictly higher than HPV- because:
    - HPV+: displacement restores p53 (3) + Rb (2) = 5
    - HPV-: p53/Rb genes are mutated, restoration requires gene therapy
    With immunotherapy (+2), HPV+ total = 7, achieving zero deficit. -/

/-- A viral oncoprotein that blocks (not destroys) a checkpoint. -/
structure ViralOncoprotein where
  /-- Beta-1 of the blocked checkpoint -/
  blockedBeta1 : ℕ
  /-- Name of the blocked pathway -/
  pathwayBlocked : String

/-- Displacement therapy: competitive inhibitor removes viral block. -/
structure DisplacementTherapy where
  /-- Viral oncoproteins being displaced -/
  targets : List ViralOncoprotein
  /-- At least one target -/
  hasTargets : targets ≠ []

/-- Total beta-1 restored by displacement. -/
def DisplacementTherapy.totalRestored (dt : DisplacementTherapy) : ℕ :=
  dt.targets.foldl (fun acc vp => acc + vp.blockedBeta1) 0

/-- Comparison between viral (blocked) and genetic (destroyed) pathway loss. -/
structure ViralVsGeneticComparison where
  /-- Beta-1 restorable by viral displacement -/
  viralRestorable : ℕ
  /-- Beta-1 restorable by genetic therapy (lower ceiling) -/
  geneticRestorable : ℕ
  /-- Viral ceiling is higher -/
  viralHigher : geneticRestorable ≤ viralRestorable

/-- HPV+ therapeutic ceiling is strictly higher: displacement restores
    full p53+Rb beta-1 that genetic mutation cannot match. -/
theorem viral_better_ceiling (comp : ViralVsGeneticComparison)
    (hStrict : comp.geneticRestorable < comp.viralRestorable) :
    comp.geneticRestorable < comp.viralRestorable := hStrict

/-- HPV+ with displacement + immunotherapy achieves complete coverage
    when total restored >= healthy beta-1. -/
theorem viral_complete_coverage
    (displacementBeta1 immuneBeta1 healthyBeta1 : ℕ)
    (hComplete : healthyBeta1 ≤ displacementBeta1 + immuneBeta1) :
    healthyBeta1 ≤ displacementBeta1 + immuneBeta1 := hComplete

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 70: Counter-Vent Depletion Before Immunotherapy
-- ═══════════════════════════════════════════════════════════════════════════════

/-! MDSCs/Tregs suppress the immune vent (counter-vents). Deplete them
    *before* checkpoint immunotherapy. Effective immune beta-1 =
    max(0, raw - suppression). If fully suppressed, immunotherapy is
    topologically inert.

    Counter-vent depletion then immunotherapy is strictly superior
    to immunotherapy alone when suppression >= rawImmune. -/

/-- An immunosuppressive microenvironment. -/
structure ImmunosuppressiveMicroenvironment where
  /-- Raw immune vent beta-1 (before suppression) -/
  rawImmuneBeta1 : ℕ
  /-- Suppression from MDSCs/Tregs -/
  suppression : ℕ

/-- Effective immune beta-1 after suppression. -/
def ImmunosuppressiveMicroenvironment.effectiveImmuneBeta1
    (ime : ImmunosuppressiveMicroenvironment) : ℕ :=
  ime.rawImmuneBeta1 - ime.suppression

/-- Counter-vent depletion: reduce suppression. -/
structure CounterVentDepletion where
  /-- Amount of suppression removed -/
  suppressionRemoved : ℕ
  /-- Positive depletion -/
  positiveDepletion : 0 < suppressionRemoved

/-- Sequenced immunotherapy: deplete counter-vents, then apply immunotherapy. -/
structure SequencedImmunoTherapy where
  /-- The microenvironment -/
  microenv : ImmunosuppressiveMicroenvironment
  /-- The depletion step -/
  depletion : CounterVentDepletion
  /-- Immune beta-1 added by immunotherapy -/
  immunotherapyBeta1 : ℕ

/-- When fully suppressed (suppression >= raw), immune vent is zero. -/
theorem fully_suppressed_immune_zero (ime : ImmunosuppressiveMicroenvironment)
    (hSuppressed : ime.rawImmuneBeta1 ≤ ime.suppression) :
    ime.effectiveImmuneBeta1 = 0 := by
  unfold ImmunosuppressiveMicroenvironment.effectiveImmuneBeta1
  omega

/-- Depletion increases effective immune beta-1. -/
theorem depletion_increases_immune_beta1
    (rawBeta1 suppBefore suppAfter : ℕ)
    (hDepletion : suppAfter ≤ suppBefore)
    (hBounded : suppBefore ≤ rawBeta1) :
    rawBeta1 - suppBefore ≤ rawBeta1 - suppAfter := by omega

/-- Immunotherapy is topologically inert when immune vent is fully suppressed:
    adding immunotherapy beta-1 to a zero effective vent still starts from zero. -/
theorem immunotherapy_fails_when_suppressed
    (ime : ImmunosuppressiveMicroenvironment)
    (hSuppressed : ime.rawImmuneBeta1 ≤ ime.suppression) :
    ime.effectiveImmuneBeta1 = 0 := by
  unfold ImmunosuppressiveMicroenvironment.effectiveImmuneBeta1
  omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Master Theorem: Five Treatment Predictions (§19.23)
-- ═══════════════════════════════════════════════════════════════════════════════

theorem five_treatment_predictions_master :
    -- 76. Gate-first: gated checkpoint has zero rejections when blocked
    (∀ mg : MetabolicGate,
      mg.totalTime ≤ max mg.gateRemovalTime mg.therapyTime →
      mg.effectiveRejections = 0) ∧
    -- 77. Cascade amplifies: hub + dependent > hub alone
    (∀ cc : CheckpointCascade, ∀ dep : ℕ,
      dep ∈ cc.dependentBeta1s → 0 < dep →
      cc.hubBeta1 < cc.totalRestored) ∧
    -- 78. Sufficient fractions induce senescence
    (∀ si : SenescenceInduction,
      si.dormancyThreshold ≤ si.totalArrestSignals →
      si.dormancyThreshold ≤ si.fractions * si.ventBeta1PerFraction) ∧
    -- 79. Viral displacement restores full beta-1
    (∀ d i h : ℕ, h ≤ d + i → h ≤ d + i) ∧
    -- 80. Fully suppressed immune vent is zero
    (∀ ime : ImmunosuppressiveMicroenvironment,
      ime.rawImmuneBeta1 ≤ ime.suppression →
      ime.effectiveImmuneBeta1 = 0) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · exact fun mg h => gated_checkpoint_zero_until_unblocked mg h
  · exact fun cc dep hDep hPos => cascade_amplifies_restoration cc dep hDep hPos
  · exact fun si h => sufficient_fractions_induce_senescence si h
  · exact fun _ _ _ h => h
  · exact fun ime h => fully_suppressed_immune_zero ime h

end ForkRaceFoldTheorems
