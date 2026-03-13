import {
  TopologicalCompressor,
  BUILTIN_CODECS,
  RawCodec,
  BrotliCodec,
  GzipCodec,
  DictionaryCodec,
  LZ77Codec,
  DeltaCodec,
  HuffmanCodec,
} from '../../../../../src/compression/index';

export interface BootstrapInterval {
  readonly low: number;
  readonly high: number;
}

export interface Gate3Family {
  readonly name: string;
  readonly primary: boolean;
}

export interface Gate3Thresholds {
  readonly gainVsBestFixedMedianLowerCiPct: number;
  readonly gainVsHeuristicMedianLowerCiPct: number;
  readonly minWinRateVsBestFixed: number;
  readonly minWinRateVsHeuristic: number;
}

export interface Gate3Config {
  readonly seed: number;
  readonly sampleCountPerFamily: number;
  readonly chunkSize: number;
  readonly payloadScale: number;
  readonly bootstrapResamples: number;
  readonly roundtripSpotChecks: number;
  readonly families: readonly Gate3Family[];
  readonly thresholds: Gate3Thresholds;
}

type SegmentKind =
  | 'text'
  | 'json'
  | 'numeric'
  | 'dictionary'
  | 'binary'
  | 'image'
  | 'wasm';

interface Segment {
  readonly kind: SegmentKind;
  readonly data: Uint8Array;
}

interface Sample {
  readonly id: string;
  readonly family: string;
  readonly data: Uint8Array;
  readonly segments: readonly Segment[];
  readonly kindBytes: Record<SegmentKind, number>;
}

interface SampleOutcome {
  readonly gainVsBestFixedPct: number;
  readonly gainVsHeuristicPct: number;
  readonly winVsBestFixed: boolean;
  readonly winVsHeuristic: boolean;
  readonly codecsUsed: number;
  readonly topologicalSize: number;
  readonly bestFixedSize: number;
  readonly heuristicSize: number;
}

export interface Gate3CellResult {
  readonly cellId: string;
  readonly primary: boolean;
  readonly sampleCount: number;
  readonly medianGainVsBestFixedPct: number;
  readonly medianGainVsBestFixedPctCi: BootstrapInterval;
  readonly medianGainVsHeuristicPct: number;
  readonly medianGainVsHeuristicPctCi: BootstrapInterval;
  readonly winRateVsBestFixed: number;
  readonly winRateVsHeuristic: number;
  readonly medianCodecsUsed: number;
  readonly pass: boolean;
  readonly failedCriteria: readonly string[];
}

export interface Gate3Report {
  readonly protocol: {
    readonly id: string;
    readonly corpusRule: string;
    readonly scoringRules: readonly string[];
  };
  readonly config: Gate3Config;
  readonly corpus: {
    readonly sampleCount: number;
    readonly totalBytes: number;
    readonly medianBytes: number;
    readonly p95Bytes: number;
  };
  readonly cells: readonly Gate3CellResult[];
  readonly gate: {
    readonly pass: boolean;
    readonly primaryCells: readonly string[];
    readonly passedPrimaryCells: readonly string[];
    readonly failedPrimaryCells: readonly string[];
  };
}

interface CodecLike {
  readonly id: number;
  readonly name: string;
  encode(data: Uint8Array): Uint8Array;
}

const CHUNK_HEADER_BYTES = 9;

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

function bootstrapMedianCi(values: readonly number[], seed: number, resamples: number): BootstrapInterval {
  if (values.length === 0) {
    return { low: Number.NaN, high: Number.NaN };
  }

  const rng = new Lcg(seed);
  const sample = new Array<number>(values.length);
  const estimates = new Array<number>(resamples);

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

function repeatPatternToSize(pattern: string, targetBytes: number): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(pattern);
  const output = new Uint8Array(targetBytes);
  let offset = 0;
  while (offset < targetBytes) {
    const length = Math.min(encoded.length, targetBytes - offset);
    output.set(encoded.subarray(0, length), offset);
    offset += length;
  }
  return output;
}

