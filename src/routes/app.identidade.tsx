import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/app/identidade")({ component: IdentidadePage });

const FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "archetype", label: "Arquétipo", placeholder: "O Estrategista..." },
  { key: "values_text", label: "Valores", placeholder: "Verdade, soberania, profundidade..." },
  { key: "principles", label: "Princípios", placeholder: "Princípios não-negociáveis..." },
  { key: "moral_code", label: "Código Moral", placeholder: "..." },
  { key: "worldview", label: "Visão de Mundo", placeholder: "..." },
  { key: "future_identity", label: "Identidade Futura", placeholder: "Quem você está se tornando..." },
  { key: "strengths", label: "Forças", placeholder: "..." },
  { key: "weaknesses", label: "Fraquezas", placeholder: "..." },
  { key: "central_phrase", label: "Frase Central", placeholder: "..." },
  { key: "philosophy", label: "Filosofia Pessoal", placeholder: "..." },
  { key: "existential_mission", label: "Missão Existencial", placeholder: "..." },
];

function IdentidadePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("identity").select("*").maybeSingle().then(({ data }) => {
      if (data) setData(data as any);
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("identity").upsert({ user_id: user!.id, ...data, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Identidade gravada.");
  };

  return (
    <ModulePage code="// IDN 01" title="Matriz de Identidade" subtitle="A definição soberana de quem você é, foi e está se tornando.">
      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <HudCard key={f.key} title={f.label.toUpperCase()}>
            <Textarea
              placeholder={f.placeholder}
              value={data[f.key] ?? ""}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
              className="min-h-[100px] bg-input/40 font-mono text-xs border-border/50"
            />
          </HudCard>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="font-mono tracking-widest text-xs hud-glow">
        {saving ? "GRAVANDO..." : "GRAVAR IDENTIDADE"}
      </Button>
    </ModulePage>
  );
}
