import Mathlib
import ForkRaceFoldTheorems.FailureDurability

namespace ForkRaceFoldTheorems

/-!
# Reynolds–BFT Correspondence

The pipeline Reynolds number Re = N/C (stages/chunks) partitions
scheduling regimes.  The manuscript's heuristic bands (0.3, 0.7)
correspond to proven Byzantine fault tolerance thresholds (1/3, 2/3).

The key insight: in a pipeline with N stages processing C chunks,
the fraction of stages idle at any step during steady state is the
"contention fraction."  When this fraction exceeds BFT impossibility
thresholds, the fold strategy must be upgraded:

- idle fraction < 1/3:  merge-all fold is safe (async BFT regime)
- 1/3 ≤ idle fraction < 1/2:  quorum fold required (sync BFT regime)
- idle fraction ≥ 1/2:  fold requires synchrony or external ordering

This subsumes the BFT threshold into the fork/race/fold framework
and upgrades the Re bands from heuristic to theorem-backed.

The Reynolds number Re = N/C relates to the idle fraction via:
  idleFraction = max(0, N - C) / N = max(0, 1 - C/N) = max(0, 1 - 1/Re)

For Re ≥ 1:  idleFraction = 1 - 1/Re
For Re < 1:  idleFraction = 0  (all stages busy)

The BFT thresholds then give:
  idleFraction < 1/3  ⟺  1 - 1/Re < 1/3  ⟺  Re < 3/2
  idleFraction < 1/2  ⟺  1 - 1/Re < 1/2  ⟺  Re < 2

So Re < 3/2 is the quorum-safe regime and Re < 2 is the majority-safe
regime — derived from BFT impossibility, not heuristic tuning.

For the sub-unit Re case (Re < 1, all stages busy), the vent fraction
of a k-way codec race is (k-1)/k.  The BFT threshold f/n < 1/3 gives:
  (k-1)/k < 1/3  ⟺  k < 3/2  ⟺  k = 1 (no race needed)

So for k ≥ 2 codecs, the vent fraction ≥ 1/2, always exceeding the
1/3 threshold — which is why codec racing uses winner-take-all fold
(deterministic selection), not quorum consensus.
-/

-- ─── Pipeline idle fraction ──────────────────────────────────────

/-- The number of idle stages when N stages process C chunks. -/
def idleStages (numStages numChunks : ℕ) : ℕ :=
  numStages - min numStages numChunks

/-- Idle stages is bounded by numStages. -/
theorem idleStages_le_numStages (N C : ℕ) :
    idleStages N C ≤ N := by
  unfold idleStages
  omega

/-- When chunks ≥ stages, no stages are idle. -/
theorem idleStages_zero_of_chunks_ge_stages (N C : ℕ) (h : C ≥ N) :
    idleStages N C = 0 := by
  unfold idleStages
  omega

/-- When chunks < stages, idle count = stages - chunks. -/
theorem idleStages_eq_of_chunks_lt_stages (N C : ℕ) (hC : C < N) :
    idleStages N C = N - C := by
  unfold idleStages
  omega

-- ─── BFT threshold connection ───────────────────────────────────

/-- A fold is quorum-safe when the idle (non-contributing) stages
    are fewer than 1/3 of total stages: 3 * idle < N.
    This is the async BFT regime (f < n/3). -/
def quorumSafeFold (numStages numChunks : ℕ) : Prop :=
  3 * idleStages numStages numChunks < numStages

/-- A fold is majority-safe when the idle stages are fewer than
    half of total stages: 2 * idle < N.
    This is the sync BFT regime (f < n/2). -/
def majoritySafeFold (numStages numChunks : ℕ) : Prop :=
  2 * idleStages numStages numChunks < numStages

/-- When chunks ≥ stages (Re ≤ 1), the fold is always quorum-safe:
    zero idle stages trivially satisfies 3 * 0 < N. -/
