import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SPECIAL_USERS, SPECIAL_USER_IDS } from '@/lib/specialUsers';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns letters (A/M/D) for special users who have opened a given article,
 * but ONLY when the current viewer is the article's author AND the author is
 * one of the three special users. The author never sees their own letter.
 */
export function useArticleOpens(articleId: string, authorId?: string) {
  const [openerLetters, setOpenerLetters] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Only show letters when the current viewer is the article's author
    // AND the author is one of the three special users.
    if (
      !user ||
      !authorId ||
      user.id !== authorId ||
      !SPECIAL_USER_IDS.includes(authorId)
    ) {
      setOpenerLetters([]);
      return;
    }

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
  }, [articleId, user?.id, authorId]);

  return openerLetters;
}
