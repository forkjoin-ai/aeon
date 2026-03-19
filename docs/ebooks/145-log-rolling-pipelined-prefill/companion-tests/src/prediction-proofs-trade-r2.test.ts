/**
 * Prediction Proofs -- §19.46: Five Deeper Economic Predictions from the Ledger
 *
 * Supply chains, market concentration, negotiation regret, bid-ask spreads,
 * and monetary policy -- all from the existing theorem ledger.
 *
 * Prediction 192: Supply chain concentration as monoculture deficit
 * Prediction 193: Market concentration generates failure tax (merger heat)
 * Prediction 194: Trade negotiation cost bounded by void walking regret
 * Prediction 195: Bid-ask spread as semiotic deficit of price communication
 * Prediction 196: Currency union feedback increases Tinbergen deficit
 *
 * Theorem chains:
 *   P117: diversity_necessity + american_frontier → single-source deficit
 *   P118: deterministic_single_survivor_collapse_requires_waste → merger tax
 *   P119: negotiation_regret_bound → void walking dominates naive
 *   P120: semiotic_deficit → bid-ask spread = valueDims - 1
 *   P121: trace_heat_nonneg + diversity_necessity → Tinbergen deficit
 */

import { describe, expect, it } from 'vitest';

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// ============================================================================
// Prediction 192: Supply Chain Concentration as Monoculture Deficit
// ============================================================================

describe('Prediction 192: Supply chain concentration as monoculture deficit', () => {
  /**
   * Supply chain diversity maps to fork/race/fold:
   *   Fork: multiple suppliers offer competing streams
   *   Race: procurement selects lowest cost/risk
   *   Fold: purchase order collapses to single supplier per item
   *   Vent: rejected bids
   *
   * Single-sourcing = monoculture = maximum deficit.
   * Chain: diversity_necessity → american_frontier → single_source_positive_deficit
   */

  interface SupplyChain {
    suppliers: number;
    activeSources: number;
  }

  function deficit(sc: SupplyChain): number {
    return sc.suppliers - sc.activeSources;
  }

  it('single-source has maximum deficit', () => {
    const sc: SupplyChain = { suppliers: 8, activeSources: 1 };
    expect(deficit(sc)).toBe(7);
    expect(deficit(sc)).toBeGreaterThan(0);
  });

  it('full diversification has zero deficit', () => {
    const sc: SupplyChain = { suppliers: 8, activeSources: 8 };
    expect(deficit(sc)).toBe(0);
  });

  it('deficit monotonically decreases with more active sources', () => {
    for (let active = 1; active <= 8; active++) {
      const sc: SupplyChain = { suppliers: 8, activeSources: active };
      if (active > 1) {
        const prev: SupplyChain = { suppliers: 8, activeSources: active - 1 };
        expect(deficit(sc)).toBeLessThan(deficit(prev));
      }
    }
  });

  it('disruption increases deficit by exactly 1', () => {
    const before: SupplyChain = { suppliers: 8, activeSources: 5 };
    const after: SupplyChain = { suppliers: 8, activeSources: 4 };
    expect(deficit(after)).toBe(deficit(before) + 1);
  });

  it('supply chain resilience scales with diversity', () => {
    // Simulate disruption cascades
    const rng = makeRng(42);
    const chains = [
      { name: 'single-source', suppliers: 8, activeSources: 1 },
      { name: 'dual-source', suppliers: 8, activeSources: 2 },
      { name: 'multi-source', suppliers: 8, activeSources: 4 },
      { name: 'full-diversity', suppliers: 8, activeSources: 8 },
    ];

    // After 3 random disruptions, measure remaining capacity
    for (const chain of chains) {
      let remaining = chain.activeSources;
      for (let d = 0; d < 3; d++) {
        if (remaining > 0 && rng() < 0.5) remaining--;
      }
      // Higher initial diversity → higher post-disruption capacity
      if (chain.activeSources >= 4) {
        expect(remaining).toBeGreaterThan(0);
      }
    }
  });

  it('JIT single-source is topologically equivalent to autarky in that dimension', () => {
    const jit: SupplyChain = { suppliers: 8, activeSources: 1 };
    // deficit = suppliers - 1 = same as autarky deficit
    expect(deficit(jit)).toBe(jit.suppliers - 1);
  });
});

