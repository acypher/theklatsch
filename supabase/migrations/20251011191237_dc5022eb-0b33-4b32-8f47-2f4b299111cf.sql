-- Add private column to articles table
ALTER TABLE articles ADD COLUMN private boolean NOT NULL DEFAULT false;

-- Update RLS policies to filter private articles based on authentication
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Public can read articles" ON articles;

-- Create new policy: Public users can only see non-private articles
CREATE POLICY "Public users can view non-private articles"
ON articles
FOR SELECT
USING (
  CASE 
    WHEN private = true THEN auth.uid() IS NOT NULL
    ELSE true
  END
);

-- Keep existing policies for insert/update/delete (authenticated users only)
-- These already exist and don't need changes