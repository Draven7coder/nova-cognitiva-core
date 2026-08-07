import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/auditoria")({
  component: AuditoriaPage,
  head: () => ({
    meta: [
      { title: "Auditoria NOX · Núcleo Supremo" },
      { name: "description", content: "Checklist de integridade do sistema: dados, disciplina, coerência e manutenção operacional em ciclo fechado." },
      { property: "og:title", content: "Auditoria NOX · Núcleo Supremo" },
      { property: "og:description", content: "Auditoria periódica de integridade do Núcleo — score, lacunas e correções." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const CHECKLIST = [
  { g: "DADOS", items: ["Check-in diário registrado nos últimos 7 dias", "Backup exportado no último mês", "Identidade e Propósito revisados no trimestre"] },
  { g: "DISCIPLINA", items: ["Missões diárias fechadas ontem", "Hidratação dentro da meta", "Treino físico registrado na semana"] },
  { g: "COGNIÇÃO", items: ["Bloco de leitura concluído na semana", "Cartões de revisão em dia", "Uma aula na Sala de Aula na semana"] },
  { g: "COERÊNCIA", items: ["Hipóteses da Sombra validadas ou descartadas", "Cadeias operacionais sem tarefa órfã", "Ritual de Corte revisado na semana"] },
  { g: "ESTRATÉGIA", items: ["Ciclo OODA completo na semana", "Relatório da IA lido e anotado", "Rendas do mês atualizadas"] },
];

const ALL = CHECKLIST.flatMap((g) => g.items);

function AuditoriaPage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const load = async () => {
    const { data } = await sb.from("system_audits").select("*").order("created_at", { ascending: false }).limit(20);
    setHistory(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const toggle = (i: string) => setChecked((c) => ({ ...c, [i]: !c[i] }));
  const score = Math.round((ALL.filter((i) => checked[i]).length / ALL.length) * 100);

  const save = async () => {
    if (!user) return;
    const { error } = await sb.from("system_audits").insert({
      user_id: user.id,
      checklist: ALL.map((i) => ({ item: i, ok: !!checked[i] })),
      score, notes,
    });
    if (error) return toast.error(error.message);
    toast.success(`Auditoria registrada · ${score}/100`);
    setNotes("");
    load();
  };

  return (
    <ModulePage
      code="// NOX 23.1"
      title="Auditoria NOX"
      subtitle="Checklist de integridade do sistema. Um núcleo sem auditoria vira teatro."
      explanation="Percorra o checklist de integridade e marque o que está de fato em dia. O score é gerado automaticamente e o histórico mostra se o sistema está se degradando ou endurecendo ao longo do tempo."
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          {CHECKLIST.map((g) => (
            <HudCard key={g.g} title={g.g}>
              <div className="space-y-1">
                {g.items.map((i) => (
                  <button key={i} onClick={() => toggle(i)} className="w-full flex items-start gap-2 p-2 rounded border border-border/40 hover:border-primary/40 text-left transition">
                    <span className={`mt-0.5 size-4 rounded border flex items-center justify-center shrink-0 ${checked[i] ? "border-primary bg-primary/20" : "border-border"}`}>
                      {checked[i] && <Check className="size-3 text-primary" />}
                    </span>
                    <span className={`text-sm ${checked[i] ? "text-foreground" : "text-muted-foreground"}`}>{i}</span>
                  </button>
                ))}
              </div>
            </HudCard>
          ))}
          <HudCard title="OBSERVAÇÕES DA AUDITORIA">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Onde o sistema está vazando? O que corrigir antes da próxima auditoria?" className="min-h-[90px]" />
            <Button onClick={save} className="w-full mt-3 font-mono text-xs tracking-widest hud-glow">
              <ShieldCheck className="size-3 mr-2" /> FECHAR AUDITORIA
            </Button>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="INTEGRIDADE">
            <div className="font-display text-3xl text-primary hud-text-glow">{score}<span className="text-base text-muted-foreground">/100</span></div>
            <div className="h-2 rounded bg-muted/40 overflow-hidden mt-2">
              <div className="h-full bg-primary transition-all" style={{ width: `${score}%` }} />
            </div>
          </HudCard>
          <HudCard title="HISTÓRICO">
            <div className="space-y-1">
              {history.length === 0 && <div className="text-[11px] text-muted-foreground">Nenhuma auditoria registrada.</div>}
              {history.map((h) => (
                <div key={h.id} className="p-2 rounded border border-border/40">
                  <div className="font-mono text-[10px] tracking-widest text-primary">{h.score}/100</div>
                  <div className="font-mono text-[9px] text-muted-foreground">{new Date(h.created_at).toLocaleString("pt-BR")}</div>
                  {h.notes && <div className="text-[11px] text-muted-foreground mt-1">{h.notes}</div>}
                </div>
              ))}
            </div>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
