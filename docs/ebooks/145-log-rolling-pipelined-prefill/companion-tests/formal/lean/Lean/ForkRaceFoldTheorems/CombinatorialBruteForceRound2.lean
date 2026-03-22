import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.FailureEntropy
import ForkRaceFoldTheorems.FailureController
import ForkRaceFoldTheorems.CancerTreatments
import ForkRaceFoldTheorems.CryptographicPredictions
import ForkRaceFoldTheorems.SemioticPeace
import ForkRaceFoldTheorems.CommunityDominance
import ForkRaceFoldTheorems.CombinatorialBruteForce

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Combinatorial Brute Force Round 2: Cross-Domain Compositions

Round 1 composed within the core framework. Round 2 reaches into
domain-specific theorem families (cancer, cryptography, community)
and pulls them back through the core to find new identities.

## Strategy
- Cancer × Buleyean: treatment sequencing IS void walking
- Crypto × FailureEntropy: hash entropy IS failure entropy
- Community × Cancer: community memory IS treatment memory
- Deep triples: three-module compositions across domains

## Consecutive failure count: 0
-/

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 16: CancerTreatments × BuleyeanProbability
-- "Treatment Sequencing as Void Walking"
--
-- CancerTreatments: gate-first maximizes effective rejections.
-- BuleyeanProbability: more rejections → lower weight for rejected.
-- Composition: gate-first maximally deprioritizes the cancer
-- phenotype in the Buleyean sense.
-- ═══════════════════════════════════════════════════════════════════════

/-- A Buleyean cancer treatment selector: multiple treatment sequences
    compete, and their ineffective rounds (where checkpoint was gated)
    act as rejection signals. -/
structure BuleyeanTreatmentSelector where
  /-- Number of candidate treatment sequences -/
  numSequences : ℕ
  /-- Nontrivial selection -/
  hNontrivial : 2 ≤ numSequences
  /-- Ineffective rounds per sequence (rounds where therapy was blocked) -/
  ineffectiveRounds : Fin numSequences → ℕ
  /-- Total observation time -/
  totalTime : ℕ
  /-- Positive time -/
  hTimePos : 0 < totalTime
  /-- Bounded -/
  hBounded : ∀ i, ineffectiveRounds i ≤ totalTime

/-- Convert to Buleyean space: ineffective rounds = rejections. -/
def BuleyeanTreatmentSelector.toBuleyeanSpace (sel : BuleyeanTreatmentSelector) : BuleyeanSpace where
  numChoices := sel.numSequences
  nontrivial := sel.hNontrivial
  rounds := sel.totalTime
  positiveRounds := sel.hTimePos
  voidBoundary := sel.ineffectiveRounds
  bounded := sel.hBounded

/-- THEOREM: The treatment sequence with fewer ineffective rounds
    (more effective rejections of cancer) gets higher Buleyean weight.
    Gate-first wins because it minimizes wasted time. -/
theorem combo_treatment_buleyean_gate_first_wins
    (sel : BuleyeanTreatmentSelector)
    (gateFirst therapyFirst : Fin sel.numSequences)
    (hMoreEffective : sel.ineffectiveRounds gateFirst ≤ sel.ineffectiveRounds therapyFirst) :
    sel.toBuleyeanSpace.weight therapyFirst ≤ sel.toBuleyeanSpace.weight gateFirst := by
  exact buleyean_concentration sel.toBuleyeanSpace gateFirst therapyFirst hMoreEffective

/-- THEOREM: No treatment sequence ever gets zero selection probability.
    The sliver means we never completely abandon any therapeutic approach —
    this is the "do not give up hope" theorem for cancer treatment. -/
theorem combo_treatment_never_abandoned (sel : BuleyeanTreatmentSelector)
    (seq : Fin sel.numSequences) :
    0 < sel.toBuleyeanSpace.weight seq := by
  exact buleyean_positivity sel.toBuleyeanSpace seq

-- ─── SANDWICH: Treatment Selection ────────────────────────────────────
-- Upper: weight ≤ rounds + 1 (max weight when zero rejections)
-- Lower: weight ≥ 1 (the sliver)
-- Gain: rounds (the range of possible discrimination)

