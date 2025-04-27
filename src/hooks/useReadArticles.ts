
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { READ_STATE_CHANGED_EVENT } from '@/hooks/useArticleReads';

export const useReadArticles = (isAuthenticated: boolean) => {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchReadArticles = async () => {
      if (!isAuthenticated) {
        setReadArticles(new Set());
        return;
      }
      
      try {
        const { data } = await supabase
          .from('article_reads')
          .select('article_id')
          .eq('read', true);
        
        if (data) {
          setReadArticles(new Set(data.map(item => item.article_id)));
        }
      } catch (error) {
        console.error('Error fetching read articles:', error);
      }
    };
    
    fetchReadArticles();

    const handleReadStateChange = (e: CustomEvent) => {
      const { articleId, read } = e.detail;
      
      setReadArticles(prevReadArticles => {
        const updatedReadArticles = new Set(prevReadArticles);
        
        if (read) {
          updatedReadArticles.add(articleId);
        } else {
          updatedReadArticles.delete(articleId);
        }
        
        return updatedReadArticles;
      });
    };

    window.addEventListener(
      READ_STATE_CHANGED_EVENT, 
      handleReadStateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        READ_STATE_CHANGED_EVENT, 
        handleReadStateChange as EventListener
      );
    };
  }, [isAuthenticated]);

  return readArticles;
};
