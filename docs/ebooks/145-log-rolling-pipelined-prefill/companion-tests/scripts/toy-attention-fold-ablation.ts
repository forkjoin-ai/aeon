import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  renderToyAttentionFoldAblationMarkdown,
  runToyAttentionFoldAblation,
} from '../src/toy-attention-fold-ablation';

interface CliOptions {
  readonly assertRanking: boolean;
  readonly jsonPath: string;
  readonly markdownPath: string;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/toy-attention-fold-ablation.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/toy-attention-fold-ablation.md'
  );

  let assertRanking = false;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--assert') {
      assertRanking = true;
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
    assertRanking,
    jsonPath,
    markdownPath,
  };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const report = runToyAttentionFoldAblation();

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(
    options.markdownPath,
    renderToyAttentionFoldAblationMarkdown(report),
    'utf8'
  );

  process.stdout.write(
    `toy-attention-fold-ablation: ${
      report.predictedRankingMatches ? 'MATCH' : 'MISMATCH'
    }\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);

  for (const strategyName of report.rankingByMeanSquaredError) {
    const metrics = report.strategies[strategyName];
    process.stdout.write(
      `- ${strategyName}: mse=${metrics.meanSquaredError.toFixed(
        3
      )}, max-abs=${metrics.maxAbsoluteError.toFixed(
        3
      )}, exact=${metrics.exactWithinToleranceFraction.toFixed(3)}\n`
    );
  }

  if (options.assertRanking && !report.predictedRankingMatches) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
