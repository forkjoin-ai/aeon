/**
 * TopologySampler — Runtime sampling of topological deficit
 *
 * Instruments a live system by recording fork/race/fold/vent events
 * and periodically computing the topological deficit. Produces a
 * time-series of Betti numbers and deficit measurements.
 *
 * Usage:
 *   const sampler = new TopologySampler({ intrinsicBeta1: 7 });
 *   sampler.fork('request-1', ['path-a', 'path-b', 'path-c']);
 *   sampler.race('request-1', 'path-a');  // path-a won
 *   sampler.vent('request-1', 'path-b');
 *   sampler.vent('request-1', 'path-c');
 *   sampler.fold('request-1');
 *   const report = sampler.report();
 *
 * Zero dependencies. Works everywhere.
 */
export interface SamplerConfig {
  /** The problem's intrinsic β₁* */
  intrinsicBeta1: number;
  /** Maximum number of samples to retain (ring buffer). Default: 1000 */
  maxSamples?: number;
}
/** A single point-in-time sample */
export interface Sample {
  /** Timestamp (ms since epoch) */
  timestamp: number;
  /** Number of active forks at this moment */
  activeForks: number;
  /** Total parallel paths across all active forks */
  activeParallelPaths: number;
  /** Instantaneous β₁ (sum of parallelPaths - 1 per active fork) */
  beta1: number;
  /** Instantaneous deficit: β₁* - β₁ */
  deficit: number;
  /** Instantaneous utilization: β₁ / β₁* */
  utilization: number;
  /** Cumulative forks emitted */
  totalForks: number;
  /** Cumulative folds completed */
  totalFolds: number;
  /** Cumulative vents */
  totalVents: number;
  /** Cumulative races won */
  totalRaces: number;
}
/** Aggregate report over all samples */
export interface SamplerReport {
  /** Problem's intrinsic β₁* */
  intrinsicBeta1: number;
  /** Number of samples collected */
  sampleCount: number;
  /** Time-weighted average β₁ */
  meanBeta1: number;
  /** Peak β₁ observed */
  peakBeta1: number;
  /** Time-weighted average deficit */
  meanDeficit: number;
  /** Time-weighted average utilization (0–1) */
  meanUtilization: number;
  /** Peak utilization observed */
  peakUtilization: number;
  /** Total forks / folds / vents / races */
  totals: {
    forks: number;
    folds: number;
    vents: number;
    races: number;
  };
  /** Vent ratio: vents / (vents + races). Higher = more exploration, lower = more exploitation */
  ventRatio: number;
  /** Thermodynamic efficiency estimate: races / (races + vents) ≈ W / (W + Q) */
  efficiency: number;
  /** Human-readable assessment */
  assessment: string;
  /** All retained samples (for plotting) */
  samples: Sample[];
}
export declare class TopologySampler {
  private readonly config;
  private readonly activeForks;
  private readonly samples;
  private totalForks;
  private totalFolds;
  private totalVents;
  private totalRaces;
  constructor(config: SamplerConfig);
  /**
   * Record a fork event: one computation splits into N parallel paths.
   */
  fork(id: string, paths: string[]): void;
  /**
   * Record a race result: one path won.
   */
  race(id: string, winnerPath: string): void;
  /**
   * Record a vent: a path was released (didn't win, errored, timed out).
   */
  vent(id: string, path: string): void;
  /**
   * Record a fold: computation merged to a single result.
   */
  fold(id: string): void;
  /**
   * Take a snapshot without recording an event (for periodic sampling).
   */
  sample(): Sample;
  /**
   * Get the current instantaneous deficit.
   */
  currentDeficit(): number;
  /**
   * Get the current instantaneous β₁.
   */
  currentBeta1(): number;
  /**
   * Generate the aggregate report.
   */
  report(): SamplerReport;
  /**
   * Reset all state.
   */
  reset(): void;
  private recordSample;
}
