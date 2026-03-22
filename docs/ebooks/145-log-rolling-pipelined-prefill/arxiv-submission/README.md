# arXiv Submission Helper

- Parent volume README: [../README.md](../README.md)
- Manuscript source: [../ch17-arxiv-manuscript.md](../ch17-arxiv-manuscript.md)
- Submission metadata: [arxiv-metadata.txt](./arxiv-metadata.txt)
- Packaging script: [prepare-arxiv.sh](./prepare-arxiv.sh)
- Figure notes: [figures/README.md](./figures/README.md)

This directory holds the arXiv-facing packaging helpers for the **catchall**
Chapter 17 manuscript. The `prepare-arxiv.sh` script prepares a submission
tarball from the narrative manuscript, copies the companion artifact bundle,
and includes `arxiv-metadata.txt` for the submission form.

Routing rule: broad theory, rich online exposition, extended correspondences,
and exploratory additions stay on this track by default. Do not move material
into the reviewer-facing `TLDR` paper unless that move is explicitly directed.

Before upload, review the metadata, confirm that the prepared manuscript title
and abstract still match it, and verify any figure requirements listed under
[figures/README.md](./figures/README.md).
