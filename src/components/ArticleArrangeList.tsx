
import React, { useState } from "react";
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

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  // Handle drag over another item
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  // Handle drop of an item
  const handleDrop = (targetIndex: number) => {
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
  };

  // Handle drag end (cleanup)
  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <Card 
          key={article.id} 
          className={`flex items-center border ${
            draggedItemIndex === index ? 'border-primary bg-primary/5' : 'border-gray-200'
          }`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
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
