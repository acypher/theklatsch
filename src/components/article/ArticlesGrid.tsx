
import { useRef, useState } from "react";
import { Article } from "@/lib/types";
import DraggableArticle from "./DraggableArticle";
import TableOfContents from "../TableOfContents";
import { useArticleCommentCounts } from "@/hooks/useArticleCommentCounts";
import CommentDialog from "../comments/CommentDialog"; // Import comment dialog

interface ArticlesGridProps {
  articles: Article[];
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  readArticles: Set<string>;
  hideRead: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
}

const ArticlesGrid = ({
  articles,
  isLoggedIn,
  isDragging,
  draggedItemId,
  readArticles,
  hideRead,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: ArticlesGridProps) => {
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [openCommentArticleId, setOpenCommentArticleId] = useState<string | null>(null);

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

  // Use a "refreshTrigger" state to force refetch when comments are viewed
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { counts: commentCounts } = useArticleCommentCounts(allArticleIds, refreshTrigger);

  // Handler when user closes comment dialog after viewing
  const handleCommentDialogClose = () => {
    setOpenCommentArticleId(null);
    // Trigger refresh of comment counts
    setRefreshTrigger(trigger => trigger + 1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div className="h-full">
        <TableOfContents
          articles={articles}
          onArticleClick={scrollToArticle}
          readArticles={readArticles}
          hideRead={hideRead}
          commentCounts={commentCounts}
          // Pass a callback to open the comment dialog from ToC, optionally
          onOpenComments={setOpenCommentArticleId}
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

      {/* Comment Dialog, one instance */}
      {openCommentArticleId && (
        <CommentDialog
          articleId={openCommentArticleId}
          articleTitle={
            articles.find(a => a.id === openCommentArticleId)?.title || ""
          }
          isOpen={!!openCommentArticleId}
          onClose={handleCommentDialogClose}
        />
      )}
    </div>
  );
};

export default ArticlesGrid;

