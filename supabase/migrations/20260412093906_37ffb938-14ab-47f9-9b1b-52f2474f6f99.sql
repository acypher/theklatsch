CREATE TABLE public.article_opens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, user_id)
);

ALTER TABLE public.article_opens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view article opens"
  ON public.article_opens FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own opens"
  ON public.article_opens FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own opens"
  ON public.article_opens FOR UPDATE TO authenticated
  USING (user_id = auth.uid());