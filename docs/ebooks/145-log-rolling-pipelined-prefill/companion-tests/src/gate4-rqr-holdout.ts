import {
  clamp01,
  computeReadinessScores,
  linearRegressionSlope,
  makeRng,
  mean,
  pearsonCorrelation,
  simulatePromotionGain,
  type ReadinessInputs,
  type ReadinessScores,
} from './map-reduce-readiness';

export interface BootstrapInterval {
  readonly low: number;
  readonly high: number;
}

export interface Gate4Thresholds {
  readonly spearmanLowerCi: number;
  readonly slopeLowerCi: number;
  readonly quartileDeltaLowerCi: number;
  readonly predictedPearsonLowerCi: number;
  readonly maxDecileMonotonicViolations: number;
}

export interface Gate4Config {
  readonly seed: number;
  readonly trainSamples: number;
  readonly holdoutSamples: number;
  readonly bootstrapResamples: number;
  readonly decileCount: number;
  readonly monotonicTolerance: number;
  readonly thresholds: Gate4Thresholds;
}

interface DatasetRow {
  readonly index: number;
  readonly inputs: ReadinessInputs;
  readonly scores: ReadinessScores;
  readonly observedGain: number;
}

interface HoldoutRow extends DatasetRow {
  readonly predictedGain: number;
}

interface LinearModel {
  readonly intercept: number;
  readonly slope: number;
}

export interface Gate4Criterion {
  readonly id: string;
  readonly description: string;
  readonly threshold: string;
  readonly observed: number;
  readonly ci95?: BootstrapInterval;
  readonly pass: boolean;
}

export interface Gate4MetricSummary {
  readonly value: number;
  readonly ci95: BootstrapInterval;
}

export interface Gate4DecileSummary {
  readonly decile: number;
  readonly count: number;
  readonly meanRqr: number;
  readonly meanObservedGain: number;
  readonly meanPredictedGain: number;
}

export interface Gate4Report {
  readonly protocol: {
    readonly id: string;
    readonly splitRule: string;
    readonly scoringRules: readonly string[];
  };
  readonly config: Gate4Config;
  readonly training: {
    readonly sampleCount: number;
    readonly model: {
      readonly intercept: number;
      readonly slope: number;
      readonly pearson: number;
      readonly spearman: number;
      readonly rmse: number;
    };
  };
  readonly holdout: {
    readonly sampleCount: number;
    readonly lowerQuartileRqr: number;
    readonly upperQuartileRqr: number;
    readonly lowQuartileMeanGain: number;
    readonly highQuartileMeanGain: number;
    readonly spearman: Gate4MetricSummary;
    readonly slope: Gate4MetricSummary;
    readonly quartileDelta: Gate4MetricSummary;
    readonly predictedPearson: Gate4MetricSummary;
    readonly predictedRmse: number;
    readonly deciles: readonly Gate4DecileSummary[];
    readonly monotonicViolations: number;
  };
  readonly gate: {
    readonly pass: boolean;
    readonly criteria: readonly Gate4Criterion[];
    readonly failedCriterionIds: readonly string[];
    readonly passedCriterionIds: readonly string[];
  };
}

interface RankedValue {
  readonly value: number;
  readonly index: number;
}

function mixSeed(...parts: readonly number[]): number {
  let hash = 0x811c9dc5;
  for (const part of parts) {
    hash ^= part >>> 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function quantile(values: readonly number[], q: number): number {
  if (values.length === 0) {
    throw new Error('quantile requires non-empty input');
  }
  if (q < 0 || q > 1) {
    throw new Error(`quantile q must be in [0,1], got ${q}`);
  }

  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) {
    return sorted[lower];
  }

  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function rmse(
  predicted: readonly number[],
  observed: readonly number[]
): number {
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    const residual = predicted[i] - observed[i];
    sum += residual * residual;
  }
  return Math.sqrt(sum / predicted.length);
}

function rank(values: readonly number[]): number[] {
  const indexed: RankedValue[] = values.map((value, index) => ({
    value,
    index,
  }));
  indexed.sort((a, b) => a.value - b.value);

  const ranks = new Array<number>(values.length).fill(0);
  let i = 0;
  while (i < indexed.length) {
    let j = i + 1;
    while (j < indexed.length && indexed[j].value === indexed[i].value) {
      j += 1;
    }

    const averageRank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].index] = averageRank;
    }
    i = j;
  }

  return ranks;
}

