"use client";

import { Lightbulb } from "lucide-react";

const DEMO_PROMPTS = [
  "When I post a message in Slack, create a LinkedIn post",
  "Turn my Slack messages into LinkedIn posts",
  "From Slack to LinkedIn: automate my posts",
  "Personalize marketing emails using customer data and AI",
];

export default function DemoHint({ onTryPrompt }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--forge-amber-border))] bg-[hsl(var(--forge-amber-bg))] p-4 max-w-4xl mx-auto shadow-lg ring-1 ring-[hsl(38_92%_50%_/_.2)]">
      <div className="flex gap-3 items-start">
        <Lightbulb className="h-5 w-5 text-[hsl(var(--forge-amber))] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[hsl(var(--forge-amber-foreground))] space-y-2 min-w-0">
          <p>
            <strong>Try it:</strong> Click a prompt below to try it — then export to n8n, import the file, and add your credentials.
          </p>
          <ul className="list-none space-y-1 pl-0 text-xs sm:text-sm">
            {DEMO_PROMPTS.map((prompt, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onTryPrompt?.(prompt)}
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer text-left w-full"
                >
                  &quot;{prompt}&quot;
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs opacity-90">
            First three: Slack→LinkedIn demo. Last: full marketing-email template (no X/Twitter — most people don’t have paid API access).
          </p>
        </div>
      </div>
    </div>
  );
}
