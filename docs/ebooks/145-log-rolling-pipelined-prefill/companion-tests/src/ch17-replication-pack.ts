import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getCh17ManuscriptVariantFromEnv,
  resolveCh17ManuscriptPath,
} from './manuscript-variant.js';

export type ReplicationPackCategory =
  | 'artifact'
  | 'document'
  | 'formal'
  | 'script'
  | 'topology'
  | 'workflow';

export interface ReplicationPackEntry {
  readonly label: string;
  readonly category: ReplicationPackCategory;
  readonly path: string;
  readonly sizeBytes: number;
  readonly sha256: string;
}

export interface Ch17ReplicationPackReport {
  readonly label: 'ch17-replication-pack-v1';
  readonly rootCommand: string;
  readonly entries: readonly ReplicationPackEntry[];
  readonly entryCount: number;
  readonly artifactCount: number;
  readonly complete: boolean;
}

const repoRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../..'
);
const manuscriptVariant = getCh17ManuscriptVariantFromEnv();
const manuscriptPath = resolveCh17ManuscriptPath(manuscriptVariant);
const manuscriptPathFromRepoRoot = manuscriptPath
  .replace(`${repoRoot}/`, '')
  .replace(/\\/gu, '/');

const replicationPaths = [
  [
    'Manuscript draft',
    'document',
    manuscriptPathFromRepoRoot,
  ],
  [
    'Companion README',
    'document',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/README.md',
  ],
  ['Evidence workflow', 'workflow', '.github/workflows/ch17-evidence.yml'],
  [
    'Quantum ablation artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/quantum-recombination-ablation.json',
  ],
  [
    'Toy attention artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/toy-attention-fold-ablation.json',
  ],
  [
    'Gnosis fold artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-fold-training-benchmark.json',
  ],
  [
    'Gnosis negative-controls artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-negative-controls.json',
  ],
  [
    'Gnosis near-control artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-near-control-sweep.json',
  ],
  [
    'Gnosis regime-sweep artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-fold-boundary-regime-sweep.json',
  ],
  [
    'Gnosis adversarial-controls artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-adversarial-controls-benchmark.json',
  ],
  [
    'Gnosis mini-MoE artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-moe-routing-benchmark.json',
  ],
  [
    'Gnosis MoA evidence artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-moa-transformer-evidence-benchmark.json',
  ],
  [
    'Formal witness artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/formal-witness-catalog.json',
  ],
  [
    'Formal adaptive witness artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/formal-adaptive-witness-catalog.json',
  ],
  [
    'Adaptive supremum witness artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/adaptive-supremum-witness.json',
  ],
  [
    'Adaptive supremum family-sweep artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/adaptive-supremum-family-sweep.json',
  ],
  [
    'Sleep-debt witness artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/sleep-debt-bounded-witness.json',
  ],
  [
    'Sleep-debt schedule-threshold artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/sleep-debt-schedule-threshold-witness.json',
  ],
  [
    'Sleep-debt weighted-threshold artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/sleep-debt-weighted-threshold-witness.json',
  ],
  [
    'Gate 1 figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate1-wallclock-figure.svg',
  ],
  [
    'Gate 2 figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate2-protocol-corpus-figure.svg',
  ],
  [
    'Gate 3 figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate3-compression-corpus-figure.svg',
  ],
  [
    'Gate 4 figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate4-rqr-holdout-figure.svg',
  ],
  [
    'Gate 5 figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate5-bio-effect-size-figure.svg',
  ],
  [
    'Inverted-scaling figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-inverted-scaling-reynolds-figure.svg',
  ],
  [
    'Figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-correspondence-boundary-figure.svg',
  ],
  [
    'Expansion figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-boundary-expansion-figure.svg',
  ],
  [
    'MoA topology figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-moa-topology-figure.svg',
  ],
  [
    'MoA whip-curvature figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-moa-whip-curvature-figure.svg',
  ],
  [
    'Hetero MoA fabric curvature figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-hetero-moa-fabric-curvature-figure.svg',
  ],
  [
    'MoA figure artifact',
    'artifact',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-moa-transformer-figure.svg',
  ],
  [
    'Replication-pack script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-replication-pack.ts',
  ],
  [
    'Gate 1 figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate1-wallclock-figure.ts',
  ],
  [
    'Gate 2 figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate2-protocol-corpus-figure.ts',
  ],
  [
    'Gate 3 figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate3-compression-corpus-figure.ts',
  ],
  [
    'Gate 4 figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate4-rqr-holdout-figure.ts',
  ],
  [
    'Gate 5 figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate5-bio-effect-size-figure.ts',
  ],
  [
    'Inverted-scaling figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-inverted-scaling-reynolds-figure.ts',
  ],
  [
    'Negative-controls script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-negative-controls-benchmark.ts',
  ],
  [
    'Near-control script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-near-control-sweep-benchmark.ts',
  ],
  [
    'Regime-sweep script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-regime-sweep-benchmark.ts',
  ],
  [
    'Adversarial-controls script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-adversarial-controls-benchmark.ts',
  ],
  [
    'MoA evidence script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-moa-transformer-evidence-benchmark.ts',
  ],
  [
    'Formal witness script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/formal-witness-catalog.ts',
  ],
  [
    'Formal adaptive witness script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/formal-adaptive-witness-catalog.ts',
  ],
  [
    'Adaptive supremum witness script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/adaptive-supremum-witness.ts',
  ],
  [
    'Adaptive supremum family-sweep script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/adaptive-supremum-family-sweep.ts',
  ],
  [
    'Sleep-debt witness script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/sleep-debt-bounded-witness.ts',
  ],
  [
    'Sleep-debt schedule-threshold script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/sleep-debt-schedule-threshold-witness.ts',
  ],
  [
    'Sleep-debt weighted-threshold script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/sleep-debt-weighted-threshold-witness.ts',
  ],
  [
    'Expansion figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-boundary-expansion-figure.ts',
  ],
  [
    'MoA topology figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-moa-topology-figure.ts',
  ],
  [
    'MoA whip-curvature figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-moa-whip-curvature-figure.ts',
  ],
  [
    'Hetero MoA fabric curvature figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-hetero-moa-fabric-curvature-figure.ts',
  ],
  [
    'MoA figure script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-moa-transformer-figure.ts',
  ],
  [
    'External replication script',
    'script',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-external-replication.ts',
  ],
  [
    'Lean claims',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/Claims.lean',
  ],
  [
    'Lean witness catalog',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/Witnesses.lean',
  ],
  [
    'Lean adaptive witness catalog',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/AdaptiveWitnesses.lean',
  ],
  [
    'Theorem ledger',
    'formal',
    'open-source/gnosis/THEOREM_LEDGER.md',
  ],
  [
    'Gnosis theorem workspace',
    'formal',
    'open-source/gnosis/GnosisProofs.lean',
  ],
  [
    'Sleep-debt TLA+ model',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/SleepDebt.tla',
  ],
  [
    'Sleep-debt schedule-threshold TLA+ model',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/SleepDebtScheduleThreshold.tla',
  ],
  [
    'Sleep-debt weighted-threshold TLA+ model',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/SleepDebtWeightedThreshold.tla',
  ],
  [
    'Sleep-debt Lean theorem surface',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean',
  ],
  [
    'Sleep-debt schedule-threshold Lean theorem surface',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtSchedule.lean',
  ],
  [
    'Sleep-debt weighted-threshold Lean theorem surface',
    'formal',
    'open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtWeightedSchedule.lean',
  ],
  [
    'Affine benchmark topology suite',
    'topology',
    'open-source/gnosis/examples/benchmarks/fold-training.test.gg',
  ],
  [
    'Routed benchmark topology suite',
    'topology',
    'open-source/gnosis/examples/benchmarks/moe-routing.test.gg',
  ],
  [
    'MoA benchmark topology suite',
    'topology',
    'open-source/gnosis/examples/benchmarks/moa-transformer.test.gg',
  ],
  [
    'StructuredMoA sparse topology',
    'topology',
    'open-source/gnosis/examples/benchmarks/moa-transformer-moa.gg',
  ],
] as const satisfies readonly [string, ReplicationPackCategory, string][];

