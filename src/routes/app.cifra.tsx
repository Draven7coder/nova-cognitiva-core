import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Compass } from "lucide-react";

export const Route = createFileRoute("/app/cifra")({
  component: CifraPage,
  head: () => ({
    meta: [
      { title: "Cifra da Bússola · Núcleo Supremo" },
      { name: "description", content: "Alfabeto cifrado pessoal em três blocos — página de referência estática para uso manual no caderno." },
    ],
  }),
});

// Cifra da Bússola — 3 blocos. Cada letra recebe um glifo distinto por bloco.
// O ponto na base do glifo marca o bloco (bloco I: sem ponto, bloco II: ponto,
// bloco III: dois pontos). Números e datas ficam como estão.
type Row = { letter: string; b1: string; b2: string; b3: string };

const ROWS: Row[] = [
  { letter: "A", b1: "◤",  b2: "◤·",  b3: "◤··" },
  { letter: "B", b1: "◣",  b2: "◣·",  b3: "◣··" },
  { letter: "C", b1: "◥",  b2: "◥·",  b3: "◥··" },
  { letter: "D", b1: "◢",  b2: "◢·",  b3: "◢··" },
  { letter: "E", b1: "⊤",  b2: "⊤·",  b3: "⊤··" },
  { letter: "F", b1: "♆",  b2: "♆·",  b3: "♆··" },
  { letter: "G", b1: "☌",  b2: "☌·",  b3: "☌··" },
  { letter: "H", b1: "⊣",  b2: "⊣·",  b3: "⊣··" },
  { letter: "I", b1: "│",  b2: "│·",  b3: "│··" },
  { letter: "J", b1: "⌐",  b2: "⌐·",  b3: "⌐··" },
  { letter: "K", b1: "⌙",  b2: "⌙·",  b3: "⌙··" },
  { letter: "L", b1: "└",  b2: "└·",  b3: "└··" },
  { letter: "M", b1: "Ϻ",  b2: "Ϻ·",  b3: "Ϻ··" },
  { letter: "N", b1: "⋁",  b2: "⋁·",  b3: "⋁··" },
  { letter: "O", b1: "○",  b2: "○·",  b3: "○··" },
  { letter: "P", b1: "♄",  b2: "♄·",  b3: "♄··" },
  { letter: "Q", b1: "☍",  b2: "☍·",  b3: "☍··" },
  { letter: "R", b1: "℞",  b2: "℞·",  b3: "℞··" },
  { letter: "S", b1: "∫",  b2: "∫·",  b3: "∫··" },
  { letter: "T", b1: "⊺",  b2: "⊺·",  b3: "⊺··" },
  { letter: "U", b1: "∪",  b2: "∪·",  b3: "∪··" },
  { letter: "V", b1: "∨",  b2: "∨·",  b3: "∨··" },
  { letter: "W", b1: "⋈",  b2: "⋈·",  b3: "⋈··" },
  { letter: "X", b1: "✕",  b2: "✕·",  b3: "✕··" },
  { letter: "Y", b1: "⋎",  b2: "⋎·",  b3: "⋎··" },
  { letter: "Z", b1: "⋕",  b2: "⋕·",  b3: "⋕··" },
];

function CifraPage() {
  return (
    <ModulePage
      code="// CFR · BÚSSOLA"
      title="Cifra da Bússola"
      subtitle="Alfabeto pessoal em três blocos · uso manual · a chave existe só nesta página."
    >
      <HudCard title="COMO LER">
        <div className="flex items-start gap-3">
          <Compass className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-foreground/85 leading-relaxed">
            <p>
              Cada letra tem <span className="text-primary">três formas</span>, uma por bloco.
              O <span className="text-primary">ponto na base</span> do glifo marca de qual bloco ela é:
              <span className="font-mono text-xs ml-1">bloco I sem ponto · bloco II com um ponto · bloco III com dois pontos</span>.
            </p>
            <p className="text-xs text-muted-foreground">
              Escolha o bloco que quiser em cada palavra, frase ou página — misturar blocos torna a leitura reversa muito mais difícil sem quebrar a sua.
            </p>
          </div>
        </div>
      </HudCard>

      <HudCard title="ALFABETO · 3 BLOCOS">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="text-left py-2 px-3 text-[10px] tracking-widest text-muted-foreground">LETRA</th>
                <th className="text-center py-2 px-3 text-[10px] tracking-widest text-primary/80">BLOCO I</th>
                <th className="text-center py-2 px-3 text-[10px] tracking-widest text-primary/80">BLOCO II</th>
                <th className="text-center py-2 px-3 text-[10px] tracking-widest text-primary/80">BLOCO III</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.letter} className="border-b border-border/30 hover:bg-primary/5 transition">
                  <td className="py-1.5 px-3 text-foreground font-display">{r.letter}</td>
                  <td className="py-1.5 px-3 text-center text-lg text-foreground/90">{r.b1}</td>
                  <td className="py-1.5 px-3 text-center text-lg text-foreground/90">{r.b2}</td>
                  <td className="py-1.5 px-3 text-center text-lg text-foreground/90">{r.b3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HudCard>

      <HudCard title="DICAS DE USO">
        <ul className="space-y-2 text-sm text-foreground/85 list-none">
          <li className="flex gap-2"><span className="text-primary">›</span> Guarde esta página longe do caderno físico — decore aos poucos até não precisar mais dela.</li>
          <li className="flex gap-2"><span className="text-primary">›</span> Números e datas podem ficar como estão, sem cifrar — dá aquele ar de caderno de investigação de verdade.</li>
          <li className="flex gap-2"><span className="text-primary">›</span> Um desenho pequeno no canto da página pode "assinar" o humor ou o tema daquele dia, sem revelar nada.</li>
          <li className="flex gap-2"><span className="text-primary">›</span> Pontuação e espaços permanecem normais — quebrar palavras já é o que confunde leitura externa.</li>
        </ul>
        <div className="mt-4 pt-3 border-t border-border/40 font-mono text-[10px] tracking-widest text-muted-foreground text-center">
          uso pessoal · a chave existe só nesta página
        </div>
      </HudCard>
    </ModulePage>
  );
}
