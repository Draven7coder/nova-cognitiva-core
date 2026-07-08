import { supabase } from "@/integrations/supabase/client";

// Spaced-repetition schedule: level 0 → 1d, 1 → 3d, 2 → 7d, 3 → 21d, 4 → 60d (dominado)
const REVIEW_DAYS = [1, 3, 7, 21, 60];

function nextReviewISO(level: number): string {
  const days = REVIEW_DAYS[Math.min(level, REVIEW_DAYS.length - 1)];
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export type VocabRow = {
  id: string;
  word: string;
  meaning: string | null;
  example: string | null;
  level: number;
  exposures: number;
  active_uses: number;
  first_seen_at: string;
  last_exposed_at: string;
  next_review_at: string;
};

export async function loadVocabContext(userId: string) {
  const sb: any = supabase;
  const { data } = await sb
    .from("vocabulary_entries")
    .select("*")
    .eq("user_id", userId)
    .order("last_exposed_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as VocabRow[];
  const now = Date.now();
  const due_for_review = rows
    .filter((r) => r.level < 4 && new Date(r.next_review_at).getTime() <= now)
    .slice(0, 12)
    .map((r) => r.word);
  const active = rows.filter((r) => r.level >= 3).map((r) => r.word);
  const tracked = rows.map((r) => r.word);
  return { rows, context: { due_for_review, active, tracked } };
}

export async function applyVocabResult(
  userId: string,
  existing: VocabRow[],
  vocab: {
    introduced?: { word: string; meaning?: string; example?: string }[];
    reviewed?: string[];
    user_actives?: string[];
  } | null,
) {
  if (!vocab || !userId) return;
  const sb: any = supabase;
  const byWord = new Map(existing.map((r) => [r.word.toLowerCase(), r]));
  const nowISO = new Date().toISOString();

  // 1) new introductions → insert (upsert by unique user_id + lower(word))
  const inserts = (vocab.introduced ?? [])
    .filter((x) => x?.word)
    .map((x) => {
      const w = x.word.trim().toLowerCase();
      if (byWord.has(w)) return null; // already exists → treat as review below
      return {
        user_id: userId,
        word: w,
        meaning: x.meaning ?? null,
        example: x.example ?? null,
        level: 0,
        exposures: 1,
        active_uses: 0,
        last_exposed_at: nowISO,
        next_review_at: nextReviewISO(0),
      };
    })
    .filter(Boolean);
  if (inserts.length) {
    await sb.from("vocabulary_entries").insert(inserts);
  }

  // 2) reviewed words → increment exposures + advance level
  for (const w of vocab.reviewed ?? []) {
    const row = byWord.get(w.toLowerCase());
    if (!row) continue;
    const newLevel = Math.min(row.level + 1, 4);
    await sb.from("vocabulary_entries").update({
      level: newLevel,
      exposures: row.exposures + 1,
      last_exposed_at: nowISO,
      next_review_at: nextReviewISO(newLevel),
    }).eq("id", row.id);
  }

  // 3) user actives → increment active_uses, force level ≥ 3
  for (const w of vocab.user_actives ?? []) {
    const row = byWord.get(w.toLowerCase());
    if (!row) continue;
    const newLevel = Math.max(row.level, 3);
    await sb.from("vocabulary_entries").update({
      level: newLevel,
      active_uses: row.active_uses + 1,
      last_exposed_at: nowISO,
      next_review_at: nextReviewISO(newLevel),
    }).eq("id", row.id);
  }
}

export const LEVEL_LABEL = ["novo", "exposto", "consolidando", "ativo", "dominado"] as const;
export const LEVEL_COLOR = [
  "text-muted-foreground border-muted/40",
  "text-cyan-300 border-cyan-300/40",
  "text-primary border-primary/40",
  "text-amber-300 border-amber-300/50",
  "text-emerald-400 border-emerald-400/50",
];
