-- Add auto_mark_read column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN auto_mark_read BOOLEAN NOT NULL DEFAULT false;