
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import AuthPrompt from "./AuthPrompt";
import { useComments } from "./useComments";

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
  
  const { 
    comments, 
    isLoading, 
    fetchError, 
    fetchComments 
  } = useComments(articleId, isOpen);

  const handleLoginRedirect = () => {
    onClose();
    navigate("/auth");
  };

  const handleSubmitSuccess = () => {
    fetchComments();
    setShowCommentForm(false);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Ensure the body is scrollable when the dialog closes
          document.body.style.overflow = '';
          onClose();
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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
