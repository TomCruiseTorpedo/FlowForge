/**
 * @flowforge/workflow-engine — parser, graph mapper, export builder.
 * Maps internal workflow to React Flow nodes/edges and n8n JSON.
 */

import { buildSlackToLinkedInN8n } from './buildSlackToLinkedInN8n.js';

/**
 * Returns true when workflow is Slack→LinkedIn (no Tweet/X).
 * Accepts either 2-node (legacy) or 5-node (canvas) shape; export always uses full template.
 */
function isSlackToLinkedInOnly(workflow) {
  if (!workflow?.nodes?.length || !workflow.connections?.length) return false;
  const labels = workflow.nodes.map(n => n.label?.toLowerCase() || '');
  const hasSlack = labels.some(l => l.includes('slack'));
  const hasLinkedIn = labels.some(l => l.includes('linkedin'));
  const hasTweet = labels.some(l => l.includes('tweet') || l.includes('twitter') || l === 'x');
  if (!hasSlack || !hasLinkedIn || hasTweet) return false;
  // 2-node: trigger + action; 5-node: full diagram (Slack, Basic LLM Chain, OpenAI, Code, LinkedIn)
  const isFullDiagram = workflow.nodes.length === 5 &&
    labels.some(l => l.includes('basic llm') || l.includes('llm chain')) &&
    labels.some(l => l.includes('code')) &&
    labels.some(l => l.includes('openai'));
  return workflow.nodes.length === 2 || isFullDiagram;
}

/**
 * Convert FlowForge workflow to n8n JSON format
 * @param {Object} workflow - Internal workflow representation
 * @param {string} workflow.id - Workflow ID
 * @param {string} workflow.trigger - Trigger type
 * @param {Array} workflow.nodes - Array of workflow nodes
 * @param {Array} workflow.connections - Array of connections between nodes
 * @returns {Object} n8n-compatible workflow JSON
 */
export function convertToN8n(workflow) {
  if (!workflow || !workflow.nodes || !workflow.connections) {
    throw new Error('Invalid workflow: missing required fields');
  }

  // Full template: Slack → LLM → Code (K2 strip) → LinkedIn (prompt contract; user adds credentials)
  if (isSlackToLinkedInOnly(workflow)) {
    return buildSlackToLinkedInN8n(workflow);
  }

  // Map internal nodes to n8n nodes. Match official n8n templates: UUID id, position [x,y] only (no positionEnd).
  // If first node is YouTube trigger, prepend Manual Trigger so the workflow is runnable and the YouTube node shows its logo.
  // Slack trigger is a real trigger in n8n — no Manual Trigger prepended.
  const firstNode = workflow.nodes[0];
  const isFirstYouTubeTrigger = firstNode?.type === 'trigger' && firstNode?.label?.toLowerCase().includes('youtube');
  const isFirstSlackTrigger = firstNode?.type === 'trigger' && firstNode?.label?.toLowerCase().includes('slack');

  const n8nNodes = [];
  let nodeIndex = 0;

  if (isFirstYouTubeTrigger) {
    n8nNodes.push({
      id: generateId(),
      name: "When clicking 'Test workflow'",
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [100 + nodeIndex * 420, 150 + nodeIndex * 80],
      parameters: {}
    });
    nodeIndex++;
  }

  workflow.nodes.forEach((node, index) => {
    const n8nId = generateId();
    const position = [100 + nodeIndex * 420, 150 + nodeIndex * 80];

    // Map node types to n8n node types
    let n8nType, n8nParameters = {}, typeVersion = 1;

    switch (node.type) {
      case 'trigger':
        if (node.label.toLowerCase().includes('youtube')) {
          // n8n built-in node type is youTube (capital T); youtube (lowercase) can show fallback icon
          n8nType = 'n8n-nodes-base.youTube';
          n8nParameters = { resource: 'video', operation: 'get', videoId: '={{ $json.videoId || "dQw4w9WgXcQ" }}' };
          typeVersion = 1;
        } else if (node.label.toLowerCase().includes('slack')) {
          // n8n Slack Trigger: configure event (e.g. message posted to channel) and channel in n8n
          n8nType = 'n8n-nodes-base.slackTrigger';
          n8nParameters = {};
          typeVersion = 1;
        } else {
          n8nType = 'n8n-nodes-base.manualTrigger';
          n8nParameters = {};
          typeVersion = 1;
        }
        break;

      case 'action':
        if (node.label.toLowerCase().includes('tweet') || node.label.toLowerCase().includes('twitter') || node.label.toLowerCase().includes(' x ') || node.label.toLowerCase() === 'x') {
          // n8n docs use n8n-nodes-base.twitter (X node); typeVersion 2 for current API so the X logo shows
          n8nType = 'n8n-nodes-base.twitter';
          n8nParameters = {
            resource: 'tweet',
            operation: 'create',
            text: 'Generated tweet content'
          };
          typeVersion = 2;
        } else if (node.label.toLowerCase().includes('linkedin')) {
          n8nType = 'n8n-nodes-base.linkedIn';
          n8nParameters = {
            resource: 'post',
            operation: 'create',
            text: 'Generated LinkedIn post content'
          };
          typeVersion = 1;
        } else {
          // httpRequest typeVersion 4.2 matches the current n8n node schema
          n8nType = 'n8n-nodes-base.httpRequest';
          n8nParameters = {
            method: 'POST',
            url: 'https://example.com/webhook',
            sendBody: true,
            bodyParameters: {
              parameters: [{ name: 'action', value: '={{ $json.action }}' }]
            }
          };
          typeVersion = 4.2;
        }
        break;

      default:
        n8nType = 'n8n-nodes-base.httpRequest';
        n8nParameters = {
          method: 'GET',
          url: 'https://example.com'
        };
        typeVersion = 4.2;
    }

    n8nNodes.push({
      id: n8nId,
      name: node.label,
      type: n8nType,
      typeVersion,
      position,
      parameters: n8nParameters
    });
    nodeIndex++;
  });

  // Map internal connections to n8n connections (use node names as keys)
  const n8nConnections = {};
  const firstName = isFirstYouTubeTrigger ? n8nNodes[1].name : n8nNodes[0].name; // first workflow node's n8n name

  if (isFirstYouTubeTrigger && n8nNodes.length > 1) {
    n8nConnections[n8nNodes[0].name] = { main: [[{ node: firstName, type: 'main', index: 0 }]] };
  }
  // Slack trigger: no prepended node; connections from workflow.connections are sufficient

  workflow.connections.forEach(connection => {
    const sourceNode = workflow.nodes.find(n => n.id === connection.source);
    const targetNode = workflow.nodes.find(n => n.id === connection.target);

    if (sourceNode && targetNode) {
      if (!n8nConnections[sourceNode.label]) {
        n8nConnections[sourceNode.label] = {
          main: [[]]
        };
      }

      n8nConnections[sourceNode.label].main[0].push({
        node: targetNode.label,
        type: 'main',
        index: 0
      });
    }
  });

  // Build final n8n workflow JSON
  const n8nWorkflow = {
    name: `FlowForge: ${workflow.trigger || 'Automation'}`,
    nodes: n8nNodes,
    connections: n8nConnections,
    active: false,
    settings: {
      executionOrder: 'v1'
    },
    versionId: generateId(),
    meta: {
      templateCredsSetupCompleted: true,
      instanceId: generateId()
    },
    id: workflow.id || generateId(),
    tags: []
  };

  return n8nWorkflow;
}

/**
 * Generate a random UUID-like ID for n8n workflows
 * @returns {string} UUID string
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Legacy hello function for backwards compatibility
 */
export function hello() {
  return "workflow-engine";
}
