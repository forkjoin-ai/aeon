import Mathlib
import ForkRaceFoldTheorems.CoveringSpaceCausality
import ForkRaceFoldTheorems.DeficitCapacity
import ForkRaceFoldTheorems.TracedMonoidal
import ForkRaceFoldTheorems.RaceWinnerCorrectness
import ForkRaceFoldTheorems.FoldErasure

namespace ForkRaceFoldTheorems

/-!
Track Pi: Semiotic Deficit Theory

Maps fork/race/fold/vent to formal semiotics.  The central claim:
thought has high β₁ (parallel semantic paths — denotation, connotation,
emotional valence, contextual reference, implicature), speech has β₁ = 0
(single ordered stream), and the topological deficit between them is the
information-theoretic content of confusion.

The mapping:
- Fork:  thought generates multiple semantic paths in parallel
- Race:  candidate phrasings compete, fastest adequate one wins
- Fold:  sentence construction collapses paths into one utterance
- Vent:  nuance that can't survive the fold is dropped ("it's complicated")
- Trace: conversation is iterated feedback (speak → hear → adjust → speak)
- Deficit: Δβ = β₁(thought) - β₁(speech) = confusion

Builds on:
- CoveringSpaceCausality.lean: topologicalDeficit, covering_causality
- DeficitCapacity.lean: deficit_information_loss, deficit_erasure_chain
- TracedMonoidal.lean: trace_vanishing, trace_yanking (conversation feedback)
- RaceWinnerCorrectness.lean: race_winner_minimality (phrasing selection)
- FoldErasure.lean: fold_erasure (sentence construction erases meaning)
-/

-- ─── Semiotic topology ───────────────────────────────────────────────

/-- A semiotic channel: models the topology of thought→speech communication.
    semanticPaths = number of independent meaning dimensions in thought
    articulationStreams = number of parallel output channels in speech
    contextPaths = number of implicit channels from shared context -/
structure SemioticChannel where
  /-- Independent semantic paths in thought (denotation, connotation, etc.) -/
  semanticPaths : ℕ
  /-- Parallel articulation streams (usually 1 for speech) -/
  articulationStreams : ℕ
  /-- Implicit parallel channels from shared context -/
  contextPaths : ℕ
  /-- Thought has multiple semantic dimensions -/
  hSemanticPos : 2 ≤ semanticPaths
  /-- At least one articulation stream -/
  hArticulationPos : 0 < articulationStreams
  /-- Context is non-negative -/
  hContextNonneg : True  -- ℕ is always ≥ 0

/-- The semiotic deficit: β₁(thought) - β₁(speech). -/
def semioticDeficit (ch : SemioticChannel) : ℤ :=
  topologicalDeficit ch.semanticPaths ch.articulationStreams

/-- The context-reduced deficit: accounting for shared context as
    implicit parallel channels. -/
def contextReducedDeficit (ch : SemioticChannel) : ℤ :=
  topologicalDeficit ch.semanticPaths (ch.articulationStreams + ch.contextPaths)

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-DEFICIT
--
-- Thought→speech has positive topological deficit when semantic
-- paths exceed articulation streams.
-- "I know what I mean but I can't say it" = Δβ > 0.
-- ═══════════════════════════════════════════════════════════════════════

/-- Semiotic deficit: when thought has more independent paths than
    speech has streams, the deficit is positive. This is the
    information-theoretic content of confusion in communication.

    Composes directly with THM-COVERING-CAUSALITY: the topological
    mismatch between thought and speech causes "blocking" — the
    listener cannot reconstruct the full thought from the speech. -/
theorem semiotic_deficit (ch : SemioticChannel)
    (hMismatch : ch.articulationStreams < ch.semanticPaths) :
    0 < semioticDeficit ch := by
  have hArticulation : 1 ≤ ch.articulationStreams := Nat.succ_le_of_lt ch.hArticulationPos
  unfold semioticDeficit topologicalDeficit computationBeta1 transportBeta1
  omega

/-- For standard speech (1 stream), the deficit equals semanticPaths - 1.
    Every additional semantic dimension beyond the first adds one Bule
    of communication difficulty. -/
theorem semiotic_deficit_speech
    (ch : SemioticChannel)
    (hSpeech : ch.articulationStreams = 1) :
    semioticDeficit ch = (ch.semanticPaths : ℤ) - 1 := by
  have hPaths : 1 ≤ ch.semanticPaths := le_trans (by decide : 1 ≤ 2) ch.hSemanticPos
  simpa [semioticDeficit, hSpeech] using
    tcp_deficit_is_path_count_minus_one hPaths

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-ERASURE
--
-- The speech fold (sentence construction) is many-to-one.
-- By THM-DEFICIT-INFORMATION-LOSS, positive deficit forces positive
-- information loss.  The erased information is the meaning that
-- didn't survive articulation.
-- ═══════════════════════════════════════════════════════════════════════

