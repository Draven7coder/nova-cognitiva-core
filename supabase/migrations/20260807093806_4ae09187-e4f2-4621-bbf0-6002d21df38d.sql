CREATE TABLE public.will_dojo_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  log_date date not null default (now() at time zone 'America/Sao_Paulo')::date,
  challenge text not null,
  category text not null default 'físico',
  discomfort_level int not null default 5,
  duration_min int not null default 0,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.will_dojo_sessions TO authenticated;
GRANT ALL ON public.will_dojo_sessions TO service_role;
ALTER TABLE public.will_dojo_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own will_dojo_sessions" ON public.will_dojo_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_will_dojo_updated BEFORE UPDATE ON public.will_dojo_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cut_rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item text not null,
  category text not null default 'hábito',
  reason text,
  decision text not null default 'observar',
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cut_rituals TO authenticated;
GRANT ALL ON public.cut_rituals TO service_role;
ALTER TABLE public.cut_rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cut_rituals" ON public.cut_rituals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_cut_rituals_updated BEFORE UPDATE ON public.cut_rituals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.income_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  stream_type text not null default 'ativa',
  amount numeric not null default 0,
  ref_month date not null default date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_streams TO authenticated;
GRANT ALL ON public.income_streams TO service_role;
ALTER TABLE public.income_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own income_streams" ON public.income_streams FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_income_streams_updated BEFORE UPDATE ON public.income_streams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.system_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  checklist jsonb not null default '[]'::jsonb,
  score int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_audits TO authenticated;
GRANT ALL ON public.system_audits TO service_role;
ALTER TABLE public.system_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own system_audits" ON public.system_audits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_system_audits_updated BEFORE UPDATE ON public.system_audits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();