
import React, { forwardRef, ForwardedRef } from "react";
import { Card } from "@/components/ui/card";
import { Article } from "@/lib/types";
import ArticleCard from "../ArticleCard";

interface DraggableArticleProps {
  article: Article;
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
}

const DraggableArticle = forwardRef<HTMLDivElement, DraggableArticleProps>(
  (
    { article, isLoggedIn, isDragging, draggedItemId, onDragStart, onDragEnd, onDragOver, onDrop }, 
    ref
  ) => {
    return (
      <div
        ref={ref}
        id={`article-${article.id}`}
        className={`transition-transform ${
          isDragging && draggedItemId === article.id ? "z-10" : ""
        }`}
        draggable={isLoggedIn}
        onDragStart={(e) => onDragStart(e, article)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, article)}
        data-article-id={article.id}
      >
        <Card className="h-full hover:shadow-md transition-shadow">
          <ArticleCard article={article} />
        </Card>
      </div>
    );
  }
);

// Add display name for React DevTools
DraggableArticle.displayName = "DraggableArticle";

export default DraggableArticle;
