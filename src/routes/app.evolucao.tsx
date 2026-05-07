import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/app/evolucao")({
  component: () => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      mes: `M${i + 1}`,
      intelectual: 40 + i * 1.8 + Math.sin(i / 2) * 6,
      fisica: 35 + i * 1.2 + Math.cos(i / 3) * 5,
      emocional: 50 + i * 0.9,
      espiritual: 30 + i * 1.5,
    }));
    return (
      <ModulePage code="// EVO 09" title="Evolução" subtitle="Linha do tempo evolutiva · 24 meses operacionais.">
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
          {[
            { t: "CONQUISTAS", d: "Marcos significativos." },
            { t: "FALHAS", d: "Lições operacionais." },
            { t: "MUDANÇAS DE MENTALIDADE", d: "Transições cognitivas." },
          ].map((c) => (
            <HudCard key={c.t} title={c.t}>
              <p className="text-xs text-muted-foreground">{c.d}</p>
            </HudCard>
          ))}
        </div>
      </ModulePage>
    );
  },
});
