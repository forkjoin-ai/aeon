import Mathlib
import ForkRaceFoldTheorems.BuleyeanEvidence
import ForkRaceFoldTheorems.CommunityDominance
import ForkRaceFoldTheorems.ReynoldsBFT

namespace ForkRaceFoldTheorems

/-!
# Pluralist Republic

Composes the community-dominance, Buleyean-evidence, and Reynolds-BFT
surfaces into a minimal governance theorem family.

The formal claim is not that every plural arrangement works. The point is
sharper:

1. bare one-stream rule is structurally deficit-positive on any nontrivial
   issue topology;
2. plural representation plus positive community context strictly dominates
   that one-stream baseline;
3. republican adjudication keeps a single public verdict stream, but gates
   it by the exact `β₁ = 0` evidence condition;
4. the deliberative consensus layer is regime-switched rather than fixed,
   with exact `mergeAll` / `quorumFold` / `syncRequired` boundaries.

So the stable institutional shape formalized here is a community-mediated
pluralist republic: many representation paths, one auditable verdict gate,
and a consensus rule that changes with load instead of pretending one rule
fits every regime.
-/

/-- A pluralist republic has a nontrivial issue surface, at least two
    representation streams, and positive shared community context. -/
structure PluralistRepublic where
  issueDimensions : ℕ
  representationStreams : ℕ
  communityContext : ℕ
  hIssueComplex : 2 ≤ issueDimensions
  hPlural : 2 ≤ representationStreams
  hCommunity : 0 < communityContext

/-- The governance topology viewed as a failure topology: issue dimensions
    are the independent failure paths, representation streams are the
    decision channels, and community context is carried separately. -/
def PluralistRepublic.toFailureTopology (pr : PluralistRepublic) : FailureTopology where
  failurePaths := pr.issueDimensions
  decisionStreams := pr.representationStreams
  hFailurePos := pr.hIssueComplex
  hDecisionPos := lt_of_lt_of_le (by decide) pr.hPlural

/-- The bare one-stream comparison surface for the same issue topology. -/
def PluralistRepublic.oneStreamTopology (pr : PluralistRepublic) : FailureTopology where
  failurePaths := pr.issueDimensions
  decisionStreams := 1
  hFailurePos := pr.hIssueComplex
  hDecisionPos := by decide

/-- Total civic capacity is explicit streams plus shared community context. -/
def PluralistRepublic.totalCapacity (pr : PluralistRepublic) : ℕ :=
  pr.representationStreams + pr.communityContext

/-- Governance deficit after accounting for community mediation. -/
def PluralistRepublic.mediatedDeficit (pr : PluralistRepublic) : ℤ :=
  communityReducedDeficit pr.toFailureTopology pr.communityContext

/-- Governance deficit of the one-stream baseline. -/
def PluralistRepublic.oneStreamDeficit (pr : PluralistRepublic) : ℤ :=
  schedulingDeficit pr.oneStreamTopology

/-- Remaining governance Bule after community mediation. -/
def PluralistRepublic.mediatedBule (pr : PluralistRepublic) : ℤ :=
  buleDeficit pr.toFailureTopology pr.communityContext

/-- Bare one-stream rule is always deficit-positive on a nontrivial issue
    topology. -/
theorem one_stream_rule_positive_deficit (pr : PluralistRepublic) :
    0 < pr.oneStreamDeficit := by
  have hMismatch : pr.oneStreamTopology.decisionStreams < pr.oneStreamTopology.failurePaths := by
    simpa [PluralistRepublic.oneStreamTopology] using
      (lt_of_lt_of_le (by decide) pr.hIssueComplex)
  simpa [PluralistRepublic.oneStreamDeficit, schedulingDeficit, failureToSemiotic] using
    semiotic_deficit (failureToSemiotic pr.oneStreamTopology 0) hMismatch

/-- A pluralist republic strictly improves on the same issue topology forced
    through one stream. Positive community context and at least one extra
    representation stream are enough for strict domination. -/
