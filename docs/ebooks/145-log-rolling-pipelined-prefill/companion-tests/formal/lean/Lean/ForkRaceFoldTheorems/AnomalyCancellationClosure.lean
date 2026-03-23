import Mathlib
import ForkRaceFoldTheorems.FlavorPhaseClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Anomaly Cancellation Closure

This module adds a bounded one-generation anomaly-cancellation shell using the
standard left-handed Weyl hypercharge bookkeeping. It is a finite algebraic
closure, not a full gauge-theory derivation.
-/

inductive WeylField where
  | qL
  | uRc
  | dRc
  | lL
  | eRc
  deriving DecidableEq, Repr

def hypercharge : WeylField → Rat
  | .qL => 1 / 6
  | .uRc => -2 / 3
  | .dRc => 1 / 3
  | .lL => -1 / 2
  | .eRc => 1

def su3SquaredU1Anomaly : Rat :=
  2 * hypercharge .qL + hypercharge .uRc + hypercharge .dRc

def su2SquaredU1Anomaly : Rat :=
  3 * hypercharge .qL + hypercharge .lL

def gravitationalSquaredU1Anomaly : Rat :=
  6 * hypercharge .qL + 3 * hypercharge .uRc + 3 * hypercharge .dRc +
    2 * hypercharge .lL + hypercharge .eRc

def cubicU1Anomaly : Rat :=
  6 * hypercharge .qL ^ 3 + 3 * hypercharge .uRc ^ 3 + 3 * hypercharge .dRc ^ 3 +
    2 * hypercharge .lL ^ 3 + hypercharge .eRc ^ 3

/-- Master bounded anomaly-cancellation shell. -/
abbrev AnomalyCancellationClosureLaw : Prop :=
  su3SquaredU1Anomaly = 0 ∧
    su2SquaredU1Anomaly = 0 ∧
    gravitationalSquaredU1Anomaly = 0 ∧
    cubicU1Anomaly = 0

theorem su3SquaredU1_cancels :
    su3SquaredU1Anomaly = 0 := by
  norm_num [su3SquaredU1Anomaly, hypercharge]

theorem su2SquaredU1_cancels :
    su2SquaredU1Anomaly = 0 := by
  norm_num [su2SquaredU1Anomaly, hypercharge]

theorem gravitationalSquaredU1_cancels :
    gravitationalSquaredU1Anomaly = 0 := by
  norm_num [gravitationalSquaredU1Anomaly, hypercharge]

theorem cubicU1_cancels :
    cubicU1Anomaly = 0 := by
  norm_num [cubicU1Anomaly, hypercharge]

theorem anomaly_cancellation_closure : AnomalyCancellationClosureLaw := by
  exact ⟨su3SquaredU1_cancels,
    su2SquaredU1_cancels,
    gravitationalSquaredU1_cancels,
    cubicU1_cancels⟩

end

end ForkRaceFoldTheorems
