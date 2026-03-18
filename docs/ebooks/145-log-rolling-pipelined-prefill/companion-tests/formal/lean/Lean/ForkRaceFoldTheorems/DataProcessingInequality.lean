import Mathlib
import ForkRaceFoldTheorems.LandauerBuley

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
Strict Data Processing Inequality for finite PMFs in Lean 4.

The data processing inequality states that processing (applying a function to)
a random variable can only decrease its entropy: H(f(X)) ≤ H(X). The strict
version establishes H(f(X)) < H(X) when f is non-injective on the support.

This is a well-known result in information theory (Cover & Thomas, 1991) but
has not previously been mechanized in Lean/Mathlib. The key tools are:
- Subadditivity of negMulLog over nonneg reals (proven locally)
- Strict concavity of negMulLog on [0,1] (Real.strictConcaveOn_negMulLog in Mathlib)

The conditional entropy H(X | f(X)) = H(X) - H(f(X)) measures the information
lost when observing X through f. For a many-to-one quotient, this is the
information erased by the coarsening step.
-/

/-! ### Subadditivity of negMulLog (local proof, mirroring LandauerBuley pattern) -/

/-- Non-strict subadditivity of negMulLog, reproved locally since the LandauerBuley
    version is private. Uses Real.negMulLog_mul and Real.negMulLog_nonneg. -/
private theorem negMulLog_add_le_of_nonneg_local
    {x y : ℝ}
    (hx : 0 ≤ x)
    (hy : 0 ≤ y) :
    Real.negMulLog (x + y) ≤ Real.negMulLog x + Real.negMulLog y := by
  by_cases hxy : x + y = 0
  · have hx0 : x = 0 := by linarith
    have hy0 : y = 0 := by linarith
    simp [hx0, hy0]
  · have hxyPos : 0 < x + y := lt_of_le_of_ne (add_nonneg hx hy) (Ne.symm hxy)
    have hDivXNonneg : 0 ≤ x / (x + y) := by positivity
    have hDivYNonneg : 0 ≤ y / (x + y) := by positivity
    have hDivXLeOne : x / (x + y) ≤ 1 := by rw [div_le_iff₀ hxyPos]; linarith
    have hDivYLeOne : y / (x + y) ≤ 1 := by rw [div_le_iff₀ hxyPos]; linarith
    have hDivSum : x / (x + y) + y / (x + y) = 1 := by field_simp [hxy]
    have hxMul : x = (x + y) * (x / (x + y)) := by field_simp [hxy]
    have hyMul : y = (x + y) * (y / (x + y)) := by field_simp [hxy]
    have hxEq : Real.negMulLog x =
        x / (x + y) * Real.negMulLog (x + y) +
          (x + y) * Real.negMulLog (x / (x + y)) := by
      simpa [hxMul.symm] using (Real.negMulLog_mul (x + y) (x / (x + y)))
    have hyEq : Real.negMulLog y =
        y / (x + y) * Real.negMulLog (x + y) +
          (x + y) * Real.negMulLog (y / (x + y)) := by
      simpa [hyMul.symm] using (Real.negMulLog_mul (x + y) (y / (x + y)))
    have hEq : Real.negMulLog x + Real.negMulLog y =
        Real.negMulLog (x + y) +
          (x + y) * (Real.negMulLog (x / (x + y)) + Real.negMulLog (y / (x + y))) := by
      rw [hxEq, hyEq]
      calc (x / (x + y) * Real.negMulLog (x + y) + (x + y) * Real.negMulLog (x / (x + y))) +
              (y / (x + y) * Real.negMulLog (x + y) + (x + y) * Real.negMulLog (y / (x + y))) =
            (x / (x + y) + y / (x + y)) * Real.negMulLog (x + y) +
              ((x + y) * Real.negMulLog (x / (x + y)) + (x + y) * Real.negMulLog (y / (x + y))) := by ring
        _ = Real.negMulLog (x + y) +
              (x + y) * (Real.negMulLog (x / (x + y)) + Real.negMulLog (y / (x + y))) := by
            rw [hDivSum, one_mul]; ring
    rw [hEq]
    linarith [mul_nonneg (le_of_lt hxyPos) (add_nonneg
      (Real.negMulLog_nonneg hDivXNonneg hDivXLeOne)
      (Real.negMulLog_nonneg hDivYNonneg hDivYLeOne))]

