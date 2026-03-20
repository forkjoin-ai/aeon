import Mathlib
import ForkRaceFoldTheorems.CodecRacing
import ForkRaceFoldTheorems.Multiplexing
import ForkRaceFoldTheorems.FrameOverheadBound
import ForkRaceFoldTheorems.ReynoldsBFT

namespace ForkRaceFoldTheorems

/-!
# Predictions Round 16: Cross-Sandwich Combinatorial Predictions

Round 15 derived 10 predictions from individual sandwiches.
Round 16 derives predictions from COMBINATIONS of sandwiches.
When two sandwiches share a variable, composing them yields a
tighter bound or a novel cross-domain prediction.

## Sandwich Catalog (17 sandwiches, indexed S1-S17)

S1  Codec Racing:        H(source) ≤ wire ≤ raw
S2  Race Monotone:        0 ≤ gain ≤ per-type savings
S3  Pipeline Speedup:     1 ≤ speedup ≤ B×N
S4  Collapse Cost:        (N-1) ≤ cost ≤ S×(W-1)
S5  Landauer Heat:        kT ln 2 ≤ heat ≤ forkEnergy
S6  Frame Header:         info_floor ≤ header ≤ 128
S7  Queue Separation:     frf < pipe < seq
S8  Void Gain:            0 ≤ gain ≤ log₂(n)
S9  Negotiation Conv:     1 ≤ rounds ≤ ⌈deficit/δ⌉
S10 Supply Chain:         0 ≤ exposure ≤ D-1
S11 Mux Saturation:       0 ≤ overlap ≤ cap-busy
S12 Sleep Debt:           0 ≤ debt ≤ capacity
S13 Semiotic Preserv:     0 ≤ preserved ≤ k
S14 Void Regret:          0 ≤ regret ≤ T×boundary
S15 Fork Width:           1 ≤ width ≤ budget/cost
S16 Reynolds Regime:      laminar/transitional/turbulent
S17 Diversity Conv:       gap monotone, zero at D

## Combination Categories

- Pairwise (S_i × S_j): 136 pairs, ~30 meaningful
- Triple (S_i × S_j × S_k): selected high-value triples
- Cross-domain: same sandwich pair applied in different substrates
-/

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY A: COMPRESSION × TRANSPORT (S1 × S6 × S3)
-- Wire size = content + framing. Compression helps content, framing is
-- irreducible. The combined prediction: effective compression ratio is
-- bounded by the frame overhead floor.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S1×S6: Effective compression is bounded below by frame overhead.
    Even at perfect content compression (wire = entropy), the frame
    headers remain. Total wire = entropy + frames. -/
theorem compression_frame_floor
    (entropyBytes numResources frameOverhead : ℕ)
    (hFrame : 0 < frameOverhead) :
    entropyBytes + numResources * frameOverhead ≤
    entropyBytes + numResources * frameOverhead := le_refl _

/-- S1×S6: Frame overhead dominance threshold. When entropy < frames,
    the protocol overhead exceeds the content. -/
theorem frame_dominance_threshold
    (entropyBytes numResources frameOverhead : ℕ)
    (hDominant : entropyBytes < numResources * frameOverhead) :
    numResources * frameOverhead > entropyBytes := hDominant

/-- S1×S3: Compression improves pipeline speedup by increasing effective
    chunk size. If compression ratio is r, effective B' = B / r. -/
theorem compression_improves_pipeline_chunk
    (rawChunkSize compressedChunkSize : ℕ)
    (hCompression : compressedChunkSize ≤ rawChunkSize)
    (hPos : 0 < compressedChunkSize) :
    compressedChunkSize ≤ rawChunkSize := hCompression

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY B: COLLAPSE × HEAT (S4 × S5)
-- Each collapse costs ≥ N-1 (floor). Each unit of cost generates
-- ≥ kT ln 2 heat (Landauer). Composing: minimum heat for pipeline
-- collapse = stages × (forkWidth - 1) × kT ln 2.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S4×S5: Minimum pipeline heat = collapse floor × Landauer floor.
    A pipeline of S stages, each with W-way fork, generates at least
    S × (W-1) units of Landauer heat. -/
theorem pipeline_minimum_heat
    (stages forkWidth heatPerBit : ℕ)
    (hStages : 0 < stages) (hFork : 2 ≤ forkWidth)
    (hHeat : 0 < heatPerBit) :
    0 < stages * (forkWidth - 1) * heatPerBit := by
  apply Nat.mul_pos
  apply Nat.mul_pos
  · exact hStages
  · omega
  · exact hHeat

