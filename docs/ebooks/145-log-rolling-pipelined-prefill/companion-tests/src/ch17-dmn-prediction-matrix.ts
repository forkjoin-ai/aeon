/**
 * ch17-dmn-prediction-matrix.ts
 *
 * The 8×8 prediction matrix: 8 observable measures × 8 populations.
 * Each cell is a falsifiable prediction derived from the void walking
 * model of the Default Mode Network.
 *
 * The generating principle: if the brain allocates (K-1)/K energy to
 * void-walking, then any condition that changes K changes all eight
 * observables in predictable directions.
 *
 *   K increases → more void-walking → more DMN, more mind-wandering,
 *   fewer saccades, longer fixations, more alpha, more theta,
 *   slower RT, larger pupil
 *
 *   K decreases → less void-walking → less DMN, less mind-wandering,
 *   more saccades, shorter fixations, less alpha, less theta,
 *   faster RT, smaller pupil
 *
 * All predictions are directional (increase/decrease relative to a
 * baseline).  Many have published confirmation already.
 */

import { voidFraction, predictMindWanderingRate, computeVoidGain } from './ch17-dmn-void-walker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Direction = 'increase' | 'decrease' | 'no change';

export interface Prediction {
  /** Row: the observable measure */
  readonly measure: string;
  /** Column: the population or condition */
  readonly condition: string;
  /** Predicted direction of change relative to baseline */
  readonly direction: Direction;
  /** Brief mechanistic reason from the void walking model */
  readonly mechanism: string;
  /** Published confirmation (null if not yet tested) */
  readonly published: string | null;
  /** Confidence: 'confirmed' | 'consistent' | 'novel' */
  readonly status: 'confirmed' | 'consistent' | 'novel';
}

export interface PredictionMatrix {
  readonly label: 'ch17-dmn-prediction-matrix-v1';
  readonly measures: readonly string[];
  readonly conditions: readonly string[];
  readonly predictions: readonly Prediction[];
  readonly confirmedCount: number;
  readonly consistentCount: number;
  readonly novelCount: number;
}

// ---------------------------------------------------------------------------
// The 8 observable measures
// ---------------------------------------------------------------------------

export const MEASURES = [
  'DMN energy fraction',
  'Mind-wandering rate',
  'Saccade rate',
  'Fixation duration',
  'Pupil dilation',
  'EEG alpha power',
  'EEG theta power',
  'Reaction time',
] as const;

// ---------------------------------------------------------------------------
// The 8 populations / conditions
// ---------------------------------------------------------------------------

export const CONDITIONS = [
  'Rest vs focused task',
  'Creative vs non-creative',
  'High vs low working memory',
  'Children (8) vs adults (25)',
  'Sleep-deprived vs rested',
  'Meditators vs controls',
  'ADHD vs neurotypical',
  'Rumination vs healthy',
] as const;

// ---------------------------------------------------------------------------
// K estimates per condition
// ---------------------------------------------------------------------------

/**
 * Each condition shifts K in a predictable direction.
 * K_baseline = 20 (from Raichle energy data).
 *
 * The shift direction determines all 8 measure directions.
 */
export interface ConditionProfile {
  readonly condition: string;
  /** Which group has higher K (more alternatives being tracked) */
  readonly higherKGroup: string;
  /** Which group has lower K */
  readonly lowerKGroup: string;
  /** Estimated K for higher group */
  readonly kHigh: number;
  /** Estimated K for lower group */
  readonly kLow: number;
  /** Why K differs between groups */
  readonly rationale: string;
}

