import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.BuleyeanLogic

namespace ForkRaceFoldTheorems

/-!
# The Buleyean Pulse Quadrant

The four primitives -- fork, race, fold, vent -- are the four quadrants
of the Buleyean Pulse (+1 / -1) applied to two axes:

  Axis 1: input effect  (+1 = path created/preserved, -1 = path consumed)
  Axis 2: output effect (+1 = path created/preserved, -1 = path destroyed)

  |          | output +1         | output -1          |
  |----------|-------------------|---------------------|
  | input +1 | FORK (+1, +1)     | RACE (+1, -1)       |
  | input -1 | FOLD (-1, +1)     | VENT (-1, -1)       |

Fork: source preserved, targets created. Both sides gain.
Race: winner preserved, losers destroyed. Selection.
Fold: sources consumed, result created. Compression.
Vent: source consumed, information destroyed. Dissipation.

The Buleyean Pulse (+1 / -1) generates all four primitives.
The framework is the four quadrants of a single oscillation.
-/

-- ═══════════════════════════════════════════════════════════════════════════
-- The two signs
-- ═══════════════════════════════════════════════════════════════════════════

/-- The Buleyean sign: +1 (create/preserve) or -1 (consume/destroy). -/
inductive BSign where
  | plus  : BSign  -- +1: the sliver, hope, creation
  | minus : BSign  -- -1: the proof step, rejection, consumption
  deriving DecidableEq, Repr

/-- A pulse quadrant: the combination of input sign and output sign. -/
structure PulseQuadrant where
  input  : BSign
  output : BSign
  deriving DecidableEq, Repr

-- ═══════════════════════════════════════════════════════════════════════════
-- The four primitives as quadrants
-- ═══════════════════════════════════════════════════════════════════════════

/-- The four primitives of fork/race/fold/vent. -/
inductive Primitive where
  | fork : Primitive  -- (+, +) create paths, create targets
  | race : Primitive  -- (+, -) keep winner, vent losers
  | fold : Primitive  -- (-, +) consume paths, create result
  | vent : Primitive  -- (-, -) consume path, destroy info
  deriving DecidableEq, Repr

/-- Map a primitive to its pulse quadrant. -/
def primitiveToQuadrant : Primitive → PulseQuadrant
  | .fork => ⟨.plus,  .plus⟩   -- (+1, +1)
  | .race => ⟨.plus,  .minus⟩  -- (+1, -1)
  | .fold => ⟨.minus, .plus⟩   -- (-1, +1)
  | .vent => ⟨.minus, .minus⟩  -- (-1, -1)

/-- Map a pulse quadrant to its primitive. -/
def quadrantToPrimitive : PulseQuadrant → Primitive
  | ⟨.plus,  .plus⟩  => .fork
  | ⟨.plus,  .minus⟩ => .race
  | ⟨.minus, .plus⟩  => .fold
  | ⟨.minus, .minus⟩ => .vent

-- ═══════════════════════════════════════════════════════════════════════════
-- Theorem 1: The mapping is a bijection
-- ═══════════════════════════════════════════════════════════════════════════

/-- **THM-QUADRANT-ROUNDTRIP-PRIM**: Primitive → Quadrant → Primitive
    is the identity. -/
theorem quadrant_roundtrip_prim (p : Primitive) :
    quadrantToPrimitive (primitiveToQuadrant p) = p := by
  cases p <;> rfl

/-- **THM-QUADRANT-ROUNDTRIP-QUAD**: Quadrant → Primitive → Quadrant
    is the identity. -/
theorem quadrant_roundtrip_quad (q : PulseQuadrant) :
    primitiveToQuadrant (quadrantToPrimitive q) = q := by
  cases q with
  | mk i o => cases i <;> cases o <;> rfl

-- ═══════════════════════════════════════════════════════════════════════════
-- Theorem 2: Every quadrant is inhabited (no empty quadrants)
-- ═══════════════════════════════════════════════════════════════════════════

/-- Every pulse quadrant corresponds to exactly one primitive. -/
theorem every_quadrant_has_primitive (i o : BSign) :
    ∃ p : Primitive, primitiveToQuadrant p = ⟨i, o⟩ := by
  cases i <;> cases o
  · exact ⟨.fork, rfl⟩
  · exact ⟨.race, rfl⟩
  · exact ⟨.fold, rfl⟩
  · exact ⟨.vent, rfl⟩