function spearmanCorrelation(
  x: readonly number[],
  y: readonly number[]
): number {
  return pearsonCorrelation(rank(x), rank(y));
}

function fitLinearModel(
  scores: readonly number[],
  gains: readonly number[]
): LinearModel {
  const slope = linearRegressionSlope(scores, gains);
  const intercept = mean(gains) - slope * mean(scores);
  return {
    intercept,
    slope,
  };
}

function bootstrapMetric(
  rows: readonly HoldoutRow[],
  resamples: number,
  seed: number,
  statistic: (sample: readonly HoldoutRow[]) => number
): BootstrapInterval {
  if (rows.length === 0) {
    return { low: Number.NaN, high: Number.NaN };
  }

  const rng = makeRng(seed);
  const sample = new Array<HoldoutRow>(rows.length);
  const estimates = new Array<number>(resamples);

  for (let i = 0; i < resamples; i++) {
    for (let j = 0; j < rows.length; j++) {
      sample[j] = rows[Math.floor(rng() * rows.length)];
    }
    estimates[i] = statistic(sample);
  }

  return {
    low: quantile(estimates, 0.025),
    high: quantile(estimates, 0.975),
  };
}

function sampleTrainingInputs(rng: () => number): ReadinessInputs {
  const intrinsicBeta1 = 6 + Math.floor(rng() * 70);
  const implementationRatio = 0.2 + 0.75 * rng();

  return {
    mapIndependence: 0.15 + 0.85 * rng(),
    reduceAssociativity: 0.1 + 0.9 * rng(),
    keySkew: Math.pow(rng(), 0.9),
    zeroCopyRatio: 0.1 + 0.9 * rng(),
    intrinsicBeta1,
    implementationBeta1: Math.floor(intrinsicBeta1 * implementationRatio),
  };
}

function sampleHoldoutInputs(rng: () => number): ReadinessInputs {
  const intrinsicBeta1 = 4 + Math.floor(rng() * 92);

  // Shift distribution to stress out-of-sample behavior (more extremes and mixed deficit regimes).
  const mapIndependence = 0.05 + 0.95 * Math.sqrt(rng());
  const reduceAssociativity = 0.05 + 0.95 * (1 - Math.pow(1 - rng(), 2));
  const keySkew = Math.pow(rng(), 0.45);
  const zeroCopyRatio = 0.05 + 0.95 * Math.pow(rng(), 1.35);

  const deficitMode = rng();
  let implementationBeta1: number;
  if (deficitMode < 0.25) {
    implementationBeta1 = intrinsicBeta1;
  } else if (deficitMode < 0.5) {
    implementationBeta1 = Math.floor(intrinsicBeta1 * (0.7 + 0.25 * rng()));
  } else if (deficitMode < 0.8) {
    implementationBeta1 = Math.floor(intrinsicBeta1 * (0.3 + 0.35 * rng()));
  } else {
    implementationBeta1 = Math.floor(intrinsicBeta1 * (0.02 + 0.22 * rng()));
  }

  return {
    mapIndependence,
    reduceAssociativity,
    keySkew,
    zeroCopyRatio,
    intrinsicBeta1,
    implementationBeta1,
  };
}

function generateDataset(
  sampleCount: number,
  inputGenerator: (rng: () => number) => ReadinessInputs,
  featureSeed: number,
  noiseSeed: number
): DatasetRow[] {
  const featureRng = makeRng(featureSeed);
  const noiseRng = makeRng(noiseSeed);

  const rows: DatasetRow[] = [];
  for (let index = 0; index < sampleCount; index++) {
    const inputs = inputGenerator(featureRng);
    const scores = computeReadinessScores(inputs);
    const observedGain = simulatePromotionGain(inputs, noiseRng);
    rows.push({
      index,
      inputs,
      scores,
      observedGain,
    });
  }
  return rows;
}

