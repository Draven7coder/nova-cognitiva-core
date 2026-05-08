import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Atom, Scale, Sigma, Binary, Code2, PlayCircle,
  FlaskConical, GitBranch, Infinity as InfinityIcon, ArrowLeft, Brain,
} from "lucide-react";

export const Route = createFileRoute("/app/fum")({
  component: FumPage,
  head: () => ({
    meta: [
      { title: "FUM · Framework Universal de Modelagem — Núcleo Supremo" },
      { name: "description", content: "Pipeline universal para transformar conhecimento em sistemas executáveis e simuláveis." },
    ],
  }),
});

const STAGES = [
  {
    n: "01", icon: Atom, title: "Objeto Real",
    question: "O que existe no mundo real ou abstrato que quero simular?",
    desc: "Definir o fenômeno, conceito ou sistema que será modelado. Recortar o domínio.",
    examples: ["Movimento de um pêndulo", "Decisão de um agente sob incerteza", "Propagação de uma ideia em rede"],
    aplic: ["Física", "IA / Cognição", "Sociologia computacional"],
  },
  {
    n: "02", icon: Scale, title: "Regras Fundamentais",
    question: "Quais regras sempre precisam permanecer verdadeiras?",
    desc: "Extrair leis, invariantes, axiomas e relações que não mudam com o cenário.",
    examples: ["Conservação de energia", "Soma de probabilidades = 1", "Transitividade da preferência"],
    aplic: ["Física", "Probabilidade", "Teoria da decisão"],
  },
  {
    n: "03", icon: Sigma, title: "Modelo Matemático",
    question: "Como expresso isso em variáveis, estados e equações?",
    desc: "Converter o sistema em variáveis, funções, estados, equações e relações formais.",
    examples: ["EDO do oscilador harmônico", "Cadeia de Markov", "Função de utilidade esperada"],
    aplic: ["Matemática aplicada", "Engenharia", "Economia"],
  },
  {
    n: "04", icon: Binary, title: "Lógica Formal",
    question: "Quais condições, transições e validações garantem coerência?",
    desc: "Definir condições, coerência, transições, regras de validação e consistência lógica.",
    examples: ["Pré/pós-condições", "Invariantes de estado", "Tipagem dependente"],
    aplic: ["Verificação formal", "Compiladores", "IA simbólica"],
  },
  {
    n: "05", icon: Code2, title: "Código",
    question: "Como traduzir o modelo em estruturas executáveis?",
    desc: "Transformar o modelo em classes, funções, estruturas, algoritmos e simulações.",
    highlight: "Não programar o problema, mas programar o modelo do problema.",
    examples: ["class Pendulum { step(dt) }", "MarkovChain.transition(s)", "Agent.decide(state)"],
    aplic: ["Engenharia de software", "Simulação", "Pesquisa científica"],
  },
  {
    n: "06", icon: PlayCircle, title: "Simulação",
    question: "Como o sistema se comporta sob diferentes cenários?",
    desc: "Executar o modelo variando condições iniciais, parâmetros e ambientes.",
    examples: ["Monte Carlo", "Rollouts em RL", "Sweep paramétrico"],
    aplic: ["Risco", "IA", "Engenharia"],
  },
  {
    n: "07", icon: FlaskConical, title: "Experimento",
    question: "O que muda quando perturbo o sistema?",
    desc: "Modificar parâmetros e observar comportamentos emergentes, rupturas e regimes.",
    examples: ["Bifurcações", "Pontos críticos", "Sensibilidade a hiperparâmetros"],
    aplic: ["Sistemas dinâmicos", "Deep learning", "Política pública"],
  },
  {
    n: "08", icon: GitBranch, title: "Extração de Padrões",
    question: "Que regularidades, falhas e surpresas aparecem?",
    desc: "Detectar recorrências, falhas, comportamentos inesperados e generalizações latentes.",
    examples: ["Leis de potência", "Atratores", "Modos de falha sistemáticos"],
    aplic: ["Ciência de dados", "Epistemologia", "Engenharia"],
  },
  {
    n: "09", icon: InfinityIcon, title: "Generalização",
    question: "O que disso é reutilizável universalmente?",
    desc: "Transformar o aprendizado em abstração transferível entre domínios.",
    highlight: "Abstração transferível.",
    examples: ["Padrão produtor/consumidor", "Otimização sob restrição", "Bayes como atualização universal"],
    aplic: ["Meta-aprendizagem", "Transferência interdisciplinar", "Arquitetura cognitiva"],
  },
] as const;

