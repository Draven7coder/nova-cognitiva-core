import { ReactNode } from "react";

export function ModulePage({
  code, title, subtitle, children,
}: { code: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-end justify-between border-b border-border/60 pb-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-primary/80">{code}</div>
          <h1 className="font-display text-3xl text-foreground hud-text-glow mt-1">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary animate-pulse-ring" />
          SISTEMA ATIVO
        </div>
      </header>
      {children}
    </div>
  );
}

export function HudCard({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`hud-panel hud-corner p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-[10px] tracking-[0.3em] text-primary/80">{title}</h3>
          <span className="size-1 rounded-full bg-primary/60" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
