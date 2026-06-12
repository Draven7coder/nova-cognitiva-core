import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Pause, Play, Archive, Trash2, Link2, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/cadeias")({ component: CadeiasPage });

const MODULES = [
  { key: "identidade", label: "Identidade", path: "/app/identidade" },
  { key: "proposito", label: "Propósito Supremo", path: "/app/proposito" },
  { key: "intelecto", label: "Centro Intelectual", path: "/app/intelecto" },
  { key: "laboratorio", label: "Laboratório Estratégico", path: "/app/laboratorio" },
  { key: "manual", label: "Manual Operacional", path: "/app/manual" },
  { key: "protocolos", label: "Protocolos", path: "/app/protocolos" },
  { key: "performance", label: "Performance", path: "/app/performance" },
  { key: "hidratacao", label: "Hidratação", path: "/app/hidratacao" },
  { key: "missoes", label: "Missões", path: "/app/missoes" },
  { key: "ideias", label: "Banco de Ideias", path: "/app/ideias" },
  { key: "sombra", label: "Sombra", path: "/app/sombra" },
  { key: "evolucao", label: "Evolução", path: "/app/evolucao" },
  { key: "ooda", label: "Loop OODA", path: "/app/ooda" },
  { key: "jarvis", label: "JARVIS", path: "/app/jarvis" },
  { key: "insights", label: "Insights", path: "/app/insights" },
  { key: "relatorios", label: "Relatórios", path: "/app/relatorios" },
];

const STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa", pausada: "Pausada", aguardando: "Aguardando",
  arquivada: "Arquivada", concluida: "Concluída",
};
const STATUS_CLS: Record<string, string> = {
  ativa: "text-primary border-primary/50",
  pausada: "text-amber-400 border-amber-400/50",
  aguardando: "text-cyan-300 border-cyan-300/50",
  arquivada: "text-muted-foreground border-border",
  concluida: "text-emerald-400 border-emerald-400/50",
};

