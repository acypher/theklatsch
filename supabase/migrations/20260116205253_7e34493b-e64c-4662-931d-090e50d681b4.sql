-- Create table to store indexed archive content for search
CREATE TABLE public.archive_search_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  back_issue_id INTEGER NOT NULL REFERENCES public.back_issues(id) ON DELETE CASCADE,
  display_issue TEXT NOT NULL,
  url TEXT NOT NULL,
  text_content TEXT NOT NULL,
  indexed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(back_issue_id)
);

-- Enable RLS
ALTER TABLE public.archive_search_index ENABLE ROW LEVEL SECURITY;

-- Everyone can read the indexed content for search
CREATE POLICY "Archive search index is publicly readable"
ON public.archive_search_index
FOR SELECT
USING (true);

-- Only admins can manage the index
CREATE POLICY "Admins can manage archive search index"
ON public.archive_search_index
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for full text search
CREATE INDEX idx_archive_search_text ON public.archive_search_index USING gin(to_tsvector('english', text_content));