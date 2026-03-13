import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  makeDefaultGate3Config,
  renderGate3Markdown,
  runGate3Corpus,
  type Gate3Config,
} from '../src/gate3-compression-corpus';

interface CliOptions {
  readonly assertGate: boolean;
  readonly seed: number | null;
  readonly sampleCountPerFamily: number | null;
  readonly bootstrapResamples: number | null;
  readonly chunkSize: number | null;
  readonly payloadScale: number | null;
  readonly jsonPath: string;
  readonly markdownPath: string;
}

function parseIntArg(value: string, flag: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flag}: ${value}`);
  }
  return parsed;
}

function parseFloatArg(value: string, flag: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flag}: ${value}`);
  }
  return parsed;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(moduleDir, '../artifacts/gate3-compression-corpus.json');
  const defaultMarkdownPath = resolve(moduleDir, '../artifacts/gate3-compression-corpus.md');

  let assertGate = false;
  let seed: number | null = null;
  let sampleCountPerFamily: number | null = null;
  let bootstrapResamples: number | null = null;
  let chunkSize: number | null = null;
  let payloadScale: number | null = null;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--assert') {
      assertGate = true;
      continue;
    }
    if (arg === '--seed') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --seed');
      }
      seed = parseIntArg(next, '--seed');
      continue;
    }
    if (arg === '--samples') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --samples');
      }
      sampleCountPerFamily = parseIntArg(next, '--samples');
      continue;
    }
    if (arg === '--resamples') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --resamples');
      }
      bootstrapResamples = parseIntArg(next, '--resamples');
      continue;
    }
    if (arg === '--chunk-size') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --chunk-size');
      }
      chunkSize = parseIntArg(next, '--chunk-size');
      continue;
    }
    if (arg === '--payload-scale') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --payload-scale');
      }
      payloadScale = parseFloatArg(next, '--payload-scale');
      continue;
    }
    if (arg === '--json') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --json');
      }
      jsonPath = resolve(next);
      continue;
    }
    if (arg === '--markdown') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --markdown');
      }
      markdownPath = resolve(next);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return {
    assertGate,
    seed,
    sampleCountPerFamily,
    bootstrapResamples,
    chunkSize,
    payloadScale,
    jsonPath,
    markdownPath,
  };
}

function applyOverrides(defaultConfig: Gate3Config, options: CliOptions): Gate3Config {
  return {
    ...defaultConfig,
    seed: options.seed ?? defaultConfig.seed,
    sampleCountPerFamily: options.sampleCountPerFamily ?? defaultConfig.sampleCountPerFamily,
    bootstrapResamples: options.bootstrapResamples ?? defaultConfig.bootstrapResamples,
    chunkSize: options.chunkSize ?? defaultConfig.chunkSize,
    payloadScale: options.payloadScale ?? defaultConfig.payloadScale,
  };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const config = applyOverrides(makeDefaultGate3Config(), options);
  const report = runGate3Corpus(config);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(options.markdownPath, renderGate3Markdown(report), 'utf8');

  process.stdout.write(`gate3 verdict: ${report.gate.pass ? 'PASS' : 'DENY'}\n`);
  process.stdout.write(`primary cells: ${report.gate.passedPrimaryCells.length}/${report.gate.primaryCells.length}\n`);
  process.stdout.write(`corpus: ${report.corpus.sampleCount} samples, ${report.corpus.totalBytes} bytes\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  for (const cell of report.cells) {
    process.stdout.write(
      `- ${cell.cellId}: ${cell.pass ? 'PASS' : 'DENY'} ` +
        `(gain vs best fixed median ${cell.medianGainVsBestFixedPct.toFixed(3)}%, ` +
        `gain vs heuristic median ${cell.medianGainVsHeuristicPct.toFixed(3)}%, ` +
        `wins ${Math.round(cell.winRateVsBestFixed * 100)}%/${Math.round(cell.winRateVsHeuristic * 100)}%)\n`,
    );
  }

  if (options.assertGate && !report.gate.pass) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
