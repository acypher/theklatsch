
import { useEffect, useState } from "react";
import { Article } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, ListOrdered, Save, ScrollText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateArticlesOrder } from "@/lib/data/article/specialOperations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TableOfContentsProps {
  articles: Article[];
}

const TableOfContents = ({ articles }: TableOfContentsProps) => {
  const [localArticles, setLocalArticles] = useState<Article[]>(articles);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
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
            // Reset unsaved changes flag as we received an update from the server
            setHasUnsavedChanges(false);
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
    
    // Create a ghost image to visually show what is being dragged
    if (e.target instanceof HTMLElement) {
      // Use the current element as the drag image 
      // Set no offset to position it at the cursor
      const rect = e.target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // Using the actual element for drag feedback
      e.dataTransfer.setDragImage(e.target, offsetX, offsetY);
    }
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isAuthenticated || !draggedItem || draggedItem === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
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
    
    // Update local display positions
    const articlePositionsForUi = updatedArticles.map((article, index) => ({
      ...article,
      displayPosition: index + 1 // Update display position for UI
    }));
    
    // Update local state immediately for visual feedback
    setLocalArticles(articlePositionsForUi);
    setHasUnsavedChanges(true);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const saveOrder = async () => {
    if (!hasUnsavedChanges) return;
    
    setSaving(true);
    
    try {
      // Prepare article positions for the server
      const articlePositions = localArticles.map((article, index) => ({
        id: article.id,
        position: index + 1
      }));
      
      // Send the update to the server
      const success = await updateArticlesOrder(articlePositions);
      
      if (success) {
        toast.success("Article order updated successfully");
        setHasUnsavedChanges(false);
      } else {
        toast.error("Failed to update article order");
      }
    } catch (error) {
      console.error("Error updating article order:", error);
      toast.error("Failed to update article order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">In This Issue</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <ScrollArea className="flex-grow pr-4 h-[300px]">
          <div className="space-y-2">
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
                    className={`
                      ${draggedItem === article.id ? 'opacity-50 bg-accent/20' : 'opacity-100'} 
                      ${dragOverItem === article.id ? 'bg-accent/50 rounded-md -mx-2 px-2 border-l-2 border-primary' : ''}
                      ${isAuthenticated ? 'cursor-move' : 'cursor-pointer'}
                      transition-colors duration-200 transform
                      p-2 rounded-md hover:bg-accent/30
                    `}
                  >
                    {index > 0 && <Separator className="mb-2" />}
                    <div className="flex items-start gap-2">
                      {isAuthenticated && (
                        <div className="flex-shrink-0 mt-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
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
        
        {isAuthenticated && hasUnsavedChanges && (
          <div className="mt-3 pt-3 border-t">
            <Button 
              onClick={saveOrder} 
              className="w-full flex items-center justify-center gap-2"
              disabled={saving}
              size="sm"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Order"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
