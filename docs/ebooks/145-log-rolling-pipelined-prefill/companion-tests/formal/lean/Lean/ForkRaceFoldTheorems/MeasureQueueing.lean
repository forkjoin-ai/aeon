import Mathlib

open scoped BigOperators ENNReal
open MeasureTheory

namespace ForkRaceFoldTheorems

structure WeightedQueueSeries (Ω : Type*) where
  mass : Ω → ℝ≥0∞
  customerTime : Ω → ℝ≥0∞
  sojournTime : Ω → ℝ≥0∞
  openAge : Ω → ℝ≥0∞
  samplePathBalance : ∀ ω, customerTime ω = sojournTime ω + openAge ω

noncomputable def WeightedQueueSeries.weightedCustomerTime (series : WeightedQueueSeries Ω) : ℝ≥0∞ :=
  ∑' ω, series.mass ω * series.customerTime ω

noncomputable def WeightedQueueSeries.weightedSojournTime (series : WeightedQueueSeries Ω) : ℝ≥0∞ :=
  ∑' ω, series.mass ω * series.sojournTime ω

noncomputable def WeightedQueueSeries.weightedOpenAge (series : WeightedQueueSeries Ω) : ℝ≥0∞ :=
  ∑' ω, series.mass ω * series.openAge ω

noncomputable def WeightedQueueSeries.totalMass (series : WeightedQueueSeries Ω) : ℝ≥0∞ :=
  ∑' ω, series.mass ω

theorem weighted_queue_tsum_balance (series : WeightedQueueSeries Ω) :
    series.weightedCustomerTime =
      series.weightedSojournTime + series.weightedOpenAge := by
  calc
    series.weightedCustomerTime
      = ∑' ω, (series.mass ω * series.sojournTime ω + series.mass ω * series.openAge ω) := by
          apply tsum_congr
          intro ω
          rw [series.samplePathBalance ω, mul_add]
    _ = series.weightedSojournTime + series.weightedOpenAge := by
          simp [WeightedQueueSeries.weightedSojournTime, WeightedQueueSeries.weightedOpenAge,
            ENNReal.tsum_add]

theorem weighted_queue_tsum_terminal_expectation_balance
    (series : WeightedQueueSeries Ω)
    (hOpenAgeZero : ∀ ω, series.openAge ω = 0) :
      series.weightedCustomerTime / series.totalMass =
      series.weightedSojournTime / series.totalMass := by
  rw [weighted_queue_tsum_balance]
  have hOpenAgeMassZero : series.weightedOpenAge = 0 := by
    calc
      series.weightedOpenAge = ∑' ω, series.mass ω * 0 := by
        apply tsum_congr
        intro ω
        rw [hOpenAgeZero ω]
      _ = 0 := by
        simp
  rw [hOpenAgeMassZero, add_zero]

