import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Crosshair, Activity } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 hud-grid opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent,oklch(0.14_0.025_240)_70%)]" />

      <header className="relative z-10 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-md hud-panel hud-glow flex items-center justify-center">
            <span className="font-display text-primary hud-text-glow">N</span>
          </div>
          <div>
            <div className="font-display text-sm tracking-[0.3em] text-primary hud-text-glow">NÚCLEO</div>
            <div className="font-mono text-[10px] text-muted-foreground">SUPREMO · SISTEMA OPERACIONAL</div>
          </div>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="font-mono text-xs tracking-widest border-primary/40 hover:bg-primary/10">
            ACESSAR <ArrowRight className="ml-2 size-3" />
          </Button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-12 md:pt-24 pb-24">
        <div className="font-mono text-[10px] tracking-[0.5em] text-primary/80 mb-6 animate-fade-in">
          // PROTOCOLO DE EVOLUÇÃO COGNITIVA
        </div>
        <h1 className="font-display text-4xl md:text-7xl font-bold leading-[1.05] hud-text-glow animate-fade-in">
          A extensão cognitiva<br />
          <span className="text-primary">da sua mente</span>
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground text-base md:text-lg animate-fade-in">
          Um Sistema Operacional Pessoal Evolutivo. Identidade, missões, performance,
          padrões mentais — analisados em tempo real pela IA do NÚCLEO.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 animate-fade-in">
          <Link to="/auth">
            <Button size="lg" className="font-mono tracking-widest text-xs hud-glow">
              INICIAR PROTOCOLO <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-20">
          {[
            { icon: Brain, code: "M01", t: "QI Funcional Operacional", d: "10 métricas dinâmicas analisadas pela IA continuamente." },
            { icon: Crosshair, code: "M02", t: "Sistema de Missões", d: "Missões diárias, campanhas, XP — execução gamificada." },
            { icon: Activity, code: "M03", t: "Análise Comportamental", d: "Detecção de sabotagens, ciclos emocionais, padrões." },
          ].map((f) => (
            <div key={f.code} className="hud-panel hud-corner p-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <f.icon className="size-5 text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">{f.code}</span>
              </div>
              <div className="font-display text-base mt-4">{f.t}</div>
              <div className="text-sm text-muted-foreground mt-2">{f.d}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
