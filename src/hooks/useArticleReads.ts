
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Create a custom event for read state changes
export const READ_STATE_CHANGED_EVENT = 'article-read-state-changed';

export const useArticleReads = (articleId: string) => {
  const { user } = useAuth();
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const fetchReadState = async () => {
      if (!user || !isMounted.current || initialFetchDone.current) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('article_reads')
          .select('read')
          .eq('user_id', user.id)
          .eq('article_id', articleId)
          .maybeSingle();

        if (isMounted.current && !error) {
          setIsRead(data?.read ?? false);
          initialFetchDone.current = true;
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchReadState();

    return () => {
      isMounted.current = false;
    };
  }, [user, articleId]);

  const toggleReadState = async () => {
    if (!user) {
      toast.error("You must be logged in to mark articles as read");
      return;
    }

    try {
      const newReadState = !isRead;
      setIsRead(newReadState); // Optimistic update

      console.log(`Toggling read state - articleId: ${articleId}, new state: ${newReadState}`);

      // Dispatch custom event to notify other components of the change
      window.dispatchEvent(
        new CustomEvent(READ_STATE_CHANGED_EVENT, {
          detail: { articleId, read: newReadState }
        })
      );

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
        setIsRead(!newReadState); // Revert optimistic update
        toast.error("Failed to update read status");
        
        // Dispatch event again with the reverted state
        window.dispatchEvent(
          new CustomEvent(READ_STATE_CHANGED_EVENT, {
            detail: { articleId, read: !newReadState }
          })
        );
        
        throw error;
      }

      console.log(`Successfully updated read state in database - articleId: ${articleId}, state: ${newReadState}`);
    } catch (error) {
      console.error('Error updating read state:', error);
    }
  };

  return { isRead, loading, toggleReadState };
};
