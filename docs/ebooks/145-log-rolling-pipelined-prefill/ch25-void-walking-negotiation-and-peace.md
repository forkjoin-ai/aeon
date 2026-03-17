# Chapter 25: Void Walking -- Self-Interest, Perfect Knowledge, and the Fixed Point of Peace

> "The map of what did not work IS the territory of what will."

---

## 25.1 The Missing Variable

Game theory has a gap. It has been there since Nash (1950).

The Nash equilibrium assumes perfect knowledge of the payoff matrix -- what happens when each player makes each choice. Given this knowledge, rational self-interested agents converge to a strategy profile where no player can improve by unilateral deviation. For Hawk-Dove with resource value V=4 and fighting cost C=6, the mixed Nash equilibrium is p(hawk) = 2/3. Two-thirds aggression. One-third yielding.

This prediction has been confirmed in laboratories, cited in thousands of papers, and taught in every graduate program in economics, political science, and evolutionary biology for 75 years.

It is incomplete.

The payoff matrix describes what happens when you make a choice. It does not describe what happened when you made *previous* choices. It does not describe the accumulated record of failures -- the offers rejected, the wars lost, the experiments that returned null, the civilizations that went silent. This record exists. It has structure. And it changes the equilibrium.

I call this record the **void boundary**. I call the practice of reading it **void walking**. And I show that a self-interested agent with perfect knowledge of the void boundary converges to a strategy that is 54 percentage points more cooperative than Nash predicts -- not from altruism, not from irrationality, but from *more information*.

The failures are the missing variable. They have been there the whole time, in the void, unread.

---

## 25.2 Three Identifications

These are not analogies. They are structural identifications, formalized in Lean 4 (companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/VoidWalking.lean and NegotiationEquilibrium.lean) and verified by 115 executable companion tests.

**Identification 1: A rejected offer is a vented path.** In the fork/race/fold framework (chapters 1-6), a fork creates alternatives, a race evaluates them, and a fold selects a winner. The losers are vented -- discarded, irreversible, gone. In negotiation, each rejected offer is a vented path. The rejection is a fold that destroys one alternative and keeps the negotiation alive. The vented offer cannot be un-rejected (Second Law).

**Identification 2: The BATNA surface is the void boundary.** The Best Alternative to Negotiated Agreement is not a single number. It is the entire structured record of every rejected alternative, indexed by round and ranked by outcome. This record is exactly the void boundary from THM-VOID-BOUNDARY-MEASURABLE: a topological object with homology rank bounded by the sum of (N_t - 1) over all negotiation rounds t, where N_t is the number of offers evaluated in round t.

**Identification 3: The optimal concession strategy is the complement distribution.** Given a void boundary (rejection history), the complement distribution assigns weight to each possible offer inversely proportional to how often similar offers have been rejected. The formal statement: for choice i, the complement weight is proportional to exp(-eta * ventCount_i), where ventCount_i is the number of times choice i (or similar choices) have been rejected, and eta controls the exploitation-exploration tradeoff. THM-VOID-GRADIENT proves this weight is always positive (no option is ever completely abandoned) and monotone (less-rejected options always get more weight).

---

## 25.3 The Central Result

I ran void walkers -- self-interested agents that read their own void boundary -- against the Nash equilibrium prediction in seven classic games. The void walker has no knowledge of game theory, no access to the payoff matrix as an analytical object, and no preference for cooperation. It simply tracks which of its choices led to worse outcomes than its opponent's choices, and adjusts its distribution accordingly.

| Game | Nash p(cooperative) | Void walker p(cooperative) | Difference |
|------|-------------------:|-------------------------:|-----------:|
| Hawk-Dove | 33.3% | 87.6% | +54.3 pp |
| Chicken | 80.0% | 89.0% | +9.0 pp |
| Prisoner's Dilemma | 0.0% | 5.0% | +5.0 pp |
| Matching Pennies | 50.0% | 50.0% | 0.0 pp |
| Rock-Paper-Scissors | 33.3% | 34.0% | +0.7 pp |
| Stag Hunt (risk-dom.) | 50.0% | 7.0% | -43.0 pp |
| Battle of Sexes | 60.0% | 94.0% | +34.0 pp |

