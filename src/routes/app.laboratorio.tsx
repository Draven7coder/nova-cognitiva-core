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
  FlaskConical, Network, GitBranch, Globe2, Crown, Brain,
  Sparkles, ChevronRight, Activity,
} from "lucide-react";

export const Route = createFileRoute("/app/laboratorio")({ component: Laboratorio });

type Tab = "decima" | "simulacao" | "engenharia" | "sistemas" | "xadrez";

function Laboratorio() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("decima");

  // Décima Ordem
  const [acaoBase, setAcaoBase] = useState("");
  const [ordens, setOrdens] = useState<string[]>(Array(10).fill(""));

  // Simulação Estratégica
  const [simContext, setSimContext] = useState("");
  const [simResult, setSimResult] = useState("");

  // Engenharia Reversa
  const [objetivo, setObjetivo] = useState("");
  const [horizonte, setHorizonte] = useState("3 anos");
  const [reverseResult, setReverseResult] = useState("");

  // Sistemas Complexos
  const [systemKind, setSystemKind] = useState("Mercado");
  const [systemDesc, setSystemDesc] = useState("");
  const [systemResult, setSystemResult] = useState("");

  // Xadrez
  const [scenario, setScenario] = useState("Criar startup");
  const [decisao, setDecisao] = useState("");
  const [chessLog, setChessLog] = useState<{ role: "ia" | "user"; text: string }[]>([]);

  const [running, setRunning] = useState(false);
  const [globalAnalysis, setGlobalAnalysis] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const reload = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .like("module", "lab_%")
      .order("created_at", { ascending: false })
      .limit(8);
    setHistory(data ?? []);
  };
  useEffect(() => { reload(); }, [user]);

  const callAI = async (scope: string, payload: any): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("ai-analyst", {
      body: { scope, context: payload },
    });
    if (error) throw error;
    if ((data as any).error) throw new Error((data as any).error);
    return (data as any).content as string;
  };

  const persist = async (module: string, title: string, payload: any) => {
    if (!user) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id, module, title, content: JSON.stringify(payload),
    });
    reload();
  };

  // === DÉCIMA ORDEM ===
  const expandirDecima = async () => {
    if (!acaoBase.trim()) return toast.error("Defina a ação base.");
    setRunning(true);
    try {
      const text = await callAI("lab_decima_ordem", {
        instrucao: "Expanda a ação/decisão abaixo em 10 ordens de consequência (1ª → 10ª). Para cada ordem, escreva 1-2 frases curtas, conectando causalmente à anterior. Identifique impactos invisíveis e efeitos sistêmicos. Responda APENAS com 10 linhas numeradas: '1. ...' até '10. ...'.",
        acao: acaoBase,
      });
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => /^\d+[\.\)]/.test(l));
      const novas = Array(10).fill("");
      lines.forEach((l, i) => { if (i < 10) novas[i] = l.replace(/^\d+[\.\)]\s*/, ""); });
      setOrdens(novas);
      setGlobalAnalysis(text);
      await persist("lab_decima_ordem", `Décima Ordem · ${acaoBase.slice(0, 50)}`, { acaoBase, ordens: novas });
      toast.success("Cadeia de 10 ordens projetada.");
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  // === SIMULAÇÃO ===
  const runSimulacao = async () => {
    if (!simContext.trim()) return toast.error("Descreva o contexto.");
    setRunning(true);
    try {
      const text = await callAI("lab_simulacao_estrategica", {
        instrucao: "Gere 5 cenários alternativos para o contexto abaixo: (1) Sucesso Extremo, (2) Cenário Médio, (3) Fracasso, (4) Crise Inesperada, (5) Oportunidade Oculta. Para cada cenário descreva: eventos-chave, obstáculos, variáveis críticas, riscos, consequências em 12 meses. Use markdown.",
        contexto: simContext,
      });
      setSimResult(text);
      setGlobalAnalysis(text);
      await persist("lab_simulacao", `Simulação · ${simContext.slice(0, 50)}`, { simContext, text });
      toast.success("Simulação executada.");
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  // === ENGENHARIA REVERSA ===
  const runEngenharia = async () => {
    if (!objetivo.trim()) return toast.error("Defina o objetivo.");
    setRunning(true);
    try {
      const text = await callAI("lab_engenharia_reversa", {
        instrucao: `Faça engenharia reversa do objetivo de longo prazo. Conecte futuro ↔ presente em 5 camadas: (1) Estado Final, (2) Habilidades necessárias, (3) Sistemas/processos, (4) Hábitos diários, (5) Ações desta semana. Horizonte: ${horizonte}. Use markdown estruturado.`,
        objetivo,
      });
      setReverseResult(text);
      setGlobalAnalysis(text);
      await persist("lab_engenharia", `Engenharia Reversa · ${objetivo.slice(0, 50)}`, { objetivo, horizonte, text });
      toast.success("Trajetória reversa mapeada.");
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  // === SISTEMAS COMPLEXOS ===
  const runSistemas = async () => {
    if (!systemDesc.trim()) return toast.error("Descreva o sistema.");
    setRunning(true);
    try {
      const text = await callAI("lab_sistemas_complexos", {
        instrucao: `Modele o sistema complexo descrito (${systemKind}). Identifique: agentes, variáveis dinâmicas, loops de feedback (positivos/negativos), pontos de alavancagem, fragilidades, choques possíveis e impactos em cadeia. Simule 1 mudança disruptiva e descreva os efeitos em 3 horizontes (curto, médio, longo). Use markdown.`,
        sistema: systemDesc,
      });
      setSystemResult(text);
      setGlobalAnalysis(text);
      await persist("lab_sistemas", `Sistema · ${systemKind}`, { systemKind, systemDesc, text });
      toast.success("Sistema modelado.");
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  // === XADREZ ESTRATÉGICO ===
  const startChess = async () => {
    setRunning(true);
    try {
      const text = await callAI("lab_xadrez", {
        instrucao: `Você está conduzindo uma simulação estratégica estilo xadrez. Cenário: "${scenario}". Apresente o estado inicial em 3 frases, depois introduza o PRIMEIRO obstáculo crítico e termine perguntando: "Qual sua próxima jogada?". Tom: frio, militar, preciso.`,
      });
      setChessLog([{ role: "ia", text }]);
      setGlobalAnalysis(text);
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  const playChessMove = async () => {
    if (!decisao.trim()) return;
    const userMove = decisao;
    setChessLog((l) => [...l, { role: "user", text: userMove }]);
    setDecisao("");
    setRunning(true);
    try {
      const historico = chessLog.map((l) => `${l.role === "ia" ? "IA" : "JOGADOR"}: ${l.text}`).join("\n");
      const text = await callAI("lab_xadrez_jogada", {
        instrucao: `Continue a simulação estratégica do cenário "${scenario}". Avalie a jogada do usuário (qualidade estratégica, riscos ignorados, consequências de 2ª e 3ª ordem). Em seguida, altere variáveis, gere pressão, introduza novo obstáculo e termine perguntando "Qual sua próxima jogada?". Use markdown.`,
        historico,
        ultima_jogada: userMove,
      });
      setChessLog((l) => [...l, { role: "ia", text }]);
      setGlobalAnalysis(text);
      await persist("lab_xadrez", `Xadrez · ${scenario}`, { scenario, log: [...chessLog, { role: "user", text: userMove }, { role: "ia", text }] });
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  // === ANÁLISE COGNITIVA GLOBAL ===
  const runCognitiveAnalysis = async () => {
    setRunning(true);
    try {
      const { data: recent } = await supabase
        .from("journal_entries")
        .select("module,title,content,created_at")
        .like("module", "lab_%")
        .order("created_at", { ascending: false })
        .limit(20);
      const text = await callAI("lab_analise_cognitiva", {
        instrucao: "Analise os exercícios estratégicos recentes do usuário. Avalie em 0-100: profundidade estratégica, qualidade de previsões, complexidade causal, clareza de raciocínio, número de variáveis consideradas, capacidade de antecipação. Detecte padrões cognitivos, vícios de pensamento, pontos cegos. Inclua bloco <metrics> JSON.",
        exercicios: recent,
      });
      setGlobalAnalysis(text);
      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope: "lab_cognitivo", content: text,
      });
      toast.success("Análise cognitiva concluída.");
    } catch (e: any) { toast.error(e.message ?? "Falha"); }
    finally { setRunning(false); }
  };

  return (
    <ModulePage
      code="// LAB 04.5"
      title="Laboratório Estratégico"
      subtitle="Academia cognitiva · simulação · engenharia reversa · sistemas complexos."
    >
      <HudCard title="LABORATÓRIO COGNITIVO ESTRATÉGICO">
        <div className="flex items-start gap-3">
          <FlaskConical className="size-5 text-primary mt-1" />
          <div className="flex-1">
            <div className="font-display text-foreground">Treinamento deliberado de inteligência estratégica</div>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">
              Pensamento de longo prazo · sistêmico · simulação mental · previsão de consequências · decisão sob pressão.
            </p>
          </div>
          <Button onClick={runCognitiveAnalysis} disabled={running} variant="outline" size="sm" className="font-mono text-[10px] tracking-widest">
            <Brain className="size-3 mr-2" /> ANÁLISE COGNITIVA
          </Button>
        </div>
      </HudCard>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="bg-card/40 border border-border/40 flex-wrap h-auto">
          <TabsTrigger value="decima" className="font-mono text-[10px] tracking-widest">
            <Network className="size-3 mr-2" /> DÉCIMA ORDEM
          </TabsTrigger>
          <TabsTrigger value="simulacao" className="font-mono text-[10px] tracking-widest">
            <GitBranch className="size-3 mr-2" /> SIMULAÇÃO
          </TabsTrigger>
          <TabsTrigger value="engenharia" className="font-mono text-[10px] tracking-widest">
            <Activity className="size-3 mr-2" /> ENG. REVERSA
          </TabsTrigger>
          <TabsTrigger value="sistemas" className="font-mono text-[10px] tracking-widest">
            <Globe2 className="size-3 mr-2" /> SISTEMAS
          </TabsTrigger>
          <TabsTrigger value="xadrez" className="font-mono text-[10px] tracking-widest">
            <Crown className="size-3 mr-2" /> XADREZ
          </TabsTrigger>
        </TabsList>

        {/* DÉCIMA ORDEM */}
        <TabsContent value="decima" className="space-y-4 mt-4">
          <HudCard title="♟ PENSAMENTO DE DÉCIMA ORDEM">
            <p className="text-[11px] text-muted-foreground font-mono mb-3">
              Insira uma ação, decisão ou evento. A IA expande consequências em cadeia até a 10ª ordem.
            </p>
            <Textarea
              value={acaoBase}
              onChange={(e) => setAcaoBase(e.target.value)}
              placeholder='Ex: "Decido sair do emprego para empreender em IA"'
              className="min-h-[80px] bg-background/40 font-mono text-sm"
            />
            <Button onClick={expandirDecima} disabled={running} className="mt-3 font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {running ? "PROJETANDO..." : "EXPANDIR 10 ORDENS"}
            </Button>
          </HudCard>

          <div className="space-y-2">
            {ordens.map((c, i) => (
              <div key={i} className="hud-panel p-3 flex gap-3 items-start">
                <div className="size-8 shrink-0 rounded border border-primary/40 flex items-center justify-center font-mono text-[11px] text-primary hud-text-glow">
                  {i + 1}ª
                </div>
                <Textarea
                  value={c}
                  onChange={(e) => { const arr = [...ordens]; arr[i] = e.target.value; setOrdens(arr); }}
                  placeholder={`Consequência de ordem ${i + 1}...`}
                  className="min-h-[50px] bg-background/40 font-mono text-xs flex-1"
                />
                {i < 9 && <ChevronRight className="size-4 text-primary/50 mt-3" />}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* SIMULAÇÃO */}
        <TabsContent value="simulacao" className="space-y-4 mt-4">
          <HudCard title="🧩 SIMULAÇÃO ESTRATÉGICA · CENÁRIOS ALTERNATIVOS">
            <p className="text-[11px] text-muted-foreground font-mono mb-3">
              Descreva uma decisão, projeto ou aposta. A IA simula 5 futuros: sucesso extremo, médio, fracasso, crise, oportunidade oculta.
            </p>
            <Textarea
              value={simContext}
              onChange={(e) => setSimContext(e.target.value)}
              placeholder="Contexto, decisão atual, recursos, restrições, objetivo..."
              className="min-h-[120px] bg-background/40 font-mono text-sm"
            />
            <Button onClick={runSimulacao} disabled={running} className="mt-3 font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {running ? "SIMULANDO..." : "EXECUTAR SIMULAÇÃO"}
            </Button>
          </HudCard>
          {simResult && (
            <HudCard title="RESULTADO · 5 CENÁRIOS">
              <div className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed max-h-[480px] overflow-auto">
                {simResult}
              </div>
            </HudCard>
          )}
        </TabsContent>

        {/* ENGENHARIA REVERSA */}
        <TabsContent value="engenharia" className="space-y-4 mt-4">
          <HudCard title="🔄 ENGENHARIA REVERSA · FUTURO ↔ PRESENTE">
            <p className="text-[11px] text-muted-foreground font-mono mb-3">
              Objetivo gigante → habilidades → sistemas → hábitos → ações desta semana.
            </p>
            <div className="space-y-2">
              <Textarea
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder='Ex: "Construir uma empresa de IA cognitiva avaliada em $100M"'
                className="min-h-[100px] bg-background/40 font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest">HORIZONTE:</span>
                {["1 ano", "3 anos", "5 anos", "10 anos"].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizonte(h)}
                    className={`px-2 py-1 border rounded font-mono text-[10px] ${
                      horizonte === h ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/50"
                    }`}
                  >{h}</button>
                ))}
              </div>
            </div>
            <Button onClick={runEngenharia} disabled={running} className="mt-3 font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {running ? "MAPEANDO..." : "REVERTER TRAJETÓRIA"}
            </Button>
          </HudCard>
          {reverseResult && (
            <HudCard title="TRAJETÓRIA REVERSA">
              <div className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed max-h-[480px] overflow-auto">
                {reverseResult}
              </div>
            </HudCard>
          )}
        </TabsContent>

        {/* SISTEMAS COMPLEXOS */}
        <TabsContent value="sistemas" className="space-y-4 mt-4">
          <HudCard title="🌍 MODELAGEM DE SISTEMAS COMPLEXOS">
            <div className="flex flex-wrap gap-2 mb-3">
              {["Mercado", "Empresa", "Tecnologia", "IA", "Sociedade", "Comportamento Humano", "Geopolítica", "Sistema Global"].map((k) => (
                <button
                  key={k}
                  onClick={() => setSystemKind(k)}
                  className={`px-3 py-1 border rounded font-mono text-[10px] tracking-widest ${
                    systemKind === k ? "border-primary bg-primary/10 text-primary hud-glow" : "border-border/40 text-muted-foreground hover:border-primary/50"
                  }`}
                >{k.toUpperCase()}</button>
              ))}
            </div>
            <Textarea
              value={systemDesc}
              onChange={(e) => setSystemDesc(e.target.value)}
              placeholder="Descreva o sistema, atores, variáveis conhecidas, contexto..."
              className="min-h-[120px] bg-background/40 font-mono text-sm"
            />
            <Button onClick={runSistemas} disabled={running} className="mt-3 font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {running ? "MODELANDO..." : "MODELAR SISTEMA"}
            </Button>
          </HudCard>
          {systemResult && (
            <HudCard title="MAPA SISTÊMICO · LOOPS · FRAGILIDADES">
              <div className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed max-h-[480px] overflow-auto">
                {systemResult}
              </div>
            </HudCard>
          )}
        </TabsContent>

        {/* XADREZ */}
        <TabsContent value="xadrez" className="space-y-4 mt-4">
          <HudCard title="♛ SIMULADOR ESTRATÉGICO AVANÇADO · XADREZ">
            <div className="flex flex-wrap gap-2 mb-3">
              {["Criar startup", "Construir empresa", "Crescer intelectualmente", "Liderar equipe", "Resolver crise", "Projeto tecnológico"].map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`px-3 py-1 border rounded font-mono text-[10px] tracking-widest ${
                    scenario === s ? "border-primary bg-primary/10 text-primary hud-glow" : "border-border/40 text-muted-foreground hover:border-primary/50"
                  }`}
                >{s.toUpperCase()}</button>
              ))}
            </div>
            <Button onClick={startChess} disabled={running} variant="outline" className="font-mono text-xs tracking-widest">
              <Crown className="size-3 mr-2" />
              {chessLog.length === 0 ? "INICIAR SIMULAÇÃO" : "REINICIAR"}
            </Button>
          </HudCard>

          {chessLog.length > 0 && (
            <HudCard title={`PARTIDA · ${scenario.toUpperCase()}`}>
              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                {chessLog.map((m, i) => (
                  <div key={i} className={`p-3 rounded border ${
                    m.role === "ia"
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/40 bg-card/40 ml-8"
                  }`}>
                    <div className="font-mono text-[10px] tracking-widest mb-1 text-primary">
                      {m.role === "ia" ? "▲ IA NÚCLEO" : "◆ JOGADOR"}
                    </div>
                    <div className="text-xs whitespace-pre-wrap font-mono text-foreground/90 leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Input
                  value={decisao}
                  onChange={(e) => setDecisao(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !running) playChessMove(); }}
                  placeholder="Sua próxima jogada estratégica..."
                  className="bg-background/40 font-mono text-sm"
                />
                <Button onClick={playChessMove} disabled={running || !decisao.trim()} className="font-mono text-xs tracking-widest">
                  JOGAR
                </Button>
              </div>
            </HudCard>
          )}
        </TabsContent>
      </Tabs>

      {globalAnalysis && (
        <HudCard title="ANÁLISE COGNITIVA · NÚCLEO">
          <div className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-auto">
            {globalAnalysis}
          </div>
        </HudCard>
      )}

      <HudCard title="HISTÓRICO · LABORATÓRIO">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum exercício registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 p-2 border border-border/40 rounded">
                <FlaskConical className="size-4 text-primary" />
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
