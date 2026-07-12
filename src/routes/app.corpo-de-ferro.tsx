import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, HudCard } from "@/components/ModulePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dumbbell, Snowflake, Waves, AlertTriangle, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/corpo-de-ferro")({ component: CorpoDeFerroPage });

const WORKOUT_PRESETS: Record<string, { name: string; category: string }[]> = {
  segunda: [
    { name: "Flexões (Peito)", category: "Força Superior" },
    { name: "Prancha Isométrica", category: "Core" },
    { name: "Rosca Punho (Antebraço)", category: "Força Superior" },
    { name: "Puxada na Barra", category: "Força Superior" },
  ],
  terca: [
    { name: "Corrida Zona 2 (Base)", category: "Cardio" },
    { name: "Protocolo 30/90 (Sprints)", category: "VO2 Máximo" },
  ],
  quarta: [
    { name: "Agachamento Búlgaro", category: "Força Inferior" },
    { name: "Agachamento Pistol", category: "Força Inferior" },
    { name: "Elevação de Panturrilha", category: "Força Inferior" },
  ],
  quinta: [
    { name: "Bike Zona 2 (Base)", category: "Cardio" },
    { name: "Protocolo 30/90", category: "VO2 Máximo" },
  ],
  sexta: [
    { name: "Flexões (Variações)", category: "Full Body" },
    { name: "Agachamentos", category: "Full Body" },
    { name: "Prancha Lateral", category: "Full Body" },
    { name: "Ponte de Pescoço", category: "Pescoço" },
  ],
  sabado: [
    { name: "Caminhada Leve", category: "Recuperação" },
    { name: "Mobilidade Articular", category: "Recuperação" },
  ],
  domingo: [],
};

const DAY_KEYS = ["domingo","segunda","terca","quarta","quinta","sexta","sabado"];
const DAY_LABEL: Record<string, string> = {
  domingo: "Domingo", segunda: "Segunda", terca: "Terça", quarta: "Quarta",
  quinta: "Quinta", sexta: "Sexta", sabado: "Sábado",
};

