import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookMarked, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/leitura")({ component: LeituraPage });

const BLOCK_SIZE = 20;

function LeituraPage() {
  const { user } = useAuth();
  const sb: any = supabase;
  const [books, setBooks] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", author: "", total_pages: "" });
  const [layers, setLayers] = useState({ literal: "", critical: "", applied: "" });
  const [busy, setBusy] = useState(false);

  const active = books.find((b) => b.id === activeId) ?? null;

  const loadBooks = async () => {
    if (!user) return;
    const { data } = await sb.from("reading_books").select("*").order("created_at", { ascending: false });
    setBooks(data ?? []);
    if (!activeId && data?.length) setActiveId(data[0].id);
  };
  const loadBlocks = async (bookId: string) => {
    const { data } = await sb.from("reading_blocks").select("*").eq("book_id", bookId).order("page_start", { ascending: false });
    setBlocks(data ?? []);
  };

  useEffect(() => { loadBooks(); }, [user]);
  useEffect(() => { if (activeId) loadBlocks(activeId); }, [activeId]);

  const addBook = async () => {
    if (!user || !form.title.trim()) return;
    if (books.filter((b) => b.status === "active").length >= 3) {
      toast.error("Máximo de 3 livros ativos. Conclua ou arquive um.");
      return;
    }
    const { data } = await sb.from("reading_books").insert({
      user_id: user.id, title: form.title.trim(), author: form.author.trim() || null,
      total_pages: Number(form.total_pages) || 0,
    }).select("id").maybeSingle();
    setForm({ title: "", author: "", total_pages: "" });
    await loadBooks();
    if (data?.id) setActiveId(data.id);
  };

  const archive = async (id: string) => {
    await sb.from("reading_books").update({ status: "archived" }).eq("id", id);
    loadBooks();
  };

  const nextStart = active ? (active.current_page ?? 0) + 1 : 1;
  const nextEnd = nextStart + BLOCK_SIZE - 1;

  const closeBlock = async () => {
    if (!user || !active) return;
    if (!layers.literal.trim()) { toast.error("Preencha ao menos a camada literal."); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyst", {
        body: {
          scope: "reading",
          context: {
            book: `${active.title}${active.author ? " — " + active.author : ""}`,
            page_start: nextStart, page_end: nextEnd,
            literal: layers.literal, critical: layers.critical, applied: layers.applied,
          },
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const triangulation = (data as any).content as string;
      const cards = (data as any).cards as any[] | null;

      await sb.from("reading_blocks").insert({
        user_id: user.id, book_id: active.id, page_start: nextStart, page_end: nextEnd,
        literal_layer: layers.literal, critical_layer: layers.critical, applied_layer: layers.applied,
        ai_triangulation: triangulation,
      });
      await sb.from("reading_books").update({ current_page: nextEnd }).eq("id", active.id);

      if (cards?.length) {
        await sb.from("review_cards").insert(
          cards.slice(0, 8).map((c) => ({
            user_id: user.id, front: String(c.front ?? "").slice(0, 500), back: String(c.back ?? "").slice(0, 1000),
            deck: "leitura", source: active.title,
          })),
        );
      }
      setLayers({ literal: "", critical: "", applied: "" });
      await loadBooks();
      await loadBlocks(active.id);
      toast.success(`Bloco fechado. ${cards?.length ?? 0} cartões gerados.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <ModulePage
      code="// LTR 25"
      title="Protocolo de Leitura"
      subtitle="Até 3 livros ativos · blocos de 20 páginas · triangularização em 3 camadas · cartões automáticos."
      explanation="Cadastre até 3 livros. A cada 20 páginas, escreva as três camadas (literal, crítica, aplicada) e feche o bloco: a IA triangula e gera cartões de revisão espaçada."
    >
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <div className="space-y-4">
          <HudCard title="NOVO LIVRO">
            <div className="space-y-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" />
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Autor" />
              <Input value={form.total_pages} onChange={(e) => setForm({ ...form, total_pages: e.target.value })} placeholder="Total de páginas" inputMode="numeric" />
              <Button onClick={addBook} size="sm" className="w-full font-mono text-[10px] tracking-widest hud-glow">
                <Plus className="size-3 mr-1" /> ADICIONAR
              </Button>
            </div>
          </HudCard>

          <HudCard title="LIVROS ATIVOS">
            {books.filter((b) => b.status === "active").length === 0 && (
              <div className="text-[11px] text-muted-foreground">Nenhum livro ativo.</div>
            )}
            <div className="space-y-2">
              {books.filter((b) => b.status === "active").map((b) => {
                const pct = b.total_pages ? Math.min(100, Math.round((b.current_page / b.total_pages) * 100)) : 0;
                return (
                  <div key={b.id} className={`p-2 rounded border transition ${activeId === b.id ? "border-primary/60 bg-primary/10" : "border-border/40"}`}>
                    <button onClick={() => setActiveId(b.id)} className="w-full text-left">
                      <div className="text-xs truncate">{b.title}</div>
                      <div className="font-mono text-[9px] text-muted-foreground">{b.current_page}/{b.total_pages || "?"} pág · {pct}%</div>
                      <div className="h-1 rounded bg-muted/40 overflow-hidden mt-1">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                    <button onClick={() => archive(b.id)} className="mt-1 text-[9px] font-mono text-muted-foreground hover:text-destructive flex items-center gap-1">
                      <Trash2 className="size-3" /> ARQUIVAR
                    </button>
                  </div>
                );
              })}
            </div>
          </HudCard>
        </div>

        <div className="space-y-4">
          {!active ? (
            <HudCard>
              <div className="text-xs font-mono text-muted-foreground py-12 text-center">
                <BookMarked className="size-5 mx-auto mb-2 text-primary/60" />
                Cadastre ou selecione um livro para abrir o bloco de leitura.
              </div>
            </HudCard>
          ) : (
            <>
              <HudCard title={`BLOCO ATUAL · PÁG ${nextStart}–${nextEnd}`}>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-1">1. LITERAL</div>
                    <Textarea value={layers.literal} onChange={(e) => setLayers({ ...layers, literal: e.target.value })} placeholder="O que o texto diz..." className="min-h-[150px] text-xs" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-1">2. CRÍTICA</div>
                    <Textarea value={layers.critical} onChange={(e) => setLayers({ ...layers, critical: e.target.value })} placeholder="O que você questiona..." className="min-h-[150px] text-xs" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-1">3. APLICADA</div>
                    <Textarea value={layers.applied} onChange={(e) => setLayers({ ...layers, applied: e.target.value })} placeholder="Como usar na vida real..." className="min-h-[150px] text-xs" />
                  </div>
                </div>
                <Button onClick={closeBlock} disabled={busy} className="mt-3 font-mono text-xs tracking-widest hud-glow">
                  <Sparkles className="size-3 mr-2" /> {busy ? "TRIANGULANDO..." : "FECHAR BLOCO E TRIANGULAR"}
                </Button>
              </HudCard>

              <HudCard title="BLOCOS ANTERIORES">
                {blocks.length === 0 && <div className="text-[11px] text-muted-foreground">Nenhum bloco fechado ainda.</div>}
                <div className="space-y-3">
                  {blocks.map((b) => (
                    <div key={b.id} className="border border-border/40 rounded p-3">
                      <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80">PÁG {b.page_start}–{b.page_end}</div>
                      <div className="text-xs whitespace-pre-wrap mt-2 text-foreground/90">{b.ai_triangulation}</div>
                    </div>
                  ))}
                </div>
              </HudCard>
            </>
          )}
        </div>
      </div>
    </ModulePage>
  );
}
