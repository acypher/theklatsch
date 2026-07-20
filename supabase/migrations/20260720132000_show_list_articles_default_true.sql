-- New users should see list articles by default (show_list_articles = true).
-- Existing rows are left unchanged.
ALTER TABLE public.user_preferences
ALTER COLUMN show_list_articles SET DEFAULT true;
