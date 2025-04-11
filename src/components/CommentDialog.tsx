
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MarkdownEditor from "./article/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquare, AlertCircle, LogIn, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email?: string;
  created_at: string;
  article_id: string;
}

interface CommentDialogProps {
  articleId: string;
  articleTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentDialog = ({ articleId, articleTitle, isOpen, onClose }: CommentDialogProps) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("Anonymous");
  const [authorEmail, setAuthorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (!user) return "Anonymous";
    
    if (profile?.display_name) {
      const nameParts = profile.display_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    
    if (user.email) {
      const emailParts = user.email.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
      }
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "Anonymous";
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      
      if (user) {
        if (profile?.display_name) {
          setAuthorName(profile.display_name);
        } else {
          setAuthorName(getUserInitials());
        }
        
        // Set email if available from user object
        if (user.email) {
          setAuthorEmail(user.email);
        }
      }
    }
  }, [isOpen, articleId, user, profile]);

  const fetchComments = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Add a timeout to help catch network issues early
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const fetchPromise = supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });
        
      // Race between fetch and timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => { throw new Error('Request timed out'); })
      ]) as any;

      if (error) {
        throw error;
      }

      setComments(data as Comment[] || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setFetchError(error?.message || "Failed to load comments. Please try again later.");
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("You must be logged in to post a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add a timeout to help catch network issues early
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const insertPromise = supabase.from("comments").insert({
        article_id: articleId,
        content: newComment.trim(),
        author_name: authorName.trim() || "Anonymous",
        author_email: authorEmail.trim() || null,
      });
      
      // Race between insert and timeout
      const { error } = await Promise.race([
        insertPromise,
        timeoutPromise.then(() => { throw new Error('Request timed out'); })
      ]) as any;

      if (error) {
        throw error;
      }

      setNewComment("");
      toast.success("Comment added successfully");
      fetchComments();
      setShowCommentForm(false); // Collapse the form after successful submission
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(`Failed to add comment: ${error?.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleRetry = () => {
    fetchComments();
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Comments for "{articleTitle}"</DialogTitle>
        </DialogHeader>
        
        {user ? (
          <div className="mt-2 mb-2">
            {showCommentForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <MarkdownEditor
                    value={newComment}
                    onChange={(val) => setNewComment(val || "")}
                    height={150}
                    placeholder="Write a comment..."
                    showPreview={false}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  
                  <input
                    type="email"
                    placeholder="Email address"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCommentForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
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
          <div className="mt-2 mb-2 space-y-4">
            <Alert>
              <AlertDescription>
                You need to be signed in to post a comment.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleLoginRedirect}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              Sign In to Comment
            </Button>
          </div>
        )}
        
        <div className="flex-grow overflow-y-auto mt-1 pr-2 border-t pt-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : fetchError ? (
            <div className="py-4">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleRetry}
              >
                Retry
              </Button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3 bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{comment.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
