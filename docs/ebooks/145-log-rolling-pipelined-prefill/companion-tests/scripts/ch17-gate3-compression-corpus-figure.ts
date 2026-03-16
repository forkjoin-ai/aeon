import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17Gate3CompressionCorpusFigureReport,
  renderCh17Gate3CompressionCorpusFigureMarkdown,
  renderCh17Gate3CompressionCorpusFigureSvg,
} from '../src/ch17-gate3-compression-corpus-figure';
import type { Gate3Report } from '../src/gate3-compression-corpus';

interface CliOptions {
  readonly assertSurface: boolean;
  readonly jsonPath: string;
  readonly markdownPath: string;
  readonly svgPath: string;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate3-compression-corpus-figure.json',
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate3-compression-corpus-figure.md',
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate3-compression-corpus-figure.svg',
  );

  let assertSurface = false;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;
  let svgPath = defaultSvgPath;

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
    if (arg === '--svg') {
      const next = argv[++index];
      if (!next) {
        throw new Error('Missing value for --svg');
      }
      svgPath = resolve(next);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return {
    assertSurface,
    jsonPath,
    markdownPath,
    svgPath,
  };
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function main(): void {
  const options = parseCli(process.argv.slice(2));
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactsDir = resolve(moduleDir, '../artifacts');
  const gate3 = loadJson<Gate3Report>(resolve(artifactsDir, 'gate3-compression-corpus.json'));
  const report = buildCh17Gate3CompressionCorpusFigureReport(gate3);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });
  mkdirSync(dirname(options.svgPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(
    options.markdownPath,
    renderCh17Gate3CompressionCorpusFigureMarkdown(report),
    'utf8',
  );
  writeFileSync(options.svgPath, renderCh17Gate3CompressionCorpusFigureSvg(report), 'utf8');

  process.stdout.write(`ch17-gate3-compression-corpus-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(`- primary cells: ${report.primaryPassed}/${report.primaryTotal}\n`);
  process.stdout.write(
    `- gain ranges: ${report.bestFixedGainRangePct.low.toFixed(6)}% to ${report.bestFixedGainRangePct.high.toFixed(3)}% and ${report.heuristicGainRangePct.low.toFixed(3)}% to ${report.heuristicGainRangePct.high.toFixed(3)}%\n`,
  );
  process.stdout.write(
    `- minimum primary-cell CI lows: ${report.minPrimaryBestFixedCiLowPct.toFixed(6)}% and ${report.minPrimaryHeuristicCiLowPct.toFixed(3)}%\n`,
  );

  if (
    options.assertSurface &&
    !(
      report.primaryPassed === report.primaryTotal &&
      report.cells.length === 5 &&
      report.minPrimaryBestFixedCiLowPct > 0 &&
      report.minPrimaryHeuristicCiLowPct > 0.3
    )
  ) {
    process.exitCode = 1;
  }
}

main();