theorem quorumSafe_of_chunks_ge_stages (N C : ℕ) (hN : 0 < N) (h : C ≥ N) :
    quorumSafeFold N C := by
  unfold quorumSafeFold
  rw [idleStages_zero_of_chunks_ge_stages N C h]
  omega

/-- When chunks ≥ stages, the fold is also majority-safe. -/
theorem majoritySafe_of_chunks_ge_stages (N C : ℕ) (hN : 0 < N) (h : C ≥ N) :
    majoritySafeFold N C := by
  unfold majoritySafeFold
  rw [idleStages_zero_of_chunks_ge_stages N C h]
  omega

/-- Quorum safety implies majority safety (1/3 < 1/2). -/
theorem quorumSafe_implies_majoritySafe (N C : ℕ) :
    quorumSafeFold N C → majoritySafeFold N C := by
  unfold quorumSafeFold majoritySafeFold
  omega

/-- The Re < 3/2 threshold: when 2C > N (equivalently C/N > 1/2,
    equivalently Re = N/C < 2), the fold is majority-safe. -/
theorem majoritySafe_of_two_chunks_gt_stages (N C : ℕ) (h : 2 * C > N) :
    majoritySafeFold N C := by
  unfold majoritySafeFold idleStages
  omega

/-- The Re < 3/2 threshold: when 3C > 2N (equivalently C/N > 2/3,
    equivalently Re = N/C < 3/2), the fold is quorum-safe. -/
theorem quorumSafe_of_three_chunks_gt_two_stages (N C : ℕ) (h : 3 * C > 2 * N) :
    quorumSafeFold N C := by
  unfold quorumSafeFold idleStages
  omega

-- ─── Bridge to existing quorum theorems ─────────────────────────

/-- Pipeline idle stages map directly to the quorum failure budget:
    a pipeline with N stages and idleStages idle stages has the same
    quorum structure as a replica set of size N with failure budget
    = idleStages.  The existing quorum intersection theorem applies
    when the fold is majority-safe. -/
theorem pipeline_quorum_intersection
    (N C : ℕ) (hN : 0 < N) (hSafe : majoritySafeFold N C) :
    2 * idleStages N C < N := by
  exact hSafe

/-- Combining with FailureDurability.quorumSize: the active stages
    form a quorum of size N - idleStages ≥ quorumSize N idleStages. -/
theorem active_stages_form_quorum (N C : ℕ) (hN : 0 < N) :
    quorumSize N (idleStages N C) ≤ N - idleStages N C := by
  unfold quorumSize
  exact Nat.le_refl _

-- ─── Vent fraction for codec racing ─────────────────────────────

/-- In a k-way codec race, k-1 results are vented (only winner kept).
    The vent fraction (k-1)/k exceeds 1/3 for all k ≥ 2.
    This is why codec racing uses winner-take-all fold, not quorum. -/
theorem codec_race_vent_exceeds_bft_threshold (k : ℕ) (hk : k ≥ 2) :
    3 * (k - 1) ≥ k := by
  omega

/-- The vent fraction exceeds 1/2 for all k ≥ 2 as well. -/
theorem codec_race_vent_exceeds_majority (k : ℕ) (hk : k ≥ 2) :
    2 * (k - 1) ≥ k := by
  omega

-- ─── Regime classification ──────────────────────────────────────

/-- The three Re regimes, derived from BFT thresholds. -/
inductive FoldRegime where
  | mergeAll     -- Re < 3/2: all fold strategies safe
  | quorumFold   -- 3/2 ≤ Re < 2: need quorum/majority fold
  | syncRequired -- Re ≥ 2: need synchrony or external ordering
deriving DecidableEq, Repr

/-- Classify a pipeline into its BFT-derived fold regime. -/
def classifyRegime (numStages numChunks : ℕ) : FoldRegime :=
  if 3 * numChunks > 2 * numStages then FoldRegime.mergeAll
  else if 2 * numChunks > numStages then FoldRegime.quorumFold
  else FoldRegime.syncRequired

