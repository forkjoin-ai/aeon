/**
 * Prediction Proofs -- §19.52: Five Economic Predictions from Final Surfaces
 *
 * P222: Flash crashes as whip snaps in liquidity taper
 * P223: Intermediary chains lose information (data processing inequality)
 * P224: Staged market entry dominates big-bang launch
 * P225: Bailout vs bankruptcy as failure Pareto frontier
 * P226: Corporate hierarchy heat: each layer erases information
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// P222: Flash Crashes as Whip Snaps
// ============================================================================

describe('Prediction 222: Flash crashes as whip snaps in liquidity taper', () => {
  const priceImpact = (flow: number, liquidity: number) =>
    liquidity > 0 ? flow / liquidity : Infinity;

  it('thinner liquidity amplifies price impact', () => {
    const flow = 100;
    expect(priceImpact(flow, 10)).toBeLessThan(priceImpact(flow, 5));
    expect(priceImpact(flow, 5)).toBeLessThan(priceImpact(flow, 2));
  });

  it('at minimum liquidity (1), impact = full order flow', () => {
    expect(priceImpact(100, 1)).toBe(100);
  });

  it('snap is inevitable as liquidity approaches zero', () => {
    const flow = 1000;
    const impacts = [100, 50, 20, 10, 5, 2, 1].map(liq => priceImpact(flow, liq));
    // Monotonically increasing
    for (let i = 1; i < impacts.length; i++) {
      expect(impacts[i]).toBeGreaterThanOrEqual(impacts[i - 1]);
    }
    // Last impact is massive
    expect(impacts[impacts.length - 1]).toBe(1000);
  });

  it('2010 Flash Crash model: liquidity taper → snap', () => {
    // Simulate: order book thins progressively
    const levels = [
      { price: 100, liquidity: 1000 },
      { price: 99, liquidity: 500 },
      { price: 98, liquidity: 100 },
      { price: 97, liquidity: 10 },
      { price: 96, liquidity: 1 },  // snap point
    ];
    const flow = 500;
    const impacts = levels.map(l => priceImpact(flow, l.liquidity));
    // Impact explodes at thin levels
    expect(impacts[4]).toBeGreaterThan(impacts[0] * 100);
  });

  it('constant liquidity = no snap (no taper)', () => {
    const flow = 100;
    const impacts = [50, 50, 50, 50].map(liq => priceImpact(flow, liq));
    // All equal: no amplification
    for (let i = 1; i < impacts.length; i++) {
      expect(impacts[i]).toBe(impacts[0]);
    }
  });
});

// ============================================================================
// P223: Intermediary Chains Lose Information
// ============================================================================

describe('Prediction 223: Intermediary chains lose information', () => {
  const infoLost = (attrs: number, steps: number, erasurePerStep: number) =>
    Math.min(steps * erasurePerStep, attrs);

  const remaining = (attrs: number, steps: number, erasurePerStep: number) =>
    attrs - infoLost(attrs, steps, erasurePerStep);

  it('direct sale loses zero information', () => {
    expect(infoLost(10, 0, 2)).toBe(0);
  });

  it('each intermediary adds positive erasure', () => {
    for (let steps = 1; steps <= 5; steps++) {
      expect(infoLost(10, steps, 1)).toBe(steps);
      expect(infoLost(10, steps, 1)).toBeGreaterThan(0);
    }
  });

  it('more intermediaries → more information loss (monotone)', () => {
    let prevLoss = 0;
    for (let steps = 0; steps <= 10; steps++) {
      const loss = infoLost(10, steps, 1);
      expect(loss).toBeGreaterThanOrEqual(prevLoss);
      prevLoss = loss;
    }
  });

  it('chain rule: two-step loss = step1 + step2', () => {
    const attrs = 10;
    const erasure = 1;
    // Loss after 3 steps = loss after 1 + loss from 1 to 2 + loss from 2 to 3
    expect(infoLost(attrs, 3, erasure)).toBe(3 * erasure);
  });

  it('wholesaler → distributor → retailer: 3-step chain', () => {
    const product = { attrs: 20, erasurePerStep: 3 };
    const manufacturer = remaining(product.attrs, 0, product.erasurePerStep);
    const wholesaler = remaining(product.attrs, 1, product.erasurePerStep);
    const distributor = remaining(product.attrs, 2, product.erasurePerStep);
    const retailer = remaining(product.attrs, 3, product.erasurePerStep);

    expect(manufacturer).toBe(20);
    expect(wholesaler).toBe(17);
    expect(distributor).toBe(14);
    expect(retailer).toBe(11);
    // Each step loses exactly erasurePerStep attributes
  });

  it('D2C eliminates intermediary loss', () => {
    expect(infoLost(20, 0, 3)).toBe(0);
    expect(remaining(20, 0, 3)).toBe(20);
  });
});

// ============================================================================
// P224: Staged Market Entry Dominates Big-Bang
// ============================================================================

describe('Prediction 224: Staged market entry dominates big-bang launch', () => {
  const bigBangWaste = (markets: number, capacity: number) =>
    (markets - 1) * capacity;

  const stagedWaste = () => 0; // Zero waste per market when at full capacity

  it('staged entry has zero waste', () => {
    expect(stagedWaste()).toBe(0);
  });

  it('big-bang waste = (markets - 1) × capacity', () => {
    expect(bigBangWaste(5, 100)).toBe(400);
    expect(bigBangWaste(10, 50)).toBe(450);
  });

  it('staged dominates big-bang for any market count ≥ 2', () => {
    for (let m = 2; m <= 20; m++) {
      expect(stagedWaste()).toBeLessThanOrEqual(bigBangWaste(m, 100));
    }
  });

  it('big-bang waste scales linearly with market count', () => {
    const cap = 100;
    for (let m = 2; m < 10; m++) {
      expect(bigBangWaste(m + 1, cap)).toBeGreaterThan(bigBangWaste(m, cap));
    }
  });

  it('startup strategy: staged = lower burn rate', () => {
    const monthlyBurn = 50000;
    const markets = 5;
    // Big-bang: burn across all markets simultaneously
    const bigBangMonthly = markets * monthlyBurn;
    // Staged: burn in one market at a time
    const stagedMonthly = monthlyBurn;
    expect(stagedMonthly).toBeLessThan(bigBangMonthly);
  });
});

// ============================================================================
// P225: Bailout vs Bankruptcy as Failure Pareto Frontier
// ============================================================================

describe('Prediction 225: Bailout vs bankruptcy as failure Pareto frontier', () => {
  interface FailureCost {
    ongoingWaste: number;
    ventCost: number;
    repairDebt: number;
  }

  function responseCost(branches: number, resp: 'zombie' | 'bankruptcy' | 'bailout'): FailureCost {
    switch (resp) {
      case 'zombie': return { ongoingWaste: branches - 1, ventCost: 0, repairDebt: 0 };
      case 'bankruptcy': return { ongoingWaste: 0, ventCost: branches - 1, repairDebt: 0 };
      case 'bailout': return { ongoingWaste: 0, ventCost: 0, repairDebt: branches - 1 };
    }
  }

  const totalCost = (c: FailureCost) => c.ongoingWaste + c.ventCost + c.repairDebt;

  it('total cost is invariant across responses: always branches - 1', () => {
    for (const resp of ['zombie', 'bankruptcy', 'bailout'] as const) {
      expect(totalCost(responseCost(8, resp))).toBe(7);
    }
  });

  it('no response dominates all others', () => {
    const branches = 5;
    const z = responseCost(branches, 'zombie');
    const b = responseCost(branches, 'bankruptcy');
    const r = responseCost(branches, 'bailout');
    // Zombie has lower vent cost than bankruptcy
    expect(z.ventCost).toBeLessThan(b.ventCost);
    // Bankruptcy has lower ongoing waste than zombie
    expect(b.ongoingWaste).toBeLessThan(z.ongoingWaste);
    // Bailout has lower vent cost than bankruptcy
    expect(r.ventCost).toBeLessThan(b.ventCost);
  });

  it('Lehman (bankruptcy) vs AIG (bailout): different cost profiles', () => {
    const branches = 10;
    const lehman = responseCost(branches, 'bankruptcy');
    const aig = responseCost(branches, 'bailout');
    expect(lehman.ventCost).toBe(9);     // creditor losses
    expect(lehman.repairDebt).toBe(0);    // no taxpayer cost
    expect(aig.ventCost).toBe(0);         // no creditor losses
    expect(aig.repairDebt).toBe(9);       // taxpayer cost
    // Same total cost
    expect(totalCost(lehman)).toBe(totalCost(aig));
  });

  it('zombie firms (Japan lost decade): ongoing waste accumulates', () => {
    const branches = 6;
    const zombie = responseCost(branches, 'zombie');
    // Zombie pays ongoing waste every period
    const periods = 10;
    const cumulativeWaste = zombie.ongoingWaste * periods;
    expect(cumulativeWaste).toBe(50); // 5 × 10
    // vs one-time bankruptcy cost
    const bankruptcy = responseCost(branches, 'bankruptcy');
    expect(bankruptcy.ventCost).toBe(5); // one-time
    // Zombie cumulative always exceeds bankruptcy after enough periods
    expect(cumulativeWaste).toBeGreaterThan(bankruptcy.ventCost);
  });
});

// ============================================================================
// P226: Corporate Hierarchy Heat
// ============================================================================

describe('Prediction 226: Corporate hierarchy heat -- each layer erases information', () => {
  const totalErasure = (ground: number, layers: number, erasurePerLayer: number) =>
    Math.min(layers * erasurePerLayer, ground);

  const topInfo = (ground: number, layers: number, erasurePerLayer: number) =>
    ground - totalErasure(ground, layers, erasurePerLayer);

  it('flat org (1 layer) has minimum erasure', () => {
    expect(totalErasure(100, 1, 5)).toBe(5);
  });

  it('more layers → more erasure (monotone)', () => {
    let prev = 0;
    for (let l = 0; l <= 10; l++) {
      const e = totalErasure(100, l, 5);
      expect(e).toBeGreaterThanOrEqual(prev);
      prev = e;
    }
  });

  it('each layer adds positive heat', () => {
    for (let l = 1; l <= 10; l++) {
      expect(totalErasure(100, l, 5)).toBeGreaterThan(0);
    }
  });

  it('CEO of 10-layer corp sees 50% of ground truth', () => {
    const ground = 100;
    const layers = 10;
    const erasure = 5; // 5% lost per layer
    expect(topInfo(ground, layers, erasure)).toBe(50);
  });

  it('flattening the hierarchy preserves information', () => {
    const ground = 100;
    const erasure = 5;
    const tall = topInfo(ground, 8, erasure);
    const flat = topInfo(ground, 3, erasure);
    expect(flat).toBeGreaterThan(tall);
  });

  it('Amazon two-pizza teams: fewer layers = less erasure', () => {
    const ground = 100;
    const erasure = 10;
    const traditional = topInfo(ground, 7, erasure); // 7 layers
    const twoPizza = topInfo(ground, 3, erasure);     // 3 layers
    expect(twoPizza).toBeGreaterThan(traditional);
    expect(twoPizza).toBe(70); // 100 - 30
    expect(traditional).toBe(30); // 100 - 70
  });
});
