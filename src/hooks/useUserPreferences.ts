
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserPreferences = () => {
  const [hideRead, setHideRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
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
  }, [user]);

  const updateHideRead = async (value: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          hide_read_articles: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setHideRead(value);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  return { hideRead, loading, updateHideRead };
};
