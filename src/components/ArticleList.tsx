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
import ArticleCard from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
  readArticles?: Set<string>;
  hideRead?: boolean;
}

const ArticleList = ({ articles, selectedKeyword, onKeywordClear, loading = false, readArticles = new Set(), hideRead = false }: ArticleListProps) => {
  const [draggedItem, setDraggedItem] = useState<Article | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [localReadArticles, setLocalReadArticles] = useState<Set<string>>(readArticles);
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  useEffect(() => {
    setLocalArticles(articles);
    setLocalReadArticles(new Set(readArticles));
    
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
  }, [articles, readArticles]);

  if (loading) {
    return <LoadingState />;
  }

  if (!loading && articles.length === 0) {
    return <NoArticlesFound />;
  }

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
    const articleElement = document.getElementById(`article-${articleId}`);
    
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

  const handleCancelChanges = () => {
    setLocalArticles(articles);
    setHasChanges(false);
  };

  const handleReadStateChange = (articleId: string, isRead: boolean) => {
    if (isRead === localReadArticles.has(articleId)) {
      return;
    }
    
    console.log(`Article ${articleId} read state changed to ${isRead} in ArticleList`);
    const newReadArticles = new Set(localReadArticles);
    
    if (isRead) {
      newReadArticles.add(articleId);
    } else {
      newReadArticles.delete(articleId);
    }
    
    setLocalReadArticles(newReadArticles);
  };

  const displayArticles = hideRead 
    ? localArticles.filter(article => !localReadArticles.has(article.id))
    : localArticles;

  const noArticlesAfterFilter = hideRead && displayArticles.length === 0 && localArticles.length > 0;

  return (
    <div className="space-y-6">
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
      
      {noArticlesAfterFilter && (
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">All articles have been read. Disable the filter to see all articles.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="h-full">
          <TableOfContents 
            articles={localArticles} 
            onArticleClick={scrollToArticle}
            readArticles={localReadArticles}
            hideRead={hideRead}
          />
        </div>
        
        {displayArticles.map((article) => (
          <div key={article.id} id={`article-${article.id}`}>
            <ArticleCard
              article={article}
              onReadStateChange={(isRead) => handleReadStateChange(article.id, isRead)}
            />
          </div>
        ))}
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
