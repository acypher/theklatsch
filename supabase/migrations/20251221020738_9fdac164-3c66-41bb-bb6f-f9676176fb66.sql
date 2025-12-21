-- Restrict profiles table SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT TO authenticated USING (true);

-- Restrict article_updates SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can view article updates" ON article_updates;
CREATE POLICY "Authenticated users can view article updates"
ON article_updates FOR SELECT TO authenticated USING (true);

-- Clean up vars table - remove duplicate public SELECT policy
DROP POLICY IF EXISTS "Allow users to read vars" ON vars;

-- Clean up issue table - remove duplicate public SELECT policy
DROP POLICY IF EXISTS "Anyone can read issue data" ON issue;