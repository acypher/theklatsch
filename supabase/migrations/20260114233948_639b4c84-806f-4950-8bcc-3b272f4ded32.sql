-- Allow authenticated (non-admin) users to read issue settings such as latest_issue
CREATE POLICY "Authenticated users can view issue settings"
ON public.issue
FOR SELECT
TO authenticated
USING (true);
