import Mathlib
import ForkRaceFoldTheorems.FailureUniversality

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/--
The current finite Landauer bridge: an equiprobable `n`-way live frontier carries `log₂ n`
bits, every finite branch law on `n` live branches carries at most that entropy budget, and
deterministic collapse still pays the existing `n - 1` failure-tax floor. Every achievable
deterministic collapse of the same finite frontier cardinality therefore pays at least the
corresponding finite Landauer heat budget. On the binary surface the Bernoulli entropy/heat
law is also closed: the failure-tax floor bounds every binary Shannon erasure budget and
matches it exactly at the fair fork witness. The measurable side is still partial, but the
file now also exposes a countable-support entropy shell: arbitrary PMFs carry an `ENNReal`
Shannon entropy written as a `tsum`, recovered as a supremum of finite truncations and, on
countable measurable types, as a counting-measure `lintegral`; on finite supports this shell
reduces to the earlier real-valued finite entropy.
-/
noncomputable def equiprobableFrontierEntropyBits (liveBranches : Nat) : ℝ :=
  Real.logb 2 liveBranches

def deterministicCollapseFailureTax (liveBranches : Nat) : Nat :=
  liveBranches - 1

noncomputable def uniformBranchMass (liveBranches : Nat) : ℝ :=
  (liveBranches : ℝ)⁻¹

noncomputable def uniformVentedBranchSelfInformationBits (liveBranches : Nat) : ℝ :=
  -Real.logb 2 (uniformBranchMass liveBranches)

noncomputable def binaryBranchEntropyBits (branchProbability : ℝ) : ℝ :=
  Real.binEntropy branchProbability / Real.log 2

noncomputable def finiteBranchEntropyNats
    {α : Type*} [Fintype α]
    (branchLaw : PMF α) : ℝ :=
  ∑ a, Real.negMulLog (branchLaw a).toReal

noncomputable def finiteBranchEntropyBits
    {α : Type*} [Fintype α]
    (branchLaw : PMF α) : ℝ :=
  finiteBranchEntropyNats branchLaw / Real.log 2

noncomputable def truncatedBranchEntropyNatsENN
    {α : Type*}
    (branchLaw : PMF α)
    (support : Finset α) : ℝ≥0∞ :=
  Finset.sum support fun a => ENNReal.ofReal (Real.negMulLog (branchLaw a).toReal)

noncomputable def countableBranchEntropyNatsENN
    {α : Type*}
    (branchLaw : PMF α) : ℝ≥0∞ :=
  ∑' a, ENNReal.ofReal (Real.negMulLog (branchLaw a).toReal)

noncomputable def countableBranchEntropyBitsENN
    {α : Type*}
    (branchLaw : PMF α) : ℝ≥0∞ :=
  countableBranchEntropyNatsENN branchLaw / ENNReal.ofReal (Real.log 2)

noncomputable def landauerHeatLowerBound
    (boltzmannConstant temperature erasedBits : ℝ) : ℝ :=
  boltzmannConstant * temperature * Real.log 2 * erasedBits

noncomputable def failureTaxHeatBudget
    (boltzmannConstant temperature : ℝ)
    (liveBranches : Nat) : ℝ :=
  landauerHeatLowerBound boltzmannConstant temperature
    (deterministicCollapseFailureTax liveBranches)

theorem uniform_branch_self_information_bits_eq_frontier_entropy_bits
    {liveBranches : Nat}
    (_hLive : 0 < liveBranches) :
    uniformVentedBranchSelfInformationBits liveBranches =
      equiprobableFrontierEntropyBits liveBranches := by
  unfold uniformVentedBranchSelfInformationBits uniformBranchMass equiprobableFrontierEntropyBits
  rw [Real.logb_inv]
  ring

theorem frontier_entropy_bits_two :
    equiprobableFrontierEntropyBits 2 = 1 := by
  unfold equiprobableFrontierEntropyBits
  exact Real.logb_self_eq_one (show (1 : ℝ) < 2 by norm_num)

theorem binary_failure_tax_matches_entropy_bits :
    equiprobableFrontierEntropyBits 2 = deterministicCollapseFailureTax 2 := by
  rw [frontier_entropy_bits_two, deterministicCollapseFailureTax]
  norm_num

theorem binary_branch_entropy_bits_le_one
    {branchProbability : ℝ}
    (_hProbabilityNonneg : 0 ≤ branchProbability)
    (_hProbabilityLeOne : branchProbability ≤ 1) :
    binaryBranchEntropyBits branchProbability ≤ 1 := by
  have hLogTwoPos : 0 < Real.log 2 := by
    exact Real.log_pos (by norm_num)
  unfold binaryBranchEntropyBits
  refine (div_le_iff₀ hLogTwoPos).2 ?_
  simpa using Real.binEntropy_le_log_two (p := branchProbability)

