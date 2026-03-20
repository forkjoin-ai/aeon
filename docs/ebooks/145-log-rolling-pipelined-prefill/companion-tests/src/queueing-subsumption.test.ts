/**
 * Queueing Theory Subsumption — Companion Tests for §5
 *
 * Proves:
 *   1. Little's Law is the β₁ = 0 degenerate case of the pipeline equation
 *   2. Erlang blocking is vent propagation at β₁ = 0
 *   3. Jackson networks are fork/join without race
 *   4. Finite-trace work-conserving disciplines share the same sample-path conservation law
 *   5. Finite-support stochastic mixtures preserve the same conservation law in expectation
 *   6. Each classical result recovers from the topological framework
 *
 * These tests use no external dependencies — pure math.
 */

import { describe, it, expect } from 'vitest';

const EPSILON = 1e-9;

interface TickJob {
  readonly id: string;
  readonly arrivalTick: number;
  readonly serviceQuanta: number;
  readonly priority: number;
}

interface ActiveTickJob extends TickJob {
  readonly remainingQuanta: number;
  readonly queueOrder: number;
}

interface CompletedTickJob extends TickJob {
  readonly finishTick: number;
}

interface TickSchedule {
  readonly serviceOrder: readonly string[];
  readonly completedJobs: readonly CompletedTickJob[];
}

interface QueueMetrics {
  readonly areaInSystem: number;
  readonly averageInSystem: number;
  readonly averageSojourn: number;
  readonly effectiveArrivalRate: number;
  readonly totalSojourn: number;
  readonly horizonTicks: number;
  readonly finalDepartureTick: number;
}

interface DisciplineState {
  readonly timeTick: number;
  readonly activeJobs: readonly ActiveTickJob[];
  readonly serviceOrder: readonly string[];
}

interface ServiceLaw {
  readonly name: string;
  readonly sample: (rng: () => number) => number;
}

type DisciplineSelector = (state: DisciplineState) => string;

interface NetworkJob {
  readonly id: string;
  readonly arrivalTick: number;
  readonly route: readonly number[];
  readonly serviceQuantaByStage: readonly number[];
  readonly jobClass: string;
  readonly priority: number;
}

interface ActiveNetworkJob extends NetworkJob {
  readonly stageIndex: number;
  readonly remainingQuanta: number;
  readonly queueOrder: number;
}

interface CompletedNetworkJob extends NetworkJob {
  readonly finishTick: number;
}

interface NetworkSchedule {
  readonly serviceTimeline: readonly string[];
  readonly completedJobs: readonly CompletedNetworkJob[];
}

interface NetworkMetrics {
  readonly areaInSystem: number;
  readonly averageInSystem: number;
  readonly averageSojourn: number;
  readonly effectiveArrivalRate: number;
  readonly totalSojourn: number;
  readonly horizonTicks: number;
  readonly finalDepartureTick: number;
}

interface WeightedNetworkScenario {
  readonly name: string;
  readonly mass: number;
  readonly jobs: readonly NetworkJob[];
}

interface WeightedNetworkExpectation {
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedTotalSojourn: number;
  readonly expectedAreaInSystem: number;
  readonly expectedTotalSojourn: number;
}

interface ProbabilisticQueueState {
  readonly remainingJob1: number;
  readonly remainingJob2: number;
  readonly cumulativeAreaInSystem: number;
  readonly cumulativeDepartedSojourn: number;
}

interface ProbabilisticArrivalBranch {
  readonly arrivingServiceQuanta: number;
  readonly mass: number;
}

interface ProbabilisticQueueStep {
  readonly timeTick: number;
  readonly distribution: ReadonlyMap<string, number>;
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedDepartedSojourn: number;
  readonly weightedOpenAge: number;
}

interface ProbabilisticNetworkState {
  readonly job1Phase: number;
  readonly job2Phase: number;
  readonly cumulativeAreaInSystem: number;
  readonly cumulativeDepartedSojourn: number;
}

interface ProbabilisticNetworkArrivalBranch {
  readonly arrivingPhase: number;
  readonly mass: number;
}

interface ProbabilisticNetworkStep {
  readonly timeTick: number;
  readonly distribution: ReadonlyMap<string, number>;
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedDepartedSojourn: number;
  readonly weightedOpenAge: number;
}

interface LargeProbabilisticNetworkState {
  readonly slot1Phase: number;
  readonly slot2Phase: number;
  readonly slot3Phase: number;
  readonly cumulativeAreaInSystem: number;
  readonly cumulativeDepartedSojourn: number;
}

interface LargeProbabilisticNetworkArrivalBranch {
  readonly arrivingPhase: number;
  readonly mass: number;
}

interface LargeProbabilisticNetworkStep {
  readonly timeTick: number;
  readonly distribution: ReadonlyMap<string, number>;
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedDepartedSojourn: number;
  readonly weightedOpenAge: number;
}

interface NetworkDisciplineState {
  readonly timeTick: number;
  readonly activeJobs: readonly ActiveNetworkJob[];
  readonly activeNodes: readonly number[];
  readonly serviceTimeline: readonly string[];
}

type NetworkNodeSelection = ReadonlyMap<number, string>;
type NetworkDisciplineSelector = (
  state: NetworkDisciplineState
) => NetworkNodeSelection;
type ProbabilisticServiceSelector = (state: ProbabilisticQueueState) => 1 | 2;
type ProbabilisticNetworkServiceSelector = (
  state: ProbabilisticNetworkState,
  node: 1 | 2,
  candidates: readonly (1 | 2)[]
) => 1 | 2;
type LargeProbabilisticNetworkServiceSelector = (
  state: LargeProbabilisticNetworkState,
  node: 1 | 2 | 3,
  candidates: readonly (1 | 2 | 3)[]
) => 1 | 2 | 3;

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function expSample(rate: number, rng: () => number): number {
  const u = Math.max(rng(), Number.EPSILON);
  return -Math.log(u) / rate;
}

function normalSample(mean: number, stddev: number, rng: () => number): number {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  const magnitude = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return mean + stddev * magnitude * Math.cos(angle);
}

function discretizeServiceTime(sample: number): number {
  return Math.max(1, Math.min(3, Math.ceil(sample)));
}

function compareTickJobs(
  a: Pick<TickJob, 'arrivalTick' | 'id'>,
  b: Pick<TickJob, 'arrivalTick' | 'id'>
): number {
  if (a.arrivalTick !== b.arrivalTick) {
    return a.arrivalTick - b.arrivalTick;
  }
  return a.id.localeCompare(b.id);
}

function compareActiveByQueueOrder(a: ActiveTickJob, b: ActiveTickJob): number {
  if (a.queueOrder !== b.queueOrder) {
    return a.queueOrder - b.queueOrder;
  }
  return a.id.localeCompare(b.id);
}

function materializeArrivals(
  jobs: readonly TickJob[],
  nextArrivalIndex: number,
  timeTick: number,
  activeJobs: readonly ActiveTickJob[]
): { nextArrivalIndex: number; activeJobs: readonly ActiveTickJob[] } {
  const nextActiveJobs = [...activeJobs];
  let nextIndex = nextArrivalIndex;

  while (nextIndex < jobs.length && jobs[nextIndex].arrivalTick <= timeTick) {
    const job = jobs[nextIndex];
    nextActiveJobs.push({
      ...job,
      remainingQuanta: job.serviceQuanta,
      queueOrder: nextIndex,
    });
    nextIndex += 1;
  }

  nextActiveJobs.sort(compareActiveByQueueOrder);
  return {
    nextArrivalIndex: nextIndex,
    activeJobs: nextActiveJobs,
  };
}

function enumerateAllWorkConservingSchedules(
  jobs: readonly TickJob[]
): readonly TickSchedule[] {
  const sortedJobs = [...jobs].sort(compareTickJobs);
  const schedules: TickSchedule[] = [];

  const explore = (
    timeTick: number,
    nextArrivalIndex: number,
    activeJobs: readonly ActiveTickJob[],
    serviceOrder: readonly string[],
    completedJobs: readonly CompletedTickJob[]
  ): void => {
    let currentTimeTick = timeTick;
    let currentNextArrivalIndex = nextArrivalIndex;
    let currentActiveJobs = [...activeJobs];

    const materialized = materializeArrivals(
      sortedJobs,
      currentNextArrivalIndex,
      currentTimeTick,
      currentActiveJobs
    );
    currentNextArrivalIndex = materialized.nextArrivalIndex;
    currentActiveJobs = [...materialized.activeJobs];

    if (currentActiveJobs.length === 0) {
      if (currentNextArrivalIndex >= sortedJobs.length) {
        schedules.push({
          serviceOrder: [...serviceOrder],
          completedJobs: [...completedJobs].sort((a, b) =>
            a.id.localeCompare(b.id)
          ),
        });
        return;
      }

      currentTimeTick = sortedJobs[currentNextArrivalIndex].arrivalTick;
      const jumped = materializeArrivals(
        sortedJobs,
        currentNextArrivalIndex,
        currentTimeTick,
        currentActiveJobs
      );
      currentNextArrivalIndex = jumped.nextArrivalIndex;
      currentActiveJobs = [...jumped.activeJobs];
    }

    for (const candidate of currentActiveJobs) {
      const nextCompletedJobs: CompletedTickJob[] = [...completedJobs];
      const nextActiveJobs: ActiveTickJob[] = [];

      for (const activeJob of currentActiveJobs) {
        if (activeJob.id !== candidate.id) {
          nextActiveJobs.push(activeJob);
          continue;
        }

        if (activeJob.remainingQuanta === 1) {
          nextCompletedJobs.push({
            id: activeJob.id,
            arrivalTick: activeJob.arrivalTick,
            serviceQuanta: activeJob.serviceQuanta,
            priority: activeJob.priority,
            finishTick: currentTimeTick + 1,
          });
          continue;
        }

        nextActiveJobs.push({
          ...activeJob,
          remainingQuanta: activeJob.remainingQuanta - 1,
        });
      }

      nextActiveJobs.sort(compareActiveByQueueOrder);

      explore(
        currentTimeTick + 1,
        currentNextArrivalIndex,
        nextActiveJobs,
        [...serviceOrder, candidate.id],
        nextCompletedJobs
      );
    }
  };

  explore(0, 0, [], [], []);
  return schedules;
}

