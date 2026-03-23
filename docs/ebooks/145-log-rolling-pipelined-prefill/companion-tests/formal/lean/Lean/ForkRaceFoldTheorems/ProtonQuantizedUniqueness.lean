import Mathlib
import ForkRaceFoldTheorems.ProtonCalibrationBoundary

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Proton Quantized Uniqueness

This module packages the strongest honest positive route currently available
after `ProtonCalibrationBoundary.lean`.

The previous module proves that the calibrated proton shell is not unique on
its raw surface. This module shows exactly what additional structure is needed
to recover uniqueness:

1. the QCD/string-tension anchor is fixed at the current witness `σ = 1`;
2. the proton radius anchor is fixed at the current witness `r = 0.87`;
3. the fold residual is quantized as an integer MeV count;
4. the sliver residual is a sub-unit remainder in `[0, 1)`;
5. the total proton rest mass is the measured witness.

Under those explicit assumptions, the current calibrated shell becomes unique.
This is still an assumption-parameterized uniqueness theorem, not a full
Standard-Model replacement.
-/

/-- A bounded axiom package for the strongest current uniqueness route. -/
def ProtonQuantizedUniquenessAxioms (c : ProtonCalibration) : Prop :=
  c.stringTensionGeVPerFm = calibratedProtonStringTensionGeVPerFm ∧
    c.confinementRadiusFm = calibratedProtonRadiusFm ∧
    (∃ n : Int, c.foldResidualMeV = n) ∧
    0 ≤ c.sliverResidualMeV ∧
    c.sliverResidualMeV < 1 ∧
    c.restMassMeV = measuredProtonRestMassMeV

/-- Once the confinement anchors are fixed, integer fold quanta plus a
sub-unit sliver remainder determine the residual split uniquely. -/
theorem quantized_residual_split_unique
    (foldResidualMeV sliverResidualMeV : ℝ)
    (hfold_int : ∃ n : Int, foldResidualMeV = n)
    (hsliver : 0 ≤ sliverResidualMeV ∧ sliverResidualMeV < 1)
    (hmass :
      protonRestMassCandidateMeV
          calibratedProtonStringTensionGeVPerFm
          calibratedProtonRadiusFm
          foldResidualMeV
          sliverResidualMeV =
        measuredProtonRestMassMeV) :
    foldResidualMeV = calibratedFoldResidualMeV ∧
      sliverResidualMeV = calibratedSliverResidualMeV := by
  rcases hfold_int with ⟨n, rfl⟩
  rcases hsliver with ⟨hs_nonneg, hs_lt_one⟩
  have hsum : (n : ℝ) + sliverResidualMeV = 8534 / 125 := by
    have hmass' := hmass
    norm_num [protonRestMassCandidateMeV,
      calibratedProtonStringTensionGeVPerFm,
      calibratedProtonRadiusFm, measuredProtonRestMassMeV] at hmass'
    linarith
  have hn_gt_67_real : (67 : ℝ) < (n : ℝ) := by
    nlinarith [hsum, hs_lt_one]
  have hn_lt_69_real : (n : ℝ) < 69 := by
    nlinarith [hsum, hs_nonneg]
  have hn_gt_67 : (67 : Int) < n := by
    exact_mod_cast hn_gt_67_real
  have hn_lt_69 : n < 69 := by
    exact_mod_cast hn_lt_69_real
  have hn_eq : n = 68 := by
    omega
  subst hn_eq
  constructor
  · norm_num [calibratedFoldResidualMeV]
  · have hsliver_eq : sliverResidualMeV = 34 / 125 := by
      nlinarith [hsum]
    simpa [calibratedSliverResidualMeV] using hsliver_eq

/-- Under the explicit quantized-uniqueness axioms, the proton calibration is
forced to equal the current calibrated witness. -/
theorem quantized_axioms_force_calibrated_proton
    (c : ProtonCalibration)
    (h : ProtonQuantizedUniquenessAxioms c) :
    c = calibratedProtonCalibration := by
  rcases h with ⟨hσ, hr, hfold_int, hs_nonneg, hs_lt_one, hmass⟩
  have hmass' :
      protonRestMassCandidateMeV
          calibratedProtonStringTensionGeVPerFm
          calibratedProtonRadiusFm
          c.foldResidualMeV
          c.sliverResidualMeV =
        measuredProtonRestMassMeV := by
    simpa [ProtonCalibration.restMassMeV, hσ, hr] using hmass
  have hres :
      c.foldResidualMeV = calibratedFoldResidualMeV ∧
        c.sliverResidualMeV = calibratedSliverResidualMeV :=
    quantized_residual_split_unique
      c.foldResidualMeV
      c.sliverResidualMeV
      hfold_int
      ⟨hs_nonneg, hs_lt_one⟩
      hmass'
  rcases hres with ⟨hfold, hsliver⟩
  cases c
  simp at hσ hr hfold hsliver ⊢
  cases hσ
  cases hr
  cases hfold
  cases hsliver
  rfl

/-- The current calibrated witness satisfies the quantized uniqueness axioms. -/
theorem calibrated_proton_satisfies_quantized_uniqueness_axioms :
    ProtonQuantizedUniquenessAxioms calibratedProtonCalibration := by
  refine ⟨rfl, rfl, ?_, ?_, ?_, calibrated_proton_calibration_hits_measured_mass⟩
  · exact ⟨68, by norm_num [calibratedProtonCalibration, calibratedFoldResidualMeV]⟩
  · norm_num [calibratedProtonCalibration, calibratedSliverResidualMeV]
  · norm_num [calibratedProtonCalibration, calibratedSliverResidualMeV]

/-- The alternative residual split is ruled out by the sub-unit sliver axiom. -/
theorem alternative_residual_split_fails_subunit_sliver_axiom :
    ¬ ProtonQuantizedUniquenessAxioms alternativeResidualSplitCalibration := by
  intro h
  rcases h with ⟨_, _, _, _, hs_lt_one, _⟩
  norm_num [alternativeResidualSplitCalibration] at hs_lt_one

/-- The alternative confinement witness is ruled out by the fixed QCD/scale
anchors. -/
theorem alternative_confinement_fails_anchor_axioms :
    ¬ ProtonQuantizedUniquenessAxioms alternativeConfinementCalibration := by
  intro h
  rcases h with ⟨hσ, _, _, _, _, _⟩
  norm_num [alternativeConfinementCalibration,
    calibratedProtonStringTensionGeVPerFm] at hσ

/-- Master closure for the strongest current positive uniqueness route:
the calibrated proton shell becomes unique once the confinement anchors are
fixed and the residual is split into integer fold quanta plus a sub-unit
sliver remainder. -/
theorem proton_quantized_uniqueness_closure :
    ProtonQuantizedUniquenessAxioms calibratedProtonCalibration ∧
      (∀ c : ProtonCalibration,
        ProtonQuantizedUniquenessAxioms c →
          c = calibratedProtonCalibration) ∧
      ¬ ProtonQuantizedUniquenessAxioms alternativeResidualSplitCalibration ∧
      ¬ ProtonQuantizedUniquenessAxioms alternativeConfinementCalibration := by
  exact ⟨calibrated_proton_satisfies_quantized_uniqueness_axioms,
    quantized_axioms_force_calibrated_proton,
    alternative_residual_split_fails_subunit_sliver_axiom,
    alternative_confinement_fails_anchor_axioms⟩

end

end ForkRaceFoldTheorems
