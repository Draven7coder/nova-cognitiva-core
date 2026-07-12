
-- 1. Trinarius reflections
CREATE TABLE public.trinarius_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,             -- 'batman' | 'reacher' | 'red'
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'concluded'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mode, question_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trinarius_reflections TO authenticated;
GRANT ALL ON public.trinarius_reflections TO service_role;
ALTER TABLE public.trinarius_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trinarius reflections" ON public.trinarius_reflections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_trinarius_reflections_updated
  BEFORE UPDATE ON public.trinarius_reflections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Oficina do Eu chat
CREATE TABLE public.oficina_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,        -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oficina_messages TO authenticated;
GRANT ALL ON public.oficina_messages TO service_role;
ALTER TABLE public.oficina_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own oficina messages" ON public.oficina_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Physical training logs (Corpo de Ferro)
CREATE TABLE public.physical_training_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL,
  exercises_done JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  cold_shower BOOLEAN NOT NULL DEFAULT FALSE,
  stretching_done BOOLEAN NOT NULL DEFAULT FALSE,
  joint_pain BOOLEAN NOT NULL DEFAULT FALSE,
  pain_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, check_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physical_training_logs TO authenticated;
GRANT ALL ON public.physical_training_logs TO service_role;
ALTER TABLE public.physical_training_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own physical logs" ON public.physical_training_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_physical_training_logs_updated
  BEFORE UPDATE ON public.physical_training_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
