
import { Article } from "@/lib/types";
import { GripVertical } from "lucide-react";
import ArticleCard from "../ArticleCard";
import { forwardRef } from "react";

interface DraggableArticleProps {
  article: Article;
  index?: number;
  draggingItem: Article | null;
  getFirstImage: (imageUrls: string[]) => string;
  formatDate: (dateString: string) => string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  isLoggedIn?: boolean;
}

const DraggableArticle = forwardRef<HTMLDivElement, DraggableArticleProps>(({ 
  article,
  index,
  draggingItem,
  getFirstImage,
  formatDate,
  onDragStart,
  onDragEnd,
  onDragOver,
  isLoggedIn = true
}, ref) => {
  return (
    <div
      id={`article-${article.id}`}
      ref={ref}
      draggable={isLoggedIn}
      onDragStart={(e) => onDragStart(e, article)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={`transition-all duration-200 ${
        isLoggedIn ? "cursor-grab active:cursor-grabbing" : ""
      } ${draggingItem && draggingItem.id === article.id ? "opacity-50" : "opacity-100"}`}
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
