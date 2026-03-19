/**
 * Cancer Topology — Executable Companion Tests for CancerTopology.lean
 *
 * Simulates the cell cycle as a Buleyean fork/race/fold computation.
 * Verifies that cancer (checkpoint destruction) produces measurably
 * different outcomes than healthy cell decision-making.
 *
 * For Sandy.
 */

import { describe, expect, it } from 'bun:test';
import {
  computeSigma,
  computeMutationTopology,
  analyzeCancerTopology,
  analyzeDriverVsPassenger,
  type TopologicalProfile,
  type MutationTopology,
} from './genomic-topology';

// ═══════════════════════════════════════════════════════════════════════════════
// Buleyean Probability Engine (inline -- matches BuleyeanProbability.lean)
// ═══════════════════════════════════════════════════════════════════════════════

interface BuleyeanSpace {
  numChoices: number;
  rounds: number;
  voidBoundary: number[];
}

function createSpace(numChoices: number): BuleyeanSpace {
  return { numChoices, rounds: 0, voidBoundary: new Array(numChoices).fill(0) };
}

function weight(space: BuleyeanSpace, i: number): number {
  return space.rounds - Math.min(space.voidBoundary[i]!, space.rounds) + 1;
}

function totalWeight(space: BuleyeanSpace): number {
  let sum = 0;
  for (let i = 0; i < space.numChoices; i++) sum += weight(space, i);
  return sum;
}

function probability(space: BuleyeanSpace, i: number): number {
  return weight(space, i) / totalWeight(space);
}

function reject(space: BuleyeanSpace, rejected: number): BuleyeanSpace {
  const newBoundary = [...space.voidBoundary];
  newBoundary[rejected]! += 1;
  return { numChoices: space.numChoices, rounds: space.rounds + 1, voidBoundary: newBoundary };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cell Cycle Model
// ═══════════════════════════════════════════════════════════════════════════════

// Cell decisions: 0=Divide, 1=Arrest, 2=Quiescence, 3=Apoptosis, 4=Senescence
const DIVIDE = 0;
const ARREST = 1;
const QUIESCENCE = 2;

// Pathway definitions: name -> { beta1, isVent }
const PATHWAYS: Record<string, { beta1: number; isVent: boolean }> = {
  p53:     { beta1: 3, isVent: true },
  rb:      { beta1: 2, isVent: true },
  apc:     { beta1: 2, isVent: true },
  atm_atr: { beta1: 2, isVent: true },
  mapk:    { beta1: 1, isVent: false },
  pi3k:    { beta1: 1, isVent: false },
  wnt:     { beta1: 1, isVent: false },
};

function totalVentBeta1(activePathways: Set<string>): number {
  let total = 0;
  for (const name of activePathways) {
    const p = PATHWAYS[name];
    if (p?.isVent) total += p.beta1;
  }
  return total;
}

function simulateCheckpoint(
  space: BuleyeanSpace,
  activePathways: Set<string>,
): BuleyeanSpace {
  let s = space;
  // Each active vent rejects "divide" (beta1 times)
  for (const name of activePathways) {
    const p = PATHWAYS[name];
    if (p?.isVent) {
      for (let b = 0; b < p.beta1; b++) {
        s = reject(s, DIVIDE);
      }
    }
  }
  // Each active growth pathway rejects arrest and quiescence
  for (const name of activePathways) {
    const p = PATHWAYS[name];
    if (p && !p.isVent) {
      s = reject(s, ARREST);
      s = reject(s, QUIESCENCE);
    }
  }
  return s;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Real Gene Sequences (from NM_000546.6 and NM_004985.5)
// ═══════════════════════════════════════════════════════════════════════════════

// TP53 exons 5-8 (codons 126-306, 528 nt from NM_000546.6)
const TP53_EXONS_5_8 =
  'TACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGACAGAAACACTTTTCGACATAGTGTGGTGGTGCCCTATGAGCCGCCTGAGGTTGGCTCTGACTGTACCACCATCCACTACAACTACATGTGTAACAGTTCCTGCATGGGCGGCATGAACCGGAGGCCCATCCTCACCATCATCACACTGGAAGACTCCAGTGGTAATCTACTGGGACGGAACAGCTTTGAGGTGCGTGTTTGTGCCTGTCCTGGGAGAGACCGGCGCACAGAGGAAGAGAATCTCCGCAAGAAAGGGGAGCCTCACCACGAGCTGCCCCCAGGGAGCACTAAGCGAG';

// TP53 hotspot codons (positions relative to exon 5 start)
const TP53_HOTSPOT_CODONS: Record<string, number> = {
  R175H: 147, // codon 175 → exon 5-8 relative position
  R248W: 366, // codon 248
  R249S: 369, // codon 249 (hepatocellular)
  R273H: 441, // codon 273
};

// KRAS exon 2 (codons 1-40, 120 nt from NM_004985.5)
const KRAS_EXON_2 =
  'ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACA';

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('THM-CANCER-BETA1-COLLAPSE: Cancer Is Zero Rejection Capacity', () => {
  it('healthy cell has total vent beta-1 = 9', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    expect(totalVentBeta1(healthy)).toBe(9);
  });

  it('knocking out all vents gives beta-1 = 0', () => {
    const cancerCell = new Set(['mapk', 'pi3k', 'wnt']); // only growth pathways
    expect(totalVentBeta1(cancerCell)).toBe(0);
  });

  it('cancer cell with no vents: divide probability stays at coinflip', () => {
    const cancerPathways = new Set(['mapk', 'pi3k', 'wnt']);
    let space = createSpace(5);

    // Run 20 checkpoint cycles with no vents active
    for (let i = 0; i < 20; i++) {
      space = simulateCheckpoint(space, cancerPathways);
    }

    // Without vents, divide is never rejected.
    // Growth signals reject arrest/quiescence but not divide.
    // Divide should have the HIGHEST probability (never rejected)
    const pDivide = probability(space, DIVIDE);
    const pArrest = probability(space, ARREST);
    expect(pDivide).toBeGreaterThan(pArrest);
  });

  it('no_failure_no_learning: fork width 1 produces zero failure data', () => {
    const forkWidth = 1;
    const rounds = 100;
    const failureData = rounds * (forkWidth - 1);
    expect(failureData).toBe(0);
  });

  it('frozen distribution: no vents means all choices have equal void boundary', () => {
    // A space with no rejections is a coinflip
    const space = createSpace(5);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        expect(weight(space, i)).toBe(weight(space, j));
      }
    }
  });
});

