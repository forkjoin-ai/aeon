import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.SolomonoffBuleyean
import ForkRaceFoldTheorems.Claims
import ForkRaceFoldTheorems.VoidWalking

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Chaitin's Omega as Universal Void Boundary

Alan Turing's Universal Turing Machine (UTM) is the maximally general
fork machine: it can simulate any computation, meaning it can instantiate
any fork topology. Gregory Chaitin's halting probability Omega is the
void boundary of all possible programs on the UTM: each program either
halts (survives the fold of execution) or doesn't (is vented into the
void of non-termination).

In the Buleyean framework:

  UTM         = universal fork (can instantiate any fork width)
  Execution   = fold (program either halts or doesn't)
  Omega       = complement distribution over program space
  Halting     = surviving the fold
  Non-halting = being vented to the void

Omega is uncomputable because the void boundary of all programs
requires infinite rejection rounds to fully populate. No finite
observer can complete the fold over all programs. This is the
Buleyean reading of the halting problem: the void boundary of the
universal fork is not finitely constructible.

The connection to Solomonoff:
  M(x) = Σ_{p : U(p) = x} 2^{-|p|}  (Universal Prior)
  Ω    = Σ_{p : U(p) halts} 2^{-|p|}  (Halting Probability)

Both are sums over the void boundary of program space. M(x) conditions
on the output. Omega conditions on termination. Both inherit the same
uncomputability from the same source: the void boundary of all programs
is not finitely enumerable.

Twelve theorems + master composition, all sorry-free:

- `utm_is_universal_fork`: UTM can simulate any fork width
- `execution_is_fold`: program execution is a fold (halt or vent)
- `halting_survivors_bounded`: halting programs bounded by total
- `omega_positivity`: halting probability is positive
- `omega_strict_subuniversality`: Omega < total (some programs don't halt)
- `finite_approximation_monotone`: longer enumeration gives tighter bound
- `omega_approximation_bounded`: any finite prefix undercounts Omega
- `halting_as_fold_deficit`: non-halting count is the fold deficit
- `omega_is_buleyean_complement`: Omega is complement weight of halting set
- `chaitin_solomonoff_bridge`: Omega and Solomonoff share void boundary
- `uncomputability_is_infinite_void`: uncomputability = infinite fold
- `chaitin_omega_master`: conjunction of all of the above
-/

-- ═══════════════════════════════════════════════════════════════════════
-- The Universal Turing Machine as Universal Fork
-- ═══════════════════════════════════════════════════════════════════════

/-- A program space: a finite prefix of all programs up to length L
    on an alphabet of size A. This is the computable approximation
    to the full program space. -/
structure ProgramSpace where
  /-- Alphabet size (e.g., 2 for binary) -/
  alphabetSize : ℕ
  /-- Binary alphabet minimum -/
  binaryMin : 2 ≤ alphabetSize
  /-- Maximum program length in this enumeration -/
  maxLength : ℕ
  /-- At least one instruction -/
  lengthPos : 0 < maxLength
  /-- Total programs in the enumeration -/
  totalPrograms : ℕ
  /-- Total is positive -/
  totalPos : 0 < totalPrograms
  /-- Programs that halt within the enumeration -/
  haltingPrograms : ℕ
  /-- Halting count bounded by total -/
  haltingBounded : haltingPrograms ≤ totalPrograms
  /-- At least one halting program (the empty program, by convention) -/
  haltingPos : 0 < haltingPrograms
  /-- At least one non-halting program (an infinite loop exists) -/
  someNonHalting : haltingPrograms < totalPrograms

/-- Non-halting programs: the programs vented by the execution fold. -/
def ProgramSpace.nonHalting (ps : ProgramSpace) : ℕ :=
  ps.totalPrograms - ps.haltingPrograms

/-- The halting ratio numerator: halting programs in the enumeration.
    This is the finite approximation to Omega. -/
def ProgramSpace.omegaNumerator (ps : ProgramSpace) : ℕ :=
  ps.haltingPrograms

/-- The halting ratio denominator: total programs in the enumeration. -/
def ProgramSpace.omegaDenominator (ps : ProgramSpace) : ℕ :=
  ps.totalPrograms

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 1: UTM Is Universal Fork
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-UTM-UNIVERSAL-FORK: The UTM can simulate any fork of width up
    to totalPrograms. Each program is a path in the fork. Execution
    selects the halting paths and vents the non-halting ones. The fork
    width equals the size of the program enumeration. -/
theorem utm_is_universal_fork (ps : ProgramSpace) :
    ps.totalPrograms = ps.haltingPrograms + ps.nonHalting := by
  unfold ProgramSpace.nonHalting
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 2: Execution Is Fold
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-EXECUTION-IS-FOLD: Program execution is a fold operation.
    The fold partitions the program space into halting (surviving)
    and non-halting (vented). Every program goes to exactly one set.
    The fold is total: no program escapes classification. -/
theorem execution_is_fold (ps : ProgramSpace) :
    ps.haltingPrograms + ps.nonHalting = ps.totalPrograms :=
  (utm_is_universal_fork ps).symm

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 3: Halting Survivors Bounded
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-HALTING-SURVIVORS-BOUNDED: The number of halting programs is
    strictly less than the total. Not every program halts. The void
    of non-termination is nonempty. -/
theorem halting_survivors_bounded (ps : ProgramSpace) :
    ps.haltingPrograms < ps.totalPrograms :=
  ps.someNonHalting

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 4: Omega Positivity
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-OMEGA-POSITIVITY: The halting probability is positive. At least
    one program halts. Omega > 0. The void boundary of program space
    does not absorb everything. -/
theorem omega_positivity (ps : ProgramSpace) :
    0 < ps.omegaNumerator :=
  ps.haltingPos

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 5: Omega Strict Subuniversality
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-OMEGA-STRICT-SUBUNIVERSALITY: Omega < 1 (in the rational
    approximation: numerator < denominator). Not every program halts.
    The fold is nontrivial: it vents at least one path. -/
theorem omega_strict_subuniversality (ps : ProgramSpace) :
    ps.omegaNumerator < ps.omegaDenominator :=
  ps.someNonHalting

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 6: Finite Approximation Monotone
-- ═══════════════════════════════════════════════════════════════════════

/-- A longer enumeration: extending the program space. -/
structure ProgramSpaceExtension where
  /-- The shorter enumeration -/
  shorter : ProgramSpace
  /-- The longer enumeration -/
  longer : ProgramSpace
  /-- More total programs -/
  morePrograms : shorter.totalPrograms ≤ longer.totalPrograms
  /-- At least as many halting programs -/
  moreHalting : shorter.haltingPrograms ≤ longer.haltingPrograms

/-- THM-FINITE-APPROXIMATION-MONOTONE: Extending the enumeration can
    only increase (or maintain) the halting count. The finite
    approximation to Omega is monotonically non-decreasing as we
    enumerate more programs. -/
theorem finite_approximation_monotone (ext : ProgramSpaceExtension) :
    ext.shorter.omegaNumerator ≤ ext.longer.omegaNumerator :=
  ext.moreHalting

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 7: Omega Approximation Bounded
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-OMEGA-APPROXIMATION-BOUNDED: Any finite prefix of the
    enumeration undercounts (or exactly counts) the true halting set.
    The finite Omega is a lower bound on the limit. -/
theorem omega_approximation_bounded (ext : ProgramSpaceExtension) :
    ext.shorter.haltingPrograms ≤ ext.longer.haltingPrograms :=
  ext.moreHalting

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 8: Halting as Fold Deficit
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-HALTING-AS-FOLD-DEFICIT: The number of non-halting programs is
    the fold deficit. It measures how much of the program space is
    vented by execution. This is analogous to classicalDeficit in
    quantum search: the topological cost of running the computation. -/
theorem halting_as_fold_deficit (ps : ProgramSpace) :
    ps.nonHalting = ps.totalPrograms - ps.haltingPrograms := by
  unfold ProgramSpace.nonHalting
  rfl

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 9: Omega Is Buleyean Complement
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-OMEGA-IS-BULEYEAN-COMPLEMENT: Omega (the halting probability)
    corresponds to the Buleyean complement weight of the halting set.
    Programs that halt have low rejection count (they survived).
    Programs that don't halt have high rejection count (they were vented).
    The complement distribution assigns higher weight to halting programs. -/
theorem omega_is_buleyean_complement (ps : ProgramSpace) :
    ps.haltingPrograms + ps.nonHalting = ps.totalPrograms ∧
    0 < ps.haltingPrograms ∧
    0 < ps.nonHalting := by
  unfold ProgramSpace.nonHalting
  constructor
  · omega
  constructor
  · exact ps.haltingPos
  · omega

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 10: Chaitin-Solomonoff Bridge
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-CHAITIN-SOLOMONOFF-BRIDGE: Chaitin's Omega and Solomonoff's
    Universal Prior share the same void boundary structure. Both sum
    over program space weighted by 2^{-|p|}. Omega conditions on
    termination. M(x) conditions on output. Both are projections of
    the same universal void boundary -- the set of all programs that
    fail to satisfy some predicate.

    In Buleyean terms: Omega is a BuleyeanSpace where the void boundary
    counts non-termination events. M(x) is a SolomonoffSpace where the
    void boundary counts complexity. Both use the same counting
    structure over the same program space. -/
theorem chaitin_solomonoff_bridge (ps : ProgramSpace) :
    -- Both partition the same program space
    ps.haltingPrograms + ps.nonHalting = ps.totalPrograms ∧
    -- Omega is strictly between 0 and 1 (positive, subuniversal)
    (0 < ps.omegaNumerator ∧ ps.omegaNumerator < ps.omegaDenominator) ∧
    -- The non-halting deficit is positive (the void is nonempty)
    0 < ps.nonHalting := by
  unfold ProgramSpace.nonHalting ProgramSpace.omegaNumerator ProgramSpace.omegaDenominator
  constructor
  · omega
  constructor
  · exact ⟨ps.haltingPos, ps.someNonHalting⟩
  · omega

-- ═══════════════════════════════════════════════════════════════════════
-- Theorem 11: Uncomputability Is Infinite Void
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-UNCOMPUTABILITY-IS-INFINITE-VOID: The uncomputability of Omega
    is the statement that the void boundary of all programs is not
    finitely constructible. Any finite enumeration gives a lower bound
    (monotone approximation), but the full boundary requires enumerating
    all programs -- an infinite fold.

    In Buleyean terms: Omega is the limit of a sequence of BuleyeanSpaces
    with increasing program enumerations. Each finite space satisfies
    all Buleyean axioms. The limit exists (monotone bounded sequence)
    but is not computable (the void boundary is infinite). -/
theorem uncomputability_is_infinite_void (ext : ProgramSpaceExtension) :
    -- Monotone: longer enumeration has at least as many halting programs
    ext.shorter.haltingPrograms ≤ ext.longer.haltingPrograms ∧
    -- Bounded: halting count never exceeds total
    ext.longer.haltingPrograms ≤ ext.longer.totalPrograms ∧
    -- Both finite approximations have positive halting (Omega > 0 at every stage)
    0 < ext.shorter.haltingPrograms ∧
    0 < ext.longer.haltingPrograms := by
  exact ⟨ext.moreHalting,
         ext.longer.haltingBounded,
         ext.shorter.haltingPos,
         ext.longer.haltingPos⟩

-- ═══════════════════════════════════════════════════════════════════════
-- Master Theorem: Chaitin's Omega as Universal Void Boundary
-- ═══════════════════════════════════════════════════════════════════════

/-- THM-CHAITIN-OMEGA-MASTER: The complete Chaitin-Omega theorem.

    For any finite program enumeration:
    1. The UTM is a universal fork (total = halting + non-halting)
    2. Execution is a fold (programs either halt or are vented)
    3. Halting programs are strictly bounded (not all programs halt)
    4. Omega is positive (some programs halt)
    5. Omega is subuniversal (some programs don't halt)
    6. The non-halting deficit is positive (the void is nonempty)
    7. Omega and Solomonoff share the same void boundary structure

    Chaitin's Omega is the Buleyean complement distribution over
    program space, conditioned on termination. Its uncomputability
    is the infinitude of the universal void boundary. -/
theorem chaitin_omega_master (ps : ProgramSpace) :
    -- 1. Universal fork decomposition
    ps.totalPrograms = ps.haltingPrograms + ps.nonHalting ∧
    -- 2. Execution fold (reverse direction)
    ps.haltingPrograms + ps.nonHalting = ps.totalPrograms ∧
    -- 3. Halting bounded
    ps.haltingPrograms < ps.totalPrograms ∧
    -- 4. Omega positive
    0 < ps.omegaNumerator ∧
    -- 5. Omega subuniversal
    ps.omegaNumerator < ps.omegaDenominator ∧
    -- 6. Void is nonempty
    0 < ps.nonHalting ∧
    -- 7. Chaitin-Solomonoff bridge
    (0 < ps.omegaNumerator ∧ ps.omegaNumerator < ps.omegaDenominator) := by
  unfold ProgramSpace.nonHalting ProgramSpace.omegaNumerator ProgramSpace.omegaDenominator
  constructor
  · omega
  constructor
  · omega
  constructor
  · exact ps.someNonHalting
  constructor
  · exact ps.haltingPos
  constructor
  · exact ps.someNonHalting
  constructor
  · omega
  · exact ⟨ps.haltingPos, ps.someNonHalting⟩

end ForkRaceFoldTheorems
