/**
 * Prompt contract: slack-to-linkedin-post
 * Discovered from working n8n workflow; locks prompt and post-processing for FlowForge export.
 */

export const CONTRACT_ID = 'slack-to-linkedin-post';

/** Prompt template. {{SOURCE_CONTENT}} is replaced with Slack message (e.g. {{ $('Slack Message').item.json.text }}) */
export const PROMPT_TEMPLATE = `IMPORTANT: Provide ONLY the final LinkedIn post. Do not include any internal reasoning, 'thinking' tags, or introductory commentary.

Act as a professional Content Strategist. Your goal is to transform the following Slack message into an engaging, publication-ready LinkedIn post. Qualitatively improve and polish the input: turn a simple message into a compelling post, or distill a long transcript or panel discussion into a concise, impactful post with a clear hook and takeaways. A capable LLM should do this with minimal handholding.

STRICT GUIDELINES:
1. TRANSFORM & IMPROVE: Short input (e.g. a single sentence or casual note) → expand into a polished, professional post without inventing fake details. Long input (transcript, notes, rambling draft) → distill into a structured post: hook, key points, and a clear call to value or sign-off.
2. STRUCTURED DEPTH: For long input, structure the output with an attention-grabbing first line, 3–5 clear takeaways or bullets if appropriate, and a brief conclusion.
3. PRESERVE FULL DRAFTS (edge case): If the input is already a complete, ready-to-publish LinkedIn post (announcement, link, sign-off, CTA), preserve it almost verbatim; only fix typos and add 2–3 hashtags at the end. Do not restructure or paraphrase when the input is already publication-ready.
4. TONE: Professional, insightful, and human. Avoid corporate jargon.
5. FORMATTING: Use line breaks between paragraphs for readability.
6. EXTRAS: Add 2–3 relevant hashtags at the very end (unless the input already includes them).

SOURCE CONTENT:
{{SOURCE_CONTENT}}`;

/** n8n expression for Slack message (first node name is "Slack Message") */
export const SOURCE_CONTENT_EXPRESSION = "{{ $('Slack Message').item.json.text }}";

/** Full prompt text for Basic LLM Chain node (template with expression injected) */
export function getPromptForN8n() {
  return PROMPT_TEMPLATE.replace('{{SOURCE_CONTENT}}', SOURCE_CONTENT_EXPRESSION);
}

/** Code node script: K2 Think V2 CoT stripping (content after last </think>, FN_CALL= prefix, newline normalize). Matches MVP demo. */
export const K2_STRIP_JS = `// K2 Think V2: strip CoT and keep only final answer. Aligned with Elite Four docs (notes-K2-think-tag-format.md, notes-nanobot-transition-k2.md §4) and strip_k2_cot_for_display behavior.
// 1) Content after LAST </think> (case-insensitive). 2) Strip FN_CALL=True/False prefix (leading or on last line). 3) Normalize newlines.
const raw = $json.text;
if (typeof raw !== 'string') {
  return [{ json: { text: String(raw || '').trim() } }];
}
let s = raw.trim();

// 1) Last </think> — K2 quirk: often only closing tag, no opening <think>
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

// 2) FN_CALL= prefix (Elite Four: _strip_nanobot_fn_call_prefix)
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
return [{ json: { text: s } }];`;

export default {
  id: CONTRACT_ID,
  name: 'Slack message → LinkedIn post',
  description: 'Transform a Slack message into a single LinkedIn post. Uses Content Strategist prompt and K2 CoT stripping. Add Slack, OpenAI-compatible, and LinkedIn credentials in n8n.',
  promptTemplate: PROMPT_TEMPLATE,
  getPromptForN8n,
  k2StripJs: K2_STRIP_JS,
};
