import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/proposito")({
  component: () => (
    <ModulePage code="// PRP 02" title="Propósito Supremo" subtitle="Visão estratégica de vida · timeline transcendental.">
      <div className="grid md:grid-cols-2 gap-4">
        {["Objetivos de 1 ano", "Objetivos de 5 anos", "Objetivos de 10 anos", "Objetivos de 20 anos", "Legado", "Visão Transcendental", "Mapa de Conquista", "Direção Existencial"].map((t) => (
          <HudCard key={t} title={t.toUpperCase()}>
            <Textarea className="min-h-[110px] bg-input/40 font-mono text-xs border-border/50" placeholder="..." />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  ),
});
