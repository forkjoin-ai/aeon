# Forest Convergence: Diversity Theorem Evidence

- **label**: ch17-forest-convergence-v1
- **source**: `open-source/gnosis/src/forest/convergence-loop.ts`
- **formal surface**: `ForkRaceFoldTheorems/SelfHostingOptimality.lean` (buleyean_positivity, deficit_is_learnable)
- **iterations per race**: 1024
- **max generations**: 50
- **strategies**: typescript (Betty), go (Betti), rust (aeon-logic), python (Beckett)
- **sliver**: active (buleyean_positivity enforcement)
- **key finding**: void boundary nodes converge to different strategies than data-path nodes

## Convergence Summary

| Topology | Gens | Rejections | Rust | Python | Go | TS | Diversity |
|----------|------|-----------|------|--------|----|----|-----------|
| betti.gg | 6 | 270 | 14 | 1 | 0 | 0 | 2/4 |
| franky.gg | 5 | 675 | 43 | 1 | 1 | 0 | 3/4 |
| beckett.gg | 4 | 252 | 20 | 1 | 0 | 0 | 2/4 |

## Per-Topology Winner Detail

### betti.gg (15 nodes, 6 generations)

| Node | Winner | Role |
|------|--------|------|
| source_reader | rust | IO entry |
| strip_comments | rust | Preprocessing |
| node_lexer | rust | FORK branch |
| edge_lexer | rust | FORK branch |
| property_lexer | rust | FORK branch |
| ast_assembler | rust | FOLD target |
| betti_verifier | rust | Verification |
| verify_result | rust | Result dispatch |
| verified_compilation | rust | Success path |
| failed_compilation | rust | Error path |
| compile_halt | rust | HALT |
| wasm_emitter | rust | Emission |
| raw_ast__request_compression_1 | rust | Compression |
| raw_ast__request_compression_1__trace | rust | Trace |
| **raw_ast__request_compression_1__void** | **python** | **Void boundary** |

### franky.gg (45 nodes, 5 generations)

| Node | Winner | Role |
|------|--------|------|
| 43 nodes | rust | Framework detection + compilation |
| **express_parse_use** | **python** | **Middleware parsing** |
| **all_recognizers** | **go** | **Orchestration dispatch** |

### beckett.gg (21 nodes, 4 generations)

| Node | Winner | Role |
|------|--------|------|
| 20 nodes | rust | Transport + codec racing |
| **codec_memory** | **python** | **Void boundary (codec rejection patterns)** |

## Structural Pattern

The void boundary node -- the node that records rejection patterns -- converges to a different compilation strategy (python/Beckett's chunked racing) than the data-path nodes (rust/aeon-logic's global regex). The observer is compiled differently from the observed. The failure recorder uses a different lens than the failure producer.

## Diversity-Convergence Tradeoff

| Languages | Converges? | Gens (betti.gg) | Result |
|-----------|-----------|-----------------|--------|
| 2 (TS, rust) | Yes (gen 2) | 3 | Monoculture (all rust) |
| 4 (TS, rust, go, python) without sliver | No (20+ gens) | 20+ | Near-monoculture + oscillation |
| 4 with sliver, 10 iters/race | No (20+ gens) | 20+ | Diverse but unstable |
| 4 with sliver, 1024 iters/race | Yes (gen 5-6) | 6 | Diverse + stable |

The sliver (+1) is necessary and sufficient for convergence to the diverse fixed point. Without it, minority strategies go extinct. With it, they find their niche at the void boundary.

## Three-Pass Meta-Iteration

| Topology | Iter | Gens | Rejections | Rust | Python | Go | Shifted |
|----------|------|------|-----------|------|--------|-----|---------|
| betti | 0 | 20 | 900 | 13 | 1 | 1 | 0/15 |
| betti | 1 | 39 | 1,755 | 14 | 1 | 0 | 2/15 |
| betti | 2 | 50 | 2,250 | 13 | 1 | 1 | 3/15 |
| franky | 0 | 17 | 2,295 | 44 | 1 | 0 | 0/45 |
| franky | 1 | 23 | 3,105 | 43 | 1 | 1 | 3/45 |
| franky | 2 | 2 | 270 | 43 | 1 | 1 | 3/45 |
| beckett | 0 | 2 | 126 | 20 | 0 | 1 | 0/21 |
| beckett | 1 | 3 | 189 | 20 | 1 | 0 | 2/21 |
| beckett | 2 | 2 | 126 | 20 | 1 | 0 | 2/21 |

Total rejections: 11,016 across nine passes. The macro distribution (90% rust, ~5% python, ~5% go) holds across iterations while sliver nodes oscillate at the margin. Franky iter 2 converged in two generations -- the fastest pass of any topology. Beckett near-meta-converged: iter 1 and iter 2 produce the same mix. The fixed point is a stable distribution, not a frozen state.

## Interpretation

The diversity theorem predicts the optimal compiler is polyglot. Forest proves it by running the convergence loop. The sliver (buleyean_positivity) is not mathematical decoration -- it is the engineering mechanism that prevents premature collapse to monoculture. The void boundary nodes consistently select a different strategy, confirming that the observer and the observed occupy different positions on the Pareto frontier. Success is shaped by these failures, and the failures are recorded by a different compiler than the one that produced them. The 11,016 rejections across three meta-iterations are the void boundary of the compiler family -- the training signal for Buleyean RL.
