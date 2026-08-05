import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Download, Upload, RefreshCw, ShieldAlert, CheckCircle2, Smartphone } from "lucide-react";
import { APP_VERSION, APP_CODENAME, CHANGELOG, FOUNDATIONAL_DECLARATION } from "@/lib/app-version";
import {
  buildBackup, downloadBackup, saveBackupLocally, readLocalBackupMeta,
  pushBackupToCloud, fetchCloudBackupMeta, parseBackupFile, restoreBackup,
} from "@/lib/backup";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/atualizacoes")({
  head: () => ({
    meta: [
      { title: "Atualizações e Backup — Wayne OS" },
      { name: "description", content: "Versão do sistema, changelog e backup completo dos seus dados operacionais." },
      { property: "og:title", content: "Atualizações e Backup — Wayne OS" },
      { property: "og:description", content: "Versão do sistema, changelog e backup completo dos seus dados operacionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AtualizacoesPage,
});

function AtualizacoesPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [localMeta, setLocalMeta] = useState<{ exported_at: string; app_version: string } | null>(null);
  const [cloudMeta, setCloudMeta] = useState<{ updated_at: string; app_version: string | null } | null>(null);
  const [pending, setPending] = useState<Awaited<ReturnType<typeof parseBackupFile>> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocalMeta(readLocalBackupMeta()); }, []);
  useEffect(() => {
    if (!user) return;
    fetchCloudBackupMeta(user.id).then(setCloudMeta).catch(() => {});
  }, [user]);

  const doExport = async () => {
    if (!user) return;
    setBusy("export");
    try {
      const payload = await buildBackup(user.id);
      downloadBackup(payload);
      saveBackupLocally(payload);
      setLocalMeta(readLocalBackupMeta());
      toast.success("Backup exportado.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao exportar backup.");
    } finally { setBusy(null); }
  };

  const doCloudSync = async () => {
    if (!user) return;
    setBusy("cloud");
    try {
      const payload = await buildBackup(user.id);
      await pushBackupToCloud(user.id, payload);
      saveBackupLocally(payload);
      setLocalMeta(readLocalBackupMeta());
      setCloudMeta(await fetchCloudBackupMeta(user.id));
      toast.success("Snapshot enviado para a nuvem.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao sincronizar.");
    } finally { setBusy(null); }
  };

  const onPickFile = async (f: File) => {
    try {
      setPending(parseBackupFile(await f.text()));
    } catch (e: any) {
      toast.error(e.message ?? "Arquivo inválido.");
    }
  };

  const confirmRestore = async () => {
    if (!user || !pending) return;
    const payload = pending;
    setPending(null);
    setBusy("import");
    try {
      const { restored, skipped } = await restoreBackup(user.id, payload);
      toast.success(`${restored} registros restaurados.${skipped.length ? ` Ignorados: ${skipped.join(", ")}` : ""}`);
      setTimeout(() => window.location.reload(), 900);
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao importar backup.");
    } finally { setBusy(null); }
  };

  return (
    <ModulePage
      code="// UPD 00"
      title="ATUALIZAÇÕES E BACKUP"
      subtitle={FOUNDATIONAL_DECLARATION}
    >
      <HudCard title="VERSÃO DO SISTEMA">
        <div className="flex items-end gap-3">
          <span className="font-display text-4xl text-primary hud-text-glow">{APP_VERSION}</span>
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground pb-1">"{APP_CODENAME.toUpperCase()}"</span>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground mt-2 flex items-center gap-2">
          <Smartphone className="size-3" /> Instalável no celular pelo menu do navegador · "Adicionar à tela de início".
        </p>
      </HudCard>

      <HudCard title="CHANGELOG">
        <div className="space-y-4">
          {CHANGELOG.map((e) => (
            <div key={e.version} className="border-l-2 border-primary/40 pl-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-sm text-primary">v{e.version}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{e.date}</span>
              </div>
              <div className="font-display text-sm text-foreground/90">{e.title}</div>
              <ul className="mt-1 space-y-0.5">
                {e.changes.map((c) => (
                  <li key={c} className="text-[11px] font-mono text-muted-foreground flex gap-2">
                    <CheckCircle2 className="size-3 mt-0.5 shrink-0 text-primary/70" />{c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </HudCard>

      <HudCard title="BACKUP · EXPORTAR">
        <p className="text-[11px] font-mono text-muted-foreground mb-3">
          Gera um arquivo .json com todos os seus registros de todos os módulos.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={doExport} disabled={!!busy} className="font-mono text-[10px] tracking-widest min-h-[44px]">
            <Download className="size-3 mr-1" /> {busy === "export" ? "GERANDO..." : "BAIXAR BACKUP"}
          </Button>
          <Button variant="outline" onClick={doCloudSync} disabled={!!busy} className="font-mono text-[10px] tracking-widest min-h-[44px]">
            <RefreshCw className={`size-3 mr-1 ${busy === "cloud" ? "animate-spin" : ""}`} /> SINCRONIZAR NA NUVEM
          </Button>
        </div>
        <div className="mt-3 space-y-1 font-mono text-[10px] text-muted-foreground">
          <div>ÚLTIMO LOCAL: <span className="text-foreground/70">{localMeta ? new Date(localMeta.exported_at).toLocaleString("pt-BR") : "—"}</span></div>
          <div>ÚLTIMO NA NUVEM: <span className="text-foreground/70">{cloudMeta ? new Date(cloudMeta.updated_at).toLocaleString("pt-BR") : "—"}</span></div>
        </div>
      </HudCard>

      <HudCard title="BACKUP · IMPORTAR">
        <div className="flex items-start gap-2 mb-3 text-[11px] font-mono text-destructive">
          <ShieldAlert className="size-4 shrink-0" />
          <span>A importação SOBRESCREVE os dados atuais deste operador. Exporte um backup antes.</span>
        </div>
        <input
          ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickFile(f); e.target.value = ""; }}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={!!busy}
          className="font-mono text-[10px] tracking-widest min-h-[44px]">
          <Upload className="size-3 mr-1" /> {busy === "import" ? "RESTAURANDO..." : "SELECIONAR ARQUIVO .JSON"}
        </Button>
      </HudCard>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Sobrescrever todos os dados?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Backup de {pending ? new Date(pending.exported_at).toLocaleString("pt-BR") : ""} · v{pending?.app_version}.
              Todos os seus registros atuais serão apagados e substituídos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">CANCELAR</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="font-mono text-xs">RESTAURAR</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModulePage>
  );
}
