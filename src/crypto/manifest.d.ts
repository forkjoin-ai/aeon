/**
 * Aeon Crypto Method Manifest
 *
 * A data-first contract surface for cover-space analysis. Each entry names the
 * intended security claims, effect requirements, emitted artifacts, and the
 * downgrade boundaries that remain acceptable for bounded toy calibration.
 */
export type AeonCryptoManifestFamily =
  | 'ucan-zk'
  | 'aead-kem'
  | 'signing-custodial'
  | 'recovery-trust';
export type AeonCryptoManifestClaim =
  | 'confidentiality'
  | 'integrity'
  | 'authenticity'
  | 'non-replay'
  | 'non-amplification'
  | 'capability-confinement';
export type AeonCryptoManifestWeakness =
  | 'missing_capability'
  | 'wildcard_capability'
  | 'zk_downgrade'
  | 'replay'
  | 'nonce_reuse'
  | 'key_substitution'
  | 'delegation_amplification'
  | 'proof_bypass'
  | 'oracle_leak'
  | 'fast_hash_surface'
  | 'unsalted_digest'
  | 'low_work_factor'
  | 'digest_truncation'
  | 'helpdesk_bypass'
  | 'single_approver_path'
  | 'approval_amplification'
  | 'silent_recovery_path'
  | 'recovery_without_reproof'
  | 'audit_suppression'
  | 'stale_trust_edge'
  | 'cross_channel_identity_drift'
  | 'toy_break';
export interface AeonCryptoMethodManifestEntry {
  readonly method: string;
  readonly interfaceName: 'ICryptoProvider' | 'ITransactionSigner';
  readonly family: AeonCryptoManifestFamily;
  readonly claims: readonly AeonCryptoManifestClaim[];
  readonly requiredCapabilities: readonly string[];
  readonly producedArtifacts: readonly string[];
  readonly allowedDowngradeBoundaries: readonly AeonCryptoManifestWeakness[];
}
export declare const AEON_CRYPTO_METHOD_MANIFEST: readonly AeonCryptoMethodManifestEntry[];
