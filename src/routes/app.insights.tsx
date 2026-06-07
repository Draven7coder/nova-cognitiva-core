import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Brain, Zap, HeartPulse, Compass, Fingerprint,
  RefreshCw, AlertTriangle, CheckCircle2, Trash2, Activity,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/insights")({ component: InsightsPage });

type Insight = {
  id: string;
  category: "cognitivo" | "execucao" | "emocional" | "estrategico" | "identidade";
  insight_type: "rapido" | "profundo" | "alerta" | "recomendacao" | "relatorio";
  title: string;
  content: string;
  severity: "low" | "medium" | "high" | "critical";
  pattern_data: any;
  status: "active" | "archived" | "dismissed";
  created_at: string;
};

const CATEGORY_META: Record<Insight["category"], { label: string; icon: any; color: string; ring: string }> = {
  cognitivo:   { label: "COGNITIVO",   icon: Brain,       color: "text-primary",       ring: "border-primary/50" },
  execucao:    { label: "EXECUÇÃO",    icon: Zap,         color: "text-amber-400",     ring: "border-amber-500/50" },
  emocional:   { label: "EMOCIONAL",   icon: HeartPulse,  color: "text-rose-400",      ring: "border-rose-500/50" },
  estrategico: { label: "ESTRATÉGICO", icon: Compass,     color: "text-cyan-300",      ring: "border-cyan-400/50" },
  identidade:  { label: "IDENTIDADE",  icon: Fingerprint, color: "text-violet-300",    ring: "border-violet-400/50" },
};

const TYPE_LABEL: Record<Insight["insight_type"], string> = {
  rapido: "RÁPIDO", profundo: "PROFUNDO", alerta: "ALERTA", recomendacao: "RECOMENDAÇÃO", relatorio: "RELATÓRIO",
};

const SEVERITY_STYLES: Record<string, string> = {
  low: "border-muted/40 text-muted-foreground",
  medium: "border-primary/40 text-primary",
  high: "border-amber-500/60 text-amber-400",
  critical: "border-destructive/60 text-destructive",
};

function InsightsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [report, setReport] = useState<string>("Sistema dormente. Execute uma varredura emergente para detectar padrões reais nos seus dados operacionais.");
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<"all" | Insight["category"]>("all");

  const load = async () => {
    const { data } = await supabase
      .from("emergent_insights")
      .select("*").eq("status", "active")
      .order("created_at", { ascending: false }).limit(80);
    setInsights((data ?? []) as Insight[]);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const runEmergent = async () => {
    setAnalyzing(true);
    try {
      const [
        { data: ident }, { data: miss }, { data: completions },
        { data: journal }, { data: hyd }, { data: ooda },
        { data: ideas }, { data: prevReports }, { data: prevInsights },
      ] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("missions").select("title,status,type,xp,recurrence,streak,last_completed_at,created_at,completed_at").limit(120),
        supabase.from("mission_completions").select("mission_id,completed_at,quality").order("completed_at", { ascending: false }).limit(150),
        supabase.from("journal_entries").select("title,content,module,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("hydration_logs").select("amount_ml,consumed_at").order("consumed_at", { ascending: false }).limit(80),
        supabase.from("ooda_entries").select("tag,observe,orient,counter_argument,decide,act,comfort_zone,data_integrity,created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("journal_entries").select("title,content,module,created_at").eq("module", "ideias").limit(20),
        supabase.from("ai_reports").select("scope,content,created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("emergent_insights").select("category,title,severity,created_at").order("created_at", { ascending: false }).limit(30),
      ]);

      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "emergent",
          context: {
            identity: ident, missions: miss, mission_completions: completions,
            journal, hydration: hyd, ooda_cycles: ooda, ideas,
            previous_reports: prevReports, previous_emergent_insights: prevInsights,
            now: new Date().toISOString(),
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);

      const content = (data as any).content as string;
      const emergent = (data as any).emergent as { insights?: any[] } | null;

      setReport(content);
      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope: "emergent", content, metrics: null,
      });

      if (emergent?.insights?.length) {
        const validCats = ["cognitivo","execucao","emocional","estrategico","identidade"];
        const validTypes = ["rapido","profundo","alerta","recomendacao","relatorio"];
        const rows = emergent.insights.slice(0, 14).map((x: any) => ({
          user_id: user!.id,
          category: validCats.includes(x.category) ? x.category : "cognitivo",
          insight_type: validTypes.includes(x.insight_type) ? x.insight_type : "rapido",
          title: (x.title ?? "—").slice(0, 200),
          content: x.content ?? "",
          severity: ["low","medium","high","critical"].includes(x.severity) ? x.severity : "medium",
          pattern_data: x.pattern ? { pattern: x.pattern } : null,
          status: "active",
          source_scope: "emergent",
        }));
        if (rows.length) await supabase.from("emergent_insights").insert(rows);
      }

      toast.success("Insights Emergentes atualizados.");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Falha na análise emergente.");
    } finally { setAnalyzing(false); }
  };

  const archive = async (id: string) => {
    await supabase.from("emergent_insights").update({ status: "archived" }).eq("id", id);
    setInsights((s) => s.filter((i) => i.id !== id));
  };
  const remove = async (id: string) => {
    if (!confirm("Remover este insight permanentemente?")) return;
    await supabase.from("emergent_insights").delete().eq("id", id);
    setInsights((s) => s.filter((i) => i.id !== id));
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { cognitivo: 0, execucao: 0, emocional: 0, estrategico: 0, identidade: 0 };
    insights.forEach((i) => { c[i.category] = (c[i.category] ?? 0) + 1; });
    return c;
  }, [insights]);

  const radarData = useMemo(() => (
    Object.entries(CATEGORY_META).map(([k, meta]) => ({
      metric: meta.label,
      value: Math.min(100, (counts[k] ?? 0) * 18 + 12),
    }))
  ), [counts]);

  const timeline = useMemo(() => {
    const days: Record<string, number> = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
      days[d] = 0;
    }
    insights.forEach((i) => {
      const d = i.created_at.slice(0, 10);
      if (d in days) days[d] += 1;
    });
    return Object.entries(days).map(([d, v]) => ({ d: d.slice(5), v }));
  }, [insights]);

  const heatmap = useMemo(() => {
    // 5 categorias × 4 severidades
    const sevs = ["low","medium","high","critical"] as const;
    const cats = Object.keys(CATEGORY_META) as Insight["category"][];
    return cats.map((c) => ({
      cat: c,
      cells: sevs.map((s) => insights.filter((i) => i.category === c && i.severity === s).length),
    }));
  }, [insights]);

  const filtered = filter === "all" ? insights : insights.filter((i) => i.category === filter);

  return (
    <ModulePage
      code="// EMG 14"
      title="Insights Emergentes da IA"
      subtitle="Espelho evolutivo · Detecção contínua de padrões reais a partir do seu comportamento."
    >
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">DETECÇÃO COMPORTAMENTAL ATIVA</span>
        <span>· análise empírica · zero motivacional · padrões reais.</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <HudCard title="MOTOR EMERGENTE" className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-md hud-panel hud-glow flex items-center justify-center">
              <Sparkles className="size-6 text-primary hud-text-glow" />
            </div>
            <div>
              <div className="font-display text-lg hud-text-glow">EMERGENT</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest">
                {analyzing ? "ANALISANDO..." : "ONLINE · OBSERVANDO"}
              </div>
            </div>
          </div>
          <Button onClick={runEmergent} disabled={analyzing} className="mt-4 w-full font-mono text-xs tracking-widest">
            {analyzing ? <RefreshCw className="size-3 mr-2 animate-spin" /> : <Sparkles className="size-3 mr-2" />}
            {analyzing ? "VARRENDO PADRÕES..." : "DETECTAR PADRÕES"}
          </Button>
          <div className="mt-3 text-[10px] font-mono text-muted-foreground leading-relaxed">
            Cruza identidade, missões, execuções, OODA, journal, hidratação e ideias.
          </div>
        </HudCard>

        <HudCard title="RADAR COMPORTAMENTAL" className="lg:col-span-2">
          <div className="h-[220px]">
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

        <HudCard title="LINHA DO TEMPO · 14D">
          <div className="h-[220px]">
            <ResponsiveContainer>
              <AreaChart data={timeline}>
                <XAxis dataKey="d" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 9 }} stroke="oklch(0.32 0.06 215 / 0.3)" />
                <YAxis tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 9 }} stroke="oklch(0.32 0.06 215 / 0.3)" />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 235)", border: "1px solid oklch(0.78 0.18 210 / 0.4)", borderRadius: 6, fontSize: 11 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.18 210)" fill="oklch(0.78 0.18 210 / 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </HudCard>
      </div>

      <div className="grid lg:grid-cols-5 gap-3">
        {(Object.keys(CATEGORY_META) as Insight["category"][]).map((k) => {
          const meta = CATEGORY_META[k];
          const Icon = meta.icon;
          return (
            <div key={k} className={`hud-panel p-3 border ${meta.ring}`}>
              <div className="flex items-center gap-2"><Icon className={`size-4 ${meta.color}`} /><span className={`font-mono text-[10px] tracking-widest ${meta.color}`}>{meta.label}</span></div>
              <div className={`font-display text-3xl mt-1 hud-text-glow ${meta.color}`}>{counts[k] ?? 0}</div>
            </div>
          );
        })}
      </div>

      <HudCard title="HEATMAP · CATEGORIA × SEVERIDADE">
        <div className="grid grid-cols-[120px_repeat(4,1fr)] gap-1 text-[10px] font-mono">
          <div />
          {["LOW","MED","HIGH","CRIT"].map((s) => <div key={s} className="text-center text-muted-foreground tracking-widest">{s}</div>)}
          {heatmap.map((row) => (
            <>
              <div key={`l-${row.cat}`} className={`${CATEGORY_META[row.cat].color} tracking-widest self-center`}>{CATEGORY_META[row.cat].label}</div>
              {row.cells.map((v, i) => {
                const intensity = Math.min(1, v / 4);
                return (
                  <div key={`c-${row.cat}-${i}`} className="aspect-square rounded-sm flex items-center justify-center border border-border/30"
                       style={{ background: `oklch(0.78 0.18 210 / ${intensity * 0.6 + 0.04})` }}>
                    <span className="text-foreground/80">{v || ""}</span>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </HudCard>

      <HudCard title="SÍNTESE EMERGENTE · ÚLTIMA ANÁLISE">
        <div className="text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground/90 max-h-[320px] overflow-auto">
          {report}
        </div>
      </HudCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-mono text-[10px] tracking-[0.3em] text-primary/80">INSIGHTS DETECTADOS</h3>
          <div className="flex flex-wrap gap-1">
            {(["all", ...Object.keys(CATEGORY_META)] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
                      onClick={() => setFilter(f as any)}
                      className="font-mono text-[10px] tracking-widest h-7">
                {f === "all" ? "TODOS" : CATEGORY_META[f as Insight["category"]].label}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <HudCard>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Activity className="size-4 text-primary" />
              Nenhum insight emergente. Execute uma detecção para que a IA leia seus padrões reais.
            </div>
          </HudCard>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3">
            {filtered.map((i) => {
              const meta = CATEGORY_META[i.category];
              const Icon = meta.icon;
              return (
                <div key={i.id} className={`hud-panel p-4 border ${meta.ring}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`size-4 ${meta.color}`} />
                      <span className={`font-mono text-[9px] tracking-[0.25em] ${meta.color}`}>{meta.label}</span>
                      <Badge variant="outline" className="font-mono text-[9px] tracking-widest border-border/40 text-muted-foreground">
                        {TYPE_LABEL[i.insight_type]}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={`font-mono text-[9px] ${SEVERITY_STYLES[i.severity]}`}>
                      {i.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="font-display text-sm text-foreground mb-1">{i.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2 whitespace-pre-wrap">{i.content}</p>
                  {i.pattern_data?.pattern && (
                    <div className="text-[10px] font-mono text-primary/80 border-t border-border/30 pt-2 mt-2">
                      <AlertTriangle className="inline size-3 mr-1" /> PADRÃO: {i.pattern_data.pattern}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      {new Date(i.created_at).toLocaleString("pt-BR")}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => archive(i.id)} className="h-6 text-[10px] font-mono">
                        <CheckCircle2 className="size-3 mr-1" /> ARQUIVAR
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(i.id)} className="h-6 text-[10px] font-mono">
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModulePage>
  );
}
