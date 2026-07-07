import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus,
  Check, X, Archive, ChevronDown, ChevronRight, Eye,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sombra")({ component: SombraPage });

type Hypothesis = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  confidence: number;
  trend: string;
  evidence_for: string[];
  evidence_against: string[];
  related_protocols: string[];
  related_modules: string[];
  triggers: string[];
  status: string;
  appearances: number;
  first_seen_at: string;
  last_seen_at: string;
  user_note: string | null;
};

const CATEGORIES: { key: string; label: string; subtitle: string }[] = [
  { key: "insegurancas", label: "INSEGURANÇAS", subtitle: "Medos, vulnerabilidades e crenças limitantes detectadas." },
  { key: "padroes_destrutivos", label: "PADRÕES DESTRUTIVOS", subtitle: "Comportamentos recorrentes que afastam dos objetivos." },
  { key: "ego_defesa", label: "EGO E MECANISMOS DE DEFESA", subtitle: "Estratégias de autoproteção psicológica — sem julgamento moral." },
  { key: "impulsos_vicios", label: "IMPULSOS E VÍCIOS MENTAIS", subtitle: "Busca por alívio imediato, compulsões, impulsividade." },
  { key: "validacao", label: "NECESSIDADE DE VALIDAÇÃO", subtitle: "Dependência de aprovação externa ou medo de desapontar." },
  { key: "autossabotagem", label: "AUTOSSABOTAGEM", subtitle: "Padrões que impedem execução consistente." },
  { key: "padroes_recorrentes", label: "PADRÕES RECORRENTES DETECTADOS", subtitle: "Comportamentos, gatilhos e respostas que se repetem." },
];

const STATUS_CLS: Record<string, string> = {
  suspeita: "text-amber-300 border-amber-300/40",
  ativa: "text-primary border-primary/50",
  consolidada: "text-emerald-400 border-emerald-400/50",
  rejeitada: "text-muted-foreground border-border line-through",
  arquivada: "text-muted-foreground border-border",
};
const STATUS_LABEL: Record<string, string> = {
  suspeita: "SUSPEITA", ativa: "HIPÓTESE ATIVA",
  consolidada: "CONSOLIDADA", rejeitada: "REJEITADA", arquivada: "ARQUIVADA",
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "crescente") return <TrendingUp className="size-3 text-amber-300" />;
  if (trend === "decrescente") return <TrendingDown className="size-3 text-emerald-400" />;
  return <Minus className="size-3 text-muted-foreground" />;
}

