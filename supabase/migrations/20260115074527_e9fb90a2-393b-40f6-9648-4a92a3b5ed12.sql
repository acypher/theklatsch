-- Add show_list_articles preference column (defaults to false for new users)
ALTER TABLE public.user_preferences
ADD COLUMN show_list_articles boolean NOT NULL DEFAULT false;