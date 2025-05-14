
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
    if (!isAuthenticated) {
      setCommentCounts({});
      return;
    }

    // This would be implemented with the actual supabase fetching code
    // But for now we're just reusing the existing functionality
  };

  // Function to mark comments for an article as viewed
  const updateViewedCommentsForArticle = (articleId: string) => {
    if (!articleId || !isAuthenticated) return;

    setCommentCounts(prev => {
      // If we don't have this article in our counts, don't update anything
      if (!prev[articleId]) return prev;

      // Create a new object with updated counts
      return {
        ...prev,
        [articleId]: {
          ...prev[articleId],
          viewedCommentCount: prev[articleId].commentCount
        }
      };
    });
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
