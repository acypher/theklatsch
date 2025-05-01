
import React, { useState } from "react";
import { Loader2, MessageSquare, AlertCircle, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentEditForm from "./CommentEditForm";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email?: string;
  created_at: string;
  article_id: string;
  user_id?: string;
}

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  fetchError: string | null;
  onRetry: () => void;
  onUpdateComment?: (commentId: string, newContent: string) => Promise<void>;
}

const CommentList = ({ 
  comments: initialComments, 
  isLoading, 
  fetchError, 
  onRetry,
  onUpdateComment 
}: CommentListProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  
  // Update local comments state when props change
  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };
  
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };
  
  const handleUpdateComment = (commentId: string, newContent: string) => {
    // Update the local state immediately for UI feedback
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, content: newContent };
      }
      return comment;
    });
    
    setComments(updatedComments);
    setEditingCommentId(null);
    setEditingContent("");
    
    // Call the parent's handler if provided (for database updates)
    if (onUpdateComment) {
      onUpdateComment(commentId, newContent).catch(error => {
        console.error("Failed to update comment:", error);
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (fetchError) {
    return (
      <div className="py-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="mx-auto h-12 w-12 opacity-30 mb-2" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-3 bg-card">
          {editingCommentId === comment.id ? (
            <CommentEditForm 
              initialContent={editingContent}
              onCancel={handleCancelEdit}
              onUpdate={(newContent) => handleUpdateComment(comment.id, newContent)}
            />
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{comment.author_name}</p>
                <div className="flex items-center gap-2">
                  {user && user.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditClick(comment)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit comment</span>
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {comment.content}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