function makeTextSegment(size: number, rng: Lcg): Uint8Array {
  const variants = [
    'function renderCard(user){return `<div class="card">${user.name}</div>`;}\n',
    'const route = "/api/v1/feeds/latest"; export default route;\n',
    'display:flex;align-items:center;justify-content:space-between;\n',
    'SELECT id,name,updated_at FROM feed_items WHERE tenant_id=? ORDER BY updated_at DESC;\n',
  ];
  return repeatPatternToSize(variants[uniformInt(rng, 0, variants.length - 1)], size);
}

function makeJsonSegment(size: number, rng: Lcg): Uint8Array {
  const payload = `{"id":${uniformInt(rng, 1, 99999)},"tenant":"acme","status":"active","tags":["prod","edge"],"latency_ms":${uniformInt(rng, 1, 1000)}}\n`;
  return repeatPatternToSize(payload, size);
}

function makeNumericSegment(size: number, rng: Lcg): Uint8Array {
  const output = new Uint8Array(size);
  let value = uniformInt(rng, 0, 255);
  for (let i = 0; i < size; i++) {
    value = (value + uniformInt(rng, 0, 3)) & 0xff;
    output[i] = value;
  }
  return output;
}

function makeDictionarySegment(size: number, rng: Lcg): Uint8Array {
  const patterns = [
    'className=container grid gap-4 rounded-md px-4 py-2 text-sm',
    'authorization bearer token refresh session cookie csrf',
    'content-security-policy x-frame-options strict-transport-security',
    'translate moderation presence typing indicator websocket reconnect',
  ];
  return repeatPatternToSize(patterns[uniformInt(rng, 0, patterns.length - 1)], size);
}

function makeBinaryNoiseSegment(size: number, rng: Lcg): Uint8Array {
  const output = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    output[i] = uniformInt(rng, 0, 255);
  }
  return output;
}

function makeImageLikeSegment(size: number, rng: Lcg): Uint8Array {
  const output = new Uint8Array(size);
  let x = uniformInt(rng, 0, 0xffffffff) >>> 0;
  for (let i = 0; i < size; i++) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0;
    output[i] = i % 64 === 0 ? 0xff : (x >>> 24) & 0xff;
  }
  return output;
}

function makeWasmLikeSegment(size: number, rng: Lcg): Uint8Array {
  const output = new Uint8Array(size);
  const opcodes = [0x20, 0x21, 0x22, 0x28, 0x36, 0x41, 0x6a, 0x10];
  for (let i = 0; i < size; i++) {
    output[i] = i % 9 === 0 ? opcodes[uniformInt(rng, 0, opcodes.length - 1)] : uniformInt(rng, 0, 255);
  }
  return output;
}

function concatSegments(segments: readonly Segment[]): Uint8Array {
  const total = segments.reduce((sum, segment) => sum + segment.data.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const segment of segments) {
    output.set(segment.data, offset);
    offset += segment.data.length;
  }
  return output;
}

function makeSegment(
  rng: Lcg,
  kind: SegmentKind,
  lowBytes: number,
  highBytes: number,
  payloadScale: number,
): Segment {
  const size = Math.max(256, Math.round(uniformInt(rng, lowBytes, highBytes) * payloadScale));
  if (kind === 'text') return { kind, data: makeTextSegment(size, rng) };
  if (kind === 'json') return { kind, data: makeJsonSegment(size, rng) };
  if (kind === 'numeric') return { kind, data: makeNumericSegment(size, rng) };
  if (kind === 'dictionary') return { kind, data: makeDictionarySegment(size, rng) };
  if (kind === 'binary') return { kind, data: makeBinaryNoiseSegment(size, rng) };
  if (kind === 'image') return { kind, data: makeImageLikeSegment(size, rng) };
  return { kind, data: makeWasmLikeSegment(size, rng) };
}

