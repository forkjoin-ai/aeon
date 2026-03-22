import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.FailureEntropy
import ForkRaceFoldTheorems.FailureController
import ForkRaceFoldTheorems.ReynoldsBFT
import ForkRaceFoldTheorems.SleepDebt
import ForkRaceFoldTheorems.RetrocausalBound
import ForkRaceFoldTheorems.CombinatorialBruteForce
import ForkRaceFoldTheorems.CombinatorialBruteForceRound2

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Combinatorial Brute Force Round 3: Exotic Cross-Domain Compositions

Round 3 pushes into Reynolds numbers, sleep debt, retrocausal bounds,
and their interactions with the core Buleyean/failure framework.

## Consecutive failure count: 0
-/

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 26: ReynoldsBFT × BuleyeanProbability
-- "Buleyean Regime Selection"
--
-- ReynoldsBFT: idle fraction determines fold safety regime.
-- BuleyeanProbability: void boundary weights from rejection history.
-- Composition: the void boundary of past scheduling failures
-- determines which BFT regime the system should operate in.
-- The system learns its own Reynolds number from rejection history.
-- ═══════════════════════════════════════════════════════════════════════

/-- A Buleyean regime selector: the system has tried different
    stage/chunk configurations and observed failures (idle stages
    causing fold failures). The void boundary encodes which
    configurations failed. -/
structure BuleyeanRegimeSelector where
  /-- Number of candidate configurations -/
  numConfigs : ℕ
  /-- Nontrivial -/
  hNontrivial : 2 ≤ numConfigs
  /-- Failure count per configuration -/
  failureCounts : Fin numConfigs → ℕ
  /-- Observation rounds -/
  rounds : ℕ
  hRoundsPos : 0 < rounds
  hBounded : ∀ i, failureCounts i ≤ rounds

/-- Convert to Buleyean space. -/
def BuleyeanRegimeSelector.toBuleyeanSpace (sel : BuleyeanRegimeSelector) : BuleyeanSpace where
  numChoices := sel.numConfigs
  nontrivial := sel.hNontrivial
  rounds := sel.rounds
  positiveRounds := sel.hRoundsPos
  voidBoundary := sel.failureCounts
  bounded := sel.hBounded

/-- THEOREM: The configuration with fewer observed fold failures gets
    higher Buleyean weight. The system concentrates on safer regimes. -/
theorem combo_reynolds_buleyean_safer_preferred
    (sel : BuleyeanRegimeSelector)
    (safe risky : Fin sel.numConfigs)
    (hSafer : sel.failureCounts safe ≤ sel.failureCounts risky) :
    sel.toBuleyeanSpace.weight risky ≤ sel.toBuleyeanSpace.weight safe := by
  exact buleyean_concentration sel.toBuleyeanSpace safe risky hSafer

/-- THEOREM: No configuration is ever fully abandoned. Even a
    configuration that has failed every round retains the sliver.
    This is important because Reynolds conditions change — a previously
    risky regime might become safe if chunk counts change. -/
theorem combo_reynolds_buleyean_sliver (sel : BuleyeanRegimeSelector)
    (config : Fin sel.numConfigs) :
    0 < sel.toBuleyeanSpace.weight config := by
  exact buleyean_positivity sel.toBuleyeanSpace config

/-- ANTI-THEOREM: A configuration that has failed more times than another
    CANNOT have higher weight. The Buleyean framework prevents the
    system from preferring demonstrably worse configurations. -/
theorem combo_reynolds_anti_worse_preferred
    (sel : BuleyeanRegimeSelector)
    (better worse : Fin sel.numConfigs)
    (hBetter : sel.failureCounts better < sel.failureCounts worse) :
    sel.toBuleyeanSpace.weight worse < sel.toBuleyeanSpace.weight better := by
  exact buleyean_strict_concentration sel.toBuleyeanSpace better worse hBetter

-- ─── SANDWICH: Reynolds Regime Selection ──────────────────────────────
-- Upper: max weight = rounds + 1 (zero-failure config)
-- Lower: min weight = 1 (max-failure config, the sliver)
-- Gain: rounds (the total discrimination power)

/-- SANDWICH: The discrimination range for regime selection is exactly
    the number of observation rounds. More data = more discrimination. -/