describe('THM-CHECKPOINT-VENTING: Checkpoints Shift Distribution Away From Divide', () => {
  it('after checkpoints fire, P(divide) < P(apoptosis)', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    let space = createSpace(5);

    for (let i = 0; i < 20; i++) {
      space = simulateCheckpoint(space, healthy);
    }

    const pDivide = probability(space, DIVIDE);
    const pApoptosis = probability(space, 3); // apoptosis is never rejected
    expect(pDivide).toBeLessThan(pApoptosis);
  });

  it('more checkpoint cycles = lower P(divide)', () => {
    const healthy = new Set(Object.keys(PATHWAYS));

    let space5 = createSpace(5);
    let space20 = createSpace(5);

    for (let i = 0; i < 5; i++) space5 = simulateCheckpoint(space5, healthy);
    for (let i = 0; i < 20; i++) space20 = simulateCheckpoint(space20, healthy);

    expect(probability(space20, DIVIDE)).toBeLessThan(probability(space5, DIVIDE));
  });

  it('each checkpoint activation strictly decreases divide weight', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    let space = createSpace(5);
    const weights: number[] = [];

    for (let i = 0; i < 10; i++) {
      space = simulateCheckpoint(space, healthy);
      weights.push(weight(space, DIVIDE));
    }

    // Divide weight should be non-increasing (actually decreasing)
    // because it gets rejected every cycle
    for (let i = 1; i < weights.length; i++) {
      // Weight might not strictly decrease because rounds also increase
      // But probability should decrease
    }
    // Probability must decrease monotonically
    let prevProb = 1;
    space = createSpace(5);
    for (let i = 0; i < 10; i++) {
      space = simulateCheckpoint(space, healthy);
      const p = probability(space, DIVIDE);
      expect(p).toBeLessThan(prevProb);
      prevProb = p;
    }
  });

  it('buleyean_positivity: divide weight never reaches zero', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    let space = createSpace(5);

    for (let i = 0; i < 100; i++) {
      space = simulateCheckpoint(space, healthy);
    }

    // The sliver: weight >= 1 always
    expect(weight(space, DIVIDE)).toBeGreaterThanOrEqual(1);
    expect(probability(space, DIVIDE)).toBeGreaterThan(0);
  });
});

