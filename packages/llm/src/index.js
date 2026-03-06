/**
 * @flowforge/llm — LLM prompt engineering and workflow generation.
 * Provides few-shot examples, node ontology, and prompt building utilities.
 * Used by apps/api for /generate-workflow and /optimize-workflow endpoints.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load few-shot examples for training the LLM on workflow generation.
 * Each example maps a natural language prompt to a structured workflow.
 */
export function getFewShotExamples() {
  try {
    const path = join(__dirname, "../data/few_shot_examples.json");
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to load few-shot examples:", error);
    return { examples: [] };
  }
}

/**
 * Load the node ontology (supported node types and triggers).
 * Prevents LLM hallucination by constraining to known nodes.
 */
export function getNodeOntology() {
  try {
    const path = join(__dirname, "../data/node_ontology.json");
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to load node ontology:", error);
    return { nodes: {} };
  }
}

/**
 * Load workflow patterns for reference and analysis.
 */
export function getWorkflowPatterns() {
  try {
    const path = join(__dirname, "../data/workflow_patterns.json");
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to load workflow patterns:", error);
    return [];
  }
}

/**
 * Build a system prompt for the LLM that includes few-shot examples.
 * Layers: role prompt → rules → examples → user prompt.
 */
export function buildSystemPrompt() {
  const examples = getFewShotExamples();
  const ontology = getNodeOntology();

  // Extract trigger node types from ontology
  const triggerTypes = ontology?.nodes?.triggers?.map((t) => t.id) || [];

  const systemPrompt = `You are an expert automation architect specializing in workflow generation.

Your role is to convert natural language automation requests into structured workflow JSON.

RULES:
1. Always include exactly one trigger node (type: "trigger").
2. Trigger must be from the allowed list: ${triggerTypes.slice(0, 10).join(", ")}, etc.
3. All action nodes must be from the node ontology.
4. Return ONLY valid JSON matching the OpenAPI WorkflowGraph schema.
5. Maximum workflow depth: 7 steps from trigger to final action.
6. Use simple, reusable nodes from the ontology.

WORKFLOW STRUCTURE:
{
  "trigger": "trigger_node_id",
  "nodes": [
    {"id": "node-trigger-X", "type": "trigger", "label": "..."},
    {"id": "node-action-Y", "type": "action", "label": "..."}
  ],
  "connections": [
    {"source": "node-trigger-X", "target": "node-action-Y"}
  ]
}

FEW-SHOT EXAMPLES:
${examples?.examples
  ?.slice(0, 3) // Use first 3 examples in system prompt
  ?.map(
    (ex) => `
Example: ${ex.prompt}
Response:
{
  "trigger": "${ex.trigger}",
  "nodes": ${JSON.stringify(ex.nodes)},
  "connections": ${JSON.stringify(ex.connections)}
}`
  )
  .join("\n")}

Now generate a workflow JSON for the user's prompt.`;

  return systemPrompt;
}

/**
 * Legacy stub for backwards compatibility.
 */
export function hello() {
  return "llm";
}