private theorem negMulLog_sum_le_sum_negMulLog_local
    {ι : Type*}
    (s : Finset ι)
    (f : ι → ℝ)
    (hf : ∀ i ∈ s, 0 ≤ f i) :
    Real.negMulLog (∑ i ∈ s, f i) ≤ ∑ i ∈ s, Real.negMulLog (f i) := by
  exact Finset.le_sum_of_subadditive_on_pred Real.negMulLog (fun x : ℝ => 0 ≤ x)
    (by simp)
    (fun x y hx hy => negMulLog_add_le_of_nonneg_local hx hy)
    (fun x y hx hy => add_nonneg hx hy) _ hf

/-- Strict subadditivity of negMulLog: for x, y > 0 with x ≤ 1 and y ≤ 1,
    negMulLog(x + y) < negMulLog(x) + negMulLog(y).

    Uses the same algebraic decomposition as negMulLog_add_le_of_nonneg_local but
    with strict positivity of the tail term, since negMulLog(t) > 0 for t ∈ (0,1)
    and both x/(x+y), y/(x+y) are in (0,1) when x, y > 0. -/
private theorem negMulLog_strict_subadditive
    {x y : ℝ}
    (hx : 0 < x) (hy : 0 < y)
    (_hxle : x ≤ 1) (_hyle : y ≤ 1) :
    Real.negMulLog (x + y) < Real.negMulLog x + Real.negMulLog y := by
  have hxyPos : 0 < x + y := by linarith
  have hxy : x + y ≠ 0 := ne_of_gt hxyPos
  have hDivXPos : 0 < x / (x + y) := by positivity
  have hDivYPos : 0 < y / (x + y) := by positivity
  have hDivXLtOne : x / (x + y) < 1 := by rw [div_lt_one hxyPos]; linarith
  have hDivYLtOne : y / (x + y) < 1 := by rw [div_lt_one hxyPos]; linarith
  have hDivSum : x / (x + y) + y / (x + y) = 1 := by field_simp [hxy]
  have hxMul : x = (x + y) * (x / (x + y)) := by field_simp [hxy]
  have hyMul : y = (x + y) * (y / (x + y)) := by field_simp [hxy]
  have hxEq : Real.negMulLog x =
      x / (x + y) * Real.negMulLog (x + y) +
        (x + y) * Real.negMulLog (x / (x + y)) := by
    simpa [hxMul.symm] using (Real.negMulLog_mul (x + y) (x / (x + y)))
  have hyEq : Real.negMulLog y =
      y / (x + y) * Real.negMulLog (x + y) +
        (x + y) * Real.negMulLog (y / (x + y)) := by
    simpa [hyMul.symm] using (Real.negMulLog_mul (x + y) (y / (x + y)))
  have hEq : Real.negMulLog x + Real.negMulLog y =
      Real.negMulLog (x + y) +
        (x + y) * (Real.negMulLog (x / (x + y)) + Real.negMulLog (y / (x + y))) := by
    rw [hxEq, hyEq]
    calc (x / (x + y) * Real.negMulLog (x + y) + (x + y) * Real.negMulLog (x / (x + y))) +
            (y / (x + y) * Real.negMulLog (x + y) + (x + y) * Real.negMulLog (y / (x + y))) =
          (x / (x + y) + y / (x + y)) * Real.negMulLog (x + y) +
            ((x + y) * Real.negMulLog (x / (x + y)) + (x + y) * Real.negMulLog (y / (x + y))) := by ring
      _ = Real.negMulLog (x + y) +
            (x + y) * (Real.negMulLog (x / (x + y)) + Real.negMulLog (y / (x + y))) := by
          rw [hDivSum, one_mul]; ring
  rw [hEq]
  -- The tail term (x+y) * (negMulLog(x/(x+y)) + negMulLog(y/(x+y))) is strictly positive
  -- because negMulLog(t) > 0 for t ∈ (0,1) (negMulLog = -t*log(t) > 0 when 0 < t < 1)
  -- and (x+y) > 0.
  have hNMLxPos : 0 < Real.negMulLog (x / (x + y)) := by
    unfold Real.negMulLog
    rw [neg_mul, neg_pos]
    apply mul_neg_of_pos_of_neg hDivXPos
    exact Real.log_neg hDivXPos hDivXLtOne
  have hNMLyPos : 0 < Real.negMulLog (y / (x + y)) := by
    unfold Real.negMulLog
    rw [neg_mul, neg_pos]
    apply mul_neg_of_pos_of_neg hDivYPos
    exact Real.log_neg hDivYPos hDivYLtOne
  linarith [mul_pos hxyPos (by linarith : 0 < Real.negMulLog (x / (x + y)) + Real.negMulLog (y / (x + y)))]