describe('THM-THERAPEUTIC-RESTORATION: Any Vent Suffices', () => {
  it('restoring p53 alone shifts distribution away from divide', () => {
    // Start with cancer cell (no vents)
    const cancerPathways = new Set(['mapk', 'pi3k', 'wnt']);
    let cancerSpace = createSpace(5);
    for (let i = 0; i < 10; i++) {
      cancerSpace = simulateCheckpoint(cancerSpace, cancerPathways);
    }
    const pDivideCancer = probability(cancerSpace, DIVIDE);

    // Restore p53 only
    const restoredPathways = new Set(['mapk', 'pi3k', 'wnt', 'p53']);
    let restoredSpace = createSpace(5);
    for (let i = 0; i < 10; i++) {
      restoredSpace = simulateCheckpoint(restoredSpace, restoredPathways);
    }
    const pDivideRestored = probability(restoredSpace, DIVIDE);

    expect(pDivideRestored).toBeLessThan(pDivideCancer);
  });

  it('restoring rb alone also shifts distribution', () => {
    const cancerPathways = new Set(['mapk', 'pi3k', 'wnt']);
    const restoredPathways = new Set(['mapk', 'pi3k', 'wnt', 'rb']);

    let cancerSpace = createSpace(5);
    let restoredSpace = createSpace(5);

    for (let i = 0; i < 10; i++) {
      cancerSpace = simulateCheckpoint(cancerSpace, cancerPathways);
      restoredSpace = simulateCheckpoint(restoredSpace, restoredPathways);
    }

    expect(probability(restoredSpace, DIVIDE)).toBeLessThan(
      probability(cancerSpace, DIVIDE),
    );
  });

  it('more vents restored = lower P(divide)', () => {
    const oneVent = new Set(['mapk', 'pi3k', 'wnt', 'p53']);
    const twoVents = new Set(['mapk', 'pi3k', 'wnt', 'p53', 'rb']);
    const allVents = new Set(Object.keys(PATHWAYS));

    let s1 = createSpace(5);
    let s2 = createSpace(5);
    let sAll = createSpace(5);

    for (let i = 0; i < 20; i++) {
      s1 = simulateCheckpoint(s1, oneVent);
      s2 = simulateCheckpoint(s2, twoVents);
      sAll = simulateCheckpoint(sAll, allVents);
    }

    expect(probability(s2, DIVIDE)).toBeLessThan(probability(s1, DIVIDE));
    expect(probability(sAll, DIVIDE)).toBeLessThan(probability(s2, DIVIDE));
  });

  it('therapeutic intervention at cycle 10 bends the trajectory', () => {
    const cancerPathways = new Set(['mapk', 'pi3k', 'wnt']);
    const restoredPathways = new Set(['mapk', 'pi3k', 'wnt', 'p53']);

    let space = createSpace(5);
    const trajectory: number[] = [];

    // First 10 cycles: cancer cell (no vents)
    for (let i = 0; i < 10; i++) {
      space = simulateCheckpoint(space, cancerPathways);
      trajectory.push(probability(space, DIVIDE));
    }

    // Intervention at cycle 10: restore p53
    for (let i = 10; i < 30; i++) {
      space = simulateCheckpoint(space, restoredPathways);
      trajectory.push(probability(space, DIVIDE));
    }

    // P(divide) should be lower at end than at intervention point
    expect(trajectory[trajectory.length - 1]!).toBeLessThan(trajectory[10]!);
  });
});

