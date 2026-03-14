import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildSleepDebtBoundedWitnessReport,
  renderSleepDebtBoundedWitnessMarkdown,
} from '../src/sleep-debt-bounded-witness';

interface CliOptions {
  readonly assertSurface: boolean;
  readonly jsonPath: string;
  readonly markdownPath: string;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(moduleDir, '../artifacts/sleep-debt-bounded-witness.json');
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/sleep-debt-bounded-witness.md'
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
  const report = buildSleepDebtBoundedWitnessReport();

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(
    options.markdownPath,
    renderSleepDebtBoundedWitnessMarkdown(report),
    'utf8'
  );

  process.stdout.write(`sleep-debt-bounded-witness: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(
    `- partialDebt=${report.aggregate.partialRecoveryLeavesPositiveDebt ? 'yes' : 'no'}, chronicIntrusion=${report.aggregate.chronicTruncationEnablesIntrusion ? 'yes' : 'no'}\n`
  );

  if (
    options.assertSurface &&
    !(
      report.label === 'sleep-debt-bounded-witness-v1' &&
      report.aggregate.fullRecoveryRestoresBaseline &&
      report.aggregate.partialRecoveryLeavesPositiveDebt &&
      report.aggregate.chronicTruncationEnablesIntrusion
    )
  ) {
    process.exitCode = 1;
  }
}

main();
