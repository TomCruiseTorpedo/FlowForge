#!/usr/bin/env node
/**
 * Internal use: Build Slack→LinkedIn n8n workflow with credentials from
 * docs/FlowForge MVP Demo.json. Requires docs/ (gitignored in public repo). On public clone, exit gracefully.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSlackToLinkedInN8n } from "../packages/workflow-engine/src/buildSlackToLinkedInN8n.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const demoPath = path.join(root, "docs", "FlowForge MVP Demo.json");
const outPath = path.join(root, "docs", "FlowForge-Slack-LinkedIn-with-credentials.json");

if (!fs.existsSync(demoPath)) {
  console.log("Internal-use script: docs/ not present (expected on public clone). Use the app's Export to n8n for the standard workflow.");
  process.exit(0);
}

const demoJson = JSON.parse(fs.readFileSync(demoPath, "utf8"));
const workflowStub = {
  id: "wf-stub-slack-linkedin-001",
  trigger: "slack_message",
  nodes: [
    { id: "n1", type: "trigger", label: "Slack Message" },
    { id: "n2", type: "action", label: "Basic LLM Chain" },
    { id: "n3", type: "action", label: "OpenAI Chat Model" },
    { id: "n4", type: "action", label: "Code in JavaScript" },
    { id: "n5", type: "action", label: "Generate LinkedIn Post" },
  ],
  connections: [
    { source: "n1", target: "n2" },
    { source: "n2", target: "n4" },
    { source: "n3", target: "n2" },
    { source: "n4", target: "n5" },
  ],
};

const n8nWorkflow = buildSlackToLinkedInN8n(workflowStub, { credentialsFromN8n: demoJson });
fs.writeFileSync(outPath, JSON.stringify(n8nWorkflow, null, 2), "utf8");
console.log("Wrote:", outPath);