/-! ### Conditional entropy -/

/-- The information lost when observing X through f: the conditional entropy H(X | f(X)),
    equal to H(X) - H(f(X)) for finite random variables. -/
noncomputable def conditionalEntropyNats
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) : ℝ :=
  finiteBranchEntropyNats branchLaw -
    finiteBranchEntropyNats (branchLaw.map f)

private theorem map_apply_toReal_eq_sum_indicator
    {α β : Type*} [Fintype α] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) (b : β) :
    (branchLaw.map f b).toReal =
      Finset.univ.sum (fun a => if f a = b then (branchLaw a).toReal else 0) := by
  classical
  rw [PMF.map_apply, tsum_eq_sum]
  · rw [ENNReal.toReal_sum]
    · refine Finset.sum_congr rfl ?_
      intro a ha
      by_cases hab : b = f a
      · have hab' : f a = b := hab.symm
        rw [if_pos hab, if_pos hab']
      · have hab' : ¬ f a = b := by
          intro h
          exact hab h.symm
        rw [if_neg hab, if_neg hab']
        simp
    · intro a ha
      by_cases hab : b = f a <;> simp [hab, branchLaw.apply_ne_top]
  · intro a ha
    simp at ha

/-! ### Non-strict data processing inequality -/

/-- The data processing inequality: H(f(X)) ≤ H(X) for any function f.
    Processing a random variable can only decrease entropy.

    Proof: group the fine-grained entropy sum ∑_a negMulLog(p(a)) by fibers of f.
    Within each fiber, apply subadditivity of negMulLog. Sum over fibers. -/
theorem data_processing_inequality
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) :
    finiteBranchEntropyNats (branchLaw.map f) ≤ finiteBranchEntropyNats branchLaw := by
  have hSupport : ∀ a, a ∉ (Finset.univ : Finset α) → branchLaw a = 0 := by
    intro a ha
    simp at ha
  have hENN :
      observedBranchEntropyNatsENN branchLaw f ≤ countableBranchEntropyNatsENN branchLaw :=
    effective_support_observed_entropy_natsENN_le_source branchLaw f Finset.univ hSupport
  have hFinite :
      ENNReal.ofReal (finiteBranchEntropyNats (branchLaw.map f)) ≤
        ENNReal.ofReal (finiteBranchEntropyNats branchLaw) := by
    simpa [observedBranchEntropyNatsENN, countable_branch_entropy_natsENN_eq_finite] using hENN
  exact (ENNReal.ofReal_le_ofReal_iff (finite_branch_entropy_nats_nonneg branchLaw)).mp hFinite

/-! ### Non-negativity of conditional entropy -/

/-- Conditional entropy is non-negative: H(X | f(X)) ≥ 0. -/
theorem conditionalEntropyNats_nonneg
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) :
    0 ≤ conditionalEntropyNats branchLaw f := by
  unfold conditionalEntropyNats
  linarith [data_processing_inequality branchLaw f]

/-! ### Strict data processing inequality -/

/-- Strict data processing inequality: H(f(X)) < H(X) when f is non-injective on the support.

    If there exist two distinct elements a₁, a₂ with f(a₁) = f(a₂) and both having positive
    probability mass, then the entropy strictly decreases under f. The non-injective fiber
    has strictly subadditive negMulLog (from strict concavity), while all other fibers
    contribute ≤. -/