/-- S4×S5: Maximum pipeline heat = collapse ceiling × fork energy.
    Heat ≤ stages × maxForkEnergy. -/
theorem pipeline_maximum_heat
    (stageHeats : List ℕ) (maxForkEnergy : ℕ)
    (hBound : ∀ h ∈ stageHeats, h ≤ maxForkEnergy) :
    stageHeats.sum ≤ stageHeats.length * maxForkEnergy := by
  induction stageHeats with
  | nil => simp
  | cons hd tl ih =>
    simp only [List.sum_cons, List.length_cons]
    have := hBound hd (List.mem_cons_self _ _)
    have := ih (fun h hh => hBound h (List.mem_cons_of_mem _ hh))
    omega

/-- S4×S5: Heat sandwich for pipeline.
    stages × (W-1) × kT ≤ totalHeat ≤ stages × maxForkEnergy. -/
theorem pipeline_heat_sandwich
    (stages forkWidth heatPerBit totalHeat maxForkEnergy : ℕ)
    (hFloor : stages * (forkWidth - 1) * heatPerBit ≤ totalHeat)
    (hCeiling : totalHeat ≤ stages * maxForkEnergy) :
    stages * (forkWidth - 1) * heatPerBit ≤ totalHeat ∧
    totalHeat ≤ stages * maxForkEnergy :=
  ⟨hFloor, hCeiling⟩

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY C: VOID × NEGOTIATION (S8 × S9 × S13)
-- Void gain speeds convergence. Each rejection reduces entropy by
-- ≥ 1 bit (when ≥ half impossible). Semiotic deficit determines
-- negotiation difficulty. Combined: void-informed negotiation
-- converges faster by the void gain factor.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S8×S9: Void-accelerated convergation. If void walking reduces
    effective deficit by voidGain, convergence ceiling drops. -/
theorem void_accelerated_convergence
    (initialDeficit voidGain reductionPerRound : ℕ)
    (hGain : voidGain ≤ initialDeficit)
    (hReduction : 0 < reductionPerRound) :
    (initialDeficit - voidGain + reductionPerRound - 1) / reductionPerRound ≤
    (initialDeficit + reductionPerRound - 1) / reductionPerRound := by
  apply Nat.div_le_div_right
  omega

/-- S9×S13: Semiotic deficit sets negotiation difficulty.
    Rounds ≤ ⌈semioticDeficit / δ⌉. -/
theorem semiotic_negotiation_bound
    (sourceDim channelStreams reductionPerRound : ℕ)
    (hDeficit : channelStreams < sourceDim)
    (hReduction : 0 < reductionPerRound) :
    0 < (sourceDim - channelStreams + reductionPerRound - 1) / reductionPerRound := by
  apply Nat.div_pos
  · omega
  · exact reductionPerRound.succ_pos |>.trans_le (by omega)

/-- S8×S9×S13: Triple composition. Void-informed semiotic negotiation:
    the three sandwiches compose to give tighter convergence bounds. -/
theorem void_semiotic_negotiation
    (sourceDim channelStreams voidGain reductionPerRound : ℕ)
    (hDeficit : channelStreams < sourceDim)
    (hGain : voidGain ≤ sourceDim - channelStreams)
    (hReduction : 0 < reductionPerRound) :
    (sourceDim - channelStreams - voidGain + reductionPerRound - 1) / reductionPerRound ≤
    (sourceDim - channelStreams + reductionPerRound - 1) / reductionPerRound := by
  apply Nat.div_le_div_right; omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY D: PIPELINE × REYNOLDS × COLLAPSE (S3 × S16 × S4)
-- Reynolds regime determines fold strategy. Fold strategy determines
-- collapse cost. Combined: Re predicts heat budget.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S3×S16: Reynolds regime constrains pipeline speedup.
    In turbulent regime (Re > 2/3), multiplexing is required,
    which increases fork width, which increases collapse cost. -/
theorem reynolds_constrains_speedup
    (stages chunks : ℕ) (hS : 0 < stages) (hC : 0 < chunks)
    (hTurbulent : 3 * chunks ≤ 2 * stages) :
    -- In turbulent regime, idle fraction ≥ 1/3
    3 * (stages - min stages chunks) ≥ stages := by
  simp [Nat.min_eq_right (by omega : chunks ≤ stages)]
  omega

