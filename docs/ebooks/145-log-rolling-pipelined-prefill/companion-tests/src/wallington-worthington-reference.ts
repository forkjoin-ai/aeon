export type RotationStage<T> = (chunk: readonly T[]) => readonly T[];

export interface WallingtonStep<T> {
  readonly tick: number;
  readonly stageIndex: number;
  readonly chunkIndex: number;
  readonly input: readonly T[];
  readonly output: readonly T[];
}

export interface WallingtonRun<T> {
  readonly chunkSize: number;
  readonly chunks: readonly (readonly T[])[];
  readonly totalTicks: number;
  readonly schedule: readonly (readonly WallingtonStep<T>[])[];
  readonly output: readonly T[];
}

export type CollapseFn<T> = (shardOutputs: readonly (readonly T[])[]) => readonly T[];

export interface WorthingtonRun<T> {
  readonly shardCount: number;
  readonly shardInputs: readonly (readonly T[])[];
  readonly shardRuns: readonly WallingtonRun<T>[];
  readonly collapsedOutput: readonly T[];
}

function assertPositive(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function inferChunkSize(itemCount: number, stageCount: number): number {
  assertPositive('stageCount', stageCount);
  return Math.max(1, Math.floor(itemCount / stageCount));
}

export function buildWallingtonChunks<T>(
  items: readonly T[],
  stageCount: number,
  chunkSize = inferChunkSize(items.length, stageCount),
): readonly (readonly T[])[] {
  assertPositive('stageCount', stageCount);
  assertPositive('chunkSize', chunkSize);

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export function wallingtonRotation<T>(
  items: readonly T[],
  stages: readonly RotationStage<T>[],
  chunkSize = inferChunkSize(items.length, stages.length),
): WallingtonRun<T> {
  assertPositive('stageCount', stages.length);
  assertPositive('chunkSize', chunkSize);

  const chunks = buildWallingtonChunks(items, stages.length, chunkSize);
  if (chunks.length === 0) {
    return {
      chunkSize,
      chunks,
      totalTicks: 0,
      schedule: [],
      output: [],
    };
  }

  const stageOutputs: (readonly T[])[][] = [];
  for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
    const outputsForStage = chunks.map((_, chunkIndex) => {
      const input =
        stageIndex === 0 ? chunks[chunkIndex] : stageOutputs[stageIndex - 1][chunkIndex];
      return stages[stageIndex](input);
    });
    stageOutputs.push(outputsForStage);
  }

  const totalTicks = chunks.length + stages.length - 1;
  const schedule = Array.from({ length: totalTicks }, (_, tick) => {
    const tickSteps: WallingtonStep<T>[] = [];
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      const chunkIndex = tick - stageIndex;
      if (chunkIndex < 0 || chunkIndex >= chunks.length) {
        continue;
      }
      const input =
        stageIndex === 0 ? chunks[chunkIndex] : stageOutputs[stageIndex - 1][chunkIndex];
      tickSteps.push({
        tick,
        stageIndex,
        chunkIndex,
        input,
        output: stageOutputs[stageIndex][chunkIndex],
      });
    }
    return tickSteps;
  });

  return {
    chunkSize,
    chunks,
    totalTicks,
    schedule,
    output: stageOutputs[stages.length - 1].flat(),
  };
}

export function formatWallingtonSchedule<T>(run: WallingtonRun<T>): string {
  if (run.schedule.length === 0) {
    return 'no work';
  }

  return run.schedule
    .map((tickSteps, tick) => {
      const summary =
        tickSteps.length === 0
          ? 'idle'
          : tickSteps
              .map((step) => `s${step.stageIndex}:c${step.chunkIndex}`)
              .join(' | ');
      return `t${tick}: ${summary}`;
    })
    .join('\n');
}

export function splitIntoWhipShards<T>(
  items: readonly T[],
  shardCount: number,
): readonly (readonly T[])[] {
  assertPositive('shardCount', shardCount);
  if (items.length === 0) {
    return [];
  }

  const shardSize = Math.ceil(items.length / shardCount);
  const shards: T[][] = [];
  for (let index = 0; index < items.length; index += shardSize) {
    shards.push(items.slice(index, index + shardSize));
  }
  return shards;
}

export function concatenateCollapse<T>(
  shardOutputs: readonly (readonly T[])[],
): readonly T[] {
  return shardOutputs.flat();
}

export function worthingtonWhip<T>(
  items: readonly T[],
  options: {
    readonly shardCount: number;
    readonly stages: readonly RotationStage<T>[];
    readonly collapse?: CollapseFn<T>;
    readonly chunkSize?: number;
  },
): WorthingtonRun<T> {
  assertPositive('shardCount', options.shardCount);
  assertPositive('stageCount', options.stages.length);

  const shardInputs = splitIntoWhipShards(items, options.shardCount);
  const shardRuns = shardInputs.map((shard) =>
    wallingtonRotation(
      shard,
      options.stages,
      options.chunkSize ?? inferChunkSize(shard.length, options.stages.length),
    ),
  );
  const collapse = options.collapse ?? concatenateCollapse<T>;

  return {
    shardCount: options.shardCount,
    shardInputs,
    shardRuns,
    collapsedOutput: collapse(shardRuns.map((run) => run.output)),
  };
}
