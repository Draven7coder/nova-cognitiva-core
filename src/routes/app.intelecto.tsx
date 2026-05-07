import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/intelecto")({ component: IntelectoPage });

const AREAS = ["matemática", "física", "programação", "IA", "filosofia", "psicologia", "línguas", "ciência", "estratégia", "arte", "livros"];

function IntelectoPage() {
  const { user } = useAuth();
  const [area, setArea] = useState("matemática");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("journal_entries").select("*").eq("module", `intelecto:${area}`).order("created_at", { ascending: false });
    setNotes(data ?? []);
  };
  useEffect(() => { load(); }, [user, area]);

  const save = async () => {
    if (!content.trim()) return;
    await supabase.from("journal_entries").insert({ user_id: user!.id, module: `intelecto:${area}`, title, content });
    setTitle(""); setContent(""); load();
  };

  return (
    <ModulePage code="// INT 03" title="Centro Intelectual" subtitle="Segundo cérebro · notas, mapas, insights, conexões.">
      <div className="flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <button key={a} onClick={() => setArea(a)}
            className={`font-mono text-[10px] tracking-widest px-3 py-1.5 rounded border transition ${
              area === a ? "border-primary bg-primary/10 text-primary hud-glow" : "border-border/50 text-muted-foreground hover:border-primary/40"
            }`}>{a.toUpperCase()}</button>
        ))}
      </div>
      <HudCard title={`NOVA ENTRADA · ${area.toUpperCase()}`}>
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input/40 font-mono text-xs mb-2" />
        <Textarea placeholder="Insight, teoria, anotação..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px] bg-input/40 font-mono text-xs" />
        <Button onClick={save} className="mt-2 font-mono text-xs tracking-widest">REGISTRAR</Button>
      </HudCard>
      <div className="grid md:grid-cols-2 gap-3">
        {notes.map((n) => (
          <HudCard key={n.id} title={n.title || "SEM TÍTULO"}>
            <p className="text-xs text-foreground/85 whitespace-pre-wrap font-mono">{n.content}</p>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR")}</div>
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
