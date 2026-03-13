# Citation Audit: `ch17-arxiv-manuscript.md`

- Manuscript: [ch17-arxiv-manuscript.md](./ch17-arxiv-manuscript.md)
- Audit state: post-remediation
- Audit date: 2026-03-13
- Standard: strict sentence-level support, with model-scoped self-citations explicitly labeled as local evidence

## Status

The manuscript was remediated to address the original citation failures.

Current state:
- Reference count: 39
- Unused references: 0
- Broken citation targets removed: yes
- Broken bibliography metadata corrected: yes
- Unsupported quantitative claims softened or replaced: yes
- Self-authored artifacts retained only for local implementation / reproducibility / bounded-model claims: yes

## Remediated Items

1. The unverifiable Netherlands rare-disease citation was replaced with a real EURORDIS Rare Barometer report and the claim was softened to the supported `5 years` survey average.
2. The Physarum morphology citation metadata was corrected, and the unsupported nutrient-stress sentence was removed.
3. The saltatory-conduction paragraph no longer relies on unverified exact constants; it now makes an order-of-magnitude claim backed by classic and modern neurophysiology sources.
4. The photosynthesis section no longer attributes exact `>95%` / `~99%` transfer values to sources that do not state them; it now uses supported high-efficiency wording.
5. The settlement-lockup numbers are now explicitly framed as a simple heuristic on top of the DTCC baseline plus local model outputs, rather than DTCC-reported facts.
6. The transformer-ablation paragraph no longer overclaims what Voita et al. established.
7. The bibliography was pruned to used references only and renumbered.

## Remaining Scope Notes

- References [8], [9], [13], [15], and [18] are self-authored implementation / reproducibility artifacts. They are appropriate where used because the surrounding claims are local to those artifacts.
- Reference [17] is an official report, but direct scripted fetches can be blocked by Cloudflare; the URL is still the official DTCC annual-report location.
- The quantum-readiness discussion is now explicitly framed as a local heuristic backed by companion simulations, not as a theorem implied by Grover or Shor.

## Current Ledger

| Ref | Real | URL / official source | Source type | Primary use | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | yes | DOI-backed journal article | journal article | Physarum / Tokyo-network experiment | Supports the experiment and tradeoff framing. |
| 2 | yes | public artifact URL resolves | self artifact | `@affectively/aeon-pipelines` implementation | Public artifact link remains a raw public artifact page. |
| 3 | yes | journal source | journal article | Physarum morphology / Murray's law | Metadata corrected to *Journal of Physics D: Applied Physics*. |
| 4 | yes | DOI-backed journal article | journal article | bacterial strand asymmetry | Used only for the softer strand-asymmetry claim. |
| 5 | yes | DOI-backed journal article | journal article | quantum coherence in photosynthesis | Used for coherence / wavelike-transfer evidence. |
| 6 | yes | DOI-backed journal article | journal article | Little's Law | Standard primary citation. |
| 7 | yes | official publication | journal article | Jackson-style queueing result | Used for fixed-topology network context. |
| 8 | yes | GitHub repo URL resolves | self artifact | Aeon runtime / flow / compression | Local implementation and test provenance only. |
| 9 | yes | GitHub path URL resolves | self artifact | companion tests / bounded models | Local executable-evidence claims only. |
| 10 | yes | official book source | book | path-integral derivation context | Standard reference. |
| 11 | yes | DOI-backed journal article | journal article | protein folding / energy landscape | Appropriate for the protein-folding analogy. |
| 12 | yes | official book source | book | TLA+ reference | Standard reference. |
| 13 | yes | GitHub repo URL resolves | self artifact | `aeon-logic` tooling / formal artifacts | Local mechanized-tooling claims only. |
| 14 | yes | official docs URL resolves | official software docs | Lean 4 reference | Standard reference. |
| 15 | yes | GitHub repo URL resolves | self artifact | Gnosis implementation | Local language / compiler claims only. |
| 16 | yes | official PDF URL resolves | official report | rare-disease diagnosis delay | Supports the `5 years` survey-average claim. |
| 17 | yes | official report URL | annual report | DTCC / NSCC daily baseline | Used only for the baseline, not the extrapolated heuristic. |
| 18 | yes | GitHub repo URL resolves | self artifact | aeon-forge implementation | Local deployment-control-plane claims only. |
| 19 | yes | DOI-backed journal article | journal article | internodal distance vs conduction | Supports the flat-maximum / internodal-distance claim. |
| 20 | yes | DOI-backed journal article | journal article | electro-saltatory conduction | Supports the classic nodal-regeneration framing. |
| 21 | yes | ACL proceedings paper | conference paper | transformer head specialization / pruning | Claim softened to match the paper. |
| 22 | yes | DOI-backed journal article | journal article | persistent homology terminology | Standard reference. |
| 23 | yes | official publication | journal article | Mac Lane coherence theorem | Standard reference. |
| 24 | yes | official book chapter | book chapter | weak assumptions behind Little's Law | Standard reference. |
| 25 | yes | official dissertation record | dissertation | Petri-net context | Used as prior-formalism context. |
| 26 | yes | official book source | book | pi-calculus context | Used as prior-formalism context. |
| 27 | yes | DOI-backed journal article | journal article | Tomasulo / speculative execution | Used as prior-formalism context. |
| 28 | yes | DOI-backed journal article | journal article | superscalar microarchitecture | Used as prior-formalism context. |
| 29 | yes | official conference publication | conference paper | PBFT context | Used as prior-formalism context. |
| 30 | yes | official conference publication | conference paper | HotStuff context | Used as prior-formalism context. |
| 31 | yes | DOI-backed journal article | journal article | whole-system photosynthetic efficiency | Paired with [5] to distinguish step-level vs system-level efficiency. |
| 32 | yes | DOI-backed review article | review article | Okazaki fragments | Supports fragment sizes / ligase context. |
| 33 | yes | DOI-backed review article | review article | myelinated vs unmyelinated conduction range | Used for measured velocity ranges. |
| 34 | yes | DOI-backed conference paper | conference paper | Amdahl's Law | Standard reference. |
| 35 | yes | DOI-backed journal article | journal article | Gustafson's Law | Standard reference. |
| 36 | yes | official source exists | journal article | Shannon entropy | Standard reference for entropy-limit claims. |
| 37 | yes | official conference publication | conference paper | MapReduce | Standard reference. |
| 38 | yes | DOI-backed conference paper | conference paper | Grover search | Used only as an example of quantum speedup. |
| 39 | yes | DOI-backed conference paper | conference paper | Shor factoring / logarithms | Used only as an example of quantum speedup. |

## Bottom Line

The manuscript no longer contains the original broken rare-disease citation, the original miscited Physarum venue, or the unsupported exact-value claims that were doing most of the damage. The remaining self-citations are now confined to local artifacts and explicitly model-scoped claims, which is appropriate for this manuscript's implementation and reproducibility sections.
