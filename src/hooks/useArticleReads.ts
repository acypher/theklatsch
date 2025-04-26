
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useArticleReads = (articleId: string) => {
  const { user } = useAuth();
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevReadState = useRef(false);
  const isMounted = useRef(true);

  const fetchReadState = useCallback(async () => {
    if (!user || !isMounted.current) {
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
        if (isMounted.current) setIsRead(false);
      } else {
        const readState = data?.read ?? false;
        // Only update state if it's different and component is mounted
        if (readState !== prevReadState.current && isMounted.current) {
          prevReadState.current = readState;
          setIsRead(readState);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      if (isMounted.current) setIsRead(false);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [user, articleId]);

  useEffect(() => {
    isMounted.current = true;
    
    fetchReadState();

    // Clean up function
    return () => {
      isMounted.current = false;
    };
  }, [fetchReadState]);

  useEffect(() => {
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
        if (!isMounted.current) return;
        
        if (user && payload.new && typeof payload.new === 'object' && 'user_id' in payload.new && 'read' in payload.new) {
          if (payload.new.user_id === user.id) {
            const newReadState = Boolean(payload.new.read);
            // Only update state if it's different to prevent unnecessary renders
            if (newReadState !== prevReadState.current) {
              prevReadState.current = newReadState;
              setIsRead(newReadState);
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId, user]);

  const toggleReadState = async () => {
    if (!user) {
      toast.error("You must be logged in to mark articles as read");
      return;
    }

    try {
      const newReadState = !isRead;
      
      // Only update local state if it's different from the current value
      if (newReadState !== prevReadState.current) {
        prevReadState.current = newReadState;
        setIsRead(newReadState);
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
        prevReadState.current = !newReadState;
        setIsRead(!newReadState);
        toast.error("Failed to update read status");
        console.error('Error updating read state:', error);
      }
    } catch (error) {
      console.error('Error updating read state:', error);
    }
  };

  return { isRead, loading, toggleReadState };
};
