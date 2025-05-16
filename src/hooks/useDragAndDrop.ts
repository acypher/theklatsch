
import { useState } from "react";
import { Article } from "@/lib/types";
import { updateSpecificArticle } from "@/lib/data/updateSpecificArticle";
import { toast } from "sonner";

interface DragAndDropOptions {
  items: Article[];
  onReorder: (reorderedItems: Article[]) => void;
}

export const useDragAndDrop = ({ items, onReorder }: DragAndDropOptions) => {
  const [draggingItem, setDraggingItem] = useState<Article | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<Article[]>([]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Article) => {
    setDraggingItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    // Store original order if this is the first change
    if (!hasChanges) {
      setOriginalOrder([...items]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggingItem(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => {
    e.preventDefault();
    
    if (!draggingItem || draggingItem.id === targetItem.id) {
      return;
    }
    
    const draggedItemIndex = items.findIndex(item => item.id === draggingItem.id);
    const targetItemIndex = items.findIndex(item => item.id === targetItem.id);
    
    if (draggedItemIndex === -1 || targetItemIndex === -1) {
      return;
    }
    
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(draggedItemIndex, 1);
    updatedItems.splice(targetItemIndex, 0, movedItem);
    
    onReorder(updatedItems);
    setHasChanges(true);
  };

  const handleCancelChanges = () => {
    if (originalOrder.length > 0) {
      onReorder(originalOrder);
    }
    setHasChanges(false);
    setOriginalOrder([]);
  };

  const saveChanges = async () => {
    // Save the new display positions to the database
    let success = true;
    
    for (let i = 0; i < items.length; i++) {
      const result = await updateSpecificArticle(items[i].id, {
        display_position: i
      });
      
      if (!result) {
        success = false;
        break;
      }
    }
    
    if (success) {
      toast.success("Article positions updated successfully");
      setHasChanges(false);
      setOriginalOrder([]);
    } else {
      toast.error("Failed to update article positions");
    }
  };

  return {
    draggingItem,
    isDragging: !!draggingItem,
    hasChanges,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleCancelChanges,
    saveChanges
  };
};
