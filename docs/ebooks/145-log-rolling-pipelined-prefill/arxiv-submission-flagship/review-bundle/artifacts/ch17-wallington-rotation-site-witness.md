# ch17-wallington-rotation-site.gg

- Origin: `repo-file`
- Source path: /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-site.gg
- Updated: `2026-03-22T22:21:09.810Z`
- Nodes: `13`
- Edges: `15`
- Diagnostics: `3`
- β₁: `0`
- Buley measure: `7.50`

## Witness Surface

### rotated_output
- Primitive: `WallingtonRotation`
- Path count: `4`
- Stream count: `4`
- Δβ: `0`
- Regime: `tight_lossless_transport_exists`
- Theorem: `Zero Deficit iff Tight Lossless Transport` (`aeon_flux_site_zero_deficit_iff_tight_lossless_transport`)
- Chunk nodes: rotated_output__chunk_0, rotated_output__chunk_1, rotated_output__chunk_2, rotated_output__chunk_3
- Stage nodes: embed, attend, ffn, project

## Lowered Source
```gg
// ch17-wallington-rotation-site.gg
// Minimal reviewer-facing WallingtonRotation source used to emit the
// Aeon Flux site witness cited by the flagship manuscript.

(prompt: FlowFrame { role: 'prompt-sequence', items: '8' })
// WallingtonRotation 'rotated_output' expanded into chunked stage-pipeline topology.
(rotated_output__ingress: FlowFrame { role: 'wallington-rotation-ingress', primitive: 'WallingtonRotation' })
(rotated_output__scheduler: RotationScheduler { schedule: 'wallington_rotation', stages: '4', chunks: '4', role: 'wallington-rotation' })
(rotated_output__chunk_0: EncoderChunk { ordinal: '0' })
(rotated_output__chunk_1: EncoderChunk { ordinal: '1' })
(rotated_output__chunk_2: EncoderChunk { ordinal: '2' })
(rotated_output__chunk_3: EncoderChunk { ordinal: '3' })
(rotated_output__stage_aligned: FlowFrame { role: 'stage-aligned-chunks', primitive: 'WallingtonRotation' })
(embed: EncoderShard { stage: 'embed', parameters: '1', stage_index: '0' })
(attend: EncoderShard { stage: 'attend', parameters: '1', stage_index: '1' })
(ffn: EncoderShard { stage: 'ffn', parameters: '1', stage_index: '2' })
(project: EncoderShard { stage: 'project', parameters: '1', stage_index: '3' })
(rotated_output: FlowFrame { primitive: 'WallingtonRotation', schedule: 'wallington_rotation', stages: '4', chunks: '4', role: 'rotated-output' })
(rotated_output__ingress)-[:PROCESS]->(rotated_output__scheduler)
(rotated_output__scheduler)-[:FORK { schedule: 'wallington_rotation' }]->(rotated_output__chunk_0 | rotated_output__chunk_1 | rotated_output__chunk_2 | rotated_output__chunk_3)
(rotated_output__chunk_0 | rotated_output__chunk_1 | rotated_output__chunk_2 | rotated_output__chunk_3)-[:FOLD { strategy: 'chunk-order' }]->(rotated_output__stage_aligned)
(rotated_output__stage_aligned)-[:PROCESS]->(embed)
(embed)-[:PROCESS]->(attend)
(attend)-[:PROCESS]->(ffn)
(ffn)-[:PROCESS]->(project)
(project)-[:PROCESS]->(rotated_output)

(prompt)-[:PROCESS]->(rotated_output__ingress)
```