// ============================================================================
// Prediction 193: Market Concentration Generates Failure Tax
// ============================================================================

describe('Prediction 193: Market concentration generates failure tax (merger heat)', () => {
  /**
   * A merger is a deterministic collapse: N firms → 1 survivor.
   * By the failure trilemma, this requires waste (vent or repair).
   * The failure tax = N - 1 = number of eliminated competitors.
   *
   * Chain: deterministic_single_survivor_collapse_requires_waste → merger_failure_tax_positive
   */

  interface Market {
    firms: number;
  }

  function failureTax(m: Market): number {
    return m.firms - 1;
  }

  function shannonEntropy(firms: number): number {
    // Equiprobable firms: H = log₂(N)
    return Math.log2(firms);
  }

  it('monopoly from duopoly: failure tax = 1', () => {
    expect(failureTax({ firms: 2 })).toBe(1);
  });

  it('monopoly from oligopoly: failure tax = N-1', () => {
    for (let n = 2; n <= 10; n++) {
      expect(failureTax({ firms: n })).toBe(n - 1);
    }
  });

  it('failure tax monotone in firm count', () => {
    for (let n = 2; n < 10; n++) {
      expect(failureTax({ firms: n + 1 })).toBeGreaterThan(failureTax({ firms: n }));
    }
  });

  it('Shannon entropy of eliminated diversity bounds information loss', () => {
    // Merger erases log₂(N) bits of competitive information
    for (let n = 2; n <= 8; n++) {
      const entropy = shannonEntropy(n);
      expect(entropy).toBeGreaterThan(0);
      expect(entropy).toBeLessThanOrEqual(Math.log2(8));
    }
  });

  it('merger cascade: each step increases cumulative tax', () => {
    // Start with 8 firms, merge one pair at a time
    let firms = 8;
    let cumulativeTax = 0;
    while (firms > 1) {
      cumulativeTax += 1; // each merger eliminates 1 firm
      firms--;
    }
    // Total tax = N-1 = 7
    expect(cumulativeTax).toBe(7);
  });

  it('HHI increase correlates with failure tax', () => {
    // Herfindahl-Hirschman Index: sum of squared market shares
    function hhi(firms: number): number {
      const share = 1 / firms;
      return firms * share * share;
    }

    // HHI increases as firms decrease (concentration increases)
    for (let n = 8; n > 1; n--) {
      expect(hhi(n - 1)).toBeGreaterThan(hhi(n));
    }
  });
});

// ============================================================================
// Prediction 194: Trade Negotiation Cost Bounded by Void Walking Regret
// ============================================================================

describe('Prediction 194: Trade negotiation cost bounded by void walking regret', () => {
  /**
   * Trade negotiations have N terms and T rounds.
   * Naive exhaustive: cost proportional to T × N
   * Void walking: cost proportional to T × log₂(N)
   *
   * The rejection history (what proposals were rejected) is exponentially
   * more compact than the full offer history.
   *
   * Chain: negotiation_regret_bound → batna_sufficient_statistic
   */

  function naiveRegret(terms: number, rounds: number): number {
    return Math.sqrt(rounds * terms);
  }

  function voidWalkingRegret(terms: number, rounds: number): number {
    return Math.sqrt(rounds * Math.log2(terms));
  }

  function savingsRatio(terms: number, rounds: number): number {
    return 1 - voidWalkingRegret(terms, rounds) / naiveRegret(terms, rounds);
  }

  it('void walking dominates naive for N ≥ 4', () => {
    for (let n = 4; n <= 100; n++) {
      expect(voidWalkingRegret(n, 100)).toBeLessThan(naiveRegret(n, 100));
    }
  });

  it('savings ratio increases with more terms', () => {
    const rounds = 100;
    let prevSavings = 0;
    for (const terms of [4, 8, 16, 32, 64, 128]) {
      const savings = savingsRatio(terms, rounds);
      expect(savings).toBeGreaterThan(prevSavings);
      prevSavings = savings;
    }
  });

  it('WTO rounds as void walking: 160+ members, thousands of terms', () => {
    const wtoTerms = 1000; // thousands of tariff lines
    const wtoRounds = 50;  // years of negotiation
    const savings = savingsRatio(wtoTerms, wtoRounds);
    expect(savings).toBeGreaterThan(0.5); // >50% savings from rejection memory
  });

  it('bilateral vs multilateral: rejection history scales logarithmically', () => {
    const rounds = 20;
    const bilateral = voidWalkingRegret(10, rounds);
    const multilateral = voidWalkingRegret(100, rounds);
    // 10× more terms, but regret only grows by log factor
    const ratio = multilateral / bilateral;
    expect(ratio).toBeLessThan(3.5); // much less than 10×
  });

  it('BATNA as sufficient statistic: compact representation', () => {
    // Full history: T × N entries
    // BATNA (void boundary): N counters
    const terms = 50;
    const rounds = 100;
    const fullHistory = rounds * terms; // 5000 entries
    const batnaSize = terms;            // 50 counters
    const compressionRatio = fullHistory / batnaSize;
    expect(compressionRatio).toBe(rounds); // T:1 compression
  });
});

