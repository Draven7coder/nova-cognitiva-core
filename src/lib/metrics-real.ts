// Real-metric derivation from live user data.
// No hardcoded numbers — every value is computed from what the user actually
// registered (check-ins, missions, journal, OODA, hidratação, ai_reports).
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

function daysAgoISO(days: number) {
  const d = new Date(); d.setDate(d.getDate() - days); d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function daysAgoDate(days: number) {
  const d = new Date(); d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type PerformanceReal = {
  fisica:    Record<string, number>;
  cognitiva: Record<string, number>;
  emocional: Record<string, number>;
  espiritual:Record<string, number>;
  sampleSize: { checkins: number; missions: number; journal: number; ooda: number; hydDays: number };
};

/**
 * Performance real — janela dos últimos 14 dias.
 */
export async function loadPerformanceReal(userId: string): Promise<PerformanceReal> {
  const since = daysAgoISO(14);
  const sinceDate = daysAgoDate(14);
  const [{ data: ck }, { data: mc }, { data: jr }, { data: od }, { data: hy }] = await Promise.all([
    sb.from("daily_checkins").select("sleep_quality,energy,focus,mood,stress,check_date").gte("check_date", sinceDate),
    sb.from("mission_completions").select("id,completed_at").gte("completed_at", since),
    sb.from("journal_entries").select("module,created_at").gte("created_at", since),
    sb.from("ooda_entries").select("id,created_at").gte("created_at", since),
    sb.from("hydration_logs").select("consumed_at").gte("consumed_at", since),
  ]);

  const sleep  = avg((ck ?? []).map((c: any) => c.sleep_quality ?? 0));
  const energy = avg((ck ?? []).map((c: any) => c.energy ?? 0));
  const focus  = avg((ck ?? []).map((c: any) => c.focus ?? 0));
  const mood   = avg((ck ?? []).map((c: any) => c.mood ?? 0));
  const stress = avg((ck ?? []).map((c: any) => c.stress ?? 0));

  const missionsDone = (mc ?? []).length;
  const oodaCount = (od ?? []).length;
  const journalByModule = (jr ?? []).reduce((acc: Record<string, number>, j: any) => {
    acc[j.module ?? "_"] = (acc[j.module ?? "_"] || 0) + 1; return acc;
  }, {});
  const hydDays = new Set((hy ?? []).map((h: any) => h.consumed_at?.slice(0, 10))).size;

  // Variance-based stability
  const stressArr = (ck ?? []).map((c: any) => c.stress ?? 0);
  const mean = avg(stressArr);
  const variance = stressArr.length ? avg(stressArr.map((s: number) => (s - mean) ** 2)) : 0;
  const stability = clamp(100 - variance * 12);

  return {
    fisica: {
      "Treino": clamp(missionsDone * 8),
      "Dieta": clamp(hydDays * 7),
      "VO2": clamp(energy * 10),
      "Força": clamp(missionsDone * 6 + energy * 4),
      "Recuperação": clamp(sleep * 10),
    },
    cognitiva: {
      "Horas Profundas": clamp(focus * 10),
      "Retenção": clamp((jr ?? []).length * 5),
      "Leitura": clamp((journalByModule["intelecto"] ?? 0) * 12),
      "Foco": clamp(focus * 10),
      "Velocidade Aprendizado": clamp(oodaCount * 8),
    },
    emocional: {
      "Estabilidade": stability,
      "Autocontrole": clamp(mood * 10),
      "Reatividade": clamp(100 - stress * 10),
    },
    espiritual: {
      "Meditação": clamp((journalByModule["proposito"] ?? 0) * 15),
      "Alinhamento": clamp((journalByModule["identidade"] ?? 0) * 15),
      "Clareza": clamp(focus * 10),
    },
    sampleSize: { checkins: (ck ?? []).length, missions: missionsDone, journal: (jr ?? []).length, ooda: oodaCount, hydDays },
  };
}

export type EvolutionPoint = { mes: string; intelectual: number; fisica: number; emocional: number; espiritual: number };

/**
 * Evolução real — agrega check-ins por mês nos últimos 24 meses.
 * Cada dimensão vem de uma métrica real registrada pelo próprio usuário.
 */
export async function loadEvolutionReal(userId: string): Promise<EvolutionPoint[]> {
  const since = new Date(); since.setMonth(since.getMonth() - 24);
  const sinceDate = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, "0")}-01`;
  const { data: ck } = await sb
    .from("daily_checkins")
    .select("sleep_quality,energy,focus,mood,stress,check_date")
    .gte("check_date", sinceDate)
    .order("check_date", { ascending: true });

  const buckets = new Map<string, any[]>();
  (ck ?? []).forEach((c: any) => {
    const key = (c.check_date ?? "").slice(0, 7); // YYYY-MM
    if (!key) return;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(c);
  });

  // Fill last 24 months so the chart has a stable axis even with sparse data
  const points: EvolutionPoint[] = [];
  const cursor = new Date(); cursor.setDate(1); cursor.setMonth(cursor.getMonth() - 23);
  for (let i = 0; i < 24; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const rows = buckets.get(key) ?? [];
    const focus  = avg(rows.map((r) => r.focus ?? 0));
    const energy = avg(rows.map((r) => r.energy ?? 0));
    const mood   = avg(rows.map((r) => r.mood ?? 0));
    const stress = avg(rows.map((r) => r.stress ?? 0));
    points.push({
      mes: key.slice(2).replace("-", "/"),
      intelectual: clamp(focus * 10),
      fisica: clamp(energy * 10),
      emocional: clamp(mood * 10),
      espiritual: clamp(100 - stress * 10),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return points;
}

export type QiDailyPoint = { d: number; date: string; qi: number };

/**
 * QI diário nos últimos 14 dias — proxy real a partir de check-ins.
 * QI ≈ (energia + foco + humor + (10 - stress)) / 4 * 10  →  escala 0-100
 */
export async function loadQiTimelineReal(userId: string): Promise<QiDailyPoint[]> {
  const sinceDate = daysAgoDate(13);
  const { data: ck } = await sb
    .from("daily_checkins")
    .select("energy,focus,mood,stress,check_date")
    .gte("check_date", sinceDate)
    .order("check_date", { ascending: true });

  const byDate = new Map<string, any>();
  (ck ?? []).forEach((c: any) => byDate.set(c.check_date, c));

  const points: QiDailyPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const c = byDate.get(key);
    const qi = c
      ? clamp(((c.energy ?? 0) + (c.focus ?? 0) + (c.mood ?? 0) + (10 - (c.stress ?? 0))) / 4 * 10)
      : 0;
    points.push({ d: 14 - i, date: key.slice(5), qi });
  }
  return points;
}

/**
 * Padrão de sugestão pendente — inspeciona o estado atual do usuário e
 * devolve uma lista de sugestões pontuais a mostrar no dashboard.
 */
export type PendingSuggestion = {
  id: string;
  title: string;
  reason: string;
  action: { to: string; label: string; hash?: string };
  severity: "info" | "warn" | "critical";
};

export async function loadPendingSuggestions(userId: string): Promise<PendingSuggestion[]> {
  const today = daysAgoDate(0);
  const out: PendingSuggestion[] = [];

  const [{ data: ci }, { data: ch }, { data: hyToday }] = await Promise.all([
    sb.from("daily_checkins").select("id").eq("check_date", today).maybeSingle(),
    sb.from("operational_chains").select("id").eq("status", "ativa").limit(1),
    sb.from("hydration_logs").select("id").gte("consumed_at", new Date(new Date().setHours(0,0,0,0)).toISOString()).limit(1),
  ]);

  if (!ci) out.push({
    id: "checkin", severity: "critical",
    title: "Check-in de hoje pendente",
    reason: "O JARVIS precisa da sua calibração para definir o modo operacional.",
    action: { to: "/app/", label: "REGISTRAR" },
  });
  if (!ch?.length) out.push({
    id: "chain", severity: "warn",
    title: "Nenhuma cadeia ativa",
    reason: "Sem cadeia, o sistema não sabe qual é sua próxima ação prioritária.",
    action: { to: "/app/cadeias", label: "GERAR" },
  });
  if (!hyToday?.length) out.push({
    id: "hyd", severity: "info",
    title: "Hidratação não registrada hoje",
    reason: "Manter a base fisiológica sustenta foco e energia ao longo do dia.",
    action: { to: "/app/hidratacao", label: "REGISTRAR" },
  });
  return out;
}

// ============================================================
// COGNITIVE INDEX (0-100) — proxy funcional real
// ============================================================
export type CognitiveIndex = {
  score: number;
  monthDelta: number;
  drivers: string[];
  components: { sleep: number; focus: number; stability: number; consistency: number; retention: number };
};

export async function loadCognitiveIndexReal(_userId: string): Promise<CognitiveIndex> {
  const d60 = daysAgoDate(60);
  const d30 = daysAgoDate(30);
  const d14 = daysAgoDate(14);
  const { data: rows0 } = await sb
    .from("daily_checkins")
    .select("sleep_quality,focus,stress,check_date")
    .gte("check_date", d60)
    .order("check_date", { ascending: true });
  const rows = rows0 ?? [];
  const in30 = rows.filter((r: any) => r.check_date >= d30);
  const prev30 = rows.filter((r: any) => r.check_date < d30);
  const in14 = rows.filter((r: any) => r.check_date >= d14);

  const sleepNow = avg(in30.map((r: any) => r.sleep_quality ?? 0));
  const focusNow = avg(in30.map((r: any) => r.focus ?? 0));
  const stressArr = in30.map((r: any) => r.stress ?? 0);
  const meanS = avg(stressArr);
  const varS = stressArr.length ? avg(stressArr.map((s: number) => (s - meanS) ** 2)) : 0;
  const stability = clamp(100 - varS * 12);

  const seen = new Set(in14.map((r: any) => r.check_date));
  const consistency = clamp((seen.size / 14) * 100);

  const sleep = clamp(sleepNow * 10);
  const focus = clamp(focusNow * 10);

  let retention = 50;
  try {
    const { data: vocab } = await sb
      .from("vocabulary_entries")
      .select("status,correct_count,review_count");
    if (vocab && vocab.length) {
      const totalR = vocab.reduce((a: number, v: any) => a + (v.review_count ?? 0), 0);
      const correctR = vocab.reduce((a: number, v: any) => a + (v.correct_count ?? 0), 0);
      if (totalR > 0) retention = clamp((correctR / totalR) * 100);
      else retention = clamp(vocab.filter((v: any) => ["active", "mastered", "learned"].includes(v.status)).length * 4);
    }
  } catch { /* table shape may differ */ }

  const score = clamp(
    sleep * 0.2 + focus * 0.25 + stability * 0.2 + consistency * 0.2 + retention * 0.15,
  );

  // previous 30d for delta
  const sleepPrev = clamp(avg(prev30.map((r: any) => r.sleep_quality ?? 0)) * 10);
  const focusPrev = clamp(avg(prev30.map((r: any) => r.focus ?? 0)) * 10);
  const stressPrev = prev30.map((r: any) => r.stress ?? 0);
  const meanP = avg(stressPrev);
  const varP = stressPrev.length ? avg(stressPrev.map((s: number) => (s - meanP) ** 2)) : 0;
  const stabPrev = clamp(100 - varP * 12);
  const prevScore = clamp(
    sleepPrev * 0.2 + focusPrev * 0.25 + stabPrev * 0.2 + consistency * 0.2 + retention * 0.15,
  );
  const monthDelta = Math.round(score - prevScore);

  const drivers: string[] = [];
  if (sleep - sleepPrev >= 5) drivers.push("sono mais consistente");
  else if (sleepPrev - sleep >= 5) drivers.push("sono em queda");
  if (focus - focusPrev >= 5) drivers.push("foco em alta");
  else if (focusPrev - focus >= 5) drivers.push("foco reduzido");
  if (stability - stabPrev >= 5) drivers.push("menor variância de stress");
  else if (stabPrev - stability >= 5) drivers.push("maior instabilidade emocional");
  if (consistency < 60) drivers.push("check-ins irregulares reduzem a confiabilidade");
  if (retention >= 70) drivers.push("retenção alta em revisão espaçada");

  return { score, monthDelta, drivers, components: { sleep, focus, stability, consistency, retention } };
}

// ============================================================
// ENGAGEMENT INDEX (0-100) — consistência de uso, NÃO cognição
// ============================================================
export type EngagementIndex = {
  score: number;
  parts: { missions: number; totalXP: number; ooda: number; journal: number; insightsAccepted: number; hydDays: number };
};

export async function loadEngagementIndexReal(_userId: string): Promise<EngagementIndex> {
  const [
    { count: missionsDone },
    { count: oodaCount },
    { count: journalCount },
    { data: hyd },
    { data: comps },
    { data: missAll },
    { count: insightsAccepted },
  ] = await Promise.all([
    sb.from("mission_completions").select("*", { count: "exact", head: true }),
    sb.from("ooda_entries").select("*", { count: "exact", head: true }),
    sb.from("journal_entries").select("*", { count: "exact", head: true }),
    sb.from("hydration_logs").select("consumed_at").order("consumed_at", { ascending: false }).limit(500),
    sb.from("mission_completions").select("mission_id"),
    sb.from("missions").select("id,xp"),
    sb.from("emergent_insights").select("*", { count: "exact", head: true }).gte("feedback_rating", 4),
  ]);
  const xpMap = new Map<string, number>((missAll ?? []).map((x: any) => [x.id as string, (x.xp ?? 0) as number]));
  const totalXP = (comps ?? []).reduce((acc: number, c: any) => acc + (xpMap.get(c.mission_id) ?? 0), 0);
  const hydDays = new Set((hyd ?? []).map((h: any) => h.consumed_at?.slice(0, 10))).size;
  const raw =
    (missionsDone ?? 0) * 2.5 +
    totalXP * 0.4 +
    (oodaCount ?? 0) * 6 +
    (journalCount ?? 0) * 1.5 +
    (insightsAccepted ?? 0) * 4 +
    hydDays * 1.2;
  // rescale 0-400 → 0-100
  const score = clamp(raw / 4);
  return {
    score,
    parts: {
      missions: missionsDone ?? 0,
      totalXP,
      ooda: oodaCount ?? 0,
      journal: journalCount ?? 0,
      insightsAccepted: insightsAccepted ?? 0,
      hydDays,
    },
  };
}

