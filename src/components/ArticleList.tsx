
import { useRef } from "react";
import { Article } from "@/lib/types";
import TableOfContents from "./TableOfContents";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "./article/LoadingState";
import NoArticlesFound from "./article/NoArticlesFound";
import UnsavedChangesPrompt from "./article/UnsavedChangesPrompt";
import KeywordFilter from "./article/KeywordFilter";
import ArticleGrid from "./article/ArticleGrid";
import { useArticleDragAndDrop } from "@/hooks/useArticleDragAndDrop";
import { useEffect, useState } from "react";

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
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const {
    isDragging,
    draggedItem,
    localArticles,
    hasChanges,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleCancelChanges,
    setLocalArticles
  } = useArticleDragAndDrop(articles, isLoggedIn);

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

  const scrollToArticle = (articleId: string) => {
    const articleElement = articleRefs.current.get(articleId);
    
    if (articleElement) {
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const extraPadding = 20;
      const yOffset = -(navbarHeight + extraPadding);
      
      const y = articleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Filter articles for display if hideRead is true
  const displayArticles = hideRead 
    ? localArticles.filter(article => !readArticles.has(article.id))
    : localArticles;

  if (loading) return <LoadingState />;
  if (!loading && articles.length === 0) return <NoArticlesFound />;

  return (
    <div className="space-y-6">
      <KeywordFilter keyword={selectedKeyword} onClear={onKeywordClear || (() => {})} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="h-full">
          <TableOfContents 
            articles={localArticles} 
            onArticleClick={scrollToArticle}
            readArticles={readArticles}
            hideRead={hideRead}
          />
        </div>
        
        <ArticleGrid
          articles={displayArticles}
          isLoggedIn={isLoggedIn}
          isDragging={isDragging}
          draggedItemId={draggedItem?.id || null}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onArticleRef={(id, el) => {
            if (el) articleRefs.current.set(id, el);
          }}
        />
      </div>
      
      {hasChanges && (
        <UnsavedChangesPrompt 
          onCancel={handleCancelChanges}
          onSave={() => {}} // This is handled in the hook
        />
      )}
    </div>
  );
};

export default ArticleList;
