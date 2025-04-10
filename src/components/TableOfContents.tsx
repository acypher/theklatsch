
import { useEffect, useState } from "react";
import { Article } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, ListOrdered, ScrollText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateArticlesOrder } from "@/lib/data/article/specialOperations";
import { toast } from "sonner";

interface TableOfContentsProps {
  articles: Article[];
}

const TableOfContents = ({ articles }: TableOfContentsProps) => {
  const [localArticles, setLocalArticles] = useState<Article[]>(articles);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Update local state when articles prop changes
  useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  // Listen for real-time updates on articles table
  useEffect(() => {
    const channel = supabase
      .channel('article-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles'
        },
        (payload) => {
          console.log('Article change detected:', payload);
          
          // Process the change and update localArticles accordingly
          if (payload.eventType === 'UPDATE') {
            setLocalArticles(prevArticles => 
              prevArticles.map(article => 
                article.id === payload.new.id 
                  ? {...article, title: payload.new.title, displayPosition: payload.new.display_position}
                  : article
              ).sort((a, b) => (a.displayPosition || 999) - (b.displayPosition || 999))
            );
          }
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToArticle = (id: string) => {
    const articleElement = document.getElementById(`article-${id}`);
    if (articleElement) {
      // Add a small offset to account for any fixed headers
      const yOffset = -20;
      const y = articleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isAuthenticated) return;
    setDraggedItem(id);
    e.dataTransfer.setData('text/plain', id);
    // Make the drag image transparent
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isAuthenticated || !draggedItem || draggedItem === id) return;
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    if (!isAuthenticated || !draggedItem || draggedItem === targetId) return;
    e.preventDefault();
    
    // Find the source and target articles
    const sourceArticle = localArticles.find(article => article.id === draggedItem);
    const targetArticle = localArticles.find(article => article.id === targetId);
    
    if (!sourceArticle || !targetArticle) return;
    
    // Create a new array with the updated positions
    const updatedArticles = [...localArticles];
    
    // Sort the articles first to ensure consistent ordering
    updatedArticles.sort((a, b) => (a.displayPosition || 999) - (b.displayPosition || 999));
    
    // Find the indices of the source and target
    const sourceIndex = updatedArticles.findIndex(article => article.id === draggedItem);
    const targetIndex = updatedArticles.findIndex(article => article.id === targetId);
    
    // Remove the source article from the array
    const [removed] = updatedArticles.splice(sourceIndex, 1);
    
    // Insert it at the target position
    updatedArticles.splice(targetIndex, 0, removed);
    
    // Update the display positions
    const articlePositions = updatedArticles.map((article, index) => ({
      id: article.id,
      position: index + 1 // Start from 1
    }));
    
    // Optimistically update the local state
    setLocalArticles(updatedArticles.map((article, index) => ({
      ...article,
      displayPosition: index + 1
    })));
    
    // Send the update to the server
    try {
      const success = await updateArticlesOrder(articlePositions);
      if (success) {
        toast.success("Article order updated successfully");
      } else {
        toast.error("Failed to update article order");
        // Revert to original order if the update fails
        setLocalArticles(articles);
      }
    } catch (error) {
      console.error("Error updating article order:", error);
      toast.error("Failed to update article order");
      setLocalArticles(articles);
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">In This Issue</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {localArticles.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No articles in this issue</p>
            ) : (
              // Sort articles by display position before rendering
              [...localArticles]
                .sort((a, b) => (a.displayPosition || 999) - (b.displayPosition || 999))
                .map((article, index) => (
                  <div 
                    key={article.id}
                    draggable={isAuthenticated}
                    onDragStart={(e) => handleDragStart(e, article.id)}
                    onDragOver={(e) => handleDragOver(e, article.id)}
                    onDrop={(e) => handleDrop(e, article.id)}
                    onDragEnd={handleDragEnd}
                    className={`${draggedItem === article.id ? 'opacity-50' : 'opacity-100'} 
                               ${isAuthenticated ? 'cursor-move' : 'cursor-pointer'}
                               transition-opacity`}
                  >
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        {isAuthenticated ? (
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ListOrdered className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <button 
                        onClick={() => scrollToArticle(article.id)}
                        className="w-full text-left group"
                      >
                        <p className="text-sm group-hover:text-primary transition-colors">
                          {article.title}
                        </p>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
