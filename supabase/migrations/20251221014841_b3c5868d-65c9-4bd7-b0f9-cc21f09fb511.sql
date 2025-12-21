-- Drop existing open policies on address_markers
DROP POLICY IF EXISTS "Allow public insert access" ON address_markers;
DROP POLICY IF EXISTS "Allow public read access" ON address_markers;
DROP POLICY IF EXISTS "Allow public update access" ON address_markers;

-- Create new restricted policies for authenticated users only
CREATE POLICY "Authenticated users can insert address markers"
ON address_markers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can select address markers"
ON address_markers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update address markers"
ON address_markers FOR UPDATE TO authenticated USING (true);