import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17Gate5BioEffectSizeFigureReport,
  renderCh17Gate5BioEffectSizeFigureMarkdown,
  renderCh17Gate5BioEffectSizeFigureSvg,
} from '../src/ch17-gate5-bio-effect-size-figure';
import type { Gate5Report } from '../src/gate5-bio-effect-size';

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
    '../artifacts/ch17-gate5-bio-effect-size-figure.json',
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate5-bio-effect-size-figure.md',
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate5-bio-effect-size-figure.svg',
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
  const gate5 = loadJson<Gate5Report>(resolve(artifactsDir, 'gate5-bio-effect-size.json'));
  const report = buildCh17Gate5BioEffectSizeFigureReport(gate5);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });
  mkdirSync(dirname(options.svgPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(options.markdownPath, renderCh17Gate5BioEffectSizeFigureMarkdown(report), 'utf8');
  writeFileSync(options.svgPath, renderCh17Gate5BioEffectSizeFigureSvg(report), 'utf8');

  process.stdout.write(`ch17-gate5-bio-effect-size-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(
    `- primary pairs: ${report.primaryPairsPassed}/${report.primaryPairCount}\n`,
  );
  process.stdout.write(
    `- minimum primary CI low: ${report.minPrimaryPairRatioCiLow.toFixed(3)}x (threshold ${report.pairThresholdRatio.toFixed(3)}x)\n`,
  );
  process.stdout.write(
    `- pooled effect: ${report.pooledRatio.toFixed(3)}x (${report.pooledRatioCi95.low.toFixed(3)}x to ${report.pooledRatioCi95.high.toFixed(3)}x)\n`,
  );

  if (
    options.assertSurface &&
    !(
      report.primaryPairsPassed === report.primaryPairCount &&
      report.criteriaPassed === report.criteriaTotal &&
      report.minPrimaryPairRatioCiLow > 5 &&
      report.pooledRatioCi95.low > 9
    )
  ) {
    process.exitCode = 1;
  }
}

main();
