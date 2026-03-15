import Mathlib

namespace ForkRaceFoldTheorems

/-
Track Beta: Topological Codec Racing Optimality

Proves that per-resource codec racing (fork all codecs, race to smallest)
subsumes any fixed-codec strategy and monotonically improves with more codecs.

THM-TOPO-RACE-SUBSUMPTION: Racing total ≤ any fixed-codec total
THM-TOPO-RACE-MONOTONE: Adding a codec never increases wire size
THM-TOPO-RACE-DEFICIT: Racing achieves zero compression deficit
THM-TOPO-RACE-ENTROPY: Wire bounded by per-resource best

These are the §9 topological compression theorems lifted from per-chunk
(within a single resource) to per-resource (across a site manifest).
-/

-- ─── Codec racing structures ──────────────────────────────────────

/-- A compression result for a single resource with a specific codec. -/
structure CodecResult where
  rawSize : ℕ
  compressedSize : ℕ
  hBounded : compressedSize ≤ rawSize + 1  -- compression can slightly expand

/-- A codec race result: the minimum compressed size across all codecs. -/
def raceMin (results : List CodecResult) : ℕ :=
  match results with
  | [] => 0
  | [r] => r.compressedSize
  | r :: rs => min r.compressedSize (raceMin rs)

-- Reduction lemmas for raceMin (the three-arm match needs explicit help)
@[simp] theorem raceMin_nil : raceMin ([] : List CodecResult) = 0 := rfl
@[simp] theorem raceMin_singleton (r : CodecResult) :
    raceMin [r] = r.compressedSize := rfl
@[simp] theorem raceMin_cons_cons (r s : CodecResult) (ss : List CodecResult) :
    raceMin (r :: s :: ss) = min r.compressedSize (raceMin (s :: ss)) := rfl

-- Helper: raceMin of a non-empty list is ≤ the head element
private theorem raceMin_cons_le_head (r : CodecResult) (rs : List CodecResult) :
    raceMin (r :: rs) ≤ r.compressedSize := by
  cases rs with
  | nil => exact Nat.le_refl _
  | cons s ss => exact min_le_left _ _

-- ═══════════════════════════════════════════════════════════════════════
-- THM-TOPO-RACE-SUBSUMPTION
--
-- For any list of codec results, the race minimum is ≤ every individual
-- codec's compressed size. This means per-resource racing subsumes
-- any fixed-codec strategy: you can't do worse by racing.
-- ═══════════════════════════════════════════════════════════════════════

/-- The race minimum is ≤ each codec's result (subsumption). -/
theorem race_subsumes_each (results : List CodecResult)
    (r : CodecResult) (hr : r ∈ results) :
    raceMin results ≤ r.compressedSize := by
  induction results with
  | nil => exact absurd hr (List.not_mem_nil r)
  | cons hd tl ih =>
    rcases List.mem_cons.mp hr with rfl | htl
    · exact raceMin_cons_le_head hd tl
    · cases tl with
      | nil => exact absurd htl (List.not_mem_nil r)
      | cons s ss =>
        exact le_trans (min_le_right _ _) (ih htl)

/-- Summing race minima across resources ≤ summing any fixed codec.
    This is the site-level subsumption theorem.

    Uses `dite` in the RHS to carry the per-element length proof through
    `List.map`, since `List.map` does not propagate membership. For
    elements of `resources`, `hCodecValid` ensures the `then` branch. -/
theorem race_total_subsumes_fixed_codec
    (resources : List (List CodecResult))
    (codecIdx : ℕ)
    (hCodecValid : ∀ rs ∈ resources, codecIdx < rs.length) :
    (resources.map raceMin).sum ≤
    (resources.map (fun rs =>
       if h : codecIdx < rs.length
       then (rs.get ⟨codecIdx, h⟩).compressedSize
       else 0)).sum := by
  induction resources with
  | nil => simp
  | cons hd tl ih =>
    simp only [List.map_cons, List.sum_cons]
    apply Nat.add_le_add
    · have hValid := hCodecValid hd (List.mem_cons_self hd tl)
      simp only [dif_pos hValid]
      exact race_subsumes_each hd _ (List.get_mem hd ⟨codecIdx, hValid⟩)
    · exact ih (fun rs hrs => hCodecValid rs (List.mem_cons_of_mem hd hrs))

-- ═══════════════════════════════════════════════════════════════════════
-- THM-TOPO-RACE-MONOTONE
--
-- Adding a codec to the race can only decrease or maintain the result.
-- This follows from min being monotone under set expansion.
-- Note: requires non-empty base list, since raceMin [] = 0 < raceMin [r].
-- ═══════════════════════════════════════════════════════════════════════

/-- Adding a codec to a non-empty race never increases the minimum. -/
theorem race_monotone_on_add (results : List CodecResult) (hne : results ≠ [])
    (newCodec : CodecResult) :
    raceMin (newCodec :: results) ≤ raceMin results := by
  match results, hne with
  | _ :: _, _ => exact min_le_right _ _

/-- Adding a codec to any list: new min ≤ new codec's size. -/
theorem race_add_le_new (results : List CodecResult)
    (newCodec : CodecResult) :
    raceMin (newCodec :: results) ≤ newCodec.compressedSize :=
  raceMin_cons_le_head newCodec results

/-- Adding a codec is weakly improving (non-empty base): new min ≤ old min
    and new min ≤ new codec's size. -/
theorem race_monotone_corollary (results : List CodecResult) (hne : results ≠ [])
    (newCodec : CodecResult) :
    raceMin (newCodec :: results) ≤ raceMin results ∧
    raceMin (newCodec :: results) ≤ newCodec.compressedSize :=
  ⟨race_monotone_on_add results hne newCodec, race_add_le_new results newCodec⟩

-- ═══════════════════════════════════════════════════════════════════════
-- THM-TOPO-RACE-DEFICIT
--
-- Racing achieves zero "compression deficit": it always picks the
-- best available codec for each resource. The deficit is defined as
-- the gap between the actual compressed size and the best possible.
-- ═══════════════════════════════════════════════════════════════════════

/-- Compression deficit: gap between chosen size and race-optimal size. -/
def compressionDeficit (chosen : ℕ) (results : List CodecResult) : ℕ :=
  chosen - raceMin results

/-- Racing achieves zero compression deficit by definition. -/
theorem race_zero_deficit (results : List CodecResult) :
    compressionDeficit (raceMin results) results = 0 := by
  unfold compressionDeficit
  omega

/-- Any fixed codec has non-negative deficit. -/
theorem fixed_codec_nonneg_deficit (results : List CodecResult)
    (r : CodecResult) (_hr : r ∈ results) :
    0 ≤ compressionDeficit r.compressedSize results := by
  exact Nat.zero_le _

-- ═══════════════════════════════════════════════════════════════════════
-- THM-TOPO-RACE-IDENTITY-BASELINE
--
-- Identity codec (no compression) is always in the race, so the
-- race result is always ≤ raw size. This guarantees that racing
-- never makes things worse than no compression at all.
-- ═══════════════════════════════════════════════════════════════════════

/-- When identity is in the race, result ≤ raw size. -/
theorem race_bounded_by_identity
    (results : List CodecResult) (identity : CodecResult)
    (hIdentity : identity ∈ results)
    (hIdentityIsRaw : identity.compressedSize = identity.rawSize) :
    raceMin results ≤ identity.rawSize := by
  calc raceMin results ≤ identity.compressedSize := race_subsumes_each results identity hIdentity
    _ = identity.rawSize := hIdentityIsRaw

end ForkRaceFoldTheorems
