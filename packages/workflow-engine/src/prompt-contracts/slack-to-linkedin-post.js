/**
 * Prompt contract: slack-to-linkedin-post
 * Discovered from working n8n workflow; locks prompt and post-processing for FlowForge export.
 */

export const CONTRACT_ID = 'slack-to-linkedin-post';

/** Prompt template. {{SOURCE_CONTENT}} is replaced with Slack message (e.g. {{ $('Slack Message').item.json.text }}).
 * Phrased for real-world use with capable models (e.g. GPT-5, GPT-5-mini). Code node cleans output (strips thinking tags if present; no-op otherwise).
 */
export const PROMPT_TEMPLATE = `Transform the input into a single, publication-ready LinkedIn post. Output only the post — no preamble, reasoning, or meta-commentary.

Goals:
- **Rough or casual input** (notes, bullets, scattered points): Turn it into a coherent, polished post. Improve clarity, flow, and impact. Keep the author's intent, facts, and any URLs verbatim. Add 2–3 relevant hashtags at the end.
- **Already a clear draft**: Preserve the structure, paragraph order, and wording. Add only 2–3 hashtags at the very end; do not restructure or paraphrase.

Rules:
- Preserve every URL exactly as given (LinkedIn may shorten on their side).
- Use real line breaks between paragraphs (actual newlines, not the characters backslash-n). One blank line between paragraphs.
- Hashtags: #TagName format (e.g. #FlowForge). Put 2–3 at the very end. Do not write "hashtag" before the #.
- Tone: Professional, insightful, human. Avoid corporate jargon.

SOURCE CONTENT:
{{SOURCE_CONTENT}}`;

/** n8n expression for Slack message (first node name is "Slack Message") */
export const SOURCE_CONTENT_EXPRESSION = "{{ $('Slack Message').item.json.text }}";

/** Full prompt text for Basic LLM Chain node (template with expression injected) */
export function getPromptForN8n() {
  return PROMPT_TEMPLATE.replace('{{SOURCE_CONTENT}}', SOURCE_CONTENT_EXPRESSION);
}

/** Code node script: Clean LLM output for LinkedIn — strip any thinking/reasoning tags if present, normalize newlines, replace literal \\n. No-op for models that output only the post. */
export const K2_STRIP_JS = `// Clean LLM output for LinkedIn: keep only the final post text. If the model included thinking/reasoning tags or prefixes, strip them.
// 1) Content after last </think> (case-insensitive), or strip <thinking>...</thinking>. 2) Strip FN_CALL= prefix if present. 3) Normalize newlines.
const raw = $json.text;
if (typeof raw !== 'string') {
  return [{ json: { text: String(raw || '').trim() } }];
}
let s = raw.trim();

// 1) Last </think> — some models emit a closing tag before the answer
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

// 2) FN_CALL= prefix (some APIs add this)
const fnCallMatch = s.match(/^\\s*_*FN_CALL=(True|False)\\s+/i);
if (fnCallMatch) s = s.slice(fnCallMatch[0].length).trim();
if (/FN_CALL=/i.test(s)) {
  const lines = s.split('\\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].trim().match(/^\\s*_*FN_CALL=(True|False)\\s+(.+)$/is);
    if (m) { s = m[2].trim(); break; }
  }
}

// 3) Collapse 3+ newlines
s = s.replace(/\\n{3,}/g, '\\n\\n').trim();
// 4) Some models output literal backslash-n as text — replace with real newlines for LinkedIn
const backslash = String.fromCharCode(92);
s = s.replace(new RegExp(backslash + 'n', 'g'), String.fromCharCode(10));
return [{ json: { text: s } }];`;

export default {
  id: CONTRACT_ID,
  name: 'Slack message → LinkedIn post',
  description: 'Transform a Slack message into a polished LinkedIn post. Prompt is phrased for real-world use with capable models. Code node cleans LLM output (strips thinking/reasoning tags if present, normalizes newlines). Add Slack, OpenAI-compatible, and LinkedIn credentials in n8n.',
  promptTemplate: PROMPT_TEMPLATE,
  getPromptForN8n,
  k2StripJs: K2_STRIP_JS,
};
