# Fork/Race/Collapse Is All You Need — Companion Tests

- Parent volume README: [open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/README.md](../README.md)
- Live docs home: [docs.aeonflux.dev](https://docs.aeonflux.dev)

Reproducible test suite for the claims in the arXiv manuscript.

## Quick Start

```bash
bun install
bun test
```

## Test Sections (mapped to paper sections)

| Test File | Paper Section | What It Proves |
|-----------|--------------|----------------|
| `pipeline-topology.test.ts` | §1.1 The Triangle, §3 Pipeline Equation | Order preservation, β₁ lifecycle, Re phase transitions |
| `flow-protocol.test.ts` | §8 The Wire, §8.2.1 Self-Describing Frames | 10-byte framing, fork/race/collapse/poison on wire |
| `topological-compression.test.ts` | §8.6 Topological Compression | Per-chunk adaptive codec selection, subsumption |
| `queueing-subsumption.test.ts` | §5 End of Queueing Theory | Little's Law as β₁=0 degenerate case |
| `shootoff.test.ts` | §8.5 Shootoff Benchmarks | Protocol comparison with real compression |

## Running Individual Sections

```bash
bun test:pipeline      # §1.1, §3
bun test:flow          # §8
bun test:compression   # §8.6
bun test:shootoff      # §8.5
bun test:queueing      # §5
```

## Dependencies

This test suite depends on `@anthropic-ai/aeon`, the open-source protocol library implementing the flow protocol, topological compressor, and codec registry described in the paper.
