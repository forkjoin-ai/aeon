# Gate 1 Wall-Clock Matrix

Distributed benchmark with live HTTP stage servers and impairment injection (RTT/jitter/loss).

## Execution

- Label: workers-dev-external-single-host
- Mode: external-endpoints
- Listen host: 127.0.0.1
- Advertise host: 127.0.0.1
- External endpoints provided: 6

## Verdict

- Overall Gate 1: **PASS**
- Primary cells passed: 8/8

## Matrix Results

| Cell | Primary | Trials | Seq p50 / p95 (ms) | Chunked p50 / p95 (ms) | Median Speedup (95% CI) | Median Improvement (95% CI, ms) | Pass |
|---|---|---:|---:|---:|---:|---:|---|
| prompt24-n4-b6__rtt1-loss0 | no | 4/4 | 4323.58 / 5469.35 | 395.37 / 589.73 | 10.542 (9.161 to 11.984) | 3929.90 (3505.88 to 5033.17) | yes |
| prompt24-n4-b6__rtt3-loss0 | yes | 4/4 | 5765.73 / 5981.40 | 425.18 / 518.61 | 13.689 (10.655 to 14.480) | 5339.13 (5141.42 to 5563.45) | yes |
| prompt24-n4-b6__rtt3-loss2pct | yes | 4/4 | 5368.02 / 5532.47 | 394.74 / 586.03 | 13.586 (9.002 to 14.610) | 4896.15 (4852.27 to 5083.91) | yes |
| prompt24-n4-b6__rtt7-loss0 | yes | 4/4 | 5602.13 / 5954.61 | 398.94 / 715.61 | 13.055 (7.798 to 14.563) | 5176.93 (4484.12 to 5286.38) | yes |
| prompt24-n4-b6__rtt7-loss2pct | yes | 4/4 | 5497.91 / 5710.68 | 441.06 / 630.11 | 12.249 (8.729 to 15.563) | 5062.57 (4804.94 to 5189.13) | yes |
| prompt36-n6-b9__rtt1-loss0 | no | 4/4 | 11437.01 / 12291.16 | 540.54 / 680.38 | 21.352 (17.813 to 24.232) | 10964.71 (10423.69 to 11691.17) | yes |
| prompt36-n6-b9__rtt3-loss0 | yes | 4/4 | 11981.39 / 12546.57 | 517.85 / 657.97 | 22.096 (18.231 to 24.082) | 11383.45 (10517.91 to 12044.72) | yes |
| prompt36-n6-b9__rtt3-loss2pct | yes | 4/4 | 12470.66 / 13198.07 | 497.15 / 1029.23 | 25.098 (11.831 to 26.359) | 11907.21 (11240.50 to 12283.66) | yes |
| prompt36-n6-b9__rtt7-loss0 | yes | 4/4 | 13269.41 / 14277.65 | 548.59 / 588.06 | 24.329 (22.974 to 25.500) | 12732.10 (11350.72 to 13716.85) | yes |
| prompt36-n6-b9__rtt7-loss2pct | yes | 4/4 | 13456.75 / 14119.83 | 635.42 / 703.85 | 21.715 (19.092 to 24.911) | 12799.83 (12686.56 to 13551.15) | yes |

## Gate Rule

- Cell pass requires zero failed trials plus 95% bootstrap CI lower bounds above no-improvement for both paired median speedup (>1.0) and paired median latency improvement (>0 ms).
- Gate 1 pass requires all primary cells to pass.
