# Chapter 17 Hetero MoA Fabric Curvature Figure

- Label: `ch17-hetero-moa-fabric-curvature-figure-v1`
- Primitive: `HeteroMoAFabric`
- Lanes: CPU 2, GPU 1, NPU 1, WASM 1 (5 total; 10 mirrored kernels)
- Scheduling: `cannon`, launch gate `armed`, hedge delay `1`, hedge policy `skip-on-sufficient`
- Stream protocol: `aeon-10-byte-binary`
- Community memory: `QDoc decay`
- Curvature view: `curved meta-laminar envelope`, `backend helix lanes`, `paired-kernel snap`, `global race collapse`

Interpretation: this paper-facing supplement reuses the wraparound curvature grammar from the whipped `StructuredMoA` figure, but bends CPU, GPU, NPU, and WASM/browser lanes into one stretched spring. The meta layer races whole device classes, each lane contains a mirrored primary/shadow pair, and the bottom snap is the single global fold where loser bytes, skipped hedges, and vent share become measurable.

## Layer Bindings

- CPU control helix: 2 lane(s); bindings native threads, command CUDA fallback
- GPU wave helix: 1 lane(s); bindings WebGPU, CUDA-style runner
- NPU route helix: 1 lane(s); bindings WebNN, vendor NPU runner
- WASM browser helix: 1 lane(s); bindings WASM, browser worker

## Source Surfaces

- Lowering: `open-source/gnosis/src/structured-primitives.ts`
- Runtime: `open-source/gnosis/src/runtime/hetero-fabric.ts`
- Benchmark: `open-source/gnosis/src/benchmarks/hetero-moa-fabric-benchmark.ts`

