# Flagship Review Bundle

This zip bundles the reviewer-facing Chapter 17 flagship paper with the
smallest companion surface needed to inspect the central theorem/evidence path.

- Manuscript title: Topological Mismatch in Distributed Inference: Mechanized Models and Protocol-Level Evidence for Fork/Race/Fold Scheduling
- PDF included: no
- PDF source: not present locally when the bundle was created
- To add one later: run `pnpm run manuscript:arxiv:flagship:pdf` when a TeX
  PDF engine is installed, then rerun this bundle script

## Contents

- `manuscript/`: markdown, prepared markdown, TeX, metadata, and the PDF when available
- `package/`: the arXiv submission tarball
- `artifacts/`: emitted witness pair, Gate1/Gate2 reports, and the three figure surfaces used in the flagship
- `formal/`: the central Aeon Flux site adequacy Lean file and theorem ledger
- `proofs/`: the matching GG proof topology

## Minimal interpretation guide

- `artifacts/ch17-wallington-rotation-site-witness.json`: matched emitted site (`Delta_beta = 0`)
- `artifacts/ch17-wallington-rotation-positive-deficit-site-witness.json`: collided emitted site (`Delta_beta = 2`)
- `artifacts/gate1-wallclock-external-multihost.json`: staged-vs-serialized deployment evidence
- `artifacts/gate2-protocol-corpus.json`: `Aeon Flow` vs `HTTP/3` corpus evidence
- `formal/AeonFluxSiteAdequacy.lean`: adequacy trichotomy theorem family
- `proofs/AeonFluxSiteAdequacy-lean.gg`: proof-topology view of the same theorem family
