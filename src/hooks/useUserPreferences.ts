import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserPreferences {
  hide_read_articles: boolean;
  auto_mark_read: boolean;
  show_list_articles: boolean;
}

export const useUserPreferences = () => {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    hide_read_articles: false,
    auto_mark_read: false,
    show_list_articles: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('hide_read_articles, auto_mark_read, show_list_articles')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user preferences:', error);
          toast.error('Failed to load preferences');
        } else if (data) {
          setPreferences(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [isAuthenticated, user]);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to update preferences');
      return false;
    }

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating preferences:', error);
        throw new Error('Failed to update preferences');
      }

      setPreferences(updatedPreferences);
      return true;
    } catch (error) {
      console.error('Unexpected error updating preferences:', error);
      toast.error('Failed to update preferences');
      return false;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
  };
};