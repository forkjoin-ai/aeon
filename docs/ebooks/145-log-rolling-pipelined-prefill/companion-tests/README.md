# Fork/Race/Collapse Is All You Need — Companion Tests

- Parent volume README: [open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/README.md](../README.md)
- Live docs home: [docs.aeonflux.dev](https://docs.aeonflux.dev)
- Formal artifacts: [formal/README.md](./formal/README.md)
- Script helpers: [scripts/README.md](./scripts/README.md)

Reproducible test suite for the claims in the arXiv manuscript.

## Quick Start

```bash
bun install
bun run test
bun run test:formal:parser
bun run test:formal
```

## Test Sections (mapped to paper sections)

| Test File | Paper Section | What It Proves |
|-----------|--------------|----------------|
| `pipeline-topology.test.ts` | §1.1 The Triangle, §3 Pipeline Equation | Order preservation, β₁ lifecycle, Re phase transitions |
| `flow-protocol.test.ts` | §8 The Wire, §8.2.1 Self-Describing Frames | 10-byte framing, fork/race/collapse/poison on wire |
| `topological-compression.test.ts` | §8.6 Topological Compression | Per-chunk adaptive codec selection, subsumption |
| `thermodynamics.test.ts` | §6 Thermodynamics | First Law accounting, Carnot/Shannon bounds, ground-state overhead |
| `queueing-subsumption.test.ts` | §5 End of Queueing Theory | Little's Law as β₁=0 degenerate case |
| `shootoff.test.ts` | §8.5 Shootoff Benchmarks | Protocol comparison with real compression |
| `formal/*.tla` + TLC | §2.5, §6.11–§6.12, §7, §8.3 | Mechanized checks for C1–C4, §7 formulas, quantum/topology deficits, protocol/settlement deficits, and band-gap voids |
| `formal-parser-compat.test.ts` + `scripts/validate-formal-artifacts.ts` | §11 Validation | Self-hosted `aeon-logic` parsing + round-trip validation for all `.tla/.cfg` artifacts |

## Running Individual Sections

```bash
bun test:pipeline      # §1.1, §3
bun test:flow          # §8
bun test:compression   # §8.6
bun test:thermodynamics # §6
bun test:shootoff      # §8.5
bun test:queueing      # §5
bun test:formal:parser # aeon-logic parser preflight for formal artifacts
bun test:formal        # all formal models via TLC
bun test:formal:shootoff # parser throughput vs Java baseline
bun test:all           # vitest suite + TLA+ model check
```

## Dependencies

This test suite depends on `@anthropic-ai/aeon` (runtime protocol/compression primitives) and `@affectively/aeon-logic` (self-hosted TLC/TLA parser + formal compatibility adapters).
