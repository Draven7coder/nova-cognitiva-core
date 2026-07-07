import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ModulePage({
  code, title, subtitle, explanation, children,
}: { code: string; title: string; subtitle?: string; explanation?: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-end justify-between border-b border-border/60 pb-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-primary/80">{code}</div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="font-display text-3xl text-foreground hud-text-glow">{title}</h1>
            {explanation && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Como usar este módulo"
                    className="text-muted-foreground hover:text-primary transition -translate-y-1"
                  >
                    <HelpCircle className="size-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="max-w-sm text-xs leading-relaxed font-mono">
                  {explanation}
                </PopoverContent>
              </Popover>
            )}
          </div>
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