theorem strict_data_processing_inequality
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β)
    (hNonInjective : ∃ a₁ a₂, a₁ ≠ a₂ ∧ f a₁ = f a₂ ∧
      0 < branchLaw a₁ ∧ 0 < branchLaw a₂) :
    finiteBranchEntropyNats (branchLaw.map f) < finiteBranchEntropyNats branchLaw := by
  classical
  obtain ⟨a₁, a₂, hNeq, hFiber, hPos₁, hPos₂⟩ := hNonInjective
  let b0 : β := f a₁
  let rest : Finset α := ((Finset.univ : Finset α).erase a₁).erase a₂
  have hb0a1 : f a₁ = b0 := by
    rfl
  have hb0a2 : f a₂ = b0 := by
    simpa [b0] using hFiber.symm
  have hToReal₁ : 0 < (branchLaw a₁).toReal :=
    ENNReal.toReal_pos (ne_of_gt hPos₁) (ne_top_of_le_ne_top ENNReal.one_ne_top
      (PMF.coe_le_one branchLaw a₁))
  have hToReal₂ : 0 < (branchLaw a₂).toReal :=
    ENNReal.toReal_pos (ne_of_gt hPos₂) (ne_top_of_le_ne_top ENNReal.one_ne_top
      (PMF.coe_le_one branchLaw a₂))
  have hNe₁ : branchLaw a₁ ≠ ⊤ := ne_top_of_le_ne_top ENNReal.one_ne_top
      (PMF.coe_le_one branchLaw a₁)
  have hNe₂ : branchLaw a₂ ≠ ⊤ := ne_top_of_le_ne_top ENNReal.one_ne_top
      (PMF.coe_le_one branchLaw a₂)
  have hLE₁ : (branchLaw a₁).toReal ≤ 1 := by
    have h := PMF.coe_le_one branchLaw a₁
    rwa [← ENNReal.toReal_le_toReal hNe₁ ENNReal.one_ne_top, ENNReal.toReal_one] at h
  have hLE₂ : (branchLaw a₂).toReal ≤ 1 := by
    have h := PMF.coe_le_one branchLaw a₂
    rwa [← ENNReal.toReal_le_toReal hNe₂ ENNReal.one_ne_top, ENNReal.toReal_one] at h
  -- negMulLog(p₁ + p₂) < negMulLog(p₁) + negMulLog(p₂) when both > 0
  have hStrictSub : Real.negMulLog ((branchLaw a₁).toReal + (branchLaw a₂).toReal) <
      Real.negMulLog (branchLaw a₁).toReal + Real.negMulLog (branchLaw a₂).toReal :=
    negMulLog_strict_subadditive hToReal₁ hToReal₂ hLE₁ hLE₂
  have hRestNonneg :
      0 ≤ rest.sum (fun a => if f a = b0 then (branchLaw a).toReal else 0) := by
    refine Finset.sum_nonneg ?_
    intro a ha
    by_cases hab : f a = b0 <;> simp [hab, ENNReal.toReal_nonneg]
  have hRestBound :
      Real.negMulLog (rest.sum fun a => if f a = b0 then (branchLaw a).toReal else 0) ≤
        rest.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) := by
    have hNonneg : ∀ a ∈ rest, 0 ≤ (if f a = b0 then (branchLaw a).toReal else 0) := by
      intro a ha
      by_cases hab : f a = b0 <;> simp [hab, ENNReal.toReal_nonneg]
    calc
      Real.negMulLog (rest.sum fun a => if f a = b0 then (branchLaw a).toReal else 0)
          ≤ rest.sum (fun a => Real.negMulLog (if f a = b0 then (branchLaw a).toReal else 0)) :=
            negMulLog_sum_le_sum_negMulLog_local rest _ hNonneg
      _ = rest.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) := by
          refine Finset.sum_congr rfl ?_
          intro a ha
          by_cases hab : f a = b0 <;> simp [hab, Real.negMulLog]
  have hDecompMass :
      Finset.univ.sum (fun a => if f a = b0 then (branchLaw a).toReal else 0) =
        (branchLaw a₁).toReal + (branchLaw a₂).toReal +
          rest.sum (fun a => if f a = b0 then (branchLaw a).toReal else 0) := by
    rw [← Finset.add_sum_erase
      (s := (Finset.univ : Finset α))
      (a := a₁)
      (f := fun a => if f a = b0 then (branchLaw a).toReal else 0)
      (by simp)]
    rw [← Finset.add_sum_erase
      (s := ((Finset.univ : Finset α).erase a₁))
      (a := a₂)
      (f := fun a => if f a = b0 then (branchLaw a).toReal else 0)
      (by simpa using hNeq.symm)]
    simp [rest, hb0a1, hb0a2, add_assoc]
  have hDecompEntropy :
      Finset.univ.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) =
        Real.negMulLog (branchLaw a₁).toReal + Real.negMulLog (branchLaw a₂).toReal +
          rest.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) := by
    rw [← Finset.add_sum_erase
      (s := (Finset.univ : Finset α))
      (a := a₁)
      (f := fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0)
      (by simp)]
    rw [← Finset.add_sum_erase
      (s := ((Finset.univ : Finset α).erase a₁))
      (a := a₂)
      (f := fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0)
      (by simpa using hNeq.symm)]
    simp [rest, hb0a1, hb0a2, add_assoc]
  have hFiberLe : ∀ b : β,
      Real.negMulLog ((branchLaw.map f b).toReal) ≤
        Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) := by
    intro b
    rw [map_apply_toReal_eq_sum_indicator branchLaw f b]
    have hNonneg : ∀ a ∈ (Finset.univ : Finset α),
        0 ≤ if f a = b then (branchLaw a).toReal else 0 := by
      intro a ha
      by_cases hab : f a = b <;> simp [hab, ENNReal.toReal_nonneg]
    calc
      Real.negMulLog (Finset.univ.sum (fun a => if f a = b then (branchLaw a).toReal else 0))
          ≤ Finset.univ.sum (fun a => Real.negMulLog (if f a = b then (branchLaw a).toReal else 0)) :=
            negMulLog_sum_le_sum_negMulLog_local Finset.univ _ hNonneg
      _ = Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) := by
          refine Finset.sum_congr rfl ?_
          intro a ha
          by_cases hab : f a = b <;> simp [hab, Real.negMulLog]
  have hFiberStrict :
      Real.negMulLog ((branchLaw.map f b0).toReal) <
        Finset.univ.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) := by
    have hPairNonneg : 0 ≤ (branchLaw a₁).toReal + (branchLaw a₂).toReal := by
      positivity
    rw [map_apply_toReal_eq_sum_indicator branchLaw f b0, hDecompMass]
    calc
      Real.negMulLog
          ((branchLaw a₁).toReal + (branchLaw a₂).toReal +
            rest.sum (fun a => if f a = b0 then (branchLaw a).toReal else 0))
          ≤ Real.negMulLog ((branchLaw a₁).toReal + (branchLaw a₂).toReal) +
              Real.negMulLog (rest.sum fun a => if f a = b0 then (branchLaw a).toReal else 0) :=
            negMulLog_add_le_of_nonneg_local hPairNonneg hRestNonneg
      _ < (Real.negMulLog (branchLaw a₁).toReal + Real.negMulLog (branchLaw a₂).toReal) +
            Real.negMulLog (rest.sum fun a => if f a = b0 then (branchLaw a).toReal else 0) := by
          linarith
      _ ≤ (Real.negMulLog (branchLaw a₁).toReal + Real.negMulLog (branchLaw a₂).toReal) +
            rest.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) := by
          gcongr
      _ = Finset.univ.sum (fun a => if f a = b0 then Real.negMulLog (branchLaw a).toReal else 0) := by
          rw [hDecompEntropy]
  have hOuterStrict :
      ∑ b : β, Real.negMulLog ((branchLaw.map f b).toReal) <
        ∑ b : β, Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) := by
    have hb0 : b0 ∈ (Finset.univ : Finset β) := by
      simp [b0]
    rw [← Finset.add_sum_erase
      (s := (Finset.univ : Finset β))
      (a := b0)
      (f := fun b => Real.negMulLog ((branchLaw.map f b).toReal))
      hb0]
    rw [← Finset.add_sum_erase
      (s := (Finset.univ : Finset β))
      (a := b0)
      (f := fun b => Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0))
      hb0]
    exact add_lt_add_of_lt_of_le hFiberStrict (Finset.sum_le_sum fun b hb => hFiberLe b)
  calc
    finiteBranchEntropyNats (branchLaw.map f)
        = ∑ b : β, Real.negMulLog ((branchLaw.map f b).toReal) := by
          rfl
    _ < ∑ b : β, Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) :=
          hOuterStrict
    _ = ∑ a : α, Real.negMulLog (branchLaw a).toReal := by
          rw [Finset.sum_comm]
          refine Finset.sum_congr rfl ?_
          intro a ha
          simp
    _ = finiteBranchEntropyNats branchLaw := by
          rfl

