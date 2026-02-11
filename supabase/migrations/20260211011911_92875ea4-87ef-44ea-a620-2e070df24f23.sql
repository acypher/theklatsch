
-- Fix UPDATE policy on article_updates to allow any authenticated user to update
DROP POLICY IF EXISTS "Users can update their own article updates" ON public.article_updates;
CREATE POLICY "Authenticated users can update article updates"
  ON public.article_updates FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Add unique constraint on article_update_views(article_id, user_id) for proper upserts
ALTER TABLE public.article_update_views
  ADD CONSTRAINT article_update_views_article_user_unique UNIQUE (article_id, user_id);
