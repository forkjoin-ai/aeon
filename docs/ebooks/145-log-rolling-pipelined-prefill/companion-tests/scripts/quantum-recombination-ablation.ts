import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  renderQuantumRecombinationAblationMarkdown,
  runQuantumRecombinationAblation,
} from '../src/quantum-recombination-ablation';

interface CliOptions {
  readonly assertMatrix: boolean;
  readonly tolerance: number | null;
  readonly jsonPath: string;
  readonly markdownPath: string;
}

function parsePositiveNumberArg(value: string, flag: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flag}: ${value}`);
  }
  return parsed;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/quantum-recombination-ablation.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/quantum-recombination-ablation.md'
  );

  let assertMatrix = false;
  let tolerance: number | null = null;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--assert') {
      assertMatrix = true;
      continue;
    }
    if (arg === '--tolerance') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --tolerance');
      }
      tolerance = parsePositiveNumberArg(next, '--tolerance');
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
    assertMatrix,
    tolerance,
    jsonPath,
    markdownPath,
  };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const report = runQuantumRecombinationAblation(
    options.tolerance ?? undefined
  );

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(
    options.markdownPath,
    renderQuantumRecombinationAblationMarkdown(report),
    'utf8'
  );

  process.stdout.write(
    `quantum-recombination-ablation: ${
      report.predictedLossMatrixMatches ? 'MATCH' : 'MISMATCH'
    }\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);

  for (const [strategyName, strategyReport] of Object.entries(
    report.strategies
  )) {
    process.stdout.write(
      `- ${strategyName}: kernel=${
        strategyReport.profile.preservesKernelAgreement ? 'yes' : 'no'
      }, partition=${
        strategyReport.profile.preservesPartitionAdditivity ? 'yes' : 'no'
      }, order=${
        strategyReport.profile.preservesOrderInvariance ? 'yes' : 'no'
      }, cancellation=${
        strategyReport.profile.preservesCancellation ? 'yes' : 'no'
      }\n`
    );
  }

  if (options.assertMatrix && !report.predictedLossMatrixMatches) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