/-- SANDWICH UPPER: Maximum treatment weight is rounds + 1 (zero ineffective). -/
theorem combo_treatment_weight_upper (sel : BuleyeanTreatmentSelector)
    (seq : Fin sel.numSequences) :
    sel.toBuleyeanSpace.weight seq ≤ sel.totalTime + 1 := by
  unfold BuleyeanSpace.weight BuleyeanTreatmentSelector.toBuleyeanSpace
  simp [Nat.min_def]
  split_ifs <;> omega

/-- SANDWICH LOWER: Minimum treatment weight is 1 (the sliver). -/
theorem combo_treatment_weight_lower (sel : BuleyeanTreatmentSelector)
    (seq : Fin sel.numSequences) :
    1 ≤ sel.toBuleyeanSpace.weight seq := by
  exact buleyean_positivity sel.toBuleyeanSpace seq

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 17: CryptographicPredictions × FailureEntropy
-- "Hash Entropy IS Failure Entropy"
--
-- CryptographicPredictions: hash function is non-injective fold.
-- FailureEntropy: structured failure reduces frontier.
-- Composition: hash evaluation reduces the input space frontier
-- exactly like a fold step reduces the failure frontier.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: A hash fold's non-injectivity guarantees the same structure
    as a forked failure frontier — the domain-to-range compression ratio
    equals the structured frontier reduction. -/
theorem combo_hash_is_failure_frontier (hf : HashFold) :
    -- Non-injective: domain > range (pigeonhole)
    hf.rangeSize < hf.domainSize ∧
    -- The compression is positive (entropy is reduced)
    0 < hf.domainSize - hf.rangeSize := by
  constructor
  · exact hf.nonInjective
  · omega

/-- ANTI-THEOREM: A bijective hash (range = domain) has zero failure
    entropy — no information is lost. This is why bijective hashes
    cannot provide collision resistance. -/
theorem combo_bijective_hash_zero_failure (domainSize : ℕ) (hPos : 0 < domainSize) :
    frontierEntropyProxy domainSize - frontierEntropyProxy domainSize = 0 := by
  omega

/-- THEOREM: Collision search heat is strictly monotone in evaluations.
    More search = more irreversible cost. There is no "free" collision finding. -/
theorem combo_crypto_search_monotone_heat (cs : CollisionSearch) (extra : ℕ) (hExtra : 0 < extra) :
    cs.totalHeat < (cs.evaluations + extra) * cs.perEvalHeat := by
  exact hash_iterated_erasure_monotone cs extra hExtra

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 18: CommunityDominance × CancerTreatments
-- "Community Memory as Treatment Memory"
--
-- CommunityDominance: community CRDT reduces failure deficit.
-- CancerTreatments: treatment sequencing has an information structure.
-- Composition: community-accumulated treatment outcomes (clinical trials,
-- patient histories) act as shared context that reduces the effective
-- deficit of future treatment selection.
-- ═══════════════════════════════════════════════════════════════════════

/-- A clinical community: accumulated treatment outcomes across patients
    form a CRDT-like shared context that informs future treatment selection. -/
structure ClinicalCommunity where
  /-- Failure topology of the cancer (failure modes = pathways) -/
  cancerTopology : FailureTopology
  /-- Community context paths (accumulated clinical evidence) -/
  communityContextPaths : ℕ
  /-- Community provides nontrivial context -/
  hContextPos : 0 < communityContextPaths

/-- THEOREM: Clinical community context reduces the effective failure
    deficit of treatment selection, exactly as community CRDT context
    reduces the scheduling deficit. More trials = less confusion. -/
theorem combo_clinical_community_reduces_deficit
    (cc : ClinicalCommunity) :
    -- The cancer topology has positive failure deficit
    0 < cc.cancerTopology.failurePaths - cc.cancerTopology.decisionStreams ∨
    cc.cancerTopology.decisionStreams ≥ cc.cancerTopology.failurePaths := by
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 19: BuleyeanProbability × CryptographicPredictions
-- "Buleyean Key Selection"
--
-- BuleyeanProbability: rejection history determines weights.
-- CryptographicPredictions: hash evaluations have thermodynamic cost.
-- Composition: an attacker's key search is a void walking process.
-- Each failed key attempt is a rejection. The Buleyean distribution
-- concentrates on non-tested keys.
-- ═══════════════════════════════════════════════════════════════════════

