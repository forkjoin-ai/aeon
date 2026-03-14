# Chapter 17 Gate 1 Wall-Clock Figure

- Label: `ch17-gate1-wallclock-figure-v1`
- Source: `workers-dev-external-multihost6-distinct`
- Execution mode: `external-endpoints`
- Distinct endpoint hosts: `6`
- Primary cells passed: `8/8`
- Speedup median range: `11.785x` to `21.62x`
- Minimum speedup CI low: `11.365x`
- Minimum latency-improvement CI low: `3561 ms`

## Cells

| Cell | Workload | Network | Primary | Seq p50 (ms) | Chunked p50 (ms) | Median Speedup (95% CI) | Median Improvement (95% CI, ms) |
|---|---|---|---|---:|---:|---:|---:|
| prompt24-n4-b6__rtt1-loss0 | 24 tok • 4 nodes • B6 | RTT 1 ms • loss 0% | no | 3924 | 331.57 | 11.98x (11.732x to 12.694x) | 3596 (3561 to 3752) |
| prompt24-n4-b6__rtt3-loss0 | 24 tok • 4 nodes • B6 | RTT 3 ms • loss 0% | yes | 4154 | 349.6 | 11.912x (11.618x to 12.521x) | 3811 (3596 to 4251) |
| prompt24-n4-b6__rtt3-loss2pct | 24 tok • 4 nodes • B6 | RTT 3 ms • loss 2% | yes | 4322 | 357.29 | 12.098x (11.365x to 13.612x) | 3964 (3573 to 4579) |
| prompt24-n4-b6__rtt7-loss0 | 24 tok • 4 nodes • B6 | RTT 7 ms • loss 0% | yes | 4353 | 372.12 | 11.785x (11.508x to 12.198x) | 3988 (3920 to 4069) |
| prompt24-n4-b6__rtt7-loss2pct | 24 tok • 4 nodes • B6 | RTT 7 ms • loss 2% | yes | 4325 | 358.39 | 12.159x (11.698x to 12.422x) | 3968 (3904 to 4053) |
| prompt36-n6-b9__rtt1-loss0 | 36 tok • 6 nodes • B9 | RTT 1 ms • loss 0% | no | 8814 | 432.98 | 20.163x (19.721x to 20.96x) | 8370 (8281 to 8473) |
| prompt36-n6-b9__rtt3-loss0 | 36 tok • 6 nodes • B9 | RTT 3 ms • loss 0% | yes | 8827 | 446.75 | 20.125x (19.565x to 21.583x) | 8381 (8281 to 8926) |
| prompt36-n6-b9__rtt3-loss2pct | 36 tok • 6 nodes • B9 | RTT 3 ms • loss 2% | yes | 9104 | 464.19 | 19.154x (18.165x to 20.048x) | 8627 (8406 to 8730) |
| prompt36-n6-b9__rtt7-loss0 | 36 tok • 6 nodes • B9 | RTT 7 ms • loss 0% | yes | 10428 | 488.53 | 21.62x (20.11x to 23.016x) | 9945 (9443 to 10764) |
| prompt36-n6-b9__rtt7-loss2pct | 36 tok • 6 nodes • B9 | RTT 7 ms • loss 2% | yes | 10215 | 481.71 | 21.042x (20.879x to 24.439x) | 9734 (9558 to 10849) |

Interpretation: the figure pairs a log-scale p50 latency dumbbell with speedup confidence intervals so the deployment-level separation is visible without collapsing the result into a single summary number.
