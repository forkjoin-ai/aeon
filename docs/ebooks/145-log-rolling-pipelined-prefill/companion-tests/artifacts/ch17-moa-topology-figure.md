# Chapter 17 MoA Topology Figure

- Label: `ch17-moa-topology-figure-v1`
- Primitive: `StructuredMoA`
- Sparse GG topology: `/Users/buley/Documents/Code/emotions/open-source/gnosis/examples/benchmarks/moa-transformer-moa.gg`
- Dense GG topology: `/Users/buley/Documents/Code/emotions/open-source/gnosis/examples/benchmarks/moa-transformer-regular.gg`
- Outer Wallington stages/chunks: `4` / `2`
- Sparse block activity: `2/4`
- Sparse head activity per live block: `2/4`

## Sparse StructuredMoA

- Live blocks: `blk A, blk B`; suppressed blocks: `blk C, blk D`
- Live heads: `h1, h2`; suppressed heads: `h3, h4`

## Dense rotated baseline

- Live blocks: `blk A, blk B, blk C, blk D`
- Live heads: `h1, h2, h3, h4`

## Legend

- Active: solid edges show live routed paths
- Suppressed: dashed edges show suppressed sparse paths

Interpretation: this figure isolates the executable topology itself rather than the benchmark metrics. The sparse panel shows one `2-of-4` router realization of `StructuredMoA`, with `2-of-4` heads live inside each selected block; the dense panel shows the matched `4-of-4` baseline with the same Wallington outer/inner rotations and Worthington inner/outer whips but no suppression.

