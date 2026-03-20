import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  makeDefaultGate1Config,
  renderGate1Markdown,
  runGate1Matrix,
  type Gate1Config,
  type Gate1ExecutionOptions,
} from '../src/gate1-wallclock';

interface CliOptions {
  readonly assertGate: boolean;
  readonly trialsPerCell: number | null;
  readonly bootstrapResamples: number | null;
  readonly requestTimeoutMs: number | null;
  readonly label: string | null;
  readonly listenHost: string | null;
  readonly advertiseHost: string | null;
  readonly endpointPool: readonly string[] | null;
  readonly jsonPath: string;
  readonly markdownPath: string;
}

function parseIntArg(value: string, flag: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flag}: ${value}`);
  }
  return parsed;
}

function parseCli(argv: readonly string[]): CliOptions {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const defaultJsonPath = resolve(
    moduleDir,
    '../artifacts/gate1-wallclock-matrix.json'
  );
  const defaultMarkdownPath = resolve(
    moduleDir,
    '../artifacts/gate1-wallclock-matrix.md'
  );

  let assertGate = false;
  let trialsPerCell: number | null = null;
  let bootstrapResamples: number | null = null;
  let requestTimeoutMs: number | null = null;
  let label: string | null = null;
  let listenHost: string | null = null;
  let advertiseHost: string | null = null;
  let endpointPool: readonly string[] | null = null;
  let jsonPath = defaultJsonPath;
  let markdownPath = defaultMarkdownPath;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--assert') {
      assertGate = true;
      continue;
    }
    if (arg === '--trials') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --trials');
      }
      trialsPerCell = parseIntArg(next, '--trials');
      continue;
    }
    if (arg === '--resamples') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --resamples');
      }
      bootstrapResamples = parseIntArg(next, '--resamples');
      continue;
    }
    if (arg === '--request-timeout-ms') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --request-timeout-ms');
      }
      requestTimeoutMs = parseIntArg(next, '--request-timeout-ms');
      continue;
    }
    if (arg === '--json') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --json');
      }
      jsonPath = resolve(next);
      continue;
    }
    if (arg === '--label') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --label');
      }
      label = next;
      continue;
    }
    if (arg === '--listen-host') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --listen-host');
      }
      listenHost = next;
      continue;
    }
    if (arg === '--advertise-host') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --advertise-host');
      }
      advertiseHost = next;
      continue;
    }
    if (arg === '--endpoint-pool') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --endpoint-pool');
      }
      const parsed = next
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      if (parsed.length === 0) {
        throw new Error('Endpoint pool must contain at least one endpoint');
      }
      endpointPool = parsed;
      continue;
    }
    if (arg === '--markdown') {
      const next = argv[++i];
      if (!next) {
        throw new Error('Missing value for --markdown');
      }
      markdownPath = resolve(next);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return {
    assertGate,
    trialsPerCell,
    bootstrapResamples,
    requestTimeoutMs,
    label,
    listenHost,
    advertiseHost,
    endpointPool,
    jsonPath,
    markdownPath,
  };
}

function applyOverrides(
  defaultConfig: Gate1Config,
  options: CliOptions
): Gate1Config {
  return {
    ...defaultConfig,
    trialsPerCell: options.trialsPerCell ?? defaultConfig.trialsPerCell,
    bootstrapResamples:
      options.bootstrapResamples ?? defaultConfig.bootstrapResamples,
    requestTimeoutMs:
      options.requestTimeoutMs ?? defaultConfig.requestTimeoutMs,
  };
}

function buildExecutionOptions(options: CliOptions): Gate1ExecutionOptions {
  return {
    label: options.label ?? undefined,
    listenHost: options.listenHost ?? undefined,
    advertiseHost: options.advertiseHost ?? undefined,
    endpointPool: options.endpointPool ?? undefined,
  };
}

function formatCellLine(
  cellId: string,
  pass: boolean,
  speedup: number,
  low: number,
  high: number
): string {
  return `- ${cellId}: ${
    pass ? 'PASS' : 'DENY'
  } (median speedup ${speedup.toFixed(3)}x, 95% CI ${low.toFixed(
    3
  )}-${high.toFixed(3)})\n`;
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const config = applyOverrides(makeDefaultGate1Config(), options);
  const execution = buildExecutionOptions(options);
  const report = await runGate1Matrix(config, execution);

  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.markdownPath), { recursive: true });

  writeFileSync(
    options.jsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  writeFileSync(options.markdownPath, renderGate1Markdown(report), 'utf8');

  process.stdout.write(
    `gate1 verdict: ${report.gate.pass ? 'PASS' : 'DENY'}\n`
  );
  process.stdout.write(
    `primary cells: ${report.gate.passedPrimaryCells.length}/${report.gate.primaryCells.length}\n`
  );
  process.stdout.write(
    `execution: ${report.execution.label} (${report.execution.mode})\n`
  );
  process.stdout.write(`json: ${options.jsonPath}\n`);
  process.stdout.write(`markdown: ${options.markdownPath}\n`);
  for (const cell of report.cells) {
    process.stdout.write(
      formatCellLine(
        cell.cellId,
        cell.passed,
        cell.speedupMedian,
        cell.speedupMedianCi.low,
        cell.speedupMedianCi.high
      )
    );
  }

  if (options.assertGate && !report.gate.pass) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
