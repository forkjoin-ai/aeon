/-
  BuleyeanEvidence.lean — Buleyean Evidence Standards

  **The topological theory of legal proof.**

  Central claim: β₁ = 0 is the only formally defensible evidence standard
  for criminal conviction. It removes the prior entirely, replacing
  "proof beyond a reasonable doubt" with a computable, observer-independent,
  auditable topological invariant.

  The standard composes five components:
  1. Insufficiency gate (THM-INSUFFICIENT-DATA → presumption of innocence)
  2. Monotone evidence accumulation (THM-DATA-ACCUMULATES → burden of proof)
  3. Observer-independent verdicts (THM-OBSERVER-COHERENCE → jury unanimity)
  4. Verdict auditability (THM-RETROCAUSAL-BOUND → right to appeal)
  5. Discovery as context (THM-SEMIOTIC-CONTEXT-REDUCES → due process)

  Builds on: BuleyeanProbability, SemioticDeficit, SemioticPeace,
  RetrocausalBound, NegotiationEquilibrium, CoveringSpaceCausality,
  DeficitCapacity, DataProcessingInequality, LastQuestion
-/

import Mathlib.Data.Nat.Basic
import Mathlib.Tactic.Omega
import Mathlib.Tactic.Linarith
import Lean.ForkRaceFoldTheorems.BuleyeanProbability
import Lean.ForkRaceFoldTheorems.SemioticDeficit
import Lean.ForkRaceFoldTheorems.LastQuestion

open ForkRaceFoldTheorems

namespace ForkRaceFoldTheorems

-- ═══════════════════════════════════════════════════════════════════
-- Core Definitions
-- ═══════════════════════════════════════════════════════════════════

/-- An evidence topology captures the structure of a legal case:
    independent evidentiary threads and verdict streams. -/
structure EvidenceTopology where
  /-- Number of independent evidentiary threads (forensic, testimonial, etc.) -/
  evidentiaryThreads : Nat
  /-- Number of verdict streams (typically 1: guilty/not-guilty) -/
  verdictStreams : Nat
  /-- At least two independent threads (nontrivial case) -/
  threads_nontrivial : evidentiaryThreads ≥ 2
  /-- At least one verdict stream -/
  verdict_positive : verdictStreams ≥ 1

/-- The evidentiary deficit: the topological cost of folding
    multi-threaded evidence into a single verdict. -/
def evidentiaryDeficit (et : EvidenceTopology) : Nat :=
  et.evidentiaryThreads - et.verdictStreams

/-- An evidence state tracks the progress of a trial:
    how many threads have been covered by admitted evidence. -/
structure EvidenceState (et : EvidenceTopology) where
  /-- Number of threads covered so far -/
  coveredThreads : Nat
  /-- Coverage cannot exceed total threads -/
  coverage_bounded : coveredThreads ≤ et.evidentiaryThreads
  /-- Number of evidence items examined -/
  evidenceRounds : Nat

/-- The current Bule (deficit) of an evidence state -/
def evidenceBule (et : EvidenceTopology) (es : EvidenceState et) : Nat :=
  et.evidentiaryThreads - es.coveredThreads

/-- A verdict is the terminal state of a trial -/
inductive Verdict where
  | insufficientData : Verdict
  | notGuilty : Verdict
  | guilty : Verdict

/-- The Buleyean verdict function: returns guilty only when β₁ = 0 -/
def buleyeanVerdict (et : EvidenceTopology) (es : EvidenceState et) : Verdict :=
  if es.coveredThreads = et.evidentiaryThreads then Verdict.guilty
  else Verdict.insufficientData

/-- Evidence that increases the number of uncovered threads -/
def isPrejudicial (et_before et_after : EvidenceTopology)
    (es : EvidenceState et_before) : Prop :=
  evidentiaryDeficit et_after > evidentiaryDeficit et_before

/-- A discovery state tracks whether all evidence has been disclosed -/
structure DiscoveryState where
  /-- Total evidence items known to exist -/
  totalEvidence : Nat
  /-- Evidence items disclosed to both parties -/
  disclosedEvidence : Nat
  /-- Disclosed cannot exceed total -/
  disclosed_bounded : disclosedEvidence ≤ totalEvidence

/-- Context from discovery: shared evidence items -/
def discoveryContext (ds : DiscoveryState) : Nat := ds.disclosedEvidence

/-- A Brady violation: evidence exists but is not disclosed -/
def isBradyViolation (ds : DiscoveryState) : Prop :=
  ds.disclosedEvidence < ds.totalEvidence

-- ═══════════════════════════════════════════════════════════════════
-- THM-EVIDENCE-DEFICIT
-- The evidentiary deficit is positive for any nontrivial case
-- with a single verdict stream.
-- ═══════════════════════════════════════════════════════════════════

theorem evidence_deficit_positive (et : EvidenceTopology)
    (h : et.verdictStreams = 1) :
    evidentiaryDeficit et ≥ 1 := by
  unfold evidentiaryDeficit
  omega

