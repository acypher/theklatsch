-- Drop the comments_public view that was causing the security definer view issue
-- This view was not being used in the codebase and posed a security risk
-- by potentially bypassing RLS policies since it runs with postgres permissions
DROP VIEW IF EXISTS public.comments_public;