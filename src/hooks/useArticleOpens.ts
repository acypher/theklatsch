import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SPECIAL_USERS, SPECIAL_USER_IDS } from '@/lib/specialUsers';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Fetches which special users (A/M/D) have opened a given article.
 * Returns letters for special users OTHER than the current user.
 */
export function useArticleOpens(articleId: string) {
  const [openerLetters, setOpenerLetters] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOpens = async () => {
      const { data, error } = await supabase
        .from('article_opens')
        .select('user_id')
        .eq('article_id', articleId)
        .in('user_id', SPECIAL_USER_IDS);

      if (error || !data) return;

      const letters = data
        .filter(row => row.user_id !== user?.id)
        .map(row => SPECIAL_USERS[row.user_id])
        .filter(Boolean)
        .sort();

      setOpenerLetters(letters);
    };

    fetchOpens();
  }, [articleId, user?.id]);

  return openerLetters;
}
