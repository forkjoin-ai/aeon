# Distributed Module

Parent: [../README.md](../README.md)

The distributed module contains Aeon's coordination surfaces:

- sync orchestration via `SyncCoordinator`
- replication policy and persistence via `ReplicationManager`
- protocol-level synchronization via `SyncProtocol`
- state reconciliation via `StateReconciler`
- request-recovery convergence via `RecoveryLedger`

`RecoveryLedger` is the monotone recovery-state primitive for sharded delivery. It merges request aliases, shard observations, and path outcomes without shared mutable state, then reports when the object family is reconstructable.
