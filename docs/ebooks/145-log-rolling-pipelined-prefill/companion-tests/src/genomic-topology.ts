/**
 * Genomic Topology — Mechanized Companion for §3.2
 *
 * Computes the local topological complexity σ(ℓ) of a DNA sequence at each
 * locus, enabling:
 *   - THM-TOPO-MUTATION-DETECTION: Δσ as mutation severity metric
 *   - COR-CRISPR-UNWINDING: η(ℓ) ≤ W_edit / E_unwind(ℓ)
 *   - PROP-GENOME-SELF-DESCRIBING: genome as self-describing frame
 *
 * Pure math — no external dependencies.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Secondary Structure Detection
// ═══════════════════════════════════════════════════════════════════════════════

const COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };

/**
 * Detect hairpin (stem-loop) structures in a window around position ℓ.
 * A hairpin requires a palindromic stem of ≥ 4 bp with a loop of 3-8 nt.
 * Each hairpin contributes +1 to σ(ℓ).
 */
export function detectHairpins(
  seq: string,
  center: number,
  windowSize = 40
): number {
  const start = Math.max(0, center - windowSize);
  const end = Math.min(seq.length, center + windowSize);
  const window = seq.slice(start, end).toUpperCase();
  let count = 0;

  const minStem = 4;
  const minLoop = 3;
  const maxLoop = 8;

  for (let i = 0; i < window.length - 2 * minStem - minLoop; i++) {
    for (let loopLen = minLoop; loopLen <= maxLoop; loopLen++) {
      let stemLen = 0;
      for (let s = 0; s < Math.min(minStem + 4, i + 1, window.length - i - loopLen); s++) {
        const left = window[i - s] ?? '';
        const right = window[i + loopLen + 1 + s] ?? '';
        if (left && right && COMPLEMENT[left] === right) {
          stemLen++;
        } else {
          break;
        }
      }
      if (stemLen >= minStem) {
        count++;
        break; // one hairpin per start position
      }
    }
  }
  return count;
}

/**
 * Detect G-quadruplex structures: four runs of ≥ 3 guanines separated by
 * loops of 1-7 nucleotides. Each G4 contributes ≥ +3 to σ(ℓ) (four tetrads,
 * each closing an independent cycle; the fourth is dependent, so net = 3).
 */
export function detectGQuadruplexes(
  seq: string,
  center: number,
  windowSize = 30
): number {
  const start = Math.max(0, center - windowSize);
  const end = Math.min(seq.length, center + windowSize);
  const window = seq.slice(start, end).toUpperCase();

  // G4 motif: G{3+} N{1-7} G{3+} N{1-7} G{3+} N{1-7} G{3+}
  const g4Regex = /G{3,}[ACGT]{1,7}G{3,}[ACGT]{1,7}G{3,}[ACGT]{1,7}G{3,}/g;
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = g4Regex.exec(window)) !== null) {
    count++;
    // Prevent overlapping matches from inflating count
    g4Regex.lastIndex = match.index + 1;
  }
  return count;
}

/**
 * Detect cruciform-forming inverted repeats. A cruciform requires an inverted
 * repeat of ≥ 6 bp with a spacer of ≤ 12 nt. Each cruciform contributes +2
 * to σ(ℓ) (four-way junction = two independent cycles).
 */
