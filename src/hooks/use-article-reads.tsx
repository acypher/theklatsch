
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useArticleReads = () => {
  const [readArticles, setReadArticles] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchReadStates = async () => {
      if (!isAuthenticated) {
        setReadArticles({});
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('article_reads')
          .select('article_id, read');
          
        if (error) throw error;
        
        const readStates = data.reduce((acc, { article_id, read }) => ({
          ...acc,
          [article_id]: read
        }), {});
        
        setReadArticles(readStates);
      } catch (error) {
        console.error('Error fetching read states:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReadStates();
  }, [isAuthenticated]);
  
  const toggleRead = async (articleId: string, isRead?: boolean) => {
    if (!isAuthenticated) return;
    
    try {
      // Use the passed value if provided, otherwise toggle the current state
      const newState = isRead !== undefined ? isRead : !readArticles[articleId];
      
      const { error } = await supabase
        .from('article_reads')
        .upsert({ 
          article_id: articleId, 
          read: newState,
          user_id: (await supabase.auth.getUser()).data.user?.id 
        });
        
      if (error) throw error;
      
      // Update local state immediately for UI responsiveness
      setReadArticles(prev => ({
        ...prev,
        [articleId]: newState
      }));
      
      return newState; // Return the new state for consumers to use
    } catch (error) {
      console.error('Error toggling read state:', error);
      return null;
    }
  };
  
  return { readArticles, toggleRead, loading };
};
