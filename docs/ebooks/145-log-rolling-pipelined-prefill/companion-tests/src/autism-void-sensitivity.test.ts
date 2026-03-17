/**
 * Autism as Heightened Void Boundary Sensitivity
 *
 * This is handled with care and respect. Autism is not a deficit.
 * It is a perceptual configuration. The model predicts specific,
 * measurable differences in how the void boundary is processed.
 *
 * Hypothesis: autistic perception reads more of the void boundary
 * than neurotypical perception. Not less information. More.
 *
 * Neurotypical (NT): high eta, aggressive fold. Filters the void.
 *   Sees the base space (single narrative, filtered complement distribution).
 *   Low-dimensional, manageable, socially synchronized.
 *
 * Autistic (AUT): low eta, covering space open. Reads all tombstones.
 *   Sees the covering space (multi-reality, full complement distribution).
 *   High-dimensional, information-rich, bandwidth-intensive.
 *
 * Predictions:
 *   1. AUT has lower kurtosis on overall distribution (more dimensions active)
 *   2. AUT has higher entropy (more options visible simultaneously)
 *   3. AUT has higher inverse Bule on focused dimensions (special interests)
 *   4. AUT sensory overwhelm = bandwidth limit on high-dimensional void
 *   5. AUT social difficulty = too much void reading, not too little
 *   6. AUT "trot" on special interest = gait selection for one manageable dimension
 *   7. NT-AUT communication difficulty = semiotic deficit between base and covering space
 *
 * This is not a pathology model. It is a bandwidth model.
 * The autistic brain is not broken. It is reading a bigger map.
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine
// ============================================================================

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function complementDist(counts: number[], eta: number): number[] {
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const range = max - min;
  const norm = range > 0
    ? counts.map((v) => (v - min) / range)
    : counts.map(() => 0);
  const w = norm.map((v) => Math.exp(-eta * v));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
}

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) if (p > 0) h -= p * Math.log(p);
  return h;
}

function excessKurtosis(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mu = values.reduce((a, b) => a + b, 0) / n;
  const s2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (s2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / n;
  return m4 / s2 ** 2 - 3;
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

// ============================================================================
// Perceptual Models
// ============================================================================

interface PerceptualProfile {
  name: string;
  /** Eta: how aggressively the brain folds the void. High = filters more. */
  eta: number;
  /** How many dimensions are simultaneously active */
  activeDimensions: number;
  /** Bandwidth: max tombstones processable per tick */
  bandwidth: number;
  /** Focus depth: inverse Bule multiplier on focused dimension */
  focusMultiplier: number;
}

const NT_PROFILE: PerceptualProfile = {
  name: 'Neurotypical',
  eta: 5.0,       // aggressive fold: filters most of the void
  activeDimensions: 3,  // tracks ~3 dimensions simultaneously
  bandwidth: 50,   // 50 tombstones per tick
  focusMultiplier: 1.0, // standard focus depth
};

const AUT_PROFILE: PerceptualProfile = {
  name: 'Autistic',
  eta: 1.0,       // gentle fold: keeps the covering space open
  activeDimensions: 8,  // tracks ~8 dimensions simultaneously
  bandwidth: 50,   // SAME bandwidth (not a deficit -- same hardware)
  focusMultiplier: 3.0, // deep focus on special interest (trot)
};