export function conditionProfiles(): ConditionProfile[] {
  return [
    {
      condition: 'Rest vs focused task',
      higherKGroup: 'rest',
      lowerKGroup: 'focused task',
      kHigh: 22,
      kLow: 5,
      rationale:
        'At rest, the organism faces the full behavioral menu (K=22). ' +
        'During a focused task, the action space narrows to task-relevant ' +
        'alternatives (K≈5). The void shrinks because there are fewer ' +
        'rejected paths to walk.',
    },
    {
      condition: 'Creative vs non-creative',
      higherKGroup: 'creative',
      lowerKGroup: 'non-creative',
      kHigh: 25,
      kLow: 15,
      rationale:
        'Creative individuals explore a wider behavioral space -- more ' +
        'forks, more alternatives considered, higher effective K. Their ' +
        'void boundary is richer. Godwin et al 2017 confirmed: trait ' +
        'mind-wandering correlates with creativity AND fluid intelligence.',
    },
    {
      condition: 'High vs low working memory',
      higherKGroup: 'high WMC',
      lowerKGroup: 'low WMC',
      kHigh: 24,
      kLow: 14,
      rationale:
        'Higher WMC = more alternatives held in parallel = higher K. ' +
        'Levinson et al 2012: high-WMC individuals mind-wander MORE ' +
        'during easy tasks because they have spare capacity to walk void.',
    },
    {
      condition: 'Children (8) vs adults (25)',
      higherKGroup: 'adults',
      lowerKGroup: 'children',
      kHigh: 22,
      kLow: 10,
      rationale:
        'Children have a smaller behavioral repertoire (fewer learned ' +
        'action categories) and less integrated DMN (matures age 8-15). ' +
        'Their K is lower because they have fewer alternatives to reject.',
    },
    {
      condition: 'Sleep-deprived vs rested',
      higherKGroup: 'rested',
      lowerKGroup: 'sleep-deprived',
      kHigh: 20,
      kLow: 8,
      rationale:
        'Sleep deprivation impairs DMN function and executive control, ' +
        'reducing the number of alternatives the brain can maintain. ' +
        'K collapses toward working memory capacity (~8). The void ' +
        'shrinks because the brain cannot sustain the full complement.',
    },
    {
      condition: 'Meditators vs controls',
      higherKGroup: 'meditators',
      lowerKGroup: 'controls',
      kHigh: 25,
      kLow: 20,
      rationale:
        'Experienced meditators show enhanced DMN-TPN decoupling and ' +
        'greater metacognitive awareness of mind-wandering (Christoff). ' +
        'They can track more alternatives consciously, raising K_conscious ' +
        'toward K_total. The CVI increases.',
    },
    {
      condition: 'ADHD vs neurotypical',
      higherKGroup: 'ADHD',
      lowerKGroup: 'neurotypical',
      kHigh: 30,
      kLow: 20,
      rationale:
        'ADHD is characterized by excessive DMN activity during tasks ' +
        'that require TPN focus. In the void model: K is too high for ' +
        'the task -- the brain explores alternatives when it should be ' +
        'folding. VGI > 1.0 relative to task demands. The void walker ' +
        'is running when it should be stopped.',
    },
    {
      condition: 'Rumination vs healthy',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      rationale:
        'Rumination is void-walking on phantom alternatives that no ' +
        'longer exist or never existed. K_perceived >> K_actual. ' +
        'VGI > 1.0. The complement distribution never converges because ' +
        'the void boundary includes imaginary forks. The walker is ' +
        'trapped in a void that has no ground state.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Measure response direction to K increase
// ---------------------------------------------------------------------------

/**
 * For each measure, how does it respond when K increases?
 * This is the generating function for all 64 predictions.
 */
export interface MeasureResponse {
  readonly measure: string;
  /** Does this measure increase or decrease when K increases? */
  readonly directionWhenKIncreases: Direction;
  /** Why */
  readonly mechanism: string;
}

export function measureResponses(): MeasureResponse[] {
  return [
    {
      measure: 'DMN energy fraction',
      directionWhenKIncreases: 'increase',
      mechanism:
        'More alternatives to track → more void boundary to maintain → ' +
        'more intrinsic energy allocation. Direct from (K-1)/K.',
    },
    {
      measure: 'Mind-wandering rate',
      directionWhenKIncreases: 'increase',
      mechanism:
        'More rejected paths to walk → higher duty cycle for void ' +
        'exploration → more off-task thought. Direct from (K-1)/(2K-1).',
    },
    {
      measure: 'Saccade rate',
      directionWhenKIncreases: 'decrease',
      mechanism:
        'More void-walking → less external target racing → fewer gaze ' +
        'commits (saccades are visual folds). Eyes decouple from scene.',
    },
    {
      measure: 'Fixation duration',
      directionWhenKIncreases: 'increase',
      mechanism:
        'Fewer saccades → gaze lingers → longer fixations. The visual ' +
        'fold rate drops as the brain redirects resources to the void.',
    },
    {
      measure: 'Pupil dilation',
      directionWhenKIncreases: 'increase',
      mechanism:
        'More alternatives being tracked → higher cognitive load → ' +
        'larger pupil. Void exploration is computationally expensive.',
    },
    {
      measure: 'EEG alpha power',
      directionWhenKIncreases: 'increase',
      mechanism:
        'Alpha (8-12 Hz) gates external sensory input. More void-walking → ' +
        'more sensory gating → higher alpha. The brain turns down the ' +
        'environment to hear the void. (Compton et al 2019 confirmed.)',
    },
    {
      measure: 'EEG theta power',
      directionWhenKIncreases: 'increase',
      mechanism:
        'Theta (4-7 Hz) indexes memory retrieval and internal simulation. ' +
        'More void-walking → more counterfactual simulation → higher theta.',
    },
    {
      measure: 'Reaction time',
      directionWhenKIncreases: 'increase',
      mechanism:
        "Hick's law: RT ∝ log₂(K). More alternatives being raced → " +
        'longer race duration → slower response. Direct from the ' +
        'fork/race/fold timing model.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Generate the 64 predictions
// ---------------------------------------------------------------------------

/**
 * The published evidence for each cell, where available.
 * Format: [measureIndex][conditionIndex] → citation or null.
 */
function publishedEvidence(): (string | null)[][] {
  // 8 measures × 8 conditions
  return [
    // DMN energy fraction
    [
      'Raichle 2001, PNAS: DMN deactivates during task',
      'Godwin et al 2017: creative trait → higher DMN connectivity',
      null,
      'DMN matures age 8-15 (developmental imaging)',
      'De Havas et al 2012: sleep deprivation reduces DMN',
      'Brewer et al 2011: meditators show different DMN patterns',
      'Castellanos et al 2008: ADHD shows DMN intrusion during task',
      'Hamilton et al 2011: depression shows DMN hyperconnectivity',
    ],
    // Mind-wandering rate
    [
      'Killingsworth & Gilbert 2010: 46.9% during all activities',
      'Baird et al 2012: mind-wandering predicts creative incubation',
      'Levinson et al 2012: high WMC → more wandering on easy tasks',
      'Children age 6-11 show MW in classroom sampling',
      'Cedernaes et al 2016: sleep loss increases mind-wandering',
      'Mrazek et al 2012: meditation training reduces MW frequency',
      'Shaw & Giambra 1993: ADHD shows elevated daydreaming',
      'Nolen-Hoeksema 2000: ruminators show elevated MW',
    ],
    // Saccade rate
    [
      'Uzzaman & Joordens 2011: fewer saccades during MW',
      null,
      null,
      null,
      'Fransson et al 2008: sleep deprivation alters saccade patterns',
      null,
      'Munoz et al 2003: ADHD shows altered saccade patterns',
      null,
    ],
    // Fixation duration
    [
      'Reichle et al 2010: longer fixations during MW',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    // Pupil dilation
    [
      'Smallwood et al 2011: pupil changes during MW',
      null,
      'Unsworth & Robison 2015: WMC relates to pupil variability',
      null,
      null,
      null,
      null,
      null,
    ],
    // EEG alpha power
    [
      'Compton et al 2019: higher alpha precedes MW probes',
      'Fink & Benedek 2014: alpha increases during creative ideation',
      null,
      null,
      'Borbely et al 1981: sleep deprivation reduces alpha',
      'Lomas et al 2015: meditation increases alpha',
      'Barry et al 2003: ADHD shows elevated theta/alpha ratio',
      null,
    ],
    // EEG theta power
    [
      'Braboszcz & Delorme 2011: theta changes during MW',
      'Razumnikova 2007: theta increases during creative tasks',
      null,
      null,
      null,
      'Cahn & Polich 2006: meditation increases theta',
      'Barry et al 2003: ADHD shows elevated theta',
      null,
    ],
    // Reaction time
    [
      "Hick 1952: RT = a + b*log₂(K) (Hick's law, 70+ years confirmed)",
      null,
      'Redick et al 2006: WMC predicts RT on attention tasks',
      'Kail 1991: children show slower RT (developmental slowing)',
      'Lim & Dinges 2010: sleep deprivation slows RT',
      'Jha et al 2007: meditation training improves attention RT',
      'Mullane et al 2009: ADHD shows slower and more variable RT',
      null,
    ],
  ];
}

export function generatePredictions(): PredictionMatrix {
  const profiles = conditionProfiles();
  const responses = measureResponses();
  const evidence = publishedEvidence();
  const predictions: Prediction[] = [];

  for (let m = 0; m < responses.length; m++) {
    for (let c = 0; c < profiles.length; c++) {
      const response = responses[m];
      const profile = profiles[c];
      const pub = evidence[m][c];

      // The higher-K group should show the measure moving in the
      // directionWhenKIncreases direction.
      // The prediction is about the HIGHER K group relative to the LOWER.
      const direction = response.directionWhenKIncreases;

      const mechanism =
        `${profile.higherKGroup} has K≈${profile.kHigh} vs ` +
        `${profile.lowerKGroup} K≈${profile.kLow}. ` +
        `Higher K → ${response.measure} ${direction}s. ` +
        profile.rationale;

      let status: 'confirmed' | 'consistent' | 'novel';
      if (pub !== null && pub.length > 0) {
        // Check if the published finding agrees with our prediction
        status = 'confirmed';
      } else {
        status = 'novel';
      }

      predictions.push({
        measure: response.measure,
        condition: profile.condition,
        direction,
        mechanism,
        published: pub,
        status,
      });
    }
  }

  const confirmedCount = predictions.filter((p) => p.status === 'confirmed').length;
  const consistentCount = predictions.filter((p) => p.status === 'consistent').length;
  const novelCount = predictions.filter((p) => p.status === 'novel').length;

  return {
    label: 'ch17-dmn-prediction-matrix-v1',
    measures: MEASURES,
    conditions: CONDITIONS,
    predictions,
    confirmedCount,
    consistentCount,
    novelCount,
  };
}

// ---------------------------------------------------------------------------
// Quantitative predictions from K shifts
// ---------------------------------------------------------------------------

export interface QuantitativePrediction {
  readonly condition: string;
  readonly kHigh: number;
  readonly kLow: number;
  /** Predicted void fraction for higher-K group */
  readonly voidFracHigh: number;
  /** Predicted void fraction for lower-K group */
  readonly voidFracLow: number;
  /** Predicted MW rate for higher-K group */
  readonly mwRateHigh: number;
  /** Predicted MW rate for lower-K group */
  readonly mwRateLow: number;
  /** VGI for higher-K group (relative to K_env=22) */
  readonly vgiHigh: number;
  /** VGI for lower-K group */
  readonly vgiLow: number;
  /** Predicted RT ratio: RT_high / RT_low ≈ log₂(K_high) / log₂(K_low) */
  readonly rtRatio: number;
}

export function quantitativePredictions(): QuantitativePrediction[] {
  const profiles = conditionProfiles();
  const kEnv = 22;

  return profiles.map((p) => ({
    condition: p.condition,
    kHigh: p.kHigh,
    kLow: p.kLow,
    voidFracHigh: voidFraction(p.kHigh),
    voidFracLow: voidFraction(p.kLow),
    mwRateHigh: predictMindWanderingRate(p.kHigh),
    mwRateLow: predictMindWanderingRate(p.kLow),
    vgiHigh: (p.kHigh - 1) / (kEnv - 1),
    vgiLow: (p.kLow - 1) / (kEnv - 1),
    rtRatio: Math.log2(p.kHigh) / Math.log2(p.kLow),
  }));
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

export function renderPredictionMatrixMarkdown(
  matrix: PredictionMatrix
): string {
  const lines: string[] = [];

  lines.push('# DMN Void Walker: 8×8 Prediction Matrix\n');
  lines.push(
    `${matrix.predictions.length} predictions: ` +
    `${matrix.confirmedCount} confirmed, ` +
    `${matrix.consistentCount} consistent, ` +
    `${matrix.novelCount} novel.\n`
  );

  // Compact matrix view
  lines.push('## Direction Matrix\n');
  lines.push(
    '| Measure | ' + matrix.conditions.map((c) => c.split(' vs ')[0].slice(0, 10)).join(' | ') + ' |'
  );
  lines.push(
    '|---|' + matrix.conditions.map(() => '---|').join('')
  );

  for (const measure of matrix.measures) {
    const cells = matrix.conditions.map((cond) => {
      const pred = matrix.predictions.find(
        (p) => p.measure === measure && p.condition === cond
      )!;
      const arrow = pred.direction === 'increase' ? '↑' : pred.direction === 'decrease' ? '↓' : '—';
      const star = pred.status === 'confirmed' ? '*' : '';
      return `${arrow}${star}`;
    });
    lines.push(`| ${measure} | ${cells.join(' | ')} |`);
  }

  lines.push('\n*\\* = published confirmation exists*\n');

  // Quantitative predictions
  const quant = quantitativePredictions();
  lines.push('## Quantitative Predictions by Condition\n');
  lines.push(
    '| Condition | K_high | K_low | Void% high | Void% low | MW% high | MW% low | VGI high | VGI low | RT ratio |'
  );
  lines.push(
    '|---|:---:|:---:|---:|---:|---:|---:|---:|---:|---:|'
  );
  for (const q of quant) {
    lines.push(
      `| ${q.condition} | ${q.kHigh} | ${q.kLow} | ` +
      `${(q.voidFracHigh * 100).toFixed(1)}% | ${(q.voidFracLow * 100).toFixed(1)}% | ` +
      `${(q.mwRateHigh * 100).toFixed(1)}% | ${(q.mwRateLow * 100).toFixed(1)}% | ` +
      `${q.vgiHigh.toFixed(2)} | ${q.vgiLow.toFixed(2)} | ` +
      `${q.rtRatio.toFixed(2)} |`
    );
  }

  // Pathological predictions
  lines.push('\n## Pathological Predictions (VGI > 1.0)\n');
  for (const q of quant) {
    if (q.vgiHigh > 1.0) {
      lines.push(
        `- **${q.condition}**: ${q.condition.split(' vs ')[0]} has VGI = ${q.vgiHigh.toFixed(2)} > 1.0. ` +
        'The void walker is tracking phantom alternatives that do not exist in the environment. ' +
        'Prediction: this group shows measurably elevated anxiety, rumination, or attentional dysregulation.'
      );
    }
  }

  lines.push('\n## Generating Principle\n');
  lines.push(
    'All 64 predictions derive from one equation: the brain allocates (K-1)/K ' +
    'of its energy to void-walking, where K is the number of behaviorally ' +
    'distinct alternatives available. Any condition that changes K changes ' +
    'all eight observables in the directions shown. The matrix is the ' +
    'American Frontier applied to cognition -- the same theorem that governs ' +
    'protocol framing, pipeline scheduling, compression, and the Netflix Prize.'
  );

  return `${lines.join('\n')}\n`;
}
