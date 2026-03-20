/**
 * TopologyAnalyzer — Compute Betti numbers and topological deficit for DAGs
 *
 * Given a computation graph (nodes + edges), computes:
 *   β₀ = connected components (independent computations)
 *   β₁ = independent cycles / parallel paths (parallelism)
 *   β₂ = voids (unreachable states)
 *
 * Then compares actual β₁ to the problem's intrinsic β₁* to produce
 * the topological deficit Δβ — a quantitative measure of wasted parallelism.
 *
 * Zero dependencies. Works everywhere.
 */
/** A node in the computation graph */
export interface ComputationNode {
  /** Unique identifier */
  id: string;
  /** Optional label for diagnostics */
  label?: string;
  /** Node type for structural analysis */
  type?: 'source' | 'sink' | 'fork' | 'join' | 'process';
}
/** A directed edge in the computation graph */
export interface ComputationEdge {
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Optional label */
  label?: string;
}
/** The computation graph to analyze */
export interface ComputationGraph {
  nodes: ComputationNode[];
  edges: ComputationEdge[];
  /** The problem's intrinsic Betti number — how parallel the problem COULD be */
  intrinsicBeta1?: number;
}
/** Betti numbers of a computation graph */
export interface BettiNumbers {
  /** β₀: connected components (independent computations) */
  beta0: number;
  /** β₁: independent cycles (parallel paths through fork/join pairs) */
  beta1: number;
  /** β₂: voids (estimated from unreachable states in the DAG) */
  beta2: number;
}
/** A detected fork/join pair in the graph */
export interface ForkJoinPair {
  /** The fork node (where paths diverge) */
  forkNode: string;
  /** The join node (where paths converge) */
  joinNode: string;
  /** Number of parallel paths between fork and join */
  parallelPaths: number;
  /** Contribution to β₁ (parallelPaths - 1) */
  beta1Contribution: number;
}
/** Report on topological deficit */
export interface DeficitReport {
  /** The problem's intrinsic β₁* */
  intrinsicBeta1: number;
  /** The implementation's actual β₁ */
  actualBeta1: number;
  /** Δβ = β₁* - β₁ (0 = optimal, >0 = wasted parallelism). Measured in Bules. */
  deficit: number;
  /** Utilization ratio: β₁ / β₁* (1.0 = fully utilizing natural parallelism) */
  utilization: number;
  /** Human-readable assessment */
  assessment: string;
}
/** Complete topology report */
export interface TopologyReport {
  /** Betti numbers */
  betti: BettiNumbers;
  /** Detected fork/join pairs */
  forkJoinPairs: ForkJoinPair[];
  /** Topological deficit (only if intrinsicBeta1 was provided) */
  deficit?: DeficitReport;
  /** Node count */
  nodeCount: number;
  /** Edge count */
  edgeCount: number;
  /** Is the graph a DAG? */
  isDAG: boolean;
  /** Pipeline Reynolds number estimate (stages / chunks) */
  reynoldsEstimate?: number;
}
export declare class TopologyAnalyzer {
  /**
   * Analyze a computation graph and produce a full topology report.
   */
  static analyze(graph: ComputationGraph): TopologyReport;
  /**
   * Quick deficit check — just the number, in Bules.
   * Returns Δβ = intrinsicBeta1 - actualBeta1.
   * 0 Bules = topology-matched. >0 Bules = wasted parallelism.
   * Negative means the system has MORE parallelism than needed (over-forking).
   */
  static deficit(graph: ComputationGraph, intrinsicBeta1: number): number;
  /**
   * Build a computation graph from a fork/race/fold description.
   * Convenience for common patterns.
   */
  static fromForkRaceFold(config: {
    /** Number of forked paths */
    forkWidth: number;
    /** Number of pipeline stages per path */
    stagesPerPath?: number;
    /** The problem's intrinsic β₁* */
    intrinsicBeta1?: number;
  }): ComputationGraph;
  /**
   * Build a sequential pipeline graph (β₁ = 0).
   * The degenerate case — Ford's assembly line.
   */
  static sequential(stages: number, intrinsicBeta1?: number): ComputationGraph;
}