function quartileDelta(rows: readonly HoldoutRow[]): {
  readonly delta: number;
  readonly lowerQuartile: number;
  readonly upperQuartile: number;
  readonly lowMean: number;
  readonly highMean: number;
} {
  const rQrValues = rows.map((row) => row.scores.rQr);
  const lowerQuartile = quantile(rQrValues, 0.25);
  const upperQuartile = quantile(rQrValues, 0.75);

  const low = rows
    .filter((row) => row.scores.rQr <= lowerQuartile)
    .map((row) => row.observedGain);
  const high = rows
    .filter((row) => row.scores.rQr >= upperQuartile)
    .map((row) => row.observedGain);

  if (low.length === 0 || high.length === 0) {
    throw new Error('quartile split produced empty cohorts');
  }

  const lowMean = mean(low);
  const highMean = mean(high);

  return {
    delta: highMean - lowMean,
    lowerQuartile,
    upperQuartile,
    lowMean,
    highMean,
  };
}

function summarizeDeciles(
  rows: readonly HoldoutRow[],
  decileCount: number,
  monotonicTolerance: number
): {
  readonly deciles: readonly Gate4DecileSummary[];
  readonly monotonicViolations: number;
} {
  const sorted = [...rows].sort((a, b) => a.scores.rQr - b.scores.rQr);
  const deciles: Gate4DecileSummary[] = [];

  for (let decile = 0; decile < decileCount; decile++) {
    const start = Math.floor((sorted.length * decile) / decileCount);
    const end = Math.floor((sorted.length * (decile + 1)) / decileCount);
    const bucket = sorted.slice(start, end);
    if (bucket.length === 0) {
      continue;
    }

    deciles.push({
      decile: decile + 1,
      count: bucket.length,
      meanRqr: mean(bucket.map((row) => row.scores.rQr)),
      meanObservedGain: mean(bucket.map((row) => row.observedGain)),
      meanPredictedGain: mean(bucket.map((row) => row.predictedGain)),
    });
  }

  let monotonicViolations = 0;
  for (let index = 1; index < deciles.length; index++) {
    if (
      deciles[index].meanObservedGain + monotonicTolerance <
      deciles[index - 1].meanObservedGain
    ) {
      monotonicViolations += 1;
    }
  }

  return {
    deciles,
    monotonicViolations,
  };
}

export function makeDefaultGate4Config(): Gate4Config {
  return {
    seed: 0x4a4f4f,
    trainSamples: 360,
    holdoutSamples: 520,
    bootstrapResamples: 3000,
    decileCount: 10,
    monotonicTolerance: 0.005,
    thresholds: {
      spearmanLowerCi: 0.24,
      slopeLowerCi: 0.3,
      quartileDeltaLowerCi: 0.08,
      predictedPearsonLowerCi: 0.15,
      maxDecileMonotonicViolations: 3,
    },
  };
}