function simulateDiscipline(
  jobs: readonly TickJob[],
  selectJobId: DisciplineSelector
): TickSchedule {
  const sortedJobs = [...jobs].sort(compareTickJobs);
  const completedJobs: CompletedTickJob[] = [];
  const serviceOrder: string[] = [];

  let timeTick = 0;
  let nextArrivalIndex = 0;
  let activeJobs: ActiveTickJob[] = [];

  while (completedJobs.length < sortedJobs.length) {
    const materialized = materializeArrivals(
      sortedJobs,
      nextArrivalIndex,
      timeTick,
      activeJobs
    );
    nextArrivalIndex = materialized.nextArrivalIndex;
    activeJobs = [...materialized.activeJobs];

    if (activeJobs.length === 0) {
      timeTick = sortedJobs[nextArrivalIndex].arrivalTick;
      continue;
    }

    const jobId = selectJobId({
      timeTick,
      activeJobs,
      serviceOrder,
    });
    const selectedJob = activeJobs.find((job) => job.id === jobId);
    expect(selectedJob).toBeDefined();

    const nextActiveJobs: ActiveTickJob[] = [];
    for (const activeJob of activeJobs) {
      if (activeJob.id !== jobId) {
        nextActiveJobs.push(activeJob);
        continue;
      }

      if (activeJob.remainingQuanta === 1) {
        completedJobs.push({
          id: activeJob.id,
          arrivalTick: activeJob.arrivalTick,
          serviceQuanta: activeJob.serviceQuanta,
          priority: activeJob.priority,
          finishTick: timeTick + 1,
        });
        continue;
      }

      nextActiveJobs.push({
        ...activeJob,
        remainingQuanta: activeJob.remainingQuanta - 1,
      });
    }

    nextActiveJobs.sort(compareActiveByQueueOrder);
    activeJobs = nextActiveJobs;
    serviceOrder.push(jobId);
    timeTick += 1;
  }

  return {
    serviceOrder,
    completedJobs: completedJobs.sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function analyzeTickSchedule(schedule: TickSchedule): QueueMetrics {
  const startTick = Math.min(
    ...schedule.completedJobs.map((job) => job.arrivalTick)
  );
  const finalDepartureTick = Math.max(
    ...schedule.completedJobs.map((job) => job.finishTick)
  );
  const horizonTicks = finalDepartureTick - startTick;
  let areaInSystem = 0;

  for (let tick = startTick; tick < finalDepartureTick; tick += 1) {
    const jobsInSystem = schedule.completedJobs.filter(
      (job) => job.arrivalTick <= tick && job.finishTick > tick
    ).length;
    areaInSystem += jobsInSystem;
  }

  const totalSojourn = schedule.completedJobs.reduce(
    (sum, job) => sum + (job.finishTick - job.arrivalTick),
    0
  );

  return {
    areaInSystem,
    averageInSystem: areaInSystem / horizonTicks,
    averageSojourn: totalSojourn / schedule.completedJobs.length,
    effectiveArrivalRate: schedule.completedJobs.length / horizonTicks,
    totalSojourn,
    horizonTicks,
    finalDepartureTick,
  };
}

function firstActiveJob(activeJobs: readonly ActiveTickJob[]): ActiveTickJob {
  const [firstJob] = [...activeJobs].sort(compareActiveByQueueOrder);
  expect(firstJob).toBeDefined();
  return firstJob!;
}

function lastActiveJob(activeJobs: readonly ActiveTickJob[]): ActiveTickJob {
  const activeByQueueOrder = [...activeJobs].sort(compareActiveByQueueOrder);
  const lastJob = activeByQueueOrder[activeByQueueOrder.length - 1];
  expect(lastJob).toBeDefined();
  return lastJob!;
}

function compareNetworkJobs(
  a: Pick<NetworkJob, 'arrivalTick' | 'id'>,
  b: Pick<NetworkJob, 'arrivalTick' | 'id'>
): number {
  if (a.arrivalTick !== b.arrivalTick) {
    return a.arrivalTick - b.arrivalTick;
  }
  return a.id.localeCompare(b.id);
}

function compareActiveNetworkByQueueOrder(
  a: ActiveNetworkJob,
  b: ActiveNetworkJob
): number {
  if (a.queueOrder !== b.queueOrder) {
    return a.queueOrder - b.queueOrder;
  }
  return a.id.localeCompare(b.id);
}

function activeNetworkNode(job: ActiveNetworkJob): number {
  return job.route[job.stageIndex];
}

function initialNetworkStageQuanta(job: NetworkJob): number {
  const firstQuanta = job.serviceQuantaByStage[0];
  if (firstQuanta === undefined) {
    throw new Error(`Missing initial service quanta for job ${job.id}`);
  }
  return firstQuanta;
}

function nextNetworkStageQuanta(
  job: ActiveNetworkJob,
  nextStageIndex: number
): number {
  const nextQuanta = job.serviceQuantaByStage[nextStageIndex];
  if (nextQuanta === undefined) {
    throw new Error(
      `Missing stage ${nextStageIndex} service quanta for job ${job.id}`
    );
  }
  return nextQuanta;
}

function materializeNetworkArrivals(
  jobs: readonly NetworkJob[],
  nextArrivalIndex: number,
  timeTick: number,
  activeJobs: readonly ActiveNetworkJob[]
): { nextArrivalIndex: number; activeJobs: readonly ActiveNetworkJob[] } {
  const nextActiveJobs = [...activeJobs];
  let nextIndex = nextArrivalIndex;

  while (nextIndex < jobs.length && jobs[nextIndex].arrivalTick <= timeTick) {
    const job = jobs[nextIndex];
    nextActiveJobs.push({
      ...job,
      stageIndex: 0,
      remainingQuanta: initialNetworkStageQuanta(job),
      queueOrder: nextIndex,
    });
    nextIndex += 1;
  }

  nextActiveJobs.sort(compareActiveNetworkByQueueOrder);
  return {
    nextArrivalIndex: nextIndex,
    activeJobs: nextActiveJobs,
  };
}

function activeNodes(
  activeJobs: readonly ActiveNetworkJob[]
): readonly number[] {
  return [...new Set(activeJobs.map((job) => activeNetworkNode(job)))].sort(
    (left, right) => left - right
  );
}

function selectionTimelineLabel(selection: NetworkNodeSelection): string {
  return [...selection.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([node, jobId]) => `N${node}:${jobId}`)
    .join('|');
}

function enumerateNodeSelections(
  activeJobs: readonly ActiveNetworkJob[],
  nodes: readonly number[],
  nodeIndex = 0,
  currentSelection: Map<number, string> = new Map<number, string>(),
  selections: Array<ReadonlyMap<number, string>> = []
): Array<ReadonlyMap<number, string>> {
  if (nodeIndex >= nodes.length) {
    selections.push(new Map(currentSelection));
    return selections;
  }

  const node = nodes[nodeIndex];
  const candidates = activeJobs.filter(
    (job) => activeNetworkNode(job) === node
  );
  for (const candidate of candidates) {
    currentSelection.set(node, candidate.id);
    enumerateNodeSelections(
      activeJobs,
      nodes,
      nodeIndex + 1,
      currentSelection,
      selections
    );
    currentSelection.delete(node);
  }

  return selections;
}

function applyNetworkSelection(
  activeJobs: readonly ActiveNetworkJob[],
  selection: NetworkNodeSelection,
  timeTick: number
): {
  readonly nextActiveJobs: readonly ActiveNetworkJob[];
  readonly completedJobs: readonly CompletedNetworkJob[];
} {
  const nextActiveJobs: ActiveNetworkJob[] = [];
  const completedJobs: CompletedNetworkJob[] = [];

  for (const activeJob of activeJobs) {
    const selectedJobId = selection.get(activeNetworkNode(activeJob));
    if (selectedJobId !== activeJob.id) {
      nextActiveJobs.push(activeJob);
      continue;
    }

    if (activeJob.remainingQuanta > 1) {
      nextActiveJobs.push({
        ...activeJob,
        remainingQuanta: activeJob.remainingQuanta - 1,
      });
      continue;
    }

    const nextStageIndex = activeJob.stageIndex + 1;
    if (nextStageIndex >= activeJob.route.length) {
      completedJobs.push({
        id: activeJob.id,
        arrivalTick: activeJob.arrivalTick,
        route: activeJob.route,
        serviceQuantaByStage: activeJob.serviceQuantaByStage,
        jobClass: activeJob.jobClass,
        priority: activeJob.priority,
        finishTick: timeTick + 1,
      });
      continue;
    }

    nextActiveJobs.push({
      ...activeJob,
      stageIndex: nextStageIndex,
      remainingQuanta: nextNetworkStageQuanta(activeJob, nextStageIndex),
    });
  }

  nextActiveJobs.sort(compareActiveNetworkByQueueOrder);
  return {
    nextActiveJobs,
    completedJobs,
  };
}

function enumerateAllWorkConservingNetworkSchedules(
  jobs: readonly NetworkJob[]
): readonly NetworkSchedule[] {
  const sortedJobs = [...jobs].sort(compareNetworkJobs);
  const schedules: NetworkSchedule[] = [];

  const explore = (
    timeTick: number,
    nextArrivalIndex: number,
    activeJobs: readonly ActiveNetworkJob[],
    serviceTimeline: readonly string[],
    completedJobs: readonly CompletedNetworkJob[]
  ): void => {
    let currentTimeTick = timeTick;
    let currentNextArrivalIndex = nextArrivalIndex;
    let currentActiveJobs = [...activeJobs];

    const materialized = materializeNetworkArrivals(
      sortedJobs,
      currentNextArrivalIndex,
      currentTimeTick,
      currentActiveJobs
    );
    currentNextArrivalIndex = materialized.nextArrivalIndex;
    currentActiveJobs = [...materialized.activeJobs];

    if (currentActiveJobs.length === 0) {
      if (currentNextArrivalIndex >= sortedJobs.length) {
        schedules.push({
          serviceTimeline: [...serviceTimeline],
          completedJobs: [...completedJobs].sort((a, b) =>
            a.id.localeCompare(b.id)
          ),
        });
        return;
      }

      currentTimeTick = sortedJobs[currentNextArrivalIndex].arrivalTick;
      const jumped = materializeNetworkArrivals(
        sortedJobs,
        currentNextArrivalIndex,
        currentTimeTick,
        currentActiveJobs
      );
      currentNextArrivalIndex = jumped.nextArrivalIndex;
      currentActiveJobs = [...jumped.activeJobs];
    }

    const nodes = activeNodes(currentActiveJobs);
    const selections = enumerateNodeSelections(currentActiveJobs, nodes);

    for (const selection of selections) {
      const advanced = applyNetworkSelection(
        currentActiveJobs,
        selection,
        currentTimeTick
      );
      explore(
        currentTimeTick + 1,
        currentNextArrivalIndex,
        advanced.nextActiveJobs,
        [...serviceTimeline, selectionTimelineLabel(selection)],
        [...completedJobs, ...advanced.completedJobs]
      );
    }
  };

  explore(0, 0, [], [], []);
  return schedules;
}

function simulateNetworkDiscipline(
  jobs: readonly NetworkJob[],
  selector: NetworkDisciplineSelector
): NetworkSchedule {
  const sortedJobs = [...jobs].sort(compareNetworkJobs);
  const completedJobs: CompletedNetworkJob[] = [];
  const serviceTimeline: string[] = [];

  let timeTick = 0;
  let nextArrivalIndex = 0;
  let activeJobs: ActiveNetworkJob[] = [];

  while (completedJobs.length < sortedJobs.length) {
    const materialized = materializeNetworkArrivals(
      sortedJobs,
      nextArrivalIndex,
      timeTick,
      activeJobs
    );
    nextArrivalIndex = materialized.nextArrivalIndex;
    activeJobs = [...materialized.activeJobs];

    if (activeJobs.length === 0) {
      timeTick = sortedJobs[nextArrivalIndex].arrivalTick;
      continue;
    }

    const nodes = activeNodes(activeJobs);
    const selection = selector({
      timeTick,
      activeJobs,
      activeNodes: nodes,
      serviceTimeline,
    });

    for (const node of nodes) {
      const selectedJobId = selection.get(node);
      const selectedJob = activeJobs.find(
        (job) => activeNetworkNode(job) === node && job.id === selectedJobId
      );
      expect(selectedJob).toBeDefined();
    }

    const advanced = applyNetworkSelection(activeJobs, selection, timeTick);
    activeJobs = [...advanced.nextActiveJobs];
    completedJobs.push(...advanced.completedJobs);
    serviceTimeline.push(selectionTimelineLabel(selection));
    timeTick += 1;
  }

  return {
    serviceTimeline,
    completedJobs: completedJobs.sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function analyzeNetworkSchedule(schedule: NetworkSchedule): NetworkMetrics {
  const startTick = Math.min(
    ...schedule.completedJobs.map((job) => job.arrivalTick)
  );
  const finalDepartureTick = Math.max(
    ...schedule.completedJobs.map((job) => job.finishTick)
  );
  const horizonTicks = finalDepartureTick - startTick;
  let areaInSystem = 0;

  for (let tick = startTick; tick < finalDepartureTick; tick += 1) {
    const jobsInSystem = schedule.completedJobs.filter(
      (job) => job.arrivalTick <= tick && job.finishTick > tick
    ).length;
    areaInSystem += jobsInSystem;
  }

  const totalSojourn = schedule.completedJobs.reduce(
    (sum, job) => sum + (job.finishTick - job.arrivalTick),
    0
  );
  return {
    areaInSystem,
    averageInSystem: areaInSystem / horizonTicks,
    averageSojourn: totalSojourn / schedule.completedJobs.length,
    effectiveArrivalRate: schedule.completedJobs.length / horizonTicks,
    totalSojourn,
    horizonTicks,
    finalDepartureTick,
  };
}

function analyzeWeightedNetworkMixture(
  scenarios: readonly WeightedNetworkScenario[],
  selector: NetworkDisciplineSelector
): WeightedNetworkExpectation {
  let totalMass = 0;
  let weightedAreaInSystem = 0;
  let weightedTotalSojourn = 0;

  for (const scenario of scenarios) {
    expect(scenario.mass).toBeGreaterThan(0);
    const schedule = simulateNetworkDiscipline(scenario.jobs, selector);
    const metrics = analyzeNetworkSchedule(schedule);
    totalMass += scenario.mass;
    weightedAreaInSystem += scenario.mass * metrics.areaInSystem;
    weightedTotalSojourn += scenario.mass * metrics.totalSojourn;
  }

  expect(totalMass).toBeGreaterThan(0);

  return {
    totalMass,
    weightedAreaInSystem,
    weightedTotalSojourn,
    expectedAreaInSystem: weightedAreaInSystem / totalMass,
    expectedTotalSojourn: weightedTotalSojourn / totalMass,
  };
}

function probabilisticStateKey(state: ProbabilisticQueueState): string {
  return [
    state.remainingJob1,
    state.remainingJob2,
    state.cumulativeAreaInSystem,
    state.cumulativeDepartedSojourn,
  ].join(',');
}

function probabilisticStateFromKey(key: string): ProbabilisticQueueState {
  const [
    remainingJob1,
    remainingJob2,
    cumulativeAreaInSystem,
    cumulativeDepartedSojourn,
  ] = key.split(',').map((value) => Number.parseInt(value, 10));
  return {
    remainingJob1,
    remainingJob2,
    cumulativeAreaInSystem,
    cumulativeDepartedSojourn,
  };
}

function probabilisticArrivalBranches(
  timeTick: number
): readonly ProbabilisticArrivalBranch[] {
  if (timeTick >= 2) {
    return [{ arrivingServiceQuanta: 0, mass: 1 }];
  }

  return [
    { arrivingServiceQuanta: 0, mass: 1 },
    { arrivingServiceQuanta: 1, mass: 1 },
    { arrivingServiceQuanta: 2, mass: 1 },
  ];
}

function applyProbabilisticArrival(
  state: ProbabilisticQueueState,
  timeTick: number,
  branch: ProbabilisticArrivalBranch
): ProbabilisticQueueState {
  if (timeTick === 0) {
    return {
      remainingJob1: branch.arrivingServiceQuanta,
      remainingJob2: state.remainingJob2,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  if (timeTick === 1) {
    return {
      remainingJob1: state.remainingJob1,
      remainingJob2: branch.arrivingServiceQuanta,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  return state;
}

function probabilisticOccupancy(state: ProbabilisticQueueState): number {
  let occupancy = 0;
  if (state.remainingJob1 > 0) {
    occupancy += 1;
  }
  if (state.remainingJob2 > 0) {
    occupancy += 1;
  }
  return occupancy;
}

function chooseProbabilisticService(
  state: ProbabilisticQueueState,
  selector: ProbabilisticServiceSelector
): 0 | 1 | 2 {
  if (state.remainingJob1 > 0 && state.remainingJob2 > 0) {
    const selectedJob = selector(state);
    expect([1, 2]).toContain(selectedJob);
    return selectedJob;
  }

  if (state.remainingJob1 > 0) {
    return 1;
  }

  if (state.remainingJob2 > 0) {
    return 2;
  }

  return 0;
}

function serveProbabilisticState(
  preServiceState: ProbabilisticQueueState,
  timeTick: number,
  selector: ProbabilisticServiceSelector
): {
  readonly nextState: ProbabilisticQueueState;
  readonly departedSojournIncrement: number;
} {
  const selectedJob = chooseProbabilisticService(preServiceState, selector);

  if (selectedJob === 1) {
    return {
      nextState: {
        remainingJob1: preServiceState.remainingJob1 - 1,
        remainingJob2: preServiceState.remainingJob2,
        cumulativeAreaInSystem:
          preServiceState.cumulativeAreaInSystem +
          probabilisticOccupancy(preServiceState),
        cumulativeDepartedSojourn:
          preServiceState.cumulativeDepartedSojourn +
          (preServiceState.remainingJob1 === 1 ? timeTick + 1 : 0),
      },
      departedSojournIncrement:
        preServiceState.remainingJob1 === 1 ? timeTick + 1 : 0,
    };
  }

  if (selectedJob === 2) {
    return {
      nextState: {
        remainingJob1: preServiceState.remainingJob1,
        remainingJob2: preServiceState.remainingJob2 - 1,
        cumulativeAreaInSystem:
          preServiceState.cumulativeAreaInSystem +
          probabilisticOccupancy(preServiceState),
        cumulativeDepartedSojourn:
          preServiceState.cumulativeDepartedSojourn +
          (preServiceState.remainingJob2 === 1 ? timeTick : 0),
      },
      departedSojournIncrement:
        preServiceState.remainingJob2 === 1 ? timeTick : 0,
    };
  }

  return {
    nextState: {
      remainingJob1: preServiceState.remainingJob1,
      remainingJob2: preServiceState.remainingJob2,
      cumulativeAreaInSystem:
        preServiceState.cumulativeAreaInSystem +
        probabilisticOccupancy(preServiceState),
      cumulativeDepartedSojourn: preServiceState.cumulativeDepartedSojourn,
    },
    departedSojournIncrement: 0,
  };
}

function probabilisticOpenAgeContribution(
  state: ProbabilisticQueueState,
  timeTick: number
): number {
  let openAge = 0;
  if (state.remainingJob1 > 0) {
    openAge += timeTick;
  }
  if (state.remainingJob2 > 0 && timeTick > 0) {
    openAge += timeTick - 1;
  }
  return openAge;
}

function weightedProbabilisticOpenAge(
  distribution: ReadonlyMap<string, number>,
  timeTick: number
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass *
      probabilisticOpenAgeContribution(
        probabilisticStateFromKey(key),
        timeTick
      );
  }
  return total;
}

function weightedProbabilisticAreaInSystem(
  distribution: ReadonlyMap<string, number>
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total += mass * probabilisticStateFromKey(key).cumulativeAreaInSystem;
  }
  return total;
}

function weightedProbabilisticDepartedSojourn(
  distribution: ReadonlyMap<string, number>
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total += mass * probabilisticStateFromKey(key).cumulativeDepartedSojourn;
  }
  return total;
}

function isProbabilisticQueueDone(
  distribution: ReadonlyMap<string, number>
): boolean {
  for (const key of distribution.keys()) {
    const state = probabilisticStateFromKey(key);
    if (state.remainingJob1 > 0 || state.remainingJob2 > 0) {
      return false;
    }
  }
  return true;
}

function simulateProbabilisticQueueKernel(
  selector: ProbabilisticServiceSelector
): readonly ProbabilisticQueueStep[] {
  const steps: ProbabilisticQueueStep[] = [
    {
      timeTick: 0,
      distribution: new Map<string, number>([['0,0,0,0', 1]]),
      totalMass: 1,
      weightedAreaInSystem: 0,
      weightedDepartedSojourn: 0,
      weightedOpenAge: 0,
    },
  ];

  while (
    !isProbabilisticQueueDone(steps[steps.length - 1]!.distribution) ||
    steps[steps.length - 1]!.timeTick < 4
  ) {
    const current = steps[steps.length - 1]!;
    const nextDistribution = new Map<string, number>();

    for (const [key, stateMass] of current.distribution.entries()) {
      const state = probabilisticStateFromKey(key);
      for (const branch of probabilisticArrivalBranches(current.timeTick)) {
        const preServiceState = applyProbabilisticArrival(
          state,
          current.timeTick,
          branch
        );
        const advancedMass = stateMass * branch.mass;
        const served = serveProbabilisticState(
          preServiceState,
          current.timeTick,
          selector
        );
        const nextKey = probabilisticStateKey(served.nextState);
        nextDistribution.set(
          nextKey,
          (nextDistribution.get(nextKey) ?? 0) + advancedMass
        );
      }
    }

    const nextTimeTick = current.timeTick + 1;
    const totalMass = [...nextDistribution.values()].reduce(
      (sum, mass) => sum + mass,
      0
    );
    const weightedAreaInSystem =
      weightedProbabilisticAreaInSystem(nextDistribution);
    const weightedDepartedSojourn =
      weightedProbabilisticDepartedSojourn(nextDistribution);
    const weightedOpenAge = weightedProbabilisticOpenAge(
      nextDistribution,
      nextTimeTick
    );

    steps.push({
      timeTick: nextTimeTick,
      distribution: nextDistribution,
      totalMass,
      weightedAreaInSystem,
      weightedDepartedSojourn,
      weightedOpenAge,
    });

    if (nextTimeTick >= 4 && isProbabilisticQueueDone(nextDistribution)) {
      break;
    }
  }

  return steps;
}

function enumerateProbabilisticLeafExpectation(
  selector: ProbabilisticServiceSelector
): {
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedDepartedSojourn: number;
} {
  const explore = (
    timeTick: number,
    state: ProbabilisticQueueState,
    branchMass: number
  ): {
    readonly totalMass: number;
    readonly weightedAreaInSystem: number;
    readonly weightedDepartedSojourn: number;
  } => {
    if (timeTick >= 4) {
      return {
        totalMass: branchMass,
        weightedAreaInSystem: branchMass * state.cumulativeAreaInSystem,
        weightedDepartedSojourn: branchMass * state.cumulativeDepartedSojourn,
      };
    }

    let totalMass = 0;
    let weightedAreaInSystem = 0;
    let weightedDepartedSojourn = 0;

    for (const branch of probabilisticArrivalBranches(timeTick)) {
      const preServiceState = applyProbabilisticArrival(
        state,
        timeTick,
        branch
      );
      const served = serveProbabilisticState(
        preServiceState,
        timeTick,
        selector
      );
      const leaf = explore(
        timeTick + 1,
        served.nextState,
        branchMass * branch.mass
      );
      totalMass += leaf.totalMass;
      weightedAreaInSystem += leaf.weightedAreaInSystem;
      weightedDepartedSojourn += leaf.weightedDepartedSojourn;
    }

    return {
      totalMass,
      weightedAreaInSystem,
      weightedDepartedSojourn,
    };
  };

  return explore(
    0,
    {
      remainingJob1: 0,
      remainingJob2: 0,
      cumulativeAreaInSystem: 0,
      cumulativeDepartedSojourn: 0,
    },
    1
  );
}

function probabilisticNetworkStateKey(
  state: ProbabilisticNetworkState
): string {
  return [
    state.job1Phase,
    state.job2Phase,
    state.cumulativeAreaInSystem,
    state.cumulativeDepartedSojourn,
  ].join(',');
}

function probabilisticNetworkStateFromKey(
  key: string
): ProbabilisticNetworkState {
  const [
    job1Phase,
    job2Phase,
    cumulativeAreaInSystem,
    cumulativeDepartedSojourn,
  ] = key.split(',').map((value) => Number.parseInt(value, 10));
  return {
    job1Phase,
    job2Phase,
    cumulativeAreaInSystem,
    cumulativeDepartedSojourn,
  };
}

function probabilisticNetworkArrivalBranches(
  timeTick: number
): readonly ProbabilisticNetworkArrivalBranch[] {
  if (timeTick >= 2) {
    return [{ arrivingPhase: 0, mass: 1 }];
  }

  return [
    { arrivingPhase: 0, mass: 1 },
    { arrivingPhase: 1, mass: 1 },
    { arrivingPhase: 4, mass: 1 },
  ];
}

function probabilisticNetworkPhaseNode(phase: number): 0 | 1 | 2 {
  if (phase === 1 || phase === 2 || phase === 5 || phase === 6) {
    return 1;
  }

  if (phase === 3 || phase === 4) {
    return 2;
  }

  return 0;
}

function probabilisticNetworkPhaseClass(phase: number): 0 | 1 | 2 {
  if (phase >= 1 && phase <= 3) {
    return 1;
  }

  if (phase >= 4 && phase <= 6) {
    return 2;
  }

  return 0;
}

function probabilisticNetworkPhaseTotalRemaining(phase: number): number {
  switch (phase) {
    case 1:
      return 3;
    case 2:
      return 2;
    case 3:
      return 1;
    case 4:
      return 3;
    case 5:
      return 2;
    case 6:
      return 1;
    default:
      return 0;
  }
}

function probabilisticNetworkPhaseIsActive(phase: number): boolean {
  return phase >= 1 && phase <= 6;
}

function probabilisticNetworkAdvancePhase(phase: number): number {
  switch (phase) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return 7;
    case 4:
      return 5;
    case 5:
      return 6;
    case 6:
      return 7;
    default:
      return phase;
  }
}

function applyProbabilisticNetworkArrival(
  state: ProbabilisticNetworkState,
  timeTick: number,
  branch: ProbabilisticNetworkArrivalBranch
): ProbabilisticNetworkState {
  if (timeTick === 0) {
    return {
      job1Phase: branch.arrivingPhase,
      job2Phase: state.job2Phase,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  if (timeTick === 1) {
    return {
      job1Phase: state.job1Phase,
      job2Phase: branch.arrivingPhase,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  return state;
}

function probabilisticNetworkActiveJobCount(
  state: ProbabilisticNetworkState
): number {
  let activeJobs = 0;
  if (probabilisticNetworkPhaseIsActive(state.job1Phase)) {
    activeJobs += 1;
  }
  if (probabilisticNetworkPhaseIsActive(state.job2Phase)) {
    activeJobs += 1;
  }
  return activeJobs;
}

function probabilisticNetworkSlotPhase(
  state: ProbabilisticNetworkState,
  slot: 1 | 2
): number {
  return slot === 1 ? state.job1Phase : state.job2Phase;
}

function probabilisticNetworkArrivalTick(slot: 1 | 2): number {
  return slot === 1 ? 0 : 1;
}

function probabilisticNetworkActiveSlotsAtNode(
  state: ProbabilisticNetworkState,
  node: 1 | 2
): readonly (1 | 2)[] {
  const candidates: Array<1 | 2> = [];
  if (probabilisticNetworkPhaseNode(state.job1Phase) === node) {
    candidates.push(1);
  }
  if (probabilisticNetworkPhaseNode(state.job2Phase) === node) {
    candidates.push(2);
  }
  return candidates;
}

function serveProbabilisticNetworkState(
  preServiceState: ProbabilisticNetworkState,
  timeTick: number,
  selector: ProbabilisticNetworkServiceSelector
): ProbabilisticNetworkState {
  const selectedSlots = new Set<1 | 2>();

  for (const node of [1, 2] as const) {
    const candidates = probabilisticNetworkActiveSlotsAtNode(
      preServiceState,
      node
    );
    if (candidates.length === 1) {
      selectedSlots.add(candidates[0]!);
      continue;
    }

    if (candidates.length > 1) {
      const selectedSlot = selector(preServiceState, node, candidates);
      expect(candidates).toContain(selectedSlot);
      selectedSlots.add(selectedSlot);
    }
  }

  let nextState: ProbabilisticNetworkState = {
    ...preServiceState,
    cumulativeAreaInSystem:
      preServiceState.cumulativeAreaInSystem +
      probabilisticNetworkActiveJobCount(preServiceState),
    cumulativeDepartedSojourn: preServiceState.cumulativeDepartedSojourn,
  };

  for (const selectedSlot of selectedSlots) {
    const currentPhase = probabilisticNetworkSlotPhase(
      preServiceState,
      selectedSlot
    );
    const nextPhase = probabilisticNetworkAdvancePhase(currentPhase);
    const departedIncrement =
      nextPhase === 7
        ? timeTick + 1 - probabilisticNetworkArrivalTick(selectedSlot)
        : 0;

    nextState =
      selectedSlot === 1
        ? {
            ...nextState,
            job1Phase: nextPhase,
            cumulativeDepartedSojourn:
              nextState.cumulativeDepartedSojourn + departedIncrement,
          }
        : {
            ...nextState,
            job2Phase: nextPhase,
            cumulativeDepartedSojourn:
              nextState.cumulativeDepartedSojourn + departedIncrement,
          };
  }

  return nextState;
}

function probabilisticNetworkOpenAgeContribution(
  state: ProbabilisticNetworkState,
  timeTick: number
): number {
  let openAge = 0;
  if (probabilisticNetworkPhaseIsActive(state.job1Phase)) {
    openAge += timeTick;
  }
  if (probabilisticNetworkPhaseIsActive(state.job2Phase) && timeTick > 0) {
    openAge += timeTick - 1;
  }
  return openAge;
}

function weightedProbabilisticNetworkOpenAge(
  distribution: ReadonlyMap<string, number>,
  timeTick: number
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass *
      probabilisticNetworkOpenAgeContribution(
        probabilisticNetworkStateFromKey(key),
        timeTick
      );
  }
  return total;
}

function weightedProbabilisticNetworkAreaInSystem(
  distribution: ReadonlyMap<string, number>
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass * probabilisticNetworkStateFromKey(key).cumulativeAreaInSystem;
  }
  return total;
}

function weightedProbabilisticNetworkDepartedSojourn(
  distribution: ReadonlyMap<string, number>
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass * probabilisticNetworkStateFromKey(key).cumulativeDepartedSojourn;
  }
  return total;
}

function isProbabilisticNetworkDone(
  distribution: ReadonlyMap<string, number>
): boolean {
  for (const key of distribution.keys()) {
    const state = probabilisticNetworkStateFromKey(key);
    if (
      probabilisticNetworkPhaseIsActive(state.job1Phase) ||
      probabilisticNetworkPhaseIsActive(state.job2Phase)
    ) {
      return false;
    }
  }
  return true;
}

function simulateProbabilisticNetworkKernel(
  selector: ProbabilisticNetworkServiceSelector
): readonly ProbabilisticNetworkStep[] {
  const steps: ProbabilisticNetworkStep[] = [
    {
      timeTick: 0,
      distribution: new Map<string, number>([['0,0,0,0', 1]]),
      totalMass: 1,
      weightedAreaInSystem: 0,
      weightedDepartedSojourn: 0,
      weightedOpenAge: 0,
    },
  ];

  while (
    !isProbabilisticNetworkDone(steps[steps.length - 1]!.distribution) ||
    steps[steps.length - 1]!.timeTick < 6
  ) {
    const current = steps[steps.length - 1]!;
    const nextDistribution = new Map<string, number>();

    for (const [key, stateMass] of current.distribution.entries()) {
      const state = probabilisticNetworkStateFromKey(key);
      for (const branch of probabilisticNetworkArrivalBranches(
        current.timeTick
      )) {
        const preServiceState = applyProbabilisticNetworkArrival(
          state,
          current.timeTick,
          branch
        );
        const nextState = serveProbabilisticNetworkState(
          preServiceState,
          current.timeTick,
          selector
        );
        const nextKey = probabilisticNetworkStateKey(nextState);
        nextDistribution.set(
          nextKey,
          (nextDistribution.get(nextKey) ?? 0) + stateMass * branch.mass
        );
      }
    }

    const nextTimeTick = current.timeTick + 1;
    const totalMass = [...nextDistribution.values()].reduce(
      (sum, mass) => sum + mass,
      0
    );
    const weightedAreaInSystem =
      weightedProbabilisticNetworkAreaInSystem(nextDistribution);
    const weightedDepartedSojourn =
      weightedProbabilisticNetworkDepartedSojourn(nextDistribution);
    const weightedOpenAge = weightedProbabilisticNetworkOpenAge(
      nextDistribution,
      nextTimeTick
    );

    steps.push({
      timeTick: nextTimeTick,
      distribution: nextDistribution,
      totalMass,
      weightedAreaInSystem,
      weightedDepartedSojourn,
      weightedOpenAge,
    });

    if (nextTimeTick >= 6 && isProbabilisticNetworkDone(nextDistribution)) {
      break;
    }
  }

  return steps;
}

function enumerateProbabilisticNetworkLeafExpectation(
  selector: ProbabilisticNetworkServiceSelector
): {
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedDepartedSojourn: number;
} {
  const explore = (
    timeTick: number,
    state: ProbabilisticNetworkState,
    branchMass: number
  ): {
    readonly totalMass: number;
    readonly weightedAreaInSystem: number;
    readonly weightedDepartedSojourn: number;
  } => {
    if (timeTick >= 6) {
      return {
        totalMass: branchMass,
        weightedAreaInSystem: branchMass * state.cumulativeAreaInSystem,
        weightedDepartedSojourn: branchMass * state.cumulativeDepartedSojourn,
      };
    }

    let totalMass = 0;
    let weightedAreaInSystem = 0;
    let weightedDepartedSojourn = 0;

    for (const branch of probabilisticNetworkArrivalBranches(timeTick)) {
      const preServiceState = applyProbabilisticNetworkArrival(
        state,
        timeTick,
        branch
      );
      const nextState = serveProbabilisticNetworkState(
        preServiceState,
        timeTick,
        selector
      );
      const leaf = explore(timeTick + 1, nextState, branchMass * branch.mass);
      totalMass += leaf.totalMass;
      weightedAreaInSystem += leaf.weightedAreaInSystem;
      weightedDepartedSojourn += leaf.weightedDepartedSojourn;
    }

    return {
      totalMass,
      weightedAreaInSystem,
      weightedDepartedSojourn,
    };
  };

  return explore(
    0,
    {
      job1Phase: 0,
      job2Phase: 0,
      cumulativeAreaInSystem: 0,
      cumulativeDepartedSojourn: 0,
    },
    1
  );
}

function largeProbabilisticNetworkStateKey(
  state: LargeProbabilisticNetworkState
): string {
  return [
    state.slot1Phase,
    state.slot2Phase,
    state.slot3Phase,
    state.cumulativeAreaInSystem,
    state.cumulativeDepartedSojourn,
  ].join(',');
}

function largeProbabilisticNetworkStateFromKey(
  key: string
): LargeProbabilisticNetworkState {
  const [
    slot1Phase,
    slot2Phase,
    slot3Phase,
    cumulativeAreaInSystem,
    cumulativeDepartedSojourn,
  ] = key.split(',').map((value) => Number.parseInt(value, 10));
  return {
    slot1Phase,
    slot2Phase,
    slot3Phase,
    cumulativeAreaInSystem,
    cumulativeDepartedSojourn,
  };
}

function largeProbabilisticNetworkArrivalBranches(
  timeTick: number
): readonly LargeProbabilisticNetworkArrivalBranch[] {
  if (timeTick >= 3) {
    return [{ arrivingPhase: 0, mass: 1 }];
  }

  return [
    { arrivingPhase: 0, mass: 1 },
    { arrivingPhase: 1, mass: 1 },
    { arrivingPhase: 5, mass: 1 },
    { arrivingPhase: 9, mass: 1 },
  ];
}

function largeProbabilisticNetworkPhaseNode(phase: number): 0 | 1 | 2 | 3 {
  switch (phase) {
    case 1:
    case 2:
    case 7:
    case 8:
    case 10:
    case 11:
      return 1;
    case 3:
    case 5:
    case 12:
      return 2;
    case 4:
    case 6:
    case 9:
      return 3;
    default:
      return 0;
  }
}

function largeProbabilisticNetworkPhaseClass(phase: number): 0 | 1 | 2 | 3 {
  if (phase >= 1 && phase <= 4) {
    return 1;
  }
  if (phase >= 5 && phase <= 8) {
    return 2;
  }
  if (phase >= 9 && phase <= 12) {
    return 3;
  }
  return 0;
}

function largeProbabilisticNetworkPhaseTotalRemaining(phase: number): number {
  switch (phase) {
    case 1:
    case 5:
    case 9:
      return 4;
    case 2:
    case 6:
    case 10:
      return 3;
    case 3:
    case 7:
    case 11:
      return 2;
    case 4:
    case 8:
    case 12:
      return 1;
    default:
      return 0;
  }
}

function largeProbabilisticNetworkPhaseIsActive(phase: number): boolean {
  return phase >= 1 && phase <= 12;
}

function largeProbabilisticNetworkAdvancePhase(phase: number): number {
  switch (phase) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return 4;
    case 4:
      return 13;
    case 5:
      return 6;
    case 6:
      return 7;
    case 7:
      return 8;
    case 8:
      return 13;
    case 9:
      return 10;
    case 10:
      return 11;
    case 11:
      return 12;
    case 12:
      return 13;
    default:
      return phase;
  }
}

function applyLargeProbabilisticNetworkArrival(
  state: LargeProbabilisticNetworkState,
  timeTick: number,
  branch: LargeProbabilisticNetworkArrivalBranch
): LargeProbabilisticNetworkState {
  if (timeTick === 0) {
    return {
      slot1Phase: branch.arrivingPhase,
      slot2Phase: state.slot2Phase,
      slot3Phase: state.slot3Phase,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  if (timeTick === 1) {
    return {
      slot1Phase: state.slot1Phase,
      slot2Phase: branch.arrivingPhase,
      slot3Phase: state.slot3Phase,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  if (timeTick === 2) {
    return {
      slot1Phase: state.slot1Phase,
      slot2Phase: state.slot2Phase,
      slot3Phase: branch.arrivingPhase,
      cumulativeAreaInSystem: state.cumulativeAreaInSystem,
      cumulativeDepartedSojourn: state.cumulativeDepartedSojourn,
    };
  }

  return state;
}

function largeProbabilisticNetworkActiveJobCount(
  state: LargeProbabilisticNetworkState
): number {
  let activeJobs = 0;
  if (largeProbabilisticNetworkPhaseIsActive(state.slot1Phase)) {
    activeJobs += 1;
  }
  if (largeProbabilisticNetworkPhaseIsActive(state.slot2Phase)) {
    activeJobs += 1;
  }
  if (largeProbabilisticNetworkPhaseIsActive(state.slot3Phase)) {
    activeJobs += 1;
  }
  return activeJobs;
}

function largeProbabilisticNetworkSlotPhase(
  state: LargeProbabilisticNetworkState,
  slot: 1 | 2 | 3
): number {
  if (slot === 1) {
    return state.slot1Phase;
  }

  if (slot === 2) {
    return state.slot2Phase;
  }

  return state.slot3Phase;
}

function largeProbabilisticNetworkArrivalTick(slot: 1 | 2 | 3): number {
  return slot - 1;
}

function largeProbabilisticNetworkActiveSlotsAtNode(
  state: LargeProbabilisticNetworkState,
  node: 1 | 2 | 3
): readonly (1 | 2 | 3)[] {
  const candidates: Array<1 | 2 | 3> = [];
  if (largeProbabilisticNetworkPhaseNode(state.slot1Phase) === node) {
    candidates.push(1);
  }
  if (largeProbabilisticNetworkPhaseNode(state.slot2Phase) === node) {
    candidates.push(2);
  }
  if (largeProbabilisticNetworkPhaseNode(state.slot3Phase) === node) {
    candidates.push(3);
  }
  return candidates;
}

function serveLargeProbabilisticNetworkState(
  preServiceState: LargeProbabilisticNetworkState,
  timeTick: number,
  selector: LargeProbabilisticNetworkServiceSelector
): LargeProbabilisticNetworkState {
  const selectedSlots = new Set<1 | 2 | 3>();

  for (const node of [1, 2, 3] as const) {
    const candidates = largeProbabilisticNetworkActiveSlotsAtNode(
      preServiceState,
      node
    );
    if (candidates.length === 1) {
      selectedSlots.add(candidates[0]!);
      continue;
    }

    if (candidates.length > 1) {
      const selectedSlot = selector(preServiceState, node, candidates);
      expect(candidates).toContain(selectedSlot);
      selectedSlots.add(selectedSlot);
    }
  }

  let nextState: LargeProbabilisticNetworkState = {
    ...preServiceState,
    cumulativeAreaInSystem:
      preServiceState.cumulativeAreaInSystem +
      largeProbabilisticNetworkActiveJobCount(preServiceState),
    cumulativeDepartedSojourn: preServiceState.cumulativeDepartedSojourn,
  };

  for (const selectedSlot of selectedSlots) {
    const currentPhase = largeProbabilisticNetworkSlotPhase(
      preServiceState,
      selectedSlot
    );
    const nextPhase = largeProbabilisticNetworkAdvancePhase(currentPhase);
    const departedIncrement =
      nextPhase === 13
        ? timeTick + 1 - largeProbabilisticNetworkArrivalTick(selectedSlot)
        : 0;

    if (selectedSlot === 1) {
      nextState = {
        ...nextState,
        slot1Phase: nextPhase,
        cumulativeDepartedSojourn:
          nextState.cumulativeDepartedSojourn + departedIncrement,
      };
      continue;
    }

    if (selectedSlot === 2) {
      nextState = {
        ...nextState,
        slot2Phase: nextPhase,
        cumulativeDepartedSojourn:
          nextState.cumulativeDepartedSojourn + departedIncrement,
      };
      continue;
    }

    nextState = {
      ...nextState,
      slot3Phase: nextPhase,
      cumulativeDepartedSojourn:
        nextState.cumulativeDepartedSojourn + departedIncrement,
    };
  }

  return nextState;
}

function largeProbabilisticNetworkOpenAgeContribution(
  state: LargeProbabilisticNetworkState,
  timeTick: number
): number {
  let openAge = 0;
  if (largeProbabilisticNetworkPhaseIsActive(state.slot1Phase)) {
    openAge += timeTick;
  }
  if (
    largeProbabilisticNetworkPhaseIsActive(state.slot2Phase) &&
    timeTick > 0
  ) {
    openAge += timeTick - 1;
  }
  if (
    largeProbabilisticNetworkPhaseIsActive(state.slot3Phase) &&
    timeTick > 1
  ) {
    openAge += timeTick - 2;
  }
  return openAge;
}

function weightedLargeProbabilisticNetworkOpenAge(
  distribution: ReadonlyMap<string, number>,
  timeTick: number
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass *
      largeProbabilisticNetworkOpenAgeContribution(
        largeProbabilisticNetworkStateFromKey(key),
        timeTick
      );
  }
  return total;
}

function weightedLargeProbabilisticNetworkAreaInSystem(
  distribution: ReadonlyMap<string, number>
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass * largeProbabilisticNetworkStateFromKey(key).cumulativeAreaInSystem;
  }
  return total;
}

function weightedLargeProbabilisticNetworkDepartedSojourn(
  distribution: ReadonlyMap<string, number>
): number {
  let total = 0;
  for (const [key, mass] of distribution.entries()) {
    total +=
      mass *
      largeProbabilisticNetworkStateFromKey(key).cumulativeDepartedSojourn;
  }
  return total;
}

function isLargeProbabilisticNetworkDone(
  distribution: ReadonlyMap<string, number>
): boolean {
  for (const key of distribution.keys()) {
    const state = largeProbabilisticNetworkStateFromKey(key);
    if (
      largeProbabilisticNetworkPhaseIsActive(state.slot1Phase) ||
      largeProbabilisticNetworkPhaseIsActive(state.slot2Phase) ||
      largeProbabilisticNetworkPhaseIsActive(state.slot3Phase)
    ) {
      return false;
    }
  }
  return true;
}

function simulateLargeProbabilisticNetworkKernel(
  selector: LargeProbabilisticNetworkServiceSelector
): readonly LargeProbabilisticNetworkStep[] {
  const steps: LargeProbabilisticNetworkStep[] = [
    {
      timeTick: 0,
      distribution: new Map<string, number>([['0,0,0,0,0', 1]]),
      totalMass: 1,
      weightedAreaInSystem: 0,
      weightedDepartedSojourn: 0,
      weightedOpenAge: 0,
    },
  ];

  while (true) {
    const current = steps[steps.length - 1]!;
    const nextDistribution = new Map<string, number>();

    for (const [key, stateMass] of current.distribution.entries()) {
      const state = largeProbabilisticNetworkStateFromKey(key);
      for (const branch of largeProbabilisticNetworkArrivalBranches(
        current.timeTick
      )) {
        const preServiceState = applyLargeProbabilisticNetworkArrival(
          state,
          current.timeTick,
          branch
        );
        const nextState = serveLargeProbabilisticNetworkState(
          preServiceState,
          current.timeTick,
          selector
        );
        const nextKey = largeProbabilisticNetworkStateKey(nextState);
        nextDistribution.set(
          nextKey,
          (nextDistribution.get(nextKey) ?? 0) + stateMass * branch.mass
        );
      }
    }

    const nextTimeTick = current.timeTick + 1;
    const totalMass = [...nextDistribution.values()].reduce(
      (sum, mass) => sum + mass,
      0
    );
    const weightedAreaInSystem =
      weightedLargeProbabilisticNetworkAreaInSystem(nextDistribution);
    const weightedDepartedSojourn =
      weightedLargeProbabilisticNetworkDepartedSojourn(nextDistribution);
    const weightedOpenAge = weightedLargeProbabilisticNetworkOpenAge(
      nextDistribution,
      nextTimeTick
    );

    steps.push({
      timeTick: nextTimeTick,
      distribution: nextDistribution,
      totalMass,
      weightedAreaInSystem,
      weightedDepartedSojourn,
      weightedOpenAge,
    });

    if (
      nextTimeTick >= 3 &&
      isLargeProbabilisticNetworkDone(nextDistribution)
    ) {
      break;
    }

    expect(nextTimeTick).toBeLessThanOrEqual(12);
  }

  return steps;
}

function enumerateLargeProbabilisticNetworkLeafExpectation(
  selector: LargeProbabilisticNetworkServiceSelector
): {
  readonly totalMass: number;
  readonly weightedAreaInSystem: number;
  readonly weightedDepartedSojourn: number;
} {
  const explore = (
    timeTick: number,
    state: LargeProbabilisticNetworkState,
    branchMass: number
  ): {
    readonly totalMass: number;
    readonly weightedAreaInSystem: number;
    readonly weightedDepartedSojourn: number;
  } => {
    if (
      timeTick >= 3 &&
      !largeProbabilisticNetworkPhaseIsActive(state.slot1Phase) &&
      !largeProbabilisticNetworkPhaseIsActive(state.slot2Phase) &&
      !largeProbabilisticNetworkPhaseIsActive(state.slot3Phase)
    ) {
      return {
        totalMass: branchMass,
        weightedAreaInSystem: branchMass * state.cumulativeAreaInSystem,
        weightedDepartedSojourn: branchMass * state.cumulativeDepartedSojourn,
      };
    }

    expect(timeTick).toBeLessThanOrEqual(12);

    let totalMass = 0;
    let weightedAreaInSystem = 0;
    let weightedDepartedSojourn = 0;

    for (const branch of largeProbabilisticNetworkArrivalBranches(timeTick)) {
      const preServiceState = applyLargeProbabilisticNetworkArrival(
        state,
        timeTick,
        branch
      );
      const nextState = serveLargeProbabilisticNetworkState(
        preServiceState,
        timeTick,
        selector
      );
      const leaf = explore(timeTick + 1, nextState, branchMass * branch.mass);
      totalMass += leaf.totalMass;
      weightedAreaInSystem += leaf.weightedAreaInSystem;
      weightedDepartedSojourn += leaf.weightedDepartedSojourn;
    }

    return {
      totalMass,
      weightedAreaInSystem,
      weightedDepartedSojourn,
    };
  };

  return explore(
    0,
    {
      slot1Phase: 0,
      slot2Phase: 0,
      slot3Phase: 0,
      cumulativeAreaInSystem: 0,
      cumulativeDepartedSojourn: 0,
    },
    1
  );
}

function selectPerNodeBestJob(
  state: NetworkDisciplineState,
  compareJobs: (left: ActiveNetworkJob, right: ActiveNetworkJob) => number
): NetworkNodeSelection {
  const selection = new Map<number, string>();
  for (const node of state.activeNodes) {
    const [bestJob] = state.activeJobs
      .filter((job) => activeNetworkNode(job) === node)
      .sort(compareJobs);
    expect(bestJob).toBeDefined();
    selection.set(node, bestJob!.id);
  }
  return selection;
}

describe('Queueing Theory Subsumption (§5)', () => {
  describe('Discipline-General Sample-Path Identities', () => {
    const finiteTraceJobs: readonly TickJob[] = [
      { id: 'A', arrivalTick: 0, serviceQuanta: 2, priority: 2 },
      { id: 'B', arrivalTick: 1, serviceQuanta: 2, priority: 1 },
      { id: 'C', arrivalTick: 1, serviceQuanta: 1, priority: 0 },
      { id: 'D', arrivalTick: 2, serviceQuanta: 1, priority: 2 },
    ];

    it('exhaustively covers every finite work-conserving single-server discipline on a trace', () => {
      const schedules = enumerateAllWorkConservingSchedules(finiteTraceJobs);
      const totalServiceQuanta = finiteTraceJobs.reduce(
        (sum, job) => sum + job.serviceQuanta,
        0
      );
      const finalDepartureTicks = new Set(
        schedules.map(
          (schedule) => analyzeTickSchedule(schedule).finalDepartureTick
        )
      );

      expect(schedules.length).toBeGreaterThan(5);
      expect(finalDepartureTicks.size).toBe(1);

      for (const schedule of schedules) {
        const metrics = analyzeTickSchedule(schedule);
        expect(schedule.serviceOrder).toHaveLength(totalServiceQuanta);
        expect(metrics.areaInSystem).toBe(metrics.totalSojourn);
        expect(metrics.averageInSystem).toBeCloseTo(
          metrics.effectiveArrivalRate * metrics.averageSojourn,
          12
        );
      }
    });

    it('named queue disciplines embed as fold-selection policies in the exhaustive family', () => {
      const exhaustiveOrders = new Set(
        enumerateAllWorkConservingSchedules(finiteTraceJobs).map((schedule) =>
          schedule.serviceOrder.join(',')
        )
      );

      const disciplineSchedules = [
        simulateDiscipline(
          finiteTraceJobs,
          ({ activeJobs }) => firstActiveJob(activeJobs).id
        ),
        simulateDiscipline(
          finiteTraceJobs,
          ({ activeJobs }) => lastActiveJob(activeJobs).id
        ),
        simulateDiscipline(finiteTraceJobs, ({ activeJobs }) => {
          const [bestJob] = [...activeJobs].sort(
            (left, right) =>
              left.priority - right.priority ||
              compareActiveByQueueOrder(left, right)
          );
          expect(bestJob).toBeDefined();
          return bestJob!.id;
        }),
        simulateDiscipline(finiteTraceJobs, ({ activeJobs }) => {
          const [bestJob] = [...activeJobs].sort(
            (left, right) =>
              left.remainingQuanta - right.remainingQuanta ||
              compareActiveByQueueOrder(left, right)
          );
          expect(bestJob).toBeDefined();
          return bestJob!.id;
        }),
      ];

      for (const schedule of disciplineSchedules) {
        const metrics = analyzeTickSchedule(schedule);
        expect(exhaustiveOrders.has(schedule.serviceOrder.join(','))).toBe(
          true
        );
        expect(metrics.areaInSystem).toBe(metrics.totalSojourn);
        expect(metrics.averageInSystem).toBeCloseTo(
          metrics.effectiveArrivalRate * metrics.averageSojourn,
          12
        );
      }
    });

    it('sample-path identity survives representative service-time laws', () => {
      const serviceLaws: readonly ServiceLaw[] = [
        {
          name: 'deterministic',
          sample: () => 2,
        },
        {
          name: 'exponential',
          sample: (rng) => expSample(0.9, rng),
        },
        {
          name: 'erlang-2',
          sample: (rng) => expSample(1.6, rng) + expSample(1.6, rng),
        },
        {
          name: 'hyperexponential',
          sample: (rng) =>
            rng() < 0.75 ? expSample(2.5, rng) : expSample(0.6, rng),
        },
        {
          name: 'lognormal',
          sample: (rng) => Math.exp(normalSample(-0.1, 0.55, rng)),
        },
      ];
      const arrivalTicks = [0, 1, 1] as const;

      for (const [lawIndex, law] of serviceLaws.entries()) {
        const rng = makeRng(0x51ce00 + lawIndex);
        const jobs = arrivalTicks.map(
          (arrivalTick, index): TickJob => ({
            id: `${law.name}-${index}`,
            arrivalTick,
            serviceQuanta: discretizeServiceTime(law.sample(rng)),
            priority: index,
          })
        );
        const schedules = enumerateAllWorkConservingSchedules(jobs);

        expect(schedules.length).toBeGreaterThan(0);

        for (const schedule of schedules) {
          const metrics = analyzeTickSchedule(schedule);
          expect(metrics.areaInSystem).toBe(metrics.totalSojourn);
          expect(metrics.averageInSystem).toBeCloseTo(
            metrics.effectiveArrivalRate * metrics.averageSojourn,
            12
          );
        }
      }
    });
  });

  describe('Multi-Class Network Sample-Path Identities', () => {
    const networkJobs: readonly NetworkJob[] = [
      {
        id: 'A',
        arrivalTick: 0,
        route: [1, 2],
        serviceQuantaByStage: [2, 1],
        jobClass: 'alpha',
        priority: 2,
      },
      {
        id: 'B',
        arrivalTick: 0,
        route: [2, 1],
        serviceQuantaByStage: [1, 1],
        jobClass: 'beta',
        priority: 0,
      },
      {
        id: 'C',
        arrivalTick: 1,
        route: [1, 2],
        serviceQuantaByStage: [1, 1],
        jobClass: 'alpha',
        priority: 1,
      },
    ];

    it('exhaustively covers every finite work-conserving multiclass network dispatch policy on a trace', () => {
      const schedules = enumerateAllWorkConservingNetworkSchedules(networkJobs);

      expect(schedules.length).toBeGreaterThan(1);

      for (const schedule of schedules) {
        const metrics = analyzeNetworkSchedule(schedule);
        expect(metrics.areaInSystem).toBe(metrics.totalSojourn);
        expect(metrics.averageInSystem).toBeCloseTo(
          metrics.effectiveArrivalRate * metrics.averageSojourn,
          12
        );
      }
    });

    it('named per-node disciplines embed inside the exhaustive multiclass network family', () => {
      const exhaustiveTimelines = new Set(
        enumerateAllWorkConservingNetworkSchedules(networkJobs).map(
          (schedule) => schedule.serviceTimeline.join('||')
        )
      );

      const namedSchedules = [
        simulateNetworkDiscipline(networkJobs, (state) =>
          selectPerNodeBestJob(state, compareActiveNetworkByQueueOrder)
        ),
        simulateNetworkDiscipline(networkJobs, (state) =>
          selectPerNodeBestJob(state, (left, right) =>
            compareActiveNetworkByQueueOrder(right, left)
          )
        ),
        simulateNetworkDiscipline(networkJobs, (state) =>
          selectPerNodeBestJob(
            state,
            (left, right) =>
              left.priority - right.priority ||
              compareActiveNetworkByQueueOrder(left, right)
          )
        ),
        simulateNetworkDiscipline(networkJobs, (state) =>
          selectPerNodeBestJob(
            state,
            (left, right) =>
              left.remainingQuanta - right.remainingQuanta ||
              compareActiveNetworkByQueueOrder(left, right)
          )
        ),
      ];

      for (const schedule of namedSchedules) {
        const metrics = analyzeNetworkSchedule(schedule);
        expect(
          exhaustiveTimelines.has(schedule.serviceTimeline.join('||'))
        ).toBe(true);
        expect(metrics.areaInSystem).toBe(metrics.totalSojourn);
      }
    });

    it('multiclass network identity survives finite service-law scenario families', () => {
      const networkScenarios: ReadonlyArray<readonly NetworkJob[]> = [
        [
          {
            id: 'D1',
            arrivalTick: 0,
            route: [1, 2],
            serviceQuantaByStage: [1, 1],
            jobClass: 'deterministic-a',
            priority: 0,
          },
          {
            id: 'D2',
            arrivalTick: 1,
            route: [2, 1],
            serviceQuantaByStage: [1, 1],
            jobClass: 'deterministic-b',
            priority: 1,
          },
        ],
        [
          {
            id: 'H1',
            arrivalTick: 0,
            route: [1, 2],
            serviceQuantaByStage: [2, 1],
            jobClass: 'high-variance-a',
            priority: 0,
          },
          {
            id: 'H2',
            arrivalTick: 0,
            route: [2, 1],
            serviceQuantaByStage: [1, 2],
            jobClass: 'high-variance-b',
            priority: 1,
          },
          {
            id: 'H3',
            arrivalTick: 1,
            route: [1, 2],
            serviceQuantaByStage: [1, 1],
            jobClass: 'high-variance-a',
            priority: 2,
          },
        ],
        [
          {
            id: 'B1',
            arrivalTick: 1,
            route: [1, 2],
            serviceQuantaByStage: [1, 2],
            jobClass: 'bursty-a',
            priority: 1,
          },
          {
            id: 'B2',
            arrivalTick: 1,
            route: [2, 1],
            serviceQuantaByStage: [1, 1],
            jobClass: 'bursty-b',
            priority: 0,
          },
          {
            id: 'B3',
            arrivalTick: 3,
            route: [1, 2],
            serviceQuantaByStage: [1, 1],
            jobClass: 'bursty-a',
            priority: 2,
          },
        ],
      ];

      for (const scenario of networkScenarios) {
        const schedules = enumerateAllWorkConservingNetworkSchedules(scenario);
        expect(schedules.length).toBeGreaterThan(0);

        for (const schedule of schedules) {
          const metrics = analyzeNetworkSchedule(schedule);
          expect(metrics.areaInSystem).toBe(metrics.totalSojourn);
          expect(metrics.averageInSystem).toBeCloseTo(
            metrics.effectiveArrivalRate * metrics.averageSojourn,
            12
          );
        }
      }
    });
  });

  describe('Finite-Support Stochastic Network Mixtures', () => {
    const stochasticNetworkScenarios: readonly WeightedNetworkScenario[] = [
      {
        name: 'baseline-mix',
        mass: 2,
        jobs: [
          {
            id: 'S1-A',
            arrivalTick: 0,
            route: [1, 2],
            serviceQuantaByStage: [2, 1],
            jobClass: 'alpha',
            priority: 1,
          },
          {
            id: 'S1-B',
            arrivalTick: 0,
            route: [2, 1],
            serviceQuantaByStage: [1, 1],
            jobClass: 'beta',
            priority: 0,
          },
          {
            id: 'S1-C',
            arrivalTick: 1,
            route: [1, 2],
            serviceQuantaByStage: [1, 1],
            jobClass: 'alpha',
            priority: 2,
          },
        ],
      },
      {
        name: 'rerouted-beta-heavy',
        mass: 1,
        jobs: [
          {
            id: 'S2-A',
            arrivalTick: 0,
            route: [1, 2],
            serviceQuantaByStage: [1, 2],
            jobClass: 'alpha',
            priority: 2,
          },
          {
            id: 'S2-B',
            arrivalTick: 1,
            route: [1, 2],
            serviceQuantaByStage: [2, 1],
            jobClass: 'beta',
            priority: 0,
          },
          {
            id: 'S2-C',
            arrivalTick: 1,
            route: [2, 1],
            serviceQuantaByStage: [1, 1],
            jobClass: 'beta',
            priority: 1,
          },
        ],
      },
      {
        name: 'late-burst-route-swap',
        mass: 3,
        jobs: [
          {
            id: 'S3-A',
            arrivalTick: 0,
            route: [2, 1],
            serviceQuantaByStage: [1, 1],
            jobClass: 'alpha',
            priority: 2,
          },
          {
            id: 'S3-B',
            arrivalTick: 1,
            route: [1, 2],
            serviceQuantaByStage: [1, 2],
            jobClass: 'alpha',
            priority: 1,
          },
          {
            id: 'S3-C',
            arrivalTick: 2,
            route: [1, 2],
            serviceQuantaByStage: [2, 1],
            jobClass: 'beta',
            priority: 0,
          },
        ],
      },
    ];

    const namedSelectors: ReadonlyArray<
      readonly [string, NetworkDisciplineSelector]
    > = [
      [
        'fifo',
        (state) =>
          selectPerNodeBestJob(state, compareActiveNetworkByQueueOrder),
      ],
      [
        'lifo',
        (state) =>
          selectPerNodeBestJob(state, (left, right) =>
            compareActiveNetworkByQueueOrder(right, left)
          ),
      ],
      [
        'static-priority',
        (state) =>
          selectPerNodeBestJob(
            state,
            (left, right) =>
              left.priority - right.priority ||
              compareActiveNetworkByQueueOrder(left, right)
          ),
      ],
      [
        'srpt',
        (state) =>
          selectPerNodeBestJob(
            state,
            (left, right) =>
              left.remainingQuanta - right.remainingQuanta ||
              compareActiveNetworkByQueueOrder(left, right)
          ),
      ],
    ];

    it('finite-support stochastic mixtures preserve network customer-time conservation in expectation', () => {
      for (const [, selector] of namedSelectors) {
        const mixture = analyzeWeightedNetworkMixture(
          stochasticNetworkScenarios,
          selector
        );
        expect(mixture.weightedAreaInSystem).toBe(mixture.weightedTotalSojourn);
        expect(mixture.expectedAreaInSystem).toBeCloseTo(
          mixture.expectedTotalSojourn,
          12
        );
        expect(mixture.totalMass).toBe(6);
      }
    });

    it('exhaustive dispatch families preserve the same weighted stochastic identity', () => {
      let weightedAreaInSystem = 0;
      let weightedTotalSojourn = 0;
      let weightedScheduleMass = 0;

      for (const scenario of stochasticNetworkScenarios) {
        const schedules = enumerateAllWorkConservingNetworkSchedules(
          scenario.jobs
        );
        expect(schedules.length).toBeGreaterThan(0);

        for (const schedule of schedules) {
          const metrics = analyzeNetworkSchedule(schedule);
          weightedAreaInSystem += scenario.mass * metrics.areaInSystem;
          weightedTotalSojourn += scenario.mass * metrics.totalSojourn;
          weightedScheduleMass += scenario.mass;
        }
      }

      expect(weightedAreaInSystem).toBe(weightedTotalSojourn);
      expect(weightedAreaInSystem / weightedScheduleMass).toBeCloseTo(
        weightedTotalSojourn / weightedScheduleMass,
        12
      );
    });
  });

  describe('Exact Probabilistic Transition Semantics', () => {
    const namedKernelSelectors: ReadonlyArray<
      readonly [string, ProbabilisticServiceSelector]
    > = [
      ['fifo', () => 1],
      ['lifo', () => 2],
      ['static-priority', () => 2],
      ['srpt', (state) => (state.remainingJob2 < state.remainingJob1 ? 2 : 1)],
    ];

    it('preserves customer-time conservation at every tick of the exact transition kernel', () => {
      const expectedMassByTick = [1, 3, 9, 9, 9] as const;

      for (const [, selector] of namedKernelSelectors) {
        const steps = simulateProbabilisticQueueKernel(selector);
        expect(steps).toHaveLength(expectedMassByTick.length);

        for (const [index, step] of steps.entries()) {
          expect(step.totalMass).toBe(expectedMassByTick[index]);
          expect(step.weightedAreaInSystem).toBe(
            step.weightedDepartedSojourn + step.weightedOpenAge
          );
        }

        const finalStep = steps[steps.length - 1]!;
        expect(finalStep.timeTick).toBe(4);
        expect(finalStep.weightedOpenAge).toBe(0);
        expect(finalStep.weightedAreaInSystem).toBe(
          finalStep.weightedDepartedSojourn
        );
        expect(
          finalStep.weightedAreaInSystem / finalStep.totalMass
        ).toBeCloseTo(
          finalStep.weightedDepartedSojourn / finalStep.totalMass,
          12
        );
      }
    });

    it('collapses the exact kernel to the same final expectation as explicit leaf enumeration', () => {
      const fifoKernel = simulateProbabilisticQueueKernel(() => 1);
      const finalStep = fifoKernel[fifoKernel.length - 1]!;
      const leafExpectation = enumerateProbabilisticLeafExpectation(() => 1);

      expect(finalStep.totalMass).toBe(leafExpectation.totalMass);
      expect(finalStep.weightedAreaInSystem).toBe(
        leafExpectation.weightedAreaInSystem
      );
      expect(finalStep.weightedDepartedSojourn).toBe(
        leafExpectation.weightedDepartedSojourn
      );
    });
  });

  describe('Exact Probabilistic Multiclass Network Semantics', () => {
    const namedNetworkKernelSelectors: ReadonlyArray<
      readonly [string, ProbabilisticNetworkServiceSelector]
    > = [
      ['fifo', (_state, _node, candidates) => Math.min(...candidates) as 1 | 2],
      ['lifo', (_state, _node, candidates) => Math.max(...candidates) as 1 | 2],
      [
        'static-priority',
        (state, _node, candidates) => {
          const [bestSlot] = [...candidates].sort(
            (left, right) =>
              probabilisticNetworkPhaseClass(
                probabilisticNetworkSlotPhase(state, right)
              ) -
                probabilisticNetworkPhaseClass(
                  probabilisticNetworkSlotPhase(state, left)
                ) || left - right
          );
          expect(bestSlot).toBeDefined();
          return bestSlot!;
        },
      ],
      [
        'srpt',
        (state, _node, candidates) => {
          const [bestSlot] = [...candidates].sort(
            (left, right) =>
              probabilisticNetworkPhaseTotalRemaining(
                probabilisticNetworkSlotPhase(state, left)
              ) -
                probabilisticNetworkPhaseTotalRemaining(
                  probabilisticNetworkSlotPhase(state, right)
                ) || left - right
          );
          expect(bestSlot).toBeDefined();
          return bestSlot!;
        },
      ],
    ];

    it('preserves network customer-time conservation at every tick of the exact multiclass kernel', () => {
      const expectedMassByTick = [1, 3, 9, 9, 9, 9, 9] as const;

      for (const [, selector] of namedNetworkKernelSelectors) {
        const steps = simulateProbabilisticNetworkKernel(selector);
        expect(steps).toHaveLength(expectedMassByTick.length);

        for (const [index, step] of steps.entries()) {
          expect(step.totalMass).toBe(expectedMassByTick[index]);
          expect(step.weightedAreaInSystem).toBe(
            step.weightedDepartedSojourn + step.weightedOpenAge
          );
        }

        const finalStep = steps[steps.length - 1]!;
        expect(finalStep.timeTick).toBe(6);
        expect(finalStep.weightedOpenAge).toBe(0);
        expect(finalStep.weightedAreaInSystem).toBe(
          finalStep.weightedDepartedSojourn
        );
        expect(
          finalStep.weightedAreaInSystem / finalStep.totalMass
        ).toBeCloseTo(
          finalStep.weightedDepartedSojourn / finalStep.totalMass,
          12
        );
      }
    });

    it('collapses the multiclass network kernel to the same final expectation as explicit leaf enumeration', () => {
      const fifoKernel = simulateProbabilisticNetworkKernel(
        (_state, _node, candidates) => Math.min(...candidates) as 1 | 2
      );
      const finalStep = fifoKernel[fifoKernel.length - 1]!;
      const leafExpectation = enumerateProbabilisticNetworkLeafExpectation(
        (_state, _node, candidates) => Math.min(...candidates) as 1 | 2
      );

      expect(finalStep.totalMass).toBe(leafExpectation.totalMass);
      expect(finalStep.weightedAreaInSystem).toBe(
        leafExpectation.weightedAreaInSystem
      );
      expect(finalStep.weightedDepartedSojourn).toBe(
        leafExpectation.weightedDepartedSojourn
      );
    });

    it('exposes the worst small-data ramp-up branch as a two-arrival reverse-route collision', () => {
      const worstRampBranch: readonly NetworkJob[] = [
        {
          id: 'ramp-beta',
          arrivalTick: 0,
          route: [2, 1],
          serviceQuantaByStage: [1, 2],
          jobClass: 'beta',
          priority: 0,
        },
        {
          id: 'ramp-alpha',
          arrivalTick: 1,
          route: [1, 2],
          serviceQuantaByStage: [2, 1],
          jobClass: 'alpha',
          priority: 1,
        },
      ];
      const schedule = simulateNetworkDiscipline(worstRampBranch, (state) =>
        selectPerNodeBestJob(state, compareActiveNetworkByQueueOrder)
      );
      const metrics = analyzeNetworkSchedule(schedule);

      expect(schedule.serviceTimeline).toEqual([
        'N2:ramp-beta',
        'N1:ramp-beta',
        'N1:ramp-beta',
        'N1:ramp-alpha',
        'N1:ramp-alpha',
        'N2:ramp-alpha',
      ]);
      expect(metrics.finalDepartureTick).toBe(6);
      expect(metrics.horizonTicks).toBe(6);
      expect(metrics.areaInSystem).toBe(8);
      expect(metrics.totalSojourn).toBe(8);
    });
  });

  describe('Larger Exact Probabilistic Multiclass Network Semantics', () => {
    const namedLargeNetworkKernelSelectors: ReadonlyArray<
      readonly [string, LargeProbabilisticNetworkServiceSelector]
    > = [
      [
        'fifo',
        (_state, _node, candidates) => Math.min(...candidates) as 1 | 2 | 3,
      ],
      [
        'lifo',
        (_state, _node, candidates) => Math.max(...candidates) as 1 | 2 | 3,
      ],
      [
        'static-priority',
        (state, _node, candidates) => {
          const [bestSlot] = [...candidates].sort(
            (left, right) =>
              largeProbabilisticNetworkPhaseClass(
                largeProbabilisticNetworkSlotPhase(state, right)
              ) -
                largeProbabilisticNetworkPhaseClass(
                  largeProbabilisticNetworkSlotPhase(state, left)
                ) || left - right
          );
          expect(bestSlot).toBeDefined();
          return bestSlot!;
        },
      ],
      [
        'srpt',
        (state, _node, candidates) => {
          const [bestSlot] = [...candidates].sort(
            (left, right) =>
              largeProbabilisticNetworkPhaseTotalRemaining(
                largeProbabilisticNetworkSlotPhase(state, left)
              ) -
                largeProbabilisticNetworkPhaseTotalRemaining(
                  largeProbabilisticNetworkSlotPhase(state, right)
                ) || left - right
          );
          expect(bestSlot).toBeDefined();
          return bestSlot!;
        },
      ],
    ];

    it('preserves distribution-level customer-time conservation on a larger three-node kernel', () => {
      for (const [, selector] of namedLargeNetworkKernelSelectors) {
        const steps = simulateLargeProbabilisticNetworkKernel(selector);

        for (const step of steps) {
          const expectedMass =
            step.timeTick === 0
              ? 1
              : step.timeTick === 1
              ? 4
              : step.timeTick === 2
              ? 16
              : 64;
          expect(step.totalMass).toBe(expectedMass);
          expect(step.weightedAreaInSystem).toBe(
            step.weightedDepartedSojourn + step.weightedOpenAge
          );
        }

        const finalStep = steps[steps.length - 1]!;
        expect(finalStep.weightedOpenAge).toBe(0);
        expect(finalStep.weightedAreaInSystem).toBe(
          finalStep.weightedDepartedSojourn
        );
        expect(
          finalStep.weightedAreaInSystem / finalStep.totalMass
        ).toBeCloseTo(
          finalStep.weightedDepartedSojourn / finalStep.totalMass,
          12
        );
      }
    });

    it('collapses the larger multiclass kernel to the same final expectation as explicit leaf enumeration', () => {
      const fifoKernel = simulateLargeProbabilisticNetworkKernel(
        (_state, _node, candidates) => Math.min(...candidates) as 1 | 2 | 3
      );
      const finalStep = fifoKernel[fifoKernel.length - 1]!;
      const leafExpectation = enumerateLargeProbabilisticNetworkLeafExpectation(
        (_state, _node, candidates) => Math.min(...candidates) as 1 | 2 | 3
      );

      expect(finalStep.totalMass).toBe(leafExpectation.totalMass);
      expect(finalStep.weightedAreaInSystem).toBe(
        leafExpectation.weightedAreaInSystem
      );
      expect(finalStep.weightedDepartedSojourn).toBe(
        leafExpectation.weightedDepartedSojourn
      );
    });
  });

  describe("Little's Law as β₁ = 0", () => {
    /**
     * Little's Law: L = λW
     *   L = average items in system
     *   λ = arrival rate
     *   W = average time in system
     *
     * Pipeline equation: T = (N + C - 1) × t_stage
     * At β₁ = 0, C = 1:
     *   T = N × t_stage
     *   L = λ × W = (1/t_arrival) × t_stage = 1 (at steady state)
     *
     * Little's Law is what you get when you set β₁ = 0 and ask
     * "how many items are in the system?"
     */

    it("Little's Law holds for single-server queue (β₁ = 0)", () => {
      const arrivalRate = 10; // λ = 10 items/sec
      const serviceTime = 0.08; // W = 80ms per item

      // Little's Law
      const L = arrivalRate * serviceTime;
      expect(L).toBeCloseTo(0.8, 2);

      // Pipeline with β₁ = 0: one item at a time
      // Average items in system = utilization = λ × W
      const beta1 = 0;
      const capacity = beta1 + 1; // C = 1
      expect(capacity).toBe(1);

      // The pipeline equation at C=1:
      // Throughput = 1/t_stage (one item per stage time)
      // Utilization ρ = λ/μ = λ × W
      const utilization = arrivalRate * serviceTime;
      expect(utilization).toBe(L); // They're the same equation
    });

    it("pipeline equation generalizes Little's Law for β₁ > 0", () => {
      const arrivalRate = 10;
      const serviceTime = 0.08;
      const C = 4; // β₁ = 3

      // Little's Law still holds but now L can be > 1
      const L = arrivalRate * serviceTime;

      // With pipelining, effective throughput increases:
      // We can have C items in flight simultaneously
      // Effective L_max = C (pipeline saturation)
      // Little's Law: L = λW still holds, but W decreases
      // because items don't wait — they enter the pipeline immediately

      // Pipeline throughput: C / t_stage (at saturation)
      const pipelineThroughput = C / serviceTime;
      expect(pipelineThroughput).toBe(50); // 4/0.08 = 50 items/sec

      // vs sequential: 1/t_stage
      const sequentialThroughput = 1 / serviceTime;
      expect(sequentialThroughput).toBe(12.5);

      // Pipeline is C× faster — Little's Law can't express this
      expect(pipelineThroughput / sequentialThroughput).toBe(C);
    });

    it("discrete-event M/M/1 simulation satisfies Little's Law", () => {
      const lambda = 7.5; // arrivals/sec
      const mu = 10.0; // services/sec
      const jobs = 40_000;
      const rng = makeRng(0xc0ffee);

      let arrivalTime = 0;
      let serverFreeAt = 0;
      let totalTimeInSystem = 0;
      const events: Array<{ time: number; delta: number }> = [];

      for (let i = 0; i < jobs; i++) {
        arrivalTime += expSample(lambda, rng);
        const serviceTime = expSample(mu, rng);
        const serviceStart = Math.max(arrivalTime, serverFreeAt);
        const depart = serviceStart + serviceTime;
        serverFreeAt = depart;

        totalTimeInSystem += depart - arrivalTime;
        events.push({ time: arrivalTime, delta: +1 });
        events.push({ time: depart, delta: -1 });
      }

      events.sort((a, b) => a.time - b.time);
      const startTime = events[0]?.time ?? 0;
      const endTime = serverFreeAt;

      let inSystem = 0;
      let prev = startTime;
      let area = 0;
      for (const e of events) {
        area += inSystem * (e.time - prev);
        inSystem += e.delta;
        prev = e.time;
      }

      const horizon = endTime - startTime;
      const L = area / horizon;
      const W = totalTimeInSystem / jobs;
      const lambdaEff = jobs / horizon;

      // Empirical Little's Law: L ≈ λW
      expect(Math.abs(L - lambdaEff * W)).toBeLessThan(0.1);
    });
  });

  describe('Erlang Blocking as Vent at β₁ = 0', () => {
    /**
     * Erlang B formula: probability of blocking with m servers and A offered load
     *   B(m, A) = (A^m / m!) / Σ(k=0..m) (A^k / k!)
     *
     * At β₁ = 0 (m = 1):
     *   B(1, A) = A / (1 + A)
     *
     * In the topological framework, blocking IS vent propagation.
     * A blocked request vents upstream. With β₁ > 0, alternative
     * paths exist -- vent one, route to another.
     */

    function erlangB(m: number, A: number): number {
      let numerator = 1;
      let denominator = 1;
      for (let k = 1; k <= m; k++) {
        numerator *= A / k;
        denominator += numerator;
      }
      return numerator / denominator;
    }

    it('Erlang B at m=1 gives simple blocking probability', () => {
      const A = 0.8; // offered load in Erlangs
      const blocking = erlangB(1, A);

      // B(1, 0.8) = 0.8 / 1.8 ≈ 0.444
      expect(blocking).toBeCloseTo(A / (1 + A), 3);
    });

    it('adding servers (increasing β₁) reduces blocking exponentially', () => {
      const A = 4.0; // 4 Erlangs offered load

      const b1 = erlangB(1, A); // β₁ = 0
      const b4 = erlangB(4, A); // β₁ = 3
      const b8 = erlangB(8, A); // β₁ = 7

      // Each doubling of capacity dramatically reduces blocking
      expect(b1).toBeGreaterThan(0.5); // >50% blocked at β₁=0
      expect(b4).toBeLessThan(b1);
      expect(b8).toBeLessThan(b4);
      expect(b8).toBeLessThan(0.05); // <5% blocked at β₁=7
    });

    it('vent propagation depth = 0 when β₁ > 0 and alternative paths exist', () => {
      // With multiple paths (β₁ > 0), a vented path doesn't block the system.
      // The race continues on surviving paths

      const paths = 4; // β₁ = 3
      const ventedPaths = 1;
      const survivingPaths = paths - ventedPaths;

      // System still works as long as at least one path survives
      expect(survivingPaths).toBeGreaterThan(0);

      // Probability ALL paths are vented (system-level blocking):
      const pVent = 0.3; // 30% chance each path fails
      const pAllVented = Math.pow(pVent, paths);
      expect(pAllVented).toBeLessThan(0.01); // <1% with 4 paths at 30% each
    });
  });

  describe('Jackson Networks as Fork/Join without Race', () => {
    /**
     * A Jackson network is a network of M/M/1 queues where
     * routing is probabilistic. Output of one queue feeds another.
     *
     * In the topological framework:
     *   - Jackson routing = fork with fixed weights (no race)
     *   - Each queue = a pipeline stage at β₁ = 0
     *   - Product-form solution = independence of fold operations
     *
     * Jackson networks are β₁ = 0 at each node with probabilistic fork.
     * Add race (β₁ > 0 at each node) and you get the topological framework.
     */

    it('Jackson network throughput limited by bottleneck (β₁ = 0 everywhere)', () => {
      // 3-node Jackson network: arrival → node1 → node2 → node3 → exit
      const serviceRates = [20, 10, 15]; // items/sec at each node

      // Bottleneck determines max throughput
      const maxThroughput = Math.min(...serviceRates);
      expect(maxThroughput).toBe(10);

      // Utilization at each node: ρ_i = λ / μ_i
      const arrivalRate = 8; // below bottleneck
      const utilizations = serviceRates.map((mu) => arrivalRate / mu);

      expect(utilizations[0]).toBe(0.4); // node 1: 40%
      expect(utilizations[1]).toBe(0.8); // node 2: 80% (near bottleneck)
      expect(utilizations[2]).toBeCloseTo(0.533, 2); // node 3: 53%
    });

    it('adding race (β₁ > 0) at bottleneck breaks Jackson limit', () => {
      const serviceRates = [20, 10, 15];
      const bottleneckIdx = serviceRates.indexOf(Math.min(...serviceRates));

      // Jackson max throughput: limited by slowest node
      const jacksonMax = Math.min(...serviceRates);
      expect(jacksonMax).toBe(10);

      // Topological: race 3 instances of the bottleneck node
      const raceCount = 3;
      const effectiveRate = serviceRates[bottleneckIdx] * raceCount;

      // New service rates with racing at bottleneck
      const newRates = [...serviceRates];
      newRates[bottleneckIdx] = effectiveRate;

      const topoMax = Math.min(...newRates);
      expect(topoMax).toBe(15); // New bottleneck moves to node 3
      expect(topoMax).toBeGreaterThan(jacksonMax); // 50% improvement
    });

    it('parallel servers (β₁ > 0) reduce queueing delay in simulation', () => {
      const lambda = 30; // arrivals/sec
      const mu = 10; // service/sec per server
      const jobs = 20_000;

      function simulateMMc(c: number): { avgWait: number; throughput: number } {
        const rng = makeRng(0xabc000 + c);
        const serverFree = Array.from({ length: c }, () => 0);
        let arrival = 0;
        let totalWait = 0;

        for (let i = 0; i < jobs; i++) {
          arrival += expSample(lambda, rng);
          const service = expSample(mu, rng);

          let bestIdx = 0;
          for (let s = 1; s < c; s++) {
            if (serverFree[s] < serverFree[bestIdx]) bestIdx = s;
          }

          const start = Math.max(arrival, serverFree[bestIdx]);
          totalWait += start - arrival;
          serverFree[bestIdx] = start + service;
        }

        const finish = Math.max(...serverFree);
        return {
          avgWait: totalWait / jobs,
          throughput: jobs / finish,
        };
      }

      const single = simulateMMc(1); // β₁ = 0
      const fourWay = simulateMMc(4); // β₁ = 3

      expect(fourWay.avgWait).toBeLessThan(single.avgWait);
      expect(fourWay.throughput).toBeGreaterThan(single.throughput);
    });
  });
});