function HypothesisCard({ h, onUpdate }: { h: Hypothesis; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(h.user_note ?? "");

  const setStatus = async (status: string) => {
    await (supabase as any).from("shadow_hypotheses").update({ status }).eq("id", h.id);
    toast.success(`Hipótese marcada como ${STATUS_LABEL[status]}.`);
    onUpdate();
  };
  const saveNote = async () => {
    await (supabase as any).from("shadow_hypotheses").update({ user_note: note }).eq("id", h.id);
    toast.success("Nota salva.");
    onUpdate();
  };

  return (
    <li className="hud-panel p-3 border-l-2 border-primary/40">
      <div className="flex items-start gap-2">
        <button onClick={() => setOpen(!open)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm text-foreground">{h.name}</span>
            <Badge variant="outline" className={`font-mono text-[10px] ${STATUS_CLS[h.status]}`}>{STATUS_LABEL[h.status]}</Badge>
            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
              <TrendIcon trend={h.trend} /> {h.trend}
            </span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
            confiança <span className="text-primary">{h.confidence}%</span> · aparições {h.appearances} · vista {new Date(h.last_seen_at).toLocaleDateString()}
          </div>
          <div className="h-1 bg-muted/40 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary hud-glow transition-all" style={{ width: `${h.confidence}%` }} />
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-3 pl-6 space-y-3">
          {h.description && <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>}

          {h.evidence_for.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-widest text-primary">EVIDÊNCIAS FAVORÁVEIS</div>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                {h.evidence_for.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {h.evidence_against.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-widest text-emerald-400">EVIDÊNCIAS CONTRÁRIAS</div>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                {h.evidence_against.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {h.triggers.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-widest text-amber-300">GATILHOS DETECTADOS</div>
              <div className="text-xs text-muted-foreground mt-1">{h.triggers.join(" · ")}</div>
            </div>
          )}
          {h.related_protocols.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-widest text-cyan-300">PROTOCOLOS RELACIONADOS</div>
              <div className="text-xs text-muted-foreground mt-1">{h.related_protocols.join(" · ")}</div>
            </div>
          )}
          <div className="font-mono text-[10px] text-muted-foreground">
            primeira aparição: {new Date(h.first_seen_at).toLocaleDateString()}
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-widest text-foreground mb-1">SUA NOTA / VALIDAÇÃO</div>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Concorda? Contexto? Refute ou confirme com sua perspectiva..." className="text-sm min-h-[60px]" />
            <Button size="sm" variant="outline" onClick={saveNote} className="font-mono text-[10px] mt-2">SALVAR NOTA</Button>
          </div>

          <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
            <Button size="sm" variant="ghost" onClick={() => setStatus("ativa")} className="font-mono text-[10px]"><Eye className="size-3 mr-1" />ATIVAR</Button>
            <Button size="sm" variant="ghost" onClick={() => setStatus("consolidada")} className="font-mono text-[10px] text-emerald-400"><Check className="size-3 mr-1" />CONSOLIDAR</Button>
            <Button size="sm" variant="ghost" onClick={() => setStatus("rejeitada")} className="font-mono text-[10px] text-destructive"><X className="size-3 mr-1" />REJEITAR</Button>
            <Button size="sm" variant="ghost" onClick={() => setStatus("arquivada")} className="font-mono text-[10px] text-muted-foreground"><Archive className="size-3 mr-1" />ARQUIVAR</Button>
          </div>
        </div>
      )}
    </li>
  );
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SombraPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Hypothesis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await (supabase as any).from("shadow_hypotheses")
      .select("*").order("confidence", { ascending: false }).order("last_seen_at", { ascending: false });
    setItems(((data ?? []) as Hypothesis[]).map((h) => ({
      ...h,
      evidence_for: Array.isArray(h.evidence_for) ? h.evidence_for : [],
      evidence_against: Array.isArray(h.evidence_against) ? h.evidence_against : [],
      related_protocols: Array.isArray(h.related_protocols) ? h.related_protocols : [],
      related_modules: Array.isArray(h.related_modules) ? h.related_modules : [],
      triggers: Array.isArray(h.triggers) ? h.triggers : [],
    })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const runAnalysis = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      const [
        { data: ident }, { data: miss }, { data: comps },
        { data: journal }, { data: ooda }, { data: checks }, { data: hydration },
        { data: chains }, { data: subs }, { data: existing },
      ] = await Promise.all([
        supabase.from("identity").select("*").maybeSingle(),
        supabase.from("missions").select("title,status,type,recurrence,streak,created_at,last_completed_at").limit(60),
        supabase.from("mission_completions").select("mission_id,completed_at,quality,notes").order("completed_at", { ascending: false }).limit(60),
        supabase.from("journal_entries").select("title,content,module,tags,created_at").order("created_at", { ascending: false }).limit(40),
        supabase.from("ooda_entries").select("tag,observe,orient,decide,act,comfort_zone,counter_argument,created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("daily_checkins").select("check_date,mood,energy,focus,stress,sleep_quality,bottleneck,discomfort,notes,operational_mode").order("check_date", { ascending: false }).limit(30),
        supabase.from("hydration_logs").select("amount_ml,consumed_at").order("consumed_at", { ascending: false }).limit(30),
        (supabase as any).from("operational_chains").select("title,description,status,primary_module,created_at").limit(20),
        (supabase as any).from("chain_subtasks").select("title,module,status,completed_at").limit(60),
        (supabase as any).from("shadow_hypotheses").select("id,category,name,confidence,trend,status").limit(40),
      ]);

      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "shadow",
          context: {
            identity: ident, missions: miss, completions: comps,
            journal, ooda, checkins: checks, hydration,
            chains, subtasks: subs,
            existing_hypotheses: existing,
            now: new Date().toISOString(),
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const parsed = (data as any).shadow;
      if (!parsed) {
        toast.error("Motor Adaptativo não detectou padrões suficientes ainda.");
        return;
      }

      const validCats = new Set(CATEGORIES.map((c) => c.key));
      const validTrends = new Set(["crescente", "estavel", "decrescente"]);
      const newItems = (parsed.new ?? []).slice(0, 6).filter((n: any) => n?.name && validCats.has(n.category));

      const rows = newItems.map((n: any) => ({
        user_id: user.id,
        category: n.category,
        name: String(n.name).slice(0, 160),
        description: n.description ?? null,
        confidence: Math.max(0, Math.min(100, Number(n.confidence) || 30)),
        trend: validTrends.has(n.trend) ? n.trend : "estavel",
        evidence_for: Array.isArray(n.evidence_for) ? n.evidence_for.slice(0, 8) : [],
        evidence_against: Array.isArray(n.evidence_against) ? n.evidence_against.slice(0, 8) : [],
        triggers: Array.isArray(n.triggers) ? n.triggers.slice(0, 8) : [],
        related_modules: Array.isArray(n.related_modules) ? n.related_modules.slice(0, 8) : [],
        related_protocols: Array.isArray(n.related_protocols) ? n.related_protocols.slice(0, 8) : [],
        status: "suspeita",
      }));
      if (rows.length) await (supabase as any).from("shadow_hypotheses").insert(rows);

      let updated = 0;
      for (const u of (parsed.updates ?? []).slice(0, 20)) {
        const target = (existing ?? []).find((e: any) => e.id === u.id);
        if (!target) continue;
        const patch: any = {
          last_seen_at: new Date().toISOString(),
          appearances: ((target as any).appearances ?? 1) + 1,
        };
        if (typeof u.confidence_delta === "number") {
          const nc = Math.max(0, Math.min(100, (target.confidence ?? 30) + u.confidence_delta));
          patch.confidence = nc;
        }
        if (validTrends.has(u.trend)) patch.trend = u.trend;
        if (Array.isArray(u.new_evidence_for) && u.new_evidence_for.length) {
          const { data: cur } = await (supabase as any).from("shadow_hypotheses").select("evidence_for").eq("id", u.id).maybeSingle();
          patch.evidence_for = [...((cur?.evidence_for as string[]) ?? []), ...u.new_evidence_for].slice(-12);
        }
        if (Array.isArray(u.new_evidence_against) && u.new_evidence_against.length) {
          const { data: cur } = await (supabase as any).from("shadow_hypotheses").select("evidence_against").eq("id", u.id).maybeSingle();
          patch.evidence_against = [...((cur?.evidence_against as string[]) ?? []), ...u.new_evidence_against].slice(-12);
        }
        await (supabase as any).from("shadow_hypotheses").update(patch).eq("id", u.id);
        updated++;
      }

      toast.success(`Motor Adaptativo: ${rows.length} nova(s) hipótese(s), ${updated} atualizada(s).`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Falha no Motor Adaptativo");
    } finally { setAnalyzing(false); }
  };

  const byCategory = useMemo(() => {
    const map = new Map<string, Hypothesis[]>();
    for (const c of CATEGORIES) map.set(c.key, []);
    for (const h of items) {
      if (h.status === "rejeitada" || h.status === "arquivada") continue;
      map.get(h.category)?.push(h);
    }
    return map;
  }, [items]);

  const archived = items.filter((h) => h.status === "rejeitada" || h.status === "arquivada");

  return (
    <ModulePage code="// SHD 08" title="Sombra Dinâmica" subtitle="Repositório adaptativo de hipóteses · alimentado pelo Motor de Análise. Você mantém autoridade final sobre cada hipótese.">
      <HudCard title="🧠 MOTOR DE ANÁLISE ADAPTATIVA">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="font-display text-sm text-foreground">Análise cruzada de identidade, missões, journal, OODA, check-ins, cadeias e hábitos.</div>
            <div className="text-xs text-muted-foreground font-mono mt-1 leading-relaxed">
              Hipóteses geradas <span className="text-primary">NÃO são verdades absolutas</span> — você pode ativar, consolidar, rejeitar ou arquivar cada uma. Evidências e tendências se acumulam ao longo do tempo.
            </div>
          </div>
          <Button onClick={runAnalysis} disabled={analyzing} className="font-mono text-xs tracking-widest">
            {analyzing ? <RefreshCw className="size-3 mr-2 animate-spin" /> : <Sparkles className="size-3 mr-2" />}
            {analyzing ? "ANALISANDO..." : "GERAR HIPÓTESES"}
          </Button>
        </div>
      </HudCard>

      {CATEGORIES.map((cat) => {
        const list = byCategory.get(cat.key) ?? [];
        return (
          <HudCard key={cat.key} title={cat.label}>
            <div className="text-xs text-muted-foreground font-mono mb-3">{cat.subtitle}</div>
            {list.length === 0 ? (
              loading ? (
                <div className="text-xs text-muted-foreground font-mono">Carregando...</div>
              ) : (
                <div className="text-xs text-muted-foreground font-mono italic">Nenhuma hipótese ativa nesta categoria. Execute o Motor Adaptativo para análise.</div>
              )
            ) : (
              <ul className="space-y-2">
                {list.map((h) => <HypothesisCard key={h.id} h={h} onUpdate={load} />)}
              </ul>
            )}
          </HudCard>
        );
      })}

      {archived.length > 0 && (
        <HudCard title="ARQUIVO · REJEITADAS">
          <ul className="space-y-1 text-xs text-muted-foreground font-mono">
            {archived.slice(0, 30).map((h) => (
              <li key={h.id} className="flex justify-between py-1 border-b border-border/30">
                <span>{h.status === "rejeitada" ? "✗" : "▢"} {h.name}</span>
                <span>{STATUS_LABEL[h.status]}</span>
              </li>
            ))}
          </ul>
        </HudCard>
      )}

      <HudCard title="NOTAS PRIVADAS DO OPERADOR">
        <div className="text-xs text-muted-foreground font-mono mb-3">Espaço protegido para reflexões manuais — complemento opcional às hipóteses geradas.</div>
        <div className="grid md:grid-cols-2 gap-3">
          <ProtectedField module="sombra" fieldKey="notes_private" placeholder="Reflexões privadas..." minHeight={120} />
          <ProtectedField module="sombra" fieldKey="notes_strategy" placeholder="Estratégias de enfrentamento..." minHeight={120} />
        </div>
      </HudCard>
    </ModulePage>
  );
}
