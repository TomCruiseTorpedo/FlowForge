#!/usr/bin/env bash
# Bootstrap Beads issues for FlowForge MVP.
# Run after: bd dolt stop && bd dolt start (from repo root), then: ./scripts/bootstrap-beads-issues.sh
set -e
cd "$(dirname "$0")/.."

if ! bd ready --json &>/dev/null; then
  echo "Beads not ready. Run: bd dolt stop && bd dolt start"
  echo "Then re-run this script."
  exit 1
fi

echo "Creating Beads issues..."

bd create "Beads unblock: start Dolt server" -t chore -p 1 \
  --description="Run bd dolt start; verify bd ready. Data: .beads/dolt/ (symlink to .beads/FlowForge/)." --json

bd create "Scaffold monorepo: pnpm workspace + apps/web, apps/api, packages/*" -t task -p 1 \
  --description="Create root pnpm-workspace.yaml, apps/web (Next.js), apps/api (Express), packages/llm, packages/workflow-engine. Minimal hello so pnpm install and filters work." --json

bd create "Add GET /health endpoint to API" -t task -p 2 \
  --description="Implement GET /health in apps/api to match docs/api/openapi.yaml. Return 200 + simple payload." --json

bd create "Add datasets dir and node ontology stub" -t task -p 2 \
  --description="Create packages/llm/data/ or datasets/ with node list stub (from planning 06). No LLM yet; just file(s) that will feed the generator." --json

bd create "POST /generate-workflow: accept prompt, return workflow JSON" -t task -p 1 \
  --description="Single LLM call (or stub) returning structured workflow (trigger + steps). Use ontology + few-shot from planning 05/06/08. Contract per openapi.yaml." --json

bd create "Frontend: prompt input + Generate button" -t task -p 1 \
  --description="apps/web: one page with textarea + button that calls API (or mock). Display raw JSON for now." --json

bd create "Frontend: React Flow canvas from workflow JSON" -t task -p 1 \
  --description="Convert workflow (trigger + steps) to React Flow nodes/edges. Read-only view first." --json

bd create "n8n JSON compiler: workflow repr to n8n export" -t task -p 1 \
  --description="packages/workflow-engine or apps/api: map internal workflow to n8n JSON shape. POST /export or return from /generate-workflow." --json

bd create "Wire frontend: Generate to canvas to Export n8n" -t task -p 2 \
  --description="Connect prompt to API to graph render to export button to download n8n JSON." --json

echo "Done. Run: bd ready"