theorem binary_branch_entropy_bits_eq_one_iff
    {branchProbability : ℝ} :
    binaryBranchEntropyBits branchProbability = 1 ↔ branchProbability = (2 : ℝ)⁻¹ := by
  have hLogTwoNe : Real.log 2 ≠ 0 := by
    exact ne_of_gt (Real.log_pos (by norm_num))
  unfold binaryBranchEntropyBits
  rw [div_eq_iff hLogTwoNe, one_mul, Real.binEntropy_eq_log_two]

theorem binary_branch_entropy_bits_le_failure_tax
    {branchProbability : ℝ}
    (hProbabilityNonneg : 0 ≤ branchProbability)
    (hProbabilityLeOne : branchProbability ≤ 1) :
    binaryBranchEntropyBits branchProbability ≤ deterministicCollapseFailureTax 2 := by
  simpa [deterministicCollapseFailureTax] using
    binary_branch_entropy_bits_le_one
      hProbabilityNonneg
      hProbabilityLeOne

theorem binary_branch_entropy_bits_eq_failure_tax_iff
    {branchProbability : ℝ} :
    binaryBranchEntropyBits branchProbability = deterministicCollapseFailureTax 2 ↔
      branchProbability = (2 : ℝ)⁻¹ := by
  simpa [deterministicCollapseFailureTax] using
    (binary_branch_entropy_bits_eq_one_iff (branchProbability := branchProbability))

private theorem finite_branch_mass_toReal_sum_one
    {α : Type*} [Fintype α]
    (branchLaw : PMF α) :
    ∑ a, (branchLaw a).toReal = 1 := by
  have htsum := branchLaw.tsum_coe
  have hsum :
      (Finset.univ.sum fun a => branchLaw a) = (1 : ENNReal) := by
    simpa [tsum_fintype] using htsum
  have hsumReal := congrArg ENNReal.toReal hsum
  rw [ENNReal.toReal_sum (s := Finset.univ) (fun a _ => branchLaw.apply_ne_top a),
    ENNReal.toReal_one] at hsumReal
  exact hsumReal

private theorem finite_uniform_weight_sum_one
    {α : Type*} [Fintype α] [Nonempty α] :
    (∑ _ : α, ((Fintype.card α : ℝ)⁻¹)) = 1 := by
  have hCardNe : (Fintype.card α : ℝ) ≠ 0 := by
    exact_mod_cast Fintype.card_ne_zero
  rw [Finset.sum_const, nsmul_eq_mul]
  exact mul_inv_cancel₀ hCardNe

private theorem negMulLog_inv_card
    {α : Type*} [Fintype α] [Nonempty α] :
    Real.negMulLog ((Fintype.card α : ℝ)⁻¹) =
      Real.log (Fintype.card α) / Fintype.card α := by
  unfold Real.negMulLog
  rw [Real.log_inv]
  ring_nf

private theorem finite_branch_average_eq_inv_card
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    ∑ a : α, ((Fintype.card α : ℝ)⁻¹) * (branchLaw a).toReal =
      ((Fintype.card α : ℝ)⁻¹) := by
  rw [← Finset.mul_sum, finite_branch_mass_toReal_sum_one]
  ring

private theorem finite_branch_entropy_jensen_eq_iff_uniform
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    Real.negMulLog (∑ a : α, ((Fintype.card α : ℝ)⁻¹) * (branchLaw a).toReal) =
      ∑ a : α, ((Fintype.card α : ℝ)⁻¹) * Real.negMulLog ((branchLaw a).toReal) ↔
        ∀ a : α, (branchLaw a).toReal = ((Fintype.card α : ℝ)⁻¹) := by
  simpa [Finset.mem_univ, smul_eq_mul, finite_branch_average_eq_inv_card (branchLaw := branchLaw)]
    using
      (Real.strictConcaveOn_negMulLog.map_sum_eq_iff
        (t := Finset.univ)
        (w := fun _ : α => ((Fintype.card α : ℝ)⁻¹))
        (p := fun a : α => (branchLaw a).toReal)
        (h₀ := by
          intro _ _
          positivity)
        (h₁ := by
          exact finite_uniform_weight_sum_one (α := α))
        (hmem := by
          intro _ _
          exact ENNReal.toReal_nonneg))