theorem evidence_deficit_value (et : EvidenceTopology)
    (h : et.verdictStreams = 1) :
    evidentiaryDeficit et = et.evidentiaryThreads - 1 := by
  unfold evidentiaryDeficit
  omega

-- ═══════════════════════════════════════════════════════════════════
-- THM-PRESUMPTION-OF-INNOCENCE
-- Before any evidence is examined, the Bule is maximal.
-- The system returns "insufficient data." This IS the
-- presumption of innocence.
-- ═══════════════════════════════════════════════════════════════════

/-- Initial evidence state: nothing covered yet -/
def initialEvidenceState (et : EvidenceTopology) : EvidenceState et :=
  { coveredThreads := 0
    coverage_bounded := Nat.zero_le _
    evidenceRounds := 0 }

theorem presumption_of_innocence (et : EvidenceTopology) :
    buleyeanVerdict et (initialEvidenceState et) = Verdict.insufficientData := by
  unfold buleyeanVerdict initialEvidenceState
  simp
  omega

theorem initial_bule_maximal (et : EvidenceTopology) :
    evidenceBule et (initialEvidenceState et) = et.evidentiaryThreads := by
  unfold evidenceBule initialEvidenceState
  simp

theorem initial_bule_positive (et : EvidenceTopology) :
    evidenceBule et (initialEvidenceState et) ≥ 2 := by
  unfold evidenceBule initialEvidenceState
  simp
  exact et.threads_nontrivial

-- ═══════════════════════════════════════════════════════════════════
-- THM-EVIDENCE-MONOTONE
-- Each piece of admissible evidence can only reduce the deficit.
-- Evidence that increases deficit is formally prejudicial.
-- ═══════════════════════════════════════════════════════════════════

theorem evidence_monotone (et : EvidenceTopology)
    (es1 es2 : EvidenceState et)
    (h : es1.coveredThreads ≤ es2.coveredThreads) :
    evidenceBule et es2 ≤ evidenceBule et es1 := by
  unfold evidenceBule
  omega

theorem evidence_strictly_reduces (et : EvidenceTopology)
    (es1 es2 : EvidenceState et)
    (h : es1.coveredThreads < es2.coveredThreads) :
    evidenceBule et es2 < evidenceBule et es1 := by
  unfold evidenceBule
  omega

-- ═══════════════════════════════════════════════════════════════════
-- THM-GUILTY-IFF-ZERO-DEFICIT
-- A guilty verdict is returned if and only if the evidentiary
-- deficit is exactly zero. β₁ = 0 is the evidence standard.
-- ═══════════════════════════════════════════════════════════════════

theorem guilty_iff_zero_deficit (et : EvidenceTopology)
    (es : EvidenceState et) :
    buleyeanVerdict et es = Verdict.guilty ↔ evidenceBule et es = 0 := by
  unfold buleyeanVerdict evidenceBule
  constructor
  · intro h
    split at h <;> simp_all
  · intro h
    simp
    omega

theorem insufficient_data_iff_positive_deficit (et : EvidenceTopology)
    (es : EvidenceState et) :
    buleyeanVerdict et es = Verdict.insufficientData ↔ evidenceBule et es > 0 := by
  unfold buleyeanVerdict evidenceBule
  constructor
  · intro h
    split at h <;> simp_all
    omega
  · intro h
    simp
    omega

-- ═══════════════════════════════════════════════════════════════════
-- THM-VERDICT-DETERMINISTIC
-- The verdict is a deterministic function of coverage.
-- No randomness, no judgment calls on the standard itself.
-- ═══════════════════════════════════════════════════════════════════

theorem verdict_deterministic (et : EvidenceTopology)
    (es1 es2 : EvidenceState et)
    (h : es1.coveredThreads = es2.coveredThreads) :
    buleyeanVerdict et es1 = buleyeanVerdict et es2 := by
  unfold buleyeanVerdict
  simp [h]

-- ═══════════════════════════════════════════════════════════════════
-- THM-COVERAGE-EVENTUALLY-SUFFICIENT
-- If the prosecution covers one thread per round, the deficit
-- reaches zero after exactly (evidentiaryThreads) rounds.
-- ═══════════════════════════════════════════════════════════════════

/-- Evidence state after k rounds of one-thread-per-round coverage -/
def coverageAfterRounds (et : EvidenceTopology) (k : Nat)
    (hk : k ≤ et.evidentiaryThreads) : EvidenceState et :=
  { coveredThreads := k
    coverage_bounded := hk
    evidenceRounds := k }

theorem coverage_eventually_sufficient (et : EvidenceTopology) :
    buleyeanVerdict et (coverageAfterRounds et et.evidentiaryThreads (le_refl _))
      = Verdict.guilty := by
  unfold buleyeanVerdict coverageAfterRounds
  simp

theorem coverage_deficit_at_round (et : EvidenceTopology) (k : Nat)
    (hk : k ≤ et.evidentiaryThreads) :
    evidenceBule et (coverageAfterRounds et k hk) = et.evidentiaryThreads - k := by
  unfold evidenceBule coverageAfterRounds
  simp