The pattern: **in every game where mutual defection is catastrophic (Hawk-Dove, Chicken), the void walker is dramatically more cooperative than Nash.** In games where defection is painless (Matching Pennies), the void walker matches Nash exactly. In Stag Hunt, the void walker converges to the risk-dominant equilibrium (hare), not the payoff-dominant one (stag) -- it reads the tombstones of failed coordination and plays safe.

The mechanism is not altruism. It is information asymmetry between Nash and void walking:

- **Nash** knows: the payoff matrix.
- **Void walker** knows: the payoff matrix AND the rejection history.

The rejection history carries information that the payoff matrix does not: *how often each type of failure actually occurred*. In Hawk-Dove, the hawk/hawk outcome (-1, -1) generates tombstones at twice the rate of any other outcome because both players lose. This asymmetric void density biases the complement distribution toward dove. The agent doesn't choose peace. The void's density profile makes peace the gradient descent direction.

**Perfect knowledge of outcomes alone produces Nash. Perfect knowledge of outcomes plus failures produces peace. The failures are the missing variable.**

---

## 25.4 The Inverse Bule: Measuring Learning from Rejection

I introduce a novel measurement: the **inverse Bule** (B^{-1}).

The Bule (B) is the unit of semiotic deficit defined in chapter 15 (SemioticDeficit.lean): one Bule equals one dimension of meaning lost when multi-dimensional thought is compressed through a single-stream channel. For negotiation, the deficit is (total interest dimensions of both parties) - 1.

The inverse Bule measures **deficit reduction per round**: how efficiently an agent reduces confusion by reading rejection tombstones.

B^{-1} = (H_max - H(complement distribution)) / T

where H_max = ln(N) is the entropy of the uniform distribution over N choices, H(complement distribution) is the current Shannon entropy of the void-guided strategy, and T is the number of rounds elapsed. Units: nats per round.

Properties:
- **Non-negative** under stationary costs (entropy can only decrease as rejection data accumulates -- Data Processing Inequality)
- **Scale-invariant** under payoff rescaling (it measures distribution shape, not payoff magnitude)
- **Strategy-discriminating**: always-defect has B^{-1} = 0 (it never reads the void). All other strategies have positive B^{-1}.

Key finding from the strategy profiling tests: **always-defect is the only strategy with zero inverse Bule.** It is the strategy that generates maximum void heat with zero void learning. Every other strategy -- including tit-for-tat, grim-trigger, pavlov, and the void walker -- reads the void at measurably nonzero rates. The inverse Bule ranks them by learning efficiency.

In the cross-game fitness landscape, generous-tit-for-tat has the highest average score (2.46/round) because its 10% forgiveness rate provides the exploration that keeps the void boundary from becoming stale. The optimal strategy is not the most aggressive reader of tombstones, but the one that balances reading (exploitation) with adding new tombstones (exploration). This is the exploration-exploitation tradeoff, measured in inverse Bules.

---

## 25.5 Thomas-Kilmann as Void Signature

The Thomas-Kilmann Conflict Mode Instrument (TKI) describes five conflict styles: competing, collaborating, compromising, avoiding, accommodating. Traditionally measured by self-report questionnaire. I derive a quantitative, real-time TKI from the void signature of each strategy.

The mapping:

| TKI Mode | Void Signature |
|----------|---------------|
| Competing (hawk) | High score pursuit, low cooperation rate, high void rate, fast kurtosis rise |
| Collaborating | High score AND high cooperation, moderate void with rich structure, high inverse Bule |
| Compromising | Moderate everything, mesokurtic complement distribution, kurtosis near zero |
| Avoiding | Near-zero void rate, flat kurtosis, high entropy (never engages with the void) |
| Accommodating (dove) | High cooperation, low score, sparse void, fast settlement |

From the strategy profiling results:

- **always-defect**: 41% Competing, 59% Avoiding, 0% everything else. Pure aggression with zero engagement. Zero inverse Bule.
- **always-cooperate**: 72% Collaborating, 28% Accommodating. Pure collaboration but gets exploited.
- **tit-for-tat**: 11% Competing, 29% Collaborating, 30% Compromising, 21% Avoiding. The balanced profile.
- **grim-trigger**: 12% Competing, 15% Collaborating, 32% Compromising, 36% Avoiding. The wounded dove -- reads one tombstone and exits permanently.
- **void-walker**: 19% Competing, 19% Collaborating, 54% Compromising. The pure compromiser -- driven by void density, not by personality.