theorem finite_branch_entropy_nats_le_log_card
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    finiteBranchEntropyNats branchLaw ≤ Real.log (Fintype.card α) := by
  have hJensen :
      ∑ a : α, ((Fintype.card α : ℝ)⁻¹) * Real.negMulLog ((branchLaw a).toReal) ≤
        Real.negMulLog (∑ a : α, ((Fintype.card α : ℝ)⁻¹) * (branchLaw a).toReal) := by
    simpa [smul_eq_mul] using
      (Real.concaveOn_negMulLog.le_map_sum
        (t := Finset.univ)
        (w := fun _ : α => ((Fintype.card α : ℝ)⁻¹))
        (p := fun a : α => (branchLaw a).toReal)
        (h₀ := by
          intro _ _
          positivity)
        (h₁ := by
          exact finite_uniform_weight_sum_one (α := α))
        (hmem := by
          intro _ _
          exact ENNReal.toReal_nonneg))
  have hScaled :
      ((Fintype.card α : ℝ)⁻¹) * finiteBranchEntropyNats branchLaw ≤
        Real.log (Fintype.card α) / Fintype.card α := by
    rw [← Finset.mul_sum] at hJensen
    have hAvg :
        ∑ a : α, ((Fintype.card α : ℝ)⁻¹) * (branchLaw a).toReal =
          ((Fintype.card α : ℝ)⁻¹) := by
      rw [← Finset.mul_sum, finite_branch_mass_toReal_sum_one]
      ring
    simpa [finiteBranchEntropyNats, hAvg, negMulLog_inv_card (α := α)] using hJensen
  have hCardPosNat : 0 < Fintype.card α :=
    Fintype.card_pos_iff.mpr inferInstance
  have hCardPos : 0 < (Fintype.card α : ℝ) := by
    exact_mod_cast hCardPosNat
  have hMul :=
    mul_le_mul_of_nonneg_left hScaled (le_of_lt hCardPos)
  have hCardNe : (Fintype.card α : ℝ) ≠ 0 := ne_of_gt hCardPos
  simpa [finiteBranchEntropyNats, hCardNe, div_eq_mul_inv, mul_assoc, mul_left_comm, mul_comm]
    using hMul

theorem finite_branch_entropy_nats_eq_log_card_iff
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    finiteBranchEntropyNats branchLaw = Real.log (Fintype.card α) ↔
      branchLaw = PMF.uniformOfFintype α := by
  constructor
  · intro hEq
    have hScaledEq :
        ((Fintype.card α : ℝ)⁻¹) * finiteBranchEntropyNats branchLaw =
          Real.negMulLog ((Fintype.card α : ℝ)⁻¹) := by
      rw [hEq, negMulLog_inv_card]
      ring
    have hJensenEq :
        Real.negMulLog (∑ a : α, ((Fintype.card α : ℝ)⁻¹) * (branchLaw a).toReal) =
          ∑ a : α, ((Fintype.card α : ℝ)⁻¹) * Real.negMulLog ((branchLaw a).toReal) := by
      rw [finite_branch_average_eq_inv_card (branchLaw := branchLaw), ← Finset.mul_sum]
      exact hScaledEq.symm
    have hUniformMass :
        ∀ a : α, (branchLaw a).toReal = ((Fintype.card α : ℝ)⁻¹) :=
      (finite_branch_entropy_jensen_eq_iff_uniform branchLaw).1 hJensenEq
    apply PMF.ext
    intro a
    exact
      (ENNReal.toReal_eq_toReal_iff'
        (branchLaw.apply_ne_top a)
        ((PMF.uniformOfFintype α).apply_ne_top a)).1
        (by simpa [PMF.uniformOfFintype_apply] using hUniformMass a)
  · intro hUniform
    rw [hUniform]
    unfold finiteBranchEntropyNats
    have hCardNe : (Fintype.card α : ℝ) ≠ 0 := by
      exact_mod_cast Fintype.card_ne_zero
    calc
      ∑ a : α, Real.negMulLog (((PMF.uniformOfFintype α) a).toReal) =
          ∑ _ : α, Real.log (Fintype.card α) / Fintype.card α := by
            refine Finset.sum_congr rfl ?_
            intro a _
            simpa [PMF.uniformOfFintype_apply] using negMulLog_inv_card (α := α)
      _ = (Fintype.card α : ℝ) * (Real.log (Fintype.card α) / Fintype.card α) := by
            simp [Finset.sum_const, nsmul_eq_mul]
      _ = Real.log (Fintype.card α) := by
            field_simp [hCardNe]

