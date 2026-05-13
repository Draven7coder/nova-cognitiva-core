CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.jarvis_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('weakness','evolution','alert')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  source_module TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','archived')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jarvis_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_jarvis_select" ON public.jarvis_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_jarvis_insert" ON public.jarvis_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_jarvis_update" ON public.jarvis_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_jarvis_delete" ON public.jarvis_insights FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_jarvis_user_kind ON public.jarvis_insights(user_id, kind, status);
CREATE INDEX idx_jarvis_created ON public.jarvis_insights(user_id, created_at DESC);

CREATE TRIGGER update_jarvis_updated_at
BEFORE UPDATE ON public.jarvis_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();