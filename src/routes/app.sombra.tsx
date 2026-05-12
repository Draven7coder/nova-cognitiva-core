import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";

export const Route = createFileRoute("/app/sombra")({ component: SombraPage });

const FIELDS: { key: string; label: string }[] = [
  { key: "insecurities", label: "Inseguranças" },
  { key: "destructive_patterns", label: "Padrões Destrutivos" },
  { key: "ego", label: "Ego" },
  { key: "impulses", label: "Impulsos" },
  { key: "mental_addictions", label: "Vícios Mentais" },
  { key: "validation_need", label: "Necessidade de Validação" },
  { key: "self_sabotage", label: "Autossabotagem" },
  { key: "recurrent_patterns", label: "Padrões Recorrentes Detectados" },
];

function SombraPage() {
  return (
    <ModulePage code="// SHD 08" title="Sombra" subtitle="Módulo privado · autoconhecimento profundo · Autosave + Versionamento + Proteção.">
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">MEMÓRIA PERMANENTE · MÓDULO PRIVADO</span>
        <span>· conteúdo versionado · histórico inalterável.</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <HudCard key={f.key} title={f.label.toUpperCase()}>
            <ProtectedField module="sombra" fieldKey={f.key} placeholder="..." minHeight={110} />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
