
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useArticleReads = (articleId: string) => {
  const { user } = useAuth();
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setIsRead(data?.read ?? false);
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
            setIsRead(Boolean(payload.new.read));
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
      setIsRead(newReadState); // Optimistic update
      
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
        toast.error("Failed to update read status");
        throw error;
      } else {
        // Force a refresh of the read state from the server
        fetchReadState();
      }
    } catch (error) {
      console.error('Error updating read state:', error);
    }
  };

  return { isRead, loading, toggleReadState };
};
