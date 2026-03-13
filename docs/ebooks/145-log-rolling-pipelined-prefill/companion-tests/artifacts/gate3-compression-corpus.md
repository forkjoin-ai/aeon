# Gate 3 Compression Corpus Matrix

Heterogeneous compression corpus benchmark (topological per-chunk race vs fixed-codec and heuristic baselines) with bootstrap uncertainty intervals.

## Corpus

- Protocol id: gate3-compression-corpus-v1
- Sample count: 90
- Total bytes: 20133761
- Median bytes/sample: 169748
- p95 bytes/sample: 503674

## Verdict

- Overall Gate 3: **PASS**
- Primary cells passed: 4/4

## Matrix Results

| Cell | Primary | Samples | Median Gain vs Best Fixed % (95% CI) | Median Gain vs Heuristic % (95% CI) | Win Rates (best fixed/heuristic) | Median Codecs Used | Pass |
|---|---|---:|---:|---:|---:|---:|---|
| web-mixed | yes | 18 | 0.005 (0.004 to 0.007) | 0.777 (0.386 to 1.237) | 100.0%/100.0% | 1.00 | yes |
| api-telemetry | yes | 18 | 0.008 (0.007 to 0.009) | 46.366 (39.449 to 50.910) | 100.0%/100.0% | 1.00 | yes |
| media-plus-metadata | yes | 18 | 0.001 (0.001 to 0.001) | 7.442 (6.214 to 10.308) | 100.0%/100.0% | 1.00 | yes |
| polyglot-bundle | yes | 18 | 0.003 (0.002 to 0.003) | 26.651 (25.241 to 33.528) | 100.0%/100.0% | 1.00 | yes |
| text-homogeneous | no | 18 | 0.833 (0.787 to 0.872) | 0.833 (0.786 to 0.870) | 100.0%/100.0% | 1.00 | yes |

## Gate Rule

- Cell pass requires positive 95% bootstrap CI lower bounds for median gain vs best fixed codec and median gain vs heuristic baseline.
- Cell pass also requires minimum win rates vs best fixed and heuristic baselines.
- Gate pass requires all primary family cells to pass.

