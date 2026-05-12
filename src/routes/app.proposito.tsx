import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";

export const Route = createFileRoute("/app/proposito")({ component: PropositoPage });

const FIELDS: { key: string; label: string }[] = [
  { key: "obj_1y", label: "Objetivos de 1 ano" },
  { key: "obj_5y", label: "Objetivos de 5 anos" },
  { key: "obj_10y", label: "Objetivos de 10 anos" },
  { key: "obj_20y", label: "Objetivos de 20 anos" },
  { key: "legacy", label: "Legado" },
  { key: "transcendental", label: "Visão Transcendental" },
  { key: "conquest_map", label: "Mapa de Conquista" },
  { key: "existential_direction", label: "Direção Existencial" },
];

function PropositoPage() {
  return (
    <ModulePage code="// PRP 02" title="Propósito Supremo" subtitle="Visão estratégica de vida · timeline transcendental · Autosave + Versionamento + Proteção.">
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">MEMÓRIA PERMANENTE ATIVA</span>
        <span>· cada edição cria uma nova versão · nada se perde.</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <HudCard key={f.key} title={f.label.toUpperCase()}>
            <ProtectedField module="proposito" fieldKey={f.key} placeholder="..." minHeight={110} />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
