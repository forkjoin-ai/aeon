#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
FORMAL_DIR="${ROOT_DIR}/formal"
TOOLS_DIR="${FORMAL_DIR}/.tools"
JAR_PATH="${TOOLS_DIR}/tla2tools.jar"
TLA_VERSION="v1.8.0"
TLA_URL="https://github.com/tlaplus/tlaplus/releases/download/${TLA_VERSION}/tla2tools.jar"

JAVA_CANDIDATE="${JAVA_BIN:-}"
if [[ -z "${JAVA_CANDIDATE}" ]]; then
  if [[ -x "/opt/homebrew/opt/openjdk/bin/java" ]]; then
    JAVA_CANDIDATE="/opt/homebrew/opt/openjdk/bin/java"
  elif command -v java >/dev/null 2>&1; then
    JAVA_CANDIDATE="$(command -v java)"
  fi
fi

if [[ -z "${JAVA_CANDIDATE}" || ! -x "${JAVA_CANDIDATE}" ]]; then
  echo "No Java runtime found." >&2
  echo "Install OpenJDK (e.g. 'brew install openjdk') or set JAVA_BIN=/path/to/java." >&2
  exit 1
fi

mkdir -p "${TOOLS_DIR}"

if [[ ! -f "${JAR_PATH}" ]]; then
  echo "Downloading tla2tools.jar (${TLA_VERSION})"
  curl -fsSL "${TLA_URL}" -o "${JAR_PATH}"
fi

CFG_FILES="$(find "${FORMAL_DIR}" -maxdepth 1 -type f -name '*.cfg' | sort)"

if [[ -z "${CFG_FILES}" ]]; then
  echo "No .cfg files found in ${FORMAL_DIR}" >&2
  exit 1
fi

while IFS= read -r cfg_path; do
  if [[ -z "${cfg_path}" ]]; then
    continue
  fi
  base_name="$(basename "${cfg_path}" .cfg)"
  tla_path="${FORMAL_DIR}/${base_name}.tla"

  if [[ ! -f "${tla_path}" ]]; then
    echo "Missing TLA module for ${cfg_path}: expected ${tla_path}" >&2
    exit 1
  fi

  echo "Running TLC formal verification for ${base_name}"
  "${JAVA_CANDIDATE}" -XX:+UseSerialGC -cp "${JAR_PATH}" tlc2.TLC \
    -cleanup \
    -deadlock \
    -config "${cfg_path}" \
    "${tla_path}"
done <<< "${CFG_FILES}"
