import Mathlib
import ForkRaceFoldTheorems.MatterExplanationClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Proton Rest-Mass Candidate

This module adds the next bounded step beyond the discrete matter closure:
an explicit continuous candidate formula for the proton rest mass.

The formula is intentionally honest. It is a calibrated shell, not a
first-principles Standard-Model derivation. What is exact here is:

1. the candidate formula is a continuous linear function of confinement radius;
2. it is monotone in radius for nonnegative string tension;
3. one exact rational calibration witness hits the measured proton mass.

What is not yet proved here is that the calibration values themselves are
uniquely forced by the current topological surface.
-/

/-- Continuous proton rest-mass candidate in MeV.

`1000 * σ * r` is the linear confinement term when `σ` is measured in GeV/fm
and `r` in fm; `foldResidualMeV` and `sliverResidualMeV` package the current
post-confinement residual budget in MeV. -/
def protonRestMassCandidateMeV
    (stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV : ℝ) : ℝ :=
  1000 * stringTensionGeVPerFm * confinementRadiusFm +
    foldResidualMeV + sliverResidualMeV

/-- The confinement contribution alone. -/
def protonConfinementTermMeV
    (stringTensionGeVPerFm confinementRadiusFm : ℝ) : ℝ :=
  1000 * stringTensionGeVPerFm * confinementRadiusFm

/-- The non-confinement residual term. -/
def protonResidualTermMeV
    (foldResidualMeV sliverResidualMeV : ℝ) : ℝ :=
  foldResidualMeV + sliverResidualMeV

/-- The candidate decomposes exactly into confinement plus residual. -/
theorem proton_rest_mass_candidate_splits
    (stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV : ℝ) :
    protonRestMassCandidateMeV
        stringTensionGeVPerFm confinementRadiusFm
        foldResidualMeV sliverResidualMeV =
      protonConfinementTermMeV stringTensionGeVPerFm confinementRadiusFm +
        protonResidualTermMeV foldResidualMeV sliverResidualMeV := by
  unfold protonRestMassCandidateMeV protonConfinementTermMeV protonResidualTermMeV
  ring_nf

/-- The candidate is affine-linear in the confinement radius. -/
theorem proton_rest_mass_candidate_linear_in_radius
    (stringTensionGeVPerFm foldResidualMeV sliverResidualMeV r₁ r₂ : ℝ) :
    protonRestMassCandidateMeV stringTensionGeVPerFm (r₁ + r₂)
        foldResidualMeV sliverResidualMeV =
      protonRestMassCandidateMeV stringTensionGeVPerFm r₁
        foldResidualMeV sliverResidualMeV +
      1000 * stringTensionGeVPerFm * r₂ := by
  unfold protonRestMassCandidateMeV
  ring_nf

/-- For nonnegative string tension, the candidate is monotone in radius. -/
theorem proton_rest_mass_candidate_monotone_in_radius
    (stringTensionGeVPerFm foldResidualMeV sliverResidualMeV r₁ r₂ : ℝ)
    (hσ : 0 ≤ stringTensionGeVPerFm) (hr : r₁ ≤ r₂) :
    protonRestMassCandidateMeV stringTensionGeVPerFm r₁
        foldResidualMeV sliverResidualMeV ≤
      protonRestMassCandidateMeV stringTensionGeVPerFm r₂
        foldResidualMeV sliverResidualMeV := by
  have hmul : 1000 * stringTensionGeVPerFm * r₁ ≤
      1000 * stringTensionGeVPerFm * r₂ := by
    have h1000σ : 0 ≤ 1000 * stringTensionGeVPerFm := by
      nlinarith
    exact mul_le_mul_of_nonneg_left hr h1000σ
  unfold protonRestMassCandidateMeV
  linarith

/-- Nonnegative terms give a nonnegative proton rest-mass candidate. -/
theorem proton_rest_mass_candidate_nonnegative
    (stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV : ℝ)
    (hσ : 0 ≤ stringTensionGeVPerFm) (hr : 0 ≤ confinementRadiusFm)
    (hf : 0 ≤ foldResidualMeV) (hs : 0 ≤ sliverResidualMeV) :
    0 ≤ protonRestMassCandidateMeV stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV := by
  unfold protonRestMassCandidateMeV
  have hconf : 0 ≤ 1000 * stringTensionGeVPerFm * confinementRadiusFm := by
    have h1000σ : 0 ≤ 1000 * stringTensionGeVPerFm := by
      nlinarith
    exact mul_nonneg h1000σ hr
  linarith

/-- Positive radius, positive string tension, and nonnegative residual make the
candidate strictly positive. -/
theorem proton_rest_mass_candidate_positive
    (stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV : ℝ)
    (hσ : 0 < stringTensionGeVPerFm) (hr : 0 < confinementRadiusFm)
    (hf : 0 ≤ foldResidualMeV) (hs : 0 ≤ sliverResidualMeV) :
    0 < protonRestMassCandidateMeV stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV := by
  unfold protonRestMassCandidateMeV
  have hconf : 0 < 1000 * stringTensionGeVPerFm * confinementRadiusFm := by
    nlinarith
  linarith

