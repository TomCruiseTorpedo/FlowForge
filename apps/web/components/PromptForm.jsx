"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PromptForm({
  prompt,
  loading,
  onPromptChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Describe your automation
        </Label>
        <p className="text-xs text-muted-foreground italic">
          Raw ore — your idea in plain English.
        </p>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., When I post a message in Slack, create a LinkedIn post"
          rows={4}
          disabled={loading}
          className="resize-none text-lg min-h-[120px]"
        />
      </div>
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              size="lg"
              className="min-w-[200px] bg-[hsl(var(--forge-accent))] hover:bg-[hsl(var(--forge-accent))]/90 text-[hsl(var(--forge-accent-foreground))] font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <img src="/icon-generate.png" alt="" className="h-8 w-8 object-contain" />
                  Generate Workflow
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heat the forge</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </form>
  );
}