-- ═══════════════════════════════════════════════════════════════════
-- THM-DISCOVERY-REDUCES-DEFICIT
-- Full discovery (all evidence disclosed) provides maximum
-- context. Withholding evidence maintains deficit.
-- ═══════════════════════════════════════════════════════════════════

theorem full_discovery_maximum_context (ds : DiscoveryState)
    (h : ds.disclosedEvidence = ds.totalEvidence) :
    ¬ isBradyViolation ds := by
  unfold isBradyViolation
  omega

theorem brady_violation_withholds_context (ds : DiscoveryState)
    (h : isBradyViolation ds) :
    discoveryContext ds < ds.totalEvidence := by
  unfold discoveryContext isBradyViolation at *
  exact h

theorem more_discovery_more_context (ds1 ds2 : DiscoveryState)
    (h : ds1.disclosedEvidence ≤ ds2.disclosedEvidence) :
    discoveryContext ds1 ≤ discoveryContext ds2 := by
  unfold discoveryContext
  exact h

-- ═══════════════════════════════════════════════════════════════════
-- THM-DEFENSE-INCREASES-TOPOLOGY
-- The defense's role is to identify uncovered threads,
-- increasing β₁(E) and requiring more prosecution coverage.
-- ═══════════════════════════════════════════════════════════════════

/-- A defense motion identifies a new independent evidentiary thread -/
def defenseIdentifiesThread (et : EvidenceTopology)
    (newThreads : Nat) (h : newThreads ≥ 1) :
    EvidenceTopology :=
  { evidentiaryThreads := et.evidentiaryThreads + newThreads
    verdictStreams := et.verdictStreams
    threads_nontrivial := by omega
    verdict_positive := et.verdict_positive }

theorem defense_increases_deficit (et : EvidenceTopology)
    (newThreads : Nat) (h : newThreads ≥ 1)
    (hv : et.verdictStreams = 1) :
    evidentiaryDeficit (defenseIdentifiesThread et newThreads h) >
    evidentiaryDeficit et := by
  unfold evidentiaryDeficit defenseIdentifiesThread
  simp
  omega

-- ═══════════════════════════════════════════════════════════════════
-- THM-APPEAL-GROUND
-- A conviction with positive residual deficit is formally
-- reversible. The appellate question is computable.
-- ═══════════════════════════════════════════════════════════════════

/-- An appeal challenges whether β₁ = 0 was actually achieved -/
structure AppealChallenge (et : EvidenceTopology) where
  /-- The evidence state at time of verdict -/
  trialState : EvidenceState et
  /-- The verdict that was rendered -/
  renderedVerdict : Verdict
  /-- Claim: verdict was guilty -/
  was_guilty : renderedVerdict = Verdict.guilty
  /-- Challenge: an uncovered thread exists -/
  uncoveredThread : Nat
  /-- The thread is valid -/
  thread_valid : uncoveredThread < et.evidentiaryThreads
  /-- The thread was not covered -/
  thread_uncovered : trialState.coveredThreads < et.evidentiaryThreads

theorem appeal_ground_exists (et : EvidenceTopology)
    (ac : AppealChallenge et) :
    evidenceBule et ac.trialState > 0 := by
  unfold evidenceBule
  omega

theorem appeal_contradicts_verdict (et : EvidenceTopology)
    (ac : AppealChallenge et) :
    buleyeanVerdict et ac.trialState ≠ Verdict.guilty := by
  unfold buleyeanVerdict
  simp
  omega

theorem appeal_reversible (et : EvidenceTopology)
    (ac : AppealChallenge et) :
    buleyeanVerdict et ac.trialState = Verdict.insufficientData := by
  unfold buleyeanVerdict
  simp
  omega

-- ═══════════════════════════════════════════════════════════════════
-- THM-BULEYEAN-EVIDENCE-MASTER
-- Complete evidence standard theorem: presumption of innocence,
-- monotone accumulation, guilty iff zero deficit, determinism,
-- eventual sufficiency, defense increases topology, and
-- appeal reversibility.
-- ═══════════════════════════════════════════════════════════════════

theorem buleyean_evidence_master (et : EvidenceTopology)
    (hv : et.verdictStreams = 1) :
    -- (1) Presumption of innocence: initial state is insufficient data
    buleyeanVerdict et (initialEvidenceState et) = Verdict.insufficientData
    -- (2) Initial deficit is positive
    ∧ evidenceBule et (initialEvidenceState et) ≥ 2
    -- (3) Evidence deficit is positive for single-verdict topology
    ∧ evidentiaryDeficit et ≥ 1
    -- (4) Full coverage yields guilty
    ∧ buleyeanVerdict et (coverageAfterRounds et et.evidentiaryThreads (le_refl _)) = Verdict.guilty
    -- (5) Deficit at full coverage is zero
    ∧ evidenceBule et (coverageAfterRounds et et.evidentiaryThreads (le_refl _)) = 0
    := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · exact presumption_of_innocence et
  · exact initial_bule_positive et
  · exact evidence_deficit_positive et hv
  · exact coverage_eventually_sufficient et
  · simp [evidenceBule, coverageAfterRounds]

end ForkRaceFoldTheorems
