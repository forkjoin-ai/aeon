# Crypto

- Parent README: [../README.md](../README.md)

This directory contains Aeon's injected cryptography surface plus the
data-first manifest consumed by the logic-first cover-space analyzer. The
manifest taxonomy now spans bounded offline-risk findings and adjacent
recovery/trust corollaries even when Aeon itself does not yet emit those
families directly.

## Files

- [types.ts](./types.ts): UCAN, encryption, session, and Aeon-specific crypto
  type definitions.
- [CryptoProvider.ts](./CryptoProvider.ts): dependency-free provider contract and
  `NullCryptoProvider`.
- [AeonCryptoProvider.ts](./AeonCryptoProvider.ts): default runtime-backed
  implementation.
- [transactionSigner.ts](./transactionSigner.ts): custodial signer abstraction
  and null adapter.
- [manifest.ts](./manifest.ts): method-level claims, capability requirements,
  produced artifacts, and allowed downgrade boundaries for logic-first audit
  alignment.
- [index.ts](./index.ts): public exports.
