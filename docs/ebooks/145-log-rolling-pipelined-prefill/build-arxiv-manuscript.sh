#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

SOURCE_MD="ch17-arxiv-manuscript.md"
OUTPUT_TEX="arxiv-manuscript.tex"
OUTPUT_PDF="arxiv-manuscript.pdf"

REGENERATE_TEX=true
EXPORT_PDF=true

usage() {
  cat <<'EOF'
Usage: ./build-arxiv-manuscript.sh [--tex-only] [--pdf-only] [--help]

Options:
  --tex-only  Regenerate TeX from Markdown and skip PDF export.
  --pdf-only  Export PDF from existing TeX and skip Markdown -> TeX.
  --help      Show this help text.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tex-only)
      EXPORT_PDF=false
      shift
      ;;
    --pdf-only)
      REGENERATE_TEX=false
      shift
      ;;
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

if [[ "${REGENERATE_TEX}" == true ]]; then
  if ! command -v pandoc >/dev/null 2>&1; then
    echo "Missing dependency: pandoc" >&2
    echo "Install pandoc, then rerun this script." >&2
    exit 1
  fi

  echo "[1/2] Regenerating ${OUTPUT_TEX} from ${SOURCE_MD}"
  pandoc --standalone "${SOURCE_MD}" -o "${OUTPUT_TEX}"
fi

if [[ "${EXPORT_PDF}" == true ]]; then
  echo "[2/2] Exporting ${OUTPUT_PDF} from ${OUTPUT_TEX}"

  if ! command -v bun >/dev/null 2>&1; then
    echo "Missing dependency: bun" >&2
    echo "Install bun, then rerun this script." >&2
    exit 1
  fi

  bun ./prepare-arxiv-figures.ts

  if command -v tectonic >/dev/null 2>&1; then
    tectonic "${OUTPUT_TEX}"
  elif command -v latexmk >/dev/null 2>&1; then
    latexmk -pdf -interaction=nonstopmode -halt-on-error "${OUTPUT_TEX}"
  elif command -v pdflatex >/dev/null 2>&1; then
    pdflatex -interaction=nonstopmode -halt-on-error "${OUTPUT_TEX}"
    pdflatex -interaction=nonstopmode -halt-on-error "${OUTPUT_TEX}"
  else
    echo "No TeX PDF engine found." >&2
    echo "Install one of: tectonic, latexmk (MacTeX), or pdflatex (MacTeX)." >&2
    echo "Examples:" >&2
    echo "  brew install tectonic" >&2
    echo "  brew install --cask mactex-no-gui" >&2
    exit 1
  fi

  if [[ ! -f "${OUTPUT_PDF}" ]]; then
    echo "PDF export finished, but ${OUTPUT_PDF} was not created." >&2
    exit 1
  fi

  echo "Wrote ${OUTPUT_PDF}"
fi
