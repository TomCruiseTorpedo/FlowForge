# Few-Shot Examples for FlowForge LLM

## Overview

This document describes how FlowForge uses few-shot learning to train the workflow generation LLM to convert natural language prompts into structured automation workflows.

## Purpose

Few-shot examples improve LLM reliability by:

- **Demonstrating correct format** — Shows the exact JSON structure expected
- **Establishing patterns** — Trains the model on common automation workflows
- **Reducing hallucination** — Constrains the model to use nodes from the ontology
- **Improving consistency** — Ensures predictable output structure

## File Location

Few-shot examples are stored in `packages/llm/data/few_shot_examples.json`.

Each example contains:

- `id` — Unique identifier (example-001, example-002, etc.)
- `prompt` — Natural language input from the user
- `trigger` — The trigger node type from the ontology
- `nodes` — Array of workflow nodes with id, type, and label
- `connections` — Array of node connections (source → target)

## Schema Alignment

All examples match the OpenAPI schema defined in `docs/api/openapi.yaml`:

### WorkflowNode

```
{
  "id": "node-trigger-youtube",        // Unique node ID
  "type": "trigger",                    // "trigger" or "action"
  "label": "YouTube Upload"             // Human-readable name
}
```

### WorkflowEdge

```
{
  "source": "node-trigger-youtube",     // Source node ID
  "target": "node-fetch-transcript"     // Target node ID
}
```

## LLM Prompt Integration

The few-shot examples are incorporated into the LLM system prompt as follows:

### Layer Structure

```
System Role
  ↓
Automation Rules
  ↓
Few-Shot Examples (from this file)
  ↓
User Prompt
```

### Example Integration in Prompt

```
You are an expert automation architect.

Rules:
1. Always include exactly one trigger node.
2. All nodes must be from the node ontology.
3. Return structured JSON only.

Example:

Prompt: "When I upload a YouTube video, create 3 tweets and a LinkedIn post"

Workflow:
{
  "trigger": "youtube_upload",
  "nodes": [
    {"id": "node-trigger-youtube", "type": "trigger", "label": "YouTube Upload"},
    {"id": "node-fetch-transcript", "type": "action", "label": "Fetch Transcript"},
    {"id": "node-generate-tweets", "type": "action", "label": "Generate 3 Tweets"},
    {"id": "node-generate-linkedin", "type": "action", "label": "Generate LinkedIn Post"}
  ],
  "connections": [
    {"source": "node-trigger-youtube", "target": "node-fetch-transcript"},
    {"source": "node-fetch-transcript", "target": "node-generate-tweets"},
    {"source": "node-fetch-transcript", "target": "node-generate-linkedin"}
  ]
}

Now generate a workflow for: {USER_PROMPT}
```

## Adding to Code

The LLM agent loads these examples in `packages/llm/src/index.js`:

```javascript
const examples = require('./data/few_shot_examples.json');

// Each example is injected into the system prompt before calling the LLM
const systemPrompt = buildSystemPrompt(examples);
```

## Node Naming Conventions

Nodes follow a consistent naming pattern:

- **Trigger nodes**: `node-trigger-{service}` — e.g., `node-trigger-youtube`, `node-trigger-form`
- **Action nodes**: `node-{action}-{target}` — e.g., `node-generate-tweets`, `node-send-email`

This consistency helps the LLM understand and generate node IDs correctly.

## Connection Patterns

Common connection patterns in the examples:

### Linear (Sequential)

```
Trigger → Action → Action → Action
```

Used for workflows that process data sequentially.

### Parallel (Fan-Out)

```
Trigger → Action 1
       → Action 2
       → Action 3
```

Used when one trigger feeds into multiple independent actions.

### Mixed (Sequential then Parallel)

```
Trigger → Process → Generate Output 1
                 → Generate Output 2
```

Used for workflows that fetch data, then split into multiple outputs.

## Validity Constraints

All examples satisfy these constraints:

- **Single trigger**: Exactly one trigger node per workflow
- **Workflow depth**: Maximum 4-5 steps (trigger to final action)
- **Node type validity**: All nodes exist in `packages/llm/data/node_ontology.json`
- **Connection validity**: Connections only exist between defined nodes
- **Acyclic graph**: No circular dependencies

## Extending the Examples

To add more examples:

1. **Select a natural language prompt** — A user-friendly automation request
2. **Identify the trigger** — Which event starts this workflow
3. **List the steps** — What nodes should process the data
4. **Define connections** — How data flows between nodes
5. **Add to the array** — Insert into `few_shot_examples.json`
6. **Test the structure** — Validate against OpenAPI schema

Example template:

```json
{
  "id": "example-009",
  "prompt": "Natural language request here",
  "trigger": "trigger_node_id",
  "nodes": [
    {"id": "node-trigger-x", "type": "trigger", "label": "Trigger Label"},
    {"id": "node-action-x", "type": "action", "label": "Action Label"}
  ],
  "connections": [
    {"source": "node-trigger-x", "target": "node-action-x"}
  ]
}
```

## Related Files

- **Few-shot examples**: `packages/llm/data/few_shot_examples.json`
- **Node ontology**: `packages/llm/data/node_ontology.json`
- **Workflow patterns**: `packages/llm/data/workflow_patterns.json`
- **OpenAPI schema**: `docs/api/openapi.yaml`
- **LLM generator code**: `packages/llm/src/index.js`
- **Planning docs**: `docs/planning/` — 01-project-overview-and-build, 02-automation-knowledge-base, 03-few-shot-and-node-ontology, 04-execution-pipeline, 05-agent-architecture, 06-prompts-and-blueprint, 07-solo-mvp-and-hackathon (extracted from ChatGPT conversation).