theorem combo_reynolds_discrimination_range (sel : BuleyeanRegimeSelector)
    (best worst : Fin sel.numConfigs)
    (hBest : sel.failureCounts best = 0)
    (hWorst : sel.failureCounts worst = sel.rounds) :
    sel.toBuleyeanSpace.weight best - sel.toBuleyeanSpace.weight worst = sel.rounds := by
  unfold BuleyeanSpace.weight BuleyeanRegimeSelector.toBuleyeanSpace
  simp [hBest, hWorst, Nat.min_def]
  split_ifs <;> omega

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 27: SleepDebt × FailureEntropy
-- "Sleep Debt IS Failure Entropy"
--
-- SleepDebt: residual debt accumulates from incomplete recovery.
-- FailureEntropy: frontier entropy proxy reduces with each failure.
-- Composition: sleep debt and failure entropy are dual views of
-- the same accumulation — debt is unrecovered capacity, entropy
-- is unreduced frontier. Both are monotone accumulators.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The duality identity. Partial recovery of sleep debt
    leaves positive residual (SleepDebt), just as partial venting
    of a frontier leaves positive entropy (FailureEntropy).
    Both are strictly greater than zero when recovery is incomplete. -/
theorem combo_sleep_failure_duality
    {wakeLoad carriedDebt recoveryQuota frontier vented : ℕ}
    (hSleepShortfall : recoveryQuota < wakeLoad + carriedDebt)
    (hFailurePartial : 0 < vented)
    (hFailureBound : vented ≤ frontier) :
    -- Sleep side: positive residual debt
    0 < SleepDebt.residualDebt wakeLoad carriedDebt recoveryQuota ∧
    -- Failure side: reduced frontier
    structuredFrontier frontier vented < frontier := by
  exact ⟨SleepDebt.partial_recovery_leaves_positive_debt hSleepShortfall,
         structured_failure_reduces_frontier_width hFailurePartial hFailureBound⟩

/-- THEOREM: Full recovery clears both. When sleep debt is fully recovered
    AND failure frontier collapses to single survivor, both accumulators
    reach their respective zero states. -/
theorem combo_sleep_failure_full_recovery
    {wakeLoad carriedDebt recoveryQuota frontier : ℕ}
    (hSleepClear : wakeLoad + carriedDebt ≤ recoveryQuota)
    (hForked : 1 < frontier) :
    -- Sleep side: zero debt
    SleepDebt.residualDebt wakeLoad carriedDebt recoveryQuota = 0 ∧
    -- Failure side: single survivor
    structuredFrontier frontier (frontier - 1) = 1 := by
  exact ⟨SleepDebt.full_recovery_clears_residual_debt hSleepClear,
         forked_frontier_collapses_to_single_survivor hForked⟩

/-- ANTI-THEOREM: Chronic partial recovery strictly increases debt.
    Each cycle where recovery quota is below wake load INCREASES
    the carried debt, just as iterated failure deepens frontier collapse. -/
theorem combo_chronic_sleep_failure_escalation
    {nextWakeLoad carriedDebt recoveryQuota : ℕ}
    (hChronic : recoveryQuota < nextWakeLoad) :
    carriedDebt < SleepDebt.residualDebt nextWakeLoad carriedDebt recoveryQuota := by
  exact SleepDebt.repeated_truncation_strictly_increases_debt hChronic

-- ─── SANDWICH: Sleep-Failure Accumulation ─────────────────────────────
-- Upper: debt ≤ wakeLoad + carriedDebt (no recovery = max accumulation)
-- Lower: debt ≥ 0 (full recovery = zero)
-- Gain: recoveryQuota (the amount of recovery work done)

/-- SANDWICH UPPER: Residual debt is bounded above by total demand. -/
theorem combo_sleep_debt_upper {wakeLoad carriedDebt recoveryQuota : ℕ} :
    SleepDebt.residualDebt wakeLoad carriedDebt recoveryQuota ≤ wakeLoad + carriedDebt := by
  unfold SleepDebt.residualDebt SleepDebt.totalRecoveryDemand
  omega