export function runGate4Holdout(config: Gate4Config): Gate4Report {
  const trainRows = generateDataset(
    config.trainSamples,
    sampleTrainingInputs,
    mixSeed(config.seed, 11),
    mixSeed(config.seed, 12)
  );

  const holdoutRowsRaw = generateDataset(
    config.holdoutSamples,
    sampleHoldoutInputs,
    mixSeed(config.seed, 21),
    mixSeed(config.seed, 22)
  );

  const trainRqr = trainRows.map((row) => row.scores.rQr);
  const trainObserved = trainRows.map((row) => row.observedGain);
  const model = fitLinearModel(trainRqr, trainObserved);

  const trainPredicted = trainRqr.map((score) =>
    clamp01(model.intercept + model.slope * score)
  );

  const holdoutRows: HoldoutRow[] = holdoutRowsRaw.map((row) => ({
    ...row,
    predictedGain: clamp01(model.intercept + model.slope * row.scores.rQr),
  }));

  const holdoutRqr = holdoutRows.map((row) => row.scores.rQr);
  const holdoutObserved = holdoutRows.map((row) => row.observedGain);
  const holdoutPredicted = holdoutRows.map((row) => row.predictedGain);

  const holdoutSpearman = spearmanCorrelation(holdoutRqr, holdoutObserved);
  const holdoutSlope = linearRegressionSlope(holdoutRqr, holdoutObserved);
  const holdoutPredictedPearson = pearsonCorrelation(
    holdoutPredicted,
    holdoutObserved
  );
  const quartiles = quartileDelta(holdoutRows);

  const spearmanCi = bootstrapMetric(
    holdoutRows,
    config.bootstrapResamples,
    mixSeed(config.seed, 31),
    (sample) => {
      const x = sample.map((row) => row.scores.rQr);
      const y = sample.map((row) => row.observedGain);
      return spearmanCorrelation(x, y);
    }
  );

  const slopeCi = bootstrapMetric(
    holdoutRows,
    config.bootstrapResamples,
    mixSeed(config.seed, 32),
    (sample) => {
      const x = sample.map((row) => row.scores.rQr);
      const y = sample.map((row) => row.observedGain);
      return linearRegressionSlope(x, y);
    }
  );

  const quartileDeltaCi = bootstrapMetric(
    holdoutRows,
    config.bootstrapResamples,
    mixSeed(config.seed, 33),
    (sample) => quartileDelta(sample).delta
  );

  const predictedPearsonCi = bootstrapMetric(
    holdoutRows,
    config.bootstrapResamples,
    mixSeed(config.seed, 34),
    (sample) => {
      const predicted = sample.map((row) => row.predictedGain);
      const observed = sample.map((row) => row.observedGain);
      return pearsonCorrelation(predicted, observed);
    }
  );

  const decileSummary = summarizeDeciles(
    holdoutRows,
    config.decileCount,
    config.monotonicTolerance
  );

  const criteria: Gate4Criterion[] = [
    {
      id: 'spearman_ci_low',
      description:
        'Holdout rank correlation between R_qr and realized gain stays positive out-of-sample',
      threshold: `95% CI low >= ${config.thresholds.spearmanLowerCi.toFixed(
        3
      )}`,
      observed: holdoutSpearman,
      ci95: spearmanCi,
      pass: spearmanCi.low >= config.thresholds.spearmanLowerCi,
    },
    {
      id: 'slope_ci_low',
      description:
        'Holdout linear slope d(gain)/d(R_qr) remains materially positive',
      threshold: `95% CI low >= ${config.thresholds.slopeLowerCi.toFixed(3)}`,
      observed: holdoutSlope,
      ci95: slopeCi,
      pass: slopeCi.low >= config.thresholds.slopeLowerCi,
    },
    {
      id: 'quartile_delta_ci_low',
      description:
        'Top-quartile R_qr workloads outperform bottom quartile on realized gain',
      threshold: `95% CI low >= ${config.thresholds.quartileDeltaLowerCi.toFixed(
        3
      )}`,
      observed: quartiles.delta,
      ci95: quartileDeltaCi,
      pass: quartileDeltaCi.low >= config.thresholds.quartileDeltaLowerCi,
    },
    {
      id: 'predicted_pearson_ci_low',
      description:
        'Training-fit predictor remains correlated with holdout realized gain',
      threshold: `95% CI low >= ${config.thresholds.predictedPearsonLowerCi.toFixed(
        3
      )}`,
      observed: holdoutPredictedPearson,
      ci95: predictedPearsonCi,
      pass: predictedPearsonCi.low >= config.thresholds.predictedPearsonLowerCi,
    },
    {
      id: 'decile_monotonicity',
      description: 'Decile mean gains are near-monotone in R_qr',
      threshold: `violations <= ${config.thresholds.maxDecileMonotonicViolations}`,
      observed: decileSummary.monotonicViolations,
      pass:
        decileSummary.monotonicViolations <=
        config.thresholds.maxDecileMonotonicViolations,
    },
  ];

  const failedCriterionIds = criteria
    .filter((criterion) => !criterion.pass)
    .map((criterion) => criterion.id);
  const passedCriterionIds = criteria
    .filter((criterion) => criterion.pass)
    .map((criterion) => criterion.id);

  return {
    protocol: {
      id: 'gate4-rqr-out-of-sample-v1',
      splitRule:
        'Training and holdout cohorts are generated from independent seeds with shifted workload distributions; holdout cohorts are never used in model fitting.',
      scoringRules: [
        'Evaluate only predeclared CI/threshold checks below; no post-hoc threshold tuning.',
        'Use 95% bootstrap confidence intervals with fixed seed and fixed resample count.',
        'Gate PASS requires every criterion to pass; otherwise DENY.',
      ],
    },
    config,
    training: {
      sampleCount: trainRows.length,
      model: {
        intercept: model.intercept,
        slope: model.slope,
        pearson: pearsonCorrelation(trainPredicted, trainObserved),
        spearman: spearmanCorrelation(trainRqr, trainObserved),
        rmse: rmse(trainPredicted, trainObserved),
      },
    },
    holdout: {
      sampleCount: holdoutRows.length,
      lowerQuartileRqr: quartiles.lowerQuartile,
      upperQuartileRqr: quartiles.upperQuartile,
      lowQuartileMeanGain: quartiles.lowMean,
      highQuartileMeanGain: quartiles.highMean,
      spearman: {
        value: holdoutSpearman,
        ci95: spearmanCi,
      },
      slope: {
        value: holdoutSlope,
        ci95: slopeCi,
      },
      quartileDelta: {
        value: quartiles.delta,
        ci95: quartileDeltaCi,
      },
      predictedPearson: {
        value: holdoutPredictedPearson,
        ci95: predictedPearsonCi,
      },
      predictedRmse: rmse(holdoutPredicted, holdoutObserved),
      deciles: decileSummary.deciles,
      monotonicViolations: decileSummary.monotonicViolations,
    },
    gate: {
      pass: failedCriterionIds.length === 0,
      criteria,
      failedCriterionIds,
      passedCriterionIds,
    },
  };
}

