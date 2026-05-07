import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/app" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password: pw,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Protocolo iniciado. Verifique seu email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        toast.success("Acesso concedido.");
        nav({ to: "/app" });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Falha de autenticação");
    } finally { setLoading(false); }
  };

  const google = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/app` } });
      if (error) throw error;
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 hud-grid relative">
      <div className="absolute top-6 left-6">
        <Link to="/"><Button variant="ghost" size="sm" className="font-mono text-xs"><ArrowLeft className="size-3 mr-2" />VOLTAR</Button></Link>
      </div>
      <div className="hud-panel hud-corner hud-soft-glow p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="font-mono text-[10px] tracking-[0.4em] text-primary/80">// AUTENTICAÇÃO</div>
        <h1 className="font-display text-2xl mt-2 hud-text-glow">{mode === "signin" ? "Acessar Núcleo" : "Iniciar Protocolo"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signin" ? "Entre para continuar sua evolução." : "Crie sua identidade no sistema."}
        </p>

        <form onSubmit={submit} className="space-y-4 mt-6">
          <div>
            <Label className="font-mono text-[10px] tracking-widest">EMAIL</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-input/50 font-mono" />
          </div>
          <div>
            <Label className="font-mono text-[10px] tracking-widest">SENHA</Label>
            <Input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 bg-input/50 font-mono" />
          </div>
          <Button type="submit" disabled={loading} className="w-full font-mono tracking-widest text-xs hud-glow">
            {loading ? "PROCESSANDO..." : mode === "signin" ? "ACESSAR" : "INICIAR"}
          </Button>
        </form>

        <Button onClick={google} variant="outline" className="w-full mt-3 font-mono text-xs tracking-widest border-primary/30">
          CONTINUAR COM GOOGLE
        </Button>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full mt-4 text-xs text-muted-foreground hover:text-primary transition font-mono">
          {mode === "signin" ? "→ Criar nova identidade" : "→ Já possuo acesso"}
        </button>
      </div>
    </div>
  );
}
