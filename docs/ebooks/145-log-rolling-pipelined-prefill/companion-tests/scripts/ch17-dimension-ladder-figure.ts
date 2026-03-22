import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertDimensionSceneSurface,
  buildEmbeddedAeonVizSceneFigureReport,
  getChapter17SceneSpec,
  renderEmbeddedAeonVizSceneFigureMarkdown,
  renderEmbeddedAeonVizSceneFigureSvg,
} from '../src/ch17-embedded-scene-figure';

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
    '../artifacts/ch17-dimension-ladder-figure.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-dimension-ladder-figure.md'
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-dimension-ladder-figure.svg'
  );

  let assertSurface = false;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;
  let svgPath = defaultSvgPath;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--assert') {
      assertSurface = true;
      continue;
    }
    if (arg === '--json') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --json');
      }
      jsonPath = resolve(next);
      index += 1;
      continue;
    }
    if (arg === '--markdown') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --markdown');
      }
      markdownPath = resolve(next);
      index += 1;
      continue;
    }
    if (arg === '--svg') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --svg');
      }
      svgPath = resolve(next);
      index += 1;
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

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const spec = getChapter17SceneSpec('dimension-ladder');
  const verifiedSpec = options.assertSurface
    ? assertDimensionSceneSurface(spec)
    : spec;
  const report = buildEmbeddedAeonVizSceneFigureReport(verifiedSpec);

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
    renderEmbeddedAeonVizSceneFigureMarkdown(report),
    'utf8'
  );
  writeFileSync(
    options.svgPath,
    renderEmbeddedAeonVizSceneFigureSvg(verifiedSpec),
    'utf8'
  );

  process.stdout.write(`scene: ${report.scene}\n`);
  process.stdout.write(`title: ${report.title}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
