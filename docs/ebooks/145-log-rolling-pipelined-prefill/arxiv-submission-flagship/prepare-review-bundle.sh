#!/usr/bin/env bash
#
# prepare-review-bundle.sh
# Creates a reviewer-facing zip bundle for the flagship manuscript that can be
# shared alongside the PDF or include the PDF when one is available locally.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$SCRIPT_DIR/build"
BUNDLE_DIR="$SCRIPT_DIR/review-bundle"
ZIP_PATH="$SCRIPT_DIR/flagship-review-bundle.zip"

MANUSCRIPT_MD="$PARENT_DIR/ch17-arxiv-manuscript-flagship.md"
PREPARED_MD="$PARENT_DIR/arxiv-manuscript-flagship.prepared.md"
TEX_FILE="$PARENT_DIR/arxiv-manuscript-flagship.tex"
ROOT_PDF="$PARENT_DIR/arxiv-manuscript-flagship.pdf"
BUILD_PDF="$BUILD_DIR/main.pdf"
METADATA_FILE="$SCRIPT_DIR/arxiv-metadata.txt"
TARBALL="$SCRIPT_DIR/arxiv-submission-flagship.tar.gz"

ARTIFACT_DIR="$PARENT_DIR/companion-tests/artifacts"
FORMAL_DIR="$PARENT_DIR/companion-tests/formal"
LEAN_DIR="$FORMAL_DIR/lean/Lean/ForkRaceFoldTheorems"
GNOSIS_PROOFS_DIR="$PARENT_DIR/../../../../../open-source/gnosis/examples/proofs"

usage() {
  cat <<'EOF'
Usage: ./prepare-review-bundle.sh [--help]

Creates flagship-review-bundle.zip containing the flagship manuscript source,
metadata, arXiv tarball, witness exports, figure assets, and core theorem
artifacts. If a PDF already exists, it is included automatically.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! command -v zip >/dev/null 2>&1; then
  echo "ERROR: zip is required but not found." >&2
  exit 1
fi

echo "==> Refreshing flagship TeX surface..."
bash "$PARENT_DIR/build-arxiv-manuscript-flagship.sh" --tex-only

echo "==> Refreshing flagship arXiv package..."
bash "$SCRIPT_DIR/prepare-arxiv.sh"

rm -rf "$BUNDLE_DIR"
mkdir -p \
  "$BUNDLE_DIR/manuscript" \
  "$BUNDLE_DIR/package" \
  "$BUNDLE_DIR/artifacts" \
  "$BUNDLE_DIR/formal" \
  "$BUNDLE_DIR/proofs"

cp "$MANUSCRIPT_MD" "$BUNDLE_DIR/manuscript/"
cp "$PREPARED_MD" "$BUNDLE_DIR/manuscript/"
cp "$TEX_FILE" "$BUNDLE_DIR/manuscript/"
cp "$METADATA_FILE" "$BUNDLE_DIR/manuscript/"
cp "$TARBALL" "$BUNDLE_DIR/package/"

PDF_INCLUDED="no"
PDF_SOURCE=""
if [[ -f "$ROOT_PDF" ]]; then
  cp "$ROOT_PDF" "$BUNDLE_DIR/manuscript/"
  PDF_INCLUDED="yes"
  PDF_SOURCE="$ROOT_PDF"
elif [[ -f "$BUILD_PDF" ]]; then
  cp "$BUILD_PDF" "$BUNDLE_DIR/manuscript/arxiv-manuscript-flagship.pdf"
  PDF_INCLUDED="yes"
  PDF_SOURCE="$BUILD_PDF"
fi

ARTIFACT_FILES=(
  "ch17-wallington-rotation-site.gg"
  "ch17-wallington-rotation-site-witness.json"
  "ch17-wallington-rotation-site-witness.md"
  "ch17-wallington-rotation-positive-deficit-site.gg"
  "ch17-wallington-rotation-positive-deficit-site-witness.json"
  "ch17-wallington-rotation-positive-deficit-site-witness.md"
  "gate1-wallclock-external-multihost.json"
  "gate1-wallclock-external-multihost.md"
  "gate2-protocol-corpus.json"
  "gate2-protocol-corpus.md"
  "ch17-inverted-scaling-reynolds-figure.json"
  "ch17-inverted-scaling-reynolds-figure.md"
  "ch17-inverted-scaling-reynolds-figure.png"
  "ch17-inverted-scaling-reynolds-figure.svg"
  "ch17-gate1-wallclock-figure.json"
  "ch17-gate1-wallclock-figure.md"
  "ch17-gate1-wallclock-figure.png"
  "ch17-gate1-wallclock-figure.svg"
  "ch17-gate2-protocol-corpus-figure.json"
  "ch17-gate2-protocol-corpus-figure.md"
  "ch17-gate2-protocol-corpus-figure.png"
  "ch17-gate2-protocol-corpus-figure.svg"
)

for artifact in "${ARTIFACT_FILES[@]}"; do
  cp "$ARTIFACT_DIR/$artifact" "$BUNDLE_DIR/artifacts/"
done

cp "$LEAN_DIR/AeonFluxSiteAdequacy.lean" "$BUNDLE_DIR/formal/"
cp "$FORMAL_DIR/THEOREM_LEDGER.md" "$BUNDLE_DIR/formal/"
cp "$GNOSIS_PROOFS_DIR/AeonFluxSiteAdequacy-lean.gg" "$BUNDLE_DIR/proofs/"

cat > "$BUNDLE_DIR/README.md" <<EOF
# Flagship Review Bundle

This zip bundles the reviewer-facing Chapter 17 flagship paper with the
smallest companion surface needed to inspect the central theorem/evidence path.

- Manuscript title: Topological Mismatch in Distributed Inference: Mechanized Models and Protocol-Level Evidence for Fork/Race/Fold Scheduling
- PDF included: ${PDF_INCLUDED}
EOF

if [[ "$PDF_INCLUDED" == "yes" ]]; then
  cat >> "$BUNDLE_DIR/README.md" <<EOF
- PDF source: ${PDF_SOURCE}
EOF
else
  cat >> "$BUNDLE_DIR/README.md" <<'EOF'
- PDF source: not present locally when the bundle was created
- To add one later: run `pnpm run manuscript:arxiv:flagship:pdf` when a TeX
  PDF engine is installed, then rerun this bundle script
EOF
fi

cat >> "$BUNDLE_DIR/README.md" <<'EOF'

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
EOF

rm -f "$ZIP_PATH"
(
  cd "$SCRIPT_DIR"
  zip -rq "$(basename "$ZIP_PATH")" "$(basename "$BUNDLE_DIR")"
)

echo "==> Review bundle: $(basename "$ZIP_PATH")"
