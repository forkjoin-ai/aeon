import { createHash } from 'node:crypto';
export const DEFAULT_SPECULATION_BUDGET = {
  maxProjectedVariants: 3,
  maxAnalysisTimeMs: 50,
  maxCacheBytes: 512 * 1024,
  minConfidence: 0.25,
};
export function stableContentHash(content) {
  return createHash('sha256').update(content).digest('hex');
}
export function createProjectionArtifactId(buildHash, nodes) {
  return `projection:${stableContentHash(
    `${buildHash}:${nodes.map((node) => node.contentHash).join(':')}`
  )}`;
}
export function canonicalizeFeatureFlags(featureFlags) {
  return [
    ...new Set(featureFlags.map((flag) => flag.trim()).filter(Boolean)),
  ].sort();
}
export function normalizeRequestSignature(signature) {
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
export function requestSignatureKey(signature) {
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
export function computeProjectionCacheKey(artifact, signature) {
  return stableContentHash(
    `${artifact.artifactId}:${artifact.buildHash}:${requestSignatureKey(
      signature
    )}`
  );
}
export function matchesRequestGuard(guard, signature) {
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
