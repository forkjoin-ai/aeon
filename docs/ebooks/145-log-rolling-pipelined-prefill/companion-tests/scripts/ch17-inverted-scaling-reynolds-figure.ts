import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17InvertedScalingReynoldsFigureReport,
  renderCh17InvertedScalingReynoldsFigureMarkdown,
  renderCh17InvertedScalingReynoldsFigureSvg,
} from '../src/ch17-inverted-scaling-reynolds-figure';

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
    '../artifacts/ch17-inverted-scaling-reynolds-figure.json',
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-inverted-scaling-reynolds-figure.md',
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-inverted-scaling-reynolds-figure.svg',
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

function main(): void {
  const options = parseCli(process.argv.slice(2));
  const report = buildCh17InvertedScalingReynoldsFigureReport();

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });
  mkdirSync(dirname(options.svgPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(
    options.markdownPath,
    renderCh17InvertedScalingReynoldsFigureMarkdown(report),
    'utf8',
  );
  writeFileSync(options.svgPath, renderCh17InvertedScalingReynoldsFigureSvg(report), 'utf8');

  const aeonFlow = report.scenarios.find((scenario) => scenario.id === 'aeon-flow-microfrontend');
  const http1 = report.scenarios.find((scenario) => scenario.id === 'http1-microfrontend');
  const maxScenarioSpeedup = Math.max(
    ...report.scenarios.flatMap((scenario) => (scenario.speedup === undefined ? [] : [scenario.speedup])),
  );

  process.stdout.write(`ch17-inverted-scaling-reynolds-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(`- stage families: ${report.stageFamilies.join(', ')}\n`);
  process.stdout.write(`- max scenario speedup: ${maxScenarioSpeedup.toFixed(3)}x\n`);
  process.stdout.write(
    `- transport Re shift: ${http1?.reynolds.toFixed(3)} -> ${aeonFlow?.reynolds.toFixed(3)}\n`,
  );

  if (
    options.assertSurface &&
    !(
      aeonFlow?.regime === 'transitional' &&
      http1?.regime === 'turbulent' &&
      maxScenarioSpeedup > 260 &&
      report.scenarios.filter((scenario) => scenario.speedup !== undefined).length === 4
    )
  ) {
    process.exitCode = 1;
  }
}

main();
