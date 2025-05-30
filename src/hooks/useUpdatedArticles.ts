
import { useState, useEffect } from 'react';
import { ARTICLE_UPDATED_EVENT } from '@/components/EditArticleForm';

// Local storage key for updated articles
const UPDATED_ARTICLES_STORAGE_KEY = 'klatsch-updated-articles';

export const useUpdatedArticles = () => {
  const [updatedArticles, setUpdatedArticles] = useState<{[key: string]: string}>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(UPDATED_ARTICLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Persist updated articles to localStorage
  useEffect(() => {
    localStorage.setItem(UPDATED_ARTICLES_STORAGE_KEY, JSON.stringify(updatedArticles));
  }, [updatedArticles]);

  useEffect(() => {
    const handleArticleUpdated = (e: CustomEvent) => {
      const { articleId, updatedAt } = e.detail;
      
      setUpdatedArticles(prev => ({
        ...prev,
        [articleId]: updatedAt
      }));
    };

    window.addEventListener(ARTICLE_UPDATED_EVENT, handleArticleUpdated as EventListener);

    return () => {
      window.removeEventListener(ARTICLE_UPDATED_EVENT, handleArticleUpdated as EventListener);
    };
  }, []);

  const clearUpdatedArticle = (articleId: string) => {
    setUpdatedArticles(prev => {
      const newUpdated = { ...prev };
      delete newUpdated[articleId];
      return newUpdated;
    });
  };

  return { updatedArticles, clearUpdatedArticle };
};
