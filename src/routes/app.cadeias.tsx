import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Pause, Play, Archive, Trash2, ArrowRight, Link2 } from "lucide-react";
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

function nextChainCode(existing: any[]): string {
  const max = existing.reduce((acc, c) => {
    const n = parseInt(c.code, 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return String(max + 1).padStart(3, "0");
}
function nextSubtaskCode(subs: any[], chainCode: string): string {
  const base = parseInt(chainCode, 10) || 1;
  const max = subs.reduce((acc, s) => {
    const m = /^\d+\.(\d+)$/.exec(s.code);
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  return `${base}.${max + 1}`;
}

function CadeiasPage() {
  const { user } = useAuth();
  const [chains, setChains] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [primaryModule, setPrimaryModule] = useState<string>("intelecto");
  const [priority, setPriority] = useState(50);
  const [openChain, setOpenChain] = useState<string | null>(null);

  // subtask form
  const [subTitle, setSubTitle] = useState("");
  const [subModule, setSubModule] = useState("intelecto");

  const load = async () => {
    const [{ data: c }, { data: s }] = await Promise.all([
      (supabase as any).from("operational_chains").select("*").order("priority", { ascending: false }).order("created_at", { ascending: false }),
      (supabase as any).from("chain_subtasks").select("*").order("order_index", { ascending: true }),
    ]);
    setChains(c ?? []);
    setSubs(s ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const createChain = async () => {
    if (!title.trim()) return;
    const code = nextChainCode(chains);
    const { error } = await (supabase as any).from("operational_chains").insert({
      user_id: user!.id, code, title, description, primary_module: primaryModule, priority,
    });
    if (error) toast.error(error.message);
    else { setTitle(""); setDescription(""); toast.success(`Cadeia ${code} criada.`); load(); }
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

  const addSubtask = async (chain: any) => {
    if (!subTitle.trim()) return;
    const chainSubs = subs.filter((s) => s.chain_id === chain.id);
    const code = nextSubtaskCode(chainSubs, chain.code);
    const { error } = await (supabase as any).from("chain_subtasks").insert({
      user_id: user!.id, chain_id: chain.id, code, title: subTitle, module: subModule, order_index: chainSubs.length,
    });
    if (error) toast.error(error.message);
    else { setSubTitle(""); toast.success(`Subtarefa ${code} adicionada.`); load(); }
  };
  const completeSub = async (s: any) => {
    await (supabase as any).from("chain_subtasks").update({
      status: "done", completed_at: new Date().toISOString(),
    }).eq("id", s.id);
    // Auto-complete chain if all done
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
  const delSub = async (id: string) => {
    await (supabase as any).from("chain_subtasks").delete().eq("id", id); load();
  };

  const active = chains.filter((c) => c.status === "ativa");
  const paused = chains.filter((c) => c.status === "pausada" || c.status === "aguardando");
  const archived = chains.filter((c) => c.status === "arquivada" || c.status === "concluida");

  return (
    <ModulePage code="// CHN 11" title="Cadeias Operacionais" subtitle="Sistema nervoso central · agrupa missões em sequências executáveis · JARVIS prioriza · operador executa.">
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">COORDENAÇÃO ATIVA</span>
        <span>· cada cadeia é uma missão completa · subtarefas distribuídas entre módulos.</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <HudCard title="ATIVAS"><div className="font-display text-5xl text-primary hud-text-glow">{active.length}</div></HudCard>
        <HudCard title="EM ESPERA"><div className="font-display text-5xl text-amber-400 hud-text-glow">{paused.length}</div></HudCard>
        <HudCard title="ARQUIVADAS"><div className="font-display text-5xl text-emerald-400 hud-text-glow">{archived.length}</div></HudCard>
      </div>

      <HudCard title="NOVA CADEIA OPERACIONAL">
        <div className="space-y-2">
          <Input placeholder="Título da cadeia (ex: Consolidação Intelectual)" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input/40 font-mono text-xs" />
          <Textarea placeholder="Descrição estratégica (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="bg-input/40 font-mono text-xs" />
          <div className="flex gap-2 flex-wrap">
            <Select value={primaryModule} onValueChange={setPrimaryModule}>
              <SelectTrigger className="w-56 bg-input/40 font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{MODULES.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" min={0} max={100} value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 0)} className="w-24 bg-input/40 font-mono text-xs" placeholder="Prio" />
            <Button onClick={createChain} className="font-mono text-xs tracking-widest"><Plus className="size-3 mr-1" />REGISTRAR</Button>
          </div>
        </div>
      </HudCard>

      <HudCard title="CADEIAS ATIVAS">
        {active.length === 0 ? <div className="text-sm text-muted-foreground">Nenhuma cadeia ativa.</div> : (
          <ul className="space-y-3">
            {active.map((c) => {
              const chainSubs = subs.filter((s) => s.chain_id === c.id).sort((a, b) => a.order_index - b.order_index);
              const done = chainSubs.filter((s) => s.status === "done").length;
              const total = chainSubs.length;
              const next = chainSubs.find((s) => s.status !== "done");
              const isOpen = openChain === c.id;
              const mod = MODULES.find((m) => m.key === c.primary_module);
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
                      <Button size="icon" variant="ghost" title="Pausar" onClick={() => updateChainStatus(c.id, "pausada")}><Pause className="size-4 text-amber-400" /></Button>
                      <Button size="icon" variant="ghost" title="Arquivar" onClick={() => updateChainStatus(c.id, "arquivada")}><Archive className="size-4 text-muted-foreground" /></Button>
                      <Button size="icon" variant="ghost" title="Excluir" onClick={() => delChain(c.id)}><Trash2 className="size-4 text-destructive" /></Button>
                      <Button size="sm" variant="outline" className="font-mono text-[10px]" onClick={() => setOpenChain(isOpen ? null : c.id)}>
                        {isOpen ? "FECHAR" : "ABRIR"}
                      </Button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-muted/40 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary hud-glow transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-2">
                      {chainSubs.length === 0 && <div className="text-xs text-muted-foreground font-mono">Sem subtarefas. Adicione abaixo.</div>}
                      <ul className="space-y-1">
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
                              <Button size="icon" variant="ghost" onClick={() => delSub(s.id)}>
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="flex gap-2 pt-2 border-t border-border/30">
                        <Input placeholder="Nova subtarefa..." value={subTitle} onChange={(e) => setSubTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSubtask(c)} className="flex-1 bg-input/40 font-mono text-xs" />
                        <Select value={subModule} onValueChange={setSubModule}>
                          <SelectTrigger className="w-48 bg-input/40 font-mono text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{MODULES.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button onClick={() => addSubtask(c)} size="sm" className="font-mono text-[10px]"><Plus className="size-3 mr-1" />ADD</Button>
                      </div>
                    </div>
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