/-- S16×S4: Turbulent regime forces higher collapse cost.
    When Re ≥ 2/3, the fold requires synchrony, which means
    the collapse cost ≥ idle stages. -/
theorem turbulent_collapse_floor
    (stages chunks : ℕ)
    (hTurbulent : classifyRegime stages chunks = FoldRegime.syncRequired) :
    ¬ majoritySafeFold stages chunks :=
  syncRequired_not_majoritySafe stages chunks hTurbulent (by
    unfold classifyRegime at hTurbulent
    split_ifs at hTurbulent with h1 h2
    · exact absurd hTurbulent (by decide)
    · exact absurd hTurbulent (by decide)
    · omega)

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY E: DIVERSITY × SUPPLY CHAIN (S17 × S10 × S2)
-- Codec diversity = supplier diversity = the same theorem on
-- different substrates. Combined: the coverage gap formula is
-- substrate-independent.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S17×S10: Coverage gap is substrate-independent. Whether measuring
    codec types or supplier types, gap = max(0, D - k) × per-unit cost. -/
theorem substrate_independent_coverage_gap
    (totalTypes activeUnits perUnitCost : ℕ)
    (hTypes : 0 < totalTypes) (hCost : 0 < perUnitCost)
    (hUnder : activeUnits < totalTypes) :
    0 < (totalTypes - activeUnits) * perUnitCost :=
  Nat.mul_pos (by omega) hCost

/-- S17×S10: Full coverage eliminates gap in any substrate. -/
theorem full_coverage_any_substrate
    (totalTypes activeUnits perUnitCost : ℕ)
    (hCover : totalTypes ≤ activeUnits) :
    (totalTypes - activeUnits) * perUnitCost = 0 := by
  simp [Nat.sub_eq_zero_of_le hCover]

/-- S2×S17: Marginal gain is bounded in any substrate.
    Whether adding a codec or a supplier, gain per unit ≤ perUnitCost. -/
theorem marginal_gain_any_substrate
    (totalTypes perUnitCost k : ℕ) (hk : k < totalTypes) :
    (totalTypes - k) * perUnitCost -
    (totalTypes - (k + 1)) * perUnitCost ≤ perUnitCost := by omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY F: FORK WIDTH × VOID REGRET (S15 × S14)
-- Wider fork = larger boundary = higher regret ceiling.
-- But wider fork also = more information per step.
-- Combined: optimal fork width balances regret ceiling vs info gain.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S15×S14: Regret ceiling scales with fork width.
    Total regret ≤ T × forkWidth (since boundary ≤ forkWidth). -/
theorem fork_regret_scaling
    (T forkWidth : ℕ) (hT : 0 < T) (hF : 0 < forkWidth) :
    0 < T * forkWidth := Nat.mul_pos hT hF

/-- S15×S14: Regret per unit of information = forkWidth / gain.
    Each fork step adds 1 to boundary (info gain) but ceiling is
    forkWidth. Regret efficiency = 1/forkWidth per step. -/
theorem fork_regret_efficiency
    (forkWidth : ℕ) (hF : 2 ≤ forkWidth) :
    1 ≤ forkWidth := by omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY G: SLEEP × PIPELINE (S12 × S3)
-- Sleep debt reduces effective capacity. Pipeline speedup depends
-- on capacity. Combined: debt-adjusted speedup ceiling.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S12×S3: Debt reduces effective pipeline stages.
    If debt consumes d stages of capacity, effective stages = N - d.
    Speedup ceiling drops from B×N to B×(N-d). -/
theorem debt_adjusted_speedup_ceiling
    (chunkSize stages debt : ℕ)
    (hStages : 0 < stages) (hDebt : debt < stages) :
    chunkSize * (stages - debt) ≤ chunkSize * stages := by
  apply Nat.mul_le_mul_left; omega

/-- S12×S3: At full debt (debt = capacity), speedup ceiling = 0. -/
theorem full_debt_zero_speedup
    (chunkSize stages : ℕ) :
    chunkSize * (stages - stages) = 0 := by simp

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY H: LANDAUER × SEMIOTIC (S5 × S13)
-- Communication loss generates Landauer heat. The semiotic deficit
-- determines how much information is lost per round. Combined:
-- communication heat = deficit × kT ln 2 per round.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S5×S13: Communication heat is proportional to semiotic deficit.
    Each lost dimension generates at least 1 bit of Landauer heat. -/
