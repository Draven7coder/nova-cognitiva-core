import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles, Brain, Zap, HeartPulse, Compass, Fingerprint,
  RefreshCw, AlertTriangle, CheckCircle2, Trash2, Activity,
  Star, ThumbsUp, ThumbsDown, Settings as SettingsIcon, FileDown, Radio,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  feedback_rating?: number | null;
  feedback_useful?: boolean | null;
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

type Settings = {
  frequency: "realtime" | "daily" | "weekly";
  categories: Record<Insight["category"], boolean>;
  types: Record<Insight["insight_type"], boolean>;
  realtimeMinIntervalMin: number;
};
const SETTINGS_KEY = "emergent.settings.v1";
const LAST_RUN_KEY = "emergent.lastRunAt";
const defaultSettings = (): Settings => ({
  frequency: "daily",
  categories: { cognitivo: true, execucao: true, emocional: true, estrategico: true, identidade: true },
  types: { rapido: true, profundo: true, alerta: true, recomendacao: true, relatorio: true },
  realtimeMinIntervalMin: 15,
});

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch { return defaultSettings(); }
}

function InsightsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [report, setReport] = useState<string>("Sistema dormente. Execute uma varredura emergente para detectar padrões reais nos seus dados operacionais.");
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<"all" | Insight["category"]>("all");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const analyzingRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => { setSettings(loadSettings()); }, []);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("emergent_insights")
      .select("*").eq("status", "active")
      .order("created_at", { ascending: false }).limit(80);
    setInsights((data ?? []) as Insight[]);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  const runEmergent = useCallback(async (silent = false) => {
    if (analyzingRef.current) return;
    analyzingRef.current = true;
    setAnalyzing(true);
    try {
      const allowedCategories = Object.entries(settings.categories).filter(([, v]) => v).map(([k]) => k);
      const allowedTypes = Object.entries(settings.types).filter(([, v]) => v).map(([k]) => k);

      const [
        { data: ident }, { data: miss }, { data: completions },
        { data: journal }, { data: hyd }, { data: ooda },
        { data: ideas }, { data: prevReports }, { data: prevInsights },
        { data: feedbackSample },
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
        supabase.from("emergent_insights").select("category,insight_type,title,feedback_rating,feedback_useful").not("feedback_rating", "is", null).limit(40),
      ]);

      // Aggregate feedback signal
      const fbAgg: Record<string, { count: number; avg: number; useful: number; notUseful: number }> = {};
      (feedbackSample ?? []).forEach((f: any) => {
        const k = `${f.category}/${f.insight_type}`;
        const a = (fbAgg[k] ??= { count: 0, avg: 0, useful: 0, notUseful: 0 });
        a.count++;
        a.avg += f.feedback_rating ?? 0;
        if (f.feedback_useful === true) a.useful++;
        if (f.feedback_useful === false) a.notUseful++;
      });
      Object.values(fbAgg).forEach((v) => { v.avg = v.count ? v.avg / v.count : 0; });

      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "emergent",
          context: {
            identity: ident, missions: miss, mission_completions: completions,
            journal, hydration: hyd, ooda_cycles: ooda, ideas,
            previous_reports: prevReports, previous_emergent_insights: prevInsights,
            settings: { allowedCategories, allowedTypes },
            feedback_signal: fbAgg,
            now: new Date().toISOString(),
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);

      const content = (data as any).content as string;
      const emergent = (data as any).emergent as { insights?: any[] } | null;

      setReport(content);
      localStorage.setItem(LAST_RUN_KEY, new Date().toISOString());

      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope: "emergent", content, metrics: null,
      });

      if (emergent?.insights?.length) {
        const rows = emergent.insights.slice(0, 14)
          .filter((x: any) => allowedCategories.includes(x.category) && allowedTypes.includes(x.insight_type))
          .map((x: any) => ({
            user_id: user!.id,
            category: x.category, insight_type: x.insight_type,
            title: (x.title ?? "—").slice(0, 200),
            content: x.content ?? "",
            severity: ["low","medium","high","critical"].includes(x.severity) ? x.severity : "medium",
            pattern_data: x.pattern ? { pattern: x.pattern } : null,
            status: "active", source_scope: "emergent",
          }));
        if (rows.length) await supabase.from("emergent_insights").insert(rows);
      }

      if (!silent) toast.success("Insights Emergentes atualizados.");
      load();
    } catch (e: any) {
      if (!silent) toast.error(e.message ?? "Falha na análise emergente.");
    } finally { analyzingRef.current = false; setAnalyzing(false); }
  }, [settings, user, load]);

  // Realtime: listen for behavior changes and live-reload + optionally trigger emergent
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("emergent-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergent_insights" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "journal_entries" }, () => triggerAuto("journal"))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mission_completions" }, () => triggerAuto("mission"))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ooda_entries" }, () => triggerAuto("ooda"))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const triggerAuto = (source: string) => {
    if (settings.frequency !== "realtime") return;
    const last = localStorage.getItem(LAST_RUN_KEY);
    const minutes = settings.realtimeMinIntervalMin;
    if (last && Date.now() - new Date(last).getTime() < minutes * 60_000) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      toast.info(`Disparo automático (${source}) · varredura emergente em andamento`);
      runEmergent(true);
    }, 4000);
  };

  // Daily/Weekly auto-trigger when page is opened
  useEffect(() => {
    if (!user) return;
    const last = localStorage.getItem(LAST_RUN_KEY);
    if (!last) return;
    const ageMs = Date.now() - new Date(last).getTime();
    if (settings.frequency === "daily" && ageMs > 24 * 3600_000) runEmergent(true);
    if (settings.frequency === "weekly" && ageMs > 7 * 24 * 3600_000) runEmergent(true);
  }, [user, settings.frequency, runEmergent]);

  const archive = async (id: string) => {
    await supabase.from("emergent_insights").update({ status: "archived" }).eq("id", id);
    setInsights((s) => s.filter((i) => i.id !== id));
  };
  const remove = async (id: string) => {
    if (!confirm("Remover este insight permanentemente?")) return;
    await supabase.from("emergent_insights").delete().eq("id", id);
    setInsights((s) => s.filter((i) => i.id !== id));
  };
  const rate = async (id: string, rating: number) => {
    await supabase.from("emergent_insights").update({ feedback_rating: rating }).eq("id", id);
    setInsights((s) => s.map((i) => i.id === id ? { ...i, feedback_rating: rating } : i));
    toast.success(`Avaliado · ${rating}/5 · IA adaptará próximos insights.`);
  };
  const markUseful = async (id: string, useful: boolean) => {
    await supabase.from("emergent_insights").update({ feedback_useful: useful }).eq("id", id);
    setInsights((s) => s.map((i) => i.id === id ? { ...i, feedback_useful: useful } : i));
    toast.success(useful ? "Marcado como útil" : "Marcado como pouco útil");
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
    const sevs = ["low","medium","high","critical"] as const;
    const cats = Object.keys(CATEGORY_META) as Insight["category"][];
    return cats.map((c) => ({
      cat: c,
      cells: sevs.map((s) => insights.filter((i) => i.category === c && i.severity === s).length),
    }));
  }, [insights]);

  const filtered = filter === "all" ? insights : insights.filter((i) => i.category === filter);

  const exportPDF = async () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const margin = 36;
      let y = margin;

      doc.setFillColor(10, 18, 28); doc.rect(0, 0, W, 70, "F");
      doc.setTextColor(120, 230, 255); doc.setFontSize(18);
      doc.text("EMERGENT INSIGHTS · RELATÓRIO OPERACIONAL", margin, 36);
      doc.setFontSize(9); doc.setTextColor(160, 200, 220);
      doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, margin, 54);
      y = 100;

      doc.setTextColor(20, 20, 20); doc.setFontSize(11);
      doc.text("RESUMO POR CATEGORIA", margin, y); y += 6;
      autoTable(doc, {
        startY: y + 4,
        head: [["Categoria", "Total"]],
        body: Object.entries(CATEGORY_META).map(([k, m]) => [m.label, String(counts[k] ?? 0)]),
        styles: { fontSize: 9 }, theme: "grid",
        headStyles: { fillColor: [16, 40, 60], textColor: 200 },
      });
      y = (doc as any).lastAutoTable.finalY + 16;

      doc.setFontSize(11); doc.text("LINHA DO TEMPO · 14 DIAS", margin, y); y += 6;
      autoTable(doc, {
        startY: y + 4,
        head: [["Dia", "Detecções"]],
        body: timeline.map((t) => [t.d, String(t.v)]),
        styles: { fontSize: 8 }, theme: "striped",
        headStyles: { fillColor: [16, 40, 60], textColor: 200 },
      });
      y = (doc as any).lastAutoTable.finalY + 16;

      doc.setFontSize(11); doc.text("HEATMAP · CATEGORIA × SEVERIDADE", margin, y); y += 6;
      autoTable(doc, {
        startY: y + 4,
        head: [["Categoria", "LOW", "MED", "HIGH", "CRIT"]],
        body: heatmap.map((r) => [CATEGORY_META[r.cat].label, ...r.cells.map(String)]),
        styles: { fontSize: 9 }, theme: "grid",
        headStyles: { fillColor: [16, 40, 60], textColor: 200 },
      });
      y = (doc as any).lastAutoTable.finalY + 16;

      const alerts = insights.filter((i) => i.severity === "high" || i.severity === "critical");
      doc.setFontSize(11); doc.text(`ALERTAS CRÍTICOS (${alerts.length})`, margin, y); y += 6;
      if (alerts.length) {
        autoTable(doc, {
          startY: y + 4,
          head: [["Sev", "Categoria", "Título", "Conteúdo"]],
          body: alerts.map((a) => [a.severity.toUpperCase(), CATEGORY_META[a.category].label, a.title, a.content]),
          styles: { fontSize: 8, cellWidth: "wrap" }, theme: "grid",
          columnStyles: { 2: { cellWidth: 120 }, 3: { cellWidth: 280 } },
          headStyles: { fillColor: [60, 16, 16], textColor: 240 },
        });
        y = (doc as any).lastAutoTable.finalY + 16;
      }

      doc.setFontSize(11); doc.text("INSIGHTS DETECTADOS", margin, y);
      autoTable(doc, {
        startY: y + 6,
        head: [["Categoria", "Tipo", "Sev", "Título", "Conteúdo", "Rating"]],
        body: insights.map((i) => [
          CATEGORY_META[i.category].label,
          TYPE_LABEL[i.insight_type],
          i.severity.toUpperCase(),
          i.title,
          i.content,
          i.feedback_rating ? `${i.feedback_rating}/5` : "—",
        ]),
        styles: { fontSize: 7, cellWidth: "wrap" }, theme: "striped",
        columnStyles: { 3: { cellWidth: 110 }, 4: { cellWidth: 230 } },
        headStyles: { fillColor: [16, 40, 60], textColor: 220 },
      });

      doc.save(`emergent-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF exportado.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao gerar PDF");
    }
  };

  const toggleCat = (k: Insight["category"]) =>
    setSettings((s) => ({ ...s, categories: { ...s.categories, [k]: !s.categories[k] } }));
  const toggleType = (k: Insight["insight_type"]) =>
    setSettings((s) => ({ ...s, types: { ...s.types, [k]: !s.types[k] } }));

  return (
    <ModulePage
      code="// EMG 14"
      title="Insights Emergentes da IA"
      subtitle="Espelho evolutivo · Detecção contínua de padrões reais a partir do seu comportamento."
    >
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">
          DETECÇÃO {settings.frequency === "realtime" ? "TEMPO REAL · LIVE" : settings.frequency.toUpperCase()}
        </span>
        <span>· análise empírica · zero motivacional · padrões reais.</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportPDF} className="font-mono text-[10px] tracking-widest h-7">
            <FileDown className="size-3 mr-1" /> EXPORTAR PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowSettings((v) => !v)} className="font-mono text-[10px] tracking-widest h-7">
            <SettingsIcon className="size-3 mr-1" /> CONFIG
          </Button>
        </div>
      </div>

      {showSettings && (
        <HudCard title="⚙ CONFIGURAÇÕES DE DETECÇÃO">
          <div className="grid lg:grid-cols-3 gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-2">FREQUÊNCIA</div>
              {(["realtime","daily","weekly"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 p-2 border border-border/40 rounded cursor-pointer hover:border-primary/60 mb-1">
                  <input type="radio" name="freq" checked={settings.frequency === f}
                    onChange={() => setSettings((s) => ({ ...s, frequency: f }))} />
                  <span className="font-mono text-xs">
                    {f === "realtime" ? <><Radio className="inline size-3 mr-1" /> TEMPO REAL · gatilhos automáticos</> : f === "daily" ? "DIÁRIA" : "SEMANAL"}
                  </span>
                </label>
              ))}
              {settings.frequency === "realtime" && (
                <div className="mt-2">
                  <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-1">INTERVALO MÍNIMO (MIN)</div>
                  <input type="number" min={5} max={240} value={settings.realtimeMinIntervalMin}
                    onChange={(e) => setSettings((s) => ({ ...s, realtimeMinIntervalMin: parseInt(e.target.value) || 15 }))}
                    className="w-24 bg-input/40 border border-border/40 rounded px-2 py-1 font-mono text-xs" />
                </div>
              )}
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-2">CATEGORIAS ATIVAS</div>
              {(Object.keys(CATEGORY_META) as Insight["category"][]).map((k) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className={`font-mono text-xs ${CATEGORY_META[k].color}`}>{CATEGORY_META[k].label}</span>
                  <Switch checked={settings.categories[k]} onCheckedChange={() => toggleCat(k)} />
                </div>
              ))}
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-2">TIPOS ATIVOS</div>
              {(Object.keys(TYPE_LABEL) as Insight["insight_type"][]).map((k) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="font-mono text-xs">{TYPE_LABEL[k]}</span>
                  <Switch checked={settings.types[k]} onCheckedChange={() => toggleType(k)} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-muted-foreground">
            Filtros aplicam-se à próxima detecção. Em tempo real, novas inserções de journal/missões/OODA disparam varredura (com cooldown).
          </div>
        </HudCard>
      )}

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
          <Button onClick={() => runEmergent(false)} disabled={analyzing} className="mt-4 w-full font-mono text-xs tracking-widest">
            {analyzing ? <RefreshCw className="size-3 mr-2 animate-spin" /> : <Sparkles className="size-3 mr-2" />}
            {analyzing ? "VARRENDO PADRÕES..." : "DETECTAR PADRÕES"}
          </Button>
          <div className="mt-3 text-[10px] font-mono text-muted-foreground leading-relaxed">
            Cruza identidade, missões, execuções, OODA, journal, hidratação, ideias e feedback de avaliações.
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

                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[9px] text-muted-foreground tracking-widest mr-1">PRECISÃO</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => rate(i.id, n)} className="hover:scale-110 transition">
                          <Star className={`size-3.5 ${(i.feedback_rating ?? 0) >= n ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`} />
                        </button>
                      ))}
                      <div className="ml-auto flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => markUseful(i.id, true)}
                          className={`h-6 px-2 text-[10px] font-mono ${i.feedback_useful === true ? "text-primary" : "text-muted-foreground"}`}>
                          <ThumbsUp className="size-3 mr-1" /> ÚTIL
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => markUseful(i.id, false)}
                          className={`h-6 px-2 text-[10px] font-mono ${i.feedback_useful === false ? "text-destructive" : "text-muted-foreground"}`}>
                          <ThumbsDown className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModulePage>
  );
}
