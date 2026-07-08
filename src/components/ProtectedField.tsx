import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProtectedField } from "@/hooks/useProtectedField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, Unlock, History, Save, CheckCircle2, Circle, AlertCircle, RotateCcw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  module: string;
  fieldKey: string;
  placeholder?: string;
  minHeight?: number;
}

type Suggestion = {
  id: string;
  suggested_content: string;
  reason: string | null;
  created_at: string;
};

export function ProtectedField({ module, fieldKey, placeholder, minHeight = 100 }: Props) {
  const f = useProtectedField(module, fieldKey);
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("ai_suggestions")
        .select("id,suggested_content,reason,created_at")
        .eq("user_id", user.id)
        .eq("module", module)
        .eq("field_key", fieldKey)
        .eq("status", "pendente")
        .order("created_at", { ascending: false });
      if (!cancelled) setSuggestions((data ?? []) as Suggestion[]);
    })();
    return () => { cancelled = true; };
  }, [user, module, fieldKey]);

  const acceptSuggestion = async (s: Suggestion) => {
    f.unlock();
    f.setValue(s.suggested_content);
    await f.saveNow();
    await supabase.from("ai_suggestions").update({ status: "aceita" }).eq("id", s.id);
    setSuggestions((list) => list.filter((x) => x.id !== s.id));
    f.lock();
    toast.success("Sugestão aceita e versionada.");
  };

  const rejectSuggestion = async (s: Suggestion) => {
    await supabase.from("ai_suggestions").update({ status: "rejeitada" }).eq("id", s.id);
    setSuggestions((list) => list.filter((x) => x.id !== s.id));
  };

  const statusMeta = {
    idle:     { icon: Circle, txt: "sincronizado", color: "text-muted-foreground" },
    dirty:    { icon: Circle, txt: "não salvo", color: "text-yellow-400" },
    saving:   { icon: Circle, txt: "salvando...", color: "text-primary animate-pulse" },
    saved:    { icon: CheckCircle2, txt: "salvo", color: "text-primary" },
    restored: { icon: RotateCcw, txt: "sessão restaurada", color: "text-primary" },
    error:    { icon: AlertCircle, txt: "erro", color: "text-destructive" },
  }[f.status];

  const handleUnlock = () => {
    if (f.savedValue.length > 0) setConfirmOpen(true);
    else f.unlock();
  };

  const handleRestoreClick = (v: any) => setPendingRestore(v);

  return (
    <div className="space-y-2">
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div key={s.id} className="hud-panel border border-primary/40 p-2 rounded">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[9px] tracking-widest text-primary flex items-center gap-1">
                  <Sparkles className="size-3" /> SUGESTÃO DA IA
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono" onClick={() => acceptSuggestion(s)}>
                    <CheckCircle2 className="size-3 mr-1" /> ACEITAR
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono" onClick={() => rejectSuggestion(s)}>
                    <X className="size-3" />
                  </Button>
                </div>
              </div>
              {s.reason && <p className="text-[11px] text-muted-foreground italic mb-1">{s.reason}</p>}
              <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap line-clamp-4">{s.suggested_content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={f.value}
          readOnly={f.locked}
          onChange={(e) => f.setValue(e.target.value)}
          className={`bg-input/40 font-mono text-xs border-border/50 transition ${f.locked ? "opacity-80 cursor-not-allowed border-primary/30" : ""}`}
          style={{ minHeight }}
        />
        {f.locked && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border border-primary/30 font-mono text-[9px] tracking-widest text-primary">
            <Lock className="size-3" /> PROTEGIDO
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest ${statusMeta.color}`}>
          <statusMeta.icon className="size-3" />
          <span>{statusMeta.txt.toUpperCase()}</span>
          {f.versions.length > 0 && (
            <span className="text-muted-foreground/60 ml-2">v{f.versions[0].version}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {f.locked ? (
            <Button size="sm" variant="ghost" onClick={handleUnlock} className="h-7 font-mono text-[10px] tracking-widest">
              <Unlock className="size-3 mr-1" /> EDITAR
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" disabled={!f.isDirty} onClick={async () => { await f.saveNow(); toast.success("Versão criada."); }} className="h-7 font-mono text-[10px] tracking-widest">
                <Save className="size-3 mr-1" /> SALVAR EVOLUÇÃO
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { f.lock(); }} className="h-7 font-mono text-[10px] tracking-widest">
                <Lock className="size-3 mr-1" /> FECHAR
              </Button>
            </>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 font-mono text-[10px] tracking-widest">
                <History className="size-3 mr-1" /> {f.versions.length}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">Histórico de Versões</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {f.versions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma versão registrada.</p>}
                {f.versions.map((v) => (
                  <div key={v.id} className="hud-panel hud-corner p-3">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-mono text-[10px] tracking-widest text-primary">VERSÃO {v.version}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleString("pt-BR")}</div>
                    </div>
                    <p className="text-xs text-foreground/80 whitespace-pre-wrap font-mono line-clamp-4">{v.content || "(vazio)"}</p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 font-mono text-[10px] tracking-widest" onClick={() => handleRestoreClick(v)}>
                      <RotateCcw className="size-3 mr-1" /> RESTAURAR
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Confirmação de edição sobre conteúdo já salvo */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display tracking-wider">⚠️ Confirmação Crítica</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a editar conteúdo já salvo neste módulo. Toda alteração gera uma nova versão automaticamente — nada é perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs tracking-widest">CANCELAR</AlertDialogCancel>
            <AlertDialogAction onClick={() => f.unlock()} className="font-mono text-xs tracking-widest">
              CONTINUAR EDIÇÃO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de restauração */}
      <AlertDialog open={!!pendingRestore} onOpenChange={(o) => !o && setPendingRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display tracking-wider">⚠️ Restaurar Versão</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a substituir o conteúdo atual pela versão {pendingRestore?.version}. O conteúdo atual será preservado como uma nova versão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs tracking-widest">CANCELAR</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (pendingRestore) { await f.restore(pendingRestore); setPendingRestore(null); toast.success("Versão restaurada."); } }} className="font-mono text-xs tracking-widest">
              RESTAURAR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
