# Chapter 17 Gate 3 Compression-Corpus Figure

- Label: `ch17-gate3-compression-corpus-figure-v1`
- Source: `gate3-compression-corpus-v1`
- Corpus: `90` samples, `20.13 MB` total, median `169.7 KB`
- Primary cells passed: `4/4`
- Gain vs best fixed range: `0.001%` to `0.8333%`
- Gain vs heuristic range: `0.7766%` to `46.37%`
- Minimum primary-cell CI lows: `0.0009%` and `0.3856%`
- Median codecs used range: `1` to `1`

## Cells

| Cell | Primary | Gain vs Best Fixed % (95% CI) | Gain vs Heuristic % (95% CI) | Win Rates (best fixed / heuristic) | Median Codecs Used |
|---|---|---:|---:|---:|---:|
| web-mixed | yes | 0.0052% (0.0041% to 0.0074%) | 0.7766% (0.3856% to 1.237%) | 100% / 100% | 1 |
| api-telemetry | yes | 0.0078% (0.0075% to 0.0086%) | 46.37% (39.45% to 50.91%) | 100% / 100% | 1 |
| media-plus-metadata | yes | 0.001% (0.0009% to 0.0011%) | 7.442% (6.214% to 10.31%) | 100% / 100% | 1 |
| polyglot-bundle | yes | 0.0029% (0.002% to 0.0032%) | 26.65% (25.24% to 33.53%) | 100% / 100% | 1 |
| text-homogeneous | no | 0.8333% (0.7874% to 0.8716%) | 0.8333% (0.7859% to 0.8698%) | 100% / 100% | 1 |

Interpretation: the figure makes the honest asymmetry visible. Gains over the best fixed codec are tiny but positive in the primary heterogeneous families, while gains over the heuristic baseline are much larger; the non-primary homogeneous-text family acts as a control with a very different scale.