function formatCriterionResult(criterion: Gate4Criterion): string {
  const ci = criterion.ci95
    ? ` (95% CI ${criterion.ci95.low.toFixed(
        3
      )} to ${criterion.ci95.high.toFixed(3)})`
    : '';
  return `- ${criterion.id}: ${
    criterion.pass ? 'PASS' : 'DENY'
  } | observed ${criterion.observed.toFixed(3)}${ci} | threshold ${
    criterion.threshold
  }`;
}

export function renderGate4Markdown(report: Gate4Report): string {
  const lines: string[] = [];
  lines.push('# Gate 4 Out-of-Sample R_qr Validation');
  lines.push('');
  lines.push(`- Verdict: **${report.gate.pass ? 'PASS' : 'DENY'}**`);
  lines.push(`- Protocol: \`${report.protocol.id}\``);
  lines.push(`- Training samples: ${report.training.sampleCount}`);
  lines.push(`- Holdout samples: ${report.holdout.sampleCount}`);
  lines.push(`- Bootstrap resamples: ${report.config.bootstrapResamples}`);
  lines.push('');
  lines.push('## Predeclared Scoring Rules');
  lines.push('');
  for (const rule of report.protocol.scoringRules) {
    lines.push(`- ${rule}`);
  }
  lines.push('');
  lines.push('## Criteria');
  lines.push('');
  for (const criterion of report.gate.criteria) {
    lines.push(formatCriterionResult(criterion));
  }
  lines.push('');
  lines.push('## Holdout Summary');
  lines.push('');
  lines.push(
    `- Spearman(R_qr, gain): ${report.holdout.spearman.value.toFixed(
      3
    )} (95% CI ${report.holdout.spearman.ci95.low.toFixed(
      3
    )} to ${report.holdout.spearman.ci95.high.toFixed(3)})`
  );
  lines.push(
    `- Slope d(gain)/d(R_qr): ${report.holdout.slope.value.toFixed(
      3
    )} (95% CI ${report.holdout.slope.ci95.low.toFixed(
      3
    )} to ${report.holdout.slope.ci95.high.toFixed(3)})`
  );
  lines.push(
    `- Top quartile minus bottom quartile gain: ${report.holdout.quartileDelta.value.toFixed(
      3
    )} (95% CI ${report.holdout.quartileDelta.ci95.low.toFixed(
      3
    )} to ${report.holdout.quartileDelta.ci95.high.toFixed(3)})`
  );
  lines.push(
    `- Pearson(predicted, gain): ${report.holdout.predictedPearson.value.toFixed(
      3
    )} (95% CI ${report.holdout.predictedPearson.ci95.low.toFixed(
      3
    )} to ${report.holdout.predictedPearson.ci95.high.toFixed(3)})`
  );
  lines.push(`- Predicted RMSE: ${report.holdout.predictedRmse.toFixed(3)}`);
  lines.push(
    `- Decile monotonicity violations: ${report.holdout.monotonicViolations}`
  );
  lines.push('');
  lines.push('## Deciles (Holdout)');
  lines.push('');
  lines.push(
    '| Decile | Count | Mean R_qr | Mean Gain | Mean Predicted Gain |'
  );
  lines.push('|---|---:|---:|---:|---:|');
  for (const decile of report.holdout.deciles) {
    lines.push(
      `| ${decile.decile} | ${decile.count} | ${decile.meanRqr.toFixed(
        3
      )} | ${decile.meanObservedGain.toFixed(
        3
      )} | ${decile.meanPredictedGain.toFixed(3)} |`
    );
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}
