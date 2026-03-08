#!/usr/bin/env bash
# Stop the FlowForge API (port 4000) and Web (port 3000).
# Run from repo root: ./scripts/stop-servers.sh
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

API_PORT=4000
WEB_PORT=3000

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -t -i ":$port" 2>/dev/null) || true
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
    echo "Stopped process(es) on port $port"
  else
    echo "Nothing running on port $port"
  fi
}

kill_port "$API_PORT"
kill_port "$WEB_PORT"
