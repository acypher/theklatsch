
import { useState } from 'react';
import { Article } from '@/lib/types';

interface UseDragAndDropProps<T> {
  items: T[];
  onReorder?: (items: T[]) => void;
}

export const useDragAndDrop = <T extends { id: string }>({ 
  items, 
  onReorder 
}: UseDragAndDropProps<T>) => {
  const [draggingItem, setDraggingItem] = useState<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<T[]>([]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: T) => {
    // Store the original order if this is the first drag
    if (!hasChanges) {
      setOriginalOrder([...items]);
    }
    
    setDraggingItem(item);
    setIsDragging(true);
    
    // Set the data to be transferred
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    
    // Set the drag image
    if (e.dataTransfer.setDragImage && e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
    
    // Add styling
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: T) => {
    e.preventDefault();
    
    if (!draggingItem || draggingItem.id === targetItem.id) {
      return;
    }
    
    const updatedItems = [...items];
    
    // Find the indices of the dragged item and the target item
    const draggedIndex = updatedItems.findIndex(item => item.id === draggingItem.id);
    const targetIndex = updatedItems.findIndex(item => item.id === targetItem.id);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }
    
    // Remove the dragged item from its original position
    const [removedItem] = updatedItems.splice(draggedIndex, 1);
    
    // Insert it at the target position
    updatedItems.splice(targetIndex, 0, removedItem);
    
    // Call the onReorder callback with updated items
    if (onReorder) {
      onReorder(updatedItems);
    }
    
    setHasChanges(true);
    setDraggingItem(null);
  };

  // Function to save changes to the server
  const saveChanges = async () => {
    // This function should be implemented by the consumer
    // to save the changes to the server
    setHasChanges(false);
  };

  // Function to cancel changes and restore the original order
  const handleCancelChanges = () => {
    if (originalOrder.length > 0 && onReorder) {
      onReorder([...originalOrder]);
    }
    setHasChanges(false);
  };

  return {
    draggingItem,
    isDragging,
    hasChanges,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    saveChanges,
    handleCancelChanges
  };
};