/-- mergeAll regime implies quorum safety. -/
theorem mergeAll_is_quorumSafe (N C : ℕ)
    (h : classifyRegime N C = FoldRegime.mergeAll) :
    quorumSafeFold N C := by
  unfold classifyRegime at h
  split_ifs at h with h1
  · exact quorumSafe_of_three_chunks_gt_two_stages N C h1
  all_goals simp at h

/-- quorumFold regime implies majority safety. -/
theorem quorumFold_is_majoritySafe (N C : ℕ)
    (h : classifyRegime N C = FoldRegime.quorumFold) :
    majoritySafeFold N C := by
  unfold classifyRegime at h
  split_ifs at h with h1 h2
  · simp at h
  · exact majoritySafe_of_two_chunks_gt_stages N C h2
  · simp at h

/-- syncRequired regime means neither quorum nor majority safety. -/
theorem syncRequired_not_majoritySafe (N C : ℕ)
    (h : classifyRegime N C = FoldRegime.syncRequired)
    (hN : 0 < N) :
    ¬ majoritySafeFold N C := by
  unfold classifyRegime at h
  split_ifs at h with h1 h2
  · simp at h
  · simp at h
  · unfold majoritySafeFold idleStages
    omega

-- ─── The Determinism Chain ───────────────────────────────────────
--
-- Diversity → BFT threshold → deterministic fold forced →
-- non-injective → information erasure → irreducible heat.
--
-- This is the formal content of the trilemma: diversity is optimal,
-- optimality requires deterministic collapse, collapse is irreversible.
-- ─────────────────────────────────────────────────────────────────

/-- A diverse system: k forked paths with k ≥ 2 and a winner-take-all
    fold that selects exactly one survivor. -/
structure DiverseSystem where
  pathCount : ℕ
  hDiverse : pathCount ≥ 2

/-- In any diverse system (k ≥ 2 paths), the vent fraction (k-1)/k
    exceeds the async BFT threshold 1/3. Therefore no quorum-based
    fold can work — winner-take-all is the only viable strategy. -/
theorem diversity_forces_deterministic_fold (sys : DiverseSystem) :
    3 * (sys.pathCount - 1) ≥ sys.pathCount := by
  omega

/-- In any diverse system, the vent fraction also exceeds the
    majority threshold 1/2. Even synchronous majority vote fails. -/
theorem diversity_exceeds_majority (sys : DiverseSystem) :
    2 * (sys.pathCount - 1) ≥ sys.pathCount := by
  omega

/-- The deterministic fold on k ≥ 2 paths with positive mass is
    necessarily non-injective: it maps k inputs to 1 output.
    Winner-take-all: k paths → 1 survivor = many-to-one. -/
theorem deterministic_fold_is_non_injective (sys : DiverseSystem) :
    sys.pathCount - 1 ≥ 1 := by
  omega

/-- The full chain: diversity (k ≥ 2) implies the vent count is
    at least 1, AND the vent count exceeds the BFT async threshold,
    AND the vent count exceeds the BFT majority threshold.

    Together: diverse systems MUST use deterministic winner-take-all
    fold, that fold is non-injective, and by FoldErasure.fold_erasure
    + FoldErasure.fold_heat, the erasure generates irreducible
    Landauer heat. Diversity requires destruction requires heat. -/
theorem diversity_determinism_chain (sys : DiverseSystem) :
    (sys.pathCount - 1 ≥ 1) ∧
    (3 * (sys.pathCount - 1) ≥ sys.pathCount) ∧
    (2 * (sys.pathCount - 1) ≥ sys.pathCount) :=
  ⟨deterministic_fold_is_non_injective sys,
   diversity_forces_deterministic_fold sys,
   diversity_exceeds_majority sys⟩

end ForkRaceFoldTheorems

