
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

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
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching read state:', error);
        }

        setIsRead(data?.read ?? false);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadState();
  }, [user, articleId]);

  const toggleReadState = async () => {
    if (!user) return;

    try {
      const newReadState = !isRead;
      const { error } = await supabase
        .from('article_reads')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          read: newReadState
        }, {
          onConflict: 'user_id, article_id'
        });

      if (error) {
        throw error;
      }

      setIsRead(newReadState);
    } catch (error) {
      console.error('Error updating read state:', error);
    }
  };

  return { isRead, loading, toggleReadState };
};