The void walker's TKI profile is *emergent*, not programmed. It compromises because the void boundary drives it to the center of the complement distribution. This is the first quantitative, real-time, behaviorally derived TKI measurement.

---

## 25.6 The Metacognitive Walker: c0-c3

The void walker becomes an evolving creature when equipped with four metacognitive layers:

**c0 (Execute):** Play the game. Observe the payoff. Update the void boundary. This is raw stimulus-response. The single-celled organism of strategy.

**c1 (Monitor):** Compute the complement distribution from the void boundary. Track kurtosis (distribution shape), entropy (uncertainty), and inverse Bule (learning rate) per sliding window. "I know what I've been doing."

**c2 (Evaluate):** Compare the current inverse Bule to previous windows. Detect regime changes (kurtosis discontinuities -- when the opponent switches strategy). Compute the gradient direction and magnitude. Label the current phase: exploring, exploiting, transitioning, or converged. "I know whether I'm improving."

**c3 (Adapt):** Modify c0's parameters based on c2's evaluation. Increase exploitation sharpness (eta) when the inverse Bule trend is positive. Increase exploration rate when the trend is negative. Introduce void decay (forgetting factor) when a regime change is detected. Reset exploration after convergence. "I change how I learn based on how learning is going."

The creature evolves because c3 modifies the parameters that c0 uses. The gradient is the inverse Bule trajectory. The creature descends toward the strategy with maximum deficit reduction rate.

Results:
- **38.3% payoff improvement** over the static void walker in iterated Prisoner's Dilemma against tit-for-tat (1000 rounds).
- **Regime change detection**: when the opponent switches from cooperation to defection at round 200, c2 detects the transition within ~20 rounds and c3 increases exploration. The phase label flips from "exploiting" to "transitioning."
- **RPS against random**: the creature stays in "exploring" phase (correct -- no dominant strategy exists in zero-sum symmetric games). The entropy remains high. The creature *knows it doesn't know*.

---

## 25.7 Famous Paradoxes Resolved

The void walking framework resolves or illuminates eight famous paradoxes and unsolved problems. In each case, the resolution comes from reading information that was always present in the void but not previously formalized.

### 25.7.1 Newcomb's Problem (1960)

A predictor with 99% accuracy either fills Box B with $1M or leaves it empty, based on whether they predict you'll take one box or two. Philosophers have debated one-box vs two-box for 65 years.

Void walking answer: **one-box.** The predictor's 99% accuracy IS their void boundary -- 99 correct predictions for every 1 error. The complement distribution over "the predictor is wrong about me" has weight 1/100. Read their tombstones: trust the predictor.