function hashFile(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function runCh17ReplicationPack(): Ch17ReplicationPackReport {
  const entries = replicationPaths.map(([label, category, relativePath]) => {
    const absolutePath = resolve(repoRoot, relativePath);
    const stats = statSync(absolutePath);
    return {
      label,
      category,
      path: relativePath,
      sizeBytes: stats.size,
      sha256: hashFile(absolutePath),
    } satisfies ReplicationPackEntry;
  });

  return {
    label: 'ch17-replication-pack-v1',
    rootCommand:
      'cd open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests && bun run test:ch17-external-replication',
    entries,
    entryCount: entries.length,
    artifactCount: entries.filter((entry) => entry.category === 'artifact')
      .length,
    complete: entries.every(
      (entry) => entry.sha256.length === 64 && entry.sizeBytes > 0
    ),
  };
}

export function renderCh17ReplicationPackMarkdown(
  report: Ch17ReplicationPackReport
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Replication Pack');
  lines.push('');
  lines.push('- Label: `' + report.label + '`');
  lines.push('- Root command: `' + report.rootCommand + '`');
  lines.push('- Entries: `' + String(report.entryCount) + '`');
  lines.push('- Artifact entries: `' + String(report.artifactCount) + '`');
  lines.push('- Complete: `' + (report.complete ? 'yes' : 'no') + '`');
  lines.push('');
  lines.push('| Label | Category | Path | Bytes | SHA-256 |');
  lines.push('| --- | --- | --- | ---: | --- |');
  for (const entry of report.entries) {
    lines.push(
      `| ${entry.label} | \`${entry.category}\` | \`${entry.path}\` | ${entry.sizeBytes} | \`${entry.sha256}\` |`
    );
  }
  lines.push('');
  lines.push(
    'Interpretation: this pack fingerprints the concrete files needed to reproduce the current Chapter 17 evidence surface, including the generated artifacts, the in-tree formal theorem package, the shared Gnosis theorem workspace, the benchmark topology suites, and the CI entrypoint.'
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}
