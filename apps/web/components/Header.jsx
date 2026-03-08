"use client";

import { Badge } from "@/components/ui/badge";
import { Gem, Flame, LayoutTemplate, Download } from "lucide-react";

const LOGO_SRC = "/logo.png";
const LOGO_MAX_H = 44;

const STEPS = [
  { icon: Gem, label: "Raw ore", meaning: "Your prompt" },
  { icon: Flame, label: "forge", meaning: "Generate" },
  { icon: LayoutTemplate, label: "anvil", meaning: "Canvas" },
  { icon: Download, label: "quench", meaning: "Export" },
];

export default function Header() {
  return (
    <header className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <img
          src={LOGO_SRC}
          alt="FlowForge logo"
          style={{ maxHeight: LOGO_MAX_H }}
          className="brand-logo object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          FlowForge
        </h1>
        <Badge
          variant="outline"
          className="ml-1 border-[hsl(var(--forge-amber-border))] text-[hsl(var(--forge-amber-foreground))] bg-[hsl(var(--forge-amber-bg))] text-xs font-semibold uppercase tracking-wider"
        >
          Prototype
        </Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Transform natural language into powerful automations.
      </p>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground/90 font-medium tracking-wide flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {STEPS.map(({ icon: Icon, label }, i) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground/50">→</span>}
              <Icon className="h-4 w-4 text-[hsl(var(--forge-amber))]" aria-hidden />
              <span className="capitalize">{label}</span>
            </span>
          ))}
        </p>
        <p className="text-xs text-muted-foreground/70 whitespace-nowrap overflow-x-auto overflow-y-hidden text-center">
          <span className="font-medium text-muted-foreground/80">Legend:</span>{" "}
          {STEPS.map(({ label, meaning }) => (
            <span key={label}>
              <span className="capitalize">{label}</span> = {meaning}
              {label !== "quench" ? "; " : ""}
            </span>
          ))}
        </p>
      </div>
      <img
        src="/hero.png"
        alt=""
        className="mx-auto mt-4 max-w-5xl w-full rounded-xl border-2 border-[hsl(var(--forge-amber-border))] object-cover opacity-95 shadow-2xl ring-2 ring-[hsl(38_92%_50%_/_.25)]"
      />
    </header>
  );
}
