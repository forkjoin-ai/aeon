import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildAmericanFrontierReport,
  renderAmericanFrontierMarkdown,
  renderAmericanFrontierSvg,
} from '../src/ch17-american-frontier-figure';

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
    '../artifacts/ch17-american-frontier-figure.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/ch17-american-frontier-figure.md'
  );
  const defaultSvgPath = resolve(
    moduleDir,
    '../artifacts/ch17-american-frontier-figure.svg'
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
  const report = buildAmericanFrontierReport();

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
    renderAmericanFrontierMarkdown(report),
    'utf8'
  );
  writeFileSync(options.svgPath, renderAmericanFrontierSvg(report), 'utf8');

  const firstTransport = report.transport.points[0];
  const lastTransport =
    report.transport.points[report.transport.points.length - 1];
  const firstWinShare =
    (firstTransport.aeonWins /
      (firstTransport.aeonWins + firstTransport.httpWins)) *
    100;
  const lastWinShare =
    (lastTransport.aeonWins /
      (lastTransport.aeonWins + lastTransport.httpWins)) *
    100;

  process.stdout.write(`ch17-american-frontier-figure: ${report.label}\n`);
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  process.stdout.write(`svg: ${options.svgPath}\n`);
  process.stdout.write(
    `- recursive wire frontier: ${firstWinShare.toFixed(
      2
    )}% -> ${lastWinShare.toFixed(
      2
    )}% Aeon share, ${firstTransport.wasteBytesPerWin.toFixed(
      2
    )} -> ${lastTransport.wasteBytesPerWin.toFixed(2)} waste bytes/win\n`
  );

  if (
    options.assertSurface &&
    !(
      report.protocol.points.length === 4 &&
      report.encoding.points.length === 5 &&
      report.transport.points.length >= 5 &&
      report.transport.heavyWitness.tcpDelay2msWasteBytesPerWin <
        report.transport.heavyWitness.zeroSkewWasteBytesPerWin &&
      report.transport.heavyWitness.tcpDelay2msAeonWinSharePct >
        report.transport.heavyWitness.zeroSkewAeonWinSharePct
    )
  ) {
    process.exitCode = 1;
  }
}

main();
