import express from "express";
import cors from "cors";
import { convertToN8n } from "@flowforge/workflow-engine";
import { getNodeOntology } from "@flowforge/llm";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true })); // Allow browser origin (e.g. localhost:3000 → 4000)
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "flowforge-api" });
});

/**
 * Load node ontology from packages/llm/data/node_ontology.json.
 * Ontology is single source of truth for valid node types.
 */
function loadNodeOntology() {
  const ontology = getNodeOntology();

  // Extract trigger IDs from the ontology structure
  const triggerIds = (ontology?.nodes?.triggers || [])
    .map(t => t.id)
    .filter(Boolean);

  // Extract action IDs from the ontology structure
  const actionIds = (ontology?.nodes?.actions || [])
    .map(a => a.id)
    .filter(Boolean);

  return {
    triggers: triggerIds,
    actions: actionIds,
    fullOntology: ontology
  };
}

// Initialize ontology at startup
let nodeOntology = loadNodeOntology();

if (!nodeOntology.triggers?.length || !nodeOntology.actions?.length) {
  console.error(
    "FlowForge API: node ontology failed to load (missing or invalid packages/llm/data/node_ontology.json). Validation will reject all workflows."
  );
}

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

  // Stub workflow: Slack→LinkedIn (full template) when Slack is mentioned; YouTube→LinkedIn when only YouTube; no X/Twitter (paid API).
  // Template-based: marketing/personalize/customer email → full n8n from templates/personalize-marketing-emails.json
  const promptLower = (prompt || '').toLowerCase();
  const useSlackTrigger = promptLower.includes('slack');
  const useYouTubeTrigger = promptLower.includes('youtube') && !useSlackTrigger;
  const slackToLinkedInOnly = useSlackTrigger; // always full Slack→LinkedIn when Slack mentioned; ignore tweet/twitter/x

  // Marketing/personalization template: keywords that indicate "personalize marketing emails" style workflow
  const marketingKeywords = ['marketing', 'personalize', 'personalise', 'customer', 'email', 'sentiment', 'coupon', 'newsletter', 'campaign', 'segment'];
  const useMarketingTemplate = !useSlackTrigger && !useYouTubeTrigger && marketingKeywords.some(kw => promptLower.includes(kw));

  let nodes, edges, triggerId;
  let workflowMeta; // optional: { supportedIntent: false, reason } when prompt doesn't match any template
  if (useMarketingTemplate) {
    // Simplified canvas for template-based export: Manual Trigger → Personalize with AI → Send Email (ontology-valid)
    const DX = 280;
    nodes = [
      { id: "node-trigger-manual", type: "trigger", label: "Manual Trigger", position: [0, 100] },
      { id: "node-personalize", type: "action", label: "Personalize with AI", position: [DX, 100] },
      { id: "node-send-email", type: "action", label: "Send Email", position: [2 * DX, 100] },
    ];
    edges = [
      { source: "node-trigger-manual", target: "node-personalize" },
      { source: "node-personalize", target: "node-send-email" },
    ];
    triggerId = "node-trigger-manual";
  } else if (slackToLinkedInOnly) {
    // Layout: main path left→right (Slack → LLM Chain → Code → LinkedIn), OpenAI below chain
    const DX = 240;
    const DY = 160;
    nodes = [
      { id: "node-trigger-slack", type: "trigger", label: "Slack Message", position: [0, 80] },
      { id: "node-llm-chain", type: "action", label: "Basic LLM Chain", position: [DX, 80] },
      { id: "node-openai-model", type: "action", label: "OpenAI Chat Model", position: [DX, 80 + DY] },
      { id: "node-code-js", type: "action", label: "Code in JavaScript", position: [2 * DX, 80] },
      { id: "node-generate-linkedin", type: "action", label: "Generate LinkedIn Post", position: [3 * DX, 80] },
    ];
    edges = [
      { source: "node-trigger-slack", target: "node-llm-chain" },
      { source: "node-llm-chain", target: "node-code-js" },
      { source: "node-openai-model", target: "node-llm-chain" },
      { source: "node-code-js", target: "node-generate-linkedin" },
    ];
    triggerId = "node-trigger-slack";
  } else if (useYouTubeTrigger) {
    nodes = [
      { id: "node-trigger-youtube", type: "trigger", label: "YouTube Upload" },
      { id: "node-generate-linkedin", type: "action", label: "Generate LinkedIn Post" },
    ];
    edges = [
      { source: "node-trigger-youtube", target: "node-generate-linkedin" },
    ];
    triggerId = "node-trigger-youtube";
  } else {
    // Unsupported intent: prompt doesn't match Slack, YouTube, or marketing. We do NOT have open-ended
    // LLM-based generation yet; only the 3 template intents are robust. Return the demo workflow but flag
    // so the UI can show "not supported" and steer users to the suggested prompts.
    const DX = 240;
    const DY = 160;
    nodes = [
      { id: "node-trigger-slack", type: "trigger", label: "Slack Message", position: [0, 80] },
      { id: "node-llm-chain", type: "action", label: "Basic LLM Chain", position: [DX, 80] },
      { id: "node-openai-model", type: "action", label: "OpenAI Chat Model", position: [DX, 80 + DY] },
      { id: "node-code-js", type: "action", label: "Code in JavaScript", position: [2 * DX, 80] },
      { id: "node-generate-linkedin", type: "action", label: "Generate LinkedIn Post", position: [3 * DX, 80] },
    ];
    edges = [
      { source: "node-trigger-slack", target: "node-llm-chain" },
      { source: "node-llm-chain", target: "node-code-js" },
      { source: "node-openai-model", target: "node-llm-chain" },
      { source: "node-code-js", target: "node-generate-linkedin" },
    ];
    triggerId = "node-trigger-slack";
    workflowMeta = { supportedIntent: false, reason: 'Prompt does not match a supported workflow type. Only the three suggested prompts (Slack→LinkedIn, YouTube→LinkedIn, Marketing) produce tailored automations. This is the demo workflow instead.' };
  }

  const workflow = {
    id: useMarketingTemplate ? "wf-stub-marketing-001" : slackToLinkedInOnly ? "wf-stub-slack-linkedin-001" : useYouTubeTrigger ? "wf-stub-youtube-linkedin-001" : "wf-stub-slack-linkedin-001",
    trigger: useMarketingTemplate ? "manual_trigger" : slackToLinkedInOnly ? "slack_message" : useYouTubeTrigger ? "youtube_upload" : "slack_message",
    ...(useMarketingTemplate && { templateId: "personalize-marketing-emails" }),
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
    ...(workflowMeta && { workflowMeta }),
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

  // Validate required workflow fields (when not using a template, nodes/connections required)
  const useTemplate = Boolean(workflow.templateId);
  if (!useTemplate) {
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

/**
 * POST /optimize-workflow — analyze workflow and return optimizations
 * Contract: accepts {"workflow": WorkflowGraph} and returns {"suggestions": [""]}
 */
app.post("/optimize-workflow", (req, res) => {
  const workflow = req.body?.workflow;

  if (!workflow || typeof workflow !== 'object') {
    return res.status(400).json({
      error: "Invalid request payload: workflow object required",
    });
  }

  // Stub suggestions based on structure or business rules (FlowForge-dri specification)
  const suggestions = [];

  // Basic optimization heuristic logic stub
  if (!workflow.nodes || workflow.nodes.length < 2) {
    suggestions.push("Consider expanding this automation with an action step to make it useful.");
  } else {
    suggestions.push("Consider adding a 'Wait' or 'Approval' step before executing destructive actions.");
    suggestions.push("You can optimize node processing by batching adjacent API call steps together.");
  }

  if (!workflow.connections || workflow.connections.length === 0) {
    suggestions.push("Your nodes are currently unconnected. Link triggers to actions.");
  }

  return res.status(200).json({
    suggestions
  });
});

app.listen(PORT, () => {
  console.log(`FlowForge API listening on http://localhost:${PORT}`);
});
