#!/usr/bin/env bash
#
# prepare-arxiv.sh
# Prepares an arXiv submission tarball from ch17-arxiv-manuscript.md.
#
# Usage:
#   ./prepare-arxiv.sh
#
# Prerequisites:
#   - pandoc (with LaTeX math support)
#   - pdflatex (optional -- skipped if not found)
#   - tar
#
# Output:
#   build/arxiv-submission.tar.gz   ready to upload to arxiv.org
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$SCRIPT_DIR/build"
MANUSCRIPT="$PARENT_DIR/ch17-arxiv-manuscript.md"
COMPANION_ARTIFACTS="$PARENT_DIR/companion-tests/artifacts"

# ── sanity checks ─────────────────────────────────────────────────────
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

# ── clean slate ───────────────────────────────────────────────────────
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/figures"

echo "==> Generating embedded aeon-viz scene assets..."
bun "$PARENT_DIR/companion-tests/scripts/ch17-cosmic-explainer-figure.ts" --assert
bun "$PARENT_DIR/companion-tests/scripts/ch17-dimension-ladder-figure.ts" --assert

echo "==> Preparing manuscript source..."
bun "$PARENT_DIR/prepare-arxiv-markdown.ts" --input "$MANUSCRIPT" --output "$BUILD_DIR/manuscript.md"

# ── copy any existing figures ─────────────────────────────────────────
if [ -d "$PARENT_DIR/figures" ]; then
  echo "==> Copying figures..."
  cp -R "$PARENT_DIR/figures/"* "$BUILD_DIR/figures/" 2>/dev/null || true
fi

if [ -d "$COMPANION_ARTIFACTS" ]; then
  echo "==> Copying companion scene artifacts..."
  mkdir -p "$BUILD_DIR/companion-tests/artifacts"
  cp -R "$COMPANION_ARTIFACTS/"* "$BUILD_DIR/companion-tests/artifacts/" 2>/dev/null || true
fi

# also copy local figures placeholder README
if [ -f "$SCRIPT_DIR/figures/README.md" ]; then
  cp "$SCRIPT_DIR/figures/README.md" "$BUILD_DIR/figures/"
fi

# ── copy metadata ─────────────────────────────────────────────────────
if [ -f "$SCRIPT_DIR/arxiv-metadata.txt" ]; then
  cp "$SCRIPT_DIR/arxiv-metadata.txt" "$BUILD_DIR/"
fi

# ── markdown to LaTeX ─────────────────────────────────────────────────
echo "==> Converting markdown to LaTeX via pandoc..."
pandoc "$BUILD_DIR/manuscript.md" \
  --from=markdown+tex_math_dollars+tex_math_double_backslash \
  --to=latex \
  --standalone \
  --top-level-division=section \
  --variable=documentclass:article \
  --variable=geometry:margin=1in \
  --variable=fontsize:11pt \
  --variable=title:"Being Irreversible: A Theory of Directed Process Under Conservation and Ground State" \
  --variable=author:"Taylor William Buley" \
  --variable=date:"2026" \
  --natbib \
  -o "$BUILD_DIR/main.tex"

bun "$PARENT_DIR/prepare-arxiv-figures.ts" --tex "$BUILD_DIR/main.tex"

echo "==> LaTeX generated at build/main.tex"

# ── create a minimal bibliography file ────────────────────────────────
cat > "$BUILD_DIR/references.bib" << 'BIBEOF'
% Placeholder bibliography for arXiv submission.
% Replace with actual .bib entries before final upload.
%
% Inline citations in the manuscript use numeric [N] references.
% Convert each to a proper @article / @inproceedings / @misc entry.

@misc{placeholder,
  author = {Buley, Taylor William},
  title  = {Placeholder -- replace with actual references},
  year   = {2026},
  note   = {See manuscript footnotes for full citation list}
}
BIBEOF

# ── compile PDF (optional) ────────────────────────────────────────────
if command -v pdflatex &>/dev/null; then
  echo "==> Compiling PDF with pdflatex..."
  pushd "$BUILD_DIR" >/dev/null

  # two passes for references
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
  echo "    Install via: brew install --cask mactex  (macOS) or apt install texlive-full (Linux)"
fi

# ── create submission tarball ─────────────────────────────────────────
echo "==> Creating submission tarball..."

TARBALL="$SCRIPT_DIR/arxiv-submission.tar.gz"

tar -czf "$TARBALL" \
  -C "$BUILD_DIR" \
  main.tex \
  references.bib \
  figures/ \
  $([ -d "$BUILD_DIR/companion-tests" ] && echo "companion-tests/" || true) \
  $([ -f "$BUILD_DIR/arxiv-metadata.txt" ] && echo "arxiv-metadata.txt" || true)

echo "==> Submission tarball: arxiv-submission.tar.gz"
echo ""
echo "Done. Upload arxiv-submission.tar.gz to https://arxiv.org/submit"
echo ""
echo "Pre-upload checklist:"
echo "  [ ] Replace placeholder entries in references.bib"
echo "  [ ] Add actual figure files to figures/"
echo "  [ ] Verify main.tex compiles cleanly"
echo "  [ ] Review arxiv-metadata.txt for accuracy"
