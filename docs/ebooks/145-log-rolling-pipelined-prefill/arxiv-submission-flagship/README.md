# arXiv Submission Helper -- Flagship

- Parent volume README: [../README.md](../README.md)
- Flagship manuscript source: [../ch17-arxiv-manuscript-flagship.md](../ch17-arxiv-manuscript-flagship.md)
- Submission metadata: [arxiv-metadata.txt](./arxiv-metadata.txt)
- Packaging script: [prepare-arxiv.sh](./prepare-arxiv.sh)
- Review bundle script: [prepare-review-bundle.sh](./prepare-review-bundle.sh)

This directory holds the reviewer-facing arXiv packaging path for the flagship
Chapter 17 manuscript. It does not replace the default submission helper for
the full theory chapter; it exists so the narrow paper can be built and packed
independently.

Routing rule: this is the `TLDR` track. Only add material here when it directly
serves the bounded flagship thesis and is locally supported by the evidence
surface the flagship cites. If an addition is broad, exploratory, or mainly for
the richer online narrative, keep it in the catchall manuscript instead.

Before upload, verify that the metadata title and abstract still match the
flagship manuscript and rerun the companion manuscript checks for the flagship
track.

## Outputs

- `arxiv-submission-flagship.tar.gz`: arXiv upload tarball
- `flagship-review-bundle.zip`: reviewer-facing zip bundle that can accompany
  the PDF and includes the PDF automatically when one is present locally

## Commands

```bash
pnpm run manuscript:arxiv:flagship:package
pnpm run manuscript:arxiv:flagship:bundle
```

The review bundle refreshes the flagship TeX surface, refreshes the arXiv
package, then zips the manuscript source, metadata, arXiv tarball, emitted
witness pair, Gate1/Gate2 evidence files, and the core adequacy theorem
artifacts into `flagship-review-bundle.zip`.