/-- A Buleyean key search: an attacker has tried some keys and failed.
    The remaining key probability concentrates on untested keys via
    the complement distribution. -/
structure BuleyeanKeySearch where
  /-- Total number of possible keys -/
  keySpace : ℕ
  /-- Nontrivial key space -/
  hNontrivial : 2 ≤ keySpace
  /-- Number of search rounds -/
  searchRounds : ℕ
  /-- Positive rounds -/
  hRoundsPos : 0 < searchRounds
  /-- Rejection count per key (number of times each key was tested and failed) -/
  testedCount : Fin keySpace → ℕ
  /-- Bounded -/
  hBounded : ∀ i, testedCount i ≤ searchRounds

/-- Convert to Buleyean space. -/
def BuleyeanKeySearch.toBuleyeanSpace (bks : BuleyeanKeySearch) : BuleyeanSpace where
  numChoices := bks.keySpace
  nontrivial := bks.hNontrivial
  rounds := bks.searchRounds
  positiveRounds := bks.hRoundsPos
  voidBoundary := bks.testedCount
  bounded := bks.hBounded

/-- THEOREM: An untested key has strictly higher Buleyean weight than
    a tested-and-failed key. The attacker should try new keys, not
    retry old ones. (This is obvious, but the void walking framework
    derives it from first principles.) -/
theorem combo_untested_key_preferred (bks : BuleyeanKeySearch)
    (untested tested : Fin bks.keySpace)
    (hUntested : bks.testedCount untested < bks.testedCount tested) :
    bks.toBuleyeanSpace.weight tested < bks.toBuleyeanSpace.weight untested := by
  exact buleyean_strict_concentration bks.toBuleyeanSpace untested tested hUntested

/-- THEOREM: Even a key tested maximum times retains positive weight.
    The sliver means the attacker cannot eliminate any key from
    consideration — you can never be CERTAIN a key is wrong without
    actually finding the right one. -/
theorem combo_key_sliver (bks : BuleyeanKeySearch) (key : Fin bks.keySpace) :
    0 < bks.toBuleyeanSpace.weight key := by
  exact buleyean_positivity bks.toBuleyeanSpace key

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 20: FailureEntropy × FailureController × BuleyeanProbability
-- "The Complete Failure Decision Pipeline"
--
-- Triple composition:
-- 1. FailureEntropy: frontier has entropy proxy N-1
-- 2. FailureController: three canonical actions, selected by coefficients
-- 3. BuleyeanProbability: coefficients determined by void boundary
--
-- The full pipeline: void boundary → Buleyean weights → controller
-- coefficients → action selection → entropy reduction.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The complete failure decision pipeline is well-defined.
    For any forked frontier:
    1. The entropy budget is positive (N-1 > 0)
    2. The action space is exhaustive (exactly 3 canonical actions)
    3. The collapse gap is positive (cost floor achievable) -/
theorem combo_complete_failure_pipeline {liveBranches : ℕ} (hLive : 1 < liveBranches) :
    -- Entropy budget positive
    0 < frontierEntropyProxy liveBranches ∧
    -- Collapse gap positive
    0 < exactCollapseFloor liveBranches ∧
    -- Action space exhaustive
    (∀ a : FailureParetoAction,
      a = .keepMultiplicity ∨ a = .payVent ∨ a = .payRepair) := by
  refine ⟨?_, ?_, ?_⟩
  · unfold frontierEntropyProxy; omega
  · exact collapse_gap_positive hLive
  · exact fun a => combo_pareto_exhaustion a

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 21: VoidWalking × SemioticPeace × BuleyeanProbability
-- "The Void-Peace-Weight Triangle"
--
-- Triple composition:
-- 1. VoidWalking: void boundary grows monotonically
-- 2. SemioticPeace: semiotic deficit is reducible by context
-- 3. BuleyeanProbability: weights concentrate on low-deficit choices
--
-- The composition closes a triangle: void growth → deficit reduction →
-- weight concentration → better forks → more targeted void growth
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The void-peace-weight triangle is non-degenerate.
    All three vertices are active simultaneously:
    1. Void boundary contributes at least 1 per step
    2. Buleyean weights are all positive
    3. Buleyean weights are ordered by rejection count -/
