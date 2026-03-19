# The Algebraic Nadir

*Set Bule = 0. Solve. Done.*

## Abstract

The Skyrms nadir -- the fixed point of three-walker mediation where no unilateral deviation improves any walker -- can be found by void walking (§14.5.1): running the iterative three-walker process until convergence is empirically detected (inter-walker distance stable, joint kurtosis stable, mutual information positive). The `SkyrmsNadirDetector` in `aeon-neutral` implements this iterative detection.

We prove that the nadir can be identified algebraically by solving $B = 0$ where $B$ is the Bule deficit. No walking required. No convergence detection. No iteration. Just arithmetic.

The minimum community context for the nadir is:

$$C^* = F - D$$

where $F$ is the total failure dimensions and $D$ is the number of decision streams. For the standard scheduling case ($D = 1$), this is $C^* = F - 1$. At exactly $C^*$ rounds of CRDT sync, the Bule deficit hits zero, the scheduling superposition collapses, and the community has converged. The nadir is a subtraction.

## 1. The Traditional Path: Walk Until Converged

The `SkyrmsNadirDetector` (in `open-source/aeon-neutral/src/nadir-detector.ts`) issues a `NadirCertificate` when three conditions hold simultaneously over a window of $W$ consecutive rounds:

1. **Distance stable:** Inter-walker distance $d_t \leq \epsilon_d$ for all $t$ in the window.
2. **Kurtosis stable:** Variance of joint kurtosis values $< \epsilon_k$ over the window.
3. **Mutual information positive:** $\text{MI}_t > 0$ for all $t$ in the window.

This works. The three-walker process in `SkyrmsThreeWalker.tla` converges under weak fairness, and the detector's certificate is correct when issued. But the process is iterative: you must *run* the walkers, *observe* the joint state, and *wait* for the window to fill. The convergence time depends on the walkers' learning rates, the payoff landscape, and the initial distance.

## 2. The Algebraic Path: Solve Bule = 0

Consider a three-walker mediation with:
- Walker A's position space: $A$ dimensions
- Walker B's position space: $B$ dimensions
- Proposal stream: 1 (single proposal per round)

The total failure dimensions of the joint system are $F = A + B$. The Bule deficit after $C$ rounds of community context is:

$$B(C) = \max(0, F - 1 - C) = \max(0, A + B - 1 - C)$$

Setting $B = 0$:

$$0 = A + B - 1 - C^*$$
$$C^* = A + B - 1$$

That's the nadir. Not "approximately the nadir." Not "the nadir under assumptions." The nadir. Period.

**Theorem (nadir_algebraic):**
1. $C^* = A + B - 1$ (computable)
2. $B(C^*) = 0$ (converged)
3. $B(C^* - 1) > 0$ (not converged one step earlier)
4. $C^* > 0$ (nontrivial)

