import Init

/-!
# CMB Visibility Boundary

This module isolates the photon-observation boundary from the broader
cosmic horizon story.

The claim is intentionally narrow:

- photon telescopes observe by receiving freely propagating photons
- in the model, free propagation begins at recombination / last scattering
- therefore any photon-visible emission time must be at or after the
  recombination boundary

This does **not** claim that nothing exists before recombination.
It only states that photon-based observation cannot directly image
earlier epochs.
-/

namespace CMBVisibilityBoundary

/-- A minimal photon-visibility model. -/
structure PhotonVisibilityModel where
  /-- Recombination / last-scattering time. -/
  recombinationTime : Nat
  /-- Observation time of the telescope. -/
  observationTime : Nat
  /-- Recombination occurs no later than the observation. -/
  recombination_before_observation : recombinationTime ≤ observationTime

/-- An epoch is opaque to photon telescopes when it lies before
recombination. -/
def PhotonVisibilityModel.opaqueEpoch (m : PhotonVisibilityModel) (emissionTime : Nat) : Prop :=
  emissionTime < m.recombinationTime

/-- An epoch is photon-visible exactly when it lies between the
last-scattering surface and the observation time. -/
def PhotonVisibilityModel.photonVisible
    (m : PhotonVisibilityModel) (emissionTime : Nat) : Prop :=
  m.recombinationTime ≤ emissionTime ∧ emissionTime ≤ m.observationTime

/-- In this model, telescope observability is photon observability. -/
def PhotonVisibilityModel.telescopeObservable
    (m : PhotonVisibilityModel) (emissionTime : Nat) : Prop :=
  m.photonVisible emissionTime

/-- Anything before recombination is not photon-visible. -/
theorem opaque_epoch_not_photon_visible
    (m : PhotonVisibilityModel) (emissionTime : Nat)
    (hOpaque : m.opaqueEpoch emissionTime) :
    ¬ m.photonVisible emissionTime := by
  intro hVisible
  unfold PhotonVisibilityModel.opaqueEpoch PhotonVisibilityModel.photonVisible at *
  omega

/-- Therefore a photon telescope cannot directly see any epoch before
recombination. -/
theorem telescope_cannot_see_before_recombination
    (m : PhotonVisibilityModel) (emissionTime : Nat)
    (hOpaque : m.opaqueEpoch emissionTime) :
    ¬ m.telescopeObservable emissionTime := by
  exact opaque_epoch_not_photon_visible m emissionTime hOpaque

/-- Any telescope-visible epoch is at or after recombination. This is
the last-scattering boundary as an observation floor. -/
theorem telescope_observable_implies_at_or_after_recombination
    (m : PhotonVisibilityModel) (emissionTime : Nat)
    (hVisible : m.telescopeObservable emissionTime) :
    m.recombinationTime ≤ emissionTime := by
  exact hVisible.1

/-- Anything after the observation time is not photon-visible yet. -/
theorem after_observation_not_photon_visible
    (m : PhotonVisibilityModel) (emissionTime : Nat)
    (hFuture : m.observationTime < emissionTime) :
    ¬ m.photonVisible emissionTime := by
  intro hVisible
  unfold PhotonVisibilityModel.photonVisible at hVisible
  omega

/-- Therefore a telescope cannot directly see any epoch after the
observation time either. -/
theorem telescope_cannot_see_future
    (m : PhotonVisibilityModel) (emissionTime : Nat)
    (hFuture : m.observationTime < emissionTime) :
    ¬ m.telescopeObservable emissionTime := by
  exact after_observation_not_photon_visible m emissionTime hFuture

/-- Telescope invisibility is exactly the statement that the emission
time lies outside the closed visibility interval. -/
theorem not_telescope_observable_iff_before_recombination_or_after_observation
    (m : PhotonVisibilityModel) (emissionTime : Nat) :
    ¬ m.telescopeObservable emissionTime ↔
      emissionTime < m.recombinationTime ∨ m.observationTime < emissionTime := by
  constructor
  · intro hNotVisible
    by_cases hBefore : emissionTime < m.recombinationTime
    · exact Or.inl hBefore
    · have hAtOrAfter : m.recombinationTime ≤ emissionTime := Nat.le_of_not_gt hBefore
      by_cases hAfter : m.observationTime < emissionTime
      · exact Or.inr hAfter
      · have hAtOrBefore : emissionTime ≤ m.observationTime := Nat.le_of_not_gt hAfter
        have hVisible : m.telescopeObservable emissionTime := by
          unfold PhotonVisibilityModel.telescopeObservable PhotonVisibilityModel.photonVisible
          exact ⟨hAtOrAfter, hAtOrBefore⟩
        exact False.elim (hNotVisible hVisible)
  · intro hOutside
    cases hOutside with
    | inl hBefore =>
        exact telescope_cannot_see_before_recombination m emissionTime hBefore
    | inr hAfter =>
        exact telescope_cannot_see_future m emissionTime hAfter

