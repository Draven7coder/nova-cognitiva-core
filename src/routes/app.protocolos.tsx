import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Brain, Target, AlertTriangle, Fingerprint, Sun, Moon, CalendarDays,
  Sparkles, Activity, Plus, X,
} from "lucide-react";

export const Route = createFileRoute("/app/protocolos")({ component: Protocolos });

const SABOTAGE_RADAR = [
  { id: "consumo", label: "Consumo Passivo" },
  { id: "celular", label: "Excesso de Celular" },
  { id: "dispersao", label: "Dispersão" },
  { id: "hiperplan", label: "Hiperplanejamento" },
  { id: "emocional", label: "Procrastinação Emocional" },
  { id: "fuga", label: "Fuga de Desconforto" },
];

type Section = "matinal" | "noturno" | "semanal";

function Protocolos() {
  const { user } = useAuth();
  const initialHash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const [tab, setTab] = useState<Section>(
    (["matinal","noturno","semanal"].includes(initialHash) ? initialHash : "matinal") as Section
  );

  // Matinal state
  const [descarga, setDescarga] = useState("");
  const [prioridades, setPrioridades] = useState<string[]>(["", "", ""]);
  const [riscos, setRiscos] = useState("");
  const [seThen, setSeThen] = useState<{ se: string; entao: string }[]>([{ se: "", entao: "" }]);
  const [radar, setRadar] = useState<Record<string, number>>({});
  const [identidade, setIdentidade] = useState("");

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

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .like("module", "protocolo_%")
        .order("created_at", { ascending: false })
        .limit(10);
      setHistory(data ?? []);
    })();
  }, [user]);

  const saveSection = async (module: string, payload: any, title: string) => {
    if (!user) return;
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      module,
      title,
      content: JSON.stringify(payload),
    });
    if (error) return toast.error(error.message);
    toast.success("Protocolo registrado no NÚCLEO.");
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .like("module", "protocolo_%")
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
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
    const payload = { descarga, prioridades, riscos, seThen, radar, identidade };
    await saveSection("protocolo_matinal", payload, "Protocolo Matinal");
    await runAnalysis("matinal", payload);
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

  return (
    <ModulePage
      code="// PROTO 07"
      title="Protocolos Operacionais"
      subtitle="Motor comportamental · alinhamento entre mente, identidade e execução."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as Section)}>
        <TabsList className="bg-card/40 border border-border/40">
          <TabsTrigger value="matinal" className="font-mono text-[10px] tracking-widest">
            <Sun className="size-3 mr-2" /> MATINAL
          </TabsTrigger>
          <TabsTrigger value="noturno" className="font-mono text-[10px] tracking-widest">
            <Moon className="size-3 mr-2" /> NOTURNO
          </TabsTrigger>
          <TabsTrigger value="semanal" className="font-mono text-[10px] tracking-widest">
            <CalendarDays className="size-3 mr-2" /> SEMANAL
          </TabsTrigger>
        </TabsList>

        {/* MATINAL */}
        <TabsContent value="matinal" className="space-y-4 mt-4">
          <HudCard title="PROTOCOLO MATINAL · MODO EXECUÇÃO">
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              5–10 min · alinhar foco, reduzir ruído mental, antecipar sabotagens e reforçar identidade operacional.
            </p>
          </HudCard>

          <div id="descarga" className="grid lg:grid-cols-2 gap-4">
            <HudCard title="01 · DESCARGA MENTAL">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Brain className="size-4" />
                <span className="font-display text-sm">Esvaziar para operar</span>
              </div>
              <Textarea
                value={descarga}
                onChange={(e) => setDescarga(e.target.value)}
                placeholder="Descarregue pensamentos, ansiedade, loops internos. Sem filtro."
                className="min-h-[180px] bg-background/40 font-mono text-sm"
              />
            </HudCard>

            <HudCard title="02 · PRIORIDADES REAIS" >
              <div className="flex items-center gap-2 text-primary mb-2" id="prioridades">
                <Target className="size-4" />
                <span className="font-display text-sm">1 a 3 alvos críticos</span>
              </div>
              <div className="space-y-2">
                {prioridades.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-primary w-6">P{i + 1}</span>
                    <Input
                      value={p}
                      onChange={(e) => {
                        const arr = [...prioridades];
                        arr[i] = e.target.value;
                        setPrioridades(arr);
                      }}
                      placeholder={`Alvo crítico ${i + 1}`}
                      className="bg-background/40 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 font-mono">
                Clareza &gt; quantidade. Impacto &gt; ocupação.
              </p>
            </HudCard>
          </div>

          <div id="risco" className="grid lg:grid-cols-2 gap-4">
            <HudCard title="03 · RISCO / SABOTAGEM">
              <div className="flex items-center gap-2 text-primary mb-2">
                <AlertTriangle className="size-4" />
                <span className="font-display text-sm">Antecipar para neutralizar</span>
              </div>
              <Textarea
                value={riscos}
                onChange={(e) => setRiscos(e.target.value)}
                placeholder="Distrações prováveis, impulsos, padrões de fuga..."
                className="min-h-[100px] bg-background/40 font-mono text-sm mb-3"
              />
              <div className="space-y-2">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">PROTOCOLO IF/THEN</div>
                {seThen.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={row.se}
                      onChange={(e) => {
                        const arr = [...seThen]; arr[i].se = e.target.value; setSeThen(arr);
                      }}
                      placeholder="Se X acontecer..."
                      className="bg-background/40 font-mono text-xs"
                    />
                    <span className="font-mono text-primary text-xs">→</span>
                    <Input
                      value={row.entao}
                      onChange={(e) => {
                        const arr = [...seThen]; arr[i].entao = e.target.value; setSeThen(arr);
                      }}
                      placeholder="...eu faço Y"
                      className="bg-background/40 font-mono text-xs"
                    />
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => setSeThen(seThen.filter((_, idx) => idx !== i))}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm" variant="ghost"
                  onClick={() => setSeThen([...seThen, { se: "", entao: "" }])}
                  className="font-mono text-[10px]"
                >
                  <Plus className="size-3 mr-1" /> ADICIONAR REGRA
                </Button>
              </div>
            </HudCard>

            <HudCard title="RADAR DE SABOTAGEM">
              <div className="font-mono text-[10px] text-muted-foreground mb-3">
                Avalie risco de cada padrão hoje (0–5)
              </div>
              <div className="space-y-2">
                {SABOTAGE_RADAR.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="flex-1 text-xs">{s.label}</div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRadar({ ...radar, [s.id]: n })}
                          className={`size-5 rounded border text-[10px] font-mono transition-colors ${
                            (radar[s.id] ?? 0) >= n && n > 0
                              ? "bg-primary/30 border-primary text-primary"
                              : "border-border/50 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </HudCard>
          </div>

          <HudCard title="04 · REFORÇO DE IDENTIDADE">
            <div className="flex items-center gap-2 text-primary mb-2" id="identidade">
              <Fingerprint className="size-4" />
              <span className="font-display text-sm">Programar a autoimagem operacional</span>
            </div>
            <Textarea
              value={identidade}
              onChange={(e) => setIdentidade(e.target.value)}
              placeholder='Ex: "eu executo mesmo sem vontade", "eu resolvo o difícil primeiro", "eu não negocio com distração"'
              className="min-h-[100px] bg-background/40 font-mono text-sm"
            />
          </HudCard>

          <div className="flex justify-end">
            <Button onClick={submitMatinal} disabled={analyzing} className="font-mono text-xs tracking-widest">
              <Sparkles className="size-3 mr-2" />
              {analyzing ? "ANALISANDO..." : "FINALIZAR PROTOCOLO MATINAL"}
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