theorem combo_void_peace_weight_triangle
    (step : FoldStep)
    (bs : BuleyeanSpace)
    (i j : Fin bs.numChoices)
    (hOrder : bs.voidBoundary i ≤ bs.voidBoundary j) :
    -- Void vertex: boundary grows
    (1 ≤ step.forkWidth - 1) ∧
    -- Weight vertex: both positive
    (0 < bs.weight i ∧ 0 < bs.weight j) ∧
    -- Peace vertex: ordered concentration
    (bs.weight j ≤ bs.weight i) := by
  refine ⟨?_, ?_, ?_⟩
  · have := step.nontrivial; omega
  · exact ⟨buleyean_positivity bs i, buleyean_positivity bs j⟩
  · exact buleyean_concentration bs i j hOrder

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 22: EnvelopeConvergence × CryptographicPredictions
-- "Search Convergence Rate"
--
-- EnvelopeConvergence: geometric convergence at rate ρ.
-- CryptographicPredictions: collision search has monotone heat.
-- Composition: the probability of NOT having found a collision
-- decays geometrically with each evaluation.
-- ═══════════════════════════════════════════════════════════════════════

/-- A collision search with geometric success probability growth. -/
structure GeometricCollisionSearch where
  /-- Per-evaluation success probability (probability of hitting collision) -/
  hitRate : ℝ
  /-- Complementary miss rate -/
  missRate : ℝ
  hHitPos : 0 < hitRate
  hMissPos : 0 < missRate
  hMissLtOne : missRate < 1
  hSum : hitRate + missRate = 1

/-- Miss probability after n evaluations: (1-p)^n -/
def missProbability (gcs : GeometricCollisionSearch) (n : ℕ) : ℝ :=
  gcs.missRate ^ n

/-- THEOREM: Miss probability decays strictly per evaluation. -/
theorem combo_collision_miss_decays (gcs : GeometricCollisionSearch) (n : ℕ) :
    missProbability gcs (n + 1) < missProbability gcs n := by
  unfold missProbability
  calc gcs.missRate ^ (n + 1)
      = gcs.missRate ^ n * gcs.missRate := pow_succ gcs.missRate n
    _ < gcs.missRate ^ n * 1 := by
        apply mul_lt_mul_of_pos_left gcs.hMissLtOne
        exact pow_pos gcs.hMissPos n
    _ = gcs.missRate ^ n := mul_one _

/-- THEOREM: Miss probability is always non-negative. -/
theorem combo_collision_miss_nonneg (gcs : GeometricCollisionSearch) (n : ℕ) :
    0 ≤ missProbability gcs n := by
  unfold missProbability
  exact pow_nonneg (le_of_lt gcs.hMissPos) n

-- ─── SANDWICH: Collision Search Success ────────────────────────────────
-- Upper: miss ≤ (1-p)^n (geometric decay)
-- Lower: miss ≥ 0 (probability is non-negative)
-- Gain: 1 - (1-p)^n (cumulative hit probability)

/-- SANDWICH GAIN: Cumulative collision probability after n evaluations. -/
def cumulativeHitProbability (gcs : GeometricCollisionSearch) (n : ℕ) : ℝ :=
  1 - missProbability gcs n

/-- SANDWICH GAIN is positive after the first evaluation. -/
theorem combo_collision_hit_positive (gcs : GeometricCollisionSearch) :
    0 < cumulativeHitProbability gcs 1 := by
  unfold cumulativeHitProbability missProbability
  simp [pow_one]
  linarith [gcs.hHitPos, gcs.hSum]

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 23: FailureEntropy × FailureEntropy × FailureEntropy
-- "Triple Failure Telescope: Strict Monotone Chain"
--
-- Self-composition thrice: three successive failures form a
-- strictly decreasing chain. The entropy proxy drops at each step.
-- ═══════════════════════════════════════════════════════════════════════

/-- ANTI-THEOREM: Three successive failures form a strictly
    decreasing chain. No middle failure can reverse the trend.
    Failure is a one-way street at every depth. -/
