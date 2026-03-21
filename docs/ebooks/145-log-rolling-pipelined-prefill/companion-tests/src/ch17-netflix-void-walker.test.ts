import { describe, expect, it } from 'vitest';

import {
  SeededRNG,
  generateDataset,
  createFamilies,
  complementDistribution,
  voidEntropy,
  createVoidBoundary,
  evalMonoculture,
  evalVoidWalker,
  runMonocultureLimitExperiment,
  runOracleExperiment,
} from './ch17-netflix-void-walker';

describe('ch17-netflix-void-walker', () => {
  // -------------------------------------------------------------------
  // Primitives
  // -------------------------------------------------------------------

  it('SeededRNG is deterministic', () => {
    const a = new SeededRNG(42);
    const b = new SeededRNG(42);
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('SeededRNG produces values in [0, 1)', () => {
    const rng = new SeededRNG(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('complement distribution sums to 1', () => {
    const boundary = { ventCounts: [10, 5, 20, 3], foldCount: 38, eta: 0.1 };
    const dist = complementDistribution(boundary);
    const sum = dist.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('complement distribution suppresses high-vent families', () => {
    const boundary = { ventCounts: [100, 0, 50, 0], foldCount: 100, eta: 0.1 };
    const dist = complementDistribution(boundary);
    // Family 1 and 3 (0 vents) should have higher weight than 0 and 2
    expect(dist[1]).toBeGreaterThan(dist[0]);
    expect(dist[3]).toBeGreaterThan(dist[2]);
    expect(dist[0]).toBeLessThan(dist[2]); // 100 vents < 50 vents
  });

  it('void entropy is maximal when all families are equally vented', () => {
    const boundary = createVoidBoundary(4, 0.1);
    const maxEntropy = Math.log2(4);
    expect(voidEntropy(boundary)).toBeCloseTo(maxEntropy, 5);
  });

  it('void entropy decreases when one family dominates the void', () => {
    const uniform = createVoidBoundary(4, 0.1);
    const skewed = { ventCounts: [100, 0, 0, 0], foldCount: 100, eta: 0.1 };
    expect(voidEntropy(skewed)).toBeLessThan(voidEntropy(uniform));
  });

  // -------------------------------------------------------------------
  // Data generation
  // -------------------------------------------------------------------

  it('generates a reproducible dataset', () => {
    const d1 = generateDataset(6, 50, 20, 10, 42);
    const d2 = generateDataset(6, 50, 20, 10, 42);
    expect(d1.users.length).toBe(d2.users.length);
    expect(d1.ratings.length).toBe(d2.ratings.length);
    expect(d1.ratings[0].actual).toBe(d2.ratings[0].actual);
  });

  it('ratings are in [1, 5]', () => {
    const d = generateDataset(6, 50, 20, 10, 42);
    for (const r of d.ratings) {
      expect(r.actual).toBeGreaterThanOrEqual(1);
      expect(r.actual).toBeLessThanOrEqual(5);
    }
  });

  it('creates algorithm families with partial visibility', () => {
    const families = createFamilies(8);
    expect(families.length).toBeGreaterThanOrEqual(4);

    // No family sees everything
    for (const f of families) {
      const visCount = f.visibility.filter(Boolean).length;
      expect(visCount).toBeLessThan(8);
      expect(visCount).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------
  // Monoculture evaluation
  // -------------------------------------------------------------------

  it('monoculture RMSE is deterministic', () => {
    const d = generateDataset(6, 100, 50, 20, 42);
    const families = createFamilies(6);
    const r1 = evalMonoculture(d, families[0], 1);
    const r2 = evalMonoculture(d, families[0], 1);
    expect(r1.rmse).toBe(r2.rmse);
  });

  it('monoculture RMSE is positive and bounded', () => {
    const d = generateDataset(6, 100, 50, 20, 42);
    const families = createFamilies(6);
    for (const f of families) {
      const result = evalMonoculture(d, f, 1);
      expect(result.rmse).toBeGreaterThan(0);
      expect(result.rmse).toBeLessThan(3); // sanity
    }
  });

  // -------------------------------------------------------------------
  // Void walker evaluation
  // -------------------------------------------------------------------

  it('void walker RMSE is deterministic', () => {
    const d = generateDataset(6, 100, 50, 20, 42);
    const families = createFamilies(6);
    const r1 = evalVoidWalker(d, families, 0.01, 100);
    const r2 = evalVoidWalker(d, families, 0.01, 100);
    expect(r1.rmse).toBe(r2.rmse);
  });

  it('void walker tracks win shares across families', () => {
    const d = generateDataset(6, 200, 100, 30, 42);
    const families = createFamilies(6);
    const result = evalVoidWalker(d, families, 0.01, 100);

    // Win shares should sum to approximately 1
    const shareSum = result.winShareByFamily.reduce(
      (a: number, b: number) => a + b,
      0
    );
    expect(shareSum).toBeCloseTo(1.0, 5);

    // No family should win 0% (each covers some unique dimension)
    for (const share of result.winShareByFamily) {
      expect(share).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------
  // THE KEY DEMONSTRATION: monoculture limit
  // -------------------------------------------------------------------

  describe('monoculture limit experiment', () => {
    const experiment = runMonocultureLimitExperiment(
      8,   // 8 latent dims (true beta_1*)
      500, // 500 users
      200, // 200 movies
      40,  // 40 ratings per user
      0.01, // eta
      42   // seed
    );

    it('generates the expected scale', () => {
      expect(experiment.latentDims).toBe(8);
      expect(experiment.userCount).toBe(500);
      expect(experiment.movieCount).toBe(200);
      expect(experiment.ratingCount).toBeGreaterThan(10000);
      expect(experiment.familyCount).toBeGreaterThanOrEqual(4);
    });

    it('the void-walking ensemble beats the best monoculture (pigeonhole witness)', () => {
      expect(experiment.frontierProperties.ensembleBeatsBestMonoculture).toBe(
        true
      );
      expect(experiment.monocultureGap).toBeGreaterThan(0);
      console.log(
        `  best monoculture RMSE: ${experiment.bestMonocultureRmse.toFixed(4)}`
      );
      console.log(
        `  void walker RMSE:      ${experiment.voidWalkerResult.rmse.toFixed(4)}`
      );
      console.log(
        `  gap:                   ${experiment.monocultureGap.toFixed(4)}`
      );
    });

    it('every monoculture has positive waste vs the ensemble', () => {
      expect(experiment.frontierProperties.allMonoculturePositiveWaste).toBe(
        true
      );
      for (const mono of experiment.monocultureResults) {
        expect(mono.rmse).toBeGreaterThan(experiment.voidWalkerResult.rmse);
      }
    });

    it('no family wins everything (non-degenerate win shares)', () => {
      // This proves the taste space has multiple dimensions that
      // different families cover.  If one family won everything,
      // the taste space would be one-dimensional.
      expect(experiment.frontierProperties.nonDegenerateWinShares).toBe(true);
      console.log('  win shares:');
      for (const ws of experiment.winShares) {
        console.log(
          `    ${ws.name}: ${(ws.share * 100).toFixed(1)}%`
        );
      }
    });

    it('the void learned structure (entropy < maximum)', () => {
      // The void boundary's entropy should be less than log2(K)
      // because the walker discovered which families fail where.
      // If no family were ever systematically worse, entropy would
      // remain at maximum.
      expect(experiment.frontierProperties.voidLearnedStructure).toBe(true);
      const maxEntropy = Math.log2(experiment.familyCount);
      console.log(
        `  void entropy: ${experiment.voidWalkerResult.finalEntropy.toFixed(3)} / ${maxEntropy.toFixed(3)} (max)`
      );
    });

    it('monoculture RMSE table shows each family has unique blind spots', () => {
      const rmses = experiment.monocultureResults.map((r) => r.rmse);
      // No two families should have identical RMSE (different visibility)
      for (let i = 0; i < rmses.length; i++) {
        for (let j = i + 1; j < rmses.length; j++) {
          expect(Math.abs(rmses[i] - rmses[j])).toBeGreaterThan(0.001);
        }
      }
    });

    it('prints the full experiment summary', () => {
      console.log('\n=== MONOCULTURE LIMIT EXPERIMENT ===');
      console.log(
        `Latent dims (true β₁*): ${experiment.latentDims}`
      );
      console.log(
        `Users: ${experiment.userCount}, Movies: ${experiment.movieCount}, Ratings: ${experiment.ratingCount}`
      );
      console.log(
        `Algorithm families: ${experiment.familyCount}`
      );
      console.log('\nMonoculture ceilings:');
      for (const r of experiment.monocultureResults) {
        console.log(`  ${r.strategyName}: RMSE = ${r.rmse.toFixed(4)}`);
      }
      console.log(
        `\nBest monoculture: RMSE = ${experiment.bestMonocultureRmse.toFixed(4)}`
      );
      console.log(
        `Void walker:      RMSE = ${experiment.voidWalkerResult.rmse.toFixed(4)}`
      );
      console.log(
        `Gap (monoculture waste): ${experiment.monocultureGap.toFixed(4)}`
      );
      console.log(
        `\nThis gap is the pigeonhole witness: no single family`
      );
      console.log(
        `covers all ${experiment.latentDims} taste dimensions, so`
      );
      console.log(
        `monoculture forces information erasure.`
      );
    });
  });

  // -------------------------------------------------------------------
  // ORACLE EXPERIMENT: Time-traveling through the void
  //
  // The void walked the future, learned what fails.  Now we go back
  // and use that knowledge to design the best possible single strategy.
  // This is fork/race/fold time travel: the void creates a new fork
  // (a sibling timeline) where the monoculture was designed with
  // perfect hindsight.  But even in that timeline, monoculture loses.
  //
  // The theory doesn't say you can't go back in time.  It says going
  // back creates a new fork -- a sibling timeline.  And in every
  // sibling timeline, the irreducible cost of monoculture persists.
  // -------------------------------------------------------------------

  describe('oracle experiment: time travel through the void', () => {
    const oracle = runOracleExperiment(
      8,    // 8 latent dims
      500,  // 500 users
      200,  // 200 movies
      40,   // 40 ratings per user
      0.01, // eta
      42    // seed
    );

    it('the void-designed oracle cannot beat the ensemble', () => {
      // The void told us exactly which dimensions matter most.
      // We designed the single best visibility mask using that knowledge.
      // It still loses.  The gap is the irreducible cost of monoculture.
      expect(oracle.proofs.voidOracleCannotBeatEnsemble).toBe(true);
      expect(oracle.gaps.voidDesignedVsEnsemble).toBeGreaterThan(0);
      console.log(
        `\n  Void-designed oracle RMSE: ${oracle.voidDesignedOracle.rmse.toFixed(4)}`
      );
      console.log(
        `  Ensemble RMSE:             ${oracle.ensemble.rmse.toFixed(4)}`
      );
      console.log(
        `  Gap (irreducible):         ${oracle.gaps.voidDesignedVsEnsemble.toFixed(4)}`
      );
    });

    it('god-mode beats the ensemble -- but is unrealizable', () => {
      // A model that sees EVERY dimension -- no blind spots at all.
      // It beats the ensemble!  But it requires a single algorithm
      // that perfectly models every aspect of user taste simultaneously.
      // No such algorithm exists.  This is the realization gap:
      // the only monoculture that beats diversity is one that requires
      // solving the problem you're trying to solve.
      expect(oracle.proofs.godModeBeatsEnsembleButUnrealizable).toBe(true);
      expect(oracle.gaps.godModeVsEnsemble).toBeLessThan(0);
      console.log(
        `\n  God-mode oracle RMSE:      ${oracle.godModeOracle.rmse.toFixed(4)}`
      );
      console.log(
        `  Ensemble RMSE:             ${oracle.ensemble.rmse.toFixed(4)}`
      );
      console.log(
        `  Gap (god-mode advantage):  ${(-oracle.gaps.godModeVsEnsemble).toFixed(4)}`
      );
      console.log(
        `  But god-mode is UNREALIZABLE: no single algorithm`
      );
      console.log(
        `  can see all ${8} taste dimensions simultaneously.`
      );
    });

    it('even god-mode loses to the diversity ceiling', () => {
      // The per-rating oracle (omniscient diversity) still beats god-mode.
      // Even with perfect coverage, monoculture's noise is not averaged
      // away.  Diversity wins at every level of the hierarchy.
      expect(oracle.proofs.godModeLosesToDiversityCeiling).toBe(true);
      console.log(
        `\n  God-mode RMSE:             ${oracle.godModeOracle.rmse.toFixed(4)}`
      );
      console.log(
        `  Per-rating oracle RMSE:    ${oracle.perRatingOracle.rmse.toFixed(4)}`
      );
      console.log(
        `  Even omniscient monoculture < omniscient diversity`
      );
    });

    it('the per-rating oracle IS a diversity strategy, not monoculture', () => {
      // The only way to reach the ceiling is to use a DIFFERENT family
      // for each rating -- which is diversity by definition.
      // The oracle that achieves this is not a single strategy applied
      // uniformly.  It is the maximally diverse strategy: every rating
      // gets its own fork.
      expect(oracle.proofs.perRatingOracleIsDiversity).toBe(true);
      console.log(
        `\n  Per-rating oracle RMSE:    ${oracle.perRatingOracle.rmse.toFixed(4)}`
      );
      console.log(
        `  Best naive monoculture:    ${oracle.bestNaiveMonoculture.rmse.toFixed(4)}`
      );
      console.log(
        `  Per-rating beats mono by:  ${(oracle.bestNaiveMonoculture.rmse - oracle.perRatingOracle.rmse).toFixed(4)}`
      );
    });

    it('the per-rating oracle is the theoretical ceiling', () => {
      // With omniscient routing (knowing the actual answer), you can
      // always pick the best family.  This is the ceiling.
      // The ensemble approaches this ceiling without omniscience.
      expect(oracle.proofs.perRatingOracleIsCeiling).toBe(true);
      console.log(
        `\n  Per-rating oracle RMSE:    ${oracle.perRatingOracle.rmse.toFixed(4)}`
      );
      console.log(
        `  Ensemble RMSE:             ${oracle.ensemble.rmse.toFixed(4)}`
      );
      console.log(
        `  Ceiling gap:               ${oracle.gaps.perRatingVsEnsemble.toFixed(4)}`
      );
    });

    it('prints the hierarchy of strategies', () => {
      const strategies = [
        { name: 'Best naive monoculture', rmse: oracle.bestNaiveMonoculture.rmse, type: 'REAL-MONO' },
        { name: 'Void-designed oracle mono', rmse: oracle.voidDesignedOracle.rmse, type: 'REAL-MONO' },
        { name: 'Void-walking ensemble', rmse: oracle.ensemble.rmse, type: 'REAL-DIV ' },
        { name: 'God-mode oracle mono', rmse: oracle.godModeOracle.rmse, type: 'UNRL-MONO' },
        { name: 'Per-rating oracle routing', rmse: oracle.perRatingOracle.rmse, type: 'UNRL-DIV ' },
      ].sort((a, b) => b.rmse - a.rmse);

      console.log('\n=== STRATEGY HIERARCHY (worst to best) ===\n');
      for (const s of strategies) {
        console.log(`  [${s.type}] ${s.rmse.toFixed(4)}  ${s.name}`);
      }

      console.log('\n  ═══ REALIZABLE BOUNDARY ═══');
      console.log('  Above: strategies a real system can implement.');
      console.log('  Below: strategies requiring omniscience.');
      console.log('');
      console.log('  Among realizable strategies, EVERY monoculture');
      console.log('  is above the ensemble.  The void-designed oracle');
      console.log('  used time travel -- walked the future, came back,');
      console.log('  designed the perfect single model -- and STILL lost.');
      console.log(`  Gap: ${oracle.gaps.voidDesignedVsEnsemble.toFixed(4)} RMSE.`);
      console.log('');
      console.log('  The only monoculture that beats the ensemble is');
      console.log('  god-mode (all dims visible), which is unrealizable.');
      console.log('  And even god-mode loses to the diversity ceiling');
      console.log('  (per-rating oracle routing).');
      console.log('');
      console.log('  Time travel creates a sibling fork, not a rewrite.');
      console.log('  In every fork, diversity beats realizable monoculture.');
      console.log('  The cost is structural, not temporal.');
    });
  });
});
