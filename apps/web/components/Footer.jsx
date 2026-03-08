"use client";

export default function Footer() {
  return (
    <footer className="text-center text-sm text-muted-foreground py-8 space-y-1">
      <p>
        Built with{" "}
        <span className="font-medium text-foreground">Cursor</span>,{" "}
        <span className="font-medium text-foreground">Antigravity</span>,{" "}
        <span className="font-medium text-foreground">Copilot (VS Code)</span> &amp;{" "}
        <span className="font-medium text-foreground">Lovable</span>
      </p>
      <p className="text-muted-foreground/80">
        © 2026 Jihoon &quot;JJ&quot; Jung
      </p>
    </footer>
  );
}
