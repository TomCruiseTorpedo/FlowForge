# FlowForge AI Automations

Forge automations from plain English.

FlowForge is an AI-powered automation builder that converts natural language requests into structured workflows, visual node graphs, and exportable automation templates.

**About this build:** This repository is a **prototype hackathon build**. It is fully runnable locally and demonstrates the core flow (prompt → workflow → n8n export), but it is not a production release. Expect rough edges and MVP scope.

## Clone and run (public testers)

For judges or anyone cloning the public repo:

1. **Clone** the repo and `cd` into it.
2. **Install:** `pnpm install`
3. **Run the app** (two terminals from repo root):
   - Terminal 1: `pnpm --filter api dev`
   - Terminal 2: `pnpm dev`
4. **Open** [http://localhost:3000](http://localhost:3000). Use the prompt **"When I post a message in Slack, create a LinkedIn post"** → **Generate Workflow** → **Export to n8n**.
5. **Import** the downloaded JSON in n8n and add your Slack, LLM API key, and LinkedIn credentials. No other setup required.

Details and other workflow types are in **Quick Start** below.

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

**Platform & shell:** The instructions below (and the helper scripts in `scripts/`) are written for **macOS with zsh**. The project has been tested on **macOS Sequoia 15.7.4** (Intel x86_64). On **Windows** (e.g. PowerShell or cmd) or **Linux**, you may need to adapt commands or run the app without the shell scripts — use two terminals and run `pnpm --filter api dev` and `pnpm dev` from the repo root instead of `./scripts/start-servers.sh`.

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

**Testing n8n export:** After exporting, import the downloaded JSON in n8n and add your credentials (Slack, LLM API key, LinkedIn). The steps in “For judges / MVP demo” below are sufficient.

### Clone / public repo: what works out of the box

**What the public repo contains:** Everything needed to run the app and export n8n workflows: app code (`apps/web`, `apps/api`), workflow engine and templates (`packages/workflow-engine/`), and node data (`packages/llm/data/`). No other paths are required.

**What the public repo does *not* contain:** Some paths (e.g. internal docs, tooling config) are gitignored and not published. Their absence does not affect running the app or exporting workflows. Optional scripts in `scripts/` that depend on those paths exit gracefully on a public clone; use the in-app **Export to n8n** for the standard workflow.

If you clone the **public** repo (e.g. as a judge or random user), you get:

- **Slack → LinkedIn** — Full PoC demo workflow is built in code; export is a complete n8n JSON. Add your own Slack, LLM API key, and LinkedIn credentials in n8n after import.
- **YouTube → LinkedIn** — Two-node workflow; export is runnable in n8n with credentials added.
- **Marketing / personalize emails** — Keyword detection returns a simplified canvas; export uses the full 24-node n8n template from `packages/workflow-engine/templates/personalize-marketing-emails.json` (included in the repo).

No server-side secrets or API keys are required to run the app; credentials are only needed inside n8n after you import the JSON.

**Do the three suggested prompts produce legal/correct n8n workflows?**

- **Slack → LinkedIn (demo):** Yes. Same structure and node types (Slack Trigger, LLM Chain, Code, LinkedIn); add your Slack, LLM API key, and LinkedIn in n8n and it runs.
- **YouTube → LinkedIn:** Yes, valid n8n JSON (Manual Trigger → YouTube → LinkedIn). n8n has no native “when I upload a video” trigger; the exported workflow is runnable manually or you can add a Schedule trigger to poll. Structure is correct; credentials needed in n8n.
- **Marketing (personalize emails):** Yes. Export returns the full **real n8n template** from `templates/personalize-marketing-emails.json` (24 nodes). It was exported from n8n; import and add credentials as needed.

**How robust is open-ended workflow generation?**

Right now it is **not** robust. Only the **three suggested prompts** (Slack→LinkedIn, YouTube→LinkedIn, Marketing) are recognized and produce the correct, tailored workflow. Any other prompt (e.g. "Chat with my database", "When I get an email label it", "SEO audit and email report", "Telegram assistant") does **not** trigger an LLM or custom builder — the API falls back to the **Slack→LinkedIn demo workflow** and the UI shows a warning that the request isn't supported. So:

- **Supported:** Exactly the three intents above (keyword-based: slack, youtube, or marketing/personalize/customer/email/sentiment/coupon/newsletter/campaign/segment).
- **Unsupported:** Everything else. Response includes `workflowMeta: { supportedIntent: false, reason: "..." }` and the canvas shows an amber banner steering the user to the suggested prompts. Export still returns valid n8n (the demo workflow) so the app doesn't break.

The codebase is structured to support more template-based or LLM-driven intents; expanding beyond the three flows would follow the same pattern. Until then, open-ended generation is intentionally limited and the UI is explicit about it.

### For judges / MVP demo (≤120s)

1. Run the app locally (two terminals as above).
2. In the web UI, use the prompt: **"When I post a message in Slack, create a LinkedIn post"**
3. Click **Generate Workflow**, then **Export to n8n** (downloads `flowforge-n8n-export.json`).
4. In n8n, import that JSON. The workflow is ready except for **credentials**: add your own Slack, LLM API key (e.g. OpenAI-compatible), and LinkedIn in n8n. No other changes needed.
5. In Slack, post the message you want turned into a LinkedIn post. The workflow turns rough input into a polished post (or preserves a clear draft with minimal changes and adds 2–3 hashtags).

## Tech stack (to run FlowForge)

- **Node.js** 20+
- **pnpm** (see root `package.json` for `packageManager`)
- **Next.js 15** (web app), **Express** (API), **React Flow** (canvas), **Tailwind CSS** (styling)
- **Developed and tested on:** macOS Sequoia 15.7.4 (Intel x86_64), zsh. Windows and Linux users can run the app with the same Node/pnpm stack but should use the two-terminal `pnpm` workflow instead of the provided shell scripts.

Credits: Cursor, Antigravity, VS Code Copilot, Lovable (see in-app footer).

## Roadmap

- **Near term:** Workflow optimization suggestions, template library, credential setup guidance, node/icon parity with n8n.
- **Longer term:** Multi-agent automation planning, marketplace-style workflow remixing, demo templates with minimal credential setup.

## Repository

- **GitHub:** Clone from the repository or your fork (e.g. `https://github.com/<org>/FlowForge`).
- **Product name:** FlowForge AI Automations

## Graphical assets

The web app **does not require** any custom graphical assets (logos, images) to run. Everything works with Tailwind and inline SVG. If you add your own assets (e.g. in `apps/web/public/`), you may protect them with a copyright notice; see **[ASSETS-LICENSE.md](ASSETS-LICENSE.md)** for a template.

## License

Apache License 2.0 (see [LICENSE](LICENSE)).
