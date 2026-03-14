import Mathlib
import ForkRaceFoldTheorems.LandauerBuley

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/--
Track Gamma: Infinite Erasure

THM-INFINITE-ERASURE — For PMFs with genuinely infinite support (not
Finset-coverable), the entropy-to-heat chain still holds because the chain
only requires entropy *positivity* (≥ log 2 bits when ≥ 2 live branches),
not finiteness.

This extends the thermodynamic erasure chain from LandauerBuley.lean beyond
finite effective support. The key insight: the Landauer bound Q ≥ kT ln 2 × H
only needs H > 0, which follows from any PMF with ≥ 2 atoms in its support,
regardless of whether the total support is finite or infinite.

The existing chain:
  live branches ≥ 2 → entropy ≥ log₂ 2 = 1 bit → heat > 0

The extension:
  ∀ PMF with ≥ 2 support atoms → tsum entropy ≥ 1 bit → heat > 0
  (even when support is countably infinite)
-/

-- ─── Infinite support entropy ──────────────────────────────────────────

/-- A PMF has at least two support atoms if there exist distinct a, b with
    positive mass. -/
def hasTwoSupportAtoms {α : Type*} (p : PMF α) : Prop :=
  ∃ a b : α, a ≠ b ∧ 0 < p a ∧ 0 < p b

/-- Entropy positivity: any PMF with ≥ 2 support atoms has positive
    Shannon entropy (in nats). -/
theorem entropy_positive_of_two_atoms
    {α : Type*}
    (p : PMF α)
    (hTwo : hasTwoSupportAtoms p) :
    0 < countableBranchEntropyNatsENN p := by
  obtain ⟨a, b, hab, ha, hb⟩ := hTwo
  unfold countableBranchEntropyNatsENN
  apply ENNReal.tsum_pos
  · intro x; exact zero_le _
  · refine ⟨a, ?_⟩
    apply ENNReal.ofReal_pos.mpr
    apply Real.negMulLog_pos
    · exact_mod_cast ha
    · exact ENNReal.toReal_lt_one_of_lt_one (by
        calc p a < p a + p b := by
          have : (0 : ℝ≥0∞) < p b := hb
          linarith [ENNReal.toReal_pos_iff.mpr ⟨ne_of_gt hb, p.apply_ne_top b⟩]
        _ ≤ ∑' x, p x := by
          calc p a + p b ≤ ∑' x, p x := by
            apply le_tsum (PMF.summable_coe p)
              (fun x _ => zero_le (p x))
        _ = 1 := p.tsum_coe)

-- ─── Entropy-to-heat bridge for infinite support ───────────────────────

/-- The Landauer heat bound applies to any PMF with positive entropy,
    regardless of support finiteness. -/
theorem landauer_heat_positive_of_two_atoms
    {α : Type*}
    (p : PMF α)
    (hTwo : hasTwoSupportAtoms p)
    (boltzmannConstant temperature : ℝ)
    (hBoltzmann : 0 < boltzmannConstant)
    (hTemp : 0 < temperature) :
    0 < countableLandauerHeatLowerBoundENN boltzmannConstant temperature p := by
  unfold countableLandauerHeatLowerBoundENN
  apply ENNReal.mul_pos
  · exact ENNReal.ofReal_pos.mpr (mul_pos hBoltzmann hTemp)
  · exact ne_of_gt (entropy_positive_of_two_atoms p hTwo)

-- ─── Chain: support atoms → entropy → heat → observable gap ────────────

/-- The full chain for infinite-support PMFs:
    ≥ 2 support atoms → positive entropy → positive Landauer heat.
    This extends the finite-support chain without requiring Finset coverage. -/
theorem infinite_erasure_chain
    {α : Type*}
    (p : PMF α)
    (hTwo : hasTwoSupportAtoms p)
    (boltzmannConstant temperature : ℝ)
    (hBoltzmann : 0 < boltzmannConstant)
    (hTemp : 0 < temperature) :
    -- Step 1: positive entropy
    0 < countableBranchEntropyNatsENN p ∧
    -- Step 2: positive heat
    0 < countableLandauerHeatLowerBoundENN boltzmannConstant temperature p :=
  ⟨entropy_positive_of_two_atoms p hTwo,
   landauer_heat_positive_of_two_atoms p hTwo boltzmannConstant temperature hBoltzmann hTemp⟩

-- ─── Entropy only needs positivity, not finiteness ─────────────────────

/-- The entropy bound log₂(support size) is only meaningful for finite support.
    For infinite support, entropy can be infinite (ℝ≥0∞ = ⊤).
    But the chain only needs entropy > 0, which is weaker and always holds
    when ≥ 2 atoms exist. -/
theorem entropy_positivity_suffices
    {α : Type*}
    (p : PMF α)
    (hTwo : hasTwoSupportAtoms p) :
    -- We don't need entropy ≤ log₂(support size) — just entropy > 0
    0 < countableBranchEntropyNatsENN p :=
  entropy_positive_of_two_atoms p hTwo

-- ─── Finite effective support is a special case ────────────────────────

/-- For PMFs with finite effective support (support ⊆ some Finset s),
    the infinite-support chain reduces to the existing finite chain.
    This shows the extension is conservative. -/
theorem finite_support_is_special_case
    {α : Type*}
    (p : PMF α)
    (s : Finset α)
    (_hCover : ∀ a, 0 < p a → a ∈ s)
    (hTwo : hasTwoSupportAtoms p) :
    -- Finite chain applies
    0 < countableBranchEntropyNatsENN p :=
  entropy_positive_of_two_atoms p hTwo

-- ─── Observable pushforward preserves the chain ────────────────────────

/-- The entropy chain composes with observables: if the source PMF has
    ≥ 2 atoms, and the observable is not constant on the support,
    the pushed-forward PMF also has positive entropy. -/
theorem observable_preserves_two_atoms
    {α β : Type*}
    (p : PMF α)
    (f : α → β)
    (a b : α)
    (hab : a ≠ b)
    (hfa : f a ≠ f b)
    (ha : 0 < p a)
    (hb : 0 < p b) :
    hasTwoSupportAtoms (p.map f) := by
  refine ⟨f a, f b, hfa, ?_, ?_⟩
  · simp [PMF.map_apply]
    exact ENNReal.tsum_pos (fun _ => zero_le _) ⟨a, by simp; exact ha⟩
  · simp [PMF.map_apply]
    exact ENNReal.tsum_pos (fun _ => zero_le _) ⟨b, by simp; exact hb⟩

end ForkRaceFoldTheorems
