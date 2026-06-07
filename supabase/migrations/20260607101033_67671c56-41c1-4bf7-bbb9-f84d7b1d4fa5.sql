CREATE TABLE public.emergent_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('cognitivo','execucao','emocional','estrategico','identidade')),
  insight_type TEXT NOT NULL DEFAULT 'rapido' CHECK (insight_type IN ('rapido','profundo','alerta','recomendacao','relatorio')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  pattern_data JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','dismissed')),
  source_scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergent_insights TO authenticated;
GRANT ALL ON public.emergent_insights TO service_role;

ALTER TABLE public.emergent_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own emergent insights"
ON public.emergent_insights FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_emergent_insights_user_created ON public.emergent_insights(user_id, created_at DESC);
CREATE INDEX idx_emergent_insights_user_category ON public.emergent_insights(user_id, category);

CREATE TRIGGER update_emergent_insights_updated_at
BEFORE UPDATE ON public.emergent_insights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();