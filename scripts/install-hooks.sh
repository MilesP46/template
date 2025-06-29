#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
mkdir -p "$ROOT/.git/hooks"

ln -sf "$ROOT/scripts/hooks/commit-msg"  "$ROOT/.git/hooks/commit-msg"
ln -sf "$ROOT/scripts/hooks/pre-commit"  "$ROOT/.git/hooks/pre-commit"

echo "✔️  Git hooks installed."
