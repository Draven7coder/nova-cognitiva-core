CREATE TABLE IF NOT EXISTS public.field_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,
  field_key text NOT NULL,
  content text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_field_versions_lookup
  ON public.field_versions (user_id, module, field_key, created_at DESC);

ALTER TABLE public.field_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_field_versions_select" ON public.field_versions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_field_versions_insert" ON public.field_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_field_versions_delete" ON public.field_versions
  FOR DELETE USING (auth.uid() = user_id);