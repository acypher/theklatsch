
import { useState } from 'react';
import { Article } from '@/lib/types';
import { updateArticlesOrder } from '@/lib/data/article/specialOperations';
import { toast } from 'sonner';

export const useArticleDragAndDrop = (initialArticles: Article[], isLoggedIn: boolean) => {
  const [draggedItem, setDraggedItem] = useState<Article | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localArticles, setLocalArticles] = useState<Article[]>(initialArticles);
  const [hasChanges, setHasChanges] = useState(false);

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
        setLocalArticles(initialArticles);
      }
    } catch (error) {
      console.error("Error saving article order:", error);
      toast.error("Failed to update article order");
      setLocalArticles(initialArticles);
    } finally {
      setHasChanges(false);
    }
  };

  const handleCancelChanges = () => {
    setLocalArticles(initialArticles);
    setHasChanges(false);
  };

  return {
    draggedItem,
    isDragging,
    localArticles,
    hasChanges,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleCancelChanges,
    setLocalArticles
  };
};