theorem pluralist_republic_strictly_dominates_one_stream_rule
    (pr : PluralistRepublic) :
    pr.mediatedDeficit < pr.oneStreamDeficit := by
  have hCapacityPos : 1 ≤ pr.representationStreams + pr.communityContext := by
    exact le_trans (by decide : 1 ≤ 2) (le_trans pr.hPlural (Nat.le_add_right _ _))
  have hRep : (2 : ℤ) ≤ pr.representationStreams := by
    exact_mod_cast pr.hPlural
  have hComm : (1 : ℤ) ≤ pr.communityContext := by
    exact_mod_cast (Nat.succ_le_of_lt pr.hCommunity)
  have hGap : (0 : ℤ) < (pr.representationStreams : ℤ) + pr.communityContext - 1 := by
    linarith
  unfold PluralistRepublic.mediatedDeficit PluralistRepublic.oneStreamDeficit
  unfold communityReducedDeficit schedulingDeficit contextReducedDeficit semioticDeficit
  unfold failureToSemiotic PluralistRepublic.toFailureTopology PluralistRepublic.oneStreamTopology
  simp [topologicalDeficit, computationBeta1, transportBeta1]
  exact lt_of_lt_of_le (lt_of_lt_of_le (by decide) pr.hPlural) (Nat.le_add_right _ _)

/-- The strict-domination gap is exact: relative to one-stream rule, plural
    representation plus community mediation recovers exactly
    `representationStreams + communityContext - 1` units of deficit. -/
theorem pluralist_republic_exact_dominance_gap
    (pr : PluralistRepublic) :
    pr.oneStreamDeficit - pr.mediatedDeficit =
      (pr.representationStreams + pr.communityContext - 1 : ℤ) := by
  have hCapacityPos : 1 ≤ pr.representationStreams + pr.communityContext := by
    exact le_trans (by decide : 1 ≤ 2) (le_trans pr.hPlural (Nat.le_add_right _ _))
  unfold PluralistRepublic.mediatedDeficit PluralistRepublic.oneStreamDeficit
  unfold communityReducedDeficit schedulingDeficit contextReducedDeficit semioticDeficit
  unfold failureToSemiotic PluralistRepublic.toFailureTopology PluralistRepublic.oneStreamTopology
  simp [topologicalDeficit, computationBeta1, transportBeta1]
  rw [Nat.cast_sub hCapacityPos, Nat.cast_add]
  ring

/-- The strict-domination gap is always positive. -/
theorem pluralist_republic_positive_dominance_gap
    (pr : PluralistRepublic) :
    0 < pr.oneStreamDeficit - pr.mediatedDeficit := by
  rw [pluralist_republic_exact_dominance_gap]
  have hCapacityPos : 1 ≤ pr.representationStreams + pr.communityContext := by
    exact le_trans (by decide : 1 ≤ 2) (le_trans pr.hPlural (Nat.le_add_right _ _))
  have hRep : (2 : ℤ) ≤ pr.representationStreams := by
    exact_mod_cast pr.hPlural
  have hComm : (1 : ℤ) ≤ pr.communityContext := by
    exact_mod_cast (Nat.succ_le_of_lt pr.hCommunity)
  linarith

/-- Under the pluralist-republic assumptions, the strict-domination gap is
    at least two units: one recovered by moving beyond one stream and at
    least one more by positive community context. -/
theorem pluralist_republic_dominance_gap_ge_two
    (pr : PluralistRepublic) :
    (2 : ℤ) ≤ pr.oneStreamDeficit - pr.mediatedDeficit := by
  rw [pluralist_republic_exact_dominance_gap]
  have hCapacityPos : 1 ≤ pr.representationStreams + pr.communityContext := by
    exact le_trans (by decide : 1 ≤ 2) (le_trans pr.hPlural (Nat.le_add_right _ _))
  have hRep : (2 : ℤ) ≤ pr.representationStreams := by
    exact_mod_cast pr.hPlural
  have hComm : (1 : ℤ) ≤ pr.communityContext := by
    exact_mod_cast (Nat.succ_le_of_lt pr.hCommunity)
  linarith

/-- When plural streams plus community context cover the issue surface, the
    governance deficit is eliminated. -/
theorem pluralist_republic_nonpositive_of_capacity_cover
    (pr : PluralistRepublic)
    (hCover : pr.issueDimensions ≤ pr.totalCapacity) :
    pr.mediatedDeficit ≤ 0 := by
  unfold PluralistRepublic.mediatedDeficit
  exact community_sufficient_elimination pr.toFailureTopology pr.communityContext <| by
    simpa [PluralistRepublic.toFailureTopology, PluralistRepublic.totalCapacity] using hCover

/-- Capacity cover also drives the governance Bule to zero exactly. -/
theorem pluralist_republic_zero_bule_of_capacity_cover
    (pr : PluralistRepublic)
    (hCover : pr.issueDimensions ≤ pr.totalCapacity) :
    pr.mediatedBule = 0 := by
  unfold PluralistRepublic.mediatedBule
  exact bule_convergence pr.toFailureTopology pr.communityContext <| by
    simpa [PluralistRepublic.toFailureTopology, PluralistRepublic.totalCapacity] using hCover

