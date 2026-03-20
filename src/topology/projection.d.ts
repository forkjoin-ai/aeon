export type FragmentKind = 'html' | 'css' | 'js' | 'asset' | 'esi';
export type FragmentObservabilityClass =
  | 'critical'
  | 'visible'
  | 'supporting'
  | 'deferred'
  | 'opaque';
export type FragmentEffectClass = 'inert' | 'effectful' | 'unknown';
export type ProjectionProofLevel =
  | 'none'
  | 'strong-html-css'
  | 'conservative-js';
export interface RequestGuard {
  routes?: string[];
  locales?: string[];
  authTiers?: string[];
  featureFlags?: string[];
  deviceBuckets?: string[];
  viewportBuckets?: string[];
}
export interface FragmentRuntimeTemplate {
  envelopeCid: string;
  ownerDid: string;
  parentFragmentId?: string;
  childOfApp?: boolean;
  supervisorStrategy?: 'one_for_one' | 'one_for_all' | 'rest_for_one';
  appAeonPid?: string;
  fragmentAeonPid?: string;
}
export interface FragmentNode {
  id: string;
  kind: FragmentKind;
  contentHash: string;
  dependencyIds: string[];
  requestGuard: RequestGuard;
  observabilityClass: FragmentObservabilityClass;
  effectClass?: FragmentEffectClass;
  proofMetadata: {
    level: ProjectionProofLevel;
    reason: string;
    bounded: boolean;
  };
  provenance: {
    sourcePath?: string;
    sourcePaths?: string[];
    buildHash?: string;
    route?: string;
    generatedAt: string;
  };
  contentType: string;
  content?: string;
  metadata?: Record<string, string>;
  runtimeTemplate?: FragmentRuntimeTemplate;
}
export interface ProjectionArtifact {
  artifactId: string;
  buildHash: string;
  fragmentGraph: {
    nodes: FragmentNode[];
    entrypoints: Record<string, string>;
  };
  guardSchema: {
    routes: boolean;
    locales: boolean;
    authTiers: boolean;
    featureFlags: boolean;
    deviceBuckets: boolean;
    viewportBuckets: boolean;
  };
  provenance: {
    generatedAt: string;
    ownerDid?: string;
    sourceRoot?: string;
    appAeonPid?: string;
  };
  proofMetadata: {
    maxLevel: ProjectionProofLevel;
    htmlCssClosedWorld: boolean;
    jsConservative: boolean;
  };
}
export interface RequestSignature {
  route: string;
  locale: string;
  authTier: string;
  featureFlags: string[];
  deviceBucket: string;
  viewportBucket?: string;
}
export interface ProjectedAssetPayload {
  path: string;
  contentType: string;
  body: string;
  etag: string;
}
export interface ProjectionResult {
  selectedFragmentIds: string[];
  proofLevel: ProjectionProofLevel;
  cacheKey: string;
  html?: string;
  css?: string;
  js: Array<{
    fragmentId: string;
    path: string;
    content: string;
    effectClass: FragmentEffectClass;
  }>;
  assets: ProjectedAssetPayload[];
  speculativeChildren: string[];
}
export interface SpeculationBudget {
  maxProjectedVariants: number;
  maxAnalysisTimeMs: number;
  maxCacheBytes: number;
  minConfidence: number;
}
export declare const DEFAULT_SPECULATION_BUDGET: SpeculationBudget;
export declare function stableContentHash(content: string): string;
export declare function createProjectionArtifactId(
  buildHash: string,
  nodes: readonly FragmentNode[]
): string;
export declare function canonicalizeFeatureFlags(
  featureFlags: readonly string[]
): string[];
export declare function normalizeRequestSignature(
  signature: RequestSignature
): RequestSignature;
export declare function requestSignatureKey(
  signature: RequestSignature
): string;
export declare function computeProjectionCacheKey(
  artifact: Pick<ProjectionArtifact, 'artifactId' | 'buildHash'>,
  signature: RequestSignature
): string;
export declare function matchesRequestGuard(
  guard: RequestGuard,
  signature: RequestSignature
): boolean;
