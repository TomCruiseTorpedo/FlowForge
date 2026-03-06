import { convertToN8n } from './packages/workflow-engine/src/index.js';

// Test workflow data
const testWorkflow = {
  id: "wf-test-001",
  trigger: "youtube_upload",
  nodes: [
    { id: "node-trigger-youtube", type: "trigger", label: "YouTube Upload" },
    { id: "node-generate-tweets", type: "action", label: "Generate 3 Tweets" },
    { id: "node-generate-linkedin", type: "action", label: "Generate LinkedIn Post" }
  ],
  connections: [
    { source: "node-trigger-youtube", target: "node-generate-tweets" },
    { source: "node-trigger-youtube", target: "node-generate-linkedin" }
  ]
};

try {
  const n8nWorkflow = convertToN8n(testWorkflow);
  console.log("SUCCESS: n8n conversion worked!");
  console.log(JSON.stringify(n8nWorkflow, null, 2));
} catch (error) {
  console.error("ERROR:", error.message);
}
