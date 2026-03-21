# Netflix Prize as American Frontier: Ensemble Diversity Reduces Prediction Waste

Observed floor: 0.8555 RMSE (BellKor Grand Prize paper).  Cinematch baseline: 0.9525 RMSE (test set).  Waste = RMSE - observed floor.

## Panel E: Algorithm-Family Diversity Frontier

Progressive ensemble diversity: each milestone adds a new algorithm family to the blend. RMSE from published BellKor papers.

| Milestone | Families | RMSE | Waste | Waste reduction | Improvement | Source |
|-----------|:--------:|-----:|------:|----------------:|------------:|--------|
| Cinematch (single heuristic CF) | 1 | 0.9525 | 0.097 | 0% | 0% | Netflix official |
| SVD latent factor model | 2 | 0.9025 | 0.047 | 51.5% | 5.25% | Funk blog 2006; Koren KDD 2008 |
| + implicit feedback (SVD++) | 2 | 0.8911 | 0.0356 | 63.3% | 6.45% | Koren, BellKor 2008 |
| + temporal dynamics (timeSVD++) | 2 | 0.8762 | 0.0207 | 78.7% | 8.01% | Koren, Temporal Dynamics 2009 |
| + k-NN neighborhood blend | 3 | 0.8712 | 0.0157 | 83.8% | 8.54% | BellKor 2007 Progress Prize |
| + RBM + NNMF (6-family ensemble) | 6 | 0.8643 | 0.0088 | 90.9% | 9.26% | BellKor 2008 (107 predictors) |

## Panel F: Team-of-Teams Recursive Frontier

Recursive team-of-teams diversity: each milestone merges a distinct team portfolio into the meta-blend.

| Configuration | Teams | Predictors | RMSE | Waste | Waste reduction | Source |
|---------------|:-----:|-----------:|-----:|------:|----------------:|--------|
| BellKor (standalone) | 1 | ~107 | 0.8643 | 0.0088 | 90.9% | BellKor 2008 paper |
| BellKor in BigChaos | 2 | -- | 0.8616 | 0.0061 | 93.7% | 2008 Progress Prize |
| BellKor's Pragmatic Chaos | 3 | -- | 0.8567 | 0.0012 | 98.8% | Grand Prize winner (test set) |
| BPC + The Ensemble (50/50 blend) | 4 | -- | 0.8555 | 0 | 100% | BellKor Grand Prize paper |

## Monoculture Ceilings (Best Single Family)

| Family | RMSE | Waste | Year | Source |
|--------|-----:|------:|:----:|--------|
| Cinematch (baseline CF) | 0.9525 | 0.097 | 2006 | Netflix official |
| Basic SVD (FunkSVD) | 0.9025 | 0.047 | 2006 | Funk blog 2006 |
| RBM (100 hidden units) | 0.9087 | 0.0532 | 2007 | Salakhutdinov et al. ICML 2007 |
| Neighborhood (k-NN + temporal) | 0.8885 | 0.033 | 2009 | Koren, Temporal Dynamics 2009 |
| SVD++ (f=200) | 0.8911 | 0.0356 | 2008 | Koren, BellKor 2008 |
| timeSVD++ (best single model) | 0.8762 | 0.0207 | 2009 | Koren, Temporal Dynamics 2009 |
| NNMF (60 factors) | 0.8973 | 0.0418 | 2008 | BellKor 2008 |

## Frontier Properties (THM-AMERICAN-FRONTIER on Netflix data)

- Monotone: true
- Zero at match: true (lowest observed waste: 0)
- Positive below match: true (Cinematch waste: 0.097)
- Pigeonhole witness: true
- Recursive across layers: true

## Residual Gap: Optimization Left on the Table

Grand Prize winner RMSE: 0.856704 (test set).
Published 50/50 blend of finalists: 0.8555 (quiz set).
Gap: 0.0012 RMSE.

The Grand Prize winner left 0.0012 RMSE on the table. Blending two independent mega-ensembles reduced it further, proving the winner had not reached the frontier. THM-AMERICAN-FRONTIER predicts this gap is non-zero whenever the ensemble's diversity d < beta_1* of the taste space.

## Recursive Claim

Panels E and F are the same theorem at two layers: diversity first selects the prediction strategy (algorithm-family blending within a team), then diversity blends the strategies (team-of-teams meta-ensemble). The meta-blend hedge acts as an inverse-Bule control knob: Pragmatic Theory's 500 predictors suppress marginal model launches before they become overfitting waste. This is THM-AMERICAN-FRONTIER applied recursively to recommendation, the same structure as Panels C and D apply it to encoding and transport.
