import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import LoadingState from "./article/LoadingState";
import NoArticlesFound from "./article/NoArticlesFound";
import UnsavedChangesPrompt from "./article/UnsavedChangesPrompt";
import SelectedKeyword from "./article/SelectedKeyword";
import ArticlesGrid from "./article/ArticlesGrid";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
  readArticles?: Set<string>;
  hideRead?: boolean;
  filterEnabled?: boolean;
  onFilterToggle?: (checked: boolean) => void;
  allArticles?: Article[];
  currentIssue?: string;
  searchQuery?: string;
  onKeywordClick?: (keyword: string) => void;
}

const ArticleList = ({ 
  articles: initialArticles, 
  selectedKeyword, 
  onKeywordClear, 
  loading = false, 
  readArticles = new Set(), 
  hideRead = false,
  filterEnabled = false,
  onFilterToggle,
  allArticles,
  currentIssue,
  searchQuery = "",
  onKeywordClick
}: ArticleListProps) => {
  const { isAuthenticated } = useAuth();
  const [localArticles, setLocalArticles] = useState<Article[]>([]);

  useEffect(() => {
    setLocalArticles(initialArticles);
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
  
  // Always render the grid to show ToC, even if no articles match current filters

  return (
    <div className="space-y-6">
      <SelectedKeyword 
        keyword={selectedKeyword || ""} 
        onClear={onKeywordClear || (() => {})} 
      />

      <ArticlesGrid 
        articles={localArticles}
        allArticles={allArticles || initialArticles} // Pass the complete list
        isLoggedIn={isLoggedIn}
        isDragging={isDragging}
        draggedItemId={draggedItem?.id || null}
        readArticles={readArticles}
        hideRead={hideRead}
        filterEnabled={filterEnabled}
        onFilterToggle={onFilterToggle}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        currentIssue={currentIssue}
        searchQuery={searchQuery}
        onKeywordClick={onKeywordClick}
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