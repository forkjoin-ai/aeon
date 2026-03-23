# ch17-wallington-rotation-positive-deficit-site.gg

- Origin: `repo-file`
- Source path: /Users/buley/Documents/Code/emotions/open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-wallington-rotation-positive-deficit-site.gg
- Updated: `2026-03-22T22:39:11.484Z`
- Nodes: `13`
- Edges: `15`
- Diagnostics: `3`
- β₁: `0`
- Buley measure: `7.50`

## Witness Surface

### collapsed_output
- Primitive: `WallingtonRotation`
- Path count: `4`
- Stream count: `2`
- Δβ: `2`
- Regime: `collision_and_information_loss_forced`
- Theorem: `Positive Deficit Forces Collision and Information Loss` (`aeon_flux_site_positive_deficit_forces_collision_and_information_loss`)
- Chunk nodes: collapsed_output__chunk_0, collapsed_output__chunk_1, collapsed_output__chunk_2, collapsed_output__chunk_3
- Stage nodes: embed, attend, ffn, project

## Lowered Source
```gg
// ch17-wallington-rotation-positive-deficit-site.gg
// Minimal reviewer-facing lowered WallingtonRotation site with more exposed
// chunk paths than transport streams, used to emit the positive-deficit
// witness cited by the flagship manuscript.

(prompt: FlowFrame { role: 'prompt-sequence', items: '8' })
(collapsed_output__ingress: FlowFrame { role: 'wallington-rotation-ingress', primitive: 'WallingtonRotation' })
(collapsed_output__scheduler: RotationScheduler { schedule: 'wallington_rotation', stages: '4', chunks: '2', role: 'wallington-rotation' })
(collapsed_output__chunk_0: EncoderChunk { ordinal: '0' })
(collapsed_output__chunk_1: EncoderChunk { ordinal: '1' })
(collapsed_output__chunk_2: EncoderChunk { ordinal: '2' })
(collapsed_output__chunk_3: EncoderChunk { ordinal: '3' })
(collapsed_output__stage_aligned: FlowFrame { role: 'stage-aligned-chunks', primitive: 'WallingtonRotation' })
(embed: EncoderShard { stage: 'embed', parameters: '1', stage_index: '0' })
(attend: EncoderShard { stage: 'attend', parameters: '1', stage_index: '1' })
(ffn: EncoderShard { stage: 'ffn', parameters: '1', stage_index: '2' })
(project: EncoderShard { stage: 'project', parameters: '1', stage_index: '3' })
(collapsed_output: FlowFrame { primitive: 'WallingtonRotation', schedule: 'wallington_rotation', stages: '4', chunks: '2', role: 'collapsed-output' })

(collapsed_output__ingress)-[:PROCESS]->(collapsed_output__scheduler)
(collapsed_output__scheduler)-[:FORK { schedule: 'wallington_rotation' }]->(collapsed_output__chunk_0 | collapsed_output__chunk_1 | collapsed_output__chunk_2 | collapsed_output__chunk_3)
(collapsed_output__chunk_0 | collapsed_output__chunk_1 | collapsed_output__chunk_2 | collapsed_output__chunk_3)-[:FOLD { strategy: 'chunk-order' }]->(collapsed_output__stage_aligned)
(collapsed_output__stage_aligned)-[:PROCESS]->(embed)
(embed)-[:PROCESS]->(attend)
(attend)-[:PROCESS]->(ffn)
(ffn)-[:PROCESS]->(project)
(project)-[:PROCESS]->(collapsed_output)

(prompt)-[:PROCESS]->(collapsed_output__ingress)
```