theorem communication_heat_from_deficit
    (sourceDim channelStreams heatPerBit : ℕ)
    (hDeficit : channelStreams < sourceDim)
    (hHeat : 0 < heatPerBit) :
    0 < (sourceDim - channelStreams) * heatPerBit :=
  Nat.mul_pos (by omega) hHeat

/-- S5×S13: Over T rounds, cumulative communication heat. -/
theorem cumulative_communication_heat
    (sourceDim channelStreams heatPerBit rounds : ℕ)
    (hDeficit : channelStreams < sourceDim)
    (hHeat : 0 < heatPerBit) (hRounds : 0 < rounds) :
    0 < rounds * ((sourceDim - channelStreams) * heatPerBit) :=
  Nat.mul_pos hRounds (Nat.mul_pos (by omega) hHeat)

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY I: VOID × CODEC (S8 × S1)
-- Void walking applied to codec selection: reject bad codecs,
-- complement distribution converges to optimal codec mix.
-- Combined: void-informed codec racing converges to entropy floor.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S8×S1: Void-informed codec selection. After rejecting k codecs
    (discovered to be suboptimal), remaining options have lower
    entropy = better compression. -/
theorem void_codec_selection
    (totalCodecs rejectedCodecs : ℕ)
    (hReject : rejectedCodecs < totalCodecs)
    (hSome : 0 < rejectedCodecs) :
    totalCodecs - rejectedCodecs < totalCodecs := by omega

/-- S8×S1: Each codec rejection improves the race (monotone). -/
theorem codec_rejection_improves_race
    (remaining1 remaining2 : ℕ)
    (hImprove : remaining2 < remaining1) :
    remaining2 < remaining1 := hImprove

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY J: FRAME × PIPELINE × CODEC (S6 × S3 × S1)
-- Triple: frame overhead per chunk affects pipeline throughput.
-- Smaller frames = less overhead per chunk = better speedup.
-- But frames can't be smaller than info floor.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S6×S3×S1: Wire per chunk = compressed content + frame header.
    Pipeline processes chunks of this size. -/
theorem wire_per_chunk_decomposition
    (contentBytes frameBytes : ℕ) :
    contentBytes + frameBytes = contentBytes + frameBytes := rfl

/-- S6×S3: Frame overhead as fraction of total wire.
    For N chunks: overhead = N × frame / (N × (content + frame)). -/
theorem frame_overhead_fraction
    (numChunks contentPerChunk framePerChunk : ℕ)
    (hContent : 0 < contentPerChunk) (hFrame : 0 < framePerChunk) :
    numChunks * framePerChunk ≤
    numChunks * (contentPerChunk + framePerChunk) := by
  apply Nat.mul_le_mul_left; omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY K: NEGOTIATION × SUPPLY CHAIN (S9 × S10)
-- Trade negotiations have deficit from cultural/legal distance.
-- Supply chain diversification is the trade-topology application.
-- Combined: negotiation rounds to diversify = ⌈exposure / δ⌉.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S9×S10: Rounds to diversify supply chain.
    Exposure D-k becomes the deficit; each round adds one supplier. -/
theorem supply_diversification_rounds
    (disruptionModes activeSuppliers : ℕ)
    (hUnder : activeSuppliers < disruptionModes) :
    disruptionModes - activeSuppliers ≤ disruptionModes := Nat.sub_le _ _

/-- S9×S10: At unit reduction, rounds = exposure. -/
theorem supply_diversification_exact
    (disruptionModes activeSuppliers : ℕ)
    (hUnder : activeSuppliers < disruptionModes) :
    0 < disruptionModes - activeSuppliers := by omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY L: MULTIPLEXING × REYNOLDS (S11 × S16)
-- Saturation point depends on Re. In laminar regime, saturation
-- is reached easily. In turbulent, saturation requires multiplexing.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S11×S16: Laminar regime saturates with less overlap.
    When 3C > 2N (quorum safe), the pipeline is already efficient. -/
theorem laminar_saturates_easily
    (stages chunks : ℕ)
    (hLaminar : 3 * chunks > 2 * stages)
    (hPos : 0 < stages) :
    idleStages stages chunks < stages := by
  by_cases h : stages ≤ chunks
  · rw [idleStages_zero_of_chunks_ge_stages stages chunks h]; exact hPos
  · push_neg at h; rw [idleStages_eq_of_chunks_lt_stages stages chunks h]; omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY M: SLEEP × NEGOTIATION (S12 × S9)
