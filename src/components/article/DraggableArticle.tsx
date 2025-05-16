
import { Article } from "@/lib/types";
import { GripVertical } from "lucide-react";
import ArticleCard from "../ArticleCard";
import { forwardRef } from "react";

interface DraggableArticleProps {
  article: Article;
  isLoggedIn?: boolean;
  isDragging?: boolean;
  draggedItemId?: string | null;
  draggingItem?: Article | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
  getFirstImage?: (imageUrls: string[]) => string;
  formatDate?: (dateString: string) => string;
  index?: number;
}

const DraggableArticle = forwardRef<HTMLDivElement, DraggableArticleProps>(({ 
  article,
  isLoggedIn = true,
  isDragging = false,
  draggedItemId = null,
  draggingItem = null,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}, ref) => {
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDrop) {
      onDrop(e, article);
    }
  };
  
  const isBeingDragged = draggedItemId === article.id;

  return (
    <div
      id={`article-${article.id}`}
      ref={ref}
      draggable={isLoggedIn}
      onDragStart={(e) => onDragStart(e, article)}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`transition-all duration-200 ${
        isLoggedIn ? "cursor-grab active:cursor-grabbing" : ""
      } ${isBeingDragged ? "opacity-50" : "opacity-100"}`}
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
  );
});

DraggableArticle.displayName = 'DraggableArticle';

export default DraggableArticle;
