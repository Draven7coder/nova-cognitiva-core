import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Brain, Network, Workflow, Cpu, Binary, Layers, FlaskConical, Radio, Lightbulb, Library, ArrowRight, Crown } from "lucide-react";

export const Route = createFileRoute("/app/intelecto")({ component: IntelectoPage });

const AREAS = ["matemática", "física", "programação", "IA", "filosofia", "psicologia", "línguas", "ciência", "estratégia", "arte", "livros", "meta-sistemas"];

const META_SUBSECTIONS = [
  { key: "frameworks-mentais", label: "Frameworks Mentais", icon: Brain, desc: "Modelos reutilizáveis para estruturar pensamento." },
  { key: "modelagem-universal", label: "Modelagem Universal", icon: Layers, desc: "Tradução de qualquer fenômeno em estrutura formal." },
  { key: "pensamento-sistemico", label: "Pensamento Sistêmico", icon: Network, desc: "Relações, ciclos, feedback e emergência." },
  { key: "computacao-cientifica", label: "Computação Científica", icon: Cpu, desc: "Simulação numérica e exploração computacional." },
  { key: "logica-formal", label: "Lógica Formal Aplicada", icon: Binary, desc: "Coerência, prova e validade estrutural." },
  { key: "engenharia-abstracao", label: "Engenharia de Abstração", icon: Workflow, desc: "Construção e refino de camadas conceituais." },
  { key: "simulacao-sistemas", label: "Simulação de Sistemas", icon: FlaskConical, desc: "Execução de modelos em múltiplos cenários." },
  { key: "protocolos-cognitivos", label: "Protocolos Cognitivos", icon: Radio, desc: "Rotinas mentais para raciocínio avançado." },
  { key: "teorias-pessoais", label: "Teorias Pessoais", icon: Lightbulb, desc: "Hipóteses originais e construções autorais." },
  { key: "arquiteturas-conhecimento", label: "Arquiteturas de Conhecimento", icon: Library, desc: "Organização viva e modular do saber." },
];

function IntelectoPage() {
  const { user } = useAuth();
  const [area, setArea] = useState("matemática");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("journal_entries").select("*").eq("module", `intelecto:${area}`).order("created_at", { ascending: false });
    setNotes(data ?? []);
  };
  useEffect(() => { load(); }, [user, area]);

  const save = async () => {
    if (!content.trim()) return;
    await supabase.from("journal_entries").insert({ user_id: user!.id, module: `intelecto:${area}`, title, content });
    setTitle(""); setContent(""); load();
  };

  const isMeta = area === "meta-sistemas";

  return (
    <ModulePage code="// INT 03" title="Centro Intelectual" subtitle="Segundo cérebro · notas, mapas, insights, conexões.">
      <div className="flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <button key={a} onClick={() => setArea(a)}
            className={`font-mono text-[10px] tracking-widest px-3 py-1.5 rounded border transition ${
              area === a ? "border-primary bg-primary/10 text-primary hud-glow" : "border-border/50 text-muted-foreground hover:border-primary/40"
            } ${a === "meta-sistemas" ? "border-primary/40 text-primary/90" : ""}`}>
            {a === "meta-sistemas" ? "🧠 META-SISTEMAS" : a.toUpperCase()}
          </button>
        ))}
      </div>

      <Link to="/app/xadrez" className="block group">
        <div className="hud-panel hud-corner p-5 border border-primary/40 hover:border-primary transition hud-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="size-6 text-primary shrink-0" />
              <div>
                <div className="font-mono text-[10px] tracking-[0.4em] text-primary/80">ESTRATÉGIA COGNITIVA</div>
                <div className="font-display text-xl text-foreground hud-text-glow mt-1">♟️ Xadrez · Pensamento Estratégico</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  Laboratório de cognição profunda · cálculo, padrões, ordens de pensamento, arquitetura de decisão.
                </p>
              </div>
            </div>
            <ArrowRight className="size-5 text-primary group-hover:translate-x-1 transition" />
          </div>
        </div>
      </Link>

      {isMeta ? (
        <>
          <HudCard title="META-SISTEMAS · NÚCLEO DE ENGENHARIA COGNITIVA">
            <p className="text-sm text-foreground/85 leading-relaxed">
              Frameworks universais de pensamento, modelagem computacional, abstração, lógica e engenharia cognitiva.
              Um repositório vivo de <span className="text-primary">estruturas mentais reutilizáveis</span> e
              <span className="text-primary"> protocolos de raciocínio avançado</span> — a oficina onde a realidade vira modelo,
              o modelo vira código, e o código vira generalização transferível.
            </p>
          </HudCard>

          <Link to="/app/fum" className="block group">
            <div className="hud-panel hud-corner p-5 border border-primary/40 hover:border-primary transition hud-glow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.4em] text-primary/80">⚙️ FUM</div>
                  <div className="font-display text-xl text-foreground hud-text-glow mt-1">Framework Universal de Modelagem</div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                    Pipeline de 9 etapas para transformar qualquer conhecimento em sistema executável, testável e simulável.
                  </p>
                </div>
                <ArrowRight className="size-5 text-primary group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">SUBSEÇÕES</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {META_SUBSECTIONS.map((s) => (
                <div key={s.key} className="hud-panel hud-corner p-4 hover:border-primary/40 transition cursor-default">
                  <div className="flex items-start gap-3">
                    <s.icon className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="font-display text-sm text-foreground">{s.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <HudCard title={`NOVA ENTRADA · ${area.toUpperCase()}`}>
            <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input/40 font-mono text-xs mb-2" />
            <Textarea placeholder="Insight, teoria, anotação..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px] bg-input/40 font-mono text-xs" />
            <Button onClick={save} className="mt-2 font-mono text-xs tracking-widest">REGISTRAR</Button>
          </HudCard>
          <div className="grid md:grid-cols-2 gap-3">
            {notes.map((n) => (
              <HudCard key={n.id} title={n.title || "SEM TÍTULO"}>
                <p className="text-xs text-foreground/85 whitespace-pre-wrap font-mono">{n.content}</p>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR")}</div>
              </HudCard>
            ))}
          </div>
        </>
      )}
    </ModulePage>
  );
}
