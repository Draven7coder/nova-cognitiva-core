import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronRight, Atom, Scale, Sigma, Binary, Code2, PlayCircle,
  FlaskConical, GitBranch, Infinity as InfinityIcon, ArrowLeft, Brain,
  Plus, Archive, CheckCircle2, FileText,
} from "lucide-react";

export const Route = createFileRoute("/app/fum")({
  component: FumPage,
  head: () => ({
    meta: [
      { title: "FUM · Framework Universal de Modelagem — Núcleo Supremo" },
      { name: "description", content: "Metassistemas registrados como entidade — cada ritual/framework tem identidade própria, endereço e histórico." },
    ],
  }),
});

const STAGES = [
  { n: "01", icon: Atom, title: "Objeto Real", question: "O que existe no mundo real ou abstrato que quero simular?" },
  { n: "02", icon: Scale, title: "Regras Fundamentais", question: "Quais regras sempre precisam permanecer verdadeiras?" },
  { n: "03", icon: Sigma, title: "Modelo Matemático", question: "Como expresso isso em variáveis, estados e equações?" },
  { n: "04", icon: Binary, title: "Lógica Formal", question: "Quais condições, transições e validações garantem coerência?" },
  { n: "05", icon: Code2, title: "Código", question: "Como traduzir o modelo em estruturas executáveis?" },
  { n: "06", icon: PlayCircle, title: "Simulação", question: "Como o sistema se comporta sob diferentes cenários?" },
  { n: "07", icon: FlaskConical, title: "Experimento", question: "O que muda quando perturbo o sistema?" },
  { n: "08", icon: GitBranch, title: "Extração de Padrões", question: "Que regularidades, falhas e surpresas aparecem?" },
  { n: "09", icon: InfinityIcon, title: "Generalização", question: "O que disso é reutilizável universalmente?" },
] as const;

type Metasystem = {
  id: string;
  user_id: string;
  title: string;
  problem_tag: string | null;
  source_chain_id: string | null;
  source_subtask_id: string | null;
  status: string;
  stages: Record<string, string>;
  created_at: string;
  updated_at: string;
};

function FumPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Metasystem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState<string>("01");
  const [draft, setDraft] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("");
  const sb: any = supabase;

  const active = list.find((m) => m.id === activeId) ?? null;

  const load = async () => {
    const { data } = await sb.from("metasystems")
      .select("*").order("updated_at", { ascending: false });
    const items: Metasystem[] = (data ?? []).map((m: any) => ({
      ...m, stages: m.stages ?? {},
    }));
    setList(items);
  };
  useEffect(() => { if (user) load(); }, [user]);

  useEffect(() => {
    setDraft(active?.stages?.[open] ?? "");
  }, [activeId, open, active?.stages]);

  const createMetasystem = async () => {
    if (!user || !newTitle.trim()) return;
    const { data, error } = await sb.from("metasystems").insert({
      user_id: user.id,
      title: newTitle.trim(),
      problem_tag: newTag.trim() || null,
      status: "em_andamento",
      stages: {},
    }).select().single();
    if (error) { toast.error("Falha ao criar metassistema"); return; }
    setCreating(false); setNewTitle(""); setNewTag("");
    await load();
    setActiveId(data.id); setOpen("01");
    toast.success("Metassistema criado.");
  };

  const saveStage = async () => {
    if (!active) return;
    const newStages = { ...active.stages, [open]: draft };
    const { error } = await sb.from("metasystems")
      .update({ stages: newStages, updated_at: new Date().toISOString() })
      .eq("id", active.id);
    if (error) { toast.error("Falha ao salvar etapa"); return; }
    // Mirror on journal_entries so chain-sync / analyses still see the activity.
    if (draft.trim() && user) {
      await sb.from("journal_entries").insert({
        user_id: user.id,
        module: `fum:${open}`,
        title: `${open} · ${STAGES.find((s) => s.n === open)?.title ?? ""}`,
        content: draft.trim(),
      });
    }
    await load();
    toast.success(`Etapa ${open} salva.`);
  };

  const setStatus = async (status: string) => {
    if (!active) return;
    await sb.from("metasystems").update({ status }).eq("id", active.id);
    load();
  };

  const stagesDone = (m: Metasystem) => Object.values(m.stages ?? {}).filter((v) => (v ?? "").toString().trim().length > 0).length;

  return (
    <ModulePage
      code="// META-SISTEMAS · FUM"
      title="Framework Universal de Modelagem"
      subtitle="Metassistemas com identidade — cada ritual/framework tem endereço, status e histórico."
    >
      <Link to="/app/intelecto" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="size-3" /> VOLTAR · CENTRO INTELECTUAL
      </Link>

      {/* Lista de metassistemas */}
      <HudCard title="MEUS METASSISTEMAS">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-muted-foreground font-mono">
            {list.length} registrado{list.length === 1 ? "" : "s"} · clique para abrir
          </div>
          <Button size="sm" onClick={() => setCreating(true)} className="font-mono text-[10px] tracking-widest">
            <Plus className="size-3 mr-1" /> NOVO METASSISTEMA
          </Button>
        </div>

        {creating && (
          <div className="mb-4 border border-primary/40 rounded p-3 space-y-2 bg-primary/5">
            <Input
              placeholder="Título · ex.: Loop de procrastinação matinal"
              value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="bg-input/40 font-mono text-xs"
            />
            <Input
              placeholder="Tag do problema · opcional"
              value={newTag} onChange={(e) => setNewTag(e.target.value)}
              className="bg-input/40 font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={createMetasystem} className="font-mono text-[10px] tracking-widest">CRIAR</Button>
              <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="font-mono text-[10px] tracking-widest">CANCELAR</Button>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div className="text-xs text-muted-foreground font-mono">Nenhum metassistema ainda. Crie o primeiro para começar.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {list.map((m) => {
              const isActive = activeId === m.id;
              const done = stagesDone(m);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  className={`text-left border rounded p-3 transition ${
                    isActive ? "border-primary bg-primary/10 hud-glow" : "border-border/50 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display text-sm text-foreground truncate">{m.title}</div>
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0">
                      {m.status === "em_andamento" ? "ATIVO" : m.status === "concluido" ? "OK" : "ARQ"}
                    </Badge>
                  </div>
                  {m.problem_tag && <div className="text-[10px] font-mono text-primary/70 mt-0.5">#{m.problem_tag}</div>}
                  <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {done}/9 etapas · {new Date(m.updated_at).toLocaleDateString("pt-BR")}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </HudCard>

      {/* Editor do metassistema ativo */}
      {active && (
        <>
          <HudCard title={`METASSISTEMA · ${active.title.toUpperCase()}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-muted-foreground font-mono">
                Criado em {new Date(active.created_at).toLocaleString("pt-BR")}
                {active.source_chain_id && <> · origem: cadeia operacional</>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setStatus("concluido")} className="font-mono text-[10px] tracking-widest">
                  <CheckCircle2 className="size-3 mr-1" /> CONCLUIR
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus("arquivado")} className="font-mono text-[10px] tracking-widest">
                  <Archive className="size-3 mr-1" /> ARQUIVAR
                </Button>
              </div>
            </div>
          </HudCard>

          <HudCard title="PIPELINE · 9 ETAPAS">
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {STAGES.map((s, i) => {
                const filled = ((active.stages?.[s.n] ?? "").trim().length > 0);
                return (
                  <div key={s.n} className="flex items-center shrink-0">
                    <button
                      onClick={() => setOpen(s.n)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded border transition min-w-[88px] ${
                        open === s.n ? "border-primary bg-primary/10 hud-glow"
                          : filled ? "border-primary/40 bg-primary/5"
                          : "border-border/50 hover:border-primary/40"
                      }`}
                    >
                      <s.icon className={`size-4 ${open === s.n ? "text-primary" : filled ? "text-primary/80" : "text-muted-foreground"}`} />
                      <div className="font-mono text-[9px] tracking-widest text-primary/80">{s.n}</div>
                      <div className="font-mono text-[10px] text-foreground/90 leading-tight text-center">{s.title}</div>
                    </button>
                    {i < STAGES.length - 1 && <ChevronRight className="size-3 text-primary/40 mx-0.5 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </HudCard>

          {STAGES.filter((s) => s.n === open).map((s) => (
            <HudCard key={s.n} title={`ETAPA ${s.n} · ${s.title.toUpperCase()}`}>
              <div className="space-y-2">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">PERGUNTA CENTRAL</div>
                  <p className="text-sm text-primary italic">"{s.question}"</p>
                </div>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Registre sua resposta / notas / experimentos para esta etapa..."
                  className="min-h-[160px] bg-input/40 font-mono text-xs"
                />
                <Button onClick={saveStage} className="font-mono text-[10px] tracking-widest">
                  <FileText className="size-3 mr-1" /> SALVAR ETAPA {s.n}
                </Button>
              </div>
            </HudCard>
          ))}
        </>
      )}

      <HudCard title="INTEGRAÇÃO COM IA">
        <div className="flex items-start gap-3">
          <Brain className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-foreground/85">
            <p>
              Cada metassistema é uma entidade indexada. O JARVIS pode referenciá-los por título/tag,
              conectá-los a cadeias operacionais e sugerir revisão quando o mesmo problema reaparece —
              em vez de pedir para você começar do zero.
            </p>
          </div>
        </div>
      </HudCard>
    </ModulePage>
  );
}
