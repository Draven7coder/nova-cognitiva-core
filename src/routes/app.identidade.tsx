import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";

export const Route = createFileRoute("/app/identidade")({ component: IdentidadePage });

const FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "archetype", label: "Arquétipo", placeholder: "O Estrategista..." },
  { key: "values_text", label: "Valores", placeholder: "Verdade, soberania, profundidade..." },
  { key: "principles", label: "Princípios", placeholder: "Princípios não-negociáveis..." },
  { key: "moral_code", label: "Código Moral", placeholder: "..." },
  { key: "worldview", label: "Visão de Mundo", placeholder: "..." },
  { key: "future_identity", label: "Identidade Futura", placeholder: "Quem você está se tornando..." },
  { key: "strengths", label: "Forças", placeholder: "..." },
  { key: "weaknesses", label: "Fraquezas", placeholder: "..." },
  { key: "central_phrase", label: "Frase Central", placeholder: "..." },
  { key: "philosophy", label: "Filosofia Pessoal", placeholder: "..." },
  { key: "existential_mission", label: "Missão Existencial", placeholder: "..." },
];

function IdentidadePage() {
  return (
    <ModulePage
      code="// IDN 01"
      title="Matriz de Identidade"
      subtitle="A definição soberana de quem você é, foi e está se tornando. · Autosave + Versionamento + Proteção."
    >
      <div className="hud-panel hud-corner p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
        <span className="font-mono text-[10px] tracking-widest text-primary">MEMÓRIA PERMANENTE ATIVA</span>
        <span>· nada se perde · cada edição cria uma versão · sessão recuperada automaticamente.</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <HudCard key={f.key} title={f.label.toUpperCase()}>
            <ProtectedField module="identidade" fieldKey={f.key} placeholder={f.placeholder} minHeight={110} />
          </HudCard>
        ))}
      </div>
    </ModulePage>
  );
}
