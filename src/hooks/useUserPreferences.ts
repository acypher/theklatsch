
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserPreferences = () => {
  const [hideRead, setHideRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!isAuthenticated || !user) {
        setHideRead(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('hide_read_articles')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        setHideRead(data?.hide_read_articles ?? false);
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, isAuthenticated]);

  const updateHideRead = async (value: boolean) => {
    if (updating) return; // Prevent multiple simultaneous updates
    
    // Store the previous value in case we need to revert
    const previousValue = hideRead;
    
    // Update local state immediately for better UX
    setHideRead(value);
    
    // If user is not authenticated, we can't save to database but we can still use local state
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          hide_read_articles: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Success toast is optional since the UI already updated
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert the state if the server update fails
      setHideRead(previousValue);
      toast.error('Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  return { hideRead, loading, updating, updateHideRead };
};
