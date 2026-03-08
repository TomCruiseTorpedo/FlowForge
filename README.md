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

**Platform & shell:** The instructions below (and the helper scripts in `scripts/`) are written for **macOS with zsh**. This project was built on an Intel (x86_64) MacBook Pro running **macOS Sequoia 15.7.4** with **zsh**. On **Windows** (e.g. PowerShell or cmd) or **Linux**, you may need to adapt commands or run the app without the shell scripts — use two terminals and run `pnpm --filter api dev` and `pnpm dev` from the repo root instead of `./scripts/start-servers.sh`.

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

**Optional — one command to start or restart both (macOS / zsh):** From repo root, run `./scripts/start-servers.sh`. It will stop any existing process on ports 3000 and 4000, start both servers in the background, and write logs to `logs/api.log` and `logs/web.log`. To stop: `./scripts/stop-servers.sh`. On Windows or Linux, use two terminals and the `pnpm` commands above instead.

Optional: to point the web app at a different API URL, copy `apps/web/.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_API_URL`. Default is `http://localhost:4000`.

**Health check:** [http://localhost:4000/health](http://localhost:4000/health) should return `{"status":"ok","service":"flowforge-api"}`.

**Testing n8n export:** After exporting, import the downloaded JSON in n8n and add your credentials (Slack, LLM API key, LinkedIn). The steps in “For judges / MVP demo” below are sufficient. Extra guides (e.g. n8n testing, full demo script) live in the `docs/` folder, which is **not** included in the public repo — you don’t need them to run or export.

### Clone / public repo: what works out of the box

**What the public repo contains:** Everything needed to run the app and export n8n workflows is committed. That includes: app code (`apps/web`, `apps/api`), workflow engine and templates (`packages/workflow-engine/`, including `templates/personalize-marketing-emails.json`), node ontology and data (`packages/llm/data/`), and optional UI assets (`apps/web/public/`). No private or gitignored paths are required for functionality.

**What the public repo does *not* contain:** The `docs/` folder, `AGENTS.md`, `.cline/`, `.beads/`, `.github/`, `scripts/internal/`, and `.vscode/` are listed in `.gitignore` and are not published. They are used only for development, agents, and internal process. **Their absence in a clone does not affect running the app or generating/exporting workflows.**

If you clone the **public** repo (e.g. as a judge or random user), you get:

- **Slack → LinkedIn** — Full PoC demo workflow is built in code; export is a complete n8n JSON. Add your own Slack, LLM API key, and LinkedIn credentials in n8n after import.
- **YouTube → LinkedIn** — Two-node workflow; export is runnable in n8n with credentials added.
- **Marketing / personalize emails** — Keyword detection returns a simplified canvas; export uses the full 24-node n8n template from `packages/workflow-engine/templates/personalize-marketing-emails.json` (included in the repo).

No server-side secrets or API keys are required to run the app; credentials are only needed inside n8n after you import the JSON.

**Do the three suggested prompts produce legal/correct n8n workflows?**

- **Slack → LinkedIn (demo):** Yes. Export uses **buildSlackToLinkedInN8n**, which outputs the **exact same content and structure** as the reverse-engineered demo workflow: same node types (Slack Trigger, Basic LLM Chain, OpenAI Chat Model, Code, LinkedIn), connections, prompt text (from `prompt-contracts/slack-to-linkedin-post.js`), and K2 CoT-strip script. Only workflow/node IDs (UUIDs) and credentials differ; add your Slack, LLM API key, and LinkedIn in n8n and it runs.
- **YouTube → LinkedIn:** Yes, valid n8n JSON (Manual Trigger → YouTube → LinkedIn). n8n has no native “when I upload a video” trigger; the exported workflow is runnable manually or you can add a Schedule trigger to poll. Structure is correct; credentials needed in n8n.
- **Marketing (personalize emails):** Yes. Export returns the full **real n8n template** from `templates/personalize-marketing-emails.json` (24 nodes). It was exported from n8n; import and add credentials as needed.

**How robust is open-ended workflow generation?**

Right now it is **not** robust. Only the **three suggested prompts** (Slack→LinkedIn, YouTube→LinkedIn, Marketing) are recognized and produce the correct, tailored workflow. Any other prompt (e.g. "Chat with my database", "When I get an email label it", "SEO audit and email report", "Telegram assistant") does **not** trigger an LLM or custom builder — the API falls back to the **Slack→LinkedIn demo workflow** and the UI shows a warning that the request isn't supported. So:

- **Supported:** Exactly the three intents above (keyword-based: slack, youtube, or marketing/personalize/customer/email/sentiment/coupon/newsletter/campaign/segment).
- **Unsupported:** Everything else. Response includes `workflowMeta: { supportedIntent: false, reason: "..." }` and the canvas shows an amber banner steering the user to the suggested prompts. Export still returns valid n8n (the demo workflow) so the app doesn't break.

The many real-world n8n examples you provided (e.g. in `docs/n8n template JSONs/`) are the right reference for adding more template-based or future LLM-driven intents; until then, open-ended generation is intentionally explicit about being limited to the three supported flows. (Those example files live in the private `docs/` folder and are not in the public repo.)

**Gitignored / private assets** — Summary: `docs/`, `AGENTS.md`, `.cline/`, `.beads/`, `.github/`, `scripts/internal/`, `.vscode/`, and `*.code-workspace` are **not** in the public repo and are **not** used by the running application. Only development and tooling use them. No clone is left non-functional by their exclusion.

### For judges / MVP demo (≤120s)

1. Run the app locally (two terminals as above).
2. In the web UI, use the prompt: **"When I post a message in Slack, create a LinkedIn post"**
3. Click **Generate Workflow**, then **Export to n8n** (downloads `flowforge-n8n-export.json`).
4. In n8n, import that JSON. The workflow is ready except for **credentials**: add your own Slack, LLM API key (e.g. OpenAI-compatible), and LinkedIn in n8n. No other changes needed.
5. In Slack, post the message you want turned into a LinkedIn post. The prompt preserves full draft posts with minimal changes (plus 2–3 hashtags).

The public repo does not include a separate demo script file; the steps above are the full demo.

## Tech stack (to run FlowForge)

- **Node.js** 20+
- **pnpm** (see root `package.json` for `packageManager`)
- **Next.js 15** (web app), **Express** (API), **React Flow** (canvas), **Tailwind CSS** (styling)
- **Developed on:** Intel (x86_64) MacBook Pro, macOS Sequoia 15.7.4, zsh. Windows and Linux users can run the app with the same Node/pnpm stack but should use the two-terminal `pnpm` workflow instead of the provided shell scripts.

Built with: Cursor, Antigravity, VS Code Copilot, Lovable (credited in the product).

## Multi-Agent Development

This project can be used with multiple IDEs and agentic tools. Decision and task tracking may use Beads (`bd`). For contributor context, project docs may exist in a `docs/` folder or internal wiki; the **public** repo does not ship `docs/`, so this section applies only if you have that context (e.g. internal clone or maintainer).

## Documentation Structure

The **public** repo does not include a `docs/` folder. If you have one (e.g. from an internal or full clone), its structure may include:

- `docs/planning/` — planning and ideation
- `docs/design/` — UX/UI and design (including `docs/design/assets/` for graphical assets, if any)
- `docs/architecture/` — system architecture
- `docs/notes/` — development notes
- `docs/api/` — OpenAPI contract and API docs

API contract source of truth, when present: `docs/api/openapi.yaml`. Running and exporting the app do not depend on any of these paths.

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
