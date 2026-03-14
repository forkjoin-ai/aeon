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

/-! ### Non-strict data processing inequality -/

/-- The data processing inequality: H(f(X)) ≤ H(X) for any function f.
    Processing a random variable can only decrease entropy.

    Proof: group the fine-grained entropy sum ∑_a negMulLog(p(a)) by fibers of f.
    Within each fiber, apply subadditivity of negMulLog. Sum over fibers. -/
theorem data_processing_inequality
    {α β : Type*} [Fintype α] [Fintype β] [DecidableEq β]
    (branchLaw : PMF α) (f : α → β) :
    finiteBranchEntropyNats (branchLaw.map f) ≤ finiteBranchEntropyNats branchLaw := by
  unfold finiteBranchEntropyNats
  -- Rewrite the pushforward probability using PMF.map
  have hMap : ∀ b : β, (branchLaw.map f b).toReal =
      ∑ a : α, if f a = b then (branchLaw a).toReal else 0 := by
    intro b
    simp only [PMF.map_apply, Set.indicator_apply, Set.mem_preimage, Set.mem_singleton_iff]
    rw [ENNReal.toReal_sum (fun a _ => ne_top_of_le_ne_top ENNReal.one_ne_top
      (PMF.coe_le_one branchLaw a))]
    congr 1; ext a; split_ifs <;> simp
  -- Key: ∑_b negMulLog(∑_{a∈f⁻¹(b)} p(a)) ≤ ∑_b ∑_{a∈f⁻¹(b)} negMulLog(p(a))
  -- and the RHS equals ∑_a negMulLog(p(a)) after reindexing.
  calc ∑ b : β, Real.negMulLog ((branchLaw.map f) b).toReal
      = ∑ b : β, Real.negMulLog (∑ a : α, if f a = b then (branchLaw a).toReal else 0) := by
        congr 1; ext b; congr 1; exact hMap b
    _ ≤ ∑ b : β, ∑ a : α, if f a = b then Real.negMulLog (branchLaw a).toReal else 0 := by
        apply Finset.sum_le_sum
        intro b _
        have hNonneg : ∀ a ∈ Finset.univ, 0 ≤ if f a = b then (branchLaw a).toReal else 0 := by
          intro a _; split_ifs <;> simp [ENNReal.toReal_nonneg]
        calc Real.negMulLog (∑ a : α, if f a = b then (branchLaw a).toReal else 0)
            ≤ ∑ a : α, Real.negMulLog (if f a = b then (branchLaw a).toReal else 0) :=
              negMulLog_sum_le_sum_negMulLog_local Finset.univ _ hNonneg
          _ = ∑ a : α, if f a = b then Real.negMulLog (branchLaw a).toReal else 0 := by
              congr 1; ext a; split_ifs with h
              · rfl
              · simp [Real.negMulLog]
    _ = ∑ a : α, Real.negMulLog (branchLaw a).toReal := by
        rw [Finset.sum_comm]
        congr 1; ext a
        simp [Finset.sum_ite_eq']

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
  obtain ⟨a₁, a₂, hNeq, hFiber, hPos₁, hPos₂⟩ := hNonInjective
  have hDPI := data_processing_inequality branchLaw f
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
  -- Strategy: show ∑_b negMulLog(pushforward b) < ∑_b ∑_{a:f(a)=b} negMulLog(p(a))
  -- using Finset.sum_lt_sum: non-strict on all fibers, strict on the fiber at f(a₁).
  -- Then the RHS equals ∑_a negMulLog(p(a)) by reindexing.
  unfold finiteBranchEntropyNats
  -- Step 1: Rewrite the pushforward sum using the fiber decomposition
  have hMap : ∀ b : β, (branchLaw.map f b).toReal =
      ∑ a : α, if f a = b then (branchLaw a).toReal else 0 := by
    intro b
    simp only [PMF.map_apply, Set.indicator_apply, Set.mem_preimage, Set.mem_singleton_iff]
    rw [ENNReal.toReal_sum (fun a _ => ne_top_of_le_ne_top ENNReal.one_ne_top
      (PMF.coe_le_one branchLaw a))]
    congr 1; ext a; split_ifs <;> simp
  -- Step 2: The fine-grained sum equals ∑_b ∑_a (if f a = b then negMulLog(p(a)) else 0)
  have hFineReindex : ∑ a : α, Real.negMulLog (branchLaw a).toReal =
      ∑ b : β, ∑ a : α, if f a = b then Real.negMulLog (branchLaw a).toReal else 0 := by
    rw [Finset.sum_comm]
    congr 1; ext a
    simp only [Finset.sum_ite_eq', Finset.mem_univ, ite_true]
  rw [hFineReindex]
  -- Step 3: Apply Finset.sum_lt_sum — non-strict ≤ on all fibers, strict < on fiber at f(a₁)
  apply Finset.sum_lt_sum
  · -- Non-strict: for every b, negMulLog(∑ p(a)) ≤ ∑ negMulLog(p(a))
    intro b _
    have hNonneg : ∀ a ∈ Finset.univ,
        0 ≤ if f a = b then (branchLaw a).toReal else 0 := by
      intro a _; split_ifs <;> simp [ENNReal.toReal_nonneg]
    calc Real.negMulLog ((branchLaw.map f b).toReal)
        = Real.negMulLog (∑ a : α, if f a = b then (branchLaw a).toReal else 0) := by
          congr 1; exact hMap b
      _ ≤ ∑ a : α, Real.negMulLog (if f a = b then (branchLaw a).toReal else 0) :=
          negMulLog_sum_le_sum_negMulLog_local Finset.univ _ hNonneg
      _ = ∑ a : α, if f a = b then Real.negMulLog (branchLaw a).toReal else 0 := by
          congr 1; ext a; split_ifs with h
          · rfl
          · simp [Real.negMulLog]
  · -- Strict: at b₀ = f(a₁), the fiber contains a₁ and a₂ with positive mass
    refine ⟨f a₁, Finset.mem_univ _, ?_⟩
    have hNonneg : ∀ a ∈ Finset.univ,
        0 ≤ if f a = f a₁ then (branchLaw a).toReal else 0 := by
      intro a _; split_ifs <;> simp [ENNReal.toReal_nonneg]
    -- The pushforward mass at f(a₁) is ∑_{a: f(a)=f(a₁)} p(a) ≥ p(a₁) + p(a₂)
    -- and the fiber has at least two positive elements, giving strict subadditivity.
    -- Non-strict bound first
    have hLe : Real.negMulLog ((branchLaw.map f (f a₁)).toReal) ≤
        ∑ a : α, if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by
      calc Real.negMulLog ((branchLaw.map f (f a₁)).toReal)
          = Real.negMulLog (∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0) := by
            congr 1; exact hMap (f a₁)
        _ ≤ ∑ a : α, Real.negMulLog (if f a = f a₁ then (branchLaw a).toReal else 0) :=
            negMulLog_sum_le_sum_negMulLog_local Finset.univ _ hNonneg
        _ = ∑ a : α, if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by
            congr 1; ext a; split_ifs with h
            · rfl
            · simp [Real.negMulLog]
    -- Now show strict: the fiber sum includes p(a₁) + p(a₂) with both > 0
    -- The pushforward mass ≥ p(a₁) + p(a₂), and negMulLog is strictly subadditive
    -- on positive terms. We show the inequality is strict by exhibiting the gap.
    -- We prove strict inequality by contradiction: if equality held, then negMulLog
    -- would be additive on the fiber, but we know it's strictly subadditive since
    -- the fiber has ≥ 2 positive elements.
    lt_of_le_of_ne hLe (by
      intro hEq
      -- If equality holds in the fiber decomposition, then negMulLog is additive,
      -- which contradicts strict subadditivity for the pair (a₁, a₂).
      -- The fiber sum = negMulLog(p(a₁)) + negMulLog(p(a₂)) + rest
      -- But negMulLog(p(a₁) + p(a₂) + rest) = negMulLog(p(a₁)) + negMulLog(p(a₂)) + negMulLog(rest)
      -- contradicts negMulLog(p(a₁) + p(a₂)) < negMulLog(p(a₁)) + negMulLog(p(a₂))
      -- More precisely: from the non-strict DPI proof pattern and equality,
      -- negMulLog(pushforward at f(a₁)) = ∑_{a in fiber} negMulLog(p(a))
      -- But pushforward at f(a₁) = ∑_{a in fiber} p(a) ≥ p(a₁) + p(a₂)
      -- and the non-strict subadditivity gives ≤, so equality requires each
      -- sub-decomposition to also be exact. But negMulLog(p(a₁) + p(a₂)) <
      -- negMulLog(p(a₁)) + negMulLog(p(a₂)) since both are positive and ≤ 1.
      -- This gives a contradiction.
      --
      -- Concretely: from hEq we get
      --   negMulLog(∑_{a:f(a)=b₀} p(a)) = ∑_{a:f(a)=b₀} negMulLog(p(a))
      -- The LHS ≤ negMulLog(p(a₁)) + negMulLog(p(a₂)) + ∑_{a≠a₁,a≠a₂,f(a)=b₀} negMulLog(p(a))
      -- by subadditivity applied to extract a₁ and a₂. But the LHS also ≤
      -- negMulLog(p(a₁) + p(a₂)) + ∑_{a≠a₁,a≠a₂,f(a)=b₀} negMulLog(p(a))
      -- by subadditivity splitting the fiber sum as (p(a₁)+p(a₂)) + rest.
      -- And negMulLog(p(a₁)+p(a₂)) < negMulLog(p(a₁)) + negMulLog(p(a₂)) = hStrictSub.
      -- So the LHS < RHS, contradicting hEq.
      --
      -- We prove this by showing the LHS < RHS directly.
      have hMapVal : (branchLaw.map f (f a₁)).toReal =
          ∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0 := hMap (f a₁)
      -- The sum includes p(a₁) and p(a₂) as positive terms
      have hSumGe : (branchLaw a₁).toReal + (branchLaw a₂).toReal ≤
          ∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0 := by
        calc (branchLaw a₁).toReal + (branchLaw a₂).toReal
            ≤ (if f a₁ = f a₁ then (branchLaw a₁).toReal else 0) +
              (if f a₂ = f a₁ then (branchLaw a₂).toReal else 0) := by
                simp [hFiber]
          _ ≤ ∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0 := by
                have : {a₁, a₂} ⊆ Finset.univ := Finset.subset_univ _
                calc (if f a₁ = f a₁ then (branchLaw a₁).toReal else 0) +
                      (if f a₂ = f a₁ then (branchLaw a₂).toReal else 0)
                    = ∑ a ∈ ({a₁, a₂} : Finset α),
                        if f a = f a₁ then (branchLaw a).toReal else 0 := by
                      rw [Finset.sum_pair hNeq]
                  _ ≤ ∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0 :=
                      Finset.sum_le_sum_of_subset_of_nonneg this (fun a _ _ => by
                        split_ifs <;> simp [ENNReal.toReal_nonneg])
      -- Now: negMulLog(pushforward) ≤ negMulLog(p(a₁) + p(a₂)) + rest by subadditivity
      -- (splitting the sum as (p(a₁) + p(a₂)) + rest), and the RHS of hEq includes
      -- negMulLog(p(a₁)) + negMulLog(p(a₂)) + same rest. Since
      -- negMulLog(p(a₁) + p(a₂)) < negMulLog(p(a₁)) + negMulLog(p(a₂)),
      -- we get LHS < RHS, contradicting hEq.
      -- However, this argument is complex to formalize directly. Instead, use:
      -- From data_processing_inequality we have LHS ≤ RHS (summing over all b).
      -- If the b₀ fiber has equality, then the total also has equality
      -- (since all other fibers have ≤). But we showed strict inequality for the total
      -- cannot hold... wait, we're trying to prove the strict inequality.
      -- Let's use a different approach: just show LHS > RHS leads to contradiction of hEq.
      -- Actually, the cleaner approach: from the proof of data_processing_inequality,
      -- every fiber has ≤. If ALL fibers had =, then the total would have =.
      -- But the total has < (which is what we're trying to prove). Circular.
      --
      -- Better approach: directly show negMulLog(fiber sum) < sum negMulLog in fiber
      -- using the fact that the fiber contains two distinct positive terms.
      --
      -- We have: fiber_sum := ∑_{a:f(a)=b₀} p(a)
      -- RHS_fiber := ∑_{a:f(a)=b₀} negMulLog(p(a))
      -- LHS_fiber := negMulLog(fiber_sum)
      -- From non-strict subadditivity: LHS_fiber ≤ RHS_fiber
      -- The equality in hEq says LHS_fiber = RHS_fiber
      -- But we need to show this can't happen when the fiber has ≥ 2 positive terms.
      --
      -- This follows from strict concavity of negMulLog:
      -- For any finite sum with ≥ 2 positive terms ≤ 1, negMulLog is strictly subadditive.
      -- We already proved this for exactly 2 terms (negMulLog_strict_subadditive).
      -- For general finite sums: negMulLog(a + b + rest) ≤ negMulLog(a+b) + negMulLog(rest)
      -- < negMulLog(a) + negMulLog(b) + negMulLog(rest) ≤ ∑ negMulLog.
      -- So LHS_fiber < RHS_fiber, contradicting hEq.
      --
      -- Let's formalize: extract the a₁ and a₂ contributions from the fiber sum.
      linarith [show Real.negMulLog (∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0) <
          ∑ a : α, if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 from by
        -- Split the sum at a₂: the conditional sum includes a₂ with positive mass,
        -- and the rest includes a₁ with positive mass. Strict subadditivity applies.
        -- We use: for the fiber at b₀ = f(a₁), the summands include a₁ and a₂
        -- with positive mass in the same fiber. The function negMulLog is strictly
        -- subadditive on ≥ 2 positive summands (each ≤ 1).
        --
        -- Approach: group the fiber sum as p(a₁) + (rest including a₂).
        -- rest ≥ p(a₂) > 0. p(a₁) > 0. Both ≤ 1 since they are PMF probabilities.
        -- So negMulLog(p(a₁) + rest) < negMulLog(p(a₁)) + negMulLog(rest)
        -- ≤ negMulLog(p(a₁)) + ∑_{a≠a₁,f(a)=b₀} negMulLog(p(a))
        -- = ∑_{a:f(a)=b₀} negMulLog(p(a)).
        --
        -- And negMulLog(fiber_sum) ≤ negMulLog(p(a₁) + rest) = negMulLog(fiber_sum) trivially.
        -- So negMulLog(fiber_sum) < ∑_{f(a)=b₀} negMulLog(p(a)).
        --
        -- Now formalize using Finset manipulations:
        -- fiber_sum = (if f a₁ = f a₁ then p(a₁) else 0) + ∑_{a≠a₁} (if f a = f a₁ then p(a) else 0)
        -- = p(a₁) + rest_sum
        -- rest_sum ≥ (if f a₂ = f a₁ then p(a₂) else 0) = p(a₂) > 0
        -- p(a₁) > 0, p(a₁) ≤ 1
        -- rest_sum ≤ ∑_a p(a) = 1 (PMF)
        have hSplit : ∑ a : α, if f a = f a₁ then (branchLaw a).toReal else 0 =
            (branchLaw a₁).toReal +
              ∑ a ∈ Finset.univ.erase a₁, if f a = f a₁ then (branchLaw a).toReal else 0 := by
          rw [← Finset.add_sum_erase Finset.univ _ (Finset.mem_univ a₁)]
          simp
        have hRestNonneg : ∀ a ∈ Finset.univ.erase a₁,
            0 ≤ if f a = f a₁ then (branchLaw a).toReal else 0 := by
          intro a _; split_ifs <;> simp [ENNReal.toReal_nonneg]
        have hRestContainsA₂ : a₂ ∈ Finset.univ.erase a₁ := by
          simp [Finset.mem_erase, hNeq.symm]
        have hRestGeA₂ :
            (branchLaw a₂).toReal ≤
              ∑ a ∈ Finset.univ.erase a₁, if f a = f a₁ then (branchLaw a).toReal else 0 := by
          calc (branchLaw a₂).toReal
              = if f a₂ = f a₁ then (branchLaw a₂).toReal else 0 := by simp [hFiber]
            _ ≤ ∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then (branchLaw a).toReal else 0 :=
                Finset.single_le_sum hRestNonneg hRestContainsA₂
        have hRestPos : 0 < ∑ a ∈ Finset.univ.erase a₁,
            if f a = f a₁ then (branchLaw a).toReal else 0 :=
          lt_of_lt_of_le hToReal₂ hRestGeA₂
        have hRestLe1 : ∑ a ∈ Finset.univ.erase a₁,
            if f a = f a₁ then (branchLaw a).toReal else 0 ≤ 1 := by
          calc ∑ a ∈ Finset.univ.erase a₁,
                if f a = f a₁ then (branchLaw a).toReal else 0
              ≤ ∑ a ∈ Finset.univ.erase a₁, (branchLaw a).toReal := by
                apply Finset.sum_le_sum
                intro a _
                split_ifs with h
                · exact le_refl _
                · exact ENNReal.toReal_nonneg
            _ ≤ ∑ a : α, (branchLaw a).toReal := by
                apply Finset.sum_le_sum_of_subset_of_nonneg (Finset.erase_subset _ _)
                intro a _ _; exact ENNReal.toReal_nonneg
            _ = 1 := by
                rw [← ENNReal.toReal_sum (fun a _ => ne_top_of_le_ne_top ENNReal.one_ne_top
                  (PMF.coe_le_one branchLaw a))]
                simp [PMF.tsum_coe]
        -- Now: negMulLog(p(a₁) + rest) < negMulLog(p(a₁)) + negMulLog(rest)
        have hStrictSub2 :
            Real.negMulLog ((branchLaw a₁).toReal +
              ∑ a ∈ Finset.univ.erase a₁, if f a = f a₁ then (branchLaw a).toReal else 0) <
            Real.negMulLog (branchLaw a₁).toReal +
              Real.negMulLog (∑ a ∈ Finset.univ.erase a₁,
                if f a = f a₁ then (branchLaw a).toReal else 0) :=
          negMulLog_strict_subadditive hToReal₁ hRestPos hLE₁ hRestLe1
        -- And negMulLog(rest) ≤ ∑_{a≠a₁, f(a)=b₀} negMulLog(p(a)) by non-strict subadditivity
        have hRestSubadd :
            Real.negMulLog (∑ a ∈ Finset.univ.erase a₁,
              if f a = f a₁ then (branchLaw a).toReal else 0) ≤
            ∑ a ∈ Finset.univ.erase a₁,
              if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by
          calc Real.negMulLog (∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then (branchLaw a).toReal else 0)
              ≤ ∑ a ∈ Finset.univ.erase a₁,
                  Real.negMulLog (if f a = f a₁ then (branchLaw a).toReal else 0) :=
                negMulLog_sum_le_sum_negMulLog_local _ _ hRestNonneg
            _ = ∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by
                congr 1; ext a; split_ifs <;> simp [Real.negMulLog]
        -- Combine: LHS = negMulLog(p(a₁) + rest) < negMulLog(p(a₁)) + negMulLog(rest)
        --   ≤ negMulLog(p(a₁)) + ∑_{a≠a₁} negMulLog(p(a))
        --   = ∑_a negMulLog(p(a))
        rw [hSplit]
        calc Real.negMulLog ((branchLaw a₁).toReal +
                ∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then (branchLaw a).toReal else 0)
            < Real.negMulLog (branchLaw a₁).toReal +
                Real.negMulLog (∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then (branchLaw a).toReal else 0) := hStrictSub2
          _ ≤ Real.negMulLog (branchLaw a₁).toReal +
                ∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by
              linarith [hRestSubadd]
          _ = (if f a₁ = f a₁ then Real.negMulLog (branchLaw a₁).toReal else 0) +
                ∑ a ∈ Finset.univ.erase a₁,
                  if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by simp
          _ = ∑ a : α, if f a = f a₁ then Real.negMulLog (branchLaw a).toReal else 0 := by
              rw [← Finset.add_sum_erase Finset.univ _ (Finset.mem_univ a₁)]
      ])

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
    -- Show ∑_a negMulLog(p(a)) = ∑_b negMulLog(pushforward(b))
    -- by reindexing through the fiber decomposition.
    unfold finiteBranchEntropyNats
    -- Rewrite pushforward probabilities
    have hMap : ∀ b : β, (branchLaw.map f b).toReal =
        ∑ a : α, if f a = b then (branchLaw a).toReal else 0 := by
      intro b
      simp only [PMF.map_apply, Set.indicator_apply, Set.mem_preimage, Set.mem_singleton_iff]
      rw [ENNReal.toReal_sum (fun a _ => ne_top_of_le_ne_top ENNReal.one_ne_top
        (PMF.coe_le_one branchLaw a))]
      congr 1; ext a; split_ifs <;> simp
    -- The fine sum equals ∑_b ∑_{a:f(a)=b} negMulLog(p(a))
    have hFineReindex : ∑ a : α, Real.negMulLog (branchLaw a).toReal =
        ∑ b : β, ∑ a : α, if f a = b then Real.negMulLog (branchLaw a).toReal else 0 := by
      rw [Finset.sum_comm]
      congr 1; ext a
      simp only [Finset.sum_ite_eq', Finset.mem_univ, ite_true]
    rw [hFineReindex]
    -- Show each fiber contributes equally to both sides
    congr 1; ext b
    -- In the fiber at b: negMulLog(∑_{f(a)=b} p(a)) = ∑_{f(a)=b} negMulLog(p(a))
    -- because injectivity on support means at most one a in the fiber has p(a) > 0.
    -- All other terms are p(a) = 0, contributing negMulLog(0) = 0 to the RHS
    -- and 0 to the conditional sum.
    rw [show (branchLaw.map f b).toReal =
        ∑ a : α, if f a = b then (branchLaw a).toReal else 0 from hMap b]
    -- Case split: is there any supported element in the fiber?
    by_cases hExists : ∃ a₀, f a₀ = b ∧ a₀ ∈ PMF.support branchLaw
    · -- There is a supported element a₀ in the fiber
      obtain ⟨a₀, hfa₀, ha₀supp⟩ := hExists
      -- By injectivity on support, a₀ is the unique supported element in the fiber
      have hUnique : ∀ a, f a = b → a ∈ PMF.support branchLaw → a = a₀ := by
        intro a hfa hasupp
        exact hInj hasupp ha₀supp (hfa.trans hfa₀.symm)
      -- Every other a in the fiber with f a = b has p(a) = 0 (not in support)
      have hZeroOther : ∀ a, a ≠ a₀ → f a = b → (branchLaw a).toReal = 0 := by
        intro a hne hfa
        by_contra hpos
        have hasupp : a ∈ PMF.support branchLaw := by
          rw [PMF.mem_support_iff]
          intro heq
          exact hpos (by simp [heq])
        exact hne (hUnique a hfa hasupp)
      -- The conditional sum reduces to p(a₀)
      have hSumEq : ∑ a : α, if f a = b then (branchLaw a).toReal else 0 =
          (branchLaw a₀).toReal := by
        calc ∑ a : α, if f a = b then (branchLaw a).toReal else 0
            = (if f a₀ = b then (branchLaw a₀).toReal else 0) +
                ∑ a ∈ Finset.univ.erase a₀,
                  if f a = b then (branchLaw a).toReal else 0 := by
              rw [← Finset.add_sum_erase Finset.univ _ (Finset.mem_univ a₀)]; simp
          _ = (branchLaw a₀).toReal + 0 := by
              constructor
              · simp [hfa₀]
              · apply Finset.sum_eq_zero
                intro a ha
                simp [Finset.mem_erase] at ha
                split_ifs with hfa
                · exact hZeroOther a ha.1 hfa
                · rfl
          _ = (branchLaw a₀).toReal := by ring
      -- Similarly, the negMulLog sum reduces to negMulLog(p(a₀))
      have hNMLSumEq : ∑ a : α,
          if f a = b then Real.negMulLog (branchLaw a).toReal else 0 =
          Real.negMulLog (branchLaw a₀).toReal := by
        calc ∑ a : α, if f a = b then Real.negMulLog (branchLaw a).toReal else 0
            = (if f a₀ = b then Real.negMulLog (branchLaw a₀).toReal else 0) +
                ∑ a ∈ Finset.univ.erase a₀,
                  if f a = b then Real.negMulLog (branchLaw a).toReal else 0 := by
              rw [← Finset.add_sum_erase Finset.univ _ (Finset.mem_univ a₀)]; simp
          _ = Real.negMulLog (branchLaw a₀).toReal + 0 := by
              constructor
              · simp [hfa₀]
              · apply Finset.sum_eq_zero
                intro a ha
                simp [Finset.mem_erase] at ha
                split_ifs with hfa
                · rw [hZeroOther a ha.1 hfa]; simp [Real.negMulLog]
                · rfl
          _ = Real.negMulLog (branchLaw a₀).toReal := by ring
      rw [hSumEq, hNMLSumEq]
    · -- No supported element in the fiber: all p(a) = 0 for f a = b
      push_neg at hExists
      have hAllZero : ∀ a, f a = b → (branchLaw a).toReal = 0 := by
        intro a hfa
        by_contra hpos
        have hasupp : a ∈ PMF.support branchLaw := by
          rw [PMF.mem_support_iff]
          intro heq
          exact hpos (by simp [heq])
        exact (hExists a hfa) hasupp
      have hSumZero : ∑ a : α, if f a = b then (branchLaw a).toReal else 0 = 0 := by
        apply Finset.sum_eq_zero
        intro a _
        split_ifs with hfa
        · exact hAllZero a hfa
        · rfl
      have hNMLSumZero : ∑ a : α,
          if f a = b then Real.negMulLog (branchLaw a).toReal else 0 = 0 := by
        apply Finset.sum_eq_zero
        intro a _
        split_ifs with hfa
        · rw [hAllZero a hfa]; simp [Real.negMulLog]
        · rfl
      rw [hSumZero, hNMLSumZero]; simp [Real.negMulLog]

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
