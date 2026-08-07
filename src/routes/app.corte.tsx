import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/corte")({
  component: CortePage,
  head: () => ({
    meta: [
      { title: "Ritual de Corte Consciente · Núcleo Supremo" },
      { name: "description", content: "Audite pessoas, hábitos, consumo e compromissos. Decida cortar, manter ou observar — autodireção sem ruído." },
      { property: "og:title", content: "Ritual de Corte Consciente · Núcleo Supremo" },
      { property: "og:description", content: "Ferramenta de autodireção: cortar o que drena, manter o que constrói." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const CATEGORIAS = ["pessoa", "hábito", "consumo", "compromisso", "crença"];
const DECISOES = ["observar", "cortar", "manter"];

const DEC_STYLE: Record<string, string> = {
  cortar: "border-destructive/50 bg-destructive/10 text-destructive",
  manter: "border-primary/50 bg-primary/10 text-primary",
  observar: "border-border/50 bg-muted/20 text-muted-foreground",
};

function CortePage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [rows, setRows] = useState<any[]>([]);
  const [item, setItem] = useState("");
  const [category, setCategory] = useState(CATEGORIAS[0]);
  const [reason, setReason] = useState("");

  const load = async () => {
    const { data } = await sb.from("cut_rituals").select("*").order("created_at", { ascending: false }).limit(100);
    setRows(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const add = async () => {
    if (!item.trim() || !user) { toast.error("Descreva o item."); return; }
    const { error } = await sb.from("cut_rituals").insert({ user_id: user.id, item, category, reason });
    if (error) return toast.error(error.message);
    setItem(""); setReason("");
    toast.success("Item na mesa de corte.");
    load();
  };

  const decide = async (r: any, decision: string) => {
    await sb.from("cut_rituals").update({ decision, executed_at: decision === "cortar" ? new Date().toISOString() : null }).eq("id", r.id);
    load();
  };

  const remove = async (r: any) => { await sb.from("cut_rituals").delete().eq("id", r.id); load(); };

  const count = (d: string) => rows.filter((r) => r.decision === d).length;

  return (
    <ModulePage
      code="// CUT 30"
      title="Ritual de Corte Consciente"
      subtitle="Cadeia 016 — o que você não corta, te corta. Auditoria fria do que ocupa espaço na sua vida."
      explanation="Liste pessoas, hábitos, consumos, compromissos e crenças. Para cada um, decida: CORTAR (drena e não retorna), MANTER (constrói) ou OBSERVAR (em análise). O corte é ritual, não impulso — registre o motivo antes de decidir."
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <HudCard title="MESA DE CORTE">
            <div className="space-y-3">
              <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ex.: Scroll noturno no celular" />
              <div className="flex flex-wrap gap-1">
                {CATEGORIAS.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-2 py-1 rounded border font-mono text-[10px] tracking-widest transition ${category === c ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="O que isso te custa? O que ele te dá em troca?" className="min-h-[70px]" />
              <Button onClick={add} className="w-full font-mono text-xs tracking-widest hud-glow">
                <Scissors className="size-3 mr-2" /> COLOCAR NA MESA
              </Button>
            </div>
          </HudCard>

          <HudCard title="AUDITORIA">
            <div className="space-y-2">
              {rows.length === 0 && <div className="text-xs text-muted-foreground">Nada na mesa de corte.</div>}
              {rows.map((r) => (
                <div key={r.id} className="p-2 rounded border border-border/40">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{r.item}</div>
                      <div className="font-mono text-[9px] tracking-widest text-muted-foreground">
                        {String(r.category).toUpperCase()}{r.executed_at ? ` · CORTADO ${new Date(r.executed_at).toLocaleDateString("pt-BR")}` : ""}
                      </div>
                      {r.reason && <div className="text-[11px] text-muted-foreground mt-1">{r.reason}</div>}
                    </div>
                    <button onClick={() => remove(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {DECISOES.map((d) => (
                      <button key={d} onClick={() => decide(r, d)}
                        className={`px-2 py-0.5 rounded border font-mono text-[9px] tracking-widest transition ${r.decision === d ? DEC_STYLE[d] : "border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="BALANÇO">
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between"><span className="text-destructive">CORTADO</span><span>{count("cortar")}</span></div>
              <div className="flex justify-between"><span className="text-primary">MANTIDO</span><span>{count("manter")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">EM OBSERVAÇÃO</span><span>{count("observar")}</span></div>
            </div>
          </HudCard>
          <HudCard title="PROTOCOLO">
            <ol className="text-[11px] text-muted-foreground space-y-2 list-decimal pl-4">
              <li>Nomeie o item sem eufemismo.</li>
              <li>Escreva o custo real (tempo, energia, foco, dinheiro).</li>
              <li>Espere 24h em OBSERVAR antes de cortar algo com peso emocional.</li>
              <li>Corte de uma vez. Corte parcial é sangramento.</li>
              <li>Reveja o balanço semanalmente.</li>
            </ol>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
