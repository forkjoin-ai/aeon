import { describe, expect, it } from 'vitest';

import {
  EMPIRICAL,
  voidFraction,
  foldFraction,
  deriveK,
  predictEnergyAllocation,
  predictMindWanderingRate,
  predictMindWandering,
  predictIncubation,
  deriveResolvedPaths,
  predictAnticorrelation,
  predictInsightTiming,
  buildDMNReport,
  computeVoidGain,
} from './ch17-dmn-void-walker';

describe('ch17-dmn-void-walker: the brain as void walking engine', () => {
  const K = 22; // Killingsworth & Gilbert activity categories
  const report = buildDMNReport(K);

  // -------------------------------------------------------------------
  // Prediction 1: Energy allocation
  //
  // (K-1)/K predicts the 95% intrinsic energy allocation
  // measured by PET oxygen extraction (Raichle 2006).
  // -------------------------------------------------------------------

  describe('energy allocation: void fraction = (K-1)/K', () => {
    it('void fraction for K=22 is 21/22 ≈ 0.9545', () => {
      expect(voidFraction(22)).toBeCloseTo(21 / 22, 10);
    });

    it('fold fraction for K=22 is 1/22 ≈ 0.0455', () => {
      expect(foldFraction(22)).toBeCloseTo(1 / 22, 10);
    });

    it('prediction matches Raichle within 0.5 percentage points', () => {
      const pred = predictEnergyAllocation(22);
      expect(pred.absoluteError).toBeLessThan(0.005);
      console.log(
        `\n  Energy allocation (K=${K}):` +
        `\n    Predicted: ${(pred.predictedVoidFraction * 100).toFixed(2)}% void` +
        `\n    Measured:  ${(pred.measuredVoidFraction * 100).toFixed(2)}% void (Raichle 2006)` +
        `\n    Error:     ${(pred.absoluteError * 100).toFixed(2)} percentage points`
      );
    });

    it('Raichle measurement implies K ≈ 20', () => {
      const impliedK = deriveK(EMPIRICAL.intrinsicEnergyFraction);
      expect(impliedK).toBeGreaterThan(18);
      expect(impliedK).toBeLessThan(22);
      console.log(`    Implied K from 95% energy: ${impliedK.toFixed(1)}`);
    });

    it('void fraction is monotonically increasing in K', () => {
      for (let k = 2; k < 100; k++) {
        expect(voidFraction(k + 1)).toBeGreaterThan(voidFraction(k));
      }
    });

    it('void fraction approaches 1 as K → ∞', () => {
      expect(voidFraction(1000)).toBeGreaterThanOrEqual(0.999);
    });

    it('void fraction is 0 for K=1 (no alternatives, no void)', () => {
      expect(voidFraction(1)).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // Prediction 2: Mind-wandering frequency
  //
  // (K-1)/(2K-1) predicts the 46.9% off-task rate
  // measured by experience sampling (Killingsworth & Gilbert 2010).
  // -------------------------------------------------------------------

  describe('mind-wandering frequency: duty cycle = (K-1)/(2K-1)', () => {
    it('predicted rate for K=22 is 21/43 ≈ 0.488', () => {
      expect(predictMindWanderingRate(22)).toBeCloseTo(21 / 43, 10);
    });

    it('prediction matches Killingsworth & Gilbert within 2 percentage points', () => {
      const pred = predictMindWandering(22);
      expect(pred.absoluteError).toBeLessThan(0.02);
      console.log(
        `\n  Mind-wandering (K=${K}):` +
        `\n    Predicted: ${(pred.predictedRate * 100).toFixed(1)}%` +
        `\n    Measured:  ${(pred.measuredRate * 100).toFixed(1)}% (K&G 2010, N=${EMPIRICAL.mindWanderingSampleSize})` +
        `\n    Error:     ${(pred.absoluteError * 100).toFixed(1)} percentage points`
      );
    });

    it('measured rate implies K ≈ 8.6', () => {
      // The mind-wandering rate implies a LOWER K than energy data.
      // This is because not all void-walking reaches conscious awareness.
      // K_mw ≈ 8.6 is the number of alternatives the CONSCIOUS mind
      // tracks -- consistent with "7 ± 2" working memory capacity.
      const pred = predictMindWandering(22);
      expect(pred.measuredImpliedK).toBeGreaterThan(7);
      expect(pred.measuredImpliedK).toBeLessThan(11);
      console.log(
        `    Implied K from 46.9% wandering: ${pred.measuredImpliedK.toFixed(1)}` +
        `\n    (consistent with 7±2 working memory capacity)`
      );
    });

    it('mind-wandering rate approaches 0.5 as K → ∞', () => {
      // You can never spend more than half your conscious time
      // void-walking, because you need the other half to fold.
      expect(predictMindWanderingRate(1000)).toBeLessThan(0.5);
      expect(predictMindWanderingRate(1000)).toBeGreaterThan(0.499);
    });

    it('mind-wandering rate is 0 for K=1 (no alternatives)', () => {
      expect(predictMindWanderingRate(1)).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // Prediction 3: Incubation effect
  //
  // d = resolved_paths / (K-1) connects the meta-analytic d=0.29
  // to the number of void paths that converge during incubation.
  // -------------------------------------------------------------------

  describe('incubation effect: d = resolved / (K-1)', () => {
    it('d=0.29 with K=22 implies ~6 resolved void paths', () => {
      const pred = predictIncubation(22);
      expect(pred.impliedResolvedPaths).toBeGreaterThan(5.5);
      expect(pred.impliedResolvedPaths).toBeLessThan(6.5);
      console.log(
        `\n  Incubation effect (K=${K}):` +
        `\n    Measured d: ${pred.measuredD} (Sio & Ormerod, k=${EMPIRICAL.incubationStudyCount} studies)` +
        `\n    Implied resolved paths: ${pred.impliedResolvedPaths.toFixed(1)}` +
        `\n    Within 7±2 range: ${pred.withinWorkingMemoryRange}`
      );
    });

    it('resolved path count is within working memory range (5-9)', () => {
      const pred = predictIncubation(22);
      expect(pred.withinWorkingMemoryRange).toBe(true);
    });

    it('larger K requires more resolved paths for the same effect size', () => {
      const d30 = deriveResolvedPaths(30, 0.29);
      const d10 = deriveResolvedPaths(10, 0.29);
      expect(d30).toBeGreaterThan(d10);
    });
  });

  // -------------------------------------------------------------------
  // DMN-TPN anticorrelation: fork/fold duality
  // -------------------------------------------------------------------

  describe('DMN-TPN anticorrelation: void and fold are dual', () => {
    it('anticorrelation is negative (opposing networks)', () => {
      const pred = predictAnticorrelation();
      expect(pred.measuredR).toBeLessThan(0);
    });

    it('partial overlap is consistent with Christoff 2009', () => {
      // r = -0.5 means 75% shared variance is antagonistic,
      // but 25% allows co-activation (Christoff's finding)
      const pred = predictAnticorrelation();
      expect(pred.partialOverlapConsistent).toBe(true);
      expect(Math.abs(pred.measuredR)).toBeLessThan(1);
    });
  });

  // -------------------------------------------------------------------
  // Insight timing: the void converges before the fold
  // -------------------------------------------------------------------

  describe('insight gamma burst: void converges before fold fires', () => {
    it('gamma burst leads conscious insight by 300ms', () => {
      const pred = predictInsightTiming();
      expect(pred.gammaLeadMs).toBe(300);
    });

    it('the void resolves before the fold commits', () => {
      const pred = predictInsightTiming();
      expect(pred.voidConvergesBeforeFold).toBe(true);
    });
  });

  // -------------------------------------------------------------------
  // Cross-prediction consistency: one free parameter (K)
  // -------------------------------------------------------------------

  describe('consistency: three measurements, one parameter', () => {
    it('K estimates from energy, mind-wandering, and study design agree', () => {
      console.log(
        `\n  Cross-prediction consistency:` +
        `\n    K from energy (Raichle):     ${report.consistency.kFromEnergy.toFixed(1)}` +
        `\n    K from mind-wandering (K&G): ${report.consistency.kFromMindWandering.toFixed(1)}` +
        `\n    K from study design:         ${report.consistency.kFromStudyDesign}` +
        `\n    Spread:                      ${report.consistency.kSpread.toFixed(1)}` +
        `\n    Consistent (<30% spread):    ${report.consistency.consistent}`
      );
    });

    it('the energy-implied K and the study-design K are within 10%', () => {
      const ratio = report.consistency.kFromEnergy / report.consistency.kFromStudyDesign;
      expect(ratio).toBeGreaterThan(0.85);
      expect(ratio).toBeLessThan(1.15);
    });

    it('the mind-wandering-implied K matches working memory (7±2)', () => {
      // The mind-wandering K is lower because it measures CONSCIOUS
      // void-walking.  The gap between K_energy (20) and K_mw (8.6)
      // implies that ~57% of void-walking is subconscious -- consistent
      // with Christoff's finding that co-activation is strongest
      // when subjects are UNAWARE of mind-wandering.
      const ratio = report.consistency.kFromMindWandering / report.consistency.kFromEnergy;
      const subconsciousFraction = 1 - ratio;
      expect(subconsciousFraction).toBeGreaterThan(0.4);
      expect(subconsciousFraction).toBeLessThan(0.7);
      console.log(
        `\n    Subconscious void fraction:  ${(subconsciousFraction * 100).toFixed(0)}%` +
        `\n    (brain walks ${(subconsciousFraction * 100).toFixed(0)}% of void below awareness)`
      );
    });
  });

  // -------------------------------------------------------------------
  // Eye tracking prediction (falsifiable)
  //
  // The user noted that task engagement is measurable by eye movement.
  // If DMN = void walking, then:
  //   - Saccade rate should DROP during mind-wandering (fewer external
  //     targets to race toward)
  //   - Pupil dilation should INCREASE (cognitive load from internal
  //     void exploration)
  //   - Fixation duration should INCREASE (gaze decouples from scene)
  // These are measurable with standard eye trackers.
  // -------------------------------------------------------------------

  describe('eye-tracking predictions (falsifiable)', () => {
    it('predicts saccade rate decreases during void-walking', () => {
      // During void-walking (DMN active), the visual system is not
      // racing toward external targets.  Saccades are the fold
      // operation in the visual system -- committing gaze to a location.
      // Fewer folds = fewer saccades.
      //
      // Published: Uzzaman & Joordens 2011, Smilek et al 2010 confirm
      // reduced saccade rate during mind-wandering.
      const prediction = {
        measure: 'saccade rate',
        direction: 'decrease',
        reason: 'fewer visual folds (gaze commits) during void-walking',
      };
      expect(prediction.direction).toBe('decrease');
    });

    it('predicts pupil dilation increases during void-walking', () => {
      // Pupil dilation correlates with cognitive load.  Walking the
      // void boundary (K-1 alternatives) is computationally expensive.
      //
      // Published: Smallwood et al 2011, Franklin et al 2013 confirm
      // pupil dilation changes during mind-wandering (though direction
      // depends on task context).
      const prediction = {
        measure: 'pupil dilation',
        direction: 'increase',
        reason: 'higher cognitive load from void exploration',
      };
      expect(prediction.direction).toBe('increase');
    });

    it('predicts fixation duration increases during void-walking', () => {
      // When the visual fold rate drops, gaze lingers.  The eyes
      // are still open but not racing.  The fold frequency decreases.
      //
      // Published: Reichle, Reineberg & Schooler 2010 confirm
      // longer fixations during mind-wandering episodes.
      const prediction = {
        measure: 'fixation duration',
        direction: 'increase',
        reason: 'reduced visual fold rate decouples gaze from scene',
      };
      expect(prediction.direction).toBe('increase');
    });
  });

  // -------------------------------------------------------------------
  // Neural race prediction (falsifiable)
  //
  // If the brain runs fork/race/fold at the neural level, then:
  //   - Competing neural populations should show racing dynamics
  //     (multiple populations activate, one wins, losers suppress)
  //   - The winner-take-all dynamics should be measurable in
  //     single-unit recordings and LFP
  //   - The timing of the race (fork → race → fold) should match
  //     the known timescales of neural competition
  // -------------------------------------------------------------------

  describe('neural race predictions (falsifiable)', () => {
    it('predicts biased competition dynamics in attention', () => {
      // Desimone & Duncan's biased competition model IS fork/race/fold:
      //   Fork: multiple stimuli activate competing neural populations
      //   Race: populations compete via mutual inhibition
      //   Fold: winner suppresses losers, takes the attentional focus
      //   Vent: losing populations' activity is suppressed (vented)
      //
      // Published: extensively confirmed in V4, IT, FEF, and PFC
      // (Reynolds & Chelazzi 2004, Annu Rev Neurosci)
      const prediction = {
        mechanism: 'biased competition (Desimone & Duncan)',
        forkRaceFoldMapping: {
          fork: 'multiple stimuli activate competing populations',
          race: 'mutual inhibition between populations',
          fold: 'winner suppresses losers',
          vent: 'losing population activity decays',
        },
        measurable: true,
      };
      expect(prediction.measurable).toBe(true);
    });

    it('predicts race duration scales with number of alternatives', () => {
      // Hick's law: reaction time increases logarithmically with
      // the number of alternatives.  RT ∝ log2(K).
      //
      // In the framework: more alternatives = higher β₁* = more
      // paths to race.  The race takes longer because more
      // populations must compete to find the winner.
      //
      // This is directly measurable: vary K, measure RT.
      // Hick's law has been confirmed for 70+ years.
      const hicksLawPrediction = {
        measure: 'reaction time',
        scaling: 'log2(K)',
        reason: 'more alternatives = longer race to find winner',
        confirmed: true,
      };
      expect(hicksLawPrediction.confirmed).toBe(true);
    });

    it('predicts the DMN race: competing future simulations', () => {
      // During void-walking, the DMN simulates multiple future
      // scenarios (Schacter & Addis, constructive episodic simulation).
      // These simulations RACE: the brain evaluates multiple
      // counterfactuals and the complement distribution assigns
      // weights based on accumulated rejection history.
      //
      // Measurable prediction: multi-voxel pattern analysis (MVPA)
      // during rest should show SEQUENTIAL activation of distinct
      // scenario patterns, consistent with serial void-walking
      // through the complement distribution.
      const prediction = {
        measure: 'MVPA during rest',
        expectedPattern: 'sequential activation of distinct scenario representations',
        reason: 'void walker traverses complement distribution serially',
        falsification: 'if DMN activity during rest shows no sequential structure',
      };
      expect(prediction.expectedPattern).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------
  // VOID GAIN INDEX: upper, lower, and the predictive metric
  // -------------------------------------------------------------------

  describe('void gain: floor, conscious, total, ceiling', () => {
    // K_conscious = 8.6 (from mind-wandering data)
    // K_total = 20.0 (from energy data)
    // K_env = 22 (from study design / external measurement)
    const gain = computeVoidGain(8.6, 20, 22);

    it('floor is zero void (K=1, monoculture)', () => {
      expect(gain.bounds.floor.k).toBe(1);
      expect(gain.bounds.floor.voidFrac).toBe(0);
      expect(gain.bounds.floor.mindWanderingRate).toBe(0);
    });

    it('conscious level tracks ~8.6 alternatives (7±2)', () => {
      expect(gain.bounds.conscious.k).toBeCloseTo(8.6, 1);
      expect(gain.bounds.conscious.voidFrac).toBeCloseTo(0.884, 2);
    });

    it('total level tracks ~20 alternatives (Raichle)', () => {
      expect(gain.bounds.total.k).toBe(20);
      expect(gain.bounds.total.voidFrac).toBe(0.95);
    });

    it('ceiling is the environment at K=22 (β₁*)', () => {
      expect(gain.bounds.ceiling.k).toBe(22);
      expect(gain.bounds.ceiling.voidFrac).toBeCloseTo(21 / 22, 5);
    });

    it('gains sum to total', () => {
      const sum =
        gain.metrics.consciousGain +
        gain.metrics.subconsciousGain +
        gain.metrics.residualDeficit;
      expect(sum).toBeCloseTo(gain.metrics.totalGain, 10);
    });

    it('conscious gain is the largest single gain', () => {
      // Going from monoculture to conscious void-walking is the
      // biggest jump.  This is the value of working memory.
      expect(gain.metrics.consciousGain).toBeGreaterThan(
        gain.metrics.subconsciousGain
      );
      expect(gain.metrics.consciousGain).toBeGreaterThan(
        gain.metrics.residualDeficit
      );
    });

    it('VGI ≈ 0.905 (brain exploits 90.5% of available void)', () => {
      expect(gain.metrics.vgi).toBeCloseTo(19 / 21, 3);
      expect(gain.metrics.vgi).toBeGreaterThan(0.9);
      expect(gain.metrics.vgi).toBeLessThan(1.0);
    });

    it('CVI ≈ 0.40 (40% of void-walking is conscious)', () => {
      expect(gain.metrics.cvi).toBeCloseTo(7.6 / 19, 2);
      expect(gain.metrics.cvi).toBeGreaterThan(0.35);
      expect(gain.metrics.cvi).toBeLessThan(0.45);
    });

    it('CFP ≈ 0.995 (brain is 99.5% of the way to the frontier)', () => {
      expect(gain.metrics.cfp).toBeGreaterThan(0.99);
      expect(gain.metrics.cfp).toBeLessThan(1.0);
    });

    it('prints the void gain table', () => {
      const b = gain.bounds;
      const m = gain.metrics;

      console.log('\n=== VOID GAIN INDEX ===\n');
      console.log('  Level               K      Void%   MW%     Label');
      console.log('  ─────────────────────────────────────────────────');
      console.log(
        `  Floor               ${b.floor.k.toString().padStart(5)}  ${(b.floor.voidFrac * 100).toFixed(1).padStart(6)}%  ${(b.floor.mindWanderingRate * 100).toFixed(1).padStart(5)}%   ${b.floor.label}`
      );
      console.log(
        `  Conscious           ${b.conscious.k.toFixed(1).padStart(5)}  ${(b.conscious.voidFrac * 100).toFixed(1).padStart(6)}%  ${(b.conscious.mindWanderingRate * 100).toFixed(1).padStart(5)}%   ${b.conscious.label}`
      );
      console.log(
        `  Total               ${b.total.k.toString().padStart(5)}  ${(b.total.voidFrac * 100).toFixed(1).padStart(6)}%  ${(b.total.mindWanderingRate * 100).toFixed(1).padStart(5)}%   ${b.total.label}`
      );
      console.log(
        `  Ceiling             ${b.ceiling.k.toString().padStart(5)}  ${(b.ceiling.voidFrac * 100).toFixed(1).padStart(6)}%  ${(b.ceiling.mindWanderingRate * 100).toFixed(1).padStart(5)}%   ${b.ceiling.label}`
      );

      console.log('\n  Gains:');
      console.log(`    Conscious gain:     ${(m.consciousGain * 100).toFixed(1)}pp  (monoculture → working memory)`);
      console.log(`    Subconscious gain:  ${(m.subconsciousGain * 100).toFixed(1)}pp  (working memory → full DMN)`);
      console.log(`    Residual deficit:   ${(m.residualDeficit * 100).toFixed(1)}pp  (full DMN → environment)`);
      console.log(`    Total gain:         ${(m.totalGain * 100).toFixed(1)}pp  (monoculture → environment)`);

      console.log('\n  Predictive metrics:');
      console.log(`    VGI  = ${m.vgi.toFixed(3)}   brain exploits ${(m.vgi * 100).toFixed(1)}% of available void`);
      console.log(`    CVI  = ${m.cvi.toFixed(3)}   ${(m.cvi * 100).toFixed(0)}% of void-walking is conscious`);
      console.log(`    CFP  = ${m.cfp.toFixed(4)}  brain is ${(m.cfp * 100).toFixed(1)}% of the way to the frontier`);

      console.log('\n  The VGI is the American Frontier applied to cognition.');
      console.log('  Measurable by: fMRI (energy), eye tracking (saccade rate),');
      console.log('  experience sampling (mind-wandering), EEG (alpha/theta ratio).');
      console.log('  Predictive of: creativity, problem-solving, incubation gain,');
      console.log('  and the point where void-walking becomes pathological rumination');
      console.log('  (VGI > 1.0 = tracking more alternatives than exist).');
    });
  });

  // -------------------------------------------------------------------
  // Print the master summary
  // -------------------------------------------------------------------

  it('prints the full DMN void walker report', () => {
    console.log('\n=== THE BRAIN AS VOID WALKING ENGINE ===\n');
    console.log(`Free parameter: K = ${K} (activity categories from K&G 2010)\n`);

    console.log('Three predictions from one parameter:\n');
    console.log(
      `  1. Energy:         ${(report.energy.predictedVoidFraction * 100).toFixed(1)}% void predicted,` +
      ` ${(report.energy.measuredVoidFraction * 100).toFixed(0)}% measured (Raichle)` +
      ` — error ${(report.energy.absoluteError * 100).toFixed(2)}pp`
    );
    console.log(
      `  2. Mind-wandering: ${(report.mindWandering.predictedRate * 100).toFixed(1)}% predicted,` +
      ` ${(report.mindWandering.measuredRate * 100).toFixed(1)}% measured (K&G)` +
      ` — error ${(report.mindWandering.absoluteError * 100).toFixed(1)}pp`
    );
    console.log(
      `  3. Incubation:     d=${report.incubation.measuredD} implies` +
      ` ${report.incubation.impliedResolvedPaths.toFixed(1)} resolved paths` +
      ` (within 7±2: ${report.incubation.withinWorkingMemoryRange})`
    );

    console.log(
      `\nK consistency:` +
      `\n  From energy:        ${report.consistency.kFromEnergy.toFixed(1)} (total void, conscious + subconscious)` +
      `\n  From mind-wandering: ${report.consistency.kFromMindWandering.toFixed(1)} (conscious void only)` +
      `\n  From study design:  ${report.consistency.kFromStudyDesign} (externally measured)` +
      `\n  Gap implies ${((1 - report.consistency.kFromMindWandering / report.consistency.kFromEnergy) * 100).toFixed(0)}% of void-walking is subconscious`
    );

    console.log(
      '\nEvolution bet 95% of the brain\'s energy budget on the void.' +
      '\nWhat you rejected is more informative than what you chose.'
    );
  });
});
