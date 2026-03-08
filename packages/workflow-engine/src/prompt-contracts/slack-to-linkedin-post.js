/**
 * Prompt contract: slack-to-linkedin-post
 * Discovered from working n8n workflow; locks prompt and post-processing for FlowForge export.
 */

export const CONTRACT_ID = 'slack-to-linkedin-post';

/** Prompt template. {{SOURCE_CONTENT}} is replaced with Slack message (e.g. {{ $('Slack Message').item.json.text }}) */
export const PROMPT_TEMPLATE = `IMPORTANT: Provide ONLY the final LinkedIn post. Do not include any internal reasoning, 'thinking' tags, or introductory commentary.

Act as a professional Content Strategist. Your goal is to transform the following Slack message into an engaging LinkedIn post.

STRICT GUIDELINES:
1. ADAPTIVE LENGTH: If the input is very short (like "test" or a single sentence), keep the output short, clever, and professional. Do NOT invent fake details.
2. STRUCTURED DEPTH: If the input is long (a transcript or seminar notes), structure it with:
   - An attention-grabbing "Hook" first line.
   - 3-5 clear bullet point takeaways.
   - A brief concluding thought or "Call to Value."
3. TONE: Professional, insightful, and human. Avoid corporate jargon like "synergy" or "leveraging."
4. FORMATTING: Use line breaks between paragraphs for readability.
5. EXTRAS: Add 2-3 relevant hashtags at the very end.

SOURCE CONTENT:
{{SOURCE_CONTENT}}`;

/** n8n expression for Slack message (first node name is "Slack Message") */
export const SOURCE_CONTENT_EXPRESSION = "{{ $('Slack Message').item.json.text }}";

/** Full prompt text for Basic LLM Chain node (template with expression injected) */
export function getPromptForN8n() {
  return PROMPT_TEMPLATE.replace('{{SOURCE_CONTENT}}', SOURCE_CONTENT_EXPRESSION);
}

/** Code node script: K2 Think V2 CoT stripping (content after last </think>, FN_CALL= prefix, newline normalize) */
export const K2_STRIP_JS = `// K2 Think V2: strip CoT and keep only final answer. Aligned with Elite Four strip_k2_cot_for_display.
// 1) Content after LAST </think> (case-insensitive). 2) Strip FN_CALL=True/False prefix. 3) Normalize newlines.
const raw = $json.text;
if (typeof raw !== 'string') {
  return [{ json: { text: String(raw || '').trim() } }];
}
let s = raw.trim();

const closeTag = '</think>';
const tagLen = closeTag.length;
let lastEnd = -1;
let pos = 0;
const lower = s.toLowerCase();
const tagLower = closeTag.toLowerCase();
while (true) {
  const i = lower.indexOf(tagLower, pos);
  if (i === -1) break;
  lastEnd = i + tagLen;
  pos = i + 1;
}
if (lastEnd !== -1) s = s.slice(lastEnd).trim();
else {
  const afterThink = s.replace(/\\s*<thinking>[\\s\\S]*?<\\/thinking>\\s*/gi, '').trim();
  s = afterThink || s;
}

const fnCallMatch = s.match(/^\\s*_*FN_CALL=(True|False)\\s+/i);
if (fnCallMatch) s = s.slice(fnCallMatch[0].length).trim();
if (/FN_CALL=/i.test(s)) {
  const lines = s.split('\\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].trim().match(/^\\s*_*FN_CALL=(True|False)\\s+([\\s\\S]+)$/);
    if (m) { s = m[2].trim(); break; }
  }
}

s = s.replace(/\\n{3,}/g, '\\n\\n').trim();
return [{ json: { text: s } }];`;

export default {
  id: CONTRACT_ID,
  name: 'Slack message → LinkedIn post',
  description: 'Transform a Slack message into a single LinkedIn post. Uses Content Strategist prompt and K2 CoT stripping. Add Slack, OpenAI-compatible, and LinkedIn credentials in n8n.',
  promptTemplate: PROMPT_TEMPLATE,
  getPromptForN8n,
  k2StripJs: K2_STRIP_JS,
};
