
import React, { useState, useRef, useEffect } from "react";
import { Article } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { GripVertical } from "lucide-react";

interface ArticleArrangeListProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

const ArticleArrangeList = ({ articles, setArticles }: ArticleArrangeListProps) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SCROLL_SPEED = 10;
  const SCROLL_THRESHOLD = 150; // Threshold area to trigger auto-scroll
  
  // Setup and cleanup auto-scroll functionality
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, []);

  // Start auto-scroll if necessary
  const handleAutoScroll = (clientY: number) => {
    console.log("Auto-scroll handler called with clientY:", clientY);
    
    // Find the ScrollArea viewport using multiple selectors for better compatibility
    const scrollViewport = 
      document.querySelector('[data-radix-scroll-area-viewport]') || 
      document.querySelector('.scroll-area-viewport') ||
      document.getElementById('articles-scroll-area')?.querySelector('[data-radix-scroll-area-viewport]');
                          
    if (!scrollViewport) {
      console.error("Scroll viewport not found - tried multiple selectors");
      return;
    }
    
    const containerRect = scrollViewport.getBoundingClientRect();
    const topThreshold = containerRect.top + SCROLL_THRESHOLD;
    const bottomThreshold = containerRect.bottom - SCROLL_THRESHOLD;
    
    // Debug logs to help see what's happening
    console.log("Client Y:", clientY);
    console.log("Container top:", containerRect.top, "bottom:", containerRect.bottom);
    console.log("Thresholds - top:", topThreshold, "bottom:", bottomThreshold);
    
    // Clear any existing auto-scroll interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    // Start new auto-scroll interval if needed
    if (clientY < topThreshold) {
      // Scroll up
      console.log("Auto-scrolling UP triggered");
      autoScrollIntervalRef.current = setInterval(() => {
        scrollViewport.scrollBy({
          top: -SCROLL_SPEED,
          behavior: 'auto'
        });
      }, 16);
    } else if (clientY > bottomThreshold) {
      // Scroll down
      console.log("Auto-scrolling DOWN triggered");
      autoScrollIntervalRef.current = setInterval(() => {
        scrollViewport.scrollBy({
          top: SCROLL_SPEED,
          behavior: 'auto'
        });
      }, 16);
    }
  };
  
  // Handle drag start
  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedItemIndex(index);
    
    // Set the drag image
    if (e.dataTransfer.setDragImage) {
      const element = e.currentTarget as HTMLElement;
      e.dataTransfer.setDragImage(element, 20, 20);
    }
    
    // Add data to the drag operation
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over another item
  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
    setDragOverItemIndex(index);
    
    // Trigger auto-scroll based on mouse position
    handleAutoScroll(e.clientY);
  };

  // Handle drop of an item
  const handleDrop = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    
    // Stop auto-scrolling when item is dropped
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const newArticles = [...articles];
    const draggedItem = newArticles[draggedItemIndex];
    
    // Remove the dragged item
    newArticles.splice(draggedItemIndex, 1);
    
    // Insert at the target position
    newArticles.splice(targetIndex, 0, draggedItem);
    
    // Update the state
    setArticles(newArticles);
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
    
    // Log for debugging
    console.log("Articles rearranged:", newArticles.map((article, idx) => ({
      id: article.id,
      title: article.title,
      position: idx + 1
    })));
  };

  // Handle drag end (cleanup)
  const handleDragEnd = () => {
    // Stop auto-scrolling when drag ends
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverItemIndex(null);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {articles.map((article, index) => (
        <Card 
          key={article.id} 
          className={`flex items-center border transition-colors ${
            draggedItemIndex === index 
              ? 'border-primary bg-primary/5' 
              : dragOverItemIndex === index
                ? 'border-primary/70 bg-primary/10'
                : 'border-gray-200'
          }`}
          draggable
          onDragStart={(e) => handleDragStart(index, e)}
          onDragOver={(e) => handleDragOver(index, e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(index, e)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex justify-center items-center p-4 cursor-grab">
            <GripVertical 
              size={24} 
              className="text-muted-foreground hover:text-primary transition-colors"
            />
          </div>
          <div className="flex flex-1 items-center p-2">
            <CardHeader className="p-0 w-32 flex-shrink-0 mr-4">
              <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </AspectRatio>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="flex items-center">
                <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium mr-2">
                  {index + 1}
                </span>
                <h3 className="font-semibold line-clamp-2">{article.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{article.author}</p>
            </CardContent>
          </div>
        </Card>
      ))}
      
      {articles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No articles to arrange
        </div>
      )}
    </div>
  );
};

export default ArticleArrangeList;
