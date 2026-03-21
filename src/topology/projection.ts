import { createHash } from 'node:crypto';

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

export const DEFAULT_SPECULATION_BUDGET: SpeculationBudget = {
  maxProjectedVariants: 3,
  maxAnalysisTimeMs: 50,
  maxCacheBytes: 512 * 1024,
  minConfidence: 0.25,
};

export function stableContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function createProjectionArtifactId(
  buildHash: string,
  nodes: readonly FragmentNode[]
): string {
  return `projection:${stableContentHash(
    `${buildHash}:${nodes.map((node) => node.contentHash).join(':')}`
  )}`;
}

export function canonicalizeFeatureFlags(
  featureFlags: readonly string[]
): string[] {
  return [
    ...new Set(featureFlags.map((flag) => flag.trim()).filter(Boolean)),
  ].sort();
}

export function normalizeRequestSignature(
  signature: RequestSignature
): RequestSignature {
  return {
    ...signature,
    route: signature.route || '/',
    locale: signature.locale || 'und',
    authTier: signature.authTier || 'anonymous',
    deviceBucket: signature.deviceBucket || 'desktop',
    featureFlags: canonicalizeFeatureFlags(signature.featureFlags),
    viewportBucket: signature.viewportBucket || undefined,
  };
}

export function requestSignatureKey(signature: RequestSignature): string {
  const normalized = normalizeRequestSignature(signature);
  return [
    normalized.route,
    normalized.locale,
    normalized.authTier,
    normalized.deviceBucket,
    normalized.viewportBucket ?? 'any',
    normalized.featureFlags.join(','),
  ].join('|');
}

export function computeProjectionCacheKey(
  artifact: Pick<ProjectionArtifact, 'artifactId' | 'buildHash'>,
  signature: RequestSignature
): string {
  return stableContentHash(
    `${artifact.artifactId}:${artifact.buildHash}:${requestSignatureKey(
      signature
    )}`
  );
}

export function matchesRequestGuard(
  guard: RequestGuard,
  signature: RequestSignature
): boolean {
  const normalized = normalizeRequestSignature(signature);

  if (guard.routes?.length && !guard.routes.includes(normalized.route)) {
    return false;
  }
  if (guard.locales?.length && !guard.locales.includes(normalized.locale)) {
    return false;
  }
  if (
    guard.authTiers?.length &&
    !guard.authTiers.includes(normalized.authTier)
  ) {
    return false;
  }
  if (
    guard.deviceBuckets?.length &&
    !guard.deviceBuckets.includes(normalized.deviceBucket)
  ) {
    return false;
  }
  if (
    guard.viewportBuckets?.length &&
    !guard.viewportBuckets.includes(normalized.viewportBucket ?? '')
  ) {
    return false;
  }
  if (guard.featureFlags?.length) {
    for (const flag of guard.featureFlags) {
      if (!normalized.featureFlags.includes(flag)) {
        return false;
      }
    }
  }

  return true;
}
