# Chapter 17 Sleep-Debt Homology Note

- Parent README: [README.md](./README.md)
- Manuscript source: [ch17-arxiv-manuscript.md](./ch17-arxiv-manuscript.md)
- Closure todo: [ch17-closure-todo.md](./ch17-closure-todo.md)
- Gap checklist: [ch17-gap-closure-checklist.md](./ch17-gap-closure-checklist.md)
- Formal ledger: [companion-tests/formal/THEOREM_LEDGER.md](./companion-tests/formal/THEOREM_LEDGER.md)
- Calibration sources: [ch17-sleep-debt-calibration-sources.md](./ch17-sleep-debt-calibration-sources.md)
- State-space bridge: [ch17-sleep-debt-state-space-bridge.md](./ch17-sleep-debt-state-space-bridge.md)
- Bounded witness artifact: [companion-tests/artifacts/sleep-debt-bounded-witness.md](./companion-tests/artifacts/sleep-debt-bounded-witness.md)
- TLA+ model: [companion-tests/formal/SleepDebt.tla](./companion-tests/formal/SleepDebt.tla)
- Lean model: [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean)

This note packages the proposed sleep-debt mapping into a publication-ready boundary statement before any broad manuscript claim. It is intentionally narrower than the raw intuition. The goal is to preserve the strong part of the idea without claiming more than the current theorem surface actually proves.

## Current Status

The sleep-debt mapping is not yet a Grade A correspondence in the sense used by [Chapter 20](./ch20-algorithmic-naturalism.md). It is currently best described as a bounded theorem-indexed structural homology with an executable witness and a clear upgrade path.

- Current grade: high Grade B structural homology with a bounded mechanized witness.
- Not yet justified: Grade A quantitative correspondence.
- Current floor: `THM-SLEEP-DEBT`, `THM-SLEEP-SCHEDULE-THRESHOLD`, and `THM-SLEEP-WEIGHTED-THRESHOLD` now exist as bounded TLA+ models, matching Lean theorem families, and executable artifact witnesses.
- Blocking gap: no completed biological calibration layer, no predeclared external dataset selection, and no empirical identification of the abstract state variables with human observables; see [ch17-sleep-debt-calibration-sources.md](./ch17-sleep-debt-calibration-sources.md) and [ch17-sleep-debt-state-space-bridge.md](./ch17-sleep-debt-state-space-bridge.md).

## What Already Maps Cleanly

Several pieces of the existing formal ledger support the sleep-debt picture directly, and the new bounded `THM-SLEEP-DEBT` surface packages the minimum abstract recovery/debt witness explicitly.

- `THM-FAIL-TRILEMMA`: a nontrivial fork cannot collapse to a deterministic single-survivor state for free; some cost must be paid in vent or repair debt.
- `THM-FAIL-MINCOST`: deterministic collapse has a minimum cost floor of `initialLive - 1`, so unpaid collapse cost cannot simply disappear.
- `THM-FAIL-FAMILIES`: contagious failure forces positive repair debt and breaks fold faithfulness on surviving branches.
- `THM-S7-WARM-DYN`: under bounded creep and sufficient cooling strength, a dynamic controller can return to a laminar state after a turbulent interval.

Those are already enough to support the narrow publication claim:

> Wakefulness can be modeled as a burden-injecting interval that widens or sustains a live frontier, while sleep can be modeled as a periodic recovery operator that pays accumulated collapse cost through a mix of selective consolidation, vented waste clearance, and residual repair. Truncated recovery leaves positive repair debt, lowering the next cycle's effective service capacity and raising the risk of contagious failure.

That statement is theorem-indexed and honest. It does not yet require pretending the biology has already been formalized exactly.

## What Must Not Be Claimed Yet

The following stronger sentences are not supported by the current formal package and should not appear in the paper without new proof or evidence work.

- "Sleep is exactly `THM-FAIL-MINCOST`."
- "Sleep is literally winner-take-all fold."
- "Adenosine is exactly `Q_vent`."
- "Sleep debt is already proved to be topological repair debt in the human brain."
- "Three days of sleep loss realizes the contagious-failure theorem" without an explicit bounded biological witness.

The theorem package currently governs an abstract bounded recovery system. It still does not define a validated human biological state space or a mechanized mapping from synaptic load, adenosine burden, or cognitive lapse behavior onto those abstract variables.

## Publication-Ready Version

If this is written up before new proofs land, the correct publication-ready claim is:

> The sleep-debt picture is a theorem-indexed biological homology for the paid-collapse geometry of fork/race/fold systems. The existing no-free-collapse, minimum-cost, contagious-failure, and dynamic-cooling theorems predict that a system which repeatedly defers recovery should carry residual repair debt, reduced future service capacity, and increased risk of spontaneous local venting. Sleep is therefore a plausible biological realization of the same recovery geometry, but not yet a mechanized identity claim.

That wording is strong enough to be interesting and narrow enough to survive review.

## Current Bounded Surface

The minimal bounded proof package now exists and is the right floor for any future manuscript sentence.

