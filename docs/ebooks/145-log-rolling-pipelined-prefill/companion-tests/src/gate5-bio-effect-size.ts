import { makeRng, mean } from './map-reduce-readiness';

export interface BootstrapInterval {
  readonly low: number;
  readonly high: number;
}

export interface NumericRange {
  readonly min: number;
  readonly max: number;
}

export interface BiologicalPairSpec {
  readonly id: string;
  readonly domain: string;
  readonly numeratorLabel: string;
  readonly denominatorLabel: string;
  readonly numeratorRange: NumericRange;
  readonly denominatorRange: NumericRange;
  readonly unit: string;
  readonly source: string;
  readonly citationIds: readonly number[];
  readonly primary: boolean;
}

export interface Gate5Thresholds {
  readonly minPairCount: number;
  readonly minPairRatioLowerCi: number;
  readonly minPrimaryPairPassRate: number;
  readonly pooledLogRatioLowerCi: number;
}

export interface Gate5Config {
  readonly seed: number;
  readonly drawsPerPair: number;
  readonly bootstrapResamples: number;
  readonly thresholds: Gate5Thresholds;
}

export interface Gate5PairResult {
  readonly id: string;
  readonly domain: string;
  readonly numeratorLabel: string;
  readonly denominatorLabel: string;
  readonly unit: string;
  readonly source: string;
  readonly citationIds: readonly number[];
  readonly primary: boolean;
  readonly medianRatio: number;
  readonly meanLogRatio: number;
  readonly ratioCi95: BootstrapInterval;
  readonly pass: boolean;
}

export interface Gate5Criterion {
  readonly id: string;
  readonly description: string;
  readonly threshold: string;
  readonly observed: number;
  readonly ci95?: BootstrapInterval;
  readonly pass: boolean;
}

export interface Gate5Report {
  readonly protocol: {
    readonly id: string;
    readonly inclusionRules: readonly string[];
    readonly scoringRules: readonly string[];
  };
  readonly config: Gate5Config;
  readonly pairs: readonly Gate5PairResult[];
  readonly aggregate: {
    readonly pairCount: number;
    readonly primaryPairCount: number;
    readonly medianPairRatio: number;
    readonly minPrimaryPairRatioCiLow: number;
    readonly pooledLogRatio: number;
    readonly pooledLogRatioCi95: BootstrapInterval;
    readonly primaryPassRate: number;
  };
  readonly gate: {
    readonly pass: boolean;
    readonly criteria: readonly Gate5Criterion[];
    readonly passedCriterionIds: readonly string[];
    readonly failedCriterionIds: readonly string[];
  };
}

interface PairSimulation {
  readonly result: Gate5PairResult;
  readonly logRatios: readonly number[];
}

const BIOLOGICAL_PAIRS: readonly BiologicalPairSpec[] = [
  {
    id: 'saltatory_velocity',
    domain: 'Neural conduction',
    numeratorLabel: 'myelinated conduction velocity',
    denominatorLabel: 'unmyelinated conduction velocity',
    numeratorRange: { min: 80, max: 120 },
    denominatorRange: { min: 0.5, max: 2.0 },
    unit: 'm/s',
    source: 'Conduction-velocity ranges from cited neurophysiology literature.',
    citationIds: [32, 46],
    primary: true,
  },
  {
    id: 'photosynthesis_step_vs_system',
    domain: 'Photosynthesis efficiency scale contrast',
    numeratorLabel: 'exciton transfer efficiency (step-level)',
    denominatorLabel: 'whole-plant photosynthetic yield',
    numeratorRange: { min: 0.95, max: 0.99 },
    denominatorRange: { min: 0.03, max: 0.06 },
    unit: 'ratio',
    source:
      'Step-level and system-level efficiency ranges from cited literature.',
    citationIds: [6, 44],
    primary: true,
  },
  {
    id: 'okazaki_chunking',
    domain: 'Replication chunk size',
    numeratorLabel: 'prokaryotic Okazaki fragment length',
    denominatorLabel: 'eukaryotic Okazaki fragment length',
    numeratorRange: { min: 1000, max: 2000 },
    denominatorRange: { min: 100, max: 200 },
    unit: 'nt',
    source:
      'Okazaki-fragment length ranges from cited molecular biology literature.',
    citationIds: [45],
    primary: true,
  },
];

