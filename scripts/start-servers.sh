#!/usr/bin/env bash
# Start or restart the FlowForge API (port 4000) and Web (port 3000).
# Run from repo root: ./scripts/start-servers.sh
# To stop: ./scripts/stop-servers.sh or kill processes on 3000 and 4000.
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

API_PORT=4000
WEB_PORT=3000
LOG_DIR="$REPO_ROOT/logs"
API_LOG="$LOG_DIR/api.log"
WEB_LOG="$LOG_DIR/web.log"

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -t -i ":$port" 2>/dev/null) || true
  if [[ -n "$pids" ]]; then
    echo "Stopping process(es) on port $port (PIDs: $pids)"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

echo "Checking ports $API_PORT and $WEB_PORT..."
kill_port "$API_PORT"
kill_port "$WEB_PORT"

mkdir -p "$LOG_DIR"
echo "Starting API (port $API_PORT)..."
nohup pnpm --filter api dev >> "$API_LOG" 2>&1 &
API_PID=$!
echo "Starting Web (port $WEB_PORT)..."
nohup pnpm dev >> "$WEB_LOG" 2>&1 &
WEB_PID=$!

echo "Waiting for servers to be ready..."
for i in {1..15}; do
  api_up=$(lsof -i ":$API_PORT" -sTCP:LISTEN -t 2>/dev/null) || true
  web_up=$(lsof -i ":$WEB_PORT" -sTCP:LISTEN -t 2>/dev/null) || true
  if [[ -n "$api_up" && -n "$web_up" ]]; then
    break
  fi
  sleep 1
done

if lsof -i ":$API_PORT" -sTCP:LISTEN -t >/dev/null 2>&1 && lsof -i ":$WEB_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo ""
  echo "FlowForge servers are running:"
  echo "  API:  http://localhost:$API_PORT  (health: http://localhost:$API_PORT/health)"
  echo "  Web:  http://localhost:$WEB_PORT"
  echo ""
  echo "Logs:  $API_LOG  |  $WEB_LOG"
  echo "To stop:  ./scripts/stop-servers.sh"
else
  echo "One or both servers may still be starting. Check logs:"
  echo "  tail -f $API_LOG"
  echo "  tail -f $WEB_LOG"
  echo "To stop:  ./scripts/stop-servers.sh"
fi
