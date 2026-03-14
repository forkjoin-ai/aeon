# Chapter 17 Sleep-Debt State-Space Bridge

- Parent README: [README.md](./README.md)
- Sleep-debt homology note: [ch17-sleep-debt-homology-note.md](./ch17-sleep-debt-homology-note.md)
- Calibration sources: [ch17-sleep-debt-calibration-sources.md](./ch17-sleep-debt-calibration-sources.md)
- Closure todo: [ch17-closure-todo.md](./ch17-closure-todo.md)
- Gap checklist: [ch17-gap-closure-checklist.md](./ch17-gap-closure-checklist.md)

This note turns the McCauley/Van Dongen fatigue model into a disciplined bridge target for the Chapter 17 sleep-debt package. The goal is not to claim that the current bounded `THM-SLEEP-DEBT` witness already equals the biomathematical fatigue literature. The goal is to name the exact state variables, equations, and theorem targets required to connect them.

## Verified Literature Basis

- McCauley et al., 2008/2009, [J Theor Biol](https://pubmed.ncbi.nlm.nih.gov/18938181/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2657297/): introduces the coupled non-homogeneous first-order ODE model class and the bifurcation story for chronic sleep restriction.
- McCauley et al., 2013, [Sleep](https://pubmed.ncbi.nlm.nih.gov/24293775/), [PDF](https://www.cceb.upenn.edu/uep/assets/user-content/documents/McCaulyetal.2013.pdf): reformulates the model with dynamic circadian modulation and keeps the state variables continuous across wake/sleep transitions.
- McCauley et al., 2024, [J Theor Biol](https://pubmed.ncbi.nlm.nih.gov/38782198/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11179995/): extends the framework to sleep inertia and ties the state interpretation more explicitly to adenosinergic ideas and PVT/KSS calibration.

## Empirical State Semantics

The core bridge target is not a generic fatigue percentage. It is a state-space model calibrated against neurobehavioral performance.

- `p(t)`: primary impairment state. In the published calibration program, this is the state that maps to predicted PVT lapse burden rather than to an abstract fatigue score.
- `u(t)`: slower allostatic state. This is the best current literature-side analog to carried recovery debt or shifted homeostatic baseline across repeated restriction.
- `g(t)`: bounded non-homogeneous forcing term driven primarily by circadian modulation and, in the later formulation, a dynamic circadian-amplitude envelope.

That distinction matters for Chapter 17:

- our current bounded `serviceCapacity` is not `p(t)` itself; it is a coarse bounded performance-capacity score.
- our current bounded `repairDebt` is not yet the literature's `u(t)`; it is a theorem-side residual-debt variable that still needs calibration.
- our current bounded `intrusionCount` is not yet a published model state; it is an executable proxy for local lapse/intrusion risk once debt crosses threshold.

## Verified ODE Form

The 2013 reformulation gives the cleanest bridge target. During wakefulness:

\[
\frac{dp}{dt} = \alpha_w p(t) + \beta_w u(t) + g_w(t)
\]

\[
\frac{du}{dt} = \eta_w u(t)
\]

During sleep:

\[
\frac{dp}{dt} = \alpha_s p(t) + \beta_s u(t) + g_s(t)
\]

\[
\frac{du}{dt} = \eta_s \bigl(u(t) + 1\bigr)
\]

The later paper also treats `g_w(t)` and `g_s(t)` as bounded non-homogeneous forcing terms derived from circadian structure, with a skewed five-harmonic circadian base `c(t)` and dynamic amplitude modulation in the 2013 update.

This is the disciplined place to be careful: the simplified story "wake uses one linear ODE, sleep uses another" is right, but the verified published form is not exactly the same as the shorthand `du/dt = \gamma_s u(t)`. The sleep equation for `u` includes the shifted term `u + 1`, and the circadian forcing terms are more structured than a single unqualified oscillator.

## Critical Threshold

The 2013 paper retains the earlier bifurcation result in terms of the scheduled wake fraction:

\[
A_c = \frac{W_c}{T} = \frac{\eta_s}{\eta_s - \eta_w}
\]

For day length `T = 24 h`, the published threshold is:

\[
W_c = 20.2 \text{ h}
\]

So the literature-side interpretation is:

- if scheduled wake duration stays below the threshold, the impairment dynamics can approach a stable asymptotic regime;
- if scheduled wake duration exceeds the threshold, the model predicts divergence of impairment rather than bounded stabilization.

For Chapter 17, this is the right mathematical analog of the "bounded recovery versus escalating debt" boundary.

## Bridge To Chapter 17 Variables

The most defensible current mapping is:

| Chapter 17 variable | McCauley variable | Bridge interpretation | Boundary |
| --- | --- | --- | --- |
| `repairDebt` | `u(t)` or a monotone residual of `u(t)` relative to recovered baseline | slow carried allostatic burden across repeated restriction and incomplete recovery | not yet calibrated numerically in the companion package |
| `serviceCapacity` | inverse or monotone transform of `p(t)` | more impairment means lower effective next-cycle capacity | the current bounded theorem family uses a coarse capacity score, not raw PVT lapse count |
| `wakePressure` | schedule phase + wake history input to the ODE regime | selects the wake dynamics and feeds the rising burden regime | still abstract in the current TLA+ witness |
| `intrusionCount` | high-lapse or microsleep-like observable derived from large `p(t)` states | operational proxy for spontaneous local venting during degraded wake performance | not a first-class McCauley state variable in the published ODEs |
| `ventedWaste` | sleep opportunity / recovery interval entering the sleep regime | time spent in the recovery dynamics that can reduce the carried burden | not a direct biochemical clearance measurement |

The right lesson is: `u(t)` is the closest literature-side object to carried debt, while `p(t)` is the closest literature-side object to measurable behavioral impairment.

## Bounded Formalization Path

The next formal layer should not jump directly from `SleepDebt.tla` to the full continuous ODE system. It should pass through a bounded hybrid approximation.

### State

\[
x_k = \bigl(p_k, u_k, \phi_k, m_k\bigr)
\]

where:

- `p_k` is a bounded discretized impairment state,
- `u_k` is a bounded discretized allostatic state,
- `\phi_k` is a wake/sleep mode bit,
- `m_k` is a bounded circadian phase index or forcing bucket.

### Update

Use an explicit discretization of the literature ODEs over a fixed step `\Delta t`, with separate wake and sleep update laws. The circadian forcing can begin as a bounded lookup table rather than a continuous harmonic evaluation.

### Exported observables

- predicted PVT-lapse bucket or performance bucket from `p_k`,
- carried-debt bucket from `u_k`,
- intrusion-risk flag from high `p_k` or high `(p_k, u_k)` regions,
- recovery completion flag from return to a baseline neighborhood.

## Immediate Theorem Targets

The first new theorem family should be narrower than the full literature model.

- The coarse discrete schedule-threshold analog now exists as `THM-SLEEP-SCHEDULE-THRESHOLD` in [companion-tests/formal/THEOREM_LEDGER.md](./companion-tests/formal/THEOREM_LEDGER.md), with [companion-tests/formal/SleepDebtScheduleThreshold.tla](./companion-tests/formal/SleepDebtScheduleThreshold.tla), [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtSchedule.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtSchedule.lean), and [companion-tests/artifacts/sleep-debt-schedule-threshold-witness.md](./companion-tests/artifacts/sleep-debt-schedule-threshold-witness.md). That surface is deliberately coarse: fixed repeated-cycle schedules, fixed quota, and a linear surplus law rather than the full continuous ODE system.
- A closer literature-side analog now exists as `THM-SLEEP-WEIGHTED-THRESHOLD`, with [companion-tests/formal/SleepDebtWeightedThreshold.tla](./companion-tests/formal/SleepDebtWeightedThreshold.tla), [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtWeightedSchedule.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtWeightedSchedule.lean), and [companion-tests/artifacts/sleep-debt-weighted-threshold-witness.md](./companion-tests/artifacts/sleep-debt-weighted-threshold-witness.md). That bridge is still bounded and discrete, but it encodes the literature-side `W_c = 20.2 h` threshold exactly in tenths rather than replacing it with a unit-rate quota surrogate.
- If the bounded schedule stays below the discretized critical threshold, the system admits a bounded recurrent regime.
- If repeated wake intervals exceed the discretized critical threshold, the impairment state cannot return to the baseline neighborhood without sufficient recovery steps.
- Partial recovery leaves a positive residual in the bounded `u`-state and lowers the next-cycle performance bucket derived from `p`.
- A full-recovery witness returns both `p` and `u` to the chosen laminar neighborhood.

These are the right theorem targets because they preserve the qualitative structure of the literature without pretending the continuous calibration problem is already solved.

## Documentation Boundary

The current companion package can now truthfully say:

- a bounded recovery/debt theorem family exists;
- a coarse repeated-cycle threshold analog already exists as a separate bounded theorem family;
- a weighted repeated-cycle threshold bridge now exists as a closer literature-side analog for the `20.2 h` critical wake boundary;
- there is a verified literature-side state-space bridge to PVT-calibrated fatigue dynamics;
- and the remaining gap is quantitative calibration plus external dataset selection, not lack of a mathematical target.

What it still cannot say:

- that the current TLA+/Lean witness is already the McCauley model,
- that `repairDebt = u(t)` as an identity,
- or that the current bounded intrusion proxy is already a validated microsleep model.
