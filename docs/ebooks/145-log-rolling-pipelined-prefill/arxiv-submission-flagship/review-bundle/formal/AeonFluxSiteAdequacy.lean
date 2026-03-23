import Mathlib
import ForkRaceFoldTheorems.TopologicalMismatchAdequacy

namespace ForkRaceFoldTheorems

/-!
Track Theta+: Aeon Flux Site Adequacy

This file repackages the finite topological-mismatch adequacy theorem in the
repo's transport vocabulary. An Aeon Flux site declares a positive FlowFrame
stream budget and a computation-side path count. A transport witness assigns
each path to one concrete stream.

The theorem surface is intentionally thin:

* `Δβ ≤ 0` iff the declared site admits a lossless FlowFrame transport witness
* `Δβ = 0` iff the site admits a tight lossless witness
* `Δβ > 0` forces every FlowFrame transport witness to collide and lose
  information
-/

/-- Minimal Aeon Flux site surface: computation paths plus a positive stream
    budget in the FlowFrame transport layer. -/
structure AeonFluxSite where
  pathCount : ℕ
  streamCount : ℕ
  hStreams : 0 < streamCount

/-- A FlowFrame transport witness assigns each site path to one concrete
    transport stream. -/
structure FlowFrameTransport (S : AeonFluxSite) where
  assign : Fin S.pathCount → Fin S.streamCount

/-- The finite fork/race/fold workload induced by an Aeon Flux site. -/
def AeonFluxSite.workload (S : AeonFluxSite) : FRFWorkload where
  pathCount := S.pathCount

/-- The site's topological mismatch, phrased in the existing deficit model. -/
def AeonFluxSite.deficit (S : AeonFluxSite) : ℤ :=
  topologicalDeficit S.pathCount S.streamCount

/-- Re-read a FlowFrame transport witness as the generic realization consumed by
    `TopologicalMismatchAdequacy`. -/
def FlowFrameTransport.toRealization {S : AeonFluxSite}
    (transport : FlowFrameTransport S) :
    Realization S.workload S.streamCount where
  assign := transport.assign

/-- Re-wrap a generic realization back into the Aeon Flux transport vocabulary. -/
def FlowFrameTransport.ofRealization {S : AeonFluxSite}
    (realization : Realization S.workload S.streamCount) :
    FlowFrameTransport S where
  assign := realization.assign

/-- Lossless site transport means the FlowFrame assignment is injective. -/
def losslessTransport {S : AeonFluxSite}
    (transport : FlowFrameTransport S) : Prop :=
  lossless transport.toRealization

/-- Tight site transport means every declared FlowFrame stream is used. -/
def tightTransport {S : AeonFluxSite}
    (transport : FlowFrameTransport S) : Prop :=
  tight transport.toRealization

/-- Positive information loss is just the realization-level noninjectivity
    re-read in site transport terms. -/
def positiveInformationLossTransport {S : AeonFluxSite}
    (transport : FlowFrameTransport S) : Prop :=
  positiveInformationLoss transport.toRealization

/-- A site transport collision witnesses two distinct paths mapped onto one
    FlowFrame stream. -/
def pathCollisionTransport {S : AeonFluxSite}
    (transport : FlowFrameTransport S) : Prop :=
  pathCollision transport.toRealization

theorem exists_lossless_realization_iff_exists_lossless_transport
    (S : AeonFluxSite) :
    (∃ realization : Realization S.workload S.streamCount, lossless realization) ↔
      ∃ transport : FlowFrameTransport S, losslessTransport transport := by
  constructor
  · rintro ⟨realization, hLossless⟩
    exact ⟨FlowFrameTransport.ofRealization realization, hLossless⟩
  · rintro ⟨transport, hLossless⟩
    exact ⟨transport.toRealization, hLossless⟩

theorem exists_tight_lossless_realization_iff_exists_tight_lossless_transport
    (S : AeonFluxSite) :
    (∃ realization : Realization S.workload S.streamCount,
        lossless realization ∧ tight realization) ↔
      ∃ transport : FlowFrameTransport S,
        losslessTransport transport ∧ tightTransport transport := by
  constructor
  · rintro ⟨realization, hLossless, hTight⟩
    exact ⟨FlowFrameTransport.ofRealization realization, hLossless, hTight⟩
  · rintro ⟨transport, hLossless, hTight⟩
    exact ⟨transport.toRealization, hLossless, hTight⟩

theorem aeon_flux_site_nonpositive_deficit_iff_lossless_transport
    (S : AeonFluxSite) :
    S.deficit ≤ 0 ↔ ∃ transport : FlowFrameTransport S, losslessTransport transport := by
  have hBase :
      topologicalDeficit S.pathCount S.streamCount ≤ 0 ↔
        ∃ realization : Realization S.workload S.streamCount, lossless realization :=
    nonpositive_deficit_iff_lossless_realization
      S.workload (transportStreams := S.streamCount) S.hStreams
  have hDeficit :
      S.deficit ≤ 0 ↔
        ∃ realization : Realization S.workload S.streamCount, lossless realization := by
    simpa [AeonFluxSite.deficit] using hBase
  exact hDeficit.trans
    (exists_lossless_realization_iff_exists_lossless_transport S)

theorem aeon_flux_site_zero_deficit_iff_tight_lossless_transport
    (S : AeonFluxSite)
    (hPaths : 0 < S.pathCount) :
    S.deficit = 0 ↔
      ∃ transport : FlowFrameTransport S,
        losslessTransport transport ∧ tightTransport transport := by
  have hBase :
      topologicalDeficit S.pathCount S.streamCount = 0 ↔
        ∃ realization : Realization S.workload S.streamCount,
          lossless realization ∧ tight realization :=
    zero_deficit_iff_tight_lossless_realization
      S.workload (transportStreams := S.streamCount) hPaths S.hStreams
  have hDeficit :
      S.deficit = 0 ↔
        ∃ realization : Realization S.workload S.streamCount,
          lossless realization ∧ tight realization := by
    simpa [AeonFluxSite.deficit] using hBase
  exact hDeficit.trans
    (exists_tight_lossless_realization_iff_exists_tight_lossless_transport S)

theorem aeon_flux_site_positive_deficit_forces_collision_and_information_loss
    (S : AeonFluxSite)
    (hDef : 0 < S.deficit) :
    ∀ transport : FlowFrameTransport S,
      pathCollisionTransport transport ∧
        positiveInformationLossTransport transport := by
  intro transport
  simpa [AeonFluxSite.deficit, pathCollisionTransport,
    positiveInformationLossTransport] using
    positive_deficit_forces_collision_and_information_loss
      S.workload (transportStreams := S.streamCount) S.hStreams
      (by simpa [AeonFluxSite.deficit] using hDef)
      transport.toRealization

end ForkRaceFoldTheorems