/-- Equivalently, telescope visibility holds exactly when the emission
time is not outside the visibility interval. -/
theorem telescope_observable_iff_not_before_recombination_or_after_observation
    (m : PhotonVisibilityModel) (emissionTime : Nat) :
    m.telescopeObservable emissionTime ↔
      ¬ (emissionTime < m.recombinationTime ∨ m.observationTime < emissionTime) := by
  constructor
  · intro hVisible hOutside
    exact
      (not_telescope_observable_iff_before_recombination_or_after_observation m emissionTime).2
        hOutside hVisible
  · intro hInside
    by_cases hVisible : m.telescopeObservable emissionTime
    · exact hVisible
    · exact False.elim
        (hInside
          ((not_telescope_observable_iff_before_recombination_or_after_observation m emissionTime).1
            hVisible))

/-- Recombination itself is visible from any later observation time.
This is the CMB / last-scattering surface witness. -/
theorem recombination_surface_visible
    (m : PhotonVisibilityModel) :
    m.telescopeObservable m.recombinationTime := by
  unfold PhotonVisibilityModel.telescopeObservable PhotonVisibilityModel.photonVisible
  exact ⟨Nat.le_refl _, m.recombination_before_observation⟩

/-- The recombination surface is the earliest photon-visible epoch in
the model. -/
theorem recombination_is_earliest_visible_epoch
    (m : PhotonVisibilityModel) (emissionTime : Nat) :
    m.telescopeObservable emissionTime ↔
      m.recombinationTime ≤ emissionTime ∧ emissionTime ≤ m.observationTime := by
  rfl

/-- Concrete witness values in years for the standard cosmology shell:
roughly 380,000 years to recombination, roughly 13.8 billion years to
the present observation epoch. -/
def recombinationYears : Nat := 380000
def presentYears : Nat := 13800000000

/-- The concrete chronology is ordered correctly. -/
theorem recombination_before_present : recombinationYears < presentYears := by
  native_decide

/-- A concrete present-day photon-visibility model. -/
def standardPhotonVisibilityModel : PhotonVisibilityModel where
  recombinationTime := recombinationYears
  observationTime := presentYears
  recombination_before_observation := Nat.le_of_lt recombination_before_present

/-- A present-day telescope sees the last-scattering surface. -/
theorem cmb_visible_now :
    standardPhotonVisibilityModel.telescopeObservable recombinationYears := by
  exact recombination_surface_visible standardPhotonVisibilityModel

/-- The observation epoch itself is always visible in the model. -/
theorem observation_epoch_visible
    (m : PhotonVisibilityModel) :
    m.telescopeObservable m.observationTime := by
  unfold PhotonVisibilityModel.telescopeObservable PhotonVisibilityModel.photonVisible
  exact ⟨m.recombination_before_observation, Nat.le_refl _⟩

/-- In the concrete present-day model, the present epoch is visible. -/
theorem present_epoch_visible_now :
    standardPhotonVisibilityModel.telescopeObservable presentYears := by
  simpa [standardPhotonVisibilityModel, presentYears] using
    observation_epoch_visible standardPhotonVisibilityModel

/-- A present-day telescope cannot see one year before recombination in
this photon model. -/
theorem pre_cmb_not_visible_now :
    ¬ standardPhotonVisibilityModel.telescopeObservable (recombinationYears - 1) := by
  apply telescope_cannot_see_before_recombination
  unfold PhotonVisibilityModel.opaqueEpoch standardPhotonVisibilityModel
    recombinationYears
  simp

/-- A present-day telescope also cannot see one year beyond the present
observation epoch. -/
theorem post_present_not_visible_now :
    ¬ standardPhotonVisibilityModel.telescopeObservable (presentYears + 1) := by
  apply telescope_cannot_see_future
  unfold standardPhotonVisibilityModel presentYears
  native_decide

end CMBVisibilityBoundary