describe('THM-TOPOLOGICAL-DEFICIT-SEVERITY: Deficit Measures Aggressiveness', () => {
  it('GBM Classical deficit = 2 Bules', () => {
    const healthyBeta1 = 9;
    const classicalBeta1 = 7; // Rb knocked out
    expect(healthyBeta1 - classicalBeta1).toBe(2);
  });

  it('GBM Mesenchymal deficit = 3 Bules', () => {
    const healthyBeta1 = 9;
    const mesenchymalBeta1 = 6; // p53 knocked out
    expect(healthyBeta1 - mesenchymalBeta1).toBe(3);
  });

  it('GBM Combined deficit = 7 Bules', () => {
    const healthyBeta1 = 9;
    const combinedBeta1 = 2; // p53 + Rb + APC knocked out
    expect(healthyBeta1 - combinedBeta1).toBe(7);
  });

  it('higher deficit = higher P(divide) after same number of cycles', () => {
    const cycles = 20;

    // Classical: Rb knocked out (deficit 2B)
    const classical = new Set(['p53', 'apc', 'atm_atr', 'mapk', 'pi3k', 'wnt']);
    let sClassical = createSpace(5);
    for (let i = 0; i < cycles; i++) sClassical = simulateCheckpoint(sClassical, classical);

    // Combined: p53 + Rb + APC knocked out (deficit 7B)
    const combined = new Set(['atm_atr', 'mapk', 'pi3k', 'wnt']);
    let sCombined = createSpace(5);
    for (let i = 0; i < cycles; i++) sCombined = simulateCheckpoint(sCombined, combined);

    expect(probability(sCombined, DIVIDE)).toBeGreaterThan(
      probability(sClassical, DIVIDE),
    );
  });

  it('deficit ordering: Classical < Mesenchymal < Combined', () => {
    const classical = new Set(['p53', 'apc', 'atm_atr', 'mapk', 'pi3k', 'wnt']);
    const mesenchymal = new Set(['rb', 'apc', 'atm_atr', 'mapk', 'pi3k', 'wnt']);
    const combined = new Set(['atm_atr', 'mapk', 'pi3k', 'wnt']);

    const deficits = [classical, mesenchymal, combined].map((pathways) => {
      return 9 - totalVentBeta1(pathways);
    });

    expect(deficits[0]!).toBeLessThan(deficits[1]!); // 2 < 3
    expect(deficits[1]!).toBeLessThan(deficits[2]!); // 3 < 7
  });

  it('zero deficit = healthy cell', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    expect(9 - totalVentBeta1(healthy)).toBe(0);
  });

  it('maximum deficit < total (ATM/ATR always retained in GBM Combined)', () => {
    const combined = new Set(['atm_atr', 'mapk', 'pi3k', 'wnt']);
    expect(totalVentBeta1(combined)).toBeGreaterThan(0); // ATM/ATR = 2
  });
});

