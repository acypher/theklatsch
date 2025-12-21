-- Allow authenticated users to update the display issue settings
-- This is needed for the issue selector to work for logged-in users
CREATE POLICY "Authenticated users can update display issue"
ON issue FOR UPDATE TO authenticated
USING (key IN ('display_issue', 'display_month', 'display_year'))
WITH CHECK (key IN ('display_issue', 'display_month', 'display_year'));