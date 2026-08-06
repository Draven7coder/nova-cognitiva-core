import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/revisao")({ component: RevisaoPage });

// SM-2 simplificado
function schedule(card: any, quality: number) {
  let ease = Number(card.ease ?? 2.5);
  let interval = Number(card.interval_days ?? 0);
  let reps = Number(card.reps ?? 0);
  let lapses = Number(card.lapses ?? 0);
  if (quality < 3) {
    reps = 0; interval = 1; lapses += 1;
  } else {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  const due = new Date(Date.now() + interval * 86400000).toISOString();
  return { ease, interval_days: interval, reps, lapses, due_at: due };
}

function RevisaoPage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [cards, setCards] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", deck: "geral" });
  const [material, setMaterial] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await sb.from("review_cards").select("*").order("due_at", { ascending: true });
    setCards(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const due = useMemo(() => cards.filter((c) => new Date(c.due_at).getTime() <= Date.now()), [cards]);
  const current = due[idx] ?? null;

  const answer = async (quality: number) => {
    if (!current) return;
    await sb.from("review_cards").update(schedule(current, quality)).eq("id", current.id);
    setRevealed(false);
    setIdx((i) => i + 1);
    load();
  };

  const addCard = async () => {
    if (!user || !form.front.trim() || !form.back.trim()) return;
    await sb.from("review_cards").insert({ user_id: user.id, front: form.front, back: form.back, deck: form.deck || "geral" });
    setForm({ front: "", back: "", deck: form.deck });
    load();
    toast.success("Cartão criado.");
  };

  const generate = async () => {
    if (!user || !material.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: { scope: "cards", context: { material, deck: form.deck || "geral" } },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const gen = ((data as any).cards ?? []) as any[];
      if (!gen.length) throw new Error("A IA não retornou cartões.");
      await sb.from("review_cards").insert(gen.slice(0, 12).map((c) => ({
        user_id: user.id, front: String(c.front ?? ""), back: String(c.back ?? ""),
        deck: c.deck || form.deck || "geral", source: "IA",
      })));
      setMaterial("");
      load();
      toast.success(`${gen.length} cartões gerados.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => { await sb.from("review_cards").delete().eq("id", id); load(); };

  return (
    <ModulePage
      code="// REV 26"
      title="Revisão Espaçada"
      subtitle="Cartões gerados pela leitura, pelas aulas ou por você · algoritmo SM-2."
      explanation="Cada cartão volta no intervalo calculado pelo seu desempenho: Errei reinicia, Difícil encurta, Fácil estica. Cartões da leitura entram aqui automaticamente."
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <HudCard title={`SESSÃO DE HOJE · ${Math.max(0, due.length - idx)} PENDENTES`}>
            {!current ? (
              <div className="text-xs font-mono text-muted-foreground py-12 text-center">
                <Layers className="size-5 mx-auto mb-2 text-primary/60" />
                Nenhum cartão vencido. Volte depois ou gere novos cartões.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-primary/30 rounded p-6 min-h-[140px] flex items-center justify-center text-center">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.3em] text-primary/70 mb-2">{revealed ? "RESPOSTA" : "PERGUNTA"}</div>
                    <div className="text-sm whitespace-pre-wrap">{revealed ? current.back : current.front}</div>
                  </div>
                </div>
                {!revealed ? (
                  <Button onClick={() => setRevealed(true)} className="w-full font-mono text-xs tracking-widest hud-glow">REVELAR</Button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => answer(1)} className="font-mono text-[10px] tracking-widest">ERREI</Button>
                    <Button variant="outline" onClick={() => answer(3)} className="font-mono text-[10px] tracking-widest">DIFÍCIL</Button>
                    <Button onClick={() => answer(5)} className="font-mono text-[10px] tracking-widest hud-glow">FÁCIL</Button>
                  </div>
                )}
              </div>
            )}
          </HudCard>

          <HudCard title="TODOS OS CARTÕES">
            {cards.length === 0 && <div className="text-[11px] text-muted-foreground">Nenhum cartão ainda.</div>}
            <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
              {cards.map((c) => (
                <div key={c.id} className="flex items-start gap-2 border border-border/40 rounded p-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{c.front}</div>
                    <div className="font-mono text-[9px] text-muted-foreground">
                      {c.deck} · próxima: {new Date(c.due_at).toLocaleDateString("pt-BR")} · {c.reps} reps
                    </div>
                  </div>
                  <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="GERAR COM IA">
            <Textarea value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Cole aqui o material (resumo, trecho, anotação)..." className="min-h-[140px] text-xs" />
            <Button onClick={generate} disabled={busy} size="sm" className="w-full mt-2 font-mono text-[10px] tracking-widest hud-glow">
              <Sparkles className="size-3 mr-1" /> {busy ? "GERANDO..." : "GERAR CARTÕES"}
            </Button>
          </HudCard>

          <HudCard title="CARTÃO MANUAL">
            <div className="space-y-2">
              <Input value={form.deck} onChange={(e) => setForm({ ...form, deck: e.target.value })} placeholder="Deck" />
              <Textarea value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} placeholder="Frente (pergunta)" className="min-h-[70px] text-xs" />
              <Textarea value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} placeholder="Verso (resposta)" className="min-h-[70px] text-xs" />
              <Button onClick={addCard} size="sm" variant="outline" className="w-full font-mono text-[10px] tracking-widest">
                <Plus className="size-3 mr-1" /> CRIAR CARTÃO
              </Button>
            </div>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
