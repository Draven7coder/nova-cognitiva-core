import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { ProtectedField } from "@/components/ProtectedField";
import { Skull, Crosshair, Flame, Compass } from "lucide-react";

export const Route = createFileRoute("/app/wayne")({ component: TrinariusPage });

const PRINCIPIOS = [
  "Verdade acima de conveniência.",
  "Sabedoria acima de aparência.",
  "Disciplina acima de impulsos.",
  "Humildade acima do ego.",
  "Serviço acima do orgulho.",
  "Princípios cristãos como norte moral inegociável.",
  "A missão é maior que o humor do dia.",
];

const ARQUETIPOS = [
  {
    key: "batman",
    codename: "BATMAN",
    role: "Execução & Combate",
    icon: Skull,
    accent: "text-foreground border-foreground/60",
    principio:
      "Disciplina absoluta. Emoção subordinada à missão. Zero distração. Execução como única linguagem.",
    quando:
      "Fase de ação: cadeia ativa, missão crítica, prazo curto, alto risco, hostilidade externa, tentação de recuar.",
    como: [
      "Corta o supérfluo — social, entretenimento, opinião externa.",
      "Foco em UMA ação prioritária por vez, até fechá-la.",
      "Trata dor, cansaço e humor como ruído, não como argumento.",
      "Só sai do modo quando a missão está concluída, não quando fica difícil.",
    ],
    perguntas: [
      "Qual é a próxima ação concreta, agora, sem negociar?",
      "O que estou usando como desculpa emocional para não executar?",
      "Se eu tirasse a emoção da equação, o que a razão exigiria?",
    ],
  },
  {
    key: "reacher",
    codename: "REACHER",
    role: "Julgamento & Análise Fria",
    icon: Crosshair,
    accent: "text-primary border-primary/50",
    principio:
      "Observação silenciosa. Padrões antes de opiniões. Ação minimalista, precisa e proporcional ao contexto real.",
    quando:
      "Fase de leitura: ambiente novo, decisão importante, conflito, negociação, análise de pessoas, planejamento estratégico.",
    como: [
      "Escuta muito mais do que fala. Coleta dados antes de reagir.",
      "Identifica quem está ali por interesse, medo, ego ou lealdade real.",
      "Toma decisões com base em evidência observada, não em narrativa emocional.",
      "Age com o mínimo de força necessária — nunca mais, nunca menos.",
    ],
    perguntas: [
      "O que está acontecendo aqui que ninguém está dizendo em voz alta?",
      "Qual incentivo real move cada pessoa envolvida?",
      "Qual é a resposta suficiente — sem drama, sem excesso?",
    ],
  },
  {
    key: "red",
    codename: "RED REDDINGTON",
    role: "Estratégia & Influência",
    icon: Compass,
    accent: "text-amber-300 border-amber-400/40",
    principio:
      "Elegância operacional. Vantagem construída com informação, timing e relação. Nunca revela mais do que precisa.",
    quando:
      "Fase de articulação: conversas de alto valor, construção de rede, posicionamento, negociação, movimentos de longo prazo.",
    como: [
      "Fala com calma, escolhe palavra, controla o tempo da conversa.",
      "Entrega valor primeiro; cobra depois, em silêncio, quando importa.",
      "Guarda informação como ativo — só usa quando ela decide algo.",
      "Nunca desperdiça inimigo, nunca queima aliado, nunca implora nada.",
    ],
    perguntas: [
      "Qual é a jogada por trás desta jogada?",
      "Que informação eu tenho que os outros não têm — e como ela vira alavanca?",
      "Como saio deste encontro mais bem posicionado do que entrei?",
    ],
  },
];

function TrinariusPage() {
  return (
    <ModulePage
      code="// TRN 21"
      title="SISTEMA TRINARIUS"
      subtitle="Três modos operacionais. Um só homem, governado por princípios."
      explanation="Três arquétipos operacionais — Batman (execução), Reacher (leitura fria), Red (estratégia). Escolha um modo por contexto. Os princípios são inegociáveis."
    >
      <HudCard title="PRINCÍPIOS CONSTITUCIONAIS · INEGOCIÁVEIS">
        <ul className="space-y-1.5 text-sm text-foreground/90">
          {PRINCIPIOS.map((p) => (
            <li key={p} className="flex gap-2">
              <Flame className="size-3 text-primary mt-1 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </HudCard>

      <div className="grid lg:grid-cols-3 gap-4">
        {ARQUETIPOS.map((a) => (
          <div key={a.key} className={`hud-panel hud-corner p-6 border ${a.accent} flex flex-col gap-4`}>
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <a.icon className={`size-6 ${a.accent.split(" ")[0]}`} />
              <div className="flex-1">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">MODO / {a.codename}</div>
                <div className={`font-display text-lg hud-text-glow ${a.accent.split(" ")[0]}`}>{a.role}</div>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">PRINCÍPIO</div>
              <p className="text-sm text-foreground/90 leading-relaxed">{a.principio}</p>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">QUANDO ATIVAR</div>
              <p className="text-sm text-foreground/80 leading-relaxed">{a.quando}</p>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">COMO AGIR</div>
              <ul className="space-y-1 text-sm text-foreground/80">
                {a.como.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">▸</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary/80 mb-1">BLOCO DE PERGUNTAS</div>
              <ul className="space-y-1 text-xs text-foreground/70 italic">
                {a.perguntas.map((q, i) => (
                  <li key={i}>— {q}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-1">REGISTRO PESSOAL</div>
              <ProtectedField
                module="trinarius"
                fieldKey={`trinarius_${a.key}`}
                placeholder={`Observações operando em modo ${a.codename}...`}
                minHeight={80}
              />
            </div>
          </div>
        ))}
      </div>

      <HudCard title="REGRA CENTRAL">
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "Não são três homens. É um só, governado por princípios, escolhendo o modo certo para o terreno certo.
          Batman executa quando é hora de agir. Reacher lê quando é hora de entender. Red articula quando é hora de mover peças.
          O erro é usar o modo errado no momento errado — e desonrar o princípio que sustenta os três."
        </p>
      </HudCard>
    </ModulePage>
  );
}
