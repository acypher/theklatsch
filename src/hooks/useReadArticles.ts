
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { READ_STATE_CHANGED_EVENT } from '@/hooks/useArticleReads';

// Local storage key for read filter preference
const FILTER_READ_STORAGE_KEY = 'klatsch-filter-read-articles';

export const useReadArticles = (isAuthenticated: boolean, authLoading: boolean = false) => {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  const [filterEnabled, setFilterEnabled] = useState<boolean>(() => {
    // Initialize from localStorage on component mount
    const stored = localStorage.getItem(FILTER_READ_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });
  
  // Persist filter preference whenever it changes
  useEffect(() => {
    localStorage.setItem(FILTER_READ_STORAGE_KEY, JSON.stringify(filterEnabled));
  }, [filterEnabled]);
  
  useEffect(() => {
    const fetchReadArticles = async () => {
      // Don't clear read articles while auth is still loading
      if (authLoading) return;
      
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
  }, [isAuthenticated, authLoading]);

  return { readArticles, filterEnabled, setFilterEnabled };
};

