import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { EmergentLink } from "@/components/EmergentLink";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/relatorios")({ component: RelatoriosPage });

const SCOPES = ["diário", "semanal", "mensal", "trimestral"] as const;
type Scope = typeof SCOPES[number];

// Janela temporal por escopo (em horas). Diário = 24h, semanal = 7d, etc.
const SCOPE_HOURS: Record<Scope, number> = {
  "diário": 24,
  "semanal": 24 * 7,
  "mensal": 24 * 30,
  "trimestral": 24 * 90,
};

function sinceISO(hours: number) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function firstLine(s: string) {
  return (s || "").replace(/[#*`>_-]/g, "").split("\n").find((l) => l.trim().length > 0)?.slice(0, 140) ?? "";
}

function RelatoriosPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data } = await supabase.from("ai_reports").select("*").order("created_at", { ascending: false });
    setReports(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const toggle = (id: string) => setOpenMap((m) => ({ ...m, [id]: !m[id] }));

  const generate = async (scope: Scope) => {
    setBusy(scope);
    try {
      const since = sinceISO(SCOPE_HOURS[scope]);
      const [{ data: ident }, { data: missAll }, { data: journal }, { data: comps }, { data: checks }, { data: ooda }] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("missions")
          .select("title,status,type,xp,completed_at,created_at,last_completed_at")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase.from("journal_entries")
          .select("title,content,module,tags,created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(120),
        supabase.from("mission_completions")
          .select("mission_id,completed_at,quality,notes")
          .gte("completed_at", since)
          .order("completed_at", { ascending: false })
          .limit(120),
        supabase.from("daily_checkins")
          .select("check_date,mood,energy,focus,stress,sleep_quality,operational_mode,bottleneck,notes")
          .gte("check_date", since.slice(0, 10))
          .order("check_date", { ascending: false })
          .limit(60),
        supabase.from("ooda_entries")
          .select("tag,observe,orient,decide,act,created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope,
          context: {
            identity: ident,
            missions: missAll,
            journal,
            completions: comps,
            checkins: checks,
            ooda,
            window: { hours: SCOPE_HOURS[scope], since },
          },
        },
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

  const copy = async (r: any) => {
    try {
      await navigator.clipboard.writeText(r.content ?? "");
      toast.success("Relatório copiado.");
    } catch { toast.error("Falha ao copiar."); }
  };

  return (
    <ModulePage
      code="// AIR 11"
      title="Relatórios da IA"
      subtitle="Análises automáticas: padrões, riscos, sabotagens, recomendações estratégicas."
      explanation="Gere um relatório da IA no escopo desejado (diário = últimas 24h, semanal = 7 dias, mensal = 30 dias, trimestral = 90 dias). Cada relatório abre colapsado — clique para expandir. Botão 'Copiar' leva o texto pro clipboard."
    >
      <EmergentLink note="Acesse a camada emergente: padrões reais detectados em tempo real." />
      <div className="flex flex-wrap gap-2">
        {SCOPES.map((s) => (
          <Button key={s} onClick={() => generate(s)} disabled={!!busy} className="font-mono text-xs tracking-widest hud-glow">
            <Sparkles className="size-3 mr-2" />
            {busy === s ? "GERANDO..." : `GERAR ${s.toUpperCase()}`}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {reports.length === 0 && <HudCard><div className="text-sm text-muted-foreground">Nenhum relatório gerado. Execute uma análise.</div></HudCard>}
        {reports.map((r) => {
          const open = !!openMap[r.id];
          return (
            <div key={r.id} className="hud-panel hud-corner p-4">
              <Collapsible open={open} onOpenChange={() => toggle(r.id)}>
                <div className="flex items-start gap-2">
                  <CollapsibleTrigger className="flex-1 flex items-start gap-2 text-left group">
                    {open ? <ChevronDown className="size-4 text-primary mt-0.5 shrink-0" /> : <ChevronRight className="size-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80">
                        {String(r.scope).toUpperCase()} · {new Date(r.created_at).toLocaleString("pt-BR")}
                      </div>
                      {!open && <div className="text-xs text-muted-foreground font-mono mt-1 line-clamp-1">{firstLine(r.content)}</div>}
                    </div>
                  </CollapsibleTrigger>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); copy(r); }} className="h-7 font-mono text-[10px] tracking-widest shrink-0">
                    <Copy className="size-3 mr-1" /> COPIAR
                  </Button>
                </div>
                <CollapsibleContent className="mt-3">
                  <div className="text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">{r.content}</div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </ModulePage>
  );
}
