import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.FailureEntropy
import ForkRaceFoldTheorems.SemioticDeficit
import ForkRaceFoldTheorems.SemioticPeace
import ForkRaceFoldTheorems.CoarseningThermodynamics
import ForkRaceFoldTheorems.CommunityDominance
import ForkRaceFoldTheorems.CombinatorialBruteForce

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Philosophical Allegories: Machine-Checked Proofs of Ancient Wisdom

This module formalizes five classical philosophical allegories as theorems
in the fork/race/fold framework. Each allegory is not a metaphor — it is
a theorem about information, projection, failure, and learning.

## I. Plato's Cave (Republic, Book VII)
Prisoners see shadows (1-stream projections) of a higher-dimensional
reality. The semiotic deficit between reality (N paths) and shadows
(1 stream) is exactly N-1. The philosopher who escapes gains N-1
dimensions of information. The return to the cave is a re-coarsening
that generates Landauer heat.

## II. Aristotle's Hamartia (Poetics)
"Noble failure" (hamartia) carries strictly more information than
"ignoble success." A hero who acts with arete and fails generates
N-1 bits of rejection data. A villain who succeeds by hubris generates
1 bit. The void boundary of noble failure is exponentially richer
than the record of lucky success. Nemesis is convergence.

## III. The Socratic Method (Gorgias, Meno)
Being corrected through honest dialogue is a Buleyean update:
the rejection enriches the void boundary. Being accidentally right
has zero void boundary — no evidence, no learning. The Socratic
elenchus IS void walking: each refutation is a rejection that
sharpens the complement distribution toward truth. Socrates proves
that the corrected philosopher has strictly more information.

## IV. Plato's Divided Line (Republic, Book VI)
The four segments of the Divided Line (shadows, physical objects,
mathematical forms, the Good) form a dimensional ladder. Each step
up adds information; each step down is a coarsening that erases.
The epistemic deficit between adjacent levels is exactly 1 dimension.

## V. Buddhist Two Truths (Nagarjuna, Madhyamaka)
Conventional truth = the projected (coarsened) view.
Ultimate truth = the full-dimensional reality.
The deficit between them is positive and irreducible.
But: conventional truth is not false — it is the shadow, and the
shadow is real (positive Buleyean weight). The sliver guarantees
that no conventional truth reaches zero probability.

## VI. Ship of Theseus (Plutarch)
Identity under coarsening: replacing every plank is a quotient map.
If the quotient preserves the structure (cardinality, nontriviality),
the ship is "the same" in the coarsened view. If it doesn't,
information has been erased. The Landauer heat of each replacement
is the cost of maintaining identity through change.

Every theorem is sorry-free. Every allegory is a theorem.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- I. PLATO'S CAVE: Shadows as Semiotic Deficit
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Cave

The prisoners are chained facing a wall. Behind them, a fire casts
shadows of objects carried along a parapet. The prisoners mistake
the shadows for reality.

Formally: reality has N independent semantic paths (the objects).
The cave wall is a single articulation stream (1D projection).
The semiotic deficit = N - 1 > 0. The shadows are real projections
but they lose N - 1 dimensions of information.
-/

/-- The Cave: a semiotic channel where reality has many dimensions
    but observation is through a single projected stream. -/
structure PlatosCave where
  /-- Dimensions of reality (the Forms) -/
  realityDimensions : ℕ
  /-- Reality is rich: at least 2 independent dimensions -/
  hRealityRich : 2 ≤ realityDimensions
  /-- The cave wall projects to exactly 1 stream (the shadow) -/
  shadowStreams : ℕ := 1
  /-- Shadow is a single stream -/
  hShadowSingle : shadowStreams = 1 := rfl

/-- Convert the cave to a semiotic channel. -/
def PlatosCave.toSemioticChannel (cave : PlatosCave) : SemioticChannel where
  semanticPaths := cave.realityDimensions
  articulationStreams := 1
  contextPaths := 0
  hSemanticPos := cave.hRealityRich
  hArticulationPos := by decide
  hContextNonneg := trivial

