
import { useRef } from "react";
import { Article } from "@/lib/types";
import TableOfContents from "../TableOfContents";
import DraggableArticle from "./DraggableArticle";

interface ArticlesGridProps {
  articles: Article[];
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onArticleClick: (articleId: string) => void;
  readArticles: Set<string>;
  hideRead: boolean;
}

const ArticlesGrid = ({
  articles,
  isLoggedIn,
  isDragging,
  draggedItemId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onArticleClick,
  readArticles,
  hideRead
}: ArticlesGridProps) => {
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div className="h-full">
        <TableOfContents 
          articles={articles} 
          onArticleClick={onArticleClick}
          readArticles={readArticles}
          hideRead={hideRead}
        />
      </div>
      
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
          ref={(el) => {
            if (el) {
              articleRefs.current.set(article.id, el);
              console.log(`Set ref for article ${article.id}`);
            }
            else articleRefs.current.delete(article.id);
          }}
        />
      ))}
    </div>
  );
};

export default ArticlesGrid;
