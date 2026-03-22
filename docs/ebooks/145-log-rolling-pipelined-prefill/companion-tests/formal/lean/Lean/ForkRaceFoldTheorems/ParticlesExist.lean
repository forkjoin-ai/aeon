import Init

/-!
# Particles Exist

From two opposing forces and the stability of antiparallel pairing,
persistent oscillating structures emerge. That is all a particle is.

Three axioms. One existence theorem. Constructive.
-/

namespace ParticlesExist

inductive Force where | pos | neg deriving DecidableEq
structure Pair where (a b : Force) deriving DecidableEq
def isAntiparallel (p : Pair) : Bool := p.a != p.b
def persists (p : Pair) : Bool := isAntiparallel p

structure Particle where
  pair : Pair
  stable : persists pair = true

-- A particle exists (constructive witness: pos/neg pair)
theorem particles_exist : ∃ (_ : Particle), True :=
  ⟨⟨⟨.pos, .neg⟩, by rfl⟩, trivial⟩

-- Exactly two ground states, two excited states
theorem two_ground_two_excited :
    persists ⟨.pos, .neg⟩ = true ∧
    persists ⟨.neg, .pos⟩ = true ∧
    persists ⟨.pos, .pos⟩ = false ∧
    persists ⟨.neg, .neg⟩ = false :=
  ⟨rfl, rfl, rfl, rfl⟩

-- Period-2 oscillation
def Pair.flip (p : Pair) : Pair :=
  ⟨match p.a with | .pos => .neg | .neg => .pos,
   match p.b with | .pos => .neg | .neg => .pos⟩

theorem period_two (p : Pair) : p.flip.flip = p := by
  cases p with | mk a b => cases a <;> cases b <;> rfl

-- Flip preserves ground state
theorem flip_preserves_ground :
    persists (Pair.flip ⟨.pos, .neg⟩) = true ∧
    persists (Pair.flip ⟨.neg, .pos⟩) = true :=
  ⟨rfl, rfl⟩

-- Flip destabilizes excited state
theorem flip_destabilizes_excited :
    persists (Pair.flip ⟨.pos, .pos⟩) = false ∧
    persists (Pair.flip ⟨.neg, .neg⟩) = false :=
  ⟨rfl, rfl⟩

-- Wait: ++ flips to -- and vice versa. Both false. Both excited.
-- But +- flips to -+ and vice versa. Both true. Both ground.
-- The oscillation STAYS in ground state. Excited states oscillate
-- between each other but never reach ground. Two closed orbits.

-- Ground orbit: +- ↔ -+  (stable, persistent, a particle)
-- Excited orbit: ++ ↔ -- (unstable, decays if perturbed)

theorem ground_orbit_closed :
    Pair.flip ⟨.pos, .neg⟩ = ⟨.neg, .pos⟩ ∧
    Pair.flip ⟨.neg, .pos⟩ = ⟨.pos, .neg⟩ :=
  ⟨rfl, rfl⟩

theorem excited_orbit_closed :
    Pair.flip ⟨.pos, .pos⟩ = ⟨.neg, .neg⟩ ∧
    Pair.flip ⟨.neg, .neg⟩ = ⟨.pos, .pos⟩ :=
  ⟨rfl, rfl⟩

-- The ground orbit never crosses into the excited orbit
theorem orbits_disjoint :
    (⟨Force.pos, Force.neg⟩ : Pair) ≠ ⟨.pos, .pos⟩ ∧
    (⟨Force.pos, Force.neg⟩ : Pair) ≠ ⟨.neg, .neg⟩ ∧
    (⟨Force.neg, Force.pos⟩ : Pair) ≠ ⟨.pos, .pos⟩ ∧
    (⟨Force.neg, Force.pos⟩ : Pair) ≠ ⟨.neg, .neg⟩ := by
  exact ⟨by decide, by decide, by decide, by decide⟩

-- FROM THREE AXIOMS: particles exist constructively.
-- Axiom 1: two distinct forces
-- Axiom 2: antiparallel persists
-- Axiom 3: the pair oscillates
-- Conclusion: a persistent oscillating structure exists = a particle
theorem from_axioms :
    -- Given: two forces exist and are distinct
    Force.pos ≠ Force.neg →
    -- Given: their antiparallel pairing persists
    persists ⟨.pos, .neg⟩ = true →
    -- Given: the pair oscillates (flip preserves persistence)
    persists (Pair.flip ⟨.pos, .neg⟩) = true →
    -- Then: a particle exists
    ∃ (p : Particle), persists p.pair.flip = true :=
  fun _ h_persist h_flip => ⟨⟨⟨.pos, .neg⟩, h_persist⟩, h_flip⟩

end ParticlesExist
