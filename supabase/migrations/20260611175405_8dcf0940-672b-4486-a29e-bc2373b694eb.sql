
CREATE TABLE public.operational_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  priority INTEGER NOT NULL DEFAULT 50,
  primary_module TEXT,
  archived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operational_chains TO authenticated;
GRANT ALL ON public.operational_chains TO service_role;
ALTER TABLE public.operational_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own chains" ON public.operational_chains FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chain_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chain_id UUID NOT NULL REFERENCES public.operational_chains(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  module TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  order_index INTEGER NOT NULL DEFAULT 0,
  unlocks_subtask_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chain_subtasks TO authenticated;
GRANT ALL ON public.chain_subtasks TO service_role;
ALTER TABLE public.chain_subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own subtasks" ON public.chain_subtasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality INTEGER,
  energy INTEGER,
  focus INTEGER,
  mood INTEGER,
  stress INTEGER,
  discomfort TEXT,
  notes TEXT,
  operational_mode TEXT,
  main_mission TEXT,
  bottleneck TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, check_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkins TO authenticated;
GRANT ALL ON public.daily_checkins TO service_role;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own checkins" ON public.daily_checkins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_chains_user_status ON public.operational_chains(user_id, status);
CREATE INDEX idx_subtasks_chain ON public.chain_subtasks(chain_id, order_index);
CREATE INDEX idx_subtasks_user_status ON public.chain_subtasks(user_id, status);
CREATE INDEX idx_checkins_user_date ON public.daily_checkins(user_id, check_date DESC);

CREATE TRIGGER trg_chains_updated BEFORE UPDATE ON public.operational_chains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subtasks_updated BEFORE UPDATE ON public.chain_subtasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_checkins_updated BEFORE UPDATE ON public.daily_checkins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
