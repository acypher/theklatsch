
-- Create a table for issue-specific editor's recommendations
CREATE TABLE IF NOT EXISTS issue_recommendations (
  issue TEXT PRIMARY KEY,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create update trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_issue_recommendations_timestamp ON issue_recommendations;
CREATE TRIGGER update_issue_recommendations_timestamp
BEFORE UPDATE ON issue_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- Add RLS policies
ALTER TABLE issue_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read recommendations
CREATE POLICY issue_recommendations_read_policy 
  ON issue_recommendations 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow only authenticated users to insert and update recommendations
CREATE POLICY issue_recommendations_insert_policy 
  ON issue_recommendations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY issue_recommendations_update_policy 
  ON issue_recommendations 
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
