
import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "./article/LoadingState";
import NoArticlesFound from "./article/NoArticlesFound";
import UnsavedChangesPrompt from "./article/UnsavedChangesPrompt";
import SelectedKeyword from "./article/SelectedKeyword";
import ArticlesGrid from "./article/ArticlesGrid";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { CommentViewProvider } from "@/contexts/CommentViewContext";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
  readArticles?: Set<string>;
  hideRead?: boolean;
}

const ArticleList = ({ 
  articles: initialArticles, 
  selectedKeyword, 
  onKeywordClear, 
  loading = false, 
  readArticles = new Set(), 
  hideRead = false 
}: ArticleListProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  
  useEffect(() => {
    setLocalArticles(initialArticles);
    
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
  }, [initialArticles]);

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
  } = useDragAndDrop(localArticles, setLocalArticles);

  if (loading) return <LoadingState />;
  if (!loading && initialArticles.length === 0) return <NoArticlesFound />;

  return (
    <div className="space-y-6">
      <SelectedKeyword 
        keyword={selectedKeyword || ""} 
        onClear={onKeywordClear || (() => {})} 
      />
      
      {/* Wrap ArticlesGrid with CommentViewProvider here since it's using useCommentView */}
      <CommentViewProvider>
        <ArticlesGrid 
          articles={localArticles}
          isLoggedIn={isLoggedIn}
          isDragging={isDragging}
          draggedItemId={draggedItem?.id || null}
          readArticles={readArticles}
          hideRead={hideRead}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      </CommentViewProvider>
      
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
