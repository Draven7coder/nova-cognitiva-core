import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";
import { EmergentLink } from "@/components/EmergentLink";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { loadEvolutionReal, type EvolutionPoint } from "@/lib/metrics-real";

export const Route = createFileRoute("/app/evolucao")({ component: EvolucaoPage });

const NARRATIVE_FIELDS = [
  { key: "achievements", label: "Conquistas", placeholder: "Marcos significativos..." },
  { key: "failures", label: "Falhas", placeholder: "Lições operacionais..." },
  { key: "mindset_shifts", label: "Mudanças de Mentalidade", placeholder: "Transições cognitivas..." },
];

function EvolucaoPage() {
  const { user } = useAuth();
  const [data, setData] = useState<EvolutionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadEvolutionReal(user.id).then((d) => { setData(d); setLoading(false); });
  }, [user]);

  const hasSignal = data.some((p) => p.intelectual + p.fisica + p.emocional + p.espiritual > 0);

  return (
    <ModulePage code="// EVO 09" title="Evolução" subtitle="Linha do tempo evolutiva · agregação real dos últimos 24 meses.">
      <EmergentLink note="Sua linha evolutiva alimenta os insights de identidade e estratégicos." />
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">DADOS REAIS · 24 MESES</span>
        <span>· médias mensais dos check-ins registrados.</span>
      </div>
      <HudCard title="EVOLUÇÃO MULTI-DIMENSIONAL">
        {loading ? (
          <div className="text-xs font-mono text-muted-foreground py-12 text-center">Calculando...</div>
        ) : !hasSignal ? (
          <div className="text-xs font-mono text-muted-foreground py-12 text-center">
            Nenhum registro nos últimos 24 meses. Registre check-ins diários — sua linha evolutiva será desenhada a partir dos dados reais.
          </div>
        ) : (
          <div className="h-[360px]">
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis dataKey="mes" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 235)", border: "1px solid oklch(0.78 0.18 210 / 0.4)" }} />
                <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                <Line type="monotone" dataKey="intelectual" stroke="oklch(0.78 0.18 210)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fisica" stroke="oklch(0.7 0.16 175)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="emocional" stroke="oklch(0.78 0.16 90)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="espiritual" stroke="oklch(0.65 0.2 280)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </HudCard>
      <div className="grid md:grid-cols-3 gap-4">
        {NARRATIVE_FIELDS.map((f) => (
          <HudCard key={f.key} title={f.label.toUpperCase()}>
            <ProtectedField module="evolucao" fieldKey={f.key} placeholder={f.placeholder} minHeight={140} />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
