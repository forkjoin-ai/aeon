# Chapter 17 Inverted-Scaling and Reynolds Figure

- Label: `ch17-inverted-scaling-reynolds-figure-v1`
- Speedup formula: `Speedup = (P × N) / (C + N - 1)`
- Idle formula: `idle = (N - 1) / (C + N - 1)`
- Reynolds formula: `Re = N / C`
- Balanced-chunk rule: Left-panel curves use the balanced-chunk cross-section C = N to expose the inverted-scaling slope directly.
- Stage families: `2, 4, 8, 10`; workload sweep `10` to `512` items
- Reynolds sweep: `0.1` to `20`; idle range `6.98%` to `94%`

## Scenarios

| Scenario | P | N | C | Speedup | Re | Idle | Regime |
|---|---:|---:|---:|---:|---:|---:|---|
| 14 tokens / 2 nodes | 14 | 2 | 7 | 3.111x | 0.286 | 12.5% | laminar |
| 100 tokens / 4 nodes | 100 | 4 | 4 | 57.14x | 1 | 42.9% | turbulent |
| 500 tokens / 8 nodes | 500 | 8 | 8 | 266.7x | 1 | 46.7% | turbulent |
| 100 tokens / 10 nodes | 100 | 10 | 10 | 52.63x | 1 | 47.4% | turbulent |
| 95 resources / HTTP-1.1 | n/a | 95 | 6 | n/a | 15.83 | 94% | turbulent |
| 95 resources / Aeon Flow | n/a | 95 | 256 | n/a | 0.371 | 26.9% | transitional |

Interpretation: the left panel isolates the inverted-scaling story under the balanced-chunk cross-section, while the right panel maps the same chunk-count language into laminar/transitional/turbulent bands and overlays the manuscript scenarios plus the HTTP/1.1 vs Aeon Flow transport example.
