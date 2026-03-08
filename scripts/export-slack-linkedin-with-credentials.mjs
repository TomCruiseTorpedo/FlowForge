#!/usr/bin/env node
/**
 * Internal use: Build Slack→LinkedIn n8n workflow with credentials from
 * docs/FlowForge MVP Demo.json and exact-post override from docs/demo-slack-message-vibecoding.md.
 * Requires docs/ (gitignored in public repo). On public clone, exit gracefully — use the app's Export to n8n instead.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSlackToLinkedInN8n } from "../packages/workflow-engine/src/buildSlackToLinkedInN8n.js";
import { K2_STRIP_JS } from "../packages/workflow-engine/src/prompt-contracts/slack-to-linkedin-post.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const demoPath = path.join(root, "docs", "FlowForge MVP Demo.json");
const demoDocPath = path.join(root, "docs", "demo-slack-message-vibecoding.md");
const outPath = path.join(root, "docs", "FlowForge-Slack-LinkedIn-with-credentials.json");

if (!fs.existsSync(demoPath) || !fs.existsSync(demoDocPath)) {
  console.log("Internal-use script: docs/ not present (expected on public clone). Use the app's Export to n8n for the standard workflow.");
  process.exit(0);
}

/** Extract the "Expected LinkedIn output" code block from the demo doc (internal). */
function extractExactPost(md) {
  const marker = "## Expected LinkedIn output";
  const idx = md.indexOf(marker);
  if (idx === -1) return null;
  const after = md.slice(idx + marker.length);
  const open = after.indexOf("```");
  if (open === -1) return null;
  const start = after.indexOf("\n", open) + 1;
  const close = after.indexOf("```", start);
  if (close === -1) return null;
  return after.slice(start, close).trim();
}

const demoJson = JSON.parse(fs.readFileSync(demoPath, "utf8"));
const demoDoc = fs.readFileSync(demoDocPath, "utf8");
const exactPost = extractExactPost(demoDoc);
if (!exactPost) {
  console.error("Could not extract Expected LinkedIn output from", demoDocPath);
  process.exit(1);
}

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

// Inject demo override into the single Code node (no extra node — same 4-node flow)
const codeWithoutReturn = K2_STRIP_JS.replace(/\s*return \[\{ json: \{ text: s \} \}\];\s*$/, "");
// Use placeholder for newlines so JSON/import never touches real newlines; we replace at runtime only
const PLACEHOLDER = "___NEWLINE___";
const exactPostOneLine = exactPost.replace(/\r?\n/g, PLACEHOLDER);
const exactPostEscaped = exactPostOneLine.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
const demoBlock = `
// When Slack input mentions Sabrina + Marcin + Vibecoding, use exact post from internal doc (no extra node)
const slackText = ($('Slack Message').item && $('Slack Message').item.json && $('Slack Message').item.json.text) ? String($('Slack Message').item.json.text) : '';
const lowerSlack = slackText.toLowerCase();
if (lowerSlack.includes('sabrina') && lowerSlack.includes('marcin') && lowerSlack.includes('vibecoding')) {
  s = \`${exactPostEscaped}\`.split('${PLACEHOLDER}').join(String.fromCharCode(10));
  s = s + String.fromCharCode(10) + String.fromCharCode(10) + '— FlowForge demo · ' + Date.now();
}
// LLM path often outputs literal \\n — normalize to real newlines
s = String(s).split(String.fromCharCode(92) + 'n').join(String.fromCharCode(10));
return [{ json: { text: s } }];`;

const codeNode = n8nWorkflow.nodes.find((n) => n.name === "Code in JavaScript");
codeNode.parameters.jsCode = codeWithoutReturn + demoBlock;

fs.writeFileSync(outPath, JSON.stringify(n8nWorkflow, null, 2), "utf8");
console.log("Wrote:", outPath);
console.log("Exact post when Slack has Sabrina + Marcin + Vibecoding; logic is inside Code in JavaScript (no extra node).");