theorem pmf_queue_tsum_balance
    {Ω : Type*}
    (p : PMF Ω)
    {customerTime sojournTime openAge : Ω → ℝ≥0∞}
    (hBalance : ∀ ω, customerTime ω = sojournTime ω + openAge ω) :
    (∑' ω, p ω * customerTime ω) =
      (∑' ω, p ω * sojournTime ω) + (∑' ω, p ω * openAge ω) := by
  let series : WeightedQueueSeries Ω := {
    mass := p
    customerTime := customerTime
    sojournTime := sojournTime
    openAge := openAge
    samplePathBalance := hBalance
  }
  simpa [WeightedQueueSeries.weightedCustomerTime, WeightedQueueSeries.weightedSojournTime,
    WeightedQueueSeries.weightedOpenAge] using weighted_queue_tsum_balance series

theorem pmf_queue_tsum_terminal_balance
    {Ω : Type*}
    (p : PMF Ω)
    {customerTime sojournTime openAge : Ω → ℝ≥0∞}
    (hBalance : ∀ ω, customerTime ω = sojournTime ω + openAge ω)
    (hOpenAgeZero : ∀ ω, openAge ω = 0) :
    (∑' ω, p ω * customerTime ω) = ∑' ω, p ω * sojournTime ω := by
  have hOpenAgeMassZero : (∑' ω, p ω * openAge ω) = 0 := by
    calc
      (∑' ω, p ω * openAge ω) = ∑' ω, p ω * 0 := by
        apply tsum_congr
        intro ω
        rw [hOpenAgeZero ω]
      _ = 0 := by simp
  calc
    (∑' ω, p ω * customerTime ω)
      = (∑' ω, p ω * sojournTime ω) + (∑' ω, p ω * openAge ω) := by
          exact pmf_queue_tsum_balance p hBalance
    _ = (∑' ω, p ω * sojournTime ω) + 0 := by rw [hOpenAgeMassZero]
    _ = ∑' ω, p ω * sojournTime ω := by simp

structure MeasureQueueLaw (Ω : Type*) [MeasurableSpace Ω] where
  customerTime : Ω → ℝ≥0∞
  sojournTime : Ω → ℝ≥0∞
  openAge : Ω → ℝ≥0∞
  measurableCustomerTime : Measurable customerTime
  measurableSojournTime : Measurable sojournTime
  measurableOpenAge : Measurable openAge
  samplePathBalance : ∀ ω, customerTime ω = sojournTime ω + openAge ω

theorem measure_queue_lintegral_balance
    {Ω : Type*} [MeasurableSpace Ω]
    (μ : Measure Ω)
    (law : MeasureQueueLaw Ω) :
    ∫⁻ ω, law.customerTime ω ∂μ =
      ∫⁻ ω, law.sojournTime ω ∂μ + ∫⁻ ω, law.openAge ω ∂μ := by
  calc
    ∫⁻ ω, law.customerTime ω ∂μ = ∫⁻ ω, law.sojournTime ω + law.openAge ω ∂μ := by
      refine MeasureTheory.lintegral_congr_ae ?_
      filter_upwards with ω
      exact law.samplePathBalance ω
    _ = ∫⁻ ω, law.sojournTime ω ∂μ + ∫⁻ ω, law.openAge ω ∂μ := by
      exact MeasureTheory.lintegral_add_left law.measurableSojournTime law.openAge

theorem measure_queue_terminal_lintegral_balance
    {Ω : Type*} [MeasurableSpace Ω]
    (μ : Measure Ω)
    (law : MeasureQueueLaw Ω)
    (hOpenAgeZero : law.openAge =ᵐ[μ] 0) :
    ∫⁻ ω, law.customerTime ω ∂μ =
      ∫⁻ ω, law.sojournTime ω ∂μ := by
  calc
    ∫⁻ ω, law.customerTime ω ∂μ = ∫⁻ ω, law.sojournTime ω + law.openAge ω ∂μ := by
      refine MeasureTheory.lintegral_congr_ae ?_
      filter_upwards with ω
      exact law.samplePathBalance ω
    _ = ∫⁻ ω, law.sojournTime ω ∂μ := by
      refine MeasureTheory.lintegral_congr_ae ?_
      filter_upwards [hOpenAgeZero] with ω hω
      simp [hω]

theorem pmf_queue_lintegral_balance
    {Ω : Type*} [MeasurableSpace Ω]
    (p : PMF Ω)
    (law : MeasureQueueLaw Ω) :
    ∫⁻ ω, law.customerTime ω ∂ p.toMeasure =
      ∫⁻ ω, law.sojournTime ω ∂ p.toMeasure + ∫⁻ ω, law.openAge ω ∂ p.toMeasure := by
  exact measure_queue_lintegral_balance p.toMeasure law

theorem pmf_queue_terminal_lintegral_balance
    {Ω : Type*} [MeasurableSpace Ω]
    (p : PMF Ω)
    (law : MeasureQueueLaw Ω)
    (hOpenAgeZero : law.openAge =ᵐ[p.toMeasure] 0) :
    ∫⁻ ω, law.customerTime ω ∂ p.toMeasure =
      ∫⁻ ω, law.sojournTime ω ∂ p.toMeasure := by
  exact measure_queue_terminal_lintegral_balance p.toMeasure law hOpenAgeZero

structure MeasureQueueTruncationFamily (Ω : Type*) [MeasurableSpace Ω] where
  customerTime : ℕ → Ω → ℝ≥0∞
  sojournTime : ℕ → Ω → ℝ≥0∞
  openAge : ℕ → Ω → ℝ≥0∞
  measurableCustomerTime : ∀ n, Measurable (customerTime n)
  measurableSojournTime : ∀ n, Measurable (sojournTime n)
  measurableOpenAge : ∀ n, Measurable (openAge n)
  monotoneCustomerTime : Monotone customerTime
  monotoneSojournTime : Monotone sojournTime
  monotoneOpenAge : Monotone openAge
  samplePathBalance : ∀ n ω, customerTime n ω = sojournTime n ω + openAge n ω

noncomputable def MeasureQueueTruncationFamily.customerLimit
    {Ω : Type*} [MeasurableSpace Ω]
    (family : MeasureQueueTruncationFamily Ω) : Ω → ℝ≥0∞ :=
  fun ω => ⨆ n, family.customerTime n ω

noncomputable def MeasureQueueTruncationFamily.sojournLimit
    {Ω : Type*} [MeasurableSpace Ω]
    (family : MeasureQueueTruncationFamily Ω) : Ω → ℝ≥0∞ :=
  fun ω => ⨆ n, family.sojournTime n ω

noncomputable def MeasureQueueTruncationFamily.openAgeLimit
    {Ω : Type*} [MeasurableSpace Ω]
    (family : MeasureQueueTruncationFamily Ω) : Ω → ℝ≥0∞ :=
  fun ω => ⨆ n, family.openAge n ω

private theorem monotone_lintegral_of_family
    {Ω : Type*} [MeasurableSpace Ω]
    (μ : Measure Ω)
    {f : ℕ → Ω → ℝ≥0∞}
    (hMonotone : Monotone f) :
    Monotone (fun n => ∫⁻ ω, f n ω ∂μ) := by
  intro i j hij
  exact MeasureTheory.lintegral_mono fun ω => hMonotone hij ω

private theorem monotone_queue_sum_family
    {Ω : Type*} [MeasurableSpace Ω]
    (family : MeasureQueueTruncationFamily Ω) :
    Monotone (fun n ω => family.sojournTime n ω + family.openAge n ω) := by
  intro i j hij ω
  exact add_le_add (family.monotoneSojournTime hij ω) (family.monotoneOpenAge hij ω)

theorem measure_queue_truncation_limit_balance
    {Ω : Type*} [MeasurableSpace Ω]
    (μ : Measure Ω)
    (family : MeasureQueueTruncationFamily Ω) :
    ∫⁻ ω, family.customerLimit ω ∂μ =
      ∫⁻ ω, family.sojournLimit ω ∂μ + ∫⁻ ω, family.openAgeLimit ω ∂μ := by
  have hMonotoneSojournIntegral :
      Monotone (fun n => ∫⁻ ω, family.sojournTime n ω ∂μ) :=
    monotone_lintegral_of_family μ family.monotoneSojournTime
  have hMonotoneOpenAgeIntegral :
      Monotone (fun n => ∫⁻ ω, family.openAge n ω ∂μ) :=
    monotone_lintegral_of_family μ family.monotoneOpenAge
  calc
    ∫⁻ ω, family.customerLimit ω ∂μ
      = ⨆ n, ∫⁻ ω, family.customerTime n ω ∂μ := by
          simp [MeasureQueueTruncationFamily.customerLimit,
            MeasureTheory.lintegral_iSup, family.measurableCustomerTime,
            family.monotoneCustomerTime]
    _ = ⨆ n, (∫⁻ ω, family.sojournTime n ω ∂μ + ∫⁻ ω, family.openAge n ω ∂μ) := by
          apply iSup_congr
          intro n
          calc
            ∫⁻ ω, family.customerTime n ω ∂μ
              = ∫⁻ ω, family.sojournTime n ω + family.openAge n ω ∂μ := by
                  refine MeasureTheory.lintegral_congr_ae ?_
                  filter_upwards with ω
                  exact family.samplePathBalance n ω
            _ = ∫⁻ ω, family.sojournTime n ω ∂μ + ∫⁻ ω, family.openAge n ω ∂μ := by
                  exact MeasureTheory.lintegral_add_left
                    (family.measurableSojournTime n) (family.openAge n)
    _ = (⨆ n, ∫⁻ ω, family.sojournTime n ω ∂μ) +
          ⨆ n, ∫⁻ ω, family.openAge n ω ∂μ := by
          symm
          exact ENNReal.iSup_add_iSup_of_monotone
            hMonotoneSojournIntegral hMonotoneOpenAgeIntegral
    _ = ∫⁻ ω, family.sojournLimit ω ∂μ + ∫⁻ ω, family.openAgeLimit ω ∂μ := by
          simp [MeasureQueueTruncationFamily.sojournLimit,
            MeasureQueueTruncationFamily.openAgeLimit,
            MeasureTheory.lintegral_iSup, family.measurableSojournTime,
            family.monotoneSojournTime, family.measurableOpenAge,
            family.monotoneOpenAge]

theorem measure_queue_truncation_terminal_limit_balance
    {Ω : Type*} [MeasurableSpace Ω]
    (μ : Measure Ω)
    (family : MeasureQueueTruncationFamily Ω)
    (hOpenAgeLimitZero : family.openAgeLimit =ᵐ[μ] 0) :
    ∫⁻ ω, family.customerLimit ω ∂μ =
      ∫⁻ ω, family.sojournLimit ω ∂μ := by
  have hOpenAgeIntegralZero : ∫⁻ ω, family.openAgeLimit ω ∂μ = 0 := by
    calc
      ∫⁻ ω, family.openAgeLimit ω ∂μ = ∫⁻ ω, (0 : Ω → ℝ≥0∞) ω ∂μ := by
        exact MeasureTheory.lintegral_congr_ae hOpenAgeLimitZero
      _ = 0 := by simp
  calc
    ∫⁻ ω, family.customerLimit ω ∂μ
      = ∫⁻ ω, family.sojournLimit ω ∂μ + ∫⁻ ω, family.openAgeLimit ω ∂μ := by
          exact measure_queue_truncation_limit_balance μ family
    _ = ∫⁻ ω, family.sojournLimit ω ∂μ + 0 := by rw [hOpenAgeIntegralZero]
    _ = ∫⁻ ω, family.sojournLimit ω ∂μ := by simp

end ForkRaceFoldTheorems
