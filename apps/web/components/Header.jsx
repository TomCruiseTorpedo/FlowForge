"use client";

import { Badge } from "@/components/ui/badge";

const LOGO_SRC = "/logo.png";
const LOGO_MAX_H = 44;

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
      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
        Transform natural language into powerful automations
      </p>
      <p className="text-sm text-muted-foreground/70 font-medium tracking-wide">
        Raw ore → forge → anvil → quench
      </p>
      <img
        src="/hero.png"
        alt=""
        className="mx-auto mt-4 max-w-4xl w-full rounded-xl border-2 border-[hsl(var(--forge-amber-border))] object-cover opacity-95 shadow-2xl ring-2 ring-[hsl(38_92%_50%_/_.25)]"
      />
    </header>
  );
}
