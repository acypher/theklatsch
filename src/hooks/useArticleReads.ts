
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useArticleReads = (articleId: string) => {
  const { user } = useAuth();
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevReadState = useRef(false);

  const fetchReadState = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('article_reads')
        .select('read')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching read state:', error);
        setIsRead(false);
      } else {
        const readState = data?.read ?? false;
        // Only update state if it's different to prevent unnecessary renders
        if (readState !== prevReadState.current) {
          console.log(`Article ${articleId} read state from DB:`, readState);
          setIsRead(readState);
          prevReadState.current = readState;
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsRead(false);
    } finally {
      setLoading(false);
    }
  }, [user, articleId]);

  useEffect(() => {
    fetchReadState();

    // Only set up subscription if user exists
    if (!user) return;

    // Set up a subscription to listen for changes to this specific article read state
    const channel = supabase
      .channel(`article_read_${articleId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'article_reads',
        filter: `article_id=eq.${articleId}`,
      }, (payload) => {
        // Check if the payload has a new property and it has the required fields
        if (user && payload.new && typeof payload.new === 'object' && 'user_id' in payload.new && 'read' in payload.new) {
          if (payload.new.user_id === user.id) {
            const newReadState = Boolean(payload.new.read);
            // Only update state if it's different to prevent unnecessary renders
            if (newReadState !== prevReadState.current) {
              console.log(`Received real-time update for article ${articleId}:`, payload.new);
              setIsRead(newReadState);
              prevReadState.current = newReadState;
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReadState, articleId, user]);

  const toggleReadState = async () => {
    if (!user) {
      toast.error("You must be logged in to mark articles as read");
      return;
    }

    try {
      const newReadState = !isRead;
      console.log(`Toggling read state for article ${articleId} to:`, newReadState);
      
      // Only update local state if it's different from the current value
      if (newReadState !== prevReadState.current) {
        setIsRead(newReadState);
        prevReadState.current = newReadState;
      }
      
      const { error } = await supabase
        .from('article_reads')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          read: newReadState,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, article_id'
        });

      if (error) {
        // Revert optimistic update on error
        setIsRead(!newReadState);
        prevReadState.current = !newReadState;
        toast.error("Failed to update read status");
        console.error('Error updating read state:', error);
      }
    } catch (error) {
      console.error('Error updating read state:', error);
    }
  };

  return { isRead, loading, toggleReadState };
};