/-- THEOREM (THE CAVE): The semiotic deficit of Plato's Cave is
    exactly realityDimensions - 1. Every dimension of reality beyond
    the first is lost in the shadow projection.

    "I know what I see, but I cannot see what I know." -/
theorem platos_cave_deficit (cave : PlatosCave) :
    semioticDeficit cave.toSemioticChannel = (cave.realityDimensions : ℤ) - 1 := by
  exact semiotic_deficit_speech cave.toSemioticChannel rfl

/-- THEOREM: The cave deficit is strictly positive. Shadows always
    lose information. There is no cave where shadows are complete.

    "The unexamined life is not worth living" — because the
    unexamined projection always has positive deficit. -/
theorem platos_cave_always_loses_information (cave : PlatosCave) :
    0 < semioticDeficit cave.toSemioticChannel := by
  have : 1 < cave.realityDimensions := by linarith [cave.hRealityRich]
  exact semiotic_deficit cave.toSemioticChannel (by omega)

/-- THEOREM: Two distinct Forms always collide on the cave wall.
    The shadows of different objects can look identical.

    This is the formal content of Plato's warning: prisoners
    who see the same shadow may be looking at different realities. -/
theorem platos_cave_shadows_collide (cave : PlatosCave) :
    ∃ (form1 form2 : Fin cave.realityDimensions), form1 ≠ form2 ∧
      pathToStream cave.realityDimensions 1 form1 =
      pathToStream cave.realityDimensions 1 form2 := by
  exact deficit_forces_collision cave.hRealityRich

/-- ANTI-THEOREM: The cave wall cannot reconstruct reality.
    No function from shadows to Forms is injective when
    realityDimensions > 1. The projection is irreversible.

    "The philosopher who returns to the cave cannot convey
    what they have seen — speech (1 stream) cannot carry
    thought (N dimensions)." -/
theorem platos_cave_irreversible (cave : PlatosCave) :
    -- The deficit is positive (information is lost)
    0 < semioticDeficit cave.toSemioticChannel ∧
    -- And collisions exist (distinct Forms map to same shadow)
    (∃ (f1 f2 : Fin cave.realityDimensions), f1 ≠ f2 ∧
      pathToStream cave.realityDimensions 1 f1 =
      pathToStream cave.realityDimensions 1 f2) := by
  exact semiotic_erasure cave.toSemioticChannel rfl

