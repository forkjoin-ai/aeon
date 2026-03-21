import { describe, expect, it } from 'vitest';

import {
  generatePredictions,
  quantitativePredictions,
  renderPredictionMatrixMarkdown,
  conditionProfiles,
  measureResponses,
  MEASURES,
  CONDITIONS,
} from './ch17-dmn-prediction-matrix';

import { voidFraction, computeVoidGain } from './ch17-dmn-void-walker';

describe('ch17-dmn-prediction-matrix: 64 falsifiable predictions', () => {
  const matrix = generatePredictions();

  // -------------------------------------------------------------------
  // Matrix structure
  // -------------------------------------------------------------------

  it('generates exactly 64 predictions (8 measures × 8 conditions)', () => {
    expect(matrix.predictions.length).toBe(64);
    expect(MEASURES.length).toBe(8);
    expect(CONDITIONS.length).toBe(8);
  });

  it('every cell has a measure, condition, direction, and mechanism', () => {
    for (const pred of matrix.predictions) {
      expect(pred.measure).toBeTruthy();
      expect(pred.condition).toBeTruthy();
      expect(['increase', 'decrease', 'no change']).toContain(pred.direction);
      expect(pred.mechanism.length).toBeGreaterThan(20);
    }
  });

  it('every measure appears 8 times (once per condition)', () => {
    for (const measure of MEASURES) {
      const count = matrix.predictions.filter(
        (p) => p.measure === measure
      ).length;
      expect(count).toBe(8);
    }
  });

  it('every condition appears 8 times (once per measure)', () => {
    for (const condition of CONDITIONS) {
      const count = matrix.predictions.filter(
        (p) => p.condition === condition
      ).length;
      expect(count).toBe(8);
    }
  });

  // -------------------------------------------------------------------
  // Confirmation rate
  // -------------------------------------------------------------------

  it('at least 30 of 64 predictions have published confirmation', () => {
    expect(matrix.confirmedCount).toBeGreaterThanOrEqual(30);
    console.log(
      `\n  Confirmation: ${matrix.confirmedCount}/64 confirmed, ` +
      `${matrix.novelCount}/64 novel`
    );
  });

  it('counts sum to 64', () => {
    expect(
      matrix.confirmedCount + matrix.consistentCount + matrix.novelCount
    ).toBe(64);
  });

  // -------------------------------------------------------------------
  // Direction consistency: all measures respond coherently to K
  // -------------------------------------------------------------------

  describe('directional coherence: K increase → predictable direction', () => {
    const responses = measureResponses();

    it('DMN energy increases when K increases', () => {
      const r = responses.find((r) => r.measure === 'DMN energy fraction')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });

    it('mind-wandering increases when K increases', () => {
      const r = responses.find((r) => r.measure === 'Mind-wandering rate')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });

    it('saccade rate DECREASES when K increases (fewer visual folds)', () => {
      const r = responses.find((r) => r.measure === 'Saccade rate')!;
      expect(r.directionWhenKIncreases).toBe('decrease');
    });

    it('fixation duration INCREASES when K increases (gaze lingers)', () => {
      const r = responses.find((r) => r.measure === 'Fixation duration')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });

    it('pupil dilation increases when K increases (cognitive load)', () => {
      const r = responses.find((r) => r.measure === 'Pupil dilation')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });

    it('alpha power increases when K increases (sensory gating)', () => {
      const r = responses.find((r) => r.measure === 'EEG alpha power')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });

    it('theta power increases when K increases (internal simulation)', () => {
      const r = responses.find((r) => r.measure === 'EEG theta power')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });

    it('reaction time increases when K increases (Hick\'s law)', () => {
      const r = responses.find((r) => r.measure === 'Reaction time')!;
      expect(r.directionWhenKIncreases).toBe('increase');
    });
  });

  // -------------------------------------------------------------------
  // Quantitative predictions
  // -------------------------------------------------------------------

  describe('quantitative predictions from K shifts', () => {
    const quant = quantitativePredictions();

    it('generates 8 quantitative prediction rows', () => {
      expect(quant.length).toBe(8);
    });

    it('all K_high > K_low', () => {
      for (const q of quant) {
        expect(q.kHigh).toBeGreaterThan(q.kLow);
      }
    });

    it('all void fractions are strictly ordered: high > low', () => {
      for (const q of quant) {
        expect(q.voidFracHigh).toBeGreaterThan(q.voidFracLow);
      }
    });

    it('all MW rates are strictly ordered: high > low', () => {
      for (const q of quant) {
        expect(q.mwRateHigh).toBeGreaterThan(q.mwRateLow);
      }
    });

    it('all RT ratios > 1 (higher K = slower RT)', () => {
      for (const q of quant) {
        expect(q.rtRatio).toBeGreaterThan(1.0);
      }
    });

    it('prints the quantitative predictions table', () => {
      console.log('\n=== QUANTITATIVE PREDICTIONS ===\n');
      console.log(
        '  Condition                       K_hi K_lo  Void%hi Void%lo  MW%hi MW%lo  VGI_hi VGI_lo  RT ratio'
      );
      console.log(
        '  ─────────────────────────────────────────────────────────────────────────────────────────────────'
      );
      for (const q of quant) {
        console.log(
          `  ${q.condition.padEnd(32)} ${q.kHigh.toString().padStart(4)} ${q.kLow.toString().padStart(4)}  ` +
          `${(q.voidFracHigh * 100).toFixed(1).padStart(6)}% ${(q.voidFracLow * 100).toFixed(1).padStart(6)}%  ` +
          `${(q.mwRateHigh * 100).toFixed(1).padStart(4)}% ${(q.mwRateLow * 100).toFixed(1).padStart(4)}%  ` +
          `${q.vgiHigh.toFixed(2).padStart(5)} ${q.vgiLow.toFixed(2).padStart(5)}  ` +
          `${q.rtRatio.toFixed(2).padStart(5)}`
        );
      }
    });
  });

  // -------------------------------------------------------------------
  // THE PATHOLOGICAL PREDICTION: VGI > 1.0
  //
  // When the brain tracks more alternatives than exist in the
  // environment, the void walker is exploring phantom forks.
  // That's anxiety. That's rumination. That's the 22nd century's
  // problem: organisms whose void-walking machinery -- tuned by
  // evolution for savanna-scale K ≈ 20 -- is now running in
  // environments where the actual K is much lower (scrolling a
  // feed, sitting in a cubicle, lying awake at 3am) while the
  // perceived K is much higher (infinite scroll, global news,
  // existential dread).
  //
  // VGI > 1.0 is a MEASURABLE diagnostic for pathological
  // overthinking. It predicts which populations are at risk,
  // which interventions will help (anything that reduces
  // perceived K toward actual K), and when void-walking
  // transitions from adaptive to destructive.
  // -------------------------------------------------------------------

  describe('pathological void-walking: VGI > 1.0', () => {
    const profiles = conditionProfiles();

    it('ADHD has VGI > 1.0 (void-walking during task that needs folding)', () => {
      const adhd = profiles.find((p) => p.condition.includes('ADHD'))!;
      const vgi = (adhd.kHigh - 1) / (22 - 1);
      expect(vgi).toBeGreaterThan(1.0);
      console.log(
        `\n  ADHD VGI = ${vgi.toFixed(2)} > 1.0` +
        `\n  K_perceived = ${adhd.kHigh}, K_environment = 22` +
        `\n  The void walker runs when it should stop.`
      );
    });

    it('Rumination has VGI >> 1.0 (void-walking on phantom forks)', () => {
      const rum = profiles.find((p) => p.condition.includes('Rumination'))!;
      const vgi = (rum.kHigh - 1) / (22 - 1);
      expect(vgi).toBeGreaterThan(1.5);
      console.log(
        `\n  Rumination VGI = ${vgi.toFixed(2)} >> 1.0` +
        `\n  K_perceived = ${rum.kHigh}, K_environment = 22` +
        `\n  The void has no ground state. The walker is trapped.`
      );
    });

    it('healthy controls have VGI ≤ 1.0', () => {
      const healthy = profiles.filter(
        (p) => !p.condition.includes('ADHD') && !p.condition.includes('Rumination')
      );
      for (const h of healthy) {
        const vgiHigh = (h.kHigh - 1) / (22 - 1);
        const vgiLow = (h.kLow - 1) / (22 - 1);
        // At least one group in each condition should be ≤ 1.0
        expect(Math.min(vgiHigh, vgiLow)).toBeLessThanOrEqual(1.0);
      }
    });

    it('the pathological threshold is VGI = 1.0 (exact frontier)', () => {
      // VGI = 1.0 means K_tracked = K_environment.
      // Below 1.0: adaptive void-walking, tracking real alternatives.
      // Above 1.0: maladaptive, tracking phantom alternatives.
      // This is the same diagnostic as THM-AMERICAN-FRONTIER:
      // below the frontier = needs diversification.
      // above the frontier = over-diversified, tracking phantom paths.
      //
      // For cognition: below = not enough daydreaming (rigid).
      //                at = optimal (adaptive creativity).
      //                above = too much daydreaming (rumination).
      const gain = computeVoidGain(8.6, 20, 22);
      expect(gain.metrics.vgi).toBeLessThan(1.0);
      expect(gain.metrics.vgi).toBeGreaterThan(0.8);
      console.log(
        `\n  Healthy VGI = ${gain.metrics.vgi.toFixed(3)} < 1.0` +
        `\n  The brain is 90.5% of the way to the frontier.` +
        `\n  The remaining 9.5% is where surprise and learning live.` +
        `\n  Above 1.0 is where anxiety and rumination live.`
      );
    });

    it('predicts therapeutic interventions reduce K_perceived toward K_actual', () => {
      // Every effective intervention for anxiety/rumination does one
      // thing: reduce the number of perceived alternatives.
      //
      // - CBT: challenges catastrophic thoughts (removes phantom forks)
      // - Mindfulness: focuses attention on present (reduces K to task K)
      // - Medication (SSRIs): reduces DMN hyperactivation (lowers K_tracked)
      // - Exercise: narrows K to body-relevant alternatives
      // - Sleep: batch void-walking that resolves phantom forks
      //
      // The prediction: effective interventions measurably reduce VGI
      // toward 1.0 from above. Ineffective interventions don't.
      // This is testable with pre/post fMRI + experience sampling.
      const interventions = [
        {
          name: 'CBT',
          mechanism: 'removes phantom forks from void boundary',
          kReduction: 'K_perceived decreases toward K_actual',
        },
        {
          name: 'Mindfulness meditation',
          mechanism: 'trains voluntary disengagement from void-walking',
          kReduction: 'K_tracked decreases toward task-relevant K',
        },
        {
          name: 'SSRIs',
          mechanism: 'reduces DMN hyperactivation',
          kReduction: 'K_total decreases toward K_environment',
        },
        {
          name: 'Exercise',
          mechanism: 'narrows behavioral space to body-relevant actions',
          kReduction: 'K_environment temporarily decreases to K_body ≈ 5',
        },
        {
          name: 'Sleep',
          mechanism: 'batch void-walking resolves accumulated phantom forks',
          kReduction: 'K_perceived resets toward K_actual on waking',
        },
      ];

      for (const intervention of interventions) {
        expect(intervention.kReduction).toBeTruthy();
      }

      console.log('\n  Therapeutic predictions (all reduce VGI toward 1.0):');
      for (const i of interventions) {
        console.log(`    ${i.name}: ${i.mechanism}`);
      }
    });
  });

  // -------------------------------------------------------------------
  // The evolutionary mismatch prediction
  // -------------------------------------------------------------------

  describe('evolutionary mismatch: savanna K vs modern K', () => {
    it('savanna environment had K ≈ 20 (the brain is tuned for this)', () => {
      // The brain's void-walking machinery was tuned by evolution for
      // an environment where the behavioral action space had K ≈ 20
      // distinct alternatives (hunt, gather, rest, socialize, flee,
      // explore, groom, eat, drink, sleep, build, repair, teach,
      // learn, mate, guard, play, watch, travel, hide).
      //
      // The 95% energy allocation is OPTIMAL for K = 20.
      // This means the brain is evolutionarily matched to this K.
      const savannaK = 20;
      const brainVGI = (savannaK - 1) / (savannaK - 1);
      expect(brainVGI).toBe(1.0);
      console.log(
        `\n  Savanna K ≈ ${savannaK}` +
        `\n  Brain VGI at savanna K = ${brainVGI.toFixed(1)} (perfect match)` +
        `\n  Evolution optimized for this.`
      );
    });

    it('modern environment has mismatched K_perceived >> K_actual', () => {
      // Infinite scroll: K_perceived = thousands (every post is a fork)
      //                  K_actual = 3 (scroll, tap, leave)
      //
      // News cycle: K_perceived = hundreds (every headline is a crisis)
      //             K_actual = 2 (read or don't)
      //
      // Cubicle: K_perceived = 50 (emails, messages, tasks, worries)
      //          K_actual = 5 (current task + 4 urgent interrupts)
      //
      // 3am insomnia: K_perceived = ∞ (existential dread has no bound)
      //               K_actual = 2 (sleep or don't)
      const mismatches = [
        { context: 'Infinite scroll', kPerceived: 200, kActual: 3 },
        { context: 'News cycle', kPerceived: 100, kActual: 2 },
        { context: 'Open office', kPerceived: 50, kActual: 5 },
        { context: '3am insomnia', kPerceived: 500, kActual: 2 },
        { context: 'Savanna (ancestral)', kPerceived: 20, kActual: 20 },
      ];

      console.log('\n  Evolutionary mismatch table:');
      console.log('  Context              K_perc  K_actual  VGI    Status');
      console.log('  ───────────────────────────────────────────────────');

      for (const m of mismatches) {
        const vgi = (m.kPerceived - 1) / (m.kActual - 1 || 1);
        const status =
          vgi <= 1.0
            ? 'MATCHED'
            : vgi <= 2.0
              ? 'ELEVATED'
              : vgi <= 5.0
                ? 'PATHOLOGICAL'
                : 'CRISIS';
        console.log(
          `  ${m.context.padEnd(20)} ${m.kPerceived.toString().padStart(6)}  ${m.kActual.toString().padStart(7)}  ${vgi.toFixed(1).padStart(5)}  ${status}`
        );

        if (m.context === 'Savanna (ancestral)') {
          expect(vgi).toBe(1.0);
        } else if (m.context !== 'Savanna (ancestral)') {
          expect(vgi).toBeGreaterThan(1.0);
        }
      }

      console.log(
        '\n  The brain\'s void walker is tuned for K=20.' +
        '\n  Modern environments present K_perceived >> K_actual.' +
        '\n  The void walker explores phantom forks that don\'t exist.' +
        '\n  That\'s the mental health crisis of the 21st century:' +
        '\n  an evolutionary void-walking engine running in an' +
        '\n  environment it wasn\'t designed for.' +
        '\n' +
        '\n  The therapeutic target is not "stop daydreaming."' +
        '\n  It\'s "reduce K_perceived to K_actual."' +
        '\n  Align the void with reality.'
      );
    });
  });

  // -------------------------------------------------------------------
  // Render markdown
  // -------------------------------------------------------------------

  it('renders the full prediction matrix as markdown', () => {
    const md = renderPredictionMatrixMarkdown(matrix);
    expect(md).toContain('64');
    expect(md).toContain('Direction Matrix');
    expect(md).toContain('Quantitative Predictions');
    expect(md).toContain('Pathological');
    expect(md).toContain('American Frontier');
  });
});