const CASES = [
  { area: "Matemática", title: "Frações", obj: "Razão entre partes e todo", model: "a/b com b≠0", code: "class Frac { add(o){...} }", pat: "Equivalência por simplificação", gen: "Estrutura de corpo ordenado" },
  { area: "Física", title: "Movimento", obj: "Trajetória de um corpo", model: "x(t)=x₀+v₀t+½at²", code: "step(dt){ v+=a*dt; x+=v*dt }", pat: "Conservação", gen: "Leis de Newton como template" },
  { area: "IA", title: "Tomada de Decisão", obj: "Agente em ambiente incerto", model: "MDP (S,A,P,R,γ)", code: "argmax_a Q(s,a)", pat: "Exploração vs explotação", gen: "Bellman como princípio universal" },
  { area: "Probabilidade", title: "Inferência", obj: "Atualizar crença com evidência", model: "P(H|E) ∝ P(E|H)P(H)", code: "posterior = like*prior / Z", pat: "Convergência com dados", gen: "Bayes como atualização racional" },
  { area: "Sistemas Dinâmicos", title: "Atratores", obj: "Evolução temporal não-linear", model: "ẋ = f(x,μ)", code: "rk4(f, x, dt)", pat: "Bifurcações", gen: "Estabilidade estrutural" },
  { area: "Lógica Computacional", title: "Provas", obj: "Validade de proposições", model: "Γ ⊢ φ", code: "tactic.apply(goal)", pat: "Decomposição", gen: "Curry-Howard" },
];

function FumPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState<string | null>("01");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .like("module", "fum:%")
      .order("created_at", { ascending: false });
    setSaved(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const saveNote = async (stageN: string, stageTitle: string) => {
    const content = notes[stageN]?.trim();
    if (!content || !user) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id, module: `fum:${stageN}`, title: `${stageN} · ${stageTitle}`, content,
    });
    setNotes((p) => ({ ...p, [stageN]: "" }));
    load();
  };

  return (
    <ModulePage
      code="// META-SISTEMAS · FUM"
      title="Framework Universal de Modelagem"
      subtitle="Transformar qualquer conhecimento em sistema executável, testável e simulável."
    >
      <Link to="/app/intelecto" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="size-3" /> VOLTAR · CENTRO INTELECTUAL
      </Link>

      {/* Conceitual */}
      <HudCard title="DEFINIÇÃO CONCEITUAL">
        <p className="text-sm text-foreground/85 leading-relaxed">
          O FUM é um <span className="text-primary">pipeline cognitivo universal</span> que converte qualquer área do conhecimento
          — matemática, física, lógica, programação, IA, sistemas complexos, engenharia, tomada de decisão e modelagem da realidade —
          em <span className="text-primary">modelos executáveis e simuláveis</span>. Sua premissa: toda compreensão profunda
          pode ser destilada em uma estrutura formal, codificada, perturbada experimentalmente e generalizada como abstração transferível.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-[10px]">
          {["MATEMÁTICA","FÍSICA","LÓGICA","CÓDIGO","IA","SISTEMAS","ENGENHARIA","DECISÃO","REALIDADE"].map(t=>(
            <div key={t} className="border border-primary/20 px-2 py-1.5 text-center text-primary/80 tracking-widest">{t}</div>
          ))}
        </div>
      </HudCard>

      {/* Pipeline visual */}
      <HudCard title="PIPELINE · 9 ETAPAS">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STAGES.map((s, i) => (
            <div key={s.n} className="flex items-center shrink-0">
              <button
                onClick={() => setOpen(s.n)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded border transition min-w-[88px] ${
                  open === s.n ? "border-primary bg-primary/10 hud-glow" : "border-border/50 hover:border-primary/40"
                }`}
              >
                <s.icon className={`size-4 ${open === s.n ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-mono text-[9px] tracking-widest text-primary/80">{s.n}</div>
                <div className="font-mono text-[10px] text-foreground/90 leading-tight text-center">{s.title}</div>
              </button>
              {i < STAGES.length - 1 && <ChevronRight className="size-3 text-primary/40 mx-0.5 shrink-0" />}
            </div>
          ))}
        </div>
      </HudCard>

      {/* Etapa expandida */}
      {STAGES.filter((s) => s.n === open).map((s) => (
        <HudCard key={s.n} title={`ETAPA ${s.n} · ${s.title.toUpperCase()}`}>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">PERGUNTA CENTRAL</div>
                <p className="text-sm text-primary italic">"{s.question}"</p>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">DESCRIÇÃO</div>
                <p className="text-sm text-foreground/85">{s.desc}</p>
              </div>
              {"highlight" in s && s.highlight && (
                <div className="border-l-2 border-primary pl-3 py-1">
                  <p className="text-sm text-primary font-display tracking-wide">{s.highlight}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">EXEMPLOS</div>
                  <ul className="space-y-1">
                    {s.examples.map((e) => <li key={e} className="text-xs text-foreground/80 font-mono">› {e}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">APLICAÇÕES</div>
                  <ul className="space-y-1">
                    {s.aplic.map((e) => <li key={e} className="text-xs text-foreground/80 font-mono">› {e}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">OBSERVAÇÕES PESSOAIS</div>
              <Textarea
                value={notes[s.n] ?? ""}
                onChange={(e) => setNotes((p) => ({ ...p, [s.n]: e.target.value }))}
                placeholder="Notas, conexões, experimentos..."
                className="min-h-[140px] bg-input/40 font-mono text-xs"
              />
              <Button onClick={() => saveNote(s.n, s.title)} className="w-full font-mono text-[10px] tracking-widest">
                REGISTRAR
              </Button>
              <div className="space-y-1 max-h-40 overflow-auto pt-2 border-t border-border/40">
                {saved.filter((x) => x.module === `fum:${s.n}`).map((x) => (
                  <div key={x.id} className="text-[11px] font-mono text-foreground/80 border-l border-primary/30 pl-2">
                    {x.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </HudCard>
      ))}

      {/* Casos reais */}
      <HudCard title="CASOS REAIS · APLICAÇÃO DO FRAMEWORK">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CASES.map((c) => (
            <div key={c.title} className="border border-border/50 hover:border-primary/40 transition p-3 rounded">
              <div className="font-mono text-[9px] tracking-widest text-primary/70">{c.area.toUpperCase()}</div>
              <div className="font-display text-sm text-foreground mt-0.5">{c.title}</div>
              <div className="mt-2 space-y-1 text-[11px] font-mono text-foreground/75">
                <div><span className="text-muted-foreground">obj › </span>{c.obj}</div>
                <div><span className="text-muted-foreground">model › </span>{c.model}</div>
                <div><span className="text-muted-foreground">code › </span><span className="text-primary/90">{c.code}</span></div>
                <div><span className="text-muted-foreground">pat › </span>{c.pat}</div>
                <div><span className="text-muted-foreground">gen › </span>{c.gen}</div>
              </div>
            </div>
          ))}
        </div>
      </HudCard>

      {/* IA */}
      <HudCard title="INTEGRAÇÃO COM IA">
        <div className="flex items-start gap-3">
          <Brain className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-foreground/85">
            <p>A IA do Núcleo monitora suas entradas no FUM para:</p>
            <ul className="space-y-1 font-mono text-xs text-foreground/80">
              <li>› detectar padrões de pensamento sistêmico</li>
              <li>› identificar aumento de capacidade de abstração</li>
              <li>› conectar áreas distintas automaticamente</li>
              <li>› sugerir frameworks relacionados</li>
              <li>› analisar profundidade conceitual</li>
              <li>› gerar insights sobre evolução intelectual</li>
            </ul>
            <p className="text-primary italic text-xs pt-2 border-t border-border/40">
              "Seu pensamento recente demonstra maior capacidade de generalização e integração interdisciplinar."
            </p>
          </div>
        </div>
      </HudCard>
    </ModulePage>
  );
}
