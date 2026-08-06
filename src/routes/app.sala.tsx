import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Send, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sala")({ component: SalaPage });

type Msg = { role: "user" | "assistant"; content: string };

const ARCHETYPES = [
  { id: "Mentor Roxo", desc: "Síntese suprema — conecta tudo, exige profundidade." },
  { id: "O Socrático", desc: "Só pergunta. Nunca entrega resposta pronta." },
  { id: "O Engenheiro", desc: "Sistemas, causa e efeito, primeiros princípios." },
  { id: "O Estrategista", desc: "Tabuleiro, trade-offs, segunda ordem." },
  { id: "O Historiador", desc: "Contexto, linhagem das ideias, precedentes." },
  { id: "O Cientista", desc: "Hipótese, evidência, falseabilidade." },
  { id: "O Filósofo", desc: "Fundamento, ética, sentido." },
  { id: "O Executor", desc: "Como aplicar hoje, sem teoria inútil." },
  { id: "O Crítico", desc: "Ataca sua tese até ela resistir." },
  { id: "O Tradutor", desc: "Explica como se você tivesse 12 anos, sem perder rigor." },
];

function SalaPage() {
  const { user } = useAuth();
  const [archetype, setArchetype] = useState(ARCHETYPES[0].id);
  const [topic, setTopic] = useState("");
  const [board, setBoard] = useState("");
  const [chat, setChat] = useState<Msg[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [comp, setComp] = useState<{ score: number; gaps?: string[]; next_step?: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const sb: any = supabase;

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await sb.from("classroom_sessions").select("*").order("created_at", { ascending: false }).limit(12);
    setHistory(data ?? []);
  };
  useEffect(() => { loadHistory(); }, [user]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const persist = async (nextChat: Msg[], score: number) => {
    if (!user) return;
    const payload = {
      user_id: user.id, topic: topic || "Aula sem título", archetype,
      board_notes: board, transcript: nextChat, comprehension: score,
      xp: Math.round(score / 5), status: "active",
    };
    if (sessionId) await sb.from("classroom_sessions").update(payload).eq("id", sessionId);
    else {
      const { data } = await sb.from("classroom_sessions").insert(payload).select("id").maybeSingle();
      if (data?.id) setSessionId(data.id);
    }
    loadHistory();
  };

  const send = async () => {
    const text = msg.trim();
    if (!text || busy || !user) return;
    if (!topic.trim()) { toast.error("Defina o tema da aula."); return; }
    setBusy(true);
    const next = [...chat, { role: "user" as const, content: text }];
    setChat(next);
    setMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: { scope: "classroom", context: { archetype, topic, board_notes: board, history: next.slice(-14), message: text } },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const reply = (data as any).content as string;
      const c = (data as any).comprehension;
      const final = [...next, { role: "assistant" as const, content: reply }];
      setChat(final);
      if (c) setComp(c);
      await persist(final, c?.score ?? comp?.score ?? 0);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const openSession = (s: any) => {
    setSessionId(s.id); setTopic(s.topic); setArchetype(s.archetype);
    setBoard(s.board_notes ?? ""); setChat((s.transcript ?? []) as Msg[]);
    setComp({ score: s.comprehension ?? 0 });
  };

  const newSession = () => { setSessionId(null); setChat([]); setBoard(""); setTopic(""); setComp(null); };

  return (
    <ModulePage
      code="// SLA 24"
      title="Sala de Aula"
      subtitle="Aprendizado profundo com mentores-arquétipo, lousa de anotações e barra de compreensão."
      explanation="Escolha um arquétipo de mentor, defina o tema e converse. A lousa guarda suas anotações. A IA mede sua compreensão a cada resposta e converte em XP."
    >
      <div className="grid lg:grid-cols-[260px_1fr_280px] gap-4">
        <HudCard title="ARQUÉTIPOS">
          <div className="space-y-1">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setArchetype(a.id)}
                className={`w-full text-left p-2 rounded border transition ${archetype === a.id ? "border-primary/60 bg-primary/10" : "border-border/40 hover:border-primary/40"}`}
              >
                <div className="font-mono text-[11px] tracking-wider text-primary">{a.id}</div>
                <div className="text-[10px] text-muted-foreground leading-snug">{a.desc}</div>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={newSession} className="w-full mt-3 font-mono text-[10px] tracking-widest">
            NOVA AULA
          </Button>
        </HudCard>

        <div className="space-y-4">
          <HudCard title="TEMA DA AULA">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex.: Teoria dos jogos aplicada a negociação" />
          </HudCard>

          <HudCard title={`MENTOR · ${archetype.toUpperCase()}`}>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {chat.length === 0 && (
                <div className="text-xs font-mono text-muted-foreground py-8 text-center">
                  <GraduationCap className="size-5 mx-auto mb-2 text-primary/60" />
                  Defina o tema e faça a primeira pergunta.
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`text-sm whitespace-pre-wrap leading-relaxed p-3 rounded border ${m.role === "user" ? "border-border/40 bg-muted/20" : "border-primary/30 bg-primary/5"}`}>
                  <div className="font-mono text-[9px] tracking-[0.3em] mb-1 text-primary/70">{m.role === "user" ? "VOCÊ" : archetype.toUpperCase()}</div>
                  {m.content}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <Textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Pergunte, responda, defenda sua tese..."
                className="min-h-[64px]"
              />
              <Button onClick={send} disabled={busy} className="hud-glow self-end">
                <Send className="size-4" />
              </Button>
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="LOUSA">
            <Textarea value={board} onChange={(e) => setBoard(e.target.value)} placeholder="Anote os pontos-chave da aula..." className="min-h-[200px] font-mono text-xs" />
            <Button size="sm" variant="outline" onClick={() => persist(chat, comp?.score ?? 0).then(() => toast.success("Lousa salva."))} className="w-full mt-2 font-mono text-[10px] tracking-widest">
              <Save className="size-3 mr-1" /> SALVAR LOUSA
            </Button>
          </HudCard>

          <HudCard title="COMPREENSÃO">
            <div className="h-2 rounded bg-muted/40 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${comp?.score ?? 0}%` }} />
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-2">{comp?.score ?? 0}/100 · XP {Math.round((comp?.score ?? 0) / 5)}</div>
            {comp?.gaps?.length ? (
              <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground list-disc pl-4">
                {comp.gaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            ) : null}
            {comp?.next_step && (
              <div className="mt-3 text-[11px] text-primary/90 flex gap-1">
                <Sparkles className="size-3 mt-0.5 shrink-0" /> {comp.next_step}
              </div>
            )}
          </HudCard>

          <HudCard title="AULAS ANTERIORES">
            <div className="space-y-1">
              {history.length === 0 && <div className="text-[11px] text-muted-foreground">Nenhuma aula registrada.</div>}
              {history.map((s) => (
                <button key={s.id} onClick={() => openSession(s)} className="w-full text-left p-2 rounded border border-border/40 hover:border-primary/40 transition">
                  <div className="text-xs truncate">{s.topic}</div>
                  <div className="font-mono text-[9px] text-muted-foreground">{s.archetype} · {s.comprehension}/100</div>
                </button>
              ))}
            </div>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