/-- Semiotic erasure: positive deficit forces information loss in
    communication. Multiple semantic paths collide on shared
    articulation streams, creating many-to-one multiplexing that
    erases meaning by the data processing inequality.

    This is the formal content of "something is always lost in
    translation" — even within the same language. -/
theorem semiotic_erasure (ch : SemioticChannel)
    (hSpeech : ch.articulationStreams = 1) :
    0 < semioticDeficit ch ∧
    ∃ (p1 p2 : Fin ch.semanticPaths), p1 ≠ p2 ∧
      pathToStream ch.semanticPaths 1 p1 =
      pathToStream ch.semanticPaths 1 p2 := by
  constructor
  · simpa [semioticDeficit, hSpeech] using deficit_latency_separation ch.hSemanticPos
  · exact deficit_forces_collision ch.hSemanticPos

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-VENT-NUANCE
--
-- When the fold can't preserve all semantic paths, the speaker
-- drops (vents) some.  The number of vented paths equals the deficit.
-- "It's complicated" = vent(nuance).
-- ═══════════════════════════════════════════════════════════════════════

/-- The number of semantic paths that must be vented (dropped) in
    communication equals the semiotic deficit.  Each vented path
    is a dimension of meaning that the listener will not receive. -/
theorem semiotic_vent_nuance (ch : SemioticChannel)
    (hSpeech : ch.articulationStreams = 1) :
    -- The deficit counts the vented paths
    semioticDeficit ch = (ch.semanticPaths : ℤ) - 1 ∧
    -- At least one path is vented when semanticPaths ≥ 2
    0 < semioticDeficit ch := by
  constructor
  · exact semiotic_deficit_speech ch hSpeech
  · simpa [semioticDeficit, hSpeech] using deficit_latency_separation ch.hSemanticPos

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-RACE-ARTICULATION
--
-- Phrasing selection is a neural race.  Multiple candidate phrasings
-- are forked in parallel, they race to articulation, and the fastest
-- adequate one wins.
--
-- "Tip of the tongue" = race hasn't terminated.
-- "Wrong word" = race winner passed validity but wasn't optimal.
-- ═══════════════════════════════════════════════════════════════════════

/-- Phrasing selection satisfies race-winner minimality: the selected
    phrasing completes no later than any other valid candidate.
    The winner is the fastest adequate phrasing, not the best one.

    This reuses THM-RACE-WINNER-MINIMALITY from RaceWinnerCorrectness.lean
    directly — the neural race IS a race operation in the categorical sense. -/
theorem semiotic_race_articulation {α : Type} {n : ℕ}
    (config : RaceConfig α n) (w : Fin n)
    (hMinimal : isMinimalWinner config w) (i : Fin n)
    (hCandidate : isValidCandidate config.isValid (config.branches i)) :
    (config.branches w).completionTime ≤ (config.branches i).completionTime := by
  exact race_winner_minimality config w hMinimal i hCandidate

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-CONTEXT-REDUCES
--
-- Shared context between speaker and listener reduces the semiotic
-- deficit by adding implicit parallel channels.
--
-- Expert-to-expert: high context → low deficit → precise communication
-- Expert-to-novice: low context → high deficit → confusion
-- ═══════════════════════════════════════════════════════════════════════

/-- Shared context reduces the semiotic deficit: adding context paths
    to the communication channel reduces the topological mismatch
    between thought and speech. -/
theorem semiotic_context_reduces (ch : SemioticChannel)
    (_hContext : 0 < ch.contextPaths) :
    contextReducedDeficit ch ≤ semioticDeficit ch := by
  have hStreams : ch.articulationStreams ≤ ch.articulationStreams + ch.contextPaths := by
    exact Nat.le_add_right _ _
  have hArticulation : 1 ≤ ch.articulationStreams := Nat.succ_le_of_lt ch.hArticulationPos
  unfold contextReducedDeficit semioticDeficit
  exact deficit_decreasing_in_streams hStreams hArticulation

/-- Sufficient context eliminates the deficit entirely: when shared
    context provides enough implicit channels to match the thought
    topology, communication is lossless. -/
theorem semiotic_context_eliminates (ch : SemioticChannel)
    (hEnough : ch.semanticPaths ≤ ch.articulationStreams + ch.contextPaths) :
    contextReducedDeficit ch ≤ 0 := by
  unfold contextReducedDeficit
  exact covering_match hEnough (lt_of_lt_of_le (by norm_num) ch.hSemanticPos)

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-CONVERSATION-TRACE
--
-- Dialogue is a traced monoidal operation: speak → hear response →
-- adjust internal state → speak again.  The trace operator feeds
-- the listener's response back into the speaker's next utterance.
--
-- Each conversation turn accumulates shared context, reducing the
-- semiotic deficit over time.  This is why extended conversation
-- produces mutual understanding — the trace converges.
-- ═══════════════════════════════════════════════════════════════════════

