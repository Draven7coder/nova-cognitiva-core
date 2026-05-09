import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Brain, Target, Sun, Moon, CalendarDays, Sparkles, Activity,
  Zap, Fingerprint, Layers, Crosshair, FlaskConical, Clock,
} from "lucide-react";

export const Route = createFileRoute("/app/protocolos")({ component: Protocolos });

type Section = "matinal" | "noturno" | "semanal";
type LabMode = "segunda_ordem" | "engenharia_reversa" | "mini_tese";

const LAB_MODES: { id: LabMode; label: string; desc: string; placeholder: string }[] = [
  {
    id: "segunda_ordem",
    label: "Pensamento de Segunda Ordem",
    desc: "Mapeie consequências em cadeia: Se X → então Y → então Z. Antecipe efeitos não óbvios.",
    placeholder: "Decisão / evento:\nConsequência 1ª ordem:\nConsequência 2ª ordem:\nConsequência 3ª ordem:",
  },
  {
    id: "engenharia_reversa",
    label: "Engenharia Reversa",
    desc: "Desmonte uma pessoa, sistema ou resultado de alta performance. Quais são os componentes invisíveis?",
    placeholder: "Alvo de análise:\nVariáveis visíveis:\nVariáveis invisíveis:\nMecanismo central:\nO que é replicável:",
  },
  {
    id: "mini_tese",
    label: "Mini-Tese Estratégica",
    desc: "Sintetize uma ideia complexa em poucas linhas. Tese · evidência · implicação.",
    placeholder: "Tese (1 frase):\nEvidências (2-3):\nImplicação prática:",
  },
];

