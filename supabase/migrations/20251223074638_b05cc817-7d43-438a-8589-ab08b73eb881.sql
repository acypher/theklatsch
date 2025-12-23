-- Drop existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update display settings" ON public.issue;

-- Create a PERMISSIVE UPDATE policy for authenticated users
-- The default is permissive, but we need to ensure it's not restrictive
CREATE POLICY "Authenticated users can update display settings" 
ON public.issue 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (key = ANY (ARRAY['display_issue'::text, 'display_month'::text, 'display_year'::text]))
WITH CHECK (key = ANY (ARRAY['display_issue'::text, 'display_month'::text, 'display_year'::text]));