/-- Under sufficient civic cover, the pluralist republic attains the global
    minimum of the governance Bule metric: no governance topology can do
    better than zero residual Bule. -/
theorem pluralist_republic_globally_optimal_in_bule_metric_of_capacity_cover
    (pr : PluralistRepublic)
    (hCover : pr.issueDimensions ≤ pr.totalCapacity)
    (ft : FailureTopology)
    (communityContext : ℕ) :
    pr.mediatedBule ≤ buleDeficit ft communityContext := by
  rw [pluralist_republic_zero_bule_of_capacity_cover pr hCover]
  exact bule_deficit_nonneg ft communityContext

/-- A republican court keeps one public verdict stream but still requires a
    nontrivial evidence topology. -/
structure RepublicanCourt where
  evidentiaryThreads : ℕ
  hThreads : 2 ≤ evidentiaryThreads

/-- The court's evidence topology has exactly one verdict stream. -/
def RepublicanCourt.toEvidenceTopology (rc : RepublicanCourt) : EvidenceTopology where
  evidentiaryThreads := rc.evidentiaryThreads
  verdictStreams := 1
  threads_nontrivial := rc.hThreads
  verdict_positive := by decide

/-- Republican adjudication begins at insufficient data. -/
theorem republican_court_presumption_of_innocence (rc : RepublicanCourt) :
    buleyeanVerdict rc.toEvidenceTopology (initialEvidenceState rc.toEvidenceTopology) =
      Verdict.insufficientData :=
  presumption_of_innocence rc.toEvidenceTopology

/-- The republican verdict gate is exact: guilt iff evidence Bule is zero. -/
theorem republican_court_guilty_iff_zero_evidence_bule
    (rc : RepublicanCourt)
    (es : EvidenceState rc.toEvidenceTopology) :
    buleyeanVerdict rc.toEvidenceTopology es = Verdict.guilty ↔
      evidenceBule rc.toEvidenceTopology es = 0 :=
  guilty_iff_zero_deficit rc.toEvidenceTopology es

/-- Full coverage reaches the guilty state constructively. -/
theorem republican_court_full_coverage_yields_guilty
    (rc : RepublicanCourt) :
    buleyeanVerdict rc.toEvidenceTopology
      (coverageAfterRounds rc.toEvidenceTopology rc.evidentiaryThreads (le_refl _)) =
        Verdict.guilty :=
  coverage_eventually_sufficient rc.toEvidenceTopology

/-- The republican court surface packages the insufficiency gate, positive
    evidentiary deficit, full-coverage guilt, and zero residual evidence
    Bule at full coverage. -/
theorem republican_court_master (rc : RepublicanCourt) :
    buleyeanVerdict rc.toEvidenceTopology (initialEvidenceState rc.toEvidenceTopology) =
      Verdict.insufficientData
      ∧ evidentiaryDeficit rc.toEvidenceTopology ≥ 1
      ∧ buleyeanVerdict rc.toEvidenceTopology
          (coverageAfterRounds rc.toEvidenceTopology rc.evidentiaryThreads (le_refl _)) =
            Verdict.guilty
      ∧ evidenceBule rc.toEvidenceTopology
          (coverageAfterRounds rc.toEvidenceTopology rc.evidentiaryThreads (le_refl _)) = 0 := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · exact republican_court_presumption_of_innocence rc
  · exact evidence_deficit_positive rc.toEvidenceTopology rfl
  · exact republican_court_full_coverage_yields_guilty rc
  · unfold evidenceBule coverageAfterRounds
    simp [RepublicanCourt.toEvidenceTopology]

/-- A deliberative assembly is a consensus layer with positive stage count
    and any number of concurrent councils/chunks. -/
structure DeliberativeAssembly where
  deliberationStages : ℕ
  concurrentCouncils : ℕ
  hStages : 0 < deliberationStages

/-- The exact consensus regime for the assembly. -/
def DeliberativeAssembly.regime (da : DeliberativeAssembly) : FoldRegime :=
  classifyRegime da.deliberationStages da.concurrentCouncils

/-- `mergeAll` is exactly the quorum-safe deliberative band. -/
theorem deliberative_assembly_mergeAll_iff_quorumSafe
    (da : DeliberativeAssembly) :
    da.regime = FoldRegime.mergeAll ↔
      quorumSafeFold da.deliberationStages da.concurrentCouncils :=
  classifyRegime_eq_mergeAll_iff_quorumSafe
    da.deliberationStages da.concurrentCouncils da.hStages

