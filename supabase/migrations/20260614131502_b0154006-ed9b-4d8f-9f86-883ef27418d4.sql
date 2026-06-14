CREATE TABLE IF NOT EXISTS public.shadow_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  confidence INTEGER NOT NULL DEFAULT 30,
  trend TEXT NOT NULL DEFAULT 'estavel',
  evidence_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_against JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_protocols JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'suspeita',
  appearances INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shadow_hypotheses TO authenticated;
GRANT ALL ON public.shadow_hypotheses TO service_role;

ALTER TABLE public.shadow_hypotheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own shadow hypotheses"
  ON public.shadow_hypotheses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shadow_hypotheses_user ON public.shadow_hypotheses(user_id);
CREATE INDEX IF NOT EXISTS idx_shadow_hypotheses_category ON public.shadow_hypotheses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_shadow_hypotheses_status ON public.shadow_hypotheses(user_id, status);

CREATE TRIGGER trg_shadow_hypotheses_updated_at
  BEFORE UPDATE ON public.shadow_hypotheses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();