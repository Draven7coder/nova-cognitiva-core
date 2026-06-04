-- 1. Recurrence on missions
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'once',
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMPTZ;

-- 2. Mission completions
CREATE TABLE IF NOT EXISTS public.mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quality SMALLINT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_completions TO authenticated;
GRANT ALL ON public.mission_completions TO service_role;

ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own mission_completions"
  ON public.mission_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS mission_completions_user_date_idx
  ON public.mission_completions (user_id, completed_at DESC);

-- 3. OODA entries
CREATE TABLE IF NOT EXISTS public.ooda_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT,
  observe TEXT NOT NULL DEFAULT '',
  orient TEXT NOT NULL DEFAULT '',
  counter_argument TEXT NOT NULL DEFAULT '',
  decide TEXT NOT NULL DEFAULT '',
  act TEXT NOT NULL DEFAULT '',
  comfort_zone SMALLINT NOT NULL DEFAULT 5,
  data_integrity BOOLEAN NOT NULL DEFAULT true,
  integrity_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ooda_entries TO authenticated;
GRANT ALL ON public.ooda_entries TO service_role;

ALTER TABLE public.ooda_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own ooda_entries"
  ON public.ooda_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_ooda_entries_updated_at
  BEFORE UPDATE ON public.ooda_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS ooda_entries_user_date_idx
  ON public.ooda_entries (user_id, created_at DESC);