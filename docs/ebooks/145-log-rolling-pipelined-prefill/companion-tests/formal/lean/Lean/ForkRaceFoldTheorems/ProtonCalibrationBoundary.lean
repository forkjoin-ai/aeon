import Mathlib
import ForkRaceFoldTheorems.ProtonRestMassCandidate

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Proton Calibration Boundary

This module closes the overclaim boundary around the exact proton rest-mass
candidate. The current candidate formula is exact as a calibrated shell, but
the parameters are not uniquely forced by the current topological surface.

What is proved here is:

1. residual rebalancing leaves the candidate unchanged;
2. matching confinement product and matching residual sum leave the candidate
   unchanged;
3. there are distinct exact calibration witnesses hitting the measured proton
   mass;
4. therefore the current candidate is not yet a unique first-principles
   derivation of its calibration constants.
-/

/-- One concrete calibration record for the proton rest-mass candidate. -/
structure ProtonCalibration where
  stringTensionGeVPerFm : ℝ
  confinementRadiusFm : ℝ
  foldResidualMeV : ℝ
  sliverResidualMeV : ℝ

/-- Evaluate the proton candidate at a concrete calibration. -/
def ProtonCalibration.restMassMeV (c : ProtonCalibration) : ℝ :=
  protonRestMassCandidateMeV
    c.stringTensionGeVPerFm
    c.confinementRadiusFm
    c.foldResidualMeV
    c.sliverResidualMeV

/-- The exact rational witness used in `ProtonRestMassCandidate.lean`. -/
def calibratedProtonCalibration : ProtonCalibration where
  stringTensionGeVPerFm := calibratedProtonStringTensionGeVPerFm
  confinementRadiusFm := calibratedProtonRadiusFm
  foldResidualMeV := calibratedFoldResidualMeV
  sliverResidualMeV := calibratedSliverResidualMeV

/-- An alternative exact witness with the same confinement term but a different
residual split. -/
def alternativeResidualSplitCalibration : ProtonCalibration where
  stringTensionGeVPerFm := calibratedProtonStringTensionGeVPerFm
  confinementRadiusFm := calibratedProtonRadiusFm
  foldResidualMeV := 67
  sliverResidualMeV := 159 / 125

/-- An alternative exact witness with a different string tension / radius pair
but the same confinement product and the same residual split. -/
def alternativeConfinementCalibration : ProtonCalibration where
  stringTensionGeVPerFm := 2
  confinementRadiusFm := 87 / 200
  foldResidualMeV := calibratedFoldResidualMeV
  sliverResidualMeV := calibratedSliverResidualMeV

/-- Shifting one unit of residual mass from the sliver term to the fold term
preserves the total proton rest-mass candidate. -/
theorem residual_rebalancing_preserves_proton_candidate
    (stringTensionGeVPerFm confinementRadiusFm
      foldResidualMeV sliverResidualMeV δ : ℝ) :
    protonRestMassCandidateMeV stringTensionGeVPerFm confinementRadiusFm
        (foldResidualMeV + δ) (sliverResidualMeV - δ) =
      protonRestMassCandidateMeV stringTensionGeVPerFm confinementRadiusFm
        foldResidualMeV sliverResidualMeV := by
  unfold protonRestMassCandidateMeV
  ring_nf

/-- Matching confinement product and matching residual sum force the same total
candidate mass. -/
theorem same_confinement_product_and_residual_give_same_proton_candidate
    (σ₁ r₁ fold₁ sliver₁ σ₂ r₂ fold₂ sliver₂ : ℝ)
    (hconf : σ₁ * r₁ = σ₂ * r₂)
    (hres : fold₁ + sliver₁ = fold₂ + sliver₂) :
    protonRestMassCandidateMeV σ₁ r₁ fold₁ sliver₁ =
      protonRestMassCandidateMeV σ₂ r₂ fold₂ sliver₂ := by
  have hconf' : 1000 * σ₁ * r₁ = 1000 * σ₂ * r₂ := by
    nlinarith
  unfold protonRestMassCandidateMeV
  linarith

/-- The original calibrated witness still hits the measured proton mass. -/
theorem calibrated_proton_calibration_hits_measured_mass :
    calibratedProtonCalibration.restMassMeV = measuredProtonRestMassMeV := by
  simpa [ProtonCalibration.restMassMeV, calibratedProtonCalibration] using
    calibrated_exact_proton_rest_mass_formula

