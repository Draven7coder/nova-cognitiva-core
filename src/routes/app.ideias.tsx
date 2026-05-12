import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/ideias")({ component: IdeiasPage });

function IdeiasPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [tags, setTags] = useState("");
  const [q, setQ] = useState("");
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("journal_entries").select("*").eq("module", "ideias").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!content.trim()) return;
    await supabase.from("journal_entries").insert({
      user_id: user!.id, module: "ideias", title, content,
      tags: tags ? tags.split(",").map((t) => t.trim()) : null,
    });
    setTitle(""); setContent(""); setTags(""); load();
  };

  const filtered = list.filter((i) =>
    !q || (i.title + i.content + (i.tags?.join(" ") ?? "")).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <ModulePage code="// IDE 07" title="Banco de Ideias" subtitle="Teorias, paradoxos, observações, invenções, insights · memória permanente.">
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">MEMÓRIA PERMANENTE ATIVA</span>
        <span>· cada ideia armazenada é imutável · histórico cronológico preservado.</span>
      </div>
      <HudCard title="NOVA IDEIA">
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input/40 font-mono text-xs mb-2" />
        <Textarea placeholder="Descrição" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[100px] bg-input/40 font-mono text-xs mb-2" />
        <Input placeholder="tags, separadas, por, vírgula" value={tags} onChange={(e) => setTags(e.target.value)} className="bg-input/40 font-mono text-xs" />
        <Button onClick={save} className="mt-2 font-mono text-xs tracking-widest">ARMAZENAR</Button>
      </HudCard>
      <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-input/40 font-mono text-xs" />
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((i) => (
          <HudCard key={i.id} title={i.title || "SEM TÍTULO"}>
            <p className="text-xs text-foreground/85 whitespace-pre-wrap font-mono">{i.content}</p>
            {i.tags && <div className="mt-2 flex flex-wrap gap-1">{i.tags.map((t: string) => <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded border border-primary/30 text-primary">#{t}</span>)}</div>}
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