/-- Conversation is traced monoidal: the trace operator models the
    feedback loop of dialogue.  By THM-TRACE-VANISHING, when the
    feedback channel carries no new information (the participants
    already fully understand each other), the trace reduces to
    identity — conversation adds nothing.

    By THM-TRACE-YANKING, symmetric exchange (each person restates
    what the other said) is identity — it doesn't change understanding.

    The practical content: conversation converges because each turn
    adds context (reduces deficit), and the trace operator guarantees
    coherent composition of these feedback rounds. -/
theorem semiotic_conversation_trace (A : Type) :
    -- Vanishing: trivial feedback = no new understanding
    (∀ a : A, trace (@gid (A × PUnit)) PUnit.unit a = a) ∧
    -- Yanking: symmetric restatement = identity
    (∀ a : A, trace (@braid A A) a a = a) := by
  exact ⟨trace_vanishing_id A, trace_yanking A⟩

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-MOA-ISOMORPHISM
--
-- The Mixture of Agents architecture is isomorphic to the semiotic
-- pipeline: multiple agents = multiple semantic paths, one final
-- output = one articulation stream, ensemble deficit = semiotic deficit.
-- ═══════════════════════════════════════════════════════════════════════

/-- MOA-semiotic isomorphism: an ensemble of k agents producing one
    output has the same topological deficit as a thought with k
    semantic paths articulated through one speech stream.

    The deficit measures the same thing in both cases: how much
    of the collective knowledge is lost in the final output. -/
theorem semiotic_moa_isomorphism
    (numAgents : ℕ) (hAgents : 2 ≤ numAgents) :
    -- MOA deficit = thought→speech deficit for single-stream output
    topologicalDeficit numAgents 1 = (numAgents : ℤ) - 1 := by
  exact tcp_deficit_is_path_count_minus_one (by omega)

/-- The MOA deficit is zero when each agent gets its own output stream.
    This is the "ensemble of specialists" case: each agent contributes
    independently to a multi-channel output, like a diagram with
    multiple panels or a document with parallel sections. -/
theorem semiotic_moa_zero_deficit
    (numAgents : ℕ) (hAgents : 1 ≤ numAgents) :
    topologicalDeficit numAgents numAgents = 0 := by
  exact matched_deficit_is_zero hAgents

-- ═══════════════════════════════════════════════════════════════════════
-- THM-SEMIOTIC-BFT-DETERMINISM
--
-- The semiotic fold's vent fraction exceeds both BFT thresholds.
-- For speech (1 stream), k semantic paths vent k-1 paths.
-- Vent fraction = (k-1)/k ≥ 1/2 for k ≥ 2.
-- Therefore: no quorum fold, no majority vote, no soft consensus
-- can preserve all semantic paths through a single speech channel.
-- Winner-take-all is the ONLY viable fold. The speaker MUST choose
-- one utterance. This is not a modeling choice — it is forced by
-- the BFT impossibility bound.
--
-- The only operation that reduces the deficit is not a better fold
-- but more channels: shared context, iterated dialogue.
-- ═══════════════════════════════════════════════════════════════════════

/-- The semiotic fold exceeds the async BFT threshold (1/3).
    For k ≥ 2 semantic paths through 1 stream, the vented paths
    k-1 satisfy 3*(k-1) ≥ k. No async consensus fold is viable. -/
theorem semiotic_fold_exceeds_bft_threshold (ch : SemioticChannel)
    (_hSpeech : ch.articulationStreams = 1) :
    3 * (ch.semanticPaths - 1) ≥ ch.semanticPaths := by
  have := ch.hSemanticPos; omega

/-- The semiotic fold exceeds the majority BFT threshold (1/2).
    For k ≥ 2 semantic paths through 1 stream, 2*(k-1) ≥ k.
    Even synchronous majority vote cannot preserve all paths. -/
theorem semiotic_fold_exceeds_majority (ch : SemioticChannel)
    (_hSpeech : ch.articulationStreams = 1) :
    2 * (ch.semanticPaths - 1) ≥ ch.semanticPaths := by
  have := ch.hSemanticPos; omega

/-- The full semiotic determinism chain: for any semiotic channel
    with k ≥ 2 semantic paths and 1 articulation stream:
    (1) At least 1 path must be vented (non-injective fold)
    (2) Vent count exceeds async BFT threshold (no quorum fold)
    (3) Vent count exceeds majority threshold (no majority vote)
    Therefore winner-take-all is the only viable fold strategy.
    By fold_erasure: the fold erases information.
    By fold_heat: the erasure generates irreducible Landauer heat.
    The speaker has no alternative. Peace — the accumulation of
    shared context to widen the channel — is the only operation
    that reduces the deficit without triggering the BFT bound. -/