theorem finite_branch_entropy_bits_le_frontier_entropy_bits
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    finiteBranchEntropyBits branchLaw ≤ equiprobableFrontierEntropyBits (Fintype.card α) := by
  have hLogTwoPos : 0 < Real.log 2 := by
    exact Real.log_pos (by norm_num)
  unfold finiteBranchEntropyBits equiprobableFrontierEntropyBits
  rw [Real.logb]
  rw [div_le_div_iff_of_pos_right hLogTwoPos]
  exact finite_branch_entropy_nats_le_log_card branchLaw

theorem finite_branch_entropy_bits_eq_frontier_entropy_bits_iff
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    finiteBranchEntropyBits branchLaw =
        equiprobableFrontierEntropyBits (Fintype.card α) ↔
      branchLaw = PMF.uniformOfFintype α := by
  have hLogTwoNe : Real.log 2 ≠ 0 := by
    exact ne_of_gt (Real.log_pos (by norm_num))
  constructor
  · intro hEq
    have hMul :
        finiteBranchEntropyNats branchLaw = Real.log (Fintype.card α) := by
      have := congrArg (fun x : ℝ => x * Real.log 2) hEq
      simpa [finiteBranchEntropyBits, equiprobableFrontierEntropyBits, Real.logb,
        hLogTwoNe, mul_assoc, mul_left_comm, mul_comm] using this
    exact (finite_branch_entropy_nats_eq_log_card_iff branchLaw).1 hMul
  · intro hUniform
    have hMul :=
      (finite_branch_entropy_nats_eq_log_card_iff branchLaw).2 hUniform
    have : finiteBranchEntropyNats branchLaw / Real.log 2 =
        Real.log (Fintype.card α) / Real.log 2 := by
      rw [hMul]
    simpa [finiteBranchEntropyBits, equiprobableFrontierEntropyBits, Real.logb] using this

private theorem branch_entropy_term_nonneg
    {α : Type*}
    (branchLaw : PMF α)
    (a : α) :
    0 ≤ Real.negMulLog (branchLaw a).toReal := by
  have hLeOne : (branchLaw a).toReal ≤ 1 := by
    exact ENNReal.toReal_mono ENNReal.one_ne_top (branchLaw.coe_le_one a)
  exact Real.negMulLog_nonneg ENNReal.toReal_nonneg hLeOne

theorem truncated_branch_entropy_natsENN_le_countable
    {α : Type*}
    (branchLaw : PMF α)
    (support : Finset α) :
    truncatedBranchEntropyNatsENN branchLaw support ≤ countableBranchEntropyNatsENN branchLaw := by
  unfold truncatedBranchEntropyNatsENN countableBranchEntropyNatsENN
  exact ENNReal.sum_le_tsum support

theorem countable_branch_entropy_natsENN_eq_iSup_truncated
    {α : Type*}
    (branchLaw : PMF α) :
    countableBranchEntropyNatsENN branchLaw =
      ⨆ support : Finset α, truncatedBranchEntropyNatsENN branchLaw support := by
  unfold countableBranchEntropyNatsENN truncatedBranchEntropyNatsENN
  simpa using
    (ENNReal.tsum_eq_iSup_sum
      (f := fun a : α => ENNReal.ofReal (Real.negMulLog (branchLaw a).toReal)))

theorem countable_branch_entropy_natsENN_eq_count_lintegral
    {α : Type*} [MeasurableSpace α] [Countable α] [MeasurableSingletonClass α]
    (branchLaw : PMF α) :
    countableBranchEntropyNatsENN branchLaw =
      ∫⁻ a, ENNReal.ofReal (Real.negMulLog (branchLaw a).toReal) ∂
        (MeasureTheory.Measure.count : MeasureTheory.Measure α) := by
  simpa [countableBranchEntropyNatsENN] using
    (MeasureTheory.lintegral_countable'
      (μ := (MeasureTheory.Measure.count : MeasureTheory.Measure α))
      (f := fun a : α => ENNReal.ofReal (Real.negMulLog (branchLaw a).toReal))).symm

theorem countable_branch_entropy_natsENN_eq_finite
    {α : Type*} [Fintype α]
    (branchLaw : PMF α) :
    countableBranchEntropyNatsENN branchLaw =
      ENNReal.ofReal (finiteBranchEntropyNats branchLaw) := by
  unfold countableBranchEntropyNatsENN finiteBranchEntropyNats
  rw [tsum_fintype]
  symm
  exact ENNReal.ofReal_sum_of_nonneg
    (fun a _ => branch_entropy_term_nonneg branchLaw a)

