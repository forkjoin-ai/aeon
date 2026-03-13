# Gate 1 Wall-Clock Matrix

Distributed benchmark with live HTTP stage servers and impairment injection (RTT/jitter/loss).

## Execution

- Label: workers-dev-external-multihost6-distinct
- Mode: external-endpoints
- Listen host: 127.0.0.1
- Advertise host: 127.0.0.1
- External endpoints provided: 6
- Distinct endpoint hosts: 6
- Endpoint hosts: aeon-gate1-mh0.taylorbuley.workers.dev, aeon-gate1-mh1.taylorbuley.workers.dev, aeon-gate1-mh2.taylorbuley.workers.dev, aeon-gate1-mh3.taylorbuley.workers.dev, aeon-gate1-mh4.taylorbuley.workers.dev, aeon-gate1-mh5.taylorbuley.workers.dev

## Verdict

- Overall Gate 1: **PASS**
- Primary cells passed: 8/8

## Matrix Results

| Cell | Primary | Trials | Seq p50 / p95 (ms) | Chunked p50 / p95 (ms) | Median Speedup (95% CI) | Median Improvement (95% CI, ms) | Pass |
|---|---|---:|---:|---:|---:|---:|---|
| prompt24-n4-b6__rtt1-loss0 | no | 8/8 | 3923.99 / 4312.89 | 331.57 / 337.05 | 11.980 (11.732 to 12.694) | 3596.44 (3560.98 to 3751.95) | yes |
| prompt24-n4-b6__rtt3-loss0 | yes | 8/8 | 4153.87 / 4820.87 | 349.60 / 367.62 | 11.912 (11.618 to 12.521) | 3811.40 (3595.81 to 4251.21) | yes |
| prompt24-n4-b6__rtt3-loss2pct | yes | 8/8 | 4321.59 / 5179.45 | 357.29 / 389.71 | 12.098 (11.365 to 13.612) | 3964.30 (3572.97 to 4578.81) | yes |
| prompt24-n4-b6__rtt7-loss0 | yes | 8/8 | 4353.19 / 4951.78 | 372.12 / 384.05 | 11.785 (11.508 to 12.198) | 3987.54 (3920.36 to 4069.17) | yes |
| prompt24-n4-b6__rtt7-loss2pct | yes | 8/8 | 4324.91 / 4456.59 | 358.39 / 382.57 | 12.159 (11.698 to 12.422) | 3968.09 (3904.13 to 4053.00) | yes |
| prompt36-n6-b9__rtt1-loss0 | no | 8/8 | 8813.82 / 9723.85 | 432.98 / 455.39 | 20.163 (19.721 to 20.960) | 8369.79 (8280.53 to 8472.53) | yes |
| prompt36-n6-b9__rtt3-loss0 | yes | 8/8 | 8827.36 / 10261.37 | 446.75 / 479.21 | 20.125 (19.565 to 21.583) | 8380.61 (8281.11 to 8926.42) | yes |
| prompt36-n6-b9__rtt3-loss2pct | yes | 8/8 | 9104.46 / 9243.37 | 464.19 / 678.63 | 19.154 (18.165 to 20.048) | 8626.83 (8406.11 to 8730.09) | yes |
| prompt36-n6-b9__rtt7-loss0 | yes | 8/8 | 10427.67 / 12091.98 | 488.53 / 521.79 | 21.620 (20.110 to 23.016) | 9944.95 (9443.39 to 10764.01) | yes |
| prompt36-n6-b9__rtt7-loss2pct | yes | 8/8 | 10214.99 / 12005.98 | 481.71 / 500.48 | 21.042 (20.879 to 24.439) | 9733.59 (9557.65 to 10849.26) | yes |

## Gate Rule

- Cell pass requires zero failed trials plus 95% bootstrap CI lower bounds above no-improvement for both paired median speedup (>1.0) and paired median latency improvement (>0 ms).
- Gate 1 pass requires all primary cells to pass.