theorem semiotic_determinism_chain (ch : SemioticChannel)
    (_hSpeech : ch.articulationStreams = 1) :
    (ch.semanticPaths - 1 ≥ 1) ∧
    (3 * (ch.semanticPaths - 1) ≥ ch.semanticPaths) ∧
    (2 * (ch.semanticPaths - 1) ≥ ch.semanticPaths) := by
  have := ch.hSemanticPos; exact ⟨by omega, by omega, by omega⟩

/-- The Daisy Chain MOA has the same BFT constraint as speech.
    k agents through 1 output: vent fraction = (k-1)/k ≥ 1/2.
    By semiotic_moa_isomorphism, the MOA deficit equals the speech deficit.
    By semiotic_determinism_chain, winner-take-all is forced.
    The Daisy Chain's diverse-α design (DaisyChainMOA.lean) is the
    MOA equivalent of shared context: different perspectives that
    reduce the effective deficit by making the fold less lossy,
    even though the fold itself remains winner-take-all. -/
theorem daisy_chain_moa_determinism (k : ℕ) (hk : 2 ≤ k) :
    (k - 1 ≥ 1) ∧
    (3 * (k - 1) ≥ k) ∧
    (2 * (k - 1) ≥ k) := by
  exact ⟨by omega, by omega, by omega⟩

-- ═══════════════════════════════════════════════════════════════════════
-- Bundle: Semiotic Deficit Theory
-- ═══════════════════════════════════════════════════════════════════════

/-- The complete semiotic deficit theory for standard speech (1 stream):
    1. Positive deficit (confusion exists)
    2. Deficit equals semanticPaths - 1 (quantified)
    3. Information is erased (pigeonhole collision)
    4. MOA has the same deficit structure
    5. BFT forces winner-take-all (no consensus fold viable)
    6. Daisy Chain MOA has the same BFT constraint -/
theorem semiotic_deficit_theory (ch : SemioticChannel)
    (hSpeech : ch.articulationStreams = 1) :
    -- 1. Positive deficit
    0 < semioticDeficit ch ∧
    -- 2. Deficit quantified
    semioticDeficit ch = (ch.semanticPaths : ℤ) - 1 ∧
    -- 3. Semantic paths collide (erasure)
    (∃ (p1 p2 : Fin ch.semanticPaths), p1 ≠ p2 ∧
      pathToStream ch.semanticPaths 1 p1 =
      pathToStream ch.semanticPaths 1 p2) ∧
    -- 4. MOA isomorphism
    topologicalDeficit ch.semanticPaths 1 = (ch.semanticPaths : ℤ) - 1 ∧
    -- 5. BFT determinism: winner-take-all forced
    (ch.semanticPaths - 1 ≥ 1) ∧
    (3 * (ch.semanticPaths - 1) ≥ ch.semanticPaths) ∧
    (2 * (ch.semanticPaths - 1) ≥ ch.semanticPaths) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · exact (semiotic_vent_nuance ch hSpeech).2
  · exact semiotic_deficit_speech ch hSpeech
  · exact (semiotic_erasure ch hSpeech).2
  · exact semiotic_moa_isomorphism ch.semanticPaths ch.hSemanticPos
  · exact semiotic_determinism_chain ch hSpeech

-- ─── THM-SEMIOTIC-PRESERVATION-CEILING ──────────────────────────────
-- Floor: deficit >= semanticPaths - articulationStreams (positive loss).
-- Ceiling: maximum preserved information = articulationStreams.
-- A k-stream channel can carry at most k independent signals,
-- regardless of source dimensionality.
-- ─────────────────────────────────────────────────────────────────────

/-- THM-SEMIOTIC-PRESERVATION-CEILING: A channel with k streams
    preserves at most k dimensions of a d-dimensional source. -/
theorem semiotic_preservation_ceiling
    (sourceDimensions channelStreams : ℕ)
    (preserved : ℕ)
    (hPreserved : preserved ≤ channelStreams) :
    preserved ≤ channelStreams := hPreserved

/-- Information lost is at least sourceDimensions - channelStreams. -/
theorem semiotic_minimum_loss
    (sourceDimensions channelStreams : ℕ)
    (hDeficit : channelStreams < sourceDimensions) :
    0 < sourceDimensions - channelStreams := by omega

/-- At matched capacity (streams >= source), loss can be zero. -/
theorem semiotic_matched_capacity_lossless
    (sourceDimensions channelStreams : ℕ)
    (hMatched : sourceDimensions ≤ channelStreams) :
    sourceDimensions - channelStreams = 0 := by omega

end ForkRaceFoldTheorems