/-- Conditional entropy is strictly positive when f is non-injective on the support. -/
theorem conditionalEntropyNats_pos_of_nonInjective
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β)
    (hNonInjective : ∃ a₁ a₂, a₁ ≠ a₂ ∧ f a₁ = f a₂ ∧
      0 < branchLaw a₁ ∧ 0 < branchLaw a₂) :
    0 < conditionalEntropyNats branchLaw f := by
  unfold conditionalEntropyNats
  linarith [strict_data_processing_inequality branchLaw f hNonInjective]

/-- Conditional entropy is zero if and only if f is injective on the support of branchLaw. -/
theorem conditionalEntropyNats_eq_zero_iff_injective_on_support
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) :
    conditionalEntropyNats branchLaw f = 0 ↔ Set.InjOn f (PMF.support branchLaw) := by
  classical
  constructor
  · -- If H(X|f(X)) = 0 then f is injective on the support
    intro hZero
    by_contra hNotInj
    rw [Set.InjOn] at hNotInj
    push_neg at hNotInj
    obtain ⟨a₁, ha₁, a₂, ha₂, hfEq, hNeq⟩ := hNotInj
    have hPos := conditionalEntropyNats_pos_of_nonInjective branchLaw f
      ⟨a₁, a₂, hNeq, hfEq,
        by exact pos_iff_ne_zero.mpr ((PMF.mem_support_iff _ _).mp ha₁),
        by exact pos_iff_ne_zero.mpr ((PMF.mem_support_iff _ _).mp ha₂)⟩
    linarith
  · -- If f is injective on the support then H(X|f(X)) = 0
    -- When f is injective on support, each fiber has at most one element with
    -- positive mass, so the pushforward entropy equals the fine entropy.
    intro hInj
    unfold conditionalEntropyNats
    suffices h : finiteBranchEntropyNats branchLaw =
        finiteBranchEntropyNats (branchLaw.map f) by linarith
    have hFiberEq : ∀ b : β,
        Real.negMulLog ((branchLaw.map f b).toReal) =
          Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) := by
      intro b
      by_cases hb : ∃ a, f a = b ∧ branchLaw a ≠ 0
      · obtain ⟨a0, ha0, hMass0⟩ := hb
        have hMap0 : (branchLaw.map f b).toReal = (branchLaw a0).toReal := by
          rw [map_apply_toReal_eq_sum_indicator branchLaw f b]
          calc
            Finset.univ.sum (fun a => if f a = b then (branchLaw a).toReal else 0)
                = Finset.univ.sum (fun a => if a = a0 then (branchLaw a0).toReal else 0) := by
                    refine Finset.sum_congr rfl ?_
                    intro a ha
                    by_cases hEq : a = a0
                    · simp [hEq, ha0]
                    · by_cases hab : f a = b
                      · have hMass : branchLaw a = 0 := by
                          by_contra hMass
                          have haSupport : a ∈ PMF.support branchLaw :=
                            (PMF.mem_support_iff _ _).2 hMass
                          have ha0Support : a0 ∈ PMF.support branchLaw :=
                            (PMF.mem_support_iff _ _).2 hMass0
                          exact hEq (hInj haSupport ha0Support (by simpa [ha0] using hab))
                        simp [hEq, hab, hMass]
                      · simp [hEq, hab]
            _ = (branchLaw a0).toReal := by
                simp
        rw [hMap0]
        calc
          Real.negMulLog (branchLaw a0).toReal
              = Finset.univ.sum (fun a => if a = a0 then Real.negMulLog (branchLaw a0).toReal else 0) := by
                  simp
          _ = Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) := by
              refine Finset.sum_congr rfl ?_
              intro a ha
              by_cases hEq : a = a0
              · simp [hEq, ha0]
              · by_cases hab : f a = b
                · have hMass : branchLaw a = 0 := by
                    by_contra hMass
                    have haSupport : a ∈ PMF.support branchLaw :=
                      (PMF.mem_support_iff _ _).2 hMass
                    have ha0Support : a0 ∈ PMF.support branchLaw :=
                      (PMF.mem_support_iff _ _).2 hMass0
                    exact hEq (hInj haSupport ha0Support (by simpa [ha0] using hab))
                  simp [hEq, hab, hMass]
                · simp [hEq, hab]
      · calc
          Real.negMulLog ((branchLaw.map f b).toReal) = 0 := by
              rw [map_apply_toReal_eq_sum_indicator branchLaw f b]
              have : Finset.univ.sum (fun a => if f a = b then (branchLaw a).toReal else 0) = 0 := by
                refine Finset.sum_eq_zero ?_
                intro a ha
                by_cases hab : f a = b
                · have hMass : branchLaw a = 0 := by
                    by_contra hMass
                    exact hb ⟨a, hab, hMass⟩
                  simp [hab, hMass]
                · simp [hab]
              rw [this]
              simp
          _ = Finset.univ.sum (fun a => if f a = b then Real.negMulLog (branchLaw a).toReal else 0) := by
              symm
              refine Finset.sum_eq_zero ?_
              intro a ha
              by_cases hab : f a = b
              · have hMass : branchLaw a = 0 := by
                  by_contra hMass
                  exact hb ⟨a, hab, hMass⟩
                simp [hab, hMass]
              · simp [hab]
    calc
      finiteBranchEntropyNats branchLaw = ∑ a : α, Real.negMulLog (branchLaw a).toReal := by
          rfl
      _ = Finset.univ.sum (fun a => Finset.univ.sum (fun b => if f a = b then Real.negMulLog (branchLaw a).toReal else 0)) := by
          refine Finset.sum_congr rfl ?_
          intro a ha
          simp
      _ = ∑ b : β, Real.negMulLog ((branchLaw.map f b).toReal) := by
          rw [Finset.sum_comm]
          refine Finset.sum_congr rfl ?_
          intro b hb
          symm
          exact hFiberEq b
      _ = finiteBranchEntropyNats (branchLaw.map f) := by
          rfl