/-- `quorumFold` is exactly the majority-safe but not quorum-safe band. -/
theorem deliberative_assembly_quorumFold_iff_majoritySafe_not_quorumSafe
    (da : DeliberativeAssembly) :
    da.regime = FoldRegime.quorumFold ↔
      majoritySafeFold da.deliberationStages da.concurrentCouncils
        ∧ ¬ quorumSafeFold da.deliberationStages da.concurrentCouncils :=
  classifyRegime_eq_quorumFold_iff_majoritySafe_not_quorumSafe
    da.deliberationStages da.concurrentCouncils da.hStages

/-- `syncRequired` is exactly the non-majority-safe band. -/
theorem deliberative_assembly_syncRequired_iff_not_majoritySafe
    (da : DeliberativeAssembly) :
    da.regime = FoldRegime.syncRequired ↔
      ¬ majoritySafeFold da.deliberationStages da.concurrentCouncils :=
  classifyRegime_eq_syncRequired_iff_not_majoritySafe
    da.deliberationStages da.concurrentCouncils da.hStages

/-- The full governance package: plural civic capacity, republican court,
    and regime-switched deliberative assembly. -/
structure CommunityMediatedRepublic where
  polity : PluralistRepublic
  court : RepublicanCourt
  assembly : DeliberativeAssembly

/-- Master theorem for the community-mediated pluralist republic:
    plural civic capacity strictly beats one-stream rule, sufficient civic
    cover drives governance Bule to zero, adjudication begins at
    insufficient data and uses an exact zero-Bule guilt gate, and the
    consensus layer exposes the exact synchrony boundary. -/
theorem community_mediated_republic_theory
    (cmr : CommunityMediatedRepublic)
    (hCover : cmr.polity.issueDimensions ≤ cmr.polity.totalCapacity) :
    cmr.polity.mediatedDeficit < cmr.polity.oneStreamDeficit
      ∧ cmr.polity.mediatedBule = 0
      ∧ buleyeanVerdict cmr.court.toEvidenceTopology
          (initialEvidenceState cmr.court.toEvidenceTopology) = Verdict.insufficientData
      ∧ (∀ es : EvidenceState cmr.court.toEvidenceTopology,
          buleyeanVerdict cmr.court.toEvidenceTopology es = Verdict.guilty ↔
            evidenceBule cmr.court.toEvidenceTopology es = 0)
      ∧ (cmr.assembly.regime = FoldRegime.syncRequired ↔
          ¬ majoritySafeFold cmr.assembly.deliberationStages
              cmr.assembly.concurrentCouncils) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · exact pluralist_republic_strictly_dominates_one_stream_rule cmr.polity
  · exact pluralist_republic_zero_bule_of_capacity_cover cmr.polity hCover
  · exact republican_court_presumption_of_innocence cmr.court
  · intro es
    exact republican_court_guilty_iff_zero_evidence_bule cmr.court es
  · exact deliberative_assembly_syncRequired_iff_not_majoritySafe cmr.assembly

/-- Optimal-form-of-government claim, scoped to the current formalism:
    with sufficient civic cover, the community-mediated pluralist republic
    both strictly dominates bare one-stream rule and attains the global
    minimum of the governance Bule metric, while retaining the republican
    zero-Bule evidence gate and exact regime-switched deliberative closure. -/
theorem optimal_form_of_government_claim
    (cmr : CommunityMediatedRepublic)
    (hCover : cmr.polity.issueDimensions ≤ cmr.polity.totalCapacity) :
    cmr.polity.mediatedDeficit < cmr.polity.oneStreamDeficit
      ∧ (∀ ft : FailureTopology, ∀ communityContext : ℕ,
          cmr.polity.mediatedBule ≤ buleDeficit ft communityContext)
      ∧ (∀ es : EvidenceState cmr.court.toEvidenceTopology,
          buleyeanVerdict cmr.court.toEvidenceTopology es = Verdict.guilty ↔
            evidenceBule cmr.court.toEvidenceTopology es = 0)
      ∧ (cmr.assembly.regime = FoldRegime.syncRequired ↔
          ¬ majoritySafeFold cmr.assembly.deliberationStages
              cmr.assembly.concurrentCouncils) := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · exact pluralist_republic_strictly_dominates_one_stream_rule cmr.polity
  · intro ft communityContext
    exact pluralist_republic_globally_optimal_in_bule_metric_of_capacity_cover
      cmr.polity hCover ft communityContext
  · intro es
    exact republican_court_guilty_iff_zero_evidence_bule cmr.court es
  · exact deliberative_assembly_syncRequired_iff_not_majoritySafe cmr.assembly

end ForkRaceFoldTheorems
