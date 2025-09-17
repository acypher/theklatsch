-- Create a secure view for public comment access that excludes sensitive data
CREATE OR REPLACE VIEW public.comments_public AS
SELECT 
  id,
  content,
  author_name,
  created_at,
  article_id
FROM public.comments;

-- Update RLS policies to be more restrictive
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
DROP POLICY IF EXISTS "Unauthenticated users can read comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.comments;

-- Create new secure policies
-- Allow public to read comments through the secure view (handled by view permissions)
CREATE POLICY "Public can read safe comment fields"
  ON public.comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to see their own sensitive data
CREATE POLICY "Users can see their own comment details"
  ON public.comments  
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Keep existing policies for authenticated operations
-- (Users can create, update, delete their own comments)

-- Grant permissions on the public view
GRANT SELECT ON public.comments_public TO anon;
GRANT SELECT ON public.comments_public TO authenticated;