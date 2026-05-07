import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/sombra")({
  component: () => (
    <ModulePage code="// SHD 08" title="Sombra" subtitle="Módulo privado · autoconhecimento profundo. A IA detecta padrões recorrentes.">
      <div className="grid md:grid-cols-2 gap-4">
        {["Inseguranças", "Padrões Destrutivos", "Ego", "Impulsos", "Vícios Mentais", "Necessidade de Validação", "Autossabotagem", "Padrões Recorrentes Detectados"].map((t) => (
          <HudCard key={t} title={t.toUpperCase()}>
            <Textarea className="min-h-[110px] bg-input/40 font-mono text-xs border-border/50" placeholder="..." />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  ),
});
