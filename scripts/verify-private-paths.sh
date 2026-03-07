#!/usr/bin/env bash
# Verify that private paths are listed in .gitignore (repo safety).
# Run from repo root: ./scripts/verify-private-paths.sh
# Exit 0 if all present, 1 if any missing.

set -e
cd "$(git rev-parse --show-toplevel)"
GITIGNORE="${GITIGNORE:-.gitignore}"

REQUIRED=(
  ".agents/"
  ".beads/"
  ".claude/"
  ".cline/"
  ".clinerules/"
  ".github/"
  ".groupcode/"
  "docs/"
  "AGENTS.md"
  "RECOVERY.md"
  "RECOVERY-PREVENTION.md"
  "scripts/internal/"
  ".vscode/"
  "*.code-workspace"
)
MISSING=()
for path in "${REQUIRED[@]}"; do
  # *.code-workspace is a pattern; grep as literal
  if [ "$path" = "*.code-workspace" ]; then
    if ! grep -qF "*.code-workspace" "$GITIGNORE" 2>/dev/null; then
      MISSING+=("$path")
    fi
  elif ! grep -qE "^${path}$|^${path}" "$GITIGNORE" 2>/dev/null; then
    MISSING+=("$path")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "OK: All required private paths are in $GITIGNORE"
  exit 0
else
  echo "ERROR: Missing from $GITIGNORE: ${MISSING[*]}"
  echo "Add them to the 'Private / do not publish' block."
  exit 1
fi
