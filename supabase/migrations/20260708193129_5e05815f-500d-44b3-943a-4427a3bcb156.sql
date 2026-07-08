CREATE TABLE public.vocabulary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word text NOT NULL,
  meaning text,
  example text,
  level smallint NOT NULL DEFAULT 0,
  exposures integer NOT NULL DEFAULT 1,
  active_uses integer NOT NULL DEFAULT 0,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_exposed_at timestamptz NOT NULL DEFAULT now(),
  next_review_at timestamptz NOT NULL DEFAULT (now() + interval '1 day'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX vocabulary_entries_user_word_idx
  ON public.vocabulary_entries (user_id, lower(word));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vocabulary_entries TO authenticated;
GRANT ALL ON public.vocabulary_entries TO service_role;

ALTER TABLE public.vocabulary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own vocabulary" ON public.vocabulary_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER vocabulary_entries_set_updated_at
  BEFORE UPDATE ON public.vocabulary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();