import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedField } from "@/components/ProtectedField";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Droplet, Plus, Sunrise, Trash2, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/app/hidratacao")({ component: HidratacaoPage });

const DAILY_GOAL_ML = 3000;
const BOTTLE_ML = 300;
const MORNING_ML = 500;

type Log = { id: string; amount_ml: number; consumed_at: string; note: string | null };

const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

function HidratacaoPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [history, setHistory] = useState<Log[]>([]);
  const [custom, setCustom] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Log | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    if (!user) return;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from("hydration_logs")
      .select("*")
      .gte("consumed_at", since)
      .order("consumed_at", { ascending: false });
    const all = (data ?? []) as Log[];
    setHistory(all);
    const s = startOfDay().toISOString();
    setLogs(all.filter((l) => l.consumed_at >= s));
  };
  useEffect(() => { load(); }, [user]);

  const totalToday = logs.reduce((a, b) => a + b.amount_ml, 0);
  const pct = Math.min(100, Math.round((totalToday / DAILY_GOAL_ML) * 100));
  const remaining = Math.max(0, DAILY_GOAL_ML - totalToday);
  const bottlesToday = (totalToday / BOTTLE_ML).toFixed(1);

  const lastConsumeMs = logs[0]?.consumed_at ? new Date(logs[0].consumed_at).getTime() : null;
  const minutesSince = lastConsumeMs ? Math.floor((now - lastConsumeMs) / 60000) : null;
  const dryAlert = minutesSince !== null && minutesSince >= 180;

  const addWater = async (amount: number) => {
    if (!user) return;
    const { error, data } = await supabase.from("hydration_logs")
      .insert({ user_id: user.id, amount_ml: amount })
      .select("*").single();
    if (error) { toast.error(error.message); return; }
    setLogs((p) => [data as Log, ...p]);
    setHistory((p) => [data as Log, ...p]);
    toast.success(`+${amount}ml registrado.`);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await supabase.from("hydration_logs").delete().eq("id", pendingDelete.id);
    setLogs((p) => p.filter((l) => l.id !== pendingDelete.id));
    setHistory((p) => p.filter((l) => l.id !== pendingDelete.id));
    setPendingDelete(null);
    toast.success("Registro removido.");
  };

  // ── Weekly heatmap (últimos 7 dias)
  const weekly = useMemo(() => {
    const days: { date: Date; total: number; pct: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const s = d.toISOString();
      const e = endOfDay(d).toISOString();
      const total = history.filter((l) => l.consumed_at >= s && l.consumed_at <= e).reduce((a,b) => a+b.amount_ml, 0);
      days.push({ date: d, total, pct: Math.min(100, (total / DAILY_GOAL_ML) * 100) });
    }
    return days;
  }, [history]);

  // ── Monthly chart (últimos 30 dias)
  const monthly = useMemo(() => {
    const days: { dia: string; ml: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const s = d.toISOString();
      const e = endOfDay(d).toISOString();
      const total = history.filter((l) => l.consumed_at >= s && l.consumed_at <= e).reduce((a,b) => a+b.amount_ml, 0);
      days.push({ dia: `${d.getDate()}/${d.getMonth()+1}`, ml: total });
    }
    return days;
  }, [history]);

  const dailyAvg = Math.round(monthly.reduce((a,b) => a+b.ml, 0) / Math.max(1, monthly.filter(d => d.ml > 0).length));
  const last7Avg = Math.round(weekly.reduce((a,b) => a+b.total, 0) / 7);
  const prev7Avg = useMemo(() => {
    let total = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const s = d.toISOString();
      const e = endOfDay(d).toISOString();
      total += history.filter((l) => l.consumed_at >= s && l.consumed_at <= e).reduce((a,b) => a+b.amount_ml, 0);
    }
    return Math.round(total / 7);
  }, [history]);
  const trendDelta = last7Avg - prev7Avg;

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const start = d.toISOString();
      const end = endOfDay(d).toISOString();
      const total = history.filter((l) => l.consumed_at >= start && l.consumed_at <= end).reduce((a,b) => a+b.amount_ml, 0);
      if (total >= DAILY_GOAL_ML * 0.8) s++; else break;
    }
    return s;
  }, [history]);

  const heatColor = (p: number) =>
    p >= 100 ? "bg-primary"
    : p >= 75 ? "bg-primary/70"
    : p >= 50 ? "bg-primary/45"
    : p >= 25 ? "bg-primary/25"
    : p > 0   ? "bg-primary/10"
    : "bg-border/30";

  return (
    <ModulePage code="// HYD 11" title="Hidratação Operacional" subtitle="Variável biológica estratégica · combustível cognitivo · monitoramento em tempo real.">
      {dryAlert && (
        <div className="hud-panel hud-corner p-3 border border-yellow-400/40 bg-yellow-400/5 flex items-center gap-3">
          <AlertTriangle className="size-4 text-yellow-400 shrink-0" />
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-widest text-yellow-400">ALERTA · BAIXA HIDRATAÇÃO</div>
            <div className="text-xs text-foreground/85 mt-0.5">
              Você está há {Math.floor(minutesSince!/60)}h{minutesSince!%60 ? ` ${minutesSince!%60}min` : ""} sem hidratação. Sua performance cognitiva pode começar a cair.
            </div>
          </div>
          <Button size="sm" onClick={() => addWater(BOTTLE_ML)} className="font-mono text-[10px] tracking-widest">+{BOTTLE_ML}ml</Button>
        </div>
      )}

      {/* Painel Líquido Principal */}
      <HudCard title="STATUS BIOLÓGICO · CONSUMO DIÁRIO">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl text-primary hud-text-glow">{totalToday}</span>
              <span className="font-mono text-xs text-muted-foreground tracking-widest">/ {DAILY_GOAL_ML} ml</span>
              <span className="font-mono text-xs text-primary tracking-widest ml-auto">{pct}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-input/40 overflow-hidden border border-border/50">
              <div
                className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, oklch(0.7 0.16 210), oklch(0.78 0.18 195), oklch(0.85 0.18 200))",
                  boxShadow: "0 0 20px oklch(0.78 0.18 200 / 0.6)",
                }}
              />
              <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.15) 14px 15px)" }} />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div><div className="font-mono text-[10px] text-muted-foreground tracking-widest">RESTANTE</div><div className="font-display text-lg text-foreground">{remaining}ml</div></div>
              <div><div className="font-mono text-[10px] text-muted-foreground tracking-widest">GARRAFAS</div><div className="font-display text-lg text-foreground">{bottlesToday}</div></div>
              <div><div className="font-mono text-[10px] text-muted-foreground tracking-widest">REGISTROS</div><div className="font-display text-lg text-foreground">{logs.length}</div></div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="size-28 rounded-full border-2 border-primary/40 hud-glow flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 transition-all duration-700"
                style={{
                  background: `linear-gradient(0deg, oklch(0.78 0.18 200 / 0.5) ${pct}%, transparent ${pct}%)`,
                }} />
              <Droplet className="size-10 text-primary relative z-10" />
            </div>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground mt-2">FLUXO</div>
          </div>
        </div>
      </HudCard>

      {/* Quick Actions */}
      <HudCard title="REGISTRO RÁPIDO">
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={() => addWater(BOTTLE_ML)} className="font-mono text-xs tracking-widest hud-glow">
            <Plus className="size-3 mr-1" /> +{BOTTLE_ML}ml · GARRAFA
          </Button>
          <Button onClick={() => addWater(MORNING_ML)} variant="outline" className="font-mono text-xs tracking-widest border-primary/40">
            <Sunrise className="size-3 mr-1" /> +{MORNING_ML}ml · DESPERTAR
          </Button>
          <Button onClick={() => addWater(150)} variant="outline" className="font-mono text-xs tracking-widest">+150ml</Button>
          <Button onClick={() => addWater(1000)} variant="outline" className="font-mono text-xs tracking-widest">+1L</Button>
          <div className="flex items-center gap-1 ml-auto">
            <Input
              type="number" placeholder="ml" value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-24 bg-input/40 font-mono text-xs"
              onKeyDown={(e) => { if (e.key === "Enter" && +custom > 0) { addWater(+custom); setCustom(""); } }}
            />
            <Button
              size="sm" variant="ghost"
              onClick={() => { if (+custom > 0) { addWater(+custom); setCustom(""); } }}
              className="font-mono text-[10px] tracking-widest"
            >
              REGISTRAR
            </Button>
          </div>
        </div>
      </HudCard>

      {/* KPIs cognitivos */}
      <div className="grid sm:grid-cols-3 gap-4">
        <HudCard title="STREAK · CONSISTÊNCIA">
          <div className="flex items-center gap-3">
            <Activity className="size-6 text-primary" />
            <div>
              <div className="font-display text-3xl text-primary hud-text-glow">{streak}</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest">DIAS ≥80% DA META</div>
            </div>
          </div>
        </HudCard>
        <HudCard title="MÉDIA · 7 DIAS">
          <div className="font-display text-3xl text-foreground">{last7Avg}<span className="text-sm text-muted-foreground"> ml</span></div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-widest mt-1">vs {prev7Avg}ml semana anterior</div>
        </HudCard>
        <HudCard title="TENDÊNCIA">
          <div className={`flex items-center gap-2 font-display text-2xl ${trendDelta >= 0 ? "text-primary" : "text-yellow-400"}`}>
            <TrendingUp className={`size-5 ${trendDelta < 0 ? "rotate-180" : ""}`} />
            {trendDelta >= 0 ? "+" : ""}{trendDelta} ml
          </div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-widest mt-1">DELTA SEMANAL</div>
        </HudCard>
      </div>

      {/* Heatmap semanal */}
      <HudCard title="HEATMAP · ÚLTIMOS 7 DIAS">
        <div className="grid grid-cols-7 gap-2">
          {weekly.map((d, i) => (
            <div key={i} className="space-y-1">
              <div className={`h-16 rounded ${heatColor(d.pct)} border border-border/40 transition`} />
              <div className="font-mono text-[9px] text-muted-foreground text-center tracking-widest">
                {d.date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0,3).toUpperCase()}
              </div>
              <div className="font-mono text-[9px] text-primary text-center">{d.total}</div>
            </div>
          ))}
        </div>
      </HudCard>

      {/* Gráfico mensal */}
      <HudCard title="EVOLUÇÃO · 30 DIAS">
        <div className="h-[200px]">
          <ResponsiveContainer>
            <LineChart data={monthly}>
              <XAxis dataKey="dia" tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 9 }} />
              <YAxis tick={{ fill: "oklch(0.65 0.04 215)", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.03 235)", border: "1px solid oklch(0.78 0.18 210 / 0.4)" }} />
              <Line type="monotone" dataKey="ml" stroke="oklch(0.78 0.18 200)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest mt-2">MÉDIA OPERACIONAL: {dailyAvg}ml/dia</div>
      </HudCard>

      {/* Timeline do dia */}
      <HudCard title="TIMELINE · CONSUMO DE HOJE">
        {logs.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum registro hoje. Inicie o protocolo de hidratação.</div>
        ) : (
          <ul className="space-y-1.5">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center gap-3 p-2 border border-border/30 rounded hover:border-primary/40 transition">
                <Droplet className="size-3.5 text-primary" />
                <span className="font-mono text-xs text-foreground">+{l.amount_ml}ml</span>
                <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                  {new Date(l.consumed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <Button size="icon" variant="ghost" onClick={() => setPendingDelete(l)} className="size-7">
                  <Trash2 className="size-3 text-destructive/70" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </HudCard>

      {/* Correlação cognitiva */}
      <HudCard title="🧬 CORRELAÇÃO COGNITIVA · INSIGHTS BIOLÓGICOS">
        <ul className="space-y-2 text-xs text-foreground/85">
          <li className="flex gap-2"><span className="text-primary font-mono">›</span> Seu foco aumenta significativamente em dias com hidratação consistente acima de 80% da meta.</li>
          <li className="flex gap-2"><span className="text-primary font-mono">›</span> Períodos &gt; 3h sem consumo correlacionam com queda de execução e clareza mental.</li>
          <li className="flex gap-2"><span className="text-primary font-mono">›</span> Streaks de hidratação ≥ 7 dias amplificam estabilidade emocional e produtividade sustentada.</li>
          <li className="flex gap-2"><span className="text-primary font-mono">›</span> O protocolo "+500ml ao despertar" antecipa picos cognitivos no primeiro bloco profundo do dia.</li>
        </ul>
      </HudCard>

      {/* Observações estratégicas (versionadas) */}
      <HudCard title="OBSERVAÇÕES ESTRATÉGICAS">
        <ProtectedField module="hidratacao" fieldKey="observacoes" placeholder="Padrões corporais, gatilhos de queda, ajustes de protocolo..." minHeight={100} />
      </HudCard>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display tracking-wider">⚠️ Confirmação Crítica</AlertDialogTitle>
            <AlertDialogDescription>
              Remover o registro de {pendingDelete?.amount_ml}ml de {pendingDelete && new Date(pendingDelete.consumed_at).toLocaleTimeString("pt-BR")}? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs tracking-widest">CANCELAR</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="font-mono text-xs tracking-widest">REMOVER</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModulePage>
  );
}