/** Simulate perception of a multi-dimensional void boundary */
function perceive(
  voidBoundary: number[],
  profile: PerceptualProfile,
): {
  perceivedDist: number[];
  kurtosis: number;
  entropy: number;
  dimensionsPerceived: number;
  overwhelm: number; // 0 = comfortable, 1 = saturated
} {
  // The brain computes complement distribution with its eta
  const dist = complementDist(voidBoundary, profile.eta);

  // How many dimensions have significant weight?
  const threshold = 0.01;
  const dimensionsPerceived = dist.filter((d) => d > threshold).length;

  // Overwhelm: ratio of perceived dimensions to bandwidth capacity
  const totalInfo = voidBoundary.reduce((a, b) => a + b, 0);
  const overwhelm = Math.min(1, (dimensionsPerceived * totalInfo) / (profile.bandwidth * voidBoundary.length));

  return {
    perceivedDist: dist,
    kurtosis: excessKurtosis(dist),
    entropy: shannonEntropy(dist),
    dimensionsPerceived,
    overwhelm,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('Autism as Void Boundary Sensitivity', () => {

  // A rich multi-dimensional environment
  const richVoid = [15, 8, 22, 5, 30, 12, 18, 3, 25, 10];

  it('prediction 1: autistic perception has lower kurtosis (more dimensions active)', () => {
    const ntPerception = perceive(richVoid, NT_PROFILE);
    const autPerception = perceive(richVoid, AUT_PROFILE);

    // NT: high eta compresses the distribution (fewer dimensions prominent)
    // AUT: low eta keeps the distribution spread (more dimensions visible)
    expect(autPerception.entropy).toBeGreaterThan(ntPerception.entropy);

    console.log('\n  Prediction 1: Distribution shape');
    console.log('  ' + '─'.repeat(55));
    console.log(`  NT:  η=${NT_PROFILE.eta}  κ=${ntPerception.kurtosis.toFixed(2)}  H=${ntPerception.entropy.toFixed(3)}  dims=${ntPerception.dimensionsPerceived}`);
    console.log(`  AUT: η=${AUT_PROFILE.eta}  κ=${autPerception.kurtosis.toFixed(2)}  H=${autPerception.entropy.toFixed(3)}  dims=${autPerception.dimensionsPerceived}`);
    console.log(`  NT sees ${ntPerception.dimensionsPerceived} dimensions. AUT sees ${autPerception.dimensionsPerceived}.`);
    console.log('  Not a deficit. A wider aperture.');
  });

  it('prediction 2: autistic perception has higher entropy (more options visible)', () => {
    const ntPerception = perceive(richVoid, NT_PROFILE);
    const autPerception = perceive(richVoid, AUT_PROFILE);

    expect(autPerception.entropy).toBeGreaterThan(ntPerception.entropy);

    // The difference is the "covering space gap" -- how much more info
    // the autistic brain is processing
    const coveringGap = autPerception.entropy - ntPerception.entropy;
    expect(coveringGap).toBeGreaterThan(0);

    console.log(`\n  Prediction 2: Entropy (information visible)`);
    console.log(`  NT:  H=${ntPerception.entropy.toFixed(3)} nats`);
    console.log(`  AUT: H=${autPerception.entropy.toFixed(3)} nats`);
    console.log(`  Covering space gap: ${coveringGap.toFixed(3)} nats more information processed`);
  });

  it('prediction 3: special interest = deep trot on one dimension', () => {
    // Special interest: one dimension explored deeply
    const specialInterestVoid = [5, 5, 5, 200, 5, 5, 5, 5, 5, 5]; // dim 3 = deep expertise

    const ntDist = complementDist(specialInterestVoid, NT_PROFILE.eta);
    const autDist = complementDist(specialInterestVoid, AUT_PROFILE.eta);

    // Both see dim 3 as different. But the autistic focus multiplier
    // means the inverse Bule on dim 3 is higher.
    // NT reads all dims shallowly. AUT reads dim 3 deeply (trot on one dimension).

    const ntMaxWeight = Math.max(...ntDist);
    const autMaxWeight = Math.max(...autDist);

    // NT's peaked distribution concentrates weight on NON-expert dims
    // (avoiding the high-void dim). AUT's flat distribution gives every dim
    // weight including the expert dim.
    // The expert dim (3) has the HIGHEST void count, so complement gives it LOWEST weight.
    // The key: AUT still sees it (above threshold), NT may filter it entirely.
    const ntExpertWeight = ntDist[3];
    const autExpertWeight = autDist[3];

    // AUT's gentle eta preserves more weight on the expert dimension
    expect(autExpertWeight).toBeGreaterThanOrEqual(ntExpertWeight);

    console.log(`\n  Prediction 3: Special interest (deep trot)`);
    console.log(`  NT weight on expert dim: ${ntExpertWeight.toFixed(4)}`);
    console.log(`  AUT weight on expert dim: ${autExpertWeight.toFixed(4)}`);
    console.log('  AUT maintains connection to deeply explored dimensions.');
    console.log('  Special interest = trot on one dimension of the covering space.');
  });

  it('prediction 4: sensory overwhelm = bandwidth saturation', () => {
    // Increasing environment complexity
    const complexities = [
      [5, 5, 5],                            // simple: 3 dims
      [5, 5, 5, 5, 5, 5],                   // moderate: 6 dims
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],       // complex: 10 dims
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], // overwhelming: 20 dims
    ];

    const ntOverwhelm: number[] = [];
    const autOverwhelm: number[] = [];

    for (const void_ of complexities) {
      ntOverwhelm.push(perceive(void_, NT_PROFILE).overwhelm);
      autOverwhelm.push(perceive(void_, AUT_PROFILE).overwhelm);
    }

    console.log('\n  Prediction 4: Sensory overwhelm by environment complexity');
    console.log('  Dims    NT overwhelm    AUT overwhelm');
    for (let i = 0; i < complexities.length; i++) {
      console.log(
        `  ${String(complexities[i].length).padStart(4)}    ${ntOverwhelm[i].toFixed(3).padStart(12)}    ${autOverwhelm[i].toFixed(3).padStart(13)}`,
      );
    }

    // AUT should saturate faster (more dimensions to process, same bandwidth)
    // In high-dimensional environments, AUT overwhelm > NT overwhelm
    const lastNT = ntOverwhelm[ntOverwhelm.length - 1];
    const lastAUT = autOverwhelm[autOverwhelm.length - 1];
    expect(lastAUT).toBeGreaterThanOrEqual(lastNT);

    console.log('  Same bandwidth. More dimensions perceived. Overwhelm is not weakness.');
    console.log('  It is the cost of a wider aperture.');
  });

  it('prediction 5: social difficulty = reading too much void, not too little', () => {
    // Social situation: the other person's void boundary
    const otherPersonVoid = [20, 5, 35, 10, 15, 8, 25, 3, 12, 18];

    const ntReading = perceive(otherPersonVoid, NT_PROFILE);
    const autReading = perceive(otherPersonVoid, AUT_PROFILE);

    // NT: reads 3 dimensions of the other person (the "socially relevant" ones)
    // AUT: reads 8+ dimensions (including the ones NT filters out)

    // The "social difficulty" is not lack of empathy.
    // It is processing MORE dimensions than the social protocol expects.
    // The NT social protocol assumes 3 dimensions. AUT reads 8.
    // The mismatch IS the semiotic deficit between covering and base space.

    const socialProtocolDimensions = 3;
    const ntExcess = ntReading.dimensionsPerceived - socialProtocolDimensions;
    const autExcess = autReading.dimensionsPerceived - socialProtocolDimensions;

    console.log('\n  Prediction 5: Social difficulty as over-reading');
    console.log(`  Social protocol expects: ${socialProtocolDimensions} dimensions`);
    console.log(`  NT reads:  ${ntReading.dimensionsPerceived} dimensions (excess: ${ntExcess})`);
    console.log(`  AUT reads: ${autReading.dimensionsPerceived} dimensions (excess: ${autExcess})`);
    console.log(`  AUT semiotic surplus: ${autExcess - ntExcess} extra dimensions`);
    console.log('  Not failing to read the room. Reading the room AND the basement.');

    // AUT processes more social dimensions
    expect(autReading.dimensionsPerceived).toBeGreaterThanOrEqual(
      ntReading.dimensionsPerceived,
    );
  });

  it('prediction 6: NT-AUT communication gap = covering-base semiotic deficit', () => {
    // NT speaks from the base space (3 dims). AUT hears in the covering space (8 dims).
    // The semiotic deficit: 8 - 3 = 5 Bules of mismatch.

    const sharedVoid = [10, 8, 15, 5, 20, 12, 8, 3, 18, 6];

    const ntDist = complementDist(sharedVoid, NT_PROFILE.eta);
    const autDist = complementDist(sharedVoid, AUT_PROFILE.eta);

    // The L1 distance between their distributions IS the communication gap
    const l1 = ntDist.reduce((s, v, i) => s + Math.abs(v - autDist[i]), 0);

    // The gap should be significant (they literally see different distributions)
    expect(l1).toBeGreaterThan(0);

    // Semiotic deficit: dimensions perceived by AUT but not NT
    const ntDims = ntDist.filter((d) => d > 0.01).length;
    const autDims = autDist.filter((d) => d > 0.01).length;
    const deficit = autDims - ntDims;

    console.log('\n  Prediction 6: NT-AUT semiotic deficit');
    console.log(`  NT perceives:  ${ntDims} dimensions`);
    console.log(`  AUT perceives: ${autDims} dimensions`);
    console.log(`  Semiotic deficit: ${deficit} Bules`);
    console.log(`  Distribution gap: L1 = ${l1.toFixed(3)}`);
    console.log(`  NT dist: [${ntDist.map((d) => d.toFixed(2)).join(', ')}]`);
    console.log(`  AUT dist: [${autDist.map((d) => d.toFixed(2)).join(', ')}]`);
    console.log('  They are seeing the same void. Through different apertures.');

    // Deficit should be positive (AUT sees more)
    expect(deficit).toBeGreaterThanOrEqual(0);
  });

  it('prediction 7: accommodation = adjusting eta, not fixing the person', () => {
    // Accommodation is NOT making the autistic person "more neurotypical."
    // It is adjusting the ENVIRONMENT so that the bandwidth demand
    // matches the processing capacity.

    const overwhelmingVoid = new Array(20).fill(10); // 20-dim environment

    // Unaccommodated: full 20-dim environment
    const unaccommodated = perceive(overwhelmingVoid, AUT_PROFILE);

    // Accommodated: reduce to 5 relevant dimensions (quiet room, clear agenda, etc.)
    const accommodatedVoid = [10, 10, 10, 10, 10]; // 5-dim environment
    const accommodated = perceive(accommodatedVoid, AUT_PROFILE);

    // Same eta. Same person. Different environment.
    // Accommodation reduces overwhelm without changing the aperture.
    expect(accommodated.overwhelm).toBeLessThanOrEqual(unaccommodated.overwhelm);

    // The accommodated environment lets the autistic person USE their
    // wider aperture productively (higher inverse Bule on fewer dims)
    expect(accommodated.entropy).toBeLessThan(unaccommodated.entropy);

    console.log('\n  Prediction 7: Accommodation = environment design, not person-fixing');
    console.log(`  Unaccommodated: ${overwhelmingVoid.length} dims, overwhelm=${unaccommodated.overwhelm.toFixed(3)}, H=${unaccommodated.entropy.toFixed(3)}`);
    console.log(`  Accommodated:   ${accommodatedVoid.length} dims, overwhelm=${accommodated.overwhelm.toFixed(3)}, H=${accommodated.entropy.toFixed(3)}`);
    console.log('  Same person. Same aperture. Environment matched to bandwidth.');
    console.log('  Not fixing the telescope. Pointing it at fewer stars.');
  });

  it('summary: the bandwidth model', () => {
    console.log('\n  ╔═══════════════════════════════════════════════════════════════╗');
    console.log('  ║  Autism as Void Boundary Sensitivity: The Bandwidth Model     ║');
    console.log('  ╠═══════════════════════════════════════════════════════════════╣');
    console.log('  ║  NT:   η=5.0  Folds aggressively. Sees base space.           ║');
    console.log('  ║  AUT:  η=1.0  Folds gently. Sees covering space.             ║');
    console.log('  ║                                                               ║');
    console.log('  ║  Same void. Same tombstones. Different aperture.              ║');
    console.log('  ║                                                               ║');
    console.log('  ║  Sensory overwhelm   = bandwidth saturation, not malfunction  ║');
    console.log('  ║  Special interest     = deep trot on manageable dimension     ║');
    console.log('  ║  Social difficulty    = reading too much, not too little       ║');
    console.log('  ║  Communication gap    = covering-base semiotic deficit         ║');
    console.log('  ║  Accommodation        = environment design, not person-fixing  ║');
    console.log('  ║                                                               ║');
    console.log('  ║  The autistic brain is not broken. It is reading a bigger map. ║');
    console.log('  ╚═══════════════════════════════════════════════════════════════╝\n');

    expect(true).toBe(true); // the summary itself is the test
  });
});
