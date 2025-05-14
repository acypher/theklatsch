
import { useRef } from "react";
import { Article } from "@/lib/types";
import DraggableArticle from "./DraggableArticle";
import TableOfContents from "../TableOfContents";
import { useArticleCommentCounts } from "@/hooks/useArticleCommentCounts";

interface ArticlesGridProps {
  articles: Article[];
  allArticles: Article[]; // Complete list of articles for reference
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  readArticles: Set<string>;
  hideRead: boolean;
  filterEnabled: boolean;
  onFilterToggle: (checked: boolean) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
}

const ArticlesGrid = ({ 
  articles,
  allArticles,
  isLoggedIn,
  isDragging,
  draggedItemId,
  readArticles,
  hideRead,
  filterEnabled,
  onFilterToggle,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: ArticlesGridProps) => {
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToArticle = (articleId: string) => {
    const articleElement = articleRefs.current.get(articleId);
    
    if (articleElement) {
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const extraPadding = 20;
      const yOffset = -(navbarHeight + extraPadding);
      
      const y = articleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const displayArticles = hideRead 
    ? articles.filter(article => !readArticles.has(article.id))
    : articles;

  // Gather all article IDs for comment count hook
  const allArticleIds = articles.map(a => a.id);
  const { counts: commentCounts } = useArticleCommentCounts(allArticleIds);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div className="h-full">
        <TableOfContents 
          articles={displayArticles}
          allArticles={allArticles} // Always pass the complete list for correct numbering
          onArticleClick={scrollToArticle}
          readArticles={readArticles}
          hideRead={hideRead}
          commentCounts={commentCounts}
          filterEnabled={filterEnabled}
          onFilterToggle={onFilterToggle}
        />
      </div>
      
      {displayArticles.map((article) => (
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
            if (el) articleRefs.current.set(article.id, el);
          }}
        />
      ))}
    </div>
  );
};

export default ArticlesGrid;
