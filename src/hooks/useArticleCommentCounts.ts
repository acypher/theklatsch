
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCommentView } from "@/contexts/CommentViewContext";
import { CommentCountMap } from "@/contexts/CommentViewContext";

// Hook to fetch comment and viewed counts for a list of article IDs
export function useArticleCommentCounts(articleIds: string[]) {
  const { user, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<CommentCountMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Use try-catch to handle the case when CommentViewContext is not available
  let commentCounts: CommentCountMap = {};
  let refreshContextCounts: () => Promise<void> = async () => {};
  
  try {
    const context = useCommentView();
    commentCounts = context.commentCounts;
    refreshContextCounts = context.refreshCommentCounts;
  } catch (error) {
    // If CommentViewContext is not available, use an empty object
    commentCounts = {};
    refreshContextCounts = async () => {};
  }

  // Define fetchCounts as a useCallback to prevent unnecessary re-renders
  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated || articleIds.length === 0) {
      setCounts({});
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);

    try {
      // First try to refresh counts from context
      await refreshContextCounts();
      
      // Check if we now have the data in context
      const relevantContextCounts = Object.entries(commentCounts)
        .filter(([id]) => articleIds.includes(id))
        .reduce((acc, [id, data]) => ({ ...acc, [id]: data }), {});
        
      if (Object.keys(relevantContextCounts).length === articleIds.length) {
        setCounts(relevantContextCounts);
        setIsLoading(false);
        return;
      }
      
      // Fall back to direct fetching if context doesn't have all the data
      const { data: rawCommentCounts, error: ccError } = await supabase
        .from("comments")
        .select("article_id, id");

      // Get the viewed comment count per article for this user
      const { data: viewed, error: vError } = await supabase
        .from("comment_views")
        .select("article_id, comment_id")
        .eq("user_id", user.id);

      if (ccError || vError || !rawCommentCounts) {
        setHasError(true);
        setCounts({});
        setIsLoading(false);
        return;
      }

      // Compute counts per article
      const commentCountMap: { [id: string]: Set<string> } = {};
      for (const item of rawCommentCounts) {
        if (!commentCountMap[item.article_id]) {
          commentCountMap[item.article_id] = new Set();
        }
        commentCountMap[item.article_id].add(item.id);
      }

      const viewedMap: { [id: string]: Set<string> } = {};
      if (viewed) {
        for (const item of viewed) {
          if (!viewedMap[item.article_id]) {
            viewedMap[item.article_id] = new Set();
          }
          viewedMap[item.article_id].add(item.comment_id);
        }
      }

      const result: CommentCountMap = {};
      for (const articleId of articleIds) {
        const total = commentCountMap[articleId]?.size ?? 0;
        const seen = viewedMap[articleId]?.size ?? 0;
        result[articleId] = { commentCount: total, viewedCommentCount: seen };
      }
      setCounts(result);
    } catch (error) {
      console.error("Error fetching comment counts:", error);
      setHasError(true);
      setCounts({});
    } finally {
      setIsLoading(false);
    }
  }, [articleIds.join(","), isAuthenticated, user?.id, Object.keys(commentCounts).length]);

  // Fetch counts when dependencies change
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, commentCounts]);

  // Always prioritize context values for the requested articles
  const relevantContextCounts = Object.entries(commentCounts)
    .filter(([id]) => articleIds.includes(id))
    .reduce((acc, [id, data]) => ({ ...acc, [id]: data }), {});
    
  const finalCounts = Object.keys(relevantContextCounts).length > 0 
    ? relevantContextCounts 
    : counts;

  return { counts: finalCounts, isLoading, hasError, refreshCounts: fetchCounts };
}
