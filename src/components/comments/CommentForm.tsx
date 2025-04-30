
import React, { useState } from "react";
import MarkdownEditor from "../article/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CommentFormProps {
  articleId: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

const CommentForm = ({ articleId, onSubmitSuccess, onCancel }: CommentFormProps) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState(profile?.display_name || "Anonymous");
  const [authorEmail, setAuthorEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Removed the check for empty comments to allow them
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
        content: newComment, // Allow empty content
        author_name: authorName.trim() || "Anonymous",
        author_email: authorEmail.trim() || null,
        user_id: user.id // Store the user ID to enable editing
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
      onSubmitSuccess();
      
      // Ensure the body is scrollable after dialog closes
      document.body.style.overflow = '';
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(`Failed to add comment: ${error?.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      
      <div className="flex gap-2">
        <div className="w-1/4">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>
        <div className="w-3/4">
          <input
            type="email"
            placeholder="Email address"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isSubmitting}
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
    </form>
  );
};

export default CommentForm;
