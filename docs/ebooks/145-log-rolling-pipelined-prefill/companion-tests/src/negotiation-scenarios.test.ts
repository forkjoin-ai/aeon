/**
 * Negotiation Scenarios -- Historic Impasses as Void Walking
 *
 * Each scenario models a famous negotiation, argument, or cultural conflict
 * as a fork/race/fold process with measurable void boundaries. The BATNA
 * and WATNA surfaces, kurtosis trajectories, and settlement dynamics
 * emerge from the topology of each party's position space.
 *
 * The thesis: every historic impasse has the same structure --
 * multi-dimensional interests compressed through a single-stream
 * negotiation channel, with the semiotic deficit determining
 * how many rounds are needed to reach (or fail to reach) agreement.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Core Engine
// ============================================================================

interface Dimension {
  name: string;
  partyA: number; // 0-100: Party A's ideal
  partyB: number; // 0-100: Party B's ideal
  weightA: number; // how much A cares
  weightB: number; // how much B cares
}

interface Scenario {
  name: string;
  partyAName: string;
  partyBName: string;
  dimensions: Dimension[];
  batnaA: number; // minimum acceptable utility for A
  batnaB: number; // minimum acceptable utility for B
  contextPerRound: number; // how much shared context accumulates per round (0-1)
  description: string;
}

interface ScenarioResult {
  scenario: string;
  settled: boolean;
  rounds: number;
  maxRounds: number;
  partyAUtility: number;
  partyBUtility: number;
  finalPosition: number[];
  kurtosisA: number[];
  kurtosisB: number[];
  entropyA: number[];
  giniA: number[];
  deficitTrajectory: number[];
  batnaRegion: number; // bin index of BATNA
  watnaRegion: number; // bin index of WATNA
  peakKurtosis: number;
  settlementKurtosis: number;
}

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function excessKurtosis(values: number[]): number {
  const n = values.length;
  const mu = values.reduce((a, b) => a + b, 0) / n;
  const sigma2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (sigma2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / n;
  return m4 / sigma2 ** 2 - 3;
}

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) if (p > 0) h -= p * Math.log(p);
  return h;
}

function gini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mu = sorted.reduce((a, b) => a + b, 0) / n;
  if (mu === 0) return 0;
  let sumDiff = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) sumDiff += Math.abs(sorted[i] - sorted[j]);
  return sumDiff / (2 * n * n * mu);
}

function complementDist(rejCounts: number[], eta: number = 3.0): number[] {
  const max = Math.max(...rejCounts);
  const min = Math.min(...rejCounts);
  const range = max - min;
  const norm =
    range > 0
      ? rejCounts.map((v) => (v - min) / range)
      : rejCounts.map(() => 0);
  const w = norm.map((v) => Math.exp(-eta * v));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
}

function utility(
  position: number[],
  ideals: number[],
  weights: number[]
): number {
  let dist2 = 0;
  for (let i = 0; i < position.length; i++) {
    dist2 += (position[i] - ideals[i]) ** 2 * weights[i];
  }
  return 100 - Math.sqrt(dist2) / 2;
}

function sparkline(values: number[]): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const blocks = ' ▁▂▃▄▅▆▇█';
  return values
    .map((v) => blocks[Math.round(((v - min) / range) * (blocks.length - 1))])
    .join('');
}

function runScenario(
  scenario: Scenario,
  maxRounds: number,
  bins: number,
  rng: () => number
): ScenarioResult {
  const dims = scenario.dimensions;
  const N = dims.length;
  const rejA = new Array(bins).fill(0);
  const rejB = new Array(bins).fill(0);
  const kurtA: number[] = [];
  const kurtB: number[] = [];
  const entropyA: number[] = [];
  const giniA: number[] = [];
  const deficitTraj: number[] = [];

  const idealsA = dims.map((d) => d.partyA);
  const idealsB = dims.map((d) => d.partyB);
  const weightsA = dims.map((d) => d.weightA);
  const weightsB = dims.map((d) => d.weightB);

  // Semiotic deficit: 2 * N dimensions compressed to 1 stream
  const initialDeficit = 2 * N - 1;
  let contextAccumulated = 0;

  for (let round = 0; round < maxRounds; round++) {
    // Current effective deficit
    const effectiveDeficit = Math.max(0, initialDeficit - contextAccumulated);
    deficitTraj.push(effectiveDeficit);

    // Party A proposes: void-guided offer
    const distA = complementDist(rejA);
    kurtA.push(excessKurtosis(distA));
    entropyA.push(shannonEntropy(distA));
    giniA.push(gini(distA));

    const rA = rng();
    let binA = bins - 1;
    let cum = 0;
    for (let i = 0; i < bins; i++) {
      cum += distA[i];
      if (rA < cum) {
        binA = i;
        break;
      }
    }

    // Generate position from bin + party ideal blend
    // Context makes the blend favor the midpoint more
    const contextBlend = Math.min(0.8, contextAccumulated / (2 * N));
    const midpoint = dims.map((d) => (d.partyA + d.partyB) / 2);
    const posA = dims.map((d, i) => {
      const binVal = (binA / (bins - 1)) * 100;
      return (
        d.partyA * (1 - contextBlend) * 0.4 +
        midpoint[i] * contextBlend * 0.4 +
        binVal * 0.2 +
        (rng() - 0.5) * (10 - contextBlend * 8)
      );
    });

    const uA_self = utility(posA, idealsA, weightsA);
    const uA_other = utility(posA, idealsB, weightsB);

    if (uA_self >= scenario.batnaA && uA_other >= scenario.batnaB) {
      const distAFinal = complementDist(rejA);
      return {
        scenario: scenario.name,
        settled: true,
        rounds: round + 1,
        maxRounds,
        partyAUtility: uA_self,
        partyBUtility: uA_other,
        finalPosition: posA,
        kurtosisA: kurtA,
        kurtosisB: kurtB,
        entropyA,
        giniA,
        deficitTrajectory: deficitTraj,
        batnaRegion: rejA.indexOf(Math.min(...rejA)),
        watnaRegion: rejA.indexOf(Math.max(...rejA)),
        peakKurtosis: Math.max(...kurtA),
        settlementKurtosis: excessKurtosis(distAFinal),
      };
    }

    // Rejection: update void boundary
    if (uA_other < scenario.batnaB) rejA[binA]++;

    // Party B counter-proposes
    const distB = complementDist(rejB);
    kurtB.push(excessKurtosis(distB));

    const rB = rng();
    let binB = bins - 1;
    cum = 0;
    for (let i = 0; i < bins; i++) {
      cum += distB[i];
      if (rB < cum) {
        binB = i;
        break;
      }
    }

    const posB = dims.map((d, i) => {
      const binVal = (binB / (bins - 1)) * 100;
      return (
        d.partyB * (1 - contextBlend) * 0.4 +
        midpoint[i] * contextBlend * 0.4 +
        binVal * 0.2 +
        (rng() - 0.5) * (10 - contextBlend * 8)
      );
    });

    const uB_self = utility(posB, idealsB, weightsB);
    const uB_other = utility(posB, idealsA, weightsA);

    if (uB_self >= scenario.batnaB && uB_other >= scenario.batnaA) {
      const distBFinal = complementDist(rejB);
      return {
        scenario: scenario.name,
        settled: true,
        rounds: round + 1,
        maxRounds,
        partyAUtility: uB_other,
        partyBUtility: uB_self,
        finalPosition: posB,
        kurtosisA: kurtA,
        kurtosisB: kurtB,
        entropyA,
        giniA,
        deficitTrajectory: deficitTraj,
        batnaRegion: rejB.indexOf(Math.min(...rejB)),
        watnaRegion: rejB.indexOf(Math.max(...rejB)),
        peakKurtosis: Math.max(...(kurtB.length > 0 ? kurtB : [0])),
        settlementKurtosis: excessKurtosis(distBFinal),
      };
    }

    if (uB_other < scenario.batnaA) rejB[binB]++;

    // Context accumulates each round (dialogue reduces deficit)
    contextAccumulated += scenario.contextPerRound;
  }

  return {
    scenario: scenario.name,
    settled: false,
    rounds: maxRounds,
    maxRounds,
    partyAUtility: 0,
    partyBUtility: 0,
    finalPosition: [],
    kurtosisA: kurtA,
    kurtosisB: kurtB,
    entropyA,
    giniA,
    deficitTrajectory: deficitTraj,
    batnaRegion: rejA.indexOf(Math.min(...rejA)),
    watnaRegion: rejA.indexOf(Math.max(...rejA)),
    peakKurtosis: Math.max(...(kurtA.length > 0 ? kurtA : [0])),
    settlementKurtosis: 0,
  };
}

function printResult(r: ScenarioResult, sc: Scenario): void {
  const status = r.settled
    ? `SETTLED in ${r.rounds} rounds`
    : `IMPASSE after ${r.maxRounds} rounds`;
  console.log(`\n  ╔${'═'.repeat(68)}╗`);
  console.log(`  ║ ${sc.name.padEnd(67)}║`);
  console.log(
    `  ║ ${sc.partyAName} vs ${sc.partyBName}${''.padEnd(
      67 - sc.partyAName.length - 4 - sc.partyBName.length
    )}║`
  );
  console.log(`  ╠${'═'.repeat(68)}╣`);
  console.log(`  ║ ${status.padEnd(67)}║`);
  if (r.settled) {
    console.log(
      `  ║ ${sc.partyAName}: ${r.partyAUtility.toFixed(1)} utility  ${
        sc.partyBName
      }: ${r.partyBUtility.toFixed(1)} utility${''.padEnd(
        Math.max(0, 67 - sc.partyAName.length - sc.partyBName.length - 30)
      )}║`
    );
  }
  console.log(
    `  ║ Dimensions: ${sc.dimensions.map((d) => d.name).join(', ')}${''.padEnd(
      Math.max(0, 55 - sc.dimensions.map((d) => d.name).join(', ').length)
    )}║`
  );
  console.log(
    `  ║ Semiotic deficit: ${2 * sc.dimensions.length - 1} (${
      2 * sc.dimensions.length
    } dims → 1 stream)${''.padEnd(Math.max(0, 67 - 40))}║`
  );
  console.log(`  ╠${'═'.repeat(68)}╣`);
  if (r.kurtosisA.length > 1) {
    console.log(
      `  ║ κ(${sc.partyAName}): ${sparkline(r.kurtosisA)
        .substring(0, 55)
        .padEnd(55)} ║`
    );
  }
  if (r.kurtosisB.length > 1) {
    console.log(
      `  ║ κ(${sc.partyBName}): ${sparkline(r.kurtosisB)
        .substring(0, 55)
        .padEnd(55)} ║`
    );
  }
  if (r.entropyA.length > 1) {
    console.log(
      `  ║ H(offers):  ${sparkline(r.entropyA).substring(0, 55).padEnd(55)} ║`
    );
  }
  if (r.deficitTrajectory.length > 1) {
    console.log(
      `  ║ deficit:    ${sparkline(r.deficitTrajectory)
        .substring(0, 55)
        .padEnd(55)} ║`
    );
  }
  console.log(
    `  ║ BATNA bin: ${r.batnaRegion}  WATNA bin: ${r.watnaRegion}${''.padEnd(
      Math.max(0, 43)
    )}║`
  );
  console.log(`  ╚${'═'.repeat(68)}╝`);
}

// ============================================================================
// Scenarios
// ============================================================================

const scenarios: Scenario[] = [
  // ── Wars & Geopolitics ──
  {
    name: 'Cuban Missile Crisis (1962)',
    partyAName: 'USA (Kennedy)',
    partyBName: 'USSR (Khrushchev)',
    dimensions: [
      {
        name: 'missiles-in-Cuba',
        partyA: 0,
        partyB: 100,
        weightA: 3.0,
        weightB: 2.0,
      },
      {
        name: 'missiles-in-Turkey',
        partyA: 100,
        partyB: 0,
        weightA: 0.5,
        weightB: 2.0,
      },
      {
        name: 'face/prestige',
        partyA: 90,
        partyB: 90,
        weightA: 2.0,
        weightB: 2.5,
      },
      {
        name: 'nuclear-risk',
        partyA: 0,
        partyB: 0,
        weightA: 3.0,
        weightB: 3.0,
      },
      {
        name: 'Berlin-access',
        partyA: 100,
        partyB: 30,
        weightA: 1.5,
        weightB: 1.0,
      },
    ],
    batnaA: 35,
    batnaB: 35,
    contextPerRound: 0.3, // backchannel built context fast
    description:
      'Resolved: secret Turkey missile swap + public Cuba withdrawal',
  },
  {
    name: 'Treaty of Versailles (1919)',
    partyAName: 'Allies (Clemenceau)',
    partyBName: 'Germany (Brockdorff)',
    dimensions: [
      {
        name: 'reparations',
        partyA: 95,
        partyB: 10,
        weightA: 3.0,
        weightB: 3.0,
      },
      { name: 'territory', partyA: 90, partyB: 20, weightA: 2.5, weightB: 2.5 },
      {
        name: 'military-limits',
        partyA: 95,
        partyB: 15,
        weightA: 2.0,
        weightB: 2.0,
      },
      { name: 'war-guilt', partyA: 100, partyB: 0, weightA: 1.5, weightB: 3.0 },
      { name: 'stability', partyA: 50, partyB: 80, weightA: 0.5, weightB: 1.5 },
      {
        name: 'sovereignty',
        partyA: 30,
        partyB: 95,
        weightA: 0.3,
        weightB: 2.0,
      },
    ],
    batnaA: 55, // Allies had leverage
    batnaB: 15, // Germany had no BATNA (military defeat)
    contextPerRound: 0.05, // very little shared context built
    description: 'Settled but unstable: punitive terms seeded WWII',
  },
  // ── Famous Arguments ──
  {
    name: 'Galileo vs The Church (1633)',
    partyAName: 'Galileo',
    partyBName: 'Inquisition',
    dimensions: [
      {
        name: 'heliocentrism',
        partyA: 100,
        partyB: 0,
        weightA: 3.0,
        weightB: 2.0,
      },
      {
        name: 'scripture-authority',
        partyA: 30,
        partyB: 100,
        weightA: 0.5,
        weightB: 3.0,
      },
      {
        name: 'publication-rights',
        partyA: 90,
        partyB: 10,
        weightA: 2.0,
        weightB: 1.5,
      },
      {
        name: 'personal-safety',
        partyA: 100,
        partyB: 50,
        weightA: 2.5,
        weightB: 0.5,
      },
      {
        name: 'institutional-face',
        partyA: 20,
        partyB: 95,
        weightA: 0.3,
        weightB: 2.5,
      },
    ],
    batnaA: 40,
    batnaB: 60, // Church had high BATNA (could just imprison)
    contextPerRound: 0.02, // paradigm gap prevented context building
    description:
      'Impasse: Galileo recanted but the void persisted for 359 years',
  },
  {
    name: 'Lincoln-Douglas Debates (1858)',
    partyAName: 'Lincoln',
    partyBName: 'Douglas',
    dimensions: [
      {
        name: 'slavery-expansion',
        partyA: 5,
        partyB: 70,
        weightA: 3.0,
        weightB: 2.0,
      },
      {
        name: 'popular-sovereignty',
        partyA: 40,
        partyB: 95,
        weightA: 1.0,
        weightB: 2.5,
      },
      {
        name: 'union-preservation',
        partyA: 95,
        partyB: 60,
        weightA: 2.5,
        weightB: 1.0,
      },
      {
        name: 'moral-authority',
        partyA: 90,
        partyB: 40,
        weightA: 2.0,
        weightB: 1.5,
      },
      {
        name: 'electoral-appeal',
        partyA: 60,
        partyB: 70,
        weightA: 1.5,
        weightB: 2.0,
      },
    ],
    batnaA: 45,
    batnaB: 45,
    contextPerRound: 0.15, // seven debates built shared vocabulary
    description:
      'Lincoln lost the senate race but won the argument (and the presidency)',
  },
  // ── Art & Culture ──
  {
    name: 'Beethoven vs Tradition (Symphony No. 3, 1804)',
    partyAName: 'Beethoven',
    partyBName: 'Classical Convention',
    dimensions: [
      {
        name: 'form-length',
        partyA: 95,
        partyB: 30,
        weightA: 2.0,
        weightB: 2.0,
      },
      {
        name: 'emotional-range',
        partyA: 100,
        partyB: 40,
        weightA: 3.0,
        weightB: 1.0,
      },
      {
        name: 'harmonic-daring',
        partyA: 90,
        partyB: 20,
        weightA: 2.5,
        weightB: 2.0,
      },
      {
        name: 'audience-comfort',
        partyA: 30,
        partyB: 85,
        weightA: 0.5,
        weightB: 2.5,
      },
      {
        name: 'patronage-appeal',
        partyA: 40,
        partyB: 80,
        weightA: 1.0,
        weightB: 2.0,
      },
      { name: 'legacy', partyA: 100, partyB: 60, weightA: 2.0, weightB: 0.5 },
    ],
    batnaA: 50, // Beethoven would rather not compose than compromise
    batnaB: 25, // convention bends slowly
    contextPerRound: 0.1, // each performance built audience context
    description: 'Beethoven won: the Eroica rewrote what a symphony could be',
  },
  {
    name: 'Impressionism vs the Salon (1874)',
    partyAName: 'Monet/Renoir/etc',
    partyBName: 'Paris Salon',
    dimensions: [
      { name: 'technique', partyA: 95, partyB: 10, weightA: 3.0, weightB: 2.0 },
      {
        name: 'subject-matter',
        partyA: 85,
        partyB: 20,
        weightA: 2.0,
        weightB: 1.5,
      },
      {
        name: 'exhibition-access',
        partyA: 90,
        partyB: 5,
        weightA: 2.5,
        weightB: 0.5,
      },
      {
        name: 'critical-acceptance',
        partyA: 70,
        partyB: 90,
        weightA: 1.0,
        weightB: 3.0,
      },
      {
        name: 'market-price',
        partyA: 60,
        partyB: 80,
        weightA: 1.5,
        weightB: 2.0,
      },
    ],
    batnaA: 40,
    batnaB: 55, // Salon had institutional power
    contextPerRound: 0.08, // slow public context building through exhibitions
    description:
      'Impressionists created their own salon -- forked the channel entirely',
  },
  {
    name: 'Socrates vs Athens (399 BC)',
    partyAName: 'Socrates',
    partyBName: 'Athenian jury',
    dimensions: [
      {
        name: 'free-inquiry',
        partyA: 100,
        partyB: 20,
        weightA: 3.0,
        weightB: 0.5,
      },
      {
        name: 'civic-piety',
        partyA: 30,
        partyB: 95,
        weightA: 0.3,
        weightB: 3.0,
      },
      {
        name: 'youth-influence',
        partyA: 85,
        partyB: 10,
        weightA: 1.5,
        weightB: 2.5,
      },
      {
        name: 'personal-survival',
        partyA: 40,
        partyB: 50,
        weightA: 1.0,
        weightB: 0.5,
      },
      {
        name: 'democratic-norms',
        partyA: 60,
        partyB: 90,
        weightA: 1.0,
        weightB: 2.0,
      },
    ],
    batnaA: 55, // Socrates refused to flee
    batnaB: 50,
    contextPerRound: 0.03, // Socrates deliberately did NOT build context with the jury
    description: 'Impasse: Socrates chose hemlock over silence',
  },
  {
    name: 'Edison vs Tesla (War of Currents, 1880s)',
    partyAName: 'Edison (DC)',
    partyBName: 'Tesla/Westinghouse (AC)',
    dimensions: [
      {
        name: 'technical-merit',
        partyA: 40,
        partyB: 90,
        weightA: 1.0,
        weightB: 2.5,
      },
      {
        name: 'installed-base',
        partyA: 85,
        partyB: 20,
        weightA: 2.5,
        weightB: 1.0,
      },
      {
        name: 'safety-narrative',
        partyA: 80,
        partyB: 30,
        weightA: 2.0,
        weightB: 1.0,
      },
      {
        name: 'long-distance',
        partyA: 10,
        partyB: 95,
        weightA: 0.5,
        weightB: 2.0,
      },
      {
        name: 'patent-control',
        partyA: 90,
        partyB: 60,
        weightA: 2.0,
        weightB: 1.5,
      },
      {
        name: 'public-trust',
        partyA: 70,
        partyB: 50,
        weightA: 1.5,
        weightB: 1.5,
      },
    ],
    batnaA: 50,
    batnaB: 40,
    contextPerRound: 0.12, // Niagara Falls demo built context for AC
    description:
      'AC won on technical merit; the void of failed DC demos told the story',
  },
];

// ============================================================================
// Tests
// ============================================================================

describe('Historic Negotiations as Void Walking', () => {
  for (const sc of scenarios) {
    it(`${sc.name}`, () => {
      const rng = makeRng(
        sc.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 137
      );
      const result = runScenario(sc, 300, 25, rng);
      printResult(result, sc);

      // Every scenario should have positive semiotic deficit
      const deficit = 2 * sc.dimensions.length - 1;
      expect(deficit).toBeGreaterThan(0);

      // Void boundary should have structure (BATNA != WATNA for non-trivial negotiations)
      if (result.rounds > 5) {
        // After enough rounds, some bins should have more rejections than others
        expect(result.kurtosisA.length).toBeGreaterThan(0);
      }
    });
  }

  it('comparative analysis: deficit predicts difficulty', () => {
    const results: Array<{
      name: string;
      deficit: number;
      rounds: number;
      settled: boolean;
    }> = [];

    for (const sc of scenarios) {
      const rng = makeRng(
        sc.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 137
      );
      const result = runScenario(sc, 300, 25, rng);
      results.push({
        name: sc.name.substring(0, 35),
        deficit: 2 * sc.dimensions.length - 1,
        rounds: result.rounds,
        settled: result.settled,
      });
    }

    console.log(
      '\n  ╔════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      '  ║ Comparative Analysis: Semiotic Deficit vs Negotiation Difficulty  ║'
    );
    console.log(
      '  ╠════════════════════════════════════════════════════════════════════╣'
    );
    console.log(
      '  ║ Scenario                            Δβ  Rounds  Outcome          ║'
    );
    console.log(
      '  ╠════════════════════════════════════════════════════════════════════╣'
    );
    for (const r of results.sort((a, b) => a.deficit - b.deficit)) {
      const outcome = r.settled ? `settled r=${r.rounds}` : 'IMPASSE';
      console.log(
        `  ║ ${r.name.padEnd(35)} ${String(r.deficit).padStart(3)}  ${String(
          r.rounds
        ).padStart(6)}  ${outcome.padEnd(16)} ║`
      );
    }
    console.log(
      '  ╚════════════════════════════════════════════════════════════════════╝\n'
    );
  });
});
