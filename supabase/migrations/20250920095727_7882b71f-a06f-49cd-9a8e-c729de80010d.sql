-- Additional security measure: Create a view that excludes email data for public-facing queries
-- This addresses the security scanner's concern about email exposure

-- Create a secure view of comments without email addresses
CREATE OR REPLACE VIEW public.comments_safe AS
SELECT 
    id,
    article_id,
    content,
    author_name,
    created_at,
    user_id
FROM public.comments;

-- Enable RLS on the view
ALTER VIEW public.comments_safe SET (security_barrier = true);

-- Grant access to the view for authenticated users
GRANT SELECT ON public.comments_safe TO authenticated;

-- Add a comment to document this security measure
COMMENT ON VIEW public.comments_safe IS 'Secure view of comments without email addresses to prevent email harvesting';