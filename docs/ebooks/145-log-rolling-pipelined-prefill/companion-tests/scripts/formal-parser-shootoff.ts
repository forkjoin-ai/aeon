import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { parseTlaModule, parseTlcConfig } from '@affectively/aeon-logic';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const formalDir = join(rootDir, 'formal');

const parserIterations = Number.parseInt(process.env.PARSER_ITERS ?? '1200', 10);
const javaSamples = Number.parseInt(process.env.JAVA_SAMPLES ?? '5', 10);

interface FormalPair {
  readonly baseName: string;
  readonly tlaSource: string;
  readonly cfgSource: string;
}

function nowMs(): number {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid] ?? 0;
  }
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function loadFormalPairs(): readonly FormalPair[] {
  const files = readdirSync(formalDir).filter((entry) => !entry.startsWith('.'));
  const cfgBases = files
    .filter((entry) => extname(entry) === '.cfg')
    .map((entry) => basename(entry, '.cfg'))
    .sort();

  const pairs: FormalPair[] = [];
  for (const baseName of cfgBases) {
    const tlaPath = join(formalDir, `${baseName}.tla`);
    const cfgPath = join(formalDir, `${baseName}.cfg`);
    if (!existsSync(tlaPath)) {
      continue;
    }
    pairs.push({
      baseName,
      tlaSource: readFileSync(tlaPath, 'utf8'),
      cfgSource: readFileSync(cfgPath, 'utf8'),
    });
  }
  return pairs;
}

function runAeonLogicParserBench(formalPairs: readonly FormalPair[]): {
  elapsedMs: number;
  artifactsParsed: number;
} {
  const start = nowMs();
  let artifactsParsed = 0;

  for (let iteration = 0; iteration < parserIterations; iteration += 1) {
    for (const pair of formalPairs) {
      parseTlaModule(pair.tlaSource);
      parseTlcConfig(pair.cfgSource);
      artifactsParsed += 2;
    }
  }

  const elapsedMs = nowMs() - start;
  return { elapsedMs, artifactsParsed };
}

function resolveJavaBinary(): string | null {
  if (process.env.JAVA_BIN && existsSync(process.env.JAVA_BIN)) {
    return process.env.JAVA_BIN;
  }

  const homebrewJava = '/opt/homebrew/opt/openjdk/bin/java';
  if (existsSync(homebrewJava)) {
    return homebrewJava;
  }

  const whichJava = spawnSync('sh', ['-lc', 'command -v java'], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  if (whichJava.status === 0) {
    const candidate = whichJava.stdout.trim();
    return candidate.length > 0 ? candidate : null;
  }
  return null;
}

function benchJavaSany(javaBin: string, tlaPath: string, jarPath: string): readonly number[] {
  const samples: number[] = [];
  for (let i = 0; i < javaSamples; i += 1) {
    const start = nowMs();
    const result = spawnSync(
      javaBin,
      ['-cp', jarPath, 'tla2sany.SANY', tlaPath],
      { cwd: formalDir, encoding: 'utf8' },
    );
    const elapsed = nowMs() - start;
    if (result.status !== 0) {
      return [];
    }
    samples.push(elapsed);
  }
  return samples;
}

function main(): void {
  const formalPairs = loadFormalPairs();
  if (formalPairs.length === 0) {
    throw new Error('No formal .tla/.cfg pairs found for shootoff');
  }

  const parserBench = runAeonLogicParserBench(formalPairs);
  const parserPerSecond = (parserBench.artifactsParsed / parserBench.elapsedMs) * 1000;

  process.stdout.write('\n=== Formal Parser Shootoff ===\n');
  process.stdout.write(
    `aeon-logic parser: ${parserBench.artifactsParsed} artifacts in ${parserBench.elapsedMs.toFixed(2)} ms (${parserPerSecond.toFixed(1)} artifacts/sec)\n`,
  );
  process.stdout.write(
    `(workload: ${formalPairs.length} module pairs × ${parserIterations} iterations)\n`,
  );

  const javaBin = resolveJavaBinary();
  const jarPath = join(formalDir, '.tools', 'tla2tools.jar');
  const baselineTla = join(formalDir, `${formalPairs[0]?.baseName ?? 'ForkRaceFoldC1C4'}.tla`);

  if (!javaBin || !existsSync(jarPath) || !existsSync(baselineTla)) {
    process.stdout.write(
      'java baseline: skipped (java and/or tla2tools.jar not found; run `bun run test:formal` first)\n',
    );
    return;
  }

  const javaSamplesMs = benchJavaSany(javaBin, baselineTla, jarPath);
  if (javaSamplesMs.length === 0) {
    process.stdout.write('java baseline: skipped (unable to run tla2sany.SANY)\n');
    return;
  }

  const javaMedianMs = median(javaSamplesMs);
  process.stdout.write(
    `java SANY parse median: ${javaMedianMs.toFixed(2)} ms for ${basename(baselineTla)} (${javaSamples} samples)\n`,
  );
  process.stdout.write(
    'note: this is a startup+parse baseline and not a semantic-equivalence benchmark\n',
  );
}

main();
