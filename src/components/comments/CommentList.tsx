
import React, { useState } from "react";
import { Loader2, MessageSquare, AlertCircle, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import CommentEditForm from "./CommentEditForm";
import { toast } from "sonner";

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
  onEditComment: (commentId: string, content: string) => Promise<{ success: boolean; error?: string }>;
}

const CommentList = ({ 
  comments, 
  isLoading, 
  fetchError, 
  onRetry,
  onEditComment 
}: CommentListProps) => {
  const { user } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  
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

  const handleEditClick = (commentId: string) => {
    setEditingCommentId(commentId);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  const handleSaveEdit = async (commentId: string, content: string) => {
    const result = await onEditComment(commentId, content);
    if (result.success) {
      // Clear editing state when successful
      setEditingCommentId(null);
      toast.success("Comment updated successfully");
    } else if (result.error) {
      toast.error(result.error);
    }
    return result;
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
          <div className="flex justify-between items-start mb-2">
            <p className="font-medium">{comment.author_name}</p>
            <div className="flex items-center gap-2">
              {user && comment.user_id === user.id && editingCommentId !== comment.id && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditClick(comment.id)}
                  className="h-6 w-6 p-0"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit comment</span>
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </p>
            </div>
          </div>
          
          {editingCommentId === comment.id ? (
            <CommentEditForm
              commentId={comment.id}
              initialContent={comment.content}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comment.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
