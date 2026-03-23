import Mathlib
import ForkRaceFoldTheorems.ContinuousBetaFunctionClosure
import ForkRaceFoldTheorems.ElectroweakScatteringClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Scattering Amplitude Closure

This module adds the smallest honest amplitude/cross-section shell the current
repo can support. The amplitudes are bounded tree-level proxies derived from
the named mediator strengths; they are not collider-level amplitudes.
-/

def channelAmplitude (c : ScatteringChannel) : Rat := c.mediatorStrength

def crossSectionProxy (c : ScatteringChannel) : Rat :=
  channelAmplitude c * channelAmplitude c

/-- Master bounded amplitude/cross-section shell. -/
abbrev ScatteringAmplitudeClosureLaw : Prop :=
  0 < channelAmplitude betaDecayChannel ∧
    0 < channelAmplitude neutrinoElectronNeutralChannel ∧
    0 < channelAmplitude protonElectronElasticChannel ∧
    channelAmplitude betaDecayChannel = channelAmplitude neutrinoElectronNeutralChannel ∧
    channelAmplitude betaDecayChannel > channelAmplitude protonElectronElasticChannel ∧
    0 < crossSectionProxy betaDecayChannel ∧
    0 < crossSectionProxy neutrinoElectronNeutralChannel ∧
    0 < crossSectionProxy protonElectronElasticChannel ∧
    crossSectionProxy betaDecayChannel = crossSectionProxy neutrinoElectronNeutralChannel ∧
    crossSectionProxy betaDecayChannel > crossSectionProxy protonElectronElasticChannel

theorem betaDecayChannel_amplitude_positive :
    0 < channelAmplitude betaDecayChannel := by
  norm_num [channelAmplitude, betaDecayChannel, weakLikeCoupling]

theorem neutrinoElectronNeutralChannel_amplitude_positive :
    0 < channelAmplitude neutrinoElectronNeutralChannel := by
  norm_num [channelAmplitude, neutrinoElectronNeutralChannel, weakLikeCoupling]

theorem protonElectronElasticChannel_amplitude_positive :
    0 < channelAmplitude protonElectronElasticChannel := by
  norm_num [channelAmplitude, protonElectronElasticChannel, electromagneticLikeCoupling]

theorem weak_channels_have_equal_amplitude :
    channelAmplitude betaDecayChannel =
      channelAmplitude neutrinoElectronNeutralChannel := by
  rfl

theorem weak_channel_amplitude_dominates_electromagnetic_channel :
    channelAmplitude betaDecayChannel >
      channelAmplitude protonElectronElasticChannel := by
  norm_num [channelAmplitude, betaDecayChannel, protonElectronElasticChannel,
    weakLikeCoupling, electromagneticLikeCoupling]

theorem betaDecayChannel_crossSection_positive :
    0 < crossSectionProxy betaDecayChannel := by
  norm_num [crossSectionProxy, channelAmplitude, betaDecayChannel, weakLikeCoupling]

theorem neutrinoElectronNeutralChannel_crossSection_positive :
    0 < crossSectionProxy neutrinoElectronNeutralChannel := by
  norm_num [crossSectionProxy, channelAmplitude, neutrinoElectronNeutralChannel, weakLikeCoupling]

theorem protonElectronElasticChannel_crossSection_positive :
    0 < crossSectionProxy protonElectronElasticChannel := by
  norm_num [crossSectionProxy, channelAmplitude, protonElectronElasticChannel,
    electromagneticLikeCoupling]

theorem weak_channels_have_equal_crossSection :
    crossSectionProxy betaDecayChannel =
      crossSectionProxy neutrinoElectronNeutralChannel := by
  rfl

theorem weak_channel_crossSection_dominates_electromagnetic_channel :
    crossSectionProxy betaDecayChannel >
      crossSectionProxy protonElectronElasticChannel := by
  norm_num [crossSectionProxy, channelAmplitude, betaDecayChannel,
    protonElectronElasticChannel, weakLikeCoupling, electromagneticLikeCoupling]

theorem scattering_amplitude_closure : ScatteringAmplitudeClosureLaw := by
  exact ⟨betaDecayChannel_amplitude_positive,
    neutrinoElectronNeutralChannel_amplitude_positive,
    protonElectronElasticChannel_amplitude_positive,
    weak_channels_have_equal_amplitude,
    weak_channel_amplitude_dominates_electromagnetic_channel,
    betaDecayChannel_crossSection_positive,
    neutrinoElectronNeutralChannel_crossSection_positive,
    protonElectronElasticChannel_crossSection_positive,
    weak_channels_have_equal_crossSection,
    weak_channel_crossSection_dominates_electromagnetic_channel⟩

end

end ForkRaceFoldTheorems
