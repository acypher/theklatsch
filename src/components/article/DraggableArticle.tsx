
import { Article } from "@/lib/types";
import { GripVertical } from "lucide-react";
import ArticleCard from "../ArticleCard";
import { forwardRef } from "react";

interface DraggableArticleProps {
  article: Article;
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
  // Add these for ToC comments dialog highlight logic
  onCommentDialogOpen?: () => void;
  onCommentDialogClose?: () => void;
  isCommentDialogOpen?: boolean;
}

const DraggableArticle = forwardRef<HTMLDivElement, DraggableArticleProps>(({
  article,
  isLoggedIn,
  isDragging,
  draggedItemId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onCommentDialogOpen,       // Accept (not used for now)
  onCommentDialogClose,      // Accept (not used for now)
  isCommentDialogOpen        // Accept (not used for now)
}, ref) => {
  return (
    <div
      id={`article-${article.id}`}
      ref={ref}
      draggable={isLoggedIn}
      onDragStart={(e) => onDragStart(e, article)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, article)}
      className={`transition-all duration-200 ${
        isLoggedIn ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging && draggedItemId === article.id ? "opacity-50" : "opacity-100"}`}
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

