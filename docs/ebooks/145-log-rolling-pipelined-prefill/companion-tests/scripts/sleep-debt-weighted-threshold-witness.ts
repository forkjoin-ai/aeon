import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildSleepDebtWeightedThresholdWitnessReport,
  renderSleepDebtWeightedThresholdWitnessMarkdown,
} from '../src/sleep-debt-weighted-threshold-witness';

interface CliOptions {
  readonly assertSurface: boolean;
  readonly jsonPath: string;
  readonly markdownPath: string;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/sleep-debt-weighted-threshold-witness.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/sleep-debt-weighted-threshold-witness.md'
  );

  let assertSurface = false;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--assert') {
      assertSurface = true;
      continue;
    }
    if (arg === '--json') {
      const next = argv[++index];
      if (!next) {
        throw new Error('Missing value for --json');
      }
      jsonPath = resolve(next);
      continue;
    }
    if (arg === '--markdown') {
      const next = argv[++index];
      if (!next) {
        throw new Error('Missing value for --markdown');
      }
      markdownPath = resolve(next);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return {
    assertSurface,
    jsonPath,
    markdownPath,
  };
}

function main(): void {
  const options = parseCli(process.argv.slice(2));
  const report = buildSleepDebtWeightedThresholdWitnessReport();

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(
    options.markdownPath,
    renderSleepDebtWeightedThresholdWitnessMarkdown(report),
    'utf8'
  );

  process.stdout.write(
    `sleep-debt-weighted-threshold-witness: ${report.label}\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(
    `- criticalBoundary=${report.parameters.criticalWakeHours.toFixed(
      1
    )}h, supercriticalLinear=${
      report.aggregate.supercriticalGrowsLinearly ? 'yes' : 'no'
    }\n`
  );

  if (
    options.assertSurface &&
    !(
      report.label === 'sleep-debt-weighted-threshold-witness-v1' &&
      report.aggregate.literatureBoundaryMatchesTwentyPointTwoHours &&
      report.aggregate.subcriticalStaysZero &&
      report.aggregate.criticalStaysZero &&
      report.aggregate.supercriticalGrowsLinearly
    )
  ) {
    process.exitCode = 1;
  }
}

main();
