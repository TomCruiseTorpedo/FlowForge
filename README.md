# FlowForge AI Automations

Forge automations from plain English.

FlowForge is an AI-powered automation builder that converts natural language requests into structured workflows, visual node graphs, and exportable automation templates.

**About this build:** This repository is a **prototype hackathon build**. It is fully runnable locally and demonstrates the core flow (prompt → workflow → n8n export), but it is not a production release. Expect rough edges and MVP scope.

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

**Who this is for:** Anyone who has cloned the repo (e.g. a hackathon judge or a first-time user). You need **Node.js 20+** and **pnpm** installed.

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

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser. The UI talks to the API at [http://localhost:4000](http://localhost:4000) for Generate and Export.

Optional: to point the web app at a different API URL, copy `apps/web/.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_API_URL`. Default is `http://localhost:4000`.

**Health check:** [http://localhost:4000/health](http://localhost:4000/health) should return `{"status":"ok","service":"flowforge-api"}`.

**Testing n8n export:** See [How to test FlowForge exports in n8n](docs/n8n-testing-guide.md) (if the `docs/` folder is present in your clone).

### Clone / public repo: what works out of the box

If you clone the **public** repo (e.g. as a judge or random user), you get everything needed to run the app and generate **reliable, working n8n automations** (sans credentials):

- **Slack → LinkedIn** — Full PoC demo workflow is built in code; export is a complete n8n JSON. Add your own Slack, LLM API key, and LinkedIn credentials in n8n after import.
- **YouTube → LinkedIn** — Two-node workflow; export is runnable in n8n with credentials added.
- **Marketing / personalize emails** — Keyword detection returns a simplified canvas; export uses the full 24-node n8n template from `packages/workflow-engine/templates/personalize-marketing-emails.json` (included in the repo).

No server-side secrets or API keys are required to run the app; credentials are only needed inside n8n after you import the JSON.

**Gitignored / private assets** (e.g. `docs/`, `AGENTS.md`, `.cline/`, `.beads/`, `scripts/internal/`) are **not** used by the running application. They are for development, agents, and internal process only. Their absence in a clone is **not** a bottleneck for any functionality.

### For judges / MVP demo (≤120s)

1. Run the app locally (two terminals as above).
2. In the web UI, use the prompt: **"When I post a message in Slack, create a LinkedIn post"**
3. Click **Generate Workflow**, then **Export to n8n** (downloads `flowforge-n8n-export.json`).
4. In n8n, import that JSON. The workflow is ready except for **credentials**: add your own Slack, LLM API key (e.g. OpenAI-compatible), and LinkedIn in n8n. No other changes needed.

See [docs/mvp-demo.md](docs/mvp-demo.md) for the full demo script and “only add credentials” story (if `docs/` is present in your clone).

## Tech stack (to run FlowForge)

- **Node.js** 20+
- **pnpm** (see root `package.json` for `packageManager`)
- **Next.js 15** (web app), **Express** (API), **React Flow** (canvas), **Tailwind CSS** (styling)

Built with: Cursor, Antigravity, VS Code Copilot, Lovable (credited in the product).

## Multi-Agent Development

This project can be used with multiple IDEs and agentic tools. Decision and task tracking may use Beads (`bd`). For contributor context, see project docs if present (e.g. `docs/` or internal wiki).

## Documentation Structure

If the `docs/` folder is present in your clone:

- `docs/planning/` — planning and ideation
- `docs/design/` — UX/UI and design (including `docs/design/assets/` for graphical assets, if any)
- `docs/architecture/` — system architecture
- `docs/notes/` — development notes
- `docs/api/` — OpenAPI contract and API docs

API contract source of truth: `docs/api/openapi.yaml`.

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
- **Node asset library:** ontology + n8n node type → official names and icons so the canvas matches n8n’s UI (see *Node assets & n8n parity* below)

Long term:
- Multi-agent automation planning
- Marketplace-style workflow remixing
- Demo/default templates that work with minimal credential setup

### Node assets & n8n parity (roadmap)

Today the canvas uses a **small hardcoded map** of internal node labels to **Lucide icons** (e.g. MessageCircle for Slack, Linkedin for LinkedIn, Bot for OpenAI). The **ontology** (`packages/llm/data/node_ontology.json`) has `id` and `name` but **no** `n8nType` or `icon` field, and we do **not** ship n8n’s official node icons. So we do **not** yet have a robust library that matches n8n’s ontology, names, and official icons. For past-MVP, a proper asset library would: (1) extend the ontology with optional `n8nType` (e.g. `n8n-nodes-base.slackTrigger`) and `icon` (path or key); (2) map n8n node types to official icons (n8n stores these per-node in their repo as SVG/PNG; we could vendor or reference them); (3) drive canvas rendering from that single source so names and icons stay in sync with n8n.

## Repository

- **GitHub:** Clone from your fork or the canonical repo (e.g. `https://github.com/<your-org>/FlowForge`).
- **Product name:** FlowForge AI Automations

## Graphical assets

The web app **does not require** any custom graphical assets (logos, images) to run. Everything works with Tailwind and inline SVG. If you add your own assets (e.g. in `apps/web/public/`), you may protect them with a copyright notice; see **[ASSETS-LICENSE.md](ASSETS-LICENSE.md)** for a template.

## License

Apache License 2.0 (see [LICENSE](LICENSE)).