function hashString(seed: number, value: string): number {
  let hash = seed >>> 0;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
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

function sampleRange(range: NumericRange, rng: () => number): number {
  if (range.min <= 0 || range.max <= 0) {
    throw new Error(
      `Ranges must be strictly positive; got ${range.min}-${range.max}`
    );
  }
  if (range.max < range.min) {
    throw new Error(`Range max must be >= min; got ${range.min}-${range.max}`);
  }
  if (range.max === range.min) {
    return range.min;
  }
  return range.min + (range.max - range.min) * rng();
}

function simulatePair(
  pair: BiologicalPairSpec,
  seed: number,
  drawsPerPair: number,
  minPairRatioLowerCi: number
): PairSimulation {
  const rng = makeRng(seed);
  const ratios = new Array<number>(drawsPerPair);
  const logRatios = new Array<number>(drawsPerPair);

  for (let i = 0; i < drawsPerPair; i++) {
    const numerator = sampleRange(pair.numeratorRange, rng);
    const denominator = sampleRange(pair.denominatorRange, rng);
    const ratio = numerator / denominator;
    ratios[i] = ratio;
    logRatios[i] = Math.log(ratio);
  }

  const ratioCi95: BootstrapInterval = {
    low: quantile(ratios, 0.025),
    high: quantile(ratios, 0.975),
  };

  return {
    logRatios,
    result: {
      id: pair.id,
      domain: pair.domain,
      numeratorLabel: pair.numeratorLabel,
      denominatorLabel: pair.denominatorLabel,
      unit: pair.unit,
      source: pair.source,
      citationIds: pair.citationIds,
      primary: pair.primary,
      medianRatio: quantile(ratios, 0.5),
      meanLogRatio: mean(logRatios),
      ratioCi95,
      pass: ratioCi95.low >= minPairRatioLowerCi,
    },
  };
}

function bootstrapPooledLogRatio(
  simulations: readonly PairSimulation[],
  seed: number,
  bootstrapResamples: number
): BootstrapInterval {
  if (simulations.length === 0) {
    return { low: Number.NaN, high: Number.NaN };
  }

  const rng = makeRng(seed);
  const estimates = new Array<number>(bootstrapResamples);

  for (let i = 0; i < bootstrapResamples; i++) {
    const sampleMeans = new Array<number>(simulations.length);
    for (let j = 0; j < simulations.length; j++) {
      const pickedPair = simulations[Math.floor(rng() * simulations.length)];
      const pickedLogRatio =
        pickedPair.logRatios[Math.floor(rng() * pickedPair.logRatios.length)];
      sampleMeans[j] = pickedLogRatio;
    }
    estimates[i] = mean(sampleMeans);
  }

  return {
    low: quantile(estimates, 0.025),
    high: quantile(estimates, 0.975),
  };
}

export function makeDefaultGate5Config(): Gate5Config {
  return {
    seed: 321023,
    drawsPerPair: 12000,
    bootstrapResamples: 3500,
    thresholds: {
      minPairCount: 3,
      minPairRatioLowerCi: 1.2,
      minPrimaryPairPassRate: 1.0,
      pooledLogRatioLowerCi: Math.log(2),
    },
  };
}

function formatThreshold(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

export function runGate5BioEffectSize(config: Gate5Config): Gate5Report {
  if (config.drawsPerPair <= 0 || config.bootstrapResamples <= 0) {
    throw new Error('drawsPerPair and bootstrapResamples must be positive');
  }

  const simulations = BIOLOGICAL_PAIRS.map((pair) =>
    simulatePair(
      pair,
      hashString(config.seed, pair.id),
      config.drawsPerPair,
      config.thresholds.minPairRatioLowerCi
    )
  );

  const pairs = simulations.map((entry) => entry.result);
  const primaryPairs = pairs.filter((pair) => pair.primary);
  const primaryPasses = primaryPairs.filter((pair) => pair.pass).length;
  const primaryPassRate =
    primaryPairs.length === 0 ? 0 : primaryPasses / primaryPairs.length;
  const pooledLogRatio = mean(pairs.map((pair) => pair.meanLogRatio));
  const pooledLogRatioCi95 = bootstrapPooledLogRatio(
    simulations,
    hashString(config.seed ^ 0x9e3779b9, 'pooled_log_ratio_ci'),
    config.bootstrapResamples
  );
  const minPrimaryPairRatioCiLow =
    primaryPairs.length === 0
      ? Number.NaN
      : Math.min(...primaryPairs.map((pair) => pair.ratioCi95.low));

  const criteria: Gate5Criterion[] = [
    {
      id: 'minimum_pair_count',
      description: 'Comparative pair count meets minimum evidence floor.',
      threshold: `>= ${formatThreshold(config.thresholds.minPairCount)}`,
      observed: pairs.length,
      pass: pairs.length >= config.thresholds.minPairCount,
    },
    {
      id: 'primary_pair_ratio_ci_low',
      description:
        'Every primary biological pair has a ratio CI low above the minimum.',
      threshold: `>= ${config.thresholds.minPairRatioLowerCi.toFixed(3)}`,
      observed: minPrimaryPairRatioCiLow,
      pass: minPrimaryPairRatioCiLow >= config.thresholds.minPairRatioLowerCi,
    },
    {
      id: 'primary_pair_pass_rate',
      description: 'Primary pair pass-rate satisfies predeclared requirement.',
      threshold: `>= ${config.thresholds.minPrimaryPairPassRate.toFixed(3)}`,
      observed: primaryPassRate,
      pass: primaryPassRate >= config.thresholds.minPrimaryPairPassRate,
    },
    {
      id: 'pooled_log_ratio_ci_low',
      description:
        'Pooled effect (log ratio) CI low clears the minimum magnitude threshold.',
      threshold: `>= ${config.thresholds.pooledLogRatioLowerCi.toFixed(3)}`,
      observed: pooledLogRatio,
      ci95: pooledLogRatioCi95,
      pass: pooledLogRatioCi95.low >= config.thresholds.pooledLogRatioLowerCi,
    },
  ];

  const passedCriterionIds = criteria
    .filter((criterion) => criterion.pass)
    .map((criterion) => criterion.id);
  const failedCriterionIds = criteria
    .filter((criterion) => !criterion.pass)
    .map((criterion) => criterion.id);

  return {
    protocol: {
      id: 'gate5-bio-effect-size-v1',
      inclusionRules: [
        'Use only predeclared biological condition pairs with quantitative ranges tied to cited literature sources.',
        'Compute multiplicative effect size as ratio = numerator / denominator for each pair.',
        'Use uncertainty propagation by Monte Carlo range sampling plus bootstrap pooled CI.',
      ],
      scoringRules: [
        'Primary pair CI-low ratio threshold',
        'Primary pair pass-rate threshold',
        'Pooled log-ratio CI-low threshold',
      ],
    },
    config,
    pairs,
    aggregate: {
      pairCount: pairs.length,
      primaryPairCount: primaryPairs.length,
      medianPairRatio: quantile(
        pairs.map((pair) => pair.medianRatio),
        0.5
      ),
      minPrimaryPairRatioCiLow,
      pooledLogRatio,
      pooledLogRatioCi95,
      primaryPassRate,
    },
    gate: {
      pass: failedCriterionIds.length === 0,
      criteria,
      passedCriterionIds,
      failedCriterionIds,
    },
  };
}

function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) {
    return 'NaN';
  }
  return value.toFixed(digits);
}