theorem countable_branch_entropy_bitsENN_eq_finite
    {α : Type*} [Fintype α]
    (branchLaw : PMF α) :
    countableBranchEntropyBitsENN branchLaw =
      ENNReal.ofReal (finiteBranchEntropyBits branchLaw) := by
  have hLogTwoPos : 0 < Real.log 2 := by
    exact Real.log_pos (by norm_num)
  unfold countableBranchEntropyBitsENN finiteBranchEntropyBits
  rw [countable_branch_entropy_natsENN_eq_finite, ENNReal.ofReal_div_of_pos hLogTwoPos]

private theorem nat_le_two_pow_pred {liveBranches : Nat}
    (hLive : 0 < liveBranches) :
    liveBranches ≤ 2 ^ (liveBranches - 1) := by
  cases liveBranches with
  | zero =>
      cases Nat.not_lt_zero _ hLive
  | succ n =>
      simpa using Nat.succ_le_of_lt n.lt_two_pow_self

theorem frontier_entropy_bits_le_failure_tax
    {liveBranches : Nat}
    (hLive : 0 < liveBranches) :
    equiprobableFrontierEntropyBits liveBranches ≤ deterministicCollapseFailureTax liveBranches := by
  unfold equiprobableFrontierEntropyBits deterministicCollapseFailureTax
  refine
    (Real.logb_le_iff_le_rpow
      (b := (2 : ℝ))
      (x := (liveBranches : ℝ))
      (y := ((liveBranches - 1 : Nat) : ℝ))
      (by norm_num)
      (by exact_mod_cast hLive)).2 ?_
  have hNat : liveBranches ≤ 2 ^ (liveBranches - 1) :=
    nat_le_two_pow_pred hLive
  have hRealNat : (liveBranches : ℝ) ≤ (2 : ℝ) ^ (liveBranches - 1) := by
    exact_mod_cast hNat
  simpa [Real.rpow_natCast] using hRealNat

private theorem succ_lt_two_pow_of_two_le {n : Nat}
    (hTwo : 2 ≤ n) :
    n + 1 < 2 ^ n := by
  have hStep : n + 1 < 2 * n := by
    omega
  have hPos : 0 < n := by
    omega
  have hCore : n ≤ 2 ^ (n - 1) := nat_le_two_pow_pred hPos
  have hTwice : 2 * n ≤ 2 * 2 ^ (n - 1) := by
    exact Nat.mul_le_mul_left 2 hCore
  calc
    n + 1 < 2 * n := hStep
    _ ≤ 2 * 2 ^ (n - 1) := hTwice
    _ = 2 ^ n := by
      calc
        2 * 2 ^ (n - 1) = 2 ^ (n - 1) * 2 := by rw [Nat.mul_comm]
        _ = 2 ^ ((n - 1) + 1) := by rw [Nat.pow_succ]
        _ = 2 ^ n := by rw [Nat.sub_add_cancel hPos]

private theorem frontier_entropy_bits_lt_failure_tax_of_three_le
    {liveBranches : Nat}
    (hThree : 3 ≤ liveBranches) :
    equiprobableFrontierEntropyBits liveBranches <
      deterministicCollapseFailureTax liveBranches := by
  have hLive : 0 < liveBranches := by
    omega
  have hNat :
      liveBranches < 2 ^ (liveBranches - 1) := by
    have hPredTwo : 2 ≤ liveBranches - 1 := by
      omega
    have hSucc :
        (liveBranches - 1) + 1 < 2 ^ (liveBranches - 1) :=
      succ_lt_two_pow_of_two_le hPredTwo
    calc
      liveBranches = (liveBranches - 1) + 1 := by omega
      _ < 2 ^ (liveBranches - 1) := hSucc
  unfold equiprobableFrontierEntropyBits deterministicCollapseFailureTax
  refine
    (Real.logb_lt_iff_lt_rpow
      (b := (2 : ℝ))
      (x := (liveBranches : ℝ))
      (y := ((liveBranches - 1 : Nat) : ℝ))
      (by norm_num)
      (by exact_mod_cast hLive)).2 ?_
  exact_mod_cast hNat

theorem frontier_entropy_bits_eq_failure_tax_iff
    {liveBranches : Nat}
    (hLive : 0 < liveBranches) :
    equiprobableFrontierEntropyBits liveBranches = deterministicCollapseFailureTax liveBranches ↔
      liveBranches = 1 ∨ liveBranches = 2 := by
  constructor
  · intro hEq
    by_cases hOne : liveBranches = 1
    · exact Or.inl hOne
    by_cases hTwo : liveBranches = 2
    · exact Or.inr hTwo
    have hThree : 3 ≤ liveBranches := by
      omega
    exact (False.elim <| (ne_of_lt (frontier_entropy_bits_lt_failure_tax_of_three_le hThree)) hEq)
  · rintro (rfl | rfl)
    · simp [equiprobableFrontierEntropyBits, deterministicCollapseFailureTax]
    · exact binary_failure_tax_matches_entropy_bits

