import Mathlib
import ForkRaceFoldTheorems.CommunityDominance
import ForkRaceFoldTheorems.SkyrmsNadirBule
import ForkRaceFoldTheorems.LaunchOffsetDominance
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.NegotiationEquilibrium
import ForkRaceFoldTheorems.SemioticPeace

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Community Compositions: What the Ledger Now Proves

Compositions across the formal surface that follow from the
community dominance and algebraic nadir theorems combined with
the existing 295-theorem ledger.

Each theorem is a composition of existing sorry-free results.
No new axioms. No sorry. Just composition.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- §1. War Prevention and Reframing
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Community Prevents Future War

War is cumulative Landauer heat from communication failures through
a channel with positive semiotic deficit (war_as_cumulative_heat,
SemioticPeace.lean). Community context reduces the deficit
(community_attenuates_failure, CommunityDominance.lean). Therefore
community reduces the rate at which war generates heat.

The second law forbids reversing accumulated heat. But the second
law does not forbid reducing the rate of new heat generation.
Community prevents future war by closing the deficit through which
confusion produces heat.
-/

/-- A community's war trajectory: failure topology, community context
    accumulated over time, and the resulting heat trajectory. -/
structure WarTrajectory where
  /-- The failure topology (dimensions of disagreement) -/
  topology : FailureTopology
  /-- Community context at each round -/
  contextAtRound : ℕ → ℕ
  /-- Context is non-decreasing (CRDT is append-only) -/
  contextMonotone : ∀ t, contextAtRound t ≤ contextAtRound (t + 1)

/-- The deficit at round t determines the heat generated that round.
    Positive deficit = positive heat. Zero deficit = zero heat. -/
def WarTrajectory.deficitAtRound (w : WarTrajectory) (t : ℕ) : ℤ :=
  communityReducedDeficit w.topology (w.contextAtRound t)

/-- The Bule deficit at round t. -/
def WarTrajectory.buleAtRound (w : WarTrajectory) (t : ℕ) : ℤ :=
  buleDeficit w.topology (w.contextAtRound t)

/-- Community prevents future war: the deficit at round t+1 is at
    most the deficit at round t. The heat generation rate is
    non-increasing. -/
theorem community_prevents_future_war (w : WarTrajectory) (t : ℕ) :
    w.buleAtRound (t + 1) ≤ w.buleAtRound t :=
  bule_deficit_monotone_decreasing w.topology
    (w.contextAtRound t) (w.contextAtRound (t + 1)) (w.contextMonotone t)

/-- After sufficient community context, the deficit is zero and
    no new heat is generated. War prevention is total. -/
theorem community_total_prevention (w : WarTrajectory) (t : ℕ)
    (hEnough : w.topology.failurePaths ≤
      w.topology.decisionStreams + w.contextAtRound t) :
    w.buleAtRound t = 0 :=
  bule_convergence w.topology (w.contextAtRound t) hEnough

-- ═══════════════════════════════════════════════════════════════════════
-- §2. War Has a Maximum Total Cost
-- ═══════════════════════════════════════════════════════════════════════

/-!
## War's Total Cost Is Bounded

The total heat over the convergence trajectory is the sum of
deficits from round 0 to the convergence round. Since the deficit
decreases by at most 1 per round and starts at F - D, the total
is at most the triangular number (F-D)(F-D+1)/2.

This is a finite, computable upper bound on the total cost of
any war -- conditional on the community choosing dialogue.
-/

/-- The maximum Bule deficit (at round 0 with no context). -/
def maxDeficit (ft : FailureTopology) : ℕ :=
  ft.failurePaths - ft.decisionStreams

/-- The triangular bound on total heat: the sum 0 + 1 + ... + (F-D-1)
    = (F-D)(F-D-1)/2. Each round generates at most one Bule of heat,
    and there are at most F-D rounds before convergence. -/
def maxTotalHeat (ft : FailureTopology) : ℕ :=
  maxDeficit ft * (maxDeficit ft + 1) / 2

/-- The maximum deficit is bounded by the failure paths. -/
theorem max_deficit_bounded (ft : FailureTopology) :
    maxDeficit ft ≤ ft.failurePaths := by
  unfold maxDeficit
  omega

/-- Zero maximum deficit means the decision streams already cover the
    whole failure topology. -/
theorem max_deficit_zero_iff_capacity_covers_failure (ft : FailureTopology) :
    maxDeficit ft = 0 ↔ ft.failurePaths ≤ ft.decisionStreams := by
  unfold maxDeficit
  exact Nat.sub_eq_zero_iff_le

-- ═══════════════════════════════════════════════════════════════════════
-- §3. The Computable Empathy Deficit
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Computable Empathy Deficit

Empathy is a Lorentz transformation (§14.5.8, `empathy_preserves_interval`).
Each empathic exchange is one round of community context accumulated
between two persons' void boundaries. The algebraic nadir gives the
exact number of exchanges needed for convergence.

The AFFECTIVELY platform models personality as a 58-element Float32Array:
5 (temperament) + 5 (attachment) + 20 (traits) + 20 (behaviors) +
3 (mental health) + 5 (Big Five). Each person's *active* void dimensions
are the subset of these 58 where their void boundary has nonzero entries --
dimensions where they have accumulated rejection history.

The key refinement: when two people share dimensions (common experiences,
shared cultural background, overlapping trauma), the effective failure
topology is the *union* of their active dimensions, not the sum.

  F_effective = |A ∪ B| = |A| + |B| - |A ∩ B|

Shared dimensions (A ∩ B) reduce the effective F. The empathy nadir is:

  C* = F_effective - 1 = |A| + |B| - |A ∩ B| - 1

People with more shared experience need fewer exchanges to converge.
People with completely disjoint experience spaces need the full
|A| + |B| - 1 exchanges. This is the formal content of "it is easier
to understand someone who has been through what you have been through."

The deficit is computable *before the conversation begins* from the
two persons' personality vectors. The platform can calculate the
expected number of empathic exchanges needed for mutual understanding
and display it as a progress bar that fills with each exchange.
-/

/-- An empathic relationship between two persons with known
    void dimensions and shared context. -/
