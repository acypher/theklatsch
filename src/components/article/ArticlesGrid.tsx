
import { useRef, useState } from "react";
import { Article } from "@/lib/types";
import DraggableArticle from "./DraggableArticle";
import TableOfContents from "../TableOfContents";
import CommentDialog from "../comments/CommentDialog";

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
  const [articlesWithUnreadComments, setArticlesWithUnreadComments] = useState<Set<string>>(new Set());
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [currentArticleTitle, setCurrentArticleTitle] = useState("");

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

  const handleUnreadCommentsUpdate = (articleId: string, hasUnread: boolean) => {
    setArticlesWithUnreadComments(prev => {
      const updated = new Set(prev);
      if (hasUnread) {
        updated.add(articleId);
      } else {
        updated.delete(articleId);
      }
      return updated;
    });
  };

  const handleCommentsViewed = (articleId: string) => {
    // Open the comments dialog when clicking on the article number
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setCurrentArticleId(articleId);
      setCurrentArticleTitle(article.title);
      setIsCommentDialogOpen(true);
      
      // Remove the unread highlight
      setArticlesWithUnreadComments(prev => {
        const updated = new Set(prev);
        updated.delete(articleId);
        return updated;
      });
    }
  };

  const handleCommentDialogClose = () => {
    setIsCommentDialogOpen(false);
    setCurrentArticleId(null);
  };

  const displayArticles = hideRead 
    ? articles.filter(article => !readArticles.has(article.id))
    : articles;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="h-full">
          <TableOfContents 
            articles={articles} 
            onArticleClick={scrollToArticle}
            readArticles={readArticles}
            hideRead={hideRead}
            articlesWithUnreadComments={articlesWithUnreadComments}
            onCommentsViewed={handleCommentsViewed}
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
            onUnreadCommentsUpdate={(hasUnread) => handleUnreadCommentsUpdate(article.id, hasUnread)}
            ref={(el) => {
              if (el) articleRefs.current.set(article.id, el);
            }}
          />
        ))}
      </div>
      
      {isCommentDialogOpen && currentArticleId && (
        <CommentDialog
          articleId={currentArticleId}
          articleTitle={currentArticleTitle}
          isOpen={isCommentDialogOpen}
          onClose={handleCommentDialogClose}
        />
      )}
    </>
  );
};

export default ArticlesGrid;
