import { forwardRef } from "react";
import { Article } from "@/lib/types";
import { GripVertical } from "lucide-react";
import ArticleCard from "../ArticleCard";

interface DraggableArticleProps {
  article: Article;
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  isRead?: boolean;
  onReadChange?: (articleId: string, isRead?: boolean) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
}

const DraggableArticle = forwardRef<HTMLDivElement, DraggableArticleProps>(({ 
  article,
  isLoggedIn,
  isDragging,
  draggedItemId,
  isRead,
  onReadChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
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
          <ReadCheckbox 
            articleId={article.id}
            initialState={isRead}
          />
        )}
        <ArticleCard 
          article={article}
          isRead={isRead}
          onReadChange={onReadChange}
        />
      </div>
    </div>
  );
});

DraggableArticle.displayName = "DraggableArticle";

export default DraggableArticle;
