
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string | null;
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
  const [hasUnreadComments, setHasUnreadComments] = useState(false);
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

      const commentsData = data as Comment[] || [];
      setComments(commentsData);
      
      // Track comment views if user is authenticated
      if (user && commentsData && commentsData.length > 0) {
        const viewData = await trackCommentViews(commentsData);
        
        // Check if there are any unread comments
        if (viewData && viewData.unreadCount > 0) {
          setHasUnreadComments(true);
        } else {
          setHasUnreadComments(false);
        }
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
    if (!user) return null;
    
    try {
      let unreadCount = 0;
      const viewPromises = comments.map(async comment => {
        // First check if this comment has been viewed
        const { data: existingView } = await supabase
          .from("comment_views")
          .select("*")
          .eq("user_id", user.id)
          .eq("comment_id", comment.id)
          .maybeSingle();
          
        if (!existingView) {
          unreadCount++;
        }
        
        // Then update/insert the view
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
      return { unreadCount };
    } catch (error) {
      console.error("Error tracking comment views:", error);
      return null;
    }
  };
  
  // Update comment in the database
  const updateComment = async (commentId: string, newContent: string | null) => {
    if (!user) {
      toast.error("You must be logged in to update comments");
      return false;
    }

    try {
      console.log("Updating comment:", commentId, "with new content:", newContent);
      
      // First attempt the update
      const { data, error } = await supabase
        .from("comments")
        .update({ content: newContent })
        .eq("id", commentId)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Error updating comment:", error);
        toast.error("Failed to update comment: " + error.message);
        return false;
      }

      if (!data || data.length === 0) {
        toast.error("Comment not found or you don't have permission to update it");
        return false;
      }

      // Update was successful, update local state
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: newContent };
        }
        return comment;
      });
      
      setComments(updatedComments);
      toast.success("Comment updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error in updateComment:", error);
      toast.error("An unexpected error occurred: " + (error.message || "Unknown error"));
      return false;
    }
  };

  // Check for unread comments without opening the dialog
  const checkUnreadComments = async () => {
    if (!user) return;

    try {
      // Get all comments for this article
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("id")
        .eq("article_id", articleId);

      if (commentsError) throw commentsError;
      
      if (!commentsData || commentsData.length === 0) {
        setHasUnreadComments(false);
        return;
      }
      
      // Get all viewed comments for this article by the current user
      const { data: viewsData, error: viewsError } = await supabase
        .from("comment_views")
        .select("comment_id")
        .eq("user_id", user.id)
        .eq("article_id", articleId);
        
      if (viewsError) throw viewsError;
      
      // Create a set of viewed comment IDs
      const viewedCommentIds = new Set((viewsData || []).map(view => view.comment_id));
      
      // Check if there are any unread comments
      const unreadExists = commentsData.some(comment => !viewedCommentIds.has(comment.id));
      
      setHasUnreadComments(unreadExists);
    } catch (error) {
      console.error("Error checking for unread comments:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setHasUnreadComments(false); // Reset when dialog opens
    } else if (user) {
      checkUnreadComments(); // Check for unread comments when not opening the dialog
    }
  }, [isOpen, articleId, user]);

  return {
    comments,
    isLoading,
    fetchError,
    fetchComments,
    updateComment,
    hasUnreadComments
  };
};
