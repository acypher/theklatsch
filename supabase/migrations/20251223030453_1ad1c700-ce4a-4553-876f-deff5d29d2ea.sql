-- Drop the restrictive UPDATE policy and create a permissive one instead
DROP POLICY IF EXISTS "Authenticated users can update display issue" ON public.issue;

-- Create a permissive UPDATE policy for authenticated users to update display settings
CREATE POLICY "Authenticated users can update display settings" 
ON public.issue 
FOR UPDATE 
TO authenticated
USING (key = ANY (ARRAY['display_issue'::text, 'display_month'::text, 'display_year'::text]))
WITH CHECK (key = ANY (ARRAY['display_issue'::text, 'display_month'::text, 'display_year'::text]));