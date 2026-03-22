#!/usr/bin/env bash
#
# prepare-arxiv.sh
# Prepares an arXiv submission tarball from ch17-arxiv-manuscript-flagship.md.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$SCRIPT_DIR/build"
MANUSCRIPT="$PARENT_DIR/ch17-arxiv-manuscript-flagship.md"
COMPANION_ARTIFACTS="$PARENT_DIR/companion-tests/artifacts"

if ! command -v pandoc &>/dev/null; then
  echo "ERROR: pandoc is required but not found." >&2
  echo "  Install via: brew install pandoc  (macOS) or apt install pandoc (Linux)" >&2
  exit 1
fi

if ! command -v bun &>/dev/null; then
  echo "ERROR: bun is required but not found." >&2
  echo "  Install bun, then rerun this script." >&2
  exit 1
fi

if [ ! -f "$MANUSCRIPT" ]; then
  echo "ERROR: manuscript not found at $MANUSCRIPT" >&2
  exit 1
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/figures"

echo "==> Preparing flagship manuscript source..."
bun "$PARENT_DIR/prepare-arxiv-markdown.ts" --input "$MANUSCRIPT" --output "$BUILD_DIR/manuscript.md"

if [ -d "$PARENT_DIR/figures" ]; then
  echo "==> Copying figures..."
  cp -R "$PARENT_DIR/figures/"* "$BUILD_DIR/figures/" 2>/dev/null || true
fi

if [ -d "$COMPANION_ARTIFACTS" ]; then
  echo "==> Copying companion artifacts..."
  mkdir -p "$BUILD_DIR/companion-tests/artifacts"
  cp -R "$COMPANION_ARTIFACTS/"* "$BUILD_DIR/companion-tests/artifacts/" 2>/dev/null || true
fi

if [ -f "$SCRIPT_DIR/arxiv-metadata.txt" ]; then
  cp "$SCRIPT_DIR/arxiv-metadata.txt" "$BUILD_DIR/"
fi

echo "==> Converting markdown to LaTeX via pandoc..."
pandoc "$BUILD_DIR/manuscript.md" \
  --from=markdown+tex_math_dollars+tex_math_double_backslash \
  --to=latex \
  --standalone \
  --top-level-division=section \
  --variable=documentclass:article \
  --variable=geometry:margin=1in \
  --variable=fontsize:11pt \
  --variable=title:"Topological Mismatch in Distributed Inference: Mechanized Models and Protocol-Level Evidence for Fork/Race/Fold Scheduling" \
  --variable=author:"Taylor William Buley" \
  --variable=date:"2026" \
  --natbib \
  -o "$BUILD_DIR/main.tex"

bun "$PARENT_DIR/prepare-arxiv-figures.ts" --tex "$BUILD_DIR/main.tex"

cat > "$BUILD_DIR/references.bib" << 'BIBEOF'
% Placeholder bibliography for arXiv submission.
% Replace with actual .bib entries before final upload.

@misc{placeholder,
  author = {Buley, Taylor William},
  title  = {Placeholder -- replace with actual references},
  year   = {2026},
  note   = {See manuscript references for full citation list}
}
BIBEOF

if command -v pdflatex &>/dev/null; then
  echo "==> Compiling PDF with pdflatex..."
  pushd "$BUILD_DIR" >/dev/null
  pdflatex -interaction=nonstopmode main.tex >/dev/null 2>&1 || true
  pdflatex -interaction=nonstopmode main.tex >/dev/null 2>&1 || true
  if [ -f main.pdf ]; then
    echo "==> PDF compiled: build/main.pdf"
  else
    echo "==> WARNING: pdflatex did not produce a PDF. Check build/main.log for errors."
  fi
  popd >/dev/null
else
  echo "==> pdflatex not found -- skipping PDF compilation."
fi

echo "==> Creating flagship submission tarball..."

TARBALL="$SCRIPT_DIR/arxiv-submission-flagship.tar.gz"

tar -czf "$TARBALL" \
  -C "$BUILD_DIR" \
  main.tex \
  references.bib \
  figures/ \
  $([ -d "$BUILD_DIR/companion-tests" ] && echo "companion-tests/" || true) \
  $([ -f "$BUILD_DIR/arxiv-metadata.txt" ] && echo "arxiv-metadata.txt" || true)

echo "==> Submission tarball: arxiv-submission-flagship.tar.gz"
