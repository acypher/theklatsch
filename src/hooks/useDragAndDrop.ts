
import { useState } from "react";
import { Article } from "@/lib/types";

interface DragAndDropOptions {
  items: Article[];
  onReorder: (reorderedItems: Article[]) => void;
}

export const useDragAndDrop = ({ items, onReorder }: DragAndDropOptions) => {
  const [draggingItem, setDraggingItem] = useState<Article | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Article) => {
    setDraggingItem(item);
    e.dataTransfer.setData('text/plain', item.id);
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
  };

  return {
    draggingItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop
  };
};
