
import React, { forwardRef, useState } from 'react';
import { Article } from "@/lib/types";
import ArticleCard from "@/components/ArticleCard";
import CommentDialog from "../comments/CommentDialog";

interface DraggableArticleProps {
  article: Article;
  isLoggedIn: boolean;
  isDragging: boolean;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: Article) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetItem: Article) => void;
  onCommentDialogClose?: () => void;
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
    onCommentDialogClose
  }, ref) => {
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    
    const handleCommentDialogOpen = () => {
      setIsCommentDialogOpen(true);
    };
    
    const handleCommentDialogClose = () => {
      setIsCommentDialogOpen(false);
      if (onCommentDialogClose) {
        onCommentDialogClose();
      }
    };
    
    const isDraggable = isLoggedIn;
    const isBeingDragged = isDragging && draggedItemId === article.id;
    
    return (
      <div
        ref={ref}
        draggable={isDraggable}
        onDragStart={(e) => isDraggable && onDragStart(e, article)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, article)}
        className={`transition-opacity ${isBeingDragged ? 'opacity-50' : 'opacity-100'}`}
        data-article-id={article.id}
      >
        <ArticleCard 
          article={article}
          onCommentClick={handleCommentDialogOpen}
        />
        
        <CommentDialog
          articleId={article.id}
          articleTitle={article.title}
          isOpen={isCommentDialogOpen}
          onClose={handleCommentDialogClose}
        />
      </div>
    );
  }
);

DraggableArticle.displayName = 'DraggableArticle';

export default DraggableArticle;
