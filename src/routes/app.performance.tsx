import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/app/performance")({
  component: () => (
    <ModulePage code="// PRF 05" title="Performance" subtitle="Física · Cognitiva · Emocional · Espiritual.">
      {[
        { name: "FÍSICA", items: [["Treino", 72], ["Dieta", 65], ["VO2", 58], ["Força", 70], ["Recuperação", 68]] },
        { name: "COGNITIVA", items: [["Horas Profundas", 81], ["Retenção", 74], ["Leitura", 60], ["Foco", 77], ["Velocidade Aprendizado", 69]] },
        { name: "EMOCIONAL", items: [["Estabilidade", 65], ["Autocontrole", 70], ["Reatividade", 55]] },
        { name: "ESPIRITUAL", items: [["Meditação", 50], ["Alinhamento", 62], ["Clareza", 68]] },
      ].map((sec) => (
        <HudCard key={sec.name} title={sec.name}>
          <div className="grid md:grid-cols-2 gap-3">
            {sec.items.map(([k, v]) => (
              <div key={k as string}>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground tracking-widest">
                  <span>{k}</span><span className="text-primary">{v}</span>
                </div>
                <Progress value={v as number} className="h-1 mt-1" />
              </div>
            ))}
          </div>
        </HudCard>
      ))}
    </ModulePage>
  ),
});
