# Campbell's Hero's Journey in Aeon Terms

- Parent README: [README.md](./README.md)
- Repo proof index: [FORMAL_LEDGER.md](https://github.com/forkjoin-ai/gnosis/blob/main/FORMAL_LEDGER.md)
- Canonical theorem ledger: [THEOREM_LEDGER.md](./ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/THEOREM_LEDGER.md)

This note is a documentation-layer formalization of Campbell's Hero's Journey
through Aeon's existing theorem vocabulary. It does not claim a new mechanized
theorem. It packages the monomyth as a reusable schema over already-mechanized
surfaces: semiotic deficit, void walking, failure cost, philosophical ascent,
negotiation/context, and AFFECTIVELY's void-walker personality axes.

## Honest Boundary

- This note uses Campbell's stable macro-arc: departure, initiation, return.
- It also uses the common named beats that survive most compressions:
  ordinary world, call, refusal, mentor, threshold, trials, ordeal, reward,
  road back, resurrection, return.
- It does not claim that every literary symbol in Campbell is already
  mechanized in Lean or TLA+.
- What is formalized here is the topology of the journey: deficit, branching,
  rejection history, collapse cost, convergence, and transformed return.

## Dictionary

| Campbell beat | Aeon object | Formal reading | Existing support |
|---|---|---|---|
| Ordinary world | `SemioticChannel`, `PlatosCave` | The hero begins inside a lossy projection of reality; what they can articulate is lower-dimensional than what exists. | `THM-CAVE-DEFICIT`, `THM-CAVE-ALWAYS-LOSES` |
| Call to adventure | nontrivial `FoldStep`, positive sliver | A real fork opens: more than one live path exists, and none start at zero weight. | `THM-CLINAMEN`, Buleyean positivity surfaces, `FoldStep.nontrivial` |
| Refusal of the call | one-stream persistence under positive deficit | Refusal is not neutrality. It is remaining in the cave while the deficit stays positive. | `THM-DIVIDED-LINE-NO-SHORTCUTS`, `THM-CAVE-IRREVERSIBLE` |
| Mentor / supernatural aid | `sharedContext`, community cover | Aid imports context, lowers effective deficit, and makes better folds legible without removing agency. | `THM-CONTEXT-REDUCES-DEFICIT`, `THM-NEGOTIATION-CONVERGENCE`, community-dominance surfaces |
| Crossing the first threshold | first irreversible fold | The journey becomes lived rather than imagined: one branch is enacted, the losers become structured void. | `THM-BATNA-IS-VOID`, `THM-VOID-BOUNDARY-MEASURABLE` |
| Road of trials | `List FoldStep`, `NegotiationRound`, `VoidGradient` | Each failed attempt increases the void boundary; the boundary becomes the sufficient statistic for the next move. | `THM-VOID-GRADIENT`, `THM-VOID-REGRET-BOUND`, `THM-VOID-COHERENCE` |
| Allies / enemies | correlated and conflicting branches | Other agents are not decoration; they are topology. They change the rejection landscape and therefore the complement distribution. | void-tunnel, negotiation-coherence, and community-dominance surfaces |
| Approach to the inmost cave | bounded ascent | The hero gets closer by shrinking the remaining gap, not by teleporting. | `THM-CAVE-TO-GOOD`, `THM-ASCENT-PRODUCTIVE`, `THM-PHILOSOPHICAL-JOURNEY` |
| Ordeal / abyss | paid deterministic collapse | A real transformation cannot be free. If the old frontier collapses to a single survivor, some vent or repair debt must be paid. | `THM-FAIL-TRILEMMA`, `THM-FAIL-COMPOSITION`, `THM-FAIL-MINCOST` |
| Reward / boon | stable settlement, recovered structure | The boon is not "winning." It is a new low-deficit operating point plus reusable negative knowledge about what fails. | `THM-NEGOTIATION-CONVERGENCE`, `THM-BATNA-SUFFICIENT-STATISTIC` |
| Return / resurrection | transformed re-entry into home channel | The hero comes back able to preserve interval while changing classification, so the community sees the old world through a new frame. | `empathy_preserves_interval`, `therapy_improves_settlement` in `NegotiationEquilibrium.lean` |
| Return with the elixir | exported context | The final gift is not private insight but shared context that lowers deficit for the next round of collective life. | `THM-CONTEXT-REDUCES-DEFICIT`, `THM-NEGOTIATION-COHERENCE` |

## Schema

The monomyth can be written as a bounded fork/race/fold trajectory:

```text
H = (home, guide, trials, ordeal, ascent, return)
```

with the following interpretation:

- `home` is a semiotically lossy channel, so `0 < semioticDeficit(home)`.
- `guide` is added context or community support that reduces effective
  deficit without deciding for the hero.
- `trials` is a nonempty list of nontrivial folds. Each trial contributes at
  least one unit to the void boundary.
- `ordeal` is the distinguished collapse event where the hero cannot keep the
  old frontier and the new identity at zero cost.
- `ascent` is a bounded and productive approach to a fixed point rather than an
  infinite regress.
- `return` is a push back into the original social channel, now carrying
  reusable structure.

## Heroic Journey Theorem (Schema)

Given a journey `H` with the components above, the following package is the
formal Aeon reading of Campbell:

```text
HeroicJourney(H) :=
  0 < semioticDeficit(H.home)
  /\ monotone(voidBoundary(H.trials))
  /\ paidCollapse(H.ordeal)
  /\ boundedVirtue(H.ascent)
  /\ finiteTermination(H.ascent)
  /\ exportedContext(H.return)
```

Expanded into the existing theorem surface:

1. Departure is real.
   The hero does not leave a complete world; they leave a projected one.
   Positive deficit is the mathematical content of "there is more here than the
   current frame can see."

2. Initiation is informative.
   The trials are not random suffering. They monotonically write structure into
   the void boundary, and that boundary becomes the sufficient statistic for
   better next moves.

3. Ordeal is costly.
   Campbell's death-and-rebirth beat becomes a no-free-collapse law. If one
   identity dies and a transformed survivor emerges, the transition pays vent
   or repair debt. There is no free resurrection.

4. Transformation is finite and bounded.
   The hero does not wander forever. The ascent is productive, virtue is
   bounded, and the chain terminates at a fixed point.

5. Return is social, not merely private.
   The boon is exported as context. The return matters because it lowers
   future deficit for the community, not because the hero had a vivid internal
   state.

## AFFECTIVELY Projection

Aeon's five-parameter void walker gives the journey an AFFECTIVELY-native
projection:

| Beat | Personality axis | Reading |
|---|---|---|
| Call / departure | `try_` | Aperture widens enough for another branch to become visible. |
| Threshold / decision | `choose` | Selection sharpens; the hero stops treating all branches as equal. |
| Ordeal | `commit` | The chosen branch becomes costly and sticky rather than hypothetical. |
| Death / rebirth | `letGo` | Old rejection structure is metabolized instead of endlessly ruminated. |
| Return with boon | `learn` | The journey reshapes priors; the world is re-entered with a different update rule. |

In this projection, a successful journey is not "zero pain." It is a trajectory
whose integrated profile is closer to the golden-ratio attractor after the
journey than before it. The ordeal can spike local deficit while still reducing
mean deficit after integration.

## Working Compression

The cleanest one-line compression is:

> Campbell's Hero's Journey is a finite, paid, context-assisted void walk from
> positive semiotic deficit to a lower-deficit return channel.

That sentence stays honest about what Aeon actually formalizes:

- not mythic symbolism as such,
- but the topology of leaving, failing, narrowing, integrating, and returning.