function appendMany(target: Segment[], source: readonly Segment[]): void {
  for (const segment of source) {
    target.push(segment);
  }
}

function buildFamilySample(family: string, sampleIndex: number, seed: number, payloadScale: number): Sample {
  const rng = new Lcg(seed);
  const segments: Segment[] = [];

  if (family === 'web-mixed') {
    for (let i = 0; i < uniformInt(rng, 6, 12); i++) {
      appendMany(segments, [
        makeSegment(rng, 'text', 1500, 14000, payloadScale),
        makeSegment(rng, 'json', 800, 9000, payloadScale),
      ]);
    }
    for (let i = 0; i < uniformInt(rng, 2, 5); i++) {
      segments.push(makeSegment(rng, rng.next() < 0.6 ? 'image' : 'binary', 5000, 46000, payloadScale));
    }
  } else if (family === 'api-telemetry') {
    for (let i = 0; i < uniformInt(rng, 8, 16); i++) {
      segments.push(makeSegment(rng, 'json', 700, 7000, payloadScale));
      segments.push(makeSegment(rng, 'numeric', 900, 6000, payloadScale));
    }
    for (let i = 0; i < uniformInt(rng, 1, 3); i++) {
      segments.push(makeSegment(rng, 'binary', 4000, 25000, payloadScale));
    }
  } else if (family === 'media-plus-metadata') {
    for (let i = 0; i < uniformInt(rng, 2, 4); i++) {
      segments.push(makeSegment(rng, 'image', 45000, 180000, payloadScale));
    }
    for (let i = 0; i < uniformInt(rng, 2, 6); i++) {
      segments.push(makeSegment(rng, 'json', 1200, 8000, payloadScale));
      segments.push(makeSegment(rng, 'text', 1500, 12000, payloadScale));
    }
    if (rng.next() < 0.5) {
      segments.push(makeSegment(rng, 'wasm', 12000, 65000, payloadScale));
    }
  } else if (family === 'polyglot-bundle') {
    for (let i = 0; i < uniformInt(rng, 4, 9); i++) {
      segments.push(makeSegment(rng, 'text', 1200, 12000, payloadScale));
      segments.push(makeSegment(rng, 'dictionary', 900, 10000, payloadScale));
      segments.push(makeSegment(rng, 'numeric', 800, 7000, payloadScale));
      segments.push(makeSegment(rng, 'binary', 4000, 26000, payloadScale));
    }
    if (rng.next() < 0.7) {
      segments.push(makeSegment(rng, 'image', 9000, 80000, payloadScale));
    }
    if (rng.next() < 0.5) {
      segments.push(makeSegment(rng, 'wasm', 8000, 50000, payloadScale));
    }
  } else {
    // text-homogeneous (non-primary stress)
    for (let i = 0; i < uniformInt(rng, 14, 28); i++) {
      segments.push(makeSegment(rng, rng.next() < 0.6 ? 'text' : 'dictionary', 1500, 18000, payloadScale));
    }
  }

  const data = concatSegments(segments);
  const kindBytes: Record<SegmentKind, number> = {
    text: 0,
    json: 0,
    numeric: 0,
    dictionary: 0,
    binary: 0,
    image: 0,
    wasm: 0,
  };
  for (const segment of segments) {
    kindBytes[segment.kind] += segment.data.length;
  }

  return {
    id: `${family}-${sampleIndex.toString().padStart(3, '0')}`,
    family,
    data,
    segments,
    kindBytes,
  };
}

function buildCorpus(config: Gate3Config): readonly Sample[] {
  const samples: Sample[] = [];
  for (const family of config.families) {
    for (let i = 0; i < config.sampleCountPerFamily; i++) {
      const sampleSeed = mixSeed(config.seed, i, family.name.length, family.primary ? 1 : 2);
      samples.push(buildFamilySample(family.name, i, sampleSeed, config.payloadScale));
    }
  }
  return samples;
}

