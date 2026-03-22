# Chapter 17 Reader-Facing Reference Implementations

- Parent volume README: [README.md](./README.md)
- Companion TypeScript reference: [companion-tests/src/wallington-worthington-reference.ts](./companion-tests/src/wallington-worthington-reference.ts)
- Gnosis Wallington primitive example: [../../../../gnosis/examples/transformer/wallington-rotation.gg](../../../../gnosis/examples/transformer/wallington-rotation.gg)
- Gnosis Worthington primitive example: [../../../../gnosis/examples/transformer/worthington-whip.gg](../../../../gnosis/examples/transformer/worthington-whip.gg)
- Gnosis verification suite: [../../../../gnosis/examples/transformer/wallington-worthington-reference.test.gg](../../../../gnosis/examples/transformer/wallington-worthington-reference.test.gg)

This note keeps the two Chapter 17 pipeline ideas concrete for readers who want a stripped-down implementation instead of the full scheduler or the larger benchmark topologies.

## Wallington Rotation

The idea is simple:

1. Split one workload into `B = floor(P/N)` chunks.
2. Let chunk `c` enter stage `0`.
3. On the next tick, move chunk `c` to stage `1` and let chunk `c + 1` enter stage `0`.
4. Keep shifting until every chunk has crossed every stage.

### TypeScript

```ts
const rotated = wallingtonRotation(
  [1, 2, 3, 4, 5, 6, 7, 8],
  [
    (chunk) => chunk.map((value) => value + 1),
    (chunk) => chunk.map((value) => value * 2),
    (chunk) => chunk.map((value) => value - 3),
  ],
);

console.log(rotated.output);
console.log(formatWallingtonSchedule(rotated));
```

The full reader-facing implementation is in [companion-tests/src/wallington-worthington-reference.ts](./companion-tests/src/wallington-worthington-reference.ts).

### Gnosis

```gg
(prompt: FlowFrame { role: 'prompt-sequence', items: '8' })
(rotated_output: WallingtonRotation { stages: '4', chunks: '4', stageNames: '[embed,attend,ffn,project]' })
(prompt)-[:PROCESS]->(rotated_output)
```

The full topology is in [../../../../gnosis/examples/transformer/wallington-rotation.gg](../../../../gnosis/examples/transformer/wallington-rotation.gg), and it now uses the first-class `WallingtonRotation` primitive instead of spelling the lowered graph out by hand.

## Worthington Whip

The idea is:

1. Split one workload into `S` shards.
2. Run a Wallington rotation inside each shard pipeline.
3. Collapse the shard outputs at one fold boundary.

### TypeScript

```ts
const whipped = worthingtonWhip([1, 2, 3, 4, 5, 6, 7, 8], {
  shardCount: 2,
  stages: [
    (chunk) => chunk.map((value) => value + 10),
    (chunk) => chunk.map((value) => value * 2),
  ],
  collapse: concatenateCollapse,
});

console.log(whipped.collapsedOutput);
```

The same file, [companion-tests/src/wallington-worthington-reference.ts](./companion-tests/src/wallington-worthington-reference.ts), exports the Whip reference and the default concatenation collapse.

### Gnosis

```gg
(prompt: FlowFrame { role: 'prompt-sequence', items: '8' })
(collapsed_output: WorthingtonWhip { shardCount: '2', stages: '2', chunks: '2', shardNames: '[left,right]', stageNames: '[encode,project]' })
(prompt)-[:PROCESS]->(collapsed_output)
```

The full topology is in [../../../../gnosis/examples/transformer/worthington-whip.gg](../../../../gnosis/examples/transformer/worthington-whip.gg), where the first-class `WorthingtonWhip` primitive lowers into shard-local `WallingtonRotation` subgraphs plus one collapse. The paired verification suite is [../../../../gnosis/examples/transformer/wallington-worthington-reference.test.gg](../../../../gnosis/examples/transformer/wallington-worthington-reference.test.gg).

## Compiler Family Shootout

Five compilers race on every `.gg` input. Best per node wins.

- Benchmark harness: [../../../../gnosis/src/benchmarks/compiler-phase-benchmark.ts](../../../../gnosis/src/benchmarks/compiler-phase-benchmark.ts)
- Benchmark tests (18 tests): [../../../../gnosis/src/benchmarks/compiler-phase-benchmark.test.ts](../../../../gnosis/src/benchmarks/compiler-phase-benchmark.test.ts)

### Forest Convergence Engine

Per-node polyglot racing with the sliver (+1). Meta-iteration runner for repeatable science.

- Convergence loop: [../../../../gnosis/src/forest/convergence-loop.ts](../../../../gnosis/src/forest/convergence-loop.ts)
- Winner composition: [../../../../gnosis/src/forest/compose-winners.ts](../../../../gnosis/src/forest/compose-winners.ts)
- Meta-iteration runner: [../../../../gnosis/src/forest/iterate.ts](../../../../gnosis/src/forest/iterate.ts)
- Types: [../../../../gnosis/src/forest/types.ts](../../../../gnosis/src/forest/types.ts)
- Forest tests (11 tests): [../../../../gnosis/src/forest/convergence-loop.test.ts](../../../../gnosis/src/forest/convergence-loop.test.ts)

### Named Compiler Topologies

- Betty: [../../../../gnosis/src/betty/compiler.ts](../../../../gnosis/src/betty/compiler.ts) (13-phase verification pipeline)
- Betti: [../../../../gnosis/betti.gg](../../../../gnosis/betti.gg) + [../../../../gnosis/src/betti/bootstrap.ts](../../../../gnosis/src/betti/bootstrap.ts) (self-hosted, 3/3 optimal)
- Franky: [../../../../gnosis/examples/franky.gg](../../../../gnosis/examples/franky.gg) (polyglot ditto compiler)
- Beckett: [../../../../gnosis/examples/beckett.gg](../../../../gnosis/examples/beckett.gg) (transport/streaming compiler)
- Converged outputs: `examples/betti-converged.gg`, `franky-converged.gg`, `beckett-converged.gg`

### Formal Surface (Lean 4)

- Self-hosting optimality (11 theorems): [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SelfHostingOptimality.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SelfHostingOptimality.lean)
- Humans are compilers (14 theorems): [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/HumanCompiler.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/HumanCompiler.lean)
- Optimality undecidable (10 theorems): [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/OptimalityUndecidable.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/OptimalityUndecidable.lean)
- The God Gap (8 theorems): [companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/GodGap.lean](./companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/GodGap.lean)
