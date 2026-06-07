import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";
import { EmergentLink } from "@/components/EmergentLink";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/app/evolucao")({ component: EvolucaoPage });

const NARRATIVE_FIELDS = [
  { key: "achievements", label: "Conquistas", placeholder: "Marcos significativos..." },
  { key: "failures", label: "Falhas", placeholder: "Lições operacionais..." },
  { key: "mindset_shifts", label: "Mudanças de Mentalidade", placeholder: "Transições cognitivas..." },
];

function EvolucaoPage() {
  const data = Array.from({ length: 24 }, (_, i) => ({
    mes: `M${i + 1}`,
    intelectual: 40 + i * 1.8 + Math.sin(i / 2) * 6,
    fisica: 35 + i * 1.2 + Math.cos(i / 3) * 5,
    emocional: 50 + i * 0.9,
    espiritual: 30 + i * 1.5,
  }));
  return (
    <ModulePage code="// EVO 09" title="Evolução" subtitle="Linha do tempo evolutiva · 24 meses operacionais · narrativa versionada.">
      <EmergentLink note="Sua linha evolutiva alimenta os insights de identidade e estratégicos." />
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">MEMÓRIA PERMANENTE ATIVA</span>
        <span>· narrativa evolutiva versionada · nada se apaga.</span>
      </div>
      <HudCard title="EVOLUÇÃO MULTI-DIMENSIONAL">
        <div className="h-[360px]">
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="mes" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} />
              <YAxis tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.03 235)", border: "1px solid oklch(0.78 0.18 210 / 0.4)" }} />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
              <Line type="monotone" dataKey="intelectual" stroke="oklch(0.78 0.18 210)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fisica" stroke="oklch(0.7 0.16 175)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="emocional" stroke="oklch(0.78 0.16 90)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="espiritual" stroke="oklch(0.65 0.2 280)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
