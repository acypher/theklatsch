
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ArticleUpdate {
  article_id: string;
  updated_at: string;
  updated_by: string | null;
}

export const useArticleUpdates = () => {
  const [articleUpdates, setArticleUpdates] = useState<ArticleUpdate[]>([]);
  const [userViews, setUserViews] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  // Fetch initial article updates
  useEffect(() => {
    const fetchArticleUpdates = async () => {
      const { data: updates } = await supabase
        .from('article_updates')
        .select('article_id, updated_at, updated_by');
      
      if (updates) {
        setArticleUpdates(updates);
      }
    };

    fetchArticleUpdates();
  }, []);

  // Fetch user's viewed updates
  useEffect(() => {
    const fetchUserViews = async () => {
      if (!isAuthenticated) return;
      
      const { data: views } = await supabase
        .from('article_update_views')
        .select('article_id');
      
      if (views) {
        setUserViews(new Set(views.map(v => v.article_id)));
      }
    };

    fetchUserViews();
  }, [isAuthenticated]);

  // Subscribe to real-time updates
  useEffect(() => {
    const updatesChannel = supabase
      .channel('article_updates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'article_updates'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newUpdate = payload.new as ArticleUpdate;
            setArticleUpdates(prev => {
              const filtered = prev.filter(u => u.article_id !== newUpdate.article_id);
              return [...filtered, newUpdate];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedUpdate = payload.new as ArticleUpdate;
            setArticleUpdates(prev => 
              prev.map(u => u.article_id === updatedUpdate.article_id ? updatedUpdate : u)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedUpdate = payload.old as ArticleUpdate;
            setArticleUpdates(prev => 
              prev.filter(u => u.article_id !== deletedUpdate.article_id)
            );
          }
        }
      )
      .subscribe();

    const viewsChannel = supabase
      .channel('article_update_views_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'article_update_views'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newView = payload.new as { article_id: string; user_id: string };
            // Only update if it's the current user's view
            const currentUser = supabase.auth.getUser();
            currentUser.then(({ data }) => {
              if (data.user && data.user.id === newView.user_id) {
                setUserViews(prev => new Set([...prev, newView.article_id]));
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(updatesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, []);

  const recordArticleUpdate = async (articleId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await supabase
        .from('article_updates')
        .upsert({
          article_id: articleId,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });
    } catch (error) {
      console.error('Error recording article update:', error);
    }
  };

  const markAsViewed = async (articleId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await supabase
        .from('article_update_views')
        .upsert({
          article_id: articleId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          viewed_at: new Date().toISOString()
        });
      
      setUserViews(prev => new Set([...prev, articleId]));
    } catch (error) {
      console.error('Error marking article as viewed:', error);
    }
  };

  const getUpdatedArticles = () => {
    if (!isAuthenticated) return {};
    
    const updatedArticles: {[key: string]: string} = {};
    
    articleUpdates.forEach(update => {
      if (!userViews.has(update.article_id)) {
        updatedArticles[update.article_id] = update.updated_at;
      }
    });
    
    return updatedArticles;
  };

  return {
    updatedArticles: getUpdatedArticles(),
    recordArticleUpdate,
    markAsViewed
  };
};
