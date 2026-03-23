import Mathlib
import ForkRaceFoldTheorems.ScatteringAmplitudeClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Kinematic Scattering Closure

This module adds the smallest honest kinematic scattering shell on top of the
bounded amplitude proxies. It does not attempt full collider kinematics; it
packages named energy shells with exact positive weights and induced
cross-section proxies.
-/

inductive EnergyShell where
  | low
  | resonant
  | high
  deriving DecidableEq, Repr

def kinematicWeight : EnergyShell → Rat
  | .low => 1
  | .resonant => 1 / 2
  | .high => 1 / 4

def kinematicCrossSection (c : ScatteringChannel) (e : EnergyShell) : Rat :=
  crossSectionProxy c * kinematicWeight e

/-- Master bounded kinematic scattering shell. -/
abbrev KinematicScatteringClosureLaw : Prop :=
  (∀ e, 0 < kinematicWeight e) ∧
    (∀ e, 0 < kinematicCrossSection betaDecayChannel e) ∧
    (∀ e, 0 < kinematicCrossSection neutrinoElectronNeutralChannel e) ∧
    (∀ e, 0 < kinematicCrossSection protonElectronElasticChannel e) ∧
    (∀ e,
      kinematicCrossSection betaDecayChannel e =
        kinematicCrossSection neutrinoElectronNeutralChannel e) ∧
    (∀ e,
      kinematicCrossSection betaDecayChannel e >
        kinematicCrossSection protonElectronElasticChannel e) ∧
    (kinematicCrossSection betaDecayChannel .low >
      kinematicCrossSection betaDecayChannel .resonant ∧
      kinematicCrossSection betaDecayChannel .resonant >
        kinematicCrossSection betaDecayChannel .high)

theorem kinematicWeight_positive :
    ∀ e, 0 < kinematicWeight e := by
  intro e
  cases e <;> norm_num [kinematicWeight]

theorem betaDecay_kinematic_positive :
    ∀ e, 0 < kinematicCrossSection betaDecayChannel e := by
  intro e
  unfold kinematicCrossSection
  exact mul_pos betaDecayChannel_crossSection_positive (kinematicWeight_positive e)

theorem neutrinoElectronNeutral_kinematic_positive :
    ∀ e, 0 < kinematicCrossSection neutrinoElectronNeutralChannel e := by
  intro e
  unfold kinematicCrossSection
  exact mul_pos neutrinoElectronNeutralChannel_crossSection_positive (kinematicWeight_positive e)

theorem protonElectronElastic_kinematic_positive :
    ∀ e, 0 < kinematicCrossSection protonElectronElasticChannel e := by
  intro e
  unfold kinematicCrossSection
  exact mul_pos protonElectronElasticChannel_crossSection_positive (kinematicWeight_positive e)

theorem weak_channels_equal_on_all_shells :
    ∀ e,
      kinematicCrossSection betaDecayChannel e =
        kinematicCrossSection neutrinoElectronNeutralChannel e := by
  intro e
  unfold kinematicCrossSection
  rw [weak_channels_have_equal_crossSection]

theorem weak_channel_dominates_on_all_shells :
    ∀ e,
      kinematicCrossSection betaDecayChannel e >
        kinematicCrossSection protonElectronElasticChannel e := by
  intro e
  unfold kinematicCrossSection
  exact mul_lt_mul_of_pos_right
    weak_channel_crossSection_dominates_electromagnetic_channel
    (kinematicWeight_positive e)

theorem betaDecay_shell_order :
    kinematicCrossSection betaDecayChannel .low >
      kinematicCrossSection betaDecayChannel .resonant ∧
      kinematicCrossSection betaDecayChannel .resonant >
        kinematicCrossSection betaDecayChannel .high := by
  norm_num [kinematicCrossSection, crossSectionProxy, channelAmplitude, betaDecayChannel,
    weakLikeCoupling, kinematicWeight]

theorem kinematic_scattering_closure : KinematicScatteringClosureLaw := by
  exact ⟨kinematicWeight_positive,
    betaDecay_kinematic_positive,
    neutrinoElectronNeutral_kinematic_positive,
    protonElectronElastic_kinematic_positive,
    weak_channels_equal_on_all_shells,
    weak_channel_dominates_on_all_shells,
    betaDecay_shell_order⟩

end

end ForkRaceFoldTheorems