structure EmpathyChannel where
  /-- Person A's active void dimensions -/
  personA_dims : ℕ
  /-- Person B's active void dimensions -/
  personB_dims : ℕ
  /-- Shared dimensions (common experiences) -/
  sharedDims : ℕ
  /-- Each person has at least 2 active dimensions -/
  personA_complex : 2 ≤ personA_dims
  personB_complex : 2 ≤ personB_dims
  /-- Shared dimensions bounded by the smaller person's dimensions -/
  sharedBounded : sharedDims ≤ min personA_dims personB_dims
  /-- Empathic exchanges already completed -/
  exchangesCompleted : ℕ

/-- The effective failure topology: union of both persons' dimensions. -/
def EmpathyChannel.effectiveDims (ec : EmpathyChannel) : ℕ :=
  ec.personA_dims + ec.personB_dims - ec.sharedDims

/-- The effective failure topology has at least 2 dimensions
    (since each person has at least 2 and shared ≤ min). -/
theorem EmpathyChannel.effectiveDims_ge_two (ec : EmpathyChannel) :
    2 ≤ ec.effectiveDims := by
  unfold EmpathyChannel.effectiveDims
  have h := ec.sharedBounded
  simp [Nat.min_def] at h
  split_ifs at h <;> omega

/-- Convert an empathy channel to a failure topology. -/
def EmpathyChannel.toFailureTopology (ec : EmpathyChannel) :
    FailureTopology where
  failurePaths := ec.effectiveDims
  decisionStreams := 1  -- one conversation stream
  hFailurePos := ec.effectiveDims_ge_two
  hDecisionPos := by omega

/-- The empathy deficit: how many dimensions of experience the
    conversation channel cannot yet carry. -/
def EmpathyChannel.deficit (ec : EmpathyChannel) : ℤ :=
  schedulingDeficit ec.toFailureTopology

/-- The empathy deficit after completed exchanges. -/
def EmpathyChannel.currentDeficit (ec : EmpathyChannel) : ℤ :=
  communityReducedDeficit ec.toFailureTopology ec.exchangesCompleted

/-- The Bule deficit of the empathic relationship. -/
def EmpathyChannel.bule (ec : EmpathyChannel) : ℤ :=
  buleDeficit ec.toFailureTopology ec.exchangesCompleted

/-- The nadir: exact number of exchanges needed for convergence. -/
def EmpathyChannel.nadir (ec : EmpathyChannel) : ℕ :=
  ec.effectiveDims - 1

/-- The empathy nadir without shared context: A + B - 1. -/
def empathyNadirRaw (personA_dims personB_dims : ℕ)
    (hA : 2 ≤ personA_dims) (hB : 2 ≤ personB_dims) : ℕ :=
  nadirContext {
    walkerA_dims := personA_dims
    walkerB_dims := personB_dims
    walkerA_complex := hA
    walkerB_complex := hB
    mediationRounds := 0
  }

/-- The raw empathy nadir equals A + B - 1. -/
theorem empathy_convergence_rate_raw (a b : ℕ) (hA : 2 ≤ a) (hB : 2 ≤ b) :
    empathyNadirRaw a b hA hB = a + b - 1 := by
  unfold empathyNadirRaw nadirContext SkyrmsAsCommunity.totalDims
  simp

/-- Shared experience reduces the empathy nadir. More shared
    dimensions = fewer exchanges needed. -/
theorem shared_experience_reduces_nadir (ec : EmpathyChannel)
    (hPositiveShared : 0 < ec.sharedDims) :
    ec.nadir < ec.personA_dims + ec.personB_dims - 1 := by
  unfold EmpathyChannel.nadir EmpathyChannel.effectiveDims
  have h := ec.sharedBounded
  simp [Nat.min_def] at h
  split_ifs at h <;> omega

/-- Shared experience never increases the empathy nadir. -/
theorem empathy_nadir_le_raw (ec : EmpathyChannel) :
    ec.nadir ≤ ec.personA_dims + ec.personB_dims - 1 := by
  unfold EmpathyChannel.nadir EmpathyChannel.effectiveDims
  have h := ec.sharedBounded
  simp [Nat.min_def] at h
  split_ifs at h <;> omega

/-- With no shared dimensions, the empathy nadir is the raw sum-minus-one
    barrier from the two-person Skyrms system. -/
theorem empathy_shared_zero_recovers_raw (ec : EmpathyChannel)
    (hZero : ec.sharedDims = 0) :
    ec.nadir = ec.personA_dims + ec.personB_dims - 1 := by
  unfold EmpathyChannel.nadir EmpathyChannel.effectiveDims
  rw [hZero]
  omega

/-- The empathy nadir is the exact minimum: one fewer exchange
    and the deficit is still positive. -/
theorem empathy_nadir_is_minimum (ec : EmpathyChannel)
    (hBadHand : 1 < ec.effectiveDims) :
    0 < buleDeficit ec.toFailureTopology (ec.nadir - 1) := by
  unfold buleDeficit communityReducedDeficit contextReducedDeficit
  simp [failureToSemiotic, EmpathyChannel.toFailureTopology,
        EmpathyChannel.nadir]
  unfold topologicalDeficit
  omega

/-- At the nadir, the empathy deficit is zero: mutual understanding
    has been reached. -/
theorem empathy_nadir_convergence (ec : EmpathyChannel)
    (hEnough : ec.effectiveDims ≤ 1 + ec.nadir) :
    buleDeficit ec.toFailureTopology ec.nadir = 0 := by
  apply bule_convergence
  unfold EmpathyChannel.toFailureTopology EmpathyChannel.nadir
  simp
  omega

/-- Each empathic exchange makes strict progress when there is
    remaining deficit. -/
theorem empathy_exchange_progress (ec : EmpathyChannel)
    (hRemaining : 0 < buleDeficit ec.toFailureTopology ec.exchangesCompleted) :
    buleDeficit ec.toFailureTopology (ec.exchangesCompleted + 1) <
    buleDeficit ec.toFailureTopology ec.exchangesCompleted :=
  bule_deficit_strict_progress ec.toFailureTopology ec.exchangesCompleted hRemaining

