import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skull, Crosshair, Flame, Compass, Rocket, Copy, CheckCircle2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/wayne")({ component: TrinariusPage });

const PRINCIPIOS = [
  "Verdade acima de conveniência.",
  "Sabedoria acima de aparência.",
  "Disciplina acima de impulsos.",
  "Humildade acima do ego.",
  "Serviço acima do orgulho.",
  "Princípios cristãos como norte moral inegociável.",
  "A missão é maior que o humor do dia.",
];

type Mode = "batman" | "reacher" | "red";

type Archetype = {
  key: Mode;
  codename: string;
  role: string;
  icon: any;
  accent: string;
  manifesto: string;
  gatilho: string;
  protocolo: string[];
  perguntas: string[];
};

const ARQUETIPOS: Archetype[] = [
  {
    key: "batman",
    codename: "BATMAN",
    role: "Execução & Combate",
    icon: Skull,
    accent: "text-foreground border-foreground/60",
    manifesto:
      "Disciplina absoluta. Emoção subordinada à missão. Zero distração. Execução é a única linguagem que sobrevive ao amanhecer. O medo existe — mas não decide. A dor existe — mas não negocia. Você é o instrumento; a missão é o eixo. Enquanto houver alvo, há movimento. Descanso se conquista depois do fechamento, nunca antes.",
    gatilho:
      "Ative quando: cadeia crítica aberta, prazo curto, hostilidade externa, tentação forte de recuar, missão importante que ninguém vai executar por você, e o custo de adiar é maior que o custo de sofrer.",
    protocolo: [
      "Corta o supérfluo — social, entretenimento, opinião externa, comida-recompensa.",
      "Foco em UMA ação prioritária por vez, até fechá-la; nada de multitarefa emocional.",
      "Trata dor, cansaço e humor como ruído — dado, não argumento.",
      "Só sai do modo quando a missão está CONCLUÍDA, não quando fica difícil.",
      "Silêncio operacional: menos declaração, mais entrega.",
    ],
    perguntas: [
      "Qual é a próxima ação concreta, agora, sem negociar?",
      "O que estou usando como desculpa emocional para não executar?",
      "Se eu tirasse a emoção da equação, o que a razão exigiria?",
      "Qual desconforto físico específico estou tratando como impedimento sem ser?",
      "Se ninguém fosse me elogiar por isso, eu ainda faria? Se não — por quê estou fazendo?",
      "Qual missão eu adiei ontem que eu poderia fechar hoje em 25 minutos?",
      "O que exatamente eu ganho ao esperar 'estar melhor' para agir?",
      "Que barulho externo estou permitindo entrar na minha cabeça agora?",
      "Onde estou performando disciplina em vez de exercer disciplina?",
      "Qual promessa que fiz a mim mesmo eu estou traindo em silêncio?",
      "Se eu executasse esta ação em 10 minutos, o que quebraria de fato na minha vida?",
      "Qual é o menor movimento reversível que já quebra a inércia?",
      "Onde estou usando planejamento como fuga da execução?",
      "Qual é a missão que, se fechada hoje, me daria autoridade moral amanhã?",
      "O que eu estaria fazendo agora se soubesse que ninguém me julgaria?",
    ],
  },
  {
    key: "reacher",
    codename: "REACHER",
    role: "Julgamento & Análise Fria",
    icon: Crosshair,
    accent: "text-primary border-primary/50",
    manifesto:
      "Observação silenciosa. Padrões antes de opiniões. Ação minimalista, precisa e proporcional ao contexto real. Você não é o mais barulhento da sala — é o que enxerga primeiro. Nunca reaja ao que a pessoa diz; reaja ao incentivo que a move. Palavra é fumaça; comportamento é fogo. Colete evidência antes de escolher lado. Julgamento tardio é mais barato que retratação prematura.",
    gatilho:
      "Ative quando: ambiente novo, decisão importante, conflito, negociação, análise de pessoas, planejamento estratégico, alguém está te vendendo urgência artificial, você sente pressão para responder rápido.",
    protocolo: [
      "Escuta muito mais do que fala. Coleta dados antes de reagir.",
      "Identifica quem está ali por interesse, medo, ego ou lealdade real.",
      "Toma decisões com base em evidência observada, não em narrativa emocional.",
      "Age com o mínimo de força necessária — nunca mais, nunca menos.",
      "Nunca revela leitura completa; guarda margem informacional.",
    ],
    perguntas: [
      "O que está acontecendo aqui que ninguém está dizendo em voz alta?",
      "Qual incentivo real move cada pessoa envolvida?",
      "Qual é a resposta suficiente — sem drama, sem excesso?",
      "Se eu tirasse as palavras e olhasse só o comportamento, o que sobra?",
      "Quem nesta sala tem algo a perder se eu tomar a decisão certa?",
      "Onde está o sinal, onde está o ruído?",
      "Qual detalhe pequeno todo mundo está ignorando?",
      "Quem está pressionando urgência sem justificativa proporcional?",
      "O que essa pessoa NÃO está me contando — e por quê?",
      "Se eu esperar 24 horas para responder, o que muda no meu poder de decisão?",
      "Qual é a hipótese mais barata de testar antes de agir?",
      "Estou lendo o mapa ou o território?",
      "Qual reação minha é a que o outro lado ESPERA — e o que muda se eu não entregar?",
      "Onde estou projetando minha lógica em alguém que joga com outra régua?",
      "Qual é o custo real de errar essa leitura?",
    ],
  },
  {
    key: "red",
    codename: "RED REDDINGTON",
    role: "Estratégia & Influência",
    icon: Compass,
    accent: "text-amber-300 border-amber-400/40",
    manifesto:
      "Elegância operacional. Vantagem construída com informação, timing e relação. Nunca revela mais do que precisa. Nunca queima ponte que ainda pode servir. Nunca gasta favor pequeno com pessoa grande. A rede é o ativo; a paciência é o multiplicador; a discrição é a moeda. Você trata cada conversa como um investimento — nem promessa vazia, nem cobrança precoce. Constrói dívida invisível.",
    gatilho:
      "Ative quando: conversa de alto valor, construção de rede, posicionamento, negociação, movimento de longo prazo, alguém importante entra em cena, oportunidade de fazer favor barato que renderá caro.",
    protocolo: [
      "Fala com calma, escolhe palavra, controla o tempo da conversa.",
      "Entrega valor primeiro; cobra depois, em silêncio, quando importa.",
      "Guarda informação como ativo — só usa quando ela decide algo.",
      "Nunca desperdiça inimigo, nunca queima aliado, nunca implora nada.",
      "Move-se por vantagem composta, não por vitória imediata.",
    ],
    perguntas: [
      "Qual é a jogada por trás desta jogada?",
      "Que informação eu tenho que os outros não têm — e como ela vira alavanca?",
      "Como saio deste encontro mais bem posicionado do que entrei?",
      "Qual favor barato eu posso entregar agora que renderá caro depois?",
      "Quem, nesta rede, ainda não sabe que precisa de mim?",
      "Que informação estou revelando sem necessidade?",
      "Qual é a versão desta conversa que faz eu parecer supérfluo — e como eu evito ela?",
      "Onde estou cobrando cedo demais uma dívida que ainda vai crescer?",
      "Qual aliado eu venho negligenciando e deveria reativar essa semana?",
      "Que porta eu bati nos últimos 30 dias que eu poderia reabrir hoje?",
      "Qual é a menor mudança de posicionamento que multiplica meu valor percebido?",
      "Se eu falasse 30% menos nessa conversa, o que aconteceria?",
      "Qual é a jogada de 3 movimentos daqui — não a de 1?",
      "Onde estou vendendo urgência quando deveria vender inevitabilidade?",
    ],
  },
];

