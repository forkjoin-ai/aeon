import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  makeDefaultGate2Config,
  renderGate2Markdown,
  runGate2Corpus,
  type Gate2Config,
} from '../src/gate2-protocol-corpus';

interface CliOptions {
  readonly assertGate: boolean;
  readonly seed: number | null;
  readonly corpusSize: number | null;
  readonly trialsPerSite: number | null;
  readonly bootstrapResamples: number | null;
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

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/gate2-protocol-corpus.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/gate2-protocol-corpus.md'
  );

  let assertGate = false;
  let seed: number | null = null;
  let corpusSize: number | null = null;
  let trialsPerSite: number | null = null;
  let bootstrapResamples: number | null = null;
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
    if (arg === '--corpus-size') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --corpus-size');
      }
      corpusSize = parseIntArg(next, '--corpus-size');
      continue;
    }
    if (arg === '--trials') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --trials');
      }
      trialsPerSite = parseIntArg(next, '--trials');
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
    corpusSize,
    trialsPerSite,
    bootstrapResamples,
    jsonPath,
    markdownPath,
  };
}

function applyOverrides(
  defaultConfig: Gate2Config,
  options: CliOptions
): Gate2Config {
  return {
    ...defaultConfig,
    seed: options.seed ?? defaultConfig.seed,
    corpusSize: options.corpusSize ?? defaultConfig.corpusSize,
    trialsPerSite: options.trialsPerSite ?? defaultConfig.trialsPerSite,
    bootstrapResamples:
      options.bootstrapResamples ?? defaultConfig.bootstrapResamples,
  };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const config = applyOverrides(makeDefaultGate2Config(), options);
  const report = runGate2Corpus(config);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(options.markdownPath, renderGate2Markdown(report), 'utf8');

  process.stdout.write(
    `gate2 verdict: ${report.gate.pass ? 'PASS' : 'DENY'}\n`
  );
  process.stdout.write(
    `primary cells: ${report.gate.passedPrimaryCells.length}/${report.gate.primaryCells.length}\n`
  );
  process.stdout.write(
    `corpus: ${report.corpus.siteCount} sites, ${report.corpus.totalResources} resources\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  for (const cell of report.cells) {
    process.stdout.write(
      `- ${cell.cellId}: ${cell.passed ? 'PASS' : 'DENY'} ` +
        `(framing median ${cell.framingMedianGainPct.toFixed(3)}%, ` +
        `completion median ${cell.completionMedianGainMs.toFixed(3)} ms, ` +
        `completion p95 ${cell.completionP95GainMs.toFixed(3)} ms)\n`
    );
  }

  if (options.assertGate && !report.gate.pass) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
