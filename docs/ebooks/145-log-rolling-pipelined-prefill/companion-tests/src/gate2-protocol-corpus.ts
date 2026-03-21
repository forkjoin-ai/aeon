export interface BootstrapInterval {
  readonly low: number;
  readonly high: number;
}

export interface Gate2Environment {
  readonly name: string;
  readonly rttMs: number;
  readonly jitterMs: number;
  readonly bandwidthMbps: number;
  readonly lossRate: number;
  readonly primary: boolean;
}

export interface Gate2Thresholds {
  readonly framingMedianLowerCiPct: number;
  readonly completionMedianLowerCiMs: number;
  readonly completionP95LowerCiMs: number;
  readonly minFramingWinRate: number;
  readonly minCompletionMedianWinRate: number;
  readonly minCompletionP95WinRate: number;
}

export interface Gate2Config {
  readonly seed: number;
  readonly corpusSize: number;
  readonly trialsPerSite: number;
  readonly bootstrapResamples: number;
  readonly environments: readonly Gate2Environment[];
  readonly thresholds: Gate2Thresholds;
}

interface ResourceProfile {
  readonly path: string;
  readonly contentType: string;
  readonly rawBytes: number;
}

interface SiteProfile {
  readonly id: string;
  readonly resources: readonly ResourceProfile[];
}

interface ProtocolSiteStats {
  readonly resourceCount: number;
  readonly totalCompressedBytes: number;
  readonly totalFramingBytes: number;
  readonly totalWireBytes: number;
}

interface SiteCellMetrics {
  readonly framingGainPct: number;
  readonly completionMedianGainMs: number;
  readonly completionP95GainMs: number;
}

export interface Gate2CellResult {
  readonly cellId: string;
  readonly environment: Gate2Environment;
  readonly siteCount: number;
  readonly framingMedianGainPct: number;
  readonly framingMedianGainPctCi: BootstrapInterval;
  readonly completionMedianGainMs: number;
  readonly completionMedianGainMsCi: BootstrapInterval;
  readonly completionP95GainMs: number;
  readonly completionP95GainMsCi: BootstrapInterval;
  readonly framingWinRate: number;
  readonly completionMedianWinRate: number;
  readonly completionP95WinRate: number;
  readonly passed: boolean;
  readonly failedCriteria: readonly string[];
}

export interface Gate2Report {
  readonly protocol: {
    readonly id: string;
    readonly corpusRule: string;
    readonly scoringRules: readonly string[];
  };
  readonly config: Gate2Config;
  readonly corpus: {
    readonly siteCount: number;
    readonly totalResources: number;
    readonly medianResourcesPerSite: number;
    readonly medianRawBytesPerSite: number;
    readonly p95RawBytesPerSite: number;
  };
  readonly cells: readonly Gate2CellResult[];
  readonly gate: {
    readonly pass: boolean;
    readonly primaryCells: readonly string[];
    readonly passedPrimaryCells: readonly string[];
    readonly failedPrimaryCells: readonly string[];
  };
}

