#!/usr/bin/env bash
# Fail if any path that must be private is currently tracked by git.
# Run from repo root: ./scripts/verify-no-private-tracked.sh
# Exit 0 = none tracked (OK), 1 = at least one private path is tracked.

set -e
cd "$(git rev-parse --show-toplevel)"
TRACKED="$(git ls-files -c)"
FAIL=0

check() {
  local pattern="$1"
  if echo "$TRACKED" | grep -qE "^${pattern}"; then
    echo "TRACKED (must be private): $pattern"
    FAIL=1
  fi
}

check '\.agents/'
check '\.beads/'
check '\.claude/'
check '\.cline/'
check '\.clinerules/'
check '\.github/'
check '\.groupcode/'
check '^docs/'
check '^AGENTS\.md$'
check '^RECOVERY\.md$'
check '^RECOVERY-PREVENTION\.md$'
check 'scripts/internal/'
check '\.vscode/'
if echo "$TRACKED" | grep -qE '\.code-workspace$'; then
  echo "TRACKED (must be private): *.code-workspace"
  FAIL=1
fi

if [[ $FAIL -eq 1 ]]; then
  echo "Run: git rm --cached <path> for each above, then commit. Do not use git add -f for these paths."
  exit 1
fi
echo "OK: No private paths are tracked."
exit 0