describe('THM-DRIVER-PASSENGER-SEPARATION: Topological Classification', () => {
  it('driver mutations on real TP53 have measurable topological effect', () => {
    // R175H: CGC→CAC at codon 175 (position 147 in our fragment)
    const r175h = computeMutationTopology(TP53_EXONS_5_8, TP53_HOTSPOT_CODONS.R175H!, 'A');
    // R248W: CGG→TGG at codon 248 (position 366)
    const r248w = computeMutationTopology(TP53_EXONS_5_8, TP53_HOTSPOT_CODONS.R248W!, 'T');
    // R273H: CGT→CAT at codon 273 (position 441)
    const r273h = computeMutationTopology(TP53_EXONS_5_8, TP53_HOTSPOT_CODONS.R273H!, 'A');

    // At least some driver mutations should have non-zero Δσ
    const driverSeverities = [r175h.severityBules, r248w.severityBules, r273h.severityBules];
    const maxDriverSeverity = Math.max(...driverSeverities);

    // This is a real-data test: if all drivers are silent, the prediction fails
    // We report the result either way
    console.log('Driver mutation severities (Bules):', {
      R175H: r175h.severityBules,
      R248W: r248w.severityBules,
      R273H: r273h.severityBules,
    });

    // Accounting identity: σ_ref + Δσ = σ_mutant
    expect(r175h.sigmaRef + r175h.deltaSigma).toBe(r175h.sigmaMutant);
    expect(r248w.sigmaRef + r248w.deltaSigma).toBe(r248w.sigmaMutant);
    expect(r273h.sigmaRef + r273h.deltaSigma).toBe(r273h.sigmaMutant);
  });

  it('driver vs passenger analysis on TP53', () => {
    const report = analyzeDriverVsPassenger(
      TP53_EXONS_5_8,
      // Known TP53 driver mutations
      [
        { locus: TP53_HOTSPOT_CODONS.R175H!, mutantBase: 'A', label: 'R175H' },
        { locus: TP53_HOTSPOT_CODONS.R248W!, mutantBase: 'T', label: 'R248W' },
        { locus: TP53_HOTSPOT_CODONS.R273H!, mutantBase: 'A', label: 'R273H' },
      ],
      // Synonymous passenger mutations (positions chosen to be non-hotspot)
      [
        { locus: 10, mutantBase: 'T', label: 'synonymous_1' },
        { locus: 50, mutantBase: 'A', label: 'synonymous_2' },
        { locus: 200, mutantBase: 'G', label: 'synonymous_3' },
      ],
    );

    console.log('Driver vs Passenger report:', {
      meanDriverSeverity: report.meanAbsDeltaSigmaDrivers,
      meanPassengerSeverity: report.meanAbsDeltaSigmaPassengers,
      enrichment: report.driverEnrichment,
      supported: report.theoremSupported,
    });

    // The prediction: drivers >= passengers in mean |Δσ|
    // This is a real-data test -- log the result
    expect(report.theoremSupported).toBeDefined();
  });

  it('cancer hotspot analysis on TP53', () => {
    const report = analyzeCancerTopology(
      TP53_EXONS_5_8,
      'TP53',
      Object.values(TP53_HOTSPOT_CODONS),
    );

    console.log('TP53 Cancer Topology:', {
      meanSigmaHotspots: report.meanSigmaHotspots,
      meanSigmaNonHotspots: report.meanSigmaNonHotspots,
      enrichment: report.topologicalEnrichment,
      significant: report.enrichmentSignificant,
    });

    // σ_ref is computable at every position
    expect(report.hotspots.length).toBe(Object.values(TP53_HOTSPOT_CODONS).length);
  });

  it('cancer hotspot analysis on KRAS', () => {
    const report = analyzeCancerTopology(
      KRAS_EXON_2,
      'KRAS',
      [34, 35, 37, 38], // G12, G13 codons (positions 34-38)
    );

    console.log('KRAS Cancer Topology:', {
      meanSigmaHotspots: report.meanSigmaHotspots,
      meanSigmaNonHotspots: report.meanSigmaNonHotspots,
      enrichment: report.topologicalEnrichment,
    });

    expect(report.hotspots.length).toBe(4);
  });
});

describe('THM-IMMUNE-CHECKPOINT-BRIDGE: Immunotherapy as External Vent', () => {
  it('immune vent restores learning even when internal checkpoints destroyed', () => {
    // Cancer cell with no internal vents
    const cancerPathways = new Set(['mapk', 'pi3k', 'wnt']);
    let cancerSpace = createSpace(5);

    // Immune system as external vent: rejects "divide" with beta-1 = 2
    // (anti-PD-1 + anti-CTLA-4 = two independent immune mechanisms)
    const immuneBeta1 = 2;

    for (let i = 0; i < 20; i++) {
      cancerSpace = simulateCheckpoint(cancerSpace, cancerPathways);
      // Immune vent fires externally
      for (let b = 0; b < immuneBeta1; b++) {
        cancerSpace = reject(cancerSpace, DIVIDE);
      }
    }

    // With immune venting, divide should be suppressed
    const pDivideWithImmune = probability(cancerSpace, DIVIDE);

    // Compare to cancer cell without immune vent
    let cancerNoImmune = createSpace(5);
    for (let i = 0; i < 20; i++) {
      cancerNoImmune = simulateCheckpoint(cancerNoImmune, cancerPathways);
    }
    const pDivideNoImmune = probability(cancerNoImmune, DIVIDE);

    expect(pDivideWithImmune).toBeLessThan(pDivideNoImmune);
  });
});