function encodeSizeWithRawFallback(codec: CodecLike, data: Uint8Array): number {
  const encodedSize = codec.encode(data).length;
  return CHUNK_HEADER_BYTES + Math.min(data.length, encodedSize);
}

function selectHeuristicCodecId(sample: Sample): string {
  const total = sample.data.length;
  const textLike = sample.kindBytes.text + sample.kindBytes.json + sample.kindBytes.dictionary;
  const numericLike = sample.kindBytes.numeric + sample.kindBytes.wasm;
  const binaryLike = sample.kindBytes.binary + sample.kindBytes.image;
  const textRatio = textLike / total;
  const numericRatio = numericLike / total;
  const binaryRatio = binaryLike / total;

  if (textRatio >= 0.65) return 'brotli';
  if (textRatio >= 0.45) return 'gzip';
  if (numericRatio >= 0.45) return 'delta';
  if (binaryRatio >= 0.7) return 'raw';
  return 'dictionary';
}

function evaluateSamples(config: Gate3Config): readonly (Sample & { readonly outcome: SampleOutcome })[] {
  const topological = new TopologicalCompressor({
    chunkSize: config.chunkSize,
    codecs: BUILTIN_CODECS,
    streamRace: true,
  });

  const raw = new RawCodec();
  const fixedCodecs: Record<string, CodecLike> = {
    brotli: new BrotliCodec(),
    gzip: new GzipCodec(),
    dictionary: new DictionaryCodec(),
    lz77: new LZ77Codec(),
    huffman: new HuffmanCodec(),
    delta: new DeltaCodec(),
    raw,
  };

  const corpus = buildCorpus(config);
  const outcomes: Array<Sample & { readonly outcome: SampleOutcome }> = [];
  let roundtripChecks = 0;

  for (const sample of corpus) {
    const topologicalResult = topological.compress(sample.data);
    const topologicalSize = topologicalResult.compressedSize;

    if (roundtripChecks < config.roundtripSpotChecks) {
      const restored = topological.decompress(topologicalResult.data);
      if (restored.length !== sample.data.length) {
        throw new Error(`Gate 3 roundtrip length mismatch for ${sample.id}`);
      }
      for (let i = 0; i < restored.length; i++) {
        if (restored[i] !== sample.data[i]) {
          throw new Error(`Gate 3 roundtrip content mismatch for ${sample.id} at byte ${i}`);
        }
      }
      roundtripChecks += 1;
    }

    const fixedSizes = {
      brotli: encodeSizeWithRawFallback(fixedCodecs.brotli, sample.data),
      gzip: encodeSizeWithRawFallback(fixedCodecs.gzip, sample.data),
      dictionary: encodeSizeWithRawFallback(fixedCodecs.dictionary, sample.data),
      lz77: encodeSizeWithRawFallback(fixedCodecs.lz77, sample.data),
      huffman: encodeSizeWithRawFallback(fixedCodecs.huffman, sample.data),
      delta: encodeSizeWithRawFallback(fixedCodecs.delta, sample.data),
      raw: CHUNK_HEADER_BYTES + sample.data.length,
    } as const;

    const bestFixedSize = Math.min(
      fixedSizes.brotli,
      fixedSizes.gzip,
      fixedSizes.dictionary,
      fixedSizes.lz77,
      fixedSizes.huffman,
      fixedSizes.delta,
      fixedSizes.raw,
    );

    const heuristicCodecId = selectHeuristicCodecId(sample);
    const heuristicSize = fixedSizes[heuristicCodecId as keyof typeof fixedSizes];

    const gainVsBestFixedPct = ((bestFixedSize - topologicalSize) / bestFixedSize) * 100;
    const gainVsHeuristicPct = ((heuristicSize - topologicalSize) / heuristicSize) * 100;

    outcomes.push({
      ...sample,
      outcome: {
        gainVsBestFixedPct,
        gainVsHeuristicPct,
        winVsBestFixed: gainVsBestFixedPct > 0,
        winVsHeuristic: gainVsHeuristicPct > 0,
        codecsUsed: topologicalResult.codecsUsed,
        topologicalSize,
        bestFixedSize,
        heuristicSize,
      },
    });
  }

  return outcomes;
}

