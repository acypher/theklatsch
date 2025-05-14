
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Types for the comment counts
export interface CommentCountMap {
  [articleId: string]: {
    commentCount: number;
    viewedCommentCount: number;
  };
}

interface CommentViewContextType {
  commentCounts: CommentCountMap;
  refreshCommentCounts: () => Promise<void>;
  updateViewedCommentsForArticle: (articleId: string) => void;
}

const CommentViewContext = createContext<CommentViewContextType | null>(null);

export const useCommentView = () => {
  const context = useContext(CommentViewContext);
  if (!context) {
    throw new Error('useCommentView must be used within a CommentViewProvider');
  }
  return context;
};

export const CommentViewProvider = ({ children }: { children: ReactNode }) => {
  const [commentCounts, setCommentCounts] = useState<CommentCountMap>({});
  const { user, isAuthenticated } = useAuth();

  // Function to refresh comment counts
  const refreshCommentCounts = async () => {
    // No need to fetch if not authenticated
    if (!isAuthenticated || !user) {
      setCommentCounts({});
      return;
    }

    try {
      // Get the total comment count per article
      const { data: rawCommentCounts, error: ccError } = await supabase
        .from("comments")
        .select("article_id, id");

      // Get the viewed comment count per article for this user
      const { data: viewed, error: vError } = await supabase
        .from("comment_views")
        .select("article_id, comment_id")
        .eq("user_id", user.id);

      if (ccError || vError || !rawCommentCounts) {
        console.error("Error fetching comment counts:", ccError || vError);
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
      for (const articleId of Object.keys(commentCountMap)) {
        const total = commentCountMap[articleId]?.size ?? 0;
        const seen = viewedMap[articleId]?.size ?? 0;
        result[articleId] = { commentCount: total, viewedCommentCount: seen };
      }
      
      setCommentCounts(result);
    } catch (error) {
      console.error("Error in refreshCommentCounts:", error);
    }
  };

  // Function to mark comments for an article as viewed
  const updateViewedCommentsForArticle = (articleId: string) => {
    if (!articleId || !isAuthenticated) return;

    setCommentCounts(prev => {
      // If we don't have this article in our counts, don't update anything
      if (!prev[articleId]) return prev;

      // Create a new object with updated counts - ensure we're updating correctly
      return {
        ...prev,
        [articleId]: {
          ...prev[articleId],
          viewedCommentCount: prev[articleId].commentCount
        }
      };
    });
    
    // Force refresh to ensure latest data
    refreshCommentCounts();
  };

  // Initial fetch on mount or auth change
  useEffect(() => {
    refreshCommentCounts();
  }, [isAuthenticated, user?.id]);

  const value = {
    commentCounts,
    refreshCommentCounts,
    updateViewedCommentsForArticle
  };

  return (
    <CommentViewContext.Provider value={value}>
      {children}
    </CommentViewContext.Provider>
  );
};