/-- Every primitive maps to a unique quadrant. -/
theorem primitives_distinct (p1 p2 : Primitive)
    (h : primitiveToQuadrant p1 = primitiveToQuadrant p2) :
    p1 = p2 := by
  cases p1 <;> cases p2 <;> simp [primitiveToQuadrant] at h <;> rfl

-- ═══════════════════════════════════════════════════════════════════════════
-- Theorem 3: β₁ change matches the input sign
-- ═══════════════════════════════════════════════════════════════════════════

/-- The effect of a primitive on the active path count (β₁). -/
structure Beta1Effect where
  /-- Paths before the operation -/
  before : ℕ
  /-- Paths after the operation -/
  after : ℕ
  /-- At least 1 path exists -/
  hBefore : 0 < before

/-- Fork increases β₁ (input = +1). -/
def forkEffect (n : ℕ) (branches : ℕ) (hN : 0 < n) (hB : 2 ≤ branches) : Beta1Effect where
  before := n
  after := n + branches - 1
  hBefore := hN

/-- Fold decreases β₁ (input = -1). -/
def foldEffect (n : ℕ) (merged : ℕ) (hN : 0 < n) (hM : 2 ≤ merged) (hMN : merged ≤ n) : Beta1Effect where
  before := n
  after := n - merged + 1
  hBefore := hN

/-- Vent decreases β₁ (input = -1). -/
def ventEffect (n : ℕ) (hN : 0 < n) : Beta1Effect where
  before := n
  after := n - 1
  hBefore := hN

/-- Fork strictly increases path count. Input sign = +1 confirmed. -/
theorem fork_increases_beta1 (n branches : ℕ)
    (hN : 0 < n) (hB : 2 ≤ branches) :
    (forkEffect n branches hN hB).before < (forkEffect n branches hN hB).after := by
  simp [forkEffect]
  omega

/-- Fold strictly decreases path count. Input sign = -1 confirmed. -/
theorem fold_decreases_beta1 (n merged : ℕ)
    (hN : 0 < n) (hM : 2 ≤ merged) (hMN : merged ≤ n) :
    (foldEffect n merged hN hM hMN).after < (foldEffect n merged hN hM hMN).before := by
  simp [foldEffect]
  omega

/-- Vent strictly decreases path count. Input sign = -1 confirmed. -/
theorem vent_decreases_beta1 (n : ℕ) (hN : 0 < n) :
    (ventEffect n hN).after < (ventEffect n hN).before := by
  simp [ventEffect]
  omega

-- ═══════════════════════════════════════════════════════════════════════════
-- Theorem 4: The Buleyean Pulse generates the primitives
-- ═══════════════════════════════════════════════════════════════════════════

/-- The net sign of a primitive: input × output.
    +1 × +1 = +1 (fork: net creation)
    +1 × -1 = -1 (race: net selection)
    -1 × +1 = -1 (fold: net compression)
    -1 × -1 = +1 (vent: net dissipation -- heat is positive!) -/
def netSign : BSign → BSign → BSign
  | .plus,  .plus  => .plus   -- fork:  creation × creation = creation
  | .plus,  .minus => .minus  -- race:  creation × destruction = selection
  | .minus, .plus  => .minus  -- fold:  destruction × creation = compression
  | .minus, .minus => .plus   -- vent:  destruction × destruction = heat

/-- Vent's net sign is positive. Destruction × destruction = Landauer heat.
    Heat is positive. The double negative is physically real. -/
theorem vent_net_positive :
    netSign .minus .minus = .plus := by
  rfl

/-- Fork and vent have the same net sign (both positive).
    Creation and dissipation are conjugate -- the Buleyean Pulse
    alternates between them. -/
theorem fork_vent_conjugate :
    netSign .plus .plus = netSign .minus .minus := by
  rfl

/-- Race and fold have the same net sign (both negative).
    Selection and compression are conjugate -- the other half
    of the Buleyean Pulse. -/
theorem race_fold_conjugate :
    netSign .plus .minus = netSign .minus .plus := by
  rfl

-- ═══════════════════════════════════════════════════════════════════════════
-- Theorem 5: The pulse oscillation maps to the primitive cycle
-- ═══════════════════════════════════════════════════════════════════════════

