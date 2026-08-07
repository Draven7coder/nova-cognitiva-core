import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/rendas")({
  component: RendasPage,
  head: () => ({
    meta: [
      { title: "Sistema das 6 Rendas · Núcleo Supremo" },
      { name: "description", content: "Planejamento financeiro e mordomia: seis fontes de renda mapeadas, medidas e balanceadas mês a mês." },
      { property: "og:title", content: "Sistema das 6 Rendas · Núcleo Supremo" },
      { property: "og:description", content: "Mapeie ativa, portfólio, passiva, royalties, negócio e reserva — e veja a dependência real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TIPOS = [
  { id: "ativa", d: "Troca direta de tempo por dinheiro. Salário, freela, serviço." },
  { id: "portfólio", d: "Capital trabalhando. Juros, dividendos, valorização." },
  { id: "passiva", d: "Aluguéis, licenças, assinaturas recorrentes." },
  { id: "royalties", d: "Obra criada uma vez que continua pagando." },
  { id: "negócio", d: "Sistema com pessoas e processos que roda sem você." },
  { id: "reserva", d: "Mordomia: caixa de segurança, dízimo, doação, poupança-blindagem." },
];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function RendasPage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState(TIPOS[0].id);
  const [amount, setAmount] = useState(0);
  const [month, setMonth] = useState(monthStart());

  const load = async () => {
    const { data } = await sb.from("income_streams").select("*").order("ref_month", { ascending: false }).limit(200);
    setRows(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const add = async () => {
    if (!name.trim() || !user) { toast.error("Nomeie a fonte."); return; }
    const { error } = await sb.from("income_streams").insert({ user_id: user.id, name, stream_type: type, amount, ref_month: month });
    if (error) return toast.error(error.message);
    setName(""); setAmount(0);
    toast.success("Fonte registrada.");
    load();
  };

  const remove = async (r: any) => { await sb.from("income_streams").delete().eq("id", r.id); load(); };

  const current = useMemo(() => rows.filter((r) => r.ref_month === month), [rows, month]);
  const total = current.reduce((a, r) => a + Number(r.amount ?? 0), 0);
  const byType = TIPOS.map((t) => ({
    ...t,
    total: current.filter((r) => r.stream_type === t.id).reduce((a, r) => a + Number(r.amount ?? 0), 0),
  }));
  const activeShare = total ? Math.round((byType[0].total / total) * 100) : 0;
  const ativos = byType.filter((t) => t.total > 0).length;

  return (
    <ModulePage
      code="// SIX 31"
      title="Sistema das 6 Rendas"
      subtitle="Planejamento financeiro e mordomia. Uma renda é corda no pescoço; seis é rede de segurança."
      explanation="Registre cada fonte de renda do mês e classifique entre os seis tipos. O painel mostra a dependência da renda ativa (quanto menor, mais livre você é) e quantos dos seis canais estão vivos."
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <HudCard title="NOVA FONTE">
            <div className="space-y-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Consultoria mensal" />
              <div className="flex flex-wrap gap-1">
                {TIPOS.map((t) => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className={`px-2 py-1 rounded border font-mono text-[10px] tracking-widest transition ${type === t.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                    {t.id.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Valor" />
                <Input type="month" value={month.slice(0, 7)} onChange={(e) => setMonth(`${e.target.value}-01`)} />
              </div>
              <Button onClick={add} className="w-full font-mono text-xs tracking-widest hud-glow">
                <Coins className="size-3 mr-2" /> REGISTRAR FONTE
              </Button>
            </div>
          </HudCard>

          <HudCard title={`FONTES · ${month.slice(0, 7)}`}>
            <div className="space-y-2">
              {current.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma fonte neste mês.</div>}
              {current.map((r) => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded border border-border/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{r.name}</div>
                    <div className="font-mono text-[9px] tracking-widest text-muted-foreground">{String(r.stream_type).toUpperCase()}</div>
                  </div>
                  <div className="font-mono text-xs text-primary">{brl(Number(r.amount ?? 0))}</div>
                  <button onClick={() => remove(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          <HudCard title="TOTAL DO MÊS">
            <div className="font-display text-2xl text-primary hud-text-glow">{brl(total)}</div>
            <div className="font-mono text-[10px] text-muted-foreground mt-1">
              {ativos}/6 canais ativos · {activeShare}% depende de renda ativa
            </div>
          </HudCard>

          <HudCard title="DISTRIBUIÇÃO">
            <div className="space-y-3">
              {byType.map((t) => {
                const pct = total ? Math.round((t.total / total) * 100) : 0;
                return (
                  <div key={t.id}>
                    <div className="flex justify-between font-mono text-[10px] tracking-widest">
                      <span className="text-primary">{t.id.toUpperCase()}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded bg-muted/40 overflow-hidden mt-1">
                      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug mt-1">{t.d}</div>
                  </div>
                );
              })}
            </div>
          </HudCard>
        </div>
      </div>
    </ModulePage>
  );
}