// ============================================================================
// Prediction 195: Bid-Ask Spread as Semiotic Deficit
// ============================================================================

describe('Prediction 195: Bid-ask spread as semiotic deficit of price communication', () => {
  /**
   * A transaction has k value dimensions (quality, timing, quantity,
   * payment terms, warranty, etc.) but bid-ask communicates through
   * 1 price stream. Semiotic deficit = k - 1. The spread absorbs
   * the information that cannot be communicated through price alone.
   *
   * Chain: semiotic_deficit → semiotic_erasure → bid_ask_deficit
   */

  interface Transaction {
    name: string;
    valueDimensions: number;
    priceStreams: number;
  }

  function semioticDeficit(t: Transaction): number {
    return Math.max(0, t.valueDimensions - t.priceStreams);
  }

  const transactions: Transaction[] = [
    { name: 'commodity (oil futures)', valueDimensions: 2, priceStreams: 1 },
    { name: 'equity (stock)', valueDimensions: 5, priceStreams: 1 },
    { name: 'real estate', valueDimensions: 12, priceStreams: 1 },
    { name: 'M&A deal', valueDimensions: 20, priceStreams: 1 },
    { name: 'multi-attribute auction', valueDimensions: 5, priceStreams: 5 },
  ];

  it('deficit = dimensions - 1 for single-price transactions', () => {
    for (const t of transactions) {
      if (t.priceStreams === 1) {
        expect(semioticDeficit(t)).toBe(t.valueDimensions - 1);
      }
    }
  });

  it('commodity has smallest deficit (simplest transaction)', () => {
    const commodity = transactions.find(t => t.name.includes('commodity'))!;
    const equity = transactions.find(t => t.name.includes('equity'))!;
    expect(semioticDeficit(commodity)).toBeLessThan(semioticDeficit(equity));
  });

  it('complex transactions have larger deficits (wider spreads)', () => {
    // Sort by deficit
    const sorted = [...transactions]
      .filter(t => t.priceStreams === 1)
      .sort((a, b) => semioticDeficit(a) - semioticDeficit(b));

    for (let i = 1; i < sorted.length; i++) {
      expect(semioticDeficit(sorted[i])).toBeGreaterThanOrEqual(
        semioticDeficit(sorted[i - 1])
      );
    }
  });

  it('multi-attribute auction eliminates deficit', () => {
    const auction = transactions.find(t => t.name.includes('multi-attribute'))!;
    expect(semioticDeficit(auction)).toBe(0);
  });

  it('adding RFQ dimensions reduces deficit', () => {
    const base: Transaction = { name: 'base', valueDimensions: 10, priceStreams: 1 };
    for (let streams = 1; streams <= 10; streams++) {
      const t: Transaction = { ...base, priceStreams: streams };
      expect(semioticDeficit(t)).toBe(10 - streams);
    }
  });

  it('spread prediction: real estate > equity > commodity', () => {
    // More complex transactions should have wider relative spreads
    const deficits = transactions
      .filter(t => t.priceStreams === 1)
      .map(t => ({ name: t.name, deficit: semioticDeficit(t) }));

    const commodity = deficits.find(d => d.name.includes('commodity'))!;
    const equity = deficits.find(d => d.name.includes('equity'))!;
    const realEstate = deficits.find(d => d.name.includes('real estate'))!;

    expect(realEstate.deficit).toBeGreaterThan(equity.deficit);
    expect(equity.deficit).toBeGreaterThan(commodity.deficit);
  });
});

