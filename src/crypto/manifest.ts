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

export const AEON_CRYPTO_METHOD_MANIFEST: readonly AeonCryptoMethodManifestEntry[] =
  [
    {
      method: 'generateIdentity',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity', 'capability-confinement'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['did', 'public-signing-key', 'public-encryption-key'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'getLocalDID',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['capability-confinement'],
      requiredCapabilities: [],
      producedArtifacts: ['did'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'exportPublicIdentity',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['public-identity'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'registerRemoteNode',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity', 'capability-confinement'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['remote-node-registry'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'getRemotePublicKey',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['remote-public-key'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'sign',
      interfaceName: 'ICryptoProvider',
      family: 'signing-custodial',
      claims: ['authenticity', 'integrity'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['signature'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'signData',
      interfaceName: 'ICryptoProvider',
      family: 'signing-custodial',
      claims: ['authenticity', 'integrity'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['signed-sync-data'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'verify',
      interfaceName: 'ICryptoProvider',
      family: 'signing-custodial',
      claims: ['authenticity', 'integrity'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['verification-result'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'verifySignedData',
      interfaceName: 'ICryptoProvider',
      family: 'signing-custodial',
      claims: ['authenticity', 'integrity'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['verification-result'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'encrypt',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['confidentiality', 'integrity'],
      requiredCapabilities: ['auth.zk'],
      producedArtifacts: ['encrypted-payload'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'decrypt',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['confidentiality', 'integrity'],
      requiredCapabilities: ['auth.zk'],
      producedArtifacts: ['plaintext'],
      allowedDowngradeBoundaries: ['oracle_leak', 'toy_break'],
    },
    {
      method: 'getSessionKey',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['confidentiality', 'non-replay'],
      requiredCapabilities: ['auth.zk'],
      producedArtifacts: ['session-key'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'encryptWithSessionKey',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['confidentiality', 'integrity', 'non-replay'],
      requiredCapabilities: ['auth.zk'],
      producedArtifacts: ['session-encrypted-payload'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'decryptWithSessionKey',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['confidentiality', 'integrity', 'non-replay'],
      requiredCapabilities: ['auth.zk'],
      producedArtifacts: ['plaintext'],
      allowedDowngradeBoundaries: ['oracle_leak', 'toy_break'],
    },
    {
      method: 'createUCAN',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity', 'capability-confinement', 'non-amplification'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['ucan-token'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'verifyUCAN',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity', 'capability-confinement'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['ucan-verification-result'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'delegateCapabilities',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['authenticity', 'capability-confinement', 'non-amplification'],
      requiredCapabilities: ['auth.ucan'],
      producedArtifacts: ['delegated-ucan-token'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'hash',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['integrity'],
      requiredCapabilities: [],
      producedArtifacts: ['digest'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'randomBytes',
      interfaceName: 'ICryptoProvider',
      family: 'aead-kem',
      claims: ['non-replay'],
      requiredCapabilities: [],
      producedArtifacts: ['random-bytes'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'isInitialized',
      interfaceName: 'ICryptoProvider',
      family: 'ucan-zk',
      claims: ['capability-confinement'],
      requiredCapabilities: [],
      producedArtifacts: ['initialization-state'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'execute',
      interfaceName: 'ITransactionSigner',
      family: 'signing-custodial',
      claims: ['authenticity', 'integrity', 'non-amplification'],
      requiredCapabilities: ['auth.custodial', 'auth.ucan'],
      producedArtifacts: ['transaction-response'],
      allowedDowngradeBoundaries: ['toy_break'],
    },
    {
      method: 'getSigner',
      interfaceName: 'ITransactionSigner',
      family: 'signing-custodial',
      claims: ['authenticity', 'capability-confinement'],
      requiredCapabilities: ['auth.custodial'],
      producedArtifacts: ['transaction-signer-metadata'],
      allowedDowngradeBoundaries: [],
    },
    {
      method: 'health',
      interfaceName: 'ITransactionSigner',
      family: 'signing-custodial',
      claims: ['capability-confinement'],
      requiredCapabilities: [],
      producedArtifacts: ['transaction-signer-health'],
      allowedDowngradeBoundaries: [],
    },
  ] as const;
