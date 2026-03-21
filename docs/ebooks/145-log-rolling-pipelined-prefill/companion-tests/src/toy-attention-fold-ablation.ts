import {
  bootstrapMeanConfidenceInterval,
  type ConfidenceInterval,
} from './statistics';

export interface ToyAttentionAblationConfig {
  readonly label: 'toy-attention-fold-ablation-v2';
  readonly queries: readonly number[];
  readonly keys: readonly number[];
  readonly values: readonly (readonly number[])[];
  readonly exactSampleMseTolerance: number;
}

type StrategyName = 'linear' | 'winner-take-all' | 'early-stop';

interface StrategyOutput {
  readonly name: StrategyName;
  readonly predict: (
    query: number,
    config: ToyAttentionAblationConfig
  ) => readonly number[];
}

export interface StrategyMetrics {
  readonly meanSquaredError: number;
  readonly meanSquaredErrorCi95: ConfidenceInterval;
  readonly maxAbsoluteError: number;
  readonly exactWithinToleranceFraction: number;
  readonly exactWithinToleranceFractionCi95: ConfidenceInterval;
}

export interface SamplePrediction {
  readonly query: number;
  readonly teacher: readonly number[];
  readonly winnerTakeAll: readonly number[];
  readonly earlyStop: readonly number[];
}

export interface ToyAttentionFoldAblationReport {
  readonly label: ToyAttentionAblationConfig['label'];
  readonly config: {
    readonly queryCount: number;
    readonly pathCount: number;
    readonly outputDimension: number;
    readonly exactSampleMseTolerance: number;
  };
  readonly strategies: Record<StrategyName, StrategyMetrics>;
  readonly rankingByMeanSquaredError: readonly StrategyName[];
  readonly predictedRankingMatches: boolean;
  readonly samplePredictions: readonly SamplePrediction[];
}

