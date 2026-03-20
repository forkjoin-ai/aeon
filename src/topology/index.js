/**
 * Topology Module — Betti Number Analysis and Topological Deficit Diagnostic
 *
 * Measures the shape of computation graphs and quantifies how far an
 * implementation deviates from its problem's natural topology.
 *
 * The topological deficit Δβ = β₁* - β₁ predicts real-world waste:
 *   Δβ = 0  → system operates at theoretical efficiency
 *   Δβ > 0  → measurable waste proportional to the deficit
 *
 * @see docs/ebooks/145-log-rolling-pipelined-prefill/ch17-arxiv-manuscript.md §6.12
 * @packageDocumentation
 */
export { TopologyAnalyzer } from './TopologyAnalyzer';
export { TopologySampler } from './TopologySampler';
export {
  adaptiveParallelismPolicy,
  beta2FromBandGap,
  classifyPipelineRegime,
  frontierFill,
  firstLawConserved,
  pipelineOccupancy,
  protocolDeficits,
  quantumDeficitIdentity,
  settlementDeficits,
  speculativeTreeExpectedAccepted,
  turbulentIdleFraction,
  worthingtonWhipSavings,
} from './formal-claims';
export {
  GNOSIS_IMPOSSIBLE_SYSTEM_TOPOLOGIES,
  getGnosisImpossibleSystemTopology,
} from './gnosis-impossible-systems';
export {
  DEFAULT_SPECULATION_BUDGET,
  canonicalizeFeatureFlags,
  computeProjectionCacheKey,
  createProjectionArtifactId,
  matchesRequestGuard,
  normalizeRequestSignature,
  requestSignatureKey,
  stableContentHash,
} from './projection';
