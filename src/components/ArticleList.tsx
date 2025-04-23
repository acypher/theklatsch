
import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "./article/LoadingState";
import NoArticlesFound from "./article/NoArticlesFound";
import UnsavedChangesPrompt from "./article/UnsavedChangesPrompt";
import KeywordFilter from "./article/KeywordFilter";
import ArticlesGrid from "./article/ArticlesGrid";
import { useArticleDragAndDrop } from "@/hooks/useArticleDragAndDrop";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
  readArticles?: Set<string>;
  hideRead?: boolean;
}

const ArticleList = ({ 
  articles, 
  selectedKeyword, 
  onKeywordClear, 
  loading = false, 
  readArticles = new Set(), 
  hideRead = false 
}: ArticleListProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  
  useEffect(() => {
    setLocalArticles(articles);
    
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [articles]);

  const {
    draggedItem,
    isDragging,
    hasChanges,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleCancelChanges,
    saveChanges
  } = useArticleDragAndDrop(articles, setLocalArticles, isLoggedIn);

  const scrollToArticle = (articleId: string) => {
    const articleElement = document.getElementById(`article-${articleId}`);
    
    if (articleElement) {
      const headerOffset = 100;
      const elementPosition = articleElement.getBoundingClientRect().top;
      
      window.scrollTo({
        top: window.scrollY + elementPosition - headerOffset,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!loading && articles.length === 0) {
    return <NoArticlesFound />;
  }

  return (
    <div className="space-y-6">
      {selectedKeyword && (
        <KeywordFilter 
          selectedKeyword={selectedKeyword} 
          onClear={onKeywordClear!} 
        />
      )}
      
      <ArticlesGrid 
        articles={localArticles}
        isLoggedIn={isLoggedIn}
        isDragging={isDragging}
        draggedItemId={draggedItem?.id || null}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onArticleClick={scrollToArticle}
        readArticles={readArticles}
        hideRead={hideRead}
      />
      
      {hasChanges && (
        <UnsavedChangesPrompt 
          onCancel={handleCancelChanges}
          onSave={saveChanges}
        />
      )}
    </div>
  );
};

export default ArticleList;
