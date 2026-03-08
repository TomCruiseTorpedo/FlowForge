/**
 * Load a full n8n workflow from a template file.
 * Used when workflow.templateId is set (e.g. marketing email template).
 * Template files live in packages/workflow-engine/templates/<templateId>.json.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

const ALLOWED_IDS = new Set(['personalize-marketing-emails']);

/**
 * @param {string} templateId - e.g. 'personalize-marketing-emails'
 * @returns {Object} n8n workflow JSON (name, nodes, connections, etc.)
 */
export function loadTemplateN8n(templateId) {
  if (!templateId || !ALLOWED_IDS.has(templateId)) {
    throw new Error(`Unknown or disallowed template: ${templateId}`);
  }
  const path = join(TEMPLATES_DIR, `${templateId}.json`);
  const raw = readFileSync(path, 'utf-8');
  const workflow = JSON.parse(raw);
  if (!workflow.nodes || !workflow.connections) {
    throw new Error(`Template ${templateId} missing nodes or connections`);
  }
  return workflow;
}