function evaluateCell(
  family: Gate3Family,
  samples: readonly (Sample & { readonly outcome: SampleOutcome })[],
  config: Gate3Config,
  familyIndex: number,
): Gate3CellResult {
  const gainsVsBestFixed = samples.map((sample) => sample.outcome.gainVsBestFixedPct);
  const gainsVsHeuristic = samples.map((sample) => sample.outcome.gainVsHeuristicPct);
  const codecsUsed = samples.map((sample) => sample.outcome.codecsUsed);

  const medianGainVsBestFixedPct = quantile(gainsVsBestFixed, 0.5);
  const medianGainVsHeuristicPct = quantile(gainsVsHeuristic, 0.5);
  const medianGainVsBestFixedPctCi = bootstrapMedianCi(
    gainsVsBestFixed,
    mixSeed(config.seed, familyIndex, 701),
    config.bootstrapResamples,
  );
  const medianGainVsHeuristicPctCi = bootstrapMedianCi(
    gainsVsHeuristic,
    mixSeed(config.seed, familyIndex, 709),
    config.bootstrapResamples,
  );

  const winRateVsBestFixed = gainsVsBestFixed.filter((value) => value > 0).length / gainsVsBestFixed.length;
  const winRateVsHeuristic = gainsVsHeuristic.filter((value) => value > 0).length / gainsVsHeuristic.length;
  const medianCodecsUsed = quantile(codecsUsed, 0.5);

  const failedCriteria: string[] = [];
  if (medianGainVsBestFixedPctCi.low <= config.thresholds.gainVsBestFixedMedianLowerCiPct) {
    failedCriteria.push('gain_vs_best_fixed_ci_low');
  }
  if (medianGainVsHeuristicPctCi.low <= config.thresholds.gainVsHeuristicMedianLowerCiPct) {
    failedCriteria.push('gain_vs_heuristic_ci_low');
  }
  if (winRateVsBestFixed < config.thresholds.minWinRateVsBestFixed) {
    failedCriteria.push('win_rate_vs_best_fixed');
  }
  if (winRateVsHeuristic < config.thresholds.minWinRateVsHeuristic) {
    failedCriteria.push('win_rate_vs_heuristic');
  }
  return {
    cellId: family.name,
    primary: family.primary,
    sampleCount: samples.length,
    medianGainVsBestFixedPct,
    medianGainVsBestFixedPctCi,
    medianGainVsHeuristicPct,
    medianGainVsHeuristicPctCi,
    winRateVsBestFixed,
    winRateVsHeuristic,
    medianCodecsUsed,
    pass: failedCriteria.length === 0,
    failedCriteria,
  };
}

function summarizeCorpus(samples: readonly Sample[]): Gate3Report['corpus'] {
  const sizes = samples.map((sample) => sample.data.length);
  return {
    sampleCount: samples.length,
    totalBytes: sizes.reduce((sum, size) => sum + size, 0),
    medianBytes: quantile(sizes, 0.5),
    p95Bytes: quantile(sizes, 0.95),
  };
}

export function makeDefaultGate3Config(): Gate3Config {
  return {
    seed: 0x00ae0301,
    sampleCountPerFamily: 18,
    chunkSize: 4096,
    payloadScale: 1,
    bootstrapResamples: 2000,
    roundtripSpotChecks: 8,
    families: [
      { name: 'web-mixed', primary: true },
      { name: 'api-telemetry', primary: true },
      { name: 'media-plus-metadata', primary: true },
      { name: 'polyglot-bundle', primary: true },
      { name: 'text-homogeneous', primary: false },
    ],
    thresholds: {
      gainVsBestFixedMedianLowerCiPct: 0,
      gainVsHeuristicMedianLowerCiPct: 0,
      minWinRateVsBestFixed: 0.65,
      minWinRateVsHeuristic: 0.7,
    },
  };
}

