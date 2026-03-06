#!/usr/bin/env bash
# Start this project's Dolt server on port 13379 only.
# Port 13378 is reserved for another project (Elite-Four). Do not use or kill anything on 13378.
#
# Beads may "fall back" to 13378 if 13379 is occupied (see TROUBLESHOOTING.md). We avoid that
# by stopping any server on 13379 first (this project's server only), then starting on 13379.
#
# Refs: https://github.com/steveyegge/beads/blob/main/docs/DOLT.md (BEADS_DOLT_SERVER_PORT)
#       https://github.com/steveyegge/beads/blob/main/docs/TROUBLESHOOTING.md (circuit breaker, port)
set -e
export BEADS_DOLT_SERVER_PORT=13379

# Stop this project's server if running (frees 13379 so bd won't "fall back" to 13378)
bd dolt stop 2>/dev/null || true

# If 13379 is still occupied (e.g. stale PID), stop only the process on 13379. Never touch 13378.
PID=$(lsof -ti :13379 2>/dev/null || true)
if [[ -n "$PID" ]]; then
  echo "Stopping process on 13379 (PID $PID) so we can start this project's server."
  kill "$PID" 2>/dev/null || true
  sleep 2
fi

exec bd dolt start "$@"
