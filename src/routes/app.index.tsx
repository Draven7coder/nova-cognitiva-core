import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts";
import { Sparkles, Target, Flame, Calendar, Cog, Brain, AlertTriangle, Fingerprint } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const METRIC_LABELS: Record<string, string> = {
  profundidade: "Profundidade",
  execucao: "Execução",
  consistencia: "Consistência",
  integracao: "Integração",
  criatividade: "Criatividade",
  emocional: "Controle Emocional",
  evolucao: "Velocidade Evolução",
  clareza: "Clareza Mental",
  disciplina: "Disciplina",
  longoPrazo: "Longo Prazo",
};

const DEFAULT_METRICS = {
  profundidade: 62, execucao: 48, consistencia: 55, integracao: 60,
  criatividade: 70, emocional: 58, evolucao: 65, clareza: 50,
  disciplina: 52, longoPrazo: 47,
};

function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Record<string, number>>(DEFAULT_METRICS);
  const [insight, setInsight] = useState<string>("Aguardando primeira análise da IA. Execute uma sincronização para mapear seu QI Funcional Operacional.");
  const [missions, setMissions] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: m }, { data: r }] = await Promise.all([
        supabase.from("missions").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(5),
        supabase.from("ai_reports").select("*").order("created_at", { ascending: false }).limit(1),
      ]);
      setMissions(m ?? []);
      if (r?.[0]) {
        if (r[0].metrics) setMetrics(r[0].metrics as any);
        setInsight(r[0].content.split("\n").slice(0, 4).join("\n"));
      }
    })();
  }, [user]);

  const overallQI = Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length);

  const sync = async () => {
    setAnalyzing(true);
    try {
      const [{ data: ident }, { data: missAll }, { data: journal }] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("missions").select("title,status,type,xp,created_at,completed_at").limit(50),
        supabase.from("journal_entries").select("title,content,module,created_at").order("created_at", { ascending: false }).limit(20),
      ]);
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: { scope: "diário", context: { identity: ident, missions: missAll, journal } },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      setInsight((data as any).content);
      if ((data as any).metrics) setMetrics((data as any).metrics);
      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope: "daily",
        content: (data as any).content, metrics: (data as any).metrics ?? null,
      });
      toast.success("Análise NÚCLEO concluída.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha na análise");
    } finally { setAnalyzing(false); }
  };

  const radarData = Object.entries(metrics).map(([k, v]) => ({ metric: METRIC_LABELS[k] ?? k, value: v }));
  const evoData = Array.from({ length: 14 }, (_, i) => ({
    d: i + 1, qi: Math.round(overallQI - 10 + Math.sin(i / 2) * 8 + i * 0.6),
  }));

  return (
    <ModulePage code="// CORE 00" title="Núcleo Operacional" subtitle="Painel central de comando · QI Funcional Operacional ativo.">
      <div className="grid lg:grid-cols-3 gap-4">
        <HudCard title="QI FUNCIONAL OPERACIONAL" className="lg:col-span-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl text-primary hud-text-glow">{overallQI}</span>
            <span className="font-mono text-xs text-muted-foreground">/ 100</span>
          </div>
          <Progress value={overallQI} className="mt-3 h-1" />
          <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Índice cognitivo dinâmico calculado pela IA com base em 10 dimensões operacionais.
          </div>
          <Button onClick={sync} disabled={analyzing} className="mt-4 w-full font-mono text-xs tracking-widest">
            <Sparkles className="size-3 mr-2" />
            {analyzing ? "ANALISANDO..." : "SINCRONIZAR IA"}
          </Button>
        </HudCard>

        <HudCard title="MAPEAMENTO COGNITIVO" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.78 0.18 210 / 0.2)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} stroke="oklch(0.78 0.18 210 / 0.2)" />
                <Radar dataKey="value" stroke="oklch(0.78 0.18 210)" fill="oklch(0.78 0.18 210)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </HudCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {Object.entries(metrics).slice(0, 6).map(([k, v]) => (
          <div key={k} className="hud-panel p-4">
            <div className="flex justify-between items-center font-mono text-[10px] text-muted-foreground tracking-widest">
              <span>{METRIC_LABELS[k] ?? k}</span><span className="text-primary">{v}</span>
            </div>
            <div className="h-1 bg-muted/40 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary hud-glow" style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>

      <HudCard title="⚙ RITUAL DE INICIALIZAÇÃO DO DIA">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="font-display text-foreground">Alinhamento antes da execução</div>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Calibre mente, prioridade, risco e identidade em 5 minutos.
            </p>
          </div>
          <Link to="/app/protocolos">
            <Button variant="outline" size="sm" className="font-mono text-[10px] tracking-widest">
              <Cog className="size-3 mr-2" /> ABRIR PROTOCOLO
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { to: "/app/protocolos", hash: "descarga", icon: Brain, label: "Descarga Mental" },
            { to: "/app/protocolos", hash: "prioridades", icon: Target, label: "Prioridades" },
            { to: "/app/protocolos", hash: "risco", icon: AlertTriangle, label: "Risco / Sabotagem" },
            { to: "/app/protocolos", hash: "identidade", icon: Fingerprint, label: "Reforço Identidade" },
          ].map((it) => (
            <Link
              key={it.label}
              to={it.to}
              hash={it.hash}
              className="hud-panel p-3 hover:border-primary/60 transition-colors group"
            >
              <it.icon className="size-4 text-primary mb-2 group-hover:hud-text-glow" />
              <div className="font-mono text-[10px] tracking-widest text-foreground/90">{it.label.toUpperCase()}</div>
            </Link>
          ))}
        </div>
      </HudCard>

          <div className="h-[200px]">
            <ResponsiveContainer>
              <LineChart data={evoData}>
                <XAxis dataKey="d" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} stroke="oklch(0.32 0.06 215 / 0.3)" />
                <YAxis tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} stroke="oklch(0.32 0.06 215 / 0.3)" />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 235)", border: "1px solid oklch(0.78 0.18 210 / 0.4)", borderRadius: 6 }} />
                <Line type="monotone" dataKey="qi" stroke="oklch(0.78 0.18 210)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </HudCard>

        <HudCard title="ANÁLISE IA · NÚCLEO">
          <div className="text-sm text-foreground/90 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-[200px] overflow-auto">
            {insight}
          </div>
        </HudCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <HudCard title="MISSÕES ATIVAS" className="lg:col-span-2">
          {missions.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhuma missão ativa. Acesse o módulo Missões.</div>
          ) : (
            <ul className="space-y-2">
              {missions.map((m) => (
                <li key={m.id} className="flex items-center gap-3 p-2 border border-border/40 rounded">
                  <Target className="size-4 text-primary" />
                  <div className="flex-1 text-sm">{m.title}</div>
                  <span className="font-mono text-[10px] text-primary">+{m.xp} XP</span>
                </li>
              ))}
            </ul>
          )}
        </HudCard>

        <HudCard title="STATUS DIÁRIO">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Flame className="size-4 text-primary" /><span>Streak: <b className="text-primary">7d</b></span></div>
            <div className="flex items-center gap-2"><Calendar className="size-4 text-primary" /><span>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span></div>
            <div className="border-t border-border/40 pt-3 mt-3">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">FRASE CENTRAL</div>
              <p className="italic text-foreground/80">"O sistema é a extensão da mente disciplinada."</p>
            </div>
          </div>
        </HudCard>
      </div>
    </ModulePage>
  );
}
