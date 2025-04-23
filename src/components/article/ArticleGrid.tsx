
import { Article } from "@/lib/types";
import DraggableArticle from "./DraggableArticle";
import { useRef } from "react";

interface ArticleGridProps {
  articles: Article[];
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
  onArticleRef: (id: string, el: HTMLDivElement | null) => void;
}

const ArticleGrid = ({ 
  articles,
  isLoggedIn,
  isDragging,
  draggedItemId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onArticleRef
}: ArticleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article) => (
        <DraggableArticle
          key={article.id}
          article={article}
          isLoggedIn={isLoggedIn}
          isDragging={isDragging}
          draggedItemId={draggedItemId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          ref={(el) => onArticleRef(article.id, el)}
        />
      ))}
    </div>
  );
};

export default ArticleGrid;
