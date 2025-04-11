
import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import { Loader2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updateArticlesOrder } from "@/lib/data/article/specialOperations";
import { toast } from "sonner";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
}

const ArticleList = ({ articles, selectedKeyword, onKeywordClear, loading = false }: ArticleListProps) => {
  const [draggedItem, setDraggedItem] = useState<Article | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Set up initial state and auth check
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

  // If loading, show loader
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading articles...</span>
      </div>
    );
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Article) => {
    if (!isLoggedIn) return;
    
    setDraggedItem(item);
    setIsDragging(true);
    
    // Set the drag image (optional)
    const dragImage = new Image();
    dragImage.src = item.imageUrl;
    dragImage.style.opacity = '0.5';
    
    // Set relevant data for transfer
    e.dataTransfer.setData("text/plain", item.id);
    
    // Make drag effect look correct
    e.dataTransfer.effectAllowed = "move";
    
    // Store a reference to the dragged element
    const element = e.currentTarget;
    if (element) {
      // To create a proper drag image
      setTimeout(() => {
        element.classList.add("opacity-50", "scale-95");
      }, 0);
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    
    // Remove styling from the dragged element
    const element = e.currentTarget;
    if (element) {
      element.classList.remove("opacity-50", "scale-95");
    }
    
    // Save changes if there are any
    if (hasChanges) {
      saveChanges();
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop to reorder
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    // Create a copy of the articles array
    const updatedArticles = [...localArticles];
    
    // Find the indices
    const draggedIndex = updatedArticles.findIndex(item => item.id === draggedItem.id);
    const targetIndex = updatedArticles.findIndex(item => item.id === targetItem.id);
    
    if (draggedIndex < 0 || targetIndex < 0) return;
    
    // Remove the dragged item
    const [removed] = updatedArticles.splice(draggedIndex, 1);
    
    // Insert at the new position
    updatedArticles.splice(targetIndex, 0, removed);
    
    // Update display positions
    const articlesWithNewPositions = updatedArticles.map((article, index) => ({
      ...article,
      displayPosition: index + 1
    }));
    
    // Update state
    setLocalArticles(articlesWithNewPositions);
    setHasChanges(true);
    setDraggedItem(null);
  };

  // Save changes to the database
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
        // Reset to original order if save failed
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
      
      {isLoggedIn && (
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            You can drag and drop articles to rearrange them
          </p>
        </div>
      )}
      
      {localArticles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No articles found</h3>
          <p className="text-muted-foreground mt-2">Select a different month for the Issue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localArticles.map((article) => (
            <div
              key={article.id}
              draggable={isLoggedIn}
              onDragStart={(e) => handleDragStart(e, article)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, article)}
              className={`transition-all duration-200 ${
                isLoggedIn ? "cursor-grab active:cursor-grabbing" : ""
              } ${isDragging && draggedItem?.id === article.id ? "opacity-50" : "opacity-100"}`}
            >
              <div className={`relative ${isLoggedIn ? "hover:ring-2 hover:ring-primary/30 rounded-lg" : ""}`}>
                {isLoggedIn && (
                  <div className="absolute top-2 left-2 bg-background/90 rounded-full p-1 shadow-sm">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <ArticleCard article={article} />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-10">
          <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
            <p className="mb-2">You have unsaved changes to the article order</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {setLocalArticles(articles); setHasChanges(false);}}
                className="px-3 py-1 bg-primary-foreground/20 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={saveChanges}
                className="px-3 py-1 bg-primary-foreground/50 rounded font-medium"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
