import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Crown, Swords, Eye, Brain, Target, Layers, Activity, Sparkles, Crosshair,
} from "lucide-react";

export const Route = createFileRoute("/app/xadrez")({ component: XadrezPage });

const ERROR_TAGS = ["tático", "estratégico", "psicológico", "impulsividade", "cálculo incorreto", "visão limitada"];

function XadrezPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);

  // Pré-partida
  const [pre, setPre] = useState({ padroes: "", finais: "", hipotese: "" });
  // 5 níveis
  const [niveis, setNiveis] = useState({ n1: "", n2: "", n3: "", n4: "", n5: "" });
  // Pós-partida
  const [pos, setPos] = useState({ analiseLivre: "", erros: "", tags: [] as string[], engine: "", insights: "" });
  // Treino invisível
  const [invisivel, setInvisivel] = useState({ tipo: "visualização", conteudo: "" });
  // IA loading
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .like("module", "xadrez:%")
      .order("created_at", { ascending: false })
      .limit(20);
    setEntries(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const save = async (sub: string, title: string, content: string) => {
    if (!content.trim()) return toast.error("Vazio.");
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user!.id, module: `xadrez:${sub}`, title, content,
    });
    if (error) toast.error(error.message);
    else { toast.success("Registrado no laboratório."); load(); }
  };

  const analisarIA = async (texto: string, contexto: string) => {
    setAiLoading(true); setAiOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          mode: "cognitive_chess",
          prompt: `Analise como treinador cognitivo de elite (xadrez + pensamento estratégico). Contexto: ${contexto}.\n\n${texto}\n\nAvalie: profundidade de cálculo, ordem do pensamento, padrões de erro, qualidade estratégica, controle emocional. Gere observação curta e precisa.`,
        },
      });
      if (error) throw error;
      setAiOutput(data?.report || data?.content || "Análise indisponível.");
    } catch (e: any) { toast.error(e.message); }
    finally { setAiLoading(false); }
  };

  const toggleTag = (t: string) =>
    setPos((p) => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] }));

  return (
    <ModulePage
      code="// COG · XAD"
      title="Xadrez · Pensamento Estratégico"
      subtitle="Laboratório de cognição profunda · cálculo, padrões, ordens de pensamento, arquitetura de decisão."
    >
      <div className="grid md:grid-cols-4 gap-3">
        <HudCard title="ORDEM COGNITIVA"><div className="font-display text-3xl text-primary hud-text-glow">5°</div><div className="text-xs text-muted-foreground mt-1">profundidade média</div></HudCard>
        <HudCard title="PARTIDAS REGISTRADAS"><div className="font-display text-3xl text-primary hud-text-glow">{entries.filter(e=>e.module==="xadrez:pos").length}</div><div className="text-xs text-muted-foreground mt-1">com análise profunda</div></HudCard>
        <HudCard title="TREINO INVISÍVEL"><div className="font-display text-3xl text-primary hud-text-glow">{entries.filter(e=>e.module==="xadrez:invisivel").length}</div><div className="text-xs text-muted-foreground mt-1">sessões mentais</div></HudCard>
        <HudCard title="INSIGHTS ESTRATÉGICOS"><div className="font-display text-3xl text-primary hud-text-glow">{entries.length}</div><div className="text-xs text-muted-foreground mt-1">total acumulado</div></HudCard>
      </div>

      <HudCard title="♟️ PROTOCOLO DE TREINO COGNITIVO DE ALTA PROFUNDIDADE">
        <p className="text-xs text-muted-foreground mb-4">
          Sistema operacional de pensamento profundo. Toda partida é tratada como sessão de engenharia cognitiva.
        </p>

        <Tabs defaultValue="pre">
          <TabsList className="bg-input/30 border border-border/40 grid grid-cols-4 w-full">
            <TabsTrigger value="pre" className="font-mono text-[10px] tracking-widest"><Crosshair className="size-3 mr-1"/>PRÉ-PARTIDA</TabsTrigger>
            <TabsTrigger value="niveis" className="font-mono text-[10px] tracking-widest"><Layers className="size-3 mr-1"/>5 NÍVEIS</TabsTrigger>
            <TabsTrigger value="pos" className="font-mono text-[10px] tracking-widest"><Brain className="size-3 mr-1"/>PÓS-PARTIDA</TabsTrigger>
            <TabsTrigger value="invisivel" className="font-mono text-[10px] tracking-widest"><Eye className="size-3 mr-1"/>INVISÍVEL</TabsTrigger>
          </TabsList>

          <TabsContent value="pre" className="space-y-3 mt-4">
            <div className="text-xs text-primary/80 font-mono tracking-widest">RITUAL PRÉ-PARTIDA</div>
            <Textarea placeholder="Padrões táticos revisados (forks, pins, sacrifícios temáticos, motivos)..." value={pre.padroes} onChange={(e)=>setPre({...pre,padroes:e.target.value})} className="min-h-[80px] bg-input/40 font-mono text-xs"/>
            <Textarea placeholder="Finais revisados (rei+peão, torres, oposição, técnicas)..." value={pre.finais} onChange={(e)=>setPre({...pre,finais:e.target.value})} className="min-h-[80px] bg-input/40 font-mono text-xs"/>
            <Textarea placeholder="Hipótese estratégica para a partida (qual estrutura buscar, plano-mãe, contra que perfil de adversário)..." value={pre.hipotese} onChange={(e)=>setPre({...pre,hipotese:e.target.value})} className="min-h-[80px] bg-input/40 font-mono text-xs"/>
            <Button onClick={()=>save("pre","Ritual Pré-Partida",`PADRÕES:\n${pre.padroes}\n\nFINAIS:\n${pre.finais}\n\nHIPÓTESE:\n${pre.hipotese}`)} className="font-mono text-xs tracking-widest">REGISTRAR RITUAL</Button>
          </TabsContent>

          <TabsContent value="niveis" className="space-y-3 mt-4">
            <div className="text-xs text-primary/80 font-mono tracking-widest">MÉTODO DOS 5 NÍVEIS · DURANTE A PARTIDA</div>
            {[
              ["n1","1. O que o adversário quer"],
              ["n2","2. Pior ameaça real"],
              ["n3","3. Melhores lances candidatos (3+)"],
              ["n4","4. Resposta forçada do adversário"],
              ["n5","5. Como a posição impacta o final"],
            ].map(([k,label])=>(
              <Textarea key={k} placeholder={label as string} value={(niveis as any)[k]} onChange={(e)=>setNiveis({...niveis,[k]:e.target.value})} className="min-h-[60px] bg-input/40 font-mono text-xs"/>
            ))}
            <Button onClick={()=>save("niveis","Análise 5 Níveis",Object.entries(niveis).map(([k,v])=>`${k.toUpperCase()}: ${v}`).join("\n\n"))} className="font-mono text-xs tracking-widest">REGISTRAR POSIÇÃO</Button>
          </TabsContent>

          <TabsContent value="pos" className="space-y-3 mt-4">
            <div className="text-xs text-primary/80 font-mono tracking-widest">PÓS-PARTIDA · ANÁLISE PROFUNDA</div>
            <Textarea placeholder="ETAPA 1 · Análise SEM engine: o que você viu, sentiu, calculou..." value={pos.analiseLivre} onChange={(e)=>setPos({...pos,analiseLivre:e.target.value})} className="min-h-[100px] bg-input/40 font-mono text-xs"/>
            <Textarea placeholder="ETAPA 2 · Erros identificados (lance, posição, raciocínio que falhou)..." value={pos.erros} onChange={(e)=>setPos({...pos,erros:e.target.value})} className="min-h-[80px] bg-input/40 font-mono text-xs"/>
            <div>
              <div className="text-[10px] font-mono text-muted-foreground mb-1">CLASSIFICAÇÃO DOS ERROS</div>
              <div className="flex flex-wrap gap-1.5">
                {ERROR_TAGS.map((t)=>(
                  <button key={t} onClick={()=>toggleTag(t)}
                    className={`font-mono text-[10px] tracking-widest px-2 py-1 rounded border transition ${
                      pos.tags.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground"
                    }`}>{t.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <Textarea placeholder="ETAPA 3 · Comparação com engine (divergências, lances melhores, avaliações)..." value={pos.engine} onChange={(e)=>setPos({...pos,engine:e.target.value})} className="min-h-[80px] bg-input/40 font-mono text-xs"/>
            <Textarea placeholder="ETAPA 4 · Insight estratégico final (lição transferível para vida/decisão)..." value={pos.insights} onChange={(e)=>setPos({...pos,insights:e.target.value})} className="min-h-[80px] bg-input/40 font-mono text-xs"/>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={()=>save("pos","Análise Pós-Partida",`SEM ENGINE:\n${pos.analiseLivre}\n\nERROS:\n${pos.erros}\n\nTAGS: ${pos.tags.join(", ")}\n\nENGINE:\n${pos.engine}\n\nINSIGHT:\n${pos.insights}`)} className="font-mono text-xs tracking-widest">REGISTRAR ANÁLISE</Button>
              <Button variant="outline" disabled={aiLoading} onClick={()=>analisarIA(`${pos.analiseLivre}\n\nERROS: ${pos.erros}\nTAGS: ${pos.tags.join(",")}\nENGINE: ${pos.engine}`,"pós-partida")} className="font-mono text-xs tracking-widest">
                <Sparkles className="size-3 mr-1"/>{aiLoading?"ANALISANDO...":"ANÁLISE COGNITIVA IA"}
              </Button>
            </div>
            {aiOutput && (
              <div className="hud-panel hud-corner p-3 mt-2">
                <div className="text-[10px] font-mono text-primary tracking-widest mb-1">OBSERVAÇÃO COGNITIVA</div>
                <p className="text-xs text-foreground/85 whitespace-pre-wrap">{aiOutput}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invisivel" className="space-y-3 mt-4">
            <div className="text-xs text-primary/80 font-mono tracking-widest">TREINO INVISÍVEL · SEM TABULEIRO</div>
            <div className="flex flex-wrap gap-2">
              {["visualização","cálculo mental","partida mental","memória espacial","simulação de variantes"].map(t=>(
                <button key={t} onClick={()=>setInvisivel({...invisivel,tipo:t})}
                  className={`font-mono text-[10px] tracking-widest px-3 py-1.5 rounded border ${
                    invisivel.tipo===t?"border-primary bg-primary/10 text-primary":"border-border/50 text-muted-foreground"
                  }`}>{t.toUpperCase()}</button>
              ))}
            </div>
            <Textarea placeholder="Posição visualizada / variantes calculadas mentalmente / partida jogada de cabeça..." value={invisivel.conteudo} onChange={(e)=>setInvisivel({...invisivel,conteudo:e.target.value})} className="min-h-[140px] bg-input/40 font-mono text-xs"/>
            <Button onClick={()=>save("invisivel",`Treino Invisível · ${invisivel.tipo}`,invisivel.conteudo)} className="font-mono text-xs tracking-widest">REGISTRAR SESSÃO MENTAL</Button>
          </TabsContent>
        </Tabs>
      </HudCard>

      <div className="grid md:grid-cols-2 gap-4">
        <HudCard title="ESTUDO DE PARTIDAS · CLÁSSICAS">
          <p className="text-xs text-muted-foreground mb-2">Registre análises profundas de partidas magistrais (Capablanca, Kasparov, Carlsen, Tal...).</p>
          <Textarea placeholder="Partida estudada · jogadas-chave · ideias estratégicas extraídas..." className="min-h-[100px] bg-input/40 font-mono text-xs" id="estudo-input"/>
          <Button className="mt-2 font-mono text-xs tracking-widest" onClick={()=>{
            const el = document.getElementById("estudo-input") as HTMLTextAreaElement;
            save("estudo","Estudo de Partida",el.value); el.value="";
          }}>REGISTRAR ESTUDO</Button>
        </HudCard>
        <HudCard title="RECONHECIMENTO DE PADRÕES">
          <p className="text-xs text-muted-foreground mb-2">Catalogue padrões táticos e estruturais que você está internalizando.</p>
          <Textarea placeholder="Padrão · estrutura · gatilho · resposta tipo..." className="min-h-[100px] bg-input/40 font-mono text-xs" id="padrao-input"/>
          <Button className="mt-2 font-mono text-xs tracking-widest" onClick={()=>{
            const el = document.getElementById("padrao-input") as HTMLTextAreaElement;
            save("padrao","Padrão Reconhecido",el.value); el.value="";
          }}>CATALOGAR PADRÃO</Button>
        </HudCard>
      </div>

      <HudCard title="ARQUIVO COGNITIVO · ÚLTIMOS REGISTROS">
        {entries.length===0 ? <div className="text-sm text-muted-foreground">Nenhum registro ainda.</div> : (
          <ul className="space-y-2">
            {entries.slice(0,8).map((e)=>(
              <li key={e.id} className="border-b border-border/30 pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-mono text-[10px] text-primary tracking-widest">{e.module.replace("xadrez:","").toUpperCase()}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <div className="text-sm text-foreground/85 mt-1">{e.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 font-mono">{e.content}</div>
              </li>
            ))}
          </ul>
        )}
      </HudCard>
    </ModulePage>
  );
}