export function runGate3Corpus(config: Gate3Config): Gate3Report {
  const sampleOutcomes = evaluateSamples(config);
  const cells = config.families.map((family, index) => {
    const familySamples = sampleOutcomes.filter((sample) => sample.family === family.name);
    return evaluateCell(family, familySamples, config, index);
  });

  const primaryCells = cells.filter((cell) => cell.primary).map((cell) => cell.cellId);
  const passedPrimaryCells = cells.filter((cell) => cell.primary && cell.pass).map((cell) => cell.cellId);
  const failedPrimaryCells = cells.filter((cell) => cell.primary && !cell.pass).map((cell) => cell.cellId);

  return {
    protocol: {
      id: 'gate3-compression-corpus-v1',
      corpusRule:
        'Seeded heterogeneous compression corpus with mixed-content family profiles; each sample evaluated against fixed-codec and heuristic baselines with the same byte payload.',
      scoringRules: [
        'Cell pass requires positive 95% bootstrap CI lower bounds for median gain vs best fixed codec and median gain vs heuristic baseline.',
        'Cell pass also requires minimum win rates vs best fixed and heuristic baselines.',
        'Gate pass requires all primary family cells to pass.',
      ],
    },
    config,
    corpus: summarizeCorpus(sampleOutcomes),
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

export function renderGate3Markdown(report: Gate3Report): string {
  const lines: string[] = [];
  lines.push('# Gate 3 Compression Corpus Matrix');
  lines.push('');
  lines.push('Heterogeneous compression corpus benchmark (topological per-chunk race vs fixed-codec and heuristic baselines) with bootstrap uncertainty intervals.');
  lines.push('');
  lines.push('## Corpus');
  lines.push('');
  lines.push(`- Protocol id: ${report.protocol.id}`);
  lines.push(`- Sample count: ${report.corpus.sampleCount}`);
  lines.push(`- Total bytes: ${report.corpus.totalBytes}`);
  lines.push(`- Median bytes/sample: ${report.corpus.medianBytes.toFixed(0)}`);
  lines.push(`- p95 bytes/sample: ${report.corpus.p95Bytes.toFixed(0)}`);
  lines.push('');
  lines.push('## Verdict');
  lines.push('');
  lines.push(`- Overall Gate 3: **${report.gate.pass ? 'PASS' : 'DENY'}**`);
  lines.push(`- Primary cells passed: ${report.gate.passedPrimaryCells.length}/${report.gate.primaryCells.length}`);
  lines.push('');
  lines.push('## Matrix Results');
  lines.push('');
  lines.push('| Cell | Primary | Samples | Median Gain vs Best Fixed % (95% CI) | Median Gain vs Heuristic % (95% CI) | Win Rates (best fixed/heuristic) | Median Codecs Used | Pass |');
  lines.push('|---|---|---:|---:|---:|---:|---:|---|');
  for (const cell of report.cells) {
    lines.push(
      `| ${cell.cellId} | ${cell.primary ? 'yes' : 'no'} | ${cell.sampleCount}` +
        ` | ${cell.medianGainVsBestFixedPct.toFixed(3)} (${cell.medianGainVsBestFixedPctCi.low.toFixed(3)} to ${cell.medianGainVsBestFixedPctCi.high.toFixed(3)})` +
        ` | ${cell.medianGainVsHeuristicPct.toFixed(3)} (${cell.medianGainVsHeuristicPctCi.low.toFixed(3)} to ${cell.medianGainVsHeuristicPctCi.high.toFixed(3)})` +
        ` | ${formatPercent(cell.winRateVsBestFixed)}/${formatPercent(cell.winRateVsHeuristic)}` +
        ` | ${cell.medianCodecsUsed.toFixed(2)}` +
        ` | ${cell.pass ? 'yes' : 'no'} |`,
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
