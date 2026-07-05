import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Progress } from "@/components/ui/progress";
import { ProtectedField } from "@/components/ProtectedField";
import { EmergentLink } from "@/components/EmergentLink";
import { loadPerformanceReal, type PerformanceReal } from "@/lib/metrics-real";

export const Route = createFileRoute("/app/performance")({ component: PerformancePage });

const SECTIONS: { name: string; key: "fisica" | "cognitiva" | "emocional" | "espiritual" }[] = [
  { name: "FÍSICA", key: "fisica" },
  { name: "COGNITIVA", key: "cognitiva" },
  { name: "EMOCIONAL", key: "emocional" },
  { name: "ESPIRITUAL", key: "espiritual" },
];

function PerformancePage() {
  const { user } = useAuth();
  const [data, setData] = useState<PerformanceReal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadPerformanceReal(user.id).then((d) => { setData(d); setLoading(false); });
  }, [user]);

  const s = data?.sampleSize;
  const noData = s && s.checkins === 0 && s.missions === 0 && s.journal === 0 && s.ooda === 0;

  return (
    <ModulePage code="// PRF 05" title="Performance" subtitle="Física · Cognitiva · Emocional · Espiritual — dados reais dos últimos 14 dias.">
      <EmergentLink note="Suas métricas físicas e cognitivas alimentam insights de execução." />
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">JANELA · 14 DIAS · DADOS REAIS</span>
        {s && (
          <span className="font-mono text-[10px]">
            · {s.checkins} check-ins · {s.missions} missões · {s.journal} entradas · {s.ooda} OODA · {s.hydDays}d hidratação
          </span>
        )}
      </div>

      {noData && (
        <div className="hud-panel hud-corner p-4 text-center font-mono text-xs text-muted-foreground">
          Sem registros nos últimos 14 dias. Faça check-ins diários, missões e journals — as métricas aparecem em tempo real.
        </div>
      )}

      {SECTIONS.map((sec) => {
        const items = data ? Object.entries(data[sec.key]) : [];
        return (
          <HudCard key={sec.name} title={sec.name}>
            <div className="grid md:grid-cols-2 gap-3">
              {loading && <div className="text-xs font-mono text-muted-foreground col-span-2">Calculando...</div>}
              {items.map(([k, v]) => (
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
        );
      })}
    </ModulePage>
  );
}
