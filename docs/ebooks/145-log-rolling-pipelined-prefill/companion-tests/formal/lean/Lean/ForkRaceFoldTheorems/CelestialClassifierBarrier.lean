import ForkRaceFoldTheorems.CelestialIdentifiability

/-!
# Celestial Classifier Barrier

This module upgrades the inverse-problem surface into a classification
barrier. Once the only input is the observable signature, the
fifty-four-dimensional stellar and Saturn witnesses become
indistinguishable, so no signature-only classifier can recover the true
morphology split.
-/

namespace ForkRaceFoldTheorems

/-- A signature-only celestial classifier. -/
abbrev CelestialSignatureClassifier := Nat × Nat × Nat → Prop

theorem signature_classifier_agrees_on_fifty_four_d_witnesses
    (classify : CelestialSignatureClassifier) :
    classify (observableSignature fiftyFourDStellarShadow) ↔
      classify (observableSignature fiftyFourDSaturnShadow) := by
  have hsig :
      observableSignature fiftyFourDStellarShadow =
        observableSignature fiftyFourDSaturnShadow :=
    fifty_four_d_signature_not_injective.1
  constructor <;> intro h
  · simpa [hsig] using h
  · simpa [hsig] using h

theorem signature_only_classifier_agrees_on_fifty_four_d_witnesses
    (classify : CelestialSignatureClassifier)
    (property : CelestialShadow → Prop)
    (hclassify : ∀ shadow : CelestialShadow,
      classify (observableSignature shadow) ↔ property shadow) :
    property fiftyFourDStellarShadow ↔ property fiftyFourDSaturnShadow := by
  constructor <;> intro h
  · have hStarClass : classify (observableSignature fiftyFourDStellarShadow) :=
      (hclassify fiftyFourDStellarShadow).2 h
    have hSaturnClass : classify (observableSignature fiftyFourDSaturnShadow) :=
      (signature_classifier_agrees_on_fifty_four_d_witnesses classify).1 hStarClass
    exact (hclassify fiftyFourDSaturnShadow).1 hSaturnClass
  · have hSaturnClass : classify (observableSignature fiftyFourDSaturnShadow) :=
      (hclassify fiftyFourDSaturnShadow).2 h
    have hStarClass : classify (observableSignature fiftyFourDStellarShadow) :=
      (signature_classifier_agrees_on_fifty_four_d_witnesses classify).2 hSaturnClass
    exact (hclassify fiftyFourDStellarShadow).1 hStarClass

theorem fifty_four_d_stellar_shadow_not_saturn_like :
    ¬ saturnLike fiftyFourDStellarShadow := by
  intro hSaturn
  exact saturn_like_not_star_like fiftyFourDStellarShadow hSaturn
    fifty_four_d_stellar_shadow_is_star_like

theorem fifty_four_d_saturn_shadow_not_star_like :
    ¬ starLike fiftyFourDSaturnShadow := by
  exact saturn_like_not_star_like fiftyFourDSaturnShadow
    fifty_four_d_saturn_shadow_is_saturn_like

theorem fifty_four_d_stellar_shadow_has_negative_bias :
    signedMorphologyBias fiftyFourDStellarShadow < 0 := by
  unfold signedMorphologyBias fiftyFourDStellarShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem fifty_four_d_saturn_shadow_has_positive_bias :
    0 < signedMorphologyBias fiftyFourDSaturnShadow := by
  unfold signedMorphologyBias fiftyFourDSaturnShadow
    DimensionalConfinement.rampUpTicksFromDimension
  native_decide

theorem no_signature_classifier_for_saturn_like :
    ¬ ∃ classify : CelestialSignatureClassifier,
      ∀ shadow : CelestialShadow,
        classify (observableSignature shadow) ↔ saturnLike shadow := by
  intro h
  rcases h with ⟨classify, hclassify⟩
  have hAgree :=
    signature_only_classifier_agrees_on_fifty_four_d_witnesses
      classify saturnLike hclassify
  have hStarSaturn : saturnLike fiftyFourDStellarShadow := by
    exact hAgree.mpr fifty_four_d_saturn_shadow_is_saturn_like
  exact fifty_four_d_stellar_shadow_not_saturn_like hStarSaturn

theorem no_signature_classifier_for_star_like :
    ¬ ∃ classify : CelestialSignatureClassifier,
      ∀ shadow : CelestialShadow,
        classify (observableSignature shadow) ↔ starLike shadow := by
  intro h
  rcases h with ⟨classify, hclassify⟩
  have hAgree :=
    signature_only_classifier_agrees_on_fifty_four_d_witnesses
      classify starLike hclassify
  have hSaturnStar : starLike fiftyFourDSaturnShadow := by
    exact hAgree.mp fifty_four_d_stellar_shadow_is_star_like
  exact fifty_four_d_saturn_shadow_not_star_like hSaturnStar

theorem no_signature_classifier_for_positive_bias :
    ¬ ∃ classify : CelestialSignatureClassifier,
      ∀ shadow : CelestialShadow,
        classify (observableSignature shadow) ↔
          0 < signedMorphologyBias shadow := by
  intro h
  rcases h with ⟨classify, hclassify⟩
  have hAgree :=
    signature_only_classifier_agrees_on_fifty_four_d_witnesses
      classify (fun shadow => 0 < signedMorphologyBias shadow) hclassify
  have hStarPos : 0 < signedMorphologyBias fiftyFourDStellarShadow := by
    exact hAgree.mpr fifty_four_d_saturn_shadow_has_positive_bias
  have hStarNeg : signedMorphologyBias fiftyFourDStellarShadow < 0 :=
    fifty_four_d_stellar_shadow_has_negative_bias
  omega

end ForkRaceFoldTheorems
