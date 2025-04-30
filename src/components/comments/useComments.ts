
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

  // New function to edit a comment
  const editComment = async (commentId: string, newContent: string) => {
    if (!user) return { success: false, error: "You must be logged in to edit a comment" };
    
    try {
      const { data, error } = await supabase
        .from("comments")
        .update({ content: newContent })
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Update the comment in the local state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId ? { ...comment, content: newContent } : comment
          )
        );
        
        return { success: true };
      } else {
        // If no rows were updated, the user doesn't own the comment
        return { success: false, error: "You are not authorized to edit this comment" };
      }
    } catch (error: any) {
      console.error("Error editing comment:", error);
      return { success: false, error: error?.message || "Failed to edit comment" };
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
    editComment
  };
};
