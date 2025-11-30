import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useArticleFavorites = (articleId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allFavorites, setAllFavorites] = useState<Set<string>>(new Set());

  // Fetch single article favorite status
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!isAuthenticated || !user || !articleId) {
        setIsFavorite(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('article_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('article_id', articleId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching favorite status:', error);
        } else {
          setIsFavorite(!!data);
        }
      } catch (error) {
        console.error('Unexpected error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [isAuthenticated, user, articleId]);

  // Fetch all favorites for the user
  useEffect(() => {
    const fetchAllFavorites = async () => {
      if (!isAuthenticated || !user) {
        setAllFavorites(new Set());
        return;
      }

      try {
        const { data, error } = await supabase
          .from('article_favorites')
          .select('article_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching all favorites:', error);
        } else if (data) {
          setAllFavorites(new Set(data.map(fav => fav.article_id)));
        }
      } catch (error) {
        console.error('Unexpected error fetching all favorites:', error);
      }
    };

    fetchAllFavorites();
  }, [isAuthenticated, user]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || !user || !articleId) {
      toast.error('You must be logged in to favorite articles');
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('article_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        if (error) {
          console.error('Error removing favorite:', error);
          toast.error('Failed to remove from favorites');
        } else {
          setIsFavorite(false);
          setAllFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(articleId);
            return newSet;
          });
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('article_favorites')
          .insert({
            user_id: user.id,
            article_id: articleId
          });

        if (error) {
          console.error('Error adding favorite:', error);
          toast.error('Failed to add to favorites');
        } else {
          setIsFavorite(true);
          setAllFavorites(prev => new Set([...prev, articleId]));
        }
      }
    } catch (error) {
      console.error('Unexpected error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return {
    isFavorite,
    loading,
    toggleFavorite,
    allFavorites
  };
};
