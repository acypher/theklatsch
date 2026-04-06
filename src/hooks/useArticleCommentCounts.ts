
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { COMMENTS_UPDATED_EVENT } from "@/components/comments/CommentDialog";

interface ArticleCommentCounts {
  [articleId: string]: {
    commentCount: number;
    viewedCommentCount: number;
  };
}

// Hook to fetch comment and viewed counts for a list of article IDs
export function useArticleCommentCounts(articleIds: string[]) {
  const { user, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<ArticleCommentCounts>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchCounts = async () => {
    if (articleIds.length === 0) {
      setCounts({});
      return;
    }
    setIsLoading(true);

    // Fetch comment counts for displayed articles (visible to all authenticated users per RLS)
    const { data: rawCommentCounts, error: ccError } = await supabase
      .from("comments")
      .select("article_id, id")
      .in("article_id", articleIds);

    // Only fetch viewed comments if user is logged in
    let viewed: { article_id: string; comment_id: string }[] | null = null;
    let vError = null;
    if (isAuthenticated && user) {
      const result = await supabase
        .from("comment_views")
        .select("article_id, comment_id")
        .eq("user_id", user.id)
        .in("article_id", articleIds);
      viewed = result.data;
      vError = result.error;
    }

    if (ccError || vError || !rawCommentCounts) {
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

    const result: ArticleCommentCounts = {};
    for (const articleId of articleIds) {
      const total = commentCountMap[articleId]?.size ?? 0;
      const seen = viewedMap[articleId]?.size ?? 0;
      result[articleId] = { commentCount: total, viewedCommentCount: seen };
    }
    setCounts(result);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCounts();
    
    // Listen for comment updates
    const handleCommentsUpdated = (e: CustomEvent) => {
      const { articleId } = e.detail;
      
      // If the updated article is in our list, refresh counts
      if (articleIds.includes(articleId)) {
        fetchCounts();
      }
    };

    // Add event listener for comments updates
    window.addEventListener(
      COMMENTS_UPDATED_EVENT, 
      handleCommentsUpdated as EventListener
    );
    
    // Re-run only if user or articleIds change
    return () => {
      window.removeEventListener(
        COMMENTS_UPDATED_EVENT, 
        handleCommentsUpdated as EventListener
      );
    };
  }, [articleIds.join(","), isAuthenticated, user?.id]);

  return { counts, isLoading, fetchCounts };
}