function Protocolos() {
  const { user } = useAuth();
  const initialHash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const [tab, setTab] = useState<Section>(
    (["matinal", "noturno", "semanal"].includes(initialHash) ? initialHash : "matinal") as Section
  );

  // === MATINAL ALFA — 5 camadas ===
  // C1 — Limpeza Mental
  const [descarga, setDescarga] = useState("");
  // C2 — Direcionamento Estratégico
  const [acaoMaisImportante, setAcaoMaisImportante] = useState("");
  const [decisaoCritica, setDecisaoCritica] = useState("");
  const [acaoAltoImpacto, setAcaoAltoImpacto] = useState("");
  // C3 — Laboratório Cognitivo
  const [labMode, setLabMode] = useState<LabMode>("segunda_ordem");
  const [labContent, setLabContent] = useState("");
  // C4 — Ativação Executiva
  const [prioridades, setPrioridades] = useState<{ task: string; tempo: string; horario: string }[]>([
    { task: "", tempo: "", horario: "" },
    { task: "", tempo: "", horario: "" },
    { task: "", tempo: "", horario: "" },
  ]);
  // C5 — Identidade Neural
  const [tornandome, setTornandome] = useState("");
  const [comportamento, setComportamento] = useState("");
  const [habito, setHabito] = useState("");

  // Noturno
  const [executei, setExecutei] = useState("");
  const [falhei, setFalhei] = useState("");
  const [aprendi, setAprendi] = useState("");
  const [padrao, setPadrao] = useState("");
  const [ajuste, setAjuste] = useState("");

  // Semanal
  const [vitorias, setVitorias] = useState("");
  const [sabotagens, setSabotagens] = useState("");
  const [intelectual, setIntelectual] = useState("");
  const [fisica, setFisica] = useState("");
  const [proposito, setProposito] = useState("");
  const [profundas, setProfundas] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);

  const reloadHistory = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .like("module", "protocolo_%")
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
  };

  useEffect(() => { reloadHistory(); }, [user]);

  const saveSection = async (module: string, payload: any, title: string) => {
    if (!user) return;
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id, module, title, content: JSON.stringify(payload),
    });
    if (error) return toast.error(error.message);
    toast.success("Protocolo registrado no NÚCLEO.");
    reloadHistory();
  };

  const runAnalysis = async (scope: string, payload: any) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: { scope, context: { protocolo: payload } },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      setAiInsight((data as any).content);
      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope,
        content: (data as any).content,
        metrics: (data as any).metrics ?? null,
      });
      toast.success("Análise IA concluída.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha na análise");
    } finally { setAnalyzing(false); }
  };

  const submitMatinal = async () => {
    const payload = {
      protocolo: "ALFA",
      camada1_limpeza: descarga,
      camada2_direcionamento: { acaoMaisImportante, decisaoCritica, acaoAltoImpacto },
      camada3_laboratorio: { modo: labMode, conteudo: labContent },
      camada4_execucao: prioridades,
      camada5_identidade: { tornandome, comportamento, habito },
    };
    await saveSection("protocolo_matinal_alfa", payload, "Diário Matinal Cognitivo · Alfa");
    await runAnalysis("matinal_alfa", payload);
  };

  const submitNoturno = async () => {
    const payload = { executei, falhei, aprendi, padrao, ajuste };
    await saveSection("protocolo_noturno", payload, "Protocolo Noturno");
    await runAnalysis("noturno", payload);
  };

  const submitSemanal = async () => {
    const payload = { vitorias, sabotagens, intelectual, fisica, proposito, profundas };
    await saveSection("protocolo_semanal", payload, "Protocolo Semanal");
    await runAnalysis("semanal", payload);
  };

  const activeLab = LAB_MODES.find((m) => m.id === labMode)!;

  return (
    <ModulePage
      code="// PROTO 07"
      title="Protocolos Operacionais"
      subtitle="Motor comportamental · calibração mental e execução estratégica."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as Section)}>
        <TabsList className="bg-card/40 border border-border/40">
          <TabsTrigger value="matinal" className="font-mono text-[10px] tracking-widest">
            <Sun className="size-3 mr-2" /> MATINAL · ALFA
          </TabsTrigger>
          <TabsTrigger value="noturno" className="font-mono text-[10px] tracking-widest">
            <Moon className="size-3 mr-2" /> NOTURNO
          </TabsTrigger>
          <TabsTrigger value="semanal" className="font-mono text-[10px] tracking-widest">
            <CalendarDays className="size-3 mr-2" /> SEMANAL
          </TabsTrigger>
        </TabsList>

        {/* ============ MATINAL ALFA ============ */}
        <TabsContent value="matinal" className="space-y-4 mt-4">
          <HudCard title="DIÁRIO MATINAL COGNITIVO · PROTOCOLO ALFA">
            <div className="flex items-start gap-3">
              <Layers className="size-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-foreground/90 font-display">
                  Sistema de calibração mental e execução estratégica em 5 camadas.
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-1 leading-relaxed">
                  Limpeza → Direcionamento → Expansão Cognitiva → Ativação Executiva → Identidade Neural.
                </p>
              </div>
            </div>
          </HudCard>

          {/* CAMADA 1 — LIMPEZA MENTAL */}
          <HudCard title="🧩 CAMADA 1 · LIMPEZA MENTAL" id="camada-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Brain className="size-4" />
              <span className="font-display text-sm">Descarrego cognitivo</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mb-3">
              Externalize pensamentos, separe emoção · planejamento · distração. A IA detecta padrões
              de ansiedade, dispersão, sobrecarga e loops emocionais.
            </p>
            <Textarea
              value={descarga}
              onChange={(e) => setDescarga(e.target.value)}
              placeholder="Escreva sem filtro. Tudo o que está ocupando a mente agora."
              className="min-h-[180px] bg-background/40 font-mono text-sm"
            />
          </HudCard>

          {/* CAMADA 2 — DIRECIONAMENTO */}
          <HudCard title="🎯 CAMADA 2 · DIRECIONAMENTO ESTRATÉGICO">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Crosshair className="size-4" />
              <span className="font-display text-sm">Foco assimétrico</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  AÇÃO MAIS IMPORTANTE DO DIA
                </label>
                <Input
                  value={acaoMaisImportante}
                  onChange={(e) => setAcaoMaisImportante(e.target.value)}
                  placeholder="A única coisa que, se feita, torna o dia bem-sucedido."
                  className="bg-background/40 font-mono text-sm mt-1"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  DECISÃO CRÍTICA DO DIA
                </label>
                <Input
                  value={decisaoCritica}
                  onChange={(e) => setDecisaoCritica(e.target.value)}
                  placeholder="A escolha que define a trajetória."
                  className="bg-background/40 font-mono text-sm mt-1"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  AÇÃO DE ALTO IMPACTO
                </label>
                <Input
                  value={acaoAltoImpacto}
                  onChange={(e) => setAcaoAltoImpacto(e.target.value)}
                  placeholder="Movimento que muda o progresso real, não apenas a sensação."
                  className="bg-background/40 font-mono text-sm mt-1"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-mono">
              IA valida alinhamento com propósito e evolução de longo prazo.
            </p>
          </HudCard>

          {/* CAMADA 3 — LABORATÓRIO COGNITIVO */}
          <HudCard title="🧠 CAMADA 3 · LABORATÓRIO COGNITIVO">
            <div className="flex items-center gap-2 text-primary mb-3">
              <FlaskConical className="size-4" />
              <span className="font-display text-sm">Expansão cognitiva diária</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              {LAB_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setLabMode(m.id)}
                  className={`p-3 border rounded text-left transition-colors ${
                    labMode === m.id
                      ? "border-primary bg-primary/10 hud-glow"
                      : "border-border/40 hover:border-primary/50"
                  }`}
                >
                  <div className="font-mono text-[10px] tracking-widest text-primary">
                    MODO {LAB_MODES.indexOf(m) + 1}
                  </div>
                  <div className="text-xs font-display mt-1">{m.label}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mb-2">{activeLab.desc}</p>
            <Textarea
              value={labContent}
              onChange={(e) => setLabContent(e.target.value)}
              placeholder={activeLab.placeholder}
              className="min-h-[180px] bg-background/40 font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-3 font-mono">
              IA avalia: profundidade · abstração · originalidade · clareza lógica.
            </p>
          </HudCard>

          {/* CAMADA 4 — ATIVAÇÃO EXECUTIVA */}
          <HudCard title="⚡ CAMADA 4 · ATIVAÇÃO EXECUTIVA">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Zap className="size-4" />
              <span className="font-display text-sm">3 prioridades cognitivas com tempo e horário</span>
            </div>
            <div className="space-y-2">
              {prioridades.map((p, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <span className="font-mono text-[10px] text-primary col-span-1">P{i + 1}</span>
                  <Input
                    value={p.task}
                    onChange={(e) => {
                      const arr = [...prioridades]; arr[i].task = e.target.value; setPrioridades(arr);
                    }}
                    placeholder="Prioridade cognitiva"
                    className="bg-background/40 font-mono text-sm col-span-6"
                  />
                  <Input
                    value={p.tempo}
                    onChange={(e) => {
                      const arr = [...prioridades]; arr[i].tempo = e.target.value; setPrioridades(arr);
                    }}
                    placeholder="Tempo (ex: 90min)"
                    className="bg-background/40 font-mono text-xs col-span-2"
                  />
                  <Input
                    type="time"
                    value={p.horario}
                    onChange={(e) => {
                      const arr = [...prioridades]; arr[i].horario = e.target.value; setPrioridades(arr);
                    }}
                    className="bg-background/40 font-mono text-xs col-span-3"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-mono flex items-center gap-1">
              <Clock className="size-3" /> IA monitora consistência · risco de procrastinação · coerência com objetivos.
            </p>
          </HudCard>

          {/* CAMADA 5 — IDENTIDADE NEURAL */}
          <HudCard title="🧬 CAMADA 5 · IDENTIDADE NEURAL">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Fingerprint className="size-4" />
              <span className="font-display text-sm">Reforço de identidade operacional</span>
            </div>
            <div className="grid lg:grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  QUEM ESTOU ME TORNANDO HOJE
                </label>
                <Textarea
                  value={tornandome}
                  onChange={(e) => setTornandome(e.target.value)}
                  className="min-h-[100px] bg-background/40 font-mono text-sm mt-1"
                  placeholder="Versão futura ativada hoje."
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  COMPORTAMENTO QUE DEFINE
                </label>
                <Textarea
                  value={comportamento}
                  onChange={(e) => setComportamento(e.target.value)}
                  className="min-h-[100px] bg-background/40 font-mono text-sm mt-1"
                  placeholder="Ação observável que comprova essa identidade."
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  HÁBITO QUE SUSTENTA
                </label>
                <Textarea
                  value={habito}
                  onChange={(e) => setHabito(e.target.value)}
                  className="min-h-[100px] bg-background/40 font-mono text-sm mt-1"
                  placeholder="Rotina que mantém a versão viva."
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-mono">
              IA monitora evolução de identidade ao longo do tempo.
            </p>
          </HudCard>

          <div className="flex justify-end">
            <Button onClick={submitMatinal} disabled={analyzing} className="font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {analyzing ? "ANALISANDO..." : "EXECUTAR PROTOCOLO ALFA"}
            </Button>
          </div>
        </TabsContent>

        {/* NOTURNO */}
        <TabsContent value="noturno" className="space-y-4 mt-4">
          <HudCard title="PROTOCOLO NOTURNO · FECHAMENTO ESTRATÉGICO">
            <p className="text-xs text-muted-foreground font-mono">
              Transformar experiência em aprendizado adaptativo.
            </p>
          </HudCard>
          <div className="grid lg:grid-cols-2 gap-4">
            {[
              { label: "O que executei?", val: executei, set: setExecutei },
              { label: "Onde falhei?", val: falhei, set: setFalhei },
              { label: "O que aprendi?", val: aprendi, set: setAprendi },
              { label: "Qual padrão apareceu?", val: padrao, set: setPadrao },
              { label: "O que ajusto amanhã?", val: ajuste, set: setAjuste },
            ].map((q) => (
              <HudCard key={q.label} title={q.label.toUpperCase()}>
                <Textarea
                  value={q.val}
                  onChange={(e) => q.set(e.target.value)}
                  className="min-h-[110px] bg-background/40 font-mono text-sm"
                  placeholder="Resposta direta, sem rodeios."
                />
              </HudCard>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={submitNoturno} disabled={analyzing} className="font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {analyzing ? "ANALISANDO..." : "FECHAR DIA · ANÁLISE IA"}
            </Button>
          </div>
        </TabsContent>

        {/* SEMANAL */}
        <TabsContent value="semanal" className="space-y-4 mt-4">
          <HudCard title="PROTOCOLO SEMANAL · REVISÃO ESTRATÉGICA">
            <p className="text-xs text-muted-foreground font-mono">
              Detectar padrões, riscos e evolução para recalibrar a próxima semana.
            </p>
          </HudCard>
          <div className="grid lg:grid-cols-2 gap-4">
            {[
              { label: "Maiores Vitórias", val: vitorias, set: setVitorias },
              { label: "Sabotagens Recorrentes", val: sabotagens, set: setSabotagens },
              { label: "Evolução Intelectual", val: intelectual, set: setIntelectual },
              { label: "Evolução Física", val: fisica, set: setFisica },
              { label: "Alinhamento com Propósito", val: proposito, set: setProposito },
              { label: "Horas Profundas / Consistência", val: profundas, set: setProfundas },
            ].map((q) => (
              <HudCard key={q.label} title={q.label.toUpperCase()}>
                <Textarea
                  value={q.val}
                  onChange={(e) => q.set(e.target.value)}
                  className="min-h-[110px] bg-background/40 font-mono text-sm"
                />
              </HudCard>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={submitSemanal} disabled={analyzing} className="font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {analyzing ? "ANALISANDO..." : "GERAR RELATÓRIO SEMANAL"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {aiInsight && (
        <HudCard title="ANÁLISE IA · NÚCLEO COMPORTAMENTAL">
          <div className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-auto">
            {aiInsight}
          </div>
        </HudCard>
      )}

      <HudCard title="HISTÓRICO · PROTOCOLOS RECENTES">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum protocolo registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 p-2 border border-border/40 rounded">
                <Activity className="size-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm">{h.title}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {new Date(h.created_at).toLocaleString("pt-BR")} · {h.module}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </HudCard>
    </ModulePage>
  );
}
