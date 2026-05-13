import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Sparkles, ShieldAlert, TrendingUp, AlertTriangle,
  Activity, CheckCircle2, Trash2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/jarvis")({ component: JarvisPage });

type Insight = {
  id: string;
  kind: "weakness" | "evolution" | "alert";
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  source_module: string | null;
  status: "active" | "resolved" | "archived";
  created_at: string;
};

const SEVERITY_STYLES: Record<string, string> = {
  low: "border-muted/40 text-muted-foreground",
  medium: "border-primary/40 text-primary",
  high: "border-amber-500/60 text-amber-400",
  critical: "border-destructive/60 text-destructive",
};

const KIND_META = {
  weakness: { label: "FRAQUEZA DETECTADA", icon: ShieldAlert, color: "text-destructive" },
  evolution: { label: "EVOLUÇÃO DETECTADA", icon: TrendingUp, color: "text-primary" },
  alert: { label: "ALERTA COMPORTAMENTAL", icon: AlertTriangle, color: "text-amber-400" },
} as const;

function JarvisPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [report, setReport] = useState<string>("Aguardando primeira varredura. Execute uma análise para ativar o JARVIS.");
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<"all" | "weakness" | "evolution" | "alert">("all");

  const load = async () => {
    const [{ data: ins }, { data: rep }] = await Promise.all([
      supabase.from("jarvis_insights").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(60),
      supabase.from("ai_reports").select("content,created_at").eq("scope", "jarvis").order("created_at", { ascending: false }).limit(1),
    ]);
    setInsights((ins ?? []) as Insight[]);
    if (rep?.[0]) setReport(rep[0].content);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const runJarvis = async () => {
    setAnalyzing(true);
    try {
      const [{ data: ident }, { data: missAll }, { data: journal }, { data: hyd }, { data: prevReports }] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("missions").select("title,status,type,xp,created_at,completed_at").limit(100),
        supabase.from("journal_entries").select("title,content,module,created_at").order("created_at", { ascending: false }).limit(40),
        supabase.from("hydration_logs").select("amount_ml,consumed_at").order("consumed_at", { ascending: false }).limit(50),
        supabase.from("ai_reports").select("scope,content,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "jarvis",
          context: {
            identity: ident,
            missions: missAll,
            journal,
            hydration: hyd,
            previous_reports: prevReports,
            now: new Date().toISOString(),
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);

      const content = (data as any).content as string;
      const ins = (data as any).insights as {
        weaknesses?: any[]; evolutions?: any[]; alerts?: any[];
      } | null;

      setReport(content);
      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope: "jarvis", content, metrics: null,
      });

      if (ins) {
        const rows: any[] = [];
        const push = (kind: string, arr?: any[]) =>
          (arr ?? []).slice(0, 5).forEach((x) => rows.push({
            user_id: user!.id, kind, title: x.title ?? "—",
            description: x.description ?? null,
            severity: ["low","medium","high","critical"].includes(x.severity) ? x.severity : "medium",
            source_module: "jarvis", status: "active",
          }));
        push("weakness", ins.weaknesses);
        push("evolution", ins.evolutions);
        push("alert", ins.alerts);
        if (rows.length) await supabase.from("jarvis_insights").insert(rows);
      }

      toast.success("JARVIS · Varredura concluída.");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Falha na análise JARVIS");
    } finally { setAnalyzing(false); }
  };

  const resolveInsight = async (id: string) => {
    await supabase.from("jarvis_insights").update({ status: "resolved" }).eq("id", id);
    setInsights((s) => s.filter((i) => i.id !== id));
  };
  const removeInsight = async (id: string) => {
    await supabase.from("jarvis_insights").delete().eq("id", id);
    setInsights((s) => s.filter((i) => i.id !== id));
  };

  const filtered = insights.filter((i) => filter === "all" || i.kind === filter);
  const counts = {
    weakness: insights.filter((i) => i.kind === "weakness").length,
    evolution: insights.filter((i) => i.kind === "evolution").length,
    alert: insights.filter((i) => i.kind === "alert").length,
  };

  return (
    <ModulePage
      code="// JRV 12"
      title="JARVIS · Inteligência Evolutiva"
      subtitle="Espelho cognitivo · Observa, interpreta e mensura sua transformação contínua."
    >
      <div className="grid lg:grid-cols-4 gap-4">
        <HudCard title="STATUS DO OBSERVADOR" className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-md hud-panel hud-glow flex items-center justify-center">
              <Bot className="size-6 text-primary hud-text-glow" />
            </div>
            <div>
              <div className="font-display text-lg hud-text-glow">JARVIS</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest">
                {analyzing ? "PROCESSANDO..." : "ONLINE · MONITORANDO"}
              </div>
            </div>
          </div>
          <Button onClick={runJarvis} disabled={analyzing} className="mt-4 w-full font-mono text-xs tracking-widest">
            {analyzing ? <RefreshCw className="size-3 mr-2 animate-spin" /> : <Sparkles className="size-3 mr-2" />}
            {analyzing ? "VARRENDO..." : "EXECUTAR VARREDURA"}
          </Button>
          <div className="mt-3 text-[10px] font-mono text-muted-foreground leading-relaxed">
            Cruza identidade, missões, diário, hidratação e relatórios anteriores.
          </div>
        </HudCard>

        <HudCard title="FRAQUEZAS ATIVAS">
          <div className="flex items-baseline gap-2">
            <ShieldAlert className="size-5 text-destructive" />
            <span className="font-display text-4xl text-destructive hud-text-glow">{counts.weakness}</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-1 tracking-widest">PADRÕES SABOTADORES</div>
        </HudCard>

        <HudCard title="EVOLUÇÕES RECENTES">
          <div className="flex items-baseline gap-2">
            <TrendingUp className="size-5 text-primary" />
            <span className="font-display text-4xl text-primary hud-text-glow">{counts.evolution}</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-1 tracking-widest">MELHORIAS DETECTADAS</div>
        </HudCard>

        <HudCard title="ALERTAS COMPORTAMENTAIS">
          <div className="flex items-baseline gap-2">
            <AlertTriangle className="size-5 text-amber-400" />
            <span className="font-display text-4xl text-amber-400 hud-text-glow">{counts.alert}</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-1 tracking-widest">EXIGEM ATENÇÃO</div>
        </HudCard>
      </div>

      <HudCard title="RELATÓRIO JARVIS · ÚLTIMA VARREDURA">
        <div className="text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground/90 max-h-[400px] overflow-auto">
          {report}
        </div>
      </HudCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] tracking-[0.3em] text-primary/80">INSIGHTS DETECTADOS</h3>
          <div className="flex gap-1">
            {(["all","weakness","evolution","alert"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="font-mono text-[10px] tracking-widest h-7"
              >
                {f === "all" ? "TODOS" : f === "weakness" ? "FRAQUEZAS" : f === "evolution" ? "EVOLUÇÕES" : "ALERTAS"}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <HudCard>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Activity className="size-4 text-primary" />
              Nenhum insight ativo. Execute uma varredura para que o JARVIS observe seus padrões.
            </div>
          </HudCard>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3">
            {filtered.map((i) => {
              const meta = KIND_META[i.kind];
              const Icon = meta.icon;
              return (
                <div key={i.id} className={`hud-panel p-4 border ${SEVERITY_STYLES[i.severity]}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`size-4 ${meta.color}`} />
                      <span className={`font-mono text-[9px] tracking-[0.25em] ${meta.color}`}>{meta.label}</span>
                    </div>
                    <Badge variant="outline" className={`font-mono text-[9px] ${SEVERITY_STYLES[i.severity]}`}>
                      {i.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="font-display text-sm text-foreground mb-1">{i.title}</div>
                  {i.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{i.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      {new Date(i.created_at).toLocaleString("pt-BR")}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => resolveInsight(i.id)} className="h-6 text-[10px] font-mono">
                        <CheckCircle2 className="size-3 mr-1" /> RESOLVER
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeInsight(i.id)} className="h-6 text-[10px] font-mono">
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
