import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Drama, Landmark, Skull } from "lucide-react";

export const Route = createFileRoute("/app/wayne")({ component: WaynePage });

const PERSONAS = [
  {
    key: "social",
    emoji: "🎭",
    title: "Bruce Wayne Social",
    icon: Drama,
    accent: "text-amber-300 border-amber-400/40",
    who: "A máscara deliberada. O personagem que o mundo vê — carismático, leve, aparentemente superficial. Não é fraqueza, é camuflagem estratégica.",
    how: "Performar a persona sem entregar o verdadeiro self. Adaptar tom, profundidade e linguagem ao ambiente externo. Quanto mais distante parecer do Batman, melhor a cobertura.",
  },
  {
    key: "private",
    emoji: "🏛️",
    title: "Bruce Wayne Privado",
    icon: Landmark,
    accent: "text-primary border-primary/50",
    who: "O verdadeiro homem. Sem máscara, sem performance. Este sistema é a externalização direta desse ser — não um conflito, mas uma extensão. Aqui moram os valores, a espiritualidade e o PROPÓSITO em sua forma mais profunda.",
    how: "Simplesmente ser. O sistema já fala por esse homem.",
  },
  {
    key: "batman",
    emoji: "🦇",
    title: "Batman",
    icon: Skull,
    accent: "text-foreground border-foreground/60",
    who: "Bruce Privado com todos os recursos direcionados a um único objetivo. Modo de combate puro. Disciplina, foco e execução como única linguagem.",
    how: "Ativar disciplina máxima. Emoção subordinada à missão. Zero distração. Execução acima de qualquer coisa.",
  },
];

function WaynePage() {
  return (
    <ModulePage
      code="// WYN 21"
      title="PROTOCOLO WAYNE"
      subtitle="Três faces. Um homem. Uma missão."
    >
      <div className="grid lg:grid-cols-3 gap-4">
        {PERSONAS.map((p) => (
          <div
            key={p.key}
            className={`hud-panel hud-corner p-6 border ${p.accent} flex flex-col gap-4`}
          >
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="size-12 rounded-md hud-panel flex items-center justify-center text-2xl">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                  PERSONA / {p.key.toUpperCase()}
                </div>
                <div className={`font-display text-lg hud-text-glow ${p.accent.split(" ")[0]}`}>
                  {p.title}
                </div>
              </div>
              <p.icon className={`size-5 ${p.accent.split(" ")[0]}`} />
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-2">
                QUEM É
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{p.who}</p>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-2">
                COMO AGIR
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{p.how}</p>
            </div>
          </div>
        ))}
      </div>

      <HudCard title="REGRA CENTRAL">
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "Quanto mais perfeita a máscara social, mais livre o Batman opera nas sombras.
          E quanto mais silencioso o Bruce Privado, mais forte fala o sistema."
        </p>
      </HudCard>
    </ModulePage>
  );
}
