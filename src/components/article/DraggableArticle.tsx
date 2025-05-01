
import React, { forwardRef, useState } from "react";
import { Article } from "@/lib/types";
import ArticleCardHeader from "./ArticleCardHeader";
import ArticleCardMeta from "./ArticleCardMeta";
import ArticleCardFooter from "./ArticleCardFooter";
import { Card } from "@/components/ui/card";
import { useComments } from "../comments/useComments";
import CommentDialog from "../comments/CommentDialog";
import ReadCheckbox from "./ReadCheckbox";

interface DraggableArticleProps {
  article: Article;
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
  onUnreadCommentsUpdate?: (hasUnread: boolean) => void;
}

const DraggableArticle = forwardRef<HTMLDivElement, DraggableArticleProps>(
  ({ 
    article, 
    isLoggedIn,
    isDragging, 
    draggedItemId, 
    onDragStart, 
    onDragEnd, 
    onDragOver, 
    onDrop,
    onUnreadCommentsUpdate 
  }, ref) => {
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const { 
      comments, 
      isLoading, 
      fetchError, 
      hasUnreadComments 
    } = useComments(article.id, isCommentDialogOpen);

    // Notify parent component about unread comment status
    React.useEffect(() => {
      if (onUnreadCommentsUpdate) {
        onUnreadCommentsUpdate(hasUnreadComments);
      }
    }, [hasUnreadComments, onUnreadCommentsUpdate]);

    const handleCommentsClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsCommentDialogOpen(true);
    };

    const handleCommentDialogClose = () => {
      setIsCommentDialogOpen(false);
    };

    const isDraggedOver = draggedItemId && draggedItemId !== article.id;
    const isBeingDragged = draggedItemId === article.id;

    // Function to format date
    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Function to get image URL
    const getImageUrl = (url: string) => {
      if (url.includes('drive.google.com/file/d/')) {
        const fileIdMatch = url.match(/\/d\/([^/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }
      return url;
    };

    const isGif = article.imageUrl.toLowerCase().endsWith('.gif');

    return (
      <>
        <Card 
          ref={ref}
          className={`relative group h-full flex flex-col transition-all ${
            isDragging && isDraggedOver
              ? "border-primary border-dashed" 
              : isBeingDragged
                ? "opacity-50"
                : ""
          }`}
          draggable={isLoggedIn}
          onDragStart={(e) => onDragStart(e, article)}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, article)}
          data-article-id={article.id}
        >
          <ReadCheckbox articleId={article.id} />
          
          <ArticleCardHeader 
            articleId={article.id}
            imageUrl={article.imageUrl}
            title={article.title}
            isGif={isGif}
            getImageUrl={getImageUrl}
          />
          
          <ArticleCardMeta 
            author={article.author}
            createdAt={article.createdAt}
            sourceUrl={article.sourceUrl}
            isGif={isGif}
            formatDate={formatDate}
          />
          
          <div className="mt-auto p-4 pt-0">
            <ArticleCardFooter 
              keywords={article.keywords} 
              onCommentsClick={handleCommentsClick}
              isLoading={isLoading}
              hasError={!!fetchError}
              commentCount={comments.length}
              hasUnreadComments={hasUnreadComments}
            />
          </div>
        </Card>
        
        {isCommentDialogOpen && (
          <CommentDialog
            articleId={article.id}
            articleTitle={article.title}
            isOpen={isCommentDialogOpen}
            onClose={handleCommentDialogClose}
          />
        )}
      </>
    );
  }
);

DraggableArticle.displayName = "DraggableArticle";

export default DraggableArticle;
