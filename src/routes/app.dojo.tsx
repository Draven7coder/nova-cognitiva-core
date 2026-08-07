import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dojo")({
  component: DojoPage,
  head: () => ({
    meta: [
      { title: "Dojo da Vontade · Núcleo Supremo" },
      { name: "description", content: "Treine desconforto voluntário: desafios diários, nível de dor, callus mental e os 5 pilares da vontade." },
      { property: "og:title", content: "Dojo da Vontade · Núcleo Supremo" },
      { property: "og:description", content: "Desconforto voluntário registrado e medido — forja da vontade operacional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const PILARES = [
  { t: "Regra dos 40%", d: "Quando a mente diz 'acabou', você usou 40% da capacidade. O resto é território não explorado." },
  { t: "Callus Mental", d: "Cada desconforto vencido vira calo. Repetição sob dor constrói blindagem psicológica." },
  { t: "Cookie Jar", d: "Banco de vitórias passadas. Em colapso, você saca uma memória de superação como combustível." },
  { t: "Espelho da Responsabilidade", d: "Confronto diário sem álibi. Sem plateia, sem desculpa, sem negociação." },
  { t: "Taking Souls", d: "Transformar o momento em que o outro (ou a dor) espera sua desistência na sua maior arma." },
];

const CATEGORIAS = ["físico", "mental", "social", "disciplina", "privação"];

function DojoPage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [rows, setRows] = useState<any[]>([]);
  const [challenge, setChallenge] = useState("");
  const [category, setCategory] = useState(CATEGORIAS[0]);
  const [level, setLevel] = useState(5);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const { data } = await sb.from("will_dojo_sessions").select("*").order("created_at", { ascending: false }).limit(60);
    setRows(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const add = async () => {
    if (!challenge.trim() || !user) { toast.error("Descreva o desafio."); return; }
    const { error } = await sb.from("will_dojo_sessions").insert({
      user_id: user.id, challenge, category, discomfort_level: level, duration_min: duration, notes,
    });
    if (error) return toast.error(error.message);
    setChallenge(""); setNotes(""); setDuration(0);
    toast.success("Desafio registrado.");
    load();
  };

  const complete = async (r: any) => {
    await sb.from("will_dojo_sessions").update({ completed: !r.completed }).eq("id", r.id);
    load();
  };

  const remove = async (r: any) => { await sb.from("will_dojo_sessions").delete().eq("id", r.id); load(); };

  const done = rows.filter((r) => r.completed).length;
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + (r.discomfort_level ?? 0), 0) / rows.length) : 0;

  return (
    <ModulePage
      code="// DOJ 29"
      title="Dojo da Vontade"
      subtitle="Desconforto voluntário como treino. Vontade não é traço — é músculo sob carga."
      explanation="Registre desafios de desconforto deliberado (frio, jejum, silêncio, confronto, esforço além do limite). Marque como concluído para acumular callus mental. Os 5 pilares são a base filosófica do módulo."
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <HudCard title="NOVO DESAFIO">
            <div className="space-y-3">
              <Input value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="Ex.: Banho gelado 5min sem negociar" />
              <div className="flex flex-wrap gap-1">
                {CATEGORIAS.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-2 py-1 rounded border font-mono text-[10px] tracking-widest transition ${category === c ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">DESCONFORTO · {level}/10</div>
                  <input type="range" min={1} max={10} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">DURAÇÃO (MIN)</div>
                  <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
              </div>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="O que sua mente disse pra você parar?" className="min-h-[70px]" />
              <Button onClick={add} className="w-full font-mono text-xs tracking-widest hud-glow">
                <Flame className="size-3 mr-2" /> REGISTRAR
              </Button>
            </div>
          </HudCard>

          <HudCard title="HISTÓRICO">
            <div className="space-y-2">
              {rows.length === 0 && <div className="text-xs text-muted-foreground">Nenhum desafio registrado.</div>}
              {rows.map((r) => (
                <div key={r.id} className="flex items-start gap-2 p-2 rounded border border-border/40">
                  <button onClick={() => complete(r)} className={`mt-0.5 size-4 rounded border flex items-center justify-center shrink-0 ${r.completed ? "border-primary bg-primary/20" : "border-border"}`}>
                    {r.completed && <Check className="size-3 text-primary" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${r.completed ? "line-through text-muted-foreground" : ""}`}>{r.challenge}</div>
                    <div className="font-mono text-[9px] tracking-widest text-muted-foreground">
                      {String(r.category).toUpperCase()} · DOR {r.discomfort_level}/10 · {r.duration_min}MIN · {r.log_date}
                    </div>
                    {r.notes && <div className="text-[11px] text-muted-foreground mt-1">{r.notes}</div>}
                  </div>
                  <button onClick={() => remove(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="CALLUS MENTAL">
            <div className="font-display text-3xl text-primary hud-text-glow">{done}</div>
            <div className="font-mono text-[10px] text-muted-foreground">desafios vencidos · dor média {avg}/10</div>
          </HudCard>
          <HudCard title="5 PILARES">
            <div className="space-y-3">
              {PILARES.map((p) => (
                <div key={p.t}>
                  <div className="font-mono text-[11px] tracking-wider text-primary">{p.t}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{p.d}</div>
                </div>
              ))}
            </div>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
