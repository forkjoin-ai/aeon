# Compiler Family Shootout: Real Compilers, Real Data

- **label**: ch17-compiler-family-shootout-v2
- **source**: `open-source/gnosis/src/benchmarks/compiler-phase-benchmark.ts`
- **formal surface**: `SelfHostingOptimality.lean`, `HumanCompiler.lean`, `OptimalityUndecidable.lean`, `GodGap.lean`
- **compilers**: aeon-logic (regex), Betti (self-hosted), Franky (polyglot), Beckett (transport), Betty (full verification)
- **every call is real**: no simulations, no proxies, no language costumes
- **iterations**: 50 (10 warmup)

## Compiler Ranking (averaged across all topologies)

| Rank | Compiler | Mean (ms) | God Gap (us) | % of slowest |
|------|----------|-----------|-------------|-------------|
| 1 | aeon-logic | 0.049 | 0 | 18.1% |
| 2 | Betti | 0.067 | 18 | 24.5% |
| 3 | Franky | 0.100 | 51 | 36.7% |
| 4 | Beckett | 0.127 | 78 | 46.6% |
| 5 | Betty | 0.273 | 224 | 100.0% |

## God Gap (microseconds, per topology)

| Compiler | betti.gg | franky.gg | beckett.gg | inline-s | inline-m | inline-l |
|----------|----------|-----------|------------|----------|----------|----------|
| aeon-logic | **0** | **0** | **0** | 1 | 4 | 18 |
| Betti | 52 | 68 | 7 | **0** | **0** | **0** |
| Franky | 28 | 163 | 63 | 5 | 16 | 53 |
| Beckett | 59 | 216 | 89 | 5 | 26 | 93 |
| Betty | 347 | 284 | 156 | 68 | 107 | 400 |

## Forest Convergence (real compilers, 30 iterations/race)

| Topology | Gens | Rejections | Betti | aeon-logic | Betty |
|----------|------|-----------|-------|------------|-------|
| betti.gg | 2 | 60 | 13 | 1 (trace) | 1 (void) |
| franky.gg | 2 | 180 | 43 | 1 (engine) | 1 (self) |
| beckett.gg | 2 | 84 | 19 | 1 (metrics) | 1 (feedback) |

## Meta-Iteration (3 passes, all identical)

Every pass produces the same mix. Immediate meta-convergence. 324 total rejections across nine passes. Zero oscillation. The fixed point is real and stable.

## Seven-Runtime Polyglot Race (10,000 iterations)

| Rank | Runtime | betti.gg | franky.gg | beckett.gg | Key data structure |
|------|---------|----------|-----------|------------|-------------------|
| 1 | Rust | **17.5 us** | **90.0 us** | **37.7 us** | HashMap |
| 2 | TypeScript (V8) | 39.6 us | 160.1 us | 73.0 us | V8 Map |
| 3 | Go | 41.8 us | 207.1 us | 77.4 us | map |
| 4 | Python (CPython) | 54.7 us | 255.4 us | 112.7 us | dict |
| 5 | LuaJIT | 105.6 us | 485.1 us | 198.8 us | table |
| 6 | Lua 5.4 | 134.2 us | 592.4 us | 254.5 us | table |
| 7 | C | 285.3 us | 324.4 us | 292.4 us | linear scan |

Binary sizes: C 35KB (last), Rust 1.1MB (first), Go 3.3MB (third). Inverted: bigger binary = faster parse. Python beat C. V8 tied Go. Lua and LuaJIT slower than Python. The right data structure (hash map) matters more than the language.

## Interpretation

With real compilers, the signal is clean. Betti dominates the data path. aeon-logic wins measurement nodes. Betty wins self-reference nodes. The diversity is structural. Meta-convergence is immediate because the timing differences between real compilers are large and stable -- no sub-microsecond noise from simulated strategies.