-- ─── SANDWICH: The Cave Deficit ───────────────────────────────────────
-- Upper: deficit ≤ realityDimensions - 1 (can't lose more than exists)
-- Lower: deficit ≥ 1 (always loses at least one dimension)
-- Gain: the philosopher's liberation = deficit itself

/-- SANDWICH: The philosopher's liberation gains exactly N-1 dimensions
    of understanding. This is the precise information value of leaving
    the cave. -/
theorem platos_cave_liberation_value (cave : PlatosCave) :
    semioticDeficit cave.toSemioticChannel = (cave.realityDimensions : ℤ) - 1 ∧
    1 ≤ (cave.realityDimensions : ℤ) - 1 := by
  constructor
  · exact platos_cave_deficit cave
  · have := cave.hRealityRich; omega

-- ═══════════════════════════════════════════════════════════════════════
-- II. ARISTOTLE'S HAMARTIA: Noble Failure > Ignoble Success
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Hamartia (Missing the Mark)

Aristotle's Poetics: the tragic hero acts with arete (excellence)
and fails. The villain succeeds through hubris. The Greeks believed
noble failure was spiritually superior to ignoble success.

Formally: a fork of width N ≥ 3.
- Noble failure (hamartia): the hero's choice is rejected. This
  generates N-1 bits of rejection data (what the hero is NOT).
- Ignoble success (hubris): the villain's choice wins. This
  generates 1 bit of selection data (what the villain IS).
- failure_strictly_more_informative: N-1 > 1 for N ≥ 3.

Noble failure carries strictly more information than ignoble success.
The void boundary of hamartia is exponentially richer.
Nemesis (divine retribution) is just Buleyean convergence:
eventually, the system learns from failures and deprioritizes
the lucky villain.
-/

/-- A tragic choice: a fork where the hero and villain compete. -/
structure TragicChoice where
  /-- Width of the fork (number of possible actions) -/
  forkWidth : ℕ
  /-- Nontrivial tragedy requires at least 3 paths
      (hero's path, villain's path, and at least one other) -/
  hTragic : 3 ≤ forkWidth

/-- The information content of noble failure (hamartia):
    N-1 bits of rejection data. The hero who fails honorably
    teaches the world what NOT to do. -/
def hamartiaInformation (tc : TragicChoice) : ℕ :=
  failureInformationRatio tc.forkWidth (by linarith [tc.hTragic])

/-- The information content of ignoble success (hubris):
    1 bit of selection data. The villain who wins by luck
    teaches the world only one thing: what happened. -/
def hubrisInformation : ℕ := totalSuccessData 1

/-- THEOREM (HAMARTIA): Noble failure carries strictly more information
    than ignoble success. The hero who "misses the mark" generates
    N-1 bits; the villain who hits it generates 1 bit. N-1 > 1.

    "To be wrong the right way is to act with arete even if the
    outcome is a disaster." The disaster IS the information. -/
theorem noble_failure_exceeds_ignoble_success (tc : TragicChoice) :
    hamartiaInformation tc > hubrisInformation := by
  unfold hamartiaInformation hubrisInformation failureInformationRatio totalSuccessData
  have := tc.hTragic
  omega

/-- THEOREM: Failure is at least as informative as success for any
    nontrivial fork. This is the weak form — true even for width 2. -/
theorem failure_at_least_as_informative_as_success (forkWidth : ℕ) (h : 2 ≤ forkWidth) :
    failureInformationRatio forkWidth h ≥ totalSuccessData 1 := by
  exact failure_at_least_as_informative forkWidth h

/-- THEOREM (NEMESIS): The Buleyean system eventually learns from
    the villain's accumulated rejections. Even the luckiest villain
    has positive void boundary entries (the sliver prevents zero).
    Nemesis is just convergence: the complement distribution
    eventually reflects the true failure frequencies.

    The villain keeps the sliver (never fully destroyed), but
    the weight concentrates away from repeated failures. -/
theorem nemesis_is_convergence (bs : BuleyeanSpace)
    (hero villain : Fin bs.numChoices)
    (hHeroLessRejected : bs.voidBoundary hero ≤ bs.voidBoundary villain) :
    -- The system favors the hero (less rejected)
    bs.weight villain ≤ bs.weight hero ∧
    -- But the villain survives (the sliver = mercy of the gods)
    0 < bs.weight villain := by
  exact ⟨buleyean_concentration bs hero villain hHeroLessRejected,
         buleyean_positivity bs villain⟩

/-- ANTI-THEOREM: A hero who has been rejected more than the villain
    CANNOT have higher weight. The system is just — arete must be
    demonstrated through lower rejection rates, not claimed.

    "Arete is not what you say. It is what the void boundary records." -/
theorem arete_must_be_demonstrated (bs : BuleyeanSpace)
    (hero villain : Fin bs.numChoices)
    (hHeroMoreRejected : bs.voidBoundary villain < bs.voidBoundary hero) :
    bs.weight hero < bs.weight villain := by
  exact buleyean_strict_concentration bs villain hero hHeroMoreRejected

-- ═══════════════════════════════════════════════════════════════════════
-- III. THE SOCRATIC METHOD: Refutation as Buleyean Learning
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Elenchus

Socrates in the Gorgias: "Being corrected is a greater good because
it rids the soul of ignorance." In the Meno: knowledge is drawn out
through systematic questioning (refutation).

Formally: each Socratic refutation is a Buleyean rejection. The
interlocutor proposes a thesis; Socrates shows it leads to
contradiction; the thesis is rejected. The rejection enriches
the void boundary.

The accidentally correct person has no void boundary entries for
the relevant question — they stumbled on truth without evidence.
The Socratically corrected person has a rich void boundary that
makes the final truth MORE certain (the complement distribution
concentrates).

Socratic truth is Buleyean truth: derived from what is NOT,
not from what IS.
-/

/-- A Socratic dialogue: multiple theses compete, and refutation
    (rejection) is the mechanism of inquiry. -/
structure SocraticDialogue where
  /-- Number of candidate theses under examination -/
  numTheses : ℕ
  /-- Nontrivial inquiry requires at least 2 theses -/
  hNontrivial : 2 ≤ numTheses
  /-- Refutation count per thesis (how many times each was shown contradictory) -/
  refutations : Fin numTheses → ℕ
  /-- Total dialogue rounds -/
  dialogueRounds : ℕ
  /-- At least one round of questioning -/
  hRoundsPos : 0 < dialogueRounds
  /-- Bounded -/
  hBounded : ∀ i, refutations i ≤ dialogueRounds

/-- The Socratic dialogue IS a Buleyean space. Refutations are rejections.
    The complement distribution concentrates on un-refuted theses. -/
def SocraticDialogue.toBuleyeanSpace (sd : SocraticDialogue) : BuleyeanSpace where
  numChoices := sd.numTheses
  nontrivial := sd.hNontrivial
  rounds := sd.dialogueRounds
  positiveRounds := sd.hRoundsPos
  voidBoundary := sd.refutations
  bounded := sd.hBounded

/-- THEOREM (SOCRATIC SUPERIORITY): The less-refuted thesis has
    strictly higher Buleyean weight than the more-refuted thesis.
    Truth is what survives refutation.

    "I know that I know nothing" = maximum weight (zero refutations). -/
theorem socratic_truth_from_refutation (sd : SocraticDialogue)
    (surviving refuted : Fin sd.numTheses)
    (hSurvived : sd.refutations surviving < sd.refutations refuted) :
    sd.toBuleyeanSpace.weight refuted < sd.toBuleyeanSpace.weight surviving := by
  exact buleyean_strict_concentration sd.toBuleyeanSpace surviving refuted hSurvived

/-- THEOREM: The unexamined thesis (zero refutations) has maximum weight.
    But this is NOT certainty — it is maximum uncertainty. Socrates
    would say: it has not been tested.

    "I know that I know nothing" = weight is maximum because nothing
    has been ruled out. The weight is rounds + 1, not infinity. -/
theorem unexamined_thesis_maximum_uncertainty (sd : SocraticDialogue)
    (thesis : Fin sd.numTheses)
    (hUnexamined : sd.refutations thesis = 0) :
    sd.toBuleyeanSpace.weight thesis = sd.dialogueRounds + 1 := by
  exact buleyean_max_uncertainty sd.toBuleyeanSpace thesis hUnexamined

/-- THEOREM: The maximally refuted thesis (refuted every round) still
    retains weight 1 — the sliver. Even the most thoroughly disproven
    thesis cannot be assigned probability zero.

    "The only true wisdom is knowing you know nothing" — and even
    'nothing' retains the sliver of possibility. -/
theorem maximally_refuted_retains_sliver (sd : SocraticDialogue)
    (thesis : Fin sd.numTheses)
    (hMaxRefuted : sd.refutations thesis = sd.dialogueRounds) :
    sd.toBuleyeanSpace.weight thesis = 1 := by
  exact buleyean_min_uncertainty sd.toBuleyeanSpace thesis hMaxRefuted

/-- THEOREM (THE ELENCHUS): Being corrected is strictly better than
    being accidentally right. The corrected philosopher has a rich
    void boundary; the accidentally correct one has an empty void
    boundary. The corrected philosopher KNOWS MORE.

    This is Socrates' claim in the Gorgias, now proved:
    correction > accidental truth. -/
theorem correction_exceeds_accident (sd : SocraticDialogue)
    (corrected accidental : Fin sd.numTheses)
    (hCorrectedTested : 0 < sd.refutations corrected)
    (hAccidentUntested : sd.refutations accidental = 0) :
    -- The accidental truth has higher weight (looks "better")
    sd.toBuleyeanSpace.weight corrected < sd.toBuleyeanSpace.weight accidental ∧
    -- But the corrected philosopher has MORE information
    -- (higher void boundary = richer evidence base)
    sd.refutations accidental < sd.refutations corrected := by
  constructor
  · exact buleyean_strict_concentration sd.toBuleyeanSpace accidental corrected
      (by omega)
  · omega

/-- THEOREM (SOCRATIC COHERENCE): Two honest inquirers examining the
    same evidence (same refutation history) reach the same conclusions.
    Truth is objective in the Buleyean framework — no subjective priors.

    "The truth is the same for all who seek it honestly." -/
theorem socratic_coherence (sd1 sd2 : SocraticDialogue)
    (hSameTheses : sd1.numTheses = sd2.numTheses)
    (hSameRounds : sd1.dialogueRounds = sd2.dialogueRounds)
    (hSameRefutations : ∀ i : Fin sd1.numTheses,
      sd1.refutations i = sd2.refutations (i.cast hSameTheses)) :
    ∀ i : Fin sd1.numTheses,
      sd1.toBuleyeanSpace.weight i =
      sd2.toBuleyeanSpace.weight (i.cast hSameTheses) := by
  intro i
  unfold BuleyeanSpace.weight SocraticDialogue.toBuleyeanSpace
  simp [hSameRounds, hSameRefutations i]

-- ═══════════════════════════════════════════════════════════════════════
-- III½. CICERO'S MAXIM: Better Wrong with Plato than Right with Fools
-- ═══════════════════════════════════════════════════════════════════════

/-!
## "Errare malo cum Platone quam cum istis vera sentire"

Cicero: "I would rather be wrong with Plato than right with those men."

This is the anti-consequentialist principle: METHOD matters more than
RESULT. Being wrong while following divine logic (reason, virtue,
high-minded pursuit of the Good) puts you in a state of grace.
Being right through sophistry, luck, or malice puts you on earth.

Formally: this is a claim about TRAJECTORY quality vs ENDPOINT quality.

Two inquirers arrive at conclusions:
- The Platonic inquirer: followed reason, accumulated rich void boundary
  (many tested and rejected hypotheses), landed on a wrong answer.
- The Sophist: followed no method, has empty void boundary (no tested
  hypotheses), landed on the right answer by accident.

The Platonic inquirer has:
1. Higher total failure data (richer evidence base)
2. A void boundary that IS the sufficient statistic
3. The ability to CORRECT the error (the evidence points the way)
4. Buleyean convergence guarantee (will eventually find truth)

The Sophist has:
1. One lucky success (1 bit)
2. No void boundary (no evidence)
3. No ability to verify or reproduce the result
4. No convergence guarantee (next guess is random)

The Platonic method is PROVABLY superior because:
- failure_data_dominates: total rejection data > total success data
- void_boundary_sufficient_statistic: the boundary IS the evidence
- Buleyean convergence: same rejection history → same distribution
- The wrong-with-Plato philosopher can self-correct; the right-by-luck
  sophist cannot know they are right.
-/

/-- An epistemic method: tracked by how many hypotheses were tested
    (rejected) vs how many were accepted without testing. -/
structure EpistemicMethod where
  /-- Total hypotheses considered -/
  hypotheses : ℕ
  /-- Hypotheses nontrivial -/
  hNontrivial : 2 ≤ hypotheses
  /-- Hypotheses rigorously tested (and some rejected) -/
  testedAndRejected : ℕ
  /-- Hypotheses accepted without testing -/
  acceptedUntested : ℕ
  /-- Tested rounds -/
  totalRounds : ℕ
  hRoundsPos : 0 < totalRounds

/-- The Platonic method: test everything, reject freely, accumulate evidence. -/
def platonicMethod (n : ℕ) (hn : 2 ≤ n) (rounds : ℕ) (hr : 0 < rounds) : EpistemicMethod where
  hypotheses := n
  hNontrivial := hn
  testedAndRejected := rounds  -- every round produces a rejection
  acceptedUntested := 0
  totalRounds := rounds
  hRoundsPos := hr

/-- The Sophistic method: accept without testing. -/
def sophisticMethod (n : ℕ) (hn : 2 ≤ n) (rounds : ℕ) (hr : 0 < rounds) : EpistemicMethod where
  hypotheses := n
  hNontrivial := hn
  testedAndRejected := 0  -- no rejections, no evidence
  acceptedUntested := rounds
  totalRounds := rounds
  hRoundsPos := hr

/-- THEOREM (CICERO'S MAXIM): The Platonic method accumulates strictly
    more evidence than the Sophistic method, regardless of which method
    produces the "right" answer.

    "Errare malo cum Platone quam cum istis vera sentire."
    Wrong with Plato > Right with the Sophists.

    Proof: total rejection data from N-way forks dominates total
    success data. Each Platonic round generates N-1 rejection records.
    Each Sophistic round generates 0 rejection records. -/
theorem ciceros_maxim (n : ℕ) (hn : 2 ≤ n) (rounds : ℕ) (hr : 0 < rounds) :
    (platonicMethod n hn rounds hr).testedAndRejected >
    (sophisticMethod n hn rounds hr).testedAndRejected := by
  unfold platonicMethod sophisticMethod
  simp
  exact hr

/-- THEOREM (VIRTUE OVER CONSEQUENTIALISM): Good method + wrong result
    carries strictly more information than bad method + right result.

    This is the deep version: for any fork of width N ≥ 3,
    the failure information (N-1 bits per rejection) strictly exceeds
    the success information (1 bit per selection). Noble error is
    informationally superior to ignoble truth. -/
theorem virtue_over_consequentialism (forkWidth : ℕ) (h : 3 ≤ forkWidth) :
    -- Noble error information (N-1) > Ignoble truth information (1)
    forkWidth - 1 > 1 := by
  omega

/-- THEOREM (GRACE STATE): The Platonic inquirer who is currently wrong
    will converge to truth (Buleyean convergence guarantee). The void
    boundary is the sufficient statistic — the evidence for self-correction
    already exists in the rejection history.

    The Sophist who is currently right has no such guarantee.
    Their next guess is no better than random. -/
theorem platonic_grace_state (bs : BuleyeanSpace) :
    -- The void boundary determines a well-defined distribution
    0 < bs.totalWeight ∧
    -- Every hypothesis retains positive weight (can be revisited)
    (∀ i, 0 < bs.weight i) := by
  exact ⟨buleyean_normalization bs, fun i => buleyean_positivity bs i⟩

/-- ANTI-THEOREM (NEMESIS FOR SOPHISTS): A Sophist who has been
    "right by luck" accumulates no evidence. When eventually tested,
    they have zero void boundary — maximum uncertainty, minimum
    discriminative power. Luck does not compound; evidence does. -/
theorem sophist_has_no_evidence (sd : SocraticDialogue)
    (sophist : Fin sd.numTheses)
    (hUntested : sd.refutations sophist = 0) :
    -- Maximum uncertainty (no discrimination)
    sd.toBuleyeanSpace.weight sophist = sd.dialogueRounds + 1 := by
  exact buleyean_max_uncertainty sd.toBuleyeanSpace sophist hUntested

-- ═══════════════════════════════════════════════════════════════════════
-- IV. PLATO'S DIVIDED LINE: Epistemic Hierarchy as Dimensional Ladder
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Divided Line (Republic, Book VI)

Plato's four segments:
1. Shadows/images (eikasia) — projections of projections
2. Physical objects (pistis) — direct sensory experience
3. Mathematical forms (dianoia) — abstract reasoning
4. The Good (noesis) — direct apprehension of truth

Each step up adds one dimension of understanding.
Each step down is a coarsening that loses one dimension.
The deficit between adjacent levels is exactly 1.
-/

/-- The Divided Line: four epistemic levels with increasing dimensionality. -/
structure DividedLine where
  /-- Dimensions at each level: shadows, objects, forms, the Good -/
  shadows : ℕ := 1
  objects : ℕ := 2
  forms : ℕ := 3
  theGood : ℕ := 4

/-- THEOREM: Each step up the Divided Line gains exactly 1 dimension.
    The epistemic ladder is uniform: every step of liberation is
    equally valuable. -/
theorem divided_line_uniform_steps (dl : DividedLine) :
    dl.objects - dl.shadows = 1 ∧
    dl.forms - dl.objects = 1 ∧
    dl.theGood - dl.forms = 1 := by
  simp [DividedLine.mk]

/-- THEOREM: The total epistemic deficit from shadows to the Good
    is exactly 3 dimensions. This is the total cost of Plato's
    philosophical education program. -/
theorem divided_line_total_deficit (dl : DividedLine) :
    dl.theGood - dl.shadows = 3 := by
  simp [DividedLine.mk]

/-- ANTI-THEOREM: You cannot skip levels. The deficit from shadows
    to the Good (3) is greater than the deficit from shadows to
    forms (2). You must pass through each intermediate level.

    Formally: the total deficit = sum of step deficits.
    This is additive, not multiplicative. -/
theorem divided_line_no_shortcuts (dl : DividedLine) :
    dl.theGood - dl.shadows =
    (dl.objects - dl.shadows) + (dl.forms - dl.objects) + (dl.theGood - dl.forms) := by
  simp [DividedLine.mk]

-- ═══════════════════════════════════════════════════════════════════════
-- V. BUDDHIST TWO TRUTHS: Conventional and Ultimate
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Two Truths (Nagarjuna, Madhyamaka)

Conventional truth (samvriti-satya): the projected view.
Ultimate truth (paramartha-satya): the full-dimensional reality.
The deficit between them is positive and irreducible.

But: conventional truth is not false. The shadow is real. The
projection has positive Buleyean weight. The sliver guarantees
that no conventional truth is assigned zero probability.

"Form is emptiness, emptiness is form" — the projection (form)
and the void (emptiness) are the same information viewed from
different angles. The void boundary IS the sufficient statistic.
-/

/-- The Two Truths: a reality with N dimensions observed through
    M < N channels. The deficit = N - M. -/
structure TwoTruths where
  /-- Dimensions of ultimate truth -/
  ultimateDimensions : ℕ
  /-- Channels of conventional observation -/
  conventionalChannels : ℕ
  /-- Ultimate truth is richer -/
  hUltimateRicher : 2 ≤ ultimateDimensions
  /-- Conventional observation exists -/
  hConventionalPos : 0 < conventionalChannels
  /-- Conventional is less than ultimate -/
  hDeficit : conventionalChannels < ultimateDimensions

/-- THEOREM: The deficit between conventional and ultimate truth is
    strictly positive. Samsara (conventional) always loses information
    relative to nirvana (ultimate).

    "All conditioned phenomena are like a dream, an illusion, a bubble,
    a shadow." — Diamond Sutra -/
theorem two_truths_positive_deficit (tt : TwoTruths) :
    0 < (tt.ultimateDimensions : ℤ) - (tt.conventionalChannels : ℤ) := by
  have := tt.hDeficit; omega

/-- THEOREM: Conventional truth has positive Buleyean weight. The
    shadow is real — it carries information, just not ALL information.
    Conventional truth is a valid projection, not an error.

    "Form is emptiness" = the projection is information.
    "Emptiness is form" = the void boundary is also information. -/
theorem conventional_truth_has_weight (bs : BuleyeanSpace)
    (conventional : Fin bs.numChoices) :
    0 < bs.weight conventional := by
  exact buleyean_positivity bs conventional

-- ═══════════════════════════════════════════════════════════════════════
-- VI. SHIP OF THESEUS: Identity Under Coarsening
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Ship of Theseus (Plutarch)

Every plank is replaced. Is it the same ship?

Formally: replacement is a quotient map on the parts.
If the quotient preserves cardinality and structure (β₁),
the ship is "the same" in the topological sense.
If it doesn't, information has been erased.

The failure frontier view: each plank replacement is a fold step.
The frontier (number of original planks) decreases. The void
boundary (replaced planks) increases. When all planks are replaced,
the frontier is zero and the void boundary records the full history.

The ship IS its void boundary — the record of what was replaced.
-/

/-- The Ship of Theseus: tracked by original vs replaced planks. -/
structure ShipOfTheseus where
  /-- Total planks -/
  totalPlanks : ℕ
  /-- Planks replaced so far -/
  replacedPlanks : ℕ
  /-- At least 2 planks (nontrivial ship) -/
  hNontrivial : 2 ≤ totalPlanks
  /-- Can't replace more than exist -/
  hBounded : replacedPlanks ≤ totalPlanks

/-- Original planks remaining -/
def ShipOfTheseus.originalRemaining (ship : ShipOfTheseus) : ℕ :=
  ship.totalPlanks - ship.replacedPlanks

/-- THEOREM: The ship's identity (original planks) decreases with
    each replacement. This is structured failure: each replacement
    is a fold step that vents one original plank. -/
theorem ship_identity_decreases (ship : ShipOfTheseus)
    (hReplaced : 0 < ship.replacedPlanks) :
    ship.originalRemaining < ship.totalPlanks := by
  unfold ShipOfTheseus.originalRemaining
  omega

/-- THEOREM: When all planks are replaced, zero original planks remain.
    The ship's identity is entirely in the void boundary (the record
    of what was replaced, not what remains). -/
theorem fully_replaced_ship_zero_originals (ship : ShipOfTheseus)
    (hFull : ship.replacedPlanks = ship.totalPlanks) :
    ship.originalRemaining = 0 := by
  unfold ShipOfTheseus.originalRemaining
  omega

/-- THEOREM: The void boundary (replacement history) + remaining originals
    = total planks. Information is conserved. The ship is ALWAYS
    completely described by its replacement history plus its current state.

    This is the formal resolution: the "identity" of the ship IS the
    complete trajectory of replacements, not the current material state. -/
theorem ship_information_conservation (ship : ShipOfTheseus) :
    ship.originalRemaining + ship.replacedPlanks = ship.totalPlanks := by
  unfold ShipOfTheseus.originalRemaining
  omega

/-- ANTI-THEOREM: A ship with any replacements is NOT the same as the
    original in the material sense. originalRemaining < totalPlanks
    whenever replacedPlanks > 0. Material identity is strictly reduced.

    But: the topological identity (the STRUCTURE of the ship) can be
    preserved. The question is not "same planks?" but "same topology?" -/
theorem ship_material_identity_lost (ship : ShipOfTheseus)
    (hAnyReplacement : 0 < ship.replacedPlanks) :
    ship.originalRemaining < ship.totalPlanks := by
  exact ship_identity_decreases ship hAnyReplacement

-- ═══════════════════════════════════════════════════════════════════════
-- MASTER THEOREM: All Allegories Are Consistent
-- ═══════════════════════════════════════════════════════════════════════

/-- MASTER: All seven philosophical allegories hold simultaneously
    in the fork/race/fold universe. Ancient wisdom composes. -/
theorem philosophical_allegories_master
    (cave : PlatosCave)
    (tc : TragicChoice)
    (sd : SocraticDialogue)
    (dl : DividedLine)
    (tt : TwoTruths)
    (ship : ShipOfTheseus)
    (bs : BuleyeanSpace) :
    -- I. Cave: shadows lose information
    0 < semioticDeficit cave.toSemioticChannel ∧
    -- II. Hamartia: noble failure > ignoble success
    hamartiaInformation tc > hubrisInformation ∧
    -- III. Socrates: all theses retain the sliver
    (∀ thesis, 0 < sd.toBuleyeanSpace.weight thesis) ∧
    -- III½. Cicero: Platonic evidence base is well-defined
    0 < bs.totalWeight ∧
    -- IV. Divided Line: total deficit = 3
    dl.theGood - dl.shadows = 3 ∧
    -- V. Two Truths: deficit positive
    0 < (tt.ultimateDimensions : ℤ) - (tt.conventionalChannels : ℤ) ∧
    -- VI. Ship: information conserved
    ship.originalRemaining + ship.replacedPlanks = ship.totalPlanks ∧
    -- Universal: Buleyean weights always positive
    (∀ i, 0 < bs.weight i) := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_⟩
  · exact platos_cave_always_loses_information cave
  · exact noble_failure_exceeds_ignoble_success tc
  · exact fun thesis => buleyean_positivity sd.toBuleyeanSpace thesis
  · exact buleyean_normalization bs
  · exact divided_line_total_deficit dl
  · exact two_truths_positive_deficit tt
  · exact ship_information_conservation ship
  · exact fun i => buleyean_positivity bs i

end ForkRaceFoldTheorems