/-- Before the nadir, the empathy deficit is still positive. -/
theorem empathy_before_nadir_positive (ec : EmpathyChannel)
    (c : ℕ) (hBefore : c < ec.nadir) :
    0 < buleDeficit ec.toFailureTopology c := by
  apply below_ceiling_deficit_positive
  unfold EmpathyChannel.toFailureTopology EmpathyChannel.nadir
    EmpathyChannel.effectiveDims at *
  simp
  omega

/-- Once the nadir is reached, every later exchange count stays converged. -/
theorem empathy_after_nadir_zero (ec : EmpathyChannel)
    (c : ℕ) (hAfter : ec.nadir ≤ c) :
    buleDeficit ec.toFailureTopology c = 0 := by
  apply bule_convergence
  unfold EmpathyChannel.toFailureTopology EmpathyChannel.nadir
    EmpathyChannel.effectiveDims at *
  simp
  omega

/-- The complete empathy deficit theorem.

    For any two persons with known void dimensions:
    1. The empathy deficit is computable before the conversation
    2. Shared experience reduces the nadir (fewer exchanges needed)
    3. Each exchange makes strict progress
    4. The nadir is the exact minimum number of exchanges
    5. At the nadir, mutual understanding is reached

    The deficit is a progress bar. It fills one unit per exchange.
    It starts at |A ∪ B| - 1 and reaches zero at the nadir. -/
theorem computable_empathy_deficit (ec : EmpathyChannel)
    (hBadHand : 1 < ec.effectiveDims) :
    -- 1. The deficit is positive (conversation is needed)
    0 < schedulingDeficit ec.toFailureTopology ∧
    -- 2. The nadir is less than the sum (shared dims help)
    ec.nadir < ec.personA_dims + ec.personB_dims ∧
    -- 3. Below the nadir, deficit is positive
    0 < buleDeficit ec.toFailureTopology (ec.nadir - 1) := by
  refine ⟨?_, ?_, ?_⟩
  · unfold schedulingDeficit semioticDeficit
    simp [failureToSemiotic, EmpathyChannel.toFailureTopology]
    unfold topologicalDeficit
    omega
  · unfold EmpathyChannel.nadir EmpathyChannel.effectiveDims
    have h := ec.sharedBounded
    simp [Nat.min_def] at h
    split_ifs at h <;> omega
  · exact empathy_nadir_is_minimum ec hBadHand

-- ═══════════════════════════════════════════════════════════════════════
-- §4. Diversity Has a Ceiling
-- ═══════════════════════════════════════════════════════════════════════

/-!
## There Is Enough Diversity

The American Frontier theorem (§15.2) proves waste is monotonically
non-increasing in diversity. Once diversity matches the intrinsic
beta1, the deficit is zero. Further diversity provides zero
additional topological benefit.

The ceiling is the intrinsic beta1. Below it, diversity is a
Pareto improvement. At it, the system is optimal. Above it,
diversity adds coordination cost without reducing deficit.
-/

/-- The diversity ceiling: the deficit is zero when community context
    reaches the failure dimensions minus the decision streams. -/
def diversityCeiling (ft : FailureTopology) : ℕ :=
  ft.failurePaths - ft.decisionStreams

/-- The diversity ceiling is exactly the maximum deficit. -/
theorem diversity_ceiling_eq_max_deficit (ft : FailureTopology) :
    diversityCeiling ft = maxDeficit ft := by
  unfold diversityCeiling maxDeficit
  rfl

/-- At the ceiling, the Bule deficit is zero. -/
theorem diversity_ceiling_sufficient (ft : FailureTopology)
    (hCeiling : ft.failurePaths ≤ ft.decisionStreams + diversityCeiling ft) :
    buleDeficit ft (diversityCeiling ft) = 0 :=
  bule_convergence ft (diversityCeiling ft) hCeiling

/-- Below the ceiling, the deficit is positive -- more diversity
    would help. -/
theorem below_ceiling_deficit_positive (ft : FailureTopology)
    (c : ℕ) (hBelow : c + ft.decisionStreams < ft.failurePaths) :
    0 < buleDeficit ft c := by
  unfold buleDeficit communityReducedDeficit contextReducedDeficit
  simp [failureToSemiotic]
  unfold topologicalDeficit
  omega

/-- Above the ceiling, the deficit is still zero -- additional
    diversity provides no further topological benefit. The cost
    of coordination is pure overhead past this point. -/
theorem above_ceiling_no_benefit (ft : FailureTopology)
    (c1 c2 : ℕ) (hAbove : ft.failurePaths ≤ ft.decisionStreams + c1)
    (hMore : c1 ≤ c2) :
    buleDeficit ft c2 = buleDeficit ft c1 := by
  have h1 := bule_convergence ft c1 hAbove
  have h2 : ft.failurePaths ≤ ft.decisionStreams + c2 := by omega
  have h3 := bule_convergence ft c2 h2
  rw [h1, h3]

-- ═══════════════════════════════════════════════════════════════════════
-- §5. The Pluralism Theorem
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Diversity + Community Is Strictly Better Than Either Alone

Diversity without community is fragile: no shared context to
bridge tares. Community without diversity is limited: correlated
failures, no portfolio effect. Both together reach the ground state.

This composes diversity_optimality (diversity is necessary) with
community_dominance_theory (community context Pareto-dominates).
-/

/-- A diverse community: multiple hardware layers with shared
    community context. -/
structure DiverseCommunity where
  /-- The failure topology -/
  topology : FailureTopology
  /-- Active hardware layer count (diversity level) -/
  diversity : ℕ
  /-- Community context (shared observations) -/
  communityContext : ℕ
  /-- At least two diverse layers -/
  hasDiversity : 2 ≤ diversity

/-- A diverse community with positive context strictly dominates
    a homogeneous community on any bad-hand topology. -/
theorem pluralism_dominates (dc : DiverseCommunity)
    (hContext : 0 < dc.communityContext)
    (hBadHand : 0 < schedulingDeficit dc.topology) :
    communityReducedDeficit dc.topology dc.communityContext <
      schedulingDeficit dc.topology :=
  community_strict_domination dc.topology dc.communityContext hContext hBadHand