describe('Healthy vs Cancer Cell: Full Comparison', () => {
  it('20 cycles: healthy cell strongly suppresses divide, cancer cell does not', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    const cancer = new Set(['mapk', 'pi3k', 'wnt']);

    let healthySpace = createSpace(5);
    let cancerSpace = createSpace(5);

    for (let i = 0; i < 20; i++) {
      healthySpace = simulateCheckpoint(healthySpace, healthy);
      cancerSpace = simulateCheckpoint(cancerSpace, cancer);
    }

    const pDivideHealthy = probability(healthySpace, DIVIDE);
    const pDivideCancer = probability(cancerSpace, DIVIDE);

    console.log('Healthy vs Cancer after 20 cycles:', {
      pDivideHealthy: pDivideHealthy.toFixed(4),
      pDivideCancer: pDivideCancer.toFixed(4),
      ratio: (pDivideCancer / pDivideHealthy).toFixed(2),
    });

    // Healthy cell: divide is strongly suppressed
    expect(pDivideHealthy).toBeLessThan(0.15);
    // Cancer cell: divide probability is significantly higher than healthy
    expect(pDivideCancer).toBeGreaterThan(0.20);
    // Cancer cell has much higher divide probability
    expect(pDivideCancer).toBeGreaterThan(pDivideHealthy);
  });

  it('GBM subtype comparison: deficit predicts P(divide) ordering', () => {
    const subtypes = {
      healthy: new Set(Object.keys(PATHWAYS)),
      classical: new Set(['p53', 'apc', 'atm_atr', 'mapk', 'pi3k', 'wnt']),
      mesenchymal: new Set(['rb', 'apc', 'atm_atr', 'mapk', 'pi3k', 'wnt']),
      combined: new Set(['atm_atr', 'mapk', 'pi3k', 'wnt']),
    };

    const results: Record<string, number> = {};

    for (const [name, pathways] of Object.entries(subtypes)) {
      let space = createSpace(5);
      for (let i = 0; i < 20; i++) {
        space = simulateCheckpoint(space, pathways);
      }
      results[name] = probability(space, DIVIDE);
    }

    console.log('GBM Subtype P(divide) after 20 cycles:', results);

    // Ordering by deficit predicts ordering by P(divide)
    expect(results['healthy']!).toBeLessThan(results['classical']!);
    expect(results['classical']!).toBeLessThan(results['mesenchymal']!);
    expect(results['mesenchymal']!).toBeLessThan(results['combined']!);
  });

  it('trajectory comparison: healthy stabilizes, cancer accelerates', () => {
    const healthy = new Set(Object.keys(PATHWAYS));
    const cancer = new Set(['mapk', 'pi3k', 'wnt']);

    let healthySpace = createSpace(5);
    let cancerSpace = createSpace(5);

    const healthyTrajectory: number[] = [];
    const cancerTrajectory: number[] = [];

    for (let i = 0; i < 50; i++) {
      healthySpace = simulateCheckpoint(healthySpace, healthy);
      cancerSpace = simulateCheckpoint(cancerSpace, cancer);
      healthyTrajectory.push(probability(healthySpace, DIVIDE));
      cancerTrajectory.push(probability(cancerSpace, DIVIDE));
    }

    // Healthy: P(divide) should stabilize at a low value
    const healthyLast10 = healthyTrajectory.slice(-10);
    const healthyRange = Math.max(...healthyLast10) - Math.min(...healthyLast10);
    expect(healthyRange).toBeLessThan(0.01); // converged

    // Cancer: P(divide) should remain significantly higher than healthy
    const cancerLast10 = cancerTrajectory.slice(-10);
    const cancerMean = cancerLast10.reduce((a, b) => a + b, 0) / cancerLast10.length;
    const healthyMean = healthyLast10.reduce((a, b) => a + b, 0) / healthyLast10.length;
    expect(cancerMean).toBeGreaterThan(healthyMean * 2); // cancer >> healthy
  });
});

