
-- Add user_id column to comments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'comments' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Update CommentForm.tsx to save user_id when creating comments
