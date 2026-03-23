# Gate 2 Protocol Corpus Matrix

Large heterogeneous protocol corpus benchmark (Aeon Flow vs HTTP/3) with seeded site generation and environment matrix evaluation.

## Corpus

- Protocol id: gate2-protocol-corpus-v1
- Site count: 144
- Total resources: 12371
- Median resources/site: 73.0
- Median raw bytes/site: 15952314
- p95 raw bytes/site: 32581339

## Verdict

- Overall Gate 2: **PASS**
- Primary cells passed: 6/6

## Matrix Results

| Cell | Primary | Sites | Framing Median Gain % (95% CI) | Completion Median Gain ms (95% CI) | Completion p95 Gain ms (95% CI) | Win Rates (framing/median/p95) | Pass |
|---|---|---:|---:|---:|---:|---:|---|
| rtt4-bw120-loss0 | no | 144 | 72.252 (72.195 to 72.334) | 23.470 (19.318 to 26.068) | 23.610 (19.526 to 25.996) | 100.0%/100.0%/100.0% | yes |
| rtt12-bw80-loss0 | yes | 144 | 72.252 (72.195 to 72.334) | 23.619 (20.240 to 26.465) | 23.792 (19.994 to 25.984) | 100.0%/100.0%/100.0% | yes |
| rtt24-bw40-loss0.2pct | yes | 144 | 72.252 (72.190 to 72.331) | 25.072 (21.374 to 27.340) | 24.789 (21.565 to 28.010) | 100.0%/100.0%/100.0% | yes |
| rtt35-bw28-loss0.5pct | yes | 144 | 72.252 (72.195 to 72.335) | 28.240 (25.464 to 30.626) | 29.123 (25.908 to 31.360) | 100.0%/100.0%/100.0% | yes |
| rtt48-bw18-loss1pct | yes | 144 | 72.252 (72.195 to 72.334) | 37.879 (34.327 to 42.562) | 40.793 (36.437 to 47.387) | 100.0%/100.0%/100.0% | yes |
| rtt75-bw10-loss1.5pct | yes | 144 | 72.252 (72.195 to 72.334) | 60.355 (54.833 to 66.968) | 71.129 (63.878 to 78.486) | 100.0%/100.0%/100.0% | yes |
| rtt110-bw7-loss2pct | yes | 144 | 72.252 (72.195 to 72.335) | 92.393 (83.379 to 104.426) | 110.500 (98.223 to 126.006) | 100.0%/100.0%/100.0% | yes |
| rtt150-bw4-loss3pct | no | 144 | 72.252 (72.192 to 72.334) | 192.012 (172.433 to 230.961) | 254.515 (214.961 to 277.322) | 100.0%/100.0%/100.0% | yes |

## Gate Rule

- Cell pass requires positive 95% bootstrap CI lower bounds for median framing gain (%), median completion gain (ms), and p95 completion gain (ms).
- Cell pass also requires minimum per-site win rates on framing, median completion, and p95 completion metrics.
- Gate pass requires all primary environments to pass.