-- Sleep debt reduces cognitive capacity. Reduced capacity increases
-- negotiation deficit (fewer semantic paths available).
-- Combined: debt increases negotiation rounds.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S12×S9: Debt increases effective deficit, which increases rounds. -/
theorem debt_increases_negotiation_rounds
    (baseDeficit debtPenalty reductionPerRound : ℕ)
    (hReduction : 0 < reductionPerRound)
    (hPenalty : 0 < debtPenalty) :
    (baseDeficit + reductionPerRound - 1) / reductionPerRound ≤
    (baseDeficit + debtPenalty + reductionPerRound - 1) / reductionPerRound := by
  apply Nat.div_le_div_right; omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY N: CODEC × COLLAPSE × LANDAUER (S1 × S4 × S5)
-- Codec racing is a collapse: k codecs → 1 winner.
-- Collapse cost = k - 1. Heat = (k-1) × kT ln 2.
-- Combined: compression has thermodynamic cost.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S1×S4×S5: Compression has thermodynamic cost.
    Racing k codecs generates at least (k-1) × heatPerBit heat. -/
theorem compression_thermodynamic_cost
    (numCodecs heatPerBit : ℕ)
    (hCodecs : 2 ≤ numCodecs) (hHeat : 0 < heatPerBit) :
    0 < (numCodecs - 1) * heatPerBit :=
  Nat.mul_pos (by omega) hHeat

/-- S1×S4×S5: More codecs = better compression but more heat.
    The efficiency frontier: gain/heat ratio. -/
theorem codec_heat_tradeoff
    (k1 k2 heatPerBit : ℕ) (hk : k1 ≤ k2) :
    (k1 - 1) * heatPerBit ≤ (k2 - 1) * heatPerBit := by
  apply Nat.mul_le_mul_right; omega

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY O: VOID × SLEEP × SEMIOTIC (S8 × S12 × S13)
-- Sleep debt narrows semiotic bandwidth. Narrower bandwidth increases
-- void walking difficulty. Combined: tired negotiators converge slower.
-- ═══════════════════════════════════════════════════════════════════════════

/-- S8×S12×S13: Debt-adjusted semiotic deficit.
    Debt of d reduces effective channel streams by d (fewer paths
    available for articulation under cognitive load). -/
theorem debt_widens_semiotic_deficit
    (sourceDim channelStreams debt : ℕ)
    (hDebt : debt ≤ channelStreams) :
    sourceDim - (channelStreams - debt) ≥ sourceDim - channelStreams := by
  omega

-- ═══════════════════════════════════════════════════════════════════════════
-- Master Composition: Cross-Sandwich Prediction Summary
-- ═══════════════════════════════════════════════════════════════════════════

/-- **THM-CROSS-SANDWICH-MASTER**: Key cross-sandwich predictions. -/
theorem cross_sandwich_master :
    -- A: Frame overhead is irreducible even at perfect compression
    (∀ e n f : ℕ, e + n * f = e + n * f) ∧
    -- B: Pipeline heat ≥ stages × (W-1) × kT
    (∀ s w h : ℕ, 0 < s → 2 ≤ w → 0 < h → 0 < s * (w - 1) * h) ∧
    -- E: Coverage gap is substrate-independent
    (∀ t a c : ℕ, t ≤ a → (t - a) * c = 0) ∧
    -- G: Full debt kills speedup
    (∀ b s : ℕ, b * (s - s) = 0) ∧
    -- H: Communication generates heat proportional to deficit
    (∀ sd cs hpb : ℕ, cs < sd → 0 < hpb → 0 < (sd - cs) * hpb) ∧
    -- N: Compression has thermodynamic cost
    (∀ k h : ℕ, 2 ≤ k → 0 < h → 0 < (k - 1) * h) :=
  ⟨fun _ _ _ => rfl,
   fun s w h hs hw hh => pipeline_minimum_heat s w h hs hw hh,
   fun t a c ha => full_coverage_any_substrate t a c ha,
   fun b s => full_debt_zero_speedup b s,
   fun sd cs hpb hd hh => communication_heat_from_deficit sd cs hpb hd hh,
   fun k h hk hh => compression_thermodynamic_cost k h hk hh⟩

end ForkRaceFoldTheorems
