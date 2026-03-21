/**
 * ch17-28-novel-predictions.ts
 *
 * The 28 untested predictions from the DMN void-walking model.
 * Each one is a publishable experiment.  Each one is falsifiable.
 * Each one requires only standard equipment: eye tracker, EEG,
 * experience sampling app, or behavioral task.
 *
 * Format per prediction:
 *   - The cell (measure × condition)
 *   - The predicted direction (from the VGI model)
 *   - The mechanism (why the model predicts this)
 *   - The experiment (how to test it)
 *   - The falsification (what result would kill the prediction)
 *   - The equipment (what you need)
 *   - The sample (who and how many)
 *   - The estimated effect size (from K shift)
 */

export interface NovelPrediction {
  readonly id: number;
  readonly measure: string;
  readonly condition: string;
  readonly direction: 'increase' | 'decrease';
  readonly higherKGroup: string;
  readonly lowerKGroup: string;
  readonly kHigh: number;
  readonly kLow: number;
  readonly mechanism: string;
  readonly experiment: string;
  readonly falsification: string;
  readonly equipment: string;
  readonly sampleDescription: string;
  readonly estimatedN: number;
  readonly estimatedEffectSize: string;
  readonly difficulty: 'easy' | 'medium' | 'hard';
}

export function novel28(): NovelPrediction[] {
  return [
    // ── Saccade rate (5 novel) ──────────────────────────────────

    {
      id: 1,
      measure: 'Saccade rate',
      condition: 'Creative vs non-creative',
      direction: 'decrease',
      higherKGroup: 'creative',
      lowerKGroup: 'non-creative',
      kHigh: 25,
      kLow: 15,
      mechanism:
        'Creative individuals track more alternatives (higher K). More void-walking → fewer external gaze commits. Saccade rate should be lower during open-ended ideation.',
      experiment:
        'Measure saccade rate during a 5-min divergent thinking task (Alternative Uses Task) in high-creative vs low-creative participants (split by Torrance Test composite). Compare saccade rates between groups during ideation vs a matched control task (reading).',
      falsification:
        'If high-creative participants show EQUAL or HIGHER saccade rates during ideation than low-creative participants.',
      equipment: 'Eye tracker (Tobii Pro Spectrum or equivalent, 300+ Hz)',
      sampleDescription: 'Adults 18-35, screened with Torrance Test, top/bottom quartile',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.4-0.6 (medium)',
      difficulty: 'easy',
    },
    {
      id: 2,
      measure: 'Saccade rate',
      condition: 'High vs low working memory',
      direction: 'decrease',
      higherKGroup: 'high WMC',
      lowerKGroup: 'low WMC',
      kHigh: 24,
      kLow: 14,
      mechanism:
        'High WMC → more alternatives held in parallel → more void-walking during easy tasks → fewer saccades. Levinson et al 2012 showed high-WMC individuals mind-wander MORE on easy tasks.',
      experiment:
        'Administer operation span task to classify WMC. Then measure saccade rate during a low-demand visual task (e.g., watching a static scene for 3 min). High-WMC should show fewer saccades because they are void-walking more.',
      falsification:
        'If high-WMC participants show EQUAL or HIGHER saccade rates during the low-demand task.',
      equipment: 'Eye tracker + operation span computerized task',
      sampleDescription: 'Adults 18-30, top/bottom tertile on operation span',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.3-0.5 (small-medium)',
      difficulty: 'easy',
    },
    {
      id: 3,
      measure: 'Saccade rate',
      condition: 'Children vs adults',
      direction: 'decrease',
      higherKGroup: 'adults',
      lowerKGroup: 'children',
      kHigh: 22,
      kLow: 10,
      mechanism:
        'Adults have more integrated DMN (matures 8-15) and larger behavioral repertoire (higher K). Children should show HIGHER saccade rates -- more visual folding, less void-walking.',
      experiment:
        'Compare saccade rate during a 3-min free-viewing task (natural scene) between children (8-10) and adults (25-35). Children should show more saccades (exploring externally). Adults should show fewer (exploring internally).',
      falsification:
        'If children show EQUAL or FEWER saccades than adults during free viewing.',
      equipment: 'Child-friendly eye tracker (Tobii Pro with chin rest alternative)',
      sampleDescription: 'Children 8-10 (n=30) vs adults 25-35 (n=30)',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.5-0.8 (medium-large)',
      difficulty: 'medium',
    },
    {
      id: 4,
      measure: 'Saccade rate',
      condition: 'Meditators vs controls',
      direction: 'decrease',
      higherKGroup: 'meditators',
      lowerKGroup: 'controls',
      kHigh: 25,
      kLow: 20,
      mechanism:
        'Experienced meditators show enhanced DMN-TPN decoupling. Higher conscious K → more deliberate void-walking → fewer reflexive saccades. Gaze should be more stable.',
      experiment:
        'Compare saccade rate during open monitoring meditation (5 min, eyes open on fixation cross) between experienced meditators (1000+ hours) and matched controls. Meditators should show fewer saccades.',
      falsification:
        'If meditators show EQUAL or HIGHER saccade rates during open monitoring.',
      equipment: 'Eye tracker + meditation experience questionnaire',
      sampleDescription: 'Meditators (1000+ hrs, n=30) vs age/education-matched controls (n=30)',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5 (small-medium)',
      difficulty: 'medium',
    },
    {
      id: 5,
      measure: 'Saccade rate',
      condition: 'Rumination vs healthy',
      direction: 'decrease',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      mechanism:
        'Ruminators void-walk on phantom forks (K_perceived >> K_actual). During rest, their gaze should decouple from the scene MORE than healthy controls because more processing is directed internally.',
      experiment:
        'Compare saccade rate during a 5-min rest period (eyes open, natural scene) between high-rumination (top quartile on Ruminative Response Scale) and low-rumination participants.',
      falsification:
        'If high-rumination participants show EQUAL or HIGHER saccade rates than low-rumination.',
      equipment: 'Eye tracker + Ruminative Response Scale (RRS)',
      sampleDescription: 'Adults, top/bottom quartile on RRS',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.4-0.7 (medium)',
      difficulty: 'easy',
    },

    // ── Fixation duration (7 novel) ─────────────────────────────

    {
      id: 6,
      measure: 'Fixation duration',
      condition: 'Creative vs non-creative',
      direction: 'increase',
      higherKGroup: 'creative',
      lowerKGroup: 'non-creative',
      kHigh: 25,
      kLow: 15,
      mechanism:
        'Fewer saccades → longer fixations. Creative individuals during ideation should show gaze "blanking" -- eyes open but not actively scanning.',
      experiment:
        'Same protocol as prediction 1 (AUT + eye tracking). Measure mean fixation duration during ideation.',
      falsification:
        'If high-creative show EQUAL or SHORTER fixations during ideation.',
      equipment: 'Eye tracker',
      sampleDescription: 'Same as prediction 1',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.4-0.6',
      difficulty: 'easy',
    },
    {
      id: 7,
      measure: 'Fixation duration',
      condition: 'High vs low working memory',
      direction: 'increase',
      higherKGroup: 'high WMC',
      lowerKGroup: 'low WMC',
      kHigh: 24,
      kLow: 14,
      mechanism:
        'High WMC → more void-walking on easy tasks → gaze lingers as processing moves internal.',
      experiment:
        'Same protocol as prediction 2. Measure mean fixation duration during low-demand task.',
      falsification:
        'If high-WMC show EQUAL or SHORTER fixations.',
      equipment: 'Eye tracker + operation span',
      sampleDescription: 'Same as prediction 2',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'easy',
    },
    {
      id: 8,
      measure: 'Fixation duration',
      condition: 'Children vs adults',
      direction: 'increase',
      higherKGroup: 'adults',
      lowerKGroup: 'children',
      kHigh: 22,
      kLow: 10,
      mechanism:
        'Adults void-walk more → longer fixations. Children explore externally → shorter fixations, more saccades.',
      experiment:
        'Same protocol as prediction 3. Measure mean fixation duration during free viewing.',
      falsification:
        'If children show EQUAL or LONGER fixations than adults.',
      equipment: 'Child-friendly eye tracker',
      sampleDescription: 'Same as prediction 3',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.5-0.8',
      difficulty: 'medium',
    },
    {
      id: 9,
      measure: 'Fixation duration',
      condition: 'Sleep-deprived vs rested',
      direction: 'increase',
      higherKGroup: 'rested',
      lowerKGroup: 'sleep-deprived',
      kHigh: 20,
      kLow: 8,
      mechanism:
        'Sleep deprivation collapses K toward working memory. Less void-walking → more external scanning → shorter fixations. Wait -- the model predicts RESTED have longer fixations (more void-walking). Sleep-deprived should have SHORTER fixations.',
      experiment:
        'Within-subjects: measure fixation duration on a free-viewing task after normal sleep vs 24h sleep deprivation. Sleep-deprived should show shorter fixations (less void-walking, more external scanning to compensate for degraded internal processing).',
      falsification:
        'If sleep-deprived show EQUAL or LONGER fixations.',
      equipment: 'Eye tracker + sleep lab protocol',
      sampleDescription: 'Adults 18-30, within-subjects crossover',
      estimatedN: 30,
      estimatedEffectSize: 'd ≈ 0.5-0.8',
      difficulty: 'hard',
    },
    {
      id: 10,
      measure: 'Fixation duration',
      condition: 'Meditators vs controls',
      direction: 'increase',
      higherKGroup: 'meditators',
      lowerKGroup: 'controls',
      kHigh: 25,
      kLow: 20,
      mechanism:
        'Meditators show more stable gaze during open monitoring. Longer fixations = more deliberate void-walking with less reflexive saccading.',
      experiment:
        'Same protocol as prediction 4. Measure mean fixation duration.',
      falsification:
        'If meditators show EQUAL or SHORTER fixations.',
      equipment: 'Eye tracker',
      sampleDescription: 'Same as prediction 4',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'medium',
    },
    {
      id: 11,
      measure: 'Fixation duration',
      condition: 'ADHD vs neurotypical',
      direction: 'increase',
      higherKGroup: 'ADHD',
      lowerKGroup: 'neurotypical',
      kHigh: 30,
      kLow: 20,
      mechanism:
        'ADHD K_perceived > K_actual → more void-walking (on phantom forks) → paradoxically LONGER fixations during inattention episodes (gaze blanking). This is NOT the same as "paying attention" -- it is gaze decoupling from task.',
      experiment:
        'Measure fixation duration during a sustained attention task (e.g., SART). Compare ADHD (diagnosed, unmedicated) vs neurotypical. During inattention epochs (marked by commission errors), ADHD should show LONGER fixations.',
      falsification:
        'If ADHD shows SHORTER fixations during inattention epochs.',
      equipment: 'Eye tracker + SART computerized task',
      sampleDescription: 'ADHD adults (diagnosed, unmedicated, n=30) vs NT controls (n=30)',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.4-0.7',
      difficulty: 'medium',
    },
    {
      id: 12,
      measure: 'Fixation duration',
      condition: 'Rumination vs healthy',
      direction: 'increase',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      mechanism:
        'Ruminators void-walk on phantom forks → gaze decouples → longer fixations during rest. "Staring into space" is literally visible.',
      experiment:
        'Same protocol as prediction 5. Measure mean fixation duration during rest.',
      falsification:
        'If high-rumination show SHORTER fixations during rest.',
      equipment: 'Eye tracker + RRS',
      sampleDescription: 'Same as prediction 5',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.4-0.7',
      difficulty: 'easy',
    },

    // ── Pupil dilation (5 novel) ────────────────────────────────

    {
      id: 13,
      measure: 'Pupil dilation',
      condition: 'Creative vs non-creative',
      direction: 'increase',
      higherKGroup: 'creative',
      lowerKGroup: 'non-creative',
      kHigh: 25,
      kLow: 15,
      mechanism:
        'More alternatives tracked → higher cognitive load → larger pupil. Creative ideation should show tonic pupil dilation in high-creative individuals.',
      experiment:
        'Measure tonic pupil diameter during AUT ideation. High-creative should show larger baseline pupil than low-creative during ideation (not during control task).',
      falsification:
        'If high-creative show EQUAL or SMALLER pupil during ideation.',
      equipment: 'Eye tracker with pupillometry (Tobii, SR Research)',
      sampleDescription: 'Same as prediction 1',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'easy',
    },
    {
      id: 14,
      measure: 'Pupil dilation',
      condition: 'Children vs adults',
      direction: 'increase',
      higherKGroup: 'adults',
      lowerKGroup: 'children',
      kHigh: 22,
      kLow: 10,
      mechanism:
        'Adults track more void paths → higher tonic cognitive load → larger baseline pupil during rest. Children track fewer → smaller baseline.',
      experiment:
        'Measure tonic pupil diameter during a 3-min rest period. Compare children (8-10) vs adults (25-35). Control for luminance.',
      falsification:
        'If children show EQUAL or LARGER tonic pupil during rest (controlling for luminance and age-related pupil size differences).',
      equipment: 'Pupillometer + luminance-controlled environment',
      sampleDescription: 'Children 8-10 (n=30) vs adults 25-35 (n=30)',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5 (after controlling for baseline pupil size)',
      difficulty: 'hard',
    },
    {
      id: 15,
      measure: 'Pupil dilation',
      condition: 'Sleep-deprived vs rested',
      direction: 'increase',
      higherKGroup: 'rested',
      lowerKGroup: 'sleep-deprived',
      kHigh: 20,
      kLow: 8,
      mechanism:
        'Rested brain maintains K=20 void paths → higher cognitive load → larger tonic pupil. Sleep-deprived K collapses to ~8 → reduced void-walking → smaller tonic pupil (despite sympathetic arousal).',
      experiment:
        'Within-subjects pupillometry during cognitive rest, rested vs 24h sleep-deprived. Predict that TASK-EVOKED pupil dilation (phasic) may increase with deprivation, but TONIC (baseline during rest) decreases.',
      falsification:
        'If tonic pupil during rest is LARGER after sleep deprivation.',
      equipment: 'Pupillometer + sleep lab',
      sampleDescription: 'Adults 18-30, within-subjects crossover, n=30',
      estimatedN: 30,
      estimatedEffectSize: 'd ≈ 0.4-0.6',
      difficulty: 'hard',
    },
    {
      id: 16,
      measure: 'Pupil dilation',
      condition: 'Meditators vs controls',
      direction: 'increase',
      higherKGroup: 'meditators',
      lowerKGroup: 'controls',
      kHigh: 25,
      kLow: 20,
      mechanism:
        'Meditators have higher conscious K (CVI increases) → more deliberate void-walking → higher tonic cognitive load → larger pupil during meditation.',
      experiment:
        'Measure pupil diameter during open monitoring meditation. Compare experienced meditators vs controls (both with eyes open on fixation cross).',
      falsification:
        'If meditators show EQUAL or SMALLER pupil during meditation.',
      equipment: 'Pupillometer',
      sampleDescription: 'Same as prediction 4',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'medium',
    },
    {
      id: 17,
      measure: 'Pupil dilation',
      condition: 'ADHD vs neurotypical',
      direction: 'increase',
      higherKGroup: 'ADHD',
      lowerKGroup: 'neurotypical',
      kHigh: 30,
      kLow: 20,
      mechanism:
        'ADHD void-walks on task-irrelevant forks → higher K_perceived → higher cognitive load → larger tonic pupil during tasks that should be low-demand.',
      experiment:
        'Measure tonic pupil during a low-demand vigilance task. ADHD should show LARGER baseline pupil (more void-walking) despite worse task performance.',
      falsification:
        'If ADHD shows EQUAL or SMALLER tonic pupil during low-demand tasks.',
      equipment: 'Pupillometer + vigilance task',
      sampleDescription: 'ADHD (diagnosed, unmedicated, n=30) vs NT (n=30)',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.4-0.6',
      difficulty: 'medium',
    },
    {
      id: 18,
      measure: 'Pupil dilation',
      condition: 'Rumination vs healthy',
      direction: 'increase',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      mechanism:
        'Ruminators track phantom forks → K_perceived >> K_actual → high cognitive load → large tonic pupil during rest.',
      experiment:
        'Measure tonic pupil during 5-min rest (eyes open). High-rumination should show larger pupil than low-rumination.',
      falsification:
        'If high-rumination shows EQUAL or SMALLER tonic pupil during rest.',
      equipment: 'Pupillometer + RRS',
      sampleDescription: 'Same as prediction 5',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.4-0.7',
      difficulty: 'easy',
    },

    // ── EEG alpha power (3 novel) ───────────────────────────────

    {
      id: 19,
      measure: 'EEG alpha power',
      condition: 'High vs low working memory',
      direction: 'increase',
      higherKGroup: 'high WMC',
      lowerKGroup: 'low WMC',
      kHigh: 24,
      kLow: 14,
      mechanism:
        'High WMC → more void-walking on easy tasks → more sensory gating → higher alpha. Alpha gates external input to let the void run.',
      experiment:
        'Measure posterior alpha power (8-12 Hz) during a low-demand task. Compare high-WMC vs low-WMC. High-WMC should show higher alpha (more gating, more internal processing).',
      falsification:
        'If high-WMC shows EQUAL or LOWER alpha during low-demand tasks.',
      equipment: 'EEG (32+ channels) + operation span',
      sampleDescription: 'Adults 18-30, top/bottom tertile on operation span',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'medium',
    },
    {
      id: 20,
      measure: 'EEG alpha power',
      condition: 'Children vs adults',
      direction: 'increase',
      higherKGroup: 'adults',
      lowerKGroup: 'children',
      kHigh: 22,
      kLow: 10,
      mechanism:
        'Adults have more integrated DMN → more void-walking → more alpha (sensory gating). Children have less DMN integration → less alpha → more external processing.',
      experiment:
        'Measure resting-state posterior alpha power. Compare children (8-10) vs adults (25-35). Adults should show higher alpha.',
      falsification:
        'If children show EQUAL or HIGHER resting alpha (controlling for developmental EEG maturation).',
      equipment: 'EEG (child-friendly cap)',
      sampleDescription: 'Children 8-10 (n=30) vs adults 25-35 (n=30)',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.5-0.8',
      difficulty: 'medium',
    },
    {
      id: 21,
      measure: 'EEG alpha power',
      condition: 'Rumination vs healthy',
      direction: 'increase',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      mechanism:
        'Ruminators void-walk excessively → higher sensory gating → higher alpha during rest. The brain is "closing the shutters" to walk phantom forks.',
      experiment:
        'Measure resting-state alpha (eyes open, 5 min). High-rumination should show higher posterior alpha than low-rumination.',
      falsification:
        'If high-rumination shows EQUAL or LOWER resting alpha.',
      equipment: 'EEG + RRS',
      sampleDescription: 'Adults, top/bottom quartile on RRS',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.3-0.6',
      difficulty: 'medium',
    },

    // ── EEG theta power (3 novel) ───────────────────────────────

    {
      id: 22,
      measure: 'EEG theta power',
      condition: 'High vs low working memory',
      direction: 'increase',
      higherKGroup: 'high WMC',
      lowerKGroup: 'low WMC',
      kHigh: 24,
      kLow: 14,
      mechanism:
        'High WMC → more void paths maintained → more memory retrieval / internal simulation → higher frontal midline theta.',
      experiment:
        'Measure frontal midline theta (4-7 Hz, Fz) during low-demand task. High-WMC should show higher theta.',
      falsification:
        'If high-WMC shows EQUAL or LOWER frontal midline theta.',
      equipment: 'EEG + operation span',
      sampleDescription: 'Same as prediction 19',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'medium',
    },
    {
      id: 23,
      measure: 'EEG theta power',
      condition: 'Children vs adults',
      direction: 'increase',
      higherKGroup: 'adults',
      lowerKGroup: 'children',
      kHigh: 22,
      kLow: 10,
      mechanism:
        'Adults have more counterfactual simulation capacity → higher theta during rest. Note: children have higher ABSOLUTE theta due to developmental EEG patterns, so this must be measured as TASK-RELATED theta increase, not baseline.',
      experiment:
        'Measure theta INCREASE from baseline to a mind-wandering inducing task. Adults should show a LARGER theta increase (more internal simulation recruited by the task).',
      falsification:
        'If adults show EQUAL or SMALLER task-related theta increase.',
      equipment: 'EEG (child-friendly)',
      sampleDescription: 'Same as prediction 20',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.6',
      difficulty: 'hard',
    },
    {
      id: 24,
      measure: 'EEG theta power',
      condition: 'Sleep-deprived vs rested',
      direction: 'increase',
      higherKGroup: 'rested',
      lowerKGroup: 'sleep-deprived',
      kHigh: 20,
      kLow: 8,
      mechanism:
        'Rested brain supports full void-walking → higher task-related theta. Sleep-deprived K collapses → less internal simulation → lower task-related theta. (Note: sleep deprivation increases BASELINE theta from drowsiness, but TASK-RELATED theta increase should be smaller.)',
      experiment:
        'Measure theta increase from rest to a working memory task (n-back). Compare rested vs 24h sleep-deprived. Task-related theta increase should be SMALLER when sleep-deprived.',
      falsification:
        'If task-related theta increase is EQUAL or LARGER when sleep-deprived.',
      equipment: 'EEG + sleep lab + n-back task',
      sampleDescription: 'Within-subjects crossover, n=30',
      estimatedN: 30,
      estimatedEffectSize: 'd ≈ 0.4-0.6',
      difficulty: 'hard',
    },
    {
      id: 25,
      measure: 'EEG theta power',
      condition: 'Rumination vs healthy',
      direction: 'increase',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      mechanism:
        'Ruminators void-walk excessively → more internal simulation → higher frontal midline theta during rest.',
      experiment:
        'Measure resting-state frontal midline theta (eyes open). High-rumination should show higher theta.',
      falsification:
        'If high-rumination shows EQUAL or LOWER resting frontal theta.',
      equipment: 'EEG + RRS',
      sampleDescription: 'Same as prediction 21',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.3-0.6',
      difficulty: 'medium',
    },

    // ── Reaction time (2 novel) ─────────────────────────────────

    {
      id: 26,
      measure: 'Reaction time',
      condition: 'Creative vs non-creative',
      direction: 'increase',
      higherKGroup: 'creative',
      lowerKGroup: 'non-creative',
      kHigh: 25,
      kLow: 15,
      mechanism:
        'Higher K → longer race duration (Hick\'s law). Creative individuals should show slightly SLOWER RT on simple choice tasks because they are racing more alternatives. RT ratio ≈ log₂(25)/log₂(15) = 1.19.',
      experiment:
        'Measure simple choice RT (4-choice Hick task). Compare high-creative vs low-creative. High-creative should be ~19% slower on simple choices (but faster on open-ended tasks where more alternatives help).',
      falsification:
        'If high-creative show EQUAL or FASTER choice RT.',
      equipment: 'Computerized Hick task + Torrance Test',
      sampleDescription: 'Same as prediction 1',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5',
      difficulty: 'easy',
    },
    {
      id: 27,
      measure: 'Reaction time',
      condition: 'Rumination vs healthy',
      direction: 'increase',
      higherKGroup: 'rumination',
      lowerKGroup: 'healthy',
      kHigh: 35,
      kLow: 20,
      mechanism:
        'Ruminators race more phantom alternatives → longer RT on simple decisions. "Decision paralysis" is the Hick\'s law race with phantom entries. RT ratio ≈ log₂(35)/log₂(20) = 1.19.',
      experiment:
        'Measure simple choice RT in high-rumination vs low-rumination. Predict ~19% slower RT for ruminators on mundane choices (e.g., which cereal to pick in a simulated grocery task).',
      falsification:
        'If high-rumination shows EQUAL or FASTER RT on simple choices.',
      equipment: 'Computerized choice task + RRS',
      sampleDescription: 'Same as prediction 5',
      estimatedN: 80,
      estimatedEffectSize: 'd ≈ 0.3-0.6',
      difficulty: 'easy',
    },

    // ── DMN energy (1 novel) ────────────────────────────────────

    {
      id: 28,
      measure: 'DMN energy fraction',
      condition: 'High vs low working memory',
      direction: 'increase',
      higherKGroup: 'high WMC',
      lowerKGroup: 'low WMC',
      kHigh: 24,
      kLow: 14,
      mechanism:
        'High WMC → more alternatives maintained → higher DMN resting energy. The brain allocates (K-1)/K to the void. Higher K → higher fraction. Predicted: (23/24) / (13/14) = 0.958/0.929 = 1.03 (3% higher DMN energy in high-WMC).',
      experiment:
        'Resting-state fMRI. Compare DMN BOLD signal amplitude in high-WMC vs low-WMC participants. High-WMC should show higher DMN activation at rest.',
      falsification:
        'If high-WMC shows EQUAL or LOWER resting DMN BOLD.',
      equipment: 'fMRI (3T+) + operation span',
      sampleDescription: 'Adults 18-30, top/bottom tertile on operation span, n=30 per group',
      estimatedN: 60,
      estimatedEffectSize: 'd ≈ 0.3-0.5 (small, requires adequate power)',
      difficulty: 'hard',
    },
  ];
}

