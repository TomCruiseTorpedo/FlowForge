"use client";

import { Lightbulb } from "lucide-react";

const DEMO_PROMPTS = [
  {
    prompt: "When I post a message in Slack, create a LinkedIn post",
    label: "Social / comms",
  },
  {
    prompt: "When I upload a video to YouTube, create a LinkedIn post",
    label: "Video / content",
  },
  {
    prompt: "Personalize marketing emails using customer data and AI",
    label: "Marketing",
  },
];

export default function DemoHint({ onTryPrompt }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--forge-amber-border))] bg-[hsl(var(--forge-amber-bg))] p-4 max-w-4xl mx-auto shadow-lg ring-1 ring-[hsl(38_92%_50%_/_.2)]">
      <div className="flex gap-3 items-start">
        <Lightbulb className="h-5 w-5 text-[hsl(var(--forge-amber))] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[hsl(var(--forge-amber-foreground))] space-y-2 min-w-0">
          <p>
            <strong>Try it:</strong> Click a prompt below — each is a different workflow type. Export to n8n, import the file, and add your credentials.
          </p>
          <ul className="list-none space-y-1 pl-0 text-xs sm:text-sm">
            {DEMO_PROMPTS.map(({ prompt, label }, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onTryPrompt?.(prompt)}
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer text-left w-full"
                >
                  &quot;{prompt}&quot;
                </button>
                <span className="text-[10px] uppercase tracking-wider opacity-75 ml-1">({label})</span>
              </li>
            ))}
          </ul>
          <p className="text-xs opacity-90">
            Three different workflow types — social, video/content, and marketing. No X/Twitter (paid API).
          </p>
        </div>
      </div>
    </div>
  );
}
