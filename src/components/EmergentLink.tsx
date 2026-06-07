import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export function EmergentLink({ note }: { note?: string }) {
  return (
    <Link
      to="/app/insights"
      className="hud-panel hud-corner p-3 flex items-center gap-3 text-xs text-muted-foreground hover:border-primary/60 transition-colors group"
    >
      <Sparkles className="size-4 text-primary group-hover:hud-text-glow" />
      <span className="font-mono text-[10px] tracking-widest text-primary">INSIGHTS EMERGENTES</span>
      <span className="flex-1">{note ?? "A IA observa este módulo e detecta padrões em tempo real."}</span>
      <ArrowRight className="size-3 text-primary opacity-70 group-hover:translate-x-0.5 transition" />
    </Link>
  );
}
