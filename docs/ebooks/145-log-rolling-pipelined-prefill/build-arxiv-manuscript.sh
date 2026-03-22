#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

SOURCE_MD="ch17-arxiv-manuscript.md"
OUTPUT_TEX="arxiv-manuscript.tex"
OUTPUT_PDF="arxiv-manuscript.pdf"
PREPARED_MD="arxiv-manuscript.prepared.md"

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
  if ! command -v bun >/dev/null 2>&1; then
    echo "Missing dependency: bun" >&2
    echo "Install bun, then rerun this script." >&2
    exit 1
  fi

  echo "[0/3] Generating embedded aeon-viz scene assets"
  bun ./companion-tests/scripts/ch17-cosmic-explainer-figure.ts --assert
  bun ./companion-tests/scripts/ch17-dimension-ladder-figure.ts --assert
  bun ./prepare-arxiv-markdown.ts --input "${SOURCE_MD}" --output "${PREPARED_MD}"

  echo "[1/3] Regenerating ${OUTPUT_TEX} from ${PREPARED_MD}"
  pandoc --standalone \
    -V geometry:margin=1in \
    -V fontsize=11pt \
    "${PREPARED_MD}" -o "${OUTPUT_TEX}"

  # Post-process: allow line breaks in monospace text
  python3 -c "
import re, sys
with open('${OUTPUT_TEX}', 'r') as f:
    tex = f.read()
# Add seqsplit and sloppypar to preamble
preamble_additions = r'''
\\usepackage{seqsplit}
\\tolerance=9999
\\emergencystretch=3em
\\hbadness=9999
'''
tex = tex.replace(r'\\begin{document}', preamble_additions + r'\\begin{document}')
# Make \\texttt content breakable by wrapping long paths in seqsplit
# Match \\texttt{...long content with / or .  ...}
def fix_texttt(m):
    content = m.group(1)
    if len(content) > 40:
        # Allow breaks at / - . _
        broken = content.replace('/', '/\\\\allowbreak{}')
        broken = broken.replace('.', '.\\\\allowbreak{}')
        broken = broken.replace('-', '-\\\\allowbreak{}')
        # Don't touch underscores — they're already valid in \\texttt
        pass
        return '\\\\texttt{' + broken + '}'
    return m.group(0)
tex = re.sub(r'\\\\texttt\{([^}]{40,})\}', fix_texttt, tex)
# Force all figures to full text width for legibility
tex = tex.replace(
    r'\\pandocbounded{\\includegraphics[keepaspectratio',
    r'\\includegraphics[width=\\textwidth,keepaspectratio'
)
# Remove the pandocbounded wrapper closing brace for replaced figures
import re as re2
tex = re2.sub(
    r'\\\\includegraphics\[width=\\\\textwidth,keepaspectratio,alt=\{([^}]*)\}\]\{([^}]*)\}\}',
    r'\\\\includegraphics[width=\\\\textwidth,keepaspectratio,alt={\1}]{\2}',
    tex
)
with open('${OUTPUT_TEX}', 'w') as f:
    f.write(tex)
print('  Post-processed: geometry, tolerance, texttt breaks, full-width figures')
"
fi

if [[ "${EXPORT_PDF}" == true ]]; then
  echo "[2/3] Exporting ${OUTPUT_PDF} from ${OUTPUT_TEX}"

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