theorem finite_branch_entropy_bits_le_failure_tax
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    finiteBranchEntropyBits branchLaw ≤ deterministicCollapseFailureTax (Fintype.card α) := by
  exact
    (finite_branch_entropy_bits_le_frontier_entropy_bits branchLaw).trans
      (frontier_entropy_bits_le_failure_tax
        (liveBranches := Fintype.card α)
        (Fintype.card_pos_iff.mpr inferInstance))

theorem finite_branch_entropy_bits_eq_failure_tax_iff
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α) :
    finiteBranchEntropyBits branchLaw = deterministicCollapseFailureTax (Fintype.card α) ↔
      branchLaw = PMF.uniformOfFintype α ∧
        (Fintype.card α = 1 ∨ Fintype.card α = 2) := by
  constructor
  · intro hEq
    have hFrontierLe :
        equiprobableFrontierEntropyBits (Fintype.card α) ≤ finiteBranchEntropyBits branchLaw := by
      rw [hEq]
      exact frontier_entropy_bits_le_failure_tax
        (liveBranches := Fintype.card α)
        (Fintype.card_pos_iff.mpr inferInstance)
    have hFrontierEq :
        finiteBranchEntropyBits branchLaw =
          equiprobableFrontierEntropyBits (Fintype.card α) := by
      exact le_antisymm
        (finite_branch_entropy_bits_le_frontier_entropy_bits branchLaw)
        hFrontierLe
    have hUniform :
        branchLaw = PMF.uniformOfFintype α :=
      (finite_branch_entropy_bits_eq_frontier_entropy_bits_iff branchLaw).1 hFrontierEq
    have hCard :
        Fintype.card α = 1 ∨ Fintype.card α = 2 := by
      have hFrontierTax :
          equiprobableFrontierEntropyBits (Fintype.card α) =
            deterministicCollapseFailureTax (Fintype.card α) := by
        rw [← hFrontierEq, hEq]
      exact
        (frontier_entropy_bits_eq_failure_tax_iff
          (liveBranches := Fintype.card α)
          (Fintype.card_pos_iff.mpr inferInstance)).1 hFrontierTax
    exact ⟨hUniform, hCard⟩
  · rintro ⟨hUniform, hCard⟩
    calc
      finiteBranchEntropyBits branchLaw =
          equiprobableFrontierEntropyBits (Fintype.card α) :=
            (finite_branch_entropy_bits_eq_frontier_entropy_bits_iff branchLaw).2 hUniform
      _ = deterministicCollapseFailureTax (Fintype.card α) :=
            (frontier_entropy_bits_eq_failure_tax_iff
              (liveBranches := Fintype.card α)
              (Fintype.card_pos_iff.mpr inferInstance)).2 hCard

theorem achievable_collapse_entropy_bits_le_total_cost
    {start : List BranchSnapshot}
    {cost : Nat}
    (hLive : 0 < liveBranchCount start)
    (hAchievable : CollapseCostAchievableFrom start cost) :
    equiprobableFrontierEntropyBits (liveBranchCount start) ≤ cost := by
  exact
    (frontier_entropy_bits_le_failure_tax hLive).trans
      (by exact_mod_cast (collapse_cost_achievable_lower_bound hAchievable))

theorem achievable_collapse_finite_entropy_bits_le_total_cost
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α)
    {start : List BranchSnapshot}
    {cost : Nat}
    (hCard : Fintype.card α = liveBranchCount start)
    (hAchievable : CollapseCostAchievableFrom start cost) :
    finiteBranchEntropyBits branchLaw ≤ cost := by
  calc
    finiteBranchEntropyBits branchLaw ≤ deterministicCollapseFailureTax (Fintype.card α) :=
      finite_branch_entropy_bits_le_failure_tax branchLaw
    _ = deterministicCollapseFailureTax (liveBranchCount start) := by rw [hCard]
    _ ≤ cost := by
      exact_mod_cast (collapse_cost_achievable_lower_bound hAchievable)

