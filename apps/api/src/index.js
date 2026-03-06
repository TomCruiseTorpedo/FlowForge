import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "flowforge-api" });
});

/**
 * POST /generate-workflow — generate workflow from natural language prompt.
 * Contract: docs/api/openapi.yaml (GenerateWorkflowRequest → GenerateWorkflowResponse)
 * Stub: returns fixed example workflow; LLM integration later.
 */
app.post("/generate-workflow", (req, res) => {
  const prompt = req.body?.prompt;
  if (typeof prompt !== "string" || prompt.length < 3) {
    return res.status(400).json({
      error: "Invalid request payload: prompt required (string, minLength 3)",
    });
  }

  // Stub workflow matching OpenAPI WorkflowGraph + nodes + edges
  const nodes = [
    { id: "node-trigger-youtube", type: "trigger", label: "YouTube Upload" },
    { id: "node-generate-tweets", type: "action", label: "Generate 3 Tweets" },
    { id: "node-generate-linkedin", type: "action", label: "Generate LinkedIn Post" },
  ];
  const edges = [
    { source: "node-trigger-youtube", target: "node-generate-tweets" },
    { source: "node-trigger-youtube", target: "node-generate-linkedin" },
  ];
  const workflow = {
    id: "wf-stub-001",
    trigger: "youtube_upload",
    nodes,
    connections: edges,
  };

  return res.status(200).json({
    workflow,
    nodes,
    edges,
  });
});

app.listen(PORT, () => {
  console.log(`FlowForge API listening on http://localhost:${PORT}`);
});
