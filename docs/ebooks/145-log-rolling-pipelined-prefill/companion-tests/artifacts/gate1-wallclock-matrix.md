# Gate 1 Wall-Clock Matrix

Distributed benchmark with live HTTP stage servers and impairment injection (RTT/jitter/loss).

## Execution

- Label: loopback-default
- Mode: embedded-stage-servers
- Listen host: 127.0.0.1
- Advertise host: 127.0.0.1

## Verdict

- Overall Gate 1: **PASS**
- Primary cells passed: 8/8

## Matrix Results

| Cell | Primary | Trials | Seq p50 / p95 (ms) | Chunked p50 / p95 (ms) | Median Speedup (95% CI) | Median Improvement (95% CI, ms) | Pass |
|---|---|---:|---:|---:|---:|---:|---|
| prompt24-n4-b6__rtt1-loss0 | no | 8/8 | 812.28 / 902.32 | 55.85 / 77.86 | 14.692 (11.138 to 16.761) | 765.11 (715.77 to 808.86) | yes |
| prompt24-n4-b6__rtt3-loss0 | yes | 8/8 | 832.05 / 1162.72 | 72.43 / 126.57 | 14.922 (9.006 to 17.601) | 762.31 (686.66 to 1039.95) | yes |
| prompt24-n4-b6__rtt3-loss2pct | yes | 8/8 | 734.48 / 1116.55 | 50.41 / 75.68 | 13.381 (11.147 to 17.004) | 689.13 (588.81 to 779.21) | yes |
| prompt24-n4-b6__rtt7-loss0 | yes | 8/8 | 1133.33 / 1207.41 | 82.87 / 93.26 | 13.612 (12.631 to 14.700) | 1041.06 (990.07 to 1089.66) | yes |
| prompt24-n4-b6__rtt7-loss2pct | yes | 8/8 | 1150.90 / 1259.13 | 90.42 / 102.21 | 12.642 (12.097 to 14.982) | 1062.26 (1027.57 to 1118.28) | yes |
| prompt36-n6-b9__rtt1-loss0 | no | 8/8 | 1357.08 / 1449.13 | 54.58 / 70.44 | 24.910 (21.934 to 25.563) | 1304.16 (1266.04 to 1335.75) | yes |
| prompt36-n6-b9__rtt3-loss0 | yes | 8/8 | 1335.52 / 1417.51 | 55.60 / 58.13 | 24.629 (23.331 to 25.252) | 1279.57 (1240.20 to 1334.81) | yes |
| prompt36-n6-b9__rtt3-loss2pct | yes | 8/8 | 1263.16 / 1324.52 | 55.00 / 78.77 | 22.577 (19.267 to 25.280) | 1208.88 (1191.24 to 1269.27) | yes |
| prompt36-n6-b9__rtt7-loss0 | yes | 8/8 | 4163.34 / 4885.22 | 146.47 / 399.08 | 27.223 (15.106 to 30.772) | 3966.37 (3116.58 to 4362.86) | yes |
| prompt36-n6-b9__rtt7-loss2pct | yes | 8/8 | 2564.42 / 3366.76 | 108.98 / 167.38 | 23.119 (19.185 to 23.769) | 2442.74 (2298.85 to 2673.72) | yes |

## Gate Rule

- Cell pass requires zero failed trials plus 95% bootstrap CI lower bounds above no-improvement for both paired median speedup (>1.0) and paired median latency improvement (>0 ms).
- Gate 1 pass requires all primary cells to pass.