function todayKey() { return DAY_KEYS[new Date().getDay()]; }
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function CorpoDeFerroPage() {
  const { user } = useAuth();
  const [dayKey, setDayKey] = useState(todayKey());
  const [done, setDone] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | "">("");
  const [intensity, setIntensity] = useState<number>(6);
  const [coldShower, setColdShower] = useState(false);
  const [stretching, setStretching] = useState(false);
  const [jointPain, setJointPain] = useState(false);
  const [painNotes, setPainNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  const preset = WORKOUT_PRESETS[dayKey] ?? [];

  const load = async () => {
    if (!user) return;
    const sb: any = supabase;
    const { data } = await sb
      .from("physical_training_logs")
      .select("*")
      .eq("check_date", todayISO())
      .maybeSingle();
    if (data) {
      setExistingId(data.id);
      setDone(Array.isArray(data.exercises_done) ? data.exercises_done : []);
      setDuration(data.duration_minutes ?? "");
      setIntensity(data.intensity ?? 6);
      setColdShower(!!data.cold_shower);
      setStretching(!!data.stretching_done);
      setJointPain(!!data.joint_pain);
      setPainNotes(data.pain_notes ?? "");
      setNotes(data.notes ?? "");
      if (data.workout_type && DAY_KEYS.includes(data.workout_type)) setDayKey(data.workout_type);
    }
  };
  useEffect(() => { load(); }, [user]);

  const toggle = (name: string) => {
    setDone((s) => s.includes(name) ? s.filter((n) => n !== name) : [...s, name]);
  };

  const clearAll = () => setDone([]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const sb: any = supabase;
      const payload = {
        user_id: user.id,
        check_date: todayISO(),
        workout_type: dayKey,
        exercises_done: done,
        duration_minutes: typeof duration === "number" ? duration : null,
        intensity,
        cold_shower: coldShower,
        stretching_done: stretching,
        joint_pain: jointPain,
        pain_notes: painNotes || null,
        notes: notes || null,
      };
      const { error } = await sb.from("physical_training_logs").upsert(payload, { onConflict: "user_id,check_date" });
      if (error) throw error;
      toast.success("Treino registrado.");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const total = preset.length;
  const donePreset = useMemo(() => preset.filter((p) => done.includes(p.name)).length, [preset, done]);
  const pct = total ? Math.round((donePreset / total) * 100) : 0;

  return (
    <ModulePage
      code="// CDF 24"
      title="CORPO DE FERRO"
      subtitle="Check-in físico diário. Presets por dia da semana. Progresso salvo, corpo forjado."
    >
      <HudCard title="DIA DE TREINO">
        <div className="flex flex-wrap gap-1">
          {DAY_KEYS.map((k) => (
            <Button
              key={k}
              size="sm"
              variant={k === dayKey ? "default" : "outline"}
              onClick={() => setDayKey(k)}
              className="font-mono text-[10px] tracking-widest"
            >
              {DAY_LABEL[k].toUpperCase()}
            </Button>
          ))}
        </div>
        {existingId && (
          <p className="text-[10px] font-mono text-primary mt-2">✓ Já existe um registro de hoje — as alterações irão sobrescrever.</p>
        )}
      </HudCard>

      <HudCard title={`EXERCÍCIOS · ${DAY_LABEL[dayKey].toUpperCase()}`}>
        {preset.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground">Dia de descanso. Aproveite para mobilidade leve e sono.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Dumbbell className="size-4 text-primary" />
              <span className="font-mono text-xs">{donePreset} / {total} exercícios</span>
              <div className="flex-1 h-2 bg-input/30 rounded overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <Button size="sm" variant="ghost" onClick={clearAll} className="font-mono text-[10px]">
                <RotateCcw className="size-3 mr-1" /> LIMPAR
              </Button>
            </div>
            <ul className="space-y-2">
              {preset.map((ex) => {
                const checked = done.includes(ex.name);
                return (
                  <li key={ex.name} className={`flex items-center gap-3 hud-panel p-3 border ${checked ? "border-primary/60" : "border-border/40"}`}>
                    <Checkbox checked={checked} onCheckedChange={() => toggle(ex.name)} />
                    <span className={`flex-1 text-sm ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{ex.name}</span>
                    <Badge variant="outline" className="font-mono text-[9px]">{ex.category}</Badge>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </HudCard>

      <div className="grid md:grid-cols-2 gap-3">
        <HudCard title="DURAÇÃO & INTENSIDADE">
          <label className="block text-[10px] font-mono text-muted-foreground mb-1">DURAÇÃO (min)</label>
          <Input
            type="number" min={0} value={duration}
            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : "")}
            className="bg-input/40 font-mono text-sm mb-3"
          />
          <label className="block text-[10px] font-mono text-muted-foreground mb-1">INTENSIDADE (1-10) · {intensity}</label>
          <input
            type="range" min={1} max={10} value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
        </HudCard>

        <HudCard title="RECUPERAÇÃO & SINAIS">
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <Checkbox checked={coldShower} onCheckedChange={(v) => setColdShower(!!v)} />
            <Snowflake className="size-4 text-primary" />
            <span className="text-sm">Banho frio</span>
          </label>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <Checkbox checked={stretching} onCheckedChange={(v) => setStretching(!!v)} />
            <Waves className="size-4 text-primary" />
            <span className="text-sm">Alongamento</span>
          </label>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <Checkbox checked={jointPain} onCheckedChange={(v) => setJointPain(!!v)} />
            <AlertTriangle className="size-4 text-amber-400" />
            <span className="text-sm">Dor articular</span>
          </label>
          {jointPain && (
            <Textarea
              value={painNotes}
              onChange={(e) => setPainNotes(e.target.value)}
              placeholder="Onde? Intensidade? Contexto?"
              className="min-h-[60px] bg-input/40 text-sm mt-2"
            />
          )}
        </HudCard>
      </div>

      <HudCard title="NOTAS DO TREINO">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Como foi? O que travou? O que evoluiu?"
          className="min-h-[80px] bg-input/40 text-sm"
        />
      </HudCard>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="font-mono text-[10px] tracking-widest">
          <Save className="size-3 mr-2" /> {saving ? "SALVANDO..." : "REGISTRAR TREINO"}
        </Button>
      </div>
    </ModulePage>
  );
}
