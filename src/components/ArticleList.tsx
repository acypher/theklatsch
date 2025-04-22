
import { useState, useEffect, useRef } from "react";
import { Article } from "@/lib/types";
import TableOfContents from "./TableOfContents";
import { supabase } from "@/integrations/supabase/client";
import { updateArticlesOrder } from "@/lib/data/article/specialOperations";
import { toast } from "sonner";
import DraggableArticle from "./article/DraggableArticle";
import LoadingState from "./article/LoadingState";
import NoArticlesFound from "./article/NoArticlesFound";
import UnsavedChangesPrompt from "./article/UnsavedChangesPrompt";
import { useArticleReads } from "@/hooks/use-article-reads";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import * as React from "react";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
}

const ArticleList = ({ articles, selectedKeyword, onKeywordClear, loading = false }: ArticleListProps) => {
  const [filterRead, setFilterRead] = useState(() => {
    const savedPreference = localStorage.getItem('filterReadArticles');
    return savedPreference ? savedPreference === 'true' : false;
  });
  
  const { readArticles, toggleRead, loading: readStatesLoading } = useArticleReads();
  const { isAuthenticated } = useAuth();
  
  const [draggedItem, setDraggedItem] = useState<Article | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
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

  useEffect(() => {
    localStorage.setItem('filterReadArticles', filterRead.toString());
  }, [filterRead]);

  if (loading || readStatesLoading) {
    return <LoadingState />;
  }

  if (!loading && articles.length === 0) {
    return <NoArticlesFound />;
  }

  const getFilteredArticles = () => {
    if (!filterRead || !isAuthenticated) return localArticles;
    
    const read = localArticles.filter(article => readArticles[article.id]);
    const unread = localArticles.filter(article => !readArticles[article.id]);
    
    return [...unread, <Separator className="my-8 relative z-10" key="separator" />, ...read];
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Article) => {
    if (!isLoggedIn) return;
    
    setDraggedItem(item);
    setIsDragging(true);
    
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
    
    const element = e.currentTarget;
    if (element) {
      setTimeout(() => {
        element.classList.add("opacity-50", "scale-95");
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    
    const element = e.currentTarget;
    if (element) {
      element.classList.remove("opacity-50", "scale-95");
    }
    
    if (hasChanges) {
      saveChanges();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const updatedArticles = [...localArticles];
    
    const draggedIndex = updatedArticles.findIndex(item => item.id === draggedItem.id);
    const targetIndex = updatedArticles.findIndex(item => item.id === targetItem.id);
    
    if (draggedIndex < 0 || targetIndex < 0) return;
    
    const [removed] = updatedArticles.splice(draggedIndex, 1);
    updatedArticles.splice(targetIndex, 0, removed);
    
    const articlesWithNewPositions = updatedArticles.map((article, index) => ({
      ...article,
      displayPosition: index + 1
    }));
    
    setLocalArticles(articlesWithNewPositions);
    setHasChanges(true);
    setDraggedItem(null);
  };

  const saveChanges = async () => {
    const orderData = localArticles.map((article, index) => ({
      id: article.id,
      position: index + 1
    }));
    
    try {
      const success = await updateArticlesOrder(orderData);
      if (success) {
        toast.success("Article order updated successfully");
      } else {
        toast.error("Failed to update article order");
        setLocalArticles(articles);
      }
    } catch (error) {
      console.error("Error saving article order:", error);
      toast.error("Failed to update article order");
      setLocalArticles(articles);
    } finally {
      setHasChanges(false);
    }
  };

  const scrollToArticle = (articleId: string) => {
    const articleElement = articleRefs.current.get(articleId);
    if (articleElement) {
      const yOffset = -100; 
      const y = articleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const handleCancelChanges = () => {
    setLocalArticles(articles);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        {selectedKeyword && (
          <div className="flex items-center gap-2">
            <p className="font-medium">Filtered by keyword:</p>
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm flex items-center gap-1">
              {selectedKeyword}
              <button 
                onClick={onKeywordClear} 
                className="ml-1 hover:bg-primary-foreground/20 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs"
              >
                ×
              </button>
            </span>
          </div>
        )}
        {isAuthenticated && (
          <div className="flex items-center gap-2 ml-auto">
            <Checkbox
              id="filter-read"
              checked={filterRead}
              onCheckedChange={(checked) => setFilterRead(checked as boolean)}
            />
            <label htmlFor="filter-read" className="text-sm text-muted-foreground">
              Filter articles already read
            </label>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="h-full">
          <TableOfContents 
            articles={localArticles}
            onArticleClick={scrollToArticle}
            readArticles={readArticles}
          />
        </div>
        
        {getFilteredArticles().map((item) => {
          if (React.isValidElement(item)) return item;
          
          const article = item as Article;
          return (
            <DraggableArticle
              key={article.id}
              article={article}
              isLoggedIn={isLoggedIn}
              isDragging={isDragging}
              draggedItemId={draggedItem?.id || null}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isRead={readArticles[article.id]}
              onReadChange={toggleRead}
              ref={(el) => {
                if (el) articleRefs.current.set(article.id, el);
              }}
            />
          );
        })}
      </div>
      
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
