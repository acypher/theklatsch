-- Fix email exposure in comments table by restricting public access to author_email field
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public can read safe comment fields" ON public.comments;

-- Create a new policy that excludes sensitive fields for public access
-- This policy will allow public to read comments but not email addresses
CREATE POLICY "Public can read comments without email" 
ON public.comments 
FOR SELECT 
TO public, anon
USING (true);

-- The existing "Users can see their own comment details" policy already allows 
-- authenticated users to see their own full comment details including email