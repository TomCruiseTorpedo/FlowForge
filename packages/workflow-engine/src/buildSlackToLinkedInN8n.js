/**
 * Build full n8n workflow for Slack → LLM → Code (K2 strip) → LinkedIn using the prompt contract.
 * No credentials; user adds Slack, OpenAI-compatible, and LinkedIn in n8n.
 */

import { getPromptForN8n, K2_STRIP_JS } from './prompt-contracts/slack-to-linkedin-post.js';

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * @param {Object} workflow - FlowForge workflow (id, trigger, nodes, connections)
 * @returns {Object} n8n workflow JSON (nodes include Slack Trigger, Basic LLM Chain, OpenAI Chat Model, Code, LinkedIn)
 */
export function buildSlackToLinkedInN8n(workflow) {
  const wfId = workflow?.id || generateId();
  const name = `FlowForge: ${workflow?.trigger || 'slack_message'}`;

  const slackId = generateId();
  const chainId = generateId();
  const modelId = generateId();
  const codeId = generateId();
  const linkedInId = generateId();

  const nodes = [
    {
      id: slackId,
      name: 'Slack Message',
      type: 'n8n-nodes-base.slackTrigger',
      typeVersion: 1,
      position: [320, 608],
      parameters: {
        trigger: ['app_mention', 'file_share', 'message'],
        watchWorkspace: true,
        options: {}
      }
    },
    {
      id: chainId,
      name: 'Basic LLM Chain',
      type: '@n8n/n8n-nodes-langchain.chainLlm',
      typeVersion: 1.9,
      position: [528, 656],
      parameters: {
        promptType: 'define',
        text: `=${getPromptForN8n()}`,
        batching: {}
      }
    },
    {
      id: modelId,
      name: 'OpenAI Chat Model',
      type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
      typeVersion: 1.3,
      position: [560, 832],
      parameters: {
        model: { __rl: true, value: 'MBZUAI-IFM/K2-Think-v2', mode: 'list', cachedResultName: 'MBZUAI-IFM/K2-Think-v2' },
        responsesApiEnabled: false,
        options: { maxTokens: 2048 }
      }
    },
    {
      id: codeId,
      name: 'Code in JavaScript',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [864, 624],
      parameters: { jsCode: K2_STRIP_JS }
    },
    {
      id: linkedInId,
      name: 'Generate LinkedIn Post',
      type: 'n8n-nodes-base.linkedIn',
      typeVersion: 1,
      position: [1056, 576],
      parameters: {
        person: '',
        text: '={{ $json.text }}',
        additionalFields: {}
      }
    }
  ];

  const connections = {
    'Slack Message': {
      main: [[{ node: 'Basic LLM Chain', type: 'main', index: 0 }]]
    },
    'Basic LLM Chain': {
      main: [[{ node: 'Code in JavaScript', type: 'main', index: 0 }]]
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'Basic LLM Chain', type: 'ai_languageModel', index: 0 }]]
    },
    'Code in JavaScript': {
      main: [[{ node: 'Generate LinkedIn Post', type: 'main', index: 0 }]]
    }
  };

  return {
    id: wfId,
    name,
    nodes,
    connections,
    active: false,
    settings: {
      executionOrder: 'v1',
      binaryMode: 'separate',
      availableInMCP: false
    },
    versionId: generateId(),
    meta: { templateCredsSetupCompleted: true, instanceId: generateId() },
    tags: [],
    pinData: {}
  };
}
