-- Fix email exposure by removing public read access to comments entirely
-- Public users should not be able to read any comment data including emails

-- Drop the current public read policy that still exposes email addresses
DROP POLICY IF EXISTS "Public can read comments without email" ON public.comments;

-- Only allow authenticated users to read comments
-- Anonymous/public users will not be able to read any comment data
CREATE POLICY "Authenticated users can read all comments" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the existing policy that allows users to see their own comment details
-- This is already covered by "Users can see their own comment details" policy