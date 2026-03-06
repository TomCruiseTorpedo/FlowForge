import express from "express";
import { convertToN8n } from "@flowforge/workflow-engine";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "flowforge-api" });
});

// Load node ontology for validation
const nodeOntology = {
  triggers: [
    "youtube_upload",
    "github_issue", 
    "blog_post_published",
    "email_received"
  ],
  actions: [
    "generate_tweets",
    "generate_linkedin_post",
    "send_email",
    "create_github_issue",
    "post_to_twitter"
  ]
};

/**
 * Validate workflow structure according to business rules
 */
function validateWorkflow(workflow) {
  const errors = [];
  
  // Rule 1: Trigger required
  const hasTrigger = workflow.nodes.some(node => node.type === "trigger");
  if (!hasTrigger) {
    errors.push("Workflow must contain at least one trigger node");
  }
  
  // Rule 2: Steps from ontology
  const invalidNodes = workflow.nodes.filter(node => {
    if (node.type === "trigger") {
      return !nodeOntology.triggers.includes(node.label.toLowerCase().replace(/\s+/g, "_"));
    } else if (node.type === "action") {
      return !nodeOntology.actions.includes(node.label.toLowerCase().replace(/\s+/g, "_"));
    }
    return true; // Unknown node types are invalid
  });
  
  if (invalidNodes.length > 0) {
    errors.push(`Invalid node types found: ${invalidNodes.map(n => n.label).join(", ")}`);
  }
  
  // Rule 3: Max 7 steps
  if (workflow.nodes.length > 7) {
    errors.push(`Workflow exceeds maximum node limit of 7 (found ${workflow.nodes.length})`);
  }
  
  return errors;
}

/**
 * POST /generate-workflow — generate workflow from natural language prompt.
 * Contract: docs/api/openapi.yaml (GenerateWorkflowRequest → GenerateWorkflowResponse)
 * Stub: returns fixed example workflow; LLM integration later.
 */
app.post("/generate-workflow", (req, res) => {
  const prompt = req.body?.prompt;
  const includeN8nExport = req.body?.includeN8nExport === true;
  
  if (typeof prompt !== "string" || prompt.length < 3) {
    return res.status(400).json({
      error: "Invalid request payload: prompt required (string, minLength 3)",
    });
  }

  // Stub workflow matching OpenAPI WorkflowGraph + nodes + edges
  const nodes = [
    { id: "node-trigger-youtube", type: "trigger", label: "YouTube Upload" },
    { id: "node-generate-tweets", type: "action", label: "Generate Tweets" },
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

  // Apply validation rules
  const validationErrors = validateWorkflow(workflow);
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Workflow validation failed",
      details: validationErrors
    });
  }

  const response = {
    workflow,
    nodes,
    edges,
  };

  // Optionally include n8n export if requested
  if (includeN8nExport) {
    try {
      const n8nWorkflow = convertToN8n(workflow);
      response.n8nExport = {
        n8nWorkflow,
        format: 'n8n',
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating n8n export:', error);
      // Don't fail the whole request, just note the error
      response.n8nExport = {
        error: "Failed to generate n8n export",
        details: error.message
      };
    }
  }

  return res.status(200).json(response);
});

/**
 * POST /export — export workflow to n8n JSON format
 * Contract: accepts workflow object and returns n8n-compatible JSON
 */
app.post("/export", (req, res) => {
  const workflow = req.body?.workflow;
  if (!workflow || typeof workflow !== 'object') {
    return res.status(400).json({
      error: "Invalid request payload: workflow object required",
    });
  }

  // Validate required workflow fields
  if (!workflow.nodes || !Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    return res.status(400).json({
      error: "Invalid workflow: nodes array is required and must not be empty",
    });
  }

  if (!workflow.connections || !Array.isArray(workflow.connections)) {
    return res.status(400).json({
      error: "Invalid workflow: connections array is required",
    });
  }

  try {
    const n8nWorkflow = convertToN8n(workflow);
    
    return res.status(200).json({
      n8nWorkflow,
      format: 'n8n',
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error converting workflow to n8n:', error);
    return res.status(500).json({
      error: "Failed to convert workflow to n8n format",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`FlowForge API listening on http://localhost:${PORT}`);
});
