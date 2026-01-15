-- Add draft column to articles table
ALTER TABLE public.articles
ADD COLUMN draft boolean NOT NULL DEFAULT false;

-- Drop the existing select policy that doesn't account for drafts
DROP POLICY IF EXISTS "Public users can view non-private articles" ON public.articles;

-- Create a new select policy that accounts for both private and draft articles
-- Draft articles are only visible to their creator
-- Private articles are visible to authenticated users
-- Public articles are visible to everyone
CREATE POLICY "Users can view articles based on visibility rules"
ON public.articles
FOR SELECT
USING (
  CASE
    WHEN draft = true THEN auth.uid() = user_id
    WHEN private = true THEN auth.uid() IS NOT NULL
    ELSE true
  END
);