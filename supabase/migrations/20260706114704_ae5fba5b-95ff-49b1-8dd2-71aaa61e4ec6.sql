
CREATE TABLE public.metasystems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_tag TEXT,
  source_chain_id UUID REFERENCES public.operational_chains(id) ON DELETE SET NULL,
  source_subtask_id UUID REFERENCES public.chain_subtasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  stages JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metasystems TO authenticated;
GRANT ALL ON public.metasystems TO service_role;
ALTER TABLE public.metasystems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own metasystems" ON public.metasystems
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_metasystems_updated_at BEFORE UPDATE ON public.metasystems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  field_key TEXT NOT NULL,
  suggested_content TEXT NOT NULL,
  reason TEXT,
  source_journal_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_suggestions TO authenticated;
GRANT ALL ON public.ai_suggestions TO service_role;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own ai_suggestions" ON public.ai_suggestions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_suggestions_updated_at BEFORE UPDATE ON public.ai_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.jarvis_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jarvis_messages TO authenticated;
GRANT ALL ON public.jarvis_messages TO service_role;
ALTER TABLE public.jarvis_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own jarvis_messages" ON public.jarvis_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_metasystems_user ON public.metasystems(user_id, created_at DESC);
CREATE INDEX idx_ai_suggestions_user_status ON public.ai_suggestions(user_id, status, module);
CREATE INDEX idx_jarvis_messages_user_time ON public.jarvis_messages(user_id, created_at);