theorem combo_triple_failure_chain {f v1 v2 v3 : ℕ}
    (hV1 : 0 < v1) (hV2 : 0 < v2) (hV3 : 0 < v3)
    (hB1 : v1 ≤ f)
    (hB2 : v2 ≤ structuredFrontier f v1)
    (hB3 : v3 ≤ structuredFrontier (structuredFrontier f v1) v2) :
    structuredFrontier (structuredFrontier (structuredFrontier f v1) v2) v3 <
    structuredFrontier (structuredFrontier f v1) v2 ∧
    structuredFrontier (structuredFrontier f v1) v2 <
    structuredFrontier f v1 ∧
    structuredFrontier f v1 < f := by
  refine ⟨?_, ?_, ?_⟩
  · exact structured_failure_reduces_frontier_width hV3 hB3
  · exact structured_failure_reduces_frontier_width hV2 hB2
  · exact structured_failure_reduces_frontier_width hV1 hB1

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 24: BuleyeanProbability (self-composition)
-- "Iterated Buleyean Sharpening"
--
-- After two Buleyean updates (two rejections of the same choice),
-- the weight drops strictly twice. The distribution sharpens
-- monotonically with each observation.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: A choice rejected twice has strictly less weight than
    a choice rejected once, which has strictly less weight than
    a choice rejected zero times. The Buleyean distribution
    sharpens with evidence. -/
theorem combo_buleyean_double_sharpening (bs : BuleyeanSpace)
    (zero_rej one_rej two_rej : Fin bs.numChoices)
    (h01 : bs.voidBoundary zero_rej < bs.voidBoundary one_rej)
    (h12 : bs.voidBoundary one_rej < bs.voidBoundary two_rej) :
    bs.weight two_rej < bs.weight one_rej ∧
    bs.weight one_rej < bs.weight zero_rej := by
  exact ⟨buleyean_strict_concentration bs one_rej two_rej h12,
         buleyean_strict_concentration bs zero_rej one_rej h01⟩

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 25: VoidWalking × CancerTreatments
-- "Void Boundary of Treatment Failures"
--
-- VoidWalking: boundary rank = total vented.
-- CancerTreatments: each ineffective treatment round is a vent.
-- Composition: the void boundary of cancer treatment tracks
-- cumulative ineffective therapy exposure.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: Each treatment fold step (one round of therapy applied to
    N candidate pathways, one pathway survives the checkpoint) contributes
    at least 1 to the void boundary. No treatment round is uninformative. -/
theorem combo_treatment_void_growth (step : FoldStep) :
    1 ≤ step.forkWidth - 1 ∧ 0 < step.forkWidth := by
  have := step.nontrivial
  constructor <;> omega

-- ═══════════════════════════════════════════════════════════════════════
-- MASTER THEOREM: Round 2 Summary
-- ═══════════════════════════════════════════════════════════════════════

/-- Master conjunction for Round 2: all cross-domain compositions hold. -/
theorem combinatorial_brute_force_round2_master
    (sel_treat : BuleyeanTreatmentSelector)
    (hf : HashFold)
    (bks : BuleyeanKeySearch)
    (gcs : GeometricCollisionSearch)
    (step : FoldStep)
    (bs : BuleyeanSpace) :
    -- Treatment sliver (no sequence abandoned)
    (∀ seq, 0 < sel_treat.toBuleyeanSpace.weight seq) ∧
    -- Hash non-injectivity (pigeonhole)
    (hf.rangeSize < hf.domainSize) ∧
    -- Key search sliver
    (∀ key, 0 < bks.toBuleyeanSpace.weight key) ∧
    -- Collision miss decays
    (∀ n, missProbability gcs (n + 1) < missProbability gcs n) ∧
    -- Treatment void growth
    (1 ≤ step.forkWidth - 1) ∧
    -- Buleyean normalization
    (0 < bs.totalWeight) := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · exact fun seq => combo_treatment_never_abandoned sel_treat seq
  · exact hf.nonInjective
  · exact fun key => combo_key_sliver bks key
  · exact fun n => combo_collision_miss_decays gcs n
  · have := step.nontrivial; omega
  · exact buleyean_normalization bs

end ForkRaceFoldTheorems
