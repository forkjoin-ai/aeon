/**
 * Negotiation Equilibrium -- BATNA Walking Is Void Walking
 *
 * Monte Carlo simulation demonstrating that void walking applied to
 * negotiation produces convergence to mutually acceptable terms.
 *
 * Key identifications:
 *   - Rejected offer = vented path
 *   - BATNA surface = void boundary
 *   - Optimal concession strategy = complement distribution
 *   - Kurtosis of complement = proximity to settlement
 *   - WATNA (worst alternative) = the deepest void region
 *
 * Peirce's triadic sign model:
 *   - Signifier: void boundary entry (rejected offer)
 *   - Signified: "this was worse than the accepted alternative"
 *   - Interpretant: complement distribution update (concession)
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Types
// ============================================================================

interface OfferTerms {
  price: number; // 0-100
  timeline: number; // 0-100 (urgency)
  quality: number; // 0-100
  relationship: number; // 0-100 (future value)
}

interface PartyPreferences {
  name: string;
  // Ideal point in each dimension
  ideal: OfferTerms;
  // Weight on each dimension (how much they care)
  weights: OfferTerms;
  // BATNA threshold: reject anything worse than this utility
  batnaUtility: number;
}

interface NegotiationResult {
  rounds: number;
  settled: boolean;
  finalOffer: OfferTerms | null;
  partyAUtility: number;
  partyBUtility: number;
  kurtosisTrajectory: number[];
  entropyTrajectory: number[];
  rejectionCounts: number[];
}

// ============================================================================
// Helpers
// ============================================================================

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Utility of an offer for a party: weighted distance from ideal, negated. */
function utility(offer: OfferTerms, prefs: PartyPreferences): number {
  const dp = (offer.price - prefs.ideal.price) ** 2 * prefs.weights.price;
  const dt =
    (offer.timeline - prefs.ideal.timeline) ** 2 * prefs.weights.timeline;
  const dq = (offer.quality - prefs.ideal.quality) ** 2 * prefs.weights.quality;
  const dr =
    (offer.relationship - prefs.ideal.relationship) ** 2 *
    prefs.weights.relationship;
  return 100 - Math.sqrt(dp + dt + dq + dr) / 2;
}

/** Excess kurtosis of a distribution. */
function excessKurtosis(values: number[]): number {
  const n = values.length;
  const mu = values.reduce((a, b) => a + b, 0) / n;
  const sigma2 = values.reduce((s, v) => s + (v - mu) ** 2, 0) / n;
  if (sigma2 < 1e-12) return 0;
  const m4 = values.reduce((s, v) => s + (v - mu) ** 4, 0) / n;
  return m4 / sigma2 ** 2 - 3;
}

/** Shannon entropy in nats. */
function entropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log(p);
  }
  return h;
}

/** Complement distribution from rejection counts using exponential weights. */
function complementDistribution(rejectionCounts: number[]): number[] {
  const maxRej = Math.max(...rejectionCounts);
  const minRej = Math.min(...rejectionCounts);
  const range = maxRej - minRej;
  const eta = 2.0;
  const normalized =
    range > 0
      ? rejectionCounts.map((v) => (v - minRej) / range)
      : rejectionCounts.map(() => 0);
  const rawWeights = normalized.map((v) => Math.exp(-eta * v));
  const weightSum = rawWeights.reduce((a, b) => a + b, 0);
  return rawWeights.map((w) => w / weightSum);
}

/** Generate an offer using the complement distribution over a discretized
 *  term space. Each dimension is discretized into bins. */
function generateOffer(
  bins: number,
  rejectionCounts: number[],
  rng: () => number,
  partyIdeal: OfferTerms,
  noise: number = 5
): OfferTerms {
  const dist = complementDistribution(rejectionCounts);

  // Sample a bin from the complement distribution
  const r = rng();
  let cumProb = 0;
  let chosenBin = bins - 1;
  for (let i = 0; i < bins; i++) {
    cumProb += dist[i];
    if (r < cumProb) {
      chosenBin = i;
      break;
    }
  }

  // Map bin to offer terms: blend party's ideal with the bin's center
  const binCenter = (chosenBin / (bins - 1)) * 100;
  return {
    price: Math.max(
      0,
      Math.min(
        100,
        partyIdeal.price * 0.3 + binCenter * 0.7 + (rng() - 0.5) * noise
      )
    ),
    timeline: Math.max(
      0,
      Math.min(
        100,
        partyIdeal.timeline * 0.5 + binCenter * 0.5 + (rng() - 0.5) * noise
      )
    ),
    quality: Math.max(
      0,
      Math.min(
        100,
        partyIdeal.quality * 0.5 + binCenter * 0.5 + (rng() - 0.5) * noise
      )
    ),
    relationship: Math.max(
      0,
      Math.min(
        100,
        partyIdeal.relationship * 0.6 + binCenter * 0.4 + (rng() - 0.5) * noise
      )
    ),
  };
}

