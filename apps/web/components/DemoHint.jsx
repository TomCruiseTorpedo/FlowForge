"use client";

import { Lightbulb } from "lucide-react";

const DEMO_PROMPT = "When I post a message in Slack, create a LinkedIn post";

export default function DemoHint({ onTryPrompt }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--forge-amber-border))] bg-[hsl(var(--forge-amber-bg))] p-4 max-w-4xl mx-auto shadow-lg ring-1 ring-[hsl(38_92%_50%_/_.2)]">
      <div className="flex gap-3 items-start">
        <Lightbulb className="h-5 w-5 text-[hsl(var(--forge-amber))] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[hsl(var(--forge-amber-foreground))]">
          <strong>Try it:</strong>{" "}
          <button
            type="button"
            onClick={() => onTryPrompt?.(DEMO_PROMPT)}
            className="underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            &quot;{DEMO_PROMPT}&quot;
          </button>
          {" "}— then export to n8n, import the file, and add your credentials to run it.
        </p>
      </div>
    </div>
  );
}
