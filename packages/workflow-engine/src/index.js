/**
 * @flowforge/workflow-engine — parser, graph mapper, export builder.
 * Maps internal workflow to React Flow nodes/edges and n8n JSON.
 */

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

  // Map internal nodes to n8n nodes
  const n8nNodes = workflow.nodes.map((node, index) => {
    // n8n requires position as {x, y} object, not an array
    const position = { x: index * 250 + 100, y: 300 };

    // Map node types to n8n node types
    let n8nType, n8nParameters = {}, typeVersion = 1;

    switch (node.type) {
      case 'trigger':
        if (node.label.toLowerCase().includes('youtube')) {
          n8nType = 'n8n-nodes-base.youtubeTrigger';
          n8nParameters = {
            event: 'videoUploaded'
          };
          typeVersion = 1;
        } else {
          n8nType = 'n8n-nodes-base.manualTrigger';
          n8nParameters = {};
          typeVersion = 1;
        }
        break;

      case 'action':
        if (node.label.toLowerCase().includes('tweet') || node.label.toLowerCase().includes('twitter') || node.label.toLowerCase().includes(' x ') || node.label.toLowerCase() === 'x') {
          // Use the current X (Twitter) node — n8n-nodes-base.twitter was deprecated and renamed
          n8nType = 'n8n-nodes-base.x';
          n8nParameters = {
            resource: 'tweet',
            operation: 'create',
            text: 'Generated tweet content'
          };
          typeVersion = 1;
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

    return {
      id: node.id,
      name: node.label,
      type: n8nType,
      typeVersion,
      position,
      parameters: n8nParameters
    };
  });

  // Map internal connections to n8n connections
  const n8nConnections = {};

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