function nextChainCode(existing: any[]): number {
  return existing.reduce((acc, c) => {
    const n = parseInt(c.code, 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
}

function CadeiasPage() {
  const { user } = useAuth();
  const [chains, setChains] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [openChain, setOpenChain] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const [{ data: c }, { data: s }] = await Promise.all([
      (supabase as any).from("operational_chains").select("*").order("priority", { ascending: false }).order("created_at", { ascending: false }),
      (supabase as any).from("chain_subtasks").select("*").order("order_index", { ascending: true }),
    ]);
    setChains(c ?? []);
    setSubs(s ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const generateChains = async () => {
    setGenerating(true);
    try {
      const [
        { data: ident }, { data: prop }, { data: miss },
        { data: comps }, { data: journal }, { data: ooda }, { data: ideias }, { data: existing },
      ] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("supreme_purpose").select("*").maybeSingle(),
        supabase.from("missions").select("title,status,type,xp,recurrence,created_at").limit(50),
        supabase.from("mission_completions").select("mission_id,completed_at").order("completed_at", { ascending: false }).limit(50),
        supabase.from("journal_entries").select("title,content,module,created_at").order("created_at", { ascending: false }).limit(30),
        supabase.from("ooda_entries").select("tag,observe,orient,decide,act,created_at").order("created_at", { ascending: false }).limit(15),
        supabase.from("ideas").select("title,content,created_at").order("created_at", { ascending: false }).limit(20),
        (supabase as any).from("operational_chains").select("code,title,status").limit(50),
      ]);

      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "chains",
          context: {
            identity: ident, purpose: prop, missions: miss, completions: comps,
            journal, ooda, ideias, existing_chains: existing,
            available_modules: MODULES.map((m) => ({ key: m.key, label: m.label })),
            now: new Date().toISOString(),
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);

      const parsed = (data as any).chains;
      if (!parsed?.chains?.length) {
        toast.error("JARVIS não detectou cadeias suficientes nos dados atuais.");
        return;
      }

      let codeCounter = nextChainCode(chains);
      const moduleKeys = new Set(MODULES.map((m) => m.key));
      for (const c of parsed.chains.slice(0, 6)) {
        codeCounter += 1;
        const codeStr = String(codeCounter).padStart(3, "0");
        const primary = moduleKeys.has(c.primary_module) ? c.primary_module : "intelecto";
        const { data: ins, error: ei } = await (supabase as any).from("operational_chains").insert({
          user_id: user!.id,
          code: codeStr,
          title: String(c.title ?? "Cadeia").slice(0, 120),
          description: c.description ?? null,
          primary_module: primary,
          priority: Math.max(0, Math.min(100, Number(c.priority) || 50)),
        }).select().single();
        if (ei || !ins) continue;

        const subtasks = (c.subtasks ?? []).slice(0, 8);
        const rows = subtasks.map((s: any, idx: number) => ({
          user_id: user!.id,
          chain_id: ins.id,
          code: `${codeCounter}.${idx + 1}`,
          title: String(s.title ?? "Subtarefa").slice(0, 160),
          module: moduleKeys.has(s.module) ? s.module : primary,
          order_index: idx,
        }));
        if (rows.length) await (supabase as any).from("chain_subtasks").insert(rows);
      }

      toast.success(`JARVIS gerou ${parsed.chains.length} cadeia(s).`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Falha na geração JARVIS");
    } finally { setGenerating(false); }
  };

  const updateChainStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "arquivada") patch.archived_at = new Date().toISOString();
    if (status === "concluida") patch.completed_at = new Date().toISOString();
    await (supabase as any).from("operational_chains").update(patch).eq("id", id);
    load();
  };
  const delChain = async (id: string) => {
    if (!confirm("Excluir cadeia e todas as subtarefas?")) return;
    await (supabase as any).from("operational_chains").delete().eq("id", id); load();
  };
  const completeSub = async (s: any) => {
    await (supabase as any).from("chain_subtasks").update({
      status: "done", completed_at: new Date().toISOString(),
    }).eq("id", s.id);
    const chainSubs = subs.filter((x) => x.chain_id === s.chain_id);
    const remaining = chainSubs.filter((x) => x.id !== s.id && x.status !== "done").length;
    if (remaining === 0) {
      await (supabase as any).from("operational_chains").update({
        status: "concluida", completed_at: new Date().toISOString(),
      }).eq("id", s.chain_id);
      toast.success("Cadeia concluída · arquivada automaticamente.");
    } else toast.success("Subtarefa concluída.");
    load();
  };

  const active = chains.filter((c) => c.status === "ativa");
  const paused = chains.filter((c) => c.status === "pausada" || c.status === "aguardando");
  const archived = chains.filter((c) => c.status === "arquivada" || c.status === "concluida");

  return (
    <ModulePage code="// CHN 11" title="Cadeias Operacionais" subtitle="Sistema nervoso central · cadeias geradas e priorizadas automaticamente pelo JARVIS a partir do seu comportamento no sistema.">
      <HudCard title="🤖 COORDENAÇÃO JARVIS">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="font-display text-sm text-foreground">JARVIS coordena suas cadeias.</div>
            <div className="text-xs text-muted-foreground font-mono mt-1 leading-relaxed">
              Você não define títulos, módulos ou XP — o sistema lê suas missões, journal, OODA, propósito e ideias, e organiza cadeias executáveis com subtarefas distribuídas entre os módulos certos.
            </div>
          </div>
          <Button onClick={generateChains} disabled={generating} className="font-mono text-xs tracking-widest">
            {generating ? <RefreshCw className="size-3 mr-2 animate-spin" /> : <Sparkles className="size-3 mr-2" />}
            {generating ? "GERANDO..." : "GERAR CADEIAS · JARVIS"}
          </Button>
        </div>
      </HudCard>

      <div className="grid md:grid-cols-3 gap-4">
        <HudCard title="ATIVAS"><div className="font-display text-5xl text-primary hud-text-glow">{active.length}</div></HudCard>
        <HudCard title="EM ESPERA"><div className="font-display text-5xl text-amber-400 hud-text-glow">{paused.length}</div></HudCard>
        <HudCard title="ARQUIVADAS"><div className="font-display text-5xl text-emerald-400 hud-text-glow">{archived.length}</div></HudCard>
      </div>

      <HudCard title="CADEIAS ATIVAS">
        {active.length === 0 ? (
          <div className="text-sm text-muted-foreground font-mono">
            Nenhuma cadeia ativa. Execute <span className="text-primary">GERAR CADEIAS · JARVIS</span> acima.
          </div>
        ) : (
          <ul className="space-y-3">
            {active.map((c) => {
              const chainSubs = subs.filter((s) => s.chain_id === c.id).sort((a, b) => a.order_index - b.order_index);
              const done = chainSubs.filter((s) => s.status === "done").length;
              const total = chainSubs.length;
              const next = chainSubs.find((s) => s.status !== "done");
              const isOpen = openChain === c.id;
              const mod = MODULES.find((m) => m.key === c.primary_module);
              const nextMod = MODULES.find((m) => m.key === next?.module);
              return (
                <li key={c.id} className="hud-panel p-3 border-l-2 border-primary/60">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="font-mono text-xs text-primary tracking-widest shrink-0">CADEIA {c.code}</div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-display text-sm text-foreground">{c.title}</div>
                      {c.description && <div className="text-xs text-muted-foreground mt-0.5">{c.description}</div>}
                      <div className="font-mono text-[10px] text-muted-foreground mt-1">
                        progresso {done}/{total || 0} · prio {c.priority} · mód: {mod?.label ?? "—"}
                        {next && <> · próx: <span className="text-primary">{next.code}</span></>}
                      </div>
                    </div>
                    <Badge variant="outline" className={`font-mono text-[10px] ${STATUS_CLS[c.status]}`}>{STATUS_LABEL[c.status]}</Badge>
                    <div className="flex gap-1">
                      {next && nextMod && (
                        <Link to={nextMod.path}>
                          <Button size="sm" className="font-mono text-[10px] tracking-widest h-7">
                            IR <ArrowRight className="size-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                      <Button size="icon" variant="ghost" title="Pausar" onClick={() => updateChainStatus(c.id, "pausada")}><Pause className="size-4 text-amber-400" /></Button>
                      <Button size="icon" variant="ghost" title="Arquivar" onClick={() => updateChainStatus(c.id, "arquivada")}><Archive className="size-4 text-muted-foreground" /></Button>
                      <Button size="icon" variant="ghost" title="Excluir" onClick={() => delChain(c.id)}><Trash2 className="size-4 text-destructive" /></Button>
                      <Button size="sm" variant="outline" className="font-mono text-[10px]" onClick={() => setOpenChain(isOpen ? null : c.id)}>
                        {isOpen ? "FECHAR" : "ABRIR"}
                      </Button>
                    </div>
                  </div>
                  <div className="h-1 bg-muted/40 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary hud-glow transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                  </div>

                  {isOpen && (
                    <ul className="mt-3 space-y-1">
                      {chainSubs.map((s) => {
                        const isNext = next?.id === s.id;
                        const sMod = MODULES.find((m) => m.key === s.module);
                        return (
                          <li key={s.id} className={`flex items-center gap-2 p-2 rounded border transition ${
                            s.status === "done" ? "border-emerald-400/30 opacity-60"
                            : isNext ? "border-primary/70 hud-glow animate-pulse-ring"
                            : "border-border/40"}`}>
                            <span className={`font-mono text-[10px] tracking-widest shrink-0 ${isNext ? "text-primary" : "text-muted-foreground"}`}>{s.code}</span>
                            <span className="flex-1 text-sm">{s.title}</span>
                            {sMod && (
                              <Link to={sMod.path} className="font-mono text-[10px] text-primary hover:underline flex items-center gap-1">
                                <Link2 className="size-3" />{sMod.label}
                              </Link>
                            )}
                            <Button size="icon" variant="ghost" disabled={s.status === "done"} onClick={() => completeSub(s)}>
                              <Check className={`size-4 ${s.status === "done" ? "text-emerald-400" : "text-primary"}`} />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </HudCard>

      {paused.length > 0 && (
        <HudCard title="PAUSADAS · AGUARDANDO">
          <ul className="space-y-2">
            {paused.map((c) => (
              <li key={c.id} className="flex items-center gap-3 p-2 border border-border/40 rounded">
                <div className="font-mono text-xs text-amber-400">CADEIA {c.code}</div>
                <div className="flex-1 text-sm">{c.title}</div>
                <Badge variant="outline" className={`font-mono text-[10px] ${STATUS_CLS[c.status]}`}>{STATUS_LABEL[c.status]}</Badge>
                <Button size="sm" variant="ghost" onClick={() => updateChainStatus(c.id, "ativa")}><Play className="size-4 text-primary" /></Button>
              </li>
            ))}
          </ul>
        </HudCard>
      )}

      {archived.length > 0 && (
        <HudCard title="ARQUIVO">
          <ul className="space-y-1 text-sm text-muted-foreground">
            {archived.slice(0, 20).map((c) => (
              <li key={c.id} className="flex justify-between font-mono text-xs py-1 border-b border-border/30">
                <span>{c.status === "concluida" ? "✓" : "▢"} CADEIA {c.code} · {c.title}</span>
                <span className="text-primary">{STATUS_LABEL[c.status]}</span>
              </li>
            ))}
          </ul>
        </HudCard>
      )}
    </ModulePage>
  );
}
