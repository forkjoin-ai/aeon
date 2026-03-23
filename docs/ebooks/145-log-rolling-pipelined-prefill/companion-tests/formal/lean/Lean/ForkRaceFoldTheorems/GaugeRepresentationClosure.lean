import Mathlib
import ForkRaceFoldTheorems.AnomalyCancellationClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Gauge Representation Closure

This module adds the smallest honest gauge-representation shell on top of the
bounded anomaly-cancellation surface. It does not attempt a full Lie-algebra
or covariant-derivative derivation. It fixes one explicit representation table
for the one-generation Weyl fields together with the Higgs doublet witness.
-/

inductive SU3Representation where
  | singlet
  | triplet
  | antitriplet
  deriving DecidableEq, Repr

inductive SU2Representation where
  | singlet
  | doublet
  deriving DecidableEq, Repr

def su3Representation : WeylField → SU3Representation
  | .qL => .triplet
  | .uRc => .antitriplet
  | .dRc => .antitriplet
  | .lL => .singlet
  | .eRc => .singlet

def su2Representation : WeylField → SU2Representation
  | .qL => .doublet
  | .uRc => .singlet
  | .dRc => .singlet
  | .lL => .doublet
  | .eRc => .singlet

def colorDimension : SU3Representation → Nat
  | .singlet => 1
  | .triplet => 3
  | .antitriplet => 3

def weakDimension : SU2Representation → Nat
  | .singlet => 1
  | .doublet => 2

def higgsSU3Representation : SU3Representation := .singlet
def higgsSU2Representation : SU2Representation := .doublet
def higgsHypercharge : Rat := 1 / 2
def conjugateHiggsHypercharge : Rat := -1 / 2

/-- Master bounded gauge-representation shell. -/
abbrev GaugeRepresentationClosureLaw : Prop :=
  su3Representation .qL = .triplet ∧
    su2Representation .qL = .doublet ∧
    su3Representation .uRc = .antitriplet ∧
    su2Representation .uRc = .singlet ∧
    su3Representation .dRc = .antitriplet ∧
    su2Representation .dRc = .singlet ∧
    su3Representation .lL = .singlet ∧
    su2Representation .lL = .doublet ∧
    su3Representation .eRc = .singlet ∧
    su2Representation .eRc = .singlet ∧
    colorDimension (su3Representation .qL) = 3 ∧
    weakDimension (su2Representation .qL) = 2 ∧
    colorDimension (su3Representation .lL) = 1 ∧
    weakDimension (su2Representation .eRc) = 1 ∧
    higgsSU3Representation = .singlet ∧
    higgsSU2Representation = .doublet ∧
    higgsHypercharge = 1 / 2 ∧
    conjugateHiggsHypercharge = -1 / 2

theorem quark_doublet_gauge_representation :
    su3Representation .qL = .triplet ∧
      su2Representation .qL = .doublet ∧
      colorDimension (su3Representation .qL) = 3 ∧
      weakDimension (su2Representation .qL) = 2 := by
  exact ⟨rfl, rfl, rfl, rfl⟩

theorem up_quark_singlet_shell :
    su3Representation .uRc = .antitriplet ∧
      su2Representation .uRc = .singlet := by
  exact ⟨rfl, rfl⟩

theorem down_quark_singlet_shell :
    su3Representation .dRc = .antitriplet ∧
      su2Representation .dRc = .singlet := by
  exact ⟨rfl, rfl⟩

theorem lepton_gauge_representation :
    su3Representation .lL = .singlet ∧
      su2Representation .lL = .doublet ∧
      su3Representation .eRc = .singlet ∧
      su2Representation .eRc = .singlet := by
  exact ⟨rfl, rfl, rfl, rfl⟩

theorem higgs_doublet_shell :
    higgsSU3Representation = .singlet ∧
      higgsSU2Representation = .doublet ∧
      higgsHypercharge = 1 / 2 ∧
      conjugateHiggsHypercharge = -1 / 2 := by
  norm_num [higgsSU3Representation, higgsSU2Representation,
    higgsHypercharge, conjugateHiggsHypercharge]

theorem gauge_representation_closure : GaugeRepresentationClosureLaw := by
  exact ⟨rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl, rfl,
    higgs_doublet_shell⟩

end

end ForkRaceFoldTheorems
