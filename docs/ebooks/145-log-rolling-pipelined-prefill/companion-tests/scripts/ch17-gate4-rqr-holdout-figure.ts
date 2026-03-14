import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17Gate4RqrHoldoutFigureReport,
  renderCh17Gate4RqrHoldoutFigureMarkdown,
  renderCh17Gate4RqrHoldoutFigureSvg,
} from '../src/ch17-gate4-rqr-holdout-figure';
import type { Gate4Report } from '../src/gate4-rqr-holdout';

interface CliOptions {
  readonly assertSurface: boolean;
  readonly jsonPath: string;
  readonly markdownPath: string;
  readonly svgPath: string;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(moduleDir, '../artifacts/ch17-gate4-rqr-holdout-figure.json');
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate4-rqr-holdout-figure.md',
  );
  const defaultSvgPath = resolve(moduleDir, '../artifacts/ch17-gate4-rqr-holdout-figure.svg');

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
  const gate4 = loadJson<Gate4Report>(resolve(artifactsDir, 'gate4-rqr-holdout.json'));
  const report = buildCh17Gate4RqrHoldoutFigureReport(gate4);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });
  mkdirSync(dirname(options.svgPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(options.markdownPath, renderCh17Gate4RqrHoldoutFigureMarkdown(report), 'utf8');
  writeFileSync(options.svgPath, renderCh17Gate4RqrHoldoutFigureSvg(report), 'utf8');

  process.stdout.write(`ch17-gate4-rqr-holdout-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(`- criteria: ${report.criteriaPassed}/${report.criteriaTotal}\n`);
  process.stdout.write(
    `- quartile delta: ${report.quartileDelta.value.toFixed(3)} (${report.quartileDelta.ci95.low.toFixed(3)} to ${report.quartileDelta.ci95.high.toFixed(3)})\n`,
  );
  process.stdout.write(
    `- monotonicity: ${report.monotonicViolations}/${report.maxMonotonicViolations} allowed violations\n`,
  );

  if (
    options.assertSurface &&
    !(
      report.criteriaPassed === report.criteriaTotal &&
      report.decileCount === 10 &&
      report.quartileDelta.ci95.low > 0.1 &&
      report.monotonicViolations <= report.maxMonotonicViolations
    )
  ) {
    process.exitCode = 1;
  }
}

main();
