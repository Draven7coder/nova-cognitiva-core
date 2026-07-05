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
import { Sparkles, Target, Flame, Calendar, Cog, Brain, AlertTriangle, Fingerprint, Bot, ShieldAlert, TrendingUp as TrendUp, Zap, HeartPulse, Compass, Swords, Shield, Skull, Crosshair, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { syncChainProgress } from "@/lib/chain-sync";
import { loadQiTimelineReal, loadPendingSuggestions, type QiDailyPoint, type PendingSuggestion } from "@/lib/metrics-real";

export const Route = createFileRoute("/app/")({ component: Dashboard });

// Local-timezone YYYY-MM-DD (fixes BR UTC-3 off-by-one after ~21h).
function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const [jarvis, setJarvis] = useState<{ weakness: number; evolution: number; alert: number; topAlert?: any }>({ weakness: 0, evolution: 0, alert: 0 });
  const [emergent, setEmergent] = useState<any[]>([]);
  const [emergentCounts, setEmergentCounts] = useState<Record<string, number>>({});
  const [achievements, setAchievements] = useState({
    missionsDone: 0, totalXP: 0, oodaCount: 0, journalCount: 0, insightsAccepted: 0, hydrationDays: 0,
  });
  const [chains, setChains] = useState<any[]>([]);
  const [chainSubs, setChainSubs] = useState<any[]>([]);
  const [checkin, setCheckin] = useState<any>(null);
  const [ciSleep, setCiSleep] = useState(5);
  const [ciEnergy, setCiEnergy] = useState(5);
  const [ciFocus, setCiFocus] = useState(5);
  const [ciMood, setCiMood] = useState(5);
  const [ciStress, setCiStress] = useState(5);
  const [ciDiscomfort, setCiDiscomfort] = useState("");
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [qiTimeline, setQiTimeline] = useState<QiDailyPoint[]>([]);
  const [pending, setPending] = useState<PendingSuggestion[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { data: m }, { data: r }, { data: ji }, { data: em },
        { count: missionsDone }, { data: comps }, { count: oodaCount }, { count: journalCount },
        { count: insightsAccepted }, { data: hyd },
      ] = await Promise.all([
        supabase.from("missions").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(5),
        supabase.from("ai_reports").select("*").order("created_at", { ascending: false }).limit(1),
        supabase.from("jarvis_insights").select("kind,title,severity,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(50),
        supabase.from("emergent_insights").select("category,insight_type,title,severity,created_at").eq("status","active").order("created_at",{ ascending:false }).limit(50),
        supabase.from("mission_completions").select("*", { count: "exact", head: true }),
        supabase.from("mission_completions").select("mission_id"),
        supabase.from("ooda_entries").select("*", { count: "exact", head: true }),
        supabase.from("journal_entries").select("*", { count: "exact", head: true }),
        supabase.from("emergent_insights").select("*", { count: "exact", head: true }).gte("feedback_rating", 4),
        supabase.from("hydration_logs").select("consumed_at").order("consumed_at", { ascending: false }).limit(500),
      ]);
      setMissions(m ?? []);
      if (r?.[0]) {
        if (r[0].metrics) setMetrics(r[0].metrics as any);
        setInsight(r[0].content.split("\n").slice(0, 4).join("\n"));
      }
      const list = ji ?? [];
      setJarvis({
        weakness: list.filter((x) => x.kind === "weakness").length,
        evolution: list.filter((x) => x.kind === "evolution").length,
        alert: list.filter((x) => x.kind === "alert").length,
        topAlert: list.find((x) => x.kind === "alert") ?? list.find((x) => x.kind === "weakness"),
      });
      const eList = em ?? [];
      setEmergent(eList.slice(0, 4));
      const c: Record<string, number> = { cognitivo: 0, execucao: 0, emocional: 0, estrategico: 0, identidade: 0 };
      eList.forEach((x: any) => { if (c[x.category] !== undefined) c[x.category]++; });
      setEmergentCounts(c);

      // Aggregate XP from completions × mission XP — we already have completions list w/ mission ids
      const { data: missAll } = await supabase.from("missions").select("id,xp");
      const xpMap = new Map((missAll ?? []).map((x: any) => [x.id, x.xp ?? 0]));
      const totalXP = (comps ?? []).reduce((acc: number, c: any) => acc + (xpMap.get(c.mission_id) ?? 0), 0);
      const hydDays = new Set((hyd ?? []).map((h: any) => h.consumed_at?.slice(0, 10))).size;
      setAchievements({
        missionsDone: missionsDone ?? 0,
        totalXP,
        oodaCount: oodaCount ?? 0,
        journalCount: journalCount ?? 0,
        insightsAccepted: insightsAccepted ?? 0,
        hydrationDays: hydDays,
      });

      // Auto-sync chain subtasks based on TODAY's real activity in each module,
      // then load chains/subtasks/check-in.
      if (user) await syncChainProgress(user.id).catch(() => 0);
      const today = todayLocal();
      const [{ data: ch }, { data: csb }, { data: ci }] = await Promise.all([
        (supabase as any).from("operational_chains").select("*").order("priority", { ascending: false }),
        (supabase as any).from("chain_subtasks").select("*").order("order_index", { ascending: true }),
        (supabase as any).from("daily_checkins").select("*").eq("check_date", today).maybeSingle(),
      ]);
      setChains(ch ?? []);
      setChainSubs(csb ?? []);
      if (ci) {
        setCheckin(ci);
        setCiSleep(ci.sleep_quality ?? 5); setCiEnergy(ci.energy ?? 5);
        setCiFocus(ci.focus ?? 5); setCiMood(ci.mood ?? 5); setCiStress(ci.stress ?? 5);
        setCiDiscomfort(ci.discomfort ?? "");
      }

      // Real QI timeline + pending suggestions
      if (user) {
        const [tl, ps] = await Promise.all([
          loadQiTimelineReal(user.id).catch(() => []),
          loadPendingSuggestions(user.id).catch(() => []),
        ]);
        setQiTimeline(tl);
        setPending(ps);
      }
    })();
  }, [user]);

  // Operational mode auto-derivation
  function deriveMode(s: number, e: number, f: number, m: number, st: number): { code: string; label: string; desc: string; icon: any; cls: string } {
    const composite = (s + e + f + m + (10 - st)) / 5;
    if (composite >= 8) return { code: "guerra", label: "⚔️ GUERRA", desc: "desempenho máximo · tarefas complexas · alta intensidade.", icon: Swords, cls: "text-rose-400 border-rose-400/60" };
    if (composite >= 6) return { code: "estrategico", label: "🎯 ESTRATÉGICO", desc: "progresso consistente · equilíbrio execução/recuperação.", icon: Crosshair, cls: "text-primary border-primary/60" };
    if (composite >= 4) return { code: "recuperacao", label: "🛡️ RECUPERAÇÃO", desc: "redução de intensidade · preservar continuidade.", icon: Shield, cls: "text-amber-400 border-amber-400/60" };
    return { code: "sobrevivencia", label: "🌑 SOBREVIVÊNCIA", desc: "execução mínima para não quebrar hábitos.", icon: Skull, cls: "text-muted-foreground border-border" };
  }
  const mode = deriveMode(ciSleep, ciEnergy, ciFocus, ciMood, ciStress);

  // Auto main mission: subtask of highest-priority active chain
  const activeChains = chains.filter((c) => c.status === "ativa");
  const topChain = activeChains[0];
  const topChainSubs = topChain ? chainSubs.filter((s) => s.chain_id === topChain.id).sort((a, b) => a.order_index - b.order_index) : [];
  const mainSubtask = topChainSubs.find((s) => s.status !== "done");
  const mainMission = checkin?.main_mission ?? (topChain && mainSubtask
    ? `Cadeia ${topChain.code} · ${mainSubtask.code} — ${mainSubtask.title}`
    : topChain ? `Cadeia ${topChain.code} — ${topChain.title}` : "Defina sua primeira Cadeia Operacional.");

  const saveCheckin = async () => {
    setSavingCheckin(true);
    try {
      const today = todayLocal();
      const m = deriveMode(ciSleep, ciEnergy, ciFocus, ciMood, ciStress);
      const { error } = await (supabase as any).from("daily_checkins").upsert({
        user_id: user!.id, check_date: today,
        sleep_quality: ciSleep, energy: ciEnergy, focus: ciFocus, mood: ciMood, stress: ciStress,
        discomfort: ciDiscomfort || null, operational_mode: m.code,
        main_mission: topChain && mainSubtask
          ? `Cadeia ${topChain.code} · ${mainSubtask.code} — ${mainSubtask.title}`
          : null,
      }, { onConflict: "user_id,check_date" });
      if (error) throw error;
      toast.success(`Check-in registrado · modo ${m.label}.`);
      const { data: ci } = await (supabase as any).from("daily_checkins").select("*").eq("check_date", today).maybeSingle();
      setCheckin(ci);
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingCheckin(false); }
  };

  const MODULE_PATHS: Record<string, string> = {
    identidade: "/app/identidade", proposito: "/app/proposito", intelecto: "/app/intelecto",
    laboratorio: "/app/laboratorio", manual: "/app/manual", protocolos: "/app/protocolos",
    performance: "/app/performance", hidratacao: "/app/hidratacao", missoes: "/app/missoes",
    ideias: "/app/ideias", sombra: "/app/sombra", evolucao: "/app/evolucao",
    ooda: "/app/ooda", jarvis: "/app/jarvis", insights: "/app/insights", relatorios: "/app/relatorios",
  };

  // Base QI from IA metrics (0-100 average)
  const baseQI = Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length);
  // Achievement bonus (0-400) — caps via diminishing returns to 500 total
  const a = achievements;
  const rawBonus =
    a.missionsDone * 2.5 +
    a.totalXP * 0.4 +
    a.oodaCount * 6 +
    a.journalCount * 1.5 +
    a.insightsAccepted * 4 +
    a.hydrationDays * 1.2;
  const bonus = Math.min(400, Math.round(rawBonus));
  const overallQI = Math.min(500, baseQI + bonus);
  const qiPct = (overallQI / 500) * 100;

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
  const evoData = qiTimeline.length ? qiTimeline : [];

  return (
    <ModulePage code="// CORE 00" title="Núcleo Operacional" subtitle="Painel central de comando · QI Funcional Operacional ativo.">
      {/* ==== SISTEMA NERVOSO CENTRAL ==== */}
      <HudCard title="🎯 MISSÃO PRINCIPAL DO DIA · DEFINIDA PELO JARVIS">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={`font-mono text-xs ${mode.cls}`}>
            <mode.icon className="size-3 mr-1 inline" /> MODO {mode.label}
          </Badge>
          <div className="flex-1 min-w-[200px]">
            <div className="font-display text-base text-foreground hud-text-glow">{mainMission}</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{mode.desc}</div>
          </div>
          {topChain && (
            <Link to={mainSubtask ? (MODULE_PATHS[mainSubtask.module ?? ""] ?? "/app/cadeias") : "/app/cadeias"}>
              <Button size="sm" className="font-mono text-xs tracking-widest hud-glow animate-pulse-ring">
                IR <ArrowRight className="size-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </HudCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <HudCard title="⚙ CHECK-IN DIÁRIO · CALIBRAÇÃO DO OPERADOR">
          <div className="space-y-3">
            {checkin && (
              <div className="flex items-center gap-2 rounded border border-primary/40 bg-primary/5 px-2 py-1.5 font-mono text-[10px] tracking-widest text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
                <span>✓ REGISTRADO ÀS {new Date(checkin.updated_at ?? checkin.created_at ?? Date.now()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="ml-auto text-muted-foreground">edite abaixo para atualizar</span>
              </div>
            )}
            {[
              { label: "Sono", v: ciSleep, set: setCiSleep },
              { label: "Energia", v: ciEnergy, set: setCiEnergy },
              { label: "Foco", v: ciFocus, set: setCiFocus },
              { label: "Humor", v: ciMood, set: setCiMood },
              { label: "Estresse", v: ciStress, set: setCiStress },
            ].map((it) => (
              <div key={it.label}>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground tracking-widest">
                  <span>{it.label.toUpperCase()}</span><span className="text-primary">{it.v}/10</span>
                </div>
                <Slider min={0} max={10} step={1} value={[it.v]} onValueChange={(v) => it.set(v[0])} className="mt-1" />
              </div>
            ))}
            <Input placeholder="Desconfortos físicos / observações" value={ciDiscomfort} onChange={(e) => setCiDiscomfort(e.target.value)} className="bg-input/40 font-mono text-xs" />
            <Button onClick={saveCheckin} disabled={savingCheckin} className="w-full font-mono text-xs tracking-widest">
              {savingCheckin ? "REGISTRANDO..." : checkin ? "ATUALIZAR CHECK-IN" : "REGISTRAR CHECK-IN"}
            </Button>
          </div>
        </HudCard>

        <HudCard title="⛓ CADEIAS ATIVAS">
          {activeChains.length === 0 ? (
            <div className="text-sm text-muted-foreground font-mono">
              Nenhuma cadeia ativa. <Link to="/app/cadeias" className="text-primary hover:underline">Acionar JARVIS para gerar cadeias →</Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {activeChains.slice(0, 6).map((c) => {
                const cs = chainSubs.filter((s) => s.chain_id === c.id).sort((a, b) => a.order_index - b.order_index);
                const done = cs.filter((s) => s.status === "done").length;
                const next = cs.find((s) => s.status !== "done");
                const isTop = c.id === topChain?.id;
                const target = next ? (MODULE_PATHS[next.module ?? ""] ?? "/app/cadeias") : "/app/cadeias";
                return (
                  <li key={c.id} className={`hud-panel p-2 hover:border-primary/60 transition ${isTop ? "border-primary/70 hud-glow" : ""}`}>
                    <Link to={target} className="block">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary tracking-widest">CAD {c.code}</span>
                        <span className="flex-1 text-sm truncate">{c.title}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{done}/{cs.length}</span>
                        {next && <span className="font-mono text-[10px] text-primary">→ {next.code}</span>}
                      </div>
                      <div className="h-0.5 bg-muted/40 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${cs.length ? (done / cs.length) * 100 : 0}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
              <Link to="/app/cadeias" className="block text-center font-mono text-[10px] text-primary hover:underline tracking-widest pt-1">
                GERENCIAR TODAS AS CADEIAS →
              </Link>
            </ul>
          )}
        </HudCard>
      </div>

      <HudCard title="↻ CADEIAS EM CONTINUIDADE">
        {activeChains.length === 0 ? (
          <div className="text-xs text-muted-foreground font-mono">Sem cadeias para continuar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground tracking-widest text-[10px] border-b border-border/40">
                  <th className="text-left py-2 px-2">CADEIA</th>
                  <th className="text-left py-2 px-2">ÚLTIMA</th>
                  <th className="text-left py-2 px-2">PRÓXIMA</th>
                  <th className="text-left py-2 px-2">MÓDULO</th>
                  <th className="text-right py-2 px-2">AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {activeChains.slice(0, 10).map((c) => {
                  const cs = chainSubs.filter((s) => s.chain_id === c.id).sort((a, b) => a.order_index - b.order_index);
                  const lastDone = [...cs].reverse().find((s) => s.status === "done");
                  const next = cs.find((s) => s.status !== "done");
                  const target = next ? (MODULE_PATHS[next.module ?? ""] ?? "/app/cadeias") : "/app/cadeias";
                  return (
                    <tr key={c.id} className="border-b border-border/20 hover:bg-primary/5">
                      <td className="py-2 px-2 text-primary">{c.code}</td>
                      <td className="py-2 px-2 text-muted-foreground">{lastDone ? lastDone.code : "—"}</td>
                      <td className="py-2 px-2 text-primary">{next ? next.code : "✓"}</td>
                      <td className="py-2 px-2 text-foreground/80">{next?.module ?? c.primary_module ?? "—"}</td>
                      <td className="py-2 px-2 text-right">
                        <Link to={target} className="text-primary hover:underline tracking-widest">ABRIR →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </HudCard>

      <div className="grid lg:grid-cols-3 gap-4">
        <HudCard title="QI FUNCIONAL OPERACIONAL" className="lg:col-span-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl text-primary hud-text-glow">{overallQI}</span>
            <span className="font-mono text-xs text-muted-foreground">/ 500</span>
          </div>
          <Progress value={qiPct} className="mt-3 h-1" />
          <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] font-mono text-muted-foreground">
            <div>Base IA: <span className="text-primary">{baseQI}</span></div>
            <div>Bônus feitos: <span className="text-primary">+{bonus}</span></div>
            <div>Missões: <span className="text-primary">{a.missionsDone}</span></div>
            <div>XP: <span className="text-primary">{a.totalXP}</span></div>
            <div>OODA: <span className="text-primary">{a.oodaCount}</span></div>
            <div>Journal: <span className="text-primary">{a.journalCount}</span></div>
            <div>Insights ✓4★: <span className="text-primary">{a.insightsAccepted}</span></div>
            <div>Hidrat. dias: <span className="text-primary">{a.hydrationDays}</span></div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
            QI escala 0–500 · base cognitiva da IA + realizações reais no sistema.
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

      <HudCard title="🤖 JARVIS · ESPELHO COGNITIVO">
        <div className="grid lg:grid-cols-4 gap-3">
          <Link to="/app/jarvis" className="hud-panel p-3 hover:border-primary/60 transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="size-4 text-primary group-hover:hud-text-glow" />
              <span className="font-mono text-[10px] tracking-widest text-foreground/90">ABRIR JARVIS</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono leading-relaxed">
              Observador contínuo de padrões, fraquezas e evoluções.
            </div>
          </Link>
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2"><ShieldAlert className="size-4 text-destructive" /><span className="font-mono text-[10px] tracking-widest text-destructive">FRAQUEZAS</span></div>
            <div className="font-display text-3xl text-destructive hud-text-glow mt-1">{jarvis.weakness}</div>
          </div>
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2"><TrendUp className="size-4 text-primary" /><span className="font-mono text-[10px] tracking-widest text-primary">EVOLUÇÕES</span></div>
            <div className="font-display text-3xl text-primary hud-text-glow mt-1">{jarvis.evolution}</div>
          </div>
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-400" /><span className="font-mono text-[10px] tracking-widest text-amber-400">ALERTAS</span></div>
            <div className="font-display text-3xl text-amber-400 hud-text-glow mt-1">{jarvis.alert}</div>
          </div>
        </div>
        {jarvis.topAlert && (
          <div className="mt-3 text-xs font-mono text-muted-foreground border-t border-border/40 pt-3">
            <span className="text-primary">▸ ÚLTIMO INSIGHT:</span> {jarvis.topAlert.title}
          </div>
        )}
      </HudCard>

      <HudCard title="✦ INSIGHTS EMERGENTES · DETECÇÃO DE PADRÕES REAIS">
        <div className="grid lg:grid-cols-6 gap-3 mb-3">
          <Link to="/app/insights" className="hud-panel p-3 hover:border-primary/60 transition-colors group lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-primary group-hover:hud-text-glow" />
              <span className="font-mono text-[10px] tracking-widest text-foreground/90">ABRIR</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono leading-relaxed">
              Espelho evolutivo. Padrões reais, zero motivacional.
            </div>
          </Link>
          {[
            { k: "cognitivo", l: "COGNITIVO", icon: Brain, cls: "text-primary" },
            { k: "execucao", l: "EXECUÇÃO", icon: Zap, cls: "text-amber-400" },
            { k: "emocional", l: "EMOCIONAL", icon: HeartPulse, cls: "text-rose-400" },
            { k: "estrategico", l: "ESTRATÉGICO", icon: Compass, cls: "text-cyan-300" },
            { k: "identidade", l: "IDENTIDADE", icon: Fingerprint, cls: "text-violet-300" },
          ].map((c) => (
            <div key={c.k} className="hud-panel p-3">
              <div className="flex items-center gap-2"><c.icon className={`size-4 ${c.cls}`} /><span className={`font-mono text-[10px] tracking-widest ${c.cls}`}>{c.l}</span></div>
              <div className={`font-display text-2xl ${c.cls} hud-text-glow mt-1`}>{emergentCounts[c.k] ?? 0}</div>
            </div>
          ))}
        </div>
        {emergent.length === 0 ? (
          <div className="text-xs font-mono text-muted-foreground">Nenhum insight emergente. Abra o módulo e execute a detecção.</div>
        ) : (
          <ul className="space-y-1">
            {emergent.map((e, idx) => (
              <li key={idx} className="text-xs font-mono text-foreground/80 border-t border-border/30 pt-1.5">
                <span className="text-primary mr-2">▸ {e.category?.toUpperCase()}</span>{e.title}
              </li>
            ))}
          </ul>
        )}
      </HudCard>


      <div className="grid lg:grid-cols-3 gap-4">
        <HudCard title="EVOLUÇÃO TEMPORAL · QI · 14D · REAL" className="lg:col-span-2">
          {evoData.length === 0 || evoData.every((p) => p.qi === 0) ? (
            <div className="h-[200px] flex items-center justify-center text-xs font-mono text-muted-foreground text-center px-6">
              Sem check-ins nos últimos 14 dias. Registre o check-in diário — o QI real será desenhado aqui.
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer>
                <LineChart data={evoData}>
                  <XAxis dataKey="date" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} stroke="oklch(0.32 0.06 215 / 0.3)" />
                  <YAxis domain={[0, 100]} tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 10 }} stroke="oklch(0.32 0.06 215 / 0.3)" />
                  <Tooltip contentStyle={{ background: "oklch(0.18 0.03 235)", border: "1px solid oklch(0.78 0.18 210 / 0.4)", borderRadius: 6 }} />
                  <Line type="monotone" dataKey="qi" stroke="oklch(0.78 0.18 210)" strokeWidth={2} dot={{ r: 2, fill: "oklch(0.78 0.18 210)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
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
