import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCh17CorrespondenceBoundaryFigureReport,
  type GnosisMiniMoeRoutingBenchmarkFigureInput,
  renderCh17CorrespondenceBoundaryFigureMarkdown,
  renderCh17CorrespondenceBoundaryFigureSvg,
  type GnosisFoldTrainingBenchmarkFigureInput,
  type QuantumRecombinationAblationFigureInput,
  type ToyAttentionFoldAblationFigureInput,
} from '../src/ch17-correspondence-boundary-figure';

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
    '../artifacts/ch17-correspondence-boundary-figure.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-correspondence-boundary-figure.md'
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-correspondence-boundary-figure.svg'
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

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactsDir = resolve(moduleDir, '../artifacts');
  const quantum = loadJson<QuantumRecombinationAblationFigureInput>(
    resolve(artifactsDir, 'quantum-recombination-ablation.json')
  );
  const toyAttention = loadJson<ToyAttentionFoldAblationFigureInput>(
    resolve(artifactsDir, 'toy-attention-fold-ablation.json')
  );
  const gnosisTraining = loadJson<GnosisFoldTrainingBenchmarkFigureInput>(
    resolve(artifactsDir, 'gnosis-fold-training-benchmark.json')
  );
  const gnosisMiniMoe = loadJson<GnosisMiniMoeRoutingBenchmarkFigureInput>(
    resolve(artifactsDir, 'gnosis-moe-routing-benchmark.json')
  );

  const report = buildCh17CorrespondenceBoundaryFigureReport(
    quantum,
    toyAttention,
    gnosisTraining,
    gnosisMiniMoe
  );

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
    renderCh17CorrespondenceBoundaryFigureMarkdown(report),
    'utf8'
  );
  writeFileSync(
    options.svgPath,
    renderCh17CorrespondenceBoundaryFigureSvg(report),
    'utf8'
  );

  process.stdout.write(
    `ch17-correspondence-boundary-figure: ${report.label}\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(
    `- learned ranking: linear=${report.gnosisTraining.evalMse.linear.toFixed(
      3
    )}, winner=${report.gnosisTraining.evalMse['winner-take-all'].toFixed(
      3
    )}, early=${report.gnosisTraining.evalMse['early-stop'].toFixed(3)}\n`
  );
  process.stdout.write(
    `- mini-moe ranking: linear=${report.gnosisMiniMoe.evalMse.linear.toFixed(
      3
    )}, winner=${report.gnosisMiniMoe.evalMse['winner-take-all'].toFixed(
      3
    )}, early=${report.gnosisMiniMoe.evalMse['early-stop'].toFixed(3)}\n`
  );

  if (
    options.assertSurface &&
    !(
      report.quantum.matrix.linear.kernelAgreement &&
      report.gnosisTraining.evalMse.linear <
        report.gnosisTraining.evalMse['winner-take-all'] &&
      report.gnosisTraining.evalMse['winner-take-all'] <
        report.gnosisTraining.evalMse['early-stop'] &&
      report.gnosisMiniMoe.evalMse.linear <
        report.gnosisMiniMoe.evalMse['winner-take-all'] &&
      report.gnosisMiniMoe.evalMse['winner-take-all'] <
        report.gnosisMiniMoe.evalMse['early-stop']
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