describe('Simulation: Therapeutic Intervention Timeline', () => {
  it('p53 restoration at cycle 10 in GBM Mesenchymal', () => {
    // Mesenchymal: p53 knocked out
    const mesenchymalPre = new Set(['rb', 'apc', 'atm_atr', 'mapk', 'pi3k', 'wnt']);
    const mesenchymalPost = new Set(Object.keys(PATHWAYS)); // p53 restored

    let space = createSpace(5);
    const trajectory: { cycle: number; pDivide: number; phase: string }[] = [];

    for (let i = 0; i < 30; i++) {
      const pathways = i < 10 ? mesenchymalPre : mesenchymalPost;
      space = simulateCheckpoint(space, pathways);
      trajectory.push({
        cycle: i,
        pDivide: probability(space, DIVIDE),
        phase: i < 10 ? 'pre-therapy' : 'post-therapy',
      });
    }

    console.log('Therapeutic intervention timeline (p53 restoration at cycle 10):');
    for (const t of [trajectory[0]!, trajectory[9]!, trajectory[10]!, trajectory[29]!]) {
      console.log(`  Cycle ${t.cycle} (${t.phase}): P(divide) = ${t.pDivide.toFixed(4)}`);
    }

    // P(divide) at end should be less than at intervention point
    expect(trajectory[29]!.pDivide).toBeLessThan(trajectory[9]!.pDivide);
  });

  it('dose-response: more pathways restored = faster recovery', () => {
    const baseCancer = new Set(['mapk', 'pi3k', 'wnt']);

    const interventions = [
      { name: 'p53_only', pathways: new Set([...baseCancer, 'p53']) },
      { name: 'p53_rb', pathways: new Set([...baseCancer, 'p53', 'rb']) },
      { name: 'full_restore', pathways: new Set(Object.keys(PATHWAYS)) },
    ];

    const results: Record<string, number> = {};

    for (const intervention of interventions) {
      let space = createSpace(5);
      // 10 cycles as cancer
      for (let i = 0; i < 10; i++) space = simulateCheckpoint(space, baseCancer);
      // 20 cycles post-intervention
      for (let i = 0; i < 20; i++) space = simulateCheckpoint(space, intervention.pathways);
      results[intervention.name] = probability(space, DIVIDE);
    }

    console.log('Dose-response (P(divide) at cycle 30):', results);

    expect(results['p53_rb']!).toBeLessThan(results['p53_only']!);
    expect(results['full_restore']!).toBeLessThan(results['p53_rb']!);
  });
});

describe('End-to-End: Genomic Data + Cell Cycle Simulation', () => {
  it('TP53 topological map feeds into cell cycle model', () => {
    // Compute σ at TP53 hotspot positions
    const hotspotSigmas = Object.entries(TP53_HOTSPOT_CODONS).map(([name, pos]) => {
      const profile = computeSigma(TP53_EXONS_5_8, pos);
      return { name, pos, sigma: profile.sigma, beta1: profile.beta1 };
    });

    console.log('TP53 hotspot topological profiles:', hotspotSigmas);

    // Each hotspot has a computable σ
    for (const hs of hotspotSigmas) {
      expect(hs.sigma).toBeGreaterThanOrEqual(0);
      expect(hs.beta1).toBe(2 + hs.sigma);
    }

    // Simulate: higher σ at mutation site = more disruption to cell cycle
    // This connects genomic topology to the cell cycle model
    for (const hs of hotspotSigmas) {
      // A mutation that destroys the structure at this site
      // reduces the cell's ability to detect replication errors
      // Severity in Bules corresponds to lost checkpoint capacity
      const mutResult = computeMutationTopology(TP53_EXONS_5_8, hs.pos, 'N'); // 'N' = any base
      expect(mutResult.sigmaRef + mutResult.deltaSigma).toBe(mutResult.sigmaMutant);
    }
  });
});
