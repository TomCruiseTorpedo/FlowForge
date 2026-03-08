# FlowForge AI Automations

Forge automations from plain English.

FlowForge (GitHub repo: `FlowForge`) is an AI-powered automation builder that converts natural language requests into structured workflows, visual node graphs, and exportable automation templates.

## Project Vision

FlowForge helps users go from idea to executable automation quickly:

1. Enter a prompt ("raw ore")
2. Generate workflow steps ("heat the forge")
3. Visualize the workflow graph ("hammer on the anvil")
4. Export to automation format ("quench")

## Core MVP Scope

- Natural language → workflow generation
- Workflow graph visualization
- Exportable automation template (starting with n8n JSON)

## Product Theme (Blacksmith Metaphor)

- User: **Smith**
- Prompt: **Raw Ore**
- Generation: **Heat the Forge**
- Graph Canvas: **The Anvil**
- Optimization Suggestions: **Tempering**
- Export: **Quenching**

## Planned Architecture

Monorepo layout:

- `apps/web` — Next.js + React + Tailwind + React Flow UI
- `apps/api` — Node.js + Express API
- `packages/llm` — LLM prompt + workflow generation logic
- `packages/workflow-engine` — parser, graph mapper, export builder

Pipeline:

`Prompt -> LLM Workflow Generator -> Workflow Parser -> Graph Renderer -> Export`

## Quick Start

### How to run the app locally

You need **two processes**: the API and the web app.

1. **Install dependencies** (once):
   ```bash
   pnpm install
   ```

2. **Terminal 1 — API** (port 4000):
   ```bash
   pnpm --filter api dev
   ```
   Or: `pnpm start` (from repo root).

3. **Terminal 2 — Web app** (port 3000):
   ```bash
   pnpm dev
   ```
   Or: `pnpm --filter web dev`.

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser. The UI calls the API at [http://localhost:4000](http://localhost:4000) for Generate and Export.

**Health check:** [http://localhost:4000/health](http://localhost:4000/health) should return `{"status":"ok","service":"flowforge-api"}`.

**Testing n8n export:** See [How to test FlowForge exports in n8n](docs/n8n-testing-guide.md).

### For judges / MVP demo (≤120s)

1. Run the app locally (two terminals as above).
2. In the web UI, use the prompt: **"When I post a message in Slack, create a LinkedIn post"**
3. Click **Generate Workflow**, then **Export to n8n** (downloads `flowforge-n8n-export.json`).
4. In n8n, import that JSON. The workflow is ready except for **credentials**: add your own Slack, LLM API key (e.g. OpenAI-compatible), and LinkedIn in n8n. No other changes needed.

See [docs/mvp-demo.md](docs/mvp-demo.md) for the full demo script and “only add credentials” story.

## Multi-Agent Development

This project is designed for parallel work across multiple IDEs/agentic tools.

- Canonical local context: `.cline/memory-bank/`
- Multi-tool coordination guide: `.cline/AGENTIC-TOOLS-FAQ.md`
- Decision/task tracking: Beads (`bd`)

## Documentation Structure

All project documentation assets are organized under `docs/`:

- `docs/planning/` — planning documents and ideation assets
- `docs/design/` — UX/UI and product design docs (including `docs/design/assets/` for graphical assets)
- `docs/architecture/` — system architecture docs
- `docs/notes/` — development notes and working memos
- `docs/failure-investigations/` — issue postmortems and debugging investigations
- `docs/api/` — Swagger/OpenAPI contract and API docs

API contract source of truth:

- `docs/api/openapi.yaml`

## Roadmap

Short term:

- Prompt → workflow JSON reliability
- React Flow canvas rendering
- n8n export

Medium term:

- Workflow optimization suggestions
- Template library ("Armory")
- Shareable workflow packs
- **Assist users with n8n credential setup and troubleshooting** (guidance, not just export)

Long term:

- Multi-agent automation planning
- Marketplace-style workflow remixing
- Demo/default templates that work with minimal credential setup

## Repository

- GitHub: `https://github.com/TomCruiseTorpedo/FlowForge`
- Local path: `/Users/jj/FlowForge`
- Product name: **FlowForge AI Automations**

## License

Apache License 2.0 (see `LICENSE`).
