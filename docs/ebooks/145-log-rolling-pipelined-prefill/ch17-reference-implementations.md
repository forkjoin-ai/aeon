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
