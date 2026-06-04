import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, Compass, GitBranch, Zap, Trash2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/app/ooda")({ component: OodaPage });

function OodaPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [tag, setTag] = useState("");
  const [observe, setObserve] = useState("");
  const [orient, setOrient] = useState("");
  const [counter, setCounter] = useState("");
  const [decide, setDecide] = useState("");
  const [act, setAct] = useState("");
  const [comfort, setComfort] = useState([5]);
  const [integrity, setIntegrity] = useState(true);
  const [integrityNote, setIntegrityNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("ooda_entries").select("*").order("created_at", { ascending: false }).limit(50);
    setList(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const reset = () => {
    setTag(""); setObserve(""); setOrient(""); setCounter(""); setDecide(""); setAct("");
    setComfort([5]); setIntegrity(true); setIntegrityNote("");
  };

  const save = async () => {
    if (!observe.trim() || !orient.trim() || !decide.trim() || !act.trim()) {
      toast.error("Observar, Orientar, Decidir e Agir são obrigatórios."); return;
    }
    if (!counter.trim()) {
      toast.error("Argumento contrário é obrigatório. Sem ele, é viés."); return;
    }
    setSaving(true);
    const { error } = await supabase.from("ooda_entries").insert({
      user_id: user!.id, tag: tag || null, observe, orient, counter_argument: counter,
      decide, act, comfort_zone: comfort[0], data_integrity: integrity,
      integrity_note: integrity ? null : (integrityNote || null),
    } as any);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Ciclo OODA arquivado."); reset(); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir este ciclo OODA? A ação é permanente.")) return;
    await supabase.from("ooda_entries").delete().eq("id", id); load();
  };

  const stats = useMemo(() => {
    const total = list.length;
    const last7 = list.filter((e) => Date.now() - new Date(e.created_at).getTime() < 7 * 86400000);
    const last30 = list.filter((e) => Date.now() - new Date(e.created_at).getTime() < 30 * 86400000);
    const avgComfort7 = last7.length ? (last7.reduce((a, b) => a + (b.comfort_zone ?? 5), 0) / last7.length).toFixed(1) : "—";
    const integrityFlags = list.filter((e) => e.data_integrity === false).length;
    return { total, last7: last7.length, last30: last30.length, avgComfort7, integrityFlags };
  }, [list]);

  return (
    <ModulePage code="// OODA 14" title="Loop OODA · Arquitetura de Decisão"
      subtitle="Observar → Orientar → Decidir → Agir. Documentação obrigatória do contra-argumento. Indicador de integridade dos dados.">
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">PROTOCOLO COGNITIVO ATIVO</span>
        <span>· cada ciclo alimenta o relatório diário e o JARVIS.</span>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <HudCard title="CICLOS TOTAIS"><div className="font-display text-4xl text-primary hud-text-glow">{stats.total}</div></HudCard>
        <HudCard title="ÚLTIMOS 7D"><div className="font-display text-4xl text-primary hud-text-glow">{stats.last7}</div></HudCard>
        <HudCard title="MÉDIA ZONA · 7D"><div className="font-display text-4xl text-primary hud-text-glow">{stats.avgComfort7}</div><div className="text-xs text-muted-foreground mt-1">0 conforto · 10 risco</div></HudCard>
        <HudCard title="ALERTAS INTEGRIDADE"><div className="font-display text-4xl text-destructive">{stats.integrityFlags}</div><div className="text-xs text-muted-foreground mt-1">dados suspeitos</div></HudCard>
      </div>

      <HudCard title="NOVO CICLO OODA">
        <div className="space-y-4">
          <Input placeholder="Tag · contexto (ex: decisão financeira, conflito, missão X)..." value={tag} onChange={(e) => setTag(e.target.value)}
            className="bg-input/40 font-mono text-xs" />

          <div className="space-y-2">
            <div className="flex items-center gap-2"><Eye className="size-4 text-primary" /><Label className="font-mono text-[10px] tracking-widest">OBSERVAR · dados brutos, sem interpretação</Label></div>
            <Textarea value={observe} onChange={(e) => setObserve(e.target.value)} rows={3} className="bg-input/40 font-mono text-xs" placeholder="O que está acontecendo objetivamente?" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2"><Compass className="size-4 text-primary" /><Label className="font-mono text-[10px] tracking-widest">ORIENTAR · contexto, modelo mental, padrão</Label></div>
            <Textarea value={orient} onChange={(e) => setOrient(e.target.value)} rows={3} className="bg-input/40 font-mono text-xs" placeholder="Como esses dados se encaixam? Que padrão revelam?" />
          </div>

          <div className="space-y-2 border border-destructive/40 rounded p-3 bg-destructive/5">
            <div className="flex items-center gap-2"><ShieldAlert className="size-4 text-destructive" /><Label className="font-mono text-[10px] tracking-widest text-destructive">ARGUMENTO CONTRÁRIO · OBRIGATÓRIO</Label></div>
            <p className="text-[11px] text-muted-foreground">Por que sua interpretação pode estar errada? Sem isso, é viés.</p>
            <Textarea value={counter} onChange={(e) => setCounter(e.target.value)} rows={2} className="bg-input/40 font-mono text-xs" placeholder="A leitura oposta é..." />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2"><GitBranch className="size-4 text-primary" /><Label className="font-mono text-[10px] tracking-widest">DECIDIR · escolha, com trade-offs claros</Label></div>
            <Textarea value={decide} onChange={(e) => setDecide(e.target.value)} rows={2} className="bg-input/40 font-mono text-xs" placeholder="Decidi X porque..." />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2"><Zap className="size-4 text-primary" /><Label className="font-mono text-[10px] tracking-widest">AGIR · ação concreta, mensurável</Label></div>
            <Textarea value={act} onChange={(e) => setAct(e.target.value)} rows={2} className="bg-input/40 font-mono text-xs" placeholder="Vou executar..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div>
              <Label className="font-mono text-[10px] tracking-widest text-muted-foreground">ZONA DE CONFORTO ({comfort[0]}/10)</Label>
              <Slider value={comfort} onValueChange={setComfort} min={0} max={10} step={1} className="mt-2" />
              <div className="text-[10px] text-muted-foreground mt-1 flex justify-between"><span>0 = totalmente confortável</span><span>10 = risco máximo</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-[10px] tracking-widest text-muted-foreground">INTEGRIDADE DOS DADOS</Label>
                <Switch checked={integrity} onCheckedChange={setIntegrity} />
              </div>
              {!integrity && (
                <Input value={integrityNote} onChange={(e) => setIntegrityNote(e.target.value)} placeholder="O que pode estar distorcido nesta análise?" className="bg-input/40 font-mono text-xs" />
              )}
              <p className="text-[10px] text-muted-foreground">Marcar OFF força a consciência de que os dados foram reinterpretados para preservar autoimagem.</p>
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="w-full font-mono text-xs tracking-widest hud-glow">
            {saving ? "ARQUIVANDO..." : "ARQUIVAR CICLO"}
          </Button>
        </div>
      </HudCard>

      <HudCard title="ARQUIVO · CICLOS RECENTES">
        {list.length === 0 ? <div className="text-sm text-muted-foreground">Nenhum ciclo registrado ainda.</div> : (
          <ul className="space-y-3">
            {list.map((e) => (
              <li key={e.id} className="border border-border/40 rounded p-3 hover:border-primary/40 transition">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-primary">{e.tag || "SEM TAG"}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleString("pt-BR")} · zona {e.comfort_zone}/10 {e.data_integrity === false && <span className="text-destructive">· ⚠ integridade off</span>}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => del(e.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div><span className="text-primary font-mono text-[10px]">OBS · </span>{e.observe}</div>
                  <div><span className="text-primary font-mono text-[10px]">ORI · </span>{e.orient}</div>
                  <div className="text-destructive/90"><span className="font-mono text-[10px]">CONTRA · </span>{e.counter_argument}</div>
                  <div><span className="text-primary font-mono text-[10px]">DEC · </span>{e.decide}</div>
                  <div className="sm:col-span-2"><span className="text-primary font-mono text-[10px]">AGIR · </span>{e.act}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </HudCard>
    </ModulePage>
  );
}