/-! ### Chain rule for conditional entropy -/

/-- Chain rule: H(X | g∘f(X)) = H(X | f(X)) + H(f(X) | g(f(X))).
    Information loss is additive under composition. -/
theorem conditionalEntropyNats_comp
    {α β γ : Type*} [Fintype α] [Fintype β] [Fintype γ]
    [DecidableEq β] [DecidableEq γ]
    (branchLaw : PMF α) (f : α → β) (g : β → γ) :
    conditionalEntropyNats branchLaw (g ∘ f) =
      conditionalEntropyNats branchLaw f +
        conditionalEntropyNats (branchLaw.map f) g := by
  unfold conditionalEntropyNats
  -- H(X) - H(g(f(X))) = (H(X) - H(f(X))) + (H(f(X)) - H(g(f(X))))
  -- Telescoping: a - c = (a - b) + (b - c)
  -- map (g ∘ f) = (map f).map g is a standard PMF identity
  have hMapComp : finiteBranchEntropyNats (branchLaw.map (g ∘ f)) =
      finiteBranchEntropyNats ((branchLaw.map f).map g) := by
    congr 1; exact (PMF.map_comp f branchLaw g).symm
  rw [hMapComp]
  ring

/-! ### ENNReal lifts -/

/-- ENNReal version of conditional entropy for the effective-support shell. -/
noncomputable def conditionalEntropyNatsENN
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) : ℝ≥0∞ :=
  ENNReal.ofReal (conditionalEntropyNats branchLaw f)

/-- ENNReal conditional entropy is non-negative (trivially, since ENNReal ≥ 0). -/
theorem conditionalEntropyNatsENN_nonneg
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) :
    0 ≤ conditionalEntropyNatsENN branchLaw f := by
  exact zero_le _

/-- ENNReal conditional entropy is positive when f is non-injective on support. -/
theorem conditionalEntropyNatsENN_pos_of_nonInjective
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β)
    (hNonInjective : ∃ a₁ a₂, a₁ ≠ a₂ ∧ f a₁ = f a₂ ∧
      0 < branchLaw a₁ ∧ 0 < branchLaw a₂) :
    0 < conditionalEntropyNatsENN branchLaw f := by
  unfold conditionalEntropyNatsENN
  exact ENNReal.ofReal_pos.mpr (conditionalEntropyNats_pos_of_nonInjective branchLaw f hNonInjective)

end ForkRaceFoldTheorems
