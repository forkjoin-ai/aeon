export type GnosisImpossibleSystemId = 'edge-pipeline-parallelism' | 'audio-token-privacy' | 'crdt-split-brain-prevention' | 'webgpu-graph-flattening';
export interface GnosisImpossibleSystemTopology {
    readonly id: GnosisImpossibleSystemId;
    readonly title: string;
    readonly aeonSurface: 'flow' | 'topology' | 'federation';
    readonly gnosisExamplePath: string;
    readonly gnosisTestPath: string;
    readonly summary: string;
    readonly invariants: readonly string[];
}
export declare const GNOSIS_IMPOSSIBLE_SYSTEM_TOPOLOGIES: readonly [{
    readonly id: "edge-pipeline-parallelism";
    readonly title: "Edge Pipeline Parallelism";
    readonly aeonSurface: "federation";
    readonly gnosisExamplePath: "open-source/gnosis/examples/edge-pipeline-parallelism.gg";
    readonly gnosisTestPath: "open-source/gnosis/examples/impossible-systems.test.gg";
    readonly summary: "Models a 13B request folding across layer-sharded workers that relay quantized hidden state and race a warm standby for failover.";
    readonly invariants: readonly ["no single worker shard exceeds its annotated capacity", "the request still reaches a folded response under warm-standby failover"];
}, {
    readonly id: "audio-token-privacy";
    readonly title: "Audio Token Privacy";
    readonly aeonSurface: "flow";
    readonly gnosisExamplePath: "open-source/gnosis/examples/audio-token-privacy.gg";
    readonly gnosisTestPath: "open-source/gnosis/examples/impossible-systems.test.gg";
    readonly summary: "Models semantic, prosodic, and biometric token lanes, injecting noise into identity-bearing RVQ layers before anything is folded into the public mesh.";
    readonly invariants: readonly ["identity-bearing layers are noised before the public fold", "semantic and prosodic lanes remain part of the folded output"];
}, {
    readonly id: "crdt-split-brain-prevention";
    readonly title: "CRDT Split-Brain Prevention";
    readonly aeonSurface: "topology";
    readonly gnosisExamplePath: "open-source/gnosis/examples/crdt-split-brain-prevention.gg";
    readonly gnosisTestPath: "open-source/gnosis/examples/impossible-systems.test.gg";
    readonly summary: "Models geographically separated replicas, nonce-scoped replay guards, and deterministic CRDT observation collapsing to one canonical state.";
    readonly invariants: readonly ["replica writes carry distinct nonce identities", "deterministic CRDT observation collapses to one canonical state"];
}, {
    readonly id: "webgpu-graph-flattening";
    readonly title: "WebGPU Graph Flattening";
    readonly aeonSurface: "topology";
    readonly gnosisExamplePath: "open-source/gnosis/examples/webgpu-graph-flattening.gg";
    readonly gnosisTestPath: "open-source/gnosis/examples/impossible-systems.test.gg";
    readonly summary: "Models flattening a pointer-chasing object graph into a contiguous Float32Array path that races a scattered CPU walk.";
    readonly invariants: readonly ["the flattened buffer is contiguous Float32Array state", "the packed GPU path is explicit in the topology and races the scattered walk"];
}];
export declare function getGnosisImpossibleSystemTopology(id: GnosisImpossibleSystemId): GnosisImpossibleSystemTopology | undefined;
