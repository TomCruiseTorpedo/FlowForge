"use client";

import { Loader2, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WorkflowCanvas from "@/components/WorkflowCanvas";

export default function WorkflowResult({ workflow, exporting, onExport }) {
  const unsupported = workflow?.workflowMeta?.supportedIntent === false;
  const unsupportedReason = workflow?.workflowMeta?.reason;

  return (
    <div className="space-y-4 mt-8 rounded-xl border border-[hsl(var(--forge-amber-border))] bg-secondary/80 p-6 ring-1 ring-[hsl(38_92%_50%_/_.1)]">
      {unsupported && (
        <div className="flex gap-2 p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 text-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            {unsupportedReason || "This prompt doesn't match a supported workflow. Try one of the suggested prompts above for a tailored automation."}
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Workflow Canvas
          </h2>
          <p className="text-xs text-muted-foreground italic">The anvil</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onExport}
              disabled={exporting}
              variant="default"
              className="bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green))]/90 text-[hsl(var(--forge-green-foreground))]"
            >
              {exporting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <img src="/icon-export.png" alt="" className="h-5 w-5 object-contain" />
                  Export to n8n
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quench — solidify your workflow</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          Import the downloaded JSON in n8n, then add your Slack, LLM API key,
          and LinkedIn credentials to run the workflow.
        </span>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-card">
        <WorkflowCanvas workflow={workflow} />
      </div>
    </div>
  );
}