export function renderNovel28Markdown(): string {
  const predictions = novel28();
  const lines: string[] = [];

  lines.push('# 28 Novel Predictions from the DMN Void-Walking Model\n');
  lines.push(`${predictions.length} falsifiable predictions. Each one is a publishable experiment.\n`);

  const byDifficulty = {
    easy: predictions.filter((p) => p.difficulty === 'easy'),
    medium: predictions.filter((p) => p.difficulty === 'medium'),
    hard: predictions.filter((p) => p.difficulty === 'hard'),
  };

  lines.push(`Easy (eye tracker + questionnaire only): ${byDifficulty.easy.length}`);
  lines.push(`Medium (EEG or special population): ${byDifficulty.medium.length}`);
  lines.push(`Hard (fMRI or sleep lab): ${byDifficulty.hard.length}\n`);

  const totalN = predictions.reduce((s, p) => s + p.estimatedN, 0);
  lines.push(`Total estimated participants across all 28: ~${totalN}\n`);

  for (const p of predictions) {
    lines.push(`## Prediction ${p.id}: ${p.measure} × ${p.condition}\n`);
    lines.push(`**Direction**: ${p.higherKGroup} (K=${p.kHigh}) shows ${p.direction} vs ${p.lowerKGroup} (K=${p.kLow})\n`);
    lines.push(`**Mechanism**: ${p.mechanism}\n`);
    lines.push(`**Experiment**: ${p.experiment}\n`);
    lines.push(`**Falsification**: ${p.falsification}\n`);
    lines.push(`**Equipment**: ${p.equipment}`);
    lines.push(`**Sample**: ${p.sampleDescription} (N ≈ ${p.estimatedN})`);
    lines.push(`**Expected effect**: ${p.estimatedEffectSize}`);
    lines.push(`**Difficulty**: ${p.difficulty}\n`);
  }

  return lines.join('\n') + '\n';
}