- Ledger rows: `THM-SLEEP-DEBT`, `THM-SLEEP-SCHEDULE-THRESHOLD`, and `THM-SLEEP-WEIGHTED-THRESHOLD` in [companion-tests/formal/THEOREM_LEDGER.md](./companion-tests/formal/THEOREM_LEDGER.md)
- TLA+ transition system: [companion-tests/formal/SleepDebt.tla](./companion-tests/formal/SleepDebt.tla) with [companion-tests/formal/SleepDebt.cfg](./companion-tests/formal/SleepDebt.cfg)
- Lean theorem surface: [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean)
- Executable artifact: [companion-tests/artifacts/sleep-debt-bounded-witness.md](./companion-tests/artifacts/sleep-debt-bounded-witness.md) and [companion-tests/artifacts/sleep-debt-bounded-witness.json](./companion-tests/artifacts/sleep-debt-bounded-witness.json)
- Coarse repeated-cycle threshold surface: [companion-tests/formal/SleepDebtScheduleThreshold.tla](./companion-tests/formal/SleepDebtScheduleThreshold.tla), [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtSchedule.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtSchedule.lean), and [companion-tests/artifacts/sleep-debt-schedule-threshold-witness.md](./companion-tests/artifacts/sleep-debt-schedule-threshold-witness.md)
- Weighted repeated-cycle threshold surface: [companion-tests/formal/SleepDebtWeightedThreshold.tla](./companion-tests/formal/SleepDebtWeightedThreshold.tla), [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtWeightedSchedule.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtWeightedSchedule.lean), and [companion-tests/artifacts/sleep-debt-weighted-threshold-witness.md](./companion-tests/artifacts/sleep-debt-weighted-threshold-witness.md)

In that bounded surface, incomplete recovery leaves positive residual debt and lower next-cycle capacity, full recovery restores the laminar baseline, debt at or above threshold admits intrusion-style local venting, the coarse repeated-cycle schedule witness separates debt-free subcritical/critical schedules from linearly growing supercritical schedules, and the weighted bridge now integerizes the literature-side `20.2 h` boundary directly. That is the current publication-ready claim.

## Required Upgrade Path

To promote this from publication-ready note to manuscript-grade evidence, the next package should have three pieces.

### Data

Collect or assemble a bounded sleep-restriction dataset with observables that can be aligned to the ledger variables.

- wake burden proxy: cumulative wake time, task load, or homeostatic pressure proxy
- vent proxy: sleep opportunity and clearance interval
- repair-debt proxy: residual performance deficit after partial recovery
- service-capacity proxy: next-day throughput, lapse rate, or reaction-time degradation
- contagious-failure proxy: microsleeps, intrusions, or abrupt local cognitive lapses

The data target is not "prove all of sleep." It is to show that incomplete recovery predicts residual debt and next-cycle capacity loss in the direction the theorem family expects.

### TLA+

Extend the current bounded transition model in [companion-tests/formal/SleepDebt.tla](./companion-tests/formal/SleepDebt.tla) so the abstract recovery variables are tied to a biologically motivated observable layer.

- `wakePressure`
- `branchLoad`
- `ventedWaste`
- `repairDebt`
- `serviceCapacity`
- `intrusionCount`

The first model-checking targets should be:

- incomplete recovery leaves nonzero debt
- repeated truncated recovery lowers effective service capacity
- sufficient full recovery returns the system to baseline under fairness
- beyond a burden threshold, intrusion-style local venting becomes reachable

### Lean

Extend the current bounded constructive surface in [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean) so the same recovery/debt claims are carried through a richer biologically interpreted state space.

- interrupted recovery cannot erase the collapse-cost floor
- residual debt after partial recovery lowers the next-step capacity bound
- repeated debt accumulation reaches a contagious boundary in the bounded witness family
- a full-recovery witness attains a zero-debt laminar return

This should be treated as a new theorem family, not as an informal restatement of the failure theorems.

## Promotion Rule For The Paper

This note can move from a narrow bounded manuscript mention to a substantive evidence-backed correspondence claim once all three are true.

- A bounded biological state model exists in TLA+ and has executable witnesses.
- A matching Lean bounded theorem surface proves the recovery/debt statements actually used in the prose.
- A reproducible data artifact shows the predicted residual-debt and capacity-loss direction on a predeclared sleep-restriction surface.

Until then, the note belongs primarily in the Chapter 17 companion and closure surfaces, with only narrow bounded-language references permitted in the manuscript body.

## Minimal Honest Abstract

If the idea needs to be described in one paragraph before the proof package exists, use this:

> Sleep debt is a promising biological homology for the paid-collapse geometry developed in Chapter 17. The current theorem ledger already proves that deterministic collapse cannot be free, that unfinished collapse leaves a minimum unpaid cost, that contagious failure carries repair debt, and that bounded cooling can restore a laminar regime under sufficient recovery conditions. A bounded companion package now mirrors that prediction directly: truncated recovery leaves residual debt, reduces future service capacity, and can admit intrusion-style local venting once debt crosses threshold. What remains open is the biological instantiation itself: calibrated observables, external sleep-restriction data, and a stronger empirical bridge from the abstract recovery variables to human sleep biology.
