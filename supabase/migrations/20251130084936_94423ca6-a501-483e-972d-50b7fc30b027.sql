-- Create table for article favorites
CREATE TABLE public.article_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Enable Row Level Security
ALTER TABLE public.article_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorites" 
ON public.article_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.article_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.article_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraint
ALTER TABLE public.article_favorites
ADD CONSTRAINT article_favorites_article_id_fkey
FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;