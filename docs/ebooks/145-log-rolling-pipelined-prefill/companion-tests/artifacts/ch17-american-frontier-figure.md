# American Frontier: Frontier Curves and Recursive Wire Witness

The American Frontier rendered as curve families across framing, scheduling, response encoding, and the recursive wire hedge.

## Panel A: Framing Waste by Protocol

Site: Microfrontend (95 resources)

| Protocol | Overhead % | Wire KB | RTTs |
|----------|-----------:|--------:|-----:|
| HTTP/1.1 | 31% | 187 | 16 |
| HTTP/2 | 5.8% | 137 | 2 |
| HTTP/3 | 4.4% | 135 | 1 |
| Aeon Flow | 1.5% | 131 | 1 |

## Panel B: Idle Waste by Reynolds Regime

4-stage pipeline:

| Reynolds | Idle Fraction |
|---------:|--------------:|
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

## Panel C: Encoding Waste by Content Mix

| Corpus | Heuristic waste | Gain vs best fixed | Win rate |
|--------|----------------:|-------------------:|---------:|
| text-homogeneous | 0.83% | 0.830% | 100% |
| web-mixed | 0.78% | 0.005% | 100% |
| media-plus-metadata | 7.44% | 0.001% | 100% |
| polyglot-bundle | 26.65% | 0.003% | 100% |
| api-telemetry | 46.37% | 0.008% | 100% |

## Panel D: Aeon/UDP vs HTTP/TCP Mixed Race

Same-request Aeon/UDP vs HTTP/TCP mixed race, plaintext, 64 clients, depth 16

| TCP hedge delay | Req/s | Aeon win share | Waste bytes/win | Loser vent % | Skipped HTTP hedges |
|----------------|------:|---------------:|-----------------:|-------------:|--------------------:|
| 0 ms | 165807.66 | 28.05% | 0.05 | 99.64% | 0 |
| 0.25 ms | 56130.28 | 84.73% | 0.03 | 99.61% | 399,721 |
| 0.5 ms | 77485.11 | 85.65% | 0.03 | 99.54% | 646,907 |
| 1 ms | 98045.19 | 98.84% | 0.02 | 99.15% | 1,240,698 |
| 2 ms | 109790.68 | 99.78% | 0.00 | 99.21% | 1,644,757 |
| 4 ms | 111570.09 | 99.90% | 0.00 | 99.76% | 1,699,075 |

## Recursive Heavy Witness

At Same-request Aeon/UDP vs HTTP/TCP mixed race, plaintext, 256 clients, depth 256, zero skew sits at 0.10% Aeon share and 0.50 waste bytes/win. A 2 ms TCP hedge delay moves the same workload to 99.91% Aeon share and 0.02 waste bytes/win while retaining 89.1% of zero-skew throughput.

## Recursive Claim

Panels C and D are the same theorem at two layers: diversity first encodes the response, then diversity carries the response on the wire. The hedge delay acts as an inverse-Bule control knob that suppresses unnecessary loser launches before they become waste.

## Frontier Properties (mechanized in AmericanFrontier.lean)

- Monotone: true
- Zero at match: true
- Positive below match: true
- Pigeonhole witness: true
- Recursive across layers: true
