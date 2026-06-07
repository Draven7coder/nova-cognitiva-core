import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Progress } from "@/components/ui/progress";
import { ProtectedField } from "@/components/ProtectedField";
import { EmergentLink } from "@/components/EmergentLink";

export const Route = createFileRoute("/app/performance")({ component: PerformancePage });

const SECTIONS = [
  { name: "FÍSICA", key: "fisica", items: [["Treino", 72], ["Dieta", 65], ["VO2", 58], ["Força", 70], ["Recuperação", 68]] as [string, number][] },
  { name: "COGNITIVA", key: "cognitiva", items: [["Horas Profundas", 81], ["Retenção", 74], ["Leitura", 60], ["Foco", 77], ["Velocidade Aprendizado", 69]] as [string, number][] },
  { name: "EMOCIONAL", key: "emocional", items: [["Estabilidade", 65], ["Autocontrole", 70], ["Reatividade", 55]] as [string, number][] },
  { name: "ESPIRITUAL", key: "espiritual", items: [["Meditação", 50], ["Alinhamento", 62], ["Clareza", 68]] as [string, number][] },
];

function PerformancePage() {
  return (
    <ModulePage code="// PRF 05" title="Performance" subtitle="Física · Cognitiva · Emocional · Espiritual · observações versionadas.">
      <EmergentLink note="Suas métricas físicas e cognitivas alimentam insights de execução." />
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">MEMÓRIA PERMANENTE ATIVA</span>
        <span>· observações estratégicas com histórico de versões.</span>
      </div>
      {SECTIONS.map((sec) => (
        <HudCard key={sec.name} title={sec.name}>
          <div className="grid md:grid-cols-2 gap-3">
            {sec.items.map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground tracking-widest">
                  <span>{k}</span><span className="text-primary">{v}</span>
                </div>
                <Progress value={v} className="h-1 mt-1" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">OBSERVAÇÕES ESTRATÉGICAS</div>
            <ProtectedField module="performance" fieldKey={`obs_${sec.key}`} placeholder="Padrões, ajustes, próximos protocolos..." minHeight={90} />
          </div>
        </HudCard>
      ))}
    </ModulePage>
  );
}