type Reflection = { question_index: number; answer: string; status: string };

function TrinariusPage() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<Mode>("batman");
  const [reflections, setReflections] = useState<Record<Mode, Record<number, Reflection>>>({
    batman: {}, reacher: {}, red: {},
  });
  const [importText, setImportText] = useState("");
  const [importImage, setImportImage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    if (!user) return;
    const sb: any = supabase;
    const { data } = await sb.from("trinarius_reflections").select("mode,question_index,answer,status");
    const map: Record<Mode, Record<number, Reflection>> = { batman: {}, reacher: {}, red: {} };
    (data ?? []).forEach((r: any) => {
      if (r.mode in map) map[r.mode as Mode][r.question_index] = r;
    });
    setReflections(map);
  };
  useEffect(() => { load(); }, [user]);

  const upsertAnswer = async (mode: Mode, index: number, text: string, status: "draft" | "concluded" = "draft") => {
    if (!user) return;
    setReflections((s) => ({ ...s, [mode]: { ...s[mode], [index]: { question_index: index, answer: text, status } } }));
    const q = ARQUETIPOS.find((a) => a.key === mode)!.perguntas[index];
    const sb: any = supabase;
    await sb.from("trinarius_reflections").upsert({
      user_id: user.id, mode, question_index: index, question_text: q, answer: text, status,
    }, { onConflict: "user_id,mode,question_index" });
  };

  const arch = ARQUETIPOS.find((a) => a.key === activeMode)!;
  const modeReflections = reflections[activeMode];

  const handleFile = async (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Envie uma imagem."); return; }
    const reader = new FileReader();
    reader.onload = () => setImportImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const runImport = async () => {
    if (!user) return;
    if (!importText.trim() && !importImage) { toast.error("Cole um texto ou envie uma imagem."); return; }
    setImporting(true);
    try {
      const questions = arch.perguntas.map((q, i) => ({ index: i, text: q }));
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "trinarius_import",
          context: { mode: activeMode, questions, raw_text: importText, image_url: importImage },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const answers = (data as any).trinariusImport?.answers ?? [];
      if (!answers.length) { toast.warning("Nada mapeado. Tente com mais contexto."); return; }
      for (const a of answers) {
        if (a && typeof a.index === "number" && a.answer) {
          await upsertAnswer(activeMode, a.index, a.answer, "draft");
        }
      }
      toast.success(`${answers.length} respostas importadas. Revise antes de concluir.`);
      setImportText(""); setImportImage(null);
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao importar");
    } finally {
      setImporting(false);
    }
  };

  const evolutionRegistry = ARQUETIPOS.flatMap((a) =>
    Object.values(reflections[a.key])
      .filter((r) => r.status === "concluded" && r.answer.trim())
      .map((r) => ({
        mode: a.codename,
        question: a.perguntas[r.question_index],
        answer: r.answer,
      })),
  );

  const registryText = evolutionRegistry
    .map((e) => `[${e.mode}]\nP: ${e.question}\nR: ${e.answer}\n`)
    .join("\n");

  return (
    <ModulePage
      code="// TRN 21"
      title="SISTEMA TRINARIUS"
      subtitle="Três modos operacionais. Um só homem, governado por princípios."
      explanation="Batman executa. Reacher lê. Red articula. Escolha o modo pelo terreno; os princípios são inegociáveis."
    >
      <HudCard title="PRINCÍPIOS CONSTITUCIONAIS · INEGOCIÁVEIS">
        <ul className="space-y-1.5 text-sm text-foreground/90">
          {PRINCIPIOS.map((p) => (
            <li key={p} className="flex gap-2">
              <Flame className="size-3 text-primary mt-1 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </HudCard>

      <div className="flex gap-2 flex-wrap">
        {ARQUETIPOS.map((a) => {
          const active = a.key === activeMode;
          const Icon = a.icon;
          const done = Object.values(reflections[a.key]).filter((r) => r.status === "concluded").length;
          return (
            <Button
              key={a.key}
              variant={active ? "default" : "outline"}
              onClick={() => setActiveMode(a.key)}
              className={`font-mono text-[11px] tracking-widest ${active ? "" : "border-primary/30"}`}
            >
              <Icon className="size-3 mr-2" />
              {a.codename}
              <Badge variant="outline" className="ml-2 font-mono text-[9px]">{done}/{a.perguntas.length}</Badge>
            </Button>
          );
        })}
      </div>

      {/* MANIFESTO */}
      <div className={`hud-panel hud-corner p-6 border ${arch.accent}`}>
        <div className="flex items-center gap-3 border-b border-border/40 pb-3 mb-4">
          <arch.icon className={`size-6 ${arch.accent.split(" ")[0]}`} />
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">MANIFESTO DO OPERADOR · {arch.codename}</div>
            <div className={`font-display text-xl hud-text-glow ${arch.accent.split(" ")[0]}`}>{arch.role}</div>
          </div>
        </div>
        <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">PRINCÍPIO</div>
            <p>{arch.manifesto}</p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">GATILHO — QUANDO ATIVAR</div>
            <p>{arch.gatilho}</p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">PROTOCOLO DE AÇÃO</div>
            <ul className="space-y-1">
              {arch.protocolo.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">▸</span><span>{p}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* IMPORT PANEL */}
      <div className="hud-panel border-2 border-dashed border-primary/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-primary animate-pulse-ring" />
          <span className="font-mono text-[11px] tracking-[0.3em] text-primary">PAINEL DE IMPORTAÇÃO INTELIGENTE · {arch.codename}</span>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">
          Cole um texto bruto (transcrição, caderno digitado, dictado) OU envie a foto do caderno. O JARVIS mapeia cada trecho à pergunta correspondente e preenche os cards abaixo — você revisa e conclui.
        </p>
        <Textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Cole aqui o texto bruto..."
          className="min-h-[100px] bg-input/40 font-mono text-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="trinarius-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button asChild variant="outline" size="sm" className="font-mono text-[10px] tracking-widest">
            <label htmlFor="trinarius-image" className="cursor-pointer">📷 ANEXAR IMAGEM</label>
          </Button>
          {importImage && <Badge variant="outline" className="font-mono text-[9px]">imagem carregada</Badge>}
          {importImage && (
            <Button size="sm" variant="ghost" onClick={() => setImportImage(null)} className="font-mono text-[10px]">remover</Button>
          )}
          <div className="flex-1" />
          <Button onClick={runImport} disabled={importing} className="font-mono text-[10px] tracking-widest">
            <Rocket className="size-3 mr-1" />
            {importing ? "ANALISANDO..." : "🚀 ANALISAR E PREENCHER"}
          </Button>
        </div>
      </div>

      {/* CARDS DE PERGUNTAS INDIVIDUAIS */}
      <div className="grid md:grid-cols-2 gap-3">
        {arch.perguntas.map((q, i) => {
          const r = modeReflections[i];
          const answer = r?.answer ?? "";
          const concluded = r?.status === "concluded";
          return (
            <div key={i} className={`hud-panel p-4 border ${concluded ? "border-primary/60" : "border-border/40"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="font-mono text-[9px] tracking-widest text-primary/70">PERGUNTA {i + 1}</div>
                  <div className="text-sm font-display text-foreground mt-1 leading-snug">{q}</div>
                </div>
                {concluded && <CheckCircle2 className="size-4 text-primary shrink-0" />}
              </div>
              <Textarea
                value={answer}
                onChange={(e) => upsertAnswer(activeMode, i, e.target.value, r?.status === "concluded" ? "concluded" : "draft")}
                placeholder="Sua reflexão aqui..."
                className="min-h-[90px] bg-input/40 text-sm"
              />
              <div className="flex gap-1 mt-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => upsertAnswer(activeMode, i, answer, "draft")}
                  className="font-mono text-[10px] h-7"
                >
                  <Pencil className="size-3 mr-1" /> RASCUNHO
                </Button>
                <Button
                  size="sm"
                  variant={concluded ? "default" : "outline"}
                  disabled={!answer.trim()}
                  onClick={() => upsertAnswer(activeMode, i, answer, "concluded")}
                  className="font-mono text-[10px] h-7"
                >
                  <CheckCircle2 className="size-3 mr-1" /> {concluded ? "CONCLUÍDA" : "CONCLUIR"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTRO DE EVOLUÇÃO PESSOAL */}
      <HudCard title="📓 REGISTRO DE EVOLUÇÃO PESSOAL">
        {evolutionRegistry.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground">
            Nenhuma reflexão concluída ainda. Assim que você marcar um card como "CONCLUÍDA", ele aparece aqui, consolidado por modo.
          </p>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(registryText); toast.success("Registro copiado."); }}
                className="font-mono text-[10px]"
              >
                <Copy className="size-3 mr-1" /> COPIAR TUDO
              </Button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-auto">
              {evolutionRegistry.map((e, idx) => (
                <div key={idx} className="border-l-2 border-primary/40 pl-3">
                  <div className="font-mono text-[9px] tracking-widest text-primary/70">[{e.mode}]</div>
                  <div className="text-xs italic text-muted-foreground mt-1">{e.question}</div>
                  <div className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{e.answer}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </HudCard>

      <HudCard title="REGRA CENTRAL">
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "Não são três homens. É um só, governado por princípios, escolhendo o modo certo para o terreno certo.
          Batman executa quando é hora de agir. Reacher lê quando é hora de entender. Red articula quando é hora de mover peças.
          O erro é usar o modo errado no momento errado — e desonrar o princípio que sustenta os três."
        </p>
      </HudCard>
    </ModulePage>
  );
}
