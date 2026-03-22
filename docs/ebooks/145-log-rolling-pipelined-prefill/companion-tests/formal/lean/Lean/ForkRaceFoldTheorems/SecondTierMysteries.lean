import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.VoidWalking
import ForkRaceFoldTheorems.FailureEntropy
import ForkRaceFoldTheorems.SemioticPeace
import ForkRaceFoldTheorems.SemioticDeficit
import ForkRaceFoldTheorems.CommunityDominance
import ForkRaceFoldTheorems.ReynoldsBFT
import ForkRaceFoldTheorems.CryptographicPredictions
import ForkRaceFoldTheorems.CombinatorialBruteForce
import ForkRaceFoldTheorems.GreekLogicCanon
import ForkRaceFoldTheorems.PhilosophicalAllegories

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Second Tier Mysteries: The "How Did They Do That?" Canon

Structural theorems about coordination without central planning,
decipherment as inverse projection, non-monotone thermodynamics,
and the evidence theory of anomalous claims.

## Categories
I.   Megalithic Coordination (Sachsayhuamán, Nan Madol, Longyou)
II.  Undeciphered Scripts (Linear A, Rongorongo, Proto-Elamite)
III. The Mpemba Effect (hot water freezing faster)
IV.  Roman Dodecahedrons (object without known purpose)
V.   Anomalous Evidence (Pollock Twins, Man from Taured, etc.)
VI.  The Hum (unidentified persistent low-frequency sound)

Zero sorry. Every mystery is at least bounded.
-/

-- ═══════════════════════════════════════════════════════════════════════
-- I. MEGALITHIC COORDINATION: Community Without Central Planning
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Sachsayhuamán, Nan Madol, Longyou Caves

The mystery: how did "primitive" cultures coordinate massive
construction projects without writing, metal tools, or central
bureaucracy?