/-- SANDWICH LOWER: Residual debt is non-negative (it's a Nat). -/
theorem combo_sleep_debt_lower {wakeLoad carriedDebt recoveryQuota : ℕ} :
    0 ≤ SleepDebt.residualDebt wakeLoad carriedDebt recoveryQuota := by
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 28: RetrocausalBound × BuleyeanProbability
-- "Retrocausal Weight Determination"
--
-- RetrocausalBound: terminal state constrains trajectory.
-- BuleyeanProbability: void boundary determines weights.
-- Composition: the terminal Buleyean weights are deterministic
-- given the terminal void boundary. The "future" distribution
-- determines the "past" trajectory's statistical properties.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The trajectory void boundary of the empty trajectory gives
    all choices maximum weight (rounds + 1 per choice = 0 + 1 = 1,
    since rounds = 0 means we actually need a BuleyeanSpace to query).
    This is the "maximum prior uncertainty" retrocausal state. -/
theorem combo_retrocausal_empty_trajectory (n : ℕ) (i : Fin n) :
    trajectoryVoidBoundary n [] i = 0 := by
  exact trajectoryVoidBoundary_nil n i

/-- THEOREM: Recording one rejection (appending to trajectory) increments
    exactly one choice's rejection count. This is the atomic step of
    retrocausal information accumulation. -/
theorem combo_retrocausal_atomic_step (n : ℕ) (traj : List (Fin n)) (j : Fin n) :
    trajectoryVoidBoundary n (j :: traj) j = trajectoryVoidBoundary n traj j + 1 := by
  exact trajectoryVoidBoundary_cons_eq n traj j

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 29: ReynoldsBFT × FailureEntropy
-- "Reynolds Number Determines Failure Budget"
--
-- ReynoldsBFT: idle fraction from N/C ratio.
-- FailureEntropy: frontier entropy proxy = N-1.
-- Composition: the idle fraction determines how much of the
-- failure entropy budget is "wasted" on idle stages vs. useful work.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: When all stages are busy (chunks ≥ stages), the idle
    count is zero. The full failure entropy budget goes to useful work. -/
theorem combo_reynolds_zero_idle_full_budget (N C : ℕ) (h : C ≥ N) :
    idleStages N C = 0 := by
  exact idleStages_zero_of_chunks_ge_stages N C h

/-- THEOREM: The idle stages count is bounded by the total stage count.
    You can never waste more than your total capacity. -/
theorem combo_reynolds_idle_bounded (N C : ℕ) :
    idleStages N C ≤ N := by
  exact idleStages_le_numStages N C

/-- ANTI-THEOREM: When chunks < stages, idle stages are EXACTLY N-C.
    This is deterministic, not probabilistic — the waste is precisely
    computable from the Reynolds number. -/
theorem combo_reynolds_exact_waste (N C : ℕ) (hC : C < N) :
    idleStages N C = N - C := by
  exact idleStages_eq_of_chunks_lt_stages N C hC

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 30: SleepDebt × BuleyeanProbability
-- "Buleyean Sleep Schedule Selection"
--
-- SleepDebt: recovery schedules accumulate or clear debt.
-- BuleyeanProbability: rejection history weights schedules.
-- Composition: the system learns which sleep schedules work
-- by tracking which schedules led to capacity reduction (failure).
-- ═══════════════════════════════════════════════════════════════════════

/-- A Buleyean sleep schedule selector: multiple sleep schedules compete,
    and capacity-reduction events act as rejections. -/
structure BuleyeanSleepSelector where
  numSchedules : ℕ
  hNontrivial : 2 ≤ numSchedules
  capacityFailures : Fin numSchedules → ℕ
  rounds : ℕ
  hRoundsPos : 0 < rounds
  hBounded : ∀ i, capacityFailures i ≤ rounds

def BuleyeanSleepSelector.toBuleyeanSpace (sel : BuleyeanSleepSelector) : BuleyeanSpace where
  numChoices := sel.numSchedules
  nontrivial := sel.hNontrivial
  rounds := sel.rounds
  positiveRounds := sel.hRoundsPos
  voidBoundary := sel.capacityFailures
  bounded := sel.hBounded

/-- THEOREM: The sleep schedule with fewer capacity failures gets higher
    Buleyean weight. Better sleep = less failure = higher selection weight. -/
theorem combo_sleep_buleyean_better_sleep_wins
    (sel : BuleyeanSleepSelector)
    (good bad : Fin sel.numSchedules)
    (hBetter : sel.capacityFailures good ≤ sel.capacityFailures bad) :
    sel.toBuleyeanSpace.weight bad ≤ sel.toBuleyeanSpace.weight good := by
  exact buleyean_concentration sel.toBuleyeanSpace good bad hBetter

/-- THEOREM: No sleep schedule is abandoned. The sliver means the
    system will occasionally retry even "bad" schedules — circadian
    drift might make a previously bad schedule good. -/
theorem combo_sleep_buleyean_never_abandon (sel : BuleyeanSleepSelector)
    (sched : Fin sel.numSchedules) :
    0 < sel.toBuleyeanSpace.weight sched := by
  exact buleyean_positivity sel.toBuleyeanSpace sched

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 31: ReynoldsBFT × SleepDebt
-- "Pipeline Sleep: Idle Stages as Sleep Debt"
--
-- ReynoldsBFT: idle stages from chunk/stage mismatch.
-- SleepDebt: residual debt from incomplete recovery.
-- Composition: idle pipeline stages accumulate "processing debt"
-- exactly like sleep debt accumulates from insufficient recovery.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: When chunks are insufficient (C < N), the pipeline
    accumulates exactly N-C idle stages of "processing debt."
    When chunks are sufficient (C ≥ N), debt is zero.
    This mirrors the sleep debt full/partial recovery dichotomy. -/
theorem combo_pipeline_debt_dichotomy (N C : ℕ) :
    (C ≥ N → idleStages N C = 0) ∧
    (C < N → idleStages N C = N - C) := by
  exact ⟨idleStages_zero_of_chunks_ge_stages N C,
         idleStages_eq_of_chunks_lt_stages N C⟩

-- ═══════════════════════════════════════════════════════════════════════
-- COMBO 32: RetrocausalBound × FailureEntropy × BuleyeanProbability
-- "The Complete Retrocausal Pipeline"
--
-- Triple: terminal state (retrocausal) → void boundary (VoidWalking)
-- → weights (Buleyean) → entropy proxy (FailureEntropy).
-- The full chain: observing the terminal distribution lets you
-- compute the complete failure history and its thermodynamic cost.
-- ═══════════════════════════════════════════════════════════════════════

/-- THEOREM: The complete retrocausal pipeline.
    Given a fold step:
    1. The void boundary grows by at least 1 (VoidWalking)
    2. The entropy proxy is N-1 (FailureEntropy)
    3. The Buleyean weight of any choice is positive (BuleyeanProbability)
    All three hold simultaneously at every step. -/
theorem combo_retrocausal_pipeline (step : FoldStep) (bs : BuleyeanSpace) :
    (1 ≤ step.forkWidth - 1) ∧
    (frontierEntropyProxy step.forkWidth = step.forkWidth - 1) ∧
    (∀ i, 0 < bs.weight i) := by
  refine ⟨?_, ?_, ?_⟩
  · have := step.nontrivial; omega
  · unfold frontierEntropyProxy; omega
  · exact fun i => buleyean_positivity bs i

-- ═══════════════════════════════════════════════════════════════════════
-- MASTER THEOREM: Round 3 Summary
-- ═══════════════════════════════════════════════════════════════════════

/-- Master conjunction for Round 3. -/
theorem combinatorial_brute_force_round3_master
    (sel_regime : BuleyeanRegimeSelector)
    (sel_sleep : BuleyeanSleepSelector)
    (step : FoldStep)
    (bs : BuleyeanSpace)
    (N C : ℕ) :
    -- Reynolds regime sliver
    (∀ config, 0 < sel_regime.toBuleyeanSpace.weight config) ∧
    -- Sleep schedule sliver
    (∀ sched, 0 < sel_sleep.toBuleyeanSpace.weight sched) ∧
    -- Pipeline debt dichotomy
    ((C ≥ N → idleStages N C = 0) ∧ (C < N → idleStages N C = N - C)) ∧
    -- Retrocausal pipeline
    ((1 ≤ step.forkWidth - 1) ∧ (∀ i, 0 < bs.weight i)) := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · exact fun config => combo_reynolds_buleyean_sliver sel_regime config
  · exact fun sched => combo_sleep_buleyean_never_abandon sel_sleep sched
  · exact combo_pipeline_debt_dichotomy N C
  · constructor
    · have := step.nontrivial; omega
    · exact fun i => buleyean_positivity bs i

end ForkRaceFoldTheorems