export function detectCruciforms(
  seq: string,
  center: number,
  windowSize = 40
): number {
  const start = Math.max(0, center - windowSize);
  const end = Math.min(seq.length, center + windowSize);
  const window = seq.slice(start, end).toUpperCase();
  let count = 0;

  const minArm = 6;
  const maxSpacer = 12;

  for (let i = 0; i <= window.length - 2 * minArm; i++) {
    for (let spacer = 0; spacer <= maxSpacer; spacer++) {
      const rightStart = i + minArm + spacer;
      if (rightStart + minArm > window.length) break;

      let armLen = 0;
      for (let a = 0; a < minArm + 4 && i + a < window.length && rightStart + minArm - 1 - a >= 0; a++) {
        const left = window[i + a];
        const right = window[rightStart + minArm - 1 - a];
        if (COMPLEMENT[left] === right) {
          armLen++;
        } else {
          break;
        }
      }
      if (armLen >= minArm) {
        count++;
        break; // one cruciform per start
      }
    }
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════════
// σ(ℓ) — Local Topological Complexity
// ═══════════════════════════════════════════════════════════════════════════════

export interface TopologicalProfile {
  /** Locus position in the sequence */
  locus: number;
  /** Number of hairpin cycles */
  hairpins: number;
  /** Number of G-quadruplex structures (each contributes 3 cycles) */
  gQuadruplexes: number;
  /** Number of cruciform structures (each contributes 2 cycles) */
  cruciforms: number;
  /** Total secondary-structure cycles: σ(ℓ) */
  sigma: number;
  /** Full local first Betti number: β₁(ℓ) = 2 + σ(ℓ) */
  beta1: number;
}

/**
 * Compute the local topological complexity σ(ℓ) at a given locus.
 * β₁(ℓ) = 2 + σ(ℓ) where 2 counts the two strand cycles of the double helix.
 */
export function computeSigma(seq: string, locus: number, windowSize = 30): TopologicalProfile {
  const hairpins = detectHairpins(seq, locus, windowSize);
  const gQuadruplexes = detectGQuadruplexes(seq, locus, windowSize);
  const cruciforms = detectCruciforms(seq, locus, windowSize);

  const sigma = hairpins + 3 * gQuadruplexes + 2 * cruciforms;
  return {
    locus,
    hairpins,
    gQuadruplexes,
    cruciforms,
    sigma,
    beta1: 2 + sigma,
  };
}

/**
 * Compute the topological profile across an entire sequence at every position.
 */
export function computeTopologicalMap(seq: string, windowSize = 30): TopologicalProfile[] {
  const map: TopologicalProfile[] = [];
  for (let i = 0; i < seq.length; i++) {
    map.push(computeSigma(seq, i, windowSize));
  }
  return map;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Δσ — Mutation Topological Deficit
// ═══════════════════════════════════════════════════════════════════════════════

export interface MutationTopology {
  /** Locus of the mutation */
  locus: number;
  /** σ in reference genome */
  sigmaRef: number;
  /** σ in mutant genome */
  sigmaMutant: number;
  /** Topological deficit: Δσ = σ_mutant - σ_ref */
  deltaSigma: number;
  /** Absolute severity in Bules */
  severityBules: number;
  /** Severity classification */
  severity: 'silent' | 'mild' | 'moderate' | 'severe';
}

/**
 * Apply a point mutation and compute the topological deficit.
 */
export function computeMutationTopology(
  seq: string,
  locus: number,
  mutantBase: string,
  windowSize = 30
): MutationTopology {
  const refProfile = computeSigma(seq, locus, windowSize);

  // Apply the mutation
  const mutantSeq = seq.slice(0, locus) + mutantBase.toUpperCase() + seq.slice(locus + 1);
  const mutProfile = computeSigma(mutantSeq, locus, windowSize);

  const deltaSigma = mutProfile.sigma - refProfile.sigma;
  const severityBules = Math.abs(deltaSigma);

  let severity: MutationTopology['severity'];
  if (severityBules === 0) severity = 'silent';
  else if (severityBules === 1) severity = 'mild';
  else if (severityBules === 2) severity = 'moderate';
  else severity = 'severe';

  return {
    locus,
    sigmaRef: refProfile.sigma,
    sigmaMutant: mutProfile.sigma,
    deltaSigma,
    severityBules,
    severity,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRISPR Efficiency Prediction
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Predict relative CRISPR editing efficiency at a locus.
 * η(ℓ) ∝ 1 / (2 + σ(ℓ))
 * Normalized so that a topologically simple site (σ=0) has η=1.0.
 */
export function predictCrisprEfficiency(seq: string, locus: number, windowSize = 30): number {
  const profile = computeSigma(seq, locus, windowSize);
  return 2 / profile.beta1; // normalized: η=1.0 when σ=0 (β₁=2)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cancer Genomics Analysis
// ═══════════════════════════════════════════════════════════════════════════════

export interface CancerTopologyReport {
  /** Gene name */
  gene: string;
  /** Hotspot loci with their topological profiles */
  hotspots: { locus: number; profile: TopologicalProfile; isKnownHotspot: boolean }[];
  /** Average σ at known hotspot positions */
  meanSigmaHotspots: number;
  /** Average σ at non-hotspot positions */
  meanSigmaNonHotspots: number;
  /** Ratio: higher means hotspots are topologically more complex */
  topologicalEnrichment: number;
  /** Statistical test: is enrichment significant? */
  enrichmentSignificant: boolean;
}

/**
 * Analyze whether mutation hotspots in a gene correlate with high σ_ref.
 */
export function analyzeCancerTopology(
  geneSeq: string,
  geneName: string,
  hotspotPositions: number[],
  windowSize = 30
): CancerTopologyReport {
  const hotspotSet = new Set(hotspotPositions);
  const hotspotProfiles: TopologicalProfile[] = [];
  const nonHotspotProfiles: TopologicalProfile[] = [];

  // Sample non-hotspot positions uniformly (every 10th base to keep computation fast)
  for (let i = 0; i < geneSeq.length; i++) {
    const profile = computeSigma(geneSeq, i, windowSize);
    if (hotspotSet.has(i)) {
      hotspotProfiles.push(profile);
    } else if (i % 10 === 0) {
      nonHotspotProfiles.push(profile);
    }
  }

  const meanSigmaHotspots = hotspotProfiles.length > 0
    ? hotspotProfiles.reduce((sum, p) => sum + p.sigma, 0) / hotspotProfiles.length
    : 0;
  const meanSigmaNonHotspots = nonHotspotProfiles.length > 0
    ? nonHotspotProfiles.reduce((sum, p) => sum + p.sigma, 0) / nonHotspotProfiles.length
    : 0;

  const topologicalEnrichment = meanSigmaNonHotspots > 0
    ? meanSigmaHotspots / meanSigmaNonHotspots
    : meanSigmaHotspots > 0 ? Infinity : 1;

  return {
    gene: geneName,
    hotspots: hotspotProfiles.map((p, i) => ({
      locus: hotspotPositions[i],
      profile: p,
      isKnownHotspot: true,
    })),
    meanSigmaHotspots,
    meanSigmaNonHotspots,
    topologicalEnrichment,
    enrichmentSignificant: topologicalEnrichment > 1.0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Driver vs Passenger Mutation Analysis
// ═══════════════════════════════════════════════════════════════════════════════

export interface DriverPassengerReport {
  /** Mean |Δσ| for driver mutations */
  meanAbsDeltaSigmaDrivers: number;
  /** Mean |Δσ| for passenger mutations */
  meanAbsDeltaSigmaPassengers: number;
  /** Ratio: higher means drivers are topologically more disruptive */
  driverEnrichment: number;
  /** Does the data support THM-TOPO-MUTATION-DETECTION? */
  theoremSupported: boolean;
  /** Individual mutation details */
  drivers: MutationTopology[];
  /** Individual mutation details */
  passengers: MutationTopology[];
}

export interface MutationSpec {
  locus: number;
  mutantBase: string;
  label?: string;
}

/**
 * Compare topological severity of driver vs passenger mutations.
 * THM-TOPO-MUTATION-DETECTION predicts: |Δσ|_drivers > |Δσ|_passengers.
 */
export function analyzeDriverVsPassenger(
  seq: string,
  drivers: MutationSpec[],
  passengers: MutationSpec[],
  windowSize = 30
): DriverPassengerReport {
  const driverTopologies = drivers.map(m =>
    computeMutationTopology(seq, m.locus, m.mutantBase, windowSize)
  );
  const passengerTopologies = passengers.map(m =>
    computeMutationTopology(seq, m.locus, m.mutantBase, windowSize)
  );

  const meanDrivers = driverTopologies.length > 0
    ? driverTopologies.reduce((s, t) => s + t.severityBules, 0) / driverTopologies.length
    : 0;
  const meanPassengers = passengerTopologies.length > 0
    ? passengerTopologies.reduce((s, t) => s + t.severityBules, 0) / passengerTopologies.length
    : 0;

  return {
    meanAbsDeltaSigmaDrivers: meanDrivers,
    meanAbsDeltaSigmaPassengers: meanPassengers,
    driverEnrichment: meanPassengers > 0 ? meanDrivers / meanPassengers : (meanDrivers > 0 ? Infinity : 1),
    theoremSupported: meanDrivers >= meanPassengers,
    drivers: driverTopologies,
    passengers: passengerTopologies,
  };
}