theorem landauer_heat_le_failure_tax_heat_budget
    {boltzmannConstant temperature : ℝ}
    (hBoltzmannNonneg : 0 ≤ boltzmannConstant)
    (hTemperatureNonneg : 0 ≤ temperature)
    {liveBranches : Nat}
    (hLive : 0 < liveBranches) :
    landauerHeatLowerBound boltzmannConstant temperature
        (equiprobableFrontierEntropyBits liveBranches) ≤
      failureTaxHeatBudget boltzmannConstant temperature liveBranches := by
  let coeff : ℝ := boltzmannConstant * temperature * Real.log 2
  have hCoeff : 0 ≤ coeff := by
    unfold coeff
    positivity
  have hBits :=
    mul_le_mul_of_nonneg_left (frontier_entropy_bits_le_failure_tax hLive) hCoeff
  simpa [landauerHeatLowerBound, failureTaxHeatBudget, coeff, mul_assoc, mul_left_comm, mul_comm]
    using hBits

theorem binary_landauer_heat_matches_failure_tax_budget
    (boltzmannConstant temperature : ℝ) :
    landauerHeatLowerBound boltzmannConstant temperature
        (equiprobableFrontierEntropyBits 2) =
      failureTaxHeatBudget boltzmannConstant temperature 2 := by
  rw [binary_failure_tax_matches_entropy_bits]
  unfold failureTaxHeatBudget
  rfl

theorem binary_landauer_heat_le_failure_tax_budget
    {boltzmannConstant temperature branchProbability : ℝ}
    (hBoltzmannNonneg : 0 ≤ boltzmannConstant)
    (hTemperatureNonneg : 0 ≤ temperature)
    (hProbabilityNonneg : 0 ≤ branchProbability)
    (hProbabilityLeOne : branchProbability ≤ 1) :
    landauerHeatLowerBound boltzmannConstant temperature
        (binaryBranchEntropyBits branchProbability) ≤
      failureTaxHeatBudget boltzmannConstant temperature 2 := by
  let coeff : ℝ := boltzmannConstant * temperature * Real.log 2
  have hCoeff : 0 ≤ coeff := by
    unfold coeff
    positivity
  have hBits :=
    mul_le_mul_of_nonneg_left
      (binary_branch_entropy_bits_le_failure_tax hProbabilityNonneg hProbabilityLeOne)
      hCoeff
  simpa [landauerHeatLowerBound, failureTaxHeatBudget, coeff, deterministicCollapseFailureTax,
    mul_assoc, mul_left_comm, mul_comm] using hBits

theorem finite_landauer_heat_le_failure_tax_budget
    {α : Type*} [Fintype α] [Nonempty α]
    {boltzmannConstant temperature : ℝ}
    (hBoltzmannNonneg : 0 ≤ boltzmannConstant)
    (hTemperatureNonneg : 0 ≤ temperature)
    (branchLaw : PMF α) :
    landauerHeatLowerBound boltzmannConstant temperature
        (finiteBranchEntropyBits branchLaw) ≤
      failureTaxHeatBudget boltzmannConstant temperature (Fintype.card α) := by
  let coeff : ℝ := boltzmannConstant * temperature * Real.log 2
  have hCoeff : 0 ≤ coeff := by
    unfold coeff
    positivity
  have hBits :=
    mul_le_mul_of_nonneg_left
      (finite_branch_entropy_bits_le_failure_tax branchLaw)
      hCoeff
  simpa [landauerHeatLowerBound, failureTaxHeatBudget, coeff, mul_assoc, mul_left_comm, mul_comm]
    using hBits

