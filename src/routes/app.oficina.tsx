import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hammer, Mic, MicOff, Send, Trash2, Volume2, VolumeX, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/oficina")({ component: OficinaPage });

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };

function OficinaPage() {
  const { user } = useAuth();
  const [chat, setChat] = useState<Msg[]>([]);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [thermo, setThermo] = useState(5);
  const [recording, setRecording] = useState(false);
  const [ttsOn, setTtsOn] = useState(false);
  const recRef = useRef<any>(null);

  const load = async () => {
    if (!user) return;
    const sb: any = supabase;
    const { data } = await sb.from("oficina_messages").select("*").order("created_at", { ascending: true }).limit(120);
    setChat((data ?? []) as Msg[]);
  };
  useEffect(() => { load(); }, [user]);

  const speak = (text: string) => {
    if (!ttsOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  };

  const send = async (raw?: string) => {
    const text = (raw ?? msg).trim();
    if (!text || !user || sending) return;
    setSending(true);
    const sb: any = supabase;
    const optimistic: Msg = { id: `tmp-${Date.now()}`, role: "user", content: text, created_at: new Date().toISOString() };
    setChat((c) => [...c, optimistic]);
    setMsg("");
    try {
      await sb.from("oficina_messages").insert({ user_id: user.id, role: "user", content: text });
      const [{ data: journal }, { data: missions }, { data: ooda }] = await Promise.all([
        supabase.from("journal_entries").select("title,content,module,created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("missions").select("title,status,type,streak").limit(20),
        supabase.from("ooda_entries").select("tag,observe,orient,decide,act,created_at").order("created_at", { ascending: false }).limit(6),
      ]);
      const history = [...chat, optimistic].slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "oficina_chat",
          context: {
            message: text,
            history,
            operational: { journal_recent: journal, missions, ooda_recent: ooda, thermometer: thermo, now: new Date().toISOString() },
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const reply = ((data as any).content ?? "").trim() || "…";
      await sb.from("oficina_messages").insert({ user_id: user.id, role: "assistant", content: reply });
      speak(reply);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Falha na oficina");
      setChat((c) => c.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    const sb: any = supabase;
    await sb.from("oficina_messages").delete().eq("user_id", user.id);
    setChat([]);
  };

  const toggleMic = () => {
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { toast.error("Reconhecimento de voz não suportado neste navegador."); return; }
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (evt: any) => {
      const transcript = Array.from(evt.results).map((r: any) => r[0].transcript).join(" ");
      setMsg((m) => (m ? m + " " + transcript : transcript));
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  return (
    <ModulePage
      code="// OFC 23"
      title="OFICINA DO EU · JARVIS"
      subtitle="Mestre de Obras da Mente. Demolição de padrões, ressignificação de traumas, missão de campo."
    >
      <HudCard title="🔨 CICLO RAÇA · 5 PASSOS">
        <div className="grid md:grid-cols-5 gap-2 text-xs">
          {["MAPEAR", "RASTREAR", "DESMONTAR", "RESSIGNIFICAR", "MISSÃO DE CAMPO"].map((s, i) => (
            <div key={s} className="hud-panel p-2 border border-primary/30 text-center">
              <div className="font-mono text-[9px] text-primary/70">{i + 1}</div>
              <div className="font-display text-sm">{s}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-mono text-muted-foreground mt-3 italic">
          "O chão de fábrica é a vida real. É lá que a gente faz a manutenção."
        </p>
      </HudCard>

      <HudCard title="🌡️ TERMÔMETRO EMOCIONAL">
        <div className="flex items-center gap-3">
          <Flame className="size-4 text-amber-400" />
          <input
            type="range" min={1} max={10} value={thermo}
            onChange={(e) => setThermo(parseInt(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="font-display text-2xl text-primary hud-text-glow w-8 text-right">{thermo}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
          <span>DESLIGADO</span><span>NEUTRO</span><span>QUEIMANDO</span>
        </div>
      </HudCard>

      <HudCard title="CONVERSA COM O MESTRE DE OBRAS">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setTtsOn((v) => !v)} className="font-mono text-[10px]">
              {ttsOn ? <Volume2 className="size-3 mr-1" /> : <VolumeX className="size-3 mr-1" />}
              VOZ {ttsOn ? "ON" : "OFF"}
            </Button>
          </div>
          {chat.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearChat} className="font-mono text-[10px]">
              <Trash2 className="size-3 mr-1" /> LIMPAR
            </Button>
          )}
        </div>
        <div className="max-h-[420px] overflow-auto space-y-3 mb-3">
          {chat.length === 0 ? (
            <div className="text-xs font-mono text-muted-foreground py-4 text-center">
              Fala, operário. Traz o padrão que você quer demolir hoje.
            </div>
          ) : chat.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/15 border border-primary/30 text-foreground"
                  : "bg-input/30 border border-border/40 text-foreground/90"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-input/30 border border-border/40 rounded px-3 py-2 text-xs font-mono text-muted-foreground">
                Mestre pensando<span className="animate-pulse">...</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-end">
          <Textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Manda o que tá pegando..."
            className="min-h-[52px] bg-input/40 font-mono text-xs resize-none"
            disabled={sending}
          />
          <Button
            onClick={toggleMic}
            variant={recording ? "default" : "outline"}
            className={`font-mono text-[10px] ${recording ? "animate-pulse-ring" : ""}`}
          >
            {recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </Button>
          <Button onClick={() => send()} disabled={sending || !msg.trim()} className="font-mono text-[10px]">
            <Send className="size-3 mr-1" /> ENVIAR
          </Button>
        </div>
      </HudCard>

      <HudCard title="🔧 FERRAMENTAS DA OFICINA">
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          <div className="hud-panel p-3 border border-border/40">
            <Hammer className="size-4 text-primary mb-1" />
            <div className="font-display text-sm">Martelo da Pergunta Poderosa</div>
            <p className="text-muted-foreground text-[11px] mt-1">Rompe a narrativa emocional com uma pergunta que não dá pra fugir.</p>
          </div>
          <div className="hud-panel p-3 border border-border/40">
            <Hammer className="size-4 text-primary mb-1" />
            <div className="font-display text-sm">Chave Inglesa do Contraponto</div>
            <p className="text-muted-foreground text-[11px] mt-1">Aperta a crença até você ver o parafuso solto por trás dela.</p>
          </div>
          <div className="hud-panel p-3 border border-border/40">
            <Hammer className="size-4 text-primary mb-1" />
            <div className="font-display text-sm">Lixa do Auto-perdão</div>
            <p className="text-muted-foreground text-[11px] mt-1">Tira a farpa do erro antigo sem esconder que o erro existiu.</p>
          </div>
        </div>
      </HudCard>
    </ModulePage>
  );
}
