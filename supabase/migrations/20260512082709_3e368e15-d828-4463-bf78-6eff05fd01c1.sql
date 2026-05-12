CREATE TABLE public.hydration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  consumed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_hydration_select" ON public.hydration_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_hydration_insert" ON public.hydration_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_hydration_update" ON public.hydration_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_hydration_delete" ON public.hydration_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_hydration_user_time ON public.hydration_logs(user_id, consumed_at DESC);