The nadir context is the exact minimum. One fewer round and you're not there. One more round and you're already past it (but the deficit stays at zero -- you can't overshoot peace).

## 3. Why This Works

The algebraic identification works because the Bule deficit and the inter-walker distance measure the same thing: the number of dimensions on which the system still disagrees.

**Bule deficit:** Counts failure dimensions not yet covered by community context. Each CRDT sync round covers one dimension (by adding one implicit channel to the scheduling fold). When all dimensions are covered, $B = 0$.

**Inter-walker distance:** Counts the L1 distance between complement distributions. Each mediation round that reduces the distance covers one dimension of disagreement. When all dimensions agree, $d = 0$.

**Theorem (bule_zero_iff_nadir):** $B = 0 \iff d = 0$. The biconditional.

The reason the algebraic path avoids void walking: the Bule deficit decreases by exactly 1 per round (theorem `bule_deficit_strict_progress`). There is no stochasticity, no learning rate dependence, no landscape sensitivity. The deficit is a countdown. $F - 1, F - 2, \ldots, 1, 0$. Each CRDT observation covers one failure dimension. The countdown reaches zero in exactly $F - 1$ steps.

The traditional three-walker process *also* converges in $O(F)$ rounds -- but the constant depends on the walkers' behavior. The algebraic bound is tight: exactly $F - 1$ rounds, no more, no less.

## 4. What the Nadir Certificate Becomes

Under the algebraic identification, the `NadirCertificate` fields have direct Bule interpretations:

| Certificate field | Algebraic equivalent |
|---|---|
| `round` | $C^*$ (= $F - 1$, computable before running) |
| `finalDistance` | 0 (by construction) |
| `finalKurtosis` | The complement distribution at $B = 0$ is the ground state -- kurtosis is determined by the converged score distribution |
| `finalMutualInformation` | Positive iff $F > 1$ (nontrivial topology has nontrivial MI) |
| `totalFailures` | $\leq C^*$ (each round either fails or succeeds, convergence in at most $C^*$ failures) |
| `nadirPoint` | The argmax of the joint complement distribution at round $C^*$ |
| `avgInverseBule` | The mean deficit over the convergence window, which is 0 |

The certificate can be *computed* rather than *detected*. You know the round in advance. You know the distance is zero. You know the mutual information is positive. The only empirical question is the nadir point -- which proposal pair the complement distribution selects at convergence -- and even that is determined by the accumulated void boundary at round $C^*$.

## 5. Implications for Mediation Design

If the nadir is arithmetic, then mediation protocol design becomes:

**5.1 Budgeting:** A mediator knows in advance how many rounds are needed. For a dispute between parties with $A$ and $B$ interest dimensions respectively, the nadir requires $A + B - 1$ rounds. This is a planning parameter, not a runtime discovery.

**5.2 Early termination:** If the three-walker process has not converged by round $C^*$, something is wrong -- the topology dimensions were miscounted, or the CRDT sync is losing observations. The algebraic bound is a correctness check on the iterative process.

**5.3 Cold start:** For a new community fabric with zero history, the Bule deficit equals $F - 1$. The community knows exactly how far it is from convergence. This is the "semiotic deficit" between the community's current knowledge and the knowledge needed for optimal scheduling. The deficit is the distance to peace, measured in Bules.

**5.4 Incremental mediation:** Adding a new backend with $k$ new failure dimensions increases the nadir context by $k$. The community needs $k$ more rounds of CRDT sync to re-converge. This is exact: not "approximately $k$" but exactly $k$.

## 6. The Deeper Point

Void walking is powerful because it learns from rejection. The complement distribution over accumulated failures is the optimal guide for future forks. This is the core insight of ch17 §9.

But void walking is *iterative*. It requires running the process and observing the trajectory. The algebraic nadir identification says: for the specific case of community scheduling, you don't need the trajectory. The destination is computable from the topology alone.

This doesn't invalidate void walking. The complement distribution at the nadir -- the *content* of the equilibrium, which proposal pair solves the dispute -- still requires the void boundary data. You need the rejection history to know *what* the answer is. But you don't need the rejection history to know *when* the answer arrives. The "when" is arithmetic.

The analogy to physics: you don't need to simulate a ball rolling down a hill to know it reaches the bottom. The ground state is determined by the landscape. You might need the simulation to know the *path* (which is interesting and useful), but the *destination* is computable from the potential energy surface alone.

Community CRDTs give you the potential energy surface. The Bule deficit is the height above ground state. The nadir is ground state. Set height to zero. Solve.

## Formal Surface

- **Lean4:** `SkyrmsNadirBule.lean` -- 12 theorems, master theorem `skyrms_nadir_is_bule_zero`
- **TLA+:** `SkyrmsNadirBule.tla` + `SkyrmsNadirBule.cfg` -- model-checks equivalence
- **Existing Lean4:** `VoidWalking.lean` (SkyrmsEquilibrium), `NegotiationEquilibrium.lean` (NegotiationChannel)
- **Existing TLA+:** `SkyrmsThreeWalker.tla`, `SkyrmsNadir.tla`, `NegotiationConvergence.tla`
- **Runtime:** `open-source/aeon-neutral/src/skyrms-walker.ts`, `nadir-detector.ts`, `joint-surface.ts`

## Summary

The Skyrms nadir is $C^* = A + B - 1$ rounds of CRDT sync. This is exact, computable, and tight.

Community IS the mediator (ch26). The Bule deficit IS the inter-walker distance. And the nadir IS the zero of a linear function.

Set Bule = 0. Solve. Done.
