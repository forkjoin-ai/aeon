import Mathlib
import ForkRaceFoldTheorems.ParticleTheoryCoreClosure

namespace ForkRaceFoldTheorems

noncomputable section

/-!
# Residual Strong Force Closure

This module adds the smallest honest nucleus-level shell on top of the
confinement surface. It packages a short-range residual attraction, Coulomb
repulsion for proton-proton pairs, and the resulting proton-neutron advantage.
-/

inductive Nucleon where
  | proton
  | neutron
  deriving DecidableEq, Repr

inductive NuclearShell where
  | contact
  | bound
  | far
  deriving DecidableEq, Repr

def residualStrongStrength : NuclearShell → Rat
  | .contact => 5
  | .bound => 2
  | .far => 0

def coulombRepulsion : Nucleon → Nucleon → Rat
  | .proton, .proton => 1
  | _, _ => 0

def netNuclearBinding (a b : Nucleon) (s : NuclearShell) : Rat :=
  residualStrongStrength s - coulombRepulsion a b

/-- Master bounded residual-strong-force shell. -/
abbrev ResidualStrongForceClosureLaw : Prop :=
  (∀ a b s, netNuclearBinding a b s = netNuclearBinding b a s) ∧
    (residualStrongStrength .contact > residualStrongStrength .bound ∧
      residualStrongStrength .bound > residualStrongStrength .far) ∧
    (∀ a b, 0 < netNuclearBinding a b .contact) ∧
    (netNuclearBinding .proton .proton .bound > 0 ∧
      netNuclearBinding .proton .neutron .bound > 0 ∧
      netNuclearBinding .neutron .neutron .bound > 0) ∧
    (∀ a b, netNuclearBinding a b .far ≤ 0) ∧
    (netNuclearBinding .proton .neutron .contact >
      netNuclearBinding .proton .proton .contact) ∧
    (netNuclearBinding .proton .neutron .bound >
      netNuclearBinding .proton .proton .bound)

theorem netNuclearBinding_symmetric :
    ∀ a b s, netNuclearBinding a b s = netNuclearBinding b a s := by
  intro a b s
  cases a <;> cases b <;> cases s <;> norm_num [netNuclearBinding,
    residualStrongStrength, coulombRepulsion]

theorem residualStrong_shell_order :
    residualStrongStrength .contact > residualStrongStrength .bound ∧
      residualStrongStrength .bound > residualStrongStrength .far := by
  norm_num [residualStrongStrength]

theorem contact_shell_binds_all_nucleons :
    ∀ a b, 0 < netNuclearBinding a b .contact := by
  intro a b
  cases a <;> cases b <;> norm_num [netNuclearBinding, residualStrongStrength,
    coulombRepulsion]

theorem bound_shell_binds_all_nucleons :
    netNuclearBinding .proton .proton .bound > 0 ∧
      netNuclearBinding .proton .neutron .bound > 0 ∧
      netNuclearBinding .neutron .neutron .bound > 0 := by
  norm_num [netNuclearBinding, residualStrongStrength, coulombRepulsion]

theorem far_shell_has_no_positive_binding :
    ∀ a b, netNuclearBinding a b .far ≤ 0 := by
  intro a b
  cases a <;> cases b <;> norm_num [netNuclearBinding, residualStrongStrength,
    coulombRepulsion]

theorem proton_neutron_contact_advantage :
    netNuclearBinding .proton .neutron .contact >
      netNuclearBinding .proton .proton .contact := by
  norm_num [netNuclearBinding, residualStrongStrength, coulombRepulsion]

theorem proton_neutron_bound_advantage :
    netNuclearBinding .proton .neutron .bound >
      netNuclearBinding .proton .proton .bound := by
  norm_num [netNuclearBinding, residualStrongStrength, coulombRepulsion]

theorem residual_strong_force_closure : ResidualStrongForceClosureLaw := by
  exact ⟨netNuclearBinding_symmetric,
    residualStrong_shell_order,
    contact_shell_binds_all_nucleons,
    bound_shell_binds_all_nucleons,
    far_shell_has_no_positive_binding,
    proton_neutron_contact_advantage,
    proton_neutron_bound_advantage⟩

end

end ForkRaceFoldTheorems
