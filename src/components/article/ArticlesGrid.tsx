import { useRef } from "react";
import { Article } from "@/lib/types";
import DraggableArticle from "./DraggableArticle";
import TableOfContents from "../TableOfContents";
import { useArticleCommentCounts } from "@/hooks/useArticleCommentCounts";
import { COMMENTS_UPDATED_EVENT } from "../comments/CommentDialog";
import { useEffect } from "react";

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
  currentIssue?: string;
  searchQuery?: string;
  onKeywordClick?: (keyword: string) => void;
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
  onDrop,
  currentIssue,
  searchQuery = "",
  onKeywordClick
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

  // Always use allArticles for ToC, but filter for display cards
  const displayArticles = hideRead 
    ? articles.filter(article => !readArticles.has(article.id))
    : articles;

  // Gather all article IDs for comment count hook - always use ALL articles
  // for calculating if there are any unread comments
  const allArticleIds = allArticles.map(a => a.id);
  const { counts: commentCounts, fetchCounts } = useArticleCommentCounts(allArticleIds);

  // Listen for comment updates to refresh the counts
  useEffect(() => {
    const handleCommentsUpdated = () => {
      fetchCounts();
    };

    // Add event listener for the custom event
    window.addEventListener(COMMENTS_UPDATED_EVENT as any, handleCommentsUpdated);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener(COMMENTS_UPDATED_EVENT as any, handleCommentsUpdated);
    };
  }, [fetchCounts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* ToC column - always visible */}
      <div className="h-full">
        <TableOfContents 
          articles={articles}
          allArticles={allArticles} // Always pass the complete list for correct numbering
          onArticleClick={scrollToArticle}
          readArticles={readArticles}
          hideRead={hideRead}
          commentCounts={commentCounts}
          filterEnabled={filterEnabled}
          onFilterToggle={onFilterToggle}
          currentIssue={currentIssue}
          searchQuery={searchQuery}
        />
      </div>

      {/* Article cards - only show if there are articles to display */}
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
          onKeywordClick={onKeywordClick}
          ref={(el) => {
            if (el) articleRefs.current.set(article.id, el);
          }}
        />
      ))}
    </div>
  );
};

export default ArticlesGrid;