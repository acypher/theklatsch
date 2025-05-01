import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

export const useComments = (articleId: string, isOpen: boolean) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { user } = useAuth();

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
      
      // Track comment views if user is authenticated
      if (user && data && data.length > 0) {
        await trackCommentViews(data);
      }
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setFetchError(error?.message || "Failed to load comments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Track which comments the user has viewed
  const trackCommentViews = async (comments: Comment[]) => {
    if (!user) return;
    
    try {
      const viewPromises = comments.map(comment => {
        return supabase
          .from("comment_views")
          .upsert({
            user_id: user.id,
            comment_id: comment.id,
            article_id: articleId,
            last_viewed_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) {
              console.error(`Error tracking view for comment ${comment.id}:`, error);
            }
          });
      });
      
      await Promise.all(viewPromises);
    } catch (error) {
      console.error("Error tracking comment views:", error);
    }
  };
  
  // Implement the update comment functionality to persist changes to the database
  const updateComment = async (commentId: string, newContent: string) => {
    try {
      // Verify the user is authenticated
      if (!user) {
        throw new Error("You must be logged in to update a comment");
      }
      
      // Update the comment in the database
      const { data, error } = await supabase
        .from("comments")
        .update({ content: newContent })
        .eq("id", commentId)
        .eq("user_id", user.id) // Ensure the user can only update their own comments
        .select();
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("Failed to update comment. You might not have permission.");
      }
      
      // Update the local comments state to reflect the change
      setComments(currentComments => 
        currentComments.map(comment => 
          comment.id === commentId ? { ...comment, content: newContent } : comment
        )
      );
      
      // Show success toast notification using sonner toast
      toast.success("Comment updated", {
        description: "Your comment was successfully updated"
      });
      
      return data[0];
    } catch (error: any) {
      console.error("Error updating comment:", error);
      // Show error toast notification
      toast.error("Update failed", {
        description: error.message || "Failed to update comment. Please try again."
      });
      throw error;
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, articleId, user]);

  return {
    comments,
    isLoading,
    fetchError,
    fetchComments,
    updateComment
  };
};
