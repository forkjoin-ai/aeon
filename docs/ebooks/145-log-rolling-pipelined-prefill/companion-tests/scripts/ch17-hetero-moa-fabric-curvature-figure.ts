import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17HeteroMoaFabricCurvatureFigureReport,
  renderCh17HeteroMoaFabricCurvatureFigureMarkdown,
  renderCh17HeteroMoaFabricCurvatureFigureSvg,
} from '../src/ch17-hetero-moa-fabric-curvature-figure';

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
    '../artifacts/ch17-hetero-moa-fabric-curvature-figure.json',
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-hetero-moa-fabric-curvature-figure.md',
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-hetero-moa-fabric-curvature-figure.svg',
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

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const report = buildCh17HeteroMoaFabricCurvatureFigureReport();

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });
  mkdirSync(dirname(options.svgPath), { recursive: true });

  writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(
    options.markdownPath,
    renderCh17HeteroMoaFabricCurvatureFigureMarkdown(report),
    'utf8',
  );
  writeFileSync(
    options.svgPath,
    renderCh17HeteroMoaFabricCurvatureFigureSvg(report),
    'utf8',
  );

  process.stdout.write(
    `ch17-hetero-moa-fabric-curvature-figure: ${report.label}\n`,
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(
    `- primitive: ${report.primitive}, lanes=${report.totalLanes}, pairs=${report.pairCount}, frame=${report.frameProtocol}\n`,
  );

  if (
    options.assertSurface &&
    !(
      report.primitive === 'HeteroMoAFabric' &&
      report.totalLanes === 5 &&
      report.pairCount === 5 &&
      report.mirroredKernelCount === 10 &&
      report.frameProtocol === 'aeon-10-byte-binary'
    )
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
