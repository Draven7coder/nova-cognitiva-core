import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "restored" | "error";

export interface FieldVersion {
  id: string;
  content: string;
  version: number;
  created_at: string;
}

const lsKey = (uid: string, mod: string, k: string) => `nucleo:${uid}:${mod}:${k}`;

export function useProtectedField(module: string, fieldKey: string) {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [savedValue, setSavedValue] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [locked, setLocked] = useState(true);
  const [versions, setVersions] = useState<FieldVersion[]>([]);
  const [loaded, setLoaded] = useState(false);
  const debRef = useRef<number | null>(null);

  // initial load: prefer DB latest, fallback localStorage (recovery)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("field_versions")
        .select("id, content, version, created_at")
        .eq("user_id", user.id)
        .eq("module", module)
        .eq("field_key", fieldKey)
        .order("version", { ascending: false });
      if (cancelled) return;
      const list = data ?? [];
      setVersions(list);
      const latest = list[0]?.content ?? "";
      const cached = localStorage.getItem(lsKey(user.id, module, fieldKey));
      const useCache = cached !== null && cached !== latest && (list.length === 0 || cached.length > 0);
      const initial = useCache ? cached! : latest;
      setValue(initial);
      setSavedValue(latest);
      setLocked(latest.length > 0);
      setLoaded(true);
      if (useCache) setStatus("restored");
    })();
    return () => { cancelled = true; };
  }, [user, module, fieldKey]);

  // local cache (recovery on reload / nav)
  useEffect(() => {
    if (!user || !loaded) return;
    localStorage.setItem(lsKey(user.id, module, fieldKey), value);
  }, [value, user, loaded, module, fieldKey]);

  const persist = useCallback(async (content: string) => {
    if (!user) return;
    setStatus("saving");
    const nextVersion = (versions[0]?.version ?? 0) + 1;
    const { data, error } = await supabase
      .from("field_versions")
      .insert({ user_id: user.id, module, field_key: fieldKey, content, version: nextVersion })
      .select("id, content, version, created_at")
      .single();
    if (error) { setStatus("error"); return; }
    setVersions((v) => [data as FieldVersion, ...v]);
    setSavedValue(content);
    setStatus("saved");
  }, [user, module, fieldKey, versions]);

  // autosave (debounced 1.5s) — only when unlocked and dirty
  useEffect(() => {
    if (!loaded) return;
    if (value === savedValue) { setStatus((s) => (s === "restored" ? "restored" : "idle")); return; }
    setStatus("dirty");
    if (locked) return; // don't autosave while protected
    if (debRef.current) window.clearTimeout(debRef.current);
    debRef.current = window.setTimeout(() => persist(value), 1500);
    return () => { if (debRef.current) window.clearTimeout(debRef.current); };
  }, [value, savedValue, locked, loaded, persist]);

  const saveNow = useCallback(async () => {
    if (value !== savedValue) await persist(value);
  }, [value, savedValue, persist]);

  const restore = useCallback(async (v: FieldVersion) => {
    setValue(v.content);
    await persist(v.content);
  }, [persist]);

  const lock = () => setLocked(true);
  const unlock = () => setLocked(false);

  const isDirty = value !== savedValue;

  return {
    value, setValue,
    savedValue, isDirty,
    status, locked, lock, unlock,
    versions, restore, saveNow,
    loaded,
  };
}
