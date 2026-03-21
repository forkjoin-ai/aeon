import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  makeDefaultGate5Config,
  renderGate5Markdown,
  runGate5BioEffectSize,
  type Gate5Config,
} from '../src/gate5-bio-effect-size';

interface CliOptions {
  readonly assertGate: boolean;
  readonly seed: number | null;
  readonly drawsPerPair: number | null;
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
    '../artifacts/gate5-bio-effect-size.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/gate5-bio-effect-size.md'
  );

  let assertGate = false;
  let seed: number | null = null;
  let drawsPerPair: number | null = null;
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
    if (arg === '--draws') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --draws');
      }
      drawsPerPair = parseIntArg(next, '--draws');
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
    drawsPerPair,
    bootstrapResamples,
    jsonPath,
    markdownPath,
  };
}

function applyOverrides(
  defaultConfig: Gate5Config,
  options: CliOptions
): Gate5Config {
  return {
    ...defaultConfig,
    seed: options.seed ?? defaultConfig.seed,
    drawsPerPair: options.drawsPerPair ?? defaultConfig.drawsPerPair,
    bootstrapResamples:
      options.bootstrapResamples ?? defaultConfig.bootstrapResamples,
  };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const config = applyOverrides(makeDefaultGate5Config(), options);
  const report = runGate5BioEffectSize(config);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(options.markdownPath, renderGate5Markdown(report), 'utf8');

  process.stdout.write(
    `gate5 verdict: ${report.gate.pass ? 'PASS' : 'DENY'}\n`
  );
  process.stdout.write(
    `criteria passed: ${report.gate.passedCriterionIds.length}/${report.gate.criteria.length}\n`
  );
  process.stdout.write(
    `pair count: ${report.aggregate.pairCount} (primary ${report.aggregate.primaryPairCount})\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);

  for (const criterion of report.gate.criteria) {
    const ci = criterion.ci95
      ? `, 95% CI ${criterion.ci95.low.toFixed(
          3
        )}-${criterion.ci95.high.toFixed(3)}`
      : '';
    process.stdout.write(
      `- ${criterion.id}: ${
        criterion.pass ? 'PASS' : 'DENY'
      } (observed ${criterion.observed.toFixed(3)}${ci}; threshold ${
        criterion.threshold
      })\n`
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
