import Mathlib
import ForkRaceFoldTheorems.ScatteringAmplitudeClosure
import ForkRaceFoldTheorems.StandardModelShellClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Extended Standard Model Shell Closure

This module packages the strongest bounded Standard-Model-style shell the
current repo now supports: the earlier particle/flavor/coupling/scattering
surface plus discrete phases, one-generation anomaly cancellation, continuous
beta-function sign structure, and amplitude/cross-section proxies.
-/

/-- Master extended bounded Standard-Model-style shell. -/
abbrev ExtendedStandardModelShellClosureLaw : Prop :=
  StandardModelShellClosureLaw ∧
    FlavorPhaseClosureLaw ∧
    AnomalyCancellationClosureLaw ∧
    ContinuousBetaFunctionClosureLaw ∧
    ScatteringAmplitudeClosureLaw

theorem extended_standard_model_shell_closure :
    ExtendedStandardModelShellClosureLaw := by
  exact ⟨standard_model_shell_closure,
    flavor_phase_closure,
    anomaly_cancellation_closure,
    continuous_beta_function_closure,
    scattering_amplitude_closure⟩

end

end ForkRaceFoldTheorems