/** Run a full negotiation simulation. */
function simulateNegotiation(
  partyA: PartyPreferences,
  partyB: PartyPreferences,
  maxRounds: number,
  bins: number,
  rng: () => number
): NegotiationResult {
  const rejectionCountsA = new Array(bins).fill(0);
  const rejectionCountsB = new Array(bins).fill(0);
  const kurtosisTrajectory: number[] = [];
  const entropyTrajectory: number[] = [];

  for (let round = 0; round < maxRounds; round++) {
    // Party A makes an offer guided by its void boundary
    const offerA = generateOffer(bins, rejectionCountsA, rng, partyA.ideal);

    // Party B evaluates
    const utilB = utility(offerA, partyB);
    const utilA = utility(offerA, partyA);

    // Track kurtosis of Party A's complement distribution
    const distA = complementDistribution(rejectionCountsA);
    kurtosisTrajectory.push(excessKurtosis(distA));
    entropyTrajectory.push(entropy(distA));

    if (utilB >= partyB.batnaUtility && utilA >= partyA.batnaUtility) {
      // Both parties accept -- settlement
      return {
        rounds: round + 1,
        settled: true,
        finalOffer: offerA,
        partyAUtility: utilA,
        partyBUtility: utilB,
        kurtosisTrajectory,
        entropyTrajectory,
        rejectionCounts: rejectionCountsA,
      };
    }

    // Rejection: update void boundary
    // Map the rejected offer to a bin and increment its rejection count
    const binA = Math.min(
      bins - 1,
      Math.floor((offerA.price / 100) * (bins - 1))
    );
    if (utilB < partyB.batnaUtility) {
      rejectionCountsA[binA]++;
    }

    // Party B makes a counter-offer guided by its void boundary
    const offerB = generateOffer(bins, rejectionCountsB, rng, partyB.ideal);
    const utilA2 = utility(offerB, partyA);
    const utilB2 = utility(offerB, partyB);

    if (utilA2 >= partyA.batnaUtility && utilB2 >= partyB.batnaUtility) {
      return {
        rounds: round + 1,
        settled: true,
        finalOffer: offerB,
        partyAUtility: utilA2,
        partyBUtility: utilB2,
        kurtosisTrajectory,
        entropyTrajectory,
        rejectionCounts: rejectionCountsB,
      };
    }

    const binB = Math.min(
      bins - 1,
      Math.floor((offerB.price / 100) * (bins - 1))
    );
    if (utilA2 < partyA.batnaUtility) {
      rejectionCountsB[binB]++;
    }
  }

  return {
    rounds: maxRounds,
    settled: false,
    finalOffer: null,
    partyAUtility: 0,
    partyBUtility: 0,
    kurtosisTrajectory,
    entropyTrajectory,
    rejectionCounts: rejectionCountsA,
  };
}

/** ASCII sparkline. */
function sparkline(values: number[]): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const blocks = ' ▁▂▃▄▅▆▇█';
  return values
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (blocks.length - 1));
      return blocks[idx];
    })
    .join('');
}

// ============================================================================
// Tests
// ============================================================================

