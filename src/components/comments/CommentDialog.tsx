
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import AuthPrompt from "./AuthPrompt";
import { useComments } from "./useComments";
import { useCommentView } from "@/contexts/CommentViewContext";

interface CommentDialogProps {
  articleId: string;
  articleTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentDialog = ({ articleId, articleTitle, isOpen, onClose }: CommentDialogProps) => {
  const { user } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const navigate = useNavigate();
  const { updateViewedCommentsForArticle, refreshCommentCounts } = useCommentView();
  
  const { 
    comments, 
    isLoading, 
    fetchError, 
    fetchComments,
    updateComment,
    trackCommentViews
  } = useComments(articleId, isOpen);

  // When dialog is opened, mark comments as viewed
  useEffect(() => {
    if (isOpen && user && comments.length > 0) {
      updateViewedCommentsForArticle(articleId);
    }
  }, [isOpen, comments.length, articleId, user]);

  const handleClose = async () => {
    // Track comment views when closing the dialog
    if (user && comments.length > 0) {
      await trackCommentViews(comments);
      
      // First update the comment view context
      updateViewedCommentsForArticle(articleId);
      
      // Then refresh the counts to ensure UI components using the hook get updated
      await refreshCommentCounts();
    }
    
    // Small delay to ensure all state updates are processed
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate("/auth");
  };

  const handleSubmitSuccess = () => {
    fetchComments();
    setShowCommentForm(false);
  };

  const handleUpdateComment = async (commentId: string, newContent: string) => {
    try {
      // Call the updateComment function from useComments which now updates the database
      await updateComment(commentId, newContent);
    } catch (error) {
      console.error("Failed to update comment:", error);
      // Error is already handled in the useComments hook with toast notifications
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Ensure the body is scrollable when the dialog closes
          document.body.style.overflow = '';
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col" onInteractOutside={(e) => {
        // Prevent clicks outside from locking scrolling
        e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl">Comments for "{articleTitle}"</DialogTitle>
        </DialogHeader>
        
        {user ? (
          <div className="mt-2 mb-2">
            {showCommentForm ? (
              <CommentForm 
                articleId={articleId}
                onSubmitSuccess={handleSubmitSuccess}
                onCancel={() => setShowCommentForm(false)}
              />
            ) : (
              <Button 
                onClick={() => setShowCommentForm(true)} 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add a comment
              </Button>
            )}
          </div>
        ) : (
          <AuthPrompt onLogin={handleLoginRedirect} />
        )}
        
        <div className="flex-grow overflow-y-auto mt-1 pr-2 border-t pt-3">
          <CommentList 
            comments={comments}
            isLoading={isLoading}
            fetchError={fetchError}
            onRetry={fetchComments}
            onUpdateComment={handleUpdateComment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