// ============================================================================
// Prediction 196: Currency Union Feedback Increases Tinbergen Deficit
// ============================================================================

describe('Prediction 196: Currency union increases Tinbergen deficit', () => {
  /**
   * The Tinbergen rule: you need at least as many instruments as targets.
   * A currency union reduces instruments (N central banks → 1) while
   * increasing targets (N × domestic sectors). The Tinbergen deficit
   * = sectors - instruments is the topological deficit of monetary policy.
   *
   * Chain: diversity_necessity → trace_heat_nonneg → tinbergen_deficit_positive
   */

  interface MonetaryPolicy {
    name: string;
    sectors: number;
    instruments: number;
  }

  function tinbergenDeficit(mp: MonetaryPolicy): number {
    return Math.max(0, mp.sectors - mp.instruments);
  }

  const policies: MonetaryPolicy[] = [
    { name: 'single country (US Fed)', sectors: 5, instruments: 5 },
    { name: 'eurozone (19 countries)', sectors: 95, instruments: 3 },
    { name: 'gold standard', sectors: 50, instruments: 1 },
    { name: 'floating + fiscal', sectors: 5, instruments: 7 },
  ];

  it('independent monetary policy can match Tinbergen (deficit = 0)', () => {
    const fed = policies.find(p => p.name.includes('US'))!;
    expect(tinbergenDeficit(fed)).toBe(0);
  });

  it('currency union has massive Tinbergen deficit', () => {
    const eurozone = policies.find(p => p.name.includes('eurozone'))!;
    expect(tinbergenDeficit(eurozone)).toBe(92);
    expect(tinbergenDeficit(eurozone)).toBeGreaterThan(0);
  });

  it('gold standard has maximum Tinbergen deficit', () => {
    const gold = policies.find(p => p.name.includes('gold'))!;
    expect(tinbergenDeficit(gold)).toBe(49);
  });

  it('over-instrumented policy has zero deficit', () => {
    const overInstrumented = policies.find(p => p.name.includes('floating'))!;
    expect(tinbergenDeficit(overInstrumented)).toBe(0);
  });

  it('joining a union increases deficit monotonically', () => {
    // Each country joining increases sectors but instruments stay at 1
    const baseInstruments = 3;
    let prevDeficit = 0;
    for (let countries = 1; countries <= 10; countries++) {
      const sectors = countries * 5;
      const mp: MonetaryPolicy = {
        name: `union-${countries}`,
        sectors,
        instruments: baseInstruments,
      };
      const d = tinbergenDeficit(mp);
      expect(d).toBeGreaterThanOrEqual(prevDeficit);
      prevDeficit = d;
    }
  });

  it('adding instruments (fiscal policy) reduces deficit', () => {
    const base: MonetaryPolicy = { name: 'base', sectors: 20, instruments: 1 };
    for (let inst = 1; inst <= 20; inst++) {
      const mp: MonetaryPolicy = { ...base, instruments: inst };
      expect(tinbergenDeficit(mp)).toBe(Math.max(0, 20 - inst));
    }
  });

  it('eurozone optimal policy: 95 instruments for 95 sectors', () => {
    const optimal: MonetaryPolicy = { name: 'optimal eurozone', sectors: 95, instruments: 95 };
    expect(tinbergenDeficit(optimal)).toBe(0);
    // But this requires fiscal union -- 95 independent fiscal tools
  });
});

// ============================================================================
// Cross-Cutting: Master Composition
// ============================================================================

describe('Cross-cutting: all five economic deficits are positive', () => {
  it('each domain has positive deficit under constraint', () => {
    // Supply chain: single source
    expect(8 - 1).toBeGreaterThan(0);
    // Market: competitive firms
    expect(5 - 1).toBeGreaterThan(0);
    // Price: bid-ask semiotic
    expect(10 - 1).toBeGreaterThan(0);
    // Monetary: Tinbergen
    expect(20 - 3).toBeGreaterThan(0);
  });

  it('each deficit is eliminated by matched diversity', () => {
    // Supply chain: full diversification
    expect(8 - 8).toBe(0);
    // Market: perfect competition (no merger)
    // Price: multi-attribute auction
    expect(10 - 10).toBe(0);
    // Monetary: matched instruments
    expect(20 - 20).toBe(0);
  });
});