class Lcg {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
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
    throw new Error('quantile requires non-empty values');
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

function bootstrapMedianCi(
  values: readonly number[],
  seed: number,
  resamples: number
): BootstrapInterval {
  if (values.length === 0) {
    return { low: Number.NaN, high: Number.NaN };
  }

  const rng = new Lcg(seed);
  const estimates = new Array<number>(resamples);
  const sample = new Array<number>(values.length);

  for (let i = 0; i < resamples; i++) {
    for (let j = 0; j < values.length; j++) {
      sample[j] = values[Math.floor(rng.next() * values.length)];
    }
    estimates[i] = quantile(sample, 0.5);
  }

  return {
    low: quantile(estimates, 0.025),
    high: quantile(estimates, 0.975),
  };
}

function uniformInt(rng: Lcg, low: number, high: number): number {
  const width = high - low + 1;
  return low + Math.floor(rng.next() * width);
}

function sampleContentType(rng: Lcg, family: number): string {
  const pick = rng.next();
  if (family === 0) {
    if (pick < 0.35) return 'application/javascript';
    if (pick < 0.55) return 'text/css';
    if (pick < 0.7) return 'application/json';
    if (pick < 0.82) return 'image/svg+xml';
    if (pick < 0.9) return 'font/woff2';
    return 'image/webp';
  }
  if (family === 1) {
    if (pick < 0.25) return 'application/javascript';
    if (pick < 0.38) return 'text/css';
    if (pick < 0.52) return 'application/json';
    if (pick < 0.65) return 'text/html';
    if (pick < 0.76) return 'image/svg+xml';
    if (pick < 0.86) return 'font/woff2';
    if (pick < 0.94) return 'application/wasm';
    return 'image/jpeg';
  }

  if (pick < 0.2) return 'application/javascript';
  if (pick < 0.28) return 'text/css';
  if (pick < 0.36) return 'application/json';
  if (pick < 0.48) return 'application/wasm';
  if (pick < 0.66) return 'image/jpeg';
  if (pick < 0.84) return 'image/webp';
  if (pick < 0.94) return 'font/woff2';
  return 'video/mp4';
}

function sampleRawBytes(rng: Lcg, contentType: string): number {
  if (contentType === 'application/javascript')
    return uniformInt(rng, 8_000, 260_000);
  if (contentType === 'text/css') return uniformInt(rng, 2_000, 85_000);
  if (contentType === 'application/json')
    return uniformInt(rng, 1_200, 140_000);
  if (contentType === 'text/html') return uniformInt(rng, 6_000, 180_000);
  if (contentType === 'image/svg+xml') return uniformInt(rng, 1_100, 42_000);
  if (contentType === 'font/woff2') return uniformInt(rng, 18_000, 210_000);
  if (contentType === 'application/wasm')
    return uniformInt(rng, 45_000, 1_250_000);
  if (contentType === 'video/mp4') return uniformInt(rng, 250_000, 6_500_000);
  if (contentType === 'image/jpeg') return uniformInt(rng, 12_000, 1_600_000);
  return uniformInt(rng, 10_000, 1_100_000); // image/webp fallback
}

function sampleCompressionRatio(rng: Lcg, contentType: string): number {
  if (contentType === 'application/javascript') return 0.24 + 0.14 * rng.next();
  if (contentType === 'text/css') return 0.2 + 0.12 * rng.next();
  if (contentType === 'application/json') return 0.22 + 0.2 * rng.next();
  if (contentType === 'text/html') return 0.2 + 0.12 * rng.next();
  if (contentType === 'image/svg+xml') return 0.24 + 0.2 * rng.next();
  if (contentType === 'font/woff2') return 0.9 + 0.08 * rng.next();
  if (contentType === 'application/wasm') return 0.52 + 0.24 * rng.next();
  if (contentType === 'video/mp4') return 0.96 + 0.03 * rng.next();
  if (contentType === 'image/jpeg') return 0.94 + 0.05 * rng.next();
  return 0.93 + 0.05 * rng.next(); // image/webp
}

function generateCorpus(config: Gate2Config): readonly SiteProfile[] {
  const rng = new Lcg(config.seed);
  const sites: SiteProfile[] = [];

  for (let siteIndex = 0; siteIndex < config.corpusSize; siteIndex++) {
    const familyRoll = rng.next();
    const family = familyRoll < 0.34 ? 0 : familyRoll < 0.7 ? 1 : 2;
    const resourceCount =
      family === 0
        ? uniformInt(rng, 70, 240)
        : family === 1
        ? uniformInt(rng, 25, 130)
        : uniformInt(rng, 8, 52);

    const entropy = 0.9 + 0.25 * rng.next();
    const resources: ResourceProfile[] = [];
    for (
      let resourceIndex = 0;
      resourceIndex < resourceCount;
      resourceIndex++
    ) {
      const contentType = sampleContentType(rng, family);
      const rawBytes = Math.round(sampleRawBytes(rng, contentType) * entropy);
      const extension =
        contentType === 'application/javascript'
          ? 'js'
          : contentType === 'text/css'
          ? 'css'
          : contentType === 'application/json'
          ? 'json'
          : contentType === 'text/html'
          ? 'html'
          : contentType === 'image/svg+xml'
          ? 'svg'
          : contentType === 'font/woff2'
          ? 'woff2'
          : contentType === 'application/wasm'
          ? 'wasm'
          : contentType === 'video/mp4'
          ? 'mp4'
          : contentType === 'image/jpeg'
          ? 'jpg'
          : 'webp';
      const pathDepth = uniformInt(rng, 1, 5);
      const pathParts = new Array<string>(pathDepth).fill('asset');
      const path = `/${pathParts.join(
        '/'
      )}/s${siteIndex}-r${resourceIndex}-${uniformInt(
        rng,
        0,
        999
      )}.${extension}`;
      resources.push({
        path,
        contentType,
        rawBytes,
      });
    }

    sites.push({
      id: `site-${siteIndex.toString().padStart(3, '0')}`,
      resources,
    });
  }

  return sites;
}

function h3DataFrameHeaderSize(payloadSize: number): number {
  if (payloadSize <= 63) return 2;
  if (payloadSize <= 16383) return 3;
  if (payloadSize <= 1073741823) return 5;
  return 9;
}

function h3HeadersFrameHeaderSize(encodedHeadersSize: number): number {
  if (encodedHeadersSize <= 63) return 2;
  if (encodedHeadersSize <= 16383) return 3;
  return 5;
}

function qpackRequestSize(path: string, first: boolean): number {
  const qpackPrefix = 2;
  const pathBytes = Math.ceil(path.length * 0.8);
  if (first) {
    return qpackPrefix + 1 + 1 + 12 + pathBytes + 55;
  }
  return qpackPrefix + 1 + 1 + 1 + pathBytes + 6;
}

function qpackResponseSize(
  contentType: string,
  compressedSize: number,
  first: boolean
): number {
  const qpackPrefix = 2;
  const ctBytes = Math.ceil(contentType.length * 0.8);
  if (first) {
    return qpackPrefix + 1 + ctBytes + 7 + 70 + (compressedSize > 0 ? 3 : 0);
  }
  return qpackPrefix + 1 + ctBytes + 7 + 10 + (compressedSize > 0 ? 2 : 0);
}

function summarizeHttp3(site: SiteProfile, seed: number): ProtocolSiteStats {
  const rng = new Lcg(seed);
  let totalCompressedBytes = 0;
  let totalFramingBytes = 0;

  for (let index = 0; index < site.resources.length; index++) {
    const resource = site.resources[index];
    const ratio = sampleCompressionRatio(rng, resource.contentType);
    const compressedBytes = Math.max(
      256,
      Math.round(resource.rawBytes * ratio)
    );
    totalCompressedBytes += compressedBytes;

    const reqQpack = qpackRequestSize(resource.path, index === 0);
    const resQpack = qpackResponseSize(
      resource.contentType,
      compressedBytes,
      index === 0
    );
    const headersOverhead =
      h3HeadersFrameHeaderSize(reqQpack) +
      reqQpack +
      h3HeadersFrameHeaderSize(resQpack) +
      resQpack;
    totalFramingBytes +=
      headersOverhead + h3DataFrameHeaderSize(compressedBytes);
  }

  return {
    resourceCount: site.resources.length,
    totalCompressedBytes,
    totalFramingBytes,
    totalWireBytes: totalCompressedBytes + totalFramingBytes,
  };
}

function summarizeAeonFlow(site: SiteProfile, seed: number): ProtocolSiteStats {
  const rng = new Lcg(seed);
  let totalCompressedBytes = 0;

  for (const resource of site.resources) {
    const ratio = sampleCompressionRatio(rng, resource.contentType);
    const compressedBytes = Math.max(
      256,
      Math.round(resource.rawBytes * ratio)
    );
    totalCompressedBytes += compressedBytes;
  }

  const forkFrameTotal = 10 + site.resources.length * 2;
  const forkFrameShare = forkFrameTotal / site.resources.length;
  const perResourceFraming = Math.ceil(10 + 10 + forkFrameShare);
  const totalFramingBytes = perResourceFraming * site.resources.length;

  return {
    resourceCount: site.resources.length,
    totalCompressedBytes,
    totalFramingBytes,
    totalWireBytes: totalCompressedBytes + totalFramingBytes,
  };
}

interface TrialFactors {
  readonly congestionFactor: number;
  readonly jitterMs: number;
  readonly spikeMs: number;
  readonly lossShock: number;
}

function sampleTrialFactors(
  rng: Lcg,
  environment: Gate2Environment
): TrialFactors {
  const congestionFactor = 0.88 + rng.next() * 0.52;
  const jitterMs =
    environment.jitterMs * (0.35 + 1.9 * rng.next() * rng.next());
  const spikeMs =
    rng.next() < 0.03 + environment.lossRate * 3.5
      ? environment.rttMs * (1 + 4 * rng.next())
      : 0;
  const lossShock = environment.lossRate * (0.3 + 2.2 * rng.next());
  return {
    congestionFactor,
    jitterMs,
    spikeMs,
    lossShock,
  };
}

function completionMs(
  stats: ProtocolSiteStats,
  environment: Gate2Environment,
  factors: TrialFactors,
  protocol: 'http3' | 'aeon-flow',
  rng: Lcg
): number {
  const transferMs =
    ((stats.totalWireBytes * 8) / (environment.bandwidthMbps * 1000)) *
    factors.congestionFactor;
  const schedulerMs =
    protocol === 'http3'
      ? Math.sqrt(stats.resourceCount) * 0.82 +
        Math.log2(1 + stats.resourceCount) * 0.3
      : Math.sqrt(stats.resourceCount) * 0.33 +
        Math.log2(1 + stats.resourceCount) * 0.12;
  const parseMs =
    protocol === 'http3'
      ? stats.totalFramingBytes * 0.0032 + stats.resourceCount * 0.018
      : stats.totalFramingBytes * 0.0014 + stats.resourceCount * 0.007;
  const retransmitMs =
    transferMs * factors.lossShock * (protocol === 'http3' ? 0.48 : 0.31);
  const protocolNoiseMs = (protocol === 'http3' ? 1.2 : 0.75) * rng.next();

  return (
    environment.rttMs +
    transferMs +
    schedulerMs +
    parseMs +
    retransmitMs +
    factors.jitterMs +
    factors.spikeMs +
    protocolNoiseMs
  );
}

function evaluateSiteOnEnvironment(
  site: SiteProfile,
  environment: Gate2Environment,
  config: Gate2Config,
  siteIndex: number
): SiteCellMetrics {
  const statsSeed = mixSeed(config.seed, siteIndex, 17);
  const http3Stats = summarizeHttp3(site, statsSeed);
  const aeonStats = summarizeAeonFlow(site, statsSeed);

  const h3Trials: number[] = [];
  const aeonTrials: number[] = [];

  for (let trial = 0; trial < config.trialsPerSite; trial++) {
    const trialSeed = mixSeed(config.seed, siteIndex, trial, 311);
    const trialRng = new Lcg(trialSeed);
    const factors = sampleTrialFactors(trialRng, environment);
    h3Trials.push(
      completionMs(http3Stats, environment, factors, 'http3', trialRng)
    );
    aeonTrials.push(
      completionMs(aeonStats, environment, factors, 'aeon-flow', trialRng)
    );
  }

  const framingGainPct =
    ((http3Stats.totalFramingBytes - aeonStats.totalFramingBytes) /
      http3Stats.totalFramingBytes) *
    100;
  const completionMedianGainMs =
    quantile(h3Trials, 0.5) - quantile(aeonTrials, 0.5);
  const completionP95GainMs =
    quantile(h3Trials, 0.95) - quantile(aeonTrials, 0.95);

  return {
    framingGainPct,
    completionMedianGainMs,
    completionP95GainMs,
  };
}

function evaluateCell(
  sites: readonly SiteProfile[],
  environment: Gate2Environment,
  config: Gate2Config,
  envIndex: number
): Gate2CellResult {
  const perSite = sites.map((site, siteIndex) =>
    evaluateSiteOnEnvironment(site, environment, config, siteIndex)
  );
  const framingValues = perSite.map((item) => item.framingGainPct);
  const medianValues = perSite.map((item) => item.completionMedianGainMs);
  const p95Values = perSite.map((item) => item.completionP95GainMs);

  const framingMedianGainPct = quantile(framingValues, 0.5);
  const completionMedianGainMs = quantile(medianValues, 0.5);
  const completionP95GainMs = quantile(p95Values, 0.5);

  const framingMedianGainPctCi = bootstrapMedianCi(
    framingValues,
    mixSeed(config.seed, envIndex, 401),
    config.bootstrapResamples
  );
  const completionMedianGainMsCi = bootstrapMedianCi(
    medianValues,
    mixSeed(config.seed, envIndex, 409),
    config.bootstrapResamples
  );
  const completionP95GainMsCi = bootstrapMedianCi(
    p95Values,
    mixSeed(config.seed, envIndex, 419),
    config.bootstrapResamples
  );

  const framingWinRate =
    framingValues.filter((value) => value > 0).length / framingValues.length;
  const completionMedianWinRate =
    medianValues.filter((value) => value > 0).length / medianValues.length;
  const completionP95WinRate =
    p95Values.filter((value) => value > 0).length / p95Values.length;

  const failedCriteria: string[] = [];
  if (framingMedianGainPctCi.low <= config.thresholds.framingMedianLowerCiPct) {
    failedCriteria.push('framing_median_ci_low');
  }
  if (
    completionMedianGainMsCi.low <= config.thresholds.completionMedianLowerCiMs
  ) {
    failedCriteria.push('completion_median_ci_low');
  }
  if (completionP95GainMsCi.low <= config.thresholds.completionP95LowerCiMs) {
    failedCriteria.push('completion_p95_ci_low');
  }
  if (framingWinRate < config.thresholds.minFramingWinRate) {
    failedCriteria.push('framing_win_rate');
  }
  if (completionMedianWinRate < config.thresholds.minCompletionMedianWinRate) {
    failedCriteria.push('completion_median_win_rate');
  }
  if (completionP95WinRate < config.thresholds.minCompletionP95WinRate) {
    failedCriteria.push('completion_p95_win_rate');
  }

  return {
    cellId: environment.name,
    environment,
    siteCount: sites.length,
    framingMedianGainPct,
    framingMedianGainPctCi,
    completionMedianGainMs,
    completionMedianGainMsCi,
    completionP95GainMs,
    completionP95GainMsCi,
    framingWinRate,
    completionMedianWinRate,
    completionP95WinRate,
    passed: failedCriteria.length === 0,
    failedCriteria,
  };
}

function summarizeCorpus(sites: readonly SiteProfile[]): Gate2Report['corpus'] {
  const resourcesPerSite = sites.map((site) => site.resources.length);
  const rawBytesPerSite = sites.map((site) =>
    site.resources.reduce((sum, resource) => sum + resource.rawBytes, 0)
  );
  const totalResources = resourcesPerSite.reduce(
    (sum, count) => sum + count,
    0
  );
  return {
    siteCount: sites.length,
    totalResources,
    medianResourcesPerSite: quantile(resourcesPerSite, 0.5),
    medianRawBytesPerSite: quantile(rawBytesPerSite, 0.5),
    p95RawBytesPerSite: quantile(rawBytesPerSite, 0.95),
  };
}

export function makeDefaultGate2Config(): Gate2Config {
  return {
    seed: 0x00ae0201,
    corpusSize: 144,
    trialsPerSite: 8,
    bootstrapResamples: 2000,
    environments: [
      {
        name: 'rtt4-bw120-loss0',
        rttMs: 4,
        jitterMs: 0.4,
        bandwidthMbps: 120,
        lossRate: 0,
        primary: false,
      },
      {
        name: 'rtt12-bw80-loss0',
        rttMs: 12,
        jitterMs: 1.2,
        bandwidthMbps: 80,
        lossRate: 0,
        primary: true,
      },
      {
        name: 'rtt24-bw40-loss0.2pct',
        rttMs: 24,
        jitterMs: 2.4,
        bandwidthMbps: 40,
        lossRate: 0.002,
        primary: true,
      },
      {
        name: 'rtt35-bw28-loss0.5pct',
        rttMs: 35,
        jitterMs: 3.5,
        bandwidthMbps: 28,
        lossRate: 0.005,
        primary: true,
      },
      {
        name: 'rtt48-bw18-loss1pct',
        rttMs: 48,
        jitterMs: 4.8,
        bandwidthMbps: 18,
        lossRate: 0.01,
        primary: true,
      },
      {
        name: 'rtt75-bw10-loss1.5pct',
        rttMs: 75,
        jitterMs: 7.5,
        bandwidthMbps: 10,
        lossRate: 0.015,
        primary: true,
      },
      {
        name: 'rtt110-bw7-loss2pct',
        rttMs: 110,
        jitterMs: 11,
        bandwidthMbps: 7,
        lossRate: 0.02,
        primary: true,
      },
      {
        name: 'rtt150-bw4-loss3pct',
        rttMs: 150,
        jitterMs: 15,
        bandwidthMbps: 4,
        lossRate: 0.03,
        primary: false,
      },
    ],
    thresholds: {
      framingMedianLowerCiPct: 0,
      completionMedianLowerCiMs: 0,
      completionP95LowerCiMs: 0,
      minFramingWinRate: 0.9,
      minCompletionMedianWinRate: 0.75,
      minCompletionP95WinRate: 0.75,
    },
  };
}

export function runGate2Corpus(config: Gate2Config): Gate2Report {
  const sites = generateCorpus(config);
  const cells = config.environments.map((environment, envIndex) =>
    evaluateCell(sites, environment, config, envIndex)
  );
  const primaryCells = cells
    .filter((cell) => cell.environment.primary)
    .map((cell) => cell.cellId);
  const passedPrimaryCells = cells
    .filter((cell) => cell.environment.primary && cell.passed)
    .map((cell) => cell.cellId);
  const failedPrimaryCells = cells
    .filter((cell) => cell.environment.primary && !cell.passed)
    .map((cell) => cell.cellId);

  return {
    protocol: {
      id: 'gate2-protocol-corpus-v1',
      corpusRule:
        'Seeded heterogeneous site corpus spanning resource-count, MIME-type, and byte-size diversity; all environments evaluated with identical per-site trial budgets.',
      scoringRules: [
        'Cell pass requires positive 95% bootstrap CI lower bounds for median framing gain (%), median completion gain (ms), and p95 completion gain (ms).',
        'Cell pass also requires minimum per-site win rates on framing, median completion, and p95 completion metrics.',
        'Gate pass requires all primary environments to pass.',
      ],
    },
    config,
    corpus: summarizeCorpus(sites),
    cells,
    gate: {
      pass: failedPrimaryCells.length === 0,
      primaryCells,
      passedPrimaryCells,
      failedPrimaryCells,
    },
  };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function renderGate2Markdown(report: Gate2Report): string {
  const lines: string[] = [];
  lines.push('# Gate 2 Protocol Corpus Matrix');
  lines.push('');
  lines.push(
    'Large heterogeneous protocol corpus benchmark (Aeon Flow vs HTTP/3) with seeded site generation and environment matrix evaluation.'
  );
  lines.push('');
  lines.push('## Corpus');
  lines.push('');
  lines.push(`- Protocol id: ${report.protocol.id}`);
  lines.push(`- Site count: ${report.corpus.siteCount}`);
  lines.push(`- Total resources: ${report.corpus.totalResources}`);
  lines.push(
    `- Median resources/site: ${report.corpus.medianResourcesPerSite.toFixed(
      1
    )}`
  );
  lines.push(
    `- Median raw bytes/site: ${report.corpus.medianRawBytesPerSite.toFixed(0)}`
  );
  lines.push(
    `- p95 raw bytes/site: ${report.corpus.p95RawBytesPerSite.toFixed(0)}`
  );
  lines.push('');
  lines.push('## Verdict');
  lines.push('');
  lines.push(`- Overall Gate 2: **${report.gate.pass ? 'PASS' : 'DENY'}**`);
  lines.push(
    `- Primary cells passed: ${report.gate.passedPrimaryCells.length}/${report.gate.primaryCells.length}`
  );
  lines.push('');
  lines.push('## Matrix Results');
  lines.push('');
  lines.push(
    '| Cell | Primary | Sites | Framing Median Gain % (95% CI) | Completion Median Gain ms (95% CI) | Completion p95 Gain ms (95% CI) | Win Rates (framing/median/p95) | Pass |'
  );
  lines.push('|---|---|---:|---:|---:|---:|---:|---|');
  for (const cell of report.cells) {
    lines.push(
      `| ${cell.cellId} | ${cell.environment.primary ? 'yes' : 'no'} | ${
        cell.siteCount
      }` +
        ` | ${cell.framingMedianGainPct.toFixed(
          3
        )} (${cell.framingMedianGainPctCi.low.toFixed(
          3
        )} to ${cell.framingMedianGainPctCi.high.toFixed(3)})` +
        ` | ${cell.completionMedianGainMs.toFixed(
          3
        )} (${cell.completionMedianGainMsCi.low.toFixed(
          3
        )} to ${cell.completionMedianGainMsCi.high.toFixed(3)})` +
        ` | ${cell.completionP95GainMs.toFixed(
          3
        )} (${cell.completionP95GainMsCi.low.toFixed(
          3
        )} to ${cell.completionP95GainMsCi.high.toFixed(3)})` +
        ` | ${formatPercent(cell.framingWinRate)}/${formatPercent(
          cell.completionMedianWinRate
        )}/${formatPercent(cell.completionP95WinRate)}` +
        ` | ${cell.passed ? 'yes' : 'no'} |`
    );
  }
  lines.push('');
  lines.push('## Gate Rule');
  lines.push('');
  for (const rule of report.protocol.scoringRules) {
    lines.push(`- ${rule}`);
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}