/-- The alternative residual split also hits the measured proton mass exactly. -/
theorem alternative_residual_split_calibration_hits_measured_mass :
    alternativeResidualSplitCalibration.restMassMeV =
      measuredProtonRestMassMeV := by
  norm_num [ProtonCalibration.restMassMeV, alternativeResidualSplitCalibration,
    protonRestMassCandidateMeV, measuredProtonRestMassMeV,
    calibratedProtonStringTensionGeVPerFm, calibratedProtonRadiusFm]

/-- The alternative confinement pair also hits the measured proton mass exactly. -/
theorem alternative_confinement_calibration_hits_measured_mass :
    alternativeConfinementCalibration.restMassMeV =
      measuredProtonRestMassMeV := by
  calc
    alternativeConfinementCalibration.restMassMeV =
        calibratedProtonCalibration.restMassMeV := by
          apply same_confinement_product_and_residual_give_same_proton_candidate
          · norm_num [alternativeConfinementCalibration, calibratedProtonCalibration,
              calibratedProtonRadiusFm, calibratedProtonStringTensionGeVPerFm]
          · norm_num [alternativeConfinementCalibration, calibratedProtonCalibration,
              calibratedFoldResidualMeV, calibratedSliverResidualMeV]
    _ = measuredProtonRestMassMeV := calibrated_proton_calibration_hits_measured_mass

/-- The alternative residual split is genuinely different from the original
calibration witness. -/
theorem alternative_residual_split_calibration_ne_calibrated :
    alternativeResidualSplitCalibration ≠ calibratedProtonCalibration := by
  intro h
  have hfold := congrArg ProtonCalibration.foldResidualMeV h
  norm_num [alternativeResidualSplitCalibration, calibratedProtonCalibration,
    calibratedFoldResidualMeV] at hfold

/-- The alternative confinement pair is genuinely different from the original
calibration witness. -/
theorem alternative_confinement_calibration_ne_calibrated :
    alternativeConfinementCalibration ≠ calibratedProtonCalibration := by
  intro h
  have hσ := congrArg ProtonCalibration.stringTensionGeVPerFm h
  norm_num [alternativeConfinementCalibration, calibratedProtonCalibration,
    calibratedProtonStringTensionGeVPerFm] at hσ

/-- The current proton candidate does not have a unique exact calibration
witness. -/
theorem proton_calibration_not_unique :
    ∃ c : ProtonCalibration,
      c ≠ calibratedProtonCalibration ∧
        c.restMassMeV = measuredProtonRestMassMeV := by
  exact ⟨alternativeResidualSplitCalibration,
    alternative_residual_split_calibration_ne_calibrated,
    alternative_residual_split_calibration_hits_measured_mass⟩

/-- The current exact proton shell is not yet a first-principles unique
calibration law. -/
theorem proton_calibration_not_first_principles_unique :
    ¬ ∀ c : ProtonCalibration,
      c.restMassMeV = measuredProtonRestMassMeV →
        c = calibratedProtonCalibration := by
  intro h
  exact alternative_residual_split_calibration_ne_calibrated
    (h alternativeResidualSplitCalibration
      alternative_residual_split_calibration_hits_measured_mass)

/-- Master closure for the current boundary: the exact fit survives two
distinct calibration witnesses, so the calibrated proton shell remains a
bounded refinement rather than a unique first-principles derivation. -/
theorem proton_calibration_boundary_closure :
    calibratedProtonCalibration.restMassMeV = measuredProtonRestMassMeV ∧
      alternativeResidualSplitCalibration.restMassMeV =
        measuredProtonRestMassMeV ∧
      alternativeConfinementCalibration.restMassMeV =
        measuredProtonRestMassMeV ∧
      alternativeResidualSplitCalibration ≠ calibratedProtonCalibration ∧
      alternativeConfinementCalibration ≠ calibratedProtonCalibration ∧
      (¬ ∀ c : ProtonCalibration,
          c.restMassMeV = measuredProtonRestMassMeV →
            c = calibratedProtonCalibration) := by
  exact ⟨calibrated_proton_calibration_hits_measured_mass,
    alternative_residual_split_calibration_hits_measured_mass,
    alternative_confinement_calibration_hits_measured_mass,
    alternative_residual_split_calibration_ne_calibrated,
    alternative_confinement_calibration_ne_calibrated,
    proton_calibration_not_first_principles_unique⟩

end

end ForkRaceFoldTheorems
