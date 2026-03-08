"use client";

import { useState } from "react";
import { API_BASE } from "@/config/api";
import Header from "@/components/Header";
import DemoHint from "@/components/DemoHint";
import PromptForm from "@/components/PromptForm";
import ErrorAlert from "@/components/ErrorAlert";
import WorkflowResult from "@/components/WorkflowResult";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setWorkflow(null);

    try {
      const res = await fetch(`${API_BASE}/generate-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setWorkflow(await res.json());
    } catch (err) {
      setError(err.message || "Failed to generate workflow");
      setWorkflow(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!workflow?.workflow) return;

    setExporting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: workflow.workflow }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.n8nWorkflow) throw new Error("No n8n workflow in response");

      const blob = new Blob([JSON.stringify(data.n8nWorkflow, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flowforge-n8n-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to export workflow");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Header />
        <DemoHint onTryPrompt={setPrompt} />

        <Card className="shadow-2xl border border-[hsl(var(--forge-amber-border))] bg-card/95 backdrop-blur-sm ring-1 ring-[hsl(38_92%_50%_/_.15)]">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <PromptForm
              prompt={prompt}
              loading={loading}
              onPromptChange={setPrompt}
              onSubmit={handleSubmit}
            />

            {error && (
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            )}

            {workflow && (
              <WorkflowResult
                workflow={workflow}
                exporting={exporting}
                onExport={handleExport}
              />
            )}
          </CardContent>
        </Card>

        <Footer />
      </div>
    </main>
  );
}
