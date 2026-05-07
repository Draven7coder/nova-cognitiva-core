import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/missoes")({ component: MissoesPage });

const TYPES = ["daily", "weekly", "campaign", "side", "challenge", "project"] as const;
const TYPE_LABEL: Record<string, string> = {
  daily: "Diária", weekly: "Semanal", campaign: "Campanha",
  side: "Side Quest", challenge: "Desafio", project: "Projeto",
};

function MissoesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<typeof TYPES[number]>("daily");
  const [xp, setXp] = useState(10);

  const load = async () => {
    const { data } = await supabase.from("missions").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("missions").insert({ user_id: user!.id, title, type, xp });
    if (error) toast.error(error.message);
    else { setTitle(""); load(); toast.success("Missão registrada."); }
  };
  const complete = async (id: string) => {
    await supabase.from("missions").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const del = async (id: string) => { await supabase.from("missions").delete().eq("id", id); load(); };

  const totalXP = list.filter((m) => m.status === "done").reduce((a, b) => a + b.xp, 0);
  const level = Math.floor(totalXP / 100) + 1;
  const active = list.filter((m) => m.status === "active");
  const done = list.filter((m) => m.status === "done");

  return (
    <ModulePage code="// MSN 06" title="Sistema de Missões" subtitle="Execução gamificada · campanhas, missões, XP, evolução.">
      <div className="grid md:grid-cols-3 gap-4">
        <HudCard title="NÍVEL ATUAL"><div className="font-display text-5xl text-primary hud-text-glow">{level}</div><div className="text-xs text-muted-foreground mt-1">{totalXP} XP acumulado</div></HudCard>
        <HudCard title="MISSÕES ATIVAS"><div className="font-display text-5xl text-primary hud-text-glow">{active.length}</div><div className="text-xs text-muted-foreground mt-1">em execução</div></HudCard>
        <HudCard title="CONCLUÍDAS"><div className="font-display text-5xl text-primary hud-text-glow">{done.length}</div><div className="text-xs text-muted-foreground mt-1">total histórico</div></HudCard>
      </div>

      <HudCard title="NOVA MISSÃO">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Título da missão..." value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()} className="flex-1 min-w-[200px] bg-input/40 font-mono text-xs" />
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="w-36 bg-input/40 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" value={xp} onChange={(e) => setXp(parseInt(e.target.value) || 0)} className="w-20 bg-input/40 font-mono text-xs" />
          <Button onClick={create} className="font-mono text-xs tracking-widest"><Plus className="size-3 mr-1" />REGISTRAR</Button>
        </div>
      </HudCard>

      <HudCard title="MISSÕES ATIVAS">
        {active.length === 0 ? <div className="text-sm text-muted-foreground">Nenhuma missão ativa.</div> : (
          <ul className="space-y-2">
            {active.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-3 border border-border/40 rounded hover:border-primary/40 transition">
                <Swords className="size-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm">{m.title}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{TYPE_LABEL[m.type]} · +{m.xp} XP</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => complete(m.id)}><Check className="size-4 text-primary" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(m.id)}><Trash2 className="size-4 text-destructive" /></Button>
              </li>
            ))}
          </ul>
        )}
      </HudCard>

      {done.length > 0 && (
        <HudCard title="ARQUIVO · CONCLUÍDAS">
          <ul className="space-y-1 text-sm text-muted-foreground">
            {done.slice(0, 10).map((m) => (
              <li key={m.id} className="flex justify-between font-mono text-xs py-1 border-b border-border/30">
                <span>✓ {m.title}</span><span className="text-primary">+{m.xp} XP</span>
              </li>
            ))}
          </ul>
        </HudCard>
      )}
    </ModulePage>
  );
}
