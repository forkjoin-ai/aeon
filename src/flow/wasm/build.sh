#!/bin/bash
# Build Aeon Flow Codec WASM — no Emscripten required
#
# Prerequisites: clang with wasm target support
#   macOS:  brew install llvm
#   Linux:  apt install clang lld
#
# Output: ~2KB .wasm, runs on CF Workers, Cloud Run, Node/Bun, browsers.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${SCRIPT_DIR}/aeon-flow-codec.c"
OUT="${SCRIPT_DIR}/aeon-flow-codec.wasm"

# Try to find clang with wasm support (same pattern as aether)
CLANG=""
if command -v /opt/homebrew/opt/llvm/bin/clang &>/dev/null; then
    CLANG="/opt/homebrew/opt/llvm/bin/clang"
elif command -v /usr/local/opt/llvm/bin/clang &>/dev/null; then
    CLANG="/usr/local/opt/llvm/bin/clang"
elif command -v clang-18 &>/dev/null; then
    CLANG="clang-18"
elif command -v clang-17 &>/dev/null; then
    CLANG="clang-17"
elif command -v clang &>/dev/null; then
    CLANG="clang"
else
    echo "Error: No clang found. Install LLVM: brew install llvm"
    exit 1
fi

echo "Using: $CLANG"
echo "Building: $SRC → $OUT"

$CLANG \
    --target=wasm32-unknown-unknown \
    -O3 \
    -nostdlib \
    -Wl,--no-entry \
    -Wl,--export-dynamic \
    -Wl,--initial-memory=16777216 \
    -Wl,--max-memory=33554432 \
    -o "$OUT" \
    "$SRC"

SIZE=$(wc -c < "$OUT" | tr -d ' ')
echo "Built: $OUT ($SIZE bytes)"

# Verify exports
if command -v wasm-objdump &>/dev/null; then
    echo ""
    echo "Exports:"
    wasm-objdump -x "$OUT" | grep '<' | grep -v import || true
elif command -v wasm2wat &>/dev/null; then
    echo ""
    echo "Exports:"
    wasm2wat "$OUT" 2>/dev/null | grep '(export' || true
fi
