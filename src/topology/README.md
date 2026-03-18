# Topology

Parent: [../README.md](../README.md)

Topology contracts, projection artifacts, and the shape-level analysis surfaces that sit above raw transport.

These modules also define the explicit package subpaths consumed by the rest of the stack:

- `@a0n/aeon/topology/object`
- `@a0n/aeon/topology/projection`

## Files

- `TopologyAnalyzer.ts`: Betti-number and deficit analysis for computation graphs.
- `TopologySampler.ts`: sampling helpers for topology reports and runtime traces.
- `formal-claims.ts`: named topology-level formulas and protocol claims.
- `gnosis-impossible-systems.ts`: catalog of Gnosis impossible-system witness topologies.
- `projection.ts`: fragment-graph projection artifact and request-signature contracts.
- `object.ts`: shared `aeon-object/v1` envelope types for identity, witness, storage, replication, and materialized projections.
- `index.ts`: public exports for the topology package surface.
