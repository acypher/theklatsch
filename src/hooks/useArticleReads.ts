
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Create a global event system to notify subscribers when read status changes
export const articleReadEvents = {
  listeners: new Set<() => void>(),
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  },
  notify() {
    this.listeners.forEach(callback => callback());
  }
};

export const useArticleReads = (articleId: string) => {
  const { user } = useAuth();
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadState = async () => {
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
          .maybeSingle(); // Using maybeSingle instead of single to avoid errors

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
    };

    fetchReadState();
  }, [user, articleId]);

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
      }
      
      // Notify all subscribers that read status has changed
      articleReadEvents.notify();
      
    } catch (error) {
      console.error('Error updating read state:', error);
    }
  };

  return { isRead, loading, toggleReadState };
};