export function renderGate5Markdown(report: Gate5Report): string {
  const lines: string[] = [];
  lines.push('# Gate 5 Biological Effect-Size Mapping');
  lines.push('');
  lines.push(`- Protocol: \`${report.protocol.id}\``);
  lines.push(`- Verdict: **${report.gate.pass ? 'PASS' : 'DENY'}**`);
  lines.push(
    `- Pair count: **${report.aggregate.pairCount}** (primary ${report.aggregate.primaryPairCount})`
  );
  lines.push(
    `- Median pair ratio: **${formatNumber(
      report.aggregate.medianPairRatio
    )}x**`
  );
  lines.push(
    `- Pooled log-ratio: **${formatNumber(
      report.aggregate.pooledLogRatio
    )}** (95% CI ${formatNumber(
      report.aggregate.pooledLogRatioCi95.low
    )}-${formatNumber(report.aggregate.pooledLogRatioCi95.high)})`
  );
  lines.push('');
  lines.push('## Pair Results');
  lines.push('');
  lines.push(
    '| Pair | Numerator / Denominator | Median Ratio | 95% CI Ratio | Primary | Verdict | Sources |'
  );
  lines.push('|---|---|---:|---:|---:|---:|---|');

  for (const pair of report.pairs) {
    lines.push(
      `| ${pair.domain} (\`${pair.id}\`) | ${pair.numeratorLabel} / ${
        pair.denominatorLabel
      } | ${formatNumber(pair.medianRatio)}x | ${formatNumber(
        pair.ratioCi95.low
      )}x-${formatNumber(pair.ratioCi95.high)}x | ${
        pair.primary ? 'yes' : 'no'
      } | ${pair.pass ? 'PASS' : 'DENY'} | ${
        pair.source
      } (refs: ${pair.citationIds.map((id) => `[${id}]`).join(', ')}) |`
    );
  }

  lines.push('');
  lines.push('## Criteria');
  lines.push('');
  lines.push('| Criterion | Observed | 95% CI | Threshold | Verdict |');
  lines.push('|---|---:|---:|---:|---:|');
  for (const criterion of report.gate.criteria) {
    const ci = criterion.ci95
      ? `${formatNumber(criterion.ci95.low)}-${formatNumber(
          criterion.ci95.high
        )}`
      : 'n/a';
    lines.push(
      `| ${criterion.id} | ${formatNumber(criterion.observed)} | ${ci} | ${
        criterion.threshold
      } | ${criterion.pass ? 'PASS' : 'DENY'} |`
    );
  }

  lines.push('');
  lines.push('## Inclusion Rules');
  lines.push('');
  for (const rule of report.protocol.inclusionRules) {
    lines.push(`- ${rule}`);
  }

  lines.push('');
  lines.push('## Scoring Rules');
  lines.push('');
  for (const rule of report.protocol.scoringRules) {
    lines.push(`- ${rule}`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}
