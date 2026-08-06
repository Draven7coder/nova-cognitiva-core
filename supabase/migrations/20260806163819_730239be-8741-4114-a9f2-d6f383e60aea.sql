
CREATE TABLE public.classroom_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  topic TEXT NOT NULL,
  archetype TEXT NOT NULL,
  board_notes TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  comprehension INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classroom_sessions TO authenticated;
GRANT ALL ON public.classroom_sessions TO service_role;
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own classroom_sessions" ON public.classroom_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_classroom_sessions_updated BEFORE UPDATE ON public.classroom_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reading_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  total_pages INTEGER NOT NULL DEFAULT 0,
  current_page INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_books TO authenticated;
GRANT ALL ON public.reading_books TO service_role;
ALTER TABLE public.reading_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reading_books" ON public.reading_books FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_reading_books_updated BEFORE UPDATE ON public.reading_books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reading_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.reading_books(id) ON DELETE CASCADE,
  page_start INTEGER NOT NULL,
  page_end INTEGER NOT NULL,
  literal_layer TEXT,
  critical_layer TEXT,
  applied_layer TEXT,
  ai_triangulation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_blocks TO authenticated;
GRANT ALL ON public.reading_blocks TO service_role;
ALTER TABLE public.reading_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reading_blocks" ON public.reading_blocks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_reading_blocks_updated BEFORE UPDATE ON public.reading_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.review_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  source TEXT,
  deck TEXT NOT NULL DEFAULT 'geral',
  ease NUMERIC NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_cards TO authenticated;
GRANT ALL ON public.review_cards TO service_role;
ALTER TABLE public.review_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own review_cards" ON public.review_cards FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_review_cards_updated BEFORE UPDATE ON public.review_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.memory_loci (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  palace TEXT NOT NULL DEFAULT 'São Paulo',
  locus_name TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  content TEXT,
  image_cue TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_loci TO authenticated;
GRANT ALL ON public.memory_loci TO service_role;
ALTER TABLE public.memory_loci ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memory_loci" ON public.memory_loci FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_memory_loci_updated BEFORE UPDATE ON public.memory_loci FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
