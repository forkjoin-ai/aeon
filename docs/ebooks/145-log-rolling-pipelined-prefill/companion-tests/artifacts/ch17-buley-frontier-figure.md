# Buley Frontier: Diversity vs Waste

The Pareto frontier of diversity vs waste across three substrates.

## Panel A: Protocol Framing Overhead

Site: Microfrontend (95 resources), β₁* = 94

| Protocol | Overhead % | Wire KB | RTTs |
|----------|-----------|---------|------|
| HTTP/1.1 | 31% | 187 | 16 |
| HTTP/2 | 5.8% | 137 | 2 |
| HTTP/3 | 4.4% | 135 | 1 |
| Aeon Flow | 1.5% | 131 | 1 |

## Panel B: Pipeline Idle Fraction

4-stage pipeline:

| Re | Idle Fraction |
|----|--------------|
| 0.1 | 7.0% |
| 0.2 | 13.0% |
| 0.3 | 18.4% |
| 0.5 | 27.3% |
| 0.7 | 34.4% |
| 1 | 42.9% |
| 1.5 | 52.9% |
| 2 | 60.0% |
| 4 | 75.0% |
| 8 | 85.7% |
| 16 | 92.3% |

## Panel C: Compression Topology Gain

| Corpus | Gain vs Heuristic | Win Rate |
|--------|------------------|----------|
| text-homogeneous | 0.83% | 100% |
| web-mixed | 0.78% | 100% |
| media-plus-metadata | 7.44% | 100% |
| polyglot-bundle | 26.65% | 100% |
| api-telemetry | 46.37% | 100% |

## Frontier Properties (mechanized in BuleyFrontier.lean)

- Monotone: true
- Zero at match: true
- Positive below match: true
- Pigeonhole witness: true
