import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17WhipExhaustionFigureReport,
  renderCh17WhipExhaustionFigureMarkdown,
  renderCh17WhipExhaustionFigureSvg,
} from '../src/ch17-whip-exhaustion-figure';

interface CliOptions {
  readonly assertSurface: boolean;
  readonly jsonPath: string;
  readonly markdownPath: string;
  readonly svgPath: string;
  readonly heads: number;
  readonly ffnExpansion: number;
  readonly moeExperts: number;
  readonly moeTopK: number;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/ch17-whip-exhaustion-figure.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-whip-exhaustion-figure.md'
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-whip-exhaustion-figure.svg'
  );

  let assertSurface = false;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;
  let svgPath = defaultSvgPath;
  let heads = 16;
  let ffnExpansion = 4;
  let moeExperts = 0;
  let moeTopK = 0;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--assert') {
      assertSurface = true;
      continue;
    }
    if (arg === '--json') {
      const next = argv[++index];
      if (!next) throw new Error('Missing value for --json');
      jsonPath = resolve(next);
      continue;
    }
    if (arg === '--markdown') {
      const next = argv[++index];
      if (!next) throw new Error('Missing value for --markdown');
      markdownPath = resolve(next);
      continue;
    }
    if (arg === '--svg') {
      const next = argv[++index];
      if (!next) throw new Error('Missing value for --svg');
      svgPath = resolve(next);
      continue;
    }
    if (arg === '--heads') {
      heads = parseInt(argv[++index], 10);
      continue;
    }
    if (arg === '--ffn-expansion') {
      ffnExpansion = parseInt(argv[++index], 10);
      continue;
    }
    if (arg === '--moe-experts') {
      moeExperts = parseInt(argv[++index], 10);
      continue;
    }
    if (arg === '--moe-top-k') {
      moeTopK = parseInt(argv[++index], 10);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return {
    assertSurface,
    jsonPath,
    markdownPath,
    svgPath,
    heads,
    ffnExpansion,
    moeExperts,
    moeTopK,
  };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));

  const report = buildCh17WhipExhaustionFigureReport({
    heads: options.heads,
    ffnExpansion: options.ffnExpansion,
    moeExperts: options.moeExperts,
    moeTopK: options.moeTopK,
  });

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });
  mkdirSync(dirname(options.svgPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(
    options.markdownPath,
    renderCh17WhipExhaustionFigureMarkdown(report),
    'utf8'
  );
  writeFileSync(
    options.svgPath,
    renderCh17WhipExhaustionFigureSvg(report),
    'utf8'
  );

  process.stdout.write(`ch17-whip-exhaustion-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(
    `- heads=${report.config.heads}, ` +
      `${
        report.config.moeExperts > 0
          ? `moe=${report.config.moeExperts}`
          : `ffn=${report.config.ffnExpansion}x`
      }, ` +
      `total_beta1=${report.totalBeta1}, whips=${report.whipCount}\n`
  );

  if (
    options.assertSurface &&
    !(
      report.whipCount === 4 &&
      report.totalBeta1 === report.axes.reduce((s, a) => s + a.beta1, 0) &&
      report.axes.every((a) => a.beta1 >= 0)
    )
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
