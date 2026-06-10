
ALTER TABLE public.emergent_insights
  ADD COLUMN IF NOT EXISTS feedback_rating int,
  ADD COLUMN IF NOT EXISTS feedback_useful boolean,
  ADD COLUMN IF NOT EXISTS feedback_note text;

ALTER TABLE public.journal_entries REPLICA IDENTITY FULL;
ALTER TABLE public.mission_completions REPLICA IDENTITY FULL;
ALTER TABLE public.ooda_entries REPLICA IDENTITY FULL;
ALTER TABLE public.emergent_insights REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_entries;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_completions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ooda_entries;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.emergent_insights;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
