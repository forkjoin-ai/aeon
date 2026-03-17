# Aeon

A TypeScript toolkit for collaborative systems. At its center: **Aeon Flow**, a multiplexed frame protocol for moving many independent streams over one transport.

The package covers ground teams usually assemble themselves: transport, sync, offline queues, compression, presence, versioning, persistence, crypto, and topology analysis.

## Install

```bash
bun add @affectively/aeon
```

```bash
npm install @affectively/aeon   # or yarn / pnpm
```

## Aeon Flow

One connection. Many independent streams. Less waiting behind unrelated work.

```text
┌──────────────────────────────────────────────────────────┐
│                   10-byte Flow Frame                     │
├──────────┬──────────┬───────┬────────────────────────────┤
│ stream_id│ sequence │ flags │ length    │    payload ...  │
│  (u16)   │  (u32)   │ (u8)  │ (u24)    │                 │
└──────────┴──────────┴───────┴────────────────────────────┘
```

- Streams progress independently -- no head-of-line blocking
- Frames can arrive out of order and reassemble correctly
- Protocol overhead stays small (10 bytes per frame)
- Same framing works across UDP, WebSocket, WebTransport, IPC

The UDP path includes MTU-aware fragmentation, ACK bitmaps, AIMD congestion control, and per-stream reassembly.

### Quick Start: Flow Protocol

```ts
import { AeonFlowProtocol, UDPFlowTransport } from '@affectively/aeon';

// Set up transport
const transport = new UDPFlowTransport({
  host: '0.0.0.0',
  port: 4242,
  remoteHost: 'target.example.com',
  remotePort: 4242,
  reliable: true,
});
await transport.bind();

// Create protocol instance
const flow = new AeonFlowProtocol(transport, {
  role: 'client',
  maxConcurrentStreams: 256,
});

// Open a parent stream and fork 3 children
const parentId = flow.open();
const childIds = flow.fork(parentId, 3);

// Race: first child to complete wins, losers are vented
const { winner, result } = await flow.race(childIds);

// Or fold: wait for all, merge results
const merged = await flow.fold(childIds, (results) => {
  // results: Map<streamId, Uint8Array>
  return concatBuffers([...results.values()]);
});
```

### Quick Start: Sync Coordination

```ts
import { SyncCoordinator } from '@affectively/aeon';

const coordinator = new SyncCoordinator();

coordinator.registerNode({
  id: 'node-1',
  address: 'localhost',
  port: 3000,
  status: 'online',
  lastHeartbeat: new Date().toISOString(),
  version: '1.0.0',
  capabilities: ['sync', 'replicate'],
});

const session = coordinator.createSyncSession('node-1', ['node-2', 'node-3']);
```

### Quick Start: Schema Migrations

```ts
import { MigrationEngine } from '@affectively/aeon';

const engine = new MigrationEngine();

engine.registerMigration({
  id: 'add-status-field',
  version: '2.0.0',
  name: 'Add user status field',
  up: (data) => ({ ...data, status: 'active' }),
  down: (data) => {
    const { status, ...rest } = data;
    return rest;
  },
  timestamp: new Date().toISOString(),
  description: 'Adds status field to all user records',
});
```

## Modules

Everything is available from the root import. Subpath imports are available for tree-shaking:

| Import | What it does |
|--------|-------------|
| `@affectively/aeon` | Everything (barrel export) |
| `@affectively/aeon/core` | Core types and interfaces |
| `@affectively/aeon/distributed` | Sync coordination, replication, conflict resolution |
| `@affectively/aeon/versioning` | Schema versions, migrations, tracking |
| `@affectively/aeon/offline` | Queued work for unreliable or offline periods |
| `@affectively/aeon/compression` | Compression and delta-sync helpers |
| `@affectively/aeon/persistence` | In-memory and storage adapter surfaces |
| `@affectively/aeon/presence` | Real-time node and session state |
| `@affectively/aeon/crypto` | Signing and UCAN-related primitives |

The flow protocol, topology analysis, transport helpers, and federation modules are exported from the root barrel.

## Related Packages

| Package | Description |
|---------|-------------|
| [`@affectively/aeon-pipelines`](https://github.com/forkjoin-ai/aeon-pipelines) | Execution engine for fork/race/fold as computation primitives (race on speed, value, or any lambda) |
| [`packages/shootoff`](./packages/shootoff/README.md) | Side-by-side protocol benchmarks against HTTP/1.1 and HTTP/2 |
| [`packages/wall`](./packages/wall/README.md) | Command-line client for Aeon Flow |
| `packages/nginx-flow-aeon` | nginx bridge for Aeon Flow behind HTTP infrastructure |
| [`aeon-bazaar`](https://github.com/forkjoin-ai/aeon-bazaar) | Unbounded negotiation engine -- void walking, complement distributions |
| [`aeon-neutral`](https://github.com/forkjoin-ai/aeon-neutral) | Bounded dispute resolution -- three-walker Skyrms mediation with convergence certificates |

## Formal Surface

TLA+ specifications for negotiation convergence (in `companion-tests/formal/`):

| Spec | What it models |
|------|---------------|
| `NegotiationConvergence.tla` | Single-party fork/race/fold with BATNA threshold |
| `MetacognitiveWalker.tla` | c0-c3 cognitive loop, kurtosis convergence |
| `SkyrmsNadir.tla` | Two walkers converging via accumulated failure |
| `SkyrmsThreeWalker.tla` | Mediator as third walker on the convergence site |

## Documentation

- [docs/README.md](./docs/README.md) -- repo docs index
- [Manuscript source](./docs/ebooks/145-log-rolling-pipelined-prefill/ch17-arxiv-manuscript.md) -- Chapter 17 formal manuscript
- [Companion tests](./docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/README.md) -- reproducibility suite
- [ROADMAP.md](./ROADMAP.md) -- near-term direction

## License

Copyright Taylor William Buley. All rights reserved.

MIT