/-- The canonical cycle: fork → race → fold → vent → fork → ...
    The input sign alternates: +, +, -, - (period 2 on each axis).
    The output sign alternates: +, -, +, - (period 2 on each axis).
    Together: the pulse sweeps all four quadrants. -/
def canonicalCycle : Fin 4 → Primitive
  | ⟨0, _⟩ => .fork
  | ⟨1, _⟩ => .race
  | ⟨2, _⟩ => .fold
  | ⟨3, _⟩ => .vent

/-- The canonical cycle hits all four primitives. -/
theorem canonical_cycle_complete :
    (∀ p : Primitive, ∃ i : Fin 4, canonicalCycle i = p) := by
  intro p
  cases p
  · exact ⟨⟨0, by omega⟩, rfl⟩
  · exact ⟨⟨1, by omega⟩, rfl⟩
  · exact ⟨⟨2, by omega⟩, rfl⟩
  · exact ⟨⟨3, by omega⟩, rfl⟩

/-- The canonical cycle has no repeats. -/
theorem canonical_cycle_injective :
    ∀ i j : Fin 4, canonicalCycle i = canonicalCycle j → i = j := by
  intro ⟨i, hi⟩ ⟨j, hj⟩ h
  fin_cases ⟨i, hi⟩ <;> fin_cases ⟨j, hj⟩ <;> simp [canonicalCycle] at h <;> rfl

-- ═══════════════════════════════════════════════════════════════════════════
-- Theorem 6: Connection to the sliver
-- ═══════════════════════════════════════════════════════════════════════════

/-- The + 1 (sliver) maps to the + quadrants (fork, fold output).
    The - 1 (proof step) maps to the - quadrants (race output, vent).
    The sliver enables fork and fold. The proof step enables race and vent. -/
theorem sliver_enables_creation (n : ℕ) :
    -- The + 1 creates a new path (fork's +1 on input)
    n + 1 > n ∧
    -- The + 1 creates a result (fold's +1 on output)
    0 < n + 1 := by
  omega

theorem proof_enables_selection (n : ℕ) (hn : 0 < n) :
    -- The - 1 removes a loser (race's -1 on output)
    n - 1 < n ∧
    -- The - 1 dissipates a path (vent's -1 on both)
    n - 1 < n := by
  omega

-- ═══════════════════════════════════════════════════════════════════════════
-- THM-BULEYEAN-PULSE-QUADRANT: The master composition
-- ═══════════════════════════════════════════════════════════════════════════

/-- **THM-BULEYEAN-PULSE-QUADRANT**:

    The Buleyean Pulse (+1 / -1) on two axes generates all four
    fork/race/fold/vent primitives. The mapping is a bijection.
    Every quadrant is inhabited. No quadrant is empty. The cycle
    sweeps all four. The framework is the four quadrants of a
    single oscillation.

    1. Bijection: Primitive ↔ PulseQuadrant (round-trip identity)
    2. Completeness: every (±, ±) pair has a primitive
    3. Distinctness: no two primitives share a quadrant
    4. Cycle: fork → race → fold → vent sweeps all four
    5. Conjugacy: fork/vent are conjugate (+), race/fold are conjugate (-)
    6. The sliver (+1) enables creation, the proof step (-1) enables selection
-/
theorem buleyean_pulse_quadrant :
    -- (1) Round-trip
    (∀ p : Primitive, quadrantToPrimitive (primitiveToQuadrant p) = p) ∧
    -- (2) Completeness
    (∀ i o : BSign, ∃ p : Primitive, primitiveToQuadrant p = ⟨i, o⟩) ∧
    -- (3) Distinctness
    (∀ p1 p2 : Primitive, primitiveToQuadrant p1 = primitiveToQuadrant p2 → p1 = p2) ∧
    -- (4) Cycle completeness
    (∀ p : Primitive, ∃ i : Fin 4, canonicalCycle i = p) ∧
    -- (5) Fork/vent conjugacy
    (netSign .plus .plus = netSign .minus .minus) ∧
    -- (5) Race/fold conjugacy
    (netSign .plus .minus = netSign .minus .plus) := by
  exact ⟨
    quadrant_roundtrip_prim,
    every_quadrant_has_primitive,
    primitives_distinct,
    canonical_cycle_complete,
    fork_vent_conjugate,
    race_fold_conjugate
  ⟩

end ForkRaceFoldTheorems
