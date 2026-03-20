import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17Gate1WallclockFigureReport,
  renderCh17Gate1WallclockFigureMarkdown,
  renderCh17Gate1WallclockFigureSvg,
} from '../src/ch17-gate1-wallclock-figure';
import type { Gate1Report } from '../src/gate1-wallclock';

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
    '../artifacts/ch17-gate1-wallclock-figure.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate1-wallclock-figure.md'
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-gate1-wallclock-figure.svg'
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
  const gate1 = loadJson<Gate1Report>(
    resolve(artifactsDir, 'gate1-wallclock-external-multihost.json')
  );
  const report = buildCh17Gate1WallclockFigureReport(gate1);

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
    renderCh17Gate1WallclockFigureMarkdown(report),
    'utf8'
  );
  writeFileSync(
    options.svgPath,
    renderCh17Gate1WallclockFigureSvg(report),
    'utf8'
  );

  process.stdout.write(`ch17-gate1-wallclock-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(
    `- primary cells: ${report.primaryPassed}/${report.primaryTotal}\n`
  );
  process.stdout.write(
    `- speedup range: ${report.speedupMedianRange.low.toFixed(
      3
    )}x to ${report.speedupMedianRange.high.toFixed(3)}x\n`
  );
  process.stdout.write(
    `- minimum CI lows: ${report.minSpeedupCiLow.toFixed(
      3
    )}x and ${report.minImprovementCiLowMs.toFixed(2)} ms\n`
  );

  if (
    options.assertSurface &&
    !(
      report.primaryPassed === report.primaryTotal &&
      report.distinctEndpointHostCount === 6 &&
      report.cells.length === 10 &&
      report.minSpeedupCiLow > 10 &&
      report.minImprovementCiLowMs > 3_500
    )
  ) {
    process.exitCode = 1;
  }
}

main();
