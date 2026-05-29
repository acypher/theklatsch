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

  // Fetch all favorites for the user.
  // Only the page-level caller (no articleId) needs the full list — per-card
  // callers must never re-fetch the entire favorites table (one full scan per
  // card previously dominated the home page's request burst).
  useEffect(() => {
    if (articleId) return;

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
  }, [isAuthenticated, user, articleId]);

  // Accepts an explicit target so the page-level instance (which holds the
  // shared `allFavorites` set) can toggle any card without per-card hooks.
  const toggleFavorite = async (targetId?: string) => {
    const id = targetId ?? articleId;

    if (!isAuthenticated || !user || !id) {
      toast.error('You must be logged in to favorite articles');
      return;
    }

    const currentlyFavorite = allFavorites.has(id) || (id === articleId && isFavorite);

    // Optimistic update
    setAllFavorites(prev => {
      const newSet = new Set(prev);
      if (currentlyFavorite) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    if (id === articleId) setIsFavorite(!currentlyFavorite);
    setLoading(true);

    try {
      const { error } = currentlyFavorite
        ? await supabase
            .from('article_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('article_id', id)
        : await supabase
            .from('article_favorites')
            .insert({ user_id: user.id, article_id: id });

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
      // Revert optimistic update
      setAllFavorites(prev => {
        const newSet = new Set(prev);
        if (currentlyFavorite) newSet.add(id);
        else newSet.delete(id);
        return newSet;
      });
      if (id === articleId) setIsFavorite(currentlyFavorite);
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
