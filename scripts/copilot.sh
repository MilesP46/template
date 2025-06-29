#!/usr/bin/env bash
# scripts/copilot.sh — convenience wrapper for BG‑COPILOT tasks
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: scripts/copilot.sh <file> <phase> <checkpoint>"
  exit 1
fi

FILE="$1"
PHASE="$2"
CP="$3"

# Generate a Task‑Trace ID
ID=$(python scripts/idgen.py "$PHASE" "$CP")

OUT="reports/phase${PHASE}_cp${CP}/BG-COPILOT_${ID}.patch"
mkdir -p "$(dirname "$OUT")"

# Ask Copilot for a suggestion and store it as a patch
gh copilot suggest --path "$FILE" --out "$OUT"

# Run pre‑commit hooks (lint & tests)
pre-commit run --all-files

echo "Copilot patch stored in $OUT and linted successfully."