theorem binary_landauer_heat_eq_failure_tax_budget_iff
    {boltzmannConstant temperature branchProbability : ℝ}
    (hBoltzmannPos : 0 < boltzmannConstant)
    (hTemperaturePos : 0 < temperature) :
    landauerHeatLowerBound boltzmannConstant temperature
        (binaryBranchEntropyBits branchProbability) =
      failureTaxHeatBudget boltzmannConstant temperature 2 ↔
        branchProbability = (2 : ℝ)⁻¹ := by
  let coeff : ℝ := boltzmannConstant * temperature * Real.log 2
  have hCoeffPos : 0 < coeff := by
    positivity
  have hCoeffNe : coeff ≠ 0 := ne_of_gt hCoeffPos
  constructor
  · intro h
    have hBits :
        binaryBranchEntropyBits branchProbability * coeff =
          (deterministicCollapseFailureTax 2 : ℝ) * coeff := by
      simpa [coeff, landauerHeatLowerBound, failureTaxHeatBudget,
        mul_assoc, mul_left_comm, mul_comm] using h
    exact
      (binary_branch_entropy_bits_eq_failure_tax_iff (branchProbability := branchProbability)).1
        ((mul_left_inj' hCoeffNe).1 hBits)
  · intro h
    have hBits :
        binaryBranchEntropyBits branchProbability = deterministicCollapseFailureTax 2 :=
      (binary_branch_entropy_bits_eq_failure_tax_iff (branchProbability := branchProbability)).2 h
    have hMul :
        binaryBranchEntropyBits branchProbability * coeff =
          (deterministicCollapseFailureTax 2 : ℝ) * coeff := by
      exact congrArg (fun x : ℝ => x * coeff) hBits
    simpa [coeff, landauerHeatLowerBound, failureTaxHeatBudget,
      mul_assoc, mul_left_comm, mul_comm] using hMul

theorem achievable_collapse_landauer_heat_le_total_cost
    {start : List BranchSnapshot}
    {cost : Nat}
    {boltzmannConstant temperature : ℝ}
    (hBoltzmannNonneg : 0 ≤ boltzmannConstant)
    (hTemperatureNonneg : 0 ≤ temperature)
    (hLive : 0 < liveBranchCount start)
    (hAchievable : CollapseCostAchievableFrom start cost) :
    landauerHeatLowerBound boltzmannConstant temperature
        (equiprobableFrontierEntropyBits (liveBranchCount start)) ≤
      landauerHeatLowerBound boltzmannConstant temperature cost := by
  let coeff : ℝ := boltzmannConstant * temperature * Real.log 2
  have hCoeff : 0 ≤ coeff := by
    unfold coeff
    positivity
  have hCost :=
    mul_le_mul_of_nonneg_left
      (achievable_collapse_entropy_bits_le_total_cost hLive hAchievable)
      hCoeff
  simpa [landauerHeatLowerBound, coeff, mul_assoc, mul_left_comm, mul_comm] using hCost

theorem achievable_collapse_finite_entropy_landauer_heat_le_total_cost
    {α : Type*} [Fintype α] [Nonempty α]
    (branchLaw : PMF α)
    {start : List BranchSnapshot}
    {cost : Nat}
    {boltzmannConstant temperature : ℝ}
    (hBoltzmannNonneg : 0 ≤ boltzmannConstant)
    (hTemperatureNonneg : 0 ≤ temperature)
    (hCard : Fintype.card α = liveBranchCount start)
    (hAchievable : CollapseCostAchievableFrom start cost) :
    landauerHeatLowerBound boltzmannConstant temperature
        (finiteBranchEntropyBits branchLaw) ≤
      landauerHeatLowerBound boltzmannConstant temperature cost := by
  let coeff : ℝ := boltzmannConstant * temperature * Real.log 2
  have hCoeff : 0 ≤ coeff := by
    unfold coeff
    positivity
  have hCost :=
    mul_le_mul_of_nonneg_left
      (achievable_collapse_finite_entropy_bits_le_total_cost branchLaw hCard hAchievable)
      hCoeff
  simpa [landauerHeatLowerBound, coeff, mul_assoc, mul_left_comm, mul_comm] using hCost

/--
Frontier entropy equals failure tax if and only if liveBranches ≤ 2.
For n = 1: both are 0. For n = 2: both are 1 (by `frontier_entropy_bits_two`).
For n ≥ 3: entropy < tax (strict inequality from `frontier_entropy_bits_lt_failure_tax_of_three_le`).
-/
theorem frontier_entropy_bits_eq_failure_tax_iff_le_two
    {liveBranches : Nat}
    (hLive : 0 < liveBranches) :
    equiprobableFrontierEntropyBits liveBranches = deterministicCollapseFailureTax liveBranches ↔
      liveBranches ≤ 2 := by
  constructor
  · intro hEq
    have hOr := (frontier_entropy_bits_eq_failure_tax_iff hLive).1 hEq
    cases hOr with
    | inl h => omega
    | inr h => omega
  · intro hLe
    have hOr : liveBranches = 1 ∨ liveBranches = 2 := by omega
    exact (frontier_entropy_bits_eq_failure_tax_iff hLive).2 hOr

/--
For n ≥ 3, frontier entropy is strictly less than the failure tax.
This sharpens the paper: the failure-tax floor strictly dominates entropy
for all non-binary forks, so the "tax exceeds information cost" story
holds beyond the calibration point.
-/
theorem frontier_entropy_bits_lt_failure_tax_of_three_or_more
    {liveBranches : Nat}
    (hLive : 3 ≤ liveBranches) :
    equiprobableFrontierEntropyBits liveBranches <
      deterministicCollapseFailureTax liveBranches :=
  frontier_entropy_bits_lt_failure_tax_of_three_le hLive

end ForkRaceFoldTheorems
