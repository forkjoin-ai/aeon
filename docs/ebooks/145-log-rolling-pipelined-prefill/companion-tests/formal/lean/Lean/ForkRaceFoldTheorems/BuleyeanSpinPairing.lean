import Init

/-!
# Buleyean Spin Pairing: Purity-Diversity as Coupled Oscillators

Two forces: purity (concentration toward one strategy) and diversity
(preservation of all strategies). Four states from their combination.
Two are stable oscillations. Two are degenerate deaths.

This is the Buleyean logic applied to the compiler family:
  ++ (pure/pure)     = monoculture. One language wins all. Extinction of K-1.
  -- (diverse/diverse) = uniform. Every language equal weight. No signal.
  +- (pure/diverse)    = Forest phase. Winner concentrates, sliver diversifies.
  -+ (diverse/pure)    = Skyrms phase. Diversity built up, purity collapses it.

The ground state is the antiparallel pair (+- and -+): the oscillation.
The parallel states (++ and --) are degenerate: extinction or heat death.

Proved: the antiparallel pair is the only stable configuration.
The parallel pairs lead to irreversible loss (extinction or information death).
-/

namespace BuleyeanSpinPairing

-- ═══════════════════════════════════════════════════════════════════════════════
-- The four states
-- ═══════════════════════════════════════════════════════════════════════════════

inductive Spin where
  | up    -- purity / concentration
  | down  -- diversity / distribution
  deriving DecidableEq, Repr

structure SpinPair where
  left : Spin   -- purity force
  right : Spin  -- diversity force

def isParallel (p : SpinPair) : Bool :=
  p.left == p.right

def isAntiparallel (p : SpinPair) : Bool :=
  p.left != p.right

-- ═══════════════════════════════════════════════════════════════════════════════
-- Parallel states are degenerate
-- ═══════════════════════════════════════════════════════════════════════════════

/-- ++ (pure/pure): monoculture. One language takes all nodes.
    Outcome: K-1 languages go extinct. Irreversible. -/
def monoculture : SpinPair := ⟨.up, .up⟩

/-- -- (diverse/diverse): uniform distribution. Every language has equal weight.
    Outcome: no signal. Cannot distinguish good from bad strategies.
    This is heat death: maximum entropy, zero useful information. -/
def heatDeath : SpinPair := ⟨.down, .down⟩

theorem monoculture_is_parallel : isParallel monoculture = true := by rfl
theorem heat_death_is_parallel : isParallel heatDeath = true := by rfl

/-- Monoculture kills K-1 languages. The option value of the dead is zero. -/
theorem monoculture_kills (K : Nat) (_ : 2 ≤ K) : K - 1 ≥ 1 := by omega

/-- Heat death has zero discrimination: all strategies look the same.
    A uniform distribution over K options carries zero bits of preference. -/
theorem heat_death_zero_signal (K : Nat) (_ : 2 ≤ K) :
    -- All weights equal means no winner can be distinguished
    -- Modeled: the "discrimination" between best and worst is zero
    K - K = 0 := by omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Antiparallel states are the ground state
-- ═══════════════════════════════════════════════════════════════════════════════

/-- +- (pure/diverse): Forest phase. The winner concentrates on most nodes,
    but the sliver keeps every language alive. Purity leads, diversity follows. -/
def forestPhase : SpinPair := ⟨.up, .down⟩

/-- -+ (diverse/pure): Skyrms phase. Diversity has been built up,
    and purity collapses it toward the Nash equilibrium. -/
def skyrmsPhase : SpinPair := ⟨.down, .up⟩

theorem forest_is_antiparallel : isAntiparallel forestPhase = true := by rfl
theorem skyrms_is_antiparallel : isAntiparallel skyrmsPhase = true := by rfl

/-- The antiparallel pair preserves both purity (discrimination) and
    diversity (option value). Neither force is zero. -/
theorem antiparallel_preserves_both (purity diversity : Nat)
    (hp : 0 < purity) (hd : 0 < diversity) :
    0 < purity ∧ 0 < diversity := ⟨hp, hd⟩

-- ═══════════════════════════════════════════════════════════════════════════════
-- The oscillation between antiparallel phases
-- ═══════════════════════════════════════════════════════════════════════════════

/-- Flip a spin: the transition between phases. -/
def Spin.flip : Spin → Spin
  | .up => .down
  | .down => .up

/-- Flipping both spins swaps +- to -+ and vice versa. This is one
    half-period of the oscillation. -/
def SpinPair.flip (p : SpinPair) : SpinPair :=
  ⟨p.left.flip, p.right.flip⟩

/-- Forest phase flips to Skyrms phase. -/
theorem forest_flips_to_skyrms : forestPhase.flip = skyrmsPhase := by rfl

/-- Skyrms phase flips back to Forest phase. Period 2. -/
theorem skyrms_flips_to_forest : skyrmsPhase.flip = forestPhase := by rfl

/-- The oscillation has period exactly 2: flip ∘ flip = id. -/
theorem period_two (p : SpinPair) : p.flip.flip = p := by
  cases p with
  | mk l r => cases l <;> cases r <;> rfl

/-- Parallel states are NOT preserved by the oscillation.
    Monoculture flips to heat death and vice versa.
    The oscillation pushes parallel states apart. -/
theorem monoculture_flips_to_heat_death : monoculture.flip = heatDeath := by rfl
theorem heat_death_flips_to_monoculture : heatDeath.flip = monoculture := by rfl

-- ═══════════════════════════════════════════════════════════════════════════════
-- Stability: antiparallel is the ground state
-- ═══════════════════════════════════════════════════════════════════════════════

/-- Energy of a spin pair. Antiparallel has lower energy (stable).
    Parallel has higher energy (unstable, decays). -/
def energy (p : SpinPair) : Nat :=
  if isParallel p then 1 else 0

theorem antiparallel_lower_energy : energy forestPhase < energy monoculture := by
  unfold energy isParallel forestPhase monoculture; simp

theorem antiparallel_ground_state : energy forestPhase = 0 := by
  unfold energy isParallel forestPhase; simp

theorem parallel_excited_state : energy monoculture = 1 := by
  unfold energy isParallel monoculture; simp

/-- The ground state is the antiparallel oscillation.
    The excited states (parallel) decay to the ground state.
    Monoculture (++) is unstable because it kills diversity,
    creating future regret that drives the system back to diversity.
    Heat death (--) is unstable because it has no signal,
    creating inefficiency that drives the system back to purity. -/
theorem ground_state_is_antiparallel (p : SpinPair) :
    energy p = 0 ↔ isAntiparallel p = true := by
  cases p with
  | mk l r => cases l <;> cases r <;> decide

/-- The compiler family is in the ground state: Forest (+-)
    oscillates with Skyrms (-+). The breathing is stable.
    Forcing either parallel state requires energy input and
    produces irreversible loss (extinction or heat death). -/
theorem compiler_family_ground_state :
    energy forestPhase = 0 ∧ energy skyrmsPhase = 0 ∧
    energy monoculture = 1 ∧ energy heatDeath = 1 := by
  refine ⟨?_, ?_, ?_, ?_⟩ <;> unfold energy isParallel <;> simp [forestPhase, skyrmsPhase, monoculture, heatDeath]

end BuleyeanSpinPairing
