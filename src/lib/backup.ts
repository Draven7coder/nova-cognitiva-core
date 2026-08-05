import { supabase } from "@/integrations/supabase/client";
import { APP_VERSION } from "./app-version";

const sb: any = supabase;

/** Tables that hold user-owned data and are covered by the backup. */
export const BACKUP_TABLES = [
  "profiles",
  "identity",
  "journal_entries",
  "missions",
  "mission_completions",
  "daily_checkins",
  "operational_chains",
  "chain_subtasks",
  "metasystems",
  "ooda_entries",
  "emergent_insights",
  "shadow_hypotheses",
  "jarvis_insights",
  "jarvis_messages",
  "oficina_messages",
  "trinarius_reflections",
  "physical_training_logs",
  "hydration_logs",
  "vocabulary_entries",
  "field_versions",
  "ai_reports",
  "ai_suggestions",
] as const;

export type BackupPayload = {
  format: "nucleo-supremo-backup";
  version: number;
  app_version: string;
  exported_at: string;
  user_id: string;
  tables: Record<string, any[]>;
};

const LOCAL_KEY = "nucleo:last-backup";

export async function buildBackup(userId: string): Promise<BackupPayload> {
  const tables: Record<string, any[]> = {};
  for (const t of BACKUP_TABLES) {
    try {
      const { data, error } = await sb.from(t).select("*");
      if (error) throw error;
      tables[t] = data ?? [];
    } catch {
      tables[t] = [];
    }
  }
  return {
    format: "nucleo-supremo-backup",
    version: 1,
    app_version: APP_VERSION,
    exported_at: new Date().toISOString(),
    user_id: userId,
    tables,
  };
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nucleo-backup-${payload.exported_at.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function saveBackupLocally(payload: BackupPayload) {
  try {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ exported_at: payload.exported_at, app_version: payload.app_version }),
    );
  } catch { /* quota / private mode */ }
}

export function readLocalBackupMeta(): { exported_at: string; app_version: string } | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function pushBackupToCloud(userId: string, payload: BackupPayload) {
  const { error } = await sb
    .from("user_data")
    .upsert({ user_id: userId, data: payload, app_version: APP_VERSION }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function fetchCloudBackupMeta(userId: string) {
  const { data } = await sb
    .from("user_data")
    .select("updated_at,app_version")
    .eq("user_id", userId)
    .maybeSingle();
  return data as { updated_at: string; app_version: string | null } | null;
}

export function parseBackupFile(text: string): BackupPayload {
  const parsed = JSON.parse(text);
  if (parsed?.format !== "nucleo-supremo-backup" || typeof parsed?.tables !== "object") {
    throw new Error("Arquivo inválido: não é um backup do Núcleo.");
  }
  return parsed as BackupPayload;
}

/** Replaces the current user's rows with the ones in the backup, table by table. */
export async function restoreBackup(
  userId: string,
  payload: BackupPayload,
  onProgress?: (table: string, index: number, total: number) => void,
): Promise<{ restored: number; skipped: string[] }> {
  const names = Object.keys(payload.tables);
  const skipped: string[] = [];
  let restored = 0;

  for (let i = 0; i < names.length; i++) {
    const table = names[i];
    onProgress?.(table, i + 1, names.length);
    const rows = (payload.tables[table] ?? []).map((r: any) => ({
      ...r,
      ...(table === "profiles" || table === "identity"
        ? {}
        : "user_id" in r
          ? { user_id: userId }
          : {}),
    }));
    try {
      const key = table === "profiles" ? "id" : table === "identity" ? "user_id" : "user_id";
      await sb.from(table).delete().eq(key, userId);
      if (rows.length) {
        const { error } = await sb.from(table).insert(rows);
        if (error) throw error;
      }
      restored += rows.length;
    } catch {
      skipped.push(table);
    }
  }
  return { restored, skipped };
}
