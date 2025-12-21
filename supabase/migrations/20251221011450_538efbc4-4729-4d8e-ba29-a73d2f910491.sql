-- Drop the comments_safe view (not used in application)
DROP VIEW IF EXISTS public.comments_safe;

-- Remove the author_email column from comments table
ALTER TABLE public.comments DROP COLUMN IF EXISTS author_email;