function softmax(logits: readonly number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exponentials = logits.map((logit) => Math.exp(logit - maxLogit));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function attentionWeights(
  query: number,
  config: ToyAttentionAblationConfig
): number[] {
  return softmax(config.keys.map((key) => query * key));
}

function linearPrediction(
  query: number,
  config: ToyAttentionAblationConfig
): number[] {
  const weights = attentionWeights(query, config);
  const outputDimension = config.values[0]?.length ?? 0;

  return Array.from({ length: outputDimension }, (_, dimension) =>
    weights.reduce(
      (sum, weight, index) =>
        sum + weight * (config.values[index]?.[dimension] ?? 0),
      0
    )
  );
}

function winnerTakeAllPrediction(
  query: number,
  config: ToyAttentionAblationConfig
): readonly number[] {
  const scores = config.keys.map((key) => query * key);
  let bestIndex = 0;

  for (let index = 1; index < scores.length; index++) {
    if (scores[index] > scores[bestIndex]) {
      bestIndex = index;
    }
  }

  return config.values[bestIndex] ?? [];
}

function earlyStopPrediction(
  _query: number,
  config: ToyAttentionAblationConfig
): readonly number[] {
  return config.values[0] ?? [];
}

const strategies: readonly StrategyOutput[] = [
  { name: 'linear', predict: linearPrediction },
  { name: 'winner-take-all', predict: winnerTakeAllPrediction },
  { name: 'early-stop', predict: earlyStopPrediction },
];

export function makeDefaultToyAttentionAblationConfig(): ToyAttentionAblationConfig {
  return {
    label: 'toy-attention-fold-ablation-v2',
    queries: Array.from({ length: 81 }, (_, index) => -2 + (4 * index) / 80),
    keys: [-1.5, 0, 1.5],
    values: [
      [1.0, -0.5],
      [0.2, 1.2],
      [-1.1, 0.4],
    ],
    exactSampleMseTolerance: 0.01,
  };
}

function strategyMetrics(
  strategy: StrategyOutput,
  config: ToyAttentionAblationConfig
): StrategyMetrics {
  let squaredErrorSum = 0;
  let componentCount = 0;
  let maxAbsoluteError = 0;
  let exactWithinToleranceCount = 0;
  const sampleMeanSquaredErrors: number[] = [];
  const exactIndicators: number[] = [];

  for (const query of config.queries) {
    const teacher = linearPrediction(query, config);
    const prediction = strategy.predict(query, config);

    let sampleSquaredErrorSum = 0;
    for (let dimension = 0; dimension < teacher.length; dimension++) {
      const error = (prediction[dimension] ?? 0) - teacher[dimension];
      squaredErrorSum += error * error;
      sampleSquaredErrorSum += error * error;
      componentCount++;
      maxAbsoluteError = Math.max(maxAbsoluteError, Math.abs(error));
    }

    const sampleMeanSquaredError =
      teacher.length === 0 ? 0 : sampleSquaredErrorSum / teacher.length;
    sampleMeanSquaredErrors.push(sampleMeanSquaredError);
    if (sampleMeanSquaredError <= config.exactSampleMseTolerance) {
      exactWithinToleranceCount++;
      exactIndicators.push(1);
    } else {
      exactIndicators.push(0);
    }
  }

  return {
    meanSquaredError:
      componentCount === 0 ? 0 : squaredErrorSum / componentCount,
    meanSquaredErrorCi95: bootstrapMeanConfidenceInterval(
      sampleMeanSquaredErrors,
      {
        seed:
          strategy.name === 'linear'
            ? 0x11111111
            : strategy.name === 'winner-take-all'
            ? 0x22222222
            : 0x33333333,
      }
    ),
    maxAbsoluteError,
    exactWithinToleranceFraction:
      config.queries.length === 0
        ? 0
        : exactWithinToleranceCount / config.queries.length,
    exactWithinToleranceFractionCi95: bootstrapMeanConfidenceInterval(
      exactIndicators,
      {
        seed:
          strategy.name === 'linear'
            ? 0x44444444
            : strategy.name === 'winner-take-all'
            ? 0x55555555
            : 0x66666666,
      }
    ),
  };
}

function samplePredictions(
  config: ToyAttentionAblationConfig
): readonly SamplePrediction[] {
  const sampleQueries = [
    config.queries[0],
    config.queries[Math.floor(config.queries.length / 2)],
    config.queries[config.queries.length - 1],
  ].filter((query): query is number => query !== undefined);

  return sampleQueries.map((query) => ({
    query,
    teacher: linearPrediction(query, config),
    winnerTakeAll: winnerTakeAllPrediction(query, config),
    earlyStop: earlyStopPrediction(query, config),
  }));
}

export function runToyAttentionFoldAblation(
  config: ToyAttentionAblationConfig = makeDefaultToyAttentionAblationConfig()
): ToyAttentionFoldAblationReport {
  const strategyMetricsByName = Object.fromEntries(
    strategies.map((strategy) => [
      strategy.name,
      strategyMetrics(strategy, config),
    ])
  ) as Record<StrategyName, StrategyMetrics>;

  const rankingByMeanSquaredError = [...strategies]
    .sort(
      (left, right) =>
        strategyMetricsByName[left.name].meanSquaredError -
        strategyMetricsByName[right.name].meanSquaredError
    )
    .map((strategy) => strategy.name);

  const predictedRankingMatches =
    rankingByMeanSquaredError[0] === 'linear' &&
    rankingByMeanSquaredError[1] === 'winner-take-all' &&
    rankingByMeanSquaredError[2] === 'early-stop';

  return {
    label: config.label,
    config: {
      queryCount: config.queries.length,
      pathCount: config.keys.length,
      outputDimension: config.values[0]?.length ?? 0,
      exactSampleMseTolerance: config.exactSampleMseTolerance,
    },
    strategies: strategyMetricsByName,
    rankingByMeanSquaredError,
    predictedRankingMatches,
    samplePredictions: samplePredictions(config),
  };
}

function formatVector(values: readonly number[]): string {
  return `[${values.map((value) => value.toFixed(3)).join(', ')}]`;
}

function formatInterval(interval: ConfidenceInterval): string {
  return `[${interval.low.toFixed(3)}, ${interval.high.toFixed(3)}]`;
}

export function renderToyAttentionFoldAblationMarkdown(
  report: ToyAttentionFoldAblationReport
): string {
  const lines: string[] = [];
  lines.push('# Toy Attention Fold Ablation');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Queries: \`${report.config.queryCount}\``);
  lines.push(`- Paths: \`${report.config.pathCount}\``);
  lines.push(`- Output dimension: \`${report.config.outputDimension}\``);
  lines.push(
    `- Exact-sample MSE tolerance: \`${report.config.exactSampleMseTolerance}\``
  );
  lines.push(
    `- Predicted ranking recovered: \`${
      report.predictedRankingMatches ? 'yes' : 'no'
    }\``
  );
  lines.push('');
  lines.push('## Metrics');
  lines.push('');
  lines.push(
    '| Strategy | Mean squared error | MSE 95% CI | Max absolute error | Exact-within-tolerance fraction | Exact 95% CI |'
  );
  lines.push('|---|---:|---:|---:|---:|---:|');

  for (const strategyName of report.rankingByMeanSquaredError) {
    const metrics = report.strategies[strategyName];
    lines.push(
      `| \`${strategyName}\` | ${metrics.meanSquaredError.toFixed(
        3
      )} | ${formatInterval(
        metrics.meanSquaredErrorCi95
      )} | ${metrics.maxAbsoluteError.toFixed(
        3
      )} | ${metrics.exactWithinToleranceFraction.toFixed(
        3
      )} | ${formatInterval(metrics.exactWithinToleranceFractionCi95)} |`
    );
  }

  lines.push('');
  lines.push('## Sample Predictions');
  lines.push('');
  lines.push('| Query | Teacher | Winner-take-all | Early-stop |');
  lines.push('|---|---|---|---|');

  for (const sample of report.samplePredictions) {
    lines.push(
      `| ${sample.query.toFixed(3)} | ${formatVector(
        sample.teacher
      )} | ${formatVector(sample.winnerTakeAll)} | ${formatVector(
        sample.earlyStop
      )} |`
    );
  }

  lines.push('');
  lines.push(
    'Interpretation: hold keys, values, score function, and query grid fixed. Swapping only the fold rule preserves exact teacher reconstruction for linear attention and introduces measurable error for nonlinear selection.'
  );
  lines.push('');

  return `${lines.join('\n')}\n`;
}