/-- Exact measured proton rest mass used by the calibrated candidate shell. -/
def measuredProtonRestMassMeV : ℝ := 117284 / 125

/-- Exact rational calibration witness for the current candidate shell.

- `σ = 1 GeV/fm`
- `r = 0.87 fm`
- `fold residual = 68 MeV`
- `sliver residual = 0.272 MeV`
-/
def calibratedProtonStringTensionGeVPerFm : ℝ := 1
def calibratedProtonRadiusFm : ℝ := 87 / 100
def calibratedFoldResidualMeV : ℝ := 68
def calibratedSliverResidualMeV : ℝ := 34 / 125

/-- The calibrated confinement term is exactly `870 MeV`. -/
theorem calibrated_proton_confinement_term_exact :
    protonConfinementTermMeV
        calibratedProtonStringTensionGeVPerFm
        calibratedProtonRadiusFm = 870 := by
  norm_num [protonConfinementTermMeV,
    calibratedProtonStringTensionGeVPerFm, calibratedProtonRadiusFm]

/-- The calibrated residual term is exactly `68.272 MeV`. -/
theorem calibrated_proton_residual_term_exact :
    protonResidualTermMeV
        calibratedFoldResidualMeV
        calibratedSliverResidualMeV = 8534 / 125 := by
  norm_num [protonResidualTermMeV,
    calibratedFoldResidualMeV, calibratedSliverResidualMeV]

/-- The calibrated candidate hits the measured proton rest mass exactly. -/
theorem calibrated_exact_proton_rest_mass_formula :
    protonRestMassCandidateMeV
        calibratedProtonStringTensionGeVPerFm
        calibratedProtonRadiusFm
        calibratedFoldResidualMeV
        calibratedSliverResidualMeV =
      measuredProtonRestMassMeV := by
  norm_num [protonRestMassCandidateMeV, measuredProtonRestMassMeV,
    calibratedProtonStringTensionGeVPerFm, calibratedProtonRadiusFm,
    calibratedFoldResidualMeV, calibratedSliverResidualMeV]

/-- The calibrated candidate refines the discrete matter surface: the proton is
still the confined `3`-cycle / `4D` rung while the continuous candidate fixes
an exact MeV-scale witness on top of that rung. -/
theorem calibrated_proton_formula_refines_matter_closure
    (b : InformationMatterBridge) (hb : 0 < b.bitsErased)
    (g : SelfReferentialFold) (hg : 0 < g.foldEnergy) :
    BythosScale.proton_dim = DimensionalConfinement.wallingtonDimension 3 ∧
      protonRestMassCandidateMeV
          calibratedProtonStringTensionGeVPerFm
          calibratedProtonRadiusFm
          calibratedFoldResidualMeV
          calibratedSliverResidualMeV =
        measuredProtonRestMassMeV := by
  exact ⟨(matter_explanation_closure b hb g hg).2.1,
    calibrated_exact_proton_rest_mass_formula⟩

/-- Master closure for the current exact continuous proton rest-mass candidate:
continuous affine law, monotone radius dependence, exact calibrated split, and
exact hit of the measured proton mass on the calibrated witness. -/
theorem proton_rest_mass_candidate_closure :
    protonRestMassCandidateMeV
        calibratedProtonStringTensionGeVPerFm
        calibratedProtonRadiusFm
        calibratedFoldResidualMeV
        calibratedSliverResidualMeV =
      protonConfinementTermMeV
          calibratedProtonStringTensionGeVPerFm
          calibratedProtonRadiusFm +
        protonResidualTermMeV
          calibratedFoldResidualMeV
          calibratedSliverResidualMeV ∧
      protonConfinementTermMeV
          calibratedProtonStringTensionGeVPerFm
          calibratedProtonRadiusFm = 870 ∧
      protonResidualTermMeV
          calibratedFoldResidualMeV
          calibratedSliverResidualMeV = 8534 / 125 ∧
      protonRestMassCandidateMeV
          calibratedProtonStringTensionGeVPerFm
          calibratedProtonRadiusFm
          calibratedFoldResidualMeV
          calibratedSliverResidualMeV =
        measuredProtonRestMassMeV := by
  exact ⟨proton_rest_mass_candidate_splits
      calibratedProtonStringTensionGeVPerFm
      calibratedProtonRadiusFm
      calibratedFoldResidualMeV
      calibratedSliverResidualMeV,
    calibrated_proton_confinement_term_exact,
    calibrated_proton_residual_term_exact,
    calibrated_exact_proton_rest_mass_formula⟩

end

end ForkRaceFoldTheorems
