import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Fingerprint, Crosshair, BookOpen, Settings2, Activity,
  Swords, Lightbulb, Moon, TrendingUp, Brain, Settings, LogOut, Cog, FlaskConical, Droplet, Bot, Compass, Sparkles, Link2, Shield,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const modules = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Identidade", url: "/app/identidade", icon: Fingerprint },
  { title: "Propósito Supremo", url: "/app/proposito", icon: Crosshair },
  { title: "Centro Intelectual", url: "/app/intelecto", icon: BookOpen },
  { title: "Laboratório Estratégico", url: "/app/laboratorio", icon: FlaskConical },
  { title: "Manual Operacional", url: "/app/manual", icon: Settings2 },
  { title: "Protocolos Operacionais", url: "/app/protocolos", icon: Cog },
  { title: "Performance", url: "/app/performance", icon: Activity },
  { title: "Hidratação Operacional", url: "/app/hidratacao", icon: Droplet },
  { title: "Sistema de Missões", url: "/app/missoes", icon: Swords },
  { title: "Cadeias Operacionais", url: "/app/cadeias", icon: Link2 },
  { title: "Banco de Ideias", url: "/app/ideias", icon: Lightbulb },
  { title: "Sombra", url: "/app/sombra", icon: Moon },
  { title: "Evolução", url: "/app/evolucao", icon: TrendingUp },
  { title: "Loop OODA", url: "/app/ooda", icon: Compass },
  { title: "JARVIS", url: "/app/jarvis", icon: Bot },
  { title: "Insights Emergentes", url: "/app/insights", icon: Sparkles },
  { title: "Protocolo Wayne", url: "/app/wayne", icon: Shield },
  { title: "Relatórios da IA", url: "/app/relatorios", icon: Brain },
  { title: "Configurações", url: "/app/config", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md hud-panel hud-glow flex items-center justify-center">
            <span className="font-display text-primary text-sm hud-text-glow">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xs tracking-[0.3em] text-primary hud-text-glow">NÚCLEO</span>
            <span className="font-mono text-[10px] text-muted-foreground">SUPREMO · v1.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-widest text-muted-foreground/70">MÓDULOS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((m) => {
                const active = path === m.url;
                return (
                  <SidebarMenuItem key={m.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={m.url} className="group">
                        <m.icon className="size-4" />
                        <span className="text-sm">{m.title}</span>
                        {active && <span className="ml-auto size-1.5 rounded-full bg-primary animate-pulse-ring" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => supabase.auth.signOut()}>
              <LogOut className="size-4" />
              <span className="text-sm">Desconectar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
