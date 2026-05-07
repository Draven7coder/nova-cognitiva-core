import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/app/config")({
  component: () => {
    const { user } = useAuth();
    return (
      <ModulePage code="// CFG 12" title="Configurações" subtitle="Ajustes do sistema.">
        <HudCard title="IDENTIFICADOR">
          <div className="font-mono text-xs text-muted-foreground">EMAIL: <span className="text-foreground">{user?.email}</span></div>
          <div className="font-mono text-xs text-muted-foreground mt-1">UID: <span className="text-foreground/60">{user?.id}</span></div>
        </HudCard>
        <HudCard title="SESSÃO">
          <Button variant="destructive" onClick={() => supabase.auth.signOut()} className="font-mono text-xs tracking-widest">DESCONECTAR DO NÚCLEO</Button>
        </HudCard>
      </ModulePage>
    );
  },
});
