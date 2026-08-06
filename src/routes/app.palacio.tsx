import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Landmark, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/palacio")({ component: PalacioPage });

function PalacioPage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [loci, setLoci] = useState<any[]>([]);
  const [palace, setPalace] = useState("São Paulo");
  const [form, setForm] = useState({ locus_name: "", content: "", image_cue: "" });
  const [walk, setWalk] = useState(false);
  const [step, setStep] = useState(0);

  const load = async () => {
    if (!user) return;
    const { data } = await sb.from("memory_loci").select("*").eq("palace", palace).order("order_index", { ascending: true });
    setLoci(data ?? []);
  };
  useEffect(() => { load(); }, [user, palace]);

  const add = async () => {
    if (!user || !form.locus_name.trim()) return;
    await sb.from("memory_loci").insert({
      user_id: user.id, palace, locus_name: form.locus_name.trim(),
      content: form.content || null, image_cue: form.image_cue || null,
      order_index: loci.length,
    });
    setForm({ locus_name: "", content: "", image_cue: "" });
    load();
    toast.success("Locus ancorado.");
  };

  const remove = async (id: string) => { await sb.from("memory_loci").delete().eq("id", id); load(); };

  const current = loci[step] ?? null;

  return (
    <ModulePage
      code="// PLC 27"
      title="Palácio da Memória"
      subtitle="Gêmeo digital de São Paulo · loci ancorados em pontos reais da cidade para memorização por percurso."
      explanation="Crie loci (pontos do percurso) e ancore uma informação e uma imagem mental em cada um. O modo Percurso te leva ponto a ponto para revisar de olhos fechados."
    >
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className="space-y-4">
          <HudCard title="PALÁCIO">
            <Input value={palace} onChange={(e) => setPalace(e.target.value)} placeholder="Nome do palácio / cidade" />
            <div className="font-mono text-[10px] text-muted-foreground mt-2">{loci.length} loci ancorados</div>
          </HudCard>

          <HudCard title="NOVO LOCUS">
            <div className="space-y-2">
              <Input value={form.locus_name} onChange={(e) => setForm({ ...form, locus_name: e.target.value })} placeholder="Ponto real (ex.: Viaduto do Chá)" />
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Informação a memorizar..." className="min-h-[90px] text-xs" />
              <Textarea value={form.image_cue} onChange={(e) => setForm({ ...form, image_cue: e.target.value })} placeholder="Imagem mental absurda que ancora a informação..." className="min-h-[70px] text-xs" />
              <Button onClick={add} size="sm" className="w-full font-mono text-[10px] tracking-widest hud-glow">
                <Plus className="size-3 mr-1" /> ANCORAR
              </Button>
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="PERCURSO">
            <Button size="sm" variant={walk ? "default" : "outline"} onClick={() => { setWalk(!walk); setStep(0); }} className="font-mono text-[10px] tracking-widest">
              <Eye className="size-3 mr-1" /> {walk ? "SAIR DO PERCURSO" : "INICIAR PERCURSO"}
            </Button>
            {walk && (
              current ? (
                <div className="mt-4 border border-primary/30 rounded p-6 text-center space-y-3">
                  <div className="font-mono text-[9px] tracking-[0.3em] text-primary/70">LOCUS {step + 1}/{loci.length}</div>
                  <div className="font-display text-xl hud-text-glow">{current.locus_name}</div>
                  <div className="text-xs text-muted-foreground italic">{current.image_cue}</div>
                  <div className="text-sm whitespace-pre-wrap">{current.content}</div>
                  <div className="flex justify-center gap-2 pt-2">
                    <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="font-mono text-[10px]">ANTERIOR</Button>
                    <Button size="sm" disabled={step >= loci.length - 1} onClick={() => setStep((s) => s + 1)} className="font-mono text-[10px] hud-glow">PRÓXIMO</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-xs font-mono text-muted-foreground text-center py-8">Nenhum locus para percorrer.</div>
              )
            )}
          </HudCard>

          <HudCard title="LOCI ANCORADOS">
            {loci.length === 0 && (
              <div className="text-xs font-mono text-muted-foreground py-10 text-center">
                <Landmark className="size-5 mx-auto mb-2 text-primary/60" />
                Nenhum locus. Ancore o primeiro ponto do seu percurso.
              </div>
            )}
            <div className="space-y-2">
              {loci.map((l, i) => (
                <div key={l.id} className="flex items-start gap-2 border border-border/40 rounded p-3">
                  <span className="font-mono text-[10px] text-primary/70 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{l.locus_name}</div>
                    {l.image_cue && <div className="text-[11px] text-muted-foreground italic">{l.image_cue}</div>}
                    {l.content && <div className="text-xs text-foreground/80 whitespace-pre-wrap mt-1">{l.content}</div>}
                  </div>
                  <button onClick={() => remove(l.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
