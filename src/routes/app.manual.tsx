import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/manual")({
  component: () => (
    <ModulePage code="// MAN 04" title="Manual Operacional" subtitle="Mapeamento do funcionamento mental · seu próprio sistema operacional.">
      <div className="grid md:grid-cols-2 gap-4">
        {["Horários de Pico Cognitivo", "Gatilhos Emocionais", "Ambientes Ideais", "Ambientes Tóxicos", "Padrões de Procrastinação", "Hacks Mentais", "Protocolos de Recuperação", "Estados Mentais", "Técnicas de Foco", "Sabotagens Recorrentes"].map((t) => (
          <HudCard key={t} title={t.toUpperCase()}>
            <Textarea className="min-h-[110px] bg-input/40 font-mono text-xs border-border/50" placeholder="..." />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  ),
});