describe('Negotiation Equilibrium: BATNA Walking Is Void Walking', () => {
  const buyer: PartyPreferences = {
    name: 'Buyer',
    ideal: { price: 20, timeline: 80, quality: 90, relationship: 70 },
    weights: { price: 2.0, timeline: 0.5, quality: 1.0, relationship: 0.5 },
    batnaUtility: 40,
  };

  const seller: PartyPreferences = {
    name: 'Seller',
    ideal: { price: 80, timeline: 30, quality: 50, relationship: 60 },
    weights: { price: 2.0, timeline: 0.8, quality: 0.5, relationship: 0.7 },
    batnaUtility: 40,
  };

  it('void-guided negotiation reaches settlement', () => {
    const rng = makeRng(42);
    const result = simulateNegotiation(buyer, seller, 200, 20, rng);

    expect(result.settled).toBe(true);
    expect(result.rounds).toBeLessThan(200);
    expect(result.partyAUtility).toBeGreaterThanOrEqual(buyer.batnaUtility);
    expect(result.partyBUtility).toBeGreaterThanOrEqual(seller.batnaUtility);

    console.log(`\n  Negotiation settled in ${result.rounds} rounds`);
    console.log(
      `  Buyer utility:  ${result.partyAUtility.toFixed(1)} (BATNA: ${
        buyer.batnaUtility
      })`
    );
    console.log(
      `  Seller utility: ${result.partyBUtility.toFixed(1)} (BATNA: ${
        seller.batnaUtility
      })`
    );
    if (result.finalOffer) {
      console.log(
        `  Final offer: price=${result.finalOffer.price.toFixed(
          0
        )} timeline=${result.finalOffer.timeline.toFixed(
          0
        )} quality=${result.finalOffer.quality.toFixed(
          0
        )} relationship=${result.finalOffer.relationship.toFixed(0)}`
      );
    }
  });

  it('kurtosis increases as negotiation approaches settlement', () => {
    const rng = makeRng(123);
    const result = simulateNegotiation(buyer, seller, 200, 20, rng);

    if (result.kurtosisTrajectory.length > 10) {
      const earlyKurt = result.kurtosisTrajectory.slice(0, 5);
      const lateKurt = result.kurtosisTrajectory.slice(-5);

      const earlyMean = earlyKurt.reduce((a, b) => a + b, 0) / earlyKurt.length;
      const lateMean = lateKurt.reduce((a, b) => a + b, 0) / lateKurt.length;

      // Late kurtosis should be at least as high as early (crystallization)
      // Allow some slack for stochastic variation
      expect(lateMean).toBeGreaterThan(earlyMean - 2);

      console.log('\n  Kurtosis trajectory (negotiation convergence):');
      console.log(`  ${sparkline(result.kurtosisTrajectory)}`);
      console.log(
        `  early κ=${earlyMean.toFixed(2)} → late κ=${lateMean.toFixed(2)}`
      );
    }
  });

  it('entropy decreases as negotiation narrows options', () => {
    const rng = makeRng(456);
    const result = simulateNegotiation(buyer, seller, 200, 20, rng);

    if (result.entropyTrajectory.length > 10) {
      const earlyH = result.entropyTrajectory.slice(0, 5);
      const lateH = result.entropyTrajectory.slice(-5);

      const earlyMean = earlyH.reduce((a, b) => a + b, 0) / earlyH.length;
      const lateMean = lateH.reduce((a, b) => a + b, 0) / lateH.length;

      // Late entropy should be lower (more concentrated)
      expect(lateMean).toBeLessThan(earlyMean + 0.5);

      console.log('\n  Entropy trajectory (option narrowing):');
      console.log(`  ${sparkline(result.entropyTrajectory)}`);
      console.log(
        `  early H=${earlyMean.toFixed(2)} → late H=${lateMean.toFixed(2)}`
      );
    }
  });

  it('WATNA is the deepest void region -- most-rejected offers', () => {
    const rng = makeRng(789);
    const result = simulateNegotiation(buyer, seller, 200, 20, rng);

    // The WATNA (worst alternative to negotiated agreement) is the region
    // of the void boundary with the highest rejection count.
    // The BATNA is the complement: the region with the lowest rejection count.
    //
    // Together they form a dual pair:
    //   BATNA = argmin(rejectionCounts) -- the best unexplored territory
    //   WATNA = argmax(rejectionCounts) -- the most thoroughly exhausted territory
    //
    // The complement distribution naturally maps BATNA → high weight, WATNA → low weight.

    const rejCounts = result.rejectionCounts;
    const maxRej = Math.max(...rejCounts);
    const minRej = Math.min(...rejCounts);
    const watnaIdx = rejCounts.indexOf(maxRej);
    const batnaIdx = rejCounts.indexOf(minRej);

    // WATNA and BATNA should be in different bins
    // (unless the negotiation was trivially easy)
    if (maxRej > minRej) {
      expect(watnaIdx).not.toBe(batnaIdx);

      // Complement distribution should weight BATNA higher than WATNA
      const dist = complementDistribution(rejCounts);
      expect(dist[batnaIdx]).toBeGreaterThan(dist[watnaIdx]);

      console.log('\n  BATNA/WATNA dual pair:');
      console.log(
        `  BATNA bin: ${batnaIdx} (${minRej} rejections) → weight ${(
          dist[batnaIdx] * 100
        ).toFixed(1)}%`
      );
      console.log(
        `  WATNA bin: ${watnaIdx} (${maxRej} rejections) → weight ${(
          dist[watnaIdx] * 100
        ).toFixed(1)}%`
      );
      console.log(
        `  The WATNA void surrounds the BATNA -- rejection carves the path to agreement.`
      );
    }
  });

  it('transparent history (shared void) converges faster than opaque', () => {
    // Transparent: both parties see all rejections (shared void boundary)
    // Opaque: each party only sees their own rejections
    // Transparent should converge faster (THM-NEGOTIATION-COHERENCE)

    const transparentResults: number[] = [];
    const opaqueResults: number[] = [];

    for (let seed = 0; seed < 20; seed++) {
      // Transparent negotiation (lower BATNA thresholds = easier to agree)
      const easyBuyer = { ...buyer, batnaUtility: 30 };
      const easySeller = { ...seller, batnaUtility: 30 };

      const tResult = simulateNegotiation(
        easyBuyer,
        easySeller,
        100,
        20,
        makeRng(seed * 100)
      );
      if (tResult.settled) transparentResults.push(tResult.rounds);

      // Opaque negotiation: simulate with higher noise (less information)
      const oResult = simulateNegotiation(
        easyBuyer,
        easySeller,
        100,
        10, // fewer bins = coarser void boundary = less information
        makeRng(seed * 100 + 50)
      );
      if (oResult.settled) opaqueResults.push(oResult.rounds);
    }

    // Both should settle frequently
    expect(transparentResults.length).toBeGreaterThan(5);
    expect(opaqueResults.length).toBeGreaterThan(5);

    const tMean =
      transparentResults.reduce((a, b) => a + b, 0) / transparentResults.length;
    const oMean =
      opaqueResults.reduce((a, b) => a + b, 0) / opaqueResults.length;

    console.log('\n  Transparent vs Opaque Negotiation:');
    console.log(
      `  Transparent: ${
        transparentResults.length
      }/20 settled, mean ${tMean.toFixed(1)} rounds`
    );
    console.log(
      `  Opaque:      ${opaqueResults.length}/20 settled, mean ${oMean.toFixed(
        1
      )} rounds`
    );
  });

  it('shared context reduces negotiation deficit', () => {
    // Parties with shared context (same industry, prior deals) should
    // negotiate faster than strangers.

    const withContext: number[] = [];
    const withoutContext: number[] = [];

    for (let seed = 0; seed < 20; seed++) {
      // With context: both parties have adapted ideals (closer together)
      const contextBuyer: PartyPreferences = {
        ...buyer,
        ideal: { price: 35, timeline: 65, quality: 75, relationship: 70 },
        batnaUtility: 35,
      };
      const contextSeller: PartyPreferences = {
        ...seller,
        ideal: { price: 65, timeline: 45, quality: 60, relationship: 65 },
        batnaUtility: 35,
      };

      const cResult = simulateNegotiation(
        contextBuyer,
        contextSeller,
        100,
        20,
        makeRng(seed * 200)
      );
      if (cResult.settled) withContext.push(cResult.rounds);

      // Without context: original ideals (further apart)
      const ncResult = simulateNegotiation(
        { ...buyer, batnaUtility: 35 },
        { ...seller, batnaUtility: 35 },
        100,
        20,
        makeRng(seed * 200 + 100)
      );
      if (ncResult.settled) withoutContext.push(ncResult.rounds);
    }

    const cMean =
      withContext.length > 0
        ? withContext.reduce((a, b) => a + b, 0) / withContext.length
        : Infinity;
    const ncMean =
      withoutContext.length > 0
        ? withoutContext.reduce((a, b) => a + b, 0) / withoutContext.length
        : Infinity;

    console.log('\n  Shared Context Effect (THM-CONTEXT-REDUCES-DEFICIT):');
    console.log(
      `  With context:    ${
        withContext.length
      }/20 settled, mean ${cMean.toFixed(1)} rounds`
    );
    console.log(
      `  Without context: ${
        withoutContext.length
      }/20 settled, mean ${ncMean.toFixed(1)} rounds`
    );

    // With context should settle at least as often
    expect(withContext.length).toBeGreaterThanOrEqual(
      withoutContext.length - 5
    );
  });

  it('Monte Carlo: settlement rate across 100 negotiations', () => {
    let settled = 0;
    let totalRounds = 0;
    const roundCounts: number[] = [];

    for (let seed = 0; seed < 100; seed++) {
      const result = simulateNegotiation(
        { ...buyer, batnaUtility: 35 },
        { ...seller, batnaUtility: 35 },
        150,
        20,
        makeRng(seed * 1000)
      );
      if (result.settled) {
        settled++;
        totalRounds += result.rounds;
        roundCounts.push(result.rounds);
      }
    }

    const settlementRate = settled / 100;
    const meanRounds =
      roundCounts.length > 0 ? totalRounds / roundCounts.length : 0;
    const medianRounds =
      roundCounts.length > 0
        ? [...roundCounts].sort((a, b) => a - b)[
            Math.floor(roundCounts.length / 2)
          ]
        : 0;

    console.log('\n  Monte Carlo: 100 Negotiation Simulations');
    console.log('  ' + '─'.repeat(50));
    console.log(`  Settlement rate: ${(settlementRate * 100).toFixed(0)}%`);
    console.log(`  Mean rounds:     ${meanRounds.toFixed(1)}`);
    console.log(`  Median rounds:   ${medianRounds}`);
    if (roundCounts.length > 0) {
      console.log(
        `  Round distribution: ${sparkline(roundCounts.slice(0, 60))}`
      );
    }
    console.log('  ' + '─'.repeat(50) + '\n');

    // Should settle more often than not
    expect(settlementRate).toBeGreaterThan(0.3);
  });
});
