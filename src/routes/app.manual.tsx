import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sparkles, Brain, Layers, Activity } from "lucide-react";
import { ProtectedField } from "@/components/ProtectedField";

export const Route = createFileRoute("/app/manual")({ component: ManualPage });

function ManualPage() {
  const { user } = useAuth();
  const [ordem, setOrdem] = useState({ segunda: "", terceira: "", decima: "", longoPrazo: "", arquitetura: "" });
  const [aiOut, setAiOut] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const content = Object.entries(ordem).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join("\n\n");
    if (!content.trim()) return;
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user!.id, module: "manual:protocolos-cognitivos", title: "Pensamento de Alta Ordem", content,
    });
    if (error) toast.error(error.message); else toast.success("Registrado.");
  };

  const analisar = async () => {
    setLoading(true); setAiOut("");
    try {
      const texto = Object.entries(ordem).map(([k, v]) => `${k}: ${v}`).join("\n");
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          mode: "high_order_thinking",
          prompt: `Analise a profundidade cognitiva do usuário com base nas reflexões abaixo. Avalie: profundidade das decisões, impulsividade vs arquitetura, qualidade estratégica, visão de longo prazo, padrões cognitivos. Gere observação curta e direta (2-3 linhas).\n\n${texto}`,
        },
      });
      if (error) throw error;
      setAiOut(data?.report || data?.content || "Indisponível.");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <ModulePage code="// MAN 04" title="Manual Operacional" subtitle="Mapeamento do funcionamento mental · seu próprio sistema operacional.">
      <Tabs defaultValue="mapeamento">
        <TabsList className="bg-input/30 border border-border/40">
          <TabsTrigger value="mapeamento" className="font-mono text-[10px] tracking-widest"><Brain className="size-3 mr-1"/>MAPEAMENTO</TabsTrigger>
          <TabsTrigger value="protocolos" className="font-mono text-[10px] tracking-widest"><Layers className="size-3 mr-1"/>⚙️ PROTOCOLOS COGNITIVOS</TabsTrigger>
        </TabsList>

        <TabsContent value="mapeamento" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["pico-cognitivo","Horários de Pico Cognitivo"],
              ["gatilhos-emocionais","Gatilhos Emocionais"],
              ["ambientes-ideais","Ambientes Ideais"],
              ["ambientes-toxicos","Ambientes Tóxicos"],
              ["procrastinacao","Padrões de Procrastinação"],
              ["hacks-mentais","Hacks Mentais"],
              ["recuperacao","Protocolos de Recuperação"],
              ["estados-mentais","Estados Mentais"],
              ["foco","Técnicas de Foco"],
              ["sabotagens","Sabotagens Recorrentes"],
            ].map(([k,t]) => (
              <HudCard key={k} title={t.toUpperCase()}>
                <ProtectedField module="manual" fieldKey={k} placeholder="..." minHeight={110} />
              </HudCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="protocolos" className="mt-4 space-y-4">
          <HudCard title="PENSAMENTO DE ALTA ORDEM">
            <p className="text-xs text-muted-foreground mb-4">
              Mapeie a profundidade real das suas decisões. A IA analisa a qualidade estratégica, impulsividade e arquitetura cognitiva.
            </p>
            <div className="space-y-3">
              <Textarea placeholder="2ª ORDEM · Se faço X, qual o efeito imediato seguinte?" value={ordem.segunda} onChange={(e)=>setOrdem({...ordem,segunda:e.target.value})} className="min-h-[70px] bg-input/40 font-mono text-xs"/>
              <Textarea placeholder="3ª ORDEM · E o efeito do efeito? Cadeia de consequências..." value={ordem.terceira} onChange={(e)=>setOrdem({...ordem,terceira:e.target.value})} className="min-h-[70px] bg-input/40 font-mono text-xs"/>
              <Textarea placeholder="10ª ORDEM · Onde essa decisão me coloca em 10 níveis de causalidade?" value={ordem.decima} onChange={(e)=>setOrdem({...ordem,decima:e.target.value})} className="min-h-[70px] bg-input/40 font-mono text-xs"/>
              <Textarea placeholder="LONGO PRAZO · Como isso se conecta ao horizonte de 5-10 anos?" value={ordem.longoPrazo} onChange={(e)=>setOrdem({...ordem,longoPrazo:e.target.value})} className="min-h-[70px] bg-input/40 font-mono text-xs"/>
              <Textarea placeholder="ARQUITETURA · Que estrutura essa decisão constrói (ou destrói)?" value={ordem.arquitetura} onChange={(e)=>setOrdem({...ordem,arquitetura:e.target.value})} className="min-h-[70px] bg-input/40 font-mono text-xs"/>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={save} className="font-mono text-xs tracking-widest">REGISTRAR</Button>
              <Button variant="outline" onClick={analisar} disabled={loading} className="font-mono text-xs tracking-widest">
                <Sparkles className="size-3 mr-1"/>{loading?"ANALISANDO...":"ANÁLISE COGNITIVA IA"}
              </Button>
            </div>
            {aiOut && (
              <div className="hud-panel hud-corner p-3 mt-3">
                <div className="text-[10px] font-mono text-primary tracking-widest mb-1">OBSERVAÇÃO COGNITIVA</div>
                <p className="text-xs text-foreground/85 whitespace-pre-wrap">{aiOut}</p>
              </div>
            )}
          </HudCard>

          <HudCard title="ASSINATURA COGNITIVA · MÉTRICAS">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {l:"PROFUNDIDADE",v:"5°"},
                {l:"ARQUITETURA",v:"alta"},
                {l:"IMPULSIVIDADE",v:"baixa"},
                {l:"VISÃO LP",v:"crescente"},
              ].map(m=>(
                <div key={m.l} className="hud-panel hud-corner p-3 text-center">
                  <Activity className="size-3 text-primary mx-auto mb-1"/>
                  <div className="font-display text-lg text-primary hud-text-glow">{m.v}</div>
                  <div className="font-mono text-[9px] text-muted-foreground tracking-widest">{m.l}</div>
                </div>
              ))}
            </div>
          </HudCard>
        </TabsContent>
      </Tabs>
    </ModulePage>
  );
}
