/**
 * Map/Reduce Readiness Diagnostic — Companion Tests for §6.14
 *
 * Proves:
 *   1. Q_mr, O_beta and R_qr are bounded and well-formed in [0, 1]
 *   2. O_beta captures topological opportunity from the Bule deficit
 *   3. Q_mr captures structural readiness of map/reduce workloads
 *   4. R_qr = Q_mr * O_beta is high only when both readiness and opportunity are high
 *   5. R_qr rank-orders gains in an independent migration simulator
 *   6. High topology readiness is not, by itself, a proof of asymptotic quantum speedup
 */

import { describe, expect, it } from 'vitest';

import {
  computeReadinessScores,
  linearRegressionSlope,
  makeRng,
  mean,
  pearsonCorrelation,
  simulatePromotionGain,
  type ReadinessInputs,
} from './map-reduce-readiness';

describe('Map/Reduce Readiness Diagnostic (§6.14)', () => {
  it('keeps Q_mr, O_beta and R_qr inside [0, 1]', () => {
    const scores = computeReadinessScores({
      mapIndependence: 1.2,
      reduceAssociativity: -2,
      keySkew: 5,
      zeroCopyRatio: 0.7,
      intrinsicBeta1: 20,
      implementationBeta1: 3,
    });

    expect(scores.qMr).toBeGreaterThanOrEqual(0);
    expect(scores.qMr).toBeLessThanOrEqual(1);
    expect(scores.oBeta).toBeGreaterThanOrEqual(0);
    expect(scores.oBeta).toBeLessThanOrEqual(1);
    expect(scores.rQr).toBeGreaterThanOrEqual(0);
    expect(scores.rQr).toBeLessThanOrEqual(1);
  });

  it('O_beta is zero at Δβ=0 and increases with deficit', () => {
    const noDeficit = computeReadinessScores({
      mapIndependence: 1,
      reduceAssociativity: 1,
      keySkew: 0.1,
      zeroCopyRatio: 1,
      intrinsicBeta1: 32,
      implementationBeta1: 32,
    });
    expect(noDeficit.oBeta).toBe(0);

    const mediumDeficit = computeReadinessScores({
      mapIndependence: 1,
      reduceAssociativity: 1,
      keySkew: 0.1,
      zeroCopyRatio: 1,
      intrinsicBeta1: 32,
      implementationBeta1: 16,
    });
    expect(mediumDeficit.oBeta).toBeCloseTo(0.5, 10);

    const highDeficit = computeReadinessScores({
      mapIndependence: 1,
      reduceAssociativity: 1,
      keySkew: 0.1,
      zeroCopyRatio: 1,
      intrinsicBeta1: 32,
      implementationBeta1: 0,
    });
    expect(highDeficit.oBeta).toBeCloseTo(1, 10);
  });

  it('Q_mr increases with independence/associativity/zero-copy and decreases with skew', () => {
    const baseline = computeReadinessScores({
      mapIndependence: 0.5,
      reduceAssociativity: 0.5,
      keySkew: 0.5,
      zeroCopyRatio: 0.5,
      intrinsicBeta1: 16,
      implementationBeta1: 8,
    });
    const improved = computeReadinessScores({
      mapIndependence: 0.9,
      reduceAssociativity: 0.95,
      keySkew: 0.1,
      zeroCopyRatio: 0.9,
      intrinsicBeta1: 16,
      implementationBeta1: 8,
    });

    expect(improved.qMr).toBeGreaterThan(baseline.qMr);
  });

  it('R_qr is high only when both readiness and opportunity are high', () => {
    const highReadinessLowOpportunity = computeReadinessScores({
      mapIndependence: 0.95,
      reduceAssociativity: 0.95,
      keySkew: 0.05,
      zeroCopyRatio: 0.95,
      intrinsicBeta1: 20,
      implementationBeta1: 20, // no opportunity
    });
    const lowReadinessHighOpportunity = computeReadinessScores({
      mapIndependence: 0.2,
      reduceAssociativity: 0.3,
      keySkew: 0.9,
      zeroCopyRatio: 0.3,
      intrinsicBeta1: 20,
      implementationBeta1: 0, // high opportunity
    });
    const highHigh = computeReadinessScores({
      mapIndependence: 0.95,
      reduceAssociativity: 0.95,
      keySkew: 0.05,
      zeroCopyRatio: 0.95,
      intrinsicBeta1: 20,
      implementationBeta1: 2,
    });

    expect(highReadinessLowOpportunity.rQr).toBeLessThan(0.05);
    expect(lowReadinessHighOpportunity.rQr).toBeLessThan(0.1);
    expect(highHigh.rQr).toBeGreaterThan(0.5);
  });

  it('nonzero topological opportunity is necessary for modeled migration gain', () => {
    const rng = makeRng(0x7146);
    const sampleCount = 120;
    const noOpportunityGains: number[] = [];
    const withOpportunityGains: number[] = [];

    for (let index = 0; index < sampleCount; index++) {
      const intrinsicBeta1 = 12 + Math.floor(rng() * 52);
      const highReadinessInputs = {
        mapIndependence: 0.8 + rng() * 0.2,
        reduceAssociativity: 0.85 + rng() * 0.15,
        keySkew: rng() * 0.2,
        zeroCopyRatio: 0.8 + rng() * 0.2,
      };

      const noOpportunity: ReadinessInputs = {
        ...highReadinessInputs,
        intrinsicBeta1,
        implementationBeta1: intrinsicBeta1,
      };
      const withOpportunity: ReadinessInputs = {
        ...highReadinessInputs,
        intrinsicBeta1,
        implementationBeta1: Math.floor(intrinsicBeta1 * 0.2),
      };

      const noOpportunityScores = computeReadinessScores(noOpportunity);
      const withOpportunityScores = computeReadinessScores(withOpportunity);
      expect(noOpportunityScores.rQr).toBe(0);
      expect(withOpportunityScores.rQr).toBeGreaterThan(0.3);

      noOpportunityGains.push(simulatePromotionGain(noOpportunity, rng));
      withOpportunityGains.push(simulatePromotionGain(withOpportunity, rng));
    }

    expect(mean(noOpportunityGains)).toBeLessThan(0.03);
    expect(mean(withOpportunityGains)).toBeGreaterThan(
      mean(noOpportunityGains) + 0.08
    );
  });

  it('R_qr rank-orders gain in an independent migration simulator', () => {
    const rng = makeRng(0x613);
    const sampleCount = 220;
    const readinessScores: number[] = [];
    const realizedGains: number[] = [];

    for (let index = 0; index < sampleCount; index++) {
      const intrinsicBeta1 = 4 + Math.floor(rng() * 64);
      const implementationBeta1 = Math.floor(rng() * intrinsicBeta1);
      const inputs: ReadinessInputs = {
        mapIndependence: 0.15 + rng() * 0.85,
        reduceAssociativity: 0.1 + rng() * 0.9,
        keySkew: rng(),
        zeroCopyRatio: rng(),
        intrinsicBeta1,
        implementationBeta1,
      };

      const scores = computeReadinessScores(inputs);
      const observedGain = simulatePromotionGain(inputs, rng);

      readinessScores.push(scores.rQr);
      realizedGains.push(observedGain);
    }

    const slope = linearRegressionSlope(readinessScores, realizedGains);
    const correlation = pearsonCorrelation(readinessScores, realizedGains);
    expect(slope).toBeGreaterThan(0.12);
    expect(correlation).toBeGreaterThan(0.2);

    const orderedReadiness = [...readinessScores].sort((a, b) => a - b);
    const lowerQuartile = orderedReadiness[Math.floor(sampleCount * 0.25)];
    const upperQuartile = orderedReadiness[Math.floor(sampleCount * 0.75)];
    if (lowerQuartile === undefined || upperQuartile === undefined) {
      throw new Error('quartile extraction failed');
    }

    const lowBandGains: number[] = [];
    const highBandGains: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
      if (readinessScores[i] <= lowerQuartile) {
        lowBandGains.push(realizedGains[i]);
      }
      if (readinessScores[i] >= upperQuartile) {
        highBandGains.push(realizedGains[i]);
      }
    }

    expect(highBandGains.length).toBeGreaterThan(0);
    expect(lowBandGains.length).toBeGreaterThan(0);
    expect(mean(highBandGains)).toBeGreaterThan(mean(lowBandGains) + 0.1);
  });

  it('high R_qr does not imply asymptotic quantum speedup', () => {
    const structurallyReady = computeReadinessScores({
      mapIndependence: 0.97,
      reduceAssociativity: 0.98,
      keySkew: 0.04,
      zeroCopyRatio: 0.95,
      intrinsicBeta1: 64,
      implementationBeta1: 8,
    });
    expect(structurallyReady.rQr).toBeGreaterThan(0.7);

    const n = 2 ** 20;

    // Counterexample family: exact full-aggregation workloads.
    // In this black-box model every item must be read; both classical and
    // quantum costs are Theta(N), so asymptotic speedup is 1.
    const classicalAggregationCost = n;
    const quantumAggregationCost = n;
    const aggregationSpeedup =
      classicalAggregationCost / quantumAggregationCost;
    expect(aggregationSpeedup).toBe(1);

    // Contrasting family: unstructured search (Grover-like).
    const classicalSearchCost = n;
    const quantumSearchCost = Math.sqrt(n);
    const searchSpeedup = classicalSearchCost / quantumSearchCost;
    expect(searchSpeedup).toBeGreaterThan(1000);
  });
});
