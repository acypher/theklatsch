-- Add summary column to articles table
ALTER TABLE public.articles 
ADD COLUMN summary text;