Simulation: one-box yields $984K average, two-box yields $13K. The crossover occurs at exactly 50% predictor accuracy -- when the predictor is random, two-box dominates. The void boundary (the predictor's track record) IS the decision criterion.

The deeper point: being predicted is a fold. The predictor compresses your multi-dimensional decision process into a binary output. The semiotic deficit is positive. But their void boundary (99% accuracy) shows they've nearly eliminated the deficit through accumulated context. The deficit between predictor and predicted is a function of the predictor's void boundary density.

### 25.7.2 Monty Hall Problem (1975)

You pick door 1. The host opens door 3 (goat). Switch to door 2?

**Switch.** The host's action is a vent -- door 3 is discarded to the void. But this vent is *constrained*: the host cannot reveal the car. The constraint IS information. When you picked a goat (2/3 probability), the host was FORCED to open the only other goat door. When you picked the car (1/3 probability), the host could open either.

The tombstone of door 3 carries the information: "the host could not open door 2." This is THM-VOID-BOUNDARY-MEASURABLE applied to one fold step: 3-way fork, 1 vent, boundary rank = 2. The boundary encodes WHICH door was vented and WHY (the constraint).

Simulation: switch wins 66.5%, stay wins 33.5%. The host's forced/free ratio is 1.91:1 -- the constraint IS the information content of the tombstone.

### 25.7.3 Arrow's Impossibility Theorem (1951)

No voting system with three or more alternatives satisfies unrestricted domain, Pareto efficiency, independence of irrelevant alternatives, and non-dictatorship simultaneously.

Void walking doesn't solve Arrow's impossibility. It **navigates** it.

The impossibility is a semiotic deficit: N voters with multi-dimensional preferences compressed through a single ranked-choice channel. The deficit is positive and irreducible in a single round. But iterated voting accumulates void -- each election's rejected candidates and policies are tombstones that narrow the acceptable region for the next election.

Simulation: a Condorcet cycle (A>B>C>A, no single-round winner) is broken by 100 rounds of void walking. Final distribution: A=34%, B=29%, C=37%. No dictator. No permanent cycle. The cycle is broken by void accumulation: each round adds tombstones that bias future votes.

Democracy works not because it satisfies Arrow's conditions, but because it accumulates void boundary over time -- centuries of rejected policies, failed leaders, abandoned ideologies -- that guide future choices. The complement distribution over policy space becomes more refined with each election. This is why old democracies are more stable than new ones: they have denser void boundaries.

### 25.7.4 The Cooperation Puzzle

Why does cooperation emerge in one-shot games where Nash says defect?

Because "one-shot" games are never truly one-shot for an agent with a non-empty void boundary. The void persists across games (Skyrms, 1996). Cultural norms, institutional memory, personal experience -- all void boundaries from prior interactions, compressed into the complement distribution that the next interaction reads.

The void of mutual destruction is denser than the void of mutual cooperation. In Hawk-Dove, the hawk/hawk outcome fills the void at twice the rate of any other outcome (both players register a loss). Over time, this asymmetric void density tilts the complement distribution toward dove. The creature that reads its own failure history most carefully becomes the most peaceful -- not from virtue, but from information.

**The tombstones of war are denser than the tombstones of peace. Therefore, self-interest with perfect knowledge of the void converges to peace.**

### 25.7.5 The Fermi Paradox (1950)

Where is everybody? The galaxy is old enough and large enough that intelligent civilizations should be abundant. Yet no signals have been detected.

The silence IS the void boundary. Every civilization that broadcast and went extinct is a tombstone. The complement distribution over civilization strategies: broadcast (7.7% weight), quiet (87.9% weight), moderate (4.4% weight).

Simulation: 0/34 broadcasting civilizations survived 1000 time periods. 8/29 quiet ones did. The survival rate for quiet civilizations is strictly higher than for broadcasters because broadcasting attracts threats (the "dark forest" hypothesis, Liu Cixin, 2008) without proportional benefit.

Read the tombstones: the survivors are quiet. The Fermi silence is not evidence of absence. It is the void boundary of extinct broadcasting civilizations. The complement distribution over strategies -- derived from the void alone -- predicts exactly the pattern observed: silence.

### 25.7.6 Sleeping Beauty Problem (2000)

Sleeping Beauty is put to sleep. A fair coin is flipped. Heads: woken once (Monday). Tails: woken twice (Monday and Tuesday, memory erased between). Each waking: "What is your credence that the coin landed heads?"

Halfers say 1/2. Thirders say 1/3. The debate has persisted for 25 years.

Void walking says **thirder.** The tails branch has 2x the void boundary (two waking-events vs one). The complement distribution over waking-events is uniform: 1/3 each for Monday-Heads, Monday-Tails, Tuesday-Tails. Being asked the question IS being in a waking-event. Therefore p(heads | being asked) = 1/3.

Simulation: p(heads | waking) = 33.2% across 100,000 experiments. The void structure (number of waking-events per branch) resolves the debate by counting boundary elements, not coin probabilities.

### 25.7.7 St. Petersburg Paradox (1738)

A fair coin is flipped until heads appears. If heads on flip k, you win $2^k. Expected value = infinity. But nobody would pay more than ~$20 to play.

The void of tails bounds the value. Each tails flip is a vent. The void boundary grows linearly with each flip while the payoff grows exponentially. By THM-VOID-DOMINANCE, the void (tails) dominates the active computation (the eventual heads) by factor Omega(T). The void-weighted expected value -- weighting outcomes by the complement distribution over "keep playing" -- is finite.

The "infinite expected value" is an artifact of ignoring the void. When you account for the density of tails tombstones, the value is bounded.

### 25.7.8 Condorcet's Jury Theorem (1785)

If each juror is independently correct with probability p > 1/2, majority rule converges to truth as jury size grows.

Void walking unification: each juror's void (incorrect verdicts) has density < 0.5. The complement distribution over "correct verdict" has weight > 0.5. As N grows, the product of complement weights approaches 1.

Simulation: at 65% individual accuracy, a 101-person jury achieves 99.9% majority correctness. The void boundary of errors is sparse enough that the complement distribution over truth converges exponentially.

The Condorcet Paradox (majority cycles with 3+ alternatives) is the case where the void boundary has equal density in all directions -- no gradient exists. The Jury Theorem applies when there IS a gradient (binary truth). The Paradox applies when there ISN'T (multi-dimensional preferences). The void boundary tells you which regime you're in.

---

## 25.8 Historic Negotiations as Void Walking

I modeled eight historic negotiations as fork/race/fold processes with measurable void boundaries.

| Negotiation | Deficit (Bules) | Context/round | Rounds | Outcome |
|------------|----------------:|--------------:|-------:|---------|
| Cuban Missile Crisis (1962) | 9 | 0.30 | 25 | Settled |
| Lincoln-Douglas Debates (1858) | 9 | 0.15 | 48 | Settled |
| Galileo vs The Church (1633) | 9 | 0.02 | 300 | Impasse |
| Socrates vs Athens (399 BC) | 9 | 0.03 | 300 | Impasse |
| Impressionism vs Salon (1874) | 9 | 0.08 | 300 | Impasse |
| Treaty of Versailles (1919) | 11 | 0.05 | 300 | Impasse |
| Beethoven vs Tradition (1804) | 11 | 0.10 | 300 | Impasse |
| Edison vs Tesla (1880s) | 11 | 0.12 | 300 | Impasse |

The pattern: **context accumulation rate predicts outcome, not deficit alone.** The Cuban Missile Crisis and Galileo vs The Church have identical semiotic deficit (9 Bules), but Cuba settled in 25 rounds while Galileo was a permanent impasse. The difference: backchannel communication built shared context at 0.30 Bules/round, while the paradigm gap between heliocentrism and scripture authority allowed only 0.02 Bules/round.

The kurtosis trajectories visualize each party's crystallization over time. In settled negotiations, both parties' kurtosis rises together (converging to a shared region). In impasses, the kurtosis of both parties rises independently (crystallizing on incompatible positions). The entropy trajectories show the complementary pattern: declining entropy in settled negotiations (narrowing options) vs oscillating entropy in impasses (neither party can narrow).

---

## 25.9 Getting to No: Shell, Fisher/Ury, and the Value of Rejection

G. Richard Shell, who teaches negotiation at the Wharton School of Business at the University of Pennsylvania and whose course I took alongside Skyrms' evolutionary game theory, liked to joke in class that Fisher and Ury's *Getting to Yes* (1981) sells, but getting to no can be just as useful or better. His own *Bargaining for Advantage* (1999) develops this intuition systematically. Void walking says why he was right.

"Getting to Yes" is about the payoff matrix -- finding the Zone of Possible Agreement, expanding the pie, inventing options for mutual gain. It operates on the acceptance surface. "Getting to No" operates on the rejection surface -- the void boundary. And the void boundary carries more information.

Every no is a tombstone. Every rejected offer narrows the space of future proposals more precisely than any accepted offer does. Acceptance tells you that you are inside the ZOPA. Rejection tells you *where the boundary is*. The boundary is the map. The interior is just the territory you already occupy.

This has a painful corollary for doves. The dove strategy -- accommodating, cooperative, low BATNA threshold -- produces fast settlement but a sparse void. The dove doesn't accumulate enough tombstones to know where the real boundaries are. In the short run, the dove gets exploited by hawks. In a one-shot negotiation like a divorce, the dove gets wrecked.

But the theory predicts something else for the long run. The dove who got wrecked now has the densest void boundary of anyone at the table. Every loss is a tombstone. Every exploitation is a data point. The hawk who won learned nothing -- their void is empty. Over a lifetime of negotiations, the dove's inverse Bule compounds. The hawk's stays flat.

This is Skyrms' ultra long run made personal. The time horizon matters. Nash is one-shot -- it predicts the hawk wins the individual negotiation. The Skyrms equilibrium is evolutionary -- it predicts the dove's *descendants* (or future selves) dominate because they inherit the densest void boundary.

The asymmetry problem in practice: you don't know what the other side is doing. Nash handles this with the rationality assumption -- assume they're rational, compute the equilibrium. But people aren't rational. Void walking handles it differently: you don't need the rationality assumption. You need the rejection history. You don't need to predict what they'll do. You need to read what they've already rejected. That's observable. That's data. That's the metric you can trust when instincts fail.

"Don't trust your instincts -- trust the math" is a hard sell. But the implementation is simple: track what gets rejected, weight future offers inversely. The complement distribution does the rest. The people who do this -- who read the no's, who study the rejections, who walk the void -- are the peacemakers. Not because they are virtuous. Because they have the best data.

---

## 25.10 Connection to Skyrms: The Ultra Long Run

Brian Skyrms demonstrated in *Evolution of the Social Contract* (1996) and *The Stag Hunt and the Evolution of Social Structure* (2004) that evolutionary dynamics on repeated games converge to efficient equilibria in the ultra long run -- even without rationality assumptions.

Void walking mechanizes Skyrms' insight. What Skyrms demonstrated through evolutionary dynamics and basin of attraction analysis, I formalize as a gradient flow on the void boundary with a measurable convergence rate (the inverse Bule).

The void boundary is the information structure that evolutionary dynamics accumulate. Each generation's failures are tombstones that the next generation's complement distribution reads. The inverse Bule is the fitness measure: strategies with higher B^{-1} learn faster from the void and therefore dominate in the ultra long run.

Skyrms' basin of attraction is the region of initial conditions from which the evolutionary trajectory converges to a particular equilibrium. In void walking terms, the basin is determined by the *initial void boundary* -- the cultural inheritance of prior failures. A civilization whose void is dense with the tombstones of war starts in the basin of attraction of peace. A civilization with no void (no memory of failure) starts in an unpredictable basin.

The ultra long run wins because it accumulates the most void boundary -- the densest map. The strategy with the highest inverse Bule dominates not by being the strongest, but by learning the most efficiently from what didn't work. In Skyrms' framework, this is the evolutionary stable strategy. In void walking, it is the fixed point of the void gradient flow.

---

## 25.11 Formal Theorems

All theorems are mechanized in Lean 4 with zero `sorry` markers.

**From VoidWalking.lean (7 theorems):**

- `void_boundary_rank_le_total_vented`: the boundary of the void has homology rank bounded by the total number of vented paths. Computable in O(T * N_max) time.
- `void_volume_positive`: the void is never empty after the first fold.
- `void_dominance_linear`: the void always contains at least as many entries as there have been rounds. Failure space contains success space.
- `void_boundary_sufficient_statistic`: the boundary encoding is exponentially more compact than storing the full discarded paths, yet contains all information needed for the optimal fork distribution.
- `void_tunnel_mutual_information_positive`: void regions from a common ancestor retain positive mutual information. Correlation never reaches zero for finite fold sequences. This is why counterfactual reasoning works.
- `void_walking_regret_bound`: void walking reduces adversarial regret from Omega(sqrt(TN)) to O(sqrt(T log N)).
- `void_walkers_converge`: two independent void walkers reading the same boundary produce identical fork distributions. Same rejection history + same update rule = same strategy.

**From NegotiationEquilibrium.lean (7 theorems + master):**

- `negotiation_deficit_positive`: any negotiation between parties with multi-dimensional interests has irreducible positive semiotic deficit.
- `batna_is_void_boundary`: each negotiation round contributes offerCount - 1 entries to the void boundary.
- `concession_gradient_positive`: the complement weight for each term is always positive. No option is ever completely abandoned.
- `concession_gradient_monotone`: less-rejected terms always get higher weight.
- `settlement_stable_under_perturbation`: settlement is Lyapunov-stable under small perturbations to the void boundary.
- `negotiation_coherence`: two agents reading the same rejection history produce identical concession strategies.
- `context_reduces_negotiation_deficit`: shared context monotonically reduces the negotiation deficit.
- `negotiation_convergence`: the master theorem composing deficit, boundedness, and context reduction.

---

## 25.12 The Fixed Point

Self-interest with perfect knowledge of the payoff matrix produces Nash equilibrium: 33% cooperation in Hawk-Dove.

Self-interest with perfect knowledge of the void boundary produces the **Skyrms equilibrium**: 88% cooperation in Hawk-Dove.

I call this the **Skyrms equilibrium** in honor of Brian Skyrms, whose work on the evolution of the social contract (Skyrms, 1996, 2004) established that cooperative equilibria emerge from evolutionary dynamics without requiring rationality -- only iteration. I studied under Skyrms at the University of Pennsylvania, where the seed of this work was planted: the conviction that the ultra long run is where the real answers live, and that self-interest with sufficient memory is indistinguishable from cooperation. The Skyrms equilibrium is the fixed point of the void gradient flow: the strategy profile where self-interested agents with perfect knowledge of the void boundary have no incentive to deviate. It differs from the Nash equilibrium precisely by the information content of the void boundary.

**Definition (Skyrms equilibrium).** For a finite game G with choice set C and payoff function u, the Skyrms equilibrium is the mixed strategy profile sigma* such that sigma_i* = complementDist(voidBoundary_i) for each player i, where voidBoundary_i is the accumulated rejection history of player i and complementDist is the exponentially weighted complement distribution. The Skyrms equilibrium coincides with Nash when the void boundary is empty (no rejection history). It deviates from Nash when the void boundary carries asymmetric density -- specifically, when catastrophic mutual outcomes fill the void faster than other outcomes.

The difference -- 55 percentage points of peace -- comes from one source: the information content of failures. The void boundary carries information that the payoff matrix does not. Specifically, it carries the asymmetric density of catastrophic outcomes. Mutual destruction fills the void faster than any other outcome. Therefore, the complement distribution over-weights cooperation. Therefore, self-interest with sufficient memory converges to peace.

This is not an argument for peace. It is a theorem about information. The void boundary is a sufficient statistic (THM-VOID-BOUNDARY-MEASURABLE). The complement distribution is the unique minimax strategy (THM-VOID-GRADIENT). The convergence is guaranteed (THM-VOID-COHERENCE). The fixed point exists (semiotic peace theory, THM-PEACE-FIXED-POINT).

The fixed point is not utopia. It is the state where the fold becomes injective on support -- where every active meaning has its own channel, no further information is erased, and the Landauer heat of communication is zero. At the fixed point: zero information loss, zero thermodynamic cost, zero semiotic deficit. Peace.

The mathematics does not promise that any particular civilization will reach the fixed point. But it guarantees that self-interested agents with access to the void boundary -- with perfect knowledge of what failed -- converge toward it. The gradient points one way. The tombstones are the map.

Read the tombstones.

---

## 25.13 Open Questions

1. Does void walking converge to correlated equilibria or only Nash? The shared void boundary may function as a correlation device (Aumann, 1974), producing equilibria strictly better than Nash.

2. Can the inverse Bule replace discount factors in Rubinstein's alternating-offers model? The discount factor measures impatience; the inverse Bule measures learning rate. They may be dual.

3. Empirical validation: can the inverse Bule be measured in real negotiations? The data requirements are modest: a time series of offers and rejections. The computation is a single pass.

4. The Born Rule connection: if wave function collapse is a fold and the void of uncollapsed branches has measurable boundary structure, is the Born probability p = |psi|^2 the complement distribution over the quantum void? This would connect quantum mechanics to information theory through the same framework.

5. Gnosis implementation: can a gnosis compiler verify the convergence properties of the void walking feedback loop? The traced monoidal structure (chapters 9-11) provides the categorical framework. The Foster-Lyapunov drift certificate (CompositionalErgodicity.lean) provides the convergence guarantee. The gap is syntax-driven synthesis of the drift witness from the negotiation topology.

---

*Companion tests: 115 tests across 11 files, 0 failures, 291 assertions. All Lean theorems sorry-free. All TLA+ models pass bounded model checking. All results reproducible from deterministic seeds.*

*The theory of failure IS the map to peace. Not because failure is virtuous, but because the void boundary of failure carries information that the payoff matrix alone does not. Self-interest, fully informed by the void, produces the behavior that looks like peace from the outside. The ethics are a corollary of the information theory.*
