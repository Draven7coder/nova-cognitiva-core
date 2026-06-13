// Auto-sync chain subtasks based on real module activity in the CURRENT DAY.
// If the user already executed the action manually inside the matching module
// today, the subtask is marked done automatically — no manual re-entry needed.
// Daily reset is implicit: only activity from start-of-day onwards is counted.
import { supabase } from "@/integrations/supabase/client";

function startOfDayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function hasActivity(module: string | null | undefined, since: string): Promise<boolean> {
  if (!module) return false;
  const sb: any = supabase;
  try {
    switch (module) {
      case "missoes": {
        const { data } = await sb.from("mission_completions").select("id").gte("completed_at", since).limit(1);
        return !!data?.length;
      }
      case "ooda": {
        const { data } = await sb.from("ooda_entries").select("id").gte("created_at", since).limit(1);
        return !!data?.length;
      }
      case "hidratacao": {
        const { data } = await sb.from("hydration_logs").select("id").gte("consumed_at", since).limit(1);
        return !!data?.length;
      }
      case "performance":
      case "evolucao": {
        const { data } = await sb.from("daily_checkins").select("id").gte("check_date", since.slice(0, 10)).limit(1);
        return !!data?.length;
      }
      case "jarvis":
      case "insights":
      case "relatorios": {
        const { data } = await sb.from("jarvis_insights").select("id").gte("created_at", since).limit(1);
        if (data?.length) return true;
        const { data: r } = await sb.from("ai_reports").select("id").gte("created_at", since).limit(1);
        return !!r?.length;
      }
      default: {
        // identidade, proposito, intelecto, laboratorio, manual, protocolos,
        // ideias, sombra → tracked through journal entries tagged with module
        const { data } = await sb.from("journal_entries")
          .select("id").eq("module", module).gte("created_at", since).limit(1);
        return !!data?.length;
      }
    }
  } catch {
    return false;
  }
}

/**
 * Scan pending subtasks of active chains and auto-complete those whose target
 * module shows activity TODAY. Returns the number of subtasks completed.
 */
export async function syncChainProgress(userId: string): Promise<number> {
  const sb: any = supabase;
  const since = startOfDayISO();

  const { data: chains } = await sb.from("operational_chains")
    .select("id").eq("user_id", userId).eq("status", "ativa");
  if (!chains?.length) return 0;
  const chainIds = chains.map((c: any) => c.id);

  const { data: subs } = await sb.from("chain_subtasks")
    .select("id,chain_id,module,status")
    .in("chain_id", chainIds)
    .neq("status", "done");
  if (!subs?.length) return 0;

  // Cache per-module check to avoid duplicate queries
  const cache = new Map<string, boolean>();
  const toComplete: string[] = [];
  for (const s of subs) {
    const key = s.module ?? "_";
    if (!cache.has(key)) cache.set(key, await hasActivity(s.module, since));
    if (cache.get(key)) toComplete.push(s.id);
  }
  if (!toComplete.length) return 0;

  await sb.from("chain_subtasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .in("id", toComplete);

  // Auto-close chains whose subtasks are all done
  const { data: remaining } = await sb.from("chain_subtasks")
    .select("chain_id,status").in("chain_id", chainIds);
  const byChain = new Map<string, { total: number; done: number }>();
  for (const r of remaining ?? []) {
    const e = byChain.get(r.chain_id) ?? { total: 0, done: 0 };
    e.total++; if (r.status === "done") e.done++;
    byChain.set(r.chain_id, e);
  }
  const closing: string[] = [];
  byChain.forEach((v, k) => { if (v.total > 0 && v.done === v.total) closing.push(k); });
  if (closing.length) {
    await sb.from("operational_chains")
      .update({ status: "concluida", completed_at: new Date().toISOString() })
      .in("id", closing);
  }

  return toComplete.length;
}