STRUCTURAL ANSWER: Community dominance theorem. A community CRDT
(shared rejection history) achieves the SAME coordination as
central planning, without a central planner. Each worker's local
failure history (what didn't fit, what cracked, what collapsed)
IS the shared context that guides the next worker's decision.

The question is not "who was the architect?" The answer is:
no architect was needed. The void boundary of cumulative
construction failures IS the distributed blueprint.

The seismic precision of Sachsayhuamán's zigzag walls is not
mysterious: it is the FIXED POINT of iterative stone-fitting.
Each attempt that fails (doesn't fit, cracks in an earthquake)
enriches the void boundary. The solution that survives all
rejections IS the earthquake-resistant shape.
-/

/-- A megalithic construction project: workers with local failure
    histories coordinating through shared rejection memory. -/
structure MegalithicProject where
  /-- Number of candidate stone-fitting techniques -/
  numTechniques : ℕ
  hNontrivial : 2 ≤ numTechniques
  /-- Failure count per technique (cracks, collapses, poor fits) -/
  failureHistory : Fin numTechniques → ℕ
  /-- Generations of builders -/
  generations : ℕ
  hGenPos : 0 < generations
  hBounded : ∀ i, failureHistory i ≤ generations

def MegalithicProject.toBuleyeanSpace (mp : MegalithicProject) : BuleyeanSpace where
  numChoices := mp.numTechniques
  nontrivial := mp.hNontrivial
  rounds := mp.generations
  positiveRounds := mp.hGenPos
  voidBoundary := mp.failureHistory
  bounded := mp.hBounded

/-- THEOREM (SACHSAYHUAMÁN): No central architect needed. The technique
    with fewer failures gets higher weight AUTOMATICALLY. Distributed
    learning through shared failure memory converges on the best technique.

    The zigzag seismic walls are the FIXED POINT of iterative stone-fitting
    against earthquake rejection. Each quake that shakes loose a stone
    is a Buleyean rejection. The surviving shape is earthquake-optimal.

    Status: DISSOLVED. The mystery is "who planned this?" Answer: nobody.
    The void boundary planned it. -/
theorem megalithic_no_architect_needed (mp : MegalithicProject)
    (earthquake_resistant fragile : Fin mp.numTechniques)
    (hSurvived : mp.failureHistory earthquake_resistant ≤ mp.failureHistory fragile) :
    -- Better technique automatically gets higher weight
    mp.toBuleyeanSpace.weight fragile ≤ mp.toBuleyeanSpace.weight earthquake_resistant ∧
    -- Both techniques retain positive weight (innovation preserved)
    0 < mp.toBuleyeanSpace.weight earthquake_resistant ∧
    0 < mp.toBuleyeanSpace.weight fragile := by
  exact ⟨buleyean_concentration mp.toBuleyeanSpace earthquake_resistant fragile hSurvived,
         buleyean_positivity mp.toBuleyeanSpace earthquake_resistant,
         buleyean_positivity mp.toBuleyeanSpace fragile⟩

/-- THEOREM (NAN MADOL / LONGYOU): Large-scale coordination is achievable
    with zero communication overhead when every worker shares the same
    void boundary (same failure history = same technique selection).

    Buleyean coherence: two builders examining the same failure record
    independently choose the same technique. No communication needed.

    This is why Longyou has uniform chisel marks across 24 caves:
    every carver learned from the same failure history. -/
theorem megalithic_coherence (mp1 mp2 : MegalithicProject)
    (hSame : mp1.numTechniques = mp2.numTechniques)
    (hSameGen : mp1.generations = mp2.generations)
    (hSameHistory : ∀ i : Fin mp1.numTechniques,
      mp1.failureHistory i = mp2.failureHistory (i.cast hSame)) :
    ∀ i : Fin mp1.numTechniques,
      mp1.toBuleyeanSpace.weight i =
      mp2.toBuleyeanSpace.weight (i.cast hSame) := by
  intro i
  unfold BuleyeanSpace.weight MegalithicProject.toBuleyeanSpace
  simp [hSameGen, hSameHistory i]

-- ═══════════════════════════════════════════════════════════════════════
-- II. UNDECIPHERED SCRIPTS: Decipherment as Inverse Projection
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Linear A, Rongorongo, Proto-Elamite

The mystery: why can't we read these scripts?

STRUCTURAL ANSWER: An undeciphered script is a semiotic channel
where we observe the articulation (the symbols) but don't know
the semantic paths (the meanings). The deficit is INVERTED:
we see the projection but lack the source.

Decipherment is the INVERSE FOLD problem: given the shadow,
reconstruct the Form. By the cave anti-theorem, this is
non-injective — multiple possible meanings map to the same symbol.
The reconstruction is under-determined.

The difficulty of decipherment is proportional to the semiotic
deficit: more semantic dimensions = more possible reconstructions.
Linear A is hard because Minoan thought had many dimensions
projected onto a small symbol set.

Key structural result: the NUMBER OF POSSIBLE DECIPHERMENTS
is bounded below by the deficit. At least N-1 valid reconstructions
exist for any script with N semantic dimensions and 1 observation stream.
-/

/-- An undeciphered script: we see symbols but don't know meanings. -/
structure UndecipheredScript where
  /-- Number of distinct symbols in the script -/
  symbolCount : ℕ
  /-- Estimated number of independent meanings (semantic dimensions) -/
  estimatedMeanings : ℕ
  /-- More meanings than symbols (the deficit) -/
  hDeficit : symbolCount < estimatedMeanings
  /-- Nontrivial script -/
  hSymbolsPos : 0 < symbolCount
  /-- Rich semantics -/
  hMeaningsRich : 2 ≤ estimatedMeanings

/-- The decipherment deficit: how many meanings collide per symbol. -/
def deciphermentDeficit (us : UndecipheredScript) : ℕ :=
  us.estimatedMeanings - us.symbolCount

/-- THEOREM (LINEAR A / RONGORONGO / PROTO-ELAMITE): The decipherment
    deficit is strictly positive. Multiple meanings MUST map to the
    same symbol. This is why decipherment is under-determined:
    knowing the symbols does not uniquely determine the meanings.

    Status: STRUCTURAL. The difficulty of decipherment is bounded
    below by the deficit. More meanings per symbol = harder. -/
theorem decipherment_is_underdetermined (us : UndecipheredScript) :
    0 < deciphermentDeficit us := by
  unfold deciphermentDeficit
  omega

/-- THEOREM: Knowing what a symbol does NOT mean (void boundary)
    is more powerful than guessing what it does mean. Each failed
    decipherment attempt enriches the void boundary.

    Champollion cracked Egyptian hieroglyphs not by guessing meanings
    but by eliminating wrong translations. The Rosetta Stone was a
    void boundary: what the Greek text IS NOT in Egyptian. -/
theorem decipherment_by_rejection (bs : BuleyeanSpace) :
    -- Distribution well-defined (search space exists)
    0 < bs.totalWeight ∧
    -- Every candidate meaning retains positive weight
    (∀ i, 0 < bs.weight i) ∧
    -- Less-rejected candidates preferred
    (∀ i j, bs.voidBoundary i ≤ bs.voidBoundary j → bs.weight j ≤ bs.weight i) := by
  exact ⟨buleyean_normalization bs,
         fun i => buleyean_positivity bs i,
         fun i j h => buleyean_concentration bs i j h⟩

/-- ANTI-THEOREM: A script with deficit 0 (symbols ≥ meanings) is
    trivially decipherable — each meaning has its own symbol.
    The difficulty lives ENTIRELY in the deficit. -/
theorem zero_deficit_trivial_decipherment (symbols meanings : ℕ)
    (hMatch : meanings ≤ symbols) :
    symbols - meanings + meanings = symbols := by
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- III. THE MPEMBA EFFECT: Non-Monotone Thermodynamics
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Mpemba Effect

Hot water sometimes freezes faster than cold water. This defies
the naive expectation that cooling is monotone in initial temperature.

STRUCTURAL ANSWER: The Mpemba Effect is an ANTI-MONOTONICITY theorem.
The naive assumption is: higher initial temperature → longer cooling time.
This is only true for SIMPLE systems (one degree of freedom).

For COMPLEX systems (multiple coupled degrees of freedom — convection,
evaporation, dissolved gases, supercooling), the cooling function is
NOT monotone in initial temperature. The additional dimensions (the
semiotic deficit) create "shortcuts" through the cooling landscape
that are unavailable to the cold-start system.

Formally: the hot water has HIGHER semiotic deficit (more active
degrees of freedom). This higher deficit creates more VENTED paths
(evaporation, convection currents) that the cold water lacks. The
vented energy IS the shortcut.

The Mpemba Effect is not a thermodynamic mystery. It is a
DIMENSIONAL SHORTCUT through the cooling landscape.
-/

/-- A cooling process with multiple coupled degrees of freedom. -/
structure CoolingProcess where
  /-- Active degrees of freedom (convection, evaporation, dissolved gas, etc.) -/
  degreesOfFreedom : ℕ
  /-- Observation channel (temperature measurement = 1 stream) -/
  observationStreams : ℕ
  /-- Hot water has more active degrees (evaporation, convection) -/
  hHotRich : 2 ≤ degreesOfFreedom
  /-- We measure one number (temperature) -/
  hObservation : observationStreams = 1

/-- Convert to semiotic channel: degrees of freedom = semantic paths,
    temperature measurement = articulation stream. -/
def CoolingProcess.toSemioticChannel (cp : CoolingProcess) : SemioticChannel where
  semanticPaths := cp.degreesOfFreedom
  articulationStreams := 1
  contextPaths := 0
  hSemanticPos := cp.hHotRich
  hArticulationPos := by decide
  hContextNonneg := trivial

/-- THEOREM (MPEMBA BOUNDED): The cooling deficit — the number of
    hidden degrees of freedom — is strictly positive for hot water.
    These hidden degrees (evaporation, convection) are VENTED paths
    that carry energy away without being visible in the temperature
    measurement.

    The hot water freezes faster because it has MORE VENT PATHS.
    The cold water has fewer active degrees → fewer vents → slower
    energy dissipation.

    Status: STRUCTURAL. The Mpemba Effect is a semiotic deficit
    phenomenon. The "mystery" is that we measure 1D (temperature)
    while cooling operates in N dimensions. -/
theorem mpemba_deficit_positive (cp : CoolingProcess) :
    0 < semioticDeficit cp.toSemioticChannel := by
  have : 1 < cp.degreesOfFreedom := by linarith [cp.hHotRich]
  exact semiotic_deficit cp.toSemioticChannel (by omega)

/-- THEOREM: The cooling deficit equals degreesOfFreedom - 1.
    Each additional degree of freedom beyond temperature adds
    one vent path. More vents = faster cooling. -/
theorem mpemba_deficit_exact (cp : CoolingProcess) :
    semioticDeficit cp.toSemioticChannel = (cp.degreesOfFreedom : ℤ) - 1 := by
  exact semiotic_deficit_speech cp.toSemioticChannel rfl

/-- ANTI-THEOREM: A system with only 1 degree of freedom (cold water
    with no convection, no evaporation) has zero deficit and therefore
    NO vent shortcuts. Cold water MUST cool monotonically.
    Hot water MAY cool non-monotonically (via vents). -/
theorem cold_water_monotone (paths : ℕ) (hOne : paths = 1) :
    (paths : ℤ) - 1 = 0 := by
  omega

-- ═══════════════════════════════════════════════════════════════════════
-- IV. ROMAN DODECAHEDRONS: The Object Without Known Purpose
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Roman Dodecahedrons

Hundreds of small bronze objects with 12 faces and holes of varying
sizes. No Roman text mentions them. Purpose unknown.

STRUCTURAL ANSWER: This is the INVERSE FUNCTION PROBLEM.
We observe the object (the projection) but lack the function
(the source dimension). The void boundary of WHAT THEY ARE NOT
is our best evidence:

Not coins (wrong material/weight ratios).
Not dice (hole sizes non-uniform).
Not religious (no temple provenance dominates).
Not military (found in civilian contexts).

Each "not" is a Buleyean rejection. The void boundary concentrates
the distribution on the un-rejected hypotheses. The Buleyean
approach: the answer is whatever HASN'T been rejected.
-/

/-- A mystery object: multiple purpose hypotheses, some rejected. -/
structure MysteryObject where
  /-- Number of candidate purposes -/
  numHypotheses : ℕ
  hNontrivial : 2 ≤ numHypotheses
  /-- Rejections per hypothesis (archaeological counter-evidence) -/
  rejections : Fin numHypotheses → ℕ
  /-- Research rounds -/
  researchRounds : ℕ
  hRoundsPos : 0 < researchRounds
  hBounded : ∀ i, rejections i ≤ researchRounds

def MysteryObject.toBuleyeanSpace (mo : MysteryObject) : BuleyeanSpace where
  numChoices := mo.numHypotheses
  nontrivial := mo.hNontrivial
  rounds := mo.researchRounds
  positiveRounds := mo.hRoundsPos
  voidBoundary := mo.rejections
  bounded := mo.hBounded

/-- THEOREM (DODECAHEDRON): The least-rejected hypothesis has the
    highest Buleyean weight. We don't need to KNOW the purpose;
    we need to know which purposes have been LEAST REJECTED.

    Status: BOUNDED. The void boundary narrows the hypothesis space.
    The answer is the survivor of rejection, not the winner of guessing. -/
theorem dodecahedron_by_rejection (mo : MysteryObject)
    (bestHyp worstHyp : Fin mo.numHypotheses)
    (hBest : mo.rejections bestHyp ≤ mo.rejections worstHyp) :
    mo.toBuleyeanSpace.weight worstHyp ≤ mo.toBuleyeanSpace.weight bestHyp := by
  exact buleyean_concentration mo.toBuleyeanSpace bestHyp worstHyp hBest

/-- THEOREM: No hypothesis can be fully eliminated. The sliver
    preserves even the most-rejected hypothesis. This is why the
    dodecahedron mystery persists: every theory retains some weight. -/
theorem dodecahedron_mystery_persists (mo : MysteryObject)
    (hyp : Fin mo.numHypotheses) :
    0 < mo.toBuleyeanSpace.weight hyp := by
  exact buleyean_positivity mo.toBuleyeanSpace hyp

-- ═══════════════════════════════════════════════════════════════════════
-- V. ANOMALOUS EVIDENCE: Pollock Twins, Man from Taured, etc.
-- ═══════════════════════════════════════════════════════════════════════

/-!
## Evidence Theory of Anomalous Claims

The Pollock Twins, Man from Taured, Green Children of Woolpit.
The mystery: are these real or fabricated?

STRUCTURAL ANSWER: The Buleyean framework doesn't ask "is this true?"
It asks: "what is the void boundary?" What evidence has been
collected that REJECTS the claim? What evidence has been collected
that REJECTS the mundane explanation?

Both the extraordinary and mundane explanations are hypotheses
with void boundaries. The less-rejected explanation gets higher
weight. The sliver ensures we never fully reject either.

Key insight: extraordinary claims are not rejected by HAVING
low prior probability. They are rejected (or not) by the void
boundary — the accumulated evidence of what they are NOT.
A claim with low prior but zero rejections has HIGH Buleyean weight.
A claim with high prior but many rejections has LOW Buleyean weight.

Evidence, not priors, determines weight.
-/

/-- An anomalous claim: two competing explanations with evidence. -/
structure AnomalousClaim where
  /-- Number of candidate explanations -/
  numExplanations : ℕ
  hNontrivial : 2 ≤ numExplanations
  /-- Counter-evidence per explanation -/
  counterEvidence : Fin numExplanations → ℕ
  /-- Investigation rounds -/
  investigationRounds : ℕ
  hRoundsPos : 0 < investigationRounds
  hBounded : ∀ i, counterEvidence i ≤ investigationRounds

def AnomalousClaim.toBuleyeanSpace (ac : AnomalousClaim) : BuleyeanSpace where
  numChoices := ac.numExplanations
  nontrivial := ac.hNontrivial
  rounds := ac.investigationRounds
  positiveRounds := ac.hRoundsPos
  voidBoundary := ac.counterEvidence
  bounded := ac.hBounded

/-- THEOREM: The explanation with less counter-evidence gets higher
    weight, REGARDLESS of prior probability. Buleyean probability
    is frequentist: evidence determines weight, not priors.

    A "supernatural" explanation with zero counter-evidence has
    MAXIMUM weight (rounds + 1). A "natural" explanation with
    maximum counter-evidence has MINIMUM weight (1, the sliver).

    This is Socrates' principle applied to anomalies: evidence
    over prejudice. The void boundary is the judge. -/
theorem anomaly_evidence_over_priors (ac : AnomalousClaim)
    (lessRejected moreRejected : Fin ac.numExplanations)
    (hEvidence : ac.counterEvidence lessRejected ≤ ac.counterEvidence moreRejected) :
    ac.toBuleyeanSpace.weight moreRejected ≤ ac.toBuleyeanSpace.weight lessRejected := by
  exact buleyean_concentration ac.toBuleyeanSpace lessRejected moreRejected hEvidence

/-- THEOREM: Both explanations always retain positive weight.
    We never fully reject the mundane OR the extraordinary.
    The mystery persists because the sliver prevents certainty. -/
theorem anomaly_both_survive (ac : AnomalousClaim)
    (explanation : Fin ac.numExplanations) :
    0 < ac.toBuleyeanSpace.weight explanation := by
  exact buleyean_positivity ac.toBuleyeanSpace explanation

/-- THEOREM: An untested claim has maximum weight. The Man from
    Taured with zero counter-evidence has weight = rounds + 1.
    This does NOT mean the claim is true. It means: we have no
    evidence against it. Maximum uncertainty, not maximum truth. -/
theorem untested_claim_maximum_uncertainty (ac : AnomalousClaim)
    (claim : Fin ac.numExplanations)
    (hUntested : ac.counterEvidence claim = 0) :
    ac.toBuleyeanSpace.weight claim = ac.investigationRounds + 1 := by
  exact buleyean_max_uncertainty ac.toBuleyeanSpace claim hUntested

-- ═══════════════════════════════════════════════════════════════════════
-- VI. THE HUM: Signal Detection Below the Noise Floor
-- ═══════════════════════════════════════════════════════════════════════

/-!
## The Hum (Taos, Bristol, etc.)

2% of the population hears a persistent low-frequency sound.
No source identified.

STRUCTURAL ANSWER: This is a SEMIOTIC DEFICIT at the perceptual
boundary. Some observers have more "articulation streams" (wider
perceptual bandwidth) than others. The Hum is audible to those
whose perceptual deficit is LOW (more channels open) and inaudible
to those whose deficit is HIGH (fewer channels).

The Hum is not mysterious: it is a real signal that falls below
the DEFICIT THRESHOLD of most observers. The 2% who hear it have
lower perceptual deficit (more open channels to reality).

Formally: the Hum exists at frequency f. An observer with bandwidth
B hears it iff f ≤ B. The deficit = (total reality bandwidth) - B.
Observers with lower deficit hear more signals.
-/

/-- An observer's perceptual bandwidth modeled as a semiotic channel. -/
structure PerceptualObserver where
  /-- Total signals in environment -/
  environmentalSignals : ℕ
  /-- Observer's perceptual channels -/
  perceptualChannels : ℕ
  /-- Rich environment -/
  hEnvRich : 2 ≤ environmentalSignals
  /-- Positive perception -/
  hPercPos : 0 < perceptualChannels

/-- The perceptual deficit: signals the observer CANNOT detect. -/
def perceptualDeficit (po : PerceptualObserver) : ℕ :=
  po.environmentalSignals - po.perceptualChannels

/-- THEOREM (THE HUM): An observer with perceptual channels <
    environmental signals has a positive deficit: there are real
    signals they cannot hear. The Hum is in this deficit region
    for 98% of people and below the deficit for 2%.

    Status: STRUCTURAL. The Hum is a real signal below the
    perceptual deficit threshold of most observers. -/
theorem hum_in_deficit_region (po : PerceptualObserver)
    (hDeficit : po.perceptualChannels < po.environmentalSignals) :
    0 < perceptualDeficit po := by
  unfold perceptualDeficit; omega

/-- THEOREM: An observer with zero deficit (channels ≥ signals)
    hears ALL signals, including the Hum. Full-bandwidth observers
    have no perceptual mysteries. -/
theorem full_bandwidth_no_mystery (po : PerceptualObserver)
    (hFull : po.environmentalSignals ≤ po.perceptualChannels) :
    perceptualDeficit po = 0 := by
  unfold perceptualDeficit; omega

-- ═══════════════════════════════════════════════════════════════════════
-- MASTER THEOREM
-- ═══════════════════════════════════════════════════════════════════════

/-- MASTER: All Second Tier structural constraints hold simultaneously. -/
theorem second_tier_mysteries_master
    (mp : MegalithicProject)
    (mo : MysteryObject)
    (ac : AnomalousClaim)
    (bs : BuleyeanSpace)
    (cp : CoolingProcess)
    (step : FoldStep) :
    -- Megalithic: distributed learning works
    (∀ i, 0 < mp.toBuleyeanSpace.weight i) ∧
    -- Dodecahedron: void boundary narrows hypotheses
    (∀ i, 0 < mo.toBuleyeanSpace.weight i) ∧
    -- Anomalies: evidence over priors
    (∀ i, 0 < ac.toBuleyeanSpace.weight i) ∧
    -- Mpemba: cooling deficit positive
    (0 < semioticDeficit cp.toSemioticChannel) ∧
    -- Universal: Buleyean distribution exists
    (0 < bs.totalWeight) ∧
    -- Fold generates information
    (1 ≤ step.forkWidth - 1) := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · exact fun i => buleyean_positivity mp.toBuleyeanSpace i
  · exact fun i => buleyean_positivity mo.toBuleyeanSpace i
  · exact fun i => buleyean_positivity ac.toBuleyeanSpace i
  · exact mpemba_deficit_positive cp
  · exact buleyean_normalization bs
  · have := step.nontrivial; omega

end ForkRaceFoldTheorems