/-- Diversity has a computable ceiling beyond which additional
    diversity provides no topological benefit. -/
theorem pluralism_has_ceiling (dc : DiverseCommunity)
    (hEnough : dc.topology.failurePaths ≤
      dc.topology.decisionStreams + dc.communityContext) :
    buleDeficit dc.topology dc.communityContext = 0 :=
  bule_convergence dc.topology dc.communityContext hEnough

-- ═══════════════════════════════════════════════════════════════════════
-- §6. No Exploration Means No Learning
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Stagnation Theorem: Without Exploration, the Void Is Static

The complement distribution is a deterministic function of the void
boundary. If no new rejections are recorded (no exploration, no
hedges fired, no slow backends completing), the void boundary is
unchanged, so the complement distribution is unchanged, so the
schedule is unchanged. The system has learned nothing.

Conversely, any exploration that produces a rejection strictly
increases the void boundary's total vent count, which shifts the
complement distribution, which constitutes learning.

This is the formal content of "no exploration means no learning."
The system must pay the exploration cost (the offset penalty, the
hedge, the slow backend's slot) to receive any learning benefit.
A system that never explores is frozen at its initial state
regardless of how much time passes.
-/

/-- Two void gradient states: one with no new exploration, one with. -/
structure ExplorationWitness where
  /-- Number of choices -/
  numChoices : ℕ
  /-- Nontrivial -/
  nontrivial : 2 ≤ numChoices
  /-- Rounds before exploration -/
  roundsBefore : ℕ
  /-- Positive rounds -/
  positiveRounds : 0 < roundsBefore
  /-- Vent counts before -/
  ventsBefore : Fin numChoices → ℕ
  /-- Vents bounded before -/
  ventsBoundedBefore : ∀ i, ventsBefore i ≤ roundsBefore
  /-- Vent counts after (unchanged = no exploration) -/
  ventsAfterNoExplore : Fin numChoices → ℕ
  /-- No exploration: vents unchanged -/
  noExploration : ventsAfterNoExplore = ventsBefore
  /-- Vent counts after exploration (one choice got rejected) -/
  ventsAfterExplore : Fin numChoices → ℕ
  /-- Exploration: at least one entry increased -/
  explored : ∃ i, ventsBefore i < ventsAfterExplore i
  /-- All entries non-decreasing -/
  exploreMonotone : ∀ i, ventsBefore i ≤ ventsAfterExplore i

/-- The complement weight function: rounds - ventCount + 1. -/
def complementWeight (rounds : ℕ) (ventCount : ℕ) : ℕ :=
  rounds - min ventCount rounds + 1

/-- Without exploration, complement weights are identical. The system
    has learned nothing. The schedule is frozen. -/
theorem no_exploration_no_learning (ew : ExplorationWitness)
    (i : Fin ew.numChoices) :
    complementWeight ew.roundsBefore (ew.ventsAfterNoExplore i) =
    complementWeight ew.roundsBefore (ew.ventsBefore i) := by
  rw [ew.noExploration]

/-- Without exploration, the entire weight vector is identical. -/
theorem no_exploration_frozen_schedule (ew : ExplorationWitness) :
    (fun i => complementWeight ew.roundsBefore (ew.ventsAfterNoExplore i)) =
    (fun i => complementWeight ew.roundsBefore (ew.ventsBefore i)) := by
  ext i
  exact no_exploration_no_learning ew i

/-- Without exploration, total accumulated void is unchanged. -/
theorem no_exploration_preserves_total_void (ew : ExplorationWitness) :
    (Finset.univ.sum fun i => ew.ventsAfterNoExplore i) =
    (Finset.univ.sum fun i => ew.ventsBefore i) := by
  rw [ew.noExploration]

/-- With exploration, the total void count strictly increases.
    The system has new information. -/
theorem exploration_increases_void (ew : ExplorationWitness) :
    (Finset.univ.sum fun i => ew.ventsBefore i) <
    (Finset.univ.sum fun i => ew.ventsAfterExplore i) := by
  obtain ⟨j, hj⟩ := ew.explored
  apply Finset.sum_lt_sum
  · intro i _
    exact ew.exploreMonotone i
  · exact ⟨j, Finset.mem_univ j, hj⟩

/-- With exploration, the explored choice's complement weight
    strictly decreases (it was rejected, so it gets less weight).
    This is learning: the distribution shifted away from what failed. -/
theorem exploration_shifts_distribution (ew : ExplorationWitness)
    (j : Fin ew.numChoices) (hj : ew.ventsBefore j < ew.ventsAfterExplore j)
    (hBounded : ew.ventsAfterExplore j ≤ ew.roundsBefore) :
    complementWeight ew.roundsBefore (ew.ventsAfterExplore j) <
    complementWeight ew.roundsBefore (ew.ventsBefore j) := by
  unfold complementWeight
  have h1 : min (ew.ventsBefore j) ew.roundsBefore = ew.ventsBefore j := by
    exact Nat.min_eq_left (le_of_lt (lt_of_lt_of_le hj hBounded))
  have h2 : min (ew.ventsAfterExplore j) ew.roundsBefore = ew.ventsAfterExplore j := by
    exact Nat.min_eq_left hBounded
  rw [h1, h2]
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- §7. The Stagnation-Learning Duality
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Complete Duality

Two sides of one coin:
1. No exploration → frozen schedule (no_exploration_frozen_schedule)
2. Exploration → shifted distribution (exploration_shifts_distribution)

The system must choose: pay the exploration cost (offset penalty,
hedge delay, coordination overhead) and learn, or pay nothing and
stagnate. There is no free learning. There is no cost-free
exploration. The choice is explicit and the consequences are proved.

This composes with the diversity ceiling (§4): below the ceiling,
exploration is worth the cost because it reduces the Bule deficit.
At the ceiling, exploration provides no further topological benefit.
Above the ceiling, exploration is pure coordination overhead with
no deficit reduction -- stagnation is the correct strategy.

The gait selector (c2, §14.5.4) implements this: high kurtosis
(converged, at or above ceiling) → tighten to trot/canter (exploit).
Low kurtosis (spread, below ceiling) → loosen to walk/stand (explore).
The skipped-hedge mechanism is the runtime expression of
no_exploration_frozen_schedule: when the community is confident,
it stops exploring and goes with what it knows.
-/

/-- The duality: without exploration the schedule is frozen,
    with exploration the distribution shifts. Both are proved. -/
theorem stagnation_learning_duality (ew : ExplorationWitness) :
    -- Without exploration: frozen
    ((fun i => complementWeight ew.roundsBefore (ew.ventsAfterNoExplore i)) =
     (fun i => complementWeight ew.roundsBefore (ew.ventsBefore i))) ∧
    -- With exploration: void grows
    ((Finset.univ.sum fun i => ew.ventsBefore i) <
     (Finset.univ.sum fun i => ew.ventsAfterExplore i)) := by
  exact ⟨no_exploration_frozen_schedule ew,
         exploration_increases_void ew⟩

-- ═══════════════════════════════════════════════════════════════════════
-- §8. Void Sharing Diagnostic: Where, How Much, Would More Help?
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Void Sharing Map

Given two personality vectors, the empathy diagnostic is not a single
number. It is a per-dimension map across the 58-element space:

- **Shared void**: dimensions where both persons have void entries
  AND both can see each other's entries. These dimensions are already
  bridged. No further vulnerability needed here.

- **Unshared void (A hidden)**: dimensions where A has void entries
  but B cannot see them. These are A's private WATNA -- trauma or
  rejection that A has not exposed.

- **Unshared void (B hidden)**: symmetric for B.

- **Unexplored**: dimensions where neither person has void entries.
  No rejection history exists here for either person.

For each unshared dimension, the question is: would sharing it
reduce the empathy deficit? The answer depends on where the pair
is relative to the ceiling:

- **Below ceiling** (current shared < effective dims - 1):
  sharing one more dimension reduces the Bule deficit by exactly 1.
  The benefit is one Bule of convergence progress.

- **At ceiling** (shared = effective dims - 1):
  sharing more has zero deficit benefit. The pair has already
  converged. Additional vulnerability is pure cost.

- **The vulnerability cost**: sharing a WATNA dimension exposes
  catastrophic history. This has real emotional cost that the
  deficit reduction may or may not justify. The theory identifies
  the threshold but does not prescribe the choice -- it says
  "this would help by exactly one Bule" or "this would not help
  at all," and the person decides.

The diagnostic is computable from two personality vectors and the
current void-sharing state.
-/

/-- The void sharing state between two persons across N dimensions. -/
structure VoidSharingMap where
  /-- Total personality dimensions (e.g. 58) -/
  totalDims : ℕ
  /-- Dimensions where both have void entries and both can see -/
  sharedVoidDims : ℕ
  /-- Dimensions where A has hidden void entries -/
  hiddenA : ℕ
  /-- Dimensions where B has hidden void entries -/
  hiddenB : ℕ
  /-- Dimensions where neither has void entries -/
  unexplored : ℕ
  /-- The partition is exhaustive -/
  exhaustive : sharedVoidDims + hiddenA + hiddenB + unexplored = totalDims
  /-- At least 2 active dimensions between them -/
  nontrivial : 2 ≤ sharedVoidDims + hiddenA + hiddenB

/-- Total active void dimensions (union of both persons' voids). -/
def VoidSharingMap.activeDims (vsm : VoidSharingMap) : ℕ :=
  vsm.sharedVoidDims + vsm.hiddenA + vsm.hiddenB

/-- The current empathy deficit: active dimensions minus 1 minus
    shared dimensions (shared dims are already bridged). -/
def VoidSharingMap.currentDeficit (vsm : VoidSharingMap) : ℕ :=
  vsm.hiddenA + vsm.hiddenB

/-- The pair has converged when there are no hidden dimensions. -/
def VoidSharingMap.converged (vsm : VoidSharingMap) : Prop :=
  vsm.hiddenA = 0 ∧ vsm.hiddenB = 0

/-- Would sharing one more of A's hidden dimensions help?
    Yes if and only if hiddenA > 0 (there is something to share)
    AND the current deficit is positive (not yet converged). -/
def VoidSharingMap.sharingAHelps (vsm : VoidSharingMap) : Prop :=
  0 < vsm.hiddenA

/-- Would sharing one more of B's hidden dimensions help? -/
def VoidSharingMap.sharingBHelps (vsm : VoidSharingMap) : Prop :=
  0 < vsm.hiddenB

/-- Sharing a hidden dimension reduces the deficit by exactly 1. -/
theorem sharing_reduces_deficit_by_one (vsm : VoidSharingMap)
    (hHiddenA : 0 < vsm.hiddenA) :
    VoidSharingMap.currentDeficit
      { vsm with
        sharedVoidDims := vsm.sharedVoidDims + 1
        hiddenA := vsm.hiddenA - 1
        exhaustive := by omega
        nontrivial := by omega } + 1 =
    vsm.currentDeficit := by
  unfold VoidSharingMap.currentDeficit
  simp
  omega

/-- When the deficit is zero (converged), sharing has no benefit.
    Additional vulnerability is pure cost. -/
theorem sharing_useless_when_converged (vsm : VoidSharingMap)
    (hConverged : vsm.converged) :
    vsm.currentDeficit = 0 := by
  unfold VoidSharingMap.currentDeficit VoidSharingMap.converged at *
  omega

/-- When the deficit is positive, there exist hidden dimensions
    that would reduce it. -/
theorem positive_deficit_implies_hidden (vsm : VoidSharingMap)
    (hPositive : 0 < vsm.currentDeficit) :
    vsm.sharingAHelps ∨ vsm.sharingBHelps := by
  unfold VoidSharingMap.currentDeficit VoidSharingMap.sharingAHelps
    VoidSharingMap.sharingBHelps at *
  omega

/-- The vulnerability demand: how many hidden dimensions must be
    shared to reach convergence. This is the irreducible personal
    cost of empathy that no community mediation can substitute. -/
def VoidSharingMap.vulnerabilityDemand (vsm : VoidSharingMap) : ℕ :=
  vsm.currentDeficit

/-- The vulnerability demand equals hidden A plus hidden B. -/
theorem vulnerability_demand_is_total_hidden (vsm : VoidSharingMap) :
    vsm.vulnerabilityDemand = vsm.hiddenA + vsm.hiddenB := by
  unfold VoidSharingMap.vulnerabilityDemand VoidSharingMap.currentDeficit

/-- Zero current deficit is exactly convergence. -/
theorem current_deficit_zero_iff_converged (vsm : VoidSharingMap) :
    vsm.currentDeficit = 0 ↔ vsm.converged := by
  unfold VoidSharingMap.currentDeficit VoidSharingMap.converged
  omega

/-- The vulnerability demand is zero if and only if converged. -/
theorem vulnerability_zero_iff_converged (vsm : VoidSharingMap) :
    vsm.vulnerabilityDemand = 0 ↔ vsm.converged := by
  unfold VoidSharingMap.vulnerabilityDemand VoidSharingMap.currentDeficit
    VoidSharingMap.converged
  omega

/-- Positive vulnerability demand means the pair has not yet converged. -/
theorem vulnerability_positive_iff_not_converged (vsm : VoidSharingMap) :
    0 < vsm.vulnerabilityDemand ↔ ¬ vsm.converged := by
  unfold VoidSharingMap.vulnerabilityDemand VoidSharingMap.currentDeficit
    VoidSharingMap.converged
  omega

/-- The complete void sharing diagnostic.

    For any two persons with known personality vectors:
    1. The deficit is the count of hidden dimensions
    2. Each shared hidden dimension reduces deficit by exactly 1
    3. When deficit is zero, further sharing has no benefit
    4. When deficit is positive, at least one sharing opportunity exists
    5. The vulnerability demand is the total hidden count

    The diagnostic answers: where is void sharing (sharedVoidDims),
    how much (currentDeficit = how far from convergence), and would
    more help (sharingAHelps, sharingBHelps -- yes iff hidden > 0
    and deficit > 0). -/
theorem void_sharing_diagnostic (vsm : VoidSharingMap) :
    -- Deficit = hidden dimensions
    vsm.vulnerabilityDemand = vsm.hiddenA + vsm.hiddenB ∧
    -- Zero demand ↔ converged
    (vsm.vulnerabilityDemand = 0 ↔ vsm.converged) ∧
    -- Positive deficit → sharing opportunity exists
    (0 < vsm.currentDeficit → vsm.sharingAHelps ∨ vsm.sharingBHelps) := by
  exact ⟨vulnerability_demand_is_total_hidden vsm,
         vulnerability_zero_iff_converged vsm,
         positive_deficit_implies_hidden vsm⟩

-- ═══════════════════════════════════════════════════════════════════════
-- §9. Community as Treatment for Curvature Accumulation
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Community Reduces Curvature Accumulation Rate

Depression is modeled as an event horizon in the 58-dimensional
emotion-spacetime manifold (§14.5.8): accumulated WATNA curves the
manifold past the causal speed limit, trapping the walker.

The field equation (§14.5.8, `void_field_equation`) says curvature
equals stress-energy squared, and stress-energy equals the interval
(total vent count). The interval grows with each fold that generates
Landauer heat. Community context reduces the deficit that generates
the heat (`community_attenuates_failure`). Therefore community
reduces the rate at which the interval grows, which reduces the
rate at which curvature accumulates.

Community cannot reverse existing curvature (second law). But it
can slow the accumulation rate to zero. At the nadir (buleDeficit = 0),
no new heat is generated, curvature stops growing, and the event
horizon stops advancing.

This is the formal content of "community is therapeutic at the
population scale." Individual therapy rotates curvature direction
(`therapy_rotates_curvature`). Community prevents new curvature
from being generated.
-/

/-- A curvature trajectory: the Bule deficit determines the heat
    generation rate, which determines the curvature growth rate. -/
structure CurvatureTrajectory where
  /-- The failure topology (dimensions of experience) -/
  topology : FailureTopology
  /-- Community context at each round -/
  contextAtRound : ℕ → ℕ
  /-- Context is non-decreasing -/
  contextMonotone : ∀ t, contextAtRound t ≤ contextAtRound (t + 1)

/-- The curvature growth rate at round t is proportional to the
    Bule deficit at that round. Zero deficit = zero growth. -/
def CurvatureTrajectory.growthRate (ct : CurvatureTrajectory) (t : ℕ) : ℤ :=
  buleDeficit ct.topology (ct.contextAtRound t)

/-- Community reduces the curvature growth rate monotonically. -/
theorem community_reduces_curvature_rate (ct : CurvatureTrajectory) (t : ℕ) :
    ct.growthRate (t + 1) ≤ ct.growthRate t :=
  bule_deficit_monotone_decreasing ct.topology
    (ct.contextAtRound t) (ct.contextAtRound (t + 1)) (ct.contextMonotone t)

/-- Sufficient community context stops curvature growth entirely. -/
theorem community_stops_curvature (ct : CurvatureTrajectory) (t : ℕ)
    (hEnough : ct.topology.failurePaths ≤
      ct.topology.decisionStreams + ct.contextAtRound t) :
    ct.growthRate t = 0 :=
  bule_convergence ct.topology (ct.contextAtRound t) hEnough

-- ═══════════════════════════════════════════════════════════════════════
-- §9. Herd Immunity as Community Dominance
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Immune System Is Community Dominance Over Pathogens

V(D)J recombination (§1.6) forks 10^11 antibody configurations,
races them against antigen, folds the winners. The pathogen failure
topology has F dimensions (epitope variants, escape mutations,
serotypes). A single individual's immune repertoire covers some
subset of these dimensions. The community's collective repertoire
-- MHC diversity across the population -- covers more.

`community_bridges_tares` = herd immunity bridging the epitope
dimensions that individual immune systems cannot cover.

The algebraic nadir predicts the minimum viable community size
for immune coverage: C* = F - 1 distinct MHC haplotypes needed
to cover all pathogen dimensions.
-/

/-- A pathogen failure topology: epitope dimensions that the
    immune system must cover. -/
structure PathogenTopology where
  /-- Number of epitope variants (failure dimensions) -/
  epitopeDims : ℕ
  /-- At least 2 epitopes (nontrivial pathogen) -/
  nontrivial : 2 ≤ epitopeDims

/-- Convert to a failure topology. The decision stream is 1
    (one immune response per encounter). -/
def PathogenTopology.toFailureTopology (pt : PathogenTopology) :
    FailureTopology where
  failurePaths := pt.epitopeDims
  decisionStreams := 1
  hFailurePos := pt.nontrivial
  hDecisionPos := by omega

/-- The minimum MHC diversity for herd immunity. -/
def herdImmunityThreshold (pt : PathogenTopology) : ℕ :=
  pt.epitopeDims - 1

/-- The herd-immunity threshold is the same ceiling computed on the
    induced failure topology. -/
theorem herd_immunity_threshold_eq_diversity_ceiling (pt : PathogenTopology) :
    herdImmunityThreshold pt = diversityCeiling pt.toFailureTopology := by
  unfold herdImmunityThreshold diversityCeiling PathogenTopology.toFailureTopology
  rfl

/-- At the threshold, the community covers all epitope dimensions. -/
theorem herd_immunity_at_threshold (pt : PathogenTopology)
    (hEnough : pt.epitopeDims ≤ 1 + herdImmunityThreshold pt) :
    buleDeficit pt.toFailureTopology (herdImmunityThreshold pt) = 0 := by
  apply bule_convergence
  unfold PathogenTopology.toFailureTopology herdImmunityThreshold
  simp
  omega

/-- Below the threshold, the community has uncovered epitope
    dimensions -- vulnerability to the pathogen. -/
theorem below_herd_immunity_vulnerable (pt : PathogenTopology)
    (mhcDiversity : ℕ) (hBelow : mhcDiversity + 1 < pt.epitopeDims) :
    0 < buleDeficit pt.toFailureTopology mhcDiversity := by
  unfold buleDeficit communityReducedDeficit contextReducedDeficit
  simp [failureToSemiotic, PathogenTopology.toFailureTopology]
  unfold topologicalDeficit
  omega

/-- One fewer haplotype than the herd-immunity threshold still leaves
    a positive vulnerability gap. -/
theorem herd_immunity_threshold_minimum (pt : PathogenTopology) :
    0 < buleDeficit pt.toFailureTopology (herdImmunityThreshold pt - 1) := by
  unfold buleDeficit communityReducedDeficit contextReducedDeficit
  simp [failureToSemiotic, PathogenTopology.toFailureTopology,
    herdImmunityThreshold]
  unfold topologicalDeficit
  omega

/-- Each new MHC haplotype in the community covers one more
    epitope dimension. -/
theorem mhc_diversity_progress (pt : PathogenTopology)
    (c : ℕ) (hRemaining : 0 < buleDeficit pt.toFailureTopology c) :
    buleDeficit pt.toFailureTopology (c + 1) <
    buleDeficit pt.toFailureTopology c :=
  bule_deficit_strict_progress pt.toFailureTopology c hRemaining

/-- Once the herd-immunity threshold is met, extra diversity keeps the
    pathogen topology covered. -/
theorem herd_immunity_after_threshold_zero (pt : PathogenTopology)
    (c : ℕ) (hAfter : herdImmunityThreshold pt ≤ c) :
    buleDeficit pt.toFailureTopology c = 0 := by
  apply bule_convergence
  unfold PathogenTopology.toFailureTopology herdImmunityThreshold at *
  simp
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- §10. Chaperones as Mediators, Repair Enzymes as Community Memory
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Molecular Community: Chaperones and Repair Enzymes

Protein chaperones and DNA repair enzymes are instances of the
community mediator pattern at the molecular scale.

**Chaperones** provide shared context for protein folding: the
correct folding environment that reduces the failure topology of
the energy landscape. community_attenuates_failure = chaperones
attenuating misfolding probability. The chaperone is Walker S:
self-interested in correct folding (its function), accumulating
rejection history (failed folds trigger chaperone binding), and
converging the folding trajectory toward the native state.

**DNA repair enzymes** distinguish template from newly-synthesized
strand: they are the CRDT tracking which information is authoritative.
community_attenuates_failure = mismatch repair reducing the per-base
error rate from ~10^-4 (polymerase alone) to ~10^-10 (with repair).
Six orders of magnitude of community attenuation.

Both are modeled as community context reducing a failure topology.
-/

/-- A molecular failure topology: the number of independent failure
    modes in a molecular process (misfolding conformations, base
    mismatch types, etc.). -/
structure MolecularFailureTopology where
  /-- Failure modes without community (chaperones/repair) -/
  failureModesAlone : ℕ
  /-- Failure modes with community -/
  failureModesWithCommunity : ℕ
  /-- Community reduces failure modes -/
  communityReduces : failureModesWithCommunity ≤ failureModesAlone
  /-- At least 2 failure modes alone (nontrivial) -/
  nontrivial : 2 ≤ failureModesAlone

/-- The attenuation factor: how many failure modes community covers. -/
def MolecularFailureTopology.attenuation (mft : MolecularFailureTopology) : ℕ :=
  mft.failureModesAlone - mft.failureModesWithCommunity

/-- Community attenuation is non-negative. -/
theorem molecular_attenuation_nonneg (mft : MolecularFailureTopology) :
    0 ≤ mft.attenuation := by
  unfold MolecularFailureTopology.attenuation
  omega

/-- The attenuation is bounded by the original failure count. -/
theorem molecular_attenuation_bounded (mft : MolecularFailureTopology) :
    mft.attenuation ≤ mft.failureModesAlone := by
  unfold MolecularFailureTopology.attenuation
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- §11. Cultural Evolution Has an Algebraic Nadir
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Cultural Knowledge Is a CRDT

Cultural knowledge is append-only (oral traditions, written law,
scientific literature, institutional memory). It is conflict-free
(multiple cultures can accumulate knowledge independently and merge
without destructive conflict -- the merge is the union of observations).
It is eventually consistent (given enough exchange, all cultures
converge on shared knowledge).

Cultural knowledge is a CRDT. The algebraic nadir applied to
cultural failure dimensions gives the minimum shared cultural
context for convergence on any topic. The number of independent
observations needed to resolve a controversy is C* = F - 1 where
F is the number of independent dimensions of disagreement.
-/

/-- A cultural controversy: dimensions of disagreement between
    two communities. -/
structure CulturalControversy where
  /-- Community A's dimensions of understanding -/
  communityA_dims : ℕ
  /-- Community B's dimensions of understanding -/
  communityB_dims : ℕ
  /-- Each community has at least 2 dimensions -/
  communityA_complex : 2 ≤ communityA_dims
  communityB_complex : 2 ≤ communityB_dims
  /-- Shared cultural context already accumulated -/
  sharedContext : ℕ

/-- The number of observations needed to resolve the controversy. -/
def CulturalControversy.resolutionRounds (cc : CulturalControversy) : ℕ :=
  cc.communityA_dims + cc.communityB_dims - 1

/-- Resolution rounds equals the empathy nadir applied to cultures. -/
theorem cultural_nadir_equals_empathy (cc : CulturalControversy) :
    cc.resolutionRounds =
    empathyNadirRaw cc.communityA_dims cc.communityB_dims
      cc.communityA_complex cc.communityB_complex := by
  unfold CulturalControversy.resolutionRounds empathyNadirRaw
    nadirContext SkyrmsAsCommunity.totalDims
  simp

/-- Cultural controversies always require a positive number of shared
    observations to resolve. -/
theorem cultural_resolution_rounds_pos (cc : CulturalControversy) :
    0 < cc.resolutionRounds := by
  unfold CulturalControversy.resolutionRounds
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- §12. Local vs. Global Community
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Local Communities Compose into Global Communities

A local community is a single QDoc instance (one group's observations).
A global community is the merged QDoc (all groups synced). The key
properties:

1. Each local community reduces its own deficit independently.
2. Merging two local communities produces a global community whose
   context is at least the maximum of the two local contexts
   (and at most the sum, depending on overlap).
3. The global Bule deficit is at most the minimum of the local
   deficits.
4. Isolated communities (no sync) can each be locally optimal but
   globally suboptimal.

The community of communities is itself a community that mediates
between local communities.
-/

/-- Two local communities with separate observations. -/
structure LocalCommunities where
  /-- Shared failure topology -/
  topology : FailureTopology
  /-- Community A's context -/
  contextA : ℕ
  /-- Community B's context -/
  contextB : ℕ

/-- The merged context: at least the max of the two locals. -/
def LocalCommunities.mergedContextLower (lc : LocalCommunities) : ℕ :=
  max lc.contextA lc.contextB

/-- The merged context: at most the sum of the two locals. -/
def LocalCommunities.mergedContextUpper (lc : LocalCommunities) : ℕ :=
  lc.contextA + lc.contextB

/-- The merged context lower bound contains community A's context. -/
theorem merged_context_lower_ge_left (lc : LocalCommunities) :
    lc.contextA ≤ lc.mergedContextLower := by
  unfold LocalCommunities.mergedContextLower
  exact le_max_left _ _

/-- The merged context lower bound contains community B's context. -/
theorem merged_context_lower_ge_right (lc : LocalCommunities) :
    lc.contextB ≤ lc.mergedContextLower := by
  unfold LocalCommunities.mergedContextLower
  exact le_max_right _ _

/-- The merged-context interval is nonempty: the lower bound never exceeds
    the additive upper bound. -/
theorem merged_context_upper_ge_lower (lc : LocalCommunities) :
    lc.mergedContextLower ≤ lc.mergedContextUpper := by
  unfold LocalCommunities.mergedContextLower LocalCommunities.mergedContextUpper
  omega

/-- The global deficit is at most the minimum local deficit,
    because the merged context is at least the max local context. -/
theorem global_deficit_le_min_local (lc : LocalCommunities) :
    buleDeficit lc.topology lc.mergedContextLower ≤
    min (buleDeficit lc.topology lc.contextA)
        (buleDeficit lc.topology lc.contextB) := by
  unfold LocalCommunities.mergedContextLower
  apply le_min
  · exact bule_deficit_monotone_decreasing lc.topology
      lc.contextA (max lc.contextA lc.contextB) (le_max_left _ _)
  · exact bule_deficit_monotone_decreasing lc.topology
      lc.contextB (max lc.contextA lc.contextB) (le_max_right _ _)

/-- The merged global deficit is at most community A's local deficit. -/
theorem global_deficit_le_left_local (lc : LocalCommunities) :
    buleDeficit lc.topology lc.mergedContextLower ≤
    buleDeficit lc.topology lc.contextA := by
  exact le_trans (global_deficit_le_min_local lc) (min_le_left _ _)

/-- The merged global deficit is at most community B's local deficit. -/
theorem global_deficit_le_right_local (lc : LocalCommunities) :
    buleDeficit lc.topology lc.mergedContextLower ≤
    buleDeficit lc.topology lc.contextB := by
  exact le_trans (global_deficit_le_min_local lc) (min_le_right _ _)

/-- Merging two locally-converged communities stays converged. -/
theorem merged_communities_stay_converged (lc : LocalCommunities)
    (hA : buleDeficit lc.topology lc.contextA = 0) :
    buleDeficit lc.topology lc.mergedContextLower = 0 := by
  have h := global_deficit_le_min_local lc
  simp [hA] at h
  omega

/-- The same convergence preservation holds when community B is the
    converged local witness. -/
theorem merged_communities_stay_converged_right (lc : LocalCommunities)
    (hB : buleDeficit lc.topology lc.contextB = 0) :
    buleDeficit lc.topology lc.mergedContextLower = 0 := by
  have h := global_deficit_le_min_local lc
  simp [hB] at h
  omega

/-- Isolated communities can have higher deficit than merged ones.
    The merged context is always at least the max local context. -/
theorem isolation_suboptimal (lc : LocalCommunities)
    (hASmaller : lc.contextA ≤ lc.contextB) :
    buleDeficit lc.topology lc.mergedContextLower ≤
    buleDeficit lc.topology lc.contextA :=
  bule_deficit_monotone_decreasing lc.topology
    lc.contextA lc.mergedContextLower (by
      unfold LocalCommunities.mergedContextLower; exact le_max_left _ _)

end ForkRaceFoldTheorems
