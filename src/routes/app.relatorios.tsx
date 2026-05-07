import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/relatorios")({ component: RelatoriosPage });

const SCOPES = ["diário", "semanal", "mensal", "trimestral"];

function RelatoriosPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("ai_reports").select("*").order("created_at", { ascending: false });
    setReports(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const generate = async (scope: string) => {
    setBusy(scope);
    try {
      const [{ data: ident }, { data: missAll }, { data: journal }] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("missions").select("title,status,type,xp,completed_at").limit(100),
        supabase.from("journal_entries").select("title,content,module,created_at").limit(50),
      ]);
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: { scope, context: { identity: ident, missions: missAll, journal } },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      await supabase.from("ai_reports").insert({
        user_id: user!.id, scope, content: (data as any).content, metrics: (data as any).metrics ?? null,
      });
      toast.success(`Relatório ${scope} gerado.`);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  return (
    <ModulePage code="// AIR 11" title="Relatórios da IA" subtitle="Análises automáticas: padrões, riscos, sabotagens, recomendações estratégicas.">
      <div className="flex flex-wrap gap-2">
        {SCOPES.map((s) => (
          <Button key={s} onClick={() => generate(s)} disabled={!!busy} className="font-mono text-xs tracking-widest hud-glow">
            <Sparkles className="size-3 mr-2" />
            {busy === s ? "GERANDO..." : `GERAR ${s.toUpperCase()}`}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {reports.length === 0 && <HudCard><div className="text-sm text-muted-foreground">Nenhum relatório gerado. Execute uma análise.</div></HudCard>}
        {reports.map((r) => (
          <HudCard key={r.id} title={`${r.scope.toUpperCase()} · ${new Date(r.created_at).toLocaleString("pt-BR")}`}>
            <div className="text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">{r.content}</div>
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
