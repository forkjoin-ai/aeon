# Gate 1 Wall-Clock Matrix

Distributed benchmark with live HTTP stage servers and impairment injection (RTT/jitter/loss).

## Execution

- Label: loopback-hard-workloads
- Mode: embedded-stage-servers
- Listen host: 127.0.0.1
- Advertise host: 127.0.0.1

## Verdict

- Overall Gate 1: **PASS**
- Primary cells passed: 4/4

## Matrix Results

| Cell | Primary | Trials | Seq p50 / p95 (ms) | Chunked p50 / p95 (ms) | Median Speedup (95% CI) | Median Improvement (95% CI, ms) | Pass |
|---|---|---:|---:|---:|---:|---:|---|
| md5-grind-n4-b8__rtt3-loss0 | yes | 4/4 | 385.58 / 398.31 | 35.46 / 46.51 | 11.148 (7.860 to 12.267) | 350.89 (329.49 to 367.51) | yes |
| md5-grind-n4-b8__rtt7-loss0 | yes | 4/4 | 980.80 / 1000.21 | 64.13 / 64.88 | 15.294 (14.693 to 17.013) | 916.67 (889.91 to 943.15) | yes |
| factor-semiprime-n4-b6__rtt3-loss0 | yes | 4/4 | 295.27 / 318.09 | 60.62 / 61.26 | 4.869 (4.710 to 5.423) | 234.54 (227.55 to 261.80) | yes |
| factor-semiprime-n4-b6__rtt7-loss0 | yes | 4/4 | 808.70 / 832.16 | 90.82 / 94.72 | 8.882 (8.497 to 9.516) | 716.76 (709.87 to 748.24) | yes |

## Gate Rule

- Cell pass requires zero failed trials plus 95% bootstrap CI lower bounds above no-improvement for both paired median speedup (>1.0) and paired median latency improvement (>0 ms).
- Gate 1 pass requires all primary cells to pass.
